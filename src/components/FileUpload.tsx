import { useState, useCallback } from 'react';
import { Upload, FileJson, Loader2 } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';
import { Button } from '@/components/ui/button';

const FileUpload = () => {
  const { setRawData } = useChatStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      setRawData(data, file.name);
    } catch {
      setError('Failed to parse JSON file. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  }, [setRawData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FileJson className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Upload Snapchat Export</h2>
        <p className="text-muted-foreground mb-8">
          Drop your Snapchat JSON backup file to get started
        </p>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 transition-colors cursor-pointer ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
          }`}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {isLoading ? (
            <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Drag & drop your JSON file here, or click to browse
              </p>
            </>
          )}
          <input
            id="file-input"
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {error && <p className="text-destructive text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default FileUpload;
