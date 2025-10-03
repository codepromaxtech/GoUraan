import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Flight } from './entities/flight.entity';
import { Airline } from './entities/airline.entity';
import { Airport, AirportType } from './entities/airport.entity';
import { FlightSeat } from './entities/flight-seat.entity';

// Services
import { FlightService } from './services/flight.service';
import { AirlineService } from './services/airline.service';
import { AirportService } from './services/airport.service';

// Controllers
import { FlightController } from './controllers/flight.controller';
import { AirlineController } from './controllers/airline.controller';
import { AirportController } from './controllers/airport.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Flight,
      Airline,
      Airport,
      FlightSeat,
    ]),
  ],
  controllers: [
    FlightController,
    AirlineController,
    AirportController,
  ],
  providers: [
    FlightService,
    AirlineService,
    AirportService,
  ],
  exports: [
    FlightService,
    AirlineService,
    AirportService,
  ],
})
export class FlightsModule {}
