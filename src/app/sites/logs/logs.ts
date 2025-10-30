import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ExecutionsService, Execution } from '../../services/executions-service';

type LogRow = Execution & { durationStr?: string; triggerStr?: string };

@Component({
  selector: 'app-logs',
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './logs.html',
  styleUrl: './logs.css'
})
export class Logs implements OnInit {
  displayedColumns = ['time', 'process', 'trigger', 'status', 'duration', 'actions'];
  logs: LogRow[] = [];
  loading = false;
  error: string | null = null;
  // Cursor pagination state
  cursors: Record<number, string | null> = { 1: null }; // cursors[1] = null for first page
  logsByPage: Record<number, LogRow[]> = {};
  currentPage = 1;
  nextCursor: string | null = null;

  constructor(private executionsService: ExecutionsService) {}

  ngOnInit(): void {
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
   * Pages are 1-based. To load page N we need cursors[N] to be defined (for page 1 it's null).
   */
  loadPage(page: number) {
    if (page < 1) return;

    // If we don't have a cursor for this page (and it's not page 1) we can't jump to it
    if (page !== 1 && !(page in this.cursors)) {
      this.error = 'No se puede ir a esa página (cursor no disponible)';
      return;
    }

    this.loading = true;
    this.error = null;

    const opts: any = { limit: 50 };
    const cursor = this.cursors[page] ?? null;
    if (cursor) opts.cursor = cursor;

    this.executionsService.getExecutions(opts).subscribe({
      next: (data) => {
        const rows = (data.executions || []).map((e) => this.mapExecution(e));
        this.logsByPage[page] = rows;
        // store cursor for next page
        this.cursors[page + 1] = data.nextCursor ?? null;
        this.currentPage = page;
        this.nextCursor = this.cursors[page + 1] ?? null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading executions', err);
        this.error = 'No se pudieron cargar las ejecuciones';
        this.loading = false;
      }
    });
  }

  refresh() {
    this.cursors = { 1: null };
    this.logsByPage = {};
    this.currentPage = 1;
    this.nextCursor = null;
    this.loadPage(1);
  }

  loadMore() {
    // maintain compatibility: append next page
    this.loadPage(this.currentPage + 1);
  }

  viewDetails(row: LogRow) {
    // For now, show a simple JSON preview. You can replace with a dialog or route.
    const details = {
      id: row.id,
      startedAt: row.startedAt,
      finishedAt: row.finishedAt,
      processName: row.processName,
      status: row.status,
      finished: row.finished,
      raw: { ...row }
    };
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(details, null, 2));
  }

  pageNumbers(): number[] {
    const pages = Object.keys(this.logsByPage).map((k) => parseInt(k, 10));
    const max = pages.length ? Math.max(...pages) : 1;
    return Array.from({ length: max }, (_, i) => i + 1);
  }
}
