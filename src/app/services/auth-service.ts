import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth';
  private tokenKey = 'auth_token';

  private http = inject(HttpClient);

  login(credentials: { username: string; password: string }) {
    console.log('Attempting login with credentials:', credentials);
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(res => this.setToken(res.accessToken))
    );
  }

  isTokenValid(): boolean {
    
    this.http.get<{ valid: boolean }>(`${this.apiUrl}/valid`).subscribe(
      response => {
        console.log('Checking token validity', response);
        return response;
      }
    );
    return false;
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}
