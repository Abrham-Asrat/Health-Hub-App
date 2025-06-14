import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NgIf } from '@angular/common';

declare var bootstrap: any;

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})
export class OTPComponent implements OnChanges {
  @Input() Logged: string = '';
  @Input() userEmail: string = '';

  currentRole: string = 'Doctor';
  otpData: string[] = ['', '', '', '', '', ''];
  email: string = '';
  otpControls = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];
  isVerifying: boolean = false;
  isSending: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Logged'] && changes['Logged'].currentValue) {
      this.currentRole = changes['Logged'].currentValue;
      this.cdr.detectChanges();
    }
  }

  onInput(event: any, index: number): void {
    const input = event.target;
    const value = input.value;

    if (value.length === 1 && index < this.otpControls.length - 1) {
      const nextInput = document.getElementById('otp' + (index + 1));
      if (nextInput) (nextInput as HTMLElement).focus();
    }

    this.otpData[index] = value;
    this.errorMessage = '';
  }

  onBackspace(event: any, index: number): void {
    if (!event.target.value && index > 0) {
      const prevInput = document.getElementById('otp' + (index - 1));
      if (prevInput) (prevInput as HTMLElement).focus();
    }

    this.otpData[index] = '';
    this.errorMessage = '';
  }

  sendOTP(): void {
    if (!this.userEmail && !this.email) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.isSending = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { email: this.userEmail || this.email };

    this.http.post(`${environment.apiUrl}/api/send-otp`, payload).subscribe({
      next: (res) => {
        console.log('📬 OTP Sent Successfully', res);
        this.successMessage = 'OTP has been sent to your email';
        const otpModalEl = document.getElementById('OtpModal');
        const otpModal = new bootstrap.Modal(otpModalEl);
        otpModal.show();
      },
      error: (err) => {
        console.error('❌ Failed to send OTP', err);
        this.errorMessage = err.error?.message || 'Failed to send OTP. Please try again.';
      },
      complete: () => {
        this.isSending = false;
      },
    });
  }

  verifyOTP(): void {
    const otp = this.otpData.join('');
    if (otp.length !== 6) {
      this.errorMessage = 'Please enter all 6 digits of the OTP';
      return;
    }

    this.isVerifying = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = { email: this.userEmail || this.email, otp };

    this.http.post(`${environment.apiUrl}/api/verify-otp`, payload).subscribe({
      next: (res: any) => {
        console.log('✅ OTP Verified', res);
        this.successMessage = 'OTP verified successfully!';

        const otpModalEl = document.getElementById('OtpModal');
        const otpModal = bootstrap.Modal.getInstance(otpModalEl);
        otpModal?.hide();

        setTimeout(() => {
          const verifyModalEl = document.getElementById('verifyModal');
          const verifyModal = new bootstrap.Modal(verifyModalEl);
          verifyModal.show();
        }, 300);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Invalid OTP. Please try again.';
        console.error('❌ OTP Verification Failed', err);
      },
      complete: () => {
        this.isVerifying = false;
      },
    });
  }

  onSubmit(): void {
    this.verifyOTP();
  }

  navigatePage(): void {
    const modal = document.getElementById('verifyModal');
    if (modal) {
      modal.classList.remove('show');
      (modal as any).style.display = 'none';
    }

    document.body.classList.remove('modal-open');
    const backdrop = document.querySelector('.modal-backdrop');
    backdrop?.remove();

    setTimeout(() => {
      this.router.navigate([this.currentRole]);
    }, 500);
  }

  backToLogin(): void {
    const otpModalEl = document.getElementById('OtpModal');
    const otpModal = bootstrap.Modal.getInstance(otpModalEl);
    otpModal?.hide();

    setTimeout(() => {
      const loginModalEl = document.getElementById('LogInModal');
      const loginModal = new bootstrap.Modal(loginModalEl);
      loginModal.show();
    }, 300);
  }

  resendOTP(): void {
    this.otpData = ['', '', '', '', '', ''];
    this.sendOTP();
  }
}
