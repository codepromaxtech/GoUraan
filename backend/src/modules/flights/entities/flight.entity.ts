import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Airline } from './airline.entity';
import { Airport } from './airport.entity';
import { FlightSeat } from './flight-seat.entity';

export enum FlightStatus {
  SCHEDULED = 'scheduled',
  ON_TIME = 'on_time',
  DELAYED = 'delayed',
  DEPARTED = 'departed',
  ARRIVED = 'arrived',
  CANCELLED = 'cancelled',
}

export enum CabinClass {
  ECONOMY = 'economy',
  PREMIUM_ECONOMY = 'premium_economy',
  BUSINESS = 'business',
  FIRST = 'first',
}

@Entity('flights')
export class Flight {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10 })
  flightNumber: string;

  @ManyToOne(() => Airline, (airline) => airline.flights)
  @JoinColumn({ name: 'airlineId' })
  airline: Airline;

  @Column({ type: 'uuid' })
  airlineId: string;

  @ManyToOne(() => Airport, (airport) => airport.departureFlights)
  @JoinColumn({ name: 'departureAirportId' })
  departureAirport: Airport;

  @Column({ type: 'uuid' })
  departureAirportId: string;

  @ManyToOne(() => Airport, (airport) => airport.arrivalFlights)
  @JoinColumn({ name: 'arrivalAirportId' })
  arrivalAirport: Airport;

  @Column({ type: 'uuid' })
  arrivalAirportId: string;

  @Column({ type: 'timestamp with time zone' })
  departureTime: Date;

  @Column({ type: 'timestamp with time zone' })
  arrivalTime: Date;

  @Column({ type: 'enum', enum: CabinClass, default: CabinClass.ECONOMY })
  cabinClass: CabinClass;

  @Column({ type: 'integer' })
  totalSeats: number;

  @Column({ type: 'integer' })
  availableSeats: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ type: 'varchar', length: 50, default: FlightStatus.SCHEDULED })
  status: FlightStatus;

  @OneToMany(() => FlightSeat, (seat) => seat.flight)
  seats: FlightSeat[];

  @Column({ type: 'jsonb', nullable: true })
  amenities: string[];

  @Column({ type: 'jsonb', nullable: true })
  baggageAllowance: {
    cabin: number;
    checkIn: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
