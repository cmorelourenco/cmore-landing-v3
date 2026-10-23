/* Documents: every document a company keeps on C-MORE. Nothing about which documents exist, or
   which ones a company is asked for, lives in this file:
     - js/doc-catalog.js (window.DOC_CATALOG) is the C-MORE Document Catalog, generated from the
       workbook by tools/catalog2js.py — names, sections, requirement, level, sharing, fields;
     - js/doc-rules.js (window.DocRules) decides, from the catalog and the company's profile
       (country, sector, employees, equipment, service types), which documents reach this company,
       and which workers, machines or products a per-record document covers.
   The demo company's records and the state of each of its documents live in js/doc-model.js
   (window.DOC_MODEL), shared with the company homepage; this file is the page that shows them.
   Sites are left out while that area is reworked. */
(() => {
  const { CAT, R, LBL, en, esc, byCode, MONTHS, PERSONA, WORKERS, EQUIPMENT, PRODUCTS, NONEU, SPECIAL_RISK, OPERATORS, STREETS, SITES, nif, PERSON, RENTALS, MACHINE, DEMO, D, PROFILE, STATUS, STATUSES, RANK, counted, worstOf, AREA_META, LEVEL_OF, NOUN, BY_LEVEL, recordName, recordSub, recordTag, issuerOf, refOf, shown, DOCS, AREAS, AREA_TITLE, TAIL, GROUPS_OF, isOk, isPend, isBad, fold, textOf, NA_KEY, naMarks, saveNa, me, today, NA_REASONS, reasonsFor, canNa, markNa, undoNa, DATA } = window.DOC_MODEL;
  const counts = (list) => {
    const l = list.filter(counted);
    document.getElementById('cd-total').textContent = l.length;
    document.getElementById('cd-ok').textContent = l.filter(isOk).length;
    document.getElementById('cd-pend').textContent = l.filter(isPend).length;
    document.getElementById('cd-bad').textContent = l.filter(isBad).length;
  };
  const needsAttention = (d) => RANK[d.status] > 0;

  const f = { q: '', sec: new Set(), req: new Set(), sharing: new Set(), status: new Set() };
  const GROUPS = [['Section', 'sec', (d) => d.groupLabel], ['Requirement', 'req', (d) => d.requirement || 'Archived'], ['Sharing', 'sharing', (d) => d.sharing], ['Status', 'status', (d) => STATUS[d.status][0]]];
  const vals = (d, fn) => [].concat(fn(d));
  const keep = (d, skip) => (!f.q || d.text.includes(f.q)) && GROUPS.every(([, k, fn]) => k === skip || !f[k].size || vals(d, fn).some((v) => f[k].has(v)));
  const nOn = () => GROUPS.reduce((n, [, k]) => n + f[k].size, 0);
  const filtering = () => !!(f.q || nOn());

  const groupsEl = document.getElementById('cd-groups');
  const tools = document.querySelector('[data-tools-for="cd-tbl"]');
  const pills = document.querySelector('[data-pills]');
  const q = tools.querySelector('[data-q]'), btn = tools.querySelector('[data-filt-btn]'), panel = tools.querySelector('[data-filt-panel]');

  let area = null; // null = every area, at the top; otherwise one of AREAS[].key
  let detail = null; // the id of a per-record document whose roster is open, or null
  let worker = null; // the index of a worker whose own page is open, or null
  let machine = null; // the index of a machine whose own page is open, or null
  const open = new Set(); // ids of document rows expanded to show their versions
  let detailQ = '';
  let detailFilter = { status: new Set(), tag: new Set() };
  let detailFiltOpen = false;
  const resetDetailFilter = () => { detailFilter = { status: new Set(), tag: new Set() }; detailFiltOpen = false; };
  const docById = (id) => DOCS.find((d) => d.id === id);

  const CHEV_R = '<svg class="cd-row-chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.92 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"/></svg>';
  const CHEV_D = '<svg class="cd-row-chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>';
  const PEN = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z"/><path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z"/></svg>';
  const TICK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>';
  const X = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>';
  const dash = '<span class="co-subtle">&mdash;</span>';

  // ---- one document's row ----------------------------------------------------------------------------
  // The catalog's columns, the same in every table: Document, Belongs to, Status, ALMA confidence,
  // Reference no., Issued by, Issue date, Expiry date, Edited by user. A per-record document opens its
  // roster; any other row opens the document in a drawer, and its chevron lists earlier versions.
  const belongsTo = (d) => {
    if (d.kind) return d.roster.length ? `${d.roster.length} ${NOUN[d.kind][d.roster.length === 1 ? 0 : 1]}` : dash;
    return { all_workers: 'All workers', per_worker: 'A worker', per_equipment: 'A machine', per_product: 'A product' }[d.level] || 'Company';
  };
  const hash = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100003, 11);
  const NO_FILE = ['missing', 'na', 'notrequested', 'notuploaded', 'filemissing'];
  // how sure ALMA is of its reading: a percentage, and the band it falls in. A document it flagged
  // reads lower; one still being read has none yet; data typed in with no file has nothing to read
  const confOf = (d, salt = '') => {
    if (NO_FILE.includes(d.status)) return null;
    if (d.status === 'processing') return 'reading';
    if (typeof d.conf === 'number' && !salt) return d.conf; // as ALMA read it on upload
    const h = hash(d.code + (d.archivedCode || '') + salt + PERSONA);
    return d.status === 'attention' ? 58 + (h % 15) : 86 + (h % 14);
  };
  // shown as a tag, not a number — the same badge as the Status column, so the two read alike
  const band = (p) => (p >= 90 ? ['High', 'b-ok', 'Read cleanly, and it matches the profile.'] : p >= 75 ? ['Medium', 'b-pend', 'Read well, but worth a glance.'] : ['Low', 'b-over', 'ALMA isn&rsquo;t sure of something here &mdash; check it against the file.']);
  const confCell = (p) => {
    if (p === 'reading') return '<span class="co-badge b-neu">Reading&hellip;</span>';
    if (p == null) return dash;
    const [b, cls, why] = band(p);
    return `<span class="co-badge ${cls}" title="${why}">${b} confidence</span>`;
  };
  // a roster row reads as sure as its least sure record
  const rosterConf = (d) => { const l = d.roster.filter((r) => !NO_FILE.includes(r.status)).map((r) => (r.status === 'attention' ? 61 : 86 + (hash(d.code + r.i) % 14))); return l.length ? Math.min(...l) : null; };

  // ---- earlier versions ---------------------------------------------------------------------------
  // Every document keeps the versions it replaced. A monthly one has last month's, and the month
  // before; a yearly one last year's; one renewed on change, the one before the change. Prototype:
  // made up from each document's renewal rule and its current issue date, the same every time.
  const MON = MONTHS;
  const parse = (s) => { const m = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(s || ''); return m ? new Date(+m[3], MON.indexOf(m[2]), +m[1]) : null; };
  const fmt = (dt) => `${dt.getDate()} ${MON[dt.getMonth()]} ${dt.getFullYear()}`;
  const addM = (dt, n) => new Date(dt.getFullYear(), dt.getMonth() + n, Math.min(dt.getDate(), 28));
  const versionsOf = (d) => {
    // a company added in this session has only the file it just uploaded
    if (d.kind || NO_FILE.includes(d.status) || d.status === 'archived' || window.DOC_MODEL.ORG) return [];
    const now = parse(d.issued); if (!now) return [];
    const r = (d.cat.renewal || '').toLowerCase(), h = hash(d.code);
    const monthly = /month/.test(r) && !/6/.test(r);
    const step = monthly ? 1 : /6|six/.test(r) ? 6 : /3 years/.test(r) ? 36 : /1.2 years/.test(r) ? 18 : /change|revision|amend|plan|client|entry|delivery|transport|assembly|posting|product/.test(r) || !r ? 0 : 12;
    const n = monthly ? 4 : step ? 2 + (h % 2) : 1;
    const gap = step || 14 + (h % 18);
    const who = monthly ? ['Ana Rocha, accountant', 'Ana Rocha, accountant', 'Miguel Ferreira'] : ['Miguel Ferreira', 'Helena Ferreira'];
    const out = [];
    let replacedOn = now;
    for (let k = 1; k <= n; k++) {
      const issued = addM(now, -gap * k);
      const expires = d.valid === 'No expiry' ? 'No expiry' : monthly ? fmt(addM(issued, 1)) : fmt(addM(issued, step || 12));
      out.push({
        label: monthly ? `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][issued.getMonth()]} ${issued.getFullYear()}` : `Version of ${fmt(issued)}`,
        issued: fmt(issued), valid: expires, replaced: fmt(replacedOn), by: who[k % who.length],
        ref: d.ref ? refOf(d.code + k, String(issued.getFullYear())) : '', conf: 86 + (hash(d.code + k) % 13),
      });
      replacedOn = issued;
    }
    return out;
  };

  const citeFor = (d) => {
    const fl = d.cat.fields || [];
    if (d.status === 'attention') { const k = fl.findIndex((f) => !valueOf(d, f)); return k < 0 ? 0 : k; }
    const k = fl.findIndex((f) => /expiry|valid until|validity|end date|next exam|next inspection/i.test(f.name) && valueOf(d, f));
    return k;
  };
  const row = (d) => {
    const [label, cls] = STATUS[d.status];
    const hasRoster = !!(d.kind && d.roster.length);
    const attn = hasRoster ? d.roster.filter((r) => RANK[r.status] > 0).length : 0;
    const alert = attn ? `<span class="cd-row-alert">${attn}</span>` : '';
    const isOpen = open.has(d.id);
    // the Versions column: how many there are (the current one and those it replaced), and a
    // dropdown that lists them under the row; a per-record document keeps its roster instead
    const nv = hasRoster || NO_FILE.includes(d.status) || d.status === 'processing' ? 0 : versionsOf(d).length + 1;
    const opener = hasRoster ? `<span class="cd-row-open" aria-hidden="true">${CHEV_R}</span>`
      : nv ? `<button type="button" class="cd-vbtn${isOpen ? ' is-open' : ''}" data-expand="${d.id}" aria-expanded="${isOpen}" aria-label="${nv} version${nv === 1 ? '' : 's'} of ${esc(d.name)}">${nv} version${nv === 1 ? '' : 's'}${CHEV_D}</button>` : dash;
    const attrs = (hasRoster ? ` data-detail="${d.id}" role="link"` : ` data-open="${d.id}" role="button" aria-label="Open ${esc(d.name)}"`) + ` data-row-id="${d.id}" tabindex="0"`;
    const meta = [d.code || d.archivedCode, d.requirement, d.sharing !== 'Standard' ? d.sharing : ''].filter(Boolean).join(' &middot; ');
    // the reason a row is as it is (ALMA's note, or why it doesn't apply) gets a line of its own under
    // the row, across the whole table, rather than wrapping inside the narrow Document column
    const naQ = canNa(d) && d.status === 'missing' ? `<button type="button" class="cd-na-q" data-na="${d.id}">Doesn&rsquo;t apply to you?</button>` : '';
    const plain = (h) => h.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, (m) => ({ '&rsquo;': '’', '&mdash;': '—', '&middot;': '·', '&amp;': '&', '&nbsp;': ' ' }[m] || ' '));
    const who = d.status === 'na' ? '<b>Not applicable</b>' : '<b class="is-alma">ALMA</b>';
    const citeAt = !d.kind && ['expired', 'expiring', 'attention'].includes(d.status) ? citeFor(d) : -1;
    const citeQ = citeAt >= 0 ? `<button type="button" class="cd-na-q" data-row-cite="${d.id}:${citeAt}">View citation</button>` : '';
    const noteRow = d.note || naQ ? `<tr class="cd-note-tr${d.status === 'na' ? ' is-na' : ''}${isOpen ? ' is-open' : ''}" data-note-for="${d.id}"><td colspan="9"><span class="cd-note-l">${d.note ? `<span class="cd-note-t" title="${esc(plain(d.note))}">${who}<span class="cd-note-s">&middot;</span>${d.note}</span>` : ''}${citeQ}${naQ}</span></td></tr>` : '';
    const ed = d.edited ? `<span class="cd-edited" title="Edited by user: a change to ALMA&rsquo;s reading, logged and visible to clients">${PEN}<span class="sr-only">Edited by user</span></span>` : '';
    return `<tr class="cd-row is-rosterable${d.status === 'archived' ? ' is-archived' : ''}${isOpen ? ' is-open' : ''}${noteRow ? ' has-note' : ''}"${attrs}>` +
      `<td><span class="n">${esc(d.name)}${alert}${ed}</span><span class="d">${meta}</span></td>` +
      `<td>${belongsTo(d)}</td>` +
      `<td><span class="co-badge ${cls}">${label}</span></td>` +
      `<td>${confCell(hasRoster ? rosterConf(d) : confOf(d))}</td>` +
      `<td class="cd-ref">${d.ref || dash}</td>` +
      `<td class="cd-by">${d.by && !['missing', 'na', 'notrequested', 'notuploaded'].includes(d.status) ? esc(d.by).replace(/&amp;(\w+;)/g, '&$1') : dash}</td>` +
      `<td class="c">${d.issued === '—' ? dash : d.issued}</td><td class="c">${d.valid === '—' ? dash : d.valid}</td>` +
      `<td class="cd-ed">${opener}</td></tr>` + noteRow + (isOpen ? history(d) : '');
  };

  // a row opened by its chevron: the current version, then each one it replaced, newest first;
  // any of them opens in the drawer (earlier ones read-only)
  const history = (d) => {
    const vs = versionsOf(d);
    const cur = NO_FILE.includes(d.status) ? '' : `<tr class="is-cur" data-version="${d.id}:0" tabindex="0" role="button"><td><b>Current</b><span class="d">${d.status === 'archived' ? 'Archived' : 'In use'} &middot; ${esc(d.ref || '—')}</span></td><td>${d.issued === '—' ? dash : d.issued}</td><td>${d.valid === '—' ? dash : d.valid}</td><td>${dash}</td><td>${confCell(confOf(d))}</td><td class="cd-h-go">Open</td></tr>`;
    const rows = vs.map((v, k) => `<tr data-version="${d.id}:${k + 1}" tabindex="0" role="button"><td><b>${esc(v.label)}</b><span class="d">Archived &middot; ${esc(v.ref || '—')} &middot; uploaded by ${escE(v.by)}</span></td><td>${v.issued}</td><td>${v.valid}</td><td>${v.replaced}</td><td>${confCell(v.conf)}</td><td class="cd-h-go">Open</td></tr>`).join('');
    const empty = !cur && !rows ? `<p class="cd-h-none">No versions yet. Once a file is uploaded, every version it replaces is kept here.</p>`
      : !rows ? `<p class="cd-h-none">No earlier versions: this is the first one on C&#8209;MORE.</p>` : '';
    return `<tr class="cd-exp"><td colspan="9"><div class="cd-hist">
      <div class="cd-h-head"><b>Versions</b><span class="co-subtle">${vs.length ? `${vs.length} earlier version${vs.length === 1 ? '' : 's'}, kept read-only` : ''}</span></div>
      ${cur || rows ? `<table class="cd-h-tbl"><thead><tr><th>Version</th><th>Issue date</th><th>Expiry date</th><th>Replaced on</th><th>ALMA confidence</th><th><span class="sr-only">Open</span></th></tr></thead><tbody>${cur}${rows}</tbody></table>` : ''}${empty}
    </div></td></tr>`;
  };

  // what ALMA read from a document, field by field, where the demo knows it
  const valueOf = (d, field) => {
    if (NO_FILE.includes(d.status) && d.status !== 'filemissing') return null;
    const n = field.name.toLowerCase();
    if (/(provider|insurer|issuer|lessor|certification body).*tax number/.test(n)) return d.by ? '5' + String(100000000 + hash(d.by) * 977).slice(-8).replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3') : null;
    if (/expiry|valid until|validity|end date|next exam|next inspection/.test(n)) return d.valid !== '—' ? d.valid : null;
    if (/issue date|date of issue|issued on|^date$/.test(n)) return d.issued !== '—' ? d.issued : null;
    if (/(certificate|policy|licence|license|reference|registration|document|report) (no|number)|^number$|reference/.test(n)) return d.ref || null;
    if (/issuer|issued by|insurer|certification body|authority|provider/.test(n)) return d.by || null;
    // the company's own tax number, before 'holder' or 'company' can claim the field for the name
    if (/tax number|nipc|\bnif\b/.test(n)) { const k = Object.keys(D.facts).find((x) => /tax number/.test(x)); return k ? D.facts[k] : null; }
    if (/legal name|company name|policyholder|holder|insured|organization|supplier name/.test(n)) return D.company;
    const known = Object.keys(D.facts).find((k) => new RegExp(k).test(n));
    return known ? D.facts[known] : null;
  };

  // ---- the document, in a drawer ------------------------------------------------------------------
  // The same drawer as a questionnaire's evidence (.docd): the file on the left of the eye, what ALMA
  // read from it, how sure it is, and what the catalog says about the document. Previous / Next walk
  // the documents on screen. Prototype: the page is drawn from the document's own data, not a file.
  const DOC_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const LI = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.08 10l3.71 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>';
  const dw = document.createElement('div');
  dw.className = 'docd cdd'; dw.hidden = true;
  dw.innerHTML = `<div class="docd-scrim" data-close></div>
    <aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="cdd-title" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${DOC_I}</span><div class="docd-t"><h3 id="cdd-title"></h3><p id="cdd-sub"></p></div>
        <button type="button" class="dlg-x" data-close aria-label="Close the document">${XI}</button></header>
      <div class="docd-bar"><span id="cdd-page"></span><span id="cdd-conf"></span></div>
      <div class="docd-body" id="cdd-body"></div>
      <footer class="docd-foot"><span id="cdd-foot"></span><span class="cdd-acts" id="cdd-acts"></span></footer>
      <div class="docd-nav" role="group" aria-label="Documents on this page">
        <button type="button" class="docd-step" id="cdd-prev">${LI}Previous document</button><span id="cdd-count"></span>
        <button type="button" class="docd-step is-next" id="cdd-next">Next document${LI}</button></div>
    </aside>`;
  document.body.appendChild(dw);
  const dq = (id) => dw.querySelector('#' + id), dPanel = dw.querySelector('.docd-panel');
  let dState = null, dLast = null;
  const escE = (s) => esc(s).replace(/&amp;(#?\w+;)/g, '&$1');
  // HTML entities in the demo's names (Constru&ccedil;&otilde;es) back to plain text
  const decode = (h) => { const el = document.createElement('textarea'); el.innerHTML = h; return el.value; };
  const sheetFor = (d, v, fields) => {
    const titles = (d.cat.titles || d.name).split(';')[0].trim();
    const rowsHtml = fields.map((x, i) => Object.assign({ i }, x)).filter((x) => x.value).slice(0, 7).map((x) => `<tr data-f="${x.i}"><th>${esc(x.name)}</th><td><mark class="${x.flag ? 'is-flag' : ''}">${x.value}</mark></td></tr>`).join('');
    const seed = hash(d.code + (v ? v.issued : ''));
    const filler = ['This certificate is issued at the request of the entity named above, for the purposes set out in the applicable legislation, and reflects the records held on the date of issue.',
      'Its validity may be confirmed online with the access code printed below, during the period stated. Any alteration renders it void.',
      'The information above corresponds to the situation recorded at the time of issue and does not cover obligations falling due after that date.'];
    return `<article class="docd-sheet cdd-sheet"><p class="docd-kicker">${escE(d.by || issuerOf(d.cat) || 'Issuer')}</p>
      <h4>${esc(titles)}</h4>
      <table class="cdd-ftbl"><tbody>${rowsHtml}</tbody></table>
      <p>${filler[seed % 3]}</p><p>${filler[(seed + 1) % 3]}</p>
      <div class="cdd-sign"><span>Issued ${esc(v ? v.issued : d.issued)}</span><span>${escE(d.by || issuerOf(d.cat) || '')}</span></div>
      <div class="docd-rule"><span>${esc(d.code || d.archivedCode)} &middot; ${esc(d.ref || v && v.ref || '')}</span><span>1 / ${1 + (seed % 3)}</span></div></article>`;
  };
  const drawDoc = () => {
    const d = docById(dState.list[dState.k]), vk = dState.v || 0, vs = versionsOf(d), v = vk ? vs[vk - 1] : null;
    const view = v ? Object.assign({}, d, { issued: v.issued, valid: v.valid, ref: v.ref, status: 'archived' }) : d;
    const conf = v ? v.conf : confOf(d);
    const [label, cls] = STATUS[view.status];
    dq('cdd-title').textContent = d.name + (v ? ` · ${v.label}` : '');
    dq('cdd-sub').innerHTML = `${esc(d.code || d.archivedCode)} &middot; ${esc(d.requirement || 'Archived')} &middot; <span class="co-badge ${cls}">${v ? 'Earlier version' : label}</span>`;
    const raw = (d.cat.fields || []).map((fl) => valueOf(view, fl));
    const flagAt = !v && d.status === 'attention' ? Math.max(0, raw.findIndex((x) => !x)) : -1;
    const fields = (d.cat.fields || []).map((fl, i) => {
      const flag = i === flagAt;
      const value = flag && !raw[i] ? '<span class="cdd-unread">Couldn&rsquo;t read it</span>' : raw[i];
      return { name: fl.name, type: fl.type, value, flag, conf: value ? (flag ? 41 + (hash(d.code) % 12) : Math.min(99, (typeof conf === 'number' ? conf : 90) + (hash(d.code + i) % 9) - 3)) : null, shared: fl.visibleToClients, req: fl.requiredToSave };
    });
    const hasFile = !NO_FILE.includes(view.status) && view.status !== 'processing';
    // each value's citation, as in a questionnaire: the file, the page and part of it, the passage
    // with the value marked. Prototype: the passage is built from the field and its value.
    const file = `${d.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${((v ? v.issued : d.issued).match(/\d{4}/) || [''])[0]}.pdf`;
    const partOf = (n) => (/date|expir|valid|until|next/i.test(n) ? 'Validity' : /sign|representative|officer/i.test(n) ? 'Signatures' : /number|reference|code|nif|tax/i.test(n) ? 'Identification' : 'Particulars');
    const cites = fields.map((x, i) => {
      if (!hasFile || !x.value) return null;
      const val = decode(x.value.replace(/<[^>]+>/g, ''));
      const page = 1; // the fields are all on the page the preview shows
      if (x.flag) return { src: file, loc: `Page ${page} · ${partOf(x.name)}, where the scan is cut off`, quote: `${x.name}: [the line is cut off at the edge of the scan]`, match: '[the line is cut off at the edge of the scan]', unread: true };
      return { src: file, loc: `Page ${page} · ${partOf(x.name)}`, quote: `${x.name}: ${val}`, match: val };
    });
    const citeOpen = dState.cite == null ? -1 : dState.cite;
    const citeHtml = (cte, i) => {
      const at = cte.quote.indexOf(cte.match);
      const body = at < 0 ? esc(cte.quote) : esc(cte.quote.slice(0, at)) + `<mark${cte.unread ? ' class="is-flag"' : ''}>` + esc(cte.match) + '</mark>' + esc(cte.quote.slice(at + cte.match.length));
      return `<figure class="esgq-src cdd-src" id="cdd-cite-${i}"${i === citeOpen ? '' : ' hidden'}><figcaption><b>${esc(cte.src)}</b><span>${esc(cte.loc)}</span></figcaption><blockquote>&ldquo;${body}&rdquo;</blockquote><button type="button" class="esgq-src-open" data-cite-show="${i}">Show on the page</button></figure>`;
    };
    dq('cdd-page').textContent = hasFile ? (v ? `Earlier version · replaced ${v.replaced}` : 'Current version') : view.status === 'na' ? 'Not applicable to this company' : view.status === 'processing' ? 'ALMA is reading it' : view.status === 'filemissing' ? 'Data typed in, no file yet' : 'No file yet';
    dq('cdd-conf').innerHTML = typeof conf === 'number' ? confCell(conf) : conf === 'reading' ? confCell(conf) : '';
    const read = fields.length && view.status !== 'na' ? `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><table class="cd-fields"><tbody>${fields.map((x, i) => `<tr class="${x.flag ? 'is-flag' : ''}"><td><span class="n">${esc(x.name)}</span><span class="d">${esc(x.type)}${x.shared ? '' : ' &middot; not shared with clients'}</span></td><td>${x.value || `<span class="co-subtle">${hasFile ? 'Not on this document' : 'Read by ALMA on upload'}</span>`}${x.flag ? '<span class="cdd-why">ALMA isn&rsquo;t sure of this one &mdash; check it against the file.</span>' : ''}${cites[i] ? `<button type="button" class="esgq-src-btn" data-cite="${i}" aria-expanded="${i === citeOpen}" aria-controls="cdd-cite-${i}">${i === citeOpen ? 'Hide citation' : 'View citation'}</button>${citeHtml(cites[i], i)}` : ''}</td><td>${x.conf ? confCell(x.conf) : ''}</td></tr>`).join('')}</tbody></table></section>` : '';
    const c = d.cat;
    const facts = [['Requirement', LBL.requirement[c.requirement] + (c.appliesWhen && !['on_request', 'optional'].includes(c.requirement) ? ` &middot; <span class="co-subtle">${esc(c.appliesWhen)}</span>` : '')],
      ['Renewal', esc(c.renewal || '—')], ['Expiry', esc(c.expiryRule || '—')], ['Shared with', c.sharing === 'standard' ? 'Every client you share your profile with' : esc(LBL.sharing[c.sharing])], ['Legal basis', esc(c.legalBasis || '—')]]
      .map(([k, val]) => `<div class="pd-kv"><dt>${k}</dt><dd>${val}</dd></div>`).join('');
    const about = `<section class="cdd-card"><h4 class="eyebrow">About this document</h4><p class="cdd-desc">${esc(en(c.description))}</p><dl class="pd-grid cdd-facts">${facts}</dl></section>`;
    const none = view.status === 'na' ? '' : `<div class="docd-none"><span class="docd-ico" aria-hidden="true">${DOC_I}</span><h4>${view.status === 'processing' ? 'ALMA is reading it' : 'No file yet'}</h4><p>${view.status === 'processing' ? 'It takes up to two minutes. The fields below fill in as she reads them.' : 'Drop it on ALMA, or upload it here: she reads it, dates it and files it.'}</p></div>`;
    // marked not applicable: the reason, who and when, and the way back
    const naCard = !v && d.status === 'na' ? `<section class="cdd-card cdd-na-on"><h4 class="eyebrow">Not applicable</h4><p class="cdd-na-r">&ldquo;${d.note}&rdquo;</p>
      <p class="cdd-na-m">${d.naBy ? `Marked by ${esc(d.naBy)}${d.naOn ? ' on ' + esc(d.naOn) : ''} &middot; ` : ''}Your clients see this reason, and it counts as compliant.</p>
      ${canNa(d) ? '<button type="button" class="btn btn-quiet btn-sm" data-na-undo>Undo &mdash; it does apply</button>' : ''}</section>` : '';
    // the form: a reason from the catalog's 'Applies when', or one of your own
    const naForm = !v && dState.na && canNa(d) && d.status !== 'na' ? `<form class="cdd-card cdd-na-f" id="cdd-na-f" novalidate>
      <h4 class="eyebrow">Doesn&rsquo;t apply to us</h4>
      <p class="cdd-desc">It applies ${esc((c.appliesWhen || '').charAt(0).toLowerCase() + (c.appliesWhen || '').slice(1))}. Tell your clients why it doesn&rsquo;t apply to you &mdash; they will see the reason.</p>
      <div class="cdd-na-opts" role="radiogroup" aria-label="Reason">${reasonsFor(d).map((r, i) => `<label><input type="radio" name="na-r" value="${i}"><span>${r}</span></label>`).join('')}
        <label><input type="radio" name="na-r" value="own"><span>Another reason</span></label></div>
      <textarea class="cdd-na-t" id="cdd-na-t" rows="2" placeholder="In a sentence, why it doesn&rsquo;t apply" hidden></textarea>
      ${hasFile ? '<p class="cdd-na-w">Its current file stays in its versions, read-only.</p>' : ''}
      <div class="cdd-na-acts"><button type="button" class="link-btn" data-na-cancel>Cancel</button><button type="submit" class="btn btn-primary btn-sm" id="cdd-na-go" disabled>Mark as not applicable</button></div>
    </form>` : '';
    dq('cdd-body').innerHTML = naForm + naCard + (hasFile ? sheetFor(d, v, fields) : none) + read + about;
    dq('cdd-body').scrollTop = 0;
    dq('cdd-foot').textContent = v ? `Read-only. Uploaded by ${v.by}; replaced on ${v.replaced}.` : hasFile ? (d.edited ? 'Edited by user: changes to ALMA’s reading are logged and visible to clients.' : `Issued ${d.issued}${d.valid && d.valid !== '—' ? ' · ' + (/^\d/.test(d.valid) ? 'expires ' : '') + d.valid : ''}`) : '';
    dq('cdd-acts').innerHTML = v ? `<button type="button" class="btn btn-quiet btn-sm" data-cdd-cur>Back to current version</button>`
      : (canNa(d) && d.status !== 'na' && !dState.na ? '<button type="button" class="link-btn" data-na-open>Doesn&rsquo;t apply to us</button>' : '')
      + (d.status === 'na' ? '' : `<button type="button" class="btn btn-quiet btn-sm" data-cdd-up>${hasFile ? 'Upload a new version' : 'Upload it'}</button>`);
    const n = dState.list.length;
    dw.querySelector('.docd-nav').hidden = n < 2 || !!v;
    dq('cdd-count').textContent = `${dState.k + 1} of ${n}`;
    dq('cdd-prev').disabled = dState.k <= 0; dq('cdd-next').disabled = dState.k >= n - 1;
  };
  const openDrawer = (id, v = 0, na = false, cite = null) => {
    // the documents on screen, in order, are what Previous / Next walk through
    const list = [...groupsEl.querySelectorAll('[data-open]')].map((r) => +r.dataset.open);
    if (!list.includes(id)) list.push(id);
    dState = { list, k: list.indexOf(id), v, na, cite };
    drawDoc();
    if (na) setTimeout(() => { const first = dw.querySelector('[name="na-r"]'); if (first) first.focus(); }, dw.hidden ? 340 : 30);
    // opened at a citation: bring it into view
    if (cite != null) setTimeout(() => { const f = dw.querySelector('#cdd-cite-' + cite); if (f) f.closest('tr').scrollIntoView({ block: 'center' }); }, dw.hidden ? 360 : 40);
    if (dw.hidden) { dLast = document.activeElement; dw.hidden = false; requestAnimationFrame(() => dw.classList.add('is-open')); document.documentElement.classList.add('dlg-open'); setTimeout(() => dPanel.focus({ preventScroll: true }), 320); }
  };
  const closeDrawer = () => {
    dw.classList.remove('is-open'); document.documentElement.classList.remove('dlg-open');
    setTimeout(() => { dw.hidden = true; }, 300);
    if (dLast && dLast.focus) dLast.focus({ preventScroll: true });
  };
  const stepDoc = (s) => { if (!dState) return; const k = dState.k + s; if (k < 0 || k >= dState.list.length) return; dState.k = k; dState.v = 0; dState.na = false; dState.cite = null; drawDoc(); };
  dq('cdd-prev').addEventListener('click', () => stepDoc(-1));
  dq('cdd-next').addEventListener('click', () => stepDoc(1));
  dw.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeDrawer(); return; }
    if (e.target.closest('[data-cdd-cur]')) { dState.v = 0; drawDoc(); return; }
    const up = e.target.closest('[data-cdd-up]');
    if (up) { up.textContent = 'Prototype: drop it on ALMA at the top of the page'; up.disabled = true; return; }
    if (e.target.closest('[data-na-open]')) { dState.na = true; drawDoc(); const first = dw.querySelector('[name="na-r"]'); if (first) first.focus(); return; }
    if (e.target.closest('[data-na-cancel]')) { dState.na = false; drawDoc(); return; }
    // a citation: open or close it in place, or show its line on the page
    const cb = e.target.closest('[data-cite]');
    if (cb) {
      const fig = dw.querySelector('#cdd-cite-' + cb.dataset.cite), open = fig.hidden;
      fig.hidden = !open; cb.setAttribute('aria-expanded', String(open)); cb.textContent = open ? 'Hide citation' : 'View citation';
      return;
    }
    const sh = e.target.closest('[data-cite-show]');
    if (sh) {
      const line = dw.querySelector(`.cdd-ftbl tr[data-f="${sh.dataset.citeShow}"]`);
      if (line) { line.scrollIntoView({ behavior: 'smooth', block: 'center' }); line.classList.remove('is-cited'); void line.offsetWidth; line.classList.add('is-cited'); }
      return;
    }
    if (e.target.closest('[data-na-undo]')) { undoNa(docById(dState.list[dState.k])); dState.na = false; render(); drawDoc(); return; }
  });
  // the reason: one of the suggestions, or your own sentence
  const naReason = () => {
    const r = dw.querySelector('[name="na-r"]:checked'); if (!r) return '';
    if (r.value === 'own') return esc(dw.querySelector('#cdd-na-t').value.trim());
    return reasonsFor(docById(dState.list[dState.k]))[+r.value];
  };
  dw.addEventListener('change', (e) => {
    if (e.target.name !== 'na-r') return;
    const own = e.target.value === 'own', ta = dw.querySelector('#cdd-na-t');
    ta.hidden = !own; if (own) ta.focus();
    dw.querySelector('#cdd-na-go').disabled = !naReason();
  });
  dw.addEventListener('input', (e) => { if (e.target.id === 'cdd-na-t') dw.querySelector('#cdd-na-go').disabled = !naReason(); });
  dw.addEventListener('submit', (e) => {
    if (e.target.id !== 'cdd-na-f') return;
    e.preventDefault();
    const reason = naReason(); if (!reason) return;
    markNa(docById(dState.list[dState.k]), reason); dState.na = false;
    render(); drawDoc();
  });
  document.addEventListener('keydown', (e) => {
    if (dw.hidden) return;
    if (e.key === 'Escape') { e.stopPropagation(); closeDrawer(); }
    else if (e.target.closest && e.target.closest('input, textarea')) return;
    else if (e.key === 'ArrowLeft' && !dState.v) stepDoc(-1);
    else if (e.key === 'ArrowRight' && !dState.v) stepDoc(1);
  });

  // ---- a per-record document's roster, its own page ---------------------------------------------
  const renderDetail = (id) => {
    const doc = docById(id), kind = doc.kind;
    const fq = fold(detailQ);
    const tagLabel = kind === 'workers' ? 'Role' : kind === 'equipment' ? 'Type' : null;
    const items = doc.roster.map((r) => ({ i: r.i, name: recordName(kind, r.i), sub: recordSub(kind, r.i), status: r.status, exp: r.exp, tag: recordTag(kind, r.i), text: fold(recordName(kind, r.i)) }));
    const dKeep = (it, skip) => (!fq || it.text.includes(fq))
      && (skip === 'status' || !detailFilter.status.size || detailFilter.status.has(it.status))
      && (skip === 'tag' || !detailFilter.tag.size || (it.tag && detailFilter.tag.has(it.tag)));
    const list = items.filter((it) => dKeep(it, null));
    const nOnD = detailFilter.status.size + detailFilter.tag.size;
    const crumb = `<div class="cd-area-head"><h2 class="co-h-l">${esc(doc.name)}</h2><p class="co-muted">${doc.code} &middot; ${doc.requirement} &middot; one per ${NOUN[kind][0]}, ${items.length} on file.${doc.cat.condition ? ` <span class="co-subtle">Applies ${esc(doc.cat.appliesWhen.charAt(0).toLowerCase() + doc.cat.appliesWhen.slice(1))}.</span>` : ''}</p></div>`;
    const statusVals = STATUSES.filter((s) => items.some((it) => it.status === s));
    const tagVals = tagLabel ? [...new Set(items.map((it) => it.tag).filter(Boolean))].sort() : [];
    const panelHtml = detailFiltOpen ? '<div class="co-filt-list">'
      + '<div class="co-menu-h">Status</div>' + statusVals.map((s) => {
        const n = items.filter((it) => dKeep(it, 'status') && it.status === s).length;
        return `<button type="button" class="co-menu-i" role="menuitemcheckbox" aria-checked="${detailFilter.status.has(s)}" data-dk="status" data-dv="${s}"><span class="co-menu-c">${TICK}</span>${STATUS[s][0]}<small>${n}</small></button>`;
      }).join('')
      + (tagVals.length ? '<div class="co-menu-sep" role="separator"></div>' + `<div class="co-menu-h">${tagLabel}</div>` + tagVals.map((v) => {
        const n = items.filter((it) => dKeep(it, 'tag') && it.tag === v).length;
        return `<button type="button" class="co-menu-i" role="menuitemcheckbox" aria-checked="${detailFilter.tag.has(v)}" data-dk="tag" data-dv="${v}"><span class="co-menu-c">${TICK}</span>${v}<small>${n}</small></button>`;
      }).join('') : '')
      + `<div class="co-menu-sep" role="separator"></div><button type="button" class="co-menu-i" role="menuitem" data-dclear${nOnD ? '' : ' disabled'}><span class="co-menu-c">${X}</span>Clear filters</button></div>`
      : '';
    const filt = `<div class="co-filt"><button type="button" class="co-filt-btn" aria-haspopup="menu" aria-expanded="${detailFiltOpen}" data-dfilt-btn><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.25"/><circle cx="9" cy="17" r="2.25"/></svg>Filter<span class="co-filt-n"${nOnD ? '' : ' hidden'}>${nOnD}</span><svg class="co-filt-chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg></button><div class="co-filt-panel" role="menu" aria-label="Filter this roster" data-dfilt-panel${detailFiltOpen ? '' : ' hidden'}>${panelHtml}</div></div>`;
    const search = `<div class="co-tools cd-detail-tools"><label class="co-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" placeholder="Search by name" aria-label="Search this roster" data-detail-q value="${detailQ.replace(/"/g, '&quot;')}"></label><div class="co-tools-r"><span class="co-muted cd-detail-count">${list.length} of ${items.length}</span>${nOnD ? '<button type="button" class="link-btn co-tools-clear" data-dclear>Clear filters</button>' : ''}${filt}</div></div>`;
    const go = (it) => (kind === 'workers' ? ` data-worker="${it.i}"` : kind === 'equipment' ? ` data-machine="${it.i}"` : '');
    const by = issuerOf(doc.cat);
    const table = list.length
      ? `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-doc-tbl cd-roster-tbl"><thead><tr><th>${NOUN[kind][0][0].toUpperCase() + NOUN[kind][0].slice(1)}</th><th>Status</th><th>ALMA confidence</th><th>Reference no.</th><th>Issued by</th><th class="c">Expiry date</th><th></th></tr></thead><tbody>${list.map((it) => {
        const [label, cls] = STATUS[it.status]; const has = it.status !== 'missing';
        return `<tr class="cd-row${go(it) ? ' is-rosterable' : ''}"${go(it)}${go(it) ? ' tabindex="0" role="link"' : ''}><td><span class="n">${it.name}</span>${it.sub ? `<span class="d">${it.sub}</span>` : ''}</td><td><span class="co-badge ${cls}">${label}</span></td><td>${has ? confCell(it.status === 'attention' ? 61 : 86 + (hash(doc.code + it.i) % 14)) : dash}</td><td class="cd-ref">${has ? refOf(doc.code + it.i, it.exp) : dash}</td><td class="cd-by">${has ? esc(by) : dash}</td><td class="c">${has ? it.exp : dash}</td><td class="cd-ed">${go(it) ? `<span class="cd-row-open" aria-hidden="true">${CHEV_R}</span>` : ''}</td></tr>`;
      }).join('')}</tbody></table></div>`
      : '<div class="co-card cd-none"><b class="co-row-n">Nothing matches that.</b></div>';
    groupsEl.innerHTML = `<div class="cd-detail">${crumb}${search}${table}</div>`;
  };

  const paintFilters = () => {
    panel.innerHTML = '<div class="co-filt-list">' + GROUPS.map(([label, k, fn], gi) => {
      const all = k === 'status' ? STATUSES.map((s) => STATUS[s][0]).filter((v) => DATA.some((d) => STATUS[d.status][0] === v)) : [...new Set(DATA.map(fn))];
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

  const DOC_THEAD = '<thead><tr><th>Document</th><th>Belongs to</th><th>Status</th><th>ALMA confidence</th><th>Reference no.</th><th>Issued by</th><th class="c">Issue date</th><th class="c">Expiry date</th><th>Versions</th></tr></thead>';
  const docTable = (docs) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-doc-tbl">${DOC_THEAD}<tbody>${docs.map(row).join('')}</tbody></table></div>`;
  const GROUP_NOTE = { 'On client request': 'Only needed once a client asks for it. Upload it ahead if you like.', Optional: 'Never required. Worth adding if it helps you win work.', Archived: 'Earlier versions, read-only, kept for audit.' };
  const group = (cat, docs, raw) => `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${cat}</h3><span class="co-muted">${GROUP_NOTE[raw] ? GROUP_NOTE[raw] + ' &middot; ' : ''}${docs.length} document${docs.length === 1 ? '' : 's'}</span></div>${docTable(docs)}</div>`;

  // the areas, each a tile with its own count and an alert badge when something there needs you
  const renderHome = () => {
    groupsEl.innerHTML = `<div class="cd-areas" role="list">${AREAS.map((a) => {
      const docs = DATA.filter((d) => d.area === a.key && counted(d));
      const alerts = docs.filter(needsAttention).length;
      return `<button type="button" class="cd-area${docs.length ? '' : ' is-empty'}" data-area="${a.key}" role="listitem">` +
        `<span class="cd-area-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a.icon}</svg><span>${a.title}</span>${alerts ? `<span class="cd-area-alert">${alerts}</span>` : ''}<span class="cd-area-arrow" aria-hidden="true">→</span></span>` +
        `<span class="cd-area-n">${docs.length}<small>document${docs.length === 1 ? '' : 's'} ${window.DOC_MODEL.ORG ? 'on file' : 'asked of you'}</small></span>` +
        `<span class="cd-area-d">${a.sub}</span>` +
      `</button>`;
    }).join('')}</div>`;
  };

  const renderGroups = () => {
    const scope = area ? [area] : AREAS.map((a) => a.key);
    const list = DATA.filter((d) => keep(d) && scope.includes(d.area));
    const html = scope.flatMap((key) => GROUPS_OF(key).map((g) => {
      const docs = list.filter((d) => d.area === key && d.group === g);
      return docs.length ? group(area ? g : docs[0].groupLabel, docs, g) : '';
    })).join('');
    // an area of a company added in this session, with nothing uploaded to it yet
    const empty = area && !filtering() && !DATA.some((d) => d.area === area);
    groupsEl.innerHTML = list.length ? (area && !filtering() ? matrix(area) : '') + html : empty ? areaEmpty(area) : none();
  };

  // Workers, Equipment and Products, everyone at once: one row per record, one column per
  // per-record document asked of any of them, a dot for its status (a dash where it isn't)
  const SHORT = { 'WK-11': 'Fitness', 'WK-12': 'Special risk', 'WK-13': 'Operator', 'WK-14': 'Training', 'WK-15': 'PPE', 'WK-16': 'Residence permit', 'WK-17': 'A1',
    'EQ-01': 'EC conformity', 'EQ-02': 'Pre&#8209;1995 cert.', 'EQ-03': 'Inspection', 'EQ-04': 'Maintenance', 'EQ-05': 'Manual', 'EQ-06': 'Calibration', 'EQ-07': 'Insurance',
    'PR-01': 'DoP', 'PR-02': 'Constancy', 'PR-03': 'Technical sheet', 'PR-04': 'Safety sheet', 'PR-05': 'EU DoC', 'PR-06': 'EPD', 'PR-07': 'REACH', 'PR-08': 'Certification', 'UN-29': 'UL', 'UN-30': 'Prop 65' };
  const TONE = { valid: 'ok', na: 'neu', processing: 'neu', expiring: 'pend', filemissing: 'warn', attention: 'warn', missing: 'bad', expired: 'bad', rejected: 'bad' };
  const matrix = (key) => {
    if (!['workers', 'equipment', 'products'].includes(key)) return '';
    const cols = DOCS.filter((d) => d.area === key && d.kind === key && d.roster.length);
    if (cols.length < 2) return '';
    const recs = D.records[key];
    const label = { workers: 'By worker', equipment: 'By machine', products: 'By product' }[key];
    const rows = recs.map((_, i) => {
      const cells = cols.map((d) => { const r = d.roster.find((x) => x.i === i); return r ? r.status : null; });
      const worst = worstOf(cells.filter(Boolean));
      const [wl, wc] = STATUS[worst];
      const go = key === 'workers' ? ` data-worker="${i}"` : key === 'equipment' ? ` data-machine="${i}"` : '';
      return `<tr class="cd-row${go ? ' is-rosterable' : ''}"${go}${go ? ` tabindex="0" role="link" aria-label="Open ${recordName(key, i)}"` : ''}><td><span class="n">${recordName(key, i)}</span><span class="d">${recordSub(key, i)}</span></td>${cells.map((s, c) => (s
        ? `<td class="c"><span class="cd-dot is-${TONE[s]}" title="${STATUS[s][0]}"></span><span class="sr-only">${SHORT[cols[c].code] || cols[c].name}: ${STATUS[s][0]}</span></td>`
        : '<td class="c"><span class="cd-dash" title="Not asked of this one">&mdash;</span></td>')).join('')}<td><span class="co-badge ${wc}">${wl}</span>${go ? `<span class="cd-row-open" aria-hidden="true">${CHEV_R}</span>` : ''}</td></tr>`;
    }).join('');
    const legend = [['ok', 'Valid'], ['pend', 'Expiring'], ['warn', 'Needs attention'], ['bad', 'Missing or expired']].map(([c, l]) => `<span><span class="cd-dot is-${c}"></span>${l}</span>`).join('');
    return `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${label}</h3><span class="co-muted">${recs.length} ${NOUN[key][1]}</span></div>
      <div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-matrix"><thead><tr><th>${NOUN[key][0][0].toUpperCase() + NOUN[key][0].slice(1)}</th>${cols.map((d) => `<th class="c" title="${esc(d.name)}">${SHORT[d.code] || esc(d.name)}</th>`).join('')}<th>Overall</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend">${legend}<span><span class="cd-dash">&mdash;</span>Not asked of them</span>${key !== 'products' ? `<span>Open a ${NOUN[key][0]} for ${key === 'workers' ? 'their' : 'its'} profile and documents.</span>` : ''}</p></div>`;
  };

  // the documents of one worker or machine: every per-record document that covers them
  const recordDocs = (kind, i) => DOCS.filter((d) => d.kind === kind && d.roster).map((d) => {
    const r = d.roster.find((x) => x.i === i); return r ? { code: d.code, name: d.name, req: d.requirement, status: r.status, exp: r.exp } : null;
  }).filter(Boolean);
  const kv = (k, v) => `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>`;
  const docRow = (d) => { const [l, c] = STATUS[d.status]; return `<tr><td><span class="n">${esc(d.name)}</span><span class="d">${d.code} &middot; ${d.req}</span></td><td class="c">${d.status === 'missing' ? '&mdash;' : d.exp}</td><td><span class="co-badge ${c}">${l}</span></td></tr>`; };
  const docsCard = (rows) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-wk-tbl"><thead><tr><th>Document</th><th class="c">Expires</th><th>Status</th></tr></thead><tbody>${rows.map(docRow).join('')}</tbody></table></div>`;
  const sitesCard = (list) => `<div class="co-card cd-card-pad"><ul class="cd-sites">${list.map((s) => { const [n, client] = SITES[s].split(' &middot; '); return `<li><span class="n">${n}</span><span class="co-subtle">${client}</span></li>`; }).join('')}</ul></div>`;

  // one worker: their profile, whether they may work here, their documents, and their sites.
  // Personal data is Restricted: a client sees it only while this worker is on one of its sites.
  const renderWorker = (i) => {
    const p = PERSON[i];
    const per = recordDocs('workers', i);
    const month = DOCS.filter((d) => d.level === 'all_workers' && d.req !== 'optional').map((d) => ({ code: d.code, name: d.name, req: 'Covers every worker', status: d.status, exp: d.valid }));
    const [wl, wc] = STATUS[worstOf(per.map((d) => d.status))];
    const right = p.permit
      ? `<span class="co-badge ${STATUS[p.permit.status][1]}">${p.permit.status === 'valid' ? 'Valid permit' : 'Permit expiring'}</span> <span class="co-subtle">${p.permit.type} &middot; ${p.permit.no} &middot; until ${p.permit.until}</span>`
      : `<span class="co-badge b-ok">No permit needed</span> <span class="co-subtle">${p.nationalityName} citizen${p.nationality !== 'PT' ? ', EU' : ''}</span>`;
    groupsEl.innerHTML = `<div class="cd-detail cd-worker">
      <div class="cd-area-head"><h2 class="co-h-l">${p.name}</h2><p class="co-muted">${p.role} &middot; ${p.employment.toLowerCase()} since ${p.since} &middot; <span class="co-badge ${wc}">${wl}</span></p></div>
      <p class="cd-restricted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>Restricted personal data. Clients see it only while ${p.name.split(' ')[0]} is on one of their sites.</p>
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Worker profile</h3><span class="co-muted">Data only, no file</span></div>
        <div class="co-card cd-card-pad"><dl class="pd-grid">
          ${kv('Full name', p.name)}${kv('Job category', p.role)}${kv('Nationality', p.nationalityName)}
          ${kv('Birth date', p.birth)}${kv('Tax number', p.tax)}${kv('Social security number', p.ss)}
          ${kv('Home address', p.address)}${kv('Employment', `${p.employment}, since ${p.since}`)}
          ${kv('Identification', `${p.id[0]} &middot; ${p.id[1]}<br><span class="co-subtle">valid until ${p.id[2]}</span>`)}
          ${kv('Right to work in Portugal', right)}
        </dl></div></div>
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Their documents</h3><span class="co-muted">${per.length} document${per.length === 1 ? '' : 's'}</span></div>${docsCard(per)}</div>
      ${month.length ? `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Monthly cover</h3><span class="co-muted">September</span></div>${docsCard(month)}</div>` : ''}
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">On site</h3><span class="co-muted">${p.sites.length} site${p.sites.length === 1 ? '' : 's'}</span></div>${sitesCard(p.sites)}</div>
    </div>`;
  };

  // one machine: its profile, who may operate it, its documents, and the sites it is on
  const renderMachine = (i) => {
    const m = MACHINE[i];
    const per = recordDocs('equipment', i);
    const [wl, wc] = STATUS[worstOf(per.map((d) => d.status))];
    const next = per.find((d) => d.code === 'EQ-03'), maint = per.find((d) => d.code === 'EQ-04');
    const op = DOCS.find((d) => d.code === 'WK-13');
    const opRow = (w) => { const r = op && op.roster.find((x) => x.i === w); const [l, c] = STATUS[r ? r.status : 'missing'];
      return `<tr class="cd-row is-rosterable" data-worker="${w}" tabindex="0" role="link" aria-label="Open ${WORKERS[w][0]}"><td><span class="n">${WORKERS[w][0]}</span><span class="d">${WORKERS[w][1]}</span></td><td class="c">${r ? r.exp : '&mdash;'}</td><td><span class="co-badge ${c}">${r ? 'Operator certificate ' + l.toLowerCase() : 'No certificate on file'}</span><span class="cd-row-open" aria-hidden="true">${CHEV_R}</span></td></tr>`; };
    groupsEl.innerHTML = `<div class="cd-detail cd-worker cd-machine">
      <div class="cd-area-head"><h2 class="co-h-l">${m.type} <span class="soft">&mdash; ${m.brand === 'Ferreira (in&#8209;house)' ? m.model : m.brand + ' ' + m.model}</span></h2><p class="co-muted">${m.ref} &middot; built ${m.yearBuilt} &middot; ${m.owned.toLowerCase().replace(/&middot;.*$/, '').trim()} &middot; <span class="co-badge ${wc}">${wl}</span></p></div>
      ${next && next.status === 'attention' ? `<p class="cd-restricted cd-attn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>Periodic inspection due ${next.exp} &mdash; book it, and drop the report on ALMA when it is done.</p>` : ''}
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Equipment profile</h3><span class="co-muted">Data only, no file</span></div>
        <div class="co-card cd-card-pad"><dl class="pd-grid">
          ${kv('Equipment type', m.type)}${kv('Brand', m.brand)}${kv('Model', m.model)}
          ${kv('Serial number', m.serial)}${kv('Plate', m.plate || '<span class="co-subtle">Not road&#8209;registered</span>')}${kv('Year built', `${m.yearBuilt}${m.yearBuilt < 1995 ? ' <span class="co-subtle">&middot; before 1995, so EQ&#8209;02 instead of EQ&#8209;01</span>' : ''}`)}
          ${kv('Owned or rented', m.owned)}${kv('Internal code', m.ref)}${kv('Hours on the clock', m.hours ? m.hours.toLocaleString('en-US') + ' h' : '<span class="co-subtle">Not metered</span>')}
          ${kv('Requires certified operator', m.certified ? '<span class="co-badge b-pend">Yes</span> <span class="co-subtle">operators named below</span>' : '<span class="co-badge b-neu">No</span>')}
          ${kv('Next inspection', next ? next.exp : '&mdash;')}${kv('Next maintenance', maint ? maint.exp : '&mdash;')}
        </dl></div></div>
      ${m.certified ? `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Who may operate it</h3><span class="co-muted">${m.operators.length} operator${m.operators.length === 1 ? '' : 's'} &middot; WK&#8209;13</span></div>
        <div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-wk-tbl"><thead><tr><th>Worker</th><th class="c">Certificate expires</th><th>Status</th></tr></thead><tbody>${m.operators.map(opRow).join('')}</tbody></table></div></div>` : ''}
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Its documents</h3><span class="co-muted">${per.length} document${per.length === 1 ? '' : 's'}</span></div>${docsCard(per)}</div>
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">On site</h3><span class="co-muted">${m.sites.length} site${m.sites.length === 1 ? '' : 's'}</span></div>${sitesCard(m.sites)}</div>
    </div>`;
  };

  const areaEmpty = (key) => `<div class="co-card cd-none"><b class="co-row-n">Nothing in ${AREA_TITLE[key]} yet</b><span class="co-subtle">${key === 'workers' ? 'Payroll and social security, and what each worker is cleared for.' : key === 'equipment' ? 'Conformity, inspections and manuals for every machine you bring.' : 'Registration, tax and social security, and the rest of the company&rsquo;s own papers.'} ALMA asks for them one section at a time.</span>${window.DOC_MODEL.ORG ? `<button type="button" class="btn btn-primary btn-sm" data-alma-area="${key}">Add them with ALMA</button>` : ''}</div>`;
  // ALMA, on a section of a company added in this session (js/guided-upload.js): she comes up on
  // her own when it's empty, each time it's opened; afterwards the page comes back with what was filed
  let asked = null;
  const askALMA = (key, files) => {
    if (!window.CMGuided || !window.DOC_MODEL.ORG) return false;
    window.CMGuided.open(key, { files, onClose: (changed) => { if (changed) location.href = `company-details.html?area=${key}`; } });
    return true;
  };
  const askIfEmpty = () => {
    if (area === asked) return;
    asked = area;
    if (area && window.DOC_MODEL.ORG && !DATA.some((d) => d.area === area)) setTimeout(() => { if (window.CMGuided && window.CMGuided.asks(area).length) askALMA(area); }, 250);
  };
  const none = () => '<div class="co-card cd-none"><b class="co-row-n">No document matches that.</b><span class="co-subtle">Try a wider search, or fewer filters.</span><button type="button" class="btn btn-quiet btn-sm" data-clear>Clear the search and filters</button></div>';

  // the breadcrumb, the back button, and the title/subtitle/stats above the list
  const crumbTrail = document.getElementById('cd-crumb-trail'), crumbBack = document.getElementById('cd-crumb-back');
  const hero = document.getElementById('cd-hero'), h2 = document.getElementById('cd-h2'), sub = document.getElementById('cd-sub');
  const updateHeader = () => {
    const a = area ? AREAS.find((x) => x.key === area) : null;
    const doc = detail !== null ? docById(detail) : null;
    const levels = [{ label: 'My company', href: 'my-company.html?filled' }, { label: 'Documents', crumb: 'root' }];
    if (a) levels.push({ label: a.title, crumb: 'area' });
    if (doc) levels.push({ label: esc(doc.name), crumb: 'detail' });
    if (worker !== null) levels.push({ label: WORKERS[worker][0], crumb: 'worker' });
    if (machine !== null) levels.push({ label: EQUIPMENT[machine][0], crumb: 'machine' });
    crumbTrail.innerHTML = levels.map((lvl, i) => {
      const sep = i ? '<span aria-hidden="true">/</span>' : '';
      if (i === levels.length - 1) return sep + `<span aria-current="page">${lvl.label}</span>`;
      return sep + (lvl.href ? `<a href="${lvl.href}">${lvl.label}</a>` : `<button type="button" data-crumb="${lvl.crumb}">${lvl.label}</button>`);
    }).join('');
    crumbBack.onclick = () => {
      if (worker !== null) { worker = null; render(); toTop(); }
      else if (machine !== null) { machine = null; render(); toTop(); }
      else if (doc) { detail = null; resetDetailFilter(); render(); toTop(); }
      else if (a) { area = null; render(); toTop(); }
      else location.href = 'my-company.html?filled';
    };
    hero.hidden = !!doc || worker !== null || machine !== null;
    if (doc || worker !== null || machine !== null) return;
    h2.textContent = a ? a.title : 'All company documents';
    const fresh = window.DOC_MODEL.ORG; // a company added in this session: only what it uploaded
    sub.innerHTML = a ? a.long : fresh ? `The documents you&rsquo;ve uploaded, kept in one profile so any client finds the same set. Your profile: <b class="cd-profile">${D.line}</b>.` : `Every document the C&#8209;MORE catalog asks of a company like yours, kept in one profile so any client finds the same set. Chosen from your profile: <b class="cd-profile">${D.line}</b>.`;
    counts(a ? DOCS.filter((d) => d.area === a.key) : DOCS);
    document.getElementById('cd-card-total-d').textContent = fresh ? (a ? `Every document you've uploaded in ${a.title.toLowerCase()}.` : 'Every document you’ve uploaded.') : a ? `Every document asked of you in ${a.title.toLowerCase()}.` : 'Every document asked of you, from your profile.';
    if (fresh) { const h = document.querySelector('#cd-card-total-d') && document.querySelector('#cd-card-total-d').closest('.cd-card'); const l = h && h.querySelector('.cd-card-h span'); if (l) l.textContent = 'On file'; }
  };

  function render() {
    if (typeof syncCards === 'function') syncCards();
    askIfEmpty();
    updateHeader();
    const deep = detail !== null || worker !== null || machine !== null;
    tools.hidden = deep;
    pills.hidden = deep;
    if (worker !== null) { renderWorker(worker); return; }
    if (machine !== null) { renderMachine(machine); return; }
    if (detail !== null) { renderDetail(detail); return; }
    const onHome = !area && !filtering();
    tools.querySelector('.co-filt').hidden = onHome;
    if (onHome) renderHome(); else renderGroups();

    const on = GROUPS.flatMap(([label, k]) => [...f[k]].map((v) => [label, k, v]));
    pills.hidden = !on.length;
    pills.innerHTML = on.map(([label, k, v]) => `<button type="button" class="co-pill" data-k="${k}" data-v="${v}" aria-label="Remove filter ${label}: ${v}"><span>${label}:</span><b>${v}</b><i aria-hidden="true">×</i></button>`).join('');
    const n = nOn(); btn.querySelector('[data-filt-n]').hidden = !n; btn.querySelector('[data-filt-n]').textContent = n;
    tools.querySelector('.co-tools-clear').hidden = !(n || f.q);
  }

  const toTop = () => scrollTo({ top: 0, behavior: 'smooth' });

  crumbTrail.addEventListener('click', (e) => {
    const b = e.target.closest('[data-crumb]'); if (!b) return;
    if (b.dataset.crumb === 'root') { area = null; detail = null; worker = null; machine = null; resetDetailFilter(); }
    else if (b.dataset.crumb === 'area') { detail = null; worker = null; machine = null; resetDetailFilter(); }
    else if (b.dataset.crumb === 'detail') { worker = null; machine = null; }
    render(); toTop();
  });

  groupsEl.addEventListener('click', (e) => {
    const c = e.target.closest('[data-clear]'); if (c) { clearAll(); return; }
    const al = e.target.closest('[data-alma-area]'); if (al) { askALMA(al.dataset.almaArea); return; }
    const tile = e.target.closest('[data-area]'); if (tile) { area = tile.dataset.area; render(); toTop(); return; }
    const who = e.target.closest('[data-worker]'); if (who) { area = 'workers'; detail = null; machine = null; worker = +who.dataset.worker; render(); toTop(); return; }
    const what = e.target.closest('[data-machine]'); if (what) { area = 'equipment'; detail = null; worker = null; machine = +what.dataset.machine; render(); toTop(); return; }
    const ros = e.target.closest('[data-detail]'); if (ros) {
      const doc = docById(+ros.dataset.detail);
      area = doc.area; detail = doc.id; detailQ = ''; resetDetailFilter();
      render(); toTop();
      return;
    }
    const exp = e.target.closest('[data-expand]'); if (exp) {
      const id = +exp.dataset.expand; open.has(id) ? open.delete(id) : open.add(id);
      render();
      const again = groupsEl.querySelector(`[data-expand="${id}"]`); if (again) again.focus({ preventScroll: true });
      return;
    }
    const ver = e.target.closest('[data-version]'); if (ver) { const [id, k] = ver.dataset.version.split(':').map(Number); openDrawer(id, k); return; }
    const naq = e.target.closest('[data-na]'); if (naq) { openDrawer(+naq.dataset.na, 0, true); return; }
    const rc = e.target.closest('[data-row-cite]'); if (rc) { const [id, k] = rc.dataset.rowCite.split(':').map(Number); openDrawer(id, 0, false, k); return; }
    const nt = e.target.closest('[data-note-for]'); if (nt) { const d = docById(+nt.dataset.noteFor); if (d.kind && d.roster.length) { area = d.area; detail = d.id; detailQ = ''; resetDetailFilter(); render(); toTop(); } else openDrawer(d.id); return; }
    const doc = e.target.closest('[data-open]'); if (doc) { openDrawer(+doc.dataset.open); return; }
    const dBtn = e.target.closest('[data-dfilt-btn]'); if (dBtn) {
      detailFiltOpen = !detailFiltOpen; renderDetail(detail);
      if (detailFiltOpen) { const first = groupsEl.querySelector('[data-dfilt-panel] .co-menu-i'); if (first) first.focus(); }
      return;
    }
    const dClear = e.target.closest('[data-dclear]'); if (dClear) {
      if (dClear.disabled) return;
      detailFilter = { status: new Set(), tag: new Set() }; renderDetail(detail);
      return;
    }
    const dItem = e.target.closest('[data-dfilt-panel] .co-menu-i'); if (dItem) {
      const { dk, dv } = dItem.dataset; detailFilter[dk].has(dv) ? detailFilter[dk].delete(dv) : detailFilter[dk].add(dv);
      renderDetail(detail);
      const again = groupsEl.querySelector(`[data-dk="${dk}"][data-dv="${dv}"]`); if (again) again.focus();
    }
  });
  groupsEl.addEventListener('keydown', (e) => {
    const t = e.target.closest('[data-worker], [data-machine], [data-detail], [data-open], [data-version]');
    if (t && e.target === t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t.click(); }
  });
  groupsEl.addEventListener('input', (e) => {
    if (!e.target.matches('[data-detail-q]')) return;
    detailQ = e.target.value; renderDetail(detail);
    const again = groupsEl.querySelector('[data-detail-q]'); if (again) { again.focus(); again.setSelectionRange(detailQ.length, detailQ.length); }
  });
  document.addEventListener('click', (e) => { if (detailFiltOpen && !e.target.closest('.cd-detail-tools')) { detailFiltOpen = false; if (detail !== null) renderDetail(detail); } });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !detailFiltOpen) return;
    detailFiltOpen = false; if (detail !== null) renderDetail(detail);
    const b = groupsEl.querySelector('[data-dfilt-btn]'); if (b) b.focus();
  });

  // each total is also a shortcut: a second click on the same one clears it again
  const cards = [...document.querySelectorAll('.cd-card')];
  const STATUS_SETS = { ok: ['Valid', 'Not applicable'], pend: ['Expiring', 'File missing', 'Needs attention', 'Processing'], bad: ['Missing', 'Expired', 'Rejected'] };
  cards.forEach((c) => c.addEventListener('click', () => {
    const key = c.dataset.status, was = c.classList.contains('is-on');
    clearAll();
    if (key && !was) { f.status = new Set(STATUS_SETS[key]); render(); if (!panel.hidden) paintFilters(); c.classList.add('is-on'); }
  }));
  const syncCards = () => cards.forEach((c) => { const want = c.dataset.status && STATUS_SETS[c.dataset.status];
    c.classList.toggle('is-on', !!want && f.status.size === want.length && want.every((v) => f.status.has(v)) && nOn() === f.status.size && !f.q); });

  // ALMA's drop: takes a file by drag or by browsing, then files it against the first company
  // document that is expired or needs attention. Prototype: the file never leaves the machine.
  const drop = document.getElementById('cd-drop'), file = document.getElementById('cd-file');
  // a company added in this session: dropping here (or pressing it) is ALMA's guided upload for the
  // section you're in, Company when you're at the top
  if (drop && window.DOC_MODEL.ORG) {
    const into = () => (area && window.CMGuided && window.CMGuided.asks(area).length ? area : 'company');
    drop.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); askALMA(into()); }, true);
    drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopImmediatePropagation(); askALMA(into()); } }, true);
    drop.addEventListener('drop', (e) => { e.preventDefault(); e.stopImmediatePropagation(); drop.classList.remove('is-over'); askALMA(into(), e.dataTransfer.files); }, true);
  }
  if (drop && file) {
    const t = document.getElementById('cd-drop-t'), dsub = document.getElementById('cd-drop-s'), acts = document.getElementById('cd-drop-acts');
    let picked = null, state = 'idle';
    const setState = (st) => { state = st; drop.classList.toggle('has-file', st === 'file'); drop.classList.toggle('is-reading', st === 'reading'); drop.classList.toggle('is-filed', st === 'filed'); };
    const took = (fl) => {
      if (!fl || state === 'reading' || state === 'filed') return;
      picked = fl;
      t.textContent = 'Got it: ' + fl.name;
      dsub.textContent = 'Hand it over and I will read it, date it and file it.';
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
      dsub.textContent = 'Checking the issuer, the dates and the business it names.';
      const target = DOCS.find((d) => !d.kind && d.status === 'expired') || DOCS.find((d) => !d.kind && d.status === 'attention');
      setTimeout(() => {
        setState('filed');
        if (!target) { t.textContent = 'Filed.'; dsub.textContent = 'Prototype: nothing was uploaded or saved.'; return; }
        window.DOC_MODEL.saveDoc(target.code, { status: 'valid', issued: today(), valid: target.valid === 'No expiry' ? 'No expiry' : today().replace(/\d{4}$/, (y) => +y + 1), note: '', ref: target.ref || refOf(target.code, '2026'), by: target.by || issuerOf(target.cat) });
        target.text = textOf(target);
        t.textContent = `Filed: ${target.name}, valid again.`;
        dsub.textContent = `${issuerOf(target.cat) || 'Checked'} · valid until ${target.valid}. Prototype: nothing was uploaded or saved.`;
        render(); syncCards();
      }, 2200);
    });
  }

  // arriving from elsewhere (the home page's "Documents requiring attention", a notification)
  // already knowing which document: open straight to it
  const openCode = new URLSearchParams(location.search).get('open');
  // or which section (?area=workers)
  const openArea = new URLSearchParams(location.search).get('area');
  if (openArea && AREAS.some((a) => a.key === openArea)) area = openArea;
  const openDoc = openCode && DOCS.find((d) => d.code === openCode);
  if (openDoc) {
    area = openDoc.area;
    if (openDoc.kind && openDoc.roster.length) { detail = openDoc.id; resetDetailFilter(); }
  }
  render();
  if (openDoc && detail === null) {
    const arrived = groupsEl.querySelector(`[data-row-id="${openDoc.id}"]`);
    if (arrived) { arrived.scrollIntoView({ block: 'center' }); arrived.classList.add('is-arrived'); setTimeout(() => openDrawer(openDoc.id), 450); }
  }
})();
