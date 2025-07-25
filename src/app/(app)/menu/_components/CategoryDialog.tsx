
'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { MenuCategory } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


interface CategoryDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  categories: MenuCategory[];
  onSave: (categories: MenuCategory[]) => void;
}

export function CategoryDialog({ isOpen, setIsOpen, categories: initialCategories, onSave }: CategoryDialogProps) {
  const [localCategories, setLocalCategories] = useState<MenuCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategoryNames, setNewSubcategoryNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      // Deep copy to avoid mutating the original state until save
      setLocalCategories(JSON.parse(JSON.stringify(initialCategories)));
    }
  }, [isOpen, initialCategories]);

  const handleAddCategory = () => {
    if (newCategoryName && !localCategories.find(c => c.name.toLowerCase() === newCategoryName.toLowerCase())) {
      setLocalCategories([...localCategories, { name: newCategoryName, subcategories: [] }]);
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    setLocalCategories(localCategories.filter(c => c.name !== categoryName));
  };
  
  const handleAddSubcategory = (categoryName: string) => {
    const subcategoryName = newSubcategoryNames[categoryName]?.trim();
    if (!subcategoryName) return;

    const categoryIndex = localCategories.findIndex(c => c.name === categoryName);
    if (categoryIndex === -1) return;
    
    const category = localCategories[categoryIndex];
    if(category.subcategories.find(sc => sc.toLowerCase() === subcategoryName.toLowerCase())) return;

    const updatedCategory = {
      ...category,
      subcategories: [...category.subcategories, subcategoryName]
    };

    const updatedCategories = [...localCategories];
    updatedCategories[categoryIndex] = updatedCategory;
    setLocalCategories(updatedCategories);

    setNewSubcategoryNames({ ...newSubcategoryNames, [categoryName]: '' });
  };
  
  const handleDeleteSubcategory = (categoryName: string, subcategoryName: string) => {
      const categoryIndex = localCategories.findIndex(c => c.name === categoryName);
      if (categoryIndex === -1) return;
      
      const category = localCategories[categoryIndex];
      const updatedSubcategories = category.subcategories.filter(sc => sc !== subcategoryName);

      const updatedCategory = { ...category, subcategories: updatedSubcategories };
      const updatedCategories = [...localCategories];
      updatedCategories[categoryIndex] = updatedCategory;
      setLocalCategories(updatedCategories);
  }

  const handleSaveChanges = () => {
    onSave(localCategories);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Categories & Subcategories</DialogTitle>
           <DialogDescription>
            Add or remove item categories and their corresponding subcategories.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
            <div>
                 <h3 className="font-semibold mb-2">Existing Categories</h3>
                 {localCategories.length > 0 ? (
                    <Accordion type="multiple" className="w-full">
                        {localCategories.map(category => (
                             <AccordionItem key={category.name} value={category.name}>
                                <div className="flex items-center w-full">
                                    <AccordionTrigger className="flex-1">
                                            <span>{category.name}</span>
                                    </AccordionTrigger>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                             <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive shrink-0">
                                                <Trash2 />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Category '{category.name}'?</AlertDialogTitle>
                                                <AlertDialogDescription>This action cannot be undone. Items in this category will not be deleted but will need to be reassigned.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteCategory(category.name)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                <AccordionContent>
                                    <div className="pl-4 space-y-3">
                                        <h4 className="text-sm font-medium text-muted-foreground">Subcategories</h4>
                                        <div className="space-y-2">
                                            {category.subcategories.map(sc => (
                                                <div key={sc} className="flex items-center justify-between">
                                                    <Badge variant="outline">{sc}</Badge>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => handleDeleteSubcategory(category.name, sc)}>
                                                        <X />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                         <div className="flex gap-2 pt-2">
                                            <Input 
                                                placeholder="New subcategory name"
                                                value={newSubcategoryNames[category.name] || ''}
                                                onChange={e => setNewSubcategoryNames({...newSubcategoryNames, [category.name]: e.target.value})}
                                            />
                                            <Button size="sm" onClick={() => handleAddSubcategory(category.name)}>Add</Button>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                 ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No categories created yet.</p>
                 )}
            </div>
            <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="new-category">Add New Category</Label>
                <div className="flex gap-2">
                    <Input id="new-category" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g., Starters, Mains, Drinks" />
                    <Button onClick={handleAddCategory} disabled={!newCategoryName}><PlusCircle className="mr-2"/>Add</Button>
                </div>
            </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
