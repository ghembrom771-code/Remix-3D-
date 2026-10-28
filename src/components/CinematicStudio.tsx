import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Layers,
  Sliders,
  ZoomIn,
  Film,
  Download,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Shirt,
  SunMedium,
  Palette,
  Maximize2,
  Globe,
  Rotate3d,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import BeforeAfterSlider from './BeforeAfterSlider';
import HolographicPortraitCanvas from './HolographicPortraitCanvas';
import DeepZoomModal from './DeepZoomModal';
import CinematicVideoModal from './CinematicVideoModal';

interface CinematicStudioProps {
  onOpenGlobeView: (userImage: string) => void;
  initialReference?: string | null;
}

const MASK_STYLES = [
  {
    id: 'matte-fabric',
    name: 'Matte Black Fabric',
    desc: 'Detailed stitching, micro-weave fabric texture & natural facial folds',
    promptSnippet: 'stylish black face mask covering the nose, mouth, and chin, with realistic fabric texture, detailed stitching, natural folds, accurate face fitting, and physically realistic shadows',
    icon: Shirt
  },
  {
    id: 'stealth-tactical',
    name: 'Tactical Hexagon Weave',
    desc: 'Hexagonal carbon micro-mesh with reinforced ergonomic chin seam',
    promptSnippet: 'stealth tactical black mask with hexagonal micro-mesh texture, reinforced double-stitched chin seam, natural folds, and accurate face contour fitting',
    icon: Shirt
  },
  {
    id: 'minimal-neoprene',
    name: 'Minimalist Neoprene',
    desc: 'Ultra-smooth matte neoprene with laser-cut edges and anatomical fit',
    promptSnippet: 'minimalist black neoprene mask with seamless laser-cut edges, matte finish, soft fabric folds, and precision anatomical fit to the nose and jawline',
    icon: Shirt
  },
  {
    id: 'luxury-silk',
    name: 'Luxury Silk-Sheen Black',
    desc: 'Bespoke dark obsidian sheen with subtle tailored edge highlights',
    promptSnippet: 'luxury tailored black face mask with subtle silk sheen texture, hand-stitched borders, soft ambient highlights, and elegant facial draping',
    icon: Shirt
  }
];

const LIGHTING_STYLES = [
  {
    id: 'studio-noir',
    name: 'Dramatic Studio Noir',
    desc: 'Soft rim lighting, balanced highlights & deep natural shadows',
    promptSnippet: 'Dramatic studio lighting, soft rim lighting around the subject, balanced highlights, deep natural shadows',
    icon: SunMedium,
    rimTone: 'noir'
  },
  {
    id: 'cyber-rim',
    name: 'Cyberpunk Rim Light',
    desc: 'Subtle cyan and magenta rim light accents with high contrast',
    promptSnippet: 'Cinematic studio lighting with subtle dual cyan and magenta rim lighting accentuating subject contours, crisp specular highlights, deep shadows',
    icon: SunMedium,
    rimTone: 'cyber'
  },
  {
    id: 'golden-key',
    name: 'Warm Golden Key',
    desc: 'Directional 3200K key light with soft warm rim and balanced bounce',
    promptSnippet: 'Warm golden studio key lighting with soft rim light, authentic warm subsurface scattering on skin, natural bounce fill, deep shadows',
    icon: SunMedium,
    rimTone: 'golden'
  },
  {
    id: 'high-contrast',
    name: 'High-Contrast Chiaroscuro',
    desc: 'Rembrandt key lighting with dramatic ambient occlusion shadows',
    promptSnippet: 'High-contrast chiaroscuro studio lighting, sharp shadow roll-off, crisp rim highlights, dramatic studio mood',
    icon: SunMedium,
    rimTone: 'noir'
  }
];

