import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Flight } from './flight.entity';

export enum AirportType {
  INTERNATIONAL = 'international',
  DOMESTIC = 'domestic',
  MILITARY = 'military',
  PRIVATE = 'private',
}

@Entity('airports')
export class Airport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 5, unique: true })
  iataCode: string;

  @Column({ type: 'varchar', length: 5, unique: true, nullable: true })
  icaoCode: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  latitude: number;

  @Column({ type: 'decimal', precision: 9, scale: 6 })
  longitude: number;

  @Column({ type: 'integer', nullable: true })
  altitude: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  timezone: string;

  @Column({ type: 'enum', enum: AirportType, default: AirportType.INTERNATIONAL })
  type: AirportType;

  @Column({ type: 'boolean', default: false })
  isHub: boolean;

  @Column({ type: 'jsonb', nullable: true })
  runways: Array<{
    length: number;
    width: number;
    surface: string;
    lighted: boolean;
    ident1: string;
    ident2: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    phone: string;
    email: string;
    website: string;
    address: string;
  };

  @OneToMany(() => Flight, (flight) => flight.departureAirport)
  departureFlights: Flight[];

  @OneToMany(() => Flight, (flight) => flight.arrivalAirport)
  arrivalFlights: Flight[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}
