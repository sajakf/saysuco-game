"use client";

import { useEffect, useRef } from "react";
import { sounds } from "@/lib/sounds";

interface TimerProps {
  seconds: number;
  totalSeconds: number;
  onTick: () => void;
  paused: boolean;
}

export function Timer({ seconds, totalSeconds, onTick, paused }: TimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(seconds);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => { onTick(); }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, onTick]);

  useEffect(() => {
    if (!paused && seconds !== lastTickRef.current) {
      lastTickRef.current = seconds;
      if (seconds <= 10 && seconds > 0) sounds.urgentTick();
      else if (seconds > 10 && seconds % 30 === 0) sounds.tick();
    }
  }, [seconds, paused]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = seconds / totalSeconds;
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference * (1 - progress);

  const color = seconds > 60 ? "#85184F" : seconds > 30 ? "#C49540" : "#DC2626";
  const isUrgent = seconds <= 10;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`relative ${isUrgent ? "animate-pulse" : ""}`}>
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#E2CEBC" strokeWidth="6" />
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-xl font-bold tabular-nums"
            style={{ color, textShadow: isUrgent ? `0 0 10px ${color}44` : "none" }}
          >
            {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
        </div>
      </div>
      <span className="text-xs text-suco-muted uppercase tracking-widest font-semibold">Time Left</span>
    </div>
  );
}
