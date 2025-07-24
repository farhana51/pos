
'use client'

import { useState } from "react";
import { MoreVertical, PlusCircle, Award } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockCustomers } from "@/lib/data";
import withAuth from "@/components/withAuth";
import { Customer, UserRole } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";


function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

    return (
        <>
            <PageHeader title="Customer Management">
                 <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Customer
                </Button>
            </PageHeader>
            <main className="p-4 sm:p-6 lg:p-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Customer List</CardTitle>
                        <CardDescription>View and manage all customer information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Total Orders</TableHead>
                                    <TableHead>Total Spent</TableHead>
                                    <TableHead>Loyalty Points</TableHead>
                                    <TableHead>Last Visit</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://placehold.co/100x100.png?text=${customer.name.charAt(0)}`} alt={customer.name} data-ai-hint="person face" />
                                                <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            {customer.name}
                                        </TableCell>
                                        <TableCell>
                                            <div>{customer.email}</div>
                                            <div className="text-xs text-muted-foreground">{customer.phone}</div>
                                        </TableCell>
                                         <TableCell>{customer.totalOrders}</TableCell>
                                        <TableCell>£{customer.totalSpent.toFixed(2)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <Award className="h-4 w-4 text-yellow-500" />
                                                {customer.loyaltyPoints ?? 0}
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(customer.lastVisit), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem>View History</DropdownMenuItem>
                                                    <DropdownMenuItem>Adjust Points</DropdownMenuItem>
                                                    <DropdownMenuItem>Edit</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

export default withAuth(CustomersPage, ['Admin' as UserRole, 'Advanced' as UserRole]);
