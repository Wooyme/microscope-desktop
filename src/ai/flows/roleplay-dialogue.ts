'use server';
/**
 * @fileOverview A flow for generating AI responses in a role-playing dialogue.
 * 
 * - generateDialogueResponse - A function that generates an AI response in a conversation.
 * - GenerateDialogueResponseInput - The input type for the function.
 * - GenerateDialogueResponseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getMessages } from 'next-intl/server';

const DialogueMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const GenerateDialogueResponseInputSchema = z.object({
  personality: z.string(),
  sceneName: z.string(),
  sceneDescription: z.string(),
  history: z.array(DialogueMessageSchema),
  locale: z.string(),
});
export type GenerateDialogueResponseInput = z.infer<typeof GenerateDialogueResponseInputSchema>;
export type GenerateDialogueResponseOutput = string;

export async function generateDialogueResponse(input: GenerateDialogueResponseInput): Promise<GenerateDialogueResponseOutput> {
  const { locale } = input;
  const messages = await getMessages({ locale });
  const t = (key: string) => messages.RoleplayDialogueFlow[key] as string;

  const generateResponseFlow = ai.defineFlow(
    {
      name: 'generateResponseFlow',
      inputSchema: GenerateDialogueResponseInputSchema,
      outputSchema: z.string(),
    },
    async (flowInput) => {
      const { personality, sceneName, sceneDescription, history } = flowInput;

      const promptText = t('prompt')
        .replace('{{personality}}', personality)
        .replace('{{sceneName}}', sceneName)
        .replace('{{sceneDescription}}', sceneDescription);

      const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: promptText,
        history: history,
      });

      return output.text;
    }
  );

  return generateResponseFlow(input);
}
