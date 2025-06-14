import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Appointment {
  id: number;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
  notes?: string;
}

@Component({
  selector: 'a-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './a-appointment.component.html',
  styleUrls: ['./a-appointment.component.css']
})
export class AAppointmentComponent implements OnInit {
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];

  searchText: string = '';
  selectedStatus: string = '';

  ngOnInit(): void {
    // Replace with API call
    this.appointments = [
      { id: 1, patientName: 'John Doe', doctorName: 'Dr. Smith', date: '2025-05-17', time: '10:00 AM', status: 'Pending' },
      { id: 2, patientName: 'Sarah Lee', doctorName: 'Dr. Emma', date: '2025-05-18', time: '11:30 AM', status: 'Confirmed' },
      { id: 3, patientName: 'Ali Hassan', doctorName: 'Dr. Omar', date: '2025-05-18', time: '2:00 PM', status: 'Cancelled' },
    ];
    this.filterAppointments();
  }

  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter(app => {
      const matchesSearch = this.searchText.trim().length === 0 ||
        app.patientName.toLowerCase().includes(this.searchText.toLowerCase()) ||
        app.doctorName.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesStatus = this.selectedStatus === '' || app.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  changeStatus(app: Appointment, newStatus: Appointment['status']) {
    app.status = newStatus;
    // TODO: send updated status to backend
  }

  deleteAppointment(id: number) {
    this.appointments = this.appointments.filter(app => app.id !== id);
    this.filterAppointments();
    // TODO: call API to delete
  }
}