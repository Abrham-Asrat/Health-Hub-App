import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// Review interfaces matching backend DTOs
export interface ReviewDto {
  reviewId: string;
  doctorId: string;
  patientId: string;
  starRating: number;
  reviewText: string;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  doctor: ReviewProfileDto;
  patient: ReviewProfileDto;
}

export interface ReviewSummaryDto {
  reviewId: string;
  starRating: number;
  reviewText: string;
  createdAt: string;
  updatedAt?: string;
  isEdited: boolean;
  patientName: string;
  patientProfilePicture: string;
}

export interface ReviewProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
}

export interface CreateReviewDto {
  doctorId: string;
  patientId: string;
  starRating: number;
  reviewText: string;
}

export interface EditReviewDto {
  reviewId: string;
  starRating: number;
  reviewText: string;
}

export interface DoctorReviewStatsDto {
  doctorId: string;
  doctorName: string;
  averageRating: number;
  totalReviews: number;
  fiveStarReviews: number;
  fourStarReviews: number;
  threeStarReviews: number;
  twoStarReviews: number;
  oneStarReviews: number;
  zeroStarReviews: number;
  recentReviews: ReviewSummaryDto[];
}

export interface PatientReviewHistoryDto {
  patientId: string;
  patientName: string;
  totalReviewsPosted: number;
  averageRatingGiven: number;
  reviews: ReviewSummaryDto[];
}

export interface ReviewSearchDto {
  doctorId?: string;
  patientId?: string;
  minRating?: number;
  maxRating?: number;
  fromDate?: string;
  toDate?: string;
  isEdited?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/api/reviews`;
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public refreshToken$ = this.refreshTokenSubject.asObservable();

  constructor(
    private http: HttpClient,
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
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshTokenSubject.next(null);

        return this.authService.refreshToken().pipe(
          switchMap((response) => {
            this.isRefreshing = false;
            if (response && response.data && response.data.accessToken) {
              this.refreshTokenSubject.next(response.data.accessToken);
              const originalRequest = error.error?.request || error;
              return this.retryRequest(originalRequest);
            } else {
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

    if (request.method === 'GET') {
      return this.http.get(request.url, options);
    } else if (request.method === 'POST') {
      return this.http.post(request.url, request.body, options);
    } else if (request.method === 'PUT') {
      return this.http.put(request.url, request.body, options);
    } else if (request.method === 'DELETE') {
      return this.http.delete(request.url, options);
    }

    return throwError(() => new Error('Unsupported request method'));
  }

  // Create a new review
  createReview(review: CreateReviewDto): Observable<ApiResponse<ReviewDto>> {
    return this.http.post<ApiResponse<ReviewDto>>(`${this.apiUrl}`, review, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get all reviews
  getAllReviews(): Observable<ApiResponse<ReviewDto[]>> {
    return this.http.get<ApiResponse<ReviewDto[]>>(`${this.apiUrl}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get review by ID
  getReviewById(reviewId: string): Observable<ApiResponse<ReviewDto>> {
    return this.http.get<ApiResponse<ReviewDto>>(`${this.apiUrl}/${reviewId}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get all reviews for a doctor
  getDoctorReviews(doctorId: string): Observable<ApiResponse<ReviewDto[]>> {
    return this.http.get<ApiResponse<ReviewDto[]>>(`${this.apiUrl}/doctor/${doctorId}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get all reviews posted by a patient
  getPatientReviews(patientId: string): Observable<ApiResponse<ReviewDto[]>> {
    return this.http.get<ApiResponse<ReviewDto[]>>(`${this.apiUrl}/patient/${patientId}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Edit a review
  editReview(review: EditReviewDto): Observable<ApiResponse<ReviewDto>> {
    return this.http.put<ApiResponse<ReviewDto>>(`${this.apiUrl}`, review, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Delete a review
  deleteReview(reviewId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/${reviewId}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get doctor review statistics
  getDoctorReviewStats(doctorId: string): Observable<ApiResponse<DoctorReviewStatsDto>> {
    return this.http.get<ApiResponse<DoctorReviewStatsDto>>(`${this.apiUrl}/doctor/${doctorId}/stats`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get patient review history
  getPatientReviewHistory(patientId: string): Observable<ApiResponse<PatientReviewHistoryDto>> {
    return this.http.get<ApiResponse<PatientReviewHistoryDto>>(`${this.apiUrl}/patient/${patientId}/history`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Search reviews
  searchReviews(searchDto: ReviewSearchDto): Observable<ApiResponse<ReviewSummaryDto[]>> {
    const params = new URLSearchParams();
    
    if (searchDto.doctorId) params.append('doctorId', searchDto.doctorId);
    if (searchDto.patientId) params.append('patientId', searchDto.patientId);
    if (searchDto.minRating !== undefined) params.append('minRating', searchDto.minRating.toString());
    if (searchDto.maxRating !== undefined) params.append('maxRating', searchDto.maxRating.toString());
    if (searchDto.fromDate) params.append('fromDate', searchDto.fromDate);
    if (searchDto.toDate) params.append('toDate', searchDto.toDate);
    if (searchDto.isEdited !== undefined) params.append('isEdited', searchDto.isEdited.toString());
    if (searchDto.page) params.append('page', searchDto.page.toString());
    if (searchDto.pageSize) params.append('pageSize', searchDto.pageSize.toString());
    if (searchDto.sortBy) params.append('sortBy', searchDto.sortBy);
    if (searchDto.sortDescending !== undefined) params.append('sortDescending', searchDto.sortDescending.toString());

    return this.http.get<ApiResponse<ReviewSummaryDto[]>>(`${this.apiUrl}/search?${params.toString()}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get recent reviews for a doctor
  getRecentReviewsForDoctor(doctorId: string, count: number = 5): Observable<ApiResponse<ReviewSummaryDto[]>> {
    return this.http.get<ApiResponse<ReviewSummaryDto[]>>(`${this.apiUrl}/doctor/${doctorId}/recent?count=${count}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Check if a patient has already reviewed a doctor
  checkIfPatientReviewedDoctor(patientId: string, doctorId: string): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/check/${patientId}/${doctorId}`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }

  // Get the average rating for a doctor
  getDoctorAverageRating(doctorId: string): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/doctor/${doctorId}/average-rating`, this.getRequestOptions())
      .pipe(catchError((error) => this.handleError(error)));
  }
}
