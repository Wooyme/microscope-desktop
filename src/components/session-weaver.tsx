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
import { generateNodeContent } from '@/ai/flows/suggest-next-move';
import { useToast } from '@/hooks/use-toast';
import type { Period, Event, Legacy, History, Scene, Narrative, NarrativePeriod, NarrativeEvent, NarrativeScene, GameSeed, Player, LogEntry } from '@/lib/types';
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
  const [isGodMode, setGodMode] = useState(false);
  const [isAiTurn, setIsAiTurn] = useState(false);
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
    { id: 'player-2', name: 'AI Creative', isAI: true, personality: 'Creative' },
  ]);
  const [isMultiplayerModalOpen, setMultiplayerModalOpen] = useState(false);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [nodesCreatedThisTurn, setNodesCreatedThisTurn] = useState(0);
  const [firstNodeThisTurnId, setFirstNodeThisTurnId] = useState<string | null>(null);
  const [nodesAtTurnStart, setNodesAtTurnStart] = useState<Node[]>(initialNodes);
  const [historyLog, setHistoryLog] = useState<LogEntry[]>([]);

  const activePlayer = players[activePlayerIndex];
  const nextPlayer = players.length > 1 ? players[(activePlayerIndex + 1) % players.length] : undefined;
  const isHost = activePlayerIndex === 0;

  const inGodMode = isHost && isGodMode;
  
  const maxNodesPerTurn = inGodMode ? Infinity : (isHost ? 2 : 1);
  const canCreateNode = nodesCreatedThisTurn < maxNodesPerTurn;
  
  // Specific logic for host's second move
  const canHostCreateGlobalNode = inGodMode || (isHost ? nodesCreatedThisTurn === 0 : canCreateNode);


  const { toast } = useToast();

  const buildNarrative = useCallback(() => {
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
              imageUrl: sNode.data.imageUrl,
            }));

          return {
            id: eNode.id,
            name: eNode.data.name,
            description: eNode.data.description,
            imageUrl: eNode.data.imageUrl,
            scenes: narrativeScenes,
          };
        });

      return {
        id: pNode.id,
        name: pNode.data.name,
        description: pNode.data.description,
        imageUrl: pNode.data.imageUrl,
        events: narrativeEvents,
      };
    });

    const newNarrative = { 
      gameSeed,
      focus,
      periods: narrativePeriods,
      historyLog
    };

    setNarrative(newNarrative);
    return newNarrative;
  }, [nodes, edges, gameSeed, focus, historyLog]);


  const handleEndTurn = useCallback(() => {
    // Log changes
    const newNodes = nodes.filter(n => !nodesAtTurnStart.some(n_start => n_start.id === n.id));
    if (newNodes.length > 0) {
        const summary = newNodes.map(n => {
            let nodeSummary = `a ${n.type} named '${n.data.name}'`;
            if (n.data.description) {
                nodeSummary += ` with description: "${n.data.description.replace(/<[^>]+>/g, '')}"`;
            }
            return nodeSummary;
        }).join(' and ');
        
        const logSummary = `${activePlayer.name} added ${summary}.`;
        
        const newLogEntry: LogEntry = {
            playerId: activePlayer.id,
            playerName: activePlayer.name,
            summary: logSummary,
            timestamp: new Date().toISOString(),
            addedNodeIds: newNodes.map(n => n.id),
        };

        setHistoryLog(prev => [...prev, newLogEntry]);

        toast({
            title: "Player Action Logged",
            description: logSummary,
        });
    }

    buildNarrative();

    const nextPlayerIndex = players.length > 1 ? (activePlayerIndex + 1) % players.length : 0;
    setActivePlayerIndex(nextPlayerIndex);
    setNodesCreatedThisTurn(0);
    setFirstNodeThisTurnId(null);
    setNodesAtTurnStart(nodes); // Snapshot nodes for the next turn

    if (players[nextPlayerIndex]) {
        toast({
            title: "Turn Ended",
            description: `It's now ${players[nextPlayerIndex].name}'s turn.`,
        });
    } else {
         toast({
            title: "Turn Ended",
            description: "No other players. It's your turn again.",
        })
    }
  }, [activePlayer, nodes, nodesAtTurnStart, players, activePlayerIndex, toast, buildNarrative]);

  useEffect(() => {
    buildNarrative();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameSeed, focus, historyLog]);


  const handleAiTurn = useCallback(async () => {
    if (!activePlayer?.isAI || isAiTurn) return;

    const currentNarrative = buildNarrative();
  
    setIsAiTurn(true);
  
    // 1. Determine the strategic move programmatically
    const determineAiMove = () => {
      const periods = nodes.filter(n => n.type === 'period');
      const events = nodes.filter(n => n.type === 'event');
      const scenes = nodes.filter(n => n.type === 'scene');
  
      // If timeline is empty, create a root period
      if (nodes.length === 0) {
        return { type: 'period', parentId: null };
      }
  
      // Strategy: Prioritize filling out the hierarchy
      // Find periods with no events
      const periodsWithoutEvents = periods.filter(p => !edges.some(e => e.source === p.id && events.some(ev => ev.id === e.target)));
      if (periodsWithoutEvents.length > 0) {
        const parentNode = periodsWithoutEvents[Math.floor(Math.random() * periodsWithoutEvents.length)];
        return { type: 'event', parentId: parentNode.id };
      }
  
      // Find events with no scenes
      const eventsWithoutScenes = events.filter(ev => !edges.some(e => e.source === ev.id && scenes.some(s => s.id === e.target)));
      if (eventsWithoutScenes.length > 0) {
        const parentNode = eventsWithoutScenes[Math.floor(Math.random() * eventsWithoutScenes.length)];
        return { type: 'scene', parentId: parentNode.id };
      }
  
      // Fallback strategy: Add a new period or scene randomly
      const randomChoice = Math.random();
      if (randomChoice < 0.3 && periods.length > 0) { // Add new peer period
        const parentNode = periods[Math.floor(Math.random() * periods.length)];
        return { type: 'period', parentId: parentNode.id };
      } else if (randomChoice < 0.7 && events.length > 0) { // Add a new scene
        const parentNode = events[Math.floor(Math.random() * events.length)];
        return { type: 'scene', parentId: parentNode.id };
      } else if (periods.length > 0) { // Add a new event
        const parentNode = periods[Math.floor(Math.random() * periods.length)];
        return { type: 'event', parentId: parentNode.id };
      } else { // Default to creating a root period if logic fails
        return { type: 'period', parentId: null };
      }
    };
  
    try {
      const move = determineAiMove();
      const parentNode = nodes.find(n => n.id === move.parentId);
  
      // 2. Generate creative content using Genkit
      const content = await generateNodeContent({
        gameSeed: currentNarrative.gameSeed,
        personality: activePlayer.personality || 'Neutral',
        nodeType: move.type as 'period' | 'event' | 'scene',
        parentContext: parentNode ? { name: parentNode.data.name, description: parentNode.data.description } : undefined,
      });
  
      // 3. Apply the move to the board
      if (content) {
        const { name, description } = content;
        const newNodeId = getUniqueNodeId(move.type);
        let newNode: Node | null = null;
        let newEdge: Edge | null = null;
  
        if (move.type === 'period' && !parentNode) {
          newNode = {
            id: newNodeId, type: 'period',
            position: { x: 100, y: 100 },
            data: { name, description }
          };
        } else if (parentNode) {
          const { type, parentId } = move;
          if (type === 'event' && parentNode.type === 'period') {
            newNode = { id: newNodeId, type, position: { x: parentNode.position.x, y: parentNode.position.y + 350 }, data: { name, description } };
            newEdge = { id: `edge-${parentId}-${newNodeId}`, source: parentId, target: newNodeId, sourceHandle: 'child-source', targetHandle: 'period-target', style: { stroke: 'hsl(var(--primary))' } };
          } else if (type === 'scene' && parentNode.type === 'event') {
            newNode = { id: newNodeId, type, position: { x: parentNode.position.x, y: parentNode.position.y + 350 }, data: { name, description } };
            newEdge = { id: `edge-${parentId}-${newNodeId}`, source: parentId, target: newNodeId, sourceHandle: 'scene-source', targetHandle: 'event-target', style: { stroke: 'hsl(var(--accent))' } };
          } else if (type === 'period' && parentNode.type === 'period') {
            const direction = Math.random() > 0.5 ? 'right' : 'left';
            const xOffset = direction === 'right' ? 300 : -300;
            newNode = { id: newNodeId, type, position: { x: parentNode.position.x + xOffset, y: parentNode.position.y }, data: { name, description } };
            newEdge = { id: `edge-${direction === 'left' ? newNodeId : parentId}-${direction === 'left' ? parentId : newNodeId}`, source: direction === 'left' ? newNodeId : parentId, target: direction === 'left' ? parentId : newNodeId, sourceHandle: 'peer-source', targetHandle: 'peer-target', style: { stroke: 'hsl(var(--accent))' } };
          }
        }
  
        if (newNode) {
          setNodes(nds => nds.concat(newNode));
          if (newEdge) {
            setEdges(eds => addEdge(newEdge, eds));
          }
          setTimeout(() => {
            handleEndTurn();
            setIsAiTurn(false);
          }, 1000);
        } else {
          throw new Error("AI failed to create a valid new node based on strategy.");
        }
      }
    } catch (error) {
      console.error("AI turn failed:", error);
      toast({ variant: 'destructive', title: "AI Error", description: "The AI player failed to make a move." });
      handleEndTurn(); // End turn even if AI fails
    } finally {
      if (isAiTurn) { // Ensure state is reset in case of early error
        setTimeout(() => setIsAiTurn(false), 1000);
      }
    }
  }, [activePlayer, isAiTurn, buildNarrative, nodes, edges, handleEndTurn, toast]);

  useEffect(() => {
    if (activePlayer?.isAI) {
      handleAiTurn();
    }
  }, [activePlayer, handleAiTurn]);


  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, []);
  
  const handleNodeCreation = (newNodeId: string) => {
    if (isHost && nodesCreatedThisTurn === 0) {
      setFirstNodeThisTurnId(newNodeId);
    }
    setNodesCreatedThisTurn(c => c + 1);
  }

  const addNode = (type: 'period' | 'event' | 'scene') => {
    if (!canCreateNode) return;
    if (activePlayer?.isAI) return;
    if (isHost && !inGodMode && nodesCreatedThisTurn > 0) return;
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
    if (!canCreateNode) return;
    if (activePlayer?.isAI) return;
    if (isHost && !inGodMode && nodesCreatedThisTurn > 0) return;
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
    if (activePlayer?.isAI) return;
    if (isHost && !inGodMode && nodesCreatedThisTurn > 0 && sourceNodeId !== firstNodeThisTurnId) return;

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
    if (activePlayer?.isAI) return;
    if (isHost && !inGodMode && nodesCreatedThisTurn > 0 && sourceNodeId !== firstNodeThisTurnId) return;

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

  const exportHistory = () => {
    try {
      const periods: Period[] = nodes
        .filter((n) => n.type === 'period')
        .map((n) => ({ id: n.id, name: n.data.name, description: n.data.description, imageUrl: n.data.imageUrl, position: n.position }));
      const events: Event[] = nodes
        .filter((n) => n.type === 'event')
        .map((n) => ({ id: n.id, name: n.data.name, description: n.data.description, imageUrl: n.data.imageUrl, position: n.position }));
      const scenes: Scene[] = nodes
        .filter(n => n.type === 'scene')
        .map(n => ({ id: n.id, name: n.data.name, description: n.data.description, imageUrl: n.data.imageUrl, position: n.position }));
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
          newNodes.push({ id: p.id, type: 'period', position: p.position, data: { name: p.name, description: p.description, imageUrl: p.imageUrl } });
        });
        history.events.forEach(e => {
          const idNum = parseInt(e.id.split('-')[1]);
          if (idNum > maxId) maxId = idNum;
          newNodes.push({ id: e.id, type: 'event', position: e.position, data: { name: e.name, description: e.description, imageUrl: e.imageUrl } });
        });
        history.scenes?.forEach(s => {
          const idNum = parseInt(s.id.split('-')[1]);
          if (idNum > maxId) maxId = idNum;
          newNodes.push({ id: s.id, type: 'scene', position: s.position, data: { name: s.name, description: s.description, imageUrl: s.imageUrl } });
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
        setNodesAtTurnStart(newNodes);
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
    const isPlayerTurn = !activePlayer?.isAI;

    return nodes.map(n => {
      const isNodeCreatable = isPlayerTurn && (inGodMode || (canCreateNode && (!isHost || nodesCreatedThisTurn === 0 || (nodesCreatedThisTurn === 1 && firstNodeThisTurnId === n.id))));

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
            canCreateNode: isPlayerTurn && (inGodMode || canHostCreateGlobalNode),
            canAddChild: isNodeCreatable,
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
            canAddChild: isNodeCreatable,
          }
        };
      }
      return {...n, data: {...n.data, updateNodeData, deleteNode }};
    });
  }, [nodes, edges, updateNodeData, addPeriod, deleteNode, addEvent, addScene, disconnectPeer, canCreateNode, canHostCreateGlobalNode, nodesCreatedThisTurn, firstNodeThisTurnId, isHost, activePlayer, inGodMode]);

  return (
    <NarrativeContext.Provider value={{ narrative }}>
      <div className="w-full h-screen flex flex-col">
          <header className="p-4 border-b bg-card flex justify-between items-center shadow-sm z-10">
              <h1 className="text-2xl font-headline text-foreground">Session Weaver</h1>
              <div className="flex items-center gap-4">
                  <Toolbar
                      addNode={addNode}
                      isGenerating={isAiTurn}
                      isGodMode={isGodMode}
                      setGodMode={setGodMode}
                      importHistory={importHistory}
                      exportHistory={exportHistory}
                      onGameSeedClick={() => setGameSeedModalOpen(true)}
                      onMultiplayerClick={() => setMultiplayerModalOpen(true)}
                      canCreateNode={(inGodMode || canHostCreateGlobalNode) && !activePlayer?.isAI}
                  />
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
                      nodesDraggable={!activePlayer?.isAI}
                      nodesConnectable={!activePlayer?.isAI}
                      elementsSelectable={!activePlayer?.isAI}
                      fitView
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
                        isAiTurn={isAiTurn}
                        isPlayerTurn={!activePlayer?.isAI}
                      />
                      <Background />
                      <Controls />
                  </ReactFlow>
              </div>
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

    