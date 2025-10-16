'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Bold, Italic, Underline, List, ListOrdered, Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent } from './ui/dialog';

type CharacterEditorProps = {
  content: string;
  onUpdate: (content: string) => void;
  imageUrl?: string;
  onImageUpdate?: (url: string | null) => void;
};

// A very simple placeholder for a real rich text editor
export default function CharacterEditor({ content, onUpdate, imageUrl, onImageUpdate }: CharacterEditorProps) {
  const t = useTranslations('CharacterEditor');
  const [text, setText] = useState(content);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
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
    <>
        <div className='flex flex-col md:flex-row gap-4 flex-grow'>
            {onImageUpdate && (
                <div className={cn("w-full md:w-1/2 flex flex-col gap-2", !imageUrl && "md:hidden")}>
                    {imageUrl ? (
                        <button onClick={() => setIsImageModalOpen(true)} className="w-full flex-grow bg-muted rounded-md flex items-center justify-center overflow-hidden cursor-pointer relative">
                            <Image src={imageUrl} alt={t('bannerImageAlt')} fill className="object-cover" />
                        </button>
                    ) : (
                        <div className="w-full h-full border-2 border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground">
                            <ImageIcon size={48} className='mb-2' />
                            <p>{t('noImage')}</p>
                        </div>
                    )}
                </div>
            )}
            <div className={cn("flex-1", !imageUrl && 'w-full')}>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold">{t('description')}</h3>
                    {onImageUpdate && (
                        <div className='flex gap-2'>
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" /> {imageUrl ? t('changeImage') : t('upload')}
                            </Button>
                            {imageUrl && (
                                <Button variant="destructive" size="sm" onClick={handleRemoveImage}>
                                    <X className="mr-2 h-4 w-4" /> {t('remove')}
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
                    )}
                </div>
                <div className="border rounded-md h-full flex flex-col">
                <Toolbar />
                <textarea
                    value={text.replace(/<[^>]+>/g, '')} // Strip HTML for plain text editing
                    onChange={handleTextChange}
                    className={cn(
                        "flex-grow w-full rounded-b-md border-input bg-transparent px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    )}
                    placeholder={t('placeholder')}
                />
                </div>
            </div>
        </div>
        {imageUrl && (
            <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
                <DialogContent className="max-w-4xl h-[90vh] p-0">
                    <Image src={imageUrl} alt={t('bannerImageAlt')} layout="fill" objectFit="contain" className="rounded-lg" />
                </DialogContent>
            </Dialog>
        )}
    </>
  );
}
