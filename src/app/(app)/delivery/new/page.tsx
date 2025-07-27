
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
import { Terminal, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import { getMapboxSuggestions, getMapboxAddressDetails, MapboxSuggestion, MapboxAddressFeature } from "@/lib/api";

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();
    
    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedAddress, setSelectedAddress] = useState<MapboxAddressFeature | null>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    
    // Use a ref to store the session token so it persists through re-renders
    const sessionTokenRef = useRef<string | null>(null);

    // API Key State from localStorage
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(false);
    const [isLoadingConfig, setIsLoadingConfig] = useState(true);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    // Effect to get API config from local storage
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
        setIsLoadingConfig(false);
    }, []);
    
    // Effect to generate a session token once
    useEffect(() => {
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = crypto.randomUUID();
        }
    }, []);


    // Effect to fetch suggestions when debounced query changes
    useEffect(() => {
        if (!isAutocompleteEnabled || !apiKey || debouncedSearchQuery.length < 3) {
            setSuggestions([]);
            setIsPopoverOpen(false);
            return;
        }

        const fetchSuggestions = async () => {
            setIsSearching(true);
            const results = await getMapboxSuggestions(debouncedSearchQuery, apiKey!, sessionTokenRef.current!);
            setSuggestions(results);
            setIsPopoverOpen(results.length > 0);
            setIsSearching(false);
        };

        fetchSuggestions();

    }, [debouncedSearchQuery, isAutocompleteEnabled, apiKey]);


    const handleSelectAddress = async (suggestion: MapboxSuggestion) => {
        if (!apiKey) return;
        
        setIsSearching(true);
        setIsPopoverOpen(false);
        setSearchQuery(suggestion.name);

        const addressDetails = await getMapboxAddressDetails(suggestion.mapbox_id, apiKey, sessionTokenRef.current!);
        
        if (addressDetails) {
            setSelectedAddress(addressDetails);
        } else {
             toast({
                variant: 'destructive',
                title: "Error",
                description: "Could not retrieve full address details."
            });
        }
        setIsSearching(false);
    };

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
            address: selectedAddress.properties.full_address,
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
                            <Label htmlFor="address-search">Delivery Address Search</Label>
                            {isLoadingConfig ? (
                                <div className="h-10 w-full bg-muted animate-pulse rounded-md" />
                            ) : isAutocompleteEnabled ? (
                                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                    <PopoverAnchor asChild>
                                         <div className="relative">
                                            <Input
                                                id="address-search"
                                                placeholder="Start typing a UK Postcode or Address"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                autoComplete="off"
                                            />
                                            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                                        </div>
                                    </PopoverAnchor>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                       {suggestions.map((suggestion) => (
                                           <div
                                                key={suggestion.mapbox_id}
                                                className="p-3 hover:bg-muted cursor-pointer"
                                                onClick={() => handleSelectAddress(suggestion)}
                                            >
                                                <p className="font-medium text-sm">{suggestion.name}</p>
                                                <p className="text-xs text-muted-foreground">{suggestion.address}</p>
                                           </div>
                                       ))}
                                    </PopoverContent>
                                </Popover>
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
                                    <p><strong>Address:</strong> {selectedAddress.properties.address_line1}</p>
                                    <p><strong>City:</strong> {selectedAddress.properties.place}</p>
                                    <p><strong>Postcode:</strong> {selectedAddress.properties.postcode}</p>
                                     <p className="pt-2 text-xs text-muted-foreground">{selectedAddress.properties.full_address}</p>
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

    