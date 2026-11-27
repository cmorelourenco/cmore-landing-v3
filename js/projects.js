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
    {id: 'FC-2026-031', name: 'São João Hospital, east wing', own: 'owner', client: 'ULS São João', sector: 'Hospital', city: 'Porto', district: 'Porto', suppliers: 6, workers: 42, start: '12 Jan 2026', deadline: '18 Dec 2026', miss: 2},
    {id: 'FC-2026-018', name: 'EN13 resurfacing, Vila do Conde', own: 'owner', client: 'Infraestruturas de Portugal', sector: 'Roads & Bridges', city: 'Vila do Conde', district: 'Porto', suppliers: 4, workers: 28, start: '3 Mar 2026', deadline: '', miss: 0},
    {id: 'FC-2025-047', name: 'Garcia de Orta secondary school renovation', own: 'owner', client: 'Parque Escolar', sector: 'Education', city: 'Porto', district: 'Porto', suppliers: 3, workers: 19, start: '8 Sep 2025', deadline: '15 Jan 2027', miss: 1},
    {id: 'FC-2026-052', name: 'Quinta da Boavista apartments', own: 'owner', client: 'Boavista Living, S.A.', sector: 'Residential', city: 'Porto', district: 'Porto', suppliers: 5, workers: 33, start: '20 Apr 2026', deadline: '', miss: 0},
    {id: 'ME-2026-112', name: 'Data centre shell, Building B', own: 'supplier', client: 'Mota‑Engil', sector: 'General contractor', city: 'Matosinhos', district: 'Porto', suppliers: 9, workers: 12, start: '2 Feb 2026', deadline: '30 Nov 2026', miss: 1},
    {id: 'CF-2026-027', name: 'Clinic fit-out, level 3', own: 'supplier', client: 'CUF', sector: 'Healthcare', city: 'Porto', district: 'Porto', suppliers: 7, workers: 8, start: '15 Jun 2026', deadline: '', miss: 0},
    {id: 'SN-2026-064', name: 'Warehouse expansion', own: 'supplier', client: 'Sonae MC', sector: 'Logistics', city: 'Maia', district: 'Porto', suppliers: 11, workers: 6, start: '7 Jan 2027', deadline: '28 Feb 2027', miss: 2},
    {id: 'FC-2026-044', name: 'NorteShopping parking deck', own: 'owner', client: 'Sonae Sierra', sector: 'Retail', city: 'Matosinhos', district: 'Porto', suppliers: 7, workers: 51, start: '1 Sep 2026', deadline: '30 Jun 2027', miss: 1},
    {id: 'FC-2026-009', name: 'Riverside office fit-out', own: 'owner', client: 'Douro Riverside Development', sector: 'Commercial', city: 'Vila Nova de Gaia', district: 'Porto', suppliers: 4, workers: 22, start: '5 Jan 2026', deadline: '15 Nov 2026', miss: 0},
    {id: 'ME-2026-131', name: 'Data centre shell, Building C', own: 'supplier', client: 'Mota‑Engil', sector: 'General contractor', city: 'Matosinhos', district: 'Porto', suppliers: 10, workers: 14, start: '11 Jan 2027', deadline: '', miss: 0},
    {id: 'FC-2025-061', name: 'Maia fire station no. 2', own: 'owner', client: 'Câmara Municipal da Maia', sector: 'Public safety', city: 'Maia', district: 'Porto', suppliers: 5, workers: 26, start: '10 Nov 2025', deadline: '20 Dec 2026', miss: 2},
    {id: 'FC-2026-023', name: 'Almeida Garrett library expansion', own: 'owner', client: 'Câmara Municipal do Porto', sector: 'Civic', city: 'Porto', district: 'Porto', suppliers: 4, workers: 18, start: '18 May 2026', deadline: '31 Mar 2027', miss: 0},
    {id: 'CS-2026-008', name: 'Lever water treatment upgrade', own: 'supplier', client: 'Casais', sector: 'General contractor', city: 'Vila Nova de Gaia', district: 'Porto', suppliers: 12, workers: 9, start: '9 Mar 2026', deadline: '14 May 2027', miss: 1},
    {id: 'FC-2026-058', name: 'Gondomar medical offices', own: 'owner', client: 'Lusíadas Saúde', sector: 'Healthcare', city: 'Gondomar', district: 'Porto', suppliers: 6, workers: 30, start: '4 Jan 2027', deadline: '', miss: 0},
    {id: 'CF-2026-033', name: 'Imaging suite, ground floor', own: 'supplier', client: 'CUF', sector: 'Healthcare', city: 'Porto', district: 'Porto', suppliers: 5, workers: 7, start: '1 Jul 2026', deadline: '12 Dec 2026', miss: 0},
    {id: 'FC-2026-036', name: 'Campanhã station canopy', own: 'owner', client: 'Metro do Porto', sector: 'Transport', city: 'Porto', district: 'Porto', suppliers: 3, workers: 15, start: '14 Sep 2026', deadline: '28 Feb 2027', miss: 1},
    {id: 'AB-2026-090', name: 'School gym, Braga', own: 'supplier', client: 'ABB – Alexandre Barbosa Borges', sector: 'General contractor', city: 'Braga', district: 'Braga', suppliers: 8, workers: 10, start: '1 Feb 2027', deadline: '30 Aug 2027', miss: 0},
    {id: 'FC-2025-052', name: 'Valongo community centre', own: 'owner', client: 'Câmara Municipal de Valongo', sector: 'Civic', city: 'Valongo', district: 'Porto', suppliers: 4, workers: 17, start: '6 Oct 2025', deadline: '10 Nov 2026', miss: 0},
    {id: 'SN-2026-071', name: 'Cold storage annex', own: 'supplier', client: 'Sonae MC', sector: 'Logistics', city: 'Maia', district: 'Porto', suppliers: 9, workers: 5, start: '18 Jan 2027', deadline: '', miss: 1},
    {id: 'FC-2026-061', name: 'Póvoa seafront boardwalk repairs', own: 'owner', client: 'Câmara Municipal da Póvoa de Varzim', sector: 'Civic', city: 'Póvoa de Varzim', district: 'Porto', suppliers: 3, workers: 12, start: '1 Mar 2026', deadline: '15 May 2027', miss: 0},
    {id: 'TD-2026-014', name: 'Leixões cruise terminal works', own: 'supplier', client: 'Teixeira Duarte', sector: 'General contractor', city: 'Matosinhos', district: 'Porto', suppliers: 14, workers: 11, start: '2 Feb 2026', deadline: '30 Sep 2027', miss: 0},
    {id: 'FC-2026-064', name: 'Valongo logistics platform slab', own: 'owner', client: 'Plataforma Logística de Valongo', sector: 'Logistics', city: 'Valongo', district: 'Porto', suppliers: 2, workers: 9, start: '25 Aug 2026', deadline: '', miss: 0},
    {id: 'FC-2026-067', name: 'Braga clinic renovation', own: 'owner', client: 'Hospital de Braga', sector: 'Healthcare', city: 'Braga', district: 'Braga', suppliers: 5, workers: 20, start: '13 Oct 2025', deadline: '31 Jan 2027', miss: 1},
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
    if (persona() === 'beatriz' || ['beatriz', 'walmart', 'ajlee'].includes(document.documentElement.dataset.persona)) return false; // (nor the hidden test users)
    let org = 'home', email = '';
    try { org = JSON.parse(ss('cm-org') || '"home"') || 'home'; } catch (e) {}
    try { email = (JSON.parse(ss('cm-person') || 'null') || {}).email || ''; } catch (e) {}
    return org === 'home' && !/^test@c-more\.test$/i.test(email);
  };
  // the projects started here (new-project.html), kept for the tab, per company: on top of the demo's,
  // and any company's own (the test user's, a company added in this session)
  const ADD_KEY = (() => {
    let org = 'home', email = '';
    try { org = JSON.parse(ss('cm-org') || '"home"') || 'home'; } catch (e) {}
    try { email = (JSON.parse(ss('cm-person') || 'null') || {}).email || ''; } catch (e) {}
    const test = /^test@c-more\.test$/i.test(email);
    return 'cm-pj-added' + (org === 'home' && !test ? '' : `-${test ? 'test-' : ''}${org}`);
  })();
  const added = () => { if (['beatriz', 'walmart', 'ajlee'].includes(document.documentElement.dataset.persona)) return []; try { return JSON.parse(ss(ADD_KEY) || '[]') || []; } catch (e) { return []; } };

  // ---- each project's documents ----
  const DOCST = { ok: 'Valid', look: 'Needs a look', miss: 'Not compliant' };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const POOL = ['Work accident insurance', 'Social Security clearance certificate', 'Tax clearance certificate', 'Construction licence (alvará)',
    'Health and safety plan for the site', 'Workers’ medical fitness records', 'Crane inspection certificate', 'Civil liability insurance', 'Site supervisor appointment'];
  // a new project's region, with its country when it isn't in Portugal
  const where = (p) => (p.country && p.country !== 'Portugal' ? `${p.district}, ${p.country}` : p.district);
  // the people on a new project, each with a role (an earlier one kept just its project manager, or its owner)
  const peopleOf = (p) => p.people || [{ role: 'Project manager', name: (p.pm && p.pm.name) || p.pm || p.owner || '', invited: !!(p.pm && p.pm.invited) }];
  // ---- a client's project, as its supplier sees it -------------------------------------------------
  // who the work is for (the project's client) and who added you: the company in the Client column
  const FOR = { 'ME-2026-112': 'Atlântico Data Centres, S.A.', 'ME-2026-131': 'Atlântico Data Centres, S.A.', 'CF-2026-027': 'CUF', 'CF-2026-033': 'CUF', 'SN-2026-064': 'Sonae MC', 'SN-2026-071': 'Sonae MC',
    'CS-2026-008': 'Águas do Douro e Paiva', 'AB-2026-090': 'Câmara Municipal de Braga', 'TD-2026-014': 'APDL, Port of Leixões' };
  // the two that just added you (the bell says so, js/project-notify.js): nothing of yours on them yet
  const NOTIFIED = ['ME-2026-131', 'SN-2026-071'];
  // what you put on a client's project: your suppliers, and the workers, machines and materials you
  // bring, each with the documents you share for it (null: all it has on file). Kept for the tab; until
  // you change it, the ones you'd already been on carry some of your crew and machines
  const TEAM_KEY = (id) => 'cm-pj-team-' + id;
  const teamOf = (p) => {
    try { const t = JSON.parse(ss(TEAM_KEY(p.id)) || 'null'); if (t) return t; } catch (e) {}
    const h = hash(p.id), pick = (n, of, step) => Array.from({ length: Math.min(n, of) }, (_, k) => ({ i: (h + k * step) % of, share: null }));
    if (NOTIFIED.includes(p.id)) return { subs: [], workers: [], equipment: [], products: [] };
    return { subs: [], workers: pick(p.workers, 24, 7), equipment: pick(1 + (h % 3), 12, 5), products: pick(1 + (h % 2), 6, 1) };
  };
  const saveTeam = (id, t) => { try { sessionStorage.setItem(TEAM_KEY(id), JSON.stringify(t)); } catch (e) {} };

  // a project's details as you edited them on its page (project.html, Edit project): kept for the tab
  const EDIT_KEY = 'cm-pj-edit';
  const edits = () => { try { return JSON.parse(ss(EDIT_KEY) || '{}') || {}; } catch (e) { return {}; } };
  const saveEdit = (id, patch) => { const e = edits(); e[id] = Object.assign(e[id] || {}, patch); try { sessionStorage.setItem(EDIT_KEY, JSON.stringify(e)); } catch (err) {} };
  const E0 = edits(), ed = (p) => Object.assign({}, p, E0[p.id] || {});
  const all = added().map(ed).map((p) => Object.assign({}, p, { h: hash(p.id), own: 'owner', isNew: true, docs: { asked: 0, ok: 0, look: 0, miss: 0 }, ongoing: !p.deadline, region: where(p), role: 'Owner',
    suppliers: (p.sups || []).length, workers: 0, text: fold([p.id, p.name, p.client, ...peopleOf(p).map((x) => x.name), p.city, p.district, p.country].concat((p.sups || []).map((x) => x.name)).join(' ')) }))
    .concat((hasProjects() ? PROJECTS : []).map(ed).map((p) => {
    const h = hash(p.id), miss = p.miss, look = (h % 3 === 0 ? 1 : 0) + (miss && h % 2 ? 1 : 0), asked = 9 + (h % 9);
    const docs = { asked, ok: asked - miss - look, look, miss };
    // a client's project: the Team column counts what you put on it (you don't see the rest of the team)
    const mine = p.own === 'supplier' ? teamOf(p) : null;
    return Object.assign({}, p, { h, docs, ongoing: !p.deadline, region: `${p.city}, ${p.district}`, role: p.own === 'owner' ? 'Owner' : 'Supplier',
      forClient: FOR[p.id] || p.client, isNotified: NOTIFIED.includes(p.id), ...(mine ? { suppliers: mine.subs.length, workers: mine.workers.length } : {}),
      text: fold([p.id, p.name, p.client, p.sector, p.city, p.district].join(' ')) });
  }));
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
  // where a project is: not started, ongoing or finalized, by its dates; on hold when you say so on its page
  const HOLD_KEY = 'cm-pj-hold';
  const holds = () => { try { return JSON.parse(ss(HOLD_KEY) || '{}') || {}; } catch (e) { return {}; } };
  const setHold = (id, on) => { const h = holds(); if (on) h[id] = Date.now(); else delete h[id]; try { sessionStorage.setItem(HOLD_KEY, JSON.stringify(h)); } catch (e) {} };
  const STATUS = { notstarted: ['Not started', 'is-notyet'], ongoing: ['Ongoing', 'is-ok'], hold: ['On hold', 'is-hold'], finalized: ['Finalized', 'is-done'] };
  const statusOf = (p) => {
    const day = new Date(); day.setHours(0, 0, 0, 0);
    const s = Date.parse(p.start), e = Date.parse(p.deadline);
    if (!Number.isNaN(e) && e < day) return 'finalized';
    if (holds()[p.id]) return 'hold';
    return !Number.isNaN(s) && s > day ? 'notstarted' : 'ongoing';
  };
  // the table: the dot alone (its name on hover, and for screen readers); the project's page: the dot and its name
  const statusHtml = (p, dotOnly) => { const [l, c] = STATUS[statusOf(p)]; return dotOnly ? `<span class="cd-dot ${c}" title="${l}" aria-hidden="true"></span><span class="sr-only">${l}</span>` : `<span class="pj-st"><span class="cd-dot ${c}" aria-hidden="true"></span>${l}</span>`; };
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
.pj-k { font: inherit; color: inherit; text-align: left; cursor: pointer; }
.pj-k.is-on, .pj-k.is-on:hover { border-color: var(--color-ink-subtle); box-shadow: none; transform: none; }
.pj-k .co-k-chip.is-neu, .pj-k .co-k-chip.is-zero { background: var(--color-mid-beige); color: var(--color-ink-subtle); }
.pj-block { min-width: 0; }
.pj-tbl { table-layout: fixed; min-width: 60rem; }
.pj-tbl th:nth-child(1) { width: 30%; } .pj-tbl th:nth-child(2) { width: 18%; } .pj-tbl th:nth-child(3) { width: 10%; }
.pj-tbl th:nth-child(4) { width: 10%; } .pj-tbl th:nth-child(5) { width: 11%; } .pj-tbl th:nth-child(6) { width: 8%; } .pj-tbl th:nth-child(7) { width: 13%; }
.pj-legend { margin: 0.75rem 0 0; }
.pj-tbl td:nth-child(3), .pj-tbl td:nth-child(4), .pj-tbl td:nth-child(6) { white-space: nowrap; }
/* a project's status, as the matrices' dots; on hold a pause button */
.pj-st { display: inline-flex; align-items: center; gap: 0.5rem; white-space: nowrap; }
.cd-dot.is-notyet { background: var(--color-graphite); }
.cd-dot.is-done { background: var(--color-sand-400, #c3c0b8); }
.cd-dot.is-hold { background: linear-gradient(#fff, #fff) 3px 50% / 2px 6px no-repeat, linear-gradient(#fff, #fff) calc(100% - 3px) 50% / 2px 6px no-repeat, #e7b04a; }
.pj-tbl th:last-child, .pj-tbl td:last-child { white-space: nowrap; }
.pj-tbl .n, .pj-tbl .d { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
/* Owner or Supplier, beside the project's ID: a small tag */
.pj-tbl .pj-role { height: 1.25rem; margin-left: 0.375rem; padding: 0 0.375rem; font-size: 0.6875rem; line-height: 1.25rem; vertical-align: 1px; }
/* your own projects in a soft lilac, a client's in the grey: as light as each other, and no status's colour */
html .pj-tbl .pj-role.is-owner { background: #ebe4f3; color: #5b3f86; }
/* a new project (added recently, or you were just added to it): a coral edge down the row's left */
.pj-tbl tbody tr.is-new td:first-child { box-shadow: inset 3px 0 0 var(--color-coral); }
html[data-theme="dark"] .pj-tbl .pj-role.is-owner { background: #66508c; color: #f4efff; }
/* every column head sorts the table, as the project page's tables (.cd-sort, css/esg.css) */
.pj-tbl th .cd-sort { white-space: nowrap; }
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
.pjd-sups { margin: 0; padding: 0; list-style: none; }
.pjd-sups li { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid var(--color-mid-beige); }
.pjd-sups li:first-child { padding-top: 0; } .pjd-sups li:last-child { border-bottom: 0; padding-bottom: 0; }
.pjd-sups .n { display: block; font-size: 0.875rem; font-weight: 500; }
.pjd-sups .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.pjd-sups .w { flex: none; font-size: 0.8125rem; color: var(--color-ink-subtle); text-align: right; white-space: nowrap; }
/* New project: as My suppliers' Add a supplier */
.pj-add { display: inline-flex; align-items: center; gap: 0.5rem; height: 2.5rem; padding: 0 1.125rem; border: 0; border-radius: 0.625rem; background: var(--color-graphite); color: var(--color-off-white); font: inherit; font-size: 0.875rem; font-weight: 600; text-decoration: none; cursor: pointer; transition: background-color .15s, transform .15s; }
.pj-add:hover { background: var(--color-ink); color: var(--color-off-white); transform: translateY(-1px); }
.pj-add:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.pj-add svg { width: 1rem; height: 1rem; }
.pj-empty .pj-add { margin-top: 0.5rem; }
.pj-toast { position: fixed; left: 50%; bottom: 1.5rem; z-index: 120; transform: translateX(-50%); padding: 0.75rem 1.125rem; border-radius: 0.75rem; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.875rem; box-shadow: 0 12px 32px -16px rgba(0,0,0,.5); }
@media (max-width: 40rem) { .pjd-stats, .pjd-facts { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (prefers-reduced-motion: reduce) { .pj-card, .pj-open, .pj-tbl tbody tr.pj-row { transition: none; } .pj-card:hover { transform: none; } }`;
  const style = document.createElement('style'); style.textContent = css; (document.head || document.documentElement).appendChild(style);

  const SVG = (d, vb = '0 0 24 24') => `<svg viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  const ICO = {
    play: '<path d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/>',
    flag: '<path d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"/>',
    all: '<path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>',
    ok: '<path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"/>',
    look: '<path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>',
    miss: '<path d="M12 9v3.75m0 3.75h.008v.008H12v-.008ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
    bag: '<path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/>',
  };
  const TICK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>';
  const XS = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" style="visibility:visible"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>';

  // the Documents column, as the Documents tables' Status: the worst first, and the chevron
  const badgeOf = (x) => (!x.asked ? '<span class="co-badge b-neu">None asked yet</span>' : x.miss ? `<span class="co-badge b-over">${x.miss} missing</span>` : x.look ? `<span class="co-badge b-pend">${x.look} to look at</span>` : '<span class="co-badge b-ok">All valid</span>');
  const rowOf = (p) => `<tr class="pj-row${p.isNew || p.isNotified ? ' is-new' : ''}" tabindex="0" role="link" data-pj="${esc(p.id)}" aria-label="${esc(p.name)}, ${esc(p.id)}${p.isNew || p.isNotified ? ', new' : ''}: open the project">`
    + `<td${p.isNew || p.isNotified ? ` title="${p.isNotified ? 'New: you were just added to it' : 'New: added recently'}"` : ''}><span class="n">${esc(p.name)}${p.isNew || p.isNotified ? '<span class="sr-only"> (new)</span>' : ''}</span><span class="d">${esc(p.id)}<span class="co-badge pj-role ${p.role === 'Owner' ? 'is-owner' : 'b-neu'}">${p.role}</span></span></td>`
    + `<td><span class="n">${esc(p.client)}</span><span class="d">${esc(p.sector || '')}</span></td>`
    + `<td>${p.start ? esc(p.start) : '<span class="cd-dash">&mdash;</span>'}</td>`
    + `<td>${p.deadline ? esc(p.deadline) : '<span class="cd-dash" title="No end date set">&mdash;</span>'}</td>`
    + `<td><span class="n">${pl(p.suppliers, 'supplier')}</span><span class="d">${pl(p.workers, 'worker')}</span></td>`
    + `<td>${statusHtml(p, true)}</td>`
    + `<td>${badgeOf(p.docs)}</td></tr>`;
  // the columns, and what each sorts by (nothing to sort by goes last, either way)
  const day = (t) => { const v = Date.parse(t); return Number.isNaN(v) ? null : v; };
  const COLS = [
    // the project: the newest first (the ones you just started, the newest of them first; then the ones
    // you were just added to; then by the year and number in its ID), again the oldest first
    ['project', 'Project', (p) => {
      if (p.isNew) return -2e9 + all.indexOf(p);
      const m = /(\d{4})-(\d+)\s*$/.exec(p.id), n = m ? +m[1] * 1e4 + +m[2] : 0;
      return (p.isNotified ? -1e9 : 0) - n;
    }],
    ['client', 'Client', (p) => fold(p.client)],
    ['start', 'Start date', (p) => day(p.start)],
    ['end', 'End date', (p) => day(p.deadline)],
    ['team', 'Team', (p) => p.suppliers * 1e5 + p.workers],
    ['status', 'Status', (p) => Object.keys(STATUS).indexOf(statusOf(p))],
    // the worst first: not compliant, then to look at, then valid, then nothing asked
    ['docs', 'Documents', (p) => (p.docs.miss ? 0 : p.docs.look ? 1 : p.docs.asked ? 2 : 3) * 1e6 - p.docs.miss * 1e3 - p.docs.look],
  ];
  const head = (sort) => '<thead><tr>' + COLS.map(([k, l]) => {
    const on = sort && sort.k === k;
    return `<th${on ? ` aria-sort="${sort.dir > 0 ? 'ascending' : 'descending'}"` : ''}><button type="button" class="cd-sort" data-pj-sort="${k}" title="${k === 'project' ? (on && sort.dir > 0 ? 'Sort by project: the oldest first' : 'Sort by project: the newest first') : `Sort by ${l.toLowerCase()}`}"><span class="l">${l}</span><span class="a" aria-hidden="true"></span></button></th>`;
  }).join('') + '</tr></thead>';
  const sorted = (l, sort) => {
    if (!sort) return l;
    const fn = COLS.find(([k]) => k === sort.k)[2];
    return l.map((p, i) => ({ p, i, v: fn(p) })).sort((x, y) => {
      if (x.v == null || y.v == null) return x.v == null && y.v == null ? x.i - y.i : x.v == null ? 1 : -1;
      const c = typeof x.v === 'number' ? x.v - y.v : String(x.v).localeCompare(String(y.v));
      return c * sort.dir || x.i - y.i;
    }).map((x) => x.p);
  };

  // ---- a project opens its own page (project.html): the owner's view, or a supplier's ----
  const open = (p) => { location.href = `project.html?id=${encodeURIComponent(p.id)}`; };
  // a row opens its project, by click or Enter / Space
  const wireRows = (body) => {
    const hit = (e) => { const r = e.target.closest('tr.pj-row'); return r && all.find((p) => p.id === r.dataset.pj); };
    body.addEventListener('click', (e) => { if (e.target.closest('a, button')) return; const p = hit(e); if (p) open(p); });
    body.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; const p = hit(e); if (!p) return; e.preventDefault(); open(p); });
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
      // the hidden test users (Walmart, AJ Lee) have no projects
      if (['beatriz', 'walmart', 'ajlee'].includes(document.documentElement.dataset.persona)) { location.replace('my-company.html?filled'); return; }
      const bk = document.getElementById('pj-back'); if (bk) bk.addEventListener('click', () => { location.href = 'my-company.html?filled'; });
    }
    if (!all.length) {
      // none yet: on the overview the section goes; on Projects, what will be here
      const sec = table.closest('section');
      if (attention) { if (sec) sec.hidden = true; return; }
      document.querySelectorAll('[data-pj-cards], [data-pj-tools], [data-pj-pills], [data-pj-pager-row]').forEach((n) => { n.hidden = true; n.style.display = 'none'; });
      card.innerHTML = `<div class="pj-empty"><span class="docd-ico" aria-hidden="true">${SVG(ICO.bag)}</span><h3>No projects yet</h3><p>When a client adds your company to one of their projects, or you start one of your own, it shows here with the documents it asks of you.</p><a class="pj-add" href="new-project.html"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>New project</a></div>`;
      return;
    }
    table.innerHTML = head(null) + '<tbody></tbody>';
    // what the Status dots mean, under the table as under the matrices
    if (card && !card.parentElement.querySelector('.pj-legend')) card.insertAdjacentHTML('afterend', `<p class="cd-legend pj-legend">${Object.values(STATUS).map(([l, c]) => `<span><span class="cd-dot ${c}" aria-hidden="true"></span>${l}</span>`).join('')}</p>`);
    const body = table.tBodies[0];

    // the company overview: only what needs attention, the worst first; then the same search, Filter,
    // sorting and pages as Projects
    let list = mine;
    if (attention) {
      list = mine.filter((p) => p.docs.miss || p.docs.look).sort(worst);
      const n = document.querySelector('[data-pj-need]'); if (n) n.textContent = list.length ? `${pl(list.length, 'project')} of ${mine.length} need${list.length === 1 ? 's' : ''} attention` : `All ${mine.length} projects are in order`;
      if (!list.length) {
        const t = document.querySelector('[data-pj-tools]'); if (t) t.hidden = true;
        body.innerHTML = '<tr><td colspan="7" class="pj-none">Every project&rsquo;s documents are in order.</td></tr>';
        return;
      }
    }

    // ---- cards (Projects only), search, Filter, sorting, ten to a page ----
    const cardsEl = document.querySelector('[data-pj-cards]'), tools = document.querySelector('[data-pj-tools]');
    const pills = document.querySelector('[data-pj-pills]'), nav = document.querySelector('[data-pj-pager]');
    // options in a group widen (any of them), groups narrow (all of them)
    const GROUPS = [
      ['Ownership', 'own', (p) => p.role],
      ['Region', 'region', (p) => p.region],
      ['Status', 'when', (p) => STATUS[statusOf(p)][0]],
      ['Documents', 'docs', (p) => (p.docs.miss || p.docs.look ? [p.docs.look && DOCST.look, p.docs.miss && DOCST.miss].filter(Boolean) : [DOCST.ok])],
    ];
    const f = { q: '', own: new Set(), region: new Set(), when: new Set(), docs: new Set() };
    const vals = (p, fn) => [].concat(fn(p));
    const keep = (p, skip) => (!f.q || p.text.includes(f.q)) && GROUPS.every(([, k, fn]) => k === skip || !f[k].size || vals(p, fn).some((v) => f[k].has(v)));
    const nOn = () => GROUPS.reduce((n, [, k]) => n + f[k].size, 0);
    let sort = null;
    const shown = () => sorted(list.filter((p) => keep(p)), sort);
    let page = 1, panel = null, btn = null;

    // the cards: how many projects, ongoing, finished, and needing attention; each filters the table
    // (on only when its filter is the only one, with no search); Total projects clears everything
    const CARD = {
      ongoing: { set: () => f.when.add(STATUS.ongoing[0]), is: () => nOn() === 1 && f.when.has(STATUS.ongoing[0]) },
      finished: { set: () => f.when.add(STATUS.finalized[0]), is: () => nOn() === 1 && f.when.has(STATUS.finalized[0]) },
      attention: { set: () => { f.docs.add(DOCST.look); f.docs.add(DOCST.miss); }, is: () => nOn() === 2 && f.docs.has(DOCST.look) && f.docs.has(DOCST.miss) },
    };
    const paintCards = () => {
      if (!cardsEl) return;
      // as every overview's cards (my-company.html .co-k): the label, the big figure, a line, the chips
      const chip = (cls, n, t) => `<span class="co-k-chip ${n ? cls : 'is-zero'}"><b>${n}</b> ${t}</span>`;
      const c = (key, ico, label, n, nl, sub, chips) => {
        const cur = !!key && !f.q && CARD[key].is();
        return `<button type="button" class="co-k pj-k${n ? '' : ' is-zero'}${cur ? ' is-on' : ''}" data-pj-card="${key}" role="listitem"${key ? ` aria-pressed="${cur}"` : ''}>
          <span class="co-k-h">${SVG(ICO[ico])}<span>${label}</span></span><span class="co-k-big"><span class="co-k-n">${n}</span><span class="co-k-nl">${nl}</span></span><span class="co-k-d">${sub}</span><span class="co-k-chips">${chips}</span></button>`;
      };
      const of = (st) => mine.filter((p) => statusOf(p) === st), bad = (l) => l.filter((p) => p.docs.miss || p.docs.look).length;
      const on = of('ongoing'), fin = of('finalized'), need = mine.filter((p) => p.docs.miss || p.docs.look);
      const split = (l) => chip('co-k-exp', bad(l), 'need attention') + chip('co-k-ok', l.length - bad(l), 'in order');
      cardsEl.innerHTML = c('', 'bag', 'Total projects', mine.length, mine.length === 1 ? 'project' : 'projects', 'Every project you own or supply.',
        chip('co-k-ok', on.length, 'ongoing') + chip('co-k-miss', of('notstarted').length + of('hold').length, 'not started or on hold') + chip('is-neu', fin.length, 'finished'))
        + c('ongoing', 'play', 'Ongoing', on.length, 'under way', 'Works under way today.', split(on))
        + c('finished', 'flag', 'Finished', fin.length, 'finished', 'Their end date has passed.', split(fin))
        + c('attention', 'look', 'Needs attention', need.length, need.length === 1 ? 'needs your attention' : 'need your attention', 'Documents missing, expired or expiring.',
          chip('co-k-exp', need.filter((p) => p.docs.miss).length, 'with documents missing') + chip('co-k-miss', need.filter((p) => !p.docs.miss).length, 'expiring'));
    };
    const paint = () => {
      if (!panel) return;
      panel.innerHTML = '<div class="co-filt-list">' + GROUPS.map(([label, k, fn], gi) => {
        const opts = [...new Set(list.flatMap((p) => vals(p, fn)))].sort();
        return (gi ? '<div class="co-menu-sep" role="separator"></div>' : '') + `<div class="co-menu-h">${label}</div>` + opts.map((v) => {
          const n = list.filter((p) => keep(p, k) && vals(p, fn).includes(v)).length;
          return `<button type="button" class="co-menu-i" role="menuitemcheckbox" aria-checked="${f[k].has(v)}" data-k="${k}" data-v="${esc(v)}"><span class="co-menu-c">${TICK}</span>${esc(v)}<small>${n}</small></button>`;
        }).join('');
      }).join('') + `<div class="co-menu-sep" role="separator"></div><button type="button" class="co-menu-i" role="menuitem" data-clear${nOn() ? '' : ' disabled'}><span class="co-menu-c">${XS}</span>Clear filters</button></div>`;
    };
    const go = (n, focus) => {
      const l = shown(), pages = Math.max(1, Math.ceil(l.length / PER));
      page = Math.min(pages, Math.max(1, n));
      body.innerHTML = l.length ? l.slice((page - 1) * PER, page * PER).map(rowOf).join('')
        : '<tr><td colspan="7" class="co-tbl-none">No project matches that. <button type="button" class="link-btn" data-clear>Clear the search and filters</button></td></tr>';
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
    // a column head sorts by it; again, the other way
    table.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pj-sort]'); if (!b) return;
      const k = b.dataset.pjSort; sort = { k, dir: sort && sort.k === k ? -sort.dir : 1 };
      table.tHead.remove(); table.insertAdjacentHTML('afterbegin', head(sort)); go(1);
      table.querySelector(`[data-pj-sort="${k}"]`).focus();
    });
    if (pills) pills.addEventListener('click', (e) => {
      const p = e.target.closest('.co-pill'); if (!p) return;
      f[p.dataset.k].delete(p.dataset.v); go(1); if (panel && !panel.hidden) paint();
      const next = pills.querySelector('.co-pill'); (next || btn).focus();
    });
    // a card filters the table to the projects concerned, again to clear it; Total projects clears everything
    if (cardsEl) cardsEl.addEventListener('click', (e) => {
      const c = e.target.closest('[data-pj-card]'); if (!c) return;
      const v = c.dataset.pjCard, was = c.classList.contains('is-on');
      clear(); if (v && !was && CARD[v]) { CARD[v].set(); go(1); }
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
    wireRows(body);
    // arriving with a filter (the overview's "View all"): ?docs=Not compliant
    const want = !attention && new URLSearchParams(location.search).get('docs');
    if (want && Object.values(DOCST).includes(want)) f.docs.add(want);
    go(1);
    if (attention) return;
    // back from new-project.html: what was started
    try { const t = sessionStorage.getItem('cm-pj-toast'); if (t) { sessionStorage.removeItem('cm-pj-toast'); const el = Object.assign(document.createElement('div'), { className: 'pj-toast', textContent: t }); el.setAttribute('role', 'status'); document.body.appendChild(el); setTimeout(() => el.remove(), 4200); } } catch (e) {}
    // an older link to one project (?project=FC-2026-031): its page
    const one = all.find((p) => p.id === new URLSearchParams(location.search).get('project'));
    if (one && mine.includes(one)) { location.replace(`project.html?id=${encodeURIComponent(one.id)}`); return; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  // the kinds of work a supplier does on a project: what's picked from the list, with a line of detail if you want one
  const WORK_TYPES = ['Civil works', 'Demolition', 'Earthworks and excavation', 'Foundations', 'Concrete and formwork', 'Structural steel', 'Masonry',
    'Carpentry and joinery', 'Roofing', 'Waterproofing and insulation', 'Façades and glazing', 'Drywall and ceilings', 'Flooring and tiling', 'Painting and finishes',
    'Electrical installations', 'Plumbing and drainage', 'HVAC', 'Fire protection', 'Lifts and escalators', 'Telecoms and security systems',
    'Scaffolding', 'Crane and lifting services', 'Landscaping', 'Site cleaning', 'Site security', 'Waste management', 'Transport and logistics', 'Other'];
  const workText = (x) => { const t = (x && x.work) || '', d = ((x && x.detail) || '').trim(); return t === 'Other' ? d || 'Other' : [t, d].filter(Boolean).join(' · '); };
  window.CMProjects = { saveEdit, statusOf, statusHtml, setHold, STATUS, WORK_TYPES, workText, all: () => all.slice(), open: (id) => { const p = all.find((x) => x.id === id); if (p) open(p); }, teamOf, saveTeam, NOTIFIED, where, peopleOf, itemsOf, hasProjects, pl };
})();
