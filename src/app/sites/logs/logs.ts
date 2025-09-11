import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-logs',
  imports: [CommonModule, MatTableModule],
  templateUrl: './logs.html',
  styleUrl: './logs.css'
})
export class Logs {
   displayedColumns = ['time', 'process', 'trigger', 'status', 'duration', 'actions'];
  logs = [
    {
      time: '2025-06-29 10:00:00',
      process: 'Generación de campañas para clientes mensuales',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '30m 15s'
    },
    {
      time: '2025-06-29 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '2m 05s'
    },
    {
      time: '2025-06-28 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '1m 30s'
    },
    {
      time: '2025-06-27 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '1m 50s'
    },
    {
      time: '2025-06-26 12:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Desencadenado por usuario: Manuel Ortega',
      status: 'Ejecución exitosa',
      duration: '2m 10s'
    },
    {
      time: '2025-06-26 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Error de ejecución',
      duration: '0m 00s'
    },
    {
      time: '2025-06-25 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '4m 00s'
    },
    {
      time: '2025-06-24 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '3m 25s'
    },
    {
      time: '2025-06-23 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '2m 55s'
    },
    {
      time: '2025-06-22 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '5m 10s'
    },
    {
      time: '2025-06-21 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '2m 20s'
    },
    {
      time: '2025-06-20 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '1m 45s'
    },
    {
      time: '2025-06-19 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '1m 20s'
    },
    {
      time: '2025-06-18 09:00:00',
      process: 'Generación de leads de clientes no adeudos',
      trigger: 'Programado',
      status: 'Ejecución exitosa',
      duration: '2m 35s'
    },
    {
      time: '2025-06-17 09:00:00',
      process: 'Re-inserción',
      trigger: 'Desencadenado por usuario: Juan Pérez',
      status: 'Ejecución exitosa',
      duration: '3m 00s'
    },
    {
      time: '2025-06-16 09:00:00',
      process: 'Re-inserción',
      trigger: 'Desencadenado por usuario: Ana Gómez',
      status: 'Ejecución exitosa',
      duration: '3m 10s'
    }
  ];
}
