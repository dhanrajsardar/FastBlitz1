'use client';

import React, { useState, useEffect } from 'react';
import { BlitzCardStack } from '../../components/blitz/BlitzCardStack';
import { QuickTweakDrawer } from '../../components/blitz/QuickTweakDrawer';
import OnboardingModal from '../../components/blitz/OnboardingModal';
import { useInfiniteQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function BlitzPage() {
    return (
        <QueryClientProvider client={queryClient}>
            <ClientPage />
        </QueryClientProvider>
    );
}

function ClientPage() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCardData, setActiveCardData] = useState<any>(null);
  const [queueCount, setQueueCount] = useState(0);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch
  } = useInfiniteQuery({
    queryKey: ['blitzCards'],
    queryFn: async ({ pageParam = '' }) => {
      const res = await fetch(`/api/blitz/feed${pageParam ? `?cursor=${pageParam}` : ''}`);
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: mounted // Prevent query during SSR to avoid QueryClient errors
  });

  const allCards = data?.pages.flatMap(page => page.cards) || [];

  useEffect(() => {
    if (status === 'success' && allCards.length === 0) {
      setNeedsOnboarding(true);
    } else if (status === 'success' && allCards.length > 0 && !activeCardData) {
      setActiveCardData(allCards[0]);
    }

    // Grab the initial scheduled count from the first page
    if (status === 'success' && data?.pages[0]?.scheduledCount !== undefined) {
        setQueueCount(data.pages[0].scheduledCount);
    }
  }, [status, allCards, activeCardData, data]);

  const handleSwipeRight = async (card: any) => {
    try {
        await fetch('/api/blitz/card/swipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: card.id, action: 'SCHEDULE' })
        });
        setQueueCount(prev => prev + 1);
    } catch (e) {
        console.error('Failed to schedule card', e);
    }

    const nextIndex = allCards.findIndex(c => c.id === card.id) + 1;
    if (nextIndex < allCards.length) {
      setActiveCardData(allCards[nextIndex]);
    }

    if (nextIndex >= allCards.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSwipeLeft = async (card: any) => {
    try {
        await fetch('/api/blitz/card/swipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: card.id, action: 'DISMISS' })
        });
    } catch (e) {
        console.error('Failed to dismiss card', e);
    }

    const nextIndex = allCards.findIndex(c => c.id === card.id) + 1;
    if (nextIndex < allCards.length) {
      setActiveCardData(allCards[nextIndex]);
    }

    if (nextIndex >= allCards.length - 2 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleTweakSave = async (updates: any) => {
    if (!activeCardData) return;

    try {
        await fetch('/api/blitz/card/tweak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: activeCardData.id, updates })
        });
    } catch (e) {
        console.error('Failed to save tweaks', e);
    }

    setActiveCardData({ ...activeCardData, ...updates });
  };

  if (!mounted || status === 'pending') {
    return (
      <div className="flex min-h-screen bg-[#0D0F12] items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[#FF5722]/30 border-t-[#FF5722] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0D0F12] font-sans text-white overflow-hidden relative">
      {needsOnboarding && (
        <div className="absolute inset-0 z-50">
          <OnboardingModal onSuccess={() => {
            setNeedsOnboarding(false);
            refetch();
          }} />
        </div>
      )}

      {/* Header Bar */}
      <header className="h-[60px] flex items-center justify-between px-6 border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-[#FF5722] font-bold text-xl">
            <span>⚡</span>
            <span>FASTBLITZ</span>
          </div>

          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-sm font-medium flex items-center space-x-2 cursor-pointer hover:bg-white/10 transition">
            <span>🌐 snugglyboop.com</span>
            <span className="text-gray-400">▾</span>
          </div>

          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="text-emerald-400">●</span>
            <span className="text-xs font-medium">TikTok</span>
            <span className="text-emerald-400">●</span>
            <span className="text-xs font-medium">IG</span>
            <span className="text-emerald-400">●</span>
            <span className="text-xs font-medium">YT</span>
          </div>
        </div>

        <div className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-bold shadow-inner">
          {queueCount} Posts in Queue
        </div>
      </header>

      {/* Center Main Stage */}
      <main className="flex-1 flex flex-col justify-center items-center py-6">
        <BlitzCardStack
          cards={allCards.map(c => c.id === activeCardData?.id ? { ...c, ...activeCardData } : c)}
          onSwipeRight={handleSwipeRight}
          onSwipeLeft={handleSwipeLeft}
          onTweak={() => setDrawerOpen(true)}
        />

        {/* Bottom Action Bar */}
        <div className="mt-8 flex items-center space-x-6">
          <button
            className="flex flex-col items-center group"
            onClick={() => {
               window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
            }}
          >
            <div className="w-14 h-14 rounded-full border-2 border-rose-500 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(244,63,94,0.3)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
            <span className="text-xs text-gray-400 mt-2 font-medium">Skip (←)</span>
          </button>

          <button
            className="flex flex-col items-center group"
            onClick={() => setDrawerOpen(true)}
          >
            <div className="w-12 h-12 rounded-full border-2 border-slate-400 flex items-center justify-center text-slate-400 group-hover:bg-slate-400 group-hover:text-white transition-all shadow-[0_0_10px_rgba(148,163,184,0.3)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <span className="text-xs text-gray-400 mt-2 font-medium">Tweak (↑)</span>
          </button>

          <button
             className="flex flex-col items-center group"
             onClick={() => {
               window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
             }}
          >
            <div className="w-14 h-14 rounded-full border-2 border-[#FF5722] bg-[#FF5722]/20 flex items-center justify-center text-[#FF5722] group-hover:bg-[#FF5722] group-hover:text-white transition-all shadow-[0_0_20px_rgba(255,87,34,0.5)]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-xs text-gray-400 mt-2 font-medium">Schedule (→)</span>
          </button>
        </div>
      </main>

      <footer className="h-[40px] flex items-center justify-center border-t border-white/5 shrink-0 text-xs text-gray-500">
        📅 Next Scheduled: Today 6:30 PM (TikTok, Reels)
      </footer>

      <QuickTweakDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cardData={activeCardData}
        onSave={handleTweakSave}
      />
    </div>
  );
}
