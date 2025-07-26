
'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Order } from "@/lib/types";
import { format } from "date-fns";
import { Printer } from "lucide-react";

interface OrderReceiptDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    order: Order | null;
}

export function OrderReceiptDialog({ isOpen, setIsOpen, order }: OrderReceiptDialogProps) {
    if (!order) return null;

    const subtotal = order.items.reduce((sum, item) => {
        const addonsTotal = item.selectedAddons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0;
        return sum + (item.menuItem.price + addonsTotal) * item.quantity;
    }, 0);
    const total = subtotal - (order.discount || 0);

    const handlePrint = () => {
        window.print();
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center font-headline text-2xl">Your Receipt</DialogTitle>
                    <DialogDescription className="text-center">Order TIK-{order.id}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4 text-sm">
                    <div className="text-center text-muted-foreground">
                        <p>Gastronomic Edge</p>
                        <p>123 Restaurant Row, Foodville</p>
                        <p>{format(new Date(order.createdAt), 'PPP p')}</p>
                    </div>
                     <div className="space-y-1 border-y py-2">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex">
                                <div className="flex-1">
                                    <p>{item.quantity}x {item.menuItem.name}</p>
                                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                                        <p className="text-xs text-muted-foreground pl-4">
                                            {item.selectedAddons.map(a => `+ ${a.name}`).join(', ')}
                                        </p>
                                    )}
                                </div>
                                <p>£{((item.menuItem.price + (item.selectedAddons?.reduce((acc, a) => acc + a.price, 0) || 0)) * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>£{subtotal.toFixed(2)}</span>
                        </div>
                        {order.discount && order.discount > 0 && (
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Discount</span>
                                <span>-£{order.discount.toFixed(2)}</span>
                            </div>
                        )}
                         <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                            <span>Total</span>
                            <span>£{total.toFixed(2)}</span>
                        </div>
                    </div>
                     {order.paymentMethod && (
                         <div className="text-center pt-2 border-t">
                            <p className="font-semibold">Paid via {order.paymentMethod}</p>
                        </div>
                     )}
                </div>
                <DialogFooter className="sm:justify-between flex-row sm:flex-row-reverse">
                    <Button onClick={handlePrint}><Printer className="mr-2" /> Print</Button>
                    <DialogClose asChild>
                        <Button variant="ghost">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
