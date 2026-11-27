/* A document in the drawer, from any table that lists documents (.docd .cdd, as in Documents and
   on a supplier's page): the file, what ALMA read on it with her confidence and a citation for each
   value (Show on the page opens the preview beside, js/doc-files.js), the document's facts, and
   what the catalog says about it. Previous / Next walk the table's documents, in its order.
   window.CMDocDrawer.open(list, i, opts)
     list: [{ name, code, own (yours: every field ALMA read), status ('valid'|'expiring'|'expired'|'missing'|…), tag (its badge's HTML),
              valid (the expiry date as shown, or ''), note, section, requirement,
              holder: { name, id, nipc, city, employer }, bar (the line under the title),
              facts: [[label, html], …] (a card of its own, e.g. "On this project"), link: { href, text },
              sharing: () => ({ title, rows: [[label, html], …], btn, open }) (a card of its own: who it's shared with,
                and a button that opens a panel beside, as the file's preview: open(api) calls api.side(…)) }]
     opts.nav(i, n): the line between Previous and Next.
   window.CMDocDrawer.side({ title, sub, bar, body, foot, wire(aside) }): the panel beside; sideClose(); redraw(). */
window.CMDocDrawer = (() => {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const en = (x) => (x && typeof x === 'object' ? x.en || '' : x || '');
  // the catalog, and the project's own papers (js/project-req.js): read when first needed, whatever order the scripts load in
  let codes = null;
  const catOf = (code) => {
    if (!codes) codes = Object.fromEntries(((window.DOC_CATALOG || {}).docs || []).concat((window.CMProjectReq && window.CMProjectReq.EXTRA) || []).map((d) => [d.code, d]));
    return codes[code] || {};
  };
  const NO_FILE = ['missing', 'notuploaded', 'notshared', 'na'];
  // ALMA's confidence: a number, and its band
  const hashOf = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100003, 7);
  const confN = (k) => { const h = hashOf(k); return h % 4 ? 90 + (h % 9) : 76 + (h % 12); };
  const confB = (p) => (p >= 90 ? '<span class="co-badge b-ok" title="Read cleanly, and it matches their profile.">High confidence</span>' : p >= 75 ? '<span class="co-badge b-pend" title="Read well, but worth a glance.">Medium confidence</span>' : '<span class="co-badge b-over" title="ALMA isn&rsquo;t sure of something here. Check it against the file.">Low confidence</span>');
  // what a document without fields of its own in the catalog shows (the project's papers, a worker's own)
  const BASIC = [{ name: 'Holder', type: 'Text' }, { name: 'Reference number', type: 'Text' }, { name: 'Issue date', type: 'Date' }, { name: 'Expiry date', type: 'Date' }];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const LEFT = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.08 10l3.71 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>';
  const DOCI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  let dw = null, at = null, back = null;
  const dq = (x) => dw.querySelector('#cmdd-' + x);
  const build = () => {
    dw = document.createElement('div');
    dw.className = 'docd cdd'; dw.hidden = true;
    dw.innerHTML = `<div class="docd-scrim" data-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="cmdd-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${DOCI}</span><div class="docd-t"><h3 id="cmdd-t"></h3><p id="cmdd-sub"></p></div>
        <button type="button" class="dlg-x" data-x aria-label="Close the document"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
      <div class="docd-bar"><span id="cmdd-bar"></span><span id="cmdd-st"></span></div>
      <div class="docd-body" id="cmdd-body"></div>
      <div class="docd-nav" role="group" aria-label="Documents in this table"><button type="button" class="docd-step" data-step="-1">${LEFT}Previous document</button><span id="cmdd-n"></span><button type="button" class="docd-step is-next" data-step="1">Next document${LEFT}</button></div>
    </aside>`;
    document.body.appendChild(dw);
    dw.addEventListener('click', (e) => {
      if (!at) return;
      if (e.target.closest('[data-x]')) { close(); return; }
      if (e.target.closest('[data-cmf-peek]')) { if (at.pv) { sideClose(); window.CMFiles.openPeek(dw, at.pv); } return; }
      if (e.target.closest('[data-cmdd-share]')) { const sh = at.list[at.i].sharing; if (sh) sh().open(); return; }
      // a citation: opened in place; Show on the page opens the preview beside, at that value
      const cb = e.target.closest('[data-cite]');
      if (cb) { const row = dw.querySelector('#cmdd-cite-' + cb.dataset.cite), open = row.hidden; row.hidden = !open; cb.setAttribute('aria-expanded', String(open)); cb.textContent = open ? 'Hide citation' : 'View citation'; return; }
      const sh = e.target.closest('[data-cite-show]'); if (sh) { if (at.pv) window.CMFiles.openPeek(dw, at.pv, +sh.dataset.citeShow); return; }
      const st = e.target.closest('[data-step]'); if (st && !st.disabled) { at.i += +st.dataset.step; sideClose(); draw(); }
    });
    document.addEventListener('keydown', (e) => {
      if (!at) return;
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.target.closest && e.target.closest('input, textarea')) return;
      else if (side && !side.hidden) return;
      else if (e.key === 'ArrowLeft' && at.i > 0) { at.i -= 1; draw(); }
      else if (e.key === 'ArrowRight' && at.i < at.list.length - 1) { at.i += 1; draw(); }
    });
  };
  const draw = () => {
    const d0 = at.list[at.i], cat = catOf(d0.code), h = d0.holder || {};
    const RQ = ((window.DOC_CATALOG || {}).labels || {}).requirement || {};
    const d = d0.requirement || !cat.requirement ? d0 : Object.assign({}, d0, { requirement: RQ[cat.requirement] || '' });
    const has = !NO_FILE.includes(d.status), cn = confN(d.code + (h.id || h.name || ''));
    dq('t').textContent = d.name;
    dq('sub').innerHTML = [h.name && esc(h.name), esc(d.code), d.requirement && esc(d.requirement), d.tag].filter(Boolean).join(' &middot; ');
    dq('bar').textContent = d.bar || '';
    dq('st').innerHTML = has ? confB(cn) : '';
    const file = `${String(d.name).replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}.pdf`;
    const fileHtml = !has ? `<div class="cmf-none">${DOCI}<h4>${d.status === 'na' ? 'Not applicable' : 'Not on file yet'}</h4><p>${esc(d.note || 'ALMA has asked for it.')}</p></div>`
      : window.CMFiles && window.CMFiles.fileRow ? window.CMFiles.fileRow(file, 'Simulated: the demo&rsquo;s documents have no files') : '';
    // what ALMA read: the fields clients see, each with her confidence and its citation.
    // Prototype: the values come from the holder and the document's dates
    const issuer = en(cat.usuallyIssuedBy).split(';')[0].trim(), hn = hashOf(d.code + (h.id || h.name || ''));
    const vt = Date.parse(d.valid), issued = Number.isNaN(vt) ? '' : (() => { const x = new Date(vt); x.setFullYear(x.getFullYear() - 1); return `${x.getDate()} ${MON[x.getMonth()]} ${x.getFullYear()}`; })();
    const valOf = (n) => {
      n = n.toLowerCase();
      if (/expiry|valid until|validity|end date|next exam|next inspection/.test(n)) return d.valid && d.valid !== '—' && !Number.isNaN(vt) ? d.valid : '';
      if (/issue date|date of issue|issued on|^date$/.test(n)) return issued;
      if (/(provider|insurer|issuer|certification body).*tax number/.test(n)) return '';
      if (/tax number|nipc|\bnif\b|vat/.test(n)) return h.nipc || '';
      if (/employer/.test(n)) return h.employer || h.name || '';
      if (/legal name|company name|policyholder|holder|insured|organi[sz]ation|supplier name|full name|worker name/.test(n)) return h.name || '';
      if (/issuer|issued by|insurer|certification body|authority|provider/.test(n)) return issuer;
      if (/address/.test(n)) return h.city || '';
      if (/(certificate|policy|licence|license|reference|registration|document|report) (no|number)|^number$|reference|access code/.test(n)) return `${d.code}/${(String(d.valid).match(/\d{4}/) || ['2026'])[0]}-${1000 + (hn % 9000)}`;
      return '';
    };
    const partOf = (n) => (/date|expir|valid|until|next/i.test(n) ? 'Validity' : /sign|representative|officer/i.test(n) ? 'Signatures' : /number|reference|code|nif|tax/i.test(n) ? 'Identification' : 'Particulars');
    // yours: every field; someone else's: only what they share with clients (a worker's personal data stays with them)
    const priv = !d.own && !!h.employer; // a person's papers, from someone else's company
    const src = priv ? [] : cat.fields && cat.fields.length ? cat.fields.filter((x) => d.own || x.visibleToClients !== false) : BASIC;
    const fields = !has ? [] : src.map((x) => ({ name: x.name, type: x.type, value: valOf(x.name), conf: Math.min(99, cn + ([...x.name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % 7) - 3) })).filter((x) => x.value);
    at.pv = !has || !window.CMFiles ? null : { title: d.name, sub: `${h.name || ''} · ${file}`, noFile: true, spec: { title: d.name, file, holder: h.name || '', issuer, fields: fields.map((x, k) => ({ name: x.name, value: x.value, i: k })) } };
    const read = fields.length ? `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><table class="cd-fields"><tbody>${fields.map((x, k) => `<tr><td><span class="n">${esc(x.name)}</span><span class="d">${esc(x.type || '')}</span></td><td>${esc(x.value)}<button type="button" class="esgq-src-btn" data-cite="${k}" aria-expanded="false" aria-controls="cmdd-cite-${k}">View citation</button></td><td>${confB(x.conf)}</td></tr>
      <tr class="cdd-cite-row" id="cmdd-cite-${k}" hidden><td colspan="3"><figure class="esgq-src cdd-src"><figcaption><b>${esc(file)}</b><span>Page 1 &middot; ${partOf(x.name)}</span></figcaption><blockquote>&ldquo;${esc(x.name)}: <mark>${esc(x.value)}</mark>&rdquo;</blockquote><button type="button" class="esgq-src-open" data-cite-show="${k}">Show on the page</button></figure></td></tr>`).join('')}</tbody></table></section>`
      : has && !src.length ? `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><p class="cdd-desc">ALMA checked it against the catalog. What&rsquo;s on it is personal data, so it stays with ${esc(h.employer || h.name || 'them')}: you see its status and dates.</p></section>` : '';
    if (window.CMFiles) window.CMFiles.closePeek(dw);
    const kv = (k, v) => (v ? `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>` : '');
    const desc = en(cat.description);
    dq('body').innerHTML = fileHtml + read
      + `<section class="cdd-card"><h4 class="eyebrow">This document</h4><dl class="pd-facts cdd-facts">${kv('Status', d.tag)}${kv('Expiry date', esc(!d.valid || d.valid === '—' ? 'Not on file' : d.valid))}${d.note && has ? kv('Note', esc(d.note)) : ''}${kv('Issued by', esc(issuer))}${kv('Section', esc(d.section || en(cat.section)))}</dl></section>`
      + (d.sharing ? (() => { const sh = d.sharing(); return `<section class="cdd-card"><h4 class="eyebrow">${esc(sh.title)}</h4><dl class="pd-facts cdd-facts">${sh.rows.map(([k, v]) => kv(esc(k), v)).join('')}</dl>${sh.open ? `<button type="button" class="btn btn-quiet btn-sm cdd-share-btn" data-cmdd-share>${esc(sh.btn || 'Manage sharing')}</button>` : ''}</section>`; })() : '')
      + (d.facts && d.facts.length ? `<section class="cdd-card"><h4 class="eyebrow">${esc(d.factsTitle || 'Where it applies')}</h4><dl class="pd-facts cdd-facts">${d.facts.map(([k, v]) => kv(esc(k), v)).join('')}</dl></section>` : '')
      + (desc || cat.renewal || cat.legalBasis ? `<section class="cdd-card"><h4 class="eyebrow">About this document</h4>${desc ? `<p class="cdd-desc">${esc(desc)}</p>` : ''}<dl class="pd-facts cdd-facts">${kv('Requirement', esc(d.requirement || ''))}${kv('Renewal', esc(cat.renewal || '—'))}${kv('Expiry', esc(cat.expiryRule || '—'))}${kv('Legal basis', esc(cat.legalBasis || '—'))}</dl></section>` : '')
      + (d.link ? `<p class="cdd-desc"><a class="co-link" href="${esc(d.link.href)}">${esc(d.link.text)}</a></p>` : '');
    dq('n').textContent = at.nav ? at.nav(at.i, at.list.length) : `${at.i + 1} of ${at.list.length}`;
    dw.querySelector('[data-step="-1"]').disabled = at.i === 0;
    dw.querySelector('[data-step="1"]').disabled = at.i === at.list.length - 1;
    dq('body').scrollTop = 0;
  };
  // the panel beside the drawer (as the file's preview, js/doc-files.js .cmf-peek): built afresh each time
  let side = null;
  const sideOf = () => {
    if (side) return side;
    side = document.createElement('div'); side.className = 'cmf-peek cmdd-side'; side.hidden = true;
    dw.appendChild(side);
    // Escape closes the panel first, the drawer after
    addEventListener('keydown', (e) => { if (e.key === 'Escape' && !side.hidden && side.classList.contains('is-open')) { e.stopImmediatePropagation(); e.stopPropagation(); sideClose(); } }, true);
    return side;
  };
  const sideOpen = (o) => {
    if (!dw) return;
    const el = sideOf(), was = el.classList.contains('is-open');
    if (window.CMFiles) window.CMFiles.closePeek(dw);
    el.innerHTML = `<aside class="docd-panel" role="dialog" aria-labelledby="cmdd-sd-t" tabindex="-1">
        <header class="docd-head"><span class="docd-ico" aria-hidden="true">${DOCI}</span><div class="docd-t"><h3 id="cmdd-sd-t">${esc(o.title || '')}</h3><p>${o.sub || ''}</p></div>
          <button type="button" class="dlg-x" data-sd-x aria-label="Close">${XS}</button></header>
        ${o.bar ? `<div class="docd-bar"><span>${o.bar}</span><span></span></div>` : ''}
        <div class="docd-body">${o.body || ''}</div>${o.foot ? `<footer class="docd-foot">${o.foot}</footer>` : ''}</aside>`;
    const aside = el.firstElementChild;
    aside.addEventListener('click', (e) => { if (e.target.closest('[data-sd-x]')) sideClose(); });
    if (o.wire) o.wire(aside);
    el.hidden = false; void el.offsetWidth; el.classList.add('is-open');
    setTimeout(() => aside.focus({ preventScroll: true }), was ? 0 : 320);
  };
  const sideClose = () => {
    if (!side || side.hidden) return;
    side.classList.remove('is-open');
    setTimeout(() => { if (!side.classList.contains('is-open')) side.hidden = true; }, 300);
    const b = dw.querySelector('[data-cmdd-share]'); if (b) b.focus({ preventScroll: true });
  };
  const XS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const open = (list, i = 0, opts = {}) => {
    if (!list || !list.length) return;
    if (!dw) build();
    const was = !!at;
    at = { list, i: Math.max(0, Math.min(i, list.length - 1)), nav: opts.nav };
    if (!was) back = document.activeElement;
    dw.hidden = false; document.documentElement.style.overflow = 'hidden'; draw();
    setTimeout(() => dw.classList.add('is-open'), 20); dw.querySelector('.docd-panel').focus();
  };
  const close = () => {
    if (!dw) return;
    if (window.CMFiles) window.CMFiles.closePeek(dw);
    sideClose();
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { if (!at) dw.hidden = true; }, 280);
    if (back && back.isConnected) back.focus({ preventScroll: true });
    at = null;
  };
  return { open, close, isOpen: () => !!at, side: sideOpen, sideClose, redraw: () => { if (at) draw(); } };
})();
