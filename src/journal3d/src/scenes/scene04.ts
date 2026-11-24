/**
 * Scene 04 — Elsewhere.
 *
 * The last room looks outward: the night city across the river on one wall,
 * a mountain lake with a bare tree on the other, and a road running out of the
 * book.
 */

import { PALETTE } from "./scene01";
import type { Sketch } from "../core/sketch";

/** Left wall: the city at night, seen over the water. */
export function drawLeft(s: Sketch) {
  s.washAll("#2f3a52", 0.55);
  s.glow(0.5, 0.62, 0.5, "#f2c98a", 0.35);

  // skyline
  const towers: [number, number, number][] = [
    [0.04, 0.16, 0.12],
    [0.15, 0.26, 0.09],
    [0.23, 0.1, 0.14],
    [0.36, 0.2, 0.1],
    [0.45, 0.14, 0.12],
    [0.56, 0.24, 0.08],
    [0.63, 0.12, 0.13],
    [0.75, 0.2, 0.1],
    [0.84, 0.28, 0.12],
  ];
  for (const [x, y, w] of towers) {
    s.fill(
      [
        [x, 0.66],
        [x + w, 0.66],
        [x + w, 0.66 - y],
        [x, 0.66 - y],
      ],
      "#1d2740",
      { alpha: 0.9, jitter: 0.3 },
    );
    s.stroke(
      [
        [x, 0.66],
        [x + w, 0.66],
        [x + w, 0.66 - y],
        [x, 0.66 - y],
      ],
      { w: 1.2, closed: true, alpha: 0.5 },
    );
    // lit windows
    for (let i = 0; i < 3; i++) {
      const wy = 0.66 - y + 0.03 + i * (y / 4);
      if (wy > 0.6) break;
      s.fill(
        [
          [x + w * 0.25, wy],
          [x + w * 0.7, wy],
          [x + w * 0.7, wy + 0.016],
          [x + w * 0.25, wy + 0.016],
        ],
        "#f6d79a",
        { alpha: 0.75, jitter: 0.2 },
      );
    }
  }
  // ferris wheel
  s.circle(0.8, 0.2, 0.1, { w: 1.6, alpha: 0.7 });
  s.circle(0.8, 0.2, 0.055, { w: 1.2, alpha: 0.5 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    s.line(0.8, 0.2, 0.8 + Math.cos(a) * 0.1, 0.2 + Math.sin(a) * 0.1, { w: 0.9, alpha: 0.45 });
  }
  s.line(0.8, 0.3, 0.8, 0.4, { w: 1.4, alpha: 0.6 });

  // the river
  s.fill(
    [
      [0.0, 0.66],
      [1.0, 0.66],
      [1.0, 1.0],
      [0.0, 1.0],
    ],
    "#2a4a63",
    { alpha: 0.8, jitter: 0.6 },
  );
  for (let i = 0; i < 7; i++) {
    const y = 0.71 + i * 0.04;
    s.line(0.1 + (i % 3) * 0.12, y, 0.3 + (i % 3) * 0.12, y, { w: 1.4, alpha: 0.25 });
  }
  s.mark("night-city", [
    [0.02, 0.08],
    [0.96, 0.08],
    [0.96, 0.64],
    [0.02, 0.64],
  ], 0.02);
}

/** Right wall: the lake, the bare tree, the fog. */
export function drawRight(s: Sketch) {
  s.washAll("#e4efee", 0.6);
  // mountains
  s.fill(
    [
      [0.0, 0.5],
      [0.24, 0.22],
      [0.42, 0.44],
      [0.6, 0.28],
      [0.86, 0.52],
      [1.0, 0.5],
      [1.0, 0.66],
      [0.0, 0.66],
    ],
    "#b9c6c8",
    { alpha: 0.55, jitter: 0.9 },
  );
  s.stroke(
    [
      [0.0, 0.5],
      [0.24, 0.22],
      [0.42, 0.44],
      [0.6, 0.28],
      [0.86, 0.52],
    ],
    { w: 1.4, alpha: 0.5 },
  );
  // fog band
  s.fill(
    [
      [0.0, 0.44],
      [1.0, 0.46],
      [1.0, 0.6],
      [0.0, 0.58],
    ],
    "#f2f6f5",
    { alpha: 0.75, jitter: 1.1 },
  );
  // the lake
  s.fill(
    [
      [0.0, 0.6],
      [1.0, 0.62],
      [1.0, 1.0],
      [0.0, 1.0],
    ],
    PALETTE.lake,
    { alpha: 0.8, jitter: 0.7 },
  );
  for (let i = 0; i < 6; i++) {
    const y = 0.68 + i * 0.05;
    s.line(0.12 + (i % 2) * 0.2, y, 0.42 + (i % 2) * 0.2, y, { w: 1.2, alpha: 0.22 });
  }
  // the bare tree out of the middle of the lake
  s.stroke(
    [
      [0.52, 0.88],
      [0.53, 0.72],
      [0.5, 0.62],
    ],
    { w: 2.2, rough: 1.4 },
  );
  s.stroke(
    [
      [0.52, 0.74],
      [0.58, 0.68],
    ],
    { w: 1.6, rough: 1.3 },
  );
  s.stroke(
    [
      [0.51, 0.66],
      [0.46, 0.62],
    ],
    { w: 1.4, rough: 1.3 },
  );
  s.mark("lake", [
    [0.36, 0.5],
    [0.7, 0.5],
    [0.7, 0.96],
    [0.36, 0.96],
  ], 0.02);

  // a signpost by the lake, for the days spent elsewhere
  s.line(0.82, 0.6, 0.82, 0.9, { w: 2 });
  s.stroke(
    [
      [0.82, 0.62],
      [0.95, 0.655],
      [0.82, 0.69],
    ],
    { w: 1.6, closed: true },
  );
  s.mark("elsewhere", [
    [0.79, 0.58],
    [0.96, 0.58],
    [0.96, 0.72],
    [0.79, 0.72],
  ], 0.02);
}

/** Floor: a road going away. */
export function drawFloor(s: Sketch) {
  s.washAll("#e9e4d8", 0.5);
  s.fill(
    [
      [0.36, 0.1],
      [0.64, 0.1],
      [0.86, 0.9],
      [0.14, 0.9],
    ],
    "#cfc6b4",
    { alpha: 0.65, jitter: 0.8 },
  );
  s.stroke(
    [
      [0.36, 0.1],
      [0.64, 0.1],
      [0.86, 0.9],
      [0.14, 0.9],
    ],
    { w: 1.6, closed: true, alpha: 0.6 },
  );
  // centre line
  for (let i = 0; i < 5; i++) {
    const t0 = i / 5;
    const t1 = t0 + 0.1;
    const y0 = 0.1 + t0 * 0.8;
    const y1 = 0.1 + t1 * 0.8;
    const x0 = 0.5 + (0.5 - 0.5) * (y0 - 0.1) * 0.72;
    const x1 = 0.5 + (0.5 - 0.5) * (y1 - 0.1) * 0.72;
    s.line(x0, y0, x1, y1, { w: 1.6, alpha: 0.4 });
  }
  s.label("SOMEWHERE ELSE", 0.5, 0.52, 0.036, { mono: true, alpha: 0.45 });
}

/** The pop-up: the far shore, seen as a cut-out. */
export function drawPop(s: Sketch) {
  const card = [
    [0.1, 0.2],
    [0.9, 0.16],
    [0.92, 0.8],
    [0.08, 0.84],
  ];
  s.fill(card, "#f2efe6", { alpha: 0.96, mask: true, jitter: 0.5 });
  s.stroke(card, { w: 2, closed: true });
  // lake and tree inside the card
  s.fill(
    [
      [0.14, 0.55],
      [0.88, 0.52],
      [0.88, 0.8],
      [0.14, 0.82],
    ],
    PALETTE.lake,
    { alpha: 0.75, jitter: 0.6 },
  );
  s.stroke(
    [
      [0.52, 0.76],
      [0.53, 0.6],
      [0.49, 0.48],
    ],
    { w: 1.8, rough: 1.3 },
  );
  s.circle(0.49, 0.46, 0.02, { w: 1.4 });
  s.fill(
    [
      [0.16, 0.3],
      [0.44, 0.28],
      [0.44, 0.46],
      [0.16, 0.48],
    ],
    "#e9dccb",
    { alpha: 0.8, jitter: 0.5 },
  );
  s.stroke(
    [
      [0.16, 0.3],
      [0.44, 0.28],
      [0.44, 0.46],
      [0.16, 0.48],
    ],
    { w: 1.4, closed: true },
  );
  s.label("FOG", 0.3, 0.39, 0.034, { mono: true, alpha: 0.5 });
  s.mark("lake-card", card, 0.02);
}
