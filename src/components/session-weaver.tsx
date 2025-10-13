'use client';

import { useState, useCallback, useMemo, useEffect, createContext, useContext } from 'react';
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
import SceneNode from '@/components/nodes/scene-node';
import Toolbar from '@/components/toolbar';
import AiSuggestionsPanel from '@/components/ai-suggestions-panel';
import { Button } from './ui/button';
import { suggestNewLegacies, SuggestNewLegaciesOutput } from '@/ai/flows/suggest-new-legacies';
import { useToast } from '@/hooks/use-toast';
import type { Period, Event, Legacy, History, Scene, Narrative, NarrativePeriod, NarrativeEvent, NarrativeScene, GameSeed, Player } from '@/lib/types';
import { PanelRight } from 'lucide-react';
import SettingsPanel from './settings-panel';
import GameSeedModal from './game-seed-modal';
import MultiplayerSettingsModal from './multiplayer-settings-modal';
import TurnPanel from './turn-panel';

const initialNodes: Node[] = [
  { id: 'period-1', type: 'period', position: { x: 100, y: 100 }, data: { name: 'The Ancient Era', description: 'A time of myth and legends.' } },
  { id: 'event-1', type: 'event', position: { x: 400, y: 450 }, data: { name: 'The Great Upheaval', description: 'A catastrophic event that reshaped the world.' } },
];

const initialEdges: Edge[] = [];

let nodeIdCounter = 2;
const getUniqueNodeId = (type: string) => `${type}-${nodeIdCounter++}`;


const NarrativeContext = createContext<{ narrative: Narrative | null }>({ narrative: null });
export const useNarrative = () => useContext(NarrativeContext);

