/* New risk (new-risk.html, from My suppliers' Define a risk): what the company considers a risk, in
   three steps, as New project's form.
   1. The risk: its name (e.g. "ESG global") and its scale, from the lowest risk to the highest: numbers
      (1–3, 1–10, 0–20…) or levels the company names (Low, Medium, High…), each value with one of the
      four colours (green, yellow, orange, red), set by hand.
   2. The documents it looks at: one or more, from the CSRD / CSDDD supplier documents
      (js/risk-docs.js).
   3. From what ALMA reads in each, the fields it uses, and which of them are required.
   One setup per company, for every supplier. Save keeps it for the tab, per company ('cm-risks…',
   read by js/suppliers-page.js), and opens My suppliers, where every supplier is rated on it. Once
   it exists, this page opens it to be changed. */
(() => {
  const box = document.getElementById('nr-body'); if (!box) return;
  if (document.documentElement.dataset.persona === 'beatriz') { location.replace('my-company.html?filled#products'); return; }
  const DOCS = window.CM_RISK_DOCS || [];
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const get = (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } };

  // where it's kept: per company, as projects are
  const person = get('cm-person') || {}, org = get('cm-org') || 'home', test = /^test@c-more\.test$/i.test(person.email || '');
  const KEY = 'cm-risks' + (org === 'home' && !test ? '' : `-${test ? 'test-' : ''}${org}`);
  const saved = () => get(KEY) || [];

  // the four colours, as the app's tags (css/tags.css)
  const COLORS = [['green', 'Green'], ['yellow', 'Yellow'], ['orange', 'Orange'], ['red', 'Red']];
  const MAX = 20;
  // a colour for each value to start with, spread from green (lowest risk) to red (highest); the
  // company changes any of them
  const spread = (n) => Array.from({ length: n }, (_, i) => { const t = n === 1 ? 0 : i / (n - 1); return t < 0.3 ? 'green' : t < 0.55 ? 'yellow' : t < 0.8 ? 'orange' : 'red'; });
  const PRESETS = [['1–3', { kind: 'num', from: 1, to: 3 }], ['1–5', { kind: 'num', from: 1, to: 5 }], ['1–10', { kind: 'num', from: 1, to: 10 }], ['Low · Medium · High', { kind: 'lbl', labels: ['Low', 'Medium', 'High'] }]];

  // one setup for the company, applied to every supplier: with one already, this opens it
  const editId = new URLSearchParams(location.search).get('id') || (saved()[0] || {}).id || null;
  const was = editId ? saved().find((r) => r.id === editId) || saved()[0] || null : null;
  const f = { step: 1, name: '', kind: 'num', from: 1, to: 10, labels: ['Low', 'Medium', 'High'], colors: spread(10), docs: [], fields: {}, q: '', errs: {} };
  if (was) {
    Object.assign(f, { name: was.name, kind: was.scale.kind, from: was.scale.from ?? 1, to: was.scale.to ?? 10, labels: was.scale.labels || ['Low', 'Medium', 'High'], colors: was.levels.map((l) => l.color),
      docs: was.docs.map((d) => d.id), fields: Object.fromEntries(was.docs.map((d) => { const doc = DOCS.find((x) => x.id === d.id); return [d.id, Object.fromEntries(d.fields.map((x) => [doc ? doc.fields.indexOf(x.name) : -1, x.req ? 'req' : 'use']).filter(([i]) => i >= 0))]; })) });
    document.title = `${was.name} · C-MORE`;
    const c = document.getElementById('nr-crumb'); if (c) c.textContent = was.name;
    const e = document.getElementById('nr-eyebrow'); if (e) e.textContent = 'Your risk';
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
.nr-in:focus { border-color: var(--color-graphite); background: var(--color-surface); }
.nr-in.is-bad { border-color: var(--color-critical); }
.nr-hint { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.nr-err { font-size: 0.8125rem; color: var(--color-critical); }
.nr-err:empty { display: none; }
.nr-sep { height: 1px; background: var(--color-mid-beige); }
.nr-foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.nr-foot-r { display: flex; align-items: center; gap: 1rem; margin-left: auto; }
.nr-h3 { font-size: 1.0625rem; font-weight: 600; }
/* the scale: numbers or named levels, a few ready-made, and a colour for each value */
.nr-seg { display: inline-flex; gap: 0.125rem; padding: 0.1875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); align-self: flex-start; }
.nr-seg button { padding: 0.375rem 0.875rem; border: 0; border-radius: 0.4375rem; background: none; font: inherit; font-size: 0.875rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.nr-seg button[aria-pressed="true"] { background: var(--color-graphite); color: var(--color-off-white); }
.nr-pre { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.nr-pre button { height: 2rem; padding: 0 0.75rem; border: 1px solid var(--color-line); border-radius: 9999px; background: var(--color-surface); font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink); cursor: pointer; }
.nr-pre button:hover { border-color: var(--color-ink-subtle); }
.nr-range { display: grid; grid-template-columns: repeat(2, minmax(0, 9rem)); gap: 1rem; }
.nr-lbls { display: flex; flex-direction: column; gap: 0.5rem; margin: 0; padding: 0; list-style: none; max-width: 30rem; }
.nr-lbls li { display: grid; grid-template-columns: 1.75rem minmax(0, 1fr) auto; align-items: center; gap: 0.625rem; }
.nr-lbls .k { font-size: 0.8125rem; color: var(--color-ink-subtle); text-align: right; font-variant-numeric: tabular-nums; }
.nr-lbls .nr-in { height: 2.5rem; }
.nr-add { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.375rem; }
.nr-add svg { width: 1rem; height: 1rem; }
.nr-vals { display: grid; grid-template-columns: repeat(auto-fill, minmax(16.75rem, 1fr)); gap: 0.625rem; }
.nr-val { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.75rem 0.625rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.nr-val .v { display: inline-flex; align-self: flex-start; align-items: center; min-height: 1.75rem; padding: 0 0.625rem; border-radius: var(--tag-radius, 0.375rem); font-size: 0.875rem; font-weight: 600; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nr-sw { display: flex; flex-wrap: nowrap; gap: 0.25rem; }
.nr-sw button { display: inline-flex; align-items: center; height: 1.5rem; padding: 0 0.4375rem; border: 0; border-radius: var(--tag-radius, 0.375rem); font: inherit; font-size: 0.75rem; font-weight: 600; cursor: pointer; opacity: .55; transition: opacity .12s ease; }
.nr-sw button:hover { opacity: .85; }
.nr-sw button[aria-checked="true"] { opacity: 1; outline: 2px solid var(--color-graphite); outline-offset: 1px; }
.nr-sw button:focus-visible { opacity: 1; outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.nr-c-green { background: var(--tag-green-bg); color: var(--tag-green-fg); } .nr-c-yellow { background: var(--tag-yellow-bg); color: var(--tag-yellow-fg); }
.nr-c-orange { background: var(--tag-orange-bg); color: var(--tag-orange-fg); } .nr-c-red { background: var(--tag-red-bg); color: var(--tag-red-fg); }
/* each colour's dot, as in the matrix tables (css/esg.css .cd-dot): orange and red tags are close, the dots tell them apart */
.nr-dot { flex: none; width: 0.5rem; height: 0.5rem; margin-right: 0.3125rem; border-radius: 50%; }
.nr-dot.is-green { background: var(--color-ok-deep, #8ccb86); } .nr-dot.is-yellow { background: #e7b04a; } .nr-dot.is-orange { background: #e07a3a; } .nr-dot.is-red { background: var(--color-critical); }
.nr-ends { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-ink-subtle); }
/* the documents: by topic, a card each */
.nr-q { max-width: 26rem; }
/* each topic under the app's section divider (as Documents' groups: an eyebrow, and how many) */
.nr-topic { display: flex; flex-direction: column; }
.nr-topic + .nr-topic { margin-top: 0.75rem; }
.nr-docs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(9.0625rem, 1fr); gap: 0.625rem; margin: 0; padding: 0; list-style: none; }
/* every card the same size: each fills its cell, every row as tall as the tallest */
.nr-docs > li { display: flex; min-width: 0; }
.nr-docs > li > .nr-doc { flex: 1; }
.nr-doc > span { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.nr-doc .m { margin-top: auto !important; padding-top: 0.375rem; }
.nr-doc { display: flex; gap: 0.75rem; align-items: flex-start; padding: 0.875rem 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); cursor: pointer; transition: border-color .14s ease, background-color .14s ease; }
.nr-doc:hover { border-color: var(--color-sand-400); }
.nr-doc.is-on { border-color: var(--color-ink-subtle); background: var(--color-off-white); }
.nr-doc input { flex: none; width: 1.0625rem; height: 1.0625rem; margin: 0.125rem 0 0; accent-color: var(--color-graphite); cursor: pointer; }
.nr-doc .n { display: block; font-size: 0.9375rem; font-weight: 600; }
.nr-doc .d { display: block; margin-top: 0.25rem; font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nr-doc .m { display: block; margin-top: 0.375rem; font-size: 0.75rem; color: var(--color-ink-subtle); }
.nr-none { padding: 1.25rem; border: 1px dashed var(--color-sand-400); border-radius: 0.75rem; font-size: 0.875rem; color: var(--color-ink-subtle); text-align: center; }
/* the fields: per document, used or not, and required or not */
.nr-fd { display: flex; flex-direction: column; border: 1px solid var(--color-line); border-radius: 0.875rem; overflow: hidden; }
.nr-fd-h { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.875rem 1.125rem; background: var(--color-light-beige); }
.nr-fd-h .n { font-size: 0.9375rem; font-weight: 600; }
.nr-fd-h .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.nr-fd-h-r { display: flex; align-items: center; gap: 1rem; flex: none; font-size: 0.8125rem; }
.nr-fl { margin: 0; padding: 0; list-style: none; }
.nr-fl li { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 1rem; padding: 0.625rem 1.125rem; border-top: 1px solid var(--color-mid-beige); }
.nr-fl li:first-child { border-top: 0; }
.nr-fl label { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; color: var(--color-ink); cursor: pointer; min-width: 0; }
.nr-fl input { flex: none; width: 1.0625rem; height: 1.0625rem; margin: 0; accent-color: var(--color-graphite); cursor: pointer; }
.nr-req { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.nr-req .nr-seg button { padding: 0.25rem 0.625rem; font-size: 0.8125rem; }
.nr-req .nr-seg button:disabled { cursor: not-allowed; opacity: .45; }
.nr-card .btn:disabled { background: var(--color-mid-beige); border-color: transparent; color: var(--color-sand-500); box-shadow: none; cursor: not-allowed; transform: none; }
@media (max-width: 44rem) { .nr-card { padding: 1.25rem; } .nr-docs { grid-template-columns: minmax(0, 1fr); } .nr-fl li { grid-template-columns: minmax(0, 1fr); gap: 0.5rem; } .nr-req { padding-left: 1.8rem; } .nr-fd-h { flex-direction: column; align-items: flex-start; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const PLUS = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>';
  const STEPS = 3;
  const head = (n, h, p) => `<div class="nr-card-h"><span class="nr-step">Step ${n} of ${STEPS}${n > 1 && f.name.trim() ? ` &middot; ${esc(f.name.trim())}` : ''}</span><h2 id="nr-h${n}">${h}</h2><p class="co-muted">${p}</p></div>`;
  const foot = (back, next) => `<div class="nr-sep"></div><div class="nr-foot">${back ? '<button type="button" class="link-btn" data-nr-back>Back</button>' : ''}<div class="nr-foot-r"><a class="link-btn" href="suppliers.html">Cancel</a>${next}</div></div>`;

  // ---- step 1: the risk and its scale ----
  const step1 = () => {
    fit();
    const vs = values(), e = f.errs;
    const scaleIn = f.kind === 'num'
      ? `<div class="nr-range"><div class="nr-f"><label for="nr-from">From</label><input class="nr-in${e.scale ? ' is-bad' : ''}" id="nr-from" type="number" step="1" data-nr="from" value="${esc(f.from)}"></div><div class="nr-f"><label for="nr-to">To</label><input class="nr-in${e.scale ? ' is-bad' : ''}" id="nr-to" type="number" step="1" data-nr="to" value="${esc(f.to)}"></div></div>`
      : `<ol class="nr-lbls">${f.labels.map((l, i) => `<li><span class="k">${i + 1}</span><input class="nr-in${e.scale && !l.trim() ? ' is-bad' : ''}" data-nr-lbl="${i}" value="${esc(l)}" maxlength="40" aria-label="Level ${i + 1}" placeholder="${i === 0 ? 'Lowest risk' : i === f.labels.length - 1 ? 'Highest risk' : 'Level ' + (i + 1)}" autocomplete="off">${f.labels.length > 2 ? `<button type="button" class="link-btn" data-nr-lrm="${i}" aria-label="Remove level ${i + 1}">Remove</button>` : '<span></span>'}</li>`).join('')}</ol>
         ${f.labels.length < 10 ? `<button type="button" class="btn btn-quiet btn-sm nr-add" data-nr-ladd>${PLUS}Add a level</button>` : ''}`;
    const swatches = vs.map((v, i) => `<div class="nr-val"><span class="v nr-c-${f.colors[i]}" title="${esc(v)}"><span class="nr-dot is-${f.colors[i]}"></span>${esc(v || '—')}</span><div class="nr-sw" role="radiogroup" aria-label="Colour for ${esc(v || 'level ' + (i + 1))}">${COLORS.map(([c, l]) => `<button type="button" role="radio" class="nr-c-${c}" aria-checked="${f.colors[i] === c}" data-nr-col="${i}:${c}"><span class="nr-dot is-${c}"></span>${l}</button>`).join('')}</div></div>`).join('');
    return `<section class="co-card nr-card" aria-labelledby="nr-h1">
      ${head(1, 'The risk', 'What you call it, and the scale you rate your suppliers on: as many values as you like, from the lowest risk to the highest, each with its colour.')}
      <div class="nr-f"><label for="nr-name">Name</label><input class="nr-in${e.name ? ' is-bad' : ''}" id="nr-name" data-nr="name" value="${esc(f.name)}" placeholder="e.g. ESG global" maxlength="60" autocomplete="off"><span class="nr-err">${e.name || ''}</span></div>
      <div class="nr-sep"></div>
      <div class="nr-f"><span class="nr-l">Scale</span><span class="nr-hint">Numbers, or levels you name. From the lowest risk to the highest.</span></div>
      <div class="nr-seg" role="group" aria-label="Kind of scale"><button type="button" aria-pressed="${f.kind === 'num'}" data-nr-kind="num">Numbers</button><button type="button" aria-pressed="${f.kind === 'lbl'}" data-nr-kind="lbl">Named levels</button></div>
      <div class="nr-pre"><span>Quick start:</span>${PRESETS.map(([l], i) => `<button type="button" data-nr-pre="${i}">${l}</button>`).join('')}</div>
      ${scaleIn}
      <span class="nr-err">${e.scale || ''}</span>
      ${vs.length ? `<div class="nr-f"><span class="nr-l">Colours</span><span class="nr-hint">Pick one of the four for each value. A supplier rated on this risk shows its value in that colour.</span></div>
      <div class="nr-vals">${swatches}</div><div class="nr-ends"><span>Lowest risk</span><span>Highest risk</span></div>` : ''}
      ${foot(false, '<button type="button" class="btn btn-primary" data-nr-next>Next: documents</button>')}
    </section>`;
  };
  const check1 = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Name the risk.';
    if (f.kind === 'num') {
      const a = Number(f.from), b = Number(f.to);
      if (!Number.isInteger(a) || !Number.isInteger(b)) e.scale = 'Use whole numbers for both ends.';
      else if (b <= a) e.scale = 'The scale has to go up: “To” is higher than “From”.';
      else if (b - a >= MAX) e.scale = `Up to ${MAX} values.`;
    } else if (f.labels.some((l) => !l.trim())) e.scale = 'Name every level, or remove the empty ones.';
    else if (new Set(f.labels.map((l) => fold(l.trim()))).size !== f.labels.length) e.scale = 'Each level needs its own name.';
    f.errs = e; return !Object.keys(e).length;
  };

  // ---- step 2: the documents ----
  const TOPICS = [...new Set(DOCS.map((d) => d.topic))];
  const first = (t) => { const m = String(t).match(/^.*?[.!?](\s|$)/); return m ? m[0].trim() : t; };
  const step2 = () => {
    const q = fold(f.q.trim()), hit = (d) => !q || fold(`${d.name} ${d.topic} ${d.desc}`).includes(q);
    const groups = TOPICS.map((t) => [t, DOCS.filter((d) => d.topic === t && hit(d))]).filter(([, l]) => l.length);
    return `<section class="co-card nr-card" aria-labelledby="nr-h2">
      ${head(2, 'The documents it looks at', 'One or more. For each, ALMA reads what&rsquo;s in it when a supplier shares it; next, you choose which of that counts.')}
      <div class="nr-f nr-q"><input class="nr-in" id="nr-q" type="search" aria-label="Find a document" placeholder="Search documents" value="${esc(f.q)}" autocomplete="off"></div>
      <span class="nr-hint" aria-live="polite">${f.docs.length ? `${f.docs.length} document${f.docs.length === 1 ? '' : 's'} chosen` : 'None chosen yet'}</span>
      ${groups.length ? groups.map(([t, l]) => `<div class="nr-topic"><div class="co-sub-head cd-group-k"><h3 class="eyebrow">${esc(t)}</h3><span class="co-muted">${l.length} document${l.length === 1 ? '' : 's'}</span></div><ul class="nr-docs">${l.map((d) => { const on = f.docs.includes(d.id); return `<li><label class="nr-doc${on ? ' is-on' : ''}"><input type="checkbox" data-nr-doc="${d.id}"${on ? ' checked' : ''}><span><span class="n">${esc(d.name)}</span><span class="d">${esc(first(d.desc))}</span><span class="m">${d.fields.length} fields ALMA reads${d.country ? ` &middot; ${esc(d.country)}` : ''}</span></span></label></li>`; }).join('')}</ul></div>`).join('') : '<p class="nr-none">No document matches that.</p>'}
      <span class="nr-err">${f.errs.docs || ''}</span>
      ${foot(true, '<button type="button" class="btn btn-primary" data-nr-next>Next: fields</button>')}
    </section>`;
  };
  const check2 = () => { f.errs = f.docs.length ? {} : { docs: 'Choose at least one document.' }; return !f.errs.docs; };

  // ---- step 3: the fields, used and required ----
  const fieldsOf = (id) => (f.fields[id] = f.fields[id] || {});
  const step3 = () => {
    const card = (id) => {
      const d = DOCS.find((x) => x.id === id); if (!d) return '';
      const s = fieldsOf(id), used = Object.keys(s).length, req = Object.values(s).filter((v) => v === 'req').length;
      return `<section class="nr-fd" aria-label="${esc(d.name)}"><div class="nr-fd-h"><span><span class="n">${esc(d.name)}</span><span class="d">${esc(d.topic)} &middot; ${used} of ${d.fields.length} fields used &middot; ${req} required</span></span>
        <span class="nr-fd-h-r"><button type="button" class="link-btn" data-nr-all="${id}">${used === d.fields.length ? 'Use none' : 'Use all'}</button></span></div>
        <ul class="nr-fl">${d.fields.map((name, i) => { const v = s[i]; return `<li class="${v ? '' : 'is-off'}"><label><input type="checkbox" data-nr-use="${id}:${i}"${v ? ' checked' : ''}><span>${esc(name)}</span></label>
          <span class="nr-req"><span>Required</span><span class="nr-seg" role="group" aria-label="${esc(name)}: required"><button type="button" aria-pressed="${v === 'req'}" data-nr-req="${id}:${i}:1"${v ? '' : ' disabled'}>Yes</button><button type="button" aria-pressed="${v === 'use'}" data-nr-req="${id}:${i}:0"${v ? '' : ' disabled'}>No</button></span></span></li>`; }).join('')}</ul></section>`;
    };
    return `<section class="co-card nr-card" aria-labelledby="nr-h3">
      ${head(3, 'What counts, and what&rsquo;s required', 'Tick the fields this risk uses from what ALMA reads. Each one ticked is required; set it to No to keep it without requiring it. A supplier&rsquo;s value on your scale follows how many of the required ones it meets.')}
      ${f.docs.map(card).join('')}
      <span class="nr-err">${f.errs.fields || ''}</span>
      ${foot(true, `<button type="button" class="btn btn-primary" data-nr-save>${was ? 'Save changes' : 'Save risk'}</button>`)}
    </section>`;
  };
  const check3 = () => { const any = f.docs.some((id) => Object.values(fieldsOf(id)).includes('req')); f.errs = any ? {} : { fields: 'Set Required to Yes on at least one ticked field, so suppliers can be rated on it.' }; return any; };

  // ---- drawing, and the moves between steps ----
  const paint = (focus) => {
    box.innerHTML = f.step === 1 ? step1() : f.step === 2 ? step2() : step3();
    if (focus) { const el = box.querySelector(focus); if (el) el.focus({ preventScroll: true }); }
  };
  const toTop = () => { const h = box.querySelector('.nr-card'); if (h && h.getBoundingClientRect().top < 0) h.scrollIntoView({ block: 'start', behavior: 'smooth' }); };
  const goTo = (n) => { f.step = n; f.errs = {}; paint(); toTop(); const h = box.querySelector(`#nr-h${n}`); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } };
  const bad = () => { paint(); const b = box.querySelector('.is-bad, .nr-err:not(:empty)'); if (b) { b.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (b.matches('input')) b.focus({ preventScroll: true }); } };
  // a scale changed: the values again, and their colours spread again if there are more or fewer
  const rescale = (focus) => { f.errs = Object.assign({}, f.errs, { scale: '' }); fit(); paint(focus); };

  box.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'nr-q') { f.q = t.value; const at = t.selectionStart; paint('#nr-q'); const q = box.querySelector('#nr-q'); if (q) q.setSelectionRange(at, at); return; }
    if (t.dataset.nr === 'name') { f.name = t.value; if (f.errs.name) { delete f.errs.name; t.classList.remove('is-bad'); const er = t.parentNode.querySelector('.nr-err'); if (er) er.textContent = ''; } return; }
    if (t.dataset.nrLbl != null) { f.labels[+t.dataset.nrLbl] = t.value; const v = box.querySelectorAll('.nr-val .v')[+t.dataset.nrLbl]; if (v) v.textContent = t.value.trim() || '—'; return; }
  });
  box.addEventListener('change', (e) => {
    const t = e.target;
    if (t.dataset.nr === 'from' || t.dataset.nr === 'to') { f[t.dataset.nr] = t.value === '' ? '' : Number(t.value); rescale(`#${t.id}`); return; }
    if (t.dataset.nrDoc) { const id = t.dataset.nrDoc; f.docs = t.checked ? f.docs.concat(id) : f.docs.filter((x) => x !== id); if (f.errs.docs && f.docs.length) f.errs = {}; paint(`[data-nr-doc="${id}"]`); return; }
    if (t.dataset.nrUse) { const [id, i] = t.dataset.nrUse.split(':'), s = fieldsOf(id); if (t.checked) s[i] = 'req'; else delete s[i]; if (f.errs.fields) f.errs = {}; paint(`[data-nr-use="${id}:${i}"]`); return; }
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input.nr-in:not(#nr-q)')) { e.preventDefault(); e.target.dispatchEvent(new Event('change', { bubbles: true })); const n = box.querySelector('[data-nr-next]'); if (n && f.step === 1 && e.target.id === 'nr-name') n.click(); }
  });
  box.addEventListener('click', (e) => {
    const k = e.target.closest('[data-nr-kind]'); if (k) { f.kind = k.dataset.nrKind; rescale(`[data-nr-kind="${f.kind}"]`); return; }
    const p = e.target.closest('[data-nr-pre]'); if (p) { const s = PRESETS[+p.dataset.nrPre][1]; f.kind = s.kind; if (s.kind === 'num') { f.from = s.from; f.to = s.to; } else f.labels = s.labels.slice(); f.colors = []; rescale(`[data-nr-pre="${p.dataset.nrPre}"]`); return; }
    if (e.target.closest('[data-nr-ladd]')) { f.labels.push(''); rescale(`[data-nr-lbl="${f.labels.length - 1}"]`); return; }
    const lr = e.target.closest('[data-nr-lrm]'); if (lr) { f.labels.splice(+lr.dataset.nrLrm, 1); f.colors.splice(+lr.dataset.nrLrm, 1); rescale('[data-nr-ladd]'); return; }
    const c = e.target.closest('[data-nr-col]'); if (c) { const [i, col] = c.dataset.nrCol.split(':'); f.colors[+i] = col; paint(`[data-nr-col="${i}:${col}"]`); return; }
    const all = e.target.closest('[data-nr-all]'); if (all) { const id = all.dataset.nrAll, d = DOCS.find((x) => x.id === id), s = fieldsOf(id); if (Object.keys(s).length === d.fields.length) f.fields[id] = {}; else d.fields.forEach((_, i) => { s[i] = s[i] || 'req'; }); paint(`[data-nr-all="${id}"]`); return; }
    const r = e.target.closest('[data-nr-req]'); if (r && !r.disabled) { const [id, i, y] = r.dataset.nrReq.split(':'); fieldsOf(id)[i] = y === '1' ? 'req' : 'use'; if (f.errs.fields && y === '1') f.errs = {}; paint(`[data-nr-req="${id}:${i}:${y}"]`); return; }
    if (e.target.closest('[data-nr-back]')) { goTo(f.step - 1); return; }
    if (e.target.closest('[data-nr-next]')) { if (f.step === 1 ? check1() : check2()) goTo(f.step + 1); else bad(); return; }
    if (e.target.closest('[data-nr-save]')) {
      if (!check3()) { bad(); return; }
      const vs = values();
      const risk = { id: was ? was.id : 'rk-' + Date.now().toString(36), name: f.name.trim(),
        scale: f.kind === 'num' ? { kind: 'num', from: +f.from, to: +f.to } : { kind: 'lbl', labels: vs },
        levels: vs.map((v, i) => ({ label: v, color: f.colors[i] })),
        docs: f.docs.map((id) => { const d = DOCS.find((x) => x.id === id), s = fieldsOf(id); return { id, fields: Object.keys(s).map(Number).sort((a, b) => a - b).map((i) => ({ name: d.fields[i], req: s[i] === 'req' })) }; }),
        on: was ? was.on : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) };
      try {
        sessionStorage.setItem(KEY, JSON.stringify([risk]));
        sessionStorage.setItem('cm-risk-toast', `${risk.name} is ${was ? 'saved' : 'set up'}. Every supplier is rated on it below.`);
      } catch (err) {}
      location.href = 'suppliers.html';
    }
  });
  paint();
})();
