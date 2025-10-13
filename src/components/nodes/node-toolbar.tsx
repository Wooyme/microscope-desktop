import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeftToLine, ArrowRightToLine, Milestone, Trash2, Unlink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type NodeToolbarProps = {
  onAddLeft?: () => void;
  onAddRight?: () => void;
  onDelete?: () => void;
  onAddChild?: () => void;
  onDisconnectLeft?: () => void;
  onDisconnectRight?: () => void;
  className?: string;
};

export default function NodeToolbar({ onAddLeft, onAddRight, onDelete, onAddChild, onDisconnectLeft, onDisconnectRight, className }: NodeToolbarProps) {
  return (
    <TooltipProvider>
      <div className={cn("absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-card border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200", className)}>
        {onAddLeft && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onAddLeft}>
                <ArrowLeftToLine className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Period Before</TooltipContent>
          </Tooltip>
        )}
        {onDisconnectLeft && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onDisconnectLeft}>
                        <Unlink className="w-4 h-4" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Disconnect Left</TooltipContent>
            </Tooltip>
        )}
        {onDelete && (
           <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive" onClick={onDelete}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Node</TooltipContent>
            </Tooltip>
        )}
        {onAddChild && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onAddChild}>
                <Milestone className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Event</TooltipContent>
          </Tooltip>
        )}
        {onAddRight && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onAddRight}>
                <ArrowRightToLine className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Period After</TooltipContent>
          </Tooltip>
        )}
        {onDisconnectRight && (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onDisconnectRight}>
                        <Unlink className="w-4 h-4 transform scale-x-[-1]" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>Disconnect Right</TooltipContent>
            </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
