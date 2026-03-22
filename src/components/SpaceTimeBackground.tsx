"use client";

import React, { useEffect, useRef, useCallback } from "react";

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_orientation;
uniform float u_lat,u_lon,u_hour,u_speed;

// ── Noise ──
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){
  float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);
  for(int i=0;i<7;i++){v+=a*noise(p);p=r*p*2.1;a*=.48;}
  return v;
}
// 3D noise for volumetric blobs
float noise3(vec3 p){
  vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  float n=i.x+i.y*157.+i.z*113.;
  return mix(mix(mix(hash(vec2(n,0.)),hash(vec2(n+1.,0.)),f.x),
    mix(hash(vec2(n+157.,0.)),hash(vec2(n+158.,0.)),f.x),f.y),
    mix(mix(hash(vec2(n+113.,0.)),hash(vec2(n+114.,0.)),f.x),
    mix(hash(vec2(n+270.,0.)),hash(vec2(n+271.,0.)),f.x),f.y),f.z);
}
float fbm3(vec3 p){
  float v=0.,a=.5;
  for(int i=0;i<5;i++){v+=a*noise3(p);p=p*2.1+vec3(.3,.7,.2);a*=.5;}
  return v;
}

vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.,2./3.,1./3.,3.);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

vec3 todPalette(float h){
  if(h<5.)return vec3(.72,.6,.35);
  if(h<8.)return vec3(.06,.8,.6);
  if(h<17.)return vec3(.55,.65,.85);
  if(h<21.)return vec3(.78,.8,.65);
  return vec3(.7,.6,.4);
}

