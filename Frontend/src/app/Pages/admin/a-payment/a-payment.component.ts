import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// CORRECTED: Import FontAwesomeModule instead of FaIconComponent
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faWallet, faHourglassHalf, faCheckCircle, faTimesCircle, faArrowUp, faArrowDown, // Summary cards
  faCalendarAlt, faUserMd, faUserInjured, faDollarSign, faInfoCircle, // Table headers/details
  faSearch, faFilter, // Filter bar
  faThumbsUp, faThumbsDown, faEye, faPaperPlane, faSpinner, // Action buttons
  faSortAlphaDown, faSortAlphaUp, // Sorting icons
  faCircleCheck, faCircleXmark // For confirmation modal icons
} from '@fortawesome/free-solid-svg-icons';

interface Payment {
  id: number;
  paymentDate: string;
  doctor: string;
  patient: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Rejected';
  transactionId?: string; // Optional: unique transaction ID from payment gateway
}

@Component({
  selector: 'app-a-payment',
  standalone: true,
  // CORRECTED: Use FontAwesomeModule instead of FaIconComponent
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './a-payment.component.html',
  styleUrls: ['./a-payment.component.css']
})
export class APaymentComponent implements OnInit {
  payments: Payment[] = [
    { id: 1, paymentDate: '2025-05-15', doctor: 'Dr. John Doe', patient: 'Jane Smith', amount: 500, status: 'Pending', transactionId: 'TXN12345' },
    { id: 2, paymentDate: '2025-05-14', doctor: 'Dr. Emily Clark', patient: 'Michael Brown', amount: 750, status: 'Paid', transactionId: 'TXN12344' },
    { id: 3, paymentDate: '2025-05-13', doctor: 'Dr. Ahmed Ali', patient: 'Sara Yilma', amount: 600, status: 'Rejected', transactionId: 'TXN12343' },
    { id: 4, paymentDate: '2025-05-12', doctor: 'Dr. Jane Foster', patient: 'David Lee', amount: 450, status: 'Paid', transactionId: 'TXN12342' },
    { id: 5, paymentDate: '2025-05-11', doctor: 'Dr. Alex Kim', patient: 'Olivia Wilson', amount: 800, status: 'Pending', transactionId: 'TXN12341' },
    { id: 6, paymentDate: '2025-05-10', doctor: 'Dr. John Doe', patient: 'Sophia Martinez', amount: 300, status: 'Paid', transactionId: 'TXN12340' },
  ];

  filteredPayments: Payment[] = [];
  searchTerm = '';
  selectedStatus = '';

  totalRevenue = 0;
  totalPendingCount = 0; // Renamed to avoid confusion with totalPaid
  totalPaidCount = 0;
  todayTransactionsCount = 0; // Renamed for clarity

  // For custom confirmation modal
  showConfirmationModal: boolean = false;
  confirmationMessage: string = '';
  confirmationType: 'approve' | 'reject' | 'view' | 'payout' | '' = '';
  targetPayment: Payment | null = null;
  isSubmitting: boolean = false; // For loading state on buttons

  // Font Awesome icons
  icons = {
    wallet: faWallet,
    pending: faHourglassHalf,
    paid: faCheckCircle,
    today: faCalendarAlt,
    search: faSearch,
    filter: faFilter,
    date: faCalendarAlt,
    doctor: faUserMd,
    patient: faUserInjured,
    amount: faDollarSign,
    statusInfo: faInfoCircle,
    thumbsUp: faThumbsUp,
    thumbsDown: faThumbsDown,
    eye: faEye,
    paperPlane: faPaperPlane,
    spinner: faSpinner,
    sortAlphaDown: faSortAlphaDown,
    sortAlphaUp: faSortAlphaUp,
    circleCheck: faCircleCheck,
    circleXmark: faCircleXmark
  };


