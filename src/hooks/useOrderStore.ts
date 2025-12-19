import { create } from 'zustand';

export interface Order {
  id: string;
  billNumber: string;
  customerName: string;
  location: string;
  totalAmount: number;
  status: string;
  paymentMethod: 'cod' | 'qr';
  createdAt: string;
}

export interface Payment {
  id: string;
  billNumber: string;
  customerName: string;
  amount: number;
  method: 'cod' | 'qr';
  status: string;
  createdAt: string;
}

interface OrderStore {
  orders: Order[];
  payments: Payment[];
  addOrder: (order: Omit<Order, 'id'>) => void;
  addPayment: (payment: Omit<Payment, 'id'>) => void;
}

const initialOrders: Order[] = [
  {
    id: 'order-1',
    billNumber: 'FB-2025-1201',
    customerName: 'Aarav Shrestha',
    location: 'Kathmandu',
    totalAmount: 6850,
    status: 'Delivered',
    paymentMethod: 'qr',
    createdAt: '2025-12-02T10:15:00.000Z',
  },
  {
    id: 'order-2',
    billNumber: 'FB-2025-1202',
    customerName: 'Sanjay Karki',
    location: 'Lalitpur',
    totalAmount: 3200,
    status: 'Processing',
    paymentMethod: 'cod',
    createdAt: '2025-12-03T15:40:00.000Z',
  },
  {
    id: 'order-3',
    billNumber: 'FB-2025-1203',
    customerName: 'Nisha Gurung',
    location: 'Bhaktapur',
    totalAmount: 8500,
    status: 'Pending',
    paymentMethod: 'qr',
    createdAt: '2025-12-05T09:05:00.000Z',
  },
  {
    id: 'order-4',
    billNumber: 'FB-2025-1204',
    customerName: 'Prakash Adhikari',
    location: 'Pokhara',
    totalAmount: 1800,
    status: 'Delivered',
    paymentMethod: 'cod',
    createdAt: '2025-12-06T12:30:00.000Z',
  },
  {
    id: 'order-5',
    billNumber: 'FB-2025-1205',
    customerName: 'Rita Thapa',
    location: 'Kathmandu',
    totalAmount: 5500,
    status: 'Cancelled',
    paymentMethod: 'qr',
    createdAt: '2025-12-07T18:10:00.000Z',
  },
  {
    id: 'order-6',
    billNumber: 'FB-2025-1109',
    customerName: 'Bikash Rana',
    location: 'Chitwan',
    totalAmount: 4100,
    status: 'Delivered',
    paymentMethod: 'qr',
    createdAt: '2025-11-18T14:20:00.000Z',
  },
  {
    id: 'order-7',
    billNumber: 'FB-2025-1110',
    customerName: 'Sima Tamang',
    location: 'Dharan',
    totalAmount: 2500,
    status: 'Delivered',
    paymentMethod: 'cod',
    createdAt: '2025-11-20T08:45:00.000Z',
  },
  {
    id: 'order-8',
    billNumber: 'FB-2025-1111',
    customerName: 'Anish Bista',
    location: 'Biratnagar',
    totalAmount: 3800,
    status: 'Processing',
    paymentMethod: 'qr',
    createdAt: '2025-11-21T16:05:00.000Z',
  },
];

const initialPayments: Payment[] = [
  {
    id: 'payment-1',
    billNumber: 'FB-2024-003',
    customerName: 'Hari Bahadur',
    amount: 579.98,
    method: 'qr',
    status: 'Completed',
    createdAt: '2024-12-16T10:16:00.000Z',
  },
  {
    id: 'payment-2',
    billNumber: 'FB-2024-002',
    customerName: 'Sita Sharma',
    amount: 86.97,
    method: 'cod',
    status: 'Pending',
    createdAt: '2024-12-15T12:00:00.000Z',
  },
  {
    id: 'payment-3',
    billNumber: 'FB-2024-001',
    customerName: 'Rajesh Kumar',
    amount: 539.97,
    method: 'qr',
    status: 'Completed',
    createdAt: '2024-12-15T09:30:00.000Z',
  },
  {
    id: 'payment-4',
    billNumber: 'FB-2024-004',
    customerName: 'Maya Thapa',
    amount: 99.95,
    method: 'cod',
    status: 'Pending',
    createdAt: '2024-12-14T16:45:00.000Z',
  },
  {
    id: 'payment-5',
    billNumber: 'FB-2024-005',
    customerName: 'Nirmal Shrestha',
    amount: 125.5,
    method: 'qr',
    status: 'Completed',
    createdAt: '2024-12-13T11:10:00.000Z',
  },
  {
    id: 'payment-6',
    billNumber: 'FB-2024-006',
    customerName: 'Asha Rai',
    amount: 74.25,
    method: 'cod',
    status: 'Completed',
    createdAt: '2024-12-12T08:20:00.000Z',
  },
  {
    id: 'payment-7',
    billNumber: 'FB-2024-007',
    customerName: 'Kiran Lama',
    amount: 186.92,
    method: 'qr',
    status: 'Pending',
    createdAt: '2024-12-11T14:05:00.000Z',
  },
];

let nextOrderId = initialOrders.length + 1;
let nextPaymentId = initialPayments.length + 1;

export const useOrderStore = create<OrderStore>((set) => ({
  orders: initialOrders,
  payments: initialPayments,
  addOrder: (order) =>
    set((state) => ({
      orders: [
        ...state.orders,
        { ...order, id: `order-${nextOrderId++}` },
      ],
    })),
  addPayment: (payment) =>
    set((state) => ({
      payments: [
        ...state.payments,
        { ...payment, id: `payment-${nextPaymentId++}` },
      ],
    })),
}));

