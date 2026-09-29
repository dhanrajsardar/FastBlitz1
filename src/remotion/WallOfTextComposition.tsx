import React from 'react';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { KineticSubtitles } from './KineticSubtitles';

export const WallOfTextComposition: React.FC<{
  brollVideoUrl: string;
  subtitlesJson: string;
  hookText: string;
  bodyText: string;
}> = ({ brollVideoUrl, subtitlesJson, hookText, bodyText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring drop-in animation for the card
  const dropIn = spring({
    frame,
    fps,
    config: { damping: 12, mass: 0.8, stiffness: 150 }
  });

  const translateY = interpolate(dropIn, [0, 1], [-1000, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {/* Background B-Roll */}
      <AbsoluteFill>
        {brollVideoUrl && (
          <Video
            src={brollVideoUrl}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            muted
          />
        )}
      </AbsoluteFill>

      {/* Dark Gradient Overlay */}
      <AbsoluteFill style={{
        background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 100%)'
      }} />

      {/* Center Tweet/Notes Card */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          transform: `translateY(${translateY}px)`
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '32px', fontWeight: 'bold', color: '#000' }}>
            {hookText}
          </h2>
          <p style={{ margin: 0, fontSize: '24px', color: '#444', lineHeight: 1.4 }}>
            {bodyText}
          </p>
        </div>
      </AbsoluteFill>

      {/* Captions */}
      <AbsoluteFill style={{ justifyContent: 'flex-end', paddingBottom: '120px' }}>
        <KineticSubtitles subtitlesJson={subtitlesJson} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
