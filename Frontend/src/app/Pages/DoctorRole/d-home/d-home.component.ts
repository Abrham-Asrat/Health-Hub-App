import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActiveTabService } from '../../shared/active-tab.service';

@Component({
  selector: 'app-d-home',
  imports: [NgFor, NgIf],
  templateUrl: './d-home.component.html',
  styleUrl: './d-home.component.css',
})
export class DHomeComponent {
  // Welcome message
  constructor(
    private route: Router,
    private activeTabService: ActiveTabService
  ) {}
  welcomeMessage = 'Welcome, Dr. Stephen';
  subMessage = 'Have a nice day at great work';

  // Statistics cards data
  statsData = [
    {
      icon: '📅',
      value: '24.4k',
      label: 'Appointments',
      color: 'rgb(114, 114, 174)',
    },
    {
      icon: '👥',
      value: '166.3k',
      label: 'Total Patients',
      color: 'rgb(168, 45, 43)',
    },
    {
      icon: '🏥',
      value: '53.5k',
      label: 'Clinic Consulting',
      color: 'rgb(225, 209, 35)',
    },
  
  ];

  // Appointment requests data
  appointmentRequests = [
    {
      name: 'Bogdan Krivenchenko',
      details: '45 Male, 12 April 9:30',
      status: 'Declined',
    },
    {
      name: 'Jenny Wilson',
      details: 'Female, 25 April 10:30 AM',
      status: 'Confirmed',
    },
    {
      name: 'Dianne Russel',
      details: 'Male, 45 Today 14:30 PM',
      status: 'Confirmed',
    },
    {
      name: 'Annette Black',
      details: 'Male, 45 Today 14:30 PM',
      status: 'Declined',
    },
    {
      name: 'Angelina Jullu',
      details: 'Male, 45 Today 14:30 PM',
      status: 'Confirmed',
    },
    {
      name: 'Esther Howard',
      details: 'Male, 45 Today 14:30 PM',
      status: 'Confirmed',
    },
    {
      name: 'Robert Fox',
      details: 'Male, 45 Today 14:30 PM',
      status: 'Confirmed',
    },
  ];

  // Patients data
  patients = [
    {
      name: 'Jhon Smith',
      time: '9:00',

      type: 'Clinic Consulting',
    },
    {
      name: 'Frank Murray',
      time: '10:25',
      type: 'Video Consulting',
    },
    {
      name: 'Ella Lucia',
      time: '11:30',
      type: 'Emergency',
    },
    {
      name: 'Alyssa Dehn',
      time: '12:20',
      type: 'Clinic Consulting',
    },
  ];

  // Gender statistics
  genderStats = [
    { label: 'Male', value: 45, color: '#673AB7' }, // Purple
    { label: 'Female', value: 30, color: '#FFEB3B' }, // Yellow
    { label: 'Child', value: 25, color: '#2196F3' }, // Blue
  ];

  // Recent patients data
  recentPatients = [
    {
      name: 'Deveon Lane',
      visitId: 'OPD-2345',
      date: '5/7/21',
      gender: 'Male',
      disease: 'Diabetes',
      status: 'Out-Patient',
    },
    {
      name: 'Albert Flores',
      visitId: 'IPD-2424',
      date: '5/7/21',
      gender: 'Male',
      disease: 'Diabetes',
      status: 'Out-Patient',
    },
    {
      name: 'Ella Lucia',
      visitId: 'OPD-2345',
      date: '8/15/21',
      gender: 'Male',
      disease: 'Diabetes',
      status: 'Out-Patient',
    },
    {
      name: 'Albert Flores',
      visitId: 'IPD-2424',
      date: '8/30/21',
      gender: 'Male',
      disease: 'Diabetes',
      status: 'Out-Patient',
    },
  ];

  getStatusColor(status: string): string {
    switch (status) {
      case 'Declined':
        return '#f44336'; // Red
      case 'Confirmed':
        return '#2196f3'; // Blue
      default:
        return '#ccc'; // Gray (default color)
    }
  }

  appointmentPage() {
    setTimeout(() => {
      this.activeTabService.setActiveTab('Appointment');
      this.route.navigate(['Doctor/Appointment']);
    }, 300);
  }
}
