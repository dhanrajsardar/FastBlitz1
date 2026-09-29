'use client';

import React from 'react';

interface ApprovalModalProps {
  onSaveToLibrary: () => void;
  onSchedulePost: () => void;
  onCancel: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ onSaveToLibrary, onSchedulePost, onCancel }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
      <div className="bg-[#1a1c23] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
        <div className="h-1 w-full bg-white/10">
          <div className="h-full bg-[#FF5722] w-1/3"></div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-white text-xl font-bold">What would you like to do?</h2>
            <span className="text-gray-400 text-sm">Step 1 of 3</span>
          </div>

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
              onClick={onSchedulePost}
              className="w-full text-left bg-[#FF5722]/10 hover:bg-[#FF5722]/20 border border-[#FF5722]/30 p-4 rounded-xl transition flex flex-col group"
            >
              <span className="text-[#FF5722] font-semibold flex items-center space-x-2">
                <span>📅</span>
                <span>Schedule Post</span>
              </span>
              <span className="text-[#FF5722]/70 text-sm mt-1 group-hover:text-[#FF5722]/90">Post or schedule to your connected platforms.</span>
            </button>
          </div>
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
