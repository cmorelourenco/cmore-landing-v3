/* My clients (clients.html): at a glance, a matrix of every client against the kinds of document
   you let it see, one dot each for what it sees today (green in order, amber expiring or in review,
   red missing or expired); then a card for each client. With ?id=, the client's own page: what it
   asks of you and is waiting for your answer, what you share under each consent (with Stop sharing),
   what you no longer share (with Share again), and the consent log. The look is My suppliers'
   (js/suppliers-page.js), seen from the other side. The data is js/clients.js. */
(() => {
  const C = window.CM_CLIENTS, box = document.getElementById('cl-body');
  if (!C || !box) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const ini = (n) => n.split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).slice(0, 2).map((w) => w[0]).join('') || n.slice(0, 2).toUpperCase();
  const CHEV = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.92 10 7.21 6.29a.75.75 0 1 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clip-rule="evenodd"/></svg>';
  const CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const css = `
/* My suppliers' look (js/suppliers-page.js) */
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
.cd-dot.is-off { background: transparent; border: 2px solid var(--color-critical); box-sizing: border-box; } /* shared once, consent since removed */
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
.sp-card.is-invited { border-style: dashed; background: var(--color-light-beige); }
.sp-card.is-removed { background: var(--color-light-beige); }
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
/* the consent log: newest first, a date, a dot for what happened, and what it covered */
.sp-log { margin-top: 1rem; padding: 0.5rem 1.25rem; border: 1px solid var(--color-line); border-radius: 0.875rem; background: var(--color-surface); list-style: none; }
.sp-log li { display: grid; grid-template-columns: 7.5rem 0.75rem minmax(0, 1fr); gap: 0 0.875rem; align-items: baseline; padding: 0.75rem 0; font-size: 0.875rem; color: var(--color-ink-muted); }
.sp-log li + li { border-top: 1px solid var(--color-mid-beige); }
.sp-log time { font-size: 0.8125rem; color: var(--color-ink-subtle); white-space: nowrap; }
.sp-log .cd-dot { width: 0.625rem; height: 0.625rem; align-self: center; }
.sp-log b { font-weight: 500; color: var(--color-ink); }
.sp-log small { display: block; margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
@media (max-width: 40rem) { .sp-log li { grid-template-columns: 0.75rem minmax(0, 1fr); } .sp-log time { grid-column: 2; } .sp-log .cd-dot { grid-row: span 2; } }
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
.sp-consent.is-removed { background: var(--color-light-beige); }
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
@media (max-width: 40rem) { .sp-kpis { grid-template-columns: 1fr; } .sp-tbl .hide-s { display: none; } .sp-tbl th, .sp-tbl td { padding-inline: 0.875rem; } }
/* what only My clients has: a consent's title and badge on one line, its own footer, and the dialog to stop sharing */
.cl-ch { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem 1rem; flex-wrap: wrap; }
.cl-ch .co-badge { flex: none; display: inline-flex; align-items: center; height: 1.5rem; margin: 0; white-space: nowrap; }
.sp-c-exp { width: 10.5rem; }
/* on a phone there's no room for its own column: the expiry sits under what they see */
.cl-exp-s { display: none; }
@media (max-width: 40rem) { .sp-tbl .cl-exp-c { display: none; } .sp-tbl col.sp-c-exp { width: 0; } .sp-tbl col.sp-c-st { width: auto; } .cl-exp-s { display: block; margin-top: 0.375rem; font-size: 0.8125rem; } }
.cl-acts { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; padding: 0.875rem 1.25rem; border-top: 1px solid var(--color-mid-beige); font-size: 0.875rem; color: var(--color-ink-muted); }
.cl-acts > span:last-child { display: flex; align-items: center; gap: 0.75rem; }
.cl-acts svg { width: 1rem; height: 1rem; vertical-align: -0.1875rem; margin-right: 0.375rem; }
.cl-stop { color: var(--color-critical, #b3261e) !important; border-color: color-mix(in oklab, var(--color-critical, #b3261e) 35%, var(--color-line)) !important; }
.cl-stop:hover { background: var(--color-critical-subtle, #fbe9e7) !important; }
.cl-fix { font-weight: 500; color: var(--color-ink); text-decoration: underline; text-decoration-color: var(--color-coral); text-underline-offset: 0.2em; }
.cl-dlg .dlg-card { max-width: 30rem; }
.cl-dlg .dlg-head { align-items: flex-start; text-align: left; padding: 1.75rem 3.5rem 0.75rem 1.75rem; }
.cl-dlg .dlg-head h2 { font-size: 1.375rem; padding: 0 !important; }
.cl-dlg .dlg-body { padding: 0 1.75rem; }
.cl-dlg ul { margin: 0.25rem 0 0; padding: 0.75rem 1rem; list-style: none; border-radius: 0.625rem; background: var(--color-light-beige); font-size: 0.875rem; color: var(--color-ink-muted); display: grid; gap: 0.25rem; max-height: 12rem; overflow: auto; }
.cl-dlg .dlg-foot { padding: 1.25rem 1.75rem 1.5rem; }
.cl-dlg .btn.is-danger { background: var(--color-critical, #b3261e) !important; border-color: var(--color-critical, #b3261e) !important; color: #fff !important; }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  const S = window.DOC_MODEL.STATUS;
  const tag = (d) => { const [l, c] = S[d.status] || [d.status, 'b-neu']; return `<span class="co-badge ${c}">${l}</span>`; };
  const toast = (m) => { if (window.CMAlmaJob) window.CMAlmaJob.toast(m); };
  const id = new URLSearchParams(location.search).get('id');
  const head = document.getElementById('cl-head'), crumb = document.getElementById('cl-crumb');
  const For = (k) => (k.project ? `For ${esc(k.project)}` : 'For all your work with them');
  const n = (k) => `${k.docs.length} document${k.docs.length === 1 ? '' : 's'}`;

  // where a client stands: what it's waiting on from you first, then what it sees in red
  const overall = (c) => { const k = C.stats(c); return k.pending ? ['Waiting for your answer', 'b-pend'] : !k.given ? ['Not sharing', 'b-neu'] : k.bad ? ['Sees something missing', 'b-over'] : k.soon ? ['Expiring or in review', 'b-pend'] : ['All in order', 'b-ok']; };
  const GROUP = { 'Waiting for your answer': 0, 'Sees something missing': 1, 'Expiring or in review': 2, 'All in order': 3, 'Not sharing': 4 };
  const urgent = (a, b) => GROUP[overall(a)[0]] - GROUP[overall(b)[0]] || C.stats(b).bad - C.stats(a).bad || a.name.localeCompare(b.name);
  const badge = ([l, c]) => `<span class="co-badge ${c}">${l}</span>`;

  // ---- at a glance: a row per client, a column per kind of document, what each one sees -----------
  const SHORT = { 'Identification and registration': 'Registration', 'Tax and social security': 'Tax &amp; social security', 'Health and safety': 'Health &amp; safety',
    'ESG and sustainability': 'ESG', 'Information security': 'Info security' };
  const RANKS = { ok: 0, pend: 1, bad: 2 };
  const catAt = (c) => (C.CATS.includes(c) ? C.CATS.indexOf(c) : C.CATS.length);
  const matrix = (shown) => {
    const cols = [...new Set(shown.flatMap((c) => c.consents.flatMap((k) => k.docs.map((d) => d.cat))))].sort((a, b) => catAt(a) - catAt(b));
    const cell = (c, a) => {
      const of = (...s) => c.consents.filter((k) => s.includes(k.state)).flatMap((k) => k.docs).filter((d) => d.cat === a);
      const docs = [...new Map(of('given').map((d) => [d.code, d])).values()];
      const td = (cls, say) => `<td class="c"><span class="cd-dot is-${cls}" title="${esc(a)}: ${say}"></span><span class="sr-only">${esc(a)}: ${say}</span></td>`;
      if (docs.length) {
        const worst = docs.reduce((w, d) => (RANKS[d.tone] > RANKS[w] ? d.tone : w), 'ok'), k = docs.filter((d) => d.tone !== 'ok').length;
        return td(worst, k ? `they see ${k} of ${docs.length} ${worst === 'bad' ? 'missing or expired' : 'expiring or in review'}` : `they see ${docs.length} document${docs.length === 1 ? '' : 's'}, all valid`);
      }
      if (of('pending').length) return td('wait', 'they asked, waiting for your answer');
      if (of('stopped', 'declined').length) return td('off', 'you stopped sharing');
      return '<td class="c"><span class="cd-dash" title="Not shared">&mdash;</span></td>';
    };
    const rows = shown.map((c) => `<tr class="sp-row" data-cl="${esc(c.id)}" tabindex="0" role="link" aria-label="Open ${esc(c.name)}"><td><span class="n">${esc(c.name)}</span><span class="d">${esc([c.sector, c.city].join(' · '))}</span></td>${cols.map((a) => cell(c, a)).join('')}<td class="sp-mx-o">${badge(overall(c))}</td></tr>`).join('');
    const legend = [['ok', 'All valid'], ['pend', 'Expiring or in review'], ['bad', 'Missing or expired'], ['wait', 'Asked, waiting for you'], ['off', 'You stopped sharing']].map(([k, l]) => `<span><span class="cd-dot is-${k}"></span>${l}</span>`).join('');
    return `<section class="sp-glance" aria-labelledby="cl-glance-h"><div class="sp-glance-h"><h2 id="cl-glance-h">What each client sees</h2><span>${shown.length} client${shown.length === 1 ? '' : 's'}</span></div>
      <div class="sp-consent sp-mx-wrap"><table class="sp-tbl sp-mx"><thead><tr><th>Client</th>${cols.map((a) => `<th class="c" title="${esc(a)}">${SHORT[a] || esc(a)}</th>`).join('')}<th class="sp-mx-o">Overall</th></tr></thead><tbody>${rows}</tbody></table></div>
      <p class="cd-legend">${legend}<span><span class="cd-dash">&mdash;</span>Not shared</span><span>Renew a document in Documents and every client who sees it gets the new one.</span></p></section>`;
  };

  // ---- the clients, as cards -----------------------------------------------------------------------
  let filt = 'all', q = '';
  const card = (c) => {
    const k = C.stats(c), o = overall(c);
    const idHtml = `<span class="sp-id"><span class="sp-logo" aria-hidden="true">${esc(ini(c.name))}</span><span><b>${esc(c.name)}</b><small>${esc([c.sector, c.city].join(' · '))}</small></span></span>`;
    const meter = k.shared ? `<span class="sp-meter${k.bad ? ' is-warn' : ''}"><span class="sp-meter-t"><span>What they see in order</span><b>${k.ok} of ${k.shared}</b></span><i><span style="width:${k.pct}%"></span></i></span>`
      : `<span class="sp-meter"><span class="sp-meter-t"><span>${k.pending ? 'Nothing shared yet' : 'No longer sharing documents'}</span></span><i><span style="width:0"></span></i></span>`;
    const chips = [badge(o), k.pending && k.given ? `<span class="co-badge b-pend">${k.pending} request${k.pending === 1 ? '' : 's'} waiting</span>` : '', k.bad && o[0] !== 'Sees something missing' ? `<span class="co-badge b-over">${k.bad} missing or expired</span>` : ''].filter(Boolean).join('');
    return `<li><a class="sp-card${!k.given && !k.pending ? ' is-removed' : ''}" href="clients.html?id=${esc(c.id)}">${idHtml}${meter}<span class="sp-chips">${chips}</span>
      <span class="sp-foot"><span>${k.given} consent${k.given === 1 ? '' : 's'} given &middot; client since ${esc(c.since)}</span>${CHEV}</span></a></li>`;
  };
  const list = () => {
    const is = { attention: (c) => C.stats(c).bad > 0, waiting: (c) => C.stats(c).pending > 0, stopped: (c) => C.stats(c).stopped > 0 };
    const all = C.list(), cnt = { all: all.length, waiting: all.filter(is.waiting).length, attention: all.filter(is.attention).length, stopped: all.filter(is.stopped).length };
    const fold = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const shown = all.filter((c) => (filt === 'all' || is[filt](c)) && (!q || fold(`${c.name} ${c.city} ${c.sector}`).includes(fold(q)))).sort(urgent);
    const F = [['all', 'All'], ['waiting', 'Waiting for you'], ['attention', 'See something missing'], ['stopped', 'Stopped']];
    box.innerHTML = `<div class="sp-tools"><label class="sp-search"><span class="sr-only">Search your clients</span><input class="input" type="search" id="cl-q" placeholder="Search by name, city or sector" value="${esc(q)}" autocomplete="off"></label>
        <div class="sp-tools-r"><div class="sp-filt" role="group" aria-label="Show">${F.map(([k, l]) => `<button type="button" data-f="${k}" aria-pressed="${filt === k}">${l}<b>${cnt[k]}</b></button>`).join('')}</div></div></div>
      ${shown.length ? matrix(shown) + `<h2 class="sp-cards-h">Your clients</h2><ul class="sp-grid" aria-label="Your clients">${shown.map(card).join('')}</ul>` : `<div class="co-card sp-none">${all.length ? 'No client matches that.' : 'No clients yet. When a company asks to see your documents, it shows up here.'}</div>`}`;
  };

  // ---- the consent log ------------------------------------------------------------------------------
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const when = (t) => { const [d, m, y] = String(t || '').split(' '); return MON.includes(m) ? new Date(+y, MON.indexOf(m), +d).getTime() : 0; };
  const events = (c) => c.consents.flatMap((k) => {
    const asked = k.asked ? [{ at: k.asked, tone: 'wait', what: `${esc(c.name)} asked for ${esc(k.title)}`, sub: `${For(k)} &middot; ${n(k)}` }] : [];
    if (k.state === 'pending') return asked;
    if (k.state === 'declined') return asked.concat([{ at: k.on, tone: 'off', what: `You declined ${esc(k.title)}`, sub: 'They see none of it' }]);
    const given = { at: k.granted, tone: 'ok', what: `You gave consent: ${esc(k.title)}`, sub: `${For(k)} &middot; ${n(k)}` };
    if (k.state === 'stopped') return asked.concat([given, { at: k.on, tone: 'off', what: `You stopped sharing ${esc(k.title)}`, sub: `They no longer see its ${n(k)}` }]);
    // what ran out while they could see it
    return asked.concat([given], k.docs.filter((d) => d.status === 'expired' && when(d.valid)).map((d) => ({ at: d.valid, tone: 'bad', what: `${esc(d.name)} expired`, sub: `They see it as expired, under ${esc(k.title)}` })));
  });
  const log = (c) => {
    const seen = new Set(), all = events(c).sort((a, b) => when(b.at) - when(a.at)).filter((e) => { const k = e.at + e.what; if (seen.has(k)) return false; seen.add(k); return true; });
    return `<section class="sp-sec" aria-labelledby="cl-log-h"><h2 id="cl-log-h">Consent log</h2><p>Everything between you and ${esc(c.name)}, newest first.</p>
      <ol class="sp-log">${all.map((e) => `<li><time>${esc(e.at)}</time><span class="cd-dot is-${e.tone}" aria-hidden="true"></span><span><b>${e.what}</b><small>${e.sub}</small></span></li>`).join('')}</ol></section>`;
  };

  // ---- one client: what it's waiting for, what you share, what you no longer share -------------------
  const rowsOf = (k, exp = true) => k.docs.map((d) => `<tr><td><span class="n">${esc(d.name)}</span><span class="d">${esc(d.code)} &middot; ${esc(d.section)}${d.tone === 'bad' ? ' &middot; <a class="cl-fix" href="company-details.html">Fix in Documents</a>' : ''}</span></td><td class="hide-s">${esc(d.requirement || '')}</td><td>${tag(d)}${exp ? `<span class="cl-exp-s">${window.DOC_MODEL.expHtml(d.valid)}</span>` : ''}</td>${exp ? `<td class="c cl-exp-c">${window.DOC_MODEL.expHtml(d.valid)}</td>` : ''}</tr>`).join('');
  const table = (k, title, b) => `<table class="sp-tbl"><colgroup><col><col class="sp-c-req"><col class="sp-c-st"><col class="sp-c-exp"></colgroup><thead>
      <tr class="sp-ch"><td colspan="4"><div class="cl-ch"><div><h3>${esc(k.title)}</h3><p>${title}</p></div>${b}</div></td></tr>
      <tr><th>Document</th><th class="hide-s">Requirement</th><th>${k.state === 'given' ? 'They see' : 'Status'}</th><th class="c cl-exp-c">Expiry date</th></tr></thead><tbody>${rowsOf(k)}</tbody></table>`;
  const given = (k) => `<article class="sp-consent" data-k="${esc(k.id)}">${table(k, `${For(k)} &middot; given on ${esc(k.granted)} &middot; ${n(k)}`, '<span class="co-badge b-ok">Sharing</span>')}
      <div class="cl-acts"><span>When you renew one of these, they see the new one.</span><span><button type="button" class="btn co-btn-ghost co-btn-sm cl-stop" data-stop="${esc(k.id)}">Stop sharing</button></span></div></article>`;
  const asked = (k) => `<article class="sp-consent is-pending" data-k="${esc(k.id)}">${table(k, `${For(k)} &middot; asked on ${esc(k.asked)} &middot; ${n(k)}`, '<span class="co-badge b-pend">Waiting for your answer</span>')}
      <div class="cl-acts"><span>${CLOCK}Nothing is shared until you say yes.</span><span><button type="button" class="link-btn" data-decline="${esc(k.id)}">Decline</button><button type="button" class="btn btn-primary btn-sm" data-share="${esc(k.id)}">Share these ${n(k)}</button></span></div></article>`;
  const gone = (k) => `<article class="sp-consent is-removed" data-k="${esc(k.id)}">
      <header class="sp-consent-h"><div><h3>${esc(k.title)}</h3><p>${For(k)} &middot; ${k.state === 'declined' ? `declined on ${esc(k.on)}` : `given on ${esc(k.granted)} &middot; stopped on ${esc(k.on)}`}</p></div><span class="co-badge b-neu">${k.state === 'declined' ? 'Declined' : 'Stopped'}</span></header>
      <div class="sp-wait"><span>They no longer see: ${k.docs.map((d) => esc(d.name)).join(', ')}.</span><button type="button" class="btn co-btn-ghost co-btn-sm" data-share="${esc(k.id)}">${k.state === 'declined' ? 'Share these' : 'Share again'}</button></div></article>`;
  const page = (c) => {
    document.title = `${c.name} · My clients · C-MORE`;
    if (crumb) crumb.innerHTML = `<a href="my-company.html?filled">My company</a><span aria-hidden="true">/</span><a href="clients.html">My clients</a><span aria-hidden="true">/</span><span aria-current="page">${esc(c.name)}</span>`;
    const back = document.querySelector('.eco-crumbs-back'); if (back) { back.href = 'clients.html'; back.setAttribute('aria-label', 'Back to My clients'); }
    const k = C.stats(c);
    if (head) head.innerHTML = `<div class="sp-head"><span class="sp-logo is-lg" aria-hidden="true">${esc(ini(c.name))}</span><div><span class="eyebrow">Client &middot; ${badge(overall(c))}</span><h1>${esc(c.name)}</h1>
        <p>${esc(c.sector)} &middot; ${esc(c.city)} &middot; client since ${esc(c.since)} &middot; <a href="mailto:${esc(c.email)}">${esc(c.email)}</a></p></div></div>`;
    const G = c.consents.filter((x) => x.state === 'given'), W = c.consents.filter((x) => x.state === 'pending'), O = c.consents.filter((x) => x.state === 'stopped' || x.state === 'declined');
    box.innerHTML = `<div class="sp-kpis">
        <div class="sp-kpi"><span>Documents they see</span><b>${k.shared}</b><small>${k.shared ? `${k.ok} in order` : 'Nothing shared right now'}</small></div>
        <div class="sp-kpi${k.bad ? ' is-bad' : ''}"><span>They see as missing or expired</span><b>${k.bad}</b><small>${k.bad ? 'Upload them in Documents' : k.soon ? `${k.soon} expiring or in review` : 'Nothing to fix'}</small></div>
        <div class="sp-kpi"><span>Consents</span><b>${k.given}</b><small>${k.pending ? `${k.pending} waiting for your answer` : k.stopped ? `${k.stopped} stopped` : 'All answered'}</small></div>
      </div>
      ${W.length ? `<section class="sp-sec" aria-labelledby="cl-ask"><h2 id="cl-ask">Waiting for your answer</h2><p>What ${esc(c.name)} has asked to see. This is how it looks today: share it, or decline.</p>${W.map(asked).join('')}</section>` : ''}
      <section class="sp-sec" aria-labelledby="cl-given"><h2 id="cl-given">What you share with them</h2><p>The documents ${esc(c.name)} can see, and how they look to them right now. Stop sharing any of these whenever you like.</p>
        ${G.length ? G.map(given).join('') : `<div class="co-card sp-none">You don&rsquo;t share anything with ${esc(c.name)} right now.</div>`}</section>
      ${O.length ? `<section class="sp-sec" aria-labelledby="cl-gone"><h2 id="cl-gone">No longer shared</h2><p>Consents you stopped or declined. ${esc(c.name)} can ask again, or you can share them again.</p>${O.map(gone).join('')}</section>` : ''}
      ${log(c)}`;
  };

  // ---- stopping: a word first, since they lose sight of the documents at once ------------------------
  const dlg = document.createElement('div');
  dlg.className = 'dlg cl-dlg'; dlg.hidden = true;
  dlg.innerHTML = `<div class="dlg-scrim" data-dx></div><div class="dlg-card" role="alertdialog" aria-modal="true" aria-labelledby="cl-dlg-t" aria-describedby="cl-dlg-p">
      <button type="button" class="dlg-x" data-dx aria-label="Close">${X}</button>
      <div class="dlg-head"><h2 id="cl-dlg-t"></h2><p id="cl-dlg-p"></p></div><div class="dlg-body"><ul id="cl-dlg-l"></ul></div>
      <div class="dlg-foot"><button type="button" class="btn btn-quiet" data-dx>Keep sharing</button><button type="button" class="btn btn-primary is-danger" id="cl-dlg-go">Stop sharing</button></div></div>`;
  document.body.appendChild(dlg);
  let stopping = null, lastFocus = null;
  const ask = (cid) => {
    const c = C.list().find((x) => x.consents.some((k) => k.id === cid)), k = c.consents.find((x) => x.id === cid);
    stopping = cid; lastFocus = document.activeElement;
    dlg.querySelector('#cl-dlg-t').textContent = `Stop sharing ${k.title} with ${c.name}?`;
    dlg.querySelector('#cl-dlg-p').textContent = `They lose access to these ${k.docs.length} document${k.docs.length === 1 ? '' : 's'} straight away, and we let them know. They can ask you again, and you can share again at any time.`;
    dlg.querySelector('#cl-dlg-l').innerHTML = k.docs.map((d) => `<li>${esc(d.name)}</li>`).join('');
    dlg.hidden = false; document.documentElement.classList.add('dlg-open');
    setTimeout(() => dlg.querySelector('[data-dx].btn').focus(), 30);
  };
  const shut = () => { dlg.hidden = true; document.documentElement.classList.remove('dlg-open'); stopping = null; if (lastFocus && lastFocus.isConnected) lastFocus.focus(); };
  dlg.addEventListener('click', (e) => { if (e.target.closest('[data-dx]')) shut(); });
  dlg.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); shut(); } });
  dlg.querySelector('#cl-dlg-go').addEventListener('click', () => {
    const cid = stopping, k = C.list().flatMap((c) => c.consents).find((x) => x.id === cid); shut();
    const c = C.setState(cid, 'stopped'); paint();
    toast(`You stopped sharing ${esc(k.title)} with ${esc(c.name)}. They no longer see ${k.docs.length === 1 ? 'it' : `those ${k.docs.length} documents`}.`);
  });

  // ---- the page, and what you do on it ---------------------------------------------------------------
  const paint = () => {
    const c = id && C.byId(id);
    if (id && !c) { box.innerHTML = '<div class="co-card sp-none">That client isn&rsquo;t in your list. <a href="clients.html">See all your clients</a>.</div>'; return; }
    if (c) page(c); else list();
  };
  paint();
  box.addEventListener('input', (e) => { if (e.target.id === 'cl-q') { q = e.target.value; const at = e.target.selectionStart; list(); const i = document.getElementById('cl-q'); i.focus(); i.setSelectionRange(at, at); } });
  const go = (r) => { location.href = `clients.html?id=${encodeURIComponent(r.dataset.cl)}`; };
  box.addEventListener('click', (e) => {
    const f = e.target.closest('[data-f]'); if (f) { filt = f.dataset.f; list(); return; }
    const r = e.target.closest('[data-cl]'); if (r) { go(r); return; }
    const s = e.target.closest('[data-stop]'); if (s) { ask(s.dataset.stop); return; }
    const sh = e.target.closest('[data-share]');
    if (sh) { const k = C.list().flatMap((c) => c.consents).find((x) => x.id === sh.dataset.share), c = C.setState(k.id, 'given'); paint(); toast(`${esc(c.name)} can now see ${esc(k.title)}: ${k.docs.length} document${k.docs.length === 1 ? '' : 's'}.`); return; }
    const d = e.target.closest('[data-decline]');
    if (d) { const k = C.list().flatMap((c) => c.consents).find((x) => x.id === d.dataset.decline), c = C.setState(k.id, 'declined'); paint(); toast(`You declined ${esc(c.name)}&rsquo;s request for ${esc(k.title)}.`); }
  });
  box.addEventListener('keydown', (e) => { const r = e.target.closest('[data-cl]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); go(r); } });
})();
