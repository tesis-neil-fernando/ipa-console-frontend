import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

export interface RbacUpdateDialogData {
  kind: 'user' | 'role' | 'namespace' | 'process';
  // current values (optional) - user/role/namespace share `name`; process also has `description`
  name?: string | null;
  description?: string | null;
}

export interface RbacUpdateDialogResult {
  name: string;
  // only present for process updates; null means explicitly cleared
  description?: string | null;
}

@Component({
  selector: 'app-rbac-update-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, FormsModule],
  template: `
    <h2 mat-dialog-title>Editar {{ kindLabel }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" style="width:100%">
        <input matInput placeholder="{{ namePlaceholder }}" [(ngModel)]="name" />
      </mat-form-field>

      <div *ngIf="data.kind === 'process'">
        <mat-form-field appearance="outline" style="width:100%">
          <textarea matInput placeholder="Descripción (vacío para nulo)" rows="3" [(ngModel)]="description"></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="confirm()" [disabled]="!valid()">Guardar</button>
      <button mat-button (click)="cancel()">Cancelar</button>
    </mat-dialog-actions>
  `
})
export class RbacUpdateDialogComponent {
  name: string = '';
  description: string = '';

  constructor(
    private dialogRef: MatDialogRef<RbacUpdateDialogComponent, RbacUpdateDialogResult | null>,
    @Inject(MAT_DIALOG_DATA) public data: RbacUpdateDialogData
  ) {
    this.name = (data.name ?? '') as string;
    this.description = (data.description ?? '') as string;
  }

  get kindLabel(): string {
    if (this.data.kind === 'user') return 'usuario';
    if (this.data.kind === 'role') return 'rol';
    if (this.data.kind === 'namespace') return 'namespace';
    return 'proceso';
  }

  get namePlaceholder(): string {
    if (this.data.kind === 'user') return 'Nombre para mostrar';
    if (this.data.kind === 'role') return 'Nombre del rol';
    if (this.data.kind === 'namespace') return 'Nombre del namespace';
    return 'Nombre del proceso';
  }

  valid(): boolean {
    return (this.name ?? '').toString().trim().length > 0;
  }

  cancel() {
    this.dialogRef.close(null);
  }

  confirm() {
    const result: RbacUpdateDialogResult = { name: (this.name ?? '').toString().trim() };
    if (this.data.kind === 'process') {
      // empty string maps to null (server expects string|null)
      result.description = (this.description ?? '') === '' ? null : this.description;
    }
    this.dialogRef.close(result);
  }
}
