
'use client'

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { UserRole, Order } from "@/lib/types";
import { Package, PlusCircle } from "lucide-react";
import { mockOrders } from "@/lib/data";
import { OrderCard } from "../_components/OrderCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

function CollectionPage() {
    const [orders, setOrders] = useState<Order[]>(mockOrders.filter(o => o.type === 'Collection' && o.status !== 'Cancelled'));

  return (
    <>
      <PageHeader title="Collection Orders">
         <Button asChild>
            <Link href="/collection/new"><PlusCircle className="mr-2"/> New Take Away</Link>
        </Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8">
       {orders.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {orders.map(order => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>
        ) : (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Collection Orders</CardTitle>
                    <CardDescription>Manage takeaway orders.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                    <Package className="w-16 h-16 mb-4" />
                    <p>No orders are currently available for collection.</p>
                    <p className="text-sm">New collection orders will appear here.</p>
                </CardContent>
            </Card>
        )}
      </main>
    </>
  );
}

export default withAuth(CollectionPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole], 'collection');
