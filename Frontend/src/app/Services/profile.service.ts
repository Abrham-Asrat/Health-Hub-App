import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Profile, Review } from '../Pages/models/profile.model';
import { Router } from '@angular/router';
import { AuthService, Auth0ProfileDto } from './auth.service';

export interface ProfileResponse {
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
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/users`;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public refreshToken$ = this.refreshTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      this.authService.logout();
      throw new Error('No authentication token available');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest'
    });
  }

  private getRequestOptions(): { headers: HttpHeaders; withCredentials: boolean } {
    return {
      headers: this.getHeaders(),
      withCredentials: true
    };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // If we're not already refreshing the token
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

        // Try to refresh the token
        return this.authService.refreshToken().pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            if (response && response.data && response.data.accessToken) {
              this.refreshTokenSubject.next(response.data.accessToken);
              // Retry the original request with the new token
              const originalRequest = error.error?.request || error;
              return this.retryRequest(originalRequest);
            } else {
              // If refresh failed, logout and redirect to login
              this.authService.logout();
              return throwError(() => new Error('Session expired. Please login again.'));
            }
          }),
          catchError((refreshError) => {
            this.isRefreshing = false;
            this.authService.logout();
            return throwError(() => new Error('Session expired. Please login again.'));
          })
        );
      } else {
        // If we're already refreshing, wait for the new token
        return this.refreshTokenSubject.pipe(
          switchMap(token => {
            if (token) {
              const originalRequest = error.error?.request || error;
              return this.retryRequest(originalRequest);
            } else {
          
              this.authService.logout();
              return throwError(() => new Error('Session expired. Please login again.'));
            }
          })
        );
      }
    }
    return throwError(() => error);
  }

  private retryRequest(request: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-Requested-With': 'XMLHttpRequest'
    });

    const options = {
      headers,
      withCredentials: true
    };

    // If it's a GET request
    if (request.method === 'GET') {
      return this.http.get(request.url, options);
    }
    // If it's a POST request
    else if (request.method === 'POST') {
      return this.http.post(request.url, request.body, options);
    }
    // If it's a PUT request
    else if (request.method === 'PUT') {
      return this.http.put(request.url, request.body, options);
    }
    // If it's a PATCH request
    else if (request.method === 'PATCH') {
      return this.http.patch(request.url, request.body, options);
    }
    // If it's a DELETE request
    else if (request.method === 'DELETE') {
      return this.http.delete(request.url, options);
    }

    return throwError(() => new Error('Unsupported request method'));
  }

  public getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile/me`, { 
      headers: this.getHeaders(),
      withCredentials: true // Enable sending cookies
    })
      .pipe(
        tap((response) => {
          if (response && response.data && response.data.accessToken) {
            this.refreshTokenSubject.next(response.data.accessToken);
          }
        }),
        catchError((error) => this.handleError(error))
      );
  }

  public updateProfile(profileData: Partial<Auth0ProfileDto>): Observable<ProfileResponse> {
    return this.http.put<ProfileResponse>(`${this.apiUrl}/profile`, profileData, { 
      headers: this.getHeaders(),
      withCredentials: true // Enable sending cookies
    })
      .pipe(
        tap((response) => {
          if (response && response.data && response.data.accessToken) {
            this.refreshTokenSubject.next(response.data.accessToken);
          }
        }),
        catchError((error) => this.handleError(error))
      );
  }

  changePassword(oldPassword: string, newPassword: string, confirmNewPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword,
      confirmNewPassword
    }, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  getDoctorReviews(doctorId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.apiUrl}/reviews/${doctorId}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`,
      'X-Requested-With': 'XMLHttpRequest'
    });
    return this.http.post(`${this.apiUrl}/upload-profile-picture`, formData, { 
      headers,
      withCredentials: true 
    })
      .pipe(catchError((error) => this.handleError(error)));
  }

  addReview(doctorId: string, review: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, {
      doctorId,
      ...review
    }, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  updateReview(reviewId: string, review: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews/${reviewId}`, review, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }
} 