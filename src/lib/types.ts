import { Node, Edge } from "@xyflow/react";

export type Period = {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    position: { x: number, y: number };
};
  
export type Event = {
    id:string;
    name: string;
    description:string;
    imageUrl?: string;
    position: { x: number, y: number };
};

export type DialogueMessage = {
    role: 'user' | 'model';
    content: string;
};

export type Scene = {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    position: { x: number, y: number };
    mode?: 'description' | 'roleplay';
    conversation?: DialogueMessage[];
};
  
export type Legacy = {
    id: string;
    source: string;
    target: string;
    description: string;
};

export type History = {
    gameSeed: GameSeed;
    periods: Period[];
    events: Event[];
    scenes: Scene[];
    legacies: Legacy[];
};

export type AiStrategy = 'Balanced' | 'Builder' | 'Detailer' | 'Focuser';

export type Player = {
  id: string;
  name: string;
  isAI?: boolean;
  personality?: string;
  strategy?: AiStrategy;
};

export type LogEntry = {
    playerId: string;
    playerName: string;
    summary: string;
    timestamp: string;
    addedNodeIds: string[];
}

export interface GameSeed {
  bigPicture: string;
  palette: string[];
  banned: string[];
}

export type SaveFile = {
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
    nodeIdCounter: number;
}

export type CritiqueAndRegenerateOutput = {
    name: string;
    description: string;
}
