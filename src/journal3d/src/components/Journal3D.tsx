/**
 * The journal: a 3D pop-up book with four rooms, opened by the reader.
 *
 * Rendering is on demand: the scene only asks for another frame while
 * something is actually moving, and it stops altogether when the section
 * scrolls out of view or the tab is hidden.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Book, { type ScreenSpot } from "./Book";
import HotspotLayer from "./HotspotLayer";
import Panel from "./Panel";
import { SCENES, type JournalPage, type Locale } from "../core/content";
import { physicalOf } from "../core/fold";
import { book } from "../core/store";
import { TextureBaker, disposeTextures, type BookTextures, type SurfaceSet } from "../core/textures";
import styles from "./Journal3D.module.css";

export type JournalLabels = {
  open: string;
  close: string;
  hint: string;
  prev: string;
  next: string;
  panelClose: string;
  page: string;
  loading: string;
  unsupported: string;
};

export type JournalOptions = {
  locale: Locale;
  assetBase: string;
  labels: JournalLabels;
  /** The pages of the current language, owned by the site. */
  pages: JournalPage[];
};

type RawSurface = {
  key: string;
  wash: ImageBitmap | HTMLCanvasElement;
  alpha: ArrayBuffer;
  size: number;
  marks: Record<string, [number, number, number, number]>;
};

const blankTextures = (): BookTextures => ({
  front: null,
  back: null,
  scenes: [null, null, null, null],
});

function toSurface(raw: RawSurface): SurfaceSet {
  const wash =
    raw.wash instanceof ImageBitmap ? new THREE.Texture(raw.wash) : new THREE.CanvasTexture(raw.wash);
  wash.colorSpace = THREE.SRGBColorSpace;
  wash.generateMipmaps = false;
  wash.minFilter = THREE.LinearFilter;
  wash.magFilter = THREE.LinearFilter;
  // the alpha channel is a DataTexture and cannot be flipped, so the colour
  // channel must not be flipped either; the geometry carries the flip instead
  wash.flipY = false;
  wash.needsUpdate = true;

  const alpha = new THREE.DataTexture(new Uint8Array(raw.alpha), raw.size, raw.size, THREE.RedFormat);
  alpha.unpackAlignment = 1;
  alpha.generateMipmaps = false;
  alpha.minFilter = THREE.LinearFilter;
  alpha.magFilter = THREE.LinearFilter;
  alpha.needsUpdate = true;

  return { wash, alpha, marks: raw.marks };
}

