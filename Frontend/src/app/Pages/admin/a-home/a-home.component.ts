import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; // Corrected: Import FontAwesomeModule
import {
  faTrash, faCheckCircle, faTimesCircle, faSpinner, // For confirmation modal & general status icons
  faTachometerAlt, faCalendarCheck, faUsers, faDollarSign, faChartLine, faChartBar, // Dashboard icons
  faArrowUp, faArrowDown, // Trend icons
  faUser, // Generic user icon for doctors/patients in stats
  faExclamationTriangle // For warning/pending status
} from '@fortawesome/free-solid-svg-icons';

// Define the Appointment interface with a unique ID and specific statuses
interface Appointment {
  id: string; // Unique identifier for each appointment
  patient: string;
  doctor: string;
  date: Date;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'; // Strict statuses
}

// Interface for simplified Recent Activity display
interface RecentActivity {
  id: string; // ID of the related appointment
  icon: any; // Font Awesome Icon definition
  message: string;
  time: Date;
}


@Component({
  selector: 'app-a-home',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule], // Corrected: Use FontAwesomeModule here
  templateUrl: './a-home.component.html',
  styleUrls: ['./a-home.component.css']
})
export class AHomeComponent implements AfterViewInit {
  constructor(private routes: Router) {}

  // Font Awesome icons available in the template
  icons = {
    trash: faTrash,
    checkCircle: faCheckCircle,
    timesCircle: faTimesCircle,
    spinner: faSpinner,
    // Quick Stat icons
    appointments: faCalendarCheck,
    doctors: faUser, // Using faUser for Doctors in stats
    patients: faUsers,
    earnings: faDollarSign,
    // Chart type toggle icons
    chartLine: faChartLine,
    chartBar: faChartBar,
    // Trend icons
    arrowUp: faArrowUp,
    arrowDown: faArrowDown,
    // Status/Utility icons
    warning: faExclamationTriangle,
    info: faTimesCircle, // Example for other info activities
    success: faCheckCircle,
  };


  Navigator(nav: string) {
    this.routes.navigateByUrl(nav);
  }

  @ViewChild('appointmentChart') chartRef!: ElementRef<HTMLCanvasElement>;
  chart: Chart | undefined;
  currentDate = new Date();
  selectedRange = '7'; // Filter for chart and table
  selectedStatus = 'all'; // Filter for table
  appointmentSearch = ''; // Search for table
  sortColumn: keyof Appointment = 'date'; // Sort for table
  sortDirection: 'asc' | 'desc' = 'desc'; // Sort for table
  chartType: 'line' | 'bar' = 'line'; // Type of chart

  showAllActivities = false; // Controls visibility of all recent activities

  quickStats = [ // Hardcoded for now, but would be loaded from backend
    {
      title: 'Appointments',
      value: 120,
      bg: 'bg-primary',
      icon: this.icons.appointments,
      trend: 'up',
      change: 12.5
    },
    {
      title: 'Doctors',
      value: 24,
      bg: 'bg-success',
      icon: this.icons.doctors,
      trend: 'up',
      change: 4.3
    },
    {
      title: 'Patients',
      value: 450,
      bg: 'bg-info',
      icon: this.icons.patients,
      trend: 'up',
      change: 8.7
    },
    {
      title: 'Earnings',
      value: '$12,300',
      bg: 'bg-warning',
      icon: this.icons.earnings,
      trend: 'down',
      change: 2.1
    }
  ];

