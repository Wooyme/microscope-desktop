'use client';

import { useState } from 'react';
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
import type { CritiqueAndRegenerateOutput } from '@/ai/flows/critique-and-regenerate';

type AiReviewModalProps = {
  isOpen: boolean;
  proposal: CritiqueAndRegenerateOutput | undefined | null;
  nodeType?: string;
  isRegenerating: boolean;
  onAccept: () => void;
  onRegenerate: (feedback: string) => void;
  onCancel: () => void;
};

export default function AiReviewModal({
  isOpen,
  proposal,
  nodeType,
  isRegenerating,
  onAccept,
  onRegenerate,
  onCancel,
}: AiReviewModalProps) {
  const [feedback, setFeedback] = useState('');

  const handleRegenerate = () => {
    if (feedback.trim()) {
      onRegenerate(feedback);
      setFeedback('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline">AI Suggestion</DialogTitle>
          <DialogDescription>
            The AI proposes the following {nodeType || 'node'}. Review it, provide feedback for regeneration, or accept it.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {isRegenerating && !proposal ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Name</Label>
                <p className="text-lg font-bold p-2 border rounded-md bg-muted min-h-[2.5rem]">
                  {proposal?.name}
                </p>
              </div>
              <div>
                <Label className="font-semibold">Description</Label>
                <p className="text-sm p-2 border rounded-md bg-muted min-h-[6rem]">
                  {proposal?.description}
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
          <Button onClick={onAccept} disabled={isRegenerating}>
            Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
