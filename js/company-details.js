/* Company details: every document on file, built from the C-MORE Subcontractor
   Documentation Profile (company, contributions & tax, insurance, health & safety,
   workers, equipment, materials & waste). Grouped two levels deep: four areas first
   (Company, Workers, Equipment, Materials & waste), each opening to its own documents;
   a document that covers several people or machines opens its own roster in turn.
   Prototype data, kept here. */
(() => {
  const C = { ID: 'Identification & licensing', TAX: 'Tax & social security', INS: 'Insurance',
    SST: 'Health & safety', WRK: 'Workers', EQ: 'Equipment', MAT: 'Materials, waste & transport' };
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

  // the people and the equipment behind the rows above, so "24 workers on file" or
  // "11 machines on file" opens into something real rather than staying a number
  const WORKERS = [
    ['Carlos Pinto', 'Foreman'], ['Miguel Alves', 'Carpenter'], ['Tiago Sousa', 'Electrician'],
    ['Bruno Ferreira', 'Laborer'], ['Ricardo Lopes', 'Crane operator'], ['Andr&eacute; Costa', 'Welder'],
    ['Paulo Martins', 'Laborer'], ['Nuno Silva', 'Safety officer'],
  ];
  const EQUIPMENT = [
    ['Excavator &mdash; CAT 320', 'EQ&#8209;014'], ['Tower crane &mdash; Liebherr 1060', 'EQ&#8209;002'],
    ['Scissor lift &mdash; Genie GS&#8209;1932', 'EQ&#8209;021'], ['Welding set &mdash; Lincoln 210', 'EQ&#8209;033'],
    ['Concrete mixer &mdash; CM&#8209;500', 'EQ&#8209;009'], ['Plate compactor &mdash; CP&#8209;120', 'EQ&#8209;041'],
  ];
  const MATERIALS = [
    ['Ready&#8209;mix concrete, C30/37', ''], ['Structural steel rebar', ''],
    ['Epoxy adhesive &mdash; Sika AnchorFix', ''], ['Solvent&#8209;based degreaser', ''],
  ];
  // which of the sample roster is behind this particular document, and how each one reads
  const ROSTERS = {
    'PF&#8209;T1': { list: WORKERS, pick: [0, 1, 2, 3, 4, 5, 6, 7], status: () => 'ok' },
    T02: { list: WORKERS, pick: [0, 1, 2, 3, 4, 5, 6, 7], status: () => 'ok' },
    T03: { list: WORKERS, pick: [0, 1, 2, 3, 4, 5, 6, 7], status: () => 'ok' },
    'PF&#8209;T2': { list: WORKERS, pick: [0, 1, 2, 3, 4, 5, 6, 7], status: (i) => (i === 5 ? 'bad' : i === 2 ? 'pending' : 'ok') },
    T05: { list: WORKERS, pick: [2, 4], status: () => 'pending' },
    T06: { list: WORKERS, pick: [4, 2, 1, 5, 7, 0], status: () => 'ok' },
    T08: { list: WORKERS, pick: [0, 1, 2, 3, 4, 5, 6, 7], status: () => 'ok' },
    T09: { list: WORKERS, pick: [3, 6, 7], status: () => 'ok' },
    'PF&#8209;EQ': { list: EQUIPMENT, pick: [0, 1, 2, 3, 4, 5], status: () => 'ok' },
    EQ01: { list: EQUIPMENT, pick: [0, 1, 2, 3, 4, 5], status: () => 'ok' },
    EQ03: { list: EQUIPMENT, pick: [0, 1, 2, 3, 4, 5], status: (i) => (i === 1 ? 'review' : 'ok') },
    EQ04: { list: EQUIPMENT, pick: [0, 1, 2, 3, 4, 5], status: () => 'ok' },
    EQ06: { list: EQUIPMENT, pick: [0, 1, 2, 3, 4, 5], status: () => 'ok' },
    M01: { list: MATERIALS, pick: [0, 1, 2, 3], status: () => 'ok' },
    M02: { list: MATERIALS, pick: [0, 1, 2, 3], status: () => 'ok' },
  };

  // the four areas the home page's compliance cards already point at; "Company" is the
  // four office-side categories together, the rest map one to one
  const AREAS = [
    { key: 'company', title: 'Company', sub: 'Who you are, your standing, your cover and how you run H&amp;S.', icon: '<path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>', cats: [C.ID, C.TAX, C.INS, C.SST] },
    { key: 'workers', title: 'Workers', sub: 'Who is on the crew, and what each of them is cleared for.', icon: '<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>', cats: [C.WRK] },
    { key: 'equipment', title: 'Equipment', sub: 'Every machine on site, its checks and its paperwork.', icon: '<path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17 2.496 24.03m8.924-8.86-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m0 0a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276a4.5 4.5 0 0 1-4.486 6.336l-.144-.004"/>', cats: [C.EQ] },
    { key: 'materials', title: 'Materials & waste', sub: 'What goes into the work, and what leaves the site.', icon: '<path d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/>', cats: [C.MAT] },
  ];

  const STATUS = { ok: ['In conformity', 'b-ok'], pending: ['Pending', 'b-pend'], review: ['Pending approval', 'b-info'], bad: ['Non conform', 'b-over'] };
  const CATS = [...new Set(DOCS.map((d) => d.cat))]; // in the profile's own order
  const SHARES = ['Open', 'Restricted'];
  const STATUSES = Object.keys(STATUS);

  // the counts up top, each a shortcut into the areas below
  document.getElementById('cd-total').textContent = DOCS.length;
  document.getElementById('cd-ok').textContent = DOCS.filter((d) => d.status === 'ok').length;
  document.getElementById('cd-pend').textContent = DOCS.filter((d) => d.status === 'pending' || d.status === 'review').length;
  document.getElementById('cd-bad').textContent = DOCS.filter((d) => d.status === 'bad').length;

  const fold = (t) => t.replace(/<[^>]+>/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const DATA = DOCS.map((d) => ({ ...d, text: fold(`${d.code} ${d.name} ${d.cat}`) }));
  const needsAttention = (d) => d.status === 'bad' || d.status === 'pending' || d.status === 'review';

  const f = { q: '', cat: new Set(), sharing: new Set(), status: new Set() };
  const GROUPS = [['Category', 'cat', (d) => d.cat], ['Sharing', 'sharing', (d) => d.sharing], ['Status', 'status', (d) => STATUS[d.status][0]]];
  const vals = (d, fn) => [].concat(fn(d));
  const keep = (d, skip) => (!f.q || d.text.includes(f.q)) && GROUPS.every(([, k, fn]) => k === skip || !f[k].size || vals(d, fn).some((v) => f[k].has(v)));
  const nOn = () => GROUPS.reduce((n, [, k]) => n + f[k].size, 0);
  const filtering = () => !!(f.q || f.cat.size || f.sharing.size || f.status.size);

  const groupsEl = document.getElementById('cd-groups');
  const tools = document.querySelector('[data-tools-for="cd-tbl"]');
  const pills = document.querySelector('[data-pills]');
  const q = tools.querySelector('[data-q]'), btn = tools.querySelector('[data-filt-btn]'), panel = tools.querySelector('[data-filt-panel]');

  let area = null; // null = every area, at the top; otherwise one of AREAS[].key
  const openRows = new Set(); // ids of the roster rows currently expanded

  const CHEV = '<svg class="cd-row-chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>';

  const roster = (d) => {
    const r = ROSTERS[d.code]; if (!r) return '';
    const items = r.pick.map((i, k) => {
      const [name, sub] = r.list[i], st = r.status(k), [label, cls] = STATUS[st];
      return `<div class="cd-roster-i"><span class="cd-roster-n">${name}</span>${sub ? `<span class="co-subtle">${sub}</span>` : ''}<span class="co-badge ${cls}">${label}</span></div>`;
    }).join('');
    const of = r.list === WORKERS ? 24 : r.list === EQUIPMENT ? 11 : r.pick.length;
    const note = of > r.pick.length ? `<span class="co-subtle cd-roster-note">Showing ${r.pick.length} of ${of}.</span>` : '';
    return `<div class="cd-roster">${items}${note}</div>`;
  };

  const row = (d) => {
    const [label, cls] = STATUS[d.status];
    const share = d.sharing === 'Restricted' ? '<span class="co-badge b-neu">Restricted</span>' : '';
    const dates = d.valid.startsWith('—') || !/\d/.test(d.issued) ? d.valid : `${d.issued} – ${d.valid}`;
    const hasRoster = !!ROSTERS[d.code], open = hasRoster && openRows.has(d.id);
    const chev = hasRoster ? `<button type="button" class="cd-row-open" data-open="${d.id}" aria-expanded="${open}" aria-label="${open ? 'Hide' : 'Show'} who this covers">${CHEV}</button>` : '';
    return `<div class="cd-row-wrap${open ? ' is-open' : ''}"><div class="co-row cd-row${hasRoster ? ' is-rosterable' : ''}" data-id="${d.id}"${hasRoster ? ` data-open-row="${d.id}"` : ''}>` +
      `<div class="co-row-t"><span class="co-row-n">${d.name}</span><span class="co-subtle">${d.code}${d.note ? ' · ' + d.note : ''}</span></div>` +
      `<div class="cd-row-r"><span class="cd-row-dates">${dates}</span>${share}<span class="co-badge ${cls}">${label}</span>${chev}</div></div>${open ? roster(d) : ''}</div>`;
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
    const { k, v } = i.dataset, top = panel.firstElementChild.scrollTop; f[k].has(v) ? f[k].delete(v) : f[k].add(v); render(); paintFilters();
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
  q.addEventListener('input', () => { f.q = fold(q.value.trim()); render(); if (!panel.hidden) paintFilters(); });

  pills.addEventListener('click', (e) => {
    const p = e.target.closest('.co-pill'); if (!p) return;
    f[p.dataset.k].delete(p.dataset.v); render(); if (!panel.hidden) paintFilters();
    const next = pills.querySelector('.co-pill'); (next || btn).focus();
  });
  const clearAll = () => { f.q = ''; GROUPS.forEach(([, k]) => f[k].clear()); q.value = ''; render(); if (!panel.hidden) paintFilters(); };
  tools.querySelector('.co-tools-clear').addEventListener('click', clearAll);

  // the groups themselves: a category's rows, each with a roster toggle where there is one
  const group = (cat, docs) => `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${cat}</h3><span class="co-muted">${docs.length} document${docs.length === 1 ? '' : 's'}</span></div><div class="co-card co-list">${docs.map(row).join('')}</div></div>`;

  // the four areas, each a tile with its own count and an alert badge when something there needs you
  const renderHome = () => {
    groupsEl.innerHTML = `<div class="cd-areas" role="list">${AREAS.map((a) => {
      const docs = DATA.filter((d) => a.cats.includes(d.cat));
      const alerts = docs.filter(needsAttention).length;
      return `<button type="button" class="cd-area" data-area="${a.key}" role="listitem">` +
        `<span class="cd-area-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a.icon}</svg><span>${a.title}</span>${alerts ? `<span class="cd-area-alert">${alerts}</span>` : ''}<span class="cd-area-arrow" aria-hidden="true">→</span></span>` +
        `<span class="cd-area-n">${docs.length}<small>document${docs.length === 1 ? '' : 's'}</small></span>` +
        `<span class="cd-area-d">${a.sub}</span>` +
      `</button>`;
    }).join('')}</div>`;
  };

  // one area's own documents, grouped by category when it has more than one (Company does;
  // Workers, Equipment and Materials are already a single category, so the rows show plainly)
  const renderArea = (key) => {
    const a = AREAS.find((x) => x.key === key);
    const shown = DATA.filter((d) => keep(d) && a.cats.includes(d.cat));
    const crumb = `<button type="button" class="cd-back" data-back>← All areas</button><div class="cd-area-head"><h2 class="co-h-l">${a.title}</h2><p class="co-muted">${a.sub}</p></div>`;
    if (!shown.length) { groupsEl.innerHTML = crumb + none(); return; }
    groupsEl.innerHTML = crumb + (a.cats.length > 1 ? a.cats.map((cat) => { const docs = shown.filter((d) => d.cat === cat); return docs.length ? group(cat, docs) : ''; }).join('') : `<div class="co-card co-list">${shown.map(row).join('')}</div>`);
  };

  // filtered across every area at once, so search always finds a document regardless of
  // where you are standing
  const renderFiltered = () => {
    const shown = DATA.filter((d) => keep(d));
    groupsEl.innerHTML = shown.length
      ? `<p class="co-muted cd-scope">Across every area.</p>` + CATS.map((cat) => { const docs = shown.filter((d) => d.cat === cat); return docs.length ? group(cat, docs) : ''; }).join('')
      : none();
  };

  const none = () => '<div class="co-card cd-none"><b class="co-row-n">No document matches that.</b><span class="co-subtle">Try a wider search, or fewer filters.</span><button type="button" class="btn btn-quiet btn-sm" data-clear>Clear the search and filters</button></div>';

  function render() {
    if (typeof syncCards === 'function') syncCards();
    if (filtering()) renderFiltered();
    else if (area) renderArea(area);
    else renderHome();

    const on = GROUPS.flatMap(([label, k]) => [...f[k]].map((v) => [label, k, v]));
    pills.hidden = !on.length;
    pills.innerHTML = on.map(([label, k, v]) => `<button type="button" class="co-pill" data-k="${k}" data-v="${v}" aria-label="Remove filter ${label}: ${v}"><span>${label}:</span><b>${v}</b><i aria-hidden="true">×</i></button>`).join('');
    const n = nOn(); btn.querySelector('[data-filt-n]').hidden = !n; btn.querySelector('[data-filt-n]').textContent = n;
    tools.querySelector('.co-tools-clear').hidden = !(n || f.q);
  }

  groupsEl.addEventListener('click', (e) => {
    const c = e.target.closest('[data-clear]'); if (c) { clearAll(); return; }
    const back = e.target.closest('[data-back]'); if (back) { area = null; render(); return; }
    const tile = e.target.closest('[data-area]'); if (tile) { area = tile.dataset.area; openRows.clear(); render(); groupsEl.scrollIntoView({ block: 'start' }); return; }
    const op = e.target.closest('[data-open]'); if (op) {
      const id = +op.dataset.open; openRows.has(id) ? openRows.delete(id) : openRows.add(id);
      render();
      const again = groupsEl.querySelector(`[data-open-row="${id}"]`); if (again) again.scrollIntoView({ block: 'nearest' });
      return;
    }
  });

  // each total is also a shortcut: a second click on the same one clears it again
  const cards = [...document.querySelectorAll('.cd-card')];
  const STATUS_SETS = { ok: ['In conformity'], pend: ['Pending', 'Pending approval'], bad: ['Non conform'] };
  cards.forEach((c) => c.addEventListener('click', () => {
    const key = c.dataset.status, was = c.classList.contains('is-on');
    clearAll();
    if (key && !was) { f.status = new Set(STATUS_SETS[key]); render(); if (!panel.hidden) paintFilters(); c.classList.add('is-on'); }
  }));
  // "On file" is the total, not a filter of its own, so it never outlines
  const syncCards = () => cards.forEach((c) => { const want = c.dataset.status && STATUS_SETS[c.dataset.status];
    c.classList.toggle('is-on', !!want && f.status.size === want.length && want.every((v) => f.status.has(v)) && !f.cat.size && !f.sharing.size && !f.q); });

  // ALMA's drop: takes a file by drag or by browsing, then files it against the contractor's
  // license (the one document already marked non conform), the same flow as the home page's
  // Documents section. Prototype: the file never leaves the machine.
  const drop = document.getElementById('cd-drop'), file = document.getElementById('cd-file');
  if (drop && file) {
    const t = document.getElementById('cd-drop-t'), sub = document.getElementById('cd-drop-s'), acts = document.getElementById('cd-drop-acts');
    let picked = null, state = 'idle';
    const setState = (st) => { state = st; drop.classList.toggle('has-file', st === 'file'); drop.classList.toggle('is-reading', st === 'reading'); drop.classList.toggle('is-filed', st === 'filed'); };
    const took = (f) => {
      if (!f || state === 'reading' || state === 'filed') return;
      picked = f;
      t.textContent = 'Got it: ' + f.name;
      sub.textContent = 'Hand it over and I will read it, date it and file it.';
      acts.hidden = false; setState('file');
      setTimeout(() => document.getElementById('cd-hand').focus({ preventScroll: true }), 50);
    };
    const browse = (e) => { e.preventDefault(); file.value = ''; file.click(); };
    drop.addEventListener('click', (e) => { if (state === 'idle' && !e.target.closest('button')) browse(e); });
    drop.addEventListener('keydown', (e) => { if (state === 'idle' && e.target === drop && (e.key === 'Enter' || e.key === ' ')) browse(e); });
    file.addEventListener('click', (e) => e.stopPropagation());
    file.addEventListener('change', () => took(file.files[0]));
    drop.addEventListener('dragover', (e) => { e.preventDefault(); if (state === 'idle' || state === 'file') drop.classList.add('is-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-over'); took(e.dataTransfer.files[0]); });
    document.getElementById('cd-again').addEventListener('click', (e) => { e.stopPropagation(); browse(e); });
    document.getElementById('cd-hand').addEventListener('click', (e) => {
      e.stopPropagation();
      if (state !== 'file') return;
      setState('reading'); acts.hidden = true;
      t.textContent = 'Reading ' + picked.name + '…';
      sub.textContent = 'Checking the issuer, the dates and the business it names.';
      setTimeout(() => {
        setState('filed');
        t.textContent = 'Filed: your contractor’s license, valid again.';
        sub.textContent = 'City of Wilmington · valid until 15 Aug 2027. Prototype: nothing was uploaded or saved.';
        const doc = DOCS.find((d) => d.code === 'E01');
        doc.status = 'ok'; doc.issued = '1 Oct 2026'; doc.valid = '15 Aug 2027'; doc.note = '';
        doc.text = fold(`${doc.code} ${doc.name} ${doc.cat}`);
        const live = DATA.find((d) => d.id === doc.id); Object.assign(live, doc);
        document.getElementById('cd-ok').textContent = DOCS.filter((d) => d.status === 'ok').length;
        document.getElementById('cd-bad').textContent = DOCS.filter((d) => d.status === 'bad').length;
        render(); syncCards();
      }, 2200);
    });
  }

  render();
})();
