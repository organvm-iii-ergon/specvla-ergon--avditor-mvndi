/* VERTEX SHADER */
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}

/* FRAGMENT SHADER */
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_offset;
uniform float u_hue_shift;
uniform float u_speed;

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

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
  uv += u_offset * 0.15;
  float t = u_time * u_speed;

  float angle = atan(uv.y, uv.x);
  float radius = length(uv);
  float depth = 0.5 / (radius + 0.01);

  float tunnel_u = angle / 3.14159;
  float tunnel_v = depth + t * 0.3;

  float striations = sin(tunnel_v * 20.0) * 0.5 + 0.5;
  striations *= sin(tunnel_v * 7.0 + tunnel_u * 3.0) * 0.5 + 0.5;

  float bars = smoothstep(0.0, 0.05, abs(sin(tunnel_u * 8.0 + t * 0.1)));
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

  vec3 color = hsv2rgb(vec3(hue, saturation, value));
  color += vec3(core_glow);

  float vignette = 1.0 - smoothstep(0.3, 1.4, radius);
  color *= vignette;

  float grain = (hash(gl_FragCoord.xy + t) - 0.5) * 0.03;
  color += grain;

  gl_FragColor = vec4(color, 1.0);
}
