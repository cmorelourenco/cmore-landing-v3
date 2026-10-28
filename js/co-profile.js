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
      employees: '10-49', employeesYear: YEARS[1], revenue: '2-10', revenueYear: YEARS[1], currency: 'EUR', structure: 'independent', parentCountry: '', parentVat: '',
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
      employees: '50-249', employeesYear: YEARS[1], revenue: '10-50', revenueYear: YEARS[1], currency: 'USD', structure: 'independent', parentCountry: '', parentVat: '',
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
    sector: '', sectors2: '', cae: [], exports: '', employees: '', employeesYear: YEARS[1], revenue: '', revenueYear: YEARS[1], currency: 'EUR', structure: '', parentCountry: '', parentVat: '',
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
  if (added) {
    const parent = added.parent && (added.parent === 'home' ? DEFAULTS[persona] : (() => { const o = orgs.find((x) => x.id === added.parent); return o && { country: o.countryName || NAMES[o.country] || '', tax: o.tax || '' }; })());
    DEFAULTS[added.id] = Object.assign({}, BLANK, {
      country: added.countryName || NAMES[added.country] || '', tax: added.tax || '', name: added.name === 'New company' ? '' : added.name || '', trading: added.trading || '',
      form: added.form ? FORM_OF[added.form] || 'other' : '', formOther: added.form && !FORM_OF[added.form] ? (added.form === 'other' ? added.formOther || '' : added.form) : '',
      sector: SECTOR_OF[added.sector] || '', employees: added.size === 'medium' ? '50-249' : '',
      structure: added.structure || '', parentCountry: parent ? parent.country : '', parentVat: parent ? parent.tax : '', cc: added.country === 'US' ? '+1' : '+351',
    });
  }
  if (TEST && !added) DEFAULTS.test = Object.assign({}, BLANK, { country: NAMES[person.country || 'PT'] || 'Portugal', tax: person.nipc || '' });
  const who = () => (added ? added.id : TEST ? 'test' : persona);
  const all = () => get(sessionStorage, KEY, {}) || {};
  // what older pages still read: its activity, in words, and its people
  const derive = (p) => Object.assign(p, { activity: label(SECTORS, p.sector), people: label(EMPLOYEES, p.employees) });
  const load = () => {
    const d = JSON.parse(JSON.stringify(DEFAULTS[who()] || BLANK)), saved = all()[who()] || {};
    return derive(Object.assign(d, saved, { consents: saved.consents || d.consents }));
  };
  const save = (p) => { const a = all(); a[who()] = p; try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
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
  const chips = (two) => two.map((k) => `<span class="cpf-chip">${esc(label(SECTORS, k))}<button type="button" data-unchip="${k}" aria-label="Remove ${esc(label(SECTORS, k))}">${X_I}</button></span>`).join('');
  const chipAdd = (main, two) => `<option value="">Add a sector</option>${SECTORS.filter(([k]) => k !== main && !two.includes(k)).map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}`;
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
      const two = String(p.sectors2 || '').split(',').filter(Boolean);
      // the economic activity (its CAE in Portugal, NACE elsewhere in the EU): read by ALMA from the
      // registry certificate, and only shown
      const codes = isEU(p.country) ? `<div class="cpf-f is-wide"><span class="cpf-l">Economic activity</span>${(p.cae || []).length
        ? `<ul class="cpf-codes">${p.cae.map((c) => { const [n, t] = String(c).split(' · '); return `<li><b>${esc(n)}</b>${esc(t || '')}</li>`; }).join('')}</ul>${from('cae')}<span class="cpf-hint">${p.country === 'Portugal' ? 'CAE' : 'NACE'} codes, read by ALMA from the company&rsquo;s registry certificate. Upload a newer one to update them.</span>`
        : '<span class="cpf-hint">ALMA reads it from the Commercial Registry Certificate once it&rsquo;s uploaded.</span>'}</div>` : '';
      return `<div class="cpf">
        <div class="cpf-f is-wide">${lab('sector', 'Primary sector')}<select class="input" id="cpf-sector" data-k="sector">${opts(SECTORS, p.sector, 'Choose one')}</select>${from('sector')}</div>
        <div class="cpf-f is-wide">${lab('sectors2', 'Secondary sectors', true)}<input type="hidden" data-k="sectors2" value="${esc(two.join(','))}">
          <div class="cpf-chips" data-chips>${chips(two)}</div>
          <select class="input" id="cpf-sectors2" data-chip-add>${chipAdd(p.sector, two)}</select></div>
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
      const r = (v, t, s) => `<label class="cpf-radio"><input type="radio" name="cpf-structure" data-k="structure" value="${v}"${p.structure === v ? ' checked' : ''}><span><b>${t}</b><span>${s}</span></span></label>`;
      return `<div class="cpf"><div class="cpf-f is-wide">${tag('structure') ? `<span class="cpf-l">Is it part of a group?</span>${from('structure')}` : ''}<div class="cpf-radios" role="radiogroup" aria-label="Corporate structure">
          ${r('parent', 'Parent company', 'Other companies sit under it, like a holding.')}
          ${r('subsidiary', 'Subsidiary company', 'It belongs to a group, under a parent company.')}
          <div class="cpf-more" data-when="structure=subsidiary"${p.structure === 'subsidiary' ? '' : ' hidden'}>
            <div class="cpf-f">${lab('parentCountry', 'Parent&rsquo;s country')}<select class="input" id="cpf-parentCountry" data-k="parentCountry">${countryOpts(p.parentCountry)}</select>${from('parentCountry')}</div>
            <div class="cpf-f">${lab('parentVat', 'Parent&rsquo;s VAT number')}${input('parentVat', 'placeholder="e.g. PT514228930" autocomplete="off"')}</div>
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
  const check = (v, strict) => {
    const has = (k) => k in v, need = (k, m) => (has(k) && !v[k] ? [m, k] : null);
    return need('name', 'The company needs its legal name.')
      || (has('form') && v.form === 'other' && !v.formOther ? ['Say which legal form it is.', 'formOther'] : null)
      || (has('hqElsewhere') && v.hqElsewhere && !v.hqCountry ? ['Choose the country its headquarters are in.', 'hqCountry'] : null)
      || need('sector', 'Choose the sector the company works in.')
      || need('employees', 'Choose how many people work for the company.')
      || need('revenue', 'Choose the company’s annual revenue.')
      || (strict ? need('structure', 'Say whether the company is part of a group.') : null)
      || (has('structure') && v.structure === 'subsidiary' && !v.parentCountry ? ['Choose the parent company’s country.', 'parentCountry'] : null)
      || (has('structure') && v.structure === 'subsidiary' && !/^[A-Z0-9-]{6,16}$/i.test((v.parentVat || '').replace(/[\s.]/g, '')) ? ['Add the parent company’s VAT number, like PT514228930.', 'parentVat'] : null);
  };
  // what opens what (Other → which form; another HQ → its country; Subsidiary → its parent), the
  // secondary sectors as chips, and the revenue bands in the currency chosen
  const repaintChips = (root) => {
    const h = root.querySelector('[data-k="sectors2"]'); if (!h) return;
    const main = value(root, 'sector') || '', two = h.value.split(',').filter((k) => k && k !== main); h.value = two.join(',');
    root.querySelector('[data-chips]').innerHTML = chips(two);
    root.querySelector('[data-chip-add]').innerHTML = chipAdd(main, two);
  };
  const wire = (root, onChange) => {
    const sync = () => {
      root.querySelectorAll('[data-when]').forEach((el) => { const [k, v] = el.dataset.when.split('='); el.hidden = value(root, k) !== v; });
      if (onChange) onChange();
    };
    root.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('[data-chip-add]') && t.value) {
        const h = root.querySelector('[data-k="sectors2"]'); h.value = h.value.split(',').filter(Boolean).concat(t.value).join(',');
        repaintChips(root); t.focus();
      }
      if (t.matches('[data-k="currency"]')) {
        const r = root.querySelector('[data-k="revenue"]'), v = r.value;
        r.innerHTML = opts(REVENUE.map((b) => [b[0], revenueLabel(b[0], t.value)]), v, 'Choose one');
        const hint = root.querySelector('[data-rev-hint]'); if (hint) hint.textContent = revHint(t.value);
      }
      if (t.matches('[data-k="sector"]')) repaintChips(root);
      if (t.matches('.is-bad')) t.classList.remove('is-bad');
      sync();
    });
    root.addEventListener('input', (e) => { e.target.classList.remove('is-bad'); if (onChange) onChange(); });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-unchip]'); if (!b) return;
      const h = root.querySelector('[data-k="sectors2"]'); h.value = h.value.split(',').filter((k) => k && k !== b.dataset.unchip).join(',');
      repaintChips(root); root.querySelector('[data-chip-add]').focus(); sync();
    });
  };

  // the company page: name, line, logo, and the consent rows answered elsewhere
  const applyToCompanyPage = () => {
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
    SECTIONS, section, wire, collect, value, check, isEU, sectorOfCode, label, formLabel, revenueLabel, FORMS, SECTORS, EMPLOYEES, initials };
})();
