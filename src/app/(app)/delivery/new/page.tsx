
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
import AddressSearch from "../../admin/connections/_components/AutoAddress";
import { Skeleton } from "@/components/ui/skeleton";

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Mapbox Config State
    const [mapboxConfig, setMapboxConfig] = useState<{enabled: boolean, apiKey: string} | null>(null);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState({
        houseNumber: '',
        flatNumber: '',
        roadName: '',
        city: '',
        postcode: '',
        country: 'United Kingdom',
    });

    useEffect(() => {
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            setMapboxConfig(JSON.parse(savedConnections).mapbox);
        } else {
            setMapboxConfig({ enabled: false, apiKey: '' });
        }
        setIsLoadingConfig(false);
    }, []);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress(prev => ({...prev, [name]: value }));
    }
    
    const handleAddressSelect = (selected: any) => {
        setAddress({
            houseNumber: selected.houseNumber || '',
            flatNumber: '', // Mapbox doesn't typically provide a separate flat number
            roadName: selected.roadName || '',
            city: selected.city || '',
            postcode: selected.postcode || '',
            country: 'United Kingdom',
        });
    };

    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !address.roadName || !address.city || !address.postcode) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please fill in all customer and address details."
            });
            return;
        }
        
        const fullAddress = [address.flatNumber, address.houseNumber, address.roadName, address.city, address.postcode, address.country].filter(Boolean).join(', ');
        
        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: fullAddress,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    };
    
    const isReadyForOrder = !!customerName && !!phoneNumber && !!address.roadName && !!address.city && !!address.postcode;

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

                        <div className="space-y-4 border-t-2 border-black pt-6">
                             {isLoadingConfig && (
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-1/3" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                             )}

                            {!isLoadingConfig && mapboxConfig?.enabled && mapboxConfig.apiKey && (
                                <div className="space-y-2">
                                    <Label>Find Address</Label>
                                    <AddressSearch apiKey={mapboxConfig.apiKey} onAddressSelect={handleAddressSelect} />
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="house-number">House No. / Name</Label>
                                    <Input 
                                        id="house-number"
                                        name="houseNumber"
                                        placeholder="e.g. 123"
                                        value={address.houseNumber}
                                        onChange={handleAddressChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="flat-number">Flat No. (Optional)</Label>
                                    <Input 
                                        id="flat-number"
                                        name="flatNumber"
                                        placeholder="e.g. Apartment 4B"
                                        value={address.flatNumber}
                                        onChange={handleAddressChange}
                                    />
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="road-name">Road Name</Label>
                                <Input 
                                    id="road-name"
                                    name="roadName"
                                    placeholder="e.g. High Street"
                                    value={address.roadName}
                                    onChange={handleAddressChange}
                                    required
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
