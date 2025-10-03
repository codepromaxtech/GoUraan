import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private notificationService: NotificationService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';
        
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = this.getServerErrorMessage(error);
          
          // Log the full error in development mode
          if (!environment.production) {
            console.error('HTTP Error:', error);
          }
        }
        
        // Show error notification
        this.notificationService.showError(errorMessage);
        
        return throwError(() => error);
      })
    );
  }
  
  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 400:
        return error.error?.message || 'Bad Request';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to access this resource.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'A conflict occurred while processing your request.';
      case 422:
        return this.formatValidationErrors(error);
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 503:
        return 'The service is currently unavailable. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
  
  private formatValidationErrors(error: HttpErrorResponse): string {
    if (!error.error?.errors) {
      return error.error?.message || 'Validation failed';
    }
    
    // Format validation errors into a user-friendly message
    const errors = error.error.errors;
    return Object.keys(errors)
      .map(key => `${key}: ${errors[key].join(', ')}`)
      .join('\n');
  }
}
