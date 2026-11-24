/**
 * Scene 02 — The Lab.
 *
 * A quiet corner of a robotics lab: a whiteboard with a linkage, a monitor
 * running a training curve, shelves of actuators, and on the bench a
 * humanoid that nobody is talking to.
 */

import { PALETTE } from "./scene01";
import type { Sketch } from "../core/sketch";

/** Left wall: whiteboard and monitor. */
export function drawLeft(s: Sketch) {
  s.washAll("#eef2f4", 0.45);

  // whiteboard
  const board = [
    [0.06, 0.08],
    [0.56, 0.08],
    [0.56, 0.58],
    [0.06, 0.58],
  ];
  s.fill(board, "#f7f8f6", { alpha: 0.9, jitter: 0.3 });
  s.stroke(board, { w: 2, closed: true });
  // linkage drawn on it
  s.circle(0.16, 0.28, 0.055, { w: 1.6, alpha: 0.85 });
  s.line(0.215, 0.28, 0.31, 0.19, { w: 1.8 });
  s.line(0.31, 0.19, 0.41, 0.34, { w: 1.6 });
  s.circle(0.31, 0.19, 0.016, { w: 1.6 });
  s.fill(
    [
      [0.395, 0.325],
      [0.425, 0.325],
      [0.425, 0.355],
      [0.395, 0.355],
    ],
    PALETTE.deepBlue,
    { alpha: 0.85 },
  );
  s.label("θ1 → θ2", 0.28, 0.45, 0.034, { mono: true, alpha: 0.5 });
  s.line(0.1, 0.53, 0.3, 0.5, { w: 1.2, alpha: 0.35 });
  s.mark("whiteboard", board, 0.02);

  // monitor with a training curve
  s.box(0.66, 0.16, 0.3, 0.24, "#e8ecef", { w: 1.8 });
  s.box(0.69, 0.19, 0.24, 0.18, "#f4f6f7", { w: 1.2 });
  s.stroke(
    [
      [0.7, 0.35],
      [0.74, 0.3],
      [0.79, 0.31],
      [0.84, 0.24],
      [0.9, 0.22],
    ],
    { w: 1.8, rough: 0.8 },
  );
  s.fill(
    [
      [0.7, 0.35],
      [0.74, 0.3],
      [0.79, 0.31],
      [0.84, 0.24],
      [0.9, 0.22],
      [0.9, 0.36],
      [0.7, 0.36],
    ],
    PALETTE.blue,
    { alpha: 0.35 },
  );
  s.line(0.8, 0.37, 0.8, 0.42, { w: 1.6, alpha: 0.7 });
  s.box(0.74, 0.42, 0.12, 0.03, "#d8dee2", { w: 1.4 });

  // bench
  s.fill(
    [
      [0.0, 0.76],
      [1.0, 0.72],
      [1.0, 1.0],
      [0.0, 1.0],
    ],
    "#e3e6e8",
    { alpha: 0.6, jitter: 0.6 },
  );
  s.line(0.0, 0.76, 1.0, 0.72, { w: 2.2 });
}

/** Right wall: shelves of actuators and a hanging arm. */
export function drawRight(s: Sketch) {
  s.washAll("#f0f2f3", 0.45);

  // shelf brackets
  for (const y of [0.26, 0.52]) {
    s.line(0.12, y, 0.72, y - 0.01, { w: 2 });
    s.line(0.12, y, 0.1, y + 0.08, { w: 1.4, alpha: 0.7 });
  }

  // servo motors on the shelf
  s.box(0.2, 0.16, 0.1, 0.1, PALETTE.blue, { w: 1.6 });
  s.box(0.34, 0.17, 0.09, 0.09, "#cdd4d8", { w: 1.6 });
  s.box(0.47, 0.15, 0.11, 0.11, PALETTE.amber, { w: 1.6 });
  s.line(0.2, 0.26, 0.2, 0.24, { w: 1.6, alpha: 0.7 });

  // boxes on the second shelf
  s.box(0.18, 0.42, 0.16, 0.1, "#e6ddcb", { w: 1.5 });
  s.box(0.38, 0.43, 0.12, 0.09, "#ded6c4", { w: 1.5 });
  s.label("ACT", 0.26, 0.47, 0.032, { mono: true, alpha: 0.45 });

  // an arm folded on the wall
  s.stroke(
    [
      [0.62, 0.66],
      [0.7, 0.54],
      [0.78, 0.6],
      [0.86, 0.48],
    ],
    { w: 2.6 },
  );
  s.circle(0.7, 0.54, 0.026, { w: 1.8 });
  s.circle(0.78, 0.6, 0.022, { w: 1.8 });
  s.circle(0.86, 0.48, 0.03, { w: 2 });
  s.fill(
    [
      [0.845, 0.465],
      [0.875, 0.465],
      [0.875, 0.495],
      [0.845, 0.495],
    ],
    PALETTE.deepBlue,
    { alpha: 0.85 },
  );

  // bench
  s.fill(
    [
      [0.0, 0.78],
      [1.0, 0.74],
      [1.0, 1.0],
      [0.0, 1.0],
    ],
    "#e3e6e8",
    { alpha: 0.55, jitter: 0.6 },
  );
  s.line(0.0, 0.78, 1.0, 0.74, { w: 2.2 });
}

