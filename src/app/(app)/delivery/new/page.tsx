
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
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    
    // Geocoder State
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    const geocoderRef = useRef<any>(null);

    // API Key State
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false);


    // Fetch Mapbox API Key from localStorage
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
        }
    }, []);

    // Effect to load Mapbox scripts if enabled
    useEffect(() => {
        if (!isAutocompleteEnabled) return;

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
                setScriptsLoaded(true);
            };
        };
        
        return () => {
             // Clean up on component unmount
        };
    }, [isAutocompleteEnabled]);
    
    // Effect to initialize the geocoder once scripts are loaded and we have an API key
    useEffect(() => {
        if (scriptsLoaded && apiKey && geocoderContainerRef.current) {
            if (geocoderRef.current) return; // Prevent re-initialization

            const mapboxgl = (window as any).mapboxgl;
            const MapboxGeocoder = (window as any).MapboxGeocoder;
            
            mapboxgl.accessToken = apiKey;

            const geocoder = new MapboxGeocoder({
                accessToken: apiKey,
                marker: false,
                placeholder: 'Type a UK postcode and house number',
                countries: 'GB',
                types: 'address,postcode,place'
            });

            if (geocoderContainerRef.current) {
                while (geocoderContainerRef.current.firstChild) {
                    geocoderContainerRef.current.removeChild(geocoderContainerRef.current.firstChild);
                }
                geocoderContainerRef.current.appendChild(geocoder.onAdd());
            }

            geocoderRef.current = geocoder;

            geocoder.on('result', (e: any) => {
                const result = e.result;
                setFullAddress(result.place_name);
                setAddressLine1(result.text || '');
                setPostcode(result.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '');
                setCity(result.context?.find((c: any) => c.id.startsWith('place'))?.text || '');
                geocoder.clear();
            });
        }
    }, [scriptsLoaded, apiKey]);

    
    const handleCreateOrder = () => {
        const finalAddress = isAutocompleteEnabled ? fullAddress : `${addressLine1}, ${city}, ${postcode}`;

        if (!finalAddress || !customerName || !phoneNumber) {
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
            address: finalAddress,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    };
    
    const isReadyForOrder = (!!fullAddress || (!!addressLine1 && !!postcode)) && !!customerName && !!phoneNumber;

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

                        <div className="space-y-4">
                            <Label>Delivery Address</Label>
                            {isAutocompleteEnabled ? (
                                <div ref={geocoderContainerRef} className="[&_.mapboxgl-ctrl-geocoder]:w-full [&_.mapboxgl-ctrl-geocoder]:max-w-none [&_.mapboxgl-ctrl-geocoder--input]:h-10 [&_.mapboxgl-ctrl-geocoder--input]:text-base [&_.mapboxgl-ctrl-geocoder--input]:md:text-sm"/>
                            ) : (
                                <div className="space-y-2 p-4 border rounded-md bg-muted/50">
                                    <p className="text-xs text-muted-foreground">Address autocomplete is disabled. Please enter details manually.</p>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="address1">House Name/Number</Label>
                                            <Input id="address1" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} />
                                        </div>
                                         <div className="space-y-2">
                                            <Label htmlFor="city">City</Label>
                                            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                                        </div>
                                     </div>
                                      <div className="space-y-2">
                                        <Label htmlFor="postcode">Postcode</Label>
                                        <Input id="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>
                        
                         {fullAddress && (
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-base">Selected Address</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p>{fullAddress}</p>
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
