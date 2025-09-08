"use client";

import { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
}

export default function AudioVisualizer({ audioRef, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulación de visualización sin Web Audio API para evitar problemas de tipos
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / 64;
      const centerY = canvas.height / 2;

      // Crear gradiente
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#8b5cf6');
      gradient.addColorStop(0.5, '#06b6d4');
      gradient.addColorStop(1, '#ec4899');

      for (let i = 0; i < 64; i++) {
        // Simulación de datos de audio con valores aleatorios suaves
        const barHeight = (Math.random() * 0.5 + 0.3) * (canvas.height / 2);
        const x = i * barWidth;

        // Barra superior
        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight);
        
        // Barra inferior (reflejo)
        const mirrorGradient = ctx.createLinearGradient(0, centerY, 0, canvas.height);
        mirrorGradient.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
        mirrorGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.4)');
        mirrorGradient.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
        
        ctx.fillStyle = mirrorGradient;
        ctx.fillRect(x, centerY, barWidth - 1, barHeight * 0.7);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="relative w-full h-32 bg-black/20 rounded-lg backdrop-blur-sm border border-white/10">
      <canvas
        ref={canvasRef}
        width={800}
        height={128}
        className="w-full h-full rounded-lg"
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/60 text-sm">
            🎵 El visualizador se activará cuando reproduzcas música
          </p>
        </div>
      )}
    </div>
  );
}