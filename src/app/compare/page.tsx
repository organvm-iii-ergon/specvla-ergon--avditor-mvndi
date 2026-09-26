import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Competitor Analysis",
    description: "Compare up to 3 websites side-by-side to uncover strategic advantages and growth gaps.",
    openGraph: {
      title: "Competitor Analysis | Avditor Mvndi",
      description: "Compare up to 3 websites side-by-side to uncover strategic advantages and growth gaps.",
      images: ["/api/og?domain=Competitor%20Analysis"],
    },
    twitter: {
      card: "summary_large_image",
      title: "Competitor Analysis | Avditor Mvndi",
      description: "Compare up to 3 websites side-by-side to uncover strategic advantages and growth gaps.",
    },
  };
}

export default function ComparePage() {
  return <CompareClient />;
}
