import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PatientService {

  patientUrl: string = 'api/patients';
  constructor(private http: HttpClient) { }
  
  private getAllPatientsUrl = environment.apiUrl + `${this.patientUrl}/all`;
  
  getAllPatients() {
    return this.http.get(this.getAllPatientsUrl);
  }
}
