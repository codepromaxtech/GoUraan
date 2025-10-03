import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Airline } from '../entities/airline.entity';
import { CreateAirlineDto } from '../dto/create-airline.dto';
import { UpdateAirlineDto } from '../dto/update-airline.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

@Injectable()
export class AirlineService {
  constructor(
    @InjectRepository(Airline)
    private readonly airlineRepository: Repository<Airline>,
  ) {}

  async create(createAirlineDto: CreateAirlineDto): Promise<Airline> {
    // Check if airline with the same IATA code already exists
    if (createAirlineDto.iataCode) {
      const existingAirline = await this.airlineRepository.findOne({
        where: { iataCode: createAirlineDto.iataCode },
      });
      if (existingAirline) {
        throw new BadRequestException(
          `Airline with IATA code ${createAirlineDto.iataCode} already exists`,
        );
      }
    }

    // Check if airline with the same ICAO code already exists
    if (createAirlineDto.icaoCode) {
      const existingAirline = await this.airlineRepository.findOne({
        where: { icaoCode: createAirlineDto.icaoCode },
      });
      if (existingAirline) {
        throw new BadRequestException(
          `Airline with ICAO code ${createAirlineDto.icaoCode} already exists`,
        );
      }
    }

    const airline = this.airlineRepository.create(createAirlineDto);
    return this.airlineRepository.save(airline);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PaginatedResult<Airline>> {
    const options: FindManyOptions<Airline> = {
      where: { isActive: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    };

    if (search) {
      options.where = [
        { name: Like(`%${search}%`), isActive: true },
        { iataCode: Like(`%${search}%`), isActive: true },
        { icaoCode: Like(`%${search}%`), isActive: true },
        { country: Like(`%${search}%`), isActive: true },
      ];
    }

    const [items, total] = await this.airlineRepository.findAndCount(options);
    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findOne(id: string): Promise<Airline> {
    const airline = await this.airlineRepository.findOne({
      where: { id, isActive: true },
    });

    if (!airline) {
      throw new NotFoundException(`Airline with ID ${id} not found`);
    }

    return airline;
  }

  async update(id: string, updateAirlineDto: UpdateAirlineDto): Promise<Airline> {
    const airline = await this.findOne(id);
    
    // Check if updating to an existing IATA code
    if (updateAirlineDto.iataCode && updateAirlineDto.iataCode !== airline.iataCode) {
      const existingAirline = await this.airlineRepository.findOne({
        where: { iataCode: updateAirlineDto.iataCode },
      });
      if (existingAirline) {
        throw new BadRequestException(
          `Airline with IATA code ${updateAirlineDto.iataCode} already exists`,
        );
      }
    }

    // Check if updating to an existing ICAO code
    if (updateAirlineDto.icaoCode && updateAirlineDto.icaoCode !== airline.icaoCode) {
      const existingAirline = await this.airlineRepository.findOne({
        where: { icaoCode: updateAirlineDto.icaoCode },
      });
      if (existingAirline) {
        throw new BadRequestException(
          `Airline with ICAO code ${updateAirlineDto.icaoCode} already exists`,
        );
      }
    }

    Object.assign(airline, updateAirlineDto);
    return this.airlineRepository.save(airline);
  }

  async remove(id: string): Promise<void> {
    const airline = await this.findOne(id);
    airline.isActive = false;
    await this.airlineRepository.save(airline);
  }

  async searchAirlines(query: string): Promise<Airline[]> {
    return this.airlineRepository
      .createQueryBuilder('airline')
      .where('airline.isActive = :isActive', { isActive: true })
      .andWhere(
        '(airline.name ILIKE :query OR airline.iataCode ILIKE :query OR airline.icaoCode ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('airline.name', 'ASC')
      .limit(20)
      .getMany();
  }

  async findByIds(ids: string[]): Promise<Airline[]> {
    return this.airlineRepository.findByIds(ids, {
      where: { isActive: true },
    });
  }
}
