/**
 * The paper material.
 *
 * A surface is two textures: the watercolour sheet and a single channel that
 * says "is this paper, and how much ink is on it". The shader mixes the
 * watercolour in as a room comes forward, lights the sheet with a soft
 * directional falloff and shades the faces turned away from the light with
 * pen hatching, so the book reads as paper rather than as plastic.
 */

import * as THREE from "three";

/** Warm paper, the same stock as the rest of the site. */
export const PAPER = new THREE.Color(0xf6f3eb);
/** Ink: a soft charcoal with a blue cast so it sits with the accent colour. */
export const INK = new THREE.Color(0x232c38);

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uWash;
  uniform sampler2D uAlpha;
  uniform float uReveal;     // 0 = line art only, 1 = coloured in
  uniform float uInkAmt;     // how strongly the drawing reads
  uniform float uSeed;
  uniform float uBlankBack;  // pop-ups: plain paper on the back
  uniform float uFlat;       // covers: no shading or hatching
  uniform float uOpacity;    // pop-ups fade in
  uniform vec3 uInk;
  uniform vec3 uPaper;
  uniform vec3 uLight;
  varying vec2 vUv;
  varying vec3 vNormal;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    float a = texture2D(uAlpha, vUv).r;
    if (a < 0.25) discard;
    float ink = clamp((a - 0.5) * 2.0, 0.0, 1.0);
    vec3 wash = texture2D(uWash, vUv).rgb;
    if (!gl_FrontFacing && uBlankBack > 0.5) { ink = 0.0; wash = vec3(1.0); }

    // paper grain
    float grain = noise(vUv * 380.0 + uSeed);
    vec3 col = uPaper * (0.965 + 0.035 * grain);

    // the watercolour wash is multiplied in as the room comes to the front
    col *= mix(vec3(1.0), wash, uReveal);

    // soft directional light on the sheet
    float l = abs(dot(normalize(vNormal), uLight));
    col *= mix(mix(0.82 + 0.18 * l, 0.94 + 0.06 * l, uReveal), 1.0, uFlat);

    // pen hatching on the faces turned away from the light
    float dark = clamp((0.78 - l) / 0.45, 0.0, 1.0) * (1.0 - 0.85 * uReveal) * (1.0 - uFlat);
    if (dark > 0.001) {
      float s = (vUv.x + vUv.y * 0.55) * 44.0 + sin(vUv.y * 21.0 + uSeed) * 0.18;
      float d = abs(fract(s) - 0.5);
      col = mix(col, uInk, smoothstep(0.075, 0.025, d) * dark * 0.32);
    }

    // the drawing itself
    col = mix(col, uInk, ink * uInkAmt);
    gl_FragColor = vec4(col, uOpacity);
  }
`;

const LIGHT = new THREE.Vector3(-0.55, 0.72, 0.42).normalize();

export type PaperOptions = {
  side?: THREE.Side;
  blankBack?: boolean;
  seed?: number;
  flat?: boolean | number;
  transparent?: boolean;
};

export function makePaperMaterial(
  wash: THREE.Texture,
  alpha: THREE.Texture,
  opts: PaperOptions = {},
) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: opts.side ?? THREE.FrontSide,
    uniforms: {
      uWash: { value: wash },
      uAlpha: { value: alpha },
      uReveal: { value: 0 },
      uInkAmt: { value: 1 },
      uSeed: { value: opts.seed ?? 1 },
      uBlankBack: { value: opts.blankBack ? 1 : 0 },
      uOpacity: { value: 1 },
      uFlat: { value: typeof opts.flat === "number" ? opts.flat : opts.flat ? 1 : 0 },
      uInk: { value: INK },
      uPaper: { value: PAPER },
      uLight: { value: LIGHT },
    },
    transparent: opts.transparent ?? false,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}
