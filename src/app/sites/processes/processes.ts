import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProcessService } from '../../services/process-service';

@Component({
  selector: 'app-processes',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatCheckboxModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, FormsModule, MatSnackBarModule, MatTooltipModule],
  templateUrl: './processes.html',
  styleUrls: ['./processes.css']
})
export class Processes implements OnInit {
  processes: Array<any> = [];
  loading = false;
  error: string | null = null;
  // When true, show only processes that are executable (have Webhook tag)
  showOnlyExecutable = false;
  private processService = inject(ProcessService);
  private snackBar = inject(MatSnackBar);

  // Track processes that are being started to disable buttons / show feedback
  startingProcessIds: Set<string> = new Set<string>();

  // Selected process for editing
  selectedProcess: any = null;
  // Editable shallow copy of the process metadata (name/description) to avoid mutating the list until save
  editedProcess: any = null;
  // Local editable copy of parameters
  editedParameters: Array<any> = [];
  // Temporary input for creating a new parameter (string-only for now)
  newParamName = '';

  ngOnInit(): void {
    this.loadProcesses();
  }

  // Derived list applying the frontend-only "Ejecutable" filter when requested
  get displayedProcesses() {
    if (!this.processes) return [];
    if (!this.showOnlyExecutable) return this.processes;
    return this.processes.filter(p => !!p.canExecute);
  }

  toggleEjecutable() {
    this.showOnlyExecutable = !this.showOnlyExecutable;
  }

  loadProcesses() {
    this.processService.getProcesses().subscribe((res: any[]) => {
      // Map the API response to the shape expected by the template
      this.processes = res.map(p => ({
        id: p.id,
        name: p.name,
        workflowName: p.workflow?.name ?? '',
        description: p.description,
        parameters: p.parameters ?? [],
        //if true display "Activo" else "Inactivo"
        active: p.workflow?.active ? 'Proceso Activo' : 'Proceso Inactivo',
        status: p.executionBrief?.status ?? '',
        startedAt: p.executionBrief?.startedAt ?? null,
        // allow execution only when workflow tags include 'Webhook' (case-insensitive)
        canExecute: !!p.workflow?.tags && Array.isArray(p.workflow.tags) && p.workflow.tags.some((t: any) => (t?.name ?? '').toString().toLowerCase() === 'webhook')
      }));
    });
  }

  selectProcess(process: any) {
    this.selectedProcess = process;
    // create a shallow copy for metadata (name/description) and a copy for parameters
    this.editedProcess = { ...process };
    // When loading parameters, coerce boolean typed parameters to actual booleans
    this.editedParameters = (process.parameters || []).map((p: any) => {
      const copy: any = { ...p };
      if ((copy.type || '').toString().toLowerCase() === 'boolean') {
        copy.value = copy.value === true || copy.value === 'true' || copy.value === '1';
      }
      return copy;
    });
  }

