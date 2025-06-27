import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';
import { HttpResponse } from '@angular/common/http';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
})
export class LoginComponent {
  hider: boolean = true;
  isSubmitting: boolean = false;

  loginData = {
    email: '',
    password: '',
  };

  constructor(private authService: AuthService, private router: Router) {}

  hide() {
    this.hider = !this.hider;
  }

  onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter both email and password.');
      return;
    }
    this.isSubmitting = true;
    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        // Close the login modal
        const loginModalEl = document.getElementById('LogInModal');
        const modalInstance = bootstrap.Modal.getInstance(loginModalEl);
        modalInstance?.hide();

        // Handle both response types
        const authData = response instanceof HttpResponse ? response.body : response;
        if (authData?.success && authData?.data?.auth0ProfileDto) {
          const profile = authData.data.auth0ProfileDto;
          // Save user info to localStorage
          localStorage.setItem('user', JSON.stringify(profile));
          if (profile.role?.toLowerCase() === 'doctor') {
            this.router.navigate(['/Doctor']);
          } else if (profile.role?.toLowerCase() === 'patient') {
            this.router.navigate(['/Patient']);
          } else if (profile.role?.toLowerCase() === 'admin') {
            this.router.navigate(['/Admin']);
            
          } else {
            console.error('Unknown user role:', profile.role);
            alert('Invalid user role. Please contact support.');
          }
        } else {
          console.error('Invalid response structure:', response);
          alert('Login failed. Invalid response from server.');
        }
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('❌ Login failed:', error);
        console.error('Error details:', error.error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
      },
    });
  }
}