import { Node, Edge } from '@xyflow/react';

export interface NodeCreationResult {
  node: Node;
  edge?: Edge;
}

export function createPeriodNode(
  nodeId: string,
  position: { x: number; y: number },
  data: { name: string; description: string }
): Node {
  return {
    id: nodeId,
    type: 'period',
    position,
    data,
  };
}

export function createEventNode(
  nodeId: string,
  position: { x: number; y: number },
  data: { name: string; description: string }
): Node {
  return {
    id: nodeId,
    type: 'event',
    position,
    data,
  };
}

export function createSceneNode(
  nodeId: string,
  position: { x: number; y: number },
  data: { name: string; description: string }
): Node {
  return {
    id: nodeId,
    type: 'scene',
    position,
    data,
  };
}

export function createPeriodWithEdge(
  nodeId: string,
  sourceNode: Node,
  direction: 'left' | 'right',
  data: { name: string; description: string }
): NodeCreationResult {
  const xOffset = direction === 'left' ? -300 : 300;
  const node = createPeriodNode(
    nodeId,
    { x: sourceNode.position.x + xOffset, y: sourceNode.position.y },
    data
  );

  const edge: Edge = {
    id: `edge-${direction === 'left' ? nodeId : sourceNode.id}-${direction === 'left' ? sourceNode.id : nodeId}`,
    source: direction === 'left' ? nodeId : sourceNode.id,
    target: direction === 'left' ? sourceNode.id : nodeId,
    sourceHandle: 'peer-source',
    targetHandle: 'peer-target',
    style: { stroke: 'hsl(var(--accent))' },
  };

  return { node, edge };
}

export function createEventWithEdge(
  nodeId: string,
  parentNode: Node,
  data: { name: string; description: string }
): NodeCreationResult {
  const node = createEventNode(
    nodeId,
    { x: parentNode.position.x, y: parentNode.position.y + 350 },
    data
  );

  const edge: Edge = {
    id: `edge-${parentNode.id}-${nodeId}`,
    source: parentNode.id,
    target: nodeId,
    sourceHandle: 'child-source',
    targetHandle: 'period-target',
    style: { stroke: 'hsl(var(--primary))' },
  };

  return { node, edge };
}

export function createSceneWithEdge(
  nodeId: string,
  parentNode: Node,
  data: { name: string; description: string }
): NodeCreationResult {
  const node = createSceneNode(
    nodeId,
    { x: parentNode.position.x, y: parentNode.position.y + 350 },
    data
  );

  const edge: Edge = {
    id: `edge-${parentNode.id}-${nodeId}`,
    source: parentNode.id,
    target: nodeId,
    sourceHandle: 'scene-source',
    targetHandle: 'event-target',
    style: { stroke: 'hsl(var(--accent))' },
  };

  return { node, edge };
}