  /**
   * Add a new string parameter to the selected process by sending a PATCH.
   * The backend will create the parameter and we refresh the processes list.
   */
  addParameter() {
    if (!this.selectedProcess) return;
    const name = (this.newParamName || '').trim();
    if (!name) return;

    const body: any = {
      parameters: [
        {
          name,
          value: '',
          type: 'string'
        }
      ]
    };

    this.processService.patchProcess(String(this.selectedProcess.id), body).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message ?? 'Parámetro agregado', 'Cerrar', { duration: 3000 });
        this.newParamName = '';
        // Fetch the updated process so the UI shows the newly created parameter (including server-assigned id)
        const pid = String(this.selectedProcess.id);
        this.processService.getProcessById(pid).subscribe({
          next: (p: any) => {
            // Map server process to the UI shape used in the list
            const mapped = {
              id: p.id,
              name: p.name,
              workflowName: p.workflow?.name ?? '',
              description: p.description,
              parameters: p.parameters ?? [],
              active: p.workflow?.active ? 'Proceso Activo' : 'Proceso Inactivo',
              status: p.executionBrief?.status ?? '',
              startedAt: p.executionBrief?.startedAt ?? null,
              canExecute: !!p.workflow?.tags && Array.isArray(p.workflow.tags) && p.workflow.tags.some((t: any) => (t?.name ?? '').toString().toLowerCase() === 'webhook')
            };

            const idx = this.processes.findIndex(pr => pr.id === mapped.id);
            if (idx !== -1) this.processes[idx] = mapped;

            // keep the selection open and update the editable copies
            this.selectedProcess = mapped;
            this.editedProcess = { ...mapped };
            this.editedParameters = (mapped.parameters || []).map((pp: any) => ({ ...pp }));
          },
          error: (err: any) => {
            console.error('Error fetching process after add', err);
          }
        });
      },
      error: (err: any) => {
        console.error('Error adding parameter', err);
        const errMsg = err?.error?.message ?? err?.message ?? 'Error al crear parámetro';
        this.snackBar.open(errMsg, 'Cerrar', { duration: 4000 });
      }
    });
  }

  /**
   * Remove a parameter from the process using the DELETE endpoint we added in the service.
   */
  deleteParameter(param: any) {
    if (!this.selectedProcess || !param?.id) return;
    // Prevent deletion of protected parameters (e.g. Programado / Programación) and cron parameters
    if (this.isProtectedParam(param) || this.isCronParam(param)) {
      this.snackBar.open('Este parámetro no puede ser eliminado desde aquí.', 'Cerrar', { duration: 5000 });
      return;
    }
    const procId = String(this.selectedProcess.id);
    const paramId = String(param.id);

    this.processService.deleteParameter(procId, paramId).subscribe({
      next: (res: any) => {
        this.snackBar.open(res?.message ?? 'Parámetro eliminado', 'Cerrar', { duration: 3000 });
        // remove from local copies so UI updates immediately
        this.editedParameters = this.editedParameters.filter((p: any) => String(p.id) !== paramId);
        if (this.selectedProcess && Array.isArray(this.selectedProcess.parameters)) {
          this.selectedProcess.parameters = this.selectedProcess.parameters.filter((p: any) => String(p.id) !== paramId);
        }
      },
      error: (err: any) => {
        console.error('Error deleting parameter', err);
        const errMsg = err?.error?.message ?? err?.message ?? 'Error al eliminar parámetro';
        this.snackBar.open(errMsg, 'Cerrar', { duration: 4000 });
      }
    });
  }

  /**
   * Open external documentation about cron format in a new tab.
   * If the project has an internal docs page, this URL can be changed.
   */
  openCronHelp(param?: any) {
    // Optionally we could show a dialog with brief info before navigating; for now open crontab.guru
    const url = 'https://crontab.cronhub.io/';
    try {
      window.open(url, '_blank');
    } catch (e) {
      // Fallback: inform the user with a snackbar
      this.snackBar.open('Abre la documentación de cron en: ' + url, 'Cerrar', { duration: 6000 });
    }
  }

  // Return true when the parameter name is one of the protected ones (cannot be deleted)
  isProtectedParam(param: any): boolean {
    if (!param || !param.name) return false;
    const raw = (param.name || '').toString();
    // strip accents for robust comparison (e.g., Programación)
  const normalized = raw.normalize ? raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase() : raw.toLowerCase();
    // accepted protected names: Programado, Programación (normalized below)
    return normalized === 'programado' || normalized === 'programacion';
  }

  // Simple cron-type checker
  isCronParam(param: any): boolean {
    return ((param?.type || '').toString().toLowerCase() === 'cron');
  }

  // Remove a local (unsaved) parameter from the editedParameters list
  removeLocalParameter(param: any) {
    // Prevent removal of protected local parameters, if any
    if (this.isProtectedParam(param) || this.isCronParam(param)) {
      this.snackBar.open('Este parámetro no puede ser eliminado.', 'Cerrar', { duration: 5000 });
      return;
    }
    this.editedParameters = this.editedParameters.filter(p => p !== param);
  }

  isStarting(process: any): boolean {
    if (!process) return false;
    return this.startingProcessIds.has(String(process.id));
  }

  startProcess(process: any) {
    if (!process || !process.id) return;
    const id = String(process.id);
    if (this.startingProcessIds.has(id)) return; // already starting

    this.startingProcessIds.add(id);
    this.processService.startProcess(id).subscribe({
      next: (res: any) => {
        // Expected response shape:
        // { success: boolean, message: string, data: string | object }
        const success = !!res?.success;
        const message = res?.message ?? (success ? 'Proceso iniciado' : 'Error al iniciar proceso');

        // Show only the server-provided message for a subtle notification
        const displayMessage = res?.message ?? (res?.success ? 'Proceso iniciado' : 'No se pudo iniciar el proceso');
        this.snackBar.open(displayMessage, 'Cerrar', { duration: 4000 });

        // remove from starting set
        this.startingProcessIds.delete(id);

        // refresh list only on success so UI reflects new execution
        if (res?.success) {
          this.loadProcesses();
        }
      },
      error: (err: any) => {
        console.error('Error starting process', err);
        const errMsg = err?.error?.message ?? err?.message ?? err?.statusText ?? 'Error de red';
        // Show only the error message string (subtle)
        this.snackBar.open(errMsg, 'Cerrar', { duration: 4000 });
        this.startingProcessIds.delete(id);
      }
    });
  }

  cancelEdit() {
    if (!this.selectedProcess) return;
    // discard edits and reset
    this.editedParameters = (this.selectedProcess.parameters || []).map((p: any) => ({ ...p }));
    this.editedProcess = null;
    this.selectedProcess = null;
  }

  updateSelectedProcess() {
    if (!this.selectedProcess) return;

    // Prepare payload: normalize number types
    const paramsToSend = this.editedParameters.map(p => {
      const copy: any = { ...p };
      if (copy.type === 'number') {
        // try to convert to number
        const n = Number(copy.value);
        copy.value = isNaN(n) ? copy.value : n;
      } else if ((copy.type || '').toString().toLowerCase() === 'boolean') {
        // The backend expects boolean-ish values as strings. Convert whatever the UI holds
        // (true/false or 'true'/'false'/'1') into the canonical string 'true' or 'false'.
        const truthy = copy.value === true || copy.value === 'true' || copy.value === '1';
        copy.value = truthy ? 'true' : 'false';
      }
      return copy;
    });

    const body: any = {
      name: this.editedProcess.name,
      description: this.editedProcess.description,
      parameters: paramsToSend
    };

    this.processService.patchProcess(String(this.selectedProcess.id), body).subscribe({
      next: (res: any) => {
        // Update local processes list to reflect changes (name/description/parameters)
        const idx = this.processes.findIndex(p => p.id === this.selectedProcess.id);
        if (idx !== -1) {
          this.processes[idx] = { ...this.processes[idx], name: body.name, description: body.description, parameters: paramsToSend };
        }
        // Keep selection open. Refresh the process details from the server so we show any server-side changes
        const pid = String(this.selectedProcess.id);
        this.processService.getProcessById(pid).subscribe({
          next: (p: any) => {
            const mapped = {
              id: p.id,
              name: p.name,
              workflowName: p.workflow?.name ?? '',
              description: p.description,
              parameters: p.parameters ?? [],
              active: p.workflow?.active ? 'Proceso Activo' : 'Proceso Inactivo',
              status: p.executionBrief?.status ?? '',
              startedAt: p.executionBrief?.startedAt ?? null,
              canExecute: !!p.workflow?.tags && Array.isArray(p.workflow.tags) && p.workflow.tags.some((t: any) => (t?.name ?? '').toString().toLowerCase() === 'webhook')
            };

            if (idx !== -1) this.processes[idx] = mapped;
            this.selectedProcess = mapped;
            this.editedProcess = { ...mapped };
            this.editedParameters = (mapped.parameters || []).map((pp: any) => ({ ...pp }));
            this.snackBar.open(res?.message ?? 'Proceso actualizado', 'Cerrar', { duration: 3000 });
          },
          error: (err: any) => {
            console.error('Error fetching updated process', err);
            this.snackBar.open(res?.message ?? 'Proceso actualizado', 'Cerrar', { duration: 3000 });
          }
        });
      },
      error: (err: any) => {
        console.error('Error updating process', err);
        // keep selection so user can retry
      }
    });
  }

  // Simple time-ago formatter (Spanish)
  formatTimeAgo(isoDate: string | null): string {
    if (!isoDate) return '';
    const then = new Date(isoDate).getTime();
    const now = Date.now();
    const diff = Math.floor((now - then) / 1000); // seconds

    if (diff < 60) return `Hace ${diff} seg`;
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `Hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} d`;
  }
}
