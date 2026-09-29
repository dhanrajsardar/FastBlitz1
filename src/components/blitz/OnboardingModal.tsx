'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingModal({ onSuccess }: { onSuccess: () => void }) {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState(0); // 0 = input, 1 = scraping, 2 = hooks, 3 = synthesising
  const router = useRouter();

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStep(1);
    await new Promise(r => setTimeout(r, 2000));
    setStep(2);
    await new Promise(r => setTimeout(r, 2000));
    setStep(3);
    await new Promise(r => setTimeout(r, 2000));

    onSuccess();
  };

  if (step === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xl z-50">
        <div className="bg-[#1a1c23] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Where should we send your traffic?</h2>
            <p className="text-gray-400 text-sm">Paste your website URL or App Store link. Fastlane will build your 30-day viral content engine in 10 seconds.</p>
          </div>

          <form onSubmit={handleLaunch} className="space-y-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] transition"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#FF5722] hover:bg-[#EA580C] text-white py-3 px-4 rounded-xl font-bold transition flex items-center justify-center space-x-2"
            >
              <span>Launch Blitz</span>
              <span>⚡</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xl z-50">
      <div className="bg-[#1a1c23] border border-white/10 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#FF5722]/30 border-t-[#FF5722] animate-spin mb-6"></div>

        <div className="space-y-4 w-full">
          <div className={`transition-opacity duration-500 ${step >= 1 ? 'opacity-100 text-white' : 'opacity-30 text-gray-500'}`}>
            <span className="font-mono mr-3 text-[#FF5722]">[1/3]</span>
            Scraping landing page copy & extracting UVPs...
          </div>
          <div className={`transition-opacity duration-500 ${step >= 2 ? 'opacity-100 text-white' : 'opacity-30 text-gray-500'}`}>
            <span className="font-mono mr-3 text-[#FF5722]">[2/3]</span>
            Mapping 25,000+ viral short-form hooks...
          </div>
          <div className={`transition-opacity duration-500 ${step >= 3 ? 'opacity-100 text-white' : 'opacity-30 text-gray-500'}`}>
            <span className="font-mono mr-3 text-[#FF5722]">[3/3]</span>
            Synthesizing initial 10 video candidates...
          </div>
        </div>
      </div>
    </div>
  );
}
