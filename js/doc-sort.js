/* Sorting the files a company uploads: what each one is, and where it goes when ALMA can't tell.
   window.CMDocPick — choosing what a document is, by hand, in three steps: its category (Company,
     Workers, Equipment…), then its section in that category, then the document. Wherever a file's
     document can be chosen or corrected (ALMA's setup, js/guided-upload.js; the upload dialog,
     js/doc-upload.js; Documents, js/company-details.js), it's this.
       html(key, code, { uncat, only }) the three selects (uncat: a "Not sure" choice that files it
                                         under Uncategorized documents; only: which documents)
       value(root)                       the code chosen, '__u' for Uncategorized, or ''
     The selects follow each other by themselves (a change listener on the document).
   window.CMUncat — Uncategorized documents: the files ALMA couldn't place. Kept for the tab, per
     company (as its other uploads: js/doc-model.js), each file in this browser (js/doc-files.js,
     'uncat:<id>'). On Documents, a section of their own, each one opening a drawer where everything
     about it can be set: what it is (the picker) and its details. Filed, it leaves the section and
     becomes that document's file.
       list(), get(id), add(item) → id, update(id, patch), remove(id), copyFile(from, to)
       section() the section's HTML for Documents; open(id, onDone) its drawer.
   Needs js/doc-model.js. */
