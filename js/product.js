/* The product sheet: everything that applies to one SKU, what is met and what is missing.
   Identification always; the EUDR block when the triage says it is an EUDR commodity (P1); the
   forced labour block always, reinforced when the triage flags a risk input or region (P2); the
   packaging formats when it is placed on the market packed (P4). Lots, parcels, packaging formats
   and company documents are kept elsewhere and only linked and summed up here. The result at the
   end adds it all up: compliance per regulation, the gaps, and the requests they sent to suppliers. */
(() => {
  const D = window.PRODUCTS; if (!D) return;
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const id = new URLSearchParams(location.search).get('p');
  const p = D.get(id) || D.list[0], c = D.C[p.c];
  document.title = `${p.name} · Product sheet · C-MORE`;
  $('pd-crumb').textContent = p.name;
  $('pd-name').textContent = p.name;
  $('pd-eyebrow').textContent = `Product sheet · ${p.sku}`;

  // ---- the states, and what they are worth -----------------------------------------------------------
  const PTS = { ok: 1, review: 0.5, missing: 0, bad: 0 };
  const LABEL = { ok: 'Done', review: 'In review', missing: 'Missing', bad: 'Failed' };
  const CHIP = { ok: 'is-ok', review: 'is-you', missing: 'is-mid', bad: 'is-bad' };
  const chip = (s, l) => `<span class="chip ${CHIP[s]}">${esc(l || LABEL[s])}</span>`;
  const STATUS = { ok: ['In conformity', 'b-ok'], review: ['Pending approval', 'b-info'], pend: ['Pending', 'b-pend'], bad: ['Non conform', 'b-over'] };
  const ICO = {
    ok: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"/></svg>',
    bad: '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>',
  };

  // ---- what applies: the triage ----------------------------------------------------------------------
  const P1 = !!c.commodity, P2 = !!p.p2, P4 = !!p.p4;

  // ---- every check, so the result can add them up -------------------------------------------------------
  const owner = D.OWNER(p), items = [];
  const add = (reg, what, state, who) => { items.push({ reg, what, state, who }); return state; };
  const legal = D.LEGAL.map((dom, i) => {
    const ev = c.legal[i], st = (p.legalState || {})[i] || 'ok', just = /^Justification:/.test(ev);
    if (P1) add('EUDR', `Legality: ${dom.toLowerCase()}`, st, owner);
    return { dom, ev: just ? ev.replace(/^Justification:\s*/, '') : ev, just, st };
  });
  if (P1) {
    p.lots.forEach((l) => add('EUDR', `${l.code}: ${l.state === 'bad' ? 'parcel on deforestation alert' : l.state === 'missing' ? 'origin parcel not yet linked' : 'parcel evidence to approve'}`, l.state, owner));
  }
  const f = c.flr, untraced = JSON.stringify(p.tree).includes('not yet traced');
  add('FLR', 'Risk inputs and regions of origin mapped', 'ok', 'You');
  add('FLR', 'Supplier tree down to the raw material', untraced ? 'missing' : 'ok', owner);
  f.audits.forEach(([a, where, , st]) => add('FLR', `${a} (${where})`, st, where.split(',')[0]));
  if (f.alerts.length) add('FLR', 'Alerts found have actions with evidence', f.actions.length >= f.alerts.length && p.status !== 'bad' ? 'ok' : 'review', owner);
  if (P4) (p.pack || []).forEach(([code, name, st]) => add('PPWR', `${code} · ${name}`, st, 'You'));
  const docs = p.docs.map((k) => ({ code: k, ...D.DOCS[k] })).filter((d) => d.for !== 'PPWR' || P4);
  docs.forEach((d) => add(d.for, d.name, d.state, 'You (company level)'));
  const REGS = [['EUDR', 'Deforestation (EUDR)', P1], ['FLR', 'Forced labour (FLR)', true], ['PPWR', 'Packaging (PPWR)', P4]].filter((r) => r[2]);
  const pct = (reg) => { const l = items.filter((i) => i.reg === reg); return l.length ? Math.round((l.reduce((s, i) => s + PTS[i.state], 0) / l.length) * 100) : 100; };
  const gaps = items.filter((i) => i.state !== 'ok');

  // ---- pieces --------------------------------------------------------------------------------------------
  const card = (key, title, sub, reg, body, tag) => `<section class="co-card pd-card" id="pd-${key}" aria-labelledby="pd-${key}-h">
    <header class="pd-card-h"><div><h2 class="res-h" id="pd-${key}-h">${title}${tag ? ` <span class="chip is-you">${tag}</span>` : ''}</h2>${sub ? `<p class="co-subtle">${sub}</p>` : ''}</div>
      ${reg ? `<div class="pd-pct">${meter(pct(reg))}<b>${pct(reg)}%</b></div>` : ''}</header>${body}</section>`;
  // a progress bar: coral while there is something left to do, green once it is all done
  const meter = (v, cls = '') => `<span class="co-meter pd-meter ${cls}${v >= 100 ? ' is-full' : ''}"><i style="width:${v}%"></i></span>`;
  const kv = (k, v) => `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>`;
  const tbl = (head, rows) => `<div class="pd-tbl-w"><table class="co-tbl pd-tbl"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
  const sub = (t) => `<h3 class="pd-sub">${t}</h3>`;
  const list = (l, cls) => `<ul class="pd-list ${cls || ''}">${l.map((x) => `<li>${x}</li>`).join('')}</ul>`;
  const tree = ([name, kids]) => `<li><span class="pd-node">${esc(name)}</span>${kids.length ? `<ul>${kids.map(tree).join('')}</ul>` : ''}</li>`;
  const regionsTxt = p.origins.map(([cty, reg]) => `${reg}, ${cty}`);

  // ---- the summary bar -------------------------------------------------------------------------------------
  const [sl, sc] = STATUS[p.status];
  const tri = [['P1', 'EUDR commodity', P1], ['P2', 'Forced labour risk', P2], ['P4', 'Packaged for the EU', P4]];
  let html = `<div class="res-bar pd-bar"><span class="res-co"><b>${esc(p.sku)}</b><span class="co-badge ${sc}">${sl}</span></span>
    <span class="pd-tri" aria-label="Product triage">${tri.map(([k, l, on]) => `<span class="pd-tri-i ${on ? 'is-on' : ''}" title="Triage ${k}: ${on ? 'yes' : 'no'}"><span class="pd-code">${k}</span>${l}<b>${on ? 'Yes' : 'No'}</b></span>`).join('')}</span></div>`;

  // compliance at a glance
  html += `<div class="pd-top">${REGS.map(([k, l]) => { const v = pct(k);
    return `<a class="co-card pd-reg" href="#pd-result"><span class="res-k">${l}</span><b>${v}%</b>${meter(v)}<span class="co-subtle">${items.filter((i) => i.reg === k && i.state !== 'ok').length || 'No'} gap${items.filter((i) => i.reg === k && i.state !== 'ok').length === 1 ? '' : 's'}</span></a>`; }).join('')}</div>`;

  // ---- identification (always) -------------------------------------------------------------------------------
  html += card('id', 'Identification', 'Always shown. The HS/CN code is checked against Annex I of the EUDR.', null, `<dl class="pd-grid">
    ${kv('SKU', esc(p.sku))}${kv('Name', esc(p.name))}${kv('Family', esc(c.family))}
    ${kv('HS/CN code', `${esc(p.hs)} <span class="co-subtle">${esc(p.hsText)}</span><span class="pd-seal ${P1 ? 'is-on' : ''}">${P1 ? ICO.ok : ''}${P1 ? 'EUDR applies' : 'EUDR does not apply'}</span>`)}
    ${kv('Country of manufacture', esc(p.made))}${kv('EU markets', p.markets.map(esc).join(', '))}
    ${kv('Clients and importers', p.clients.map(([n, r]) => `${esc(n)} <span class="co-subtle">${r}</span>`).join('<br>'))}</dl>`);

  // ---- suppliers ----------------------------------------------------------------------------------------------
  const sups = p.suppliers || [];
  html += card('sup', 'Suppliers', `Everyone who supplies this product or what goes into it.${sups.some((s) => s[3].length) ? ` ${sups.filter((s) => s[3].length).length} with open alerts.` : ' No open alerts.'}`, null,
    tbl(['Supplier', 'Country', 'Product supplied', 'Alerts'], sups.map(([n, cty, what, al]) => `<tr><td><span class="n">${esc(n)}</span></td><td>${esc(cty)}</td><td>${esc(what)}</td>
      <td class="pd-alerts">${al.length ? al.map(([st, txt]) => `<span class="pd-alert">${chip(st, st === 'bad' ? 'Alert' : st === 'missing' ? 'Missing' : 'In review')}<span>${esc(txt)}</span></span>`).join('') : '<span class="co-subtle">None</span>'}</td></tr>`)));

  // ---- EUDR (P1) -------------------------------------------------------------------------------------------------
  if (P1) {
    const n = p.lots.length, ok = p.lots.filter((l) => l.state === 'ok').length, alert = p.lots.filter((l) => l.state === 'bad').length, rest = n - ok - alert;
    const sumTxt = [`${n} lot${n === 1 ? '' : 's'}`, `${ok} in conformity`].concat(alert ? [`${alert} with a parcel on alert`] : []).concat(rest ? [`${rest} pending`] : []).join(', ');
    html += card('eudr', 'Deforestation · EUDR', 'Shown because the triage marks it as an EUDR commodity (P1).', 'EUDR', `
      <dl class="pd-grid">${kv('Commodity', esc(c.commodity))}${kv('Country of production', regionsTxt.map(esc).join('<br>'))}
        ${kv('Risk level', `<span class="chip is-mid">Standard risk</span>`)}</dl>
      ${sub('Lots and parcels')}<p class="pd-sum">${sumTxt}. <span class="co-subtle">Kept with the shipments (F5) and parcels (F4); summed up here.</span></p>
      ${tbl(['Lot', 'Origin parcel', 'Region', 'Status'], p.lots.map((l) => `<tr data-go="my-company.html?filled#shipments"><td><span class="n">${l.code}</span></td><td>${esc(l.parcel)}</td><td>${esc(l.region)}</td><td>${chip(l.state, l.state === 'bad' ? 'Parcel on alert' : l.state === 'ok' ? 'In conformity' : l.state === 'missing' ? 'Parcel missing' : 'In review')}</td></tr>`))}
      ${sub('Legality checklist')}<p class="co-subtle pd-sub-p">The eight areas of law of the country of production (P07). Each has a document or a justification.</p>
      ${tbl(['Area', 'Evidence', 'Status'], legal.map((l) => `<tr><td><span class="n">${esc(l.dom)}</span></td><td>${l.st === 'missing' ? '<span class="co-subtle">Nothing yet</span>' : `${l.just ? '<span class="pd-just">Justification</span>' : ''}${esc(l.ev)}`}</td><td>${chip(l.st)}</td></tr>`))}`);
  }

  // ---- forced labour (always; reinforced on P2) -------------------------------------------------------------
  html += card('flr', 'Forced labour · FLR', P2 ? 'Reinforced check: the triage flags a risk input or region of origin (P2).' : 'Always shown. Standard check: no risk input or region flagged (P2).', 'FLR', `
    <dl class="pd-grid">${kv('Risk inputs', f.inputs.map(esc).join(', '))}${kv('Regions of origin', regionsTxt.map(esc).join('<br>'))}</dl>
    ${sub('Supplier tree, down to the raw material')}<ul class="pd-tree">${tree(p.tree)}</ul>
    ${sub('Audits')}${tbl(['Audit', 'Where', 'When', 'Status'], f.audits.map(([a, w, d, st]) => `<tr><td><span class="n">${esc(a)}</span></td><td>${esc(w)}</td><td>${esc(d)}</td><td>${chip(st, st === 'ok' ? 'Passed' : st === 'missing' ? 'Not done yet' : 'In review')}</td></tr>`))}
    ${P2 || f.alerts.length ? `<div class="pd-two">
      <div><span class="res-k">Alerts found</span>${f.alerts.length ? list(f.alerts.map((a) => `<span class="pd-no">${ICO.bad}</span>${esc(a)}`), 'is-flat') : '<p class="co-subtle">None found.</p>'}</div>
      <div><span class="res-k">Actions taken</span>${f.actions.length ? list(f.actions.map(esc), 'is-ok') : '<p class="co-subtle">None needed yet.</p>'}</div></div>` : `<div><span class="res-k">Actions taken</span>${list(f.actions.map(esc), 'is-ok')}</div>`}`, P2 ? 'Reinforced' : '');

  // ---- packaging (P4) ------------------------------------------------------------------------------------------
  if (P4) html += card('ppwr', 'Packaging · PPWR', 'Shown because it is placed on the EU market packed (P4). Each format is kept once (F3) and shared by every product that uses it.', 'PPWR',
    tbl(['Format', 'Description', 'Status'], p.pack.map(([code, name, st]) => `<tr><td><span class="n">${code}</span></td><td>${esc(name)}</td><td>${chip(st, st === 'ok' ? 'Compliant' : st === 'missing' ? 'Sheet missing' : 'In review')}</td></tr>`)));

  // ---- company documents (inherited) ---------------------------------------------------------------------------
  html += card('docs', 'Company documents', 'Uploaded once at company level and inherited by every product. They count towards this product with no new upload.', null,
    tbl(['Document', 'Counts towards', 'Valid', 'Status'], docs.map((d) => `<tr data-go="company-details.html"><td><span class="n">${esc(d.name)}</span></td><td>${d.for}</td><td>${esc(d.until)}</td><td>${chip(d.state, d.state === 'ok' ? 'Valid' : 'In review')}</td></tr>`)));

  // ---- the result ---------------------------------------------------------------------------------------------------
  const reqs = gaps.filter((g) => !/^You/.test(g.who));
  const mine = gaps.filter((g) => /^You/.test(g.who));
  const day = (n) => { const d = new Date(Date.now() - n * 864e5); return `${d.getDate()} ${d.toLocaleString('en', { month: 'short' })}`; };
  html += card('result', 'Result', 'What all of the above adds up to.', null, `
    <div class="pd-res">${REGS.map(([k, l]) => `<div class="pd-res-r"><span>${l}</span>${meter(pct(k))}<b>${pct(k)}%</b></div>`).join('')}</div>
    ${sub(`Gaps <span class="res-n">${gaps.length}</span>`)}${gaps.length ? `<ul class="pd-gaps">${gaps.map((g) => `<li><span class="pd-gap-t">${esc(g.what)}</span><span class="pd-gap-m">${chip(g.state)}<span class="co-subtle">${g.reg} · ${esc(g.who)}</span></span></li>`).join('')}</ul>` : '<p class="co-subtle">No gaps. Everything that applies to this product is met.</p>'}
    ${sub(`Requests to suppliers <span class="res-n">${reqs.length}</span>`)}${reqs.length ? `<p class="co-subtle pd-sub-p">Sent automatically for every gap a supplier has to close.${mine.length ? ` The other ${mine.length} ${mine.length === 1 ? 'is' : 'are'} yours.` : ''}</p>
      <ul class="pd-gaps">${reqs.map((g, i) => { const late = g.state === 'bad' || i % 3 === 2;
        return `<li><span class="pd-gap-t">${esc(g.what)}<span class="co-subtle">To ${esc(g.who)} · sent ${day(late ? 16 : 3 + i)}</span></span><span class="pd-gap-m">${late ? '<span class="chip is-bad">Overdue</span>' : '<span class="chip is-you">Awaiting reply</span>'}<button type="button" class="btn btn-quiet btn-sm" data-remind>Send reminder</button></span></li>`; }).join('')}</ul>` : '<p class="co-subtle">None open.</p>'}`);

  $('pd-wrap').innerHTML = html;

  // rows that live elsewhere open there; a reminder is sent once
  $('pd-wrap').querySelectorAll('tr[data-go]').forEach((tr) => {
    tr.tabIndex = 0; tr.setAttribute('role', 'link');
    const go = () => { location.href = tr.dataset.go; };
    tr.addEventListener('click', go);
    tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  });
  $('pd-wrap').querySelectorAll('[data-remind]').forEach((b) => b.addEventListener('click', () => { b.textContent = 'Reminder sent'; b.disabled = true; }));
})();
