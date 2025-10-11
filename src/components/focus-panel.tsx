'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type FocusPanelProps = {
  focus: string;
  setFocus: (focus: string) => void;
};

export default function FocusPanel({ focus, setFocus }: FocusPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localFocus, setLocalFocus] = useState(focus);

  const handleSave = () => {
    setFocus(localFocus);
    setIsEditing(false);
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-grow">
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={localFocus}
                    onChange={(e) => setLocalFocus(e.target.value)}
                    placeholder="What is the central theme of this session?"
                    className="h-24"
                  />
                  <Button size="sm" onClick={handleSave}>Save</Button>
                </div>
              ) : focus ? (
                <p
                  className="text-sm text-muted-foreground whitespace-pre-wrap cursor-pointer"
                  onClick={() => {
                    setLocalFocus(focus);
                    setIsEditing(true);
                  }}
                >
                  {focus}
                </p>
              ) : (
                <p
                  className="text-sm text-muted-foreground cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  No focus set.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
