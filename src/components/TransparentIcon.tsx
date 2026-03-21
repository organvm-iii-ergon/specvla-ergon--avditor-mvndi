"use client";

import React from "react";
import CosmicIcon, { IconType } from "./CosmicIcons";

interface TransparentIconProps {
  type: IconType;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Renders a CosmicIcon with gradient stroke and glow.
 * Replaces the previous destination-out blend mode hack
 * which rendered invisible black-on-dark silhouettes.
 */
export default function TransparentIcon({ type, size = "100%", className, style }: TransparentIconProps) {
  return (
    <CosmicIcon
      type={type}
      size={size}
      className={className}
      style={style}
    />
  );
}
