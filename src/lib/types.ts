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
    description: string;
    imageUrl?: string;
    position: { x: number, y: number };
};

export type Scene = {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    position: { x: number, y: number };
};
  
export type Legacy = {
    id: string;
    source: string;
    target: string;
    description: string;
};

export type History = {
    periods: Period[];
    events: Event[];
    scenes: Scene[];
    legacies: Legacy[];
};

export type Player = {
  id: string;
  name: string;
  isAI?: boolean;
  personality?: string;
};

export type LogEntry = {
    playerId: string;
    playerName: string;
    summary: string;
    timestamp: string;
    addedNodeIds: string[];
}

// Types for the hierarchical narrative context
export interface NarrativeScene {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
}

export interface NarrativeEvent {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  scenes: NarrativeScene[];
}

export interface NarrativePeriod {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  events: NarrativeEvent[];
}

export interface GameSeed {
  bigPicture: string;
  palette: string[];
  banned: string[];
}

export interface Narrative {
  gameSeed: GameSeed;
  focus: string;
  periods: NarrativePeriod[];
  historyLog: LogEntry[];
}
