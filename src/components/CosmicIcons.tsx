"use client";

import React from "react";

export type IconType = "mercury" | "venus" | "mars" | "saturn" | "hammer" | "key" | "eye";

interface CosmicIconProps {
  type: IconType;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

// ULTRA-BOLD, INSTITUTIONAL SHAPES
export const ICON_PATHS: Record<IconType, string> = {
  mercury: "M12 2a4 4 0 0 0-4 4c0 .5.1 1 .3 1.5h7.4c.2-.5.3-1 .3-1.5a4 4 0 0 0-4-4zm0 8a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm0 14v3m-5-1.5h10",
  venus: "M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 16v7m-5-3.5h10",
  mars: "M10 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm10 0h4v4m-3-3-5 5",
  saturn: "M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm-10 6c0-4 5-6 10-6s10 2 10 6-5 6-10 6-10-2-10-6z",
  hammer: "M22 7l-4-4-10 10 2 2-3 3-2-2-3 3 5 5 3-3-2-2 3-3 2 2 9-9z",
  key: "M8 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zm4 12l10 8-4 4-3-3-3 3-5-5",
  eye: "M12 4C4 4 0 12 0 12s4 8 12 8 12-8 12-8-4-8-12-8zm0 12a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
};

export default function CosmicIcon({ type, size = "100%", className, style }: CosmicIconProps) {
  return (
    <div 
      className={className} 
      style={{ 
        width: size, 
        height: size, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        ...style 
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        style={{ width: "100%", height: "100%" }}
      >
        <path d={ICON_PATHS[type]} />
      </svg>
    </div>
  );
}
