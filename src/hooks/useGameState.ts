import { useState, useCallback, useMemo } from 'react';
import { Node, Edge, addEdge, Connection } from '@xyflow/react';
import type { Player, LogEntry, GameSeed, SaveFile } from '@/lib/types';

export interface GameState {
  nodes: Node[];
  edges: Edge[];
  gameSeed: GameSeed;
  players: Player[];
  activePlayerIndex: number;
  nodesCreatedThisTurn: number;
  firstNodeThisTurnId: string | null;
  nodesAtTurnStart: Node[];
  historyLog: LogEntry[];
  focus: string;
  legacies: string[];
  isGodMode: boolean;
}

export function useGameState(
  initialNodes: Node[],
  initialGameSeed: GameSeed,
  initialPlayers: Player[],
  initialLegacy: string
) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [gameSeed, setGameSeed] = useState<GameSeed>(initialGameSeed);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [nodesCreatedThisTurn, setNodesCreatedThisTurn] = useState(0);
  const [firstNodeThisTurnId, setFirstNodeThisTurnId] = useState<string | null>(null);
  const [nodesAtTurnStart, setNodesAtTurnStart] = useState<Node[]>(initialNodes);
  const [historyLog, setHistoryLog] = useState<LogEntry[]>([]);
  const [focus, setFocus] = useState('');
  const [legacies, setLegacies] = useState<string[]>([initialLegacy]);
  const [isGodMode, setIsGodMode] = useState(false);

  const activePlayer = players[activePlayerIndex];
  const isHost = activePlayerIndex === 0;
  const inGodMode = isHost && isGodMode;

  const resetGame = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    setGameSeed(initialGameSeed);
    setPlayers(initialPlayers);
    setActivePlayerIndex(0);
    setNodesCreatedThisTurn(0);
    setFirstNodeThisTurnId(null);
    setNodesAtTurnStart(initialNodes);
    setHistoryLog([]);
    setFocus('');
    setLegacies([initialLegacy]);
  }, [initialNodes, initialGameSeed, initialPlayers, initialLegacy]);

  const loadGameState = useCallback((saved: SaveFile) => {
    setNodes(saved.nodes);
    setEdges(saved.edges);
    setGameSeed(saved.gameSeed);
    setPlayers(saved.players);
    setActivePlayerIndex(saved.activePlayerIndex);
    setNodesCreatedThisTurn(saved.nodesCreatedThisTurn);
    setFirstNodeThisTurnId(saved.firstNodeThisTurnId);
    setNodesAtTurnStart(saved.nodesAtTurnStart);
    setHistoryLog(saved.historyLog);
    setFocus(saved.focus);
    setLegacies(saved.legacies || []);
  }, []);

  const getSaveFile = useCallback(
    (nodeIdCounter: number): SaveFile => ({
      nodes,
      edges,
      gameSeed,
      players,
      activePlayerIndex,
      nodesCreatedThisTurn,
      firstNodeThisTurnId,
      nodesAtTurnStart,
      historyLog,
      focus,
      legacies,
      nodeIdCounter,
    }),
    [
      nodes,
      edges,
      gameSeed,
      players,
      activePlayerIndex,
      nodesCreatedThisTurn,
      firstNodeThisTurnId,
      nodesAtTurnStart,
      historyLog,
      focus,
      legacies,
    ]
  );

  return {
    // State
    nodes,
    edges,
    gameSeed,
    players,
    activePlayerIndex,
    nodesCreatedThisTurn,
    firstNodeThisTurnId,
    nodesAtTurnStart,
    historyLog,
    focus,
    legacies,
    isGodMode,
    activePlayer,
    isHost,
    inGodMode,
    
    // Setters
    setNodes,
    setEdges,
    setGameSeed,
    setPlayers,
    setActivePlayerIndex,
    setNodesCreatedThisTurn,
    setFirstNodeThisTurnId,
    setNodesAtTurnStart,
    setHistoryLog,
    setFocus,
    setLegacies,
    setIsGodMode,
    
    // Methods
    resetGame,
    loadGameState,
    getSaveFile,
  };
}
