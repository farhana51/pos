
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
import { Info } from "lucide-react";

// Represents the initial state of all possible connections.
// When adding a new service, define its default state here.
const initialConnectionsState = {
    // Example for a future connection:
    // someOtherService: {
    //     enabled: false,
    //     apiKey: '',
    // },
}

function ConnectionsPage() {
    const { toast } = useToast();
    // Since mapbox is removed, the connections state is now empty.
    const [connections, setConnections] = useState<typeof initialConnectionsState>({});

    useEffect(() => {
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
             // We'll keep this to handle potential future connections,
             // but it won't do anything for now.
            setConnections(JSON.parse(savedConnections));
        }
    }, []);

    const handleSaveChanges = () => {
        // This will save any future connections added.
        localStorage.setItem('apiConnections', JSON.stringify(connections));
        toast({
            title: "Settings Saved",
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
                        <CardTitle className="font-headline">Available Connections</CardTitle>
                        <CardDescription>Configure third-party API integrations for your application.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground h-48">
                        <Info className="w-12 h-12 mb-4" />
                        <p>There are no API connections to configure at this time.</p>
                        <p className="text-sm">Future integrations will appear here.</p>
                    </CardContent>
                </Card>
            </main>
        </>
    );
}

export default withAuth(ConnectionsPage, ['Admin'as UserRole]);
