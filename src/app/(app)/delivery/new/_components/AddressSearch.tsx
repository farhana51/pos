
'use client'

import React, { useRef, useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export type MapboxFeature = {
    id: string;
    place_name: string;
    text: string;
    context: {
        id: string;
        text: string;
    }[];
    geometry: {
        coordinates: [number, number];
    }
};

export type AddressDetails = {
    fullName: string;
    addressLine1: string;
    postcode: string;
    city: string;
    coordinates: [number, number];
}

interface AddressSearchProps {
    onAddressSelect: (details: AddressDetails) => void;
    config: { enabled: boolean; apiKey: string } | null;
}


const parseAddress = (feature: MapboxFeature): AddressDetails => {
    const addressLine1 = feature.text || '';
    let postcode = feature.context?.find(c => c.id.startsWith('postcode'))?.text || '';
    const city = feature.context?.find(c => c.id.startsWith('place'))?.text || '';
    
    // Sometimes the postcode is in the main text for specific address results
    if (!postcode && feature.place_name.match(/([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/)) {
        postcode = feature.place_name.match(/([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/)?.[0] || '';
    }

    return {
        fullName: feature.place_name,
        addressLine1,
        postcode,
        city,
        coordinates: feature.geometry.coordinates,
    };
};


export const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, config }) => {
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    const geocoderRef = useRef<any>(null); // To prevent re-initialization
    const [loadStatus, setLoadStatus] = useState<'loading' | 'loaded' | 'error'>('loading'); 
    
    useEffect(() => {
        if (!config || geocoderRef.current) return;
        if (!config.enabled || !config.apiKey) {
            setLoadStatus('error');
            return;
        }

        const loadScript = (id: string, src: string, onLoad: () => void) => {
            if (document.getElementById(id)) {
                if (onLoad) onLoad();
                return;
            }
            const script = document.createElement('script');
            script.id = id;
            script.src = src;
            script.async = true;
            script.onload = onLoad;
            script.onerror = () => {
                console.error(`Failed to load script: ${src}`);
                setLoadStatus('error');
            };
            document.body.appendChild(script);
        };

        try {
            if (!document.getElementById('mapbox-geocoder-css')) {
                const geocoderCss = document.createElement('link');
                geocoderCss.id = 'mapbox-geocoder-css';
                geocoderCss.rel = 'stylesheet';
                geocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css';
                document.head.appendChild(geocoderCss);
            }

            loadScript('mapbox-gl-js', 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js', () => {
                loadScript('mapbox-geocoder-js', 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js', () => {
                    if (!window.MapboxGeocoder) {
                        setLoadStatus('error');
                        return;
                    }
                    if (geocoderRef.current) return;

                    (window as any).mapboxgl.accessToken = config.apiKey;
                    
                    const geocoder = new (window as any).MapboxGeocoder({
                        accessToken: config.apiKey,
                        marker: false,
                        placeholder: 'Enter UK postcode and house number',
                        countries: 'GB',
                        types: 'address,postcode,place',
                        minLength: 2,
                        flyTo: false,
                    });

                    if (geocoderContainerRef.current) {
                        geocoderContainerRef.current.innerHTML = '';
                        geocoderContainerRef.current.appendChild(geocoder.onAdd());
                        setLoadStatus('loaded');
                    }
                    
                    geocoderRef.current = geocoder;

                    geocoder.on('result', (e: { result: MapboxFeature }) => {
                        const addressDetails = parseAddress(e.result);
                        onAddressSelect(addressDetails);
                    });

                    geocoder.on('error', (e: { error: any }) => {
                        console.error('A Geocoder error occurred:', e.error);
                        setLoadStatus('error');
                    });
                });
            });
        } catch (err) {
            console.error("An unexpected error occurred during setup:", err);
            setLoadStatus('error');
        }

    }, [config, onAddressSelect]);
    
    if (config === null) {
        return <Skeleton className="h-10 w-full" />;
    }
    
    if (!config.enabled) {
         return (
             <Alert>
                <Terminal className="h-4 w-4" />
                <AlertTitle>Autocomplete Disabled</AlertTitle>
                <AlertDescription>
                    Please enable the Mapbox Autocomplete feature in Admin &gt; Connections.
                </AlertDescription>
            </Alert>
        )
    }

    if (!config.apiKey) {
         return (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>API Key Missing</AlertTitle>
                <AlertDescription>
                   Please provide a Mapbox API key in Admin &gt; Connections.
                </AlertDescription>
            </Alert>
        )
    }
    
    if (loadStatus === 'error') {
         return (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Address Search</AlertTitle>
                <AlertDescription>
                   There was a problem loading the address finder. Please check your Mapbox API key and the browser console for more details.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div>
            {loadStatus === 'loading' && <Skeleton className="h-10 w-full" />}
            <div ref={geocoderContainerRef} style={{ display: loadStatus === 'loaded' ? 'block' : 'none' }} />
        </div>
    );
};
