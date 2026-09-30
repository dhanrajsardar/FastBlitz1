import { createFileRoute } from "@tanstack/react-router";
import { OnboardingFlow } from "@/components/onboarding/flow";
import { OnboardingProvider } from "@/components/onboarding/onboarding-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FastBlitz — Set up your content workspace" },
      {
        name: "description",
        content:
          "Tell FastBlitz about your brand once and get daily on-brand short-form content you can approve in a swipe.",
      },
      { property: "og:title", content: "FastBlitz — Set up your content workspace" },
      {
        property: "og:description",
        content:
          "Tell FastBlitz about your brand once and get daily on-brand short-form content you can approve in a swipe.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
}
