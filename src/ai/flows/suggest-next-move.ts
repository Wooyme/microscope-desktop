'use server';
/**
 * @fileOverview Suggests the next move for an AI player in the game.
 * 
 * - suggestNextMove - A function that suggests the next game move.
 * - SuggestNextMoveInput - The input type for the suggestNextMove function.
 * - SuggestNextMoveOutput - The return type for the suggestNextMove function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Narrative } from '@/lib/types';

export type SuggestNextMoveInput = Narrative;

const SuggestNextMoveOutputSchema = z.object({
  node: z.object({
    type: z.enum(['period', 'event', 'scene']),
    name: z.string().describe('The name of the new node.'),
    description: z.string().describe('A description for the new node.'),
    parentId: z.string().describe('The ID of the parent node to connect to. For a new Period, this can be another Period ID to connect to, or an empty string to create a root Period.'),
  }),
  reason: z.string().describe('The reasoning behind why this move was chosen.'),
});

export type SuggestNextMoveOutput = z.infer<typeof SuggestNextMoveOutputSchema>;

export async function suggestNextMove(input: SuggestNextMoveInput): Promise<SuggestNextMoveOutput> {
  const SuggestNextMoveInputSchema = z.custom<Narrative>();
  
  const suggestNextMoveFlow = ai.defineFlow(
    {
      name: 'suggestNextMoveFlow',
      inputSchema: SuggestNextMoveInputSchema,
      outputSchema: SuggestNextMoveOutputSchema,
    },
    async (narrative) => {
      const prompt = ai.definePrompt({
        name: 'suggestNextMovePrompt',
        input: { schema: SuggestNextMoveInputSchema },
        output: { schema: SuggestNextMoveOutputSchema },
        prompt: `You are an AI player in a collaborative storytelling game called Microscope.
        Your goal is to add to the shared timeline by creating a new Period, Event, or Scene.

        Here is the current state of the game:
        
        BIG PICTURE: {{gameSeed.bigPicture}}

        PALETTE (things to include):
        {{#each gameSeed.palette}}
        - {{this}}
        {{/each}}
        
        BANNED (things to avoid):
        {{#each gameSeed.banned}}
        - {{this}}
        {{/each}}

        FOCUS: {{focus}}

        EXISTING TIMELINE:
        {{#each periods}}
        Period: "{{this.name}}" (ID: {{this.id}}) - {{this.description}}
          {{#each this.events}}
          Event: "{{this.name}}" (ID: {{this.id}}) - {{this.description}}
            {{#each this.scenes}}
            Scene: "{{this.name}}" (ID: {{this.id}}) - {{this.description}}
            {{/each}}
          {{/each}}
        {{/each}}

        Your task is to suggest the *next* single node to add to the timeline.
        
        Rules for your move:
        1. You can only add ONE new node.
        2. Your new node must be a child of an existing node.
           - A new Period can be a child of an existing Period (creating a sequence).
           - A new Event must be a child of an existing Period.
           - A new Scene must be a child of an existing Event.
        3. Your addition should make sense in the context of the Big Picture, Palette, Banned items, and the existing timeline. If a Focus is set, prioritize adding something related to the Focus.
        4. Provide a creative name and a compelling description for the new node.
        5. If there are no periods, you must create a period. The parentId can be an empty string.
        6. If there are periods but no events, you should probably create an event.
        7. If there are events but no scenes, you should probably create a scene.
        8. Be creative and build upon what is already there.

        Based on the rules and the current timeline, decide what to add. Return your decision in the specified JSON format.
        `,
      });

      // If there are no nodes at all, create a root period.
      if (narrative.periods.length === 0) {
        const output = await ai.generate({
          prompt: `You are an AI player in a collaborative storytelling game called Microscope.
          The goal is to create a timeline. The timeline is currently empty.
          Your first task is to create the very first Period for the timeline.
          
          BIG PICTURE: ${narrative.gameSeed.bigPicture}
          PALETTE (things to include): ${narrative.gameSeed.palette.join(', ')}
          BANNED (things to avoid): ${narrative.gameSeed.banned.join(', ')}

          Invent a name and a description for the first Period.
          `,
          output: {
              schema: z.object({
                  name: z.string(),
                  description: z.string()
              })
          }
        });
        return {
          node: {
            type: 'period',
            name: output.output!.name,
            description: output.output!.description,
            parentId: '', // No parent for the first period
          },
          reason: 'The timeline was empty, so I created the first period to start things off.',
        };
      }

      const { output } = await prompt(narrative);
      return output!;
    }
  );
  
  return suggestNextMoveFlow(input);
}
