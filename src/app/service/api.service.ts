import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Example signup method
  signup(data: any): Observable<any> {
    console.log("sign up fend")
    return this.http.post(`${this.baseUrl}/signup`, data);
  }


  // Example login method

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, data);
  }
  

  // Other API methods can be added here
}
