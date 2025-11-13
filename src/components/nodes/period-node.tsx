import { memo, useState } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CalendarDays } from 'lucide-react';
import NodeToolbar from './node-toolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CharacterEditor from '../character-editor';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { useTranslations } from 'next-intl';

export type PeriodNodeData = {
  name: string;
  description: string;
  imageUrl?: string;
  updateNodeData?: (id: string, data: any) => void;
  addPeriod?: (direction: 'left' | 'right', sourceNodeId: string) => void;
  deleteNode?: (nodeId: string) => void;
  addEvent?: (sourceNodeId: string) => void;
  isConnectedLeft?: boolean;
  isConnectedRight?: boolean;
  disconnectPeer?: (nodeId: string, direction: 'left' | 'right') => void;
  canCreateNode?: boolean;
  canAddChild?: boolean;
}

type PeriodNode = Node<PeriodNodeData, 'period'>;

function PeriodNode({ id, data }: NodeProps<PeriodNode>) {
  const t = useTranslations('Nodes');
  const t_general = useTranslations('General');
  const { 
    name, 
    description, 
    imageUrl, 
    updateNodeData, 
    addPeriod, 
    deleteNode, 
    addEvent, 
    isConnectedLeft = false, 
    isConnectedRight = false, 
    disconnectPeer, 
    canCreateNode = false, 
    canAddChild = false 
  } = data;
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
      <Card className="w-64 shadow-lg border-2 border-primary/50 group relative">
        <NodeToolbar
          onAddLeft={canCreateNode && !isConnectedLeft && addPeriod ? () => addPeriod('left', id) : undefined}
          onAddRight={canCreateNode && !isConnectedRight && addPeriod ? () => addPeriod('right', id) : undefined}
          onDelete={deleteNode ? () => deleteNode(id) : undefined}
          onAddChild={canAddChild && addEvent ? () => addEvent(id) : undefined}
          onDisconnectLeft={isConnectedLeft && disconnectPeer ? () => disconnectPeer(id, 'left') : undefined}
          onDisconnectRight={isConnectedRight && disconnectPeer ? () => disconnectPeer(id, 'right') : undefined}
          addLeftTooltip={t('addPeriodBeforeTooltip')}
          addRightTooltip={t('addPeriodAfterTooltip')}
          addChildTooltip={t('addEventTooltip')}
        />
        <DialogTrigger asChild disabled={!isEditable}>
            <div className={cn(isEditable && "cursor-pointer")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/10 p-0">
                 {imageUrl ? (
                  <div className="relative w-full h-32">
                    <Image src={imageUrl} alt={name} fill className="object-cover rounded-t-lg" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <CardTitle className="text-lg font-headline flex items-center gap-2 absolute bottom-2 left-4 text-white">
                      <CalendarDays className="w-5 h-5" />
                      {t('period')}
                    </CardTitle>
                  </div>
                ) : (
                  <div className='p-4'>
                    <CardTitle className="text-lg font-headline flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      {t('period')}
                    </CardTitle>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-4 space-y-2">
                <Input
                  value={name}
                  onChange={onNameChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={t('periodNamePlaceholder')}
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
        <Handle type="source" position={Position.Right} id="peer-source" className="w-3 h-3 !bg-accent" />
        <Handle type="target" position={Position.Left} id="peer-target" className="w-3 h-3 !bg-accent" />
        <Handle type="source" position={Position.Bottom} id="child-source" className="w-3 h-3 !bg-primary" />
      </Card>
      <DialogContent className="sm:max-w-4xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('editPeriodTitle', { name })}</DialogTitle>
        </DialogHeader>
        <div className="py-4 flex-grow flex flex-col">
            <CharacterEditor
              content={description}
              onUpdate={onDescriptionChange}
              imageUrl={imageUrl}
              onImageUpdate={onImageChange}
            />
        </div>
        <DialogFooter className='mt-auto pt-4'>
          <Button onClick={() => setIsModalOpen(false)}>{t_general('done')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(PeriodNode);
