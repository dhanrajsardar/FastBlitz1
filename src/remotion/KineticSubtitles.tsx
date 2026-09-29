import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';

export const KineticSubtitles: React.FC<{ subtitlesJson: string }> = ({ subtitlesJson }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  let subtitles = [];
  try {
    subtitles = JSON.parse(subtitlesJson);
  } catch (e) {
    // fallback
    subtitles = [{ word: 'Error', start: 0, end: 1 }];
  }

  // Find the active word based on frame and start/end times
  const currentTime = frame / fps;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: '8px',
      padding: '20px',
      fontSize: '48px',
      fontWeight: 'bold',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      textTransform: 'uppercase',
      textAlign: 'center'
    }}>
      {subtitles.map((sub: any, index: number) => {
        const isActive = currentTime >= sub.start && currentTime <= sub.end;
        const hasPassed = currentTime > sub.end;

        // Calculate spring animation for active word
        const scale = isActive
          ? spring({
              frame: frame - Math.floor(sub.start * fps),
              fps,
              config: { damping: 10, mass: 0.5, stiffness: 200 }
            })
          : 1;

        const activeScale = interpolate(scale, [0, 1], [1, 1.15]);

        return (
          <span
            key={index}
            style={{
              color: isActive ? '#FFD600' : hasPassed ? '#ffffff' : 'rgba(255,255,255,0.6)',
              transform: isActive ? `scale(${activeScale})` : 'scale(1)',
              textShadow: isActive ? '0px 4px 12px rgba(255, 87, 34, 0.6)' : '0px 2px 4px rgba(0,0,0,0.8)',
              display: 'inline-block',
              transition: 'color 0.1s ease-in-out'
            }}
          >
            {sub.word}
          </span>
        );
      })}
    </div>
  );
};
