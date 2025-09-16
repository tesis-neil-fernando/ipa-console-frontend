import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {

}
