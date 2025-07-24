import type { Table, MenuItem, Order, Reservation, User, UserRole, TeamMember, InventoryItem } from './types';

export const mockUser: User = {
  name: 'Alexandre',
  role: 'Admin',
  avatarUrl: 'https://placehold.co/100x100'
};

// --- Role Management (for demo purposes) ---

/**
 * In a real app, this would come from an auth context.
 * We're using a mutable object here to simulate role changes.
 */
export const setUserRole = (role: UserRole) => {
  mockUser.role = role;
};

/**
 * Checks if the user's role is included in the list of required roles.
 */
export const hasPermission = (userRole: UserRole, requiredRoles: UserRole[]): boolean => {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No specific roles required, so access is granted
  }
  return requiredRoles.includes(userRole);
};


// --- Mock Data ---

export const mockInventory: InventoryItem[] = [
    { id: 1, name: 'Arborio Rice', stock: 20, unit: 'kg', lowThreshold: 5 },
    { id: 2, name: 'Black Truffle', stock: 2, unit: 'kg', lowThreshold: 0.5 },
    { id: 3, name: 'Parmesan Cheese', stock: 10, unit: 'kg', lowThreshold: 2 },
    { id: 4, name: 'Scallops', stock: 15, unit: 'kg', lowThreshold: 5 },
    { id: 5, name: 'Butternut Squash', stock: 8, unit: 'pcs', lowThreshold: 3 },
    { id: 6, name: 'Pancetta', stock: 5, unit: 'kg', lowThreshold: 2 },
    { id: 7, name: 'Burrata', stock: 30, unit: 'pcs', lowThreshold: 10 },
    { id: 8, name: 'Heirloom Tomatoes', stock: 12, unit: 'kg', lowThreshold: 4 },
    { id: 9, name: 'Pizza Dough', stock: 50, unit: 'pcs', lowThreshold: 20 },
    { id: 10, name: 'Flour', stock: 25, unit: 'kg', lowThreshold: 10 },
    { id: 11, name: 'Chocolate', stock: 15, unit: 'kg', lowThreshold: 5 },
    { id: 12, name: 'Whiskey', stock: 10, unit: 'bottles', lowThreshold: 3 },
    { id: 13, name: 'Potatoes', stock: 40, unit: 'kg', lowThreshold: 15 },
]

export const mockTeam: TeamMember[] = [
    { id: 1, name: 'Alice Johnson', role: 'Admin', email: 'alice@example.com', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 2, name: 'Bob Williams', role: 'Advanced', email: 'bob@example.com', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 3, name: 'Charlie Brown', role: 'Basic', email: 'charlie@example.com', status: 'Inactive', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 4, name: 'Diana Miller', role: 'Basic', email: 'diana@example.com', status: 'Active', avatarUrl: 'https://placehold.co/100x100.png' },
];

export const mockTables: Table[] = [
  { id: 1, capacity: 2, status: 'Occupied', orderId: 101 },
  { id: 2, capacity: 4, status: 'Available' },
  { id: 3, capacity: 4, status: 'Reserved' },
  { id: 4, capacity: 6, status: 'Available' },
  { id: 5, capacity: 2, status: 'Dirty' },
  { id: 6, capacity: 8, status: 'Available' },
  { id: 7, capacity: 4, status: 'Occupied', orderId: 102 },
  { id: 8, capacity: 4, status: 'Available' },
  { id: 9, capacity: 2, status: 'Available' },
  { id: 10, capacity: 6, status: 'Reserved' },
  { id: 11, capacity: 4, status: 'Dirty' },
  { id: 12, capacity: 5, status: 'Occupied', orderId: 103 },
];

