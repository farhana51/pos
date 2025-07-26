
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
    orderWeb: {
        enabled: false,
        apiKey: '',
        apiUrl: ''
    },
    mapbox: {
        enabled: false,
        apiKey: ''
    },
    thirdPartyOrder: {
        enabled: false,
        apiUrl: ''
    }
}

function ConnectionsPage() {
    const { toast } = useToast();
    const [connections, setConnections] = useState(initialConnectionsState);

    useEffect(() => {
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            setConnections(JSON.parse(savedConnections));
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
                                <CardTitle className="font-headline">Order Web</CardTitle>
                                <CardDescription>Connect to your online ordering system.</CardDescription>
                            </div>
                            <Switch
                                checked={connections.orderWeb.enabled}
                                onCheckedChange={(val) => handleInputChange('orderWeb', 'enabled', val)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orderweb-apikey">API Key</Label>
                            <Input
                                id="orderweb-apikey"
                                placeholder="Enter Order Web API Key"
                                value={connections.orderWeb.apiKey}
                                onChange={(e) => handleInputChange('orderWeb', 'apiKey', e.target.value)}
                                disabled={!connections.orderWeb.enabled}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orderweb-apiurl">API URL</Label>
                            <Input
                                id="orderweb-apiurl"
                                placeholder="https://api.orderweb.com/v1"
                                value={connections.orderWeb.apiUrl}
                                onChange={(e) => handleInputChange('orderWeb', 'apiUrl', e.target.value)}
                                disabled={!connections.orderWeb.enabled}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline">Mapbox</CardTitle>
                                <CardDescription>For address lookup and delivery route optimization.</CardDescription>
                            </div>
                            <Switch
                                checked={connections.mapbox.enabled}
                                onCheckedChange={(val) => handleInputChange('mapbox', 'enabled', val)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mapbox-apikey">Public Access Token</Label>
                            <Input
                                id="mapbox-apikey"
                                placeholder="pk.ey..."
                                value={connections.mapbox.apiKey}
                                onChange={(e) => handleInputChange('mapbox', 'apiKey', e.target.value)}
                                disabled={!connections.mapbox.enabled}
                            />
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                         <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline">3rd Party Order Integration</CardTitle>
                                <CardDescription>Connect to a generic third-party order system.</CardDescription>
                            </div>
                            <Switch
                                checked={connections.thirdPartyOrder.enabled}
                                onCheckedChange={(val) => handleInputChange('thirdPartyOrder', 'enabled', val)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="3rdparty-apiurl">Webhook/API URL</Label>
                            <Input
                                id="3rdparty-apiurl"
                                placeholder="https://api.thirdparty.com/new_order"
                                value={connections.thirdPartyOrder.apiUrl}
                                onChange={(e) => handleInputChange('thirdPartyOrder', 'apiUrl', e.target.value)}
                                disabled={!connections.thirdPartyOrder.enabled}
                            />
                        </div>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

export default withAuth(ConnectionsPage, ['Admin' as UserRole]);
