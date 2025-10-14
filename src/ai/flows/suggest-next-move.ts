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

const GenerateNodeContentInputSchema = z.object({
    gameSeed: z.custom<GameSeed>(),
    personality: z.string(),
    nodeType: z.enum(['period', 'event', 'scene']),
    parentContext: z.object({
        name: z.string(),
        description: z.string(),
    }).optional(),
});
type GenerateNodeContentInput = z.infer<typeof GenerateNodeContentInputSchema>;

const GenerateNodeContentOutputSchema = z.object({
  name: z.string().describe('The creative name for the new node.'),
  description: z.string().describe('The creative description for the new node.'),
});
export type GenerateNodeContentOutput = z.infer<typeof GenerateNodeContentOutputSchema>;


export async function generateNodeContent(input: GenerateNodeContentInput): Promise<GenerateNodeContentOutput> {
  
  const generateContentFlow = ai.defineFlow(
    {
      name: 'generateContentFlow',
      inputSchema: GenerateNodeContentInputSchema,
      outputSchema: GenerateNodeContentOutputSchema,
    },
    async (input) => {
        const { gameSeed, personality, nodeType, parentContext } = input;
        
        const parentInfo = parentContext 
            ? `It should be a child of "${parentContext.name}" which is about: "${parentContext.description}".`
            : "This is the very first entry in the timeline.";

        const prompt = ai.definePrompt({
            name: 'generateNodeContentPrompt',
            input: { schema: GenerateNodeContentInputSchema },
            output: { schema: GenerateNodeContentOutputSchema },
            prompt: `You are an AI player with a "${personality}" personality in a collaborative storytelling game.
            Your task is to invent a creative name and a compelling description for a new ${nodeType}.
            
            The overall story guidelines are:
            BIG PICTURE: ${gameSeed.bigPicture}
            PALETTE (things to include): ${gameSeed.palette.join(', ')}
            BANNED (things to avoid): ${gameSeed.banned.join(', ')}

            The new ${nodeType} you are creating should fit into the timeline. ${parentInfo}

            Be creative and embody your "${personality}" personality in the content you create.
            Return your response in the specified JSON format with a 'name' and a 'description'.
            `,
        });

      const { output } = await prompt(input);
      return output!;
    }
  );
  
  return generateContentFlow(input);
}
