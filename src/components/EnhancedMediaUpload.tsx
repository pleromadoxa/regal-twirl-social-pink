import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ImageIcon,
  VideoIcon,
  FileIcon,
  Mic,
  Upload,
  X,
  Download,
  Minimize2,
  Maximize2,
  Play,
  Pause
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MediaFile {
  id: string;
  file: File;
  type: 'image' | 'video' | 'document' | 'audio';
  preview?: string;
  compressed?: boolean;
  originalSize: number;
  compressedSize?: number;
}

interface EnhancedMediaUploadProps {
  onFilesSelected: (files: File[], isCompressed: boolean) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

const EnhancedMediaUpload = ({ 
  onFilesSelected, 
  maxFiles = 5,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx', '.txt']
}: EnhancedMediaUploadProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [useCompression, setUseCompression] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  const getFileType = (file: File): 'image' | 'video' | 'document' | 'audio' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve('');
      }
    });
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (files: FileList) => {
    const newFiles: MediaFile[] = [];
    
    for (let i = 0; i < Math.min(files.length, maxFiles - selectedFiles.length); i++) {
      const file = files[i];
      const type = getFileType(file);
      const preview = await createPreview(file);
      
      let processedFile = file;
      let compressedSize = file.size;
      
      if (useCompression && type === 'image') {
        processedFile = await compressImage(file);
        compressedSize = processedFile.size;
      }
      
      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file: processedFile,
        type,
        preview,
        compressed: useCompression && type === 'image',
        originalSize: file.size,
        compressedSize: compressedSize
      });
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, {
          type: 'audio/webm',
          lastModified: Date.now(),
        });
        
        handleFileSelect(Object.assign(document.createElement('input'), {
          files: Object.assign([], { 0: file, length: 1 })
        }).files as FileList);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    setTimeout(() => {
      onFilesSelected(selectedFiles.map(f => f.file), useCompression);
      setUploading(false);
      setSelectedFiles([]);
      setIsOpen(false);
      setUploadProgress(0);
      
      toast({
        title: "Files uploaded successfully",
        description: `${selectedFiles.length} file(s) uploaded`
      });
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Media
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
          className={`gap-2 ${isRecording ? 'bg-red-100 text-red-600 border-red-200' : ''}`}
        >
          <Mic className="w-4 h-4" />
          {isRecording ? formatTime(recordingTime) : 'Voice'}
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-500" />
              Upload Media
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Compression Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {useCompression ? (
                <Minimize2 className="w-4 h-4 text-blue-500" />
              ) : (
                <Maximize2 className="w-4 h-4 text-green-500" />
              )}
                <Label htmlFor="compression" className="text-sm font-medium">
                  {useCompression ? 'Compressed Quality' : 'HD Quality'}
                </Label>
              </div>
              <Switch
                id="compression"
                checked={useCompression}
                onCheckedChange={setUseCompression}
              />
            </div>

            {/* File Input */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Click to select files or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Images, videos, documents, audio files
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              className="hidden"
            />

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selected Files</Label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {selectedFiles.map((mediaFile) => (
                    <div
                      key={mediaFile.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-shrink-0">
                        {mediaFile.type === 'image' && mediaFile.preview ? (
                          <img
                            src={mediaFile.preview}
                            alt="Preview"
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            {mediaFile.type === 'video' && <VideoIcon className="w-6 h-6 text-blue-500" />}
                            {mediaFile.type === 'audio' && <Mic className="w-6 h-6 text-green-500" />}
                            {mediaFile.type === 'document' && <FileIcon className="w-6 h-6 text-orange-500" />}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {mediaFile.file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(mediaFile.compressedSize || mediaFile.originalSize)}
                          </span>
                          {mediaFile.compressed && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              Compressed {Math.round(((mediaFile.originalSize - (mediaFile.compressedSize || 0)) / mediaFile.originalSize) * 100)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(mediaFile.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedMediaUpload;