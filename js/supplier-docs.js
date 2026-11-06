/* Asking a supplier for more documents (a supplier's page, suppliers.html?id=): "Ask for documents"
   in the page's header opens a drawer in two steps, as Add a supplier does (js/supplier-add.js), with
   its look and behaviour:
   1. Documents: every company document for their country, mandatory and optional, by section, each
      with a checkbox; select all overall or by section. What they already share with you, or what
      you've asked for and they haven't answered yet, is there but can't be ticked. Mandatory ones
      you don't have yet come ticked.
   2. Review and send: what's asked for, for which of your projects (products, for Beatriz), and a
      note. The request then waits for their answer on their page, as a consent you asked for (for a
      supplier you've only invited, it joins what the invitation asks for). Kept for the tab
      (js/suppliers.js, addAsk). */
(() => {
  const P = window.CMSupPage, A = window.CMSupplierAdd, S = window.CM_SUPPLIERS;
  if (!P || !P.sup || !A || !S || !S.addAsk) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const BEATRIZ = document.documentElement.dataset.persona === 'beatriz';

  const st = document.createElement('style');
  st.textContent = `
.sd .sa-docs label.is-off { cursor: default; }
.sd .sa-docs label.is-off:hover { background: none; }
.sd .sa-docs label.is-off b { color: var(--color-ink-subtle); }
.sd .sa-docs label.is-off input { cursor: default; }
.sd .sa-docs small em { font-style: normal; color: var(--color-positive); }
.sd .sa-docs small em.is-wait { color: var(--color-ink-muted); }
.sd .sa-docs small em.is-gone { color: var(--color-critical, #b3261e); }
.sd .sa-grp-h .sa-ck input:disabled { cursor: default; }`;
  document.head.appendChild(st);

  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M12 12v6M9 15h6"/></svg>';
  const dw = document.createElement('div');
  dw.className = 'docd sa sd'; dw.hidden = true;
  dw.innerHTML = `<div class="docd-scrim" data-sd-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="sd-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${ICO}</span><div class="docd-t"><h3 id="sd-t">Ask for documents</h3><p id="sd-sub"></p></div>
        <button type="button" class="dlg-x" data-sd-x aria-label="Close">${X}</button></header>
      <form class="docd-body" id="sd-body" novalidate></form>
      <footer class="docd-foot"><span id="sd-step"></span><span class="sa-acts" id="sd-acts"></span></footer>
    </aside>`;
  document.body.appendChild(dw);
  const $ = (id) => dw.querySelector('#' + id);

  // the flow's state; the documents, and where each stands with them, are read again on every open
  let f = null, back = null, sup = null, DOCS = [];
  const groups = (docs) => docs.reduce((g, d) => { (g[d.section] = g[d.section] || []).push(d); return g; }, {});
  const askable = (l) => l.filter((d) => !d.off);
  const load = () => {
    sup = P.sup;
    const by = (state) => new Map(sup.consents.filter((c) => c.state === state).flatMap((c) => (c.codes || []).concat(c.docs.map((d) => d.code)).map((k) => [k, c])));
    const inv = sup.status === 'invited', shared = by('given'), waiting = by(inv ? 'none' : 'pending'), gone = by('removed');
    const asked = inv ? new Set(sup.consents[0].docs.map((d) => d.code)) : null;
    DOCS = A.docsOf(inv ? sup.invite.country : BEATRIZ ? 'US' : 'PT').map((d) => {
      const x = Object.assign({}, d);
      if (shared.has(d.code)) { x.off = true; x.why = '<em>Shared with you</em>'; }
      else if (asked && asked.has(d.code)) { x.off = true; x.why = '<em class="is-wait">In your invitation</em>'; }
      else if (waiting.has(d.code)) { x.off = true; x.why = `<em class="is-wait">Asked on ${esc(waiting.get(d.code).granted)}, waiting for their answer</em>`; }
      else if (gone.has(d.code)) x.why = `<em class="is-gone">Consent removed on ${esc(gone.get(d.code).removed)}</em>`;
      return x;
    });
  };

  // ---- step 1: the documents they're asked for ----------------------------------------------------
  const step1 = () => {
    const can = askable(DOCS), g = groups(DOCS), n = can.filter((d) => f.picked.has(d.code)).length;
    return `<section class="sa-card"><h4>What you need from ${esc(sup.name)}</h4><p>The documents they&rsquo;ll be asked to share with you. The mandatory ones you don&rsquo;t have yet are ticked; add any of the optional ones you need. What they already share with you, or haven&rsquo;t answered yet, can&rsquo;t be asked for again.</p></section>
      ${can.length ? `<div class="sa-all"><label class="sa-ck"><input type="checkbox" data-all${n === can.length ? ' checked' : ''}>Select all</label><span><b id="sd-n">${n}</b> of ${can.length} you can ask for</span></div>` : '<div class="sa-all"><span>They already share, or have been asked for, every document on the list.</span></div>'}
      ${Object.entries(g).map(([sec, list]) => { const c = askable(list), k = c.filter((d) => f.picked.has(d.code)).length; return `<section class="sa-grp"><div class="sa-grp-h"><label class="sa-ck"><input type="checkbox" data-sec="${esc(sec)}"${c.length && k === c.length ? ' checked' : ''}${c.length ? '' : ' disabled'}>${esc(sec)}</label><span>${c.length ? `${k} of ${c.length}` : 'Nothing to ask for'}</span></div>
        <ul class="sa-docs">${list.map((d) => `<li><label${d.off ? ' class="is-off"' : ''}><input type="checkbox" data-doc="${esc(d.code)}"${d.off ? ' checked disabled' : f.picked.has(d.code) ? ' checked' : ''}><span><b>${esc(d.name)}</b><small>${esc(d.code)} &middot; ${d.req ? 'Mandatory' : 'Optional'}${d.why ? ` &middot; ${d.why}` : ''}</small></span></label></li>`).join('')}</ul></section>`; }).join('')}`;
  };
  // the section and Select all boxes: ticked, empty, or in between
  const marks = () => {
    const g = groups(DOCS), can = askable(DOCS);
    dw.querySelectorAll('[data-sec]').forEach((b) => { const l = askable(g[b.dataset.sec]), k = l.filter((d) => f.picked.has(d.code)).length; if (!l.length) return; b.checked = k === l.length; b.indeterminate = k > 0 && k < l.length; b.closest('.sa-grp-h').querySelector('span').textContent = `${k} of ${l.length}`; });
    const all = dw.querySelector('[data-all]'), n = can.filter((d) => f.picked.has(d.code)).length;
    if (all) { all.checked = n === can.length; all.indeterminate = n > 0 && n < can.length; }
    if ($('sd-n')) $('sd-n').textContent = n;
    acts();
  };

  // ---- step 2: what's being sent, for what, and to whom -------------------------------------------
  const step2 = () => {
    const docs = askable(DOCS).filter((d) => f.picked.has(d.code)), req = docs.filter((d) => d.req).length, inv = sup.status === 'invited';
    const PR = S.PROJECTS || {};
    return `<section class="sa-card"><h4>Review and send</h4><dl class="sa-sum">
        <div><dt>Supplier</dt><dd>${esc(sup.name)}<small>${inv ? `Invited on ${esc(sup.invite.invited)}: they get it with your invitation` : `${esc(sup.email || '')}${sup.email ? ' &middot; ' : ''}their team gets it on C&#8209;MORE`}</small></dd></div>
        <div><dt>Documents</dt><dd>${docs.length} asked for<small>${req} mandatory, ${docs.length - req} optional: ${docs.map((d) => esc(d.name)).join(', ')}</small></dd></div>
      </dl></section>
      ${inv ? '' : `<section class="sa-card"><label class="sa-f"><span>For</span><select class="sa-in" name="project"><option value="">All your ${esc(S.WORDS.scope)}</option>${Object.entries(PR).map(([k, v]) => `<option value="${esc(k)}"${f.project === k ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select><small>Which of your ${esc(S.WORDS.scope)} they share them for.</small></label></section>`}
      <section class="sa-card"><label class="sa-f"><span>A note for them <i>(optional)</i></span><textarea class="sa-in" name="note" rows="3" placeholder="Why you&rsquo;re asking, or what it&rsquo;s for">${esc(f.note)}</textarea></label></section>`;
  };

  const STEPS = ['Documents', 'Review'];
  const acts = () => {
    const n = askable(DOCS).filter((d) => f.picked.has(d.code)).length;
    $('sd-acts').innerHTML = f.step === 1 ? `<button type="button" class="link-btn" data-sd-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-sd-next${n ? '' : ' disabled'}>Continue</button>`
      : '<button type="button" class="link-btn" data-sd-back>Back</button><button type="button" class="btn btn-primary btn-sm" data-sd-send>Send request</button>';
    $('sd-step').textContent = `Step ${f.step} of 2 · ${STEPS[f.step - 1]}`;
  };
  const paint = () => {
    $('sd-sub').textContent = `${sup.name}${sup.email ? ` · ${sup.email}` : ''}`;
    $('sd-body').innerHTML = f.step === 1 ? step1() : step2();
    if (f.step === 1) marks(); else acts();
    $('sd-body').scrollTop = 0;
  };

  const open = () => {
    load();
    f = { step: 1, picked: new Set(askable(DOCS).filter((d) => d.req).map((d) => d.code)), project: '', note: '' };
    back = document.activeElement;
    dw.hidden = false; document.documentElement.style.overflow = 'hidden'; paint();
    setTimeout(() => dw.classList.add('is-open'), 20);
    setTimeout(() => { const b = dw.querySelector('[data-all], [data-sd-next]'); (b || dw.querySelector('.docd-panel')).focus({ preventScroll: true }); }, 340);
  };
  const close = () => {
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { dw.hidden = true; }, 280); if (back && back.isConnected) back.focus(); f = null;
  };
  const send = () => {
    const docs = askable(DOCS).filter((d) => f.picked.has(d.code)), inv = sup.status === 'invited', name = sup.name, n = docs.length;
    S.addAsk(sup.id, {
      id: `${sup.id}-ask-${Date.now().toString(36)}`, at: P.today(), project: inv ? '' : f.project, note: f.note.trim(),
      docs: docs.map((d) => d.code), required: docs.filter((d) => d.req).map((d) => d.code),
      names: Object.fromEntries(docs.map((d) => [d.code, d.name])), sections: Object.fromEntries(docs.map((d) => [d.code, d.home || d.section])),
    });
    close();
    if (P.reload) P.reload();
    A.toast(inv ? `${n} document${n === 1 ? '' : 's'} added to your invitation to ${name}.` : `Asked ${name} for ${n} document${n === 1 ? '' : 's'}. You see each one as soon as they say yes.`);
  };

  dw.addEventListener('click', (e) => {
    if (!f) return;
    if (e.target.closest('[data-sd-x]')) { close(); return; }
    if (e.target.closest('[data-sd-back]')) { f.step = 1; paint(); return; }
    if (e.target.closest('[data-sd-next]')) { f.step = 2; paint(); return; }
    if (e.target.closest('[data-sd-send]')) send();
  });
  dw.addEventListener('change', (e) => {
    if (!f) return;
    const t = e.target, on = t.checked;
    if (t.name === 'project') { f.project = t.value; return; }
    if (t.matches('[data-doc]')) f.picked[on ? 'add' : 'delete'](t.dataset.doc);
    else if (t.matches('[data-sec]')) askable(groups(DOCS)[t.dataset.sec]).forEach((d) => f.picked[on ? 'add' : 'delete'](d.code));
    else if (t.matches('[data-all]')) askable(DOCS).forEach((d) => f.picked[on ? 'add' : 'delete'](d.code));
    else return;
    dw.querySelectorAll('[data-doc]:not(:disabled)').forEach((b) => { b.checked = f.picked.has(b.dataset.doc); });
    marks();
  });
  dw.addEventListener('input', (e) => { if (f && e.target.name === 'note') f.note = e.target.value; });
  dw.addEventListener('keydown', (e) => { if (f && e.key === 'Escape') close(); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-sup-docs]')) { e.preventDefault(); open(); } });
  window.CMSupplierDocs = { open, close };
})();
