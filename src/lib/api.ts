

// A central place for all third-party API interactions.

import type { Order } from "./types";

// --- Mapbox Types ---
export interface MapboxSuggestion {
    name: string;
    mapbox_id: string;
    feature_type: string;
    address: string;
    full_address: string;
    place_formatted: string;
}

export interface MapboxAddressFeature {
    type: string;
    properties: {
        mapbox_id: string;
        feature_type: string;
        full_address: string;
        name: string;
        name_preferred: string;
        coordinates: {
            longitude: number;
            latitude: number;
            accuracy: string;
        };
        place_formatted: string;
        context: any; // Can be typed further if needed
        address_line1: string;
        postcode: string;
        place: string;
    };
    geometry: {
        type: string;
        coordinates: [number, number];
    };
}


// --- Mapbox API Functions ---

/**
 * Fetches address suggestions from the Mapbox Searchbox API.
 * @param query The user's search input.
 * @param accessToken Your Mapbox public access token.
 * @param sessionToken A unique token for the user's session.
 */
export const getMapboxSuggestions = async (
  query: string,
  accessToken: string,
  sessionToken: string
): Promise<MapboxSuggestion[]> => {
  if (query.length < 3) return [];
  
  const endpoint = `https://api.mapbox.com/search/searchbox/v1/suggest`;
  const params = new URLSearchParams({
    q: query,
    access_token: accessToken,
    session_token: sessionToken,
    country: 'GB',
    types: 'address,postcode,place'
  });

  try {
    const response = await fetch(`${endpoint}?${params}`);
    if (!response.ok) throw new Error("Failed to fetch suggestions");
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error fetching Mapbox suggestions:', error);
    return [];
  }
};

/**
 * Retrieves the full address details for a selected Mapbox suggestion.
 * @param mapboxId The ID of the suggestion from Mapbox.
 * @param accessToken Your Mapbox public access token.
 * @param sessionToken The unique token for the user's session.
 */
export const getMapboxAddressDetails = async (
  mapboxId: string,
  accessToken: string,
  sessionToken: string
): Promise<MapboxAddressFeature | null> => {
   const endpoint = `https://api.mapbox.com/search/searchbox/v1/retrieve/${mapboxId}`;
   const params = new URLSearchParams({
        access_token: accessToken,
        session_token: sessionToken,
    });
   
   try {
        const response = await fetch(`${endpoint}?${params}`);
        if(!response.ok) throw new Error("Failed to retrieve address details");
        const data = await response.json();
        return data.features?.[0] || null;
   } catch (error) {
       console.error('Error retrieving Mapbox address:', error);
       return null;
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

    