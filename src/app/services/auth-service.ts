import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'auth_token';

  private http = inject(HttpClient);

  login(credentials: { username: string; password: string }) {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/signin`, credentials).pipe(
      tap(res => this.setToken(res.accessToken))
    );
  }
  isSessionValid() {
    return this.http.get<boolean>(`${this.apiUrl}/valid`);
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
