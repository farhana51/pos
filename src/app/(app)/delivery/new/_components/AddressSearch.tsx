
'use client'

import React, { useRef, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

declare global {
  interface Window {
    mapboxgl: any;
    MapboxGeocoder: any;
  }
}

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
    const [loadStatus, setLoadStatus] = useState<'loading' | 'loaded' | 'error' | 'disabled'>('loading');
    
    useEffect(() => {
        if (geocoderRef.current) return;

        const savedConnections = localStorage.getItem('apiConnections');
        let apiKey: string | null = null;
        if (savedConnections) {
            const parsed = JSON.parse(savedConnections);
            if (parsed.mapboxAutocomplete && parsed.mapboxAutocomplete.enabled && parsed.mapboxAutocomplete.apiKey) {
                apiKey = parsed.mapboxAutocomplete.apiKey;
            }
        }

        if (!apiKey) {
            setLoadStatus('disabled');
            return;
        }

        try {
            const geocoderCss = document.createElement('link');
            geocoderCss.id = 'mapbox-geocoder-css';
            geocoderCss.rel = 'stylesheet';
            geocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css';
            document.head.appendChild(geocoderCss);

            const mapboxScript = document.createElement('script');
            mapboxScript.id = 'mapbox-gl-js';
            mapboxScript.src = 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js';
            mapboxScript.async = true;
            document.body.appendChild(mapboxScript);

            mapboxScript.onload = () => {
                const geocoderScript = document.createElement('script');
                geocoderScript.id = 'mapbox-geocoder-js';
                geocoderScript.src = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js';
                geocoderScript.async = true;
                document.body.appendChild(geocoderScript);

                geocoderScript.onload = () => {
                    if (!window.MapboxGeocoder) {
                        console.error("Mapbox Geocoder script loaded, but MapboxGeocoder is not available.");
                        setLoadStatus('error');
                        return;
                    }
                    
                    window.mapboxgl.accessToken = apiKey;
                    
                    const geocoder = new window.MapboxGeocoder({
                        accessToken: window.mapboxgl.accessToken,
                        marker: false,
                        placeholder: 'Enter UK postcode and house number',
                        countries: 'GB',
                        types: 'address,postcode,place'
                    });

                    if (geocoderContainerRef.current) {
                        geocoderContainerRef.current.innerHTML = '';
                        geocoderContainerRef.current.appendChild(geocoder.onAdd());
                        setLoadStatus('loaded');
                    }
                    
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

                    geocoder.on('error', (e: any) => {
                        console.error('Geocoder Error:', e.error);
                        setLoadStatus('error');
                    });
                };
            };
        } catch (err) {
            console.error("Failed to load Mapbox scripts:", err);
            setLoadStatus('error');
        }

        return () => {
            document.getElementById('mapbox-geocoder-css')?.remove();
            document.getElementById('mapbox-gl-js')?.remove();
            document.getElementById('mapbox-geocoder-js')?.remove();
        };

    }, [onAddressSelect]);

    if (loadStatus === 'loading') {
        return <Skeleton className="h-10 w-full" />;
    }

    if (loadStatus === 'disabled') {
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

    if (loadStatus === 'error') {
         return (
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Address Search</AlertTitle>
                <AlertDescription>
                   Could not load the address search component. Please check the browser console (F12) for more details. The API key may be invalid or restricted.
                </AlertDescription>
            </Alert>
        );
    }
    
    return <div ref={geocoderContainerRef} className="[&_.mapboxgl-ctrl-geocoder]:w-full [&_.mapboxgl-ctrl-geocoder]:max-w-none" style={{ display: loadStatus === 'loaded' ? 'block' : 'none' }} />;
};
