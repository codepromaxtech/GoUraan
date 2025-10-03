import { Airline } from './airline.model';
import { Airport } from './airport.model';

export interface Flight {
  id: string;
  flightNumber: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // in minutes
  price: number;
  currency: string;
  availableSeats: number;
  status: 'scheduled' | 'on-time' | 'delayed' | 'cancelled' | 'completed';
  aircraftType?: string;
  baggageAllowance?: string;
  cabinClass: 'economy' | 'premium' | 'business' | 'first';
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  seats?: FlightSeat[];
}
