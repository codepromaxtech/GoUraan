import { ConfigService } from '@nestjs/config';
export declare class SabreService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly clientId;
    private readonly clientSecret;
    private accessToken;
    private tokenExpiresAt;
    constructor(configService: ConfigService);
    private getAccessToken;
    searchFlights(searchParams: {
        origin: string;
        destination: string;
        departureDate: string;
        returnDate?: string;
        passengers: any;
        cabinClass: string;
        tripType: string;
    }): Promise<{
        flights: any[];
        meta: any;
    }>;
    getFlightDetails(flightId: string): Promise<any>;
    reserveFlight(reservationData: {
        flightId: string;
        passengers: any[];
        contactInfo: any;
        bookingReference: string;
    }): Promise<{
        pnr: any;
        orderId: string;
        status: string;
        tickets: {
            passengerId: string;
            ticketNumber: string;
        }[];
    }>;
    confirmBooking(pnr: string): Promise<{
        confirmed: boolean;
        pnr: string;
        status: string;
        tickets: any[];
    }>;
    cancelBooking(pnr: string, reason?: string): Promise<{
        cancelled: boolean;
        pnr: string;
        reason: string;
        cancellationFee: number;
    }>;
    getFlightStatus(pnr: string): Promise<{
        pnr: string;
        status: string;
        departure: any;
        arrival: any;
        aircraft: any;
    }>;
    private transformFlightResults;
    private transformFlightDetails;
    private mapCabinClass;
}
