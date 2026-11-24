/**
 * Public entry point of the journal module.
 *
 * The rest of MySpace talks to the book through three calls and nothing
 * else: mount it, switch the language, throw it away. Nothing in here
 * touches the page's globals.
 */

import { createRoot, type Root } from "react-dom/client";
import Journal3D from "./components/Journal3D";
import type { JournalLabels, JournalOptions } from "./components/Journal3D";
import type { JournalPage, Locale } from "./core/content";

export type { JournalLabels, JournalOptions };

export type JournalApi = {
  /** Swap the language of every title, caption and page. */
  setLocale: (locale: Locale, pages: JournalPage[]) => void;
  /** Open the book. */
  open: () => void;
  /** Unmount and release the WebGL context. */
  destroy: () => void;
};

const OPEN_EVENT = "journal3d:open";

let active: {
  root: Root;
  container: HTMLDivElement;
  render: (locale: Locale, pages: JournalPage[]) => void;
} | null = null;

export function mountJournal(el: HTMLElement, options: JournalOptions): JournalApi {
  destroy();

  const container = document.createElement("div");
  container.className = "journal3d-root";
  container.style.width = "100%";
  container.style.height = "100%";
  el.appendChild(container);

  const root = createRoot(container);
  let locale: Locale = options.locale;
  let pages: JournalPage[] = options.pages;

  const render = () =>
    root.render(
      <Journal3D
        locale={locale}
        assetBase={options.assetBase}
        labels={options.labels}
        pages={pages}
      />,
    );
  render();

  const api: JournalApi = {
    setLocale: (next, nextPages) => {
      locale = next;
      pages = nextPages;
      // a re-render keeps the WebGL context and the textures that are already
      // on the GPU; only the words change
      render();
    },
    open: () => window.dispatchEvent(new CustomEvent(OPEN_EVENT)),
    destroy: () => {
      root.unmount();
      container.remove();
      if (active && active.container === container) active = null;
    },
  };

  active = { root, container, render };
  return api;
}

/** Switch the language of a mounted journal. */
export function setLocale(locale: Locale, pages: JournalPage[]) {
  active?.render(locale, pages);
}

/** Remove the journal and release its resources. */
export function destroy() {
  if (!active) return;
  active.root.unmount();
  active.container.remove();
  active = null;
}
