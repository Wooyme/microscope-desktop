'use server';
/**
 * @fileOverview Generates the creative content (name and description) for a new node.
 * 
 * - generateNodeContent - A function that generates creative content for a new game node.
 * - GenerateNodeContentInput - The input type for the generateNodeContent function.
 * - GenerateNodeContentOutput - The return type for the generateNodeContent function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { GameSeed } from '@/lib/types';
import { getMessages } from 'next-intl/server';

const GenerateNodeContentInputSchema = z.object({
    gameSeed: z.custom<GameSeed>(),
    personality: z.string(),
    nodeType: z.enum(['period', 'event', 'scene']),
    locale: z.string(),
    parentContext: z.object({
        name: z.string(),
        description: z.string(),
    }).optional(),
});
type GenerateNodeContentInput = z.infer<typeof GenerateNodeContentInputSchema>;

export type GenerateNodeContentOutput = {
  name: string;
  description: string;
};


export async function generateNodeContent(input: GenerateNodeContentInput): Promise<GenerateNodeContentOutput> {
  const { locale } = input;
  const messages = await getMessages({locale});
  const t = (key: string) => messages.SuggestNextMoveFlow[key] as string;

  const GenerateNodeContentOutputSchema = z.object({
    name: z.string().describe(t('outputNameDescription')),
    description: z.string().describe(t('outputDescriptionDescription')),
  });
  
  const generateContentFlow = ai.defineFlow(
    {
      name: 'generateContentFlow',
      inputSchema: GenerateNodeContentInputSchema,
      outputSchema: GenerateNodeContentOutputSchema,
    },
    async (flowInput) => {
        const { gameSeed, personality, nodeType, parentContext } = flowInput;
        
        const parentInfo = parentContext 
            ? t('parentInfo').replace('{{parentName}}', parentContext.name).replace('{{parentDescription}}', parentContext.description)
            : t('noParentInfo');

        const promptText = t('prompt')
            .replace('{{personality}}', personality)
            .replace('{{nodeType}}', nodeType)
            .replace('{{bigPicture}}', gameSeed.bigPicture)
            .replace('{{palette}}', gameSeed.palette.join(', '))
            .replace('{{banned}}', gameSeed.banned.join(', '))
            .replace('{{parentInfo}}', parentInfo);

        const prompt = ai.definePrompt({
            name: 'generateNodeContentPrompt',
            input: { schema: GenerateNodeContentInputSchema },
            output: { schema: GenerateNodeContentOutputSchema },
            prompt: promptText,
        });

      const { output } = await prompt(flowInput);
      return output!;
    }
  );
  
  return generateContentFlow(input);
}
