import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockOrders, mockMenu } from '@/lib/data';
import type { OrderItem } from '@/lib/types';
import { format } from 'date-fns';
import { UpsellRecommender } from '@/components/ai/UpsellRecommender';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { PlusCircle } from 'lucide-react';

const getOrderById = (id: number) => mockOrders.find(o => o.id === id);

function OrderItemsTable({ items }: { items: OrderItem[] }) {
  const total = items.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);

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
                      {item.selectedAddons.map(addon => `+ ${addon.name}`).join(', ')}
                    </div>
                  )}
                  {item.notes && <p className="text-xs text-muted-foreground">Note: {item.notes}</p>}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">£{item.menuItem.price.toFixed(2)}</TableCell>
                <TableCell className="text-right">£{(item.menuItem.price * item.quantity).toFixed(2)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold bg-muted/50">
              <TableCell colSpan={3}>Subtotal</TableCell>
              <TableCell className="text-right">£{total.toFixed(2)}</TableCell>
            </TableRow>
             <TableRow className="font-bold">
              <TableCell colSpan={3}>Total (inc. VAT)</TableCell>
              <TableCell className="text-right">£{(total * 1.2).toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const orderId = parseInt(params.id, 10);
  const order = getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <>
      <PageHeader title={`Order #${order.id} - Table ${order.tableId}`}>
        <Button variant="outline">Print Order</Button>
        <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Finalize Bill</Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <OrderItemsTable items={order.items} />
           <Card>
              <CardHeader>
                <CardTitle>Add to Order</CardTitle>
                <CardDescription>Quickly add popular items to this order.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {mockMenu.slice(0,5).map(item => (
                   <Button variant="outline" key={item.id} className="flex items-center gap-2">
                     <PlusCircle className="h-4 w-4"/>
                     {item.name}
                   </Button>
                ))}
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
          
          <UpsellRecommender items={order.items} />

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button variant="secondary">Split Bill</Button>
                <Button variant="secondary">Transfer Table</Button>
                <Button variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/30 border border-destructive/20">Cancel Order</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
