
'use client'

import Link from "next/link";
import React, { useState, useEffect, useRef } from 'react';
import { Users, Armchair, Circle, Utensils, Square, Minus, Plus, Save, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { mockTables as initialMockTables, getOrderByTableId } from "@/lib/data";
import type { Table, TableStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";


const statusConfig: Record<TableStatus, { border: string; bg: string; label: string; }> = {
  Available: { border: "border-green-500", bg: "bg-green-500/10", label: "Available" },
  Occupied: { border: "border-red-500", bg: "bg-red-500/10", label: "Occupied" },
  Reserved: { border: "border-purple-500", bg: "bg-purple-500/10", label: "Reserved" },
  Dirty: { border: "border-yellow-500", bg: "bg-yellow-500/10", label: "Needs Cleaning" },
};

function TableVisual({ table, isSelected, onMouseDown }: { table: Table; isSelected: boolean; onMouseDown: (e: React.MouseEvent<HTMLDivElement>, tableId: number) => void }) {
  const config = statusConfig[table.status];
  
  const getChairPositions = (count: number, width: number, height: number) => {
    const chairs = [];
    const chairSize = 24; // width and height of chair container
    const tableWidth = width * 4;
    const tableHeight = height * 4;

    const horizontalCount = Math.ceil(count / 2);
    const verticalCount = Math.ceil((count - horizontalCount * 2) / 2);
    
    const horizontalSpacing = tableWidth / (horizontalCount);
    for (let i = 0; i < horizontalCount; i++) {
        chairs.push({ top: `-${chairSize/2}px`, left: `${(i * horizontalSpacing) + (horizontalSpacing / 2) - (chairSize/2)}px` });
        if(chairs.length < count) chairs.push({ bottom: `-${chairSize/2}px`, left: `${(i * horizontalSpacing) + (horizontalSpacing / 2) - (chairSize/2)}px`});
    }

    const verticalSpacing = tableHeight / (verticalCount + 1);
     for (let i = 0; i < verticalCount; i++) {
        if(chairs.length < count) chairs.push({ left: `-${chairSize/2}px`, top: `${((i+1) * verticalSpacing) - (chairSize/2)}px` });
        if(chairs.length < count) chairs.push({ right: `-${chairSize/2}px`, top: `${((i+1) * verticalSpacing) - (chairSize/2)}px` });
    }
    
    return chairs;
  };
  
  const width = table.width ?? 16;
  const height = table.height ?? 16;
  const chairs = getChairPositions(table.capacity, width, height);

  return (
    <div
      className={cn(
        "absolute cursor-grab active:cursor-grabbing transition-transform duration-200 hover:scale-110",
        isSelected && "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background rounded-md z-20"
      )}
      style={{ top: `${table.y}px`, left: `${table.x}px` }}
      onMouseDown={(e) => onMouseDown(e, table.id)}
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
                <div key={i} className="absolute w-6 h-6 bg-muted rounded-md flex items-center justify-center" style={{ ...style }}>
                    <Armchair className="w-4 h-4 text-muted-foreground" />
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

    const grandTotal = subtotal;

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
                   <Link href={selectedTable?.status === 'Occupied' && order ? `/orders/${order.id}` : (selectedTable?.status === 'Available' ? `/orders/new?tableId=${selectedTable.id}` : '#')}>
                     {order ? 'View / Edit Order' : 'Create New Order'}
                   </Link>
                </Button>
            </div>
        </Card>
    );
}

function GuestsDialog({ table, onConfirm }: { table: Table | null; onConfirm: (guests: number) => void; }) {
    const [guests, setGuests] = useState(table?.capacity || 1);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (table) {
            setIsOpen(true);
            setGuests(table.capacity);
        } else {
            setIsOpen(false);
        }
    }, [table]);

    const handleConfirm = () => {
        onConfirm(guests);
        setIsOpen(false);
    }

    if (!table) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>How many guests for Table {table.id}?</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <Label htmlFor="guests-input">Number of Guests</Label>
                    <Input 
                        id="guests-input"
                        type="number"
                        min="1"
                        max="99"
                        value={guests}
                        onChange={(e) => setGuests(parseInt(e.target.value, 10))}
                        className="text-center text-2xl h-16"
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleConfirm} disabled={!guests || guests < 1 || guests > 99}>Confirm Guests</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}


const floorPlanBackgrounds: Record<string, {url: string, hint: string}> = {
    "Main Floor": { url: 'https://placehold.co/1200x800.png', hint: 'wood floor' },
    "Patio": { url: 'https://placehold.co/1200x800.png', hint: 'patio tiles' },
}

