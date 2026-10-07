/* Handing documents to ALMA for the ESG Questionnaire: pick them (from the computer, or from
   what is already in Documents), let her check each one's validity date, sort out anything
   expired, and hand them over. Prototype: nothing leaves the machine; the dates come from the
   demo's own table, and a file it does not know is taken as current. */
window.ESG_UPLOAD = (() => {
  const D = (window.ESG_DATA && ESG_DATA.docs) || { library: [], seed: [], valid: {}, where: {} };
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const TYPES = ['pdf', 'xlsx', 'docx', 'txt', 'jpg', 'jpeg', 'png'];
  const MAX = 10 * 1024 * 1024;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const size = (b) => (b < 1000000 ? Math.max(1, Math.round(b / 1000)) + ' KB' : (b / 1000000).toFixed(1) + ' MB');
  const pretty = (d) => d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  const ext = (n) => (n.split('.').pop() || '').toLowerCase();
  const until = (d) => { const iso = d.until || D.valid[d.name]; return iso ? new Date(iso + 'T23:59:59') : null; };
  const expired = (d) => !d.na && !d.checking && !!until(d) && until(d).getTime() < Date.now();
  const ICON = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  };
  // how far she trusts what she read off each one
  const confOf = (d) => {
    if (d.source === 'library') return ['From Documents', '', 'Already in your Documents — I read this one when it was added.'];
    if (/^(jpe?g|png)$/.test(ext(d.name))) return ['Low confidence', 'is-low', 'An image rather than text — read by OCR, so worth a check.'];
    if (d.until) return ['Medium confidence', 'is-mid', 'The date on this one came from you, not from the document.'];
    if (!D.valid[d.name]) return ['Low confidence', 'is-low', 'No validity date found in the file itself.'];
    if (/^(xlsx|txt)$/.test(ext(d.name))) return ['Medium confidence', 'is-mid', 'A spreadsheet: the figures read cleanly, the wording less so.'];
    return ['High confidence', 'is-ok', 'Text read cleanly, and the document carries its own validity date.'];
  };

  let picked = [], stage = 'pick', seeded = false, onHand = null, lastFocus = null, uid = 0, editing = null;
  const open = new Set();
  const el = document.createElement('div');
  el.className = 'dlg dlg-wide'; el.id = 'up-dlg'; el.hidden = true;
  el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'up-h');
  el.innerHTML = `<div class="dlg-scrim" data-close></div><div class="dlg-card">
    <button type="button" class="dlg-x" data-close aria-label="Close">${ICON.x}</button>
    <div class="dlg-head is-row"><span class="dlg-alma" id="up-alma" aria-hidden="true">${ESG.SPHERES}</span><div class="dlg-head-t"><span class="eyebrow">ALMA</span><h2 id="up-h"></h2><p id="up-p"></p></div></div>
    <div class="dlg-body" id="up-body"></div><div class="dlg-foot" id="up-foot"></div></div>
    <input type="file" id="up-file" multiple hidden accept=".pdf,.xlsx,.docx,.txt,.jpg,.jpeg,.png">`;
  document.body.appendChild(el);
  const $ = (s) => el.querySelector(s);
  const file = $('#up-file');

  const add = (files, fromVerdict) => {
    [...files].forEach((f) => {
      if (picked.some((p) => p.name === f.name && p.size === f.size)) return;
      const d = { id: ++uid, name: f.name, size: f.size, source: 'files' };
      if (!TYPES.includes(ext(f.name))) d.bad = 'Unsupported format — use PDF, XLSX, DOCX, TXT, JPG or PNG.';
      else if (f.size > MAX) d.bad = 'This file is larger than 10 MB.';
      if (fromVerdict && !d.bad) { d.checking = true; d.added = true; setTimeout(() => { d.checking = false; render(); }, 1600); }
      picked.push(d);
    });
  };
  const fromLib = (name) => {
    const l = D.library.find((x) => x.name === name); if (!l) return;
    if (picked.some((p) => p.name === name)) return;
    picked.push({ id: ++uid, name: l.name, size: l.size, source: 'library' });
  };
  const good = () => picked.filter((d) => !d.bad);
  const readable = () => good().filter((d) => !d.na && !d.checking && !expired(d));

  // ---- picking ----------------------------------------------------------------------------
  const rowPick = (d) => `<div class="up-row${d.bad ? ' is-bad' : ''}"><span class="up-ico">${ICON.doc}</span>
    <span class="up-name"><b>${esc(d.name)}</b><small>${d.bad ? esc(d.bad) : size(d.size) + (d.source === 'library' ? ' · From Documents' : '')}</small></span>
    <button type="button" class="up-rm" data-rm="${d.id}" aria-label="Remove ${esc(d.name)}">${ICON.x}</button></div>`;
  const pickStage = () => {
    $('#up-h').textContent = 'Let me fill in your questionnaire';
    $('#up-p').textContent = 'Give me your company’s policy documents and I’ll find the answers in them. You review every one before anything is submitted.';
    $('#up-alma').classList.remove('is-reading');
    const n = good().length;
    $('#up-body').innerHTML = `<div class="up-pick">
        <div><span class="up-k">From your computer</span>
          <div class="up-zone" id="up-zone" role="button" tabindex="0" aria-label="Drag your documents here, or press to browse your computer">${ICON.up}<span class="up-zone-t"><b>Drag your documents here</b><span>or <u>browse your computer</u></span><small>PDF, XLSX, DOCX, TXT, JPG, PNG<br>Up to 10 MB each</small></span></div></div>
        <span class="up-or">or</span>
        <div class="up-lib"><span class="up-k" id="up-q-k">From your Documents</span><label class="co-search">${ICON.search}<input type="search" id="up-q" autocomplete="off" placeholder="Search by file name" aria-labelledby="up-q-k"></label>
          <div class="up-results" id="up-res" hidden></div><p>Everything you have already added to C&#8209;MORE is in Documents. Pick from there and nothing needs uploading again.</p></div>
      </div>
      <div class="up-sec"><span class="up-k">Selected</span>${picked.length ? `<div class="up-list">${picked.map(rowPick).join('')}</div>` : '<p class="co-subtle" style="font-size:.9375rem">Nothing selected yet.</p>'}</div>
      <details class="up-help"><summary>What helps me most ${ICON.chev}</summary><div class="up-help-in">
        Send documents that contain the information you’re answering about — not just cover pages or table-of-contents summaries. The most useful are usually:
        <ul><li><b>Health, safety &amp; environment</b> policies, manuals and risk assessments</li><li><b>Ethics &amp; compliance</b>: code of conduct, anti-corruption, whistleblowing</li><li><b>Insurance &amp; safety record</b>: certificates of insurance, liability</li>
        <li><b>Company records</b>: registration, financial statements</li><li><b>Quality &amp; certifications</b>: quality manual, ISO certificates, licences</li><li><b>Training &amp; people</b>: training matrices, org charts, handbooks</li></ul>
        <p class="up-tip">Descriptive file names help me match each document to the right questions.</p></div></details>`;
    $('#up-foot').innerHTML = `<span class="dlg-note" aria-live="polite">${n ? `<b>${n}</b> document${n === 1 ? '' : 's'} ready to check` : 'Nothing selected yet'}</span>
      <button type="button" class="btn btn-quiet btn-sm" data-close>Cancel</button><button type="button" class="btn btn-primary btn-sm" id="up-verify"${n ? '' : ' disabled'}>Verify files</button>`;
    const zone = $('#up-zone'), q = $('#up-q');
    zone.addEventListener('click', () => { file.value = ''; file.click(); });
    zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); zone.click(); } });
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('is-over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-over'));
    zone.addEventListener('drop', (e) => { e.preventDefault(); add(e.dataTransfer.files); render(); });
    const search = () => {
      const t = q.value.trim().toLowerCase(), res = $('#up-res');
      if (!t) { res.hidden = true; return; }
      const hits = D.library.filter((l) => l.name.toLowerCase().includes(t)).slice(0, 8);
      res.hidden = false;
      res.innerHTML = hits.length ? hits.map((l) => {
        const i = l.name.toLowerCase().indexOf(t), on = picked.some((p) => p.name === l.name);
        const nm = esc(l.name.slice(0, i)) + '<mark>' + esc(l.name.slice(i, i + t.length)) + '</mark>' + esc(l.name.slice(i + t.length));
        return `<div class="up-res"><span class="up-res-t"><b>${nm}</b><small>Documents · ${size(l.size)} · added ${esc(l.added)}</small></span>
          <button type="button" class="btn btn-quiet btn-sm" data-lib="${esc(l.name)}"${on ? ' disabled' : ''}>${on ? 'Selected' : 'Add'}</button></div>`;
      }).join('') : '<div class="up-none">No results found</div>';
    };
    q.addEventListener('input', search);
    $('#up-res').addEventListener('click', (e) => {
      const b = e.target.closest('[data-lib]'); if (!b) return;
      fromLib(b.dataset.lib); const v = q.value; render(); const q2 = $('#up-q'); q2.value = v; q2.dispatchEvent(new Event('input')); q2.focus();
    });
    $('#up-verify').addEventListener('click', check);
  };

  // ---- checking ---------------------------------------------------------------------------
  let timers = [];
  const check = () => {
    picked = picked.filter((d) => !d.bad);
    stage = 'check'; open.clear(); editing = null;
    $('#up-h').textContent = 'Checking your documents';
    $('#up-p').textContent = 'Every document has a shelf life — I make sure each one is still in force before I answer anything from it.';
    $('#up-alma').classList.add('is-reading');
    $('#up-body').innerHTML = '';
    $('#up-foot').innerHTML = '';
    const wrap = document.createElement('div'); wrap.className = 'up-check';
    wrap.innerHTML = '<small id="up-now" aria-live="polite">Reading the validity dates…</small><div class="up-bar is-busy"><i id="up-bar"></i></div>';
    $('#up-body').after(wrap); $('#up-body').hidden = true;
    const list = good();
    list.forEach((d, i) => timers.push(setTimeout(() => {
      $('#up-now').textContent = 'Checking ' + d.name;
      $('#up-bar').style.width = Math.round(((i + 1) / list.length) * 100) + '%';
    }, 500 + 850 * i)));
    timers.push(setTimeout(() => { wrap.remove(); $('#up-body').hidden = false; stage = 'verdict'; render(); }, 500 + 850 * list.length + 480));
  };

  // ---- the verdict ------------------------------------------------------------------------
  const where = (d) => {
    if (d.until) return { k: 'Set by you', q: 'This date was entered on this screen. The document itself gives no validity date, or the one it gives was superseded.' };
    const w = D.where[d.name];
    if (w) return { k: w.loc, q: '“' + w.quote + '”' };
    if (D.valid[d.name]) return { k: 'Document control', q: 'Valid to ' + pretty(until(d)) + '.' };
    return { k: 'Nothing found', q: 'I could not find a validity date in this file. Give it one, or set it aside as not applicable.' };
  };
  const dateChip = (d) => {
    if (d.checking) return '<span class="chip">Checking…</span>';
    if (d.na) return '<span class="chip">Not applicable</span>';
    const u = until(d);
    if (!u) return `<button type="button" class="chip" data-date="${d.id}">No date found</button>`;
    return expired(d) ? `<button type="button" class="chip is-bad" data-date="${d.id}" title="Give it a new date">Expired ${pretty(u)}</button>`
      : `<button type="button" class="chip" data-date="${d.id}" title="Change the date">Valid to ${pretty(u)}</button>`;
  };
  const rowVerdict = (d) => {
    if (d.bad) return rowPick(d);
    const [ct, cc, tip] = confOf(d), w = where(d), on = open.has(d.id), u = until(d);
    const meta = [size(d.size)].concat(d.source === 'library' ? ['From Documents'] : [], d.added ? ['just added'] : [], d.until ? ['date changed'] : []).join(' · ');
    const say = expired(d) ? '<span class="vd-say">This document seems to have expired.</span>' : d.na ? '<span class="vd-say">Set aside — I won’t read this one.</span>' : '';
    const iso = u ? u.toISOString().slice(0, 10) : '';
    return `<div class="vd-row${expired(d) ? ' is-expired' : ''}${d.na ? ' is-na' : ''}"><div class="vd-main"><span class="up-ico">${ICON.doc}</span>
      <span class="up-name"><b>${esc(d.name)}</b><small><span>${meta}</span>${say}${d.checking ? '' : `<button type="button" class="vd-more" data-more="${d.id}" aria-expanded="${on}">${on ? 'Hide details' : 'View details'}</button>`}</small></span>
      <span class="vd-chips">${d.checking ? '' : `<span class="chip ${cc}" title="${esc(tip)}">${ct}</span>`}${dateChip(d)}</span>
      <button type="button" class="up-rm" data-rm="${d.id}" aria-label="Remove ${esc(d.name)}"${d.checking ? ' disabled' : ''}>${ICON.x}</button></div>
      <div class="vd-detail"${on ? '' : ' hidden'}><div class="vd-where"><b>${esc(d.name)}</b><span>${esc(w.k)}</span></div><p class="vd-quote">${esc(w.q)}</p>
        <div class="vd-acts">${editing === d.id ? `<label class="vd-na">New expiry date <input type="date" data-iso="${d.id}" value="${iso}"></label>` : `<button type="button" class="link-btn" data-date="${d.id}">Change the expiry date</button>`}
        <label class="vd-na"><input type="checkbox" data-na="${d.id}"${d.na ? ' checked' : ''}> Not applicable</label></div></div></div>`;
  };
  const verdictStage = () => {
    const docs = good();
    if (!docs.length) { stage = 'pick'; return pickStage(); }
    const order = (d) => (expired(d) ? 0 : d.checking ? 1 : d.na ? 4 : d.source === 'library' ? 3 : 2);
    const list = [...picked].sort((a, b) => (a.bad ? 5 : order(a)) - (b.bad ? 5 : order(b)));
    const ex = docs.filter(expired), checking = docs.filter((d) => d.checking), na = docs.filter((d) => d.na), read = readable();
    $('#up-alma').classList.toggle('is-reading', !!checking.length);
    let h, p;
    if (checking.length) { h = 'Checking the new file' + (checking.length > 1 ? 's' : ''); p = 'Reading the validity date of ' + checking.map((d) => d.name).join(', ') + '…'; }
    else if (ex.length) {
      const one = ex.length === 1;
      h = one ? 'One of these documents has expired' : `${ex.length} of these documents have expired`;
      p = one ? 'I can’t answer from it as it is. Press the date to give it a new one if it’s still in force, or set it aside as not applicable — or take it out and add a current version.'
        : 'I can’t answer from them as they are. Press a date to give it a new one if it’s still in force, or set it aside as not applicable — or take it out and add a current version.';
    } else if (!read.length) { h = 'Nothing left for me to read'; p = 'Everything is marked not applicable, so there is nothing for me to read.'; }
    else {
      h = 'All checked — ready to read';
      p = `All ${read.length} document${read.length === 1 ? ' is' : 's are'} current` + (na.length ? `, and ${na.length} ${na.length === 1 ? 'is' : 'are'} set aside as not applicable` : '') + ' — I’m ready to read. You’ll see every answer before anything is submitted.';
    }
    $('#up-h').textContent = h; $('#up-p').textContent = p;
    $('#up-body').innerHTML = `<div class="vd-list">${list.map(rowVerdict).join('')}</div>`;
    const blocked = !!ex.length || !!checking.length || !read.length;
    $('#up-foot').innerHTML = `<span class="dlg-note">${read.length ? `<b>${read.length}</b> to read` : ''}</span>
      <button type="button" class="btn btn-quiet btn-sm" id="up-back">Back to uploads</button><button type="button" class="btn btn-quiet btn-sm" id="up-more">Add documents</button>
      <button type="button" class="btn btn-primary btn-sm" id="up-hand"${blocked ? ' disabled' : ''}>Hand to ALMA</button>`;
    $('#up-back').addEventListener('click', () => { stage = 'pick'; render(); });
    $('#up-more').addEventListener('click', () => { file.value = ''; file.click(); });
    $('#up-hand').addEventListener('click', hand);
    const inp = $('[data-iso]');
    if (inp) {
      inp.focus();
      // typed a part at a time, a date input reports every step, so it is kept when you leave it or press Enter
      let done = false;
      const commit = () => { if (done) return; done = true; const d = picked.find((x) => x.id === +inp.dataset.iso); if (inp.value && d && inp.value !== iso0) { d.until = inp.value; d.na = false; } editing = null; render(); };
      const iso0 = inp.value;
      inp.addEventListener('blur', commit);
      inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); done = true; editing = null; render(); } });
    }
  };

  const hand = () => {
    const docs = readable().map((d) => ({ name: d.name, source: d.source, until: (until(d) || '') && until(d).toISOString().slice(0, 10) }));
    if (!docs.length) return;
    close(true);
    if (onHand) onHand(docs);
  };

  const render = () => (stage === 'verdict' ? verdictStage() : stage === 'pick' ? pickStage() : null);

  // one listener for the rows, whichever stage drew them
  el.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-close]')) { close(); return; }
    const rm = t.closest('[data-rm]');
    if (rm) { picked = picked.filter((d) => d.id !== +rm.dataset.rm); open.delete(+rm.dataset.rm); render(); return; }
    const more = t.closest('[data-more]');
    if (more) { const id = +more.dataset.more; open.has(id) ? open.delete(id) : open.add(id); render(); return; }
    const dt = t.closest('[data-date]');
    if (dt) { const id = +dt.dataset.date; open.add(id); editing = id; render(); }
  });
  el.addEventListener('change', (e) => {
    const na = e.target.closest('[data-na]');
    if (na) { const d = picked.find((x) => x.id === +na.dataset.na); d.na = na.checked; editing = null; render(); }
  });
  file.addEventListener('change', () => { add(file.files, stage === 'verdict'); render(); });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll('button:not([disabled]), input:not([type="file"]):not([disabled]), summary, [tabindex="0"]')].filter((x) => x.offsetParent);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  function close() {
    timers.forEach(clearTimeout); timers = [];
    const w = el.querySelector('.up-check'); if (w) { w.remove(); $('#up-body').hidden = false; }
    el.hidden = true; document.documentElement.classList.remove('dlg-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  return {
    // seed: the demo opens with documents already picked the first time, so the flow can be walked without files to hand
    open(files, handler) {
      onHand = handler || onHand;
      if (!seeded) { seeded = true; D.seed.forEach((d) => picked.push({ id: ++uid, name: d.name, size: d.size, source: d.source === 'library' ? 'library' : 'files' })); }
      if (files && files.length) add(files);
      stage = 'pick'; lastFocus = document.activeElement;
      el.hidden = false; document.documentElement.classList.add('dlg-open');
      render();
      setTimeout(() => { const z = $('#up-zone'); if (z) z.focus({ preventScroll: true }); }, 160);
    },
  };
})();
