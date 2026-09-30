import { motion } from "motion/react";
import { useState } from "react";

import { ContentCard } from "@/components/blitz/content-card";
import { editorAssets, type BlitzItem } from "@/lib/demo-content";
import { cn } from "@/lib/utils";

const tools = [
  { id: "hook", label: "Rewrite hook", detail: "3 alternates" },
  { id: "caption", label: "Rewrite caption", detail: "Match my voice" },
  { id: "format", label: "Change format", detail: "Slideshow → talking head" },
  { id: "visual", label: "Swap visual", detail: "From b-roll library" },
  { id: "cta", label: "Add call to action", detail: "Soft or direct" },
];

export function BlitzEditor({ item, onBack }: { item: BlitzItem; onBack: () => void }) {
  const [prompt, setPrompt] = useState("");
  const [mentionBusiness, setMentionBusiness] = useState(true);
  const [assets, setAssets] = useState<string[]>(["a1"]);
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const run = (instruction: string) => {
    if (!instruction.trim() || busy) return;
    setBusy(true);
    setTimeout(() => {
      setLog((prev) => [
        `${instruction.trim()}${mentionBusiness ? " · mentions Unizixe" : " · no brand mention"}`,
        ...prev,
      ]);
      setPrompt("");
      setBusy(false);
    }, 900);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-8 lg:grid-cols-[minmax(0,220px)_minmax(0,320px)_minmax(0,1fr)]"
    >
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to Blitz
        </button>
        <div className="panel rounded-2xl p-4">
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Assets
          </p>
          <div className="mt-3 space-y-2">
            {editorAssets.map((asset) => {
              const on = assets.includes(asset.id);
              return (
                <button
                  key={asset.id}
                  role="checkbox"
                  aria-checked={on}
                  onClick={() =>
                    setAssets((prev) =>
                      prev.includes(asset.id)
                        ? prev.filter((a) => a !== asset.id)
                        : [...prev, asset.id],
                    )
                  }
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left transition-all duration-200",
                    on
                      ? "border-primary/60 bg-primary/12 text-foreground"
                      : "border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/55 hover:text-foreground",
                  )}
                >
                  <span className="block text-sm font-medium">{asset.label}</span>
                  <span className="block text-[0.72rem] text-muted-foreground">
                    {asset.detail}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <ContentCard item={item} />
      </div>

      <div className="space-y-4">
        <div className="panel rounded-2xl p-5">
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Tell FastBlitz what to change
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) run(prompt);
            }}
            rows={3}
            placeholder="Make the hook sharper and end on a question…"
            className="mt-3 w-full resize-none rounded-xl border border-border bg-secondary/25 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/25 focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              role="switch"
              aria-checked={mentionBusiness}
              onClick={() => setMentionBusiness((v) => !v)}
              className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span
                className={cn(
                  "relative h-5 w-9 rounded-full border transition-colors duration-200",
                  mentionBusiness ? "border-primary/60 bg-primary/40" : "border-border bg-secondary",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-foreground transition-transform duration-200",
                    mentionBusiness ? "translate-x-[1.15rem]" : "translate-x-0.5",
                  )}
                />
              </span>
              Mention my business
            </button>
            <button
              onClick={() => run(prompt)}
              disabled={!prompt.trim() || busy}
              className="ml-auto rounded-lg accent-gradient px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-glow)] transition-transform duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-45"
            >
              {busy ? "Regenerating…" : "Regenerate"}
            </button>
          </div>
        </div>

        <div className="panel rounded-2xl p-5">
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Quick tools
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => run(tool.label)}
                className="rounded-xl border border-border bg-secondary/30 px-3.5 py-3 text-left transition-colors hover:bg-secondary/55"
              >
                <span className="block text-sm font-medium text-foreground">{tool.label}</span>
                <span className="block text-[0.72rem] text-muted-foreground">{tool.detail}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="panel rounded-2xl p-5">
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            Revision history
          </p>
          {log.length ? (
            <ul className="mt-3 space-y-2">
              {log.map((entry, i) => (
                <motion.li
                  key={`${entry}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="rounded-lg border border-border bg-secondary/25 px-3 py-2 text-sm text-muted-foreground"
                >
                  {entry}
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              No edits yet. Every regeneration is listed here so you can compare versions.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
