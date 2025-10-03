import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Flight } from './flight.entity';

export enum SeatClass {
  ECONOMY = 'economy',
  PREMIUM_ECONOMY = 'premium_economy',
  BUSINESS = 'business',
  FIRST = 'first',
}

export enum SeatType {
  WINDOW = 'window',
  AISLE = 'aisle',
  MIDDLE = 'middle',
  EXIT = 'exit',
  BULKHEAD = 'bulkhead',
}

export enum SeatStatus {
  AVAILABLE = 'available',
  BOOKED = 'booked',
  RESERVED = 'reserved',
  BLOCKED = 'blocked',
}

@Entity('flight_seats')
export class FlightSeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Flight, (flight) => flight.seats, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flightId' })
  flight: Flight;

  @Column({ type: 'uuid' })
  flightId: string;

  @Column({ type: 'varchar', length: 10 })
  seatNumber: string;

  @Column({ type: 'enum', enum: SeatClass })
  class: SeatClass;

  @Column({ type: 'enum', enum: SeatType })
  type: SeatType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'boolean', default: true })
  isWindowSeat: boolean;

  @Column({ type: 'boolean', default: false })
  isExitRow: boolean;

  @Column({ type: 'boolean', default: false })
  hasExtraLegroom: boolean;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'enum', enum: SeatStatus, default: SeatStatus.AVAILABLE })
  status: SeatStatus;

  @Column({ type: 'uuid', nullable: true })
  bookedById: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  bookedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  holdUntil: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
