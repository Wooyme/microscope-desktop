'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, PlusCircle } from 'lucide-react';
import { Separator } from './ui/separator';

type GameSeedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // TODO: Add props for game seed data and update functions
};

export default function GameSeedModal({ isOpen, onClose }: GameSeedModalProps) {
  const [bigPicture, setBigPicture] = useState('A grand space opera about the last remnants of humanity searching for a new home.');
  const [palette, setPalette] = useState(['Ancient alien artifacts', 'Political intrigue', 'FTL travel consequences']);
  const [banned, setBanned] = useState(['Magic', 'Time travel']);
  const [newPaletteItem, setNewPaletteItem] = useState('');
  const [newBannedItem, setNewBannedItem] = useState('');

  const handleAddItem = (list: string[], setList: (list: string[]) => void, newItem: string, setNewItem: (item: string) => void) => {
    if (newItem && !list.includes(newItem)) {
      setList([...list, newItem]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (list: string[], setList: (list: string[]) => void, itemToRemove: string) => {
    setList(list.filter(item => item !== itemToRemove));
  };

  const handleSave = () => {
    // TODO: Implement save logic
    console.log({ bigPicture, palette, banned });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Game Seed</DialogTitle>
          <DialogDescription>
            Define the core concepts and constraints for your game session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-grow overflow-y-auto pr-4 space-y-6">
            <div>
              <Label htmlFor="big-picture" className="text-lg font-semibold">The Big Picture</Label>
              <Textarea
                id="big-picture"
                value={bigPicture}
                onChange={(e) => setBigPicture(e.target.value)}
                placeholder="What is the central theme or conflict?"
                className="mt-2 h-24"
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Palette</h3>
              <p className="text-sm text-muted-foreground">Add ingredients you want to see in the game.</p>
              <div className="flex gap-2">
                <Input
                  value={newPaletteItem}
                  onChange={(e) => setNewPaletteItem(e.target.value)}
                  placeholder="e.g., 'Cyberpunk aesthetics'"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(palette, setPalette, newPaletteItem, setNewPaletteItem)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleAddItem(palette, setPalette, newPaletteItem, setNewPaletteItem)}>
                  <PlusCircle className="text-green-500" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {palette.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-secondary rounded-full pl-3 pr-1 py-1 text-sm">
                    {item}
                    <button onClick={() => handleRemoveItem(palette, setPalette, item)} className="rounded-full hover:bg-secondary-foreground/20 p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Banned Ingredients</h3>
              <p className="text-sm text-muted-foreground">Add elements you want to avoid.</p>
              <div className="flex gap-2">
                <Input
                  value={newBannedItem}
                  onChange={(e) => setNewBannedItem(e.target.value)}
                  placeholder="e.g., 'Dragons'"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem(banned, setBanned, newBannedItem, setNewBannedItem)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleAddItem(banned, setBanned, newBannedItem, setNewBannedItem)}>
                  <PlusCircle className="text-green-500" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {banned.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-destructive/20 rounded-full pl-3 pr-1 py-1 text-sm text-destructive-foreground">
                    {item}
                    <button onClick={() => handleRemoveItem(banned, setBanned, item)} className="rounded-full hover:bg-destructive-foreground/20 p-0.5">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Seed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}