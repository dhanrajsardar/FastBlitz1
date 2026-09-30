import type { BlitzItem } from "@/lib/demo-content";

export function ContentCard({ item }: { item: BlitzItem }) {
  return (
    <div className="relative overflow-hidden rounded-[1.6rem] border border-border bg-card shadow-[0_30px_80px_-40px_oklch(0_0_0/0.8)]">
      <div className="relative aspect-[9/16] w-full overflow-hidden">
        <img
          src={item.image}
          alt={item.hook}
          width={720}
          height={1280}
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0 0 0 / 0.45) 0%, transparent 32%, transparent 52%, oklch(0 0 0 / 0.82) 100%)",
          }}
        />
        <span className="absolute top-4 left-4 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[0.7rem] font-medium tracking-wide text-white backdrop-blur">
          {item.format}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="font-display text-[1.35rem] leading-snug font-semibold text-white">
            {item.hook}
          </p>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-white/75">{item.caption}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 border-t border-border/70 bg-secondary/25 px-4 py-3">
        {item.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-border bg-secondary/50 px-2 py-1 text-[0.7rem] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
