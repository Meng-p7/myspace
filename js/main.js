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
   JOURNAL — a 3D pop-up book, loaded on demand

   The heavy part (React + three.js) is fetched the first time the reader
   reaches the journal, so the front page stays fast. Until it arrives, and
   if WebGL is not available at all, the same ten pages are readable as plain
   cards below.
========================================================= */
const journalMount = document.getElementById("journal3dMount");
const journalFallback = document.getElementById("journalFallback");
const journalSub = document.getElementById("journalSub");
let journal3d = null;
let journal3dLoading = false;

const journalLabels = (lang) =>
  lang === "zh"
    ? {
        open: "打开日记本",
        close: "合上日记本",
        hint: "点一下封面，翻开这本手账",
        prev: "上一个场景",
        next: "下一个场景",
        panelClose: "关闭",
        page: "页",
        loading: "正在画纸…",
        unsupported: "这台设备暂时无法显示 3D 内容，下面的日记依然可以读完。",
      }
    : {
        open: "Open the book",
        close: "Close the book",
        hint: "Tap the cover to open this notebook",
        prev: "Previous scene",
        next: "Next scene",
        panelClose: "Close",
        page: "Page",
        loading: "Sharpening pencils…",
        unsupported:
          "This device cannot show the 3D book, but every page is still readable below.",
      };

function journalPages(lang) {
  return (I18N[lang] && I18N[lang].journalPages) || [];
}

/** The same ten pages as plain HTML: the fallback and the no-JS story. */
function renderJournalFallback(lang) {
  if (!journalFallback) return;
  const pages = journalPages(lang);
  journalFallback.innerHTML = pages
    .map(
      (p) => `
      <article class="journal-fallback-page">
        <div class="j-meta-row"><span>${p.kicker}</span><span>${p.kickerRight}</span></div>
        ${p.title ? `<h3 class="j-title">${p.title}</h3>` : ""}
        ${p.body ? `<p class="j-body">${p.body}</p>` : ""}
        ${p.quote ? `<div class="j-sticky-note">${p.quote}</div>` : ""}
        ${
          p.image
            ? `<figure class="j-polaroid">
                 <img src="assets/${p.image.src}.webp"
                      srcset="assets/${p.image.src}-sm.webp 560w, assets/${p.image.src}.webp 1000w"
                      sizes="(max-width: 820px) 76vw, 320px"
                      loading="lazy" decoding="async" alt="${p.image.alt}" />
                 <figcaption class="j-polaroid-cap">${p.image.caption}</figcaption>
               </figure>`
            : ""
        }
        ${p.handnote ? `<p class="j-handnote">${p.handnote}</p>` : ""}
        <div class="j-page-num">${pad2(p.pageNumber)}</div>
      </article>`,
    )
    .join("");
}

function ensureJournalStyles() {
  if (document.getElementById("journal3d-css")) return;
  const link = document.createElement("link");
  link.id = "journal3d-css";
  link.rel = "stylesheet";
  link.href = "journal3d/journal3d.css";
  document.head.appendChild(link);
}

function loadJournal3D() {
  if (journal3d || journal3dLoading || !journalMount) return;
  journal3dLoading = true;
  ensureJournalStyles();
  import("../journal3d/journal3d.js")
    .then((mod) => {
      journal3d = mod.mountJournal(journalMount, {
        locale: currentLang,
        assetBase: "assets/",
        labels: journalLabels(currentLang),
        pages: journalPages(currentLang),
      });
      if (journalFallback) journalFallback.style.display = "none";
      journal3dLoading = false;
    })
    .catch((err) => {
      console.warn("journal 3D could not start:", err);
      journal3dLoading = false;
      renderJournalFallback(currentLang);
    });
}

/** Language change: the 3D scene keeps running, only the words change. */
function updateJournalModule(lang) {
  if (journalSub) {
    journalSub.textContent =
      lang === "zh" ? "手记、草图与一些小事。" : "Thoughts, sketches & little moments.";
  }
  if (journal3d) {
    journal3d.setLocale(lang, journalPages(lang));
  } else {
    renderJournalFallback(lang);
  }
}

// fetch the book a little before the reader gets there
if (journalMount && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      loadJournal3D();
    },
    { rootMargin: "500px 0px" },
  );
  io.observe(journalMount);
} else {
  renderJournalFallback(currentLang);
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
  updateJournalModule(lang);
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
  if (key === "journal") return M.journalTop;
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
const journalImageUrls = [
  ...new Set(
    Object.values(I18N).flatMap((d) =>
      (d.journalPages || [])
        .map((p) => (p.image ? `assets/${p.image.src}.webp` : null))
        .filter(Boolean),
    ),
  ),
];
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
applyLanguage("zh");
window.addEventListener("load", () => { scheduleMetricsRefresh(); schedulePrewarm(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleMetricsRefresh);
if ("ResizeObserver" in window) {
  new ResizeObserver(scheduleMetricsRefresh).observe(document.body);
}