
'use client'

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockInventory } from "@/lib/data";
import withAuth from "@/components/withAuth";
import { InventoryItem, UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { PackageMinus, PackagePlus, PlusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { InventoryItemDialog } from "./_components/InventoryItemDialog";
import { AdjustStockDialog } from "./_components/AdjustStockDialog";


function StockLevelIndicator({ level, lowThreshold, idealThreshold }: { level: number, lowThreshold: number, idealThreshold: number }) {
    const max = idealThreshold * 1.5; // for visualization purposes
    const percentage = Math.min((level / max) * 100, 100);
    
    let colorClass = "bg-green-500";
    let statusLabel = "High";
    if (level < lowThreshold) {
        colorClass = "bg-red-500";
        statusLabel = "Low";
    } else if (level < idealThreshold) {
        colorClass = "bg-yellow-500";
        statusLabel = "Medium";
    }

    return (
        <div className="flex items-center gap-4">
            <div className="w-2/3">
                 <Progress value={percentage} indicatorClassName={colorClass} />
            </div>
            <Badge variant={level < lowThreshold ? 'destructive' : 'outline'}>{statusLabel}</Badge>
        </div>
    )
}


function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false);
    const [adjustType, setAdjustType] = useState<'Restock' | 'Use'>('Restock');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

    const handleOpenAdjustDialog = (item: InventoryItem, type: 'Restock' | 'Use') => {
        setSelectedItem(item);
        setAdjustType(type);
        setIsAdjustDialogOpen(true);
    };

    const handleSaveItem = (item: Omit<InventoryItem, 'id'>) => {
         const newItem = { 
            ...item, 
            id: Math.max(0, ...inventory.map(i => i.id)) + 1,
        };
        setInventory(prev => [...prev, newItem].sort((a,b) => a.name.localeCompare(b.name)));
    };

    const handleAdjustStock = (itemId: number, amount: number) => {
        setInventory(prev => prev.map(item => {
            if (item.id === itemId) {
                const newStock = adjustType === 'Restock' 
                    ? item.stock + amount 
                    : Math.max(0, item.stock - amount);
                return { ...item, stock: newStock };
            }
            return item;
        }));
    };

    return (
        <>
            <PageHeader title="Inventory Management">
                 <Button onClick={() => setIsAddDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </PageHeader>
            <main className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Stock Levels</CardTitle>
                        <CardDescription>Monitor and manage ingredient and supply stock.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead>Current Stock</TableHead>
                                    <TableHead>Unit</TableHead>
                                    <TableHead className="w-[250px]">Stock Level</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventory.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.name}</TableCell>
                                        <TableCell>{item.stock}</TableCell>
                                        <TableCell>{item.unit}</TableCell>
                                        <TableCell>
                                            <StockLevelIndicator level={item.stock} lowThreshold={item.lowThreshold} idealThreshold={item.idealThreshold} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleOpenAdjustDialog(item, 'Restock')}><PackagePlus className="mr-2 h-3 w-3" /> Restock</Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenAdjustDialog(item, 'Use')}><PackageMinus className="mr-2 h-3 w-3" /> Use</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
             <InventoryItemDialog
                isOpen={isAddDialogOpen}
                setIsOpen={setIsAddDialogOpen}
                onSave={handleSaveItem}
            />
            <AdjustStockDialog
                isOpen={isAdjustDialogOpen}
                setIsOpen={setIsAdjustDialogOpen}
                item={selectedItem}
                type={adjustType}
                onAdjust={handleAdjustStock}
            />
        </>
    );
}

export default withAuth(InventoryPage, ['Admin' as UserRole, 'Advanced' as UserRole], 'inventory');
