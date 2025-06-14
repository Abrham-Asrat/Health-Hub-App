import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService, ContactFormData } from '../../../Services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  messageDelivered: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  contactInfo = {
    phone: '',
    email: '',
    alternatePhone: '',
    alternateEmail: ''
  };

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContactInfo();
  }

  loadContactInfo(): void {
    this.contactService.getContactInfo().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.contactInfo = response.data;
        }
      },
      error: (err) => {
        console.error('Error loading contact info:', err);
        // Set default values if API fails
        this.contactInfo = {
          phone: '+1 (555) 123-4567',
          email: 'contact@healthhub.com',
          alternatePhone: '+1 (555) 987-6543',
          alternateEmail: 'support@healthhub.com'
        };
      }
    });
  }

  onSubmit(formData: ContactFormData): void {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      this.contactService.submitContactForm(formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.messageDelivered = true;
            // Reset form after successful submission
            setTimeout(() => {
              this.messageDelivered = false;
            }, 3000);
          } else {
            this.errorMessage = response.message || 'Failed to send message. Please try again.';
          }
        },
        error: (err) => {
          console.error('Error submitting contact form:', err);
          if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else if (err.message) {
            this.errorMessage = err.message;
          } else {
            this.errorMessage = 'Failed to send message. Please try again later.';
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } catch (error: any) {
      this.isLoading = false;
      this.errorMessage = error.message || 'Invalid phone number format. Please enter a valid phone number.';
    }
  }
}