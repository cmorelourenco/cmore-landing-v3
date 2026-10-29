/* Adding suppliers in bulk, from an Excel file (My suppliers, suppliers.html), the way people are
   invited in bulk on Team (js/team.js): Add a supplier (js/supplier-add.js) opens with "Adding many
   suppliers?", a template to download and the file to upload, then "or one by one". The file's list
   then takes the page's place: each supplier checked as Add a supplier would find it (on C-MORE,
   invited to your list; new, invited to join C-MORE; or what to fix), searched, filtered, sorted.
   Each is asked for its country's mandatory documents; a row (or a few ticked) opens a drawer to
   change the documents they're asked for, or they're left out of the list, before the invitations go.
   Prototype: read in the browser, nothing uploaded (SheetJS, loaded the first time it's needed). A
   file without the columns reads as a made-up list, so it can be tried without preparing one. */
(() => {
  const S = window.CM_SUPPLIERS, A = window.CMSupplierAdd, box = document.getElementById('sup-body');
  if (!S || !A || !box) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const ini = (n) => (String(n || '?').split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map((w) => w[0]).join('') || '?');
  const BEATRIZ = document.documentElement.dataset.persona === 'beatriz';
  const SHEETJS = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  let lib = null;
  const sheetjs = () => lib || (lib = new Promise((ok, no) => {
    if (window.XLSX) { ok(window.XLSX); return; }
    const s = Object.assign(document.createElement('script'), { src: SHEETJS, onload: () => ok(window.XLSX), onerror: () => { lib = null; no(new Error('load')); } });
    document.head.appendChild(s);
  }));

  // ---- reading the file --------------------------------------------------------------------------
  // the columns, by any of the names a file might give them (in English, Portuguese, Spanish…)
  const COLS = [
    ['email', ['email', 'e mail', 'contact email', 'email address', 'correio eletronico', 'correo electronico']],
    ['contact', ['contact name', 'contact', 'contact person', 'contacto', 'nome do contacto', 'persona de contacto']],
    ['code', ['nipc', 'nif', 'tax id', 'taxid', 'tax number', 'vat', 'vat number', 'company code', 'code', 'ein', 'cnpj', 'siren', 'kvk', 'kvk number', 'partita iva', 'nip', 'company number', 'ust idnr', 'registration number', 'enterprise number', 'nipc or tax id', 'numero de contribuinte']],
    ['country', ['country', 'pais', 'land', 'pays', 'paese', 'country code']],
    ['name', ['company name', 'company', 'name', 'supplier', 'supplier name', 'empresa', 'nome', 'nome da empresa', 'razao social', 'denominacao']],
  ];
  const colOf = (h) => { const k = fold(h); if (!k) return null; const hit = COLS.find(([, l]) => l.includes(k)); return hit ? hit[0] : null; };
  const HEAD = ['Country', 'NIPC or tax ID', 'Company name', 'Contact name', 'Contact email'];
  // a sheet's rows: the first row that names the Country and the code columns is the header
  const fromTable = (aoa) => {
    const at = aoa.findIndex((row) => { const m = row.map(colOf); return m.includes('country') && m.includes('code'); });
    if (at < 0) return null;
    const map = aoa[at].map(colOf);
    return aoa.slice(at + 1).map((cells, i) => {
      const r = { row: at + i + 2 };
      map.forEach((k, j) => { if (k && r[k] == null) r[k] = String(cells[j] == null ? '' : cells[j]).trim(); });
      return r;
    }).filter((r) => COLS.some(([k]) => r[k]));
  };
  // prototype only: a file without those columns reads as this list, the kinds of row an import meets
  const sample = () => {
    const mine = S.list().find((s) => s.status !== 'invited' && s.nipc);
    return (BEATRIZ ? [
      ['United States', '81-4472019', '', '', ''], ['Brazil', '33.401.288/0001-55', '', '', ''],
      ['United States', '47-1234567', 'Prairie Grain Co-op', 'Dale Hughes', 'dale@prairiegrain.test'],
      ['United States', '20-5539180', 'Blue Ridge Paper Supply', '', 'orders@blueridgepaper.test'],
      ['Brazil', '45.997.418/0001-53', 'Cooperativa Cafeeira do Cerrado', 'Marina Alves', 'marina@coopcerrado.test'],
      ['Colombia', '900123456', 'Café Andino S.A.S.', '', 'compras@cafeandino.test'],
      ['US', '36-4419822', 'Lakeside Mills Inc.', 'Rosa Diaz', ''],
      mine && ['United States', mine.nipc, mine.name, '', ''],
    ] : [
      ['Portugal', '503 117 285', '', '', ''], ['Spain', 'B36512874', '', '', ''], ['Portugal', '510 774 199', '', '', ''],
      ['Portugal', '509 812 333', 'Carpintaria Lopes, Lda.', 'Ana Lopes', 'ana@carpintarialopes.test'],
      ['PT', '508 406 196', 'Vidraria Atlântica', '', 'geral@vidrariaatlantica.test'],
      ['Portugal', '515 991 520', 'Eletro Sado, Lda.', 'Paulo Reis', 'paulo.reis@eletrosado.test'],
      ['France', '552 100 554', 'Échafaudages Durand SARL', 'Luc Durand', ''],
      ['Portugal', '123 456 780', 'Pavimentos Silva', '', 'pav.silva@mail.test'],
      ['Portugal', '503117285', 'Pinturas Ribeiro', '', ''],
      mine && ['Portugal', mine.nipc, mine.name, '', ''],
    ]).filter(Boolean).map((r, i) => ({ row: i + 2, country: r[0], code: r[1], name: r[2], contact: r[3], email: r[4] }));
  };

  // ---- each row, as Add a supplier would find it ---------------------------------------------------
  const ALIAS = { portugal: 'PT', espana: 'ES', spain: 'ES', espanha: 'ES', france: 'FR', franca: 'FR', germany: 'DE', alemanha: 'DE', deutschland: 'DE', italy: 'IT', italia: 'IT',
    netherlands: 'NL', holanda: 'NL', 'paises baixos': 'NL', belgium: 'BE', belgica: 'BE', poland: 'PL', polonia: 'PL', 'united kingdom': 'GB', uk: 'GB', 'reino unido': 'GB',
    'united states': 'US', usa: 'US', 'estados unidos': 'US', brazil: 'BR', brasil: 'BR' };
  const countryOf = (v) => {
    const k = fold(v); if (!k) return null;
    const by = A.COUNTRIES.find((c) => fold(c.code) === k || fold(c.name) === k);
    return by ? by.code : ALIAS[k] && A.COUNTRIES.some((c) => c.code === ALIAS[k]) ? ALIAS[k] : null;
  };
  const mandatory = (cc) => A.docsOf(cc).filter((d) => d.req).map((d) => d.code);
  const check = (rows) => {
    const seen = new Set();
    return rows.map((r) => {
      const out = Object.assign({}, r, { cc: countryOf(r.country), v: A.norm(r.code), ok: false, why: '' });
      const fail = (why) => Object.assign(out, { why });
      if (!out.cc) return fail(r.country ? 'Unknown country' : 'No country');
      const c = A.country(out.cc);
      Object.assign(out, { label: c.label, countryName: c.name });
      if (!out.v) return fail(`No ${c.label}`);
      const found = S.lookup(out.cc, out.v);
      if (found.mine) return Object.assign(fail('Already your supplier'), { mine: found.mine });
      if (!c.ok(out.v)) return fail(`Not a valid ${c.label}`);
      if (seen.has(out.cc + out.v)) return fail('Twice in this file');
      seen.add(out.cc + out.v);
      if (found.on) return Object.assign(out, { on: found.on, ok: true });
      const email = String(r.email || '').trim();
      if (!String(r.name || '').trim()) return fail('No company name');
      if (!email) return fail('No email');
      if (!A.emailOk(email)) return fail('Not an email address');
      return Object.assign(out, { ok: true });
    });
  };
  const nameOf = (r) => (r.on ? r.on.name : r.mine ? r.mine.name : String(r.name || '').trim());

  const css = `
.si-bulk { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem 1rem; padding: 0.875rem 1rem; border: 1px dashed var(--color-sand-400); border-radius: 0.75rem; background: var(--color-surface); font-size: 0.875rem; color: var(--color-ink-muted); }
.si-bulk b { color: var(--color-ink); font-weight: 600; }
.si-bulk.is-over { border-color: var(--color-coral); background: color-mix(in oklab, var(--color-coral) 6%, var(--color-surface)); }
.si-bulk-acts { display: flex; align-items: center; gap: 1rem; }
.si-bulk .btn-secondary { border: 0; background: var(--color-graphite); color: var(--color-off-white); font-weight: 600; transition: background-color .15s, transform .15s; } /* the upload: a live button, not the beige of a disabled one */
.si-bulk .btn-secondary:hover { background: var(--color-ink); color: var(--color-off-white); transform: translateY(-1px); }
.si-bulk .btn-secondary:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.si-bulk.is-file { border-style: solid; border-color: var(--color-line); }
.si-bulk-f { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.si-bulk-f small { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.si-bulk-ico { flex: none; display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; background: color-mix(in oklab, var(--color-positive, #3d7a2c) 12%, transparent); color: var(--color-positive, #3d7a2c); }
.si-bulk-ico svg { width: 1.125rem; height: 1.125rem; }
.si-or { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.si-or::before, .si-or::after { content: ""; flex: 1; height: 1px; background: var(--color-line); }
.si-err:empty { display: none; }
.si-err { font-size: 0.8125rem; color: var(--color-critical, #b3261e); }
.si-x { border: 0; background: none; padding: 0; font: inherit; font-size: 0.8125rem; color: var(--color-ink-subtle); text-decoration: underline; text-decoration-color: var(--color-line); text-underline-offset: 0.2em; cursor: pointer; }
.si-x:hover { color: var(--color-ink); text-decoration-color: var(--color-coral); }
.si-x:disabled { opacity: .5; cursor: wait; }
.si-card { display: grid; gap: 1rem; padding: 1.25rem; border-radius: 0.875rem; background: var(--color-light-beige); }
.si-card[hidden] { display: none; }
.si-card > h2 { font-size: 1.125rem; font-weight: 600; }
.si-rev { display: grid; gap: 0.875rem; }
.si-rev.has-bar { margin-bottom: 4.5rem; }
.si-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem 1rem; }
.si-q { position: relative; display: block; flex: 1 1 18rem; max-width: 26rem; }
.si-q svg { position: absolute; left: 0.75rem; top: 50%; translate: 0 -50%; width: 1rem; height: 1rem; color: var(--color-ink-subtle); pointer-events: none; }
.si-q .input { width: 100%; height: 2.5rem; padding-left: 2.25rem; font-size: 0.875rem; }
.si-chips { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; }
.si-chip { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.375rem 0.75rem; border: 1px solid var(--color-line); border-radius: 999px; background: var(--color-surface); font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.si-chip span { font-size: 0.75rem; color: var(--color-ink-subtle); }
.si-chip:hover { border-color: var(--color-sand-400); }
.si-chip[aria-pressed="true"] { border-color: var(--color-graphite); background: var(--color-graphite); color: var(--color-off-white); }
.si-chip[aria-pressed="true"] span { color: color-mix(in oklab, var(--color-off-white) 70%, transparent); }
.si-div { width: 1px; height: 1.25rem; margin: 0 0.25rem; background: var(--color-line); }
.si-wrap { max-height: 30rem; overflow: auto; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.si-rev table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.si-rev th, .si-rev td { padding: 0.625rem 0.75rem; text-align: left; vertical-align: middle; }
.si-rev thead th { position: sticky; top: 0; z-index: 1; background: var(--color-light-beige); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.si-rev tbody tr + tr { border-top: 1px solid var(--color-mid-beige); }
.si-rev tbody tr.is-bad td { color: var(--color-ink-subtle); }
.si-rev td small { display: block; color: var(--color-ink-subtle); }
.si-rev .co-badge { white-space: nowrap; }
.si-rev td[colspan] { padding: 1rem 0.75rem; text-align: center; color: var(--color-ink-subtle); }
.si-rev th.si-c, .si-rev td.si-c { width: 1rem; padding-right: 0; }
.si-rev th.si-c:last-child, .si-rev td.si-c:last-child { padding: 0.25rem 1rem 0.25rem 0.5rem; }
.si-sel { width: 1rem; height: 1rem; accent-color: var(--color-graphite); cursor: pointer; }
.si-rev tbody tr[data-si-i].is-ok { cursor: pointer; }
.si-rev tbody tr[data-si-i].is-ok:hover { background: color-mix(in oklab, var(--color-light-beige) 60%, transparent); }
.si-rev tbody tr.is-picked, .si-rev tbody tr.is-picked:hover { background: color-mix(in oklab, var(--color-coral) 6%, transparent); }
.si-rev tbody tr.is-changed { animation: si-flash 2.4s ease; }
@keyframes si-flash { 0%, 40% { background: color-mix(in oklab, var(--color-positive, #3d7a2c) 14%, transparent); } }
.si-sort { display: inline-flex; align-items: center; gap: 0.375rem; border: 0; background: none; padding: 0; font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; cursor: pointer; }
.si-sort span { opacity: .55; }
.si-sort:hover { color: var(--color-ink); }
.si-p { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.si-pic { flex: none; width: 2rem; height: 2rem; border-radius: 0.5rem; display: grid; place-items: center; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.75rem; font-weight: 600; }
.si-pic.is-new { background: none; border: 1.5px dashed var(--color-sand-400); color: var(--color-ink-subtle); }
.si-pt { min-width: 0; }
.si-pt b { display: block; font-weight: 600; color: var(--color-ink); }
.si-edit { display: inline-grid; place-items: center; text-decoration: none; width: 2rem; height: 2rem; padding: 0; border-radius: 0.375rem; color: var(--color-ink-subtle); opacity: 0.55; }
.si-edit svg { width: 1rem; height: 1rem; }
.si-rev tbody tr:hover .si-edit, .si-edit:focus-visible { opacity: 1; color: var(--color-ink); background: var(--color-surface); }
.si-f { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem 1rem; font-size: 0.875rem; color: var(--color-ink-muted); }
.si-a { flex: none; display: flex; align-items: center; gap: 1rem; }
.si-selbar { position: fixed; bottom: 1.5rem; left: 50%; translate: -50% 0; width: min(44rem, calc(100vw - 2rem)); z-index: 85; animation: si-sel-in .25s var(--ease-brand, ease); display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.625rem 0.75rem 0.625rem 1rem;
  border-radius: 0.75rem; background: var(--color-graphite); color: var(--color-off-white); box-shadow: 0 12px 28px -12px rgba(0,0,0,.45); }
@keyframes si-sel-in { from { opacity: 0; transform: translateY(10px); } }
@media (prefers-reduced-motion: reduce) { .si-selbar { animation: none; } }
.si-selbar-t { display: flex; align-items: baseline; gap: 0.625rem; min-width: 0; font-size: 0.875rem; }
.si-selbar-t span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: color-mix(in oklab, var(--color-off-white) 70%, transparent); }
.si-selbar .si-x { color: var(--color-off-white); text-decoration-color: color-mix(in oklab, var(--color-off-white) 40%, transparent); }
.si-who { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.si-who span { padding: 0.25rem 0.625rem; border-radius: 999px; background: var(--color-light-beige); font-size: 0.8125rem; color: var(--color-ink); }
.sa-docs small .si-only { color: var(--color-ink-muted); }
@media (max-width: 40rem) { .si-rev table { min-width: 40rem; } .si-edit { opacity: 1; } }`;
  const stl = document.createElement('style'); stl.textContent = css; document.head.appendChild(stl);

  const XLS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13l4 5M13 13l-4 5"/></svg>';
  const PEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
  const SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13l2 2 4-4"/></svg>';

  // ---- in Add a supplier: many at once, or one by one -----------------------------------------------
  let err = '';
  const banner = () => `<div class="si-bulk" id="si-bulk"><span><b>Adding many suppliers?</b> Upload an Excel file with their countries and company codes.</span><span class="si-bulk-acts"><button type="button" class="si-x" data-si-tpl>Download the template</button><button type="button" class="btn btn-secondary btn-sm" data-si-pick>Upload Excel file</button></span></div>
    <p class="si-err" id="si-err" role="alert">${esc(err)}</p>
    <div class="si-or">or one by one</div>`;
  const file = Object.assign(document.createElement('input'), { type: 'file', hidden: true, accept: '.xlsx,.xls,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel' });
  document.body.appendChild(file);
  // a problem with the file shows in Add a supplier's banner; opened for it when the picker came from elsewhere
  const say = (m) => { err = m; const p = document.getElementById('si-err'); if (p) p.textContent = m; else if (m) A.open(); };
  const pick = () => { say(''); file.value = ''; file.click(); };

  // ---- the list read from the file, in the page's place ----------------------------------------------
  const host = document.createElement('section');
  host.className = 'si-card'; host.hidden = true; host.setAttribute('aria-labelledby', 'si-h');
  box.parentNode.insertBefore(host, box);
  let bulk = null;
  const changed = new Set();
  const RANK = (r) => (r.ok ? (r.on ? 0 : 1) : 2);
  const view = () => { const f = bulk.f, q = fold(bulk.q || ''); return (r) => (!f.k || (f.k === 'on' ? r.ok && r.on : f.k === 'new' ? r.ok && !r.on : true)) && (!f.st || (f.st === 'ok') === r.ok) && (!q || fold(`${nameOf(r)} ${r.code} ${r.email || ''}`).includes(q)); };
  const docsLine = (r) => { const n = r.docs.size, m = mandatory(r.cc).filter((c) => r.docs.has(c)).length; return n ? `${n} document${n === 1 ? '' : 's'}<small>${m === n ? 'Mandatory' : m ? `${m} mandatory, ${n - m} optional` : 'Optional'}</small>` : '<small>None</small>'; };
  const review = () => {
    const rows = bulk.rows, ok = rows.filter((r) => r.ok).length, bad = rows.length - ok;
    const picked = bulk.picked, f = bulk.f, sort = bulk.sort;
    const hit = view();
    const key = { name: (r) => nameOf(r).toLowerCase() || '~', kind: RANK, status: (r) => (r.ok ? 1 : 0) }[sort.k];
    const order = rows.map((r, i) => i);
    if (key) order.sort((x, y) => { const p = key(rows[x]), q = key(rows[y]); return (p < q ? -1 : p > q ? 1 : x - y) * sort.dir; });
    const shown = order.filter((i) => hit(rows[i])), all = shown.length && shown.every((i) => picked.has(i));
    const sups = (n) => `${n} supplier${n === 1 ? '' : 's'}`;
    const chip = (k, v, label, n) => `<button type="button" class="si-chip" data-si-f="${k}:${v}" aria-pressed="${f[k] === v}">${label} <span>${n}</span></button>`;
    const th = (k, label) => `<th${sort.k === k ? ` aria-sort="${sort.dir > 0 ? 'ascending' : 'descending'}"` : ''}><button type="button" class="si-sort" data-si-sort="${k}">${label}<span aria-hidden="true">${sort.k === k ? (sort.dir > 0 ? '&uarr;' : '&darr;') : '&varr;'}</span></button></th>`;
    const on = rows.filter((r) => r.ok && r.on).length;
    const tr = (i) => {
      const r = rows[i], nm = nameOf(r);
      const sub = r.mine ? [r.mine.city, `${S.WORDS.id} ${r.mine.nipc}`] : [r.countryName || r.country, r.code ? `${r.label || 'Code'} ${r.code}` : ''];
      const inv = !r.ok ? '<small>&mdash;</small>' : r.on ? 'To your supplier list<small>On C&#8209;MORE</small>' : `To join C&#8209;MORE<small>${esc(r.email)}</small>`;
      return `<tr class="${r.ok ? 'is-ok' : 'is-bad'}${picked.has(i) ? ' is-picked' : ''}${changed.has(i) ? ' is-changed' : ''}"${hit(r) ? '' : ' hidden'} data-si-i="${i}">
        <td class="si-c"><input type="checkbox" class="si-sel" data-si-row="${i}" aria-label="Select ${esc(nm || `row ${r.row}`)}"${picked.has(i) ? ' checked' : ''}></td>
        <td><span class="si-p"><span class="si-pic${r.on || r.mine ? '' : ' is-new'}" aria-hidden="true">${esc(ini(nm))}</span><span class="si-pt"><b>${esc(nm || '—')}</b><small>${esc(sub.filter(Boolean).join(' · '))} &middot; row ${r.row}</small></span></span></td>
        <td>${inv}</td><td>${r.ok ? docsLine(r) : '<small>&mdash;</small>'}</td>
        <td>${r.ok ? '<span class="co-badge b-ok">Ready</span>' : `<span class="co-badge b-over">${esc(r.why)}</span>`}</td>
        <td class="si-c">${r.ok ? `<button type="button" class="si-x si-edit" data-si-edit="${i}" aria-label="Change the documents asked of ${esc(nm)}" title="Change documents">${PEN}</button>` : ''}</td></tr>`;
    };
    const names = [...picked].map((i) => rows[i]).filter(Boolean).map((r) => esc(nameOf(r) || `Row ${r.row}`));
    const pickedOk = [...picked].some((i) => rows[i] && rows[i].ok);
    return `<h2 id="si-h">Add suppliers from Excel</h2>
      <div class="si-rev${picked.size ? ' has-bar' : ''}">
      <div class="si-bulk is-file"><span class="si-bulk-f"><span class="si-bulk-ico">${XLS}</span><span><b>${esc(bulk.file)}</b><small>${sups(rows.length)}: ${ok} ready${bad ? `, ${bad} to fix in the file` : ''}</small></span></span>
        <span class="si-bulk-acts"><button type="button" class="si-x" data-si-pick>Choose another file</button></span></div>
      <p class="si-err" id="si-err" role="alert">${esc(err)}</p>
      <div class="si-tools">
        <label class="si-q">${SEARCH}<input class="input" type="search" data-si-q placeholder="Search by name, code or email" aria-label="Search the list by name, code or email" value="${esc(bulk.q || '')}"></label>
        <div class="si-chips" role="group" aria-label="Show">${chip('k', '', 'Everyone', rows.length)}${on ? chip('k', 'on', 'On C&#8209;MORE', on) : ''}${ok - on ? chip('k', 'new', 'New to C&#8209;MORE', ok - on) : ''}${bad ? `<span class="si-div" aria-hidden="true"></span>${chip('st', 'ok', 'Ready', ok)}${chip('st', 'bad', 'To fix', bad)}` : ''}</div>
      </div>
      <div class="si-wrap"><table><thead><tr><th class="si-c"><input type="checkbox" class="si-sel" data-si-all aria-label="Select everyone shown"${all ? ' checked' : ''}></th>${th('name', 'Supplier')}${th('kind', 'Invitation')}<th>Documents</th>${th('status', 'Status')}<th class="si-c"><span class="sr-only">Change documents</span></th></tr></thead>
        <tbody>${order.map(tr).join('')}<tr class="si-none"${shown.length ? ' hidden' : ''}><td colspan="6">No supplier on the list matches that.</td></tr></tbody></table></div>
      <div class="si-f"><span>${bad ? 'Rows to fix are left out. Fix them in the file and upload it again, or send the ready ones now.' : `Showing ${shown.length} of ${sups(rows.length)}. Select one to change the documents they&rsquo;re asked for.`}</span>
        <span class="si-a"><button type="button" class="si-x" data-si-cancel>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-si-send${ok ? '' : ' disabled'}>Send ${ok} invitation${ok === 1 ? '' : 's'}</button></span></div>
      ${picked.size ? `<div class="si-selbar" role="region" aria-label="Selected on the list"><span class="si-selbar-t"><b>${picked.size} selected</b><span>${names.join(', ')}</span></span><span class="si-a"><button type="button" class="si-x" data-si-unpick>Clear</button><button type="button" class="si-x" data-si-remove>Remove from the list</button>${pickedOk ? '<button type="button" class="btn btn-primary btn-sm" data-si-docs>Change documents</button>' : ''}</span></div>` : ''}
    </div>`;
  };
  // a repaint keeps the list scrolled where it was
  const paint = (focus) => {
    document.dispatchEvent(new CustomEvent('cm-sup-review', { detail: !!bulk })); // ALMA's setup panel makes room (js/guided-upload.js)
    if (!bulk) { host.hidden = true; host.innerHTML = ''; box.hidden = false; return; }
    const w = host.querySelector('.si-wrap'), top = w ? w.scrollTop : 0;
    host.innerHTML = review(); host.hidden = false; box.hidden = true;
    const w2 = host.querySelector('.si-wrap'); if (w2) w2.scrollTop = top;
    if (focus) { const el = host.querySelector(focus); if (el) el.focus({ preventScroll: true }); }
  };
  const start = (name, rows) => {
    const checked = check(rows);
    checked.forEach((r) => { r.docs = new Set(r.ok ? mandatory(r.cc) : []); });
    bulk = { file: name, rows: checked, picked: new Set(), f: { k: '', st: '' }, sort: { k: '', dir: 1 }, q: '' };
    err = ''; changed.clear();
    if (A.isOpen()) A.close();
    paint();
    host.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const load = async (f) => {
    if (!f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) { say('That isn’t an Excel file. Save it as Excel (.xlsx) or CSV and try again.'); return; }
    try {
      const XL = await sheetjs(), wb = XL.read(await f.arrayBuffer(), { type: 'array' });
      const rows = fromTable(XL.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' }));
      if (rows && !rows.length) { say('That file has no rows. Use the template: one supplier a row, starting with their country.'); return; }
      start(f.name, rows || sample());
    } catch (e) { say(e.message === 'load' ? 'The Excel reader didn’t load. Check your connection and try again.' : 'That file couldn’t be read. Save it as Excel (.xlsx) or CSV and try again.'); }
  };
  const template = async (b) => {
    if (b) b.disabled = true;
    try {
      const XL = await sheetjs(), wb = XL.utils.book_new();
      const ws = XL.utils.aoa_to_sheet([HEAD, BEATRIZ ? ['United States', '12-3456789', 'Example Farms LLC', 'Jane Smith', 'jane@example.com'] : ['Portugal', '509 812 333', 'Exemplo, Lda.', 'Joana Silva', 'joana.silva@example.com']]);
      ws['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 32 }, { wch: 24 }, { wch: 32 }];
      XL.utils.book_append_sheet(wb, ws, 'Suppliers');
      const how = XL.utils.aoa_to_sheet([['How to fill it in'], [],
        ['One row per supplier, under the column names in the Suppliers sheet. Replace the example row.'],
        ['Country: the country’s name or its two-letter code (PT, ES, US…).'],
        ['NIPC or tax ID: their company code in their country (NIPC in Portugal, NIF in Spain, EIN in the US…). Keep the cells as text so no leading zero is lost.'],
        ['Company name and Contact email: needed when they’re not on C-MORE yet, so we can invite them to join.'],
        ['Contact name: optional.'], [],
        ['Each supplier is asked for its country’s mandatory documents. You can change that on C-MORE before the invitations go.']]);
      how['!cols'] = [{ wch: 110 }];
      XL.utils.book_append_sheet(wb, how, 'How to fill it in');
      XL.writeFile(wb, 'C-MORE suppliers template.xlsx');
    } catch (e) { say('The template couldn’t be made. Check your connection and try again.'); }
    if (b) b.disabled = false;
  };

  // ---- the drawer: the documents the suppliers picked on the list are asked for -----------------------
  const dw = document.createElement('div');
  dw.className = 'docd sa'; dw.hidden = true;
  dw.innerHTML = `<div class="docd-scrim" data-sid-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="sid-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${DOC}</span><div class="docd-t"><h3 id="sid-t">Documents to ask for</h3><p id="sid-sub"></p></div>
        <button type="button" class="dlg-x" data-sid-x aria-label="Close">${X}</button></header>
      <form class="docd-body" id="sid-body" novalidate></form>
      <footer class="docd-foot"><span></span><span class="sa-acts"><button type="button" class="link-btn" data-sid-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" id="sid-go" data-sid-apply>Apply</button></span></footer>
    </aside>`;
  document.body.appendChild(dw);
  let ed = null; // { rows: [index], picked: Set }
  const edRows = () => ed.rows.map((i) => bulk.rows[i]);
  // what any of them can be asked for: mandatory where it's mandatory in a supplier's own country,
  // and each one asked only of the suppliers in a country it applies to
  const edDocs = () => {
    const ccs = [...new Set(edRows().map((r) => r.cc))], byCode = new Map();
    ccs.forEach((cc) => A.docsOf(cc).forEach((d) => {
      const x = byCode.get(d.code) || Object.assign({}, d, { req: false, ccs: [] });
      if (d.req) { x.req = true; x.section = 'Mandatory'; }
      x.ccs.push(cc); byCode.set(d.code, x);
    }));
    const list = [...byCode.values()];
    return list.filter((d) => d.req).concat(list.filter((d) => !d.req)).map((d) => Object.assign(d, { only: d.ccs.length < ccs.length ? d.ccs : null }));
  };
  const groups = (list) => list.reduce((g, d) => { (g[d.section] = g[d.section] || []).push(d); return g; }, {});
  const onlyIn = (d) => (d.only ? ` &middot; <span class="si-only">only for suppliers in ${d.only.map((cc) => esc(A.country(cc).name)).join(', ')}</span>` : '');
  const edPaint = () => {
    const list = edDocs(), g = groups(list), n = list.filter((d) => ed.picked.has(d.code)).length, rs = edRows();
    dw.querySelector('#sid-sub').textContent = rs.length === 1 ? nameOf(rs[0]) : `${rs.length} suppliers from ${bulk.file}`;
    dw.querySelector('#sid-body').innerHTML = `<section class="sa-card"><h4>${rs.length === 1 ? 'What you need from them' : `For these ${rs.length} suppliers`}</h4>
        ${rs.length > 1 ? `<div class="si-who">${rs.map((r) => `<span>${esc(nameOf(r))}</span>`).join('')}</div>` : ''}
        <p>The documents they&rsquo;ll be asked to share with you. ${rs.length > 1 ? 'Each supplier is asked only for the ones that apply in their country.' : ''}</p></section>
      <div class="sa-all"><label class="sa-ck"><input type="checkbox" data-all${n === list.length ? ' checked' : ''}>Select all</label><span><b id="sid-n">${n}</b> of ${list.length} selected</span></div>
      ${Object.entries(g).map(([sec, l]) => { const c = l.filter((d) => ed.picked.has(d.code)).length; return `<section class="sa-grp"><div class="sa-grp-h"><label class="sa-ck"><input type="checkbox" data-sec="${esc(sec)}"${c === l.length ? ' checked' : ''}>${esc(sec)}</label><span>${c} of ${l.length}</span></div>
        <ul class="sa-docs">${l.map((d) => `<li><label><input type="checkbox" data-doc="${esc(d.code)}"${ed.picked.has(d.code) ? ' checked' : ''}><span><b>${esc(d.name)}</b><small>${esc(d.code)}${d.req ? ' &middot; Mandatory' : ' &middot; Optional'}${onlyIn(d)}</small></span></label></li>`).join('')}</ul></section>`; }).join('')}`;
    marks();
  };
  const marks = () => {
    const list = edDocs(), g = groups(list);
    dw.querySelectorAll('[data-sec]').forEach((b) => { const l = g[b.dataset.sec], k = l.filter((d) => ed.picked.has(d.code)).length; b.checked = k === l.length; b.indeterminate = k > 0 && k < l.length; b.closest('.sa-grp-h').querySelector('span').textContent = `${k} of ${l.length}`; });
    const all = dw.querySelector('[data-all]'), n = list.filter((d) => ed.picked.has(d.code)).length;
    if (all) { all.checked = n === list.length; all.indeterminate = n > 0 && n < list.length; }
    dw.querySelector('#sid-n').textContent = n;
    const go = dw.querySelector('#sid-go'); go.disabled = !n; go.textContent = ed.rows.length === 1 ? 'Apply' : `Apply to ${ed.rows.length}`;
  };
  let edBack = null;
  const edOpen = (rows) => {
    rows = rows.filter((i) => bulk.rows[i] && bulk.rows[i].ok); if (!rows.length) return;
    // ticked: what every one of them it applies to is asked for already
    const rs = rows.map((i) => bulk.rows[i]), applies = (r, c) => A.docsOf(r.cc).some((d) => d.code === c);
    const any = new Set(rs.flatMap((r) => [...r.docs]));
    ed = { rows, picked: new Set([...any].filter((c) => rs.every((r) => !applies(r, c) || r.docs.has(c)))) };
    edBack = document.activeElement; dw.hidden = false; document.documentElement.style.overflow = 'hidden'; edPaint();
    dw.querySelector('#sid-body').scrollTop = 0;
    setTimeout(() => dw.classList.add('is-open'), 20);
    setTimeout(() => dw.querySelector('.docd-panel').focus(), 300);
  };
  const edClose = () => {
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { dw.hidden = true; }, 280); ed = null; if (edBack && edBack.isConnected) edBack.focus();
  };
  dw.addEventListener('click', (e) => {
    if (!ed) return;
    if (e.target.closest('[data-sid-x]')) { edClose(); return; }
    if (e.target.closest('[data-sid-apply]')) {
      const list = edDocs();
      ed.rows.forEach((i) => { const r = bulk.rows[i], here = new Set(A.docsOf(r.cc).map((d) => d.code)); r.docs = new Set(list.filter((d) => ed.picked.has(d.code) && here.has(d.code)).map((d) => d.code)); });
      changed.clear(); ed.rows.forEach((i) => changed.add(i));
      bulk.picked = new Set(); edClose(); paint();
      setTimeout(() => { changed.clear(); host.querySelectorAll('tr.is-changed').forEach((x) => x.classList.remove('is-changed')); }, 2400);
    }
  });
  dw.addEventListener('change', (e) => {
    if (!ed) return;
    const t = e.target;
    if (t.matches('[data-doc]')) { ed.picked[t.checked ? 'add' : 'delete'](t.dataset.doc); marks(); return; }
    if (t.matches('[data-sec]')) { groups(edDocs())[t.dataset.sec].forEach((d) => ed.picked[t.checked ? 'add' : 'delete'](d.code)); dw.querySelectorAll('[data-doc]').forEach((b) => { b.checked = ed.picked.has(b.dataset.doc); }); marks(); return; }
    if (t.matches('[data-all]')) { edDocs().forEach((d) => ed.picked[t.checked ? 'add' : 'delete'](d.code)); dw.querySelectorAll('[data-doc]').forEach((b) => { b.checked = t.checked; }); marks(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && ed) edClose(); });

  // ---- sending, and leaving --------------------------------------------------------------------------
  const send = () => {
    const go = bulk.rows.filter((r) => r.ok), today = A.today();
    go.forEach((r, i) => {
      const c = A.country(r.cc), list = A.docsOf(r.cc).filter((d) => r.docs.has(d.code)), name = nameOf(r);
      S.addInvite({
        id: `${S.slug(name)}-${(Date.now() + i).toString(36).slice(-4)}`, name, city: r.on ? r.on.city : '', services: r.on ? r.on.services : [],
        country: c.code, countryName: c.name, idLabel: c.label, code: r.code, email: r.on ? '' : r.email.trim(), contact: r.on ? '' : String(r.contact || '').trim(),
        onCmore: !!r.on, invited: today, note: '', imported: bulk.file,
        docs: list.map((d) => d.code), required: list.filter((d) => d.req).map((d) => d.code),
        names: Object.fromEntries(list.map((d) => [d.code, d.name])), sections: Object.fromEntries(list.map((d) => [d.code, d.home || d.section])),
      });
    });
    const on = go.filter((r) => r.on).length;
    bulk = null; paint();
    if (window.CMSupPage) window.CMSupPage.refresh();
    A.toast(`${go.length} supplier${go.length === 1 ? '' : 's'} invited: ${on} to your supplier list, ${go.length - on} to join C‑MORE.`);
  };
  const drop = () => {
    bulk.rows = bulk.rows.filter((r, i) => !bulk.picked.has(i)); bulk.picked = new Set(); changed.clear();
    if (!bulk.rows.length) { bulk = null; paint(); A.toast('Everyone on the list was removed. Nothing was sent.'); return; }
    paint();
  };

  // ---- the events -------------------------------------------------------------------------------------
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-si-tpl]')) { template(t.closest('[data-si-tpl]')); return; }
    if (t.closest('[data-si-pick]')) { pick(); return; }
    if (!bulk || !host.contains(t)) return;
    if (t.closest('[data-si-cancel]')) { bulk = null; paint(); return; }
    if (t.closest('[data-si-send]')) { send(); return; }
    if (t.closest('[data-si-unpick]')) { bulk.picked = new Set(); paint(); return; }
    if (t.closest('[data-si-remove]')) { drop(); return; }
    if (t.closest('[data-si-docs]')) { edOpen([...bulk.picked]); return; }
    const ed1 = t.closest('[data-si-edit]') || (!t.closest('input, button, a, label, .si-c') && t.closest('tr.is-ok[data-si-i]'));
    if (ed1) { const i = +(ed1.dataset.siEdit || ed1.dataset.siI); edOpen([i]); return; }
    const bf = t.closest('[data-si-f]');
    if (bf) { const [k, v] = bf.dataset.siF.split(':'); bulk.f[k] = bulk.f[k] === v && v ? '' : v; paint(`[data-si-f="${bf.dataset.siF}"]`); return; }
    const bs = t.closest('[data-si-sort]');
    if (bs) { const k = bs.dataset.siSort, o = bulk.sort; bulk.sort = { k, dir: o.k === k ? -o.dir : 1 }; paint(`[data-si-sort="${k}"]`); }
  });
  host.addEventListener('change', (e) => {
    if (!bulk || !e.target.matches('[data-si-row], [data-si-all]')) return;
    const p = bulk.picked;
    if (e.target.matches('[data-si-all]')) host.querySelectorAll('[data-si-row]').forEach((c) => { if (!c.closest('tr').hidden) { const i = +c.dataset.siRow; if (e.target.checked) p.add(i); else p.delete(i); } });
    else { const i = +e.target.dataset.siRow; if (e.target.checked) p.add(i); else p.delete(i); }
    paint(e.target.matches('[data-si-all]') ? '[data-si-all]' : `[data-si-row="${e.target.dataset.siRow}"]`);
  });
  // searching the list: rows hide as you type (no repaint, so the field keeps its focus)
  host.addEventListener('input', (e) => {
    if (!bulk || !e.target.matches('[data-si-q]')) return;
    bulk.q = e.target.value; const hit = view();
    host.querySelectorAll('tr[data-si-i]').forEach((tr) => { tr.hidden = !hit(bulk.rows[+tr.dataset.siI]); });
    const none = host.querySelector('.si-none'); if (none) none.hidden = !!host.querySelector('tr[data-si-i]:not([hidden])');
  });
  host.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-si-q]')) e.preventDefault(); });
  file.addEventListener('change', () => load(file.files[0]));
  // a file dropped on the banner
  ['dragover', 'dragenter'].forEach((ev) => document.addEventListener(ev, (e) => { const z = e.target.closest && e.target.closest('#si-bulk'); if (z) { e.preventDefault(); z.classList.add('is-over'); } }));
  document.addEventListener('dragleave', (e) => { const z = e.target.closest && e.target.closest('#si-bulk'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
  document.addEventListener('drop', (e) => { const z = e.target.closest && e.target.closest('#si-bulk'); if (z) { e.preventDefault(); z.classList.remove('is-over'); load(e.dataTransfer.files[0]); } });

  window.CMSupplierImport = { banner, load, template, pick, active: () => !!bulk };
})();
