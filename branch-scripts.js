// branch-scripts.js

// =====================
// MOBILE NAV TOGGLE
// =====================
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("mainNav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("show");
    navToggle.setAttribute("aria-expanded", isOpen);
  });

  // Close menu when clicking a link (mobile)
  mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("show");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !mainNav.contains(e.target) &&
      !navToggle.contains(e.target)
    ) {
      mainNav.classList.remove("show");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}


document.addEventListener('DOMContentLoaded', () => {
  // MENU: filter by category and search
  const category = document.getElementById('categoryFilter');
  const search = document.getElementById('menuSearch');
  const menuList = document.getElementById('menuList');

  function updateMenuFilter() {
    const cat = category.value;
    const q = (search.value || '').trim().toLowerCase();
    const categories = Array.from(menuList.querySelectorAll('.menu-category'));

    categories.forEach(section => {
      const secCat = section.getAttribute('data-category') || 'all';
      // Check category match
      const catMatch = (cat === 'all') || (secCat === cat);
      // Check search match across items in this section
      let anyItemMatch = false;
      const items = Array.from(section.querySelectorAll('.menu-item'));
      items.forEach(item => {
        const name = (item.querySelector('.mi-name')?.textContent || '').toLowerCase();
        const desc = (item.querySelector('.mi-desc')?.textContent || '').toLowerCase();
        const matches = (!q) || name.includes(q) || desc.includes(q);
        item.style.display = matches ? '' : 'none';
        if (matches) anyItemMatch = true;
      });
      // Show or hide entire section
      section.style.display = (catMatch && anyItemMatch) ? '' : 'none';
    });
  }

  category.addEventListener('change', updateMenuFilter);
  search.addEventListener('input', updateMenuFilter);

  // Initial run
  updateMenuFilter();

  // GALLERY: simple lightbox
  const gallery = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbClose = document.getElementById('lbClose');

  gallery?.addEventListener('click', (e) => {
    const btn = e.target.closest('.gcell');
    if (!btn) return;
    const src = btn.getAttribute('data-src');
    if (!src) return;
    lbImg.src = src;
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbImg.focus?.();
  });

  lbClose?.addEventListener('click', () => {
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
  });

  // close on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      lbImg.src = '';
    }
  });

  // RESERVATIONS: client-side validation + mock submission
  const reservationForm = document.getElementById('reservationForm');
  reservationForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // basic validity
    if (!reservationForm.checkValidity()) {
      reservationForm.reportValidity();
      return;
    }

    const data = {
      name: reservationForm.name.value.trim(),
      phone: reservationForm.phone.value.trim(),
      Email: reservationForm.Email.value,
      date: reservationForm.date.value,
      time: reservationForm.time.value,
      guests: reservationForm.guests.value
    };

    // Demonstration: show confirmation UI (in production, POST to /api/branches/Narapally/reservations)
    alert(`Hello ${data.name}! Reservation request received for ${data.guests} on ${data.date} at ${data.time}. We will contact you at ${data.phone}. / ${data.Email}. I Advice you to call the Branch directly if you did not receive call or email. Thankyou!`);
    reservationForm.reset();
  }); 
  

  // Small accessibility: ensure menu search 'Enter' focuses first visible item
  search?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const first = menuList.querySelector('.menu-item:not([style*="display: none"])');
      if (first) {
        first.querySelector('.mi-name')?.focus?.();
      }
    }
  });
});
