
'use client'

import Link from "next/link";
import { useState } from 'react';
import { Users, Armchair, Circle, Utensils } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockTables, getOrderByTableId } from "@/lib/data";
import type { Table, TableStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const statusConfig: Record<TableStatus, { base: string; highlight: string; label: string; }> = {
  Available: { base: "text-green-500", highlight: "fill-green-500/10 stroke-green-500", label: "Available" },
  Occupied: { base: "text-blue-500", highlight: "fill-blue-500/10 stroke-blue-500", label: "Occupied" },
  Reserved: { base: "text-purple-500", highlight: "fill-purple-500/10 stroke-purple-500", label: "Reserved" },
  Dirty: { base: "text-yellow-500", highlight: "fill-yellow-500/10 stroke-yellow-500", label: "Needs Cleaning" },
};

function TableVisual({ table, isSelected, onClick }: { table: Table; isSelected: boolean; onClick: () => void }) {
  const config = statusConfig[table.status];
  const order = table.orderId ? getOrderByTableId(table.orderId) : null;

  // Function to generate chair positions
  const getChairPositions = (count: number) => {
    const chairs = [];
    const angleStep = 360 / count;
    for (let i = 0; i < count; i++) {
      const angle = angleStep * i - 90; // Start from top
      chairs.push({
        transform: `rotate(${angle}deg) translate(50px) rotate(-${angle}deg)`,
      });
    }
    return chairs;
  };

  const chairs = getChairPositions(table.capacity);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center w-40 h-40 cursor-pointer transition-transform duration-200 hover:scale-105",
        isSelected && "scale-105"
      )}
      onClick={onClick}
    >
      {/* Chairs */}
      {chairs.map((style, i) => (
        <div key={i} className="absolute w-8 h-6" style={{ transform: style.transform }}>
           <Armchair className={cn("w-full h-full transform -rotate-90", config.base)} strokeWidth={1.5} />
        </div>
      ))}
      {/* Table */}
      <div className="relative flex items-center justify-center w-24 h-24">
        <Circle className={cn("absolute w-full h-full transition-all", config.highlight)} strokeWidth={2} />
        <Circle className={cn("absolute w-full h-full transition-all scale-90", isSelected ? config.highlight : "fill-transparent", "hover:fill-primary/10")} strokeWidth={0} />
        <span className={cn("text-2xl font-bold", config.base)}>
          {table.id}
        </span>
      </div>
    </div>
  );
}

function OrderPanel({ selectedTable }: { selectedTable: Table | null }) {
    const order = selectedTable?.orderId ? getOrderByTableId(selectedTable.orderId) : null;

    const subtotal = order?.items.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
        return sum + (item.menuItem.price + addonsTotal) * item.quantity;
    }, 0) ?? 0;

    const totalVat = order?.items.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
        const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
        if (item.menuItem.vatRate > 0) {
            return sum + (itemTotal * (item.menuItem.vatRate / 100));
        }
        return sum;
    }, 0) ?? 0;

    const grandTotal = subtotal + totalVat;

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{selectedTable ? `Table ${selectedTable.id}` : 'No Table Selected'}</span>
                    {selectedTable && <span className={cn("text-sm font-medium", statusConfig[selectedTable.status].base)}>{statusConfig[selectedTable.status].label}</span>}
                </CardTitle>
                <CardDescription>
                    {order ? `Order #${order.id} - ${format(new Date(order.createdAt), 'p')}` : 'Click a table to view or create an order.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                {selectedTable && order ? (
                    <div className="text-left w-full h-full flex flex-col">
                        <div className="flex-1 space-y-2 overflow-y-auto">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start text-sm">
                                    <div>
                                        <p className="font-medium">{item.quantity}x {item.menuItem.name}</p>
                                        {item.notes && <p className="text-xs text-muted-foreground">Note: {item.notes}</p>}
                                    </div>
                                    <p>£{((item.menuItem.price + (item.selectedAddons?.reduce((a,c) => a+c.price, 0) || 0)) * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 mt-4 space-y-2">
                             <div className="flex justify-between text-sm">
                                <span>Subtotal</span>
                                <span>£{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>VAT</span>
                                <span>£{totalVat.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base">
                                <span>Total</span>
                                <span>£{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <Utensils className="w-16 h-16 mb-4" />
                        <p className="font-semibold">{selectedTable ? 'New Order' : 'No Table Selected'}</p>
                        <p className="text-sm">{selectedTable ? 'Add items to create a new order.' : 'Select a table to begin.'}</p>
                    </>
                )}
            </CardContent>
             <div className="p-6 pt-0">
                <Button className="w-full" asChild disabled={!selectedTable}>
                   <Link href={order ? `/orders/${order.id}` : '#'}>
                     {order ? 'View / Edit Order' : 'Create New Order'}
                   </Link>
                </Button>
            </div>
        </Card>
    );
}

export default function DashboardPage() {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(mockTables.find(t => t.status === 'Occupied')?.id ?? null);
  const selectedTable = mockTables.find(t => t.id === selectedTableId) ?? null;

  return (
    <>
      <PageHeader title="Pizzeria Floor Plan" />
      <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                     <Tabs defaultValue="first" className="w-full">
                        <TabsList>
                           <TabsTrigger value="first">First Floor</TabsTrigger>
                           <TabsTrigger value="second" disabled>Second Floor</TabsTrigger>
                        </TabsList>
                        <TabsContent value="first" className="pt-4">
                            <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 place-items-center">
                                {mockTables.map((table) => (
                                    <TableVisual 
                                        key={table.id} 
                                        table={table} 
                                        isSelected={selectedTableId === table.id}
                                        onClick={() => setSelectedTableId(table.id)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardHeader>
            </Card>
        </div>
        <div className="md:col-span-1">
            <OrderPanel selectedTable={selectedTable} />
        </div>
      </main>
    </>
  );
}
