import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';

import { RbacService, RoleRbacDto, NamespaceRbacDto, UserRbacDto, ProcessRbacDto } from '../../services/rbac-service';

@Component({
  selector: 'app-rbac-component',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatChipsModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
    ,MatTabsModule
    ,MatDialogModule
    ,MatSnackBarModule
    ,FormsModule
    ,MatTableModule
  ],
  templateUrl: './rbac-component.html',
  styleUrls: ['./rbac-component.css']
})
export class RbacComponent implements OnInit {
  currentView: 'users' | 'roles' | 'namespaces' | 'processes' = 'users';

  // Generic table items (columns are derived per-view)
  items: Array<any> = [];

  // When a row is selected we show the detailed view
  selectedItem: any | null = null;
  selectedDetails: any | null = null;

  // auxiliary lists for assignment controls
  roles: RoleRbacDto[] = [];
  namespaces: NamespaceRbacDto[] = [];
  processes: ProcessRbacDto[] = [];
  // permission assignment helpers
  selectedNamespaceForPermissions: number | null = null;
  namespacePermissionOptions: Array<{ id: number; type: string }> = [];

  constructor(private rbac: RbacService, public dialog: MatDialog, public snack: MatSnackBar) {}

  ngOnInit(): void {
    // preload small lists used in assign controls and for mapping names
    this.rbac.listRoles().subscribe(r => this.roles = r || []);
    this.rbac.listNamespaces().subscribe(n => this.namespaces = n || []);
    this.rbac.listProcesses().subscribe(p => this.processes = p || []);
    // initial list
    this.loadList();
  }

  // helper for tab-group binding: map view to index
  getViewIndex(): number {
    switch (this.currentView) {
      case 'users': return 0;
      case 'roles': return 1;
      case 'namespaces': return 2;
      case 'processes': return 3;
      default: return 0;
    }
  }

  onTabChange(index: number) {
    const map = ['users', 'roles', 'namespaces', 'processes'];
    const v = map[index] || 'users';
    this.changeView(v);
  }

  // --- Edit dialog support ---
  @ViewChild('editDialog') editDialog!: TemplateRef<any>;
  editModel: any = null;

  // Opens a dialog to edit the basic fields of the provided item.
  // Backend update endpoints are not implemented for all entities, so this performs a local optimistic update
  // and informs the user.
  edit(item: any) {
    // prepare a shallow copy for editing
    const raw = item?.raw || item || {};
    this.editModel = JSON.parse(JSON.stringify(raw));
    // open dialog template (the template is in the component HTML)
    try {
      const dialogRef = this.dialog.open(this.editDialog);
    } catch (e) {
      // If MatDialog wasn't injected (older build), fallback to alert
      window.alert('Editar: ' + (this.editModel?.name || this.editModel?.username || 'n/a'));
    }
  }

  // Save changes locally and close dialog
  saveEdit() {
    if (!this.editModel) return;
    // update selectedDetails if it's the same entity
    if (this.selectedDetails && this.selectedDetails.id === this.editModel.id) {
      Object.assign(this.selectedDetails, this.editModel);
    }
    // update item in the list
    this.items = this.items.map(i => {
      if (i.id === this.editModel.id) {
        const col1 = this.editModel.username || this.editModel.name || i.col1;
        return { ...i, col1, raw: this.editModel };
      }
      return i;
    });
    // close dialog and notify
    try {
      this.dialog.closeAll();
      this.snack.open('Guardado localmente. El backend no soporta actualización vía API en esta vista.', 'Cerrar', { duration: 4000 });
    } catch (e) {
      // fallback
      window.alert('Guardado (local).');
    }
    this.editModel = null;
  }

  // new: material dataSource backing array for detail table
  detailRows: Array<{ field: string; key: string; value: any }> = [];

  changeView(value: string) {
    if (value === 'users' || value === 'roles' || value === 'namespaces' || value === 'processes') {
      this.currentView = value as any;
      this.selectedItem = null;
      this.selectedDetails = null;
      this.detailRows = []; // clear detail rows when changing view
      this.loadList();
    }
  }

