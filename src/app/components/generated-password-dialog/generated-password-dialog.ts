import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Clipboard, ClipboardModule } from '@angular/cdk/clipboard';

export interface GeneratedPasswordDialogData {
  username: string;
  password: string;
}

@Component({
  selector: 'app-generated-password-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, ClipboardModule],
  template: `
    <h2 mat-dialog-title>Usuario creado</h2>
    <mat-dialog-content>
    <p>Guarde esta información, ya que la contraseña no se mostrará de nuevo.</p>
      <mat-form-field appearance="outline">
        <mat-label>Usuario</mat-label>
        <input matInput [value]="data.username" readonly>
      </mat-form-field>
      <br>
      <mat-form-field appearance="outline">
        <mat-label>Contraseña</mat-label>
        <input matInput [value]="data.password" readonly #pwd>
        <button mat-icon-button matSuffix aria-label="Copiar contraseña" (click)="copy(pwd.value)">
          <mat-icon>{{ copied ? 'check' : 'content_copy' }}</mat-icon>
        </button>
        <mat-hint *ngIf="copied">¡Contraseña copiada!</mat-hint>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="close()">Aceptar</button>
    </mat-dialog-actions>
  `
})
export class GeneratedPasswordDialogComponent {
  copied = false;
  constructor(
    private clipboard: Clipboard,
    private dialogRef: MatDialogRef<GeneratedPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GeneratedPasswordDialogData
  ) {}

  copy(text: string) {
    try {
      this.clipboard.copy(text);
      this.copied = true;
    } catch {}
  }

  close() {
    this.dialogRef.close(true);
  }
}
