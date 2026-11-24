/**
 * The book itself: pages that fan out of the spine, floors that crease up
 * with them, and pop-up cards that stand as the room opens.
 *
 * Performance notes:
 *  - every geometry is created once and reused; the floors write straight into
 *    their position buffer instead of being rebuilt,
 *  - the floor normal is computed by hand (two coplanar triangles) so the
 *    renderer never has to walk the mesh,
 *  - there is exactly one `useFrame` in the whole scene, and it only asks for
 *    another frame while something is still moving.
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  PAGE_H,
  PAGE_W,
  ROOM_COUNT,
  dirOf,
  focusAngle,
  focusOf,
  floorApex,
  logicalOf,
  normalOf,
  pageAngles,
  roomOpenness,
  smooth,
} from "../core/fold";
import { INK, makePaperMaterial } from "../core/paper";
import { book, damp, isMoving } from "../core/store";
import type { BookTextures } from "../core/textures";
import { SCENE_ART } from "../scenes";

const PAGE_GAP = 0.014;

/**
 * The two textures of a surface are both uploaded without a vertical flip (a
 * DataTexture cannot be flipped, so the bitmap must not be either). The canvas
 * is drawn top down, so the geometry's V coordinate is flipped here to keep the
 * drawing the right way up.
 */
function flipV<T extends THREE.BufferGeometry>(geo: T): T {
  const uv = geo.attributes.uv as THREE.BufferAttribute | undefined;
  if (!uv) return geo;
  const arr = uv.array as Float32Array;
  for (let i = 1; i < arr.length; i += 2) arr[i] = 1 - arr[i];
  uv.needsUpdate = true;
  return geo;
}

/** A hand wobbled rectangle in a page's local plane. */
function wobbleRect(seed: number, width: number, height: number): THREE.Vector3[] {
  const corners = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  const out: THREE.Vector3[] = [];
  for (let s = 0; s < 4; s++) {
    const [x1, y1] = corners[s];
    const [x2, y2] = corners[(s + 1) % 4];
    const nx = -(y2 - y1);
    const ny = x2 - x1;
    for (let j = 0; j < 14; j++) {
      const t = j / 14;
      const o =
        0.005 *
        (Math.sin(seed * 3.1 + (s * 14 + j) * 0.7) * 0.6 + Math.sin(seed * 1.7 + (s * 14 + j) * 1.9) * 0.4);
      out.push(new THREE.Vector3(x1 + (x2 - x1) * t + nx * o, y1 + (y2 - y1) * t + ny * o, 0));
    }
  }
  out.push(out[0].clone());
  return out;
}

export type ScreenSpot = {
  key: string;
  pageId: string;
  x: number;
  y: number;
  visible: boolean;
};

/** A horizontal band of the canvas that turns the book. */
export type TurnZone = {
  /** left edge, in canvas pixels */
  x0: number;
  /** right edge, in canvas pixels */
  x1: number;
};

/**
 * Where the book can be turned.
 *
 * `prev` is the band on the left of the focused room, `next` the band on its
 * right. The focused room itself is never part of a band, so the drawings and
 * the pop-up cards in the middle cannot be mistaken for a page edge.
 */
export type TurnZones = {
  prev: TurnZone | null;
  next: TurnZone | null;
  /** the outer edge of the book on the left, where the shadow gathers */
  edgeLeft: number | null;
  /** the outer edge of the book on the right */
  edgeRight: number | null;
  /** true while the book is still moving, so a turn cannot be queued */
  moving: boolean;
};

type Props = {
  textures: BookTextures;
  mobile: boolean;
  onSpots: (spots: ScreenSpot[]) => void;
  onZones: (zones: TurnZones) => void;
  /**
   * Bumped by the page every time the book is told to open, close or turn.
   * The render loop only runs while something moves, so an idle book needs one
   * frame handed to it to notice a new target — this is that frame, and it is
   * asked for explicitly rather than hoping a React commit happens to do it.
   */
  pulse: number;
};

