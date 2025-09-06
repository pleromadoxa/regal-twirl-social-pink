"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Play, Pause, Download } from "lucide-react"
import { useState, useRef } from "react"

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

  const togglePlayback = () => {
    if (!audioRef.current) return

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

  return (
    <div
      className={cn(
        "rounded-2xl p-4 max-w-xs",
        variant === "sent" 
          ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white ml-auto" 
          : "bg-gradient-to-r from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 text-gray-800 dark:text-gray-200",
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
          className={cn(
            "w-10 h-10 rounded-full p-0 hover:scale-105 transition-transform",
            variant === "sent" 
              ? "bg-white/20 hover:bg-white/30 text-white" 
              : "bg-pink-300/50 hover:bg-pink-300/70 text-pink-700 dark:text-pink-300"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className={cn(
                "h-1 bg-black/10 dark:bg-white/10 rounded-full flex-1",
                variant === "sent" ? "bg-white/20" : "bg-pink-300/30"
              )}
            >
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-150",
                  variant === "sent" ? "bg-white" : "bg-pink-500"
                )}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {onDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDownload}
                className={cn(
                  "w-6 h-6 p-0 hover:scale-105 transition-transform",
                  variant === "sent" 
                    ? "text-white/70 hover:text-white" 
                    : "text-pink-600/70 hover:text-pink-600 dark:text-pink-400/70 dark:hover:text-pink-400"
                )}
              >
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>
          <div className={cn(
            "text-xs",
            variant === "sent" ? "text-white/70" : "text-pink-600/70 dark:text-pink-400/70"
          )}>
            {formatTime(currentTime)} {duration && `/ ${formatTime(duration)}`}
          </div>
        </div>
      </div>
    </div>
  )
}