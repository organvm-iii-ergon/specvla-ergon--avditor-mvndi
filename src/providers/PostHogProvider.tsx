"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: "identified_only",
      capture_pageview: false, // Handled manually for SPA-like transitions
    });
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Capture initial pageview
    posthog.capture("$pageview");
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}

/**
 * DEEP TELEMETRY UTILITY
 * Implements the "Latent Evaluation" requirement of the Covenant.
 */
export const trackIcebergInteraction = (feature: string, metadata: Record<string, any> = {}) => {
  posthog.capture(`iceberg_tip_interaction`, {
    feature,
    ...metadata,
    submerged_context: true,
    timestamp: new Date().toISOString(),
  });
};
