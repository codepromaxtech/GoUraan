import { Hotel } from './hotel.model';

export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxOccupancy: number;
  size?: number; // in square meters
  bedType: string;
  viewType?: string;
  basePrice: number;
  hotelId: string;
  isActive: boolean;
  amenities: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  hotel?: Hotel;
  rooms?: Room[];
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  status: 'available' | 'occupied' | 'maintenance';
  roomTypeId: string;
  hotelId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  roomType?: RoomType;
  hotel?: Hotel;
}
