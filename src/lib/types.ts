

export type UserRole = 'Basic' | 'Advanced' | 'Admin';

export interface User {
  id: number;
  userId: string;
  name: string;
  role: UserRole;
  avatarUrl: string;
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Dirty' | 'Billed';

export interface Table {
  id: number;
  capacity: number;
  status: TableStatus;
  orderId?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  floor: 'Main Floor' | 'Patio';
}

export interface Addon {
  id: number;
  name: string;
  price: number;
}

export interface MenuCategory {
    name: string;
    subcategories: string[];
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  addons?: Addon[];
}

export interface SetMenuCourse {
  title: string;
  items: MenuItem[];
}

export interface SetMenu {
    id: number;
    name: string;
    price: number;
    courses: SetMenuCourse[];
}


export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
  selectedAddons?: Addon[];
}

export type PaymentMethod = 'Cash' | 'Card' | 'Voucher';
export type OrderStatus = 'Paid' | 'Pending' | 'Cancelled';

export interface Payment {
    amount: number;
    method: PaymentMethod;
    date: string;
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  type: 'Table' | 'Collection' | 'Delivery' | 'Online';
  createdAt: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  guests?: number;
  discount?: number;
  payments?: Payment[];
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export interface Reservation {
  id: number;
  customerName: string;
  phone: string;
  email?: string;
  partySize: number;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Seated';
  notes?: string;
}

export interface TeamMember {
  id: number;
  userId: string;
  password?: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl: string;
}

export type InventoryItemUnit = 'g' | 'kg' | 'ml' | 'liters' | 'pcs' | 'bottles';

export interface InventoryItem {
    id: number;
    name: string;
    stock: number;
    unit: InventoryItemUnit;
    lowThreshold: number;
    idealThreshold: number;
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    lastVisit: string;
    loyaltyPoints?: number;
}
