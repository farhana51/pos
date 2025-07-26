

'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockOrders } from "@/lib/data";
import withAuth from "@/components/withAuth";
import { Order, UserRole, PaymentMethod } from "@/lib/types";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, CreditCard, Eye, Globe, HandCoins, Home, Package, Printer, Tag, Trash2, Utensils } from "lucide-react";
import { OrderReceiptDialog } from "./_components/OrderReceiptDialog";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<Order['type'], React.ElementType> = {
    'Table': Utensils,
    'Collection': Home,
    'Delivery': Car,
    'Online': Globe
}

const paymentMethodIcons: Record<PaymentMethod, React.ElementType> = {
    'Card': CreditCard,
    'Cash': HandCoins,
    'Voucher': Tag,
}

function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>(mockOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const router = useRouter();
    const { toast } = useToast();

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

    const handleDeleteOrder = (orderId: number) => {
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if(orderIndex > -1) {
            mockOrders.splice(orderIndex, 1);
            setOrders(prev => prev.filter(o => o.id !== orderId));
            toast({
                title: "Order Refunded",
                description: `Order TIK-${orderId} has been refunded and removed from history.`,
                variant: 'destructive'
            });
        }
    }

    return (
        <>
            <PageHeader title="All Orders" />
            <main className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Order Log</CardTitle>
                        <CardDescription>A comprehensive log of all transactions across all services.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Payment Method</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => {
                                    const PaymentIcon = order.paymentMethod ? paymentMethodIcons[order.paymentMethod] : null;
                                    return (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">TIK-{order.id}</TableCell>
                                            <TableCell>
                                                <div>{format(new Date(order.createdAt), 'PP')}</div>
                                                <div className="text-xs text-muted-foreground">{format(new Date(order.createdAt), 'p')}</div>
                                            </TableCell>
                                            <TableCell>{getOrderTitle(order)}</TableCell>
                                            <TableCell>
                                                 <Badge variant="outline">{order.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {PaymentIcon && (
                                                    <Badge variant="secondary" className="gap-1.5">
                                                        <PaymentIcon className="h-3 w-3" />
                                                        {order.paymentMethod}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">£{calculateTotal(order).toFixed(2)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(order)}>
                                                    <Eye className="h-4 w-4" />
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
            <OrderReceiptDialog
                isOpen={!!selectedOrder}
                setIsOpen={(isOpen) => !isOpen && setSelectedOrder(null)}
                order={selectedOrder}
                onRefund={handleDeleteOrder}
            />
        </>
    );
}

export default withAuth(OrderHistoryPage, ['Admin' as UserRole]);
