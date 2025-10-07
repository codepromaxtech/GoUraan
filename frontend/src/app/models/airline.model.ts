export interface Airline {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  flights?: Flight[];
}
