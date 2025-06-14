import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Availability, Education, Experience } from '../Pages/models/profile.model';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  role: 'doctor' | 'patient';
  profileImage?: string;
}

export interface Auth0ProfileDto {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  address?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialities?: string[];
  availabilities?: Availability[];
  qualifications?: string;
  biography?: string;
  doctorStatus?: string;
  educations?: Education[];
  experiences?: Experience[];
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    expiresIn: number;
    auth0ProfileDto: Auth0ProfileDto;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Load user from localStorage on service initialization
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (this.isValidUser(parsedUser)) {
          this.currentUserSubject.next(parsedUser);
        } else {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  private isValidUser(user: any): user is User {
    return (
      user &&
      typeof user === 'object' &&
      typeof user.id === 'string' &&
      typeof user.fullName === 'string' &&
      typeof user.email === 'string' &&
      (user.role === 'doctor' || user.role === 'patient')
    );
  }

  public getCurrentUserId(): string {
    const user = this.currentUserSubject.value;
    if (!user) {
      throw new Error('No user is currently logged in');
    }
    return user.id;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public login(email: string, password: string): Observable<AuthResponse | HttpResponse<AuthResponse>> {
    const options = {
      observe: 'response' as const,
      withCredentials: true
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password }, options)
      .pipe(
        tap((response: HttpResponse<AuthResponse>) => {
          if (response.body?.success && response.body.data) {
            // Store tokens
            localStorage.setItem('token', response.body.data.accessToken);
            
            // Store user data
            const user: User = {
              id: response.body.data.auth0ProfileDto.userId,
              fullName: `${response.body.data.auth0ProfileDto.firstName} ${response.body.data.auth0ProfileDto.lastName}`,
              email: email,
              role: response.body.data.auth0ProfileDto.role.toLowerCase() as 'doctor' | 'patient'
            };
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.currentUserSubject.next(user);

            // Set cookies from response headers
            const cookies = response.headers.get('set-cookie');
            if (cookies) {
              cookies.split(';').forEach((cookie: string) => {
                const [name, value] = cookie.split('=');
                if (name && value) {
                  document.cookie = `${name.trim()}=${value.trim()}; path=/; SameSite=Strict`;
                }
              });
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  public refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, { refreshToken }, {
      withCredentials: true,
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      })
    })
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            localStorage.setItem('token', response.data.accessToken);
            if (response.data.auth0ProfileDto) {
              const user: User = {
                id: response.data.auth0ProfileDto.userId,
                fullName: `${response.data.auth0ProfileDto.firstName} ${response.data.auth0ProfileDto.lastName}`,
                role: response.data.auth0ProfileDto.role.toLowerCase() as 'doctor' | 'patient'
              };
              localStorage.setItem('currentUser', JSON.stringify(user));
              this.currentUserSubject.next(user);
            }
          }
        }),
        catchError((error) => {
          this.logout();
          return throwError(() => error);
        })
      );
  }

  public logout(): void {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);

    // Clear cookies
    document.cookie.split(';').forEach((cookie: string) => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    this.router.navigate(['/Dashboard/Home']);
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }

  public isDoctor(): boolean {
    return this.currentUserSubject.value?.role === 'doctor';
  }

  public isPatient(): boolean {
    return this.currentUserSubject.value?.role === 'patient';
  }

  public getToken(): string | null {
    // First try to get from localStorage
    const token = localStorage.getItem('token');
    if (token) return token;

    // If not in localStorage, try to get from cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
    if (tokenCookie) {
      const token = tokenCookie.split('=')[1];
      // Store in localStorage for future use
      localStorage.setItem('token', token);
      return token;
    }

    return null;
  }

  private handleError(error: any) {
    console.error('Auth error:', error);
    if (error.status === 401) {
      // Try to refresh token before logging out
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        return this.refreshToken().pipe(
          catchError((refreshError) => {
            console.error('Token refresh failed:', refreshError);
            this.logout();
            return throwError(() => error);
          })
        );
      }
      this.logout();
    }
    return throwError(() => error);
  }

  private getHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      this.logout();
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest'
    });
  }
} 