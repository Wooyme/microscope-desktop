import { memo, useState } from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera, MessageSquare } from 'lucide-react';
import NodeToolbar from './node-toolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CharacterEditor from '../character-editor';
import { cn } from '@/lib/utils';
import { Textarea } from '../ui/textarea';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RoleplayModal from '../roleplay-modal';
import type { DialogueMessage } from '@/lib/types';

export type SceneNodeData = {
  name: string;
  description: string;
  imageUrl?: string;
  mode?: 'description' | 'roleplay';
  conversation?: DialogueMessage[];
  updateNodeData?: (id: string, data: any) => void;
  deleteNode?: (nodeId: string) => void;
}

type SceneNode = Node<SceneNodeData, 'scene'>;

function SceneNode({ id, data }: NodeProps<SceneNode>) {
  const t = useTranslations('Nodes');
  const t_general = useTranslations('General');
  const { name, description, imageUrl, updateNodeData, deleteNode, mode = 'description', conversation = [] } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(mode);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (value: string) => {
    if(updateNodeData) updateNodeData(id, { description: value });
  };

  const onImageChange = (url: string | null) => {
    if (updateNodeData) updateNodeData(id, { imageUrl: url });
  };

  const onConversationChange = (newConversation: DialogueMessage[]) => {
    if (updateNodeData) updateNodeData(id, { conversation: newConversation });
  };

  const onTabChange = (newTab: string) => {
    setActiveTab(newTab as 'description' | 'roleplay');
    if (updateNodeData) updateNodeData(id, { mode: newTab });
  };

  const isEditable = !!updateNodeData;
  const isRoleplay = mode === 'roleplay';

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card className="w-64 shadow-lg border-2 border-green-500/50 group relative">
          <NodeToolbar
              onDelete={deleteNode ? () => deleteNode(id) : undefined}
          />
        <DialogTrigger asChild disabled={!isEditable}>
          <div className={cn(isEditable && "cursor-pointer")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-500/10 p-0">
              {imageUrl ? (
                <div className="relative w-full h-32">
                  <Image src={imageUrl} alt={name} fill className="object-cover rounded-t-lg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <CardTitle className="text-lg font-headline flex items-center gap-2 absolute bottom-2 left-4 text-white">
                    {isRoleplay ? <MessageSquare className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    {isRoleplay ? t('roleplayScene') : t('scene')}
                  </CardTitle>
                </div>
              ) : (
                <div className="p-4 text-green-700">
                  <CardTitle className="text-lg font-headline flex items-center gap-2">
                    {isRoleplay ? <MessageSquare className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                    {isRoleplay ? t('roleplayScene') : t('scene')}
                  </CardTitle>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Input
                value={name}
                onChange={onNameChange}
                onClick={(e) => e.stopPropagation()}
                placeholder={t('sceneNamePlaceholder')}
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
        <Handle type="target" position={Position.Top} id="event-target" className="w-3 h-3 !bg-accent" />
      </Card>

      <DialogContent className="sm:max-w-4xl w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('editSceneTitle', { name })}</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={onTabChange} className="flex-grow flex flex-col">
          <TabsList>
            <TabsTrigger value="description">{t_general('description')}</TabsTrigger>
            <TabsTrigger value="roleplay">{t_general('roleplay')}</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="flex-grow mt-4">
            <CharacterEditor
                content={description}
                onUpdate={onDescriptionChange}
                imageUrl={imageUrl}
                onImageUpdate={onImageChange}
              />
          </TabsContent>
          <TabsContent value="roleplay" className="flex-grow mt-4">
            <RoleplayModal 
              sceneName={name}
              sceneDescription={description}
              conversation={conversation}
              onConversationChange={onConversationChange}
            />
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-auto pt-4">
          <Button onClick={() => setIsModalOpen(false)}>{t_general('done')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(SceneNode);
