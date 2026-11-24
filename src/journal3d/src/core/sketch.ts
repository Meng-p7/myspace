/**
 * A tiny hand-drawn renderer for 2D surfaces.
 *
 * Every surface is drawn on three canvases:
 *   ink  – pen line art (only the alpha channel matters)
 *   wash – watercolour fills on white paper
 *   mask – which pixels are paper at all (used for the pop-up cut-outs)
 *
 * The two channels the shader needs are then combined on the GPU side:
 *   colour = the wash canvas, uploaded straight from the bitmap
 *   alpha  = mask ? 0.5 + ink/2 : 0
 *
 * The alpha channel is assembled with canvas compositing rather than a
 * per-pixel JavaScript loop: fill the alpha canvas with a half-transparent
 * white, draw the ink over it (alpha becomes 0.5 + ink/2), then intersect it
 * with the mask. Only one small read-back is left, and it happens inside a
 * worker so the page never stalls.
 *
 * The renderer is written against a canvas factory so it can run either on the
 * main thread or inside a Worker with OffscreenCanvas.
 */

export type Pt = number[];
export type Rect = [number, number, number, number];
type RNG = () => number;
export type Canvas2D = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
export type CanvasLike = OffscreenCanvas | HTMLCanvasElement;

export type StrokeOpts = {
  w?: number;
  closed?: boolean;
  rough?: number;
  alpha?: number;
  overshoot?: number;
  mask?: boolean;
};

export type FillOpts = { alpha?: number; mask?: boolean; jitter?: number };

