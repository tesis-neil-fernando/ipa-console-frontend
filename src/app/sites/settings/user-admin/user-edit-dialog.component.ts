import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';

export interface UserView {
  id: number;
  username: string;
  enabled: boolean;
  roles: string[];
  permissions: string[];
}

const ALL_ROLES = ['administrador','inteligencia_comercial','marketing'];
const ALL_PERMISSIONS = ['administrador','visualizar','ejecutar','editar_parametros'];

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatButtonModule
  ],
  templateUrl: './user-edit-dialog.component.html',
  styles: [`
    :host { display:block; }
    mat-form-field { width: 100%; margin-bottom: 14px; }  /* aire vertical entre controles */
  `]
})
export class UserEditDialogComponent {
  allRoles = ALL_ROLES;
  allPerms = ALL_PERMISSIONS;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ref: MatDialogRef<UserEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserView }
  ) {
    this.form = this.fb.group({
      id: [0],
      username: ['', [Validators.required, Validators.maxLength(100)]],
      enabled: [true],
      roles: [[] as string[]],
      permissions: [[] as string[]]
    });

    this.form.patchValue(data.user);
  }

  save(){
    if (this.form.invalid) return;
    this.ref.close(this.form.value as UserView);
  }
}
