import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-a-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './a-profile.component.html',
  styleUrls: ['./a-profile.component.css']
})
export class AProfileComponent implements OnInit {
  activeTab: string = 'profile';
  profileImage: string | ArrayBuffer | null = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      firstName: ['John', Validators.required],
      lastName: ['Doe', Validators.required],
      email: ['john.doe@example.com', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => this.profileImage = e.target?.result as string;
      reader.readAsDataURL(file);
    }
  }

  getInitials(): string {
    const firstName = this.profileForm.value.firstName || '';
    const lastName = this.profileForm.value.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      console.log('Profile updated:', this.profileForm.value);
      alert('Profile updated successfully!');
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      console.log('Password changed');
      alert('Password updated successfully!');
      this.passwordForm.reset();
    }
  }

  resetProfileForm(): void {
    this.profileForm.reset({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    });
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
  }

  logout(): void {
    alert('Logged out successfully!');
  }
}