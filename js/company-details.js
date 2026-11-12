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
  const M = window.DOC_MODEL;
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
  const UPB = (spec, has, name, icon) => (window.CMUpload ? window.CMUpload.button(spec, has, name, icon) : '');
  const NA_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/></svg>';

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
  // shown as a level (High, Medium, Low), never a number: the same badge as the Status column, so the two read alike
  const band = (p) => (p >= 90 ? ['High', 'b-ok', 'Read cleanly, and it matches the profile.'] : p >= 75 ? ['Medium', 'b-pend', 'Read well, but worth a glance.'] : ['Low', 'b-over', 'ALMA isn&rsquo;t sure of something here. Check it against the file.']);
  const confCell = (p) => {
    if (p === 'reading') return '<span class="co-badge b-neu">Reading&hellip;</span>';
    if (p == null) return dash;
    const [b, cls, why] = band(p);
    return `<span class="co-badge ${cls}" title="${why}">${b} confidence</span>`;
  };
  // a roster row reads as sure as its least sure record
  const rosterConf = (d) => { const l = d.roster.filter((r) => !NO_FILE.includes(r.status)).map((r) => (r.status === 'attention' ? 61 : 86 + (hash(d.code + r.i) % 14))); return l.length ? Math.min(...l) : null; };

  // ---- earlier versions ---------------------------------------------------------------------------
  // Every document keeps the versions it replaced, newest first (js/doc-model.js)
  const versionsOf = window.DOC_MODEL.versionsOf;

  const citeFor = (d) => {
    const fl = d.cat.fields || [];
    if (d.status === 'attention') { const k = fl.findIndex((f) => !valueOf(d, f)); return k < 0 ? 0 : k; }
    const k = fl.findIndex((f) => /expiry|valid until|validity|end date|next exam|next inspection/i.test(f.name) && valueOf(d, f));
    return k;
  };
  // a client waiting for your consent to see it (js/consent-notify.js): a mark on its row, and a card
  // at the top of its drawer; asked for on its own, you answer there; with others, on the consents
  const CN = window.CMConsents;
  const asksOf = (d) => (CN && d.code ? CN.forDoc(d.code) : []);
  const askTag = (d) => { const a = asksOf(d); return a.length ? `<span class="cd-ask" title="${esc(a.map((c) => c.name).join(', '))} ${a.length === 1 ? 'is' : 'are'} waiting for your consent">Consent asked</span>` : ''; };
  const askDone = new Map(); // answered in this drawer: id -> the request, as answered
  const askCard = (d) => {
    const cards = asksOf(d).map((c) => {
      const one = CN.single(c), n = CN.count(c);
      return `<section class="cdd-card cdd-ask" data-ask="${esc(c.id)}"><h4 class="eyebrow">Consent asked</h4><p class="cdd-ask-t">${esc(CN.nb(c.name))} asks to see ${one ? 'this document' : `this and ${n - 1} other document${n === 2 ? '' : 's'}`}</p>
        <p class="cdd-desc">${esc(c.when || '')}. ${one ? 'If you say yes, they see it as it is now, and each new version while your consent stands. Nothing is shared until you do.' : `They asked for ${esc(c.what)}. You answer the whole request in one go, from your consents.`}</p>
        <div class="cdd-ask-acts">${one ? '<button type="button" class="btn btn-primary btn-sm" data-ask-yes>Give consent</button><button type="button" class="btn btn-quiet btn-sm" data-ask-no>Decline</button>' : `<a class="btn btn-primary btn-sm" href="${CN.hrefOf(c)}">Answer in Consents</a>`}</div></section>`;
    });
    const done = [...askDone.values()].filter((c) => (c.codes || []).includes(d.code)).map((c) => `<section class="cdd-card cdd-ask is-done" tabindex="-1" data-ask-done><h4 class="eyebrow">Consent ${c.state === 'accepted' ? 'given' : 'declined'}</h4><p class="cdd-ask-t">${c.state === 'accepted' ? `${esc(CN.nb(c.name))} can see this document` : `${esc(CN.nb(c.name))} won&rsquo;t see this document`}</p>
      <p class="cdd-desc">${c.state === 'accepted' ? 'From today, along with each new version while your consent stands. You can stop sharing at any time from your consents.' : 'We let them know. If they ask again, you&rsquo;ll get a new notification.'}</p></section>`);
    return cards.join('') + done.join('');
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
    const opener = hasRoster ? ''
      : nv ? `<button type="button" class="cd-vbtn${isOpen ? ' is-open' : ''}" data-expand="${d.id}" aria-expanded="${isOpen}" aria-label="${nv} version${nv === 1 ? '' : 's'} of ${esc(d.name)}">${nv} version${nv === 1 ? '' : 's'}${CHEV_D}</button>` : dash;
    // a file for it: Upload or Replace on the row, or dropped onto the row (js/doc-upload.js)
    const canUp = d.status !== 'archived' && d.status !== 'na' && !!window.CMUpload;
    const up = canUp ? UPB(`doc:${d.id}`, !hasRoster && !NO_FILE.includes(d.status), d.name, hasRoster || nv > 0) : '';
    const attrs = (hasRoster ? ` data-detail="${d.id}" role="link"` : ` data-open="${d.id}" role="button" aria-label="Open ${esc(d.name)}"`) + ` data-row-id="${d.id}" tabindex="0"` + (canUp ? ` data-drop="doc:${d.id}"` : '');
    const meta = [d.code || d.archivedCode, d.requirement, d.sharing !== 'Standard' ? d.sharing : ''].filter(Boolean).join(' &middot; ');
    // the reason a row is as it is (ALMA's note, or why it doesn't apply) gets a line of its own under
    // the row, across the whole table, rather than wrapping inside the narrow Document column
    // one with no file that may not apply: a button beside Upload, the same size, to say so
    const naB = canNa(d) && ['missing', 'notuploaded'].includes(d.status) ? `<button type="button" class="cd-up cd-na-b" data-na="${d.id}" title="Mark ${esc(d.name)} as not applicable">${NA_I}<span>Not applicable</span></button>` : '';
    const plain = (h) => h.replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, (m) => ({ '&rsquo;': '’', '&mdash;': '—', '&middot;': '·', '&amp;': '&', '&nbsp;': ' ' }[m] || ' '));
    const who = d.status === 'na' ? '<b>Not applicable</b>' : '<b class="is-alma">ALMA</b>';
    const citeAt = !d.kind && ['expired', 'expiring', 'attention'].includes(d.status) ? citeFor(d) : -1;
    const citeQ = citeAt >= 0 ? `<button type="button" class="cd-na-q" data-row-cite="${d.id}:${citeAt}">View citation</button>` : '';
    const noteRow = d.note ? `<tr class="cd-note-tr${d.status === 'na' ? ' is-na' : ''}${isOpen ? ' is-open' : ''}" data-note-for="${d.id}"><td colspan="5"><span class="cd-note-l">${d.note ? `<span class="cd-note-t" title="${esc(plain(d.note))}">${who}<span class="cd-note-s">&middot;</span>${d.note}</span>` : ''}${citeQ}</span></td></tr>` : '';
    const ed = d.edited ? `<span class="cd-edited" title="Edited by user: a change to ALMA&rsquo;s reading, logged and visible to clients">${PEN}<span class="sr-only">Edited by user</span></span>` : '';
    return `<tr class="cd-row is-rosterable${d.status === 'archived' ? ' is-archived' : ''}${isOpen ? ' is-open' : ''}${noteRow ? ' has-note' : ''}"${attrs}>` +
      `<td><span class="n">${esc(d.name)}${alert}${ed}${askTag(d)}</span><span class="d">${meta}</span>${!hasRoster && nv > 1 ? `<button type="button" class="cmv-btn${isOpen ? ' is-open' : ''}" data-expand="${d.id}" aria-expanded="${isOpen}">${nv} versions${CHEV_D}</button>` : ''}</td>` +
      `<td>${d.valid === '—' ? dash : window.DOC_MODEL.expHtml(d.valid)}</td>` +
      `<td>${confCell(hasRoster ? rosterConf(d) : confOf(d))}</td>` +
      `<td><span class="co-badge ${cls}">${label}</span></td>` +
      `<td class="cd-ed"><span class="cd-ed-in">${naB}${up}${hasRoster ? opener : ''}</span></td></tr>` + noteRow + (isOpen ? history(d) : '');
  };

  // a row opened by its chevron: the current version, then each one it replaced, newest first;
  // any of them opens in the drawer (earlier ones read-only)
  const history = (d) => {
    const vs = versionsOf(d);
    const cur = NO_FILE.includes(d.status) ? '' : `<tr class="is-cur" data-version="${d.id}:0" tabindex="0" role="button"><td><b>Current</b><span class="d">${d.status === 'archived' ? 'Archived' : 'In use'} &middot; ${d.ref || '—'}</span></td><td>${d.issued === '—' ? dash : d.issued}</td><td>${d.valid === '—' ? dash : d.valid}</td><td>${dash}</td><td>${confCell(confOf(d))}</td><td class="cd-h-go">Open</td></tr>`;
    const rows = vs.map((v, k) => `<tr data-version="${d.id}:${k + 1}" tabindex="0" role="button"><td><b>${esc(v.label)}</b><span class="d">Archived &middot; ${v.ref || '—'} &middot; uploaded by ${escE(v.by)}</span></td><td>${v.issued}</td><td>${v.valid}</td><td>${v.replaced}</td><td>${confCell(v.conf)}</td><td class="cd-h-go">Open</td></tr>`).join('');
    const empty = !cur && !rows ? `<p class="cd-h-none">No versions yet. Once a file is uploaded, every version it replaces is kept here.</p>`
      : !rows ? `<p class="cd-h-none">No earlier versions: this is the first one on C&#8209;MORE.</p>` : '';
    return `<tr class="cd-exp"><td colspan="5"><div class="cd-hist">
      <div class="cd-h-head"><b>Versions</b><span class="co-subtle">${vs.length ? `${vs.length} earlier version${vs.length === 1 ? '' : 's'}, kept read-only` : ''}</span></div>
      ${cur || rows ? `<table class="cd-h-tbl"><thead><tr><th>Version</th><th>Issue date</th><th>Expiry date</th><th>Replaced on</th><th>ALMA confidence</th><th><span class="sr-only">Open</span></th></tr></thead><tbody>${cur}${rows}</tbody></table>` : ''}${empty}
    </div></td></tr>`;
  };

  // what ALMA read from a document, field by field, where the demo knows it
  const valueOf = (d, field) => {
    if (NO_FILE.includes(d.status) && d.status !== 'filemissing') return null;
    if (d.vals && d.vals[field.name] != null && d.vals[field.name] !== '') return esc(d.vals[field.name]); // typed in by the user (Make changes)
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
  const drawDoc = () => {
    const d = docById(dState.list[dState.k]), vk = dState.v || 0, vs = versionsOf(d), v = vk ? vs[vk - 1] : null;
    const view = v ? Object.assign({}, d, { issued: v.issued, valid: v.valid, ref: v.ref, status: 'archived' }) : d;
    const conf = v ? v.conf : confOf(d);
    const [label, cls] = STATUS[view.status];
    // its name, which the company can always change (not an earlier version's, nor an archived one's)
    const canRn = !v && !!d.code, renamed = d.name0 && d.name !== d.name0;
    dq('cdd-title').innerHTML = canRn && dState.rn
      ? `<span class="cdd-rn"><input class="cdd-in" id="cdd-rn" value="${esc(decode(d.name))}" maxlength="120" aria-label="Document name" autocomplete="off"><button type="button" class="btn btn-primary btn-sm" data-cdd-rns>Save</button><button type="button" class="link-btn" data-cdd-rnx>Cancel</button></span>`
      : `${esc(decode(d.name))}${v ? ` &middot; ${esc(v.label)}` : ''}${canRn ? `<button type="button" class="cdd-rn-b" data-cdd-rn aria-label="Change the name of ${esc(decode(d.name))}">${PEN}<span>Change name</span></button>` : ''}`;
    dq('cdd-sub').innerHTML = `${renamed && !dState.rn ? `Originally ${esc(decode(d.name0))} <button type="button" class="link-btn cdd-rn-o" data-cdd-rno>Use it</button> &middot; ` : ''}${esc(d.code || d.archivedCode)} &middot; ${esc(d.requirement || 'Archived')} &middot; <span class="co-badge ${cls}">${v ? 'Earlier version' : label}</span>`;
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
      // a row of its own under the field's, the table's full width; opened in place (no repaint, no jump)
      return `<tr class="cdd-cite-row" id="cdd-cite-${i}"${i === citeOpen ? '' : ' hidden'}><td colspan="3"><figure class="esgq-src cdd-src"><figcaption><b>${esc(cte.src)}</b><span>${esc(cte.loc)}</span></figcaption><blockquote>&ldquo;${body}&rdquo;</blockquote><button type="button" class="esgq-src-open" data-cite-show="${i}">Show on the page</button></figure></td></tr>`;
    };
    dq('cdd-page').textContent = hasFile ? (v ? `Earlier version · replaced ${v.replaced}` : 'Current version') : view.status === 'na' ? 'Not applicable to this company' : view.status === 'processing' ? 'ALMA is reading it' : view.status === 'filemissing' ? 'Data typed in, no file yet' : 'No file yet';
    dq('cdd-conf').innerHTML = typeof conf === 'number' ? confCell(conf) : conf === 'reading' ? confCell(conf) : '';
    const ed = !v && !!dState.edit && hasFile;
    const isDate = (x) => /date|expir|valid|until|next exam|next inspection/i.test(x.name) || /date/i.test(x.type || '');
    const isoOf = (t) => { const n = Date.parse(t); if (Number.isNaN(n)) return ''; const y = new Date(n); return `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`; };
    // Make changes: every field ALMA read, and what the document is, can be put right
    const editCard = ed ? `<section class="cdd-card cdd-ed"><h4 class="eyebrow">What it is</h4><p class="cdd-desc">If ALMA read it as the wrong document, choose the right one: its category, then its section, then the document. The file and what you set below go there.</p>${window.CMDocPick ? window.CMDocPick.html('cdd', d.code, { only: (x) => !x.kind }) : ''}</section>
      <section class="cdd-card cdd-ed"><h4 class="eyebrow">Its details</h4><table class="cd-fields"><tbody><tr><td><span class="n">Document name</span><span class="d">What you call it</span></td><td colspan="2"><input class="cdd-in" id="cdd-nm" value="${esc(decode(d.name))}" placeholder="${esc(decode(d.name0 || d.name))}" maxlength="120" autocomplete="off"></td></tr>${fields.map((x, i) => { const pv = x.value ? decode(String(x.value).replace(/<[^>]+>/g, '')) : ''; return `<tr><td><span class="n">${esc(x.name)}</span><span class="d">${esc(x.type)}</span></td><td colspan="2"><input class="cdd-in" data-fld="${i}" ${isDate(x) ? `type="date" value="${isoOf(pv)}"` : `value="${esc(pv)}"`} aria-label="${esc(x.name)}"></td></tr>`; }).join('')}</tbody></table></section>` : '';
    const read = ed ? editCard : fields.length && view.status !== 'na' ? `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><table class="cd-fields"><tbody>${fields.map((x, i) => `<tr class="${x.flag ? 'is-flag' : ''}"><td><span class="n">${esc(x.name)}</span><span class="d">${esc(x.type)}${x.shared ? '' : ' &middot; not shared with clients'}</span></td><td>${x.value || `<span class="co-subtle">${hasFile ? 'Not on this document' : 'Read by ALMA on upload'}</span>`}${x.flag ? '<span class="cdd-why">ALMA isn&rsquo;t sure of this one. Check it against the file.</span>' : ''}${cites[i] ? `<button type="button" class="esgq-src-btn" data-cite="${i}" aria-expanded="${i === citeOpen}" aria-controls="cdd-cite-${i}">${i === citeOpen ? 'Hide citation' : 'View citation'}</button>` : ''}</td><td>${x.conf ? confCell(x.conf) : ''}</td></tr>${cites[i] ? citeHtml(cites[i], i) : ''}`).join('')}</tbody></table></section>` : '';
    const c = d.cat;
    const facts = [['Requirement', LBL.requirement[c.requirement] + (c.appliesWhen && !['on_request', 'optional'].includes(c.requirement) ? ` &middot; <span class="co-subtle">${esc(c.appliesWhen)}</span>` : '')],
      ['Renewal', esc(c.renewal || '—')], ['Expiry', esc(c.expiryRule || '—')], ['Shared with', c.sharing === 'standard' ? 'Every client you share your profile with' : esc(LBL.sharing[c.sharing])], ['Legal basis', esc(c.legalBasis || '—')]]
      .map(([k, val]) => `<div class="pd-kv"><dt>${k}</dt><dd>${val}</dd></div>`).join('');
    const about = `<section class="cdd-card"><h4 class="eyebrow">About this document</h4><p class="cdd-desc">${esc(en(c.description))}</p><dl class="pd-grid cdd-facts">${facts}</dl></section>`;
    const none = view.status === 'na' ? '' : `<div class="docd-none"><span class="docd-ico" aria-hidden="true">${DOC_I}</span><h4>${view.status === 'processing' ? 'ALMA is reading it' : 'No file yet'}</h4><p>${view.status === 'processing' ? 'It takes up to two minutes. The fields below fill in as she reads them.' : 'Drop it on ALMA, or upload it here: she reads it, dates it and files it.'}</p></div>`;
    // marked not applicable: the reason, who and when, and the way back
    const naCard = !v && d.status === 'na' ? `<section class="cdd-card cdd-na-on"><h4 class="eyebrow">Not applicable</h4><p class="cdd-na-r">&ldquo;${d.note}&rdquo;</p>
      <p class="cdd-na-m">${d.naBy ? `Marked by ${esc(d.naBy)}${d.naOn ? ' on ' + esc(d.naOn) : ''} &middot; ` : ''}Your clients see this reason, and it counts as compliant.</p>
      ${canNa(d) ? '<button type="button" class="btn btn-quiet btn-sm" data-na-undo>Undo, it does apply</button>' : ''}</section>` : '';
    // the form: a reason from the catalog's 'Applies when', or one of your own
    const naForm = !v && dState.na && canNa(d) && d.status !== 'na' ? `<form class="cdd-card cdd-na-f" id="cdd-na-f" novalidate>
      <h4 class="eyebrow">Doesn&rsquo;t apply to us</h4>
      <p class="cdd-desc">${c.appliesWhen && d.req !== 'optional' ? `It applies ${esc(c.appliesWhen.charAt(0).toLowerCase() + c.appliesWhen.slice(1))}. ` : ''}Tell your clients why it doesn&rsquo;t apply to you. They will see the reason.</p>
      <div class="cdd-na-opts" role="radiogroup" aria-label="Reason">${reasonsFor(d).map((r, i) => `<label><input type="radio" name="na-r" value="${i}"><span>${r}</span></label>`).join('')}
        <label><input type="radio" name="na-r" value="own"><span>Another reason</span></label></div>
      <textarea class="cdd-na-t" id="cdd-na-t" rows="2" placeholder="In a sentence, why it doesn&rsquo;t apply" hidden></textarea>
      ${hasFile ? '<p class="cdd-na-w">Its current file stays in its versions, read-only.</p>' : ''}
      <div class="cdd-na-acts"><button type="submit" class="btn btn-primary btn-sm" id="cdd-na-go" disabled>Mark as not applicable</button></div>
    </form>` : '';
    // the file (js/doc-files.js): a row that opens its preview
    // every version, current and earlier, valid or expired: any opens here (earlier ones read-only)
    const V = window.CM_VERSIONS, all = V && hasFile || v ? window.DOC_MODEL.allVersionsOf(d) : [];
    const versions = all.length > 1 ? `<section class="cdd-card"><h4 class="eyebrow">Versions</h4><p class="cdd-desc">Every version stays here, valid or expired. Clients keep the ones they were shown, even after you stop sharing.</p>
      <ul class="cmv">${all.map((x, k) => `<li class="cmv-i is-link${k === vk ? ' is-on' : ''}" data-cdd-ver="${k}" role="button" tabindex="0" aria-current="${k === vk}"><span class="cmv-t"><b>${x.current ? 'Current' : esc(x.label)}${k === vk ? ' <small class="cmv-here">Showing</small>' : ''}</b><small>Uploaded ${esc(x.uploaded || x.issued)} &middot; ${x.valid === 'No expiry' ? 'no expiry' : !V.parse(x.valid) ? 'no expiry date yet' : x.current ? `expiry date ${esc(x.valid)}` : `${V.stateOf(x) === 'expired' ? 'expired' : 'valid until'} ${esc(x.valid)}`}</small></span><span class="cmv-s">${x.current ? `<span class="co-badge ${STATUS[d.status][1]}">${STATUS[d.status][0]}</span>` : V.stateOf(x) === 'expired' ? '<span class="co-badge b-over">Expired</span>' : '<span class="co-badge b-neu">Replaced</span>'}</span></li>`).join('')}</ul></section>` : '';
    dq('cdd-body').innerHTML = (v ? '' : askCard(d)) + naForm + naCard + (hasFile ? '<div class="cmf-slot" id="cdd-file"></div>' : none) + read + versions + about;
    dq('cdd-body').scrollTop = 0;
    // the page with each value ALMA read highlighted, numbered as the citations: Preview opens it in a
    // drawer of its own beside this one, as the setup's (js/doc-files.js)
    dState.pv = null;
    if (hasFile && window.CMFiles) {
      const by = fields.find((x, i) => cites[i] && !x.flag && /issued by|issuer|authority|insurer|certification body|registry/i.test(x.name));
      const spec = { title: d.name, file, holder: decode(String(window.DOC_MODEL.D.company || '')), issuer: by ? decode(String(by.value).replace(/<[^>]+>/g, '')) : (d.cat.usuallyIssuedBy || '').split(';')[0].trim(),
        fields: fields.map((x, i) => (cites[i] ? { name: x.name, value: x.flag ? '' : decode(String(x.value).replace(/<[^>]+>/g, '')), flag: x.flag, i } : null)).filter(Boolean) };
      dState.pv = { title: d.name + (v ? ` · ${v.label}` : ''), sub: file, code: d.code, noFile: !!v, spec };
      const slot = dq('cdd-file'), drawn = dState;
      slot.innerHTML = window.CMFiles.fileRow(file);
      if (!v) window.CMFiles.get(d.code).then((r) => { if (r && dState === drawn && slot.isConnected) slot.innerHTML = window.CMFiles.fileRow(r.name); });
    }
    window.CMFiles && window.CMFiles.closePeek(dw);
    dq('cdd-foot').textContent = v ? `Read-only. Uploaded by ${v.by}; replaced on ${v.replaced}.` : hasFile ? (d.edited ? 'Edited by user: changes to ALMA’s reading are logged and visible to clients.' : `Issued ${d.issued}${d.valid && d.valid !== '—' ? ' · ' + (/^\d/.test(d.valid) ? 'expires ' : '') + d.valid : ''}`) : '';
    dq('cdd-acts').innerHTML = v ? `<button type="button" class="btn btn-quiet btn-sm" data-cdd-cur>Back to current version</button>`
      : ed ? '<button type="button" class="link-btn" data-cdd-edx>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-cdd-eds>Save changes</button>'
      : (hasFile && d.status !== 'na' ? '<button type="button" class="link-btn" data-cdd-ed>Make changes</button>' : '') + (canNa(d) && d.status !== 'na' && !dState.na ? '<button type="button" class="link-btn" data-na-open>Doesn&rsquo;t apply to us</button>' : '')
      + (d.status === 'na' ? '' : `<button type="button" class="btn btn-quiet btn-sm" data-cdd-up>${hasFile ? 'Upload a new version' : 'Upload it'}</button>`);
    const n = dState.list.length;
    dw.querySelector('.docd-nav').hidden = n < 2 || !!v;
    dq('cdd-count').textContent = `${dState.k + 1} of ${n}`;
    dq('cdd-prev').disabled = dState.k <= 0; dq('cdd-next').disabled = dState.k >= n - 1;
  };
  // Make changes, saved: what was typed over what ALMA read (each field, and the dates and reference
  // the tables show), as a correction of the same file; and, if it's another document, the file and
  // its values go there and this one is left without
  const saveEdit = () => {
    const d = docById(dState.list[dState.k]), MD = window.DOC_MODEL;
    const fl = d.cat.fields || [], vals = Object.assign({}, d.vals || {}), patch = { fix: true, edited: true };
    // its name, if changed: the document's (or the one it goes to's) from now on
    const nmIn = dw.querySelector('#cdd-nm'), nm = nmIn ? nmIn.value.trim() : null, named = nm != null && nm !== decode(d.name);
    dw.querySelectorAll('[data-fld]').forEach((inp) => {
      const x = fl[+inp.dataset.fld]; if (!x) return;
      const was = decode(String(valueOf(d, x) || '').replace(/<[^>]+>/g, ''));
      const now = inp.type === 'date' ? (inp.value ? (() => { const t = new Date(inp.value + 'T00:00'); return `${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`; })() : '') : inp.value.trim();
      if (now === was) return;
      vals[x.name] = now;
      const n = x.name.toLowerCase();
      if (/expiry|valid until|validity|end date|next exam|next inspection/.test(n)) patch.valid = now || '—';
      else if (/issue date|date of issue|issued on|^date$/.test(n)) patch.issued = now || '—';
      else if (/(certificate|policy|licence|license|reference|registration|document|report) (no|number)|^number$|reference/.test(n)) patch.ref = esc(now);
      else if (/issuer|issued by|insurer|certification body|authority|provider/.test(n) && !/tax number/.test(n)) patch.by = esc(now);
    });
    patch.vals = vals;
    // its status follows a new expiry date
    const exp = Date.parse(patch.valid || d.valid);
    if (['valid', 'expiring', 'expired', 'attention'].includes(d.status) && !Number.isNaN(exp)) patch.status = exp < Date.now() ? 'expired' : exp - Date.now() < 30 * 864e5 ? 'expiring' : 'valid';
    else if (d.status === 'attention') patch.status = 'valid';
    const to = window.CMDocPick ? window.CMDocPick.value(dw) : '';
    dState.edit = false;
    if (to && to !== d.code && to !== '__u') {
      const t = DOCS.find((x) => x.code === to && !x.kind);
      if (t) {
        MD.saveDoc(to, Object.assign({}, patch, { status: patch.status || 'valid', issued: patch.issued || d.issued, valid: patch.valid || d.valid, ref: patch.ref || d.ref, by: patch.by || d.by, note: '', conf: 98, uploaded: d.uploaded || today() }));
        const c = d.cat, none = c.requirement === 'on_request' ? 'notrequested' : c.requirement === 'optional' ? 'notuploaded' : 'missing';
        MD.saveDoc(d.code, { fix: true, status: none, issued: '—', valid: '—', ref: '', by: '', note: '', vals: null, edited: false });
        if (window.CMUncat) window.CMUncat.copyFile(d.code, to);
        if (named && MD.rename) MD.rename(to, nm);
        render(); openDrawer(t.id);
        return;
      }
    }
    MD.saveDoc(d.code, patch);
    if (named && MD.rename) MD.rename(d.code, nm);
    render(); drawDoc();
  };
  // a new name: everywhere the document shows (its rows, the clients who see it); empty, the catalog's
  const rename = (name) => {
    const d = docById(dState.list[dState.k]); if (!d || !window.DOC_MODEL.rename) return;
    window.DOC_MODEL.rename(d.code, name); dState.rn = false;
    render(); drawDoc();
    const b = dw.querySelector('[data-cdd-rn]'); if (b) b.focus({ preventScroll: true });
    if (window.CMAlmaJob && window.CMAlmaJob.toast) window.CMAlmaJob.toast(name.trim() && name.trim() !== decode(d.name0) ? `Renamed to ${esc(name.trim())}.` : `Back to its original name, ${esc(decode(d.name0))}.`);
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
    if (window.CMFiles) window.CMFiles.closePeek(dw);
    dw.classList.remove('is-open'); document.documentElement.classList.remove('dlg-open');
    setTimeout(() => { dw.hidden = true; }, 300);
    if (dLast && dLast.focus) dLast.focus({ preventScroll: true });
  };
  const stepDoc = (s) => { if (!dState) return; const k = dState.k + s; if (k < 0 || k >= dState.list.length) return; dState.k = k; dState.v = 0; dState.na = false; dState.cite = null; dState.edit = false; dState.rn = false; drawDoc(); };
  dq('cdd-prev').addEventListener('click', () => stepDoc(-1));
  dq('cdd-next').addEventListener('click', () => stepDoc(1));
  dw.addEventListener('click', (e) => {
    if (e.target.closest('[data-close]')) { closeDrawer(); return; }
    if (e.target.closest('[data-cdd-cur]')) { dState.v = 0; drawDoc(); return; }
    if (e.target.closest('[data-cdd-ed]')) { dState.edit = true; dState.na = false; drawDoc(); const i = dw.querySelector('[data-dp-cat]'); if (i) i.focus({ preventScroll: true }); return; }
    if (e.target.closest('[data-cdd-edx]')) { dState.edit = false; drawDoc(); return; }
    if (e.target.closest('[data-cdd-rn]')) { dState.rn = true; drawDoc(); const i = dq('cdd-rn'); if (i) { i.focus(); i.select(); } return; }
    if (e.target.closest('[data-cdd-rnx]')) { dState.rn = false; drawDoc(); return; }
    if (e.target.closest('[data-cdd-rns]')) { rename(dq('cdd-rn').value); return; }
    if (e.target.closest('[data-cdd-rno]')) { rename(''); return; }
    if (e.target.closest('[data-cdd-eds]')) { saveEdit(); return; }
    const cv = e.target.closest('[data-cdd-ver]'); if (cv) { dState.v = +cv.dataset.cddVer; dState.cite = null; drawDoc(); return; }
    const up = e.target.closest('[data-cdd-up]');
    if (up) { const d = docById(dState.list[dState.k]); if (window.CMUpload) window.CMUpload.open(`doc:${d.id}`, { onSaved: () => { render(); drawDoc(); } }); return; }
    if (e.target.closest('[data-na-open]')) { dState.na = true; drawDoc(); const first = dw.querySelector('[name="na-r"]'); if (first) first.focus(); return; }
    // a citation: open or close it in place, or show its line on the page
    const cb = e.target.closest('[data-cite]');
    if (cb) {
      const fig = dw.querySelector('#cdd-cite-' + cb.dataset.cite), open = fig.hidden;
      fig.hidden = !open; cb.setAttribute('aria-expanded', String(open)); cb.textContent = open ? 'Hide citation' : 'View citation';
      // only the passage: the preview opens with its "Show on the page"
      return;
    }
    const sh = e.target.closest('[data-cite-show]');
    if (sh) {
      // the passage is on the page: the preview opens beside, at that value
      if (dState.pv) window.CMFiles.openPeek(dw, dState.pv, +sh.dataset.citeShow);
      return;
    }
    if (e.target.closest('[data-cmf-peek]')) {
      if (dState.pv) window.CMFiles.openPeek(dw, dState.pv);
      return;
    }
    const ay = e.target.closest('[data-ask-yes], [data-ask-no]');
    if (ay && CN) {
      const c = CN.answer(ay.closest('[data-ask]').dataset.ask, ay.hasAttribute('data-ask-yes')); if (!c) return;
      askDone.set(c.id, c); render(); drawDoc();
      const done = dw.querySelector('[data-ask-done]'); if (done) done.focus({ preventScroll: true });
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
    const cv = e.target.closest && e.target.closest('[data-cdd-ver]'); if (cv && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); cv.click(); return; }
    if (e.target.id === 'cdd-rn' && e.key === 'Enter') { e.preventDefault(); rename(e.target.value); return; }
    if (e.target.id === 'cdd-rn' && e.key === 'Escape') { e.stopPropagation(); dState.rn = false; drawDoc(); const b = dw.querySelector('[data-cdd-rn]'); if (b) b.focus(); return; }
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
    const crumb = `<div class="cd-area-head cd-area-head-up"><div><h2 class="co-h-l">${esc(doc.name)}</h2><p class="co-muted">${doc.code} &middot; ${doc.requirement} &middot; one per ${NOUN[kind][0]}, ${items.length} on file.${doc.cat.condition ? ` <span class="co-subtle">Applies ${esc(doc.cat.appliesWhen.charAt(0).toLowerCase() + doc.cat.appliesWhen.slice(1))}.</span>` : ''}</p></div>${window.CMUpload ? `<button type="button" class="btn btn-quiet btn-sm" data-up="doc:${doc.id}">Upload for several ${NOUN[kind][1]}</button>` : ''}</div>`;
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
        return `<tr class="cd-row${go(it) ? ' is-rosterable' : ''}"${go(it)}${go(it) ? ' tabindex="0" role="link"' : ''} data-drop="rec:${doc.code}:${it.i}"><td><span class="n">${it.name}</span>${it.sub ? `<span class="d">${it.sub}</span>` : ''}</td><td><span class="co-badge ${cls}">${label}</span></td><td>${has ? confCell(it.status === 'attention' ? 61 : 86 + (hash(doc.code + it.i) % 14)) : dash}</td><td class="cd-ref">${has ? refOf(doc.code + it.i, it.exp) : dash}</td><td class="cd-by">${has ? esc(by) : dash}</td><td class="c">${has ? it.exp : dash}</td><td class="cd-ed"><span class="cd-ed-in">${UPB(`rec:${doc.code}:${it.i}`, has, `${doc.name} for ${it.name}`)}</span></td></tr>`;
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

  // four columns, and the row's upload at its end (the rest is in the document's drawer)
  const DOC_THEAD = '<thead><tr><th>Document name</th><th>Expiration date</th><th>ALMA confidence</th><th>Status</th><th><span class="sr-only">Upload</span></th></tr></thead>';
  const docTable = (docs) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-doc-tbl">${DOC_THEAD}<tbody>${docs.map(row).join('')}</tbody></table></div>`;
  const GROUP_NOTE = { 'On client request': 'Only needed once a client asks for it. Upload it ahead if you like.', Optional: 'Never required. Worth adding if it helps you win work.', Archived: 'Earlier versions, read-only, kept for audit.' };
  const group = (cat, docs, raw) => `<div class="cd-group"${raw === 'Archived' ? ' data-archived' : ''}><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${cat}</h3><span class="co-muted">${GROUP_NOTE[raw] ? GROUP_NOTE[raw] + ' &middot; ' : ''}${docs.length} document${docs.length === 1 ? '' : 's'}</span></div>${docTable(docs)}</div>`;

  // the areas, each a tile with its own count and an alert badge when something there needs you
  const renderHome = () => {
    groupsEl.innerHTML = `<div class="cd-areas" role="list">${AREAS.map((a) => {
      const docs = DATA.filter((d) => d.area === a.key && counted(d));
      const alerts = docs.filter(needsAttention).length;
      return `<button type="button" class="cd-area${docs.length ? '' : ' is-empty'}" data-area="${a.key}" role="listitem">` +
        `<span class="cd-area-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a.icon}</svg><span>${a.title}</span>${soon(a.key)}${alerts ? `<span class="cd-area-alert">${alerts}</span>` : ''}</span>` +
        `<span class="cd-area-n">${docs.length}<small>document${docs.length === 1 ? '' : 's'} ${window.DOC_MODEL.ORG ? 'on file' : 'asked of you'}</small></span>` +
        `<span class="cd-area-d">${a.sub}</span>` +
      `</button>`;
    }).join('')}</div>`;
  };

  const renderGroups = () => {
    const scope = area ? [area] : AREAS.map((a) => a.key);
    const list = DATA.filter((d) => keep(d) && scope.includes(d.area));
    // Workers: no Optional or Archived document tables (a search still finds those documents)
    const hide = (key, g) => (key === 'workers' || key === 'equipment') && area === key && !filtering() && (g === 'Optional' || g === 'Archived');
    const html = scope.flatMap((key) => GROUPS_OF(key).filter((g) => !hide(key, g)).map((g) => {
      const docs = list.filter((d) => d.area === key && d.group === g);
      return docs.length ? group(area ? g : docs[0].groupLabel, docs, g) : '';
    })).join('');
    // an area of a company added in this session, with nothing uploaded to it yet
    const empty = area && !filtering() && !DATA.some((d) => d.area === area);
    // Workers ends with the archived ones, as Company ends with its archived documents
    groupsEl.innerHTML = (list.length ? (area && !filtering() ? matrix(area) : '') + html : empty ? areaEmpty(area) : none()) + (area === 'workers' && !filtering() ? archivedTable() : '');
  };

  // Workers, Equipment and Products, everyone at once: one row per record, one column per
  // per-record document asked of any of them, a dot for its status (a dash where it isn't)
  const SHORT = { 'WK-11': 'Fitness', 'WK-12': 'Special risk', 'WK-13': 'Operator', 'WK-14': 'Training', 'WK-15': 'Delivery record', 'WK-16': 'Residence permit', 'WK-17': 'A1', 'WD-01': 'AIMA application', 'WD-02': 'Work permit', 'WD-03': 'Contract', 'WD-04': 'SS number', 'WD-05': 'Tax number', 'WD-06': 'OSHA card', 'WD-07': 'Trade licence', 'WD-08': 'Welder (ISO 9606)', 'WD-09': 'First aid', 'WD-10': 'NCA (Kenya)', 'WD-11': 'Driver CPC',
    'EQ-01': 'EC conformity', 'EQ-02': 'Pre&#8209;1995 cert.', 'EQ-03': 'Inspection', 'EQ-04': 'Maintenance', 'EQ-05': 'Manual', 'EQ-06': 'Calibration', 'EQ-07': 'Insurance', 'EQ-21': 'Technical sheet', 'EQ-22': 'Lifting exam', 'EQ-23': 'Pressure inspection', 'EQ-24': 'Electrical test', 'EQ-25': 'Fall arrest', 'EQ-26': 'ATEX', 'EQ-27': 'Scaffold', 'EQ-28': 'Registration', 'EQ-29': 'Road inspection', 'EQ-30': 'Motor insurance',
    'PR-01': 'DoP', 'PR-02': 'Constancy', 'PR-03': 'Technical sheet', 'PR-04': 'Safety sheet', 'PR-05': 'EU DoC', 'PR-06': 'EPD', 'PR-07': 'REACH', 'PR-08': 'Certification', 'UN-29': 'UL', 'UN-30': 'Prop 65' };
  // a worker's documents, by what they're for: the columns of the matrix and the sections of their
  // page, in this order. Identity is their ID document (not in the catalog: ALMA files it from an
  // upload); anything the catalog adds later goes to Other until it's given one
  const WK_CATS = [['identity', 'Identity'], ['right', 'Right to work'], ['health', 'Health'], ['training', 'Training and qualifications'], ['ppe', 'Personal protective equipment', 'PPE'], ['driving', 'Driving'], ['other', 'Other']];
  const WK_CAT = { ID: 'identity', DRV: 'driving', CRM: 'other', 'WK-16': 'right', 'WK-17': 'right', 'WK-11': 'health', 'WK-12': 'training', 'WK-13': 'training', 'WK-14': 'training', 'WK-15': 'ppe' };
  // by its code, else by its section in the list (js/worker-docs.js), else its name
  const SEC_CAT = { 'Identity': 'identity', 'Right to work': 'right', 'Health': 'health', 'Training and qualifications': 'training', 'Personal protective equipment': 'ppe', 'Driving': 'driving', 'Other': 'other' };
  const catOf = (d) => WK_CAT[d.code] || SEC_CAT[d.section || (d.cat && d.cat.section && d.cat.section.en)] || (DOCS.find((x) => x.code === d.code) && SEC_CAT[DOCS.find((x) => x.code === d.code).section]) || (/driv/i.test(d.name || '') ? 'driving' : 'other');
  // (within one, the list's order: the driving licence before the driver CPC)
  const LEAD = ['ID', 'DRV'];
  // a machine's documents, the same way (js/equipment-docs.js)
  const EQ_CATS = [['conformity', 'Conformity'], ['documentation', 'Documentation'], ['inspections', 'Inspections'], ['maintenance', 'Maintenance'], ['calibration', 'Calibration'], ['specific', 'Specific equipment'], ['insurance', 'Insurance']];
  const EQ_SEC = { 'Conformity': 'conformity', 'Documentation': 'documentation', 'Inspections': 'inspections', 'Maintenance': 'maintenance', 'Calibration': 'calibration', 'Specific equipment': 'specific', 'Insurance': 'insurance' };
  const eqCatOf = (d) => { const sec = d.section || (d.cat && d.cat.section && d.cat.section.en) || ((DOCS.find((x) => x.code === d.code) || {}).section); return EQ_SEC[sec] || 'specific'; };
  const byCat = (list, kind) => (kind === 'equipment' ? EQ_CATS.map(([k, l]) => [k, l, list.filter((d) => eqCatOf(d) === k), l])
    : WK_CATS.map(([k, l, sh]) => [k, l, list.filter((d) => catOf(d) === k).sort((x, y) => (LEAD.includes(y.code) ? 1 : 0) - (LEAD.includes(x.code) ? 1 : 0)), sh || l]));
  // a record's documents, as the company's: one table per category (its name and how many), the
  // same columns (expiration date, ALMA's confidence, status) and Upload or Replace on each row
  const catRow = (d, i) => { const [l, c] = d.tag || STATUS[d.status], has = !NO_FILE.includes(d.status) && d.status !== 'na';
    return `<tr class="cd-row"${d.spec ? ` data-drop="${d.spec}"` : ''}><td><span class="n">${esc(d.name)}</span><span class="d">${d.plain ? d.req : `${d.code} &middot; ${d.req}`}</span></td><td>${!has || !d.exp || d.exp === '—' ? dash : M.expHtml(d.exp)}</td><td>${has ? confCell(78 + (hash(d.code + i) % 21)) : dash}</td><td><span class="co-badge ${c}">${l}</span></td><td class="cd-ed"><span class="cd-ed-in">${d.spec ? UPB(d.spec, has, d.name) : ''}</span></td></tr>`; };
  const catTable = (rows, i) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-doc-tbl" data-unpaged>${DOC_THEAD}<tbody>${rows.map((d) => catRow(d, i)).join('')}</tbody></table></div>`;
  const catGroups = (per, kind, i) => byCat(per, kind).filter(([, , list]) => list.length).map(([k, l, list]) => `<div class="cd-group" data-cat="${k}"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${l}</h3><span class="co-muted">${list.length} document${list.length === 1 ? '' : 's'}</span></div>${catTable(list, i)}</div>`).join('');
  // their identity document: its status by the date it's valid until, once there's a file of it;
  // until then their ID is on file as data only, not uploaded
  const idRow = (i) => {
    const p = PERSON[i], f = M.idOf ? M.idOf(i) : null, has = !!(f && f.file);
    const valid = (has && f.valid) || p.id[2], t = Date.parse(valid);
    const status = !has ? 'notuploaded' : !Number.isNaN(t) && t < Date.now() ? 'expired' : !Number.isNaN(t) && t - Date.now() < 60 * 864e5 ? 'expiring' : 'valid';
    return { code: 'ID', name: 'Identity document', req: `${esc((has && f.type) || p.id[0])} &middot; ${esc((has && f.no) || p.id[1])}${has ? '' : ' &middot; on file as data, no document yet'}`, plain: true, status, exp: esc(valid || '—'), spec: p.archived ? '' : `rec:ID:${i}` };
  };
  // their optional documents (js/doc-upload.js files them): never asked for, so none missing; there
  // for whoever has one, and in date or not once it's on file
  const EXTRA = { DRV: ['Driving Licence', 'Licence'], CRM: ['Individual Criminal Record Certificate', 'Criminal record'] };
  const extraRow = (code, i) => {
    const f = M.extraOf ? M.extraOf(code, i) : null, has = !!(f && f.file), t = has ? Date.parse(f.valid) : NaN;
    const status = !has ? 'notuploaded' : !Number.isNaN(t) && t < Date.now() ? 'expired' : !Number.isNaN(t) && t - Date.now() < 30 * 864e5 ? 'expiring' : 'valid';
    return { code, name: EXTRA[code][0], req: has ? `Optional &middot; uploaded ${esc(f.on || '')}` : 'Optional &middot; upload it if they have one', plain: true, status, exp: has ? esc(f.valid || '—') : '—', spec: PERSON[i].archived || !M.saveExtra ? '' : `rec:${code}:${i}` };
  };
  const TONE = { notuploaded: 'neu', valid: 'ok', na: 'neu', processing: 'neu', expiring: 'pend', filemissing: 'warn', attention: 'warn', missing: 'bad', expired: 'bad', rejected: 'bad' };
  const matrix = (key) => {
    if (!['workers', 'equipment', 'products'].includes(key)) return '';
    let cols = DOCS.filter((d) => d.area === key && d.kind === key && d.roster.length);
    if (cols.length < 2) return '';
    // workers: in their categories, their ID first
    const wk = key === 'workers' || key === 'equipment', people = key === 'workers', ID_COL = { code: 'ID', name: 'Identity document', isId: true };
    const XCOLS = M.saveExtra ? Object.keys(EXTRA).map((code) => ({ code, name: EXTRA[code][0], isX: true })) : [];
    // workers: one column per category, its dot the worst of the documents in it asked of them
    const CAT_COL = { identity: 'Identity', right: 'Right to work', health: 'Health', training: 'Training and qualifications', ppe: 'PPE', driving: 'Driving license', other: 'Other' };
    if (people) cols = byCat([ID_COL, ...cols, ...XCOLS]).map(([k, , list]) => ({ cat: k, name: CAT_COL[k], docs: list }));
    else if (wk) cols = byCat(cols, 'equipment').map(([k, l, list]) => ({ cat: k, name: l, docs: list }));
    const docSt = (d, i) => { if (d.isId) return idRow(i).status; if (d.isX) return extraRow(d.code, i).status; const r = d.roster.find((x) => x.i === i); return r ? r.status : null; };
    const catCell = (c, i) => {
      const asked = c.docs.map((d) => [d, docSt(d, i)]).filter(([, st]) => st);
      if (!asked.length) return null;
      const real = asked.filter(([, st]) => st !== 'notuploaded');
      const st = real.length ? worstOf(real.map(([, x]) => x)) : 'notuploaded';
      const one = asked.length === 1 ? asked[0][0] : null;
      return { st, spec: one ? `rec:${one.code}:${i}` : `who:${key}:${i}`, tip: asked.map(([d, x]) => `${d.isId ? 'ID' : d.isX ? EXTRA[d.code][1] : SHORT[d.code] || d.name}: ${STATUS[x][0]}`).join(' &middot; ') };
    };
    const recs = D.records[key];
    const label = { workers: 'By worker', equipment: 'By machine', products: 'By product' }[key];
    const rows = recs.map((rec, i) => {
      if (rec.left) return ''; // no longer on the worker list
      const info = wk ? cols.map((c) => catCell(c, i)) : null;
      const cells = wk ? info.map((x) => (x ? x.st : null)) : cols.map((d) => docSt(d, i));
      const worst = worstOf(cells.filter(Boolean));
      const [wl, wc] = STATUS[worst];
      const go = key === 'workers' ? ` data-worker="${i}"` : key === 'equipment' ? ` data-machine="${i}"` : '';
      return `<tr class="cd-row${go ? ' is-rosterable' : ''}"${go}${go ? ` tabindex="0" role="link" aria-label="Open ${recordName(key, i)}"` : ''} data-drop="who:${key}:${i}"><td><span class="n">${recordName(key, i)}</span><span class="d">${recordSub(key, i)}</span></td>${cells.map((s, c) => (s
        ? wk ? `<td class="c"><button type="button" class="cd-cell" data-up="${info[c].spec}" title="${info[c].tip}"><span class="cd-dot is-${TONE[s]}"></span><span class="sr-only">${cols[c].name} for ${recordName(key, i)}: ${info[c].tip}. Upload a document</span></button></td>`
        : `<td class="c"><button type="button" class="cd-cell" data-up="rec:${cols[c].code}:${i}" title="${STATUS[s][0]} &middot; ${NO_FILE.includes(s) ? 'upload it' : 'replace it'}"><span class="cd-dot is-${TONE[s]}"></span><span class="sr-only">${SHORT[cols[c].code] || cols[c].name} for ${recordName(key, i)}: ${STATUS[s][0]}. ${NO_FILE.includes(s) ? 'Upload' : 'Replace'} it</span></button></td>`
        : '<td class="c"><span class="cd-dash" title="Not asked of this one">&mdash;</span></td>')).join('')}<td><span class="co-badge ${wc}">${wl}</span></td></tr>`;
    }).join('');
    const legend = [['ok', 'Valid'], ['pend', 'Expiring'], ['warn', 'Needs attention'], ['bad', 'Missing or expired']].map(([c, l]) => `<span><span class="cd-dot is-${c}"></span>${l}</span>`).join('');
    return `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${label}</h3><span class="co-muted">${recs.filter((r) => !r.left).length} ${NOUN[key][1]}</span>${window.CMUpload ? `<button type="button" class="btn btn-quiet btn-sm cd-group-up" data-up="area:${key}">Upload documents</button>` : ''}</div>
      <div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-matrix${wk ? ' cd-matrix-cats' : ''}"><thead><tr><th>${NOUN[key][0][0].toUpperCase() + NOUN[key][0].slice(1)}</th>${cols.map((d) => `<th class="c">${wk ? d.name : SHORT[d.code] || esc(d.name)}</th>`).join('')}<th>Overall</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend">${legend}${wk ? '<span><span class="cd-dot is-neu"></span>Not uploaded</span>' : ''}<span><span class="cd-dash">&mdash;</span>Not asked of them</span></p></div>`;
  };

  // Archived workers: archived from their own page (the switch there), off the list and every site,
  // their documents kept read-only. A row opens the worker, where Unarchive brings them back.
  const archivedTable = () => {
    const list = PERSON.map((p, i) => ({ p, i })).filter((x) => x.p.archived)
      .sort((a, b) => (Date.parse(b.p.archived) || 0) - (Date.parse(a.p.archived) || 0));
    const kept = (i) => recordDocs('workers', i).length;
    const rows = list.map(({ p, i }) => `<tr class="cd-row is-rosterable" data-worker="${i}" tabindex="0" role="link" aria-label="Open ${p.name}, archived"><td><span class="n">${p.name}</span><span class="d">${p.role}</span></td><td class="c">${esc(p.archived)}</td><td class="c">${kept(i)} kept, read&#8209;only</td><td><span class="co-badge b-arch">Archived</span></td></tr>`).join('');
    return `<div class="cd-group" data-archived-workers><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Archived workers</h3><span class="co-muted">${list.length} worker${list.length === 1 ? '' : 's'}</span></div>
      ${list.length ? `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-arch-tbl" data-paged="wk-archived"><thead><tr><th>Worker</th><th class="c">Archived on</th><th class="c">Documents</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend"><span>Archived workers are off your worker list and every site, kept for audits: you and the clients you shared them with still see what was on file. Open one to see their details, or to unarchive them.</span></p>`
      : `<div class="co-card cd-none cd-arch-none"><b class="co-row-n">No archived workers</b><span class="co-subtle">When someone leaves, open them and switch on Archive worker. Their documents are kept here, read&#8209;only.</span></div>`}</div>`;
  };

  // the documents of one worker or machine: every per-record document that covers them (an archived
  // worker's, as they were kept)
  const recordDocs = (kind, i) => DOCS.filter((d) => d.kind === kind && d.roster).map((d) => {
    const r = d.roster.find((x) => x.i === i) || (d.kept || []).find((x) => x.i === i); return r ? { code: d.code, name: d.name, req: d.requirement, status: r.status, exp: r.exp, spec: `rec:${d.code}:${i}` } : null;
  }).filter(Boolean);
  const kv = (k, v) => `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>`;
  const docRow = (d) => { const [l, c] = d.tag || STATUS[d.status]; return `<tr${d.spec ? ` data-drop="${d.spec}"` : ''}><td><span class="n">${esc(d.name)}</span><span class="d">${d.plain ? d.req : `${d.code} &middot; ${d.req}`}</span></td><td class="c">${d.status === 'missing' ? '&mdash;' : d.exp}</td><td><span class="co-badge ${c}">${l}</span></td><td class="cd-ed">${d.spec ? UPB(d.spec, !NO_FILE.includes(d.status), d.name) : ''}</td></tr>`; };
  const docsCard = (rows) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-wk-tbl"><thead><tr><th>Document</th><th class="c">Expires</th><th>Status</th><th><span class="sr-only">Upload</span></th></tr></thead><tbody>${rows.map(docRow).join('')}</tbody></table></div>`;
  const sitesCard = (list) => `<div class="co-card cd-card-pad"><ul class="cd-sites">${list.map((s) => { const [n, client] = SITES[s].split(' &middot; '); return `<li><span class="n">${n}</span><span class="co-subtle">${client}</span></li>`; }).join('')}</ul></div>`;

  // one worker: their profile, whether they may work here, their documents, and their sites.
  // Personal data is Restricted: a client sees it only while this worker is on one of its sites.
  const renderWorker = (i) => {
    const p = PERSON[i], gone = !!p.archived;
    const per = recordDocs('workers', i).map((d) => (gone ? Object.assign(d, { spec: '' }) : d)); // kept read-only
    // their identity document, once ALMA filed one for them (it's what made them a worker here, for
    // someone added from their documents)
    const idf = M.idOf ? M.idOf(i) : null;
    per.unshift(idRow(i));
    if (M.extraOf) per.push(...Object.keys(EXTRA).map((code) => extraRow(code, i)));
    // the documents for all workers, as they concern this one: whether the list on file names them
    // (the payroll insurance, the social security declaration), what they're designated for
    const SAYS = {
      'WK-01': [(d) => `Covered${d.by && !/\bof [A-Z]{2}-\d/.test(d.by) ? ` by ${d.by}` : ''}`, 'Not on the one on file. The next one should name them.', ['Not on it', 'b-warn']],
      'WK-02': [() => `Declared &middot; SS no. ${p.ss}`, 'Not on the one on file. The next one should declare them.', ['Not on it', 'b-warn']],
      'WK-03': [() => `Designated for ${M.DESIGNATED[i] || 'emergencies'}`, 'Not designated for an emergency role.', ['Not designated', 'b-neu']],
    };
    const month = DOCS.filter((d) => d.level === 'all_workers' && d.req !== 'optional' && d.status !== 'archived').map((d) => {
      const row = { code: d.code, name: d.name, req: 'Covers every worker', status: d.status, exp: d.valid, spec: d.status === 'na' || gone ? '' : `doc:${d.id}` };
      const say = SAYS[d.code];
      if (!say || NO_FILE.includes(d.status) || !M.listedOn) return row;
      if (M.listedOn(d.code, i)) return Object.assign(row, { req: `${d.code} &middot; ${say[0](d)}`, plain: true });
      return Object.assign(row, { req: `${d.code} &middot; ${say[1]}`, plain: true, tag: say[2] });
    });
    const [wl, wc] = gone ? ['Archived', 'b-arch'] : STATUS[worstOf(per.map((d) => d.status))];
    // what their documents say, by category, for the profile (in date, until when, or not on file)
    const docOf = (code) => per.find((d) => d.code === code);
    const said = (code, ok) => {
      const d = docOf(code); if (!d) return '<span class="co-subtle">Not asked of them</span>';
      if (NO_FILE.includes(d.status)) return '<span class="co-subtle">Not on file</span>';
      const [l, c] = STATUS[d.status];
      return `<span class="co-badge ${c}">${d.status === 'valid' ? ok : l}</span> <span class="co-subtle">${/^(—|No expiry|Until replaced)$/.test(d.exp) ? d.exp : `until ${d.exp}`}</span>`;
    };
    const quals = per.filter((d) => catOf(d) === 'training' && !NO_FILE.includes(d.status));
    // their documents, under what they're for; a section with nothing asked of them says so
    // their documents, as the company's: one table per category (its name and how many), the
    // same columns (expiration date, ALMA's confidence, status) and Upload or Replace on each row
    const docGroups = catGroups(per, 'workers', i);
    // archiving: a switch beside their name; on, it asks first (the modal below); off, they're back
    const sw = `<span class="cd-arch-sw"><span id="cd-arch-l-${i}">Archive worker</span><button type="button" class="co-sw" role="switch" aria-checked="${gone}" aria-labelledby="cd-arch-l-${i}" data-archive="${i}"><i></i></button></span>`;
    const gonebar = gone ? `<div class="cd-arch-bar" role="status"><span><b>Archived on ${esc(p.archived)}.</b> Off your worker list and every site, and ALMA doesn&rsquo;t ask for their documents. For audits, what was on file is kept, read&#8209;only: you, and the clients you shared them with, can still see it.</span><button type="button" class="btn btn-primary btn-sm" data-unarchive="${i}">Unarchive worker</button></div>` : '';
    // their right to work: its state, and where they're from (no more than that)
    const fromOf = () => { try { if (p.nationality && /^[A-Z]{2}$/.test(p.nationality)) return new Intl.DisplayNames(['en'], { type: 'region' }).of(p.nationality); } catch (e) {} return ''; };
    const from = p.passportOnly && !p.nationalityRead ? '' : fromOf();
    const right = `${p.passportOnly && !p.nationalityRead ? '<span class="co-badge b-pend">To check</span>'
      : p.permit ? `<span class="co-badge ${STATUS[p.permit.status][1]}">${p.permit.status === 'valid' ? 'Valid permit' : 'Permit expiring'}</span>`
      : '<span class="co-badge b-ok">Can work</span>'} <span class="co-subtle">${from ? `From ${esc(from)}` : 'Where they&rsquo;re from isn&rsquo;t on file yet'}</span>`;
    groupsEl.innerHTML = `<div class="cd-detail cd-worker">
      <div class="cd-area-head cd-arch-head"><div><h2 class="co-h-l">${p.name}</h2><p class="co-muted">${p.role} &middot; ${p.employment.toLowerCase()} since ${p.since} &middot; <span class="co-badge ${wc}">${wl}</span></p></div>${sw}</div>
      ${gonebar}
      ${gone ? '' : `<p class="cd-restricted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>Restricted personal data. Clients see it only while ${p.name.split(' ')[0]} is on one of their sites.</p>`}
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Worker profile</h3><span class="co-muted">${p.isNew ? `Added ${esc(p.since)}, from their documents` : 'Data only, no file'}</span></div>
        <div class="co-card cd-card-pad"><dl class="pd-grid">
          ${kv('Full name', p.name)}${kv('Job category', p.roleUnset ? '<span class="co-subtle">Not set yet</span>' : p.role)}${kv('Nationality', p.passportOnly && !p.nationalityRead ? '<span class="co-subtle">Not read yet</span>' : p.nationalityName)}
          ${kv('Birth date', p.birth)}${kv('Tax number', p.tax)}${kv('Social security number', p.ss)}
          ${kv('Home address', p.address)}${kv('Employment', `${p.employment}, since ${p.since}`)}
          ${kv('Identification', `${p.id[0]} &middot; ${p.id[1]}<br><span class="co-subtle">valid until ${p.id[2]}${idf && idf.file ? ' &middot; read by ALMA from their document' : ''}</span>`)}
          ${kv('Right to work', right)}
          ${kv('Health', said('WK-11', 'Fit for work'))}${kv('Training and qualifications', quals.length ? quals.map((d) => `${esc(d.name)}${d.status === 'valid' ? '' : ` <span class="co-badge ${STATUS[d.status][1]}">${STATUS[d.status][0]}</span>`}`).join('<br>') : '<span class="co-subtle">None on file</span>')}
          ${kv('Personal protective equipment', said('WK-15', 'Delivered'))}${kv('Driving', said('DRV', 'Licence valid'))}${kv('Other', docOf('CRM') && !NO_FILE.includes(docOf('CRM').status) ? `Criminal record certificate<br>${said('CRM', 'Valid')}` : '<span class="co-subtle">Nothing on file</span>')}
        </dl></div></div>
      ${docGroups}
      ${month.length ? `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Company documents that name them</h3><span class="co-muted">For all workers &middot; what each one says about ${p.name.split(' ')[0]}</span></div>${catTable(month, i)}</div>` : ''}
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${gone ? 'Was on site' : 'On site'}</h3><span class="co-muted">${p.sites.length} site${p.sites.length === 1 ? '' : 's'}</span></div>${sitesCard(p.sites)}</div>
    </div>`;
  };

  // one machine: its profile, who may operate it, its documents, and the sites it is on
  const renderMachine = (i) => {
    const m = MACHINE[i];
    const per = recordDocs('equipment', i);
    const [wl, wc] = STATUS[worstOf(per.map((d) => d.status))];
    const next = per.find((d) => d.code === 'EQ-03'), maint = per.find((d) => d.code === 'EQ-04');
    // what its documents say, by category, for the profile (in date, until when, or not on file)
    const onFile = (d) => d && !NO_FILE.includes(d.status);
    const sayM = (list, none) => {
      const got = list.filter(onFile); if (!list.length) return '<span class="co-subtle">Not asked of it</span>';
      if (!got.length) return `<span class="co-subtle">${none || 'Not on file'}</span>`;
      return got.map((d) => { const [l, c] = STATUS[d.status]; return `${esc(d.name)} <span class="co-badge ${c}">${l}</span>${d.exp && !/^(—|No expiry|Until replaced)$/.test(d.exp) ? ` <span class="co-subtle">until ${d.exp}</span>` : ''}`; }).join('<br>');
    };
    const inCat = (k) => per.filter((d) => eqCatOf(d) === k);
    const op = DOCS.find((d) => d.code === 'WK-13');
    const opRow = (w) => { const r = op && op.roster.find((x) => x.i === w); const [l, c] = STATUS[r ? r.status : 'missing'];
      return `<tr class="cd-row is-rosterable" data-worker="${w}" tabindex="0" role="link" aria-label="Open ${WORKERS[w][0]}"><td><span class="n">${WORKERS[w][0]}</span><span class="d">${WORKERS[w][1]}</span></td><td class="c">${r ? r.exp : '&mdash;'}</td><td><span class="co-badge ${c}">${r ? 'Operator certificate ' + l.toLowerCase() : 'No certificate on file'}</span></td></tr>`; };
    groupsEl.innerHTML = `<div class="cd-detail cd-worker cd-machine">
      <div class="cd-area-head"><h2 class="co-h-l">${m.type} <span class="soft">&middot; ${m.brand === 'Ferreira (in&#8209;house)' ? m.model : m.brand + ' ' + m.model}</span></h2><p class="co-muted">${m.ref} &middot; built ${m.yearBuilt} &middot; ${m.owned.toLowerCase().replace(/(&middot;|·).*$/, '').trim()} &middot; <span class="co-badge ${wc}">${wl}</span></p></div>
      ${next && next.status === 'attention' ? `<p class="cd-restricted cd-attn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg>Periodic inspection due ${next.exp}. Book it, and drop the report on ALMA when it is done.</p>` : ''}
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Equipment profile</h3><span class="co-muted">Data only, no file</span></div>
        <div class="co-card cd-card-pad"><dl class="pd-grid">
          ${kv('Equipment type', m.type)}${kv('Brand', m.brand)}${kv('Model', m.model)}
          ${kv('Serial number', m.serial)}${kv('Plate', m.plate || '<span class="co-subtle">Not road&#8209;registered</span>')}${kv('Year built', `${m.yearBuilt}${m.yearBuilt < 1995 ? ' <span class="co-subtle">&middot; before 1995, so EQ&#8209;02 instead of EQ&#8209;01</span>' : ''}`)}
          ${kv('Owned or rented', m.owned)}${kv('Internal code', m.ref)}${kv('Hours on the clock', m.hours ? m.hours.toLocaleString('en-US') + ' h' : '<span class="co-subtle">Not metered</span>')}
          ${kv('Requires certified operator', m.certified ? '<span class="co-badge b-pend">Yes</span> <span class="co-subtle">operators named below</span>' : '<span class="co-badge b-neu">No</span>')}
          ${kv('Next inspection', next ? next.exp : '&mdash;')}${kv('Next maintenance', maint ? maint.exp : '&mdash;')}
          ${kv('Conformity', sayM(inCat('conformity')))}${kv('Documentation', sayM(inCat('documentation')))}${kv('Calibration', sayM(inCat('calibration')))}
          ${kv('Specific equipment', sayM(inCat('specific'), 'Nothing on file'))}${kv('Insurance', sayM(inCat('insurance')))}
        </dl></div></div>
      ${m.certified ? `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Who may operate it</h3><span class="co-muted">${m.operators.length} operator${m.operators.length === 1 ? '' : 's'} &middot; WK&#8209;13</span></div>
        <div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-wk-tbl"><thead><tr><th>Worker</th><th class="c">Certificate expires</th><th>Status</th></tr></thead><tbody>${m.operators.map(opRow).join('')}</tbody></table></div></div>` : ''}
      ${catGroups(per, 'equipment', i)}
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
  // not open at launch: its badge (js/company-switcher.js)
  const SOON = (window.CM_SOON || { badge: '<span class="cm-soon">Coming soon</span>', areas: ['workers', 'equipment'].filter((k) => !(window.CM_SOON_OPEN || []).includes(k)) }); // this page draws before js/company-switcher.js loads
  const soon = (k) => (SOON.areas.includes(k) ? SOON.badge : '');
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
    h2.innerHTML = a ? a.title + (soon(a.key) ? ' ' + soon(a.key) : '') : 'All company documents';
    const fresh = window.DOC_MODEL.ORG; // a company added in this session: only what it uploaded
    sub.innerHTML = a ? a.long : fresh ? `The documents you&rsquo;ve uploaded, kept in one profile so any client finds the same set. Your profile: <b class="cd-profile">${D.line}</b>.` : `Every document the C&#8209;MORE catalog asks of a company like yours, kept in one profile so any client finds the same set. Chosen from your profile: <b class="cd-profile">${D.line}</b>.`;
    counts(a ? DOCS.filter((d) => d.area === a.key) : DOCS);
    document.getElementById('cd-card-total-d').textContent = fresh ? (a ? `Every document you've uploaded in ${a.title.toLowerCase()}.` : 'Every document you’ve uploaded.') : a ? `Every document asked of you in ${a.title.toLowerCase()}.` : 'Every document asked of you, from your profile.';
    if (fresh) { const h = document.querySelector('#cd-card-total-d') && document.querySelector('#cd-card-total-d').closest('.cd-card'); const l = h && h.querySelector('.cd-card-h span'); if (l) l.textContent = 'On file'; }
  };

  function render() {
    // the side menu's Documents sections (js/company-switcher.js) and the address follow the section open
    document.dispatchEvent(new CustomEvent('cm-docs-area', { detail: area }));
    const q = new URLSearchParams(location.search);
    if ((q.get('area') || null) !== area && !q.get('open')) { if (area) q.set('area', area); else q.delete('area'); window.history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); }
    // a section not open yet (js/company-switcher.js): its coming-soon screen, and nothing of it
    const isSoon = !!area && SOON.areas.includes(area);
    document.getElementById('cdetails').classList.toggle('is-soon', isSoon);
    if (isSoon) {
      updateHeader(); tools.hidden = true; pills.hidden = true;
      if (window.CM_SOON && window.CM_SOON.screen) groupsEl.innerHTML = window.CM_SOON.screen(area === 'workers' ? 'Workers&rsquo; documents' : `${AREA_TITLE[area] || area} documents`, 'are');
      else { groupsEl.innerHTML = ''; addEventListener('DOMContentLoaded', render, { once: true }); } // that file loads after this one
      return;
    }
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
    // the files ALMA couldn't place (js/doc-sort.js): on the home of Documents, and under Company
    // they come before the archived documents, which close the list
    if (window.CMUncat && !filtering() && (onHome || area === 'company')) { const arc = groupsEl.querySelector('[data-archived]'); if (arc) arc.insertAdjacentHTML('beforebegin', window.CMUncat.section()); else groupsEl.insertAdjacentHTML('beforeend', window.CMUncat.section()); }

    const on = GROUPS.flatMap(([label, k]) => [...f[k]].map((v) => [label, k, v]));
    pills.hidden = !on.length;
    pills.innerHTML = on.map(([label, k, v]) => `<button type="button" class="co-pill" data-k="${k}" data-v="${v}" aria-label="Remove filter ${label}: ${v}"><span>${label}:</span><b>${v}</b><i aria-hidden="true">×</i></button>`).join('');
    const n = nOn(); btn.querySelector('[data-filt-n]').hidden = !n; btn.querySelector('[data-filt-n]').textContent = n;
    tools.querySelector('.co-tools-clear').hidden = !(n || f.q);
  }

  const toTop = () => scrollTo({ top: 0, behavior: 'smooth' });
  // a file sorted, or one more ALMA couldn't place: the page again (js/doc-sort.js)
  document.addEventListener('cm-uncat', () => render());
  // the side menu's Documents sections (js/company-switcher.js): here, they open in place
  // and Documents itself, from a section or a document: back to every section, at the top
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.sn-item[title="Documents"]')) return;
    e.preventDefault();
    if (area === null && detail === null && worker === null && machine === null) { toTop(); return; }
    area = null; detail = null; worker = null; machine = null; resetDetailFilter(); render(); toTop();
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-sn-area]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || !AREAS.some((x) => x.key === a.dataset.snArea)) return;
    e.preventDefault();
    area = a.dataset.snArea; detail = null; worker = null; machine = null; resetDetailFilter(); render(); toTop();
    const scrim = document.getElementById('sn-scrim'); if (scrim && !scrim.hidden) scrim.click(); // the menu, as a drawer on a phone, closes
  });

  crumbTrail.addEventListener('click', (e) => {
    const b = e.target.closest('[data-crumb]'); if (!b) return;
    if (b.dataset.crumb === 'root') { area = null; detail = null; worker = null; machine = null; resetDetailFilter(); }
    else if (b.dataset.crumb === 'area') { detail = null; worker = null; machine = null; resetDetailFilter(); }
    else if (b.dataset.crumb === 'detail') { worker = null; machine = null; }
    render(); toTop();
  });

  // ---- archiving a worker: a word first, then the page again from the model -------------------------
  const ARX = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  let archDlg = null, archLast = null;
  const archShut = () => { archDlg.hidden = true; document.documentElement.classList.remove('dlg-open'); if (archLast && archLast.isConnected) archLast.focus({ preventScroll: true }); };
  const askArchive = (i) => {
    const p = PERSON[i], n = recordDocs('workers', i).length;
    if (!archDlg) {
      archDlg = document.createElement('div'); archDlg.className = 'dlg cd-arch-dlg'; archDlg.hidden = true;
      archDlg.innerHTML = `<div class="dlg-scrim" data-ax></div><div class="dlg-card" role="alertdialog" aria-modal="true" aria-labelledby="cd-arch-t" aria-describedby="cd-arch-p">
        <button type="button" class="dlg-x" data-ax aria-label="Close">${ARX}</button>
        <div class="dlg-head"><span class="cd-arch-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg></span><h2 id="cd-arch-t"></h2><p id="cd-arch-p"></p></div>
        <div class="dlg-body"><ul class="cd-arch-list" id="cd-arch-list"></ul></div>
        <div class="dlg-foot"><button type="button" class="btn btn-quiet" data-ax>Cancel</button><button type="button" class="btn btn-primary cd-arch-go" id="cd-arch-go">Archive worker</button></div></div>`;
      document.body.appendChild(archDlg);
      archDlg.addEventListener('click', (e) => { if (e.target.closest('[data-ax]')) archShut(); });
      archDlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); archShut(); } });
      archDlg.querySelector('#cd-arch-go').addEventListener('click', () => {
        const k = +archDlg.dataset.i, q = PERSON[k];
        window.DOC_MODEL.saveCrew({ archive: [k, window.DOC_MODEL.today()] });
        // the page again from the model, on the same worker, now archived
        try { sessionStorage.setItem('cm-upload-toast', `${q.name} is archived. They&rsquo;re in Archived workers, at the end of Workers, with their documents.`); } catch (e) {}
        location.href = `company-details.html?area=workers&worker=${k}`;
      });
    }
    archDlg.dataset.i = i; archLast = document.activeElement;
    archDlg.querySelector('#cd-arch-t').innerHTML = `Archive ${p.name}?`;
    archDlg.querySelector('#cd-arch-p').textContent = 'Do this when someone no longer works for you. They come off your worker list and off every site you have them on.';
    archDlg.querySelector('#cd-arch-list').innerHTML = [
      'ALMA stops asking for their documents, and they no longer count in your compliance.',
      `For audits, their ${n} document${n === 1 ? ' is' : 's are'} kept, read&#8209;only, and stay${n === 1 ? 's' : ''} visible to you and to the clients you shared ${n === 1 ? 'it' : 'them'} with.`,
      'You can unarchive them at any time from Archived workers.'].map((t) => `<li>${t}</li>`).join('');
    archDlg.hidden = false; document.documentElement.classList.add('dlg-open');
    setTimeout(() => archDlg.querySelector('[data-ax].btn').focus(), 30);
  };
  const unarchive = (i) => {
    window.DOC_MODEL.saveCrew({ unarchive: i });
    try { sessionStorage.setItem('cm-upload-toast', `${PERSON[i].name} is back on your worker list. ALMA asks for their documents again.`); } catch (e) {}
    location.href = `company-details.html?area=workers&worker=${i}`;
  };

  groupsEl.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-archive]');
    if (sw) { const i = +sw.dataset.archive; if (sw.getAttribute('aria-checked') === 'true') unarchive(i); else askArchive(i); return; }
    const ua = e.target.closest('[data-unarchive]'); if (ua) { unarchive(+ua.dataset.unarchive); return; }
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

  // ALMA's drop: takes files by drag or by browsing and hands them to her upload (js/doc-upload.js),
  // which works out what each one is and who it's for, and checks it before it's filed. Without it,
  // a file goes to the first company document that is expired or needs attention.
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
    // ALMA works out what each file is and who it's for, and checks it, before anything is filed
    const toALMA = (list) => window.CMUpload && !window.DOC_MODEL.ORG && list && list.length
      && window.CMUpload.open(area && window.CMUpload.can(`area:${area}`) && area !== 'company' ? `area:${area}` : 'all', { files: list, onSaved: () => { render(); syncCards(); } });
    file.multiple = !!window.CMUpload;
    const took = (fl, all) => {
      if (toALMA(all)) return;
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
    file.addEventListener('change', () => took(file.files[0], file.files));
    drop.addEventListener('dragover', (e) => { e.preventDefault(); if (state === 'idle' || state === 'file') drop.classList.add('is-over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-over'); took(e.dataTransfer.files[0], e.dataTransfer.files); });
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
        if (window.CMFiles) window.CMFiles.put(target.code, picked); // the file itself, for its drawer
        window.DOC_MODEL.saveDoc(target.code, { status: 'valid', issued: today(), valid: target.valid === 'No expiry' ? 'No expiry' : today().replace(/\d{4}$/, (y) => +y + 1), note: '', ref: target.ref || refOf(target.code, '2026'), by: target.by || issuerOf(target.cat) });
        target.text = textOf(target);
        t.textContent = `Filed: ${target.name}, valid again.`;
        dsub.textContent = `${issuerOf(target.cat) || 'Checked'} · valid until ${target.valid}. Prototype: nothing was uploaded or saved.`;
        render(); syncCards();
      }, 2200);
    });
  }

  // every table here takes a file: a row's Upload / Replace, a matrix cell, a file dropped on a row
  // (js/doc-upload.js); what ALMA files is on the page as soon as it's saved
  if (window.CMUpload) window.CMUpload.wire(groupsEl, () => { render(); syncCards(); });

  // arriving from elsewhere (the home page's "Documents requiring attention", a notification)
  // already knowing which document: open straight to it
  const openCode = new URLSearchParams(location.search).get('open');
  // or which section (?area=workers)
  const openArea = new URLSearchParams(location.search).get('area');
  if (openArea && AREAS.some((a) => a.key === openArea)) area = openArea;
  const openDoc = openCode && DOCS.find((d) => d.code === openCode);
  const qs = new URLSearchParams(location.search), openWk = qs.get('worker'), toArch = qs.has('archived');
  if (openWk != null && PERSON[+openWk]) { area = 'workers'; worker = +openWk; }
  if (openWk != null || toArch) { qs.delete('worker'); qs.delete('archived'); window.history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs : '') + location.hash); }
  if (openDoc) {
    area = openDoc.area;
    if (openDoc.kind && openDoc.roster.length) { detail = openDoc.id; resetDetailFilter(); }
  }
  render();
  if (toArch) { const a = groupsEl.querySelector('[data-archived-workers]'); if (a) setTimeout(() => scrollTo({ top: a.getBoundingClientRect().top + scrollY - 96 }), 60); }
  if (openDoc && detail === null) {
    const arrived = groupsEl.querySelector(`[data-row-id="${openDoc.id}"]`);
    if (arrived) { arrived.scrollIntoView({ block: 'center' }); arrived.classList.add('is-arrived'); setTimeout(() => openDrawer(openDoc.id), 450); }
  }
})();
