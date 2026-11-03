/* The files themselves. A document's drawer shows the page as ALMA read it, each value she took
   highlighted (preview), and the file the company uploaded — the PDF in a viewer, the photo as a
   photo — one click away. Files are kept in this
   browser (IndexedDB), per company and document, and forgotten on log out
   (js/company-switcher.js). A document with no file behind it (the demo company's, which were
   never uploaded here) shows the simulated page, labelled as such.
   window.CMFiles: put(code, file), get(code) → Promise<record|null>, view(record), missing(name, why),
   preview(record|null, spec), sheet(spec), show(root, i). */
window.CMFiles = (() => {
  const DB = 'cm-files', STORE = 'files';
  let open = null;
  // a log out in another tab deletes the store (js/company-switcher.js): this tab lets go at once,
  // or the delete waits on it and every file in the browser hangs behind it, its drawer left blank
  const db = () => open || (open = new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => { const d = r.result; d.onversionchange = () => { d.close(); open = null; }; res(d); };
    r.onerror = () => { open = null; rej(r.error); };
    r.onblocked = () => { open = null; rej(new Error('blocked')); };
  }));
  // and never left waiting: past a few seconds, a file reads as not there, so its drawer says so
  const soon = (p, ms = 4000) => Promise.race([p, new Promise((res) => setTimeout(() => res(null), ms))]);
  const beatriz = document.documentElement.dataset.persona === 'beatriz';
  const org = () => { try { return JSON.parse(sessionStorage.getItem('cm-org') || 'null') || JSON.parse(localStorage.getItem('cm-last-org-' + (beatriz ? 'beatriz' : 'miguel')) || 'null') || 'home'; } catch (e) { return 'home'; } };
  // Beatriz's files are kept apart from Miguel's (both companies are 'home' to their person)
  const key = (code) => `${beatriz ? 'beatriz:' : ''}${org()}:${code}`;
  const put = (code, file) => (!file ? Promise.resolve(false) : db().then((d) => new Promise((res) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put({ name: file.name, type: file.type || '', size: file.size || 0, blob: file, at: Date.now() }, key(code));
    tx.oncomplete = () => res(true); tx.onerror = () => res(false);
  })).catch(() => false));
  const get = (code) => soon(db().then((d) => new Promise((res) => {
    const r = d.transaction(STORE).objectStore(STORE).get(key(code));
    r.onsuccess = () => res(r.result || null); r.onerror = () => res(null);
  })).catch(() => null));

  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const size = (b) => (!b ? '' : b < 1e6 ? Math.max(1, Math.round(b / 1e3)) + ' KB' : (b / 1e6).toFixed(1) + ' MB');
  const kind = (r) => { const t = r.type || '', n = (r.name || '').toLowerCase(); return /pdf/.test(t) || /\.pdf$/.test(n) ? 'pdf' : /^image\//.test(t) || /\.(png|jpe?g|webp|gif|heic|heif)$/.test(n) ? 'image' : 'other'; };
  // a phone without a PDF viewer (Android) draws an empty frame: there, the file opens instead
  const pdfShown = navigator.pdfViewerEnabled !== false;
  const DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const css = `
.cmf { display: grid; gap: 0.5rem; }
.cmf-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmf-bar b { color: var(--color-ink); font-weight: 600; overflow-wrap: anywhere; }
.cmf-bar a { flex: none; color: var(--color-ink); font-weight: 500; }
.cmf-pdf { width: 100%; height: min(72vh, 48rem); border: 0; border-radius: 0.25rem; background: var(--color-surface); box-shadow: 0 1px 3px rgba(52, 52, 52, .12); }
.cmf-img { display: block; max-width: 100%; margin: 0 auto; border-radius: 0.25rem; background: var(--color-surface); box-shadow: 0 1px 3px rgba(52, 52, 52, .12); }
.cmf-none { display: grid; justify-items: center; gap: 0.5rem; padding: 2.5rem 1.5rem; border-radius: 0.5rem; background: var(--color-surface); text-align: center; }
.cmf-none svg { width: 1.75rem; height: 1.75rem; color: var(--color-ink-subtle); }
.cmf-none h4 { font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.cmf-none p { max-width: 26rem; font-size: 0.8125rem; line-height: 1.5; color: var(--color-ink-subtle); }`;
  const style = document.createElement('style'); style.textContent = css; (document.head || document.documentElement).appendChild(style);

  // the file, as it is
  const view = (r) => {
    const url = URL.createObjectURL(r.blob), k = kind(r);
    const bar = `<div class="cmf-bar"><span><b>${esc(r.name)}</b>${r.size ? ' &middot; ' + size(r.size) : ''}</span><a href="${url}" target="_blank" rel="noopener">Open the file</a></div>`;
    const none = (h, p) => `<div class="cmf-none">${DOC}<h4>${h}</h4><p>${p}</p></div>`;
    if (k === 'pdf' && pdfShown) return `<figure class="cmf">${bar}<iframe class="cmf-pdf" src="${url}#view=FitH&navpanes=0" title="${esc(r.name)}"></iframe></figure>`;
    if (k === 'pdf') return `<figure class="cmf">${bar}${none('This browser can&rsquo;t show PDFs here', 'Open the file to see it as it is.')}</figure>`;
    // a photo the browser can't draw (HEIC, outside Safari) says so instead of a broken image
    if (k === 'image') return `<figure class="cmf">${bar}<img class="cmf-img" src="${url}" alt="${esc(r.name)}" onerror="this.outerHTML=this.nextElementSibling.innerHTML"><template>${none('This browser can&rsquo;t show this photo', 'Open the file to see it as it is.')}</template></figure>`;
    return `<figure class="cmf">${bar}${none('No preview for this kind of file', 'Open it to see it as it is.')}</figure>`;
  };
  // no file here: say so, rather than draw one
  const missing = (name, why) => `<div class="cmf-none">${DOC}<h4>${name ? esc(name) : 'The original file'} isn&rsquo;t in this demo</h4><p>${why || 'This document was set up for the demo without a file. Upload one and it shows here exactly as it is.'}</p></div>`;

  // ---- a page as ALMA read it: each value she took, highlighted where it is on the page -----------
  // Every document can be checked against its citations, file or not. Prototype: the values and
  // the layout are real to the document; the prose around them is filler, picked from its name so
  // a page always reads the same. With the uploaded file, the original is one click away.
  const css2 = `
.cmf-sw { display: inline-grid; grid-auto-flow: column; gap: 0.125rem; padding: 0.1875rem; border-radius: 0.5rem; background: var(--color-mid-beige); }
.cmf-sw button { height: 1.75rem; padding: 0 0.75rem; border: 0; border-radius: 0.375rem; background: none; font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.cmf-sw button[aria-pressed="true"] { background: var(--color-surface); color: var(--color-ink); box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.cmf-tag { flex: none; padding: 0.125rem 0.5rem; border-radius: 0.3125rem; background: var(--color-mid-beige); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-muted); }
.cmf-pages { display: grid; gap: 1rem; }
.cmf-pages .docd-sheet { margin: 0; }
.cmf-q { margin: 0 0 0.5rem !important; padding: 0.5rem 0.875rem; margin-inline: -0.875rem !important; border-left: 3px solid transparent; border-radius: 0 0.375rem 0.375rem 0; color: var(--color-ink); transition: background-color .4s, border-color .4s; }
.cmf-q span { color: var(--color-ink-subtle); }
.cmf-q mark { background: var(--color-coral-tint); color: inherit; padding: 0 0.125rem; border-radius: 2px; }
.cmf-q mark.is-flag { background: var(--color-critical-subtle, #fbe9e7); color: var(--color-critical, #b3261e); font-style: italic; }
.cmf-q.is-flash { border-left-color: var(--color-coral); background: color-mix(in oklab, var(--color-coral) 8%, var(--color-surface)); }
.cmf-legend { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.cmf-legend i { flex: none; width: 0.875rem; height: 0.875rem; border-radius: 2px; background: var(--color-coral-tint); }
.cmf-pane[hidden] { display: none; }`;
  const style2 = document.createElement('style'); style2.textContent = css2; (document.head || document.documentElement).appendChild(style2);
  const FILL = [
    'This document is issued on the basis of the records held by the issuing body on the date shown and certifies the particulars set out below. It does not replace any licence, permit or registration required by law.',
    'The holder is responsible for informing the issuing body of any change to the particulars stated herein. The document may be verified against the issuing body&rsquo;s register using the reference number shown.',
    'Any alteration, erasure or addition renders this document void. Copies are valid only when they reproduce the original in full, including this page and the annexes referred to in it.',
    'This document is valid for the period stated, unless withdrawn earlier under the applicable regulations. Renewal must be requested before the end of the period of validity.',
    'Issued under the applicable legal framework. The issuing body may request supporting evidence at any time and may suspend the document where the conditions of issue are no longer met.',
  ];
  const hash = (t) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return Math.abs(h); };
  const plain = (h) => { const d = document.createElement('div'); d.innerHTML = String(h == null ? '' : h); return d.textContent.trim(); };
  // spec: { title, file, issuer, holder, fields: [{ name, value, flag }] } — values as text or HTML
  // pages as the questionnaire's citations show them (js/esg-doc.js): the document's name, its
  // sections, and each value ALMA read marked where it is. Dates and validity sit on page 2
  const sheet = (spec) => {
    const seed = hash((spec.title || '') + (spec.file || '')), total = 2 + (seed % 2), f0 = seed % FILL.length;
    const kicker = esc(String(spec.file || spec.title || '').replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '));
    const all = (spec.fields || []).map((x, k) => Object.assign({ k }, x)).filter((x) => x.flag || plain(x.value));
    const isWhen = (x) => /date|valid|expir|until|issued on|period|renew/i.test(x.name);
    const p1 = all.filter((x) => !isWhen(x)), p2 = all.filter(isWhen);
    const q = (x) => `<p class="cmf-q" data-cmf-c="${x.i == null ? x.k : x.i}"><span>${esc(x.name)}:</span> <mark${x.flag ? ' class="is-flag"' : ''}>${x.flag ? '[cut off at the edge of the scan]' : esc(plain(x.value))}</mark></p>`;
    const holder = spec.holder && !all.some((x) => /holder|company|insured|name on|legal name/i.test(x.name)) ? `<p class="cmf-q"><span>Holder:</span> ${esc(spec.holder)}</p>` : '';
    const fill = (n) => `<p>${FILL[(f0 + n) % FILL.length]}</p>`;
    const page = (n, inner) => `<article class="docd-sheet" data-cmf-pg="${n}"><p class="docd-kicker">${kicker}</p>${inner}<div class="docd-rule"><span>${esc(spec.file || '')}</span><span>${n} / ${total}</span></div></article>`;
    let h = page(1, `<h4>${esc(spec.title || 'Document')}</h4>${spec.issuer ? `<p>Issued by ${esc(spec.issuer)}.</p>` : ''}${fill(0)}${holder}${p1.map(q).join('')}${fill(1)}`);
    h += page(2, `<h4>Validity and conditions</h4>${p2.length ? p2.map(q).join('') : ''}${fill(2)}${fill(3)}`);
    if (total > 2) h += page(3, `<h4>General terms</h4>${fill(4)}${fill(0 + 2)}${fill(1 + 3)}`);
    return `<div class="cmf-pages" aria-label="${esc(spec.title || 'Document')}, as ALMA read it">${h}</div>`;
  };
  const legend = (sim) => `<p class="cmf-legend"><i aria-hidden="true"></i><span>Highlighted: where ALMA read each value. ${sim ? 'Prototype: a simulated page, the demo has no original file.' : 'Switch to Original file to see it as uploaded.'}</span></p>`;
  // the page with its citations; with the uploaded file, a switch to see the original as it is
  const preview = (r, spec) => {
    const bar = (right) => `<div class="cmf-bar"><span><b>${esc((r && r.name) || spec.file || '')}</b>${r && r.size ? ' &middot; ' + size(r.size) : ''}</span>${right}</div>`;
    if (!r) return `<figure class="cmf" data-cmf>${bar('<span class="cmf-tag">Simulated preview</span>')}${sheet(spec)}${legend(true)}</figure>`;
    return `<figure class="cmf" data-cmf>${bar('<span class="cmf-sw" role="group" aria-label="How to show the file"><button type="button" data-cmf-tab="hi" aria-pressed="true">Highlighted</button><button type="button" data-cmf-tab="og" aria-pressed="false">Original file</button></span>')}
      <div class="cmf-pane" data-cmf-pane="hi">${sheet(spec)}${legend(false)}</div><div class="cmf-pane" data-cmf-pane="og" hidden>${view(r).replace(/^<figure class="cmf">|<\/figure>$/g, '')}</div></figure>`;
  };
  // a citation's "Show on the page": the highlighted view, scrolled to that value, flashed
  const show = (root, i) => {
    const fig = root && root.querySelector('[data-cmf]'); if (!fig) return false;
    tab(fig, 'hi');
    const line = fig.querySelector(`[data-cmf-c="${i}"]`) || fig;
    line.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (line.classList) { line.classList.remove('is-flash'); void line.offsetWidth; line.classList.add('is-flash'); setTimeout(() => line.classList.remove('is-flash'), 1800); }
    return true;
  };
  const tab = (fig, k) => {
    fig.querySelectorAll('[data-cmf-tab]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cmfTab === k)));
    fig.querySelectorAll('[data-cmf-pane]').forEach((p) => { p.hidden = p.dataset.cmfPane !== k; });
  };
  document.addEventListener('click', (e) => { const b = e.target.closest('[data-cmf-tab]'); if (b) tab(b.closest('[data-cmf]'), b.dataset.cmfTab); });

  // ---- the preview, in a drawer of its own: as the setup's, it slides out from under the document's
  // drawer, to its left (over it where there isn't room for both). Opened from Preview, or from a
  // citation's "Show on the page". host: the document drawer's .docd; o: { title, sub, code, spec }
  const css3 = `
.docd > .docd-panel { z-index: 2; }
.cmf-peek { position: absolute; inset: 0; z-index: 1; pointer-events: none; }
.cmf-peek[hidden] { display: none; }
.cmf-peek .docd-panel { pointer-events: auto; right: 40rem; width: min(40rem, calc(100vw - 45rem)); transform: translateX(100%); transition: transform .3s cubic-bezier(.2, .8, .2, 1); box-shadow: -24px 0 48px -24px rgba(52, 52, 52, .35); }
.cmf-peek.is-open .docd-panel { transform: none; }
.cmf-peek .docd-body { display: grid; gap: 0.75rem; align-content: start; }
@media (max-width: 75rem) { .cmf-peek { z-index: 3; } .cmf-peek .docd-panel { right: 0; width: min(40rem, 100vw); } }
@media (prefers-reduced-motion: reduce) { .cmf-peek .docd-panel { transition: none; } }
.cmf-file { display: flex; align-items: center; gap: 0.875rem; width: 100%; padding: 0.875rem 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); font: inherit; text-align: left; cursor: pointer; transition: border-color .2s, box-shadow .2s; }
.cmf-file:hover { border-color: var(--color-sand-400); box-shadow: 0 8px 24px -16px rgba(52, 52, 52, .25); }
.cmf-file > svg { flex: none; width: 1.5rem; height: 1.5rem; color: var(--color-ink-subtle); }
.cmf-file span { flex: 1; min-width: 0; display: grid; gap: 0.125rem; }
.cmf-file b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.875rem; font-weight: 600; color: var(--color-ink); }
.cmf-file small { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmf-file i { flex: none; font-style: normal; font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); text-decoration: underline; text-decoration-color: var(--color-coral); text-underline-offset: 0.2em; }`;
  const style3 = document.createElement('style'); style3.textContent = css3; (document.head || document.documentElement).appendChild(style3);
  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  // the row in a document's drawer that opens it: the file, and Preview
  const fileRow = (name, note) => `<button type="button" class="cmf-file" data-cmf-peek>${DOC}<span><b>${esc(name)}</b><small>${note || 'Each value ALMA read, highlighted on the page'}</small></span><i>Preview</i></button>`;
  const peekOf = (host) => {
    let el = host.querySelector(':scope > .cmf-peek');
    if (el) return el;
    el = document.createElement('div'); el.className = 'cmf-peek'; el.hidden = true;
    el.innerHTML = `<aside class="docd-panel" role="dialog" aria-labelledby="cmf-pk-t" tabindex="-1">
        <header class="docd-head"><span class="docd-ico" aria-hidden="true">${DOC}</span><div class="docd-t"><h3 data-pk-t id="cmf-pk-t"></h3><p data-pk-sub></p></div>
          <button type="button" class="dlg-x" data-pk-x aria-label="Close the preview">${XI}</button></header>
        <div class="docd-bar"><span data-pk-bar>Preview</span><span></span></div>
        <div class="docd-body" data-pk-body></div>
        <footer class="docd-foot"><span>Highlighted: where ALMA read each value.</span><button type="button" class="btn btn-quiet btn-sm" data-pk-x>Close preview</button></footer>
      </aside>`;
    host.appendChild(el);
    el.addEventListener('click', (e) => { if (e.target.closest('[data-pk-x]')) closePeek(host); });
    // Escape closes the preview first, the document's drawer after
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.hidden && el.classList.contains('is-open')) { e.stopImmediatePropagation(); e.stopPropagation(); closePeek(host); } }, true); // on window: before the drawer's own
    return el;
  };
  let peekAt = 0;
  const openPeek = (host, o, i) => {
    const el = peekOf(host), at = ++peekAt, wasOpen = el.classList.contains('is-open');
    el.querySelector('[data-pk-t]').textContent = o.title || 'Preview';
    el.querySelector('[data-pk-sub]').textContent = o.sub || o.spec.file || '';
    const body = el.querySelector('[data-pk-body]');
    const paint = (r) => {
      if (at !== peekAt) return;
      body.innerHTML = preview(r, o.spec);
      el.querySelector('[data-pk-bar]').textContent = r ? 'The file, as ALMA read it' : 'As ALMA read it · simulated';
      if (i != null) setTimeout(() => show(el, i), wasOpen ? 30 : 320); else body.scrollTop = 0;
    };
    body.innerHTML = '';
    el.hidden = false; void el.offsetWidth; el.classList.add('is-open');
    if (o.code && !o.noFile) get(o.code).then(paint); else paint(null);
    if (!wasOpen) setTimeout(() => el.querySelector('.docd-panel').focus({ preventScroll: true }), 320);
  };
  const closePeek = (host) => {
    const el = host && host.querySelector(':scope > .cmf-peek'); if (!el || el.hidden) return;
    el.classList.remove('is-open'); peekAt++;
    setTimeout(() => { if (!el.classList.contains('is-open')) el.hidden = true; }, 300);
  };

  return { put, get, view, missing, sheet, preview, show, plain, fileRow, openPeek, closePeek };
})();
