'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickTweakDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cardData: any;
  onSave: (updates: any) => void;
}> = ({ isOpen, onClose, cardData, onSave }) => {
  const [hookText, setHookText] = useState('');
  const [mentionBusiness, setMentionBusiness] = useState(true);
  const [zoomPercent, setZoomPercent] = useState(102);

  useEffect(() => {
    if (cardData) {
      setHookText(cardData.hookText || '');
      setMentionBusiness(cardData.mentionBusiness ?? true);
      setZoomPercent(cardData.zoomPercent ?? 102);
    }
  }, [cardData]);

  if (!isOpen || !cardData) return null;

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

        <div className="flex-1 flex overflow-hidden">
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
                        <button className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">Swap</button>
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
                        <button className="text-xs font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded">Swap</button>
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

                <div className="space-y-3">
                    <h3 className="text-white font-bold tracking-widest text-xs uppercase text-gray-500">Prompt AI Override</h3>
                    <textarea
                        placeholder="E.g. Make it more sarcastic..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-[#FF5722] h-20"
                    />
                </div>
            </div>

            {/* Center Panel: CANVAS */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
                <div className="w-[390px] h-[692px] border border-white/10 bg-black rounded-3xl overflow-hidden shadow-2xl relative">
                   {/* Dummy canvas representation since Remotion Player is already heavy */}
                   <div className="absolute inset-0 bg-gray-800 flex items-center justify-center flex-col">
                       <span className="text-4xl mb-4">▶️</span>
                       <span className="text-gray-400 font-medium tracking-wide">Interactive Canvas Preview</span>
                       <span className="text-xs text-gray-500 mt-2">Scale: {zoomPercent}%</span>
                   </div>
                   <div className="absolute bottom-10 left-10 right-10 text-center">
                       <h1 className="text-white font-bold text-2xl shadow-black drop-shadow-lg">{hookText}</h1>
                   </div>
                </div>

                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <button
                        onClick={() => {
                            onSave({ hookText, mentionBusiness, zoomPercent });
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
                <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-white font-medium flex items-center justify-center space-x-2">
                    <span>⟲</span>
                    <span>Play from Start</span>
                </button>

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
                            onClick={() => setZoomPercent(100)}
                            className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-lg text-xs font-semibold text-gray-300"
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
