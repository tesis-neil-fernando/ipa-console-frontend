// Modelo simple y “future-proof” para backend
export type NotificationType = 'INFO' | 'WARNING' | 'SECURITY' | 'SYSTEM';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  date: string;  // ISO o string legible
  read: boolean;
}
