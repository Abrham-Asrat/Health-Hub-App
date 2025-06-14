import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../Services/user.service';

// Import external model
import { SignUpForm } from '../../models/signUp.model';

declare var bootstrap: any;

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
})
export class SignUpComponent implements OnInit {
  isDoctor!: boolean;
  SignToggler!: string;
  signUpToggler!: string;
  hider: boolean = true;
  hiderC: boolean = true;

  signUpData: SignUpForm = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    role: 'Patient',

    medicalHistory: '',
    emergencyContactName: '',
    emergencyContactPhone: '',

    specialities: [],
    availabilities: [],
    qualifications: '',
    biography: '',
    doctorStatus: 0,
    cv: {
      mimeType: '',
      fileDataBase64: '',
      fileName: '',
    },
    onlineAppointmentFee: 0,
    inPersonAppointmentFee: 0,
    educations: [],
    experiences: [],

    termsAccepted: false,
  };
  selectedCVFile: File | null = null;
  isSubmitting: boolean = false;

  constructor(
    private http: HttpClient, 
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isDoctor = false;
    this.SignToggler = 'Patient';
    this.signUpToggler = 'Doctor';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF or Word documents are allowed.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.signUpData.cv = {
        mimeType: file.type,
        fileDataBase64: base64String.split(',')[1],
        fileName: file.name,
      };
    };
    reader.readAsDataURL(file);
  }

  validatePasswords(): boolean {
    if (this.signUpData.password !== this.signUpData.confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }
    if (this.signUpData.password.length < 8) {
      alert('Password must be at least 8 characters long!');
      return false;
    }
    return true;
  }

  validatePositiveNumber(event: any): void {
    const input = event.target;
    let value = parseFloat(input.value);

    if (value < 0 || isNaN(value)) {
      input.value = '0';
      if (input.name === 'onlineAppointmentFee') {
        this.signUpData.onlineAppointmentFee = 0;
      } else if (input.name === 'inPersonAppointmentFee') {
        this.signUpData.inPersonAppointmentFee = 0;
      }
    }
  }

  signUpChanger(toggler: boolean): void {
    this.isDoctor = toggler;
    this.SignToggler = this.isDoctor ? 'Doctor' : 'Patient';
    this.signUpToggler = this.isDoctor ? 'Patient' : 'Doctor';
  }

  addAvailability(): void {
    if (!this.signUpData.availabilities) this.signUpData.availabilities = [];
    this.signUpData.availabilities.push({
      day: '',
      startTime: '',
      endTime: '',
    });
  }

  removeAvailability(index: number): void {
    if (
      this.signUpData.availabilities &&
      this.signUpData.availabilities.length > index
    ) {
      this.signUpData.availabilities.splice(index, 1);
    }
  }

  addEducation(): void {
    if (!this.signUpData.educations) this.signUpData.educations = [];
    this.signUpData.educations.push({
      degree: '',
      institution: '',
      startDate: '',
      endDate: '',
    });
  }

  addExperience(): void {
    if (!this.signUpData.experiences) this.signUpData.experiences = [];
    this.signUpData.experiences.push({
      institution: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  }
  onSignUp(): void {
    if (!this.validatePasswords()) return;
    if (!this.signUpData.termsAccepted) {
      alert('Please accept the terms and conditions');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(this.signUpData.dateOfBirth)) {
      alert('Please enter date of birth in YYYY-MM-DD format');
      return;
    }

    this.signUpData.role = this.isDoctor ? 'Doctor' : 'Patient';

    const payload = {
      firstName: this.signUpData.firstName,
      lastName: this.signUpData.lastName,
      email: this.signUpData.email,
      password: this.signUpData.password,
      phone: this.signUpData.phone,
      gender: this.signUpData.gender,
      dateOfBirth: this.signUpData.dateOfBirth,
      address: this.signUpData.address,
      role: this.signUpData.role,
    };

    // Add role-specific fields
    if (this.isDoctor) {
      // Doctor-specific fields
      Object.assign(payload, {
        specialities: this.signUpData.specialities,
        availabilities: this.signUpData.availabilities,
        qualifications: this.signUpData.qualifications,
        biography: this.signUpData.biography,
        doctorStatus: this.signUpData.doctorStatus,
        cv: this.signUpData.cv,
        onlineAppointmentFee: Number(this.signUpData.onlineAppointmentFee),
        inPersonAppointmentFee: Number(this.signUpData.inPersonAppointmentFee),
        educations: this.signUpData.educations,
        experiences: this.signUpData.experiences
      });
    } else {
      // Patient-specific fields
      Object.assign(payload, {
        medicalHistory: this.signUpData.medicalHistory,
        emergencyContactName: this.signUpData.emergencyContactName,
        emergencyContactPhone: this.signUpData.emergencyContactPhone,
      });
    }

    this.isSubmitting = true;
    console.log('Sending registration payload:', JSON.stringify(payload, null, 2));
    
    this.userService.registerUser(payload).subscribe({
      next: (response) => {
        console.log('✅ Signup success:', response);

        const signupModalEl = document.getElementById('SignUpModal');
        const modalInstance = bootstrap.Modal.getInstance(signupModalEl);
        modalInstance?.hide();

       
        
        // Navigate to role-specific dashboard
        if (this.signUpData.role.toLowerCase() === 'doctor') {
          this.router.navigate(['/Doctor']);
        } else {
          this.router.navigate(['/Patient']);
        }
        
        this.isSubmitting = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('❌ Signup failed:', error);
        if (error.error?.errors) {
          const messages = Object.keys(error.error.errors)
            .map((key) => `${key}: ${error.error.errors[key].join(', ')}`)
            .join('\n');
          alert(`Validation Errors:\n${messages}`);
        } else if (error.error?.message) {
          alert(error.error.message);
        } else {
          alert('Registration failed. Please try again.');
        }
      },
    });
  }

  hide(): void {
    this.hider = !this.hider;
  }
  
  hiderConfrim(): void {
    this.hiderC = !this.hiderC;
  }
}
