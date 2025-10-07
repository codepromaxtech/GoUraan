import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, In, MoreThanOrEqual, LessThanOrEqual, Not, IsNull } from 'typeorm';
import { Flight } from '../entities/flight.entity';
import { Airline } from '../entities/airline.entity';
import { Airport } from '../entities/airport.entity';
import { FlightSeat } from '../entities/flight-seat.entity';
import { CreateFlightDto } from '../dto/create-flight.dto';
import { UpdateFlightDto } from '../dto/update-flight.dto';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';
import { generateSeats } from '../utils/seat-generator';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
    @InjectRepository(Airport)
    private readonly airportRepository: Repository<Airport>,
    @InjectRepository(FlightSeat)
    private readonly flightSeatRepository: Repository<FlightSeat>,
  ) {}

  async create(createFlightDto: CreateFlightDto): Promise<Flight> {
    // Check if airline exists
    const airline = await this.airlineRepository.findOne({
      where: { id: createFlightDto.airlineId, isActive: true },
    });
    if (!airline) {
      throw new NotFoundException(`Airline with ID ${createFlightDto.airlineId} not found`);
    }

    // Check if departure airport exists
    const departureAirport = await this.airportRepository.findOne({
      where: { id: createFlightDto.departureAirportId, isActive: true },
    });
    if (!departureAirport) {
      throw new NotFoundException(`Departure airport with ID ${createFlightDto.departureAirportId} not found`);
    }

    // Check if arrival airport exists
    const arrivalAirport = await this.airportRepository.findOne({
      where: { id: createFlightDto.arrivalAirportId, isActive: true },
    });
    if (!arrivalAirport) {
      throw new NotFoundException(`Arrival airport with ID ${createFlightDto.arrivalAirportId} not found`);
    }

    // Check if departure time is in the future
    const departureTime = new Date(createFlightDto.departureTime);
    if (departureTime <= new Date()) {
      throw new BadRequestException('Departure time must be in the future');
    }

    // Check if arrival time is after departure time
    const arrivalTime = new Date(createFlightDto.arrivalTime);
    if (arrivalTime <= departureTime) {
      throw new BadRequestException('Arrival time must be after departure time');
    }

    // Create flight
    const flight = this.flightRepository.create({
      ...createFlightDto,
      airline,
      departureAirport,
      arrivalAirport,
      availableSeats: createFlightDto.availableSeats || createFlightDto.totalSeats,
    });

    const savedFlight = await this.flightRepository.save(flight);

    // Generate seats for the flight
    await this.generateFlightSeats(savedFlight);

    return this.findOne(savedFlight.id);
  }

  async findAll(searchParams: SearchFlightsDto): Promise<PaginatedResult<Flight>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'price_asc',
      from,
      to,
      departureDate,
      returnDate,
      adults = 1,
      children = 0,
      infants = 0,
      cabinClass = ['economy'],
      directOnly = false,
      maxStops = 2,
      maxDuration,
      minPrice,
      maxPrice,
      airlines,
    } = searchParams;

    const query = this.flightRepository
      .createQueryBuilder('flight')
      .leftJoinAndSelect('flight.airline', 'airline')
      .leftJoinAndSelect('flight.departureAirport', 'departureAirport')
      .leftJoinAndSelect('flight.arrivalAirport', 'arrivalAirport')
      .where('flight.isActive = :isActive', { isActive: true })
      .andWhere('flight.availableSeats >= :passengers', {
        passengers: Number(adults) + Number(children),
      });

    // Filter by departure and arrival locations
    if (from) {
      query.andWhere(
        '(departureAirport.iataCode ILIKE :from OR departureAirport.city ILIKE :from OR departureAirport.name ILIKE :from)',
        { from: `%${from}%` },
      );
    }

    if (to) {
      query.andWhere(
        '(arrivalAirport.iataCode ILIKE :to OR arrivalAirport.city ILIKE :to OR arrivalAirport.name ILIKE :to)',
        { to: `%${to}%` },
      );
    }

    // Filter by departure date
    if (departureDate) {
      const startDate = new Date(departureDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(departureDate);
      endDate.setHours(23, 59, 59, 999);
      
      query.andWhere('flight.departureTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    // Filter by cabin class
    if (cabinClass && cabinClass.length > 0) {
      query.andWhere('flight.cabinClass IN (:...cabinClass)', { cabinClass });
    }

    // Filter by price range
    if (minPrice !== undefined) {
      query.andWhere('flight.basePrice >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query.andWhere('flight.basePrice <= :maxPrice', { maxPrice });
    }

    // Filter by airlines
    if (airlines && airlines.length > 0) {
      query.andWhere('airline.id IN (:...airlines)', { airlines });
    }

    // Filter by max duration
    if (maxDuration) {
      query.andWhere(
        'EXTRACT(EPOCH FROM (flight.arrivalTime - flight.departureTime)) / 60 <= :maxDuration',
        { maxDuration },
      );
    }

    // Apply sorting
    switch (sortBy) {
      case 'price_asc':
        query.orderBy('flight.basePrice', 'ASC');
        break;
      case 'price_desc':
        query.orderBy('flight.basePrice', 'DESC');
        break;
      case 'departure_asc':
        query.orderBy('flight.departureTime', 'ASC');
        break;
      case 'departure_desc':
        query.orderBy('flight.departureTime', 'DESC');
        break;
      case 'duration_asc':
        query.orderBy('flight.arrivalTime - flight.departureTime', 'ASC');
        break;
      case 'duration_desc':
        query.orderBy('flight.arrivalTime - flight.departureTime', 'DESC');
        break;
      default:
        query.orderBy('flight.departureTime', 'ASC');
    }

    // Add pagination
    const skip = (page - 1) * limit;
    const [items, total] = await query.skip(skip).take(limit).getManyAndCount();

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Flight> {
    const flight = await this.flightRepository.findOne({
      where: { id, isActive: true },
      relations: ['airline', 'departureAirport', 'arrivalAirport', 'seats'],
    });

    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }

    return flight;
  }

  async update(id: string, updateFlightDto: UpdateFlightDto): Promise<Flight> {
    const flight = await this.findOne(id);

    // Check if updating airline and it exists
    if (updateFlightDto.airlineId) {
      const airline = await this.airlineRepository.findOne({
        where: { id: updateFlightDto.airlineId, isActive: true },
      });
      if (!airline) {
        throw new NotFoundException(`Airline with ID ${updateFlightDto.airlineId} not found`);
      }
      flight.airline = airline;
    }

    // Check if updating departure airport and it exists
    if (updateFlightDto.departureAirportId) {
      const departureAirport = await this.airportRepository.findOne({
        where: { id: updateFlightDto.departureAirportId, isActive: true },
      });
      if (!departureAirport) {
        throw new NotFoundException(`Departure airport with ID ${updateFlightDto.departureAirportId} not found`);
      }
      flight.departureAirport = departureAirport;
    }

    // Check if updating arrival airport and it exists
    if (updateFlightDto.arrivalAirportId) {
      const arrivalAirport = await this.airportRepository.findOne({
        where: { id: updateFlightDto.arrivalAirportId, isActive: true },
      });
      if (!arrivalAirport) {
        throw new NotFoundException(`Arrival airport with ID ${updateFlightDto.arrivalAirportId} not found`);
      }
      flight.arrivalAirport = arrivalAirport;
    }

    // Update other fields
    Object.assign(flight, updateFlightDto);

    // If total seats is updated, update available seats as well if not explicitly set
    if (updateFlightDto.totalSeats !== undefined && updateFlightDto.availableSeats === undefined) {
      const bookedSeats = flight.totalSeats - flight.availableSeats;
      const newAvailableSeats = Math.max(0, updateFlightDto.totalSeats - bookedSeats);
      flight.availableSeats = newAvailableSeats;
    }

    return this.flightRepository.save(flight);
  }

  async remove(id: string): Promise<void> {
    const flight = await this.findOne(id);
    flight.isActive = false;
    await this.flightRepository.save(flight);
  }

  async getAvailableSeats(flightId: string): Promise<FlightSeat[]> {
    const flight = await this.findOne(flightId);
    return this.flightSeatRepository.find({
      where: {
        flight: { id: flight.id },
        isAvailable: true,
        status: 'available',
      },
      order: {
        price: 'ASC',
      },
    });
  }

  async updateSeatStatus(
    flightId: string,
    seatId: string,
    status: 'available' | 'booked' | 'reserved' | 'blocked',
    userId?: string,
  ): Promise<FlightSeat> {
    const seat = await this.flightSeatRepository.findOne({
      where: {
        id: seatId,
        flight: { id: flightId },
      },
    });

    if (!seat) {
      throw new NotFoundException(`Seat with ID ${seatId} not found in flight ${flightId}`);
    }

    seat.status = status;
    seat.isAvailable = status === 'available';
    
    if (status === 'booked' || status === 'reserved') {
      seat.bookedById = userId || null;
      seat.bookedAt = new Date();
    } else if (status === 'available') {
      seat.bookedById = null;
      seat.bookedAt = null;
      seat.holdUntil = null;
    }

    return this.flightSeatRepository.save(seat);
  }

  private async generateFlightSeats(flight: Flight): Promise<void> {
    const seats = generateSeats(flight);
    await this.flightSeatRepository.save(seats);
  }
}
