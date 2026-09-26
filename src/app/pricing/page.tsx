import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Pricing",
    description: "Choose the path that aligns with your digital manifestation goals. Simple, cosmic pricing for growth audits.",
    openGraph: {
      title: "Pricing | Avditor Mvndi",
      description: "Choose the path that aligns with your digital manifestation goals. Simple, cosmic pricing for growth audits.",
      images: ["/api/og?domain=Pricing"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Pricing | Avditor Mvndi",
      description: "Choose the path that aligns with your digital manifestation goals. Simple, cosmic pricing for growth audits.",
    },
  };
}

export default function PricingPage() {
  return <PricingClient />;
}
