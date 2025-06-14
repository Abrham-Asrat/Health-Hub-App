import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VarificationService {

  varificationUrl: string = 'api/varify';
  constructor(private http : HttpClient) { }
 
  private getVarificationByIdUrl = environment.apiUrl + `${this.varificationUrl}/email/{email}`; // Assuming email is used for varification
  
  getVarificationById(email: string) {
    const url = this.getVarificationByIdUrl.replace('{email}', email);
    return this.http.get(url);
  }
}
