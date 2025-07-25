
'use client'

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMenu } from "@/lib/data";
import type { MenuItem, UserRole } from "@/lib/types";
import { MoreVertical, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import withAuth from "@/components/withAuth";
import { MenuItemDialog } from "./_components/MenuItemDialog";

function MenuTable({ items, onEdit, onDelete }: { items: MenuItem[], onEdit: (item: MenuItem) => void, onDelete: (id: number) => void }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Add-ons</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">
              <div>{item.name}</div>
              <div className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</div>
              {item.subcategory && <Badge variant="outline" className="mt-1">{item.subcategory}</Badge>}
            </TableCell>
            <TableCell>£{item.price.toFixed(2)}</TableCell>
            <TableCell>
              {item.addons?.slice(0, 2).map(addon => (
                <div key={addon.id} className="text-xs text-muted-foreground">
                  {addon.name} (+£{addon.price.toFixed(2)})
                </div>
              ))}
              {item.addons && item.addons.length > 2 && (
                <div className="text-xs text-muted-foreground">...and {item.addons.length - 2} more.</div>
              )}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>(mockMenu);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const categories = [...new Set(menu.map(item => item.category))];

  const handleAddItem = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSaveItem = (item: MenuItem) => {
    if(item.id) { // If item has an ID, it's an edit
        setMenu(menu.map(m => m.id === item.id ? item : m));
    } else { // No ID, it's a new item
        const newItem = { ...item, id: Math.max(...menu.map(m => m.id), 0) + 1 };
        setMenu([...menu, newItem]);
    }
  }

  const handleDeleteItem = (id: number) => {
      setMenu(menu.filter(m => m.id !== id));
  }
  
  return (
    <>
      <PageHeader title="Menu Management">
        <Button onClick={handleAddItem}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Menu Item
        </Button>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Menu Items</CardTitle>
                <CardDescription>Manage your restaurant's menu items, prices, and categories.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList>
                    {categories.map(category => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                    ))}
                </TabsList>
                {categories.map(category => (
                    <TabsContent key={category} value={category} className="mt-4">
                        <MenuTable 
                            items={menu.filter(item => item.category === category)} 
                            onEdit={handleEditItem}
                            onDelete={handleDeleteItem}
                        />
                    </TabsContent>
                ))}
                </Tabs>
            </CardContent>
        </Card>
      </main>
      <MenuItemDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        onSave={handleSaveItem}
        item={editingItem}
      />
    </>
  );
}

export default withAuth(MenuPage, ['Admin' as UserRole, 'Advanced' as UserRole]);
