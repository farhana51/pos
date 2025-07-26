
'use client'

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { useDebounce } from "@/hooks/use-debounce";
import { getMapboxSuggestions, getMapboxAddressDetails, MapboxSuggestion } from "@/lib/api";

// Generates a unique session token for billing purposes
const generateSessionToken = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

function NewDeliveryOrderPage() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [addressSearch, setAddressSearch] = useState('');
    const [postCode, setPostCode] = useState('');
    const [flatNumber, setFlatNumber] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [roadName, setRoadName] = useState('');
    const country = "United Kingdom";

    const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
    const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);

    const sessionTokenRef = useRef<string | null>(null);
    const debouncedSearchTerm = useDebounce(addressSearch, 300);

    // Initialize API key and session token
    useEffect(() => {
        const connections = localStorage.getItem('apiConnections');
        if (connections) {
            const parsed = JSON.parse(connections);
            if(parsed.mapbox?.enabled && parsed.mapbox?.apiKey) {
                 setApiKey(parsed.mapbox.apiKey);
            }
        } else {
            console.warn("Mapbox API Key not found in settings.");
        }
        
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = generateSessionToken();
        }
    }, []);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 3 || !apiKey || !sessionTokenRef.current) {
            setSuggestions([]);
            return;
        }
        try {
            const data = await getMapboxSuggestions(query, apiKey, sessionTokenRef.current);
            if (data && data.length > 0) {
                setSuggestions(data);
                setIsAddressPopoverOpen(true);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error("Failed to fetch address suggestions:", error);
            setSuggestions([]);
        }
    }, [apiKey]);
    
    useEffect(() => {
        if (debouncedSearchTerm) {
            fetchSuggestions(debouncedSearchTerm);
        } else {
            setSuggestions([]);
            setIsAddressPopoverOpen(false);
        }
    }, [debouncedSearchTerm, fetchSuggestions]);

    const handleSelectAddress = async (suggestion: MapboxSuggestion) => {
        if (!apiKey || !sessionTokenRef.current) return;
        
        // Update input field immediately for better UX
        setAddressSearch(suggestion.name); 
        setSuggestions([]);
        setIsAddressPopoverOpen(false);

        const details = await getMapboxAddressDetails(suggestion.mapbox_id, apiKey, sessionTokenRef.current);
        
        if (details) {
            setAddressSearch(details.properties.full_address);
            setRoadName(details.properties.street || '');
            setHouseNumber(details.properties.house_number || '');
            setPostCode(details.properties.postcode || '');
            setFlatNumber(''); // Reset flat number
        }

        // A new session token should be generated after a retrieve call
        sessionTokenRef.current = generateSessionToken();
    }

    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !houseNumber || !roadName || !postCode) {
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
                            <Popover open={isAddressPopoverOpen} onOpenChange={setIsAddressPopoverOpen}>
                                <PopoverAnchor asChild>
                                    <div className="space-y-2">
                                        <Label htmlFor="address-search">Find Address</Label>
                                        <Input
                                            id="address-search"
                                            placeholder="Start typing a UK Postcode or Address..."
                                            value={addressSearch}
                                            onChange={(e) => setAddressSearch(e.target.value)}
                                            disabled={!apiKey}
                                            autoComplete="off"
                                        />
                                        {!apiKey && <p className="text-xs text-destructive">Mapbox API Key not configured in Admin Connections.</p>}
                                    </div>
                                </PopoverAnchor>
                                <PopoverContent className="w-[--radix-popover-anchor-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                    {suggestions.length > 0 ? (
                                        <ul className="space-y-1 py-1 max-h-60 overflow-y-auto">
                                            {suggestions.map(suggestion => (
                                                <li 
                                                    key={suggestion.mapbox_id} 
                                                    className="px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                                                    onMouseDown={() => handleSelectAddress(suggestion)} // use onMouseDown to avoid focus issues
                                                >
                                                    <p className="font-semibold">{suggestion.name}</p>
                                                    <p className="text-muted-foreground">{suggestion.address}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        (debouncedSearchTerm.length > 2) && <p className="p-4 text-sm text-muted-foreground">No suggestions found.</p>
                                    )}
                                </PopoverContent>
                            </Popover>

                            <p className="text-sm text-muted-foreground text-center">Or enter address manually</p>

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
                                        placeholder="e.g. 10"
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
                                    placeholder="e.g. Downing Street"
                                    value={roadName}
                                    onChange={(e) => setRoadName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="post-code">Post Code</Label>
                                    <Input
                                        id="post-code"
                                        placeholder="e.g. SW1A 0AA"
                                        value={postCode}
                                        onChange={(e) => setPostCode(e.target.value)}
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
