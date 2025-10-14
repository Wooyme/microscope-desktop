'use client';

import { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';
import LegacyEditorModal from './legacy-editor-modal';

type LegacyPanelProps = {
  legacies: string[];
  setLegacies: (legacies: string[]) => void;
};

export default function LegacyPanel({ legacies, setLegacies }: LegacyPanelProps) {
  const t = useTranslations('LegacyPanel');
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Accordion type="single" collapsible defaultValue="item-1">
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="py-0" onClick={() => setIsModalOpen(true)}>
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{t('title')}</h3>
          </AccordionTrigger>
          <AccordionContent className="pt-2">
            <ScrollArea className="h-24 w-full rounded-md p-2 bg-background/50">
              <div onClick={() => setIsModalOpen(true)} className="cursor-pointer">
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
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <LegacyEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        legacies={legacies}
        setLegacies={setLegacies}
      />
    </div>
  );
}
