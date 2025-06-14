export enum AppointmentType {
  InPerson = 'In-Person',
  Online = 'Online'
}

export enum AppointmentStatus {
  Scheduled = 'Scheduled',
  Confirmed = 'Confirmed',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

export interface Appointment {
  appointmentId: string;
  doctor: {
    id: string;
    fullName: string;
  };
  patient: {
    id: string;
    fullName: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentType;
  appointmentTimeSpan: string;
  status: AppointmentStatus;
}

export interface CreateAppointmentDto {
  doctorId: string;
  patientId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentType;
  appointmentTimeSpan?: string;
}

export interface EditAppointmentDto {
  doctorId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentType?: AppointmentType;
} 