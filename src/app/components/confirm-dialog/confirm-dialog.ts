import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
    <h2 mat-dialog-title>{{ data.title || 'Confirmar' }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
    <button mat-button color="warn" (click)="onConfirm()">{{ data.confirmText || 'Aceptar' }}</button>  
    <button mat-button (click)="onCancel()">{{ data.cancelText || 'Cancelar' }}</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>,
        @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
    ) { }

    onConfirm(): void {
        this.dialogRef.close(true);
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }
}
