import lifestyle from "@/assets/content-lifestyle.jpg";
import lake from "@/assets/content-lake.jpg";
import greenscreen from "@/assets/content-greenscreen.jpg";
import car from "@/assets/content-car.jpg";

export type ContentFormat = "Slideshow" | "Green screen" | "Wall of text" | "Talking head";

export type BlitzItem = {
  id: string;
  format: ContentFormat;
  image: string;
  hook: string;
  caption: string;
  angle: string;
  tags: string[];
  why: string;
  remixedFrom: {
    creator: string;
    platform: "TikTok" | "Instagram" | "YouTube";
    views: string;
    note: string;
  };
  script: string[];
};

export const blitzItems: BlitzItem[] = [
  {
    id: "b1",
    format: "Slideshow",
    image: lifestyle,
    hook: "I stopped writing content at 11pm. Here's what replaced it.",
    caption:
      "Founders don't have a content problem, they have a context problem. Three slides on how we fixed ours →",
    angle: "Founder story",
    tags: ["Founder story", "Slideshow", "Soft sell"],
    why: "Your brand voice is calm and practical, and founder-story slideshows are the highest-saving format for B2B SaaS accounts under 10k followers.",
    remixedFrom: {
      creator: "@quietbuildco",
      platform: "Instagram",
      views: "412K",
      note: "Same 3-slide structure: confession → mechanism → proof.",
    },
    script: [
      "Slide 1 — Confession: 11pm, caption half-written, nothing posted.",
      "Slide 2 — Mechanism: one brand brief, then the system drafts.",
      "Slide 3 — Proof: 18 posts a month, zero late nights.",
    ],
  },
  {
    id: "b2",
    format: "Green screen",
    image: greenscreen,
    hook: "Your competitor isn't better. They just post 5x more.",
    caption:
      "Consistency beats brilliance for the first 90 days. Here's the posting floor we give every founder.",
    angle: "Hot take",
    tags: ["Hot take", "Green screen", "Retention hook"],
    why: "Hot takes matched your selected goal of building awareness, and green-screen commentary keeps watch time high without new filming.",
    remixedFrom: {
      creator: "@marcusonmarketing",
      platform: "TikTok",
      views: "1.2M",
      note: "Opens on a comparison claim in the first 1.5 seconds.",
    },
    script: [
      "0-2s — Claim: they're not better, they're louder.",
      "2-9s — Evidence: posting cadence comparison on screen.",
      "9-18s — Takeaway: your floor is 4 posts a week.",
    ],
  },
  {
    id: "b3",
    format: "Wall of text",
    image: lake,
    hook: "Things nobody tells you about your first 100 customers.",
    caption: "Seven lines. Read the fifth one twice.",
    angle: "Lessons list",
    tags: ["Lessons list", "Wall of text", "Save bait"],
    why: "Wall-of-text over a calm background plate is your cheapest save-generating format, and you picked revenue as a goal.",
    remixedFrom: {
      creator: "@sundaysignal",
      platform: "Instagram",
      views: "268K",
      note: "Text block centred over a still landscape, no motion.",
    },
    script: [
      "Line 1 — They arrive one at a time, not in waves.",
      "Line 4 — Pricing objections are usually clarity objections.",
      "Line 7 — The channel you hate is usually the one that works.",
    ],
  },
  {
    id: "b4",
    format: "Talking head",
    image: car,
    hook: "The 30-second brand brief that fixed all my content.",
    caption: "If your content sounds generic, your brief is generic. Fix the brief.",
    angle: "How-to",
    tags: ["How-to", "Talking head", "Direct sell"],
    why: "How-to talking heads convert best late in the week for your audience, and this angle ties straight back to your onboarding answers.",
    remixedFrom: {
      creator: "@buildwithdev",
      platform: "TikTok",
      views: "740K",
      note: "Single unbroken take, captions burned in, ends on a question.",
    },
    script: [
      "0-3s — Promise: 30 seconds, one brief.",
      "3-20s — Walkthrough: audience, angle, proof, ask.",
      "20-30s — Close: ask them what their angle is.",
    ],
  },
];

export const editorAssets = [
  { id: "a1", label: "Brand kit", detail: "Logo, colours, fonts" },
  { id: "a2", label: "Product shots", detail: "12 images" },
  { id: "a3", label: "B-roll library", detail: "34 clips" },
  { id: "a4", label: "Testimonials", detail: "6 quotes" },
];

export const influencerSeeds = [
  { handle: "@quietbuildco", niche: "Founder vlogs", followers: "182K" },
  { handle: "@marcusonmarketing", niche: "Marketing takes", followers: "540K" },
  { handle: "@sundaysignal", niche: "Essay carousels", followers: "96K" },
  { handle: "@buildwithdev", niche: "SaaS how-tos", followers: "311K" },
];

export const voiceAngles = [
  "Founder story",
  "Hot take",
  "Lessons list",
  "How-to",
  "Behind the scenes",
  "Customer proof",
];

export const visualSources = [
  "AI generated scenes",
  "Stock b-roll",
  "My uploads",
  "Green screen commentary",
  "Text over plate",
];

export const captionStyles = ["Punchy", "Conversational", "Editorial", "Minimal"];

export const plans = [
  {
    name: "Starter",
    monthly: 29,
    yearly: 279,
    blurb: "For founders posting their first consistent month.",
    features: ["30 Blitz drafts / month", "1 brand profile", "Slideshow + wall of text", "Email support"],
    cta: "Choose Starter",
  },
  {
    name: "Growth",
    monthly: 79,
    yearly: 759,
    blurb: "For teams that need a full content calendar every week.",
    features: [
      "150 Blitz drafts / month",
      "3 brand profiles",
      "All formats incl. green screen",
      "Influencer remix sources",
      "Priority support",
    ],
    cta: "Choose Growth",
    featured: true,
  },
  {
    name: "Studio",
    monthly: 199,
    yearly: 1899,
    blurb: "For agencies running content for multiple clients.",
    features: [
      "Unlimited Blitz drafts",
      "10 brand profiles",
      "Client approval links",
      "Custom voice training",
      "Dedicated onboarding",
    ],
    cta: "Talk to us",
  },
];
