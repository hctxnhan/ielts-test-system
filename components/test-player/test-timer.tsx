"use client";
import { cn } from "@testComponents/lib/utils";
import { Clock } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";

interface TestTimerProps {
  initialTime: number; // in seconds
  onTimeEnd: () => void;
  className?: string;
}

function TestTimerComponent({ initialTime, onTimeEnd, className }: TestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const deadlineRef = useRef<number>(Date.now() + initialTime * 1000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set deadline only on mount
    deadlineRef.current = Date.now() + initialTime * 1000;
    setTimeRemaining(initialTime);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.round((deadlineRef.current - now) / 1000));
      setTimeRemaining(secondsLeft);
      if (secondsLeft <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        onTimeEnd();
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTimeEnd]);

  // Format time as HH:MM:SS for longer durations, MM:SS for shorter
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 300;
  const isCriticalTime = timeRemaining <= 60; 

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-[60] bg-white dark:bg-gray-800 rounded-lg shadow-lg border px-4 py-2 flex items-center space-x-2 transition-all duration-300",
        {
          "bg-yellow-50 border-yellow-300 text-yellow-800": isLowTime && !isCriticalTime,
          "bg-red-50 border-red-300 text-red-800 animate-pulse": isCriticalTime,
        },
        className
      )}
    >
      <Clock className={cn(
        "w-4 h-4",
        {
          "text-yellow-600": isLowTime && !isCriticalTime,
          "text-red-600": isCriticalTime,
        }
      )} />
      <span className={cn(
        "font-medium text-sm",
        {
          "text-yellow-800": isLowTime && !isCriticalTime,
          "text-red-800": isCriticalTime,
        }
      )}>
        {formatTime(Math.max(0, timeRemaining))}
      </span>
    </div>
  );
}

 const TestTimer = memo(TestTimerComponent)

export default TestTimer;