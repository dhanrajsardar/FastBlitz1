'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const QuickTweakDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  cardData: any;
  onSave: (updates: any) => void;
}> = ({ isOpen, onClose, cardData, onSave }) => {
  const [hookText, setHookText] = useState(cardData?.hookText || '');
  const [voice, setVoice] = useState('Adam');
  const [broll, setBroll] = useState(cardData?.brollVideoUrl || '');

  const brollOptions = [
    { id: '1', url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', label: 'Bunny' },
    { id: '2', url: 'https://www.w3schools.com/html/mov_bbb.mp4', label: 'W3C' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-50 bg-[#1a1c23] border-t border-white/10 rounded-t-3xl p-6 shadow-2xl h-[400px] flex flex-col"
          >
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />

            <div className="space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Hook Text</label>
                <input
                  type="text"
                  value={hookText}
                  onChange={(e) => setHookText(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5722] transition"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">Voice Actor</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5722] transition appearance-none"
                >
                  <option value="Adam">Adam (Deep, Authoritative)</option>
                  <option value="Rachel">Rachel (Energetic, Gen Z)</option>
                  <option value="Antoni">Antoni (Storyteller)</option>
                  <option value="Domi">Domi (Warm, Conversational)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">B-Roll Background</label>
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {brollOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setBroll(option.url)}
                      className={`flex-shrink-0 w-24 h-32 rounded-xl border-2 transition ${
                        broll === option.url ? 'border-[#FF5722]' : 'border-transparent'
                      } overflow-hidden relative`}
                    >
                      <video src={option.url} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onSave({ hookText, voice, brollVideoUrl: broll });
                onClose();
              }}
              className="w-full mt-4 bg-[#FF5722] hover:bg-[#EA580C] text-white py-4 rounded-xl font-bold transition flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(255,87,34,0.3)]"
            >
              <span>Save & Schedule</span>
              <span>⚡</span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
