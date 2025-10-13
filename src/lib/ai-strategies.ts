'use client';
import { Node, Edge } from '@xyflow/react';
import type { AiStrategy, LogEntry } from './types';

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
  if (randomChoice < 0.5 && periods.length > 0) {
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

// Strategy 4: Focuser - builds on the last created node
const focuserStrategy = (nodes: Node[], edges: Edge[], historyLog: LogEntry[]): AiMove | null => {
    if (historyLog.length === 0) return balancedStrategy(nodes, edges);

    const lastLogEntry = historyLog[historyLog.length - 1];
    if (!lastLogEntry.addedNodeIds || lastLogEntry.addedNodeIds.length === 0) {
        return balancedStrategy(nodes, edges);
    }

    const lastNodeId = lastLogEntry.addedNodeIds[lastLogEntry.addedNodeIds.length - 1];
    const lastNode = nodes.find(n => n.id === lastNodeId);

    if (!lastNode) return balancedStrategy(nodes, edges);

    switch (lastNode.type) {
        case 'period':
            return { type: 'event', parentId: lastNode.id };
        case 'event':
            return { type: 'scene', parentId: lastNode.id };
        case 'scene':
            // Find the parent event of the last scene and add another scene to it
            const parentEdge = edges.find(e => e.target === lastNode.id);
            if (parentEdge && parentEdge.source) {
                return { type: 'scene', parentId: parentEdge.source };
            }
            break; // fallback if no parent found
    }

    // Fallback to balanced if the logic above fails
    return balancedStrategy(nodes, edges);
};

export const determineAiMove = (
    nodes: Node[],
    edges: Edge[],
    historyLog: LogEntry[],
    strategy?: AiStrategy
  ): AiMove | null => {
  switch (strategy) {
    case 'Builder':
      return builderStrategy(nodes, edges);
    case 'Detailer':
      return detailerStrategy(nodes, edges);
    case 'Focuser':
      return focuserStrategy(nodes, edges, historyLog);
    case 'Balanced':
    default:
      return balancedStrategy(nodes, edges);
  }
};
