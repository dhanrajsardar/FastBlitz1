import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import logo from "@/assets/fastblitz-logo.png";
import { AuroraBackground } from "@/components/onboarding/aurora-background";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/blitz", label: "Blitz" },
  { to: "/blitz/settings", label: "Settings" },
  { to: "/billing", label: "Billing" },
] as const;

export function AppShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <AuroraBackground />
      <header className="relative z-10 border-b border-border/70">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="FastBlitz" width={28} height={28} className="h-7 w-7" />
            <span className="font-display text-[1.05rem] font-semibold tracking-tight text-foreground">
              FastBlitz
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground data-[status=active]:bg-secondary/70 data-[status=active]:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground sm:inline">
              Trial · 6 days left
            </span>
            <Link
              to="/billing"
              className="rounded-lg accent-gradient px-3.5 py-1.5 text-sm font-medium text-white shadow-[var(--shadow-glow)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </header>

      <main className={cn("relative z-10 mx-auto w-full max-w-6xl px-5 py-8", className)}>
        {children}
      </main>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-[0.7rem] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 font-display text-[1.9rem] leading-tight font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
    </div>
  );
}
