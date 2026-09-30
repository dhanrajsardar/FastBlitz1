import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarCheck, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleHelp, Clock3, ImagePlus, Maximize2, Music2, Pause, Pencil, Play, Plus, RotateCcw, Save, Settings2, Sparkles, Trash2, Type, Volume2, VolumeX, WandSparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import mainImage from "@/assets/content-main.jpg";
import sourceImage from "@/assets/content-source.jpg";
import nextImage from "@/assets/content-next.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "FastBlitz — Your content studio" },
    { name: "description", content: "Review, remix, edit, and schedule your content in FastBlitz." },
    { property: "og:title", content: "FastBlitz — Your content studio" },
    { property: "og:description", content: "Review, remix, edit, and schedule your content in FastBlitz." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Studio,
});

type Post = { id: number; image: string; source: string; caption: string; sourceCaption: string; type: string; topic: string };
const initialPosts: Post[] = [
  { id: 1, image: mainImage, source: sourceImage, caption: "Me trying to remember every little thing I need to do today", sourceCaption: "Me trying to hype myself up for the work week", type: "Green Screen", topic: "Everyday Life Simplified" },
  { id: 2, image: nextImage, source: nextImage, caption: "7 Small Systems That Make Everyday Life Feel Lighter", sourceCaption: "The little things that changed my routine", type: "Image Set", topic: "Lifestyle" },
  { id: 3, image: sourceImage, source: mainImage, caption: "When the little wins start adding up", sourceCaption: "A little reminder to keep going", type: "Green Screen", topic: "Daily Moments" },
];
type SavedPost = Post & { status: "saved" | "scheduled"; scheduledAt?: string | undefined; customCaption?: string };
const STORAGE_KEY = "fastblitz-library-v1";

function HorseLogo() {
  return <svg className="horse-logo" viewBox="0 0 44 44" fill="none" aria-hidden="true"><path d="M11 37h24M15 33c3-6 1-11-2-16l6-2 3-8 8 3 5 11-5 1-2-4-4 4 4 11M18 17l-6 4-4-3 3-7 7-2 4-4M25 23l-5 10M30 22l5 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="26" cy="12" r="1.2" fill="currentColor"/></svg>;
}

function readLibrary(): SavedPost[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as SavedPost[]; } catch { return []; }
}

