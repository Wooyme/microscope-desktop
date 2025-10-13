'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, Underline, List, ListOrdered, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

type CharacterEditorProps = {
  content: string;
  onUpdate: (content: string) => void;
  imageUrl?: string;
  onImageUpdate?: (url: string | null) => void;
};

// A very simple placeholder for a real rich text editor
export default function CharacterEditor({ content, onUpdate, imageUrl, onImageUpdate }: CharacterEditorProps) {
  const [text, setText] = useState(content);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(content);
  }, [content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onUpdate(newText);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageUpdate?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    onImageUpdate?.(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
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
    <div className='space-y-4'>
        {onImageUpdate && (
            <div className="space-y-2">
                <div className='flex justify-between items-center'>
                    <h3 className="text-lg font-semibold">Banner Image</h3>
                    <div className='flex gap-2'>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>
                        {imageUrl && (
                            <Button variant="destructive" size="sm" onClick={handleRemoveImage}>
                                <X className="mr-2 h-4 w-4" /> Remove
                            </Button>
                        )}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                </div>
                {imageUrl && (
                  <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      <Image src={imageUrl} alt="Banner image" width={550} height={310} className="object-cover w-full h-full" />
                  </div>
                )}
            </div>
        )}
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
    </div>
  );
}
