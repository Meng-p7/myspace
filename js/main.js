/* =========================================================
   Moon Portfolio — Interactions & Scroll-Driven Animation
   Requires js/data.js (I18N, currentLang) to be loaded first.

   Performance model: section geometry is measured once per
   layout change (resize / content swap / image load) and kept
   in M. Scroll frames only read window.scrollY and write
   cached, de-duplicated style values — no layout reads inside
   the animation frame, no writes for unchanged values.
========================================================= */

/* =========================================================
   SMALL HELPERS
========================================================= */
function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}

/* De-duplicated style writes: scrolling past a settled stage
   must not invalidate style/composite every frame. */
const styleCache = new WeakMap();
function w(el, prop, val) {
  if (!el) return;
  let c = styleCache.get(el);
  if (!c) { c = {}; styleCache.set(el, c); }
  if (c[prop] === val) return;
  c[prop] = val;
  el.style.setProperty(prop, val);
}
function cls(el, name, on) {
  if (el.classList.contains(name) !== on) el.classList.toggle(name, on);
}

/* =========================================================
   RENDER & COPY EMAIL
========================================================= */
const langToggleBtn = document.getElementById("langToggleBtn");
const aboutBioEl = document.getElementById("aboutBio");
const aboutIdentityEl = document.getElementById("aboutIdentity");
const aboutLocationEl = document.getElementById("aboutLocation");
const copyEmailBtn = document.getElementById("copyEmailBtn");
const inplaceProjectsTitle = document.getElementById("inplaceProjectsTitle");
const backToTopBtn = document.getElementById("backToTopBtn");

copyEmailBtn.addEventListener("click", () => {
  const email = "dreamxiang4413@gmail.com";
  const onSuccess = () => {
    copyEmailBtn.classList.add("copied");
    copyEmailBtn.textContent = I18N[currentLang].copiedBtn;
    setTimeout(() => {
      copyEmailBtn.classList.remove("copied");
      copyEmailBtn.textContent = I18N[currentLang].copyBtn;
    }, 1800);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(email).then(onSuccess).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      onSuccess();
    });
  } else {
    const ta = document.createElement("textarea");
    ta.value = email;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    onSuccess();
  }
});

