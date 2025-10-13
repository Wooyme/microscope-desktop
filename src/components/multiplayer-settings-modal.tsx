'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, PlusCircle, User, Bot } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Player } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

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

export default function MultiplayerSettingsModal({ isOpen, onClose, players, setPlayers }: MultiplayerSettingsModalProps) {
  const [newPlayerName, setNewPlayerName] = useState('');

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
    const aiPlayers = players.filter(p => p.isAI);
    const newAiName = `AI Player ${aiPlayers.length + 1}`;
    const newPlayer: Player = {
      id: getUniquePlayerId(),
      name: newAiName,
      isAI: true,
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
             <Button variant="outline" className="w-full" onClick={handleAddAiPlayer}>
                <Bot className="mr-2" />
                Add AI Player
            </Button>
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
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-secondary-foreground">{player.name}</span>
                        {player.isAI && <Bot className="text-muted-foreground" size={16} />}
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
