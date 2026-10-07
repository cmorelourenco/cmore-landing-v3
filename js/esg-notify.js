/* ALMA keeps her promise to "let you know the moment I'm done": wherever you are in the app
   when she finishes reading for the ESG Questionnaire, a toast says so and the bell gains an
   entry that opens the questionnaire. Loaded before each page's notifications script, so an
   entry that is already there at load is counted like the others. Logging out forgets the
   questionnaire along with the rest of the demo session. */
window.ESG_NOTIFY = (() => {
  if (!window.ESG) return null;
  const nt = document.getElementById('nt'), list = nt && nt.querySelector('.nt-list');
  const onPage = !!document.getElementById('qd-stick'); // the questionnaire shows it happening itself
  let item = null;

  const recount = () => {
    const n = document.querySelectorAll('#nt .nt-item.is-unread').length;
    document.querySelectorAll('[data-sn-count]').forEach((c) => { c.textContent = n; if (!n) c.hidden = true; else if (c.dataset.esgShow) c.hidden = false; });
    const bell = document.getElementById('hdr-bell'); if (bell) bell.setAttribute('aria-label', n ? `Notifications, ${n} new` : 'Notifications');
  };
  const read = () => {
    const s = ESG.load(); if (!s.read) { s.read = true; ESG.save(s); }
    if (!item && s.alma) make(false);
    if (item && item.classList.contains('is-unread')) { item.classList.remove('is-unread'); recount(); }
  };
  const make = (unread) => {
    if (!list || item) return;
    const li = document.createElement('li');
    li.innerHTML = `<a href="esg-questionnaire.html" class="nt-item${unread ? ' is-unread' : ''}"><span class="nt-mark nt-info" aria-hidden="true"></span><span class="nt-body"><b>ALMA has finished your ESG Questionnaire</b><span>Her answers are ready for you to review.</span><small>Questionnaires · just now</small></span><span class="nt-dot" aria-label="Unread"></span></a>`;
    list.prepend(li); item = li.firstElementChild;
    // first in line, so the panel's own handler (which opens the company page) never sees it
    item.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); read(); location.href = 'esg-questionnaire.html'; });
  };
  const toast = () => {
    const s = ESG.load();
    let line = 'She answered what your documents cover. Have a look before anything is submitted.';
    if (window.ESG_DATA) { ESG.apply(s); const c = ESG.counts(ESG.load()); line = s.alma.last ? `She has read your new documents; ${c.needs} question${c.needs === 1 ? '' : 's'} need you.` : `She answered ${s.alma.answered} questions from your documents; ${c.needs} need you.`; }
    const t = document.createElement('div');
    t.className = 'alma-toast'; t.setAttribute('role', 'status');
    t.innerHTML = `<span class="dlg-alma" aria-hidden="true">${ESG.SPHERES}</span><span class="alma-toast-t"><b>ALMA has finished your ESG Questionnaire</b>${line}<a href="esg-questionnaire.html">Review her answers</a></span>
      <button type="button" class="dlg-x" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
    document.body.appendChild(t);
    t.querySelector('.dlg-x').addEventListener('click', () => t.remove());
    t.querySelector('a').addEventListener('click', read);
  };

  // remember which counts the page would show, so a new entry can bring a hidden zero back
  document.querySelectorAll('[data-sn-count]').forEach((c) => { c.dataset.esgShow = c.closest('.sn-item, .hdr-bell') && !document.querySelector('#empty:not([hidden])') ? '1' : ''; });
  const s = ESG.load(), st = ESG.status(s);
  if (s.alma && st !== 'reading') make(!s.read && !onPage);
  else if (st === 'reading') setTimeout(() => {
    if (onPage) return; // the questionnaire marks it read when it fills in
    make(true); recount(); toast();
  }, ESG.almaLeft(s) + 50);

  const all = document.getElementById('nt-readall');
  if (all) all.addEventListener('click', () => { const x = ESG.load(); if (x.alma && !x.read) { x.read = true; ESG.save(x); } });
  const out = document.getElementById('who-logout');
  if (out) out.addEventListener('click', () => { try { sessionStorage.removeItem(ESG.KEY); } catch (e) {} });
  return { read };
})();
