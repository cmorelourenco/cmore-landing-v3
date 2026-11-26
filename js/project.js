/* One project (project.html?id=), opened from Projects. Two views, by whose project it is:
   - Yours (you run it): tabs for an overview, the suppliers by status (in order, expiring, missing
     information), every worker, machine and material on it with the
     supplier it comes with and whether its documents are in order, and the exports (coming soon).
     A project started here (new-project.html) has the suppliers you added, each notified, with
     nothing on it yet; the demo's own have a team made up from their ID (and Miguel's own crew and machines on
     the three sites they work on, with their real documents).
   - A client's (you supply them): only what they share with their suppliers (ID, name, client,
     region, who invited you), and your part of it: the suppliers you bring in (each notified), and
     the workers, machines and materials you put on it, each sharing only the documents you choose.
     Kept for the tab (js/projects.js: teamOf, saveTeam); seen by whoever invited you.
   Miguel's company only, as Projects is. */
(() => {
  const PJ = window.CMProjects, DM = window.DOC_MODEL, S = window.CM_SUPPLIERS;
  const head = document.getElementById('pjp-head'), body = document.getElementById('pjp-body');
  if (!head || !body || !PJ) return;
  if (document.documentElement.dataset.persona === 'beatriz') { location.replace('my-company.html?filled#products'); return; }
  // the hidden test users (Walmart, AJ Lee) have no projects
  if (['walmart', 'ajlee'].includes(document.documentElement.dataset.persona)) { location.replace('my-company.html?filled'); return; }

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const hash = (t) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return Math.abs(h); };
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const plain = (html) => { const d = document.createElement('div'); d.innerHTML = html; return d.textContent; }; // the model's names carry entities
  const pl = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;
  const nb = (t) => String(t).replace(/-/g, '‑'); // Mota‑Engil on one line
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (d) => `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  const addM = (d, m) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
  const today = () => fmt(new Date());
  const ME = 'CCER Construções';

  const id = new URLSearchParams(location.search).get('id');
  const p = PJ.all().find((x) => x.id === id);
  const sees = !p || !(window.CMAccess && window.CMAccess.sees) || window.CMAccess.sees('projects', p.id);

  // ---- styles: the tabs as the ecosystem's switch, the cards as on Projects, the tables as everywhere ----
  const css = document.createElement('style');
  css.textContent = `
.pjp-meta { display: flex; flex-wrap: wrap; gap: 0.5rem 1.25rem; font-size: 0.875rem; color: var(--color-ink-subtle); }
.pjp-meta b { font-weight: 600; color: var(--color-ink); }
.pjp-seg { display: inline-flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.25rem; margin: 0 0 1.5rem; background: var(--color-light-beige); border-radius: 9999px; }
.pjp-seg button { display: inline-flex; align-items: center; gap: 0.375rem; height: 2.25rem; padding: 0 1rem; border: 0; border-radius: 9999px; background: none;
  font: inherit; font-size: 0.875rem; font-weight: 500; color: var(--color-ink-subtle); cursor: pointer; transition: background-color .14s ease, color .14s ease; }
.pjp-seg button:hover { color: var(--color-ink); }
.pjp-seg button[aria-selected="true"], .pjp-seg button[aria-checked="true"] { background: var(--color-surface); color: var(--color-ink); box-shadow: 0 1px 3px rgba(52, 52, 52, .12); }
.pjp-seg button span { font-size: 0.75rem; color: var(--color-ink-subtle); font-variant-numeric: tabular-nums; }
.pjp-seg button:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 1px; }
.pjp-seg.is-sm { margin: 0; }
.pjp-seg.is-sm button { height: 2rem; padding: 0 0.75rem; font-size: 0.8125rem; }
.pjp-tools { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1rem; margin: 0 0 1rem; }
.pjp-tools-l { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.pjp-sel { height: 2.5rem; padding: 0 2.25rem 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; font: inherit; font-size: 0.875rem; color: var(--color-ink); appearance: none; -webkit-appearance: none; cursor: pointer;
  background: var(--color-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.75rem center / 0.875rem; }
.pjp-sel:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 1px; }
.pjp-grid { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); gap: 1rem; align-items: start; }
.pjp-col { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.pjp-card { padding: 1.25rem 1.5rem; border: 1px solid var(--color-line); border-radius: 1rem; background: var(--color-surface); }
.pjp-card > h3 { margin: 0 0 0.875rem; font-size: 1rem; font-weight: 600; }
.pjp-card > p { margin: 0 0 0.75rem; font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-muted); }
.pjp-card > p:last-child { margin-bottom: 0; }
.pjp-list { margin: 0; padding: 0; list-style: none; }
.pjp-list li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--color-mid-beige); }
.pjp-list li:first-child { padding-top: 0; } .pjp-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.pjp-list .n { display: block; font-size: 0.875rem; font-weight: 500; }
.pjp-list .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.pjp-list .r { display: flex; align-items: center; gap: 0.75rem; flex: none; }
.pjp-note { display: flex; gap: 0.75rem; align-items: flex-start; margin: 0 0 1rem; padding: 0.875rem 1.125rem; border-radius: 0.75rem; background: var(--color-light-beige); font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-muted); }
.pjp-note svg { flex: none; width: 1.25rem; height: 1.25rem; margin-top: 0.0625rem; color: var(--color-ink-subtle); }
.pjp-note b { color: var(--color-ink); font-weight: 600; }
.pjp-note.is-new { background: var(--color-informative-subtle); }
.pjp-note.is-new svg { color: var(--color-informative); }
.pjp-tbl { min-width: 46rem; table-layout: fixed; }
.pjp-tbl tbody tr { cursor: default; }
.pjp-tbl tbody tr:not(:has(.co-tbl-empty)):hover { background: transparent; }
.pjp-tbl tbody tr.is-link { cursor: pointer; }
.pjp-tbl tbody tr.is-link:hover, .pjp-tbl tbody tr.is-link:focus-visible { background: var(--color-light-beige); }
.pjp-tbl .w { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.pjp-tbl td .co-badge + .d { margin-top: 0.25rem; }
.pjp-tbl .pjp-x { text-align: right; white-space: nowrap; }
.pjp-in { width: 100%; height: 2.25rem; padding: 0 0.75rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface); font: inherit; font-size: 0.875rem; color: var(--color-ink); }
select.pjp-in { appearance: none; padding-right: 2rem; cursor: pointer;
  background: var(--color-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.625rem center / 0.875rem; }
.pjp-work .pjp-in + .pjp-in { margin-top: 0.375rem; }
.pjp-in:focus { outline: 2px solid var(--color-graphite); outline-offset: 0; border-color: transparent; }
.pjp-none { padding: 2.5rem 1.5rem !important; text-align: center; color: var(--color-ink-subtle); }
.pjp-none b { display: block; margin-bottom: 0.25rem; font-size: 0.9375rem; color: var(--color-ink); }
.pjp-exp { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.pjp-exp .pjp-card { display: flex; flex-direction: column; gap: 0.5rem; }
.pjp-exp h3 { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin: 0; font-size: 0.9375rem; font-weight: 600; }
.pjp-exp p { margin: 0; font-size: 0.8125rem; line-height: 1.5; color: var(--color-ink-subtle); }
.pjp-exp .btn { align-self: flex-start; margin-top: 0.5rem; }
.pjp-exp .btn:disabled { opacity: .5; cursor: not-allowed; }
/* the drawers: pick what to add, choose what to share */
.pjp-pick { display: flex; flex-direction: column; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.pjp-pick label { display: flex; align-items: center; gap: 0.875rem; padding: 0.75rem 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); cursor: pointer; transition: border-color .14s ease; }
.pjp-pick label:hover { border-color: var(--color-sand-400); }
.pjp-pick label.is-on { border-color: var(--color-ink-subtle); }
.pjp-pick label.is-dis { cursor: default; opacity: .6; }
.pjp-pick input { flex: none; width: 1.125rem; height: 1.125rem; accent-color: var(--color-graphite); }
.pjp-pick .t { flex: 1; min-width: 0; }
.pjp-pick .n { display: block; font-size: 0.875rem; font-weight: 500; }
.pjp-pick .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.pjp-q { width: 100%; height: 2.75rem; padding: 0 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; }
.pjp-all { display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.pjp-foot-r { display: flex; align-items: center; gap: 0.75rem; }
/* the head as a hero, as on My company: the project's name big, what it is under it, its facts in a row */
#pjp-head.pjh { max-width: none; gap: 0; }
.pjh-id { display: flex; flex-direction: column; gap: 0.625rem; margin-top: 1rem; }
.pjh-id .co-name { margin: 0; font-size: clamp(2.25rem, 3.4vw, 3.25rem); }
.pjh-id .co-subtle { font-size: 0.9375rem; }
.pjh-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: 1.25rem 2rem; margin: 1.75rem 0 0; padding: 1.25rem 0 0; border-top: 1px solid var(--color-line); }
.pjh-facts > div { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
.pjh-facts dt { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-subtle); }
.pjh-facts dd { margin: 0; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.pjh-facts dd small { display: block; margin-top: 0.125rem; font-size: 0.8125rem; font-weight: 400; color: var(--color-ink-subtle); }
/* the overview: what needs you, as My company's cards, then the list of it */
.pjo-band { display: flex; flex-direction: column; gap: 1.25rem; margin: 0.5rem 0 2rem; }
.pjo-band .co-h-xl { margin: 0; }
.pjo-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin-bottom: 3.5rem; }
.co-k { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.25rem 1.25rem 1.125rem; border: 1px solid var(--color-line); border-radius: 1rem; background: var(--color-surface);
  font: inherit; text-align: left; color: inherit; cursor: pointer; transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease; }
.co-k:hover { border-color: var(--color-sand-400); box-shadow: 0 8px 24px -14px rgba(52, 52, 52, .22); transform: translateY(-1px); }
.co-k:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.co-k-h { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9375rem; font-weight: 600; }
.co-k-h svg { width: 1.125rem; height: 1.125rem; color: var(--color-ink-subtle); }
.co-k-big { display: flex; align-items: baseline; gap: 0.625rem; margin-top: 0.5rem; }
.co-k-n { font-size: 3.25rem; font-weight: 500; letter-spacing: -0.03em; line-height: 1; color: var(--color-coral); }
.co-k-nl { font-size: 0.9375rem; font-weight: 500; }
.co-k-d { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.co-k-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: auto; padding-top: 0.75rem; border-top: 1px solid var(--color-mid-beige); }
.co-k-chip { display: inline-flex; align-items: center; gap: 0.3125rem; height: 1.625rem; padding: 0 0.625rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
.co-k-chip b { font-weight: 700; }
.co-k.is-zero .co-k-n { color: var(--color-sand-400); }
.pjo-sec .co-sub-head-top { margin-bottom: 1.25rem; }
.pjo-sec + .pjo-sec { margin-top: 3.5rem; }
@media (max-width: 72rem) { .pjo-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 40rem) { .pjh-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.25rem; } .pjo-kpis { grid-template-columns: minmax(0, 1fr); } .co-k-n { font-size: 2.5rem; } }
@media (max-width: 60rem) { .pjp-grid { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 40rem) { .pjp-exp { grid-template-columns: minmax(0, 1fr); } .pjp-seg { border-radius: 1rem; } }`;
  document.head.appendChild(css);

  const SVG = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const EYE = SVG('<path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>');
  const BELL = SVG('<path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>');
  const PLUS = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>';
  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const ICO = {
    sup: '<path d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>',
    wk: '<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>',
    eq: '<path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085"/>',
    mat: '<path d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>',
  };

  // ---- where something stands ------------------------------------------------------------------
  const ST = { ok: ['In order', 'b-ok'], soon: ['Expiring soon', 'b-pend'], miss: ['Needs attention', 'b-over'] };
  const ORDER = ['miss', 'soon', 'ok'];
  // a search for one table (co-search, as in Documents): kept by name across redraws; the rows that
  // don't match are hidden (the pager leaves them out), and a line says when nothing does
  const TQ = {};
  const QI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const qBox = (id, ph) => `<label class="co-search pjs-q">${QI}<input type="search" data-tq="${id}" placeholder="${ph}" aria-label="${ph}" value="${esc(TQ[id] || '')}" autocomplete="off"></label>`;
  const qTools = (id, ph) => `<div class="pjs-tools">${qBox(id, ph)}</div>`;
  const applyTQ = (root = document) => root.querySelectorAll('table[data-tq-for]').forEach((t) => {
    const q = fold((TQ[t.dataset.tqFor] || '').trim()), b = t.tBodies[0]; if (!b) return;
    b.querySelectorAll('tr.pjs-nomatch').forEach((r) => r.remove());
    const rows = [...b.rows].filter((r) => !r.querySelector('.co-tbl-empty'));
    rows.forEach((r) => { r.hidden = !!q && !fold(r.textContent).includes(q); });
    if (q && rows.length && rows.every((r) => r.hidden)) b.insertAdjacentHTML('beforeend', `<tr class="pjs-nomatch"><td colspan="${t.tHead ? t.tHead.rows[0].cells.length : 1}" class="pjp-none co-tbl-empty">Nothing matches &ldquo;${esc(TQ[t.dataset.tqFor].trim())}&rdquo;.</td></tr>`);
  });
  document.addEventListener('input', (e) => { const i = e.target.closest('[data-tq]'); if (!i) return; TQ[i.dataset.tq] = i.value; applyTQ(); });
  // sorting, on the same tables: each column's head a button (css/esg.css .cd-sort, as Documents'
  // matrix), a click for one way and another for the other; kept by table across redraws. A cell sorts
  // by what it shows: a status the worst first, a dot by its state, a date, "n of m", a number, or its name
  const SORT = {};
  const RANKS = { 'needs attention': 0, missing: 0, expired: 0, 'expiring soon': 1, expiring: 1, 'in order': 2, valid: 2, 'nothing shared': 3 };
  const DOTS = ['is-on', 'is-ok', 'is-notyet', 'is-pend', 'is-offsite', 'is-bad'];
  const MONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const keyOfCell = (td) => {
    if (!td) return null;
    const b = td.querySelector('.co-badge'); if (b && fold(b.textContent.trim()) in RANKS) return RANKS[fold(b.textContent.trim())];
    const d = td.querySelector('.cd-dot'); if (d) { const k = DOTS.findIndex((c) => d.classList.contains(c)); return k < 0 ? 9 : k; }
    const n = td.querySelector('.n'), t = (n ? n.textContent : td.textContent).replace(/\s+/g, ' ').trim();
    if (!t || t === '—' || t === '\u2014') return null;
    const dm = /(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})/.exec(t); if (dm && MONS.includes(dm[2])) return new Date(+dm[3], MONS.indexOf(dm[2]), +dm[1]).getTime();
    const of = /^(\d+) of (\d+)$/.exec(t); if (of) return +of[2] ? +of[1] / +of[2] : 0;
    if (/^\d+(\.\d+)?$/.test(t)) return +t;
    return fold(t);
  };
  const applySort = (root = document) => root.querySelectorAll('table[data-tq-for]').forEach((t) => {
    const id = t.dataset.tqFor, st = SORT[id], b = t.tBodies[0], hr = t.tHead && t.tHead.rows[0]; if (!b || !hr) return;
    [...hr.cells].forEach((th, c) => {
      if (!th.querySelector('[data-sort-col]')) th.innerHTML = `<button type="button" class="cd-sort" data-sort-col="${c}"><span class="l">${th.innerHTML}</span><span class="a" aria-hidden="true"></span></button>`;
      const on = st && st.c === c, btn = th.querySelector('[data-sort-col]');
      if (on) th.setAttribute('aria-sort', st.dir > 0 ? 'ascending' : 'descending'); else th.removeAttribute('aria-sort');
      btn.querySelector('.a').innerHTML = on ? (st.dir > 0 ? '&uarr;' : '&darr;') : '&varr;';
      btn.title = `Sort by ${btn.querySelector('.l').textContent.trim().toLowerCase()}`;
    });
    const rows = [...b.rows].filter((r) => !r.querySelector('.co-tbl-empty'));
    rows.forEach((r, i) => { if (r.dataset.ord == null) r.dataset.ord = i; });
    const keyed = rows.map((r) => ({ r, k: st ? keyOfCell(r.cells[st.c]) : null, o: +r.dataset.ord }));
    keyed.sort((x, y) => {
      if (!st) return x.o - y.o;
      if (x.k == null || y.k == null) return x.k == null && y.k == null ? x.o - y.o : x.k == null ? 1 : -1; // nothing to sort by: last
      const c = typeof x.k === 'number' && typeof y.k === 'number' ? x.k - y.k : String(x.k).localeCompare(String(y.k));
      return c * st.dir || x.o - y.o;
    });
    const tail = [...b.rows].filter((r) => r.querySelector('.co-tbl-empty'));
    keyed.concat(tail.map((r) => ({ r }))).forEach(({ r }) => b.appendChild(r));
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-sort-col]'); if (!btn) return;
    const t = btn.closest('table'), id = t && t.dataset.tqFor; if (!id) return;
    const c = +btn.dataset.sortCol, st = SORT[id];
    SORT[id] = { c, dir: st && st.c === c ? -st.dir : 1 };
    applySort(t.parentElement); btn.focus({ preventScroll: true });
  });
  const badge = (st, why) => `<span class="co-badge ${ST[st][1]}"${why ? ` title="${esc(why)}"` : ''}>${ST[st][0]}</span>`;
  const byWorst = (a, b) => ORDER.indexOf(a.st) - ORDER.indexOf(b.st);
  const tally = (l) => ORDER.reduce((o, k) => (o[k] = l.filter((x) => x.st === k).length, o), {});

  // ---- not here --------------------------------------------------------------------------------
  if (!p || !sees) {
    head.innerHTML = `<span class="eyebrow">Projects</span><h1 class="co-h-xl" style="font-weight:300">This project isn&rsquo;t here.</h1>
      <p class="co-muted eco-lead">It may belong to another company, or your access doesn&rsquo;t include it. <a class="co-link" href="projects.html">Back to Projects</a></p>`;
    return;
  }
  document.getElementById('pjp-crumb').textContent = p.name;
  document.title = `${p.name} · C-MORE`;
  // arrived from the bell, or opened it: its notification is read
  if (window.CMProjectNotes) window.CMProjectNotes.markRead(p.id);

  // the documents a worker, machine or material of yours has on file (js/doc-model.js), each with its status
  const docsOf = (kind, i) => (DM ? DM.DOCS.filter((d) => d.kind === kind && d.roster).flatMap((d) => d.roster.filter((r) => r.i === i && r.status !== 'notuploaded').map((r) => ({ code: d.code, name: d.name, status: r.status, exp: r.exp }))) : []);
  const stOf = (docs) => { const w = DM ? DM.worstOf(docs.map((d) => d.status)) : 'valid'; const r = DM ? DM.RANK[w] : 0; return r >= 2 ? 'miss' : r === 1 ? 'soon' : 'ok'; };
  const whyOf = (docs) => { const st = stOf(docs); if (st === 'ok') return docs.length ? `${pl(docs.length, 'document')}, all valid` : 'Nothing asked for yet'; const d = docs.find((x) => stOf([x]) === st); return d ? `${plain(d.name)}: ${DM.STATUS[d.status][0].toLowerCase()}` : ''; };
  const nameOf = (kind, i) => (DM ? (kind === 'workers' ? DM.WORKERS[i] : kind === 'equipment' ? DM.EQUIPMENT[i] : DM.PRODUCTS[i]) || ['', ''] : ['', '']);

  // ==== your project: its team, by status =========================================================
  const FIRST = ['João', 'Pedro', 'Ricardo', 'André', 'Tiago', 'Nuno', 'Rui', 'Paulo', 'Bruno', 'Hugo', 'Sérgio', 'Luís', 'Filipe', 'Marco', 'Fábio', 'Daniel', 'Vasco', 'Jorge', 'Manuel', 'António', 'Ana', 'Sofia', 'Marta', 'Inês'];
  const LAST = ['Silva', 'Santos', 'Ferreira', 'Pereira', 'Oliveira', 'Costa', 'Rodrigues', 'Martins', 'Sousa', 'Fernandes', 'Gonçalves', 'Gomes', 'Lopes', 'Marques', 'Alves', 'Almeida', 'Ribeiro', 'Pinto', 'Carvalho', 'Teixeira', 'Moreira', 'Correia', 'Mendes', 'Nunes'];
  const ROLES = ['Electrician', 'Plumber', 'Laborer', 'Carpenter', 'Mason', 'Scaffolder', 'Welder', 'Painter', 'HVAC technician', 'Steel fixer', 'Machine operator', 'Foreman'];
  const WORK = ['Electrical installations', 'Plumbing and drainage', 'HVAC', 'Scaffolding', 'Structural steel', 'Waterproofing', 'Painting and finishes', 'Earthworks', 'Concrete and formwork', 'Fire protection'];
  const MACH = ['Telehandler · Manitou MT 1840', 'Mobile elevating work platform · JLG 450AJ', 'Concrete pump · Putzmeister M38', 'Mini excavator · Kubota KX057', 'Scaffolding system · Layher Allround',
    'Generator · Atlas Copco QAS 45', 'Roller compactor · Bomag BW 120', 'Construction hoist · Alimak Scando 650', 'Core drill · Hilti DD 250', 'Forklift · Toyota 8FD25'];
  const MATS = ['Ready-mix concrete C30/37', 'Reinforcing steel A500 NR SD', 'Plasterboard 12.5 mm', 'Mineral wool insulation 50 mm', 'Waterproofing membrane SBS 4 kg', 'Ceramic floor tiles 60×60',
    'Interior emulsion paint', 'PVC drainage pipe Ø110', 'Power cable XV 3G2.5', 'Structural steel HEB 200', 'Fire-rated sealant', 'Aluminium window frames'];
  const WHY = {
    wk: { miss: ['Medical fitness certificate missing', 'Work accident insurance expired', 'Safety training certificate missing', 'Social Security registration missing'], soon: ['Medical fitness expires', 'Safety training expires'] },
    eq: { miss: ['Periodic inspection report missing', 'EU declaration of conformity missing', 'Insurance expired'], soon: ['Next inspection due', 'Insurance expires'] },
    mat: { miss: ['Declaration of performance missing', 'Safety data sheet missing', 'Technical sheet missing'], soon: ['CE certificate expires'] },
    sup: { miss: ['Work accident insurance expired', 'Tax clearance certificate missing', 'Social Security clearance expired', 'Civil liability insurance missing'], soon: ['Civil liability insurance expires', 'Tax clearance expires'] },
  };
  // Miguel's own crew and machines on the three sites they work on (js/doc-model.js SITES)
  const SITE = { 'FC-2026-031': 0, 'FC-2026-018': 1, 'FC-2025-047': 2 };

  const ownerModel = () => {
    const R = (k) => hash(`${p.id}:${k}`);
    const soonDay = (k) => fmt(new Date(Date.now() + (5 + (R(k) % 25)) * 864e5));
    const why = (area, st, k) => (st === 'miss' ? WHY[area].miss[R(k) % WHY[area].miss.length] : st === 'soon' ? `${WHY[area].soon[R(k) % WHY[area].soon.length]} ${soonDay(k)}` : '');
    // a project started here: the suppliers you added, each notified, no documents from them yet
    if (p.isNew) {
      const sups = (p.sups || []).map((x) => ({ id: x.id, name: x.name, work: PJ.workText(x) || '—', entry: x.entry, exit: x.exit, by: null, st: 'miss', why: 'No documents on it yet', fresh: true }));
      return { sups, workers: [], equipment: [], materials: [] };
    }
    const end = Date.parse(p.deadline), start = Number.isNaN(end) ? addM(new Date(), -7) : addM(new Date(end), -14);
    const pool = S ? S.list().filter((s) => s.status !== 'invited') : [];
    const n = Math.min(p.suppliers, pool.length), t2 = Math.floor(n / 3), t1 = n - t2;
    const chosen = Array.from({ length: n }, (_, k) => pool[(p.h + k * 5) % pool.length]).filter((s, k, a) => a.indexOf(s) === k);
    const sups = chosen.map((s, k) => {
      const e = addM(start, R(`e${k}`) % 5), x = Number.isNaN(end) ? addM(e, 6 + (R(`x${k}`) % 8)) : new Date(Math.min(end, addM(e, 4 + (R(`x${k}`) % 9))));
      return { id: s.id, name: s.name, work: (s.services && s.services[0]) || WORK[R(`w${k}`) % WORK.length], entry: fmt(e), exit: fmt(x), by: k < t1 ? null : chosen[(k - t1) % Math.max(1, t1)].name, st: 'ok', why: 'Everything asked for is valid' };
    });
    // as many with documents missing or expired as the project has alerts, then the ones expiring
    const order = sups.map((s, k) => k).sort((a, b) => R(`o${a}`) - R(`o${b}`));
    order.slice(0, p.docs.miss).forEach((k) => { sups[k].st = 'miss'; sups[k].why = why('sup', 'miss', `s${k}`); });
    order.slice(p.docs.miss, p.docs.miss + p.docs.look).forEach((k) => { sups[k].st = 'soon'; sups[k].why = why('sup', 'soon', `s${k}`); });
    const active = sups;

    // workers: your own on this site, with their real documents, then the suppliers'
    const site = SITE[p.id];
    const own = site != null && DM ? DM.PERSON.map((x, i) => ({ x, i })).filter(({ x }) => !x.left && x.sites.includes(site)).slice(0, p.workers) : [];
    const workers = own.map(({ x, i }) => { const d = docsOf('workers', i); return { name: plain(x.name), role: plain(x.role), sup: `${ME} (you)`, st: stOf(d), why: whyOf(d), own: true, i }; });
    const firstOf = {};
    for (let k = 0; workers.length < p.workers && active.length; k++) {
      const s = active[k % active.length], first = !firstOf[s.name]; firstOf[s.name] = true;
      const st = first && (s.st === 'miss' || s.st === 'soon') ? s.st : 'ok';
      workers.push({ name: `${FIRST[R(`f${k}`) % FIRST.length]} ${LAST[R(`l${k}`) % LAST.length]}`, role: ROLES[R(`r${k}`) % ROLES.length], sup: s.name, st, why: st === 'ok' ? 'Every document valid' : why('wk', st, `w${k}`) });
    }
    // machines: yours on this site, then theirs
    const ownEq = site != null && DM ? DM.MACHINE.map((m, i) => ({ m, i })).filter(({ m }) => !m.left && (m.sites || []).includes(site)) : [];
    const equipment = ownEq.map(({ i }) => { const d = docsOf('equipment', i); return { name: plain(DM.EQUIPMENT[i][0]), ref: plain(DM.EQUIPMENT[i][1]), sup: `${ME} (you)`, st: stOf(d), why: whyOf(d), own: true, i }; });
    const nEq = Math.max(equipment.length + 2, Math.round(p.workers / 5));
    for (let k = 0; equipment.length < nEq && active.length; k++) {
      const s = active[(k * 2 + 1) % active.length], st = k === 0 && s.st === 'miss' ? 'miss' : k === 1 && s.st === 'soon' ? 'soon' : 'ok';
      equipment.push({ name: MACH[R(`m${k}`) % MACH.length], ref: `Serial ${String(100000 + (R(`n${k}`) % 899999))}`, sup: s.name, st, why: st === 'ok' ? 'Every document valid' : why('eq', st, `q${k}`) });
    }
    // materials: what the suppliers bring
    const materials = [];
    for (let k = 0; k < 4 + (p.h % 6) && active.length; k++) {
      const s = active[(k * 3) % active.length], st = k === 2 && active.some((a) => a.st === 'miss') ? 'miss' : 'ok';
      materials.push({ name: MATS[(p.h + k * 5) % MATS.length], ref: `Batch ${String(R(`b${k}`) % 90000 + 10000)}`, sup: st === 'miss' ? active.find((a) => a.st === 'miss').name : s.name, st, why: st === 'ok' ? 'Declaration of performance and data sheets on file' : why('mat', st, `t${k}`) });
    }
    return { sups, workers, equipment, materials };
  };

  // ==== the page ==================================================================================
  const own = p.own === 'owner';
  const tabFromHash = () => (location.hash || '').slice(1);
  let tab = '', M = null;
  const f = { st: 'all', sup: '' };

  const paintHead = () => {
    const fact = (t, v, sm) => `<div><dt>${t}</dt><dd>${v}${sm ? `<small>${sm}</small>` : ''}</dd></div>`;
    head.classList.add('pjh');
    if (own) {
      const people = p.isNew ? PJ.peopleOf(p) : [];
      head.innerHTML = `<span class="eyebrow">Your project</span>
        <div class="pjh-id"><h1 class="co-name">${esc(p.name)}</h1></div>
        <dl class="pjh-facts">
          ${fact('Project ID', esc(p.id))}
          ${fact('Client', esc(nb(p.client)), esc(p.sector || ''))}
          ${fact('Region', esc(p.region), esc(p.isNew ? p.address : p.city))}
          ${p.isNew ? fact('Dates', esc(p.start), `to ${esc(p.deadline)}`) : fact('Deadline', p.ongoing ? 'Ongoing' : esc(p.deadline))}
          ${fact('Owner', ME, p.isNew ? `Started by ${esc(p.owner || 'you')}${p.on ? ` on ${esc(p.on)}` : ''}` : 'You run the site')}
          ${people.length ? fact('People', pl(people.length, 'person', 'people'), people.map((y) => `${esc(y.name)}, ${esc(y.role.toLowerCase())}${y.invited ? ' (invited)' : ''}`).join('<br>')) : ''}
        </dl>`;
    } else {
      head.innerHTML = `<span class="eyebrow">You supply ${esc(nb(p.client))}</span>
        <div class="pjh-id"><h1 class="co-name">${esc(p.name)}</h1></div>
        <dl class="pjh-facts">
          ${fact('Project ID', esc(p.id))}
          ${fact('Client', esc(nb(p.forClient)))}
          ${fact('Region', esc(p.region))}
          ${fact('Invited by', esc(nb(p.client)), 'Your client on it')}
        </dl>`;
    }
  };

  // ---- the tabs ----
  const TABS = () => own
    ? [['overview', 'Overview'], ['suppliers', 'Suppliers', M.sups.length], ['workers', 'Workers', M.workers.length], ['equipment', 'Equipment', M.equipment.length], ['materials', 'Materials', M.materials.length], ['required', 'Documents required', REQ.length], ['exports', 'Exports']]
    : [['about', 'About'], ['suppliers', 'Your suppliers', team.subs.length], ['workers', 'Workers', team.workers.length], ['equipment', 'Equipment', team.equipment.length], ['materials', 'Materials', team.products.length]];
  const segOf = () => `<div class="pjp-seg" role="tablist" aria-label="${own ? 'Project' : 'Your part of the project'}">${TABS().map(([k, l, n]) => `<button type="button" role="tab" id="pjp-t-${k}" aria-controls="pjp-panel" aria-selected="${k === tab}" tabindex="${k === tab ? 0 : -1}" data-tab="${k}">${l}${n != null ? ` <span>${n}</span>` : ''}</button>`).join('')}</div>`;

  // a status filter over a list, with each status's count (only the ones there are)
  const filterOf = (l, label) => {
    const t = tally(l), opts = [['all', 'All', l.length]].concat(ORDER.filter((k) => t[k]).map((k) => [k, ST[k][0], t[k]]));
    return `<div class="pjp-seg is-sm" role="radiogroup" aria-label="${label}">${opts.map(([k, lb, n]) => `<button type="button" role="radio" aria-checked="${f.st === k}" data-st="${k}">${lb} <span>${n}</span></button>`).join('')}</div>`;
  };
  const supSelect = (l) => {
    const names = [...new Set(l.map((x) => x.sup))].sort((a, b) => (a.includes('(you)') ? -1 : b.includes('(you)') ? 1 : a.localeCompare(b)));
    return `<select class="pjp-sel" data-sup aria-label="Supplier"><option value="">Every supplier</option>${names.map((n) => `<option value="${esc(n)}"${f.sup === n ? ' selected' : ''}>${esc(nb(n))}</option>`).join('')}</select>`;
  };
  const keep = (x) => (f.st === 'all' || x.st === f.st) && (!f.sup || x.sup === f.sup);

  // ---- your project's panels ----
  const OWNER = {
    overview: () => {
      // a card for each part of the project: how many need you, and how the rest stand
      const KIND = { suppliers: ['Suppliers', ICO.sup, 'supplier', 'Supplier'], workers: ['Workers', ICO.wk, 'worker', 'Worker'], equipment: ['Equipment', ICO.eq, 'machine', 'Machine'], materials: ['Materials', ICO.mat, 'material', 'Material'] };
      const parts = [['suppliers', M.sups], ['workers', M.workers], ['equipment', M.equipment], ['materials', M.materials]];
      const card = ([k, l]) => {
        const [label, ico, one] = KIND[k], t = tally(l), n = t.miss + t.soon;
        const chip = (cls, m, w) => (m ? `<span class="co-k-chip ${cls}"><b>${m}</b> ${w}</span>` : '');
        const chips = chip('co-k-exp', t.miss, 'need attention') + chip('co-k-miss', t.soon, 'expiring soon') + chip('co-k-ok', t.ok, 'in order');
        const d = !l.length ? (k === 'suppliers' ? 'None on it yet.' : 'Your suppliers add them.') : `${pl(l.length, one)} on the project.`;
        return `<button type="button" class="co-k${n ? '' : ' is-zero'}" data-tab="${k}" role="listitem"><span class="co-k-h">${SVG(ico)}<span>${label}</span></span>
          <span class="co-k-big"><span class="co-k-n">${n}</span><span class="co-k-nl">${n === 1 ? 'needs' : 'need'} your attention</span></span>
          <span class="co-k-d">${d}</span>${chips ? `<span class="co-k-chips">${chips}</span>` : ''}</button>`;
      };
      const issues = parts.flatMap(([k, l]) => l.filter((x) => x.st !== 'ok').map((x) => Object.assign({ k }, x))).sort(byWorst);
      const need = issues.length;
      const sub = (i) => (i.k === 'suppliers' ? i.work : i.k === 'workers' ? i.role : i.ref);
      const its = PJ.itemsOf(p), x = p.docs;
      const stat = (cls, n, label) => `<div class="pjd-stat${cls}"><b>${n}</b><span>${label}</span></div>`;
      return `<div class="pjo-band"><span class="eyebrow">On this project</span>
          <h2 class="co-h-xl" style="font-weight:300">${need ? `${pl(need, 'thing')}<br><span style="font-weight:600">${need === 1 ? 'needs' : 'need'} your attention.</span>` : `Nothing<br><span style="font-weight:600">needs your attention.</span>`}</h2></div>
        <div class="pjo-kpis" role="list">${parts.map(card).join('')}</div>
        <section class="pjo-sec"><div class="co-sub-head co-sub-head-top"><h3 class="eyebrow">Needs attention</h3></div>
          <div class="co-sec-head co-sec-head-stack"><h2 class="co-h-l">What&rsquo;s holding the project up</h2><p class="co-muted">${issues.length ? `${pl(issues.length, 'supplier, worker, machine or material', 'suppliers, workers, machines and materials')} not in order yet, the most urgent first.` : 'Every supplier, worker, machine and material on this project is in order.'}</p></div>
          ${issues.length ? `${qTools('ov-issues', 'Search by name or supplier')}<div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl" data-paged="pjo-attention" data-tq-for="ov-issues"><thead><tr><th style="width:30%">Name</th><th style="width:14%">Type</th><th style="width:22%">Supplier</th><th style="width:34%">Status</th></tr></thead><tbody>
            ${issues.map((i) => `<tr class="is-link" tabindex="0" role="link" ${i.k === 'suppliers' ? `data-sup-id="${esc(i.id)}" aria-label="Open ${esc(i.name)}"` : i.k === 'workers' ? `data-wk-id="${M.workers.findIndex((w) => w.name === i.name && w.sup === i.sup)}" aria-label="Open ${esc(i.name)}"` : `data-open-tab="${i.k}" data-open-sup="${esc(i.sup)}" aria-label="${esc(i.name)}: see it in ${KIND[i.k][0]}"`}><td><span class="n">${esc(nb(i.name))}</span><span class="d">${esc(sub(i) || '')}</span></td><td>${KIND[i.k][3]}</td><td><span class="n">${esc(nb(i.k === 'suppliers' ? (i.by || 'You') : i.sup))}</span>${i.k === 'suppliers' ? `<span class="d">${i.by ? 'Brought them in' : 'Your supplier'}</span>` : ''}</td><td>${badge(i.st, i.why)}</td></tr>`).join('')}
          </tbody></table></div>` : ''}</section>
        ${projMatrix(M.sups.slice().sort(byWorst))}
        <section class="pjo-sec"><div class="co-sub-head co-sub-head-top"><h3 class="eyebrow">Your company</h3></div>
          <div class="co-sec-head co-sec-head-stack"><h2 class="co-h-l">Your documents for this project</h2><p class="co-muted">What the project asks of ${ME} itself.</p></div>
          <div class="pjp-card"><div class="pjd-stats">${stat('', x.asked, 'Asked for')}${stat(' is-ok', x.ok, 'Valid')}${stat(' is-pend', x.look, 'Needs a look')}${stat(' is-bad', x.miss, 'Not compliant')}</div>
            ${its.length ? `<ul class="pjd-list">${its.map((it) => `<li><span><span class="n">${esc(it.name)}</span><span class="d">${esc(it.sub)}</span></span><span class="co-badge ${it.cls}">${it.b}</span></li>`).join('')}</ul><p class="pjd-ok"><a class="co-link" href="company-details.html">Sort them out in Documents</a>, or drop the files on ALMA.</p>` : x.asked ? '<p class="pjd-ok">Every document asked for here is valid.</p>' : '<p class="pjd-ok">Nothing asked for on this project yet.</p>'}</div></section>`;
    },
    suppliers: () => {
      const l = M.sups.filter(keep).sort(byWorst);
      return `<div class="pjp-tools"><div class="pjp-tools-l">${qBox('tab-sups', 'Search by name or work')}${filterOf(M.sups, 'Suppliers by status')}</div></div>
        <div class="co-card co-tbl-card pjs-mx-wrap"><table class="co-tbl pjp-tbl pjs-sups" data-tq-for="tab-sups"><thead><tr><th style="width:30%">Supplier</th><th style="width:22%">Brought in by</th><th class="c" style="width:12%">Workers</th><th class="c" style="width:14%">On site</th><th class="c" style="width:22%">Status</th></tr></thead><tbody>
        ${l.length ? l.map((s) => `<tr class="is-link" tabindex="0" role="link" data-sup-id="${esc(s.id)}" aria-label="Open ${esc(s.name)}"><td><span class="n">${esc(nb(s.name))}</span><span class="d">${esc(s.work)}</span></td><td>${s.by ? `<span class="n">${byLink(s.by)}</span><span class="d">Their supplier</span>` : '<span class="n">You</span><span class="d">Your supplier</span>'}</td><td class="c">${M.workers.filter((w) => w.sup === s.name).length}</td><td class="c">${siteDotOf(s)}</td><td class="c">${badge(s.st, s.why)}</td></tr>`).join('')
          : `<tr><td colspan="5" class="pjp-none co-tbl-empty">${M.sups.length ? 'No supplier with that status.' : '<b>No suppliers on this project yet.</b>'}</td></tr>`}</tbody></table></div>
        ${SITE_LEGEND}`;
    },
    workers: () => listPanel(M.workers, 'Workers', 'Worker', (w) => `<span class="n">${esc(w.name)}</span><span class="d">${esc(w.role)}</span>`, 'workers'),
    equipment: () => listPanel(M.equipment, 'Equipment', 'Machine', (m) => `<span class="n">${esc(m.name)}</span><span class="d">${esc(m.ref)}</span>`, 'machines'),
    materials: () => listPanel(M.materials, 'Materials', 'Material', (m) => `<span class="n">${esc(m.name)}</span><span class="d">${esc(m.ref)}</span>`, 'materials'),
    // what every supplier on it must have: changed here, every status on the project follows
    required: () => `<p class="pjp-note">${EYE}<span>What every supplier on this project must have, for the company, for the workers, equipment, products and materials they bring, and for this project itself. Change it and the matrices and every status on the project follow.</span></p>
      <div id="pjp-req"></div>
      <div class="pjp-req-foot"><span class="co-muted" data-req-said>No changes yet.</span><button type="button" class="btn btn-primary btn-sm" data-req-save disabled>Save changes</button></div>`,
    exports: () => {
      const EXP = [['Suppliers on this project', 'Every supplier, who brought them in, their work, entry and exit dates, and where their documents stand. Excel.'],
        ['Workers and their documents', 'Every worker on site, the supplier they come with, and each document’s status and expiry. Excel.'],
        ['Equipment and its certificates', 'Every machine, whose it is, its inspections, conformity and insurance. Excel.'],
        ['Materials and their declarations', 'Every material, who supplies it, its declaration of performance and safety data sheet. Excel.']];
      return `<p class="pjp-note">${SVG('<path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"/>')}<span>The project&rsquo;s spreadsheets, ready for the client or an audit. They&rsquo;re on their way.</span></p>
        <div class="pjp-exp">${EXP.map(([t, d]) => `<section class="pjp-card"><h3>${t}<span class="co-badge b-neu">Coming soon</span></h3><p>${d}</p><button type="button" class="btn btn-quiet btn-sm" disabled>Export</button></section>`).join('')}</div>`;
    },
  };
  const listPanel = (all, label, col, cell, noun) => {
    const l = all.filter(keep).sort(byWorst), kind = noun === 'workers' ? null : noun === 'machines' ? 'equipment' : 'materials';
    return `<div class="pjp-tools"><div class="pjp-tools-l">${all.length ? qBox(`tab-${noun}`, `Search by name or ${noun === 'workers' ? 'role' : noun === 'machines' ? 'serial number' : 'batch'}`) : ''}${filterOf(all, `${label} by status`)}${all.length ? supSelect(all) : ''}</div></div>
      <div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl" data-tq-for="tab-${noun}"><thead><tr><th style="width:30%">${col}</th><th style="width:26%">Supplier</th><th class="c" style="width:12%">On site</th><th style="width:32%">Status</th></tr></thead><tbody>
      ${l.length ? l.map((x) => `<tr${noun === 'workers' ? ` class="is-link" tabindex="0" role="link" data-wk-id="${all.indexOf(x)}" aria-label="Open ${esc(x.name)}"` : ''}><td>${cell(x)}</td><td><span class="n">${esc(nb(x.sup))}</span></td><td class="c">${siteDotOf(wkSite(x, kind), kind === 'materials')}</td><td>${badge(x.st, x.why)}</td></tr>`).join('')
        : `<tr><td colspan="4" class="pjp-none co-tbl-empty">${all.length ? `No ${noun} match that.` : `<b>No ${noun} on this project yet.</b>Your suppliers add theirs and choose which of their documents you see.`}</td></tr>`}</tbody></table></div>${all.length ? legendOf(kind === 'materials') : ''}`;
  };

  // ==== a client's project: your part of it ======================================================
  let team = own ? null : PJ.teamOf(p);
  const save = () => PJ.saveTeam(p.id, team);
  const seenBy = `<b>${esc(nb(p.client))}</b>, who invited you`;
  const TEAM = {
    workers: { key: 'workers', kind: 'workers', one: 'worker', many: 'workers', title: 'Workers', list: () => (DM ? DM.WORKERS.map((w, i) => ({ i, name: plain(w[0]), sub: plain(w[1]) })).filter(({ i }) => !DM.PERSON[i].left) : []) },
    equipment: { key: 'equipment', kind: 'equipment', one: 'machine', many: 'machines', title: 'Equipment', list: () => (DM ? DM.EQUIPMENT.map((m, i) => ({ i, name: plain(m[0]), sub: plain(m[1]) })).filter(({ i }) => !(DM.MACHINE[i] || {}).left) : []) },
    materials: { key: 'products', kind: 'products', one: 'material', many: 'materials', title: 'Materials', list: () => (DM ? DM.PRODUCTS.map((m, i) => ({ i, name: plain(m[0]), sub: plain(m[1]) })) : []) },
  };
  const sharedOf = (kind, x) => { const all = docsOf(kind, x.i); const on = x.share ? all.filter((d) => x.share.includes(d.code)) : all; return { all, on }; };
  const SUPPLIER = {
    about: () => {
      const c = (k, ico, label, n, d) => `<button type="button" class="pj-card${n ? ' is-ok' : ''}" data-tab="${k}" role="listitem"><span class="pj-card-h">${SVG(ico)}<span>${label}</span></span><span class="pj-card-n">${n}</span><span class="pj-card-d">${d}</span></button>`;
      const empty = !team.subs.length && !team.workers.length && !team.equipment.length && !team.products.length;
      return `${p.isNotified && empty ? `<p class="pjp-note is-new">${BELL}<span><b>${esc(nb(p.client))} added you to this project.</b> Add the suppliers, workers, machines and materials you&rsquo;re bringing, and choose the documents they see for each.</span></p>` : ''}
        <div class="pj-cards" role="list">${c('suppliers', ICO.sup, 'Your suppliers', team.subs.length, 'You bring them in; each is notified.')}${c('workers', ICO.wk, 'Workers', team.workers.length, 'From your crew.')}${c('equipment', ICO.eq, 'Equipment', team.equipment.length, 'Machines you bring.')}${c('materials', ICO.mat, 'Materials', team.products.length, 'What you supply or use.')}</div>
        <div class="pjp-grid"><div class="pjp-col">
          <section class="pjp-card"><h3>What you see of this project</h3><p>The project&rsquo;s ID and name, the client, the region and who invited you, as above. ${esc(nb(p.client))} shares only this with its suppliers. The rest of the project, its other suppliers and their teams, stay theirs.</p></section>
        </div><div class="pjp-col">
          <section class="pjp-card"><h3>Who sees what you add</h3><p>${seenBy}, and the company that runs the project on C&#8209;MORE, if that&rsquo;s someone else. Nobody else on the project.</p><p>Each worker, machine and material shows only the documents you choose for it. Change them any time.</p></section>
        </div></div>`;
    },
    suppliers: () => `<p class="pjp-note">${EYE}<span>Each supplier you add is notified and sees the project&rsquo;s ID and name, the client, the region and that <b>${ME}</b> invited them. What they put on it is seen by you and ${seenBy}.</span></p>
      <div class="pjp-tools"><div class="pjp-tools-l"></div><button type="button" class="pj-add" data-add="suppliers">${PLUS}Add a supplier</button></div>
      <div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl"><thead><tr><th style="width:32%">Supplier</th><th style="width:34%">Their work</th><th style="width:22%">Status</th><th style="width:12%" aria-label="Remove"></th></tr></thead><tbody>
      ${team.subs.length ? team.subs.map((s, k) => `<tr><td><span class="n">${esc(nb(s.name))}</span><span class="d">${esc(s.city || '')}</span></td><td class="pjp-work"><select class="pjp-in" data-work="${k}" aria-label="${esc(s.name)}: type of work">${s.work ? '' : '<option value="" selected>Choose the type of work</option>'}${PJ.WORK_TYPES.map((t) => `<option${t === s.work ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select><input class="pjp-in" data-detail="${k}" value="${esc(s.detail || '')}" placeholder="${s.work === 'Other' ? 'Say what they’ll do' : 'Add details (optional)'}" aria-label="${esc(s.name)}: details of the work" autocomplete="off"></td><td><span class="co-badge b-info">Notified</span><span class="d">On ${esc(s.on)}</span></td><td class="pjp-x"><button type="button" class="link-btn" data-rm="subs:${k}">Remove</button></td></tr>`).join('')
        : '<tr><td colspan="4" class="pjp-none co-tbl-empty"><b>None of your suppliers on it yet.</b>Add one and they&rsquo;re notified, with what you need them to do.</td></tr>'}</tbody></table></div>`,
    workers: () => teamPanel(TEAM.workers),
    equipment: () => teamPanel(TEAM.equipment),
    materials: () => teamPanel(TEAM.materials),
  };
  const teamPanel = (T) => {
    const l = team[T.key];
    return `<p class="pjp-note">${EYE}<span>Seen by ${seenBy}. For each ${T.one}, only the documents you choose.</span></p>
      <div class="pjp-tools"><div class="pjp-tools-l"></div><button type="button" class="pj-add" data-add="${T === TEAM.materials ? 'materials' : T.key}">${PLUS}Add ${T.many}</button></div>
      <div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl"><thead><tr><th style="width:32%">${T.one.charAt(0).toUpperCase() + T.one.slice(1)}</th><th style="width:26%">Documents shared</th><th style="width:30%">Status of what you share</th><th style="width:12%" aria-label="Remove"></th></tr></thead><tbody>
      ${l.length ? l.map((x, k) => {
        const [n, sub] = nameOf(T.kind, x.i), { all, on } = sharedOf(T.kind, x), st = on.length ? stOf(on) : null;
        return `<tr><td><span class="n">${n}</span><span class="d">${sub}</span></td><td><span class="n">${on.length} of ${all.length}</span><button type="button" class="link-btn" data-share="${T.key}:${k}">Choose</button></td><td>${st ? `${badge(st, whyOf(on))}` : '<span class="co-badge b-neu">Nothing shared</span>'}</td><td class="pjp-x"><button type="button" class="link-btn" data-rm="${T.key}:${k}">Remove</button></td></tr>`;
      }).join('') : `<tr><td colspan="4" class="pjp-none co-tbl-empty"><b>No ${T.many} on it yet.</b>Add the ${T.many} you&rsquo;re bringing and choose what ${esc(nb(p.client))} sees of each.</td></tr>`}</tbody></table></div>`;
  };

  // ==== one supplier on your project (project.html?id=&sup=): what they brought to it ============
  // a matrix of their documents on this project (and of the suppliers they brought in) by area,
  // then the documents themselves. Made up from the project's model, so it agrees with its tabs.
  const supId = new URLSearchParams(location.search).get('sup');
  const AREAS = [['company', 'Company'], ['workers', 'Workers'], ['equipment', 'Equipment'], ['materials', 'Products &amp; Materials'], ['project', 'Project']];
  // ---- what the project asks of its suppliers (js/project-req.js), and what that makes of each one ----
  const RQ = window.CMProjectReq;
  const CAT = Object.fromEntries(((window.DOC_CATALOG || {}).docs || []).concat(RQ ? RQ.EXTRA : []).map((d) => [d.code, d]));
  const docName = (c) => (CAT[c] ? CAT[c].name.en : c);
  const CAT_OF = { company: 'company', workers: 'workers', equipment: 'equipment', materials: 'products', project: 'project' };
  const PER = { workers: 'per_worker', equipment: 'per_equipment', materials: 'per_product' };
  let REQ = [];
  // the codes asked for: of the supplier itself (its company's, and those for all its workers), or of each thing it brings
  const reqOf = (area, each) => REQ.filter((c) => CAT[c] && CAT[c].category === CAT_OF[area] && (area === 'company' || area === 'project' ? true : each ? CAT[c].level === PER[area] : CAT[c].level !== PER[area]));
  const reqIn = (area) => REQ.filter((c) => CAT[c] && CAT[c].category === CAT_OF[area]);
  // the document a status's reason names (ownerModel's WHY), when the project asks for it; else one of what it asks
  const NAMED = [[/tax clearance/i, 'CO-06'], [/social security clearance/i, 'CO-07'], [/civil liability/i, 'CO-10'], [/work accident/i, 'CO-08'], [/medical fitness/i, 'WK-11'], [/safety training/i, 'WK-14'], [/social security registration/i, 'WK-02'],
    [/inspection/i, 'EQ-03'], [/conformity/i, 'EQ-01'], [/insurance/i, 'EQ-07'], [/declaration of performance/i, 'PR-01'], [/safety data sheet/i, 'PR-04'], [/technical sheet/i, 'PR-03'], [/ce certificate/i, 'PR-02']];
  const named = (codes, why, key) => { for (const [re, c] of NAMED) if (re.test(why) && codes.includes(c)) return c; return codes[hash(key) % codes.length]; };
  const dateIn = (t) => { const m = /(\d{1,2} [A-Z][a-z]{2} \d{4})$/.exec(t || ''); return m ? m[1] : null; };
  // one thing's documents (the company itself, a worker, a machine, a material): what the project asks
  // of it, valid but for the one its status (as the model made it) is about
  // the project's own papers that don't run out (all but its insurance): no date, and never 'expiring'
  const NO_EXP = ['PJ-01', 'PJ-02', 'PJ-03', 'PJ-04'];
  const docsFor = (area, codes, x, key) => {
    const can = x.st === 'soon' ? codes.filter((c) => !NO_EXP.includes(c)) : codes;
    const bad = can.length && (x.st === 'miss' || x.st === 'soon') ? named(can, x.why, key) : null;
    return codes.map((c) => {
      const h = hash(`${p.id}:${key}:${c}`), d = { area, code: c, name: docName(c), of: x.of, ofSub: x.ofSub, status: 'valid', exp: fmt(new Date(Date.now() + (45 + (h % 640)) * 864e5)) };
      if (NO_EXP.includes(c)) d.exp = '';
      if (x.fresh) return Object.assign(d, { status: 'missing', exp: '' });
      if (c === bad && x.st === 'soon') Object.assign(d, { status: 'expiring', exp: dateIn(x.why) || fmt(new Date(Date.now() + (5 + (h % 25)) * 864e5)) });
      if (c === bad && x.st === 'miss') Object.assign(d, /expired/i.test(x.why) && !NO_EXP.includes(c) ? { status: 'expired', exp: fmt(new Date(Date.now() - (3 + (h % 40)) * 864e5)) } : { status: 'missing', exp: '' });
      return d;
    });
  };
  const DOC_W = { valid: 0, expiring: 1, missing: 2, expired: 2 };
  // where a list of documents leaves something: its status, and why, from the worst of them
  const verdict = (docs, none) => {
    if (!docs.length) return { st: 'ok', why: none };
    const w = docs.reduce((a, d) => (DOC_W[d.status] > DOC_W[a.status] ? d : a), docs[0]);
    if (!DOC_W[w.status]) return { st: 'ok', why: docs.length === 1 ? 'Its document is valid' : `All ${docs.length} documents valid` };
    return { st: DOC_W[w.status] === 2 ? 'miss' : 'soon', why: w.status === 'expiring' ? `${w.name} expires ${w.exp}` : `${w.name} ${w.status}` };
  };
  // the project's model, as its documents required say: each worker, machine and material, then each supplier
  const applyReq = () => {
    REQ = RQ ? RQ.reqOf(p) : [];
    const KINDS = [['workers', M.workers, (w) => w.role], ['equipment', M.equipment, (m) => m.ref], ['materials', M.materials, (m) => m.ref]];
    KINDS.forEach(([area, list, sub]) => list.forEach((x, k) => {
      const codes = reqOf(area, true);
      if (x.own) {
        // yours: your own documents on file, the ones the project asks for
        const mineD = docsOf(area === 'materials' ? 'products' : area, x.i).filter((d) => codes.includes(d.code));
        x.docs = mineD.map((d) => ({ area, code: d.code, name: plain(d.name), of: x.name, ofSub: sub(x), status: ({ valid: 'valid', expiring: 'expiring', expired: 'expired' })[d.status] || (DM && DM.RANK[d.status] > 1 ? 'missing' : DM && DM.RANK[d.status] === 1 ? 'expiring' : 'valid'), exp: d.exp || '' }));
      } else x.docs = docsFor(area, codes, { st: x.st, why: x.why, of: x.name, ofSub: sub(x) }, `${area}:${k}:${x.name}`);
      Object.assign(x, verdict(x.docs, codes.length ? 'Nothing on file yet' : 'Nothing asked for'));
    }));
    M.sups.forEach((s) => {
      const own = AREAS.flatMap(([area]) => reqOf(area, false).length ? docsFor(area, reqOf(area, false), { st: s.st, why: s.why, fresh: s.fresh, of: ({ company: 'The company', project: 'This project', workers: 'All their workers', equipment: 'All their equipment', materials: 'All their products and materials' })[area], ofSub: s.work }, `${s.id}:${area}`) : []);
      const items = KINDS.flatMap(([, list]) => list.filter((x) => x.sup === s.name));
      s.docs = own.concat(items.flatMap((x) => x.docs));
      const v = verdict(own, s.fresh ? 'No documents on it yet' : 'Nothing asked of the company');
      if (s.fresh && v.st === 'miss') v.why = `None of the ${pl(own.length, 'document')} asked for on file yet`;
      const badItems = items.filter((x) => x.st !== 'ok').sort((a, b) => ORDER.indexOf(a.st) - ORDER.indexOf(b.st));
      // the worse of its own documents and what it brings
      if (badItems.length && ORDER.indexOf(badItems[0].st) < ORDER.indexOf(v.st)) Object.assign(s, { st: badItems[0].st, why: `${badItems[0].name}: ${badItems[0].why}` });
      else Object.assign(s, v.st === 'ok' && s.docs.length ? { st: 'ok', why: 'Everything asked for is valid' } : v);
    });
  };
  const supDocs = (s) => s.docs || [];
  // the project's own documents (Documents required, Project), a column each: where every supplier stands on them
  const PJ_SHORT = { 'PJ-01': 'Subcontract', 'PJ-02': 'Site declaration', 'PJ-03': 'Safety plan', 'PJ-04': 'RAMS', 'PJ-06': 'Insurance' };
  const projMatrix = (l) => {
    const codes = reqOf('project', false);
    if (!codes.length || !M.sups.length) return '';
    const cell = (x, c) => {
      const d = supDocs(x).find((y) => y.area === 'project' && y.code === c);
      if (!d) return '<td class="c"><span class="cd-dash">&mdash;</span></td>';
      const say = `${docName(c)}: ${DOC_ST[d.status][0]}${d.exp ? `, expires ${d.exp}` : ''}`;
      return `<td class="c"><span class="cd-dot is-${DOC_TONE[DOC_RANK[d.status]]}" title="${esc(say)}" aria-hidden="true"></span><span class="d">${DOC_ST[d.status][0]}</span><span class="sr-only">${esc(say)}</span></td>`;
    };
    const rows = l.map((x) => `<tr class="is-link" tabindex="0" role="link" data-sup-id="${esc(x.id)}" aria-label="Open ${esc(x.name)}"><td><span class="n">${esc(nb(x.name))}</span><span class="d">${x.by ? `Brought in by ${esc(nb(x.by))}` : esc(x.work)}</span></td>${codes.map((c) => cell(x, c)).join('')}</tr>`).join('');
    const legend = [['ok', 'Valid'], ['pend', 'Expiring'], ['bad', 'Missing or expired']].map(([c, t]) => `<span><span class="cd-dot is-${c}"></span>${t}</span>`).join('');
    return `<section class="pjo-sec pjs-pj"><div class="co-sub-head co-sub-head-top"><h3 class="eyebrow">Your suppliers</h3></div><div class="co-sec-head co-sec-head-stack"><h2 class="co-h-l">Project documents</h2><p class="co-muted">What each supplier has given for ${esc(p.name)} itself: ${pl(codes.length, 'document')} asked for in <button type="button" class="link-btn" data-tab="required">Documents required</button>.</p></div>
      ${qTools('ov-pj', 'Search by supplier')}<div class="co-card co-tbl-card pjs-mx-wrap"><table class="co-tbl pjs-mx" data-tq-for="ov-pj"><thead><tr><th>Supplier</th>${codes.map((c) => `<th class="c" title="${esc(docName(c))}">${PJ_SHORT[c] || esc(docName(c))}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend">${legend}</p></section>`;
  };
  const DOC_RANK = { valid: 0, expiring: 1, missing: 2, expired: 2 };
  const DOC_TONE = ['ok', 'pend', 'bad'];
  const DOC_ST = { valid: ['Valid', 'b-ok'], expiring: ['Expiring', 'b-pend'], missing: ['Missing', 'b-over'], expired: ['Expired', 'b-over'] };
  const AREA_NONE = { company: '', project: '', workers: 'No workers', equipment: 'No equipment', materials: 'No products or materials' };
  // where one supplier's documents in an area stand, as a matrix cell: the worst status's dot
  // and how many need a look under it
  const areaCell = (x, a) => {
    const l = supDocs(x).filter((d) => d.area === a);
    if (!l.length) { const say = reqIn(a).length ? `${AREA_NONE[a] || 'Nothing'} on this project` : 'Not asked for on this project'; return `<td class="c"><span class="cd-dash" title="${say}">&mdash;</span><span class="sr-only">${say}</span></td>`; }
    const w = Math.max(...l.map((d) => DOC_RANK[d.status])), n = l.filter((d) => DOC_RANK[d.status] > 0).length;
    const say = n ? `${n} of ${l.length} need${n === 1 ? 's' : ''} a look` : `All ${l.length} valid`;
    return `<td class="c"><span class="cd-dot is-${DOC_TONE[w]}" aria-hidden="true"></span><span class="d">${say}</span></td>`;
  };
  // on site today: between their entry and exit dates
  const dayOf = (t) => { const m = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/.exec(String(t || '').trim()); return m && MON.includes(m[2]) ? new Date(+m[3], MON.indexOf(m[2]), +m[1]).getTime() : NaN; };
  // a worker's own days on site: within their supplier's, some starting later or leaving earlier;
  // yours, the project's (the same on the worker's page and in the supplier's list)
  // the same for a machine or a product or material (keyed by its serial or batch as well)
  const wkSite = (w, kind) => {
    const sup = M.sups.find((x) => x.name === w.sup), h = hash(kind ? `${p.id}:${kind}:${w.name}:${w.ref || ''}` : `${p.id}:wk:${w.name}`);
    if (!sup) return { entry: p.start || '', exit: p.deadline || '' };
    const a = dayOf(sup.entry), b = dayOf(sup.exit);
    if (Number.isNaN(a) || Number.isNaN(b)) return { entry: sup.entry, exit: sup.exit };
    const span = Math.max(0, (b - a) / 864e5), late = h % 3 ? 0 : Math.round(span * ((h >> 3) % 40) / 100), early = (h >> 5) % 4 ? 0 : Math.round(span * ((h >> 7) % 30) / 100);
    return { entry: fmt(new Date(a + late * 864e5)), exit: fmt(new Date(b - early * 864e5)) };
  };
  // where someone stands on site today: on it, not entered yet (dark grey), or gone (red)
  const ONSITE = { on: 'On site today', notyet: 'Not entered yet', offsite: 'Left the site' };
  // no entry date (yours, on a project without a start): on it until its end
  const siteOf = (d, stays) => { if (stays) { const a = dayOf(d.entry); return !Number.isNaN(a) && Date.now() < a ? 'notyet' : 'on'; }
     const a = dayOf(d.entry), b = dayOf(d.exit), now = Date.now(); if (!Number.isNaN(a) && now < a) return 'notyet'; if (Number.isNaN(a)) return Number.isNaN(b) || now < b + 864e5 ? 'on' : 'offsite'; return onSite(d) ? 'on' : 'offsite'; };
  const siteDotOf = (d, stays) => { const k = siteOf(d, stays), say = stays ? (k === 'on' ? `On site${d.entry ? ` since ${d.entry}` : ''}` : `Not entered yet: arrives ${d.entry}`) : `${ONSITE[k]}: ${d.entry ? `${d.entry} to ${d.exit || '—'}` : d.exit ? `until ${d.exit}` : 'for the whole project'}`; return `<span class="cd-dot is-${k}" title="${esc(say)}"></span><span class="sr-only">${esc(say)}</span>`; };
  const legendOf = (stays) => `<p class="cd-legend">${Object.entries(ONSITE).filter(([k]) => !stays || k !== 'offsite').map(([k, l]) => `<span><span class="cd-dot is-${k}"></span>${l}</span>`).join('')}</p>`;
  const SITE_LEGEND = legendOf(false);
  const onSite = (s) => { const a = dayOf(s.entry), b = dayOf(s.exit), now = Date.now(); return !Number.isNaN(a) && a <= now && (Number.isNaN(b) || now < b + 864e5); };

  const supCss = () => {
    const st = document.createElement('style');
    st.textContent = `
.pjs-sec + .pjs-sec { margin-top: 3rem; }
.pjs-sec .co-sec-head { margin-bottom: 1.25rem; }
.pjs-mx-wrap { overflow-x: auto; }
.pjs-mx { min-width: 40rem; table-layout: fixed; }
.pjs-mx th.c, .pjs-mx td.c { width: 8.5rem; text-align: center; }
.pjs-mx th.o, .pjs-mx td.o { width: 12rem; text-align: right; }
.pjs-mx tbody tr { cursor: default; }
.pjs-mx tbody tr:hover { background: transparent; }
.pjs-mx tbody tr.is-link { cursor: pointer; }
.pjs-mx tbody tr.is-link:hover, .pjs-mx tbody tr.is-link:focus-visible { background: var(--color-light-beige); }
.pjs-mx td.c .d { display: block; margin-top: 0.25rem; font-size: 0.75rem; color: var(--color-ink-subtle); }
.pjs-mx .is-cur .n::after { content: 'This supplier'; margin-left: 0.5rem; padding: 0.0625rem 0.5rem; border-radius: 9999px; background: var(--color-light-beige); font-size: 0.6875rem; font-weight: 500; color: var(--color-ink-subtle); vertical-align: 0.125rem; }
.pjs-all { margin-top: 0.75rem; font-size: 0.875rem; }
.pjs-grp { margin: 2rem 0 0.75rem; }
.pjs-tools { display: flex; margin: 0 0 0.875rem; }
.pjs-q { flex: 0 1 20rem; }
/* sortable heads: css/esg.css .cd-sort */
table[data-tq-for] th.c .cd-sort { justify-content: center; }
.pjs-wk { min-width: 52rem; }
.pjs-tbl { min-width: 44rem; table-layout: fixed; }
.pjp-req-foot { position: sticky; bottom: 0; z-index: 2; display: flex; align-items: center; justify-content: flex-end; gap: 1rem; margin-top: 1rem; padding: 0.875rem 0; background: var(--color-off-white, #fafafa); border-top: 1px solid var(--color-line); font-size: 0.875rem; }
.pjs-sups th.c, .pjs-sups td.c { text-align: center; }
.pjs-pj .pjs-mx th.c, .pjs-pj .pjs-mx td.c { width: auto; }
.pjs-pj .pjs-mx th:first-child { width: 26%; }
.pjs-pj .co-muted .link-btn { font: inherit; vertical-align: baseline; }
/* on site: green for yes, red for no */
.cd-dot.is-on { background: var(--color-ok-deep, #8ccb86); }
.cd-dot.is-offsite { background: var(--color-critical); }
.cd-dot.is-notyet { background: var(--color-graphite); }`;
    document.head.appendChild(st);
  };

  const paintSupplier = (s) => {
    const subs = M.sups.filter((x) => x.by === s.name);
    const docs = supDocs(s);
    document.title = `${s.name} · ${p.name} · C-MORE`;
    // the crumbs: back to the project's suppliers
    // whoever brought them in, and whoever brought those in: a step each in the crumbs, so the project stays in view
    const chain = []; for (let x = s; x.by && chain.length < 5;) { const up = M.sups.find((y) => y.name === x.by); if (!up || chain.includes(up)) break; chain.unshift(up); x = up; }
    const SEP = '<span aria-hidden="true">/</span>';
    const trail = document.getElementById('pjp-crumb'); if (trail && trail.parentElement) trail.parentElement.innerHTML = `<a href="my-company.html?filled">My company</a>${SEP}<a href="projects.html">Projects</a>${SEP}<a href="project.html?id=${encodeURIComponent(p.id)}#suppliers">${esc(p.name)}</a>${chain.map((x) => `${SEP}<a href="${supHref(x.id)}">${esc(nb(x.name))}</a>`).join('')}${SEP}<span aria-current="page">${esc(nb(s.name))}</span>`;
    const up = chain[chain.length - 1];
    const back = document.querySelector('.eco-crumbs-back'); if (back) { back.href = up ? supHref(up.id) : `project.html?id=${encodeURIComponent(p.id)}#suppliers`; back.setAttribute('aria-label', `Back to ${up ? up.name : p.name}`); }
    const fact = (t, v, sm) => `<div><dt>${t}</dt><dd>${v}${sm ? `<small>${sm}</small>` : ''}</dd></div>`;
    const nW = M.workers.filter((w) => w.sup === s.name).length;
    head.classList.add('pjh');
    head.innerHTML = `<span class="eyebrow">Supplier on ${esc(p.name)}</span>
      <div class="pjh-id"><h1 class="co-name">${esc(nb(s.name))}</h1><p class="co-subtle">${esc(s.work)} &middot; <a class="co-link" href="suppliers.html?id=${encodeURIComponent(s.id)}">See everything they share with you</a></p></div>
      <dl class="pjh-facts">
        ${fact('Status', badge(s.st), esc(s.why))}
        ${fact('On site', esc(s.entry || '—'), `to ${esc(s.exit || '—')}`)}
        ${fact('Brought in by', up ? `<a class="co-link" href="${supHref(up.id)}">${esc(nb(up.name))}</a>` : s.by ? esc(nb(s.by)) : 'You', s.by ? 'Their supplier' : 'Your supplier')}
        ${fact('Workers', String(nW), nW ? 'On this project' : 'None on it yet')}
      </dl>`;

    // the matrix: this supplier, then the ones they brought in; the worst status in each area
    const cell = (x, a) => areaCell(x, a);
    const rows = [s].concat(subs).map((x) => `<tr${x === s ? ' class="is-cur"' : ` class="is-link" tabindex="0" role="link" data-sup-id="${esc(x.id)}" aria-label="Open ${esc(x.name)}"`}><td><span class="n">${esc(nb(x.name))}</span><span class="d">${x === s ? esc(x.work) : `Their supplier &middot; ${esc(x.work)}`}</span></td>${AREAS.map(([a]) => cell(x, a)).join('')}<td class="o">${badge(x.st)}</td></tr>`).join('');
    const legend = [['ok', 'All valid'], ['pend', 'Expiring'], ['bad', 'Missing or expired']].map(([c, l]) => `<span><span class="cd-dot is-${c}"></span>${l}</span>`).join('');
    const matrix = `<section class="pjs-sec"><div class="co-sec-head co-sec-head-stack"><h2 class="co-h-l">Their documents on this project</h2><p class="co-muted">${subs.length ? `What ${esc(nb(s.name))} and the ${pl(subs.length, 'supplier', 'suppliers')} they brought in provided for ${esc(p.name)}, by area.` : `What ${esc(nb(s.name))} provided for ${esc(p.name)}, by area.`}</p></div>
      <div class="co-card co-tbl-card pjs-mx-wrap"><table class="co-tbl pjs-mx" data-unpaged><thead><tr><th>Supplier</th>${AREAS.map(([, l]) => `<th class="c">${l}</th>`).join('')}<th class="o">Overall</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend">${legend}<span><span class="cd-dash">&mdash;</span>Not asked for, or none on this project</span></p></section>`;

    // their documents, a section per area: the company's and the project's as documents; workers,
    // equipment and products & materials a row each (a worker to their page on this project), then
    // what's asked of all of them at once
    const docRows = (l, of, id) => `${qTools(id, 'Search documents')}<div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl pjs-tbl" data-tq-for="${id}"><thead><tr><th style="width:${of ? 34 : 52}%">Document</th>${of ? '<th style="width:30%">For</th>' : ''}<th style="width:${of ? 18 : 24}%">Expiration date</th><th style="width:${of ? 18 : 24}%">Status</th></tr></thead><tbody>
      ${l.slice().sort((a, b) => DOC_RANK[b.status] - DOC_RANK[a.status]).map((d) => `<tr><td><span class="n">${esc(d.name)}</span><span class="d">${esc(d.code)}</span></td>${of ? `<td><span class="n">${esc(d.of)}</span><span class="d">${esc(d.ofSub || '')}</span></td>` : ''}<td>${d.exp ? (DM ? DM.expHtml(d.exp) : esc(d.exp)) : '<span class="cd-dash">&mdash;</span>'}</td><td><span class="co-badge ${DOC_ST[d.status][1]}">${DOC_ST[d.status][0]}</span></td></tr>`).join('')}</tbody></table></div>`;
    const sec = (h, lead, inner) => `<section class="pjs-sec"><div class="co-sec-head co-sec-head-stack"><h2 class="co-h-l">${h}</h2><p class="co-muted">${lead}</p></div>${inner}</section>`;
    const none = (t) => `<div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl pjs-tbl"><tbody><tr><td class="pjp-none co-tbl-empty">${t}</td></tr></tbody></table></div>`;
    const valid = (x) => { const l = x.docs || []; return l.length ? `${l.filter((d) => !DOC_RANK[d.status]).length} of ${l.length}` : '&mdash;'; };
    const ofArea = (a) => docs.filter((d) => d.area === a);
    const ITEMS = [['workers', 'Workers', M.workers, 'Worker', (w) => w.role, 'worker', 'workers'], ['equipment', 'Equipment', M.equipment, 'Machine', (m) => m.ref, 'machine', 'machines'], ['materials', 'Products &amp; materials', M.materials, 'Product or material', (m) => m.ref, 'product or material', 'products or materials']];
    const itemSec = ([a, h, all, col, sub, one, many]) => {
      if (!reqIn(a).length) return '';
      const l = all.map((x, k) => ({ x, k })).filter(({ x }) => x.sup === s.name).sort((u, v) => byWorst(u.x, v.x));
      const group = ofArea(a).filter((d) => /^All their /.test(d.of));
      const link = a === 'workers', kind = a === 'workers' ? null : a;
      // workers: on site today (as the suppliers' dots), and their entry and exit dates
      const stays = a === 'materials';
      const site = (x) => { const d = wkSite(x, kind); return `<td class="c">${siteDotOf(d, stays)}</td><td>${esc(d.entry || '—')}</td>${stays ? '' : `<td>${esc(d.exit || '—')}</td>`}`; };
      const head = stays ? `<th style="width:30%">${col}</th><th class="c" style="width:12%">On site</th><th style="width:16%">Entry date</th><th style="width:14%">Documents valid</th><th style="width:28%">Status</th>`
        : `<th style="width:24%">${col}</th><th class="c" style="width:10%">On site</th><th style="width:13%">Entry date</th><th style="width:13%">Exit date</th><th style="width:12%">Documents valid</th><th style="width:28%">Status</th>`;
      const rows = l.length ? `${qTools(`sp-${a}`, `Search by name or ${a === 'workers' ? 'role' : a === 'equipment' ? 'serial number' : 'batch'}`)}<div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl pjs-tbl pjs-wk" data-tq-for="sp-${a}"><thead><tr>${head}</tr></thead><tbody>
        ${l.map(({ x, k }) => `<tr${link ? ` class="is-link" tabindex="0" role="link" data-wk-id="${k}" aria-label="Open ${esc(x.name)}"` : ''}><td><span class="n">${esc(x.name)}</span><span class="d">${esc(sub(x) || '')}</span></td>${site(x)}<td>${valid(x)}</td><td>${badge(x.st, x.why)}</td></tr>`).join('')}</tbody></table></div>${legendOf(stays)}`
        : none(`${esc(nb(s.name))} has no ${many} on this project.`);
      const lead = l.length ? `${pl(l.length, one, many)} on ${esc(p.name)}, the ones to chase first.` : `None on ${esc(p.name)} yet.`;
      return sec(h, lead, rows + (group.length ? `<div class="co-sub-head pjs-grp"><h3 class="eyebrow">For all their ${a === 'materials' ? 'products and materials' : a}</h3></div>${docRows(group, false, `sp-${a}-all`)}` : ''));
    };
    const docSec = (a, h, of) => { const l = ofArea(a); return reqIn(a).length ? sec(h, l.length ? `${pl(l.length, 'document')} for ${esc(p.name)}, the ones to chase first.` : 'Nothing on file yet.', l.length ? docRows(l, false, `sp-${a}`) : none('Nothing on file yet.')) : ''; };
    const table = docSec('company', 'Company documents') + ITEMS.map(itemSec).join('') + docSec('project', 'Project documents');
    // the suppliers they brought in to this project: each to its own page on it
    const siteDot = siteDotOf;
    const invited = `<section class="pjs-sec"><div class="co-sec-head co-sec-head-stack"><h2 class="co-h-l">Suppliers they brought in</h2><p class="co-muted">${subs.length ? `${pl(subs.length, 'supplier')} ${esc(nb(s.name))} brought in to ${esc(p.name)}.` : `${esc(nb(s.name))} hasn&rsquo;t brought in any suppliers to this project.`}</p></div>
      ${subs.length ? `${qTools('sp-subs', 'Search by name or work')}<div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl pjs-sups" data-tq-for="sp-subs"><thead><tr><th style="width:32%">Supplier</th><th class="c" style="width:12%">On site</th><th class="c" style="width:16%">Entry date</th><th class="c" style="width:16%">Exit date</th><th class="c" style="width:24%">Status</th></tr></thead><tbody>
      ${subs.sort(byWorst).map((x) => `<tr class="is-link" tabindex="0" role="link" data-sup-id="${esc(x.id)}" aria-label="Open ${esc(x.name)}"><td><span class="n">${esc(nb(x.name))}</span><span class="d">${esc(x.work)}</span></td><td class="c">${siteDot(x)}</td><td class="c">${esc(x.entry || '—')}</td><td class="c">${esc(x.exit || '—')}</td><td class="c">${badge(x.st, x.why)}</td></tr>`).join('')}</tbody></table></div>
      ${SITE_LEGEND}` : ''}</section>`;
    body.innerHTML = matrix + invited + table;
    applySort(body); applyTQ(body);
  };

  // ==== one worker on your project (project.html?id=&wk=): who they are, and their documents on it ====
  // the crumbs as the supplier page's, with the supplier they work for (and whoever brought it in) a step each
  const wkId = new URLSearchParams(location.search).get('wk');
  const paintWorker = (w) => {
    const sup = M.sups.find((x) => x.name === w.sup);
    const chain = []; for (let x = sup; x && chain.length < 6;) { if (chain.includes(x)) break; chain.unshift(x); x = x.by ? M.sups.find((y) => y.name === x.by) : null; }
    document.title = `${w.name} · ${p.name} · C-MORE`;
    const SEP = '<span aria-hidden="true">/</span>';
    const trail = document.getElementById('pjp-crumb'); if (trail && trail.parentElement) trail.parentElement.innerHTML = `<a href="my-company.html?filled">My company</a>${SEP}<a href="projects.html">Projects</a>${SEP}<a href="project.html?id=${encodeURIComponent(p.id)}#workers">${esc(p.name)}</a>${chain.map((x) => `${SEP}<a href="${supHref(x.id)}">${esc(nb(x.name))}</a>`).join('')}${SEP}<span aria-current="page">${esc(w.name)}</span>`;
    const back = document.querySelector('.eco-crumbs-back'); if (back) { back.href = sup ? supHref(sup.id) : `project.html?id=${encodeURIComponent(p.id)}#workers`; back.setAttribute('aria-label', `Back to ${sup ? sup.name : p.name}`); }
    const docs = (w.docs || []).slice().sort((a, b) => DOC_RANK[b.status] - DOC_RANK[a.status]);
    const nOk = docs.filter((d) => !DOC_RANK[d.status]).length;
    const fact = (t, v, sm) => `<div><dt>${t}</dt><dd>${v}${sm ? `<small>${sm}</small>` : ''}</dd></div>`;
    head.classList.add('pjh');
    head.innerHTML = `<span class="eyebrow">Worker on ${esc(p.name)}</span>
      <div class="pjh-id"><h1 class="co-name">${esc(w.name)}</h1><p class="co-subtle">${esc(w.role)}${w.own ? ` &middot; <a class="co-link" href="company-details.html?area=workers&amp;worker=${w.i}">See their full profile</a>` : ''}</p></div>
      <dl class="pjh-facts">
        ${fact('Status', badge(w.st), esc(w.why))}
        ${fact('Works for', sup ? `<a class="co-link" href="${supHref(sup.id)}">${esc(nb(sup.name))}</a>` : 'You', sup ? (sup.by ? `Brought in by ${esc(nb(sup.by))}` : 'Your supplier') : esc(ME))}
        ${(() => { const d = wkSite(w); return sup ? fact('On site', esc(d.entry || '—'), `to ${esc(d.exit || '—')}`) : fact('On site', p.deadline ? `Until ${esc(p.deadline)}` : '—', 'The whole project'); })()}
        ${fact('Documents', docs.length ? `${nOk} of ${docs.length}` : '—', docs.length ? 'Valid' : 'None asked for')}
      </dl>`;
    body.innerHTML = `<section class="pjs-sec"><div class="co-sec-head co-sec-head-stack"><h2 class="co-h-l">Their documents on this project</h2><p class="co-muted">${docs.length ? `What ${esc(p.name)} asks of each worker, the ones to chase first.` : `${esc(p.name)} asks nothing of each worker. Change that in <a class="co-link" href="project.html?id=${encodeURIComponent(p.id)}#required">Documents required</a>.`}</p></div>
      ${docs.length ? `${qTools('wk-docs', 'Search documents')}<div class="co-card co-tbl-card"><table class="co-tbl pjp-tbl pjs-tbl" data-tq-for="wk-docs"><thead><tr><th style="width:52%">Document</th><th style="width:24%">Expiration date</th><th style="width:24%">Status</th></tr></thead><tbody>
      ${docs.map((d) => `<tr><td><span class="n">${esc(d.name)}</span><span class="d">${esc(d.code)}</span></td><td>${d.exp ? (DM ? DM.expHtml(d.exp) : esc(d.exp)) : '<span class="cd-dash">&mdash;</span>'}</td><td><span class="co-badge ${DOC_ST[d.status][1]}">${DOC_ST[d.status][0]}</span></td></tr>`).join('')}</tbody></table></div>` : ''}</section>`;
    applySort(body); applyTQ(body);
  };

  // ---- painting ----
  const panel = () => (own ? OWNER : SUPPLIER)[tab]();
  let reqPick = null;
  const paint = (focus) => {
    body.innerHTML = `${segOf()}<div id="pjp-panel" role="tabpanel" aria-labelledby="pjp-t-${tab}">${panel()}</div>`;
    // Documents required: the picker, and Save once something changed
    if (own && tab === 'required' && RQ) {
      const was = [...REQ].sort().join();
      reqPick = RQ.picker(body.querySelector('#pjp-req'), { country: p.country || 'Portugal', selected: REQ.slice(), onChange: (c) => {
        const b = body.querySelector('[data-req-save]'), t = body.querySelector('[data-req-said]'); if (!b) return;
        const changed = [...c].sort().join() !== was; b.disabled = !changed; t.textContent = changed ? `${pl(c.length, 'document')} asked for, from ${REQ.length}. Save to apply it to the project.` : 'No changes yet.';
      } });
    }
    applySort(body); applyTQ(body);
    if (focus) { const b = body.querySelector(focus); if (b) b.focus({ preventScroll: true }); }
  };
  const go = (k, focus) => {
    const keys = TABS().map((t) => t[0]); if (!keys.includes(k)) k = keys[0];
    if (k !== tab) { f.st = 'all'; f.sup = ''; }
    tab = k; history.replaceState(null, '', `${location.pathname}${location.search}${k === keys[0] ? '' : '#' + k}`);
    paint(focus);
  };

  // a row of the overview's list: its tab, showing that supplier's
  const openTab = (tr) => { go(tr.dataset.openTab); f.sup = tr.dataset.openSup || ''; paint(`[data-tab="${tab}"][role="tab"]`); scrollTo({ top: 0, behavior: 'smooth' }); };

  // ---- the drawers: what to add, what to share ----
  let dw = null, dwKind = null, back = null;
  const toast = (t) => { const el = Object.assign(document.createElement('div'), { className: 'pj-toast', textContent: t }); el.setAttribute('role', 'status'); document.body.appendChild(el); setTimeout(() => el.remove(), 4200); };
  const drawer = (title, sub, inner, foot) => {
    if (!dw) {
      dw = document.createElement('div'); dw.className = 'docd'; dw.hidden = true;
      document.body.appendChild(dw);
      dw.addEventListener('click', (e) => { if (e.target.closest('[data-dx]')) close(); });
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && dw && !dw.hidden) close(); });
    }
    back = document.activeElement;
    dw.innerHTML = `<div class="docd-scrim" data-dx></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="pjp-dw-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${SVG(ICO.sup)}</span><div class="docd-t"><h3 id="pjp-dw-t">${title}</h3><p>${sub}</p></div><button type="button" class="dlg-x" data-dx aria-label="Close">${XI}</button></header>
      <div class="docd-body">${inner}</div><footer class="docd-foot">${foot}</footer></aside>`;
    dw.hidden = false; void dw.offsetWidth; dw.classList.add('is-open'); document.documentElement.style.overflow = 'hidden';
    setTimeout(() => { const q = dw.querySelector('.pjp-q') || dw.querySelector('.docd-panel'); q.focus({ preventScroll: true }); }, 40);
  };
  const close = () => {
    if (!dw || dw.hidden) return;
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { if (!dw.classList.contains('is-open')) dw.hidden = true; }, 320);
    if (back && back.isConnected) back.focus({ preventScroll: true });
  };
  const pickRow = (key, x, on, dis, sub) => `<li><label class="${on ? 'is-on' : ''}${dis ? ' is-dis' : ''}" data-text="${esc(fold(x.name + ' ' + (x.sub || '')))}"><input type="checkbox" data-pick="${esc(key)}"${on ? ' checked' : ''}${dis ? ' disabled' : ''}><span class="t"><span class="n">${esc(nb(x.name))}</span><span class="d">${esc(sub)}</span></span>${x.badge || ''}</label></li>`;
  const openPick = (what) => {
    dwKind = what;
    let rows, title, sub;
    if (what === 'suppliers') {
      const on = new Set(team.subs.map((s) => s.id));
      rows = (S ? S.list() : []).filter((s) => s.status !== 'invited').map((s) => pickRow(s.id, { name: s.name, sub: (s.services || []).join(' ') }, on.has(s.id), on.has(s.id), on.has(s.id) ? 'On this project already' : [(s.services || [])[0], s.city].filter(Boolean).join(' · '))).join('');
      title = 'Add your suppliers'; sub = `They&rsquo;re notified, and see this project&rsquo;s ID, name, client and region.`;
    } else {
      const T = TEAM[what], on = new Set(team[T.key].map((x) => x.i));
      rows = T.list().map((x) => { const d = docsOf(T.kind, x.i); return pickRow(String(x.i), Object.assign({ badge: d.length ? badge(stOf(d)) : '' }, x), on.has(x.i), on.has(x.i), on.has(x.i) ? 'On this project already' : x.sub); }).join('');
      title = `Add ${T.many}`; sub = `${esc(nb(p.client))} sees them, with the documents you choose. All on file are shared to start with.`;
    }
    drawer(title, sub, `<input type="search" class="pjp-q" placeholder="Search" aria-label="Search">${rows ? `<ul class="pjp-pick">${rows}</ul>` : '<p class="pjp-none">Nothing to add yet.</p>'}`,
      `<span data-pick-n>None selected</span><span class="pjp-foot-r"><button type="button" class="btn btn-quiet btn-sm" data-dx>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-do-add disabled>Add</button></span>`);
  };
  const openShare = (key, k) => {
    const T = Object.values(TEAM).find((t) => t.key === key), x = team[key][k], { all, on } = sharedOf(T.kind, x), set = new Set(on.map((d) => d.code));
    dwKind = `share:${key}:${k}`;
    const [n, s] = nameOf(T.kind, x.i);
    const rows = all.map((d) => pickRow(d.code, { name: plain(d.name), badge: `<span class="co-badge ${DM.STATUS[d.status][1]}">${DM.STATUS[d.status][0]}</span>` }, set.has(d.code), false, d.exp && d.exp !== '—' ? `Valid until ${plain(d.exp)}` : 'No expiry')).join('');
    drawer(`What ${esc(nb(p.client))} sees`, `${n} &middot; ${s}`, all.length ? `<div class="pjp-all"><span>${pl(all.length, 'document')} on file for this ${T.one}</span><button type="button" class="link-btn" data-all>Select all</button></div><ul class="pjp-pick">${rows}</ul>` : `<p class="pjp-none">Nothing on file for this ${T.one} yet. Upload it in Documents and it can be shared here.</p>`,
      `<span data-pick-n></span><span class="pjp-foot-r"><button type="button" class="btn btn-quiet btn-sm" data-dx>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-do-share>Save</button></span>`);
    count();
  };
  const count = () => {
    if (!dw) return;
    const n = dw.querySelectorAll('[data-pick]:checked:not(:disabled)').length, el = dw.querySelector('[data-pick-n]'), add = dw.querySelector('[data-do-add]');
    if (add) { add.disabled = !n; el.textContent = n ? `${n} selected` : 'None selected'; }
    else if (el) { const all = dw.querySelectorAll('[data-pick]').length; el.textContent = `Sharing ${n} of ${all}`; }
    dw.querySelectorAll('.pjp-pick label').forEach((l) => l.classList.toggle('is-on', l.querySelector('input').checked));
  };

  // the supplier who brought one in, a link to their page on this project
  const byLink = (name) => { const x = M && M.sups.find((y) => y.name === name); return x ? `<a class="co-link" href="${supHref(x.id)}">${esc(nb(name))}</a>` : esc(nb(name)); };
  // a supplier's row: its page on this project
  const wkHref = (k) => `project.html?id=${encodeURIComponent(p.id)}&wk=${k}`;
  const supHref = (sid) => `project.html?id=${encodeURIComponent(p.id)}&sup=${encodeURIComponent(sid)}`;
  // ---- wiring ----
  body.addEventListener('click', (e) => {
    if (e.target.closest('[data-req-save]') && reqPick) {
      RQ.save(p.id, reqPick.get()); M = ownerModel(); applyReq(); paint('[data-tab="required"][role="tab"]');
      toast('Documents required saved. The project’s statuses follow them now.'); return;
    }
    const t = e.target.closest('[data-tab]'); if (t) { go(t.dataset.tab, `[data-tab="${t.dataset.tab}"][role="tab"]`); if (t.closest('#pjp-panel')) scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const s = e.target.closest('[data-st]'); if (s) { f.st = s.dataset.st; paint(`[data-st="${f.st}"]`); return; }
    const a = e.target.closest('[data-add]'); if (a) { openPick(a.dataset.add); return; }
    const sh = e.target.closest('[data-share]'); if (sh) { const [key, k] = sh.dataset.share.split(':'); openShare(key, +k); return; }
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      const [key, k] = rm.dataset.rm.split(':'), x = team[key][+k];
      const name = key === 'subs' ? x.name : plain(nameOf(Object.values(TEAM).find((T) => T.key === key).kind, x.i)[0]);
      team[key].splice(+k, 1); save(); paint('.pj-add'); toast(`${nb(name)} is off this project.`); return;
    }
    const ot = e.target.closest('tr[data-open-tab]'); if (ot) { openTab(ot); return; }
    const wr = e.target.closest('tr[data-wk-id]'); if (wr && !e.target.closest('a, button, input')) { location.href = wkHref(wr.dataset.wkId); return; }
    const row = e.target.closest('tr[data-sup-id]'); if (row && !e.target.closest('a, button, input')) location.href = supHref(row.dataset.supId);
  });
  body.addEventListener('keydown', (e) => {
    const tabBtn = e.target.closest('[role="tab"]');
    if (tabBtn && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      const keys = TABS().map((x) => x[0]), i = keys.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : -1);
      e.preventDefault(); const k = keys[(i + keys.length) % keys.length]; go(k, `[data-tab="${k}"][role="tab"]`); return;
    }
    const ot = e.target.closest('tr[data-open-tab]'); if (ot && (e.key === 'Enter' || e.key === ' ') && e.target === ot) { e.preventDefault(); openTab(ot); return; }
    const wr = e.target.closest('tr[data-wk-id]'); if (wr && (e.key === 'Enter' || e.key === ' ') && e.target === wr) { e.preventDefault(); location.href = wkHref(wr.dataset.wkId); return; }
    const row = e.target.closest('tr[data-sup-id]'); if (row && (e.key === 'Enter' || e.key === ' ') && e.target === row) { e.preventDefault(); location.href = supHref(row.dataset.supId); }
  });
  body.addEventListener('change', (e) => {
    if (e.target.matches('[data-sup]')) { f.sup = e.target.value; paint('[data-sup]'); return; }
    if (e.target.matches('[data-work]')) { const x = team.subs[+e.target.dataset.work]; x.work = e.target.value; save(); const d = e.target.nextElementSibling; if (d) d.placeholder = x.work === 'Other' ? 'Say what they’ll do' : 'Add details (optional)'; return; }
    if (e.target.matches('[data-detail]')) { team.subs[+e.target.dataset.detail].detail = e.target.value.trim(); save(); }
  });
  document.addEventListener('change', (e) => { if (dw && dw.contains(e.target) && e.target.matches('[data-pick]')) count(); });
  document.addEventListener('input', (e) => {
    if (!dw || !e.target.matches('.pjp-q')) return;
    const q = fold(e.target.value.trim());
    dw.querySelectorAll('.pjp-pick li').forEach((li) => { li.hidden = !!q && !li.firstElementChild.dataset.text.includes(q); });
  });
  document.addEventListener('click', (e) => {
    if (!dw || !dw.contains(e.target)) return;
    if (e.target.closest('[data-all]')) { dw.querySelectorAll('[data-pick]').forEach((c) => { c.checked = true; }); count(); return; }
    if (e.target.closest('[data-do-add]')) {
      const picked = [...dw.querySelectorAll('[data-pick]:checked:not(:disabled)')].map((c) => c.dataset.pick);
      if (dwKind === 'suppliers') {
        picked.forEach((sid) => { const s = S.byId(sid); if (s) team.subs.push({ id: s.id, name: s.name, city: s.city || '', work: '', on: today() }); });
        toast(picked.length === 1 ? `${nb(S.byId(picked[0]).name)} is added and notified.` : `${picked.length} suppliers added. Each one is notified.`);
      } else {
        const T = TEAM[dwKind]; picked.forEach((i) => team[T.key].push({ i: +i, share: null }));
        toast(`${pl(picked.length, T.one)} added. ${nb(p.client)} can see ${picked.length === 1 ? 'it' : 'them'} now.`);
      }
      save(); close(); paint(); return;
    }
    if (e.target.closest('[data-do-share]')) {
      const [, key, k] = dwKind.split(':'), x = team[key][+k], all = [...dw.querySelectorAll('[data-pick]')];
      const on = all.filter((c) => c.checked).map((c) => c.dataset.pick);
      x.share = on.length === all.length ? null : on;
      save(); close(); paint(); toast(`Sharing ${on.length} of ${all.length} documents for this one.`);
    }
  });
  addEventListener('hashchange', () => { if (!curSup && !curWk && tabFromHash() !== tab) go(tabFromHash()); });

  if (own) { M = ownerModel(); applyReq(); supCss(); }
  // one of your suppliers on it: their page on this project
  const curSup = own && supId ? M.sups.find((x) => x.id === supId) : null;
  if (curSup) { paintSupplier(curSup); return; }
  // one of the workers on it: their page on this project
  const curWk = own && wkId != null && /^\d+$/.test(wkId) ? M.workers[+wkId] : null;
  if (curWk) { paintWorker(curWk); return; }
  paintHead();
  go(tabFromHash());
  // back from new-project.html: what was started
  try { const t = sessionStorage.getItem('cm-pj-toast'); if (t) { sessionStorage.removeItem('cm-pj-toast'); toast(t); } } catch (e) {}
})();
