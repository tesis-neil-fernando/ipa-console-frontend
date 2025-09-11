import { Component } from '@angular/core';
import { MyToolbar } from '../../components/my-toolbar/my-toolbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'main-layout',
  imports: [RouterOutlet, MyToolbar],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css'
})
export class MainLayout {

}
