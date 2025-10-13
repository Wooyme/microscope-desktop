'use client';

import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

type TurnPanelProps = {
  onEndTurn: () => void;
  nodesCreatedThisTurn: number;
  maxNodesPerTurn: number;
  isAiTurn: boolean;
  isPlayerTurn: boolean;
};

export default function TurnPanel({ onEndTurn, nodesCreatedThisTurn, maxNodesPerTurn, isAiTurn, isPlayerTurn }: TurnPanelProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 p-2 bg-card/80 rounded-lg shadow-lg border border-border flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isPlayerTurn && <span>Nodes Created: {nodesCreatedThisTurn}/{maxNodesPerTurn}</span>}
        </div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <Button onClick={onEndTurn} disabled={isAiTurn || !isPlayerTurn}>
                            {isAiTurn ? "AI is thinking..." : "End Turn"}
                            {!isAiTurn && <ArrowRight className="ml-2" />}
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Pass the turn to the next player</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
}
