import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles } from 'lucide-react';

function EventNode({ id, data }: NodeProps<{ name: string; description: string; updateNodeData: (id: string, data: any) => void; }>) {
  const { name, description, updateNodeData } = data;

  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(updateNodeData) updateNodeData(id, { name: e.target.value });
  };
  
  const onDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if(updateNodeData) updateNodeData(id, { description: e.target.value });
  };

  return (
    <Card className="w-64 shadow-lg border-2 border-accent/50">
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
        />
        <Textarea
          value={description}
          onChange={onDescriptionChange}
          placeholder="Description..."
          className="text-sm"
          rows={3}
        />
      </CardContent>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-primary" />
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-primary" />
    </Card>
  );
}

export default memo(EventNode);
