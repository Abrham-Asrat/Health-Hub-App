export interface Appointment {
  id: string;
  name: string;
  time: string;
  date: string;
  reason: string;
}


export interface PastAppointment {
  name: string;
  date: string;
  status: string;
}