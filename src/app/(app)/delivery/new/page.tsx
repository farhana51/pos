
'use client'

import { useState, useEffect, useRef } from "react";
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

interface AddressDetails {
    fullName: string;
    addressLine1: string;
    postcode: string;
    city: string;
    coordinates: [number, number];
}

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);

    // Geocoder State
    const geocoderContainerRef = useRef(null);
    const geocoderRef = useRef(null);

    // API Key State
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const connections = localStorage.getItem('apiConnections');
        if (connections) {
            const parsed = JSON.parse(connections);
            if(parsed.mapboxAutocomplete?.enabled && parsed.mapboxAutocomplete?.apiKey) {
                 setApiKey(parsed.mapboxAutocomplete.apiKey);
                 setIsAutocompleteEnabled(true);
            } else {
                 setIsAutocompleteEnabled(false);
            }
        } else {
            setIsAutocompleteEnabled(false);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!isAutocompleteEnabled || !apiKey || geocoderRef.current) return;

        // Load Mapbox Geocoder CSS
        const geocoderCss = document.createElement('link');
        geocoderCss.rel = 'stylesheet';
        geocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css';
        geocoderCss.type = 'text/css';
        document.head.appendChild(geocoderCss);

        // Load Mapbox GL JS
        const mapboxScript = document.createElement('script');
        mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
        mapboxScript.async = true;
        document.body.appendChild(mapboxScript);
        
        // Load Geocoder script after GL JS
        mapboxScript.onload = () => {
            const geocoderScript = document.createElement('script');
            geocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js';
            geocoderScript.async = true;
            document.body.appendChild(geocoderScript);

            geocoderScript.onload = () => {
                if (geocoderRef.current) return;

                window.mapboxgl.accessToken = apiKey;

                const geocoder = new window.MapboxGeocoder({
                    accessToken: apiKey,
                    marker: false,
                    placeholder: 'Type a UK postcode and house number',
                    countries: 'GB',
                    types: 'address,postcode,place'
                });

                if (geocoderContainerRef.current) {
                    (geocoderContainerRef.current as HTMLElement).innerHTML = ''; // Clear previous
                    geocoder.onAdd(geocoderContainerRef.current);
                }

                geocoderRef.current = geocoder;

                geocoder.on('result', (e: any) => {
                    const result = e.result;
                    const addressDetails: AddressDetails = {
                        fullName: result.place_name,
                        addressLine1: result.text,
                        postcode: result.context?.find((c: any) => c.id.startsWith('postcode'))?.text || 'N/A',
                        city: result.context?.find((c: any) => c.id.startsWith('place'))?.text || 'N/A',
                        coordinates: result.geometry.coordinates,
                    };
                    setSelectedAddress(addressDetails);
                     // Clear the input after selection to prevent confusion
                    geocoder.clear();
                });
            };
        };

        return () => {
            // Basic cleanup
             const geocoderCssEl = document.querySelector('link[href*="mapbox-gl-geocoder"]');
             if(geocoderCssEl) document.head.removeChild(geocoderCssEl);
        }

    }, [isAutocompleteEnabled, apiKey]);

    const handleCreateOrder = () => {
        if (!selectedAddress || !customerName || !phoneNumber) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please provide a full address and all customer details."
            });
            return;
        }

        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: selectedAddress.fullName,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    };
    
    const isReadyForOrder = !!selectedAddress && !!customerName && !!phoneNumber;

    return (
        <>
            <PageHeader title="New Delivery Order" />
            <main className="p-4 sm:p-6 lg:p-8 flex justify-center items-start">
                 <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle>Customer & Delivery Details</CardTitle>
                        <CardDescription>
                            Enter the customer's information and search for their address below.
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

                        <div className="space-y-2">
                            <Label>Delivery Address Search</Label>
                            {isLoading ? (
                                <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                            ) : isAutocompleteEnabled ? (
                                 <div ref={geocoderContainerRef} className="[&_.mapboxgl-ctrl-geocoder]:w-full [&_.mapboxgl-ctrl-geocoder--input]:h-10" />
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
                                     <p className="pt-2 text-xs text-muted-foreground">{selectedAddress.fullName}</p>
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
