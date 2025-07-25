
import Link from "next/link";
import { MoreVertical, Users, CheckCircle, Clock, Ban, Utensils, AlertTriangle, Megaphone, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockTables, getOrderByTableId } from "@/lib/data";
import type { Table, TableStatus } from "@/lib/types";

const statusConfig: Record<TableStatus, { icon: React.ElementType; color: string; label: string; className: string }> = {
  Available: { icon: CheckCircle, color: "bg-green-500", label: "Available", className: "border-green-500/20 bg-green-500/5 text-green-700" },
  Occupied: { icon: Utensils, color: "bg-blue-500", label: "Occupied", className: "border-blue-500/20 bg-blue-500/5 text-blue-700" },
  Reserved: { icon: Clock, color: "bg-purple-500", label: "Reserved", className: "border-purple-500/20 bg-purple-500/5 text-purple-700" },
  Dirty: { icon: AlertTriangle, color: "bg-yellow-500", label: "Needs Cleaning", className: "border-yellow-500/20 bg-yellow-500/5 text-yellow-700" },
};

function PromotionalBanner() {
    return (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-full">
                    <Megaphone className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h3 className="font-bold text-primary">Happy Hour Special!</h3>
                    <p className="text-sm text-primary/80">50% off all cocktails from 5 PM to 7 PM. Encourage upsells!</p>
                </div>
            </div>
             <Button variant="outline" asChild>
                <Link href="/menu">
                    View Cocktails <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}

function TableCard({ table }: { table: Table }) {
  const config = statusConfig[table.status];
  const order = table.orderId ? getOrderByTableId(table.orderId) : null;
  const partySize = order ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0; // Simplified party size

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-headline">Table {table.id}</CardTitle>
        <Badge variant="outline" className={`flex items-center gap-2 ${config.className}`}>
          <span className={`h-2 w-2 rounded-full ${config.color}`} />
          {config.label}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-muted-foreground">
          <Users className="mr-2 h-4 w-4" />
          <span>{table.capacity} Seats</span>
        </div>
        {table.status === 'Occupied' && order && (
           <div className="flex items-center text-muted-foreground mt-2">
              <Users className="mr-2 h-4 w-4" />
              <span>{partySize} Guest{partySize === 1 ? '' : 's'}</span>
           </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {table.orderId ? (
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href={`/orders/${table.orderId}`}>View Order</Link>
          </Button>
        ) : (
          <Button variant="outline">Take Order</Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Transfer Table</DropdownMenuItem>
            <DropdownMenuItem>Mark as Clean</DropdownMenuItem>
            <DropdownMenuItem>Add Reservation</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Restaurant Floor Plan" />
      <main className="p-4 sm:p-6 lg:p-8">
        <PromotionalBanner />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {mockTables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </main>
    </>
  );
}
