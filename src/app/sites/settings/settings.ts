import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { UserAdminDialogComponent } from './user-admin/user-admin-dialog.component';
import { NotificationsDialogComponent } from './notifications/notifications-dialog.component';
import { SessionsNamespacesDialogComponent } from './security/sessions-namespaces-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDialogModule],
  templateUrl: './settings.html',
  styles: [`.clickable{ cursor: pointer; }`]
})
export class Settings {
  constructor(private dialog: MatDialog) {}

  openUserAdmin() {
    this.dialog.open(UserAdminDialogComponent, {
      width: '1200px', minWidth: '1000px', maxWidth: '96vw',
      height: 'auto',  maxHeight: '92vh',
      panelClass: 'user-admin-dialog'
    });
  }

  openNotifications() {
    this.dialog.open(NotificationsDialogComponent, {
      width: '1100px', minWidth: '900px', maxWidth: '96vw',
      height: 'auto',  maxHeight: '92vh',
      panelClass: 'ipa-dialog'
    });
  }

  openSecurity() {
    this.dialog.open(SessionsNamespacesDialogComponent, {
      width: '1100px', minWidth: '1000px', maxWidth: '96vw',
      height: 'auto',  maxHeight: '92vh',
      panelClass: 'ipa-dialog'
    });
  }
}
