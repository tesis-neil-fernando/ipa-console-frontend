import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExecutionsService, Execution, ExecutionsListData } from '../../services/executions-service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

type LogRow = Execution & { durationStr?: string; triggerStr?: string };

@Component({
  selector: 'app-logs',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
  MatDialogModule,
  FormsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './logs.html',
  styleUrl: './logs.css'
})
export class Logs implements OnInit {
  @ViewChild('detailsDialog') detailsDialogTpl!: TemplateRef<any>;

  displayedColumns = ['time', 'process', 'trigger', 'status', 'duration'];
  // Local cache per page (cursor pagination)
  cursors: Record<number, string | null> = { 1: null }; // cursors[1] = null for first page
  logsByPage: Record<number, LogRow[]> = {};
  currentPage = 1;
  nextCursor: string | null = null;

  // UI state
  loading = false;
  error: string | null = null;

  // Filters
  filters = {
    status: '',
    workflowId: '',
    projectId: '',
    q: '' // free text search
  };

  private filterSubject = new Subject<void>();
  private currentRequestSub: Subscription | null = null;

  constructor(private executionsService: ExecutionsService, public dialog: MatDialog) {}

  ngOnInit(): void {
    // Debounce filter changes
    this.filterSubject.pipe(debounceTime(300)).subscribe(() => this.refresh());
    // Load first page
    this.loadPage(1);
  }

  private mapExecution(exec: Execution): LogRow {
    const started = exec.startedAt ? new Date(exec.startedAt) : null;
    const finished = exec.finishedAt ? new Date(exec.finishedAt) : null;

    let durationStr = '—';
    if (started && finished) {
      const diffMs = Math.max(0, finished.getTime() - started.getTime());
      const seconds = Math.floor(diffMs / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      durationStr = `${mins}m ${secs}s`;
    }

    const triggerStr = (exec as any).trigger ?? ((exec as any).triggeredBy ? `Desencadenado por ${ (exec as any).triggeredBy }` : 'Programado');

    return { ...exec, durationStr, triggerStr };
  }

  /**
   * Load a specific page number using cached cursors.
   * Uses cancellation: any in-flight request is unsubscribed when a new page is requested.
   */
  loadPage(page: number) {
    if (page < 1) return;

    // If we don't have a cursor for this page (and it's not page 1) we can't jump to it
    if (page !== 1 && !(page in this.cursors)) {
      this.error = 'No se puede ir a esa página (cursor no disponible)';
      return;
    }

    // Cancel previous request if present
    if (this.currentRequestSub) {
      this.currentRequestSub.unsubscribe();
      this.currentRequestSub = null;
    }

    this.loading = true;
    this.error = null;

  // Fixed page size as requested: always fetch 20 executions.
  const opts: any = { limit: 20 };
    const cursor = this.cursors[page] ?? null;
    if (cursor) opts.cursor = cursor;
    if (this.filters.status) opts.status = this.filters.status;
    if (this.filters.workflowId) opts.workflowId = this.filters.workflowId;
    if (this.filters.projectId) opts.projectId = this.filters.projectId;
    if (this.filters.q) opts.q = this.filters.q;

    this.currentRequestSub = this.executionsService.getExecutions(opts).subscribe({
      next: (data: ExecutionsListData) => {
        const rows = (data.executions || []).map((e) => this.mapExecution(e));
        this.logsByPage[page] = rows;
        // store cursor for next page
        this.cursors[page + 1] = data.nextCursor ?? null;
        this.currentPage = page;
        this.nextCursor = this.cursors[page + 1] ?? null;
        this.loading = false;
        this.currentRequestSub = null;
      },
      error: (err) => {
        console.error('Error loading executions', err);
        this.error = 'No se pudieron cargar las ejecuciones';
        this.loading = false;
        this.currentRequestSub = null;
      }
    });
  }

  refresh() {
    this.cursors = { 1: null };
    this.logsByPage = {};
    this.currentPage = 1;
    this.nextCursor = null;
    // cancel any existing request
    if (this.currentRequestSub) {
      this.currentRequestSub.unsubscribe();
      this.currentRequestSub = null;
    }
    this.loadPage(1);
  }

  loadMore() {
    // append next page
    this.loadPage(this.currentPage + 1);
  }

  onFilterChange() {
    this.filterSubject.next();
  }

  openDetails(row: LogRow) {
    this.dialog.open(this.detailsDialogTpl, { data: row, width: '720px' });
  }

  exportVisibleCsv() {
    // flatten loaded pages up to current
    const pages = Object.keys(this.logsByPage).map((k) => parseInt(k, 10)).sort((a, b) => a - b);
    const rows: LogRow[] = [];
    for (const p of pages) {
      if (p <= this.currentPage) rows.push(...(this.logsByPage[p] || []));
    }

    if (!rows.length) return;

    const cols = ['id', 'startedAt', 'finishedAt', 'processName', 'status', 'finished', 'durationStr', 'triggerStr'];
    const csv = [cols.join(',')].concat(rows.map(r => cols.map(c => {
      // escape
      const v = (r as any)[c];
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return `"${s}"`;
    }).join(','))).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executions_page_${this.currentPage}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  trackById(_: number, item: LogRow) {
    return item.id;
  }

  pageNumbers(): number[] {
    const pages = Object.keys(this.logsByPage).map((k) => parseInt(k, 10));
    const max = pages.length ? Math.max(...pages) : 1;
    return Array.from({ length: max }, (_, i) => i + 1);
  }
}
