import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Execution {
  id: string;
  startedAt: string;
  finishedAt?: string | null;
  processName: string;
  status: string;
  finished: boolean;
  // allow additional fields returned by the API
  [key: string]: any;
}

export interface ExecutionsListData {
  executions: Execution[];
  nextCursor?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ExecutionsService {
  private apiUrl = `${environment.apiUrl}/executions`;
  private http = inject(HttpClient);

  /**
   * Fetch executions from the API.
   * Accepts optional query params that match the backend controller (includeData, status, workflowId, projectId, limit, cursor).
   * Returns the inner data object: { executions: Execution[], nextCursor?: string }
   */
  getExecutions(options?: {
    includeData?: boolean;
    status?: string;
    workflowId?: string;
    projectId?: string;
    limit?: number;
    cursor?: string;
  }): Observable<ExecutionsListData> {
    let params = new HttpParams();

    if (options) {
      if (options.includeData !== undefined && options.includeData !== null) {
        params = params.set('includeData', String(options.includeData));
      }
      if (options.status) params = params.set('status', options.status);
      if (options.workflowId) params = params.set('workflowId', options.workflowId);
      if (options.projectId) params = params.set('projectId', options.projectId);
      if (options.limit !== undefined && options.limit !== null) params = params.set('limit', String(options.limit));
      if (options.cursor) params = params.set('cursor', options.cursor);
    }

    return this.http
      .get<ApiResponse<ExecutionsListData>>(`${this.apiUrl}`, { params })
      .pipe(
        // Map to the inner data object and provide a safe default when missing
        map((res) => res?.data ?? { executions: [], nextCursor: null })
      );
  }
}