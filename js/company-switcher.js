/* Your companies, and the selector at the top of the side menu on every signed-in page.
   window.CMOrgs is the list itself — the company you sign up with, plus any you add on
   new-company.html — and which one you're working in; the selector shows that company and your
   role, and opens the list to switch between them or, for an owner, to add another.
   Prototype: companies you add live in this browser (localStorage), per demo person; the one
   you're in lives in this tab (sessionStorage), and the pages read cm-company as they already do. */
(() => {
  const persona = document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel'; // the two demo people (the page's head decides)
  const get = (store, k, d) => { try { const v = store.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (store, k, v) => { try { store.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const person = get(sessionStorage, 'cm-person', null) || {};
  // demo: the person owns the company; only an owner can add companies. (An older demo's
  // super admin is an owner now.)
  const role = !person.role || person.role === 'super_admin' ? 'owner' : person.role;
  const ROLE = { owner: 'Owner', admin: 'Admin', manager: 'Manager', user: 'User' };

  const HOME = {
    miguel: { id: 'home', name: 'Ferreira Construções, Lda.', logo: '<img src="images/ferreira-logo.webp" alt="">', state: 'filled', country: 'PT', sector: 'Construction' },
    beatriz: { id: 'home', name: 'Veridian Harvest Co.', logo: '<span class="cs-mono cs-leaf"><svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 39c-13-4-17-17-9-29 6 6 9 18 9 29Z" fill="#fff"/><path d="M24 39c13-4 17-17 9-29-6 6-9 18-9 29Z" fill="#fff" fill-opacity=".82"/><circle cx="24" cy="40.5" r="2" fill="#fff"/></svg></span>', state: 'filled', country: 'US', sector: 'Other' },
  }[persona];
  const KEY = 'cm-orgs-' + persona, LINKS = 'cm-org-links-' + persona, LAST = 'cm-last-org-' + persona;

  // the companies, and how they hang together: links maps a subsidiary's id to its parent's
  const list = () => [HOME].concat(get(localStorage, KEY, []));
  const links = () => get(localStorage, LINKS, {});
  const parentOf = (id) => links()[id] || null;
  const childrenOf = (id) => Object.keys(links()).filter((k) => links()[k] === id);
  const byId = (id) => list().find((o) => o.id === id);
  const currentId = () => get(sessionStorage, 'cm-org', null) || get(localStorage, LAST, null) || 'home';
  const current = () => byId(currentId()) || HOME;
  // a new company: saved with its structure. A parent takes the companies picked to sit under it;
  // a subsidiary goes under the one picked as its parent.
  const add = (o, kids) => {
    const org = Object.assign({ id: 'c' + Date.now().toString(36), state: 'empty', created: new Date().toISOString().slice(0, 10) }, o);
    set(localStorage, KEY, get(localStorage, KEY, []).concat(org));
    const l = links();
    if (org.structure === 'subsidiary' && org.parent) l[org.id] = org.parent;
    if (org.structure === 'parent') (kids || []).forEach((k) => { l[k] = org.id; });
    set(localStorage, LINKS, l);
    return org;
  };
  // going into a company: an empty one opens on its empty homepage, where ALMA's step comes up
  // over it (skip it and the empty page stays); one with a profile opens on that profile
  const go = (o, opts = {}) => {
    set(sessionStorage, 'cm-org', o.id); set(localStorage, LAST, o.id);
    const st = o.state === 'filled' ? 'filled' : 'empty';
    try { sessionStorage.setItem('cm-company', st); localStorage.setItem('cm-last-company', st); } catch (e) {}
    // a company just created opens with ALMA asking for its mandatory documents (js/guided-upload.js)
    location.href = st === 'filled' ? 'my-company.html?filled' : 'my-company.html?page' + (opts.guided ? '&guided' : '');
  };
  const forget = () => {
    try {
      ['miguel', 'beatriz'].forEach((p) => ['cm-orgs-', 'cm-org-links-', 'cm-last-org-', 'cm-cards-', 'cm-team-'].forEach((k) => localStorage.removeItem(k + p)));
      ['cm-org', 'cm-newco-paid', 'cm-na', 'cm-doc-updates', 'cm-view-as'].forEach((k) => sessionStorage.removeItem(k));
      // and what was filed for the companies added (their guided upload, marks and updates)
      Object.keys(sessionStorage).filter((k) => /^cm-(guided|na|doc-updates)-/.test(k)).forEach((k) => sessionStorage.removeItem(k));
      // and the files uploaded (js/doc-files.js)
      if (window.indexedDB) indexedDB.deleteDatabase('cm-files');
    } catch (e) {}
  };
  window.CMOrgs = { persona, role, roleLabel: ROLE[role] || role, home: HOME, list, byId, current, parentOf, childrenOf, add, go, forget };

  // ALMA's intake marks the company filled when it's done: that's the company you're in
  const cur = current();
  try {
    if (cur.id !== 'home' && sessionStorage.getItem('cm-company') === 'filled' && cur.state !== 'filled') {
      set(localStorage, KEY, get(localStorage, KEY, []).map((o) => (o.id === cur.id ? Object.assign(o, { state: 'filled' }) : o)));
      cur.state = 'filled';
    }
  } catch (e) {}

  // inside a company you added, the page's own company name reads as that company
  if (cur.id !== 'home') document.querySelectorAll('.co-name').forEach((h) => { h.textContent = cur.name; h.classList.remove('co-name-empty'); });
  // logging out forgets every company added in this session (the main one isn't stored, so it
  // stays), how they hung together, which one you were in, and any card added along the way
  const out = document.getElementById('who-logout');
  if (out) out.addEventListener('click', () => forget());

  // the account menu's "Create a new company" is for owners only
  if (role !== 'owner') document.querySelectorAll('[data-owner-only]').forEach((a) => a.remove());

  // ---- the selector, on pages with the side menu ---------------------------------------------
  const sn = document.querySelector('.sn-in');
  if (!sn) return;
  const mono = (o) => (o.logo ? o.logo : `<span class="cs-mono">${esc(o.name.trim().charAt(0).toUpperCase() || '?')}</span>`);

  const css = `
.cs { position: relative; margin: 0 0 0.75rem; }
.cs-chip { display: flex; align-items: center; gap: 0.625rem; width: 100%; padding: 0.5rem 0.625rem 0.5rem 0.5rem; border: 1px solid var(--color-line); border-radius: 0.75rem;
  background: var(--color-surface); font: inherit; color: var(--color-ink); text-align: left; cursor: pointer; transition: border-color .14s ease, background-color .14s ease; }
.cs-chip:hover, .cs-chip[aria-expanded="true"] { border-color: var(--color-sand-400); background: var(--color-light-beige); }
.cs-chip:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.cs-logo { flex: none; width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; overflow: hidden; display: grid; place-items: center; }
.cs-logo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.cs-leaf { background: linear-gradient(155deg, #4a9636, var(--color-positive) 60%, #2f5f23); }
.cs-leaf svg { width: 62%; height: 62%; }
.cs-mono { display: grid; place-items: center; width: 100%; height: 100%; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.875rem; font-weight: 600; }
.cs-id { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
.cs-id b { font-size: 0.875rem; font-weight: 600; line-height: 1.25; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-role { margin-top: 0.125rem; font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-coral-deep, #c24a2c); }
.cs-chev { flex: none; width: 1rem; height: 1rem; color: var(--color-ink-subtle); transition: transform .2s var(--ease-brand, ease); }
.cs-chip[aria-expanded="true"] .cs-chev { transform: rotate(180deg); }
html[data-sn="rail"] .cs-chip { justify-content: center; padding: 0.25rem; border-color: transparent; background: none; }
html[data-sn="rail"] .cs-id, html[data-sn="rail"] .cs-chev { display: none; }
.cs-menu { position: fixed; z-index: 90; width: 19.5rem; max-height: calc(100vh - 6rem); overflow-y: auto; padding: 0.375rem;
  background: var(--color-surface); border: 1px solid var(--color-line); border-radius: 1rem; box-shadow: 0 12px 32px rgba(52, 52, 52, 0.14), 0 2px 6px rgba(52, 52, 52, 0.06); }
.cs-menu[hidden] { display: none; }
.cs-head { display: flex; align-items: baseline; justify-content: space-between; padding: 0.75rem 0.75rem 0.5rem; }
.cs-head b { font-size: 1.0625rem; font-weight: 600; }
.cs-head small { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cs-item { display: flex; align-items: flex-start; gap: 0.875rem; width: 100%; padding: 0.625rem 0.75rem; border: 0; border-radius: 0.625rem; background: none;
  font: inherit; color: var(--color-ink); text-align: left; text-decoration: none; cursor: pointer; }
.cs-item:hover, .cs-item:focus-visible { background: var(--color-light-beige); outline: none; color: var(--color-ink); }
.cs-item .cs-logo { width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; }
.cs-item-t { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; flex: 1 1 auto; }
.cs-item-t b { font-size: 0.9375rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cs-state { display: flex; align-items: center; gap: 0.4375rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cs-state i { width: 0.5rem; height: 0.5rem; border-radius: 1px; background: var(--color-sand-400, #c3c0b8); }
.cs-state.is-ok i { background: var(--color-positive); }
.cs-rel { font-size: 0.8125rem; color: var(--color-informative, #3a5a8c); }
.cs-tick { flex: none; width: 1.125rem; height: 1.125rem; margin-top: 0.625rem; color: var(--color-coral); }
.cs-sep { height: 1px; margin: 0.375rem 0.25rem; background: var(--color-mid-beige); }
.cs-new .cs-logo { border: 1.5px dashed var(--color-sand-400, #c3c0b8); color: var(--color-ink-subtle); }
.cs-new .cs-logo svg { width: 1.125rem; height: 1.125rem; }
.cs-new .cs-item-t span { font-size: 0.8125rem; color: var(--color-ink-subtle); line-height: 1.4; }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const CHEV = '<svg class="cs-chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>';
  const TICK = '<svg class="cs-tick" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>';
  const PEOPLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 19.1a9.4 9.4 0 0 0 6.7-.6 4.1 4.1 0 0 0-7.5-2.5M15 19.1a6.4 6.4 0 0 0-12.7 0M12 6.4a3.4 3.4 0 1 1-6.8 0 3.4 3.4 0 0 1 6.8 0Zm8.3 2.2a2.6 2.6 0 1 1-5.3 0 2.6 2.6 0 0 1 5.3 0Z"/></svg>';

  // the chip, right under the collapse button
  const box = document.createElement('div'); box.className = 'cs';
  box.innerHTML = `<button type="button" class="cs-chip" aria-haspopup="menu" aria-expanded="false" aria-controls="cs-menu" title="${esc(cur.name)}">
    <span class="cs-logo">${mono(cur)}</span><span class="cs-id"><b>${esc(cur.name)}</b><span class="cs-role">${ROLE[role] || role}</span></span>${CHEV}</button>`;
  const collapse = sn.querySelector('.sn-collapse');
  (collapse ? collapse.after(box) : sn.prepend(box));
  const chip = box.querySelector('.cs-chip');

  // the list, laid over the page so the side menu's scroll doesn't clip it
  const menu = document.createElement('div'); menu.className = 'cs-menu'; menu.id = 'cs-menu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Switch company'); menu.hidden = true;
  document.body.appendChild(menu);
  const paint = () => {
    const orgs = list();
    menu.innerHTML = `<div class="cs-head"><b>Switch company</b><small>${orgs.length} of yours</small></div>` + orgs.map((o) => {
      const up = parentOf(o.id), down = childrenOf(o.id).map(byId).filter(Boolean);
      const rel = up && byId(up) ? `Part of ${esc(byId(up).name)}` : down.length ? `Parent of ${down.map((k) => esc(k.name)).join(', ')}` : '';
      const state = o.state === 'filled' ? '<span class="cs-state is-ok"><i></i>Profile in place</span>' : '<span class="cs-state"><i></i>Empty &middot; set up with ALMA</span>';
      return `<button type="button" class="cs-item" role="menuitemradio" aria-checked="${o.id === cur.id}" data-org="${esc(o.id)}"><span class="cs-logo">${mono(o)}</span><span class="cs-item-t"><b>${esc(o.name)}</b>${state}${rel ? `<span class="cs-rel">${rel}</span>` : ''}</span>${o.id === cur.id ? TICK : ''}</button>`;
    }).join('') + (role === 'owner' || role === 'admin' ? `<div class="cs-sep" role="separator"></div><a class="cs-item cs-new" role="menuitem" href="team.html"><span class="cs-logo">${PEOPLE}</span><span class="cs-item-t"><b>Invite people</b><span>To ${esc(cur.name)}, with a role each</span></span></a>` : '');
  };
  const place = () => {
    const r = chip.getBoundingClientRect(), rail = document.documentElement.dataset.sn === 'rail';
    const w = menu.offsetWidth || 312;
    menu.style.top = (rail ? r.top : r.bottom + 8) + 'px';
    menu.style.left = Math.max(8, Math.min(rail ? r.right + 12 : r.left, innerWidth - w - 8)) + 'px';
  };
  // the side menu slides (collapse, phone drawer): follow it once it has settled
  const snEl = sn.closest('.sn');
  if (snEl) snEl.addEventListener('transitionend', (e) => { if (e.target === snEl && !menu.hidden) place(); });
  const openMenu = (on) => {
    if (on) { paint(); menu.hidden = false; place(); const first = menu.querySelector('[aria-checked="true"]') || menu.querySelector('.cs-item'); if (first) first.focus(); }
    else menu.hidden = true;
    chip.setAttribute('aria-expanded', String(on));
  };
  chip.addEventListener('click', (e) => { e.stopPropagation(); openMenu(menu.hidden); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target)) openMenu(false); });
  addEventListener('resize', () => { if (!menu.hidden) place(); });
  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { openMenu(false); chip.focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); const items = [...menu.querySelectorAll('.cs-item')], at = items.indexOf(document.activeElement);
      items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    }
  });
  menu.addEventListener('click', (e) => {
    const it = e.target.closest('button.cs-item'); if (!it) return;
    e.stopPropagation();
    const o = byId(it.dataset.org);
    if (!o || o.id === cur.id) { openMenu(false); return; }
    go(o);
  });
})();
