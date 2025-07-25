
'use client'

import { notFound, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockOrders, mockMenu, getOrderByTableId as getOrderData, mockTables, setUserRole, mockUser } from '@/lib/data';
import type { OrderItem, MenuItem, Addon, UserRole, Table as TableType } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { CreditCard, HandCoins, MinusCircle, PlusCircle, Printer, Sparkles, Tag, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import withAuth from '@/components/withAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const getOrderById = (id: number) => {
    const order = getOrderData(id);
    if(order) return order;
    return mockOrders.find(o => o.id === id);
}

function AddItemDialog({ onAddItem, orderId }: { onAddItem: (item: OrderItem) => void; orderId: number }) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [notes, setNotes] = useState('');
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

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
      toast({
          title: "Item Added",
          description: `${selectedItem.name} has been added to the order.`,
      })
      setSelectedItem(null);
      setSelectedAddons([]);
      setNotes('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2" /> Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Item to Order #{orderId}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Select Item</Label>
            <Select onValueChange={(value) => setSelectedItem(mockMenu.find(item => item.id === parseInt(value)) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a menu item" />
              </SelectTrigger>
              <SelectContent>
                {mockMenu.map(item => (
                  <SelectItem key={item.id} value={item.id.toString()}>{item.name} - £{item.price.toFixed(2)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
          <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
          <Button onClick={handleAddItem} disabled={!selectedItem}>Add to Order</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function OrderItemsTable({ items, onUpdateItems }: { items: OrderItem[], onUpdateItems: (items: OrderItem[]) => void }) {
  const subtotal = items.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
    return sum + (item.menuItem.price + addonsTotal) * item.quantity;
  }, 0);

  const totalVat = items.reduce((sum, item) => {
      const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
      const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
      if (item.menuItem.vatRate > 0) {
          return sum + (itemTotal * (item.menuItem.vatRate / 100));
      }
      return sum;
  }, 0);

  const grandTotal = subtotal + totalVat;

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
    <Card>
      <CardHeader>
        <CardTitle>Order Items</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Price</TableHead>
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
                      {item.selectedAddons.map(addon => `+ ${addon.name} (£${addon.price.toFixed(2)})`).join(', ')}
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
                <TableCell className="text-right">£{(item.menuItem.price + (item.selectedAddons?.reduce((acc, a) => acc + a.price, 0) || 0)).toFixed(2)}</TableCell>
                <TableCell className="text-right">£{((item.menuItem.price + (item.selectedAddons?.reduce((acc, a) => acc + a.price, 0) || 0)) * item.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={3}>Subtotal</TableCell>
              <TableCell className="text-right">£{subtotal.toFixed(2)}</TableCell>
            </TableRow>
             <TableRow className="font-semibold bg-muted/30">
              <TableCell colSpan={3}>VAT ({items.find(i => i.menuItem.vatRate > 0)?.menuItem.vatRate || 0}%)</TableCell>
              <TableCell className="text-right">£{totalVat.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow className="font-bold text-lg bg-muted/50">
              <TableCell colSpan={3}>Grand Total</TableCell>
              <TableCell className="text-right">£{grandTotal.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function BillSplittingDialog({ items }: { items: OrderItem[] }) {
    const [splitItems, setSplitItems] = useState<Record<number, OrderItem[]>>({ 1: [], 2: [] });
    const [selectedBill, setSelectedBill] = useState<number>(1);
    const { toast } = useToast();

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
        const vat = billItems.reduce((sum, item) => {
             const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
            const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
            if (item.menuItem.vatRate > 0) {
                return sum + (itemTotal * (item.menuItem.vatRate / 100));
            }
            return sum;
        }, 0);
        return subtotal + vat;
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
                    <Button onClick={() => toast({ title: "Bills Split", description: "The bill has been successfully split into two."})}>Confirm Split</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function TableTransferDialog({ orderId, currentTableId }: { orderId: number, currentTableId: number }) {
    const [targetTableId, setTargetTableId] = useState<number | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    const availableTables = mockTables.filter(t => t.status === 'Available' && t.id !== currentTableId);

    const handleTransfer = () => {
        if (targetTableId) {
            // In a real app, this would be a server action
            console.log(`Transferring Order ${orderId} from Table ${currentTableId} to Table ${targetTableId}`);
            toast({
                title: "Table Transferred",
                description: `Order #${orderId} has been moved to Table ${targetTableId}.`
            });
            // Simulate navigation or data refresh
            router.push(`/dashboard`);
        }
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

function PaymentDialog({ total }: { total: number }) {
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const handlePayment = () => {
        if (paymentMethod) {
            toast({
                title: "Payment Successful",
                description: `Paid £${total.toFixed(2)} via ${paymentMethod}.`,
            });
            router.push('/dashboard');
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
                 <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Sparkles className="mr-2" /> Finalize Bill</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Finalize Payment</DialogTitle>
                    <DialogDescription>Total amount to be paid: <span className="font-bold text-foreground">£{total.toFixed(2)}</span></DialogDescription>
                </DialogHeader>
                <div className="py-4">
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
                    <Button onClick={handlePayment} disabled={!paymentMethod}>Process Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function CancelOrderDialog({ orderId, onCancel }: { orderId: number, onCancel: () => void }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/20">Cancel Order</Button>
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

function OrderDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState(() => {
    const orderId = parseInt(params.id, 10);
    return getOrderById(orderId);
  });
  const hasAdvancedPermission = ['Admin', 'Advanced'].includes(mockUser.role);

  if (!order) {
    notFound();
  }
  
  const handleUpdateItems = (newItems: OrderItem[]) => {
      setOrder(prev => prev ? {...prev, items: newItems} : null);
  }

  const handlePrint = () => {
    toast({
      title: "Printing...",
      description: "Sending order to the kitchen printer.",
    });
  }
  
  const handleCancelOrder = () => {
    // In a real app, this would be a server action to update the order status
    console.log(`Cancelling order #${order.id}`);
    toast({
      variant: "destructive",
      title: "Order Cancelled",
      description: `Order #${order.id} has been cancelled.`,
    });
    router.push('/dashboard');
  }

 const subtotal = order.items.reduce((sum, item) => {
    const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
    return sum + (item.menuItem.price + addonsTotal) * item.quantity;
  }, 0);

  const totalVat = order.items.reduce((sum, item) => {
      const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
      const itemTotal = (item.menuItem.price + addonsTotal) * item.quantity;
      if (item.menuItem.vatRate > 0) {
          return sum + (itemTotal * (item.menuItem.vatRate / 100));
      }
      return sum;
  }, 0);

  const grandTotal = subtotal + totalVat;


  return (
    <>
      <PageHeader title={`Order #${order.id} - Table ${order.tableId}`}>
        <Button variant="outline" onClick={handlePrint}><Printer className="mr-2" /> Print Order</Button>
        <PaymentDialog total={grandTotal} />
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <OrderItemsTable items={order.items} onUpdateItems={handleUpdateItems} />
           <Card>
              <CardHeader>
                <CardTitle>Modify Order</CardTitle>
                <CardDescription>Add new items to this order.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <AddItemDialog onAddItem={(item) => handleUpdateItems([...order.items, item])} orderId={order.id} />
              </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Table:</span><span className="font-medium">{order.tableId}</span></div>
              <div className="flex justify-between"><span>Type:</span><Badge variant="secondary">{order.type}</Badge></div>
              <div className="flex justify-between"><span>Time:</span><span className="font-medium">{format(new Date(order.createdAt), 'HH:mm')}</span></div>
              <div className="flex justify-between"><span>Date:</span><span className="font-medium">{format(new Date(order.createdAt), 'dd/MM/yyyy')}</span></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <BillSplittingDialog items={order.items} />
                {hasAdvancedPermission && <TableTransferDialog orderId={order.id} currentTableId={order.tableId} />}
                {hasAdvancedPermission && <CancelOrderDialog orderId={order.id} onCancel={handleCancelOrder} />}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

// Wrapping with withAuth HOC and specifying required roles
export default withAuth(OrderDetailsPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
