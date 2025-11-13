import type { SaveFile } from '@/lib/types';

export function saveGameToFile(saveFile: SaveFile, filename = 'session-weaver-save.json'): void {
  const dataStr = JSON.stringify(saveFile, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', filename);
  linkElement.click();
}

export function loadGameFromFile(
  file: File,
  onSuccess: (saved: SaveFile) => void,
  onError: (error: Error) => void
): void {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const text = e.target?.result;
      if (typeof text !== 'string') {
        throw new Error('File is not a valid text file.');
      }
      const saved: SaveFile = JSON.parse(text);
      onSuccess(saved);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Failed to parse save file'));
    }
  };
  
  reader.onerror = () => {
    onError(new Error('Failed to read file'));
  };
  
  reader.readAsText(file);
}
