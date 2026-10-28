import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Globe } from 'lucide-react';
import CinematicStudio from './components/CinematicStudio';
import GalleryGlobe from './components/GalleryGlobe';
import LocationDetailsScreen from './components/LocationDetailsScreen';
import LoadingOverlay from './components/LoadingOverlay';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'globe'>('studio');
  const [currentPhoto, setCurrentPhoto] = useState<string>('/new-test.png');
  const [selectedCard, setSelectedCard] = useState<{ image: string; location: string; info: string } | null>(null);
  const [isLoadingGlobe, setIsLoadingGlobe] = useState(false);

  const handleOpenGlobe = (photo: string) => {
    setCurrentPhoto(photo);
    setIsLoadingGlobe(true);
    setActiveTab('globe');
  };

  return (
    <div className="w-full h-full relative bg-[#0a0a0f] overflow-hidden select-none font-sans">
      {/* Cinematic Studio View */}
      {activeTab === 'studio' && (
        <CinematicStudio
          initialReference={currentPhoto}
          onOpenGlobeView={(img) => handleOpenGlobe(img)}
        />
      )}

      {/* 3D WebGL Spherical Globe View */}
      {activeTab === 'globe' && (
        <div className="absolute inset-0 bg-white">
          <AnimatePresence>
            {isLoadingGlobe && (
              <motion.div
                key="loading-overlay"
                className="absolute inset-0 z-40 bg-white"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <LoadingOverlay onComplete={() => setIsLoadingGlobe(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ scale: 1, opacity: 0 }}
            animate={
              isLoadingGlobe 
                ? { scale: 1, opacity: 0 } 
                : { scale: selectedCard ? 0.8 : 1, opacity: selectedCard ? 0.3 : 1 }
            }
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute inset-0 ${selectedCard ? 'pointer-events-none' : ''}`}
          >
            <GalleryGlobe 
              userPhoto={currentPhoto} 
              onSelect={(img, loc, info) => setSelectedCard({ image: img, location: loc, info: info })} 
            />
          </motion.div>

          {/* Floating Back to Studio Button */}
          {!isLoadingGlobe && !selectedCard && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="absolute top-6 left-6 z-40 flex items-center gap-3"
            >
              <button 
                onClick={() => setActiveTab('studio')}
                className="flex items-center gap-2 px-4 py-2.5 bg-neutral-900/90 hover:bg-neutral-900 text-white text-xs font-mono font-medium tracking-wider uppercase rounded-full shadow-xl border border-neutral-700 transition-all hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4 text-cyan-400" />
                <span>Return to Cinematic Studio</span>
              </button>
            </motion.div>
          )}

          <AnimatePresence>
            {selectedCard && (
              <LocationDetailsScreen 
                key="location-details"
                data={selectedCard} 
                onClose={() => setSelectedCard(null)} 
              />
            )}
          </AnimatePresence>

          {!isLoadingGlobe && !selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="absolute bottom-8 left-0 right-0 flex justify-center z-30 pointer-events-none"
            >
              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase bg-white/80 px-4 py-1.5 rounded-full border border-gray-200 shadow-sm backdrop-blur-sm">
                Drag to rotate globe &bull; Scroll to zoom inside sphere &bull; Click card for details
              </span>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
