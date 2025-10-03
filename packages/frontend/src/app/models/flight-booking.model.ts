export interface FlightBooking {
  id: string;
  bookingId: string;
  pnr: string;
  bookingDate: string;
  issueDate: string;
  issuedBy: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  bookingType: string;
  flightSegments: FlightSegment[];
  passengers: Passenger[];
  tickets: Ticket[];
  baseFare: number;
  tax: number;
  totalFare: number;
  discount: number;
  customerPay: number;
  agencyPay: number;
  expense: number;
  profit: number;
  reference?: string;
  documents?: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface FlightSegment {
  id: string;
  bookingId: string;
  flightNumber: string;
  airline: string;
  departureDate: string;
  departureTime: string;
  departureAirport: string;
  arrivalDate: string;
  arrivalTime: string;
  arrivalAirport: string;
  cabinClass: string;
  baggageAllowance: string;
}

export interface Passenger {
  id: string;
  bookingId: string;
  title: 'MR' | 'MRS' | 'MISS' | 'MS' | 'MASTER';
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  passportNumber?: string;
  nationality?: string;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  bookingId: string;
  passengerId: string;
  ticketNumber: string;
  status: 'ISSUED' | 'VOID' | 'REFUNDED' | 'USED';
  issueDate: string;
  passenger?: Passenger;
}

export interface Document {
  id: string;
  bookingId: string;
  type: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export interface FlightBookingListResponse {
  data: FlightBooking[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface FlightBookingParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  bookingType?: string;
  airline?: string;
}

export interface CreateFlightBookingDto {
  bookingId: string;
  pnr: string;
  bookingDate: string;
  issueDate: string;
  issuedBy: string;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  bookingType?: string;
  flightSegments: Omit<FlightSegment, 'id' | 'bookingId'>[];
  passengers: Omit<Passenger, 'id' | 'bookingId'>[];
  baseFare: number;
  tax: number;
  totalFare: number;
  discount?: number;
  customerPay?: number;
  agencyPay?: number;
  expense?: number;
  profit?: number;
  reference?: string;
}

export interface UpdateFlightBookingDto extends Partial<CreateFlightBookingDto> {}

export interface BookingFilterOptions {
  statuses: string[];
  airlines: string[];
  bookingTypes: string[];
  cabinClasses: string[];
}

export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  totalPassengers: number;
  statusCounts: {
    PENDING: number;
    CONFIRMED: number;
    CANCELLED: number;
    COMPLETED: number;
  };
  recentBookings: FlightBooking[];
}
