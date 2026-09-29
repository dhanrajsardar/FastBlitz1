'use client';

import React, { useState } from 'react';

interface ApprovalModalProps {
  onSaveToLibrary: () => void;
  onSchedulePost: (platforms: string[], scheduledTime: Date) => void;
  onCancel: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ onSaveToLibrary, onSchedulePost, onCancel }) => {
  const [step, setStep] = useState(1);

  // Step 2 State
  const [platforms, setPlatforms] = useState({
    tiktok: true,
    instagram: true,
    youtube: true
  });

  // Step 3 State
  const defaultTime = new Date(new Date().getTime() + 4 * 60 * 60 * 1000);
  const [scheduledTime, setScheduledTime] = useState(defaultTime);

  const handleNext = () => setStep(prev => prev + 1);

  const handleConfirm = () => {
    const selected = Object.entries(platforms)
      .filter(([_, isSelected]) => isSelected)
      .map(([platform]) => platform.toUpperCase());
    onSchedulePost(selected, scheduledTime);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="h-1 w-full bg-white/10">
          <div
            className="h-full bg-[#FF5722] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">
              {step === 1 && "What would you like to do?"}
              {step === 2 && "Select Platforms"}
              {step === 3 && "Confirm Schedule"}
            </h2>
            <span className="text-gray-400 text-sm font-medium">Step {step} of 3</span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <button
                onClick={onSaveToLibrary}
                className="w-full text-left bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-xl transition flex flex-col group"
              >
                <span className="text-white font-semibold flex items-center space-x-2">
                  <span>💾</span>
                  <span>Save to Library</span>
                </span>
                <span className="text-gray-400 text-sm mt-1 group-hover:text-gray-300">Save this content for later without publishing.</span>
              </button>

              <button
                onClick={handleNext}
                className="w-full text-left bg-[#FF5722]/10 hover:bg-[#FF5722]/20 border border-[#FF5722]/30 p-4 rounded-xl transition flex flex-col group"
              >
                <span className="text-[#FF5722] font-semibold flex items-center space-x-2">
                  <span>📅</span>
                  <span>Schedule Post</span>
                </span>
                <span className="text-[#FF5722]/70 text-sm mt-1 group-hover:text-[#FF5722]/90">Post or schedule to your connected platforms.</span>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10">
                  <input type="checkbox" checked={platforms.tiktok} onChange={(e) => setPlatforms(prev => ({...prev, tiktok: e.target.checked}))} className="accent-[#FF5722] w-5 h-5" />
                  <span className="text-white font-medium">TikTok</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10">
                  <input type="checkbox" checked={platforms.instagram} onChange={(e) => setPlatforms(prev => ({...prev, instagram: e.target.checked}))} className="accent-[#FF5722] w-5 h-5" />
                  <span className="text-white font-medium">Instagram Reels</span>
                </label>
                <label className="flex items-center space-x-3 p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10">
                  <input type="checkbox" checked={platforms.youtube} onChange={(e) => setPlatforms(prev => ({...prev, youtube: e.target.checked}))} className="accent-[#FF5722] w-5 h-5" />
                  <span className="text-white font-medium">YouTube Shorts</span>
                </label>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className="px-4 py-2 text-gray-400 hover:text-white transition">Back</button>
                <button onClick={handleNext} className="bg-[#FF5722] hover:bg-[#EA580C] text-white px-6 py-2 rounded-lg font-bold transition">Next →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-[#FF5722]/10 border border-[#FF5722]/20 p-4 rounded-xl text-center">
                <div className="text-[#FF5722] font-semibold text-sm mb-1">Optimal Viral Window</div>
                <div className="text-white text-lg font-bold">
                  {scheduledTime.toLocaleDateString()} at {scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Or pick a custom time:</label>
                <input
                  type="datetime-local"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF5722]"
                  value={new Date(scheduledTime.getTime() - scheduledTime.getTimezoneOffset() * 60000).toISOString().slice(0,16)}
                  onChange={(e) => setScheduledTime(new Date(e.target.value))}
                />
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="px-4 py-2 text-gray-400 hover:text-white transition">Back</button>
                <button onClick={handleConfirm} className="bg-[#FF5722] hover:bg-[#EA580C] text-white px-6 py-2 rounded-lg font-bold transition">Confirm & Schedule 🚀</button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
