'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Send } from 'lucide-react';
import { getInitials, cn } from '@/lib/utils';
import type { DialogueMessage } from '@/lib/types';
import { generateDialogueResponse } from '@/ai/flows/roleplay-dialogue';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

type RoleplayModalProps = {
  sceneName: string;
  sceneDescription: string;
  conversation: DialogueMessage[];
  onConversationChange: (conversation: DialogueMessage[]) => void;
};

const aiPersonalities = ["Creative", "Logical", "Chaotic", "Historian", "Pragmatist"];

export default function RoleplayModal({
  sceneName,
  sceneDescription,
  conversation,
  onConversationChange,
}: RoleplayModalProps) {
  const t = useTranslations('RoleplayModal');
  const t_general = useTranslations('General');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState(aiPersonalities[0]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [conversation]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: DialogueMessage = { role: 'user', content: input };
    const newConversation = [...conversation, userMessage];
    onConversationChange(newConversation);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateDialogueResponse({
        personality: selectedPersonality,
        sceneName,
        sceneDescription,
        history: newConversation,
        locale,
      });

      const aiMessage: DialogueMessage = { role: 'model', content: aiResponse };
      onConversationChange([...newConversation, aiMessage]);

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('errorDescription'),
      });
       // remove the user message if AI fails
       onConversationChange(conversation);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
       <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px] justify-between">
                    {t('aiPersonality')}: {t_general(selectedPersonality as any)}
                    <ChevronDown />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[180px]">
                {aiPersonalities.map(p => (
                    <DropdownMenuItem key={p} onClick={() => setSelectedPersonality(p)}>
                        {t_general(p as any)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-grow border rounded-md p-4 bg-muted/50" ref={scrollAreaRef}>
        <div className="space-y-4">
          {conversation.map((msg, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-3',
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {msg.role === 'model' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{getInitials(selectedPersonality)}</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 text-sm',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background'
                )}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>YOU</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-3 justify-start">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{getInitials(selectedPersonality)}</AvatarFallback>
                </Avatar>
                <div className="bg-background rounded-lg px-4 py-2 text-sm">
                    <Loader2 className="w-5 h-5 animate-spin" />
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="mt-4 flex items-center gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('startTyping')}
          className="flex-grow"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={isLoading}
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span className="sr-only">{t('sendMessage')}</span>
        </Button>
      </div>
    </div>
  );
}
