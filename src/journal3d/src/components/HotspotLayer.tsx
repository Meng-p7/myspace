/**
 * The clickable marks on the paper.
 *
 * The spots are projected from the 3D scene every frame and the buttons are
 * plain DOM elements moved with a transform, so they are real buttons: they
 * can be focused, they are announced by screen readers and they keep working
 * when the WebGL context is lost.
 */

import { useEffect, useRef } from "react";
import type { ScreenSpot } from "./Book";
import styles from "./Journal3D.module.css";

type Props = {
  spotsRef: React.MutableRefObject<ScreenSpot[]>;
  labels: Record<string, string>;
  onPick: (pageId: string) => void;
};

const MAX_SPOTS = 16;

export default function HotspotLayer({ spotsRef, labels, onPick }: Props) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const spots = spotsRef.current;
      for (let i = 0; i < MAX_SPOTS; i++) {
        const el = buttons.current[i];
        if (!el) continue;
        const spot = spots[i];
        if (!spot || !spot.visible || !spot.pageId) {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
          el.setAttribute("aria-hidden", "true");
          el.tabIndex = -1;
          continue;
        }
        const label = labels[spot.pageId] ?? spot.pageId;
        if (el.getAttribute("aria-label") !== label) {
          el.setAttribute("aria-label", label);
          el.title = label;
        }
        el.style.transform = `translate3d(${Math.round(spot.x)}px, ${Math.round(spot.y)}px, 0) translate(-50%, -50%)`;
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.removeAttribute("aria-hidden");
        el.tabIndex = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [labels, spotsRef]);

  return (
    <div className={styles.spots} aria-label={styles.spotsLabel}>
      {Array.from({ length: MAX_SPOTS }, (_, i) => (
        <button
          key={i}
          type="button"
          ref={(el) => void (buttons.current[i] = el)}
          className={styles.spot}
          onClick={() => {
            const spot = spotsRef.current[i];
            if (spot?.pageId) onPickRef.current(spot.pageId);
          }}
          aria-hidden="true"
          tabIndex={-1}
        />
      ))}
    </div>
  );
}
