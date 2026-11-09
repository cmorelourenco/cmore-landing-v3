/* Asking a supplier for more documents (a supplier's page, suppliers.html?id=): "Ask for documents"
   in the page's header opens a drawer in two steps, as Add a supplier does (js/supplier-add.js), with
   its look and behaviour:
   1. Documents: every company document for their country, mandatory and optional, by section, each
      with a checkbox; select all overall or by section. What they already share with you, or what
      you've asked for and they haven't answered yet, is there but can't be ticked. Mandatory ones
      you don't have yet come ticked.
      Any document, even one they already share, can also be asked for as it was in an earlier year
      (Ask for a version by year, this year's chosen to start with): they share it, decline it, or say they don't have one from then.
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
.sd .sa-grp-h .sa-ck input:disabled { cursor: default; }
.sd .sa-docs li { display: grid; }
.sd-ver { display: flex; flex-wrap: wrap; align-items: center; gap: 0.375rem; margin: -0.25rem 0 0.625rem 2.625rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sd-ver .link-btn { font-size: 0.8125rem; }
.sd-ver > b { margin-right: 0.25rem; font-weight: 500; color: var(--color-ink); }
.sd-yr { display: inline-flex; align-items: center; gap: 0.125rem; height: 1.75rem; padding: 0 0.25rem 0 0.625rem; border-radius: 999px; background: var(--color-graphite); font-size: 0.8125rem; font-weight: 500; color: var(--color-off-white); font-variant-numeric: tabular-nums; }
.sd-yr button { width: 1.375rem; height: 1.375rem; display: grid; place-items: center; border: 0; border-radius: 999px; background: none; font: inherit; font-size: 1rem; line-height: 1; color: inherit; cursor: pointer; opacity: .75; }
.sd-yr button:hover { opacity: 1; background: rgba(255, 255, 255, .15); }
.sd-ysel { height: 1.75rem; padding: 0 1.75rem 0 0.625rem; border: 1px solid var(--color-line); border-radius: 999px; background: var(--color-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23555'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5'/%3E%3C/svg%3E") no-repeat right 0.5rem center / 0.875rem; -webkit-appearance: none; appearance: none; font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink); cursor: pointer; }
.sd-ysel:hover, .sd-ysel:focus { border-color: var(--color-graphite); outline: none; }
.sd-ver small { flex-basis: 100%; font-size: 0.75rem; }
.sa-sum .sd-vl { display: block; margin-top: 0.25rem; }`;
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
  // earlier versions, by year: any document can be asked for as it was in another year, even one
  // they already share with you (that one's current version)
  // any year back to 1990, newest first, this year's included (and chosen when the picker opens)
  const Y = new Date().getFullYear(), YEARS = Array.from({ length: Y - 1990 + 1 }, (_, k) => Y - k);
  const verN = () => [...f.vers.values()].reduce((t, l) => t + l.size, 0);
  const verUI = (d) => {
    const on = f.vers.get(d.code);
    if (!on && !f.vopen.has(d.code)) return `<div class="sd-ver" data-sd-v="${esc(d.code)}"><button type="button" class="link-btn" data-sd-vopen="${esc(d.code)}">Ask for a version by year</button></div>`;
    const picked = on ? [...on].sort((a, b) => b - a) : [];
    return `<div class="sd-ver" data-sd-v="${esc(d.code)}" role="group" aria-label="Earlier versions of ${esc(d.name)}"><b>Version from</b>${picked.map((y) => `<span class="sd-yr is-on">${y}<button type="button" data-sd-yr="${esc(d.code)}|${y}" aria-label="Remove ${y}">&times;</button></span>`).join('')}
      <select class="sd-ysel" data-sd-ysel="${esc(d.code)}" aria-label="Add a year for ${esc(d.name)}"><option value="">${picked.length ? 'Add another year' : 'Choose a year'}</option>${YEARS.filter((y) => !picked.includes(y)).map((y) => `<option value="${y}">${y}</option>`).join('')}</select>
      <button type="button" class="link-btn" data-sd-vx="${esc(d.code)}">${picked.length ? 'Clear' : 'Cancel'}</button>
      <small>${on && on.size ? `They&rsquo;re asked for the ${[...on].sort((a, b) => b - a).join(', ')} version${on.size === 1 ? '' : 's'}, and can share ${on.size === 1 ? 'it' : 'each'}, decline, or tell you they don&rsquo;t have one from that year.` : 'Pick one year or more. They can share it, decline, or tell you they don&rsquo;t have one from that year.'}</small></div>`;
  };
  const verList = () => [...f.vers.entries()].filter(([, l]) => l.size).map(([code, l]) => ({ d: DOCS.find((x) => x.code === code), years: [...l].sort((a, b) => b - a) })).filter((x) => x.d);
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
    return `<section class="sa-card"><h4>What you need from ${esc(sup.name)}</h4><p>The documents they&rsquo;ll be asked to share with you. The mandatory ones you don&rsquo;t have yet are ticked; add any of the optional ones you need. What they already share with you, or haven&rsquo;t answered yet, can&rsquo;t be asked for again, but you can ask for any document as it was in a given year.</p></section>
      ${can.length ? `<div class="sa-all"><label class="sa-ck"><input type="checkbox" data-all${n === can.length ? ' checked' : ''}>Select all</label><span><b id="sd-n">${n}</b> of ${can.length} you can ask for<span id="sd-vn"></span></span></div>` : '<div class="sa-all"><span>They already share, or have been asked for, every document on the list.</span></div>'}
      ${Object.entries(g).map(([sec, list]) => { const c = askable(list), k = c.filter((d) => f.picked.has(d.code)).length; return `<section class="sa-grp"><div class="sa-grp-h"><label class="sa-ck"><input type="checkbox" data-sec="${esc(sec)}"${c.length && k === c.length ? ' checked' : ''}${c.length ? '' : ' disabled'}>${esc(sec)}</label><span>${c.length ? `${k} of ${c.length}` : 'Nothing to ask for'}</span></div>
        <ul class="sa-docs">${list.map((d) => `<li><label${d.off ? ' class="is-off"' : ''}><input type="checkbox" data-doc="${esc(d.code)}"${d.off ? ' checked disabled' : f.picked.has(d.code) ? ' checked' : ''}><span><b>${esc(d.name)}</b><small>${esc(d.code)} &middot; ${d.req ? 'Mandatory' : 'Optional'}${d.why ? ` &middot; ${d.why}` : ''}</small></span></label>${verUI(d)}</li>`).join('')}</ul></section>`; }).join('')}`;
  };
  // the section and Select all boxes: ticked, empty, or in between
  const marks = () => {
    const g = groups(DOCS), can = askable(DOCS);
    dw.querySelectorAll('[data-sec]').forEach((b) => { const l = askable(g[b.dataset.sec]), k = l.filter((d) => f.picked.has(d.code)).length; if (!l.length) return; b.checked = k === l.length; b.indeterminate = k > 0 && k < l.length; b.closest('.sa-grp-h').querySelector('span').textContent = `${k} of ${l.length}`; });
    const all = dw.querySelector('[data-all]'), n = can.filter((d) => f.picked.has(d.code)).length;
    if (all) { all.checked = n === can.length; all.indeterminate = n > 0 && n < can.length; }
    if ($('sd-n')) $('sd-n').textContent = n;
    const vn = verN(), vs = dw.querySelector('#sd-vn'); if (vs) vs.textContent = vn ? ` + ${vn} version${vn === 1 ? '' : 's'} by year` : '';
    acts();
  };

  // ---- step 2: what's being sent, for what, and to whom -------------------------------------------
  const step2 = () => {
    const docs = askable(DOCS).filter((d) => f.picked.has(d.code)), req = docs.filter((d) => d.req).length, inv = sup.status === 'invited';
    const PR = S.PROJECTS || {};
    return `<section class="sa-card"><h4>Review and send</h4><dl class="sa-sum">
        <div><dt>Supplier</dt><dd>${esc(sup.name)}<small>${inv ? `Invited on ${esc(sup.invite.invited)}: they get it with your invitation` : `${esc(sup.email || '')}${sup.email ? ' &middot; ' : ''}their team gets it on C&#8209;MORE`}</small></dd></div>
        ${docs.length ? `<div><dt>Documents</dt><dd>${docs.length} asked for<small>${req} mandatory, ${docs.length - req} optional: ${docs.map((d) => esc(d.name)).join(', ')}</small></dd></div>` : ''}
        ${verList().length ? `<div><dt>Versions by year</dt><dd>${verN()} asked for<small>${verList().map((x) => `<span class="sd-vl">${esc(x.d.name)}: ${x.years.join(', ')}</span>`).join('')}They can share each one, decline it, or tell you they don&rsquo;t have one from that year.</small></dd></div>` : ''}
      </dl></section>
      ${inv ? '' : `<section class="sa-card"><label class="sa-f"><span>For</span><select class="sa-in" name="project"><option value="">All your ${esc(S.WORDS.scope)}</option>${Object.entries(PR).map(([k, v]) => `<option value="${esc(k)}"${f.project === k ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select><small>Which of your ${esc(S.WORDS.scope)} they share them for.</small></label></section>`}
      <section class="sa-card"><label class="sa-f"><span>A note for them <i>(optional)</i></span><textarea class="sa-in" name="note" rows="3" placeholder="Why you&rsquo;re asking, or what it&rsquo;s for">${esc(f.note)}</textarea></label></section>`;
  };

  const STEPS = ['Documents', 'Review'];
  const acts = () => {
    const n = askable(DOCS).filter((d) => f.picked.has(d.code)).length + verN();
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
    f = { step: 1, picked: new Set(askable(DOCS).filter((d) => d.req).map((d) => d.code)), project: '', note: '', vers: new Map(), vopen: new Set() };
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
    const docs = askable(DOCS).filter((d) => f.picked.has(d.code)), inv = sup.status === 'invited', name = sup.name, vl = verList(), vn = verN(), n = docs.length;
    S.addAsk(sup.id, {
      id: `${sup.id}-ask-${Date.now().toString(36)}`, at: P.today(), project: inv ? '' : f.project, note: f.note.trim(),
      docs: docs.map((d) => d.code), required: docs.filter((d) => d.req).map((d) => d.code),
      names: Object.fromEntries(docs.concat(vl.map((x) => x.d)).map((d) => [d.code, d.name])), sections: Object.fromEntries(docs.concat(vl.map((x) => x.d)).map((d) => [d.code, d.home || d.section])),
      versions: Object.fromEntries(vl.map((x) => [x.d.code, x.years])),
    });
    close();
    if (P.reload) P.reload();
    const what = [n ? `${n} document${n === 1 ? '' : 's'}` : '', vn ? `${vn} version${vn === 1 ? '' : 's'} by year` : ''].filter(Boolean).join(' and ');
    A.toast(inv ? `${what} added to your invitation to ${name}.` : `Asked ${name} for ${what}. You see each one as soon as they answer.`);
  };

  dw.addEventListener('click', (e) => {
    if (!f) return;
    if (e.target.closest('[data-sd-x]')) { close(); return; }
    if (e.target.closest('[data-sd-back]')) { f.step = 1; paint(); return; }
    if (e.target.closest('[data-sd-next]')) { f.step = 2; paint(); return; }
    if (e.target.closest('[data-sd-send]')) { send(); return; }
    // earlier versions: open the years, pick some, clear them
    const vo = e.target.closest('[data-sd-vopen]'), yr = e.target.closest('[data-sd-yr]'), vx = e.target.closest('[data-sd-vx]');
    if (vo || yr || vx) {
      const code = vo ? vo.dataset.sdVopen : vx ? vx.dataset.sdVx : yr.dataset.sdYr.split('|')[0];
      if (vo) { f.vopen.add(code); if (!f.vers.has(code)) f.vers.set(code, new Set([Y])); }
      if (vx) { f.vopen.delete(code); f.vers.delete(code); }
      if (yr) { const y = +yr.dataset.sdYr.split('|')[1], l = f.vers.get(code) || new Set(); l.has(y) ? l.delete(y) : l.add(y); if (l.size) f.vers.set(code, l); else f.vers.delete(code); }
      const box = dw.querySelector(`[data-sd-v="${CSS.escape(code)}"]`), d = DOCS.find((x) => x.code === code);
      if (box && d) { box.outerHTML = verUI(d); }
      const again = vo || yr ? (yr && dw.querySelector(`[data-sd-yr="${CSS.escape(yr.dataset.sdYr)}"]`)) || dw.querySelector(`[data-sd-ysel="${CSS.escape(code)}"]`) : dw.querySelector(`[data-sd-vopen="${CSS.escape(code)}"]`);
      if (again) again.focus({ preventScroll: true });
      marks();
    }
  });
  dw.addEventListener('change', (e) => {
    if (!f) return;
    const t = e.target, on = t.checked;
    // a year chosen from the list: added to the ones asked for
    if (t.matches('[data-sd-ysel]')) {
      const code = t.dataset.sdYsel, y = +t.value, d = DOCS.find((x) => x.code === code); if (!y || !d) return;
      const l = f.vers.get(code) || new Set(); l.add(y); f.vers.set(code, l);
      const box = dw.querySelector(`[data-sd-v="${CSS.escape(code)}"]`); if (box) box.outerHTML = verUI(d);
      const sel = dw.querySelector(`[data-sd-ysel="${CSS.escape(code)}"]`); if (sel) sel.focus({ preventScroll: true });
      marks(); return;
    }
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
