import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../Models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = `${environment.apiUrl}/api/appointments`;

  constructor(private http: HttpClient) {}

  // Get all appointments
  getAllAppointments(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/all`);
  }

  // Get doctor appointments
  getDoctorAppointments(doctorId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/doctor/${doctorId}`);
  }

  // Get patient appointments
  getPatientAppointments(patientId: string): Observable<ApiResponse<any>> {
    // Convert string ID to GUID format if needed
    const guid = patientId.includes('-') ? patientId : 
      `${patientId.slice(0, 8)}-${patientId.slice(8, 12)}-${patientId.slice(12, 16)}-${patientId.slice(16, 20)}-${patientId.slice(20)}`;
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/patient/${guid}`);
  }

  // Create appointment
  createAppointment(appointment: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/book`, appointment);
  }

  // Edit appointment
  editAppointment(appointmentId: string, appointment: any): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${appointmentId}`, appointment);
  }

  // Delete appointment
  deleteAppointment(appointmentId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${appointmentId}`);
  }

  // Get doctor schedules
  getDoctorSchedules(doctorId: string, timeFrame: string = 'Month'): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/doctor/${doctorId}/schedules?timeFrame=${timeFrame}`);
  }
}


