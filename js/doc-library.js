/* The company's C-MORE library: everything it already has here, to upload again from C-MORE rather
   than from the device — the same file can go to as many steps and documents as it needs to.
   ALMA's upload (js/doc-upload.js) and her setup (js/guided-upload.js) offer it next to "browse
   your device". What is picked is a copy, named after the document it is (so ALMA reads it as that
   one) or, not filed yet, as it was uploaded; the one on file stays where it is.
   What it lists:
     Uploaded by you  every file uploaded for the company in this browser (js/doc-files.js): filed
                      as a document, waiting in the setup, or in Uncategorized documents;
     On file          the company's documents, workers' and machines' copies that have a file but
                      weren't uploaded here (the demo company's), and Uncategorized ones likewise.
   window.CMLibrary: has() → whether there's anything to pick; pick({ multiple, title }) →
   Promise<File[] | null>; button(attrs) → the button the uploaders show.
   Prototype: a document never uploaded in this browser comes as a one-page PDF saying what it is. */
window.CMLibrary = (() => {
  const M = () => window.DOC_MODEL;
  const NO_FILE = ['missing', 'na', 'notrequested', 'notuploaded', 'filemissing', 'archived', 'rejected'];
  const esc = (s) => String(s == null ? '' : s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const plain = (h) => { const el = document.createElement('textarea'); el.innerHTML = String(h).replace(/<[^>]+>/g, ''); return el.value; };
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const size = (b) => (!b ? '' : b < 1e6 ? Math.max(1, Math.round(b / 1e3)) + ' KB' : (b / 1e6).toFixed(1) + ' MB');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const when = (t) => { if (!t) return ''; const d = new Date(t), now = new Date(); return d.toDateString() === now.toDateString() ? 'today' : `${d.getDate()} ${MON[d.getMonth()]}${d.getFullYear() === now.getFullYear() ? '' : ' ' + d.getFullYear()}`; };
  const kindOf = (name, type) => (/pdf/.test(type || '') || /\.pdf$/i.test(name || '') ? 'pdf' : /^image\//.test(type || '') || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(name || '') ? 'img' : 'doc');

  // what a stored file is: the document it was filed as, or where it waits
  const docOf = (code) => M().DOCS.find((d) => d.code === code);
  const setupFiles = () => { const o = M().ORG; if (!o) return {}; try { return (JSON.parse(sessionStorage.getItem('cm-guided-' + o.id) || 'null') || {}).files || {}; } catch (e) { return {}; } };
  const describe = (r) => {
    const D = M(), c = r.code;
    if (c.startsWith('~job:')) return null; // a job still being read: its files are under their own names
    if (c.startsWith('~')) {
      const name = c.slice(1), hit = Object.entries(setupFiles()).find(([, f]) => f.file === name), d = hit && docOf(hit[0]);
      return d ? { title: plain(d.name), area: d.area, note: hit[1].ok ? 'Filed in the setup' : 'Read in the setup', base: plain(d.name) } : { title: name, area: '', note: 'Uploaded in the setup', base: '' };
    }
    if (c.startsWith('uncat:')) { const x = window.CMUncat && window.CMUncat.get(c.slice(6)); return { title: x ? x.name || x.file : r.name, area: '__u', note: x ? 'In Uncategorized documents' : 'Uploaded', base: '' }; }
    const [code, i] = c.split('#'), d = docOf(code); if (!d) return null;
    if (i != null && d.kind) { const who = plain(D.recordName(d.kind, +i)); return { title: plain(d.name), who, area: d.area, note: 'Filed in Documents', base: `${plain(d.name)} - ${who}` }; }
    return { title: plain(d.name), area: d.area, note: 'Filed in Documents', base: plain(d.name) };
  };

  // the files uploaded here, read once per pick (and at load, so has() knows)
  let stored = [];
  const refresh = () => (window.CMFiles && window.CMFiles.all ? window.CMFiles.all() : Promise.resolve([])).then((l) => { stored = l; return l; });
  if (window.CMFiles && window.CMFiles.put) { const put = window.CMFiles.put; window.CMFiles.put = (...a) => put(...a).then((v) => { refresh(); return v; }); }
  refresh();

  const items = () => {
    const D = M(); if (!D) return [];
    const out = [], seenFile = new Set(), withFile = new Set();
    // uploaded by you, newest first; the same file kept twice (in the setup and filed) once, as filed
    stored.map((r) => ({ r, x: describe(r) })).filter((y) => y.x)
      .sort((a, b) => (b.x.base ? 1 : 0) - (a.x.base ? 1 : 0) || (b.r.at || 0) - (a.r.at || 0))
      .forEach(({ r, x }) => {
        const id = `${r.name}|${r.size}`; if (seenFile.has(id)) return; seenFile.add(id); withFile.add(r.code);
        out.push(Object.assign({ key: 'f:' + r.code, src: 'up', rec: r, file: r.name, size: r.size, at: r.at, kind: kindOf(r.name, r.type), status: '' }, x));
      });
    out.sort((a, b) => (b.at || 0) - (a.at || 0));
    // on file, never uploaded here
    const order = (D.AREAS || []).map((a) => a.key), on = [], seen = new Set();
    D.DOCS.filter((d) => d.code && !d.kind && !NO_FILE.includes(d.status) && !withFile.has(d.code)).forEach((d) => {
      if (seen.has(d.code)) return; seen.add(d.code);
      on.push({ key: 'd:' + d.code, src: 'on', title: plain(d.name), area: d.area, status: d.status, until: d.valid, base: plain(d.name), kind: 'pdf' });
    });
    D.DOCS.filter((d) => d.code && d.kind && d.status !== 'na').forEach((d) => (d.roster || []).filter((r) => !NO_FILE.includes(r.status) && !withFile.has(`${d.code}#${r.i}`)).forEach((r) => {
      const k = `${d.code}#${r.i}`; if (seen.has(k)) return; seen.add(k);
      const who = plain(D.recordName(d.kind, r.i));
      on.push({ key: 'd:' + k, src: 'on', title: plain(d.name), who, area: d.area, status: r.status, until: r.exp, base: `${plain(d.name)} - ${who}`, kind: 'pdf' });
    }));
    if (window.CMUncat) window.CMUncat.list().filter((x) => !withFile.has('uncat:' + x.id)).forEach((x) => on.push({ key: 'd:uncat:' + x.id, src: 'on', title: x.name || x.file, file: x.file, area: '__u', status: '', base: '', kind: kindOf(x.file) }));
    on.sort((a, b) => (a.area === '__u') - (b.area === '__u') || order.indexOf(a.area) - order.indexOf(b.area));
    return out.concat(on);
  };
  const areaTitle = (a) => (a === '__u' ? 'Uncategorized' : !a ? 'Not filed yet' : (M().AREA_TITLE || {})[a] || 'Other');
  const has = () => items().length > 0;

  // a one-page PDF saying what the document is (ASCII only: the built-in font has no accents)
  const pdf = (lines) => {
    const t = (s) => fold(s).replace(/[^\x20-\x7e]/g, '').replace(/[\\()]/g, '\\$&');
    const text = lines.filter(Boolean).map((l, i) => `BT /F1 ${i ? 11 : 16} Tf 56 ${770 - i * 26} Td (${t(l)}) Tj ET`).join('\n');
    const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
      `<< /Length ${text.length} >>\nstream\n${text}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
    let s = '%PDF-1.4\n'; const at = [];
    objs.forEach((o, i) => { at.push(s.length); s += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const x = s.length;
    s += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${at.map((n) => String(n).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
    return new Blob([s], { type: 'application/pdf' });
  };
  // the file as stored, or (never uploaded here) the made-up page
  const recOf = (it) => {
    if (it.rec) return it.rec;
    const blob = pdf([it.base || it.title, it.who ? `For ${it.who}` : M().D && plain(M().D.company), it.until && /\d{4}/.test(it.until) ? `Valid until ${it.until}` : '', 'From the C-MORE library']);
    return { name: (it.base || it.title) + '.pdf', type: 'application/pdf', size: blob.size, blob };
  };
  const fileOf = (it) => {
    const r = recOf(it), ext = (r.name.match(/\.[a-z0-9]+$/i) || ['.pdf'])[0];
    const name = it.base ? (it.base + ext).replace(/[\\/:*?"<>|]+/g, ' ') : r.name;
    const f = new File([r.blob], name, { type: r.type || 'application/pdf' }); f.cmLibrary = it.key;
    return f;
  };

  const LIB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 4 18.5z"/><path d="M10 7.5h3.5A1.5 1.5 0 0 1 15 9v9.5a1.5 1.5 0 0 1-1.5 1.5H10"/><path d="m15.2 8.6 2.9-.8a1.5 1.5 0 0 1 1.8 1l2.3 8.5a1.5 1.5 0 0 1-1 1.8l-2.9.8a1.5 1.5 0 0 1-1.8-1"/></svg>';
  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>';
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.75"/></svg>';
  const BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  const css = `
.cml { position: fixed; inset: 0; z-index: 200; /* over ALMA's upload (120) and her setup */ display: grid; place-items: center; padding: 1.5rem; }
.cml-scrim { position: absolute; inset: 0; background: rgba(36, 36, 36, .45); opacity: 0; transition: opacity .2s; }
.cml.is-open .cml-scrim { opacity: 1; }
.cml-panel { position: relative; width: min(46rem, 100%); height: min(88vh, 44rem); display: flex; flex-direction: column; overflow: hidden; border-radius: 1rem; background: var(--color-surface, #fff); box-shadow: 0 28px 72px -18px rgba(36, 36, 36, .4); opacity: 0; transform: translateY(10px) scale(.99); transition: opacity .2s, transform .2s; outline: none; text-align: left; }
.cml.is-open .cml-panel { opacity: 1; transform: none; }
.cml-head { display: flex; align-items: flex-start; gap: 1rem; padding: 1.375rem 1.5rem 1rem; }
.cml-head > div { flex: 1; min-width: 0; }
.cml-eb { display: inline-flex; align-items: center; gap: 0.375rem; margin-bottom: 0.375rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-subtle); }
.cml-eb svg { width: 0.875rem; height: 0.875rem; color: var(--color-coral); }
.cml-head h2 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em; color: var(--color-ink); }
.cml-head p { margin-top: 0.25rem; font-size: 0.8125rem; line-height: 1.5; color: var(--color-ink-subtle); }
.cml-x { flex: none; width: 2.25rem; height: 2.25rem; display: grid; place-items: center; margin: -0.25rem -0.5rem 0 0; border: 0; border-radius: 0.5rem; background: none; color: var(--color-ink); cursor: pointer; }
.cml-x:hover { background: var(--color-mid-beige); }
.cml-x svg { width: 1.125rem; height: 1.125rem; }
.cml-tools { display: grid; gap: 0.75rem; padding: 0 1.5rem 0.875rem; border-bottom: 1px solid var(--color-line); }
.cml-find { position: relative; }
.cml-find svg { position: absolute; left: 0.875rem; top: 50%; width: 1rem; height: 1rem; translate: 0 -50%; color: var(--color-ink-subtle); pointer-events: none; }
.cml-find input { width: 100%; height: 2.625rem; padding: 0 0.875rem 0 2.5rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-off-white); font: inherit; font-size: 0.875rem; color: var(--color-ink); transition: border-color .15s, background .15s; }
.cml-find input:focus { outline: none; border-color: var(--color-graphite); background: var(--color-surface); }
.cml-tabs { display: flex; gap: 0.375rem; overflow-x: auto; scrollbar-width: none; margin: 0 -1.5rem; padding: 0 1.5rem; }
.cml-tabs::-webkit-scrollbar { display: none; }
.cml-tabs button { flex: none; display: inline-flex; align-items: center; gap: 0.375rem; height: 2rem; padding: 0 0.75rem; border: 1px solid var(--color-line); border-radius: 999px; background: var(--color-surface); font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink); cursor: pointer; white-space: nowrap; }
.cml-tabs button:hover { border-color: var(--color-sand-400); }
.cml-tabs button span { font-size: 0.75rem; color: var(--color-ink-subtle); font-variant-numeric: tabular-nums; }
.cml-tabs button[aria-pressed="true"] { border-color: var(--color-graphite); background: var(--color-graphite); color: var(--color-off-white); }
.cml-tabs button[aria-pressed="true"] span { color: inherit; opacity: .7; }
.cml-body { flex: 1; min-height: 0; overflow: auto; padding: 0 1.5rem 1rem; overscroll-behavior: contain; }
.cml-g h3 { position: sticky; top: 0; z-index: 1; display: flex; justify-content: space-between; padding: 1rem 0 0.5rem; background: var(--color-surface); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-subtle); }
.cml-g h3 span { font-weight: 500; letter-spacing: 0; text-transform: none; }
.cml-g ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.375rem; }
.cml-row { position: relative; display: flex; align-items: center; gap: 0.875rem; padding: 0.625rem 0.75rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); cursor: pointer; transition: border-color .15s, background .15s, box-shadow .15s; }
.cml-row:hover { border-color: var(--color-sand-400); }
.cml-row:has(input:focus-visible) { box-shadow: 0 0 0 2px var(--color-graphite); }
.cml-row.is-on { border-color: var(--color-graphite); background: var(--color-off-white); }
.cml-row input { position: absolute; opacity: 0; pointer-events: none; }
.cml-ck { flex: none; width: 1.25rem; height: 1.25rem; display: grid; place-items: center; border: 1.5px solid var(--color-sand-400); border-radius: 0.375rem; background: var(--color-surface); color: var(--color-off-white); transition: background .15s, border-color .15s; }
.cml-ck.is-r { border-radius: 999px; }
.cml-ck svg { width: 0.75rem; height: 0.75rem; opacity: 0; }
.cml-row.is-on .cml-ck { border-color: var(--color-graphite); background: var(--color-graphite); }
.cml-row.is-on .cml-ck svg { opacity: 1; }
.cml-ft { flex: none; width: 2.25rem; height: 2.75rem; display: grid; place-items: end center; padding-bottom: 0.375rem; border-radius: 0.3125rem; background: var(--color-mid-beige); font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.04em; color: var(--color-ink-muted, #555); clip-path: polygon(0 0, 68% 0, 100% 24%, 100% 100%, 0 100%); }
.cml-ft.is-pdf { background: color-mix(in oklab, var(--color-coral) 22%, var(--color-surface)); color: var(--color-graphite); }
.cml-ft.is-img { background: color-mix(in oklab, var(--color-ok, #a6d8a0) 45%, var(--color-surface)); color: var(--color-graphite); }
.cml-n { flex: 1; min-width: 0; display: grid; gap: 0.125rem; }
.cml-n b { font-size: 0.875rem; font-weight: 600; line-height: 1.35; color: var(--color-ink); overflow-wrap: anywhere; }
.cml-n small { font-size: 0.75rem; line-height: 1.4; color: var(--color-ink-subtle); overflow-wrap: anywhere; }
.cml-r { flex: none; display: flex; align-items: center; gap: 0.5rem; }
.cml-pv { width: 2rem; height: 2rem; display: grid; place-items: center; border: 0; border-radius: 0.5rem; background: none; color: var(--color-ink-subtle); cursor: pointer; }
.cml-pv:hover { background: var(--color-mid-beige); color: var(--color-ink); }
.cml-pv svg { width: 1.125rem; height: 1.125rem; }
.cml-none { display: grid; justify-items: center; gap: 0.5rem; padding: 3rem 1rem; text-align: center; font-size: 0.875rem; color: var(--color-ink-subtle); }
.cml-none svg { width: 2rem; height: 2rem; color: var(--color-sand-400); }
.cml-none b { font-size: 0.9375rem; color: var(--color-ink); }
.cml-view { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.cml-view[hidden], .cml-list[hidden] { display: none; }
.cml-list { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.cml-vh { display: flex; align-items: center; gap: 0.75rem; padding: 0 1.5rem 0.875rem; border-bottom: 1px solid var(--color-line); }
.cml-vh button.cml-bk { display: inline-flex; align-items: center; gap: 0.25rem; height: 2rem; padding: 0 0.625rem 0 0.375rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface); font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink); cursor: pointer; }
.cml-vh button.cml-bk svg { width: 1rem; height: 1rem; }
.cml-vh b { flex: 1; min-width: 0; font-size: 0.875rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cml-vb { flex: 1; min-height: 0; overflow: auto; padding: 1rem 1.5rem; background: var(--color-off-white); }
.cml-vb .cmf-pdf { height: min(56vh, 34rem); }
.cml-foot { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1.5rem; border-top: 1px solid var(--color-line); background: var(--color-surface); }
.cml-c { margin-right: auto; display: flex; align-items: center; gap: 0.625rem; min-width: 0; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cml-c b { color: var(--color-ink); font-weight: 600; }
.cm-lib-b { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
.cm-lib-b svg { width: 1.125rem; height: 1.125rem; flex: none; }
@media (max-width: 34rem) {
  .cml { padding: 0; place-items: end stretch; }
  .cml-panel { width: 100%; height: 92vh; border-radius: 1rem 1rem 0 0; }
  .cml-head, .cml-tools, .cml-body, .cml-foot, .cml-vh, .cml-vb { padding-left: 1rem; padding-right: 1rem; }
  .cml-tabs { margin: 0 -1rem; padding: 0 1rem; }
  .cml-row { gap: 0.625rem; }
  .cml-ft { display: none; }
}
@media (prefers-reduced-motion: reduce) { .cml-panel, .cml-scrim { transition: none; } }`;
  const style = document.createElement('style'); style.textContent = css; (document.head || document.documentElement).appendChild(style);

  const pick = (opts = {}) => new Promise((done) => {
    const multiple = opts.multiple !== false;
    let list = items(), tab = 'all', viewing = null;
    const chosen = new Set();
    const last = document.activeElement;
    const el = document.createElement('div'); el.className = 'cml';
    el.innerHTML = `<div class="cml-scrim" data-cml-x></div><div class="cml-panel" role="dialog" aria-modal="true" aria-labelledby="cml-h" tabindex="-1">
      <header class="cml-head"><div><p class="cml-eb">${LIB}C‑MORE library</p><h2 id="cml-h">${esc(opts.title || (multiple ? 'Choose documents you already have' : 'Choose a document you already have'))}</h2><p>Everything you&rsquo;ve uploaded is kept here, to use again wherever it&rsquo;s needed. ALMA reads what you choose as a new file; the original stays where it is.</p></div><button type="button" class="cml-x" data-cml-x aria-label="Close">${XI}</button></header>
      <div class="cml-list"><div class="cml-tools"><div class="cml-find">${SEARCH}<input type="search" id="cml-q" placeholder="Search by name, person or file" aria-label="Search your library" autocomplete="off"></div><div class="cml-tabs" id="cml-tabs" role="group" aria-label="Show"></div></div>
      <div class="cml-body" id="cml-body"></div></div>
      <div class="cml-view" id="cml-view" hidden><div class="cml-vh"><button type="button" class="cml-bk" data-cml-back>${BACK}Library</button><b id="cml-vt"></b></div><div class="cml-vb" id="cml-vb"></div></div>
      <footer class="cml-foot"><span class="cml-c" id="cml-c" aria-live="polite"></span><button type="button" class="link-btn" data-cml-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-cml-ok disabled>Add</button></footer></div>`;
    document.body.appendChild(el);
    const $ = (id) => el.querySelector('#' + id), panel = el.querySelector('.cml-panel');
    const inTab = (x, t) => t === 'all' || (t === 'up' ? x.src === 'up' : x.area === t);
    const tabs = () => {
      const t = [['all', 'All'], ['up', 'Uploaded by you']].concat([...new Set(list.map((x) => x.area))].sort((a, b) => (a === '__u') - (b === '__u') || (!a) - (!b)).map((a) => [a, areaTitle(a)]));
      $('cml-tabs').innerHTML = t.map(([k, l]) => { const n = list.filter((x) => inTab(x, k)).length; return n || k === 'all' ? `<button type="button" data-cml-tab="${esc(k)}" aria-pressed="${tab === k}">${esc(l)} <span>${n}</span></button>` : ''; }).join('');
    };
    const row = (x) => {
      const st = x.status && (M().STATUS[x.status] || null), on = chosen.has(x.key);
      const where = x.src === 'up' ? [x.file !== x.title ? x.file : '', size(x.size), x.at ? `uploaded ${when(x.at)}` : ''].filter(Boolean).join(' · ')
        : x.area === '__u' ? (x.file && x.file !== x.title ? x.file : 'Not sorted yet') : !x.until || x.until === '—' ? '' : !/\d{4}/.test(x.until) ? x.until : `${x.status === 'expired' ? 'Expired' : 'Valid until'} ${x.until}`;
      const sub = [x.who, where].filter(Boolean).join(' · ');
      const tag = st ? `<span class="co-badge ${st[1]}">${st[0]}</span>` : x.note ? `<span class="co-badge b-neu">${esc(x.note)}</span>` : '';
      const ft = x.kind === 'pdf' ? ['is-pdf', 'PDF'] : x.kind === 'img' ? ['is-img', 'IMG'] : ['', 'FILE'];
      return `<li><label class="cml-row${on ? ' is-on' : ''}"><input type="${multiple ? 'checkbox' : 'radio'}" name="cml-p" value="${esc(x.key)}"${on ? ' checked' : ''}><span class="cml-ck${multiple ? '' : ' is-r'}" aria-hidden="true">${TICK}</span><span class="cml-ft ${ft[0]}" aria-hidden="true">${ft[1]}</span><span class="cml-n"><b>${esc(x.title)}</b>${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="cml-r">${tag}<button type="button" class="cml-pv" data-cml-pv="${esc(x.key)}" aria-label="Preview ${esc(x.title)}" title="Preview">${EYE}</button></span></label></li>`;
    };
    const paint = () => {
      tabs();
      const q = fold($('cml-q').value.trim());
      const shown = list.filter((x) => inTab(x, tab) && (!q || fold([x.title, x.who || '', x.file || '', areaTitle(x.area), x.note || ''].join(' ')).includes(q)));
      // uploaded by you first, newest first; then what's on file, by section
      const groups = [];
      shown.forEach((x) => { const g0 = x.src === 'up' ? 'up' : x.area; let g = groups.find((y) => y.k === g0); if (!g) groups.push(g = { k: g0, l: [] }); g.l.push(x); });
      $('cml-body').innerHTML = groups.length ? groups.map((g) => `<section class="cml-g"><h3>${g.k === 'up' ? 'Uploaded by you' : esc(areaTitle(g.k)) + (tab === 'all' || tab === g.k ? ' · on file' : '')}<span>${g.l.length}</span></h3><ul>${g.l.map(row).join('')}</ul></section>`).join('')
        : `<div class="cml-none">${list.length ? SEARCH : LIB}<b>${list.length ? 'Nothing matches' : 'Your library is empty'}</b><span>${list.length ? 'Try another name, or look in All.' : 'Everything you upload is kept here, to use again.'}</span></div>`;
      count();
    };
    const count = () => {
      const n = chosen.size, ok = el.querySelector('[data-cml-ok]');
      ok.disabled = !n; ok.textContent = viewing && !n ? 'Add' : n > 1 ? `Add ${n} documents` : n ? 'Add it' : 'Add';
      $('cml-c').innerHTML = n ? `<span><b>${n}</b> chosen</span><button type="button" class="link-btn" data-cml-clear>Clear</button>` : `${list.length} in your library`;
    };
    const toggle = (key, on) => { if (!multiple) chosen.clear(); if (on) chosen.add(key); else chosen.delete(key); };
    // a look at the file before choosing it
    const view = (key) => {
      const it = list.find((x) => x.key === key); if (!it) return;
      viewing = key; const r = recOf(it);
      $('cml-vt').textContent = it.who ? `${it.title} · ${it.who}` : it.title;
      $('cml-vb').innerHTML = window.CMFiles ? window.CMFiles.view(r) : '';
      el.querySelector('.cml-list').hidden = true; $('cml-view').hidden = false;
      const ok = el.querySelector('[data-cml-ok]'); ok.disabled = false; ok.textContent = chosen.has(key) ? 'Chosen · back to library' : 'Choose this one';
      el.querySelector('[data-cml-back]').focus({ preventScroll: true });
    };
    const unview = () => {
      const k = viewing; viewing = null; $('cml-vb').innerHTML = '';
      $('cml-view').hidden = true; el.querySelector('.cml-list').hidden = false; paint();
      const b = k && el.querySelector(`[data-cml-pv="${CSS.escape(k)}"]`); if (b) b.focus({ preventScroll: true });
    };
    const close = (files) => {
      document.removeEventListener('keydown', onKey, true);
      el.classList.remove('is-open'); setTimeout(() => el.remove(), 250);
      if (last && last.focus && last.isConnected) last.focus({ preventScroll: true });
      done(files);
    };
    const finish = () => close(list.filter((x) => chosen.has(x.key)).map(fileOf));
    // Escape: out of the preview, then out of the library; never the upload under it
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); if (viewing) unview(); else close(null); return; }
      if (e.key === 'Tab') {
        const f = [...panel.querySelectorAll('button:not([disabled]), input:not([name="cml-p"]), input[name="cml-p"]:checked, a[href]')].filter((x) => x.offsetParent || x.name === 'cml-p'); if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    el.addEventListener('click', (e) => {
      const t = (s) => e.target.closest(s);
      if (t('[data-cml-x]')) { close(null); return; }
      if (t('[data-cml-pv]')) { e.preventDefault(); view(t('[data-cml-pv]').dataset.cmlPv); return; }
      if (t('[data-cml-back]')) { unview(); return; }
      if (t('[data-cml-clear]')) { chosen.clear(); paint(); return; }
      if (t('[data-cml-tab]')) { tab = t('[data-cml-tab]').dataset.cmlTab; paint(); $('cml-body').scrollTop = 0; return; }
      if (t('[data-cml-ok]')) {
        if (viewing) { const k = viewing; if (!chosen.has(k)) toggle(k, true); unview(); if (!multiple) finish(); return; }
        finish();
      }
    });
    el.addEventListener('change', (e) => {
      const i = e.target.closest('input[name="cml-p"]'); if (!i) return;
      toggle(i.value, i.checked);
      el.querySelectorAll('.cml-row').forEach((r) => { const x = r.querySelector('input'); x.checked = chosen.has(x.value); r.classList.toggle('is-on', x.checked); });
      count();
    });
    // a double click on one, picking just one: in it goes
    el.addEventListener('dblclick', (e) => { const r = e.target.closest('.cml-row'); if (r && !multiple && !e.target.closest('[data-cml-pv]')) { toggle(r.querySelector('input').value, true); finish(); } });
    $('cml-q').addEventListener('input', () => { paint(); $('cml-body').scrollTop = 0; });
    $('cml-q').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const ok = el.querySelector('[data-cml-ok]'); if (!ok.disabled) ok.click(); } });
    paint();
    // what was uploaded since the page loaded (another step, another tab of the setup)
    refresh().then(() => { list = items(); if (!viewing) paint(); });
    requestAnimationFrame(() => el.classList.add('is-open'));
    setTimeout(() => el.classList.add('is-open'), 30); // a tab in the background has no frames
    $('cml-q').focus({ preventScroll: true });
  });

  // the button the uploaders show, next to "browse your device"
  const button = (attrs = '', cls = 'btn btn-quiet btn-sm') => `<button type="button" class="${cls} cm-lib-b" ${attrs}>${LIB}<span>Choose from your C‑MORE library</span></button>`;
  return { has, pick, items, refresh, button, ICON: LIB };
})();
