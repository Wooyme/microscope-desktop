import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays } from 'lucide-react';
import NodeToolbar from './node-toolbar';

type PeriodNodeData = {
  name: string;
  description: string;
  updateNodeData: (id: string, data: any) => void;
  addPeriod: (direction: 'left' | 'right', sourceNodeId: string) => void;
  deleteNode: (nodeId: string) => void;
  addEvent: (sourceNodeId: string) => void;
  isConnectedLeft: boolean;
  isConnectedRight: boolean;
  disconnectPeer: (nodeId: string, direction: 'left' | 'right') => void;
  canCreateNode: boolean;
}

function PeriodNode({ id, data }: NodeProps<PeriodNodeData>) {
  const { name, description, updateNodeData, addPeriod, deleteNode, addEvent, isConnectedLeft, isConnectedRight, disconnectPeer, canCreateNode } = data;

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(updateNodeData) updateNodeData(id, { description: e.target.value });
  };

  return (
    <Card className="w-64 shadow-lg border-2 border-primary/50 group relative">
      <NodeToolbar
        onAddLeft={!isConnectedLeft ? () => addPeriod('left', id) : undefined}
        onAddRight={!isConnectedRight ? () => addPeriod('right', id) : undefined}
        onDelete={() => deleteNode(id)}
        onAddChild={canCreateNode ? () => addEvent(id) : undefined}
        onDisconnectLeft={isConnectedLeft ? () => disconnectPeer(id, 'left') : undefined}
        onDisconnectRight={isConnectedRight ? () => disconnectPeer(id, 'right') : undefined}
      />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/10">
        <CardTitle className="text-lg font-headline flex items-center gap-2">
          <CalendarDays className="w-5 h-5" />
          Period
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2">
        <Input
          value={name}
          onChange={onNameChange}
          placeholder="Period Name"
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
      <Handle type="source" position={Position.Right} id="peer-source" className="w-3 h-3 !bg-accent" />
      <Handle type="target" position={Position.Left} id="peer-target" className="w-3 h-3 !bg-accent" />
      <Handle type="source" position={Position.Bottom} id="child-source" className="w-3 h-3 !bg-primary" />
    </Card>
  );
}

export default memo(PeriodNode);
