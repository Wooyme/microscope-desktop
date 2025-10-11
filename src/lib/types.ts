export type Period = {
    id: string;
    name: string;
    description: string;
    position: { x: number, y: number };
};
  
export type Event = {
    id:string;
    name: string;
    description: string;
    position: { x: number, y: number };
};

export type Scene = {
    id: string;
    name: string;
    description: string;
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
