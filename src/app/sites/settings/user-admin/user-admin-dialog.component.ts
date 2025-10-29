import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule }   from '@angular/material/icon';
import { MatChipsModule }  from '@angular/material/chips';
import { MatTableModule }  from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import { UsersService } from '../../../services/users.service';
import { UserView } from '../../../services/users.models';
import { UserEditDialogComponent } from './user-edit-dialog.component';

@Component({
  selector   : 'app-user-admin-dialog',
  standalone : true,
  templateUrl: './user-admin-dialog.component.html',
  imports    : [
    CommonModule,
    MatDialogModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatTableModule, MatPaginatorModule
  ]
})
export class UserAdminDialogComponent implements OnInit {

  private usersSvc  = inject(UsersService);
  private dialog    = inject(MatDialog);
  private ref       = inject(MatDialogRef<UserAdminDialogComponent>);

  // tabla
  displayedColumns: string[] = ['username', 'enabled', 'roles', 'namespaces', 'actions'];
  users: UserView[] = [];

  // paginación
  pageIndex = 0;
  pageSize  = 5;
  total     = 0;

  loading = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.usersSvc
      .list({
        page: this.pageIndex,
        size: this.pageSize,
        sort: 'username,asc'
      })
      .subscribe({
        next: (resp) => {
          // PageResp<UserView>
          this.users    = resp.content ?? [];
          this.total    = resp.totalElements ?? 0;
          this.pageSize = resp.size ?? this.pageSize;
          this.pageIndex= resp.number ?? this.pageIndex;
          this.loading  = false;
        },
        error: (err) => {
          console.error('Error cargando usuarios', err);
          this.loading = false;
        }
      });
  }

  onPage(e: PageEvent) {
    this.pageIndex = e.pageIndex;
    this.pageSize  = e.pageSize;
    this.load();
  }

  editar(u: UserView) {
    this.dialog.open(UserEditDialogComponent, {
      width: '680px',
      maxHeight: '90vh',
      data: { user: u }
    }).afterClosed().subscribe(changed => {
      if (changed) this.load();
    });
  }

  cerrar() {
    this.ref.close();
  }
}
