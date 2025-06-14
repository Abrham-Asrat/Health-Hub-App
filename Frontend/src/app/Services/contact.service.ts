import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    // Ensure the phone number is at least 10 digits
    if (cleaned.length < 10) {
      throw new Error('Phone number must be at least 10 digits');
    }
    // Format as international format
    return `+${cleaned}`;
  }

  // Submit contact form
  submitContactForm(formData: ContactFormData): Observable<any> {
    const formattedData = {
      ...formData,
      phone: this.formatPhoneNumber(formData.phone)
    };
    return this.http.post(`${this.apiUrl}/api/contact`, formattedData);
  }

  // Get contact information
  getContactInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/contact/info`);
  }
}
