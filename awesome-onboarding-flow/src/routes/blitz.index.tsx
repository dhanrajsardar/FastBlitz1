import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell, SectionHeading } from "@/components/app/app-shell";
import { BlitzEditor } from "@/components/blitz/editor";
import { BlitzFeed } from "@/components/blitz/feed";
import type { BlitzItem } from "@/lib/demo-content";

export const Route = createFileRoute("/blitz/")({
  head: () => ({
    meta: [
      { title: "Today's Blitz — FastBlitz" },
      {
        name: "description",
        content:
          "Review today's AI-generated content drafts, approve what fits your brand and edit the rest.",
      },
      { property: "og:title", content: "Today's Blitz — FastBlitz" },
      {
        property: "og:description",
        content: "Swipe through ready-to-post drafts built from your brand brief.",
      },
    ],
  }),
  component: BlitzPage,
});

function BlitzPage() {
  const [editing, setEditing] = useState<BlitzItem | null>(null);

  return (
    <AppShell>
      {editing ? (
        <>
          <SectionHeading
            eyebrow="Editor"
            title={editing.angle}
            subtitle="Adjust the draft with your assets and a short instruction."
          />
          <div className="mt-8">
            <BlitzEditor item={editing} onBack={() => setEditing(null)} />
          </div>
        </>
      ) : (
        <>
          <SectionHeading
            eyebrow="Today's Blitz"
            title="4 drafts ready for review"
            subtitle="Built from your brand brief and the creators you follow. Approve, edit or skip."
          />
          <div className="mt-8">
            <BlitzFeed onEdit={setEditing} />
          </div>
        </>
      )}
    </AppShell>
  );
}
