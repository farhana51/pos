

// A central place for all third-party API interactions.
export interface MapboxSuggestion {
    id: string;
    place_name: string;
    // Add other properties from the Mapbox API response as needed
}


export const getMapboxSuggestions = async (query: string, accessToken: string): Promise<MapboxSuggestion[]> => {
    if (query.length < 3) return [];

    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`;
    const params = new URLSearchParams({
        access_token: accessToken,
        country: 'GB',
        types: 'address,postcode,place',
        autocomplete: 'true',
        limit: '5',
    });

    try {
        const response = await fetch(`${endpoint}?${params}`);
        if (!response.ok) throw new Error('Failed to fetch from Mapbox');
        const data = await response.json();
        return data.features || [];
    } catch (error) {
        console.error('Error fetching Mapbox suggestions:', error);
        return [];
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
