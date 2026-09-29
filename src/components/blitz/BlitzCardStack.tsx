'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Player } from '@remotion/player';
import { WallOfTextComposition } from '../../remotion/WallOfTextComposition';
import { HookDemoComposition } from '../../remotion/HookDemoComposition';
import { SlideshowComposition } from '../../remotion/SlideshowComposition';

interface CardData {
  id: string;
  hookText: string;
  bodyText: string;
  subtitlesJson: string;
  brollVideoUrl: string;
  backgroundAssetUrl: string;
  foregroundVideoUrl: string;
  viralityScore: number;
  templateType: string;
  positioningAngle: string;
  whyThisContent: string;
  memeTemplate?: {
    creatorHandle: string;
    originalLikes: string;
    originalViews: string;
    originalHookText: string;
    originalVideoUrl: string;
  };
}

export const BlitzCardStack: React.FC<{
  cards: CardData[];
  onSwipeRight: (card: CardData) => void;
  onSwipeLeft: (card: CardData) => void;
  onTweak: () => void;
}> = ({ cards, onSwipeRight, onSwipeLeft, onTweak }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const activeCard = cards[activeCardIndex];

  // Motion values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-16, 16]);

  // Opacity overlays for feedback
  const rightGlowOpacity = useTransform(x, [0, 120], [0, 1]);
  const leftGlowOpacity = useTransform(x, [0, -120], [0, 1]);

  // Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Key bindings
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCard) return;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        handleSwipe(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        handleSwipe(-1);
      } else if (e.key === 'ArrowUp' || e.key === 'w') {
        onTweak();
      } else if (e.key === 'm') {
        setIsMuted(!isMuted);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardIndex, cards, onTweak, isMuted]);

  const playSwipeSound = (direction: 1 | -1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (direction === 1) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  const handleDragEnd = (e: any, info: any) => {
    const threshold = 120;
    if (info.offset.x > threshold) {
      handleSwipe(1);
    } else if (info.offset.x < -threshold) {
      handleSwipe(-1);
    }
  };

  const handleSwipe = (direction: 1 | -1) => {
    playSwipeSound(direction);
    const swipedCard = activeCard;

    x.set(direction * 500);

    setTimeout(() => {
      setActiveCardIndex(prev => prev + 1);
      x.set(0);
      if (direction === 1) {
        onSwipeRight(swipedCard);
      } else {
        onSwipeLeft(swipedCard);
      }
    }, 200);
  };

  if (activeCardIndex >= cards.length) {
    return <div className="text-white text-center py-20 w-full flex justify-center items-center h-[700px]">No more cards. Buffering...</div>;
  }

  const getRemotionComponent = (templateType: string) => {
    if (templateType === 'SLIDESHOW') return SlideshowComposition;
    if (templateType === 'HOOK_DEMO') return HookDemoComposition;
    return WallOfTextComposition;
  }

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto mt-4">

      {/* Strategic Tags Row */}
      <div className="flex space-x-3 mb-6">
        <div className="bg-white/10 backdrop-blur-md text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-white/10">
          {activeCard.templateType.replace('_', ' ')}
        </div>
        <div className="bg-[#FF5722]/20 text-[#FF5722] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#FF5722]/30">
          {activeCard.positioningAngle || 'Angle'}
        </div>
        <div className="group relative cursor-help">
          <div className="bg-transparent text-white text-sm font-semibold px-4 py-1.5 rounded-full border border-[#FF5722] flex items-center space-x-2">
            <span>🧠</span>
            <span>Why This Content?</span>
          </div>
          <div className="absolute top-full mt-2 w-64 bg-[#1a1c23] border border-white/10 p-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-xs text-gray-300 leading-relaxed">
            {activeCard.whyThisContent || 'This hooks the user by mentioning a relatable pain point.'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-12 perspective-[1000px]">

        {/* Left Card: Remixed From (Static) */}
        {activeCard.memeTemplate && (
          <div className="relative w-[340px] h-[600px] bg-black border border-white/10 rounded-3xl overflow-hidden opacity-90 hidden md:block">
            <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
              <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                Remixed From
              </span>
              <span className="text-white/80 text-xs font-medium">{activeCard.memeTemplate.creatorHandle}</span>
            </div>

            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 items-end">
              <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded">
                ❤️ {activeCard.memeTemplate.originalLikes}
              </span>
              <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2 py-1 rounded">
                👁️ {activeCard.memeTemplate.originalViews}
              </span>
            </div>

            {/* The original video */}
            <video
              src={activeCard.memeTemplate.originalVideoUrl}
              className="w-full h-full object-cover opacity-50"
              autoPlay muted loop playsInline
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-white font-medium text-sm italic shadow-black drop-shadow-md">
                &quot;{activeCard.memeTemplate.originalHookText}&quot;
              </p>
            </div>
          </div>
        )}

        {/* Center Card: The Swipeable Remotion Canvas */}
        <div className="relative w-[390px] h-[692px]">
          <AnimatePresence>
            {cards.slice(activeCardIndex, activeCardIndex + 3).map((card, idx) => {
              const isTop = idx === 0;
              const scale = 1 - (idx * 0.05);
              const yOffset = idx * 12;
              const opacity = isTop ? 1 : 1 - (idx * 0.15);

              return (
                <motion.div
                  key={card.id}
                  className="absolute top-0 left-0 w-full h-full bg-[#1a1c23] border border-white/12 rounded-3xl overflow-hidden shadow-2xl origin-bottom"
                  style={{
                    x: isTop ? x : 0,
                    rotate: isTop ? rotate : 0,
                    scale,
                    y: yOffset,
                    zIndex: 10 - idx,
                    opacity
                  }}
                  drag={isTop ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.9}
                  onDragEnd={isTop ? handleDragEnd : undefined}
                >
                  {/* Card Header Overlay */}
                  <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      🔥 99% Match
                    </div>
                  </div>

                  {/* Mute Button Toggle Overlay */}
                  <div className="absolute top-12 right-4 z-30">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full text-white border border-white/20 transition pointer-events-auto"
                    >
                      {isMuted ? '🔇' : '🔊'}
                    </button>
                  </div>

                  {/* Remotion Player */}
                  <div className="w-full h-full pointer-events-none">
                    {isTop ? (
                      <Player
                        component={getRemotionComponent(card.templateType)}
                        inputProps={{
                          brollVideoUrl: card.backgroundAssetUrl || card.brollVideoUrl,
                          demoVideoUrl: card.backgroundAssetUrl || card.brollVideoUrl,
                          images: [card.backgroundAssetUrl || card.brollVideoUrl], // Mocking images for slideshow
                          subtitlesJson: card.subtitlesJson,
                          hookText: card.hookText,
                          bodyText: card.bodyText || ''
                        }}
                        durationInFrames={300}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        style={{ width: '100%', height: '100%' }}
                        autoPlay
                        loop
                        // Critical audio sync logic: only unmuted if top card AND global unmuted
                        mute={!isTop || isMuted}
                      />
                    ) : (
                      <div className="w-full h-full bg-black/50" />
                    )}
                  </div>

                  {/* Bottom Gradient Overlay */}
                  {card.templateType !== 'SLIDESHOW' && (
                    <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none p-6 flex flex-col justify-end">
                      <h3 className="text-white font-bold text-xl mb-2 shadow-black drop-shadow-md">{card.hookText}</h3>
                      <div className="flex items-center space-x-2 text-xs text-white/80">
                        <span>🎵 Trending Sound</span>
                      </div>
                    </div>
                  )}

                  {/* Drag Feedback Overlays */}
                  {isTop && (
                    <>
                      <motion.div
                        className="absolute inset-0 z-30 pointer-events-none"
                        style={{
                          backgroundColor: 'rgba(16, 185, 129, 0.4)',
                          opacity: rightGlowOpacity
                        }}
                      >
                        <div className="absolute top-1/4 left-8 transform -rotate-12 border-4 border-emerald-400 text-emerald-400 font-bold text-3xl px-4 py-2 rounded-xl bg-black/20 backdrop-blur-sm">
                          APPROVE
                        </div>
                      </motion.div>

                      <motion.div
                        className="absolute inset-0 z-30 pointer-events-none"
                        style={{
                          backgroundColor: 'rgba(244, 63, 94, 0.4)',
                          opacity: leftGlowOpacity
                        }}
                      >
                        <div className="absolute top-1/4 right-8 transform rotate-12 border-4 border-rose-400 text-rose-400 font-bold text-3xl px-4 py-2 rounded-xl bg-black/20 backdrop-blur-sm">
                          SKIPPED
                        </div>
                      </motion.div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
