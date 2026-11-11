/* The company homepage's documents: the counts in "Your compliance", the profile-completion strip
   and the "Documents requiring attention" table, all read from the same model as the Documents
   page (js/doc-model.js), so the two always agree. Supplier documents (the last rows) are the
   suppliers' own and stay as they are; the company's own take a new file from their row. */
window.HOME_DOCS = (() => {
  const M = window.DOC_MODEL;
  const tbl = document.querySelector('#filled .co-docs-tbl');
  if (!M || !tbl) return { render() {} };
  const $ = (id) => document.getElementById(id);
  const CAT = { company: 'Company', workers: 'Worker', equipment: 'Equipment', products: 'Product' };
  const SHOW = 8; // the most urgent; the rest are one click away in Documents
  // the earliest date among a roster's flagged records, or the document's own expiry
  const dateOf = (d) => {
    if (!d.kind) return d.valid && d.valid !== '—' ? d.valid : '&mdash;';
    const flagged = d.roster.filter((r) => M.RANK[r.status] > 0 && r.exp && r.exp !== '—');
    return flagged.length ? flagged.map((r) => r.exp).sort((a, b) => new Date(a) - new Date(b))[0] : '&mdash;';
  };
  // why it is here, in a line: ALMA's note, or what is wrong with the people or machines it covers
  const why = (d) => {
    if (d.kind) {
      const bad = d.roster.filter((r) => M.RANK[r.status] > 0), noun = M.NOUN[d.kind];
      const by = {}; bad.forEach((r) => { by[r.status] = (by[r.status] || 0) + 1; });
      return `${bad.length} ${noun[bad.length === 1 ? 0 : 1]}: ` + Object.entries(by).map(([s, n]) => `${n} ${M.STATUS[s][0].toLowerCase()}`).join(', ') + '.';
    }
    if (d.note) return d.note;
    return d.status === 'missing' ? (M.canNa(d) ? 'Not uploaded yet, or mark it not applicable.' : 'Not uploaded yet.') : '';
  };
  const supplierRows = [...tbl.tBodies[0].rows].filter((r) => !r.dataset.code).map((r) => r.outerHTML).join('');
  const go = (code) => { location.href = `company-details.html?open=${encodeURIComponent(code)}`; };

  // Profile completion is the setup's (js/guided-upload.js, for a new company). The demo company's
  // setup is done: what it asked for is its registration documents (CM_COMPANY_DOCS.mandatory) and the
  // company-wide mandatory documents of Workers and Equipment (one file each, not person by person,
  // which is Documents' business), each in once it's on file; and a subsector for every sector,
  // which is mandatory (js/co-profile.js). { all, done, pct, docsLeft: [{ area, d }], noSub }
  const ON_FILE = (d) => !!d && !['missing', 'notuploaded'].includes(d.status);
  const demoCompletion = () => {
    const reg = (window.CM_COMPANY_DOCS && M.PROFILE ? window.CM_COMPANY_DOCS.mandatory(M.PROFILE.country) : []).map((c) => M.DOCS.find((d) => d.code === c.code)).filter(Boolean);
    const wide = M.DOCS.filter((d) => ['workers', 'equipment'].includes(d.area) && !d.kind && /^Mandatory/.test(d.requirement || ''));
    const docs = reg.map((d) => ({ area: 'registration', d })).concat(wide.map((d) => ({ area: d.area, d })));
    const docsLeft = docs.filter((x) => !ON_FILE(x.d));
    const P = window.CO_PROFILE, pr = P && P.subsMissing ? P.load() : null;
    const noSub = pr ? (pr.sectors ? P.subsMissing(pr) : ['']) : [];
    const all = docs.length + (pr ? 1 : 0), done = all - docsLeft.length - (noSub.length ? 1 : 0);
    return { all, done, pct: all ? Math.round((done / all) * 100) : 100, docsLeft, noSub };
  };
  const TITLE = { registration: 'Registration', company: 'Company', workers: 'Workers', equipment: 'Equipment' };
  const leftLine = (c) => {
    if (window.CMGuided && window.CMGuided.leftLine) return window.CMGuided.leftLine(c);
    if (c.pct === 100) return 'every document asked of you is in, and your profile is complete.';
    const P = window.CO_PROFILE, l = c.docsLeft;
    const sub = !c.noSub.length ? '' : c.noSub[0] ? `choose a subsector for ${c.noSub.map((k) => P.label(P.SECTORS, k)).join(' and ')}` : 'choose your sector and subsector';
    const docs = l.length ? `${l.length} document${l.length === 1 ? '' : 's'} left: ${[...new Set(l.map((x) => x.area))].map((a) => `${l.filter((x) => x.area === a).length} in ${TITLE[a]}`).join(', ')}` : '';
    return [sub, docs].filter(Boolean).join(', and ') + '.';
  };
  const render = () => {
    const need = M.needing();
    // the table: the most urgent first, the suppliers' own after them
    tbl.tBodies[0].innerHTML = need.slice(0, SHOW).map((d) => {
      const [label, cls] = M.STATUS[d.status];
      // a file for it from here too: Upload / Replace beside its status, or dropped onto the row (js/doc-upload.js)
      const up = window.CMUpload ? window.CMUpload.button(`doc:${d.id}`, !d.kind && !window.CMUpload.NO_FILE.includes(d.status), d.name, true) : '';
      return `<tr data-code="${d.code}" tabindex="0" role="link"${up ? ` data-drop="doc:${d.id}"` : ''}><td><span class="n">${M.esc(d.name)}</span><span class="d">${why(d)}</span></td><td>Your company</td><td class="c">${CAT[d.area] || 'Company'}</td><td class="c">${dateOf(d)}</td><td class="c"><span class="co-docs-st"><span class="co-badge ${cls}">${label}</span>${up}</span></td></tr>`;
    }).join('') + supplierRows;
    const all = tbl.closest('.co-sec').querySelector('.co-pager-all');
    if (all) all.textContent = need.length > SHOW ? `View all ${need.length} in Documents` : 'View all';
    // the documents card, and the headline over the three cards
    const card = $('co-k-docs');
    if (card) {
      card.querySelector('.co-k-n').textContent = need.length;
      const miss = need.filter((d) => d.status === 'missing').length, exp = need.filter((d) => d.status === 'expired').length;
      const m = $('co-k-docs-miss'), x = $('co-k-docs-exp');
      if (m) { m.querySelector('b').textContent = miss; m.classList.toggle('is-zero', !miss); }
      if (x) { x.querySelector('b').textContent = exp; x.classList.toggle('is-zero', !exp); }
      const others = [...document.querySelectorAll('#filled .co-k')].filter((k) => k !== card).reduce((n, k) => n + (+(k.querySelector('.co-k-n') || {}).textContent || 0), 0);
      const head = $('co-k-head-n'); if (head) head.textContent = `${need.length + others} things`;
    }
    // profile completion: the setup's, what it asks for and a subsector for each sector (js/guided-upload.js,
    // which draws it again once it's loaded); until then, the documents asked for that are on file
    const G = window.CMGuided && window.CMGuided.completion ? window.CMGuided : null;
    const c = G ? G.completion() : demoCompletion();
    const pct = c.pct;
    const meter = $('co-meter');
    if (meter) { meter.firstElementChild.style.width = pct + '%'; meter.firstElementChild.style.background = pct === 100 ? 'var(--color-ok, #a6d8a0)' : ''; meter.setAttribute('aria-valuenow', String(pct)); }
    if ($('co-pct')) $('co-pct').textContent = pct + '%';
    if ($('co-left')) $('co-left').textContent = ' · ' + leftLine(c);
    // Finish company profile: ALMA on the first section with a document left; or the subsector; or done
    const fin = document.querySelector('#filled .co-strip .co-wrap > a');
    if (fin) {
      const a2 = fin.cloneNode(false); a2.removeAttribute('onclick');
      if (c.pct === 100) { a2.href = 'company-details.html'; a2.textContent = 'View documents'; }
      else if (c.docsLeft.length) { a2.href = '#'; a2.textContent = 'Finish company profile'; const area = c.docsLeft[0].area; a2.addEventListener('click', (e) => { e.preventDefault(); if (G) G.open(area); else go(c.docsLeft[0].d.code); }); }
      else { a2.href = 'company-profile.html?need=sub#activity'; a2.textContent = 'Finish company profile'; }
      fin.replaceWith(a2);
    }
  };
  tbl.tBodies[0].addEventListener('click', (e) => { const r = e.target.closest('tr[data-code]'); if (r) go(r.dataset.code); });
  tbl.tBodies[0].addEventListener('keydown', (e) => { const r = e.target.closest('tr[data-code]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(r.dataset.code); } });
  if (window.CMUpload) window.CMUpload.wire(tbl.tBodies[0], () => render());
  render();
  return { render };
})();
