/**
 * The detail panel.
 *
 * The words live here, in ordinary HTML, not painted into the 3D textures:
 * they stay selectable, translatable and readable when WebGL is unavailable.
 * On a phone it docks to the bottom of the screen as a sheet.
 */

import { useEffect, useRef } from "react";
import type { JournalPage } from "../core/content";
import styles from "./Journal3D.module.css";

export type PanelLabels = {
  close: string;
  page: string;
};

type Props = {
  page: JournalPage | null;
  assetBase: string;
  labels: PanelLabels;
  onClose: () => void;
};

export default function Panel({ page, assetBase, labels, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!page) return;
    closeRef.current?.focus();
  }, [page]);

  useEffect(() => {
    if (!page) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [page, onClose]);

  if (!page) return null;

  return (
    <div
      ref={ref}
      className={styles.panel}
      role="dialog"
      aria-modal="false"
      aria-label={`${labels.page} ${page.pageNumber}`}
    >
      <div className={styles.panelHead}>
        <span className={styles.panelKicker}>
          {page.kicker} · {page.kickerRight}
        </span>
        <button
          ref={closeRef}
          type="button"
          className={styles.panelClose}
          onClick={onClose}
          aria-label={labels.close}
        >
          ✕
        </button>
      </div>

      <div className={styles.panelBody}>
        {page.title ? <h3 className={styles.panelTitle}>{page.title}</h3> : null}
        {page.body ? <p className={styles.panelText}>{page.body}</p> : null}
        {page.quote ? <blockquote className={styles.panelQuote}>{page.quote}</blockquote> : null}
        {page.image ? (
          <figure className={styles.panelFigure}>
            <img
              src={`${assetBase}${page.image.src}.webp`}
              srcSet={`${assetBase}${page.image.src}-sm.webp 560w, ${assetBase}${page.image.src}.webp 1000w`}
              sizes="(max-width: 820px) 86vw, 420px"
              alt={page.image.alt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>{page.image.caption}</figcaption>
          </figure>
        ) : null}
        {page.handnote ? <p className={styles.panelNote}>{page.handnote}</p> : null}
        {page.sign ? <p className={styles.panelSign}>{page.sign}</p> : null}
        <span className={styles.panelNum}>{String(page.pageNumber).padStart(2, "0")}</span>
      </div>
    </div>
  );
}
