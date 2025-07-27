
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
import { Separator } from "@/components/ui/separator";

const initialConnectionsState = {
    mapboxAutocomplete: {
        enabled: false,
        apiKey: '',
    },
}

function ConnectionsPage() {
    const { toast } = useToast();
    const [connections, setConnections] = useState(initialConnectionsState);

    useEffect(() => {
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            const parsedSaved = JSON.parse(savedConnections);
            // Deep merge to prevent crashes if saved data is outdated
            setConnections(prev => {
                const newState = { ...initialConnectionsState };
                if (parsedSaved.mapboxAutocomplete) {
                    newState.mapboxAutocomplete = { ...newState.mapboxAutocomplete, ...parsedSaved.mapboxAutocomplete };
                }
                return newState;
            });
        }
    }, []);

    const handleInputChange = (service: keyof typeof connections, field: string, value: string | boolean) => {
        setConnections(prev => ({
            ...prev,
            [service]: {
                ...prev[service],
                [field]: value
            }
        }));
    }

    const handleSaveChanges = () => {
        localStorage.setItem('apiConnections', JSON.stringify(connections));
        toast({
            title: "Connections Saved",
            description: "Your API connection settings have been saved.",
        });
    }

    return (
        <>
            <PageHeader title="API Connections">
                <Button onClick={handleSaveChanges}>Save Changes</Button>
            </PageHeader>
            <main className="p-4 sm:p-6 lg:p-8 space-y-8">
                 <Card>
                    <CardHeader>
                         <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline">Mapbox Address Autocomplete</CardTitle>
                                <CardDescription>Find and autocomplete delivery addresses.</CardDescription>
                            </div>
                            <Switch
                                checked={connections.mapboxAutocomplete.enabled}
                                onCheckedChange={(val) => handleInputChange('mapboxAutocomplete', 'enabled', val)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mapbox-key">Mapbox Public Access Token</Label>
                            <Input
                                id="mapbox-key"
                                placeholder="pk.ey..."
                                value={connections.mapboxAutocomplete.apiKey}
                                onChange={(e) => handleInputChange('mapboxAutocomplete', 'apiKey', e.target.value)}
                                disabled={!connections.mapboxAutocomplete.enabled}
                            />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

export default withAuth(ConnectionsPage, ['Admin'as UserRole]);
