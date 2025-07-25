
'use client'

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockMenu, mockSetMenus, mockCategories } from "@/lib/data";
import type { MenuItem, UserRole, SetMenu, MenuCategory } from "@/lib/types";
import { MoreVertical, PlusCircle, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import withAuth from "@/components/withAuth";
import { MenuItemDialog } from "./_components/MenuItemDialog";
import { SetMenuDialog } from "./_components/SetMenuDialog";
import { CategoryDialog } from "./_components/CategoryDialog";

function MenuItemsTable({ items, onEdit, onDelete }: { items: MenuItem[], onEdit: (item: MenuItem) => void, onDelete: (id: number) => void }) {
  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <p>No items in this category yet.</p>
        <p className="text-sm">Click "Add Menu Item" to get started.</p>
      </div>
    );
  }

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
               {(!item.addons || item.addons.length === 0) && (
                <div className="text-xs text-muted-foreground italic">None</div>
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
                  <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function SetMenusTable({ items, onEdit, onDelete }: { items: SetMenu[], onEdit: (item: SetMenu) => void, onDelete: (id: number) => void }) {
    if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <p>No set menus created yet.</p>
        <p className="text-sm">Click "Add Set Menu" to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Courses</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>£{item.price.toFixed(2)}</TableCell>
            <TableCell>{item.courses.length}</TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(item)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


function MenuPage() {
  const [menu, setMenu] = useState<MenuItem[]>(mockMenu);
  const [setMenus, setSetMenus] = useState<SetMenu[]>(mockSetMenus);
  const [categories, setCategories] = useState<MenuCategory[]>(mockCategories);
  
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingSetMenu, setEditingSetMenu] = useState<SetMenu | null>(null);
  
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isSetMenuDialogOpen, setIsSetMenuDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  
  const categoryNames = categories.map(c => c.name);

  const handleAddItem = () => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };
  
  const handleAddSetMenu = () => {
    setEditingSetMenu(null);
    setIsSetMenuDialogOpen(true);
  }

  const handleEditSetMenu = (setMenu: SetMenu) => {
    setEditingSetMenu(setMenu);
    setIsSetMenuDialogOpen(true);
  }

  const handleSaveItem = (itemToSave: MenuItem) => {
    // If item has a real ID (not 0), it's an edit
    if(itemToSave.id && menu.some(m => m.id === itemToSave.id)) { 
        setMenu(menu.map(m => m.id === itemToSave.id ? itemToSave : m));
    } else { // No ID or ID not found, it's a new item
        const newItem = { ...itemToSave, id: Math.max(0, ...menu.map(m => m.id)) + 1 };
        setMenu([...menu, newItem]);
    }
  }

  const handleDeleteItem = (id: number) => {
      setMenu(menu.filter(m => m.id !== id));
  }

  const handleSaveSetMenu = (setMenuToSave: SetMenu) => {
      if (setMenus.some(sm => sm.id === setMenuToSave.id)) {
          setSetMenus(setMenus.map(sm => sm.id === setMenuToSave.id ? setMenuToSave : sm));
      } else {
          const newSetMenu = { ...setMenuToSave, id: Math.max(0, ...setMenus.map(sm => sm.id)) + 1 };
          setSetMenus([...setMenus, newSetMenu]);
      }
  }

  const handleDeleteSetMenu = (id: number) => {
      setSetMenus(setMenus.filter(sm => sm.id !== id));
  }

  const handleSaveCategories = (newCategories: MenuCategory[]) => {
    setCategories(newCategories);
    // Potentially update items that were in a deleted category
    setMenu(currentMenu => currentMenu.map(item => {
        if (!newCategories.some(c => c.name === item.category)) {
            return { ...item, category: '', subcategory: '' };
        }
        if (!newCategories.find(c => c.name === item.category)?.subcategories.includes(item.subcategory || '')) {
             return { ...item, subcategory: '' };
        }
        return item;
    }));
  }
  
  return (
    <>
      <PageHeader title="Menu Management">
        <div className="flex gap-2">
            <Button onClick={() => setIsCategoryDialogOpen(true)} variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Manage Categories
            </Button>
            <Button onClick={handleAddItem} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
            </Button>
            <Button onClick={handleAddSetMenu}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Set Menu
            </Button>
        </div>
      </PageHeader>
      <main className="p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="items">
            <TabsList>
                <TabsTrigger value="items">Menu Items</TabsTrigger>
                <TabsTrigger value="set_menus">Set Menus</TabsTrigger>
            </TabsList>
            <TabsContent value="items" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Menu Items by Category</CardTitle>
                        <CardDescription>Manage your restaurant's individual items, prices, and categories.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue={categoryNames[0]} className="w-full">
                        <TabsList>
                            {categoryNames.map(category => (
                                <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                            ))}
                        </TabsList>
                        {categoryNames.map(category => (
                            <TabsContent key={category} value={category} className="mt-4">
                                <MenuItemsTable 
                                    items={menu.filter(item => item.category === category)} 
                                    onEdit={handleEditItem}
                                    onDelete={handleDeleteItem}
                                />
                            </TabsContent>
                        ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="set_menus" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Set Menus</CardTitle>
                        <CardDescription>Create and manage fixed-price or multi-course menus.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SetMenusTable items={setMenus} onEdit={handleEditSetMenu} onDelete={handleDeleteSetMenu} />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
      <MenuItemDialog 
        isOpen={isItemDialogOpen}
        setIsOpen={setIsItemDialogOpen}
        onSave={handleSaveItem}
        item={editingItem}
        categories={categories}
      />
      <SetMenuDialog
        isOpen={isSetMenuDialogOpen}
        setIsOpen={setIsSetMenuDialogOpen}
        onSave={handleSaveSetMenu}
        setMenu={editingSetMenu}
        allItems={menu}
      />
      <CategoryDialog
        isOpen={isCategoryDialogOpen}
        setIsOpen={setIsCategoryDialogOpen}
        categories={categories}
        onSave={handleSaveCategories}
       />
    </>
  );
}

export default withAuth(MenuPage, ['Admin' as UserRole, 'Advanced' as UserRole]);
