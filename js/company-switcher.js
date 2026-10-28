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
  // the test user (register.html) starts from nothing every time: logging out wipes all the demo
  // kept in this browser, whoever it belonged to; only cookies, language and the side menu stay.
  // Its company is a new one, with no name yet: its documents are only what it uploads to ALMA,
  // section by section (js/guided-upload.js, js/doc-model.js)
  const TEST = /^test@c-more\.test$/i.test(person.email || '');
  if (TEST) Object.assign(HOME, { name: ((get(sessionStorage, 'cm-co-profile-v2', {}) || {}).test || {}).name || 'Your company', // once ALMA's check has named it (js/co-profile.js)
    logo: '', state: 'empty', country: person.country || 'PT', tax: person.nipc || '' });
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
  const KEEP = ['cm-cookies', 'cm-lang', 'cm-sn-closed'];
  const wipe = () => [sessionStorage, localStorage].forEach((st) => Object.keys(st).filter((k) => /^cm-/.test(k) && !KEEP.includes(k)).forEach((k) => st.removeItem(k)));
  const forget = () => {
    try {
      if (TEST) wipe();
      ['miguel', 'beatriz'].forEach((p) => ['cm-orgs-', 'cm-org-links-', 'cm-last-org-', 'cm-cards-', 'cm-team-'].forEach((k) => localStorage.removeItem(k + p)));
      ['cm-org', 'cm-newco-paid', 'cm-newco-id', 'cm-na', 'cm-doc-updates', 'cm-view-as'].forEach((k) => sessionStorage.removeItem(k));
      // and what was filed for the companies added (their guided upload, marks and updates), and
      // the crew changes approved from a worker list (js/doc-upload.js)
      Object.keys(sessionStorage).filter((k) => /^cm-(guided|na|doc-updates|crew)(-|$)/.test(k)).forEach((k) => sessionStorage.removeItem(k));
      // and the files uploaded (js/doc-files.js)
      if (window.indexedDB) indexedDB.deleteDatabase('cm-files');
    } catch (e) {}
  };
  window.CMOrgs = { persona, test: TEST, role, roleLabel: ROLE[role] || role, home: HOME, list, byId, current, parentOf, childrenOf, add, go, forget };

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

  // the test user's company, before ALMA has filled it, has nothing to tell anyone yet: the demo's
  // notifications go, and the panel says so
  if (TEST && HOME.state === 'empty' && cur.id === 'home') {
    const nt = document.getElementById('nt');
    if (nt) {
      nt.querySelectorAll('.nt-item').forEach((i) => i.classList.remove('is-unread'));
      nt.querySelectorAll('.nt-list').forEach((l, n) => { if (n) l.remove(); else l.outerHTML = '<p class="nt-none" style="margin:0;padding:1.5rem 1.25rem;text-align:center;font-size:0.875rem;line-height:1.5;color:var(--color-ink-subtle)">No notifications yet. They show up here once ALMA has your documents.</p>'; });
      const ra = document.getElementById('nt-readall'); if (ra) ra.hidden = true;
    }
    document.querySelectorAll('[data-sn-count]').forEach((c) => { c.textContent = '0'; c.hidden = true; });
    const bell = document.getElementById('hdr-bell'); if (bell) bell.setAttribute('aria-label', 'Notifications');
  }

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

