export type UserRole = 'Basic' | 'Advanced' | 'Admin';

export interface User {
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Dirty';

export interface Table {
  id: number;
  capacity: number;
  status: TableStatus;
  orderId?: number;
}

export interface Addon {
  id: number;
  name: string;
  price: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  addons?: Addon[];
  vatRate: 0 | 20;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  selectedAddons?: Addon[];
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  type: 'Table' | 'Collection' | 'Delivery' | 'Online';
  createdAt: string;
}

export interface Reservation {
  id: number;
  customerName: string;
  partySize: number;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  notes?: string;
}
