import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

export interface RbacCreateDialogData {
  kind: 'user' | 'role' | 'namespace';
}

export interface RbacCreateDialogResult {
  name: string;
  // fullName is optional and only used when creating users (display/full name)
  fullName?: string;
  password?: string;
}

@Component({
  selector: 'app-rbac-create-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Crear {{ kindLabel }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width:100%">
        <input matInput placeholder="{{ namePlaceholder }}" [(ngModel)]="name" />
      </mat-form-field>

      <div *ngIf="data.kind === 'user'">
        <mat-form-field appearance="outline" style="width:100%">
          <input matInput placeholder="Nombre completo (opcional)" [(ngModel)]="fullName" />
        </mat-form-field>
        <mat-form-field appearance="outline" style="width:100%">
          <input matInput placeholder="Contraseña" type="password" [(ngModel)]="password" />
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="confirm()" [disabled]="!name || (data.kind === 'user' && !password)">Crear</button>
      <button mat-button (click)="cancel()">Cancelar</button>
    </mat-dialog-actions>
  `
})
export class RbacCreateDialogComponent {
  name: string = '';
  fullName: string = '';
  password: string = '';

  constructor(
    private dialogRef: MatDialogRef<RbacCreateDialogComponent, RbacCreateDialogResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: RbacCreateDialogData
  ) {}

  get kindLabel(): string {
    if (this.data.kind === 'user') return 'usuario';
    if (this.data.kind === 'role') return 'rol';
    return 'namespace';
  }

  get namePlaceholder(): string {
    if (this.data.kind === 'user') return 'Nombre de usuario';
    if (this.data.kind === 'role') return 'Nombre del rol';
    return 'Nombre del namespace';
  }

  cancel() {
    this.dialogRef.close(null);
  }

  confirm() {
    const result: RbacCreateDialogResult = { name: this.name };
    if (this.data.kind === 'user') {
      result.password = this.password;
      if (this.fullName) result.fullName = this.fullName;
    }
    this.dialogRef.close(result);
  }
}
