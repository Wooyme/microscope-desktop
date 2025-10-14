'use server';
/**
 * @fileOverview Regenerates creative content for a node based on user feedback.
 * 
 * - critiqueAndRegenerate - A function that takes a critique and regenerates content.
 * - CritiqueAndRegenerateInput - The input type for the function.
 * - CritiqueAndRegenerateOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CritiqueAndRegenerateInputSchema = z.object({
    personality: z.string(),
    nodeType: z.enum(['period', 'event', 'scene']),
    originalName: z.string(),
    originalDescription: z.string(),
    feedback: z.string(),
});
type CritiqueAndRegenerateInput = z.infer<typeof CritiqueAndRegenerateInputSchema>;

const CritiqueAndRegenerateOutputSchema = z.object({
  name: z.string().describe('The regenerated creative name for the node.'),
  description: z.string().describe('The regenerated creative description for the node.'),
});
export type CritiqueAndRegenerateOutput = z.infer<typeof CritiqueAndRegenerateOutputSchema>;

export async function critiqueAndRegenerate(input: CritiqueAndRegenerateInput): Promise<CritiqueAndRegenerateOutput> {
  
  const regenerateFlow = ai.defineFlow(
    {
      name: 'regenerateFlow',
      inputSchema: CritiqueAndRegenerateInputSchema,
      outputSchema: CritiqueAndRegenerateOutputSchema,
    },
    async (input) => {
        const { personality, nodeType, originalName, originalDescription, feedback } = input;
        
        const prompt = ai.definePrompt({
            name: 'regenerateContentPrompt',
            input: { schema: CritiqueAndRegenerateInputSchema },
            output: { schema: CritiqueAndRegenerateOutputSchema },
            prompt: `You are an AI player with a "${personality}" personality in a collaborative storytelling game.
            You previously suggested a new ${nodeType} with the name "${originalName}" and description "${originalDescription}".
            
            The user has provided the following feedback on your suggestion:
            "${feedback}"

            Your task is to regenerate the name and description for the ${nodeType}, taking this feedback into account.
            Embody your "${personality}" personality in the new content you create.
            Return your response in the specified JSON format with a new 'name' and 'description'.
            Do not repeat the original suggestion. Be creative and thoughtful in your revision.
            `,
        });

      const { output } = await prompt(input);
      return output!;
    }
  );
  
  return regenerateFlow(input);
}
