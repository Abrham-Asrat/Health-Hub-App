export interface Availability {
  day: string;
  startTime: string;
  endTime: string;
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

export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  profilePicture: string;
  address: string;
  role: string;
  // Patient specific fields
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Doctor specific fields
  specialities?: string[];
  availabilities?: Availability[];
  qualifications?: string;
  biography?: string;
  doctorStatus?: string;
  educations?: Education[];
  experiences?: Experience[];
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  starRating: number;
  reviewText: string;
  createdAt: string;
  patient: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}