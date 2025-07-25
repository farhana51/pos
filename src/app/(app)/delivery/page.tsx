
'use client'

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { Car } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function DeliveryPage() {
  return (
    <>
      <PageHeader title="Delivery Orders">
        <Button asChild>
            <Link href="/delivery/new">New Delivery Order</Link>
        </Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Out for Delivery</CardTitle>
            <CardDescription>Manage and track delivery orders.</CardDescription>
          </CardHeader>
           <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
              <Car className="w-16 h-16 mb-4" />
              <p>No orders are currently out for delivery.</p>
              <p className="text-sm">New delivery orders will appear here.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

export default withAuth(DeliveryPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole], 'delivery');
