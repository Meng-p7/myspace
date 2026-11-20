/* =========================================================
   Moon Portfolio — Interactions & Scroll-Driven Animation
   Requires js/data.js (I18N, currentLang) to be loaded first.
========================================================= */

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
}

/* =========================================================
   JOURNAL 3D FLIPBOOK ENGINE (ONE SINGLE NOTEBOOK)
========================================================= */
let currentSpread = 0;
const spreadBaseGrid = document.getElementById("spreadBaseGrid");
const flipSheetsLayer = document.getElementById("flipSheetsLayer");
const mobileJournalView = document.getElementById("mobileJournalView");
const journalCounter = document.getElementById("journalCounter");
const journalPrevBtn = document.getElementById("journalPrevBtn");
const journalNextBtn = document.getElementById("journalNextBtn");
const flipSheets = [];

function initJournalBook(spreads) {
  const n = spreads.length;
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
    sheet.style.transform =
      `translateZ(${z.toFixed(1)}px) rotateY(${(-180 * frac).toFixed(1)}deg)`;
    sheet.style.zIndex = turned ? String(10 + idx) : String(30 - idx);
    sheet.classList.toggle("is-flipped", turned && frac > 0.5);
  });
}

function updateJournalUI() {
  const spreads = I18N[currentLang].journalSpreads;
  const total = spreads.length;
  const numStr = String(currentSpread + 1).padStart(2, "0");
  const totStr = String(total).padStart(2, "0");
  journalCounter.textContent = `${numStr} / ${totStr}`;
  journalPrevBtn.disabled = currentSpread === 0;
  journalNextBtn.disabled = currentSpread === total - 1;

  applySheetTransforms();

  const s = spreads[currentSpread];
  mobileJournalView.innerHTML = `
    <div class="mobile-notebook" id="mobileNotebook">
      <div class="mobile-notebook-cover" aria-hidden="true">
        <div class="mobile-cover-groove"></div>
        <div class="mobile-cover-title">Journal</div>
        <div class="mobile-cover-sub">MOON</div>
        <div class="mobile-cover-pageedge"></div>
      </div>
      <div class="mobile-notebook-pages">
        <div class="mobile-spread-card">
          <div>${s.leftHtml}</div>
          <hr style="border:none;border-top:1px dashed rgba(23,23,23,0.16);" />
          <div>${s.rightHtml}</div>
        </div>
      </div>
    </div>
  `;
  setupMobileNotebook();
}

/* On a phone the journal is a real notebook too: the cover lifts away when
   the section comes into view, and every spread change turns the page. */
function setupMobileNotebook() {
  const notebook = document.getElementById("mobileNotebook");
  if (!notebook) return;

  const card = notebook.querySelector(".mobile-spread-card");
  if (card) {
    card.classList.remove("flip-in");
    void card.offsetWidth;
    card.classList.add("flip-in");
  }

  if (notebook.dataset.opened === "1") {
    notebook.classList.add("is-open");
    return;
  }
  if (!("IntersectionObserver" in window)) {
    notebook.classList.add("is-open");
    notebook.dataset.opened = "1";
    return;
  }
  const cover = notebook.querySelector(".mobile-notebook-cover") || notebook;
  let timer = null;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        notebook.classList.add("is-open");
        notebook.dataset.opened = "1";
        io.disconnect();
      }, 260);
    });
  }, { threshold: 0.55 });
  io.observe(cover);
}

function goToSpread(idx) {
  const spreads = I18N[currentLang].journalSpreads;
  currentSpread = Math.max(0, Math.min(spreads.length - 1, idx));
  updateJournalUI();
}

