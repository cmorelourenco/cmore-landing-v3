/* ALMA reading, wherever you are. When she starts reading uploaded files (js/doc-upload.js), the
   job is kept for the tab: which files, from where, and when she started. Each page then shows
   how far she is: on Documents and the homepage, the upload drawer itself comes back folded to its
   rail; anywhere else, the same rail on its own. When she's done, a toast says so, and Review opens
   her results (on Documents, if the page you're on has no upload drawer).
   The files wait in this browser's file store (js/doc-files.js) under the job's keys.
   window.CMAlmaJob: get(), save(job), clear(), progress(job), rail(), paint(railEl, state), toast(html, act), doneMsg(n).
   Prototype: she reads each file in a few seconds; nothing leaves the browser. */
window.CMAlmaJob = (() => {
  const css = `
.cmu-toast { position: fixed; left: 50%; bottom: 1.5rem; z-index: 130; transform: translate(-50%, 1rem); display: flex; align-items: center; gap: 0.625rem; max-width: calc(100vw - 2rem); padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--color-graphite, #343434); color: #fff; font-size: 0.875rem; box-shadow: 0 12px 32px -12px rgba(0, 0, 0, .4); opacity: 0; transition: opacity .2s, transform .2s; pointer-events: none; }
.cmu-toast.is-on { opacity: 1; transform: translate(-50%, 0); }
.cmu-toast.has-act { pointer-events: auto; }
.cmu-toast-a { flex: none; margin-left: 0.25rem; padding: 0.375rem 0.75rem; border: 1px solid rgba(255,255,255,.35); border-radius: 0.5rem; background: none; color: #fff; font: inherit; font-weight: 600; cursor: pointer; }
.cmu-toast-a:hover { background: rgba(255,255,255,.12); }
.cmu-fold { flex: none; display: grid; place-items: center; width: 2.25rem; height: 2.25rem; padding: 0; border: 1px solid var(--color-sand-400); border-radius: 0.5rem; background: var(--color-surface); color: var(--color-ink); cursor: pointer; box-shadow: 0 1px 2px rgba(52, 52, 52, .08); }
.cmu-fold:hover { background: var(--color-light-beige); border-color: var(--color-graphite); }
.cmu-fold svg { width: 1.125rem; height: 1.125rem; }
.cmu-rail { display: flex; flex-direction: column; align-items: center; gap: 1rem; height: 100%; padding: 1rem 0 1.5rem; }
.cmu-rail[hidden] { display: none; }
.cmu-rail-st { position: relative; display: grid; place-items: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0.75rem; background: var(--color-light-beige); color: var(--color-ink); cursor: pointer; }
.cmu-rail-st:hover { background: var(--color-mid-beige); }
/* a document being read: its lines write in one after another while a scan line passes down it, on a loop */
.cmu-doc { width: 1.75rem; height: 1.75rem; overflow: visible; }
.cmu-doc .pg { fill: var(--color-surface); stroke: currentColor; stroke-width: 1.5; stroke-linejoin: round; }
.cmu-doc .ln { stroke: var(--color-sand-500); stroke-width: 1.5; stroke-linecap: round; stroke-dasharray: 10; stroke-dashoffset: 0; }
.cmu-doc .scan { fill: var(--color-coral); opacity: 0; }
.cmu-rail-st.is-reading .ln { animation: cmu-write 2.4s ease-in-out infinite; }
.cmu-rail-st.is-reading .ln:nth-of-type(2) { animation-delay: .25s; }
.cmu-rail-st.is-reading .ln:nth-of-type(3) { animation-delay: .5s; }
.cmu-rail-st.is-reading .ln:nth-of-type(4) { animation-delay: .75s; }
.cmu-rail-st.is-reading .scan { animation: cmu-scan 2.4s ease-in-out infinite; }
.cmu-rail-st.is-done .ln { stroke: var(--color-ink-muted); }
@keyframes cmu-write { 0% { stroke-dashoffset: 10; } 35%, 75% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -10; } }
@keyframes cmu-scan { 0% { transform: translateY(0); opacity: 0; } 12% { opacity: .55; } 80% { opacity: .55; } 100% { transform: translateY(15px); opacity: 0; } }
.cmu-rail-ok { position: absolute; right: -0.125rem; bottom: -0.125rem; display: grid; place-items: center; width: 1.25rem; height: 1.25rem; border: 2px solid var(--color-surface); border-radius: 50%; background: var(--color-graphite); color: #fff; transform: scale(0); transition: transform .35s var(--ease-brand, ease); }
.cmu-rail-ok svg { width: 0.625rem; height: 0.625rem; }
.cmu-rail-st.is-done .cmu-rail-ok { transform: none; }
.cmu-rail-n { margin-top: -0.375rem; font-size: 0.75rem; font-weight: 600; font-variant-numeric: tabular-nums; color: var(--color-ink-subtle); }
.cmu-rail-t { margin-top: 0.25rem; padding: 0.5rem 0; border: 0; background: none; writing-mode: vertical-rl; font: inherit; font-size: 0.75rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--color-ink-subtle); cursor: pointer; white-space: nowrap; }
.cmu-rail-t:hover { color: var(--color-ink); }
@media (prefers-reduced-motion: reduce) { .cmu-rail-st.is-reading :is(.ln, .scan) { animation: none; } }
.cmu-toast svg { flex: none; width: 1.125rem; height: 1.125rem; color: var(--color-ok, #a6d8a0); }
/* on a page without the upload drawer: the rail on its own, where the folded drawer would be */
.cmj { position: fixed; top: 0; right: 0; bottom: 0; z-index: 100; width: 4.5rem; background: var(--color-surface, #fff); border-left: 1px solid var(--color-line); box-shadow: -24px 0 60px -30px rgba(52, 52, 52, .35); }`;
  const st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);

  const beatriz = () => document.documentElement.dataset.persona === 'beatriz';
  const KEY = () => 'cm-alma-job' + (beatriz() ? '-beatriz' : '');
  const get = () => { try { return JSON.parse(sessionStorage.getItem(KEY())) || null; } catch (e) { return null; } };
  const save = (job) => { try { sessionStorage.setItem(KEY(), JSON.stringify(job)); } catch (e) {} };
  const clear = () => { try { sessionStorage.removeItem(KEY()); } catch (e) {} };
  // how far she is: by the clock, so it carries on across pages
  const progress = (job) => { const total = job.files.length, read = Math.min(total, Math.floor((Date.now() - job.start) / job.per)); return { read, total, done: read >= total }; };

  const FOLD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 17l-5-5 5-5M11 17l-5-5 5-5"/></svg>';
  const DOC = '<svg class="cmu-doc" viewBox="0 0 24 24" aria-hidden="true"><path class="pg" d="M14.5 2.75H6.75a2 2 0 0 0-2 2v14.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2V7.5z"/><path class="pg" d="M14.5 2.75V7.5h4.75" fill="none"/><line class="ln" x1="8" y1="10.5" x2="16" y2="10.5"/><line class="ln" x1="8" y1="13.5" x2="16" y2="13.5"/><line class="ln" x1="8" y1="16.5" x2="13" y2="16.5"/><line class="ln" x1="8" y1="7" x2="11" y2="7"/><rect class="scan" x="5.5" y="4" width="13" height="1.6" rx=".8"/></svg>';
  const OKI = '<span class="cmu-rail-ok" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-7"/></svg></span>';
  // the folded rail: open it, the document she's reading (a check on it when she's done), how far
  const rail = () => `<button type="button" class="cmu-fold" data-untuck aria-label="Show the panel" title="Show the panel">${FOLD}</button>
      <button type="button" class="cmu-rail-st" data-untuck aria-label="Show the panel">${DOC}${OKI}</button><span class="cmu-rail-n"></span><button type="button" class="cmu-rail-t" data-untuck></button>`;
  // state: { reading: true|false, at (1-based, while reading), total, n (files ready, when done) }
  const paint = (r, s) => {
    const b = r.querySelector('.cmu-rail-st');
    b.className = `cmu-rail-st${s.reading ? ' is-reading' : s.done ? ' is-done' : ''}`;
    r.querySelector('.cmu-rail-n').textContent = s.reading ? `${s.at}/${s.total}` : s.done ? `${s.n}` : '';
    r.querySelector('.cmu-rail-t').textContent = s.reading ? `ALMA is reading · ${s.at} of ${s.total}` : s.done ? `Ready to review · ${s.n} file${s.n === 1 ? '' : 's'}` : 'Upload documents';
  };

  // the toast; act: [label, fn], a button on it
  const OK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"/></svg>';
  let tEl = null, tT = 0;
  const toast = (html, act) => {
    if (!tEl) { tEl = document.createElement('div'); tEl.className = 'cmu-toast'; tEl.setAttribute('role', 'status'); document.body.appendChild(tEl); }
    tEl.innerHTML = OK + `<span>${html}</span>` + (act ? `<button type="button" class="cmu-toast-a">${act[0]}</button>` : '');
    tEl.classList.toggle('has-act', !!act); tEl.classList.add('is-on');
    if (act) tEl.querySelector('.cmu-toast-a').onclick = () => { tEl.classList.remove('is-on'); act[1](); };
    clearTimeout(tT); tT = setTimeout(() => tEl.classList.remove('is-on'), act ? 9000 : 4200);
  };
  const doneMsg = (n) => `ALMA has read your ${n === 1 ? 'file' : `${n} files`}. ${n === 1 ? 'It&rsquo;s' : 'They&rsquo;re'} ready for you to review.`;

  // back on a page: the drawer resumes (js/doc-upload.js), or the rail on its own
  const solo = (job) => {
    if (!document.querySelector('.sn-foot')) return; // only inside the app
    const el = document.createElement('nav'); el.className = 'cmj cmu-rail'; el.setAttribute('aria-label', 'ALMA, uploading documents');
    el.innerHTML = rail(); document.body.appendChild(el);
    const go = (how) => { location.href = `company-details.html?alma=${how}`; };
    el.addEventListener('click', (e) => { if (e.target.closest('[data-untuck]')) go('open'); });
    let told = !!job.told;
    const tick = () => {
      if (!el.isConnected) return; // the upload drawer took over (js/doc-upload.js)
      const p = progress(job);
      paint(el, p.done ? { done: true, n: p.total } : { reading: true, at: p.read + 1, total: p.total });
      if (p.done) {
        // said once: on the page where she finished, or the first one after
        if (!told) { told = true; job.told = true; save(job); toast(doneMsg(p.total), ['Review', () => go('review')]); }
        return;
      }
      setTimeout(tick, Math.max(200, job.start + (p.read + 1) * job.per - Date.now() + 30));
    };
    tick();
  };
  // drawn as the page loads, before it first shows, so moving between pages is seamless (css/esg.css);
  // on Documents and the homepage the upload drawer takes over from it (js/doc-upload.js)
  { const job = get(); if (job) solo(job); }

  return { get, save, clear, progress, rail, paint, toast, doneMsg };
})();
