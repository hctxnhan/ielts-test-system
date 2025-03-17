'use client';

import { useState, useRef, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX
} from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  onEnded?: () => void;
}

export default function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlers = {
      timeupdate: () => setCurrentTime(audio.currentTime),
      durationchange: () => setDuration(audio.duration),
      ended: () => {
        setIsPlaying(false);
        if (onEnded) onEnded();
      },
      error: () => {
        setError('Audio error');
        setIsPlaying(false);
      }
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      audio.addEventListener(event, handler);
    });

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audio.removeEventListener(event, handler);
      });
    };
  }, [onEnded]);

  // Simulation mode
  useEffect(() => {
    if (!error || !isPlaying) return;
    const simulatedDuration = 120;
    if (duration === 0) setDuration(simulatedDuration);

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev + 0.1;
        if (newTime >= simulatedDuration) {
          clearInterval(interval);
          setIsPlaying(false);
          if (onEnded) onEnded();
          return simulatedDuration;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, error, duration, onEnded]);

  const togglePlay = () => {
    if (error) {
      setIsPlaying(!isPlaying);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    try {
      isPlaying
        ? audio.pause()
        : audio.play().catch((e) => {
            console.error('Audio error:', e);
            setError('Audio error');
          });
      setIsPlaying(!isPlaying);
    } catch (e) {
      setError('Audio error');
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (error) {
      setCurrentTime(newTime);
      return;
    }

    const audio = audioRef.current;
    if (audio) audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    if (error) {
      setIsMuted(!isMuted);
      return;
    }

    const audio = audioRef.current;
    if (audio) audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (error) {
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      audio.muted = true;
      setIsMuted(true);
    } else if (isMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (error) {
      setCurrentTime(Math.max(0, Math.min(duration, currentTime + seconds)));
      return;
    }

    if (audio)
      audio.currentTime = Math.max(
        0,
        Math.min(audio.duration, audio.currentTime + seconds)
      );
  };

  return (
    <div className="flex items-center gap-1 p-1 border rounded-md bg-background text-xs">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={() => skip(-10)}
        className="p-1 hover:bg-muted rounded-sm"
        aria-label="Skip backward"
      >
        <SkipBack className="h-3 w-3" />
      </button>

      <button
        onClick={togglePlay}
        className="p-1 hover:bg-muted rounded-sm"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause className="h-3 w-3" />
        ) : (
          <Play className="h-3 w-3" />
        )}
      </button>

      <button
        onClick={() => skip(10)}
        className="p-1 hover:bg-muted rounded-sm"
        aria-label="Skip forward"
      >
        <SkipForward className="h-3 w-3" />
      </button>

      <div className="flex-1 mx-1">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="h-2"
        />
      </div>

      <span className="tabular-nums text-muted-foreground w-14">
        {formatTime(currentTime)}
      </span>

      <button
        onClick={toggleMute}
        className="p-1 hover:bg-muted rounded-sm"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="h-3 w-3" />
        ) : (
          <Volume2 className="h-3 w-3" />
        )}
      </button>

      <div className="w-12 mr-1">
        <Slider
          value={[isMuted ? 0 : volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="h-2"
        />
      </div>
    </div>
  );
}
