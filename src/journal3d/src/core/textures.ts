/**
 * Texture plumbing.
 *
 * The worker draws; this module turns what comes back into GPU textures and
 * keeps the queue so the cover is always drawn first and the remaining rooms
 * trickle in behind it.
 */

import * as THREE from "three";
import type { Rect } from "./sketch";
import type { BuildRequest, BuildResponse, SurfacePayloadMsg } from "./textureWorker";
import { bakeSurface, domCanvasFactory } from "./surface";
import { SCENE_ART, drawBackCover, drawFrontCover } from "../scenes";

export type SurfaceSet = {
  wash: THREE.Texture;
  alpha: THREE.Texture;
  marks: Record<string, Rect>;
};

export type SceneTextures = {
  left: SurfaceSet | null;
  right: SurfaceSet | null;
  floor: SurfaceSet | null;
  popups: (SurfaceSet | null)[];
};

export type BookTextures = {
  front: SurfaceSet | null;
  back: SurfaceSet | null;
  scenes: (SceneTextures | null)[];
};

export function disposeTextures(t: BookTextures | null) {
  if (!t) return;
  const all: (SurfaceSet | null)[] = [t.front, t.back];
  for (const s of t.scenes) {
    if (!s) continue;
    all.push(s.left, s.right, s.floor, ...s.popups);
  }
  for (const s of all) {
    if (!s) continue;
    s.wash.dispose();
    s.alpha.dispose();
  }
}

export type TextureQuality = { wall: number; pop: number };

/**
 * Builds the book textures, off the main thread when possible.
 */
export class TextureBaker {
  private worker: Worker | null = null;
  private nextId = 1;
  private pending = new Map<number, (surfaces: SurfacePayloadMsg[]) => void>();
  private failed = false;

  constructor(private onError?: (e: unknown) => void) {
    try {
      if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") {
        this.worker = new Worker(new URL("./textureWorker.ts", import.meta.url), { type: "module" });
        console.log("[journal3d] worker ready");
        this.worker.onmessage = (e: MessageEvent<BuildResponse>) => {
          console.log("[journal3d] worker replied", e.data.id, e.data.surfaces.length);
          const resolve = this.pending.get(e.data.id);
          if (resolve) {
            this.pending.delete(e.data.id);
            resolve(e.data.surfaces);
          }
        };
        this.worker.onerror = (event) => {
          // the worker died: fall back to drawing on this thread so the book
          // still appears
          this.failed = true;
          this.onError?.(event?.message || "texture worker failed");
          const pending = [...this.pending.values()];
          this.pending.clear();
          this.worker?.terminate();
          this.worker = null;
          for (const resolve of pending) resolve([]);
        };
      }
    } catch {
      this.worker = null;
    }
  }

  get usingWorker() {
    return !!this.worker;
  }

  private buildOnMainThread(req: BuildRequest): SurfacePayloadMsg[] {
    const out: SurfacePayloadMsg[] = [];
    const pack = (
      key: string,
      size: number,
      seed: number,
      draw: (s: any) => void,
      full: boolean,
      halo = 0,
    ): SurfacePayloadMsg => {
      const p = bakeSurface(size, seed, draw, { full, halo, factory: domCanvasFactory });
      const buffer = p.alpha.buffer.slice(0) as ArrayBuffer;
      return {
        key,
        wash: p.wash as HTMLCanvasElement,
        alpha: buffer,
        size: p.size,
        marks: p.marks,
      };
    };
    if (req.kind === "cover") {
      out.push(pack("front", req.wallSize, 7, drawFrontCover, true));
      out.push(pack("back", req.wallSize, 8, drawBackCover, true));
    } else {
      const art = SCENE_ART[req.scene ?? 0];
      const base = (req.scene ?? 0) * 10;
      out.push(pack("left", req.wallSize, 100 + base, art.left, true));
      out.push(pack("right", req.wallSize, 101 + base, art.right, true));
      out.push(pack("floor", req.wallSize, 102 + base, art.floor, true));
      art.popups.forEach((popup, i) => {
        out.push(
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
    return out;
  }

  request(req: Omit<BuildRequest, "id">): Promise<SurfacePayloadMsg[]> {
    console.log("[journal3d] request", JSON.stringify(req));
    const id = this.nextId++;
    const full = { id, ...req };
    if (this.worker && !this.failed) {
      return new Promise((resolve) => {
        this.pending.set(id, resolve);
        this.worker!.postMessage(full);
      });
    }
    // no worker available: draw here, but yield first so the frame is not lost
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          console.log("[journal3d] building on main thread");
          resolve(this.buildOnMainThread(full));
        } catch (e) {
          this.onError?.(e);
          resolve([]);
        }
      }, 16);
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }
}
