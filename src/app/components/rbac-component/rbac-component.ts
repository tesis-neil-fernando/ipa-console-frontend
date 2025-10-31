import { Component, OnInit, inject, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog';
import { RbacService, RoleRbacDto, UserRbacDto } from '../../services/rbac-service';

@Component({
  selector: 'app-rbac-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
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
    MatSelectModule,
    MatDialogModule,
    MatAutocompleteModule
    
  ],
  templateUrl: './rbac-component.html',
  styleUrls: ['./rbac-component.css']
})
export class RbacComponent implements OnInit {
  // Users/roles data from backend
  users: UserRbacDto[] = [];
  rolesList: RoleRbacDto[] = [];

  // Placeholders to keep other tabs compiling (not configured yet)
  roles: Array<{ name: string; permissions: string }> = [];
  namespaces: Array<{ name: string; processes: string }> = [];
  processes: Array<{ name: string; namespace: string }> = [];

  // Inline edit state for Users tab
  editingUserId: number | null = null;
  selectedRoleIdToAdd: Record<number, number | null> = {};
  roleSearchText: string = '';

  // Focus handling for the inline autocomplete input
  @ViewChildren('roleInput') roleInputs!: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChildren(MatAutocompleteTrigger) autoTriggers!: QueryList<MatAutocompleteTrigger>;

  displayedColumnsUsers: string[] = ['username', 'roles', 'actions'];
  displayedColumnsRoles: string[] = ['name', 'permissions', 'actions'];
  displayedColumnsNamespaces: string[] = ['name', 'processes', 'actions'];
  displayedColumnsProcesses: string[] = ['name', 'namespace', 'actions'];

  // Services
  private rbac = inject(RbacService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  // Data loaders
  loadUsers(): void {
    this.rbac.listUsers().subscribe({
      next: (users) => (this.users = users ?? []),
      error: () => this.snack('No se pudieron cargar los usuarios')
    });
  }

  loadRoles(): void {
    this.rbac.listRoles().subscribe({
      next: (roles) => (this.rolesList = roles ?? []),
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
    this.roleSearchText = '';
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
    this.editingUserId = null;
    this.loadUsers();
  }

  addRoleToUser(user: UserRbacDto): void {
    const roleId = this.selectedRoleIdToAdd[user.id];
    if (!roleId) {
      return;
    }
    this.rbac.assignRoleToUser(user.id, roleId).subscribe({
      next: () => {
        this.snack('Rol asignado');
        this.loadUsers();
        this.selectedRoleIdToAdd[user.id] = null;
      },
      error: () => this.snack('No se pudo asignar el rol')
    });
  }

  onRoleSelected(user: UserRbacDto, roleId: number): void {
    if (!roleId) return;
    this.selectedRoleIdToAdd[user.id] = roleId;
    // Agregar y salir del modo edición automáticamente
    this.addRoleToUser(user);
    this.finishEdit();
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
    const assignedIds = new Set<number>((user.roles ?? []).map(r => r.id));
    const q = (query ?? '').toString().toLowerCase().trim();
    return this.rolesList.filter(r => !assignedIds.has(r.id) && (!q || r.name.toLowerCase().includes(q)));
  }
}
