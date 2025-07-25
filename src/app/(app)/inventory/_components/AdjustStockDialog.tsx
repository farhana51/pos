
'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/lib/types";

interface AdjustStockDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  item: InventoryItem | null;
  type: 'Restock' | 'Use';
  onAdjust: (itemId: number, amount: number) => void;
}

export function AdjustStockDialog({ isOpen, setIsOpen, item, type, onAdjust }: AdjustStockDialogProps) {
    const [amount, setAmount] = useState<number | string>("");

    useEffect(() => {
        if (!isOpen) {
            setAmount("");
        }
    }, [isOpen]);

    const handleSave = () => {
        const adjustmentAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (item && !isNaN(adjustmentAmount) && adjustmentAmount > 0) {
            onAdjust(item.id, adjustmentAmount);
            setIsOpen(false);
        }
    }

    if (!item) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{type} Stock: {item.name}</DialogTitle>
                    <DialogDescription>
                        Current stock: {item.stock} {item.unit}. Enter the amount to {type.toLowerCase()}.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="adjustment-amount">Amount ({item.unit})</Label>
                        <Input 
                            id="adjustment-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 5"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={!amount || Number(amount) <= 0}>
                        {type} Stock
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
