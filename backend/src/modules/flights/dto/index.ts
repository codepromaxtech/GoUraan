export class FlightSearchDto {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  cabinClass?: string;
}

export class FlightBookingDto {
  flightId?: string;
  passengers?: any[];
  contactInfo?: any;
}
