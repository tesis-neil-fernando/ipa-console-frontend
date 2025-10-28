import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { UserAdminDialogComponent } from './user-admin/user-admin-dialog.component';

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
      width: '1200px',
      minWidth: '1000px',
      maxWidth: '96vw',
      height: 'auto',
      maxHeight: '92vh',
      panelClass: 'ipa-dialog'   // 👈 clase común para ambos diálogos
    });
  }
}

