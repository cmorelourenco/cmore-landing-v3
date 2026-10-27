/* ALMA's guided upload, section by section. A company's documents are asked for where they live:
   open Documents › Company, Workers or Equipment while it's empty, and her overlay comes up
   asking for that section's documents (worked out by js/doc-rules.js from the company's country,
   sector and size). The same overlay answers the other empty states — the company homepage's
   drop zone, a section's empty card — so wherever there's nothing yet, she's the way in.
     1 Upload   — what she's asking for, and the files the user adds (as many as they like), side
                  by side: nothing says which file is which yet, because nothing has been read.
                  Moving on, she reads every file: each one she recognises is checked with the body
                  that issued it; one that isn't among the documents asked for is kept, and said so.
     2 Review   — what she read from each: a short summary, the fields and her confidence.
                  Accept each (or all at once), change what she got wrong, replace or remove.
                  A card opens the document in a drawer, as in Documents: a preview of it as read,
                  each value with its citation.
     3 Complete — how complete the section is. All in: congratulations. Anything missing: add it
                  now, or skip for now.
   What is accepted is what Documents and the homepage show (js/doc-model.js reads it). Files
   beyond what she asked for are kept too, without a word about it at this stage.
   window.CMGuided.open(area) opens it; js/company-details.js opens it on an empty section.
   Creating a company ends with it too: the new company's homepage opens (?guided) with ALMA asking
   for its Company documents over it, and the page is only the user's once they upload or skip.
   Prototype: nothing is uploaded; what was read and accepted is kept for this tab, per company. */
