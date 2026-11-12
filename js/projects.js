/* Projects: where the company is working, and how each project's documents stand.
   One table, drawn here for two pages:
   - projects.html (Projects in the side menu): the cards, as on Documents (Asked for, Valid, Needs a
     look, Not compliant), a search and Filter, every project ten to a page, and a project's drawer.
   - the company overview (my-company.html): the same table with only the projects that need
     attention, the worst first, and a link to Projects.
   Markup: a table [data-pj-table] (data-pj-mode="attention" on the overview), and on Projects
   [data-pj-cards], .co-tools[data-pj-tools], [data-pj-pills] and [data-pj-pager].
   Miguel's company only (Beatriz deals in products, not sites); a company added in this session has
   none yet. Prototype: each project's documents are built from its ID; the missing ones are the
   alerts it had. */
(() => {
  const PROJECTS = [
    {id: 'FC-2026-031', name: 'São João Hospital, east wing', own: 'owner', client: 'ULS São João', sector: 'Hospital', city: 'Porto', district: 'Porto', suppliers: 6, workers: 42, deadline: '18 Dec 2026', miss: 2},
    {id: 'FC-2026-018', name: 'EN13 resurfacing, Vila do Conde', own: 'owner', client: 'Infraestruturas de Portugal', sector: 'Roads & Bridges', city: 'Vila do Conde', district: 'Porto', suppliers: 4, workers: 28, deadline: '', miss: 0},
    {id: 'FC-2025-047', name: 'Garcia de Orta secondary school renovation', own: 'owner', client: 'Parque Escolar', sector: 'Education', city: 'Porto', district: 'Porto', suppliers: 3, workers: 19, deadline: '15 Jan 2027', miss: 1},
    {id: 'FC-2026-052', name: 'Quinta da Boavista apartments', own: 'owner', client: 'Boavista Living, S.A.', sector: 'Residential', city: 'Porto', district: 'Porto', suppliers: 5, workers: 33, deadline: '', miss: 0},
    {id: 'ME-2026-112', name: 'Data centre shell, Building B', own: 'supplier', client: 'Mota‑Engil', sector: 'General contractor', city: 'Matosinhos', district: 'Porto', suppliers: 9, workers: 12, deadline: '30 Nov 2026', miss: 1},
    {id: 'CF-2026-027', name: 'Clinic fit-out, level 3', own: 'supplier', client: 'CUF', sector: 'Healthcare', city: 'Porto', district: 'Porto', suppliers: 7, workers: 8, deadline: '', miss: 0},
    {id: 'SN-2026-064', name: 'Warehouse expansion', own: 'supplier', client: 'Sonae MC', sector: 'Logistics', city: 'Maia', district: 'Porto', suppliers: 11, workers: 6, deadline: '28 Feb 2027', miss: 2},
    {id: 'FC-2026-044', name: 'NorteShopping parking deck', own: 'owner', client: 'Sonae Sierra', sector: 'Retail', city: 'Matosinhos', district: 'Porto', suppliers: 7, workers: 51, deadline: '30 Jun 2027', miss: 1},
    {id: 'FC-2026-009', name: 'Riverside office fit-out', own: 'owner', client: 'Douro Riverside Development', sector: 'Commercial', city: 'Vila Nova de Gaia', district: 'Porto', suppliers: 4, workers: 22, deadline: '15 Nov 2026', miss: 0},
    {id: 'ME-2026-131', name: 'Data centre shell, Building C', own: 'supplier', client: 'Mota‑Engil', sector: 'General contractor', city: 'Matosinhos', district: 'Porto', suppliers: 10, workers: 14, deadline: '', miss: 0},
    {id: 'FC-2025-061', name: 'Maia fire station no. 2', own: 'owner', client: 'Câmara Municipal da Maia', sector: 'Public safety', city: 'Maia', district: 'Porto', suppliers: 5, workers: 26, deadline: '20 Dec 2026', miss: 2},
    {id: 'FC-2026-023', name: 'Almeida Garrett library expansion', own: 'owner', client: 'Câmara Municipal do Porto', sector: 'Civic', city: 'Porto', district: 'Porto', suppliers: 4, workers: 18, deadline: '31 Mar 2027', miss: 0},
    {id: 'CS-2026-008', name: 'Lever water treatment upgrade', own: 'supplier', client: 'Casais', sector: 'General contractor', city: 'Vila Nova de Gaia', district: 'Porto', suppliers: 12, workers: 9, deadline: '14 May 2027', miss: 1},
    {id: 'FC-2026-058', name: 'Gondomar medical offices', own: 'owner', client: 'Lusíadas Saúde', sector: 'Healthcare', city: 'Gondomar', district: 'Porto', suppliers: 6, workers: 30, deadline: '', miss: 0},
    {id: 'CF-2026-033', name: 'Imaging suite, ground floor', own: 'supplier', client: 'CUF', sector: 'Healthcare', city: 'Porto', district: 'Porto', suppliers: 5, workers: 7, deadline: '12 Dec 2026', miss: 0},
    {id: 'FC-2026-036', name: 'Campanhã station canopy', own: 'owner', client: 'Metro do Porto', sector: 'Transport', city: 'Porto', district: 'Porto', suppliers: 3, workers: 15, deadline: '28 Feb 2027', miss: 1},
    {id: 'AB-2026-090', name: 'School gym, Braga', own: 'supplier', client: 'ABB – Alexandre Barbosa Borges', sector: 'General contractor', city: 'Braga', district: 'Braga', suppliers: 8, workers: 10, deadline: '30 Aug 2027', miss: 0},
    {id: 'FC-2025-052', name: 'Valongo community centre', own: 'owner', client: 'Câmara Municipal de Valongo', sector: 'Civic', city: 'Valongo', district: 'Porto', suppliers: 4, workers: 17, deadline: '10 Nov 2026', miss: 0},
    {id: 'SN-2026-071', name: 'Cold storage annex', own: 'supplier', client: 'Sonae MC', sector: 'Logistics', city: 'Maia', district: 'Porto', suppliers: 9, workers: 5, deadline: '', miss: 1},
    {id: 'FC-2026-061', name: 'Póvoa seafront boardwalk repairs', own: 'owner', client: 'Câmara Municipal da Póvoa de Varzim', sector: 'Civic', city: 'Póvoa de Varzim', district: 'Porto', suppliers: 3, workers: 12, deadline: '15 May 2027', miss: 0},
    {id: 'TD-2026-014', name: 'Leixões cruise terminal works', own: 'supplier', client: 'Teixeira Duarte', sector: 'General contractor', city: 'Matosinhos', district: 'Porto', suppliers: 14, workers: 11, deadline: '30 Sep 2027', miss: 0},
    {id: 'FC-2026-064', name: 'Valongo logistics platform slab', own: 'owner', client: 'Plataforma Logística de Valongo', sector: 'Logistics', city: 'Valongo', district: 'Porto', suppliers: 2, workers: 9, deadline: '', miss: 0},
    {id: 'FC-2026-067', name: 'Braga clinic renovation', own: 'owner', client: 'Hospital de Braga', sector: 'Healthcare', city: 'Braga', district: 'Braga', suppliers: 5, workers: 20, deadline: '31 Jan 2027', miss: 1},
  ];
  const PER = 10;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const hash = (t) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return Math.abs(h); };
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const pl = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

  // whose projects these are: Miguel's demo company; not Beatriz, not a company added in this session
  const ss = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const persona = () => document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel';
  const hasProjects = () => {
    if (persona() === 'beatriz') return false;
    let org = 'home', email = '';
    try { org = JSON.parse(ss('cm-org') || '"home"') || 'home'; } catch (e) {}
    try { email = (JSON.parse(ss('cm-person') || 'null') || {}).email || ''; } catch (e) {}
    return org === 'home' && !/^test@c-more\.test$/i.test(email);
  };

  // ---- each project's documents ----
  const DOCST = { ok: 'Valid', look: 'Needs a look', miss: 'Not compliant' };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const POOL = ['Work accident insurance', 'Social Security clearance certificate', 'Tax clearance certificate', 'Construction licence (alvará)',
    'Health and safety plan for the site', 'Workers’ medical fitness records', 'Crane inspection certificate', 'Civil liability insurance', 'Site supervisor appointment'];
  const all = PROJECTS.map((p) => {
    const h = hash(p.id), miss = p.miss, look = (h % 3 === 0 ? 1 : 0) + (miss && h % 2 ? 1 : 0), asked = 9 + (h % 9);
    const docs = { asked, ok: asked - miss - look, look, miss };
    return Object.assign({}, p, { h, docs, ongoing: !p.deadline, region: `${p.city}, ${p.district}`, role: p.own === 'owner' ? 'Owner' : 'Supplier',
      text: fold([p.id, p.name, p.client, p.sector, p.city, p.district].join(' ')) });
  });
  // what needs doing, for the drawer: the missing and expired ones, then those expiring before the work ends
  const itemsOf = (p) => {
    const out = [], end = p.ongoing ? NaN : Date.parse(p.deadline);
    for (let k = 0; k < p.docs.miss; k++) out.push({ name: POOL[(p.h + k) % POOL.length], sub: k % 2 ? 'Expired · the client can’t accept it' : 'Asked for by ' + p.client, b: k % 2 ? 'Expired' : 'Missing', cls: 'b-over' });
    for (let k = 0; k < p.docs.look; k++) {
      const t = new Date(Date.now() + (6 + ((p.h >> k) % 24)) * 864e5), w = Number.isNaN(end) || t < end ? t : new Date(Math.max(Date.now() + 864e5, end - 864e5));
      out.push({ name: POOL[(p.h + 5 + k) % POOL.length], sub: `Expires ${w.getDate()} ${MON[w.getMonth()]} ${w.getFullYear()}, while the work is on`, b: 'Expiring', cls: 'b-pend' });
    }
    return out;
  };
  // the worst first: the most missing, then the most to look at, then the nearest deadline
  const worst = (a, b) => b.docs.miss - a.docs.miss || b.docs.look - a.docs.look || (Date.parse(a.deadline) || 9e15) - (Date.parse(b.deadline) || 9e15);

  // ---- styles: the cards as on Documents, the table as the Documents tables, the drawer as a document's ----
  const css = `
.pj-cards { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; margin: 0 0 1.5rem; }
.pj-cards:empty { display: none; }
.pj-card { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.125rem 1.25rem; border: 1px solid var(--color-line); border-radius: 1rem; background: var(--color-surface);
  text-align: left; font: inherit; color: var(--color-ink); cursor: pointer; transition: border-color .14s ease, box-shadow .2s ease, transform .2s var(--ease-brand); }
.pj-card:hover { border-color: var(--color-sand-400); box-shadow: 0 8px 24px -14px rgba(52, 52, 52, .22); transform: translateY(-1px); }
.pj-card.is-on, .pj-card.is-on:hover { border-color: var(--color-ink-subtle); box-shadow: none; }
.pj-card-h { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; }
.pj-card-h svg { flex: none; width: 1.0625rem; height: 1.0625rem; color: var(--color-ink-subtle); }
.pj-card-n { font-size: 2.25rem; font-weight: 500; letter-spacing: -0.025em; line-height: 1; color: var(--color-ink); }
.pj-card-d { font-size: 0.8125rem; line-height: 1.4; color: var(--color-ink-subtle); }
.pj-card.is-ok .pj-card-n { color: var(--color-positive); }
.pj-card.is-pend .pj-card-n { color: var(--color-caution); }
.pj-card.is-bad .pj-card-n { color: var(--color-critical); }
@media (max-width: 52rem) { .pj-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 30rem) { .pj-cards { grid-template-columns: minmax(0, 1fr); } .pj-card-n { font-size: 1.875rem; } }
.pj-block { min-width: 0; }
/* the overview: its page numbers (js/table-pager.js) and View all projects on one row, as before */
@media (min-width: 48rem) { .pj-block > .pg-nav:not([hidden]) + .co-pager-row { margin-top: -1.8rem; } }
.pj-tbl { table-layout: fixed; min-width: 52rem; }
.pj-tbl th:nth-child(1) { width: 30%; } .pj-tbl th:nth-child(2) { width: 19%; } .pj-tbl th:nth-child(3) { width: 14%; }
.pj-tbl th:nth-child(4) { width: 12%; } .pj-tbl th:nth-child(5) { width: 11%; } .pj-tbl th:nth-child(6) { width: 14%; }
.pj-tbl th:last-child, .pj-tbl td:last-child { white-space: nowrap; }
.pj-tbl .n, .pj-tbl .d { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pj-tbl td:nth-child(5) { white-space: nowrap; }
.pj-tbl tbody tr.pj-row { cursor: pointer; transition: background-color .14s ease; }
.pj-tbl tbody tr.pj-row:hover, .pj-tbl tbody tr.pj-row:focus-visible { background: var(--color-light-beige); }
.pj-tbl tbody tr.pj-row:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: -2px; }
.pj-open { display: inline-grid; place-items: center; margin-left: 0.5rem; vertical-align: -3px; color: var(--color-ink-subtle); transition: transform .2s var(--ease-brand), color .14s ease; }
.pj-open svg { width: 1.125rem; height: 1.125rem; }
.pj-tbl tbody tr.pj-row:hover .pj-open { transform: translateX(3px); color: var(--color-coral-deep); }
.pj-none { padding: 2.5rem 0.75rem !important; color: var(--color-ink-subtle); cursor: default; }
.pj-empty { display: grid; justify-items: center; gap: 0.5rem; padding: 3rem 1.5rem; text-align: center; }
.pj-empty h3 { font-size: 1.125rem; font-weight: 600; }
.pj-empty p { max-width: 30rem; font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-muted); }
.pjd-card { padding: 1.25rem 1.5rem; border-radius: 0.75rem; background: var(--color-surface); }
.pjd-card > h4 { margin-bottom: 0.875rem; }
.pjd-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.5rem; }
.pjd-stat { display: grid; gap: 0.25rem; padding: 0.75rem 0.875rem; border: 1px solid var(--color-line); border-radius: 0.75rem; }
.pjd-stat b { font-size: 1.5rem; font-weight: 500; letter-spacing: -0.02em; line-height: 1; }
.pjd-stat span { font-size: 0.75rem; color: var(--color-ink-subtle); }
.pjd-stat.is-ok b { color: var(--color-positive); } .pjd-stat.is-pend b { color: var(--color-caution); } .pjd-stat.is-bad b { color: var(--color-critical); }
.pjd-list { margin: 1rem 0 0; padding: 0; list-style: none; border-top: 1px solid var(--color-mid-beige); }
.pjd-list li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--color-mid-beige); }
.pjd-list li:last-child { border-bottom: 0; padding-bottom: 0; }
.pjd-list .n { display: block; font-size: 0.875rem; font-weight: 500; }
.pjd-list .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.pjd-ok { margin-top: 1rem; font-size: 0.875rem; color: var(--color-ink-muted); }
.pjd-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.875rem 1.5rem; margin: 0; }
.pjd-facts dt { font-size: 0.75rem; color: var(--color-ink-subtle); }
.pjd-facts dd { margin: 0.125rem 0 0; font-size: 0.875rem; font-weight: 500; color: var(--color-ink); }
.pjd-facts dd small { display: block; font-size: 0.8125rem; font-weight: 400; color: var(--color-ink-subtle); }
.pjd-steps { display: flex; gap: 0.5rem; }
@media (max-width: 40rem) { .pjd-stats, .pjd-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (prefers-reduced-motion: reduce) { .pj-card, .pj-open, .pj-tbl tbody tr.pj-row { transition: none; } .pj-card:hover { transform: none; } }`;
  const style = document.createElement('style'); style.textContent = css; (document.head || document.documentElement).appendChild(style);

  const SVG = (d, vb = '0 0 24 24') => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICO = {
    all: '<path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>',
    ok: '<path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>',
    look: '<path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>',
    miss: '<path d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
    bag: '<path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/>',
  };
  const PREV = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>';
  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const TICK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>';
  const XS = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style="visibility:visible"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>';

  // the Documents column, as the Documents tables' Status: the worst first, and the chevron
  const badgeOf = (x) => (x.miss ? `<span class="co-badge b-over">${x.miss} missing</span>` : x.look ? `<span class="co-badge b-pend">${x.look} to look at</span>` : '<span class="co-badge b-ok">All valid</span>');
  const rowOf = (p) => `<tr class="pj-row" tabindex="0" role="link" data-pj="${esc(p.id)}" aria-label="${esc(p.name)}, ${esc(p.id)}: open the project">`
    + `<td><span class="n">${esc(p.name)}</span><span class="d">${esc(p.id)} &middot; ${p.role}</span></td>`
    + `<td><span class="n">${esc(p.client)}</span><span class="d">${esc(p.sector)}</span></td>`
    + `<td><span class="n">${esc(p.city)}</span><span class="d">${esc(p.district)}</span></td>`
    + `<td><span class="n">${pl(p.suppliers, 'supplier')}</span><span class="d">${pl(p.workers, 'worker')}</span></td>`
    + `<td>${p.ongoing ? '<span class="co-badge b-info">Ongoing</span>' : esc(p.deadline)}</td>`
    + `<td>${badgeOf(p.docs)}</td></tr>`;
  const HEAD = '<thead><tr><th>Project</th><th>Client</th><th>Region</th><th>Team</th><th>Deadline</th><th>Documents</th></tr></thead>';

  // ---- the drawer: how the project's documents stand and what to do, then the project itself ----
  let dw = null, list = () => [], at = -1, back = null;
  const drawer = () => {
    if (dw) return dw;
    dw = document.createElement('div'); dw.className = 'docd'; dw.hidden = true;
    dw.innerHTML = `<div class="docd-scrim" data-pjd-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="pjd-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${SVG(ICO.bag)}</span><div class="docd-t"><h3 id="pjd-t"></h3><p data-pjd-sub></p></div><button type="button" class="dlg-x" data-pjd-x aria-label="Close the project">${XI}</button></header>
      <div class="docd-bar"><span data-pjd-bar></span><span data-pjd-when></span></div>
      <div class="docd-body" data-pjd-body></div>
      <footer class="docd-foot"><span class="pjd-steps"><button type="button" class="docd-step" data-pjd-step="-1">${PREV}Previous project</button><button type="button" class="docd-step is-next" data-pjd-step="1">Next project${PREV}</button></span><span data-pjd-of></span></footer>
    </aside>`;
    document.body.appendChild(dw);
    dw.addEventListener('click', (e) => {
      if (e.target.closest('[data-pjd-x]')) { close(); return; }
      const s = e.target.closest('[data-pjd-step]'); if (s && !s.disabled) { at += +s.dataset.pjdStep; paintDrawer(); }
    });
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !dw.hidden && dw.classList.contains('is-open')) close(); });
    return dw;
  };
  const paintDrawer = () => {
    const l = list(), p = l[at]; if (!p) return;
    const x = p.docs, its = itemsOf(p), q = (s) => dw.querySelector(s);
    q('#pjd-t').textContent = p.name;
    q('[data-pjd-sub]').textContent = `${p.id} · ${p.client}`;
    q('[data-pjd-bar]').textContent = p.own === 'owner' ? 'Your project' : `You supply ${p.client}`;
    q('[data-pjd-when]').textContent = p.ongoing ? 'Ongoing' : 'Deadline ' + p.deadline;
    const stat = (cls, n, label) => `<div class="pjd-stat${cls}"><b>${n}</b><span>${label}</span></div>`;
    q('[data-pjd-body]').innerHTML = `<section class="pjd-card"><h4 class="eyebrow">Documents for this project</h4>
        <div class="pjd-stats">${stat('', x.asked, 'Asked for')}${stat(' is-ok', x.ok, 'Valid')}${stat(' is-pend', x.look, 'Needs a look')}${stat(' is-bad', x.miss, 'Not compliant')}</div>
        ${its.length ? `<ul class="pjd-list">${its.map((it) => `<li><span><span class="n">${esc(it.name)}</span><span class="d">${esc(it.sub)}</span></span><span class="co-badge ${it.cls}">${it.b}</span></li>`).join('')}</ul>
        <p class="pjd-ok"><a class="co-link" href="company-details.html">Sort them out in Documents</a>, or drop the files on ALMA.</p>` : `<p class="pjd-ok">Every document ${esc(p.client)} asks for here is valid.</p>`}</section>
      <section class="pjd-card"><h4 class="eyebrow">About the project</h4><dl class="pjd-facts">
        <div><dt>Client</dt><dd>${esc(p.client)}<small>${esc(p.sector)}</small></dd></div>
        <div><dt>Your role</dt><dd>${p.role}<small>${p.own === 'owner' ? 'You run the site' : 'Working for ' + esc(p.client)}</small></dd></div>
        <div><dt>Region</dt><dd>${esc(p.city)}<small>${esc(p.district)}</small></dd></div>
        <div><dt>Deadline</dt><dd>${p.ongoing ? 'Ongoing' : esc(p.deadline)}</dd></div>
        <div><dt>Suppliers</dt><dd>${pl(p.suppliers, 'supplier')}</dd></div>
        <div><dt>Workers</dt><dd>${pl(p.workers, 'worker')}</dd></div>
      </dl></section>`;
    q('[data-pjd-body]').scrollTop = 0;
    q('[data-pjd-of]').textContent = `${at + 1} of ${l.length}`;
    q('[data-pjd-step="-1"]').disabled = at === 0;
    q('[data-pjd-step="1"]').disabled = at === l.length - 1;
  };
  const open = (p, from) => {
    drawer(); list = from; at = list().indexOf(p); if (at < 0) return;
    back = document.activeElement; paintDrawer();
    dw.hidden = false; void dw.offsetWidth; dw.classList.add('is-open'); document.documentElement.style.overflow = 'hidden';
    setTimeout(() => dw.querySelector('.docd-panel').focus({ preventScroll: true }), 30);
  };
  const close = () => {
    if (!dw || dw.hidden) return;
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { if (!dw.classList.contains('is-open')) dw.hidden = true; }, 320);
    if (back && back.isConnected && back !== document.body) back.focus({ preventScroll: true }); else if (dw.contains(document.activeElement)) document.activeElement.blur();
  };
  // a row opens its project, by click or Enter / Space
  const wireRows = (body, from) => {
    const hit = (e) => { const r = e.target.closest('tr.pj-row'); return r && all.find((p) => p.id === r.dataset.pj); };
    body.addEventListener('click', (e) => { if (e.target.closest('a, button')) return; const p = hit(e); if (p) open(p, from); });
    body.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; const p = hit(e); if (!p) return; e.preventDefault(); open(p, from); });
  };

  // ---- the pages ----
  const start = () => {
    const table = document.querySelector('[data-pj-table]'); if (!table) return;
    // only the projects the viewer's groups give them (js/access.js)
    const mine = all.filter((p) => !(window.CMAccess && window.CMAccess.sees) || window.CMAccess.sees('projects', p.id));
    const attention = table.dataset.pjMode === 'attention';
    const card = table.closest('.co-tbl-card');
    if (!attention) {
      // Beatriz's company has products, not projects: her own page
      if (persona() === 'beatriz') { location.replace('my-company.html?filled#products'); return; }
      const bk = document.getElementById('pj-back'); if (bk) bk.addEventListener('click', () => { location.href = 'my-company.html?filled'; });
    }
    if (!hasProjects()) {
      // none yet: on the overview the section goes; on Projects, what will be here
      const sec = table.closest('section');
      if (attention) { if (sec) sec.hidden = true; return; }
      document.querySelectorAll('[data-pj-cards], [data-pj-tools], [data-pj-pills], [data-pj-pager-row]').forEach((n) => { n.hidden = true; });
      card.innerHTML = `<div class="pj-empty"><span class="docd-ico" aria-hidden="true">${SVG(ICO.bag)}</span><h3>No projects yet</h3><p>When a client adds your company to one of their projects, or you start one of your own, it shows here with the documents it asks of you.</p></div>`;
      return;
    }
    table.innerHTML = HEAD + '<tbody></tbody>';
    const body = table.tBodies[0];

    if (attention) {
      // the company overview: only what needs attention, the worst first
      const need = mine.filter((p) => p.docs.miss || p.docs.look).sort(worst);
      body.innerHTML = need.length ? need.map(rowOf).join('') : '<tr><td colspan="6" class="pj-none">Every project&rsquo;s documents are in order.</td></tr>';
      const n = document.querySelector('[data-pj-need]'); if (n) n.textContent = need.length ? `${pl(need.length, 'project')} of ${mine.length} need${need.length === 1 ? 's' : ''} attention` : `All ${mine.length} projects are in order`;
      wireRows(body, () => need);
      return;
    }

    // ---- Projects: cards, search, Filter, ten to a page ----
    const cardsEl = document.querySelector('[data-pj-cards]'), tools = document.querySelector('[data-pj-tools]');
    const pills = document.querySelector('[data-pj-pills]'), nav = document.querySelector('[data-pj-pager]');
    // options in a group widen (any of them), groups narrow (all of them)
    const GROUPS = [
      ['Ownership', 'own', (p) => p.role],
      ['Region', 'region', (p) => p.region],
      ['Deadline', 'when', (p) => (p.ongoing ? 'Ongoing' : 'With a deadline')],
      ['Documents', 'docs', (p) => (p.docs.miss || p.docs.look ? [p.docs.look && DOCST.look, p.docs.miss && DOCST.miss].filter(Boolean) : [DOCST.ok])],
    ];
    const f = { q: '', own: new Set(), region: new Set(), when: new Set(), docs: new Set() };
    const vals = (p, fn) => [].concat(fn(p));
    const keep = (p, skip) => (!f.q || p.text.includes(f.q)) && GROUPS.every(([, k, fn]) => k === skip || !f[k].size || vals(p, fn).some((v) => f[k].has(v)));
    const nOn = () => GROUPS.reduce((n, [, k]) => n + f[k].size, 0);
    const shown = () => mine.filter((p) => keep(p));
    let page = 1, panel = null, btn = null;

    // the cards, as on Documents: on only when its filter is the only one, with no search
    const paintCards = () => {
      if (!cardsEl) return;
      const sum = (k) => mine.reduce((n, p) => n + p.docs[k], 0);
      const on = f.docs.size === 1 && nOn() === 1 && !f.q ? [...f.docs][0] : null;
      const c = (key, cls, label, n, sub) => {
        const v = key === 'all' ? '' : DOCST[key], cur = !!v && v === on;
        return `<button type="button" class="pj-card${cls}${cur ? ' is-on' : ''}" data-pj-card="${v}" role="listitem"${v ? ` aria-pressed="${cur}"` : ''}>
          <span class="pj-card-h">${SVG(ICO[key])}<span>${label}</span></span><span class="pj-card-n">${n}</span><span class="pj-card-d">${sub}</span></button>`;
      };
      cardsEl.innerHTML = c('all', '', 'Asked for', sum('asked'), 'Every document asked of you, across your projects.')
        + c('ok', ' is-ok', 'Valid', sum('ok'), 'Valid, or marked not applicable with a reason.')
        + c('look', ' is-pend', 'Needs a look', sum('look'), 'Expiring, being read, or waiting on you.')
        + c('miss', ' is-bad', 'Not compliant', sum('miss'), 'Missing, expired or rejected.');
    };
    const paint = () => {
      if (!panel) return;
      panel.innerHTML = '<div class="co-filt-list">' + GROUPS.map(([label, k, fn], gi) => {
        const opts = [...new Set(mine.flatMap((p) => vals(p, fn)))].sort();
        return (gi ? '<div class="co-menu-sep" role="separator"></div>' : '') + `<div class="co-menu-h">${label}</div>` + opts.map((v) => {
          const n = mine.filter((p) => keep(p, k) && vals(p, fn).includes(v)).length;
          return `<button type="button" class="co-menu-i" role="menuitemcheckbox" aria-checked="${f[k].has(v)}" data-k="${k}" data-v="${esc(v)}"><span class="co-menu-c">${TICK}</span>${esc(v)}<small>${n}</small></button>`;
        }).join('');
      }).join('') + `<div class="co-menu-sep" role="separator"></div><button type="button" class="co-menu-i" role="menuitem" data-clear${nOn() ? '' : ' disabled'}><span class="co-menu-c">${XS}</span>Clear filters</button></div>`;
    };
    const go = (n, focus) => {
      const l = shown(), pages = Math.max(1, Math.ceil(l.length / PER));
      page = Math.min(pages, Math.max(1, n));
      body.innerHTML = l.length ? l.slice((page - 1) * PER, page * PER).map(rowOf).join('')
        : '<tr><td colspan="6" class="co-tbl-none">No project matches that. <button type="button" class="link-btn" data-clear>Clear the search and filters</button></td></tr>';
      paintCards();
      if (pills) {
        const on = GROUPS.flatMap(([label, k]) => [...f[k]].map((v) => [label, k, v]));
        pills.hidden = !on.length;
        pills.innerHTML = on.map(([label, k, v]) => `<button type="button" class="co-pill" data-k="${k}" data-v="${esc(v)}" aria-label="Remove filter ${label}: ${esc(v)}"><span>${label}:</span><b>${esc(v)}</b><i aria-hidden="true">×</i></button>`).join('');
      }
      if (tools) { const k = nOn(), el = tools.querySelector('[data-filt-n]'); el.hidden = !k; el.textContent = k; tools.querySelector('.co-tools-clear').hidden = !(k || f.q); }
      if (nav) {
        nav.hidden = pages < 2;
        nav.innerHTML = pages > 1 ? `<span class="co-pager-btns"><button type="button" class="co-pager-arrow" data-to="${page - 1}"${page === 1 ? ' disabled' : ''} aria-label="Previous page"><span aria-hidden="true">←</span> Previous</button>`
          + Array.from({ length: pages }, (_, k) => `<button type="button" data-to="${k + 1}"${k + 1 === page ? ' aria-current="page"' : ''} aria-label="Page ${k + 1}">${k + 1}</button>`).join('')
          + `<button type="button" class="co-pager-arrow" data-to="${page + 1}"${page === pages ? ' disabled' : ''} aria-label="Next page">Next <span aria-hidden="true">→</span></button></span>` : '';
        if (focus) { const b = nav.querySelector('[aria-current="page"]'); if (b) b.focus({ preventScroll: true }); }
      }
    };
    const clear = () => { f.q = ''; GROUPS.forEach(([, k]) => f[k].clear()); if (tools) tools.querySelector('[data-q]').value = ''; go(1); if (panel && !panel.hidden) paint(); };
    if (tools) {
      panel = tools.querySelector('[data-filt-panel]'); btn = tools.querySelector('[data-filt-btn]');
      const show = (on) => { panel.hidden = !on; btn.setAttribute('aria-expanded', String(on)); if (on) { paint(); panel.firstElementChild.scrollTop = 0; } };
      btn.addEventListener('click', (e) => { e.stopPropagation(); show(panel.hidden); if (!panel.hidden && e.detail === 0) panel.querySelector('.co-menu-i').focus({ preventScroll: true }); });
      panel.addEventListener('click', (e) => {
        e.stopPropagation();
        const i = e.target.closest('.co-menu-i'); if (!i || i.disabled) return;
        if (i.hasAttribute('data-clear')) { clear(); panel.querySelector('.co-menu-i').focus(); return; }
        const { k, v } = i.dataset, top = panel.firstElementChild.scrollTop; f[k].has(v) ? f[k].delete(v) : f[k].add(v); go(1); paint(); panel.firstElementChild.scrollTop = top;
        const again = panel.querySelector(`[data-k="${k}"][data-v="${CSS.escape(v)}"]`); if (again) again.focus();
      });
      panel.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const items = [...panel.querySelectorAll('.co-menu-i:not(:disabled)')], i = items.indexOf(document.activeElement);
        items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
      });
      document.addEventListener('click', (e) => { if (!tools.contains(e.target)) show(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { show(false); btn.focus(); } });
      tools.querySelector('[data-q]').addEventListener('input', (e) => { f.q = fold(e.target.value.trim()); go(1); if (!panel.hidden) paint(); });
      tools.addEventListener('click', (e) => { if (e.target.closest('.co-tools-clear')) clear(); });
    }
    body.addEventListener('click', (e) => { if (e.target.closest('[data-clear]')) clear(); });
    if (pills) pills.addEventListener('click', (e) => {
      const p = e.target.closest('.co-pill'); if (!p) return;
      f[p.dataset.k].delete(p.dataset.v); go(1); if (panel && !panel.hidden) paint();
      const next = pills.querySelector('.co-pill'); (next || btn).focus();
    });
    // a card filters the table to the projects concerned, again to clear it; Asked for clears everything
    if (cardsEl) cardsEl.addEventListener('click', (e) => {
      const c = e.target.closest('[data-pj-card]'); if (!c) return;
      const v = c.dataset.pjCard, was = c.classList.contains('is-on');
      clear(); if (v && !was) { f.docs.add(v); go(1); }
      if (panel && !panel.hidden) paint();
      const again = cardsEl.querySelector(`[data-pj-card="${v}"]`); if (again) again.focus({ preventScroll: true });
    });
    if (nav) nav.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-to]'); if (!b || b.disabled) return;
      // the page numbers stay where they were on screen (no jump to the table's top)
      const was = nav.getBoundingClientRect().top;
      go(+b.dataset.to, true);
      const d = nav.getBoundingClientRect().top - was; if (Math.abs(d) > 0.5) scrollTo({ top: scrollY + d, behavior: 'instant' });
    });
    wireRows(body, shown);
    // arriving with a filter (the overview's "View all"): ?docs=Not compliant
    const want = new URLSearchParams(location.search).get('docs');
    if (want && Object.values(DOCST).includes(want)) f.docs.add(want);
    go(1);
    // arriving at one project (?project=FC-2026-031)
    const one = all.find((p) => p.id === new URLSearchParams(location.search).get('project'));
    if (one && shown().includes(one)) setTimeout(() => open(one, shown), 200);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.CMProjects = { all: () => all.slice(), open: (id) => { const p = all.find((x) => x.id === id); if (p) open(p, () => all); } };
})();