/** Floor: the lab bench with a cable run. */
export function drawFloor(s: Sketch) {
  s.washAll("#eceef0", 0.5);
  s.stroke(
    [
      [0.06, 0.12],
      [0.94, 0.12],
      [0.94, 0.88],
      [0.06, 0.88],
    ],
    { w: 2, closed: true },
  );
  // cables running across the bench
  s.stroke(
    [
      [0.1, 0.72],
      [0.28, 0.6],
      [0.5, 0.68],
      [0.72, 0.56],
      [0.9, 0.62],
    ],
    { w: 2.4, rough: 1.5, alpha: 0.75 },
  );
  s.stroke(
    [
      [0.16, 0.82],
      [0.36, 0.74],
      [0.58, 0.8],
      [0.84, 0.72],
    ],
    { w: 1.8, rough: 1.5, alpha: 0.55 },
  );
  // a torque plot sketched on the bench
  s.line(0.2, 0.34, 0.44, 0.28, { w: 1.4, alpha: 0.45 });
  s.line(0.2, 0.34, 0.2, 0.2, { w: 1.4, alpha: 0.45 });
  s.line(0.24, 0.32, 0.3, 0.26, { w: 1.6, alpha: 0.5 });
  s.line(0.3, 0.26, 0.38, 0.29, { w: 1.6, alpha: 0.5 });
}

/** The pop-up: the humanoid, sitting quietly. */
export function drawPop(s: Sketch) {
  // torso
  const torso = [
    [0.34, 0.36],
    [0.66, 0.36],
    [0.62, 0.72],
    [0.38, 0.72],
  ];
  s.fill(torso, "#f4f2ec", { alpha: 0.96, mask: true, jitter: 0.3 });
  s.stroke(torso, { w: 2.2, closed: true });
  // head
  s.fill(
    [
      [0.42, 0.18],
      [0.58, 0.18],
      [0.57, 0.34],
      [0.43, 0.34],
    ],
    "#f4f2ec",
    { alpha: 0.96, mask: true },
  );
  s.stroke(
    [
      [0.42, 0.18],
      [0.58, 0.18],
      [0.57, 0.34],
      [0.43, 0.34],
    ],
    { w: 2, closed: true },
  );
  s.circle(0.47, 0.26, 0.012, { w: 1.6 });
  s.circle(0.55, 0.26, 0.012, { w: 1.6 });
  // arms folded in the lap
  s.stroke(
    [
      [0.38, 0.46],
      [0.3, 0.62],
      [0.5, 0.68],
    ],
    { w: 2.4 },
  );
  s.stroke(
    [
      [0.62, 0.46],
      [0.7, 0.62],
      [0.52, 0.68],
    ],
    { w: 2.4 },
  );
  // knees
  s.stroke(
    [
      [0.42, 0.72],
      [0.4, 0.86],
      [0.62, 0.86],
      [0.6, 0.72],
    ],
    { w: 2.2 },
  );
  s.label("150 TRIALS", 0.5, 0.95, 0.036, { mono: true, alpha: 0.5 });
  s.mark("humanoid", torso, 0.02);
}
