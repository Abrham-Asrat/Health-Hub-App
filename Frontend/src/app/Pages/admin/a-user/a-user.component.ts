import * as bootstrap from 'bootstrap';
import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';



interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'Doctor' | 'Patient';
  active: boolean; // Added the active property
}
@Component({
  selector: 'app-a-user',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './a-user.component.html',
  styleUrl: './a-user.component.css'
})
export class AUserComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  userForm: FormGroup;
  modalMode: 'Create' | 'Edit' = 'Create';
  currentPage: number = 1;
  pageSize: number = 5;
  searchText: string = ''; // Add searchText
  selectedRole: string = 'All'; // Add selectedRole

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['Patient', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = [
      { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Doctor', active: true },
      { id: 2, name: 'Bob Johnson', email: 'bob@example.com', role: 'Patient', active: true },
      { id: 3, name: 'Clara Lee', email: 'clara@example.com', role: 'Admin', active: true },
      { id: 4, name: 'Daniel Kim', email: 'daniel@example.com', role: 'Patient', active: false },
      { id: 5, name: 'Ella Davis', email: 'ella@example.com', role: 'Doctor', active: true },
      { id: 6, name: 'Frank Smith', email: 'frank@example.com', role: 'Patient', active: false },
    ];
  }

  openModal(user?: User): void {
    this.modalMode = user ? 'Edit' : 'Create';
    this.selectedUser = user || null;

    this.userForm.reset({
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'Patient'
    });

    const modal = document.getElementById('userModal')!;
    new bootstrap.Modal(modal).show();
  }

  saveUser(): void {
    if (this.userForm.invalid) return;

    const userData = this.userForm.value;

    if (this.selectedUser) {
      const index = this.users.findIndex(u => u.id === this.selectedUser?.id);
      this.users[index] = { ...this.selectedUser, ...userData };
    } else {
      const newUser: User = {
        id: Date.now(),
        active: true, // New users are active by default
        ...userData
      };
      this.users.push(newUser);
    }

    bootstrap.Modal.getInstance(document.getElementById('userModal')!)?.hide();
  }

  deleteUser(user: User): void {
    const confirmed = confirm(`Are you sure you want to delete ${user.name}?`);
    if (confirmed) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  pageCount(): number {
    return Math.ceil(this.users.length / this.pageSize);
  }

  sortBy(property: string) {
    this.users = [...this.users].sort((a, b) => {
      const aValue = a[property as keyof User];
      const bValue = b[property as keyof User];

      // Only use localeCompare if the values are strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue);
      }

      // If they are not strings, return 0 (no sorting)
      return 0;
    });
  }



  filterUsers(): void {
    // Logic to filter users based on searchText or selectedRole
  }

  editUser(user: User): void {
    this.selectedUser = user;
    this.openModal(user);
  }

  toggleStatus(user: User): void {
    user.active = !user.active;
  }

  confirmDelete(user: User): void {
    const confirmed = confirm(`Are you sure you want to delete ${user.name}?`);
    if (confirmed) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
  }
}
