
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
import { Textarea } from "@/components/ui/textarea";

function NewDeliveryOrderPage() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');

    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !address) {
            // Add some validation feedback if you want
            alert("All fields are required.");
            return;
        }
        
        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: address,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    }

    return (
        <>
            <PageHeader title="New Delivery Order" />
            <main className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Customer & Delivery Details</CardTitle>
                        <CardDescription>Enter the customer's information for this delivery order.</CardDescription>
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
                            <Label htmlFor="phone-number">Phone Number</Label>
                            <Input 
                                id="phone-number" 
                                type="tel"
                                placeholder="e.g. 07123456789"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                required
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="address">Delivery Address</Label>
                            <Textarea 
                                id="address"
                                placeholder="e.g. 123 Main Street, Anytown, AB1 2CD"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleCreateOrder} disabled={!customerName || !phoneNumber || !address}>
                            Create Order
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </>
    )
}


export default withAuth(NewDeliveryOrderPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
