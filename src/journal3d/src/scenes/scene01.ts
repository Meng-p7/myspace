/**
 * Scene 01 — First Build.
 *
 * The corner of a workbench at night: a pegboard of tools, a window with the
 * dark outside, and on the bench a servo, a dev board and a nest of jumper
 * wires that a small robot head is wired to.
 */

import type { Sketch } from "../core/sketch";

export const PALETTE = {
  ochre: "#e6c79c",
  amber: "#d9a566",
  blue: "#7f9fd0",
  deepBlue: "#3f5f96",
  sage: "#b9cdb6",
  rose: "#e4bdb8",
  night: "#33405c",
  lake: "#8ec2ba",
  wood: "#d8bd97",
  ink: "#232c38",
};

/** Left wall: the dark window and the shelf above the bench. */
export function drawLeft(s: Sketch) {
  s.washAll("#eef1f6", 0.5);

  // window, night outside
  const win = [
    [0.08, 0.12],
    [0.46, 0.12],
    [0.46, 0.62],
    [0.08, 0.62],
  ];
  s.fill(win, PALETTE.night, { alpha: 0.72, jitter: 0.6 });
  s.stroke(win, { w: 2.2, closed: true });
  s.line(0.27, 0.12, 0.27, 0.62, { w: 1.4, alpha: 0.8 });
  s.line(0.08, 0.37, 0.46, 0.37, { w: 1.4, alpha: 0.8 });
  // a few stars and a moon
  s.circle(0.37, 0.22, 0.035, { w: 1.6, alpha: 0.7 });
  s.glow(0.37, 0.22, 0.09, "#f5e3b8", 0.5);
  for (const [x, y] of [
    [0.14, 0.2],
    [0.19, 0.28],
    [0.4, 0.46],
    [0.15, 0.48],
  ]) {
    s.star(x, y, 0.016, { w: 1.1, alpha: 0.55 });
  }
  s.mark("window", win, 0.02);

  // shelf
  s.box(0.56, 0.3, 0.38, 0.035, PALETTE.wood, { w: 1.8 });
  s.box(0.58, 0.19, 0.13, 0.11, "#e3d6bd", { w: 1.5 });
  s.box(0.74, 0.21, 0.09, 0.09, "#dccfb6", { w: 1.5 });
  s.line(0.86, 0.18, 0.9, 0.29, { w: 1.4, alpha: 0.7 });

  // bench top running along the bottom
  s.fill(
    [
      [0.0, 0.78],
      [1.0, 0.74],
      [1.0, 1.0],
      [0.0, 1.0],
    ],
    PALETTE.wood,
    { alpha: 0.5, jitter: 0.8 },
  );
  s.line(0.0, 0.78, 1.0, 0.74, { w: 2.2 });
  s.hatch(
    [
      [0.0, 0.8],
      [1.0, 0.76],
      [1.0, 1.0],
      [0.0, 1.0],
    ],
    0.05,
    -0.5,
    1.1,
    0.3,
  );
}

/** Right wall: the pegboard with tools and a half-built chassis. */
export function drawRight(s: Sketch) {
  s.washAll("#f3efe6", 0.45);

  // pegboard
  const board = [
    [0.08, 0.1],
    [0.52, 0.1],
    [0.52, 0.66],
    [0.08, 0.66],
  ];
  s.fill(board, "#e9dfc9", { alpha: 0.55, jitter: 0.7 });
  s.stroke(board, { w: 2, closed: true });
  for (let y = 0.16; y < 0.64; y += 0.07) {
    for (let x = 0.13; x < 0.5; x += 0.06) {
      s.circle(x, y, 0.006, { w: 1, alpha: 0.35 });
    }
  }

  // a screwdriver and a spanner hanging on the board
  s.line(0.16, 0.2, 0.16, 0.42, { w: 2.6 });
  s.fill(
    [
      [0.145, 0.42],
      [0.175, 0.42],
      [0.17, 0.55],
      [0.15, 0.55],
    ],
    PALETTE.amber,
    { alpha: 0.85 },
  );
  s.stroke(
    [
      [0.3, 0.24],
      [0.3, 0.4],
    ],
    { w: 2.4 },
  );
  s.circle(0.3, 0.24, 0.028, { w: 2.2 });
  s.circle(0.36, 0.22, 0.024, { w: 2 });

  // the little chassis, drawn as a sketch pinned to the board
  s.stroke(
    [
      [0.36, 0.52],
      [0.44, 0.52],
      [0.44, 0.58],
      [0.36, 0.58],
    ],
    { w: 1.8, closed: true },
  );
  s.line(0.36, 0.55, 0.26, 0.5, { w: 1.4, alpha: 0.8 });
  s.line(0.44, 0.55, 0.54, 0.5, { w: 1.4, alpha: 0.8 });
  s.label("v0.1", 0.4, 0.63, 0.032, { mono: true, alpha: 0.55 });

  // bench
  s.fill(
    [
      [0.0, 0.8],
      [1.0, 0.76],
      [1.0, 1.0],
      [0.0, 1.0],
    ],
    PALETTE.wood,
    { alpha: 0.45, jitter: 0.7 },
  );
  s.line(0.0, 0.8, 1.0, 0.76, { w: 2.2 });

  // a mug of coffee going cold
  s.shape(
    [
      [0.72, 0.66],
      [0.82, 0.66],
      [0.815, 0.78],
      [0.725, 0.78],
    ],
    "#f2ece0",
    { w: 1.8 },
  );
  s.stroke(
    [
      [0.82, 0.69],
      [0.87, 0.7],
      [0.87, 0.74],
      [0.82, 0.75],
    ],
    { w: 1.5 },
  );
  s.line(0.73, 0.67, 0.815, 0.67, { w: 1.4, alpha: 0.7 });
}