/** Deterministic noise so a scene always draws itself the same way. */
function rng(seed: number): RNG {
  let a = seed >>> 0 || 1;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class Sketch {
  readonly size: number;
  readonly r: RNG;
  /** Bounding boxes of named clickable areas, in 0..1 canvas coordinates. */
  readonly marks: Record<string, Rect> = {};

  private ink: Canvas2D;
  private wash: Canvas2D;
  private mask: Canvas2D;
  private k: number;

  constructor(ink: Canvas2D, wash: Canvas2D, mask: Canvas2D, size: number, seed: number) {
    this.ink = ink;
    this.wash = wash;
    this.mask = mask;
    this.size = size;
    this.r = rng(seed);
    this.k = size / 768;
  }

  private px([x, y]: Pt): Pt {
    return [x * this.size, y * this.size];
  }

  /** A wobbly polyline through normalised points. */
  stroke(points: Pt[], o: StrokeOpts = {}) {
    const { w = 2.6, closed = false, rough = 1, alpha = 1, overshoot = 0.02, mask = false } = o;
    const pts = points.map((p) => this.px(p));
    if (closed) pts.push(pts[0]);
    const c = this.ink;
    const phase1 = this.r() * 100;
    const phase2 = this.r() * 100;
    const amp = 1.6 * rough * this.k;
    c.save();
    c.globalAlpha = alpha;
    c.strokeStyle = "#000";
    c.lineCap = "round";
    c.lineJoin = "round";

    const path: Pt[] = [];
    let dist = 0;
    for (let s = 0; s < pts.length - 1; s++) {
      const [x1, y1] = pts[s];
      const [x2, y2] = pts[s + 1];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const steps = Math.max(2, Math.ceil(len / (7 * this.k)));
      const t0 = s === 0 && !closed ? -overshoot : 0;
      const t1 = s === pts.length - 2 && !closed ? 1 + overshoot : 1;
      for (let j = 0; j <= steps; j++) {
        const t = t0 + ((t1 - t0) * j) / steps;
        const d = dist + t * len;
        const off = amp * (0.6 * Math.sin(phase1 + (d * 0.045) / this.k) + 0.4 * Math.sin(phase2 + (d * 0.13) / this.k));
        path.push([x1 + dx * t + nx * off, y1 + dy * t + ny * off]);
      }
      dist += len;
    }

    const lw = w * this.k * (0.9 + this.r() * 0.25);
    const trace = (ctx: Canvas2D) => {
      ctx.beginPath();
      path.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    };
    trace(c);
    c.lineWidth = lw;
    c.stroke();
    c.restore();

    if (mask) {
      const m = this.mask;
      m.save();
      m.strokeStyle = "#fff";
      m.lineCap = "round";
      m.lineJoin = "round";
      m.lineWidth = lw * 2.5;
      trace(m);
      m.stroke();
      m.restore();
    }
  }

  line(x1: number, y1: number, x2: number, y2: number, o: StrokeOpts = {}) {
    this.stroke(
      [
        [x1, y1],
        [x2, y2],
      ],
      o,
    );
  }

  rectPts(x: number, y: number, w: number, h: number): Pt[] {
    return [
      [x, y],
      [x + w, y],
      [x + w, y + h],
      [x, y + h],
    ];
  }

  ellipsePts(cx: number, cy: number, rx: number, ry: number, from = 0, to = Math.PI * 2, n = 40): Pt[] {
    const out: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const a = from + ((to - from) * i) / n;
      out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return out;
  }

  rect(x: number, y: number, w: number, h: number, o: StrokeOpts = {}) {
    this.stroke(this.rectPts(x, y, w, h), { ...o, closed: true });
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, o: StrokeOpts = {}) {
    const start = this.r() * Math.PI * 2;
    this.stroke(this.ellipsePts(cx, cy, rx, ry, start, start + Math.PI * 2.08), { ...o, overshoot: 0 });
  }

  circle(cx: number, cy: number, rad: number, o: StrokeOpts = {}) {
    this.ellipse(cx, cy, rad, rad, o);
  }

  /** Watercolour fill, multiplied over the paper and slightly mis-registered. */
  fill(points: Pt[], color: string, opts: FillOpts = {}) {
    const { alpha = 0.9, mask = false, jitter = 1 } = opts;
    const ox = (this.r() - 0.5) * 7 * this.k * jitter;
    const oy = (this.r() - 0.5) * 7 * this.k * jitter;
    const c = this.wash;
    c.save();
    c.globalCompositeOperation = "multiply";
    c.globalAlpha = alpha;
    c.fillStyle = color;
    c.beginPath();
    points.forEach((p, i) => {
      const [x, y] = this.px(p);
      if (i) c.lineTo(x + ox, y + oy);
      else c.moveTo(x + ox, y + oy);
    });
    c.closePath();
    c.fill();
    // pigment pooling along the edge
    c.globalAlpha = alpha * 0.32;
    c.strokeStyle = color;
    c.lineWidth = 5 * this.k;
    c.stroke();
    c.restore();
    if (mask) this.maskFill(points);
  }

  maskFill(points: Pt[]) {
    const c = this.mask;
    c.save();
    c.fillStyle = "#fff";
    c.beginPath();
    points.forEach((p, i) => {
      const [x, y] = this.px(p);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    });
    c.closePath();
    c.fill();
    c.lineWidth = 4 * this.k;
    c.strokeStyle = "#fff";
    c.stroke();
    c.restore();
  }

  /** Opaque paper: hides anything drawn underneath and joins the cut-out. */
  solid(points: Pt[], color = "#ffffff") {
    const trace = (c: Canvas2D) => {
      c.beginPath();
      points.forEach((p, i) => {
        const [x, y] = this.px(p);
        if (i) c.lineTo(x, y);
        else c.moveTo(x, y);
      });
      c.closePath();
    };
    const ink = this.ink;
    ink.save();
    ink.globalCompositeOperation = "destination-out";
    ink.fillStyle = "#000";
    trace(ink);
    ink.fill();
    ink.restore();

    const w = this.wash;
    w.save();
    w.globalCompositeOperation = "source-over";
    w.fillStyle = color;
    trace(w);
    w.fill();
    w.restore();

    this.maskFill(points);
  }

  /** Fill and outline in one go. */
  shape(points: Pt[], color: string | null, o: StrokeOpts & { mask?: boolean; alpha?: number } = {}) {
    if (color) this.fill(points, color, { mask: o.mask, alpha: o.alpha ?? 0.9 });
    else if (o.mask) this.maskFill(points);
    this.stroke(points, { ...o, alpha: 1, closed: true });
  }

  box(x: number, y: number, w: number, h: number, color: string | null, o: StrokeOpts & { mask?: boolean } = {}) {
    this.shape(this.rectPts(x, y, w, h), color, o);
  }

  blob(cx: number, cy: number, rx: number, ry: number, color: string | null, o: StrokeOpts & { mask?: boolean } = {}) {
    if (color) this.fill(this.ellipsePts(cx, cy, rx, ry), color, { mask: o.mask });
    else if (o.mask) this.maskFill(this.ellipsePts(cx, cy, rx, ry));
    this.ellipse(cx, cy, rx, ry, o);
  }

  /** Parallel pen hatching, clipped to a shape. */
  hatch(points: Pt[], spacing = 0.02, angle = -0.6, w = 1.4, alpha = 0.5) {
    const c = this.ink;
    c.save();
    c.beginPath();
    points.forEach((p, i) => {
      const [x, y] = this.px(p);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    });
    c.closePath();
    c.clip();
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs) - 0.3;
    const maxX = Math.max(...xs) + 0.3;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const dx = Math.cos(angle) * (maxY - minY + 0.6);
    const dy = Math.sin(angle) * (maxY - minY + 0.6);
    for (let x = minX; x < maxX; x += spacing) {
      this.stroke(
        [
          [x, maxY + 0.3],
          [x + dx, maxY + 0.3 + dy],
        ],
        { w, alpha, rough: 0.7 },
      );
    }
    c.restore();
  }

  /** A loose scribble, like a pen colouring something in. */
  scribble(points: Pt[], density = 0.012, w = 1.6) {
    const c = this.ink;
    c.save();
    c.beginPath();
    points.forEach((p, i) => {
      const [x, y] = this.px(p);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    });
    c.closePath();
    c.clip();
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const minX = Math.min(...xs) - 0.02;
    const maxX = Math.max(...xs) + 0.02;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const zig: Pt[] = [];
    let flip = false;
    for (let y = minY; y < maxY; y += density) {
      zig.push(flip ? [maxX, y + density * 0.7] : [minX, y]);
      flip = !flip;
    }
    this.stroke(zig, { w, rough: 1.4, alpha: 0.85 });
    c.restore();
  }

  /** Soft light painted onto the wash: lamps, bulbs, moon glow. */
  glow(cx: number, cy: number, r: number, color: string, alpha = 0.6) {
    const c = this.wash;
    const [x, y] = this.px([cx, cy]);
    const R = r * this.size;
    const g = c.createRadialGradient(x, y, 0, x, y, R);
    const n = parseInt(color.slice(1), 16);
    const rgb = `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
    g.addColorStop(0, `rgba(${rgb}, ${alpha})`);
    g.addColorStop(0.45, `rgba(${rgb}, ${alpha * 0.45})`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    c.save();
    c.globalCompositeOperation = "source-over";
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, R, 0, Math.PI * 2);
    c.fill();
    c.restore();
  }

  /** Soft contact shadow, e.g. under a chair leg. */
  shadow(points: Pt[], alpha = 0.22, blur = 18) {
    const c = this.wash;
    c.save();
    c.globalCompositeOperation = "multiply";
    c.filter = `blur(${blur * this.k}px)`;
    c.fillStyle = `rgba(80, 70, 110, ${alpha})`;
    c.beginPath();
    points.forEach((p, i) => {
      const [x, y] = this.px(p);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    });
    c.closePath();
    c.fill();
    c.restore();
  }

  /** A paper cut-out: white shape with a margin and a soft drop shadow. */
  sticker(points: Pt[], halo = 7, shadow = 0.2, color = "#fff") {
    const c = this.wash;
    c.save();
    c.globalCompositeOperation = "source-over";
    c.shadowColor = `rgba(70, 60, 110, ${shadow})`;
    c.shadowBlur = 14 * this.k;
    c.shadowOffsetX = 3 * this.k;
    c.shadowOffsetY = 6 * this.k;
    c.strokeStyle = "#fff";
    c.lineJoin = "round";
    c.lineWidth = halo * 2 * this.k;
    c.beginPath();
    points.forEach((p, i) => {
      const [x, y] = this.px(p);
      if (i) c.lineTo(x, y);
      else c.moveTo(x, y);
    });
    c.closePath();
    c.stroke();
    c.shadowColor = "transparent";
    c.fillStyle = color;
    c.fill();
    c.restore();

    const ink = this.ink;
    ink.save();
    ink.globalCompositeOperation = "destination-out";
    ink.lineJoin = "round";
    ink.lineWidth = halo * 2 * this.k;
    ink.beginPath();
    points.forEach((p, i) => {
      const [x, y] = this.px(p);
      if (i) ink.lineTo(x, y);
      else ink.moveTo(x, y);
    });
    ink.closePath();
    ink.fill();
    ink.stroke();
    ink.restore();
  }

  /** Remember a bounding box under a name so the 3D scene can make it clickable. */
  mark(name: string, points: Pt[], pad = 0.012) {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    this.marks[name] = [
      Math.min(...xs) - pad,
      Math.min(...ys) - pad,
      Math.max(...xs) + pad,
      Math.max(...ys) + pad,
    ];
  }

  /** A hand drawn five point star. */
  star(cx: number, cy: number, r: number, o: StrokeOpts = {}) {
    const pts: Pt[] = [];
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    this.stroke(pts, { w: 2, ...o, closed: true });
  }

  /** A small label written straight onto the paper. */
  label(str: string, x: number, y: number, size: number, o: { align?: CanvasTextAlign; alpha?: number; mono?: boolean } = {}) {
    const c = this.ink;
    c.save();
    c.globalAlpha = o.alpha ?? 0.75;
    c.fillStyle = "#000";
    c.textAlign = o.align ?? "center";
    c.textBaseline = "middle";
    c.font = `600 ${size * this.size}px ${o.mono ? "ui-monospace, monospace" : "Georgia, serif"}`;
    const [px, py] = this.px([x, y]);
    c.fillText(str, px, py);
    c.restore();
  }

  /**
   * A foil stamp: the word is printed in the wash and the pen lines under it
   * are wiped away, so light lettering reads on a dark cover.
   */
  foil(str: string, x: number, y: number, size: number, color = "#efe6d2", mono = false) {
    const font = `600 ${size * this.size}px ${mono ? "ui-monospace, monospace" : "Georgia, serif"}`;
    const [px, py] = this.px([x, y]);

    const ink = this.ink;
    ink.save();
    ink.globalCompositeOperation = "destination-out";
    ink.fillStyle = "#000";
    ink.font = font;
    ink.textAlign = "center";
    ink.textBaseline = "middle";
    ink.fillText(str, px, py);
    ink.restore();

    const wash = this.wash;
    wash.save();
    wash.globalCompositeOperation = "source-over";
    wash.fillStyle = color;
    wash.font = font;
    wash.textAlign = "center";
    wash.textBaseline = "middle";
    wash.fillText(str, px, py);
    wash.restore();
  }

  /** A wash of colour over the whole sheet. */
  washAll(color: string, alpha = 0.85) {
    this.fill(this.rectPts(-0.02, -0.02, 1.04, 1.04), color, { alpha, jitter: 0 });
  }
}
