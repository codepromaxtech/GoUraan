import { Room } from './room.model';

export interface Hotel {
  id: string;
  name: string;
  description: string;
  starRating: number;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  email: string;
  website?: string;
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  rooms?: Room[];
  reviews?: Review[];
}
