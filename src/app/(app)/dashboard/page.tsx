
'use client'

import Link from "next/link";
import { useState } from 'react';
import { Users, Armchair, Circle, Utensils, Square, Minus, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockTables, getOrderByTableId } from "@/lib/data";
import type { Table, TableStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

const statusConfig: Record<TableStatus, { border: string; bg: string; label: string; }> = {
  Available: { border: "border-green-500", bg: "bg-green-500/10", label: "Available" },
  Occupied: { border: "border-red-500", bg: "bg-red-500/10", label: "Occupied" },
  Reserved: { border: "border-purple-500", bg: "bg-purple-500/10", label: "Reserved" },
  Dirty: { border: "border-yellow-500", bg: "bg-yellow-500/10", label: "Needs Cleaning" },
};

function TableVisual({ table, isSelected, onClick }: { table: Table; isSelected: boolean; onClick: () => void }) {
  const config = statusConfig[table.status];
  
  const getChairPositions = (count: number, width: number, height: number) => {
    const chairs = [];
    const chairSize = 24; // width and height of chair container
    const tableWidth = width * 4; // Assuming 1rem = 4px, w-16 = 64px
    const tableHeight = height * 4;

    // Horizontal chairs (top and bottom)
    const horizontalSpacing = tableWidth / (Math.ceil(count / 2));
    for (let i = 0; i < Math.ceil(count / 2); i++) {
        // Top
        chairs.push({ top: `-${chairSize/2}px`, left: `${(i * horizontalSpacing) + (horizontalSpacing / 2) - (chairSize/2)}px` });
        // Bottom
         if(chairs.length < count) chairs.push({ bottom: `-${chairSize/2}px`, left: `${(i * horizontalSpacing) + (horizontalSpacing / 2) - (chairSize/2)}px`});
    }

    // Vertical chairs (left and right sides) - if capacity is not fully met by top/bottom
    const remainingChairs = count - chairs.length;
    if (remainingChairs > 0) {
        const verticalSpacing = tableHeight / (Math.ceil(remainingChairs / 2));
         for (let i = 0; i < Math.ceil(remainingChairs / 2); i++) {
            // Left
            if(chairs.length < count) chairs.push({ left: `-${chairSize/2}px`, top: `${(i * verticalSpacing) + (verticalSpacing / 2) - (chairSize/2)}px` });
            // Right
            if(chairs.length < count) chairs.push({ right: `-${chairSize/2}px`, top: `${(i * verticalSpacing) + (verticalSpacing / 2) - (chairSize/2)}px` });
        }
    }
    
    return chairs;
  };
  
  const width = table.width ?? 16;
  const height = table.height ?? 16;
  const chairs = getChairPositions(table.capacity, width, height);

  return (
    <div
      className={cn(
        "absolute cursor-pointer transition-transform duration-200 hover:scale-110",
        isSelected && "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md"
      )}
      style={{ top: `${table.y}px`, left: `${table.x}px` }}
      onClick={onClick}
    >
        <div 
            className={cn(
                "relative flex items-center justify-center rounded-md border-2",
                config.border,
                config.bg
            )}
            style={{ width: `${width*4}px`, height: `${height*4}px` }}
        >
             {chairs.map((style, i) => (
                <div key={i} className="absolute w-6 h-6 bg-blue-400 rounded-md" style={{ ...style }}>
                </div>
            ))}
            <span className="text-2xl font-bold text-foreground">
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
                    {selectedTable && <span className={cn("text-sm font-medium px-2 py-1 rounded-full", statusConfig[selectedTable.status].bg, statusConfig[selectedTable.status].border.replace('border-', 'text-'))}>{statusConfig[selectedTable.status].label}</span>}
                </CardTitle>
                <CardDescription>
                    {order ? `Order #${order.id} - ${format(new Date(order.createdAt), 'p')}` : 'Click a table to view or create an order.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground">
                {selectedTable && order ? (
                    <div className="text-left w-full h-full flex flex-col">
                        <div className="flex-1 space-y-2 overflow-y-auto p-1">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start text-sm p-2 rounded-md bg-muted/50">
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

  // The background image URL can be made dynamic in a real app (e.g., from settings)
  const floorPlanBackgroundUrl = 'https://placehold.co/1200x800.png';

  return (
    <>
      <PageHeader title="Pizzeria Floor Plan" />
      <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                     <Tabs defaultValue="first" className="w-full">
                        <TabsList>
                           <TabsTrigger value="first">Main Floor</TabsTrigger>
                           <TabsTrigger value="second" disabled>Patio</TabsTrigger>
                        </TabsList>
                        <TabsContent value="first" className="pt-4">
                           <div 
                                className="relative h-[600px] w-full bg-cover bg-center rounded-md"
                                style={{ backgroundImage: `url(${floorPlanBackgroundUrl})` }}
                                data-ai-hint="wood floor"
                            >
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
