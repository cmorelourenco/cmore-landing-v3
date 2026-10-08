/* The ESG Questionnaire's card on the Questionnaires page: how far it is, whether ALMA is
   reading for it, what still waits on you, or that it has gone in. The first time, before
   anything is answered, opening it asks how you want to start: hand ALMA your documents, or
   start on your own. */
(() => {
  const cardEl = document.getElementById('qst-esg'); if (!cardEl || !window.ESG) return;
  const statusEl = document.getElementById('qst-esg-status'), k = document.getElementById('qst-esg-k');
  const pct = document.getElementById('qst-esg-pct'), meter = document.getElementById('qst-esg-meter');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let tick = null;

  const show = (label, value, line, cls) => {
    k.textContent = label; pct.textContent = value + '%';
    meter.querySelector('i').style.width = value + '%'; meter.setAttribute('aria-valuenow', value);
    meter.setAttribute('aria-label', label === 'Reading' ? 'ALMA reading your documents' : 'ESG Questionnaire completion');
    meter.classList.toggle('is-busy', label === 'Reading');
    statusEl.hidden = !line; statusEl.className = 'qst-status' + (cls ? ' ' + cls : ''); statusEl.innerHTML = line || '';
  };
  const paint = () => {
    let s = ESG.load(); const st = ESG.status(s);
    if (st === 'ready') { ESG.apply(s); s = ESG.load(); }
    const c = ESG.counts(s);
    if (st === 'reading') {
      show('Reading', ESG.almaPct(s), `ALMA is reading your documents <span>· ${ESG.reading(s).docs.length} of them</span>`, 'is-reading');
      if (!tick) tick = setInterval(paint, 300);
      return;
    }
    clearInterval(tick); tick = null;
    cardEl.href = s.submitted ? 'esg-results.html' : 'esg-questionnaire.html';
    if (s.submitted) { const d = new Date(s.submitted); show('ESG score', ESG.score(s).global, `Submitted <span>· ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()} · View dashboard</span>`, 'is-done'); cardEl.setAttribute('aria-label', 'ESG Questionnaire, submitted. View dashboard'); }
    else if (s.alma) show('Progress', c.pct, c.needs ? `Ready for your review <span>· ${c.needs} need${c.needs === 1 ? 's' : ''} you</span>` : 'Ready to submit', c.needs ? 'is-needs' : 'is-done');
    else show('Progress', c.pct, st === 'started' ? 'In progress' : '', '');
  };

  // how to start: the design system's dialog, two choices
  const choose = () => {
    const d = document.createElement('div'), last = document.activeElement;
    d.className = 'dlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'qst-start-h');
    d.innerHTML = `<div class="dlg-scrim" data-x></div><div class="dlg-card" style="max-width:38rem">
      <button type="button" class="dlg-x" data-x aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
      <div class="dlg-head"><span class="dlg-alma is-big" aria-hidden="true">${ESG.SPHERES}</span><span class="eyebrow">ALMA</span><h2 id="qst-start-h">Shall I make a start on this one?</h2>
        <p>Hand me your company’s policy documents and I’ll read them and fill in every answer I can find. You review each one before anything is submitted. Or open the blank questionnaire and I’ll be alongside as you go.</p></div>
      <div class="dlg-choices"><a class="dlg-choice is-main" href="esg-questionnaire.html?alma=start"><b>Let ALMA handle it</b><span>Give me your documents and I’ll do the first pass.</span></a>
        <a class="dlg-choice" href="esg-questionnaire.html"><b>Start manually</b><span>Open the blank questionnaire and answer it yourself.</span></a></div></div>`;
    document.body.appendChild(d); document.documentElement.classList.add('dlg-open');
    const close = () => { d.remove(); document.documentElement.classList.remove('dlg-open'); if (last && last.focus) last.focus({ preventScroll: true }); };
    d.addEventListener('click', (e) => { if (e.target.closest('[data-x]')) close(); });
    d.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    setTimeout(() => d.querySelector('.dlg-choice').focus(), 120);
  };
  cardEl.addEventListener('click', (e) => { if (ESG.status(ESG.load()) === 'new') { e.preventDefault(); choose(); } });

  paint();
  addEventListener('pageshow', paint); // coming back with the browser's Back button
})();
