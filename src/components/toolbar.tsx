import { CalendarPlus, Milestone, Crown, FileDown, FileUp, Camera, Settings, Users, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';

type ToolbarProps = {
  onNewGameClick: () => void;
  onSaveClick: () => void;
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isGodMode: boolean;
  setGodMode: (value: boolean) => void;
  onGameSeedClick: () => void;
  onMultiplayerClick: () => void;
  canCreateNode: boolean;
};

export default function Toolbar({ onNewGameClick, onSaveClick, onLoad, isGodMode, setGodMode, onGameSeedClick, onMultiplayerClick, canCreateNode }: ToolbarProps) {
  const importInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 p-1 rounded-lg border bg-card">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onNewGameClick}>
              <FilePlus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>New Game</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <input
            type="file"
            ref={importInputRef}
            className="hidden"
            accept=".json"
            onChange={onLoad}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => importInputRef.current?.click()}>
              <FileUp />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Load Game</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onSaveClick}>
              <FileDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save Game</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onGameSeedClick}>
              <Settings />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Game Seed</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onMultiplayerClick}>
              <Users />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Multiplayer Settings</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-2 px-2">
          <Switch
            id="god-mode"
            checked={isGodMode}
            onCheckedChange={setGodMode}
            aria-label="God Mode"
          />
          <Label htmlFor="god-mode" className="flex items-center gap-2 cursor-pointer">
            <Crown size={16} className={isGodMode ? 'text-amber-400' : ''} />
            <span className="text-sm">God Mode</span>
          </Label>
        </div>
      </div>
    </TooltipProvider>
  );
}
