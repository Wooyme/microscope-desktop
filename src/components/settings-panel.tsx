'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Player } from '@/lib/types';
import { User } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import LegacyPanel from './legacy-panel';

type SettingsPanelProps = {
  bigPicture: string;
  focus: string;
  setFocus: (focus: string) => void;
  onBigPictureClick: () => void;
  activePlayer: Player | undefined;
  legacies: string[];
  setLegacies: (legacies: string[]) => void;
};

export default function SettingsPanel({ bigPicture, focus, setFocus, onBigPictureClick, activePlayer, legacies, setLegacies }: SettingsPanelProps) {
  const t = useTranslations('SettingsPanel');
  const t_general = useTranslations('General');
  const [isEditing, setIsEditing] = useState(false);
  const [localFocus, setLocalFocus] = useState(focus);

  const handleSave = () => {
    setFocus(localFocus);
    setIsEditing(false);
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-72 space-y-2">
       {activePlayer ? (
        <div>
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{t('activePlayer')}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{getInitials(activePlayer.name)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-foreground">{t('playerTurn', { playerName: activePlayer.name })}</span>
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{t('activePlayer')}</h3>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <User className="h-5 w-5" />
            <span>{t('noActivePlayer')}</span>
          </div>
        </div>
      )}
      
      <Separator />

      <div>
        <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{t('bigPicture')}</h3>
        <p
          className="text-sm text-foreground/80 whitespace-pre-wrap cursor-pointer hover:text-foreground"
          onClick={onBigPictureClick}
        >
          {bigPicture}
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{t('focus')}</h3>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={localFocus}
              onChange={(e) => setLocalFocus(e.target.value)}
              placeholder={t('focusPlaceholder')}
              className="h-24 bg-background/80"
            />
            <Button size="sm" onClick={handleSave}>{t_general('save')}</Button>
          </div>
        ) : focus ? (
          <p
            className="text-sm text-muted-foreground whitespace-pre-wrap cursor-pointer hover:text-foreground"
            onClick={() => {
              setLocalFocus(focus);
              setIsEditing(true);
            }}
          >
            {focus}
          </p>
        ) : (
          <p
            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground"
            onClick={() => setIsEditing(true)}
          >
            {t('noFocusSet')}
          </p>
        )}
      </div>

      <Separator />

      <LegacyPanel legacies={legacies} setLegacies={setLegacies} />

    </div>
  );
}
