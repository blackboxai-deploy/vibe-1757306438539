"use client";

import KaraokePlayer from "@/components/KaraokePlayer";
// Iconos personalizados sin dependencias externas
const Sparkles = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>✨</div>
);

const Music = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>🎵</div>
);

const Mic = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>🎤</div>
);

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-white/30" />
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Mic className="w-12 h-12 text-purple-400 mr-4" />
            <h1 className="text-5xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Karaoke Pro
            </h1>
            <Music className="w-12 h-12 text-pink-400 ml-4" />
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Canta tus canciones favoritas con letras sincronizadas y efectos visuales espectaculares
          </p>
        </div>

        {/* Main Karaoke Player */}
        <KaraokePlayer />

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-white/60">
            🎵 Disfruta cantando con la mejor experiencia de karaoke 🎵
          </p>
        </div>
      </div>
    </main>
  );
}