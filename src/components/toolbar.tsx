import { BrainCircuit, CalendarPlus, Milestone, Eye, EyeOff, FileDown, FileUp, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import React from 'react';

type ToolbarProps = {
  addNode: (type: 'period' | 'event' | 'scene') => void;
  getSuggestions: () => void;
  isGenerating: boolean;
  isReviewMode: boolean;
  setReviewMode: (value: boolean) => void;
  exportHistory: () => void;
  importHistory: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Toolbar({ addNode, getSuggestions, isGenerating, isReviewMode, setReviewMode, exportHistory, importHistory }: ToolbarProps) {
  const importInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 p-1 rounded-lg border bg-card">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => addNode('period')}>
              <CalendarPlus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Period</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => addNode('event')}>
              <Milestone />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Event</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => addNode('scene')}>
              <Camera />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Add Scene</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={getSuggestions} disabled={isGenerating}>
              <BrainCircuit className={isGenerating ? 'animate-pulse' : ''} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isGenerating ? 'Weaving...' : 'Suggest Legacies'}</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <input
            type="file"
            ref={importInputRef}
            className="hidden"
            accept=".json"
            onChange={importHistory}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={() => importInputRef.current?.click()}>
              <FileUp />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import History</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={exportHistory}>
              <FileDown />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export History</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center space-x-2 px-2">
          <Switch
            id="review-mode"
            checked={isReviewMode}
            onCheckedChange={setReviewMode}
            aria-label="Review Mode"
          />
          <Label htmlFor="review-mode" className="flex items-center gap-2 cursor-pointer">
            {isReviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="text-sm">Review</span>
          </Label>
        </div>
      </div>
    </TooltipProvider>
  );
}
