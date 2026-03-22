"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";

/**
 * GENERATIVE AMBIENT ENGINE
 * Inspired by Ligeti's "Atmosphères" (2001) and Zimmer's organ drones (Interstellar).
 *
 * Architecture:
 * - Deep drone fundamental tuned to time-of-day
 * - Overtone harmonics modulated by device orientation
 * - Sub-bass pulse with LFO breathing
 * - Filtered noise layer for space ambience
 * - Latitude shifts the harmonic ratios
 * - Mouse/touch triggers ephemeral harmonic events
 * - Scroll modulates filter cutoff and drone intensity
 */

interface ResonanceContextType {
  shiftResonance: (frequencyOffset: number) => void;
  playThud: () => void;
}

const ResonanceContext = createContext<ResonanceContextType | null>(null);

export function useResonance() {
  return useContext(ResonanceContext);
}

// Time-of-day → base frequency mapping (musical, not arbitrary)
function getBaseFreq(hour: number): number {
  // Night: C2 (65Hz) — deep rumble
  // Dawn: D2 (73Hz) — rising
  // Morning: E2 (82Hz) — bright opening
  // Midday: G2 (98Hz) — peak energy
  // Afternoon: F2 (87Hz) — sustained
  // Dusk: Eb2 (78Hz) — descending
  // Evening: C2 (65Hz) — settling
  if (hour < 5) return 65.4;
  if (hour < 8) return 65.4 + (73.4 - 65.4) * ((hour - 5) / 3);
  if (hour < 11) return 73.4 + (98 - 73.4) * ((hour - 8) / 3);
  if (hour < 14) return 98;
  if (hour < 17) return 98 - (98 - 87.3) * ((hour - 14) / 3);
  if (hour < 20) return 87.3 - (87.3 - 78) * ((hour - 17) / 3);
  return 78 - (78 - 65.4) * ((hour - 20) / 4);
}

