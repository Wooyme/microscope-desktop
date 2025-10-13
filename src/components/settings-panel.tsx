'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Player } from '@/lib/types';
import { User } from 'lucide-react';
import { getInitials } from '@/lib/utils';

type SettingsPanelProps = {
  bigPicture: string;
  focus: string;
  setFocus: (focus: string) => void;
  onBigPictureClick: () => void;
  activePlayer: Player | undefined;
};

export default function SettingsPanel({ bigPicture, focus, setFocus, onBigPictureClick, activePlayer }: SettingsPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localFocus, setLocalFocus] = useState(focus);

  const handleSave = () => {
    setFocus(localFocus);
    setIsEditing(false);
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-80 space-y-2 p-4 rounded-lg">
       {activePlayer ? (
        <div>
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Active Player</h3>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(activePlayer.name)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{activePlayer.name}'s Turn</span>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Active Player</h3>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <User className="h-5 w-5" />
            <span>No active player</span>
          </div>
        </div>
      )}
      
      <Separator />

      <div>
        <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Big Picture</h3>
        <p
          className="text-sm text-foreground/80 whitespace-pre-wrap cursor-pointer hover:text-foreground"
          onClick={onBigPictureClick}
        >
          {bigPicture}
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">Focus</h3>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={localFocus}
              onChange={(e) => setLocalFocus(e.target.value)}
              placeholder="What is the central theme of this session?"
              className="h-24 bg-background/80"
            />
            <Button size="sm" onClick={handleSave}>Save</Button>
          </div>
        ) : focus ? (
          <p
            className="text-sm text-muted-foreground whitespace-pre-wrap cursor-pointer hover:text-foreground"
            onClick={() => {
              setLocalFocus(focus);
              setIsEditing(true);
            }}
          >
            {focus}
          </p>
        ) : (
          <p
            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => setIsEditing(true)}
          >
            No focus set.
          </p>
        )}
      </div>
    </div>
  );
}
