/* ==========================================================================
   Uno Mawlue — Portfolio Prototype
   Client-side JavaScript

   Each feature is its own function so it maps cleanly to React later:
     initThemeToggle()      -> <ThemeToggle /> + useTheme() hook
     initMobileNav()        -> <Header /> with useState for "open"
     initDynamicDates()     -> <Footer /> / <Greeting />
     initProjectFilter()    -> <ProjectsPage /> with filter + search state
     initGallery()          -> <Gallery /> inside <ProjectPage />
     initLightbox()         -> <Lightbox /> modal component
     initContactForm()      -> <ContactForm /> (validateContact reused as-is)
   ========================================================================== */

"use strict";

/* ---------- 1. Light / dark mode toggle ---------- */
const THEME_KEY = "uno-portfolio-theme";

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch (err) {
    return null; // storage can be blocked; default to dark
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (err) {
    /* ignore: the toggle still works for this page view */
  }
}

function applyTheme(theme) {
  const isLight = theme === "light";
  document.documentElement.setAttribute("data-theme", isLight ? "light" : "dark");
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(isLight));
    const icon = btn.querySelector(".theme-icon");
    if (icon) icon.textContent = isLight ? "☾" : "☼"; // moon : sun
  });
}

function initThemeToggle() {
  applyTheme(getSavedTheme() || "dark");
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      saveTheme(next);
    });
  });
}

/* ---------- 2. Mobile navigation menu ---------- */
function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    setOpen(open);
    if (open) nav.querySelector("a").focus();
  });

  // Close after choosing a link (needed for same-page links like #about)
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ---------- 3. Dynamic date display ---------- */
function initDynamicDates() {
  const now = new Date();
  document.querySelectorAll(".current-year").forEach((el) => {
    el.textContent = String(now.getFullYear());
  });

  const todayLine = document.getElementById("today-line");
  if (todayLine) {
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    todayLine.textContent = `${greeting}! Thanks for stopping by on this ${date}.`;
  }
}

/* ---------- 4. Projects page: status filter + search ---------- */
function matchesFilter(el, category, query) {
  // Pure check, reusable in React as a .filter() callback
  const q = query.trim().toLowerCase();
  const inCategory = category === "all" || el.dataset.group === category;
  const inSearch = q === "" || el.textContent.toLowerCase().includes(q);
  return inCategory && inSearch;
}

function initProjectFilter() {
  const cardList = document.getElementById("project-cards");
  if (!cardList) return;

  const buttons = Array.from(document.querySelectorAll(".filter-btn"));
  const search = document.getElementById("project-search");
  const countEl = document.getElementById("result-count");
  const cards = Array.from(cardList.children);
  const rows = Array.from(document.querySelectorAll("#projects-table tbody tr"));
  let category = "all";

  function update() {
    let shown = 0;
    cards.forEach((card) => {
      const match = matchesFilter(card, category, search.value);
      card.classList.toggle("is-hidden", !match);
      if (match) shown += 1;
    });
    rows.forEach((row) => row.classList.toggle("is-hidden", !matchesFilter(row, category, search.value)));

    if (shown === cards.length) countEl.textContent = `Showing all ${cards.length} projects.`;
    else if (shown === 0) countEl.textContent = "No projects match. Try another category or search term.";
    else countEl.textContent = `Showing ${shown} of ${cards.length} projects.`;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      category = btn.dataset.filter;
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      update();
    });
  });
  search.addEventListener("input", update);
}

/* ---------- 5. Project page gallery (projects/<name>.html) ---------- */
// Small helper: create an element with a class and text (never innerHTML)
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function initGallery() {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const mainBtn = gallery.querySelector(".gallery-main");
  const mainImg = mainBtn.querySelector("img");
  const thumbs = Array.from(gallery.querySelectorAll(".thumb"));
  // The list of images comes from the thumbnails' data-src / data-alt attributes
  const images = thumbs.map((t) => ({ src: t.dataset.src, alt: t.dataset.alt }));
  let current = 0;

  function show(i) {
    current = i;
    mainImg.src = images[i].src;
    mainImg.alt = images[i].alt;
    mainBtn.setAttribute("aria-label", `View image ${i + 1} of ${images.length} full size`);
    thumbs.forEach((t, n) => t.setAttribute("aria-current", String(n === i)));
  }

  thumbs.forEach((thumb, i) => thumb.addEventListener("click", () => show(i)));
  mainBtn.addEventListener("click", () => openLightbox(images, current, mainBtn));
}

/* ---------- 6. Lightbox modal for project images ---------- */
let lightboxState = { images: [], index: 0, opener: null };

function updateLightbox() {
  const { images, index } = lightboxState;
  const img = document.getElementById("lightbox-img");
  img.src = images[index].src;
  img.alt = images[index].alt;
  document.getElementById("lightbox-caption").textContent =
    `Image ${index + 1} of ${images.length}: ${images[index].alt}`;
}

