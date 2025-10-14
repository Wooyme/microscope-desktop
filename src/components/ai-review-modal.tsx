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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('AiReviewModal');
  const t_general = useTranslations('General');
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
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('errorDescription') });
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
  
  const parentContextText = parentNodeName && parentNodeType ? t.rich('parentContext', {
    nodeType: t_general(nodeType as 'period' | 'event' | 'scene'),
    parentNodeType: t_general(parentNodeType as 'period' | 'event' | 'scene'),
    parentNodeName: parentNodeName,
    strong: (chunks) => <strong>{chunks}</strong>,
    em: (chunks) => <em>&quot;{chunks}&quot;</em>,
  }) : '';


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="font-headline">{t('title')}</DialogTitle>
          <DialogDescription>
             {t('description', { nodeType: t_general(nodeType as 'period' | 'event' | 'scene') })} {parentContextText}
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
                <Label className="font-semibold">{t_general('name')}</Label>
                <p className="text-lg font-bold p-2 border rounded-md bg-muted min-h-[2.5rem]">
                  {currentProposal?.name}
                </p>
              </div>
              <div>
                <Label className="font-semibold">{t_general('description')}</Label>
                <p className="text-sm p-2 border rounded-md bg-muted min-h-[6rem]">
                  {currentProposal?.description}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="feedback">{t('feedbackLabel')}</Label>
            <Textarea
              id="feedback"
              placeholder={t('feedbackPlaceholder')}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={isRegenerating}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isRegenerating}>
            {t_general('cancel')}
          </Button>
          <Button onClick={handleRegenerate} disabled={!feedback.trim() || isRegenerating}>
            {isRegenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('regenerate')}
          </Button>
          <Button onClick={handleAccept} disabled={isRegenerating || !currentProposal}>
            {t_general('accept')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
