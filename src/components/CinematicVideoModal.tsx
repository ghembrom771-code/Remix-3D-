import React, { useState, useEffect } from 'react';
import { X, Play, Film, Loader2, Download, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

interface CinematicVideoModalProps {
  portraitImage: string;
  onClose: () => void;
}

export default function CinematicVideoModal({ portraitImage, onClose }: CinematicVideoModalProps) {
  const [motionPrompt, setMotionPrompt] = useState('Slow cinematic camera push-in with dramatic lighting shift and subtle atmospheric smoke');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const MOTION_PRESETS = [
    {
      title: 'Cinematic Push-In',
      prompt: 'Slow cinematic camera push-in focusing on the intense eyes and stylish black mask with dramatic studio lighting',
    },
    {
      title: 'Dramatic Orbit Arc',
      prompt: 'Smooth slow orbit pan around the 3D cinematic portrait revealing rim lighting and dark atmospheric background',
    },
    {
      title: 'Atmospheric Haze',
      prompt: 'Subtle cinematic camera breathing motion with drifting volumetric haze and glistening eye reflections',
    }
  ];

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatusMessage('Initiating cinematic video rendering with Gemini Omni...');

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: portraitImage,
          prompt: motionPrompt
        })
      });

      const data = await response.json();
      if (!data.success || !data.fileId) {
        throw new Error(data.error || 'Failed to start video synthesis.');
      }

      const fileId = data.fileId;
      setStatusMessage('Simulating Unreal Engine 5 cinematic camera motion...');

      // Poll video status
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch('/api/video-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileId })
          });
          const statusData = await statusRes.json();

          if (statusData.done) {
            clearInterval(pollInterval);
            setVideoUrl(`/api/video-download?fileId=${encodeURIComponent(fileId)}`);
            setIsGenerating(false);
            setStatusMessage('Cinematic clip ready!');
          } else {
            setStatusMessage('Rendering frames with physically based lighting & ray tracing...');
          }
        } catch (pollErr: any) {
          console.error("Polling error:", pollErr);
          clearInterval(pollInterval);
          setError("Failed to check video status: " + pollErr.message);
          setIsGenerating(false);
        }
      }, 4000);

    } catch (err: any) {
      console.error("Video creation error:", err);
      setError(err.message || 'Failed to generate video.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Film className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-mono font-bold uppercase text-white tracking-wider">
                Cinematic Camera Pan Generator
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">
                Animate your 3D portrait with Gemini Omni video synthesis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
          {/* Portrait / Video Preview */}
          <div className="w-48 sm:w-56 aspect-[9/16] rounded-xl overflow-hidden border border-neutral-800 bg-black flex-shrink-0 relative shadow-lg">
            {videoUrl ? (
              <video
                src={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <img
                  src={portraitImage}
                  alt="3D Portrait"
                  className="w-full h-full object-cover"
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
                    <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                    <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wider">
                      SYNTHESIZING...
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 mt-2 leading-relaxed">
                      {statusMessage}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Controls */}
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 block mb-2 font-semibold">
                Camera Motion Style
              </label>
              <div className="space-y-2">
                {MOTION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMotionPrompt(preset.prompt)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      motionPrompt === preset.prompt
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:bg-neutral-800/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold text-cyan-300 flex items-center justify-between font-mono">
                      <span>{preset.title}</span>
                      {motionPrompt === preset.prompt && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-1 line-clamp-2">
                      {preset.prompt}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              {!videoUrl ? (
                <button
                  onClick={handleStartGeneration}
                  disabled={isGenerating}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Synthesizing Video...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-black" />
                      <span>Generate 4s Cinematic Camera Pan</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex gap-2">
                  <a
                    href={videoUrl}
                    download="3d-cinematic-portrait-motion.mp4"
                    className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold uppercase tracking-wider text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP4</span>
                  </a>
                  <button
                    onClick={handleStartGeneration}
                    className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs rounded-xl transition-all"
                  >
                    Reroll
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