function attachSheetInteraction(sheet, idx) {
  let startX = 0;
  let isDragging = false;
  let moved = false;

  sheet.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a")) return;
    isDragging = true;
    moved = false;
    startX = e.clientX;
    sheet.classList.add("dragging");
    sheet.style.zIndex = "50";
    sheet.setPointerCapture(e.pointerId);
  });

  sheet.addEventListener("pointermove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
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
      sheet.style.transform =
        `translateZ(14px) rotateY(${deg.toFixed(1)}deg)`;
  });

  sheet.addEventListener("pointerup", (e) => {
    if (!isDragging) return;
    isDragging = false;
    sheet.classList.remove("dragging");
    const dx = e.clientX - startX;
    const isCurrentlyFlipped = idx < currentSpread;

    if (!moved) {
      goToSpread(isCurrentlyFlipped ? idx : idx + 1);
      return;
    }

    const threshold = Math.max(60, sheet.offsetWidth * 0.25);
    if (!isCurrentlyFlipped && dx < -threshold) {
      goToSpread(idx + 1);
    } else if (isCurrentlyFlipped && dx > threshold) {
      goToSpread(idx);
    } else {
      updateJournalUI();
    }
  });

  sheet.addEventListener("pointercancel", () => {
    isDragging = false;
    sheet.classList.remove("dragging");
    updateJournalUI();
  });
}

journalPrevBtn.addEventListener("click", () => goToSpread(currentSpread - 1));
journalNextBtn.addEventListener("click", () => goToSpread(currentSpread + 1));

let touchStartX = 0;
mobileJournalView.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

mobileJournalView.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (dx < -45) goToSpread(currentSpread + 1);
  if (dx > 45) goToSpread(currentSpread - 1);
}, { passive: true });

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
  updateScrollAnimations();
}

langToggleBtn.addEventListener("click", () => {
  applyLanguage(currentLang === "zh" ? "en" : "zh");
});

/* =========================================================
   HOME MOUSE COLOR REVEAL (No Glow)
========================================================= */
const homeLayer = document.getElementById("homeLayer");
const homeSpotlightImg = document.getElementById("homeSpotlightImg");

homeLayer.addEventListener("pointermove", (e) => {
  const rect = homeLayer.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  homeSpotlightImg.style.setProperty("--mx", `${x.toFixed(2)}%`);
  homeSpotlightImg.style.setProperty("--my", `${y.toFixed(2)}%`);
});

