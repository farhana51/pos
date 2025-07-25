
'use client'

import Link from "next/link";
import { MoreVertical, Users, CheckCircle, Clock, Ban, Utensils, AlertTriangle, Megaphone, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { mockTables, getOrderByTableId } from "@/lib/data";
import type { Table, TableStatus } from "@/lib/types";

const statusConfig: Record<TableStatus, { color: string; label: string; }> = {
  Available: { color: "bg-green-500", label: "Available" },
  Occupied: { color: "bg-blue-500", label: "Occupied" },
  Reserved: { color: "bg-purple-500", label: "Reserved" },
  Dirty: { color: "bg-yellow-500", label: "Needs Cleaning" },
};


function TableCard({ table }: { table: Table }) {
  const config = statusConfig[table.status];
  const order = table.orderId ? getOrderByTableId(table.orderId) : null;

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg bg-secondary border-secondary">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Table {table.id}</CardTitle>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{table.capacity} Chairs</span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
         <div className="flex items-center gap-2">
          <span className={`h-3 w-3 rounded-full ${config.color}`} />
          <span className="text-lg font-medium">{config.label}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {table.orderId ? (
          <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={`/orders/${table.orderId}`}>View Order</Link>
          </Button>
        ) : (
           <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
            <Link href={`/`}>Take Order</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Pizzeria" />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {mockTables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </main>
    </>
  );
}