export const mockMenu: MenuItem[] = [
  { 
    id: 1, 
    name: 'Truffle Risotto', 
    description: 'Creamy Arborio rice with black truffle and parmesan shavings.', 
    price: 18.50, 
    category: 'Mains',
    vatRate: 20,
    addons: [
      { id: 101, name: 'Add Grilled Chicken', price: 4.00 },
      { id: 102, name: 'Add Sautéed Shrimp', price: 6.00 },
    ]
  },
  { id: 2, name: 'Seared Scallops', description: 'With butternut squash purée and pancetta crisps.', price: 22.00, category: 'Mains', vatRate: 20 },
  { id: 3, name: 'Burrata Caprese', description: 'Fresh burrata, heirloom tomatoes, basil, and balsamic glaze.', price: 12.00, category: 'Starters', vatRate: 0 },
  { id: 4, name: 'Classic Margherita Pizza', description: 'Tomato, mozzarella, and fresh basil.', price: 14.00, category: 'Mains', vatRate: 20 },
  { id: 5, name: 'Chocolate Lava Cake', description: 'Molten chocolate center, served with vanilla bean ice cream.', price: 9.50, category: 'Desserts', vatRate: 20 },
  { id: 6, name: 'Old Fashioned', description: 'Whiskey, bitters, sugar, and an orange twist.', price: 11.00, category: 'Drinks', subcategory: 'Cocktails', vatRate: 20 },
  { id: 7, name: 'Sparkling Water', description: 'San Pellegrino (750ml)', price: 4.50, category: 'Drinks', subcategory: 'Non-Alcoholic', vatRate: 0 },
  { id: 8, name: 'Fries', description: 'With truffle oil and parmesan.', price: 6.00, category: 'Sides', vatRate: 20 },
];

export const mockOrders: Order[] = [
  { 
    id: 101, 
    tableId: 1, 
    type: 'Table',
    status: 'Paid',
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    items: [
      { menuItem: mockMenu[0], quantity: 1, selectedAddons: [mockMenu[0].addons![1]] },
      { menuItem: mockMenu[5], quantity: 2 },
    ]
  },
  {
    id: 102,
    tableId: 7,
    type: 'Table',
    status: 'Paid',
    paymentMethod: 'Cash',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    items: [
      { menuItem: mockMenu[3], quantity: 2, notes: 'One without basil' },
      { menuItem: mockMenu[6], quantity: 2 },
    ]
  },
  {
    id: 103,
    tableId: 12,
    type: 'Table',
    status: 'Paid',
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    items: [
      { menuItem: mockMenu[2], quantity: 1 },
      { menuItem: mockMenu[4], quantity: 1 },
      { menuItem: mockMenu[7], quantity: 2 },
    ]
  },
  {
    id: 104,
    tableId: 4,
    type: 'Table',
    status: 'Cancelled',
    paymentMethod: 'Voucher',
    createdAt: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    items: [
      { menuItem: mockMenu[1], quantity: 2 },
    ]
  },
  {
    id: 105,
    tableId: 6,
    type: 'Table',
    status: 'Paid',
    paymentMethod: 'Card',
    createdAt: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
    items: [
      { menuItem: mockMenu[0], quantity: 1 },
      { menuItem: mockMenu[1], quantity: 1 },
      { menuItem: mockMenu[2], quantity: 1 },
      { menuItem: mockMenu[3], quantity: 1 },
    ]
  }
];

export const mockReservations: Reservation[] = [
  { id: 1, customerName: 'John Doe', partySize: 4, time: '2024-08-15T19:00', status: 'Confirmed' },
  { id: 2, customerName: 'Jane Smith', partySize: 2, time: '2024-08-15T19:30', status: 'Confirmed', notes: 'Anniversary' },
  { id: 3, customerName: 'Peter Jones', partySize: 6, time: '2024-08-15T20:00', status: 'Pending' },
  { id: 4, customerName: 'Mary Williams', partySize: 3, time: '2024-08-16T18:00', status: 'Confirmed' },
];

export const getOrderByTableId = (tableId: number): Order | undefined => {
  const table = mockTables.find(t => t.id === tableId);
  if (!table || !table.orderId) return undefined;
  return mockOrders.find(o => o.id === table.orderId);
}
