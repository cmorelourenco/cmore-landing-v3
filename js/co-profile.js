/* The company's own profile: who it is, where, what it does, how big it is, how it sits in a
   group, how to reach it, its logo, and which clients may see its documents. The demo companies
   start from what their company page shows; a company added in this session from what was typed
   when it was created; the test user's from its country and tax number alone. ALMA fills in the
   rest from its registration documents and the person checks it (js/guided-upload.js). Settings
   (company-profile.html) shows the same fields, from the same form (CO_PROFILE.section). Edits are
   kept for this tab's session, per company, and the company page follows them.
   Sectors: the UN's ISIC Rev. 4 sections, the global list the EU's NACE and Portugal's CAE codes
   both sit under, so a company's activity code gives its sector. */
window.CO_PROFILE = (() => {
  const KEY = 'cm-co-profile-v2'; // v2: the profile in sections (identification, location, activity, size, structure)
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const get = (store, k, d) => { try { const v = store.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };

  // ---- the lists ---------------------------------------------------------------------------------
  const FORMS = [['sole', 'Sole proprietorship'], ['private', 'Private limited company'], ['public', 'Public limited company / Corporation'], ['general', 'General partnership'],
    ['limited', 'Limited partnership'], ['coop', 'Cooperative'], ['nonprofit', 'Non-profit organisation'], ['public-sector', 'Public sector entity'], ['branch', 'Branch of a foreign company'], ['other', 'Other']];
  const SECTORS = [['A', 'Agriculture, forestry and fishing'], ['B', 'Mining and quarrying'], ['C', 'Manufacturing'], ['D', 'Electricity, gas, steam and air conditioning supply'],
    ['E', 'Water supply, sewerage and waste management'], ['F', 'Construction'], ['G', 'Wholesale and retail trade'], ['H', 'Transportation and storage'],
    ['I', 'Accommodation and food services'], ['J', 'Information and communication'], ['K', 'Financial and insurance activities'], ['L', 'Real estate activities'],
    ['M', 'Professional, scientific and technical activities'], ['N', 'Administrative and support services'], ['O', 'Public administration and defence'], ['P', 'Education'],
    ['Q', 'Human health and social work'], ['R', 'Arts, entertainment and recreation'], ['S', 'Other service activities'], ['T', 'Households as employers'], ['U', 'Extraterritorial organisations']];
  // an activity code's first two digits (its NACE division) give its ISIC section
  const DIV = [[3, 'A'], [9, 'B'], [33, 'C'], [35, 'D'], [39, 'E'], [43, 'F'], [47, 'G'], [53, 'H'], [56, 'I'], [63, 'J'], [66, 'K'], [68, 'L'], [75, 'M'], [82, 'N'], [84, 'O'], [85, 'P'], [88, 'Q'], [93, 'R'], [96, 'S'], [98, 'T'], [99, 'U']];
  // each sector's subsectors: its divisions (the first two digits of a CAE or NACE code)
  const SUBSECTORS = [['01', 'Crop and animal production, hunting'], ['02', 'Forestry and logging'], ['03', 'Fishing and aquaculture'],
    ['05', 'Mining of coal and lignite'], ['06', 'Extraction of crude petroleum and natural gas'], ['07', 'Mining of metal ores'], ['08', 'Other mining and quarrying'], ['09', 'Mining support services'],
    ['10', 'Food products'], ['11', 'Beverages'], ['12', 'Tobacco products'], ['13', 'Textiles'], ['14', 'Wearing apparel'], ['15', 'Leather and related products'],
    ['16', 'Wood and cork products, except furniture'], ['17', 'Paper and paper products'], ['18', 'Printing and recorded media'], ['19', 'Coke and refined petroleum products'],
    ['20', 'Chemicals and chemical products'], ['21', 'Pharmaceutical products'], ['22', 'Rubber and plastic products'], ['23', 'Other non-metallic mineral products'],
    ['24', 'Basic metals'], ['25', 'Fabricated metal products'], ['26', 'Computer, electronic and optical products'], ['27', 'Electrical equipment'], ['28', 'Machinery and equipment'],
    ['29', 'Motor vehicles and trailers'], ['30', 'Other transport equipment'], ['31', 'Furniture'], ['32', 'Other manufacturing'], ['33', 'Repair and installation of machinery and equipment'],
    ['35', 'Electricity, gas, steam and air conditioning supply'],
    ['36', 'Water collection, treatment and supply'], ['37', 'Sewerage'], ['38', 'Waste collection, treatment and recovery'], ['39', 'Remediation and other waste management'],
    ['41', 'Construction of buildings'], ['42', 'Civil engineering'], ['43', 'Specialised construction activities'],
    ['45', 'Motor vehicle trade and repair'], ['46', 'Wholesale trade'], ['47', 'Retail trade'],
    ['49', 'Land transport and pipelines'], ['50', 'Water transport'], ['51', 'Air transport'], ['52', 'Warehousing and transport support'], ['53', 'Postal and courier activities'],
    ['55', 'Accommodation'], ['56', 'Food and beverage services'],
    ['58', 'Publishing'], ['59', 'Film, video, TV and music'], ['60', 'Programming and broadcasting'], ['61', 'Telecommunications'], ['62', 'Computer programming and consultancy'], ['63', 'Information services'],
    ['64', 'Financial services'], ['65', 'Insurance and pension funding'], ['66', 'Auxiliary financial and insurance services'],
    ['68', 'Real estate activities'],
    ['69', 'Legal and accounting'], ['70', 'Head offices and management consultancy'], ['71', 'Architecture, engineering and technical testing'], ['72', 'Scientific research and development'],
    ['73', 'Advertising and market research'], ['74', 'Other professional and technical activities'], ['75', 'Veterinary activities'],
    ['77', 'Rental and leasing'], ['78', 'Employment activities'], ['79', 'Travel agencies and tour operators'], ['80', 'Security and investigation'], ['81', 'Services to buildings and landscape'], ['82', 'Office and business support'],
    ['84', 'Public administration and defence'], ['85', 'Education'], ['86', 'Human health activities'], ['87', 'Residential care'], ['88', 'Social work without accommodation'],
    ['90', 'Creative, arts and entertainment'], ['91', 'Libraries, museums and culture'], ['92', 'Gambling and betting'], ['93', 'Sports, amusement and recreation'],
    ['94', 'Membership organisations'], ['95', 'Repair of computers and household goods'], ['96', 'Other personal services'],
    ['97', 'Households as employers'], ['98', 'Households producing for own use'], ['99', 'Extraterritorial organisations']];
  const sectorOfCode = (code) => { const d = parseInt(String(code).slice(0, 2), 10); const r = DIV.find(([to]) => d <= to); return r ? r[1] : ''; };
  const EMPLOYEES = [['1-9', '9 or fewer'], ['10-49', '10–49'], ['50-249', '50–249'], ['250-499', '250–499'], ['500-999', '500–999'], ['1000-4999', '1,000–4,999'], ['5000+', '5,000 or more']];
  // revenue bands are set in euros; shown in another currency at a rounded rate
  const REVENUE = [['<0.5', 0, 0.5e6], ['0.5-2', 0.5e6, 2e6], ['2-10', 2e6, 10e6], ['10-50', 10e6, 50e6], ['50-450', 50e6, 450e6], ['450+', 450e6, 0]];
  const CURRENCIES = [['EUR', '€', 1], ['USD', '$', 1.08], ['GBP', '£', 0.85]];
  const money = (n, cur) => { const [, s, r] = CURRENCIES.find((c) => c[0] === cur) || CURRENCIES[0]; const v = n * r; const t = v >= 1e9 ? +(v / 1e9).toPrecision(2) + 'B' : v >= 1e6 ? +(v / 1e6).toPrecision(2) + 'M' : +(v / 1e3).toPrecision(2) + 'K'; return s + t; };
  const revenueLabel = (k, cur) => { const b = REVENUE.find((x) => x[0] === k); if (!b) return ''; return !b[1] ? `Under ${money(b[2], cur)}` : !b[2] ? `Over ${money(b[1], cur)}` : `${money(b[1], cur)}–${money(b[2], cur)}`; };
  const NAMES = (window.CMCompanyId && window.CMCompanyId.NAMES) || { PT: 'Portugal', ES: 'Spain', FR: 'France', DE: 'Germany', IT: 'Italy', NL: 'Netherlands', BE: 'Belgium', IE: 'Ireland', GB: 'United Kingdom', US: 'United States' };
  const EU = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'];
  const COUNTRIES = [...new Set(Object.values(NAMES).concat(EU, ['Angola', 'Brazil', 'Canada', 'China', 'India', 'Mexico', 'Morocco', 'Mozambique', 'Norway', 'Switzerland', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States']))].sort((a, b) => a.localeCompare(b));
  const isEU = (c) => EU.includes(c);
  const YEARS = (() => { const y = new Date().getFullYear(); return [y, y - 1, y - 2, y - 3, y - 4].map(String); })();
  const label = (list, k) => (list.find((x) => x[0] === k) || [])[1] || '';
  const formLabel = (p) => (p.form === 'other' ? p.formOther : label(FORMS, p.form));

  // ---- whose profile -----------------------------------------------------------------------------
  const DEFAULTS = {
    miguel: {
      country: 'Portugal', tax: '514228930', name: 'Ferreira Construções, Lda.', trading: 'Ferreira Construções', form: 'private', formOther: '',
      hqElsewhere: '', hqCountry: '', street: 'Rua do Freixo 1071', postcode: '4300-219', city: 'Porto', region: 'Porto',
      sector: 'F', sectors2: '', cae: ['41200 · Construction of residential and non-residential buildings', '43210 · Electrical installation'], exports: 'no',
      employees: '10-49', employeesYear: YEARS[1], revenue: '2-10', revenueYear: YEARS[1], currency: 'EUR', structure: 'independent', parentOrg: '', parentCountry: '', parentVat: '',
      email: 'geral@ferreiraconstrucoes.pt', cc: '+351', phone: '22 600 4180', website: 'ferreiraconstrucoes.pt',
      logo: 'images/ferreira-logo.webp',
      consents: [
        { name: 'Mota-Engil', state: 'pending', what: 'civil liability, workers’ compensation, tax clearance', when: 'Asked 2 days ago' },
        { name: 'Sonae MC', state: 'pending', what: 'everything in Insurance', when: 'Asked 6 days ago' },
        { name: 'CUF', state: 'accepted', what: 'Company & legal, Insurance', when: 'Since 4 Sep 2026' },
      ],
    },
    beatriz: {
      country: 'United States', tax: '71-4482019', name: 'Veridian Harvest Co.', trading: '', form: 'other', formOther: 'Limited liability company (LLC)',
      hqElsewhere: '', hqCountry: '', street: '400 Poydras St, Suite 1850', postcode: '70130', city: 'New Orleans', region: 'LA',
      sector: 'G', sectors2: 'A', cae: [], exports: 'yes',
      employees: '50-249', employeesYear: YEARS[1], revenue: '10-50', revenueYear: YEARS[1], currency: 'USD', structure: 'independent', parentOrg: '', parentCountry: '', parentVat: '',
      email: 'info@veridianharvest.com', cc: '+1', phone: '(504) 555-0192', website: 'veridianharvest.com',
      logo: 'images/veridian-logo.svg',
      consents: [
        { name: 'Rotterdam Roasters BV', state: 'pending', what: 'EUDR due diligence statements, geolocation data', when: 'Asked 3 days ago' },
        { name: 'Café Direct Hamburg GmbH', state: 'pending', what: 'supplier code of conduct, deforestation risk assessments', when: 'Asked 5 days ago' },
        { name: 'Belgian Cocoa Works NV', state: 'accepted', what: 'Product overview, carbon footprint reports', when: 'Since 12 Aug 2026' },
      ],
    },
  };
  const BLANK = { country: '', tax: '', name: '', trading: '', form: '', formOther: '', hqElsewhere: '', hqCountry: '', street: '', postcode: '', city: '', region: '',
    sector: '', sectors2: '', cae: [], exports: '', employees: '', employeesYear: YEARS[1], revenue: '', revenueYear: YEARS[1], currency: 'EUR', structure: '', parentOrg: '', parentCountry: '', parentVat: '',
    email: '', cc: '+351', phone: '', website: '', logo: '', consents: [] };
  // which demo person is signed in (the page's head decides): Miguel's company, or Beatriz's
  const persona = document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel';
  const person = get(sessionStorage, 'cm-person', null) || {};
  // the test user (register.html): a new company, known only by its country and tax number so far
  const TEST = /^test@c-more\.test$/i.test(person.email || '');
  const orgId = get(sessionStorage, 'cm-org', null) || get(localStorage, 'cm-last-org-' + persona, null) || 'home';
  // the company you're in: the demo company, or one added in this session (js/company-switcher.js)
  const orgs = get(localStorage, 'cm-orgs-' + persona, []) || [];
  const added = orgId !== 'home' ? orgs.find((o) => o.id === orgId) || null : null;
  // what was picked when it was added, in this profile's terms
  const FORM_OF = { 'Sociedade por quotas (Lda.)': 'private', 'Sociedade unipessoal por quotas': 'private', 'Sociedade anónima (S.A.)': 'public', 'Empresário em nome individual': 'sole', Cooperativa: 'coop' };
  const SECTOR_OF = { Construction: 'F', Industry: 'C', Retail: 'G', Technology: 'J', 'Transport and logistics': 'H', Services: 'N' };
  // another of your companies, by its country and tax number (the demo company's are in its profile)
  const factsOf = (id) => (id === 'home' ? DEFAULTS[persona] : (() => { const o = orgs.find((x) => x.id === id); return o && { country: o.countryName || NAMES[o.country] || '', tax: o.tax || '' }; })());
  // the companies that can be this one's parent: your others, but not the ones under it
  const links = get(localStorage, 'cm-org-links-' + persona, {}) || {};
  const under = (id) => { for (let k = links[id], n = 0; k && n < 20; k = links[k], n++) if (k === orgId) return true; return false; };
  const parents = () => {
    const home = (get(sessionStorage, KEY, {}) || {})[TEST ? 'test' : persona] || {};
    return [{ id: 'home', name: home.name || (DEFAULTS[persona] || {}).name || 'Your company' }].concat(orgs).filter((o) => o.id !== orgId && !under(o.id));
  };
  if (added) {
    const parent = added.parent && factsOf(added.parent);
    DEFAULTS[added.id] = Object.assign({}, BLANK, {
      country: added.countryName || NAMES[added.country] || '', tax: added.tax || '', name: added.name === 'New company' ? '' : added.name || '', trading: added.trading || '',
      form: added.form ? FORM_OF[added.form] || 'other' : '', formOther: added.form && !FORM_OF[added.form] ? (added.form === 'other' ? added.formOther || '' : added.form) : '',
      sector: SECTOR_OF[added.sector] || '', employees: added.size === 'medium' ? '50-249' : '',
      structure: added.structure || '', parentOrg: added.parent || '', parentCountry: parent ? parent.country : '', parentVat: parent ? parent.tax : '', cc: added.country === 'US' ? '+1' : '+351',
    });
  }
  if (TEST && !added) DEFAULTS.test = Object.assign({}, BLANK, { country: NAMES[person.country || 'PT'] || 'Portugal', tax: person.nipc || '' });
  const who = () => (added ? added.id : TEST ? 'test' : persona);
  const all = () => get(sessionStorage, KEY, {}) || {};
  // what older pages still read: its activity, in words, and its people
  // its sectors (one or more, each with its subsectors), as the form keeps them: "F,C" and "41,43,25".
  // Older profiles had one primary sector and secondary ones: they're all its sectors now, and the
  // subsectors start from its activity codes. sector and sectors2 stay, for what still reads them.
  const split = (v) => [...new Set(String(v || '').split(',').filter(Boolean))];
  const subsOfCae = (cae, secs) => [...new Set((cae || []).map((c) => String(c).slice(0, 2)))].filter((d) => SUBSECTORS.some(([k]) => k === d) && secs.includes(sectorOfCode(d)));
  const acts = (p) => {
    if (p.sectors == null) p.sectors = split([p.sector].concat(split(p.sectors2)).join(',')).join(',');
    const secs = split(p.sectors);
    if (p.subsectors == null) p.subsectors = subsOfCae(p.cae, secs).join(',');
    p.subsectors = split(p.subsectors).filter((d) => secs.includes(sectorOfCode(d))).join(',');
    return Object.assign(p, { sector: secs[0] || '', sectors2: secs.slice(1).join(',') });
  };
  const derive = (p) => Object.assign(acts(p), { activity: label(SECTORS, p.sector), people: label(EMPLOYEES, p.employees) });
  const load = () => {
    const d = JSON.parse(JSON.stringify(DEFAULTS[who()] || BLANK)), saved = all()[who()] || {};
    return derive(Object.assign(d, saved, { consents: saved.consents || d.consents }));
  };
  // saved: the side menu's company chip follows (js/company-switcher.js)
  const save = (p) => {
    if (p.structure === 'subsidiary' && p.parentOrg && p.parentOrg !== 'other') { const f = factsOf(p.parentOrg); if (f) Object.assign(p, { parentCountry: f.country || '', parentVat: f.tax || '' }); }
    acts(p);
    const was = load(); // the structure changed: the company selector follows (js/company-switcher.js)
    if (window.CMOrgs && window.CMOrgs.link && (was.structure !== p.structure || was.parentOrg !== p.parentOrg)) window.CMOrgs.link(orgId, p.structure === 'subsidiary' && p.parentOrg && p.parentOrg !== 'other' ? p.parentOrg : null);
    const a = all(); a[who()] = p; try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} document.dispatchEvent(new CustomEvent('cm-profile')); };
  // "Construction · 10–49 people · NIPC 514 228 930 · Private limited company · Porto" — the tax
  // number goes by its country's name (NIPC in Portugal, EIN in the US)
  const taxLabel = (p) => (p.country === 'United States' ? `EIN ${p.tax.replace(/-/g, '‑')}` : p.country === 'Portugal' ? `NIPC ${p.tax.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}` : `Tax number ${p.tax}`);
  const line = (p) => [label(SECTORS, p.sector), p.employees && `${label(EMPLOYEES, p.employees)} people`, p.tax && taxLabel(p), formLabel(p), p.city].filter(Boolean).join(' · ');
  const today = () => { const d = new Date(); return `Since ${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`; };
  const initials = (n) => n.replace(/\b(LLC|Inc\.?|Co\.?|Ltd\.?|Lda\.?|S\.A\.?|GmbH|BV|NV)(?=\W|$)/gi, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const SAY = { pending: (c) => `Wants to see: ${c.what}. ${c.when}.`, accepted: (c) => `Sees: ${c.what}. ${c.when}.`, declined: (c) => `Asked to see: ${c.what}. You declined.`, stopped: (c) => `Saw: ${c.what}. You stopped sharing.` };
  const manage = () => Object.assign(document.createElement('a'), { className: 'btn co-btn-ghost co-btn-sm', href: 'company-profile.html#consents', textContent: 'Manage' });
  const BADGE = { pending: ['b-pend', 'Pending'], accepted: ['b-ok', 'Accepted'], declined: ['b-neu', 'Declined'], stopped: ['b-neu', 'Stopped'] };

  // ---- the form: the same fields in Settings and in ALMA's check -----------------------------------
  // section(key, p, src): one section's fields, filled from p. src says where a value came from
  // ({ name: 'Certidão Permanente', country: 'sign-up' }), shown beside its label.
  const css = `
.co-logo-empty.has-logo { overflow: hidden; border: 1px solid var(--color-line); background: var(--color-surface); }
.co-logo-empty.has-logo img { width: 100%; height: 100%; object-fit: cover; }
.cpf { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.25rem; }
.cpf-f { display: flex; flex-direction: column; gap: 0.375rem; min-width: 0; }
.cpf-f.is-wide { grid-column: 1 / -1; }
.cpf-f[hidden], .cpf-more[hidden] { display: none; }
.cpf-l { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.cpf-opt { font-weight: 400; color: var(--color-sand-500); }
.cpf-src { display: inline-flex; align-items: center; gap: 0.25rem; height: 1.25rem; padding: 0 0.4375rem; border-radius: 0.3125rem; background: var(--color-mid-beige); font-size: 0.6875rem; font-weight: 600; color: var(--color-ink-subtle); white-space: nowrap; }
.cpf-src.is-alma { background: color-mix(in oklab, var(--color-coral) 16%, var(--color-surface)); color: var(--color-ink); }
.cpf-from { display: flex; }
.cpf-src svg { width: 0.75rem; height: 0.75rem; }
.cpf .input { width: 100%; height: 2.875rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-off-white); font: inherit; font-size: 0.9375rem; color: var(--color-ink); outline: none; transition: border-color .14s ease, background-color .14s ease; }
.cpf .input:hover { border-color: var(--color-sand-400); }
.cpf .input:focus { border-color: var(--color-graphite); background: var(--color-surface); }
.cpf .input.is-bad { border-color: var(--color-critical); }
.cpf .input:disabled { color: var(--color-ink-subtle); background: var(--color-mid-beige); border-color: transparent; cursor: not-allowed; }
.cpf select.input { appearance: none; padding-right: 2.25rem; cursor: pointer;
  background: var(--color-off-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") right 0.75rem center / 1rem no-repeat; }
.cpf select.input:disabled { background-color: var(--color-mid-beige); }
.cpf-hint { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.cpf-pair { display: grid; grid-template-columns: minmax(0, 1fr) 7rem; gap: 0.5rem; }
.cpf-pair3 { grid-template-columns: minmax(0, 1fr) 5.75rem 7rem; }
.cpf-check { display: flex; flex-direction: row; align-items: center; gap: 0.625rem; font-size: 0.9375rem; color: var(--color-ink); cursor: pointer; }
.cpf-check input, .cpf-radio input { width: 1.125rem; height: 1.125rem; margin: 0; accent-color: var(--color-graphite); flex: none; }
.cpf-seg { display: inline-flex; gap: 0.5rem; }
.cpf-seg label { position: relative; display: inline-flex; align-items: center; height: 2.5rem; padding: 0 1.125rem; border: 1px solid var(--color-line); border-radius: 9999px; background: var(--color-off-white); font-size: 0.9375rem; cursor: pointer; }
.cpf-seg label:has(input:checked) { border-color: var(--color-graphite); background: var(--color-surface); font-weight: 600; }
.cpf-seg label:has(input:focus-visible) { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.cpf-seg input { position: absolute; opacity: 0; pointer-events: none; }
.cpf-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.cpf-chips:empty { display: none; }
.cpf-chip { display: inline-flex; align-items: center; gap: 0.25rem; height: 1.875rem; padding: 0 0.375rem 0 0.75rem; border-radius: 9999px; background: var(--color-mid-beige); font-size: 0.875rem; color: var(--color-ink); }
.cpf-chip button { all: unset; display: grid; place-items: center; width: 1.375rem; height: 1.375rem; border-radius: 50%; cursor: pointer; color: var(--color-ink-subtle); }
.cpf-chip button:hover, .cpf-chip button:focus-visible { background: var(--color-surface); color: var(--color-ink); }
.cpf-secs { list-style: none; margin: 0 0 0.5rem; padding: 0; display: grid; gap: 0.5rem; }
.cpf-sec { display: grid; gap: 0.625rem; padding: 0.75rem 0.75rem 0.875rem 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.cpf-sec-h { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; font-size: 0.9375rem; }
.cpf-sec-h b { font-weight: 600; }
.cpf-sec-x { all: unset; flex: none; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 50%; cursor: pointer; color: var(--color-ink-subtle); }
.cpf-sec-x:hover, .cpf-sec-x:focus-visible { background: var(--color-light-beige); color: var(--color-ink); }
.cpf-sec-x svg { width: 0.75rem; height: 0.75rem; }
.cpf-sec .cpf-sub-add { font-size: 0.875rem; }
.cpf-chip svg { width: 0.75rem; height: 0.75rem; }
.cpf-codes { list-style: none; margin: 0; padding: 0; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); }
.cpf-codes li { padding: 0.625rem 0.875rem; font-size: 0.9375rem; color: var(--color-ink); }
.cpf-codes li + li { border-top: 1px solid var(--color-line); }
.cpf-codes b { font-variant-numeric: tabular-nums; font-weight: 600; margin-right: 0.5rem; }
.cpf-radios { display: grid; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); overflow: hidden; }
.cpf-radio { display: grid; grid-template-columns: 1.125rem minmax(0, 1fr); gap: 0.75rem; align-items: start; padding: 0.875rem 1rem; cursor: pointer; }
.cpf-radio + .cpf-radio, .cpf-radios .cpf-more, .cpf-radios .cpf-more + .cpf-radio { border-top: 1px solid var(--color-line); }
.cpf-radio input { margin-top: 0.125rem; }
.cpf-radio b { display: block; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.cpf-radio span span { display: block; margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cpf-more { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1rem; padding: 0.875rem 1rem 1rem 2.875rem; background: var(--color-off-white); }
@media (max-width: 40rem) { .cpf, .cpf-more { grid-template-columns: minmax(0, 1fr); } .cpf-more { padding-left: 1rem; } }`;
  if (!document.getElementById('cpf-css')) { const st = document.createElement('style'); st.id = 'cpf-css'; st.textContent = css; document.head.appendChild(st); }
  const ALMA_I = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 1.5l1.6 3.9 3.9 1.6-3.9 1.6L8 12.5 6.4 8.6 2.5 7l3.9-1.6L8 1.5Z"/></svg>';
  const X_I = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';
  const opts = (list, v, none) => (none ? `<option value="">${none}</option>` : '') + list.map(([k, l]) => `<option value="${esc(k)}"${k === v ? ' selected' : ''}>${esc(l)}</option>`).join('');
  const countryOpts = (v) => '<option value="">Choose one</option>' + COUNTRIES.map((c) => `<option${c === v ? ' selected' : ''}>${esc(c)}</option>`).join('');
  const yearOpts = (v) => YEARS.map((y) => `<option${y === v ? ' selected' : ''}>${y}</option>`).join('');
  // the sectors, each a card with its subsectors as chips and a list to add more; then one to add a sector
  const secsHtml = (sectors, subsectors) => {
    const secs = split(sectors), subs = split(subsectors);
    const card = (k) => {
      const name = label(SECTORS, k), mine = subs.filter((d) => sectorOfCode(d) === k), left = SUBSECTORS.filter(([d]) => sectorOfCode(d) === k && !mine.includes(d));
      return `<li class="cpf-sec"><div class="cpf-sec-h"><b>${esc(name)}</b><button type="button" class="cpf-sec-x" data-unsec="${k}" aria-label="Remove ${esc(name)}">${X_I}</button></div>
        <div class="cpf-chips">${mine.map((d) => `<span class="cpf-chip">${esc(label(SUBSECTORS, d))}<button type="button" data-unsub="${d}" aria-label="Remove ${esc(label(SUBSECTORS, d))}">${X_I}</button></span>`).join('')}</div>
        ${left.length ? `<select class="input cpf-sub-add" data-sub-add aria-label="Add a subsector of ${esc(name)}"><option value="">${mine.length ? 'Add another subsector' : 'Add a subsector'} (optional)</option>${left.map(([d, l]) => `<option value="${d}">${esc(l)}</option>`).join('')}</select>` : ''}</li>`;
    };
    const rest = SECTORS.filter(([k]) => !secs.includes(k));
    return `${secs.length ? `<ul class="cpf-secs">${secs.map(card).join('')}</ul>` : ''}
      ${rest.length ? `<select class="input" id="cpf-sectors" data-sec-add><option value="">${secs.length ? 'Add another sector' : 'Choose a sector'}</option>${rest.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select>` : ''}`;
  };
  const revHint = (cur) => `Bands are set in euros${cur && cur !== 'EUR' ? `, shown in ${cur} at a rounded rate` : ''}. The last box is the year it is for.`;
  const SECTIONS = {
    identification: { title: 'Identification', sub: 'Who the company is, as it is registered.' },
    location: { title: 'Location', sub: 'Where the company is registered. The city shows on your company page.' },
    activity: { title: 'Activity', sub: 'What the company does. Clients find their suppliers by sector.' },
    size: { title: 'Size', sub: 'This changes over the years, so each figure says which year it is for.' },
    structure: { title: 'Corporate structure', sub: 'Whether the company is part of a group.' },
  };
  const section = (key, p, src = {}) => {
    const tag = (k) => (src[k] === 'sign-up' ? '<span class="cpf-src">From sign-up</span>' : src[k] ? `<span class="cpf-src is-alma" title="Read by ALMA">${ALMA_I}${esc(src[k])}</span>` : '');
    // where it came from goes under the field, so side-by-side fields still line up
    const lab = (k, t, opt) => `<label class="cpf-l" for="cpf-${k}">${t}${opt ? ' <span class="cpf-opt">(optional)</span>' : ''}</label>`;
    const from = (k) => (tag(k) ? `<span class="cpf-from">${tag(k)}</span>` : '');
    const input = (k, attrs = '') => `<input class="input" id="cpf-${k}" data-k="${k}" value="${esc(p[k])}" ${attrs}>${from(k)}`;
    if (key === 'identification') {
      const cc = Object.keys(NAMES).find((c) => NAMES[c] === p.country), taxName = window.CMCompanyId && cc ? window.CMCompanyId.label(cc) : '';
      return `<div class="cpf">
        <div class="cpf-f">${lab('country', 'Country of registration')}<select class="input" id="cpf-country" data-k="country" disabled>${countryOpts(p.country)}</select>${from('country')}</div>
        <div class="cpf-f">${lab('tax', `Tax ID / VAT number${taxName ? ` (${esc(taxName)})` : ''}`)}<input class="input" id="cpf-tax" data-k="tax" value="${esc(p.country === 'Portugal' ? String(p.tax).replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') : p.tax)}" disabled>${from('tax')}</div>
        <p class="cpf-hint cpf-f is-wide">These identify the company on C&#8209;MORE, so they can&rsquo;t be changed here. If one is wrong, contact C&#8209;MORE.</p>
        <div class="cpf-f is-wide">${lab('name', 'Legal name')}${input('name', 'autocomplete="organization" required')}</div>
        <div class="cpf-f">${lab('trading', 'Trade name', true)}${input('trading', 'placeholder="If clients know it by another name"')}</div>
        <div class="cpf-f">${lab('form', 'Legal form', true)}<select class="input" id="cpf-form" data-k="form">${opts(FORMS, p.form, 'Choose one')}</select>${from('form')}</div>
        <div class="cpf-f is-wide" data-when="form=other"${p.form === 'other' ? '' : ' hidden'}>${lab('formOther', 'Which legal form?')}${input('formOther', 'placeholder="e.g. Limited liability company (LLC)"')}</div>
      </div>`;
    }
    if (key === 'location') return `<div class="cpf">
        <label class="cpf-check cpf-f is-wide"><input type="checkbox" data-k="hqElsewhere"${p.hqElsewhere ? ' checked' : ''}>Its headquarters are in another country <span class="cpf-opt">(optional)</span></label>
        <div class="cpf-f is-wide" data-when="hqElsewhere=yes"${p.hqElsewhere ? '' : ' hidden'}>${lab('hqCountry', 'Headquarters country')}<select class="input" id="cpf-hqCountry" data-k="hqCountry">${countryOpts(p.hqCountry)}</select>${from('hqCountry')}</div>
        <div class="cpf-f is-wide">${lab('street', 'Street', true)}${input('street', 'autocomplete="street-address"')}</div>
        <div class="cpf-f">${lab('postcode', 'Postal code', true)}${input('postcode', 'autocomplete="postal-code"')}</div>
        <div class="cpf-f">${lab('city', 'City', true)}${input('city', 'autocomplete="address-level2"')}</div>
        <div class="cpf-f is-wide">${lab('region', 'Region', true)}${input('region', 'autocomplete="address-level1"')}</div>
      </div>`;
    if (key === 'activity') {
      acts(p);
      // the economic activity (its CAE in Portugal, NACE elsewhere in the EU): read by ALMA from the
      // registry certificate, and only shown
      const codes = isEU(p.country) ? `<div class="cpf-f is-wide"><span class="cpf-l">Economic activity</span>${(p.cae || []).length
        ? `<ul class="cpf-codes">${p.cae.map((c) => { const [n, t] = String(c).split(' · '); return `<li><b>${esc(n)}</b>${esc(t || '')}</li>`; }).join('')}</ul>${from('cae')}<span class="cpf-hint">${p.country === 'Portugal' ? 'CAE' : 'NACE'} codes, read by ALMA from the company&rsquo;s registry certificate. Upload a newer one to update them.</span>`
        : '<span class="cpf-hint">ALMA reads it from the Commercial Registry Certificate once it&rsquo;s uploaded.</span>'}</div>` : '';
      return `<div class="cpf">
        <div class="cpf-f is-wide"><label class="cpf-l" for="cpf-sectors">Sectors</label>
          <input type="hidden" data-k="sectors" value="${esc(p.sectors)}"><input type="hidden" data-k="subsectors" value="${esc(p.subsectors)}">
          <div data-secs>${secsHtml(p.sectors, p.subsectors)}</div>${from('sectors')}
          <span class="cpf-hint">Every sector the company works in, and in each, what it does there. Clients find their suppliers by sector.</span></div>
        <div class="cpf-f is-wide"><span class="cpf-l" id="cpf-exports-l">Does the company export goods or services? <span class="cpf-opt">(optional)</span></span><span class="cpf-seg" role="radiogroup" aria-labelledby="cpf-exports-l">
          <label><input type="radio" name="cpf-exports" data-k="exports" value="yes"${p.exports === 'yes' ? ' checked' : ''}>Yes</label><label><input type="radio" name="cpf-exports" data-k="exports" value="no"${p.exports === 'no' ? ' checked' : ''}>No</label></span></div>
        ${codes}
      </div>`;
    }
    if (key === 'size') return `<div class="cpf">
        <div class="cpf-f is-wide">${lab('employees', 'Number of employees')}<div class="cpf-pair"><select class="input" id="cpf-employees" data-k="employees">${opts(EMPLOYEES, p.employees, 'Choose one')}</select><select class="input" data-k="employeesYear" aria-label="Year the number of employees is for">${yearOpts(p.employeesYear)}</select></div></div>
        <div class="cpf-f is-wide">${lab('revenue', 'Annual revenue')}<div class="cpf-pair cpf-pair3"><select class="input" id="cpf-revenue" data-k="revenue">${opts(REVENUE.map((b) => [b[0], revenueLabel(b[0], p.currency)]), p.revenue, 'Choose one')}</select><select class="input" data-k="currency" aria-label="Currency">${CURRENCIES.map(([c]) => `<option${c === p.currency ? ' selected' : ''}>${c}</option>`).join('')}</select><select class="input" data-k="revenueYear" aria-label="Year the revenue is for">${yearOpts(p.revenueYear)}</select></div>
          <span class="cpf-hint" data-rev-hint>${revHint(p.currency)}</span></div>
      </div>`;
    if (key === 'structure') {
      // already have other companies on C-MORE: the parent is one of them, picked from a list;
      // only one that isn't on C-MORE is typed in, by its country and VAT number
      const mine = parents();
      const pick = !mine.length ? '' : p.parentOrg && (p.parentOrg === 'other' || mine.some((o) => o.id === p.parentOrg)) ? p.parentOrg : p.parentVat ? 'other' : '';
      const ext = mine.length ? ` data-when="parentOrg=other"${pick === 'other' ? '' : ' hidden'}` : '';
      const r = (v, t, s) => `<label class="cpf-radio"><input type="radio" name="cpf-structure" data-k="structure" value="${v}"${p.structure === v ? ' checked' : ''}><span><b>${t}</b><span>${s}</span></span></label>`;
      return `<div class="cpf"><div class="cpf-f is-wide">${tag('structure') ? `<span class="cpf-l">Is it part of a group?</span>${from('structure')}` : ''}<div class="cpf-radios" role="radiogroup" aria-label="Corporate structure">
          ${r('parent', 'Parent company', 'Other companies sit under it, like a holding.')}
          ${r('subsidiary', 'Subsidiary company', 'It belongs to a group, under a parent company.')}
          <div class="cpf-more" data-when="structure=subsidiary"${p.structure === 'subsidiary' ? '' : ' hidden'}>
            ${mine.length ? `<div class="cpf-f is-wide">${lab('parentOrg', 'Parent company')}<select class="input" id="cpf-parentOrg" data-k="parentOrg"><option value="">Choose one</option>${mine.map((o) => `<option value="${esc(o.id)}"${o.id === pick ? ' selected' : ''}>${esc(o.name)}</option>`).join('')}<option value="other"${pick === 'other' ? ' selected' : ''}>Another company, not on C&#8209;MORE</option></select></div>` : ''}
            <div class="cpf-f"${ext}>${lab('parentCountry', 'Parent&rsquo;s country')}<select class="input" id="cpf-parentCountry" data-k="parentCountry">${countryOpts(p.parentCountry)}</select>${from('parentCountry')}</div>
            <div class="cpf-f"${ext}>${lab('parentVat', 'Parent&rsquo;s VAT number')}${input('parentVat', 'placeholder="e.g. PT514228930" autocomplete="off"')}</div>
          </div>
          ${r('independent', 'None', 'It stands on its own, not part of a group.')}
        </div></div></div>`;
    }
    return '';
  };
  // reading a section's fields, whatever they are
  const fieldsOf = (root, k) => [...root.querySelectorAll(`[data-k="${k}"]`)];
  const value = (root, k) => {
    const els = fieldsOf(root, k); if (!els.length) return undefined;
    if (els[0].type === 'radio') { const c = els.find((x) => x.checked); return c ? c.value : ''; }
    if (els[0].type === 'checkbox') return els[0].checked ? 'yes' : '';
    return els[0].value.trim();
  };
  const keysIn = (root) => [...new Set([...root.querySelectorAll('[data-k]')].filter((e) => !e.disabled).map((e) => e.dataset.k))];
  const collect = (root) => Object.fromEntries(keysIn(root).map((k) => [k, value(root, k)]));
  // what must be there, and in what shape: [message, field], or null. strict: what ALMA's check
  // asks for before going on (Settings saves a section at a time, as far as it goes)
  const typed = (v) => 'structure' in v && v.structure === 'subsidiary' && (!('parentOrg' in v) || v.parentOrg === 'other'); // a parent not on C-MORE
  const check = (v, strict) => {
    const has = (k) => k in v, need = (k, m) => (has(k) && !v[k] ? [m, k] : null);
    return need('name', 'The company needs its legal name.')
      || (has('form') && v.form === 'other' && !v.formOther ? ['Say which legal form it is.', 'formOther'] : null)
      || (has('hqElsewhere') && v.hqElsewhere && !v.hqCountry ? ['Choose the country its headquarters are in.', 'hqCountry'] : null)
      || need('sectors', 'Choose the sector the company works in.')
      || need('employees', 'Choose how many people work for the company.')
      || need('revenue', 'Choose the company’s annual revenue.')
      || (strict ? need('structure', 'Say whether the company is part of a group.') : null)
      || (has('structure') && v.structure === 'subsidiary' && has('parentOrg') && !v.parentOrg ? ['Choose its parent company.', 'parentOrg'] : null)
      || (typed(v) && !v.parentCountry ? ['Choose the parent company’s country.', 'parentCountry'] : null)
      || (typed(v) && !/^[A-Z0-9-]{6,16}$/i.test((v.parentVat || '').replace(/[\s.]/g, '')) ? ['Add the parent company’s VAT number, like PT514228930.', 'parentVat'] : null);
  };
  // what opens what (Other → which form; another HQ → its country; Subsidiary → its parent), the
  // sectors and their subsectors, and the revenue bands in the currency chosen
  const setSecs = (root, secs, subs, focus) => {
    const hs = root.querySelector('[data-k="sectors"]'), hb = root.querySelector('[data-k="subsectors"]');
    hs.value = split(secs.join(',')).join(','); hb.value = split(subs.join(',')).filter((d) => split(hs.value).includes(sectorOfCode(d))).join(',');
    hs.classList.remove('is-bad');
    const box = root.querySelector('[data-secs]'); box.innerHTML = secsHtml(hs.value, hb.value);
    const f = focus && box.querySelector(focus); if (f) f.focus(); else { const a = box.querySelector('[data-sec-add]'); if (a) a.focus(); }
  };
  const wire = (root, onChange) => {
    const sync = () => {
      root.querySelectorAll('[data-when]').forEach((el) => { const [k, v] = el.dataset.when.split('='); el.hidden = value(root, k) !== v; });
      if (onChange) onChange();
    };
    root.addEventListener('change', (e) => {
      const t = e.target;
      const secs = () => split(value(root, 'sectors')), subs = () => split(value(root, 'subsectors'));
      if (t.matches('[data-sec-add]') && t.value) setSecs(root, secs().concat(t.value), subs(), `[data-unsec="${t.value}"]`);
      if (t.matches('[data-sub-add]') && t.value) { const k = sectorOfCode(t.value); setSecs(root, secs(), subs().concat(t.value), `.cpf-sec:has([data-unsec="${k}"]) [data-sub-add], [data-unsub="${t.value}"]`); }
      if (t.matches('[data-k="currency"]')) {
        const r = root.querySelector('[data-k="revenue"]'), v = r.value;
        r.innerHTML = opts(REVENUE.map((b) => [b[0], revenueLabel(b[0], t.value)]), v, 'Choose one');
        const hint = root.querySelector('[data-rev-hint]'); if (hint) hint.textContent = revHint(t.value);
      }
      if (t.matches('.is-bad')) t.classList.remove('is-bad');
      sync();
    });
    root.addEventListener('input', (e) => { e.target.classList.remove('is-bad'); if (onChange) onChange(); });
    root.addEventListener('click', (e) => {
      const a = e.target.closest('[data-unsec]'), b = e.target.closest('[data-unsub]'); if (!a && !b) return;
      const secs = split(value(root, 'sectors')), subs = split(value(root, 'subsectors'));
      if (a) setSecs(root, secs.filter((k) => k !== a.dataset.unsec), subs);
      else setSecs(root, secs, subs.filter((d) => d !== b.dataset.unsub), `.cpf-sec:has([data-unsec="${sectorOfCode(b.dataset.unsub)}"]) [data-sub-add]`);
      sync();
    });
  };

  // the empty company page's logo box: choosing one opens the modal to drop, place and zoom it
  // (js/image-crop.js); once there is one, it shows there, and clicking changes it. The demo
  // company's own logo isn't shown on its empty page.
  const emptyLogo = () => {
    const btn = document.querySelector('#empty .co-logo-empty'); if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = '1';
    const mine = () => { const p = load(); return p.logo && p.logo !== (DEFAULTS[who()] || {}).logo ? p.logo : ''; };
    const plain = btn.innerHTML;
    const show = () => {
      const l = mine(); btn.classList.toggle('has-logo', !!l);
      btn.innerHTML = l ? `<img src="${esc(l)}" alt="">` : plain;
      btn.setAttribute('aria-label', l ? 'Change your company logo' : 'Add your company logo'); btn.title = btn.getAttribute('aria-label');
    };
    show();
    btn.addEventListener('click', () => { if (window.CMCrop) window.CMCrop.open({
      title: mine() ? 'Change your logo' : 'Add your company logo', sub: 'It shows on your company page, and to the clients and suppliers who see you on C&#8209;MORE.', shape: 'square', current: mine(),
      onSave: (url) => { const p = load(); p.logo = url; save(p); show(); },
    }); });
  };
  // the company page: name, line, logo, and the consent rows answered elsewhere
  const applyToCompanyPage = () => {
    emptyLogo();
    const box = document.querySelector(`#filled .co-id-main.persona-${who()}-only`); if (!box) return;
    const p = load();
    box.querySelector('.co-name').textContent = p.trading || p.name;
    box.querySelector('.co-subtle').textContent = line(p);
    if (p.logo && p.logo !== DEFAULTS[who()].logo) {
      const img = Object.assign(new Image(), { className: 'co-logo', src: p.logo, alt: `${p.name} logo`, width: 88, height: 88 });
      box.querySelector('.co-logo').replaceWith(img);
    } else if (!p.logo && DEFAULTS[who()].logo) {
      // no logo any more: the company's initials, as on the profile page
      box.querySelector('.co-logo').replaceWith(Object.assign(document.createElement('span'), { className: 'co-logo co-logo-ini', textContent: initials(p.trading || p.name) }));
    }
    const rows = [...document.querySelectorAll(`#filled .persona-${who()}-only > .co-row`)];
    rows.forEach((row) => {
      const n = row.querySelector('.co-row-n'), name = n && n.firstChild.textContent.trim(), c = p.consents.find((x) => x.name === name); if (!c) return;
      const badge = row.querySelector('.co-badge'); [badge.className, badge.textContent] = ['co-badge ' + BADGE[c.state][0], BADGE[c.state][1]];
      if (c.state !== 'pending') {
        // an answered request is managed on the company profile, like the ones answered before
        const acts = row.querySelector('.co-acts, a.btn'); if (acts) acts.replaceWith(manage());
        row.classList.remove('co-req');
        row.querySelector('.co-row-t > .co-subtle').textContent = SAY[c.state](c);
      }
    });
    // answering on the company page is remembered here too
    rows.forEach((row) => row.querySelectorAll('[data-answer]').forEach((b) => b.addEventListener('click', () => {
      const q = load(), c = q.consents.find((x) => x.name === row.querySelector('.co-row-n').firstChild.textContent.trim()); if (!c) return;
      c.state = b.dataset.answer === 'Accepted' ? 'accepted' : 'declined'; if (c.state === 'accepted') c.when = today(); save(q);
    })));
  };

  return { load, save, line, today, BADGE, SAY, applyToCompanyPage, defaults: () => JSON.parse(JSON.stringify(DEFAULTS[who()] || BLANK)),
    SECTIONS, section, wire, collect, value, check, isEU, sectorOfCode, subsOfCae, label, formLabel, revenueLabel, FORMS, SECTORS, SUBSECTORS, EMPLOYEES, initials };
})();
