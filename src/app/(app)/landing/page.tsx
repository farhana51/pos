

'use client'

import { BarChart2, BookOpen, Car, Contact, Globe, Home, LayoutDashboard, Package, Settings, Users, Calendar, LogOut, Radio, Wallet, Utensils, TrendingUp, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardTitle, CardHeader, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { logoutUser, mockUser, mockOrders } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';

const allServiceOptions = [
  {
    title: "Restaurant",
    icon: LayoutDashboard,
    href: "/dashboard",
    roles: ['Admin', 'Advanced', 'Basic'],
    setting: "restaurant"
  },
  {
    title: "Take Away",
    icon: Home,
    href: "/collection/new",
    roles: ['Admin', 'Advanced', 'Basic'],
    setting: "collection"
  },
  {
    title: "Delivery",
    icon: Car,
    href: "/delivery/new",
    roles: ['Admin', 'Advanced', 'Basic'],
    setting: "delivery"
  },
   {
    title: "Live Orders",
    icon: Radio,
    href: "/live-orders",
    roles: ['Admin', 'Advanced', 'Basic'],
    isDynamic: true,
  },
  {
    title: "Online Order",
    icon: Globe,
    href: "/online-orders",
    roles: ['Admin', 'Advanced', 'Basic'],
    setting: "onlineOrdering"
  },
  {
    title: "Reservation",
    icon: Calendar,
    href: "/reservations",
    roles: ['Admin', 'Advanced', 'Basic'],
    setting: "reservations"
  },
   {
    title: "CRM",
    icon: Contact,
    href: "/customers",
    roles: ['Admin', 'Advanced'],
    setting: "crm"
  },
  {
    title: "Staff List",
    icon: Users,
    href: "/team",
    roles: ['Admin']
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/inventory",
    roles: ['Admin', 'Advanced'],
    setting: "inventory"
  },
  {
    title: "Reports",
    icon: BarChart2,
    href: "/admin/reports",
    roles: ['Admin']
  },
  {
    title: "Menu",
    icon: BookOpen,
    href: "/menu",
    roles: ['Admin', 'Advanced']
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
    roles: ['Admin']
  },
  { 
    title: "Settings",
    icon: Settings,
    href: "/settings",
    roles: ['Advanced']
  }
];

const defaultSettings = {
    reservations: true,
    inventory: true,
    crm: false,
    delivery: true,
    onlineOrdering: true,
    collection: true,
    restaurant: true,
};


const calculateMetrics = () => {
    // In a real app, you'd filter by date for "today"
    const todaysOrders = mockOrders.filter(o => o.status === 'Paid');
    const totalRevenue = todaysOrders.reduce((acc, order) => {
        const orderTotal = order.items.reduce((sum, item) => {
            const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
            const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
            return sum + itemTotal;
        }, 0);
        return acc + orderTotal - (order.discount || 0);
    }, 0);

    const totalOrders = todaysOrders.length;
    const monthlyRevenue = totalRevenue * 20; // Mocked for demo
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, monthlyRevenue, averageOrderValue };
};

const getWeeklyRevenue = () => {
    // This is simplified, in a real app you'd process real dates
    return [
      { date: 'Mon', revenue: 2400 },
      { date: 'Tue', revenue: 1398 },
      { date: 'Wed', revenue: 9800 },
      { date: 'Thu', revenue: 3908 },
      { date: 'Fri', revenue: 4800 },
      { date: 'Sat', revenue: 3800 },
      { date: 'Sun', revenue: 4300 },
    ];
}


const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
}

