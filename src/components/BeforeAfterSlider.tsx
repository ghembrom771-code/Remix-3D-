import React, { useState, useRef, useCallback } from 'react';
import { Columns, Sparkles, ZoomIn, ArrowLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalImage: string;
  generatedImage: string;
  onOpenZoom?: () => void;
}

export default function BeforeAfterSlider({
  originalImage,
  generatedImage,
  onOpenZoom
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clampedX = Math.max(0, Math.min(x, rect.width));
    const percentage = (clampedX / rect.width) * 100;
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture release fallback
    }
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full max-w-[420px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950 cursor-ew-resize group"
      >
        {/* Generated 3D Cinematic Portrait (Background) */}
        <img
          src={generatedImage}
          alt="3D Cinematic Portrait"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Original Reference Photo (Foreground with clip path) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={originalImage}
            alt="Original Reference"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.7)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Circular Drag Handle */}
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-neutral-900/90 border-2 border-white/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform">
            <ArrowLeftRight className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 pointer-events-none z-10">
          <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest font-semibold uppercase bg-black/70 backdrop-blur-md text-neutral-300 rounded-md border border-white/10 shadow-sm">
            Reference
          </span>
        </div>
        <div className="absolute top-3 right-3 pointer-events-none z-10">
          <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest font-semibold uppercase bg-blue-950/80 backdrop-blur-md text-cyan-300 rounded-md border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-300" />
            3D 4K Render
          </span>
        </div>

        {/* 4K Zoom Overlay Button */}
        {onOpenZoom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenZoom();
            }}
            className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium tracking-wide bg-neutral-900/85 hover:bg-neutral-800 text-white rounded-lg border border-neutral-700 shadow-md backdrop-blur-md transition-all hover:scale-105"
            title="Inspect 4K Details"
          >
            <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
            <span>4K Inspect</span>
          </button>
        )}

        {/* Drag Hint at bottom */}
        <div className="absolute bottom-3 left-3 pointer-events-none text-[10px] font-mono text-neutral-400 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/5">
          Drag to compare
        </div>
      </div>

      {/* Preset Slider quick buttons */}
      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => setSliderPosition(0)}
          className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
            sliderPosition === 0
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          100% 3D Render
        </button>
        <button
          onClick={() => setSliderPosition(50)}
          className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
            sliderPosition === 50
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          50 / 50 Split
        </button>
        <button
          onClick={() => setSliderPosition(100)}
          className={`px-2.5 py-1 text-[11px] font-mono rounded border transition-colors ${
            sliderPosition === 100
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'text-neutral-400 border-neutral-800 hover:text-white'
          }`}
        >
          100% Reference
        </button>
      </div>
    </div>
  );
}
