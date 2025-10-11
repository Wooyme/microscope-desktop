'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';

type CharacterEditorProps = {
  content: string;
  onUpdate: (content: string) => void;
};

// A very simple placeholder for a real rich text editor
export default function CharacterEditor({ content, onUpdate }: CharacterEditorProps) {
  const [text, setText] = useState(content);

  useEffect(() => {
    setText(content);
  }, [content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onUpdate(newText);
  }

  // This is a mock toolbar. In a real scenario, you'd use a library like Tiptap or Slate.
  const Toolbar = () => (
    <div className="flex items-center gap-1 p-2 border-b bg-muted rounded-t-md">
       <Button variant="outline" size="icon" disabled><Bold /></Button>
       <Button variant="outline" size="icon" disabled><Italic /></Button>
       <Button variant="outline" size="icon" disabled><Underline /></Button>
       <Button variant="outline" size="icon" disabled><List /></Button>
       <Button variant="outline" size="icon" disabled><ListOrdered /></Button>
    </div>
  );

  return (
    <div className="border rounded-md">
      <Toolbar />
      <textarea
        value={text.replace(/<[^>]+>/g, '')} // Strip HTML for plain text editing
        onChange={handleTextChange}
        className={cn(
            "flex min-h-[200px] w-full rounded-b-md border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        )}
        placeholder="Type your scene details here..."
      />
    </div>
  );
}