export default function Book({ textures, mobile, onSpots, onZones, pulse }: Props) {
  const { camera, size, invalidate } = useThree();

  // one frame for every command the page sends, and a slow watchdog that
  // catches anything the frame would have missed
  useEffect(() => {
    invalidate();
  }, [invalidate, pulse]);
  useEffect(() => {
    const id = window.setInterval(() => {
      if (isMoving(book)) invalidate();
    }, 350);
    return () => window.clearInterval(id);
  }, [invalidate]);

  const pageGeo = useMemo(() => {
    const front = flipV(new THREE.PlaneGeometry(PAGE_W, PAGE_H).translate(PAGE_W / 2, PAGE_H / 2, 0));
    const back = flipV(
      new THREE.PlaneGeometry(PAGE_W, PAGE_H).rotateY(Math.PI).translate(PAGE_W / 2, PAGE_H / 2, 0),
    );
    return { front, back };
  }, []);

  // Materials follow the textures; when a new room arrives the whole set is
  // rebuilt and the old ones are disposed.
  const pageMats = useMemo(() => {
    const mats: {
      front: THREE.ShaderMaterial;
      back: THREE.ShaderMaterial;
    }[] = [];
    for (let k = 0; k <= ROOM_COUNT; k++) {
      const sceneIdx = k === ROOM_COUNT ? -1 : logicalOf(k);
      const frontTex = k === ROOM_COUNT ? textures.front : textures.scenes[sceneIdx]?.right;
      const backTex = k === 0 ? textures.back : textures.scenes[logicalOf(k - 1)]?.left;
      if (!frontTex || !backTex) {
        // nothing drawn yet: a blank sheet of paper
        const blank = makePaperMaterial(
          new THREE.Texture(),
          new THREE.DataTexture(new Uint8Array([128]), 1, 1, THREE.RedFormat),
          { seed: k },
        );
        mats.push({ front: blank, back: blank.clone() });
        continue;
      }
      mats.push({
        front: makePaperMaterial(frontTex.wash, frontTex.alpha, { seed: k * 2, flat: k === ROOM_COUNT }),
        back: makePaperMaterial(backTex.wash, backTex.alpha, { seed: k * 2 + 1, flat: k === 0 }),
      });
    }
    return mats;
  }, [textures]);

  const floors = useMemo(() => {
    return Array.from({ length: ROOM_COUNT }, (_, p) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(18), 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(18), 3));
      geo.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]), 2),
      );
      // the floor never leaves the room, so a fixed sphere avoids a per frame
      // bounding sphere recalculation
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0.6, 0.2, 0.6), 2);
      const sceneIdx = logicalOf(p);
      const tex = textures.scenes[sceneIdx]?.floor;
      const mat = tex
        ? makePaperMaterial(tex.wash, tex.alpha, { side: THREE.DoubleSide, seed: 40 + p })
        : makePaperMaterial(
            new THREE.Texture(),
            new THREE.DataTexture(new Uint8Array([128]), 1, 1, THREE.RedFormat),
            { side: THREE.DoubleSide, seed: 40 + p },
          );
      return { geo, mat };
    });
  }, [textures]);

  const popups = useMemo(() => {
    return Array.from({ length: ROOM_COUNT }, (_, p) => {
      const sceneIdx = logicalOf(p);
      const art = SCENE_ART[sceneIdx];
      return art.popups.map((popup, j) => {
        const tex = textures.scenes[sceneIdx]?.popups[j];
        const geo = flipV(
          new THREE.PlaneGeometry(popup.size, popup.size).translate(0, popup.size / 2, 0),
        );
        const mat = tex
          ? makePaperMaterial(tex.wash, tex.alpha, {
              side: THREE.DoubleSide,
              blankBack: true,
              seed: 60 + p * 4 + j,
              flat: 0.85,
              transparent: true,
            })
          : makePaperMaterial(
              new THREE.Texture(),
              new THREE.DataTexture(new Uint8Array([0]), 1, 1, THREE.RedFormat),
              { side: THREE.DoubleSide, transparent: true },
            );
        return { spec: popup, geo, mat, marks: tex?.marks ?? {} };
      });
    });
  }, [textures]);

  const outlines = useMemo(
    () => Array.from({ length: ROOM_COUNT + 1 }, (_, k) => wobbleRect(k + 1, PAGE_W, PAGE_H)),
    [],
  );

  const outlineBuffers = useMemo(
    () => outlines.map((o) => new Float32Array(o.flatMap((v) => [v.x, v.y, v.z]))),
    [outlines],
  );

  // Every drawn mark that opens a page, resolved once per texture set.
  const wallMarks = useMemo(() => {
    const out: {
      page: number;
      room: number;
      face: "front" | "back";
      spot: string;
      pageId: string;
      rect: [number, number, number, number];
    }[] = [];
    for (let k = 0; k <= ROOM_COUNT; k++) {
      const sceneIdx = k === ROOM_COUNT ? -1 : logicalOf(k);
      if (k < ROOM_COUNT) {
        const tex = textures.scenes[sceneIdx];
        const art = SCENE_ART[sceneIdx];
        for (const [spot, rect] of Object.entries(tex?.right?.marks ?? {})) {
          const pageId = art.spots[spot];
          if (pageId)
            out.push({
              page: k,
              room: k,
              face: "front",
              spot,
              pageId,
              rect: rect as [number, number, number, number],
            });
        }
      }
      if (k > 0) {
        const prevIdx = logicalOf(k - 1);
        const tex = textures.scenes[prevIdx];
        const art = SCENE_ART[prevIdx];
        for (const [spot, rect] of Object.entries(tex?.left?.marks ?? {})) {
          const pageId = art.spots[spot];
          if (pageId)
            out.push({
              page: k,
              room: k - 1,
              face: "back",
              spot,
              pageId,
              rect: rect as [number, number, number, number],
            });
        }
      }
    }
    return out;
  }, [textures]);

  const pageRefs = useRef<(THREE.Group | null)[]>([]);
  const popRefs = useRef<{ outer: THREE.Group | null; hinge: THREE.Group | null }[][]>(
    Array.from({ length: ROOM_COUNT }, () => []),
  );
  const target = useMemo(() => new THREE.Vector3(), []);
  const projected = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ invalidate }, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20);

    book.focus = damp(book.focus, book.focusTarget, 7, dt);
    book.open = damp(book.open, book.openTarget, 7, dt);
    book.zoom = damp(book.zoom, book.zoomTarget, 6, dt);
    if (Math.abs(book.openTarget - book.open) < 1e-4) book.open = book.openTarget;
    if (Math.abs(book.focusTarget - book.focus) < 1e-4) book.focus = book.focusTarget;
    const moving =
      Math.abs(book.openTarget - book.open) > 0.0005 ||
      Math.abs(book.focusTarget - book.focus) > 0.0005 ||
      Math.abs(book.zoomTarget - book.zoom) > 0.0005;

    const openness = smooth(book.open);
    const spread = mobile ? 0.16 : 0.82;
    const phi = pageAngles(book.focus, book.open, spread);
    const focus = book.focus;

    // ---- pages ------------------------------------------------------------
    for (let k = 0; k <= ROOM_COUNT; k++) {
      const g = pageRefs.current[k];
      if (!g) continue;
      const n = normalOf(phi[k]);
      const off = (k - ROOM_COUNT / 2) * PAGE_GAP * (1 - openness);
      g.rotation.y = -phi[k];
      g.position.set(n[0] * off, 0, n[2] * off);
      const m = pageMats[k];
      const rf = k === ROOM_COUNT ? 1 : focusOf(k, focus) * openness;
      const rb = k === 0 ? 1 : focusOf(k - 1, focus) * openness;
      m.front.uniforms.uReveal.value = rf;
      m.back.uniforms.uReveal.value = rb;
      m.front.uniforms.uInkAmt.value = k === ROOM_COUNT ? 1 : 0.5 + 0.5 * rf;
      m.back.uniforms.uInkAmt.value = k === 0 ? 1 : 0.5 + 0.5 * rb;
    }

    // ---- floors and pop-ups ----------------------------------------------
    const spots: ScreenSpot[] = [];
    for (let p = 0; p < ROOM_COUNT; p++) {
      const a = phi[p];
      const b = phi[p + 1];
      const A = dirOf(a).map((v) => v * PAGE_W) as [number, number, number];
      const B = dirOf(b).map((v) => v * PAGE_W) as [number, number, number];
      const P = floorApex(a, b);

      const geo = floors[p].geo;
      const pos = geo.attributes.position as THREE.BufferAttribute;
      const nor = geo.attributes.normal as THREE.BufferAttribute;
      const pa = pos.array as Float32Array;
      const na = nor.array as Float32Array;
      const verts = [
        [0, 0, 0],
        [A[0], A[1], A[2]],
        [P[0], P[1], P[2]],
        [0, 0, 0],
        [P[0], P[1], P[2]],
        [B[0], B[1], B[2]],
      ];
      for (let i = 0; i < 6; i++) {
        pa[i * 3] = verts[i][0];
        pa[i * 3 + 1] = verts[i][1] + 0.0006;
        pa[i * 3 + 2] = verts[i][2];
      }
      // the normal of the two coplanar triangles, computed by hand
      const ux = P[0] - A[0];
      const uy = P[1] - A[1];
      const uz = P[2] - A[2];
      const vx = 0 - A[0];
      const vy = 0 - A[1];
      const vz = 0 - A[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;
      for (let i = 0; i < 6; i++) {
        na[i * 3] = nx;
        na[i * 3 + 1] = ny;
        na[i * 3 + 2] = nz;
      }
      pos.needsUpdate = true;
      nor.needsUpdate = true;

      const rf = focusOf(p, focus) * openness;
      floors[p].mat.uniforms.uReveal.value = rf;
      floors[p].mat.uniforms.uInkAmt.value = 0.45 + 0.55 * rf;

      const open = roomOpenness(phi, p);
      // pop-ups are drawn for the room seen head on, so they only appear once
      // the room has settled at a right angle
      const rise = smooth((open - 0.9) / 0.1) * smooth((book.open - 0.92) / 0.08);
      const mid = (a + b) / 2;
      const dA = dirOf(a);
      const dB = dirOf(b);
      const sceneIdx = logicalOf(p);
      popups[p].forEach((pu, j) => {
        const r = popRefs.current[p][j];
        const vis = smooth((rise - j * 0.25) / (1 - j * 0.25 + 1e-3));
        if (!r?.outer || !r.hinge) return;
        r.outer.visible = vis > 0.01;
        const [s, t] = pu.spec.at;
        r.outer.position.set((dA[0] * s + dB[0] * t) * PAGE_W, 0.001, (dA[2] * s + dB[2] * t) * PAGE_W);
        r.outer.rotation.y = Math.PI / 2 - mid;
        r.hinge.scale.y = 0.88 + 0.12 * vis;
        pu.mat.uniforms.uOpacity.value = vis;
        pu.mat.uniforms.uReveal.value = rf;

        // the marks on a pop-up become clickable spots
        const art = SCENE_ART[sceneIdx];
        for (const [spot, rect] of Object.entries(pu.marks ?? {})) {
          const px = (rect[0] + rect[2]) / 2;
          const py = (rect[1] + rect[3]) / 2;
          projected.set((px - 0.5) * pu.spec.size, (1 - py) * pu.spec.size, 0.01);
          r.hinge.localToWorld(projected);
          const world = projected.clone();
          projected.project(camera);
          spots.push({
            key: `p${p}-${j}-${spot}`,
            pageId: art.spots[spot] ?? "",
            x: (projected.x * 0.5 + 0.5) * size.width,
            y: (-projected.y * 0.5 + 0.5) * size.height,
            visible: vis > 0.6 && projected.z < 1 && rf > 0.5,
          });
          void world;
        }
      });
    }

    // ---- wall spots ------------------------------------------------------
    for (const mark of wallMarks) {
      const group = pageRefs.current[mark.page];
      if (!group) continue;
      const cx = (mark.rect[0] + mark.rect[2]) / 2;
      const cy = (mark.rect[1] + mark.rect[3]) / 2;
      const localX = mark.face === "front" ? cx * PAGE_W : PAGE_W * (1 - cx);
      const localY = (1 - cy) * PAGE_H;
      const localZ = mark.face === "front" ? 0.006 : -0.006;
      projected.set(localX, localY, localZ);
      group.localToWorld(projected);
      projected.project(camera);
      // the mark belongs to the room whose wall it is drawn on
      const roomFocus = focusOf(mark.room, focus);
      spots.push({
        key: `w${mark.page}-${mark.face}-${mark.spot}`,
        pageId: mark.pageId,
        x: (projected.x * 0.5 + 0.5) * size.width,
        y: (-projected.y * 0.5 + 0.5) * size.height,
        visible: projected.z < 1 && roomFocus * openness > 0.35,
      });
    }

    // ---- camera -----------------------------------------------------------
    const gF = focusAngle(phi, focus);
    const yaw = Math.PI / 2 + (gF - Math.PI / 2) * openness;
    const pitch = THREE.MathUtils.degToRad((mobile ? 14 : 8) + 22 * openness);
    const dF = dirOf(gF);
    target.set(
      PAGE_W / 2 + (dF[0] * 0.42 - PAGE_W / 2) * openness,
      PAGE_H / 2 + (0.52 - PAGE_H / 2) * openness,
      dF[2] * 0.42 * openness,
    );
    const zm = smooth(book.zoom);
    target.x += (book.zoomAt[0] - target.x) * zm;
    target.y += (book.zoomAt[1] - target.y) * zm;
    target.z += (book.zoomAt[2] - target.z) * zm;
    camera.position.set(
      target.x + Math.cos(yaw) * Math.cos(pitch) * 10,
      target.y + Math.sin(pitch) * 10,
      target.z + Math.sin(yaw) * Math.cos(pitch) * 10,
    );
    camera.lookAt(target);

    // how much of the frame the book may fill: the focused room is one page
    // wide and tall, the fan of the other rooms reaches out behind it
    const viewH = (mobile ? 1.15 : 1.3) + (mobile ? 0.4 : 0.4) * openness;
    const viewW = (mobile ? 0.85 : 1.1) + (mobile ? 0.4 : 0.5) * openness;
    const ortho = camera as THREE.OrthographicCamera;
    ortho.zoom = Math.min(size.height / viewH, size.width / viewW) * (1 + 2.2 * zm);
    ortho.updateProjectionMatrix();

    // ---- the bands that turn the book ------------------------------------
    // The focused room lives between the physical pages f and f+1. The lower
    // page angle is on the right of the screen, so page f is the right hand
    // wall and page f+1 the left hand wall. Everything to the right of the
    // room leads forward, everything to the left leads back.
    const f = Math.max(0, Math.min(ROOM_COUNT - 1, Math.round(focus)));
    // The outer edge of a wall is a vertical line; the camera looks down on
    // the book, so the foot of the wall is the widest part of the room. All
    // three heights are sampled and the widest one is kept, otherwise the
    // shadow of a page would fall across the floor.
    const edgeX = (k: number, side: "right" | "left"): number => {
      const g = pageRefs.current[k];
      if (!g) return Number.NaN;
      let best = Number.NaN;
      for (const y of [0, PAGE_H * 0.5, PAGE_H]) {
        projected.set(PAGE_W, y, 0);
        g.localToWorld(projected);
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * size.width;
        if (!Number.isFinite(best)) best = x;
        else if (side === "right" ? x > best : x < best) best = x;
      }
      return best;
    };
    const xRight = edgeX(f, "right");
    const xLeft = edgeX(f + 1, "left");
    let prevZone: TurnZone | null = null;
    let nextZone: TurnZone | null = null;
    if (Number.isFinite(xRight) && Number.isFinite(xLeft) && xRight > xLeft) {
      // a band never reaches into the room, but it is never so narrow that a
      // finger cannot hit it either
      const minZone = mobile ? 64 : 56;
      const x0 = Math.max(0, Math.min(xRight, size.width - minZone));
      const x1 = Math.min(size.width, Math.max(xLeft, minZone));
      if (x0 < size.width) nextZone = { x0, x1: size.width };
      if (x1 > 0) prevZone = { x0: 0, x1 };
    }
    // the edges are kept inside the canvas: on a phone the book is wider than
    // the frame, and the edge of the page is where it leaves the picture
    onZones({
      prev: prevZone,
      next: nextZone,
      edgeLeft: Number.isFinite(xLeft) ? Math.max(0, xLeft) : null,
      edgeRight: Number.isFinite(xRight) ? Math.min(size.width, xRight) : null,
      moving,
    });

    onSpots(spots);

    // keep the loop alive only while something is moving
    if (moving) invalidate();
  });

  return (
    <group>
      {pageMats.map((m, k) => (
        <group key={k} ref={(el) => void (pageRefs.current[k] = el)}>
          <mesh geometry={pageGeo.front} material={m.front} />
          <mesh geometry={pageGeo.back} material={m.back} />
          <lineLoop>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[outlineBuffers[k], 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color={INK} transparent opacity={0.35} />
          </lineLoop>
        </group>
      ))}

      {floors.map((fl, p) => (
        <mesh key={p} geometry={fl.geo} material={fl.mat} />
      ))}

      {popups.map((list, p) =>
        list.map((pu, j) => (
          <group
            key={`${p}-${j}`}
            ref={(el) => {
              popRefs.current[p][j] = { ...(popRefs.current[p][j] ?? { hinge: null }), outer: el };
            }}
          >
            <group
              ref={(el) => {
                popRefs.current[p][j] = { ...(popRefs.current[p][j] ?? { outer: null }), hinge: el };
              }}
            >
              <mesh geometry={pu.geo} material={pu.mat} />
            </group>
          </group>
        )),
      )}
    </group>
  );
}
