
'use client'

import { useState, useEffect } from "react";
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
import { getMapboxSuggestions, MapboxSuggestion } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";


function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [addressQuery, setAddressQuery] = useState('');
    
    // Address Search State
    const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
    const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

    // API Key State
    const [apiKey, setApiKey] = useState<string | null>(null);

    const debouncedQuery = useDebounce(addressQuery, 300);

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

    // Fetch suggestions when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length > 2 && apiKey) {
            const fetchSuggestions = async () => {
                const results = await getMapboxSuggestions(debouncedQuery, apiKey);
                setSuggestions(results);
                setIsSuggestionsOpen(results.length > 0);
            };
            fetchSuggestions();
        } else {
            setSuggestions([]);
            setIsSuggestionsOpen(false);
        }
    }, [debouncedQuery, apiKey]);

    const handleSelectAddress = (suggestion: MapboxSuggestion) => {
        setSelectedAddress(suggestion.place_name);
        setAddressQuery(suggestion.place_name);
        setSuggestions([]);
        setIsSuggestionsOpen(false);
    }
    
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
            address: selectedAddress,
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

                        <div className="space-y-2">
                            <Label htmlFor="address-search">Find Address</Label>
                             <Popover open={isSuggestionsOpen} onOpenChange={setIsSuggestionsOpen}>
                                <PopoverAnchor asChild>
                                    <Input 
                                        id="address-search"
                                        placeholder="Start typing a UK address or postcode..."
                                        value={addressQuery}
                                        onChange={(e) => {
                                            setAddressQuery(e.target.value);
                                            if(selectedAddress) setSelectedAddress(null); // Clear selection if user types again
                                        }}
                                        disabled={!apiKey}
                                        autoComplete="off"
                                    />
                                </PopoverAnchor>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    {suggestions.map((suggestion) => (
                                        <div
                                            key={suggestion.id}
                                            className="p-2 hover:bg-accent cursor-pointer"
                                            onClick={() => handleSelectAddress(suggestion)}
                                        >
                                            {suggestion.place_name}
                                        </div>
                                    ))}
                                </PopoverContent>
                            </Popover>
                            {!apiKey && (
                                <p className="text-xs text-destructive">Mapbox integration is not configured. Please add an API key in Admin &gt; Connections.</p>
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
