"use client";

import dynamic from "next/dynamic";

const SpaceTimeBackground = dynamic(
  () => import("@/components/SpaceTimeBackground"),
  { ssr: false }
);

export default function ClientBackground() {
  return <SpaceTimeBackground />;
}
