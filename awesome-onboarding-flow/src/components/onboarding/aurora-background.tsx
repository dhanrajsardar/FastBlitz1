/**
 * Slow-drifting aurora glow + film grain. Pure CSS transforms (GPU friendly),
 * no WebGL. Respects prefers-reduced-motion via the global media query.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden grain">
      <div className="absolute inset-0 bg-background" />

      <div
        className="animate-aurora absolute -left-[20%] top-[-30%] h-[80vmax] w-[80vmax] rounded-full opacity-45 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.55 0.2 258 / 0.85), transparent 65%)",
        }}
      />
      <div
        className="animate-aurora absolute -right-[25%] top-[10%] h-[70vmax] w-[70vmax] rounded-full opacity-35 blur-[130px]"
        style={{
          animationDelay: "-9s",
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.5 0.22 292 / 0.8), transparent 65%)",
        }}
      />
      <div
        className="animate-aurora absolute bottom-[-35%] left-[25%] h-[60vmax] w-[60vmax] rounded-full opacity-25 blur-[140px]"
        style={{
          animationDelay: "-17s",
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.62 0.16 62 / 0.55), transparent 62%)",
        }}
      />

      {/* vignette keeps the centre readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 30%, oklch(0.12 0.02 264 / 0.75) 100%)",
        }}
      />
    </div>
  );
}
