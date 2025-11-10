import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface SessionDto {
  jti: string;
  ipAddress?: string;
  userAgent?: string;
  os?: string;
  issuedAt?: string;
  expiresAt?: string;
  lastAccessAt?: string;
  revoked?: boolean;
  id?: number;
}

@Injectable({ providedIn: 'root' })
export class SessionsService {
  private apiUrl = `${environment.apiUrl}/sessions`;
  private http = inject(HttpClient);

  listMySessions(): Observable<SessionDto[]> {
    return this.http.get<SessionDto[]>(this.apiUrl);
  }

  revokeSession(jti: string) {
    // use hard delete to remove session rows so the UI does not show revoked entries
    return this.http.delete(`${this.apiUrl}/${encodeURIComponent(jti)}?hard=true`);
  }

  revokeOtherSessions(keepJti?: string) {
    // hard-delete others so they disappear from the list immediately
    const body = keepJti ? { keepJti } : {};
    return this.http.post(`${this.apiUrl}/revoke-others?hard=true`, body);
  }
}
