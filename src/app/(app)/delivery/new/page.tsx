
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

function NewDeliveryOrderPage() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [postCode, setPostCode] = useState('');
    const [flatNumber, setFlatNumber] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [roadName, setRoadName] = useState('');
    const country = "United Kingdom";

    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !houseNumber || !roadName || !postCode) {
            // Add some validation feedback if you want
            alert("Please fill in all required fields.");
            return;
        }

        const addressParts = [
            flatNumber,
            houseNumber,
            roadName,
            postCode,
            country
        ].filter(Boolean); // Filter out empty parts
        
        const fullAddress = addressParts.join(', ');
        
        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: fullAddress,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    }

    return (
        <>
            <PageHeader title="New Delivery Order" />
            <main className="p-4 sm:p-6 lg:p-8 flex items-center justify-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>Customer & Delivery Details</CardTitle>
                        <CardDescription>Enter the customer's information for this delivery order.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                        <div className="space-y-4 pt-4 border-t">
                             <div className="space-y-2">
                                <Label htmlFor="post-code">Post Code</Label>
                                <Input 
                                    id="post-code"
                                    placeholder="e.g. AB1 2CD"
                                    value={postCode}
                                    onChange={(e) => setPostCode(e.target.value)}
                                    required
                                />
                            </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="flat-number">Flat Number (Optional)</Label>
                                    <Input 
                                        id="flat-number"
                                        placeholder="e.g. Flat 21B"
                                        value={flatNumber}
                                        onChange={(e) => setFlatNumber(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="house-number">House Name/Number</Label>
                                    <Input 
                                        id="house-number"
                                        placeholder="e.g. 123"
                                        value={houseNumber}
                                        onChange={(e) => setHouseNumber(e.target.value)}
                                        required
                                    />
                                </div>
                             </div>
                              <div className="space-y-2">
                                <Label htmlFor="road-name">Road Name</Label>
                                <Input 
                                    id="road-name"
                                    placeholder="e.g. Main Street"
                                    value={roadName}
                                    onChange={(e) => setRoadName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input 
                                    id="country"
                                    value={country}
                                    readOnly
                                    className="bg-muted"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleCreateOrder} disabled={!customerName || !phoneNumber || !houseNumber || !roadName || !postCode}>
                            Create Order
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </>
    )
}


export default withAuth(NewDeliveryOrderPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
