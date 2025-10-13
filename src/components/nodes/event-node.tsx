import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Milestone } from 'lucide-react';
import NodeToolbar from './node-toolbar';

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

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(updateNodeData) updateNodeData(id, { description: e.target.value });
  };

  return (
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
      <CardContent className="p-4 space-y-2">
        <Input
          value={name}
          onChange={onNameChange}
          placeholder="Event Name"
          className="text-base font-semibold"
          disabled={!updateNodeData}
        />
        <Textarea
          value={description}
          onChange={onDescriptionChange}
          placeholder="Description..."
          className="text-sm"
          rows={3}
          disabled={!updateNodeData}
        />
      </CardContent>
      <Handle type="target" position={Position.Top} id="period-target" className="w-3 h-3 !bg-primary" />
      <Handle type="source" position={Position.Bottom} id="scene-source" className="w-3 h-3 !bg-green-500" />
    </Card>
  );
}

export default memo(EventNode);

    