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

let nextOrderId = 1;
let nextPaymentId = 1;

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  payments: [],
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

