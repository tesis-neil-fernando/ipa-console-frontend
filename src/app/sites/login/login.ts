import { Component, inject, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterModule, MatMenuModule, MatCardModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  private router = inject(Router);
  private auth = inject(AuthService);

  username = '';

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/console/dashboard']);
    }
  }
  password = '';

  login() {
    this.auth.login({ username: this.username, password: this.password }).subscribe(success => {
      if (success) {
        this.router.navigate(['/console/dashboard']);
      } else {
        console.error('Login failed');
      }
    });
  }

}
