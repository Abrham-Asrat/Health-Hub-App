import { ApiResponse } from './blog.model';

export interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  email: string;
  phoneNumber: string;
  // Add other doctor fields as needed
}

export interface DoctorResponse extends ApiResponse<Doctor[]> {
  success: boolean;
  data: Doctor[];
  message: string;
} 