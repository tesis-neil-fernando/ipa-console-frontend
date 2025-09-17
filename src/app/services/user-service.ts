import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8080';

  getUsers() {
    return this.http.get(`${this.apiUrl}/users`);
  }


}
