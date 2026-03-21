"use client";

import React, { useEffect, useRef } from "react";
import p5 from "p5";

class Star {
  x: number;
  y: number;
  z: number;
  pz: number;
  color: p5.Color;
  p: p5;

  constructor(p: p5) {
    this.p = p;
    this.x = p.random(-p.width * 2, p.width * 2);
    this.y = p.random(-p.height * 2, p.height * 2);
    this.z = p.random(p.width * 2);
    this.pz = this.z;
    
    const r = p.random(150, 255);
    const g = p.random(180, 255);
    const b = 255;
    this.color = p.color(r, g, b);
  }

  update(speed: number) {
    this.z = this.z - speed;
    if (this.z < 1) {
      this.z = this.p.width * 2;
      this.x = this.p.random(-this.p.width * 2, this.p.width * 2);
      this.y = this.p.random(-this.p.height * 2, this.p.height * 2);
      this.pz = this.z;
    }
  }

  show(speed: number) {
    const sx = this.p.map(this.x / this.z, 0, 1, 0, this.p.width / 2);
    const sy = this.p.map(this.y / this.z, 0, 1, 0, this.p.height / 2);

    const r = this.p.map(this.z, 0, this.p.width * 2, 10, 0);

    const px = this.p.map(this.x / this.pz, 0, 1, 0, this.p.width / 2);
    const py = this.p.map(this.y / this.pz, 0, 1, 0, this.p.height / 2);

    this.pz = this.z;

    this.p.stroke(this.color);
    this.p.strokeWeight(r);
    this.p.line(px, py, sx, sy);
  }
}

export default function SpaceTimeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const stars: Star[] = [];
      let speed: number = 30;

      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.position(0, 0);
        canvas.style("position", "fixed");
        canvas.style("top", "0");
        canvas.style("left", "0");
        canvas.style("z-index", "-5"); // Extreme depth
        for (let i = 0; i < 1500; i++) {
          stars[i] = new Star(p);
        }
      };

      p.draw = () => {
        p.background(2, 4, 12); // Pure deep space
        p.translate(p.width / 2, p.height / 2);
        
        speed = 35 + p.sin(p.frameCount * 0.005) * 15;
        
        for (let i = 0; i < stars.length; i++) {
          stars[i].update(speed);
          stars[i].show(speed);
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
        background: "#01030a"
      }} 
    />
  );
}
