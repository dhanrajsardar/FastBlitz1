import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, Img, interpolate } from 'remotion';

export const SlideshowComposition: React.FC<{
  images: string[];
  hookText: string;
}> = ({ images, hookText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slide duration is e.g. 3 seconds each
  const slideDurationFrames = 3 * fps;
  const currentSlideIndex = Math.floor(frame / slideDurationFrames) % (images?.length || 1);

  // Safe fallback if empty array
  const safeImages = images && images.length > 0 ? images : ['https://media.aftermark.ai/usefastlane/broll/cozy_desk_lamp.jpg'];

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill>
        <Img
          src={safeImages[currentSlideIndex]}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </AbsoluteFill>

      {/* Slide Navigation Chevrons Overlay */}
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'space-between', flexDirection: 'row', padding: '0 40px' }}>
         <div style={{ alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>{'<'}</div>
         <div style={{ flex: 1 }} />
         <div style={{ alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '40px' }}>{'>'}</div>
      </AbsoluteFill>

      {/* Pagination Dots */}
      <div style={{ position: 'absolute', bottom: '30%', left: '0', width: '100%', display: 'flex', justifyContent: 'center', gap: '16px' }}>
         {safeImages.map((_, idx) => (
            <div
               key={idx}
               style={{
                 width: '20px', height: '20px', borderRadius: '50%',
                 backgroundColor: idx === currentSlideIndex ? '#FF5722' : 'rgba(255,255,255,0.5)'
               }}
            />
         ))}
      </div>

      {/* Speech Bubble Punchline */}
      <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          right: '10%',
          backgroundColor: '#fff',
          borderRadius: '40px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
      }}>
         <h1 style={{ margin: 0, fontSize: '50px', fontWeight: 'bold', color: '#000', textAlign: 'center' }}>
            {hookText}
         </h1>
      </div>
    </AbsoluteFill>
  );
};
