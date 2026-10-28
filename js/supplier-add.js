/* Add a supplier (My suppliers, suppliers.html): a drawer in three steps.
   1. Who they are: their country and company code (NIPC in Portugal, the local equivalent
      elsewhere). If a company with that code is on C-MORE, it's invited to your supplier list; if
      not, it's invited to join C-MORE (a name and a contact email), and your list with it.
   2. What you need from them: the company documents, mandatory and optional (js/company-docs.js),
      for their country, each with a checkbox; mandatory ones ticked to start, select all overall
      or by section.
   3. Review and send. The supplier then shows on My suppliers as Invited (js/suppliers.js keeps it
      for the tab). Opens from [data-sup-add], or on arrival with ?add. */
(() => {
  const S = window.CM_SUPPLIERS, D = window.CM_COMPANY_DOCS;
  if (!S || !D || !document.getElementById('sup-body')) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ini = (n) => n.split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map((w) => w[0]).join('') || '?';
  const BEATRIZ = document.documentElement.dataset.persona === 'beatriz';

  // each country's company code: what it's called, an example, and when it looks right
  const digits = (n) => (v) => new RegExp(`^\\d{${n}}$`).test(v);
  const nipcOk = (v) => /^[1-9]\d{8}$/.test(v) && (() => { const s = [...v.slice(0, 8)].reduce((a, c, k) => a + c * (9 - k), 0) % 11; return +v[8] === (s < 2 ? 0 : 11 - s); })();
  const COUNTRIES = [
    ['PT', 'Portugal', 'NIPC', '509 812 334', nipcOk],
    ['ES', 'Spain', 'NIF', 'B12345678', (v) => /^[A-Z]\d{7}[A-Z0-9]$/.test(v)],
    ['FR', 'France', 'SIREN', '552 100 554', digits(9)],
    ['DE', 'Germany', 'USt-IdNr.', 'DE123456789', (v) => /^(DE)?\d{9}$/.test(v)],
    ['IT', 'Italy', 'Partita IVA', '01234567890', digits(11)],
    ['NL', 'Netherlands', 'KvK number', '12345678', digits(8)],
    ['BE', 'Belgium', 'Enterprise number', '0401.024.618', digits(10)],
    ['PL', 'Poland', 'NIP', '123-456-32-18', digits(10)],
    ['GB', 'United Kingdom', 'Company number', '01234567', (v) => /^[A-Z0-9]{8}$/.test(v)],
    ['US', 'United States', 'EIN', '12-3456789', digits(9)],
    ['BR', 'Brazil', 'CNPJ', '12.345.678/0001-90', digits(14)],
  ].map(([code, name, label, eg, ok]) => ({ code, name, label, eg, ok }));
  const country = (c) => COUNTRIES.find((x) => x.code === c) || COUNTRIES[0];
  const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = () => { const t = new Date(); return `${t.getDate()} ${M[t.getMonth()]} ${t.getFullYear()}`; };
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  const css = `
.sa .docd-body { gap: 1rem; }
.sa .docd-body > * { flex: none; } /* each card its full height; the body scrolls */
.sa-card { display: grid; gap: 1rem; padding: 1.25rem; border-radius: 0.75rem; background: var(--color-surface); }
.sa-card > h4 { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-subtle); }
.sa-card > p { font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-muted); }
.sa-f { display: grid; align-content: start; gap: 0.375rem; } /* side by side, the label and field stay at the top whatever sits under the other */
.sa-f > span { font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.sa-f > span i { font-style: normal; font-weight: 400; color: var(--color-ink-subtle); }
.sa-f small { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sa-f small.is-err { color: var(--color-critical, #b3261e); }
.sa-in { width: 100%; height: 2.75rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
select.sa-in { appearance: none; padding-right: 2.25rem; background: var(--color-surface) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23343434'%3E%3Cpath d='M5.2 7.7a.75.75 0 0 1 1.06.04L10 11.6l3.74-3.86a.75.75 0 1 1 1.08 1.04l-4.28 4.42a.75.75 0 0 1-1.08 0L5.16 8.78a.75.75 0 0 1 .04-1.06Z'/%3E%3C/svg%3E") no-repeat right 0.75rem center / 1rem; }
textarea.sa-in { height: auto; padding: 0.625rem 0.875rem; resize: vertical; }
.sa-in:focus { outline: none; border-color: var(--color-graphite); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-graphite) 12%, transparent); }
.sa-in.is-err { border-color: var(--color-critical, #b3261e); }
.sa-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr); gap: 0.875rem; }
.sa-who { display: flex; align-items: center; gap: 0.875rem; }
.sa-who .sp-logo { width: 2.75rem; height: 2.75rem; }
.sa-who b { display: block; font-size: 1rem; font-weight: 600; }
.sa-who small { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sa-who .co-badge { margin-left: auto; flex: none; }
.sa-res { display: grid; gap: 0.875rem; padding: 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; }
.sa-res.is-new { border-style: dashed; background: var(--color-light-beige); }
.sa-res > p { font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-muted); }
.sa-res > p b { color: var(--color-ink); font-weight: 600; }
.sa-all { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.875rem 1.25rem; border-radius: 0.75rem; background: var(--color-surface); font-size: 0.875rem; color: var(--color-ink-muted); }
.sa-all b { color: var(--color-ink); }
.sa-ck { display: inline-flex; align-items: center; gap: 0.625rem; cursor: pointer; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.sa-ck input, .sa-docs input { width: 1.125rem; height: 1.125rem; margin: 0; accent-color: var(--color-graphite); cursor: pointer; flex: none; }
.sa-grp { border-radius: 0.75rem; background: var(--color-surface); overflow: hidden; }
.sa-grp-h { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1.25rem; background: var(--color-light-beige); }
.sa-grp-h .sa-ck { font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; }
.sa-grp-h span { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sa-docs { list-style: none; margin: 0; padding: 0; }
.sa-docs li + li { border-top: 1px solid var(--color-mid-beige); }
.sa-docs label { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 0.75rem; padding: 0.6875rem 1.25rem; cursor: pointer; }
.sa-docs label:hover { background: var(--color-off-white); }
.sa-docs b { display: block; font-size: 0.875rem; font-weight: 500; color: var(--color-ink); }
.sa-docs small { display: block; font-size: 0.75rem; color: var(--color-ink-subtle); }
.sa-sum { display: grid; gap: 0; margin: 0; }
.sa-sum > div { display: grid; grid-template-columns: 9rem minmax(0, 1fr); gap: 1rem; padding: 0.625rem 0; border-top: 1px solid var(--color-mid-beige); font-size: 0.875rem; }
.sa-sum > div:first-child { border-top: 0; padding-top: 0; }
.sa-sum dt { color: var(--color-ink-subtle); }
.sa-sum dd { margin: 0; color: var(--color-ink); }
.sa-sum dd small { display: block; margin-top: 0.125rem; color: var(--color-ink-subtle); }
.sa .docd-foot .sa-acts { display: flex; align-items: center; gap: 1rem; }
.sa .btn:disabled { background: var(--color-mid-beige); border-color: transparent; color: var(--color-sand-500); box-shadow: none; cursor: not-allowed; transform: none; }
.sa-toast { position: fixed; left: 50%; bottom: 1.5rem; z-index: 120; transform: translateX(-50%); padding: 0.75rem 1.125rem; border-radius: 0.75rem; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.875rem; box-shadow: 0 12px 32px -16px rgba(0,0,0,.5); }
@media (max-width: 40rem) { .sa-two { grid-template-columns: 1fr; } .sa-sum > div { grid-template-columns: 1fr; gap: 0.125rem; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/></svg>';
  const dw = document.createElement('div');
  dw.className = 'docd sa'; dw.hidden = true;
  dw.innerHTML = `<div class="docd-scrim" data-sa-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="sa-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${ICO}</span><div class="docd-t"><h3 id="sa-t">Add a supplier</h3><p id="sa-sub"></p></div>
        <button type="button" class="dlg-x" data-sa-x aria-label="Close">${X}</button></header>
      <form class="docd-body" id="sa-body" novalidate></form>
      <footer class="docd-foot"><span id="sa-step"></span><span class="sa-acts" id="sa-acts"></span></footer>
    </aside>`;
  document.body.appendChild(dw);
  const $ = (id) => dw.querySelector('#' + id);

  // the flow's state
  let f = null, back = null;
  const fresh = () => ({ step: 1, country: BEATRIZ ? 'US' : 'PT', code: '', err: '', found: null, name: '', email: '', contact: '', errs: {}, picked: null, note: '' });
  const docsFor = () => {
    const req = D.mandatory(f.country).map((d) => ({ code: d.code, name: d.name.en, section: 'Mandatory', home: d.section.en, req: true }));
    const opt = D.optional(f.country).filter((d) => !req.some((r) => r.code === d.code)).map((d) => ({ code: d.code, name: d.name.en, section: d.section.en, req: false }));
    return req.concat(opt);
  };
  const groups = (docs) => docs.reduce((g, d) => { (g[d.section] = g[d.section] || []).push(d); return g; }, {});
  const who = () => (f.found && f.found.on ? f.found.on.name : f.name.trim());

  // ---- step 1: their country and code; then who that is -------------------------------------------
  const step1 = () => {
    const c = country(f.country), r = f.found;
    let res = '';
    if (r && r.mine) res = `<div class="sa-res"><div class="sa-who"><span class="sp-logo" aria-hidden="true">${esc(ini(r.mine.name))}</span><div><b>${esc(r.mine.name)}</b><small>${esc([r.mine.services[0], r.mine.city].filter(Boolean).join(' · '))}</small></div><span class="co-badge b-ok">Already your supplier</span></div>
        <p>They&rsquo;re already on your supplier list. <a href="suppliers.html?id=${esc(r.mine.id)}">Open ${esc(r.mine.name)}</a> to see what they share, or ask them for more from there.</p></div>`;
    else if (r && r.on) res = `<div class="sa-res"><div class="sa-who"><span class="sp-logo" aria-hidden="true">${esc(ini(r.on.name))}</span><div><b>${esc(r.on.name)}</b><small>${esc([r.on.services.join(', '), r.on.city].join(' · '))}</small></div><span class="co-badge b-info">On C&#8209;MORE</span></div>
        <p><b>They&rsquo;re on C&#8209;MORE.</b> We&rsquo;ll invite them to your supplier list. Once they accept, they share the documents you ask for next.</p></div>`;
    else if (r) res = `<div class="sa-res is-new"><p><b>No company with this ${esc(c.label)} is on C&#8209;MORE yet.</b> We&rsquo;ll invite them to join C&#8209;MORE, and your supplier list with it. Who should we send it to?</p>
        <label class="sa-f"><span>Company name</span><input class="sa-in${f.errs.name ? ' is-err' : ''}" name="name" value="${esc(f.name)}" autocomplete="organization">${f.errs.name ? `<small class="is-err">${f.errs.name}</small>` : ''}</label>
        <div class="sa-two"><label class="sa-f"><span>Contact name <i>(optional)</i></span><input class="sa-in" name="contact" value="${esc(f.contact)}" autocomplete="name"></label>
        <label class="sa-f"><span>Contact email</span><input class="sa-in${f.errs.email ? ' is-err' : ''}" name="email" type="email" value="${esc(f.email)}" autocomplete="email">${f.errs.email ? `<small class="is-err">${f.errs.email}</small>` : ''}</label></div></div>`;
    const demo = S.ON_CMORE.filter((x) => x.country === f.country)[0];
    return `<section class="sa-card"><h4>Who they are</h4><p>Their country and their company code. If they&rsquo;re on C&#8209;MORE, we&rsquo;ll find them.</p>
        <div class="sa-two"><label class="sa-f"><span>Country</span><select class="sa-in" name="country">${COUNTRIES.map((x) => `<option value="${x.code}"${x.code === f.country ? ' selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label>
        <label class="sa-f"><span>${esc(c.label)}</span><input class="sa-in${f.err ? ' is-err' : ''}" name="code" value="${esc(f.code)}" placeholder="e.g. ${esc(c.eg)}" autocomplete="off" spellcheck="false" inputmode="${/^\d/.test(c.eg) ? 'numeric' : 'text'}">
          ${f.err ? `<small class="is-err">${f.err}</small>` : demo ? `<small>Prototype: ${esc(f.country === 'PT' ? demo.code.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') : demo.code)} is on C&#8209;MORE.</small>` : ''}</label></div>
        ${res}</section>`;
  };
  const find = () => {
    const c = country(f.country), v = norm(f.code);
    if (!v) { f.err = `Enter their ${c.label}.`; return false; }
    const r = S.lookup(f.country, v);
    if (r.mine) { f.err = ''; f.found = r; return true; } // already yours: said so, whatever its format
    if (!c.ok(v)) { f.err = `That doesn&rsquo;t look like a ${esc(c.label)} from ${esc(c.name)}. For example, ${esc(c.eg)}.`; return false; }
    f.err = ''; f.found = S.lookup(f.country, v); return true;
  };

  // ---- step 2: the documents they're asked for ----------------------------------------------------
  const step2 = () => {
    const docs = docsFor(), g = groups(docs), n = docs.filter((d) => f.picked.has(d.code)).length;
    return `<section class="sa-card"><h4>What you need from ${esc(who())}</h4><p>The documents they&rsquo;ll be asked to share with you. The mandatory ones are ticked; add any of the optional ones you need.</p></section>
      <div class="sa-all"><label class="sa-ck"><input type="checkbox" data-all${n === docs.length ? ' checked' : ''}>Select all</label><span><b id="sa-n">${n}</b> of ${docs.length} selected</span></div>
      ${Object.entries(g).map(([sec, list]) => { const k = list.filter((d) => f.picked.has(d.code)).length; return `<section class="sa-grp"><div class="sa-grp-h"><label class="sa-ck"><input type="checkbox" data-sec="${esc(sec)}"${k === list.length ? ' checked' : ''}>${esc(sec)}</label><span>${k} of ${list.length}</span></div>
        <ul class="sa-docs">${list.map((d) => `<li><label><input type="checkbox" data-doc="${esc(d.code)}"${f.picked.has(d.code) ? ' checked' : ''}><span><b>${esc(d.name)}</b><small>${esc(d.code)}${d.req ? ' &middot; Mandatory' : ' &middot; Optional'}</small></span></label></li>`).join('')}</ul></section>`; }).join('')}`;
  };
  // the section and Select all boxes: ticked, empty, or in between
  const marks = () => {
    const docs = docsFor(), g = groups(docs);
    dw.querySelectorAll('[data-sec]').forEach((b) => { const l = g[b.dataset.sec], k = l.filter((d) => f.picked.has(d.code)).length; b.checked = k === l.length; b.indeterminate = k > 0 && k < l.length; b.closest('.sa-grp-h').querySelector('span').textContent = `${k} of ${l.length}`; });
    const all = dw.querySelector('[data-all]'), n = docs.filter((d) => f.picked.has(d.code)).length;
    if (all) { all.checked = n === docs.length; all.indeterminate = n > 0 && n < docs.length; }
    if ($('sa-n')) $('sa-n').textContent = n;
    acts();
  };

  // ---- step 3: what's being sent, and to whom -----------------------------------------------------
  const step3 = () => {
    const c = country(f.country), docs = docsFor().filter((d) => f.picked.has(d.code)), req = docs.filter((d) => d.req).length;
    const on = f.found && f.found.on;
    return `<section class="sa-card"><h4>Review and send</h4><dl class="sa-sum">
        <div><dt>Supplier</dt><dd>${esc(who())}<small>${esc(c.name)} &middot; ${esc(c.label)} ${esc(f.code.trim())}</small></dd></div>
        <div><dt>Invitation</dt><dd>${on ? 'To your supplier list<small>They&rsquo;re on C&#8209;MORE: their team gets it there.</small>' : `To join C&#8209;MORE, and your supplier list<small>Sent to ${esc(f.contact.trim() ? `${f.contact.trim()}, ` : '')}${esc(f.email.trim())}</small>`}</dd></div>
        <div><dt>Documents</dt><dd>${docs.length} asked for<small>${req} mandatory, ${docs.length - req} optional: ${docs.map((d) => esc(d.name)).join(', ')}</small></dd></div>
      </dl></section>
      <section class="sa-card"><label class="sa-f"><span>A note for them <i>(optional)</i></span><textarea class="sa-in" name="note" rows="3" placeholder="Why you&rsquo;re asking, or what it&rsquo;s for">${esc(f.note)}</textarea></label></section>`;
  };

  const STEPS = ['Who they are', 'Documents', 'Review'];
  const acts = () => {
    const backB = f.step > 1 ? '<button type="button" class="link-btn" data-sa-back>Back</button>' : '';
    const main = f.step === 1 ? (f.found && !f.found.mine ? '<button type="button" class="btn btn-primary btn-sm" data-sa-next>Continue</button>' : '<button type="button" class="btn btn-primary btn-sm" data-sa-find>Find them</button>')
      : f.step === 2 ? `<button type="button" class="btn btn-primary btn-sm" data-sa-next${f.picked.size ? '' : ' disabled'}>Continue</button>`
      : '<button type="button" class="btn btn-primary btn-sm" data-sa-send>Send invitation</button>';
    $('sa-acts').innerHTML = backB + main;
    $('sa-step').textContent = `Step ${f.step} of 3 · ${STEPS[f.step - 1]}`;
  };
  const paint = (focus) => {
    $('sa-sub').textContent = f.step === 1 ? 'Invite them to your supplier list, or to C‑MORE' : who();
    $('sa-body').innerHTML = f.step === 1 ? step1() : f.step === 2 ? step2() : step3();
    if (f.step === 2) marks(); else acts();
    $('sa-body').scrollTop = 0;
    if (focus) { const el = dw.querySelector(focus); if (el) el.focus(); }
  };

  const open = () => {
    f = fresh(); back = document.activeElement;
    dw.hidden = false; document.documentElement.style.overflow = 'hidden'; paint();
    setTimeout(() => dw.classList.add('is-open'), 20);
    setTimeout(() => { const c = dw.querySelector('[name="code"]'); if (c) c.focus(); }, 340);
  };
  const close = () => {
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { dw.hidden = true; }, 280); if (back && back.isConnected) back.focus(); f = null;
  };
  const toast = (msg) => {
    const t = Object.assign(document.createElement('div'), { className: 'sa-toast', textContent: msg });
    t.setAttribute('role', 'status'); document.body.appendChild(t); setTimeout(() => t.remove(), 3600);
  };
  const send = () => {
    const c = country(f.country), docs = docsFor().filter((d) => f.picked.has(d.code)), on = f.found.on;
    const name = who();
    S.addInvite({
      id: `${S.slug(name)}-${Date.now().toString(36).slice(-4)}`, name, city: on ? on.city : '', services: on ? on.services : [],
      country: c.code, countryName: c.name, idLabel: c.label, code: f.code.trim(), email: on ? '' : f.email.trim(), contact: f.contact.trim(),
      onCmore: !!on, invited: today(), note: f.note.trim(),
      docs: docs.map((d) => d.code), required: docs.filter((d) => d.req).map((d) => d.code),
      names: Object.fromEntries(docs.map((d) => [d.code, d.name])), sections: Object.fromEntries(docs.map((d) => [d.code, d.home || d.section])),
    });
    close();
    if (window.CMSupPage) window.CMSupPage.refresh();
    toast(on ? `${name} is invited to your supplier list.` : `${name} is invited to join C‑MORE.`);
  };

  dw.addEventListener('click', (e) => {
    if (!f) return;
    if (e.target.closest('[data-sa-x]')) { close(); return; }
    if (e.target.closest('[data-sa-back]')) { f.step -= 1; paint(); return; }
    if (e.target.closest('[data-sa-find]')) { if (!find()) { paint('[name="code"]'); return; } paint(f.found.on || f.found.mine ? '[data-sa-next], [data-sa-find]' : '[name="name"]'); return; }
    if (e.target.closest('[data-sa-next]')) {
      if (f.step === 1) {
        if (!f.found.on) {
          f.errs = { name: f.name.trim() ? '' : 'Enter their company name.', email: emailOk(f.email.trim()) ? '' : f.email.trim() ? 'That doesn&rsquo;t look like an email address.' : 'Enter an email we can send the invitation to.' };
          if (f.errs.name || f.errs.email) { paint(f.errs.name ? '[name="name"]' : '[name="email"]'); return; }
        }
        if (!f.picked) f.picked = new Set(docsFor().filter((d) => d.req).map((d) => d.code));
      }
      f.step += 1; paint(); return;
    }
    if (e.target.closest('[data-sa-send]')) send();
  });
  dw.addEventListener('change', (e) => {
    if (!f) return;
    const t = e.target;
    if (t.name === 'country') { f.country = t.value; f.found = null; f.err = ''; f.picked = null; paint('[name="code"]'); return; }
    if (t.matches('[data-doc]')) { f.picked[t.checked ? 'add' : 'delete'](t.dataset.doc); marks(); return; }
    if (t.matches('[data-sec]')) { groups(docsFor())[t.dataset.sec].forEach((d) => f.picked[t.checked ? 'add' : 'delete'](d.code)); dw.querySelectorAll(`[data-doc]`).forEach((b) => { b.checked = f.picked.has(b.dataset.doc); }); marks(); return; }
    if (t.matches('[data-all]')) { docsFor().forEach((d) => f.picked[t.checked ? 'add' : 'delete'](d.code)); dw.querySelectorAll('[data-doc]').forEach((b) => { b.checked = t.checked; }); marks(); }
  });
  dw.addEventListener('input', (e) => {
    if (!f) return;
    const t = e.target;
    // a new code is a new search: what was found for the old one goes
    if (t.name === 'code') { f.code = t.value; if (f.found || f.err) { f.found = null; f.err = ''; const at = t.selectionStart; paint(); const i = dw.querySelector('[name="code"]'); i.focus(); i.setSelectionRange(at, at); } return; }
    if (['name', 'email', 'contact', 'note'].includes(t.name)) { f[t.name] = t.value; if (f.errs[t.name]) { f.errs[t.name] = ''; t.classList.remove('is-err'); const s = t.parentNode.querySelector('.is-err:not(input)'); if (s) s.remove(); } }
  });
  // Enter in the code field finds them
  dw.addEventListener('keydown', (e) => {
    if (!f) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Enter' && e.target.name === 'code') { e.preventDefault(); const b = dw.querySelector('[data-sa-find], [data-sa-next]'); if (b) b.click(); }
  });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-sup-add]')) { e.preventDefault(); open(); } });
  window.CMSupplierAdd = { open };
  if (new URLSearchParams(location.search).has('add')) { history.replaceState(null, '', location.pathname); setTimeout(open, 150); }
})();
