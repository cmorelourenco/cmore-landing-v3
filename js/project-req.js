/* The documents a project asks of its suppliers: picked when it's started (new-project.html, step 2)
   and changed from inside it (project.html, Documents required). Every area (company, workers,
   equipment, products & materials, and the project's own: contract, site declaration, safety, insurance), split by its catalog sections, with the documents that apply in
   the project's country; what the law asks for (mandatory, or when it applies) ticked to begin with.
   The list drives the project's matrices and every status in it (js/project.js).
   window.CMProjectReq: AREAS, catalog(country), defaults(country), reqOf(project), save(id, codes),
   picker(element, { country, selected, onChange }) -> { get() }.
   Kept for the tab, per company ('cm-pj-req…'); a project started here keeps its own in its record. */
(() => {
  const C = window.DOC_CATALOG; if (!C || !C.docs) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const en = (x) => (x && typeof x === 'object' ? x.en : x) || '';
  const AREAS = [['company', 'Company'], ['workers', 'Workers'], ['equipment', 'Equipment'], ['products', 'Products &amp; materials'], ['project', 'Project']];
  const REQ = { mandatory: 'Required by law', if_applicable: 'Required when it applies', optional: 'Optional', on_request: 'On request' };
  const LEVEL = { company: 'For the company', all_workers: 'For all their workers', per_worker: 'For each worker', per_equipment: 'For each machine', per_product: 'For each product or material', project: 'For this project' };
  const EU = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
    'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'];
  const CODE = { Portugal: 'PT', 'United States': 'US', 'United States of America': 'US', Kenya: 'KE', Spain: 'ES', France: 'FR' };
  // what applies where the project is: its country's own documents, and its region's (EU, US)
  const applies = (d, country) => {
    const cc = CODE[country] || '', region = country === 'United States' || cc === 'US' ? 'US' : EU.includes(country) ? 'EU' : '';
    if (d.countries && d.countries.length && !d.countries.includes(cc)) return false;
    if (region && d.scope && d.scope.length && !d.scope.includes(region)) return false;
    return true;
  };
  // a worker's own papers, which the upload files itself and the catalog doesn't list (js/worker-docs.js
  // CM_WORKER_DOCS): their identity document, driving licence and criminal record
  const W = window.CM_WORKER_DOCS || {};
  const T = (t) => ({ en: t, pt: t });
  const EXTRA = [['ID', 'Identity', 'mandatory'], ['DRV', 'Driving', 'optional'], ['CRM', 'Criminal record', 'optional']].filter(([c]) => W[c])
    .map(([code, sec, req]) => ({ code, category: 'workers', level: 'per_worker', requirement: req, section: T(sec), name: T(W[code].name) }));
  // what each supplier gives for this project in particular, whatever the country (the safety plan's
  // adherence is the EU's rule, and good practice elsewhere; the insurance naming the client mostly the US's)
  const PROJECT = [['PJ-01', 'Contract', 'Subcontract Agreement', 'Contrato de subempreitada'],
    ['PJ-02', 'On site', 'Site Activity Declaration', 'Declara\u00e7\u00e3o de atividade, calendariza\u00e7\u00e3o e respons\u00e1vel em obra'],
    ['PJ-03', 'Safety', 'Safety Plan Adherence Declaration', 'Ades\u00e3o ao Plano de Seguran\u00e7a e Sa\u00fade'],
    ['PJ-04', 'Safety', 'Risk Assessment and Method Statement (RAMS)', 'Avalia\u00e7\u00e3o de riscos e m\u00e9todo de trabalho da obra'],
    ['PJ-06', 'Insurance', 'Project Insurance Certificate', 'Seguro que nomeia o cliente ou a obra']]
    .map(([code, sec, en, pt]) => ({ code, category: 'project', level: 'project', requirement: 'if_applicable', section: T(sec), name: { en, pt } }));
  EXTRA.push(...PROJECT);
  const ALL = EXTRA.slice(0, 1).concat(C.docs, EXTRA.slice(1));
  const cache = {};
  const catalog = (country = 'Portugal') => {
    if (cache[country]) return cache[country];
    const docs = ALL.filter((d) => AREAS.some(([a]) => a === d.category) && applies(d, country));
    return (cache[country] = AREAS.map(([a, label]) => {
      const list = docs.filter((d) => d.category === a), secs = [];
      list.forEach((d) => { const s = en(d.section) || 'Other'; let g = secs.find((x) => x.name === s); if (!g) secs.push(g = { name: s, docs: [] }); g.docs.push(d); });
      return { area: a, label, sections: secs, docs: list };
    }));
  };
  const defaults = (country) => catalog(country).flatMap((a) => a.docs.filter((d) => d.requirement === 'mandatory' || d.requirement === 'if_applicable').map((d) => d.code));

  // what a project asks for: changed from inside it, else what it was started with, else the law's
  const persona = document.documentElement.dataset.persona;
  const KEY = 'cm-pj-req' + ({ beatriz: '-beatriz', walmart: '-walmart', ajlee: '-ajlee' }[persona] || '');
  const saved = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const reqOf = (p) => { const s = saved()[p.id]; return s || p.req || defaults(p.country || 'Portugal'); };
  const save = (id, codes) => { const s = saved(); s[id] = codes; try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };

  const css = document.createElement('style');
  css.textContent = `
.prq-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem 1rem; margin: 0 0 1rem; }
.prq-seg { display: inline-flex; flex-wrap: wrap; gap: 0.25rem; padding: 0.25rem; background: var(--color-light-beige); border-radius: 9999px; }
.prq-seg button { display: inline-flex; align-items: center; gap: 0.375rem; height: 2rem; padding: 0 0.875rem; border: 0; border-radius: 9999px; background: none; font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink-subtle); cursor: pointer; }
.prq-seg button:hover { color: var(--color-ink); }
.prq-seg button[aria-selected="true"] { background: var(--color-surface); color: var(--color-ink); box-shadow: 0 1px 3px rgba(52, 52, 52, .12); }
.prq-seg button span { font-size: 0.75rem; color: var(--color-ink-subtle); font-variant-numeric: tabular-nums; }
.prq-q { flex: 1 1 14rem; max-width: 20rem; height: 2.5rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); font: inherit; font-size: 0.875rem; color: var(--color-ink); }
.prq-q:focus { outline: 2px solid var(--color-graphite); outline-offset: 0; border-color: transparent; }
.prq-bar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem 1rem; margin: 0 0 0.875rem; font-size: 0.875rem; color: var(--color-ink-subtle); }
.prq-bar b { color: var(--color-ink); font-weight: 600; }
.prq-bar .prq-acts { display: flex; gap: 1rem; }
.prq-sec + .prq-sec { margin-top: 2rem; }
.prq-sec[hidden], .prq-tbl tr[hidden] { display: none; }
.prq-sec-h { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin: 0 0 0.75rem; }
.prq-sec-h label { display: inline-flex; align-items: center; gap: 0.625rem; cursor: pointer; }
.prq-sec-h .eyebrow { margin: 0; }
.prq-sec-h span { font-size: 0.8125rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
.prq-tbl { table-layout: fixed; width: 100%; min-width: 0 !important; }
.prq .co-tbl-card { overflow-x: visible; }
.prq-tbl td { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.prq-doc { display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; text-align: left; }
.prq-doc .t { min-width: 0; }
.prq-doc .n { display: block; font-size: 0.875rem; font-weight: 500; color: var(--color-ink); line-height: 1.35; }
.prq-doc .d { display: block; font-size: 0.75rem; color: var(--color-ink-subtle); }
/* the boxes as on the other pickers (js/cap-new.js .nr-fl): graphite, not the browser's blue */
.prq input[type="checkbox"] { flex: none; width: 1.0625rem; height: 1.0625rem; margin: 0.0625rem 0 0; accent-color: var(--color-graphite); cursor: pointer; }
.prq-sec-h input[type="checkbox"] { margin: 0; }
.prq-none { padding: 2rem 1rem; text-align: center; font-size: 0.875rem; color: var(--color-ink-subtle); }
`;
  document.head.appendChild(css);

  // the picker: an area at a time, its sections as cards, a box to tick per document and per section
  const picker = (el, o) => {
    const cat = catalog(o.country), on = new Set(o.selected || defaults(o.country));
    let area = cat[0].area, q = '';
    const all = cat.flatMap((a) => a.docs.map((d) => d.code));
    [...on].forEach((c) => { if (!all.includes(c)) on.delete(c); });
    const nIn = (docs) => docs.filter((d) => on.has(d.code)).length;
    const paint = (focus) => {
      const A = cat.find((a) => a.area === area);
      el.innerHTML = `<div class="prq">
        <div class="prq-top"><div class="prq-seg" role="tablist" aria-label="Areas">${cat.map((a) => `<button type="button" role="tab" aria-selected="${a.area === area}" data-prq-area="${a.area}">${a.label} <span>${nIn(a.docs)} of ${a.docs.length}</span></button>`).join('')}</div>
          <input class="prq-q" type="search" placeholder="Search documents" aria-label="Search documents" value="${esc(q)}" data-prq-q></div>
        <div class="prq-bar"><span><b>${on.size}</b> of ${all.length} documents asked for &middot; ${nIn(A.docs)} of ${A.docs.length} in ${A.label}</span><span class="prq-acts"><button type="button" class="link-btn" data-prq-every>Select all in ${A.label}</button><button type="button" class="link-btn" data-prq-clear>Clear ${A.label}</button><button type="button" class="link-btn" data-prq-law>Only what the law asks</button></span></div>
        ${A.docs.length ? A.sections.map((s, k) => `<div class="prq-sec" data-prq-s="${k}"><div class="co-sub-head prq-sec-h"><label><input type="checkbox" data-prq-sec="${k}" aria-label="All of ${esc(s.name)}"><h3 class="eyebrow">${esc(s.name)}</h3></label><span class="co-muted" data-prq-n="${k}"></span></div>
          <div class="co-card co-tbl-card"><table class="co-tbl prq-tbl" data-paged="prq-${A.area}-${k}"><thead><tr><th>Document name</th><th style="width:25%">For</th><th style="width:25%">Requirement</th></tr></thead><tbody>${s.docs.map((d) => `<tr data-text="${esc(fold(en(d.name) + ' ' + d.code + ' ' + s.name))}"><td><label class="prq-doc"><input type="checkbox" data-prq-doc="${esc(d.code)}"${on.has(d.code) ? ' checked' : ''}><span class="t"><span class="n">${esc(en(d.name))}</span><span class="d">${esc(d.code)}</span></span></label></td><td>${LEVEL[d.level] || ''}</td><td>${REQ[d.requirement] || ''}</td></tr>`).join('')}</tbody></table></div></div>`).join('')
          : `<p class="prq-none">No ${A.label.toLowerCase()} documents apply in ${esc(o.country)}.</p>`}</div>`;
      sync(); filter();
      if (focus) { const b = el.querySelector(focus); if (b) b.focus({ preventScroll: true }); }
    };
    // each section's box: ticked, empty or in between, and how many of its documents
    const sync = () => {
      const A = cat.find((a) => a.area === area);
      A.sections.forEach((s, k) => {
        const n = nIn(s.docs), box = el.querySelector(`[data-prq-sec="${k}"]`), lab = el.querySelector(`[data-prq-n="${k}"]`);
        if (box) { box.checked = n === s.docs.length; box.indeterminate = n > 0 && n < s.docs.length; }
        if (lab) lab.textContent = `${n} of ${s.docs.length}`;
      });
      const bar = el.querySelector('.prq-bar > span'); if (bar) bar.innerHTML = `<b>${on.size}</b> of ${all.length} documents asked for &middot; ${nIn(A.docs)} of ${A.docs.length} in ${A.label}`;
      el.querySelectorAll('[data-prq-area]').forEach((b) => { const a = cat.find((x) => x.area === b.dataset.prqArea); b.querySelector('span').textContent = `${nIn(a.docs)} of ${a.docs.length}`; });
      if (o.onChange) o.onChange([...on]);
    };
    const filter = () => {
      const t = fold(q.trim());
      el.querySelectorAll('.prq-sec').forEach((s) => { let any = false; s.querySelectorAll('tbody tr').forEach((tr) => { tr.hidden = !!t && !tr.dataset.text.includes(t); any = any || !tr.hidden; }); s.hidden = !any; });
    };
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-prq-area]'); if (a) { area = a.dataset.prqArea; paint(`[data-prq-area="${area}"]`); return; }
      const A = cat.find((x) => x.area === area);
      if (e.target.closest('[data-prq-every]')) { A.docs.forEach((d) => on.add(d.code)); paint('[data-prq-every]'); return; }
      if (e.target.closest('[data-prq-clear]')) { A.docs.forEach((d) => on.delete(d.code)); paint('[data-prq-clear]'); return; }
      if (e.target.closest('[data-prq-law]')) { on.clear(); defaults(o.country).forEach((c) => on.add(c)); paint('[data-prq-law]'); }
    });
    // a click anywhere on a document's row ticks it
    el.addEventListener('click', (e) => { const tr = e.target.closest('.prq-tbl tbody tr'); if (!tr || e.target.closest('label, input')) return; const b = tr.querySelector('[data-prq-doc]'); if (b) { b.checked = !b.checked; b.dispatchEvent(new Event('change', { bubbles: true })); } });
    el.addEventListener('change', (e) => {
      const d = e.target.closest('[data-prq-doc]');
      if (d) { if (d.checked) on.add(d.dataset.prqDoc); else on.delete(d.dataset.prqDoc); sync(); return; }
      const s = e.target.closest('[data-prq-sec]');
      if (s) {
        const sec = cat.find((x) => x.area === area).sections[+s.dataset.prqSec];
        sec.docs.forEach((x) => { if (s.checked) on.add(x.code); else on.delete(x.code); const b = el.querySelector(`[data-prq-doc="${x.code}"]`); if (b) b.checked = s.checked; });
        sync();
      }
    });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-prq-q]')) { q = e.target.value; filter(); } });
    paint();
    return { get: () => [...on] };
  };

  window.CMProjectReq = { EXTRA, AREAS, REQ, LEVEL, catalog, defaults, reqOf, save, picker, en };
})();
