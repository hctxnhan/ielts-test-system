"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudioPlayerProps {
  src: string
  onEnded?: () => void
}

export default function AudioPlayer({ src, onEnded }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      if (onEnded) onEnded()
    }
    const handleError = () => {
      setError("Unable to load audio file. Using simulation mode instead.")
      setIsPlaying(false)
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("durationchange", handleDurationChange)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("durationchange", handleDurationChange)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [onEnded])

  // Simulate audio playback if real audio fails
  useEffect(() => {
    if (!error) return

    let interval: NodeJS.Timeout | null = null

    if (isPlaying) {
      // Simulate a 2-minute audio file
      const simulatedDuration = 120
      if (duration === 0) setDuration(simulatedDuration)

      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 0.1
          if (newTime >= simulatedDuration) {
            if (interval) clearInterval(interval)
            setIsPlaying(false)
            if (onEnded) onEnded()
            return simulatedDuration
          }
          return newTime
        })
      }, 100)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, error, duration, onEnded])

  const togglePlay = () => {
    const audio = audioRef.current

    if (error) {
      // Just toggle the simulated playback state
      setIsPlaying(!isPlaying)
      return
    }

    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
      } else {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((e) => {
            console.error("Audio playback error:", e)
            setError("Unable to play audio. Using simulation mode instead.")
          })
        }
      }
      setIsPlaying(!isPlaying)
    } catch (e) {
      console.error("Error toggling audio:", e)
      setError("Unable to control audio. Using simulation mode instead.")
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    const newTime = value[0]

    if (error) {
      // Just update the time for simulation
      setCurrentTime(newTime)
      return
    }

    const audio = audioRef.current
    if (!audio) return

    try {
      audio.currentTime = newTime
      setCurrentTime(newTime)
    } catch (e) {
      console.error("Error seeking audio:", e)
      setCurrentTime(newTime)
    }
  }

  const toggleMute = () => {
    if (error) {
      setIsMuted(!isMuted)
      return
    }

    const audio = audioRef.current
    if (!audio) return

    try {
      audio.muted = !isMuted
      setIsMuted(!isMuted)
    } catch (e) {
      console.error("Error toggling mute:", e)
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]

    if (error) {
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
      return
    }

    const audio = audioRef.current
    if (!audio) return

    try {
      audio.volume = newVolume
      setVolume(newVolume)
      if (newVolume === 0) {
        audio.muted = true
        setIsMuted(true)
      } else if (isMuted) {
        audio.muted = false
        setIsMuted(false)
      }
    } catch (e) {
      console.error("Error changing volume:", e)
      setVolume(newVolume)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const skipBackward = () => {
    if (error) {
      setCurrentTime(Math.max(0, currentTime - 10))
      return
    }

    const audio = audioRef.current
    if (!audio) return

    try {
      audio.currentTime = Math.max(0, audio.currentTime - 10)
    } catch (e) {
      console.error("Error skipping backward:", e)
      setCurrentTime(Math.max(0, currentTime - 10))
    }
  }

  const skipForward = () => {
    if (error) {
      setCurrentTime(Math.min(duration, currentTime + 10))
      return
    }

    const audio = audioRef.current
    if (!audio) return

    try {
      audio.currentTime = Math.min(audio.duration, audio.currentTime + 10)
    } catch (e) {
      console.error("Error skipping forward:", e)
      setCurrentTime(Math.min(duration, currentTime + 10))
    }
  }

  return (
    <div className="border rounded-md p-4 bg-muted/20">
      <audio ref={audioRef} src={src} preload="metadata" />

      {error && (
        <Alert className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 mb-2">
        <Button variant="outline" size="icon" onClick={skipBackward}>
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button onClick={togglePlay} variant="default" size="icon">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button variant="outline" size="icon" onClick={skipForward}>
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="flex-1 mx-2">
          <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} />
        </div>

        <div className="text-sm tabular-nums w-16 text-right">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>

        <div className="w-24">
          <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} />
        </div>
      </div>
    </div>
  )
}

