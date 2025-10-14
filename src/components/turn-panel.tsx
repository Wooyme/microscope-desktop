'use client';

import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import { useTranslations } from 'next-intl';

type TurnPanelProps = {
  onEndTurn: () => void;
  nodesCreatedThisTurn: number;
  maxNodesPerTurn: number;
  isAiTurn: boolean;
  isPlayerTurn: boolean;
};

export default function TurnPanel({ onEndTurn, nodesCreatedThisTurn, maxNodesPerTurn, isAiTurn, isPlayerTurn }: TurnPanelProps) {
  const t = useTranslations('TurnPanel');
  return (
    <div className="absolute bottom-4 right-4 z-10 p-2 bg-card/80 rounded-lg shadow-lg border border-border flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isPlayerTurn && <span>{t('nodesCreated', { count: nodesCreatedThisTurn, max: maxNodesPerTurn })}</span>}
        </div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <Button onClick={onEndTurn} disabled={isAiTurn || !isPlayerTurn}>
                            {isAiTurn ? t('aiThinking') : t('endTurn')}
                            {!isAiTurn && <ArrowRight className="ml-2" />}
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{t('endTurnTooltip')}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
}
