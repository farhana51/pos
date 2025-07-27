
'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { AddressSearch, AddressDetails } from "./_components/AddressSearch";
import { Map, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";


function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [mapboxConfig, setMapboxConfig] = useState<{enabled: boolean, apiKey: string} | null>(null);

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');

    useEffect(() => {
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            const parsed = JSON.parse(savedConnections);
            setMapboxConfig(parsed.mapboxAutocomplete || { enabled: false, apiKey: '' });
        } else {
             setMapboxConfig({ enabled: false, apiKey: '' });
        }
    }, []);

    const handleAddressSelect = (details: AddressDetails) => {
        setSelectedAddress(details);
        setAddressLine1(details.addressLine1);
        setCity(details.city);
        setPostcode(details.postcode);
        // If the name has a building name or number prefix, use it for the customer name if empty
        if(!customerName && isNaN(parseInt(details.addressLine1.charAt(0)))) {
             setCustomerName(details.addressLine1.split(' ')[0]);
        }
    };


    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !addressLine1 || !city || !postcode) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please fill in all customer and address details."
            });
            return;
        }
        
        const fullAddress = `${addressLine1}, ${city}, ${postcode}`;

        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: fullAddress,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    };
    
    const isReadyForOrder = !!customerName && !!phoneNumber && !!addressLine1 && !!city && !!postcode;

    return (
        <>
            <PageHeader title="New Delivery Order" />
            <main className="p-4 sm:p-6 lg:p-8 flex justify-center items-start">
                 <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle>Customer & Delivery Details</CardTitle>
                        <CardDescription>
                            Enter the customer's information and find their address.
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
                            <Label>Delivery Address Search</Label>
                             <AddressSearch onAddressSelect={handleAddressSelect} config={mapboxConfig} />
                        </div>
                        
                        {selectedAddress && (
                             <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <MapPin className="text-primary"/>
                                        Selected Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="address-line-1">Address Line 1</Label>
                                        <Input 
                                            id="address-line-1" 
                                            placeholder="House number and street"
                                            value={addressLine1}
                                            onChange={(e) => setAddressLine1(e.target.value)}
                                            required
                                        />
                                    </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="city">City/Town</Label>
                                            <Input 
                                                id="city" 
                                                placeholder="e.g. London"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="postcode">Postcode</Label>
                                            <Input 
                                                id="postcode" 
                                                placeholder="e.g. SW1A 1AA"
                                                value={postcode}
                                                onChange={(e) => setPostcode(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground pt-2">Full address: {selectedAddress.fullName}</p>
                                </CardContent>
                            </Card>
                        )}
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
