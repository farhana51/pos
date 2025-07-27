
'use client'

import React, { useRef, useEffect, useState } from 'react';

declare global {
    interface Window {
        mapboxgl: any;
        MapboxGeocoder: any;
    }
}

interface AddressSearchProps {
  apiKey: string;
  onAddressSelect: (address: any) => void;
}

const AddressSearch = ({ apiKey, onAddressSelect }: AddressSearchProps) => {
    const geocoderContainerRef = useRef<HTMLDivElement>(null);
    const geocoderRef = useRef<any>(null); // To prevent re-initialization
    const [loadStatus, setLoadStatus] = useState('loading'); // 'loading', 'loaded', 'error', 'disabled'

    useEffect(() => {
        if (!apiKey) {
            setLoadStatus('disabled');
            return;
        }
        
        // If the geocoder is already initialized, do nothing.
        if (geocoderRef.current) return;

        // --- SCRIPT AND STYLESHEET LOADING ---
        const loadScript = (id: string, src: string, onLoad: () => void) => {
            if (document.getElementById(id)) {
                 if (window.mapboxgl && window.MapboxGeocoder) {
                    onLoad();
                } else {
                    // Poll until the libraries are available
                    const interval = setInterval(() => {
                        if (window.mapboxgl && window.MapboxGeocoder) {
                            clearInterval(interval);
                            onLoad();
                        }
                    }, 100);
                }
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
            // Load Mapbox Geocoder CSS
            if (!document.getElementById('mapbox-geocoder-css')) {
                const geocoderCss = document.createElement('link');
                geocoderCss.id = 'mapbox-geocoder-css';
                geocoderCss.rel = 'stylesheet';
                geocoderCss.href = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css';
                document.head.appendChild(geocoderCss);
            }

            // Load Mapbox GL JS, then the Geocoder JS
            loadScript('mapbox-gl-js', 'https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js', () => {
                loadScript('mapbox-geocoder-js', 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js', () => {
                    if (geocoderRef.current) return;
                    
                    if (!window.mapboxgl || !window.MapboxGeocoder) {
                        console.error("Mapbox libraries not available on the window object.");
                        setLoadStatus('error');
                        return;
                    }
                    
                    window.mapboxgl.accessToken = apiKey;
                    
                    const geocoder = new window.MapboxGeocoder({
                        accessToken: window.mapboxgl.accessToken,
                        marker: false,
                        placeholder: 'Type a UK postcode and house number',
                        countries: 'GB',
                        flyTo: false
                    });

                    if (geocoderContainerRef.current) {
                        geocoderContainerRef.current.innerHTML = ''; 
                        geocoderContainerRef.current.appendChild(geocoder.onAdd());
                        setLoadStatus('loaded');
                    }
                    
                    geocoderRef.current = geocoder;

                    geocoder.on('result', (e: any) => {
                        const result = e.result;

                        // --- IMPROVED ADDRESS PARSING LOGIC ---
                        let houseNumber = result.address || '';
                        let roadName = result.text || '';
                        
                        // Handle cases where house number is in properties
                        if (result.properties && result.properties.address) {
                           if (!roadName.startsWith(result.properties.address)) {
                                houseNumber = result.properties.address;
                           }
                        }

                        // Handle cases where road name might include the house number
                        if (roadName.includes(houseNumber)) {
                           roadName = roadName.replace(houseNumber, '').trim().replace(/^,/, '').trim();
                        }
                        
                        const addressDetails = {
                            fullName: result.place_name || '',
                            houseNumber: houseNumber,
                            roadName: roadName,
                            postcode: result.context?.find((c: any) => c.id.startsWith('postcode'))?.text || '',
                            city: result.context?.find((c: any) => c.id.startsWith('place'))?.text || '',
                            country: 'United Kingdom',
                        };
                        onAddressSelect(addressDetails);
                    });

                    geocoder.on('clear', () => {
                        onAddressSelect({
                            fullName: '',
                            houseNumber: '',
                            roadName: '',
                            postcode: '',
                            city: '',
                            country: 'United Kingdom',
                        });
                    });
                    
                    geocoder.on('error', (e: any) => {
                        console.error('A Geocoder error occurred:', e.error);
                        setLoadStatus('error');
                    });
                });
            });
        } catch (err) {
            console.error("An unexpected error occurred during setup:", err);
            setLoadStatus('error');
        }

    }, [apiKey, onAddressSelect]);

    return (
        <div>
            <div ref={geocoderContainerRef} style={{ display: loadStatus === 'loaded' ? 'block' : 'none' }} />
            {loadStatus === 'loading' && <p className="text-sm text-muted-foreground">Loading address search...</p>}
            {loadStatus === 'disabled' && <p className="text-sm text-yellow-500">Autocomplete disabled. Please provide a valid API key.</p>}
            {loadStatus === 'error' && <p className="text-sm text-destructive">Error loading address search. Check console for details (F12). The API key might be invalid or restricted.</p>}
        </div>
    );
};

export default AddressSearch;
