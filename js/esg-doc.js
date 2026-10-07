/* A citation's document, in a drawer on the right: the cited page with the passage ALMA quoted
   highlighted, between the page before and the pages after, so an answer can be checked against
   its evidence without leaving the questionnaire. It walks only the citations of the answer it
   was opened from. Prototype: the passage is real, the prose around it is filler picked from the
   document's name so a page always reads the same; anything but a PDF has no preview, and the
   drawer says so while still showing the passage. */
window.ESG_DOC = (() => {
  const FILLER = [
    'This document applies to all employees, officers and directors of the Company and, where stated, to third parties acting on its behalf. It is reviewed at least annually by the responsible function and approved by the governance body named in the control sheet.',
    'Responsibility for implementation sits with the areas identified in the annexes. Line managers are accountable for ensuring that the people reporting to them understand the requirements that apply to their activities and have the means to meet them.',
    'Where a requirement of this document conflicts with applicable law, the law prevails. Where local practice sets a higher standard than stated here, the higher standard applies.',
    'Failures to observe these requirements are handled under the disciplinary procedure, in proportion to the seriousness of the case and without prejudice to any legal consequences.',
    'Records evidencing the controls described in this section are retained for the period set out in the retention schedule and are made available to auditors and to counterparties on request.',
    'Questions about the interpretation or scope of this section should be directed to the function named in the control sheet, which maintains the definitive version of this document.',
    'Training on the contents of this section forms part of induction and is refreshed on the cycle stated in the training matrix. Attendance is recorded and reported to the governance body.',
    'The controls in this section are tested by Internal Audit on the cycle set out in the audit plan. Findings are tracked to closure and reported quarterly.',
    'Suppliers and other third parties are informed of the requirements that apply to them at the start of the relationship and whenever those requirements change. Acknowledgement is recorded in the contract file.',
    'Exceptions to this section may only be granted in writing by the function that owns it, for a stated period and reason, and are reported to the governance body at its next ordinary meeting.',
  ];
  const KIND = { pdf: 'PDF', docx: 'Word document', doc: 'Word document', xlsx: 'Excel workbook', xls: 'Excel workbook', txt: 'text file', jpg: 'image', jpeg: 'image', png: 'image' };
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const hash = (t) => { let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) | 0; return Math.abs(h); };
  const marked = (c) => { const q = esc(c.quote); if (!c.match) return q; const m = esc(c.match), at = q.indexOf(m); return at < 0 ? q : q.slice(0, at) + '<mark>' + m + '</mark>' + q.slice(at + m.length); };
  const parseLoc = (loc) => { const parts = (loc || '').split('·'), page = /Page\s+(\d+)/i.exec(parts[0] || ''); return { page: page ? +page[1] : null, section: (parts.length > 1 ? parts.slice(1).join('·') : page ? '' : parts[0] || '').trim() }; };
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const L = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.08 10l3.71 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>';

  const wrap = document.createElement('div');
  wrap.className = 'docd'; wrap.hidden = true;
  wrap.innerHTML = `<div class="docd-scrim" data-close></div>
    <aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="docd-title" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${DOC}</span><div class="docd-t"><h3 id="docd-title"></h3><p id="docd-sub"></p></div>
        <button type="button" class="dlg-x" data-close aria-label="Close the document">${X}</button></header>
      <div class="docd-bar"><span id="docd-page"></span><span id="docd-note"></span></div>
      <div class="docd-body" id="docd-body"></div>
      <footer class="docd-foot"><span id="docd-foot"></span><a class="btn btn-quiet btn-sm" href="company-details.html">Open in Documents</a></footer>
      <div class="docd-nav" role="group" aria-label="Citations for this answer">
        <button type="button" class="docd-step" id="docd-prev">${L}Previous citation</button><span id="docd-count"></span>
        <button type="button" class="docd-step is-next" id="docd-next">Next citation${L}</button></div>
    </aside>`;
  document.body.appendChild(wrap);
  const $ = (id) => wrap.querySelector('#' + id), panel = wrap.querySelector('.docd-panel'), body = $('docd-body');
  let current = null, lastFocus = null;

  const sheet = (c, n, total, seed, cited) => {
    const loc = parseLoc(c.loc), ps = seed + n * 7, before = cited ? 1 + (seed % 2) : 3, after = cited ? 2 + ((seed >> 3) % 2) : 3;
    let h = `<article class="docd-sheet${cited ? ' is-cited' : ''}"><p class="docd-kicker">${esc(c.src.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]/g, ' '))}</p>`;
    if (cited && loc.section) h += `<h4>${esc(loc.section)}</h4>`;
    for (let i = 0; i < before; i++) h += `<p>${FILLER[(ps + i) % FILLER.length]}</p>`;
    if (cited) h += `<p class="docd-cited">${marked(c)}</p>`;
    for (let i = 0; i < after; i++) h += `<p>${FILLER[(ps + before + i + 3) % FILLER.length]}</p>`;
    return h + `<div class="docd-rule"><span>${esc(c.src)}</span><span>${n} / ${total}</span></div></article>`;
  };
  const render = (c) => {
    const ext = ((/\.([a-z0-9]+)$/i.exec(c.src || '') || [])[1] || '').toLowerCase(), kind = KIND[ext] || 'file';
    $('docd-title').textContent = c.src; $('docd-sub').textContent = c.loc;
    if (ext !== 'pdf') {
      $('docd-page').textContent = kind[0].toUpperCase() + kind.slice(1) + ' · no preview';
      $('docd-note').textContent = '';
      $('docd-foot').textContent = 'The passage ALMA quoted is shown; the file itself can’t be previewed here.';
      body.innerHTML = `<div class="docd-none"><span class="docd-ico" aria-hidden="true">${DOC}</span><h4>No preview for this file</h4>
        <p>This is ${/^[aeiou]/i.test(kind) ? 'an' : 'a'} ${kind} (.${esc(ext)}), and only PDFs can be shown here. Open it in Documents to read it in full.</p>
        <div class="docd-q"><span>Passage ALMA quoted${c.loc ? ' · ' + esc(c.loc) : ''}</span><blockquote>${marked(c)}</blockquote></div></div>`;
    } else {
      const loc = parseLoc(c.loc), seed = hash(c.src + c.loc);
      let total = 14 + (seed % 26); const page = loc.page || 1 + (seed % 9); if (page > total) total = page + 3;
      const first = Math.max(1, page - 1), last = Math.min(total, page + 2);
      $('docd-page').textContent = `Cited on page ${page} of ${total}`;
      $('docd-note').textContent = `Showing pages ${first}–${last}`;
      $('docd-foot').textContent = 'The highlighted passage is the one ALMA quoted.';
      let h = ''; for (let p = first; p <= last; p++) h += sheet(c, p, total, seed, p === page);
      body.innerHTML = h;
    }
    const n = current.list.length, k = current.index;
    wrap.querySelector('.docd-nav').hidden = n < 2;
    $('docd-count').textContent = `Citation ${k + 1} of ${n}`;
    $('docd-prev').disabled = k <= 0; $('docd-next').disabled = k >= n - 1;
  };
  const land = (delay) => setTimeout(() => {
    const cited = body.querySelector('.docd-cited');
    body.scrollTop = cited ? Math.max(0, cited.offsetTop - Math.max(24, body.clientHeight / 2 - cited.offsetHeight)) : 0;
  }, delay);
  const step = (d) => { if (!current) return; const k = current.index + d; if (k < 0 || k >= current.list.length) return; current.index = k; render(current.list[k]); land(30); };
  const close = () => {
    wrap.classList.remove('is-open'); document.documentElement.classList.remove('dlg-open');
    setTimeout(() => { wrap.hidden = true; }, 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };
  $('docd-prev').addEventListener('click', () => step(-1));
  $('docd-next').addEventListener('click', () => step(1));
  wrap.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', (e) => {
    if (wrap.hidden) return;
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  return {
    open(list, index) {
      current = { list, index: Math.max(0, Math.min(list.length - 1, index || 0)) };
      render(list[current.index]);
      const was = wrap.hidden;
      if (was) { lastFocus = document.activeElement; wrap.hidden = false; requestAnimationFrame(() => wrap.classList.add('is-open')); document.documentElement.classList.add('dlg-open'); }
      land(was ? 320 : 30);
      setTimeout(() => panel.focus({ preventScroll: true }), was ? 320 : 0);
    },
    close,
  };
})();
