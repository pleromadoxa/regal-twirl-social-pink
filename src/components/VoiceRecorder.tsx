import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Send, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onVoiceRecorded: (voiceUrl: string, duration: number) => void;
  onCancel?: () => void;
  className?: string;
}

const VoiceRecorder = ({ onVoiceRecorded, onCancel, className }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Update duration every second
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Error",
        description: "Could not access microphone",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    onCancel?.();
  };

  const uploadAndSend = async () => {
    if (!audioBlob) return;

    try {
      setUploading(true);
      const fileName = `voice_${Date.now()}.webm`;
      const filePath = `voice-notes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath);

      onVoiceRecorded(publicUrl, duration);
      
      // Reset state
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
    } catch (error) {
      console.error('Error uploading voice note:', error);
      toast({
        title: "Error",
        description: "Failed to send voice note",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!isRecording && !audioBlob && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={startRecording}
          className="text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30"
        >
          <Mic className="w-5 h-5" />
        </Button>
      )}

      {isRecording && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-full">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            {formatDuration(duration)}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={stopRecording}
            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <Square className="w-4 h-4" />
          </Button>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 px-3 py-2 rounded-full">
          <audio src={audioUrl!} controls className="h-8 w-32" />
          <span className="text-sm text-muted-foreground">{formatDuration(duration)}</span>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={cancelRecording}
            className="text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={uploadAndSend}
            disabled={uploading}
            className="text-green-600 hover:bg-green-100"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
