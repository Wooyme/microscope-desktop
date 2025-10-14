'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { critiqueAndRegenerate } from '@/ai/flows/critique-and-regenerate';
import { useToast } from '@/hooks/use-toast';
import type { CritiqueAndRegenerateOutput } from '@/lib/types';

type AiReviewModalProps = {
  isOpen: boolean;
  initialProposal: CritiqueAndRegenerateOutput;
  nodeType: string;
  personality: string;
  onAccept: (proposal: CritiqueAndRegenerateOutput) => void;
  onCancel: () => void;
  parentNodeName?: string;
  parentNodeType?: string;
};

export default function AiReviewModal({
  isOpen,
  initialProposal,
  nodeType,
  personality,
  onAccept,
  onCancel,
  parentNodeName,
  parentNodeType,
}: AiReviewModalProps) {
  const [currentProposal, setCurrentProposal] = useState<CritiqueAndRegenerateOutput | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setCurrentProposal(initialProposal);
      setFeedback('');
    }
  }, [isOpen, initialProposal]);

  const handleRegenerate = async () => {
    if (!feedback.trim() || !currentProposal) {
      return;
    }
    
    setIsRegenerating(true);
    try {
      const newContent = await critiqueAndRegenerate({
        personality,
        nodeType: nodeType as 'period' | 'event' | 'scene',
        originalName: currentProposal.name,
        originalDescription: currentProposal.description,
        feedback: feedback,
      });
      setCurrentProposal(newContent);
      setFeedback('');
    } catch (error) {
      console.error("AI regeneration failed:", error);
      toast({ variant: 'destructive', title: "AI Error", description: "Failed to regenerate content." });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleAccept = () => {
    if (currentProposal) {
      onAccept(currentProposal);
    }
  };

  const showLoading = isRegenerating || !currentProposal;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Suggestion</DialogTitle>
          <DialogDescription>
            The AI proposes the following {nodeType}.{' '}
            {parentNodeName && parentNodeType && (
                <span>This <strong>{nodeType}</strong> will be added under the <strong>{parentNodeType}</strong> named <em>&quot;{parentNodeName}&quot;</em>.</span>
            )}
            Review it, provide feedback for regeneration, or accept it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {showLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Name</Label>
                <p className="text-lg font-bold p-2 border rounded-md bg-muted min-h-[2.5rem]">
                  {currentProposal?.name}
                </p>
              </div>
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="text-sm p-2 border rounded-md bg-muted min-h-[6rem]">
                  {currentProposal?.description}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="feedback">Feedback for Regeneration (Optional)</Label>
            <Textarea
              id="feedback"
              placeholder="e.g., 'Make it more mysterious' or 'That name sounds too modern...'"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isRegenerating}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isRegenerating}>
            Cancel Move
          </Button>
          <Button onClick={handleRegenerate} disabled={!feedback.trim() || isRegenerating}>
            {isRegenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Regenerate
          </Button>
          <Button onClick={handleAccept} disabled={isRegenerating || !currentProposal}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
