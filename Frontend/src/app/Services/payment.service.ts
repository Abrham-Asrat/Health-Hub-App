import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  paymentUrl: string = 'api/payments';
  constructor(private http: HttpClient) { }
  private transferPaymentUrl = environment.apiUrl + `${this.paymentUrl}/transfer`;
  private chargePaymentUrl = environment.apiUrl + `${this.paymentUrl}/charge`;
  private chapaPaymentUrl = environment.apiUrl + `${this.paymentUrl}/chapa/webhook`;
  
  transferPayment(payment: any) {
    return this.http.post(this.transferPaymentUrl, payment);
  }
  chargePayment(payment: any) {
    return this.http.post(this.chargePaymentUrl, payment);
  }
  chapaPayment(payment: any) {
    return this.http.post(this.chapaPaymentUrl, payment);
  }
}
