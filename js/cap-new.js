/* Corrective action plan (new-cap.html, from My suppliers' Add a corrective action plan): what every
   supplier must have, and how long it has to provide it. Walmart's (the hidden test user) only.
   1. The documents: any of the company documents C-MORE asks of a US company (js/company-docs.js),
      by section, e.g. the Human Rights and Forced Labour Statement.
   2. The sections: for each, which of the sections ALMA extracts from it it must include (as Set up your
      risk's step 2), e.g. its signatory and reporting year. None ticked: the document itself is enough.
   3. The time: for each, how many days a supplier has from today (the same for all, or one by one).
   Save keeps it (js/cap.js) and opens My suppliers. A supplier missing any of them is alerted on its
   company page and on Documents (js/cap.js). Once it exists, this page opens it to be changed. */
(() => {
  const box = document.getElementById('cap-body'); if (!box) return;
  if (document.documentElement.dataset.persona !== 'walmart' || !window.CM_CAP) { location.replace('suppliers.html'); return; }
  const C = window.CM_CAP, D = window.CM_COMPANY_DOCS;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // the documents to choose from, as an invitation to a supplier lists them (js/supplier-add.js)
  const ALL = (() => {
    const req = D ? D.mandatory('US') : [], opt = D ? D.optional('US').filter((d) => !req.some((r) => r.code === d.code)) : [];
    return req.map((d) => ({ code: d.code, name: d.name.en, section: d.section.en })).concat(opt.map((d) => ({ code: d.code, name: d.name.en, section: d.section.en })));
  })();
  const SECTIONS = [...new Set(ALL.map((d) => d.section))];
  const docOf = (code) => ALL.find((d) => d.code === code);
  const DAYS = [7, 14, 30, 60, 90];
  // the sections ALMA extracts from each (the catalog's fields; the Code of Conduct, not in it yet, as the
  // environmental policy's), shown without their notes in brackets, as the risk's are
  const CAT = (window.DOC_CATALOG && window.DOC_CATALOG.docs) || [];
  const secsOf = (code) => ((CAT.find((d) => d.code === (code === 'CO-COC' ? 'UN-18' : code)) || {}).fields || []).map((x) => x.name);
  const short = window.CM_RISK_SHORT || ((n) => String(n).replace(/\s*\([^)]*\)/g, '').trim());

  const was = C.load();
  const f = { step: 1, docs: was ? was.docs.filter((x) => docOf(x.code)).map((x) => x.code) : [], days: Object.fromEntries((was ? was.docs : []).map((x) => [x.code, +x.days || 30])),
    secs: Object.fromEntries((was ? was.docs : []).map((x) => [x.code, (x.sections || []).filter((n) => secsOf(x.code).includes(n))])), q: '', errs: {} };
  const secsFor = (code) => (f.secs[code] = f.secs[code] || []);
  const daysOf = (code) => (f.days[code] = f.days[code] || 30);
  if (was) { const c = document.getElementById('cap-crumb'); if (c) c.textContent = 'Your corrective action plan'; document.title = 'Your corrective action plan · C-MORE'; }

  const css = `
.nr-card { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.75rem; max-width: 56rem; }
.nr-card-h { display: flex; flex-direction: column; gap: 0.25rem; }
.nr-card-h h2 { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.01em; }
.nr-card-h p { font-size: 0.9375rem; max-width: 42rem; }
.nr-step { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.nr-l { font-size: 0.8125rem; font-weight: 600; }
.nr-hint { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.nr-err { font-size: 0.8125rem; color: var(--color-critical); }
.nr-err:empty { display: none; }
.nr-sep { height: 1px; background: var(--color-mid-beige); }
.nr-foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.nr-foot-r { display: flex; align-items: center; gap: 1rem; margin-left: auto; }
.nr-in { width: 100%; height: 2.875rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-off-white); font: inherit; font-size: 0.9375rem; color: var(--color-ink); outline: none; }
.nr-in:hover { border-color: var(--color-sand-400); }
.nr-in:focus { border-color: var(--color-graphite); background-color: var(--color-surface); }
select.nr-in { appearance: none; width: auto; min-width: 8.5rem; height: 2.5rem; padding-right: 2.25rem; font-size: 0.875rem; cursor: pointer;
  background: var(--color-off-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.75rem center / 1rem; }
.nr-topic { display: flex; flex-direction: column; gap: 0.625rem; }
.nr-topic + .nr-topic { margin-top: 0.75rem; }
.nr-topic .co-sub-head { margin-bottom: 0; }
.nr-fd { display: flex; flex-direction: column; border: 1px solid var(--color-line); border-radius: 0.875rem; overflow: hidden; background: var(--color-surface); }
.nr-fl { margin: 0; padding: 0; list-style: none; }
.nr-fl li + li { border-top: 1px solid var(--color-mid-beige); }
.nr-fl label { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 0.75rem; padding: 0.6875rem 1.125rem; font-size: 0.9375rem; color: var(--color-ink); cursor: pointer; }
.nr-fl label:hover { background: var(--color-off-white); }
.nr-fl input { width: 1.0625rem; height: 1.0625rem; margin: 0; accent-color: var(--color-graphite); cursor: pointer; }
.cap-q { max-width: 26rem; }
.nr-fd-h { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; padding: 0.75rem 1.125rem; background: var(--color-light-beige); }
.nr-fd-h .n { font-size: 0.9375rem; font-weight: 600; }
.nr-fd-h .d { font-size: 0.8125rem; color: var(--color-ink-subtle); white-space: nowrap; }
.nr-fd-r { display: inline-flex; align-items: baseline; gap: 1rem; flex: none; }
.nr-fd-r .link-btn { font-size: 0.8125rem; }
.nr-fd-h + .nr-fl li:first-child { border-top: 1px solid var(--color-mid-beige); }
.cap-secs .nr-fd + .nr-fd { margin-top: 0.75rem; }
/* step 2: a row per document, its days on the right */
.cap-rows li { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 0.5rem 1rem; padding: 0.625rem 1.125rem; }
.cap-rows .n { font-size: 0.9375rem; font-weight: 600; }
.cap-rows .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cap-all { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
@media (max-width: 44rem) { .nr-card { padding: 1.25rem; } .cap-rows li { grid-template-columns: minmax(0, 1fr); } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const head = (n, h, p) => `<div class="nr-card-h"><span class="nr-step">Step ${n} of 3</span><h2 id="cap-h${n}">${h}</h2><p class="co-muted">${p}</p></div>`;
  const foot = (back, next) => `<div class="nr-sep"></div><div class="nr-foot">${back ? '<button type="button" class="link-btn" data-cap-back>Back</button>' : ''}<div class="nr-foot-r"><a class="link-btn" href="suppliers.html">Cancel</a>${next}</div></div>`;
  const dayOpts = (v) => DAYS.map((d) => `<option value="${d}"${+v === d ? ' selected' : ''}>${d} days</option>`).join('');
  const dueText = (days) => C.fmt(C.dueOf({ days }, { on: was ? was.on : C.fmt(new Date()) }));

  // ---- step 1: the documents every supplier must have ----
  const list1 = () => SECTIONS.map((s) => { const l = ALL.filter((d) => d.section === s && (!f.q || fold(`${d.name} ${d.code}`).includes(fold(f.q))));
    return l.length ? `<div class="nr-topic"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${esc(s)}</h3><span class="co-muted">${l.length} document${l.length === 1 ? '' : 's'}</span></div>
      <div class="nr-fd"><ul class="nr-fl">${l.map((d) => `<li><label><input type="checkbox" data-cap-doc="${d.code}"${f.docs.includes(d.code) ? ' checked' : ''}><span>${esc(d.name)}</span></label></li>`).join('')}</ul></div></div>` : ''; }).join('') || '<p class="nr-hint">No document matches that.</p>';
  const step1 = () => `<section class="co-card nr-card" aria-labelledby="cap-h1">
      ${head(1, 'What every supplier must have', 'Choose the documents your suppliers must provide, for example proof they have a human rights policy. Any supplier missing one is alerted, on its company page and in its documents.')}
      <input class="nr-in cap-q" type="search" data-cap-q value="${esc(f.q)}" placeholder="Search documents" aria-label="Search documents" autocomplete="off">
      <span class="nr-hint" aria-live="polite" id="cap-n">${f.docs.length ? `${f.docs.length} document${f.docs.length === 1 ? '' : 's'} chosen` : 'None chosen yet'}</span>
      <div id="cap-list1">${list1()}</div>
      <span class="nr-err">${f.errs.docs || ''}</span>
      ${foot(false, '<button type="button" class="btn btn-primary" data-cap-next>Next: sections</button>')}
    </section>`;

  // ---- step 2: the sections each must include ----
  const stepS = () => `<section class="co-card nr-card" aria-labelledby="cap-h2">
      ${head(2, 'The sections that count', 'When ALMA extracts a document, it reads it in sections. For each document, tick the sections a supplier&rsquo;s must include. None ticked: having the document is enough.')}
      <div class="cap-secs">${f.docs.map((c) => { const all = secsOf(c), on = secsFor(c);
        return `<section class="nr-fd" aria-labelledby="cap-dn-${c}"><div class="nr-fd-h"><span class="n" id="cap-dn-${c}">${esc(docOf(c).name)}</span><span class="nr-fd-r"><span class="d">${on.length} of ${all.length} chosen</span>${all.length ? `<button type="button" class="link-btn" data-cap-all-secs="${c}">${on.length === all.length ? 'Clear all' : 'Select all'}</button>` : ''}</span></div>
          ${all.length ? `<ul class="nr-fl">${all.map((n, i) => `<li><label><input type="checkbox" data-cap-sec="${c}:${i}"${on.includes(n) ? ' checked' : ''}><span>${esc(short(n))}</span></label></li>`).join('')}</ul>` : '<p class="nr-hint" style="padding:0.75rem 1.125rem">ALMA doesn&rsquo;t read sections from this one: having it is enough.</p>'}</section>`; }).join('')}</div>
      ${foot(true, '<button type="button" class="btn btn-primary" data-cap-next>Next: how long they have</button>')}
    </section>`;

  // ---- step 3: how long they have ----
  const step2 = () => `<section class="co-card nr-card" aria-labelledby="cap-h3">
      ${head(3, 'How long they have', 'From today, how many days a supplier has to provide each document. The same for all, or one by one.')}
      <div class="cap-all"><span class="nr-l">Same for all</span><select class="nr-in" data-cap-all aria-label="Days for every document"><option value="">Choose</option>${dayOpts('')}</select></div>
      <div class="nr-fd"><ul class="nr-fl cap-rows">${f.docs.map((c) => `<li><span><span class="n">${esc(docOf(c).name)}</span><span class="d">${secsFor(c).length ? `With ${esc(secsFor(c).map(short).join(', '))} &middot; ` : ''}<span data-due>Due by ${dueText(daysOf(c))}</span></span></span><select class="nr-in" data-cap-days="${c}" aria-label="Days to provide ${esc(docOf(c).name)}">${dayOpts(daysOf(c))}</select></li>`).join('')}</ul></div>
      ${foot(true, `<button type="button" class="btn btn-primary" data-cap-save>${was ? 'Save changes' : 'Save plan'}</button>`)}
    </section>`;

  const paint = (focus) => { box.innerHTML = [step1, stepS, step2][f.step - 1](); if (focus) { const el = box.querySelector(focus); if (el) el.focus({ preventScroll: true }); } };
  const goTo = (n) => { f.step = n; f.errs = {}; paint(); const h = box.querySelector(`#cap-h${n}`); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); h.closest('.nr-card').scrollIntoView({ block: 'start', behavior: 'smooth' }); } };

  box.addEventListener('input', (e) => {
    if (e.target.matches('[data-cap-q]')) { f.q = e.target.value; document.getElementById('cap-list1').innerHTML = list1(); }
  });
  box.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.capDoc) {
      const c = t.dataset.capDoc; f.docs = t.checked ? ALL.map((d) => d.code).filter((x) => x === c || f.docs.includes(x)) : f.docs.filter((x) => x !== c);
      const n = document.getElementById('cap-n'); if (n) n.textContent = f.docs.length ? `${f.docs.length} document${f.docs.length === 1 ? '' : 's'} chosen` : 'None chosen yet';
      if (f.errs.docs && f.docs.length) { f.errs = {}; const er = box.querySelector('.nr-err'); if (er) er.textContent = ''; }
      return;
    }
    if (t.dataset.capSec) { const [c, i] = t.dataset.capSec.split(':'), n = secsOf(c)[+i]; f.secs[c] = t.checked ? secsOf(c).filter((x) => x === n || secsFor(c).includes(x)) : secsFor(c).filter((x) => x !== n); paint(`[data-cap-sec="${c}:${i}"]`); return; }
    if (t.dataset.capDays) { f.days[t.dataset.capDays] = +t.value; t.closest('li').querySelector('[data-due]').textContent = `Due by ${dueText(+t.value)}`; return; }
    if (t.matches('[data-cap-all]') && t.value) { f.docs.forEach((c) => { f.days[c] = +t.value; }); paint('[data-cap-all]'); }
  });
  box.addEventListener('click', (e) => {
    const sa = e.target.closest('[data-cap-all-secs]'); if (sa) { const c = sa.dataset.capAllSecs; f.secs[c] = secsFor(c).length === secsOf(c).length ? [] : secsOf(c).slice(); paint(`[data-cap-all-secs="${c}"]`); return; }
    if (e.target.closest('[data-cap-back]')) { goTo(f.step - 1); return; }
    if (e.target.closest('[data-cap-next]')) {
      if (f.step === 1 && !f.docs.length) { f.errs = { docs: 'Choose at least one document.' }; paint(); box.querySelector('.nr-err').scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
      goTo(f.step + 1); return;
    }
    if (e.target.closest('[data-cap-save]')) {
      const plan = { docs: f.docs.map((c) => ({ code: c, sections: secsFor(c).slice(), days: daysOf(c) })), on: was ? was.on : C.fmt(new Date()), by: 'Walmart' };
      C.save(plan);
      try { sessionStorage.setItem('cm-risk-toast', `Your corrective action plan is ${was ? 'saved' : 'set up'}. Suppliers missing any of its ${plan.docs.length} document${plan.docs.length === 1 ? '' : 's'} are alerted.`); } catch (err) {}
      location.href = 'suppliers.html';
    }
  });
  paint();
})();
