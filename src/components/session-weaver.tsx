'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
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
import type { GameSeed, Player, SaveFile, CritiqueAndRegenerateOutput, LogEntry } from '@/lib/types';
import SettingsPanel from './settings-panel';
import GameSeedModal from './game-seed-modal';
import MultiplayerSettingsModal from './multiplayer-settings-modal';
import TurnPanel from './turn-panel';
import { determineAiMove, AiMove } from '@/lib/ai-strategies';
import ConfirmationDialog from './confirmation-dialog';
import AiReviewModal from './ai-review-modal';
import { useLocale, useTranslations } from 'next-intl';
import { useGameState } from '@/hooks/useGameState';
import { saveGameToFile, loadGameFromFile } from '@/lib/save-load-utils';
import { useAiTurn } from '@/hooks/useAiTurn';
import { stripHtmlTags } from '@/lib/text-utils';


let nodeIdCounter = 3;
const getUniqueNodeId = (type: string) => `${type}-${nodeIdCounter++}`;

function SessionWeaverFlow() {
  const t = useTranslations('SessionWeaver');
  const t_initial = useTranslations('InitialGame');
  const locale = useLocale();

  const initialNodes: Node[] = useMemo(() => [
    { id: 'period-1', type: 'period', position: { x: 100, y: 100 }, data: { name: t_initial('bookendStartName'), description: t_initial('bookendStartDescription') } },
    { id: 'period-2', type: 'period', position: { x: 800, y: 100 }, data: { name: t_initial('bookendEndName'), description: t_initial('bookendEndDescription') } },
  ], [t_initial]);
  
  const initialGameSeed: GameSeed = useMemo(() => ({
    bigPicture: t_initial('gameSeed.bigPicture'),
    palette: [
      t_initial('gameSeed.palette.0'),
      t_initial('gameSeed.palette.1'),
      t_initial('gameSeed.palette.2')
    ],
    banned: [
      t_initial('gameSeed.banned.0'),
      t_initial('gameSeed.banned.1')
    ]
  }), [t_initial]);

  const initialPlayers: Player[] = useMemo(() => [
    { id: 'player-1', name: t_initial('player1Name') },
    { id: 'player-2', name: t_initial('player2Name'), isAI: true, personality: 'Creative', strategy: 'Detailer' },
  ], [t_initial]);

  // Use the new game state hook
  const gameState = useGameState(
    initialNodes,
    initialGameSeed,
    initialPlayers,
    t_initial('initialLegacy')
  );

  const {
    nodes,
    edges,
    gameSeed,
    players,
    activePlayerIndex,
    nodesCreatedThisTurn,
    firstNodeThisTurnId,
    nodesAtTurnStart,
    historyLog,
    focus,
    legacies,
    isGodMode,
    activePlayer,
    isHost,
    inGodMode,
    setNodes,
    setEdges,
    setGameSeed,
    setPlayers,
    setActivePlayerIndex,
    setNodesCreatedThisTurn,
    setFirstNodeThisTurnId,
    setNodesAtTurnStart,
    setHistoryLog,
    setFocus,
    setLegacies,
    setIsGodMode,
    resetGame,
    loadGameState,
    getSaveFile,
  } = gameState;

  // Use the AI turn hook
  const { isAiTurn, aiMoveProposal, executeAiTurn, resetAiTurn, setIsAiTurn } = useAiTurn();

  const [isGameSeedModalOpen, setGameSeedModalOpen] = useState(false);
  const [isMultiplayerModalOpen, setMultiplayerModalOpen] = useState(false);
  const [isNewGameConfirmOpen, setNewGameConfirmOpen] = useState(false);
  const [isAiReviewModalOpen, setAiReviewModalOpen] = useState(false);

  const maxNodesPerTurn = inGodMode ? Infinity : (isHost ? 2 : 1);
  const canCreateNode = nodesCreatedThisTurn < maxNodesPerTurn;
  
  const canHostCreateGlobalNode = inGodMode || (isHost ? nodesCreatedThisTurn === 0 : canCreateNode);


  const { toast } = useToast();

  const handleEndTurn = useCallback(() => {
    // Validation check
    for (const node of nodes) {
      const nodeData = node.data as { name?: string; description?: string };
      if (!nodeData.name || !nodeData.description) {
        toast({
          variant: 'destructive',
          title: t('incompleteNodesTitle'),
          description: t('incompleteNodesDescription', { nodeName: nodeData.name || node.id }),
        });
        return;
      }
    }

    // Log changes
    const newNodes = nodes.filter(n => !nodesAtTurnStart.some(n_start => n_start.id === n.id));
    if (newNodes.length > 0) {
        const summary = newNodes.map(n => {
            const nodeData = n.data as { name: string; description: string };
            let nodeSummary = t('logSummaryNodeType', { type: n.type, name: nodeData.name });
            if (nodeData.description) {
                nodeSummary += t('logSummaryDescription', { description: stripHtmlTags(nodeData.description) });
            }
            return nodeSummary;
        }).join(t('logSummaryJoin'));
        
        const logSummary = t('logSummaryAction', { playerName: activePlayer?.name || 'Unknown', summary });
        
        const newLogEntry: LogEntry = {
            playerId: activePlayer?.id || 'unknown',
            playerName: activePlayer?.name || 'Unknown',
            summary: logSummary,
            timestamp: new Date().toISOString(),
            addedNodeIds: newNodes.map(n => n.id),
        };

        setHistoryLog(prev => [...prev, newLogEntry]);

        toast({
            title: t('playerActionLoggedTitle'),
            description: logSummary,
        });
    }

    const nextPlayerIndex = players.length > 1 ? (activePlayerIndex + 1) % players.length : 0;
    setActivePlayerIndex(nextPlayerIndex);
    setNodesCreatedThisTurn(0);
    setFirstNodeThisTurnId(null);
    setNodesAtTurnStart(nodes); // Snapshot nodes for the next turn
    resetAiTurn();

    if (players[nextPlayerIndex]) {
        toast({
            title: t('turnEndedTitle'),
            description: t('nextPlayerTurn', { playerName: players[nextPlayerIndex].name }),
        });
    } else {
         toast({
            title: t('turnEndedTitle'),
            description: t('yourTurnAgain'),
        })
    }
  }, [activePlayer, nodes, nodesAtTurnStart, players, activePlayerIndex, toast, t, resetAiTurn]);

  const handleAiTurn = useCallback(async () => {
    if (!activePlayer?.isAI) return;

    await executeAiTurn(activePlayer, {
      nodes,
      edges,
      historyLog,
      gameSeed,
      locale,
      onSuccess: () => {
        setAiReviewModalOpen(true);
      },
      onError: (error) => {
        console.error('AI turn failed:', error);
        toast({
          variant: 'destructive',
          title: t('aiErrorTitle'),
          description: t('aiFailedToMove'),
        });
        handleEndTurn();
      },
    });
  }, [activePlayer, nodes, edges, historyLog, gameSeed, locale, executeAiTurn, handleEndTurn, toast, t]);

  const handleAcceptAiMove = (content: CritiqueAndRegenerateOutput) => {
    if (!aiMoveProposal) return;
    const { move } = aiMoveProposal;
    const { name, description } = content;
    const parentNode = move.parentId ? nodes.find(n => n.id === move.parentId) : undefined;
    
    const newNodeId = getUniqueNodeId(move.type);
    let newNode: Node | null = null;
    let newEdge: Edge | null = null;

    if (move.type === 'period' && !parentNode) {
      newNode = { id: newNodeId, type: 'period', position: { x: 100, y: 100 }, data: { name, description } };
    } else if (parentNode && move.parentId) {
      const { type } = move;
      if (type === 'event' && parentNode.type === 'period') {
        newNode = { id: newNodeId, type, position: { x: parentNode.position.x, y: parentNode.position.y + 350 }, data: { name, description } };
        newEdge = { id: `edge-${move.parentId}-${newNodeId}`, source: move.parentId, target: newNodeId, sourceHandle: 'child-source', targetHandle: 'period-target', style: { stroke: 'hsl(var(--primary))' } };
      } else if (type === 'scene' && parentNode.type === 'event') {
        newNode = { id: newNodeId, type, position: { x: parentNode.position.x, y: parentNode.position.y + 350 }, data: { name, description } };
        newEdge = { id: `edge-${move.parentId}-${newNodeId}`, source: move.parentId, target: newNodeId, sourceHandle: 'scene-source', targetHandle: 'event-target', style: { stroke: 'hsl(var(--accent))' } };
      } else if (type === 'period' && parentNode.type === 'period') {
        const direction = Math.random() > 0.5 ? 'right' : 'left';
        const xOffset = direction === 'right' ? 300 : -300;
        newNode = { id: newNodeId, type, position: { x: parentNode.position.x + xOffset, y: parentNode.position.y }, data: { name, description } };
        newEdge = { id: `edge-${direction === 'left' ? newNodeId : move.parentId}-${direction === 'left' ? move.parentId : newNodeId}`, source: direction === 'left' ? newNodeId : move.parentId, target: direction === 'left' ? move.parentId : newNodeId, sourceHandle: 'peer-source', targetHandle: 'peer-target', style: { stroke: 'hsl(var(--accent))' } };
      }
    }

    if (newNode) {
      setNodes(nds => nds.concat(newNode));
      if (newEdge) {
        setEdges(eds => addEdge(newEdge, eds));
      }
    }

    setAiReviewModalOpen(false);
    setIsAiTurn(false);
    handleEndTurn();
  };

  const handleCancelAiMove = () => {
    setAiReviewModalOpen(false);
    resetAiTurn();
    handleEndTurn();
  }


  useEffect(() => {
    if (activePlayer?.isAI) {
      // A delay to make the turn change more perceptible
      const timer = setTimeout(() => handleAiTurn(), 1000);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlayer?.id]); // Rerunning only when the active player changes


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
      data: { name: '', description: '' },
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
      data: { name: '', description: '' },
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
      data: { name: '', description: '' },
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
      data: { name: '', description: '' },
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
      title: t('nodeDeletedTitle'),
      description: t('nodeDeletedDescription'),
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
        title: t('disconnectedTitle'),
        description: t('disconnectedDescription'),
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

  const handleNewGame = () => {
    resetGame();
    nodeIdCounter = 3;
    toast({ title: t('newGameTitle'), description: t('newGameDescription') });
    setNewGameConfirmOpen(false);
  };
  
  const saveGame = () => {
    try {
      const saveFile = getSaveFile(nodeIdCounter);
      saveGameToFile(saveFile);
      toast({ title: t('saveSuccessTitle'), description: t('saveSuccessDescription') });
    } catch (error) {
      console.error('Error saving game:', error);
      toast({ variant: 'destructive', title: t('saveErrorTitle'), description: t('saveErrorDescription') });
    }
  };

  const loadGame = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    loadGameFromFile(
      file,
      (saved: SaveFile) => {
        loadGameState(saved);
        nodeIdCounter = saved.nodeIdCounter;
        toast({ title: t('loadSuccessTitle'), description: t('loadSuccessDescription') });
      },
      (error: Error) => {
        console.error('Error loading game:', error);
        toast({ variant: 'destructive', title: t('loadErrorTitle'), description: t('loadErrorDescription') });
      }
    );
    
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
  
  const parentNode = useMemo(() => {
    if (!aiMoveProposal?.move.parentId) return null;
    return nodes.find(n => n.id === aiMoveProposal.move.parentId);
  }, [aiMoveProposal, nodes]);

  const parentNodeData = parentNode?.data as { name?: string } | undefined;

  return (
      <div className="w-full h-screen flex flex-col">
          <header className="p-4 border-b bg-card flex justify-between items-center shadow-sm z-10">
              <h1 className="text-2xl font-headline text-foreground">{t('title')}</h1>
              <div className="flex items-center gap-4">
                  <Toolbar
                      onAddPeriod={() => addNode('period')}
                      onNewGameClick={() => setNewGameConfirmOpen(true)}
                      onSaveClick={saveGame}
                      onLoad={loadGame}
                      isGodMode={inGodMode}
                      setGodMode={setIsGodMode}
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
                        legacies={legacies}
                        setLegacies={setLegacies}
                      />
                      <TurnPanel
                        onEndTurn={handleEndTurn}
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
              <ConfirmationDialog
                isOpen={isNewGameConfirmOpen}
                onClose={() => setNewGameConfirmOpen(false)}
                onConfirm={handleNewGame}
                title={t('newGameConfirmTitle')}
                description={t('newGameConfirmDescription')}
                confirmText={t('newGameConfirmText')}
              />
              {aiMoveProposal && activePlayer?.isAI && (
                <AiReviewModal
                  isOpen={isAiReviewModalOpen}
                  initialProposal={aiMoveProposal.content}
                  nodeType={aiMoveProposal.move.type}
                  personality={activePlayer.personality || 'Neutral'}
                  onAccept={handleAcceptAiMove}
                  onCancel={handleCancelAiMove}
                  parentNodeName={parentNodeData?.name}
                  parentNodeType={parentNode?.type}
                />
              )}
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
