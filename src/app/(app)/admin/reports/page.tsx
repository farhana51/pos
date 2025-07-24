
'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/lib/types';
import { mockOrders, mockMenu } from '@/lib/data';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CreditCard, HandCoins, Tag, TrendingUp, Utensils, Wallet } from 'lucide-react';

const calculateMetrics = () => {
    const totalRevenue = mockOrders.reduce((acc, order) => acc + order.items.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
        const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
        const vat = item.menuItem.vatRate === 20 ? itemTotal * 0.2 : 0;
        return sum + itemTotal + vat;
    }, 0), 0);

    const totalOrders = mockOrders.length;
    const averageOrderValue = totalRevenue / totalOrders;

    return { totalRevenue, totalOrders, averageOrderValue };
};

const getSalesByCategory = () => {
    const categorySales: { [key: string]: number } = {};
    mockOrders.forEach(order => {
        order.items.forEach(item => {
            const category = item.menuItem.category;
            const itemTotal = item.menuItem.price * item.quantity;
            if (!categorySales[category]) {
                categorySales[category] = 0;
            }
            categorySales[category] += itemTotal;
        });
    });
    return Object.entries(categorySales).map(([name, sales]) => ({ name, sales }));
}

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
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent))",
  }
}

const paymentMethodIcons = {
    'Card': <CreditCard className="h-4 w-4" />,
    'Cash': <HandCoins className="h-4 w-4" />,
    'Voucher': <Tag className="h-4 w-4" />,
}

function ReportsPage() {
    const { totalRevenue, totalOrders, averageOrderValue } = calculateMetrics();
    const salesData = getSalesByCategory();
    const revenueData = getWeeklyRevenue();

  return (
    <>
      <PageHeader title="Reports & Analytics" />
      <main className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">£{totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Utensils className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{totalOrders}</div>
                     <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">£{averageOrderValue.toFixed(2)}</div>
                     <p className="text-xs text-muted-foreground">+19% from last month</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Sales by Category</CardTitle>
                <CardDescription>Breakdown of sales across different menu categories for the current month.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `£${value}`} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                    </BarChart>
                </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            </Card>
            <Card>
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
                            <TableHead>Table</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockOrders.slice(0, 5).map((order) => {
                            const total = order.items.reduce((sum, item) => {
                                const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
                                const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
                                const vat = item.menuItem.vatRate === 20 ? itemTotal * 0.2 : 0;
                                return sum + itemTotal + vat;
                            }, 0);
                            return (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.tableId}</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'HH:mm')}</TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-2'>
                                            {paymentMethodIcons[order.paymentMethod]}
                                            {order.paymentMethod}
                                        </div>
                                    </TableCell>
                                    <TableCell><Badge variant={order.status === 'Paid' ? 'default' : 'destructive'}>{order.status}</Badge></TableCell>
                                    <TableCell className="text-right">£{total.toFixed(2)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </main>
    </>
  );
}

export default withAuth(ReportsPage, ['Admin' as UserRole]);
