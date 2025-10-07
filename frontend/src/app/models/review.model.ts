import { User } from './user.model';
import { Hotel } from './hotel.model';

export interface Review {
  id: string;
  userId: string;
  hotelId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  isVerified: boolean;
  stayDate: Date;
  tripType?: 'business' | 'leisure' | 'family' | 'couple' | 'solo';
  response?: {
    comment: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  user?: User;
  hotel?: Hotel;
}
