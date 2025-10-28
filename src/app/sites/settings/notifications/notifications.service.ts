import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification } from './notifications.model';

// Mock inicial (estático)
const MOCK: Notification[] = [
  { id: 1, title: 'Contraseña actualizada', message: 'Tu contraseña fue cambiada correctamente.', type: 'SECURITY', date: '2025-10-27 14:32', read: false },
  { id: 2, title: 'Nuevo dataset disponible', message: 'Se cargó la base MareaMagenta 2025-10-28.', type: 'INFO', date: '2025-10-28 09:15', read: false },
  { id: 3, title: 'Mantenimiento programado', message: 'El sistema estará en mantenimiento el 30/10 a las 22:00.', type: 'SYSTEM', date: '2025-10-27 09:00', read: true },
];

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private _items$ = new BehaviorSubject<Notification[]>(MOCK);
  readonly items$ = this._items$.asObservable();

  // === Mutadores mock (luego reemplazas con HTTP) ===
  markRead(id: number) {
    const copy = this._items$.value.map(n => n.id === id ? { ...n, read: true } : n);
    this._items$.next(copy);
  }

  markAllRead() {
    const copy = this._items$.value.map(n => ({ ...n, read: true }));
    this._items$.next(copy);
  }

  addMock(type: Notification['type'] = 'INFO') {
    const id = Math.max(...this._items$.value.map(n => n.id), 0) + 1;
    const now = new Date();
    this._items$.next([
      {
        id,
        type,
        title: 'Notificación de prueba',
        message: 'Este es un ejemplo estático generado localmente.',
        date: now.toISOString().slice(0, 16).replace('T', ' '),
        read: false
      },
      ...this._items$.value
    ]);
  }

  // === Cómo se vería cuando conectes backend ===
  // getMyNotifications()  => this.http.get<Notification[]>('/notifications/me')
  // patchRead(id)         => this.http.patch(`/notifications/${id}/read`, {})
  // markAllRead()         => this.http.patch(`/notifications/read-all`, {})
}
