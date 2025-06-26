import { Component, ViewChild, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // For navigation (logout, redirect)
import { FormsModule } from '@angular/forms'; // Required for ngModel
import { CommonModule } from '@angular/common'; // Required for structural directives like *ngIf
import { environment } from '../../../../environments/environment';

import { AuthService } from '../../../Services/auth.service';
import { ProfileService } from '../../../Services/profile.service';
import { ReviewService, ReviewDto, ApiResponse } from '../../../Services/review.service';
import { UserService } from '../../../Services/user.service';

// Import interfaces for type safety
import {
  Profile,
  Education,
  Availability,
  Experience,
  Review,
} from '../../models/profile.model';

// Add types for Doctor and Patient IDs and CV
interface DoctorProfile extends Profile {
  doctorId?: string;
  specialities?: string[];
  availabilities?: Availability[];
  qualifications?: string;
  biography?: string;
  doctorStatus?: string; // Ensure string type for backend
  cv?: {
    mimeType: string;
    fileDataBase64: string;
    fileName: string;
  };
  educations?: Education[];
  experiences?: Experience[];
}

interface PatientProfile extends Profile {
  patientId?: string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

/**
 * Main component for user profile management.
 * Handles:
 * - Dashboard view
 * - Password change
 * - Reviews display (for doctors)
 * - Profile picture upload
 * - Dynamic fields like Availabilities, Education, Experience
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  /**
   * Role input to determine Doctor/Patient-specific rendering
   * Default is 'Patient'
   */
  @Input() role: 'Doctor' | 'Patient' = 'Patient';

  /* ========== Password Change Fields ========== */
  oldPassword: string = '';
  newPassword: string = '';
  confirmNewPassword: string = '';
  passwordError: string = '';
  passwordSuccess: string = '';
  isChangingPassword: boolean = false;

  /* ========== UI State ========== */
  activeSection: string = 'dashboard'; // Track current section: dashboard | password | reviews
  profilePictureUrl: string | null = null; // Preview of uploaded image
  isLoading: boolean = false;
  updateSuccess: string = '';
  updateError: string = '';

  /* ========== Form Inputs ========== */
  @ViewChild('fileInput') fileInput!: any;

  profile: DoctorProfile & PatientProfile = {
    userId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    profilePicture: '',
    address: '',
    role: 'Patient',
    // doctorId, patientId, etc. will be set from backend
  };

  /* ========== Temporary form inputs for dynamic fields ========== */
  specialitiesInput: string = ''; // Temp field for comma-separated specialties
  availabilityInput: Availability = {
    day: '',
    startTime: '',
    endTime: '',
  };
  educationInput: Education = {
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
  };
  experienceInput: Experience = {
    institution: '',
    startDate: '',
    endDate: '',
    description: '',
  };

  /* ========== List of reviews (for Doctors only) ========== */
  reviews: Review[] = [];

  // Add a field for CV upload/update (for doctors)
  cvFile: File | null = null;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private reviewService: ReviewService,
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProfile(); // Load user data on init
  }

  /* ========== Section Switching Logic ========== */

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (section === 'reviews' && this.role === 'Doctor') {
      this.loadReviews();
    }
  }

  /* ========== Auth & Navigation Logic ========== */

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/Dashboard/Home']);
  }

  /* ========== File Upload Logic ========== */

  /* ========== Load User Data From API ========== */

  loadProfile(): void {
    this.isLoading = true;
    this.updateError = '';
    
    // Get current user ID from auth service
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.updateError = 'User not authenticated. Please login again.';
      this.router.navigate(['/Dashboard/Home']);
      return;
    }

    console.log('Loading profile for user ID:', currentUser.id);
    
    this.getProfileById(currentUser.id).subscribe({
      next: (response: any) => {
        console.log('Profile API Response:', response);
        if (response.success && response.data) {
          const profileData = response.data;
          this.profile = {
            userId: profileData.userId,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email || '',
            phone: profileData.phone || '',
            gender: profileData.gender || '',
            dateOfBirth: profileData.dateOfBirth || '',
            profilePicture: profileData.profilePicture || '',
            address: profileData.address || '',
            role: profileData.role,
            doctorId: profileData.doctorId || undefined,
            patientId: profileData.patientId || undefined,
            specialities: profileData.specialities || [],
            availabilities: profileData.availabilities || [],
            qualifications: profileData.qualifications || '',
            biography: profileData.biography || '',
            doctorStatus: profileData.doctorStatus ? String(profileData.doctorStatus) : '',
            cv: profileData.cv || undefined,
            educations: profileData.educations || [],
            experiences: profileData.experiences || [],
            medicalHistory: profileData.medicalHistory || '',
            emergencyContactName: profileData.emergencyContactName || '',
            emergencyContactPhone: profileData.emergencyContactPhone || '',
          };
          this.profilePictureUrl = this.profile.profilePicture;
          this.role = this.profile.role as 'Doctor' | 'Patient';
          if (this.role === 'Doctor') {
            this.specialitiesInput = this.profile.specialities?.join(', ') || '';
          }
          console.log('Profile loaded successfully:', this.profile);
        } else {
          this.updateError = response.message || 'Failed to load profile.';
          console.error('API returned error:', response.message);
        }
      },
      error: (err: any) => {
        console.error('Error loading profile:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message
        });
        if (err.status === 401) {
          this.updateError = 'Your session has expired. Please login again.';
          this.router.navigate(['/Dashboard/Home']);
        } else {
          this.updateError = err.error?.message || 'Failed to load profile. Please try again.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /* ========== Load Reviews for Doctor ========== */

  loadReviews(): void {
    if (!this.profile.userId) return;

    console.log('Loading reviews for doctor ID:', this.profile.userId);
    console.log('API URL will be:', `${environment.apiUrl}/api/reviews/doctor/${this.profile.userId}`);

    this.reviewService.getDoctorReviews(this.profile.userId).subscribe({
      next: (response: ApiResponse<ReviewDto[]>) => {
        console.log('Review API Response:', response);
        if (response.success && response.data) {
          this.reviews = response.data.map(reviewDto => ({
            id: reviewDto.reviewId,
            doctorId: reviewDto.doctorId,
            patientId: reviewDto.patientId,
            starRating: reviewDto.starRating,
            reviewText: reviewDto.reviewText,
            createdAt: reviewDto.createdAt,
            patient: {
              firstName: reviewDto.patient.firstName,
              lastName: reviewDto.patient.lastName,
              profilePicture: reviewDto.patient.profilePicture
            }
          }));
          console.log('Processed reviews:', this.reviews);
        } else {
          this.updateError = response.message || 'Failed to load reviews.';
          console.error('API returned error:', response.message);
        }
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        console.error('Error details:', {
          status: err.status,
          statusText: err.statusText,
          url: err.url,
          message: err.message
        });
        this.updateError = 'Failed to load reviews. Please try again.';
      }
    });
  }

  /* ========== Dynamic Field Management ========== */

  updateSpecialities(): void {
    this.profile.specialities = this.specialitiesInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  addAvailability(): void {
    if (
      this.availabilityInput.day &&
      this.availabilityInput.startTime &&
      this.availabilityInput.endTime
    ) {
      if (!this.profile.availabilities) {
        this.profile.availabilities = [];
      }
      this.profile.availabilities.push({ ...this.availabilityInput });
      this.availabilityInput = { day: '', startTime: '', endTime: '' };
    }
  }

  removeAvailability(index: number): void {
    if (this.profile.availabilities) {
      this.profile.availabilities.splice(index, 1);
    }
  }

  addEducation(): void {
    if (
      this.educationInput.degree &&
      this.educationInput.institution &&
      this.educationInput.startDate &&
      this.educationInput.endDate
    ) {
      if (!this.profile.educations) {
        this.profile.educations = [];
      }
      this.profile.educations.push({ ...this.educationInput });
      this.educationInput = {
        degree: '',
        institution: '',
        startDate: '',
        endDate: '',
      };
    }
  }

  removeEducation(index: number): void {
    if (this.profile.educations) {
      this.profile.educations.splice(index, 1);
    }
  }

  addExperience(): void {
    if (
      this.experienceInput.institution &&
      this.experienceInput.startDate &&
      this.experienceInput.endDate &&
      this.experienceInput.description
    ) {
      if (!this.profile.experiences) {
        this.profile.experiences = [];
      }
      this.profile.experiences.push({ ...this.experienceInput });
      this.experienceInput = {
        institution: '',
        startDate: '',
        endDate: '',
        description: '',
      };
    }
  }

  removeExperience(index: number): void {
    if (this.profile.experiences) {
      this.profile.experiences.splice(index, 1);
    }
  }

  /* ========== Save Profile Changes ========== */

  saveProfile(): void {
    this.isLoading = true;
    this.updateError = '';
    this.updateSuccess = '';

    // Update specialities from input if doctor
    if (this.role === 'Doctor') {
      this.profile.specialities = this.specialitiesInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    }

    const updatePayload: any = {
      userId: this.profile.userId,
      firstName: this.profile.firstName,
      lastName: this.profile.lastName,
      email: this.profile.email, // Allow email editing
      profilePicture: this.profile.profilePicture,
      phone: this.profile.phone,
      gender: this.profile.gender,
      dateOfBirth: this.profile.dateOfBirth,
      address: this.profile.address,
      ...(this.role === 'Patient' && {
        medicalHistory: this.profile.medicalHistory,
        emergencyContactName: this.profile.emergencyContactName,
        emergencyContactPhone: this.profile.emergencyContactPhone
      }),
      ...(this.role === 'Doctor' && {
        specialities: this.profile.specialities,
        availabilities: this.profile.availabilities,
        qualifications: this.profile.qualifications,
        biography: this.profile.biography,
        doctorStatus: this.profile.doctorStatus ? String(this.profile.doctorStatus) : '',
        cv: this.profile.cv,
        educations: this.profile.educations,
        experiences: this.profile.experiences
      })
    };

    this.profileService.updateProfile(updatePayload).subscribe({
      next: (response) => {
        if (response.success) {
          this.updateSuccess = 'Profile updated successfully!';
          this.loadProfile();
        } else {
          this.updateError = response.message || 'Failed to update profile';
        }
      },
      error: (err) => {
        console.error('Error saving profile:', err);
        if (err.status === 401) {
          this.updateError = 'Your session has expired. Please login again.';
          this.router.navigate(['/Dashboard/Home']);
        } else {
          this.updateError = err.error?.message || 'Failed to update profile. Please try again.';
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /* ========== Password Change Logic ========== */

  changePassword(): void {
    if (!this.oldPassword || !this.newPassword || !this.confirmNewPassword) {
      this.passwordError = 'All password fields are required.';
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    this.profileService
      .changePassword(this.oldPassword, this.newPassword, this.confirmNewPassword)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.passwordSuccess = response.message || 'Password changed successfully!';
            this.oldPassword = '';
            this.newPassword = '';
            this.confirmNewPassword = '';
          } else {
            this.passwordError = response.message || 'Failed to change password';
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.passwordError = 'Your session has expired. Please login again.';
            this.router.navigate(['/Dashboard/Home']);
          } else {
            this.passwordError = err.error?.message || 'Failed to change password. Please try again.';
          }
        },
        complete: () => {
          this.isChangingPassword = false;
        }
      });
  }

  /* ========== Helper Methods for Template ========== */

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0); // Returns array of filled stars
  }

  getEmptyStars(rating: number): number[] {
    return Array(5 - Math.floor(rating)).fill(0); // Returns array of empty stars
  }

  // Add a method to handle CV file selection (for doctors)
  onCvFileSelected(event: any): void {
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
      this.profile.cv = {
        mimeType: file.type,
        fileDataBase64: base64String.split(',')[1],
        fileName: file.name,
      };
    };
    reader.readAsDataURL(file);
  }

  // Add a method to get profile by id using UserService
  getProfileById(userId: string) {
    return this.userService.getUserProfile(userId);
  }

  // Add method to trigger file input click
  triggerFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.click();
    }
  }

  // Add method to handle profile picture file selection
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, and GIF images are allowed.');
      event.target.value = '';
      return;
    }
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.profile.profilePicture = base64String;
      this.profilePictureUrl = base64String;
    };
    reader.readAsDataURL(file);
  }
}
// This component handles user profile management, including viewing and editing profile details, changing passwords, and displaying reviews for doctors.
// It supports both Doctor and Patient roles, dynamically loading and saving user data from/to the backend API.