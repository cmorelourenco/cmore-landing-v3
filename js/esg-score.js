/* The company score grows with the ESG Questionnaire: until a question is answered there is
   none, and from then on it is the share of the questionnaire answered, out of 100 — your
   answers and ALMA's alike. Prototype: a stand-in until the real scoring rules exist. */
(() => {
  const link = document.getElementById('co-score-link'), ring = document.getElementById('co-ring');
  if (!link || !ring || !window.ESG || !window.ESG_DATA) return;
  let s = ESG.load();
  if (ESG.status(s) === 'ready') { ESG.apply(s); s = ESG.load(); }
  const c = ESG.counts(s); if (!c.answered) return;
  const sc = ESG.score(s).global; // the same score as the dashboard, growing as good answers come in
  ring.classList.remove('co-ring-empty');
  ring.style.setProperty('--p', sc + '%');
  document.getElementById('co-score').textContent = sc;
  if (s.submitted) link.href = 'esg-results.html';
  const note = s.submitted ? 'From your submitted questionnaire · View dashboard' : `From ${c.answered} of ${c.total} answers — keep going`;
  document.getElementById('co-score-note').textContent = note;
  link.setAttribute('aria-label', `Company score ${sc} of 100. ${note}.`);
})();
