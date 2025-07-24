import Link from "next/link";
import { MoreVertical, Users, CheckCircle, Clock, Ban, Utensils, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockTables, getOrderByTableId } from "@/lib/data";
import type { Table, TableStatus } from "@/lib/types";

const statusConfig: Record<TableStatus, { icon: React.ElementType; color: string; label: string }> = {
  Available: { icon: CheckCircle, color: "bg-green-500", label: "Available" },
  Occupied: { icon: Utensils, color: "bg-blue-500", label: "Occupied" },
  Reserved: { icon: Clock, color: "bg-purple-500", label: "Reserved" },
  Dirty: { icon: AlertTriangle, color: "bg-yellow-500", label: "Needs Cleaning" },
};

function TableCard({ table }: { table: Table }) {
  const { icon: Icon, color, label } = statusConfig[table.status];
  const order = table.orderId ? getOrderByTableId(table.id) : null;
  const partySize = order ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0; // Simplified party size

  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-headline">Table {table.id}</CardTitle>
        <Badge variant="outline" className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          {label}
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
              <span>{partySize} Guests</span>
           </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {table.orderId ? (
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/80">
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
      <PageHeader title="Table Dashboard" />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {mockTables.map((table) => (
            <TableCard key={table.id} table={table} />
          ))}
        </div>
      </main>
    </>
  );
}
