import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'my-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './my-toolbar.html',
  styleUrl: './my-toolbar.css'
})
export class MyToolbar {

}
