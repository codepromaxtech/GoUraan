import { ConfigService } from '@nestjs/config';
export declare class AmadeusService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiKey;
    private readonly apiSecret;
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
        orderId: any;
        status: any;
        tickets: any;
    }>;
    confirmBooking(pnr: string): Promise<{
        confirmed: boolean;
        pnr: string;
        status: any;
        tickets: any;
    }>;
    cancelBooking(pnr: string, reason?: string): Promise<{
        cancelled: boolean;
        pnr: string;
        reason: string;
        cancellationFee: number;
    }>;
    getFlightStatus(pnr: string): Promise<{
        pnr: string;
        status: any;
        departure: any;
        arrival: any;
        aircraft: any;
    }>;
    private transformFlightResults;
    private transformFlightDetails;
    private transformPassengers;
    private mapCabinClass;
}