export default function DashboardPage() {
  const [tables, setTables] = useState<Table[]>(initialMockTables);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  
  const floorPlanRef = useRef<HTMLDivElement>(null);
  const draggingTable = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);

  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null;
  const [tableForGuestInput, setTableForGuestInput] = useState<Table | null>(null);

  const floors = [...new Set(initialMockTables.map(t => t.floor))];

  const handleTableClick = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    setSelectedTableId(tableId);

    if (table.status === 'Available') {
      setTableForGuestInput(table);
    } else if (table.status === 'Occupied') {
      router.push(`/orders/${table.orderId}`);
    }
    // For other statuses like 'Reserved' or 'Dirty', just select them to show info.
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, tableId: number) => {
    e.preventDefault();
    const table = tables.find(t => t.id === tableId);
    
    // Select the table first
    setSelectedTableId(tableId);

    // If table is available, open guest dialog. Otherwise, handle dragging.
    if (table && table.status === 'Available') {
        setTableForGuestInput(table);
    } else {
        const tableElement = e.currentTarget;
        const rect = tableElement.getBoundingClientRect();
        draggingTable.current = {
          id: tableId,
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingTable.current || !floorPlanRef.current) return;
    const floorRect = floorPlanRef.current.getBoundingClientRect();
    
    let newX = e.clientX - floorRect.left - draggingTable.current.offsetX;
    let newY = e.clientY - floorRect.top - draggingTable.current.offsetY;

    // Constrain within the floor plan
    const table = tables.find(t => t.id === draggingTable.current!.id)!;
    const tableWidth = (table.width ?? 16) * 4;
    const tableHeight = (table.height ?? 16) * 4;

    newX = Math.max(0, Math.min(newX, floorRect.width - tableWidth));
    newY = Math.max(0, Math.min(newY, floorRect.height - tableHeight));

    setTables(prevTables =>
      prevTables.map(t =>
        t.id === draggingTable.current!.id ? { ...t, x: newX, y: newY } : t
      )
    );
  };

  const handleMouseUp = () => {
    if (draggingTable.current) {
        const table = tables.find(t => t.id === draggingTable.current!.id);
        if (table && table.status === 'Occupied') {
            router.push(`/orders/${table.orderId}`);
        }
    }
    draggingTable.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    // Cleanup event listeners on component unmount
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSaveLayout = () => {
    // In a real app, this would send the 'tables' state to a backend API
    console.log("Saving new layout:", tables.map(t => ({id: t.id, x: t.x, y: t.y, floor: t.floor})));
    toast({
        title: "Layout Saved",
        description: "The new table positions have been saved.",
    });
  }

  const handleConfirmGuests = (guests: number) => {
        if (tableForGuestInput) {
            // This is the correct flow: go to the new order page.
            router.push(`/orders/new?tableId=${tableForGuestInput.id}&guests=${guests}`);
        }
        setTableForGuestInput(null);
  }

  return (
    <>
      <PageHeader title="Restaurant Floor Plan">
        <Button onClick={handleSaveLayout} variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Layout
        </Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                     <Tabs defaultValue={floors[0]} className="w-full">
                        <TabsList>
                            {floors.map(floor => (
                                <TabsTrigger key={floor} value={floor}>{floor}</TabsTrigger>
                            ))}
                        </TabsList>
                        {floors.map(floor => (
                            <TabsContent key={floor} value={floor} className="pt-4">
                               <div 
                                    ref={floorPlanRef}
                                    className="relative h-[600px] w-full bg-cover bg-center rounded-md border"
                                    style={{ backgroundImage: `url(${floorPlanBackgrounds[floor]?.url ?? ''})` }}
                                    data-ai-hint={floorPlanBackgrounds[floor]?.hint ?? ''}
                                >
                                    {tables.filter(t => t.floor === floor).map((table) => (
                                        <TableVisual 
                                            key={table.id} 
                                            table={table} 
                                            isSelected={selectedTableId === table.id}
                                            onMouseDown={(e) => {
                                                e.stopPropagation();
                                                handleMouseDown(e, table.id);
                                            }}
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardHeader>
            </Card>
        </div>
        <div className="md:col-span-1">
            <OrderPanel selectedTable={selectedTable} />
        </div>
        <GuestsDialog 
            table={tableForGuestInput}
            onConfirm={handleConfirmGuests}
        />
      </main>
    </>
  );
}

    

    