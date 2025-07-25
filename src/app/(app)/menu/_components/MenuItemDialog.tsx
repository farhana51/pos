
'use client'

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { MenuItem, Addon } from "@/lib/types";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const addonSchema = z.object({
    id: z.number().optional(),
    name: z.string().min(1, "Add-on name is required."),
    price: z.coerce.number().min(0, "Price must be positive."),
});

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  category: z.string().min(1, "Category is required."),
  subcategory: z.string().optional(),
  addons: z.array(addonSchema).optional(),
});

type MenuItemFormValues = z.infer<typeof formSchema>;

interface MenuItemDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (item: MenuItem) => void;
  item: MenuItem | null;
  categories: string[];
}

export function MenuItemDialog({ isOpen, setIsOpen, onSave, item, categories }: MenuItemDialogProps) {
  const form = useForm<MenuItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: categories[0] || "Mains",
      subcategory: "",
      addons: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "addons",
  });

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        subcategory: item.subcategory,
        addons: item.addons?.map(a => ({...a})) || [],
      });
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        category: categories[0] || "Mains",
        subcategory: "",
        addons: [],
      });
    }
  }, [item, form, isOpen, categories]);

  const onSubmit = (data: MenuItemFormValues) => {
    const addons = data.addons?.map(addon => ({
        ...addon,
        id: addon.id || Math.floor(Math.random() * 10000)
    })) ?? [];

    onSave({
      ...data,
      id: item?.id ?? 0, // 0 indicates a new item
      addons,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Edit" : "Add"} Menu Item</DialogTitle>
           <DialogDescription>
            Fill in the details for your menu item. Add-ons are optional extras customers can choose.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[60vh] p-1">
            <div className="space-y-6 p-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Truffle Risotto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="A short description of the item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (£)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <div className="grid grid-cols-2 gap-4">
                  <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Mains, Starters" {...field} list="category-suggestions" />
                          </FormControl>
                           <datalist id="category-suggestions">
                                {categories.map(cat => <option key={cat} value={cat} />)}
                           </datalist>
                          <FormMessage />
                      </FormItem>
                  )}
                  />
                  <FormField
                  control={form.control}
                  name="subcategory"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Subcategory (Optional)</FormLabel>
                          <Input placeholder="e.g. Pasta, Cocktails" {...field} />
                          <FormMessage />
                      </FormItem>
                  )}
                  />
              </div>
              
              <Separator />

              <div>
                  <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium">Add-ons</h3>
                      <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => append({ id: Math.floor(Math.random() * 10000), name: '', price: 0 })}
                      >
                        <PlusCircle className="mr-2" /> Add
                      </Button>
                  </div>
                  <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-3 bg-muted/50 rounded-md">
                          <FormField
                              control={form.control}
                              name={`addons.${index}.name`}
                              render={({ field }) => (
                              <FormItem className="flex-1">
                                  <FormLabel className="text-xs">Name</FormLabel>
                                  <FormControl>
                                  <Input {...field} placeholder="e.g. Extra Cheese" />
                                  </FormControl>
                              </FormItem>
                              )}
                          />
                          <FormField
                              control={form.control}
                              name={`addons.${index}.price`}
                              render={({ field }) => (
                              <FormItem className="w-24">
                                  <FormLabel className="text-xs">Price (£)</FormLabel>
                                  <FormControl>
                                  <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                              </FormItem>
                              )}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {fields.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No add-ons for this item.</p>}
                  </div>
              </div>
            </div>
            </ScrollArea>
              <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t mt-4 px-6 pb-6">
                  <DialogClose asChild>
                      <Button type="button" variant="ghost">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Save</Button>
              </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
