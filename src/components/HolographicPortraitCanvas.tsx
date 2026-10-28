import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Rotate3d, Compass, SunDim, Sparkles } from 'lucide-react';

interface HolographicPortraitCanvasProps {
  imageUrl: string;
  lightingTone?: string;
}

// Inner 3D card mesh with tilt and lighting
function FloatingPortrait({
  imageUrl,
  pointerPos,
  autoRotate
}: {
  imageUrl: string;
  pointerPos: React.MutableRefObject<{ x: number; y: number }>;
  autoRotate: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Group>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      imageUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.generateMipmaps = true;
        setTexture(tex);
      },
      undefined,
      (err) => console.error("Error loading texture:", err)
    );
  }, [imageUrl]);

  useFrame((state, delta) => {
    if (!frameRef.current) return;

    // Target rotation based on mouse pointer position
    const targetRotX = -pointerPos.current.y * 0.35;
    let targetRotY = pointerPos.current.x * 0.45;

    if (autoRotate) {
      targetRotY += Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
    }

    // Smooth lerping
    frameRef.current.rotation.x = THREE.MathUtils.lerp(
      frameRef.current.rotation.x,
      targetRotX,
      0.08
    );
    frameRef.current.rotation.y = THREE.MathUtils.lerp(
      frameRef.current.rotation.y,
      targetRotY,
      0.08
    );

    // Subtle floating bob
    frameRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
  });

  // 9:16 aspect ratio dimensions (width: 2.25, height: 4.0)
  const cardWidth = 2.4;
  const cardHeight = 4.266;

  return (
    <group ref={frameRef}>
      {/* Front portrait plate */}
      <mesh ref={meshRef}>
        <planeGeometry args={[cardWidth, cardHeight, 16, 16]} />
        {texture ? (
          <meshPhysicalMaterial
            map={texture}
            roughness={0.25}
            metalness={0.1}
            clearcoat={0.6}
            clearcoatRoughness={0.15}
            reflectivity={0.8}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial color="#1a1a1a" />
        )}
      </mesh>

      {/* Sleek beveled glass backing frame */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[cardWidth + 0.08, cardHeight + 0.08, 0.06]} />
        <meshStandardMaterial
          color="#0d0d12"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Glowing rim edge */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[cardWidth + 0.04, cardHeight + 0.04, 0.02]} />
        <meshBasicMaterial
          color="#06b6d4"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>
    </group>
  );
}

// Ambient studio dust particles
function StudioDustParticles({ count = 80 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const particlesPosition = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particlesPosition, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#a5f3fc"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function HolographicPortraitCanvas({
  imageUrl,
  lightingTone = "dramatic"
}: HolographicPortraitCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerPos = useRef({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Normalize to -1 to +1
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    pointerPos.current = { x, y };
  };

  const handlePointerLeave = () => {
    pointerPos.current = { x: 0, y: 0 };
  };

  // Color theme for rim lights based on selected preset
  const isCyber = lightingTone.toLowerCase().includes('cyber');
  const isGolden = lightingTone.toLowerCase().includes('golden');
  const rimColor1 = isCyber ? "#06b6d4" : isGolden ? "#f59e0b" : "#e2e8f0";
  const rimColor2 = isCyber ? "#ec4899" : isGolden ? "#fb923c" : "#3b82f6";

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full max-w-[440px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black select-none cursor-grab active:cursor-grabbing group"
    >
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 48 }}
        className="w-full h-full"
      >
        <ambientLight intensity={0.8} />

        {/* Key Spotlight simulating dramatic studio key light */}
        <spotLight
          position={[3, 4, 4]}
          intensity={1.8}
          angle={0.6}
          penumbra={0.7}
          color="#ffffff"
        />

        {/* Soft Rim Light 1 */}
        <pointLight
          position={[-3.5, 2, -1]}
          intensity={2.2}
          color={rimColor1}
        />

        {/* Soft Rim Light 2 */}
        <pointLight
          position={[3.5, -2, -1]}
          intensity={1.8}
          color={rimColor2}
        />

        {/* Atmospheric Dust */}
        <StudioDustParticles count={90} />

        {/* Interactive 3D Card */}
        <FloatingPortrait
          imageUrl={imageUrl}
          pointerPos={pointerPos}
          autoRotate={autoRotate}
        />
      </Canvas>

      {/* Floating UI HUD elements */}
      <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-2">
        <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest font-semibold uppercase bg-neutral-900/80 backdrop-blur-md text-cyan-300 rounded-md border border-cyan-500/20 shadow-sm flex items-center gap-1.5">
          <Rotate3d className="w-3.5 h-3.5 text-cyan-400" />
          3D Parallax Tilt
        </span>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded-md border backdrop-blur-md transition-colors ${
            autoRotate
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-neutral-900/80 text-neutral-400 border-neutral-700 hover:text-white'
          }`}
          title="Toggle Auto Floating Motion"
        >
          {autoRotate ? 'Float: ON' : 'Float: OFF'}
        </button>
      </div>

      {/* Interaction tip */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
        <span className="text-[10px] font-mono text-neutral-400 bg-neutral-950/70 border border-neutral-800/80 px-3 py-1 rounded-full backdrop-blur-md shadow-md">
          Move cursor or finger to tilt in 3D space
        </span>
      </div>
    </div>
  );
}
