import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { PageResp, UserView } from './users.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly base = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /** GET /users con filtros y paginación */
  list(opts: {
    page?: number; size?: number;
    q?: string; enabled?: boolean; role?: string;
    sort?: string; // ej: 'username,asc'
  } = {}): Observable<PageResp<UserView>> {
    let p = new HttpParams();
    if (opts.page != null)    p = p.set('page', String(opts.page));
    if (opts.size != null)    p = p.set('size', String(opts.size));
    if (opts.sort)            p = p.set('sort', opts.sort);
    if (opts.q)               p = p.set('q', opts.q);
    if (opts.enabled != null) p = p.set('enabled', String(opts.enabled));
    if (opts.role)            p = p.set('role', opts.role);

    return this.http.get<PageResp<UserView>>(this.base, { params: p });
  }

  /** GET /users/{username} */
  getByUsername(username: string): Observable<UserView> {
    return this.http.get<UserView>(`${this.base}/${encodeURIComponent(username)}`);
  }

  /** PUT /users/{username}/roles  (body: string[]) */
  setRoles(username: string, roles: string[]): Observable<UserView> {
    return this.http.put<UserView>(
      `${this.base}/${encodeURIComponent(username)}/roles`,
      roles
    );
  }

  /** PATCH /users/{id}/enabled?value=true|false */
  updateEnabled(id: number, value: boolean): Observable<UserView> {
    const params = new HttpParams().set('value', String(value));
    return this.http.patch<UserView>(`${this.base}/${id}/enabled`, null, { params });
  }

  /** DELETE /users/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
