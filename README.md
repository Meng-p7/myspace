# Hi 👋

This is my own homepage — a personal space with a scroll-driven 3D portfolio
and a notebook journal whose pages you can really turn.

Plain HTML / CSS / JavaScript on the page itself; the journal is a separate
3D module (React + three.js) that is fetched only when the reader reaches it.

🌐 https://meng-p7.github.io/myspace/

---

```
index.html            the page
css/styles.css        site styles
js/data.js            bilingual content: About, projects, the ten journal pages
js/main.js            language toggle, scroll animation, projects gallery
src/journal3d/        the 3D pop-up book (Vite + React + three.js)
  src/core/fold.ts      folding maths: pages, creased floors, camera
  src/core/sketch.ts    the hand-drawn renderer (ink, watercolour, mask)
  src/core/paper.ts     the paper shader
  src/core/surface.ts   baking a drawing into textures
  src/core/textures.ts  the texture worker queue
  src/scenes/           the four rooms: First Build, The Lab, With Her, Elsewhere
  src/components/       the book, the hotspots, the reading panel
```

## The journal

`mountJournal()` / `setLocale()` / `destroy()` — the page never touches the
3D module's internals. Switching language re-renders the panel and keeps the
WebGL context and the textures that are already on the GPU.

The ten journal pages live in `js/data.js` as structured data; the module
draws the rooms and the paper, the page owns the words. If WebGL is missing,
the same pages are still readable as plain cards.

## Local preview

```bash
python -m http.server 8000                   # the site
cd src/journal3d && npm i && npm run dev     # the journal alone
```

## Deploy

Push to `main`. The workflow builds the 3D module and publishes the site to
GitHub Pages.
