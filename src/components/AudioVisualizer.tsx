
import { Play, Pause, Music, X, AudioWaveform } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioVisualizerProps {
  selectedAudio: File | null;
  audioURL: string;
  isPlaying: boolean;
  audioCurrentTime: number;
  audioDuration: number;
  onTogglePlayback: () => void;
  onRemoveAudio: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioVisualizer = ({
  selectedAudio,
  audioURL,
  isPlaying,
  audioCurrentTime,
  audioDuration,
  onTogglePlayback,
  onRemoveAudio,
  audioRef
}: AudioVisualizerProps) => {
  const renderAudioVisualizer = () => {
    const bars = 20;
    const progress = audioDuration > 0 ? audioCurrentTime / audioDuration : 0;
    
    return (
      <div className="flex items-end gap-1 h-12 justify-center">
        {[...Array(bars)].map((_, i) => {
          const isActive = i / bars <= progress;
          const height = Math.random() * 60 + 20;
          return (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-t from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-t from-purple-200 to-pink-200'
              } ${isPlaying ? 'animate-pulse' : ''}`}
              style={{
                height: `${height}%`,
                animationDelay: `${i * 100}ms`
              }}
            />
          );
        })}
      </div>
    );
  };

  if (!selectedAudio) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Audio Recording
            </span>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {selectedAudio.name} • {(selectedAudio.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemoveAudio}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePlayback}
          className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full p-0 flex items-center justify-center shadow-lg"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-600 p-4">
          {renderAudioVisualizer()}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <AudioWaveform className="w-4 h-4" />
          <span>{Math.floor(audioCurrentTime)}s / {Math.floor(audioDuration)}s</span>
        </div>
      </div>
      
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          className="hidden"
        />
      )}
    </div>
  );
};

export default AudioVisualizer;
