import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../Services/appointment.service';
import { DoctorService } from '../../../Services/doctor.service';
import { Doctor } from '../../../Models/doctor.model';
import { AuthService } from '../../../Services/auth.service';
import { UserService } from '../../../Services/user.service';
import { Appointment, AppointmentStatus, AppointmentType, CreateAppointmentDto } from '../../../Models/appointment.model';

@Component({
  selector: 'app-p-appointment',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './p-appointment.component.html',
  styleUrls: ['./p-appointment.component.css'],
})
export class PAppointmentComponent implements OnInit {
  // Doctor list (from API)
  doctors: Doctor[] = [];

  // Appointment form model
  newAppointment: CreateAppointmentDto = {
    doctorId: '',
    patientId: '',
    appointmentDate: '',
    appointmentTime: '',
    appointmentType: AppointmentType.InPerson,
    appointmentTimeSpan: '30' // Default 30 minutes
  };

  // Appointment lists
  upcomingAppointments: Appointment[] = [];
  pastAppointments: Appointment[] = [];

  // Enums for template use
  AppointmentType = AppointmentType;
  AppointmentStatus = AppointmentStatus;

  constructor(
    private http: HttpClient,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadDoctors();
    this.loadPatientProfile();
  }

  /**
   * Load list of doctors from API
   */
  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.doctors = response.data;
        }
      },
      error: (err) => {
        console.error('Failed to load doctors:', err);
      },
    });
  }

  /**
   * Load patient profile to get the correct patient ID
   */
  loadPatientProfile(): void {
    this.userService.getMyProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const patientId = response.data.id;
          this.loadUpcomingAppointments(patientId);
          this.loadPastAppointments(patientId);
        }
      },
      error: (err) => {
        console.error('Failed to load patient profile:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      },
    });
  }

  /**
   * Load upcoming appointments from API
   */
  loadUpcomingAppointments(patientId: string): void {
    this.appointmentService.getPatientAppointments(patientId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.upcomingAppointments = response.data
            .filter((appointment: any) => 
              appointment.status !== AppointmentStatus.Completed && 
              appointment.status !== AppointmentStatus.Cancelled
            );
        }
      },
      error: (err) => {
        console.error('Failed to load upcoming appointments:', err);
      },
    });
  }

  /**
   * Load past appointments from API
   */
  loadPastAppointments(patientId: string): void {
    this.appointmentService.getPatientAppointments(patientId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pastAppointments = response.data
            .filter((appointment: any) => 
              appointment.status === AppointmentStatus.Completed || 
              appointment.status === AppointmentStatus.Cancelled
            );
        }
      },
      error: (err) => {
        console.error('Failed to load past appointments:', err);
      },
    });
  }

  /**
   * Book a new appointment via API
   */
  bookAppointment(): void {
    if (
      !this.newAppointment.doctorId ||
      !this.newAppointment.appointmentDate ||
      !this.newAppointment.appointmentTime ||
      !this.newAppointment.appointmentType
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    this.userService.getMyProfile().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.newAppointment.patientId = response.data.id;
          this.appointmentService.createAppointment(this.newAppointment).subscribe({
            next: (response) => {
              if (response.success && response.data) {
                // Add to UI
                this.upcomingAppointments.push(response.data);

                // Reset form
                this.newAppointment = {
                  doctorId: '',
                  patientId: '',
                  appointmentDate: '',
                  appointmentTime: '',
                  appointmentType: AppointmentType.InPerson,
                  appointmentTimeSpan: '30'
                };
                alert('Appointment booked successfully!');
              }
            },
            error: (err) => {
              console.error('Error booking appointment:', err);
              if (err.status === 401) {
                this.authService.logout();
                this.router.navigate(['/login']);
              } else {
                alert(err.error?.message || 'Failed to book appointment. Please try again.');
              }
            },
          });
        }
      },
      error: (err) => {
        console.error('Failed to get patient profile:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        } else {
          alert('Please log in to book an appointment.');
        }
      },
    });
  }

  /**
   * Cancel an upcoming appointment
   */
  cancelAppointment(id: string): void {
    this.appointmentService.deleteAppointment(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.upcomingAppointments = this.upcomingAppointments.filter(
            (a) => a.appointmentId !== id
          );
        }
      },
      error: (err) => {
        console.error('Failed to cancel appointment:', err);
        alert('Could not cancel appointment. Try again later.');
      },
    });
  }

  /**
   * Return appropriate text color based on appointment status
   */
  getStatusClass(status: AppointmentStatus) {
    return {
      'text-success': status === AppointmentStatus.Confirmed,
      'text-warning': status === AppointmentStatus.Scheduled,
      'text-muted': status === AppointmentStatus.Completed,
      'text-danger': status === AppointmentStatus.Cancelled,
    };
  }

  /**
   * Return appropriate text color based on appointment type
   */
  getTypeClass(type: AppointmentType) {
    return {
      'text-primary': type === AppointmentType.InPerson,
      'text-info': type === AppointmentType.Online,
    };
  }
}
