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
import { getMessages } from 'next-intl/server';

const CritiqueAndRegenerateInputSchema = z.object({
    personality: z.string(),
    nodeType: z.enum(['period', 'event', 'scene']),
    originalName: z.string(),
    originalDescription: z.string(),
    feedback: z.string(),
    locale: z.string(),
});
type CritiqueAndRegenerateInput = z.infer<typeof CritiqueAndRegenerateInputSchema>;

export type CritiqueAndRegenerateOutput = {
  name: string;
  description: string;
}

export async function critiqueAndRegenerate(input: CritiqueAndRegenerateInput): Promise<CritiqueAndRegenerateOutput> {
  const { locale } = input;
  const messages = await getMessages({locale});
  const t = (key: string) => messages.CritiqueAndRegenerateFlow[key] as string;

  const CritiqueAndRegenerateOutputSchema = z.object({
    name: z.string().describe(t('outputNameDescription')),
    description: z.string().describe(t('outputDescriptionDescription')),
  });
  
  const regenerateFlow = ai.defineFlow(
    {
      name: 'regenerateFlow',
      inputSchema: CritiqueAndegenerateInputSchema,
      outputSchema: CritiqueAndRegenerateOutputSchema,
    },
    async (flowInput) => {
        const { personality, nodeType, originalName, originalDescription, feedback } = flowInput;
        
        const promptText = t('prompt')
          .replace('{{personality}}', personality)
          .replace('{{nodeType}}', nodeType)
          .replace('{{originalName}}', originalName)
          .replace('{{originalDescription}}', originalDescription)
          .replace('{{feedback}}', feedback);

        const prompt = ai.definePrompt({
            name: 'regenerateContentPrompt',
            input: { schema: CritiqueAndRegenerateInputSchema },
            output: { schema: CritiqueAndRegenerateOutputSchema },
            prompt: promptText,
        });

      const { output } = await prompt(flowInput);
      return output!;
    }
  );
  
  return regenerateFlow(input);
}
