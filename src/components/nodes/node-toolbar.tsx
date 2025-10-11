import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeftToLine, ArrowRightToLine, Milestone, Trash2 } from 'lucide-react';

type NodeToolbarProps = {
  onAddLeft?: () => void;
  onAddRight?: () => void;
  onDelete?: () => void;
  onAddChild?: () => void;
  className?: string;
};

export default function NodeToolbar({ onAddLeft, onAddRight, onDelete, onAddChild, className }: NodeToolbarProps) {
  return (
    <div className={cn("absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-card border rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200", className)}>
      {onAddLeft && (
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onAddLeft}>
          <ArrowLeftToLine className="w-4 h-4" />
        </Button>
      )}
      {onDelete && (
        <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
      {onAddChild && (
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onAddChild}>
          <Milestone className="w-4 h-4" />
        </Button>
      )}
      {onAddRight && (
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={onAddRight}>
          <ArrowRightToLine className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
