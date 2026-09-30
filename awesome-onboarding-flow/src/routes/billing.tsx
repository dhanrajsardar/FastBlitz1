import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";

import { AppShell, SectionHeading } from "@/components/app/app-shell";
import { plans } from "@/lib/demo-content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/billing")({
  head: () => ({
    meta: [
      { title: "Plans & billing — FastBlitz" },
      {
        name: "description",
        content: "Compare FastBlitz plans for founders, teams and agencies, monthly or yearly.",
      },
      { property: "og:title", content: "Plans & billing — FastBlitz" },
      {
        property: "og:description",
        content: "Pick the plan that matches how much content you ship.",
      },
    ],
  }),
  component: BillingPage,
});

function BillingPage() {
  const [yearly, setYearly] = useState(true);
  const [selected, setSelected] = useState("Growth");

  return (
    <AppShell>
      <SectionHeading
        eyebrow="Billing"
        title="Pick your posting volume"
        subtitle="Your trial includes 30 drafts. Upgrade any time — nothing is charged in this demo."
      />

      <div className="mt-7 inline-flex items-center gap-1 rounded-xl border border-border bg-secondary/35 p-1">
        {(
          [
            [false, "Monthly"],
            [true, "Yearly"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={label}
            onClick={() => setYearly(value)}
            aria-pressed={yearly === value}
            className={cn(
              "relative rounded-lg px-4 py-1.5 text-sm transition-colors duration-200",
              yearly === value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {yearly === value ? (
              <motion.span
                layoutId="billing-toggle"
                className="absolute inset-0 rounded-lg bg-secondary"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : null}
            <span className="relative z-10">{label}</span>
            {value ? (
              <span className="relative z-10 ml-1.5 text-[0.7rem] text-primary">−20%</span>
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {plans.map((plan, i) => {
          const active = selected === plan.name;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "panel relative flex flex-col rounded-2xl p-6 transition-shadow duration-300",
                active && "shadow-[var(--shadow-glow)]",
              )}
            >
              {plan.featured ? (
                <span className="absolute -top-2.5 left-6 rounded-full accent-gradient px-2.5 py-1 text-[0.65rem] font-semibold tracking-wide text-white uppercase">
                  Most picked
                </span>
              ) : null}
              <h2 className="font-display text-xl font-semibold text-foreground">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.blurb}</p>

              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="font-display text-[2.2rem] leading-none font-semibold text-foreground">
                  ${yearly ? plan.yearly : plan.monthly}
                </span>
                <span className="text-sm text-muted-foreground">{yearly ? "/year" : "/month"}</span>
              </div>

              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm text-muted-foreground">
                    <span className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => setSelected(plan.name)}
                className={cn(
                  "mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "accent-gradient text-white hover:-translate-y-0.5"
                    : "border border-border bg-secondary/40 text-foreground hover:bg-secondary",
                )}
              >
                {active ? "Selected" : plan.cta}
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="panel mt-6 rounded-2xl p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Payment method</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This is a demo — no card is collected and no charge is made. Your trial keeps working.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm text-muted-foreground">
            Visa ···· 4242 · demo
          </span>
          <span className="text-sm text-muted-foreground">Next invoice: not scheduled</span>
        </div>
      </div>
    </AppShell>
  );
}
