'use server'

import { getUpsellRecommendation as getUpsellRecommendationFlow, type UpsellRecommendationInput } from "@/ai/flows/upsell-recommendation";

export async function getUpsellRecommendationAction(input: UpsellRecommendationInput) {
    try {
        const result = await getUpsellRecommendationFlow(input);
        return result;
    } catch (error) {
        console.error("Error getting upsell recommendation:", error);
        return { 
            recommendation: "Not available",
            reason: "Could not fetch recommendation at this time.",
            shouldSuggest: false
        };
    }
}
