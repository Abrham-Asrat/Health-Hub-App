// src/app/Pages/admin/a-setting/a-setting.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // For structural directives like *ngIf, *ngFor
import { FormsModule, NgForm } from '@angular/forms'; // For template-driven forms
// import { HttpClient } from '@angular/common/http'; // Uncomment if you add real backend calls later

// Font Awesome icons for the settings page
import {
  faCog,
  faUsers,
  faEnvelopeOpenText,
  faCreditCard,
  faBlog,
  faSpinner,
  faCheckCircle,
  faExclamationCircle,
  faSave,
  faGlobe,
  faLock,
  faBell,
  faCodeBranch // For version/build info
} from '@fortawesome/free-solid-svg-icons';
// CORRECTED: Import FontAwesomeModule instead of FaIconComponent
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; 

// --- INLINE INTERFACE: Defines the structure for our platform settings data ---
export interface PlatformSettings {
  general: {
    platformName: string;
    defaultLanguage: string;
    timezone: string;
    maintenanceMode: boolean;
    adminEmailForAlerts: string;
  };
  userAuth: {
    enableOTPOnLogin: boolean;
    otpValidityMinutes: number;
    minPasswordLength: number;
    doctorApprovalRequired: boolean; // Based on your 'Custom Login & SignUp w/ OTP' and doctor management
  };
  notifications: {
    enableEmailNotifications: boolean;
    enableSmsNotifications: boolean;
    appointmentReminderHours: number;
    paymentNotificationEnabled: boolean;
  };
  payments: {
    chapaApiKey: string;
    chapaSecretKey: string;
    defaultCurrency: string;
    platformFeePercentage: number;
    enableTestMode: boolean;
  };
  blog: {
    enableComments: boolean;
    commentsModerationRequired: boolean;
    postsPerPage: number;
    defaultPostStatus: 'draft' | 'pending' | 'published';
  };
}
// --- END INLINE INTERFACE ---

@Component({
  selector: 'app-admin-setting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Important for ngModel and ngSubmit
    FontAwesomeModule // CORRECTED: Use FontAwesomeModule here
  ],
  templateUrl: './a-setting.component.html',
  styleUrls: ['./a-setting.component.css']
})
export class ASettingComponent implements OnInit {

  // Current settings data (initialized with empty or default values)
  settings: PlatformSettings = {
    general: {
      platformName: '',
      defaultLanguage: 'English',
      timezone: 'Africa/Addis_Ababa',
      maintenanceMode: false,
      adminEmailForAlerts: ''
    },
    userAuth: {
      enableOTPOnLogin: true,
      otpValidityMinutes: 5,
      minPasswordLength: 8,
      doctorApprovalRequired: true
    },
    notifications: {
      enableEmailNotifications: true,
      enableSmsNotifications: false,
      appointmentReminderHours: 24,
      paymentNotificationEnabled: true
    },
    payments: {
      chapaApiKey: '',
      chapaSecretKey: '',
      defaultCurrency: 'ETB',
      platformFeePercentage: 2.5,
      enableTestMode: true
    },
    blog: {
      enableComments: true,
      commentsModerationRequired: true,
      postsPerPage: 10,
      defaultPostStatus: 'draft'
    }
  };

  // State variables for UI feedback
  isLoading: boolean = true;
  isSaving: boolean = false;
  saveSuccess: boolean = false;
  errorMessage: string | null = null;
  currentCategory: 'general' | 'userAuth' | 'notifications' | 'payments' | 'blog' = 'general';

  // Font Awesome icons mapping
  icons = {
    cog: faCog,
    users: faUsers,
    envelopeText: faEnvelopeOpenText,
    creditCard: faCreditCard,
    blog: faBlog,
    spinner: faSpinner,
    checkCircle: faCheckCircle,
    exclamationCircle: faExclamationCircle,
    save: faSave,
    globe: faGlobe,
    lock: faLock,
    bell: faBell,
    codeBranch: faCodeBranch
  };

  // In a real application, you would inject HttpClient:
  // constructor(private http: HttpClient) { }
  constructor() { } // Using mock data for now

  ngOnInit(): void {
    this.loadSettings();
  }

  // Simulates loading settings from a backend
  loadSettings(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // --- START: Mock Data Loading Simulation ---
    // In a real app, this would be an HTTP GET request:
    // this.http.get<PlatformSettings>('/api/admin/settings').subscribe({
    //   next: (data) => {
    //     this.settings = data;
    //     this.isLoading = false;
    //   },
    //   error: (err) => {
    //     this.errorMessage = 'Failed to load settings. Please try again.';
    //     this.isLoading = false;
    //     console.error('Error loading settings:', err);
    //   }
    // });

    // Mock data for immediate demonstration
    setTimeout(() => {
      this.settings = {
        general: {
          platformName: 'eHealth Ethiopia',
          defaultLanguage: 'Amharic',
          timezone: 'Africa/Addis_Ababa',
          maintenanceMode: false,
          adminEmailForAlerts: 'admin@ehealth.com'
        },
        userAuth: {
          enableOTPOnLogin: true,
          otpValidityMinutes: 10,
          minPasswordLength: 10,
          doctorApprovalRequired: true
        },
        notifications: {
          enableEmailNotifications: true,
          enableSmsNotifications: false,
          appointmentReminderHours: 48,
          paymentNotificationEnabled: true
        },
        payments: {
          chapaApiKey: 'mock_chapa_pk_test_xxxxxxxxxxxxxxxx',
          chapaSecretKey: 'mock_chapa_sk_test_yyyyyyyyyyyyyyyy',
          defaultCurrency: 'ETB',
          platformFeePercentage: 3.5,
          enableTestMode: true
        },
        blog: {
          enableComments: true,
          commentsModerationRequired: true,
          postsPerPage: 8,
          defaultPostStatus: 'published'
        }
      };
      this.isLoading = false;
      console.log('Settings loaded:', this.settings);
    }, 1500); // Simulate 1.5 seconds loading time
    // --- END: Mock Data Loading Simulation ---
  }

  // Handles saving settings to the backend
  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = 'Please fix validation errors before saving.';
      return;
    }

    this.isSaving = true;
    this.saveSuccess = false;
    this.errorMessage = null;

    // --- START: Mock Data Saving Simulation ---
    // In a real app, this would be an HTTP PUT/PATCH request:
    // this.http.put('/api/admin/settings', this.settings).subscribe({
    //   next: () => {
    //     this.isSaving = false;
    //     this.saveSuccess = true;
    //     console.log('Settings saved successfully:', this.settings);
    //     setTimeout(() => this.saveSuccess = false, 3000); // Hide success message after 3 seconds
    //   },
    //   error: (err) => {
    //     this.isSaving = false;
    //     this.errorMessage = 'Failed to save settings. Please try again.';
    //     console.error('Error saving settings:', err);
    //   }
    // });

    // Simulate saving delay and outcome
    setTimeout(() => {
      this.isSaving = false;
      this.saveSuccess = true;
      console.log('Settings saved successfully (mock):', this.settings);
      setTimeout(() => this.saveSuccess = false, 3000); // Hide success message
    }, 1000); // Simulate 1-second saving time
    // --- END: Mock Data Saving Simulation ---
  }

  // Changes the currently viewed settings category
  changeCategory(category: 'general' | 'userAuth' | 'notifications' | 'payments' | 'blog'): void {
    this.currentCategory = category;
    this.saveSuccess = false; // Hide success message when changing tabs
    this.errorMessage = null; // Clear error message when changing tabs
  }
}