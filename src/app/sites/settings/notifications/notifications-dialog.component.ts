import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { NotificationsService } from './notifications.service';
import { Notification } from './notifications.model';

@Component({
  selector: 'app-notifications-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule, MatListModule, MatIconModule, MatButtonModule,
    MatSlideToggleModule, MatFormFieldModule, MatSelectModule,
    MatChipsModule, MatDividerModule, ReactiveFormsModule
  ],
  templateUrl: './notifications-dialog.component.html'
})
export class NotificationsDialogComponent {
  private svc = inject(NotificationsService);
  private ref = inject(MatDialogRef<NotificationsDialogComponent>);
  private fb = inject(FormBuilder);

  items$ = this.svc.items$;

  // Preferencias (mock): listo para persistir luego
  form = this.fb.group({
    emailChannel: [true],
    minSeverity: ['INFO'],
    namespaces: [['inteligencia_comercial', 'marketing']]
  });

  iconFor(n: Notification) {
    switch (n.type) {
      case 'SECURITY': return 'security';
      case 'WARNING':  return 'warning';
      case 'SYSTEM':   return 'build';
      default:         return 'notifications';
    }
  }

  colorFor(n: Notification) {
    switch (n.type) {
      case 'SECURITY': return 'warn';
      case 'WARNING':  return 'warn';
      case 'SYSTEM':   return 'accent';
      default:         return 'primary';
    }
  }

  markRead(id: number)    { this.svc.markRead(id); }
  markAllRead()           { this.svc.markAllRead(); }
  testNotification()      { this.svc.addMock('INFO'); }

  savePrefs() {
    // Aquí luego harás PUT /notification-prefs/me
    console.log('Preferencias guardadas (mock):', this.form.value);
    this.ref.close();
  }

  close() { this.ref.close(); }
}
