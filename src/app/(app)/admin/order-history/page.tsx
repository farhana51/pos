
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockOrders } from "@/lib/data";
import withAuth from "@/components/withAuth";
import { Order, UserRole } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Eye, Globe, Home, Package, Utensils } from "lucide-react";

const statusColors: Record<Order['status'], string> = {
    'Pending': 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/20',
    'Paid': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    'Cancelled': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
}

const typeIcons: Record<Order['type'], React.ElementType> = {
    'Table': Utensils,
    'Collection': Home,
    'Delivery': Car,
    'Online': Globe
}

function OrderHistoryPage() {
    const [orders] = useState<Order[]>(mockOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    const router = useRouter();

    const getOrderTitle = (order: Order) => {
        switch (order.type) {
            case 'Table':
                return `Table ${order.tableId}`;
            case 'Collection':
            case 'Delivery':
            case 'Online':
                return order.customerName || `Order #${order.id}`;
            default:
                return `Order #${order.id}`;
        }
    }

    const calculateTotal = (order: Order) => {
        const subtotal = order.items.reduce((sum, item) => {
            const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
            return sum + (item.menuItem.price + addonsTotal) * item.quantity;
        }, 0);
        return subtotal - (order.discount || 0);
    }

    return (
        <>
            <PageHeader title="Order History" />
            <main className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">All Orders</CardTitle>
                        <CardDescription>A comprehensive log of all transactions across all services.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => {
                                    const Icon = typeIcons[order.type];
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    <span>{getOrderTitle(order)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{format(new Date(order.createdAt), 'PPP')}</TableCell>
                                            <TableCell>{format(new Date(order.createdAt), 'p')}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={statusColors[order.status]}>
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">£{calculateTotal(order).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" onClick={() => router.push(`/orders/${order.id}`)}>
                                                    <Eye className="mr-2 h-3 w-3" />
                                                    View Order
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                         {orders.length === 0 && (
                            <div className="text-center text-muted-foreground py-16">
                                <Package className="w-12 h-12 mx-auto mb-4" />
                                <p>No orders have been placed yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

export default withAuth(OrderHistoryPage, ['Admin' as UserRole]);
