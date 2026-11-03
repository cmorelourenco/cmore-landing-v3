/* Asking a supplier for consent again (a supplier's page, suppliers.html?id=): "Ask again" on a
   consent they removed opens a drawer with every document you could ask them for. The consent
   you clicked comes ticked; tick any other removed consent, or more documents, to ask for them all
   in one go. The look is Add a supplier's documents step (js/supplier-add.js). */
(() => {
  const P = window.CMSupPage, A = window.CMSupplierAdd;
  const sup = P && P.sup;
  if (!sup || !A || sup.status === 'invited') return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const BEATRIZ = document.documentElement.dataset.persona === 'beatriz';
  const removed = sup.consents.filter((c) => c.state === 'removed');
  if (!removed.length) return;

  const st = document.createElement('style');
  st.textContent = `
.sk-grp-h { flex-wrap: wrap; }
.sk-grp-h small { flex-basis: 100%; margin-top: -0.125rem; padding-left: 1.75rem; font-size: 0.8125rem; letter-spacing: 0; text-transform: none; color: var(--color-ink-subtle); }
.sk-sub { margin-top: 0.5rem; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-subtle); }
.sk-grp.is-removed { box-shadow: inset 3px 0 0 var(--color-critical, #b3261e); }
.sk-grp.is-removed .sa-grp-h { background: var(--color-critical-subtle, #fbe9e7); }
.sa-grp-h.sk-grp-h .co-badge { flex: none; height: 1.5rem; margin-left: auto; margin-right: 0.75rem; padding: 0 0.5rem; border-radius: 0.375rem; background: var(--color-critical, #b3261e); color: #fff; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.01em; text-transform: none; }
.sk-grp-h .co-badge + span { flex: none; }
.sa .docd-foot #sk-n b { color: var(--color-ink); }`;
  document.head.appendChild(st);

  // what you could ask them for: the consents they removed, then every other company document
  // (for their country) that isn't already shared with you or waiting for their answer
  const busy = new Set(sup.consents.filter((c) => c.state !== 'removed').flatMap((c) => c.codes || c.docs.map((d) => d.code)));
  const inRemoved = new Set(removed.flatMap((c) => c.docs.map((d) => d.code)));
  const more = A.docsOf(BEATRIZ ? 'US' : 'PT').filter((d) => !busy.has(d.code) && !inRemoved.has(d.code))
    .reduce((g, d) => { const k = d.req ? d.home : d.section; (g[k] = g[k] || []).push(d); return g; }, {});
  const GROUPS = removed.map((c) => ({ key: c.id, title: c.title, sub: `${c.project ? `For ${c.project}` : 'For all your projects'} · removed on ${c.removed}`, removed: true, docs: c.docs.map((d) => ({ code: d.code, name: d.name, req: /mandatory/i.test(d.requirement) })) }))
    .concat(Object.entries(more).map(([sec, l]) => ({ key: `more:${sec}`, title: sec, docs: l })));
  const ALL = [...new Set(GROUPS.flatMap((g) => g.docs.map((d) => d.code)))];

  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/></svg>';
  const dw = document.createElement('div');
  dw.className = 'docd sa'; dw.hidden = true;
  dw.innerHTML = `<div class="docd-scrim" data-sk-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="sk-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${ICO}</span><div class="docd-t"><h3 id="sk-t">Ask for consent again</h3><p>${esc(sup.name)}${sup.email ? ` · ${esc(sup.email)}` : ''}</p></div>
        <button type="button" class="dlg-x" data-sk-x aria-label="Close">${X}</button></header>
      <form class="docd-body" id="sk-body" novalidate></form>
      <footer class="docd-foot"><span id="sk-n"></span><span class="sa-acts"><button type="button" class="link-btn" data-sk-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-sk-send>Ask for consent</button></span></footer>
    </aside>`;
  document.body.appendChild(dw);
  const body = dw.querySelector('#sk-body');

  let picked = null, note = '', back = null, first = null, asked = new Set(); // asked: the removed consents already asked again for
  const k = (g) => g.docs.filter((d) => picked.has(d.code)).length;
  const row = (d) => `<li><label><input type="checkbox" data-doc="${esc(d.code)}"${picked.has(d.code) ? ' checked' : ''}><span><b>${esc(d.name)}</b><small>${esc(d.code)} &middot; ${d.req ? 'Mandatory' : 'Optional'}</small></span></label></li>`;
  const grp = (g) => `<section class="sa-grp${g.removed ? ' sk-grp is-removed' : ''}"><div class="sa-grp-h sk-grp-h"><label class="sa-ck"><input type="checkbox" data-grp="${esc(g.key)}">${esc(g.title)}</label>${g.removed ? '<span class="co-badge b-over">Consent removed</span>' : ''}<span data-grp-n="${esc(g.key)}"></span>${g.sub ? `<small>${esc(g.sub)}${asked.has(g.key) ? ' · asked again' : ''}</small>` : ''}</div>
      <ul class="sa-docs">${g.docs.map(row).join('')}</ul></section>`;
  const paint = () => {
    const rem = GROUPS.filter((g) => g.removed).sort((a, b) => (b.key === first) - (a.key === first)), rest = GROUPS.filter((g) => !g.removed);
    body.innerHTML = `<section class="sa-card"><h4>What you need from ${esc(sup.name)}</h4><p>The consent you clicked is ticked. Tick any other you need too, and we ask for them all in one request. You see each document as soon as they say yes.</p></section>
      <div class="sa-all"><label class="sa-ck"><input type="checkbox" data-all>Select all</label><span><b id="sk-k"></b> of ${ALL.length} selected</span></div>
      ${rem.length > 1 || rest.length ? `<p class="sk-sub">Consents they removed</p>` : ''}${rem.map(grp).join('')}
      ${rest.length ? `<p class="sk-sub">More documents you can ask for</p>${rest.map(grp).join('')}` : ''}
      <section class="sa-card"><label class="sa-f"><span>A note for them <i>(optional)</i></span><textarea class="sa-in" name="note" rows="3" placeholder="Why you&rsquo;re asking again, or what it&rsquo;s for">${esc(note)}</textarea></label></section>`;
    marks();
  };
  // the group and Select all boxes: ticked, empty, or in between
  const marks = () => {
    GROUPS.forEach((g) => { const b = body.querySelector(`[data-grp="${CSS.escape(g.key)}"]`), n = k(g); b.checked = n === g.docs.length; b.indeterminate = n > 0 && n < g.docs.length; body.querySelector(`[data-grp-n="${CSS.escape(g.key)}"]`).textContent = `${n} of ${g.docs.length}`; });
    body.querySelectorAll('[data-doc]').forEach((b) => { b.checked = picked.has(b.dataset.doc); });
    const n = picked.size, all = body.querySelector('[data-all]');
    all.checked = n === ALL.length; all.indeterminate = n > 0 && n < ALL.length;
    body.querySelector('#sk-k').textContent = n;
    dw.querySelector('#sk-n').innerHTML = n ? `<b>${n}</b> document${n === 1 ? '' : 's'} to ask for` : 'Tick at least one document';
    dw.querySelector('[data-sk-send]').disabled = !n;
  };

  const open = (cid) => {
    const g = GROUPS.find((x) => x.key === cid) || GROUPS[0];
    picked = new Set(g.docs.map((d) => d.code)); note = ''; first = g.key; // the one you clicked, on top back = document.activeElement;
    dw.hidden = false; document.documentElement.style.overflow = 'hidden'; paint(); body.scrollTop = 0;
    setTimeout(() => dw.classList.add('is-open'), 20);
    setTimeout(() => { const b = body.querySelector(`[data-grp="${CSS.escape(g.key)}"]`); (b || dw.querySelector('.docd-panel')).focus({ preventScroll: true }); }, 340);
  };
  const close = () => {
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { dw.hidden = true; }, 280); if (back && back.isConnected) back.focus(); picked = null;
  };
  const send = () => {
    const at = P.today(), to = sup.email ? `To ${esc(sup.email)}` : `To ${esc(sup.name)}`;
    // each removed consent with something ticked is asked again for; the rest goes as one new request
    const again = GROUPS.filter((g) => g.removed && k(g)), extra = GROUPS.filter((g) => !g.removed).flatMap((g) => g.docs.filter((d) => picked.has(d.code)));
    again.forEach((g) => {
      asked.add(g.key); if (P.nudge) P.nudge(g.key);
      const b = document.querySelector(`[data-remind="${CSS.escape(g.key)}"]`);
      if (b) b.replaceWith(Object.assign(document.createElement('span'), { className: 'sp-sent', textContent: 'Request sent', title: 'You can ask again tomorrow.' }));
      const n = k(g);
      P.addLog({ at, tone: 'neu', what: `You asked again for ${esc(g.title)}`, sub: `${n === g.docs.length ? 'All' : `${n} of`} ${g.docs.length} document${g.docs.length === 1 ? '' : 's'} · ${to}` });
    });
    if (extra.length) P.addLog({ at, tone: 'neu', what: `You asked for ${extra.length} more document${extra.length === 1 ? '' : 's'}`, sub: `${extra.slice(0, 3).map((d) => esc(d.name)).join(', ')}${extra.length > 3 ? ` and ${extra.length - 3} more` : ''} · ${to}` });
    const n = picked.size;
    close();
    A.toast(`Asked ${sup.name} for ${n} document${n === 1 ? '' : 's'}. You can ask again tomorrow.`);
  };

  // Ask again opens the drawer (instead of sending straight away, js/suppliers-page.js)
  document.addEventListener('click', (e) => {
    const r = e.target.closest('[data-remind][data-sent]');
    if (!r || !GROUPS.some((g) => g.key === r.dataset.remind)) return;
    e.preventDefault(); e.stopPropagation(); open(r.dataset.remind);
  }, true);
  dw.addEventListener('click', (e) => {
    if (!picked) return;
    if (e.target.closest('[data-sk-x]')) { close(); return; }
    if (e.target.closest('[data-sk-send]')) send();
  });
  dw.addEventListener('change', (e) => {
    if (!picked) return;
    const t = e.target, on = t.checked;
    if (t.matches('[data-doc]')) picked[on ? 'add' : 'delete'](t.dataset.doc);
    else if (t.matches('[data-grp]')) GROUPS.find((g) => g.key === t.dataset.grp).docs.forEach((d) => picked[on ? 'add' : 'delete'](d.code));
    else if (t.matches('[data-all]')) ALL.forEach((c) => picked[on ? 'add' : 'delete'](c));
    else return;
    marks();
  });
  dw.addEventListener('input', (e) => { if (e.target.name === 'note') note = e.target.value; });
  dw.addEventListener('keydown', (e) => { if (picked && e.key === 'Escape') close(); });
  window.CMSupplierAsk = { open, close };
})();
