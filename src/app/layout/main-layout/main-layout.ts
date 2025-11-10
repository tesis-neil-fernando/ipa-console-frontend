import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth-service';


@Component({
  selector: 'main-layout',
  imports: [RouterOutlet, MatSidenavModule, MatButtonModule, MatToolbarModule, MatIconModule, RouterModule, MatMenuModule, MatListModule],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {
  private auth = inject(AuthService);

  logout() {
    this.auth.logout();
  }

  // Expose a stable property the template can bind to. Keep the logic here to avoid
  // calling service parsing repeatedly from the template.
  get userName(): string {
    try {
      const name = this.auth.getDisplayName ? this.auth.getDisplayName() : null;
      return name || 'Usuario';
    } catch {
      return 'Usuario';
    }
  }
}
