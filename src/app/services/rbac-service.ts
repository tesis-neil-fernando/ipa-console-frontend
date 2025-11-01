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
  name?: string | null;
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
  // New in backend: description may be present or null. Treat as optional nullable string.
  description?: string | null;
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
export interface CreateUserRequest { username: string; password: string; name?: string | null }
export interface UpdateEnabledRequest { enabled: boolean }
export interface UpdatePasswordRequest { id: number; password: string }
export interface UpdateProcessRequest { name: string; description?: string | null }
export interface UpdateNameRequest { name: string }

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

  createUser(req: CreateUserRequest): Observable<UserRbacDto> {
    return this.http.post<UserRbacDto>(`${this.apiUrl}/users`, req);
  }

  updatePassword(req: UpdatePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/password`, req);
  }

  /**
   * Update a user's enabled (active) flag.
   * PUT /rbac/users/{id}/enabled with body { enabled: boolean }
   */
  updateUserEnabled(id: number, enabled: boolean): Observable<void> {
    const body: UpdateEnabledRequest = { enabled };
    return this.http.put<void>(`${this.apiUrl}/users/${id}/enabled`, body as any);
  }

  /**
   * Update a user's display name.
   * PUT /rbac/users/{id}/name with body { name: string }
   * Server returns 200 OK with empty body on success.
   * Note: username is immutable and must not be changed here.
   */
  updateUserName(id: number, name: string): Observable<void> {
    const body: UpdateNameRequest = { name };
    return this.http.put<void>(`${this.apiUrl}/users/${id}/name`, body as any);
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

  /**
   * Update a role's name.
   * PUT /rbac/roles/{id} with body { name: string }
   * Server returns 200 OK with empty body on success.
   */
  updateRoleName(id: number, name: string): Observable<void> {
    const body: UpdateNameRequest = { name };
    return this.http.put<void>(`${this.apiUrl}/roles/${id}`, body as any);
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

  /**
   * Update a namespace's name.
   * PUT /rbac/namespaces/{id} with body { name: string }
   * Server returns 200 OK with empty body on success.
   * Note: after success callers should refetch namespaces, permissions and roles
   * because permission types may have been renamed on the server.
   */
  updateNamespaceName(id: number, name: string): Observable<void> {
    const body: UpdateNameRequest = { name };
    return this.http.put<void>(`${this.apiUrl}/namespaces/${id}`, body as any);
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

  /**
   * Update a process's name and description.
   * PUT /rbac/processes/{id} with body { name: string, description: string | null }
   * Server returns 200 OK with empty body on success.
   * Note: after success callers should refetch process and namespace lists.
   */
  updateProcess(id: number, req: UpdateProcessRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/processes/${id}`, req as any);
  }

  // Permissions
  listPermissions(): Observable<PermissionRbacDto[]> {
    return this.http.get<PermissionRbacDto[]>(`${this.apiUrl}/permissions`);
  }

  // User <-> Role
  assignRoleToUser(userId: number, roleId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/users/${userId}/roles/${roleId}`, {} as any);
  }

  removeRoleFromUser(userId: number, roleId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/roles/${roleId}`);
  }
}
