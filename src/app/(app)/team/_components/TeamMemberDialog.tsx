
'use client'

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { TeamMember } from "@/lib/types";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  userId: z.string().min(1, "User ID is required."),
  password: z.string().optional(),
  email: z.string().email("Invalid email address."),
  role: z.enum(["Basic", "Advanced", "Admin"]),
  status: z.enum(["Active", "Inactive"]),
});

type TeamMemberFormValues = z.infer<typeof formSchema>;

interface TeamMemberDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSave: (member: TeamMember) => void;
  member: TeamMember | null;
}

export function TeamMemberDialog({ isOpen, setIsOpen, onSave, member }: TeamMemberDialogProps) {
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      userId: "",
      password: "",
      email: "",
      role: "Basic",
      status: "Active",
    },
  });

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        userId: member.userId,
        password: member.password ?? "",
        email: member.email,
        role: member.role,
        status: member.status,
      });
    } else {
      form.reset({
        name: "",
        userId: "",
        password: "",
        email: "",
        role: "Basic",
        status: "Active",
      });
    }
  }, [member, form, isOpen]);

  const onSubmit = (data: TeamMemberFormValues) => {
    const memberData: TeamMember = {
        ...data,
        id: member?.id ?? 0, // A real app would generate a proper ID
        avatarUrl: member?.avatarUrl ?? '',
    };
    if (!data.password) {
        delete memberData.password;
    }
    onSave(memberData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{member ? "Edit" : "Add"} Team Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                        <Input placeholder="johndoe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                        <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">Leave blank to keep unchanged.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <DialogFooter>
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