function openLightbox(images, index, opener) {
  const dialog = document.getElementById("lightbox");
  if (!dialog) return;
  lightboxState = { images, index, opener };
  updateLightbox();
  dialog.showModal();
}

function stepLightbox(delta) {
  const n = lightboxState.images.length;
  lightboxState.index = (lightboxState.index + delta + n) % n;
  updateLightbox();
}

function initLightbox() {
  const dialog = document.getElementById("lightbox");
  if (!dialog) return;

  document.getElementById("lightbox-close").addEventListener("click", () => dialog.close());
  document.getElementById("lightbox-prev").addEventListener("click", () => stepLightbox(-1));
  document.getElementById("lightbox-next").addEventListener("click", () => stepLightbox(1));

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });

  // Clicking the dark backdrop (outside the dialog box) closes it
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Return focus to the image that opened the lightbox
  dialog.addEventListener("close", () => {
    if (lightboxState.opener) lightboxState.opener.focus();
  });
}

/* ---------- 7. Contact form validation + handling ---------- */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateContact(data) {
  // Pure function: plain values in, { fieldKey: message } out
  const errors = {};
  if (data.fullName.trim().length < 2) errors["full-name"] = "Enter your full name.";

  if (data.email.trim() === "") errors.email = "Enter your email address.";
  else if (!EMAIL_PATTERN.test(data.email.trim())) {
    errors.email = "Enter an email address in the format name@company.com.";
  }

  if (data.reason === "") errors.reason = "Choose a reason for contacting.";
  if (!data.contactTime) errors["contact-time"] = "Choose the best time to reach you.";

  const len = data.message.trim().length;
  if (len === 0) errors.message = "Enter a message.";
  else if (len < 20) errors.message = `Your message needs at least 20 characters (currently ${len}).`;

  if (!data.consent) errors.consent = "Check the box to agree to be contacted.";
  return errors;
}

function readContactForm(form) {
  const time = form.querySelector('input[name="contactTime"]:checked');
  return {
    fullName: form.elements.fullName.value,
    email: form.elements.email.value,
    organization: form.elements.organization.value,
    reason: form.elements.reason.value,
    contactTime: time ? time.value : "",
    message: form.elements.message.value,
    consent: form.elements.consent.checked,
  };
}

// Error key -> element to mark and focus
const FIELD_MAP = {
  "full-name": { input: "full-name" },
  email: { input: "email" },
  reason: { input: "reason" },
  "contact-time": { input: "time-morning", group: "contact-time-group" },
  message: { input: "message" },
  consent: { input: "consent" },
};

function showFieldErrors(errors) {
  Object.entries(FIELD_MAP).forEach(([key, info]) => {
    const message = errors[key] || "";
    document.getElementById(`${key}-error`).textContent = message;
    if (info.group) {
      document.getElementById(info.group).classList.toggle("has-error", Boolean(message));
    } else {
      const input = document.getElementById(info.input);
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }
  });
}

function showErrorSummary(errors) {
  const summary = document.getElementById("error-summary");
  const list = document.getElementById("error-list");
  list.replaceChildren();

  Object.keys(errors).forEach((key) => {
    const li = el("li");
    const link = el("a", "", errors[key]);
    link.href = `#${FIELD_MAP[key].input}`;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      document.getElementById(FIELD_MAP[key].input).focus();
    });
    li.append(link);
    list.append(li);
  });

  summary.hidden = false;
  summary.focus();
}

function showSuccess(data) {
  const success = document.getElementById("success-summary");
  const dl = document.getElementById("submitted-data");
  dl.replaceChildren();
  [
    ["Name", data.fullName.trim()],
    ["Email", data.email.trim()],
    ["Organization", data.organization.trim() || "Not provided"],
    ["Reason", data.reason],
    ["Best time", data.contactTime],
    ["Message", data.message.trim()],
  ].forEach(([term, value]) => dl.append(el("dt", "", term), el("dd", "", value)));
  success.hidden = false;
  success.focus();
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const summary = document.getElementById("error-summary");
  const success = document.getElementById("success-summary");
  const message = document.getElementById("message");
  const counter = document.getElementById("char-count");
  const updateCounter = () => {
    counter.textContent = `${message.value.length} / 500 characters`;
  };
  message.addEventListener("input", updateCounter);

  // After the first submit attempt, re-check as the user fixes fields
  let attempted = false;
  const recheck = () => {
    if (attempted) showFieldErrors(validateContact(readContactForm(form)));
  };
  form.addEventListener("focusout", recheck);
  form.addEventListener("change", recheck);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    attempted = true;
    success.hidden = true;

    const data = readContactForm(form);
    const errors = validateContact(data);
    showFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      showErrorSummary(errors);
      return;
    }

    summary.hidden = true;
    showSuccess(data);
    form.reset();
  });

  form.addEventListener("reset", () => {
    attempted = false;
    showFieldErrors({});
    summary.hidden = true;
    setTimeout(updateCounter, 0);
  });
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initMobileNav();
  initDynamicDates();
  initProjectFilter();
  initGallery();
  initLightbox();
  initContactForm();
});
