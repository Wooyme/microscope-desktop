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

type EventNodeData = {
  name: string;
  description: string;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
  addScene: (sourceNodeId: string) => void;
  canAddChild: boolean;
};

function EventNode({ id, data }: NodeProps<EventNodeData>) {
  const { name, description, updateNodeData, deleteNode, addScene, canAddChild } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (value: string) => {
    if(updateNodeData) updateNodeData(id, { description: value });
  };

  const isEditable = !!updateNodeData;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card className="w-64 shadow-lg border-2 border-accent/50 group relative">
        <NodeToolbar
          onDelete={() => deleteNode(id)}
          onAddChild={canAddChild ? () => addScene(id) : undefined}
        />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-accent/10">
          <CardTitle className="text-lg font-headline flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Event
          </CardTitle>
        </CardHeader>
        <DialogTrigger asChild disabled={!isEditable}>
          <div className={cn(isEditable && "cursor-pointer")}>
            <CardContent className="p-4 space-y-2">
              <Input
                value={name}
                onChange={onNameChange}
                onClick={(e) => e.stopPropagation()}
                placeholder="Event Name"
                className="text-base font-semibold"
                disabled={!isEditable}
              />
               <Textarea
                value={description.replace(/<[^>]+>/g, '')}
                placeholder="Click to add a description..."
                className="text-sm text-muted-foreground h-[60px] overflow-hidden bg-transparent p-0 border-0 resize-none focus-visible:ring-0"
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Event: {name}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <CharacterEditor
            content={description}
            onUpdate={onDescriptionChange}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => setIsModalOpen(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(EventNode);
