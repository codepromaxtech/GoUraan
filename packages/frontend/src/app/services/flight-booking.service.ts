import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { 
  FlightBooking, 
  FlightBookingListResponse, 
  CreateFlightBookingDto, 
  FlightBookingParams, 
  Passenger, 
  FlightSegment, 
  Ticket 
} from '../models/flight-booking.model';

@Injectable({
  providedIn: 'root'
})
export class FlightBookingService {
  private apiUrl = `${environment.apiUrl}/flight-bookings`;

  constructor(private http: HttpClient) {}

  /**
   * Get all flight bookings with optional filters and pagination
   */
  getBookings(params?: FlightBookingParams): Observable<FlightBookingListResponse> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get<FlightBookingListResponse>(this.apiUrl, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get a single booking by ID
   */
  getBookingById(id: string): Observable<FlightBooking> {
    return this.http.get<{ data: FlightBooking }>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Get a booking by PNR
   */
  getBookingByPnr(pnr: string): Observable<FlightBooking> {
    return this.http.get<{ data: FlightBooking }>(`${this.apiUrl}/pnr/${pnr}`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Create a new flight booking
   */
  createBooking(bookingData: CreateFlightBookingDto): Observable<FlightBooking> {
    return this.http.post<{ data: FlightBooking }>(this.apiUrl, bookingData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Update an existing booking
   */
  updateBooking(id: string, bookingData: Partial<CreateFlightBookingDto>): Observable<FlightBooking> {
    return this.http.patch<{ data: FlightBooking }>(`${this.apiUrl}/${id}`, bookingData)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Delete a booking
   */
  deleteBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Generate ticket for a passenger
   */
  generateTicket(bookingId: string, passengerId: string, ticketNumber: string): Observable<Ticket> {
    return this.http.post<{ data: Ticket }>(
      `${this.apiUrl}/${bookingId}/passengers/${passengerId}/tickets`, 
      { ticketNumber }
    ).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  /**
   * Get booking report with filters
   */
  getBookingReport(params?: FlightBookingParams): Observable<any> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/report`, { params: httpParams })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Export bookings to Excel
   */
  exportBookings(params?: FlightBookingParams): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get(`${this.apiUrl}/export`, {
      params: httpParams,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate a unique booking ID
   */
  generateBookingId(): string {
    const prefix = 'FLT';
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${timestamp}${random}`;
  }

  /**
   * Generate a unique PNR
   */
  generatePnr(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pnr = '';
    for (let i = 0; i < 6; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error?.message || error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
