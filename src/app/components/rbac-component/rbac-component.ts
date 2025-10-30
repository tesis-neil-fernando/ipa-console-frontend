import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-rbac-component',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule, MatChipsModule, MatDividerModule],
  templateUrl: './rbac-component.html',
  styleUrls: ['./rbac-component.css']
})
export class RbacComponent {
  // Simple wiring copied from Settings to make the RBAC UI functional
  currentView: 'users' | 'roles' | 'namespaces' | 'processes' = 'users';

  items = [
    { id: 1, col1: 'Elemento de ejemplo A', col2: 'Descripción A' },
    { id: 2, col1: 'Elemento de ejemplo B', col2: 'Descripción B' }
  ];

  selectedItem: any | null = null;

  changeView(value: string) {
    if (value === 'users' || value === 'roles' || value === 'namespaces' || value === 'processes') {
      this.currentView = value as any;
    }
  }

  create() {
    const nextId = this.items.length ? Math.max(...this.items.map(i => i.id)) + 1 : 1;
    this.items = [...this.items, { id: nextId, col1: `Nuevo ${nextId}`, col2: 'Descripción nueva' }];
  }

  edit(item: any) {
    this.items = this.items.map(i => i.id === item.id ? { ...i, col1: `${i.col1} (edit)` } : i);
  }

  delete(item: any) {
    this.items = this.items.filter(i => i.id !== item.id);
  }

  view(item: any) {
    // placeholder for navigation or dialog
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
}
