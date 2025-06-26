import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DoctorResponse } from '../Pages/models/doctor.model';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private apiUrl = `${environment.apiUrl}/api/doctors`;

  constructor(private http: HttpClient) {}

  getAllDoctors(): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.apiUrl}/all`);
  }

  getDoctorById(id: string): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.apiUrl}/${id}`);
  }
}

