
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import withAuth from "@/components/withAuth";
import { UserRole } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";


function NewDeliveryOrderPage() {
    const router = useRouter();
    const [customerName, setCustomerName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [postCode, setPostCode] = useState('');
    const [flatNumber, setFlatNumber] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [roadName, setRoadName] = useState('');
    const country = "United Kingdom";

    const [foundAddresses, setFoundAddresses] = useState<string[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [isAddressPopoverOpen, setIsAddressPopoverOpen] = useState(false);

    const handleFindAddress = async () => {
        if(!postCode) return;
        try {
            const response = await fetch(`https://api.postcodes.io/postcodes/${postCode.replace(/\s/g, '')}`);
            const data = await response.json();
            
            if (data.status === 200 && data.result) {
                // The postcodes.io "postcode" endpoint doesn't give a nicely formatted list of addresses.
                // It's better to use a service designed for address lookup (like Address lookup from Royal Mail)
                // or use their autocomplete feature. For this demo, we'll just show the postcode and town.
                // A better free API might be needed for full address lists.
                // For demonstration, let's create some sample addresses from the response.
                 const { admin_district, region } = data.result;
                 // A real implementation would list individual addresses. We'll simulate this.
                 const simulatedAddresses = [
                     `1 Delivery Road, ${admin_district}, ${postCode.toUpperCase()}`,
                     `10 Delivery Road, ${admin_district}, ${postCode.toUpperCase()}`,
                     `25 Delivery Road, ${admin_district}, ${postCode.toUpperCase()}`,
                 ]
                 setFoundAddresses(simulatedAddresses);
                 setIsAddressPopoverOpen(true);

            } else {
                 setFoundAddresses([]);
                 alert("No addresses found for this postcode. Please check the postcode or enter the address manually.");
            }
        } catch (error) {
            console.error("Failed to fetch address:", error);
            alert("There was an error finding the address. Please enter it manually.");
        }
    }
    
    const handleSelectAddress = (address: string) => {
        // This is a simplified parsing logic. A real implementation might be more robust.
        const parts = address.split(',');
        const houseAndRoad = parts[0].trim().split(' ');
        const house = houseAndRoad.shift() || '';
        const road = houseAndRoad.join(' ');
        
        setHouseNumber(house);
        setRoadName(road);
        setSelectedAddress(address);
        setIsAddressPopoverOpen(false);
    }

    const handleCreateOrder = () => {
        if (!customerName || !phoneNumber || !houseNumber || !roadName || !postCode) {
            // Add some validation feedback if you want
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
                            <div className="space-y-2">
                                <Label htmlFor="post-code">Post Code</Label>
                                <div className="flex gap-2">
                                <Input 
                                    id="post-code"
                                    placeholder="e.g. SW1A 0AA"
                                    value={postCode}
                                    onChange={(e) => setPostCode(e.target.value)}
                                    required
                                />
                                 <Popover open={isAddressPopoverOpen} onOpenChange={setIsAddressPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <Button 
                                            variant="outline" 
                                            onClick={handleFindAddress}
                                            disabled={!postCode}
                                            className="w-[200px] justify-between"
                                        >
                                           {selectedAddress ?? "Find Address"}
                                           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                     <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        {foundAddresses.length > 0 ? (
                                            <ul className="space-y-1 py-1">
                                                {foundAddresses.map(addr => (
                                                    <li 
                                                        key={addr} 
                                                        className="px-4 py-2 text-sm hover:bg-accent cursor-pointer"
                                                        onClick={() => handleSelectAddress(addr)}
                                                    >
                                                        {addr}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="p-4 text-sm text-muted-foreground">No addresses found.</p>
                                        )}
                                    </PopoverContent>
                                </Popover>
                                </div>
                            </div>
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
