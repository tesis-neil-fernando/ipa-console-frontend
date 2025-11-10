import { Component, inject } from '@angular/core';
import { RbacComponent } from '../../components/rbac-component/rbac-component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatListModule, MatIconModule, MatButtonModule,
    MatMenuModule, MatButtonToggleModule, MatSelectModule,
    MatFormFieldModule, MatInputModule, MatChipsModule, MatDividerModule,
    // RBAC component (moved Administrar usuarios card here)
    // Import the standalone RbacComponent so its selector <app-rbac-component> is recognized
    RbacComponent
  ],
  templateUrl: './settings.html',
  styles: []
})
export class Settings {
  // Simple wiring for the RBAC UI. Replace sample data with real API data.
  currentView: 'users' | 'roles' | 'namespaces' | 'processes' = 'users';

  // Sample items shown in the table; shape: { id, col1, col2 }
  items = [
    { id: 1, col1: 'Elemento de ejemplo A', col2: 'Descripción A' },
    { id: 2, col1: 'Elemento de ejemplo B', col2: 'Descripción B' }
  ];

  // Holds the currently-selected row for actions opened via the menu
  selectedItem: any | null = null;

  // Auth service (used to determine whether to show admin UI)
  private auth = inject(AuthService);
  // Flag that controls RBAC visibility — true only when the current user is admin
  canViewRbac: boolean = this.auth.isAdmin();

  changeView(value: string) {
    if (value === 'users' || value === 'roles' || value === 'namespaces' || value === 'processes') {
      this.currentView = value as any;
      // In a real implementation you'd refresh `items` from a service here.
      // For now we keep sample data and log the selection.
      // console.debug('RBAC view changed to', this.currentView);
    }
  }

  create() {
    // Open a dialog or route to creation page. For now, push a demo item.
    const nextId = this.items.length ? Math.max(...this.items.map(i => i.id)) + 1 : 1;
    this.items = [...this.items, { id: nextId, col1: `Nuevo ${nextId}`, col2: 'Descripción nueva' }];
  }

  edit(item: any) {
    // Replace with real edit flow. Here we append ' (edit)' to col1 for demo.
    this.items = this.items.map(i => i.id === item.id ? { ...i, col1: `${i.col1} (edit)` } : i);
  }

  delete(item: any) {
    this.items = this.items.filter(i => i.id !== item.id);
  }

  view(item: any) {
    // Replace with navigation to detail view or a drawer/dialog.
    // console.debug('Viewing', item);
  }

  // Return a human-friendly label for the current view
  getViewLabel(view?: string) {
    const map: Record<string, string> = {
      users: 'Usuarios',
      roles: 'Roles',
      namespaces: 'Namespaces',
      processes: 'Procesos'
    };
    return map[view || this.currentView] || String(view || this.currentView);
  }
}
