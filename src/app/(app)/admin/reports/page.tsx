'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import withAuth from '@/components/withAuth';
import { UserRole } from '@/lib/types';

const salesData = [
  { category: 'Mains', sales: 4000 },
  { category: 'Starters', sales: 3000 },
  { category: 'Drinks', sales: 2780 },
  { category: 'Desserts', sales: 1890 },
  { category: 'Sides', sales: 2390 },
];

const revenueData = [
  { date: 'Mon', revenue: 2400 },
  { date: 'Tue', revenue: 1398 },
  { date: 'Wed', revenue: 9800 },
  { date: 'Thu', revenue: 3908 },
  { date: 'Fri', revenue: 4800 },
  { date: 'Sat', revenue: 3800 },
  { date: 'Sun', revenue: 4300 },
];

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

function ReportsPage() {
  return (
    <>
      <PageHeader title="Reports & Analytics" />
      <main className="p-4 sm:p-6 lg:p-8 grid gap-8 md:grid-cols-2">
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
                  <XAxis dataKey="category" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
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
                  <YAxis tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default withAuth(ReportsPage, ['Admin' as UserRole]);
