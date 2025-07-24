// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Recommends popular items to upsell based on the customer's current order.
 *
 * - getUpsellRecommendation - A function that provides an upsell recommendation based on the current order.
 * - UpsellRecommendationInput - The input type for the getUpsellRecommendation function.
 * - UpsellRecommendationOutput - The return type for the getUpsellRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const UpsellRecommendationInputSchema = z.object({
  itemsOrdered: z.array(z.string()).describe('A list of items the customer has already ordered.'),
});
export type UpsellRecommendationInput = z.infer<typeof UpsellRecommendationInputSchema>;

const UpsellRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('A suggestion of what to upsell to the customer.'),
  reason: z.string().describe('The reason for the suggested upsell recommendation.'),
  shouldSuggest: z.boolean().describe('Whether or not a suggestion should be made.'),
});
export type UpsellRecommendationOutput = z.infer<typeof UpsellRecommendationOutputSchema>;

export async function getUpsellRecommendation(input: UpsellRecommendationInput): Promise<UpsellRecommendationOutput> {
  return upsellRecommendationFlow(input);
}

const upsellRecommendationPrompt = ai.definePrompt({
  name: 'upsellRecommendationPrompt',
  input: {schema: UpsellRecommendationInputSchema},
  output: {schema: UpsellRecommendationOutputSchema},
  prompt: `You are an expert restaurant server, skilled at upselling.

  Given the customer has ordered the following items:
  {{#each itemsOrdered}}
  - {{{this}}}
  {{/each}}

  Suggest a popular item to upsell to the customer. Briefly explain your reasoning for the recommendation.

  If a suggestion has already been made in the last few minutes based on these items, indicate that no suggestion should be made.

  Return your response as a JSON object with the following structure:
  {
    "recommendation": "The item to upsell",
    "reason": "The reason for the recommendation",
    "shouldSuggest": true|false
  }`,
});

const upsellRecommendationFlow = ai.defineFlow(
  {
    name: 'upsellRecommendationFlow',
    inputSchema: UpsellRecommendationInputSchema,
    outputSchema: UpsellRecommendationOutputSchema,
  },
  async input => {
    const {output} = await upsellRecommendationPrompt(input);
    return output!;
  }
);
