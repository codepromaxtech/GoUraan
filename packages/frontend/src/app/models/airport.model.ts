export interface Airport {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  departureFlights?: Flight[];
  arrivalFlights?: Flight[];
}
