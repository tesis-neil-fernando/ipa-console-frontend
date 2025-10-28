import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SessionInfo, NamespaceScope } from './security.model';

// === MOCK estático (cámbialo por HTTP luego) ===
const MOCK_SESSIONS: SessionInfo[] = [
  {
    id: 'sess-abc123',
    device: 'Windows 11 · Chrome 120',
    ip: '190.237.10.25',
    location: 'Lima, PE',
    lastActivity: '2025-10-28 10:35',
    current: true,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
  },
  {
    id: 'sess-xyz999',
    device: 'Android · Chrome 119',
    ip: '181.64.2.11',
    location: 'Callao, PE',
    lastActivity: '2025-10-27 22:08',
    current: false
  }
];

const MOCK_SCOPES: NamespaceScope[] = [
  {
    namespace: 'inteligencia_comercial',
    roles: ['inteligencia_comercial'],
    permissions: ['visualizar', 'ejecutar']
  },
  {
    namespace: 'marketing',
    roles: ['marketing'],
    permissions: ['visualizar']
  }
];

@Injectable({ providedIn: 'root' })
export class SecurityService {
  private _sessions$ = new BehaviorSubject<SessionInfo[]>(MOCK_SESSIONS);
  private _scopes$   = new BehaviorSubject<NamespaceScope[]>(MOCK_SCOPES);

  readonly sessions$ = this._sessions$.asObservable();
  readonly scopes$   = this._scopes$.asObservable();

  // === Mutadores mock (luego reemplazas con HTTP) ===
  terminateSession(id: string) {
    const cur = this._sessions$.value;
    this._sessions$.next(cur.filter(s => s.id !== id || s.current)); // no borres la actual por error
  }

  terminateAllExceptCurrent() {
    const cur = this._sessions$.value;
    const current = cur.find(s => s.current);
    this._sessions$.next(current ? [current] : cur);
  }

  // === Ejemplo de cómo quedará con backend ===
  // getMySessions()             => this.http.get<SessionInfo[]>('/security/sessions/me')
  // deleteSession(id)           => this.http.delete(`/security/sessions/${id}`)
  // deleteAllExceptCurrent()    => this.http.delete(`/security/sessions/others`)
  // getMyNamespaceScopes()      => this.http.get<NamespaceScope[]>('/security/scopes/me')
}
