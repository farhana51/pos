
'use client'

import React, { useRef, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export type AddressDetails = {
    fullName: string;
    addressLine1: string;
    postcode: string;
    city: string;
}

interface AddressSearchProps {
    onAddressSelect: (details: AddressDetails) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect }) => {
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    const geocoderRef = useRef<any>(null);

    const [isAutocompleteEnabled, setIsAutocompleteEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        let isEnabled = false;
        let apiKey: string | null = null;
        
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            const parsed = JSON.parse(savedConnections);
            if (parsed.mapboxAutocomplete) {
                isEnabled = parsed.mapboxAutocomplete.enabled;
                apiKey = parsed.mapboxAutocomplete.apiKey;
            }
        }
        
        setIsAutocompleteEnabled(isEnabled);
        setIsLoading(false);

        if (!isEnabled || !apiKey || !geocoderContainerRef.current) {
            return;
        }

        const geocoderCss = document.createElement('link');
        geocoderCss.rel = 'stylesheet';
        geocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css';
        geocoderCss.type = 'text/css';
        document.head.appendChild(geocoderCss);

        const mapboxScript = document.createElement('script');
        mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
        mapboxScript.async = true;
        document.body.appendChild(mapboxScript);

        mapboxScript.onload = () => {
            const geocoderScript = document.createElement('script');
            geocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js';
            geocoderScript.async = true;
            document.body.appendChild(geocoderScript);

            geocoderScript.onload = () => {
                if (geocoderRef.current || !geocoderContainerRef.current) return;
                
                // @ts-ignore
                window.mapboxgl.accessToken = apiKey;
                
                // @ts-ignore
                const geocoder = new window.MapboxGeocoder({
                    accessToken: apiKey,
                    marker: false,
                    placeholder: 'Type a UK postcode and house number',
                    countries: 'GB',
                    types: 'address,postcode,place'
                });
                
                geocoderContainerRef.current.innerHTML = '';
                geocoderContainerRef.current.appendChild(geocoder.onAdd());
                
                geocoderRef.current = geocoder;

                geocoder.on('result', (e: any) => {
                    const { result } = e;
                    const addressDetails: AddressDetails = {
                        fullName: result.place_name,
                        addressLine1: `${result.address ? result.address + ' ' : ''}${result.text}`,
                        postcode: result.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
                        city: result.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
                    };
                    onAddressSelect(addressDetails);
                    geocoder.clear();
                });
            };
        };

        return () => {
             if (geocoderRef.current) {
                 try {
                    geocoderRef.current.onRemove();
                 } catch (e) {
                    console.error("Could not remove geocoder:", e);
                 }
                 geocoderRef.current = null;
             }
             if (geocoderContainerRef.current) {
                geocoderContainerRef.current.innerHTML = '';
             }
        };

    }, [onAddressSelect]);

    if (isLoading) {
        return <div className="h-10 w-full bg-muted rounded-md animate-pulse" />;
    }

    if (!isAutocompleteEnabled) {
        return (
            <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Autocomplete Disabled</AlertTitle>
                <AlertDescription>
                    Please enable the Mapbox Autocomplete feature and provide an API key in Admin &gt; Connections.
                </AlertDescription>
            </Alert>
        );
    }
    
    return <div ref={geocoderContainerRef} className="[&_.mapboxgl-ctrl-geocoder]:w-full [&_.mapboxgl-ctrl-geocoder]:max-w-none" />;
};
