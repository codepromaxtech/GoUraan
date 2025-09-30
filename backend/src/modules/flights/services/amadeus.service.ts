import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AmadeusService {
  private readonly logger = new Logger(AmadeusService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private accessToken: string;
  private tokenExpiresAt: Date;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get('apis.amadeus.baseUrl');
    this.apiKey = this.configService.get('apis.amadeus.apiKey');
    this.apiSecret = this.configService.get('apis.amadeus.apiSecret');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/v1/security/oauth2/token`, {
        grant_type: 'client_credentials',
        client_id: this.apiKey,
        client_secret: this.apiSecret,
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Amadeus access token', error);
      throw new Error('Authentication failed');
    }
  }

  async searchFlights(searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: any;
    cabinClass: string;
    tripType: string;
  }) {
    try {
      const token = await this.getAccessToken();
      
      const params: any = {
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        adults: searchParams.passengers.adults || 1,
        children: searchParams.passengers.children || 0,
        infants: searchParams.passengers.infants || 0,
        travelClass: this.mapCabinClass(searchParams.cabinClass),
        max: 50,
      };

      if (searchParams.returnDate && searchParams.tripType === 'round-trip') {
        params.returnDate = searchParams.returnDate;
      }

      const response = await axios.get(`${this.baseUrl}/v2/shopping/flight-offers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params,
      });

      return {
        flights: this.transformFlightResults(response.data.data),
        meta: response.data.meta,
      };
    } catch (error) {
      this.logger.error('Amadeus flight search failed', error);
      throw new Error('Flight search failed');
    }
  }

  async getFlightDetails(flightId: string) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/v1/shopping/flight-offers/${flightId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return this.transformFlightDetails(response.data.data);
    } catch (error) {
      this.logger.error('Failed to get Amadeus flight details', error);
      throw new Error('Failed to get flight details');
    }
  }

  async reserveFlight(reservationData: {
    flightId: string;
    passengers: any[];
    contactInfo: any;
    bookingReference: string;
  }) {
    try {
      const token = await this.getAccessToken();
      
      const payload = {
        data: {
          type: 'flight-order',
          flightOffers: [{ id: reservationData.flightId }],
          travelers: this.transformPassengers(reservationData.passengers),
          contacts: [
            {
              addresseeName: {
                firstName: reservationData.contactInfo.firstName,
                lastName: reservationData.contactInfo.lastName,
              },
              companyName: 'GoUraan',
              purpose: 'STANDARD',
              phones: [
                {
                  deviceType: 'MOBILE',
                  countryCallingCode: '880',
                  number: reservationData.contactInfo.phone,
                },
              ],
              emailAddress: reservationData.contactInfo.email,
            },
          ],
        },
      };

      const response = await axios.post(`${this.baseUrl}/v1/booking/flight-orders`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        pnr: response.data.data.associatedRecords[0].reference,
        orderId: response.data.data.id,
        status: response.data.data.flightOffers[0].status,
        tickets: response.data.data.flightOffers[0].travelerPricings.map((tp: any) => ({
          passengerId: tp.travelerId,
          ticketNumber: tp.fareDetailsBySegment[0].cabin,
        })),
      };
    } catch (error) {
      this.logger.error('Amadeus flight reservation failed', error);
      throw new Error('Flight reservation failed');
    }
  }

  async confirmBooking(pnr: string) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/v1/booking/flight-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          'filter[pnr]': pnr,
        },
      });

      return {
        confirmed: true,
        pnr,
        status: response.data.data[0]?.flightOffers[0]?.status || 'CONFIRMED',
        tickets: response.data.data[0]?.flightOffers[0]?.travelerPricings || [],
      };
    } catch (error) {
      this.logger.error('Amadeus booking confirmation failed', error);
      throw new Error('Booking confirmation failed');
    }
  }

  async cancelBooking(pnr: string, reason?: string) {
    try {
      const token = await this.getAccessToken();
      
      // Note: Amadeus cancellation requires specific order ID
      const response = await axios.delete(`${this.baseUrl}/v1/booking/flight-orders/${pnr}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return {
        cancelled: true,
        pnr,
        reason,
        cancellationFee: 0, // Would be calculated based on airline rules
      };
    } catch (error) {
      this.logger.error('Amadeus booking cancellation failed', error);
      throw new Error('Booking cancellation failed');
    }
  }

  async getFlightStatus(pnr: string) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/v1/schedule/flights`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          carrierCode: pnr.substring(0, 2), // Extract carrier code from PNR
          flightNumber: pnr.substring(2),
          scheduledDepartureDate: new Date().toISOString().split('T')[0],
        },
      });

      return {
        pnr,
        status: response.data.data[0]?.flightStatus || 'UNKNOWN',
        departure: response.data.data[0]?.departure,
        arrival: response.data.data[0]?.arrival,
        aircraft: response.data.data[0]?.aircraft,
      };
    } catch (error) {
      this.logger.error('Failed to get Amadeus flight status', error);
      throw new Error('Failed to get flight status');
    }
  }

  private transformFlightResults(data: any[]): any[] {
    return data.map(offer => ({
      id: offer.id,
      provider: 'amadeus',
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      segments: offer.itineraries.map((itinerary: any) => ({
        departure: {
          airport: itinerary.segments[0].departure.iataCode,
          time: itinerary.segments[0].departure.at,
        },
        arrival: {
          airport: itinerary.segments[itinerary.segments.length - 1].arrival.iataCode,
          time: itinerary.segments[itinerary.segments.length - 1].arrival.at,
        },
        duration: itinerary.duration,
        stops: itinerary.segments.length - 1,
        airline: itinerary.segments[0].carrierCode,
        flightNumber: itinerary.segments[0].number,
        aircraft: itinerary.segments[0].aircraft?.code,
        cabin: offer.travelerPricings[0].fareDetailsBySegment[0].cabin,
      })),
      baggage: {
        checked: offer.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags?.quantity || 0,
        cabin: '7kg',
      },
      refundable: offer.pricingOptions?.refundableFare || false,
      validatingAirline: offer.validatingAirlineCodes[0],
    }));
  }

  private transformFlightDetails(data: any): any {
    return {
      id: data.id,
      provider: 'amadeus',
      price: parseFloat(data.price.total),
      currency: data.price.currency,
      segments: data.itineraries.map((itinerary: any) => ({
        departure: {
          airport: itinerary.segments[0].departure.iataCode,
          time: itinerary.segments[0].departure.at,
          terminal: itinerary.segments[0].departure.terminal,
        },
        arrival: {
          airport: itinerary.segments[itinerary.segments.length - 1].arrival.iataCode,
          time: itinerary.segments[itinerary.segments.length - 1].arrival.at,
          terminal: itinerary.segments[itinerary.segments.length - 1].arrival.terminal,
        },
        duration: itinerary.duration,
        stops: itinerary.segments.length - 1,
        segments: itinerary.segments.map((segment: any) => ({
          airline: segment.carrierCode,
          flightNumber: segment.number,
          aircraft: segment.aircraft?.code,
          departure: {
            airport: segment.departure.iataCode,
            time: segment.departure.at,
            terminal: segment.departure.terminal,
          },
          arrival: {
            airport: segment.arrival.iataCode,
            time: segment.arrival.at,
            terminal: segment.arrival.terminal,
          },
          duration: segment.duration,
          cabin: data.travelerPricings[0].fareDetailsBySegment.find((f: any) => f.segmentId === segment.id)?.cabin,
        })),
      })),
      baggage: {
        checked: data.travelerPricings[0].fareDetailsBySegment[0].includedCheckedBags?.quantity || 0,
        cabin: '7kg',
      },
      fareRules: data.travelerPricings[0].fareDetailsBySegment[0].fareRules || {},
      refundable: data.pricingOptions?.refundableFare || false,
    };
  }

  private transformPassengers(passengers: any[]): any[] {
    return passengers.map((passenger, index) => ({
      id: `${index + 1}`,
      dateOfBirth: passenger.dateOfBirth,
      name: {
        firstName: passenger.firstName,
        lastName: passenger.lastName,
      },
      gender: passenger.gender || 'MALE',
      contact: {
        emailAddress: passenger.email,
        phones: [
          {
            deviceType: 'MOBILE',
            countryCallingCode: '880',
            number: passenger.phone,
          },
        ],
      },
      documents: [
        {
          documentType: 'PASSPORT',
          number: passenger.passportNumber,
          expiryDate: passenger.passportExpiry,
          issuanceCountry: passenger.nationality,
          validityCountry: passenger.nationality,
          nationality: passenger.nationality,
          holder: true,
        },
      ],
    }));
  }

  private mapCabinClass(cabinClass: string): string {
    const classMap: { [key: string]: string } = {
      'economy': 'ECONOMY',
      'premium-economy': 'PREMIUM_ECONOMY',
      'business': 'BUSINESS',
      'first': 'FIRST',
    };
    return classMap[cabinClass.toLowerCase()] || 'ECONOMY';
  }
}
