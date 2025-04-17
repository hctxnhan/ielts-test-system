"use client";

import { useState, useEffect, useRef } from "react";
import { useTestStore } from "@/store/test-store";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface TestTimerProps {
  initialTime: number; // in seconds
  onTimeEnd: () => void;
}

export default function TestTimer({ initialTime, onTimeEnd }: TestTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isWarning, setIsWarning] = useState(false);
  const { updateTimeRemaining } = useTestStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  useEffect(() => {
    // Only update time remaining in store when component mounts or initialTime changes
    // NOT during every render
    if (initialTime !== timeRemaining) {
      setTimeRemaining(initialTime);
    }

    // Clean up any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Set up timer
    timerRef.current = setInterval(() => {
      // Throttle updates to prevent too many state changes
      const now = Date.now();
      if (now - lastUpdateRef.current < 500) {
        return;
      }
      lastUpdateRef.current = now;

      setTimeRemaining((prevTime) => {
        const newTime = prevTime - 1;

        // Update time in store (throttled)
        if (newTime % 5 === 0) {
          updateTimeRemaining(newTime);
        }

        // Check if time is running low (less than 5 minutes)
        if (newTime <= 300 && !isWarning) {
          setIsWarning(true);
        }

        // Check if time is up
        if (newTime <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          onTimeEnd();
          return 0;
        }

        return newTime;
      });
    }, 1000);

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initialTime, updateTimeRemaining, onTimeEnd, isWarning]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Button
      size="sm"
      variant="outline"
      className={`font-mono px-2 ${
        isWarning ? "text-red-500 border-red-500 animate-pulse" : ""
      }`}
      disabled
    >
      <Clock className="mr-1 h-3 w-3" />
      {formatTime(timeRemaining)}
    </Button>
  );
}
