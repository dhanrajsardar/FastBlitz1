import { motion } from "motion/react";
import { useRef, useState } from "react";
import {
  Building2,
  CheckCircle2,
  FileText,
  Globe,
  ImageUp,
  Loader2,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import {
  MIN_DESCRIPTION,
  isValidUrl,
  useOnboarding,
} from "@/components/onboarding/onboarding-context";
import {
  Callout,
  ChipGroup,
  Item,
  Label,
  Stagger,
  StepHeading,
  TextArea,
  TextInput,
} from "@/components/onboarding/ui";
import { cn } from "@/lib/utils";

const DESCRIPTION_TEMPLATE = `Product/service:
Audience:
Problem solved:
Key benefits:
Tone/positioning:
Things to avoid:`;

/* ---------------------------------- Step 1 --------------------------------- */

export function StepWelcome() {
  const { state, set } = useOnboarding();
  const { data } = state;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  function handleFile(file?: File | null) {
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setLogoError("PNG, JPG, WebP or GIF only");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Keep it under 5MB");
      return;
    }
    setLogoError(null);
    const reader = new FileReader();
    reader.onload = () =>
      set({ logoDataUrl: String(reader.result), logoFileName: file.name });
    reader.readAsDataURL(file);
  }

  return (
    <Stagger className="space-y-5">
      <StepHeading
        title="Welcome to FastBlitz"
        subtitle="Everything you enter here is used directly across the platform."
      />

      <Item>
        <div className="grid gap-5 sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)]">
          <div>
            <Label>Company logo</Label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "flex h-[168px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-center transition-all duration-300",
                dragging
                  ? "border-primary/70 bg-primary/10"
                  : "border-border-strong bg-secondary/25 hover:border-primary/50 hover:bg-secondary/45",
              )}
            >
              {data.logoDataUrl ? (
                <>
                  <img
                    src={data.logoDataUrl}
                    alt="Your company logo"
                    className="max-h-[104px] max-w-full rounded-lg object-contain"
                  />
                  <span className="max-w-full truncate text-xs text-muted-foreground">
                    {data.logoFileName}
                  </span>
                </>
              ) : (
                <>
                  <ImageUp className="size-6 text-primary" strokeWidth={1.6} />
                  <span className="text-sm font-medium text-foreground">Upload</span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, WebP or GIF · 5MB
                  </span>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {logoError ? (
              <p className="mt-2 text-xs text-destructive">{logoError}</p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground/70">Optional</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label>Your name</Label>
              <TextInput
                autoFocus
                value={data.name}
                placeholder="Jane Mehta"
                onChange={(e) => set({ name: e.target.value })}
              />
            </div>
            <div>
              <Label>Company name</Label>
              <TextInput
                value={data.companyName}
                placeholder="Enter your company name"
                onChange={(e) => set({ companyName: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Item>

      <Item>
        <Callout>
          Have multiple businesses? You can add more workspaces later in{" "}
          <span className="text-foreground">Settings → Workspaces</span>.
        </Callout>
      </Item>
    </Stagger>
  );
}

/* --------------------------------- Step 2 ---------------------------------- */

const DEMO_SUMMARY = `Product/service: AI-assisted short-form content engine for founder-led brands
Audience: Solo founders and small marketing teams shipping daily social content
Problem solved: Ideas dry up and editing eats the week
Key benefits: Daily on-brand hooks, one-tap approve, direct posting
Tone/positioning: Fast, confident, zero fluff
Things to avoid: Corporate jargon, hype claims, emoji spam`;

export function StepWebsite() {
  const { state, set } = useOnboarding();
  const { data } = state;
  const [analysing, setAnalysing] = useState(false);
  const valid = isValidUrl(data.website);

  function analyse() {
    if (!valid || analysing) return;
    setAnalysing(true);
    window.setTimeout(() => {
      setAnalysing(false);
      set({ analysed: true, description: DEMO_SUMMARY });
    }, 2400);
  }

  return (
    <Stagger className="space-y-5">
      <StepHeading
        title="Analyze your website"
        subtitle="We use this to understand your brand and generate relevant content."
      />

      <Item>
        <ModeToggle />
      </Item>

      <Item>
        <Label>Company website</Label>
        <TextInput
          autoFocus
          value={data.website}
          placeholder="https://"
          onChange={(e) => set({ website: e.target.value, analysed: false })}
        />
        {data.website.length > 3 && !valid ? (
          <p className="mt-2 text-xs text-destructive">That doesn't look like a valid address</p>
        ) : null}
      </Item>

      <Item>
        <button
          type="button"
          onClick={analyse}
          disabled={!valid || analysing}
          className={cn(
            "h-12 w-full rounded-xl border text-[0.95rem] font-semibold transition-all duration-300",
            !valid
              ? "cursor-not-allowed border-border bg-secondary/35 text-muted-foreground/70"
              : "border-primary/50 bg-primary/15 text-foreground hover:bg-primary/25",
          )}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {analysing ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Reading your site…
              </>
            ) : (
              <>
                <Sparkles className="size-4" /> Analyse website
              </>
            )}
          </span>
        </button>
      </Item>

      {data.analysed ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-[0.85rem] text-muted-foreground"
        >
          <span className="inline-flex items-center gap-2 font-medium text-foreground">
            <CheckCircle2 className="size-4 text-success" /> Brand context captured
          </span>
          <p className="mt-1">We pre-filled the next step — review and tweak anything.</p>
        </motion.div>
      ) : null}
    </Stagger>
  );
}

function ModeToggle() {
  const { state, set } = useOnboarding();
  const mode = state.data.brandMode;
  const options = [
    { key: "website" as const, label: "Website", icon: Globe },
    { key: "description" as const, label: "Use description instead", icon: FileText },
  ];

  return (
    <div className="relative grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary/30 p-1">
      {options.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => set({ brandMode: key })}
          className="relative rounded-lg px-3 py-2.5 text-[0.88rem] font-medium transition-colors duration-200"
        >
          {mode === key ? (
            <motion.span
              layoutId="mode-pill"
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="absolute inset-0 rounded-lg border border-primary/60 bg-primary/15"
            />
          ) : null}
          <span
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-2",
              mode === key ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" /> {label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* --------------------------------- Step 3 ---------------------------------- */

export function StepCompany() {
  const { state, set } = useOnboarding();
  const { description } = state.data;
  const remaining = Math.max(0, MIN_DESCRIPTION - description.trim().length);

  return (
    <Stagger className="space-y-5">
      <StepHeading
        title="Tell us about your company"
        subtitle="No website yet? Add the brand context we should use for content generation."
      />

      <Item>
        <ModeToggle />
      </Item>

      <Item>
        <Label hint={`${description.length}/50,000`}>Company description</Label>
        <TextArea
          autoFocus
          rows={9}
          value={description}
          placeholder={DESCRIPTION_TEMPLATE}
          maxLength={50000}
          onChange={(e) => set({ description: e.target.value })}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={remaining > 0 ? "text-muted-foreground" : "text-success"}>
            {remaining > 0 ? `${remaining} more characters needed` : "Looks good"}
          </span>
          {description.length === 0 ? (
            <button
              type="button"
              onClick={() => set({ description: DESCRIPTION_TEMPLATE })}
              className="text-primary transition-opacity hover:opacity-80"
            >
              Use the template
            </button>
          ) : null}
        </div>
      </Item>
    </Stagger>
  );
}

/* --------------------------------- Step 4 ---------------------------------- */

const TEAM_SIZES = ["Just me", "2 - 5", "6 - 10", "11 - 20", "21 - 50", "50+"];
const REVENUES = ["Pre-revenue", "$1 - $1,000", "$1,000 - $10k", "$10k - $50k", "$50k - $500k", "$500k+"];

export function StepAboutYou() {
  const { state, set } = useOnboarding();
  return (
    <Stagger className="space-y-6">
      <StepHeading
        title="Tell us about yourself"
        subtitle="This helps us tailor recommendations to your stage."
      />
      <Item>
        <ChipGroup
          label="How big is your current team?"
          options={TEAM_SIZES}
          value={state.data.teamSize}
          onChange={(v) => set({ teamSize: v })}
        />
      </Item>
      <Item>
        <ChipGroup
          label="What is your current monthly revenue?"
          options={REVENUES}
          value={state.data.revenue}
          onChange={(v) => set({ revenue: v })}
        />
      </Item>
    </Stagger>
  );
}

/* --------------------------------- Step 5 ---------------------------------- */

const ROLES = [
  "Founder",
  "Social Media Manager",
  "Marketing Manager",
  "Agency Owner",
  "Freelancer",
  "Product Manager",
  "Content Creator",
  "Growth Manager",
  "Other",
];

export function StepRole() {
  const { state, set } = useOnboarding();
  return (
    <Stagger className="space-y-6">
      <StepHeading
        title="What describes you best?"
        subtitle="We'll customize your experience based on your role."
      />
      <Item>
        <ChipGroup
          label="Select your role"
          options={ROLES}
          value={state.data.role}
          onChange={(v) => set({ role: v })}
        />
      </Item>
    </Stagger>
  );
}

/* --------------------------------- Step 6 ---------------------------------- */

const MODELS = ["B2B", "B2C", "Both"];
const CATEGORIES = [
  "E-commerce",
  "SaaS",
  "Agency",
  "Services",
  "Marketplace",
  "Media/Content",
  "Mobile app",
  "Other",
];

export function StepBusiness() {
  const { state, set, toggle } = useOnboarding();
  return (
    <Stagger className="space-y-6">
      <StepHeading
        title="What type of business do you run?"
        subtitle="This helps us create content that resonates with your audience."
      />
      <Item>
        <ChipGroup
          label="Business model"
          options={MODELS}
          value={state.data.businessModel}
          onChange={(v) => set({ businessModel: v })}
        />
      </Item>
      <Item>
        <ChipGroup
          label="Business category"
          options={CATEGORIES}
          value={state.data.categories}
          onChange={(v) => toggle("categories", v)}
          multi
        />
      </Item>
    </Stagger>
  );
}

/* --------------------------------- Step 7 ---------------------------------- */

const REASONS = ["I need marketing now", "I need marketing in the future", "Just curious"];
const EXPECTATIONS = [
  "To save time on content creation",
  "To get more views on social media",
  "To drive traffic to my site",
  "To generate revenue",
  "To learn content marketing",
  "Other",
];

export function StepGoals() {
  const { state, set, toggle } = useOnboarding();
  return (
    <Stagger className="space-y-6">
      <StepHeading
        title="Why did you sign up?"
        subtitle="Last one — then your workspace is ready."
      />
      <Item>
        <ChipGroup
          label="Select one"
          options={REASONS}
          value={state.data.signupReason}
          onChange={(v) => set({ signupReason: v })}
        />
      </Item>
      <Item>
        <ChipGroup
          label="What do you expect from the platform?"
          options={EXPECTATIONS}
          value={state.data.expectations}
          onChange={(v) => toggle("expectations", v)}
          multi
          columns={2}
        />
      </Item>
    </Stagger>
  );
}

/* -------------------------------- Summary ---------------------------------- */

export function Summary() {
  const { state, dispatch } = useOnboarding();
  const d = state.data;

  const rows: { icon: typeof User; label: string; value: string; step: number }[] = [
    { icon: User, label: "You", value: `${d.name} · ${d.role}`, step: 1 },
    {
      icon: Building2,
      label: "Company",
      value: `${d.companyName} · ${d.businessModel} · ${d.categories.join(", ")}`,
      step: 6,
    },
    {
      icon: Globe,
      label: "Brand source",
      value: d.brandMode === "website" && d.website ? d.website : "Written description",
      step: 2,
    },
    { icon: Target, label: "Stage", value: `${d.teamSize} · ${d.revenue}`, step: 4 },
    {
      icon: Sparkles,
      label: "Goals",
      value: `${d.signupReason} — ${d.expectations.join(", ")}`,
      step: 7,
    },
  ];

  return (
    <Stagger className="space-y-6">
      <StepHeading
        title={`You're set, ${d.name.split(" ")[0] || "founder"}`}
        subtitle="This is the brand context FastBlitz will use for every piece of content."
      />

      <Item>
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-secondary/25">
          {rows.map(({ icon: Icon, label, value, step }) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3.5">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.8} />
              <div className="min-w-0 flex-1">
                <p className="text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
                  {label}
                </p>
                <p className="mt-0.5 break-words text-[0.92rem] text-foreground">{value || "—"}</p>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "goto", step })}
                className="shrink-0 text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </Item>

      <Item>
        <Callout>Demo walkthrough — nothing is saved, refresh karke phir se dekh sakte hain.</Callout>
      </Item>
    </Stagger>
  );
}
