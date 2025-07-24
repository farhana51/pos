'use client'

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockInventory, mockTeam } from "@/lib/data";
import withAuth from "@/components/withAuth";
import { InventoryItem, TeamMember, UserRole } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, PackageMinus, PackagePlus, PlusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

function StockLevelIndicator({ level, lowThreshold }: { level: number, lowThreshold: number }) {
    const percentage = (level / (lowThreshold * 2)) * 100; // Assume ideal stock is 2x low threshold
    let color = "bg-green-500";
    if (level < lowThreshold) {
        color = "bg-red-500";
    } else if (level < lowThreshold * 1.5) {
        color = "bg-yellow-500";
    }

    return (
        <div className="flex items-center gap-2">
            <Progress value={percentage} className="h-2 [&>div]:bg-green-500" />
            {level < lowThreshold && <Badge variant="destructive">Low</Badge>}
        </div>
    )
}


function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);

    return (
        <>
            <PageHeader title="Inventory Management">
                 <Button>
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
                                    <TableHead className="w-[200px]">Stock Level</TableHead>
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
                                            <StockLevelIndicator level={item.stock} lowThreshold={item.lowThreshold} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="sm"><PackagePlus className="mr-2 h-3 w-3" /> Restock</Button>
                                                <Button variant="ghost" size="sm"><PackageMinus className="mr-2 h-3 w-3" /> Adjust</Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

export default withAuth(InventoryPage, ['Admin' as UserRole, 'Advanced' as UserRole]);
