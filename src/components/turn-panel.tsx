'use client';

import { Button } from './ui/button';
import { ArrowRight, User } from 'lucide-react';
import type { Player } from '@/lib/types';
import { Avatar, AvatarFallback } from './ui/avatar';
import { getInitials } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

type TurnPanelProps = {
  onEndTurn: () => void;
  nextPlayer: Player | undefined;
  nodesCreatedThisTurn: number;
  maxNodesPerTurn: number;
};

export default function TurnPanel({ onEndTurn, nextPlayer, nodesCreatedThisTurn, maxNodesPerTurn }: TurnPanelProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 p-2 bg-card/80 rounded-lg shadow-lg border border-border flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Nodes Created: {nodesCreatedThisTurn}/{maxNodesPerTurn}</span>
        </div>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button onClick={onEndTurn}>
                        End Turn
                        <ArrowRight className="ml-2" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Pass the turn to the next player</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Next:</span>
        {nextPlayer ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarFallback>{getInitials(nextPlayer.name)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-semibold text-foreground">{nextPlayer.name}</span>
          </div>
        ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>No other players</span>
            </div>
        )}
      </div>
    </div>
  );
}
