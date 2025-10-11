'use server';

/**
 * @fileOverview Suggests potential new Legacies by analyzing existing Periods, Events, and Legacies.
 *
 * - suggestNewLegacies - A function that suggests new legacies.
 * - SuggestNewLegaciesInput - The input type for the suggestNewLegacies function.
 * - SuggestNewLegaciesOutput - The return type for the suggestNewLegacies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNewLegaciesInputSchema = z.object({
  periods: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the period.'),
      name: z.string().describe('The name of the period.'),
      description: z.string().describe('A description of the period.'),
    })
  ).describe('A list of existing periods.'),
  events: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the event.'),
      name: z.string().describe('The name of the event.'),
      description: z.string().describe('A description of the event.'),
    })
  ).describe('A list of existing events.'),
  legacies: z.array(
    z.object({
      id: z.string().describe('The unique identifier of the legacy.'),
      source: z.string().describe('The source node of the legacy.'),
      target: z.string().describe('The target node of the legacy.'),
      description: z.string().describe('A description of the legacy.'),
    })
  ).describe('A list of existing legacies.'),
});
export type SuggestNewLegaciesInput = z.infer<typeof SuggestNewLegaciesInputSchema>;

const SuggestNewLegaciesOutputSchema = z.array(
  z.object({
    source: z.string().describe('The suggested source node for the new legacy.'),
    target: z.string().describe('The suggested target node for the new legacy.'),
    reason: z.string().describe('The reasoning behind the suggested legacy.'),
  })
).describe('A list of suggested new legacies.');
export type SuggestNewLegaciesOutput = z.infer<typeof SuggestNewLegaciesOutputSchema>;

export async function suggestNewLegacies(input: SuggestNewLegaciesInput): Promise<SuggestNewLegaciesOutput> {
  return suggestNewLegaciesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNewLegaciesPrompt',
  input: {schema: SuggestNewLegaciesInputSchema},
  output: {schema: SuggestNewLegaciesOutputSchema},
  prompt: `You are an AI assistant helping a user create a game session.

  Given the existing periods, events, and legacies, suggest potential new legacies that could connect these elements.
  Explain the reasoning behind each suggested legacy.

  Periods:
  {{#each periods}}
  - Id: {{this.id}}, Name: {{this.name}}, Description: {{this.description}}
  {{/each}}

  Events:
  {{#each events}}
  - Id: {{this.id}}, Name: {{this.name}}, Description: {{this.description}}
  {{/each}}

  Legacies:
  {{#each legacies}}
  - Source: {{this.source}}, Target: {{this.target}}, Description: {{this.description}}
  {{/each}}

  Suggest new legacies in JSON format:
  `, 
});

const suggestNewLegaciesFlow = ai.defineFlow(
  {
    name: 'suggestNewLegaciesFlow',
    inputSchema: SuggestNewLegaciesInputSchema,
    outputSchema: SuggestNewLegaciesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