  appointmentChartData = { // Hardcoded for now, but would be loaded from backend
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

  // Mock data for all appointments
  allAppointments: Appointment[] = [
    { id: 'app001', patient: 'John Doe', doctor: 'Dr. Smith', date: new Date(Date.now() - 3600000), status: 'Confirmed' }, // 1 hour ago
    { id: 'app002', patient: 'Jane Doe', doctor: 'Dr. Jackson', date: new Date(Date.now() - 7200000), status: 'Pending' }, // 2 hours ago
    { id: 'app003', patient: 'Mary Johnson', doctor: 'Dr. Lee', date: new Date(Date.now() - 10800000), status: 'Completed' }, // 3 hours ago
    { id: 'app004', patient: 'James Brown', doctor: 'Dr. Smith', date: new Date(Date.now() - 86400000), status: 'Cancelled' }, // 1 day ago
    { id: 'app005', patient: 'Emily Davis', doctor: 'Dr. Green', date: new Date(Date.now() - 172800000), status: 'Confirmed' }, // 2 days ago
    { id: 'app006', patient: 'Michael Blue', doctor: 'Dr. White', date: new Date(Date.now() - 259200000), status: 'Pending' }, // 3 days ago
  ];

  // This array holds simplified activities to be displayed in the recent activities section
  recentAppointmentActivities: RecentActivity[] = [];

  // Data for the 'All Appointments' table, filtered and sorted
  filteredAppointments = [...this.allAppointments];

  // Custom confirmation modal properties for deletion
  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  confirmationAppointmentId: string | null = null;
  isSubmitting: boolean = false; // To show spinner on confirmation button


  ngAfterViewInit(): void {
    this.loadDashboardData(); // Load all data when view is initialized
    this.createChart(); // Create chart after data is loaded
  }

  /**
   * Central method to load all dashboard data.
   * In a real application, this would involve calling backend services.
   */
  loadDashboardData(): void {
    // Simulate data loading (currently using hardcoded data)
    // If these were dynamic, you'd fetch them here:
    // this.quickStats = fetchQuickStats();
    // this.appointmentChartData = fetchChartData();
    // this.allAppointments = fetchAllAppointments();

    this.generateRecentActivities(); // Regenerate recent activities based on current appointments
    this.filterAppointments(); // Reapply filters and sorting to the table
  }

  /**
   * Generates simplified recent activities from the allAppointments list.
   * This is where you'd map full appointment data to brief activity messages.
   */
  generateRecentActivities(): void {
    // Sort all appointments by date, newest first
    const sortedAppointments = [...this.allAppointments].sort((a, b) => b.date.getTime() - a.date.getTime());

    this.recentAppointmentActivities = sortedAppointments.map(app => {
      let message = '';
      let icon: any;
      switch (app.status) {
        case 'Confirmed':
          message = `${app.patient} confirmed appointment with ${app.doctor}.`;
          icon = this.icons.checkCircle;
          break;
        case 'Pending':
          message = `New pending appointment for ${app.patient} with ${app.doctor}.`;
          icon = this.icons.warning;
          break;
        case 'Completed':
          message = `Appointment completed for ${app.patient} with ${app.doctor}.`;
          icon = this.icons.checkCircle;
          break;
        case 'Cancelled':
          message = `Appointment cancelled by ${app.patient} with ${app.doctor}.`;
          icon = this.icons.timesCircle;
          break;
        default:
          message = `Activity for ${app.patient} with ${app.doctor}.`;
          icon = this.icons.info;
      }
      return { id: app.id, message, time: app.date, icon };
    });
  }

  /**
   * Controls which recent activities are visible (first 3 or all).
   * @returns An array of RecentActivity objects to display.
   */
  get visibleActivities(): RecentActivity[] {
    return this.showAllActivities ? this.recentAppointmentActivities : this.recentAppointmentActivities.slice(0, 3);
  }

  /**
   * Sets a flag to show all recent activities.
   */
  loadMoreActivities(): void {
    this.showAllActivities = true;
  }

  /**
   * Creates or updates the Chart.js instance.
   */
  createChart(): void {
    const ctx = this.chartRef.nativeElement.getContext('2d');
    if (ctx) {
      if (this.chart) {
        this.chart.destroy(); // Destroy existing chart instance if it exists
      }
      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: this.appointmentChartData,
        options: this.chartOptions
      });
    }
  }

  /**
   * Changes the type of the chart (line or bar) and recreates it.
   * @param type The desired chart type ('line' or 'bar').
   */
  changeChartType(type: 'line' | 'bar'): void {
    this.chartType = type;
    this.createChart(); // Recreate chart with new type
  }

  /**
   * Refreshes all dashboard data by calling loadDashboardData.
   * This is the method connected to your "Refresh Dashboard" button.
   */
  refreshDashboard(): void {
    console.log("Dashboard refreshed!");
    this.loadDashboardData(); // Re-load all data
    this.createChart(); // Recreate chart with potentially new data (if data was dynamic)
  }

  /**
   * Filters the main appointments table based on the selected date range.
   */
  updateDashboard(): void {
    console.log(`Filtering appointments for the last ${this.selectedRange} days`);
    this.filterAppointments(); // Just call filterAppointments, it will handle range
  }

  /**
   * Filters the main appointments table based on search text, status, and date range.
   */
  filterAppointments(): void {
    let tempAppointments = [...this.allAppointments];

    // Apply date range filter
    if (this.selectedRange !== 'all') {
      const filterDate = new Date();
      filterDate.setDate(filterDate.getDate() - Number(this.selectedRange));
      tempAppointments = tempAppointments.filter(appointment => {
        return new Date(appointment.date) >= filterDate;
      });
    }

    // Apply status and search filters
    this.filteredAppointments = tempAppointments.filter(appointment => {
      const statusMatch = this.selectedStatus === 'all' || appointment.status.toLowerCase() === this.selectedStatus.toLowerCase();
      const searchMatch = appointment.patient.toLowerCase().includes(this.appointmentSearch.toLowerCase()) ||
                           appointment.doctor.toLowerCase().includes(this.appointmentSearch.toLowerCase());
      return statusMatch && searchMatch;
    });

    // Reapply sorting after filtering
    this.sortAppointments(this.sortColumn, true); // Pass true to keep current sort direction
  }

  /**
   * Sorts the main appointments table.
   * @param column The column to sort by.
   * @param keepDirection Optional: if true, doesn't toggle sortDirection.
   */
  sortAppointments(column: keyof Appointment, keepDirection: boolean = false): void {
    if (this.sortColumn === column && !keepDirection) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortDirection = 'asc'; // Default to ascending if new column
    }
    this.sortColumn = column;

    this.filteredAppointments.sort((a, b) => {
      const aValue = a[this.sortColumn];
      const bValue = b[this.sortColumn];

      // Handle null/undefined for sorting (put them at end for ascending, beginning for descending)
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return this.sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return this.sortDirection === 'asc' ? -1 : 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (aValue instanceof Date && bValue instanceof Date) {
        return this.sortDirection === 'asc' ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime();
      }
      // Fallback for other types or if types don't match, or numerical sort
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      return 0;
    });
  }


  /**
   * Helper function to return Bootstrap class for status badges.
   * @param status The status string.
   * @returns CSS class string.
   */
  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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

  /**
   * Admin can view more details, typically by navigating to a dedicated page.
   * @param appointment The appointment object to view.
   */
  viewDetails(appointment: Appointment): void {
    console.log('Admin viewing details for appointment:', appointment);
    // In a real app, you would navigate to a detailed appointment view page:
    // this.routes.navigate(['/Admin/Appointment/details', appointment.id]);
  }

  /**
   * Handles the deletion of an appointment record from the dashboard.
   * @param appointmentId The ID of the appointment to delete.
   */
  deleteAppointment(appointmentId: string): void {
    this.showConfirmation(appointmentId, 'Are you sure you want to delete this appointment record? This action cannot be undone.');
  }

  /**
   * Shows the custom confirmation modal.
   * @param id The ID of the appointment to be deleted.
   * @param message The message to display in the confirmation modal.
   */
  showConfirmation(id: string, message: string): void {
    this.confirmationAppointmentId = id;
    this.confirmationMessage = message;
    this.showConfirmationModal = true;
  }

  /**
   * Hides the custom confirmation modal and resets its state.
   */
  hideConfirmation(): void {
    this.showConfirmationModal = false;
    this.confirmationAppointmentId = null;
    this.confirmationMessage = '';
  }

  /**
   * Performs the confirmed action (deletion in this case).
   * Simulates an API call and updates the UI.
   */
  performConfirmedAction(): void {
    if (this.confirmationAppointmentId === null) {
      this.hideConfirmation();
      return;
    }

    this.isSubmitting = true; // Show spinner on the confirmation button

    setTimeout(() => { // Simulate API call for deletion
      // Find and remove from the main allAppointments array
      this.allAppointments = this.allAppointments.filter(app => app.id !== this.confirmationAppointmentId);
      // Re-generate recent activities to reflect the deletion
      this.generateRecentActivities();
      // Re-filter and sort main table to update display
      this.filterAppointments();

      console.log(`Appointment record with ID ${this.confirmationAppointmentId} deleted.`);

      this.hideConfirmation(); // Hide the modal after action
      this.isSubmitting = false; // Hide spinner
    }, 500); // Simulate network delay
  }
}