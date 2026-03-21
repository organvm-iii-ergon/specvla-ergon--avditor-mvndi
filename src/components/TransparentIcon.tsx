"use client";

import React from "react";
import { ICON_PATHS, IconType } from "./CosmicIcons";

interface TransparentIconProps {
  type: IconType;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * THE ICEBERG HOLE
 * Implements the "Iceberg Tip" by literalizing the transparent cut-out.
 * Uses mix-blend-mode: destination-out to punch a hole through 
 * the glassmorphism card, revealing the submerged p5.js space-time.
 */
export default function TransparentIcon({ type, size = "100%", className, style }: TransparentIconProps) {
  return (
    <div 
      className={className} 
      style={{ 
        width: size, 
        height: size, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        mixBlendMode: "destination-out" as any,
        background: "transparent",
        ...style 
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="black" 
        style={{ width: "100%", height: "100%" }}
      >
        <path d={ICON_PATHS[type]} />
      </svg>
    </div>
  );
}
