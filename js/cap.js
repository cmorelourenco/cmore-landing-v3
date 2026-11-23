/* Corrective action plans, for the hidden test users only: Rian at Walmart (rian@walmart.com) and AJ Lee
   at Carolina Knits, one of Walmart's suppliers.
   - Walmart sets one plan for every supplier (new-cap.html, js/cap-new.js): the documents each supplier
     must have, and how many days it has to provide each. Kept for the tab, and in this browser so a new
     tab sees it too ('cm-cap-walmart').
   - AJ Lee's company is one of those suppliers: what the plan asks for that it hasn't got (missing,
     expired, about to expire) shows as an alert: on its company page, in a line (how many, the first
     due date) with Upload missing documents, which opens ALMA's upload here with just those; on
     Documents, each one, opening it; and in the bell, once, opening Documents.
   - Rian's account menu switches to AJ Lee, and AJ's back to Rian.
   - Logging out as either forgets both: the plan, and everything either did (uploads, answers, invites),
     so the next login starts the plan from the beginning.
   window.CM_CAP: load(), save(plan), clear(), dueOf(item, plan), due() (AJ's, from js/doc-model.js). */
window.CM_CAP = (() => {
  const persona = document.documentElement.dataset.persona;
  const KEY = 'cm-cap-walmart';
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (d) => `${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;
  const parse = (s) => { const m = /^(\d{1,2}) (\w{3}) (\d{4})$/.exec(String(s || '')); return m ? new Date(+m[3], MON.indexOf(m[2]), +m[1]) : null; };
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const load = () => { for (const st of [sessionStorage, localStorage]) { try { const v = JSON.parse(st.getItem(KEY) || 'null'); if (v && v.docs) return v; } catch (e) {} } return null; };
  const save = (plan) => { const v = JSON.stringify(plan); try { sessionStorage.setItem(KEY, v); localStorage.setItem(KEY, v); } catch (e) {} };
  const clear = () => { try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {} };
  // the day a document is due: the plan's day, plus the days it gives for it
  const dueOf = (item, plan) => { const on = parse(plan.on) || new Date(); return new Date(on.getFullYear(), on.getMonth(), on.getDate() + (+item.days || 30)); };
  const today = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };

  // ---- AJ Lee: what Walmart's plan asks for that Carolina Knits hasn't got -------------------------
  // from its documents (js/doc-model.js), where the page has them; elsewhere, what they were last time
  const DUE_KEY = 'cm-cap-due-ajlee';
  const NEED = { missing: 'Missing', notuploaded: 'Missing', expired: 'Expired', rejected: 'Rejected', expiring: 'Expiring' };
  const due = () => {
    const plan = load(); if (!plan || persona !== 'ajlee') return [];
    const M = window.DOC_MODEL;
    if (!M || !M.DOCS) { try { return JSON.parse(sessionStorage.getItem(DUE_KEY) || '[]') || []; } catch (e) { return []; } }
    const out = plan.docs.map((it) => {
      const d = M.DOCS.find((x) => x.code === it.code && x.status !== 'archived'), cat = (window.DOC_CATALOG.docs || []).find((x) => x.code === it.code);
      const status = d ? d.status : 'missing';
      if (!NEED[status]) return null;
      return { code: it.code, name: (d && d.name) || (cat && cat.name.en) || it.code, status, valid: d && d.valid !== '—' ? d.valid : '', due: fmt(dueOf(it, plan)), sections: (it.sections || []).map(short) };
    }).filter(Boolean).sort((a, b) => parse(a.due) - parse(b.due));
    try { sessionStorage.setItem(DUE_KEY, JSON.stringify(out)); } catch (e) {}
    return out;
  };
  const short = (n) => String(n).replace(/\s*\([^)]*\)/g, '').trim();
  const href = (x) => `company-details.html?open=${encodeURIComponent(x.code)}`;
  const what = (x) => (x.status === 'expiring' ? `Expires ${esc(x.valid)}` : NEED[x.status]);
  const when = (x) => { const d = parse(x.due); return d < today() ? `<b class="cap-late">Overdue since ${esc(x.due)}</b>` : `Due by ${esc(x.due)}`; };

  const css = `
.cap-alert { display: flex; flex-direction: column; gap: 0.875rem; padding: 1.125rem 1.25rem; border: 1px solid var(--color-coral-soft, #f4a08c); border-radius: 0.875rem; background: var(--color-coral-tint, #f9e7e3); color: var(--color-ink); }
.cap-alert-h { display: flex; align-items: flex-start; gap: 0.75rem; }
.cap-alert-h svg { flex: none; width: 1.375rem; height: 1.375rem; margin-top: 0.0625rem; color: var(--color-coral-deep, #f44e29); }
.cap-alert-h b { display: block; font-size: 1rem; font-weight: 600; }
.cap-alert-h > div > span { display: block; margin-top: 0.125rem; font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-muted); }
.cap-list { display: flex; flex-direction: column; margin: 0; padding: 0; list-style: none; border-radius: 0.625rem; overflow: hidden; background: var(--color-surface); }
.cap-list li + li { border-top: 1px solid var(--color-mid-beige); }
.cap-list a { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; align-items: center; gap: 0.25rem 1.25rem; padding: 0.75rem 1rem; color: inherit; text-decoration: none; }
.cap-list a:hover { background: var(--color-off-white); }
.cap-list a:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: -2px; }
.cap-list .n { font-size: 0.9375rem; font-weight: 600; }
.cap-secs-l { display: block; margin-top: 0.125rem; font-size: 0.8125rem; font-weight: 400; color: var(--color-ink-subtle); }
.cap-list .w { font-size: 0.8125rem; color: var(--color-ink-subtle); white-space: nowrap; }
.cap-list .go { font-size: 0.875rem; font-weight: 600; white-space: nowrap; }
.cap-late { font-weight: 600; color: var(--color-critical); }
.cap-home[hidden] { display: none; }
.cap-sum .cap-alert-h > div { flex: 1; min-width: 0; }
/* Walmart, to its page in My clients */
.cap-who { color: inherit; text-decoration: underline; text-decoration-color: var(--color-coral); text-underline-offset: 0.2em; }
.cap-who:hover { text-decoration-thickness: 2px; }
.cap-sum-r { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem 1.25rem; flex: none; align-self: center; }
.cap-sum-r .link-btn { font-size: 0.875rem; }
/* dark, as Add a supplier: the design system's coral button disappears on the card's coral tint */
.cap-sum-r .btn-primary { background: var(--color-graphite); border-color: var(--color-graphite); color: var(--color-off-white); }
.cap-sum-r .btn-primary:hover { background: var(--color-ink); border-color: var(--color-ink); }
@media (max-width: 48rem) { .cap-sum .cap-alert-h { flex-wrap: wrap; } .cap-sum-r { width: 100%; padding-left: 2.125rem; } }
.cap-docs { margin: -0.5rem 0 2rem; }
@media (max-width: 40rem) { .cap-list a { grid-template-columns: minmax(0, 1fr) auto; } .cap-list .w { grid-column: 1; grid-row: 2; white-space: normal; } .cap-list .go { grid-row: 1 / span 2; } }
/* the account menu: switching between the two test users */
.who-menu .cap-sw small { display: block; font-size: 0.75rem; color: var(--color-ink-subtle); }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/></svg>';
  const card = (list, cls) => `<section class="cap-alert ${cls}" role="region" aria-label="Walmart&rsquo;s corrective action plan">
      <div class="cap-alert-h">${WARN}<div><b><a class="cap-who" href="clients.html?id=walmart-inc">Walmart</a> needs ${list.length === 1 ? 'a document' : `${list.length} documents`} from you</b><span>Its corrective action plan asks every supplier for ${list.length === 1 ? 'it' : 'these'}. Upload ${list.length === 1 ? 'it' : 'each one'} by the date next to it, and Walmart sees ${list.length === 1 ? 'it' : 'them'} as soon as ALMA has filed ${list.length === 1 ? 'it' : 'them'}.</span></div></div>
      <ul class="cap-list">${list.map((x) => `<li><a href="${href(x)}"><span class="n">${esc(x.name)}${x.sections && x.sections.length ? `<small class="cap-secs-l">With ${esc(x.sections.join(', '))}</small>` : ''}</span><span class="w">${what(x)} &middot; ${when(x)}</span><span class="go">${x.status === 'expiring' || x.status === 'expired' ? 'Renew it' : 'Upload it'} &rarr;</span></a></li>`).join('')}</ul>
    </section>`;

  // the company page's: how many, and the first due, without naming them (there can be many); the
  // button opens ALMA's upload here, with just those documents (js/doc-upload.js 'codes:')
  const counts = (list) => { const n = (k) => list.filter((x) => k.includes(x.status)).length, out = [];
    const miss = n(['missing', 'notuploaded']), exp = n(['expired', 'rejected']), soon = n(['expiring']);
    if (miss) out.push(`${miss} missing`); if (exp) out.push(`${exp} expired`); if (soon) out.push(`${soon} expiring`);
    return out.length > 1 ? `${out.slice(0, -1).join(', ')} and ${out[out.length - 1]}` : out[0] || ''; };
  const firstDue = (list) => list[0] && list[0].due;
  const late = (list) => list.filter((x) => parse(x.due) < today()).length;
  const summary = (list) => `<section class="cap-alert cap-sum" role="region" aria-label="Walmart&rsquo;s corrective action plan">
      <div class="cap-alert-h">${WARN}<div><b><a class="cap-who" href="clients.html?id=walmart-inc">Walmart</a> needs ${list.length === 1 ? 'a document' : `${list.length} documents`} from you</b><span>${counts(list)}. ${late(list) ? `<b class="cap-late">${late(list)} overdue.</b> ` : ''}The first is due by ${esc(firstDue(list))}.</span></div>
      <span class="cap-sum-r"><a class="link-btn" href="company-details.html">See them in Documents</a><button type="button" class="btn btn-primary btn-sm" data-cap-up>Upload missing documents</button></span></div>
    </section>`;
  const upload = () => {
    const list = due(); if (!list.length || !window.CMUpload) { location.href = 'company-details.html'; return; }
    const ok = window.CMUpload.open('codes:' + list.map((x) => x.code).join(','), {
      title: 'Walmart&rsquo;s corrective action plan', lead: `${list.length === 1 ? 'The document' : `The ${list.length} documents`} Walmart asks you for. Drop them all at once: ALMA reads each one, checks which it is, and files it.`,
      onSaved: () => { draw(); if (window.HOME_DOCS && window.HOME_DOCS.render) window.HOME_DOCS.render(); } });
    if (!ok) location.href = 'company-details.html';
  };
  document.addEventListener('click', (e) => { if (e.target.closest('[data-cap-up]')) { e.preventDefault(); upload(); } });

  const draw = () => {
    if (persona !== 'ajlee') return;
    const list = due();
    // the company page: in Your compliance, under its title (above the Documents, Consents and suppliers cards)
    const kHead = document.getElementById('co-k-head'), filled = document.getElementById('filled');
    if (kHead && filled && filled.contains(kHead) && /my-company\.html$/.test(location.pathname)) {
      let w = document.getElementById('cap-home');
      if (!w) { w = document.createElement('div'); w.id = 'cap-home'; w.className = 'cap-home'; kHead.parentElement.after(w); }
      w.innerHTML = list.length ? summary(list) : ''; w.hidden = !list.length;
    }
    // Documents: under the page's title
    const sub = document.getElementById('cd-sub');
    if (sub && sub.closest('.co-sec-head')) {
      let w = document.getElementById('cap-docs');
      if (!w) { w = document.createElement('div'); w.id = 'cap-docs'; w.className = 'cap-docs'; sub.closest('.co-sec-head').after(w); }
      w.innerHTML = list.length ? card(list, '') : ''; w.hidden = !list.length;
    }
    // the bell: one for the plan, first in line, opening Documents (where each is listed)
    const nt = document.getElementById('nt'), box = nt && nt.querySelector('.nt-list.persona-ajlee-only');
    if (box) {
      box.querySelectorAll('[data-cap-note]').forEach((li) => li.remove());
      if (list.length) { const li = document.createElement('li'); li.setAttribute('data-cap-note', '');
        li.innerHTML = `<a href="company-details.html" class="nt-item is-unread"><span class="nt-mark nt-over" aria-hidden="true"></span><span class="nt-body"><b>Walmart needs ${list.length === 1 ? 'a document' : `${list.length} documents`} from you</b><span>${counts(list)}. The first is due by ${esc(firstDue(list))}.</span><small>Corrective action plan</small></span><span class="nt-dot" aria-label="Unread"></span></a>`;
        li.firstElementChild.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); location.href = 'company-details.html'; });
        box.prepend(li); }
      const n = [...document.querySelectorAll('#nt .nt-item.is-unread')].filter((i) => !i.closest('.nt-list[class*="persona-"]:not(.persona-ajlee-only)')).length;
      document.querySelectorAll('[data-sn-count]').forEach((c) => { c.textContent = n; c.hidden = !n; });
      const bell = document.getElementById('hdr-bell'); if (bell) bell.setAttribute('aria-label', n ? `Notifications, ${n} new` : 'Notifications');
    }
  };

  // ---- the account menu: Rian to AJ Lee, and back -------------------------------------------------
  const OTHER = { walmart: { name: 'AJ Lee', email: 'aj.lee@carolinaknits.com', sub: 'Carolina Knits &middot; supplier' }, ajlee: { name: 'Rian Walsh', email: 'rian@walmart.com', sub: 'Walmart' } }[persona];
  const menu = document.getElementById('who-menu'), sep = menu && menu.querySelector('.who-sep');
  if (OTHER && sep && !menu.querySelector('.cap-sw')) {
    const a = document.createElement('a'); a.setAttribute('role', 'menuitem'); a.tabIndex = -1; a.href = 'my-company.html?filled'; a.className = 'cap-sw';
    a.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/></svg><span>Switch to ${OTHER.name}<small>${OTHER.sub}</small></span>`;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const who = JSON.stringify({ name: OTHER.name, email: OTHER.email, via: 'Email' });
      try { sessionStorage.setItem('cm-person', who); sessionStorage.setItem('cm-org', '"home"'); sessionStorage.setItem('cm-company', 'filled'); sessionStorage.removeItem('cm-photo'); localStorage.setItem('cm-last-person', who); } catch (err) {}
      location.href = 'my-company.html?filled';
    });
    sep.before(a);
  }

  // ---- log out: both test users start over ------------------------------------------------------
  // (the account menu's Log out; the side menu's clicks it too). Only theirs: Miguel's and Beatriz's stay
  const MINE = /(^|-)(walmart|ajlee)(-|$)|^cm-cap-/;
  const forgetBoth = () => {
    [sessionStorage, localStorage].forEach((st) => { try { Object.keys(st).filter((k) => /^cm-/.test(k) && MINE.test(k)).forEach((k) => st.removeItem(k)); } catch (e) {} });
    // their company profiles, kept with everyone's
    try { const all = JSON.parse(sessionStorage.getItem('cm-co-profile-v2') || 'null'); if (all) { delete all.walmart; delete all.ajlee; sessionStorage.setItem('cm-co-profile-v2', JSON.stringify(all)); } } catch (e) {}
  };
  document.addEventListener('click', (e) => { if (OTHER && e.target.closest('#who-logout')) forgetBoth(); }, true);

  draw();
  // a document filed again (js/doc-upload.js) may settle one: draw again once the page has redrawn
  document.addEventListener('cm-doc-updated', draw);
  return { load, save, clear, dueOf, due, fmt, parse, draw };
})();
