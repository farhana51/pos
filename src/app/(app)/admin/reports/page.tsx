
'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Sector, XAxis, YAxis } from 'recharts';
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
import React from 'react';

const calculateMetrics = () => {
    const totalRevenue = mockOrders.reduce((acc, order) => {
        if (order.status === 'Cancelled') return acc;
        const orderTotal = order.items.reduce((sum, item) => {
            const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
            const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
            const vat = item.menuItem.vatRate > 0 ? itemTotal * (item.menuItem.vatRate / 100) : 0;
            return sum + itemTotal + vat;
        }, 0);
        return acc + orderTotal;
    }, 0);

    const paidOrders = mockOrders.filter(o => o.status === 'Paid');
    const totalOrders = paidOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return { totalRevenue, totalOrders, averageOrderValue };
};

const getSalesByCategory = () => {
    const categorySales: { [key: string]: number } = {};
    mockOrders.forEach(order => {
        if (order.status === 'Paid') {
            order.items.forEach(item => {
                const category = item.menuItem.category;
                const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
                const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
                if (!categorySales[category]) {
                    categorySales[category] = 0;
                }
                categorySales[category] += itemTotal; // Calculating based on pre-VAT price
            });
        }
    });
    return Object.entries(categorySales).map(([name, sales]) => ({ name, sales }));
}

const getPaymentMethodDistribution = () => {
    const paymentMethods: { [key: string]: number } = {};
    mockOrders.forEach(order => {
        if (order.status === 'Paid' && order.paymentMethod) {
            if (!paymentMethods[order.paymentMethod]) {
                paymentMethods[order.paymentMethod] = 0;
            }
            paymentMethods[order.paymentMethod]++;
        }
    });
    return Object.entries(paymentMethods).map(([name, value]) => ({ name, value, fill: `var(--color-${name.toLowerCase()})` }));
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
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
  card: {
    label: "Card",
    color: "hsl(var(--chart-1))",
  },
  cash: {
    label: "Cash",
    color: "hsl(var(--chart-2))",
  },
  voucher: {
    label: "Voucher",
    color: "hsl(var(--chart-3))",
  }
}

const paymentMethodIcons = {
    'Card': <CreditCard className="h-4 w-4" />,
    'Cash': <HandCoins className="h-4 w-4" />,
    'Voucher': <Tag className="h-4 w-4" />,
}

const ActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>{payload.name}</text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))">{`${value} Txns`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


function ReportsPage() {
    const { totalRevenue, totalOrders, averageOrderValue } = calculateMetrics();
    const salesData = getSalesByCategory();
    const revenueData = getWeeklyRevenue();
    const paymentData = getPaymentMethodDistribution();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

  return (
    <>
      <PageHeader title="Reports & Analytics" />
      <main className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle className="font-headline text-lg">Payment Methods</CardTitle>
                    <CardDescription>Distribution of transactions by payment type.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                                <Pie 
                                    activeIndex={activeIndex}
                                    activeShape={ActiveShape} 
                                    data={paymentData} 
                                    cx="50%" 
                                    cy="50%" 
                                    innerRadius={60} 
                                    outerRadius={80} 
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                >
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
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
                                const vat = item.menuItem.vatRate > 0 ? itemTotal * (item.menuItem.vatRate / 100) : 0;
                                return sum + itemTotal + vat;
                            }, 0);
                            return (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id}</TableCell>
                                    <TableCell>{order.tableId}</TableCell>
                                    <TableCell>{format(new Date(order.createdAt), 'HH:mm')}</TableCell>
                                    <TableCell>
                                        <div className='flex items-center gap-2'>
                                            {order.paymentMethod ? paymentMethodIcons[order.paymentMethod] : null}
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
