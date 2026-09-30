import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import logo from "@/assets/fastblitz-logo.png";
import { AuroraBackground } from "@/components/onboarding/aurora-background";
import {
  STEP_LABELS,
  useOnboarding,
} from "@/components/onboarding/onboarding-context";
import {
  StepAboutYou,
  StepBusiness,
  StepCompany,
  StepGoals,
  StepRole,
  StepWebsite,
  StepWelcome,
  Summary,
} from "@/components/onboarding/steps";
import { GhostButton, PrimaryButton } from "@/components/onboarding/ui";
import { cn } from "@/lib/utils";

// Main app (studio) path/URL that opens once onboarding completes.
// Same app by default; override in .env via VITE_MAIN_APP_URL for another origin.
const MAIN_APP_URL = import.meta.env.VITE_MAIN_APP_URL || "/studio/";

const STEPS = [
  StepWelcome,
  StepWebsite,
  StepCompany,
  StepAboutYou,
  StepRole,
  StepBusiness,
  StepGoals,
];

export function OnboardingFlow() {
  const { state, dispatch, next, back, canContinue, totalSteps } = useOnboarding();
  const { step, direction, phase } = state;
  const router = useRouter();

  // "Setting up your workspace" beat before the summary.
  useEffect(() => {
    if (phase !== "building") return;
    const t = window.setTimeout(() => dispatch({ type: "finishBuilding" }), 2100);
    return () => window.clearTimeout(t);
  }, [phase, dispatch]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase !== "steps") return;
      const el = e.target as HTMLElement | null;
      const inTextarea = el?.tagName === "TEXTAREA";
      if (e.key === "Enter" && !inTextarea && canContinue) {
        e.preventDefault();
        next();
      }
      if (e.key === "Escape" && step > 1) {
        e.preventDefault();
        back();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, canContinue, next, back, step]);

  const StepComponent = STEPS[step - 1] ?? StepWelcome;

  return (
    <div className="relative flex min-h-screen flex-col">
      <AuroraBackground />

      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="" className="size-8 object-contain" />
          <span className="font-display text-[1.05rem] font-semibold tracking-[-0.01em]">
            FastBlitz
          </span>
        </div>
        {phase === "done" ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="rounded-lg border border-border px-3.5 py-2 text-[0.82rem] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            Restart
          </button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-border px-3.5 py-2 text-[0.82rem] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            Log out
          </button>
        )}
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
        <div className="w-full max-w-xl">
          {phase === "steps" ? <ProgressRail /> : null}

          <div className="panel relative mt-5 overflow-hidden rounded-3xl px-5 py-7 sm:px-8 sm:py-9">
            <span
              aria-hidden
              className="absolute inset-x-10 top-0 h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent, oklch(0.66 0.19 258 / 0.55), transparent)",
              }}
            />

            <AnimatePresence mode="wait" initial={false}>
              {phase === "steps" ? (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, x: direction * 34, filter: "blur(8px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: direction * -34, filter: "blur(8px)" }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <StepComponent />
                  <div className="mt-7 space-y-2">
                    <PrimaryButton disabled={!canContinue} onClick={next}>
                      {step === totalSteps ? "Finish setup" : "Continue"}
                      <ArrowRight className="size-4" />
                    </PrimaryButton>
                    {step > 1 ? <GhostButton onClick={back}>← Back</GhostButton> : null}
                  </div>
                </motion.div>
              ) : phase === "building" ? (
                <motion.div
                  key="building"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-4 py-14 text-center"
                >
                  <Loader2 className="size-7 animate-spin text-primary" />
                  <p className="font-display text-xl font-semibold">
                    Setting up your workspace
                  </p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Learning your brand voice, angles and content mix…
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Summary />
                  <div className="mt-7">
                    <PrimaryButton
                      onClick={() => {
                        if (MAIN_APP_URL.startsWith("/")) {
                          router.navigate({ to: MAIN_APP_URL });
                        } else {
                          window.location.href = MAIN_APP_URL;
                        }
                      }}
                    >
                      Enter FastBlitz
                      <ArrowRight className="size-4" />
                    </PrimaryButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {phase === "steps" ? (
            <p className="mt-4 text-center text-xs text-muted-foreground/70">
              Press <kbd className="rounded border border-border px-1.5 py-0.5">Enter</kbd> to
              continue · <kbd className="rounded border border-border px-1.5 py-0.5">Esc</kbd> to go
              back
            </p>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function ProgressRail() {
  const { state, dispatch, totalSteps } = useOnboarding();
  const { step } = state;

  return (
    <div>
      <div className="flex items-baseline justify-between px-1">
        <span className="font-display text-[0.82rem] font-medium tracking-[0.02em] text-foreground">
          {STEP_LABELS[step - 1]}
        </span>
        <span className="text-[0.75rem] tabular-nums text-muted-foreground">
          Step {step} of {totalSteps}
        </span>
      </div>
      <div className="mt-2.5 flex gap-1.5">
        {Array.from({ length: totalSteps }, (_, i) => {
          const index = i + 1;
          const done = index < step;
          const active = index === step;
          return (
            <button
              key={index}
              type="button"
              aria-label={`Go to ${STEP_LABELS[i]}`}
              disabled={index > step}
              onClick={() => dispatch({ type: "goto", step: index })}
              className={cn(
                "h-1 flex-1 overflow-hidden rounded-full transition-colors duration-300",
                done ? "bg-primary/70" : active ? "bg-primary" : "bg-border-strong",
                index > step ? "cursor-default" : "cursor-pointer",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="rail-active"
                  className="animate-rail-pulse block h-full w-full accent-gradient"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
