import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import type { Player, LogEntry, GameSeed, CritiqueAndRegenerateOutput } from '@/lib/types';
import { determineAiMove, AiMove } from '@/lib/ai-strategies';
import { generateNodeContent } from '@/ai/flows/suggest-next-move';

export interface UseAiTurnOptions {
  nodes: Node[];
  edges: Edge[];
  historyLog: LogEntry[];
  gameSeed: GameSeed;
  locale: string;
  onSuccess: (move: AiMove, content: CritiqueAndRegenerateOutput) => void;
  onError: (error: Error) => void;
}

export function useAiTurn() {
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [aiMoveProposal, setAiMoveProposal] = useState<{
    move: AiMove;
    content: CritiqueAndRegenerateOutput;
  } | null>(null);

  const executeAiTurn = useCallback(async (
    activePlayer: Player,
    options: UseAiTurnOptions
  ) => {
    if (!activePlayer?.isAI || isAiTurn) return;

    setIsAiTurn(true);

    try {
      const move = determineAiMove(
        options.nodes,
        options.edges,
        options.historyLog,
        activePlayer.strategy
      );
      
      if (!move) {
        throw new Error('AI could not determine a valid move.');
      }

      const parentNode = options.nodes.find(n => n.id === move.parentId);
      const parentNodeData = parentNode?.data as
        | { name?: string; description?: string }
        | undefined;

      const content = await generateNodeContent({
        gameSeed: options.gameSeed,
        personality: activePlayer.personality || 'Neutral',
        nodeType: move.type as 'period' | 'event' | 'scene',
        locale: options.locale,
        parentContext: parentNodeData
          ? {
              name: parentNodeData.name || '',
              description: parentNodeData.description || '',
            }
          : undefined,
      });

      if (content) {
        setAiMoveProposal({ move, content });
        options.onSuccess(move, content);
      } else {
        throw new Error('AI failed to generate initial content.');
      }
    } catch (error) {
      options.onError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      // isAiTurn will be set to false when the review modal is closed or actioned
    }
  }, [isAiTurn]);

  const resetAiTurn = useCallback(() => {
    setIsAiTurn(false);
    setAiMoveProposal(null);
  }, []);

  return {
    isAiTurn,
    aiMoveProposal,
    executeAiTurn,
    resetAiTurn,
    setIsAiTurn,
    setAiMoveProposal,
  };
}