  ngOnInit(): void {
    this.sortPaymentsByDate('paymentDate', 'desc'); // Initial sort by date, newest first
    this.calculateSummary();
    this.applyFilter();
  }

  sortPaymentsByDate(column: keyof Payment, direction: 'asc' | 'desc'): void {
    this.payments.sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    this.applyFilter(); // Reapply filter after sorting the base array
  }


  calculateSummary(): void {
    // Get today's date in YYYY-MM-DD format based on the current context (June 24, 2025 EAT)
    const today = new Date('2025-06-24').toISOString().split('T')[0];

    this.totalRevenue = this.payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    this.totalPendingCount = this.payments.filter(p => p.status === 'Pending').length;
    this.totalPaidCount = this.payments.filter(p => p.status === 'Paid').length;
    this.todayTransactionsCount = this.payments.filter(p => p.paymentDate === today).length;
  }

  applyFilter(): void {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesSearch = payment.doctor.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        payment.patient.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus ? payment.status === this.selectedStatus : true;
      return matchesSearch && matchesStatus;
    });
  }

  // --- Custom Confirmation Modal Logic ---
  showConfirmation(type: 'approve' | 'reject' | 'view' | 'payout', payment?: Payment): void {
    this.confirmationType = type;
    this.targetPayment = payment || null; // Set the target payment for actions

    switch (type) {
      case 'approve':
        this.confirmationMessage = `Are you sure you want to approve ${payment!.patient}'s payment of ETB ${payment!.amount}?`;
        break;
      case 'reject':
        this.confirmationMessage = `Are you sure you want to reject ${payment!.patient}'s payment of ETB ${payment!.amount}?`;
        break;
      case 'view':
        this.confirmationMessage = `Detailed history for Payment ID: ${payment!.id}\nPatient: ${payment!.patient}\nDoctor: ${payment!.doctor}\nAmount: ETB ${payment!.amount}\nStatus: ${payment!.status}\nTransaction ID: ${payment!.transactionId || 'N/A'}`;
        break;
      case 'payout':
        this.confirmationMessage = 'Are you sure you want to initiate a Telebirr payout? This action will trigger a bulk payout process for all eligible doctors.';
        break;
    }
    this.showConfirmationModal = true;
  }

  hideConfirmation(): void {
    this.showConfirmationModal = false;
    this.confirmationMessage = '';
    this.confirmationType = '';
    this.targetPayment = null;
    this.isSubmitting = false; // Reset spinner
  }

  performConfirmedAction(): void {
    this.isSubmitting = true; // Start spinner

    setTimeout(() => { // Simulate API call
      if (this.confirmationType === 'approve' && this.targetPayment && this.targetPayment.status === 'Pending') {
        this.targetPayment.status = 'Paid';
        console.log(`Payment ${this.targetPayment.id} approved.`);
      } else if (this.confirmationType === 'reject' && this.targetPayment && this.targetPayment.status === 'Pending') {
        this.targetPayment.status = 'Rejected';
        console.log(`Payment ${this.targetPayment.id} rejected.`);
      } else if (this.confirmationType === 'payout') {
        console.log('Initiating Telebirr payout process...');
        // In a real app, this would be an API call to a payout service
      }
      // For 'view', no state change needed after confirmation

      this.calculateSummary(); // Recalculate summary after action
      this.applyFilter(); // Reapply filters to update table

      this.isSubmitting = false; // Stop spinner
      this.hideConfirmation(); // Close modal
    }, 800); // Simulate network delay
  }

  // >>> ADD THIS NEW METHOD <<<
  getConfirmationButtonLabel(): string {
    if (this.isSubmitting) {
      return 'Processing...';
    }
    switch (this.confirmationType) {
      case 'approve': return 'Approve Payment';
      case 'reject': return 'Reject Payment';
      case 'payout': return 'Confirm Payout';
      case 'view': return 'Close'; // This case might not be reached for the 'primary' button, but good for completeness
      default: return 'Confirm';
    }
  }
}