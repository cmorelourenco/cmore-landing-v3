/* Documents: every document a contractor keeps on C-MORE, from the Document Catalog (MVP) in
   js/doc-catalog.js. Four areas: Company, Workers, Equipment and Sites. Inside each, the documents
   are grouped by the catalog's sections, Optional ones in their own group (REQ-06) and replaced
   versions under Archived (REQ-49). Documents kept per worker or per machine open their own roster;
   Workers and Equipment also show everyone at once, one row per person or machine. Statuses are the
   catalog's own. The demo states below are Miguel's (Ferreira Construction); the catalog is not. */
(() => {
  const CATALOG = (window.DOC_CATALOG && DOC_CATALOG.docs) || [];
  const byCode = Object.fromEntries(CATALOG.map((c) => [c.code, c]));
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
  const EQUIPMENT = [
    ['Excavator &mdash; CAT 320', 'EQ&#8209;014'], ['Tower crane &mdash; Liebherr 1060', 'EQ&#8209;002'],
    ['Scissor lift &mdash; Genie GS&#8209;1932', 'EQ&#8209;021'], ['Welding set &mdash; Lincoln 210', 'EQ&#8209;033'],
    ['Concrete mixer &mdash; CM&#8209;500', 'EQ&#8209;009 &middot; built 1991'], ['Plate compactor &mdash; CP&#8209;120', 'EQ&#8209;041'],
    ['Dump truck &mdash; Volvo A25', 'EQ&#8209;017'], ['Backhoe loader &mdash; JCB 3CX', 'EQ&#8209;006'],
    ['Generator &mdash; Atlas Copco QAS60', 'EQ&#8209;028'], ['Light tower &mdash; Allmand Maxi&#8209;Lite', 'EQ&#8209;035'],
    ['Compressor &mdash; Ingersoll Rand 185', 'EQ&#8209;019'], ['Laser level &mdash; Leica Rugby 640', 'EQ&#8209;044'],
  ];
  // each worker's record (WK-10): made up but consistent, the way the catalog's fields ask for it.
  // Two are Brazilian, so they carry a residence permit (WK-16); everyone else is an EU citizen.
  const NONEU = { 9: ['Brazilian', 'Residence permit (temporary)', 'AR&#8209;2207&#8209;4419', '12 Mar 2028', 'valid'], 21: ['Brazilian', 'Residence permit (temporary)', 'AR&#8209;2305&#8209;1186', '4 Nov 2026', 'expiring'] };
  const STREETS = ['Rua de Santa Catarina 214, 4000&#8209;447 Porto', 'Avenida da Boavista 1180, 4100&#8209;113 Porto', 'Rua do Bonjardim 52, 4000&#8209;124 Porto', 'Rua Costa Cabral 731, 4200&#8209;211 Porto', 'Rua de Cedofeita 389, 4050&#8209;181 Porto', 'Avenida Fern&atilde;o de Magalh&atilde;es 1520, 4350&#8209;155 Porto'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  // a Portuguese tax number (NIF) with its real check digit, so it reads like one
  const nif = (i) => { const d = String(2 + (i % 3)) + String(31000000 + i * 271937).slice(-7); const s = [...d].reduce((a, c, k) => a + c * (9 - k), 0) % 11; return d + (s < 2 ? 0 : 11 - s); };
  const PERSON = WORKERS.map(([name, role], i) => {
    const non = NONEU[i];
    return {
      name, role, nationality: non ? non[0] : (i === 12 ? 'Spanish' : 'Portuguese'),
      birth: `${3 + (i * 7) % 25} ${MONTHS[(i * 5) % 12]} ${1968 + (i * 13) % 34}`,
      address: STREETS[i % STREETS.length].replace(/^(\D+)(\d+)/, (m, s, n) => s + (+n + i * 3)),
      tax: nif(i).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'),
      ss: String(11200000000 + i * 37201543).replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3'),
      employment: i % 6 === 5 ? 'Fixed&#8209;term contract' : 'Permanent contract',
      since: `${1 + (i * 11) % 27} ${MONTHS[(i * 7) % 12]} ${2011 + (i * 3) % 14}`,
      id: non ? ['Passport (Brazil)', 'FX' + (480211 + i * 917), `${12 + i % 15} ${MONTHS[(i * 3) % 12]} 2031`] : i === 12 ? ['DNI (Spain)', '4' + (7130000 + i * 4211) + 'K', `9 ${MONTHS[(i * 3) % 12]} 2030`] : ['Citizen card', String(13000000 + i * 391733).slice(0, 8) + ' 0 ZY' + (i % 9), `${4 + i % 20} ${MONTHS[(i * 7) % 12]} ${2028 + i % 5}`],
      permit: non ? { type: non[1], no: non[2], until: non[3], status: non[4] } : null,
      sites: [[0], [0, 2], [1], [0], [0], [2], [1], [0, 1, 2], [2], [0], [1], [0], [2], [1], [0], [2], [1], [0], [1], [0], [2], [0], [2], [0, 1]][i],
    };
  });
  // the sites Ferreira works on (its projects on the company page): site documents exist per site
  const SITES = ['East wing extension &middot; Brandywine Regional Hospital', 'Route 9 resurfacing, phase 2 &middot; State of Delaware', 'Elm Street Elementary renovation &middot; Wilmington Public Schools'];
  const ALL = (list) => list.map((_, i) => i);
  const except = (list, out) => ALL(list).filter((i) => !out.includes(i));

  // the statuses of the catalog's Statuses sheet, with the badge each one wears
  const STATUS = {
    valid: ['Valid', 'b-ok'], expiring: ['Expiring', 'b-pend'], na: ['Not applicable', 'b-neu'], processing: ['Processing', 'b-neu'],
    filemissing: ['File missing', 'b-warn'], attention: ['Needs attention', 'b-warn'],
    missing: ['Missing', 'b-over'], expired: ['Expired', 'b-over'], rejected: ['Rejected', 'b-over'], archived: ['Archived', 'b-neu'],
  };
  const STATUSES = Object.keys(STATUS);
  // how much each status weighs when a roster sums up to one row; above 0 needs someone
  const RANK = { valid: 0, na: 0, archived: 0, processing: 1, expiring: 1, filemissing: 1, attention: 1, missing: 2, expired: 2, rejected: 2 };

  // Miguel's documents: status, issued, expires (or the catalog's rule), and a note
  const STATE = {
    'CO-01': ['valid', '3 Jan 2026', '3 Jan 2027'],
    'CO-02': ['valid', '12 Mar 2024', 'No expiry'],
    'CO-03': ['expired', '15 Aug 2024', '15 Aug 2026', 'Expired 15 August &mdash; drop the renewed one on ALMA.'],
    'CO-04': ['na', '', '', 'We don&rsquo;t transport other companies&rsquo; goods.'],
    'CO-05': ['valid', '12 Dec 2025', '12 Dec 2026'],
    'CO-06': ['valid', '1 Sep 2026', '1 Dec 2026'],
    'CO-07': ['expiring', '20 Jun 2026', '20 Oct 2026', 'Expires in 5 days.'],
    'CO-08': ['valid', '1 Jan 2026', '31 Dec 2026'],
    'CO-09': ['na', '', '', 'No self&#8209;employed workers on our sites.'],
    'CO-10': ['expiring', '3 Nov 2025', '3 Nov 2026', 'Asked for by 2 clients.'],
    'CO-11': ['valid', '14 Apr 2026', '14 Apr 2027'],
    'CO-12': ['attention', '2 Oct 2026', '2 Oct 2027', 'ALMA could not read the service model &mdash; check the highlighted field.'],
    'CO-13': ['valid', '10 Feb 2025', 'No expiry'],
    'CO-14': ['valid', '31 Mar 2026', 'Next report, Apr 2027'],
    'CO-15': ['valid', '1 Jul 2026', '1 Jan 2027'],
    'CO-16': ['valid', '5 May 2026', 'No expiry'],
    'CO-17': ['filemissing', '', 'No expiry', 'Data typed in; the file is still to come.'],
    'CO-18': ['na', '', '', 'No workers posted from abroad.'],
    'CO-19': ['valid', '1 Oct 2026', 'No expiry'],
    'CO-20': ['missing', '', 'Until a new version', 'Brandywine Regional Hospital asked on 8 Oct: download it, sign it, upload it.'],
    'CO-21': ['valid', '22 May 2025', '22 May 2028', 'ISO 9001.'],
    'WK-01': ['valid', '30 Sep 2026', '31 Oct 2026', 'September &middot; 24 workers covered.'],
    'WK-02': ['processing', '14 Oct 2026', '30 Nov 2026', 'September &middot; ALMA is reading it.'],
    'WK-03': ['valid', '15 Feb 2026', 'No expiry', '4 for first aid, 3 for firefighting and evacuation.'],
    'WK-04': ['valid', '20 Jan 2026', 'No expiry'],
    'WK-10': ['valid', '', 'No expiry'],
    'WK-11': ['valid', '', 'Next exam date'],
    'WK-12': ['valid', '', 'Per certificate'],
    'WK-13': ['valid', '', 'Per certificate'],
    'WK-14': ['valid', '', 'Per certificate'],
    'WK-15': ['valid', '', 'No expiry'],
    'WK-16': ['valid', '', 'Per permit'],
    'WK-17': ['na', '', '', 'No posted workers.'],
    'EQ-00': ['valid', '', 'No expiry'], 'EQ-01': ['valid', '', 'No expiry'], 'EQ-02': ['valid', '', 'No expiry'],
    'EQ-03': ['valid', '', 'Next inspection'], 'EQ-04': ['valid', '', 'Next maintenance'], 'EQ-05': ['valid', '', 'No expiry'],
    'EQ-06': ['valid', '', 'Per certificate'], 'EQ-07': ['valid', '', 'Per policy'],
  };
  // per site: [code, status, issued, expires, note]
  const SITE_STATE = [
    [['ST-01', 'valid', '2 Mar 2026', '18 Dec 2026'], ['ST-02', 'valid', '2 Mar 2026', '18 Dec 2026'], ['ST-03', 'valid', '4 Mar 2026', 'No expiry'],
     ['ST-04', 'valid', '9 Mar 2026', 'No expiry', 'Recorded by the hospital for 42 workers.'], ['ST-07', 'attention', '12 Oct 2026', 'Next inspection', 'Tower crane after assembly &mdash; awaiting the inspector&rsquo;s sign&#8209;off.']],
    [['ST-01', 'valid', '15 Jan 2026', 'Ongoing'], ['ST-02', 'valid', '15 Jan 2026', '30 Jun 2027'], ['ST-03', 'valid', '20 Jan 2026', 'No expiry'],
     ['ST-04', 'valid', '22 Jan 2026', 'No expiry'], ['ST-07', 'na', '', '', 'Nothing is assembled on this site.']],
    [['ST-01', 'valid', '1 Sep 2025', '31 Oct 2026'], ['ST-02', 'expiring', '1 Sep 2025', '31 Oct 2026', 'The planned end is in 16 days.'], ['ST-03', 'valid', '3 Sep 2025', 'No expiry'],
     ['ST-04', 'missing', '', 'No expiry', '2 workers have no induction recorded by the school district.'], ['ST-07', 'na', '', '', 'Nothing is assembled on this site.']],
  ];
  // documents kept per worker or per machine: who is behind each, how each reads, and when it expires
  const ROSTERS = {
    'WK-10': { list: WORKERS, pick: ALL(WORKERS), status: () => 'valid' },
    'WK-11': { list: WORKERS, pick: ALL(WORKERS), status: (k) => (k === 5 ? 'expired' : k === 14 ? 'expiring' : 'valid'), exp: (k) => (k === 5 ? '30 Sep 2026' : k === 14 ? '2 Nov 2026' : ['12 Mar 2027', '4 Jun 2027', '20 Jan 2027'][k % 3]) },
    'WK-12': { list: WORKERS, pick: [2, 11, 13, 4, 19], status: (k) => (k === 0 || k === 2 ? 'expiring' : 'valid'), exp: (k) => (k === 0 || k === 2 ? '9 Nov 2026' : '9 Jun 2027') },
    'WK-13': { list: WORKERS, pick: [4, 19, 3, 7], status: () => 'valid', exp: () => '1 May 2028' },
    'WK-14': { list: WORKERS, pick: [0, 16, 7, 23], status: () => 'valid', exp: () => '15 Feb 2028' },
    'WK-15': { list: WORKERS, pick: ALL(WORKERS), status: (k) => (k === 22 ? 'missing' : 'valid') },
    'WK-16': { list: WORKERS, pick: [9, 21], status: (k) => PERSON[[9, 21][k]].permit.status, exp: (k) => PERSON[[9, 21][k]].permit.until },
    'EQ-00': { list: EQUIPMENT, pick: ALL(EQUIPMENT), status: () => 'valid' },
    'EQ-01': { list: EQUIPMENT, pick: except(EQUIPMENT, [4]), status: () => 'valid' },
    'EQ-02': { list: EQUIPMENT, pick: [4], status: () => 'valid' },
    'EQ-03': { list: EQUIPMENT, pick: [1, 2, 0, 7, 6, 10], status: (k) => (k === 0 ? 'attention' : 'valid'), exp: (k) => (k === 0 ? '20 Oct 2026' : '14 Mar 2027') },
    'EQ-04': { list: EQUIPMENT, pick: ALL(EQUIPMENT), status: (k) => (k === 8 ? 'expiring' : 'valid'), exp: (k) => (k === 8 ? '28 Oct 2026' : '15 Jan 2027') },
    'EQ-05': { list: EQUIPMENT, pick: except(EQUIPMENT, [11]), status: () => 'valid' },
    'EQ-06': { list: EQUIPMENT, pick: [11], status: () => 'valid', exp: () => '3 Feb 2027' },
    'EQ-07': { list: EQUIPMENT, pick: [0, 1, 6, 7], status: () => 'valid', exp: () => '1 Mar 2027' },
  };
  // replaced versions, kept read-only for audit (REQ-49): [area, name, version, replaced]
  const ARCHIVE = [
    ['company', 'Tax clearance certificate (AT)', 'Version of 1 Mar 2026', 'Replaced 1 Sep 2026'],
    ['company', 'Commercial registry certificate', 'Version of 3 Jan 2025', 'Replaced 3 Jan 2026'],
    ['workers', 'Social security monthly declaration + payment proof', 'August 2026', 'Replaced 14 Sep 2026'],
    ['workers', 'Workers&rsquo; compensation insurance payroll + receipt', 'August 2026', 'Replaced 30 Sep 2026'],
    ['equipment', 'Periodic safety inspection report &middot; Tower crane', 'Inspection of Mar 2025', 'Replaced 14 Mar 2026'],
  ];

  const AREA_OF = { Company: 'company', Workers: 'workers', Equipment: 'equipment', Site: 'sites' };
  const AREAS = [
    { key: 'company', title: 'Company', sub: 'Who you are, your licences, tax, insurance and how you run health &amp; safety.', icon: '<path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>' },
    { key: 'workers', title: 'Workers', sub: 'Monthly payroll and social security, and what each worker is cleared for.', icon: '<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>' },
    { key: 'equipment', title: 'Equipment', sub: 'Every machine: conformity, inspections, maintenance and manuals.', icon: '<path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17 2.496 24.03m8.924-8.86-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m0 0a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276a4.5 4.5 0 0 1-4.486 6.336l-.144-.004"/>' },
    { key: 'sites', title: 'Sites', sub: 'What each site you work on asks of you: contract, schedule, induction.', icon: '<path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/>' },
  ];
  const AREA_TITLE = Object.fromEntries(AREAS.map((a) => [a.key, a.title]));

  // one row per document: the catalog's facts, Miguel's state on top. Optional types go to an
  // Optional group, site documents one group per site, replaced versions under Archived.
  const DOCS = [];
  const add = (c, st, extra) => DOCS.push(Object.assign({
    id: DOCS.length, code: c.code, name: c.name, area: AREA_OF[c.category], requirement: c.requirement, level: c.level,
    sharing: c.sharing, status: st[0], issued: st[1] || '—', valid: st[2] || (c.expiry === 'No expiry' ? 'No expiry' : '—'), note: st[3] || '',
    group: c.requirement === 'Optional' ? 'Optional' : c.section,
  }, extra));
  CATALOG.filter((c) => c.phase === 'MVP' && c.category !== 'Site').forEach((c) => add(c, STATE[c.code] || ['missing']));
  SITES.forEach((site, s) => SITE_STATE[s].forEach(([code, ...st]) => add(byCode[code], st, { group: site })));
  ARCHIVE.forEach(([area, name, version, replaced]) => DOCS.push({ id: DOCS.length, code: '', name, area, requirement: '', level: '', sharing: 'Standard', status: 'archived', issued: version.replace(/^Version of /, ''), valid: replaced, note: '', group: 'Archived' }));
  // the label a group goes by in the filter menu, where sections of different areas meet
  DOCS.forEach((d) => { d.groupLabel = d.area === 'sites' ? 'Site &middot; ' + d.group.split(' &middot; ')[0] : `${AREA_TITLE[d.area]} &middot; ${d.group}`; });
  // the groups of each area, in the catalog's order, Optional and Archived last
  const GROUPS_OF = (key) => [...new Set(DOCS.filter((d) => d.area === key).map((d) => d.group))]
    .sort((a, b) => (a === 'Archived') - (b === 'Archived') || (a === 'Optional') - (b === 'Optional'));
  const live = (d) => d.status !== 'archived';

  // a document can only read as good as the worst person or machine behind it
  Object.keys(ROSTERS).forEach((code) => {
    const doc = DOCS.find((d) => d.code === code); if (!doc) return;
    const r = ROSTERS[code];
    const worst = r.pick.reduce((acc, _, k) => (RANK[r.status(k)] > RANK[acc] ? r.status(k) : acc), 'valid');
    if (RANK[worst] > RANK[doc.status]) doc.status = worst;
  });
  const isOk = (d) => d.status === 'valid' || d.status === 'na';
  const isPend = (d) => ['expiring', 'filemissing', 'attention', 'processing'].includes(d.status);
  const isBad = (d) => ['missing', 'expired', 'rejected'].includes(d.status);
  const counts = (list) => {
    const l = list.filter(live);
    document.getElementById('cd-total').textContent = l.length;
    document.getElementById('cd-ok').textContent = l.filter(isOk).length;
    document.getElementById('cd-pend').textContent = l.filter(isPend).length;
    document.getElementById('cd-bad').textContent = l.filter(isBad).length;
  };
  counts(DOCS);

  const fold = (t) => t.replace(/<[^>]+>/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const DATA = DOCS.map((d) => ({ ...d, text: fold(`${d.code} ${d.name} ${d.group} ${d.requirement} ${d.note}`) }));
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
  let detail = null; // the code of a document whose full roster is open, or null
  let worker = null; // the index of a worker whose own page is open, or null
  let detailQ = ''; // search typed inside a roster page
  // a roster page's own filter, independent of the document list's: status always, plus a
  // tag — role for people, equipment type for machines — when the roster has one to offer
  let detailFilter = { status: new Set(), tag: new Set() };
  let detailFiltOpen = false;
  const resetDetailFilter = () => { detailFilter = { status: new Set(), tag: new Set() }; detailFiltOpen = false; };
  const rosterTagLabel = (r) => (r.list === WORKERS ? 'Role' : r.list === EQUIPMENT ? 'Type' : null);
  const rosterTag = (r, i) => (r.list === WORKERS ? r.list[i][1] : r.list === EQUIPMENT ? r.list[i][0].split(' &mdash; ')[0] : null);

  const CHEV_R = '<svg class="cd-row-chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.92 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"/></svg>';

  // how many in a document's roster need attention, so a row can carry its own alert
  // without anyone having to open it first
  const rosterAttention = (code) => { const r = ROSTERS[code]; if (!r) return 0; return r.pick.filter((_, i) => RANK[r.status(i)] > 0).length; };

  // every document's own row has the same four columns — name, issued, expires, status — the
  // line under the name carries the catalog's code and requirement, and why it is as it is
  const row = (d) => {
    const [label, cls] = STATUS[d.status];
    const hasRoster = !!ROSTERS[d.code] && d.area !== 'sites';
    const attn = hasRoster ? rosterAttention(d.code) : 0;
    const alert = attn ? `<span class="cd-row-alert">${attn}</span>` : '';
    const open = hasRoster ? `<span class="cd-row-open" aria-hidden="true">${CHEV_R}</span>` : '';
    const attrs = (hasRoster ? ` data-detail="${d.id}"` : '') + ` data-row-id="${d.id}"`;
    const meta = [d.code, d.requirement, hasRoster ? `${ROSTERS[d.code].pick.length} ${ROSTERS[d.code].list === WORKERS ? 'workers' : 'machines'}` : '', d.sharing !== 'Standard' ? d.sharing : ''].filter(Boolean).join(' &middot; ');
    const note = d.note ? `<span class="d cd-note${d.status === 'na' ? ' is-na' : ''}">${d.status === 'na' ? 'Not applicable: ' : ''}${d.note}</span>` : '';
    return `<tr class="cd-row${hasRoster ? ' is-rosterable' : ''}${d.status === 'archived' ? ' is-archived' : ''}"${attrs}>` +
      `<td><span class="n">${d.name}${alert}</span><span class="d">${meta}</span>${note}</td>` +
      `<td class="c">${d.issued}</td><td class="c">${d.valid}</td>` +
      `<td><span class="co-badge ${cls}">${label}</span>${open}</td></tr>`;
  };

  // a document's whole roster, its own page rather than a dropdown — the kind of list
  // that keeps working whether it holds eight rows or eight thousand
  const renderDetail = (code) => {
    const doc = DOCS.find((d) => d.code === code), r = ROSTERS[code];
    const fq = fold(detailQ);
    const tagLabel = rosterTagLabel(r);
    const items = r.pick.map((i, k) => ({ name: r.list[i][0], sub: r.list[i][1], status: r.status(k), exp: r.exp ? r.exp(k) : doc.valid, tag: rosterTag(r, i), worker: r.list === WORKERS ? i : null, text: fold(r.list[i][0]) }));
    // each filter ignores its own dimension when counting, so a menu always shows how many
    // rows a choice would leave rather than how many it already excludes
    const dKeep = (it, skip) => (!fq || it.text.includes(fq))
      && (skip === 'status' || !detailFilter.status.size || detailFilter.status.has(it.status))
      && (skip === 'tag' || !detailFilter.tag.size || (it.tag && detailFilter.tag.has(it.tag)));
    const shown = items.filter((it) => dKeep(it, null));
    const nOnD = detailFilter.status.size + detailFilter.tag.size;
    const crumb = `<div class="cd-area-head"><h2 class="co-h-l">${doc.name}</h2><p class="co-muted">${doc.code} &middot; ${doc.requirement} &middot; one per ${r.list === WORKERS ? 'worker' : 'machine'}, ${r.pick.length} on file.</p></div>`;

    const statusVals = STATUSES.filter((s) => items.some((it) => it.status === s));
    const tagVals = tagLabel ? [...new Set(items.map((it) => it.tag).filter(Boolean))].sort() : [];
    const panelHtml = detailFiltOpen ? '<div class="co-filt-list">'
      + '<div class="co-menu-h">Status</div>' + statusVals.map((s) => {
        const [label] = STATUS[s], n = items.filter((it) => dKeep(it, 'status') && it.status === s).length;
        return `<button type="button" class="co-menu-i" role="menuitemcheckbox" aria-checked="${detailFilter.status.has(s)}" data-dk="status" data-dv="${s}"><span class="co-menu-c">${TICK}</span>${label}<small>${n}</small></button>`;
      }).join('')
      + (tagVals.length ? '<div class="co-menu-sep" role="separator"></div>' + `<div class="co-menu-h">${tagLabel}</div>` + tagVals.map((v) => {
        const n = items.filter((it) => dKeep(it, 'tag') && it.tag === v).length;
        return `<button type="button" class="co-menu-i" role="menuitemcheckbox" aria-checked="${detailFilter.tag.has(v)}" data-dk="tag" data-dv="${v}"><span class="co-menu-c">${TICK}</span>${v}<small>${n}</small></button>`;
      }).join('') : '')
      + `<div class="co-menu-sep" role="separator"></div><button type="button" class="co-menu-i" role="menuitem" data-dclear${nOnD ? '' : ' disabled'}><span class="co-menu-c">${X}</span>Clear filters</button></div>`
      : '';
    const filt = `<div class="co-filt"><button type="button" class="co-filt-btn" aria-haspopup="menu" aria-expanded="${detailFiltOpen}" data-dfilt-btn><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.25"/><circle cx="9" cy="17" r="2.25"/></svg>Filter<span class="co-filt-n"${nOnD ? '' : ' hidden'}>${nOnD}</span><svg class="co-filt-chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg></button><div class="co-filt-panel" role="menu" aria-label="Filter this roster" data-dfilt-panel${detailFiltOpen ? '' : ' hidden'}>${panelHtml}</div></div>`;
    const search = `<div class="co-tools cd-detail-tools"><label class="co-search"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" placeholder="Search by name" aria-label="Search this roster" data-detail-q value="${detailQ.replace(/"/g, '&quot;')}"></label><div class="co-tools-r"><span class="co-muted cd-detail-count">${shown.length} of ${r.pick.length}</span>${nOnD ? '<button type="button" class="link-btn co-tools-clear" data-dclear>Clear filters</button>' : ''}${filt}</div></div>`;
    const list = shown.length
      ? `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl"><thead><tr><th>Name</th><th class="c">Expires</th><th>Status</th></tr></thead><tbody>${shown.map((it) => { const [label, cls] = STATUS[it.status]; return `<tr${it.worker !== null ? ` class="cd-row is-rosterable" data-worker="${it.worker}" tabindex="0" role="link"` : ''}><td><span class="n">${it.name}</span>${it.sub ? `<span class="d">${it.sub}</span>` : ''}</td><td class="c">${it.status === 'missing' ? '—' : it.exp}</td><td><span class="co-badge ${cls}">${label}</span></td></tr>`; }).join('')}</tbody></table></div>`
      : '<div class="co-card cd-none"><b class="co-row-n">No one matches that.</b></div>';
    // one child, not three: #cd-groups is a flex column with its own gap between items,
    // which would otherwise stack on top of the toolbar's own margin and widen just this gap
    groupsEl.innerHTML = `<div class="cd-detail">${crumb}${search}${list}</div>`;
  };

  const TICK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd"/></svg>';
  const X = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/></svg>';
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

  // the groups themselves: a category's rows, each with a roster toggle where there is one
  const DOC_THEAD = '<thead><tr><th>Document</th><th class="c">Issued</th><th class="c">Expires</th><th>Status</th></tr></thead>';
  const docTable = (docs) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl">${DOC_THEAD}<tbody>${docs.map(row).join('')}</tbody></table></div>`;
  const group = (cat, docs) => `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${cat}</h3><span class="co-muted">${docs.length} document${docs.length === 1 ? '' : 's'}</span></div>${docTable(docs)}</div>`;

  // the four areas, each a tile with its own count and an alert badge when something there needs you
  const renderHome = () => {
    groupsEl.innerHTML = `<div class="cd-areas" role="list">${AREAS.map((a) => {
      const docs = DATA.filter((d) => d.area === a.key && live(d));
      const alerts = docs.filter(needsAttention).length;
      return `<button type="button" class="cd-area" data-area="${a.key}" role="listitem">` +
        `<span class="cd-area-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a.icon}</svg><span>${a.title}</span>${alerts ? `<span class="cd-area-alert">${alerts}</span>` : ''}<span class="cd-area-arrow" aria-hidden="true">→</span></span>` +
        `<span class="cd-area-n">${docs.length}<small>document${docs.length === 1 ? '' : 's'}</small></span>` +
        `<span class="cd-area-d">${a.sub}</span>` +
      `</button>`;
    }).join('')}</div>`;
  };

  // one area's documents in the catalog's sections (Optional and Archived last); with no area chosen,
  // a search or filter runs across every area, each group named with its area
  const renderGroups = () => {
    const scope = area ? [area] : AREAS.map((a) => a.key);
    const shown = DATA.filter((d) => keep(d) && scope.includes(d.area));
    const html = scope.flatMap((key) => GROUPS_OF(key).map((g) => {
      const docs = shown.filter((d) => d.area === key && d.group === g);
      return docs.length ? group(area ? g : docs[0].groupLabel, docs) : '';
    })).join('');
    groupsEl.innerHTML = shown.length ? (area && !filtering() && MATRIX[area] ? matrix(area) : '') + html : none();
  };

  // Workers and Equipment, everyone at once: one row per person or machine, one column per document
  // kept for each, a dot for its status (a dash where that document isn't asked of them)
  const MATRIX = {
    workers: { label: 'By worker', list: WORKERS, cols: [['WK-10', 'Record'], ['WK-11', 'Fitness'], ['WK-12', 'Special risk'], ['WK-13', 'Operator'], ['WK-14', 'Other training'], ['WK-15', 'PPE'], ['WK-16', 'Residence permit']] },
    equipment: { label: 'By machine', list: EQUIPMENT, cols: [['EQ-00', 'Record'], ['EQ-01', 'EC conformity'], ['EQ-02', 'Pre&#8209;1995 cert.'], ['EQ-03', 'Inspection'], ['EQ-04', 'Maintenance'], ['EQ-05', 'Manual'], ['EQ-06', 'Calibration'], ['EQ-07', 'Insurance']] },
  };
  const TONE = { valid: 'ok', na: 'neu', processing: 'neu', expiring: 'pend', filemissing: 'warn', attention: 'warn', missing: 'bad', expired: 'bad', rejected: 'bad' };
  const matrix = (key) => {
    const m = MATRIX[key];
    const cellOf = (code, i) => { const r = ROSTERS[code]; const k = r ? r.pick.indexOf(i) : -1; return k < 0 ? null : r.status(k); };
    const rows = m.list.map((it, i) => {
      const cells = m.cols.map(([code]) => cellOf(code, i));
      const worst = cells.filter(Boolean).reduce((acc, s) => (RANK[s] > RANK[acc] ? s : acc), 'valid');
      const [wl, wc] = STATUS[worst];
      const open = key === 'workers' ? ` class="cd-row is-rosterable" data-worker="${i}" tabindex="0" role="link" aria-label="Open ${it[0]}"` : '';
      return `<tr${open}><td><span class="n">${it[0]}</span><span class="d">${it[1]}</span></td>${cells.map((s, c) => (s
        ? `<td class="c"><span class="cd-dot is-${TONE[s]}" title="${STATUS[s][0]}"></span><span class="sr-only">${m.cols[c][1]}: ${STATUS[s][0]}</span></td>`
        : '<td class="c"><span class="cd-dash" title="Not asked of this one">&mdash;</span></td>')).join('')}<td><span class="co-badge ${wc}">${wl}</span>${key === 'workers' ? `<span class="cd-row-open" aria-hidden="true">${CHEV_R}</span>` : ''}</td></tr>`;
    }).join('');
    const legend = [['ok', 'Valid'], ['pend', 'Expiring'], ['warn', 'Needs attention'], ['bad', 'Missing or expired']].map(([c, l]) => `<span><span class="cd-dot is-${c}"></span>${l}</span>`).join('');
    return `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${m.label}</h3><span class="co-muted">${m.list.length} ${key === 'workers' ? 'workers' : 'machines'}</span></div>
      <div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-matrix"><thead><tr><th>${key === 'workers' ? 'Worker' : 'Machine'}</th>${m.cols.map(([code, l]) => `<th class="c" title="${byCode[code] ? byCode[code].name : ''}">${l}</th>`).join('')}<th>Overall</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend">${legend}<span><span class="cd-dash">&mdash;</span>Not asked of them</span>${key === 'workers' ? '<span>Open a worker for their record and documents.</span>' : ''}</p></div>`;
  };

  // one worker: their record, whether they may work here, their documents, and their sites.
  // Personal data is Restricted: a client sees it only while this worker is on one of its sites.
  const kv = (k, v) => `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>`;
  const renderWorker = (i) => {
    const p = PERSON[i];
    const per = Object.keys(ROSTERS).filter((code) => ROSTERS[code].list === WORKERS).map((code) => {
      const r = ROSTERS[code], k = r.pick.indexOf(i); if (k < 0) return null;
      const doc = DOCS.find((d) => d.code === code);
      return { code, name: doc.name, req: doc.requirement, status: r.status(k), exp: r.exp ? r.exp(k) : doc.valid };
    }).filter(Boolean);
    const month = ['WK-01', 'WK-02'].map((code) => { const d = DOCS.find((x) => x.code === code); return { code, name: d.name, req: 'Covers every worker', status: d.status, exp: d.valid }; });
    const worst = per.reduce((acc, d) => (RANK[d.status] > RANK[acc] ? d.status : acc), 'valid');
    const [wl, wc] = STATUS[worst];
    const right = p.permit
      ? `<span class="co-badge ${STATUS[p.permit.status][1]}">${p.permit.status === 'valid' ? 'Valid permit' : 'Permit expiring'}</span> <span class="co-subtle">${p.permit.type} &middot; ${p.permit.no} &middot; until ${p.permit.until}</span>`
      : `<span class="co-badge b-ok">No permit needed</span> <span class="co-subtle">${p.nationality.replace('Portuguese', 'Portuguese citizen').replace('Spanish', 'Spanish citizen, EU')}</span>`;
    const docRow = (d) => { const [l, c] = STATUS[d.status]; return `<tr><td><span class="n">${d.name}</span><span class="d">${d.code} &middot; ${d.req}</span></td><td class="c">${d.status === 'missing' ? '&mdash;' : d.exp}</td><td><span class="co-badge ${c}">${l}</span></td></tr>`; };
    const docs = (rows) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-wk-tbl"><thead><tr><th>Document</th><th class="c">Expires</th><th>Status</th></tr></thead><tbody>${rows.map(docRow).join('')}</tbody></table></div>`;
    groupsEl.innerHTML = `<div class="cd-detail cd-worker">
      <div class="cd-area-head"><h2 class="co-h-l">${p.name}</h2><p class="co-muted">${p.role} &middot; ${p.employment.toLowerCase()} since ${p.since} &middot; <span class="co-badge ${wc}">${wl}</span></p></div>
      <p class="cd-restricted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/></svg>Restricted personal data. Clients see it only while ${p.name.split(' ')[0]} is on one of their sites.</p>
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Worker record</h3><span class="co-muted">WK&#8209;10</span></div>
        <div class="co-card cd-card-pad"><dl class="pd-grid">
          ${kv('Full name', p.name)}${kv('Job category', p.role)}${kv('Nationality', p.nationality)}
          ${kv('Birth date', p.birth)}${kv('Tax number', p.tax)}${kv('Social security number', p.ss)}
          ${kv('Home address', p.address)}${kv('Employment', `${p.employment}, since ${p.since}`)}
          ${kv('Identification', `${p.id[0]} &middot; ${p.id[1]}<br><span class="co-subtle">valid until ${p.id[2]}</span>`)}
          ${kv('Right to work in Portugal', right)}
        </dl></div></div>
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Their documents</h3><span class="co-muted">${per.length} document${per.length === 1 ? '' : 's'}</span></div>${docs(per)}</div>
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">Monthly cover</h3><span class="co-muted">September</span></div>${docs(month)}</div>
      <div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">On site</h3><span class="co-muted">${p.sites.length} site${p.sites.length === 1 ? '' : 's'}</span></div>
        <div class="co-card cd-card-pad"><ul class="cd-sites">${p.sites.map((s) => { const [n, client] = SITES[s].split(' &middot; '); return `<li><span class="n">${n}</span><span class="co-subtle">${client}</span></li>`; }).join('')}</ul></div></div>
    </div>`;
  };

  const none = () => '<div class="co-card cd-none"><b class="co-row-n">No document matches that.</b><span class="co-subtle">Try a wider search, or fewer filters.</span><button type="button" class="btn btn-quiet btn-sm" data-clear>Clear the search and filters</button></div>';

  // the breadcrumb, the back button, and the title/subtitle/stats above the list — every
  // level writes its own, so the chrome always matches where you actually are
  const AREA_SUB = {
    company: 'Where you&rsquo;ll find everything about the company itself &mdash; who you are, your licences, tax and social security, insurance and how you run health &amp; safety.',
    workers: 'Where you&rsquo;ll find all your worker documentation &mdash; the monthly payroll and social security, and what each worker is cleared for.',
    equipment: 'Where you&rsquo;ll find all your equipment documentation &mdash; every machine on site, its checks and its paperwork.',
    sites: 'Where you&rsquo;ll find what each site you work on asks of you &mdash; the contract, the schedule, the induction and the checks on site.',
  };
  const crumbTrail = document.getElementById('cd-crumb-trail'), crumbBack = document.getElementById('cd-crumb-back');
  const hero = document.getElementById('cd-hero'), h2 = document.getElementById('cd-h2'), sub = document.getElementById('cd-sub');
  const updateHeader = () => {
    const a = area ? AREAS.find((x) => x.key === area) : null;
    const doc = detail ? DOCS.find((d) => d.code === detail) : null;
    const levels = [{ label: 'My company', href: 'my-company.html?filled' }, { label: 'Documents', crumb: 'root' }];
    if (a) levels.push({ label: a.title, crumb: 'area' });
    if (doc) levels.push({ label: doc.name, crumb: 'detail' });
    if (worker !== null) levels.push({ label: WORKERS[worker][0], crumb: 'worker' });
    crumbTrail.innerHTML = levels.map((lvl, i) => {
      const sep = i ? '<span aria-hidden="true">/</span>' : '';
      if (i === levels.length - 1) return sep + `<span aria-current="page">${lvl.label}</span>`;
      return sep + (lvl.href ? `<a href="${lvl.href}">${lvl.label}</a>` : `<button type="button" data-crumb="${lvl.crumb}">${lvl.label}</button>`);
    }).join('');
    crumbBack.onclick = () => {
      if (worker !== null) { worker = null; render(); toTop(); }
      else if (doc) { detail = null; resetDetailFilter(); render(); toTop(); }
      else if (a) { area = null; render(); toTop(); }
      else location.href = 'my-company.html?filled';
    };
    hero.hidden = !!doc || worker !== null;
    if (doc || worker !== null) return;
    h2.textContent = a ? a.title : 'All company documents';
    sub.innerHTML = a ? AREA_SUB[a.key] : 'Every document the C&#8209;MORE catalog asks of a contractor, kept in one profile so any client finds the same set. Mark what doesn&rsquo;t apply to you, with a reason.';
    counts(a ? DOCS.filter((d) => d.area === a.key) : DOCS);
    document.getElementById('cd-card-total-d').textContent = a ? `Every document asked for in ${a.title.toLowerCase()}.` : 'Every document the catalog asks of you.';
  };

  function render() {
    if (typeof syncCards === 'function') syncCards();
    updateHeader();
    // the toolbar and the pills only mean anything one level up from a roster page
    tools.hidden = !!detail || worker !== null;
    pills.hidden = !!detail || worker !== null;
    if (worker !== null) { renderWorker(worker); return; }
    if (detail) { renderDetail(detail); return; }
    // the four area cards aren't a list to filter — Filter only earns its place once
    // there's an actual document table on screen, grouped or not
    const onHome = !area && !filtering();
    tools.querySelector('.co-filt').hidden = onHome;
    if (onHome) renderHome(); else renderGroups();

    const on = GROUPS.flatMap(([label, k]) => [...f[k]].map((v) => [label, k, v]));
    pills.hidden = !on.length;
    pills.innerHTML = on.map(([label, k, v]) => `<button type="button" class="co-pill" data-k="${k}" data-v="${v}" aria-label="Remove filter ${label}: ${v}"><span>${label}:</span><b>${v}</b><i aria-hidden="true">×</i></button>`).join('');
    const n = nOn(); btn.querySelector('[data-filt-n]').hidden = !n; btn.querySelector('[data-filt-n]').textContent = n;
    tools.querySelector('.co-tools-clear').hidden = !(n || f.q);
  }

  // every level change lands at the very top of the page, not just at the top of the list —
  // a tall card below could otherwise leave the new title and breadcrumb off screen
  const toTop = () => scrollTo({ top: 0, behavior: 'smooth' });

  crumbTrail.addEventListener('click', (e) => {
    const b = e.target.closest('[data-crumb]'); if (!b) return;
    if (b.dataset.crumb === 'root') { area = null; detail = null; worker = null; resetDetailFilter(); }
    else if (b.dataset.crumb === 'area') { detail = null; worker = null; resetDetailFilter(); }
    render(); toTop();
  });

  groupsEl.addEventListener('click', (e) => {
    const c = e.target.closest('[data-clear]'); if (c) { clearAll(); return; }
    const tile = e.target.closest('[data-area]'); if (tile) { area = tile.dataset.area; render(); toTop(); return; }
    const who = e.target.closest('[data-worker]'); if (who) { area = 'workers'; detail = null; worker = +who.dataset.worker; render(); toTop(); return; }
    const open = e.target.closest('[data-detail]'); if (open) {
      // the id, not the code: a code like PF‑T1 carries an HTML entity for display, which
      // the DOM would have already decoded by the time a dataset read it back
      const doc = DOCS.find((d) => d.id === +open.dataset.detail);
      area = doc.area; // so Back lands where this row was
      detail = doc.code; detailQ = ''; resetDetailFilter();
      render(); toTop();
      return;
    }
    // the roster page's own filter: same menu pattern as the document list's, scoped to detailFilter
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
      return;
    }
  });
  groupsEl.addEventListener('keydown', (e) => {
    const who = e.target.closest('[data-worker]'); if (who && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); who.click(); }
  });
  groupsEl.addEventListener('input', (e) => {
    if (!e.target.matches('[data-detail-q]')) return;
    detailQ = e.target.value; renderDetail(detail);
    const again = groupsEl.querySelector('[data-detail-q]'); if (again) { again.focus(); again.setSelectionRange(detailQ.length, detailQ.length); }
  });
  document.addEventListener('click', (e) => { if (detailFiltOpen && !e.target.closest('.cd-detail-tools')) { detailFiltOpen = false; if (detail) renderDetail(detail); } });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !detailFiltOpen) return;
    detailFiltOpen = false; if (detail) renderDetail(detail);
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
  // "On file" is the total, not a filter of its own, so it never outlines
  const syncCards = () => cards.forEach((c) => { const want = c.dataset.status && STATUS_SETS[c.dataset.status];
    c.classList.toggle('is-on', !!want && f.status.size === want.length && want.every((v) => f.status.has(v)) && nOn() === f.status.size && !f.q); });

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
        sub.textContent = 'IMPIC · valid until 15 Aug 2027. Prototype: nothing was uploaded or saved.';
        const doc = DOCS.find((d) => d.code === 'CO-03');
        doc.status = 'valid'; doc.issued = '15 Oct 2026'; doc.valid = '15 Aug 2027'; doc.note = '';
        const row = DATA.find((d) => d.id === doc.id); Object.assign(row, doc, { text: fold(`${doc.code} ${doc.name} ${doc.group} ${doc.requirement}`) });
        render(); syncCards();
      }, 2200);
    });
  }

  // arriving from elsewhere (the home page's "Documents requiring attention", a notification)
  // already knowing which document: open straight to it instead of the profile's front page
  const openCode = new URLSearchParams(location.search).get('open');
  const openDoc = openCode && DOCS.find((d) => d.code === openCode);
  if (openDoc) {
    area = openDoc.area;
    if (ROSTERS[openDoc.code] && openDoc.area !== 'sites') { detail = openDoc.code; resetDetailFilter(); }
  }
  render();
  if (openDoc && !detail) {
    const arrived = groupsEl.querySelector(`[data-row-id="${openDoc.id}"]`);
    if (arrived) { arrived.scrollIntoView({ block: 'center' }); arrived.classList.add('is-arrived'); }
  }
})();
