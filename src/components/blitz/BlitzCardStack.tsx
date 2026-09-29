'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Player } from '@remotion/player';
import { WallOfTextComposition } from '../../remotion/WallOfTextComposition';
import { HookDemoComposition } from '../../remotion/HookDemoComposition';

interface CardData {
  id: string;
  hookText: string;
  bodyText: string;
  subtitlesJson: string;
  brollVideoUrl: string;
  viralityScore: number;
  templateType: string;
}

export const BlitzCardStack: React.FC<{
  cards: CardData[];
  onSwipeRight: (card: CardData) => void;
  onSwipeLeft: (card: CardData) => void;
  onTweak: () => void;
}> = ({ cards, onSwipeRight, onSwipeLeft, onTweak }) => {
  const [activeCardIndex, setActiveCardIndex] = useState(0);
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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCardIndex, cards, onTweak]);

  const playSwipeSound = (direction: 1 | -1) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (direction === 1) {
      // Right Swipe (Schedule) - pleasant double pop
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else {
      // Left Swipe (Skip) - low whoosh
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

    // Animate off screen
    x.set(direction * 500);

    setTimeout(() => {
      setActiveCardIndex(prev => prev + 1);
      x.set(0); // Reset for next card
      if (direction === 1) {
        onSwipeRight(swipedCard);
      } else {
        onSwipeLeft(swipedCard);
      }
    }, 200); // Wait for exit animation
  };

  if (activeCardIndex >= cards.length) {
    return <div className="text-white text-center py-20">No more cards. Buffering...</div>;
  }

  return (
    <div className="relative w-[390px] h-[692px] mx-auto flex items-center justify-center perspective-[1000px]">
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
                <div className="bg-white/10 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {card.templateType === 'HOOK_DEMO' ? 'Hook & Demo' : 'Wall of Text'}
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  🔥 {card.viralityScore}% Match
                </div>
              </div>

              {/* Remotion Player */}
              <div className="w-full h-full pointer-events-none">
                {isTop ? (
                  <Player
                    component={card.templateType === 'HOOK_DEMO' ? HookDemoComposition : WallOfTextComposition}
                    inputProps={{
                      brollVideoUrl: card.brollVideoUrl,
                      demoVideoUrl: card.brollVideoUrl, // reusing broll as demo video for sandbox purposes
                      subtitlesJson: card.subtitlesJson,
                      hookText: card.hookText,
                      bodyText: card.bodyText
                    }}
                    durationInFrames={300}
                    compositionWidth={1080}
                    compositionHeight={1920}
                    fps={30}
                    style={{ width: '100%', height: '100%' }}
                    autoPlay
                    loop
                  />
                ) : (
                  <div className="w-full h-full bg-black/50" /> // Placeholder for cards underneath to save compute
                )}
              </div>

              {/* Bottom Gradient Overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none p-6 flex flex-col justify-end">
                <h3 className="text-white font-bold text-xl mb-2 shadow-black drop-shadow-md">{card.hookText}</h3>
                <div className="flex items-center space-x-2 text-xs text-white/80">
                  <span>🎵 Trending Sound #12</span>
                </div>
              </div>

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
                      SCHEDULED
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
  );
};
