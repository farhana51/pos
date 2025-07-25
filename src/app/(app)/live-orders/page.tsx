
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
import { OrderCard } from "../_components/OrderCard";


function LiveOrdersPage() {
    const [orders, setOrders] = useState<Order[]>(
        mockOrders.filter(o => o.status === 'Pending' && (o.type === 'Collection' || o.type === 'Delivery' || o.type === 'Online'))
    );

    return (
    <>
      <PageHeader title="Live Orders" />
      <main className="p-4 sm:p-6 lg:p-8">
        {orders.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        ) : (
            <Card className="flex flex-col items-center justify-center text-center text-muted-foreground h-96">
                <CardContent className="flex flex-col items-center justify-center">
                    <Radio className="w-16 h-16 mb-4" />
                    <h2 className="text-xl font-semibold">No Live Orders</h2>
                    <p className="text-sm">Pending Take Away, Delivery or Online orders will appear here.</p>
                </CardContent>
            </Card>
        )}

      </main>
    </>
  );
}

export default withAuth(LiveOrdersPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
