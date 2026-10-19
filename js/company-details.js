/* Documents: every document a company keeps on C-MORE. Nothing about which documents exist, or
   which ones a company is asked for, lives in this file:
     - js/doc-catalog.js (window.DOC_CATALOG) is the C-MORE Document Catalog, generated from the
       workbook by tools/catalog2js.py — names, sections, requirement, level, sharing, fields;
     - js/doc-rules.js (window.DocRules) decides, from the catalog and the company's profile
       (country, sector, employees, equipment, service types), which documents reach this company,
       and which workers, machines or products a per-record document covers.
   What lives here is the demo: the two companies' profiles and records, the state of each of their
   documents (status, dates, reference), and the page that shows them. Sites are left out while
   that area is reworked. */
(() => {
  const CAT = window.DOC_CATALOG || { docs: [], labels: {} };
  const R = window.DocRules;
  const LBL = CAT.labels || {};
  const en = (o) => (o && typeof o === 'object' ? o.en : o) || '';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const byCode = Object.fromEntries(CAT.docs.map((c) => [c.code, c]));
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // ---- the two demo companies -------------------------------------------------------------------
  // Miguel: a Portuguese construction company with its own crews and machines (Company, Workers,
  // Equipment). Beatriz: a US commodity exporter that supplies materials (Company, Products).
  const PERSONA = document.documentElement.dataset.persona === 'miguel' ? 'miguel' : 'beatriz';

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
  const EQUIPMENT = [
    ['Excavator &mdash; CAT 320', 'EQ&#8209;014'], ['Tower crane &mdash; Liebherr 1060', 'EQ&#8209;002'],
    ['Scissor lift &mdash; Genie GS&#8209;1932', 'EQ&#8209;021'], ['Welding set &mdash; Lincoln 210', 'EQ&#8209;033'],
    ['Concrete mixer &mdash; CM&#8209;500', 'EQ&#8209;009 &middot; built 1991'], ['Plate compactor &mdash; CP&#8209;120', 'EQ&#8209;041'],
    ['Dump truck &mdash; Volvo A25', 'EQ&#8209;017'], ['Backhoe loader &mdash; JCB 3CX', 'EQ&#8209;006'],
    ['Generator &mdash; Atlas Copco QAS60', 'EQ&#8209;028'], ['Light tower &mdash; Allmand Maxi&#8209;Lite', 'EQ&#8209;035'],
    ['Compressor &mdash; Ingersoll Rand 185', 'EQ&#8209;019'], ['Laser level &mdash; Leica Rugby 640', 'EQ&#8209;044'],
  ];
  // Beatriz's products (the same ones as on her company page)
  const PRODUCTS = [
    ['Roasted coffee beans', 'VH&#8209;COF&#8209;201'], ['Green coffee beans', 'VH&#8209;COF&#8209;110'], ['Cocoa butter', 'VH&#8209;COC&#8209;410'],
    ['Dark chocolate couverture, 70%', 'VH&#8209;COC&#8209;702'], ['Crude palm oil', 'VH&#8209;PLM&#8209;100'], ['Refined soybean oil', 'VH&#8209;SOY&#8209;220'],
    ['Natural rubber sheets (RSS3)', 'VH&#8209;RUB&#8209;300'], ['Sawn tropical hardwood', 'VH&#8209;WOD&#8209;510'], ['Frozen beef cuts', 'VH&#8209;BEF&#8209;020'],
    ['Soy protein concentrate', 'VH&#8209;SOY&#8209;410'],
  ];

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
      sites: [[0], [0, 2], [1], [0], [0], [2], [1], [0, 1, 2], [2], [0], [1], [0], [2], [1], [0], [2], [1], [0], [1], [0], [2], [0], [2], [0, 1]][i],
      // what the rules read (doc-rules.js FACTS)
      specialRisk: SPECIAL_RISK.includes(i), certifiedOperator: OPERATORS.includes(i), employmentType: i % 6 === 5 ? 'fixed_term' : 'permanent',
    };
  });
  // each machine's profile (the catalog's Equipment profile form)
  const RENTALS = { 2: 'Rented &middot; Loxam, monthly', 9: 'Rented &middot; Kiloutou, by the week' };
  const MACHINE = EQUIPMENT.map(([label, ref], i) => {
    const [type, model] = label.split(' &mdash; ');
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
  const PRODUCT = PRODUCTS.map(([name, sku]) => ({ name, sku }));

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
        'CO-03': ['expired', '15 Aug 2024', '15 Aug 2026', 'Expired 15 August &mdash; drop the renewed one on ALMA.', { ref: 'Alvar&aacute; 81204&#8209;PUB' }],
        'CO-04': ['na', '', '', 'We don&rsquo;t transport other companies&rsquo; goods.'],
        'CO-05': ['valid', '12 Dec 2025', '12 Dec 2026'],
        'CO-06': ['valid', '1 Sep 2026', '1 Dec 2026'],
        'CO-07': ['expiring', '20 Jun 2026', '20 Oct 2026', 'Expires tomorrow.'],
        'CO-08': ['valid', '1 Jan 2026', '31 Dec 2026', '', { ref: 'AT 0091&#8209;448210', by: 'Fidelidade' }],
        'CO-10': ['expiring', '3 Nov 2025', '3 Nov 2026', 'Asked for by 2 clients.', { ref: 'RC 77&#8209;104382', by: 'Fidelidade' }],
        'CO-11': ['valid', '14 Apr 2026', '14 Apr 2027', '', { by: 'Allianz Portugal' }],
        'CO-12': ['attention', '2 Oct 2026', '2 Oct 2027', 'ALMA could not read the service model &mdash; check the highlighted field.', { edited: true }],
        'CO-13': ['valid', '10 Feb 2025', 'No expiry', '', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
        'CO-14': ['valid', '31 Mar 2026', 'Next report, Apr 2027'],
        'CO-15': ['valid', '1 Jul 2026', '1 Jan 2027', 'Asked for by 1 client.'],
        'CO-16': ['valid', '5 May 2026', 'No expiry', '', { by: 'Sika Portugal' }],
        'CO-19': ['valid', '1 Oct 2026', 'No expiry', 'Asked for by 1 client.', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
        'CO-20': ['missing', '', '', 'ULS S&atilde;o Jo&atilde;o asked on 8 Oct: download it, sign it, upload it.'],
        'CO-21': ['valid', '22 May 2025', '22 May 2028', 'ISO 9001.', { by: 'SGS' }],
        'CO-23': ['valid', '2 Feb 2026', 'No expiry', 'Asked for by 1 client.', { by: 'Millennium bcp' }],
        'UN-06': ['na', '', '', 'We don&rsquo;t process personal data on our clients&rsquo; behalf.'],
        'UN-11': ['valid', '15 Jan 2026', 'Reviewed yearly', 'Asked for by 1 client.', { by: 'Ferreira Constru&ccedil;&otilde;es' }],
        'UN-12': ['valid', '31 Jan 2026', 'Next figures, Jan 2027', '2025 figures. Asked for by 1 client.', { by: 'Ferreira Constru&ccedil;&otilde;es', edited: true }],
        'UN-15': ['missing', '', '', 'Infraestruturas de Portugal asked on 9 Oct.'],
        'UN-24': ['na', '', '', 'We don&rsquo;t import CBAM goods.'],
        'WK-01': ['valid', '30 Sep 2026', '31 Oct 2026', 'September &middot; 24 workers covered.', { by: 'Fidelidade' }],
        'WK-02': ['processing', '14 Oct 2026', '30 Nov 2026', 'September &middot; ALMA is reading it.'],
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
    beatriz: {
      company: 'Veridian Harvest Co.',
      profile: { country: 'US', sector: 'other', entityType: 'company', employees: 60, services: ['material_supply'], equipmentCount: 0, usClients: true },
      line: 'United States &middot; Agricultural commodities &middot; 60 employees &middot; supplies materials',
      facts: { 'ein|tax number|tin': '71&#8209;4482019', 'address': '1200 Tchoupitoulas St, New Orleans, LA 70130', 'state|jurisdiction': 'Louisiana',
        'naics|activity codes': 'NAICS 424510, 424590', 'entity type|classification': 'Limited liability company', 'officers|representative': 'Beatriz Nogueira (CEO)' },
      records: { workers: [], equipment: [], products: PRODUCT },
      state: {
        'UN-01': ['valid', '12 Jan 2026', '12 Jan 2027', '', { ref: '34918227K', by: 'Louisiana Secretary of State' }],
        'UN-02': ['valid', '14 Mar 2011', 'No expiry', '', { ref: '34918227K', by: 'Louisiana Secretary of State' }],
        'UN-03': ['valid', '5 Feb 2026', 'No expiry', '', { ref: 'EIN 71&#8209;4482019', by: 'Veridian Harvest Co.' }],
        'UN-05': ['expiring', '1 Nov 2025', '1 Nov 2026', 'The earliest policy ends in 13 days.', { ref: 'ACORD 25 &middot; 2025&#8209;1187', by: 'Marsh McLennan Agency', edited: true }],
        'UN-07': ['valid', '3 Jun 2026', 'No expiry', '', { by: 'Veridian Harvest Co.' }],
        'UN-10': ['valid', '14 Apr 2026', '14 Apr 2027', 'Silver medal, 61/100.', { ref: 'EV&#8209;2026&#8209;77310', by: 'EcoVadis' }],
        'UN-15': ['valid', '28 Mar 2026', 'Next year&rsquo;s, Mar 2027', 'FY 2025, audited. Asked for by 2 clients.', { by: 'Deloitte &amp; Touche LLP' }],
        'UN-18': ['valid', '9 Jan 2026', 'Reviewed yearly', 'Asked for by 1 client.', { by: 'Veridian Harvest Co.' }],
        'UN-19': ['attention', '2 Oct 2026', 'Next report, Oct 2027', 'ALMA could not read the Scope 3 total &mdash; check the highlighted field.', { by: 'Veridian Harvest Co.' }],
        'UN-20': ['valid', '15 Sep 2026', '15 Sep 2027', 'Your C&#8209;MORE questionnaire.', { by: 'C&#8209;MORE' }],
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
  const D = DEMO[PERSONA];
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
    company: { title: 'Company', sub: 'Who you are, your licences, tax, insurance, policies and certifications.', long: 'Where you&rsquo;ll find everything about the company itself &mdash; who you are, your licences, tax, insurance, policies and how you run health &amp; safety.', icon: '<path d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"/>' },
    workers: { title: 'Workers', sub: 'Monthly payroll and social security, and what each worker is cleared for.', long: 'Where you&rsquo;ll find all your worker documentation &mdash; the monthly payroll and social security, and what each worker is cleared for.', icon: '<path d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"/>' },
    equipment: { title: 'Equipment', sub: 'Every machine: conformity, inspections, maintenance and manuals.', long: 'Where you&rsquo;ll find all your equipment documentation &mdash; every machine you bring, its checks and its paperwork.', icon: '<path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17 2.496 24.03m8.924-8.86-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m0 0a4.5 4.5 0 0 1 6.336-4.486l-3.276 3.276a3.004 3.004 0 0 0 2.25 2.25l3.276-3.276a4.5 4.5 0 0 1-4.486 6.336l-.144-.004"/>' },
    products: { title: 'Products', sub: 'What you supply: declarations, technical and safety sheets, certifications.', long: 'Where you&rsquo;ll find the documents for each product you supply &mdash; declarations, technical and safety sheets, and certifications.', icon: '<path d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>' },
  };
  // which records a per-record level is about, and what to call them
  const LEVEL_OF = { per_worker: 'workers', per_equipment: 'equipment', per_product: 'products' };
  const NOUN = { workers: ['worker', 'workers'], equipment: ['machine', 'machines'], products: ['product', 'products'] };
  const BY_LEVEL = { all_workers: 'For all workers', per_worker: 'For each worker', per_equipment: 'For each machine', per_product: 'For each product' };
  const recordName = (kind, i) => (kind === 'workers' ? WORKERS[i][0] : kind === 'equipment' ? EQUIPMENT[i][0] : PRODUCTS[i][0]);
  const recordSub = (kind, i) => (kind === 'workers' ? WORKERS[i][1] : kind === 'equipment' ? EQUIPMENT[i][1] : PRODUCTS[i][1]);
  const recordTag = (kind, i) => (kind === 'workers' ? WORKERS[i][1] : kind === 'equipment' ? EQUIPMENT[i][0].split(' &mdash; ')[0] : null);

  // ---- every document this company is asked for ---------------------------------------------------
  // the issuer the catalog expects, trimmed to its first name for the table
  const issuerOf = (c) => (c.usuallyIssuedBy || '').split(';')[0].trim();
  // a reference number that reads like one, stable for each document
  const refOf = (code, issued) => {
    const n = [...code + PERSONA].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 99991, 7);
    const year = (issued.match(/\d{4}/) || ['2026'])[0];
    return `${year}/${String(n).padStart(5, '0')}`;
  };
  const shown = R.documentsFor(CAT, PROFILE);
  const DOCS = [];
  shown.forEach(({ doc: c, ask }) => {
    const area = c.category;
    const kind = LEVEL_OF[c.level];
    const st = D.state[c.code];
    const base = { id: DOCS.length, code: c.code, name: en(c.name), section: en(c.section), area, cat: c, ask,
      requirement: LBL.requirement[c.requirement], req: c.requirement, sharing: LBL.sharing[c.sharing], level: c.level };
    let doc;
    if (kind) {
      // one per worker, machine or product: the rules say which records it covers
      const all = D.records[kind].map((r, i) => Object.assign({ i }, r));
      let covers = R.subjectsFor(c, all, PROFILE).map((r) => r.i);
      const pr = D.perRecord[c.code] || {};
      if (c.requirement === 'on_request') covers = covers.filter((i) => (pr.requested || []).includes(i));
      if (c.requirement === 'optional') covers = covers.filter((i) => (pr.have || []).includes(i));
      const statusOf = (i) => { const o = (pr.over || {})[i]; if (o) return o[0]; return pr.def ? pr.def[0] : 'missing'; };
      const expOf = (i) => { const o = (pr.over || {})[i]; if (o) return o[1] || '—'; return pr.def ? pr.def[1](i) : '—'; };
      const roster = covers.map((i) => ({ i, status: statusOf(i), exp: expOf(i) }));
      const status = roster.length ? worstOf(roster.map((r) => r.status))
        : c.requirement === 'on_request' ? 'notrequested' : c.requirement === 'optional' ? 'notuploaded' : 'na';
      const note = !roster.length && status === 'na' ? `None of your ${NOUN[kind][1]} need it.` : '';
      doc = Object.assign(base, { kind, roster, status, issued: '—', valid: '—', note, ref: '', by: issuerOf(c), edited: false });
    } else {
      const status = st ? st[0] : c.requirement === 'on_request' ? 'notrequested' : c.requirement === 'optional' ? 'notuploaded' : 'missing';
      const extra = (st && st[4]) || {};
      const issued = (st && st[1]) || '—';
      const has = !['missing', 'na', 'notrequested', 'notuploaded'].includes(status);
      doc = Object.assign(base, { kind: null, roster: null, status, issued, valid: (st && st[2]) || '—', note: (st && st[3]) || '',
        ref: has ? (extra.ref || refOf(c.code, issued)) : '', by: has ? (extra.by || issuerOf(c)) : '', edited: !!extra.edited });
    }
    // the group a document sits in: its catalog section for the company's own documents, who it
    // covers everywhere else — unless nobody has asked for it yet, or it is optional
    doc.group = doc.status === 'notrequested' ? 'On client request' : c.requirement === 'optional' ? 'Optional'
      : area === 'company' ? doc.section : BY_LEVEL[c.level] || doc.section;
    DOCS.push(doc);
  });
  // replaced versions, kept read-only for audit
  D.archive.forEach(([code, version, replaced]) => {
    const c = byCode[code]; if (!c) return;
    DOCS.push({ id: DOCS.length, code: '', archivedCode: code, name: en(c.name), section: 'Archived', area: c.category, cat: c, requirement: '', req: '', level: c.level, sharing: LBL.sharing[c.sharing], status: 'archived',
      issued: version.replace(/^Version of /, ''), valid: replaced, note: '', ref: '', by: issuerOf(c), edited: false, group: 'Archived', kind: null, roster: null });
  });
  // the areas this company has: open by its profile, with at least one document in them
  const AREAS = Object.keys(AREA_META).filter((k) => R.AREA_OPEN[k](PROFILE) && DOCS.some((d) => d.area === k && d.status !== 'archived'))
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
  const counts = (list) => {
    const l = list.filter(counted);
    document.getElementById('cd-total').textContent = l.length;
    document.getElementById('cd-ok').textContent = l.filter(isOk).length;
    document.getElementById('cd-pend').textContent = l.filter(isPend).length;
    document.getElementById('cd-bad').textContent = l.filter(isBad).length;
  };

  const fold = (t) => t.replace(/<[^>]+>/g, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const textOf = (d) => fold(`${d.code} ${d.name} ${d.group} ${d.requirement} ${d.note} ${d.ref} ${d.by}`);
  const DATA = DOCS.map((d) => Object.assign(d, { text: textOf(d) }));
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
  const open = new Set(); // ids of document rows expanded to show their fields
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
  // The catalog's columns, the same in every table: Document, Belongs to, Status, Reference no.,
  // Issued by, Issue date, Expiry date, Edited by user. A per-record document opens its roster;
  // every other row expands to the fields ALMA reads from it.
  const belongsTo = (d) => {
    if (d.kind) return d.roster.length ? `${d.roster.length} ${NOUN[d.kind][d.roster.length === 1 ? 0 : 1]}` : dash;
    return { all_workers: 'All workers', per_worker: 'A worker', per_equipment: 'A machine', per_product: 'A product' }[d.level] || 'Company';
  };
  const row = (d) => {
    const [label, cls] = STATUS[d.status];
    const hasRoster = !!(d.kind && d.roster.length);
    const attn = hasRoster ? d.roster.filter((r) => RANK[r.status] > 0).length : 0;
    const alert = attn ? `<span class="cd-row-alert">${attn}</span>` : '';
    const isOpen = open.has(d.id);
    const opener = hasRoster ? `<span class="cd-row-open" aria-hidden="true">${CHEV_R}</span>` : `<span class="cd-row-open cd-row-exp${isOpen ? ' is-open' : ''}" aria-hidden="true">${CHEV_D}</span>`;
    const attrs = (hasRoster ? ` data-detail="${d.id}" role="link"` : ` data-expand="${d.id}" aria-expanded="${isOpen}"`) + ` data-row-id="${d.id}" tabindex="0"`;
    const meta = [d.code || d.archivedCode, d.requirement, d.sharing !== 'Standard' ? d.sharing : ''].filter(Boolean).join(' &middot; ');
    const note = d.note ? `<span class="d cd-note${d.status === 'na' ? ' is-na' : ''}">${d.status === 'na' ? 'Not applicable: ' : ''}${d.note}</span>` : '';
    const ed = d.edited ? `<span class="cd-edited" title="Edited by user: a change to ALMA&rsquo;s reading, logged and visible to clients">${PEN}<span class="sr-only">Edited by user</span></span>` : '';
    return `<tr class="cd-row is-rosterable${d.status === 'archived' ? ' is-archived' : ''}${isOpen ? ' is-open' : ''}"${attrs}>` +
      `<td><span class="n">${esc(d.name)}${alert}</span><span class="d">${meta}</span>${note}</td>` +
      `<td>${belongsTo(d)}</td>` +
      `<td><span class="co-badge ${cls}">${label}</span></td>` +
      `<td class="cd-ref">${d.ref || dash}</td>` +
      `<td class="cd-by">${d.by && !['missing', 'na', 'notrequested', 'notuploaded'].includes(d.status) ? esc(d.by).replace(/&amp;(\w+;)/g, '&$1') : dash}</td>` +
      `<td class="c">${d.issued === '—' ? dash : d.issued}</td><td class="c">${d.valid === '—' ? dash : d.valid}</td>` +
      `<td class="cd-ed">${ed}${opener}</td></tr>` + (isOpen ? expansion(d) : '');
  };

  // a row opened: what the catalog says about this document, and the fields ALMA reads from it,
  // with what it read where the demo knows it
  const valueOf = (d, field) => {
    if (['missing', 'na', 'notrequested', 'notuploaded'].includes(d.status)) return null;
    const n = field.name.toLowerCase();
    if (/issue date|date of issue|issued on|^date$/.test(n)) return d.issued !== '—' ? d.issued : null;
    if (/expiry|valid until|validity|end date|next exam|next inspection/.test(n)) return d.valid !== '—' ? d.valid : null;
    if (/(certificate|policy|licence|license|reference|registration|document|report) (no|number)|^number$|reference/.test(n)) return d.ref || null;
    if (/issuer|issued by|insurer|certification body|authority|provider/.test(n)) return d.by || null;
    if (/legal name|company name|policyholder|holder|insured|organization|supplier name/.test(n)) return D.company;
    const known = Object.keys(D.facts).find((k) => new RegExp(k).test(n));
    return known ? D.facts[known] : null;
  };
  const expansion = (d) => {
    const c = d.cat;
    const facts = [
      ['Requirement', LBL.requirement[c.requirement] + (c.appliesWhen && c.requirement !== 'on_request' && c.requirement !== 'optional' ? ` &middot; <span class="co-subtle">${esc(c.appliesWhen)}</span>` : '')],
      ['Renewal', esc(c.renewal || '—')], ['Expiry', esc(c.expiryRule || '—')], ['Shared with', c.sharing === 'standard' ? 'Every client you share your profile with' : esc(LBL.sharing[c.sharing])],
      ['Legal basis', esc(c.legalBasis || '—')],
    ].map(([k, v]) => `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    const fields = (c.fields || []).map((fl) => {
      const v = valueOf(d, fl);
      const tags = [fl.requiredToSave ? 'Required' : '', fl.visibleToClients ? '' : 'Not shared'].filter(Boolean).map((t) => `<span class="cd-tag">${t}</span>`).join('');
      return `<tr><td><span class="n">${esc(fl.name)}</span><span class="d">${esc(fl.type)}</span></td><td>${v ? v : `<span class="co-subtle">${d.status === 'archived' ? 'Kept with the archived file' : 'Read by ALMA on upload'}</span>`}</td><td>${tags}</td></tr>`;
    }).join('');
    return `<tr class="cd-exp"><td colspan="8"><div class="cd-exp-in">
      <p class="cd-exp-desc">${esc(en(c.description))}</p>
      <dl class="pd-grid cd-exp-facts">${facts}</dl>
      ${fields ? `<div class="cd-exp-f"><h4 class="eyebrow">What ALMA reads from it</h4><table class="cd-fields"><tbody>${fields}</tbody></table></div>` : ''}
    </div></td></tr>`;
  };

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
      ? `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-doc-tbl cd-roster-tbl"><thead><tr><th>${NOUN[kind][0][0].toUpperCase() + NOUN[kind][0].slice(1)}</th><th>Status</th><th>Reference no.</th><th>Issued by</th><th class="c">Expiry date</th><th></th></tr></thead><tbody>${list.map((it) => {
        const [label, cls] = STATUS[it.status]; const has = it.status !== 'missing';
        return `<tr class="cd-row${go(it) ? ' is-rosterable' : ''}"${go(it)}${go(it) ? ' tabindex="0" role="link"' : ''}><td><span class="n">${it.name}</span>${it.sub ? `<span class="d">${it.sub}</span>` : ''}</td><td><span class="co-badge ${cls}">${label}</span></td><td class="cd-ref">${has ? refOf(doc.code + it.i, it.exp) : dash}</td><td class="cd-by">${has ? esc(by) : dash}</td><td class="c">${has ? it.exp : dash}</td><td class="cd-ed">${go(it) ? `<span class="cd-row-open" aria-hidden="true">${CHEV_R}</span>` : ''}</td></tr>`;
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

  const DOC_THEAD = '<thead><tr><th>Document</th><th>Belongs to</th><th>Status</th><th>Reference no.</th><th>Issued by</th><th class="c">Issue date</th><th class="c">Expiry date</th><th><span class="sr-only">Edited by user</span></th></tr></thead>';
  const docTable = (docs) => `<div class="co-card co-tbl-card"><table class="co-tbl cd-tbl cd-doc-tbl">${DOC_THEAD}<tbody>${docs.map(row).join('')}</tbody></table></div>`;
  const GROUP_NOTE = { 'On client request': 'Only needed once a client asks for it. Upload it ahead if you like.', Optional: 'Never required. Worth adding if it helps you win work.', Archived: 'Earlier versions, read-only, kept for audit.' };
  const group = (cat, docs, raw) => `<div class="cd-group"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${cat}</h3><span class="co-muted">${GROUP_NOTE[raw] ? GROUP_NOTE[raw] + ' &middot; ' : ''}${docs.length} document${docs.length === 1 ? '' : 's'}</span></div>${docTable(docs)}</div>`;

  // the areas, each a tile with its own count and an alert badge when something there needs you
  const renderHome = () => {
    groupsEl.innerHTML = `<div class="cd-areas" role="list">${AREAS.map((a) => {
      const docs = DATA.filter((d) => d.area === a.key && counted(d));
      const alerts = docs.filter(needsAttention).length;
      return `<button type="button" class="cd-area" data-area="${a.key}" role="listitem">` +
        `<span class="cd-area-h"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${a.icon}</svg><span>${a.title}</span>${alerts ? `<span class="cd-area-alert">${alerts}</span>` : ''}<span class="cd-area-arrow" aria-hidden="true">→</span></span>` +
        `<span class="cd-area-n">${docs.length}<small>document${docs.length === 1 ? '' : 's'} asked of you</small></span>` +
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
    groupsEl.innerHTML = list.length ? (area && !filtering() ? matrix(area) : '') + html : none();
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
    sub.innerHTML = a ? a.long : `Every document the C&#8209;MORE catalog asks of a company like yours, kept in one profile so any client finds the same set. Chosen from your profile: <b class="cd-profile">${D.line}</b>.`;
    counts(a ? DOCS.filter((d) => d.area === a.key) : DOCS);
    document.getElementById('cd-card-total-d').textContent = a ? `Every document asked of you in ${a.title.toLowerCase()}.` : 'Every document asked of you, from your profile.';
  };

  function render() {
    if (typeof syncCards === 'function') syncCards();
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
    const t = e.target.closest('[data-worker], [data-machine], [data-detail], [data-expand]');
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
        Object.assign(target, { status: 'valid', issued: '19 Oct 2026', valid: target.valid === 'No expiry' ? 'No expiry' : '19 Oct 2027', note: '', ref: target.ref || refOf(target.code, '2026'), by: target.by || issuerOf(target.cat) });
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
  const openDoc = openCode && DOCS.find((d) => d.code === openCode);
  if (openDoc) {
    area = openDoc.area;
    if (openDoc.kind && openDoc.roster.length) { detail = openDoc.id; resetDetailFilter(); } else open.add(openDoc.id);
  }
  render();
  if (openDoc && detail === null) {
    const arrived = groupsEl.querySelector(`[data-row-id="${openDoc.id}"]`);
    if (arrived) { arrived.scrollIntoView({ block: 'center' }); arrived.classList.add('is-arrived'); }
  }
})();
