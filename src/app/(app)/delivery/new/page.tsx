
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

interface MapboxAddress {
    fullName: string;
    coordinates: [number, number];
    postcode: string;
    place: string;
    region: string;
}

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Refs for map integration
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null); // Use any to avoid Mapbox type issues without npm package

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
        // Dynamically load external scripts and stylesheets to avoid build errors.
        const mapboxCss = document.createElement('link');
        mapboxCss.href = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css';
        mapboxCss.rel = 'stylesheet';
        document.head.appendChild(mapboxCss);

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
                if (mapRef.current) return;

                (window as any).mapboxgl.accessToken = apiKey;

                const map = new (window as any).mapboxgl.Map({
                    container: mapContainerRef.current,
                    style: 'mapbox://styles/mapbox/streets-v11',
                    center: [-0.127758, 51.507351], // Initial center: London
                    zoom: 10
                });
                mapRef.current = map;

                const geocoder = new (window as any).MapboxGeocoder({
                    accessToken: (window as any).mapboxgl.accessToken,
                    mapboxgl: (window as any).mapboxgl,
                    marker: true,
                    placeholder: 'Enter UK Postcode or Address',
                    countries: 'GB',
                    types: 'address,postcode,place'
                });

                map.addControl(geocoder, 'top-left');
                map.addControl(new (window as any).mapboxgl.NavigationControl(), 'top-right');

                geocoder.on('result', (e: any) => {
                    const result = e.result;
                    const addressDetails: MapboxAddress = {
                        fullName: result.place_name,
                        coordinates: result.geometry.coordinates,
                        postcode: result.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
                        place: result.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
                        region: result.context?.find((c: any) => c.id.startsWith('region'))?.text || '',
                    };
                    setSelectedAddress(addressDetails);
                });
            };
        };

        // Clean up on unmount
        return () => {
            mapRef.current?.remove();
            document.head.removeChild(mapboxCss);
            document.head.removeChild(geocoderCss);
            document.body.removeChild(mapboxScript);
            // The geocoder script will also be removed implicitly
        };
    }, [apiKey, toast]); 

    const handleCreateOrder = () => {
        if (!selectedAddress || !customerName || !phoneNumber) {
            alert("Please select an address and fill in all customer details.");
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
            <main className="grid md:grid-cols-3 gap-0 h-[calc(100vh-60px)]">
                <div ref={mapContainerRef} className="md:col-span-2 h-full" />
                <div className="md:col-span-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center bg-muted/30">
                     <Card className="w-full max-w-md shadow-2xl">
                        <CardHeader>
                            <CardTitle>Delivery Details</CardTitle>
                            <CardDescription>
                                {selectedAddress ? "Confirm the customer's information below." : "Search for an address using the search box on the map."}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedAddress ? (
                                <div className="space-y-4">
                                     <div className="p-4 rounded-md border bg-background text-sm">
                                        <p className="font-semibold">{selectedAddress.fullName}</p>
                                        <p className="text-muted-foreground">{selectedAddress.place}, {selectedAddress.postcode}</p>
                                    </div>
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
                            ) : (
                                 <div className="text-center text-muted-foreground py-8">
                                    <p>Waiting for address selection...</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" onClick={handleCreateOrder} disabled={!selectedAddress || !customerName || !phoneNumber}>
                                Create Order
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </>
    );
}

export default withAuth(NewDeliveryOrderPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole], 'delivery');

    