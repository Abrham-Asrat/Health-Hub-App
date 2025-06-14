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
  isPatient: boolean = true;
  toggle: string = 'Patient';
  loginToggler: string = 'Doctor';
  hider: boolean = true;

  loginData = {
    email: '',
    password: '',
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  hide() {
    this.hider = !this.hider;
  }

  toggleRole() {
    this.isPatient = !this.isPatient;
    this.toggle = this.isPatient ? 'Patient' : 'Doctor';
    this.loginToggler = this.isPatient ? 'Doctor' : 'Patient';
  }

  onSubmit() {
    if (!this.loginData.email || !this.loginData.password) {
      alert('Please enter both email and password.');
      return;
    }

    this.authService.login(this.loginData.email, this.loginData.password).subscribe({
      next: (response) => {
        console.log('✅ Login success:', response);
        console.log('Response:', response);
        
        // Close the login modal
        const loginModalEl = document.getElementById('LogInModal');
        const modalInstance = bootstrap.Modal.getInstance(loginModalEl);
        modalInstance?.hide();

        // Handle both response types
        const authData = response instanceof HttpResponse ? response.body : response;
        
        if (authData?.success && authData?.data?.auth0ProfileDto) {
          const profile = authData.data.auth0ProfileDto;
          console.log('Auth0 Profile:', profile);
          console.log('User role:', profile.role);
          
          if (profile.role?.toLowerCase() === 'doctor') {
            this.router.navigate(['/Doctor']);
          } else if (profile.role?.toLowerCase() === 'patient') {
            this.router.navigate(['/Patient']);
          } else {
            console.error('Unknown user role:', profile.role);
            alert('Invalid user role. Please contact support.');
          }
        } else {
          console.error('Invalid response structure:', response);
          alert('Login failed. Invalid response from server.');
        }
      },
      error: (error) => {
        console.error('❌ Login failed:', error);
        console.error('Error details:', error.error);
        if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Login failed. Please check your credentials and try again.');
        }
      }
    });
  }
}