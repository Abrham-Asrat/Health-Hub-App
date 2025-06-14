import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent {
  paymentData = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    amount: 0,
  };

  loading = false;
  message = '';

  constructor(private http: HttpClient) {}

  initiatePayment() {
    if (
      !this.paymentData.first_name ||
      !this.paymentData.last_name ||
      !this.paymentData.email ||
      !this.paymentData.phone_number ||
      !this.paymentData.amount
    ) {
      this.message = '⚠️ Please fill all fields.';
      return;
    }

    this.loading = true;
    this.message = '';

    this.http
      .post<{ checkout_url: string }>(
        'http://localhost:5000/api/payment',
        this.paymentData
      )
      .subscribe({
        next: (res) => {
          window.location.href = res.checkout_url; // Redirect to Chapa
        },
        error: (err) => {
          console.error(err);
          this.message = '❌ Payment failed. Please try again.';
          this.loading = false;
        },
      });
  }
}
