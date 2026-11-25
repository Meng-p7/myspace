/**
 * The artwork of the book.
 *
 * Every scene draws three surfaces (left wall, right wall, floor) and a
 * couple of pop-up cards that stand up out of the floor.
 *
 * A pop-up is placed with `at: [s, t]`, the point on the floor measured along
 * the two walls of the room, in page units.
 */

import type { DrawFn } from "../core/surface";
import type { Sketch } from "../core/sketch";
import { PALETTE } from "./scene01";
import * as s1 from "./scene01";
import * as s2 from "./scene02";
import * as s3 from "./scene03";
import * as s4 from "./scene04";

export type PopupArt = {
  draw: DrawFn;
  /** Side length of the square card, in page units. */
  size: number;
  at: [number, number];
  /** Paper margin around the cut-out, 0 for a flat card. */
  halo?: number;
};

export type SceneArt = {
  left: DrawFn;
  right: DrawFn;
  floor: DrawFn;
  popups: PopupArt[];
  /** Which page a drawn object opens, keyed by the mark name in the drawing. */
  spots: Record<string, string>;
};

export const SCENE_ART: SceneArt[] = [
  {
    left: s1.drawLeft,
    right: s1.drawRight,
    floor: s1.drawFloor,
    popups: [{ draw: s1.drawPop, size: 0.52, at: [0.5, 0.52], halo: 10 }],
    spots: { window: "p01", servo: "p02" },
  },
  {
    left: s2.drawLeft,
    right: s2.drawRight,
    floor: s2.drawFloor,
    popups: [{ draw: s2.drawPop, size: 0.56, at: [0.52, 0.55], halo: 10 }],
    spots: { whiteboard: "p03", humanoid: "p04" },
  },
  {
    left: s3.drawLeft,
    right: s3.drawRight,
    floor: s3.drawFloor,
    popups: [{ draw: s3.drawPop, size: 0.5, at: [0.5, 0.5], halo: 10 }],
    spots: { window: "p05", "height-chart": "p06", us: "p06" },
  },
  {
    left: s4.drawLeft,
    right: s4.drawRight,
    floor: s4.drawFloor,
    popups: [{ draw: s4.drawPop, size: 0.54, at: [0.5, 0.52], halo: 10 }],
    spots: { "night-city": "p07", elsewhere: "p08", lake: "p09", "lake-card": "p10" },
  },
];

/** The outside of the front cover. */
export function drawFrontCover(k: Sketch) {
  k.washAll(PALETTE.night, 0.92);
  // a warm panel of light on the cover
  k.glow(0.5, 0.34, 0.42, "#3d5a8c", 0.55);

  const frame = [
    [0.12, 0.1],
    [0.88, 0.1],
    [0.88, 0.88],
    [0.12, 0.88],
  ];
  k.stroke(frame, { w: 1.4, closed: true, alpha: 0.35 });
  const inner = [
    [0.15, 0.13],
    [0.85, 0.13],
    [0.85, 0.85],
    [0.15, 0.85],
  ];
  k.stroke(inner, { w: 0.9, closed: true, alpha: 0.22 });

  // the owner's mark, stamped in foil so it reads against the dark board
  k.foil("MOON", 0.5, 0.44, 0.15);
  k.foil("2026", 0.5, 0.6, 0.05, "#cbb894", true);

  // a small constellation
  const dots: [number, number][] = [
    [0.28, 0.24],
    [0.36, 0.3],
    [0.44, 0.22],
    [0.52, 0.3],
    [0.6, 0.2],
  ];
  k.stroke(dots, { w: 1, alpha: 0.35 });
  dots.forEach(([x, y], i) => {
    k.circle(x, y, i % 2 ? 0.008 : 0.012, { w: 1.2, alpha: 0.6 });
  });

  // the page edges peeking out at the bottom
  k.fill(
    [
      [0.06, 0.9],
      [0.94, 0.9],
      [0.94, 0.95],
      [0.06, 0.95],
    ],
    "#efe8d8",
    { alpha: 0.85, jitter: 0.3 },
  );
  for (let i = 0; i < 5; i++) {
    k.line(0.07, 0.905 + i * 0.009, 0.93, 0.905 + i * 0.009, { w: 0.8, alpha: 0.35 });
  }
}

/** The inside of the back cover. */
export function drawBackCover(k: Sketch) {
  k.washAll("#efe9dc", 0.5);
  k.stroke(
    [
      [0.18, 0.56],
      [0.82, 0.56],
    ],
    { w: 1.1, alpha: 0.3 },
  );
}