// The side menu's Documents, opened up: under it, its sections (the cards on the Documents page:
// Company, Workers, Equipment, Products, whichever the company has). The pages that know them
// (they load js/doc-model.js) keep the list for the others, per person and company.
(() => {
  const nav = document.querySelector('.sn-item[title="Documents"]');
  if (!nav || nav.hidden || !window.CMOrgs) return;
  const O = window.CMOrgs, org = O.current();
  const KEY = `cm-doc-areas-${O.persona}${O.test ? '-test' : ''}-${org ? org.id : 'home'}`;
  const read = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  let areas = null;
  if (window.DOC_MODEL && window.DOC_MODEL.AREAS) {
    areas = window.DOC_MODEL.AREAS.map((a) => [a.key, a.title]);
    try { sessionStorage.setItem(KEY, JSON.stringify(areas)); } catch (e) {}
  } else areas = read() || (O.persona === 'beatriz' ? [['company', 'Company'], ['products', 'Products']] : [['company', 'Company'], ['workers', 'Workers'], ['equipment', 'Equipment']]);
  if (!areas.length) return;
  const css = `
.sn-sub { display: grid; gap: 1px; margin: 0.125rem 0 0.375rem; padding-left: 2.75rem; }
.sn-sub a { position: relative; display: flex; align-items: center; height: 2rem; margin-left: -0.625rem; padding: 0 0.625rem; border-radius: 0.375rem; font-size: 0.875rem;
  color: var(--color-ink-subtle); text-decoration: none; white-space: nowrap; transition: background-color .14s ease, color .14s ease; }
.sn-sub a::before { content: ""; position: absolute; left: -0.75rem; top: 0; bottom: 0; width: 1px; background: var(--color-line); }
.sn-sub a:hover { background: var(--color-light-beige); color: var(--color-ink); }
.sn-sub a.is-on { color: var(--color-ink); font-weight: 600; }
.sn-sub a.is-on::before { width: 2px; left: -0.8125rem; background: var(--color-coral); }
.sn-sub a:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: -2px; }
html[data-sn="rail"] .sn-sub { display: none; }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const sub = document.createElement('div');
  sub.className = 'sn-sub'; sub.setAttribute('role', 'group'); sub.setAttribute('aria-label', 'Document sections');
  sub.innerHTML = areas.map(([k, t]) => `<a href="company-details.html?area=${k}" data-sn-area="${k}">${t}</a>`).join('');
  nav.after(sub);
  // the section open on the Documents page (js/company-details.js says which, as it changes)
  const mark = (k) => sub.querySelectorAll('a').forEach((a) => { const on = a.dataset.snArea === k; a.classList.toggle('is-on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  if (/company-details/.test(location.pathname)) mark(new URLSearchParams(location.search).get('area'));
  document.addEventListener('cm-docs-area', (e) => mark(e.detail));
})();

// Coming soon: what's shown but not open at launch. The badge is styled here, once for every page
// (js/company-details.js and js/guided-upload.js use it too): the side menu's C-MORE ecosystem,
// Questionnaires and My clients, and Documents' Workers and Equipment.
// the company homepage, as the side menu's Company overview opens it (the empty one for a company
// with nothing in it yet: a test user's lands there, its setup already skipped)
const cmSoonHome = () => { const a = document.querySelector('.sn-item[title="Company overview"]'); const h = a && a.getAttribute('href'); return h && h !== '#' ? h : 'my-company.html?filled'; };
window.CM_SOON = {
  badge: '<span class="cm-soon">Coming soon</span>', areas: ['workers', 'equipment'].filter((k) => !(window.CM_SOON_OPEN || []).includes(k)),
  // instead of the feature itself: an empty state, ALMA big, saying it's on its way
  screen: (what, verb = 'is') => `<section class="cm-soon-page" aria-labelledby="cm-soon-t"><span class="alma-media cm-soon-alma" aria-hidden="true">${(window.ESG && window.ESG.SPHERES) || ''}</span>
    <p class="cm-soon-says">ALMA</p><h1 id="cm-soon-t">${what} ${verb} coming soon. <span>Stay tuned.</span></h1>
    <p class="cm-soon-p">I&rsquo;m getting it ready for you. I&rsquo;ll let you know the moment it opens.</p>
    <a class="btn btn-quiet" href="${cmSoonHome()}">Back to my company</a></section>`,
};
(() => {
  const st = document.createElement('style');
  st.textContent = `
.cm-soon { display: inline-flex; align-items: center; flex: none; height: 1.25rem; padding: 0 0.4375rem; border-radius: 0.3125rem; background: var(--color-mid-beige); color: var(--color-ink-muted);
  font-size: 0.625rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; line-height: 1; white-space: nowrap; vertical-align: middle; }
/* in the menu, the badge always sits in the same spot: under the label */
.sn-sub a.has-soon { flex-direction: column; align-items: flex-start; justify-content: center; gap: 0.1875rem; height: auto; min-height: 2rem; padding-block: 0.3125rem; }
.sn-sub .cm-soon { height: 1rem; padding: 0 0.3125rem; font-size: 0.5625rem; font-weight: 600; }
.sn-item.has-soon { height: auto; min-height: 2.625rem; padding-block: 0.375rem; }
.sn-item.has-soon .sn-l { display: flex; flex-direction: column; align-items: flex-start; gap: 0.1875rem; }
.sn-item.has-soon .cm-soon { height: 1rem; padding: 0 0.3125rem; font-size: 0.5625rem; }
html[data-sn="rail"] .sn-item.has-soon { height: 2.625rem; padding-block: 0; }
.cm-soon-page { display: grid; justify-items: center; align-content: center; min-height: calc(100svh - 12rem); padding: 3rem 1.25rem 4rem; text-align: center; }
.cm-soon-alma { width: min(18rem, 60vw, 34svh); margin-bottom: 0.5rem; }
.cm-soon-says { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-subtle); }
.cm-soon-says::before { content: ""; width: 0.375rem; height: 0.375rem; border-radius: 1px; background: var(--color-coral); }
.cm-soon-page h1 { margin-top: 0.875rem; max-width: 36rem; font-size: clamp(1.875rem, 4.5vw, 2.75rem); line-height: 1.08; font-weight: 600; letter-spacing: -0.02em; }
.cm-soon-page h1 span { font-weight: 300; }
.cm-soon-p { margin-top: 0.875rem; max-width: 30rem; font-size: 1.0625rem; line-height: 1.5; color: var(--color-ink-muted); }
.cm-soon-page .btn { margin-top: 2rem; }
/* inside a page's section (the homepage's projects): smaller, and nowhere to go back to */
.cm-soon-page.is-inline { min-height: 0; padding: 1.5rem 0 1rem; }
.cm-soon-page.is-inline .cm-soon-alma { width: min(11rem, 40vw); }
.cm-soon-page.is-inline h1 { font-size: clamp(1.5rem, 3vw, 2rem); }
.cm-soon-page.is-inline .btn { display: none; }
#cdetails.is-soon :is(.cd-hero, #cd-drop, .cd-cards, .cd-sec > .co-wrap > .co-sub-head) { display: none; }
#cdetails.is-soon .cm-soon-page { min-height: calc(100svh - 16rem); }`;
  document.head.appendChild(st);
  const put = (el) => { if (el && !el.querySelector('.cm-soon')) el.insertAdjacentHTML('beforeend', window.CM_SOON.badge); };
  // a page that is coming soon shows only that; My clients has no page yet, so it opens the
  // ecosystem's address with ?soon=clients and shows the same there
  const path = location.pathname.split('/').pop() || 'index.html', q = new URLSearchParams(location.search);
  const PAGES = { 'ecosystem.html': ['The C&#8209;MORE ecosystem', 'C-MORE ecosystem'], 'questionnaires.html': ['Questionnaires', 'Questionnaires', 'are'],
    'esg-questionnaire.html': ['Questionnaires', 'Questionnaires', 'are'], 'esg-results.html': ['Questionnaires', 'Questionnaires', 'are'] };
  const OPEN = window.CM_SOON_OPEN || [];
  if (OPEN.includes('ecosystem')) delete PAGES['ecosystem.html'];
  if (OPEN.includes('questionnaires')) ['questionnaires.html', 'esg-questionnaire.html', 'esg-results.html'].forEach((k) => { delete PAGES[k]; });
  const page = q.get('soon') === 'clients' && !OPEN.includes('clients') ? ['My clients', 'My clients'] : PAGES[path];
  const main = document.querySelector('main.page');
  if (page && main) {
    main.innerHTML = window.CM_SOON.screen(page[0], page[2]);
    document.title = page[1].replace('C-MORE ', 'C\u2011MORE ') + ' · C-MORE';
    document.querySelectorAll('.sn-item').forEach((a) => { const on = a.getAttribute('title') === page[1]; a.classList.toggle('is-on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  }
  const clients = document.querySelector('.sn-item[title="My clients"]');
  if (clients && !OPEN.includes('clients')) {
    clients.setAttribute('href', 'ecosystem.html?soon=clients'); clients.removeAttribute('data-sn');
    clients.addEventListener('click', (e) => { e.stopImmediatePropagation(); }, true);
  }
  // Projects: coming soon (open for Miguel). On the company homepage its section shows that, not the projects
  const proj = !OPEN.includes('projects') && document.querySelector('.co-proj-sec');
  if (proj) {
    proj.innerHTML = `<div class="co-wrap"><div class="co-sub-head co-sub-head-top"><h3 class="eyebrow">My projects</h3></div>${window.CM_SOON.screen('Projects', 'are')}</div>`;
    proj.querySelector('.cm-soon-page').classList.add('is-inline');
  }
  ['Projects', 'C-MORE ecosystem', 'Questionnaires', 'My clients'].filter((t) => !OPEN.includes({ Projects: 'projects', 'C-MORE ecosystem': 'ecosystem', Questionnaires: 'questionnaires', 'My clients': 'clients' }[t])).forEach((t) => {
    const it = document.querySelector(`.sn-item[title="${t}"]`), l = it && it.querySelector('.sn-l');
    if (l) { it.classList.add('has-soon'); put(l); }
  });
  window.CM_SOON.areas.forEach((k) => { const a = document.querySelector(`.sn-sub a[data-sn-area="${k}"]`); if (a) { a.classList.add('has-soon'); put(a); } });
})();
