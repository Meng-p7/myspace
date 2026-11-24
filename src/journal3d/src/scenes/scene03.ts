/**
 * Scene 03 — With Her.
 *
 * The warmest room in the book: an evening window, a plant that leans towards
 * the light, a height chart with pencil marks on it, and a rug.
 */

import { PALETTE } from "./scene01";
import type { Sketch } from "../core/sketch";

/** Left wall: the window and the plant. */
export function drawLeft(s: Sketch) {
  s.washAll("#f7efe6", 0.55);

  // window with an evening sky
  const win = [
    [0.1, 0.1],
    [0.5, 0.1],
    [0.5, 0.64],
    [0.1, 0.64],
  ];
  s.fill(win, "#f0d7b4", { alpha: 0.7, jitter: 0.8 });
  s.stroke(win, { w: 2.2, closed: true });
  s.line(0.3, 0.1, 0.3, 0.64, { w: 1.5, alpha: 0.8 });
  s.line(0.1, 0.37, 0.5, 0.37, { w: 1.5, alpha: 0.8 });
  // low sun
  s.circle(0.2, 0.5, 0.05, { w: 1.8 });
  s.glow(0.2, 0.5, 0.14, "#f7d9a0", 0.55);
  s.mark("window", win, 0.02);

  // plant in the corner
  s.shape(
    [
      [0.62, 0.56],
      [0.78, 0.56],
      [0.75, 0.7],
      [0.65, 0.7],
    ],
    "#e2c7a8",
    { w: 1.8 },
  );
  s.stroke(
    [
      [0.7, 0.56],
      [0.68, 0.44],
      [0.72, 0.34],
    ],
    { w: 2, rough: 1.2 },
  );
  s.blob(0.66, 0.42, 0.06, 0.035, PALETTE.sage, { w: 1.5 });
  s.blob(0.74, 0.38, 0.055, 0.032, PALETTE.sage, { w: 1.5 });
  s.blob(0.71, 0.3, 0.05, 0.03, "#a8c0a4", { w: 1.5 });

  // floor line
  s.line(0.0, 0.8, 1.0, 0.76, { w: 2 });
}

/** Right wall: the height chart and a strip of photos. */
export function drawRight(s: Sketch) {
  s.washAll("#f6ece2", 0.5);

  // height chart
  const chart = [
    [0.12, 0.08],
    [0.4, 0.08],
    [0.4, 0.74],
    [0.12, 0.74],
  ];
  s.fill(chart, "#fbf7f0", { alpha: 0.92, jitter: 0.3 });
  s.stroke(chart, { w: 2, closed: true });
  for (let i = 0; i < 8; i++) {
    const y = 0.13 + i * 0.075;
    s.line(0.12, y, 0.18, y, { w: 1.3, alpha: 0.55 });
    s.line(0.12, y, 0.4, y, { w: 0.7, alpha: 0.18 });
  }
  // two pencil marks
  s.line(0.2, 0.31, 0.38, 0.305, { w: 1.6, alpha: 0.75 });
  s.line(0.22, 0.44, 0.38, 0.435, { w: 1.6, alpha: 0.75 });
  s.label("165", 0.235, 0.29, 0.028, { mono: true, alpha: 0.5 });
  s.label("171", 0.245, 0.42, 0.028, { mono: true, alpha: 0.5 });
  s.mark("height-chart", chart, 0.02);

  // photo strip
  for (let i = 0; i < 3; i++) {
    const x = 0.5 + i * 0.15;
    s.fill(
      [
        [x, 0.12],
        [x + 0.12, 0.12],
        [x + 0.12, 0.26],
        [x, 0.26],
      ],
      i === 1 ? PALETTE.rose : "#e5ded2",
      { alpha: 0.8, jitter: 0.4 },
    );
    s.stroke(
      [
        [x, 0.12],
        [x + 0.12, 0.12],
        [x + 0.12, 0.26],
        [x, 0.26],
      ],
      { w: 1.4, closed: true },
    );
  }
  s.line(0.5, 0.1, 0.93, 0.09, { w: 1.4, alpha: 0.6 });

  // a mug of tea
  s.shape(
    [
      [0.56, 0.62],
      [0.66, 0.62],
      [0.655, 0.74],
      [0.565, 0.74],
    ],
    "#f6f0e4",
    { w: 1.8 },
  );
  s.line(0.575, 0.63, 0.645, 0.63, { w: 1.3, alpha: 0.6 });

  s.line(0.0, 0.8, 1.0, 0.76, { w: 2 });
}

/** Floor: a rug and a pair of slippers. */
export function drawFloor(s: Sketch) {
  s.washAll("#f3e7d8", 0.55);
  const rug = [
    [0.18, 0.24],
    [0.82, 0.2],
    [0.86, 0.74],
    [0.14, 0.78],
  ];
  s.fill(rug, "#e4cbc4", { alpha: 0.45, jitter: 0.7 });
  s.stroke(rug, { w: 1.8, closed: true });
  s.stroke(
    [
      [0.24, 0.3],
      [0.78, 0.26],
      [0.81, 0.68],
      [0.21, 0.72],
    ],
    { w: 1.1, closed: true, alpha: 0.5 },
  );
  // slippers
  s.blob(0.36, 0.86, 0.05, 0.028, "#d9cbb6", { w: 1.5 });
  s.blob(0.48, 0.88, 0.05, 0.028, "#d9cbb6", { w: 1.5 });
}

/** The pop-up: two figures side by side, measured. */
export function drawPop(s: Sketch) {
  const figure = (x: number, h: number, tone: string) => {
    s.fill(
      [
        [x - 0.045, 0.82 - h],
        [x + 0.045, 0.82 - h],
        [x + 0.05, 0.82],
        [x - 0.05, 0.82],
      ],
      "#f7f3ec",
      { alpha: 0.96, mask: true },
    );
    s.stroke(
      [
        [x - 0.045, 0.82 - h],
        [x + 0.045, 0.82 - h],
        [x + 0.05, 0.82],
        [x - 0.05, 0.82],
      ],
      { w: 1.8, closed: true },
    );
    s.circle(x, 0.82 - h - 0.035, 0.036, { w: 1.8 });
    s.fill(
      [
        [x - 0.03, 0.82 - h - 0.06],
        [x + 0.03, 0.82 - h - 0.06],
        [x + 0.03, 0.82 - h - 0.01],
        [x - 0.03, 0.82 - h - 0.01],
      ],
      tone,
      { alpha: 0.8 },
    );
  };
  figure(0.4, 0.42, PALETTE.deepBlue);
  figure(0.6, 0.36, PALETTE.rose);
  // the measuring tape between them
  s.line(0.4, 0.46, 0.6, 0.44, { w: 1.2, alpha: 0.5 });
  s.label("171 / 165", 0.5, 0.52, 0.032, { mono: true, alpha: 0.5 });
  s.mark("us", [
    [0.32, 0.3],
    [0.68, 0.3],
    [0.68, 0.84],
    [0.32, 0.84],
  ], 0.02);
}
