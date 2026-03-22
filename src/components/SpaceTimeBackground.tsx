"use client";

import React, { useEffect, useRef, useCallback } from "react";

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`;

const FRAG = `
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_orientation;
uniform float u_lat;
uniform float u_lon;
uniform float u_hour;
uniform float u_speed;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),
             mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}

float fbm(vec2 p){
  float v=0.,a=.5;
  mat2 rot=mat2(.8,.6,-.6,.8);
  for(int i=0;i<6;i++){v+=a*noise(p);p=rot*p*2.1;a*=.5;}
  return v;
}

vec3 hsv2rgb(vec3 c){
  vec4 K=vec4(1.,2./3.,1./3.,3.);
  vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
  return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

vec3 todPalette(float h){
  if(h<5.) return vec3(.72,.6,.4);
  if(h<8.) return vec3(.05+.03*smoothstep(5.,8.,h),.8,.5+.3*smoothstep(5.,8.,h));
  if(h<17.) return vec3(.55,.7,.9);
  if(h<21.) return vec3(.8-.1*smoothstep(17.,21.,h),.85,.7);
  return vec3(.7,.65,.5-.1*smoothstep(21.,24.,h));
}

void main(){
  vec2 uv=(gl_FragCoord.xy-.5*u_resolution)/min(u_resolution.x,u_resolution.y);
  float t=u_time*u_speed;

  float tiltX=u_orientation.z*.003;
  float tiltY=u_orientation.y*.002;
  float compass=u_orientation.x*.0005;
  uv+=vec2(tiltX,tiltY);

  vec2 mUV=(u_mouse-.5)*2.;
  float mD=length(uv-mUV);
  uv+=(uv-mUV)*(.15/(mD+.3))*.1;

  float latI=u_lat/90.;
  float lonI=u_lon/180.;

  float angle=atan(uv.y,uv.x)+compass+lonI*.5;
  float radius=length(uv);
  float depth=.4/(radius+.005);
  float tu=angle/3.14159;
  float tv=depth+t*.25;

  vec3 tod=todPalette(u_hour);

  float bars=smoothstep(.02,.06,abs(sin(tu*6.+t*.05)));
  float stri=sin(tv*15.)*.5+.5;
  stri*=sin(tv*8.+tu*4.)*.5+.5;
  float corridor=bars*stri;

  vec2 nc=vec2(tu*1.5+latI*.3,tv*.3);
  float neb=fbm(nc+t*.03);
  float neb2=fbm(nc*2.+vec2(t*.05,t*.02));

  float sa=atan(uv.y,uv.x)*15.;
  float streaks=pow(abs(sin(sa+t*.5)),.8)*.3;
  streaks*=smoothstep(.0,.4,radius);

  float rings=sin(depth*3.-t*2.)*.5+.5;
  rings*=sin(depth*7.-t*1.5)*.5+.5;
  rings*=smoothstep(.0,.15,radius);

  float hue=fract(tod.x+tu*.2+depth*.08+neb*.3+compass+lonI*.1);
  float sat=(.5+neb2*.4)*tod.y;
  float val=corridor*.5+neb*.3+streaks+rings*.2;
  val*=smoothstep(.0,.2,radius);
  val*=tod.z;
  val*=smoothstep(6.,.5,depth)*1.3;

  vec3 color=hsv2rgb(vec3(hue,sat,val));

  float core=exp(-radius*5.)*.9;
  color+=vec3(core);

  float ab=radius*.04;
  vec3 cR=hsv2rgb(vec3(hue+ab,sat,val));
  vec3 cB=hsv2rgb(vec3(hue-ab,sat,val));
  color=vec3(cR.r,color.g,cB.b);
  color+=vec3(core);

  color*=1.-smoothstep(.5,1.5,radius)*.6;
  color+=(hash(gl_FragCoord.xy+t)-.5)*.025;
  color*=1.+latI*uv.y*.15;

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
    const h = (e: DeviceOrientationEvent) => {
      orientRef.current = { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 };
    };
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
        () => {},
        { timeout: 5000 }
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
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vs = compile(VERT, gl.VERTEX_SHADER);
    const fs = compile(FRAG, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uOrient = gl.getUniformLocation(prog, "u_orientation");
    const uLat = gl.getUniformLocation(prog, "u_lat");
    const uLon = gl.getUniformLocation(prog, "u_lon");
    const uHour = gl.getUniformLocation(prog, "u_hour");
    const uSpeed = gl.getUniformLocation(prog, "u_speed");

    startRef.current = Date.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const render = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const o = orientRef.current, m = mouseRef.current, g = geoRef.current;
      gl.uniform1f(uTime, elapsed);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, m.x, m.y);
      gl.uniform3f(uOrient, o.alpha, o.beta, o.gamma);
      gl.uniform1f(uLat, g.lat);
      gl.uniform1f(uLon, g.lon);
      gl.uniform1f(uHour, hourRef.current);
      gl.uniform1f(uSpeed, speedRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => { const cleanup = initGL(); return () => cleanup?.(); }, [initGL]);

  return <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: -5, pointerEvents: "none" }} />;
}
