/**
 * Turns a drawing function into the two textures the paper shader needs.
 *
 * Runs identically on the main thread and inside a Worker: the only
 * difference is who creates the canvases.
 */

import { Sketch, type Canvas2D, type CanvasLike, type Pt, type Rect } from "./sketch";

export type SurfacePayload = {
  size: number;
  /** The watercolour sheet, uploaded straight to the GPU. */
  wash: ImageBitmap | HTMLCanvasElement;
  /** Single channel: 0 = not paper, 0.5 = plain paper, 1 = inked paper. */
  alpha: Uint8Array;
  marks: Record<string, Rect>;
};

export type CanvasFactory = (size: number) => CanvasLike;

export const domCanvasFactory: CanvasFactory = (size) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  return c;
};

export const offscreenCanvasFactory: CanvasFactory = (size) => new OffscreenCanvas(size, size);

export type DrawFn = (s: Sketch) => void;

function ctx2d(c: CanvasLike): Canvas2D {
  return c.getContext("2d", { willReadFrequently: true }) as Canvas2D;
}

/** Grows a mask by r pixels so the pop-up gets a paper margin. */
function dilate(src: CanvasLike, dst: CanvasLike, r: number) {
  const c = ctx2d(dst);
  c.clearRect(0, 0, dst.width, dst.height);
  for (const rr of [r * 0.5, r]) {
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      c.drawImage(src, Math.cos(a) * rr, Math.sin(a) * rr);
    }
  }
  c.drawImage(src, 0, 0);
}

/**
 * Draw a surface and pack it.
 *
 * @param full  mark every pixel as paper (walls, floors). Pop-up cards leave
 *              the mask to their own silhouette.
 * @param halo  paper margin width for a pop-up cut-out, 0 for flat surfaces.
 */
export function bakeSurface(
  size: number,
  seed: number,
  draw: DrawFn,
  opts: { full?: boolean; halo?: number; factory?: CanvasFactory } = {},
): SurfacePayload {
  const factory = opts.factory ?? domCanvasFactory;
  const inkCanvas = factory(size);
  const washCanvas = factory(size);
  const maskCanvas = factory(size);

  const ink = ctx2d(inkCanvas);
  const wash = ctx2d(washCanvas);
  const mask = ctx2d(maskCanvas);

  ink.clearRect(0, 0, size, size);
  mask.clearRect(0, 0, size, size);
  wash.globalCompositeOperation = "source-over";
  wash.globalAlpha = 1;
  wash.fillStyle = "#fff";
  wash.fillRect(0, 0, size, size);

  const sketch = new Sketch(ink, wash, mask, size, seed);
  if (opts.full) {
    // walls and floors are paper everywhere
    mask.fillStyle = "#fff";
    mask.fillRect(0, 0, size, size);
  }
  draw(sketch);

  if (opts.halo && opts.halo > 0) {
    const r = opts.halo * (size / 768);
    const grown = factory(size);
    dilate(maskCanvas, grown, r);
    // the paper margin becomes part of the cut-out
    mask.clearRect(0, 0, size, size);
    mask.drawImage(grown, 0, 0);
    // a soft shaded rim where the paper was cut
    wash.save();
    wash.globalCompositeOperation = "multiply";
    wash.globalAlpha = 0.22;
    wash.fillStyle = "rgba(120, 112, 160, 1)";
    wash.drawImage(grown, 0, 0);
    wash.restore();
  }

  // alpha = mask ? 0.5 + ink/2 : 0
  // The two channels are read back and combined here rather than with canvas
  // compositing, which proved unreliable across backends. This runs inside the
  // worker, so the main thread never waits for it.
  const inkPixels = ink.getImageData(0, 0, size, size).data;
  const maskPixels = mask.getImageData(0, 0, size, size).data;
  const channel = new Uint8Array(size * size);
  for (let i = 0, j = 0; i < inkPixels.length; i += 4, j += 1) {
    channel[j] = maskPixels[i + 3] > 127 ? 128 + (inkPixels[i + 3] >> 1) : 0;
  }

  const washOut =
    typeof (washCanvas as OffscreenCanvas).transferToImageBitmap === "function"
      ? (washCanvas as OffscreenCanvas).transferToImageBitmap()
      : (washCanvas as HTMLCanvasElement);

  return { size, wash: washOut, alpha: channel, marks: sketch.marks };
}

/** Small helper the scene painters use for a photo-like rectangle. */
export function photoFrame(s: Sketch, x: number, y: number, w: number, h: number, tone = "#d9d2c2") {
  s.box(x, y, w, h, tone, { w: 1.4, rough: 0.8 });
  s.fill(
    [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ],
    "#efe9dc",
    { alpha: 0.5, jitter: 0.4 },
  );
}

export type { Pt, Rect };
