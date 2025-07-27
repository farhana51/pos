
'use client'

import React, { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Loader2, Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export type MapboxFeature = {
    id: string;
    place_name: string;
    text: string;
    context: {
        id: string;
        text: string;
    }[];
};

export type AddressDetails = {
    fullName: string;
    addressLine1: string;
    postcode: string;
    city: string;
}

interface AddressSearchProps {
    onAddressSelect: (details: AddressDetails) => void;
    initialQuery?: string;
}

const parseAddress = (feature: MapboxFeature): AddressDetails => {
    const addressLine1 = feature.place_name.split(',')[0] || '';
    const postcode = feature.context?.find(c => c.id.startsWith('postcode'))?.text || '';
    const city = feature.context?.find(c => c.id.startsWith('place'))?.text || '';

    return {
        fullName: feature.place_name,
        addressLine1,
        postcode,
        city,
    };
};

export const AddressSearch: React.FC<AddressSearchProps> = ({ onAddressSelect, initialQuery = '' }) => {
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    
    const [config, setConfig] = useState<{enabled: boolean, apiKey: string} | null>(null);
    const debouncedQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        const savedConnections = localStorage.getItem('apiConnections');
        if (savedConnections) {
            const parsed = JSON.parse(savedConnections);
            if(parsed.mapboxAutocomplete) {
                setConfig(parsed.mapboxAutocomplete);
            }
        }
    }, []);

    useEffect(() => {
        if (debouncedQuery.length > 2 && config?.enabled && config.apiKey) {
            setIsLoading(true);
            setError(null);
            fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery)}.json?country=GB&types=address,postcode&access_token=${config.apiKey}`)
                .then(res => res.json())
                .then(data => {
                    if (data.features) {
                        setSuggestions(data.features);
                    } else if (data.message) {
                        setError(`Mapbox API Error: ${data.message}`);
                    }
                })
                .catch(err => setError(`Network error: ${err.message}`))
                .finally(() => setIsLoading(false));
        } else {
            setSuggestions([]);
        }
    }, [debouncedQuery, config]);

    const handleSelect = (feature: MapboxFeature) => {
        const details = parseAddress(feature);
        setSearchQuery(details.addressLine1);
        onAddressSelect(details);
        setIsPopoverOpen(false);
    };
    
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

    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverAnchor asChild>
                <Input
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if(!isPopoverOpen) setIsPopoverOpen(true);
                    }}
                    placeholder="Start typing an address or postcode..."
                    className="w-full"
                    autoComplete="off"
                />
            </PopoverAnchor>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                <Command>
                     <CommandList>
                        {isLoading && (
                            <div className="p-4 flex items-center justify-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        )}
                        {error && <CommandEmpty>{error}</CommandEmpty>}
                        {!isLoading && !error && suggestions.length === 0 && debouncedQuery.length > 2 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}
                        <CommandGroup>
                            {suggestions.map((feature) => (
                                <CommandItem key={feature.id} onSelect={() => handleSelect(feature)} value={feature.place_name}>
                                    {feature.place_name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                     </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
