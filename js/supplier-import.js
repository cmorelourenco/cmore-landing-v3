/* Import suppliers from Excel (My suppliers, suppliers.html): a drawer in four steps, beside Add a
   supplier (js/supplier-add.js), whose countries, code checks and documents it shares.
   1. Your file: an .xlsx, .xls or .csv, one row per supplier (country, company code, and for a
      company not on C-MORE yet its name and a contact email). A template to download.
   2. Check: each row as Add a supplier would find it: on C-MORE (invited to your list), new (invited
      to join C-MORE), already your supplier, or something to fix. Only the first two are sent.
   3. What you need from them: one document list for all, ticked as in Add a supplier; each supplier
      is asked only for the ones that apply in its country.
   4. Review and send. Each one then shows on My suppliers as Invited.
   The file is read in the browser with SheetJS, loaded the first time it's needed. Opens from
   [data-sup-import], or on arrival with ?import. */
(() => {
  const S = window.CM_SUPPLIERS, A = window.CMSupplierAdd;
  if (!S || !A || !document.getElementById('sup-body')) return;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t == null ? '' : t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const BEATRIZ = document.documentElement.dataset.persona === 'beatriz';
  const SHEETJS = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
  let lib = null;
  const sheetjs = () => lib || (lib = new Promise((ok, no) => {
    if (window.XLSX) { ok(window.XLSX); return; }
    const s = Object.assign(document.createElement('script'), { src: SHEETJS, onload: () => ok(window.XLSX), onerror: () => { lib = null; no(new Error('load')); } });
    document.head.appendChild(s);
  }));

  // the columns, by any of the names a file might give them (in English, Portuguese, Spanish…)
  const COLS = [
    ['email', ['email', 'e mail', 'contact email', 'email address', 'correio eletronico', 'correo electronico']],
    ['contact', ['contact name', 'contact', 'contact person', 'contacto', 'nome do contacto', 'persona de contacto']],
    ['code', ['nipc', 'nif', 'tax id', 'taxid', 'tax number', 'vat', 'vat number', 'company code', 'code', 'ein', 'cnpj', 'siren', 'kvk', 'kvk number', 'partita iva', 'nip', 'company number', 'ust idnr', 'registration number', 'enterprise number', 'nipc or tax id', 'numero de contribuinte']],
    ['country', ['country', 'pais', 'land', 'pays', 'paese', 'country code']],
    ['name', ['company name', 'company', 'name', 'supplier', 'supplier name', 'empresa', 'nome', 'nome da empresa', 'razao social', 'denominacao']],
  ];
  const colOf = (h) => { const k = fold(h); if (!k) return null; const hit = COLS.find(([, l]) => l.includes(k)); return hit ? hit[0] : null; };
  const HEAD = ['Country', 'NIPC or tax ID', 'Company name', 'Contact name', 'Contact email'];
  const ALIAS = { portugal: 'PT', espana: 'ES', spain: 'ES', espanha: 'ES', france: 'FR', franca: 'FR', germany: 'DE', alemanha: 'DE', deutschland: 'DE', italy: 'IT', italia: 'IT',
    netherlands: 'NL', holanda: 'NL', 'paises baixos': 'NL', belgium: 'BE', belgica: 'BE', poland: 'PL', polonia: 'PL', 'united kingdom': 'GB', uk: 'GB', 'reino unido': 'GB',
    'united states': 'US', usa: 'US', 'estados unidos': 'US', brazil: 'BR', brasil: 'BR' };
  const countryOf = (v) => {
    const k = fold(v); if (!k) return null;
    const by = A.COUNTRIES.find((c) => fold(c.code) === k || fold(c.name) === k);
    return by ? by.code : ALIAS[k] && A.COUNTRIES.some((c) => c.code === ALIAS[k]) ? ALIAS[k] : null;
  };

  // each row, as Add a supplier would find it
  const check = (rows) => {
    const seen = {};
    return rows.map((r) => {
      const out = Object.assign({}, r, { cc: countryOf(r.country), v: A.norm(r.code), kind: 'err', issue: '' });
      if (!out.cc) { out.issue = r.country ? `We don’t know the country “${r.country}”.` : 'No country.'; return out; }
      const c = A.country(out.cc);
      out.label = c.label; out.countryName = c.name;
      if (!out.v) { out.issue = `No ${c.label}.`; return out; }
      const found = S.lookup(out.cc, out.v);
      if (found.mine) { out.kind = 'mine'; out.mine = found.mine; return out; }
      if (!c.ok(out.v)) { out.issue = `That doesn’t look like a ${c.label} from ${c.name}.`; return out; }
      const key = out.cc + out.v;
      if (seen[key]) { out.issue = `The same company as row ${seen[key]}.`; return out; }
      seen[key] = r.row;
      if (found.on) { out.kind = 'on'; out.on = found.on; return out; }
      const name = String(r.name || '').trim(), email = String(r.email || '').trim();
      if (!name) { out.issue = 'They’re not on C‑MORE yet: add their company name.'; return out; }
      if (!email) { out.issue = 'They’re not on C‑MORE yet: add a contact email for the invitation.'; return out; }
      if (!A.emailOk(email)) { out.issue = `“${email}” doesn’t look like an email address.`; return out; }
      out.kind = 'new'; return out;
    });
  };
  const nameOf = (r) => (r.on ? r.on.name : r.mine ? r.mine.name : String(r.name || '').trim());
  const sendable = () => f.rows.filter((r) => r.kind === 'on' || r.kind === 'new');

  // a sheet's rows: the first row that names at least two known columns is the header
  const fromTable = (aoa) => {
    const at = aoa.findIndex((row) => new Set(row.map(colOf).filter(Boolean)).size >= 2);
    if (at < 0) return { error: `We couldn’t find the columns. The first row should name them: ${HEAD.join(', ')}. The template has them.` };
    const map = aoa[at].map(colOf);
    if (!map.includes('country') || !map.includes('code')) return { error: 'Your file needs at least a Country and a NIPC or tax ID column. The template has them.' };
    const rows = aoa.slice(at + 1).map((cells, i) => {
      const r = { row: at + i + 2 };
      map.forEach((k, j) => { if (k && r[k] == null) r[k] = String(cells[j] == null ? '' : cells[j]).trim(); });
      return r;
    }).filter((r) => COLS.some(([k]) => r[k]));
    if (!rows.length) return { error: 'There are no suppliers in your file, only the column names.' };
    return { rows };
  };

  // Prototype: a file to try it with, the kinds of row an import meets
  const sample = () => {
    const mine = S.list().find((s) => s.status !== 'invited' && s.nipc);
    return (BEATRIZ ? [
      ['United States', '81-4472019', '', '', ''],
      ['Brazil', '33.401.288/0001-55', '', '', ''],
      ['United States', '47-1234567', 'Prairie Grain Co-op', 'Dale Hughes', 'dale@prairiegrain.test'],
      ['Colombia', '900123456', 'Café Andino S.A.S.', '', 'compras@cafeandino.test'],
      ['US', '36-4419822', 'Lakeside Mills Inc.', 'Rosa Diaz', ''],
      mine && ['United States', mine.nipc, mine.name, '', ''],
    ] : [
      ['Portugal', '503 117 285', '', '', ''],
      ['Spain', 'B36512874', '', '', ''],
      ['Portugal', '509 812 333', 'Carpintaria Lopes, Lda.', 'Ana Lopes', 'ana@carpintarialopes.test'],
      ['PT', '508 406 196', 'Vidraria Atlântica', '', 'geral@vidrariaatlantica.test'],
      ['France', '552 100 554', 'Échafaudages Durand SARL', 'Luc Durand', ''],
      ['Portugal', '123 456 780', 'Pavimentos Silva', '', 'pav.silva@mail.test'],
      ['Portugal', '503117285', 'Pinturas Ribeiro', '', ''],
      mine && ['Portugal', mine.nipc, mine.name, '', ''],
    ]).filter(Boolean);
  };

  const css = `
.si-cols { display: flex; flex-wrap: wrap; gap: 0.375rem; margin: 0; padding: 0; list-style: none; }
.si-cols li { padding: 0.25rem 0.625rem; border-radius: 999px; background: var(--color-light-beige); font-size: 0.8125rem; color: var(--color-ink); }
.si-cols li i { font-style: normal; color: var(--color-ink-subtle); }
.si-tpl { justify-self: start; }
.si-drop { display: grid; justify-items: center; gap: 0.5rem; padding: 2rem 1.25rem; border: 1.5px dashed var(--color-sand-400, #c9bfae); border-radius: 0.75rem; background: var(--color-off-white); text-align: center; cursor: pointer; transition: border-color .15s, background-color .15s; }
.si-drop:hover, .si-drop.is-over { border-color: var(--color-graphite); background: var(--color-light-beige); }
.si-drop svg { width: 1.75rem; height: 1.75rem; color: var(--color-ink-subtle); }
.si-drop b { font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.si-drop span { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.si-drop .link-btn { font-size: inherit; }
.si-err { padding: 0.75rem 1rem; border-radius: 0.625rem; background: color-mix(in oklab, var(--color-critical, #b3261e) 8%, var(--color-surface)); font-size: 0.875rem; line-height: 1.5; color: var(--color-critical, #b3261e); }
.si-demo { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.si-sum { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.625rem; }
.si-sum > div { display: grid; gap: 0.125rem; padding: 0.875rem 1rem; border-radius: 0.75rem; background: var(--color-surface); }
.si-sum b { font-size: 1.5rem; font-weight: 600; line-height: 1.1; color: var(--color-ink); }
.si-sum span { font-size: 0.8125rem; color: var(--color-ink-muted); }
.si-sum > .is-skip b { color: var(--color-ink-subtle); }
.si-sum > .is-bad b { color: var(--color-critical, #b3261e); }
.si-file { display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-size: 0.875rem; color: var(--color-ink-muted); }
.si-file b { color: var(--color-ink); font-weight: 600; overflow-wrap: anywhere; }
.si-rows { border-radius: 0.75rem; background: var(--color-surface); overflow: hidden; }
.si-rows table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.si-rows th { padding: 0.625rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); background: var(--color-light-beige); }
.si-rows td { padding: 0.6875rem 1rem; border-top: 1px solid var(--color-mid-beige); vertical-align: top; }
.si-rows td.r { width: 3.25rem; color: var(--color-ink-subtle); font-variant-numeric: tabular-nums; }
.si-rows td b { display: block; font-weight: 500; color: var(--color-ink); }
.si-rows td small { display: block; margin-top: 0.125rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.si-rows td small.is-err { color: var(--color-critical, #b3261e); }
.si-rows td.s { width: 1%; white-space: nowrap; text-align: right; }
.si-rows tr.is-skip td b { color: var(--color-ink-muted); }
.si-note { font-size: 0.8125rem; line-height: 1.5; color: var(--color-ink-subtle); }
.sa-docs small .si-only { color: var(--color-ink-muted); }`;
  const stl = document.createElement('style'); stl.textContent = css; document.head.appendChild(stl);

  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const ICO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13l2 2 4-4"/></svg>';
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 14.5v3A2.5 2.5 0 0 0 6.5 20h11a2.5 2.5 0 0 0 2.5-2.5v-3"/></svg>';
  const dw = document.createElement('div');
  dw.className = 'docd sa si'; dw.hidden = true;
  dw.innerHTML = `<div class="docd-scrim" data-si-x></div><aside class="docd-panel" role="dialog" aria-modal="true" aria-labelledby="si-t" tabindex="-1">
      <header class="docd-head"><span class="docd-ico" aria-hidden="true">${ICO}</span><div class="docd-t"><h3 id="si-t">Import suppliers</h3><p id="si-sub"></p></div>
        <button type="button" class="dlg-x" data-si-x aria-label="Close">${X}</button></header>
      <form class="docd-body" id="si-body" novalidate></form>
      <footer class="docd-foot"><span id="si-step"></span><span class="sa-acts" id="si-acts"></span></footer>
      <input type="file" id="si-file" accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv" hidden>
    </aside>`;
  document.body.appendChild(dw);
  const $ = (id) => dw.querySelector('#' + id);

  let f = null, back = null;
  const fresh = () => ({ step: 1, file: '', rows: [], err: '', busy: false, picked: null, note: '' });

  // ---- step 1: the file --------------------------------------------------------------------------
  const step1 = () => `<section class="sa-card"><h4>Your file</h4>
      <p>One row per supplier. We check every row before anything is sent: companies on C&#8209;MORE are invited to your supplier list, the others to join C&#8209;MORE.</p>
      <ul class="si-cols" aria-label="The columns"><li>Country</li><li>NIPC or tax ID</li><li>Company name <i>(if not on C&#8209;MORE)</i></li><li>Contact name <i>(optional)</i></li><li>Contact email <i>(if not on C&#8209;MORE)</i></li></ul>
      <button type="button" class="btn btn-quiet btn-sm si-tpl" data-si-tpl>Download the template</button></section>
    <section class="sa-card">
      <div class="si-drop" data-si-pick role="button" tabindex="0" aria-describedby="si-drop-d">${UP}<b>${f.busy ? `Reading ${esc(f.file)}…` : 'Drop your Excel file here'}</b><span id="si-drop-d">or <span class="link-btn">choose it on your device</span> &middot; .xlsx, .xls or .csv</span></div>
      ${f.err ? `<p class="si-err" role="alert">${esc(f.err)}</p>` : ''}
      <p class="si-demo">Prototype: <button type="button" class="link-btn" data-si-sample>try it with a sample file</button>.</p></section>`;

  // ---- step 2: each row, checked -----------------------------------------------------------------
  const BADGE = { on: ['On C‑MORE', 'b-info'], new: ['New to C‑MORE', 'b-neu'], mine: ['Already your supplier', 'b-ok'], err: ['Needs fixing', 'b-over'] };
  const step2 = () => {
    const n = (k) => f.rows.filter((r) => r.kind === k).length;
    const tile = (k, l, cls) => `<div class="${cls || ''}"><b>${n(k)}</b><span>${l}</span></div>`;
    const rows = f.rows.map((r) => {
      const [bl, bc] = BADGE[r.kind], nm = nameOf(r);
      // one already on your list, as your list has them
      const sub = r.mine ? [r.mine.city, `${S.WORDS.id} ${r.mine.nipc}`].filter(Boolean).join(' · ') : [r.countryName || r.country, r.v ? `${r.label || 'Code'} ${r.code}` : ''].filter(Boolean).join(' · ');
      const what = r.kind === 'on' ? 'Invited to your supplier list' : r.kind === 'new' ? `Invited to join C‑MORE · ${r.email}` : r.kind === 'mine' ? 'Left out: on your list already' : r.issue;
      return `<tr class="${r.kind === 'mine' || r.kind === 'err' ? 'is-skip' : ''}"><td class="r">${r.row}</td><td><b>${esc(nm || 'No company name')}</b><small>${esc(sub)}</small><small${r.kind === 'err' ? ' class="is-err"' : ''}>${esc(what)}</small></td><td class="s"><span class="co-badge ${bc}">${bl}</span></td></tr>`;
    }).join('');
    const skip = n('mine') + n('err');
    return `<section class="sa-card"><div class="si-file"><span>From <b>${esc(f.file)}</b> &middot; ${f.rows.length} row${f.rows.length === 1 ? '' : 's'}</span><button type="button" class="link-btn" data-si-again>Use another file</button></div></section>
      <div class="si-sum">${tile('on', 'On C‑MORE: invited to your supplier list')}${tile('new', 'New: invited to join C‑MORE')}${tile('mine', 'Already your suppliers: left out', 'is-skip')}${tile('err', 'Need fixing: left out', n('err') ? 'is-bad' : 'is-skip')}</div>
      <div class="si-rows"><table><thead><tr><th>Row</th><th>Supplier</th><th><span class="sr-only">Result</span></th></tr></thead><tbody>${rows}</tbody></table></div>
      ${skip ? `<p class="si-note">${n('err') ? 'Fix the rows that need it in your file and upload it again, or add those suppliers one by one later. ' : ''}${sendable().length ? `The other ${sendable().length} can go now.` : 'There&rsquo;s no one to invite from this file.'}</p>` : ''}`;
  };

  // ---- step 3: the documents, one list for all ---------------------------------------------------
  // what any of them can be asked for: mandatory where it's mandatory in a supplier's own country,
  // and each one only asked of the suppliers in a country it applies to
  const docs = () => {
    const ccs = [...new Set(sendable().map((r) => r.cc))], byCode = new Map();
    ccs.forEach((cc) => A.docsOf(cc).forEach((d) => {
      const x = byCode.get(d.code) || Object.assign({}, d, { req: false, ccs: [] });
      if (d.req) { x.req = true; x.section = 'Mandatory'; x.home = d.home; }
      x.ccs.push(cc); byCode.set(d.code, x);
    }));
    const all = [...byCode.values()];
    return all.filter((d) => d.req).concat(all.filter((d) => !d.req)).map((d) => Object.assign(d, { only: d.ccs.length < ccs.length ? d.ccs : null }));
  };
  const groups = (list) => list.reduce((g, d) => { (g[d.section] = g[d.section] || []).push(d); return g; }, {});
  const onlyIn = (d) => (d.only ? ` &middot; <span class="si-only">only for suppliers in ${d.only.map((cc) => esc(A.country(cc).name)).join(', ')}</span>` : '');
  const step3 = () => {
    const list = docs(), g = groups(list), n = list.filter((d) => f.picked.has(d.code)).length, k = sendable().length;
    return `<section class="sa-card"><h4>What you need from them</h4><p>The documents these ${k} supplier${k === 1 ? '' : 's'} will be asked to share with you. The mandatory ones are ticked; add any of the optional ones you need. Each supplier is asked only for the ones that apply in their country.</p></section>
      <div class="sa-all"><label class="sa-ck"><input type="checkbox" data-all${n === list.length ? ' checked' : ''}>Select all</label><span><b id="si-n">${n}</b> of ${list.length} selected</span></div>
      ${Object.entries(g).map(([sec, l]) => { const c = l.filter((d) => f.picked.has(d.code)).length; return `<section class="sa-grp"><div class="sa-grp-h"><label class="sa-ck"><input type="checkbox" data-sec="${esc(sec)}"${c === l.length ? ' checked' : ''}>${esc(sec)}</label><span>${c} of ${l.length}</span></div>
        <ul class="sa-docs">${l.map((d) => `<li><label><input type="checkbox" data-doc="${esc(d.code)}"${f.picked.has(d.code) ? ' checked' : ''}><span><b>${esc(d.name)}</b><small>${esc(d.code)}${d.req ? ' &middot; Mandatory' : ' &middot; Optional'}${onlyIn(d)}</small></span></label></li>`).join('')}</ul></section>`; }).join('')}`;
  };
  const marks = () => {
    const list = docs(), g = groups(list);
    dw.querySelectorAll('[data-sec]').forEach((b) => { const l = g[b.dataset.sec], k = l.filter((d) => f.picked.has(d.code)).length; b.checked = k === l.length; b.indeterminate = k > 0 && k < l.length; b.closest('.sa-grp-h').querySelector('span').textContent = `${k} of ${l.length}`; });
    const all = dw.querySelector('[data-all]'), n = list.filter((d) => f.picked.has(d.code)).length;
    if (all) { all.checked = n === list.length; all.indeterminate = n > 0 && n < list.length; }
    if ($('si-n')) $('si-n').textContent = n;
    acts();
  };

  // ---- step 4: review and send -------------------------------------------------------------------
  const asked = (r) => A.docsOf(r.cc).filter((d) => f.picked.has(d.code));
  const step4 = () => {
    const go = sendable(), on = go.filter((r) => r.kind === 'on').length, list = docs().filter((d) => f.picked.has(d.code));
    const per = go.map((r) => asked(r).length), lo = Math.min(...per), hi = Math.max(...per);
    return `<section class="sa-card"><h4>Review and send</h4><dl class="sa-sum">
        <div><dt>Suppliers</dt><dd>${go.length} invitation${go.length === 1 ? '' : 's'}<small>${on} to your supplier list (on C&#8209;MORE), ${go.length - on} to join C&#8209;MORE</small></dd></div>
        <div><dt>Documents</dt><dd>${lo === hi ? `${lo} asked of each` : `${lo} to ${hi} asked of each, by country`}<small>${list.map((d) => esc(d.name)).join(', ')}</small></dd></div>
        <div><dt>Left out</dt><dd>${f.rows.length - go.length} row${f.rows.length - go.length === 1 ? '' : 's'}<small>Already your suppliers, or rows that need fixing</small></dd></div>
      </dl></section>
      <section class="sa-card"><label class="sa-f"><span>A note for them <i>(optional)</i></span><textarea class="sa-in" name="note" rows="3" placeholder="Why you&rsquo;re asking, or what it&rsquo;s for">${esc(f.note)}</textarea><small>Every invitation carries it.</small></label></section>`;
  };

  const STEPS = ['Your file', 'Check', 'Documents', 'Review'];
  const acts = () => {
    const k = f.step > 1 ? sendable().length : 0;
    const backB = f.step > 1 ? '<button type="button" class="link-btn" data-si-back>Back</button>' : '';
    const main = f.step === 1 ? '' : f.step === 2 ? `<button type="button" class="btn btn-primary btn-sm" data-si-next${k ? '' : ' disabled'}>Continue with ${k}</button>`
      : f.step === 3 ? `<button type="button" class="btn btn-primary btn-sm" data-si-next${f.picked.size ? '' : ' disabled'}>Continue</button>`
      : `<button type="button" class="btn btn-primary btn-sm" data-si-send>Send ${k} invitation${k === 1 ? '' : 's'}</button>`;
    $('si-acts').innerHTML = backB + main;
    $('si-step').textContent = `Step ${f.step} of 4 · ${STEPS[f.step - 1]}`;
  };
  const paint = (focus) => {
    $('si-sub').textContent = f.step === 1 ? 'Many suppliers at once, from an Excel file' : `${f.file}`;
    $('si-body').innerHTML = [step1, step2, step3, step4][f.step - 1]();
    if (f.step === 3) marks(); else acts();
    $('si-body').scrollTop = 0;
    if (focus) { const el = dw.querySelector(focus); if (el) el.focus(); }
  };

  const take = (name, aoa) => {
    const r = fromTable(aoa);
    f.busy = false;
    if (r.error) { f.err = r.error; paint(); return; }
    f.file = name; f.err = ''; f.rows = check(r.rows); f.picked = null; f.step = 2; paint();
  };
  const load = async (file) => {
    if (!file || !f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) { f.err = 'That isn’t an Excel file. Use an .xlsx, .xls or .csv file.'; paint(); return; }
    f.busy = true; f.file = file.name; f.err = ''; paint();
    try {
      const X = await sheetjs(), wb = X.read(await file.arrayBuffer(), { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      take(file.name, X.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }));
    } catch (e) {
      f.busy = false; f.err = e.message === 'load' ? 'We couldn’t open the Excel reader. Check your connection and try again.' : 'We couldn’t read that file. Save it as .xlsx and try again.'; paint();
    }
  };
  const template = async (b) => {
    b.disabled = true;
    try {
      const X = await sheetjs(), wb = X.utils.book_new();
      const ws = X.utils.aoa_to_sheet([HEAD]);
      ws['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 32 }, { wch: 24 }, { wch: 32 }];
      X.utils.book_append_sheet(wb, ws, 'Suppliers');
      const how = X.utils.aoa_to_sheet([['How to fill it in'], [],
        ['One row per supplier, under the column names in the Suppliers sheet.'],
        ['Country: the country’s name or its two-letter code (PT, ES, US…).'],
        ['NIPC or tax ID: their company code in their country (NIPC in Portugal, NIF in Spain, EIN in the US…). Keep the cells as text so no leading zero is lost.'],
        ['Company name and Contact email: needed when they’re not on C-MORE yet, so we can invite them to join.'],
        ['Contact name: optional.'], [],
        ['You choose the documents to ask them for after uploading the file, on C-MORE.']]);
      how['!cols'] = [{ wch: 110 }];
      X.utils.book_append_sheet(wb, how, 'How to fill it in');
      X.writeFile(wb, 'C-MORE suppliers template.xlsx');
    } catch (e) { A.toast('We couldn’t make the template. Check your connection and try again.'); }
    b.disabled = false;
  };

  const open = () => {
    f = fresh(); back = document.activeElement;
    dw.hidden = false; document.documentElement.style.overflow = 'hidden'; paint();
    setTimeout(() => dw.classList.add('is-open'), 20);
    setTimeout(() => { const d = dw.querySelector('[data-si-pick]'); if (d) d.focus(); }, 340);
  };
  const close = () => {
    dw.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { dw.hidden = true; }, 280); if (back && back.isConnected) back.focus(); f = null;
  };
  const send = () => {
    const go = sendable(), today = A.today(), note = f.note.trim();
    go.forEach((r, i) => {
      const c = A.country(r.cc), list = asked(r), name = nameOf(r);
      S.addInvite({
        id: `${S.slug(name)}-${(Date.now() + i).toString(36).slice(-4)}`, name, city: r.on ? r.on.city : '', services: r.on ? r.on.services : [],
        country: c.code, countryName: c.name, idLabel: c.label, code: r.code, email: r.on ? '' : r.email.trim(), contact: r.on ? '' : String(r.contact || '').trim(),
        onCmore: !!r.on, invited: today, note, imported: f.file,
        docs: list.map((d) => d.code), required: list.filter((d) => d.req).map((d) => d.code),
        names: Object.fromEntries(list.map((d) => [d.code, d.name])), sections: Object.fromEntries(list.map((d) => [d.code, d.home || d.section])),
      });
    });
    const on = go.filter((r) => r.kind === 'on').length;
    close();
    if (window.CMSupPage) window.CMSupPage.refresh();
    A.toast(`${go.length} supplier${go.length === 1 ? '' : 's'} invited: ${on} to your supplier list, ${go.length - on} to join C‑MORE.`);
  };

  dw.addEventListener('click', (e) => {
    if (!f) return;
    if (e.target.closest('[data-si-x]')) { close(); return; }
    if (e.target.closest('[data-si-tpl]')) { template(e.target.closest('[data-si-tpl]')); return; }
    if (e.target.closest('[data-si-sample]')) { take(BEATRIZ ? 'Sample suppliers (US).xlsx' : 'Sample suppliers.xlsx', [HEAD].concat(sample())); return; }
    if (e.target.closest('[data-si-pick]') && !f.busy) { $('si-file').value = ''; $('si-file').click(); return; }
    if (e.target.closest('[data-si-again]')) { f.step = 1; f.err = ''; paint('[data-si-pick]'); return; }
    if (e.target.closest('[data-si-back]')) { f.step -= 1; paint(); return; }
    if (e.target.closest('[data-si-next]')) {
      if (f.step === 2 && !f.picked) f.picked = new Set(docs().filter((d) => d.req).map((d) => d.code));
      f.step += 1; paint(); return;
    }
    if (e.target.closest('[data-si-send]')) send();
  });
  $('si-file').addEventListener('change', (e) => load(e.target.files[0]));
  dw.addEventListener('change', (e) => {
    if (!f) return;
    const t = e.target;
    if (t.matches('[data-doc]')) { f.picked[t.checked ? 'add' : 'delete'](t.dataset.doc); marks(); return; }
    if (t.matches('[data-sec]')) { groups(docs())[t.dataset.sec].forEach((d) => f.picked[t.checked ? 'add' : 'delete'](d.code)); dw.querySelectorAll('[data-doc]').forEach((b) => { b.checked = f.picked.has(b.dataset.doc); }); marks(); return; }
    if (t.matches('[data-all]')) { docs().forEach((d) => f.picked[t.checked ? 'add' : 'delete'](d.code)); dw.querySelectorAll('[data-doc]').forEach((b) => { b.checked = t.checked; }); marks(); }
  });
  dw.addEventListener('input', (e) => { if (f && e.target.name === 'note') f.note = e.target.value; });
  dw.addEventListener('keydown', (e) => {
    if (!f) return;
    if (e.key === 'Escape') { close(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-si-pick]')) { e.preventDefault(); e.target.click(); }
  });
  // a file dropped on the drop area
  dw.addEventListener('dragover', (e) => { const d = e.target.closest('[data-si-pick]'); if (!d) return; e.preventDefault(); d.classList.add('is-over'); });
  dw.addEventListener('dragleave', (e) => { const d = e.target.closest('[data-si-pick]'); if (d && !d.contains(e.relatedTarget)) d.classList.remove('is-over'); });
  dw.addEventListener('drop', (e) => { const d = e.target.closest('[data-si-pick]'); if (!d) return; e.preventDefault(); d.classList.remove('is-over'); if (!f.busy) load(e.dataTransfer.files[0]); });

  // from Add a supplier, it takes that drawer's place
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-sup-import]')) return;
    e.preventDefault();
    const from = e.target.closest('.sa:not(.si)');
    if (from) { from.querySelector('[data-sa-x]').click(); setTimeout(open, 300); } else open();
  });
  window.CMSupplierImport = { open, load };
  if (new URLSearchParams(location.search).has('import')) { history.replaceState(null, '', location.pathname); setTimeout(open, 150); }
})();
