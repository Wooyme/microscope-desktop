'use client';

import { createContext, useContext } from 'react';

export interface NodeOperations {
  updateNodeData: (nodeId: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  addPeriod?: (direction: 'left' | 'right', sourceNodeId: string) => void;
  addEvent?: (sourceNodeId: string) => void;
  addScene?: (sourceNodeId: string) => void;
  disconnectPeer?: (nodeId: string, direction: 'left' | 'right') => void;
}

const NodeOperationsContext = createContext<NodeOperations | null>(null);

export const NodeOperationsProvider = NodeOperationsContext.Provider;

export function useNodeOperations(): NodeOperations {
  const context = useContext(NodeOperationsContext);
  if (!context) {
    throw new Error('useNodeOperations must be used within a NodeOperationsProvider');
  }
  return context;
}
