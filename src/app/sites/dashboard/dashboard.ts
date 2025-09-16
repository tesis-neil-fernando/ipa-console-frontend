import { Component } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';


@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, CommonModule, MatCardModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
   // Chart 1: Pie
  public pieChartLabels: string[] = ['Activo', 'Inactivo'];
  public pieChartData = {
    labels: this.pieChartLabels,
    datasets: [{ data: [95, 5] }]
  };
  public pieChartType: ChartType = 'pie';

  // Chart 2: Bar
  public barChartLabels: string[] = ['Advertencia', 'Error', 'Informativo'];
  public barChartData = {
    labels: this.barChartLabels,
    datasets: [{ label: 'Cantidad', data: [5, 2, 30] }]
  };
  public barChartType: ChartType = 'bar';

  // Chart 3: Line
  public lineChartLabels: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  public lineChartData = {
    labels: this.lineChartLabels,
    datasets: [{ label: 'Cantidad', data: [0, 0, 1, 0, 1, 0, 0] }]
  };
  public lineChartType: ChartType = 'line';
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true
  };

  // Chart 4: Stacked Bar
  public stackedBarChartLabels: string[] = ['Robot 1', 'Robot 2', 'Robot 3', 'Robot 4', 'Robot 5', 'Robot 6'];
  public stackedBarChartData = {
    labels: this.stackedBarChartLabels,
    datasets: [
      { label: 'Normal', data: [60, 75, 45, 70, 80, 55] },
      { label: 'Sobrecargado', data: [0, 0, 0, 0, 10, 0] }
    ]
  };
  public stackedBarChartType: ChartType = 'bar';
  public stackedBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    }
  };
}