function Studio() {
  const [posts, setPosts] = useState(initialPosts);
  const [index, setIndex] = useState(0);
  const [view, setView] = useState<"feed" | "library">("feed");
  const [modal, setModal] = useState<"choice" | "schedule" | "upgrade" | "why" | "configure" | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState<SavedPost[]>([]);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(8);
  const [mentionBusiness, setMentionBusiness] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [editorText, setEditorText] = useState("");
  const [editorImage, setEditorImage] = useState<string | null>(null);
  const [textExpanded, setTextExpanded] = useState(true);
  const [dimensionsExpanded, setDimensionsExpanded] = useState(false);
  const [zoom, setZoom] = useState([98]);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleCaption, setScheduleCaption] = useState("");
  const [notice, setNotice] = useState("");
  const post = posts[index % posts.length] ?? initialPosts[0] as Post;

  useEffect(() => { setSaved(readLibrary()); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(timer); }, [notice]);
  function persist(items: SavedPost[]) { setSaved(items); localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
  function savePost(status: "saved" | "scheduled", scheduledAt?: string) {
    persist([{ ...post, status, scheduledAt, customCaption: scheduleCaption || post.caption }, ...saved.filter(item => item.id !== post.id)]);
    setModal(null); setNotice(status === "saved" ? "Saved to your library" : "Added to your schedule");
  }
  function nextPost() { setIndex(i => (i + 1) % posts.length); setEditorImage(null); }
  function openEditor() { setEditorText(post.caption); setEditorImage(null); setSelectedSlide(0); setSlideCount(8); setEditing(true); }
  function finishEditor() {
    setPosts(items => items.map(item => item.id === post.id ? { ...item, caption: editorText || item.caption, image: editorImage || item.image } : item));
    setEditing(false); setNotice("Changes applied to this post");
  }
  function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => setEditorImage(String(reader.result)); reader.readAsDataURL(file);
  }
  const currentImage = editorImage || (selectedSlide % 2 === 0 ? post.image : post.source);

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand" onClick={() => { setView("feed"); setEditing(false); }} role="button" tabIndex={0} onKeyDown={e => { if (e.key === "Enter") setView("feed"); }}><HorseLogo /><span>FastBlitz</span></div>
      <div className="top-actions"><Button variant="ghost" onClick={() => { setView(view === "feed" ? "library" : "feed"); setEditing(false); }}>{view === "feed" ? "Library" : "Discover"}</Button><Button variant="pill" className="upgrade-button" onClick={() => setModal("upgrade")}>Upgrade</Button></div>
    </header>

    {view === "feed" ? <main className="feed">
      <div className="feed-tools"><Button variant="pill" onClick={() => setModal("configure")}><Settings2 /> Configure</Button><Button variant="pill" onClick={() => setNotice("Smart positioning is on for this post")}><WandSparkles /> Smart positioning</Button></div>
      <div className="feed-layout">
        <aside className="remix-panel"><div className="remix-label">Remixed From</div><div className="source-frame"><img src={post.source} alt="Original content used for this remix" /><span className="source-caption">{post.sourceCaption}</span></div></aside>
        <section className="content-column" aria-label="Content to review"><div className="content-tags"><span>{post.type}</span><span className="topic-tag">{post.topic}</span><Button variant="pill" size="sm" onClick={() => setModal("why")}><CircleHelp /> Why This Content?</Button></div>
          <div className="card-stack"><div className="stack-card stack-card-back" /><div className="stack-card stack-card-middle" /><div className="content-card"><img src={post.image} alt="Suggested content preview" width={768} height={1376} /><Button variant="ghost" size="icon" className="mute-button" title={muted ? "Unmute" : "Mute"} onClick={() => setMuted(!muted)}>{muted ? <VolumeX /> : <Volume2 />}</Button><div className="video-caption">{post.caption}</div></div></div>
          <div className="review-actions"><Button variant="action" size="icon" className="round-review reject" title="Skip content" aria-label="Skip content" onClick={nextPost}><X /></Button><Button variant="action" className="edit-review" onClick={openEditor}><Pencil /> Edit</Button><Button variant="action" size="icon" className="round-review accept" title="Save or schedule" aria-label="Save or schedule" onClick={() => setModal("choice")}><Check /></Button></div>
          <p className="feed-count">{index + 1} of {posts.length} ideas</p>
        </section>
      </div>
    </main> : <main className="library-view"><div className="library-heading"><div><span className="eyebrow">YOUR CONTENT</span><h1>Library</h1><p>Everything you've kept, all in one place.</p></div><Button variant="pill" onClick={() => setView("feed")}><ArrowLeft /> Back to ideas</Button></div><div className="library-tabs"><span>All <b>{saved.length}</b></span><span>Scheduled <b>{saved.filter(p => p.status === "scheduled").length}</b></span></div>{saved.length ? <div className="library-grid">{saved.map(item => <article className="library-item" key={item.id}><div className="library-image"><img src={item.image} alt={item.caption} /><span>{item.status === "scheduled" ? "Scheduled" : "Saved"}</span></div><div className="library-item-body"><strong>{item.customCaption || item.caption}</strong><small>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : item.type}</small><Button variant="ghost" size="sm" title="Remove from library" onClick={() => persist(saved.filter(p => p.id !== item.id))}><Trash2 /> Remove</Button></div></article>)}</div> : <div className="empty-library"><Save size={32} /><h2>No saved content yet</h2><p>Ideas you keep will appear here.</p><Button variant="orange" onClick={() => setView("feed")}>Explore ideas</Button></div>}</main>}

    {editing && <div className="editor-overlay"><div className="editor-top"><Button variant="ghost" onClick={() => setEditing(false)}><ArrowLeft /> Back</Button><span>Editing content</span><Button variant="ghost" size="icon" onClick={() => setEditing(false)} aria-label="Close editor"><X /></Button></div><div className="editor-workspace"><aside className="editor-assets"><div className="editor-scroll"><h3>ASSETS</h3><div className="asset-row"><img src={post.source} alt="Source asset" /><div><strong>{post.type === "Image Set" ? "Image Set" : "Meme Video"}</strong><span>{post.type === "Image Set" ? "Generic Lifestyle" : "Green screen"}</span></div><Button variant="pill" size="sm" onClick={() => document.getElementById("asset-upload")?.click()}>Swap</Button></div>{post.type !== "Image Set" && <div className="asset-row"><img src={post.image} alt="Background asset" /><div><strong>Background</strong><span>Background image</span></div><Button variant="pill" size="sm" onClick={() => document.getElementById("asset-upload")?.click()}>Swap</Button></div>}<input id="asset-upload" type="file" accept="image/*" className="sr-only" onChange={uploadImage} />
          <h3>MENTION YOUR BUSINESS?</h3><div className="binary-group"><Button variant={mentionBusiness ? "orange" : "pill"} onClick={() => setMentionBusiness(true)}>Yes</Button><Button variant={!mentionBusiness ? "orange" : "pill"} onClick={() => setMentionBusiness(false)}>No</Button></div><h3>PROMPT</h3><Textarea placeholder="Optional instructions for regeneration..." value={prompt} onChange={e => setPrompt(e.target.value)} className="prompt-input" /><Button variant="quiet" className="regenerate-button" onClick={() => setNotice(prompt ? "Instructions saved for this draft" : "Add instructions to regenerate this draft")}><Sparkles /> Regenerate</Button></div></aside>
          <div className="editor-preview-area"><div className="editor-preview"><img src={currentImage} alt="Current slide preview" /><Button variant="ghost" size="icon" className="play-button" title={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</Button><button className="editable-caption" onClick={() => document.getElementById("caption-input")?.focus()}>{editorText}</button>{post.type === "Image Set" && <><Button variant="ghost" size="icon" className="slide-arrow left" aria-label="Previous slide" onClick={() => setSelectedSlide((selectedSlide + slideCount - 1) % slideCount)}><ChevronLeft /></Button><Button variant="ghost" size="icon" className="slide-arrow right" aria-label="Next slide" onClick={() => setSelectedSlide((selectedSlide + 1) % slideCount)}><ChevronRight /></Button><div className="slide-dots">{Array.from({length: slideCount}, (_, i) => <button key={i} aria-label={`Go to slide ${i + 1}`} className={i === selectedSlide ? "active" : ""} onClick={() => setSelectedSlide(i)} />)}</div></>}</div><Button variant="orange" className="done-button" onClick={finishEditor}><Check /> Done Editing</Button></div>
          <aside className="editor-controls">{post.type === "Image Set" && <><button onClick={() => setDimensionsExpanded(!dimensionsExpanded)}><Maximize2 /> Dimensions {dimensionsExpanded ? <ChevronUp className="end-icon" /> : <ChevronDown className="end-icon" />}</button>{dimensionsExpanded && <div className="control-detail">Vertical · 9:16</div>}<button onClick={() => setTextExpanded(!textExpanded)}><Type /> Text {textExpanded ? <ChevronUp className="end-icon" /> : <ChevronDown className="end-icon" />}</button>{textExpanded && <div className="control-detail"><label><input type="checkbox" /> Apply to all text boxes</label><Input id="caption-input" value={editorText} onChange={e => setEditorText(e.target.value)} aria-label="Edit text" /><p>Select a text box to edit its style.</p></div>}</>}{post.type !== "Image Set" && <><button onClick={() => { setSelectedSlide(0); setPlaying(true); }}><RotateCcw /> Play from Start</button></>}<button onClick={() => document.getElementById("asset-upload")?.click()}><ImagePlus /> Swap Image</button>{post.type === "Image Set" ? <><button onClick={() => document.getElementById("asset-upload")?.click()}><ImagePlus /> My Images</button><button onClick={() => setEditorText(editorText + " New text")}><Type /> Add Text</button></> : <div className="video-settings"><div className="video-title"><Music2 /> Video <ChevronUp className="end-icon" /></div><label>Zoom: {zoom[0]}%</label><Slider value={zoom} onValueChange={setZoom} min={50} max={150} step={1} /><Button variant="quiet" onClick={() => setZoom([98])}><RotateCcw /> Reset Position</Button><span>Drag video to reposition</span></div>}<button onClick={() => setNotice("Overlay added to this draft")}><ImagePlus /> Add Overlay</button>{post.type === "Image Set" && <><button onClick={() => { setSlideCount(n => n + 1); setSelectedSlide(slideCount); }}><Plus /> Add Slide</button><button className="delete-control" onClick={() => { if (slideCount > 1) { setSlideCount(n => n - 1); setSelectedSlide(0); } }}><Trash2 /> Delete Slide</button></>}</aside></div></div>}

    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}><div className={`flow-modal ${modal === "choice" ? "choice-modal" : ""}`} role="dialog" aria-modal="true" aria-label={modal === "choice" ? "What would you like to do?" : modal}><div className="modal-heading"><div><h2>{modal === "choice" ? "What would you like to do?" : modal === "schedule" ? "Schedule Post" : modal === "upgrade" ? "Make more with FastBlitz" : modal === "why" ? "Why this content?" : "Configure your ideas"}</h2>{modal === "choice" && <span>Step 1 of 3</span>}</div><Button variant="ghost" size="icon" aria-label="Close" onClick={() => setModal(null)}><X /></Button></div>{modal === "choice" && <><div className="choice-progress"><span /></div><div className="choice-options"><button onClick={() => savePost("saved")}><span className="choice-icon blue"><Save /></span><span><strong>Save to Library</strong><small>Save this content for later</small></span><ChevronRight className="option-arrow" /></button><button onClick={() => { setScheduleCaption(post.caption); setModal("schedule"); }}><span className="choice-icon green"><CalendarCheck /></span><span><strong>Schedule Post</strong><small>Post or schedule to your platforms</small></span><ChevronRight className="option-arrow" /></button></div><div className="modal-footer"><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button></div></>}{modal === "schedule" && <div className="modal-body"><p className="modal-intro">Set a date and time for this post. It will be saved in your library.</p><label>Caption<Textarea value={scheduleCaption} onChange={e => setScheduleCaption(e.target.value)} /></label><div className="date-row"><label>Date<Input type="date" min={new Date().toISOString().slice(0, 10)} value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} /></label><label>Time<Input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} /></label></div><p className="schedule-note"><Clock3 size={16} /> Posts are saved to your schedule. Connecting a platform is required for automatic publishing.</p><div className="modal-buttons"><Button variant="pill" onClick={() => setModal("choice")}>Back</Button><Button variant="orange" disabled={!scheduleDate || new Date(`${scheduleDate}T${scheduleTime}`).getTime() <= Date.now()} onClick={() => savePost("scheduled", `${scheduleDate}T${scheduleTime}`)}>Add to Schedule</Button></div></div>}{modal === "upgrade" && <div className="modal-body"><p className="modal-intro">More room for every idea, from first draft to final post.</p><div className="upgrade-feature"><Sparkles /> More content ideas and remixes</div><div className="upgrade-feature"><Pencil /> More editing flexibility</div><div className="upgrade-feature"><CalendarCheck /> Plan further ahead</div><p className="schedule-note">Plans and checkout aren't available in this preview yet.</p><Button variant="orange" onClick={() => setModal(null)}>Keep creating</Button></div>}{modal === "why" && <div className="modal-body"><p className="modal-intro">This remix pairs an everyday moment with a fresh setting, while keeping the original idea easy to recognize.</p><Button variant="orange" onClick={() => setModal(null)}>Got it</Button></div>}{modal === "configure" && <div className="modal-body"><p className="modal-intro">Fine-tune what you'd like to see next.</p><label className="setting-check"><input type="checkbox" defaultChecked /> Show green screen ideas</label><label className="setting-check"><input type="checkbox" defaultChecked /> Show image sets</label><Button variant="orange" onClick={() => { setModal(null); setNotice("Preferences updated"); }}>Save preferences</Button></div>}</div></div>}
    {notice && <div className="toast-note" role="status"><Check size={17} /> {notice}</div>}
  </div>;
}