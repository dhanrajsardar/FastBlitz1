import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate, Video } from 'remotion';
import { KineticSubtitles } from './KineticSubtitles';

export const HookDemoComposition: React.FC<{
  hookText: string;
  demoVideoUrl: string;
  subtitlesJson: string;
}> = ({ hookText, demoVideoUrl, subtitlesJson }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Frames 0 to 90 (0-3s): Attention-grabbing hook banner
  const hookPhaseEndFrame = 90;

  // Transition scale for the hook banner zooming in and fading out
  const zoomScale = spring({
    frame: Math.max(0, frame - (hookPhaseEndFrame - 10)), // start zooming slightly before hook phase ends
    fps,
    config: { damping: 14, mass: 1, stiffness: 100 }
  });

  const bannerScale = interpolate(zoomScale, [0, 1], [1, 5]);
  const bannerOpacity = interpolate(zoomScale, [0, 1], [1, 0]);

  // Product Demo dynamic zoom effect (starts slightly zoomed out and slowly zooms in)
  const demoZoom = interpolate(frame, [0, 450], [1, 1.15]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#0D0F12', color: 'white' }}>
      {/* 3-15s: Product UI / Demo Video in background with slow zoom */}
      <AbsoluteFill style={{ transform: `scale(${demoZoom})`, transformOrigin: 'center center' }}>
         {demoVideoUrl ? (
          <Video
             src={demoVideoUrl}
             style={{ width: '100%', height: '100%', objectFit: 'cover' }}
             muted
          />
         ) : (
           <div style={{ width: '100%', height: '100%', backgroundColor: '#1a1c23', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <h1 style={{color: '#444'}}>Product Demo Recording</h1>
           </div>
         )}
      </AbsoluteFill>

      {/* Dark overlay for text readability during demo phase */}
      <AbsoluteFill style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 40%)',
          opacity: frame > hookPhaseEndFrame - 20 ? 1 : 0,
          transition: 'opacity 0.5s ease'
      }} />

      {/* 0-3s: Hook Banner */}
      <AbsoluteFill style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FF5722',
          transform: `scale(${bannerScale})`,
          opacity: bannerOpacity,
          zIndex: 10,
          pointerEvents: 'none' // allow events to pass through if necessary
      }}>
          <h1 style={{
            fontSize: '80px',
            fontWeight: '900',
            textAlign: 'center',
            padding: '0 40px',
            textTransform: 'uppercase',
            lineHeight: 1.1,
            textShadow: '0 10px 20px rgba(0,0,0,0.5)'
          }}>
            {hookText}
          </h1>
      </AbsoluteFill>

      {/* Captions - Only visible after the hook banner phase */}
      {frame > hookPhaseEndFrame - 15 && (
          <AbsoluteFill style={{ justifyContent: 'flex-end', paddingBottom: '120px', zIndex: 20 }}>
            <KineticSubtitles subtitlesJson={subtitlesJson} />
          </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
