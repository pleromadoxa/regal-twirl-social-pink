"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download } from "lucide-react"
import { useState, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface VoiceBubbleProps {
  variant?: "sent" | "received"
  audioUrl: string
  duration?: number
  className?: string
  onDownload?: () => void
}

export function VoiceBubble({
  variant = "received",
  audioUrl,
  duration,
  className,
  onDownload,
}: VoiceBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { toast } = useToast()

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) {
      toast({
        title: "Audio not available",
        description: "This voice note is not playable",
        variant: "destructive"
      });
      return;
    }

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0

  // Generate animated bars for visualizer effect
  const generateBars = () => {
    const bars = []
    for (let i = 0; i < 20; i++) {
      const baseHeight = isPlaying ? Math.random() * 12 + 4 : 4
      
      bars.push(
        <div
          key={i}
          className={cn(
            "w-0.5 rounded-full transition-all duration-300",
            variant === "sent" ? "bg-white/70" : "bg-white/70",
            isPlaying && "animate-pulse"
          )}
          style={{ 
            height: `${baseHeight}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: '1.5s'
          }}
        />
      )
    }
    return bars
  }

  return (
    <div
      className={cn(
        "rounded-2xl p-4 max-w-xs",
        variant === "sent" 
          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white ml-auto" 
          : "bg-gradient-to-r from-pink-400 to-purple-400 text-white",
        className
      )}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={() => {
          if (audioRef.current && !duration) {
            // Update duration if not provided
          }
        }}
      />
      
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlayback}
          className="w-10 h-10 rounded-full p-0 hover:scale-105 transition-transform bg-white/20 hover:bg-white/30 text-white"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        
        <div className="flex-1">
          {/* Audio Visualizer */}
          <div className="flex items-end justify-center gap-0.5 h-4 mb-2">
            {generateBars()}
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-1">
            <div className="h-1 bg-white/20 rounded-full flex-1">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                className="w-6 h-6 p-0 hover:scale-105 transition-transform text-white/70 hover:text-white"
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <div className="text-xs text-white/70">
            {formatTime(currentTime)} {duration && `/ ${formatTime(duration)}`}
          </div>
        </div>
      </div>
    </div>
  )
}