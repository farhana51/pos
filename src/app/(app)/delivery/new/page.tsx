
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
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

function NewDeliveryOrderPage() {
    const router = useRouter();
    const { toast } = useToast();

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Address State
    const [postcode, setPostcode] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    
    // Postcodes.io State
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [apiError, setApiError] = useState('');
    const debouncedPostcode = useDebounce(postcode, 300);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }
        try {
            const response = await fetch(`https://api.postcodes.io/postcodes/${query}/autocomplete`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            if (data.status === 200 && data.result) {
                setSuggestions(data.result);
                setApiError('');
            } else {
                setSuggestions([]);
            }
        } catch (err) {
            console.error('Autocomplete API error:', err);
            setSuggestions([]);
        }
    }, []);

    useEffect(() => {
        fetchSuggestions(debouncedPostcode);
    }, [debouncedPostcode, fetchSuggestions]);
    
    const lookupPostcode = async (pc: string) => {
        try {
            setApiError('');
            const response = await fetch(`https://api.postcodes.io/postcodes/${pc}`);
            const data = await response.json();
            if (data.status === 200) {
                setCity(data.result.admin_district || data.result.region || '');
            } else {
                setApiError(data.error || 'Invalid postcode.');
                setCity('');
            }
        } catch (err) {
            console.error('Lookup API error:', err);
            setApiError('Failed to fetch postcode details.');
        }
    };

    const handleSuggestionClick = (pc: string) => {
        setPostcode(pc);
        setSuggestions([]);
        lookupPostcode(pc);
    };

    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !postcode || !street || !houseNumber || !city) {
            toast({
                variant: 'destructive',
                title: "Missing Information",
                description: "Please fill in all customer and address details."
            });
            return;
        }
        
        const fullAddress = `${houseNumber} ${street}, ${city}, ${postcode}`;

        const params = new URLSearchParams({
            customerName: customerName,
            phone: phoneNumber,
            address: fullAddress,
        });
        
        router.push(`/orders/new?type=Delivery&${params.toString()}`);
    };
    
    const isReadyForOrder = !!customerName && !!phoneNumber && !!postcode && !!street && !!houseNumber && !!city;

    return (
        <>
            <PageHeader title="New Delivery Order" />
            <main className="p-4 sm:p-6 lg:p-8 flex justify-center items-start">
                 <Card className="w-full max-w-xl">
                    <CardHeader>
                        <CardTitle>Customer & Delivery Details</CardTitle>
                        <CardDescription>
                            Enter the customer's information and delivery address below.
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
                            <div className="relative space-y-2">
                                <Label htmlFor="postcode">Postcode</Label>
                                <Input
                                    id="postcode"
                                    placeholder="Start typing a UK postcode..."
                                    value={postcode}
                                    onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                                    onBlur={() => lookupPostcode(postcode)}
                                />
                                {suggestions.length > 0 && (
                                    <ul className="absolute z-10 w-full bg-background border rounded-md mt-1 max-h-48 overflow-y-auto">
                                        {suggestions.map(pc => (
                                            <li key={pc} onClick={() => handleSuggestionClick(pc)} className="p-2 cursor-pointer hover:bg-accent">
                                                {pc}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="house-number">House Name/Number</Label>
                                    <Input
                                        id="house-number"
                                        placeholder="e.g. 10 or The Willows"
                                        value={houseNumber}
                                        onChange={(e) => setHouseNumber(e.target.value)}
                                    />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="street">Street</Label>
                                    <Input
                                        id="street"
                                        placeholder="e.g. Downing Street"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="city">City/Town</Label>
                                <Input
                                    id="city"
                                    placeholder="e.g. London"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>

                             {apiError && <p className="text-sm text-destructive">{apiError}</p>}
                        </div>
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
