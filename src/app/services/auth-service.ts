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

  // === Helpers to read roles from a JWT token stored in localStorage ===
  private getTokenPayload(): any | null {
    const tok = this.getToken();
    if (!tok) return null;
    try {
      const parts = tok.split('.');
      if (parts.length < 2) return null;
      // JWT payload is base64url
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      // atob works in the browser
      const json = decodeURIComponent(Array.prototype.map.call(atob(base64), (c: string) => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  /**
   * Return an array of role strings extracted from the token payload.
   * Supports common claim names like `roles`, `authorities`, `scope` or `authority`.
   */
  getUserRoles(): string[] {
    const p = this.getTokenPayload();
    if (!p) return [];
    // Try common claim locations
    let raw: any = p.roles ?? p.authorities ?? p.authority ?? p.scope ?? null;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.map(r => String(r));
    if (typeof raw === 'string') {
      // space or comma separated
      if (raw.indexOf(',') >= 0) return raw.split(',').map(s => s.trim());
      return raw.split(' ').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  /**
   * Return true when the token indicates the current user has an admin role.
   * Checks several common role names (ADMIN, ROLE_ADMIN).
   */
  isAdmin(): boolean {
    try {
      const roles = this.getUserRoles().map(r => (r || '').toUpperCase());
      return roles.includes('ADMIN') || roles.includes('ROLE_ADMIN') || roles.includes('ADMINISTRATOR');
    } catch {
      return false;
    }
  }

  /**
   * Return the token JTI claim if present.
   */
  getJti(): string | null {
    const p = this.getTokenPayload();
    if (!p) return null;
    return p.jti ?? p.jti?.toString() ?? null;
  }
}
