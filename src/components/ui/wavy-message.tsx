
"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { WavyBackground } from "./wavy-background";

interface WavyMessageProps {
  children: React.ReactNode;
  className?: string;
  isOwn?: boolean;
  colors?: string[];
}

export const WavyMessage = ({
  children,
  className,
  isOwn = false,
  colors,
  ...props
}: WavyMessageProps) => {
  const defaultColors = isOwn 
    ? ["#9333ea", "#c084fc", "#e879f9", "#f472b6", "#ec4899"]
    : ["#1e293b", "#334155", "#475569", "#64748b", "#94a3b8"];

  return (
    <div className={cn("relative max-w-xs lg:max-w-md", className)} {...props}>
      <WavyBackground
        colors={colors || defaultColors}
        waveWidth={20}
        backgroundFill={isOwn ? "#9333ea" : "#1e293b"}
        blur={5}
        speed="slow"
        waveOpacity={0.3}
        containerClassName="rounded-2xl overflow-hidden min-h-[60px] flex items-center justify-center relative"
        className="px-4 py-2"
      >
        <div className="text-white text-sm relative z-10">
          {children}
        </div>
      </WavyBackground>
    </div>
  );
};