export default function Journal3D({ locale, assetBase, labels, pages }: JournalOptions) {
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
  );
  const [textures, setTextures] = useState<BookTextures | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [room, setRoom] = useState(0);
  const [panelPageId, setPanelPageId] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const spotsRef = useRef<ScreenSpot[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = () => setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // pause the renderer when the journal is not on screen
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setVisible(entries.some((e) => e.isIntersecting)),
      { threshold: 0.01 },
    );
    io.observe(el);
    const onVisibility = () => setVisible(!document.hidden && io.takeRecords().length >= 0);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const quality = useMemo(
    () => (mobile ? { wall: 512, pop: 256, cut: 512 } : { wall: 1024, pop: 512, cut: 768 }),
    [mobile],
  );

  // ---- build the textures, off the main thread ----------------------------
  useEffect(() => {
    let alive = true;
    const baker = new TextureBaker();
    const built: BookTextures[] = [];

    const applySurfaces = (raw: RawSurface[], kind: "cover" | "scene", sceneIdx: number) => {
      if (!alive) return;
      const next = built[0] ?? blankTextures();
      if (kind === "cover") {
        for (const s of raw) {
          if (s.key === "front") next.front = toSurface(s);
          if (s.key === "back") next.back = toSurface(s);
        }
      } else {
        const scene = next.scenes[sceneIdx] ?? { left: null, right: null, floor: null, popups: [] };
        for (const s of raw) {
          const set = toSurface(s);
          if (s.key === "left" || s.key === "right" || s.key === "floor") {
            scene[s.key] = set;
          } else {
            scene.popups[Number(s.key.replace("popup", ""))] = set;
          }
        }
        next.scenes[sceneIdx] = scene;
      }
      built[0] = next;
      setTextures({ ...next, scenes: [...next.scenes] });
    };

    (async () => {
      const cover = await baker.request({ kind: "cover", wallSize: quality.wall, popSize: quality.pop });
      if (!alive) return;
      applySurfaces(cover as RawSurface[], "cover", 0);
      setReady(true);
      for (let i = 0; i < SCENES.length; i++) {
        const surfaces = await baker.request({
          kind: "scene",
          scene: i,
          wallSize: quality.wall,
          popSize: quality.pop,
        });
        if (!alive) return;
        applySurfaces(surfaces as RawSurface[], "scene", i);
      }
    })();

    return () => {
      alive = false;
      baker.dispose();
      disposeTextures(built[0] ?? null);
    };
  }, [quality]);

  // ---- book state ---------------------------------------------------------
  const goToRoom = useCallback((logical: number) => {
    const clamped = Math.max(0, Math.min(SCENES.length - 1, logical));
    book.focusTarget = physicalOf(clamped);
    setRoom(clamped);
  }, []);

  const setBookOpen = useCallback(
    (value: boolean) => {
      book.openTarget = value ? 1 : 0;
      setOpen(value);
      if (value) {
        book.focusTarget = physicalOf(room);
      } else {
        setPanelPageId(null);
        book.zoomTarget = 0;
      }
    },
    [room],
  );

  const openPage = useCallback(
    (pageId: string) => {
      const page = pages.find((p) => p.id === pageId);
      if (!page) return;
      if (page.sceneId !== room) goToRoom(page.sceneId);
      setPanelPageId(page.id);
    },
    [pages, room, goToRoom],
  );

  const closePanel = useCallback(() => {
    setPanelPageId(null);
    book.zoomTarget = 0;
  }, []);

  // ---- keyboard -----------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panelPageId) {
        if (e.key === "Escape") closePanel();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (!open) setBookOpen(true);
        else if (room < SCENES.length - 1) goToRoom(room + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (open) {
          if (room === 0) setBookOpen(false);
          else goToRoom(room - 1);
        }
      } else if (e.key === "Enter" || e.key === " ") {
        if (!open) {
          e.preventDefault();
          setBookOpen(true);
        }
      } else if (e.key === "Escape") {
        setBookOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, room, panelPageId, setBookOpen, goToRoom, closePanel]);

  // the page can ask the book to open itself
  useEffect(() => {
    const onOpen = () => setBookOpen(true);
    window.addEventListener("journal3d:open", onOpen);
    return () => window.removeEventListener("journal3d:open", onOpen);
  }, [setBookOpen]);

  // ---- pointer: drag to turn, tap the cover to open -----------------------
  const gesture = useRef({
    active: false,
    x0: 0,
    y0: 0,
    lastX: 0,
    axis: null as null | "x" | "y",
  });

  const onPointerDown = (e: React.PointerEvent) => {
    gesture.current = {
      active: true,
      x0: e.clientX,
      y0: e.clientY,
      lastX: e.clientX,
      axis: null,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g.active) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    if (g.axis === null) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      // lock the axis: only a clear horizontal drag takes over the gesture, so
      // a vertical scroll is never stolen by the canvas
      g.axis = Math.abs(dx) > Math.abs(dy) * 1.25 ? "x" : "y";
      if (g.axis === "x") book.dragging = true;
    }
    if (g.axis === "x" && open) {
      const delta = e.clientX - g.lastX;
      g.lastX = e.clientX;
      book.focus = Math.max(0, Math.min(SCENES.length - 1, book.focus + delta / 190));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g.active) return;
    g.active = false;
    const moved = Math.abs(e.clientX - g.x0) > 6;
    if (g.axis === "x") {
      book.dragging = false;
      if (open) goToRoom(Math.round(book.focus));
      return;
    }
    if (!moved && !open) setBookOpen(true);
  };

  const spotLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of pages) map[p.id] = p.title ?? p.image?.caption ?? p.kicker;
    return map;
  }, [pages]);

  const scene = SCENES[room];
  // the panel follows the language: it holds the page id, not the page object
  const panelPage: JournalPage | null = useMemo(
    () => (panelPageId ? pages.find((p) => p.id === panelPageId) ?? null : null),
    [panelPageId, pages],
  );

  return (
    <div className={styles.root} ref={wrapRef}>
      <div
        className={styles.canvasWrap}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {ready && textures ? (
          <Canvas
            orthographic
            flat
            linear
            frameloop={visible ? "demand" : "never"}
            dpr={mobile ? [1, 1.5] : [1, 2]}
            camera={{ position: [0, 2, 10], zoom: 200, near: 0.1, far: 100 }}
            gl={{ alpha: true, antialias: !mobile, powerPreference: "high-performance" }}
            onCreated={({ gl }) => gl.setClearAlpha(0)}
          >
            <Book
              textures={textures}
              mobile={mobile}
              onSpots={(spots) => {
                spotsRef.current = spots;
              }}
            />
          </Canvas>
        ) : null}

        {ready && textures ? (
          <HotspotLayer spotsRef={spotsRef} labels={spotLabels} onPick={openPage} />
        ) : null}

        {!ready ? <div className={styles.loading}>{labels.loading}</div> : null}
      </div>

      <div className={styles.footer}>
        <div className={styles.caption}>
          {open ? (
            <>
              <span className={styles.sceneName}>{scene.name[locale]}</span>
              <span className={styles.sceneMood}>{scene.mood[locale]}</span>
            </>
          ) : (
            <span className={styles.sceneMood}>{labels.hint}</span>
          )}
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.arrow}
            onClick={() =>
              open ? (room === 0 ? setBookOpen(false) : goToRoom(room - 1)) : setBookOpen(true)
            }
            aria-label={open && room > 0 ? labels.prev : labels.open}
          >
            ←
          </button>
          <span className={styles.index}>
            {String(room + 1).padStart(2, "0")} / {String(SCENES.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={styles.arrow}
            onClick={() => (open ? goToRoom(room + 1) : setBookOpen(true))}
            aria-label={open ? labels.next : labels.open}
            disabled={open && room >= SCENES.length - 1}
          >
            →
          </button>
        </div>
      </div>

      <Panel
        page={panelPage}
        assetBase={assetBase}
        labels={{ close: labels.panelClose, page: labels.page }}
        onClose={closePanel}
      />
    </div>
  );
}
