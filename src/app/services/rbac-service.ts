import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface RoleRbacDto {
  id: number;
  name: string;
  permissions?: PermissionRbacDto[];
}

export interface UserRbacDto {
  id: number;
  username: string;
  enabled?: boolean;
  // backend returns RoleRefDto for user roles (id + name)
  roles?: RoleRefDto[];
}

export interface NamespaceRbacDto {
  id: number;
  name: string;
  processes?: ProcessRbacDto[];
  permissions?: PermissionRbacDto[];
}

export interface ProcessRbacDto {
  id: number;
  name: string;
  // backend shape includes namespaceId / namespaceName (not nested namespace)
  description?: string;
  namespaceId?: number;
  namespaceName?: string;
}

// Simple reference DTOs returned in lists to avoid loading full objects
export interface RoleRefDto { id: number; name: string }
export interface NamespaceRefDto { id: number; name: string }

// Extend Permission DTO to include namespace refs when present on backend
export interface PermissionRbacDto {
  id: number;
  type: string;
  namespaces?: NamespaceRefDto[];
}

export interface CreateRoleRequest { name: string }
export interface CreateNamespaceRequest { name: string }

@Injectable({ providedIn: 'root' })
export class RbacService {
  private apiUrl = `${environment.apiUrl}/rbac`;
  private http = inject(HttpClient);

  // Users
  listUsers(): Observable<UserRbacDto[]> {
    return this.http.get<UserRbacDto[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: number): Observable<UserRbacDto> {
    return this.http.get<UserRbacDto>(`${this.apiUrl}/users/${id}`);
  }

  // Roles
  listRoles(): Observable<RoleRbacDto[]> {
    return this.http.get<RoleRbacDto[]>(`${this.apiUrl}/roles`);
  }

  getRoleById(id: number): Observable<RoleRbacDto> {
    return this.http.get<RoleRbacDto>(`${this.apiUrl}/roles/${id}`);
  }

  createRole(req: CreateRoleRequest): Observable<RoleRbacDto> {
    return this.http.post<RoleRbacDto>(`${this.apiUrl}/roles`, req);
  }

  assignPermissionToRole(roleId: number, permissionId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`, {} as any);
  }

  removePermissionFromRole(roleId: number, permissionId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${roleId}/permissions/${permissionId}`);
  }

  // Namespaces
  listNamespaces(): Observable<NamespaceRbacDto[]> {
    return this.http.get<NamespaceRbacDto[]>(`${this.apiUrl}/namespaces`);
  }

  getNamespaceById(id: number): Observable<NamespaceRbacDto> {
    return this.http.get<NamespaceRbacDto>(`${this.apiUrl}/namespaces/${id}`);
  }

  createNamespace(req: CreateNamespaceRequest): Observable<NamespaceRbacDto> {
    return this.http.post<NamespaceRbacDto>(`${this.apiUrl}/namespaces`, req);
  }

  assignProcessToNamespace(processId: number, namespaceId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/namespaces/${namespaceId}/processes/${processId}`, {} as any);
  }

  removeProcessFromNamespace(processId: number, namespaceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/namespaces/${namespaceId}/processes/${processId}`);
  }

  // Processes
  listProcesses(): Observable<ProcessRbacDto[]> {
    return this.http.get<ProcessRbacDto[]>(`${this.apiUrl}/processes`);
  }

  // User <-> Role
  assignRoleToUser(userId: number, roleId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/roles/${roleId}`, {} as any);
  }

  removeRoleFromUser(userId: number, roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/roles/${roleId}`);
  }
}
