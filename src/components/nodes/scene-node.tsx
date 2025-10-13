import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import NodeToolbar from './node-toolbar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CharacterEditor from '../character-editor';

type SceneNodeData = {
  name: string;
  description: string;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
}

function SceneNode({ id, data }: NodeProps<SceneNodeData>) {
  const { name, description, updateNodeData, deleteNode } = data;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (value: string) => {
    if(updateNodeData) updateNodeData(id, { description: value });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const isEditable = !!updateNodeData;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card className="w-64 shadow-lg border-2 border-green-500/50 group relative">
          <NodeToolbar
              onDelete={() => deleteNode(id)}
          />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-500/10">
          <CardTitle className="text-lg font-headline flex items-center gap-2 text-green-700">
            <Camera className="w-5 h-5" />
            Scene
          </CardTitle>
        </CardHeader>
        <DialogTrigger asChild disabled={!isEditable}>
          <div className={cn(isEditable && "cursor-pointer")}>
            <CardContent className="p-4 space-y-2">
              <Input
                value={name}
                onChange={onNameChange}
                onClick={(e) => e.stopPropagation()}
                placeholder="Scene Name"
                className="text-base font-semibold"
                disabled={!isEditable}
              />
              <p className="text-sm text-muted-foreground h-[60px] overflow-hidden">
                {truncateText(description.replace(/<[^>]+>/g, ''), 100) || "Click to add a description..."}
              </p>
            </CardContent>
          </div>
        </DialogTrigger>
        <Handle type="target" position={Position.Top} id="event-target" className="w-3 h-3 !bg-accent" />
      </Card>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Scene: {name}</DialogTitle>
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

export default memo(SceneNode);

    