
import type { Table, MenuItem, Order, Reservation, User, UserRole, TeamMember, InventoryItem, Customer, SetMenu, MenuCategory } from './types';

// --- User Data ---
// This is now the single source of truth for all users/team members.
export let mockTeam: TeamMember[] = [
    { id: 1, userId: 'admin', password: 'admin', name: 'Alexandre', role: 'Admin', email: 'alex@example.com', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 2, userId: 'user1', password: 'user1', name: 'Bob', role: 'Advanced', email: 'bob@example.com', avatarUrl: 'https://placehold.co/100x100.png' },
    { id: 3, userId: 'user', password: 'user', name: 'Charlie', role: 'Basic', email: 'charlie@example.com', avatarUrl: 'https://placehold.co/100x100.png' }
];

// --- Authentication and State Management (for demo purposes) ---

/**
 * In a real app, this would be managed via a proper state management solution (Context, Redux, etc.)
 * and the user object would be fetched from a secure API endpoint.
 * We are using a simple mutable object and localStorage here to simulate a logged-in session.
 */
export let mockUser: User = {
    id: mockTeam[0].id,
    userId: mockTeam[0].userId,
    name: mockTeam[0].name,
    role: mockTeam[0].role,
    avatarUrl: mockTeam[0].avatarUrl,
}; // Default to admin for initial load

if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        mockUser = JSON.parse(storedUser);
    }
}

export const findUserByCredentials = (id: string, pass: string): User | undefined => {
    const foundMember = mockTeam.find(u => u.userId === id && u.password === pass);
    if (foundMember) {
        return {
            id: foundMember.id,
            userId: foundMember.userId,
            name: foundMember.name,
            role: foundMember.role,
            avatarUrl: foundMember.avatarUrl
        };
    }
    return undefined;
};

export const setCurrentUser = (user: User) => {
  mockUser = user;
  if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', JSON.stringify(user));
  }
};

export const logoutUser = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
    }
    // Set a default user so the app doesn't crash on logout
    mockUser = { id: 0, userId: '', name: 'Guest', role: 'Basic', avatarUrl: '' }; 
}

/**
 * Sets the user's role. This is kept for the demo role-switcher.
 * In a real app, roles would be part of the user object from the database.
 */
