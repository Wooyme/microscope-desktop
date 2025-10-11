import { BrainCircuit, CalendarPlus, Milestone, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type ToolbarProps = {
  addNode: (type: 'period' | 'event') => void;
  getSuggestions: () => void;
  isGenerating: boolean;
  isReviewMode: boolean;
  setReviewMode: (value: boolean) => void;
};

export default function Toolbar({ addNode, getSuggestions, isGenerating, isReviewMode, setReviewMode }: ToolbarProps) {
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
