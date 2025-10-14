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
import { Input } from '@/components/ui/input';
import { X, PlusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ScrollArea } from './ui/scroll-area';

type LegacyEditorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  legacies: string[];
  setLegacies: (legacies: string[]) => void;
};

export default function LegacyEditorModal({
  isOpen,
  onClose,
  legacies,
  setLegacies,
}: LegacyEditorModalProps) {
  const t = useTranslations('LegacyEditorModal');
  const t_general = useTranslations('General');
  const [localLegacies, setLocalLegacies] = useState(legacies);
  const [newLegacyItem, setNewLegacyItem] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalLegacies(legacies);
    }
  }, [isOpen, legacies]);

  const handleAddItem = () => {
    if (newLegacyItem && !localLegacies.includes(newLegacyItem)) {
      setLocalLegacies([...localLegacies, newLegacyItem]);
      setNewLegacyItem('');
    }
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setLocalLegacies(localLegacies.filter((item) => item !== itemToRemove));
  };

  const handleSave = () => {
    setLegacies(localLegacies);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex gap-2">
            <Input
              value={newLegacyItem}
              onChange={(e) => setNewLegacyItem(e.target.value)}
              placeholder={t('newLegacyPlaceholder')}
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <Button variant="ghost" size="icon" onClick={handleAddItem}>
              <PlusCircle className="text-green-500" />
            </Button>
          </div>
          <ScrollArea className="h-48 w-full rounded-md p-2 bg-background/50">
            <div className="flex flex-col gap-2">
              {localLegacies.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 bg-secondary rounded-md p-2 text-sm"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="rounded-full hover:bg-secondary-foreground/20 p-0.5"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t_general('cancel')}
          </Button>
          <Button onClick={handleSave}>{t_general('save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
