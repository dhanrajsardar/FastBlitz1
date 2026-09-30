import { AnimatePresence, motion, useMotionValue, useTransform } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import { ContentCard } from "@/components/blitz/content-card";
import { blitzItems, type BlitzItem } from "@/lib/demo-content";
import { cn } from "@/lib/utils";

export type Decision = { id: string; verdict: "approved" | "skipped" };

const SWIPE = 110;

export function BlitzFeed({ onEdit }: { onEdit: (item: BlitzItem) => void }) {
  const [index, setIndex] = useState(0);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [why, setWhy] = useState(false);
  const item = blitzItems[index];

  const decide = useCallback(
    (verdict: Decision["verdict"]) => {
      setDecisions((prev) => {
        const current = blitzItems[prev.length];
        return current ? [...prev, { id: current.id, verdict }] : prev;
      });
      setWhy(false);
      setIndex((i) => i + 1);
    },
    [],
  );

  const undo = useCallback(() => {
    if (index === 0) return;
    setDecisions((prev) => prev.slice(0, -1));
    setIndex((i) => i - 1);
    setWhy(false);
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "ArrowRight") decide("approved");
      if (e.key === "ArrowLeft") decide("skipped");
      if (e.key.toLowerCase() === "u") undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, undo]);

  const approved = decisions.filter((d) => d.verdict === "approved").length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div>
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {Math.min(index + 1, blitzItems.length)} of {blitzItems.length} drafts
          </span>
          <span>{approved} approved</span>
        </div>

        <div className="relative aspect-[9/16] w-full">
          <AnimatePresence initial={false}>
            {item ? (
              <SwipeCard key={item.id} item={item} onDecide={decide} />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="panel absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[1.6rem] p-8 text-center"
              >
                <p className="font-display text-xl font-semibold text-foreground">
                  Queue cleared
                </p>
                <p className="text-sm text-muted-foreground">
                  {approved} drafts approved and scheduled. The next Blitz batch lands tomorrow
                  at 7am.
                </p>
                <button
                  onClick={() => {
                    setIndex(0);
                    setDecisions([]);
                  }}
                  className="mt-2 rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-sm text-foreground transition-colors hover:bg-secondary"
                >
                  Replay the batch
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <ActionButton label="Skip" onClick={() => decide("skipped")} disabled={!item} tone="ghost">
            ✕
          </ActionButton>
          <ActionButton
            label="Edit"
            onClick={() => item && onEdit(item)}
            disabled={!item}
            tone="ghost"
          >
            ✎
          </ActionButton>
          <ActionButton
            label="Approve"
            onClick={() => decide("approved")}
            disabled={!item}
            tone="accent"
          >
            ✓
          </ActionButton>
        </div>
        <p className="mt-3 text-center text-[0.72rem] text-muted-foreground">
          Drag the card, or use ← → to decide. Press U to undo.
        </p>
        <div className="mt-2 flex justify-center">
          <button
            onClick={undo}
            disabled={index === 0}
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
          >
            Undo last decision
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {item ? (
          <>
            <div className="panel rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    Angle
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold text-foreground">
                    {item.angle}
                  </p>
                </div>
                <button
                  onClick={() => setWhy((v) => !v)}
                  aria-expanded={why}
                  className="rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Why this content?
                </button>
              </div>
              <AnimatePresence initial={false}>
                {why ? (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-3 block rounded-xl border border-primary/25 bg-primary/10 p-3.5 text-foreground/85">
                      {item.why}
                    </span>
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>

            <div className="panel rounded-2xl p-5">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Remixed from
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium text-foreground">{item.remixedFrom.creator}</span>
                <span className="text-muted-foreground">· {item.remixedFrom.platform}</span>
                <span className="rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">
                  {item.remixedFrom.views} views
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.remixedFrom.note}</p>
            </div>

            <div className="panel rounded-2xl p-5">
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                Script beats
              </p>
              <ol className="mt-3 space-y-2.5">
                {item.script.map((line, i) => (
                  <li key={line} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border bg-secondary/50 text-[0.7rem] text-foreground">
                      {i + 1}
                    </span>
                    {line}
                  </li>
                ))}
              </ol>
            </div>
          </>
        ) : (
          <div className="panel rounded-2xl p-5 text-sm text-muted-foreground">
            Nothing left to review. Approved drafts move to your calendar.
          </div>
        )}

        {decisions.length ? (
          <div className="panel rounded-2xl p-5">
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              This session
            </p>
            <ul className="mt-3 space-y-2">
              {decisions.map((d) => {
                const target = blitzItems.find((b) => b.id === d.id)!;
                return (
                  <li key={d.id} className="flex items-center gap-2.5 text-sm">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        d.verdict === "approved" ? "bg-primary" : "bg-muted-foreground/50",
                      )}
                    />
                    <span className="text-muted-foreground">{target.angle}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {d.verdict === "approved" ? "Approved" : "Skipped"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SwipeCard({
  item,
  onDecide,
}: {
  item: BlitzItem;
  onDecide: (verdict: Decision["verdict"]) => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-9, 9]);
  const approveOpacity = useTransform(x, [30, 140], [0, 1]);
  const skipOpacity = useTransform(x, [-140, -30], [1, 0]);

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      onDragEnd={(_, info) => {
        if (info.offset.x > SWIPE) onDecide("approved");
        else if (info.offset.x < -SWIPE) onDecide("skipped");
      }}
    >
      <ContentCard item={item} />
      <motion.span
        style={{ opacity: approveOpacity }}
        className="pointer-events-none absolute top-6 right-6 rounded-lg border border-primary/60 bg-primary/25 px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur"
      >
        Approve
      </motion.span>
      <motion.span
        style={{ opacity: skipOpacity }}
        className="pointer-events-none absolute top-6 left-6 rounded-lg border border-white/30 bg-black/45 px-3 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur"
      >
        Skip
      </motion.span>
    </motion.div>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone: "ghost" | "accent";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full text-base transition-all duration-200 disabled:opacity-40",
        tone === "accent"
          ? "accent-gradient text-white shadow-[var(--shadow-glow)] hover:-translate-y-0.5"
          : "border border-border bg-secondary/40 text-muted-foreground hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