const BACKGROUND_STYLES = [
  {
    id: 'dark-gradient',
    name: 'Modern Dark Gradient',
    desc: 'Subtle charcoal vignette with studio gradient',
    promptSnippet: 'a modern dark cinematic background with subtle gradients and studio vignette'
  },
  {
    id: 'volumetric-fog',
    name: 'Volumetric Fog Studio',
    desc: 'Moody studio bokeh with drifting volumetric haze',
    promptSnippet: 'a dark atmospheric studio background with soft bokeh depth of field and subtle volumetric haze'
  },
  {
    id: 'minimal-obsidian',
    name: 'Architectural Obsidian',
    desc: 'Minimalist dark concrete with subtle raytraced reflections',
    promptSnippet: 'an architectural minimalist dark obsidian background with subtle reflections and cinematic gradient'
  }
];

// Sample reference faces for instant 1-click testing
const SAMPLE_REFERENCES = [
  {
    name: 'Portrait Alpha',
    url: '/new-test.png',
    thumb: '/new-test.png',
    tag: 'Test Reference'
  },
  {
    name: 'Portrait Beta',
    url: '/test.jpeg',
    thumb: '/test.jpeg',
    tag: 'Outdoor Couple'
  },
  {
    name: 'Studio Male',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    tag: 'Studio Face'
  },
  {
    name: 'Studio Female',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    tag: 'Studio Face'
  }
];

const GENERATION_STAGES = [
  'Preserving facial identity, natural skin tone & eye shape...',
  'Tailoring stylish black mask with micro-stitching & folds...',
  'Generating Unreal Engine 5 PBR skin shaders & subsurface scattering...',
  'Calibrating dramatic studio lighting & rim accents...',
  'Rendering 4K Ultra HD master in 9:16 vertical format...'
];

export default function CinematicStudio({ onOpenGlobeView, initialReference }: CinematicStudioProps) {
  // Input Reference State
  const [referencePhoto, setReferencePhoto] = useState<string | null>(initialReference || '/new-test.png');
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Studio Tuning Preset State
  const [selectedMask, setSelectedMask] = useState(MASK_STYLES[0]);
  const [selectedLighting, setSelectedLighting] = useState(LIGHTING_STYLES[0]);
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_STYLES[0]);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '3:4' | '1:1'>('9:16');
  const [customNotes, setCustomNotes] = useState('');
  const [isPromptExpanded, setIsPromptExpanded] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Generation & Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStageIndex, setGenerationStageIndex] = useState(0);
  const [generatedPortrait, setGeneratedPortrait] = useState<string | null>(null);
  const [cinematicSpecs, setCinematicSpecs] = useState<any>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Output View Mode ('split' | '3d-tilt' | 'full')
  const [viewMode, setViewMode] = useState<'split' | '3d-tilt'>('split');

  // Modals
  const [showDeepZoom, setShowDeepZoom] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Build current prompt string conforming to exact specifications
  const currentPrompt = `Professional 3D Cinematic Portrait | 4K Ultra HD

Transform the uploaded reference photo into an ultra-realistic, high-end 3D cinematic portrait. Preserve the person's exact identity, recognizable facial features, natural skin tone, hairstyle, eye shape, age, and body proportions.

Add a stylish black face mask covering the nose, mouth, and chin, with realistic fabric texture, detailed stitching, natural folds, accurate face fitting, and physically realistic shadows. Mask details: ${selectedMask.promptSnippet}.

Create a premium 3D appearance with realistic skin shaders, detailed hair strands, lifelike eyes, subtle subsurface scattering, realistic lighting, ambient occlusion, ray-traced reflections, and cinematic depth of field.

Lighting and background: ${selectedLighting.promptSnippet}, ${selectedBg.promptSnippet}, and professional 3D rendering quality.

Camera and composition: Vertical ${aspectRatio} aspect ratio, portrait orientation, eye-level camera angle, sharp focus on the eyes, realistic perspective, and a professional composition suitable for social media.

Rendering quality: Ultra-realistic 3D render, 4K UHD, high-detail textures, physically based rendering (PBR), Unreal Engine 5 quality, cinematic color grading, crisp details, photorealistic finish.

Negative prompt: Cartoon, anime, plastic skin, fake face, identity changes, distorted eyes, deformed hands, extra fingers, blurry image, low resolution, excessive smoothing, incorrect mask placement, oversaturated colors, watermark, unwanted text.${customNotes ? ` Director's notes: ${customNotes}` : ''}

