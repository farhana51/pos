
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
import { Separator } from "@/components/ui/separator";

interface MapboxAddress {
    fullName: string;
    addressLine1: string;
    postcode: string;
    city: string;
    region: string;
    country: string;
    coordinates: [number, number];
}

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Refs for geocoder integration
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    const geocoderRef = useRef<any>(null); // Use any to avoid Mapbox type issues

    // State for delivery details
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<MapboxAddress | null>(null);
    
    const [apiKey, setApiKey] = useState<string | null>(null);

    // Fetch Mapbox API Key from localStorage
    useEffect(() => {
        const connections = localStorage.getItem('apiConnections');
        if (connections) {
            const parsed = JSON.parse(connections);
            if(parsed.mapbox?.enabled && parsed.mapbox?.apiKey) {
                 setApiKey(parsed.mapbox.apiKey);
            }
        }
    }, []);

    useEffect(() => {
        if (!apiKey) {
            toast({
                variant: "destructive",
                title: "Mapbox Not Configured",
                description: "Please set your Mapbox API key in Admin > Connections to enable delivery.",
            })
            return;
        };

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
                if (geocoderRef.current) return;

                (window as any).mapboxgl.accessToken = apiKey;

                const geocoder = new (window as any).MapboxGeocoder({
                    accessToken: (window as any).mapboxgl.accessToken,
                    marker: false,
                    placeholder: 'Enter UK Postcode or Address',
                    countries: 'GB',
                    types: 'address,postcode,place'
                });
                
                if (geocoderContainerRef.current) {
                    // Clear previous instances if any
                    while (geocoderContainerRef.current.firstChild) {
                        geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
                    }
                    geocoderContainerRef.current.appendChild(geocoder.onAdd());
                }

                geocoderRef.current = geocoder;

                geocoder.on('result', (e: any) => {
                    const result = e.result;
                    const addressDetails: MapboxAddress = {
                        fullName: result.place_name,
                        addressLine1: result.text,
                        postcode: result.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
                        city: result.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
                        region: result.context?.find((c: any) => c.id.startsWith('region'))?.text || '',
                        country: result.context?.find((c: any) => c.id.startsWith('country'))?.text || '',
                        coordinates: result.geometry.coordinates,
                    };
                    setSelectedAddress(addressDetails);
                    geocoder.clear(); // Clear input after selection
                });
            };
        };

        // Clean up on unmount
        return () => {
            document.head.removeChild(geocoderCss);
             if (mapboxScript.parentNode) {
                document.body.removeChild(mapboxScript);
            }
        };
    }, [apiKey, toast]); 

    const handleCreateOrder = () => {
        if (!selectedAddress || !customerName || !phoneNumber) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please select an address and fill in all customer details."
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

                        <Separator />

                        <div className="space-y-4">
                             <div className="space-y-2">
                                <Label>Find Address</Label>
                                <div ref={geocoderContainerRef} className="[&_.mapboxgl-ctrl-geocoder]:w-full [&_.mapboxgl-ctrl-geocoder--input]:h-10" />
                            </div>
                            
                             {selectedAddress && (
                                <div className="p-4 rounded-md border bg-muted text-sm space-y-1">
                                    <p><span className="font-semibold">Selected:</span> {selectedAddress.fullName}</p>
                                </div>
                             )}
                        </div>
                       
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleCreateOrder} disabled={!selectedAddress || !customerName || !phoneNumber}>
                            Create Order
                        </Button>
                    </CardFooter>
                </Card>
            </main>
        </>
    );
}

export default withAuth(NewDeliveryOrderPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole], 'delivery');
