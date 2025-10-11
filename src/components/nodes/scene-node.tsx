import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Camera } from 'lucide-react';
import NodeToolbar from './node-toolbar';

type SceneNodeData = {
  name: string;
  description: string;
  updateNodeData: (id: string, data: any) => void;
  deleteNode: (nodeId: string) => void;
}

function SceneNode({ id, data }: NodeProps<SceneNodeData>) {
  const { name, description, updateNodeData, deleteNode } = data;

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(updateNodeData) updateNodeData(id, { description: e.target.value });
  };

  return (
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
      <CardContent className="p-4 space-y-2">
        <Input
          value={name}
          onChange={onNameChange}
          placeholder="Scene Name"
          className="text-base font-semibold"
        />
        <Textarea
          value={description}
          onChange={onDescriptionChange}
          placeholder="Description..."
          className="text-sm"
          rows={3}
        />
      </CardContent>
      <Handle type="target" position={Position.Top} id="event-target" className="w-3 h-3 !bg-accent" />
    </Card>
  );
}

export default memo(SceneNode);
