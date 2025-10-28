import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { UserEditDialogComponent, UserView } from './user-edit-dialog.component';

const MOCK_USERS: UserView[] = [
  { id:1, username:'fschilder',   enabled:true,  roles:['administrador'],           permissions:['administrador','visualizar','ejecutar','editar_parametros'] },
  { id:2, username:'ntrujillo',   enabled:true,  roles:['inteligencia_comercial'],  permissions:['visualizar','ejecutar'] },
  { id:3, username:'marketing_u', enabled:false, roles:['marketing'],               permissions:['visualizar'] }
];

@Component({
  selector: 'app-user-admin-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule
  ],
  templateUrl: './user-admin-dialog.component.html',
  styles: [`
    :host { display:block; min-width: 1000px; }      /* 👈 listado más ancho */
    table { width: 100%; }
    mat-dialog-content { overflow: auto; max-height: 80vh; }
  `]
})
export class UserAdminDialogComponent {
  displayedColumns = ['username','enabled','roles','acciones'];
  dataSource = new MatTableDataSource<UserView>(MOCK_USERS);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {}

  ngAfterViewInit(){ this.dataSource.paginator = this.paginator; }

  edit(row: UserView){
    this.dialog.open(UserEditDialogComponent, {
      width: '900px',          // 👈 editor más grande
      minWidth: '820px',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '92vh',
      panelClass: 'ipa-dialog',  // 👈 misma clase global para padding 3mm
      data: { user: { ...row } }
    }).afterClosed().subscribe(res => {
      if(!res) return;
      const i = this.dataSource.data.findIndex(u => u.id === res.id);
      if(i>=0){ this.dataSource.data[i] = res; this.dataSource._updateChangeSubscription(); }
    });
  }
}
