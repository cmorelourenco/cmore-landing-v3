/* The ESG Questionnaire page. Nine sections of question cards, built from js/esg-data.js;
   answers kept by js/esg-state.js so they survive moving between pages. ALMA sits above the
   questions: hand her documents (js/esg-upload.js) and she reads them, answers what they
   cover, and leaves the rest to you with a reason. Her answers say how sure she is and where
   she read them; the ones she was unsure of wait for you to approve or turn down. When
   everything has an answer and nothing is waiting on you, it can be submitted. */
(() => {
  const DATA = window.ESG_DATA; if (!DATA) return;
  let s = ESG.load();
  const main = document.querySelector('.set-main');
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const Q = {}; // key -> question (top-level and follow-ups)
  const ICON = {
    note: '<path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"/>',
    clip: '<path d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"/>',
    assign: '<path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/>',
    info: '<path d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
  const tool = (k, label) => `<button type="button" class="esgq-tool" aria-label="${label}" title="${label}">${svg(k)}</button>`;
  const CONF = { high: ['High confidence', 'is-ok', 'The documents state this directly.'], medium: ['Medium confidence', 'is-mid', 'Reasonably evidenced — worth a glance.'], low: ['Low confidence', 'is-low', 'Thin evidence — please check this answer.'] };

  // ---- building the cards ---------------------------------------------------------------------
  const field = (q, key) => {
    if (q.ty === 'choice') return `<div class="esgq-ans" role="radiogroup" aria-labelledby="${key}-t">`
      + q.opts.map(([v, l]) => `<label class="esgq-radio"><input type="radio" name="${key}" value="${esc(v)}"><span>${esc(l)}</span></label>`).join('') + '</div>';
    const pad = q.val === 'count' || q.val === 'year' ? ' inputmode="numeric"' : '';
    return `<div class="esgq-field"><textarea class="input" rows="1" data-for="${key}"${pad} aria-labelledby="${key}-t" aria-describedby="${key}-e" placeholder="Type your answer"></textarea></div>`;
  };
  const row = (q, badge, key) => {
    Q[key] = q;
    const help = q.help ? `<button type="button" class="esgq-help" aria-label="About this question" aria-describedby="${key}-h">${svg('info')}<span class="esgq-tip" role="tooltip" id="${key}-h">${esc(q.help)}</span></button>` : '';
    return `<div class="esgq-row" data-row="${key}"><div class="esgq-q-main"><span class="esgq-q-n">${badge}</span><span class="esgq-q-t"><span id="${key}-t">${esc(q.t)}</span>${help}</span></div>${field(q, key)}`
      + (q.na ? `<label class="esgq-na"><input type="checkbox" data-na-for="${key}"> Question not applicable</label>` : '')
      + `<p class="esgq-err" id="${key}-e" hidden></p><div class="esgq-note" data-note="${key}" hidden></div>`
      // every question, parent or follow-up, has its own foot: the tools on the left, its tags on the right
      + `<div class="esgq-foot"><button type="button" class="esgq-tool" data-comment="${key}" aria-expanded="false" aria-controls="${key}-c" aria-label="Comments" title="Comments">${svg('note')}<span class="esgq-tool-n" hidden></span></button>${tool('clip', 'Attach a document')}${tool('assign', 'Ask a colleague')}<span class="esgq-marks" data-marks="${key}"></span></div><section class="esgq-comments" id="${key}-c" aria-label="Comments" hidden></section></div>`;
  };
  const card = (q, n, key) => `<div class="esgq-q" id="q-${key}" data-q="${key}">${row(q, n, key)}`
    + (q.subs ? `<div class="esgq-subs" inert><div class="esgq-subs-in"><div class="esgq-subs-body">${q.subs.map((sq, i) => row(sq, `${n}.${i + 1}`, ESG.subKey(key, i))).join('')}</div></div></div>` : '')
    + '</div>';
  DATA.sections.forEach((sec) => {
    const box = document.querySelector(`[data-esgq="${sec.id}"]`); if (!box) return;
    box.querySelector('[data-esgq-list]').innerHTML = sec.questions.map((q, i) => (q.g ? `<h3 class="esgq-group">${esc(q.g)}</h3>` : '') + card(q, i + 1, `${sec.id}-${i + 1}`)).join('');
  });
  const navLinks = [...document.querySelectorAll('.set-nav a')];
  navLinks.forEach((a) => { a.innerHTML = `<span class="esgq-nav-l">${a.innerHTML}</span><span class="esgq-nav-p" data-nav-p></span>`; });

  // ---- what a row shows: its answer, its note, its tags -----------------------------------------
  const grow = (t) => { t.style.height = 'auto'; t.style.height = t.scrollHeight + (t.offsetHeight - t.clientHeight) + 'px'; };
  const shown = new Set(); // whose citations are open
  const chip = (text, cls, title) => `<span class="chip ${cls}"${title ? ` title="${esc(title)}"` : ''}>${text}</span>`;
  const cites = (q, key) => (key && s.meta[key] && s.meta[key].cite) || (q.a && q.a.cite) || [];
  const OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13.5 6H18v4.5M18 6l-7.5 7.5M16.5 13.5V18H6V7.5h4.5"/></svg>';
  const quote = (c, key, n) => {
    const i = c.match ? c.quote.indexOf(c.match) : -1;
    const body = i < 0 ? esc(c.quote) : esc(c.quote.slice(0, i)) + '<mark>' + esc(c.match) + '</mark>' + esc(c.quote.slice(i + c.match.length));
    return `<figure class="esgq-src"><figcaption><b>${esc(c.src)}</b><span>${esc(c.loc)}</span></figcaption><blockquote>“${body}”</blockquote><button type="button" class="esgq-src-open" data-open="${key}" data-i="${n}">Open document${OPEN}</button></figure>`;
  };
  const syncRow = (key) => {
    const q = Q[key], rowEl = main.querySelector(`[data-row="${key}"]`); if (!rowEl) return;
    const v = s.v[key] || '', na = !!s.na[key], m = s.meta[key], locked = !!s.submitted;
    rowEl.querySelectorAll(`input[name="${CSS.escape(key)}"]`).forEach((r) => { r.checked = r.value === v; r.disabled = na || locked; });
    const ta = rowEl.querySelector(`textarea[data-for="${CSS.escape(key)}"]`);
    if (ta) { if (ta.value !== v) ta.value = v; ta.disabled = na || locked; grow(ta); }
    const nb = rowEl.querySelector(`[data-na-for="${CSS.escape(key)}"]`); if (nb) { nb.checked = na; nb.disabled = locked; }
    const err = rowEl.querySelector('.esgq-err'), p = na ? '' : ESG.problem(q, v);
    err.hidden = !p; err.textContent = p; if (ta) ta.setAttribute('aria-invalid', String(!!p));
    // her note: why she answered, or why she left it to you, and where she read it
    const note = rowEl.querySelector('[data-note]');
    const why = ESG.reason(q, key, s);
    if (m && why) {
      const list = m.by === 'alma' && !m.rejected ? cites(q, key) : [];
      const open = shown.has(key);
      note.hidden = false;
      note.innerHTML = `<p><span class="esgq-note-k">ALMA</span>${esc(why)}</p>`
        + (list.length ? `<button type="button" class="esgq-src-btn" data-src="${key}" aria-expanded="${open}">${open ? 'Hide' : 'View'} ${list.length > 1 ? `citations (${list.length})` : 'citation'}</button>` + (open ? list.map((c, i) => quote(c, key, i)).join('') : '') : '');
    } else { note.hidden = true; note.innerHTML = ''; }
    // tags, and the pair of buttons for an answer she was unsure of
    const tags = [];
    const answeredRow = na || (ESG.has(v) && !p);
    if (m && m.by === 'alma' && !m.rejected) {
      tags.push(chip('Answered by ALMA', 'is-alma', 'Read from ' + (m.src || (q.a && q.a.src) || 'your documents')));
      if (m.approved) tags.push(chip('Approved by you', 'is-you', 'You approved ALMA’s answer — she was unsure of it.'));
      else { const c = CONF[m.conf] || CONF.medium; tags.push(chip(c[0], c[1], c[2])); }
      if (m.edited) tags.push(chip('Edited by you', 'is-you', 'You changed ALMA’s answer.'));
      else if (m.commented) tags.push(chip('Commented by you', 'is-you', 'You commented on ALMA’s answer.'));
    } else if (m && m.rejected) tags.push(chip('Edited by you', 'is-you', 'You turned down ALMA’s answer.'));
    if (answeredRow && s.alma && s.alma.applied && (!m || m.by === 'flag' || m.rejected)) tags.push(chip('Answered by you', 'is-you'));
    if (ESG.rowNeeds(s, q, key)) tags.push(chip('Needs you', 'is-needs', m.rejected ? 'You turned down ALMA’s answer — this needs one from you.' : m.by === 'flag' ? why : CONF.low[2]));
    const pending = m && m.by === 'alma' && m.conf === 'low' && !m.approved && !m.edited && !m.commented && !m.rejected && !locked;
    const n = talk(key), cb = rowEl.querySelector(`[data-comment="${CSS.escape(key)}"]`), cn = cb.querySelector('.esgq-tool-n');
    cn.hidden = !n; cn.textContent = n; cb.classList.toggle('has-n', !!n); cb.setAttribute('aria-label', n ? `Comments, ${n}` : 'Comments');
    thread(key);
    const marks = main.querySelector(`[data-marks="${key}"]`);
    marks.innerHTML = tags.join('') + (pending ? `<span class="esgq-review"><button type="button" class="btn btn-quiet btn-sm" data-approve="${key}">Approve</button><button type="button" class="btn btn-quiet btn-sm" data-reject="${key}">Reject</button></span>` : '');
    marks.hidden = !marks.innerHTML;
  };
  // ---- comments: a thread under each question and each follow-up -------------------------------
  const who = () => ({ name: (document.querySelector('[data-who-name]') || {}).textContent || 'You', pic: (document.querySelector('#who-btn [data-who-pic]') || {}).innerHTML || '' });
  const when = (t) => { const d = new Date(t); return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }); };
  // A thread per question, like a chat: comments, each with its replies under it. Your own can be
  // edited or deleted; deleting one that has replies leaves a note in its place so the replies still
  // make sense. The box to write in closes itself once you post, cancel or press Esc.
  const cid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const list = (key) => {
    const l = s.comments[key] || [];
    l.forEach((c) => { c.id = c.id || cid(); c.replies = c.replies || []; }); // comments from before replies existed
    return l;
  };
  const talk = (key) => list(key).reduce((n, c) => n + (c.deleted ? 0 : 1) + c.replies.length, 0);
  const ui = { compose: new Set(), reply: {}, edit: {}, confirm: {} }, drafts = {};
  const DEL = (c, key, reply) => `<span class="esgq-c-confirm">Delete this ${reply ? 'reply' : 'comment'}?<button type="button" class="link-btn is-bad" data-ca="del-yes" data-k="${key}" data-id="${c.id}">Delete</button><button type="button" class="link-btn" data-ca="del-no" data-k="${key}">Keep</button></span>`;
  const form = (key, mode, id, text, label, cta) => `<form class="esgq-c-form" data-cform="${key}" data-mode="${mode}"${id ? ` data-id="${id}"` : ''}>
      <textarea class="input" rows="2" placeholder="${label}" aria-label="${label}">${esc(text || '')}</textarea>
      <div class="esgq-c-foot">${mode === 'new' ? `<span class="esgq-c-me"><span class="who-pic esgq-c-pic" aria-hidden="true">${who().pic}</span>${esc(who().name)}</span>` : '<span></span>'}
        <span class="esgq-c-btns"><button type="button" class="btn btn-quiet btn-sm" data-ca="cancel" data-k="${key}" data-mode="${mode}">Cancel</button><button type="submit" class="btn btn-primary btn-sm"${(text || '').trim() ? '' : ' disabled'}>${cta}</button></span></div></form>`;
  const one = (c, key, parent) => {
    const me = who(), mine = c.name === me.name, locked = !!s.submitted, reply = !!parent;
    if (c.deleted) return `<div class="esgq-c is-gone"><span class="who-pic esgq-c-pic" aria-hidden="true"></span><p class="esgq-c-text">This comment was deleted.</p></div>`;
    const editing = ui.edit[key] === c.id;
    const acts = locked ? '' : ui.confirm[key] === c.id ? DEL(c, key, reply)
      : `<span class="esgq-c-acts"><button type="button" class="link-btn" data-ca="reply" data-k="${key}" data-id="${parent ? parent.id : c.id}">Reply</button>${mine ? `<button type="button" class="link-btn" data-ca="edit" data-k="${key}" data-id="${c.id}">Edit</button><button type="button" class="link-btn" data-ca="del" data-k="${key}" data-id="${c.id}">Delete</button>` : ''}</span>`;
    return `<div class="esgq-c"><span class="who-pic esgq-c-pic" aria-hidden="true">${c.pic || ''}</span><div class="esgq-c-main">
      <p class="esgq-c-top"><b>${esc(c.name)}</b><span>${when(c.at)}${c.edited ? ' · edited' : ''}</span></p>
      ${editing ? form(key, 'edit', c.id, drafts[`${key}|edit|${c.id}`] ?? c.text, 'Edit your comment', 'Save') : `<p class="esgq-c-text">${esc(c.text)}</p>${acts}`}</div></div>`;
  };
  const thread = (key) => {
    const p = document.getElementById(key + '-c'), l = list(key), locked = !!s.submitted, composing = ui.compose.has(key) && !locked;
    p.hidden = !l.length && !composing;
    const cb = main.querySelector(`[data-comment="${CSS.escape(key)}"]`); if (cb) { cb.setAttribute('aria-expanded', String(composing)); cb.classList.toggle('is-open', composing); }
    if (p.hidden) { p.innerHTML = ''; return; }
    p.innerHTML = (l.length ? `<ul class="esgq-c-list">${l.map((c) => `<li>${one(c, key)}`
      + (c.replies.length || ui.reply[key] === c.id ? `<ul class="esgq-c-replies">${c.replies.map((r) => `<li>${one(r, key, c)}</li>`).join('')}`
        + (ui.reply[key] === c.id && !locked ? `<li>${form(key, 'reply', c.id, drafts[`${key}|reply|${c.id}`], `Reply to ${c.deleted ? 'this thread' : c.name}`, 'Reply')}</li>` : '') + '</ul>' : '') + '</li>').join('')}</ul>` : '')
      + (composing ? form(key, 'new', '', drafts[`${key}|new|`], 'Write a comment', 'Comment') : locked || !l.length ? '' : `<button type="button" class="link-btn esgq-c-add" data-ca="new" data-k="${key}">Add a comment</button>`);
  };
  const focusForm = (key, mode) => setTimeout(() => { const t = document.querySelector(`#${CSS.escape(key)}-c [data-mode="${mode}"] textarea`); if (t) { grow(t); t.focus({ preventScroll: true }); t.setSelectionRange(t.value.length, t.value.length); } }, 0);
  // a comment on one of ALMA's answers means someone looked at it
  const looked = (key) => { const m = s.meta[key]; if (m && m.by === 'alma' && !m.rejected) m.commented = talk(key) > 0; };
  const after = (key) => { looked(key); ESG.save(s); syncCard(key.split('.')[0]); totals(); };
  const find = (key, id) => { for (const c of list(key)) { if (c.id === id) return { c, in: list(key) }; const r = c.replies.find((x) => x.id === id); if (r) return { c: r, in: c.replies, parent: c }; } return null; };
  main.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-cform]'); if (!f) return;
    e.preventDefault();
    const key = f.dataset.cform, mode = f.dataset.mode, id = f.dataset.id, text = f.querySelector('textarea').value.trim(); if (!text) return;
    const me = who(), mk = () => ({ id: cid(), text, at: Date.now(), name: me.name, pic: me.pic });
    if (mode === 'new') { (s.comments[key] = s.comments[key] || []).push(Object.assign(mk(), { replies: [] })); ui.compose.delete(key); }
    else if (mode === 'reply') { const hit = find(key, id); if (hit) hit.c.replies.push(mk()); delete ui.reply[key]; }
    else { const hit = find(key, id); if (hit && hit.c.text !== text) { hit.c.text = text; hit.c.edited = Date.now(); } delete ui.edit[key]; }
    delete drafts[`${key}|${mode}|${id || ''}`];
    after(key);
  });
  main.addEventListener('keydown', (e) => {
    const t = e.target.closest('.esgq-c-form textarea'); if (!t) return;
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); t.form.requestSubmit(); }
    else if (e.key === 'Escape') { e.preventDefault(); t.form.querySelector('[data-ca="cancel"]').click(); }
  });
  // what the thread's own buttons do
  const commentAct = (b) => {
    const key = b.dataset.k, id = b.dataset.id, a = b.dataset.ca;
    if (a === 'new') { ui.compose.add(key); thread(key); focusForm(key, 'new'); }
    else if (a === 'reply') { ui.reply[key] = id; delete ui.edit[key]; thread(key); focusForm(key, 'reply'); }
    else if (a === 'edit') { ui.edit[key] = id; delete ui.reply[key]; thread(key); focusForm(key, 'edit'); }
    else if (a === 'cancel') {
      const mode = b.dataset.mode;
      if (mode === 'new') ui.compose.delete(key); else if (mode === 'reply') delete ui.reply[key]; else delete ui.edit[key];
      Object.keys(drafts).filter((d) => d.startsWith(`${key}|${mode}|`)).forEach((d) => delete drafts[d]);
      thread(key);
      const back = main.querySelector(`[data-comment="${CSS.escape(key)}"]`); if (back && mode === 'new') back.focus({ preventScroll: true });
    }
    else if (a === 'del') { ui.confirm[key] = id; thread(key); const y = document.querySelector(`#${CSS.escape(key)}-c [data-ca="del-yes"]`); if (y) y.focus({ preventScroll: true }); }
    else if (a === 'del-no') { delete ui.confirm[key]; thread(key); }
    else if (a === 'del-yes') {
      const hit = find(key, id); delete ui.confirm[key];
      if (hit) {
        if (!hit.parent && hit.c.replies.length) { hit.c.deleted = true; hit.c.text = ''; } // its replies stay, under a note
        else hit.in.splice(hit.in.indexOf(hit.c), 1);
        if (hit.parent && hit.parent.deleted && !hit.parent.replies.length) list(key).splice(list(key).indexOf(hit.parent), 1);
      }
      if (!list(key).length) delete s.comments[key];
      after(key);
    }
  };

  const syncCard = (key) => {
    const q = Q[key], c = document.getElementById('q-' + key);
    syncRow(key);
    if (q.subs) {
      const sb = c.querySelector('.esgq-subs'), on = ESG.open(s, key);
      sb.classList.toggle('is-open', on); sb.inert = !on;
      q.subs.forEach((_, i) => syncRow(ESG.subKey(key, i)));
    }
    c.classList.toggle('is-needs', ESG.needs(s, q, key) && !s.submitted);
  };
  const syncAll = () => { ESG.each((q, key) => syncCard(key)); totals(); };

  // ---- totals: the bar, the sections, the filters, Submit ------------------------------------------
  const pctEl = document.getElementById('esgq-pct'), barEl = document.getElementById('esgq-bar'), numEl = document.getElementById('esgq-num');
  const submitBtn = document.getElementById('esgq-submit'), tipEl = document.getElementById('esgq-tip');
  const totals = () => {
    const c = ESG.counts(s);
    pctEl.textContent = c.pct + '%'; barEl.style.width = c.pct + '%'; barEl.style.setProperty('--pct', c.pct + '%');
    numEl.textContent = `${c.answered} of ${c.total} answered`;
    DATA.sections.forEach((sec, i) => {
      const S = c.sections[sec.id], box = document.querySelector(`[data-esgq="${sec.id}"]`);
      box.querySelector('[data-esgq-count]').textContent = `${S.answered} of ${S.total} answered`;
      const a = navLinks[i]; if (!a) return;
      a.querySelector('[data-nav-p]').textContent = Math.round((S.answered / S.total) * 100) + '%';
      a.classList.toggle('has-needs', S.needs > 0 && !s.submitted);
      a.title = S.needs && !s.submitted ? `${S.needs} need${S.needs === 1 ? 's' : ''} you` : '';
    });
    const r = ESG.ready(s);
    document.getElementById('esgq-lead').textContent = s.submitted ? 'Submitted — your answers are locked while they are reviewed.' : 'Nothing here is shared until you choose to submit it.';
    // Submit stays where it is once used, greyed out and saying why; View dashboard waits beside it until then
    const when = s.submitted ? new Date(s.submitted) : null;
    const done = when ? `Submitted on ${when.getDate()} ${MONTHS[when.getMonth()]} ${when.getFullYear()}. Your answers are locked while they are reviewed.` : '';
    [submitBtn, document.getElementById('esgq-submit-end')].forEach((b) => {
      b.setAttribute('aria-disabled', String(!r.ok || !!s.submitted));
      if (done) b.dataset.tip = done; else delete b.dataset.tip;
    });
    ['esgq-results', 'esgq-results-end'].forEach((id) => {
      const a = document.getElementById(id);
      a.setAttribute('aria-disabled', String(!s.submitted));
      if (s.submitted) { a.href = 'esg-results.html'; delete a.dataset.tip; }
      else { a.removeAttribute('href'); a.dataset.tip = 'Available once the questionnaire is submitted.'; a.setAttribute('role', 'link'); a.tabIndex = 0; }
    });
    filterCounts(c);
    panel();
  };

  // filters: once ALMA has answered, you can look at just what she did, what you did, or what waits on you
  const FILTERS = [['all', 'All'], ['needs', 'Needs you'], ['alma', 'Answered by ALMA'], ['you', 'Answered by you'], ['open', 'Unanswered']];
  const filterBox = document.getElementById('esgq-filters');
  let filter = 'all';
  const inFilter = (q, key) => {
    const a = ESG.answered(s, q, key), m = s.meta[key], alma = !!m && m.by === 'alma' && !m.rejected;
    return filter === 'all' || (filter === 'needs' && ESG.needs(s, q, key)) || (filter === 'alma' && a && alma) || (filter === 'you' && a && !alma) || (filter === 'open' && !a);
  };
  const filterCounts = (c) => {
    const show = !!(s.alma && s.alma.applied);
    filterBox.hidden = !show; if (!show) return;
    const n = { all: c.total, needs: c.needs, alma: c.alma, you: c.you, open: c.total - c.answered };
    if (!filterBox.firstChild) filterBox.innerHTML = FILTERS.map(([k, l]) => `<button type="button" class="esgq-pill" data-filter="${k}" aria-pressed="${k === filter}">${l} <b data-fc="${k}"></b></button>`).join('');
    FILTERS.forEach(([k]) => { filterBox.querySelector(`[data-fc="${k}"]`).textContent = n[k]; });
  };
  const applyFilter = () => {
    filterBox.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    let any = false;
    DATA.sections.forEach((sec) => {
      const box = document.querySelector(`[data-esgq="${sec.id}"]`); let some = false;
      sec.questions.forEach((q, i) => { const key = `${sec.id}-${i + 1}`, on = inFilter(q, key); document.getElementById('q-' + key).hidden = !on; some = some || on; });
      box.querySelectorAll('.esgq-group').forEach((h) => { let n = h.nextElementSibling, vis = false; while (n && !n.matches('.esgq-group')) { if (!n.hidden) vis = true; n = n.nextElementSibling; } h.hidden = !vis; });
      box.hidden = !some; any = any || some;
    });
    document.getElementById('esgq-none').hidden = any;
    setTimeout(mark, 0);
  };
  const toList = () => scrollTo({ top: main.getBoundingClientRect().top + scrollY - 72 - (stuck() ? band.offsetHeight : 0), behavior: 'smooth' });
  filterBox.addEventListener('click', (e) => { const b = e.target.closest('[data-filter]'); if (!b) return; filter = b.dataset.filter; applyFilter(); toList(); });
  document.getElementById('esgq-show-all').addEventListener('click', () => { filter = 'all'; applyFilter(); });

  // ---- answering ----------------------------------------------------------------------------------
  const top = (key) => key.split('.')[0];
  const changed = (key) => {
    const m = s.meta[key];
    if (m && m.by === 'alma' && !m.rejected) m.edited = s.v[key] !== m.orig;
    ESG.save(s); syncCard(top(key)); totals();
  };
  main.addEventListener('change', (e) => {
    const t = e.target;
    if (t.type === 'radio') { s.v[t.name] = t.value; changed(t.name); }
    else if (t.dataset.naFor) { s.na[t.dataset.naFor] = t.checked; changed(t.dataset.naFor); }
  });
  main.addEventListener('input', (e) => {
    const t = e.target;
    if (t.closest('.esgq-c-form')) { grow(t); t.form.querySelector('[type="submit"]').disabled = !t.value.trim(); const f = t.form; drafts[`${f.dataset.cform}|${f.dataset.mode}|${f.dataset.id || ''}`] = t.value; return; }
    if (!t.dataset.for) return;
    const key = t.dataset.for;
    grow(t); s.v[key] = t.value;
    const m = s.meta[key]; if (m && m.by === 'alma' && !m.rejected) m.edited = t.value !== m.orig;
    ESG.save(s);
    // the field keeps its caret: refresh around it, not the field itself
    syncRow(key); document.getElementById('q-' + top(key)).classList.toggle('is-needs', ESG.needs(s, Q[top(key)], top(key))); totals();
  });
  main.addEventListener('click', (e) => {
    const cm = e.target.closest('[data-comment]');
    if (cm) { const k = cm.dataset.comment; if (s.submitted) return; if (ui.compose.has(k)) { ui.compose.delete(k); thread(k); } else { ui.compose.add(k); thread(k); focusForm(k, 'new'); } return; }
    const ca = e.target.closest('[data-ca]');
    if (ca) { commentAct(ca); return; }
    const o = e.target.closest('[data-open]');
    if (o) { ESG_DOC.open(cites(Q[o.dataset.open], o.dataset.open), +o.dataset.i); return; }
    const b = e.target.closest('[data-approve], [data-reject], [data-src]'); if (!b) return;
    if (b.dataset.src) { const k = b.dataset.src; shown.has(k) ? shown.delete(k) : shown.add(k); syncRow(k); return; }
    const key = b.dataset.approve || b.dataset.reject, m = s.meta[key];
    if (b.dataset.approve) m.approved = true;
    else { m.rejected = true; s.v[key] = ''; shown.delete(key); }
    ESG.save(s); syncCard(top(key)); totals();
    if (b.dataset.reject) { const f = main.querySelector(`[data-row="${CSS.escape(key)}"] textarea, [data-row="${CSS.escape(key)}"] input`); if (f) f.focus({ preventScroll: true }); }
  });
  addEventListener('resize', () => main.querySelectorAll('textarea.input').forEach(grow));

  // ---- Submit ---------------------------------------------------------------------------------------
  let tipT;
  const missing = (r) => {
    const parts = [];
    if (r.gaps) parts.push(`${r.gaps} question${r.gaps === 1 ? '' : 's'} still need${r.gaps === 1 ? 's' : ''} an answer`);
    if (r.review) parts.push(`${r.review} answer${r.review === 1 ? '' : 's'} need${r.review === 1 ? 's' : ''} your review`);
    if (r.bad) parts.push(`${r.bad} answer${r.bad === 1 ? '' : 's'} need${r.bad === 1 ? 's' : ''} fixing`);
    return parts.join(', ').replace(/, ([^,]*)$/, ' and $1').replace(/^./, (x) => x.toUpperCase());
  };
  const toFirst = (r) => {
    if (!inFilter(Q[r.first], r.first)) { filter = 'all'; applyFilter(); }
    const c = document.getElementById('q-' + r.first);
    scrollTo({ top: c.getBoundingClientRect().top + scrollY - 72 - (stuck() ? band.offsetHeight : 0) - 24, behavior: 'smooth' });
  };
  const confirmSubmit = () => dialog({
    h: 'Submit your ESG Questionnaire?',
    p: 'Once it is submitted your answers are locked while they are reviewed, and the clients and buyers you share your profile with can see them.',
    acts: [['Cancel', 'btn-quiet', null], ['Submit questionnaire', 'btn-primary', () => {
      s.submitted = Date.now(); ESG.save(s); filter = 'all'; document.documentElement.classList.add('esgq-locked'); syncAll(); applyFilter();
      scrollTo({ top: 0, behavior: 'smooth' });
    }]],
  });
  const endSubmit = document.getElementById('esgq-submit-end');
  endSubmit.addEventListener('click', () => {
    if (s.submitted) return; // its tooltip says why
    const r = ESG.ready(s);
    if (r.ok) { confirmSubmit(); return; }
    dialog({ h: 'Not ready to submit yet', p: `${missing(r)} before this can be submitted.`,
      acts: [['Close', 'btn-quiet', null], ['Show me', 'btn-primary', () => toFirst(r)]] });
  });
  // prototype only: back to an empty questionnaire, as if nothing had happened
  document.getElementById('esgq-restart').addEventListener('click', () => dialog({
    h: 'Restart the questionnaire?',
    p: 'Prototype only. This clears every answer, comment and note, and everything ALMA has read, and opens the questionnaire empty again. It can’t be undone.',
    acts: [['Cancel', 'btn-quiet', null], ['Restart questionnaire', 'btn-primary', () => {
      try { sessionStorage.removeItem(ESG.KEY); } catch (e) {}
      location.href = 'esg-questionnaire.html';
    }]],
  }));
  // prototype only: everything answered and reviewed, to show the finished questionnaire
  document.getElementById('esgq-complete').addEventListener('click', () => dialog({
    h: 'Complete the questionnaire?',
    p: 'Prototype only. ALMA’s answers go in from the demo documents, every question still empty gets an answer, and her unsure answers are approved, so it is ready to submit. Answers you already gave stay as they are.',
    acts: [['Cancel', 'btn-quiet', null], ['Complete questionnaire', 'btn-primary', () => {
      const docs = ESG_DATA.docs.seed.filter((d) => d.name !== 'Code-of-Ethics-and-Conduct-2025.pdf').map((d) => ({ name: d.name, source: d.source === 'library' ? 'library' : 'files' }));
      ESG.complete(ESG.load(), docs);
      location.href = 'esg-questionnaire.html';
    }]],
  }));
  submitBtn.addEventListener('click', () => {
    if (s.submitted) return;
    const r = ESG.ready(s);
    if (!r.ok) {
      const parts = [];
      if (r.gaps) parts.push(`${r.gaps} question${r.gaps === 1 ? '' : 's'} still need${r.gaps === 1 ? 's' : ''} an answer`);
      if (r.review) parts.push(`${r.review} answer${r.review === 1 ? '' : 's'} need${r.review === 1 ? 's' : ''} your review`);
      if (r.bad) parts.push(`${r.bad} answer${r.bad === 1 ? '' : 's'} need${r.bad === 1 ? 's' : ''} fixing`);
      tipEl.innerHTML = `<b>Not ready yet.</b> ${parts.join(', ').replace(/, ([^,]*)$/, ' and $1').replace(/^./, (x) => x.toUpperCase())} before this can be submitted.`;
      tipEl.hidden = false; clearTimeout(tipT); tipT = setTimeout(() => (tipEl.hidden = true), 3600);
      if (!inFilter(Q[r.first], r.first)) { filter = 'all'; applyFilter(); }
      const c = document.getElementById('q-' + r.first);
      scrollTo({ top: c.getBoundingClientRect().top + scrollY - 72 - (stuck() ? band.offsetHeight : 0) - 24, behavior: 'smooth' });
      return;
    }
    confirmSubmit();
  });

  // ---- a small dialog: the hand-over, and the last check before submitting --------------------------------
  const dialog = ({ h, p, acts, alma }) => {
    const d = document.createElement('div');
    const last = document.activeElement;
    d.className = 'dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'esgq-dlg-h');
    d.innerHTML = `<div class="dlg-scrim" data-x></div><div class="dlg-card"><button type="button" class="dlg-x" data-x aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="dlg-head">${alma ? `<span class="dlg-alma is-big" aria-hidden="true">${ESG.SPHERES}</span><span class="eyebrow">ALMA</span>` : ''}<h2 id="esgq-dlg-h">${h}</h2><p>${p}</p></div>
      <div class="dlg-foot is-center"><span class="dlg-btns">${acts.map(([l, c, f], i) => (typeof f === 'string' ? `<a class="btn ${c}" href="${f}">${l}</a>` : `<button type="button" class="btn ${c}" data-act="${i}">${l}</button>`)).join('')}</span></div></div>`;
    document.body.appendChild(d); document.documentElement.classList.add('dlg-open');
    const close = () => { d.remove(); document.documentElement.classList.remove('dlg-open'); if (last && last.focus) last.focus({ preventScroll: true }); };
    d.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) { close(); return; } const a = e.target.closest('[data-act]'); if (a) { close(); const f = acts[+a.dataset.act][2]; if (f) f(); } });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    setTimeout(() => { const f = d.querySelector('.dlg-foot .btn-primary'); if (f) f.focus(); }, 120);
  };

  // ---- ALMA, above the questions ------------------------------------------------------------------
  const band = document.getElementById('qd-stick'), drop = document.getElementById('qd-drop');
  const pt = document.getElementById('qd-t'), ps = document.getElementById('qd-s'), pm = document.getElementById('qd-m'), pa = document.getElementById('qd-acts');
  let shownState = '', tick = null;
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const finish = () => { ESG.apply(s); s = ESG.load(); syncAll(); applyFilter(); markRead(); };
  const panel = () => {
    const st = ESG.status(s);
    if (st === 'ready') { setTimeout(finish, 0); return; }
    drop.classList.toggle('is-reading', st === 'reading');
    drop.classList.toggle('is-done', st === 'review' || st === 'submitted');
    drop.setAttribute('aria-label', ['new', 'started'].includes(st) ? 'Drop documents on ALMA, or press to choose them' : 'ALMA');
    drop.tabIndex = ['new', 'started'].includes(st) ? 0 : -1;
    if (st === 'reading') {
      const docs = ESG.reading(s).docs, pct = ESG.almaPct(s), i = Math.min(docs.length - 1, Math.floor((pct / 100) * docs.length));
      pt.textContent = 'Reading your documents';
      ps.textContent = `${docs[i].name} · ${i + 1} of ${docs.length}. ` + (s.alma.pending ? 'I’ll tell you what changed when I’m done.' : 'You can keep answering meanwhile — I won’t touch anything you have filled in.');
      pm.hidden = false; pm.querySelector('i').style.width = pct + '%';
      if (shownState !== st) { pa.innerHTML = ''; pa.dataset.v = ''; }
      if (!tick) tick = setInterval(() => { if (ESG.status(s) !== 'reading') { clearInterval(tick); tick = null; finish(); } else panel(); }, 300);
    } else if (st === 'review') {
      const c = ESG.counts(s), n = s.alma.answered || 0, L = s.alma.last, pl = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
      pt.textContent = !L ? (n ? `I answered ${pl(n, 'question')} from your documents.` : 'I read your documents, but found nothing I could answer from them.')
        : L.mode === 'gaps' ? (L.n ? `I answered ${L.n} of the ${pl(L.m, 'question')} that were still empty.` : 'The new documents don’t answer any of the questions still empty.')
        : L.mode === 'pick' ? `I looked again at ${pl(L.n, 'answer')} with the new documents; everything else is untouched.`
        : `I started over and answered ${pl(L.n, 'question')} from all ${L.docs} documents.`;
      ps.textContent = c.needs ? `${c.needs} still need${c.needs === 1 ? 's' : ''} you — they’re marked below. Check my answers, then submit when everything is in.` : 'Nothing is waiting on you. Have a last look, then submit.';
      pm.hidden = true;
      const want = c.needs ? 'needs' : 'none';
      if (pa.dataset.v !== want) { pa.dataset.v = want; pa.innerHTML = '<button type="button" class="btn btn-quiet btn-sm" id="qd-more">Add documents</button>' + (c.needs ? '<button type="button" class="btn btn-quiet btn-sm" id="qd-needs">Show what needs you</button>' : ''); }
    } else if (st === 'submitted') {
      const d = new Date(s.submitted);
      pt.textContent = `Submitted on ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}.`;
      ps.textContent = 'Your answers are locked while they are reviewed. Clients and buyers you share your profile with can see them.';
      pm.hidden = true;
      pa.innerHTML = ''; pa.dataset.v = '';
    } else {
      pt.textContent = 'Let me fill this in for you.';
      ps.textContent = 'Drop your policy documents here and I’ll read them, find the answers and fill them in. You get the final say on every one before anything is submitted.';
      pm.hidden = true;
      if (pa.dataset.v !== 'up') { pa.dataset.v = 'up'; pa.innerHTML = '<button type="button" class="btn btn-primary btn-sm" id="qd-up">Upload documents</button><span class="qd-hint">or drop files anywhere here</span>'; }
    }
    shownState = st;
  };
  const canTake = () => ['new', 'started', 'review'].includes(ESG.status(s));
  // once she has answered, the dialog needs what she has read and the answers a new batch could redo
  const more = () => {
    const used = {}, groups = { needs: [], low: [], medium: [], high: [], you: [], approved: [] };
    ESG.each((q, key) => {
      const m = s.meta[key]; if (!m || m.by !== 'alma' || m.rejected) return;
      new Set([m.src || (q.a && q.a.src)].concat(cites(q, key).map((c) => c.src)).filter(Boolean)).forEach((n) => { used[n] = (used[n] || 0) + 1; });
      if (ESG.needs(s, q, key)) groups.needs.push(key);
      if (!m.approved && groups[m.conf]) groups[m.conf].push(key);
      if (m.edited || m.commented) groups.you.push(key);
      if (m.approved) groups.approved.push(key);
    });
    const G = [['needs', 'Needs you', 'is-needs'], ['low', 'Low confidence', 'is-low'], ['medium', 'Medium confidence', 'is-mid'], ['high', 'High confidence', 'is-ok'], ['you', 'Edited by you', 'is-you'], ['approved', 'Approved by you', 'is-you']];
    let gaps = 0; ESG.each((q, key) => { if (!ESG.answered(s, q, key)) gaps++; });
    return { read: s.alma.docs.map((d) => ({ name: d.name, used: used[d.name] || 0 })), groups: G.map(([key, label, cls]) => ({ key, label, cls, keys: groups[key] })), gaps };
  };
  const upload = (files) => { if (canTake()) ESG_UPLOAD.open(files, handed, ESG.status(s) === 'review' ? more() : null); };
  const handed = (docs, how) => {
    s = ESG.load();
    if (how) { ESG.handMore(s, docs, how.mode, how.keys); panel(); return; } // she reads them here, and says what changed
    ESG.handTo(s, docs); panel();
    dialog({ alma: true, h: 'I’ll take it from here', p: 'I have your documents and I’m reading them now. You don’t need to wait here — I’ll let you know the moment I’m done. You’ll see every answer, and what I read it from, before anything is submitted.',
      acts: [['Stay here', 'btn-quiet', null], ['Back to Questionnaires', 'btn-primary', 'questionnaires.html']] });
  };
  drop.addEventListener('click', (e) => {
    if (e.target.closest('#qd-needs')) { filter = 'needs'; applyFilter(); toList(); return; }
    if (e.target.closest('#qd-more') || ['new', 'started'].includes(ESG.status(s))) upload();
  });
  drop.addEventListener('keydown', (e) => { if (e.target === drop && (e.key === 'Enter' || e.key === ' ') && ['new', 'started'].includes(ESG.status(s))) { e.preventDefault(); upload(); } });
  drop.addEventListener('dragover', (e) => { if (!canTake()) return; e.preventDefault(); drop.classList.add('is-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => { if (!canTake()) return; e.preventDefault(); drop.classList.remove('is-over'); upload(e.dataTransfer.files); });
  const markRead = () => { s.read = true; ESG.save(s); if (window.ESG_NOTIFY) ESG_NOTIFY.read(); };

  // ---- the section in view is the one marked on the left ----------------------------------------------
  const stuck = () => getComputedStyle(band).position === 'sticky';
  new ResizeObserver(() => document.documentElement.style.setProperty('--esgq-band', band.offsetHeight + 'px')).observe(band);
  const boxes = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
  const mark = () => {
    let on = 0; const line = Math.max(innerHeight * 0.35, (stuck() ? band.getBoundingClientRect().bottom : 72) + 64);
    boxes.forEach((c, i) => { if (c && !c.hidden && c.getBoundingClientRect().top < line) on = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) { const vis = boxes.map((b, i) => (b && !b.hidden ? i : -1)).filter((i) => i >= 0); if (vis.length) on = vis[vis.length - 1]; }
    navLinks.forEach((a, i) => a.classList.toggle('is-on', i === on));
  };
  addEventListener('scroll', mark, { passive: true });
  navLinks.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); const t = document.querySelector(a.getAttribute('href'));
    if (t.hidden) { filter = 'all'; applyFilter(); }
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - (72 + (stuck() ? band.offsetHeight : 0) + 24), behavior: 'smooth' }); history.replaceState(null, '', a.getAttribute('href'));
  }));

  // ---- the hint on a greyed-out button: why it can't be used yet, or why not any more -------------------
  const hint = Object.assign(document.createElement('div'), { className: 'esgq-hint', role: 'tooltip', id: 'esgq-hint' });
  document.body.appendChild(hint);
  let hinted = null;
  const showHint = (el) => {
    hinted = el; hint.textContent = el.dataset.tip; el.setAttribute('aria-describedby', 'esgq-hint');
    const r = el.getBoundingClientRect(), h = hint.offsetHeight, w = hint.offsetWidth, gap = 8;
    const below = r.top - h - gap < 72; // not enough room above, under the header: show it below
    hint.style.top = (below ? r.bottom + gap : r.top - h - gap) + 'px';
    hint.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.right - w)) + 'px';
    hint.classList.add('is-on');
  };
  const hideHint = () => { if (hinted) hinted.removeAttribute('aria-describedby'); hinted = null; hint.classList.remove('is-on'); };
  document.addEventListener('pointerover', (e) => { const el = e.target.closest('[data-tip]'); if (el && el !== hinted) showHint(el); else if (!el && hinted) hideHint(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest('[data-tip]'); if (el) showHint(el); else hideHint(); });
  document.addEventListener('focusout', hideHint);
  addEventListener('scroll', hideHint, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideHint(); });

  // ---- arriving ----------------------------------------------------------------------------------
  if (ESG.status(s) === 'ready') { ESG.apply(s); s = ESG.load(); }
  if (s.submitted) document.documentElement.classList.add('esgq-locked');
  syncAll(); applyFilter();
  if (ESG.status(s) === 'review') markRead();
  if (/[?&]alma=start\b/.test(location.search) && canTake()) setTimeout(() => upload(), 450);
  const asked = /^#q-/.test(location.hash) && document.getElementById(location.hash.slice(1));
  if (asked) setTimeout(() => { scrollTo({ top: asked.getBoundingClientRect().top + scrollY - 72 - (stuck() ? band.offsetHeight : 0) - 24 }); asked.classList.add('is-arrived'); }, 150);
  setTimeout(mark, 120);
})();