function SessionWeaverFlow() {
  const [nodes, setNodes] = useState<Node<any>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [isReviewMode, setReviewMode] = useState(false);
  const [isSuggestionsPanelOpen, setSuggestionsPanelOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestNewLegaciesOutput>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [focus, setFocus] = useState('');
  const [narrative, setNarrative] = useState<Narrative | null>(null);
  const [isGameSeedModalOpen, setGameSeedModalOpen] = useState(false);
  const [gameSeed, setGameSeed] = useState<GameSeed>({
    bigPicture: 'A grand space opera about the last remnants of humanity searching for a new home.',
    palette: ['Ancient alien artifacts', 'Political intrigue', 'FTL travel consequences'],
    banned: ['Magic', 'Time travel']
  });
  const [players, setPlayers] = useState<Player[]>([
    { id: 'player-1', name: 'Alex' },
    { id: 'player-2', name: 'Sam' },
  ]);
  const [isMultiplayerModalOpen, setMultiplayerModalOpen] = useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [nodesCreatedThisTurn, setNodesCreatedThisTurn] = useState(0);
  const [firstNodeThisTurnId, setFirstNodeThisTurnId] = useState<string | null>(null);

  const activePlayer = players[activePlayerIndex];
  const nextPlayer = players[(activePlayerIndex + 1) % players.length];
  const isHost = activePlayerIndex === 0;
  const maxNodesPerTurn = isHost ? 2 : 1;
  const canCreateNode = nodesCreatedThisTurn < maxNodesPerTurn;
  
  // Specific logic for host's second move
  const canHostCreateGlobalNode = isHost ? nodesCreatedThisTurn === 0 : canCreateNode;


  const { toast } = useToast();

  const handleEndTurn = () => {
    setActivePlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
    setNodesCreatedThisTurn(0);
    setFirstNodeThisTurnId(null);
    toast({
        title: "Turn Ended",
        description: `It's now ${nextPlayer.name}'s turn.`,
    })
  };

  useEffect(() => {
    const buildNarrative = () => {
      const periodNodes = nodes.filter(n => n.type === 'period');
      const eventNodes = nodes.filter(n => n.type === 'event');
      const sceneNodes = nodes.filter(n => n.type === 'scene');

      const narrativePeriods: NarrativePeriod[] = periodNodes.map(pNode => {
        const childEventIds = edges
          .filter(e => e.source === pNode.id && nodes.find(n => n.id === e.target)?.type === 'event')
          .map(e => e.target);
        
        const narrativeEvents: NarrativeEvent[] = eventNodes
          .filter(eNode => childEventIds.includes(eNode.id))
          .map(eNode => {
            const childSceneIds = edges
              .filter(e => e.source === eNode.id && nodes.find(n => n.id === e.target)?.type === 'scene')
              .map(e => e.target);

            const narrativeScenes: NarrativeScene[] = sceneNodes
              .filter(sNode => childSceneIds.includes(sNode.id))
              .map(sNode => ({
                id: sNode.id,
                name: sNode.data.name,
                description: sNode.data.description,
              }));

            return {
              id: eNode.id,
              name: eNode.data.name,
              description: eNode.data.description,
              scenes: narrativeScenes,
            };
          });

        return {
          id: pNode.id,
          name: pNode.data.name,
          description: pNode.data.description,
          events: narrativeEvents,
        };
      });

      setNarrative({ 
        gameSeed,
        focus,
        periods: narrativePeriods 
      });
    };

    buildNarrative();
  }, [nodes, edges, gameSeed, focus]);

  useEffect(() => {
    if (narrative) {
        console.log(narrative);
    }
  }, [narrative]);


  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, []);
  
  const handleNodeCreation = (newNodeId: string) => {
    setNodesCreatedThisTurn(c => {
      const newCount = c + 1;
      if (isHost && newCount === 1) {
        setFirstNodeThisTurnId(newNodeId);
      }
      return newCount;
    });
  }

  const addNode = (type: 'period' | 'event' | 'scene') => {
    if (!canCreateNode || (isHost && nodesCreatedThisTurn > 0)) return;
    const newNodeId = getUniqueNodeId(type);
    const newNode: Node = {
      id: newNodeId,
      type,
      position: { x: Math.random() * 400 + 100, y: Math.random() * 400 + 50 },
      data: { name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`, description: '' },
    };
    setNodes((nds) => nds.concat(newNode));
    handleNodeCreation(newNodeId);
  };
  
  const addPeriod = (direction: 'left' | 'right', sourceNodeId: string) => {
    if (!canCreateNode || (isHost && nodesCreatedThisTurn > 0)) return;
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;
  
    const newNodeId = getUniqueNodeId('period');
    const xOffset = direction === 'left' ? -300 : 300;
  
    const newNode: Node = {
      id: newNodeId,
      type: 'period',
      position: { x: sourceNode.position.x + xOffset, y: sourceNode.position.y },
      data: { name: 'New Period', description: '' },
    };
  
    const newEdge: Edge = {
      id: `edge-${direction === 'left' ? newNodeId : sourceNodeId}-${direction === 'left' ? sourceNodeId : newNodeId}`,
      source: direction === 'left' ? newNodeId : sourceNodeId,
      target: direction === 'left' ? sourceNodeId : newNodeId,
      sourceHandle: 'peer-source',
      targetHandle: 'peer-target',
      style: { stroke: 'hsl(var(--accent))' },
    };
  
    setNodes(nds => nds.concat(newNode));
    setEdges(eds => addEdge(newEdge, eds));
    handleNodeCreation(newNodeId);
  };

  const addEvent = (sourceNodeId: string) => {
    if (!canCreateNode) return;
    if (isHost && nodesCreatedThisTurn > 0 && sourceNodeId !== firstNodeThisTurnId) return;

    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode || sourceNode.type !== 'period') return;
  
    const newNodeId = getUniqueNodeId('event');
  
    const newNode: Node = {
      id: newNodeId,
      type: 'event',
      position: { x: sourceNode.position.x, y: sourceNode.position.y + 350 },
      data: { name: 'New Event', description: '' },
    };
  
    const newEdge: Edge = {
      id: `edge-${sourceNodeId}-${newNodeId}`,
      source: sourceNodeId,
      target: newNodeId,
      sourceHandle: 'child-source',
      targetHandle: 'period-target',
      style: { stroke: 'hsl(var(--primary))' },
    };
  
    setNodes(nds => nds.concat(newNode));
    setEdges(eds => addEdge(newEdge, eds));
    handleNodeCreation(newNodeId);
  };

  const addScene = (sourceNodeId: string) => {
    if (!canCreateNode) return;
    if (isHost && nodesCreatedThisTurn > 0 && sourceNodeId !== firstNodeThisTurnId) return;

    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode || sourceNode.type !== 'event') return;

    const newNodeId = getUniqueNodeId('scene');

    const newNode: Node = {
      id: newNodeId,
      type: 'scene',
      position: { x: sourceNode.position.x, y: sourceNode.position.y + 350 },
      data: { name: 'New Scene', description: '' },
    };

    const newEdge: Edge = {
      id: `edge-${sourceNodeId}-${newNodeId}`,
      source: sourceNodeId,
      target: newNodeId,
      sourceHandle: 'scene-source',
      targetHandle: 'event-target',
      style: { stroke: 'hsl(var(--accent))' },
    };

    setNodes(nds => nds.concat(newNode));
    setEdges(eds => addEdge(newEdge, eds));
    handleNodeCreation(newNodeId);
  };
  
  const deleteNode = (nodeId: string) => {
    setNodes(nds => nds.filter(n => n.id !== nodeId));
    setEdges(eds => eds.filter(e => e.source !== nodeId && e.target !== nodeId));
    toast({
      title: "Node Deleted",
      description: "The selected node has been removed from the narrative.",
    });
  };

  const disconnectPeer = (nodeId: string, direction: 'left' | 'right') => {
    setEdges(eds => eds.filter(e => {
      const isPeerEdge = e.sourceHandle === 'peer-source' || e.targetHandle === 'peer-target';
      if (!isPeerEdge) return true;
      if (direction === 'left' && e.target === nodeId) return false;
      if (direction === 'right' && e.source === nodeId) return false;
      return true;
    }));
    toast({
        title: "Disconnected",
        description: "The period connection has been removed.",
    });
  };


  const nodeTypes: NodeTypes = useMemo(() => ({
    period: PeriodNode,
    event: EventNode,
    scene: SceneNode,
  }), []);

  const defaultEdgeOptions: DefaultEdgeOptions = useMemo(() => ({
    animated: true,
    style: { strokeWidth: 2 },
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
    (connection: Connection) => {
      const sourceNode = nodes.find(node => node.id === connection.source);
      const targetNode = nodes.find(node => node.id === connection.target);

      let style = { stroke: 'hsl(var(--accent))' };
      if (sourceNode?.type === 'period' && targetNode?.type === 'event') {
        style.stroke = 'hsl(var(--primary))';
      }

      setEdges((eds) => addEdge({ ...connection, data: { description: '' }, style }, eds))
    },
    [setEdges, nodes]
  );


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
      const scenes: Scene[] = nodes
        .filter(n => n.type === 'scene')
        .map(n => ({ id: n.id, name: n.data.name, description: n.data.description, position: n.position }));
      const legacies: Legacy[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        description: e.data?.description || '',
      }));

      const history: History = { periods, events, scenes, legacies };
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
        history.scenes?.forEach(s => {
          const idNum = parseInt(s.id.split('-')[1]);
          if (idNum > maxId) maxId = idNum;
          newNodes.push({ id: s.id, type: 'scene', position: s.position, data: { name: s.name, description: s.description } });
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
    const peerEdges = edges.filter(e => e.sourceHandle === 'peer-source' || e.targetHandle === 'peer-target');
    return nodes.map(n => {
        const canAddChild = canCreateNode && (!isHost || nodesCreatedThisTurn === 0 || (nodesCreatedThisTurn === 1 && firstNodeThisTurnId === n.id));
      if (n.type === 'period') {
        const isConnectedRight = peerEdges.some(e => e.source === n.id);
        const isConnectedLeft = peerEdges.some(e => e.target === n.id);
        return {
          ...n,
          data: {
            ...n.data,
            updateNodeData,
            addPeriod,
            deleteNode,
            addEvent,
            isConnectedLeft,
            isConnectedRight,
            disconnectPeer,
            canCreateNode: canHostCreateGlobalNode,
            canAddChild: canAddChild,
          }
        };
      }
       if (n.type === 'event') {
        return {
          ...n,
          data: {
            ...n.data,
            updateNodeData,
            deleteNode,
            addScene,
            canAddChild: canAddChild,
          }
        };
      }
      return {...n, data: {...n.data, updateNodeData, deleteNode }};
    });
  }, [nodes, edges, updateNodeData, addPeriod, deleteNode, addEvent, addScene, disconnectPeer, canCreateNode, canHostCreateGlobalNode, nodesCreatedThisTurn, firstNodeThisTurnId, isHost]);

  return (
    <NarrativeContext.Provider value={{ narrative }}>
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
                      onGameSeedClick={() => setGameSeedModalOpen(true)}
                      onMultiplayerClick={() => setMultiplayerModalOpen(true)}
                      canCreateNode={canHostCreateGlobalNode}
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
                      <SettingsPanel 
                        bigPicture={gameSeed.bigPicture}
                        focus={focus}
                        setFocus={setFocus}
                        onBigPictureClick={() => setGameSeedModalOpen(true)}
                        activePlayer={activePlayer}
                      />
                      <TurnPanel
                        onEndTurn={handleEndTurn}
                        nextPlayer={nextPlayer}
                        nodesCreatedThisTurn={nodesCreatedThisTurn}
                        maxNodesPerTurn={maxNodesPerTurn}
                      />
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
              <GameSeedModal
                  isOpen={isGameSeedModalOpen}
                  onClose={() => setGameSeedModalOpen(false)}
                  gameSeed={gameSeed}
                  setGameSeed={setGameSeed}
              />
              <MultiplayerSettingsModal
                isOpen={isMultiplayerModalOpen}
                onClose={() => setMultiplayerModalOpen(false)}
                players={players}
                setPlayers={setPlayers}
              />
          </div>
      </div>
    </NarrativeContext.Provider>
  );
}

export default function SessionWeaver() {
    return (
        <ReactFlowProvider>
            <SessionWeaverFlow />
        </ReactFlowProvider>
    )
}