Final output: A stunning, realistic 3D cinematic portrait with a premium black mask, natural facial identity, dramatic lighting, and professional 4K quality in ${aspectRatio} format.`;

  // Camera Handling
  const startCamera = async () => {
    try {
      setUseCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1920 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (e) {
      console.error('Camera access error:', e);
      setUseCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setUseCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const w = videoRef.current.videoWidth || 720;
      const h = videoRef.current.videoHeight || 1280;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
        setReferencePhoto(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferencePhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generation Trigger
  const handleGenerate = async () => {
    if (!referencePhoto) return;

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStageIndex(0);

    // Simulated phase increments
    const interval = setInterval(() => {
      setGenerationStageIndex((prev) => (prev < GENERATION_STAGES.length - 1 ? prev + 1 : prev));
    }, 1800);

    try {
      const res = await fetch('/api/generate-portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceImage: referencePhoto,
          maskStyle: selectedMask.promptSnippet,
          lightingStyle: selectedLighting.promptSnippet,
          backgroundStyle: selectedBg.promptSnippet,
          customPromptAdditions: customNotes,
          aspectRatio: aspectRatio
        })
      });

      const data = await res.json();
      clearInterval(interval);

      if (!data.success || !data.portraitImage) {
        throw new Error(data.error || 'Failed to synthesize portrait.');
      }

      setGeneratedPortrait(data.portraitImage);
      setCinematicSpecs(data.specs);
      setIsGenerating(false);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Generation error:', err);
      setGenerationError(err.message || 'Error occurred during generation. Please try again.');
      setIsGenerating(false);
    }
  };

  const copyPromptText = () => {
    navigator.clipboard.writeText(currentPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  // Download with Film Card Frame
  const downloadFramedPortrait = () => {
    if (!generatedPortrait) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = generatedPortrait;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const borderSize = 40;
      const bottomBar = 110;
      canvas.width = img.width + borderSize * 2;
      canvas.height = img.height + borderSize + bottomBar;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Dark Matte Frame
      ctx.fillStyle = '#08080c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Main Image
      ctx.drawImage(img, borderSize, borderSize, img.width, img.height);

      // Outer accent line
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(borderSize, borderSize, img.width, img.height);

      // Bottom Film Bar Text
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('3D CINEMATIC PORTRAIT // 4K ULTRA HD', borderSize + 10, img.height + borderSize + 40);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px monospace';
      ctx.fillText(`PBR SHADERS • UNREAL ENGINE 5 • 85mm f/1.4 • ${selectedMask.name.toUpperCase()}`, borderSize + 10, img.height + borderSize + 72);

      const link = document.createElement('a');
      link.download = `3d-cinematic-portrait-4k-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  return (
    <div className="w-full h-full bg-[#0a0a0f] text-neutral-100 flex flex-col overflow-y-auto selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full h-16 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wider uppercase text-white">
                Remix Anywhere
              </span>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-semibold tracking-wider">
                4K Cinematic
              </span>
            </div>
            <p className="text-[11px] font-mono text-neutral-400 hidden sm:block">
              Professional 3D Cinematic Portrait Studio &bull; Black Mask &bull; PBR Shaders
            </p>
          </div>
        </div>

        {/* Global Modes: Studio vs 3D Globe */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenGlobeView(referencePhoto || '/new-test.png')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-mono text-neutral-300 hover:text-white transition-all shadow-sm"
            title="Explore portraits in the 3D WebGL Spherical Globe"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">3D Globe Gallery</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Reference Photo Input & Studio Rig Settings */}
        <div className="w-full lg:w-[460px] flex-shrink-0 space-y-6">
          {/* Reference Photo Card */}
          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4" />
                1. Upload Reference Photo
              </label>
              {referencePhoto && (
                <button
                  onClick={() => setReferencePhoto(null)}
                  className="text-[11px] font-mono text-neutral-400 hover:text-red-400 transition-colors"
                >
                  Clear Photo
                </button>
              )}
            </div>

            {/* Photo Preview / Webcam view / Upload Area */}
            {!useCamera ? (
              <div className="space-y-3">
                {referencePhoto ? (
                  <div className="relative w-full aspect-[3/4] max-h-[300px] rounded-xl overflow-hidden border border-neutral-700 bg-neutral-950 group">
                    <img
                      src={referencePhoto}
                      alt="Selected Reference"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <span className="text-[11px] font-mono text-neutral-300">
                        Identity reference active
                      </span>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 text-xs font-mono bg-neutral-800 hover:bg-neutral-700 text-white rounded border border-neutral-600"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-700 hover:border-cyan-500/60 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-neutral-950/40 hover:bg-neutral-950/70 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-700 group-hover:border-cyan-500/50 flex items-center justify-center mb-3 text-neutral-400 group-hover:text-cyan-400 transition-colors">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-200">
                      Upload your portrait photo
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
                      JPG, PNG or WEBP. Preserves your exact facial features, skin tone & hairstyle.
                    </p>
                  </div>
                )}

                {/* Upload & Camera Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-neutral-700 hover:border-neutral-500 bg-neutral-800/80 hover:bg-neutral-700 text-xs font-mono text-neutral-200 transition-all font-medium"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose File
                  </button>
                  <button
                    onClick={startCamera}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-neutral-700 hover:border-cyan-500/40 bg-neutral-800/80 hover:bg-neutral-700 text-xs font-mono text-neutral-200 transition-all font-medium"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Use Webcam
                  </button>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />

                {/* Instant Sample References */}
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 block mb-2 font-medium">
                    Or pick an instant sample reference:
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    {SAMPLE_REFERENCES.map((samp, idx) => (
                      <button
                        key={idx}
                        onClick={() => setReferencePhoto(samp.url)}
                        className={`relative aspect-[3/4] rounded-lg overflow-hidden border transition-all group ${
                          referencePhoto === samp.url
                            ? 'border-cyan-400 ring-2 ring-cyan-500/40 shadow-md'
                            : 'border-neutral-800 hover:border-neutral-600 opacity-75 hover:opacity-100'
                        }`}
                        title={samp.name}
                      >
                        <img
                          src={samp.thumb}
                          alt={samp.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[9px] font-mono text-center text-neutral-300 py-0.5 truncate px-1">
                          {samp.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Live Camera Capture Box */
              <div className="space-y-3">
                <div className="relative w-full aspect-[9/16] max-h-[360px] rounded-xl overflow-hidden border border-cyan-500/50 bg-black shadow-lg">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                  />
                  {/* Portrait Alignment Reticle */}
                  <div className="absolute inset-x-8 top-12 bottom-16 border border-cyan-400/40 rounded-full pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
                      Align Face Here
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4 fill-black" />
                    Capture Photo
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs rounded-xl transition-all border border-neutral-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Mask & Lighting Controls */}
          <div className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm shadow-xl space-y-5">
            {/* Mask Style Selector */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Shirt className="w-4 h-4" />
                  2. Black Face Mask Style
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  Micro-stitching & natural folds
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MASK_STYLES.map((mask) => (
                  <button
                    key={mask.id}
                    onClick={() => setSelectedMask(mask)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedMask.id === mask.id
                        ? 'bg-cyan-950/30 border-cyan-400/70 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                        : 'bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:bg-neutral-900/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold text-cyan-300 flex items-center justify-between">
                      <span>{mask.name}</span>
                      {selectedMask.id === mask.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {mask.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Cinematic Lighting Rig */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <SunMedium className="w-4 h-4" />
                  3. Cinematic Lighting Rig
                </label>
                <span className="text-[10px] font-mono text-neutral-400">
                  Rim accents & balanced shadows
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {LIGHTING_STYLES.map((light) => (
                  <button
                    key={light.id}
                    onClick={() => setSelectedLighting(light)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedLighting.id === light.id
                        ? 'bg-cyan-950/30 border-cyan-400/70 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                        : 'bg-neutral-950/40 border-neutral-800 text-neutral-300 hover:bg-neutral-900/80 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-mono text-xs font-semibold text-cyan-300 flex items-center justify-between">
                      <span>{light.name}</span>
                      {selectedLighting.id === light.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                      {light.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Atmosphere */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Palette className="w-4 h-4" />
                  4. Dark Backdrop Gradient
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_STYLES.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => setSelectedBg(bg)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selectedBg.id === bg.id
                        ? 'bg-cyan-950/30 border-cyan-400/70 text-white ring-1 ring-cyan-500/30'
                        : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-semibold block truncate">
                      {bg.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4" />
                  5. Frame Aspect Ratio
                </label>
                <span className="text-[10px] font-mono text-cyan-300">
                  Vertical 9:16 (Standard)
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['9:16', '3:4', '1:1'] as const).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-3 rounded-xl border text-center font-mono text-xs transition-all ${
                      aspectRatio === ratio
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                        : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ratio === '9:16' ? '9:16 (Story/Phone)' : ratio === '3:4' ? '3:4 (Portrait)' : '1:1 (Square)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Collapsible Prompt Inspector */}
            <div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950/40">
              <button
                onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-mono text-neutral-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  Inspect Exact Prompt & Shaders
                </span>
                {isPromptExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {isPromptExpanded && (
                <div className="p-4 border-t border-neutral-800 space-y-3 animate-in fade-in duration-150">
                  <div className="relative">
                    <pre className="text-[10px] font-mono text-neutral-300 bg-neutral-950 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed border border-neutral-800/80">
                      {currentPrompt}
                    </pre>
                    <button
                      onClick={copyPromptText}
                      className="absolute top-2 right-2 p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded border border-neutral-700 flex items-center gap-1 text-[10px] font-mono"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-3 h-3 text-cyan-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-400 block mb-1">
                      Optional custom notes to model:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. sharp jawline focus, subtle neon reflection on iris"
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message if generation fails */}
            {generationError && (
              <div className="p-3 bg-red-950/60 border border-red-800/70 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{generationError}</span>
              </div>
            )}

            {/* Main Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!referencePhoto || isGenerating}
              className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>SYNTHESIZING 3D CINEMATIC PORTRAIT...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-black text-black" />
                  <span>TRANSFORM TO 3D CINEMATIC PORTRAIT [4K UHD]</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Showcase & Interactive 3D Viewer */}
        <div className="flex-1 w-full flex flex-col items-center">
          {/* Active Generation Progress Screen */}
          {isGenerating && (
            <div className="w-full max-w-[460px] aspect-[9/16] rounded-2xl bg-neutral-950 border border-cyan-500/40 p-8 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden animate-in fade-in duration-300">
              {/* Scanline ray animation */}
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse top-1/4 shadow-[0_0_20px_#06b6d4]" />

              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-inner">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>

              <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 mb-2">
                Unreal Engine 5 PBR Synthesis
              </span>

              <p className="text-sm font-sans font-medium text-white max-w-xs mb-8 min-h-[48px] flex items-center justify-center">
                {GENERATION_STAGES[generationStageIndex]}
              </p>

              {/* Progress Steps */}
              <div className="w-full max-w-xs space-y-2 text-left">
                {GENERATION_STAGES.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-[11px] font-mono">
                    <div
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        idx < generationStageIndex
                          ? 'bg-cyan-500 text-black'
                          : idx === generationStageIndex
                          ? 'border border-cyan-400 text-cyan-300 animate-pulse'
                          : 'border border-neutral-800 text-neutral-600'
                      }`}
                    >
                      {idx < generationStageIndex ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`truncate ${
                        idx <= generationStageIndex ? 'text-neutral-200' : 'text-neutral-600'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rendered Output Showcase */}
          {!isGenerating && generatedPortrait && (
            <div className="w-full flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-300">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2 p-1 bg-neutral-900 border border-neutral-800 rounded-xl shadow-md">
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                    viewMode === 'split'
                      ? 'bg-neutral-800 text-cyan-300 font-semibold shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Before & After Slider</span>
                </button>

                <button
                  onClick={() => setViewMode('3d-tilt')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                    viewMode === '3d-tilt'
                      ? 'bg-neutral-800 text-cyan-300 font-semibold shadow-sm border border-neutral-700'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3D Parallax Tilt</span>
                </button>
              </div>

              {/* Viewer Stage */}
              <div className="w-full flex justify-center">
                {viewMode === 'split' && referencePhoto ? (
                  <BeforeAfterSlider
                    originalImage={referencePhoto}
                    generatedImage={generatedPortrait}
                    onOpenZoom={() => setShowDeepZoom(true)}
                  />
                ) : (
                  <HolographicPortraitCanvas
                    imageUrl={generatedPortrait}
                    lightingTone={selectedLighting.rimTone}
                  />
                )}
              </div>

              {/* Action Toolbar */}
              <div className="w-full max-w-[440px] grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <button
                  onClick={() => setShowDeepZoom(true)}
                  className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  title="Inspect skin shaders and stitching at up to 400%"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>4K Zoom</span>
                </button>

                <button
                  onClick={() => setShowVideoModal(true)}
                  className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  title="Animate into a 4-second camera motion video"
                >
                  <Film className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Animate</span>
                </button>

                <a
                  href={generatedPortrait}
                  download="3d-cinematic-portrait-4k.png"
                  className="py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-xl text-xs font-mono text-neutral-200 hover:text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  title="Download clean 9:16 portrait image"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Download</span>
                </a>

                <button
                  onClick={downloadFramedPortrait}
                  className="py-2.5 px-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 rounded-xl text-xs font-mono text-cyan-300 font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  title="Download with cinematic film borders & specs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Film Card</span>
                </button>
              </div>

              {/* Technical PBR Specs Card */}
              {cinematicSpecs && (
                <div className="w-full max-w-[440px] p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 font-mono text-xs space-y-2 text-neutral-300">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      4K Cinematic Render Specs
                    </span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded">
                      Verified 4K UHD
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                    <div>
                      <span className="text-neutral-500">Engine: </span>
                      <span className="text-neutral-200">UE5 PBR Lumen</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Optics: </span>
                      <span className="text-neutral-200">85mm f/1.4 Cine Prime</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Shaders: </span>
                      <span className="text-neutral-200">Subsurface Scattering</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Mask Craft: </span>
                      <span className="text-neutral-200 truncate block">{selectedMask.name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Lighting: </span>
                      <span className="text-neutral-200 truncate block">{selectedLighting.name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Format: </span>
                      <span className="text-neutral-200">{aspectRatio} Portrait</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Initial State / Prompt Feature Card when nothing is generated yet */}
          {!isGenerating && !generatedPortrait && (
            <div className="w-full max-w-[460px] aspect-[9/16] rounded-2xl border-2 border-dashed border-neutral-800 bg-neutral-950/30 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900/80 border border-neutral-700/80 flex items-center justify-center mb-5 shadow-inner">
                <Shirt className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-base font-mono font-bold text-white uppercase tracking-wider mb-2">
                Studio Viewport Ready
              </h3>
              <p className="text-xs text-neutral-400 font-sans max-w-xs leading-relaxed mb-6">
                Click <span className="text-cyan-400 font-semibold">Transform to 3D Cinematic Portrait</span> to convert your reference photo into an Unreal Engine 5 quality render with realistic black mask and studio lighting.
              </p>

              <div className="w-full bg-neutral-900/60 border border-neutral-800 rounded-xl p-3 text-left font-mono text-[11px] space-y-1 text-neutral-300">
                <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Preserved from your photo:
                </div>
                <div className="text-neutral-400">&bull; Exact facial identity & natural skin tone</div>
                <div className="text-neutral-400">&bull; Eye shape, hairstyle, age & body structure</div>
                <div className="text-neutral-400">&bull; 4K UHD 9:16 vertical social format</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Deep Zoom Modal */}
      {showDeepZoom && generatedPortrait && (
        <DeepZoomModal
          imageUrl={generatedPortrait}
          onClose={() => setShowDeepZoom(false)}
        />
      )}

      {/* Cinematic Video Motion Modal */}
      {showVideoModal && generatedPortrait && (
        <CinematicVideoModal
          portraitImage={generatedPortrait}
          onClose={() => setShowVideoModal(false)}
        />
      )}
    </div>
  );
}
