# Moon · Personal Space

A static personal site — 3D scroll-driven portfolio with a working flipbook journal.
No build step: plain HTML + CSS + JS, ready for GitHub Pages.

```
index.html          # structure + inline SVG paper filter
css/styles.css      # all styles (responsive + keyframes)
js/data.js          # bilingual content: I18N text, projects, journal spreads
js/main.js          # interactions: language toggle, scroll animation, 3D flipbook
assets/             # images
```

## Editing content

Everything editable lives in `js/data.js`:

- `I18N.zh` / `I18N.en` → `aboutBio`, `aboutIdentity`, `aboutLocation`
- `I18N[key].projects` → gallery cards (`num` / `title` / `description` / `image` / `tags` / `github`)
  Add `projectUrl` to show a second button next to *GitHub ↗*.
- `I18N[key].journalSpreads` → the flipbook, two pages per spread (`leftHtml` / `rightHtml`).
  The first left page is printed on the inside of the cover, so the cover's back
  face carries `spreads[0].leftHtml` automatically.

## The journal book

The notebook is a real 3D object: the cover is a leaf with a hardcover outside and
the first page on its inside, the page block has thickness (spine, fore-edge),
and every layer owns an explicit `translateZ` — inside a `preserve-3d` context
`z-index` does not decide the order, depth does.

## Local preview

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

Push to `main`; Pages is served from the repository root.
