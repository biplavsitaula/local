import { Notification } from '@/types/notification';

export const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'payment',
    title: 'New Payment Received',
    message: 'Payment of $539.97 received from Rajesh Kumar via QR',
    read: false,
    createdAt: '2024-12-16T10:16:00.000Z',
  },
  {
    id: 'notif-2',
    type: 'order',
    title: 'New Order Placed',
    message: 'Order FB-2024-003 placed by Hari Bahadur',
    read: false,
    createdAt: '2024-12-16T10:15:00.000Z',
  },
  {
    id: 'notif-3',
    type: 'low-stock',
    title: 'Low Stock Alert',
    message: 'Macallan 18 Year is running low (5 units left)',
    read: false,
    createdAt: '2024-12-16T09:30:00.000Z',
  },
  {
    id: 'notif-4',
    type: 'super-admin',
    title: 'System Maintenance',
    message: 'System maintenance scheduled tonight at 11 PM',
    read: false,
    createdAt: '2024-12-16T08:00:00.000Z',
  },
  {
    id: 'notif-5',
    type: 'payment',
    title: 'Payment Completed',
    message: 'Payment of $86.97 received from Sita Sharma via COD',
    read: true,
    createdAt: '2024-12-15T12:00:00.000Z',
  },
  {
    id: 'notif-6',
    type: 'order',
    title: 'Order Delivered',
    message: 'Order FB-2024-002 has been delivered successfully',
    read: true,
    createdAt: '2024-12-15T11:30:00.000Z',
  },
  {
    id: 'notif-7',
    type: 'low-stock',
    title: 'Low Stock Alert',
    message: 'Hennessy XO is running low (3 units left)',
    read: true,
    createdAt: '2024-12-14T14:20:00.000Z',
  },
];










