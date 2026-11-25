/**
 * The bands of the canvas that turn the book.
 *
 * They are ordinary buttons, so they are reachable with a keyboard and they
 * announce themselves. The band on the right turns forward, the band on the
 * left turns back; the room in the middle is never covered, so a drawing or a
 * pop-up card cannot be mistaken for a page edge.
 *
 * The bands are moved every frame from the geometry the scene publishes, the
 * same way the hotspots are.
 */

import { useEffect, useRef } from "react";
import type { TurnZone, TurnZones } from "./Book";
import styles from "./Journal3D.module.css";

type Props = {
  zonesRef: React.MutableRefObject<TurnZones | null>;
  labels: { open: string; prev: string; next: string };
  /** false while the book is shut, or while a detail sheet is open */
  open: boolean;
  /** false while the book is moving: a turn cannot be queued */
  enabled: boolean;
  /** false at the end of the book, where there is nothing to turn to */
  canNext: boolean;
  /** false at the very start, where there is nothing to turn to */
  canPrev: boolean;
  onTurn: (dir: -1 | 1) => void;
  onOpen: () => void;
};

function place(
  el: HTMLButtonElement | null,
  zone: TurnZone | null,
  edge: number | null,
  side: "prev" | "next",
) {
  if (!el) return;
  if (!zone) {
    el.style.display = "none";
    el.setAttribute("aria-hidden", "true");
    el.tabIndex = -1;
    return;
  }
  el.style.display = "block";
  el.style.left = `${Math.round(zone.x0)}px`;
  el.style.width = `${Math.round(Math.max(0, zone.x1 - zone.x0))}px`;
  // the rule and the cue sit on the edge of the page itself, so they never
  // lie over the drawing in the middle of the room. The edge comes from the
  // scene in canvas coordinates, the band needs it measured from its own side.
  if (edge !== null) {
    const offset =
      side === "prev" ? zone.x1 - edge : edge - zone.x0;
    el.style.setProperty("--edge", `${Math.max(0, Math.round(offset))}px`);
  } else {
    el.style.removeProperty("--edge");
  }
  el.removeAttribute("aria-hidden");
  el.tabIndex = 0;
}

export default function TurnLayer({
  zonesRef,
  labels,
  open,
  enabled,
  canNext,
  canPrev,
  onTurn,
  onOpen,
}: Props) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const tick = () => {
      const z = zonesRef.current;
      place(prevRef.current, z?.prev ?? null, z?.edgeLeft ?? null, "prev");
      place(nextRef.current, z?.next ?? null, z?.edgeRight ?? null, "next");
      const moving = z?.moving ?? false;
      if (prevRef.current) prevRef.current.disabled = !enabled || !canPrev || moving;
      if (nextRef.current) nextRef.current.disabled = !enabled || !canNext || moving;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, zonesRef, enabled, canPrev, canNext]);

  return (
    <div className={styles.turnLayer}>
      {open ? (
        <>
          <button
            key="turn-prev"
            type="button"
            ref={prevRef}
            className={`${styles.turnZone} ${styles.turnZonePrev}`}
            data-journal3d="turn-prev"
            aria-label={labels.prev}
            onClick={() => onTurn(-1)}
          >
            <span className={styles.turnCue} aria-hidden="true" />
          </button>
          <button
            key="turn-next"
            type="button"
            ref={nextRef}
            className={`${styles.turnZone} ${styles.turnZoneNext}`}
            data-journal3d="turn-next"
            aria-label={labels.next}
            onClick={() => onTurn(1)}
          >
            <span className={styles.turnCue} aria-hidden="true" />
          </button>
        </>
      ) : (
        <button
          key="open-zone"
          type="button"
          className={styles.openZone}
          data-journal3d="open"
          aria-label={labels.open}
          onClick={onOpen}
        />
      )}
    </div>
  );
}