// Amorphous blob SDF — organic, breathing shape
float blobSDF(vec2 uv,vec2 center,float size,float t,float seed){
  vec2 d=uv-center;
  float angle=atan(d.y,d.x);
  float r=length(d);
  // Organic distortion via noise
  float distort=fbm(vec2(angle*2.+seed,t*.3+seed))*size*.6;
  distort+=noise(vec2(angle*5.+t*.5,seed*3.))*.15*size;
  return r-(size+distort);
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);
  float t=u_time*u_speed;

  // Sensor warps
  uv+=vec2(u_orientation.z*.003,u_orientation.y*.002);
  vec2 mUV=(u_mouse-.5)*2.;
  float mD=length(uv-mUV);
  uv+=(uv-mUV)*(.12/(mD+.4))*.08;

  float lonI=u_lon/180.;
  float latI=u_lat/90.;

  // ── MULTIPLE LIGHT SOURCES ── (positions driven by externals)
  // Light 1: time-driven orbit
  vec2 L1=vec2(cos(t*.15+lonI*3.)*.6,sin(t*.12+latI*2.)*.5);
  // Light 2: latitude/longitude driven
  vec2 L2=vec2(sin(t*.08+lonI*5.)*.7,cos(t*.1+latI*3.)*.6);
  // Light 3: mouse/touch gravitational
  vec2 L3=mUV*.5;
  // Light 4: orientation-driven
  vec2 L4=vec2(sin(u_orientation.x*.01)*.4,cos(u_orientation.y*.02)*.3);

  // Light colors tied to time-of-day
  vec3 tod=todPalette(u_hour);
  vec3 L1color=hsv2rgb(vec3(tod.x,tod.y,.9));
  vec3 L2color=hsv2rgb(vec3(fract(tod.x+.33),tod.y*.8,.7));
  vec3 L3color=hsv2rgb(vec3(fract(tod.x+.66),tod.y*.6,.8));
  vec3 L4color=hsv2rgb(vec3(fract(tod.x+.5),.5,.5));

  // ── AMORPHOUS SHAPES ── (blobs with noise-distorted boundaries)
  // 5 blobs at positions driven by time + sensor data
  float b1=blobSDF(uv,vec2(sin(t*.13)*.3,cos(t*.17)*.4),.25+latI*.05,t,1.);
  float b2=blobSDF(uv,vec2(cos(t*.11+1.)*.5,sin(t*.14+2.)*.3),.2,t,7.3);
  float b3=blobSDF(uv,vec2(sin(t*.09+3.)*.4,cos(t*.12+1.)*.5),.3+lonI*.05,t,13.7);
  float b4=blobSDF(uv,vec2(cos(t*.16)*.3,sin(t*.1+4.)*.35),.18,t,23.1);
  float b5=blobSDF(uv,vec2(sin(t*.07+5.)*.45,cos(t*.13+2.)*.25),.22,t,37.9);

  // Combine blobs — smooth union
  float blobs=min(min(min(b1,b2),min(b3,b4)),b5);

  // Blob surface: edge glow + interior refraction
  float edge=smoothstep(.02,0.,abs(blobs))*.8; // bright edge outline
  float interior=smoothstep(.0,-.15,blobs); // inside the blob
  float exterior=1.-interior;

  // ── LIGHT INTERACTIONS ──
  // Each light illuminates based on distance, with blob surfaces reflecting
  float il1=.3/(.1+length(uv-L1)*2.);
  float il2=.25/(.1+length(uv-L2)*2.);
  float il3=.2/(.1+length(uv-L3)*2.5);
  float il4=.15/(.1+length(uv-L4)*3.);

  // Light reflects off blob surfaces (brighter near edges)
  float reflect1=il1*(1.+edge*3.);
  float reflect2=il2*(1.+edge*2.5);
  float reflect3=il3*(1.+edge*2.);
  float reflect4=il4*(1.+edge*1.5);

  // ── REFRACTION inside blobs ──
  // Interior gets warped color from the lights passing through
  vec2 refractUV=uv+vec2(fbm(uv*3.+t*.1)-.5,fbm(uv*3.+t*.1+5.)-.5)*.15*interior;
  float refractNoise=fbm(refractUV*4.+t*.05);

  // ── TUNNEL (behind everything — the deep space corridor) ──
  float angle=atan(uv.y,uv.x)+lonI*.5;
  float radius=length(uv);
  float depth=.3/(radius+.01);
  float tunnel=sin(depth*12.-t*2.)*.5+.5;
  tunnel*=sin(angle*4.+depth*3.)*.5+.5;
  tunnel*=smoothstep(0.,.3,radius)*.3;

  // ── COMPOSE ──
  vec3 color=vec3(0.);

  // Tunnel base layer
  float tunnelHue=fract(tod.x+angle*.1+depth*.05);
  color+=hsv2rgb(vec3(tunnelHue,tod.y*.5,tunnel*tod.z*.4));

  // Light contributions
  color+=L1color*reflect1;
  color+=L2color*reflect2;
  color+=L3color*reflect3;
  color+=L4color*reflect4;

  // Blob refraction — warped colors inside blobs
  vec3 refractColor=hsv2rgb(vec3(
    fract(tod.x+refractNoise*.4+lonI*.1),
    .6+refractNoise*.3,
    interior*.5*tod.z
  ));
  color+=refractColor;

  // Blob edge glow
  color+=edge*mix(L1color,L2color,.5)*1.5;

  // ── Nebula clouds (organic swirls) ──
  float nebula=fbm3(vec3(uv*2.,t*.05))*exterior;
  color+=hsv2rgb(vec3(fract(tod.x+.15),.4,nebula*.15*tod.z));

  // ── Central singularity ──
  float core=exp(-radius*6.)*.6;
  color+=vec3(core);

  // ── Chromatic aberration ──
  float ab=radius*.03;
  vec3 colorShift=color;
  colorShift.r=color.r*1.+ab*.5;
  colorShift.b=color.b*1.-ab*.3;
  color=mix(color,colorShift,.7);

  // ── Vignette ──
  color*=1.-smoothstep(.6,1.6,radius)*.5;

  // ── Film grain ──
  color+=(hash(gl_FragCoord.xy+t)-.5)*.02;

  // ── Latitude vertical color shift ──
  color*=1.+latI*uv.y*.1;

  gl_FragColor=vec4(max(color,0.),1.);
}
`;

export default function SpaceTimeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(Date.now());
  const orientRef = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const geoRef = useRef({ lat: 0, lon: 0 });
  const speedRef = useRef(1.0);
  const hourRef = useRef(new Date().getHours() + new Date().getMinutes() / 60);

  useEffect(() => {
    const h = (e: DeviceOrientationEvent) => { orientRef.current = { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 }; };
    window.addEventListener("deviceorientation", h);
    return () => window.removeEventListener("deviceorientation", h);
  }, []);

  useEffect(() => {
    const m = (e: MouseEvent) => { mouseRef.current = { x: e.clientX / window.innerWidth, y: 1 - e.clientY / window.innerHeight }; };
    const t = (e: TouchEvent) => { const tc = e.touches[0]; if (tc) mouseRef.current = { x: tc.clientX / window.innerWidth, y: 1 - tc.clientY / window.innerHeight }; };
    window.addEventListener("mousemove", m);
    window.addEventListener("touchmove", t, { passive: true });
    return () => { window.removeEventListener("mousemove", m); window.removeEventListener("touchmove", t); };
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => { geoRef.current = { lat: p.coords.latitude, lon: p.coords.longitude }; },
        () => {}, { timeout: 5000 }
      );
    }
  }, []);

  useEffect(() => {
    const h = () => { const mx = document.documentElement.scrollHeight - window.innerHeight; speedRef.current = 0.6 + (mx > 0 ? (window.scrollY / mx) * 1.4 : 0); };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const i = setInterval(() => { hourRef.current = new Date().getHours() + new Date().getMinutes() / 60; }, 60000);
    return () => clearInterval(i);
  }, []);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = compile(VERT, gl.VERTEX_SHADER), fs = compile(FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uTime=u("u_time"),uRes=u("u_resolution"),uMouse=u("u_mouse"),uOrient=u("u_orientation"),
          uLat=u("u_lat"),uLon=u("u_lon"),uHour=u("u_hour"),uSpeed=u("u_speed");

    startRef.current = Date.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px"; canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize(); window.addEventListener("resize", resize);

    const render = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const o = orientRef.current, m = mouseRef.current, g = geoRef.current;
      gl.uniform1f(uTime, elapsed); gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, m.x, m.y); gl.uniform3f(uOrient, o.alpha, o.beta, o.gamma);
      gl.uniform1f(uLat, g.lat); gl.uniform1f(uLon, g.lon);
      gl.uniform1f(uHour, hourRef.current); gl.uniform1f(uSpeed, speedRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => { const cleanup = initGL(); return () => cleanup?.(); }, [initGL]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -5, pointerEvents: "none" }} />;
}
