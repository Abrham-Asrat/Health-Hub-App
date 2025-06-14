import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  loginUser(loginData: { email: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  getUserProfile(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/${userId}`, { 
      headers: this.getHeaders()
    });
  }

  getMyProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/me`, { 
      headers: this.getHeaders()
    });
  }

  editProfile(profileData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/profile`, profileData, { 
      headers: this.getHeaders()
    });
  }
}
