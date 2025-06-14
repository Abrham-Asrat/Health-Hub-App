import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Appointment, PastAppointment } from '../../models/doctorAppointment.model';
import { AppointmentService } from '../../../Services/appointment.service';
import { AuthService } from '../../../Services/auth.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-d-appointment',
  imports: [NgFor],
  templateUrl: './d-appointment.component.html',
  styleUrls: ['./d-appointment.component.css'],
})
export class DAppointmentComponent implements OnInit {
  activeTab: string = 'upcoming';

  // Dynamic lists
  upcomingAppointments: Appointment[] = [];
  pastAppointments: PastAppointment[] = [];

  constructor(
    private http: HttpClient, 
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.id) {
      console.error('No user is currently logged in');
      return;
    }
    this.loadUpcomingAppointments(currentUser.id);
    this.loadPastAppointments(currentUser.id);
  }

  /**
   * Fetches upcoming appointments from the backend
   */
  loadUpcomingAppointments(doctorId: string): void {
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.upcomingAppointments = response.data
            .filter((appointment: any) => 
              appointment.status !== 'Completed' && appointment.status !== 'Cancelled'
            )
            .map((appointment: any) => ({
              id: appointment.id,
              name: appointment.patientName || appointment.patient?.fullName || 'Unknown',
              date: appointment.date,
              time: appointment.time,
              status: appointment.status || 'Pending',
              reason: appointment.reason || '',
            }));
        }
      },
      error: (err) => {
        console.error('Failed to load upcoming appointments:', err);
      },
    });
  }

  /**
   * Fetches past appointments from the backend
   */
  loadPastAppointments(doctorId: string): void {
    this.appointmentService.getDoctorAppointments(doctorId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.pastAppointments = response.data
            .filter((appointment: any) => 
              appointment.status === 'Completed' || appointment.status === 'Cancelled'
            )
            .map((appointment: any) => ({
              name: appointment.patientName || appointment.patient?.fullName || 'Unknown',
              date: appointment.date,
              status: appointment.status || 'Unknown',
            }));
        }
      },
      error: (err) => {
        console.error('Failed to load past appointments:', err);
      },
    });
  }

  /**
   * Confirm an appointment
   */
  appointmentAccepted(appointment: Appointment): void {
    const editDto = {
      status: 'Confirmed',
      // Add other fields if needed
    };

    this.appointmentService.editAppointment(appointment.id, editDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.moveToPast(appointment, 'Completed');
        }
      },
      error: (err) => {
        console.error('Failed to confirm appointment:', err);
        alert('Could not confirm appointment. Please try again.');
      },
    });
  }

  /**
   * Cancel an appointment
   */
  appointmentRejected(appointment: Appointment): void {
    const editDto = {
      status: 'Cancelled',
      // Add other fields if needed
    };

    this.appointmentService.editAppointment(appointment.id, editDto).subscribe({
      next: (response) => {
        if (response.success) {
          this.moveToPast(appointment, 'Cancelled');
        }
      },
      error: (err) => {
        console.error('Failed to cancel appointment:', err);
        alert('Could not cancel appointment. Please try again.');
      },
    });
  }

  /**
   * Move appointment to past list with new status
   */
  private moveToPast(appointment: Appointment, status: string): void {
    // Remove from upcoming list
    this.upcomingAppointments = this.upcomingAppointments.filter(
      (a) => a.id !== appointment.id
    );

    // Add to past list
    this.pastAppointments.push({
      name: appointment.name,
      date: appointment.date,
      status: status,
    });
  }
}
