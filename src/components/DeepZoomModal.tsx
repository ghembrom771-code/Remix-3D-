import React, { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Maximize2, ShieldCheck, Sparkles, Eye, Shirt } from 'lucide-react';

interface DeepZoomModalProps {
  imageUrl: string;
  onClose: () => void;
}

export default function DeepZoomModal({ imageUrl, onClose }: DeepZoomModalProps) {
  const [zoomLevel, setZoomLevel] = useState(1.5); // 1.5x default inspection
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const [showCallouts, setShowCallouts] = useState(true);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPanning(true);
    startPanRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPanning) return;
    setPanPosition({
      x: e.clientX - startPanRef.current.x,
      y: e.clientY - startPanRef.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsPanning(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // release pointer
    }
  };

  const resetTransform = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-neutral-950/80 border-b border-neutral-800/80 px-6 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-mono font-bold tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded">
            4K UHD
          </span>
          <h2 className="text-sm font-semibold tracking-wide text-neutral-100 uppercase font-mono">
            PBR Shader & Texture Inspector
          </h2>
        </div>

        {/* Zoom controls bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCallouts(!showCallouts)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-colors flex items-center gap-1.5 ${
              showCallouts
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Inspection Hotspots</span>
          </button>

          <div className="h-6 w-px bg-neutral-800 mx-1" />

          <button
            onClick={() => setZoomLevel((z) => Math.max(1, z - 0.5))}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors border border-neutral-800"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-cyan-400 w-12 text-center font-bold">
            {Math.round(zoomLevel * 100)}%
          </span>

          <button
            onClick={() => setZoomLevel((z) => Math.min(4, z + 0.5))}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors border border-neutral-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={resetTransform}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors border border-neutral-800"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-neutral-800 mx-1" />

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 rounded-lg transition-colors border border-neutral-800 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Pan/Zoom Stage */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none relative pt-16 pb-14"
      >
        <div
          className="relative transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Main 9:16 Portrait */}
          <div className="relative max-h-[82vh] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950">
            <img
              src={imageUrl}
              alt="4K UHD Deep Zoom Portrait"
              className="w-full h-full object-cover pointer-events-none"
            />

            {/* Inspection Callout Badges */}
            {showCallouts && (
              <>
                {/* Mask Micro-Stitching Callout */}
                <div className="absolute top-[62%] left-[48%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="relative group">
                    <span className="flex h-5 w-5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-500 border border-white/60 items-center justify-center">
                        <Shirt className="w-2.5 h-2.5 text-black" />
                      </span>
                    </span>
                    <div className="absolute left-7 top-1/2 -translate-y-1/2 bg-neutral-950/90 border border-cyan-500/40 text-neutral-200 text-[10px] font-mono px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap backdrop-blur-md">
                      <div className="font-bold text-cyan-300">Mask Micro-Stitching</div>
                      <div className="text-neutral-400">Natural fabric folds & shadow fit</div>
                    </div>
                  </div>
                </div>

                {/* Subsurface Scattering Eye / Skin Callout */}
                <div className="absolute top-[38%] left-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="relative group">
                    <span className="flex h-5 w-5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 border border-white/60 items-center justify-center">
                        <Eye className="w-2.5 h-2.5 text-black" />
                      </span>
                    </span>
                    <div className="absolute left-7 top-1/2 -translate-y-1/2 bg-neutral-950/90 border border-amber-500/40 text-neutral-200 text-[10px] font-mono px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap backdrop-blur-md">
                      <div className="font-bold text-amber-300">Subsurface Scattering</div>
                      <div className="text-neutral-400">Ray-traced iris & skin shader PBR</div>
                    </div>
                  </div>
                </div>

                {/* Rim Lighting Callout */}
                <div className="absolute top-[28%] left-[78%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="relative group">
                    <span className="flex h-5 w-5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-500 border border-white/60 items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-black" />
                      </span>
                    </span>
                    <div className="absolute right-7 top-1/2 -translate-y-1/2 bg-neutral-950/90 border border-blue-500/40 text-neutral-200 text-[10px] font-mono px-2.5 py-1 rounded-md shadow-xl whitespace-nowrap backdrop-blur-md">
                      <div className="font-bold text-blue-300">Rim Lighting</div>
                      <div className="text-neutral-400">Studio accent & volumetric depth</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20">
        <span className="px-4 py-1.5 bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-400 rounded-full backdrop-blur-md shadow-lg">
          Drag to pan across 4K UHD details &bull; Scroll or use buttons to zoom up to 400%
        </span>
      </div>
    </div>
  );
}
