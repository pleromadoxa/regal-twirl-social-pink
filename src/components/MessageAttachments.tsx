import { useState, useEffect } from 'react';
import { Play, Pause, Download, Image as ImageIcon, Video, Mic, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageAttachment, getMessageAttachments } from '@/services/attachmentService';

interface MessageAttachmentsProps {
  messageId: string;
}

const MessageAttachments = ({ messageId }: MessageAttachmentsProps) => {
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const messageAttachments = await getMessageAttachments(messageId);
        setAttachments(messageAttachments);
      } catch (error) {
        console.error('Error fetching attachments:', error);
      }
    };

    fetchAttachments();
  }, [messageId]);

  const toggleAudioPlayback = (attachmentId: string, audioUrl: string) => {
    if (playingAudio === attachmentId) {
      setPlayingAudio(null);
      // Stop audio playback logic here
    } else {
      setPlayingAudio(attachmentId);
      // Start audio playback logic here
    }
  };

  const downloadFile = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="border rounded-lg overflow-hidden">
          {attachment.attachment_type === 'image' && (
            <div className="relative flex justify-start">
              <img
                src={attachment.file_url}
                alt={attachment.file_name}
                className="block max-w-[180px] md:max-w-[240px] w-auto h-auto rounded-lg"
                loading="lazy"
                style={{ maxHeight: "200px", objectFit: "cover" }}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadFile(attachment.file_url, attachment.file_name)}
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}

          {attachment.attachment_type === 'video' && (
            <div className="relative">
              <video
                src={attachment.file_url}
                controls
                className="w-full max-w-sm rounded-lg"
                preload="metadata"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadFile(attachment.file_url, attachment.file_name)}
                className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}

          {attachment.attachment_type === 'audio' && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleAudioPlayback(attachment.id, attachment.file_url)}
                className="rounded-full w-10 h-10 p-0 bg-purple-500 hover:bg-purple-600 text-white"
              >
                {playingAudio === attachment.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Voice Note</span>
                </div>
                <p className="text-xs text-slate-500">{formatFileSize(attachment.file_size)}</p>
              </div>

              <audio
                src={attachment.file_url}
                className="hidden"
                onEnded={() => setPlayingAudio(null)}
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadFile(attachment.file_url, attachment.file_name)}
                className="text-slate-500 hover:text-slate-700"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}

          {attachment.attachment_type === 'document' && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                <p className="text-xs text-slate-500">{formatFileSize(attachment.file_size)}</p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadFile(attachment.file_url, attachment.file_name)}
                className="text-slate-500 hover:text-slate-700"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MessageAttachments;
