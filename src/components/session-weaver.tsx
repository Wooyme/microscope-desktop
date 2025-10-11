'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeTypes,
  DefaultEdgeOptions,
  Connection,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import PeriodNode from '@/components/nodes/period-node';
import EventNode from '@/components/nodes/event-node';
import Toolbar from '@/components/toolbar';
import AiSuggestionsPanel from '@/components/ai-suggestions-panel';
import { Button } from './ui/button';
import { suggestNewLegacies, SuggestNewLegaciesOutput } from '@/ai/flows/suggest-new-legacies';
import { useToast } from '@/hooks/use-toast';
import type { Period, Event, Legacy, History } from '@/lib/types';
import { PanelRight } from 'lucide-react';

const initialNodes: Node[] = [
  { id: 'period-1', type: 'period', position: { x: 100, y: 100 }, data: { name: 'The Ancient Era', description: 'A time of myth and legends.' } },
  { id: 'event-1', type: 'event', position: { x: 400, y: 250 }, data: { name: 'The Great Upheaval', description: 'A catastrophic event that reshaped the world.' } },
];

const initialEdges: Edge[] = [];

let nodeIdCounter = 2;
const getUniqueNodeId = (type: string) => `${type}-${nodeIdCounter++}`;

function SessionWeaverFlow() {
  const [nodes, setNodes] = useState<Node<any>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isReviewMode, setReviewMode] = useState(false);
  const [isSuggestionsPanelOpen, setSuggestionsPanelOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestNewLegaciesOutput>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const { toast } = useToast();

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, []);

  const nodeTypes: NodeTypes = useMemo(() => ({
    period: PeriodNode,
    event: EventNode,
  }), []);

  const defaultEdgeOptions: DefaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { stroke: 'hsl(var(--accent))', strokeWidth: 2 },
  }), []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, data: { description: '' } }, eds)),
    [setEdges]
  );

  const addNode = (type: 'period' | 'event') => {
    const newNode: Node = {
      id: getUniqueNodeId(type),
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 50 },
      data: { name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`, description: '' },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const handleGetSuggestions = async () => {
    setIsGenerating(true);
    try {
      const periods: Period[] = nodes
        .filter((n) => n.type === 'period')
        .map((n) => ({ id: n.id, name: n.data.name, description: n.data.description, position: n.position }));
      const events: Event[] = nodes
        .filter((n) => n.type === 'event')
        .map((n) => ({ id: n.id, name: n.data.name, description: n.data.description, position: n.position }));
      const legacies = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        description: e.data?.description || '',
      }));

      const result = await suggestNewLegacies({ periods, events, legacies });
      setSuggestions(result);
      if (result.length > 0) {
        setSuggestionsPanelOpen(true);
      } else {
        toast({
          title: "No new suggestions",
          description: "The AI couldn't find any new connections to suggest.",
        });
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Failed to get AI suggestions.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addSuggestedEdge = (source: string, target: string, reason: string) => {
    const newEdge = {
        source,
        target,
        id: `edge-${source}-${target}-${Math.random()}`,
        data: { description: reason },
    };
    setEdges((eds) => addEdge(newEdge, eds));
    toast({
        title: "Legacy Added",
        description: "A new legacy has been woven into your narrative.",
    });
  };

  const exportHistory = () => {
    try {
      const periods: Period[] = nodes
        .filter((n) => n.type === 'period')
        .map((n) => ({ id: n.id, name: n.data.name, description: n.data.description, position: n.position }));
      const events: Event[] = nodes
        .filter((n) => n.type === 'event')
        .map((n) => ({ id: n.id, name: n.data.name, description: n.data.description, position: n.position }));
      const legacies: Legacy[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        description: e.data?.description || '',
      }));

      const history: History = { periods, events, legacies };
      const dataStr = JSON.stringify(history, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = 'session-history.json';

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast({ title: 'Success', description: 'History exported successfully.' });
    } catch (error) {
      console.error('Error exporting history:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to export history.' });
    }
  };

  const importHistory = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File is not a valid text file.');
        }
        const history: History = JSON.parse(text);

        const newNodes: Node[] = [];
        let maxId = 0;

        history.periods.forEach(p => {
          const idNum = parseInt(p.id.split('-')[1]);
          if (idNum > maxId) maxId = idNum;
          newNodes.push({ id: p.id, type: 'period', position: p.position, data: { name: p.name, description: p.description } });
        });
        history.events.forEach(e => {
          const idNum = parseInt(e.id.split('-')[1]);
          if (idNum > maxId) maxId = idNum;
          newNodes.push({ id: e.id, type: 'event', position: e.position, data: { name: e.name, description: e.description } });
        });

        const newEdges: Edge[] = history.legacies.map(l => ({
          id: l.id,
          source: l.source,
          target: l.target,
          data: { description: l.description }
        }));

        nodeIdCounter = maxId + 1;
        setNodes(newNodes);
        setEdges(newEdges);
        toast({ title: 'Success', description: 'History imported successfully.' });
      } catch (error) {
        console.error('Error importing history:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to parse history file. Please check the file format.' });
      }
    };
    reader.readAsText(file);
    // Reset file input to allow importing the same file again
    event.target.value = '';
  };


  const nodesWithUpdater = useMemo(() => {
    return nodes.map(n => ({...n, data: {...n.data, updateNodeData}}))
  }, [nodes, updateNodeData]);

  return (
    <div className="w-full h-screen flex flex-col">
        <header className="p-4 border-b bg-card flex justify-between items-center shadow-sm z-10">
            <h1 className="text-2xl font-headline text-foreground">Session Weaver</h1>
            <div className="flex items-center gap-4">
                <Toolbar
                    addNode={addNode}
                    getSuggestions={handleGetSuggestions}
                    isGenerating={isGenerating}
                    isReviewMode={isReviewMode}
                    setReviewMode={setReviewMode}
                    importHistory={importHistory}
                    exportHistory={exportHistory}
                />
                {suggestions.length > 0 && !isSuggestionsPanelOpen && (
                    <Button variant="outline" size="icon" onClick={() => setSuggestionsPanelOpen(p => !p)}>
                        <PanelRight />
                    </Button>
                )}
            </div>
        </header>
        <div className="flex-grow flex relative">
            <div className="flex-grow h-full">
                <ReactFlow
                    nodes={nodesWithUpdater}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    defaultEdgeOptions={defaultEdgeOptions}
                    nodesDraggable={!isReviewMode}
                    nodesConnectable={!isReviewMode}
                    elementsSelectable={!isReviewMode}
                    fitView
                    className={isReviewMode ? 'review-mode' : ''}
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
            <AiSuggestionsPanel 
                isOpen={isSuggestionsPanelOpen}
                onClose={() => setSuggestionsPanelOpen(false)}
                suggestions={suggestions}
                onAddEdge={addSuggestedEdge}
            />
        </div>
    </div>
  );
}

export default function SessionWeaver() {
    return (
        <ReactFlowProvider>
            <SessionWeaverFlow />
        </ReactFlowProvider>
    )
}
