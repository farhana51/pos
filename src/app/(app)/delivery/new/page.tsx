
'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState({
        line1: '',
        line2: '',
        city: '',
        postcode: '',
        country: 'United Kingdom',
    });

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({...prev, [name]: value }));
    }

    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !address.line1 || !address.city || !address.postcode) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please fill in all customer and address details."
            });
            return;
        }
        
        const fullAddress = [address.line1, address.line2, address.city, address.postcode, address.country].filter(Boolean).join(', ');
        
        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: fullAddress,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    };
    
    const isReadyForOrder = !!customerName && !!phoneNumber && !!address.line1 && !!address.city && !!address.postcode;

    return (
        <>
            <PageHeader title="New Delivery Order" />
            <main className="p-4 sm:p-6 lg:p-8 flex justify-center items-start">
                 <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle>Customer & Delivery Details</CardTitle>
                        <CardDescription>
                            Enter the customer's information and delivery address.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        </div>

                        <div className="space-y-4 border-t pt-6">
                             <div className="space-y-2">
                                <Label htmlFor="address-line1">Address Line 1</Label>
                                <Input 
                                    id="address-line1"
                                    name="line1"
                                    placeholder="e.g. 123 High Street"
                                    value={address.line1}
                                    onChange={handleAddressChange}
                                    required
                                />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="address-line2">Address Line 2 (Optional)</Label>
                                <Input 
                                    id="address-line2"
                                    name="line2"
                                    placeholder="e.g. Apartment 4B"
                                    value={address.line2}
                                    onChange={handleAddressChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City/Town</Label>
                                    <Input 
                                        id="city"
                                        name="city"
                                        placeholder="e.g. London"
                                        value={address.city}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="postcode">Postcode</Label>
                                    <Input 
                                        id="postcode"
                                        name="postcode"
                                        placeholder="e.g. SW1A 1AA"
                                        value={address.postcode}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input 
                                    id="country"
                                    name="country"
                                    value={address.country}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleCreateOrder} disabled={!isReadyForOrder}>
                            Create Order
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </>
    );
}

export default withAuth(NewDeliveryOrderPage, ['Admin'as UserRole, 'Advanced'as UserRole, 'Basic'as UserRole], 'delivery');
