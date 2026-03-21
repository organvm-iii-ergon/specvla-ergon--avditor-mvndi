"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

/**
 * WARP CORRIDOR
 * Inspired by the Stargate sequence in 2001: A Space Odyssey
 * and the wormhole in Interstellar.
 *
 * Key visual principles:
 * - Hair-thin streaks radiating from a central vanishing point
 * - Monochromatic blue-white palette with occasional warm accents
 * - Depth perspective: dim pinpoints at center, bright streaks at edges
 * - Feeling of relentless forward velocity through cold, vast space
 */

class WarpStar {
  x: number = 0;
  y: number = 0;
  z: number = 0;
  pz: number = 0;
  warmth: number;
  p: p5;

  constructor(p: p5) {
    this.p = p;
    this.reset(true);
    this.warmth = p.random(1) < 0.08 ? 1 : 0; // 8% of stars have warm amber tint
  }

  reset(initial: boolean) {
    const p = this.p;
    this.x = p.random(-p.width, p.width);
    this.y = p.random(-p.height, p.height);
    this.z = initial ? p.random(0, p.width) : p.width;
    this.pz = this.z;
  }

  update(speed: number) {
    this.z -= speed;
    if (this.z < 1) {
      this.reset(false);
    }
  }

  show() {
    const p = this.p;
    const halfW = p.width / 2;
    const halfH = p.height / 2;

    // Project 3D → 2D (perspective division)
    const sx = p.map(this.x / this.z, 0, 1, 0, halfW);
    const sy = p.map(this.y / this.z, 0, 1, 0, halfH);
    const px = p.map(this.x / this.pz, 0, 1, 0, halfW);
    const py = p.map(this.y / this.pz, 0, 1, 0, halfH);

    // Update previous z with lag — creates longer trails
    this.pz = this.z + (this.pz - this.z) * 0.15;

    // Brightness increases as star approaches camera (lower z = closer = brighter)
    const brightness = p.map(this.z, 0, p.width, 255, 30);
    const alpha = p.map(this.z, 0, p.width, 220, 10);

    // Stroke weight: hair-thin at distance, slightly thicker close up
    const weight = p.map(this.z, 0, p.width, 1.8, 0.3);

    // Color: blue-white dominant, with rare warm amber accents
    let r: number, g: number, b: number;
    if (this.warmth > 0) {
      // Warm star — amber/gold
      r = brightness;
      g = brightness * 0.75;
      b = brightness * 0.4;
    } else {
      // Cold star — ice blue to white
      r = brightness * 0.85;
      g = brightness * 0.9;
      b = brightness;
    }

    p.stroke(r, g, b, alpha);
    p.strokeWeight(weight);
    p.line(px, py, sx, sy);
  }
}

export default function SpaceTimeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const stars: WarpStar[] = [];
      const STAR_COUNT = 500;

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style("position", "fixed");
        canvas.style("top", "0");
        canvas.style("left", "0");
        canvas.style("z-index", "-5");
        for (let i = 0; i < STAR_COUNT; i++) {
          stars.push(new WarpStar(p));
        }
      };

      p.draw = () => {
        // Deep space void with subtle translucent fade (creates natural motion blur)
        p.background(3, 5, 15, 40);
        p.translate(p.width / 2, p.height / 2);

        // Steady velocity with very gentle breathing — contemplative, not frantic
        const speed = 8 + p.sin(p.frameCount * 0.003) * 2;

        for (const star of stars) {
          star.update(speed);
          star.show();
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
      };
    };

    const p5Instance = new p5(sketch, containerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -5,
          pointerEvents: "none",
          background: "#030510",
        }}
      />
      {/* Radial vignette overlay — creates the tunnel depth illusion */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -4,
          pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 0%, transparent 30%, rgba(3,5,16,0.4) 60%, rgba(3,5,16,0.8) 100%)",
        }}
      />
    </>
  );
}
