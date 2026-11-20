/* New risk (new-risk.html, from My suppliers' Set up your risk): what the company considers a risk, in
   four steps, as New project's form.
   1. Its name (e.g. "ESG global"), and the documents it looks at: one or more of the CSRD / CSDDD supplier documents (js/risk-docs.js).
   2. For each, which of every field ALMA reads from it count (none ticked to start).
   3. Its levels, from the lowest risk to the highest:
      numbers (1–3, 1–10, 0–20…) or levels the company names (Low, Medium, High…), each with one of
      ten colours (dark green to dark red), set by hand.
   4. What puts a supplier on each level: one or more cases per level, each a set of conditions on
      the documents (missing / shared) and their fields (OK / not OK), e.g. "Compliance Declaration
      is missing" or "Code of Conduct is shared and Audit rights accepted is not OK". A supplier that
      fits cases on more than one level takes the highest risk of them; one that fits none takes the
      level the company picks for that.
   One setup per company, for every supplier. Save keeps it for the tab, per company ('cm-risks…',
   read by js/suppliers-page.js), and opens My suppliers, where every supplier is placed on it. Once
   it exists, this page opens it to be changed. */
(() => {
  const box = document.getElementById('nr-body'); if (!box) return;
  if (document.documentElement.dataset.persona === 'beatriz') { location.replace('my-company.html?filled#products'); return; }
  const ALL = window.CM_RISK_DOCS || [], PICK = window.CM_RISK_PICK || [], short = window.CM_RISK_SHORT || ((n) => n);
  // the documents to choose from, each with every field ALMA reads from it (and, for some, when it's OK):
  // { id, topic, name, desc, fields: [{ name, ok }] }
  const DOCS = ALL.map((d) => { const p = PICK.find((x) => x.id === d.id) || { fields: [] }; return { id: d.id, topic: d.topic, name: d.name, desc: d.desc, fields: d.fields.map((name, i) => ({ name, ok: (p.fields.find((x) => x.i === i) || {}).ok || '' })) }; });
  const docOf = (id) => DOCS.find((d) => d.id === id);
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const get = (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } };

  // where it's kept: per company, as projects are
  const person = get('cm-person') || {}, org = get('cm-org') || 'home', test = /^test@c-more\.test$/i.test(person.email || '');
  const KEY = 'cm-risks' + (org === 'home' && !test ? '' : `-${test ? 'test-' : ''}${org}`);
  const saved = () => get(KEY) || [];

  // the ten colours, dark green to dark red (js/risk-docs.js CM_RISK_COLORS)
  const COLORS = window.CM_RISK_COLORS || [], colorOf = window.CM_RISK_COLOR || ((c) => c);
  const MAX = 20;
  // a colour for each value to start with, spread evenly from dark green (lowest risk) to dark red
  // (highest); the company changes any of them
  const spread = (n) => Array.from({ length: n }, (_, i) => COLORS[Math.round((n === 1 ? 0 : i / (n - 1)) * (COLORS.length - 1))].id);
  const PRESETS = [['1–3', { kind: 'num', from: 1, to: 3 }], ['1–5', { kind: 'num', from: 1, to: 5 }], ['1–10', { kind: 'num', from: 1, to: 10 }], ['Low · Medium · High', { kind: 'lbl', labels: ['Low', 'Medium', 'High'] }]];
  // what a condition can say: about a document, or about one of its fields
  const IS_DOC = [['missing', 'is missing'], ['shared', 'is shared']], IS_FLD = [['bad', 'is not OK'], ['ok', 'is OK']];

  // one setup for the company, applied to every supplier: with one already, this opens it
  const editId = new URLSearchParams(location.search).get('id') || (saved()[0] || {}).id || null;
  const was = editId ? saved().find((r) => r.id === editId) || saved()[0] || null : null;
  // f.fields: { docId: [field names] }; f.rules: per level (index on the scale), its cases, each a
  // list of conditions { doc, field (a name, or null for the document itself), is }
  const f = { step: 1, name: '', kind: 'lbl', from: 1, to: 10, labels: ['Low', 'Medium', 'High'], colors: spread(3), docs: [], fields: {}, rules: [], otherwise: 0, errs: {} };
  if (was) {
    const docs = (was.docs || []).filter((d) => docOf(d.id));
    Object.assign(f, { name: was.name, kind: was.scale.kind, from: was.scale.from ?? 1, to: was.scale.to ?? 10, labels: was.scale.labels || ['Low', 'Medium', 'High'], colors: was.levels.map((l) => colorOf(l.color)),
      docs: docs.map((d) => d.id),
      fields: Object.fromEntries(docs.map((d) => [d.id, (d.fields || []).map((x) => (typeof x === 'string' ? x : x.name)).filter((n) => docOf(d.id).fields.some((y) => y.name === n))])),
      rules: was.levels.map((l) => (l.rules || []).map((ru) => ru.map((c) => Object.assign({}, c)))),
      otherwise: was.otherwise ?? 0 });
    document.title = `${was.name} · C-MORE`;
    const c = document.getElementById('nr-crumb'); if (c) c.textContent = was.name;
  }

  // the values of the scale, lowest risk first
  const values = () => (f.kind === 'num'
    ? (Number.isInteger(+f.from) && Number.isInteger(+f.to) && +f.to > +f.from && +f.to - +f.from < MAX ? Array.from({ length: +f.to - +f.from + 1 }, (_, i) => String(+f.from + i)) : [])
    : f.labels.map((l) => l.trim()));
  const fit = () => { const n = values().length; if (n && f.colors.length !== n) f.colors = spread(n); };

  const css = `
.nr-card { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.75rem; max-width: 56rem; }
.nr-card-h { display: flex; flex-direction: column; gap: 0.25rem; }
.nr-card-h h2 { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.01em; }
.nr-card-h p { font-size: 0.9375rem; max-width: 42rem; }
.nr-step { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.nr-f { display: flex; flex-direction: column; gap: 0.375rem; min-width: 0; }
.nr-f > label, .nr-l { font-size: 0.8125rem; font-weight: 600; }
.nr-in { width: 100%; height: 2.875rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-off-white);
  font: inherit; font-size: 0.9375rem; color: var(--color-ink); outline: none; transition: border-color .14s ease, background-color .14s ease; }
.nr-in:hover { border-color: var(--color-sand-400); }
.nr-in:focus { border-color: var(--color-graphite); background-color: var(--color-surface); }
.nr-in.is-bad { border-color: var(--color-critical); }
select.nr-in { appearance: none; height: 2.5rem; padding-right: 2.25rem; font-size: 0.875rem; cursor: pointer;
  background: var(--color-off-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.75rem center / 1rem; }
select.nr-in:focus { background-color: var(--color-surface); }
.nr-hint { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.nr-err { font-size: 0.8125rem; color: var(--color-critical); }
.nr-err:empty { display: none; }
.nr-sep { height: 1px; background: var(--color-mid-beige); }
.nr-foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.nr-foot-r { display: flex; align-items: center; gap: 1rem; margin-left: auto; }
/* the scale: numbers or named levels, a few ready-made, and a colour for each value */
.nr-seg { display: inline-flex; gap: 0.125rem; padding: 0.1875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); align-self: flex-start; }
.nr-seg button { padding: 0.375rem 0.875rem; border: 0; border-radius: 0.4375rem; background: none; font: inherit; font-size: 0.875rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.nr-seg button[aria-pressed="true"] { background: var(--color-graphite); color: var(--color-off-white); }
.nr-pre { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.nr-pre button { height: 2rem; padding: 0 0.75rem; border: 1px solid var(--color-line); border-radius: 9999px; background: var(--color-surface); font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink); cursor: pointer; }
.nr-pre button:hover { border-color: var(--color-ink-subtle); }
.nr-range { display: grid; grid-template-columns: repeat(2, minmax(0, 9rem)); gap: 1rem; }
.nr-lbls { display: flex; flex-direction: column; gap: 0.5rem; margin: 0; padding: 0; list-style: none; max-width: 30rem; }
.nr-lbls li { display: grid; grid-template-columns: 1.75rem minmax(0, 1fr) auto auto; align-items: center; gap: 0.625rem; }
/* a named level moves up or down, its colour and cases with it */
.nr-mv { display: inline-flex; gap: 0.25rem; }
.nr-mv button { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; padding: 0; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface); color: var(--color-ink-muted); cursor: pointer; }
.nr-mv button:hover:not(:disabled) { border-color: var(--color-ink-subtle); color: var(--color-ink); }
.nr-mv button:disabled { opacity: .35; cursor: default; }
.nr-mv svg { width: 0.875rem; height: 0.875rem; }
.nr-lbls .k { font-size: 0.8125rem; color: var(--color-ink-subtle); text-align: right; font-variant-numeric: tabular-nums; }
.nr-lbls .nr-in { height: 2.5rem; }
.nr-add { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.375rem; }
.nr-add svg { width: 1rem; height: 1rem; }
.nr-vals { display: grid; grid-template-columns: repeat(auto-fill, minmax(16.75rem, 1fr)); gap: 0.625rem; }
.nr-val { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem 0.625rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.nr-v { display: inline-flex; align-self: flex-start; align-items: center; min-height: 1.75rem; padding: 0 0.625rem; border-radius: var(--tag-radius, 0.375rem); font-size: 0.875rem; font-weight: 600; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nr-sw { display: flex; flex-wrap: nowrap; gap: 0.3125rem; padding: 0.1875rem; }
/* a round swatch per colour, the selected one ringed */
.nr-sw button { flex: none; width: 1.125rem; height: 1.125rem; padding: 0; border: 0; border-radius: 50%; cursor: pointer; transition: transform .12s ease; }
.nr-sw button:hover { transform: scale(1.12); }
.nr-sw button[aria-checked="true"] { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.nr-sw button:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.nr-dot { flex: none; width: 0.5rem; height: 0.5rem; margin-right: 0.3125rem; border-radius: 50%; }
.nr-ends { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-ink-subtle); }
/* steps 1 and 2: a bordered list of checkboxes, on the left — the documents by topic (under the app's
   section divider), then the fields of each document chosen */
.nr-topic { display: flex; flex-direction: column; gap: 0.625rem; }
.nr-topic + .nr-topic { margin-top: 0.75rem; }
.nr-topic .co-sub-head { margin-bottom: 0; }
.nr-fd { display: flex; flex-direction: column; border: 1px solid var(--color-line); border-radius: 0.875rem; overflow: hidden; background: var(--color-surface); }
.nr-fd-h { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; padding: 0.75rem 1.125rem; background: var(--color-light-beige); }
.nr-fd-h .n { font-size: 0.9375rem; font-weight: 600; }
.nr-fd-h .d { font-size: 0.8125rem; color: var(--color-ink-subtle); white-space: nowrap; }
.nr-fd-r { display: inline-flex; align-items: baseline; gap: 1rem; flex: none; }
.nr-fd-r .link-btn { font-size: 0.8125rem; }
.nr-fl { margin: 0; padding: 0; list-style: none; }
.nr-fl li + li, .nr-fd-h + .nr-fl li:first-child { border-top: 1px solid var(--color-mid-beige); }
.nr-fl label { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 0.75rem; padding: 0.6875rem 1.125rem; font-size: 0.9375rem; color: var(--color-ink); cursor: pointer; }
.nr-fl label:hover { background: var(--color-off-white); }
.nr-fl input { flex: none; width: 1.0625rem; height: 1.0625rem; margin: 0; accent-color: var(--color-graphite); cursor: pointer; }
/* step 3: a card per level, highest risk first, each with its cases */
.nr-lv { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem 1.125rem; border: 1px solid var(--color-line); border-radius: 0.875rem; background: var(--color-surface); }
.nr-lv-h { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.nr-lv-h .nr-hint { margin-left: auto; }
.nr-case { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem; border: 1px solid var(--color-mid-beige); border-radius: 0.625rem; background: var(--color-off-white); }
.nr-cond { display: grid; grid-template-columns: 2.75rem minmax(0, 1fr) minmax(0, 1.2fr) 8.5rem 4.5rem; align-items: center; gap: 0.5rem; }
.nr-cond .w { font-size: 0.8125rem; font-weight: 600; color: var(--color-ink-subtle); }
.nr-cond select.nr-in { background-color: var(--color-surface); }
.nr-cond .link-btn { justify-self: end; }
.nr-case-f { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-left: 3.25rem; }
.nr-or { display: flex; align-items: center; gap: 0.625rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-subtle); }
.nr-or::before, .nr-or::after { content: ""; flex: 1; height: 1px; background: var(--color-mid-beige); }
.nr-empty { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.nr-else { display: grid; grid-template-columns: minmax(0, 1fr) 14rem; align-items: center; gap: 1rem; padding: 1rem 1.125rem; border: 1px dashed var(--color-sand-400); border-radius: 0.875rem; }
.nr-else .nr-l { display: block; }
.nr-card .btn:disabled { background: var(--color-mid-beige); border-color: transparent; color: var(--color-sand-500); box-shadow: none; cursor: not-allowed; transform: none; }
@media (max-width: 44rem) {
  .nr-card { padding: 1.25rem; }
  .nr-cond { grid-template-columns: minmax(0, 1fr); } .nr-cond .link-btn { justify-self: start; }
  .nr-case-f { padding-left: 0; } .nr-else { grid-template-columns: minmax(0, 1fr); }
}`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const PLUS = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>';
  const UP = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5-5 5 5"/></svg>';
  const DOWN = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 5 5 5-5"/></svg>';
  const STEPS = 4;
  const head = (n, h, p) => `<div class="nr-card-h"><span class="nr-step">Step ${n} of ${STEPS}${n > 1 && f.name.trim() ? ` &middot; ${esc(f.name.trim())}` : ''}</span><h2 id="nr-h${n}">${h}</h2><p class="co-muted">${p}</p></div>`;
  const foot = (back, next) => `<div class="nr-sep"></div><div class="nr-foot">${back ? '<button type="button" class="link-btn" data-nr-back>Back</button>' : ''}<div class="nr-foot-r"><a class="link-btn" href="suppliers.html">Cancel</a>${next}</div></div>`;
  const tag = (v, c) => `<span class="nr-v rk-t-${c}" title="${esc(v)}"><span class="nr-dot rk-d-${c}"></span>${esc(v || '—')}</span>`;

  // ---- step 1: the risk's name, and the documents it looks at ----
  const TOPICS = [...new Set(DOCS.map((d) => d.topic))];
  const fieldsOf = (id) => (f.fields[id] = f.fields[id] || []);
  const step1 = () => `<section class="co-card nr-card" aria-labelledby="nr-h1">
      ${head(1, 'The risk, and the documents it looks at', 'What you call it, and one or more documents from what your suppliers share with you. Next you choose which of the sections ALMA extracts from each count.')}
      <div class="nr-f"><label for="nr-name">Name</label><input class="nr-in${f.errs.name ? ' is-bad' : ''}" id="nr-name" data-nr="name" value="${esc(f.name)}" placeholder="e.g. ESG global" maxlength="60" autocomplete="off"><span class="nr-err">${f.errs.name || ''}</span></div>
      <div class="nr-sep"></div>
      <div class="nr-f"><span class="nr-l">Documents</span></div>
      <span class="nr-hint" aria-live="polite">${f.docs.length ? `${f.docs.length} document${f.docs.length === 1 ? '' : 's'} chosen` : 'None chosen yet'}</span>
      ${TOPICS.map((t) => { const l = DOCS.filter((d) => d.topic === t); return `<div class="nr-topic"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${esc(t)}</h3><span class="co-muted">${l.length} document${l.length === 1 ? '' : 's'}</span></div>
        <div class="nr-fd"><ul class="nr-fl">${l.map((d) => `<li><label><input type="checkbox" data-nr-doc="${d.id}"${f.docs.includes(d.id) ? ' checked' : ''}><span>${esc(d.name)}</span></label></li>`).join('')}</ul></div></div>`; }).join('')}
      <span class="nr-err">${f.errs.docs || ''}</span>
      ${foot(false, '<button type="button" class="btn btn-primary" data-nr-next>Next: sections</button>')}
    </section>`;
  const check1 = () => { const e = {}; if (!f.name.trim()) e.name = 'Name the risk.'; if (!f.docs.length) e.docs = 'Choose at least one document.'; f.errs = e; return !Object.keys(e).length; };

  // ---- step 2: the fields of each document chosen ----
  const stepF = () => `<section class="co-card nr-card" aria-labelledby="nr-h2">
      ${head(2, 'The sections that count', 'When ALMA extracts a document, it reads it in sections. For each document, tick the sections this risk looks at. What&rsquo;s OK or not comes last, when you say what puts a supplier on each level.')}
      ${f.docs.map((id) => { const d = docOf(id), s = fieldsOf(id);
        return `<section class="nr-fd" aria-labelledby="nr-dn-${id}"><div class="nr-fd-h"><span class="n" id="nr-dn-${id}">${esc(d.name)}</span><span class="nr-fd-r"><span class="d">${s.length} of ${d.fields.length} chosen</span><button type="button" class="link-btn" data-nr-all="${id}">${s.length === d.fields.length ? 'Clear' : 'Select all'}</button></span></div>
          <ul class="nr-fl">${d.fields.map((x, i) => `<li><label><input type="checkbox" data-nr-fld="${id}:${i}"${s.includes(x.name) ? ' checked' : ''}><span>${esc(short(x.name))}</span></label></li>`).join('')}</ul></section>`; }).join('')}
      ${foot(true, '<button type="button" class="btn btn-primary" data-nr-next>Next: your levels</button>')}
    </section>`;

  // ---- step 2: the risk, and its levels ----
  const step2 = () => {
    fit();
    const vs = values(), e = f.errs;
    const scaleIn = f.kind === 'num'
      ? `<div class="nr-range"><div class="nr-f"><label for="nr-from">From</label><input class="nr-in${e.scale ? ' is-bad' : ''}" id="nr-from" type="number" step="1" data-nr="from" value="${esc(f.from)}"></div><div class="nr-f"><label for="nr-to">To</label><input class="nr-in${e.scale ? ' is-bad' : ''}" id="nr-to" type="number" step="1" data-nr="to" value="${esc(f.to)}"></div></div>`
      : `<ol class="nr-lbls">${f.labels.map((l, i) => `<li><span class="k">${i + 1}</span><input class="nr-in${e.scale && !l.trim() ? ' is-bad' : ''}" data-nr-lbl="${i}" value="${esc(l)}" maxlength="40" aria-label="Level ${i + 1}" placeholder="${i === 0 ? 'Lowest risk' : i === f.labels.length - 1 ? 'Highest risk' : 'Level ' + (i + 1)}" autocomplete="off"><span class="nr-mv"><button type="button" data-nr-mv="${i}:-1" aria-label="Move level ${i + 1} up"${i ? '' : ' disabled'}>${UP}</button><button type="button" data-nr-mv="${i}:1" aria-label="Move level ${i + 1} down"${i < f.labels.length - 1 ? '' : ' disabled'}>${DOWN}</button></span>${f.labels.length > 2 ? `<button type="button" class="link-btn" data-nr-lrm="${i}" aria-label="Remove level ${i + 1}">Remove</button>` : '<span></span>'}</li>`).join('')}</ol>
         ${f.labels.length < 10 ? `<button type="button" class="btn btn-quiet btn-sm nr-add" data-nr-ladd>${PLUS}Add a level</button>` : ''}`;
    const swatches = vs.map((v, i) => `<div class="nr-val">${tag(v, f.colors[i])}<div class="nr-sw" role="radiogroup" aria-label="Colour for ${esc(v || 'level ' + (i + 1))}">${COLORS.map(({ id, name }) => `<button type="button" role="radio" class="rk-d-${id}" aria-checked="${f.colors[i] === id}" aria-label="${name}" title="${name}" data-nr-col="${i}:${id}"></button>`).join('')}</div></div>`).join('');
    return `<section class="co-card nr-card" aria-labelledby="nr-h3">
      ${head(3, 'Your levels', 'The levels you place your suppliers on: as many as you like, from the lowest risk to the highest, each with its colour.')}
      <div class="nr-f"><span class="nr-l">Levels</span><span class="nr-hint">Numbers, or levels you name. From the lowest risk to the highest.</span></div>
      <div class="nr-seg" role="group" aria-label="Kind of levels"><button type="button" aria-pressed="${f.kind === 'num'}" data-nr-kind="num">Numbers</button><button type="button" aria-pressed="${f.kind === 'lbl'}" data-nr-kind="lbl">Named levels</button></div>
      <div class="nr-pre"><span>Quick start:</span>${PRESETS.map(([l], i) => `<button type="button" data-nr-pre="${i}">${l}</button>`).join('')}</div>
      ${scaleIn}
      <span class="nr-err">${e.scale || ''}</span>
      ${vs.length ? `<div class="nr-f"><span class="nr-l">Colours</span><span class="nr-hint">Pick one of the ten for each level, from dark green to dark red. A supplier on this risk shows its level in that colour.</span></div>
      <div class="nr-vals">${swatches}</div><div class="nr-ends"><span>Lowest risk</span><span>Highest risk</span></div>` : ''}
      ${foot(true, '<button type="button" class="btn btn-primary" data-nr-next>Next: what puts a supplier on each</button>')}
    </section>`;
  };
  const check2 = () => {
    const e = {};
    if (f.kind === 'num') {
      const a = Number(f.from), b = Number(f.to);
      if (!Number.isInteger(a) || !Number.isInteger(b)) e.scale = 'Use whole numbers for both ends.';
      else if (b <= a) e.scale = 'The levels have to go up: “To” is higher than “From”.';
      else if (b - a >= MAX) e.scale = `Up to ${MAX} levels.`;
    } else if (f.labels.some((l) => !l.trim())) e.scale = 'Name every level, or remove the empty ones.';
    else if (new Set(f.labels.map((l) => fold(l.trim()))).size !== f.labels.length) e.scale = 'Each level needs its own name.';
    f.errs = e; return !Object.keys(e).length;
  };

  // ---- step 3: what puts a supplier on each level ----
  // what a condition is about: one of the documents chosen, then one of the sections ALMA extracts
  // from it that count (or the document itself: missing or shared)
  const secs = (id) => docOf(id).fields.filter((x) => fieldsOf(id).includes(x.name));
  const on = (id) => { const s = secs(id); return s.length ? { doc: id, field: s[0].name, is: 'bad' } : { doc: id, field: null, is: 'missing' }; };
  const fresh = () => on(f.docs[0]);
  // keep the cases in step with the documents, fields and levels as they are now
  const tidy = () => {
    const n = values().length;
    f.rules = Array.from({ length: n }, (_, i) => (f.rules[i] || [])
      .map((ru) => ru.filter((c) => f.docs.includes(c.doc) && (c.field == null || fieldsOf(c.doc).includes(c.field))))
      .filter((ru) => ru.length));
    if (!(f.otherwise >= 0 && f.otherwise < n)) f.otherwise = 0;
  };
  const step3 = () => {
    tidy();
    const vs = values();
    const docOpts = (c) => f.docs.map((id) => `<option value="${id}"${c.doc === id ? ' selected' : ''}>${esc(docOf(id).name)}</option>`).join('');
    const secOpts = (c) => `${secs(c.doc).map((x) => `<option value="${esc(x.name)}"${c.field === x.name ? ' selected' : ''}>${esc(short(x.name))}</option>`).join('')}<option value=""${c.field == null ? ' selected' : ''}>The document itself</option>`;
    const cond = (c, i, k, j) => { const isF = c.field != null, ok = isF ? docOf(c.doc).fields.find((x) => x.name === c.field).ok : '';
      return `<div class="nr-cond"><span class="w">${j ? 'and' : 'When'}</span>
        <select class="nr-in" data-nr-subj="${i}:${k}:${j}" aria-label="Document">${docOpts(c)}</select>
        <select class="nr-in" data-nr-sec="${i}:${k}:${j}" aria-label="Section ALMA extracted">${secOpts(c)}</select>
        <select class="nr-in" data-nr-is="${i}:${k}:${j}" aria-label="${isF ? (ok ? `OK means ${esc(ok)}` : 'OK or not') : 'Missing or shared'}" title="${isF && ok ? `OK when ${esc(ok)}` : ''}">${(isF ? IS_FLD : IS_DOC).map(([v, l]) => `<option value="${v}"${c.is === v ? ' selected' : ''}>${l}</option>`).join('')}</select>
        <button type="button" class="link-btn" data-nr-crm="${i}:${k}:${j}" aria-label="Remove this condition">Remove</button></div>`; };
    const level = (i) => { const cs = f.rules[i], end = i === vs.length - 1 ? 'Highest risk' : i === 0 ? 'Lowest risk' : '';
      return `<section class="nr-lv" aria-label="${esc(vs[i])}"><div class="nr-lv-h">${tag(vs[i], f.colors[i])}<span class="nr-hint">${[end, f.otherwise === i ? 'Also anyone who fits no case' : ''].filter(Boolean).join(' &middot; ')}</span></div>
        ${cs.length ? cs.map((ru, k) => `${k ? '<div class="nr-or">or</div>' : ''}<div class="nr-case">${ru.map((c, j) => cond(c, i, k, j)).join('')}<div class="nr-case-f"><button type="button" class="link-btn" data-nr-and="${i}:${k}">+ And</button></div></div>`).join('') : '<span class="nr-empty">No case yet.</span>'}
        <button type="button" class="btn btn-quiet btn-sm nr-add" data-nr-case="${i}">${PLUS}${cs.length ? 'Add another case' : 'Add a case'}</button></section>`; };
    const order = vs.map((_, i) => i).reverse();
    return `<section class="co-card nr-card" aria-labelledby="nr-h4">
      ${head(4, 'What puts a supplier on each level', 'For each level, the cases that put a supplier there: a document missing or shared, one of its sections OK or not. Add as many as you need. A supplier that fits cases on more than one level takes the highest risk of them.')}
      ${order.map(level).join('')}
      <div class="nr-else"><span><span class="nr-l">A supplier that fits no case</span><span class="nr-hint">Where it goes when none of the cases above fit it.</span></span>
        <select class="nr-in" data-nr-else aria-label="Level for a supplier that fits no case">${order.map((i) => `<option value="${i}"${f.otherwise === i ? ' selected' : ''}>${esc(vs[i])}</option>`).join('')}</select></div>
      <span class="nr-err">${f.errs.rules || ''}</span>
      ${foot(true, `<button type="button" class="btn btn-primary" data-nr-save>${was ? 'Save changes' : 'Save risk'}</button>`)}
    </section>`;
  };
  const check3 = () => { tidy(); const any = f.rules.some((cs) => cs.length); f.errs = any ? {} : { rules: 'Add at least one case, so suppliers can be placed on your levels.' }; return any; };

  // ---- drawing, and the moves between steps ----
  const paint = (focus) => {
    box.innerHTML = [step1, stepF, step2, step3][f.step - 1]();
    if (focus) { const el = box.querySelector(focus); if (el) el.focus({ preventScroll: true }); }
  };
  const toTop = () => { const h = box.querySelector('.nr-card'); if (h && h.getBoundingClientRect().top < 0) h.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  const goTo = (n) => { f.step = n; f.errs = {}; paint(); toTop(); const h = box.querySelector(`#nr-h${n}`); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } };
  const bad = () => { paint(); const b = box.querySelector('.is-bad, .nr-err:not(:empty)'); if (b) { b.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (b.matches('input')) b.focus({ preventScroll: true }); } };
  // a scale changed: the values again, and their colours spread again if there are more or fewer
  const rescale = (focus) => { f.errs = Object.assign({}, f.errs, { scale: '' }); fit(); paint(focus); };
  const at = (s) => s.split(':').map(Number);

  box.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.nr === 'name') { f.name = t.value; if (f.errs.name) { delete f.errs.name; t.classList.remove('is-bad'); const er = t.parentNode.querySelector('.nr-err'); if (er) er.textContent = ''; } return; }
    if (t.dataset.nrLbl != null) { f.labels[+t.dataset.nrLbl] = t.value; const v = box.querySelectorAll('.nr-val .nr-v')[+t.dataset.nrLbl]; if (v) v.lastChild.textContent = t.value.trim() || '—'; return; }
  });
  box.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.nr === 'from' || t.dataset.nr === 'to') { f[t.dataset.nr] = t.value === '' ? '' : Number(t.value); rescale(`#${t.id}`); return; }
    // a document chosen starts with none of its fields; unticked, its fields go with it
    if (t.dataset.nrDoc) { const id = t.dataset.nrDoc; f.docs = t.checked ? DOCS.map((d) => d.id).filter((x) => x === id || f.docs.includes(x)) : f.docs.filter((x) => x !== id); f.fields[id] = []; if (f.errs.docs && f.docs.length) f.errs = {}; paint(`[data-nr-doc="${id}"]`); return; }
    if (t.dataset.nrFld) { const [id, i] = t.dataset.nrFld.split(':'), n = docOf(id).fields[+i].name; f.fields[id] = t.checked ? docOf(id).fields.map((x) => x.name).filter((x) => x === n || fieldsOf(id).includes(x)) : fieldsOf(id).filter((x) => x !== n); paint(`[data-nr-fld="${id}:${i}"]`); return; }
    if (t.dataset.nrSubj) { const [i, k, j] = at(t.dataset.nrSubj); f.rules[i][k][j] = on(t.value); paint(`[data-nr-subj="${i}:${k}:${j}"]`); return; }
    if (t.dataset.nrSec) { const [i, k, j] = at(t.dataset.nrSec), c = f.rules[i][k][j]; f.rules[i][k][j] = t.value ? { doc: c.doc, field: t.value, is: c.field == null ? 'bad' : c.is } : { doc: c.doc, field: null, is: 'missing' }; paint(`[data-nr-sec="${i}:${k}:${j}"]`); return; }
    if (t.dataset.nrIs) { const [i, k, j] = at(t.dataset.nrIs); f.rules[i][k][j].is = t.value; return; }
    if (t.dataset.nrElse != null) { f.otherwise = +t.value; paint('[data-nr-else]'); return; }
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input.nr-in')) { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles: true })); const n = box.querySelector('[data-nr-next]'); if (n && f.step === 1 && e.target.id === 'nr-name') n.click(); }
  });
  box.addEventListener('click', (e) => {
    const k = e.target.closest('[data-nr-kind]'); if (k) { f.kind = k.dataset.nrKind; rescale(`[data-nr-kind="${f.kind}"]`); return; }
    const p = e.target.closest('[data-nr-pre]'); if (p) { const s = PRESETS[+p.dataset.nrPre][1]; f.kind = s.kind; if (s.kind === 'num') { f.from = s.from; f.to = s.to; } else f.labels = s.labels.slice(); f.colors = []; rescale(`[data-nr-pre="${p.dataset.nrPre}"]`); return; }
    if (e.target.closest('[data-nr-ladd]')) { f.labels.push(''); rescale(`[data-nr-lbl="${f.labels.length - 1}"]`); return; }
    const lr = e.target.closest('[data-nr-lrm]'); if (lr) { const i = +lr.dataset.nrLrm; f.labels.splice(i, 1); f.colors.splice(i, 1); f.rules.splice(i, 1); if (f.otherwise >= i && f.otherwise > 0) f.otherwise -= 1; rescale('[data-nr-ladd]'); return; }
    const al = e.target.closest('[data-nr-all]'); if (al) { const id = al.dataset.nrAll, d = docOf(id); f.fields[id] = fieldsOf(id).length === d.fields.length ? [] : d.fields.map((x) => x.name); paint(`[data-nr-all="${id}"]`); return; }
    const mv = e.target.closest('[data-nr-mv]'); if (mv && !mv.disabled) { const [i, d] = at(mv.dataset.nrMv), j = i + d; tidy(); [f.labels, f.colors, f.rules].forEach((a) => { [a[i], a[j]] = [a[j], a[i]]; }); if (f.otherwise === i) f.otherwise = j; else if (f.otherwise === j) f.otherwise = i; paint(`[data-nr-lbl="${j}"]`); return; }
    const c = e.target.closest('[data-nr-col]'); if (c) { const [i, col] = c.dataset.nrCol.split(':'); f.colors[+i] = col; paint(`[data-nr-col="${i}:${col}"]`); return; }
    const nc = e.target.closest('[data-nr-case]'); if (nc) { const i = +nc.dataset.nrCase; f.rules[i].push([fresh()]); if (f.errs.rules) f.errs = {}; paint(`[data-nr-subj="${i}:${f.rules[i].length - 1}:0"]`); return; }
    const an = e.target.closest('[data-nr-and]'); if (an) { const [i, kk] = at(an.dataset.nrAnd); f.rules[i][kk].push(fresh()); paint(`[data-nr-subj="${i}:${kk}:${f.rules[i][kk].length - 1}"]`); return; }
    const rm = e.target.closest('[data-nr-crm]'); if (rm) { const [i, kk, j] = at(rm.dataset.nrCrm); f.rules[i][kk].splice(j, 1); if (!f.rules[i][kk].length) f.rules[i].splice(kk, 1); paint(`[data-nr-case="${i}"]`); return; }
    if (e.target.closest('[data-nr-back]')) { goTo(f.step - 1); return; }
    if (e.target.closest('[data-nr-next]')) { if (f.step === 1 ? check1() : f.step === 3 ? check2() : true) goTo(f.step + 1); else bad(); return; }
    if (e.target.closest('[data-nr-save]')) {
      if (!check3()) { bad(); return; }
      const vs = values();
      const risk = { id: was ? was.id : 'rk-' + Date.now().toString(36), name: f.name.trim(),
        scale: f.kind === 'num' ? { kind: 'num', from: +f.from, to: +f.to } : { kind: 'lbl', labels: vs },
        levels: vs.map((v, i) => ({ label: v, color: f.colors[i], rules: f.rules[i] })),
        otherwise: f.otherwise,
        docs: f.docs.map((id) => ({ id, fields: fieldsOf(id).slice() })),
        on: was ? was.on : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) };
      try {
        sessionStorage.setItem(KEY, JSON.stringify([risk]));
        sessionStorage.setItem('cm-risk-toast', `${risk.name} is ${was ? 'saved' : 'set up'}. Every supplier is placed on it below.`);
      } catch (err) {}
      location.href = 'suppliers.html';
    }
  });
  paint();
})();