function renderProjects(data) {
  const track = document.getElementById("galleryTrack");
  track.innerHTML = data.projects.map((p, idx) => `
    <article class="project-card${p.tone === "light" ? " is-light" : ""}" data-index="${idx}">
      <img src="${p.image}"
           srcset="${p.imageSm} 600w, ${p.image} 1200w"
           sizes="(max-width: 768px) 84vw, 52vw"
           style="--ar: ${p.ar || "4 / 3"}"
           loading="lazy" decoding="async"
           alt="${p.title}" class="project-card-img" />
      <div class="project-card-content">
        <div class="project-card-top">
          <span class="project-num">PROJECT // ${p.num}</span>
        </div>
        <div class="project-card-bottom">
          <h4 class="project-title">${p.title}</h4>
          <p class="project-desc">${p.description}</p>
          <div class="project-footer-row">
            <div class="project-tags">
              ${p.tags.map(t => `<span class="project-tag">${t}</span>`).join("")}
            </div>
            <div class="project-btn-group">
              ${p.projectUrl ? `<a href="${p.projectUrl}" target="_blank" rel="noopener noreferrer" class="project-github-btn">${p.projectLabel}</a>` : ""}
              ${p.github ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="project-github-btn">GitHub ↗</a>` : ""}
            </div>
          </div>
        </div>
      </div>
    </article>
  `).join("");
  // Natural-ratio mobile images change the track height once decoded.
  track.querySelectorAll("img").forEach(img => {
    if (!img.complete) img.addEventListener("load", scheduleMetricsRefresh, { once: true });
  });
}

/* =========================================================
   JOURNAL 3D FLIPBOOK ENGINE (ONE SINGLE NOTEBOOK)
   spread mode: two-page leaves on a centre spine (desktop /
   landscape). single mode: one page per view, leaves turn on
   the left spine exactly like a real book held in one hand.
========================================================= */
let currentSpread = 0;
let currentPage = 0;
let journalMode = "spread";
let journalOpenK = 1;
const spreadBaseGrid = document.getElementById("spreadBaseGrid");
const flipSheetsLayer = document.getElementById("flipSheetsLayer");
const journalCounter = document.getElementById("journalCounter");
const journalPrevBtn = document.getElementById("journalPrevBtn");
const journalNextBtn = document.getElementById("journalNextBtn");
const flipSheets = [];
let singleSheet = null;
let singleBusy = false;
let singleFlipShade = 0;
let journalPages = [];

const ENDPLATE_HTML = `
  <div class="endpaper-plate">
    <span class="endpaper-rule"></span>
    <span class="endpaper-title">Ex Libris</span>
    <span class="endpaper-name">Moon</span>
    <span class="endpaper-sub">Shanghai · MMXXVI</span>
    <span class="endpaper-rule"></span>
  </div>
`;

function detectJournalMode() {
  if (prefersReducedMotion) return "static";
  const vw = window.innerWidth, vh = window.innerHeight;
  if (vw > 820) return "spread";
  if (vw > vh && vw >= 560) return "spread"; // phone landscape: room for a spread
  return "single";
}

function baseRightEl() {
  return document.getElementById("baseRightPage");
}

function initJournalBook(spreads) {
  const n = spreads.length;
  journalPages = spreads.flatMap(s => [s.leftHtml, s.rightHtml]);
  const mode = detectJournalMode();
  const modeChanged = mode !== journalMode;
  journalMode = mode;
  notebookBook.classList.toggle("is-single", mode === "single");
  notebookStage.classList.toggle("is-single", mode === "single");
  journalStage.classList.toggle("is-static", mode === "static");
  singleBusy = false;
  singleFlipShade = 0;

  if (mode === "spread") {
    // The first left page lives on the inside of the cover: opening the book
    // turns the cover over and that page is really there, so nothing has to fade
    // or be clipped into place. The base left slot stays empty on purpose.
    document.getElementById("coverBackPage").innerHTML = spreads[0].leftHtml;
    spreadBaseGrid.innerHTML = `
      <div class="journal-page journal-page-left" id="baseLeftPage"></div>
      <div class="journal-page journal-page-right" id="baseRightPage">${spreads[n - 1].rightHtml}</div>
    `;
    flipSheetsLayer.innerHTML = "";
    flipSheets.length = 0;
    singleSheet = null;

    for (let i = 0; i < n - 1; i++) {
      const sheet = document.createElement("div");
      sheet.className = "flip-sheet";
      sheet.dataset.sheetIndex = String(i);
      sheet.style.zIndex = String(n - i);
      sheet.innerHTML = `
        <div class="flip-face flip-face-front journal-page journal-page-right">
          ${spreads[i].rightHtml}
          <div class="page-corner-cue" aria-hidden="true"></div>
          <div class="flip-shadow-overlay"></div>
        </div>
        <div class="flip-face flip-face-back journal-page journal-page-left">
          ${spreads[i + 1].leftHtml}
          <div class="flip-shadow-overlay"></div>
        </div>
      `;
      attachSheetInteraction(sheet, i);
      flipSheetsLayer.appendChild(sheet);
      flipSheets.push(sheet);
    }
    if (modeChanged) currentSpread = clamp(Math.floor(currentPage / 2), 0, n - 1);
  } else if (mode === "single") {
    // Inside of the hard cover is a cream endpaper with a bookplate;
    // page 01 waits underneath as real paper, revealed by the cover turn.
    document.getElementById("coverBackPage").innerHTML = ENDPLATE_HTML;
    spreadBaseGrid.innerHTML = `
      <div class="journal-page journal-page-left" id="baseLeftPage"></div>
      <div class="journal-page journal-page-right" id="baseRightPage"></div>
    `;
    flipSheetsLayer.innerHTML = "";
    flipSheets.length = 0;
    singleSheet = document.createElement("div");
    singleSheet.className = "flip-sheet single-sheet";
    singleSheet.style.visibility = "hidden";
    singleSheet.innerHTML = `
      <div class="flip-face flip-face-front journal-page journal-page-right"><div class="flip-shadow-overlay"></div></div>
      <div class="flip-face flip-face-back journal-page journal-page-left"><div class="flip-shadow-overlay"></div></div>
    `;
    flipSheetsLayer.appendChild(singleSheet);
    if (modeChanged) currentPage = clamp(currentSpread * 2, 0, journalPages.length - 1);
    singleShow(currentPage);
  } else {
    // Reduced motion: every page as a calm static stack, still complete.
    document.getElementById("coverBackPage").innerHTML = "";
    spreadBaseGrid.innerHTML =
      `<div class="static-pages">` +
      journalPages.map(h => `<div class="journal-page">${h}</div>`).join("") +
      `</div>`;
    flipSheetsLayer.innerHTML = "";
    flipSheets.length = 0;
    singleSheet = null;
  }
  updateJournalUI();
}

/* How open the book is: 1 = lying open, 0 = shut. Used to pull the turned
   leaves back to the right when the book is being closed. */
let journalCloseK = 1;

/* Depth of a leaf inside the book. Unturned leaves stack with the first
   one on top; turned ones land on the left, each above the last. */
function sheetDepth(idx, turned) {
  const count = Math.max(1, flipSheets.length);
  return turned ? 4 + idx * 1.6 : 4 + (count - 1 - idx) * 1.6;
}

/* Place every leaf. A leaf that is turned while the book is closing falls
   back towards the right, the way real pages drop when you shut a book. */
function applySheetTransforms() {
  flipSheets.forEach((sheet, idx) => {
    const turned = idx < currentSpread;
    const frac = turned
      ? Math.max(0, Math.min(1, (journalCloseK - idx * 0.06) / 0.34))
      : 0;
    const inFlight = frac > 0.02 && frac < 0.98;
    const z = inFlight ? 16 : sheetDepth(idx, frac >= 0.5);
    w(sheet, "transform", `translateZ(${z.toFixed(1)}px) rotateY(${(-180 * frac).toFixed(1)}deg)`);
    w(sheet, "z-index", turned ? String(10 + idx) : String(30 - idx));
    cls(sheet, "is-flipped", turned && frac > 0.5);
  });
}

function updateJournalUI() {
  if (journalMode === "single") {
    const total = journalPages.length;
    journalCounter.textContent = `${pad2(currentPage + 1)} / ${pad2(total)}`;
    journalPrevBtn.disabled = currentPage === 0;
    journalNextBtn.disabled = currentPage === total - 1;
    return;
  }
  if (journalMode === "static") {
    journalCounter.textContent = `${pad2(journalPages.length)} pages`;
    journalPrevBtn.disabled = true;
    journalNextBtn.disabled = true;
    return;
  }
  const spreads = I18N[currentLang].journalSpreads;
  const total = spreads.length;
  journalCounter.textContent = `${pad2(currentSpread + 1)} / ${pad2(total)}`;
  journalPrevBtn.disabled = currentSpread === 0;
  journalNextBtn.disabled = currentSpread === total - 1;
  applySheetTransforms();
}

/* ---------- single-page leaf mechanics ---------- */
function singleFaces(frontHtml, backHtml) {
  const front = singleSheet.children[0];
  const back = singleSheet.children[1];
  front.innerHTML = frontHtml +
    `<div class="page-corner-cue" aria-hidden="true"></div><div class="flip-shadow-overlay"></div>`;
  back.innerHTML = backHtml + `<div class="flip-shadow-overlay"></div>`;
}
function singleSetBase(k) {
  const el = baseRightEl();
  if (el) el.innerHTML = journalPages[k];
}
function singleShade(v) {
  singleFlipShade = v;
  if (!singleSheet) return;
  const o = v.toFixed(3);
  const fo = singleSheet.children[0].querySelector(".flip-shadow-overlay");
  const bo = singleSheet.children[1].querySelector(".flip-shadow-overlay");
  if (fo) fo.style.opacity = o;
  if (bo) bo.style.opacity = o;
}
function singleShow(k) {
  currentPage = clamp(k, 0, journalPages.length - 1);
  singleSetBase(currentPage);
  if (singleSheet) {
    singleSheet.style.visibility = "hidden";
    singleSheet.classList.remove("dragging");
    singleSheet.style.transform = "translateZ(0px) rotateY(0deg)";
  }
  singleShade(0);
  updateJournalUI();
}
/* Lift the leaf that is about to turn. dir +1 = forward. */
function singleBegin(dir) {
  const k = currentPage, t = k + dir;
  if (t < 0 || t >= journalPages.length || !singleSheet) return false;
  singleBusy = true;
  singleFaces(dir > 0 ? journalPages[k] : journalPages[t],
              dir > 0 ? journalPages[t] : journalPages[k]);
  singleSetBase(dir > 0 ? t : k);
  singleSheet.style.visibility = "visible";
  singleSheet.style.zIndex = "60";
  singleSheet.classList.add("dragging");
  singleSheet.style.transform = `translateZ(14px) rotateY(${dir > 0 ? 0 : -180}deg)`;
  return true;
}
/* Let the leaf fall to its destination (or spring back). */
function singleFinish(dir, complete, crossed) {
  if (!singleSheet) { singleBusy = false; return; }
  const k = currentPage, t = k + dir;
  singleSheet.classList.remove("dragging");
  const endDeg = complete ? (dir > 0 ? -180 : 0) : (dir > 0 ? 0 : -180);
  // Paper underneath: swap at the moment the leaf stands edge-on.
  if (dir < 0 && complete && !crossed) setTimeout(() => { if (singleBusy) singleSetBase(t); }, 480);
  if (!complete && crossed) setTimeout(() => { if (singleBusy) singleSetBase(k); }, 480);
  if (!complete && !crossed && dir > 0) singleSetBase(k);
  singleShade(0.42);
  setTimeout(() => { if (singleBusy) singleShade(0); }, 500);
  singleSheet.style.transform = `translateZ(14px) rotateY(${endDeg}deg)`;
  let done = false;
  const finalize = () => {
    if (done) return;
    done = true;
    singleSheet.removeEventListener("transitionend", onEnd);
    singleBusy = false;
    currentPage = complete ? t : k;
    singleSetBase(currentPage);
    singleSheet.style.visibility = "hidden";
    singleShade(0);
    updateJournalUI();
  };
  const onEnd = (e) => { if (e.propertyName === "transform") finalize(); };
  singleSheet.addEventListener("transitionend", onEnd);
  setTimeout(finalize, 1100);
}
function singleTurn(dir) {
  if (singleBusy || journalMode !== "single") return;
  if (!singleBegin(dir)) return;
  void singleSheet.offsetWidth; // commit the start pose before transitioning
  singleFinish(dir, true, false);
}

/* ---------- spread leaf drag (axis-locked so vertical scroll stays native) ---------- */
function attachSheetInteraction(sheet, idx) {
  let startX = 0, startY = 0;
  let isDragging = false;
  let moved = false;
  let decided = 0; // 0 undecided, 1 horizontal flip, 2 vertical scroll

  sheet.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a")) return;
    isDragging = true;
    moved = false;
    decided = 0;
    startX = e.clientX;
    startY = e.clientY;
    sheet.setPointerCapture(e.pointerId);
  });

  sheet.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!decided) {
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.15) decided = 1;
      else if (Math.abs(dy) > 8) decided = 2;
      else return;
      if (decided === 1) {
        sheet.classList.add("dragging");
        w(sheet, "z-index", "50");
      }
    }
    if (decided !== 1) return;
    if (Math.abs(dx) > 6) moved = true;
    const width = Math.max(200, sheet.offsetWidth);
    const isCurrentlyFlipped = idx < currentSpread;
    let deg;
    if (!isCurrentlyFlipped) {
      const progress = Math.max(0, Math.min(1, -dx / width));
      deg = -progress * 180;
    } else {
      const progress = Math.max(0, Math.min(1, dx / width));
      deg = -180 + progress * 180;
    }
    w(sheet, "transform", `translateZ(14px) rotateY(${deg.toFixed(1)}deg)`);
  });

  sheet.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    sheet.classList.remove("dragging");
    const dx = e.clientX - startX;
    const isCurrentlyFlipped = idx < currentSpread;

    if (decided !== 1) {
      if (decided === 0) goToSpread(isCurrentlyFlipped ? idx : idx + 1); // tap
      else updateJournalUI(); // vertical scroll took over: restore pose
      return;
    }
    if (!moved) {
      goToSpread(isCurrentlyFlipped ? idx : idx + 1);
      return;
    }
    const threshold = Math.max(60, sheet.offsetWidth * 0.25);
    if (!isCurrentlyFlipped && dx < -threshold) goToSpread(idx + 1);
    else if (isCurrentlyFlipped && dx > threshold) goToSpread(idx);
    else updateJournalUI();
  });

  sheet.addEventListener("pointercancel", () => {
    isDragging = false;
    sheet.classList.remove("dragging");
    updateJournalUI();
  });
}

function goToSpread(idx) {
  const spreads = I18N[currentLang].journalSpreads;
  currentSpread = Math.max(0, Math.min(spreads.length - 1, idx));
  updateJournalUI();
}

journalPrevBtn.addEventListener("click", () => {
  if (journalMode === "single") singleTurn(-1);
  else goToSpread(currentSpread - 1);
});
journalNextBtn.addEventListener("click", () => {
  if (journalMode === "single") singleTurn(1);
  else goToSpread(currentSpread + 1);
});

/* ---------- single-page touch drag on the book itself ----------
   touch-action: pan-y keeps vertical scrolling native; only a
   clearly horizontal gesture is captured as a page turn.
   (Listeners are attached at boot, once DOM refs exist.) */
let sd = null;
function attachBookInteraction() {
notebookBook.addEventListener("pointerdown", (e) => {
  if (journalMode !== "single" || journalOpenK < 0.85 || singleBusy) return;
  if (e.target.closest("a, button")) return;
  sd = { x: e.clientX, y: e.clientY, decided: 0, dir: 0, crossed: false, W: notebookBook.clientWidth };
});
notebookBook.addEventListener("pointermove", (e) => {
  if (!sd) return;
  const dx = e.clientX - sd.x, dy = e.clientY - sd.y;
  if (!sd.decided) {
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.15) {
      sd.dir = dx < 0 ? 1 : -1;
      if (!singleBegin(sd.dir)) { sd = null; return; }
      sd.decided = 1;
      notebookBook.setPointerCapture(e.pointerId);
    } else if (Math.abs(dy) > 10) {
      sd.decided = 2;
    } else return;
  }
  if (sd.decided !== 1) return;
  const prog = sd.dir > 0 ? clamp(-dx / sd.W, 0, 1) : clamp(dx / sd.W, 0, 1);
  const deg = sd.dir > 0 ? -180 * prog : -180 + 180 * prog;
  singleSheet.style.transform = `translateZ(14px) rotateY(${deg.toFixed(1)}deg)`;
  singleShade(Math.sin(prog * Math.PI) * 0.5);
  if (sd.dir < 0 && prog > 0.5 && !sd.crossed) { sd.crossed = true; singleSetBase(currentPage - 1); }
  if (sd.dir > 0 && prog < 0.5 && sd.crossed) { sd.crossed = false; singleSetBase(currentPage + 1); }
});
notebookBook.addEventListener("pointerup", (e) => {
  if (!sd) return;
  const s = sd;
  sd = null;
  if (s.decided !== 1) {
    if (s.decided === 0 && journalOpenK > 0.85) {
      const rect = notebookBook.getBoundingClientRect();
      const rel = (e.clientX - rect.left) / Math.max(1, rect.width);
      singleTurn(rel < 0.3 ? -1 : 1);
    }
    return;
  }
  const dx = e.clientX - s.x;
  const complete = s.dir > 0 ? dx < -s.W * 0.22 : dx > s.W * 0.22;
  singleFinish(s.dir, complete, s.crossed);
});
notebookBook.addEventListener("pointercancel", () => {
  if (!sd) return;
  const s = sd;
  sd = null;
  if (s.decided === 1) singleFinish(s.dir, false, s.crossed);
});
}

function applyLanguage(lang) {
  currentLang = lang;
  const data = I18N[lang];
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  langToggleBtn.textContent = lang === "zh" ? "EN" : "中";
  aboutBioEl.textContent = data.aboutBio;
  aboutIdentityEl.textContent = data.aboutIdentity;
  aboutLocationEl.textContent = data.aboutLocation;
  copyEmailBtn.textContent = data.copyBtn;
  inplaceProjectsTitle.textContent = data.projectsTitle;
  backToTopBtn.textContent = data.backToTop;

  renderProjects(data);
  initJournalBook(data.journalSpreads);
  refreshMetrics();
}

langToggleBtn.addEventListener("click", () => {
  applyLanguage(currentLang === "zh" ? "en" : "zh");
});

/* =========================================================
   HOME COLOR REVEAL — pointer spotlight on desktop, a slow
   drifting light + touch follow on phones (rAF, throttled).
========================================================= */
const homeLayer = document.getElementById("homeLayer");
const homeSpotlightImg = document.getElementById("homeSpotlightImg");
const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
let spotTouch = null;
let spotRaf = 0;
let lastSpotWrite = 0;

homeLayer.addEventListener("pointermove", (e) => {
  const rect = homeLayer.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  if (isCoarsePointer) {
    spotTouch = { x, y, until: performance.now() + 1600 };
  } else {
    homeSpotlightImg.style.setProperty("--mx", `${x.toFixed(2)}%`);
    homeSpotlightImg.style.setProperty("--my", `${y.toFixed(2)}%`);
  }
});

/* Pull-to-refresh guard for older iOS Safari, which ignores
   `overscroll-behavior`. Block ONLY a downward pull while the page is at the
   very top over Home — never normal scrolling, never the spotlight follow.
   Modern Chrome/Safari already handle this in CSS; this is a narrow fallback. */
let homeTouchStartY = 0;
homeLayer.addEventListener("touchstart", (e) => {
  homeTouchStartY = e.touches.length ? e.touches[0].clientY : 0;
}, { passive: true });
homeLayer.addEventListener("touchmove", (e) => {
  if (window.scrollY > 1) return;                       // scrolled down: let native scroll run
  const t = e.touches[0];
  if (!t || t.clientY <= homeTouchStartY + 1) return;   // not pulling downward
  e.preventDefault();                                    // suppress refresh only
}, { passive: false });

function spotLoopAllowed() {
  return isCoarsePointer && !prefersReducedMotion && lastP.reveal < 0.62;
}
function spotTick(t) {
  spotRaf = 0;
  if (!spotLoopAllowed()) return;
  if (t - lastSpotWrite > 66) { // ~15fps: a slow light, not a repaint storm
    lastSpotWrite = t;
    let mx, my;
    if (spotTouch && t < spotTouch.until) {
      mx = spotTouch.x; my = spotTouch.y;
    } else {
      mx = 50 + 24 * Math.sin(t * 0.00021);
      my = 56 + 16 * Math.sin(t * 0.00013 + 1.7);
    }
    homeSpotlightImg.style.setProperty("--mx", `${mx.toFixed(2)}%`);
    homeSpotlightImg.style.setProperty("--my", `${my.toFixed(2)}%`);
  }
  spotRaf = requestAnimationFrame(spotTick);
}
function ensureSpotLoop() {
  if (spotLoopAllowed() && !spotRaf) spotRaf = requestAnimationFrame(spotTick);
}

/* =========================================================
   NAVIGATION & SMOOTH ANCHOR SCROLLING
   Anchors land on the moment of the scroll timeline where the
   section is actually readable, not on a raw pixel marker.
========================================================= */
const siteNav = document.getElementById("siteNav");
const navLinks = document.getElementById("navLinks");
const navToggle = document.getElementById("navToggle");
const navItems = Array.from(document.querySelectorAll(".nav-link"));

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

function sectionScrollTarget(key) {
  if (key === "about") return M.revealTop + M.revealSc * 0.58;
  if (key === "projects") return M.vw > 768 ? M.galleryTop + M.gallerySc * 0.12 : Math.max(0, M.galleryTop - 8);
  if (key === "journal") return M.journalTop + M.journalSc * (journalMode === "static" ? 0 : 0.8);
  return 0;
}

navItems.forEach(link => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("data-target");
    e.preventDefault();
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    window.scrollTo({ top: sectionScrollTarget(targetId), behavior: "smooth" });
  });
});

document.getElementById("scrollToAboutBtn").addEventListener("click", () => {
  window.scrollTo({ top: sectionScrollTarget("about"), behavior: "smooth" });
});

backToTopBtn.addEventListener("click", (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* =========================================================
   SCROLL-DRIVEN ANIMATIONS & 3D TRANSITIONS
========================================================= */
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealStage = document.getElementById("revealStage");
const paperSheet = document.getElementById("paperSheet");
const paperCurlLip = document.getElementById("paperCurlLip");
const paperCastShadow = document.getElementById("paperCastShadow");
const paperSketchDecor = document.getElementById("paperSketchDecor");
const paperFiberLayer = document.querySelector(".paper-fiber-layer");
const aboutContainer = document.getElementById("aboutContainer");
const aboutLeft = document.getElementById("aboutLeft");
const aboutRight = document.getElementById("aboutRight");

const inplaceExhibitionLayer = document.getElementById("inplaceExhibitionLayer");
const exhLineTop = document.getElementById("exhLineTop");
const exhLineBottom = document.getElementById("exhLineBottom");
const exhFrame1 = document.getElementById("exhFrame1");
const exhFrame2 = document.getElementById("exhFrame2");
const exhFrame3 = document.getElementById("exhFrame3");

const galleryScrollZone = document.getElementById("projects");
const galleryTrack = document.getElementById("galleryTrack");
const galleryProgressFill = document.getElementById("galleryProgressFill");

const journalStage = document.getElementById("journalStage");
const deskBackdrop = document.getElementById("deskBackdrop");
const deskPropLeft = document.getElementById("deskPropLeft");
const deskPencil = document.getElementById("deskPencil");
const journalHeader = document.getElementById("journalHeader");
const notebookStage = document.getElementById("notebookStage");
const notebookBook = document.getElementById("notebookBook");
const notebookFrontCover = document.getElementById("notebookFrontCover");
const notebookCoverShadow = document.getElementById("notebookCoverShadow");
const notebookBlockRight = document.getElementById("notebookBlockRight");
const notebookBlockBottom = document.getElementById("notebookBlockBottom");
const notebookDeskShadow = document.querySelector(".notebook-desk-shadow");
const notebookTurnShadeFront = document.querySelector(".notebook-turn-shade-front");
const notebookTurnShadeBack = document.querySelector(".notebook-turn-shade-back");
const endingSection = document.getElementById("ending");

/* ---- cached geometry: measured on layout changes only ---- */
const M = {
  vw: 0, vh: 0,
  revealTop: 0, revealSc: 1,
  galleryTop: 0, gallerySc: 1, galleryMax: 0,
  journalTop: 0, journalSc: 1,
  endingTop: 0,
  cards: []
};
const lastP = { reveal: -1, gallery: -1, journal: -1 };
let lastTheme = "";
let lastActive = "";

function pageTop(el) {
  let t = 0;
  while (el) { t += el.offsetTop; el = el.offsetParent; }
  return t;
}

/* Paper fiber: the SVG turbulence filter is gorgeous on desktop but
   re-rasterises under scroll on phones. Bake an equivalent warm speckle
   tile once into a canvas and repeat it — same look, zero filter cost. */
let fiberTile = null;
function makeFiberTile() {
  const c = document.createElement("canvas");
  c.width = c.height = 120;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#f6f3eb";
  ctx.fillRect(0, 0, 120, 120);
  for (let i = 0; i < 2400; i++) {
    const x = Math.random() * 120, y = Math.random() * 120;
    const dark = Math.random() < 0.55;
    const a = 0.028 + Math.random() * 0.05;
    ctx.fillStyle = dark ? `rgba(122,110,88,${a})` : `rgba(255,255,250,${a * 1.2})`;
    ctx.fillRect(x, y, Math.random() < 0.2 ? 2 : 1, 1);
  }
  for (let i = 0; i < 26; i++) {
    ctx.strokeStyle = `rgba(140,128,104,${0.03 + Math.random() * 0.04})`;
    ctx.lineWidth = 0.6;
    const x = Math.random() * 120, y = Math.random() * 120;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 14, y + (Math.random() - 0.5) * 5);
    ctx.stroke();
  }
  return c.toDataURL("image/png");
}
function applyFiberMode() {
  const mobile = M.vw <= 820;
  if (mobile) {
    if (paperFiberLayer.dataset.mode !== "tile") {
      if (!fiberTile) fiberTile = makeFiberTile();
      paperFiberLayer.dataset.mode = "tile";
      paperFiberLayer.style.filter = "none";
      paperFiberLayer.style.mixBlendMode = "normal";
      paperFiberLayer.style.backgroundImage = `url(${fiberTile})`;
      paperFiberLayer.style.backgroundSize = "120px 120px";
      paperFiberLayer.style.opacity = "0.6";
    }
  } else if (paperFiberLayer.dataset.mode !== "svg") {
    paperFiberLayer.dataset.mode = "svg";
    paperFiberLayer.style.filter = "";
    paperFiberLayer.style.mixBlendMode = "";
    paperFiberLayer.style.backgroundImage = "";
    paperFiberLayer.style.backgroundSize = "";
    paperFiberLayer.style.opacity = "";
  }
}

let metricsRaf = 0;
function scheduleMetricsRefresh() {
  if (metricsRaf) return;
  metricsRaf = requestAnimationFrame(() => {
    metricsRaf = 0;
    refreshMetrics();
  });
}

function refreshMetrics() {
  const nextMode = detectJournalMode();
  if (nextMode !== journalMode) initJournalBook(I18N[currentLang].journalSpreads);

  M.vw = window.innerWidth;
  M.vh = window.innerHeight;
  M.revealTop = pageTop(revealStage);
  M.revealSc = Math.max(1, revealStage.offsetHeight - M.vh);
  M.galleryTop = pageTop(galleryScrollZone);
  M.gallerySc = Math.max(1, galleryScrollZone.offsetHeight - M.vh);
  M.journalTop = pageTop(journalStage);
  M.journalSc = Math.max(1, journalStage.offsetHeight - M.vh);
  M.endingTop = pageTop(endingSection);
  M.cards = Array.from(galleryTrack.children).map(c => ({
    el: c,
    left: c.offsetLeft - galleryTrack.offsetLeft,
    width: c.offsetWidth
  }));
  M.galleryMax = Math.max(0, galleryTrack.scrollWidth - M.vw + M.vw * 0.08);

  applyFiberMode();
  lastP.reveal = lastP.gallery = lastP.journal = -1;

  if (M.vw <= 768) {
    w(galleryTrack, "transform", "");
    M.cards.forEach(c => { w(c.el, "transform", ""); w(c.el, "opacity", ""); });
    updateMobileGallery();
  }
  updateScrollAnimations(window.scrollY);
}

/* ---- mobile projects: 3D driven by the track's own horizontal scroll ---- */
let mobileGalleryRaf = 0;
function updateMobileGallery() {
  const sl = galleryTrack.scrollLeft;
  const vw = M.vw || window.innerWidth;
  const max = Math.max(1, galleryTrack.scrollWidth - galleryTrack.clientWidth);
  w(galleryProgressFill, "width", `${(clamp(sl / max, 0, 1) * 100).toFixed(1)}%`);
  M.cards.forEach(c => {
    const center = c.left + c.width / 2 - sl;
    const norm = clamp((center - vw / 2) / (vw * 0.62), -1.15, 1.15);
    const rotY = -norm * 12;
    const scale = 1 - Math.abs(norm) * 0.06;
    const tz = -Math.abs(norm) * 70;
    w(c.el, "transform", `perspective(1100px) translateZ(${tz.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`);
    w(c.el, "opacity", (1 - Math.abs(norm) * 0.12).toFixed(3));
  });
}
galleryTrack.addEventListener("scroll", () => {
  if (mobileGalleryRaf) return;
  mobileGalleryRaf = requestAnimationFrame(() => {
    mobileGalleryRaf = 0;
    if (window.innerWidth <= 768) updateMobileGallery();
  });
}, { passive: true });

/* ---- the one scroll frame: reads scrollY, writes cached values ---- */
function updateScrollAnimations(sy) {
  const vh = M.vh, vw = M.vw;

  if (!prefersReducedMotion) {
    // --- 1. HOME -> 3D PAPER -> ABOUT -> IN-PLACE "MY PROJECTS" ---
    const p = clamp((sy - M.revealTop) / M.revealSc, 0, 1);
    if (Math.abs(p - lastP.reveal) > 0.0004) {
      lastP.reveal = p;

      const riseProgress = clamp((p - 0.03) / 0.45, 0, 1);
      const easedRise = easeOutCubic(riseProgress);
      const translateY = (1 - easedRise) * 104;

      w(homeLayer, "transform", `scale(${(1 - easedRise * 0.035).toFixed(4)})`);
      w(paperSheet, "transform", `translate3d(0, ${translateY.toFixed(3)}%, 0)`);
      cls(paperSheet, "is-settled", p >= 0.45);

      const curlIntensity = Math.sin(riseProgress * Math.PI);
      w(paperCurlLip, "transform", `perspective(900px) rotateX(${(-38 * curlIntensity).toFixed(2)}deg) scaleY(${(0.65 + 0.55 * curlIntensity).toFixed(3)})`);
      w(paperCurlLip, "opacity", riseProgress > 0.01 && riseProgress < 0.99 ? "1" : "0");

      w(paperCastShadow, "opacity", clamp(curlIntensity * 1.15, 0, 1).toFixed(3));
      w(paperCastShadow, "transform", `scaleY(${(0.8 + curlIntensity * 0.5).toFixed(3)})`);

      // About Me fades in (0.40..0.58), holds (0.58..0.72), fades out IN PLACE (0.72..0.85)
      const fadeInLeft = easeOutCubic(clamp((p - 0.40) / 0.18, 0, 1));
      const fadeInRight = easeOutCubic(clamp((p - 0.44) / 0.18, 0, 1));
      const fadeOutP = clamp((p - 0.72) / 0.14, 0, 1);

      w(aboutLeft, "opacity", (fadeInLeft * (1 - fadeOutP)).toFixed(3));
      w(aboutLeft, "transform", `translate3d(0, ${((1 - fadeInLeft) * 26 - fadeOutP * 18).toFixed(1)}px, 0)`);
      w(aboutRight, "opacity", (fadeInRight * (1 - fadeOutP)).toFixed(3));
      w(aboutRight, "transform", `translate3d(0, ${((1 - fadeInRight) * 28 - fadeOutP * 14).toFixed(1)}px, 0)`);
      w(aboutContainer, "pointer-events", fadeOutP > 0.6 ? "none" : "auto");
      w(paperSketchDecor, "opacity", (0.48 * (1 - fadeOutP)).toFixed(3));

      // In-place "My Projects" 3D Exhibition Frames (0.76..1.00)
      const exhP = clamp((p - 0.76) / 0.22, 0, 1);
      const eExh = easeOutCubic(exhP);
      w(inplaceExhibitionLayer, "opacity", eExh.toFixed(3));

      const lineScale = (12 + eExh * 80) / 92;
      w(exhLineTop, "transform", `translateX(-50%) scaleX(${lineScale.toFixed(4)})`);
      w(exhLineBottom, "transform", `translateX(-50%) scaleX(${lineScale.toFixed(4)})`);

      w(exhFrame1, "transform", `translate3d(${((1 - eExh) * -70).toFixed(1)}px, 0, ${(eExh * 60).toFixed(1)}px) rotateY(${(14 - eExh * 6).toFixed(1)}deg)`);
      w(exhFrame2, "transform", `translate3d(${((1 - eExh) * 70).toFixed(1)}px, 0, ${(eExh * 35).toFixed(1)}px) rotateY(${(-14 + eExh * 6).toFixed(1)}deg)`);
      w(exhFrame3, "transform", `translate3d(0, ${((1 - eExh) * 35).toFixed(1)}px, ${(-35 + eExh * 35).toFixed(1)}px)`);
      w(inplaceProjectsTitle, "transform", `translate3d(0, ${((1 - eExh) * 24).toFixed(1)}px, 0) scale(${(0.94 + eExh * 0.06).toFixed(3)})`);
      ensureSpotLoop();
    }

    // --- 2. PROJECTS HORIZONTAL SCROLLING 3D GALLERY ---
    if (vw > 768) {
      const gp = clamp((sy - M.galleryTop) / M.gallerySc, 0, 1);
      if (Math.abs(gp - lastP.gallery) > 0.0004) {
        lastP.gallery = gp;
        const shiftX = -gp * M.galleryMax;
        w(galleryTrack, "transform", `translate3d(${shiftX.toFixed(1)}px, 0, 0)`);
        w(galleryProgressFill, "width", `${(gp * 100).toFixed(1)}%`);

        const lastIdx = M.cards.length - 1;
        M.cards.forEach((c, idx) => {
          // card centre from cached layout + track shift: no rect reads
          const cardCenter = c.left + c.width / 2 + shiftX;
          const norm = clamp((cardCenter - vw / 2) / (vw * 0.65), -1.2, 1.2);
          const rotY = -norm * 10;
          const scale = 1 - Math.abs(norm) * 0.07;
          let tz = -Math.abs(norm) * 55;
          let opacity = 1;
          if (gp > 0.84 && idx < lastIdx) {
            const recede = clamp((gp - 0.84) / 0.16, 0, 1);
            tz -= recede * 180;
            opacity = 1 - recede * 0.65;
          }
          w(c.el, "opacity", opacity.toFixed(3));
          w(c.el, "transform", `perspective(1200px) translateZ(${tz.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`);
        });
      }
    }

    // --- 3. UNIFIED SINGLE JOURNAL (a real hardcover that swings open) ---
    const jp = clamp((sy - M.journalTop) / M.journalSc, 0, 1);
    if (Math.abs(jp - lastP.journal) > 0.0004) {
      lastP.journal = jp;
      const openK = easeInOutCubic(clamp((jp - 0.28) / 0.44, 0, 1));
      journalOpenK = openK;
      const theta = openK * 180;
      const turn = Math.sin((theta * Math.PI) / 180);

      if (journalMode === "spread") {
        // Shutting the book pulls the turned leaves back to the right.
        journalCloseK = clamp((openK - 0.06) / 0.42, 0, 1);
        if (journalCloseK <= 0.001 && currentSpread !== 0) {
          currentSpread = 0;
          updateJournalUI();
        } else {
          applySheetTransforms();
        }

        const pitch = 18 - openK * 11;
        const yaw = -10 * (1 - openK);
        const bookScale = (0.86 + openK * 0.14) * (1 - 0.12 * turn);
        const camX = -25 * (1 - openK) + 7 * turn;
        w(notebookStage, "transform",
          `translateX(${camX.toFixed(2)}%) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) scale(${bookScale.toFixed(3)})`);

        const thick = clamp(1 - openK / 0.32, 0, 1).toFixed(3);
        w(notebookBlockRight, "opacity", thick);
        w(notebookBlockBottom, "opacity", thick);

        w(notebookDeskShadow, "left", `${(50 - 50 * openK).toFixed(2)}%`);
        w(notebookDeskShadow, "width", `${(50 + 51 * openK).toFixed(2)}%`);

        const land = easeInOutCubic(clamp((openK - 0.5) / 0.32, 0, 1));
        const coverZ = 0.8 + 25.2 * (1 - land);
        w(notebookFrontCover, "transform", `translateZ(${coverZ.toFixed(2)}px) rotateY(${(-180 * openK).toFixed(2)}deg)`);

        w(notebookTurnShadeFront, "opacity", (turn * 0.6).toFixed(3));
        w(notebookTurnShadeBack, "opacity", (turn * 0.5).toFixed(3));
        const shade = theta < 90 ? 0.34 * Math.sin((theta * 2 * Math.PI) / 180) : 0;
        w(notebookCoverShadow, "opacity", Math.max(0, shade).toFixed(3));
      } else if (journalMode === "single") {
        if (openK <= 0.001 && currentPage !== 0 && !singleBusy) singleShow(0);

        // One-hand camera: tilted three-quarter while shut, flat to read.
        const pitch = 16 - openK * 10;
        const yaw = -9 * (1 - openK);
        const bookScale = (0.9 + openK * 0.1) * (1 - 0.1 * turn);
        const camX = 4 * openK - 1.5 * (1 - openK);
        w(notebookStage, "transform",
          `translateX(${camX.toFixed(2)}%) rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) scale(${bookScale.toFixed(3)})`);

        const thick = clamp(1 - openK / 0.32, 0, 1).toFixed(3);
        w(notebookBlockRight, "opacity", thick);
        w(notebookBlockBottom, "opacity", thick);

        const land = easeInOutCubic(clamp((openK - 0.5) / 0.32, 0, 1));
        const coverZ = 0.8 + 22 * (1 - land);
        w(notebookFrontCover, "transform", `translateZ(${coverZ.toFixed(2)}px) rotateY(${(-180 * openK).toFixed(2)}deg)`);

        w(notebookTurnShadeFront, "opacity", (turn * 0.6).toFixed(3));
        w(notebookTurnShadeBack, "opacity", (turn * 0.5).toFixed(3));
        const openShade = theta < 90 ? 0.3 * Math.sin((theta * 2 * Math.PI) / 180) : 0;
        w(notebookCoverShadow, "opacity", Math.max(0, openShade, singleFlipShade * 0.8).toFixed(3));
      }

      // Desk props settle in (both modes)
      const propP = easeOutCubic(clamp((jp - 0.1) / 0.45, 0, 1));
      w(deskPropLeft, "opacity", propP.toFixed(3));
      w(deskPropLeft, "transform", `rotate(${(-7 * propP).toFixed(1)}deg) translateY(${((1 - propP) * 28).toFixed(1)}px)`);
      w(deskPencil, "opacity", propP.toFixed(3));

      const headP = easeOutCubic(clamp((jp - 0.52) / 0.3, 0, 1));
      w(journalHeader, "opacity", headP.toFixed(3));
      w(journalHeader, "transform", `translate3d(0, ${((1 - headP) * 18).toFixed(1)}px, 0)`);
    }
  }

  // --- 4. ADAPTIVE NAV THEME & ACTIVE LINK (cached tops, no rect reads) ---
  let theme;
  if (M.endingTop - sy <= 90) theme = "on-night";
  else if (lastP.reveal >= 0.44 || M.galleryTop - sy <= 90) theme = "on-paper";
  else theme = "on-home";
  if (theme !== lastTheme) {
    lastTheme = theme;
    siteNav.classList.remove("on-home", "on-paper", "on-night");
    siteNav.classList.add(theme);
  }

  let activeKey = "home";
  if (M.journalTop - sy <= vh * 0.45) activeKey = "journal";
  else if (M.galleryTop - sy <= vh * 0.45) activeKey = "projects";
  else if (lastP.reveal >= 0.4) activeKey = "about";
  if (activeKey !== lastActive) {
    lastActive = activeKey;
    navItems.forEach(item => {
      cls(item, "active", item.getAttribute("data-target") === activeKey);
    });
  }
}

let rafPending = false;
window.addEventListener("scroll", () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      updateScrollAnimations(window.scrollY);
      rafPending = false;
    });
  }
}, { passive: true });
window.addEventListener("resize", scheduleMetricsRefresh);
window.addEventListener("orientationchange", scheduleMetricsRefresh);

/* =========================================================
   GALLERY PREV / NEXT BUTTONS
========================================================= */
function scrollGalleryByStep(direction) {
  if (window.innerWidth <= 768) {
    galleryTrack.scrollBy({ left: direction * window.innerWidth * 0.78, behavior: "smooth" });
    return;
  }
  const currentP = clamp((window.scrollY - M.galleryTop) / M.gallerySc, 0, 1);
  const step = 1 / Math.max(1, I18N[currentLang].projects.length - 1);
  const targetP = clamp(currentP + direction * step * 0.85, 0, 1);
  window.scrollTo({ top: M.galleryTop + targetP * M.gallerySc, behavior: "smooth" });
}

/* =========================================================
   ENDING SUBTLE MOUSE PARALLAX
========================================================= */
const endingBg = document.getElementById("endingBg");
endingSection.addEventListener("pointermove", (e) => {
  if (prefersReducedMotion) return;
  const rect = endingSection.getBoundingClientRect();
  const nx = (e.clientX - rect.left) / rect.width - 0.5;
  const ny = (e.clientY - rect.top) / rect.height - 0.5;
  endingBg.style.transform = `translate3d(${(-nx * 14).toFixed(1)}px, ${(-ny * 10).toFixed(1)}px, 0)`;
});

/* =========================================================
   JOURNAL IMAGE PREWARM
   The five journal photos are the entire emotional payload of the flipbook,
   but they lived behind loading="lazy" and only started downloading on the
   exact page turn — hence a 1-2s blank before the page rendered. Warm every
   page image into cache during idle time, after the first paint, so any leaf
   is instantly ready whichever direction the reader flips.
========================================================= */
const journalImageUrls = [...new Set(
  Object.values(I18N).flatMap(d => (d.journalSpreads || []).flatMap(s => [
    ...(s.leftHtml.match(/assets\/journal-[\w-]+\.webp/g) || []),
    ...(s.rightHtml.match(/assets\/journal-[\w-]+\.webp/g) || [])
  ]))
)];
function prewarmJournalImages() {
  journalImageUrls.forEach(src => {
    const im = new Image();
    im.decoding = "async";
    im.src = src;
  });
}
function schedulePrewarm() {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(prewarmJournalImages, { timeout: 2500 });
  } else {
    setTimeout(prewarmJournalImages, 1200);
  }
}

/* =========================================================
   BOOT
========================================================= */
attachBookInteraction();
applyLanguage("zh");
window.addEventListener("load", () => { scheduleMetricsRefresh(); schedulePrewarm(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMetricsRefresh);
if ("ResizeObserver" in window) {
  new ResizeObserver(scheduleMetricsRefresh).observe(document.body);
}