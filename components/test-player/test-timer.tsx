"use client";
import React from "react";
import { useState, useEffect, useRef } from "react";
import { useTestStore } from "@testComponents/store/test-store";
import { Button } from "@testComponents/components/ui/button";
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
      size="default"
      variant="outline"
      className={`font-mono h-auto ${
        isWarning ? "text-red-500 border-red-500 animate-pulse" : ""
      }`}
      disabled
    >
      <Clock className="mr-0.5 h-2.5 w-2.5" />
      {formatTime(timeRemaining)}
    </Button>
  );
}
