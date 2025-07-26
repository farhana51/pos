
// A central place for all third-party API interactions.

export interface MapboxSuggestion {
    id: string;
    place_name: string;
    address: string;
    context: {
        id: string;
        text: string;
    }[];
}

/**
 * Fetches address suggestions from Mapbox.
 * @param query The search query (address or postcode).
 * @param apiKey Your Mapbox public access token.
 * @returns A promise that resolves to an array of suggestions.
 */
export const getMapboxSuggestions = async (query: string, apiKey: string): Promise<MapboxSuggestion[]> => {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?country=gb&access_token=${apiKey}&autocomplete=true`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Mapbox API error: ${response.statusText}`);
        }
        const data = await response.json();
        return data.features;
    } catch (error) {
        console.error("Error fetching Mapbox suggestions:", error);
        return [];
    }
};


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
