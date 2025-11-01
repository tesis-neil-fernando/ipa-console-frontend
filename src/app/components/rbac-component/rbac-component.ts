import { Component, OnInit, inject, ViewChildren, ElementRef, QueryList, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { RbacCreateDialogComponent, RbacCreateDialogResult } from '../../components/rbac-create-dialog/rbac-create-dialog';
import { RbacUpdateDialogComponent, RbacUpdateDialogResult } from '../../components/rbac-update-dialog/rbac-update-dialog';
import { RbacService, RoleRbacDto, UserRbacDto, RoleRefDto, NamespaceRbacDto, ProcessRbacDto } from '../../services/rbac-service';

@Component({
  selector: 'app-rbac-component',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatDividerModule,
    FormsModule,
    MatTableModule,
    MatTabsModule,
    MatSnackBarModule,
    MatFormFieldModule,
  MatInputModule,
    MatSelectModule,
  MatDialogModule,
  MatAutocompleteModule
    
  ],
  templateUrl: './rbac-component.html',
  styleUrls: ['./rbac-component.css']
  ,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RbacComponent implements OnInit {
  // Search inputs for each tab (filter first-column values)
  userSearch: string = '';
  roleSearch: string = '';
  namespaceSearch: string = '';
  processSearch: string = '';
  // Users/roles data from backend
  users: UserRbacDto[] = [];
  rolesList: RoleRbacDto[] = [];

  // Placeholders to keep other tabs compiling (not configured yet)
  roles: Array<{ name: string; permissions: string }> = [];
  // Loaded from backend
  namespacesList: NamespaceRbacDto[] = [];
  processes: ProcessRbacDto[] = [];

  // Inline edit state for Users tab
  editingUserId: number | null = null;
  selectedRoleIdToAdd: Record<number, number | null> = {};
  // Per-user search text so simultaneous edits (if any) remain independent
  // can temporarily hold the selected Role object (material writes option value
  // into the input control), so keep it loose-typed here.
  roleSearchTextByUser: Record<number, any> = {};

  // Simple cache per user for filtered role lists (query -> result)
  private _filteredRolesCache: Record<number, { q: string; result: RoleRbacDto[] }> = {};

  // Focus handling for the inline autocomplete input
  @ViewChildren('roleInput') roleInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren(MatAutocompleteTrigger) autoTriggers!: QueryList<MatAutocompleteTrigger>;
  // Namespace input triggers (for processes tab)
  @ViewChildren('namespaceInput') namespaceInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('namespaceAutoTrigger') namespaceAutoTriggers!: QueryList<MatAutocompleteTrigger>;
  // Process inputs for Namespaces tab
  // Process inputs for Namespaces tab (removed: Namespaces tab is read-only now)

  displayedColumnsUsers: string[] = ['username', 'name', 'roles', 'actions'];
  displayedColumnsRoles: string[] = ['name', 'permissions', 'actions'];
  displayedColumnsNamespaces: string[] = ['name', 'processes', 'actions'];
  // Show description column (nullable) between name and namespace
  displayedColumnsProcesses: string[] = ['name', 'description', 'namespace', 'actions'];

  // Services
  private rbac = inject(RbacService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  // Change detector (used because component uses OnPush)
  private cdr = inject(ChangeDetectorRef);

  // Track functions used by template for ngFor trackBy
  trackByUser = (_: number, item: UserRbacDto) => item.id;
  trackByRole = (_: number, item: RoleRefDto) => item.id;
  trackByProcess = (_: number, item: ProcessRbacDto) => item.id;

  // displayWith helper for processes autocomplete
  displayProcess = (p: ProcessRbacDto | string | null) => {
    if (!p) return '';
    return typeof p === 'string' ? p : (p.name ?? '');
  };

  // displayWith helper used by mat-autocomplete so the input shows role.name
  displayRole = (r: RoleRbacDto | string | null) => {
    if (!r) return '';
    return typeof r === 'string' ? r : (r.name ?? '');
  };

  // displayWith helper for namespaces autocomplete
  displayNamespace = (n: NamespaceRbacDto | string | null) => {
    if (!n) return '';
    return typeof n === 'string' ? n : (n.name ?? '');
  };

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
    this.loadNamespaces();
    this.loadProcesses();
  }

  // Called on ngModelChange for search inputs to ensure OnPush updates
  onSearchChange(): void {
    try { this.cdr.markForCheck(); } catch {}
  }

  /**
   * Clear all search inputs when the active tab changes.
   * We accept the selected index but don't need it for logic here.
   */
  onTabChange(_: number): void {
    // Clear all search strings
    this.userSearch = '';
    this.roleSearch = '';
    this.namespaceSearch = '';
    this.processSearch = '';
    // Ensure the view updates (OnPush)
    this.onSearchChange();
  }

  // Clear helpers for each search input (used by the small clear-icon buttons)
  clearUserSearch(): void {
    this.userSearch = '';
    this.onSearchChange();
  }

  clearRoleSearch(): void {
    this.roleSearch = '';
    this.onSearchChange();
  }

  clearNamespaceSearch(): void {
    this.namespaceSearch = '';
    this.onSearchChange();
  }

  clearProcessSearch(): void {
    this.processSearch = '';
    this.onSearchChange();
  }

  // Filter helpers used by the template as dataSource inputs. Each
  // filters the first-column field for its tab.
  filteredUsers(): UserRbacDto[] {
    const q = (this.userSearch ?? '').toString().toLowerCase().trim();
    if (!q) return this.users;
    return this.users.filter(u => (u.username ?? '').toLowerCase().includes(q));
  }

  filteredRolesForTable(): RoleRbacDto[] {
    const q = (this.roleSearch ?? '').toString().toLowerCase().trim();
    if (!q) return this.rolesList;
    return this.rolesList.filter(r => (r.name ?? '').toLowerCase().includes(q));
  }

  filteredNamespacesForTable(): NamespaceRbacDto[] {
    const q = (this.namespaceSearch ?? '').toString().toLowerCase().trim();
    if (!q) return this.namespacesList;
    return this.namespacesList.filter(n => (n.name ?? '').toLowerCase().includes(q));
  }

  filteredProcessesForTable(): ProcessRbacDto[] {
    const q = (this.processSearch ?? '').toString().toLowerCase().trim();
    if (!q) return this.processes;
    return this.processes.filter(p => (p.name ?? '').toLowerCase().includes(q));
  }

  // Data loaders
  loadUsers(): void {
    this.rbac.listUsers().subscribe({
      next: (users) => {
        this.users = users ?? [];
        // Clear per-user filtered cache because users set changed
        this._filteredRolesCache = {};
        // Inform OnPush change detection that we've updated local state
        try { this.cdr.markForCheck(); } catch {}
      },
      error: () => this.snack('No se pudieron cargar los usuarios')
    });
  }

  loadRoles(): void {
    this.rbac.listRoles().subscribe({
      next: (roles) => {
        this.rolesList = roles ?? [];
        // Roles change invalidates any cached filtered results
        this._filteredRolesCache = {};
        // Permissions available for assignment depend on namespaces/roles,
        // so clear the per-role filtered-permissions cache as well when
        // roles are reloaded from the server.
        this._filteredPermissionsCache = {};
        // Rebuild the simple display model for roles (name + namespace:permission)
        try { this.buildRolesDisplay(); } catch {}
        // Inform OnPush change detection that we've updated local state
        try { this.cdr.markForCheck(); } catch {}
      },
      error: () => this.snack('No se pudieron cargar los roles')
    });
  }

  // UI helpers
  isEditing(user: UserRbacDto): boolean {
    return this.editingUserId === user.id;
  }

  startEdit(user: UserRbacDto): void {
    this.editingUserId = user.id;
    this.selectedRoleIdToAdd[user.id] = null;
    this.roleSearchTextByUser[user.id] = '';
    // Defer focus until view updates with the input present
    setTimeout(() => {
      const inputEl = this.roleInputs?.first?.nativeElement;
      if (inputEl) {
        inputEl.focus();
        try { inputEl.setSelectionRange(0, inputEl.value.length); } catch {}
      }
      // Open the autocomplete panel so the user sees options immediately
      this.autoTriggers?.first?.openPanel();
    }, 0);
  }

  finishEdit(): void {
    // End edit mode locally — do not force a reload here. Actions that change
    // server state should refresh the list on success instead.
    this.editingUserId = null;
  }

  // --- Processes / Namespaces editing ---
  // Track which process is being edited (assign namespace)
  editingProcessId: number | null = null;
  selectedNamespaceIdToAdd: Record<number, number | null> = {};
  namespaceSearchTextByProcess: Record<number, any> = {};
  private _filteredNamespacesCache: Record<number, { q: string; result: NamespaceRbacDto[] }> = {};

  // --- Namespaces tab: processes within a namespace ---
  startEditProcess(process: ProcessRbacDto): void {
    this.editingProcessId = process.id;
    this.selectedNamespaceIdToAdd[process.id] = null;
    this.namespaceSearchTextByProcess[process.id] = '';
    setTimeout(() => {
      const inputEl = this.namespaceInputs?.first?.nativeElement;
      if (inputEl) {
        inputEl.focus();
        try { inputEl.setSelectionRange(0, inputEl.value.length); } catch {}
      }
      // Open the autocomplete panel
      this.namespaceAutoTriggers?.first?.openPanel();
    }, 0);
  }

  finishEditProcess(): void {
    this.editingProcessId = null;
  }

  loadNamespaces(): void {
    this.rbac.listNamespaces().subscribe({
      next: (n) => {
        this.namespacesList = n ?? [];
        this._filteredNamespacesCache = {};
        // Namespace changes affect what permissions are available/labelled,
        // so clear the filtered-permissions cache to force recompute.
        this._filteredPermissionsCache = {};
        // Namespaces can affect how role permissions are displayed, rebuild
        try { this.buildRolesDisplay(); } catch {}
        try { this.cdr.markForCheck(); } catch {}
      },
      error: () => this.snack('No se pudieron cargar los namespaces')
    });
  }

  /**
   * Build lightweight display list for roles used by the template.
   * Each permission is rendered as "namespace:permissionType" when namespace
   * references are available, or as just the permission type otherwise.
   */
  private buildRolesDisplay(): void {
    this.roles = (this.rolesList ?? []).map(role => {
      const parts: string[] = [];
      const perms = (role as any).permissions ?? [];
      for (const p of perms) {
        const nsRefs = p.namespaces ?? [];
        if (nsRefs.length) {
          for (const nsRef of nsRefs) {
            const nsName = nsRef.name ?? this.namespacesList?.find(n => n.id === (nsRef as any).id)?.name ?? (`#${(nsRef as any).id ?? 'unknown'}`);
            parts.push(`${nsName}:${p.type}`);
          }
        } else {
          parts.push(p.type);
        }
      }
      return { name: role.name, permissions: parts.join(', ') };
    });
  }

  // --- Roles editing (permissions as chips) ---
  editingRoleId: number | null = null;
  selectedPermissionIdToAdd: Record<number, number | null> = {};
  permissionSearchTextByRole: Record<number, any> = {};
  private _filteredPermissionsCache: Record<number, { q: string; result: Array<any> }> = {};

  // Focus handling for the role-permission inline input
  @ViewChildren('permInput') permInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren('permAutoTrigger') permAutoTriggers!: QueryList<MatAutocompleteTrigger>;

  displayPermission = (p: any | string | null) => {
    if (!p) return '';
    if (typeof p === 'string') return p;
    return `${p.namespaceName ?? ''}:${p.type ?? ''}`;
  };

  startEditRole(role: RoleRbacDto): void {
    this.editingRoleId = role.id;
    this.selectedPermissionIdToAdd[role.id] = null;
    this.permissionSearchTextByRole[role.id] = '';
    setTimeout(() => {
      const inputEl = this.permInputs?.first?.nativeElement;
      if (inputEl) {
        inputEl.focus();
        try { inputEl.setSelectionRange(0, inputEl.value.length); } catch {}
      }
      this.permAutoTriggers?.first?.openPanel();
    }, 0);
  }

  finishEditRole(): void {
    this.editingRoleId = null;
  }

  /**
   * Flatten available permissions from namespacesList into items like:
   * { id, type, namespaceId, namespaceName }
   * Filters out permissions already assigned to the role (by permission id).
   */
  filteredPermissions(role: RoleRbacDto, query: string | null | undefined): Array<any> {
    const roleId = role.id;
    const q = (query ?? '').toString().toLowerCase().trim();
    const cache = this._filteredPermissionsCache[roleId];
    if (cache && cache.q === q) return cache.result;

    // Flatten
    const all: Array<any> = [];
    for (const ns of (this.namespacesList ?? [])) {
      for (const perm of (ns.permissions ?? [])) {
        all.push({ id: perm.id, type: perm.type, namespaceId: ns.id, namespaceName: ns.name });
      }
    }

    const assignedIds = new Set<number>((role.permissions ?? []).map((p: any) => p.id));
    const result = all.filter(a => !assignedIds.has(a.id) && (!q || (`${a.namespaceName}:${a.type}`).toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.namespaceName.toLowerCase().includes(q)));
    this._filteredPermissionsCache[roleId] = { q, result };
    return result;
  }

  onPermissionSelected(role: RoleRbacDto, value: any): void {
    if (!value) return;
    let permissionId: number | null = null;
    if (typeof value === 'number') permissionId = value;
    else if (typeof value === 'object' && value.id != null) permissionId = value.id;
    else if (typeof value === 'string') {
      // try to parse namespace:permission
      const parts = value.split(':');
      if (parts.length === 2) {
        const ns = parts[0];
        const type = parts[1];
        const found = this.namespacesList.flatMap(n => (n.permissions ?? []).map((p: any) => ({ p, n }))).find(x => (x.n.name === ns || String(x.n.id) === ns) && x.p.type === type);
        permissionId = found ? found.p.id : null;
      }
    }
    if (!permissionId) return;
    this.selectedPermissionIdToAdd[role.id] = permissionId;
    this.addPermissionToRole(role);
  }

  addPermissionToRole(role: RoleRbacDto): void {
    const permissionId = this.selectedPermissionIdToAdd[role.id];
    if (!permissionId) return;
    this.rbac.assignPermissionToRole(role.id, permissionId).subscribe({
      next: () => {
        this.snack('Permiso asignado');
        this.selectedPermissionIdToAdd[role.id] = null;
        this.permissionSearchTextByRole[role.id] = '';
        delete this._filteredPermissionsCache[role.id];
        this.loadRoles();
        this.editingRoleId = null;
      },
      error: () => this.snack('No se pudo asignar el permiso')
    });
  }

  removePermissionFromRole(role: RoleRbacDto, permissionId: number): void {
    this.rbac.removePermissionFromRole(role.id, permissionId).subscribe({
      next: () => {
        this.snack('Permiso eliminado');
        // Clear cached filtered permissions for this role so the removed
        // permission becomes selectable again immediately.
        try { delete this._filteredPermissionsCache[role.id]; } catch {}
        this.loadRoles();
      },
      error: () => this.snack('No se pudo eliminar el permiso')
    });
  }

  confirmRemovePermissionFromRole(role: RoleRbacDto, permissionId: number): void {
    // Try to get a readable label for the permission
    const perm = (role.permissions ?? []).find((p: any) => p.id === permissionId) as any | undefined;
    const label = perm ? ((perm.namespaces && perm.namespaces.length) ? `${perm.namespaces.map((n: any) => n.name).join(',')}:${perm.type}` : perm.type) : 'este permiso';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Quitar el permiso "${label}" del rol "${role.name}"?`,
        confirmText: 'Quitar',
        cancelText: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.removePermissionFromRole(role, permissionId);
    });
  }

  loadProcesses(): void {
    this.rbac.listProcesses().subscribe({
      next: (p) => {
        this.processes = p ?? [];
        try { this.cdr.markForCheck(); } catch {}
      },
      error: () => this.snack('No se pudieron cargar los procesos')
    });
  }

  // --- Create entities (users / roles / namespaces) via small dialog ---
  openCreateUser(): void {
    const ref = this.dialog.open(RbacCreateDialogComponent, { data: { kind: 'user' } });
    ref.afterClosed().subscribe((res: RbacCreateDialogResult | null) => {
      if (!res) return;
      const req: any = { username: res.name, password: res.password ?? '' };
      // include optional full display name when provided by the dialog
      if ((res as any).fullName !== undefined) req.name = (res as any).fullName;
      this.rbac.createUser(req).subscribe({
        next: () => {
          this.snack('Usuario creado');
          this.loadUsers();
        },
        error: () => this.snack('No se pudo crear el usuario')
      });
    });
  }

  openCreateRole(): void {
    const ref = this.dialog.open(RbacCreateDialogComponent, { data: { kind: 'role' } });
    ref.afterClosed().subscribe((res: RbacCreateDialogResult | null) => {
      if (!res) return;
      this.rbac.createRole({ name: res.name }).subscribe({
        next: () => {
          this.snack('Rol creado');
          this.loadRoles();
        },
        error: () => this.snack('No se pudo crear el rol')
      });
    });
  }

  openCreateNamespace(): void {
    const ref = this.dialog.open(RbacCreateDialogComponent, { data: { kind: 'namespace' } });
    ref.afterClosed().subscribe((res: RbacCreateDialogResult | null) => {
      if (!res) return;
      this.rbac.createNamespace({ name: res.name }).subscribe({
        next: () => {
          this.snack('Namespace creado');
          this.loadNamespaces();
        },
        error: () => this.snack('No se pudo crear el namespace')
      });
    });
  }

  addNamespaceToProcess(process: ProcessRbacDto): void {
    const namespaceId = this.selectedNamespaceIdToAdd[process.id];
    if (!namespaceId) return;
    this.rbac.assignProcessToNamespace(process.id, namespaceId).subscribe({
      next: () => {
        this.snack('Namespace asignado');
        this.selectedNamespaceIdToAdd[process.id] = null;
        this.namespaceSearchTextByProcess[process.id] = '';
        delete this._filteredNamespacesCache[process.id];
        this.loadProcesses();
        this.editingProcessId = null;
      },
      error: () => this.snack('No se pudo asignar el namespace')
    });
  }

  onNamespaceSelected(process: ProcessRbacDto, value: any): void {
    if (!value) return;
    let namespaceId: number | null = null;
    if (typeof value === 'number') namespaceId = value;
    else if (typeof value === 'object' && value.id != null) namespaceId = value.id;
    else if (typeof value === 'string') {
      const found = this.namespacesList.find(n => n.name === value);
      namespaceId = found ? found.id : null;
    }
    if (!namespaceId) return;
    this.selectedNamespaceIdToAdd[process.id] = namespaceId;
    this.addNamespaceToProcess(process);
  }

  removeNamespaceFromProcess(process: ProcessRbacDto, namespaceId: number): void {
    this.rbac.removeProcessFromNamespace(process.id, namespaceId).subscribe({
      next: () => {
        this.snack('Namespace eliminado');
        // Clear any cached filtered results for this process so the removed
        // namespace becomes selectable again immediately.
        try { delete this._filteredNamespacesCache[process.id]; } catch {}
        try { this.namespaceSearchTextByProcess[process.id] = ''; } catch {}
        this.loadProcesses();
      },
      error: () => this.snack('No se pudo eliminar el namespace')
    });
  }

  confirmRemoveNamespaceFromProcess(process: ProcessRbacDto, namespaceId: number): void {
    const namespaceName = this.namespacesList?.find(n => n.id === namespaceId)?.name ?? 'este namespace';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Quitar el namespace "${namespaceName}" del proceso "${process.name}"?`,
        confirmText: 'Quitar',
        cancelText: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.removeNamespaceFromProcess(process, namespaceId);
    });
  }

  // Filtered namespaces for autocomplete (excludes the assigned namespace)
  filteredNamespaces(process: ProcessRbacDto, query: string | null | undefined): NamespaceRbacDto[] {
    const procId = process.id;
    const q = (query ?? '').toString().toLowerCase().trim();
    const cache = this._filteredNamespacesCache[procId];
    if (cache && cache.q === q) return cache.result;
    const assignedId = process.namespaceId ?? null;
    const result = this.namespacesList.filter(n => n.id !== assignedId && (!q || n.name.toLowerCase().includes(q)));
    this._filteredNamespacesCache[procId] = { q, result };
    return result;
  }

  addRoleToUser(user: UserRbacDto): void {
    const roleId = this.selectedRoleIdToAdd[user.id];
    if (!roleId) {
      return;
    }
    this.rbac.assignRoleToUser(user.id, roleId).subscribe({
      next: () => {
        this.snack('Rol asignado');
        // Refresh from backend to get canonical data. Also end edit mode.
        this.selectedRoleIdToAdd[user.id] = null;
        this.roleSearchTextByUser[user.id] = '';
        delete this._filteredRolesCache[user.id];
        this.loadUsers();
        this.editingUserId = null;
      },
      error: () => this.snack('No se pudo asignar el rol')
    });
  }

  onRoleSelected(user: UserRbacDto, roleValue: any): void {
    if (!roleValue) return;
    let roleId: number | null = null;

    if (typeof roleValue === 'number') {
      roleId = roleValue;
    } else if (typeof roleValue === 'object' && roleValue.id != null) {
      roleId = roleValue.id;
    } else if (typeof roleValue === 'string') {
      // Fallback: try to resolve role by name (best-effort)
      const found = this.rolesList.find(r => r.name === roleValue);
      roleId = found ? found.id : null;
    }

    if (!roleId) return;

    this.selectedRoleIdToAdd[user.id] = roleId;
    // addRoleToUser will clear edit mode and reload on success
    this.addRoleToUser(user);
  }

  removeRoleFromUser(user: UserRbacDto, roleId: number): void {
    this.rbac.removeRoleFromUser(user.id, roleId).subscribe({
      next: () => {
        this.snack('Rol eliminado');
        this.loadUsers();
      },
      error: () => this.snack('No se pudo eliminar el rol')
    });
  }

  /** Toggle the user's enabled flag */
  toggleUserEnabled(user: UserRbacDto): void {
    const newValue = !(user.enabled === true);
    this.rbac.updateUserEnabled(user.id, newValue).subscribe({
      next: () => {
        this.snack(newValue ? 'Usuario activado' : 'Usuario desactivado');
        // Update local model and refresh list
        try { user.enabled = newValue; } catch {}
        this.loadUsers();
      },
      error: () => this.snack('No se pudo actualizar el estado del usuario')
    });
  }

  /** Edit user's display name via a quick prompt (validate non-empty) */
  editUserName(user: UserRbacDto): void {
    const ref = this.dialog.open(RbacUpdateDialogComponent, {
      data: { kind: 'user', name: user.name }
    });

    ref.afterClosed().subscribe((res: RbacUpdateDialogResult | null) => {
      if (!res) return;
      const name = res.name;
      this.rbac.updateUserName(user.id, name).subscribe({
        next: () => {
          this.snack('Nombre de usuario actualizado');
          this.loadUsers();
        },
        error: () => this.snack('No se pudo actualizar el nombre del usuario')
      });
    });
  }

  /** Edit a role's name (quick prompt). On success reload roles and users. */
  editRoleName(role: RoleRbacDto): void {
    const ref = this.dialog.open(RbacUpdateDialogComponent, {
      data: { kind: 'role', name: role.name }
    });

    ref.afterClosed().subscribe((res: RbacUpdateDialogResult | null) => {
      if (!res) return;
      const name = res.name;
      this.rbac.updateRoleName(role.id, name).subscribe({
        next: () => {
          this.snack('Nombre del rol actualizado');
          this.loadRoles();
          this.loadUsers();
        },
        error: () => this.snack('No se pudo actualizar el nombre del rol')
      });
    });
  }

  /** Edit a namespace's name (quick prompt). On success reload namespaces and roles. */
  editNamespaceName(ns: NamespaceRbacDto): void {
    const ref = this.dialog.open(RbacUpdateDialogComponent, {
      data: { kind: 'namespace', name: ns.name }
    });

    ref.afterClosed().subscribe((res: RbacUpdateDialogResult | null) => {
      if (!res) return;
      const name = res.name;
      this.rbac.updateNamespaceName(ns.id, name).subscribe({
        next: () => {
          this.snack('Namespace renombrado');
          this.loadNamespaces();
          this.loadRoles();
        },
        error: () => this.snack('No se pudo renombrar el namespace')
      });
    });
  }

  /** Edit a process's name and description (two prompts). On success reload processes & namespaces. */
  editProcess(process: ProcessRbacDto): void {
    const ref = this.dialog.open(RbacUpdateDialogComponent, {
      data: { kind: 'process', name: process.name, description: process.description }
    });

    ref.afterClosed().subscribe((res: RbacUpdateDialogResult | null) => {
      if (!res) return;
      const name = res.name;
      const description = (res.description === undefined) ? process.description : res.description;
      this.rbac.updateProcess(process.id, { name, description }).subscribe({
        next: () => {
          this.snack('Proceso actualizado');
          this.loadProcesses();
          this.loadNamespaces();
        },
        error: () => this.snack('No se pudo actualizar el proceso')
      });
    });
  }

  confirmRemoveRoleFromUser(user: UserRbacDto, roleId: number): void {
    const roleName = user.roles?.find(r => r.id === roleId)?.name ?? 'este rol';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmar eliminación',
        message: `¿Quitar el rol "${roleName}" del usuario "${user.username}"?`,
        confirmText: 'Quitar',
        cancelText: 'Cancelar'
      }
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.removeRoleFromUser(user, roleId);
      }
    });
  }

  // Placeholder actions
  viewUser(user: UserRbacDto): void {
    this.snack(`Usuario: ${user.username}`);
  }

  deleteUser(user: UserRbacDto): void {
    this.snack('Eliminar usuario no implementado');
  }

  private snack(message: string): void {
    this.snackBar.open(message, 'OK', { duration: 2500 });
  }

  // Template helper: list role names or fallback text
  roleNames(user: UserRbacDto): string {
    const names = user.roles?.map(r => r.name).filter(Boolean) ?? [];
    return names.length ? names.join(', ') : 'Sin roles';
  }

  // Roles filtrados para el autocompletado (excluye los ya asignados)
  filteredRoles(user: UserRbacDto, query: string | null | undefined): RoleRbacDto[] {
    const userId = user.id;
    const q = (query ?? '').toString().toLowerCase().trim();

    const cache = this._filteredRolesCache[userId];
    if (cache && cache.q === q) {
      return cache.result;
    }

    const assignedIds = new Set<number>((user.roles ?? []).map(r => r.id));
    const result = this.rolesList.filter(r => !assignedIds.has(r.id) && (!q || r.name.toLowerCase().includes(q)));
    this._filteredRolesCache[userId] = { q, result };
    return result;
  }
}
