

'use client'

import { notFound, useRouter, useSearchParams, useParams } from 'next/navigation';
import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockOrders, mockMenu, getOrderByTableId as getOrderData, mockTables, setUserRole, mockUser } from '@/lib/data';
import type { OrderItem, MenuItem, Addon, UserRole, Table as TableType, Order, PaymentMethod } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CreditCard, HandCoins, MinusCircle, PlusCircle, Printer, Sparkles, Tag, Users, X, ShoppingCart, PercentCircle } from 'lucide-react';
import { useState, use, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import withAuth from '@/components/withAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';


const getOrderById = (id: number): Order | undefined => {
    if (isNaN(id)) return undefined;
    const order = getOrderData(id);
    if(order) return order;
    return mockOrders.find(o => o.id === id);
}

function AddItemDialog({ onAddItem, orderId, triggerElement }: { onAddItem: (item: OrderItem) => void; orderId: number, triggerElement: MenuItem | null }) {
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);

  const selectedItem = triggerElement;

  // Effect to open the dialog when an item is selected
  useEffect(() => {
    if(triggerElement) {
      setOpen(true);
    }
  }, [triggerElement]);
  
  // When dialog closes, reset state
  const handleOpenChange = (isOpen: boolean) => {
    if(!isOpen) {
      setSelectedAddons([]);
      setNotes('');
    }
    setOpen(isOpen);
  }

  const handleSelectAddon = (addon: Addon) => {
    setSelectedAddons(prev =>
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };
  
  const handleAddItem = () => {
    if (selectedItem) {
      onAddItem({
        menuItem: selectedItem,
        quantity: 1,
        selectedAddons,
        notes,
      });
      handleOpenChange(false);
    }
  };

  if(!selectedItem) return null;

  // This dialog is now controlled by the parent component's state
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedItem.name}</DialogTitle>
          <DialogDescription>{selectedItem.description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {selectedItem?.addons && selectedItem.addons.length > 0 && (
            <div className="grid gap-2">
              <Label>Add-ons</Label>
              <div className='space-y-2'>
                {selectedItem.addons.map(addon => (
                  <div key={addon.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`addon-${addon.id}`}
                      onCheckedChange={() => handleSelectAddon(addon)}
                    />
                    <Label htmlFor={`addon-${addon.id}`} className="font-normal flex-grow">
                      {addon.name} (+£{addon.price.toFixed(2)})
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="e.g. extra spicy, no onions" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddItem}>Add to Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderItemsTable({ items, onUpdateItems, onSendOrder, isExistingOrder, discountAmount }: { items: OrderItem[], onUpdateItems: (items: OrderItem[]) => void, onSendOrder: () => void, isExistingOrder?: boolean, discountAmount: number }) {
  const subtotal = items.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
    return sum + (item.menuItem.price + addonsTotal) * item.quantity;
  }, 0);

  const grandTotal = subtotal - discountAmount;

  const handleQuantityChange = (index: number, newQuantity: number) => {
      const updatedItems = [...items];
      if(newQuantity > 0) {
          updatedItems[index].quantity = newQuantity;
      } else {
          updatedItems.splice(index, 1);
      }
      onUpdateItems(updatedItems);
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Order Items</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item.menuItem.name}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {item.selectedAddons.map(addon => `+ ${addon.name}`).join(', ')}
                      </div>
                    )}
                    {item.notes && <p className="text-xs text-muted-foreground">Note: {item.notes}</p>}
                  </TableCell>
                  <TableCell className="text-center">
                      <div className='flex items-center justify-center gap-2'>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(index, item.quantity - 1)}><MinusCircle className="h-4 w-4" /></Button>
                          <span>{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleQuantityChange(index, item.quantity + 1)}><PlusCircle className="h-4 w-4" /></Button>
                      </div>
                  </TableCell>
                  <TableCell className="text-right">£{((item.menuItem.price + (item.selectedAddons?.reduce((acc, a) => acc + a.price, 0) || 0)) * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
           <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                <ShoppingCart className="w-16 h-16 mb-4" />
                <p className="font-semibold">Start adding products</p>
                <p className="text-sm">Select items from the left to build the order.</p>
            </div>
        )}
      </CardContent>
       {items.length > 0 && (
        <CardFooter className="flex-col !items-stretch gap-4 !p-4 border-t">
            <div className="flex justify-between w-full text-sm">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
                <div className="flex justify-between w-full text-sm text-destructive">
                    <span>Discount</span>
                    <span>- £{discountAmount.toFixed(2)}</span>
                </div>
            )}
            <div className="flex justify-between font-bold text-lg">
                <span>Grand Total</span>
                <span>£{grandTotal.toFixed(2)}</span>
            </div>
            <Button onClick={onSendOrder} disabled={items.length === 0} size="lg">
                {isExistingOrder ? 'Update Order' : 'Send Order'}
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}

function BillSplittingDialog({ items }: { items: OrderItem[] }) {
    const [splitItems, setSplitItems] = useState<Record<number, OrderItem[]>>({ 1: [], 2: [] });
    const [selectedBill, setSelectedBill] = useState<number>(1);

    const unassignedItems = items.filter(
        item => ![...splitItems[1], ...splitItems[2]].some(splitItem => splitItem.menuItem.id === item.menuItem.id)
    );

    const handleAssignItem = (item: OrderItem, billNumber: number) => {
        setSplitItems(prev => ({
            ...prev,
            [billNumber]: [...prev[billNumber], item]
        }));
    };

    const handleUnassignItem = (item: OrderItem, billNumber: number) => {
        setSplitItems(prev => ({
            ...prev,
            [billNumber]: prev[billNumber].filter(i => i.menuItem.id !== item.menuItem.id)
        }));
    };

    const calculateBillTotal = (billItems: OrderItem[]) => {
        const subtotal = billItems.reduce((sum, item) => {
            const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
            return sum + (item.menuItem.price + addonsTotal) * item.quantity;
        }, 0);
        return subtotal;
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary" disabled={items.length === 0}><Users className="mr-2" /> Split Bill</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Split the Bill</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="col-span-1">
                        <h3 className="font-semibold mb-2">Unassigned Items</h3>
                        <div className="space-y-2 rounded-md border p-2 h-96 overflow-y-auto">
                            {unassignedItems.map((item, idx) => (
                                <div key={idx} className="p-2 border rounded-md text-sm">
                                    <p>{item.menuItem.name} (x{item.quantity})</p>
                                    <div className="flex gap-2 mt-1">
                                        <Button size="sm" variant="outline" onClick={() => handleAssignItem(item, 1)}>Bill 1</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleAssignItem(item, 2)}>Bill 2</Button>
                                    </div>
                                </div>
                            ))}
                            {unassignedItems.length === 0 && <p className="text-muted-foreground text-sm p-4 text-center">All items assigned.</p>}
                        </div>
                    </div>
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                        {[1, 2].map(billNumber => (
                            <div key={billNumber}>
                                <h3 className="font-semibold mb-2">Bill {billNumber}</h3>
                                <div className="space-y-2 rounded-md border p-2 h-96 overflow-y-auto">
                                    {splitItems[billNumber].map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 border rounded-md text-sm">
                                            <span>{item.menuItem.name} (x{item.quantity})</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleUnassignItem(item, billNumber)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <div className="font-bold text-right pr-2 pt-2 border-t">
                                        Total: £{calculateBillTotal(splitItems[billNumber]).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={() => {
                        // In a real app, this would perform some action.
                        console.log('Bills split:', splitItems);
                    }}>Confirm Split</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TableTransferDialog({ orderId, currentTableId }: { orderId: number, currentTableId: number }) {
    const [targetTableId, setTargetTableId] = useState<number | null>(null);
    const router = useRouter();

    const availableTables = mockTables.filter(t => t.status === 'Available' && t.id !== currentTableId);

    const handleTransfer = () => {
        if (!targetTableId) return;

        // Find original table and set to available
        const oldTableIndex = mockTables.findIndex(t => t.id === currentTableId);
        if (oldTableIndex !== -1) {
            mockTables[oldTableIndex].status = 'Available';
            delete mockTables[oldTableIndex].orderId;
        }

        // Find new table and set to occupied
        const newTableIndex = mockTables.findIndex(t => t.id === targetTableId);
        if (newTableIndex !== -1) {
            mockTables[newTableIndex].status = 'Occupied';
            mockTables[newTableIndex].orderId = orderId;
        }

        // Update the order with the new tableId
        const orderIndex = mockOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            mockOrders[orderIndex].tableId = targetTableId;
        }
        
        router.push(`/dashboard`);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="secondary">Transfer Table</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transfer Table for Order #{orderId}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p>Current Table: <span className="font-bold">{currentTableId}</span></p>
                    <div>
                        <Label htmlFor="target-table">Select New Table</Label>
                        <Select onValueChange={(value) => setTargetTableId(parseInt(value))}>
                            <SelectTrigger id="target-table">
                                <SelectValue placeholder="Choose an available table" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableTables.map(table => (
                                    <SelectItem key={table.id} value={table.id.toString()}>
                                        Table {table.id} (Capacity: {table.capacity})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                     <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleTransfer} disabled={!targetTableId}>Confirm Transfer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function PaymentDialog({ order, onSuccessfulPayment, discountAmount }: { order: Order; onSuccessfulPayment: (paymentMethod: PaymentMethod, discountApplied: number) => void; discountAmount: number; }) {
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    const subtotal = order.items.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
        const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
        return sum + itemTotal;
    }, 0);

    const grandTotal = subtotal - discountAmount;

    const handlePayment = () => {
        if (paymentMethod) {
            onSuccessfulPayment(paymentMethod as PaymentMethod, discountAmount);
        }
    }

    const paymentOptions = [
        { id: 'Cash', name: 'Cash', icon: HandCoins },
        { id: 'Card', name: 'Card', icon: CreditCard },
        { id: 'Voucher', name: 'Voucher', icon: Tag },
    ]

    return (
        <Dialog>
            <DialogTrigger asChild>
                 <Button className="bg-green-600 text-white hover:bg-green-700 w-full"><Sparkles className="mr-2" /> Finalize Bill</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Finalize Payment</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <div className="space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span> <span>£{subtotal.toFixed(2)}</span></div>
                        {discountAmount > 0 && <div className="flex justify-between text-destructive"><span>Discount</span> <span>- £{discountAmount.toFixed(2)}</span></div>}
                        <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total to Pay</span> <span>£{grandTotal.toFixed(2)}</span></div>
                    </div>
                    
                    <Separator />
                    
                    <Label>Select Payment Method</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        {paymentOptions.map(opt => (
                            <Button
                                key={opt.id}
                                variant={paymentMethod === opt.id ? 'default' : 'outline'}
                                onClick={() => setPaymentMethod(opt.id)}
                                className="flex flex-col h-24"
                            >
                                <opt.icon className="h-8 w-8 mb-2"/>
                                {opt.name}
                            </Button>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handlePayment} disabled={!paymentMethod}>Process Payment ( £{grandTotal.toFixed(2)} )</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CancelOrderDialog({ orderId, onCancel }: { orderId: number, onCancel: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border border-red-500/20 w-full">Cancel Order</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently cancel order #{orderId} and all of its data.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Back</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel} className="bg-destructive hover:bg-destructive/90">Yes, Cancel Order</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function MenuGrid({ onSelectItem }: { onSelectItem: (item: MenuItem) => void }) {
    const categories = [...new Set(mockMenu.map(item => item.category))];

    return (
        <Card className="h-full">
            <CardContent className="p-2 h-full">
                <Tabs defaultValue={categories[0]} className="w-full h-full flex flex-col">
                    <TabsList className="shrink-0">
                        {categories.map(category => (
                            <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex-1 overflow-y-auto mt-2">
                        {categories.map(category => (
                            <TabsContent key={category} value={category} className="mt-0">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                    {mockMenu
                                        .filter(item => item.category === category)
                                        .map(item => (
                                            <Button 
                                                key={item.id} 
                                                variant="outline" 
                                                className="h-20 flex flex-col justify-center items-center text-center p-2"
                                                onClick={() => onSelectItem(item)}
                                            >
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <span className="text-xs text-muted-foreground">£{item.price.toFixed(2)}</span>
                                            </Button>
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    )
}

function NewOrderPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const tableIdParam = searchParams.get('tableId');
    const guestsParam = searchParams.get('guests');

    if (!tableIdParam || !guestsParam) {
        // Handle case where params are missing, maybe redirect or show an error
        return <div>Error: Missing table or guest information.</div>;
    }
    
    const tableId = parseInt(tableIdParam, 10);
    const guests = parseInt(guestsParam, 10);
    
    const [order, setOrder] = useState<Omit<Order, 'id' | 'status'>>({
        tableId: tableId,
        items: [],
        type: 'Table',
        createdAt: new Date().toISOString(),
        guests: guests,
    });
    
    // State to manage which menu item is being customized in the dialog
    const [itemToCustomize, setItemToCustomize] = useState<MenuItem | null>(null);

    const handleUpdateItems = (newItems: OrderItem[]) => {
      setOrder(prev => ({...prev, items: newItems}));
    }

    const handleAddItem = (item: OrderItem) => {
        const existingItemIndex = order.items.findIndex(
            i => i.menuItem.id === item.menuItem.id && JSON.stringify(i.selectedAddons) === JSON.stringify(item.selectedAddons) && i.notes === item.notes
        );

        if (existingItemIndex > -1) {
            const updatedItems = [...order.items];
            updatedItems[existingItemIndex].quantity += 1;
            handleUpdateItems(updatedItems);
        } else {
            handleUpdateItems([...order.items, item]);
        }
        setItemToCustomize(null); // Close dialog
    };

    const handleSendOrder = () => {
        // In a real app, this would be a server action to create the order
        const newOrderId = Math.floor(Math.random() * 1000) + 200; // Mock ID
        mockOrders.push({ ...order, id: newOrderId, status: 'Pending' });
        // Update table status
        const tableIndex = mockTables.findIndex(t => t.id === tableId);
        if (tableIndex !== -1) {
            mockTables[tableIndex].status = 'Occupied';
            mockTables[tableIndex].orderId = newOrderId;
        }
        router.push(`/dashboard`);
    }

    const handleSelectItem = (item: MenuItem) => {
        if(item.addons && item.addons.length > 0) {
            setItemToCustomize(item);
        } else {
            // If no addons, add directly to order
            handleAddItem({ menuItem: item, quantity: 1, selectedAddons: [], notes: '' });
        }
    };

    return (
        <>
            <PageHeader title={`New Order - Table ${tableId} (Guests: ${guests})`} />
            <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
                <div className="md:col-span-2 h-full">
                    <MenuGrid onSelectItem={handleSelectItem} />
                </div>
                <div className="md:col-span-1 h-full">
                    <OrderItemsTable items={order.items} onUpdateItems={handleUpdateItems} onSendOrder={handleSendOrder} discountAmount={0} />
                </div>
                 {itemToCustomize && (
                    <AddItemDialog
                        onAddItem={handleAddItem}
                        orderId={0} // New order doesn't have an ID yet
                        triggerElement={itemToCustomize}
                    />
                 )}
            </main>
        </>
    );
}


function ExistingOrderPage({ order: initialOrder }: { order: Order }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order>(initialOrder);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [itemToCustomize, setItemToCustomize] = useState<MenuItem | null>(null);
  const [discountSettings, setDiscountSettings] = useState({ enabled: true, type: 'amount' as 'percentage' | 'amount' });
  const [appliedDiscount, setAppliedDiscount] = useState(initialOrder.discount || 0);
  const [customDiscount, setCustomDiscount] = useState<number | string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            setCurrentUserRole(JSON.parse(storedUser).role);
        }
        const savedSettings = localStorage.getItem('discountSettings');
        if (savedSettings) {
            setDiscountSettings(JSON.parse(savedSettings));
        }
    }
  }, []);
  
  const canApplyDiscount = currentUserRole && ['Admin', 'Advanced'].includes(currentUserRole);

  const handleUpdateItems = (newItems: OrderItem[]) => {
      setOrder(prev => ({...prev, items: newItems}));
  }

  const subtotal = order.items.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
    const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
    return sum + itemTotal;
  }, 0);

  const handleApplyDiscount = () => {
    const value = typeof customDiscount === 'string' ? parseFloat(customDiscount) : customDiscount;
    if (isNaN(value) || value < 0) {
        setAppliedDiscount(0);
        return;
    }

    if (discountSettings.type === 'percentage') {
        const discount = (subtotal * value) / 100;
        setAppliedDiscount(discount > subtotal ? subtotal : discount);
    } else {
        setAppliedDiscount(value > subtotal ? subtotal : value);
    }
  }

  const handleAddItem = (item: OrderItem) => {
    const existingItemIndex = order.items.findIndex(
        i => i.menuItem.id === item.menuItem.id && JSON.stringify(i.selectedAddons) === JSON.stringify(item.selectedAddons) && i.notes === item.notes
    );

    if (existingItemIndex > -1) {
        const updatedItems = [...order.items];
        updatedItems[existingItemIndex].quantity += 1;
        handleUpdateItems(updatedItems);
    } else {
        handleUpdateItems([...order.items, item]);
    }
    setItemToCustomize(null); // Close dialog
  };

  const handleSelectItem = (item: MenuItem) => {
    if(item.addons && item.addons.length > 0) {
        setItemToCustomize(item);
    } else {
        // If no addons, add directly to order
        handleAddItem({ menuItem: item, quantity: 1, selectedAddons: [], notes: '' });
    }
  };

  const handlePrint = () => {
    const tableIndex = mockTables.findIndex(t => t.id === order.tableId);
    if (tableIndex > -1) {
        mockTables[tableIndex].status = 'Billed';
    }
    router.push('/dashboard');
  }
  
  const handleCancelOrder = () => {
    // In a real app, this would be a server action to update the order status
    console.log(`Cancelling order #${order.id}`);
    router.push('/dashboard');
  }

  const handleUpdateOrder = () => {
        // In a real app, this would be a server action to update the order
        console.log("Updating order:", order);
        const orderIndex = mockOrders.findIndex(o => o.id === order.id);
        if (orderIndex > -1) {
            mockOrders[orderIndex] = order;
        }
        router.push(`/dashboard`);
    }

  const handleSuccessfulPayment = (paymentMethod: PaymentMethod, discountApplied: number) => {
    // Update order status
    const orderIndex = mockOrders.findIndex(o => o.id === order.id);
    if(orderIndex !== -1) {
        mockOrders[orderIndex].status = 'Paid';
        mockOrders[orderIndex].paymentMethod = paymentMethod;
        mockOrders[orderIndex].discount = discountApplied;
    }

    // Update table status
    const tableIndex = mockTables.findIndex(t => t.id === order.tableId);
    if(tableIndex !== -1) {
        mockTables[tableIndex].status = 'Available';
        delete mockTables[tableIndex].orderId;
    }

    router.push('/dashboard');
  }

  return (
    <>
      <PageHeader title={`Order #${order.id} - Table ${order.tableId}`}>
        <Button variant="outline" onClick={handlePrint}><Printer className="mr-2" /> Print Order</Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8 h-[calc(100vh-120px)]">
        <div className="md:col-span-2 h-full">
            <MenuGrid onSelectItem={handleSelectItem} />
        </div>
        <div className="md:col-span-1 h-full flex flex-col gap-8">
            <div className="flex-1">
                <OrderItemsTable items={order.items} onUpdateItems={handleUpdateItems} onSendOrder={handleUpdateOrder} isExistingOrder={true} discountAmount={appliedDiscount} />
            </div>
            <Card>
                <CardHeader>
                <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {discountSettings.enabled && canApplyDiscount && (
                        <div className="space-y-3 pt-4 border-t">
                             <h4 className="text-sm font-medium">Apply Discount</h4>
                             <div className="flex gap-2">
                                <Input 
                                    type="number"
                                    placeholder={discountSettings.type === 'percentage' ? 'Custom %' : 'Custom £'}
                                    value={customDiscount}
                                    onChange={(e) => setCustomDiscount(e.target.value)}
                                />
                                <Button variant="secondary" onClick={handleApplyDiscount}>Apply</Button>
                                 <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => { setAppliedDiscount(0); setCustomDiscount(''); }}>
                                    <X className="h-4 w-4"/>
                                 </Button>
                             </div>
                        </div>
                    )}
                    <div className="flex flex-col gap-2 pt-4 border-t">
                        <BillSplittingDialog items={order.items} />
                        {canApplyDiscount && <TableTransferDialog orderId={order.id} currentTableId={order.tableId} />}
                        {canApplyDiscount && <CancelOrderDialog orderId={order.id} onCancel={handleCancelOrder} />}
                    </div>
                    <div className="pt-4 border-t">
                         <PaymentDialog order={order} onSuccessfulPayment={handleSuccessfulPayment} discountAmount={appliedDiscount} />
                    </div>
                </CardContent>
            </Card>
        </div>
        
         {itemToCustomize && (
            <AddItemDialog
                onAddItem={handleAddItem}
                orderId={order.id}
                triggerElement={itemToCustomize}
            />
          )}
      </main>
    </>
  );
}


function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  if (id === 'new') {
    return <NewOrderPage />;
  }
  
  const order = getOrderById(parseInt(id, 10));

  if (!order) {
    notFound();
  }

  return <ExistingOrderPage order={order} />;
}


// Wrapping with withAuth HOC and specifying required roles
export default withAuth(OrderDetailsPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