(() => {
  const DM = window.DOC_MODEL;
  if (!DM) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const plain = (h) => { const d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h); return d.textContent.trim(); };

  // ---- the picker -------------------------------------------------------------------------------------
  // what can be chosen: three categories, always Company, Workers and Equipment; in each, the
  // company's documents (not archived ones), once each, in the order Documents lists them
  const AREAS = ['company', 'workers', 'equipment'].map((key) => ({ key, title: (DM.AREA_META && DM.AREA_META[key] ? DM.AREA_META[key].title : key.replace(/^./, (c) => c.toUpperCase())) }));
  const ALL = (() => {
    const seen = new Set();
    return DM.DOCS.filter((d) => d.code && d.status !== 'archived' && !d.archivedCode && AREAS.some((a) => a.key === d.area) && !seen.has(d.code) && seen.add(d.code));
  })();
  const docOf = (code) => ALL.find((d) => d.code === code) || null;
  const secs = (area, only) => [...new Set(ALL.filter((d) => d.area === area && (!only || only(d))).map((d) => d.section))];
  const docsIn = (area, sec, only) => ALL.filter((d) => d.area === area && d.section === sec && (!only || only(d)));
  const opts = {}; // each picker's options, by its key, for the listener below
  const secOpts = (area, cur, only) => `<option value="">Choose a section</option>` + secs(area, only).map((s) => `<option value="${esc(s)}"${s === cur ? ' selected' : ''}>${esc(plain(s))}</option>`).join('');
  const docOpts = (area, sec, cur, only) => `<option value="">Choose the document</option>` + docsIn(area, sec, only).map((d) => `<option value="${esc(d.code)}"${d.code === cur ? ' selected' : ''}>${esc(plain(d.name))}</option>`).join('');
  const html = (key, code, o = {}) => {
    opts[key] = o;
    const d = code && code !== '__u' ? docOf(code) : null, area = d ? d.area : code === '__u' ? '__u' : '', sec = d ? d.section : '';
    const cats = AREAS.map((a) => Object.assign({ none: !secs(a.key, o.only).length }, a));
    return `<div class="dp" data-dp="${esc(key)}">
        <label class="dp-f"><span>Category</span><select data-dp-cat><option value="">Choose a category</option>${cats.map((a) => `<option value="${a.key}"${a.key === area ? ' selected' : ''}${a.none ? ' disabled' : ''}>${esc(a.title)}${a.none ? ' (none for your company yet)' : ''}</option>`).join('')}${o.uncat ? `<option value="__u"${area === '__u' ? ' selected' : ''}>Not sure: Uncategorized documents</option>` : ''}</select></label>
        <label class="dp-f"><span>Section</span><select data-dp-sec${d ? '' : ' disabled'}>${d ? secOpts(area, sec, o.only) : '<option value="">Choose a category first</option>'}</select></label>
        <label class="dp-f"><span>Document</span><select data-dp-doc${d ? '' : ' disabled'}>${d ? docOpts(area, sec, code, o.only) : '<option value="">Choose a section first</option>'}</select></label>
      </div>`;
  };
  const value = (root) => {
    const p = root && (root.matches && root.matches('[data-dp]') ? root : root.querySelector('[data-dp]'));
    if (!p) return '';
    const cat = p.querySelector('[data-dp-cat]').value;
    return cat === '__u' ? '__u' : p.querySelector('[data-dp-doc]').value || '';
  };
  // one choice opens the next; the document's change tells whoever listens (dp-change on the picker)
  document.addEventListener('change', (e) => {
    const p = e.target.closest('[data-dp]'); if (!p) return;
    const o = opts[p.dataset.dp] || {}, cat = p.querySelector('[data-dp-cat]'), sec = p.querySelector('[data-dp-sec]'), doc = p.querySelector('[data-dp-doc]');
    if (e.target === cat) {
      const on = cat.value && cat.value !== '__u';
      sec.innerHTML = on ? secOpts(cat.value, '', o.only) : `<option value="">${cat.value === '__u' ? 'Not needed' : 'Choose a category first'}</option>`; sec.disabled = !on;
      doc.innerHTML = `<option value="">${cat.value === '__u' ? 'Not needed' : 'Choose a section first'}</option>`; doc.disabled = true;
      // a category with one section: it's chosen for you
      if (on && sec.options.length === 2) { sec.selectedIndex = 1; doc.innerHTML = docOpts(cat.value, sec.value, '', o.only); doc.disabled = false; }
    } else if (e.target === sec) {
      doc.innerHTML = sec.value ? docOpts(cat.value, sec.value, '', o.only) : '<option value="">Choose a section first</option>'; doc.disabled = !sec.value;
    }
    p.dispatchEvent(new CustomEvent('dp-change', { bubbles: true, detail: value(p) }));
  });
  const css = `
.dp { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.625rem; }
.dp-f { display: grid; gap: 0.3125rem; min-width: 0; }
.dp-f > span { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.dp-f select { width: 100%; min-width: 0; height: 2.5rem; padding: 0 2rem 0 0.75rem; border: 1px solid var(--color-line); border-radius: 0.5rem; font: inherit; font-size: 0.875rem; color: var(--color-ink); text-overflow: ellipsis;
  appearance: none; background: var(--color-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23343434'%3E%3Cpath d='M5.2 7.7a.75.75 0 0 1 1.06.04L10 11.6l3.74-3.86a.75.75 0 1 1 1.08 1.04l-4.28 4.42a.75.75 0 0 1-1.08 0L5.16 8.78a.75.75 0 0 1 .04-1.06Z'/%3E%3C/svg%3E") no-repeat right 0.625rem center / 1rem; }
.dp-f select:disabled { color: var(--color-ink-subtle); background-color: var(--color-off-white); cursor: not-allowed; }
.dp-f select:focus { outline: none; border-color: var(--color-graphite); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-graphite) 12%, transparent); }
@media (max-width: 40rem) { .dp { grid-template-columns: 1fr; } }
/* Uncategorized documents, on Documents */
.ucs { margin-top: 2rem; }
.ucs-h { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.25rem; }
.ucs-h h2 { font-size: 1.25rem; font-weight: 600; letter-spacing: -0.01em; }
.ucs > p { margin-bottom: 0.875rem; font-size: 0.9375rem; color: var(--color-ink-muted); }
.ucs-l { list-style: none; margin: 0; padding: 0; border: 1px solid var(--color-line); border-radius: 0.875rem; background: var(--color-surface); overflow: hidden; }
.ucs-l li + li { border-top: 1px solid var(--color-mid-beige); }
.ucs-l button { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; align-items: center; gap: 0.875rem; width: 100%; padding: 0.875rem 1.25rem; border: 0; background: none; font: inherit; text-align: left; color: var(--color-ink); cursor: pointer; }
.ucs-l button:hover { background: var(--color-off-white); }
.ucs-l button > svg { width: 1.25rem; height: 1.25rem; color: var(--color-ink-subtle); }
.ucs-l button > svg:last-child { width: 1rem; height: 1rem; }
.ucs-l b { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.9375rem; font-weight: 600; }
.ucs-l small { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.ucd .cdd-card + .cdd-card { margin-top: 0; }
.ucd .docd-body { display: grid; gap: 1rem; align-content: start; }
.ucd-fs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.ucd-fs label { display: grid; gap: 0.3125rem; min-width: 0; }
.ucd-fs label > span { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.ucd-fs input { width: 100%; min-width: 0; height: 2.5rem; padding: 0 0.75rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface); font: inherit; font-size: 0.875rem; color: var(--color-ink); }
.ucd-fs input:focus { outline: none; border-color: var(--color-graphite); }
.cdd-in { width: 100%; min-width: 0; height: 2.375rem; padding: 0 0.75rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface); font: inherit; font-size: 0.875rem; color: var(--color-ink); }
.cdd-in:focus { outline: none; border-color: var(--color-graphite); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-graphite) 12%, transparent); }
.ucd-fs .is-wide { grid-column: 1 / -1; }
.ucd-who { margin-top: 0.75rem; }
.ucd-msg { font-size: 0.8125rem; color: var(--color-ink-muted); }
@media (max-width: 40rem) { .ucd-fs { grid-template-columns: 1fr; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---- Uncategorized documents: the store -------------------------------------------------------------
  const KEY = 'cm-uncat' + (DM.ORG ? '-' + DM.ORG.id : '') + (DM.PERSONA === 'beatriz' ? '-beatriz' : '');
  const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || '[]') || []; } catch (e) { return []; } };
  const save = (l) => { try { sessionStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} document.dispatchEvent(new CustomEvent('cm-uncat')); };
  const list = () => load();
  const get = (id) => load().find((x) => x.id === id) || null;
  const add = (item) => { const l = load(), id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6); l.unshift(Object.assign({ id, at: DM.today(), by: '', ref: '', issued: '', valid: '', country: '' }, item)); save(l); return id; };
  const update = (id, patch) => { const l = load(), x = l.find((y) => y.id === id); if (x) { Object.assign(x, patch); save(l); } return x; };
  const remove = (id) => save(load().filter((x) => x.id !== id));
  // a file kept under one name in this browser, kept under another too (js/doc-files.js)
  const copyFile = (from, to) => (window.CMFiles ? [].concat(from).reduce((p, k) => p.then((r) => r || window.CMFiles.get(k)), Promise.resolve(null)).then((r) => r && r.blob && window.CMFiles.put(to, r.blob instanceof File ? r.blob : new File([r.blob], r.name || 'file', { type: r.type || '' }))) : Promise.resolve(false));

  // ---- on Documents: the section, and a drawer for each -----------------------------------------------
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M10 13a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9V16M12 18.5v.01"/></svg>';
  const CHEV = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.92 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"/></svg>';
  const section = () => {
    const l = load(); if (!l.length) return '';
    return `<section class="ucs" aria-labelledby="ucs-h"><div class="ucs-h"><h2 id="ucs-h">Uncategorized documents</h2><span class="co-badge b-pend">${l.length} to sort</span></div>
      <p>Files ALMA couldn&rsquo;t place. Open one and tell her what it is: choose its category, its section and the document, and check its details. She files it there.</p>
      <ul class="ucs-l">${l.map((x) => `<li><button type="button" data-uncat="${esc(x.id)}">${FILE}<span><b>${esc(x.file)}</b><small>Uploaded on ${esc(x.at)}${x.from ? ` &middot; ${esc(x.from)}` : ''}</small></span><span class="co-badge b-neu">Uncategorized</span>${CHEV}</button></li>`).join('')}</ul></section>`;
  };
  const M = DM.MONTHS;
  const isoOf = (v) => { const t = Date.parse(v); if (Number.isNaN(t)) return ''; const x = new Date(t); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const fromIso = (v) => { if (!v) return ''; const x = new Date(v + 'T00:00'); return `${x.getDate()} ${M[x.getMonth()]} ${x.getFullYear()}`; };
  const DETAILS = [['ref', 'Reference'], ['by', 'Issued by'], ['issued', 'Issue date', 1], ['valid', 'Valid until', 1], ['country', 'Country']];
  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  let dw = null, cur = null, done = null, back = null;
  const build = () => {
    dw = document.createElement('div'); dw.className = 'docd cdd ucd'; dw.hidden = true;
    dw.innerHTML = `<div class="docd-scrim" data-uc-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="ucd-t" tabindex="-1">
        <header class="docd-head"><span class="docd-ico" aria-hidden="true">${FILE}</span><div class="docd-t"><h3 id="ucd-t"></h3><p id="ucd-sub"></p></div><button type="button" class="dlg-x" data-uc-x aria-label="Close">${XI}</button></header>
        <div class="docd-body" id="ucd-body"></div>
        <footer class="docd-foot"><span id="ucd-foot"></span><span class="cdd-acts"><button type="button" class="link-btn" data-uc-del>Delete file</button><button type="button" class="btn btn-quiet btn-sm" data-uc-keep>Save details</button><button type="button" class="btn btn-primary btn-sm" data-uc-file disabled>File it</button></span></footer>
      </aside>`;
    document.body.appendChild(dw);
    dw.addEventListener('click', (e) => {
      if (e.target.closest('[data-uc-x]')) { close(); return; }
      if (e.target.closest('[data-cmf-peek]') && window.CMFiles) { const x = get(cur); window.CMFiles.get('uncat:' + cur).then((r) => window.CMFiles.openPeek(dw, { title: x.file, sub: 'Uncategorized', code: 'uncat:' + cur, spec: { title: x.file, file: x.file, holder: plain(DM.D.company || ''), issuer: x.by, fields: [] } })); return; }
      if (e.target.closest('[data-uc-keep]')) { update(cur, details()); toast('Details saved. It stays in Uncategorized documents until you choose what it is.'); close(); return; }
      if (e.target.closest('[data-uc-del]')) { const x = get(cur); remove(cur); toast(`${x.file} deleted.`); close(); return; }
      if (e.target.closest('[data-uc-file]')) fileIt();
    });
    dw.addEventListener('dp-change', () => paintWho());
    dw.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  };
  const details = () => Object.fromEntries(DETAILS.map(([k, , date]) => { const i = dw.querySelector(`[name="uc-${k}"]`); return [k, date ? fromIso(i.value) : i.value.trim()]; }));
  // a worker's or a machine's document: whose it is, too
  const paintWho = () => {
    const code = value(dw), d = code && code !== '__u' ? docOf(code) : null, box = dw.querySelector('#ucd-who');
    const roster = d && d.kind ? d.roster || [] : [];
    box.innerHTML = d && d.kind ? (roster.length ? `<label class="dp-f"><span>${d.kind === 'workers' ? 'Whose it is' : d.kind === 'equipment' ? 'Which machine' : 'Which product'}</span><select data-uc-who><option value="">Choose</option>${roster.map((r) => `<option value="${r.i}">${esc(plain(DM.recordName(d.kind, r.i)))}</option>`).join('')}</select></label>`
      : `<p class="ucd-msg">None of your ${d.kind === 'workers' ? 'workers' : 'machines'} are on C&#8209;MORE yet. Add them first; it waits here until then.</p>`) : '';
    sync();
  };
  const sync = () => {
    const code = value(dw), d = code && code !== '__u' ? docOf(code) : null, who = dw.querySelector('[data-uc-who]');
    const ok = !!d && (!d.kind || (who && who.value !== ''));
    const b = dw.querySelector('[data-uc-file]'); b.disabled = !ok; b.textContent = d ? `File it as ${plain(d.name)}` : 'File it';
    dw.querySelector('#ucd-foot').textContent = code === '__u' ? 'It stays in Uncategorized documents' : d ? '' : 'Choose what it is to file it';
  };
  const paint = () => {
    const x = get(cur);
    dw.querySelector('#ucd-t').textContent = x.file;
    dw.querySelector('#ucd-sub').textContent = `Uncategorized · uploaded on ${x.at}${x.from ? ` · ${x.from}` : ''}`;
    dw.querySelector('#ucd-body').innerHTML = `${window.CMFiles ? `<div class="cmf-slot">${window.CMFiles.fileRow(x.file, 'The file you uploaded')}</div>` : ''}
      <section class="cdd-card"><h4 class="eyebrow">What it is</h4><p class="cdd-desc">ALMA couldn&rsquo;t tell which document this is. Choose its category, then its section, then the document.</p>${html('ucd', x.code || '', { uncat: true })}<div class="ucd-who" id="ucd-who"></div></section>
      <section class="cdd-card"><h4 class="eyebrow">Its details</h4><div class="ucd-fs">${DETAILS.map(([k, l, date]) => `<label${k === 'by' ? ' class="is-wide"' : ''}><span>${l}</span><input name="uc-${k}" ${date ? `type="date" value="${isoOf(x[k])}"` : `value="${esc(x[k])}"`}></label>`).join('')}</div></section>`;
    paintWho();
  };
  const open = (id, onDone) => {
    if (!get(id)) return;
    if (!dw) build();
    cur = id; done = onDone || null; back = document.activeElement; paint();
    dw.hidden = false; requestAnimationFrame(() => dw.classList.add('is-open')); document.documentElement.classList.add('dlg-open');
    setTimeout(() => { const s = dw.querySelector('[data-dp-cat]'); if (s) s.focus({ preventScroll: true }); }, 320);
  };
  const close = () => {
    if (!dw || dw.hidden) return;
    if (window.CMFiles) window.CMFiles.closePeek(dw);
    dw.classList.remove('is-open'); document.documentElement.classList.remove('dlg-open');
    setTimeout(() => { dw.hidden = true; }, 300); if (back && back.isConnected) back.focus({ preventScroll: true });
    const fn = done; cur = null; done = null; if (fn) fn();
  };
  const toast = (msg) => {
    const t = Object.assign(document.createElement('div'), { className: 'sa-toast', textContent: msg });
    t.setAttribute('role', 'status');
    t.style.cssText = 'position:fixed;left:50%;bottom:1.5rem;z-index:130;transform:translateX(-50%);padding:.75rem 1.125rem;border-radius:.75rem;background:var(--color-graphite);color:var(--color-off-white);font-size:.875rem;box-shadow:0 12px 32px -16px rgba(0,0,0,.5)';
    document.body.appendChild(t); setTimeout(() => t.remove(), 3600);
  };
  // filed: it becomes that document's file (or that worker's or machine's copy), with the details
  // given, as checked by a person
  const fileIt = () => {
    const x = get(cur), code = value(dw), d = docOf(code), f = details(); if (!d) return;
    const valid = f.valid || 'No expiry', issued = f.issued || DM.today();
    if (d.kind) {
      const i = +dw.querySelector('[data-uc-who]').value;
      DM.saveRecord(code, i, { status: 'valid', exp: valid });
      copyFile('uncat:' + cur, `${code}#${i}`);
    } else {
      DM.saveDoc(code, { status: 'valid', issued, valid, note: '', ref: esc(f.ref), by: esc(f.by), conf: 98, edited: true });
      copyFile('uncat:' + cur, code);
    }
    remove(cur);
    toast(`${x.file} filed as ${plain(d.name)}.`);
    close();
  };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-uncat]'); if (b) { e.preventDefault(); open(b.dataset.uncat, () => document.dispatchEvent(new CustomEvent('cm-uncat'))); } });

  window.CMDocPick = { html, value, docOf, ALL };
  window.CMUncat = { list, get, add, update, remove, copyFile, section, open, close };
})();