function AdminDashboard() {
  const { totalRevenue, totalOrders, monthlyRevenue, averageOrderValue } = calculateMetrics();
  const revenueData = getWeeklyRevenue();
  const recentOrders = mockOrders.slice(0, 5);

  return (
    <>
      <PageHeader title="Dashboard" />
      <main className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalOrders}</div>
                     <p className="text-xs text-muted-foreground">+12 since yesterday</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                     <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">£{monthlyRevenue.toFixed(2)}</div>
                     <p className="text-xs text-muted-foreground">+15% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">£{averageOrderValue.toFixed(2)}</div>
                     <p className="text-xs text-muted-foreground">-5% from last month</p>
                </CardContent>
            </Card>
        </div>

         <div className="grid gap-8 md:grid-cols-3">
             <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline">Weekly Revenue</CardTitle>
                    <CardDescription>Revenue trend for the current week.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="date" tickLine={false} axisLine={false} />
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `£${value}`} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle className="font-headline">Quick Actions</CardTitle>
                    <CardDescription>Start a new task.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2">
                    <Button asChild><Link href="/dashboard"><LayoutDashboard className="mr-2"/> New Table Order</Link></Button>
                    <Button asChild variant="secondary"><Link href="/collection/new"><Home className="mr-2"/> New Take Away</Link></Button>
                    <Button asChild variant="secondary"><Link href="/delivery/new"><Car className="mr-2"/> New Delivery</Link></Button>
                    <Button asChild variant="secondary"><Link href="/reservations"><PlusCircle className="mr-2"/> Add Reservation</Link></Button>
                </CardContent>
            </Card>
         </div>

         <Card>
            <CardHeader>
                <CardTitle className="font-headline">Recent Transactions</CardTitle>
                <CardDescription>A log of the most recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentOrders.length > 0 ? recentOrders.map((order) => {
                            const total = (order.items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)) - (order.discount || 0);
                            return (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.type === 'Table' ? `Table ${order.tableId}` : order.type}</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'HH:mm')}</TableCell>
                                    <TableCell><Badge variant={order.status === 'Paid' ? 'default' : 'destructive'}>{order.status}</Badge></TableCell>
                                    <TableCell className="text-right">£{total.toFixed(2)}</TableCell>
                                </TableRow>
                            );
                        }) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">No transactions yet today.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </>
  )
}

function UserLandingPage() {
  const [appSettings, setAppSettings] = useState(defaultSettings);

  useEffect(() => {
    const loadSettings = () => {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
            setAppSettings(JSON.parse(savedSettings));
        }
    };
    loadSettings();
    window.addEventListener('storage', loadSettings); // Listen for changes from other tabs/windows
    return () => {
        window.removeEventListener('storage', loadSettings);
    };
  }, []);

  const pendingOrders = mockOrders.filter(o => o.status === 'Pending' && (o.type === 'Collection' || o.type === 'Delivery' || o.type === 'Online'));

  const serviceOptions = allServiceOptions.filter(option => {
    // Check role permission
    const hasRolePermission = option.roles.includes(mockUser.role);
    if (!hasRolePermission) return false;
    
    // Check if the feature is enabled in settings
    const settingKey = option.setting as keyof typeof appSettings;
    if (settingKey) {
      const isEnabled = appSettings[settingKey];
      if (!isEnabled) return false;
    }
    
    // Handle dynamic options like Live Orders
    if (option.isDynamic) {
        return pendingOrders.length > 0;
    }

    return true;
  });
  
  const isBasicUser = mockUser.role === 'Basic';
  const isAdvancedUser = mockUser.role === 'Advanced';

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className={cn("w-full", isBasicUser || isAdvancedUser ? "max-w-4xl" : "max-w-6xl")}>
            <div className={cn(
                "grid gap-6",
                 isBasicUser || isAdvancedUser
                    ? "grid-cols-1 md:grid-cols-4" 
                    : "grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
            )}>
                {serviceOptions.map((option) => (
                   <Link key={option.title + option.href} href={option.href} passHref>
                        <Card
                            className="transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl bg-card cursor-pointer h-40 flex flex-col items-center justify-center text-center p-4 relative"
                        >
                            {option.title === "Live Orders" && pendingOrders.length > 0 && (
                                <Badge className="absolute top-2 right-2">{pendingOrders.length}</Badge>
                            )}
                            <CardContent className="flex flex-col items-center justify-center p-0">
                                <option.icon className={`h-12 w-12 mb-2 text-primary`} strokeWidth={1.5} />
                                <CardTitle className="text-lg font-semibold">{option.title}</CardTitle>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}


function LandingPage() {
    const [currentUser, setCurrentUser] = useState<UserRole | null>(null);

    useEffect(() => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            setCurrentUser(JSON.parse(user).role);
        }
    }, []);

    if (currentUser === 'Admin') {
        return <AdminDashboard />;
    }
    
    return <UserLandingPage />;
}

export default withAuth(LandingPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