export function AmbientResonanceProvider({ children }: { children: React.ReactNode }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    master: GainNode;
    drone: OscillatorNode;
    droneGain: GainNode;
    harmonic2: OscillatorNode;
    harmonic3: OscillatorNode;
    harmonic5: OscillatorNode;
    h2Gain: GainNode;
    h3Gain: GainNode;
    h5Gain: GainNode;
    sub: OscillatorNode;
    subGain: GainNode;
    subLfo: OscillatorNode;
    noiseGain: GainNode;
    noiseFilter: BiquadFilterNode;
  } | null>(null);

  const [isInitialized, setIsInitialized] = useState(false);
  const sensorRef = useRef({ lat: 0, lon: 0, beta: 0, gamma: 0, scroll: 0 });

  // Sensor listeners (store in ref for audio modulation)
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      sensorRef.current.beta = e.beta || 0;
      sensorRef.current.gamma = e.gamma || 0;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      sensorRef.current.scroll = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("scroll", onScroll, { passive: true });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => { sensorRef.current.lat = p.coords.latitude; sensorRef.current.lon = p.coords.longitude; },
        () => {},
        { timeout: 5000 }
      );
    }

    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const initAudio = useCallback(() => {
    if (isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      const hour = new Date().getHours() + new Date().getMinutes() / 60;
      const baseFreq = getBaseFreq(hour);

      // Latitude shifts the harmonic ratios — equator = just intonation, poles = stretched
      const latStretch = 1 + Math.abs(sensorRef.current.lat) / 900; // subtle: 1.0 to 1.1

      // ── Master ──
      const master = ctx.createGain();
      master.gain.setValueAtTime(0, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 3); // fade in over 3s
      master.connect(ctx.destination);

      // ── Drone (triangle — warm, organ-like) ──
      const drone = ctx.createOscillator();
      drone.type = "triangle";
      drone.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.4, ctx.currentTime);
      drone.connect(droneGain);
      droneGain.connect(master);

      // ── Drone LFO (slow frequency wobble — Ligeti-like microtonality) ──
      const droneLfo = ctx.createOscillator();
      droneLfo.type = "sine";
      droneLfo.frequency.setValueAtTime(0.07, ctx.currentTime); // very slow
      const droneLfoGain = ctx.createGain();
      droneLfoGain.gain.setValueAtTime(2, ctx.currentTime); // ±2Hz wobble
      droneLfo.connect(droneLfoGain);
      droneLfoGain.connect(drone.frequency);
      droneLfo.start();

      // ── Harmonic overtones ──
      const h2 = ctx.createOscillator();
      h2.type = "sine";
      h2.frequency.setValueAtTime(baseFreq * 2 * latStretch, ctx.currentTime);
      const h2Gain = ctx.createGain();
      h2Gain.gain.setValueAtTime(0.15, ctx.currentTime);
      h2.connect(h2Gain);
      h2Gain.connect(master);

      const h3 = ctx.createOscillator();
      h3.type = "sine";
      h3.frequency.setValueAtTime(baseFreq * 3 * latStretch, ctx.currentTime);
      const h3Gain = ctx.createGain();
      h3Gain.gain.setValueAtTime(0.08, ctx.currentTime);
      h3.connect(h3Gain);
      h3Gain.connect(master);

      const h5 = ctx.createOscillator();
      h5.type = "sine";
      h5.frequency.setValueAtTime(baseFreq * 5 * latStretch, ctx.currentTime);
      const h5Gain = ctx.createGain();
      h5Gain.gain.setValueAtTime(0.04, ctx.currentTime);
      h5.connect(h5Gain);
      h5Gain.connect(master);

      // ── Sub-bass with breathing LFO ──
      const sub = ctx.createOscillator();
      sub.type = "sine";
      sub.frequency.setValueAtTime(baseFreq / 2, ctx.currentTime);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.2, ctx.currentTime);
      sub.connect(subGain);
      subGain.connect(master);

      const subLfo = ctx.createOscillator();
      subLfo.type = "sine";
      subLfo.frequency.setValueAtTime(0.15, ctx.currentTime); // breathing pace
      const subLfoGain = ctx.createGain();
      subLfoGain.gain.setValueAtTime(0.1, ctx.currentTime);
      subLfo.connect(subLfoGain);
      subLfoGain.connect(subGain.gain);
      subLfo.start();

      // ── Filtered noise (space ambience) ──
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const noiseData = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) noiseData[i] = Math.random() * 2 - 1;

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(200, ctx.currentTime);
      noiseFilter.Q.setValueAtTime(0.5, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(master);
      noiseSource.start();

      // Start all oscillators
      drone.start();
      h2.start();
      h3.start();
      h5.start();
      sub.start();

      nodesRef.current = {
        master, drone, droneGain, harmonic2: h2, harmonic3: h3, harmonic5: h5,
        h2Gain, h3Gain, h5Gain, sub, subGain, subLfo, noiseGain, noiseFilter,
      };

      setIsInitialized(true);
    } catch (e) {
      console.warn("Web Audio API not supported", e);
    }
  }, [isInitialized]);

  // Continuous modulation loop — reads sensor data, adjusts audio
  useEffect(() => {
    if (!isInitialized || !ctxRef.current || !nodesRef.current) return;

    const interval = setInterval(() => {
      const ctx = ctxRef.current;
      const nodes = nodesRef.current;
      if (!ctx || !nodes || ctx.state !== "running") return;

      const s = sensorRef.current;
      const t = ctx.currentTime;

      // Device tilt modulates harmonic balance
      const betaNorm = Math.abs(s.beta) / 90; // 0-1
      const gammaNorm = (s.gamma + 90) / 180; // 0-1

      nodes.h2Gain.gain.setTargetAtTime(0.05 + betaNorm * 0.2, t, 0.5);
      nodes.h3Gain.gain.setTargetAtTime(0.03 + gammaNorm * 0.15, t, 0.5);

      // Scroll modulates filter cutoff and drone intensity
      const scrollF = 150 + s.scroll * 800; // 150-950Hz
      nodes.noiseFilter.frequency.setTargetAtTime(scrollF, t, 0.3);
      nodes.droneGain.gain.setTargetAtTime(0.3 + s.scroll * 0.3, t, 0.5);

      // Update time-of-day base frequency gradually
      const hour = new Date().getHours() + new Date().getMinutes() / 60;
      const newBase = getBaseFreq(hour);
      const latStretch = 1 + Math.abs(s.lat) / 900;
      nodes.drone.frequency.setTargetAtTime(newBase, t, 2);
      nodes.sub.frequency.setTargetAtTime(newBase / 2, t, 2);
      nodes.harmonic2.frequency.setTargetAtTime(newBase * 2 * latStretch, t, 2);
      nodes.harmonic3.frequency.setTargetAtTime(newBase * 3 * latStretch, t, 2);
      nodes.harmonic5.frequency.setTargetAtTime(newBase * 5 * latStretch, t, 2);
    }, 500); // update every 500ms

    return () => clearInterval(interval);
  }, [isInitialized]);

  // First interaction starts audio
  useEffect(() => {
    const handler = () => {
      if (ctxRef.current?.state === "suspended") {
        ctxRef.current.resume();
      } else if (!isInitialized) {
        initAudio();
      }
    };
    window.addEventListener("click", handler, { once: true });
    window.addEventListener("touchstart", handler, { once: true });
    return () => {
      window.removeEventListener("click", handler);
      window.removeEventListener("touchstart", handler);
    };
  }, [isInitialized, initAudio]);

  const shiftResonance = useCallback((offset: number) => {
    if (!ctxRef.current || !nodesRef.current) return;
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    const drone = nodesRef.current.drone;
    const newFreq = Math.max(40, Math.min(200, drone.frequency.value + offset));
    drone.frequency.setTargetAtTime(newFreq, ctx.currentTime, 0.5);
  }, []);

  const playThud = useCallback(() => {
    if (!ctxRef.current || !nodesRef.current) return;
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();

    // Ephemeral harmonic event — a brief shimmering tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(nodesRef.current.master);

    // Random harmonic of the current drone frequency
    const droneFreq = nodesRef.current.drone.frequency.value;
    const harmonics = [1, 1.5, 2, 3, 4, 5, 6, 8];
    const harmonic = harmonics[Math.floor(Math.random() * harmonics.length)];
    osc.frequency.setValueAtTime(droneFreq * harmonic, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(droneFreq * harmonic * 0.5, ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }, []);

  return (
    <ResonanceContext.Provider value={{ shiftResonance, playThud }}>
      {children}
    </ResonanceContext.Provider>
  );
}
