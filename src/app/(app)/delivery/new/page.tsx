
'use client'

import { useState, useEffect, useCallback } from "react";
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

interface LocationIQAddress {
    place_id: string;
    display_name: string;
    address: {
        name?: string;
        house_number?: string;
        road?: string;
        postcode?: string;
        country?: string;
    }
}

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

    const [suggestions, setSuggestions] = useState<LocationIQAddress[]>([]);
    const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);
    const [apiKey, setApiKey] = useState<string | null>(null);

    const debouncedSearchTerm = useDebounce(addressSearch, 300);

    useEffect(() => {
        const key = localStorage.getItem('locationIqApiKey');
        if (key) {
            setApiKey(key);
        } else {
            console.warn("LocationIQ API Key not found in settings.");
        }
    }, []);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 3 || !apiKey) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`https://api.locationiq.com/v1/autocomplete?key=${apiKey}&q=${encodeURIComponent(query)}&countrycodes=gb&limit=5&normalizeaddress=1`);
            const data = await response.json();
            if (data && !data.error) {
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

    const handleSelectAddress = (address: LocationIQAddress) => {
        setAddressSearch(address.display_name);
        setRoadName(address.address.road || '');
        setHouseNumber(address.address.house_number || address.address.name || '');
        setPostCode(address.address.postcode || '');
        setFlatNumber(''); // Reset flat number as it's not provided by this API
        setIsAddressPopoverOpen(false);
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
                                            placeholder="Start typing an address or postcode..."
                                            value={addressSearch}
                                            onChange={(e) => setAddressSearch(e.target.value)}
                                            disabled={!apiKey}
                                        />
                                        {!apiKey && <p className="text-xs text-destructive">LocationIQ API Key not configured in Admin Settings.</p>}
                                    </div>
                                </PopoverAnchor>
                                <PopoverContent className="w-[--radix-popover-anchor-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                    {suggestions.length > 0 ? (
                                        <ul className="space-y-1 py-1 max-h-60 overflow-y-auto">
                                            {suggestions.map(addr => (
                                                <li 
                                                    key={addr.place_id} 
                                                    className="px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                                                    onMouseDown={() => handleSelectAddress(addr)} // use onMouseDown to avoid focus issues
                                                >
                                                    {addr.display_name}
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

function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

export default withAuth(NewDeliveryOrderPage, ['Admin' as UserRole, 'Advanced' as UserRole, 'Basic' as UserRole]);
