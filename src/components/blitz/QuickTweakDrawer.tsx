'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@remotion/player';
import { HookDemoComposition } from '../../remotion/HookDemoComposition';
import { WallOfTextComposition } from '../../remotion/WallOfTextComposition';
import { SlideshowComposition } from '../../remotion/SlideshowComposition';

export const QuickTweakDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cardData: any;
  onSave: (updates: any) => void;
}> = ({ isOpen, onClose, cardData, onSave }) => {
  const [hookText, setHookText] = useState('');
  const [mentionBusiness, setMentionBusiness] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(102);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);

  const [foregroundVideoUrl, setForegroundVideoUrl] = useState('');
  const [backgroundAssetUrl, setBackgroundAssetUrl] = useState('');

  const [showAssetPicker, setShowAssetPicker] = useState<'FOREGROUND' | 'BACKGROUND' | null>(null);

  useEffect(() => {
    if (cardData) {
      setHookText(cardData.hookText || '');
      setMentionBusiness(cardData.mentionBusiness ?? true);
      setZoomPercent(cardData.zoomPercent ?? 102);
      setPosX(cardData.posX ?? 0);
      setPosY(cardData.posY ?? 0);
      setForegroundVideoUrl(cardData.foregroundVideoUrl || '');
      setBackgroundAssetUrl(cardData.backgroundAssetUrl || '');
    }
  }, [cardData]);

  if (!isOpen || !cardData) return null;

  const mockForegrounds = [
    { id: 1, url: 'https://media.aftermark.ai/usefastlane/memes/brittany_cutout_alpha.webm', name: 'Brittany Broski' },
    { id: 2, url: 'https://media.aftermark.ai/usefastlane/memes/pedro_cutout_alpha.webm', name: 'Pedro Pascal Driving' }
  ];

  const mockBackgrounds = [
    { id: 1, url: 'https://media.aftermark.ai/usefastlane/broll/night_bridge_city.mp4', name: 'Night Bridge' },
    { id: 2, url: 'https://media.aftermark.ai/usefastlane/broll/sunset_highway.mp4', name: 'Sunset Highway' },
    { id: 3, url: 'https://media.aftermark.ai/usefastlane/broll/cozy_desk_lamp.jpg', name: 'Cozy Desk' }
  ];

  const getRemotionComponent = (templateType: string) => {
    if (templateType === 'SLIDESHOW') return SlideshowComposition;
    if (templateType === 'HOOK_DEMO') return HookDemoComposition;
    return WallOfTextComposition;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 bg-[#0D0F12] flex flex-col"
      >
        <header className="h-[60px] border-b border-white/10 flex items-center justify-between px-6 shrink-0 bg-[#1a1c23]">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <span>⚡</span>
                <span>Fastlane Studio</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-medium">✕ Close</button>
        </header>

        <div className="flex-1 flex overflow-hidden relative">
            {/* Asset Picker Modal */}
            {showAssetPicker && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-[#1a1c23] border border-white/10 p-6 rounded-2xl w-full max-w-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-white text-xl font-bold">Select {showAssetPicker === 'FOREGROUND' ? 'Meme Cutout' : 'Background'}</h2>
                            <button onClick={() => setShowAssetPicker(null)} className="text-gray-400 hover:text-white">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {(showAssetPicker === 'FOREGROUND' ? mockForegrounds : mockBackgrounds).map(asset => (
                                <div
                                   key={asset.id}
                                   className="bg-white/5 border border-white/10 p-4 rounded-xl cursor-pointer hover:border-[#FF5722] hover:bg-white/10 transition flex items-center space-x-4"
                                   onClick={() => {
                                       if (showAssetPicker === 'FOREGROUND') setForegroundVideoUrl(asset.url);
                                       else setBackgroundAssetUrl(asset.url);
                                       setShowAssetPicker(null);
                                   }}
                                >
                                    <div className="w-16 h-16 bg-black rounded-lg overflow-hidden flex-shrink-0">
                                        <video src={asset.url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                                    </div>
                                    <span className="text-white font-medium">{asset.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Left Panel: ASSETS */}
            <div className="w-[350px] border-r border-white/10 bg-[#14151a] p-6 flex flex-col space-y-8 overflow-y-auto">
                <h3 className="text-white font-bold tracking-widest text-xs uppercase text-gray-500">Assets & Layers</h3>

                <div className="space-y-4">
                    {/* Layer 1 */}
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-900 rounded flex items-center justify-center text-xl">👤</div>
                            <div>
                                <div className="text-sm text-white font-medium">Layer 1: Meme Cutout</div>
                                <div className="text-xs text-emerald-400">Green Screen Active</div>
                            </div>
                        </div>
                        <button onClick={() => setShowAssetPicker('FOREGROUND')} className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">Swap</button>
                    </div>

                    {/* Layer 2 */}
                    <div className="flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-900 rounded flex items-center justify-center text-xl">🏙️</div>
                            <div>
                                <div className="text-sm text-white font-medium">Layer 2: Background</div>
                                <div className="text-xs text-blue-400">B-Roll Loop</div>
                            </div>
                        </div>
                        <button onClick={() => setShowAssetPicker('BACKGROUND')} className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">Swap</button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-white font-bold tracking-widest text-xs uppercase text-gray-500">Mention Your Business?</h3>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setMentionBusiness(true)}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${mentionBusiness ? 'bg-[#FF5722] text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                        >
                            Yes
                        </button>
                        <button
                            onClick={() => setMentionBusiness(false)}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${!mentionBusiness ? 'bg-[#FF5722] text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                        >
                            No
                        </button>
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-white font-bold tracking-widest text-xs uppercase text-gray-500">Hook Text</h3>
                    <textarea
                        value={hookText}
                        onChange={(e) => setHookText(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#FF5722] h-24"
                    />
                </div>
            </div>

            {/* Center Panel: CANVAS */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="w-[390px] h-[692px] border border-white/10 bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                    <Player
                        component={getRemotionComponent(cardData.templateType)}
                        inputProps={{
                          brollVideoUrl: backgroundAssetUrl || cardData.brollVideoUrl,
                          demoVideoUrl: foregroundVideoUrl,
                          images: [backgroundAssetUrl || cardData.brollVideoUrl],
                          subtitlesJson: cardData.subtitlesJson,
                          hookText: hookText,
                          bodyText: cardData.bodyText || ''
                        }}
                        durationInFrames={300}
                        compositionWidth={1080}
                        compositionHeight={1920}
                        fps={30}
                        style={{ width: '100%', height: '100%', transform: `scale(${zoomPercent / 100})`, position: 'absolute' }}
                        autoPlay
                        loop
                    />

                    {/* Interactive Drag Overlay for Cutout Repositioning */}
                    <motion.div
                        drag
                        dragConstraints={{ left: -200, right: 200, top: -300, bottom: 300 }}
                        dragElastic={0}
                        dragMomentum={false}
                        onDrag={(e, info) => {
                            setPosX(info.point.x);
                            setPosY(info.point.y);
                        }}
                        className="absolute inset-0 z-10 cursor-move border-2 border-dashed border-transparent hover:border-white/50 group"
                        style={{ x: posX, y: posY }}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                            <div className="bg-black/50 text-white px-3 py-1 rounded backdrop-blur text-sm">Drag to reposition</div>
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
                    <button
                        onClick={() => {
                            onSave({ hookText, mentionBusiness, zoomPercent, posX, posY, foregroundVideoUrl, backgroundAssetUrl });
                            onClose();
                        }}
                        className="bg-[#FF5722] hover:bg-[#EA580C] text-white px-12 py-4 rounded-full font-bold text-lg shadow-[0_0_20px_rgba(255,87,34,0.4)] transition"
                    >
                        ✓ Done Editing
                    </button>
                </div>
            </div>

            {/* Right Panel: INSPECTOR */}
            <div className="w-[300px] border-l border-white/10 bg-[#14151a] p-6 flex flex-col space-y-6">
                <div className="border border-white/10 rounded-xl overflow-hidden">
                    <div className="bg-white/5 p-3 flex justify-between items-center cursor-pointer">
                        <span className="font-semibold text-white">🎥 Video Transform</span>
                        <span>▾</span>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Zoom</span>
                                <span>{zoomPercent}%</span>
                            </div>
                            <input
                                type="range"
                                min="100"
                                max="200"
                                value={zoomPercent}
                                onChange={(e) => setZoomPercent(parseInt(e.target.value))}
                                className="w-full accent-[#FF5722]"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setZoomPercent(102);
                                setPosX(0);
                                setPosY(0);
                            }}
                            className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-semibold text-gray-300 transition"
                        >
                            Reset Position
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
