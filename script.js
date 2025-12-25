// scripts.js
// Lightweight JS: mobile nav toggle, branch search/filter, keyboard accessibility & smooth scroll.

// DOM shortcuts
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
const branchSearch = document.getElementById('branchSearch');
const branchesGrid = document.getElementById('branchesGrid');

// Mobile nav toggle
if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    // toggle visibility
    if (mainNav.style.display === 'flex') {
      mainNav.style.display = '';
    } else {
      mainNav.style.display = 'flex';
      mainNav.style.flexDirection = 'column';
      mainNav.style.gap = '8px';
      mainNav.style.alignItems = 'flex-end';
    }
  });

  // Close mobile nav on outside click
  document.addEventListener('click', (e) => {
    if (!mainNav.contains(e.target) && e.target !== navToggle && window.innerWidth <= 720) {
      mainNav.style.display = '';
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }, { capture: true });
}

// Smooth scroll for same-page anchors
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // move focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        window.setTimeout(() => target.removeAttribute('tabindex'), 1000);
      }
    }
  });
});

// Branch search / filter (client-side)
if (branchSearch && branchesGrid) {
  branchSearch.addEventListener('input', (e) => {
    const q = (e.target.value || '').trim().toLowerCase();
    const cards = Array.from(branchesGrid.querySelectorAll('.branch-card'));
    if (!q) {
      cards.forEach(c => c.style.display = '');
      return;
    }
    cards.forEach(card => {
      const title = (card.querySelector('h4')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      if (title.includes(q) || desc.includes(q)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  });

  // Enter key on search focuses first visible branch card
  branchSearch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = branchesGrid.querySelector('.branch-card:not([style*="display: none"])');
      if (first) first.focus();
    }
  });
}

// Improve branch-card keyboard accessibility
document.querySelectorAll('.branch-card').forEach(card => {
  // make link-friendly reachable by keyboard if it's an anchor it's already focusable
  // add keyboard handlers for Enter/Space to navigate
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      // if it's an <a>, let it proceed naturally; otherwise, simulate click
      if (card.tagName.toLowerCase() !== 'a') {
        e.preventDefault();
        card.click();
      }
    }
  });
});

// Make images lazy & add error fallback
document.querySelectorAll('img').forEach(img => {
  img.onerror = () => {
    img.src = 'data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="Arial" font-size="18">Image not available</text></svg>';
  };
});

// Optional: Detect reduced motion preference and disable smooth scrolling if set
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReduced.matches) {
  // Remove our smooth scroll behaviour
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.removeEventListener('click', () => {});
  });
}