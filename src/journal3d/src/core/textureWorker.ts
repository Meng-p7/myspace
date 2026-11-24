/**
 * Worker that draws the book.
 *
 * Every surface is a stack of canvases and a texture upload; doing that on the
 * main thread is what makes a page like this stutter on a phone. Here it all
 * happens off thread and only the finished bitmaps travel back.
 */

import { bakeSurface, offscreenCanvasFactory } from "./surface";
import { SCENE_ART, drawBackCover, drawFrontCover } from "../scenes";
import type { Rect } from "./sketch";

export type SurfacePayloadMsg = {
  key: string;
  wash: ImageBitmap | HTMLCanvasElement;
  alpha: ArrayBuffer;
  size: number;
  marks: Record<string, Rect>;
};

export type BuildRequest = {
  id: number;
  kind: "cover" | "scene";
  scene?: number;
  wallSize: number;
  popSize: number;
};

export type BuildResponse = {
  id: number;
  surfaces: SurfacePayloadMsg[];
};

const pack = (
  key: string,
  size: number,
  seed: number,
  draw: (s: any) => void,
  full: boolean,
  halo = 0,
): SurfacePayloadMsg => {
  const payload = bakeSurface(size, seed, draw, { full, halo, factory: offscreenCanvasFactory });
  return {
    key,
    wash: payload.wash as ImageBitmap,
    alpha: payload.alpha.buffer as ArrayBuffer,
    size: payload.size,
    marks: payload.marks,
  };
};

self.onmessage = (event: MessageEvent<BuildRequest>) => {
  const req = event.data;
  const surfaces: SurfacePayloadMsg[] = [];
  if (req.kind === "cover") {
    surfaces.push(pack("front", req.wallSize, 7, drawFrontCover, true));
    surfaces.push(pack("back", req.wallSize, 8, drawBackCover, true));
  } else {
    const art = SCENE_ART[req.scene ?? 0];
    const base = (req.scene ?? 0) * 10;
    surfaces.push(pack("left", req.wallSize, 100 + base, art.left, true));
    surfaces.push(pack("right", req.wallSize, 101 + base, art.right, true));
    surfaces.push(pack("floor", req.wallSize, 102 + base, art.floor, true));
    art.popups.forEach((popup, i) => {
      surfaces.push(
        pack(
          `popup${i}`,
          popup.halo ? req.wallSize : req.popSize,
          200 + base + i,
          popup.draw,
          false,
          popup.halo ?? 0,
        ),
      );
    });
  }
  const transfer: Transferable[] = [];
  for (const s of surfaces) {
    transfer.push(s.wash);
    transfer.push(s.alpha);
  }
  (self as unknown as Worker).postMessage({ id: req.id, surfaces } satisfies BuildResponse, transfer);
};