(() => {
  const O = window.CMOrgs, CAT = window.DOC_CATALOG, R = window.DocRules, DM = window.DOC_MODEL;
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
    company: { title: 'Company', what: 'company documents', who: `A ${profile.sector === 'construction' ? 'construction' : (org.sector || 'your').toLowerCase()} company in WHERE needs these N.` },
    workers: { title: 'Workers', what: 'workers&rsquo; documents', who: 'These N cover the people who work for you in WHERE. One file each for now. Once you add your team, I&rsquo;ll ask for them person by person.' },
    equipment: { title: 'Equipment', what: 'equipment documents', who: 'These N cover the machines you bring to site. One file each for now. Once you add your machines, I&rsquo;ll ask for them machine by machine.' },
  };
  const TYPICAL = { workers: [{ nationality: profile.country, specialRisk: false, certifiedOperator: false, employmentType: 'permanent' }], equipment: [{ yearBuilt: 2020, measuring: false, certified: false }] };
  const asks = (area) => {
    if (area === 'equipment' && !profile.equipmentCount) return []; // it said it brings no machines
    if (area === 'company') return R.documentsFor(CAT, profile).map((x) => x.doc).filter((d) => d.category === 'company' && d.requirement === 'mandatory' && d.level === 'company');
    const p = Object.assign({}, profile, area === 'equipment' ? {} : { employees: Math.max(1, profile.employees) });
    return R.documentsFor(CAT, p).map((x) => x.doc).filter((d) => d.category === area && ['mandatory', 'if_applicable'].includes(d.requirement)
      && (d.level === 'all_workers' || R.subjectsFor(d, TYPICAL[area] || [], p).length));
  };
  const accepted = (list) => list.filter((d) => (saved.files[d.code] || {}).ok);
  const has = (area) => accepted(asks(area)).length > 0 || Object.values(saved.files).some((f) => f.ok && f.area === area);

  // ---- the company homepage: "Profile completion", its Documents card and table --------------------
  // completion: the company's documents, its workers' when it has employees and its equipment's
  // when it brings machines to site, accepted out of all of them. The strip's link opens ALMA on the
  // first section with something missing.
  const counted = () => ['company'].concat(profile.employees > 0 ? ['workers'] : [], profile.equipmentCount ? ['equipment'] : []).flatMap((a) => asks(a).map((d) => Object.assign({ area: a }, { d })));
  const strip = () => {
    const box = document.querySelector('#empty .co-strip');
    if (!box) return;
    const all = counted(), ok = all.filter((x) => (saved.files[x.d.code] || {}).ok);
    if (!ok.length) return; // nothing yet: the page's own "Start company profile" stays
    const p = Math.round((ok.length / all.length) * 100), left = all.filter((x) => !ok.includes(x));
    const meter = box.querySelector('.co-meter'), bar = meter.firstElementChild;
    bar.style.width = p + '%'; bar.style.background = p === 100 ? 'var(--color-ok, #a6d8a0)' : '';
    meter.setAttribute('aria-valuenow', String(p));
    const bySec = [...new Set(left.map((x) => x.area))].map((a) => `${left.filter((x) => x.area === a).length} in ${AREA[a].title}`).join(', ');
    box.querySelector('.co-strip-l > span:last-child').innerHTML = `<b>${p}%</b><span class="co-strip-more"> &middot; ${p === 100 ? 'every document asked of you is in, checked and in your Documents.' : `${left.length} document${left.length === 1 ? '' : 's'} left: ${bySec}.`}</span>`;
    const old = box.querySelector('.co-wrap > a'), a = old.cloneNode(false);
    a.removeAttribute('data-ce-start');
    if (p === 100) { a.href = 'company-details.html'; a.textContent = 'View documents'; }
    else { a.href = '#'; a.textContent = 'Finish company profile'; a.addEventListener('click', (e) => { e.preventDefault(); open(left[0].area); }); }
    old.replaceWith(a);
    home(ok);
  };
  const home = (ok) => {
    const card = document.querySelector('#empty .co-k[data-go="docs"]'), tbl = document.querySelector('#empty .co-docs-tbl');
    if (!card || !tbl || !ok.length) return;
    const e = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const soon = (f) => { const t = Date.parse(f.valid); return !Number.isNaN(t) && t - Date.now() < 30 * 864e5; };
    const rows = ok.map((x) => ({ d: x.d, a: x.area, f: saved.files[x.d.code] })).sort((a, b) => (Date.parse(a.f.valid) || Infinity) - (Date.parse(b.f.valid) || Infinity));
    const expiring = rows.filter((r) => soon(r.f)).length;
    card.classList.remove('is-zero');
    card.querySelector('.co-k-n').textContent = ok.length;
    card.querySelector('.co-k-nl').textContent = `document${ok.length === 1 ? '' : 's'} on file`;
    card.querySelector('.co-k-d').textContent = expiring ? `${expiring} expire${expiring === 1 ? 's' : ''} within a month.` : 'All in order. I’ll tell you before one expires.';
    card.querySelector('.co-k-chips').innerHTML = `<span class="co-k-chip co-k-ok"><b>${ok.length - expiring}</b> valid</span><span class="co-k-chip co-k-exp${expiring ? '' : ' is-zero'}"><b>${expiring}</b> expiring</span>`;
    const sec = tbl.closest('.co-sec');
    sec.querySelector('.co-h-l').textContent = 'Your documents';
    sec.querySelector('.co-sec-head .co-muted').textContent = 'What you’ve uploaded, soonest to expire first. Drop more on ALMA and they join the list.';
    tbl.tBodies[0].innerHTML = rows.map(({ d, a, f }) => `<tr data-code="${d.code}" tabindex="0" role="link"><td><span class="n">${e(d.name.en)}</span><span class="d">${e(f.file)}</span></td><td>Your company</td><td class="c">${AREA[a].title}</td><td class="c">${e(f.valid === 'No expiry' ? '—' : f.valid)}</td><td class="c"><span class="co-badge ${soon(f) ? 'b-pend">Expiring' : 'b-ok">Valid'}</span></td></tr>`).join('');
    const go = (r) => { location.href = `company-details.html?open=${encodeURIComponent(r.dataset.code)}`; };
    tbl.tBodies[0].onclick = (ev) => { const r = ev.target.closest('tr[data-code]'); if (r) go(r); };
    tbl.tBodies[0].onkeydown = (ev) => { const r = ev.target.closest('tr[data-code]'); if (r && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); go(r); } };
  };

  // ---- shared bits ---------------------------------------------------------------------------------
  const COUNTRY = { PT: 'Portugal', ES: 'Spain', FR: 'France', DE: 'Germany', IT: 'Italy', NL: 'Netherlands', BE: 'Belgium', IE: 'Ireland', US: 'the United States' };
  const where = COUNTRY[profile.country] || org.countryName || 'your country';
  const countryName = where.replace(/^the /, 'The ');
  const nameOf = org.trading || org.name;
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
.gs-ic.is-file { border-style: solid; border-color: var(--color-line); color: var(--color-ink); }
.gs-none { padding: 1rem; border: 1.5px dashed var(--color-sand-400); border-radius: 0.75rem; font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-subtle); }

