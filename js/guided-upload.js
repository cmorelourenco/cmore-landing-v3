/* ALMA's guided upload, section by section. A company's documents are asked for where they live:
   open Documents › Company, Workers or Equipment while it's empty, and her overlay comes up
   asking for that section's documents (worked out by js/doc-rules.js from the company's country,
   sector and size). The same overlay answers the other empty states — the company homepage's
   drop zone, a section's empty card — so wherever there's nothing yet, she's the way in.
     1 Upload   — what she's asking for, and the files the user adds (as many as they like), side
                  by side: nothing says which file is which yet, because nothing has been read.
                  Moving on, she reads every file: each one she recognises is checked with the body
                  that issued it; one that isn't among the documents asked for is kept, and said so.
     2 Review   — what she read from each: the fields and her confidence (a level, never a number).
                  She accepts what she's sure of; only low confidence waits for the user, listed first.
                  Accept each (or all at once), change what she got wrong, replace or remove.
                  A card opens the document in a drawer, as in Documents: a preview of it as read,
                  each value with its citation.
     3 Complete — how complete the section is. All in: congratulations. Anything missing: add it
                  now, or skip for now.
   What is accepted is what Documents and the homepage show (js/doc-model.js reads it). Files
   beyond what she asked for are kept too, without a word about it at this stage.
   window.CMGuided.open(area) opens it; js/company-details.js opens it on an empty section.
   A new company's first look at its homepage (?guided after creating it, or the test user's) is an
   onboarding instead (tour(), at the end): ALMA big over the page, then docked at its side, asking
   step by step: Registration (the documents that show it exists; in Portugal the Certidão
   Permanente, the Cartão de Pessoa Coletiva and the tax and social security clearance certificates), the rest of the
   Company documents, then Workers and Equipment. Any step, or all of it, can be skipped.
   Prototype: nothing is uploaded; what was read and accepted is kept for this tab, per company. */
