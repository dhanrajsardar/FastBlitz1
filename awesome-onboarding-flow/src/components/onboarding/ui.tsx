import { motion } from "motion/react";
import {
  forwardRef,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

export const fieldStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

export const fieldItem = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fieldStagger} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}

export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={fieldItem} className={className}>
      {children}
    </motion.div>
  );
}

export function StepHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <Item>
        <h1 className="text-gradient font-display text-[clamp(1.75rem,4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.02em]">
          {title}
        </h1>
      </Item>
      {subtitle ? (
        <Item>
          <p className="mx-auto mt-3 max-w-lg text-[0.95rem] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </Item>
      ) : null}
    </div>
  );
}

export function Label({ children, hint }: { children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-[0.78rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {children}
      </span>
      {hint ? <span className="text-xs text-muted-foreground/80">{hint}</span> : null}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          "h-12 w-full rounded-xl border border-input bg-secondary/40 px-4 text-[0.98rem] text-foreground",
          "placeholder:text-muted-foreground/60 outline-none transition-all duration-300",
          "hover:border-border-strong focus:border-primary/60 focus:bg-secondary/60 focus:shadow-[0_0_0_4px_var(--ring)]",
          className,
        )}
      />
    );
  },
);

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "w-full resize-none rounded-xl border border-input bg-secondary/40 p-4 text-[0.95rem] leading-relaxed text-foreground",
        "placeholder:text-muted-foreground/55 outline-none transition-all duration-300",
        "hover:border-border-strong focus:border-primary/60 focus:bg-secondary/60 focus:shadow-[0_0_0_4px_var(--ring)]",
        className,
      )}
    />
  );
});

export function Chip({
  selected,
  onSelect,
  children,
  className,
  multi = false,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group relative overflow-hidden rounded-xl border px-4 py-3 text-[0.9rem] font-medium",
        "transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out",
        "active:scale-[0.97]",
        selected
          ? "border-primary/70 bg-primary/15 text-foreground shadow-[var(--shadow-glow)]"
          : "border-border bg-secondary/30 text-muted-foreground hover:border-border-strong hover:bg-secondary/55 hover:text-foreground",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      {selected ? (
        <span
          aria-hidden
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(120% 140% at 0% 0%, oklch(0.66 0.19 258 / 0.35), transparent 60%)",
          }}
        />
      ) : null}
    </button>
  );
}


export function ChipGroup({
  label,
  options,
  value,
  onChange,
  multi = false,
  columns = 3,
}: {
  label: string;
  options: string[];
  value: string | string[];
  onChange: (v: string) => void;
  multi?: boolean;
  columns?: 2 | 3;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelected = (o: string) => (multi ? (value as string[]).includes(o) : value === o);

  return (
    <div>
      <Label hint={multi ? "select all that apply" : undefined}>{label}</Label>
      <div
        ref={containerRef}
        role={multi ? "group" : "radiogroup"}
        aria-label={label}
        onKeyDown={(e) => {
          if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
          const buttons = Array.from(
            containerRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [],
          );
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          if (index === -1) return;
          e.preventDefault();
          const forward = e.key === "ArrowRight" || e.key === "ArrowDown";
          const step = e.key === "ArrowDown" || e.key === "ArrowUp" ? columns : 1;
          const nextIndex = forward
            ? Math.min(buttons.length - 1, index + step)
            : Math.max(0, index - step);
          buttons[nextIndex]?.focus();
        }}
        className={cn("grid gap-2.5", columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}
      >
        {options.map((option) => (
          <Chip
            key={option}
            multi={multi}
            selected={isSelected(option)}
            onSelect={() => onChange(option)}
          >
            {option}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  loading = false,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(
        "group relative h-12 w-full overflow-hidden rounded-xl text-[0.98rem] font-semibold",
        "transition-all duration-300 ease-out",
        disabled || loading
          ? "cursor-not-allowed border border-border bg-secondary/40 text-muted-foreground/70"
          : "accent-gradient text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110 active:scale-[0.99]",
      )}
    >
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
      {!disabled && !loading ? (
        <span aria-hidden className="absolute inset-0 overflow-hidden">
          <span className="animate-sheen absolute inset-y-0 -left-1/3 w-1/3 bg-[linear-gradient(90deg,transparent,oklch(1_0_0/0.35),transparent)]" />
        </span>
      ) : null}
    </button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mx-auto block rounded-lg px-3 py-2 text-[0.85rem] text-muted-foreground transition-colors duration-200 hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="relative rounded-xl border border-border bg-secondary/25 px-4 py-3 text-center text-[0.85rem] leading-relaxed text-muted-foreground">
      <span
        aria-hidden
        className="absolute inset-x-6 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.66 0.19 258 / 0.7), oklch(0.6 0.22 292 / 0.6), transparent)",
        }}
      />
      {children}
    </div>
  );
}
