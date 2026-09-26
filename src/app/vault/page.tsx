import type { Metadata } from "next";
import VaultClient from "./VaultClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "The Growth Vault",
    description: "A gated library of high-density strategic blueprints, copywriting frameworks, and technical SEO checklists.",
    openGraph: {
      title: "The Growth Vault | Avditor Mvndi",
      description: "A gated library of high-density strategic blueprints, copywriting frameworks, and technical SEO checklists.",
      images: ["/api/og?domain=Growth%20Vault"],
    },
    twitter: {
      card: "summary_large_image",
      title: "The Growth Vault | Avditor Mvndi",
      description: "A gated library of high-density strategic blueprints, copywriting frameworks, and technical SEO checklists.",
    },
  };
}

export default function VaultPage() {
  return <VaultClient />;
}
