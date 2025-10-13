import { Node, Edge } from '@xyflow/react';

type AiMove = {
  type: 'period' | 'event' | 'scene';
  parentId: string | null;
};

// Strategy 1: Balanced approach, tries to fill out the hierarchy
const balancedStrategy = (nodes: Node[], edges: Edge[]): AiMove | null => {
  const periods = nodes.filter(n => n.type === 'period');
  const events = nodes.filter(n => n.type === 'event');
  
  if (periods.length === 0) return { type: 'period', parentId: null };

  // Find periods with no events
  const periodsWithoutEvents = periods.filter(p => !edges.some(e => e.source === p.id && nodes.find(n => n.id === e.target)?.type === 'event'));
  if (periodsWithoutEvents.length > 0) {
    const parentNode = periodsWithoutEvents[Math.floor(Math.random() * periodsWithoutEvents.length)];
    return { type: 'event', parentId: parentNode.id };
  }

  // Find events with no scenes
  const eventsWithoutScenes = events.filter(ev => !edges.some(e => e.source === ev.id && nodes.find(n => n.id === e.target)?.type === 'scene'));
  if (eventsWithoutScenes.length > 0) {
    const parentNode = eventsWithoutScenes[Math.floor(Math.random() * eventsWithoutScenes.length)];
    return { type: 'scene', parentId: parentNode.id };
  }

  // Fallback: Add a peer period, a new scene, or a new event
  const randomChoice = Math.random();
  if (randomChoice < 0.33) {
    const parentNode = periods[Math.floor(Math.random() * periods.length)];
    return { type: 'period', parentId: parentNode.id };
  } else if (randomChoice < 0.66 && events.length > 0) {
    const parentNode = events[Math.floor(Math.random() * events.length)];
    return { type: 'scene', parentId: parentNode.id };
  } else {
    const parentNode = periods[Math.floor(Math.random() * periods.length)];
    return { type: 'event', parentId: parentNode.id };
  }
};

// Strategy 2: Builder - focuses on adding Periods and Events
const builderStrategy = (nodes: Node[], edges: Edge[]): AiMove | null => {
  const periods = nodes.filter(n => n.type === 'period');
  if (periods.length === 0) return { type: 'period', parentId: null };

  const randomChoice = Math.random();
  // 50% chance to add a new Period as a peer to an existing one
  if (randomChoice < 0.5) {
      const parentNode = periods[Math.floor(Math.random() * periods.length)];
      return { type: 'period', parentId: parentNode.id };
  } 
  // 50% chance to add a new Event to a random Period
  else {
      const parentNode = periods[Math.floor(Math.random() * periods.length)];
      return { type: 'event', parentId: parentNode.id };
  }
};

// Strategy 3: Detailer - focuses on adding Scenes
const detailerStrategy = (nodes: Node[], edges: Edge[]): AiMove | null => {
    const events = nodes.filter(n => n.type === 'event');
    const periods = nodes.filter(n => n.type === 'period');

    // If there are events, add a scene to a random one
    if (events.length > 0) {
        const parentNode = events[Math.floor(Math.random() * events.length)];
        return { type: 'scene', parentId: parentNode.id };
    }
    // If no events exist but periods do, add an event so we can add a scene next time
    else if (periods.length > 0) {
        const parentNode = periods[Math.floor(Math.random() * periods.length)];
        return { type: 'event', parentId: parentNode.id };
    }
    // If nothing exists, start with a period
    else {
        return { type: 'period', parentId: null };
    }
};

export const determineAiMove = (nodes: Node[], edges: Edge[], personality?: string): AiMove | null => {
  switch (personality) {
    case 'Historian':
    case 'Logical':
      return builderStrategy(nodes, edges);
    case 'Creative':
    case 'Chaotic':
        return detailerStrategy(nodes, edges);
    case 'Pragmatist':
    default:
      return balancedStrategy(nodes, edges);
  }
};
