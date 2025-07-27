

'use client'

import Link from "next/link";
import React, { useState, useEffect, useRef } from 'react';
import { Users, Armchair, Circle, Utensils, Square, Minus, Plus, Save, UserPlus, Trash2, PlusCircle, FilePlus2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { mockTables as initialMockTables, getOrderByTableId } from "@/lib/data";
import type { Table, TableStatus, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";


const statusConfig: Record<TableStatus, { border: string; bg: string; label: string; }> = {
  Available: { border: "border-green-500", bg: "bg-green-500/10", label: "Available" },
  Occupied: { border: "border-amber-500", bg: "bg-amber-500/10", label: "Occupied" },
  Billed: { border: "border-red-500", bg: "bg-red-500/10", label: "Billed" },
  Reserved: { border: "border-purple-500", bg: "bg-purple-500/10", label: "Reserved" },
  Dirty: { border: "border-yellow-500", bg: "bg-yellow-500/10", label: "Needs Cleaning" },
};

function TableVisual({ table, isSelected, onMouseDown, canMove }: { table: Table; isSelected: boolean; onMouseDown: (e: React.MouseEvent<HTMLDivElement>, tableId: number) => void, canMove: boolean }) {
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
        "absolute transition-transform duration-200 hover:scale-110",
        canMove ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
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


function OrderPanel({ selectedTable, canMove, onRemoveTable }: { selectedTable: Table | null, canMove: boolean, onRemoveTable: (tableId: number) => void }) {
    if (!selectedTable) return null;

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
                    <span>{selectedTable ? `Table ${selectedTable.id}` : ''}</span>
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
             <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" asChild disabled={!selectedTable}>
                   <Link href={selectedTable?.status === 'Occupied' || (selectedTable?.status === 'Billed' && order) ? `/orders/${order.id}` : (selectedTable?.status === 'Available' ? `/orders/new?tableId=${selectedTable.id}` : '#')}>
                     {order ? 'View / Edit Order' : 'Create New Order'}
                   </Link>
                </Button>
                {canMove && selectedTable && selectedTable.status === 'Available' && (
                     <Button variant="destructive" className="w-full" onClick={() => onRemoveTable(selectedTable.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Table
                    </Button>
                )}
            </CardFooter>
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

function AddTableDialog({ isOpen, setIsOpen, onAddTable, currentFloor, existingTableIds }: { isOpen: boolean, setIsOpen: (open: boolean) => void, onAddTable: (newTable: Table) => void, currentFloor: string, existingTableIds: number[] }) {
    const [tableNumber, setTableNumber] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [width, setWidth] = useState(20);
    const [height, setHeight] = useState(20);

    const handleAdd = () => {
        const id = parseInt(tableNumber, 10);
        if(!id || existingTableIds.includes(id)) {
            alert("Please enter a unique table number.");
            return;
        }

        const newTable: Table = {
            id,
            capacity,
            status: 'Available',
            x: 50,
            y: 50,
            width,
            height,
            floor: currentFloor as any, // This is okay for the demo
        };
        onAddTable(newTable);
        setTableNumber('');
        setCapacity(4);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Table to {currentFloor}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="table-number">Table Number</Label>
                        <Input id="table-number" type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} placeholder="e.g. 17" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="table-capacity">Capacity</Label>
                        <Input id="table-capacity" type="number" value={capacity} onChange={e => setCapacity(parseInt(e.target.value, 10) || 1)} />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="table-width">Width</Label>
                            <Input id="table-width" type="number" value={width} onChange={e => setWidth(parseInt(e.target.value, 10) || 16)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="table-height">Height</Label>
                            <Input id="table-height" type="number" value={height} onChange={e => setHeight(parseInt(e.target.value, 10) || 16)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleAdd}>Add Table</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ManageFloorsDialog({ isOpen, setIsOpen, floors, onAddFloor, onRemoveFloor }: { isOpen: boolean, setIsOpen: (open: boolean) => void, floors: string[], onAddFloor: (name: string) => void, onRemoveFloor: (name: string) => void }) {
    const [newFloorName, setNewFloorName] = useState('');

    const handleAdd = () => {
        if (newFloorName && !floors.includes(newFloorName)) {
            onAddFloor(newFloorName);
            setNewFloorName('');
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Floors</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div>
                        <h4 className="font-medium mb-2">Existing Floors</h4>
                        <div className="space-y-2">
                            {floors.map(floor => (
                                <div key={floor} className="flex items-center justify-between p-2 bg-muted rounded-md">
                                    <span>{floor}</span>
                                    {floors.length > 1 && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive shrink-0">
                                                <Trash2 />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Floor '{floor}'?</AlertDialogTitle>
                                                <AlertDialogDescription>This will also delete all tables on this floor. This action cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => onRemoveFloor(floor)}>Delete Floor</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-floor">Add New Floor</Label>
                        <div className="flex gap-2">
                            <Input id="new-floor" value={newFloorName} onChange={e => setNewFloorName(e.target.value)} placeholder="e.g., Rooftop" />
                            <Button onClick={handleAdd} disabled={!newFloorName}><PlusCircle className="mr-2"/>Add</Button>
                        </div>
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button>Done</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


const floorPlanBackgrounds: Record<string, {url: string, hint: string}> = {
    "Main Floor": { url: 'https://placehold.co/1200x800.png', hint: 'wood floor' },
    "Patio": { url: 'https://placehold.co/1200x800.png', hint: 'patio tiles' },
}

export default function DashboardPage() {
  const [tables, setTables] = useState<Table[]>(initialMockTables);
  const [floors, setFloors] = useState<string[]>([...new Set(initialMockTables.map(t => t.floor))]);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [currentFloor, setCurrentFloor] = useState<string>(floors[0]);
  const router = useRouter();
  const { toast } = useToast();
  
  const floorPlanRef = useRef<HTMLDivElement>(null);
  const draggingTable = useRef<{ id: number; offsetX: number; offsetY: number } | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);

  // Dialog states
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isManageFloorsOpen, setIsManageFloorsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUserRole(JSON.parse(storedUser).role);
        }
    }
  }, []);

  const canMoveTables = currentUserRole === 'Admin';

  const selectedTable = tables.find(t => t.id === selectedTableId) ?? null;
  const [tableForGuestInput, setTableForGuestInput] = useState<Table | null>(null);

  const handleTableClick = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    setSelectedTableId(tableId);

    if (table.status === 'Available') {
      // For admins, clicking just selects. For others, it starts the order flow.
      if (!canMoveTables) {
        setTableForGuestInput(table);
      }
    } else if (table.status === 'Occupied' || table.status === 'Billed') {
      router.push(`/orders/${table.orderId}`);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, tableId: number) => {
    e.preventDefault();
    setSelectedTableId(tableId);
    
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    // If user is not admin, just handle the click action and return
    if (!canMoveTables) {
      handleTableClick(tableId);
      return;
    }

    // Admin can move tables
    const tableElement = e.currentTarget;
    const rect = tableElement.getBoundingClientRect();
    draggingTable.current = {
      id: tableId,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingTable.current || !floorPlanRef.current) return;
    
    const tableId = draggingTable.current.id;
    const { offsetX, offsetY } = draggingTable.current;
    const floorRect = floorPlanRef.current.getBoundingClientRect();
    
    let newX = e.clientX - floorRect.left - offsetX;
    let newY = e.clientY - floorRect.top - offsetY;

    // Constrain within the floor plan
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    const tableWidth = (table.width ?? 16) * 4;
    const tableHeight = (table.height ?? 16) * 4;

    newX = Math.max(0, Math.min(newX, floorRect.width - tableWidth));
    newY = Math.max(0, Math.min(newY, floorRect.height - tableHeight));

    setTables(prevTables =>
      prevTables.map(t =>
        t.id === tableId ? { ...t, x: newX, y: newY } : t
      )
    );
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (draggingTable.current) {
        // If we were dragging, check if it was just a click without movement
        const draggedTableId = draggingTable.current.id;
        const tableElement = (e.target as HTMLElement).closest('[style*="top"]');
        if (tableElement) {
            const initialX = tables.find(t => t.id === draggedTableId)?.x;
            const initialY = tables.find(t => t.id === draggedTableId)?.y;
            // A small threshold to differentiate a click from a drag
            if (Math.abs(initialX! - parseFloat(tableElement.getAttribute('style')!.split('left: ')[1])) < 5 &&
                Math.abs(initialY! - parseFloat(tableElement.getAttribute('style')!.split('top: ')[1])) < 5) {
                 handleTableClick(draggedTableId);
            }
        }
    }
    draggingTable.current = null;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSaveLayout = () => {
    // In a real app, this would send the 'tables' state to a backend API
     toast({ title: "Layout Saved", description: "The new table positions have been saved." });
  }

  const handleConfirmGuests = (guests: number) => {
        if (tableForGuestInput) {
            router.push(`/orders/new?tableId=${tableForGuestInput.id}&guests=${guests}`);
        }
        setTableForGuestInput(null);
  }

  const handleAddTable = (newTable: Table) => {
      setTables(prev => [...prev, newTable]);
  }

  const handleRemoveTable = (tableId: number) => {
      setTables(prev => prev.filter(t => t.id !== tableId));
      setSelectedTableId(null); // Deselect the table
      toast({ title: "Table Removed", description: `Table #${tableId} has been removed.` });
  }

  const handleAddFloor = (name: string) => {
      setFloors(prev => [...prev, name]);
      setCurrentFloor(name); // Switch to the new floor
      toast({ title: "Floor Added", description: `Floor '${name}' has been created.` });
  }

  const handleRemoveFloor = (name: string) => {
      if (floors.length <= 1) {
          toast({ variant: "destructive", title: "Cannot Remove", description: "You must have at least one floor." });
          return;
      }
      setTables(prev => prev.filter(t => t.floor !== name));
      setFloors(prev => prev.filter(f => f !== name));
      setCurrentFloor(floors.find(f => f !== name) || ''); // Switch to another floor
      toast({ title: "Floor Removed", description: `Floor '${name}' and all its tables have been deleted.` });
  }

  return (
    <>
      <PageHeader title="Restaurant Floor Plan">
        {canMoveTables && (
            <div className="flex gap-2">
                <Button onClick={() => setIsAddTableOpen(true)} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Table
                </Button>
                 <Button onClick={() => setIsManageFloorsOpen(true)} variant="outline">
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Manage Floors
                </Button>
                <Button onClick={handleSaveLayout} variant="outline">
                    <Save className="mr-2 h-4 w-4" />
                    Save Layout
                </Button>
            </div>
        )}
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8 items-start">
        <div className={cn("md:col-span-2", !selectedTable && "md:col-span-3 transition-all duration-300")}>
            <Card>
                <CardHeader>
                     <Tabs value={currentFloor} onValueChange={setCurrentFloor} className="w-full">
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
                                    style={{ backgroundImage: `url(${floorPlanBackgrounds[floor]?.url ?? 'https://placehold.co/1200x800.png'})` }}
                                    data-ai-hint={floorPlanBackgrounds[floor]?.hint ?? 'restaurant floor'}
                                    onClick={(e) => {
                                        if (e.target === floorPlanRef.current) {
                                            setSelectedTableId(null)
                                        }
                                    }}
                                >
                                    {tables.filter(t => t.floor === floor).map((table) => (
                                        <TableVisual 
                                            key={table.id} 
                                            table={table} 
                                            isSelected={selectedTableId === table.id}
                                            canMove={canMoveTables}
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
        {selectedTable && (
            <div className="md:col-span-1">
                <OrderPanel selectedTable={selectedTable} canMove={canMoveTables} onRemoveTable={handleRemoveTable} />
            </div>
        )}
        <GuestsDialog 
            table={tableForGuestInput}
            onConfirm={handleConfirmGuests}
        />
        {canMoveTables && (
            <>
                <AddTableDialog 
                    isOpen={isAddTableOpen} 
                    setIsOpen={setIsAddTableOpen} 
                    onAddTable={handleAddTable}
                    currentFloor={currentFloor}
                    existingTableIds={tables.map(t => t.id)}
                />
                <ManageFloorsDialog 
                    isOpen={isManageFloorsOpen}
                    setIsOpen={setIsManageFloorsOpen}
                    floors={floors}
                    onAddFloor={handleAddFloor}
                    onRemoveFloor={handleRemoveFloor}
                />
            </>
        )}
      </main>
    </>
  );
}
