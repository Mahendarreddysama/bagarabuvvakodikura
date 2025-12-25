/* admin-scripts.js
 * Client-side admin demo.
 * - Data stored in localStorage key: 'bb_admin_data'
 * - Replace localStorage calls with API fetch() to persist to server in production.
 */

(() => {
  // ---------- Utilities ----------
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));
  const toast = (msg, t = 2500) => {
    const tb = qs('#toast'); tb.textContent = msg; tb.style.display = 'block'; tb.setAttribute('aria-hidden','false');
    setTimeout(()=>{ tb.style.display='none'; tb.setAttribute('aria-hidden','true'); }, t);
  };

  // ---------- Storage ----------
  const STORE_KEY = 'bb_admin_data';
  const demoData = {
    branches: [
      {
        slug: 'Narapally', name: 'Narapally', address: 'Narapally', phone: '+919876543210',
        email: 'narapally@bagarabuvva.com', map:'', hours: 'Mon-Sun:11:00-23:00', about:'Narapally branch. Manager: Sukumar.',
        menu: [
          { id: genId(), category:'starters', name:'Guntur Chili Chicken', price:165, desc:'Spicy, tangy.' },
          { id: genId(), category:'mains', name:'Bagara Kodi (Full)', price:520, desc:'House special.' }
        ],
        gallery: []
      }
    ]
  };

  function genId(){ return 'id_' + Math.random().toString(36).slice(2,9); }

  function loadStore(){
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) {
      localStorage.setItem(STORE_KEY, JSON.stringify(demoData));
      return JSON.parse(JSON.stringify(demoData));
    }
    try { return JSON.parse(raw); } catch(e) { console.error('Invalid store JSON, resetting.'); localStorage.setItem(STORE_KEY, JSON.stringify(demoData)); return JSON.parse(JSON.stringify(demoData)); }
  }
  function saveStore(data){
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }

  // ---------- State ----------
  let store = loadStore();
  let activeBranchSlug = null;

  // ---------- Elements ----------
  const loginEl = qs('#login');
  const loginForm = qs('#loginForm');
  const demoBtn = qs('#demoBtn');
  const mainUI = qs('#mainUI');

  const branchListEl = qs('#branchList');
  const branchFilter = qs('#branchFilter');
  const btnAddBranch = qs('#btnAddBranch');

  const panelTitle = qs('#panelTitle');
  const tabBtns = qsa('.tab');
  const tabPanes = qsa('.tab-pane');

  // Details form
  const detailsForm = qs('#detailsForm');
  const btnUpdateDetails = qs('#btnUpdateDetails');
  const btnDeleteBranch = qs('#btnDeleteBranch');

  // Menu controls
  const menuCategory = qs('#menuCategory');
  const menuName = qs('#menuName');
  const menuPrice = qs('#menuPrice');
  const menuDesc = qs('#menuDesc');
  const btnAddMenu = qs('#btnAddMenu');
  const btnClearMenu = qs('#btnClearMenu');
  const menuListEl = qs('#menuList');

  // Gallery
  const galleryUpload = qs('#galleryUpload');
  const galleryGrid = qs('#galleryGrid');

  // Header actions
  const btnExport = qs('#btnExport');
  const btnImport = qs('#btnImport');
  const importFile = qs('#importFile');
  const btnLogout = qs('#btnLogout');
  const btnSave = qs('#btnSave');
  const btnReset = qs('#btnReset');

  // ---------- Auth (very small client-side gate) ----------
  function showLogin(){ loginEl.style.display='flex'; loginEl.setAttribute('aria-hidden','false'); mainUI.hidden=true; }
  function hideLogin(){ loginEl.style.display='none'; loginEl.setAttribute('aria-hidden','true'); mainUI.hidden=false; }
  // Simple check: user either enters password 'admin123' or uses Demo Mode
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = qs('#pwd', loginForm).value;
    if (pw === 'admin123') {
      hideLogin();
      toast('Signed in (demo)');
      renderAll();
    } else {
      alert('Wrong password for demo. Use "admin123" or Demo Mode.');
    }
  });
  demoBtn.addEventListener('click', (e) => {
    hideLogin();
    toast('Demo mode enabled — no server auth.');
    renderAll();
  });

  // If store empty, show login to prevent accidental edits
  showLogin();

  // ---------- Render branches list ----------
  function renderBranches(filter = ''){
    branchListEl.innerHTML = '';
    const list = store.branches.filter(b => (b.name + ' ' + b.slug).toLowerCase().includes(filter.toLowerCase()));
    list.forEach(b => {
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.className = b.slug === activeBranchSlug ? 'active' : '';
      const left = document.createElement('div');
      left.innerHTML = `<strong>${b.name}</strong><div class="meta">${b.slug} · ${b.phone || ''}</div>`;
      const right = document.createElement('div');
      right.innerHTML = `<button data-slug="${b.slug}" class="btn ghost">Edit</button>`;
      li.appendChild(left);
      li.appendChild(right);
      li.addEventListener('click', () => selectBranch(b.slug));
      branchListEl.appendChild(li);
    });
  }

  // ---------- Select branch ----------
  function selectBranch(slug){
    activeBranchSlug = slug;
    const b = store.branches.find(x => x.slug === slug);
    if (!b) return;
    panelTitle.textContent = `Managing: ${b.name} (${b.slug})`;
    // set details form
    detailsForm.name.value = b.name || '';
    detailsForm.slug.value = b.slug || '';
    detailsForm.address.value = b.address || '';
    detailsForm.phone.value = b.phone || '';
    detailsForm.email.value = b.email || '';
    detailsForm.map.value = b.map || '';
    detailsForm.hours.value = b.hours || '';
    detailsForm.about.value = b.about || '';
    // render menu & gallery
    renderMenu();
    renderGallery();
    renderBranches(branchFilter.value || '');
    // show details tab
    switchTab('details');
  }

  // ---------- Add branch ----------
  btnAddBranch.addEventListener('click', () => {
    const base = 'new-branch';
    let slug = base;
    let idx = 1;
    while (store.branches.some(b => b.slug === slug)) { slug = `${base}-${idx++}`; }
    const newB = { slug, name: 'New Branch', address:'', phone:'', email:'', map:'', hours:'', about:'', menu: [], gallery: [] };
    store.branches.push(newB);
    saveStore(store);
    activeBranchSlug = slug;
    renderBranches();
    selectBranch(slug);
    toast('New branch created (local)');
  });

  // ---------- Update details ----------
  btnUpdateDetails.addEventListener('click', (e) => {
    e.preventDefault();
    if (!activeBranchSlug) return alert('Select a branch first.');
    const b = store.branches.find(x => x.slug === activeBranchSlug);
    if (!b) return;
    // validate slug uniqueness
    const newSlug = detailsForm.slug.value.trim();
    if (!newSlug.match(/^[a-z0-9-]+$/)) return alert('Slug must be lowercase letters, numbers, hyphens only.');
    if (newSlug !== activeBranchSlug && store.branches.some(x => x.slug === newSlug)) return alert('Slug already in use.');
    // apply changes
    b.name = detailsForm.name.value.trim();
    b.slug = newSlug;
    b.address = detailsForm.address.value.trim();
    b.phone = detailsForm.phone.value.trim();
    b.email = detailsForm.email.value.trim();
    b.map = detailsForm.map.value.trim();
    b.hours = detailsForm.hours.value.trim();
    b.about = detailsForm.about.value.trim();
    // if slug changed, update activeBranchSlug
    activeBranchSlug = b.slug;
    saveStore(store);
    renderBranches(branchFilter.value || '');
    selectBranch(activeBranchSlug);
    toast('Branch details updated (local)');
  });

  // ---------- Delete branch ----------
  btnDeleteBranch.addEventListener('click', (e) => {
    e.preventDefault();
    if (!activeBranchSlug) return;
    if (!confirm('Delete this branch? This deletes menus and gallery too.')) return;
    store.branches = store.branches.filter(b => b.slug !== activeBranchSlug);
    activeBranchSlug = store.branches[0] ? store.branches[0].slug : null;
    saveStore(store);
    renderBranches();
    if (activeBranchSlug) selectBranch(activeBranchSlug);
    else { panelTitle.textContent = 'Select a branch'; clearPanel(); }
    toast('Branch deleted (local)');
  });

  function clearPanel(){
    detailsForm.reset();
    menuListEl.innerHTML = '';
    galleryGrid.innerHTML = '';
  }

  // ---------- Menu CRUD ----------
  btnAddMenu.addEventListener('click', (e) => {
    e.preventDefault();
    if (!activeBranchSlug) return alert('Select a branch first.');
    const b = store.branches.find(x => x.slug === activeBranchSlug);
    const item = {
      id: genId(),
      category: menuCategory.value,
      name: (menuName.value || '').trim(),
      price: Number(menuPrice.value || 0),
      desc: (menuDesc.value || '').trim()
    };
    if (!item.name) return alert('Item name required');
    b.menu = b.menu || [];
    b.menu.push(item);
    saveStore(store);
    renderMenu();
    // clear
    menuName.value = '';
    menuPrice.value = '';
    menuDesc.value = '';
    toast('Menu item added (local)');
  });

  function renderMenu(){
    menuListEl.innerHTML = '';
    const b = store.branches.find(x => x.slug === activeBranchSlug);
    if (!b || !b.menu) return;
    b.menu.forEach(it => {
      const li = document.createElement('li');
      li.innerHTML = `<div class="left"><strong>${it.name}</strong><div class="meta">${it.category} · ${it.desc || ''}</div></div>
                      <div class="right"><div class="price">₹${it.price}</div>
                      <button data-id="${it.id}" class="btn ghost edit">Edit</button>
                      <button data-id="${it.id}" class="btn danger del">Delete</button></div>`;
      menuListEl.appendChild(li);

      // edit
      li.querySelector('.edit').addEventListener('click', () => {
        // populate fields for editing and allow replacing by deleting then adding (simple UX)
        menuCategory.value = it.category;
        menuName.value = it.name;
        menuPrice.value = it.price;
        menuDesc.value = it.desc;
        // remove existing item
        b.menu = b.menu.filter(x => x.id !== it.id);
        saveStore(store);
        renderMenu();
      });
      // delete
      li.querySelector('.del').addEventListener('click', () => {
        if (!confirm('Delete this menu item?')) return;
        b.menu = b.menu.filter(x => x.id !== it.id);
        saveStore(store);
        renderMenu();
        toast('Menu item deleted (local)');
      });
    });
  }

  btnClearMenu.addEventListener('click', (e) => {
    e.preventDefault();
    menuCategory.value='starters';
    menuName.value=''; menuPrice.value=''; menuDesc.value='';
  });

  // ---------- Gallery ----------
  galleryUpload.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (!activeBranchSlug) { alert('Select a branch first.'); return; }
    const b = store.branches.find(x => x.slug === activeBranchSlug);
    b.gallery = b.gallery || [];

    for (const f of files) {
      // limit size in demo
      if (f.size > 2_000_000) { toast('Skipping large file (>2MB)'); continue; }
      const dataUrl = await fileToDataUrl(f);
      b.gallery.push({ id: genId(), name: f.name, dataUrl, uploadedAt: Date.now() });
    }
    saveStore(store);
    renderGallery();
    galleryUpload.value = '';
    toast('Photos uploaded (local)');
  });

  function renderGallery(){
    galleryGrid.innerHTML = '';
    const b = store.branches.find(x => x.slug === activeBranchSlug);
    if (!b || !b.gallery) return;
    b.gallery.forEach(img => {
      const div = document.createElement('div'); div.className='gallery-thumb';
      div.innerHTML = `<img src="${img.dataUrl}" alt="${img.name}" /><button data-id="${img.id}" title="Delete">🗑</button>`;
      galleryGrid.appendChild(div);
      div.querySelector('button').addEventListener('click', () => {
        if (!confirm('Delete this photo?')) return;
        b.gallery = b.gallery.filter(x => x.id !== img.id);
        saveStore(store);
        renderGallery();
        toast('Photo removed (local)');
      });
    });
  }

  // helper: file to dataURL
  function fileToDataUrl(file){
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  // ---------- Tabs ----------
  tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));
  function switchTab(tab){
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    tabPanes.forEach(p => p.hidden = p.dataset.pane !== tab);
  }

  // ---------- Branch search filter ----------
  branchFilter.addEventListener('input', (e) => renderBranches(e.target.value));

  // ---------- Export / Import ----------
  btnExport.addEventListener('click', () => {
    const data = JSON.stringify(store, null, 2);
    const blob = new Blob([data], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bagara-admin-data.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  });

  btnImport.addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        if (!confirm('Import will replace current local data. Continue?')) return;
        store = parsed;
        saveStore(store);
        activeBranchSlug = store.branches[0] ? store.branches[0].slug : null;
        renderAll();
        toast('Imported JSON (local)');
      } catch (err) { alert('Invalid JSON file'); }
    };
    r.readAsText(f);
  });

  // ---------- Logout (local) ----------
  btnLogout.addEventListener('click', () => {
    if (!confirm('Logout?')) return;
    showLogin();
    toast('Logged out (demo)');
  });

  // ---------- Save (local) ----------
  btnSave.addEventListener('click', () => {
    saveStore(store);
    toast('Saved to localStorage');
  });

  // Reset to demo
  btnReset.addEventListener('click', () => {
    if (!confirm('Reset local data to demo state?')) return;
    store = JSON.parse(JSON.stringify(demoData));
    saveStore(store);
    activeBranchSlug = store.branches[0] ? store.branches[0].slug : null;
    renderAll();
    toast('Reset to demo data');
  });

  // ---------- Render everything ----------
  function renderAll(){
    renderBranches();
    if (!activeBranchSlug && store.branches.length) activeBranchSlug = store.branches[0].slug;
    if (activeBranchSlug) selectBranch(activeBranchSlug);
    else { panelTitle.textContent='Add a branch to get started'; clearPanel(); }
  }

  // ---------- Small helpers (clear fields etc) ----------
  function genDemoBranchesIfEmpty(){
    if (!store.branches || !store.branches.length) {
      store = JSON.parse(JSON.stringify(demoData));
      saveStore(store);
    }
  }

  // init
  genDemoBranchesIfEmpty();

  // Expose some functions for dev console
  window.bbAdmin = {
    store, saveStore, loadStore
  };

})();
