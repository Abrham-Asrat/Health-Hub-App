import { Component } from '@angular/core';

@Component({
  selector: 'app-payment-success',
  template: `
    <div class="payment-status">
      <h2>Payment Successful!</h2>
      <p>Thank you for your payment.</p>
      <a routerLink="/">Return to Home</a>
    </div>
  `,
  styles: [
    `
      .payment-status {
        text-align: center;
        margin-top: 50px;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
    `,
  ],
})
export class PaymentSuccessComponent {}
