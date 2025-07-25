
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { UserRole, Order, OrderItem } from "@/lib/types";
import { mockOrders } from "@/lib/data";
import { Car, Home, Package, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

const OrderTypeIcon = ({ type }: { type: Order['type'] }) => {
    switch (type) {
        case 'Collection':
            return <Home className="w-4 h-4 mr-2" />;
        case 'Delivery':
            return <Car className="w-4 h-4 mr-2" />;
        default:
            return <Package className="w-4 h-4 mr-2" />;
    }
}

function OrderCard({ order }: { order: Order }) {
    const router = useRouter();
    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span className="flex items-center">
                        <OrderTypeIcon type={order.type} />
                        {order.type === 'Collection' ? `Collection for ${order.customerName}` : `Delivery Order #${order.id}`}
                    </span>
                    <Badge variant="outline" className="text-amber-500 border-amber-500">{order.status}</Badge>
                </CardTitle>
                <CardDescription>
                    {totalItems} items - Placed {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                </CardDescription>
            </CardHeader>
            <CardContent>
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
            <CardFooter>
                 <Button className="w-full" onClick={() => router.push(`/orders/${order.id}`)}>
                    View / Finalize Order
                </Button>
            </CardFooter>
        </Card>
    )
}


function LiveOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(
        mockOrders.filter(o => o.status === 'Pending' && (o.type === 'Collection' || o.type === 'Delivery'))
    );

    return (
    <>
      <PageHeader title="Live Orders" />
      <main className="p-4 sm:p-6 lg:p-8">
        {orders.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        ) : (
            <Card className="flex flex-col items-center justify-center text-center text-muted-foreground h-96">
                <CardContent className="flex flex-col items-center justify-center">
                    <Radio className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">No Live Orders</h2>
                    <p className="text-sm">Pending Take Away or Delivery orders will appear here.</p>
                </CardContent>
            </Card>
        )}

      </main>
    </>
  );
}

export default withAuth(LiveOrdersPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
