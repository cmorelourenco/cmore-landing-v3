/* The files themselves. A document's drawer shows the file the company uploaded — the PDF in a
   viewer, the photo as a photo — never a page drawn from what ALMA read. Files are kept in this
   browser (IndexedDB), per company and document, and forgotten on log out
   (js/company-switcher.js). A document with no file behind it (the demo company's, which were
   never uploaded here) says so instead of showing an imitation.
   window.CMFiles: put(code, file), get(code) → Promise<record|null>, view(record), missing(name, why). */
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

  return { put, get, view, missing };
})();
