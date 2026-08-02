/* ================================
   ACTIVE NAVIGATION
================================ */
const navSections = document.querySelectorAll("section[id]");
let activeLink = null;

if (navSections.length > 0) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        activeLink?.classList.remove("active");

        activeLink = document.querySelector(
          `.nav-link[href="#${entry.target.id}"]`,
        );

        activeLink?.classList.add("active");
      });
    },
    {
      rootMargin: "-20% 0px -60% 0px",
    },
  );
  navSections.forEach((section) => navObserver.observe(section));
}

/* ================================
   SCROLL REVEAL NAVIGATION
================================ */
const revealSections = document.querySelectorAll(".sections");

if (revealSections.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
    },
  );
  revealSections.forEach((section) => revealObserver.observe(section));
}

/* ================================
   HEADER SCROLL
================================ */
const header = document.querySelector(".header");
if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 60);
  }, { passive: true });
}

/* ================================
   TOGGLE NAVIGATION (MOBILE)
================================ */
const toggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");
const links = document.querySelectorAll(".nav-link");

if (toggle && nav) {
  function openMenu() {
    nav.classList.add("active");
    toggle.classList.add("active");
    document.body.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    nav.classList.remove("active");
    toggle.classList.remove("active");
    document.body.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", () => {
    if (nav.classList.contains("active")) {
      closeMenu();
    } else {
      openMenu();
    }
  });
  links.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
  /* ESCAPE CLOSE MENU */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!nav.classList.contains("active")) return;
    closeMenu();
    toggle.focus();
  });
  /* CLICK OUTSIDE CLOSE MENU */
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove("active");
      toggle.classList.remove("active");
    }
  });
}

/* ================================
   PROGRESS BAR
================================ */
const progress = document.querySelector(".progress-bar");
if (progress) {
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const win = document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        progress.style.width = (win / height) * 100 + "%";
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* =========================================================
   OPTIMIZED MAGNETIC CARD ANIMATION (ZERO LAYOUT THRASHING)
========================================================= */
const serviceCards = document.querySelectorAll(".service-text, .skill-category");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (serviceCards.length > 0 && !prefersReducedMotion) {
  serviceCards.forEach((card) => {
    let rect = null;
    let rAF = null;
    const strength = 60;

    // Cache bounding client rect ONCE on enter/resize to prevent thrashing on mousemove
    const updateRect = () => {
      rect = card.getBoundingClientRect();
    };

    card.addEventListener("mouseenter", updateRect, { passive: true });
    window.addEventListener("resize", updateRect, { passive: true });

    card.addEventListener("mousemove", (e) => {
      if (!rect) updateRect();

      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      if (rAF) window.cancelAnimationFrame(rAF);

      rAF = window.requestAnimationFrame(() => {
        card.style.transform = `translate3d(${x / strength}px, ${y / strength}px, 0px) scale(1.02)`;
      });
    }, { passive: true });

    card.addEventListener("mouseleave", () => {
      if (rAF) window.cancelAnimationFrame(rAF);
      rAF = window.requestAnimationFrame(() => {
        card.style.transform = "translate3d(0px, 0px, 0px) scale(1)";
      });
    }, { passive: true });
  });
}

/* =========================================================
   OPTIMIZED BACKGROUND MATRIX LINES (HARDWARE ACCELERATED)
========================================================= */
const container = document.querySelector(".bg-lines");
if (container && !prefersReducedMotion) {
  const fragment = document.createDocumentFragment();
  const lineCount = 15; // Optimized to 15 lines for near-zero CPU/GPU overhead

  for (let i = 0; i < lineCount; i++) {
    const line = document.createElement("span");
    line.style.left = `${(i / lineCount) * 100 + (Math.random() * 4 - 2)}vw`;
    line.style.animationDelay = `${Math.random() * 2.5}s`;
    line.style.height = `${40 + Math.random() * 60}px`;
    fragment.appendChild(line);
  }

  window.requestAnimationFrame(() => {
    container.appendChild(fragment);
  });

  // Pause animation when tab is inactive/hidden to save 100% CPU/GPU cycles
  document.addEventListener("visibilitychange", () => {
    container.style.display = document.hidden ? "none" : "block";
  }, { passive: true });
}

/* ==========================================
   INITIALIZER + TOGGLE THEME HANDLER
========================================== */
function initializeTheme() {
  const savedTheme = localStorage.getItem("theme");

  const theme =
    savedTheme ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  document.documentElement.setAttribute("data-theme", theme);

  const toggleBtn = document.getElementById("theme-toggle");

  if (toggleBtn) {
    toggleBtn.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );

    toggleBtn.setAttribute("aria-pressed", theme === "light");
  }
}

function setupThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const nextTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);

    toggleBtn.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
    );

    toggleBtn.setAttribute("aria-pressed", String(nextTheme === "light"));
  });
}

initializeTheme();
setupThemeToggle();
