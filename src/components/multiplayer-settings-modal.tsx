'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, PlusCircle, User, Bot, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Player, AiStrategy } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

type MultiplayerSettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

let playerIdCounter = 3;
const getUniquePlayerId = () => `player-${playerIdCounter++}`;

const aiPersonalities = ["Creative", "Logical", "Chaotic", "Historian", "Pragmatist"];
const aiStrategies: AiStrategy[] = ["Balanced", "Builder", "Detailer", "Focuser"];

export default function MultiplayerSettingsModal({ isOpen, onClose, players, setPlayers }: MultiplayerSettingsModalProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedPersonality, setSelectedPersonality] = useState(aiPersonalities[0]);
  const [selectedStrategy, setSelectedStrategy] = useState<AiStrategy>(aiStrategies[0]);

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      const newPlayer: Player = {
        id: getUniquePlayerId(),
        name: newPlayerName.trim(),
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const handleAddAiPlayer = () => {
    const aiPlayersWithSamePersonality = players.filter(p => p.isAI && p.personality === selectedPersonality);
    const newAiName = `${selectedPersonality} AI ${aiPlayersWithSamePersonality.length + 1}`;
    const newPlayer: Player = {
      id: getUniquePlayerId(),
      name: newAiName,
      isAI: true,
      personality: selectedPersonality,
      strategy: selectedStrategy,
    };
    setPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter((p) => p.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Multiplayer Settings</DialogTitle>
          <DialogDescription>Manage the players in your session.</DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-player">Add Human Player</Label>
            <div className="flex items-center gap-2">
              <Input
                id="new-player"
                placeholder="New player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              />
              <Button variant="ghost" size="icon" onClick={handleAddPlayer}>
                  <PlusCircle className="text-green-500" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
             <Label>Add AI Player</Label>
             <div className="space-y-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            Personality: {selectedPersonality}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {aiPersonalities.map(p => (
                            <DropdownMenuItem key={p} onClick={() => setSelectedPersonality(p)}>
                                {p}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                            Strategy: {selectedStrategy}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {aiStrategies.map(s => (
                            <DropdownMenuItem key={s} onClick={() => setSelectedStrategy(s)}>
                                {s}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={handleAddAiPlayer} className="w-full">
                    <Bot className="mr-2" /> Add AI Player
                </Button>
             </div>
          </div>
          
          <Separator />

          <h4 className="font-medium">Current Players</h4>
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {players.length > 0 ? (
                players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(player.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-secondary-foreground">{player.name}</span>
                        {player.isAI && <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Bot size={14} />
                            <span>{player.personality} ({player.strategy})</span>
                        </div>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground py-10">
                  <User className="mx-auto h-8 w-8 mb-2" />
                  No players yet. Add one above!
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
