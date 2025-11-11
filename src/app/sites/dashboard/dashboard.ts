import { Component, inject, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService, ChartCountDto, DayCountDto, ProcessErrorPercentageDto } from '../../services/dashboard-service';


@Component({
  selector: 'app-dashboard',
  imports: [BaseChartDirective, CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
   // Chart 1: Pie
  public pieChartLabels: string[] = ['Activos', 'Inactivos'];
  public pieChartData = {
    labels: this.pieChartLabels,
    datasets: [{ data: [0, 0] }]
  };
  public pieChartType: ChartType = 'pie';

  // Chart 2: Bar (placeholder until implemented)
  public barChartLabels: string[] = ['Advertencia', 'Error', 'Informativo'];
  public barChartData = {
    labels: this.barChartLabels,
    datasets: [{ label: 'Cantidad', data: [5, 2, 30] }]
  };
  public barChartType: ChartType = 'bar';

  // Chart 3: Line (placeholder until implemented)
  public lineChartLabels: string[] = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  public lineChartData = {
    labels: this.lineChartLabels,
    datasets: [{ label: 'Cantidad', data: [0, 0, 1, 0, 1, 0, 0] }]
  };
  public lineChartType: ChartType = 'line';
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  // Chart 4: Stacked Bar (placeholder until implemented)
  public stackedBarChartLabels: string[] = ['Robot 1', 'Robot 2', 'Robot 3', 'Robot 4', 'Robot 5', 'Robot 6'];
  // datasets will be built from statusCounts (success, running, waiting, canceled, error)
  public stackedBarChartData = {
    labels: this.stackedBarChartLabels,
    datasets: [
      { label: 'Éxito', data: [60, 75, 45, 70, 80, 55] },
      { label: 'En ejecución', data: [0, 0, 0, 0, 10, 0] },
      { label: 'En espera', data: [0, 0, 0, 0, 0, 0] },
      { label: 'Cancelado', data: [0, 0, 0, 0, 0, 0] },
      { label: 'Errores', data: [0, 0, 0, 0, 0, 0] }
    ]
  };
  public stackedBarChartType: ChartType = 'bar';
  public stackedBarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    }
  };

  // Ensure pie and bar charts also respect container height
  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false
  };

  ngOnInit(): void {
    // Initialize pie chart and line chart (errors per day).
    this.loadProcessesByActiveState();
    this.loadErrorsByDay();
    // Load executions per day (chart 3)
    this.loadExecutionsByDay();
    // Load error percentage per process (chart 4)
    this.loadErrorPercentagePerProcess();
  }

  // 1. Pie chart: processes by active state
  private loadProcessesByActiveState() {
    this.dashboardService.getProcessesByActiveState().subscribe((data: ChartCountDto[]) => {
      const active = data.find(d => d.key === 'active')?.count ?? data.find(d => d.key === 'Activo')?.count ?? 0;
      const inactive = data.find(d => d.key === 'inactive')?.count ?? data.find(d => d.key === 'Inactivo')?.count ?? 0;
      this.pieChartData = {
        labels: this.pieChartLabels,
        datasets: [{ data: [active, inactive] }]
      };
    });
  }

  // 2. Line chart: errors per day (last 7 days by default)
  public loadErrorsByDay(days = 7) {
    this.dashboardService.getErrorsByDay(days).subscribe((items: DayCountDto[]) => {
      this.lineChartLabels = items.map(i => i.day);
      this.lineChartData = {
        labels: this.lineChartLabels,
        datasets: [{ label: 'Errores', data: items.map(i => i.count) }]
      };
    });
  }

  // 3. Column chart: executions per day
  public loadExecutionsByDay(days = 7) {
    this.dashboardService.getExecutionsByDay(days).subscribe((items: DayCountDto[]) => {
      this.barChartLabels = items.map(i => i.day);
      this.barChartData = {
        labels: this.barChartLabels,
        datasets: [{ label: 'Ejecuciones', data: items.map(i => i.count) }]
      };
    });
  }

  // 4. Stacked bar: error percentage per process (we will show executed vs errors counts stacked)
  public loadErrorPercentagePerProcess(days = 30) {
    this.dashboardService.getErrorPercentagePerProcess(days).subscribe((items: ProcessErrorPercentageDto[]) => {
      // Sort by totalExecutions desc for display
      const list = items.slice().sort((a, b) => (b.totalExecutions || 0) - (a.totalExecutions || 0));
       // Show only the process name as label (remove percentage suffix)
       this.stackedBarChartLabels = list.map(i => {
         const name = i.processName ?? `#${i.processId ?? 'unmapped'}`;
         return name;
       });

      // Define the ordered statuses we want to show in the stacked bar (consistent order)
      const statuses = ['success', 'running', 'waiting', 'canceled', 'error'];
      const labelMap: Record<string, string> = {
        success: 'Éxito',
        running: 'En ejecución',
        waiting: 'En espera',
        canceled: 'Cancelado',
        error: 'Errores'
      };

      const datasets = statuses.map((status) => {
        return {
          label: labelMap[status] ?? status,
          data: list.map(i => (i.statusCounts && i.statusCounts[status]) ? i.statusCounts[status] : 0)
        };
      });

      this.stackedBarChartData = {
        labels: this.stackedBarChartLabels,
        datasets
      };
    });
  }
}
