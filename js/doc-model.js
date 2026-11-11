/* The demo company's documents, shared by every page that shows them (Documents, the company
   homepage): the catalog (js/doc-catalog.js) and the rules (js/doc-rules.js) decide which documents
   the company is asked for; what lives here is the demo — the company's profile and records (workers,
   machines), the state of each document (status, dates, reference, note), and the marks the company
   makes itself (Not applicable). Pages read window.DOC_MODEL; none of them keeps a copy of its own,
   so the homepage's counts and alerts always match the Documents page. */
/* A document's versions, and who sees which. Every document keeps the versions it replaced: the
   company sees them all, current and earlier, valid or expired. A client sees a version if it was
   the current one when the client was given consent, or was uploaded while the consent stood: so
   a client keeps what it was shown after the consent is stopped, never sees what's uploaded after,
   and one given consent today sees only the current version, expired or not.
   window.CM_VERSIONS: parse(date), fmt(date), addM(date, months), seen(versions, periods), stateOf(version),
     list(versions, { owner, cur }) and button(key, versions, { owner, open }): the list under a row, and its toggle.
     versions: newest first, each { uploaded, valid, … }; periods: [{ from, to }] (dates, to null while it stands). */
window.CM_VERSIONS = (() => {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const parse = (s) => { const m = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(String(s || '').trim()); return m ? new Date(+m[3], MON.indexOf(m[2]), +m[1]) : null; };
  const fmt = (dt) => `${dt.getDate()} ${MON[dt.getMonth()]} ${dt.getFullYear()}`;
  const addM = (dt, n) => new Date(dt.getFullYear(), dt.getMonth() + n, Math.min(dt.getDate(), 28));
  const now = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
  // a version as it stands: still valid, or expired (by its own expiry date)
  const stateOf = (v) => { const e = parse(v.valid); return e && e < now() ? 'expired' : 'valid'; };
  // each version, marked: seen by the client or not, and why not
  const seen = (versions, periods) => {
    const ps = (periods || []).map((p) => ({ from: parse(p.from), to: p.to ? parse(p.to) : null })).filter((p) => p.from);
    return versions.map((v, i) => {
      const up = parse(v.uploaded) || parse(v.issued);
      const ok = !!up && ps.some((p) => (up > p.from && (!p.to || up <= p.to))
        // the one in place when the consent was given: the newest uploaded by then
        || (up <= p.from && !versions.slice(0, i).some((w) => { const u = parse(w.uploaded) || parse(w.issued); return u && u <= p.from; })));
      const last = ps.length ? ps[ps.length - 1] : null;
      const why = ok ? '' : !ps.length ? 'never' : last.to && up > last.to ? 'after' : up < ps[0].from ? 'before' : 'gap';
      return Object.assign({}, v, { seen: ok, why });
    });
  };
  // ---- the list, under a document's row ---------------------------------------------------------------
  // Newest first. For the company (owner): every version, and whether this client sees it and, if
  // not, why. For a client: only the ones it sees. cur: the current one's badge, when it has its own.
  const esc = (x) => String(x == null ? '' : x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const WHY = { before: 'From before they had access', after: 'Uploaded after you stopped sharing', gap: 'Uploaded while you weren&rsquo;t sharing', never: 'Not shared' };
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  // the newest one a client was shown reads as it stands (valid or expired), not as replaced: what
  // replaced it isn't theirs to know
  const badge = (v, cur, top) => (v.current && cur ? cur : v.current || top ? (stateOf(v) === 'expired' ? '<span class="co-badge b-over">Expired</span>' : '<span class="co-badge b-ok">Valid</span>')
    : stateOf(v) === 'expired' ? '<span class="co-badge b-over">Expired</span>' : '<span class="co-badge b-neu">Replaced</span>');
  const V_DATE = (x) => !!parse(x);
  const list = (versions, o = {}) => {
    const vs = o.owner ? versions : versions.filter((v) => v.seen);
    return `<ul class="cmv${o.owner ? ' is-owner' : ''}">${vs.map((v) => `<li class="cmv-i${o.owner && !v.seen ? ' is-off' : ''}">
        <span class="cmv-t"><b>${v.current ? 'Current' : esc(v.label)}</b><small>Uploaded ${esc(v.uploaded || v.issued)} &middot; ${v.valid === 'No expiry' ? 'no expiry' : !V_DATE(v.valid) ? 'no expiry date yet' : v.current && o.cur ? `expiry date ${esc(v.valid)}` : `${stateOf(v) === 'expired' ? 'expired' : 'valid until'} ${esc(v.valid)}`}</small></span>
        <span class="cmv-s">${badge(v, o.cur, !o.owner && v === vs[0])}</span>
        ${o.owner ? `<span class="cmv-w">${v.seen ? `<span class="cmv-yes">${TICK}${o.they || 'They see it'}</span>` : `<span class="cmv-no">${WHY[v.why] || WHY.never}</span>`}</span>` : ''}</li>`).join('')}</ul>`;
  };
  // the button that opens it: how many of them, for whom
  const CHEV = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>';
  const button = (key, versions, o = {}) => {
    const n = versions.filter((v) => v.seen).length, all = versions.length;
    if (!all || (!o.owner && n < 2) || (o.owner && all < 2 && n === all)) return '';
    const vb = o.verb || 'Sees', say = o.owner ? (n === all ? `${vb} all ${all} versions` : `${vb} ${n} of ${all} versions`) : `${n} versions`;
    return `<button type="button" class="cmv-btn${o.open ? ' is-open' : ''}" data-vers="${esc(key)}" aria-expanded="${!!o.open}">${say}${CHEV}</button>`;
  };
  if (!document.getElementById('cmv-css')) {
    const st = document.createElement('style'); st.id = 'cmv-css';
    st.textContent = `
.cmv-btn { display: inline-flex; align-items: center; gap: 0.25rem; margin: 0.375rem 0 0; padding: 0.125rem 0.5rem 0.125rem 0.625rem; border: 1px solid var(--color-line); border-radius: 999px; background: var(--color-surface); font: inherit; font-size: 0.75rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.cmv-btn:hover { border-color: var(--color-sand-400); color: var(--color-ink); }
.cmv-btn svg { width: 0.875rem; height: 0.875rem; transition: transform .15s; }
.cmv-btn.is-open svg { transform: rotate(180deg); }
.sp-tbl td > .cmv-btn { display: flex; width: fit-content; }
tr.cmv-tr > td { padding: 0 1rem 0.875rem !important; background: var(--color-surface); }
.cmv { display: grid; margin: 0; padding: 0.25rem 0; list-style: none; border-radius: 0.75rem; background: var(--color-light-beige); }
.cmv-i { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.25rem 1rem; padding: 0.5rem 0.875rem; text-align: left; }
.cmv.is-owner .cmv-i { grid-template-columns: minmax(0, 1fr) auto minmax(9rem, auto); }
.cmv-i + .cmv-i { border-top: 1px solid var(--color-mid-beige); }
.cmv-t { display: grid; min-width: 0; font-size: 0.875rem; line-height: 1.35; }
.cmv-t b { font-weight: 600; }
.cmv-t small { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmv-i.is-off .cmv-t, .cmv-i.is-off .cmv-s { opacity: 0.55; }
.cmv-w { justify-self: end; font-size: 0.8125rem; text-align: right; }
.cmv-yes { display: inline-flex; align-items: center; gap: 0.3125rem; color: var(--color-positive, #2e7d4f); font-weight: 500; }
.cmv-yes svg { width: 0.875rem; height: 0.875rem; }
.cmv-no { color: var(--color-ink-subtle); }
.cmv-i.is-link { cursor: pointer; }
.cmv-i.is-link:hover { background: color-mix(in oklab, var(--color-mid-beige) 45%, transparent); }
.cmv-i.is-link:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: -2px; }
.cmv-i.is-on { box-shadow: inset 3px 0 0 var(--color-coral); }
.cmv-here { margin-left: 0.375rem; font-size: 0.75rem; font-weight: 500; color: var(--color-coral-deep, var(--color-ink-subtle)); }
@media (max-width: 40rem) { .cmv.is-owner .cmv-i { grid-template-columns: minmax(0, 1fr) auto; } .cmv-w { grid-column: 1 / -1; justify-self: start; text-align: left; } }`;
    document.head.appendChild(st);
  }
  return { parse, fmt, addM, seen, stateOf, list, button, MON };
})();

window.DOC_MODEL = (() => {
  const CAT = window.DOC_CATALOG || { docs: [], labels: {} };
  const R = window.DocRules;
  const LBL = CAT.labels || {};
  const en = (o) => (o && typeof o === 'object' ? o.en : o) || '';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const byCode = Object.fromEntries(CAT.docs.map((c) => [c.code, c]));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ---- the demo company -------------------------------------------------------------------------
  // Miguel's: a Portuguese construction company with its own crews and machines (Company, Workers,
  // Equipment). Products would appear for a company that supplies materials; this one doesn't.
  // who is signed in (the page's head decides): Miguel's company, or Beatriz's (Veridian Harvest Co.)
  const PERSONA = document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel';

  // Miguel's crew: [name, job category]
  const WORKERS = [
    ['Carlos Pinto', 'Foreman'], ['Miguel Alves', 'Carpenter'], ['Tiago Sousa', 'Electrician'],
    ['Bruno Ferreira', 'Laborer'], ['Ricardo Lopes', 'Crane operator'], ['Andr&eacute; Costa', 'Welder'],
    ['Paulo Martins', 'Laborer'], ['Nuno Silva', 'Safety officer'], ['Diogo Pereira', 'Carpenter'],
    ['Jo&atilde;o Fernandes', 'Laborer'], ['Rui Gon&ccedil;alves', 'Mason'], ['Hugo Marques', 'Rigger'],
    ['S&eacute;rgio Rocha', 'Electrician'], ['Lu&iacute;s Carvalho', 'Plumber'], ['Filipe Teixeira', 'Laborer'],
    ['V&iacute;tor Ramos', 'Painter'], ['Fernando Correia', 'Foreman'], ['Artur Nunes', 'Surveyor'],
    ['Gon&ccedil;alo Pires', 'Laborer'], ['M&aacute;rio Dias', 'Crane operator'], ['Rodrigo Cardoso', 'Welder'],
    ['Eduardo Batista', 'Mason'], ['Daniel Moreira', 'Laborer'], ['Pedro Antunes', 'Safety officer'],
  ];
  // the crew as changed by a new worker list, once the user approved it (js/doc-upload.js): who
  // joined (added at the end, so everyone else keeps their documents), who left, whose job changed.
  // Kept for this tab.
  const CREW_KEY = 'cm-crew' + (PERSONA === 'beatriz' ? '-beatriz' : '');
  // archived: archived by hand from a worker's page (js/company-details.js), { worker: the day }:
  // off the list like one who left, their documents kept read-only, and back with Unarchive
  const crew = (() => { try { return Object.assign({ added: [], left: [], roles: {}, archived: {} }, JSON.parse(sessionStorage.getItem(CREW_KEY) || 'null') || {}); } catch (e) { return { added: [], left: [], roles: {}, archived: {} }; } })();
  const CREW_BASE = WORKERS.length;
  if (PERSONA === 'miguel') {
    crew.added.forEach(([n, r]) => WORKERS.push([n, r]));
    Object.entries(crew.roles).forEach(([i, r]) => { if (WORKERS[i]) WORKERS[i][1] = r; });
  }
  const saveCrew = (patch) => {
    crew.added = crew.added.concat(patch.added || []);
    crew.left = [...new Set(crew.left.concat(patch.left || []))];
    Object.assign(crew.roles, patch.roles || {});
    if (patch.archive) crew.archived[patch.archive[0]] = patch.archive[1];
    if (patch.unarchive != null) delete crew.archived[patch.unarchive];
    try { sessionStorage.setItem(CREW_KEY, JSON.stringify(crew)); } catch (e) {}
  };
  const EQUIPMENT = [
    ['Excavator &middot; CAT 320', 'EQ&#8209;014'], ['Tower crane &middot; Liebherr 1060', 'EQ&#8209;002'],
    ['Scissor lift &middot; Genie GS&#8209;1932', 'EQ&#8209;021'], ['Welding set &middot; Lincoln 210', 'EQ&#8209;033'],
    ['Concrete mixer &middot; CM&#8209;500', 'EQ&#8209;009 &middot; built 1991'], ['Plate compactor &middot; CP&#8209;120', 'EQ&#8209;041'],
    ['Dump truck &middot; Volvo A25', 'EQ&#8209;017'], ['Backhoe loader &middot; JCB 3CX', 'EQ&#8209;006'],
    ['Generator &middot; Atlas Copco QAS60', 'EQ&#8209;028'], ['Light tower &middot; Allmand Maxi&#8209;Lite', 'EQ&#8209;035'],
    ['Compressor &middot; Ingersoll Rand 185', 'EQ&#8209;019'], ['Laser level &middot; Leica Rugby 640', 'EQ&#8209;044'],
  ];
  // the products a company supplies, one per row in Products (none for this demo company)
  // Beatriz's products (the same ones as on her company page and product sheets)
  const PRODUCTS = PERSONA === 'beatriz' ? [
    ['Roasted coffee beans', 'VH&#8209;COF&#8209;201'], ['Green coffee beans', 'VH&#8209;COF&#8209;110'], ['Cocoa butter', 'VH&#8209;COC&#8209;410'],
    ['Dark chocolate couverture, 70%', 'VH&#8209;COC&#8209;702'], ['Crude palm oil', 'VH&#8209;PLM&#8209;100'], ['Refined soybean oil', 'VH&#8209;SOY&#8209;220'],
    ['Natural rubber sheets (RSS3)', 'VH&#8209;RUB&#8209;300'], ['Sawn tropical hardwood', 'VH&#8209;WOD&#8209;510'], ['Frozen beef cuts', 'VH&#8209;BEF&#8209;020'],
    ['Soy protein concentrate', 'VH&#8209;SOY&#8209;410'],
  ] : [];
  const PRODUCT = PRODUCTS.map(([name, sku]) => ({ name, sku }));

  // each worker's profile (the catalog's Worker profile form): made up but consistent. Two are
  // Brazilian, so the rules ask them for a residence permit (WK-16); everyone else is EU.
  const NONEU = { 9: ['Brazilian', 'BR', 'Residence permit (temporary)', 'AR&#8209;2207&#8209;4419', '12 Mar 2028', 'valid'], 21: ['Brazilian', 'BR', 'Residence permit (temporary)', 'AR&#8209;2305&#8209;1186', '4 Nov 2026', 'expiring'] };
  const SPECIAL_RISK = [2, 11, 13, 4, 19]; // electricians, rigger, plumber on gas lines, crane operators
  const OPERATORS = [4, 19, 3, 7]; // hold an operator certificate for a machine that needs one
  const STREETS = ['Rua de Santa Catarina 214, 4000&#8209;447 Porto', 'Avenida da Boavista 1180, 4100&#8209;113 Porto', 'Rua do Bonjardim 52, 4000&#8209;124 Porto', 'Rua Costa Cabral 731, 4200&#8209;211 Porto', 'Rua de Cedofeita 389, 4050&#8209;181 Porto', 'Avenida Fern&atilde;o de Magalh&atilde;es 1520, 4350&#8209;155 Porto'];
  const SITES = ['Hospital de S&atilde;o Jo&atilde;o, new east wing &middot; ULS S&atilde;o Jo&atilde;o', 'EN13 resurfacing, Vila do Conde &middot; Infraestruturas de Portugal', 'Escola Secund&aacute;ria Garcia de Orta &middot; Parque Escolar'];
  // a Portuguese tax number (NIF) with its real check digit, so it reads like one
  const nif = (i) => { const d = String(2 + (i % 3)) + String(31000000 + i * 271937).slice(-7); const s = [...d].reduce((a, c, k) => a + c * (9 - k), 0) % 11; return d + (s < 2 ? 0 : 11 - s); };
  const PERSON = WORKERS.map(([name, role], i) => {
    const non = NONEU[i];
    return {
      name, role, nationalityName: non ? non[0] : (i === 12 ? 'Spanish' : 'Portuguese'), nationality: non ? non[1] : (i === 12 ? 'ES' : 'PT'),
      birth: `${3 + (i * 7) % 25} ${MONTHS[(i * 5) % 12]} ${1968 + (i * 13) % 34}`,
      address: STREETS[i % STREETS.length].replace(/^(\D+)(\d+)/, (m, s, n) => s + (+n + i * 3)),
      tax: nif(i).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'),
      ss: String(11200000000 + i * 37201543).replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3'),
      employment: i % 6 === 5 ? 'Fixed&#8209;term contract' : 'Permanent contract',
      since: `${1 + (i * 11) % 27} ${MONTHS[(i * 7) % 12]} ${2011 + (i * 3) % 14}`,
      id: non ? ['Passport (Brazil)', 'FX' + (480211 + i * 917), `${12 + i % 15} ${MONTHS[(i * 3) % 12]} 2031`] : i === 12 ? ['DNI (Spain)', '4' + (7130000 + i * 4211) + 'K', `9 ${MONTHS[(i * 3) % 12]} 2030`] : ['Citizen card', String(13000000 + i * 391733).slice(0, 8) + ' 0 ZY' + (i % 9), `${4 + i % 20} ${MONTHS[(i * 7) % 12]} ${2028 + i % 5}`],
      permit: non ? { type: non[2], no: non[3], until: non[4], status: non[5] } : null,
      sites: [[0], [0, 2], [1], [0], [0], [2], [1], [0, 1, 2], [2], [0], [1], [0], [2], [1], [0], [2], [1], [0], [1], [0], [2], [0], [2], [0, 1]][i] || [0],
      // joined from an approved worker list (no documents yet), or no longer on it
      isNew: i >= CREW_BASE, left: crew.left.includes(i) || !!crew.archived[i], archived: crew.archived[i] || '',
      // what the rules read (doc-rules.js FACTS)
      specialRisk: SPECIAL_RISK.includes(i), certifiedOperator: OPERATORS.includes(i), employmentType: i % 6 === 5 ? 'fixed_term' : 'permanent',
    };
  });
  // each machine's profile (the catalog's Equipment profile form)
  const RENTALS = { 2: 'Rented &middot; Loxam, monthly', 9: 'Rented &middot; Kiloutou, by the week' };
  const MACHINE = EQUIPMENT.map(([label, ref], i) => {
    const [type, model] = label.split(' &middot; ');
    const brand = model.split(' ')[0] === 'CM&#8209;500' ? 'Ferreira (in&#8209;house)' : model.split(/ |&#8209;/)[0].replace('Allmand', 'Allmand Bros');
    const operators = i === 1 ? [4, 19] : i === 0 || i === 7 ? [4] : i === 6 ? [19] : [];
    return {
      type, brand, model: model.replace(/^\S+ /, ''), ref: ref.split(' &middot; ')[0],
      serial: `${brand.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, 'X')}${String(4180000 + i * 73219).slice(-6)}&#8209;${2 + (i % 7)}`,
      plate: i === 6 ? 'AA&#8209;19&#8209;TR' : '',
      yearBuilt: [2019, 2016, 2021, 2020, 1991, 2022, 2018, 2017, 2020, 2021, 2019, 2023][i],
      owned: RENTALS[i] || 'Owned', certified: operators.length > 0, operators,
      measuring: i === 11,
      sites: [[0], [0], [2], [0, 1], [0], [1], [1], [0, 2], [2], [1], [0], [2]][i],
      hours: i === 11 ? null : 1240 + i * 913,
    };
  });

  // Each document's state: [status, issued, expires, note, { ref, by, edited }]. A document
  // with no state here is Missing if it is required, Not requested if it is asked for only on a
  // client's request, and Not uploaded if it is optional. Per-record documents carry their own
  // statuses in `records`: index → [status, expires] (missing ones fall back to the default).
  const DEMO = {
    miguel: {
      company: 'Ferreira Constru&ccedil;&otilde;es, Lda.',
      profile: { country: 'PT', sector: 'construction', entityType: 'company', employees: WORKERS.length, services: ['construction_work'], equipmentCount: EQUIPMENT.length, usClients: false },
      line: 'Portugal (EU) &middot; Construction &middot; 24 employees &middot; 12 machines',
      // what ALMA read from the company's own documents, by field name (lower case, a pattern)
      facts: { 'tax number|nipc': '514 228 930', 'registered address|address': 'Rua do Freixo 1071, 4300&#8209;219 Porto', 'activity codes|cae': 'CAE 41200, 42110, 43120',
        'legal representatives|representative': 'Miguel Ferreira (managing partner), Helena Ferreira (manager)', 'social security number|niss': '20005 418 337', 'access code': '4417&#8209;2209&#8209;1180' },
      records: { workers: PERSON, equipment: MACHINE, products: [] },
      state: {
        'CO-01': ['valid', '3 Jan 2026', '3 Jan 2027', '', { ref: '4417&#8209;2209&#8209;1180' }],
        'CO-02': ['valid', '12 Mar 2024', 'No expiry', '', { ref: '514 228 930' }],
        'CO-03': ['expired', '15 Aug 2024', '15 Aug 2026', 'Expired 15 August. Drop the renewed one on me.', { ref: 'Alvar&aacute; 81204&#8209;PUB' }],
        'CO-04': ['na', '', '', 'We don&rsquo;t transport other companies&rsquo; goods.', { naBy: 'Helena Ferreira', naOn: '14 Mar 2026' }],
        'CO-05': ['valid', '12 Dec 2025', '12 Dec 2026'],
        'CO-06': ['valid', '1 Sep 2026', '1 Dec 2026'],
        'CO-07': ['expiring', '20 Jun 2026', '20 Oct 2026', 'Expires tomorrow.'],
        'CO-08': ['valid', '1 Jan 2026', '31 Dec 2026', '', { ref: 'AT 0091&#8209;448210', by: 'Fidelidade' }],
        'CO-10': ['expiring', '3 Nov 2025', '3 Nov 2026', 'Asked for by 2 clients.', { ref: 'RC 77&#8209;104382', by: 'Fidelidade' }],
        'CO-11': ['valid', '14 Apr 2026', '14 Apr 2027', '', { by: 'Allianz Portugal' }],
        'CO-12': ['attention', '2 Oct 2026', '2 Oct 2027', 'I couldn&rsquo;t read the service model. Check the highlighted field.', { edited: true, by: 'Prevenir &ndash; Seguran&ccedil;a no Trabalho, Lda.' }],
        'CO-13': ['valid', '10 Feb 2025', 'No expiry', '', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
        'CO-14': ['valid', '31 Mar 2026', 'Next report, Apr 2027'],
        'CO-15': ['valid', '1 Jul 2026', '1 Jan 2027', 'Asked for by 1 client.'],
        'CO-16': ['valid', '5 May 2026', 'No expiry', '', { by: 'Sika Portugal' }],
        'CO-19': ['valid', '1 Oct 2026', 'No expiry', 'Asked for by 1 client.', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
        'CO-20': ['missing', '', '', 'ULS S&atilde;o Jo&atilde;o asked on 8 Oct: download it, sign it, upload it.'],
        'CO-21': ['valid', '22 May 2025', '22 May 2028', 'ISO 9001.', { by: 'SGS' }],
        'CO-23': ['valid', '2 Feb 2026', 'No expiry', 'Asked for by 1 client.', { by: 'Millennium bcp' }],
        'UN-11': ['valid', '15 Jan 2026', 'Reviewed yearly', 'Asked for by 1 client.', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
        'UN-12': ['valid', '31 Jan 2026', 'Next figures, Jan 2027', '2025 figures. Asked for by 1 client.', { by: 'Ferreira Constru&ccedil;&otilde;es', edited: true }],
        'UN-15': ['missing', '', '', 'Infraestruturas de Portugal asked on 9 Oct.'],
        'WK-01': ['valid', '30 Sep 2026', '31 Oct 2026', 'September &middot; 24 workers covered.', { by: 'Fidelidade' }],
        'WK-02': ['processing', '14 Oct 2026', '30 Nov 2026', 'September &middot; I&rsquo;m reading it now.'],
        'WK-03': ['valid', '15 Feb 2026', 'No expiry', '4 for first aid, 3 for firefighting and evacuation.', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
        'WK-04': ['valid', '20 Jan 2026', 'No expiry', '', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
      },
      perRecord: {
        'WK-11': { def: ['valid', (k) => ['12 Mar 2027', '4 Jun 2027', '20 Jan 2027'][k % 3]], over: { 5: ['expired', '30 Sep 2026'], 14: ['expiring', '2 Nov 2026'] } },
        'WK-12': { def: ['valid', () => '9 Jun 2027'], over: { 2: ['expiring', '9 Nov 2026'], 13: ['expiring', '9 Nov 2026'] } },
        'WK-13': { def: ['valid', () => '1 May 2028'] },
        'WK-14': { have: [0, 16, 7, 23], def: ['valid', () => 'No expiry'] },
        'WK-15': { def: ['valid', () => 'Until replaced'], over: { 22: ['missing'] } },
        'WK-16': { def: ['valid', (k) => PERSON[k].permit.until], over: { 21: ['expiring', '4 Nov 2026'] } },
        'EQ-01': { def: ['valid', () => 'No expiry'] },
        'EQ-02': { def: ['valid', () => 'No expiry'] },
        'EQ-03': { def: ['valid', () => '14 Mar 2027'], over: { 0: ['attention', '20 Oct 2026'] } },
        'EQ-04': { def: ['valid', () => '15 Jan 2027'], over: { 8: ['expiring', '28 Oct 2026'] } },
        'EQ-05': { def: ['valid', () => 'No expiry'] },
        'EQ-06': { def: ['valid', () => '3 Feb 2027'] },
        'EQ-07': { requested: [0, 1, 6, 7], def: ['valid', () => '1 Mar 2027'] },
      },
      archive: [
        ['CO-06', 'Version of 1 Mar 2026', 'Replaced 1 Sep 2026'],
        ['CO-01', 'Version of 3 Jan 2025', 'Replaced 3 Jan 2026'],
        ['WK-02', 'August 2026', 'Replaced 14 Sep 2026'],
        ['WK-01', 'August 2026', 'Replaced 30 Sep 2026'],
        ['EQ-03', 'Tower crane &middot; inspection of Mar 2025', 'Replaced 14 Mar 2026'],
      ],
    },
    // Beatriz's: a US commodity exporter that supplies materials to European roasters and
    // chocolatiers (Company, Products). Her documents are the US ones; her products carry their own.
    beatriz: {
      company: 'Veridian Harvest Co.',
      profile: { country: 'US', sector: 'other', entityType: 'company', employees: 60, services: ['material_supply'], equipmentCount: 0, usClients: true },
      line: 'United States &middot; Agricultural commodities &middot; 60 employees &middot; supplies materials',
      facts: { 'ein|tax number|tin': '71&#8209;4482019', 'address': '400 Poydras St, Suite 1850, New Orleans, LA 70130', 'state|jurisdiction': 'Louisiana',
        'naics|activity codes': 'NAICS 424510, 424590', 'entity type|classification': 'Limited liability company', 'officers|representative': 'Beatriz Nogueira (CEO)' },
      records: { workers: [], equipment: [], products: PRODUCT },
      state: {
        'UN-01': ['valid', '12 Jan 2026', '12 Jan 2027', '', { ref: '34918227K', by: 'Louisiana Secretary of State' }],
        'UN-02': ['valid', '14 Mar 2011', 'No expiry', '', { ref: '34918227K', by: 'Louisiana Secretary of State' }],
        'UN-03': ['valid', '5 Feb 2026', 'No expiry', '', { ref: 'EIN 71&#8209;4482019', by: 'Veridian Harvest Co.' }],
        'UN-05': ['expiring', '1 Nov 2025', '1 Nov 2026', 'The earliest policy ends in 6 days.', { ref: 'ACORD 25 &middot; 2025&#8209;1187', by: 'Marsh McLennan Agency', edited: true }],
        'UN-07': ['valid', '3 Jun 2026', 'No expiry', '', { by: 'Veridian Harvest Co.' }],
        'UN-10': ['valid', '14 Apr 2026', '14 Apr 2027', 'Silver medal, 61/100.', { ref: 'EV&#8209;2026&#8209;77310', by: 'EcoVadis' }],
        'UN-15': ['valid', '28 Mar 2026', 'Next year&rsquo;s, Mar 2027', 'FY 2025, audited. Asked for by 2 clients.', { by: 'Deloitte &amp; Touche LLP' }],
        'UN-18': ['valid', '9 Jan 2026', 'Reviewed yearly', 'Asked for by 1 client.', { by: 'Veridian Harvest Co.' }],
        'UN-19': ['attention', '2 Oct 2026', 'Next report, Oct 2027', 'ALMA could not read the Scope 3 total. Check the highlighted field.', { by: 'Veridian Harvest Co.' }],
        'UN-22': ['valid', '20 Feb 2026', 'Reviewed yearly', 'Asked for by 1 client.', { by: 'Veridian Harvest Co.' }],
        'UN-23': ['missing', '', '', 'A client asked on 2 Oct.'],
      },
      perRecord: {
        'UN-30': { requested: [3, 2, 0], def: ['valid', () => 'Reviewed yearly'], over: { 2: ['expiring', '30 Oct 2026'], 0: ['missing'] } },
      },
      archive: [
        ['UN-05', 'Version of 1 Nov 2024', 'Replaced 1 Nov 2025'],
        ['UN-01', 'Version of 10 Jan 2025', 'Replaced 12 Jan 2026'],
      ],
    },
  };
  // ---- a company added in this session (new-company.html) ---------------------------------------
  // Its documents are the ones it uploaded and accepted in ALMA's guided upload
  // (js/guided-upload.js). In Company it also sees what that setup asks of it and it hasn't
  // uploaded yet (what registering takes, then the optional list), to upload or mark not
  // applicable from here, as the demo companies do.
  // the size it gave (optional: small, medium, large), as the rules read it; no size reads as small.
  // An older company, created with a head count, keeps it.
  const EMP = { small: 10, medium: 100, large: 300, 0: 0, '1-9': 5, '10-49': 25, '50-249': 100, '250+': 300 };
  const SIZE = { small: 'Small company', medium: 'Medium company', large: 'Large company' };
  const profileOf = (o) => {
    const construction = o.sector === 'Construction';
    const n = EMP[o.size || o.people];
    return { country: o.country || 'PT', sector: construction ? 'construction' : 'other', entityType: o.people === '0' ? 'self_employed' : 'company',
      employees: n != null ? n : 10, services: construction ? ['construction_work'] : [], equipmentCount: o.ownEquipment === false ? 0 : 1, usClients: false };
  };
  // the test user (register.html): its company starts empty, like one just added, and is wiped on log out
  const TEST_ORG = (() => {
    try {
      const p = JSON.parse(sessionStorage.getItem('cm-person') || 'null') || {};
      if (!/^test@c-more\.test$/i.test(p.email || '')) return null;
      return { id: 'home', name: 'Your company', country: p.country || 'PT', sector: 'Construction', tax: p.nipc || '', state: 'empty' };
    } catch (e) { return null; }
  })();
  const ORG = (() => {
    try {
      const id = JSON.parse(sessionStorage.getItem('cm-org') || 'null') || JSON.parse(localStorage.getItem('cm-last-org-' + PERSONA) || 'null');
      // the test user's own company (register.html) is a new one too: it has only what it uploads to ALMA
      if ((!id || id === 'home') && TEST_ORG) return TEST_ORG;
      if (!id || id === 'home') return null;
      return (JSON.parse(localStorage.getItem('cm-orgs-' + PERSONA) || '[]') || []).find((o) => o.id === id) || null;
    } catch (e) { return null; }
  })();
  const COUNTRY_NAME = { PT: 'Portugal (EU)', ES: 'Spain (EU)', FR: 'France (EU)', DE: 'Germany (EU)', IT: 'Italy (EU)', NL: 'Netherlands (EU)', BE: 'Belgium (EU)', IE: 'Ireland (EU)', US: 'United States' };
  if (ORG) {
    const guided = (() => { try { return JSON.parse(sessionStorage.getItem('cm-guided-' + ORG.id) || 'null') || {}; } catch (e) { return {}; } })();
    const state = {};
    Object.entries(guided.files || {}).forEach(([code, f]) => { if (f.ok) state[code] = ['valid', f.issued, f.valid, '', { ref: esc(f.ref), by: esc(f.by), edited: !!f.edited, conf: f.conf }]; });
    DEMO.added = {
      company: esc(ORG.name), profile: profileOf(ORG),
      line: [COUNTRY_NAME[ORG.country] || ORG.countryName || ORG.country, ORG.sector === 'Other' ? ORG.sectorOther || 'Other' : ORG.sector, SIZE[ORG.size] || (ORG.people ? ORG.people + ' people' : '')].filter(Boolean).map(esc).join(' &middot; '),
      facts: ORG.tax ? { 'tax number|nipc': esc(ORG.tax) } : {},
      records: { workers: [], equipment: [], products: [] }, state, perRecord: {}, archive: [],
    };
  }
  const D = DEMO[ORG ? 'added' : PERSONA];
  const PROFILE = D.profile;

  // ---- statuses ---------------------------------------------------------------------------------
  // the catalog's document statuses (Statuses sheet), with the badge each wears, plus two that
  // aren't statuses at all: a document nobody has asked for yet, and an optional one not uploaded
  const STATUS = {
    valid: ['Valid', 'b-ok'], expiring: ['Expiring', 'b-pend'], na: ['Not applicable', 'b-neu'], processing: ['Processing', 'b-neu'],
    filemissing: ['File missing', 'b-warn'], attention: ['Needs attention', 'b-warn'],
    missing: ['Missing', 'b-over'], expired: ['Expired', 'b-over'], rejected: ['Rejected', 'b-over'], archived: ['Archived', 'b-neu'],
    notrequested: ['Not requested', 'b-neu'], notuploaded: ['Not uploaded', 'b-neu'],
  };
  const STATUSES = Object.keys(STATUS);
  // how much each status weighs when a roster sums up to one row; above 0 needs someone
  const RANK = { valid: 0, na: 0, archived: 0, notrequested: 0, notuploaded: 0, processing: 1, expiring: 1, filemissing: 1, attention: 1, missing: 2, expired: 2, rejected: 2 };
  const counted = (d) => !['archived', 'notrequested', 'notuploaded'].includes(d.status);
  const worstOf = (list) => list.reduce((acc, s) => (RANK[s] > RANK[acc] ? s : acc), 'valid');

  // ---- the areas --------------------------------------------------------------------------------
  const AREA_META = {
    company: { title: 'Company', sub: 'Who you are, your licences, tax, insurance, policies and certifications.', long: 'Where you&rsquo;ll find everything about the company itself: who you are, your licences, tax, insurance, policies and how you run health &amp; safety.', icon: '<path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>' },
    workers: { title: 'Workers', sub: 'Monthly payroll and social security, and what each worker is cleared for.', long: 'Where you&rsquo;ll find all your worker documentation: the monthly payroll and social security, and what each worker is cleared for.', icon: '<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>' },
    equipment: { title: 'Equipment', sub: 'Every machine: conformity, inspections, maintenance and manuals.', long: 'Where you&rsquo;ll find all your equipment documentation: every machine you bring, its checks and its paperwork.', icon: '<path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17 2.496 24.03m8.924-8.86-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m0 0a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276a4.5 4.5 0 0 1-4.486 6.336l-.144-.004"/>' },
    products: { title: 'Products', sub: 'What you supply: declarations, technical and safety sheets, certifications.', long: 'Where you&rsquo;ll find the documents for each product you supply: declarations, technical and safety sheets, and certifications.', icon: '<path d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>' },
  };
  // which records a per-record level is about, and what to call them
  const LEVEL_OF = { per_worker: 'workers', per_equipment: 'equipment', per_product: 'products' };
  const NOUN = { workers: ['worker', 'workers'], equipment: ['machine', 'machines'], products: ['product', 'products'] };
  const BY_LEVEL = { all_workers: 'For all workers', per_worker: 'For each worker', per_equipment: 'For each machine', per_product: 'For each product' };
  const recordName = (kind, i) => (kind === 'workers' ? WORKERS[i][0] : kind === 'equipment' ? EQUIPMENT[i][0] : PRODUCTS[i][0]);
  const recordSub = (kind, i) => (kind === 'workers' ? WORKERS[i][1] : kind === 'equipment' ? EQUIPMENT[i][1] : PRODUCTS[i][1]);
  const recordTag = (kind, i) => (kind === 'workers' ? WORKERS[i][1] : kind === 'equipment' ? EQUIPMENT[i][0].split(' &middot; ')[0] : null);

  // ---- every document this company is asked for ---------------------------------------------------
  // the issuer the catalog expects, trimmed to its first name for the table
  const issuerOf = (c) => (c.usuallyIssuedBy || '').split(';')[0].trim();
  // a reference number that reads like one, stable for each document
  const refOf = (code, issued) => {
    const n = [...code + PERSONA].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 99991, 7);
    const year = (issued.match(/\d{4}/) || ['2026'])[0];
    return `${year}/${String(n).padStart(5, '0')}`;
  };
  // a document filed again (dropped on ALMA, uploaded from any table, on any page): its new state,
  // kept for this tab, so the Documents page and the company homepage both see it. A worker's or a
  // machine's own copy of a per-record document is kept under '<code>#<record>'.
  const UP_KEY = 'cm-doc-updates' + (ORG ? '-' + ORG.id : '') + (PERSONA === 'beatriz' ? '-beatriz' : '');
  const updates = (() => { try { return JSON.parse(sessionStorage.getItem(UP_KEY) || '{}') || {}; } catch (e) { return {}; } })();
  const keepUpdates = () => { try { sessionStorage.setItem(UP_KEY, JSON.stringify(updates)); } catch (e) {} };
  const companyOptional = (country) => window.CM_COMPANY_DOCS.optional(country);
  const companyMandatory = (country) => window.CM_COMPANY_DOCS.mandatory(country);
  // a new company (ORG) is also asked for what registering it on C-MORE takes (any document in
  // phase 'Registration'); the demo companies never see those
  // Company: what the catalog makes mandatory, the optional list above (whatever its own conditions),
  // and anything else the company has already filed; nothing more
  const OPT = companyOptional(PROFILE.country), optOf = Object.fromEntries(OPT.map((d) => [d.code, d]));
  const filedHere = (code) => D.state[code] && !['missing', 'na'].includes(D.state[code][0]);
  const shown = R.documentsFor(CAT, PROFILE, ORG ? { phases: ['MVP', 'Registration'] } : undefined).filter((x) => !x.doc.countries || x.doc.countries.includes(PROFILE.country))
    .filter(({ doc: c }) => c.category !== 'company' || (!optOf[c.code] && (c.requirement === 'mandatory' || filedHere(c.code))))
    .concat(OPT.map((d) => ({ doc: d, ask: false }))); // in the list's order
  const REGS = new Set(ORG ? companyMandatory(PROFILE.country).map((d) => d.code) : []);
  const DOCS = [];
  shown.forEach(({ doc: c, ask }) => {
    const area = c.category;
    // a company added in this session has no worker or machine records yet: what it uploaded for
    // its workers or machines is one document each, not a roster
    const kind = ORG ? null : LEVEL_OF[c.level];
    const st = D.state[c.code];
    const base = { id: DOCS.length, code: c.code, name: en(c.name), section: en(c.section), area, cat: c, ask,
      requirement: LBL.requirement[c.requirement], req: c.requirement, sharing: LBL.sharing[c.sharing], level: c.level };
    let doc;
    // a company added in this session: in Company, everything its setup asks for, uploaded or not;
    // anywhere else, only what it has uploaded and accepted
    if (ORG && !D.state[c.code] && !(area === 'company' && (REGS.has(c.code) || optOf[c.code]))) return;
    if (kind) {
      // one per worker, machine or product: the rules say which records it covers
      const all = D.records[kind].map((r, i) => Object.assign({ i }, r));
      const subj = R.subjectsFor(c, all, PROFILE);
      let covers = subj.filter((r) => !r.left).map((r) => r.i);
      // an archived worker's, kept read-only (not asked for, not counted)
      let held = subj.filter((r) => r.archived).map((r) => r.i);
      const pr = D.perRecord[c.code] || {};
      if (c.requirement === 'on_request') { covers = covers.filter((i) => (pr.requested || []).includes(i)); held = held.filter((i) => (pr.requested || []).includes(i)); }
      if (c.requirement === 'optional') { covers = covers.filter((i) => (pr.have || []).includes(i)); held = held.filter((i) => (pr.have || []).includes(i)); }
      const upOf = (i) => updates[`${c.code}#${i}`];
      const statusOf = (i) => { if (upOf(i)) return upOf(i).status; if (all[i] && all[i].isNew) return 'missing'; const o = (pr.over || {})[i]; if (o) return o[0]; return pr.def ? pr.def[0] : 'missing'; };
      const expOf = (i) => { if (upOf(i)) return upOf(i).exp; if (all[i] && all[i].isNew) return '—'; const o = (pr.over || {})[i]; if (o) return o[1] || '—'; return pr.def ? pr.def[1](i) : '—'; };
      const roster = covers.map((i) => ({ i, status: statusOf(i), exp: expOf(i) }));
      const status = roster.length ? worstOf(roster.map((r) => r.status))
        : c.requirement === 'on_request' ? 'notrequested' : c.requirement === 'optional' ? 'notuploaded' : 'na';
      const note = !roster.length && status === 'na' ? `None of your ${NOUN[kind][1]} need it.` : '';
      const kept = held.map((i) => ({ i, status: statusOf(i), exp: expOf(i) }));
      doc = Object.assign(base, { kind, roster, kept, status, issued: '—', valid: '—', note, ref: '', by: issuerOf(c), edited: false });
    } else {
      const status = st ? st[0] : c.requirement === 'on_request' ? 'notrequested' : c.requirement === 'optional' ? 'notuploaded' : 'missing';
      const extra = (st && st[4]) || {};
      const issued = (st && st[1]) || '—';
      const has = !['missing', 'na', 'notrequested', 'notuploaded'].includes(status);
      doc = Object.assign(base, { kind: null, roster: null, status, issued, valid: (st && st[2]) || '—', note: (st && st[3]) || '', naBy: extra.naBy || '', naOn: extra.naOn || '',
        ref: has ? (extra.ref || refOf(c.code, issued)) : '', by: has ? (extra.by || issuerOf(c)) : '', edited: !!extra.edited });
      if (extra.conf != null) doc.conf = extra.conf;
    }
    // the group a document sits in: its catalog section for the company's own documents, who it
    // covers everywhere else — unless nobody has asked for it yet, or it is optional (the company's
    // optional ones keep their section from the list, next to the required ones of that section)
    doc.group = doc.status === 'notrequested' ? 'On client request' : area === 'company' ? doc.section
      : c.requirement === 'optional' ? 'Optional' : BY_LEVEL[c.level] || doc.section;
    DOCS.push(doc);
  });
  // replaced versions, kept read-only for audit
  D.archive.forEach(([code, version, replaced]) => {
    const c = byCode[code]; if (!c) return;
    DOCS.push({ id: DOCS.length, code: '', archivedCode: code, name: en(c.name), section: 'Archived', area: c.category, cat: c, requirement: '', req: '', level: c.level, sharing: LBL.sharing[c.sharing], status: 'archived',
      issued: version.replace(/^Version of /, ''), valid: replaced, note: '', ref: '', by: issuerOf(c), edited: false, group: 'Archived', kind: null, roster: null });
  });
  // only the Documents pages the person looking can open (js/access.js): the rest aren't counted,
  // searched or shown on the company homepage either
  // what the viewer's groups give them: whole Documents pages, or some of their sections (js/access.js)
  if (window.CMAccess) for (let i = DOCS.length - 1; i >= 0; i--) {
    const page = 'documents.' + DOCS[i].area;
    const section = DOCS[i].cat && DOCS[i].cat.section ? en(DOCS[i].cat.section) : DOCS[i].section; // an archived one, by the section it was in
    if (!CMAccess.can(page) || (CMAccess.sees && !CMAccess.sees(page, section))) DOCS.splice(i, 1);
  }
  // the areas this company has: open by its profile, with at least one document in them
  // (a company added in this session keeps Company, Workers and Equipment even while they're empty)
  // (and only the ones the person looking can open: js/access.js)
  const AREAS = Object.keys(AREA_META).filter((k) => (ORG && (k === 'company' || k === 'workers' || (k === 'equipment' && PROFILE.equipmentCount > 0))) || !ORG && R.AREA_OPEN[k](PROFILE) && DOCS.some((d) => d.area === k && d.status !== 'archived'))
    .filter((k) => !window.CMAccess || CMAccess.can('documents.' + k))
    .map((k) => Object.assign({ key: k }, AREA_META[k]));
  const AREA_TITLE = Object.fromEntries(AREAS.map((a) => [a.key, a.title]));
  DOCS.forEach((d) => { d.groupLabel = `${AREA_TITLE[d.area] || ''} &middot; ${d.group}`; });
  // the groups of each area, in the catalog's order, then On client request, Optional, Archived
  const TAIL = ['On client request', 'Optional', 'Archived'];
  const GROUPS_OF = (key) => [...new Set(DOCS.filter((d) => d.area === key).map((d) => d.group))]
    .sort((a, b) => TAIL.indexOf(a) - TAIL.indexOf(b));

  const isOk = (d) => d.status === 'valid' || d.status === 'na';
  const isPend = (d) => ['expiring', 'filemissing', 'attention', 'processing'].includes(d.status);
  const isBad = (d) => ['missing', 'expired', 'rejected'].includes(d.status);

  const fold = (t) => t.replace(/<[^>]+>/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const textOf = (d) => fold(`${d.code} ${d.name} ${d.group} ${d.requirement} ${d.note} ${d.ref} ${d.by}`);
  // ---- Not applicable ---------------------------------------------------------------------------
  // Only a 'Mandatory if applicable' document can be marked Not applicable, always with a reason
  // the company's clients will see; it then counts as compliant, and it can be undone (back to
  // what it was). Prototype: marks are kept for this tab (sessionStorage), on top of the demo's.
  const NA_KEY = 'cm-na' + (ORG ? '-' + ORG.id : '') + (PERSONA === 'beatriz' ? '-beatriz' : '');
  const naMarks = (() => { try { return JSON.parse(sessionStorage.getItem(NA_KEY) || '{}') || {}; } catch (e) { return {}; } })();
  const saveNa = () => { try { sessionStorage.setItem(NA_KEY, JSON.stringify(naMarks)); } catch (e) {} };
  const me = (() => { try { return (JSON.parse(sessionStorage.getItem('cm-person') || 'null') || {}).name || 'You'; } catch (e) { return 'You'; } })();
  const today = () => { const n = new Date(); return `${n.getDate()} ${MONTHS[n.getMonth()]} ${n.getFullYear()}`; };
  // suggested reasons, from the condition behind each document's 'Applies when'
  const NA_REASONS = {
    has_employees: ['We have no employees with an employment contract', 'Everyone working with us is self-employed or a partner'],
    self_employed: ['We are a company, not a self-employed person working alone'],
    foreign_posting: ['We are not a foreign company posting workers to Portugal'],
    construction_work: ['We don&rsquo;t carry out construction work'],
    own_equipment: ['We don&rsquo;t bring our own equipment to sites', 'All the equipment we use is the client&rsquo;s'],
    non_us_for_us_clients: ['We have no clients in the United States'],
    transports_goods: ['We don&rsquo;t transport other companies&rsquo; goods', 'Our vehicles are all under 2,500 kg'],
    produces_waste: ['We don&rsquo;t produce or transport waste ourselves', 'A licensed operator collects all our waste'],
    env_liability: ['Our activity isn&rsquo;t covered by the environmental liability regime'],
    special_risk_work: ['We don&rsquo;t carry out special-risk work'],
    hazardous_chemicals: ['We don&rsquo;t use hazardous chemical products'],
    processes_personal_data: ['We don&rsquo;t process personal data on our clients&rsquo; behalf', 'We only see our clients&rsquo; business contacts'],
    handles_client_data: ['We don&rsquo;t handle our clients&rsquo; data'],
    imports_cbam: ['We don&rsquo;t import CBAM goods into the EU', 'We buy steel, cement and aluminium from EU suppliers only'],
  };
  // an optional document: it has nothing to do with the company, or the company just doesn't have one
  const NA_OPTIONAL = ['It isn&rsquo;t related to our company or what we do', 'We don&rsquo;t have this document'];
  const reasonsFor = (d) => (d.req === 'optional' ? NA_OPTIONAL : NA_REASONS[d.cat.condition] || ['This doesn&rsquo;t apply to our activity']);
  const canNa = (d) => !d.kind && ['if_applicable', 'optional'].includes(d.req) && d.status !== 'archived';
  // not applicable, undone: back to Missing (Not uploaded, for an optional one)
  const unset = (d) => (d.req === 'optional' ? 'notuploaded' : 'missing');
  DOCS.forEach((d) => {
    d.orig = { status: d.status, note: d.note, naBy: d.naBy, naOn: d.naOn };
    const m = naMarks[d.code];
    if (!m || !canNa(d)) return;
    if (m.undone) Object.assign(d, { status: d.orig.status === 'na' ? unset(d) : d.orig.status, note: d.orig.status === 'na' ? '' : d.orig.note, naBy: '', naOn: '' });
    else Object.assign(d, { status: 'na', note: m.reason, naBy: m.by, naOn: m.on });
  });
  const markNa = (d, reason) => {
    naMarks[d.code] = { reason, by: me, on: today() }; saveNa();
    Object.assign(d, { status: 'na', note: reason, naBy: me, naOn: today() }); d.text = textOf(d);
  };
  const undoNa = (d) => {
    // back to what it was before it was marked: Missing, unless a file was there all along
    const back = d.orig.status === 'na' ? unset(d) : d.orig.status;
    naMarks[d.code] = d.orig.status === 'na' ? { undone: true } : undefined; if (!naMarks[d.code]) delete naMarks[d.code]; saveNa();
    Object.assign(d, { status: back, note: d.orig.status === 'na' ? '' : d.orig.note, naBy: '', naOn: '' }); d.text = textOf(d);
  };
  DOCS.forEach((d) => { d.issued0 = d.issued; d.name0 = d.name; if (!d.kind && updates[d.code]) Object.assign(d, updates[d.code]); else if (d.kind && updates[d.code] && updates[d.code].name) d.name = updates[d.code].name; });
  // a document's name, as the company calls it: every copy of it (a per-worker one too) takes it; an
  // empty one, or the catalog's, puts the catalog's name back
  const rename = (code, name) => {
    const ds = DOCS.filter((x) => x.code === code); if (!code || !ds.length) return null;
    const n = String(name || '').trim(), orig = ds[0].name0, u = updates[code] = updates[code] || {};
    if (!n || n === orig) delete u.name; else u.name = n;
    if (!Object.keys(u).length) delete updates[code];
    keepUpdates();
    ds.forEach((x) => { x.name = u.name || orig; x.text = textOf(x); });
    return ds[0];
  };

  // ---- versions ----------------------------------------------------------------------------------------
  // Every document keeps the versions it replaced. A monthly one has last month's, and the month
  // before; a yearly one last year's; one renewed on change, the one before the change. Prototype:
  // made up from each document's renewal rule and its first issue date, the same every time; one
  // replaced in this tab goes on top of them.
  const V = window.CM_VERSIONS;
  const NO_FILE = ['missing', 'na', 'notrequested', 'notuploaded', 'filemissing'];
  const vhash = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100003, 11);
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // the earlier ones, newest first: { label, issued, valid, uploaded, replaced, by, ref, conf }
  const versionsOf = (d) => {
    if (d.kind || NO_FILE.includes(d.status) || d.status === 'archived') return [];
    const kept = (d.prev || []).map((v) => Object.assign({ label: `Version of ${v.issued}` }, v));
    // a company added in this session has only what it uploaded here
    const first = V.parse(d.issued0); if (ORG || !first) return kept;
    const r = (d.cat.renewal || '').toLowerCase(), h = vhash(d.code);
    const monthly = /month/.test(r) && !/6/.test(r);
    const step = monthly ? 1 : /6|six/.test(r) ? 6 : /3 years/.test(r) ? 36 : /1.2 years/.test(r) ? 18 : /change|revision|amend|plan|client|entry|delivery|transport|assembly|posting|product/.test(r) || !r ? 0 : 12;
    const n = monthly ? 4 : step ? 2 + (h % 2) : 1;
    const gap = step || 14 + (h % 18);
    const who = monthly ? ['Ana Rocha, accountant', 'Ana Rocha, accountant', 'Miguel Ferreira'] : ['Miguel Ferreira', 'Helena Ferreira'];
    const out = [];
    let replacedOn = first;
    for (let k = 1; k <= n; k++) {
      const issued = V.addM(first, -gap * k);
      const expires = d.valid === 'No expiry' ? 'No expiry' : monthly ? V.fmt(V.addM(issued, 1)) : V.fmt(V.addM(issued, step || 12));
      out.push({
        label: monthly ? `${MONTH_NAMES[issued.getMonth()]} ${issued.getFullYear()}` : `Version of ${V.fmt(issued)}`,
        issued: V.fmt(issued), valid: expires, uploaded: V.fmt(issued), replaced: V.fmt(replacedOn), by: who[k % who.length],
        ref: d.ref ? refOf(d.code + k, String(issued.getFullYear())) : '', conf: 86 + (vhash(d.code + k) % 13),
      });
      replacedOn = issued;
    }
    return kept.concat(out);
  };
  // all of them, the current one first (when there's a file)
  const allVersionsOf = (d) => {
    const earlier = versionsOf(d);
    if (d.kind || NO_FILE.includes(d.status) || d.status === 'archived' || !V.parse(d.issued)) return earlier;
    return [{ current: true, label: 'Current', issued: d.issued, valid: d.valid, uploaded: d.uploaded || d.issued, ref: d.ref, by: d.by, status: d.status }].concat(earlier);
  };
  // what a client sees of a document, given when its consents stood (CM_VERSIONS.seen)
  const seenBy = (d, periods) => V.seen(allVersionsOf(d), periods);

  const saveDoc = (code, patch) => {
    const d = DOCS.find((x) => x.code === code && !x.kind); if (!d) return null;
    // a new file for one that had one: the one it replaces joins its versions
    // a correction (fix): the same file, its values put right, so no new version
    const fix = patch.fix; if (fix) { patch = Object.assign({}, patch); delete patch.fix; }
    if (patch.issued && !fix) {
      patch = Object.assign({}, patch, { uploaded: today() });
      if (!NO_FILE.includes(d.status) && V.parse(d.issued)) {
        patch.prev = [{ issued: d.issued, valid: d.valid, uploaded: d.uploaded || d.issued, replaced: today(), by: me, ref: d.ref, conf: d.conf != null ? d.conf : 92 }].concat(d.prev || []);
      }
    }
    updates[code] = Object.assign(updates[code] || {}, patch);
    keepUpdates();
    Object.assign(d, patch); d.text = textOf(d);
    return d;
  };
  // one worker's or machine's copy of a per-record document: { status, exp }; the document's own
  // status follows its roster, as when the page is drawn
  const saveRecord = (code, i, patch) => {
    const d = DOCS.find((x) => x.code === code && x.kind); if (!d) return null;
    const r = d.roster.find((x) => x.i === i); if (!r) return null;
    updates[`${code}#${i}`] = Object.assign(updates[`${code}#${i}`] || {}, patch);
    keepUpdates();
    Object.assign(r, patch);
    d.status = worstOf(d.roster.map((x) => x.status)); d.text = textOf(d);
    return d;
  };
  // the documents that need the company now, most urgent first
  const URGENCY = ['expired', 'rejected', 'missing', 'attention', 'filemissing', 'expiring', 'processing'];
  // a document expiring within two weeks comes straight after the expired ones
  const soon = (d) => { if (d.status !== 'expiring' || d.kind) return false; const t = Date.parse(d.valid); return !Number.isNaN(t) && t - Date.now() < 14 * 864e5; };
  const rank = (d) => (soon(d) ? 1.5 : URGENCY.indexOf(d.status));
  const needing = () => DOCS.filter((d) => counted(d) && RANK[d.status] > 0).sort((a, b) => rank(a) - rank(b));
  const DATA = DOCS.map((d) => Object.assign(d, { text: textOf(d) }));

  // an expiry as a table shows it: the date on its line, what it's about under it ("Next report",
  // "Next figures"); a value with no date ("Reviewed yearly", "No expiry") as a quiet note. Never cut
  // or broken mid-date (css/esg.css .cm-exp)
  const expHtml = (v) => {
    const t = String(v == null ? '' : v).trim();
    if (!t || t === '—') return '<span class="cm-exp is-none">&mdash;</span>';
    const m = /^(.*?),\s*((?:\d{1,2}\s+)?[A-Z][a-z]{2,8}\.?\s+\d{4})$/.exec(t);
    if (m) return `<span class="cm-exp"><b>${esc(m[2])}</b><small>${esc(m[1])}</small></span>`;
    if (/\d{4}/.test(t)) return `<span class="cm-exp"><b>${esc(t)}</b></span>`;
    return `<span class="cm-exp is-note">${esc(t)}</span>`;
  };
  return { rename, versionsOf, allVersionsOf, seenBy, expHtml, ORG, profileOf, companyOptional, saveDoc, saveRecord, saveCrew, crew, needing, URGENCY, CAT, R, LBL, en, esc, byCode, MONTHS, PERSONA, WORKERS, EQUIPMENT, PRODUCTS, NONEU, SPECIAL_RISK, OPERATORS, STREETS, SITES, nif, PERSON, RENTALS, MACHINE, DEMO, D, PROFILE, STATUS, STATUSES, RANK, counted, worstOf, AREA_META, LEVEL_OF, NOUN, BY_LEVEL, recordName, recordSub, recordTag, issuerOf, refOf, shown, DOCS, AREAS, AREA_TITLE, TAIL, GROUPS_OF, isOk, isPend, isBad, fold, textOf, NA_KEY, naMarks, saveNa, me, corrected: () => `Corrected by ${me === "You" ? "you" : esc(me)}`, today, NA_REASONS, reasonsFor, canNa, markNa, undoNa, DATA };
})();
