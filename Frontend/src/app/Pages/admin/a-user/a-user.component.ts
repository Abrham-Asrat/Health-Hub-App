// src/app/Pages/admin/a-user/a-user.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// CORRECTED: Import FontAwesomeModule instead of FaIconComponent
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'; 
import {
  faUser, faUserMd, faUserInjured, faPlus, faEdit, faTrash, faToggleOn, faToggleOff,
  faSearch, faSortAlphaDown, faSortAlphaUp, faCheckCircle, faTimesCircle, faSpinner,
  faEye, faGraduationCap, faBriefcaseMedical, faStar, faClock, faGlobe
} from '@fortawesome/free-solid-svg-icons';

// Enhanced User interface to include doctor CV details and status
interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Doctor' | 'Patient';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

  // Doctor-specific fields (optional, only for role === 'Doctor')
  specialty?: string;
  qualifications?: string; // e.g., "MD, PhD"
  experienceYears?: number;
  clinicAddress?: string;
  phoneNumber?: string;
  averageRating?: number | null; // Corrected: allow null for averageRating
}

@Component({
  selector: 'app-a-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FontAwesomeModule], // CORRECTED: Use FontAwesomeModule here
  templateUrl: './a-user.component.html',
  styleUrls: ['./a-user.component.css']
})
export class AUserComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  userForm: FormGroup;
  modalMode: 'Create' | 'Edit' | 'Review' | '' = '';
  currentPage: number = 1;
  pageSize: number = 5;
  searchText: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';

  showConfirmationModal: boolean = false;
  confirmationAction: 'delete' | 'approve' | 'reject' | 'toggle' | '' = '';
  confirmationUserId: number | null = null;
  confirmationMessage: string = '';
  rejectionReason: string = '';

  isSubmitting: boolean = false;

  icons = {
    user: faUser,
    userMd: faUserMd,
    userInjured: faUserInjured,
    plus: faPlus,
    edit: faEdit,
    trash: faTrash,
    toggleOn: faToggleOn,
    toggleOff: faToggleOff,
    search: faSearch,
    sortAlphaDown: faSortAlphaDown,
    sortAlphaUp: faSortAlphaUp,
    checkCircle: faCheckCircle,
    timesCircle: faTimesCircle,
    spinner: faSpinner,
    eye: faEye,
    graduationCap: faGraduationCap,
    briefcaseMedical: faBriefcaseMedical,
    star: faStar,
    clock: faClock,
    globe: faGlobe
  };

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Patient', Validators.required],
      specialty: [''],
      qualifications: [''],
      experienceYears: [null],
      clinicAddress: [''],
      phoneNumber: ['']
    });

    // Add a listener to the role control to update validators dynamically
    this.userForm.get('role')?.valueChanges.subscribe(role => {
      this.updateDoctorFieldValidators(role);
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.filterUsers();
  }

  loadUsers(): void {
    this.users = [
      { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Doctor', status: 'approved', specialty: 'Cardiology', qualifications: 'MD, FACC', experienceYears: 10, clinicAddress: '123 Heart St', phoneNumber: '555-1111', averageRating: 4.8 },
      { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Patient', status: 'active' },
      { id: 3, name: 'Clara Lee', email: 'clara@example.com', role: 'Admin', status: 'active' },
      { id: 4, name: 'Daniel Kim', email: 'daniel@example.com', role: 'Patient', status: 'inactive' },
      { id: 5, name: 'Dr. Ella Davis', email: 'ella@example.com', role: 'Doctor', status: 'pending', specialty: 'Pediatrics', qualifications: 'MD, FAAP', experienceYears: 2, clinicAddress: '456 Kids Ave', phoneNumber: '555-2222', averageRating: undefined },
      { id: 6, name: 'Frank White', email: 'frank@example.com', role: 'Patient', status: 'active' },
      { id: 7, name: 'Dr. Grace Hall', email: 'grace@example.com', role: 'Doctor', status: 'pending', specialty: 'General Practice', qualifications: 'MBBS', experienceYears: 1, clinicAddress: '789 Family Rd', phoneNumber: '555-3333', averageRating: undefined },
      { id: 8, name: 'Hannah Green', email: 'hannah@example.com', role: 'Patient', status: 'active' },
    ];
  }

  // --- Modal Control ---
  openModal(user?: User, mode: 'Create' | 'Edit' | 'Review' = 'Create'): void {
    this.modalMode = mode;
    this.selectedUser = user || null;
    this.rejectionReason = '';

    this.userForm.reset();

    if (user) {
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        role: user.role,
        specialty: user.specialty || '',
        qualifications: user.qualifications || '',
        experienceYears: user.experienceYears || null,
        clinicAddress: user.clinicAddress || '',
        phoneNumber: user.phoneNumber || ''
      });
      // Ensure validators are correctly applied/cleared based on existing user's role
      this.updateDoctorFieldValidators(user.role);
    } else {
      this.userForm.get('role')?.setValue('Patient');
      this.updateDoctorFieldValidators('Patient'); // Clear doctor validators for new patient by default
    }

    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      document.body.classList.add('modal-open');
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('userModal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
      document.body.classList.remove('modal-open');
    }
    this.selectedUser = null;
    this.userForm.reset();
    this.modalMode = ''; // Reset modalMode to hide the modal
    this.hideConfirmation();
    this.updateDoctorFieldValidators('Patient'); // Reset validators after closing
  }

  // New method to dynamically update validators for doctor fields
  updateDoctorFieldValidators(role: 'Admin' | 'Doctor' | 'Patient'): void {
    const specialtyControl = this.userForm.get('specialty');
    const qualificationsControl = this.userForm.get('qualifications');
    const experienceYearsControl = this.userForm.get('experienceYears');
    const clinicAddressControl = this.userForm.get('clinicAddress');
    const phoneNumberControl = this.userForm.get('phoneNumber');

    if (role === 'Doctor') {
      // Add validators if the role is Doctor
      specialtyControl?.setValidators([Validators.required]);
      qualificationsControl?.setValidators([Validators.required]);
      experienceYearsControl?.setValidators([Validators.required, Validators.min(0)]);
      clinicAddressControl?.setValidators([Validators.required]);
      phoneNumberControl?.setValidators([Validators.required]);
    } else {
      // Clear validators if the role is not Doctor
      specialtyControl?.setValidators(null);
      qualificationsControl?.setValidators(null);
      experienceYearsControl?.setValidators(null);
      clinicAddressControl?.setValidators(null);
      phoneNumberControl?.setValidators(null);
    }

    // Update validity for each control
    specialtyControl?.updateValueAndValidity();
    qualificationsControl?.updateValueAndValidity();
    experienceYearsControl?.updateValueAndValidity();
    clinicAddressControl?.updateValueAndValidity();
    phoneNumberControl?.updateValueAndValidity();
  }


  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      // Optionally, you can log validation errors to console for debugging
      // console.log('Form is invalid:', this.userForm.errors);
      // Object.keys(this.userForm.controls).forEach(key => {
      //   const controlErrors = this.userForm.get(key)?.errors;
      //   if (controlErrors != null) {
      //     console.log('Control: ' + key + ', Errors: ' + JSON.stringify(controlErrors));
      //   }
      // });
      return;
    }

    this.isSubmitting = true;
    const userData = this.userForm.value;

    setTimeout(() => { // Simulate API call
      if (this.selectedUser && this.modalMode !== 'Review') { // Only edit if not in review mode
        const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
        if (index > -1) {
          // Keep original status and other non-form controlled properties
          this.users[index] = { ...this.selectedUser, ...userData };
        }
      } else if (this.modalMode === 'Create') {
        const newUser: User = {
          id: Date.now(), // Simple unique ID
          status: 'active', // New users are active by default, doctors can be pending
          ...userData
        };
        // If creating a doctor, perhaps set to pending initially
        if (newUser.role === 'Doctor') {
          newUser.status = 'pending';
        }
        this.users.push(newUser);
      }

      this.filterUsers();
      this.closeModal();
      this.isSubmitting = false;
    }, 500);
  }

  // --- Filtering & Pagination ---
  filterUsers(): void {
    this.currentPage = 1; // Reset to first page on filter change
    this.filteredUsers = this.users.filter(user =>
      (this.selectedRole === '' || user.role === this.selectedRole) &&
      (this.selectedStatus === '' || user.status === this.selectedStatus) &&
      (user.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(this.searchText.toLowerCase()))
    );
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  pageCount(): number {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.pageCount()) {
      this.currentPage = page;
    }
  }

  sortBy(property: keyof User): void {
    this.filteredUsers = [...this.filteredUsers].sort((a, b) => {
      const aValue = a[property];
      const bValue = b[property];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return aValue - bValue;
      }
      return 0;
    });
  }

  // --- User Actions ---
  editUser(user: User): void {
    this.openModal(user, 'Edit');
  }

  reviewDoctor(user: User): void {
    this.openModal(user, 'Review');
  }

  toggleStatus(user: User): void {
    this.showConfirmation('toggle', user.id, `Are you sure you want to ${user.status === 'active' || user.status === 'approved' ? 'deactivate' : 'activate'} ${user.name}?`);
  }

  confirmDelete(user: User): void {
    this.showConfirmation('delete', user.id, `Are you sure you want to delete ${user.name}? This action cannot be undone.`);
  }

  // --- Custom Confirmation Modal Logic ---
  showConfirmation(action: 'delete' | 'approve' | 'reject' | 'toggle', userId: number, message: string): void {
    this.confirmationAction = action;
    this.confirmationUserId = userId;
    this.confirmationMessage = message;
    this.showConfirmationModal = true;
  }

  hideConfirmation(): void {
    this.showConfirmationModal = false;
    this.confirmationAction = '';
    this.confirmationUserId = null;
    this.confirmationMessage = '';
    this.rejectionReason = '';
  }

  performConfirmedAction(): void {
    if (this.confirmationUserId === null) {
      this.hideConfirmation();
      return;
    }

    const userToActOn = this.users.find(u => u.id === this.confirmationUserId);
    if (!userToActOn) {
      this.hideConfirmation();
      return;
    }

    this.isSubmitting = true;

    setTimeout(() => { // Simulate API call for the action
      switch (this.confirmationAction) {
        case 'delete':
          this.users = this.users.filter(u => u.id !== userToActOn.id);
          console.log(`User ${userToActOn.name} deleted.`);
          break;
        case 'toggle':
          if (userToActOn.status === 'active') {
            userToActOn.status = 'inactive';
          } else if (userToActOn.status === 'inactive') {
            userToActOn.status = 'active';
          } else if (userToActOn.status === 'approved') {
            userToActOn.status = 'inactive';
          } else if (userToActOn.status === 'pending') {
            console.warn('Cannot toggle status of a pending user. Use approve/reject.');
          }
          console.log(`User ${userToActOn.name} status toggled to ${userToActOn.status}.`);
          break;
        case 'approve':
          if (userToActOn.role === 'Doctor' && userToActOn.status === 'pending') {
            userToActOn.status = 'approved';
            console.log(`Doctor ${userToActOn.name} approved.`);
          }
          break;
        case 'reject':
          if (userToActOn.role === 'Doctor' && userToActOn.status === 'pending') {
            userToActOn.status = 'rejected';
            console.log(`Doctor ${userToActOn.name} rejected with reason: ${this.rejectionReason}.`);
          }
          break;
      }
      this.filterUsers();
      this.hideConfirmation();
      this.closeModal();
      this.isSubmitting = false;
    }, 500);
  }

  // Methods for doctor specific actions in review modal
  approveDoctor(user: User): void {
    this.showConfirmation('approve', user.id, `Are you sure you want to APPROVE Dr. ${user.name}? This will make their profile public.`);
  }

  rejectDoctor(user: User): void {
    this.showConfirmation('reject', user.id, `Are you sure you want to REJECT Dr. ${user.name}? Please provide a reason.`);
  }

  // Helper for displaying status badge
  getStatusBadgeClass(status: User['status']): string {
    switch (status) {
      case 'active':
      case 'approved': return 'bg-success';
      case 'inactive': return 'bg-secondary';
      case 'pending': return 'bg-warning text-dark';
      case 'rejected': return 'bg-danger';
      default: return 'bg-info';
    }
  }

  // Helper for displaying status text
  getStatusText(status: User['status']): string {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return 'Unknown';
    }
  }

  // Helper to get role icon
  getRoleIcon(role: User['role']): any {
    switch (role) {
      case 'Admin': return this.icons.user;
      case 'Doctor': return this.icons.userMd;
      case 'Patient': return this.icons.userInjured;
      default: return this.icons.user;
    }
  }
}