(() => {
  const O = window.CMOrgs, CAT = window.DOC_CATALOG, R = window.DocRules, DM = window.DOC_MODEL;
  // not open at launch (js/company-switcher.js styles the badge)
  const SOON = (window.CM_SOON || { badge: '<span class="cm-soon">Coming soon</span>', areas: ['workers', 'equipment'].filter((k) => !(window.CM_SOON_OPEN || []).includes(k)) });
  const soon = (k) => (SOON.areas.includes(k) ? ' ' + SOON.badge : '');
  if (!O || !CAT || !R || !DM) return;
  const org = O.current();
  if (!org || (org.id === 'home' && !O.test)) return; // the test user's own company is a new one too
  const KEY = 'cm-guided-' + org.id;
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) { return null; } };
  const saved = Object.assign({ files: {}, extra: 0, areas: {} }, load() || {});
  if (!saved.files || typeof saved.files !== 'object') saved.files = {};
  if (!saved.areas) saved.areas = {};
  // an older tab's state, from when everything was asked at company creation: it was the Company section
  if (saved.step && !saved.areas.company) saved.areas.company = { step: saved.step, reviewed: !!saved.reviewed };
  const keep = () => { try { sessionStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

  // ---- what each section asks for ----------------------------------------------------------------
  // Company: what the catalog makes mandatory for the company itself. Workers and Equipment: what
  // is mandatory, or applies, for a typical worker or machine — one file each for now; once the
  // company adds its people and machines they're asked for one by one.
  const profile = DM.profileOf(org);
  const AREA = {
    registration: { title: 'Registration', what: 'registration documents', sec: 'Company', who: 'To put WHO on C-MORE, I need the N documents that show it&rsquo;s registered in WHERE.' },
    company: { title: 'Company', what: 'company documents', who: `None of these is required. Add the ones you have: each helps clients trust a ${profile.sector === 'construction' ? 'construction' : (org.sector || 'your').toLowerCase()} company in WHERE.` },
    workers: { title: 'Workers', what: 'workers&rsquo; documents', who: 'These N cover the people who work for you in WHERE. One file each for now. Once you add your team, I&rsquo;ll ask for them person by person.' },
    equipment: { title: 'Equipment', what: 'equipment documents', who: 'These N cover the machines you bring to site. One file each for now. Once you add your machines, I&rsquo;ll ask for them machine by machine.' },
  };
  const TYPICAL = { workers: [{ nationality: profile.country, specialRisk: false, certifiedOperator: false, employmentType: 'permanent' }], equipment: [{ yearBuilt: 2020, measuring: false, certified: false }] };
  // a new company is also asked for what registering it takes (any phase 'Registration' document)
  const listFor = (p) => R.documentsFor(CAT, p, { phases: ['MVP', 'Registration'] }).map((x) => x.doc).filter((d) => !d.countries || d.countries.includes(p.country));
  // Registration: the documents that show the company exists, the first thing asked of it. In
  // Portugal the Certidão Permanente, the Cartão de Pessoa Coletiva, and the tax and social
  // security clearance certificates (no debts to either); elsewhere the catalog's Identification and registration documents
  const REG = window.CM_COMPANY_DOCS.REG; // js/company-docs.js
  const asks = (area) => {
    if (area === 'equipment' && !profile.equipmentCount) return []; // it said it brings no machines
    if (area === 'company' || area === 'registration') {
      const all = listFor(profile).filter((d) => d.category === 'company' && d.level === 'company');
      if (area === 'company') return DM.companyOptional(profile.country);
      return REG[profile.country] ? REG[profile.country].map((c) => all.find((d) => d.code === c)).filter(Boolean) : all.filter((d) => d.requirement === 'mandatory' && d.section.en === 'Identification and registration');
    }
    const p = Object.assign({}, profile, area === 'equipment' ? {} : { employees: Math.max(1, profile.employees) });
    return listFor(p).filter((d) => d.category === area && ['mandatory', 'if_applicable'].includes(d.requirement)
      && (d.level === 'all_workers' || R.subjectsFor(d, TYPICAL[area] || [], p).length));
  };
  const accepted = (list) => list.filter((d) => (saved.files[d.code] || {}).ok);
  const has = (area) => accepted(asks(area)).length > 0 || Object.values(saved.files).some((f) => f.ok && f.area === area);

  // ---- the company homepage: "Profile completion", its Documents card and table --------------------
  // completion: the company's documents, its workers' when it has employees and its equipment's
  // when it brings machines to site, accepted out of all of them. The strip's link opens ALMA on the
  // first section with something missing.
  // Registration is what's mandatory of the company itself; the Company step's documents are all optional
  const counted = () => ['registration'].concat(profile.employees > 0 ? ['workers'] : [], profile.equipmentCount ? ['equipment'] : []).filter((a) => !SOON.areas.includes(a)).flatMap((a) => asks(a).map((d) => Object.assign({ area: a }, { d }))); // what's optional doesn't count against it
  // the optional ones accepted: on the homepage's Documents card and table, but not in its completion
  const extras = () => asks('company').filter((d) => (saved.files[d.code] || {}).ok).map((d) => ({ area: 'company', d, opt: true }));
  // the homepage follows along while ALMA asks, docked beside it: each part she changes (the strip,
  // who the company is, its Documents card and table) shows its new state and catches the eye. With
  // nothing accepted (again), each part goes back to how the page drew it
  const LIVE = ['#empty .co-strip', '#empty .co-id-l', '#empty .co-k[data-go="docs"]', '#empty .co-sec:has(.co-docs-tbl)', '#empty .co-band-l .co-h-xl'];
  let drawn = null;
  const strip = () => {
    const els = LIVE.map((q) => document.querySelector(q));
    if (!els[0]) return;
    if (!drawn) drawn = els.map((el) => el && el.innerHTML);
    const before = els.map((el) => el && el.innerHTML);
    const all = counted(), ok = all.filter((x) => (saved.files[x.d.code] || {}).ok), opt = extras();
    if (!ok.length && !opt.length) els.forEach((el, i) => { if (el) el.innerHTML = drawn[i]; });
    else { if (all.length) paintStrip(els[0], all, ok); identity(); home(ok.concat(opt.filter((x) => !ok.some((y) => y.d.code === x.d.code)))); }
    // only on a change she made now, not when the page first draws what was already there
    if (stripped) els.forEach((el, i) => { if (el && el.innerHTML !== before[i]) flash(el); });
    stripped = true;
  };
  let stripped = false;
  const flash = (el) => {
    if (!el) return;
    el.classList.remove('gs-live'); void el.offsetWidth; el.classList.add('gs-live');
    el.addEventListener('animationend', function off(e) { if (e.target === el) { el.classList.remove('gs-live'); el.removeEventListener('animationend', off); } });
  };
  // who the company is, as its registration documents say: each fact as soon as it's accepted
  const identity = () => {
    const box = document.querySelector('#empty .co-id-l');
    if (!box) return;
    const facts = asks('registration').filter((d) => (saved.files[d.code] || {}).ok).map((d) => {
      const f = saved.files[d.code];
      const v = d.code === 'CO-02' ? `<b>NIPC</b> ${esc(String(f.ref).replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3'))}` : d.code === 'CO-01' ? `<b>Registered</b> in ${esc(where)}` : d.code === 'CO-06' ? '<b>No tax debts</b>' : d.code === 'CO-07' ? '<b>No social security debts</b>' : d.code === 'UN-01' ? '<b>In good standing</b>' : `<b>${esc(d.name.en)}</b> ${esc(f.ref)}`;
      return `<span class="gs-fact">${OK}${v}</span>`;
    });
    if (!facts.length) return;
    const left = asks('registration').length - facts.length;
    const done = (saved.areas.registration || {}).factsDone && window.CO_PROFILE;
    box.innerHTML = `<h1 class="co-name${org.id === 'home' && O.test && !done ? ' co-name-empty' : ''}">${esc(nameOf)}</h1>
      <span class="gs-facts">${facts.join('')}</span>
      <span class="co-subtle" style="font-size:0.9375rem">${left ? `${left} more registration document${left === 1 ? '' : 's'} and this is complete.` : done ? esc(CO_PROFILE.line(CO_PROFILE.load())) : 'Next, check who the company is, as these documents say.'}</span>`;
  };
  const paintStrip = (box, all, ok) => {
    const p = Math.round((ok.length / all.length) * 100), left = all.filter((x) => !ok.includes(x));
    const meter = box.querySelector('.co-meter'), bar = meter.firstElementChild;
    bar.style.width = p + '%'; bar.style.background = p === 100 ? 'var(--color-ok, #a6d8a0)' : '';
    meter.setAttribute('aria-valuenow', String(p));
    const bySec = [...new Set(left.map((x) => x.area))].map((a) => `${left.filter((x) => x.area === a).length} in ${AREA[a].title}`).join(', ');
    box.querySelector('.co-strip-l > span:last-child').innerHTML = `<b>${p}%</b><span class="co-strip-more"> &middot; ${p === 100 ? 'every document asked of you is in, checked and in your Documents.' : `${left.length} document${left.length === 1 ? '' : 's'} left: ${bySec}.`}</span>`;
    const old = box.querySelector('.co-wrap > a'), a = old.cloneNode(false);
    a.removeAttribute('data-ce-start');
    if (p === 100) { a.href = 'company-details.html'; a.textContent = 'View documents'; }
    else { a.href = '#'; a.textContent = 'Finish company profile'; a.addEventListener('click', (e) => { e.preventDefault(); if (!tour({ again: true })) open(left[0].area); }); }
    old.replaceWith(a);
  };
  const home = (ok) => {
    const card = document.querySelector('#empty .co-k[data-go="docs"]'), tbl = document.querySelector('#empty .co-docs-tbl');
    if (!card || !tbl || !ok.length) return;
    const e = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const soon = (f) => { const t = Date.parse(f.valid); return !Number.isNaN(t) && t - Date.now() < 30 * 864e5; };
    const rows = ok.map((x) => ({ d: x.d, a: x.area, f: saved.files[x.d.code], opt: x.opt })).sort((a, b) => (Date.parse(a.f.valid) || Infinity) - (Date.parse(b.f.valid) || Infinity));
    const expiring = rows.filter((r) => soon(r.f)).length;
    card.classList.remove('is-zero');
    card.querySelector('.co-k-n').textContent = ok.length;
    card.querySelector('.co-k-nl').textContent = `document${ok.length === 1 ? '' : 's'} on file`;
    card.querySelector('.co-k-d').textContent = expiring ? `${expiring} expire${expiring === 1 ? 's' : ''} within a month.` : 'All in order. I’ll tell you before one expires.';
    card.querySelector('.co-k-chips').innerHTML = `<span class="co-k-chip co-k-ok"><b>${ok.length - expiring}</b> valid</span><span class="co-k-chip co-k-exp${expiring ? '' : ' is-zero'}"><b>${expiring}</b> expiring</span>`;
    // Your compliance: what's in so far, or what will soon need you
    const head = document.querySelector('#empty .co-band-l .co-h-xl');
    if (head) head.innerHTML = expiring ? `${expiring} document${expiring === 1 ? '' : 's'}<br><span style="font-weight:600">expire${expiring === 1 ? 's' : ''} within a month.</span>` : 'Off to a good start,<br><span style="font-weight:600">everything is in order.</span>';
    const sec = tbl.closest('.co-sec');
    sec.querySelector('.co-h-l').textContent = 'Your documents';
    sec.querySelector('.co-sec-head .co-muted').textContent = 'What you’ve uploaded, soonest to expire first. Drop more on ALMA and they join the list.';
    tbl.tBodies[0].innerHTML = rows.map(({ d, a, f, opt }) => `<tr data-code="${d.code}" tabindex="0" role="link"><td><span class="n">${e(d.name.en)}</span><span class="d">${e(f.file)}${opt ? ' &middot; Optional' : ''}</span></td><td>Your company</td><td class="c">${AREA[a].title}</td><td class="c">${e(f.valid === 'No expiry' ? '—' : f.valid)}</td><td class="c"><span class="co-badge ${soon(f) ? 'b-pend">Expiring' : 'b-ok">Valid'}</span></td></tr>`).join('');
    const go = (r) => { location.href = `company-details.html?open=${encodeURIComponent(r.dataset.code)}`; };
    tbl.tBodies[0].onclick = (ev) => { const r = ev.target.closest('tr[data-code]'); if (r) go(r); };
    tbl.tBodies[0].onkeydown = (ev) => { const r = ev.target.closest('tr[data-code]'); if (r && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); go(r); } };
  };

  // ---- shared bits ---------------------------------------------------------------------------------
  const COUNTRY = { PT: 'Portugal', ES: 'Spain', FR: 'France', DE: 'Germany', IT: 'Italy', NL: 'Netherlands', BE: 'Belgium', IE: 'Ireland', US: 'the United States' };
  const where = COUNTRY[profile.country] || org.countryName || 'your country';
  const countryName = where.replace(/^the /, 'The ');
  // the company's name, from its profile (js/co-profile.js): what ALMA read and the person confirmed
  const confirmedName = () => { const p = window.CO_PROFILE ? CO_PROFILE.load() : null; return (p && (p.trading || p.name)) || ''; };
  let nameOf = confirmedName() || org.trading || org.name;
  // before ALMA has read its name, words in place of the placeholder ("New company", "Your company")
  const called = (fresh) => (['New company', 'Your company'].includes(nameOf) ? (fresh ? 'your new company' : 'your company') : esc(nameOf));
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const M = DM.MONTHS;
  const dt = (d) => `${d.getDate()} ${M[d.getMonth()]} ${d.getFullYear()}`;
  const hash = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100003, 11);
  const local = (d) => (d.titles || '').split(';')[0].trim();
  const issuer = (d) => (d.usuallyIssuedBy || '').split(';')[0].trim() || 'The issuing authority';
  // the code each document carries, the one its issuer checks it by
  const digits = (h, n) => { let x = (h % 2147483646) + 1, o = ''; for (let i = 0; i < n; i++) { x = (x * 48271) % 2147483647; o += x % 10; } return o; };
  const taxNo = (org.tax || '').replace(/\s/g, '');
  const codeOf = (d, h, issued) => ({
    'CO-01': `${digits(h, 4)}-${digits(h + 3, 4)}-${digits(h + 7, 4)}`,
    'CO-02': taxNo.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') || digits(h, 9),
    'CO-06': `${digits(h, 4)} ${digits(h + 2, 4)} ${digits(h + 5, 4)}`,
    'CO-07': `${digits(h + 1, 11)}`,
  }[d.code] || `${issued.getFullYear()}/${String(h % 99991).padStart(5, '0')}`);
  const CODE_LABEL = { 'CO-01': 'access code', 'CO-02': 'NIPC', 'CO-06': 'validation code', 'CO-07': 'certificate code' };
  // how long a document lasts, from its catalog renewal: a month, three, four, or a year
  const monthsOf = (d) => ({ 'CO-06': 3, 'CO-07': 4 }[d.code] || (/month/i.test(d.renewal || '') && !/6/.test(d.renewal || '') ? 1 : 12));
  // which document a file is: by the words in its name, else the next one still open
  const fold = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const WORDS = (d) => fold([d.name.en, local(d), d.code].join(' ')).split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !/certificate|certidao|company|declaracao|clearance|record/.test(w));
  const match = (file, open) => {
    const n = fold(file.name);
    let best = null, score = 0;
    open.forEach((d) => { const s = WORDS(d).filter((w) => n.includes(w)).length; if (s > score) { score = s; best = d; } });
    return best || open[0] || null;
  };

  const css = `
.gs .intake-screen { padding-top: 2.5rem; }
#gs-body { width: 100%; display: grid; justify-items: center; }
.gs-steps { list-style: none; margin: 0 auto 2.25rem; padding: 0; width: min(100%, 46rem); display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); position: relative; }
.gs-steps::before { content: ""; position: absolute; top: calc(1.375rem - 1px); left: 16.67%; right: 16.67%; height: 2px; border-radius: 2px;
  background: linear-gradient(var(--color-graphite), var(--color-graphite)) left / var(--done, 0%) 100% no-repeat, var(--color-line); transition: background-size .6s var(--ease-brand); }
.gs-steps li { position: relative; display: flex; flex-direction: column; align-items: center; gap: 0.625rem; padding: 0 0.5rem; text-align: center; }
.gs-steps button { all: unset; display: contents; cursor: pointer; }
.gs-steps button:disabled { cursor: default; }
.gs-node { position: relative; z-index: 1; width: 2.75rem; height: 2.75rem; display: grid; place-items: center; border-radius: 0.5rem; background: var(--color-surface);
  border: 1.5px solid var(--color-sand-400); color: var(--color-ink-subtle); font-size: 1.0625rem; font-weight: 600; transition: background-color .2s, border-color .2s, color .2s; }
.gs-node svg { width: 1.25rem; height: 1.25rem; }
.gs-lbl { font-size: 1rem; font-weight: 600; line-height: 1.25; color: var(--color-ink-subtle); }
.gs-sub { font-size: 0.8125rem; line-height: 1.35; color: var(--color-ink-subtle); }
.gs-steps li.is-on .gs-node { background: var(--color-coral); border-color: var(--color-coral); color: var(--color-graphite); box-shadow: 0 0 0 5px var(--color-coral-tint, #f9e7e3); }
.gs-steps li.is-on .gs-lbl, .gs-steps li.is-done .gs-lbl { color: var(--color-ink); }
.gs-steps li.is-done .gs-node { background: var(--color-graphite); border-color: var(--color-graphite); color: var(--color-off-white); }
.gs-steps button:not(:disabled):hover .gs-lbl { text-decoration: underline; text-decoration-color: var(--color-coral); text-underline-offset: 3px; }
.gs-sec { display: inline-flex; align-items: center; gap: 0.375rem; margin: 0 auto 1.25rem; padding: 0.25rem 0.625rem; border-radius: 0.375rem; background: var(--color-mid-beige); font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.gs .drop.is-small { width: min(13rem, 52vw, 26svh); }
.gs-mini { display: block; width: 7.5rem; margin: 0 auto; }
.gs-mini .alma-media { max-width: none; }
.gs-pane { width: min(100%, 46rem); margin: 1.75rem auto 0; text-align: left; }
.gs-list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); overflow: hidden; }
.gs-list li { display: grid; grid-template-columns: 1.75rem minmax(0, 1fr) auto; align-items: center; gap: 0.875rem; padding: 0.875rem 1.125rem; }
.gs-list li + li { border-top: 1px solid var(--color-line); }
.gs-ic { width: 1.75rem; height: 1.75rem; display: grid; place-items: center; border-radius: 0.375rem; border: 1.5px dashed var(--color-sand-400); color: var(--color-ink-subtle); }
.gs-ic svg { width: 1rem; height: 1rem; }
.is-in .gs-ic { border: 1.5px solid var(--color-line); background: var(--color-surface-sunken, var(--color-light-beige)); color: var(--color-ink); }
.is-reading .gs-ic { border-style: solid; }
.gs-list .is-ok .gs-ic { border: 0; background: var(--color-ok, #a6d8a0); color: var(--color-graphite); }
.is-reading .gs-ic svg { animation: gs-spin .9s linear infinite; }
@keyframes gs-spin { to { transform: rotate(360deg); } }
.gs-n { display: block; font-weight: 600; color: var(--color-ink); }
.gs-d { display: block; margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); overflow-wrap: anywhere; }
.gs-list .link-btn { white-space: nowrap; }
.gs-two { display: grid; gap: 1.5rem; } /* one list above the other */
.gs-lh { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.625rem; font-size: 0.8125rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.gs-lh span { display: inline-grid; place-items: center; min-width: 1.375rem; height: 1.375rem; padding: 0 0.375rem; border-radius: 0.375rem; background: var(--color-mid-beige); font-size: 0.75rem; letter-spacing: 0; color: var(--color-ink); }
.gs-two .gs-list li { padding: 0.75rem 0.875rem; gap: 0.75rem; }
.gs-list li.gs-req { grid-template-columns: minmax(0, 1fr) auto; }
.gs-req .co-badge { white-space: nowrap; }
.gs-list li.gs-grp { display: block; padding: 0.625rem 1.125rem 0.375rem; background: var(--color-surface-sunken); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.gs-ic.is-file { border-style: solid; border-color: var(--color-line); color: var(--color-ink); }
.gs-none { padding: 1rem; border: 1.5px dashed var(--color-sand-400); border-radius: 0.75rem; font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-subtle); }

.gs .actions { flex-direction: column; align-items: center; gap: 1rem; } /* the CTA, and under it the way out */
/* back and forth between steps: back on the left, on on the right */
/* back and on side by side; the way out centred under them, as far below as they are from the text */
.gs .actions.gs-nav3 { --gs-gap: 1.75rem; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "back on" "skip skip"; align-items: center;
  column-gap: 1rem; row-gap: var(--gs-gap); margin-top: var(--gs-gap); width: min(100%, 46rem); }
.gs-nav3 > :nth-child(1) { grid-area: back; justify-self: start; } .gs-nav3 > :nth-child(2) { grid-area: skip; justify-self: center; } .gs-nav3 > :nth-child(3) { grid-area: on; justify-self: end; }
.gs .actions.gs-nav3.no-skip { grid-template-areas: "back on"; }
.gs-nav3.no-skip > :nth-child(2) { display: none; }
.gs-back { display: inline-flex; align-items: center; gap: 0.25rem; white-space: nowrap; }
.gs-back svg { width: 1rem; height: 1rem; }
.gs-back:disabled { opacity: .4; cursor: default; text-decoration: none; }
.gs .gs-nav3 .btn { min-width: 0; white-space: nowrap; }
.gs-dock .actions.gs-nav3 { width: 100%; }
.gs .btn:disabled { opacity: .45; cursor: default; }
.gs-cards { display: grid; gap: 1rem; }
.gs-card { border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); padding: 1.125rem 1.25rem; transition: border-color .2s; }
.gs-card:not(.is-editing) { cursor: pointer; }
.gs-card:not(.is-editing):hover { border-color: var(--color-sand-400); box-shadow: 0 8px 24px -16px rgba(52, 52, 52, .25); }
.gs-card.is-ok { border-color: color-mix(in oklab, var(--color-positive) 45%, var(--color-line)); }
.gs-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.gs-card h3 { font-size: 1.0625rem; font-weight: 600; line-height: 1.3; }
.gs-peek { padding: 0; border: 0; background: none; font: inherit; color: inherit; text-align: left; cursor: pointer; text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 0.2em; transition: text-decoration-color .15s; }
.gs-peek:hover { text-decoration-color: var(--color-coral); }
.gs-dw { z-index: 120; } /* over ALMA's overlay */
/* the homepage beside her, catching up: what just changed glows for a moment */
.gs-live { animation: gs-live 1.8s var(--ease-brand); border-radius: 0.75rem; }
@keyframes gs-live { 0% { box-shadow: 0 0 0 0 color-mix(in oklab, var(--color-coral) 0%, transparent); background-color: color-mix(in oklab, var(--color-coral) 10%, transparent); }
  30% { box-shadow: 0 0 0 6px color-mix(in oklab, var(--color-coral) 22%, transparent); } 100% { box-shadow: 0 0 0 0 transparent; } }
/* from step to step: the page fades out and the next fades in; the panel's content does the same */
html.tour-out main.page { opacity: 0; transition: opacity .3s ease; }
html.tour-fading main.page { transition: opacity .45s ease; }
.gs-dock.is-leaving { z-index: 49; pointer-events: none; }
.gs-dock.is-leaving .intake-inner { opacity: 0; transition: opacity .25s ease; }
.gs-dock.is-quiet .intake-inner { animation: gs-fade-in .4s ease both; }
@keyframes gs-fade-in { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { html.tour-out main.page, html.tour-fading main.page { transition: none; } .gs-dock.is-quiet .intake-inner { animation: none; } }
.gs-facts { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.gs-fact { display: inline-flex; align-items: center; gap: 0.375rem; padding: 0.3125rem 0.625rem; border-radius: 0.375rem; background: var(--color-surface); border: 1px solid var(--color-line); font-size: 0.875rem; color: var(--color-ink-muted); animation: rise .5s var(--ease-brand) both; }
.gs-fact b { font-weight: 600; color: var(--color-ink); }
.gs-fact svg { width: 0.875rem; height: 0.875rem; color: var(--color-positive, #3d7a2c); }
@media (prefers-reduced-motion: reduce) { .gs-live, .gs-fact { animation: none; } }
/* beside the docked panel, a document's preview slides out from under it, to its left; where
   there isn't room for both, it comes over the panel as everywhere else */
@media (min-width: 75rem) {
  .gs-dw.is-under { z-index: 49; }
  .gs-dw.is-under .docd-panel { right: 40rem; width: min(40rem, calc(100vw - 45rem)); box-shadow: -24px 0 48px -24px rgba(52, 52, 52, .35); }
  .gs-dock.has-peek { box-shadow: -24px 0 60px -30px rgba(52, 52, 52, .35); }
}
.gs-dw .cd-fields td:last-child { width: 1%; white-space: nowrap; }
.gs-card .co-badge { flex: none; }
.gs-sum { margin-top: 0.625rem; font-size: 0.9375rem; line-height: 1.5; color: var(--color-ink-muted); }
.gs-fields { display: grid; grid-template-columns: 0.8fr 1.3fr 1fr 0.9fr 0.9fr; gap: 0.75rem 1.25rem; margin: 0.875rem 0 0; padding: 0.875rem 0 0; border-top: 1px solid var(--color-line); }
.gs-fields dt { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.gs-fields dd { margin: 0.25rem 0 0; font-size: 0.9375rem; color: var(--color-ink); overflow-wrap: anywhere; }
.gs-fields .is-flag dd { color: var(--color-coral-deep); font-weight: 600; }
.gs-fields input { width: 100%; padding: 0.4375rem 0.625rem; border: 1px solid var(--color-sand-400); border-radius: 0.375rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
.gs-fields .is-flag input { border-color: var(--color-coral); }
.gs-fields input:disabled { background: var(--color-surface-sunken, #f3f1ec); color: var(--color-ink-subtle); }
.gs-fields .gs-fna { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.375rem; font-size: 0.8125rem; color: var(--color-ink-muted); cursor: pointer; }
.gs-fields .gs-fna input { width: 0.9375rem; height: 0.9375rem; padding: 0; accent-color: var(--color-graphite); }
.gs-why { margin-top: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 0.375rem; background: var(--color-coral-tint, #f9e7e3); font-size: 0.875rem; color: var(--color-ink); }
.gs-card.is-vat:not(.is-ok) { border-color: var(--color-coral); }
.gs-vat-f { display: grid; gap: 0.375rem; margin-top: 0.875rem; }
.gs-vat-f label { display: flex; align-items: baseline; gap: 0.5rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.gs-vat-f label span { font-weight: 400; color: var(--color-ink-subtle); }
.gs-vat-f input { width: 100%; height: 2.5rem; padding: 0 0.75rem; border: 1px solid var(--color-sand-400); border-radius: 0.375rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
.gs-vat-f input:focus { outline: none; border-color: var(--color-graphite); }
/* an expired document: a new expiry date, or none (not applicable), as in the questionnaires */
.gs-card.is-expired:not(.is-ok) { border-color: var(--color-coral); }
.gs-exp-f { display: flex; flex-wrap: wrap; align-items: end; gap: 0.625rem 1.25rem; margin-top: 0.875rem; }
.gs-exp-f label { display: grid; gap: 0.375rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.gs-exp-f input[type="date"] { height: 2.5rem; padding: 0 0.75rem; border: 1px solid var(--color-sand-400); border-radius: 0.375rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
.gs-exp-f input[type="date"]:focus { outline: none; border-color: var(--color-graphite); }
.gs-exp-f .gs-exp-na { display: flex; align-items: center; gap: 0.5rem; height: 2.5rem; font-weight: 500; cursor: pointer; }
.gs-exp-f .gs-exp-na input { width: 1rem; height: 1rem; accent-color: var(--color-graphite); }
.gs-vat-ok { margin-top: 0.75rem; font-size: 0.875rem; color: var(--color-ink-subtle); }
.gs-card footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem 1.25rem; margin-top: 1rem; }
.gs-card footer > span { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem 1.25rem; }
/* Accept: a small square-cornered button, like the tags; accepted, it takes the brand green */
.gs-acc { display: inline-flex; align-items: center; gap: 0.375rem; height: 2.25rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.375rem;
  background: var(--color-surface); font: inherit; font-size: 0.875rem; font-weight: 600; color: var(--color-ink); cursor: pointer; transition: border-color .15s, background-color .15s; }
.gs-acc svg { width: 0.875rem; height: 0.875rem; }
button.gs-acc:hover { border-color: var(--color-graphite); }
.gs-acc.is-ok { border-color: var(--color-ok, #a6d8a0); background: var(--color-ok, #a6d8a0); color: var(--color-graphite); cursor: default; }
.gs-bar-end { margin: 0.75rem 0 0; }
.gs-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 2.25rem; margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-ink-subtle); }
.gs-hint { margin-top: 0.75rem; text-align: center; }
.gs-meter { position: relative; width: 11rem; aspect-ratio: 1; margin: 0 auto; border-radius: 50%;
  background: conic-gradient(var(--color-graphite) calc(var(--p) * 1%), var(--color-mid-beige) 0); display: grid; place-items: center; }
.gs-meter.is-full { background: var(--color-ok, #a6d8a0); }
.gs-meter::before { content: ""; position: absolute; inset: 0.875rem; border-radius: 50%; background: var(--color-off-white); }
.gs-meter b { position: relative; display: block; font-size: 2.5rem; font-weight: 600; letter-spacing: -0.03em; color: var(--color-ink); text-align: center; }
.gs-meter span { position: relative; display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); text-align: center; }
@media (max-width: 40rem) { .gs-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); } .gs-sub { display: none; } .gs-lbl { font-size: 0.875rem; } .gs-list li { padding: 0.75rem 0.875rem; } }
@media (prefers-reduced-motion: reduce) { .gs-steps::before { transition: none; } .is-reading .gs-ic svg { animation: none; } }
/* the onboarding: ALMA big over the page first, then docked at the side with the page in view */
.gs-intro { z-index: 60; transition: background-color .6s var(--ease-brand), opacity .4s; }
.gs-intro.is-gone { opacity: 0; }
.gs-intro.is-flying { background: transparent; -webkit-backdrop-filter: none; backdrop-filter: none; pointer-events: none; }
.gs-intro.is-flying .intake-screen > :not(.gs-in-alma) { opacity: 0; transition: opacity .25s; }
.gs-in-alma { cursor: default; transition: transform .85s var(--ease-brand); }
.gs-in-alma::before { display: none; }
.gs-in-steps { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 0.5rem 1.25rem; margin: 1.5rem 0 0; padding: 0; font-size: 0.875rem; color: var(--color-ink-muted); }
.gs-in-steps li { display: flex; align-items: center; gap: 0.5rem; }
.gs-in-steps span { width: 1.5rem; height: 1.5rem; display: grid; place-items: center; border-radius: 0.375rem; background: var(--color-mid-beige); font-size: 0.75rem; font-weight: 600; color: var(--color-ink); }
.gs-dock.intake { left: auto; width: min(40rem, 100vw); /* a drawer's width, like every other (css/esg.css .docd-panel) */ background: var(--color-off-white); -webkit-backdrop-filter: none; backdrop-filter: none; border-left: 1px solid var(--color-line);
  box-shadow: -24px 0 60px -30px rgba(52, 52, 52, .35), 0 0 0 100vmax color-mix(in oklab, var(--color-graphite) 7%, transparent); animation: gs-dock-in .6s var(--ease-brand) both; }
.gs-dock.is-quiet { animation: none; }
@keyframes gs-dock-in { from { transform: translateX(100%); } to { transform: none; } }
.gs-dock .intake-inner { max-width: none; padding: 0 1.75rem 3rem; text-align: left; justify-items: stretch; }
.gs-dock .intake-screen { min-height: 0; padding: 1.5rem 0 0; align-content: start; }
.gs-dock.alma-ask, .gs-dock .alma-ask, .gs-dock #gs-body { justify-items: start; text-align: left; }
.gs-dock .alma-ask :is(h1, h2) { font-size: 1.625rem; line-height: 1.15; }
.gs-dock .alma-ask .lead { font-size: 0.9375rem; line-height: 1.5; }
.gs-dock .alma-ask .says { margin-top: 1rem; }
.gs-dock .gs-steps { width: 100%; margin: 0 0 1.5rem; }
.gs-dock .gs-steps::before { top: calc(1rem - 1px); }
.gs-dock .gs-node { width: 2rem; height: 2rem; font-size: 0.875rem; }
.gs-dock .gs-steps li.is-on .gs-node { box-shadow: 0 0 0 4px var(--color-coral-tint, #f9e7e3); }
.gs-dock .gs-lbl { font-size: 0.8125rem; }
.gs-dock .gs-sub { display: none; }
.gs-dock .gs-sec { margin: 0 0 1rem; }
.gs-dock .drop.is-small { width: 100%; display: flex; align-items: center; gap: 1.25rem; padding: 0.875rem 1.25rem; border: 1.5px dashed var(--color-sand-400); border-radius: 0.75rem; background: var(--color-surface); text-align: left; cursor: pointer; transition: border-color .15s, background-color .15s; }
.gs-dock .drop.is-small::before { display: none; }
.gs-dock .drop.is-small:hover, .gs-dock .drop.is-small.is-over { border-color: var(--color-coral); transform: none; }
.gs-dock .drop.is-small .alma-media { width: 4.5rem; flex: none; }
.gs-dock .drop.is-small .drop-hint { position: static; translate: none; display: grid; gap: 0.125rem; white-space: normal; font-size: 0.9375rem; font-weight: 600; letter-spacing: 0; text-transform: none; color: var(--color-ink); }
.gs-dock .drop.is-small .drop-hint small { font-size: 0.8125rem; font-weight: 400; color: var(--color-ink-subtle); }
.gs-dock .gs-mini { width: 5rem; margin: 0; }
.gs-dock .gs-pane { width: 100%; margin-top: 1.25rem; }
.gs-dock .gs-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gs-dock .gs-card header { flex-wrap: wrap; }
.gs-dock .actions { align-items: flex-start; }
.gs-dock.alma-ask .actions .btn, .gs-dock .alma-ask .actions .btn { min-width: 0; }
.gs-dock .gs-meter { width: 8rem; margin: 0; }
.gs-dock .gs-meter b { font-size: 1.75rem; }
.gs-dock #gs-body.is-part { align-items: center; text-align: center; }
.gs-dock #gs-body.is-part .gs-pane { text-align: left; }
.gs-dock #gs-body:not(.is-end) .gs-meter { width: 5.5rem; }
.gs-dock #gs-body:not(.is-end) .gs-meter::before { inset: 0.5rem; }
.gs-dock #gs-body:not(.is-end) .gs-meter b { font-size: 1.25rem; }
.gs-dock #gs-body:not(.is-end) .gs-meter span { display: none; }
.gs-dock .gs-hint { text-align: left; }
.gs-dock #gs-body.is-end { justify-items: center; text-align: center; }
.gs-dock #gs-body.is-end .gs-meter { margin: 0 auto; }
.gs-dock #gs-body.is-end .actions { align-items: center; }
.gs-dock #gs-body.is-end .gs-pane { text-align: left; }
/* room to breathe, measured against the screen's height so the whole step still fits a short one */
.gs-dock #gs-body.is-end .gs-sec { margin-bottom: clamp(1rem, 4vh, 2.5rem); }
.gs-dock #gs-body.is-end .gs-meter { width: clamp(6.5rem, 18vh, 9.5rem); }
.gs-dock #gs-body.is-end .gs-meter b { font-size: clamp(1.5rem, 4vh, 2rem); }
.gs-dock #gs-body.is-end .says { margin-top: clamp(1.25rem, 4.5vh, 2.75rem); }
.gs-dock #gs-body.is-end h1 { margin-top: clamp(0.75rem, 2vh, 1.25rem); }
.gs-dock #gs-body.is-end .lead { margin-top: clamp(0.75rem, 2vh, 1.25rem); }
.gs-dock #gs-body.is-end .gs-pane { margin-top: clamp(1.25rem, 3.5vh, 2rem); }
/* every step fills the panel, its buttons held at the foot of it however long the step is: a bar
   that stays put while the step scrolls under it. A spacer (::after, ordered before the bar) keeps
   room between the step and its buttons; at the end of a step the ring and her words sit centred */
.gs-dock .intake-inner { display: flex; flex-direction: column; min-height: 100%; padding-bottom: 0; }
.gs-dock .intake-screen { flex: 1; display: flex; flex-direction: column; }
.gs-dock #gs-body { flex: 1; display: flex; flex-direction: column; align-items: flex-start; }
.gs-dock #gs-body > .gs-pane, .gs-dock #gs-body > .drop { align-self: stretch; }
.gs-drop-wide { margin-bottom: 0.75rem; }
.gs:not(.gs-dock) .gs-drop-wide { width: 100%; display: flex; align-items: center; gap: 1.25rem; padding: 0.875rem 1.25rem; border: 1.5px dashed var(--color-sand-400); border-radius: 0.75rem; background: var(--color-surface); text-align: left; }
.gs:not(.gs-dock) .gs-drop-wide::before { display: none; }
.gs:not(.gs-dock) .gs-drop-wide .alma-media { width: 4.5rem; flex: none; }
.gs:not(.gs-dock) .gs-drop-wide .drop-hint { position: static; translate: none; display: grid; gap: 0.125rem; white-space: normal; font-size: 0.9375rem; font-weight: 600; letter-spacing: 0; text-transform: none; color: var(--color-ink); }
.gs-drop-wide .drop-hint small { font-size: 0.8125rem; font-weight: 400; color: var(--color-ink-subtle); }
.gs-dock #gs-body::after { content: ""; order: 1; flex: 1 0 1.5rem; }
.gs-dock #gs-body > .actions.gs-nav3 { order: 2; position: sticky; bottom: 0; z-index: 2; margin: 0 -1.75rem; width: calc(100% + 3.5rem); --gs-gap: 1rem;
  padding: 1rem 1.75rem 1.25rem; background: var(--color-off-white); border-top: 1px solid var(--color-line); }
.gs-dock #gs-body.is-end { align-items: center; }
.gs-dock #gs-body.is-end::after { flex: 0 0 clamp(1.5rem, 5vh, 3rem); }
.gs-dock #gs-body.is-end > :first-child { margin-top: auto; }
.gs-dock #gs-body.is-end > .actions.gs-nav3 { margin-top: auto; border-top: 0; padding-top: 0; --gs-gap: clamp(1.5rem, 5vh, 3rem); } /* the skip as far below the buttons as they are below her words */
/* a short screen: the section tag goes, and the steps sit closer, so the ring, her words and both buttons still fit */
@media (max-height: 45rem) {
  .gs-dock #gs-body.is-end .gs-sec { display: none; }
  .gs-dock #gs-body.is-end .gs-meter { margin-top: auto; }
  .gs-dock .intake-screen:has(#gs-body.is-end) { padding-top: 1rem; }
  .gs-dock .intake-screen:has(#gs-body.is-end) .gs-steps { margin-bottom: 1rem; }
}
.gs-tour { position: sticky; top: 0; z-index: 2; margin: 0 -1.75rem; padding: 1rem 1.75rem 0.875rem; background: var(--color-off-white); border-bottom: 1px solid var(--color-line); text-align: left; }
.gs-tour-t { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.gs-tour-t .link-btn { flex: none; white-space: nowrap; }
.gs-tour-acts { flex: none; display: flex; align-items: center; gap: 0.5rem; margin-right: -0.5rem; }
.gs-tour-acts .dlg-x { position: static; }
.gs-fold { flex: none; display: grid; place-items: center; width: 2.25rem; height: 2.25rem; padding: 0; border: 1px solid var(--color-sand-400); border-radius: 0.5rem; background: var(--color-surface); color: var(--color-ink); cursor: pointer; box-shadow: 0 1px 2px rgba(52, 52, 52, .08); transition: background-color .15s ease, border-color .15s ease; }
.gs-fold:hover { background: var(--color-light-beige); border-color: var(--color-graphite); }
.gs-fold:focus-visible { outline: 2px solid var(--color-coral); outline-offset: 2px; }
.gs-fold svg { width: 1.125rem; height: 1.125rem; }
/* folded: a rail on the right, like the side menu's */
.gs-dock.intake { transition: width .35s var(--ease-brand), box-shadow .3s ease; }
.gs-dock.intake.is-tucked { width: 4.5rem; overflow: hidden; box-shadow: -24px 0 60px -30px rgba(52, 52, 52, .35); }
.gs-dock.is-tucked .intake-inner { display: none; }
.gs-rail { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; min-height: 100%; padding: 1rem 0 1.5rem; }
.gs-rail[hidden] { display: none; }
.gs-rail ol { list-style: none; margin: 0; padding: 1.25rem 0 0; border-top: 1px solid var(--color-line); display: grid; gap: 0.75rem; width: 2.75rem; justify-items: center; }
.gs-rail ol button { display: grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 1.5px solid var(--color-sand-400); border-radius: 50%; background: var(--color-surface); color: var(--color-ink-subtle); font: inherit; font-size: 0.8125rem; font-weight: 600; cursor: pointer; }
.gs-rail ol button svg { width: 0.875rem; height: 0.875rem; }
.gs-rail .is-done button { border-color: var(--color-graphite); background: var(--color-graphite); color: #fff; }
.gs-rail .is-on button { border-color: var(--color-coral); background: var(--color-coral); color: #fff; box-shadow: 0 0 0 4px var(--color-coral-tint, #f9e7e3); }
.gs-rail .is-soon button { border-style: dashed; opacity: .7; }
.gs-rail-t { margin-top: 0.25rem; padding: 0.5rem 0; border: 0; background: none; writing-mode: vertical-rl; font: inherit; font-size: 0.75rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--color-ink-subtle); cursor: pointer; white-space: nowrap; }
.gs-rail-t:hover { color: var(--color-ink); }
/* inviting suppliers: the two ways in, then who's been invited */
.gs-inv { display: grid; gap: 0.625rem; }
.gs-inv-opt { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 1rem; width: 100%; padding: 1rem 1rem 1rem 1.125rem; border: 1px solid var(--color-line); border-radius: 0.875rem; background: var(--color-surface); font: inherit; text-align: left; color: var(--color-ink); cursor: pointer; transition: border-color .15s ease, box-shadow .15s ease; }
.gs-inv-opt:hover { border-color: var(--color-coral); box-shadow: 0 6px 18px -12px rgba(52, 52, 52, .35); }
.gs-inv-opt:focus-visible { outline: 2px solid var(--color-coral); outline-offset: 2px; }
.gs-inv-opt b { display: block; font-size: 0.9375rem; font-weight: 600; }
.gs-inv-opt small { display: block; margin-top: 0.125rem; font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.gs-inv-opt > svg { width: 1.125rem; height: 1.125rem; color: var(--color-ink-subtle); }
.gs-inv-i { display: grid; place-items: center; width: 2.5rem; height: 2.5rem; border-radius: 0.625rem; background: var(--color-light-beige); }
.gs-inv-i svg { width: 1.25rem; height: 1.25rem; }
.gs-inv-done ul { list-style: none; margin: 0.5rem 0 0; padding: 0; display: grid; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.gs-inv-done li { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem; }
.gs-inv-done li + li { border-top: 1px solid var(--color-line); }
.gs-inv-done b { display: block; font-size: 0.875rem; font-weight: 600; }
.gs-inv-done small { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.gs-inv-ok { flex: none; display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--color-graphite); color: #fff; }
.gs-inv-ok svg { width: 0.75rem; height: 0.75rem; }
.gs-inv-n { display: inline-grid; place-items: center; min-width: 1.375rem; height: 1.375rem; margin-left: 0.25rem; padding: 0 0.375rem; border-radius: 9999px; background: var(--color-mid-beige); font-size: 0.75rem; }
.gs-inv-done .gs-hint { margin-top: 0.5rem; }
@media (prefers-reduced-motion: reduce) { .gs-dock.intake { transition: none; } }
.gs-tour .eyebrow { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.gs-tour-bar { list-style: none; margin: 0.75rem 0 0; padding: 0; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 0.375rem; }
.gs-tour-bar li { display: grid; gap: 0.375rem; font-size: 0.75rem; line-height: 1.25; color: var(--color-ink-subtle); }
.gs-tour-bar li span { height: 4px; border-radius: 2px; background: var(--color-line); }
.gs-tour-bar li.is-done span { background: var(--color-graphite); }
.gs-tour-bar li.is-on span { background: var(--color-coral); }
.gs-tour-bar li.is-on { font-weight: 600; color: var(--color-ink); }
/* the other steps: a click away, to move faster than step by step */
.gs-tour-bar button { display: grid; gap: 0.375rem; width: 100%; padding: 0 0 0.125rem; border: 0; background: none; font: inherit; color: inherit; text-align: left; cursor: pointer; }
.gs-tour-bar button:hover, .gs-tour-bar button:focus-visible { color: var(--color-ink); }
.gs-tour-bar button:hover em { text-decoration: underline; text-underline-offset: 2px; }
.gs-tour-bar li:not(.is-done) button:hover span { background: var(--color-sand-400); }
.gs-tour-bar li.is-soon span { background: repeating-linear-gradient(90deg, var(--color-line) 0 6px, transparent 6px 10px); }
.gs-tour-bar li.is-soon { opacity: .75; }
.gs-tour-l { display: flex; flex-wrap: wrap; align-items: center; gap: 0.25rem 0.375rem; font-style: normal; }
.gs-tour-bar .cm-soon { height: 1rem; padding: 0 0.3125rem; font-size: 0.5rem; }
.gs-sec .cm-soon { margin-left: 0.375rem; }
.gs-in-steps span.cm-soon { width: auto; height: 1.25rem; background: var(--color-mid-beige); font-size: 0.625rem; color: var(--color-ink-muted); }
.gs-facts-f { display: grid; gap: 1.75rem; }
.gs-fsec .gs-lh { margin-bottom: 0.875rem; }
.gs-err { font-size: 0.8125rem; color: var(--color-critical); }
.gs-dock .gs-facts-f .cpf { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.gs-note { margin-bottom: 0.75rem; padding: 0.625rem 0.875rem; border-radius: 0.5rem; background: var(--color-coral-tint, #f9e7e3); font-size: 0.875rem; line-height: 1.5; color: var(--color-ink); }
.gs-conf { margin-bottom: 0.75rem; font-size: 0.8125rem; line-height: 1.5; color: var(--color-ink-subtle); }
button.gs-rej:hover { border-color: var(--color-coral-deep); color: var(--color-coral-deep); }
@media (max-width: 40rem) { .gs-dock.intake { width: 100vw; border-left: 0; } .gs-tour-bar li { font-size: 0; gap: 0; } }
@media (prefers-reduced-motion: reduce) { .gs-dock.intake { animation: none; } .gs-in-alma { transition: none; } }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';
  const SPIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';
  // her figure: the one the page already shows
  const almaHtml = () => { const s = document.querySelector('#empty .alma-media, .alma-media'); return s ? s.innerHTML : ''; };

  // ---- the overlay, for one section ----------------------------------------------------------------
  let wrap = null;
  // the onboarding's panel folded to a rail on the right, as the side menu folds: the steps still
  // there, the page in full view; the rail (or its button) opens it again
  const tuck = (on) => {
    if (!wrap) return;
    const rail = wrap.querySelector('.gs-rail'), inner = wrap.querySelector('.intake-inner'); if (!rail) return;
    wrap.classList.toggle('is-tucked', on); inner.inert = on; rail.hidden = !on;
    const f = on ? rail.querySelector('.gs-fold') : wrap.querySelector('[data-tuck]'); if (f) f.focus();
  };
  // the onboarding's panel: its steps across the top, and the same steps down the rail when folded
  const CHECK_I = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7"/></svg>';
  const tourRail = (tour) => `<nav class="gs-rail" aria-label="Setting up your company" hidden>
        <button type="button" class="gs-fold" data-untuck aria-label="Show the setup panel" title="Show the panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 17l-5-5 5-5M11 17l-5-5 5-5"/></svg></button>
        <ol>${tour.bar.map((b, i) => `<li class="${b.on ? 'is-on' : b.soon ? 'is-soon' : b.done ? 'is-done' : ''}"><button type="button" data-untuck title="${esc(b.l)}${b.soon ? ' (coming soon)' : ''}" aria-label="${esc(b.l)}${b.done && !b.on ? ', done' : ''}. Show the setup panel"${b.on ? ' aria-current="step"' : ''}>${b.done && !b.on ? CHECK_I : i + 1}</button></li>`).join('')}</ol>
        <button type="button" class="gs-rail-t" data-untuck>Set up ${called()} &middot; Step ${tour.at + 1} of ${tour.count}</button>
      </nav>`;
  const tourHead = (tour) => `<header class="gs-tour">
          <div class="gs-tour-t"><span class="eyebrow">Set up ${called()} &middot; Step ${tour.at + 1} of ${tour.count}</span><span class="gs-tour-acts"><button class="link-btn" type="button" data-close="end">Skip setup</button><button type="button" class="gs-fold" data-tuck aria-label="Hide the setup panel" title="Hide the panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17l5-5-5-5M13 17l5-5-5-5"/></svg></button></span></div>
          <ol class="gs-tour-bar" aria-label="Setting up your company">${tour.bar.map((b) => { const in_ = `<span></span><em class="gs-tour-l">${esc(b.l)}${b.soon ? SOON.badge : ''}</em>`; return `<li class="${b.on ? 'is-on' : b.soon ? 'is-soon' : b.done ? 'is-done' : ''}"${b.on ? ' aria-current="step"' : ''}${b.soon ? ' aria-disabled="true"' : ''}>${b.on || b.soon ? in_ : `<button type="button" data-close="go:${b.a}" aria-label="Go to ${esc(b.l.toLowerCase())}${b.done ? ', done' : ''}">${in_}</button>`}</li>`; }).join('')}</ol>
        </header>`;
  const open = (area, opts = {}) => {
    if (wrap || !AREA[area]) return;
    const docs = asks(area).filter((d) => !(opts.skip || []).includes(d.code));
    if (!docs.length) return;
    const A = AREA[area];
    const st = saved.areas[area] = Object.assign({ step: 1, reviewed: false, pending: [], kept: [] }, saved.areas[area] || {});
    if (!st.pending) st.pending = []; if (!st.kept) st.kept = [];
    let changedAny = false;
    const FLAGGED = (docs.filter((d) => !/no expiry/i.test(d.expiryRule || '')).pop() || {}).code;
    // the company's own tax number: sign-up's, else the one on its tax card
    const ownTax = () => (taxNo || String((saved.files['CO-02'] || {}).ref || '')).replace(/\D/g, '');
    const fmtTax = (v) => (profile.country === 'PT' ? String(v).replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') : String(v));
    // a document for another company: its VAT number isn't this one's. Prototype: a nine-digit number
    // in the file's name that isn't the company's, or "other" in it (a made-up one, then)
    const otherVat = (d, name) => {
      const own = ownTax(), m = String(name).replace(/[\s.-]/g, '').match(/\d{9}/), seen = m && m[0];
      if (d.code === 'CO-02' && !taxNo) return null; // the tax card is where the number comes from
      if (seen && own && seen !== own) return seen;
      if (/\b(other|outra|outro)\b/i.test(String(name).replace(/[_-]/g, ' '))) return madeUp();
      return null;
    };
    const madeUp = () => { const own = ownTax() || '516482300'; return own.slice(0, 6) + String((+own.slice(6) + 417) % 1000).padStart(3, '0'); };
    const read = (d, file) => {
      const vat = otherVat(d, file.name);
      if (vat) return Object.assign(readAs(d, file), { vat, mismatch: true, conf: 50, flag: null, ok: false });
      return readAs(d, file);
    };
    // an expiry date already past: a few weeks to a few months ago, issued a term before that
    const lapse = (d, h) => {
      const v = new Date(); v.setDate(v.getDate() - (15 + (h % 160)));
      const i = new Date(v); i.setMonth(i.getMonth() - monthsOf(d));
      return { valid: dt(v), issued: dt(i) };
    };
    const readAs = (d, file) => {
      const h = hash(d.code + file.name + org.id), now = new Date(), months = monthsOf(d);
      const issued = new Date(now); issued.setDate(now.getDate() - (months <= 4 ? 4 + (h % 24) : 30 + (h % 170)));
      let valid = 'No expiry';
      const dates = {};
      if (!/no expiry/i.test(d.expiryRule || '')) { const v = new Date(issued); v.setMonth(v.getMonth() + months); valid = dt(v); }
      // prototype: a file named as old or expired is one whose date has passed
      const old = valid !== 'No expiry' && /\b(expired?|expirad[oa]|caducad[oa]|old|antig[oa])\b/i.test(String(file.name).replace(/[_.-]/g, ' '));
      if (old) Object.assign(dates, lapse(d, h));
      const flagged = !old && docs.length > 1 && d.code === FLAGGED && valid !== 'No expiry';
      return {
        area, file: file.name, country: countryName, issued: dt(issued), valid, by: issuer(d), ref: codeOf(d, h, issued), ...dates,
        // nothing is accepted for the user: low confidence (what she couldn't read cleanly) must be,
        // before going on; medium and high may be, or go in as she read them (step2, data-confirm)
        conf: flagged ? 55 + (h % 15) : h % 4 ? 90 + (h % 9) : 78 + (h % 10), flag: flagged ? 'valid' : null, ok: false, edited: false,
      };
    };
    const tour = opts.tour; // the onboarding (tour() below): where it is, the step after this one
    // every step's buttons in one row: back on the left, the way out in the middle, on to the right
    const BACK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.83 10l3.94 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clip-rule="evenodd"/></svg>';
    // back: a label, false for one with nowhere to go (shown, but disabled), or '' for none
    const nav = (back, skip, primary) => `<div class="actions gs-nav3${skip ? '' : ' no-skip'}"><span>${back ? `<button class="link-btn gs-back" type="button" data-back>${BACK}${back}</button>` : back === false ? `<button class="link-btn gs-back" type="button" disabled>${BACK}Back</button>` : ''}</span><span>${skip || ''}</span><span>${primary}</span></div>`;
    // back from the upload or the end: to the step before in the onboarding; the first has none
    const backFrom1 = tour ? tour.back || false : '';
    const STEPS = [['Upload', `Your ${A.what}`], ['Review', 'Check what ALMA read'], ['Complete', `How complete ${A.title} is`]];

    wrap = document.createElement('div');
    wrap.className = 'intake over-page gs'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'gs-title');
    if (tour) wrap.classList.add('gs-dock');
    if (tour && tour.quiet) wrap.classList.add('is-quiet'); // one step after another: the panel stays put
    wrap.innerHTML = `${tour ? tourRail(tour) : ''}<div class="intake-inner">${tour ? tourHead(tour) : ''}<div class="intake-screen alma-ask">
        <ol class="gs-steps" id="gs-steps" aria-label="${A.title} documents"></ol>
        <div id="gs-body"></div>
        <input id="gs-file" type="file" multiple hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.heic">
      </div></div>`;
    document.body.appendChild(wrap);
    if (!tour) document.documentElement.classList.add('intake-open'); // docked, the homepage can still be scrolled
    const $ = (id) => wrap.querySelector('#' + id);
    const alma = almaHtml;
    let target = null, editing = null, rejected = [];
    const whyDraft = {}; // the reason typed for approving a different VAT number, kept across repaints
    const held = {}; // the files themselves, by name, until each is filed (then js/doc-files.js keeps it); kept there
    // as '~name' too from the moment they're dropped, so a reload before she reads them doesn't lose them

    const filed = () => docs.filter((d) => saved.files[d.code]);
    const confirmed = () => docs.filter((d) => (saved.files[d.code] || {}).ok);
    const pct = () => Math.round((confirmed().length / docs.length) * 100);
    // her confidence: how sure she is she read the document right, as a level, never a number
    const confTag = (f) => { const [b, c] = f.conf >= 90 ? ['High', 'b-ok'] : f.conf >= 75 ? ['Medium', 'b-pend'] : ['Low', 'b-over']; return `<span class="co-badge ${c}" title="How sure ALMA is that she read it right">${b} confidence</span>`; };
    const reached = (i) => i === 0 || (i === 1 && filed().length > 0) || (i === 2 && !!st.reviewed);
    const paintSteps = () => {
      const at = st.step - 1;
      $('gs-steps').style.setProperty('--done', `${(at / 2) * 100}%`);
      $('gs-steps').innerHTML = STEPS.map(([l, s], i) => {
        const done = i < at || (i === 2 && st.step === 3 && pct() === 100);
        return `<li class="${i === at && !done ? 'is-on' : done ? 'is-done' : ''}"${i === at ? ' aria-current="step"' : ''}><button type="button" data-step="${i + 1}"${reached(i) && i !== at ? '' : ' disabled'}><span class="gs-node">${done ? OK : i + 1}</span><span class="gs-lbl">${l}</span><span class="gs-sub">${s}</span></button></li>`;
      }).join('');
    };
    const sec = `<span class="gs-sec">Documents &rsaquo; ${A.sec || A.title}${soon(area)}</span>`;

    // step 1: what she's asking for, and the files added — two lists, not matched to each other yet
    const step1 = () => {
      const n = docs.length, read = filed(), np = st.pending.length;
      const asked = docs.map((d, i) => {
        // a long list (Company documents) is read by section
        const head = docs.length > 8 && (i === 0 || docs[i - 1].section.en !== d.section.en) ? `<li class="gs-grp">${esc(d.section.en)}</li>` : '';
        // a requirement, not a to-do: no box to tick, the catalog's requirement instead; and just its
        // name (what it's called locally, or which file it was read from, isn't needed here)
        return `${head}<li class="gs-req"><span><span class="gs-n">${esc(d.name.en)}</span></span><span class="co-badge ${d.requirement === 'mandatory' ? 'b-info' : 'b-neu'}">${esc(DM.LBL.requirement[d.requirement] || '')}</span></li>`;
      }).join('');
      const files = st.pending.map((name, i) => `<li><span class="gs-ic is-file">${FILE}</span><span><span class="gs-n">${esc(name)}</span><span class="gs-d">Not read yet</span></span><button class="link-btn" type="button" data-unpend="${i}">Remove</button></li>`)
        .concat(read.map((d) => `<li class="is-in"><span class="gs-ic">${FILE}</span><span><span class="gs-n">${esc(saved.files[d.code].file)}</span><span class="gs-d">Read as ${esc(d.name.en)}</span></span><span></span></li>`))
        .concat(st.kept.map((name) => `<li><span class="gs-ic is-file">${FILE}</span><span><span class="gs-n">${esc(name)}</span><span class="gs-d">Kept &middot; not one of the documents asked for here</span></span><span></span></li>`)).join('');
      const total = np + read.length + st.kept.length;
      return `${sec}<button class="drop is-small" id="gs-drop" type="button" aria-label="Add files"><span class="alma-media" aria-hidden="true">${alma()}</span>
          <span class="drop-hint"><span class="wide">Drop them on me</span><span class="narrow">Tap to add</span>${tour ? '<small>PDF or photo, as many as you have.</small>' : ''}</span></button>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">${total ? `${total} file${total === 1 ? '' : 's'} so far, <span class="soft">add more or carry on.</span>` : `Your ${A.what}, <span class="soft">all at once.</span>`}</h1>
        <p class="lead">${A.who.replace('WHO', called()).replace('WHERE', where).replace(/\bN\b/, n)} Drop your files on me, as many as you have. I&rsquo;ll read them and tell you which is which.</p>
        <div class="gs-pane gs-two">
          <section><p class="gs-lh" role="heading" aria-level="2">What I&rsquo;m asking for <span>${n}</span></p><ul class="gs-list" aria-label="Documents asked for">${asked}</ul></section>
          <section><p class="gs-lh" role="heading" aria-level="2">Your files <span>${total}</span></p>${total ? `<ul class="gs-list" aria-label="Your files">${files}</ul>` : '<p class="gs-none">No files yet. Drop them on me above, or <button class="link-btn" type="button" data-browse>choose them on your device</button>.</p>'}</section>
        </div>
        ${nav(backFrom1, `<button class="link-btn" type="button" data-close="${tour ? 'next' : ''}">${tour && tour.next ? 'Skip this step' : 'I&rsquo;ll do it later'}</button>`,
          `<button class="btn btn-primary" type="button" data-go="2"${np || read.length ? '' : ' disabled'}>Upload documents</button>`)}`;
    };

    // step 2: what she read, to accept or put right
    const FIELDS = [['country', 'Country'], ['by', 'Issued by'], ['ref', 'Reference'], ['issued', 'Issue date'], ['valid', 'Valid until']];
    // expired: the date read has passed. It needs a new one if it's still in force, or none (the
    // date not applicable), or a current version of the file, before it can be accepted
    const lapsed = (f) => !!f && !f.validNa && !Number.isNaN(Date.parse(f.valid)) && Date.parse(f.valid) < new Date().setHours(0, 0, 0, 0);
    const isoOf = (v) => { const t = Date.parse(v); if (Number.isNaN(t)) return ''; const x = new Date(t); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    const expBlock = (d, f) => {
      if (editing === d.code || (!lapsed(f) && !f.validNa)) return '';
      return `${lapsed(f) ? `<p class="gs-why">This document expired on <b>${esc(f.valid)}</b>. If it&rsquo;s still in force, give it its new expiry date. If it has none, mark the date not applicable. Or replace it with a current version.</p>` : ''}
        <div class="gs-exp-f">${lapsed(f) ? `<label>New expiry date<input type="date" data-newexp="${d.code}" value="${isoOf(f.valid)}"></label>` : ''}<label class="gs-exp-na"><input type="checkbox" data-expna="${d.code}"${f.validNa ? ' checked' : ''}>Expiry date not applicable</label></div>`;
    };
    // editing what she read: a date can also be not applicable (the box empties and locks it; untick
    // it and the date it had comes back)
    const DATES = ['issued', 'valid'];
    const editField = (d, f, k, l) => {
      const na = f[k] === 'Not applicable';
      if (!DATES.includes(k)) return `<input name="${k}" value="${esc(f[k])}" aria-label="${l}">`;
      return `<input type="date" name="${k}" value="${na ? '' : isoOf(f[k])}" aria-label="${l}"${na ? ' disabled' : ''}>
        <label class="gs-fna"><input type="checkbox" data-fna="${k}"${na ? ' checked' : ''}>Not applicable</label>`;
    };
    const card = (d) => {
      const f = saved.files[d.code], ed = editing === d.code, ex = lapsed(f);
      const flagged = f.flag && !f.edited;
      if (!f.country) f.country = countryName;
      const label = (k, l) => (k === 'ref' && CODE_LABEL[d.code] ? CODE_LABEL[d.code].replace(/^./, (c) => c.toUpperCase()) : l);
      const fields = FIELDS.map(([k, l0]) => [k, label(k, l0)]).map(([k, l]) => `<div class="${(flagged && f.flag === k) || (ex && k === 'valid') ? 'is-flag' : ''}"><dt>${l}</dt><dd>${ed ? editField(d, f, k, l) : esc(f[k])}</dd></div>`).join('');
      // another company's VAT number: upload the right one, reject it, or approve it, saying why
      if (f.mismatch && !ed) {
        const who = called(), own = ownTax(), why = whyDraft[d.code] != null ? whyDraft[d.code] : f.vatReason || '';
        return `<article class="gs-card is-vat${f.ok ? ' is-ok' : ''}" data-card="${d.code}">
        <header><div><h3><button type="button" class="gs-peek" data-peek="${d.code}">${esc(d.name.en)}</button></h3><p class="gs-d">${esc(f.file)}${local(d) ? ' &middot; ' + esc(local(d)) : ''}</p></div>${f.ok ? '<span class="co-badge b-neu">Approved by you</span>' : '<span class="co-badge b-over">Different VAT number</span>'}</header>
        <dl class="gs-fields"><div class="is-flag"><dt>VAT number</dt><dd>${esc(fmtTax(f.vat))}</dd></div>${own ? `<div><dt>${esc(who.replace(/^./, (c) => c.toUpperCase()))}&rsquo;s</dt><dd>${esc(fmtTax(own))}</dd></div>` : ''}${fields}</dl>
        ${f.ok ? `<p class="gs-vat-ok">Approved with a different VAT number. Your reason: &ldquo;${esc(f.vatReason)}&rdquo;</p>`
          : `<p class="gs-why">This document is for VAT number <b>${esc(fmtTax(f.vat))}</b>${own ? `, not ${who}&rsquo;s (${esc(fmtTax(own))})` : ', not the one on your other documents'}. Upload the right one, or reject it. If it does belong here, approve it and say why.</p>
          <div class="gs-vat-f"><label for="gs-why-${d.code}">Why it belongs here <span>Needed to approve</span></label><input id="gs-why-${d.code}" data-why="${d.code}" value="${esc(why)}" maxlength="240" placeholder="e.g. It&rsquo;s our NIPC before the 2024 merger" autocomplete="off"></div>`}
        ${f.ok ? '' : expBlock(d, f)}
        <footer><span><button class="link-btn" type="button" data-peek="${d.code}">Preview</button><button class="link-btn" type="button" data-edit="${d.code}">Make changes</button><button class="link-btn" type="button" data-one="${d.code}">Upload a new document</button></span>
          <span>${f.ok ? `<button class="link-btn" type="button" data-unaccept="${d.code}">Undo</button><span class="gs-acc is-ok">${OK}Approved</span>` : `<button class="gs-acc gs-rej" type="button" data-reject="${d.code}">${NO}Reject</button><button class="gs-acc" type="button" data-approve="${d.code}"${why.trim() && !ex ? '' : ' disabled'}>${OK}Approve</button>`}</span></footer>
      </article>`;
      }
      return `<article class="gs-card${f.ok ? ' is-ok' : ''}${ed ? ' is-editing' : ''}${ex ? ' is-expired' : ''}" data-card="${d.code}">
        <header><div><h3><button type="button" class="gs-peek" data-peek="${d.code}">${esc(d.name.en)}</button></h3><p class="gs-d">${esc(f.file)}${local(d) ? ' &middot; ' + esc(local(d)) : ''}</p></div>${ex ? '<span class="co-badge b-over">Expired</span>' : f.edited ? '<span class="co-badge b-neu">Corrected by you</span>' : confTag(f)}</header>
        <dl class="gs-fields">${fields}</dl>
        ${expBlock(d, f)}
        ${flagged && !ex ? `<p class="gs-why">I couldn&rsquo;t read the expiry date cleanly: the scan is cut off there. I&rsquo;ve put ${esc(f.valid)}; check it against the file.</p>` : ''}
        <footer><span>${ed ? '' : `<button class="link-btn" type="button" data-peek="${d.code}">Preview</button><button class="link-btn" type="button" data-edit="${d.code}">Make changes</button><button class="link-btn" type="button" data-one="${d.code}">Replace file</button>`}</span>
          <span>${ed ? `<button class="link-btn" type="button" data-cancel>Cancel</button><button class="gs-acc" type="button" data-save="${d.code}">${OK}Save changes</button>`
            : f.ok ? `<button class="link-btn" type="button" data-unaccept="${d.code}">Undo</button><span class="gs-acc is-ok">${OK}Accepted</span>` : `<button class="gs-acc gs-rej" type="button" data-reject="${d.code}">${NO}Reject</button><button class="gs-acc" type="button" data-accept="${d.code}"${ex ? ' disabled title="Give it a new expiry date, or mark the date not applicable"' : ''}>${OK}Accept</button>`}</span></footer>
      </article>`;
    };
    // what must be accepted (or rejected, or replaced) before going on: low confidence, or another
    // company's VAT number
    const mustCheck = (f) => f.conf < 75 || f.mismatch || lapsed(f);
    const step2 = () => {
      // the low-confidence ones, the only ones waiting on the user, first
      const key = (d) => (lapsed(saved.files[d.code]) && !saved.files[d.code].ok ? -1 : saved.files[d.code].conf); // expired first
      const list = filed().slice().sort((a, b) => key(a) - key(b)), left = list.filter((d) => !saved.files[d.code].ok).length;
      // one with another company's VAT number isn't in Accept all: it needs its own reason; nor is an expired one
      const vat = list.filter((d) => saved.files[d.code].mismatch && !saved.files[d.code].ok).length;
      const exN = list.filter((d) => !saved.files[d.code].ok && !saved.files[d.code].mismatch && lapsed(saved.files[d.code])).length, plain = left - vat - exN;
      const needs = list.filter((d) => !saved.files[d.code].ok && mustCheck(saved.files[d.code])).length;
      const all = editing != null ? '' : plain ? `<button class="gs-acc" type="button" data-accept-all>${OK}Accept ${vat ? 'the rest' : 'all'}</button>` : left ? '' : `<button class="gs-acc" type="button" data-unaccept-all>Unaccept all</button>`;
      return `${sec}<span class="gs-mini" aria-hidden="true"><span class="alma-media">${alma()}</span></span>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">Here&rsquo;s what I read. <span class="soft">Does it look right?</span></h1>
        <p class="lead">${needs ? `${needs === 1 ? 'One needs' : `${needs} need`} you before you continue: check ${needs === 1 ? 'it' : 'them'} and accept, change or reject.` : left ? 'Nothing needs you before you continue.' : 'You&rsquo;ve accepted them all.'}${left - needs > 0 ? ` Accept the others if they look right, or leave them: they go into ${A.sec || A.title} as I read them.` : ` Once you continue, they go into ${A.sec || A.title}.`}</p>
        <div class="gs-pane">${exN ? `<p class="gs-note" role="status">${exN === 1 ? 'One document has' : `${exN} documents have`} expired. Give ${exN === 1 ? 'it' : 'each'} its new expiry date if still in force, mark the date not applicable, or replace ${exN === 1 ? 'it' : 'them'} with a current version.</p>` : ''}${vat ? `<p class="gs-note" role="status">${vat === 1 ? 'One document has' : `${vat} documents have`} a VAT number that isn&rsquo;t ${called()}&rsquo;s. Upload the right ${vat === 1 ? 'one' : 'ones'}, reject ${vat === 1 ? 'it' : 'them'}, or approve ${vat === 1 ? 'it' : 'each'} with a reason.</p>` : ''}${rejected.length ? `<p class="gs-note" role="status">You rejected ${rejected.map((x) => `<b>${esc(x)}</b>`).join(', ')}. <button class="link-btn" type="button" data-go="1">Upload ${rejected.length === 1 ? 'another file for it' : 'other files for them'}</button></p>` : ''}
          <p class="gs-conf">Low confidence needs you; medium and high are up to you. Open any one to see what I read, field by field, with where I read it.</p>
          <div class="gs-bar"><span>${list.length - left} of ${list.length} accepted</span>${all}</div>
          <div class="gs-cards">${list.map(card).join('')}</div>
          ${list.length > 1 && plain ? `<div class="gs-bar gs-bar-end"><span>${list.length - left} of ${list.length} accepted</span>${all}</div>` : ''}</div>
        ${nav('Back to upload', tour ? `<button class="link-btn" type="button" data-close="next">${tour.next ? 'Skip this step' : 'I&rsquo;ll do it later'}</button>` : '',
          `<button class="btn btn-primary" type="button" data-confirm${list.length && !needs && editing == null ? '' : ' disabled'}>Continue</button>`)}
        ${needs ? `<p class="gs-d gs-hint">Check ${needs === 1 ? 'the document' : `the ${needs} documents`} marked low confidence${vat ? ', with a different VAT number' : ''}${exN ? ' or expired' : ''} to continue.</p>` : ''}`;
    };

    // Registration, between the review and the end: who the company is, as its registration
    // documents say (the Certidão Permanente: name, legal form, address, activity codes; the Cartão
    // de Pessoa Coletiva: name and tax number), with what sign-up said (country, tax number) and
    // what no document says (size, group), for the person to check. It is the company's profile in
    // Settings (js/co-profile.js). Prototype: what she "reads" is made up, the same for a company each time.
    const FACTS = area === 'registration' && !!window.CO_PROFILE;
    let draft = null, factsErr = null;
    const facts = () => {
      const CP = window.CO_PROFILE, base = CP.load(), p = JSON.parse(JSON.stringify(base)), src = {}, h = hash(org.id + (base.tax || taxNo));
      const okF = (c) => ((saved.files[c] || {}).ok ? docs.find((d) => d.code === c) : null);
      const accepted = docs.filter((d) => (saved.files[d.code] || {}).ok);
      // the registry certificate (elsewhere, the first registration document that isn't the tax card)
      const cert = okF('CO-01') || (profile.country !== 'PT' ? accepted.find((d) => d.code !== 'CO-02') : null), card = okF('CO-02');
      const nm = (d) => local(d) || d.name.en;
      if (base.country) src.country = 'sign-up';
      if (base.tax) src.tax = 'sign-up';
      else if (card) { p.tax = String(saved.files['CO-02'].ref).replace(/\s/g, ''); src.tax = nm(card); }
      const named = base.name && !['Your company', 'New company'].includes(base.name); // not named yet: the test user's, or one just added
      if (cert || card) {
        p.name = named ? base.name : ['Atlântico Obras, Lda.', 'Douro Engenharia e Construção, Lda.', 'Serra & Filhos Construções, Lda.', 'Ribeira Técnica, S.A.', 'Minho Montagens, Lda.'][h % 5];
        src.name = nm(cert || card);
      }
      if (cert) {
        if (!p.form) p.form = /\bS\.?A\.?$/.test(p.name) ? 'public' : /\bLda\.?$/.test(p.name) ? 'private' : '';
        if (p.form) src.form = nm(cert);
        if (profile.country === 'PT' && !base.street) {
          [p.street, p.postcode, p.city, p.region] = [['Rua de Santa Catarina 214', '4000-447', 'Porto', 'Porto'], ['Avenida da Boavista 1180', '4100-113', 'Porto', 'Porto'], ['Rua Augusta 85', '1100-048', 'Lisboa', 'Lisboa'], ['Avenida da Liberdade 245', '1250-143', 'Lisboa', 'Lisboa'], ['Rua do Brasil 60', '3030-175', 'Coimbra', 'Coimbra']][h % 5];
          ['street', 'postcode', 'city', 'region'].forEach((k) => { src[k] = nm(cert); });
        }
        if (CP.isEU(p.country) && !(base.cae || []).length) {
          p.cae = profile.sector === 'construction' || !org.sector ? ['41200 · Construction of residential and non-residential buildings', h % 2 ? '43210 · Electrical installation' : '42110 · Construction of roads and motorways']
            : ['46900 · Non-specialised wholesale trade', '49410 · Freight transport by road'];
          src.cae = nm(cert);
          const secs = [...new Set(p.cae.map((c) => CP.sectorOfCode(c)))];
          // every sector its codes are in, and in each, the subsectors they name
          if (!base.sectors) { p.sectors = secs.join(','); p.subsectors = CP.subsOfCae(p.cae, secs).join(','); src.sectors = nm(cert); }
          else if (!base.subsectors) p.subsectors = CP.subsOfCae(p.cae, base.sectors.split(',')).join(',');
        }
      }
      if (base.structure) src.structure = 'sign-up';
      return { p, src };
    };
    const SECS = ['identification', 'location', 'activity', 'size', 'structure'];
    const stepFacts = () => {
      const { p, src } = facts(), v = Object.assign(p, draft || {});
      const read = Object.keys(src).filter((k) => src[k] !== 'sign-up').length;
      return `${sec}<span class="gs-mini" aria-hidden="true"><span class="alma-media">${alma()}</span></span>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">This is your company, <span class="soft">as your documents say. Is it right?</span></h1>
        <p class="lead">${read ? 'I&rsquo;ve filled in what your documents say, marked with where I read it.' : 'Your documents didn&rsquo;t say much about the company itself.'} Check it, and add what they don&rsquo;t say${v.structure ? ': how big the company is' : ': how big the company is and whether it&rsquo;s part of a group'}. It becomes the company&rsquo;s profile, which you can change any time in Settings.</p>
        <form class="gs-pane gs-facts-f" id="gs-facts" novalidate>${SECS.map((k) => `<section class="gs-fsec"><p class="gs-lh" role="heading" aria-level="2">${CO_PROFILE.SECTIONS[k].title}</p>${CO_PROFILE.section(k, v, src)}</section>`).join('')}</form>
        ${nav('Back to review', '', '<button class="btn btn-primary" type="button" data-facts>Confirm details</button>')}`;
    };
    const confirmFacts = () => {
      const root = $('gs-facts'), v = CO_PROFILE.collect(root), bad = CO_PROFILE.check(v, true);
      if (bad) {
        factsErr = bad; draft = v; paint();
        // what's wrong, under the field itself
        const i = $('gs-facts').querySelector(`[data-k="${bad[1]}"]`);
        if (i) { i.classList.add('is-bad'); (i.closest('.cpf-f') || i.parentNode).insertAdjacentHTML('beforeend', `<p class="gs-err" role="alert">${esc(bad[0])}</p>`); i.focus(); i.scrollIntoView({ block: 'center' }); }
        return;
      }
      const { p, src } = facts(), out = Object.assign(p, v);
      if (src.tax && src.tax !== 'sign-up') out.tax = p.tax; // read off the tax card: the field shows it, locked
      CO_PROFILE.save(out);
      // a company added in this session takes the name and sector it has now, in the side menu's
      // list too, and what it's asked for next follows its sector
      if (org.id !== 'home') {
        const SEC = { F: 'Construction', C: 'Industry', G: 'Retail', J: 'Technology', H: 'Transport and logistics', N: 'Services' };
        const KEY = 'cm-orgs-' + O.persona;
        try {
          const list = JSON.parse(localStorage.getItem(KEY) || '[]'), o = list.find((x) => x.id === org.id);
          if (o) { Object.assign(o, { name: out.name, trading: out.trading, sector: SEC[out.sector] || 'Other' }); localStorage.setItem(KEY, JSON.stringify(list)); Object.assign(org, o); Object.assign(profile, DM.profileOf(org)); }
        } catch (er) {}
      }
      st.factsDone = true; st.sub = null; draft = null; factsErr = null; st.reviewed = true;
      nameOf = confirmedName() || nameOf;
      goStep(3); identity(); if (tour && tour.refresh) tour.refresh();
    };

    // step 3: how complete the section is
    const step3 = () => {
      const p = pct(), missing = docs.filter((d) => !(saved.files[d.code] || {}).ok);
      if (p === 100) {
        return `${sec}<div class="gs-meter is-full"><div><b>100%</b><span>complete</span></div></div>
          <p class="says">ALMA</p>
          <h1 id="gs-title" tabindex="-1">${area === 'registration' ? `${esc(nameOf.replace(/\.$/, ''))} is registered <span class="soft">on C&#8209;MORE.</span>` : `${A.title} is complete, <span class="soft">${esc(nameOf.replace(/\.$/, ''))}.</span>`}</h1>
          <p class="lead">Every one of your ${A.what} is in, checked and in Documents. I&rsquo;ll tell you when one is about to expire, and when a client asks for more.</p>
          ${nav(backFrom1, tour && tour.next ? '<button class="link-btn" type="button" data-close="end">Skip for now</button>' : '',
            `<button class="btn btn-primary" type="button" data-close="next">${tour ? (tour.next ? `Next: ${tour.next}` : 'Go to my company') : opts.doneLabel || (document.querySelector('#empty') ? 'Go to my company' : `Go to ${A.title}`)}</button>`)}`;
      }
      const rows = missing.map((d) => `<li><span class="gs-ic"></span><span><span class="gs-n">${esc(d.name.en)}</span></span><button class="link-btn" type="button" data-one="${d.code}">Add</button></li>`).join('');
      const one = missing.length === 1;
      return `${sec}<div class="gs-meter" style="--p:${p}"><div><b>${p}%</b><span>complete</span></div></div>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">${A.title} is ${p}% complete.</h1>
        <p class="lead">${docs.every((d) => d.requirement === 'optional') ? `None of these is required. ${one ? 'One more' : `${missing.length} more`} you could add, whenever you have ${one ? 'it' : 'them'}.` : `${one ? 'One document is' : `${missing.length} documents are`} still missing here.`} Drop ${one ? 'it' : 'them all'} on me and I&rsquo;ll read ${one ? 'it' : 'them'}, or add ${one ? 'it' : 'them one by one'} below.</p>
        <div class="gs-pane"><button class="drop is-small gs-drop-wide" id="gs-drop" type="button" aria-label="Add the missing files"><span class="alma-media" aria-hidden="true">${alma()}</span>
            <span class="drop-hint"><span class="wide">Drop ${one ? 'it' : 'them'} on me</span><span class="narrow">Tap to add</span><small>${one ? 'PDF or photo. I&rsquo;ll read it and check it.' : 'All the missing ones at once. I&rsquo;ll tell you which is which.'}</small></span></button>
          <ul class="gs-list gs-missing" aria-label="Still missing">${rows}</ul></div>
        ${nav(backFrom1, `<button class="link-btn" type="button" data-close="next">${tour && tour.next ? `Skip to ${tour.next.toLowerCase()}` : 'Skip for now'}</button>`,
          `<button class="btn btn-primary" type="button" data-more>Add ${one ? 'it' : 'them'} now</button>`)}`;
    };

    // between upload and review: she reads each file and checks it at the source
    let checking = null;
    const unchecked = () => filed().filter((d) => !saved.files[d.code].checked);
    // reading: each file added goes to the document it turns out to be; one that isn't among them is kept
    const assign = () => {
      // first the files she recognises by name, then the rest in order; what's left over is kept
      const openDocs = docs.filter((d) => !saved.files[d.code]), extra = [], later = [];
      const give = (name, d) => { openDocs.splice(openDocs.indexOf(d), 1); saved.files[d.code] = read(d, { name }); if (window.CMFiles) (held[name] ? Promise.resolve(held[name]) : window.CMFiles.get('~' + name).then((r) => r && r.blob)).then((file) => file && window.CMFiles.put(d.code, file)); };
      st.pending.forEach((name) => { const d = openDocs.length && match({ name }, openDocs); if (d && WORDS(d).some((w) => fold(name).includes(w))) give(name, d); else later.push(name); });
      later.forEach((name) => { if (openDocs.length) give(name, openDocs[0]); else extra.push(name); });
      // the test user (register.html): every batch of files has one with another company's VAT
      // number, so the check always shows. Not the tax card, where the number comes from, and not a
      // single file sent to replace one, so uploading a new document can put it right
      if (O.test) {
        const fresh = docs.filter((d) => saved.files[d.code] && !saved.files[d.code].checked && st.pending.includes(saved.files[d.code].file));
        const pick = fresh.filter((d) => d.code !== 'CO-02').pop();
        if (pick && !fresh.some((d) => saved.files[d.code].mismatch)) Object.assign(saved.files[pick.code], { vat: madeUp(), mismatch: true, conf: 50, flag: null, ok: false });
      }
      // and in every step, one document whose expiry date has already passed, so ALMA's check always
      // shows: given a new date, its date marked not applicable, or replaced. Once a step: what's
      // added after, a current version among it, is read as it is
      if (!st.expSim) {
        const fresh = docs.filter((d) => saved.files[d.code] && !saved.files[d.code].checked && st.pending.includes(saved.files[d.code].file));
        const pick = fresh.find((d) => { const f = saved.files[d.code]; return !f.mismatch && !f.flag && f.valid !== 'No expiry' && !lapsed(f); });
        if (pick) { Object.assign(saved.files[pick.code], lapse(pick, hash(pick.code + org.id)), { conf: Math.max(saved.files[pick.code].conf, 90) }); st.expSim = true; }
        else if (fresh.some((d) => lapsed(saved.files[d.code]))) st.expSim = true; // one was already
      }
      st.pending = []; st.kept = st.kept.concat(extra); saved.extra += extra.length;
      return extra;
    };
    const checks = (extra) => unchecked().map((d) => {
      const f = saved.files[d.code];
      if (f.mismatch) return [`${f.file} → ${d.name.en}`, `Read &middot; its VAT number, ${esc(fmtTax(f.vat))}, isn&rsquo;t ${called()}&rsquo;s. Check it next.`, d.code];
      return [`${f.file} → ${d.name.en}`, `Read &middot; ${CODE_LABEL[d.code] ? CODE_LABEL[d.code].replace(/^./, (c) => c.toUpperCase()) : 'Reference'} ${esc(f.ref)} confirmed with ${esc(f.by)}`, d.code];
    }).concat(extra.map((name) => [name, `Not one of the ${A.title.toLowerCase()} documents I asked for. I&rsquo;ve kept it in your documents.`, null]));
    const validating = () => {
      const all = checking.rows.length, done = Math.min(checking.at, all);
      const rows = checking.rows.map(([n, why, code], i) => `<li class="${i < done ? (code ? 'is-ok' : 'is-in') : i === done ? 'is-reading' : ''}"><span class="gs-ic">${i < done ? (code ? OK : FILE) : i === done ? SPIN : ''}</span><span><span class="gs-n">${esc(n)}</span><span class="gs-d">${i < done ? why : i === done ? 'Reading&hellip;' : 'Waiting'}</span></span><span></span></li>`).join('');
      return `${sec}<span class="gs-mini" aria-hidden="true"><span class="alma-media">${alma()}</span></span>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1" aria-live="polite">${done === all ? 'All read.' : 'Reading your files&hellip;'}</h1>
        <p class="lead">${done === all ? (checking.rows.some((r) => r[2]) ? 'Every document I recognised checks out with the body that issued it. Next, what I read.' : 'None of these is a document I asked for here. I&rsquo;ve kept them in your documents.') : 'I&rsquo;m reading each file, working out which document it is, and confirming its code with the body that issued it.'}</p>
        <div class="gs-pane"><ul class="gs-list" aria-label="Checks">${rows}</ul></div>`;
    };
    const validate = () => {
      rejected = [];
      const extra = assign(); keep();
      if (!unchecked().length && !extra.length) { goStep(filed().length ? 2 : 1); return; }
      checking = { rows: checks(extra), at: 0 }; editing = null; paint();
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tick = () => {
        if (!wrap) return;
        checking.at += 1; paint();
        if (checking.at < checking.rows.length) setTimeout(tick, reduced ? 150 : 650);
        else setTimeout(() => { if (!wrap) return; checking.rows.forEach((r) => { if (r[2]) saved.files[r[2]].checked = true; }); checking = null; keep(); goStep(filed().length ? 2 : 1); strip(); }, reduced ? 300 : 1300); // strip(): what she accepted herself shows on the page
      };
      setTimeout(tick, reduced ? 150 : 800);
    };

    // ---- a document from the review, in a drawer: the same parts as Documents' (.docd .cdd) --------
    const dwEl = document.createElement('div');
    dwEl.className = 'docd cdd gs-dw'; dwEl.hidden = true;
    dwEl.innerHTML = `<div class="docd-scrim" data-dwclose></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="gs-dw-t" tabindex="-1">
        <header class="docd-head"><span class="docd-ico" aria-hidden="true">${FILE}</span><div class="docd-t"><h3 id="gs-dw-t"></h3><p id="gs-dw-sub"></p></div>
          <button type="button" class="dlg-x" data-dwclose aria-label="Close the preview"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
        <div class="docd-bar"><span>The file you uploaded</span><span id="gs-dw-conf"></span></div>
        <div class="docd-body" id="gs-dw-body"></div>
        <footer class="docd-foot"><span id="gs-dw-foot"></span><span class="cdd-acts" id="gs-dw-acts"></span></footer>
      </aside>`;
    document.body.appendChild(dwEl);
    const dq = (id) => dwEl.querySelector('#' + id);
    let peek = null, peekBack = null;
    const company = esc(org.name), taxShown = taxNo.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3');
    const paintPeek = () => {
      const d = docs.find((x) => x.code === peek), f = d && saved.files[d.code];
      if (!f) { closePeek(); return; }
      const flagged = f.flag && !f.edited;
      const label = (k, l) => (k === 'ref' && CODE_LABEL[d.code] ? CODE_LABEL[d.code].replace(/^./, (c) => c.toUpperCase()) : l);
      // what she read: the holder first, then the document's own fields
      const rows = [['Holder', company, false], ['Tax number', f.mismatch ? `${esc(fmtTax(f.vat))} <span class="co-badge b-over">Not ${called()}&rsquo;s</span>` : esc(taxShown || '—'), false]].concat(FIELDS.map(([k, l]) => [label(k, l), esc(f[k]), flagged && f.flag === k]));
      const conf = (flag, i) => (f.edited ? 98 : flag ? 52 : Math.min(99, f.conf + (hash(d.code + i) % 7) - 3));
      const tag = (p) => { const [b, c] = p >= 90 ? ['High', 'b-ok'] : p >= 75 ? ['Medium', 'b-pend'] : ['Low', 'b-over']; return `<span class="co-badge ${c}">${b} confidence</span>`; };
      const read = `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><table class="cd-fields"><tbody>${rows.map(([n, v, fl], i) => `<tr class="${fl ? 'is-flag' : ''}"><td><span class="n">${n}</span></td><td>${fl ? '<span class="cdd-unread">Couldn&rsquo;t read it cleanly</span><span class="cdd-why">The scan is cut off here. I&rsquo;ve put ' + v + '. Check it against the file.</span>' : v}`
        + `<button type="button" class="esgq-src-btn" data-cite="${i}" aria-expanded="false" aria-controls="gs-cite-${i}">View citation</button></td>`
        + `<td>${tag(conf(fl, i))}</td></tr>`
        // the citation: a row of its own under the field's, the table's full width, opened in place
        + `<tr class="cdd-cite-row" id="gs-cite-${i}" hidden><td colspan="3"><figure class="esgq-src cdd-src"><figcaption><b>${esc(f.file)}</b><span>Page 1 &middot; ${/date|until/i.test(n) ? 'Validity' : /code|reference|nipc|tax/i.test(n) ? 'Identification' : 'Particulars'}</span></figcaption><blockquote>&ldquo;${n}: <mark${fl ? ' class="is-flag"' : ''}>${fl ? '[cut off at the edge of the scan]' : v}</mark>&rdquo;</blockquote><button type="button" class="esgq-src-open" data-show="${i}">Show on the page</button></figure></td></tr>`).join('')}</tbody></table></section>`;
      dq('gs-dw-t').textContent = d.name.en;
      dq('gs-dw-sub').innerHTML = `${esc(f.file)} &middot; ${esc(DM.LBL.requirement[d.requirement] || '')}`;
      dq('gs-dw-conf').innerHTML = f.edited ? '<span class="co-badge b-neu">Corrected by you</span>' : confTag(f);
      // the file itself, not a page drawn from what she read (js/doc-files.js)
      dq('gs-dw-body').innerHTML = '<div class="cmf-slot" id="gs-dw-file"></div>' + read;
      const slot = dq('gs-dw-file'), at = peek;
      const fill = (html) => { if (peek === at && slot.isConnected) slot.innerHTML = html; };
      if (!window.CMFiles) fill('');
      else window.CMFiles.get(d.code).then((r) => r || window.CMFiles.get('~' + f.file)).then((r) => fill(r ? window.CMFiles.view(r) : window.CMFiles.missing(f.file)));
      dq('gs-dw-foot').textContent = f.ok ? 'Accepted' : 'Not accepted yet';
      dq('gs-dw-acts').innerHTML = f.mismatch ? `<button class="link-btn" type="button" data-dwedit>Make changes</button>${f.ok ? `<span class="gs-acc is-ok">${OK}Approved</span>` : `<button class="gs-acc" type="button" data-dwaccept>${OK}Approve with a reason</button>`}`
        : `<button class="link-btn" type="button" data-dwedit>Make changes</button>${f.ok ? `<span class="gs-acc is-ok">${OK}Accepted</span>` : `<button class="gs-acc" type="button" data-dwaccept>${OK}Accept</button>`}`;
    };
    if (tour) dwEl.classList.add('is-under');
    const openPeek = (code) => { peekBack = document.activeElement; peek = code; dwEl.hidden = false; wrap.classList.add('has-peek'); paintPeek(); setTimeout(() => dwEl.classList.add('is-open'), 20); dwEl.querySelector('.docd-panel').focus(); };
    const closePeek = () => { if (dwEl.hidden) return; dwEl.classList.remove('is-open'); if (wrap) wrap.classList.remove('has-peek'); peek = null; setTimeout(() => { dwEl.hidden = true; }, 250); if (peekBack && peekBack.isConnected) peekBack.focus(); };
    dwEl.addEventListener('click', (e) => {
      const t = (sel) => e.target.closest(sel);
      if (t('[data-dwclose]')) { closePeek(); return; }
      // in place: repainting would reload the file above and move the scroll
      if (t('[data-cite]')) { const cb = t('[data-cite]'), row = dwEl.querySelector('#gs-cite-' + cb.dataset.cite), open = row.hidden; row.hidden = !open; cb.setAttribute('aria-expanded', String(open)); cb.textContent = open ? 'Hide citation' : 'View citation'; return; }
      if (t('[data-show]')) { const fileEl = dwEl.querySelector('#gs-dw-file'); if (fileEl) fileEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (t('[data-dwaccept]') && lapsed(saved.files[peek]) && !saved.files[peek].mismatch) { const c = peek; closePeek(); const i = wrap.querySelector(`[data-newexp="${c}"]`); if (i) { i.scrollIntoView({ block: 'center' }); i.focus({ preventScroll: true }); } return; }
      if (t('[data-dwaccept]') && saved.files[peek].mismatch) { const c = peek; closePeek(); const i = wrap.querySelector(`[data-why="${c}"]`); if (i) { i.scrollIntoView({ block: 'center' }); i.focus({ preventScroll: true }); } return; }
      if (t('[data-dwaccept]')) { saved.files[peek].ok = true; keep(); paint(); strip(); closePeek(); return; } // accepted: back to the review, where its card now shows it
      if (t('[data-dwedit]')) { const c = peek; closePeek(); editing = c; paint(); const i = wrap.querySelector(`[data-card="${c}"] .is-flag input`) || wrap.querySelector(`[data-card="${c}"] input`); if (i) i.focus(); }
    });

    let shownStep = 0;
    const paint = () => {
      paintSteps();
      const onFacts = !checking && st.step === 2 && st.sub === 'facts' && FACTS;
      $('gs-body').innerHTML = checking ? validating() : st.step === 1 ? step1() : onFacts ? stepFacts() : st.step === 2 ? step2() : step3();
      if (onFacts) CO_PROFILE.wire($('gs-facts'), () => { draft = CO_PROFILE.collect($('gs-facts')); if (factsErr) { factsErr = null; $('gs-facts').querySelectorAll('.gs-err').forEach((x) => x.remove()); } });
      // a step all done stands centred, in the panel too; one with documents missing reads top-down,
      // its ring smaller, so the missing ones and her drop zone fit above the buttons
      $('gs-body').classList.toggle('is-end', !checking && st.step === 3 && pct() === 100);
      $('gs-body').classList.toggle('is-part', !checking && st.step === 3 && pct() < 100); // centred too, top-down
      if (checking && checking.at === 0) { wrap.scrollTop = 0; $('gs-title').focus({ preventScroll: true }); }
      const at = st.step + (onFacts ? 0.5 : 0);
      if (shownStep !== at) { shownStep = at; wrap.scrollTop = 0; $('gs-title').focus({ preventScroll: true }); }
    };
    const goStep = (n) => { st.step = n; if (n !== 2) st.sub = null; editing = null; keep(); paint(); };

    // files in: they wait in "Your files" until she reads them. One given for a named document
    // (Replace in review, Add on the last step) goes straight to it and is read at once.
    const take = (files) => {
      const list = [...files]; if (!list.length) return;
      const one = target; target = null;
      if (one) { saved.files[one] = read(docs.find((x) => x.code === one), list[0]); if (window.CMFiles) window.CMFiles.put(one, list[0]); keep(); validate(); return; }
      list.forEach((file) => { held[file.name] = file; if (window.CMFiles) window.CMFiles.put('~' + file.name, file); if (!st.pending.includes(file.name)) st.pending.push(file.name); });
      keep();
      if (st.step === 3) { validate(); return; } // the missing ones, dropped at the end: read at once
      if (st.step !== 1) { goStep(1); return; }
      paint();
    };
    const browse = (code) => { target = code || null; $('gs-file').multiple = !code; $('gs-file').value = ''; $('gs-file').click(); };
    $('gs-file').addEventListener('change', () => take($('gs-file').files));
    const dropZone = () => $('gs-drop');
    ['dragover', 'dragenter'].forEach((ev) => wrap.addEventListener(ev, (e) => { e.preventDefault(); if (dropZone()) dropZone().classList.add('is-over'); }));
    wrap.addEventListener('dragleave', (e) => { if (!wrap.contains(e.relatedTarget) && dropZone()) dropZone().classList.remove('is-over'); });
    wrap.addEventListener('drop', (e) => { e.preventDefault(); if (checking) return; if (st.step === 2) goStep(1); take(e.dataTransfer.files); }); // at the end (3), straight to reading

    const before = JSON.stringify(accepted(docs).map((d) => d.code));
    // how: 'next' moves the onboarding on, 'end' leaves it; '' (Escape, Later) is just closing
    const close = (how = '') => {
      // on to the next step: this panel empties out under the next one (or while the page changes)
      // rather than vanishing
      const old = wrap; keep(); wrap = null; dwEl.remove(); document.removeEventListener('keydown', onKey);
      if (tour && ((how === 'next' && tour.next) || how === 'back' || how.startsWith('go:'))) { old.classList.add('is-leaving'); setTimeout(() => old.remove(), 1200); } else old.remove();
      if (!tour) document.documentElement.classList.remove('intake-open');
      changedAny = JSON.stringify(accepted(docs).map((d) => d.code)) !== before;
      strip();
      if (opts.onClose) opts.onClose(changedAny, how);
    };
    const onKey = (e) => { if (e.key !== 'Escape' || !wrap || wrap.classList.contains('is-tucked')) return; if (peek) { closePeek(); return; } if (editing == null && !checking) close(tour ? 'end' : ''); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', (e) => {
      const t = (s) => e.target.closest(s);
      if (checking) return;
      const code = (a) => t(`[data-${a}]`).getAttribute(`data-${a}`);
      if (t('[data-close]')) { e.preventDefault(); close(t('[data-close]').dataset.close || ''); return; }
      if (t('[data-tuck]')) { tuck(true); return; }
      if (t('[data-untuck]')) { tuck(false); return; }
      // back: from the review to the upload; from the upload or the end (what she read is accepted
      // by then, not to be reviewed again) to the step before in the onboarding
      if (t('[data-back]')) { if (st.step === 2 && st.sub === 'facts') { st.sub = null; keep(); paint(); } else if (st.step === 2) goStep(1); else close('back'); return; }
      if (t('[data-facts]')) { confirmFacts(); return; }
      if (t('[data-peek]')) { openPeek(code('peek')); return; }
      if (t('#gs-drop') || t('[data-browse]')) { browse(); return; }
      if (t('[data-unpend]')) { st.pending.splice(+code('unpend'), 1); keep(); paint(); return; }
      if (t('[data-one]')) { browse(code('one')); return; }
      if (t('[data-step]')) { const n = +code('step'); if (n === 2 && st.step === 1) validate(); else goStep(n); return; }
      if (t('[data-go]')) { const n = +code('go'); if (n === 2) validate(); else goStep(n); return; }
      if (t('[data-more]')) { goStep(1); return; }
      if (t('[data-unaccept-all]')) { filed().forEach((d) => { saved.files[d.code].ok = false; }); keep(); paint(); strip(); return; }
      if (t('[data-accept-all]')) { filed().forEach((d) => { if (!saved.files[d.code].mismatch && !lapsed(saved.files[d.code])) saved.files[d.code].ok = true; }); keep(); paint(); strip(); return; }
      if (t('[data-approve]')) {
        const c = code('approve'), why = (whyDraft[c] || '').trim();
        if (!why) { const i = wrap.querySelector(`[data-why="${c}"]`); if (i) i.focus(); return; }
        if (lapsed(saved.files[c])) return;
        Object.assign(saved.files[c], { ok: true, vatReason: why }); delete whyDraft[c]; keep(); paint(); strip(); return;
      }
      if (t('[data-accept]') && lapsed(saved.files[code('accept')])) return;
      if (t('[data-accept]')) { saved.files[code('accept')].ok = true; delete saved.files[code('accept')].unchecked; keep(); paint(); strip(); return; }
      if (t('[data-unaccept]')) { const f = saved.files[code('unaccept')]; f.ok = false; if (f.mismatch) whyDraft[code('unaccept')] = f.vatReason || ''; keep(); paint(); strip(); return; }
      if (t('[data-edit]')) {
        editing = code('edit'); paint();
        const i = wrap.querySelector(`[data-card="${editing}"] .is-flag input`) || wrap.querySelector(`[data-card="${editing}"] input`); if (i) i.focus();
        return;
      }
      if (t('[data-cancel]')) { editing = null; paint(); return; }
      if (t('[data-save]')) {
        const c = code('save'), f = saved.files[c], el = wrap.querySelector(`[data-card="${c}"]`);
        let changed = false;
        FIELDS.forEach(([k]) => {
          const box = el.querySelector(`[data-fna="${k}"]`), na = box && box.checked;
          const raw = na ? 'Not applicable' : el.querySelector(`input[name="${k}"]`).value.trim();
          // the date pickers give a date as 2027-01-17; it's kept as everywhere else, 17 Jan 2027
          const v = !na && DATES.includes(k) && raw ? dt(new Date(raw + 'T00:00')) : raw;
          if (!v || v === f[k]) return;
          if (na) f[`${k}Was`] = f[k];
          f[k] = v; changed = true;
        });
        f.validNa = f.valid === 'Not applicable';
        // checked by a person: what's there now is what they say, so it reads as sure
        if (changed || f.flag) Object.assign(f, { edited: true, flag: null, conf: 98 });
        f.ok = (!f.mismatch || !!f.vatReason) && !lapsed(f); editing = null; keep(); paint(); strip(); return;
      }
      if (t('[data-reject]')) {
        // not this document, or not read right: the reading goes, and the document is asked for again
        const c = code('reject'), d = docs.find((x) => x.code === c);
        rejected.push(d.name.en); delete saved.files[c]; keep(); strip();
        if (!filed().length) goStep(1); else paint(); return;
      }
      if (t('[data-remove]')) { delete saved.files[code('remove')]; keep(); if (!filed().length) goStep(1); else paint(); return; }
      // on: what wasn't accepted (medium and high confidence only, by then) goes in as she read it
      if (t('[data-confirm]')) { filed().forEach((d) => { const f = saved.files[d.code]; if (!f.ok && !mustCheck(f)) Object.assign(f, { ok: true, unchecked: true }); }); keep(); strip(); }
      // Registration: who the company is, checked, before it's done
      if (t('[data-confirm]') && FACTS && !st.factsDone) { st.sub = 'facts'; keep(); paint(); return; }
      if (t('[data-confirm]')) { st.reviewed = true; goStep(3); if (tour && tour.refresh) tour.refresh(); return; } // the Documents page behind her redraws with them
      // anywhere else on a card opens it in the drawer; its own buttons (above) keep their jobs, and
      // a card being edited stays put so its fields can be clicked into
      const cardEl = t('.gs-card');
      if (cardEl && !t('button, a, input, select, textarea, label') && editing !== cardEl.dataset.card) openPeek(cardEl.dataset.card);
    });
    // an expired one: its new date, kept when you leave the field or press Enter (typed a part at a
    // time, a date field reports every step); or its date not applicable, or back again
    const newDate = (i) => {
      const f = saved.files[i.dataset.newexp]; if (!f || !i.value) return;
      const x = new Date(i.value + 'T00:00'); if (Number.isNaN(x.getTime()) || dt(x) === f.valid) return;
      Object.assign(f, { valid: dt(x), edited: true, flag: null, conf: 98 }); keep(); paint(); strip();
    };
    wrap.addEventListener('focusout', (e) => { const i = e.target.closest('[data-newexp]'); if (i) newDate(i); });
    wrap.addEventListener('keydown', (e) => { const i = e.target.closest('[data-newexp]'); if (i && e.key === 'Enter') { e.preventDefault(); newDate(i); } });
    wrap.addEventListener('change', (e) => {
      const fna = e.target.closest('[data-fna]');
      if (fna) {
        const k = fna.dataset.fna, card = fna.closest('[data-card]'), f = saved.files[card.dataset.card], i = card.querySelector(`input[name="${k}"]`);
        i.disabled = fna.checked;
        if (fna.checked) { i.dataset.was = i.value; i.value = ''; } else { i.value = i.dataset.was || isoOf(f[k] !== 'Not applicable' ? f[k] : f[`${k}Was`] || ''); i.focus(); }
        return;
      }
      const b = e.target.closest('[data-expna]'); if (!b) return;
      const f = saved.files[b.dataset.expna];
      if (b.checked) Object.assign(f, { validWas: f.valid, valid: 'Not applicable', validNa: true, edited: true, flag: null, conf: 98 });
      else { Object.assign(f, { valid: f.validWas || f.valid, validNa: false }); if (lapsed(f)) f.ok = false; }
      keep(); paint(); strip();
    });
    // typing the reason: Approve opens up once there is one; Enter approves
    wrap.addEventListener('input', (e) => {
      const i = e.target.closest('[data-why]'); if (!i) return;
      whyDraft[i.dataset.why] = i.value;
      const b = wrap.querySelector(`[data-approve="${i.dataset.why}"]`); if (b) b.disabled = !i.value.trim();
    });
    wrap.addEventListener('keydown', (e) => {
      const i = e.target.closest('[data-why]'); if (!i || e.key !== 'Enter') return;
      e.preventDefault(); const b = wrap.querySelector(`[data-approve="${i.dataset.why}"]`); if (b && !b.disabled) b.click();
    });
    // a step left half-done comes back where it was; one that can't be reached starts at the upload
    if (!reached(st.step - 1)) st.step = 1;
    paint();
    if (opts.files && opts.files.length) take(opts.files);
  };

  // ---- the onboarding's last step: inviting suppliers, on My suppliers (suppliers.html) ------------
  // ALMA says what happens next, and the page's own ways in open from her panel: Add a supplier, one
  // at a time, or many from an Excel list (js/supplier-add.js, js/supplier-import.js). While the
  // list from a file is being checked, the panel folds to its rail to leave the page the room; who's
  // been invited shows in it as they're sent.
  const PLUS_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="8" r="3.5"/><path d="M3.5 19.5c.8-3.4 3.4-5.5 6.5-5.5 1.3 0 2.5.4 3.5 1M18 14v6M15 17h6"/></svg>';
  const XLS_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8.5 12.5l4 5M12.5 12.5l-4 5"/></svg>';
  const CHEV_I = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.17 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clip-rule="evenodd"/></svg>';
  const BACK_I = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.83 10l3.94 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clip-rule="evenodd"/></svg>';
  const invite = (area, opts = {}) => {
    const tour = opts.tour, add = window.CMSupplierAdd;
    if (wrap || !tour || !add) return;
    const invited = () => (window.CM_SUPPLIERS ? window.CM_SUPPLIERS.list().filter((x) => x.status === 'invited') : []);
    const before = invited().length;
    const body = () => {
      const l = invited(), back = tour.back || false;
      const fig = almaHtml(); // her figure, where the page has one to copy
      return `${fig ? `<span class="gs-mini" aria-hidden="true"><span class="alma-media">${fig}</span></span>` : ''}
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">Now your suppliers. <span class="soft">I&rsquo;ll collect their documents for you.</span></h1>
        <p class="lead">Invite the companies that work for you. I&rsquo;ll ask each one for the documents its country requires, read them as they come in, and tell you when one is missing or about to expire.</p>
        <div class="gs-pane gs-inv">
          <button type="button" class="gs-inv-opt" data-inv="one"><span class="gs-inv-i">${PLUS_I}</span><span><b>Add a supplier</b><small>By its country and company code. Not on C&#8209;MORE yet? I&rsquo;ll invite it to join.</small></span>${CHEV_I}</button>
          <button type="button" class="gs-inv-opt" data-inv="many"><span class="gs-inv-i">${XLS_I}</span><span><b>Invite suppliers from Excel file</b><small>Choose the documents you need from them, upload a list, check it, and send every invitation at once.</small></span>${CHEV_I}</button>
        </div>
        ${l.length ? `<div class="gs-pane gs-inv-done"><p class="gs-lh">Invited <span class="gs-inv-n">${l.length}</span></p>
          <ul>${l.slice(0, 5).map((x) => `<li><span class="gs-inv-ok">${OK}</span><span><b>${esc(x.name)}</b><small>${esc([x.city, x.email].filter(Boolean).join(' · '))}</small></span></li>`).join('')}</ul>
          ${l.length > 5 ? `<p class="gs-hint">And ${l.length - 5} more, on My suppliers.</p>` : ''}</div>` : ''}
        <div class="actions gs-nav3${l.length ? ' no-skip' : ''}"><span>${back ? `<button class="link-btn gs-back" type="button" data-back>${BACK_I}${back}</button>` : `<button class="link-btn gs-back" type="button" disabled>${BACK_I}Back</button>`}</span>
          <span>${l.length ? '' : '<button class="link-btn" type="button" data-close="next">I&rsquo;ll do it later</button>'}</span>
          <span><button class="btn btn-primary" type="button" data-close="next">${tour.next ? `Next: ${esc(tour.next)}` : 'Finish setup'}</button></span></div>`;
    };
    wrap = document.createElement('div');
    wrap.className = 'intake over-page gs gs-dock' + (tour.quiet ? ' is-quiet' : '');
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'gs-title');
    wrap.innerHTML = `${tourRail(tour)}<div class="intake-inner">${tourHead(tour)}<div class="intake-screen alma-ask"><div id="gs-body">${body()}</div></div></div>`;
    document.body.appendChild(wrap);
    const me = wrap, paintBody = () => { if (wrap === me) me.querySelector('#gs-body').innerHTML = body(); };
    const onList = () => paintBody();
    const onReview = (e) => { if (wrap !== me) return; tuck(!!e.detail); };
    const close = (how = '') => {
      if (wrap !== me) return;
      document.removeEventListener('keydown', onKey); document.removeEventListener('cm-suppliers', onList); document.removeEventListener('cm-sup-review', onReview);
      wrap = null;
      if (how === 'next' || how === 'back' || how.startsWith('go:')) { me.classList.add('is-leaving'); setTimeout(() => me.remove(), 1200); } else me.remove();
      if (opts.onClose) opts.onClose(invited().length !== before, how);
    };
    // Escape leaves the setup, unless the Add a supplier drawer is what's open, or the panel is folded
    const onKey = (e) => { if (e.key !== 'Escape' || wrap !== me || me.classList.contains('is-tucked') || add.isOpen()) return; close('end'); };
    document.addEventListener('keydown', onKey); document.addEventListener('cm-suppliers', onList); document.addEventListener('cm-sup-review', onReview);
    me.addEventListener('click', (e) => {
      const t = (q) => e.target.closest(q);
      if (t('[data-close]')) { e.preventDefault(); close(t('[data-close]').dataset.close || ''); return; }
      if (t('[data-back]')) { close('back'); return; }
      if (t('[data-tuck]')) { tuck(true); return; }
      if (t('[data-untuck]')) { tuck(false); return; }
      const b = t('[data-inv]'); if (!b) return;
      // many: straight to inviting from Excel (the documents to ask for, then the file), not Add a supplier
      if (b.dataset.inv === 'many' && window.CMSupplierImport) { window.CMSupplierImport.invite(); return; }
      add.open();
    });
    const h = me.querySelector('#gs-title'); if (h) h.focus({ preventScroll: true });
  };

  // ---- the company homepage's own way in: its drop zone and "Start company profile" ---------------
  // for a company added in this session they open ALMA on the Company section, not the general intake
  if (document.querySelector('#empty')) {
    const intercept = (e) => {
      const z = e.target.closest && e.target.closest('#empty [data-ce-start], #empty #ce-drop, #empty #ce-browse');
      if (!z) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const files = e.type === 'drop' && e.dataTransfer ? e.dataTransfer.files : null;
      if (e.type === 'drop' || e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
        if (!tour({ files, again: true })) open('company', { files, onClose: (c) => { if (c) location.reload(); } });
      }
    };
    ['click', 'drop', 'keydown'].forEach((ev) => document.addEventListener(ev, intercept, true));
    document.addEventListener('dragover', (e) => { if (e.target.closest && e.target.closest('#empty #ce-drop')) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  }
  strip();

  // ---- the onboarding: a new company's first look at its homepage --------------------------------
  // ALMA comes up big over the page, says hello and what she'll do; then she settles into a panel
  // docked at the side, with the homepage still in view, and asks section by section: first the
  // documents that show the company is registered, then the rest of the company's, then its
  // suppliers, invited to share theirs. Each step can be skipped; "Skip setup" (or Escape) leaves it all
  // for later, on the empty homepage. Where it got to is kept, so coming back carries on from there.
  // (Workers and Equipment come back as steps once they open)
  const TOUR = ['registration', 'company', 'suppliers'];
  const STEP = { registration: 'Registration', company: 'Company documents', suppliers: 'Invite suppliers' };
  const regCodes = () => asks('registration').map((d) => d.code);
  const docsOf = (a) => (a === 'suppliers' ? [] : a === 'company' ? asks('company').filter((d) => !regCodes().includes(d.code)) : asks(a));
  const invitedN = () => (window.CM_SUPPLIERS ? window.CM_SUPPLIERS.list().filter((x) => x.status === 'invited').length : saved.invited || 0);
  const complete = (a) => (a === 'suppliers' ? invitedN() > 0 : docsOf(a).every((d) => (saved.files[d.code] || {}).ok));
  const first = (() => { try { return ((JSON.parse(sessionStorage.getItem('cm-person') || 'null') || {}).name || '').split(/\s+/)[0]; } catch (e) { return ''; } })();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const intro = (areas, go, skip, n = areas.length) => {
    const el = document.createElement('div');
    el.className = 'intake over-page gs gs-intro'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'gs-in-t');
    el.innerHTML = `<div class="intake-inner"><div class="intake-screen alma-ask">
        <span class="drop gs-in-alma" aria-hidden="true"><span class="alma-media">${almaHtml()}</span></span>
        <p class="says rise d1">ALMA</p>
        <h1 id="gs-in-t" class="rise d2" tabindex="-1">${first ? `Welcome, ${esc(first)}. ` : 'Welcome. '}<span class="soft">Let&rsquo;s put ${called(org.id !== 'home')} on C&#8209;MORE.</span></h1>
        <p class="lead rise d3">I&rsquo;ll set it up with you in ${n} steps, starting with the documents that show your company is registered. You upload them, I read them, and you check what I read.</p>
        <ol class="gs-in-steps rise d3">${areas.map((a, i) => `<li><span>${i + 1}</span>${STEP[a]}${soon(a)}</li>`).join('')}</ol>
        <div class="actions rise d4"><button class="btn btn-primary" type="button" data-in-go>Start with ${STEP[areas[0]].toLowerCase()}</button>
          <button class="link-btn" type="button" data-in-skip>Skip, show me my company</button></div>
      </div></div>`;
    document.body.appendChild(el);
    document.documentElement.classList.add('intake-open');
    el.querySelector('#gs-in-t').focus({ preventScroll: true });
    const done = () => { document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') { done(); leave(); skip(); } };
    document.addEventListener('keydown', onKey);
    const leave = () => { el.classList.add('is-gone'); document.documentElement.classList.remove('intake-open'); setTimeout(() => el.remove(), reduced() ? 0 : 400); };
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-in-skip]')) { done(); leave(); skip(); return; }
      if (!e.target.closest('[data-in-go]')) return;
      done(); document.documentElement.classList.remove('intake-open');
      // she moves into the panel: the panel comes in at the side, and her figure flies to its place in it
      go();
      const me = el.querySelector('.gs-in-alma'), to = wrap && wrap.querySelector('#gs-drop .alma-media, .gs-mini .alma-media');
      if (reduced() || !me || !to) { el.remove(); return; }
      me.style.animation = 'none'; if (to.closest('.drop')) to.closest('.drop').style.animation = 'none'; // she is the arrival
      const a = me.getBoundingClientRect(), r = to.getBoundingClientRect();
      // where her place in the panel will be once it has slid in
      const dx = wrap.getBoundingClientRect().left - (innerWidth - wrap.offsetWidth), b = { left: r.left - dx, top: r.top, width: r.width, height: r.height };
      to.style.opacity = '0';
      el.classList.add('is-flying');
      me.style.transform = `translate(${b.left - a.left + (b.width - a.width) / 2}px, ${b.top - a.top + (b.height - a.height) / 2}px) scale(${b.width / a.width})`;
      setTimeout(() => { to.style.opacity = ''; el.remove(); }, 900);
    });
  };

  // where each step happens: the homepage for the company's own documents (its top for Registration,
  // its documents for the rest), the Documents page's section for Workers and Equipment
  const onHome = !!document.querySelector('#empty');
  // its documents, Workers and Equipment; My suppliers for inviting suppliers
  const PLACE = { workers: 'company-details.html?area=workers', equipment: 'company-details.html?area=equipment', suppliers: 'suppliers.html' };
  const here = (a) => (a === 'suppliers' ? /suppliers\.html$/.test(location.pathname) : PLACE[a] ? /company-details/.test(location.pathname) && new URLSearchParams(location.search).get('area') === a : onHome);
  // to another page: this one fades out, the next fades in (its head reads cm-tour-fade)
  const leave = (url) => {
    try { sessionStorage.setItem('cm-tour-fade', '1'); } catch (e) {}
    document.documentElement.classList.add('tour-out');
    setTimeout(() => { location.href = url; }, reduced() ? 0 : 320);
  };
  if (document.documentElement.classList.contains('tour-in')) {
    try { sessionStorage.removeItem('cm-tour-fade'); } catch (e) {}
    requestAnimationFrame(() => requestAnimationFrame(() => { document.documentElement.classList.add('tour-fading'); document.documentElement.classList.remove('tour-in'); }));
  }
  const show = (a) => {
    if (!onHome) return;
    const to = a === 'company' && document.querySelector('#empty .co-docs-sec');
    const bar = document.querySelector('.top'); // the sticky header stays over the page: land below it
    scrollTo({ top: to ? to.getBoundingClientRect().top + scrollY - (bar ? bar.offsetHeight : 0) - 8 : 0, behavior: reduced() ? 'auto' : 'smooth' });
  };
  // again: started from the homepage by hand, so a step skipped before is asked again if it's not done
  const tour = (o = {}) => {
    const t = saved.tour = Object.assign({ passed: [], ended: false }, saved.tour || {});
    if (o.again) { t.ended = false; t.passed = t.passed.filter(complete); }
    // Workers and Equipment show, marked coming soon, but aren't steps until they open:
    // Company documents is the last step meanwhile
    const shown = TOUR.filter((a) => a === 'suppliers' ? !!PLACE.suppliers : docsOf(a).length), areas = shown.filter((a) => !SOON.areas.includes(a));
    const at = areas.findIndex((a) => !t.passed.includes(a));
    if (at < 0) { t.ended = true; keep(); return false; }
    keep();
    let changed = false;
    // a step just finished with new documents: the homepage beside the drawer scrolls to them and
    // they flash; before leaving for a step on another page, a moment to see them first
    const SHOW_MS = 2600;
    const showPage = () => {
      const sec = document.querySelector('#empty .co-docs-sec');
      if (!sec) return false;
      const bar = document.querySelector('header.top'), off = (bar ? bar.getBoundingClientRect().bottom : 0) + 16; // clear of the sticky top bar
      window.scrollTo({ top: Math.max(0, scrollY + sec.getBoundingClientRect().top - off), behavior: reduced() ? 'auto' : 'smooth' });
      flash(document.querySelector('#empty .co-k[data-go="docs"]')); flash(sec);
      return true;
    };
    const step = (i, quiet, files, reveal) => {
      const a = areas[i];
      // each step where its documents live: Workers and Equipment on their Documents page
      t.on = a; keep();
      if (!here(a)) { const go = () => leave(PLACE[a] || 'my-company.html?page'); if (reveal && showPage()) setTimeout(go, SHOW_MS); else go(); return; }
      show(a);
      const n = areas.findIndex((x, j) => j > i && !t.passed.includes(x)); // the next step not done yet
      if (reveal) setTimeout(showPage, 0); // the drawer stays open on the next step, the page beside it
      (a === 'suppliers' ? invite : open)(a, {
        files, skip: a === 'company' ? regCodes() : [],
        tour: { at: i, count: areas.length, bar: shown.map((x) => ({ a: x, l: STEP[x], on: x === a, soon: SOON.areas.includes(x), done: complete(x) })), next: n >= 0 ? STEP[areas[n]] : '', back: i > 0 ? `Back to ${STEP[areas[i - 1]].toLowerCase()}` : '', quiet, refresh: onHome ? null : () => leave(location.pathname + location.search) },
        onClose: (c, how) => {
          changed = changed || c;
          // back: to the step before, as it was left (its page, if it lives elsewhere)
          if (how === 'back') { t.passed = t.passed.filter((x) => x !== areas[i - 1]); keep(); step(i - 1, true); return; }
          // a step picked on the bar: ahead, the ones on the way count as skipped (as Skip this step
          // does); back, it's open again, and so are those after it left unfinished, so Next goes through them
          const j = how.startsWith('go:') ? areas.indexOf(how.slice(3)) : -1;
          if (j >= 0) {
            if (j > i) areas.slice(i, j).forEach((x) => { if (!t.passed.includes(x)) t.passed.push(x); });
            else t.passed = t.passed.filter((x) => !areas.slice(j + 1, i).includes(x) || complete(x));
            t.passed = t.passed.filter((x) => x !== areas[j]); keep(); step(j, true, undefined, c && onHome && j > i); return;
          }
          if (how === 'next') { t.passed.push(a); keep(); if (n >= 0) { step(n, true, undefined, c && onHome); return; } }
          t.ended = true; t.on = null; keep(); // done, or Skip setup, Escape
          if (how === 'next' && !onHome) { leave('my-company.html?page'); return; } // "Go to my company"
          if (changed) location.reload();
        },
      });
    };
    if (o.intro) intro(shown, () => step(at, false, o.files), () => { t.ended = true; keep(); }, areas.length);
    else step(at, !!o.quiet, o.files);
    return true;
  };

  window.CMGuided = { open, asks, has, AREA, tour };
  // a new company's homepage, the first time and until its setup is done or skipped
  const arrive = () => { const t = saved.tour; if (t && t.ended) return; tour({ intro: !t }); };
  if (/[?&]guided\b/.test(location.search)) {
    // the end of creating a company
    history.replaceState(null, '', location.pathname + location.search.replace(/[?&]guided\b/, '').replace(/^&/, '?') + location.hash);
    setTimeout(arrive, reduced() ? 0 : 650);
  } else if (O.test && document.querySelector('#empty')) {
    // the test user's own company, after signing up or logging in
    setTimeout(arrive, reduced() ? 0 : 650);
  } else if (saved.tour && saved.tour.on && !saved.tour.ended) {
    // a step on another page (Workers, Equipment): the panel is there already, as it was
    tour({ quiet: true });
  }
})();
