import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

export interface ChangePasswordDialogData {
  username: string;
}

@Component({
  selector: 'app-change-password-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Cambiar contraseña</h2>
    <mat-dialog-content>
      <p>Ingrese una nueva contraseña para el usuario <strong>{{ data.username }}</strong>, o genere una segura.</p>
      <mat-form-field appearance="outline" style="width:100%">
        <mat-label>Nueva contraseña</mat-label>
        <input matInput [(ngModel)]="password" type="text" #pwd>
        <button mat-icon-button matSuffix aria-label="Generar contraseña" (click)="generate()">
          <mat-icon>autorenew</mat-icon>
        </button>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="confirm()" [disabled]="!valid()">Guardar</button>
      <button mat-button (click)="cancel()">Cancelar</button>
    </mat-dialog-actions>
  `
})
export class ChangePasswordDialogComponent {
  password: string = '';

  constructor(
    private dialogRef: MatDialogRef<ChangePasswordDialogComponent, string | null>,
    @Inject(MAT_DIALOG_DATA) public data: ChangePasswordDialogData
  ) {}

  generate() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*()';
    let out = '';
    for (let i = 0; i < 12; i++) {
      out += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.password = out;
  }

  valid(): boolean {
    return (this.password ?? '').toString().trim().length >= 8;
  }

  cancel() {
    this.dialogRef.close(null);
  }

  confirm() {
    this.dialogRef.close(this.password);
  }
}
