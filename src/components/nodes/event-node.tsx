import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Sparkles } from 'lucide-react';
import NodeToolbar from './node-toolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CharacterEditor from '../character-editor';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslations } from 'next-intl';

type EventNodeData = {
  name: string;
  description: string;
  imageUrl?: string;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  addScene: (sourceNodeId: string) => void;
  canAddChild: boolean;
};

function EventNode({ id, data }: NodeProps<EventNodeData>) {
  const t = useTranslations('Nodes');
  const t_general = useTranslations('General');
  const { name, description, imageUrl, updateNodeData, deleteNode, addScene, canAddChild } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (value: string) => {
    if(updateNodeData) updateNodeData(id, { description: value });
  };

  const onImageChange = (url: string | null) => {
    if (updateNodeData) updateNodeData(id, { imageUrl: url });
  };

  const isEditable = !!updateNodeData;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card className="w-64 shadow-lg border-2 border-accent/50 group relative">
        <NodeToolbar
          onDelete={() => deleteNode(id)}
          onAddChild={canAddChild ? () => addScene(id) : undefined}
          addChildTooltip={t('addSceneTooltip')}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-accent/10 p-0">
          {imageUrl ? (
            <div className="relative w-full h-32">
              <Image src={imageUrl} alt={name} fill className="object-cover rounded-t-lg" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <CardTitle className="text-lg font-headline flex items-center gap-2 absolute bottom-2 left-4 text-white">
                <Sparkles className="w-5 h-5" />
                {t('event')}
              </CardTitle>
            </div>
          ) : (
            <div className='p-4'>
              <CardTitle className="text-lg font-headline flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {t('event')}
              </CardTitle>
            </div>
          )}
        </CardHeader>
        <DialogTrigger asChild disabled={!isEditable}>
          <div className={cn(isEditable && "cursor-pointer")}>
            <CardContent className="p-4 space-y-2">
              <Input
                value={name}
                onChange={onNameChange}
                onClick={(e) => e.stopPropagation()}
                placeholder={t('eventNamePlaceholder')}
                className="text-base font-semibold"
                disabled={!isEditable}
              />
               <Textarea
                value={description.replace(/<[^>]+>/g, '')}
                placeholder={t('descriptionPlaceholder')}
                className="text-sm"
                readOnly
                disabled={!isEditable}
                rows={3}
              />
            </CardContent>
          </div>
        </DialogTrigger>
        <Handle type="target" position={Position.Top} id="period-target" className="w-3 h-3 !bg-primary" />
        <Handle type="source" position={Position.Bottom} id="scene-source" className="w-3 h-3 !bg-green-500" />
      </Card>
      <DialogContent className="sm:max-w-4xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('editEventTitle', { name })}</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex-grow flex flex-col">
            <CharacterEditor
              content={description}
              onUpdate={onDescriptionChange}
              imageUrl={imageUrl}
              onImageUpdate={onImageChange}
            />
        </div>
        <DialogFooter className="mt-auto pt-4">
          <Button onClick={() => setIsModalOpen(false)}>{t_general('done')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(EventNode);
