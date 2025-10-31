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
      // Accept either the old wrapper shape (ApiResponse<{...}>) or the new direct shape ({ executions, nextCursor })
      .get<any>(`${this.apiUrl}`, { params })
      .pipe(
        map((res) => {
          // No response -> safe default
          if (!res) return { executions: [], nextCursor: null } as ExecutionsListData;

          // Helper to extract executions & nextCursor from different shapes
          const extractFromObj = (obj: any): ExecutionsListData | null => {
            if (!obj) return null;

            // New controller: PageResponse has `items: Execution[]` and `nextCursor`
            if (Array.isArray(obj.items)) {
              return {
                executions: (obj.items as Execution[]) ?? [],
                nextCursor: (obj.nextCursor ?? null) as string | null
              } as ExecutionsListData;
            }

            // Older direct shape compatibility: { executions: Execution[] }
            if (Array.isArray(obj.executions)) {
              return {
                executions: (obj.executions as Execution[]) ?? [],
                nextCursor: (obj.nextCursor ?? null) as string | null
              } as ExecutionsListData;
            }

            return null;
          };

          // If wrapped: ApiResponse { success, data: { items | executions, nextCursor } }
          if (res.data !== undefined) {
            // If data is a page-like object
            const fromData = extractFromObj(res.data);
            if (fromData) return fromData;

            // If data itself is an array of executions
            if (Array.isArray(res.data)) {
              return { executions: res.data as Execution[], nextCursor: null } as ExecutionsListData;
            }

            // If data has executions property but not arrays (be defensive)
            if (res.data.executions !== undefined) {
              return {
                executions: (res.data.executions as Execution[]) ?? [],
                nextCursor: (res.data.nextCursor ?? null) as string | null
              } as ExecutionsListData;
            }

            // Fallback when data exists but shape is unrecognized
            return { executions: [], nextCursor: null } as ExecutionsListData;
          }

          // If response is the page shape directly: { items, page, size, nextCursor }
          const direct = extractFromObj(res);
          if (direct) return direct;

          // Back-compat: direct { executions, nextCursor }
          if (res.executions !== undefined) {
            return {
              executions: (res.executions as Execution[]) ?? [],
              nextCursor: (res.nextCursor ?? null) as string | null
            } as ExecutionsListData;
          }

          // As a last fallback, return empty list
          return { executions: [], nextCursor: null } as ExecutionsListData;
        })
      );
  }
}