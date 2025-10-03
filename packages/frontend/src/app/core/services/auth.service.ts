import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../../../environments/environment';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: any;
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';
  
  private currentUserSubject: BehaviorSubject<UserProfile | null>;
  public currentUser$: Observable<UserProfile | null>;
  
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Initialize current user from localStorage if available
    const userJson = localStorage.getItem(this.USER_KEY);
    this.currentUserSubject = new BehaviorSubject<UserProfile | null>(
      userJson ? JSON.parse(userJson) : null
    );
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Get the current user value
   */
  public get currentUserValue(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string | string[]): boolean {
    if (!this.currentUserValue) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    return roles.some(r => this.currentUserValue?.roles?.includes(r));
  }

  /**
   * Check if user has specific permission
   */
  public hasPermission(permission: string | string[]): boolean {
    if (!this.currentUserValue) return false;
    
    const permissions = Array.isArray(permission) ? permission : [permission];
    return permissions.some(p => this.currentUserValue?.permissions?.includes(p));
  }

  /**
   * Get authentication token
   */
  public getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Login user with email/username and password
   */
  login(credentials: { username: string; password: string }): Observable<UserProfile> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => this.setSession(response)),
        map(response => response.user),
        catchError(error => {
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  /**
   * Logout the current user
   */
  logout(): void {
    // Call logout API if token exists
    const token = this.getToken();
    if (token) {
      this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
        next: () => {
          this.clearSession();
          this.router.navigate(['/auth/login']);
        },
        error: () => {
          this.clearSession();
          this.router.navigate(['/auth/login']);
        }
      });
    } else {
      this.clearSession();
      this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<{ access_token: string }>(
      `${environment.apiUrl}/auth/refresh-token`,
      { refresh_token: refreshToken }
    ).pipe(
      map(response => {
        const token = response.access_token;
        localStorage.setItem(this.TOKEN_KEY, token);
        return token;
      }),
      catchError(error => {
        this.clearSession();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user profile
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<{ data: UserProfile }>(`${environment.apiUrl}/auth/me`)
      .pipe(
        map(response => {
          this.setUser(response.data);
          return response.data;
        }),
        catchError(error => {
          this.clearSession();
          return throwError(() => error);
        })
      );
  }

  /**
   * Update user profile
   */
  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.patch<{ data: UserProfile }>(`${environment.apiUrl}/auth/me`, profile)
      .pipe(
        map(response => {
          this.setUser(response.data);
          return response.data;
        })
      );
  }

  /**
   * Change user password
   */
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/change-password`, data);
  }

  /**
   * Request password reset
   */
  requestPasswordReset(email: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, password: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, {
      token,
      password
    });
  }

  /**
   * Verify email with token
   */
  verifyEmail(token: string): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/verify-email`, { token });
  }

  /**
   * Set user session after successful login
   */
  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.access_token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResult.refresh_token);
    this.setUser(authResult.user);
  }

  /**
   * Set current user data
   */
  private setUser(user: UserProfile): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /**
   * Clear user session
   */
  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Get token expiration date
   */
  getTokenExpirationDate(token: string): Date | null {
    try {
      const decoded = this.jwtHelper.decodeToken(token);
      if (!decoded.exp) return null;
      
      const date = new Date(0);
      date.setUTCSeconds(decoded.exp);
      return date;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string): boolean {
    if (!token) token = this.getToken() || '';
    if (!token) return true;
    
    return this.jwtHelper.isTokenExpired(token);
  }

  /**
   * Get token expiration in seconds
   */
  getTokenExpirationInSeconds(): number | null {
    const token = this.getToken();
    if (!token) return null;
    
    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) return null;
    
    return Math.floor((expirationDate.getTime() - new Date().getTime()) / 1000);
  }
}
