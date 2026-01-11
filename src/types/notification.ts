export type NotificationType = 'payment' | 'order' | 'low-stock' | 'super-admin' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}










































































