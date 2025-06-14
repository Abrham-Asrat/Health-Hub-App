export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
}

export interface CV {
  mimeType: string;
  fileDataBase64: string;
  fileName: string;
}

export interface Education {
  degree: string;
  institution: string;
  startDate: string;
  endDate: string;
}

export interface Experience {
  institution: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  role: 'Doctor' | 'Patient';

  // Patient-specific fields
  medicalHistory: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Doctor-specific fields
  specialities: string[];
  availabilities: Availability[];
  qualifications: string;
  biography: string;
  doctorStatus: number;
  cv: CV;
  onlineAppointmentFee: number;
  inPersonAppointmentFee: number;
  educations: Education[];
  experiences: Experience[];

  // Form control
  termsAccepted: boolean;
}