  loadList() {
    if (this.currentView === 'users') {
      this.rbac.listUsers().subscribe(data => {
        this.items = data.map(u => {
          // try multiple strategies to extract role names
          let roleNames: string[] = [];
          if (u.roles && u.roles.length) {
            // roles are provided as objects
            roleNames = (u.roles as any[]).map(r => r.name).filter(Boolean);
          } else if ((u as any).roles && (u as any).roles.length && typeof (u as any).roles[0] === 'number') {
            // roles provided as array of ids
            roleNames = (u as any).roles.map((id: number) => this.roles.find(rr => rr.id === id)?.name).filter(Boolean);
          } else if (this.roles && this.roles.length && (u as any).roleIds && (u as any).roleIds.length) {
            roleNames = (u as any).roleIds.map((id: number) => this.roles.find(rr => rr.id === id)?.name).filter(Boolean);
          }
          return { id: u.id, col1: u.username, col2: roleNames.join(', '), raw: u };
        });
      });
    } else if (this.currentView === 'roles') {
      this.rbac.listRoles().subscribe(data => {
        this.items = data.map(r => ({ id: r.id, col1: r.name, col2: (r.permissions || []).map(p => p.type).join(', '), raw: r }));
      });
    } else if (this.currentView === 'namespaces') {
      // list namespaces and processes then join so we always show processes associated with each namespace
      this.rbac.listNamespaces().subscribe(namespaces => {
        this.rbac.listProcesses().subscribe(processes => {
          this.items = namespaces.map(n => {
            const procs = (processes || []).filter(p => {
              if (!p) return false;
              const anyP = p as any;
              // nested namespace object
              if (anyP.namespace) {
                const ns = anyP.namespace;
                if (typeof ns === 'object') return ns.id === n.id || ns === n;
                return ns === n.id;
              }
              // explicit namespaceId field (backend shape)
              if (anyP.namespaceId) return anyP.namespaceId === n.id;
              if (anyP.namespace_id) return anyP.namespace_id === n.id;
              // fallback: match by namespaceName
              if (anyP.namespaceName && n.name) return anyP.namespaceName === n.name;
              return false;
            }).map(p => p.name);
            return { id: n.id, col1: n.name, col2: (procs || []).join(', '), raw: n };
          });
        });
      });
    } else if (this.currentView === 'processes') {
      this.rbac.listProcesses().subscribe(data => {
        this.items = data.map(p => {
          let nsName = '';
          const ns = (p as any).namespace;
          if (ns) {
            if (typeof ns === 'object') nsName = ns.name || '';
            else if (typeof ns === 'number') nsName = this.namespaces.find(n => n.id === ns)?.name || '';
            else if (typeof ns === 'string') nsName = ns; // fallback
          } else {
            // try to infer from preloaded namespaces via process raw (maybe process has namespace_id)
            const raw = p as any;
            const nsId = raw.namespaceId || raw.namespace_id || (raw.namespace && raw.namespace.id);
            if (nsId) nsName = this.namespaces.find(n => n.id === nsId)?.name || '';
          }
          return { id: p.id, col1: p.name, col2: nsName, raw: p };
        });
      });
    }
  }

  // Create actions (small prompt-based UI)
  create() {
    if (this.currentView === 'roles') {
      const name = window.prompt('Nombre del rol:');
      if (name && name.trim()) {
        this.rbac.createRole({ name: name.trim() }).subscribe(() => this.loadList());
      }
    } else if (this.currentView === 'namespaces') {
      const name = window.prompt('Nombre del namespace:');
      if (name && name.trim()) {
        this.rbac.createNamespace({ name: name.trim() }).subscribe(() => this.loadList());
      }
    } else {
      // creating users/processes is out-of-scope for this quick wiring
      window.alert('Crear para esta vista no implementado');
    }
  }

  

  delete(item: any) {
    // placeholder - implement delete flow as needed
    if (!item) return;
    const ok = window.confirm('Eliminar elemento ' + (item?.col1 || item?.name || item?.username) + '?');
    if (!ok) return;
    // best-effort remove from current items view (no backend endpoint used here)
    this.items = this.items.filter(i => i.id !== item.id);
  }

  view(item: any) {
    this.selectedItem = item;
    // fetch full details
    if (this.currentView === 'users') {
      this.rbac.getUserById(item.id).subscribe(u => {
        this.selectedDetails = u;
        this.detailRows = this.getDetailRows();
      });
    } else if (this.currentView === 'roles') {
      this.rbac.getRoleById(item.id).subscribe(r => {
        this.selectedDetails = r;
        this.detailRows = this.getDetailRows();
      });
      // clear permission selector state
      this.selectedNamespaceForPermissions = null;
      this.namespacePermissionOptions = [];
    } else if (this.currentView === 'namespaces') {
      this.rbac.getNamespaceById(item.id).subscribe(n => {
        this.selectedDetails = n;
        this.detailRows = this.getDetailRows();
      });
    } else if (this.currentView === 'processes') {
      // process details endpoint not present; reuse list item raw
      this.selectedDetails = item.raw || item;
      // normalize to keep template using selectedDetails.namespace?.name
      if (this.selectedDetails) {
        const sd: any = this.selectedDetails;
        if (!sd.namespace && (sd.namespaceId || sd.namespaceName)) {
          sd.namespace = { id: sd.namespaceId, name: sd.namespaceName };
        }
      }
      this.detailRows = this.getDetailRows();
    }
  }

  backToList() {
    this.selectedItem = null;
    this.selectedDetails = null;
    this.detailRows = [];
    this.loadList();
  }

  assignRoleToUser(roleId: number) {
    if (!this.selectedDetails || !this.selectedDetails.id) return;
    this.rbac.assignRoleToUser(this.selectedDetails.id, roleId).subscribe(() => {
      this.rbac.getUserById(this.selectedDetails.id).subscribe(u => {
        this.selectedDetails = u;
        this.detailRows = this.getDetailRows();
      });
      this.loadList();
    });
  }

