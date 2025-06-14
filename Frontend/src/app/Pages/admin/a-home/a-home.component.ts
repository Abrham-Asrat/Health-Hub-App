import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-a-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './a-home.component.html',
  styleUrls: ['./a-home.component.css']
})
export class AHomeComponent implements AfterViewInit {
  constructor(private routes: Router) {}

  Navigator(nav: string) {
    this.routes.navigateByUrl(nav);
  }

  @ViewChild('appointmentChart') chartRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;
  currentDate = new Date();
  selectedRange = '7';
  selectedStatus = 'all';
  appointmentSearch = '';
  sortColumn: keyof Appointment = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';
  chartType: 'line' | 'bar' = 'line';

  showAllActivities = false;

  quickStats = [
    {
      title: 'Appointments',
      value: 120,
      bg: 'bg-primary',
      icon: 'bi-calendar-check',
      trend: 'up',
      change: 12.5
    },
    {
      title: 'Doctors',
      value: 24,
      bg: 'bg-success',
      icon: 'bi-person-badge',
      trend: 'up',
      change: 4.3
    },
    {
      title: 'Patients',
      value: 450,
      bg: 'bg-info',
      icon: 'bi-people',
      trend: 'up',
      change: 8.7
    },
    {
      title: 'Earnings',
      value: '$12,300',
      bg: 'bg-warning',
      icon: 'bi-currency-dollar',
      trend: 'down',
      change: 2.1
    }
  ];

  appointmentChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Appointments',
        data: [50, 65, 80, 70, 95, 110],
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: true
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'nearest' as const,
        intersect: false
      }
    }
  };

  recentActivities = [
    { icon: 'bi-person-fill', message: 'John Doe confirmed an appointment', time: new Date() },
    { icon: 'bi-calendar-check', message: 'Appointment confirmed for Jane Doe', time: new Date() },
    { icon: 'bi-chat-left', message: 'New message from Dr. Smith', time: new Date() },
    { icon: 'bi-check-circle', message: 'Appointment with Dr. Jackson completed', time: new Date() }
  ];

  get visibleActivities() {
    return this.showAllActivities ? this.recentActivities : this.recentActivities.slice(0, 3);
  }

  allAppointments: Appointment[] = [
    { patient: 'John Doe', doctor: 'Dr. Smith', date: new Date(), status: 'Confirmed' },
    { patient: 'Jane Doe', doctor: 'Dr. Jackson', date: new Date(), status: 'Pending' },
    { patient: 'Mary Johnson', doctor: 'Dr. Lee', date: new Date(), status: 'Completed' },
    { patient: 'James Brown', doctor: 'Dr. Smith', date: new Date(), status: 'Cancelled' }
  ];

  filteredAppointments = [...this.allAppointments];

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: this.appointmentChartData,
        options: this.chartOptions
      });
    }
  }

  changeChartType(type: 'line' | 'bar'): void {
    this.chartType = type;
    if (this.chart) {
      this.chart.destroy();
    }
    this.createChart();
  }

  generateReport() {
    alert("Report generation started!");
  }

  refreshDashboard() {
    alert("Dashboard refreshed!");
  }


  updateDashboard(): void {
    console.log(`Filtering appointments for the last ${this.selectedRange} days`);
    const filterDate = new Date();
    filterDate.setDate(filterDate.getDate() - Number(this.selectedRange));
    this.filteredAppointments = this.allAppointments.filter(appointment => {
      return new Date(appointment.date) >= filterDate;
    });
    this.filterAppointments();
  }

  filterAppointments(): void {
    this.filteredAppointments = this.allAppointments.filter(appointment => {
      const statusMatch = this.selectedStatus === 'all' || appointment.status.toLowerCase() === this.selectedStatus;
      const searchMatch = appointment.patient.toLowerCase().includes(this.appointmentSearch.toLowerCase()) ||
        appointment.doctor.toLowerCase().includes(this.appointmentSearch.toLowerCase());
      return statusMatch && searchMatch;
    });

  }

  sortAppointments(column: keyof Appointment): void {
    this.sortColumn = column;
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.filteredAppointments.sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      return 0;
    });
  }

  loadMoreActivities(): void {
    this.showAllActivities = true;
  }


  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning text-dark';
      case 'completed':
        return 'badge bg-info text-dark';
      case 'cancelled':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  viewDetails(appointment: Appointment): void {
    console.log('Viewing details for:', appointment);
  }

  confirmAppointment(appointment: Appointment): void {
    appointment.status = 'Confirmed';  // Update status to 'Confirmed'
    this.filterAppointments();         // Reapply filters to update button visibility
  }

  cancelAppointment(appointment: Appointment): void {
    appointment.status = 'Cancelled';  // Update status to 'Cancelled'
    this.filterAppointments();         // Reapply filters to update button visibility
  }

}

interface Appointment {
  patient: string;
  doctor: string;
  date: Date;
  status: string;
}
