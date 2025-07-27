
'use client'

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

// Define a type for the selected address to use in our state
type AddressDetails = {
    fullName: string;
    addressLine1: string;
    postcode: string;
    city: string;
}

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);

    // Mapbox Geocoder State
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    const geocoderRef = useRef<any>(null); // To hold the geocoder instance
    const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);


    // This single useEffect handles both loading settings and initializing the geocoder
    useEffect(() => {
        let isEnabled = false;
        let apiKey: string | null = null;
        
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            const parsed = JSON.parse(savedConnections);
            if (parsed.mapboxAutocomplete) {
                isEnabled = parsed.mapboxAutocomplete.enabled;
                apiKey = parsed.mapboxAutocomplete.apiKey;
            }
        }
        
        setIsAutocompleteEnabled(isEnabled);
        setIsLoading(false);

        if (!isEnabled || !apiKey || !geocoderContainerRef.current) {
            return;
        }

        // --- SCRIPT AND STYLESHEET LOADING ---
        const geocoderCss = document.createElement('link');
        geocoderCss.rel = 'stylesheet';
        geocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css';
        geocoderCss.type = 'text/css';
        document.head.appendChild(geocoderCss);

        const mapboxScript = document.createElement('script');
        mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
        mapboxScript.async = true;
        document.body.appendChild(mapboxScript);

        mapboxScript.onload = () => {
            const geocoderScript = document.createElement('script');
            geocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js';
            geocoderScript.async = true;
            document.body.appendChild(geocoderScript);

            geocoderScript.onload = () => {
                if (geocoderRef.current || !geocoderContainerRef.current) return;
                
                // @ts-ignore
                window.mapboxgl.accessToken = apiKey;
                
                // @ts-ignore
                const geocoder = new window.MapboxGeocoder({
                    accessToken: apiKey,
                    marker: false,
                    placeholder: 'Type a UK postcode and house number',
                    countries: 'GB',
                    types: 'address,postcode,place'
                });
                
                // Clear any previous child elements and append the new geocoder
                geocoderContainerRef.current.innerHTML = '';
                geocoderContainerRef.current.appendChild(geocoder.onAdd());
                
                geocoderRef.current = geocoder;

                geocoder.on('result', (e: any) => {
                    const { result } = e;
                    const addressDetails: AddressDetails = {
                        fullName: result.place_name,
                        addressLine1: `${result.address ? result.address + ' ' : ''}${result.text}`,
                        postcode: result.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
                        city: result.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
                    };
                    setSelectedAddress(addressDetails);
                    geocoder.clear();
                });
            };
        };

        // Cleanup on component unmount
        return () => {
             if (geocoderRef.current) {
                 geocoderRef.current.onRemove();
                 geocoderRef.current = null;
             }
             if (geocoderContainerRef.current) {
                geocoderContainerRef.current.innerHTML = '';
             }
        };

    }, []);


    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !selectedAddress) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please fill in all customer and address details."
            });
            return;
        }
        
        const fullAddress = selectedAddress.fullName;

        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: fullAddress,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    };
    
    const isReadyForOrder = !!customerName && !!phoneNumber && !!selectedAddress;

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
                             {!isLoading && isAutocompleteEnabled ? (
                                <div ref={geocoderContainerRef} className="[&_.mapboxgl-ctrl-geocoder]:w-full [&_.mapboxgl-ctrl-geocoder]:max-w-none" />
                            ) : (
                                <Alert>
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Autocomplete Disabled</AlertTitle>
                                    <AlertDescription>
                                        Please enable the Mapbox Autocomplete feature and provide an API key in Admin &gt; Connections.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>

                        {selectedAddress && (
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-base">Selected Address</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p><strong>Address:</strong> {selectedAddress.addressLine1}</p>
                                    <p><strong>City:</strong> {selectedAddress.city}</p>
                                    <p><strong>Postcode:</strong> {selectedAddress.postcode}</p>
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
