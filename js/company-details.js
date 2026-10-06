/* Company details: every document on file, built from the C-MORE Subcontractor
   Documentation Profile (company, contributions & tax, insurance, health & safety,
   workers, equipment, materials & waste) — a profile reused across every project,
   rather than one table per site. Prototype data, kept here. */
(() => {
  const C = { ID: 'Company — identification & licensing', TAX: 'Company — tax & social security', INS: 'Company — insurance',
    SST: 'Company — health & safety', WRK: 'Workers', EQ: 'Equipment', MAT: 'Materials, waste & transport' };
  // code, document, category, issued, valid until (or a renewal cadence when it never expires), sharing, status, note
  const DOCS = [
    ['E01', 'Contractor&rsquo;s license (IMPIC certificate)', C.ID, '15 Aug 2024', '15 Aug 2026', 'Open', 'bad', 'Expired 15 August — drop the renewed one on ALMA.'],
    ['E02', 'Certificate of incorporation', C.ID, '3 Jan 2025', '3 Jan 2027', 'Open', 'ok', 'Delaware Secretary of State.'],
    ['E03', 'Company tax ID card (EIN)', C.ID, '12 Mar 2026', 'No expiry', 'Open', 'ok', ''],
    ['E16', 'Company profile & reference projects', C.ID, '1 Oct 2026', 'Reviewed yearly', 'Open', 'ok', ''],
    ['PF&#8209;E1', 'Management system certificates (ISO 9001, 14001, 45001)', C.ID, '—', '—', 'Open', 'pending', 'Optional — not held yet.'],
    ['R03', 'Goods transport license', C.ID, '20 Feb 2026', '20 Feb 2027', 'Open', 'ok', ''],
    ['E07', 'Tax authority clearance certificate', C.TAX, '1 Sep 2026', '1 Dec 2026', 'Open', 'ok', ''],
    ['E08', 'Social security clearance certificate', C.TAX, '1 Sep 2026', '1 Dec 2026', 'Open', 'ok', ''],
    ['E12', 'Social security payment receipt', C.TAX, '1 Sep 2026', 'Due monthly', 'Open', 'review', 'September&rsquo;s receipt is in review.'],
    ['E09', 'Workers&rsquo; compensation policy (payroll &amp; receipt)', C.INS, '1 Jan 2026', '1 Jan 2027', 'Restricted', 'ok', 'All 24 people covered.'],
    ['E09&#8209;TI', 'Independent worker&rsquo;s accident insurance', C.INS, '—', '—', 'Open', 'pending', 'Needed only if a 1099 crew joins a site.'],
    ['E10', 'Public liability insurance', C.INS, '3 Nov 2025', '3 Nov 2026', 'Open', 'review', '18 of 22 vehicles on the schedule.'],
    ['E11', 'Environmental liability insurance', C.INS, '14 Apr 2026', '14 Apr 2027', 'Open', 'ok', ''],
    ['E04', 'Annual health &amp; safety report', C.SST, '31 Mar 2026', 'Due next March', 'Open', 'ok', 'Single Report, Annex D.'],
    ['E18', 'Health &amp; safety organisation &amp; risk assessment', C.SST, '—', '3 I&#8209;9 attestations missing', 'Open', 'bad', 'E&#8209;Verify enrolment incomplete.'],
    ['E14', 'Foreign workers declaration', C.SST, '1 Jul 2026', 'Due quarterly', 'Open', 'ok', 'None on payroll this quarter.'],
    ['PF&#8209;T1', 'Worker ID sheets', C.WRK, '—', 'Updated as people join', 'Restricted', 'ok', '24 workers on file.'],
    ['T02', 'Fitness&#8209;for&#8209;work certificates', C.WRK, '12 Mar 2025', 'Renews every 2 years', 'Restricted', 'ok', '24/24 current.'],
    ['T03', 'PPE issue records', C.WRK, '—', 'Logged per issue', 'Restricted', 'ok', ''],
    ['PF&#8209;T2', 'Base &amp; ongoing H&amp;S training', C.WRK, '18 Sep 2026', 'Renews yearly', 'Restricted', 'ok', '22/24 current.'],
    ['T05', 'Special&#8209;risk training (height, confined spaces)', C.WRK, '9 Jun 2026', 'Per training validity', 'Restricted', 'review', '2 workers due for refresher.'],
    ['T06', 'Equipment operator training', C.WRK, '1 May 2026', 'Per license validity', 'Restricted', 'ok', '6 operators certified.'],
    ['T08', 'First aid, fire &amp; evacuation training', C.WRK, '15 Feb 2026', 'Per training validity', 'Restricted', 'ok', ''],
    ['T07', 'Foreign workers&rsquo; residence &amp; work authorization', C.WRK, '—', '—', 'Restricted', 'pending', 'None on payroll this quarter.'],
    ['T09', 'Annual fitness review (under 18 / over 50)', C.WRK, '1 Jan 2026', 'Due next January', 'Restricted', 'ok', '3 workers covered.'],
    ['PF&#8209;EQ', 'Equipment ID sheets', C.EQ, '—', 'Updated as equipment changes', 'Open', 'ok', '11 machines on file.'],
    ['EQ01', 'Technical sheets &amp; CE declaration', C.EQ, '—', '—', 'Open', 'ok', ''],
    ['EQ02', 'Pre&#8209;1995 operating certificates', C.EQ, '—', '—', 'Open', 'ok', '1 machine, grandfathered.'],
    ['EQ03', 'Periodic safety inspection reports', C.EQ, '20 Oct 2026', 'Per inspection plan', 'Open', 'review', 'Crane inspection awaiting sign&#8209;off.'],
    ['EQ04', 'Equipment insurance (policy &amp; receipt)', C.EQ, '1 Mar 2026', '1 Mar 2027', 'Open', 'ok', ''],
    ['EQ05', 'Instruction manuals', C.EQ, '—', '—', 'Open', 'ok', ''],
    ['EQ06', 'Maintenance plan &amp; reports', C.EQ, '—', 'Per maintenance plan', 'Open', 'ok', ''],
    ['EQ07', 'Measuring equipment calibration certificates', C.EQ, '—', 'Per certificate', 'Open', 'ok', ''],
    ['M01', 'Material &amp; product technical sheets', C.MAT, '—', 'Per product', 'Open', 'ok', ''],
    ['M02', 'Safety data sheets (chemical products)', C.MAT, '—', 'Per product / new version', 'Open', 'ok', ''],
    ['R01', 'Waste operator licenses', C.MAT, '12 Dec 2025', '12 Dec 2026', 'Open', 'ok', ''],
  ].map(([code, name, cat, issued, valid, sharing, status, note], id) => ({ id, code, name, cat, issued, valid, sharing, status, note }));

  const STATUS = { ok: ['In conformity', 'b-ok'], pending: ['Pending', 'b-pend'], review: ['Pending approval', 'b-info'], bad: ['Non conform', 'b-over'] };
  const CATS = [...new Set(DOCS.map((d) => d.cat))];
  const SHARES = ['Open', 'Restricted'];
  const STATUSES = Object.keys(STATUS);

  // the counts up top
  document.getElementById('cd-total').textContent = DOCS.length;
  document.getElementById('cd-ok').textContent = DOCS.filter((d) => d.status === 'ok').length;
  document.getElementById('cd-pend').textContent = DOCS.filter((d) => d.status === 'pending' || d.status === 'review').length;
  document.getElementById('cd-bad').textContent = DOCS.filter((d) => d.status === 'bad').length;

  const fold = (t) => t.replace(/<[^>]+>/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const DATA = DOCS.map((d) => ({ ...d, text: fold(`${d.code} ${d.name} ${d.cat}`) }));

  const PER = 10;
  const f = { q: '', cat: new Set(), sharing: new Set(), status: new Set() };
  const GROUPS = [['Category', 'cat', (d) => d.cat], ['Sharing', 'sharing', (d) => d.sharing], ['Status', 'status', (d) => STATUS[d.status][0]]];
  const vals = (d, fn) => [].concat(fn(d));
  const keep = (d, skip) => (!f.q || d.text.includes(f.q)) && GROUPS.every(([, k, fn]) => k === skip || !f[k].size || vals(d, fn).some((v) => f[k].has(v)));
  const nOn = () => GROUPS.reduce((n, [, k]) => n + f[k].size, 0);

  const tbl = document.getElementById('cd-tbl'), body = tbl.tBodies[0];
  const tools = document.querySelector('[data-tools-for="cd-tbl"]');
  const pills = document.querySelector('[data-pills]');
  const nav = document.querySelector('[data-pager-for="cd-tbl"]');
  const q = tools.querySelector('[data-q]'), btn = tools.querySelector('[data-filt-btn]'), panel = tools.querySelector('[data-filt-panel]');
  let page = 1;

  const row = (d) => {
    const [label, cls] = STATUS[d.status];
    const share = d.sharing === 'Restricted' ? '<span class="co-badge b-neu">Restricted</span>' : '<span class="co-subtle">Open</span>';
    return `<tr><td><span class="n">${d.name}</span><span class="d">${d.code}${d.note ? ' · ' + d.note : ''}</span></td><td class="c co-subtle">${d.cat.replace(/^.*?— /, '')}</td>` +
      `<td class="c">${d.issued}</td><td class="c">${d.valid}</td><td class="c">${share}</td><td><span class="co-badge ${cls}">${label}</span></td></tr>`;
  };

  const TICK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>';
  const X = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>';
  const paintFilters = () => {
    panel.innerHTML = '<div class="co-filt-list">' + GROUPS.map(([label, k, fn], gi) => {
      const all = k === 'cat' ? CATS : k === 'sharing' ? SHARES : STATUSES.map((s) => STATUS[s][0]);
      return (gi ? '<div class="co-menu-sep" role="separator"></div>' : '') + `<div class="co-menu-h">${label}</div>` + all.map((v) => {
        const n = DATA.filter((d) => keep(d, k) && vals(d, fn).includes(v)).length;
        return `<button type="button" class="co-menu-i" role="menuitemcheckbox" aria-checked="${f[k].has(v)}" data-k="${k}" data-v="${v}"><span class="co-menu-c">${TICK}</span>${v}<small>${n}</small></button>`;
      }).join('');
    }).join('') + `<div class="co-menu-sep" role="separator"></div><button type="button" class="co-menu-i" role="menuitem" data-clear${nOn() ? '' : ' disabled'}><span class="co-menu-c">${X}</span>Clear filters</button></div>`;
  };
  const openFilt = (on) => { panel.hidden = !on; btn.setAttribute('aria-expanded', String(on)); if (on) { paintFilters(); panel.firstElementChild.scrollTop = 0; } };
  btn.addEventListener('click', (e) => { e.stopPropagation(); openFilt(panel.hidden); if (!panel.hidden && e.detail === 0) panel.querySelector('.co-menu-i').focus(); });
  panel.addEventListener('click', (e) => {
    e.stopPropagation();
    const i = e.target.closest('.co-menu-i'); if (!i || i.disabled) return;
    if (i.hasAttribute('data-clear')) { clearAll(); panel.querySelector('.co-menu-i').focus(); return; }
    const { k, v } = i.dataset, top = panel.firstElementChild.scrollTop; f[k].has(v) ? f[k].delete(v) : f[k].add(v); go(1); paintFilters();
    panel.firstElementChild.scrollTop = top;
    const again = panel.querySelector(`[data-k="${k}"][data-v="${v}"]`); if (again) again.focus();
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...panel.querySelectorAll('.co-menu-i:not(:disabled)')], at = items.indexOf(document.activeElement);
    items[(at + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
  });
  document.addEventListener('click', (e) => { if (!tools.contains(e.target)) openFilt(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) { openFilt(false); btn.focus(); } });
  q.addEventListener('input', () => { f.q = fold(q.value.trim()); go(1); if (!panel.hidden) paintFilters(); });

  pills.addEventListener('click', (e) => {
    const p = e.target.closest('.co-pill'); if (!p) return;
    f[p.dataset.k].delete(p.dataset.v); go(1); if (!panel.hidden) paintFilters();
    const next = pills.querySelector('.co-pill'); (next || btn).focus();
  });
  const clearAll = () => { f.q = ''; GROUPS.forEach(([, k]) => f[k].clear()); q.value = ''; go(1); if (!panel.hidden) paintFilters(); };
  document.addEventListener('click', (e) => { const c = e.target.closest('[data-clear]'); if (c && (tools.contains(c) || body.contains(c))) clearAll(); });

  function go(to) {
    const shown = DATA.filter((d) => keep(d));
    const pages = Math.max(1, Math.ceil(shown.length / PER));
    page = Math.min(pages, Math.max(1, to));
    body.innerHTML = shown.length
      ? shown.slice((page - 1) * PER, page * PER).map(row).join('')
      : '<tr><td colspan="6" class="co-tbl-none">No document matches that. <button type="button" class="link-btn" data-clear>Clear the search and filters</button></td></tr>';
    const on = GROUPS.flatMap(([label, k]) => [...f[k]].map((v) => [label, k, v]));
    pills.hidden = !on.length;
    pills.innerHTML = on.map(([label, k, v]) => `<button type="button" class="co-pill" data-k="${k}" data-v="${v}" aria-label="Remove filter ${label}: ${v}"><span>${label}:</span><b>${v}</b><i aria-hidden="true">×</i></button>`).join('');
    const n = nOn(); btn.querySelector('[data-filt-n]').hidden = !n; btn.querySelector('[data-filt-n]').textContent = n;
    tools.querySelector('.co-tools-clear').hidden = !(n || f.q);
    nav.hidden = pages < 2;
    nav.innerHTML = pages > 1 ? '<span class="co-pager-btns">' +
      `<button type="button" class="co-pager-arrow" data-to="${page - 1}"${page === 1 ? ' disabled' : ''} aria-label="Previous page"><span aria-hidden="true">←</span> Previous</button>` +
      Array.from({ length: pages }, (_, k) => `<button type="button" data-to="${k + 1}"${k + 1 === page ? ' aria-current="page"' : ''} aria-label="Page ${k + 1}">${k + 1}</button>`).join('') +
      `<button type="button" class="co-pager-arrow" data-to="${page + 1}"${page === pages ? ' disabled' : ''} aria-label="Next page">Next <span aria-hidden="true">→</span></button></span>` : '';
  }
  nav.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-to]'); if (!b || b.disabled) return;
    go(+b.dataset.to);
    const top = tbl.closest('section').getBoundingClientRect().top;
    if (top < 0) scrollTo({ top: top + scrollY - 80, behavior: 'smooth' });
  });
  go(1);
})();
