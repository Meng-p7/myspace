/**
 * Geometry of the pop-up book.
 *
 * The book is a half fan of pages that all hinge on one vertical spine at the
 * origin. Page k stands at angle `phi[k]`; the room that lives between page k
 * and page k+1 is a corner whose two walls are those pages and whose floor is
 * a square creased along its diagonal. When the two walls stand at a right
 * angle the floor lies flat; as they close the crease lifts and the floor
 * becomes a tent.
 *
 *   page 0            page 1            page 2           page N
 *   |                 |                 |                |
 *   +-- room 0 -------+-- room 1 --------+-- room 2 ------+-- room 3
 *
 * Re-derived for MySpace: the reference implementation put the fan in a fixed
 * half circle; here the focus room always gets the full right angle and the
 * remaining rooms share what is left, which lets the book collapse into a
 * tidy stack on a phone and fan out on a desktop.
 */

export const ROOM_COUNT = 4;
/** Page size: one room is one page wide and one page tall. */
export const PAGE_W = 1;
export const PAGE_H = 1;
const RIGHT_ANGLE = Math.PI / 2;

/** Smoothstep, the easing used everywhere in the book. */
export const smooth = (x: number): number => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

/** Unit vector along a page, measured from +x towards +z. */
export const dirOf = (a: number): [number, number, number] => [Math.cos(a), 0, Math.sin(a)];

/** Unit vector pointing away from a page, into the room on its +angle side. */
export const normalOf = (a: number): [number, number, number] => [-Math.sin(a), 0, Math.cos(a)];

/** 1 when room `i` is the focused one, 0 when it is far away. */
export const focusOf = (i: number, focus: number): number => smooth(1 - Math.abs(i - focus));

/**
 * Page angles for a focus position and how far the book is open.
 *
 * @param focus  continuous room index, 0 .. ROOM_COUNT-1
 * @param open   0 = shut, 1 = open
 * @param spread how much angle the non focused rooms keep. 1 fans the whole
 *               book out, 0 folds them onto the focused room so a phone only
 *               ever shows one corner.
 */
export function pageAngles(focus: number, open: number, spread = 1): number[] {
  // The focused room always gets the full right angle; the rest of the half
  // circle is shared between the other rooms, and how much of it they keep is
  // what `spread` controls (0 folds them flat on a phone, 1 fans the book out).
  const focusWeight: number[] = [];
  const restWeight: number[] = [];
  let focusSum = 0;
  let restSum = 0;
  for (let i = 0; i < ROOM_COUNT; i++) {
    const distance = Math.abs(i - focus);
    const near = smooth(1 - distance);
    focusWeight.push(near);
    focusSum += near;
    const far = (1 - near) * Math.exp(-0.9 * distance) + 1e-4;
    restWeight.push(far);
    restSum += far;
  }
  const spare = Math.PI - RIGHT_ANGLE * focusSum;
  const phi = [0];
  for (let i = 0; i < ROOM_COUNT; i++) {
    const step = RIGHT_ANGLE * focusWeight[i] + ((spare * restWeight[i]) / restSum) * spread;
    phi.push(phi[i] + step * open);
  }
  return phi;
}

/** Angle the camera should look along for the given focus. */
export function focusAngle(phi: number[], focus: number): number {
  const i0 = Math.max(0, Math.min(ROOM_COUNT - 2, Math.floor(focus)));
  const frac = Math.max(0, Math.min(1, focus - i0));
  const a = (phi[i0] + phi[i0 + 1]) / 2;
  const b = (phi[i0 + 1] + phi[i0 + 2]) / 2;
  return a + (b - a) * frac;
}

/**
 * Apex of the creased floor between two walls.
 * The floor is a square folded along its diagonal, so the apex sits where the
 * distance to both wall edges is exactly one page.
 */
export function floorApex(a: number, b: number): [number, number, number] {
  const theta = Math.min(b - a, RIGHT_ANGLE);
  const u = dirOf((a + b) / 2);
  const x = PAGE_W / Math.cos(theta / 2);
  const y = Math.sqrt(Math.max(0, 2 * PAGE_W * PAGE_W - x * x));
  return [u[0] * x, y, u[2] * x];
}

/** 0 when the room is shut, 1 when its walls stand at a right angle. */
export function roomOpenness(phi: number[], room: number): number {
  return Math.min(1, (phi[room + 1] - phi[room]) / RIGHT_ANGLE);
}

/** Logical room index (0 = first room) and its physical slot in the fan. */
export const physicalOf = (logical: number): number => ROOM_COUNT - 1 - logical;
export const logicalOf = (physical: number): number => ROOM_COUNT - 1 - physical;
