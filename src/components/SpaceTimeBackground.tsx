"use client";

import React, { useEffect, useRef } from "react";
import {
  VERTEX_SHADER,
  FRAGMENT_SHADER,
  cacheShaderSource,
} from "@/lib/shaders";

/**
 * STARGATE CORRIDOR
 * WebGL fragment shader inspired by the slit-scan photography
 * in 2001: A Space Odyssey and the wormhole in Interstellar.
 *
 * Creates structured light planes stretching into a vanishing point,
 * with turbulent color corridors and depth-mapped striations.
 *
 * Responds to:
 * - Time of day (color palette shifts)
 * - Device orientation (parallax vanishing point)
 * - Scroll position (speed modulation)
 */

function getTimeOfDayHue(): number {
  const hour = new Date().getHours();
  // Dawn (5-7): warm amber 0.08
  // Morning (7-11): cool blue 0.6
  // Midday (11-14): white-blue 0.55
  // Afternoon (14-17): golden 0.12
  // Dusk (17-20): purple-magenta 0.8
  // Night (20-5): deep blue-violet 0.7
  if (hour >= 5 && hour < 7) return 0.08;
  if (hour >= 7 && hour < 11) return 0.6;
  if (hour >= 11 && hour < 14) return 0.55;
  if (hour >= 14 && hour < 17) return 0.12;
  if (hour >= 17 && hour < 20) return 0.8;
  return 0.7;
}

export default function SpaceTimeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const orientationRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef(1.0);

  // Cache shader assets on mount for offline support
  useEffect(() => {
    cacheShaderSource().catch((err) =>
      console.warn("Shader caching failed:", err)
    );
  }, []);

  // Device orientation listener — writes to ref so WebGL effect doesn't re-init
  useEffect(() => {
    // Guard: DeviceOrientationEvent may not exist on older desktops
    if (typeof DeviceOrientationEvent === "undefined") return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      orientationRef.current = {
        x: (e.gamma || 0) / 90, // -1 to 1 (tilt left/right)
        y: (e.beta || 0) / 180, // -1 to 1 (tilt forward/back)
      };
    };

    const doe = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };
    if (doe.requestPermission) {
      // iOS 13+ requires permission via user gesture — not handled in this version
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  // Scroll speed modulation
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = maxScroll > 0 ? scrollY / maxScroll : 0;
      speedRef.current = 0.6 + scrollRatio * 1.4; // 0.6x at top, 2.0x at bottom
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // WebGL initialization and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;
    glRef.current = gl;

    // Compile shaders
    function compileShader(source: string, type: number): WebGLShader | null {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl!.getShaderInfoLog(shader));
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = compileShader(VERTEX_SHADER, gl.VERTEX_SHADER);
    const fragShader = compileShader(FRAGMENT_SHADER, gl.FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Full-screen quad
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Get uniform locations
    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uOffset = gl.getUniformLocation(program, "u_offset");
    const uHueShift = gl.getUniformLocation(program, "u_hue_shift");
    const uSpeed = gl.getUniformLocation(program, "u_speed");

    const hueShift = getTimeOfDayHue();
    startTimeRef.current = Date.now();

    // Resize handler
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Render loop
    const render = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform2f(uOffset, orientationRef.current.x, orientationRef.current.y);
      gl.uniform1f(uHueShift, hueShift);
      gl.uniform1f(uSpeed, speedRef.current);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", resize);
      // Free WebGL resources to prevent GPU memory leaks
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
      gl.deleteBuffer(buffer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -5,
        pointerEvents: "none",
      }}
    />
  );
}
