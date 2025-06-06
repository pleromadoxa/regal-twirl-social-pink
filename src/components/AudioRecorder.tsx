
import { useState, useRef } from "react";
import { Mic, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onAudioRecorded: (file: File, url: string) => void;
  onAudioUploaded: (file: File, url: string) => void;
}

const AudioRecorder = ({ onAudioRecorded, onAudioUploaded }: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        onAudioRecorded(audioFile, url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Click the mic button again to stop recording"
      });
    } catch (error) {
      console.error('Error starting recording:', error);
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
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Audio recording saved"
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAudioUploaded(file, url);
      toast({
        title: "Audio uploaded",
        description: "Audio file added to your post"
      });
    }
  };

  return (
    <>
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleAudioUpload}
      />
      
      <Button 
        type="button"
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          audioInputRef.current?.click();
        }}
        className="text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
      >
        <Upload className="w-5 h-5" />
      </Button>

      <Button 
        type="button"
        variant="ghost" 
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleRecording();
        }}
        className={`p-2 transition-all duration-300 hover:scale-125 rounded-full ${
          isRecording 
            ? 'text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse' 
            : 'text-purple-500 dark:text-blue-400 hover:bg-purple-50 dark:hover:bg-blue-900/20'
        }`}
      >
        <Mic className="w-5 h-5" />
      </Button>
    </>
  );
};

export default AudioRecorder;