export const setUserRole = (role: UserRole) => {
  const currentUser = { ...mockUser, role };
  setCurrentUser(currentUser);
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


export const mockTables: Table[] = [
  { id: 1, capacity: 4, status: 'Available', x: 100, y: 50, width: 20, height: 20, floor: 'Main Floor' },
  { id: 2, capacity: 4, status: 'Available', x: 250, y: 50, width: 20, height: 20, floor: 'Main Floor' },
  { id: 3, capacity: 6, status: 'Available', x: 400, y: 50, width: 32, height: 20, floor: 'Main Floor' },
  { id: 4, capacity: 4, status: 'Available', x: 100, y: 200, width: 20, height: 20, floor: 'Main Floor' },
  { id: 5, capacity: 4, status: 'Available', x: 250, y: 200, width: 20, height: 20, floor: 'Main Floor' },
  { id: 6, capacity: 8, status: 'Available', x: 400, y: 200, width: 32, height: 20, floor: 'Main Floor' },
  { id: 7, capacity: 4, status: 'Available', x: 100, y: 350, width: 20, height: 20, floor: 'Main Floor' },
  { id: 8, capacity: 4, status: 'Available', x: 250, y: 350, width: 20, height: 20, floor: 'Main Floor' },
  { id: 9, capacity: 6, status: 'Available', x: 100, y: 500, width: 32, height: 20, floor: 'Main Floor' },
  { id: 10, capacity: 4, status: 'Available', x: 280, y: 500, width: 20, height: 20, floor: 'Main Floor' },
  { id: 11, capacity: 2, status: 'Available', x: 420, y: 500, width: 20, height: 20, floor: 'Main Floor' },
  { id: 12, capacity: 6, status: 'Available', x: 520, y: 500, width: 32, height: 20, floor: 'Main Floor' },
  // Patio Tables
  { id: 13, capacity: 2, status: 'Available', x: 50, y: 50, width: 20, height: 20, floor: 'Patio' },
  { id: 14, capacity: 2, status: 'Available', x: 150, y: 50, width: 20, height: 20, floor: 'Patio' },
  { id: 15, capacity: 4, status: 'Available', x: 50, y: 150, width: 20, height: 20, floor: 'Patio' },
  { id: 16, capacity: 4, status: 'Available', x: 150, y: 150, width: 20, height: 20, floor: 'Patio' },
];

export const mockCategories: MenuCategory[] = [
    { name: 'Starters', subcategories: [] },
    { name: 'Mains', subcategories: ['Pizza'] },
    { name: 'Sides', subcategories: [] },
    { name: 'Desserts', subcategories: [] },
    { name: 'Drinks', subcategories: ['Cocktails', 'Non-Alcoholic'] },
];

export const mockMenu: MenuItem[] = [
  { 
    id: 1, 
    name: 'Truffle Risotto', 
    description: 'Creamy Arborio rice with black truffle and parmesan shavings.', 
    price: 18.50, 
    category: 'Mains',
    addons: [
      { id: 101, name: 'Add Grilled Chicken', price: 4.00 },
      { id: 102, name: 'Add Sautéed Shrimp', price: 6.00 },
    ]
  },
  { id: 2, name: 'Seared Scallops', description: 'With butternut squash purée and pancetta crisps.', price: 22.00, category: 'Mains' },
  { id: 3, name: 'Burrata Caprese', description: 'Fresh burrata, heirloom tomatoes, basil, and balsamic glaze.', price: 12.00, category: 'Starters' },
  { id: 4, name: 'Classic Margherita Pizza', description: 'Tomato, mozzarella, and fresh basil.', price: 14.00, category: 'Mains', subcategory: 'Pizza' },
  { id: 5, name: 'Chocolate Lava Cake', description: 'Molten chocolate center, served with vanilla bean ice cream.', price: 9.50, category: 'Desserts' },
  { id: 6, name: 'Old Fashioned', description: 'Whiskey, bitters, sugar, and an orange twist.', price: 11.00, category: 'Drinks', subcategory: 'Cocktails' },
  { id: 7, name: 'Sparkling Water', description: 'San Pellegrino (750ml)', price: 4.50, category: 'Drinks', subcategory: 'Non-Alcoholic' },
  { id: 8, name: 'Fries', description: 'With truffle oil and parmesan.', price: 6.00, category: 'Sides' },
];

export const mockSetMenus: SetMenu[] = [
    {
        id: 1,
        name: 'Lunch Special (2 Courses)',
        price: 25.00,
        courses: [
            {
                title: 'Starters',
                items: [mockMenu.find(m => m.id === 3)!]
            },
            {
                title: 'Mains',
                items: [mockMenu.find(m => m.id === 1)!, mockMenu.find(m => m.id === 4)!]
            }
        ]
    }
];

export const mockOrders: Order[] = [];

export let mockReservations: Reservation[] = [
  { id: 1, customerName: 'John Doe', phone: '07123456789', partySize: 4, time: '2024-08-15T19:00:00.000Z', status: 'Confirmed' },
  { id: 2, customerName: 'Jane Smith', phone: '07987654321', partySize: 2, time: '2024-08-15T19:30:00.000Z', status: 'Confirmed', notes: 'Anniversary' },
  { id: 3, customerName: 'Peter Jones', phone: '07555123456', partySize: 6, time: '2024-08-15T20:00:00.000Z', status: 'Pending' },
  { id: 4, customerName: 'Mary Williams', phone: '07777888999', partySize: 3, time: '2024-08-16T18:00:00.000Z', status: 'Seated' },
  { id: 5, customerName: 'David Brown', phone: '07111222333', partySize: 5, time: '2024-08-16T20:30:00.000Z', status: 'Cancelled' },
];

export const getOrderByTableId = (orderId: number): Order | undefined => {
  if (!orderId) return undefined;
  return mockOrders.find(o => o.id === orderId);
};

export const mockCustomers: Customer[] = [
    { id: 1, name: 'John Doe', email: 'john.d@example.com', phone: '07123456789', totalOrders: 5, totalSpent: 250.75, lastVisit: '2024-08-10', loyaltyPoints: 25 },
    { id: 2, name: 'Jane Smith', email: 'jane.s@example.com', phone: '07987654321', totalOrders: 12, totalSpent: 890.50, lastVisit: '2024-08-15', loyaltyPoints: 89 },
    { id: 3, name: 'Peter Jones', email: 'p.jones@example.com', phone: '07555123456', totalOrders: 2, totalSpent: 95.00, lastVisit: '2024-07-20', loyaltyPoints: 9 },
    { id: 4, name: 'Mary Williams', email: 'mary.w@example.com', phone: '07777888999', totalOrders: 8, totalSpent: 410.20, lastVisit: '2024-08-12', loyaltyPoints: 41 },
    { id: 5, name: 'David Brown', email: 'd.brown@example.com', phone: '07111222333', totalOrders: 1, totalSpent: 45.80, lastVisit: '2024-06-05', loyaltyPoints: 4 },
]
