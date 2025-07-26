

// A central place for all third-party API interactions.

// Interface for the 'suggest' API response
export interface MapboxSuggestion {
    name: string;
    mapbox_id: string;
    address: string;
}

// Interface for the 'retrieve' API response feature
export interface MapboxAddressFeature {
    properties: {
        full_address: string;
        street: string;
        postcode: string;
        house_number: string;
        // Add other properties as needed
    };
    // Add other feature properties as needed
}

/**
 * Fetches address suggestions from Mapbox Searchbox API.
 * @param query The search query (address or postcode).
 * @param apiKey Your Mapbox public access token.
 * @param sessionToken A unique session token for this autocomplete session.
 * @returns A promise that resolves to an array of suggestions.
 */
export const getMapboxSuggestions = async (query: string, apiKey: string, sessionToken: string): Promise<MapboxSuggestion[]> => {
    const endpoint = `https://api.mapbox.com/search/searchbox/v1/suggest`;
    const params = new URLSearchParams({
        q: query,
        access_token: apiKey,
        session_token: sessionToken,
        country: 'GB',
        types: 'address,postcode',
    });

    try {
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) {
            throw new Error(`Mapbox Suggest API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.suggestions || [];
    } catch (error) {
        console.error("Error fetching Mapbox suggestions:", error);
        return [];
    }
};


/**
 * Retrieves the full details for a selected Mapbox address suggestion.
 * @param mapboxId The ID of the suggestion from the 'suggest' API call.
 * @param apiKey Your Mapbox public access token.
 * @param sessionToken The same session token used for the 'suggest' call.
 * @returns A promise that resolves to the full address feature.
 */
export const getMapboxAddressDetails = async (mapboxId: string, apiKey: string, sessionToken: string): Promise<MapboxAddressFeature | null> => {
    const endpoint = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}`;
    const params = new URLSearchParams({
        access_token: apiKey,
        session_token: sessionToken,
    });

    try {
        const response = await fetch(`${endpoint}?${params}`);
         if (!response.ok) {
            throw new Error(`Mapbox Retrieve API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.features && data.features.length > 0 ? data.features[0] : null;

    } catch (error) {
        console.error("Error retrieving Mapbox address:", error);
        return null;
    }
}


// --- Placeholder functions for other integrations ---

/**
 * Fetches new orders from the "Order Web" system.
 * @param config The API configuration for Order Web.
 */
export const getOrderWebOrders = async (config: { apiKey: string; apiUrl: string }) => {
    console.log("Checking for new orders from Order Web...", config.apiUrl);
    // Placeholder: In a real app, you would make a fetch call here.
    // e.g., const response = await fetch(`${config.apiUrl}/orders`, { headers: { 'Authorization': `Bearer ${config.apiKey}` } });
    // const orders = await response.json();
    // return orders;
    return [];
}

/**
 * Pushes a new order to a generic third-party ordering system.
 * @param config The API configuration for the third-party system.
 * @param order The order data to send.
 */
export const sendTo3rdPartyOrderSystem = async (config: { apiUrl: string }, order: any) => {
    console.log("Sending order to 3rd Party System...", config.apiUrl, order);
    // Placeholder: In a real app, you would make a fetch call here.
    // e.g., await fetch(config.apiUrl, { method: 'POST', body: JSON.stringify(order), headers: { 'Content-Type': 'application/json' } });
    return { success: true };
}
