/**
 * Book state.
 *
 * A single mutable object that the render loop reads and writes. Nothing here
 * triggers a React render: the animation runs inside `useFrame` and the DOM
 * overlay is updated by writing transforms directly, so a scene change never
 * re-renders the tree.
 */

export type BookState = {
  /** 0 = shut, 1 = open. */
  open: number;
  openTarget: number;
  /** Continuous room index the book is turning towards. */
  focus: number;
  focusTarget: number;
  /** Camera push in on a hotspot, 0..1. */
  zoom: number;
  zoomTarget: number;
  /** World position the camera pushes towards. */
  zoomAt: [number, number, number];
};

export const book: BookState = {
  open: 0,
  openTarget: 0,
  focus: 0,
  focusTarget: 0,
  zoom: 0,
  zoomTarget: 0,
  zoomAt: [0, 0, 0],
};

/** True while any of the animated values is still moving. */
export function isMoving(b: BookState) {
  return (
    Math.abs(b.openTarget - b.open) > 0.0005 ||
    Math.abs(b.focusTarget - b.focus) > 0.0005 ||
    Math.abs(b.zoomTarget - b.zoom) > 0.0005
  );
}

/** Frame rate independent damping. */
export const damp = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));
