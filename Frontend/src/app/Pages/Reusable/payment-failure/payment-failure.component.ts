import { Component } from '@angular/core';


@Component({
  selector: 'app-payment-failure',
  template: `
    <div class="payment-status">
      <h2>Payment Failed</h2>
      <p>Something went wrong. Please try again.</p>
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
    `
  ]
})
export class PaymentFailureComponent {}