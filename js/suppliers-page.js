/* My suppliers (suppliers.html): at a glance, a matrix of every supplier against what they can
   share (one dot each, as in Documents › Workers); then a card for each supplier, and — with ?id= — the supplier's own
   page: who they are, what they share with you, and a table for each consent they have given, with
   the documents it lets you see. A document opens in the drawer, as everywhere else: the supplier's
   file, its status, and what the catalog says about it. The data is js/suppliers.js. */
(() => {
  const S = window.CM_SUPPLIERS, box = document.getElementById('sup-body'), home = document.getElementById('co-sup-mx');
  if (!S || (!box && !home)) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ini = (n) => n.split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map((w) => w[0]).join('');
  const CHEV = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.92 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"/></svg>';
  const CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const css = `
.sp-tools { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem 1rem; margin-bottom: 1.25rem; }
.sp-search { flex: 1 1 18rem; max-width: 24rem; }
.sp-search .input { width: 100%; height: 2.5rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
.sp-search .input:focus { outline: none; border-color: var(--color-graphite); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-graphite) 12%, transparent); }
.sp-filt { display: inline-flex; gap: 0.125rem; padding: 0.1875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); }
.sp-filt button { padding: 0.375rem 0.875rem; border: 0; border-radius: 0.4375rem; background: none; font: inherit; font-size: 0.875rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.sp-filt button[aria-pressed="true"] { background: var(--color-graphite); color: var(--color-off-white); }
.sp-filt b { margin-left: 0.375rem; font-weight: 600; opacity: .7; }
.sp-glance { margin-bottom: 2rem; }
.sp-glance-h, .sp-cards-h { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; margin-bottom: 0.75rem; }
.sp-glance-h h2, .sp-cards-h { font-size: 1.125rem; font-weight: 600; }
.sp-glance-h span { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sp-mx-wrap { margin-top: 0; overflow-x: auto; }
.sp-tbl.sp-mx { min-width: 44rem; table-layout: auto; }
.sp-mx th, .sp-mx td { padding-inline: 0.875rem; }
.sp-mx th.c, .sp-mx td.c { text-align: center; white-space: normal; width: auto; }
.sp-mx th.c { font-size: 0.6875rem; line-height: 1.3; }
.sp-mx th.c, .sp-mx td.c { padding-inline: 0.375rem; min-width: 4.25rem; }
/* a column per kind of document can run wide: the supplier stays in view while it scrolls */
.sp-mx th:first-child, .sp-mx td:first-child { min-width: 13rem; position: sticky; left: 0; z-index: 1; background: var(--color-surface); }
.sp-mx th:first-child { background: var(--color-light-beige); }
.sp-mx .sp-row:hover td:first-child, .sp-mx .sp-row:focus-visible td:first-child { background: var(--color-light-beige); }
.sp-mx .sp-mx-o { text-align: right; white-space: nowrap; }
.co-sup-sec .sp-glance { margin-bottom: 0; }
.co-sup-sec .co-sup-add { grid-column: 1; justify-self: start; }
.co-sup-none { display: grid; gap: 0.25rem; padding: 1.25rem 1.5rem; }
.cd-dot.is-wait { background: transparent; border: 2px dashed var(--color-sand-400); box-sizing: border-box; }
.sp-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr)); gap: 1rem; }
.sp-card { display: grid; gap: 0.875rem; height: 100%; padding: 1.25rem; border: 1px solid var(--color-line); border-radius: 1rem; background: var(--color-surface); color: inherit; text-decoration: none; transition: border-color .15s, box-shadow .15s, transform .15s; }
.sp-card:hover { border-color: var(--color-sand-400); box-shadow: 0 8px 24px -16px rgba(52, 52, 52, .25); transform: translateY(-1px); }
.sp-id { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
.sp-logo { flex: none; width: 2.75rem; height: 2.75rem; display: grid; place-items: center; border-radius: 0.5rem; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.9375rem; font-weight: 600; letter-spacing: -0.01em; }
.sp-logo.is-lg { width: 4rem; height: 4rem; font-size: 1.25rem; border-radius: 0.75rem; }
.sp-id b { display: block; font-size: 1.0625rem; font-weight: 600; line-height: 1.25; }
.sp-id small { display: block; margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sp-meter { display: grid; gap: 0.375rem; }
.sp-meter-t { display: flex; justify-content: space-between; font-size: 0.8125rem; color: var(--color-ink-muted); }
.sp-meter-t b { color: var(--color-ink); font-weight: 600; }
.sp-meter i { display: block; height: 6px; border-radius: 3px; background: var(--color-mid-beige); overflow: hidden; }
.sp-meter i span { display: block; height: 100%; background: var(--color-ok, #a6d8a0); }
.sp-meter.is-warn i span { background: var(--color-coral); }
.sp-chips { display: flex; flex-wrap: wrap; gap: 0.375rem; }
.sp-foot { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding-top: 0.75rem; border-top: 1px solid var(--color-mid-beige); font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sp-foot svg { width: 1rem; height: 1rem; color: var(--color-ink); }
.sp-none { padding: 2.5rem 1.5rem; text-align: center; color: var(--color-ink-subtle); }
.sp-tools-r { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; }
/* the page's one action: solid graphite, as tall as the search and the filters (coral stays for ALMA's own calls) */
.sp-add { display: inline-flex; align-items: center; gap: 0.5rem; height: 2.5rem; padding: 0 1.125rem; border: 0; border-radius: 0.625rem; background: var(--color-graphite); color: var(--color-off-white); font: inherit; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background-color .15s, transform .15s; }
.sp-add:hover { background: var(--color-ink); transform: translateY(-1px); }
.sp-add:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.sp-add svg { width: 1rem; height: 1rem; }
.sp-add.is-quiet { border: 1px solid var(--color-line); background: var(--color-surface); color: var(--color-ink); }
.sp-add.is-quiet:hover { border-color: var(--color-graphite); background: var(--color-surface); }
.sp-card.is-invited { border-style: dashed; background: var(--color-light-beige); }
.sp-head { display: flex; align-items: center; gap: 1.25rem; }
.sp-head > div { flex: 1 1 auto; min-width: 0; }
@media (max-width: 34rem) { .sp-head { flex-direction: column; align-items: flex-start; } }
.sp-head h1 { font-size: clamp(2rem, 3vw, 2.5rem); line-height: 1.08; letter-spacing: -0.025em; font-weight: 600; }
.sp-head p { margin-top: 0.375rem; font-size: 0.9375rem; color: var(--color-ink-muted); }
.sp-head a { color: var(--color-ink); }
.sp-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 1.5rem; }
.sp-kpi { padding: 1.125rem 1.25rem; border: 1px solid var(--color-line); border-radius: 0.875rem; background: var(--color-surface); }
.sp-kpi span { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--color-ink-muted); }
.sp-kpi b { display: block; margin-top: 0.25rem; font-size: 2rem; font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; }
.sp-kpi small { display: block; margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sp-kpi.is-bad b { color: var(--color-critical, #b3261e); }
.sp-sec { margin-top: 2.25rem; }
.sp-sec > h2 { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.01em; }
.sp-sec > p { margin-top: 0.25rem; font-size: 0.9375rem; color: var(--color-ink-muted); }
.sp-consent { margin-top: 1rem; border: 1px solid var(--color-line); border-radius: 0.875rem; background: var(--color-surface); overflow: hidden; }
.sp-consent-h { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 1rem 1.25rem; border-bottom: 1px solid var(--color-line); }
.sp-consent-h h3 { font-size: 1.0625rem; font-weight: 600; }
.sp-consent-h p { margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sp-tbl .sp-ch td { padding: 1rem 1.25rem; border-top: 0; vertical-align: top; background: var(--color-surface); } /* the badge on the title's line */
.sp-ch h3 { font-size: 1.0625rem; font-weight: 600; line-height: 1.5rem; color: var(--color-ink); }
.sp-ch p { margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sp-ch-b { text-align: right; }
/* one line tall and centred on it, like the title beside it */
.sp-ch-b .co-badge { display: inline-flex; align-items: center; height: 1.5rem; margin: 0; vertical-align: top; white-space: nowrap; }
.sp-ch h3 { margin: 0; }
.sp-consent.is-pending { border-style: dashed; background: var(--color-light-beige); }
.sp-tbl { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.sp-tbl th { padding: 0.625rem 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); background: var(--color-light-beige); }
.sp-tbl td { padding: 0.75rem 1.25rem; border-top: 1px solid var(--color-mid-beige); vertical-align: middle; color: var(--color-ink-muted); } /* every cell on the row's centre line */
.sp-tbl tbody .co-badge { vertical-align: middle; }
.sp-tbl td:first-child { color: var(--color-ink); }
.sp-tbl td .n { display: block; font-weight: 500; color: var(--color-ink); }
.sp-tbl td .d { display: block; margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.sp-tbl .c { white-space: nowrap; text-align: right; }
.cdd .pd-facts { display: grid; margin: 0; }
.sp-row { cursor: pointer; transition: background-color .12s; }
.sp-row:hover, .sp-row:focus-visible { background: var(--color-light-beige); }
.sp-row:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: -2px; } /* the last column, to the right */
/* the same columns in every consent's table, so they line up from one card to the next */
.sp-tbl { table-layout: fixed; }
.sp-c-req { width: 13rem; } .sp-c-st { width: 8.5rem; } .sp-c-exp { width: 9.5rem; }
@media (max-width: 40rem) { .sp-tbl { table-layout: auto; } .sp-c-req { width: 0; } }
.sp-wait { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 0.875rem 1.25rem; font-size: 0.875rem; color: var(--color-ink-muted); }
.sp-wait svg { width: 1rem; height: 1rem; vertical-align: -0.1875rem; margin-right: 0.375rem; }
.sp-sent { font-size: 0.875rem; font-weight: 500; color: var(--color-positive); }
@media (max-width: 40rem) { .sp-kpis { grid-template-columns: 1fr; } .sp-tbl .hide-s { display: none; } .sp-tbl th, .sp-tbl td { padding-inline: 0.875rem; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const tag = (status) => { const [l, c] = S.STATUS[status] || [status, 'b-neu']; return `<span class="co-badge ${c}">${l}</span>`; };
  const id = new URLSearchParams(location.search).get('id');
  const sup = id && S.byId(id);
  const head = document.getElementById('sup-head'), crumb = document.getElementById('sup-crumb');

  // ---- the suppliers, as cards ---------------------------------------------------------------------
  let filt = 'all', q = '';
  const stTag = (s) => { const [l, c] = S.SUP_STATUS[s.status]; return `<span class="co-badge ${c}">${l}</span>`; };
  const card = (s) => {
    const k = S.stats(s), warn = k.bad > 0;
    const id = `<span class="sp-id"><span class="sp-logo" aria-hidden="true">${esc(ini(s.name))}</span><span><b>${esc(s.name)}</b><small>${esc([s.services.join(', '), s.city].filter(Boolean).join(' · '))}</small></span></span>`;
    // invited: nothing shared until they join; what you asked for, and who you asked
    if (s.status === 'invited') {
      const n = s.consents[0].docs.length;
      return `<li><a class="sp-card is-invited" href="suppliers.html?id=${esc(s.id)}">${id}
      <span class="sp-meter"><span class="sp-meter-t"><span>${s.invite.onCmore ? 'To your supplier list' : 'To join C&#8209;MORE'}</span><b>${n} asked for</b></span><i><span style="width:0"></span></i></span>
      <span class="sp-chips">${stTag(s)}</span>
      <span class="sp-foot"><span>Invited on ${esc(s.invite.invited)} &middot; ${esc(s.email || s.invite.countryName)}</span>${CHEV}</span>
    </a></li>`;
    }
    // where they stand first, then what needs chasing
    const chips = [stTag(s), k.bad ? `<span class="co-badge b-over">${k.bad} need${k.bad === 1 ? 's' : ''} attention</span>` : '', k.soon ? `<span class="co-badge b-pend">${k.soon} expiring or in review</span>` : ''].filter(Boolean).join(''); // all in order needs no chip of its own: Accepted says it
    return `<li><a class="sp-card" href="suppliers.html?id=${esc(s.id)}">${id}
      ${k.shared ? `<span class="sp-meter${warn ? ' is-warn' : ''}"><span class="sp-meter-t"><span>Documents in order</span><b>${k.ok} of ${k.shared}</b></span><i><span style="width:${k.pct}%"></span></i></span>` : '<span class="sp-meter"><span class="sp-meter-t"><span>No documents shared yet</span></span><i><span style="width:0"></span></i></span>'}
      <span class="sp-chips">${chips}</span>
      <span class="sp-foot"><span>${k.given} consent${k.given === 1 ? '' : 's'} given &middot; supplier since ${esc(s.since)}</span>${CHEV}</span>
    </a></li>`;
  };
  // at a glance: a row per supplier, a column per kind of document (as the invite groups them), the worst status in each
  // the long ones, shorter over their column (the full name on hover)
  const SHORT = { 'Identification and registration': 'Registration', 'Tax and social security': 'Tax &amp; social security', 'Health and safety': 'Health &amp; safety',
    'ESG and sustainability': 'ESG', 'Information security': 'Info security' };
  const catAt = (c) => (S.CATS.includes(c) ? S.CATS.indexOf(c) : S.CATS.length);
  const TONE = { valid: 'ok', expiring: 'pend', processing: 'pend', missing: 'bad', expired: 'bad' };
  const RANKS = { valid: 0, processing: 1, expiring: 1, missing: 2, expired: 2 };
  const overall = (k, s) => (s && s.status === 'invited' ? ['Invited', 'b-neu'] : k.bad ? ['Needs attention', 'b-over'] : k.soon ? ['Expiring or in review', 'b-pend'] : k.pending && !k.shared ? ['Pending consent', 'b-neu'] : ['All in order', 'b-ok']);
  // what needs chasing first: missing or expired, then expiring or in review, then waiting on a consent
  const urgent = (a, b) => { const x = S.stats(a), y = S.stats(b); return (b.status === 'invited') - (a.status === 'invited') || y.bad - x.bad || y.soon - x.soon || y.pending - x.pending || a.name.localeCompare(b.name); };
  // the matrix; on the company homepage (bare) without its own heading, the page's section has one
  const matrix = (shown, bare) => {
    const cols = [...new Set(shown.flatMap((s) => s.consents.flatMap((c) => c.docs.map((d) => d.cat))))].sort((a, b) => catAt(a) - catAt(b));
    const cell = (s, a) => {
      const of = (state) => s.consents.filter((c) => c.state === state).flatMap((c) => c.docs).filter((d) => d.cat === a);
      const docs = [...new Map(of('given').map((d) => [d.code, d])).values()];
      if (docs.length) {
        const worst = docs.reduce((w, d) => (RANKS[d.status] > RANKS[w] ? d.status : w), 'valid');
        const n = docs.filter((d) => RANKS[d.status] > 0).length;
        const say = n ? `${n} of ${docs.length} need${n === 1 ? 's' : ''} a look` : `${docs.length} document${docs.length === 1 ? '' : 's'}, all valid`;
        return `<td class="c"><span class="cd-dot is-${TONE[worst]}" title="${esc(a)}: ${say}"></span><span class="sr-only">${esc(a)}: ${say}</span></td>`;
      }
      if (of('pending').length) return `<td class="c"><span class="cd-dot is-wait" title="${esc(a)}: waiting for their answer"></span><span class="sr-only">${esc(a)}: waiting for their answer</span></td>`;
      return `<td class="c"><span class="cd-dash" title="Not asked of them">&mdash;</span></td>`;
    };
    const rows = shown.map((s) => { const [l, c] = overall(S.stats(s), s); return `<tr class="sp-row" data-sup="${esc(s.id)}" tabindex="0" role="link" aria-label="Open ${esc(s.name)}"><td><span class="n">${esc(s.name)}</span><span class="d">${esc([s.services[0], s.city].filter(Boolean).join(' · '))}</span></td>${cols.map((a) => cell(s, a)).join('')}<td class="sp-mx-o"><span class="co-badge ${c}">${l}</span></td></tr>`; }).join('');
    const legend = [['ok', 'All valid'], ['pend', 'Expiring or in review'], ['bad', 'Missing or expired'], ['wait', 'Waiting for their answer']].map(([c, l]) => `<span><span class="cd-dot is-${c}"></span>${l}</span>`).join('');
    return `<section class="sp-glance"${bare ? ' aria-label="Your suppliers at a glance"' : ' aria-labelledby="sp-glance-h"'}>${bare ? '' : `<div class="sp-glance-h"><h2 id="sp-glance-h">At a glance</h2><span>${shown.length} supplier${shown.length === 1 ? '' : 's'}</span></div>`}
      <div class="sp-consent sp-mx-wrap"><table class="sp-tbl sp-mx"><thead><tr><th>Supplier</th>${cols.map((a) => `<th class="c" title="${esc(a)}">${SHORT[a] || esc(a)}</th>`).join('')}<th class="sp-mx-o">Overall</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend">${legend}<span><span class="cd-dash">&mdash;</span>Not asked of them</span><span>Open a supplier for the documents behind each dot.</span></p></section>`;
  };
  const list = () => {
    const is = { attention: (s) => S.stats(s).bad > 0, invited: (s) => s.status === 'invited', pending: (s) => s.status === 'pending' };
    const all = S.list(), n = { all: all.length, attention: all.filter(is.attention).length, invited: all.filter(is.invited).length, pending: all.filter(is.pending).length };
    const fold = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const shown = all.filter((s) => (filt === 'all' || is[filt](s)) && (!q || fold(`${s.name} ${s.city} ${s.services.join(' ')}`).includes(fold(q))))
      // what needs chasing first: missing or expired, then expiring or in review, then waiting on a consent
      .sort(urgent);
    const F = [['all', 'All'], ['attention', 'Need attention'], ['invited', 'Invited'], ['pending', 'Pending consent']];
    box.innerHTML = `<div class="sp-tools"><label class="sp-search"><span class="sr-only">Search your suppliers</span><input class="input" type="search" id="sp-q" placeholder="Search by name, city or service" value="${esc(q)}" autocomplete="off"></label>
        <div class="sp-tools-r"><div class="sp-filt" role="group" aria-label="Show">${F.map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${filt === k}">${l}<b>${n[k]}</b></button>`).join('')}</div>
        <button type="button" class="sp-add is-quiet" data-sup-import><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13V3M6 7l4-4 4 4M3.5 12.5v3a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-3"/></svg>Import from Excel</button>
        <button type="button" class="sp-add" data-sup-add><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>Add a supplier</button></div></div>
      ${shown.length ? matrix(shown) + `<h2 class="sp-cards-h">Your suppliers</h2><ul class="sp-grid" aria-label="Your suppliers">${shown.map(card).join('')}</ul>` : '<div class="co-card sp-none">No supplier matches that.</div>'}`;
  };

  // ---- the company homepage: the same matrix, the ones to chase first, each row to its supplier --------
  // only the demo company has suppliers yet; a company added in this session has none to show
  const orgOf = () => { try { const p = document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel'; return JSON.parse(sessionStorage.getItem('cm-org') || 'null') || JSON.parse(localStorage.getItem('cm-last-org-' + p) || 'null') || 'home'; } catch (e) { return 'home'; } };
  if (home && orgOf() !== 'home') home.closest('section').hidden = true;
  else if (home) {
    // only the ones with an alert: something missing or expired, expiring or in review
    const all = S.list(), alert = all.filter((s) => { const k = S.stats(s); return k.bad || k.soon; }).sort(urgent);
    const add = '<a class="btn co-btn-light btn-sm co-sup-add" href="suppliers.html?add">Add a supplier</a>'; // the flow, on My suppliers (js/supplier-add.js)
    home.innerHTML = (alert.length ? matrix(alert, true) : `<div class="co-card co-sup-none"><b class="co-row-n">All your suppliers are in order</b><span class="co-subtle">Nothing missing, expired or expiring across your ${all.length} suppliers.</span></div>`)
      // as under the homepage's other tables: View all on the right
      + `<div class="co-pager-row">${add}<a href="suppliers.html" class="co-link co-pager-all">View all ${all.length} suppliers</a></div>`;
    const go = (r) => { location.href = `suppliers.html?id=${encodeURIComponent(r.dataset.sup)}`; };
    home.addEventListener('click', (e) => { const g = e.target.closest('[data-sup]'); if (g) go(g); });
    home.addEventListener('keydown', (e) => { const g = e.target.closest('[data-sup]'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(g); } });
  }
  if (!box) return;

  // ---- one supplier: who they are, and a table for each consent -----------------------------------
  const page = (s) => {
    const k = S.stats(s);
    document.title = `${s.name} · My suppliers · C-MORE`;
    if (crumb) crumb.innerHTML = `<a href="my-company.html?filled">My company</a><span aria-hidden="true">/</span><a href="suppliers.html">My suppliers</a><span aria-hidden="true">/</span><span aria-current="page">${esc(s.name)}</span>`;
    const back = document.querySelector('.eco-crumbs-back'); if (back) { back.href = 'suppliers.html'; back.setAttribute('aria-label', 'Back to My suppliers'); }
    const inv = s.status === 'invited';
    const facts = [s.services.join(', '), s.city, `${inv ? s.invite.idLabel : S.WORDS.id} ${s.nipc}`, s.workers != null ? `${s.workers} people` : '', inv ? `invited on ${s.invite.invited}` : `supplier since ${s.since}`].filter(Boolean).map(esc).join(' &middot; ');
    if (head) head.innerHTML = `<div class="sp-head"><span class="sp-logo is-lg" aria-hidden="true">${esc(ini(s.name))}</span><div><span class="eyebrow">Supplier &middot; ${stTag(s)}</span><h1>${esc(s.name)}</h1>
        <p>${facts}${s.email ? ` &middot; <a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : ''}</p></div></div>`;
    // invited: they haven't joined yet, so nothing is shared; what you asked them for, and a reminder
    if (inv) {
      const docs = s.consents[0].docs;
      box.innerHTML = `<section class="sp-sec" aria-labelledby="sp-inv"><h2 id="sp-inv">Waiting for them to join</h2>
        <p>${s.invite.onCmore ? `${esc(s.name)} is on C&#8209;MORE. Once they accept, they join your supplier list and you can see the documents below as they give their consent.` : `${esc(s.name)} isn&rsquo;t on C&#8209;MORE yet. We&rsquo;ve invited ${esc(s.email)} to join, and your supplier list with it.`}</p>
        <article class="sp-consent is-pending">
          <header class="sp-consent-h"><div><h3>Documents you asked for</h3><p>For all your ${S.WORDS.scope} &middot; asked on ${esc(s.invite.invited)} &middot; ${docs.length} document${docs.length === 1 ? '' : 's'}</p></div><span class="co-badge b-neu">Invited</span></header>
          <table class="sp-tbl"><colgroup><col><col class="sp-c-req"><col class="sp-c-st"></colgroup><thead><tr><th>Document</th><th class="hide-s">Requirement</th><th>Status</th></tr></thead>
            <tbody>${docs.map((d) => `<tr><td><span class="n">${esc(d.name)}</span><span class="d">${esc(d.code)} &middot; ${esc(d.section)}</span></td><td class="hide-s">${esc(d.requirement)}</td><td><span class="co-badge b-neu">Not shared yet</span></td></tr>`).join('')}</tbody></table>
          <div class="sp-wait"><span>${CLOCK}You&rsquo;ll see each one as soon as they share it.</span><button type="button" class="btn co-btn-ghost co-btn-sm" data-remind="${esc(s.id)}">Send a reminder</button></div>
        </article></section>`;
      return;
    }
    const given = s.consents.filter((c) => c.state === 'given'), pending = s.consents.filter((c) => c.state === 'pending');
    // the card's title is the table's first row, so the consent's badge sits in the Expiry date
    // column, level with the title
    const consent = (c) => `<article class="sp-consent">
        <table class="sp-tbl"><colgroup><col><col class="sp-c-req"><col class="sp-c-st"><col class="sp-c-exp"></colgroup><thead>
          <tr class="sp-ch"><td colspan="3" class="sp-ch-t"><h3>${esc(c.title)}</h3><p>${c.project ? `For ${esc(c.project)}` : `For all your ${S.WORDS.scope}`} &middot; given on ${esc(c.granted)} &middot; ${c.docs.length} document${c.docs.length === 1 ? '' : 's'}</p></td><td class="sp-ch-b"><span class="co-badge b-ok">Consent given</span></td></tr>
          <tr><th>Document</th><th class="hide-s">Requirement</th><th>Status</th><th class="c">Expiry date</th></tr></thead>
          <tbody>${c.docs.map((d, i) => `<tr class="sp-row" data-doc="${esc(c.id)}:${i}" tabindex="0" role="button" aria-label="Open ${esc(d.name)}"><td><span class="n">${esc(d.name)}</span><span class="d">${esc(d.code)} &middot; ${esc(d.section)}${d.note ? ' &middot; ' + esc(d.note) : ''}</span></td><td class="hide-s">${esc(d.requirement)}</td><td>${tag(d.status)}</td><td class="c">${esc(d.valid === 'No expiry' ? 'No expiry' : d.valid)}</td></tr>`).join('')}</tbody></table>
      </article>`;
    const ask = (c) => `<article class="sp-consent is-pending" data-ask="${esc(c.id)}">
        <header class="sp-consent-h"><div><h3>${esc(c.title)}</h3><p>${c.project ? `For ${esc(c.project)}` : `For all your ${S.WORDS.scope}`} &middot; you asked on ${esc(c.granted)}</p></div><span class="co-badge b-pend">Waiting for their answer</span></header>
        <div class="sp-wait"><span>${CLOCK}Until they say yes you can&rsquo;t see: ${c.docs.map((d) => esc(d.name)).join(', ')}.</span><button type="button" class="btn co-btn-ghost co-btn-sm" data-remind="${esc(c.id)}">Send a reminder</button></div>
      </article>`;
    box.innerHTML = `<div class="sp-kpis">
        <div class="sp-kpi"><span>Documents you can see</span><b>${k.shared}</b><small>${k.ok} in order</small></div>
        <div class="sp-kpi${k.bad ? ' is-bad' : ''}"><span>Need attention</span><b>${k.bad}</b><small>${k.bad ? 'Missing or expired' : k.soon ? `${k.soon} expiring or in review` : 'Nothing to chase'}</small></div>
        <div class="sp-kpi"><span>Consents</span><b>${k.given}</b><small>${k.pending ? `${k.pending} waiting for their answer` : 'All answered'}</small></div>
      </div>
      <section class="sp-sec" aria-labelledby="sp-given"><h2 id="sp-given">Consents they&rsquo;ve given you</h2><p>What ${esc(s.name)} lets you see, and for which ${S.WORDS.scope}. The documents stay current: when they renew one, you see the new one.</p>
        ${given.length ? given.map(consent).join('') : '<div class="co-card sp-none">They haven&rsquo;t given you a consent yet.</div>'}</section>
      ${pending.length ? `<section class="sp-sec" aria-labelledby="sp-asked"><h2 id="sp-asked">Waiting for their answer</h2><p>Consents you asked for that ${esc(s.name)} hasn&rsquo;t answered yet.</p>${pending.map(ask).join('')}</section>` : ''}`;
  };

  // ---- a document, in the drawer (.docd .cdd, as in Documents) ------------------------------------
  const C = window.DOC_CATALOG || { docs: [], labels: { requirement: {}, sharing: {} } };
  const byCode = Object.fromEntries(C.docs.map((d) => [d.code, d]));
  const LEFT = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.08 10l3.71 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>';
  const DOCI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const dw = document.createElement('div');
  dw.className = 'docd cdd'; dw.hidden = true;
  dw.innerHTML = `<div class="docd-scrim" data-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="sp-dw-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${DOCI}</span><div class="docd-t"><h3 id="sp-dw-t"></h3><p id="sp-dw-sub"></p></div>
        <button type="button" class="dlg-x" data-x aria-label="Close the document"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
      <div class="docd-bar"><span id="sp-dw-bar"></span><span id="sp-dw-st"></span></div>
      <div class="docd-body" id="sp-dw-body"></div>
      <div class="docd-nav" role="group" aria-label="Documents in this consent"><button type="button" class="docd-step" data-step="-1">${LEFT}Previous document</button><span id="sp-dw-n"></span><button type="button" class="docd-step is-next" data-step="1">Next document${LEFT}</button></div>
    </aside>`;
  document.body.appendChild(dw);
  const dq = (x) => dw.querySelector('#' + x);
  let at = null, back = null;
  const drawDoc = () => {
    const c = sup.consents.find((x) => x.id === at.c), d = c.docs[at.i], cat = byCode[d.code] || {};
    dq('sp-dw-t').textContent = d.name;
    dq('sp-dw-sub').innerHTML = `${esc(sup.name)} &middot; ${esc(d.code)} &middot; ${esc(d.requirement)}`;
    dq('sp-dw-bar').textContent = `Shared with you by ${sup.name}`;
    dq('sp-dw-st').innerHTML = tag(d.status);
    const file = `${d.name.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '')}.pdf`;
    const fileHtml = d.status === 'missing' ? `<div class="cmf-none">${DOCI}<h4>They haven&rsquo;t uploaded it yet</h4><p>${esc(d.note || 'ALMA has asked them for it.')}</p></div>`
      : window.CMFiles ? window.CMFiles.missing(`${sup.name}’s ${file}`, `The demo&rsquo;s suppliers have no files behind their documents. On C&#8209;MORE you see the file ${esc(sup.name)} uploaded, exactly as it is.`) : '';
    const kv = (k, v) => (v ? `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>` : '');
    dq('sp-dw-body').innerHTML = fileHtml
      + `<section class="cdd-card"><h4 class="eyebrow">This document</h4><dl class="pd-facts cdd-facts">${kv('Status', tag(d.status))}${kv('Expiry date', esc(d.valid === '—' ? 'Not on file' : d.valid))}${d.note ? kv('Note', esc(d.note)) : ''}${kv('Issued by', esc((cat.usuallyIssuedBy || '').split(';')[0]))}${kv('Section', esc(d.section))}</dl></section>`
      + `<section class="cdd-card"><h4 class="eyebrow">Shared under</h4><dl class="pd-facts cdd-facts">${kv('Consent', esc(c.title))}${kv('For', c.project ? esc(c.project) : `All your ${S.WORDS.scope}`)}${kv('Given on', esc(c.granted))}${kv('Stays current', 'When they renew it, you see the new one')}</dl></section>`
      + `<section class="cdd-card"><h4 class="eyebrow">About this document</h4>${cat.description ? `<p class="cdd-desc">${esc(cat.description.en)}</p>` : ''}<dl class="pd-facts cdd-facts">${kv('Requirement', esc(d.requirement))}${kv('Renewal', esc(cat.renewal || '—'))}${kv('Expiry', esc(cat.expiryRule || '—'))}${kv('Legal basis', esc(cat.legalBasis || '—'))}</dl></section>`;
    dq('sp-dw-n').textContent = `${at.i + 1} of ${c.docs.length} in ${c.title}`;
    dw.querySelector('[data-step="-1"]').disabled = at.i === 0;
    dw.querySelector('[data-step="1"]').disabled = at.i === c.docs.length - 1;
    dq('sp-dw-body').scrollTop = 0;
  };
  const openDoc = (key) => {
    const [cid, i] = key.split(':'); at = { c: cid, i: +i }; back = document.activeElement;
    dw.hidden = false; document.documentElement.style.overflow = 'hidden'; drawDoc();
    setTimeout(() => dw.classList.add('is-open'), 20); dw.querySelector('.docd-panel').focus();
  };
  const closeDoc = () => { dw.classList.remove('is-open'); document.documentElement.style.overflow = ''; setTimeout(() => { dw.hidden = true; }, 280); if (back && back.isConnected) back.focus(); at = null; };
  dw.addEventListener('click', (e) => {
    if (e.target.closest('[data-x]')) { closeDoc(); return; }
    const st = e.target.closest('[data-step]'); if (st && !st.disabled) { at.i += +st.dataset.step; drawDoc(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && at) closeDoc(); });
  const goSup = (r) => { location.href = `suppliers.html?id=${encodeURIComponent(r.dataset.sup)}`; };
  box.addEventListener('click', (e) => { const r = e.target.closest('[data-doc]'); if (r) { openDoc(r.dataset.doc); return; } const g = e.target.closest('[data-sup]'); if (g) goSup(g); });
  box.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; const r = e.target.closest('[data-doc]'), g = e.target.closest('[data-sup]'); if (r) { e.preventDefault(); openDoc(r.dataset.doc); } else if (g) { e.preventDefault(); goSup(g); } });

  if (id && !sup) { box.innerHTML = '<div class="co-card sp-none">That supplier isn&rsquo;t in your list. <a href="suppliers.html">See all your suppliers</a>.</div>'; return; }
  if (sup) page(sup); else list();
  window.CMSupPage = { refresh: () => { if (!sup) list(); } }; // a supplier just added (js/supplier-add.js)
  box.addEventListener('input', (e) => { if (e.target.id === 'sp-q') { q = e.target.value; const at = e.target.selectionStart; list(); const i = document.getElementById('sp-q'); i.focus(); i.setSelectionRange(at, at); } });
  box.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; list(); return; }
    const r = e.target.closest('[data-remind]');
    if (r) r.replaceWith(Object.assign(document.createElement('span'), { className: 'sp-sent', textContent: 'Reminder sent' }));
  });
})();