/* =========================================================
   NAVIGATION & SMOOTH ANCHOR SCROLLING
========================================================= */
const siteNav = document.getElementById("siteNav");
const navLinks = document.getElementById("navLinks");
const navToggle = document.getElementById("navToggle");
const navItems = Array.from(document.querySelectorAll(".nav-link"));

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach(link => {
  link.addEventListener("click", (e) => {
    const targetId = link.getAttribute("data-target");
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      e.preventDefault();
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

document.getElementById("scrollToAboutBtn").addEventListener("click", () => {
  document.getElementById("about").scrollIntoView({ behavior: "smooth", block: "start" });
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
const notebookSpine = document.querySelector(".notebook-spine");
const notebookBlockRight = document.getElementById("notebookBlockRight");
const notebookBlockBottom = document.getElementById("notebookBlockBottom");
const notebookDeskShadow = document.querySelector(".notebook-desk-shadow");
const notebookTurnShadeFront = document.querySelector(".notebook-turn-shade-front");
const notebookTurnShadeBack = document.querySelector(".notebook-turn-shade-back");
const endingSection = document.getElementById("ending");

function clamp(val, min, max) {
  return Math.min(max, Math.max(min, val));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getStageProgress(el, vh) {
  const rect = el.getBoundingClientRect();
  const scrollable = Math.max(1, rect.height - vh);
  return clamp(-rect.top / scrollable, 0, 1);
}

function updateScrollAnimations() {
  const vh = window.innerHeight;
  const vw = window.innerWidth;

  if (!prefersReducedMotion) {
    // --- 1. HOME -> 3D PAPER -> ABOUT -> IN-PLACE "MY PROJECTS" ---
    const p = getStageProgress(revealStage, vh);

    const riseProgress = clamp((p - 0.03) / 0.45, 0, 1);
    const easedRise = easeOutCubic(riseProgress);
    const translateY = (1 - easedRise) * 104;

    homeLayer.style.transform = `scale(${(1 - easedRise * 0.035).toFixed(4)})`;
    paperSheet.style.transform = `translate3d(0, ${translateY.toFixed(3)}%, 0)`;
    paperSheet.classList.toggle("is-settled", p >= 0.45);

    const curlIntensity = Math.sin(riseProgress * Math.PI);
    paperCurlLip.style.transform = `perspective(900px) rotateX(${(-38 * curlIntensity).toFixed(2)}deg) scaleY(${(0.65 + 0.55 * curlIntensity).toFixed(3)})`;
    paperCurlLip.style.opacity = riseProgress > 0.01 && riseProgress < 0.99 ? "1" : "0";

    paperCastShadow.style.opacity = clamp(curlIntensity * 1.15, 0, 1).toFixed(3);
    paperCastShadow.style.transform = `scaleY(${(0.8 + curlIntensity * 0.5).toFixed(3)})`;

    // About Me fades in (0.40..0.58), holds (0.58..0.72), fades out IN PLACE (0.72..0.85)
    const fadeInLeft = easeOutCubic(clamp((p - 0.40) / 0.18, 0, 1));
    const fadeInRight = easeOutCubic(clamp((p - 0.44) / 0.18, 0, 1));
    const fadeOutP = clamp((p - 0.72) / 0.14, 0, 1);

    const leftOpacity = fadeInLeft * (1 - fadeOutP);
    const rightOpacity = fadeInRight * (1 - fadeOutP);
    aboutLeft.style.opacity = leftOpacity.toFixed(3);
    aboutLeft.style.transform = `translate3d(0, ${((1 - fadeInLeft) * 26 - fadeOutP * 18).toFixed(1)}px, 0)`;
    aboutRight.style.opacity = rightOpacity.toFixed(3);
    aboutRight.style.transform = `translate3d(0, ${((1 - fadeInRight) * 28 - fadeOutP * 14).toFixed(1)}px, 0)`;
    aboutContainer.style.pointerEvents = fadeOutP > 0.6 ? "none" : "auto";
    paperSketchDecor.style.opacity = (0.48 * (1 - fadeOutP)).toFixed(3);

    // In-place "My Projects" 3D Exhibition Frames appear right on the same sticky paper (0.76..1.00)
    const exhP = clamp((p - 0.76) / 0.22, 0, 1);
    const eExh = easeOutCubic(exhP);
    inplaceExhibitionLayer.style.opacity = eExh.toFixed(3);

    const lineW = 12 + eExh * 80;
    exhLineTop.style.width = `${lineW.toFixed(1)}%`;
    exhLineBottom.style.width = `${lineW.toFixed(1)}%`;

    exhFrame1.style.transform = `translate3d(${((1 - eExh) * -70).toFixed(1)}px, 0, ${(eExh * 60).toFixed(1)}px) rotateY(${(14 - eExh * 6).toFixed(1)}deg)`;
    exhFrame2.style.transform = `translate3d(${((1 - eExh) * 70).toFixed(1)}px, 0, ${(eExh * 35).toFixed(1)}px) rotateY(${(-14 + eExh * 6).toFixed(1)}deg)`;
    exhFrame3.style.transform = `translate3d(0, ${((1 - eExh) * 35).toFixed(1)}px, ${(-35 + eExh * 35).toFixed(1)}px)`;
    inplaceProjectsTitle.style.transform = `translate3d(0, ${((1 - eExh) * 24).toFixed(1)}px, 0) scale(${(0.94 + eExh * 0.06).toFixed(3)})`;

    // --- 2. PROJECTS HORIZONTAL SCROLLING 3D GALLERY ---
    if (vw > 768) {
      const gp = getStageProgress(galleryScrollZone, vh);
      const maxShift = Math.max(0, galleryTrack.scrollWidth - vw + vw * 0.08);
      const shiftX = -gp * maxShift;
      galleryTrack.style.transform = `translate3d(${shiftX.toFixed(1)}px, 0, 0)`;
      galleryProgressFill.style.width = `${(gp * 100).toFixed(1)}%`;

      const cards = galleryTrack.querySelectorAll(".project-card");
      const lastIdx = cards.length - 1;
      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const norm = clamp((cardCenter - vw / 2) / (vw * 0.65), -1.2, 1.2);
        let rotY = -norm * 10;
        let scale = 1 - Math.abs(norm) * 0.07;
        let tz = -Math.abs(norm) * 55;
        let opacity = 1;

        if (gp > 0.84 && idx < lastIdx) {
          const recede = clamp((gp - 0.84) / 0.16, 0, 1);
          tz -= recede * 180;
          opacity = 1 - recede * 0.65;
        }
        card.style.opacity = opacity.toFixed(3);
        card.style.transform = `perspective(1200px) translateZ(${tz.toFixed(1)}px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      });
    } else {
      galleryTrack.style.transform = "";
      galleryTrack.querySelectorAll(".project-card").forEach(c => { c.style.transform = ""; c.style.opacity = "1"; });
    }

    // --- 3. UNIFIED SINGLE JOURNAL (a real hardcover that swings open) ---
    if (vw > 820) {
      const jp = getStageProgress(journalStage, vh);

      // 0 = shut, 1 = lying open
      const openK = easeInOutCubic(clamp((jp - 0.28) / 0.44, 0, 1));

      // Shutting the book pulls the turned leaves back to the right, so no
      // paper is ever left lying on the desk.
      journalCloseK = clamp((openK - 0.06) / 0.42, 0, 1);
      if (journalCloseK <= 0.001 && currentSpread !== 0) {
        currentSpread = 0;
        updateJournalUI();
      } else {
        applySheetTransforms();
      }

      // Camera: a tilted three-quarter view while shut, easing to a flat
      // reading angle once open. The book also shifts half a page left so the
      // single-page-thick closed book sits dead centre. While the leaf stands
      // up the camera eases back, otherwise it would swing out of the frame.
      const theta = openK * 180;
      const turn = Math.sin((theta * Math.PI) / 180);
      const pitch = 18 - openK * 11;
      const yaw = -10 * (1 - openK);
      const bookScale = (0.86 + openK * 0.14) * (1 - 0.12 * turn);
      const camX = -25 * (1 - openK) + 7 * turn;
      notebookStage.style.transform =
        `translateX(${camX.toFixed(2)}%) ` +
        `rotateX(${pitch.toFixed(2)}deg) rotateY(${yaw.toFixed(2)}deg) ` +
        `scale(${bookScale.toFixed(3)})`;

      // Thickness only belongs to a shut book
      const thick = clamp(1 - openK / 0.32, 0, 1).toFixed(3);
      notebookBlockRight.style.opacity = thick;
      notebookBlockBottom.style.opacity = thick;

      // Shadow pool widens from one page to the full spread
      notebookDeskShadow.style.left = `${(50 - 50 * openK).toFixed(2)}%`;
      notebookDeskShadow.style.width = `${(50 + 51 * openK).toFixed(2)}%`;

      // The cover turns a full half-circle on the spine. Its back face carries
      // the first page, so the left page arrives as real paper instead of a
      // fade. It starts well in front of the page block and settles down onto
      // it once it has landed, so turned leaves always rest above it.
      const land = easeInOutCubic(clamp((openK - 0.5) / 0.32, 0, 1));
      const coverZ = 0.8 + 25.2 * (1 - land);
      notebookFrontCover.style.transform =
        `translateZ(${coverZ.toFixed(2)}px) rotateY(${(-180 * openK).toFixed(2)}deg)`;

      // Light rakes across the leaf while it stands up, and the page below
      // picks up the shadow it throws
      notebookTurnShadeFront.style.opacity = (turn * 0.6).toFixed(3);
      notebookTurnShadeBack.style.opacity = (turn * 0.5).toFixed(3);
      const shade = theta < 90 ? 0.34 * Math.sin((theta * 2 * Math.PI) / 180) : 0;
      notebookCoverShadow.style.opacity = Math.max(0, shade).toFixed(3);

      // Desk props settle in
      const propP = easeOutCubic(clamp((jp - 0.1) / 0.45, 0, 1));
      deskPropLeft.style.opacity = propP.toFixed(3);
      deskPropLeft.style.transform = `rotate(${(-7 * propP).toFixed(1)}deg) translateY(${((1 - propP) * 28).toFixed(1)}px)`;
      deskPencil.style.opacity = propP.toFixed(3);

      const headP = easeOutCubic(clamp((jp - 0.52) / 0.3, 0, 1));
      journalHeader.style.opacity = headP.toFixed(3);
      journalHeader.style.transform = `translate3d(0, ${((1 - headP) * 18).toFixed(1)}px, 0)`;
    } else {
      notebookStage.style.transform = "";
      notebookBlockRight.style.opacity = "1";
      notebookBlockBottom.style.opacity = "1";
      journalCloseK = 1;
      applySheetTransforms();
      notebookCoverShadow.style.opacity = "0";
      notebookTurnShadeFront.style.opacity = "0";
      notebookTurnShadeBack.style.opacity = "0";
      notebookDeskShadow.style.removeProperty("left");
      notebookDeskShadow.style.removeProperty("width");
      journalHeader.style.opacity = "1";
      journalHeader.style.transform = "";
    }
  }

  // --- 4. ADAPTIVE NAV THEME & ACTIVE LINK ---
  const endingTop = endingSection.getBoundingClientRect().top;
  const projTop = galleryScrollZone.getBoundingClientRect().top;
  const journalTop = journalStage.getBoundingClientRect().top;
  const stageP = getStageProgress(revealStage, vh);

  siteNav.classList.remove("on-home", "on-paper", "on-night");
  if (endingTop <= 90) {
    siteNav.classList.add("on-night");
  } else if (stageP >= 0.44 || projTop <= 90) {
    siteNav.classList.add("on-paper");
  } else {
    siteNav.classList.add("on-home");
  }

  let activeKey = "home";
  if (journalTop <= vh * 0.45) {
    activeKey = "journal";
  } else if (projTop <= vh * 0.45) {
    activeKey = "projects";
  } else if (stageP >= 0.4) {
    activeKey = "about";
  }
  navItems.forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-target") === activeKey);
  });
}

let rafPending = false;
window.addEventListener("scroll", () => {
  if (!rafPending) {
    rafPending = true;
    requestAnimationFrame(() => {
      updateScrollAnimations();
      rafPending = false;
    });
  }
}, { passive: true });
window.addEventListener("resize", updateScrollAnimations);

/* =========================================================
   GALLERY PREV / NEXT BUTTONS
========================================================= */
function scrollGalleryByStep(direction) {
  if (window.innerWidth <= 768) {
    galleryTrack.scrollBy({ left: direction * window.innerWidth * 0.78, behavior: "smooth" });
    return;
  }
  const gRect = galleryScrollZone.getBoundingClientRect();
  const gTop = window.scrollY + gRect.top;
  const gScrollable = Math.max(1, gRect.height - window.innerHeight);
  const currentP = clamp(-gRect.top / gScrollable, 0, 1);
  const step = 1 / Math.max(1, I18N[currentLang].projects.length - 1);
  const targetP = clamp(currentP + direction * step * 0.85, 0, 1);
  window.scrollTo({ top: gTop + targetP * gScrollable, behavior: "smooth" });
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

// Initialize in Chinese (default)
applyLanguage("zh");