  removeRoleFromUser(roleId: number) {
    if (!this.selectedDetails || !this.selectedDetails.id) return;
    this.rbac.removeRoleFromUser(this.selectedDetails.id, roleId).subscribe(() => {
      this.rbac.getUserById(this.selectedDetails.id).subscribe(u => {
        this.selectedDetails = u;
        this.detailRows = this.getDetailRows();
      });
      this.loadList();
    });
  }

  assignPermissionToRole(permissionId: number) {
    if (!this.selectedDetails || !this.selectedDetails.id || !permissionId) return;
    this.rbac.assignPermissionToRole(this.selectedDetails.id, permissionId).subscribe(() => {
      this.rbac.getRoleById(this.selectedDetails.id).subscribe(r => {
        this.selectedDetails = r;
        this.detailRows = this.getDetailRows();
      });
      this.loadList();
    });
  }

  removePermissionFromRole(permissionId: number) {
    if (!this.selectedDetails || !this.selectedDetails.id || !permissionId) return;
    this.rbac.removePermissionFromRole(this.selectedDetails.id, permissionId).subscribe(() => {
      this.rbac.getRoleById(this.selectedDetails.id).subscribe(r => {
        this.selectedDetails = r;
        this.detailRows = this.getDetailRows();
      });
      this.loadList();
    });
  }

  assignProcessToNamespace(processId: number) {
    if (!this.selectedDetails || !this.selectedDetails.id) return;
    this.rbac.assignProcessToNamespace(processId, this.selectedDetails.id).subscribe(() => {
      this.rbac.getNamespaceById(this.selectedDetails.id).subscribe(n => {
        this.selectedDetails = n;
        this.detailRows = this.getDetailRows();
      });
      this.loadList();
    });
  }

  removeProcessFromNamespace(processId: number) {
    if (!this.selectedDetails || !this.selectedDetails.id) return;
    this.rbac.removeProcessFromNamespace(processId, this.selectedDetails.id).subscribe(() => {
      this.rbac.getNamespaceById(this.selectedDetails.id).subscribe(n => {
        this.selectedDetails = n;
        this.detailRows = this.getDetailRows();
      });
      this.loadList();
    });
  }

  getViewLabel(view?: string) {
    const map: Record<string, string> = {
      users: 'Usuarios',
      roles: 'Roles',
      namespaces: 'Namespaces',
      processes: 'Procesos'
    };
    return map[view || this.currentView] || String(view || this.currentView);
  }

  // column header helpers used by the template
  getCol1Label(): string {
    switch (this.currentView) {
      case 'users': return 'Usuario';
      case 'roles': return 'Nombre';
      case 'namespaces': return 'Nombre';
      case 'processes': return 'Nombre';
      default: return 'Columna 1';
    }
  }

  getCol2Label(): string {
    switch (this.currentView) {
      case 'users': return 'Roles';
      case 'roles': return 'Permisos';
      case 'namespaces': return 'Procesos';
      case 'processes': return 'Namespace';
      default: return 'Columna 2';
    }
  }

  // table wiring for mat-table
  displayedColumns: string[] = ['col1', 'col2', 'actions'];
  get dataSource() { return this.items; }

  // detail table wiring
  detailDisplayedColumns: string[] = ['field', 'value'];

  // build rows for the detail mat-table based on currentView + selectedDetails
  getDetailRows(): Array<{ field: string; key: string; value: any }> {
    const sd: any = this.selectedDetails;
    if (!sd) return [];

    if (this.currentView === 'users') {
      return [
        { field: 'Username', key: 'username', value: sd.username },
        { field: 'Roles', key: 'roles', value: sd.roles || [] }
      ];
    }

    if (this.currentView === 'roles') {
      return [
        { field: 'Nombre', key: 'name', value: sd.name },
        { field: 'Permisos', key: 'permissions', value: sd.permissions || [] }
      ];
    }

    if (this.currentView === 'namespaces') {
      return [
        { field: 'Nombre', key: 'name', value: sd.name },
        { field: 'Procesos', key: 'processes', value: sd.processes || [] }
      ];
    }

    if (this.currentView === 'processes') {
      return [
        { field: 'Nombre', key: 'name', value: sd.name },
        { field: 'Namespace', key: 'namespace', value: sd.namespace || null },
        { field: 'Descripción', key: 'description', value: sd.description || '-' }
      ];
    }

    return [];
  }

  loadNamespacePermissions(nsId: number | null) {
    if (!nsId) {
      this.namespacePermissionOptions = [];
      return;
    }
    this.rbac.getNamespaceById(nsId).subscribe(
      ns => {
        this.namespacePermissionOptions = (ns.permissions || []).map(p => ({ id: p.id, type: p.type }));
      },
      () => {
        this.namespacePermissionOptions = [];
      }
    );
  }
}
