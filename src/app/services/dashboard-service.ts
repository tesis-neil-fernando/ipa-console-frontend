import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChartCountDto {
  key: 'active' | 'inactive' | string;
  count: number;
}

export interface DayCountDto {
  day: string; // YYYY-MM-DD
  count: number;
}

export interface ProcessErrorPercentageDto {
  processId: number | null;
  processName: string | null;
  totalExecutions: number;
  // New shape: a breakdown of counts per status (backend guarantees the five known statuses are present)
  statusCounts: {
    canceled: number;
    error: number;
    running: number;
    success: number;
    waiting: number;
    // allow additional statuses defensively
    [key: string]: number;
  };
  errorPercentage: number; // 0.0 - 100.0
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  private http = inject(HttpClient);

  private unwrap<T>(res: any): T {
    if (res === null || res === undefined) return (null as unknown) as T;
    // common wrapper: { success, data }
    if (res.data !== undefined) return res.data as T;
    return res as T;
  }

  /** Processes by active state (pie) */
  getProcessesByActiveState(): Observable<ChartCountDto[]> {
    return this.http.get<any>(`${this.apiUrl}/processes-by-active-state`).pipe(
      map(res => this.unwrap<ChartCountDto[]>(res) ?? [])
    );
  }

  /** Errors per day for last N days (default 7) */
  getErrorsByDay(days?: number): Observable<DayCountDto[]> {
    let params = new HttpParams();
    if (days !== undefined && days !== null) params = params.set('days', String(days));
    return this.http.get<any>(`${this.apiUrl}/errors-by-day`, { params }).pipe(
      map(res => this.unwrap<DayCountDto[]>(res) ?? [])
    );
  }

  /** Executions per day for last N days (default 7) */
  getExecutionsByDay(days?: number): Observable<DayCountDto[]> {
    let params = new HttpParams();
    if (days !== undefined && days !== null) params = params.set('days', String(days));
    return this.http.get<any>(`${this.apiUrl}/executions-by-day`, { params }).pipe(
      map(res => this.unwrap<DayCountDto[]>(res) ?? [])
    );
  }

  /** Error percentage per process (default 30 days) */
  getErrorPercentagePerProcess(days?: number): Observable<ProcessErrorPercentageDto[]> {
    let params = new HttpParams();
    if (days !== undefined && days !== null) params = params.set('days', String(days));
    return this.http.get<any>(`${this.apiUrl}/error-per-process`, { params }).pipe(
      map(res => this.unwrap<ProcessErrorPercentageDto[]>(res) ?? [])
    );
  }
}
