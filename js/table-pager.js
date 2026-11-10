/* Pages for any long table: more than ten rows and it shows ten to a page, with the page numbers
   centred under it, as on Project overview (my-company.html). It works on the tables as the pages
   draw them, and again each time they redraw: the page you were on is kept (by which table it is),
   and whatever a page hides itself (a search, a filter) isn't counted. A row's own extra rows (its
   note, its versions when opened) go with it, on the same page.
   Project overview's and the products' tables have their own pager (with their search and filters),
   so they are left alone. */
(() => {
  const PER = 10;
  const PAGED = 'table.co-tbl, table.sp-tbl, table.pd-tbl, .tm-rev-wrap > table, .si-wrap > table, table[data-paged]';
  const SKIP = '#co-proj-filled, #co-prod-filled, .cd-h-tbl, .cd-fields, .tm-perm, [data-unpaged]';
  // rows that belong to the row above them
  const FOLLOW = '.cd-note-tr, .cd-exp, .cmv-tr, [data-follows]';
  const pages = new Map(); // table key -> { page, of: how many rows it was paging }
  const css = document.createElement('style');
  css.textContent = `tr.pg-x { display: none !important; }
.pg-nav { display: flex; justify-content: center; margin-top: 1rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.pg-nav[hidden] { display: none; }
.pg-nav .pg-btns { display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 0.25rem; }
.pg-nav button { min-width: 2.25rem; height: 2.25rem; padding: 0 0.625rem; border: 1px solid transparent; border-radius: 0.5rem; background: none; font: inherit; font-weight: 500; color: var(--color-ink); cursor: pointer; }
.pg-nav button:hover:not(:disabled) { background: var(--color-mid-beige); }
.pg-nav button[aria-current="page"] { background: var(--color-surface); border-color: var(--color-line); font-weight: 700; box-shadow: 0 1px 2px rgba(52, 52, 52, .06); }
.pg-nav button:disabled { color: var(--color-sand-400); cursor: not-allowed; }
.pg-nav .pg-arrow { display: inline-flex; align-items: center; gap: 0.375rem; }
@media (max-width: 34rem) { .pg-nav .pg-arrow .pg-w { display: none; } }`;
  document.head.appendChild(css);

  // which table it is, the same across redraws: its place on the page (its columns can change with
  // a filter); one listing a different number of rows starts at page 1 anyway
  const keyOf = (t) => location.pathname + location.search + '|' + (t.dataset.paged || [...document.querySelectorAll(PAGED)].filter((x) => !x.matches(SKIP)).indexOf(t));
  // where the page numbers go: after the table, or after the box it sits alone in (a scroller, a card)
  const anchorOf = (t) => { let a = t; while (a.parentElement && a.parentElement.children.length === 1 && !a.parentElement.matches('body, main, td, section, article')) a = a.parentElement; return a; };

  // after a page change: scroll by however far the element moved, at once, so it's where it was
  const keepAt = (el, was) => { const d = el.getBoundingClientRect().top - was; if (Math.abs(d) > 0.5) scrollTo({ top: scrollY + d, behavior: 'instant' }); };
  let busy = false;
  const apply = (t) => {
    const body = t.tBodies[0]; if (!body) return;
    // the units: a row with the rows that follow it; those a page hides itself aren't counted
    const units = [];
    [...body.rows].forEach((r) => {
      if (r.matches(FOLLOW) && units.length) units[units.length - 1].push(r);
      else units.push([r]);
    });
    const shown = units.filter((u) => !u[0].hidden && !(u[0].style && u[0].style.display === 'none') && !u[0].querySelector('td[colspan].co-tbl-none, .tm-rev-none, .si-none') && !u[0].matches('.tm-rev-none, .si-none'));
    let nav = t.pgNav;
    if (shown.length <= PER) {
      units.flat().forEach((r) => r.classList.remove('pg-x'));
      if (nav) nav.hidden = true;
      if (pages.has(keyOf(t))) pages.set(keyOf(t), { page: 1, of: shown.length });
      return;
    }
    const key = keyOf(t), n = Math.ceil(shown.length / PER);
    // a search or a filter that changes what's listed starts again at page 1
    const was = pages.get(key), page = was && was.of === shown.length ? Math.min(n, Math.max(1, was.page)) : 1;
    pages.set(key, { page, of: shown.length });
    units.forEach((u) => u.forEach((r) => r.classList.remove('pg-x')));
    shown.forEach((u, i) => { if (i < (page - 1) * PER || i >= page * PER) u.forEach((r) => r.classList.add('pg-x')); });
    if (!nav || !nav.isConnected) {
      nav = document.createElement('nav'); nav.className = 'pg-nav'; nav.setAttribute('aria-label', 'Table pages');
      anchorOf(t).after(nav); t.pgNav = nav;
      nav.addEventListener('click', (e) => {
        const b = e.target.closest('[data-pg]'); if (!b || b.disabled) return;
        // the page numbers stay where they were on screen: no jump to the table's top, and a shorter
        // last page doesn't pull them out from under the pointer
        const was = nav.getBoundingClientRect().top;
        const k = keyOf(t); pages.set(k, Object.assign({}, pages.get(k), { page: +b.dataset.pg })); run(t);
        keepAt(nav, was);
        const again = nav.querySelector(`[data-pg="${b.dataset.pg}"]:not(.pg-arrow)`) || nav.querySelector('[aria-current]'); if (again) again.focus({ preventScroll: true });
      });
    }
    nav.hidden = false;
    const html = `<span class="pg-btns"><button type="button" class="pg-arrow" data-pg="${page - 1}"${page === 1 ? ' disabled' : ''} aria-label="Previous page"><span aria-hidden="true">&larr;</span><span class="pg-w"> Previous</span></button>`
      + Array.from({ length: n }, (_, k) => `<button type="button" data-pg="${k + 1}"${k + 1 === page ? ' aria-current="page"' : ''} aria-label="Page ${k + 1}">${k + 1}</button>`).join('')
      + `<button type="button" class="pg-arrow" data-pg="${page + 1}"${page === n ? ' disabled' : ''} aria-label="Next page"><span class="pg-w">Next </span><span aria-hidden="true">&rarr;</span></button></span>`;
    // a redraw that changes nothing leaves the buttons (and the focus on one) alone; one that does
    // puts the focus back on the same button
    if (nav.pgHtml === html) return;
    const had = nav.contains(document.activeElement) && document.activeElement.closest('[data-pg]');
    const sel = had && (had.classList.contains('pg-arrow') ? `.pg-arrow[aria-label="${had.getAttribute('aria-label')}"]` : `[data-pg="${had.dataset.pg}"]:not(.pg-arrow)`);
    nav.innerHTML = html; nav.pgHtml = html;
    if (sel) { let b = nav.querySelector(sel); if (!b || b.disabled) b = nav.querySelector('[aria-current]'); if (b) b.focus({ preventScroll: true }); }
  };
  const run = (only) => {
    busy = true;
    try { (only ? [only] : [...document.querySelectorAll(PAGED)].filter((t) => !t.matches(SKIP))).forEach(apply); } finally { mo.takeRecords(); busy = false; }
  };
  // a nav whose table went away (redrawn): it goes too
  const sweep = () => document.querySelectorAll('.pg-nav').forEach((n) => { if (![...document.querySelectorAll(PAGED)].some((t) => t.pgNav === n)) n.remove(); });
  let queued = false;
  const mo = new MutationObserver((list) => {
    if (busy || queued) return;
    if (list.every((m) => m.target.closest && m.target.closest('.pg-nav'))) return;
    queued = true;
    setTimeout(() => { queued = false; sweep(); run(); }, 0); // not a frame: a tab in the background has none
  });
  const start = () => { run(); mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'style'] }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.CMTablePager = { refresh: () => run(), keepAt };
})();
