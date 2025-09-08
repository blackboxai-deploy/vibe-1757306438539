"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
// Iconos personalizados sin dependencias externas
const Play = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>▶️</div>
);

const Pause = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>⏸️</div>
);

const Square = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>⏹️</div>
);

const Volume2 = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>🔊</div>
);

const Upload = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>📁</div>
);
import AudioVisualizer from "./AudioVisualizer";
import { parseLrc, getCurrentLine, getCurrentLineProgress, type LrcLine } from "@/lib/lrc-parser";

interface KaraokePlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  lyrics: LrcLine[];
  currentLyricIndex: number;
  audioSrc: string | null;
}

export default function KaraokePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lrcInputRef = useRef<HTMLInputElement>(null);

  const [state, setState] = useState<KaraokePlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    lyrics: [],
    currentLyricIndex: -1,
    audioSrc: null,
  });

  // Demo data - Puedes reemplazar esto con tus archivos
  // const demoAudio = "/demo-song.mp3"; // Placeholder para audio
  const demoLyrics = `[00:12.00]Welcome to the karaoke experience
[00:15.50]Sing along with these amazing lyrics
[00:19.00]Feel the rhythm and let your voice shine
[00:22.50]This is just a demo of what's possible
[00:26.00]Load your own songs and LRC files
[00:29.50]Create unforgettable karaoke moments
[00:33.00]🎵 Enjoy the music! 🎵`;

  // Cargar demo al inicio
  useEffect(() => {
    const lyrics = parseLrc(demoLyrics);
    setState(prev => ({ ...prev, lyrics: lyrics.lines }));
  }, []);

  // Actualizar tiempo y letras
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      const currentTime = audio.currentTime;
      const { currentIndex } = getCurrentLine(state.lyrics, currentTime);
      
      setState(prev => ({
        ...prev,
        currentTime,
        currentLyricIndex: currentIndex,
      }));
    };

    const updateDuration = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration || 0,
      }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    });

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [state.lyrics]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio || !state.audioSrc) return;

    if (state.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }

    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleStop = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setState(prev => ({ ...prev, isPlaying: false, currentTime: 0, currentLyricIndex: -1 }));
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * state.duration;
    audio.currentTime = newTime;
    setState(prev => ({ ...prev, currentTime: newTime }));
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setState(prev => ({ ...prev, volume: newVolume }));
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setState(prev => ({ ...prev, audioSrc: url, isPlaying: false }));
  };

  const handleLrcUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseLrc(content);
      setState(prev => ({ ...prev, lyrics: parsed.lines }));
    };
    reader.readAsText(file);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const currentLine = state.currentLyricIndex >= 0 ? state.lyrics[state.currentLyricIndex] : null;
  const nextLine = state.currentLyricIndex + 1 < state.lyrics.length ? state.lyrics[state.currentLyricIndex + 1] : null;
  const progress = getCurrentLineProgress(currentLine, nextLine, state.currentTime);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-black/30 backdrop-blur-lg border-white/20">
      <CardContent className="p-8">
        {/* Audio Element */}
        <audio
          ref={audioRef}
          src={state.audioSrc || undefined}
          preload="metadata"
        />

        {/* File Upload Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              Cargar Audio
            </Button>
          </div>

          <div>
            <input
              ref={lrcInputRef}
              type="file"
              accept=".lrc,.txt"
              onChange={handleLrcUpload}
              className="hidden"
            />
            <Button
              onClick={() => lrcInputRef.current?.click()}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Upload className="w-4 h-4 mr-2" />
              Cargar Letras (.lrc)
            </Button>
          </div>
        </div>

        {/* Audio Visualizer */}
        <div className="mb-8">
          <AudioVisualizer audioRef={audioRef} isPlaying={state.isPlaying} />
        </div>

        {/* Lyrics Display */}
        <div className="mb-8 h-64 flex flex-col justify-center items-center text-center">
          {state.lyrics.length > 0 ? (
            <>
              {/* Previous Line */}
              {state.currentLyricIndex > 0 && (
                <div className="text-white/40 text-lg mb-2 transition-all duration-300">
                  {state.lyrics[state.currentLyricIndex - 1].text}
                </div>
              )}

              {/* Current Line */}
              {currentLine && (
                <div className="relative">
                  <div 
                    className="text-white text-3xl font-bold mb-4 transition-all duration-300 transform"
                    style={{
                      textShadow: '0 0 20px rgba(139, 92, 246, 0.8)',
                      transform: `scale(${1 + progress * 0.1})`,
                    }}
                  >
                    {currentLine.text}
                  </div>
                  
                  {/* Progress Bar for Current Line */}
                  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100 ease-out"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Next Line */}
              {nextLine && (
                <div className="text-white/60 text-lg mt-4 transition-all duration-300">
                  {nextLine.text}
                </div>
              )}
            </>
          ) : (
            <div className="text-white/60 text-xl">
              🎵 Carga un archivo de audio y letras para empezar 🎵
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-white/60 text-sm mb-2">
            <span>{formatTime(state.currentTime)}</span>
            <span>{formatTime(state.duration)}</span>
          </div>
          <Slider
            value={[state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            onClick={handlePlayPause}
            disabled={!state.audioSrc}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full w-16 h-16"
          >
            {state.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>

          <Button
            onClick={handleStop}
            disabled={!state.audioSrc}
            variant="outline"
            size="lg"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-full w-12 h-12"
          >
            <Square className="w-5 h-5" />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-4">
          <Volume2 className="w-5 h-5 text-white/60" />
          <Slider
            value={[state.volume * 100]}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
            className="flex-1 max-w-32"
          />
          <span className="text-white/60 text-sm w-12">
            {Math.round(state.volume * 100)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}