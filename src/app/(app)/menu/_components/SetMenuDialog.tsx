
'use client'

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { MenuItem, SetMenu } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const setMenuCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  items: z.array(z.number()).min(1, "Must select at least one item for the course"),
});

const formSchema = z.object({
  name: z.string().min(2, "Set menu name is required."),
  price: z.coerce.number().min(0, "Price must be a positive number."),
  courses: z.array(setMenuCourseSchema).min(1, "A set menu must have at least one course."),
});

type SetMenuFormValues = z.infer<typeof formSchema>;

interface SetMenuDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (setMenu: SetMenu) => void;
  setMenu: SetMenu | null;
  allItems: MenuItem[];
}

export function SetMenuDialog({ isOpen, setIsOpen, onSave, setMenu, allItems }: SetMenuDialogProps) {
  const form = useForm<SetMenuFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      courses: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "courses",
  });

  useEffect(() => {
    if (setMenu) {
      form.reset({
        name: setMenu.name,
        price: setMenu.price,
        courses: setMenu.courses.map(course => ({
          title: course.title,
          items: course.items.map(item => item.id),
        })),
      });
    } else {
      form.reset({
        name: "",
        price: 0,
        courses: [],
      });
    }
  }, [setMenu, form, isOpen]);

  const onSubmit = (data: SetMenuFormValues) => {
    const finalSetMenu: SetMenu = {
      id: setMenu?.id || 0,
      name: data.name,
      price: data.price,
      courses: data.courses.map(course => ({
        title: course.title,
        items: allItems.filter(item => course.items.includes(item.id)),
      })),
    };
    onSave(finalSetMenu);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{setMenu ? "Edit" : "Create"} Set Menu</DialogTitle>
          <DialogDescription>
            Build a multi-course menu offering choices for a fixed price.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[65vh] p-1">
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Set Menu Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Weekend Feast" {...field} />
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
                        <FormLabel>Total Price (£)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Separator />
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Courses</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => append({ title: '', items: [] })}
                    >
                      <PlusCircle className="mr-2" /> Add Course
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="p-4 bg-muted/50 rounded-lg space-y-4">
                        <div className="flex items-center gap-2">
                           <FormField
                            control={form.control}
                            name={`courses.${index}.title`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Course Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Starters" {...field} />
                                </FormControl>
                                <FormMessage/>
                              </FormItem>
                            )}
                          />
                          <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormField
                          control={form.control}
                          name={`courses.${index}.items`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Select Items for this Course</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" className="w-full justify-start">
                                    {field.value?.length > 0 ? `${field.value.length} items selected` : "Select Items"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                  <ScrollArea className="h-48">
                                    <div className="p-4 space-y-2">
                                    {allItems.map((item) => (
                                      <div key={item.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`item-${item.id}-course-${index}`}
                                          checked={field.value?.includes(item.id)}
                                          onCheckedChange={(checked) => {
                                            const newValue = checked
                                              ? [...(field.value || []), item.id]
                                              : (field.value || []).filter((id) => id !== item.id);
                                            field.onChange(newValue);
                                          }}
                                        />
                                        <label htmlFor={`item-${item.id}-course-${index}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                          {item.name}
                                        </label>
                                      </div>
                                    ))}
                                    </div>
                                  </ScrollArea>
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                     {fields.length === 0 && (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No courses added yet.</p>
                            <p className="text-sm">Click "Add Course" to begin building your set menu.</p>
                        </div>
                     )}
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t mt-4 px-6 pb-6">
              <DialogClose asChild>
                <Button type="button" variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Set Menu</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
