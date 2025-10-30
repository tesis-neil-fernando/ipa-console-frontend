import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RbacService {
  private apiUrl = `${environment.apiUrl}/rbac`;
  private http = inject(HttpClient);

  // Method get users
  getUsers() {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
  // Method get roles
  getRoles() {
    return this.http.get<any[]>(`${this.apiUrl}/roles`);
  }
  // Method get namespaces
  getNamespaces() {
    return this.http.get<any[]>(`${this.apiUrl}/namespaces`);
  }
  // Method get processes
  getProcesses() {
    return this.http.get<any[]>(`${this.apiUrl}/processes`);
  }
  // Method patch user with roles
  patchUserRoles(userId: string, roles: string[]) {
    return this.http.patch<any>(`${this.apiUrl}/users/${userId}`, { roles });
  }
  // Method patch role with permissions
  patchRolePermissions(roleId: string, permissions: string[]) {
    return this.http.patch<any>(`${this.apiUrl}/roles/${roleId}`, { permissions });
  }

}
