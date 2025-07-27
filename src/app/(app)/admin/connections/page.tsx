
'use client'

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import withAuth from "@/components/withAuth";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Info, Map } from "lucide-react";
import AddressSearch from "./_components/AutoAddress";


const initialConnectionsState = {
    mapbox: {
        enabled: true,
        apiKey: '',
    },
}

function ConnectionsPage() {
    const { toast } = useToast();
    const [connections, setConnections] = useState(initialConnectionsState);
    const [addressPreview, setAddressPreview] = useState('');

    useEffect(() => {
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            const parsed = JSON.parse(savedConnections);
            setConnections({ ...initialConnectionsState, ...parsed, mapbox: { ...initialConnectionsState.mapbox, ...parsed.mapbox }});
        }
    }, []);

    const handleSwitchChange = (service: keyof typeof initialConnectionsState, checked: boolean) => {
        setConnections(prev => ({
            ...prev,
            [service]: { ...prev[service], enabled: checked }
        }));
    };

    const handleInputChange = (service: keyof typeof initialConnectionsState, value: string) => {
        setConnections(prev => ({
            ...prev,
            [service]: { ...prev[service], apiKey: value }
        }));
    };

    const handleSaveChanges = () => {
        localStorage.setItem('apiConnections', JSON.stringify(connections));
        window.dispatchEvent(new Event('storage'));
        toast({
            title: "Settings Saved",
            description: "Your API connection settings have been saved.",
        });
    }
    
    const handleAddressSelect = (address: any) => {
        if (address.fullName) {
            setAddressPreview(address.fullName);
            toast({
                title: "Address Selected",
                description: `Test successful: ${address.fullName}`,
            });
        } else {
            setAddressPreview('');
        }
    }

    return (
        <>
            <PageHeader title="API Connections">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </PageHeader>
            <main className="p-4 sm:p-6 lg:p-8 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Map/> Mapbox Auto Address</CardTitle>
                        <CardDescription>Enable address autocomplete for delivery orders using Mapbox.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="mapbox-enabled" className="text-base">Enable Address Autocomplete</Label>
                                <p className="text-sm text-muted-foreground">Turn this feature on or off for the new delivery order form.</p>
                            </div>
                            <Switch 
                                id="mapbox-enabled" 
                                checked={connections.mapbox.enabled} 
                                onCheckedChange={(checked) => handleSwitchChange('mapbox', checked)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mapbox-key">Mapbox Public Access Token</Label>
                            <Input 
                                id="mapbox-key" 
                                type="text"
                                placeholder="pk.eyJ1..."
                                value={connections.mapbox.apiKey}
                                onChange={(e) => handleInputChange('mapbox', e.target.value)}
                            />
                        </div>

                        {connections.mapbox.enabled && (
                            <div className="border-t pt-4">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Live Preview</h3>
                                <div className="p-4 border rounded-md space-y-4">
                                    <AddressSearch 
                                        apiKey={connections.mapbox.apiKey}
                                        onAddressSelect={handleAddressSelect}
                                    />
                                    {addressPreview && (
                                        <div className="text-sm text-muted-foreground bg-secondary p-2 rounded-md">
                                            <span className="font-semibold">Selected:</span> {addressPreview}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

export default withAuth(ConnectionsPage, ['Admin'as UserRole]);
