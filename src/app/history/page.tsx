import type { Metadata } from "next";
import HistoryClient from "./HistoryClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Cosmic Archive",
    description: "Review past digital manifestations and growth audits.",
    openGraph: {
      title: "Cosmic Archive | Avditor Mvndi",
      description: "Review past digital manifestations and growth audits.",
      images: ["/api/og?domain=Cosmic%20Archive"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Cosmic Archive | Avditor Mvndi",
      description: "Review past digital manifestations and growth audits.",
    },
  };
}

export default function HistoryPage() {
  return <HistoryClient />;
}
