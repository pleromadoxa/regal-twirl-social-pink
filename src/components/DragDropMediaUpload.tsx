import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Image, Video, FileText, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DragDropMediaUploadProps {
  onFileUpload: (files: File[]) => void;
  onUrlsGenerated: (urls: string[], types: string[]) => void;
  children: React.ReactNode;
  className?: string;
}

const DragDropMediaUpload = ({ 
  onFileUpload, 
  onUrlsGenerated, 
  children, 
  className = "" 
}: DragDropMediaUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{file: File, url?: string, type: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileType = (file: File): string => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const getStorageBucket = (fileType: string): string => {
    switch (fileType) {
      case 'image': return 'message-attachments';
      case 'video': return 'post-videos';
      case 'audio': return 'post-audio';
      default: return 'message-attachments';
    }
  };

  const uploadToSupabase = async (file: File): Promise<string> => {
    const fileType = getFileType(file);
    const bucket = getStorageBucket(fileType);
    const fileName = `${Date.now()}-${file.name}`;
    
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    
    try {
      const filesWithTypes = validFiles.map(file => ({
        file,
        type: getFileType(file)
      }));
      
      setUploadedFiles(filesWithTypes);
      onFileUpload(validFiles);

      // Upload to Supabase
      const uploadPromises = validFiles.map(uploadToSupabase);
      const urls = await Promise.all(uploadPromises);
      const types = validFiles.map(getFileType);
      
      onUrlsGenerated(urls, types);
      
      toast({
        title: "Files uploaded successfully",
        description: `${validFiles.length} file(s) uploaded`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative transition-all duration-200 ${
          isDragOver 
            ? 'bg-primary/10 border-2 border-dashed border-primary rounded-lg' 
            : ''
        }`}
      >
        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop files here to upload</p>
            </div>
          </div>
        )}
        
        {children}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File Upload Button */}
      <div className="flex items-center gap-2 mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          {uploading ? 'Uploading...' : 'Attach Files'}
        </Button>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="mt-2 space-y-2">
          {uploadedFiles.map((item, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              {getFileIcon(item.type)}
              <span className="text-sm flex-1 truncate">{item.file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="w-6 h-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DragDropMediaUpload;