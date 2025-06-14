import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Payment {
  id: number;
  paymentDate: string;
  doctor: string;
  patient: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Rejected';
}

@Component({
  selector: 'app-a-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './a-payment.component.html',
  styleUrls: ['./a-payment.component.css']
})
export class APaymentComponent implements OnInit {
  payments: Payment[] = [
    { id: 1, paymentDate: '2025-05-15', doctor: 'Dr. John Doe', patient: 'Jane Smith', amount: 500, status: 'Pending' },
    { id: 2, paymentDate: '2025-05-14', doctor: 'Dr. Emily Clark', patient: 'Michael Brown', amount: 750, status: 'Paid' },
    { id: 3, paymentDate: '2025-05-13', doctor: 'Dr. Ahmed Ali', patient: 'Sara Yilma', amount: 600, status: 'Rejected' },
  ];

  filteredPayments: Payment[] = [];
  searchTerm = '';
  selectedStatus = '';

  totalRevenue = 0;
  totalPending = 0;
  totalPaid = 0;
  todayTransactions = 0;

  ngOnInit(): void {
    this.sortPaymentsByDate();
    this.calculateSummary();
    this.applyFilter();
  }

  sortPaymentsByDate(): void {
    this.payments.sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));
  }

  calculateSummary(): void {
    const today = new Date().toISOString().split('T')[0];
    this.totalRevenue = this.payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0);
    this.totalPending = this.payments.filter(p => p.status === 'Pending').length;
    this.totalPaid = this.payments.filter(p => p.status === 'Paid').length;
    this.todayTransactions = this.payments.filter(p => p.paymentDate === today).length;
  }

  applyFilter(): void {
    this.filteredPayments = this.payments.filter(payment => {
      const matchesSearch = payment.doctor.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                            payment.patient.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus ? payment.status === this.selectedStatus : true;
      return matchesSearch && matchesStatus;
    });
  }

  approvePayment(payment: Payment): void {
    if (payment.status !== 'Pending') return;
    if (confirm(`Are you sure you want to approve ${payment.patient}'s payment?`)) {
      payment.status = 'Paid';
      this.calculateSummary();
      this.applyFilter();
    }
  }

  rejectPayment(payment: Payment): void {
    if (payment.status !== 'Pending') return;
    if (confirm(`Are you sure you want to reject ${payment.patient}'s payment?`)) {
      payment.status = 'Rejected';
      this.calculateSummary();
      this.applyFilter();
    }
  }

  viewPaymentHistory(payment: Payment): void {
    alert(`Viewing history for ${payment.patient}`);
  }

  initiateTelebirrPayout(): void {
    alert('Initiating manual Telebirr payout... (integrate API call here)');
  }
}