.gs .actions { flex-direction: row; flex-wrap: wrap; justify-content: center; gap: 1rem 1.5rem; }
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
.gs-dw .cd-fields td:last-child { width: 1%; white-space: nowrap; }
.gs-card .co-badge { flex: none; }
.gs-sum { margin-top: 0.625rem; font-size: 0.9375rem; line-height: 1.5; color: var(--color-ink-muted); }
.gs-fields { display: grid; grid-template-columns: 0.8fr 1.3fr 1fr 0.9fr 0.9fr; gap: 0.75rem 1.25rem; margin: 0.875rem 0 0; padding: 0.875rem 0 0; border-top: 1px solid var(--color-line); }
.gs-fields dt { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.gs-fields dd { margin: 0.25rem 0 0; font-size: 0.9375rem; color: var(--color-ink); overflow-wrap: anywhere; }
.gs-fields .is-flag dd { color: var(--color-coral-deep); font-weight: 600; }
.gs-fields input { width: 100%; padding: 0.4375rem 0.625rem; border: 1px solid var(--color-sand-400); border-radius: 0.375rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
.gs-fields .is-flag input { border-color: var(--color-coral); }
.gs-why { margin-top: 0.75rem; padding: 0.5rem 0.75rem; border-radius: 0.375rem; background: var(--color-coral-tint, #f9e7e3); font-size: 0.875rem; color: var(--color-ink); }
.gs-card footer { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem 1.25rem; margin-top: 1rem; }
.gs-card footer > span { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem 1.25rem; }
/* Accept: a small square-cornered button, like the tags; accepted, it takes the brand green */
.gs-acc { display: inline-flex; align-items: center; gap: 0.375rem; height: 2.25rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.375rem;
  background: var(--color-surface); font: inherit; font-size: 0.875rem; font-weight: 600; color: var(--color-ink); cursor: pointer; transition: border-color .15s, background-color .15s; }
.gs-acc svg { width: 0.875rem; height: 0.875rem; }
button.gs-acc:hover { border-color: var(--color-graphite); }
.gs-acc.is-ok { border-color: var(--color-ok, #a6d8a0); background: var(--color-ok, #a6d8a0); color: var(--color-graphite); cursor: default; }
.gs-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 2.25rem; margin-bottom: 0.75rem; font-size: 0.875rem; color: var(--color-ink-subtle); }
.gs-hint { margin-top: 0.75rem; text-align: center; }
.gs-meter { position: relative; width: 11rem; aspect-ratio: 1; margin: 0 auto; border-radius: 50%;
  background: conic-gradient(var(--color-graphite) calc(var(--p) * 1%), var(--color-mid-beige) 0); display: grid; place-items: center; }
.gs-meter.is-full { background: var(--color-ok, #a6d8a0); }
.gs-meter::before { content: ""; position: absolute; inset: 0.875rem; border-radius: 50%; background: var(--color-off-white); }
.gs-meter b { position: relative; display: block; font-size: 2.5rem; font-weight: 600; letter-spacing: -0.03em; color: var(--color-ink); text-align: center; }
.gs-meter span { position: relative; display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); text-align: center; }
@media (max-width: 40rem) { .gs-fields { grid-template-columns: repeat(2, minmax(0, 1fr)); } .gs-sub { display: none; } .gs-lbl { font-size: 0.875rem; } .gs-list li { padding: 0.75rem 0.875rem; } }
@media (prefers-reduced-motion: reduce) { .gs-steps::before { transition: none; } .is-reading .gs-ic svg { animation: none; } }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const SPIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';
  // her figure: the one the page already shows
  const almaHtml = () => { const s = document.querySelector('#empty .alma-media, .alma-media'); return s ? s.innerHTML : ''; };

  // ---- the overlay, for one section ----------------------------------------------------------------
  let wrap = null;
  const open = (area, opts = {}) => {
    if (wrap || !AREA[area]) return;
    const docs = asks(area);
    if (!docs.length) return;
    const A = AREA[area];
    const st = saved.areas[area] = Object.assign({ step: 1, reviewed: false, pending: [], kept: [] }, saved.areas[area] || {});
    if (!st.pending) st.pending = []; if (!st.kept) st.kept = [];
    let changedAny = false;
    const FLAGGED = (docs.filter((d) => !/no expiry/i.test(d.expiryRule || '')).pop() || {}).code;
    const read = (d, file) => {
      const h = hash(d.code + file.name + org.id), now = new Date(), months = monthsOf(d);
      const issued = new Date(now); issued.setDate(now.getDate() - (months <= 4 ? 4 + (h % 24) : 30 + (h % 170)));
      let valid = 'No expiry';
      if (!/no expiry/i.test(d.expiryRule || '')) { const v = new Date(issued); v.setMonth(v.getMonth() + months); valid = dt(v); }
      const flagged = docs.length > 1 && d.code === FLAGGED && valid !== 'No expiry';
      return {
        area, file: file.name, country: countryName, issued: dt(issued), valid, by: issuer(d), ref: codeOf(d, h, issued),
        conf: flagged ? 76 + (h % 8) : 90 + (h % 9), flag: flagged ? 'valid' : null, ok: false, edited: false,
      };
    };
    const STEPS = [['Upload', `Your ${A.what}`], ['Review', 'Check what ALMA read'], ['Complete', `How complete ${A.title} is`]];

    wrap = document.createElement('div');
    wrap.className = 'intake over-page gs'; wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'gs-title');
    wrap.innerHTML = `<div class="intake-inner"><div class="intake-screen alma-ask">
        <ol class="gs-steps" id="gs-steps" aria-label="${A.title} documents"></ol>
        <div id="gs-body"></div>
        <input id="gs-file" type="file" multiple hidden accept=".pdf,.png,.jpg,.jpeg,.webp,.heic">
      </div></div>`;
    document.body.appendChild(wrap);
    document.documentElement.classList.add('intake-open');
    const $ = (id) => wrap.querySelector('#' + id);
    const alma = almaHtml;
    let target = null, editing = null;
    const held = {}; // the files themselves, by name, until each is filed (then js/doc-files.js keeps it)

    const filed = () => docs.filter((d) => saved.files[d.code]);
    const confirmed = () => docs.filter((d) => (saved.files[d.code] || {}).ok);
    const pct = () => Math.round((confirmed().length / docs.length) * 100);
    const confTag = (f) => { const [b, c] = f.conf >= 90 ? ['High', 'b-ok'] : f.conf >= 75 ? ['Medium', 'b-pend'] : ['Low', 'b-over']; return `<span class="co-badge ${c}">${b} confidence</span>`; };
    const reached = (i) => i === 0 || (i === 1 && filed().length > 0) || (i === 2 && !!st.reviewed);
    const paintSteps = () => {
      const at = st.step - 1;
      $('gs-steps').style.setProperty('--done', `${(at / 2) * 100}%`);
      $('gs-steps').innerHTML = STEPS.map(([l, s], i) => {
        const done = i < at || (i === 2 && st.step === 3 && pct() === 100);
        return `<li class="${i === at && !done ? 'is-on' : done ? 'is-done' : ''}"${i === at ? ' aria-current="step"' : ''}><button type="button" data-step="${i + 1}"${reached(i) && i !== at ? '' : ' disabled'}><span class="gs-node">${done ? OK : i + 1}</span><span class="gs-lbl">${l}</span><span class="gs-sub">${s}</span></button></li>`;
      }).join('');
    };
    const sec = `<span class="gs-sec">Documents &rsaquo; ${A.title}</span>`;

    // step 1: what she's asking for, and the files added — two lists, not matched to each other yet
    const step1 = () => {
      const n = docs.length, read = filed(), np = st.pending.length;
      const asked = docs.map((d) => {
        const f = saved.files[d.code], pt = local(d);
        // a requirement, not a to-do: no box to tick, the catalog's requirement instead
        return `<li class="gs-req"><span><span class="gs-n">${esc(d.name.en)}</span><span class="gs-d">${f ? `Read from ${esc(f.file)}` : pt ? `In ${where}: ${esc(pt)}` : esc(d.description.en.split(/(?<=\.)\s/)[0])}</span></span><span class="co-badge ${d.requirement === 'mandatory' ? 'b-info' : 'b-neu'}">${esc(DM.LBL.requirement[d.requirement] || '')}</span></li>`;
      }).join('');
      const files = st.pending.map((name, i) => `<li><span class="gs-ic is-file">${FILE}</span><span><span class="gs-n">${esc(name)}</span><span class="gs-d">Not read yet</span></span><button class="link-btn" type="button" data-unpend="${i}">Remove</button></li>`)
        .concat(read.map((d) => `<li class="is-in"><span class="gs-ic">${FILE}</span><span><span class="gs-n">${esc(saved.files[d.code].file)}</span><span class="gs-d">Read as ${esc(d.name.en)}</span></span><span></span></li>`))
        .concat(st.kept.map((name) => `<li><span class="gs-ic is-file">${FILE}</span><span><span class="gs-n">${esc(name)}</span><span class="gs-d">Kept &middot; not one of the documents asked for here</span></span><span></span></li>`)).join('');
      const total = np + read.length + st.kept.length;
      return `${sec}<button class="drop is-small" id="gs-drop" type="button" aria-label="Add files"><span class="alma-media" aria-hidden="true">${alma()}</span>
          <span class="drop-hint"><span class="wide">Drop them on me</span><span class="narrow">Tap to add</span></span></button>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">${total ? `${total} file${total === 1 ? '' : 's'} so far, <span class="soft">add more or carry on.</span>` : `Your ${A.what}, <span class="soft">all at once.</span>`}</h1>
        <p class="lead">${A.who.replace('WHERE', where).replace('N', n)} Drop your files on me, as many as you have. I&rsquo;ll read them and tell you which is which.</p>
        <div class="gs-pane gs-two">
          <section><p class="gs-lh" role="heading" aria-level="2">What I&rsquo;m asking for <span>${n}</span></p><ul class="gs-list" aria-label="Documents asked for">${asked}</ul></section>
          <section><p class="gs-lh" role="heading" aria-level="2">Your files <span>${total}</span></p>${total ? `<ul class="gs-list" aria-label="Your files">${files}</ul>` : '<p class="gs-none">No files yet. Drop them on me above, or <button class="link-btn" type="button" data-browse>choose them on your device</button>.</p>'}</section>
        </div>
        <div class="actions"><button class="btn btn-primary" type="button" data-go="2"${np || read.length ? '' : ' disabled'}>Upload documents</button>
          <button class="link-btn" type="button" data-close>I&rsquo;ll do it later</button></div>`;
    };

    // step 2: what she read, to accept or put right
    const FIELDS = [['country', 'Country'], ['by', 'Issued by'], ['ref', 'Reference'], ['issued', 'Issue date'], ['valid', 'Valid until']];
    const card = (d) => {
      const f = saved.files[d.code], ed = editing === d.code;
      const flagged = f.flag && !f.edited;
      if (!f.country) f.country = countryName;
      const label = (k, l) => (k === 'ref' && CODE_LABEL[d.code] ? CODE_LABEL[d.code].replace(/^./, (c) => c.toUpperCase()) : l);
      const fields = FIELDS.map(([k, l0]) => [k, label(k, l0)]).map(([k, l]) => `<div class="${flagged && f.flag === k ? 'is-flag' : ''}"><dt>${l}</dt><dd>${ed ? `<input name="${k}" value="${esc(f[k])}" aria-label="${l}">` : esc(f[k])}</dd></div>`).join('');
      const noExp = f.valid === 'No expiry';
      const summary = `${esc(d.description.en.split(/(?<=\.)\s/)[0])} Issued by ${esc(f.by)} on ${esc(f.issued)}${noExp ? ', with no expiry' : `, valid until ${esc(f.valid)}`}.`;
      return `<article class="gs-card${f.ok ? ' is-ok' : ''}${ed ? ' is-editing' : ''}" data-card="${d.code}">
        <header><div><h3><button type="button" class="gs-peek" data-peek="${d.code}">${esc(d.name.en)}</button></h3><p class="gs-d">${esc(f.file)}${local(d) ? ' &middot; ' + esc(local(d)) : ''}</p></div>${f.edited ? '<span class="co-badge b-neu">Corrected by you</span>' : confTag(f)}</header>
        <p class="gs-sum">${summary}</p>
        <dl class="gs-fields">${fields}</dl>
        ${flagged ? `<p class="gs-why">I couldn&rsquo;t read the expiry date cleanly: the scan is cut off there. I&rsquo;ve put ${esc(f.valid)}; check it against the file.</p>` : ''}
        <footer><span>${ed ? '' : `<button class="link-btn" type="button" data-peek="${d.code}">Preview</button><button class="link-btn" type="button" data-edit="${d.code}">Make changes</button><button class="link-btn" type="button" data-one="${d.code}">Replace file</button><button class="link-btn" type="button" data-remove="${d.code}">Remove</button>`}</span>
          <span>${ed ? `<button class="link-btn" type="button" data-cancel>Cancel</button><button class="gs-acc" type="button" data-save="${d.code}">${OK}Save changes</button>`
            : f.ok ? `<button class="link-btn" type="button" data-unaccept="${d.code}">Undo</button><span class="gs-acc is-ok">${OK}Accepted</span>` : `<button class="gs-acc" type="button" data-accept="${d.code}">${OK}Accept</button>`}</span></footer>
      </article>`;
    };
    const step2 = () => {
      const list = filed(), left = list.filter((d) => !saved.files[d.code].ok).length;
      return `${sec}<span class="gs-mini" aria-hidden="true"><span class="alma-media">${alma()}</span></span>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">Here&rsquo;s what I read. <span class="soft">Does it look right?</span></h1>
        <p class="lead">Accept each one, or change anything I got wrong. Once you continue, they go into ${A.title}.</p>
        <div class="gs-pane"><div class="gs-bar"><span>${list.length - left} of ${list.length} accepted</span>${editing != null ? '' : left ? `<button class="gs-acc" type="button" data-accept-all>${OK}Accept all</button>` : `<button class="gs-acc" type="button" data-unaccept-all>Unaccept all</button>`}</div>
          <div class="gs-cards">${list.map(card).join('')}</div></div>
        <div class="actions"><button class="btn btn-primary" type="button" data-confirm${list.length && !left && editing == null ? '' : ' disabled'}>Continue</button>
          <button class="link-btn" type="button" data-go="1">Back to upload</button></div>
        ${left ? `<p class="gs-d gs-hint">Accept ${left === 1 ? 'the last document' : `the ${left} documents left`} to continue.</p>` : ''}`;
    };

    // step 3: how complete the section is
    const step3 = () => {
      const p = pct(), missing = docs.filter((d) => !(saved.files[d.code] || {}).ok);
      if (p === 100) {
        return `${sec}<div class="gs-meter is-full"><div><b>100%</b><span>complete</span></div></div>
          <p class="says">ALMA</p>
          <h1 id="gs-title" tabindex="-1">${A.title} is complete, <span class="soft">${esc(nameOf.replace(/\.$/, ''))}.</span></h1>
          <p class="lead">Every one of your ${A.what} is in, checked and in Documents. I&rsquo;ll tell you when one is about to expire, and when a client asks for more.</p>
          <div class="actions"><button class="btn btn-primary" type="button" data-close>${opts.doneLabel || (document.querySelector('#empty') ? 'Go to my company' : `Go to ${A.title}`)}</button></div>`;
      }
      const rows = missing.map((d) => `<li><span class="gs-ic"></span><span><span class="gs-n">${esc(d.name.en)}</span><span class="gs-d">${local(d) ? `In ${where}: ${esc(local(d))}` : esc(d.description.en.split(/(?<=\.)\s/)[0])}</span></span><button class="link-btn" type="button" data-one="${d.code}">Add</button></li>`).join('');
      const one = missing.length === 1;
      return `${sec}<div class="gs-meter" style="--p:${p}"><div><b>${p}%</b><span>complete</span></div></div>
        <p class="says">ALMA</p>
        <h1 id="gs-title" tabindex="-1">${A.title} is ${p}% complete.</h1>
        <p class="lead">${one ? 'One document is' : `${missing.length} documents are`} still missing here. Add ${one ? 'it' : 'them'} now, or later from ${A.title}.</p>
        <div class="gs-pane"><ul class="gs-list" aria-label="Still missing">${rows}</ul></div>
        <div class="actions"><button class="btn btn-primary" type="button" data-more>Add ${one ? 'it' : 'them'} now</button>
          <button class="link-btn" type="button" data-close>Skip for now</button></div>`;
    };

    // between upload and review: she reads each file and checks it at the source
    let checking = null;
    const unchecked = () => filed().filter((d) => !saved.files[d.code].checked);
    // reading: each file added goes to the document it turns out to be; one that isn't among them is kept
    const assign = () => {
      // first the files she recognises by name, then the rest in order; what's left over is kept
      const openDocs = docs.filter((d) => !saved.files[d.code]), extra = [], later = [];
      const give = (name, d) => { openDocs.splice(openDocs.indexOf(d), 1); saved.files[d.code] = read(d, { name }); if (window.CMFiles && held[name]) window.CMFiles.put(d.code, held[name]); };
      st.pending.forEach((name) => { const d = openDocs.length && match({ name }, openDocs); if (d && WORDS(d).some((w) => fold(name).includes(w))) give(name, d); else later.push(name); });
      later.forEach((name) => { if (openDocs.length) give(name, openDocs[0]); else extra.push(name); });
      st.pending = []; st.kept = st.kept.concat(extra); saved.extra += extra.length;
      return extra;
    };
    const checks = (extra) => unchecked().map((d) => {
      const f = saved.files[d.code];
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
      const extra = assign(); keep();
      if (!unchecked().length && !extra.length) { goStep(filed().length ? 2 : 1); return; }
      checking = { rows: checks(extra), at: 0 }; editing = null; paint();
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tick = () => {
        if (!wrap) return;
        checking.at += 1; paint();
        if (checking.at < checking.rows.length) setTimeout(tick, reduced ? 150 : 650);
        else setTimeout(() => { if (!wrap) return; checking.rows.forEach((r) => { if (r[2]) saved.files[r[2]].checked = true; }); checking = null; keep(); goStep(filed().length ? 2 : 1); }, reduced ? 300 : 1300);
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
    let peek = null, peekBack = null, citeAt = null;
    const company = esc(org.name), taxShown = taxNo.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3');
    const paintPeek = () => {
      const d = docs.find((x) => x.code === peek), f = d && saved.files[d.code];
      if (!f) { closePeek(); return; }
      const flagged = f.flag && !f.edited;
      const label = (k, l) => (k === 'ref' && CODE_LABEL[d.code] ? CODE_LABEL[d.code].replace(/^./, (c) => c.toUpperCase()) : l);
      // what she read: the holder first, then the document's own fields
      const rows = [['Holder', company, false], ['Tax number', esc(taxShown || '—'), false]].concat(FIELDS.map(([k, l]) => [label(k, l), esc(f[k]), flagged && f.flag === k]));
      const conf = (flag, i) => (f.edited ? 98 : flag ? 52 : Math.min(99, f.conf + (hash(d.code + i) % 7) - 3));
      const tag = (p) => { const [b, c] = p >= 90 ? ['High', 'b-ok'] : p >= 75 ? ['Medium', 'b-pend'] : ['Low', 'b-over']; return `<span class="co-badge ${c}">${b} confidence</span>`; };
      const read = `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><table class="cd-fields"><tbody>${rows.map(([n, v, fl], i) => `<tr class="${fl ? 'is-flag' : ''}"><td><span class="n">${n}</span></td><td>${fl ? '<span class="cdd-unread">Couldn&rsquo;t read it cleanly</span><span class="cdd-why">The scan is cut off here. I&rsquo;ve put ' + v + '. Check it against the file.</span>' : v}`
        + `<button type="button" class="esgq-src-btn" data-cite="${i}" aria-expanded="${citeAt === i}">${citeAt === i ? 'Hide citation' : 'View citation'}</button>`
        + `<figure class="esgq-src cdd-src"${citeAt === i ? '' : ' hidden'}><figcaption><b>${esc(f.file)}</b><span>Page 1 &middot; ${/date|until/i.test(n) ? 'Validity' : /code|reference|nipc|tax/i.test(n) ? 'Identification' : 'Particulars'}</span></figcaption><blockquote>&ldquo;${n}: <mark${fl ? ' class="is-flag"' : ''}>${fl ? '[cut off at the edge of the scan]' : v}</mark>&rdquo;</blockquote><button type="button" class="esgq-src-open" data-show="${i}">Show on the page</button></figure></td>`
        + `<td>${tag(conf(fl, i))}</td></tr>`).join('')}</tbody></table></section>`;
      dq('gs-dw-t').textContent = d.name.en;
      dq('gs-dw-sub').innerHTML = `${esc(f.file)} &middot; ${esc(DM.LBL.requirement[d.requirement] || '')}`;
      dq('gs-dw-conf').innerHTML = f.edited ? '<span class="co-badge b-neu">Corrected by you</span>' : confTag(f);
      // the file itself, not a page drawn from what she read (js/doc-files.js)
      dq('gs-dw-body').innerHTML = '<div class="cmf-slot" id="gs-dw-file"></div>' + read;
      const slot = dq('gs-dw-file'), at = peek;
      const fill = (html) => { if (peek === at && slot.isConnected) slot.innerHTML = html; };
      if (!window.CMFiles) fill('');
      else window.CMFiles.get(d.code).then((r) => fill(r ? window.CMFiles.view(r) : window.CMFiles.missing(f.file)));
      dq('gs-dw-foot').textContent = f.ok ? 'Accepted' : 'Not accepted yet';
      dq('gs-dw-acts').innerHTML = `<button class="link-btn" type="button" data-dwedit>Make changes</button>${f.ok ? `<span class="gs-acc is-ok">${OK}Accepted</span>` : `<button class="gs-acc" type="button" data-dwaccept>${OK}Accept</button>`}`;
    };
    const openPeek = (code) => { peekBack = document.activeElement; peek = code; citeAt = null; dwEl.hidden = false; paintPeek(); setTimeout(() => dwEl.classList.add('is-open'), 20); dwEl.querySelector('.docd-panel').focus(); };
    const closePeek = () => { if (dwEl.hidden) return; dwEl.classList.remove('is-open'); peek = null; setTimeout(() => { dwEl.hidden = true; }, 250); if (peekBack && peekBack.isConnected) peekBack.focus(); };
    dwEl.addEventListener('click', (e) => {
      const t = (sel) => e.target.closest(sel);
      if (t('[data-dwclose]')) { closePeek(); return; }
      if (t('[data-cite]')) { const i = +t('[data-cite]').dataset.cite; citeAt = citeAt === i ? null : i; paintPeek(); return; }
      if (t('[data-show]')) { const fileEl = dwEl.querySelector('#gs-dw-file'); if (fileEl) fileEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (t('[data-dwaccept]')) { saved.files[peek].ok = true; keep(); paint(); paintPeek(); return; }
      if (t('[data-dwedit]')) { const c = peek; closePeek(); editing = c; paint(); const i = wrap.querySelector(`[data-card="${c}"] .is-flag input`) || wrap.querySelector(`[data-card="${c}"] input`); if (i) i.focus(); }
    });

    let shownStep = 0;
    const paint = () => {
      paintSteps();
      $('gs-body').innerHTML = checking ? validating() : st.step === 1 ? step1() : st.step === 2 ? step2() : step3();
      if (checking && checking.at === 0) { wrap.scrollTop = 0; $('gs-title').focus({ preventScroll: true }); }
      if (shownStep !== st.step) { shownStep = st.step; wrap.scrollTop = 0; $('gs-title').focus({ preventScroll: true }); }
    };
    const goStep = (n) => { st.step = n; editing = null; keep(); paint(); };

    // files in: they wait in "Your files" until she reads them. One given for a named document
    // (Replace in review, Add on the last step) goes straight to it and is read at once.
    const take = (files) => {
      const list = [...files]; if (!list.length) return;
      const one = target; target = null;
      if (one) { saved.files[one] = read(docs.find((x) => x.code === one), list[0]); if (window.CMFiles) window.CMFiles.put(one, list[0]); keep(); validate(); return; }
      list.forEach((file) => { held[file.name] = file; if (!st.pending.includes(file.name)) st.pending.push(file.name); });
      keep();
      if (st.step !== 1) { goStep(1); return; }
      paint();
    };
    const browse = (code) => { target = code || null; $('gs-file').multiple = !code; $('gs-file').value = ''; $('gs-file').click(); };
    $('gs-file').addEventListener('change', () => take($('gs-file').files));
    const dropZone = () => $('gs-drop');
    ['dragover', 'dragenter'].forEach((ev) => wrap.addEventListener(ev, (e) => { e.preventDefault(); if (dropZone()) dropZone().classList.add('is-over'); }));
    wrap.addEventListener('dragleave', (e) => { if (!wrap.contains(e.relatedTarget) && dropZone()) dropZone().classList.remove('is-over'); });
    wrap.addEventListener('drop', (e) => { e.preventDefault(); if (checking) return; if (st.step === 2) goStep(1); take(e.dataTransfer.files); });

    const before = JSON.stringify(accepted(docs).map((d) => d.code));
    const close = () => {
      keep(); wrap.remove(); wrap = null; dwEl.remove(); document.removeEventListener('keydown', onKey);
      document.documentElement.classList.remove('intake-open');
      changedAny = JSON.stringify(accepted(docs).map((d) => d.code)) !== before;
      strip();
      if (opts.onClose) opts.onClose(changedAny);
    };
    const onKey = (e) => { if (e.key !== 'Escape' || !wrap) return; if (peek) { closePeek(); return; } if (editing == null && !checking) close(); };
    document.addEventListener('keydown', onKey);
    wrap.addEventListener('click', (e) => {
      const t = (s) => e.target.closest(s);
      if (checking) return;
      const code = (a) => t(`[data-${a}]`).getAttribute(`data-${a}`);
      if (t('[data-close]')) { e.preventDefault(); close(); return; }
      if (t('[data-peek]')) { openPeek(code('peek')); return; }
      if (t('#gs-drop') || t('[data-browse]')) { browse(); return; }
      if (t('[data-unpend]')) { st.pending.splice(+code('unpend'), 1); keep(); paint(); return; }
      if (t('[data-one]')) { browse(code('one')); return; }
      if (t('[data-step]')) { const n = +code('step'); if (n === 2 && st.step === 1) validate(); else goStep(n); return; }
      if (t('[data-go]')) { const n = +code('go'); if (n === 2) validate(); else goStep(n); return; }
      if (t('[data-more]')) { goStep(1); return; }
      if (t('[data-unaccept-all]')) { filed().forEach((d) => { saved.files[d.code].ok = false; }); keep(); paint(); return; }
      if (t('[data-accept-all]')) { filed().forEach((d) => { saved.files[d.code].ok = true; }); keep(); paint(); return; }
      if (t('[data-accept]')) { saved.files[code('accept')].ok = true; keep(); paint(); return; }
      if (t('[data-unaccept]')) { saved.files[code('unaccept')].ok = false; keep(); paint(); return; }
      if (t('[data-edit]')) {
        editing = code('edit'); paint();
        const i = wrap.querySelector(`[data-card="${editing}"] .is-flag input`) || wrap.querySelector(`[data-card="${editing}"] input`); if (i) i.focus();
        return;
      }
      if (t('[data-cancel]')) { editing = null; paint(); return; }
      if (t('[data-save]')) {
        const c = code('save'), f = saved.files[c], el = wrap.querySelector(`[data-card="${c}"]`);
        let changed = false;
        FIELDS.forEach(([k]) => { const v = el.querySelector(`input[name="${k}"]`).value.trim(); if (v && v !== f[k]) { f[k] = v; changed = true; } });
        // checked by a person: what's there now is what they say, so it reads as sure
        if (changed || f.flag) Object.assign(f, { edited: true, flag: null, conf: 98 });
        f.ok = true; editing = null; keep(); paint(); return;
      }
      if (t('[data-remove]')) { delete saved.files[code('remove')]; keep(); if (!filed().length) goStep(1); else paint(); return; }
      if (t('[data-confirm]')) { st.reviewed = true; goStep(3); return; }
      // anywhere else on a card opens it in the drawer; its own buttons (above) keep their jobs, and
      // a card being edited stays put so its fields can be clicked into
      const cardEl = t('.gs-card');
      if (cardEl && !t('button, a, input, select, textarea, label') && editing !== cardEl.dataset.card) openPeek(cardEl.dataset.card);
    });
    // a step left half-done comes back where it was; one that can't be reached starts at the upload
    if (!reached(st.step - 1)) st.step = 1;
    paint();
    if (opts.files && opts.files.length) take(opts.files);
  };

  // ---- the company homepage's own way in: its drop zone and "Start company profile" ---------------
  // for a company added in this session they open ALMA on the Company section, not the general intake
  if (document.querySelector('#empty')) {
    const intercept = (e) => {
      const z = e.target.closest && e.target.closest('#empty [data-ce-start], #empty #ce-drop, #empty #ce-browse');
      if (!z) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const files = e.type === 'drop' && e.dataTransfer ? e.dataTransfer.files : null;
      if (e.type === 'drop' || e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) open('company', { files, onClose: (c) => { if (c) location.reload(); } });
    };
    ['click', 'drop', 'keydown'].forEach((ev) => document.addEventListener(ev, intercept, true));
    document.addEventListener('dragover', (e) => { if (e.target.closest && e.target.closest('#empty #ce-drop')) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  }
  strip();

  window.CMGuided = { open, asks, has, AREA };
  // the end of creating a company: ALMA on its Company documents, over its homepage
  if (/[?&]guided\b/.test(location.search)) {
    history.replaceState(null, '', location.pathname + location.search.replace(/[?&]guided\b/, '').replace(/^&/, '?') + location.hash);
    if (!has('company')) open('company', { doneLabel: 'Go to my company', onClose: (c) => { if (c) location.reload(); } });
  } else if (O.test && document.querySelector('#empty')) {
    // the test user, back on its homepage: ALMA comes up on the first section with nothing in it yet
    const empty = ['company', 'workers', 'equipment'].find((a) => asks(a).length && !has(a));
    if (empty) setTimeout(() => open(empty, { doneLabel: 'Go to my company', onClose: (c) => { if (c) location.reload(); } }), 650);
  }
})();