/** Floor: the mat the electronics live on. */
export function drawFloor(s: Sketch) {
  s.washAll("#efe7d8", 0.55);
  s.stroke(
    [
      [0.06, 0.12],
      [0.94, 0.12],
      [0.94, 0.88],
      [0.06, 0.88],
    ],
    { w: 2, closed: true },
  );
  // cutting mat grid
  for (let i = 1; i < 9; i++) {
    s.line(0.06 + i * 0.098, 0.12, 0.06 + i * 0.098, 0.88, { w: 0.9, alpha: 0.22 });
  }
  for (let i = 1; i < 7; i++) {
    s.line(0.06, 0.12 + i * 0.108, 0.94, 0.12 + i * 0.108, { w: 0.9, alpha: 0.22 });
  }
  // loose jumper wires
  const wire = (pts: [number, number][], color: string) => {
    s.stroke(pts, { w: 2.2, alpha: 0.85, rough: 1.4 });
    s.fill(pts, color, { alpha: 0.35, jitter: 0.3 });
  };
  wire(
    [
      [0.2, 0.3],
      [0.34, 0.24],
      [0.48, 0.36],
      [0.62, 0.3],
    ],
    PALETTE.blue,
  );
  wire(
    [
      [0.26, 0.62],
      [0.4, 0.54],
      [0.55, 0.66],
      [0.7, 0.56],
    ],
    PALETTE.amber,
  );
  wire(
    [
      [0.34, 0.42],
      [0.46, 0.48],
      [0.58, 0.44],
    ],
    PALETTE.rose,
  );
}

/** The pop-up: the little robot head, wired to a servo. */
export function drawPop(s: Sketch) {
  const head = [
    [0.28, 0.42],
    [0.72, 0.42],
    [0.7, 0.76],
    [0.3, 0.76],
  ];
  s.fill(head, "#f3f1ea", { alpha: 0.95, mask: true, jitter: 0.4 });
  s.stroke(head, { w: 2.2, closed: true });
  // eyes
  s.circle(0.42, 0.56, 0.055, { w: 2.2 });
  s.circle(0.58, 0.56, 0.055, { w: 2.2 });
  s.fill(
    [
      [0.39, 0.545],
      [0.45, 0.545],
      [0.45, 0.575],
      [0.39, 0.575],
    ],
    PALETTE.deepBlue,
    { alpha: 0.85 },
  );
  s.fill(
    [
      [0.55, 0.545],
      [0.61, 0.545],
      [0.61, 0.575],
      [0.55, 0.575],
    ],
    PALETTE.deepBlue,
    { alpha: 0.85 },
  );
  // antenna
  s.line(0.5, 0.42, 0.5, 0.3, { w: 1.8 });
  s.circle(0.5, 0.285, 0.022, { w: 1.8 });
  // servo and board on the body
  s.box(0.36, 0.63, 0.12, 0.09, PALETTE.blue, { w: 1.6 });
  s.box(0.55, 0.64, 0.1, 0.08, "#cfd6c9", { w: 1.6 });
  s.stroke(
    [
      [0.48, 0.67],
      [0.55, 0.67],
    ],
    { w: 1.6, alpha: 0.8 },
  );
  s.label("3 MOVES", 0.5, 0.84, 0.038, { mono: true, alpha: 0.6 });
  s.mark("servo", head, 0.02);
}
