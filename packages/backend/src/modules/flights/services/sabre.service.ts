import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SabreService {
  private readonly logger = new Logger(SabreService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private accessToken: string;
  private tokenExpiresAt: Date;

  constructor(private configService: ConfigService) {
    this.baseUrl = 'https://api.sabre.com';
    this.clientId = this.configService.get('apis.sabre.clientId');
    this.clientSecret = this.configService.get('apis.sabre.clientSecret');
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiresAt > new Date()) {
      return this.accessToken;
    }

    try {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(`${this.baseUrl}/v2/auth/token`, 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expires_in * 1000));
      
      return this.accessToken;
    } catch (error) {
      this.logger.error('Failed to get Sabre access token', error);
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
      
      const payload = {
        OTA_AirLowFareSearchRQ: {
          Version: '1',
          POS: {
            Source: [
              {
                PseudoCityCode: 'F9CE',
                RequestorID: {
                  Type: '1',
                  ID: '1',
                  CompanyName: {
                    Code: 'TN'
                  }
                }
              }
            ]
          },
          OriginDestinationInformation: [
            {
              RPH: '1',
              DepartureDateTime: searchParams.departureDate + 'T00:00:00',
              OriginLocation: {
                LocationCode: searchParams.origin
              },
              DestinationLocation: {
                LocationCode: searchParams.destination
              }
            }
          ],
          TravelPreferences: {
            CabinPref: [
              {
                Cabin: this.mapCabinClass(searchParams.cabinClass),
                PreferLevel: 'Preferred'
              }
            ]
          },
          TravelerInfoSummary: {
            SeatsRequested: [searchParams.passengers.adults || 1],
            AirTravelerAvail: [
              {
                PassengerTypeQuantity: [
                  {
                    Code: 'ADT',
                    Quantity: searchParams.passengers.adults || 1
                  }
                ]
              }
            ]
          }
        }
      };

      // Add return flight for round trip
      if (searchParams.returnDate && searchParams.tripType === 'round-trip') {
        payload.OTA_AirLowFareSearchRQ.OriginDestinationInformation.push({
          RPH: '2',
          DepartureDateTime: searchParams.returnDate + 'T00:00:00',
          OriginLocation: {
            LocationCode: searchParams.destination
          },
          DestinationLocation: {
            LocationCode: searchParams.origin
          }
        });
      }

      const response = await axios.post(`${this.baseUrl}/v1/shop/flights`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        flights: this.transformFlightResults(response.data.groupedItineraryResponse?.itineraryGroups || []),
        meta: response.data.groupedItineraryResponse?.statistics,
      };
    } catch (error) {
      this.logger.error('Sabre flight search failed', error);
      throw new Error('Flight search failed');
    }
  }

  async getFlightDetails(flightId: string) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/v1/shop/flights/${flightId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return this.transformFlightDetails(response.data);
    } catch (error) {
      this.logger.error('Failed to get Sabre flight details', error);
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
        CreatePassengerNameRecordRQ: {
          version: '2.3.0',
          haltOnAirPriceError: true,
          AirBook: {
            OriginDestinationInformation: {
              FlightSegment: [
                {
                  DepartureDateTime: '2024-02-15T10:00:00',
                  FlightNumber: '123',
                  ResBookDesigCode: 'Y',
                  MarketingAirline: {
                    Code: 'EK'
                  },
                  OriginLocation: {
                    LocationCode: 'DAC'
                  },
                  DestinationLocation: {
                    LocationCode: 'DXB'
                  }
                }
              ]
            }
          },
          AirPrice: {
            PriceRequestInformation: {
              OptionalQualifiers: {
                PricingQualifiers: {
                  PassengerType: [
                    {
                      Code: 'ADT',
                      Quantity: reservationData.passengers.length
                    }
                  ]
                }
              }
            }
          },
          TravelItineraryAddInfo: {
            AgencyInfo: {
              Address: {
                AddressLine: 'GoUraan Travel',
                CityName: 'Dhaka',
                CountryCode: 'BD',
                PostalCode: '1000',
                StateCountyProv: {
                  StateCode: 'DH'
                }
              },
              Ticketing: {
                TicketType: '7TAW'
              }
            },
            CustomerInfo: {
              ContactNumbers: {
                ContactNumber: [
                  {
                    Phone: reservationData.contactInfo.phone,
                    PhoneUseType: 'H'
                  }
                ]
              },
              Email: [
                {
                  Address: reservationData.contactInfo.email
                }
              ],
              PersonName: reservationData.passengers.map(passenger => ({
                GivenName: passenger.firstName,
                Surname: passenger.lastName,
                PassengerType: 'ADT'
              }))
            }
          }
        }
      };

      const response = await axios.post(`${this.baseUrl}/v2.3.0/passenger/records`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        pnr: response.data.CreatePassengerNameRecordRS?.ApplicationResults?.Success?.SystemSpecificResults?.[0]?.Message?.[0]?.code || 'UNKNOWN',
        orderId: reservationData.bookingReference,
        status: 'RESERVED',
        tickets: reservationData.passengers.map((passenger, index) => ({
          passengerId: `${index + 1}`,
          ticketNumber: `TKT${Date.now()}${index}`,
        })),
      };
    } catch (error) {
      this.logger.error('Sabre flight reservation failed', error);
      throw new Error('Flight reservation failed');
    }
  }

  async confirmBooking(pnr: string) {
    try {
      const token = await this.getAccessToken();
      
      const payload = {
        EndTransactionRQ: {
          version: '2.0.9',
          EndTransaction: {
            Ind: true
          },
          Source: {
            ReceivedFrom: 'GoUraan API'
          }
        }
      };

      const response = await axios.post(`${this.baseUrl}/v2.0.9/passenger/records/${pnr}`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        confirmed: true,
        pnr,
        status: 'CONFIRMED',
        tickets: [],
      };
    } catch (error) {
      this.logger.error('Sabre booking confirmation failed', error);
      throw new Error('Booking confirmation failed');
    }
  }

  async cancelBooking(pnr: string, reason?: string) {
    try {
      const token = await this.getAccessToken();
      
      const payload = {
        CancelItineraryRQ: {
          version: '1.0.0',
          CancelItinerary: {
            CancelType: 'Full'
          }
        }
      };

      const response = await axios.post(`${this.baseUrl}/v1.0.0/passenger/records/${pnr}/cancel`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        cancelled: true,
        pnr,
        reason,
        cancellationFee: 0,
      };
    } catch (error) {
      this.logger.error('Sabre booking cancellation failed', error);
      throw new Error('Booking cancellation failed');
    }
  }

  async getFlightStatus(pnr: string) {
    try {
      const token = await this.getAccessToken();
      
      const response = await axios.get(`${this.baseUrl}/v1/lists/supported/shop/flights/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        params: {
          pnr: pnr,
        },
      });

      return {
        pnr,
        status: 'ON_TIME', // Default status
        departure: null,
        arrival: null,
        aircraft: null,
      };
    } catch (error) {
      this.logger.error('Failed to get Sabre flight status', error);
      throw new Error('Failed to get flight status');
    }
  }

  private transformFlightResults(itineraryGroups: any[]): any[] {
    const flights: any[] = [];
    
    itineraryGroups.forEach(group => {
      group.itineraries?.forEach((itinerary: any) => {
        flights.push({
          id: `sabre_${itinerary.id || Math.random().toString(36).substr(2, 9)}`,
          provider: 'sabre',
          price: parseFloat(itinerary.pricingInformation?.[0]?.fare?.totalFare?.totalPrice || '0'),
          currency: itinerary.pricingInformation?.[0]?.fare?.totalFare?.currency || 'USD',
          segments: itinerary.legs?.map((leg: any) => ({
            departure: {
              airport: leg.ref?.split('|')[0] || 'UNKNOWN',
              time: leg.schedules?.[0]?.ref || new Date().toISOString(),
            },
            arrival: {
              airport: leg.ref?.split('|')[1] || 'UNKNOWN',
              time: leg.schedules?.[leg.schedules.length - 1]?.ref || new Date().toISOString(),
            },
            duration: leg.elapsedTime || 'PT2H30M',
            stops: (leg.schedules?.length || 1) - 1,
            airline: leg.schedules?.[0]?.carrier?.marketing || 'XX',
            flightNumber: leg.schedules?.[0]?.number || '000',
            aircraft: leg.schedules?.[0]?.equipment || 'Unknown',
            cabin: 'Economy',
          })) || [],
          baggage: {
            checked: 1,
            cabin: '7kg',
          },
          refundable: false,
          validatingAirline: itinerary.pricingInformation?.[0]?.fare?.validatingCarrierCode || 'XX',
        });
      });
    });

    return flights;
  }

  private transformFlightDetails(data: any): any {
    return {
      id: data.id || `sabre_${Math.random().toString(36).substr(2, 9)}`,
      provider: 'sabre',
      price: parseFloat(data.totalFare?.totalPrice || '0'),
      currency: data.totalFare?.currency || 'USD',
      segments: [],
      baggage: {
        checked: 1,
        cabin: '7kg',
      },
      fareRules: {},
      refundable: false,
    };
  }

  private mapCabinClass(cabinClass: string): string {
    const classMap: { [key: string]: string } = {
      'economy': 'Coach',
      'premium-economy': 'Premium',
      'business': 'Business',
      'first': 'First',
    };
    return classMap[cabinClass.toLowerCase()] || 'Coach';
  }
}
