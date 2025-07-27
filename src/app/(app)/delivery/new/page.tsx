
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
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";

interface MapboxSuggestion {
  mapbox_id: string;
  name: string;
  place_formatted: string;
}

interface AddressDetails {
    address: string;
    postcode: string;
    city: string;
    coordinates: [number, number]
}

async function getMapboxSuggestions(query: string, accessToken: string): Promise<MapboxSuggestion[]> {
    if (query.length < 3) return [];
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${accessToken}&session_token=${'session_token'}&country=GB&types=address,postcode,place`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        const data = await response.json();
        return data.suggestions || [];
    } catch (error) {
        console.error("Mapbox suggestion error:", error);
        return [];
    }
}

async function getMapboxAddressDetails(id: string, accessToken: string): Promise<any> {
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${id}?access_token=${accessToken}&session_token=${'session_token'}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to retrieve address");
        const data = await response.json();
        return data.features[0];
    } catch (error) {
        console.error("Mapbox retrieve error:", error);
        return null;
    }
}


function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [addressQuery, setAddressQuery] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<AddressDetails | null>(null);
    
    // Address fields for manual entry
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [postcode, setPostcode] = useState('');
    
    // Autocomplete state
    const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const debouncedQuery = useDebounce(addressQuery, 500);

    // API Key State
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(false);

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

    useEffect(() => {
        if (debouncedQuery && apiKey) {
            getMapboxSuggestions(debouncedQuery, apiKey).then(setSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery, apiKey]);
    
    const handleSelectAddress = async (suggestion: MapboxSuggestion) => {
        if (!apiKey) return;
        const details = await getMapboxAddressDetails(suggestion.mapbox_id, apiKey);
        if(details) {
            const address: AddressDetails = {
                address: details.properties.full_address,
                city: details.properties.place_formatted,
                postcode: details.properties.postcode,
                coordinates: details.geometry.coordinates,
            };
            setSelectedAddress(address);
            setAddressLine1(details.properties.address_line1 || '');
            setCity(details.properties.place_formatted || '');
            setPostcode(details.properties.postcode || '');
            setAddressQuery(details.properties.full_address);
        }
        setIsPopoverOpen(false);
        setSuggestions([]);
    }

    const handleCreateOrder = () => {
        const finalAddress = isAutocompleteEnabled ? selectedAddress?.address : `${addressLine1}, ${city}, ${postcode}`;

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
    
    const isReadyForOrder = (isAutocompleteEnabled ? !!selectedAddress : (!!addressLine1 && !!postcode)) && !!customerName && !!phoneNumber;

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
                                <Popover open={isPopoverOpen && suggestions.length > 0} onOpenChange={setIsPopoverOpen}>
                                <PopoverAnchor asChild>
                                    <Input 
                                        placeholder="Type a UK postcode and house number"
                                        value={addressQuery}
                                        onChange={(e) => {
                                            setAddressQuery(e.target.value);
                                            setIsPopoverOpen(true);
                                        }}
                                        disabled={!apiKey}
                                    />
                                </PopoverAnchor>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    {suggestions.map((suggestion) => (
                                        <div 
                                            key={suggestion.mapbox_id}
                                            onClick={() => handleSelectAddress(suggestion)}
                                            className="p-2 hover:bg-accent cursor-pointer"
                                        >
                                            <p className="font-medium">{suggestion.name}</p>
                                            <p className="text-sm text-muted-foreground">{suggestion.place_formatted}</p>
                                        </div>
                                    ))}
                                </PopoverContent>
                            </Popover>
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
                        
                         {selectedAddress && (
                            <Card className="bg-muted/50">
                                <CardHeader>
                                    <CardTitle className="text-base">Selected Address</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-1">
                                    <p>{selectedAddress.address}</p>
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

    