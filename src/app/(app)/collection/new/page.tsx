
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";

function NewCollectionOrderPage() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleCreateOrder = () => {
        if (!customerName) {
            // Add some validation feedback if you want
            alert("Customer name is required.");
            return;
        }
        
        const params = new URLSearchParams({
            customerName: customerName,
        });
        if(phoneNumber) {
            params.set('phone', phoneNumber)
        }

        router.push(`/orders/new?type=Collection&${params.toString()}`);
    }

    return (
        <>
            <PageHeader title="New Take Away Order" />
            <main className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                        <CardDescription>Enter the customer's information for this takeaway order.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="customer-name">Customer Name</Label>
                            <Input 
                                id="customer-name" 
                                placeholder="e.g. John Doe"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="phone-number">Phone Number (Optional)</Label>
                            <Input 
                                id="phone-number" 
                                type="tel"
                                placeholder="e.g. 07123456789"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleCreateOrder} disabled={!customerName}>
                            Create Order
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </>
    )
}


export default withAuth(NewCollectionOrderPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
