'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';

type LegacyPanelProps = {
  legacies: string[];
};

export default function LegacyPanel({ legacies }: LegacyPanelProps) {
  const t = useTranslations('LegacyPanel');

  return (
    <div>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="py-0">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{t('title')}</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <ScrollArea className="h-24 w-full rounded-md border p-2 bg-background/50">
              {legacies.length > 0 ? (
                <ul className="space-y-1">
                  {legacies.map((legacy, index) => (
                    <li key={index} className="text-sm text-foreground">
                      - {legacy}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">{t('noLegacies')}</p>
              )}
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
