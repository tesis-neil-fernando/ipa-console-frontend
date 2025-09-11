import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-processes',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './processes.html',
  styleUrl: './processes.css'
})
export class Processes {
    processes = [
    {
      title: 'Generación de leads de clientes no adeudos',
      subtitle: 'Proceso programado de generación de campañas para clientes no adeudos',
      activeNode: 'Nodo activo',
      successfulExec: 'Ejecución exitosa',
      timeAgo: 'Hace 23 min'
    },
    {
      title: 'Generación de campañas mensual',
      subtitle: 'Proceso programado de generación de campañas mensual para clientes generales',
      activeNode: 'Nodo activo',
      successfulExec: 'Ejecución exitosa',
      timeAgo: 'Hace 15 días'
    },
    {
      title: 'Re-inserción',
      subtitle: 'Proceso de reinserción desencadenado por correo',
      activeNode: 'Nodo activo',
      successfulExec: 'Ejecución exitosa',
      timeAgo: 'Hace 2 días'
    },
    {
      title: 'Elaboración de informes de efectividad',
      subtitle: 'Proceso programado de elaboración masiva de informes de efectividad',
      activeNode: 'Nodo activo',
      successfulExec: 'Ejecución exitosa',
      timeAgo: 'Hace 1 hora'
    }
  ];
}
