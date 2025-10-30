import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private apiUrl = `${environment.apiUrl}/processes`;
  private http = inject(HttpClient);

  getProcesses() {
    // Request processes filtered server-side to Tool and Webhook tags, only active and not archived
    // Example: GET /processes?tags=Tool,Webhook&active=true&archived=false
    return this.http.get<any[]>(`${this.apiUrl}?tags=Tool,Webhook&active=true&archived=false`);
  }

  getProcessById(id: string) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  startProcess(id: string) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/start`, {}).pipe(
      tap(res => console.log(res.message))
    );
  }

  patchProcess(id: string, body: any) {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, body).pipe(
      tap(res => console.log('Process updated', res))
    );
  }
}
