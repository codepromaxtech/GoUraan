import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, FindOptionsWhere, FindOperator, FindOptionsUtils, FindManyOptions } from 'typeorm';
import { Airport } from '../entities/airport.entity';
import { AirportType } from '../entities/airport.entity';
import { CreateAirportDto } from '../dto/create-airport.dto';
import { UpdateAirportDto } from '../dto/update-airport.dto';
import { PaginatedResult } from '../../../common/interfaces/paginated-result.interface';

type WhereCondition = FindOptionsWhere<Airport> & {
  isActive: boolean;
  type?: AirportType;
  country?: FindOperator<string> | string;
  name?: FindOperator<string> | string;
  city?: FindOperator<string> | string;
  iataCode?: FindOperator<string> | string;
  icaoCode?: FindOperator<string> | string;
  [key: string]: any; // For other dynamic properties
};

@Injectable()
export class AirportService {
  constructor(
    @InjectRepository(Airport)
    private readonly airportRepository: Repository<Airport>,
  ) {}

  async create(createAirportDto: CreateAirportDto): Promise<Airport> {
    // Check if airport with the same IATA code already exists
    if (createAirportDto.iataCode) {
      const existingAirport = await this.airportRepository.findOne({
        where: { iataCode: createAirportDto.iataCode },
      });
      if (existingAirport) {
        throw new BadRequestException(
          `Airport with IATA code ${createAirportDto.iataCode} already exists`,
        );
      }
    }

    // Check if airport with the same ICAO code already exists
    if (createAirportDto.icaoCode) {
      const existingAirport = await this.airportRepository.findOne({
        where: { icaoCode: createAirportDto.icaoCode },
      });
      if (existingAirport) {
        throw new BadRequestException(
          `Airport with ICAO code ${createAirportDto.icaoCode} already exists`,
        );
      }
    }

    const airport = this.airportRepository.create(createAirportDto);
    return this.airportRepository.save(airport);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    type?: AirportType,
    country?: string,
  ): Promise<PaginatedResult<Airport>> {
    const where: FindOptionsWhere<Airport> | FindOptionsWhere<Airport>[] = { isActive: true };

    if (search || type || country) {
      const baseCondition: FindOptionsWhere<Airport> = { isActive: true };
      
      if (type) {
        (baseCondition as any).type = type;
      }
      if (country) {
        (baseCondition as any).country = Like(`%${country}%`);
      }
      
      if (search) {
        const searchConditions: FindOptionsWhere<Airport>[] = [
          { ...baseCondition, name: Like(`%${search}%`) } as FindOptionsWhere<Airport>,
          { ...baseCondition, city: Like(`%${search}%`) } as FindOptionsWhere<Airport>,
          { ...baseCondition, iataCode: Like(`%${search}%`) } as FindOptionsWhere<Airport>,
        ];
        
        // Only add icaoCode condition if search is not empty
        if (search.trim().length > 0) {
          searchConditions.push({ ...baseCondition, icaoCode: Like(`%${search}%`) } as FindOptionsWhere<Airport>);
        }
        
        (where as FindOptionsWhere<Airport>[]) = searchConditions;
      } else {
        Object.assign(where, baseCondition);
      }
    }

    const [items, total] = await this.airportRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

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

  async findOne(id: string): Promise<Airport> {
    const airport = await this.airportRepository.findOne({
      where: { id, isActive: true },
    });

    if (!airport) {
      throw new NotFoundException(`Airport with ID ${id} not found`);
    }

    return airport;
  }

  async findByIataCode(iataCode: string): Promise<Airport> {
    const airport = await this.airportRepository.findOne({
      where: { iataCode, isActive: true },
    });

    if (!airport) {
      throw new NotFoundException(`Airport with IATA code ${iataCode} not found`);
    }

    return airport;
  }

  async findByIcaoCode(icaoCode: string): Promise<Airport> {
    const airport = await this.airportRepository.findOne({
      where: { icaoCode, isActive: true },
    });

    if (!airport) {
      throw new NotFoundException(`Airport with ICAO code ${icaoCode} not found`);
    }

    return airport;
  }

  async update(id: string, updateAirportDto: UpdateAirportDto): Promise<Airport> {
    const airport = await this.findOne(id);
    
    // Check if updating to an existing IATA code
    if (updateAirportDto.iataCode && updateAirportDto.iataCode !== airport.iataCode) {
      const existingAirport = await this.airportRepository.findOne({
        where: { iataCode: updateAirportDto.iataCode },
      });
      if (existingAirport) {
        throw new BadRequestException(
          `Airport with IATA code ${updateAirportDto.iataCode} already exists`,
        );
      }
    }

    // Check if updating to an existing ICAO code
    if (updateAirportDto.icaoCode && updateAirportDto.icaoCode !== airport.icaoCode) {
      const existingAirport = await this.airportRepository.findOne({
        where: { icaoCode: updateAirportDto.icaoCode },
      });
      if (existingAirport) {
        throw new BadRequestException(
          `Airport with ICAO code ${updateAirportDto.icaoCode} already exists`,
        );
      }
    }

    Object.assign(airport, updateAirportDto);
    return this.airportRepository.save(airport);
  }

  async remove(id: string): Promise<void> {
    const airport = await this.findOne(id);
    airport.isActive = false;
    await this.airportRepository.save(airport);
  }

  async searchAirports(query: string, limit = 10): Promise<Airport[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    const searchTerm = `%${query}%`;
    return this.airportRepository.find({
      where: [
        { name: Like(searchTerm), isActive: true },
        { city: Like(searchTerm), isActive: true },
        { iataCode: Like(searchTerm), isActive: true },
        { icaoCode: Like(searchTerm), isActive: true },
      ],
      order: { name: 'ASC' },
      take: limit,
    });
  }

  async findHubs(): Promise<Airport[]> {
    return this.airportRepository.find({
      where: { isHub: true, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findByIds(ids: string[]): Promise<Airport[]> {
    if (!ids || ids.length === 0) {
      return [];
    }
    return this.airportRepository.find({
      where: { id: In(ids), isActive: true } as FindOptionsWhere<Airport>,
    });
  }
}
