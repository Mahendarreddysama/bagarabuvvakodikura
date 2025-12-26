/* =========================================
   HAMBURGER MENU (MATCHES YOUR HTML + CSS)
========================================= */

const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("active");
  });

  // Close menu when a link is clicked (mobile UX)
  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
    });
  });
}

/* =========================================
   SMOOTH SCROLL (ACCESSIBLE)
========================================= */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");

    if (targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        // Accessibility focus
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
        setTimeout(() => target.removeAttribute("tabindex"), 1000);
      }
    }
  });
});

/* =========================================
   IMAGE ERROR FALLBACK
========================================= */

document.querySelectorAll("img").forEach(img => {
  img.onerror = () => {
    img.src =
      'data:image/svg+xml;charset=UTF-8,' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">' +
      '<rect width="100%" height="100%" fill="%23f3f4f6"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ' +
      'fill="%236b7280" font-family="Arial" font-size="18">' +
      'Image not available</text></svg>';
  };
});

/* =========================================
   REDUCED MOTION SUPPORT
========================================= */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (prefersReducedMotion.matches) {
  document.documentElement.style.scrollBehavior = "auto";
}

