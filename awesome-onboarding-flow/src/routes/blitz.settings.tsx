import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";

import { AppShell, SectionHeading } from "@/components/app/app-shell";
import { Chip } from "@/components/onboarding/ui";
import { captionStyles, influencerSeeds, visualSources, voiceAngles } from "@/lib/demo-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/blitz/settings")({
  head: () => ({
    meta: [
      { title: "Blitz settings — FastBlitz" },
      {
        name: "description",
        content:
          "Tune the creators you remix, your voice and angles, visual sources and content mix.",
      },
      { property: "og:title", content: "Blitz settings — FastBlitz" },
      {
        property: "og:description",
        content: "Control how FastBlitz writes, films and paces your content.",
      },
    ],
  }),
  component: SettingsPage,
});

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="panel rounded-2xl p-5"
    >
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      <div className="mt-4">{children}</div>
    </motion.section>
  );
}

function SettingsPage() {
  const [followed, setFollowed] = useState<string[]>(["@quietbuildco", "@sundaysignal"]);
  const [angles, setAngles] = useState<string[]>(["Founder story", "Hot take", "How-to"]);
  const [sources, setSources] = useState<string[]>(["AI generated scenes", "Text over plate"]);
  const [caption, setCaption] = useState("Conversational");
  const [mix, setMix] = useState({ educate: 50, story: 30, promote: 20 });
  const [cadence, setCadence] = useState(4);
  const [saved, setSaved] = useState(false);

  const toggle = (list: string[], value: string, set: (v: string[]) => void) =>
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const setMixValue = (key: keyof typeof mix, value: number) => {
    setMix((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  return (
    <AppShell>
      <SectionHeading
        eyebrow="Blitz settings"
        title="How your content gets made"
        subtitle="Everything here feeds tomorrow's batch. Changes apply to the next Blitz."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <Card title="Creators to remix" hint="We study their structure, never their words.">
          <div className="space-y-2">
            {influencerSeeds.map((inf) => {
              const on = followed.includes(inf.handle);
              return (
                <button
                  key={inf.handle}
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => {
                    toggle(followed, inf.handle, setFollowed);
                    setSaved(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-200",
                    on
                      ? "border-primary/60 bg-primary/12"
                      : "border-border bg-secondary/30 hover:bg-secondary/55",
                  )}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full accent-gradient text-xs font-semibold text-white">
                    {inf.handle.slice(1, 3).toUpperCase()}
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">{inf.handle}</span>
                    <span className="block text-[0.72rem] text-muted-foreground">
                      {inf.niche} · {inf.followers}
                    </span>
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {on ? "Following" : "Add"}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Voice & angles" hint="Pick the angles that sound like you.">
          <div className="flex flex-wrap gap-2">
            {voiceAngles.map((angle) => (
              <Chip
                key={angle}
                multi
                selected={angles.includes(angle)}
                onSelect={() => {
                  toggle(angles, angle, setAngles);
                  setSaved(false);
                }}
              >
                {angle}
              </Chip>
            ))}
          </div>
        </Card>

        <Card title="Visual sources" hint="Where the footage and imagery comes from.">
          <div className="flex flex-wrap gap-2">
            {visualSources.map((source) => (
              <Chip
                key={source}
                multi
                selected={sources.includes(source)}
                onSelect={() => {
                  toggle(sources, source, setSources);
                  setSaved(false);
                }}
              >
                {source}
              </Chip>
            ))}
          </div>
        </Card>

        <Card title="Caption style" hint="How captions are written under every post.">
          <div className="flex flex-wrap gap-2">
            {captionStyles.map((style) => (
              <Chip
                key={style}
                selected={caption === style}
                onSelect={() => {
                  setCaption(style);
                  setSaved(false);
                }}
              >
                {style}
              </Chip>
            ))}
          </div>
        </Card>

        <Card title="Content mix" hint="Roughly how each batch is split.">
          <div className="space-y-5">
            {(
              [
                ["educate", "Educate"],
                ["story", "Story"],
                ["promote", "Promote"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="text-foreground">{mix[key]}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={mix[key]}
                  aria-label={label}
                  onChange={(e) => setMixValue(key, Number(e.target.value))}
                  className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-[oklch(0.66_0.19_258)]"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Posting cadence" hint="Drafts delivered per week.">
          <div className="flex flex-wrap gap-2">
            {[3, 4, 5, 7].map((n) => (
              <Chip
                key={n}
                selected={cadence === n}
                onSelect={() => {
                  setCadence(n);
                  setSaved(false);
                }}
              >
                {n} per week
              </Chip>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          onClick={() => setSaved(true)}
          className="rounded-xl accent-gradient px-5 py-2.5 text-sm font-medium text-white shadow-[var(--shadow-glow)] transition-transform duration-200 hover:-translate-y-0.5"
        >
          Save settings
        </button>
        {saved ? (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-muted-foreground"
          >
            Saved for this demo session — refresh resets everything.
          </motion.span>
        ) : null}
      </div>
    </AppShell>
  );
}
