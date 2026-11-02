/* Help & feedback: the side menu's entry, and the drawer it opens (in from the right, as the
   setup's). Ask a question, report a bug or share an idea: a subject, the area it's about (every
   page and its sections), up to 3000 characters, and screenshots. Prototype: nothing is sent. */
(() => {
  const foot = document.querySelector('.sn-foot');
  if (!foot || document.getElementById('hf')) return;
  const beatriz = document.documentElement.dataset.persona === 'beatriz';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MAX = 3000, SHOTS = 5, MB = 10;
  const person = (() => { try { return JSON.parse(sessionStorage.getItem('cm-person')) || {}; } catch (e) { return {}; } })();
  const mail = person.email || (beatriz ? 'beatriz@veridianharvest.com' : 'miguel@ferreiraconstrucoes.pt');

  // every area of the app, and its sections
  const AREAS = [
    ['Company overview', ['The homepage', beatriz ? 'Product overview' : 'Project overview', 'Documents requiring attention', 'Suppliers needing attention', 'Who asked for your consents']],
    ['Documents', ['All documents', 'Company', 'Workers', 'Equipment'].concat(beatriz ? ['Products'] : []).concat(['Uploading and checking files', 'Marking a document not applicable'])],
    ['Questionnaires', ['The list of questionnaires', 'Answering a questionnaire', 'Results and score']],
    ['Notifications', ['The bell and its list', 'Emails we send']],
    ['C‑MORE ecosystem', ['Searching for companies', 'A company’s page', 'Connecting with a company']],
    ['My clients', ['My clients']],
    ['My suppliers', ['The list of suppliers', 'A supplier’s page', 'Inviting a supplier', 'Consents and the consent log']],
    ['Team management', ['People', 'Groups', 'Roles and permissions']],
    ['Company settings', ['Identification', 'Location', 'Activity', 'Size', 'Corporate structure', 'Contacts', 'Consents']],
    ['Your profile', ['Personal details', 'Password and security', 'Consents and privacy', 'Notifications', 'Language and region', 'Account']],
    ['Something else', ['Signing in or signing up', 'Billing and payment', 'Legal', 'Anything else']],
  ];
  // the page you're on is picked for you
  const path = location.pathname.split('/').pop() || 'index.html', q = new URLSearchParams(location.search);
  const HERE = { 'my-company.html': 'Company overview › The homepage', 'company-details.html': 'Documents › All documents', 'questionnaires.html': 'Questionnaires › The list of questionnaires',
    'esg-questionnaire.html': 'Questionnaires › Answering a questionnaire', 'esg-results.html': 'Questionnaires › Results and score', 'ecosystem.html': q.get('soon') === 'clients' ? 'My clients › My clients' : 'C‑MORE ecosystem › Searching for companies',
    'product.html': 'C‑MORE ecosystem › A company’s page', 'suppliers.html': q.get('s') || q.get('id') ? 'My suppliers › A supplier’s page' : 'My suppliers › The list of suppliers',
    'team.html': 'Team management › People', 'company-profile.html': 'Company settings › Identification', 'settings.html': 'Your profile › Personal details' }[path] || '';
  const KINDS = [['help', 'Get help', 'How do I add a worker’s documents?', 'What are you trying to do, and where did you get stuck?'],
    ['bug', 'Report a bug', 'The upload drawer doesn’t open', 'What happened, what you expected, and the steps to make it happen again.'],
    ['idea', 'Share feedback', 'It would help if…', 'What would make C‑MORE work better for you?']];

  const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.2a2.5 2.5 0 0 1 4.85.85c0 1.65-2.45 2.2-2.45 3.7"/><path d="M12 17h.01"/></svg>';
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.75"/><path d="m21 16-4.5-4.5L7 20"/></svg>';
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';

  const st = document.createElement('style');
  st.textContent = `
.hf { position: fixed; inset: 0; z-index: 120; }
.hf[hidden] { display: none; }
.hf-scrim { position: absolute; inset: 0; background: rgba(36, 36, 36, .42); opacity: 0; transition: opacity .2s; }
.hf.is-open .hf-scrim { opacity: 1; }
.hf-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(36rem, 100vw); display: flex; flex-direction: column; background: var(--color-surface, #fff); box-shadow: -24px 0 60px -30px rgba(52, 52, 52, .35);
  transform: translateX(100%); transition: transform .3s cubic-bezier(.2, .8, .2, 1); outline: none; }
.hf.is-open .hf-panel { transform: none; }
.hf-head { display: flex; align-items: flex-start; gap: 0.875rem; padding: 1.25rem 1rem 1rem 1.5rem; border-bottom: 1px solid var(--color-line); }
.hf-t { flex: 1; min-width: 0; }
.hf-t h2 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; color: var(--color-ink); }
.hf-t p { margin-top: 0.25rem; font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-subtle); }
.hf-x { flex: none; display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border: 0; border-radius: 0.5rem; background: none; color: var(--color-ink-subtle); cursor: pointer; }
.hf-x:hover { background: var(--color-light-beige); color: var(--color-ink); }
.hf-x svg { width: 1.125rem; height: 1.125rem; }
.hf-body { flex: 1; min-height: 0; overflow: auto; padding: 1.25rem 1.5rem 1.5rem; display: grid; gap: 1.25rem; align-content: start; }
.hf-foot { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem 1.25rem; border-top: 1px solid var(--color-line); }
.hf-foot-l { margin-right: auto; min-width: 0; font-size: 0.8125rem; line-height: 1.4; color: var(--color-ink-subtle); }
.hf-foot-l b { font-weight: 500; color: var(--color-ink-muted); overflow-wrap: anywhere; }
.hf-f { display: grid; gap: 0.375rem; min-width: 0; border: 0; padding: 0; margin: 0; }
.hf-f > label, .hf-f > legend { padding: 0; font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.hf-opt { font-weight: 400; color: var(--color-sand-500); }
.hf .input { width: 100%; height: 2.875rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-off-white);
  font: inherit; font-size: 0.9375rem; color: var(--color-ink); outline: none; transition: border-color .14s ease, background-color .14s ease; }
.hf .input:hover { border-color: var(--color-sand-400); }
.hf .input:focus { border-color: var(--color-graphite); background: var(--color-surface); }
.hf .input.is-bad { border-color: var(--color-critical); }
.hf select.input { appearance: none; padding-right: 2.25rem; cursor: pointer;
  background: var(--color-off-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") right 0.75rem center / 1rem no-repeat; }
.hf textarea.input { height: auto; min-height: 10rem; padding: 0.75rem 0.875rem; line-height: 1.5; resize: vertical; }
.hf-row { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.hf-count { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; }
.hf-count.is-near { color: var(--color-caution, #b7791f); }
.hf-count.is-full { color: var(--color-critical); }
.hf-err { font-size: 0.8125rem; color: var(--color-critical); }
.hf-err:empty { display: none; }
.hf-kinds { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem; padding: 0.25rem; border-radius: 0.75rem; background: var(--color-light-beige); }
.hf-kinds label { position: relative; display: grid; place-items: center; min-height: 2.5rem; padding: 0.375rem 0.5rem; border-radius: 0.5rem; font-size: 0.875rem; font-weight: 500; color: var(--color-ink-muted); text-align: center; cursor: pointer; transition: background-color .15s, color .15s, box-shadow .15s; }
.hf-kinds input { position: absolute; opacity: 0; pointer-events: none; }
.hf-kinds label:hover { color: var(--color-ink); }
.hf-kinds label:has(input:checked) { background: var(--color-surface); color: var(--color-ink); box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 2px 8px -4px rgba(0,0,0,.12); }
.hf-kinds label:has(input:focus-visible) { outline: 2px solid var(--color-graphite); outline-offset: 1px; }
.hf-drop { display: grid; justify-items: center; gap: 0.25rem; padding: 1.25rem 1rem; border: 1.5px dashed var(--color-sand-400); border-radius: 0.75rem; background: var(--color-off-white); text-align: center; cursor: pointer; transition: border-color .15s, background-color .15s; }
.hf-drop:hover, .hf-drop.is-drop { border-color: var(--color-graphite); background: var(--color-surface); }
.hf-drop svg { width: 1.5rem; height: 1.5rem; color: var(--color-ink-subtle); margin-bottom: 0.25rem; }
.hf-drop b { font-size: 0.875rem; font-weight: 600; color: var(--color-ink); }
.hf-drop b u { text-underline-offset: 2px; }
.hf-drop small { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.hf-drop[hidden] { display: none; }
.hf-shots { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr)); gap: 0.625rem; }
.hf-shots:empty { display: none; }
.hf-shot { position: relative; margin: 0; }
.hf-shot button.hf-shot-v { display: block; width: 100%; aspect-ratio: 4 / 3; padding: 0; border: 1px solid var(--color-line); border-radius: 0.625rem; overflow: hidden; background: var(--color-off-white); cursor: zoom-in; }
.hf-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hf-shot figcaption { margin-top: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: var(--color-ink-subtle); }
.hf-shot-x { position: absolute; top: 0.3125rem; right: 0.3125rem; display: grid; place-items: center; width: 1.625rem; height: 1.625rem; border: 0; border-radius: 50%; background: rgba(36,36,36,.72); color: #fff; cursor: pointer; }
.hf-shot-x:hover { background: rgba(36,36,36,.9); }
.hf-shot-x svg { width: 0.875rem; height: 0.875rem; }
.hf-add { display: grid; place-items: center; aspect-ratio: 4 / 3; border: 1.5px dashed var(--color-sand-400); border-radius: 0.625rem; background: none; font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.hf-add:hover { border-color: var(--color-graphite); color: var(--color-ink); }
.hf-done { display: grid; justify-items: center; gap: 0.5rem; padding: 2.5rem 0.5rem 1rem; text-align: center; animation: hf-in .45s var(--ease-brand, ease) both; }
.hf-done-tick { display: grid; place-items: center; width: 3.5rem; height: 3.5rem; margin-bottom: 0.5rem; border-radius: 50%; background: var(--color-positive-subtle); color: var(--color-positive); }
.hf-done-tick svg { width: 1.5rem; height: 1.5rem; }
.hf-done h3 { font-size: 1.375rem; font-weight: 600; line-height: 1.25; }
.hf-done p { max-width: 24rem; font-size: 0.9375rem; line-height: 1.5; color: var(--color-ink-muted); }
.hf-done p b { color: var(--color-ink); font-weight: 500; overflow-wrap: anywhere; }
.hf-sum { width: 100%; margin-top: 1rem; display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; padding: 1rem 1.125rem; border: 1px solid var(--color-line); border-radius: 0.875rem; text-align: left; font-size: 0.875rem; }
.hf-sum dt { color: var(--color-ink-subtle); }
.hf-sum dd { margin: 0; min-width: 0; color: var(--color-ink); overflow-wrap: anywhere; }
@keyframes hf-in { from { opacity: 0; transform: translateY(6px); } }
@media (prefers-reduced-motion: reduce) { .hf-panel, .hf-done { transition: none; animation: none; } }
@media (max-width: 30rem) { .hf-kinds label { font-size: 0.8125rem; } .hf-foot-l { display: none; } }`;
  document.head.appendChild(st);

  // the side menu's entry, just above Legal
  const legal = foot.querySelector('.sn-item[title="Legal"]');
  const item = document.createElement('a');
  item.className = 'sn-item'; item.href = '#help'; item.title = 'Help & feedback'; item.setAttribute('aria-haspopup', 'dialog');
  item.innerHTML = `${ICON}<span class="sn-l">Help &amp; feedback</span>`;
  foot.insertBefore(item, legal || foot.querySelector('.sn-item[title="Log out"]'));

  const el = document.createElement('div');
  el.className = 'hf'; el.id = 'hf'; el.hidden = true;
  el.innerHTML = `<div class="hf-scrim" data-hf-close></div>
    <form class="hf-panel" role="dialog" aria-modal="true" aria-labelledby="hf-title" tabindex="-1" novalidate>
      <div class="hf-head"><div class="hf-t"><h2 id="hf-title">Help &amp; feedback</h2><p>Ask a question, tell us something isn&rsquo;t working, or share an idea. A person on our team reads every one.</p></div>
        <button type="button" class="hf-x" data-hf-close aria-label="Close">${X}</button></div>
      <div class="hf-body"></div>
      <div class="hf-foot"></div>
    </form>`;
  document.body.appendChild(el);
  const form = el.querySelector('form'), body = el.querySelector('.hf-body'), footer = el.querySelector('.hf-foot');

  let shots = [], kind = 'help', back = null, sent = false;
  const opts = () => AREAS.map(([g, subs]) => `<optgroup label="${esc(g)}">${subs.map((s) => { const v = `${g} › ${s}`; return `<option value="${esc(v)}"${v === HERE ? ' selected' : ''}>${esc(subs.length === 1 ? g : s)}</option>`; }).join('')}</optgroup>`).join('');
  const k = () => KINDS.find((x) => x[0] === kind);

  function paintForm() {
    sent = false;
    body.innerHTML = `
      <fieldset class="hf-f"><legend>What can we help with?</legend>
        <div class="hf-kinds">${KINDS.map(([v, l]) => `<label><input type="radio" name="hf-kind" value="${v}"${v === kind ? ' checked' : ''}>${l}</label>`).join('')}</div></fieldset>
      <div class="hf-f"><label for="hf-subject">Subject</label><input class="input" id="hf-subject" maxlength="120" autocomplete="off" placeholder="${esc(k()[2])}" aria-describedby="hf-subject-err"><p class="hf-err" id="hf-subject-err"></p></div>
      <div class="hf-f"><label for="hf-area">Area</label>
        <select class="input" id="hf-area" aria-describedby="hf-area-err"><option value=""${HERE ? '' : ' selected'} disabled>Choose where it happens</option>${opts()}</select><p class="hf-err" id="hf-area-err"></p></div>
      <div class="hf-f"><label for="hf-desc">Description</label>
        <textarea class="input" id="hf-desc" maxlength="${MAX}" placeholder="${esc(k()[3])}" aria-describedby="hf-desc-count hf-desc-err"></textarea>
        <div class="hf-row"><p class="hf-err" id="hf-desc-err"></p><span class="hf-count" id="hf-desc-count" aria-live="polite">0 / ${MAX.toLocaleString('en')}</span></div></div>
      <div class="hf-f"><label for="hf-file">Screenshots <span class="hf-opt">(optional)</span></label>
        <div class="hf-drop" id="hf-drop" role="button" tabindex="0" aria-describedby="hf-shot-err">${UP}<b>Drop images here, or <u>choose files</u></b><small>PNG or JPG, up to ${SHOTS} images, ${MB} MB each. You can also paste one.</small></div>
        <div class="hf-shots" id="hf-shots"></div>
        <input type="file" id="hf-file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden>
        <p class="hf-err" id="hf-shot-err"></p></div>`;
    footer.innerHTML = `<p class="hf-foot-l">We reply to <b>${esc(mail)}</b>, usually within one working day.</p>
      <button type="button" class="btn btn-quiet" data-hf-close>Cancel</button><button type="submit" class="btn btn-primary">Send</button>`;
    paintShots();
  }

  function paintShots() {
    const list = body.querySelector('#hf-shots'), drop = body.querySelector('#hf-drop');
    if (!list) return;
    list.innerHTML = shots.map((s, i) => `<figure class="hf-shot"><button type="button" class="hf-shot-v" data-hf-view="${i}" aria-label="View ${esc(s.file.name)}"><img src="${s.url}" alt=""></button>
      <button type="button" class="hf-shot-x" data-hf-rm="${i}" aria-label="Remove ${esc(s.file.name)}">${X}</button><figcaption>${esc(s.file.name)}</figcaption></figure>`).join('')
      + (shots.length && shots.length < SHOTS ? '<button type="button" class="hf-add" data-hf-add>+ Add more</button>' : '');
    drop.hidden = shots.length > 0;
  }

  function take(files) {
    const err = body.querySelector('#hf-shot-err'); let why = '';
    [...files].forEach((f) => {
      if (!/^image\//.test(f.type)) { why = `${f.name} isn't an image.`; return; }
      if (f.size > MB * 1024 * 1024) { why = `${f.name} is over ${MB} MB.`; return; }
      if (shots.length >= SHOTS) { why = `Up to ${SHOTS} screenshots.`; return; }
      shots.push({ file: f, url: URL.createObjectURL(f) });
    });
    if (err) err.textContent = why;
    paintShots();
  }

  const count = () => {
    const t = body.querySelector('#hf-desc'), c = body.querySelector('#hf-desc-count'); if (!t || !c) return;
    const n = t.value.length; c.textContent = `${n.toLocaleString('en')} / ${MAX.toLocaleString('en')}`;
    c.classList.toggle('is-near', n >= MAX * 0.9 && n < MAX); c.classList.toggle('is-full', n >= MAX);
  };

  function check() {
    const f = [['#hf-subject', 'Add a subject.'], ['#hf-area', 'Choose the area it&rsquo;s about.'], ['#hf-desc', 'Tell us a little more.']];
    let first = null;
    f.forEach(([id, msg]) => {
      const i = body.querySelector(id), bad = !i.value.trim();
      i.classList.toggle('is-bad', bad); i.setAttribute('aria-invalid', String(bad));
      body.querySelector(`${id}-err`).innerHTML = bad ? msg : '';
      if (bad && !first) first = i;
    });
    if (first) first.focus();
    return !first;
  }

  function paintDone() {
    const subject = body.querySelector('#hf-subject').value.trim(), area = body.querySelector('#hf-area').value, n = shots.length;
    const ref = `HF-${String(Date.now()).slice(-5)}`;
    sent = true;
    body.innerHTML = `<div class="hf-done" role="status"><span class="hf-done-tick">${TICK}</span>
      <h3>Thanks, we&rsquo;ve got it</h3><p>We&rsquo;ll reply to <b>${esc(mail)}</b>, usually within one working day.</p>
      <dl class="hf-sum"><dt>Reference</dt><dd>${ref}</dd><dt>Type</dt><dd>${k()[1]}</dd><dt>Subject</dt><dd>${esc(subject)}</dd><dt>Area</dt><dd>${esc(area)}</dd>${n ? `<dt>Screenshots</dt><dd>${n}</dd>` : ''}</dl></div>`;
    footer.innerHTML = `<button type="button" class="btn btn-quiet" data-hf-again>Send another</button><button type="button" class="btn btn-primary" data-hf-close>Done</button>`;
    shots.forEach((s) => URL.revokeObjectURL(s.url)); shots = [];
    footer.querySelector('[data-hf-close]').focus();
  }

  function open() {
    back = document.activeElement;
    // on a phone the side menu is a drawer of its own: it closes first
    const sn = document.getElementById('sn'), tg = document.getElementById('sn-toggle');
    if (sn && sn.classList.contains('is-open') && tg) tg.click();
    if (sent || !body.innerHTML) paintForm();
    el.hidden = false; document.documentElement.style.overflow = 'hidden';
    void el.offsetWidth; el.classList.add('is-open'); // laid out first, so it slides in
    setTimeout(() => { const s = body.querySelector('#hf-subject'); (s || form).focus({ preventScroll: true }); }, 320);
  }
  function close() {
    el.classList.remove('is-open'); document.documentElement.style.overflow = '';
    setTimeout(() => { el.hidden = true; }, 300);
    if (back && back.focus) back.focus({ preventScroll: true });
  }
  window.CMHelp = { open, close };

  item.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); open(); }, true);
  if (location.hash === '#help') open();

  el.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-hf-close]')) { close(); return; }
    if (t.closest('[data-hf-again]')) { paintForm(); body.querySelector('#hf-subject').focus(); return; }
    if (t.closest('#hf-drop, [data-hf-add]')) { body.querySelector('#hf-file').click(); return; }
    const rm = t.closest('[data-hf-rm]');
    if (rm) { const [s] = shots.splice(+rm.dataset.hfRm, 1); URL.revokeObjectURL(s.url); body.querySelector('#hf-shot-err').textContent = ''; paintShots(); (body.querySelector('.hf-add, .hf-shot-v') || body.querySelector('#hf-drop')).focus(); return; }
    const v = t.closest('[data-hf-view]');
    if (v) { const s = shots[+v.dataset.hfView]; if (window.CMFiles && window.CMFiles.view) window.CMFiles.view({ name: s.file.name, type: s.file.type, size: s.file.size, blob: s.file }); else window.open(s.url, '_blank'); }
  });
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.id === 'hf-drop') { e.preventDefault(); body.querySelector('#hf-file').click(); }
    if (e.key === 'Tab') { // keep focus inside the drawer
      const f = [...form.querySelectorAll('button, input:not([type=file]), select, textarea, [tabindex="0"]')].filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });
  el.addEventListener('change', (e) => {
    if (e.target.name === 'hf-kind') { kind = e.target.value; body.querySelector('#hf-subject').placeholder = k()[2]; body.querySelector('#hf-desc').placeholder = k()[3]; }
    if (e.target.id === 'hf-file') { take(e.target.files); e.target.value = ''; }
    if (e.target.id === 'hf-area' && e.target.value) { e.target.classList.remove('is-bad'); body.querySelector('#hf-area-err').textContent = ''; }
  });
  el.addEventListener('input', (e) => {
    if (e.target.id === 'hf-desc') { if (e.target.value.length > MAX) e.target.value = e.target.value.slice(0, MAX); count(); }
    if (e.target.classList.contains('is-bad') && e.target.value.trim()) { e.target.classList.remove('is-bad'); body.querySelector(`#${e.target.id}-err`).textContent = ''; }
  });
  el.addEventListener('paste', (e) => {
    const imgs = [...(e.clipboardData ? e.clipboardData.files : [])].filter((f) => /^image\//.test(f.type));
    if (imgs.length) { e.preventDefault(); take(imgs.map((f, i) => (f.name && f.name !== 'image.png' ? f : new File([f], `Pasted image ${shots.length + i + 1}.png`, { type: f.type })))); }
  });
  // a file dropped anywhere on the open drawer is taken (never opened by the browser instead)
  ['dragenter', 'dragover'].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); const d = body.querySelector('#hf-drop'); if (d && !sent) d.classList.add('is-drop'); }));
  el.addEventListener('dragleave', (e) => { if (!el.contains(e.relatedTarget)) { const d = body.querySelector('#hf-drop'); if (d) d.classList.remove('is-drop'); } });
  el.addEventListener('drop', (e) => { e.preventDefault(); const d = body.querySelector('#hf-drop'); if (d) d.classList.remove('is-drop'); if (!sent) take(e.dataTransfer.files); });
  form.addEventListener('submit', (e) => { e.preventDefault(); if (check()) paintDone(); });
})();
