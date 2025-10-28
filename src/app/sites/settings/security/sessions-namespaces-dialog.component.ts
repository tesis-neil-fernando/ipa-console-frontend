import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { SecurityService } from './security.service';
import { SessionInfo, NamespaceScope } from './security.model';

@Component({
  selector: 'app-sessions-namespaces-dialog',
  standalone: true,
  imports: [
    CommonModule, MatDialogModule, MatTableModule, MatChipsModule,
    MatIconModule, MatButtonModule, MatTooltipModule, MatDividerModule
  ],
  templateUrl: './sessions-namespaces-dialog.component.html',
  styles: [`
    :host { display:block; min-width: 1000px; }
    section { margin-bottom: 16px; }
    table { width: 100%; }
    .scope-card { padding: 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); }
    .scope-title { display:flex; align-items:center; gap:8px; margin:0 0 8px; }
    .ns-badge { font-weight: 600; opacity: .9; }
  `]
})
export class SessionsNamespacesDialogComponent {
  private svc = inject(SecurityService);
  private ref = inject(MatDialogRef<SessionsNamespacesDialogComponent>);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private data = inject(MAT_DIALOG_DATA, { optional: true });

  sessions$ = this.svc.sessions$;
  scopes$   = this.svc.scopes$;

  displayedColumns = ['device', 'ip', 'location', 'lastActivity', 'current', 'actions'];

  terminate(id: string) { this.svc.terminateSession(id); }
  terminateOthers()     { this.svc.terminateAllExceptCurrent(); }
  close()               { this.ref.close(); }

  iconForSession(s: SessionInfo) {
    return s.current ? 'devices' : 'devices_other';
  }
}
