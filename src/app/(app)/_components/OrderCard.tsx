
'use client'

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { UserRole, Order, OrderItem } from "@/lib/types";
import { Car, Home, Package, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const OrderTypeIcon = ({ type }: { type: Order['type'] }) => {
    switch (type) {
        case 'Collection':
            return <Home className="w-4 h-4 mr-2" />;
        case 'Delivery':
            return <Car className="w-4 h-4 mr-2" />;
        case 'Online':
            return <Globe className="w-4 h-4 mr-2" />;
        default:
            return <Package className="w-4 h-4 mr-2" />;
    }
}

const statusBadgeVariant: Record<Order['status'], 'default' | 'outline' | 'secondary' | 'destructive'> = {
    'Pending': 'outline',
    'Paid': 'default',
    'Cancelled': 'destructive',
}

const statusBadgeColor: Record<Order['status'], string> = {
    'Pending': 'text-amber-500 border-amber-500',
    'Paid': 'bg-green-500/20 text-green-500 border-green-500/20',
    'Cancelled': '',
}

export function OrderCard({ order }: { order: Order }) {
    const router = useRouter();
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalCost = order.items.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
        return sum + (item.menuItem.price + addonsTotal) * item.quantity;
    }, 0) - (order.discount || 0);

    const getOrderTitle = () => {
        if (order.type === 'Collection' || order.type === 'Delivery' || order.type === 'Online') {
            return `${order.type} for ${order.customerName}`;
        }
        return `Order #${order.id}`;
    }

    const getButtonText = () => {
        switch (order.status) {
            case 'Pending':
                return 'View / Finalize Order';
            case 'Paid':
                return 'View Receipt';
            default:
                return 'View Details';
        }
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span className="flex items-center text-base">
                        <OrderTypeIcon type={order.type} />
                        {getOrderTitle()}
                    </span>
                    <Badge variant={statusBadgeVariant[order.status]} className={statusBadgeColor[order.status]}>{order.status}</Badge>
                </CardTitle>
                <CardDescription>
                    {totalItems} items - Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <ul className="space-y-1 text-sm text-muted-foreground">
                    {order.items.slice(0, 3).map((item: OrderItem, index) => (
                        <li key={index} className="flex justify-between">
                           <span>{item.quantity}x {item.menuItem.name}</span>
                           <span>£{(item.menuItem.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                    {order.items.length > 3 && (
                        <li className="text-center">... and {order.items.length - 3} more items.</li>
                    )}
                </ul>
            </CardContent>
            <CardFooter className="flex-col items-stretch space-y-2">
                 <div className="flex justify-between font-bold text-base">
                    <span>Total:</span>
                    <span>£{totalCost.toFixed(2)}</span>
                </div>
                 <Button className="w-full" onClick={() => router.push(`/orders/${order.id}`)} disabled={order.status === 'Cancelled'}>
                    {getButtonText()}
                </Button>
            </CardFooter>
        </Card>
    )
}
