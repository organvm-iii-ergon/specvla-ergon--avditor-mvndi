/**
 * WebGL Shader Definitions and Cache Utilities
 *
 * Stargate Corridor shader inspired by 2001: A Space Odyssey & Interstellar.
 * Extracts GLSL vertex and fragment shader sources and provides CacheStorage
 * / localStorage persistence so shader code is cached for instant offline rendering.
 */

export const SHADER_CACHE_NAME = "avditor-mvndi-shaders-v1";
export const SHADER_ENDPOINT = "/shaders/spacetime.glsl";

// GLSL vertex shader
export const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

// GLSL fragment shader — the slit-scan Stargate effect
export const FRAGMENT_SHADER = `
  precision highp float;

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_offset;       // device orientation parallax
  uniform float u_hue_shift;   // time-of-day color rotation
  uniform float u_speed;       // scroll-modulated speed

  // Convert HSV to RGB
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  // Fractal Brownian motion noise for turbulence
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

    // Apply device orientation parallax
    uv += u_offset * 0.15;

    float t = u_time * u_speed;

    // === SLIT-SCAN TUNNEL GEOMETRY ===
    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    float depth = 0.5 / (radius + 0.01);

    float tunnel_u = angle / 3.14159;
    float tunnel_v = depth + t * 0.3;

    // === STRUCTURED LIGHT PLANES ===
    float striations = sin(tunnel_v * 20.0) * 0.5 + 0.5;
    striations *= sin(tunnel_v * 7.0 + tunnel_u * 3.0) * 0.5 + 0.5;

    float bars = smoothstep(0.0, 0.05, abs(sin(tunnel_u * 8.0 + t * 0.1)));

    // === TURBULENT COLOR ===
    float turb = fbm(vec2(tunnel_u * 2.0, tunnel_v * 0.5) + t * 0.05);

    float hue = fract(
      tunnel_u * 0.3 +
      depth * 0.1 +
      turb * 0.4 +
      u_hue_shift +
      t * 0.02
    );

    float saturation = 0.7 + turb * 0.3;
    float value = striations * bars * smoothstep(0.0, 0.3, radius);

    float core_glow = exp(-radius * 4.0) * 0.8;

    float depth_brightness = smoothstep(8.0, 0.5, depth) * 1.2;
    value *= depth_brightness;

    // === COMPOSE ===
    vec3 color = hsv2rgb(vec3(hue, saturation, value));

    color += vec3(core_glow);

    float vignette = 1.0 - smoothstep(0.3, 1.4, radius);
    color *= vignette;

    float grain = (hash(gl_FragCoord.xy + t) - 0.5) * 0.03;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Returns full GLSL source containing vertex and fragment shaders.
 */
export function getCombinedShaderSource(): string {
  return `/* VERTEX SHADER */\n${VERTEX_SHADER}\n/* FRAGMENT SHADER */\n${FRAGMENT_SHADER}`;
}

/**
 * Caches shader source code in CacheStorage and localStorage for offline runtime recovery.
 */
export async function cacheShaderSource(): Promise<boolean> {
  try {
    const combinedSource = getCombinedShaderSource();

    if (typeof localStorage !== "undefined") {
      localStorage.setItem("avditor_shader_vertex", VERTEX_SHADER);
      localStorage.setItem("avditor_shader_fragment", FRAGMENT_SHADER);
    }

    if (typeof caches !== "undefined") {
      const cache = await caches.open(SHADER_CACHE_NAME);
      const response = new Response(combinedSource, {
        headers: {
          "Content-Type": "text/x-glsl",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
      await cache.put(SHADER_ENDPOINT, response);
    }

    return true;
  } catch (err) {
    console.warn("Failed to cache shader assets:", err);
    return false;
  }
}

/**
 * Retrieves shader source code from CacheStorage or localStorage if available,
 * falling back to in-memory defaults.
 */
export async function getCachedShaderSource(): Promise<{
  vertex: string;
  fragment: string;
}> {
  const vertex = VERTEX_SHADER;
  const fragment = FRAGMENT_SHADER;

  try {
    if (typeof caches !== "undefined") {
      const cache = await caches.open(SHADER_CACHE_NAME);
      const cachedResp = await cache.match(SHADER_ENDPOINT);
      if (cachedResp) {
        const text = await cachedResp.text();
        const parts = text.split("/* FRAGMENT SHADER */");
        if (parts.length === 2) {
          const vText = parts[0].replace("/* VERTEX SHADER */", "").trim();
          const fText = parts[1].trim();
          if (vText && fText) {
            return { vertex: vText, fragment: fText };
          }
        }
      }
    }

    if (typeof localStorage !== "undefined") {
      const v = localStorage.getItem("avditor_shader_vertex");
      const f = localStorage.getItem("avditor_shader_fragment");
      if (v && f) {
        return { vertex: v, fragment: f };
      }
    }
  } catch (err) {
    console.warn("Error reading shader cache:", err);
  }

  return { vertex, fragment };
}
