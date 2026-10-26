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
    // profile completion: the share of documents asked of the company that are in order
    const asked = M.DOCS.filter(M.counted), ok = asked.filter(M.isOk).length;
    const pct = asked.length ? Math.round((ok / asked.length) * 100) : 0;
    const meter = $('co-meter');
    if (meter) { meter.firstElementChild.style.width = pct + '%'; meter.setAttribute('aria-valuenow', String(pct)); }
    if ($('co-pct')) $('co-pct').textContent = pct + '%';
    if ($('co-left')) $('co-left').textContent = need.length ? ` · ${need.length} document${need.length === 1 ? '' : 's'} to sort out, starting with the ${need[0].name.toLowerCase().replace(/^h&s/, 'H&S')}.` : ' · every document in order.';
  };
  tbl.tBodies[0].addEventListener('click', (e) => { const r = e.target.closest('tr[data-code]'); if (r) go(r.dataset.code); });
  tbl.tBodies[0].addEventListener('keydown', (e) => { const r = e.target.closest('tr[data-code]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(r.dataset.code); } });
  if (window.CMUpload) window.CMUpload.wire(tbl.tBodies[0], () => render());
  render();
  return { render };
})();
