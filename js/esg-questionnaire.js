/* The ESG Questionnaire: nine sections, each a plain list of its own questions, in
   C-MORE's own card/pill/input shapes — no assistant, no citations, no confidence
   scores. Answers live only in this tab (nothing is sent anywhere); each field just
   tracks whether it has been answered, to drive the progress meter and the section
   list on the left. */
(() => {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // yn: Yes/No. yn3: Yes/No/Not applicable. choice: the given options. text/number/long: a field.
  const SECTIONS = [
    { id: 'governance', questions: [
      { t: 'Does the company have a Code of Ethics and Conduct or formal procedures in place?', ty: 'yn', subs: [
        { t: 'In which year was the Code last reviewed and approved?', ty: 'text' },
        { t: 'Is the Code published externally, on the company website or a supplier portal?', ty: 'yn' },
        { t: 'Who signs off changes to it?', ty: 'text' },
      ] },
      { t: 'Does the company have an Anti-Corruption, Bribery and Extortion Policy?', ty: 'yn' },
      { t: 'Does the company have a policy for the protection of the personal data of its employees, third parties and stakeholders (suppliers, customers, shareholders, etc.)?', ty: 'yn' },
      { t: 'Does the company provide regular training for employees on information security, data privacy or data protection?', ty: 'yn' },
      { t: 'Does the company have a formal corporate governance structure, with a clear definition of the composition, roles and responsibilities of the governance bodies?', ty: 'yn3' },
      { t: 'Does the company carry out Risk Management and Internal Controls?', ty: 'yn3' },
      { t: 'Does the company have a formal process for the pre-qualification of suppliers?', ty: 'yn', subs: [
        { t: 'How many suppliers were pre-qualified in the last 12 months?', ty: 'number' },
        { t: 'Does the pre-qualification include ESG criteria?', ty: 'yn' },
        { t: 'How often is a qualified supplier re-assessed?', ty: 'text' },
      ] },
      { t: 'Does the company require its suppliers and partners to commit to respecting human rights (e.g. prohibition of child labour, slave labour, forced labour, minimum working conditions, etc.) and labour standards?', ty: 'yn' },
      { t: 'Do you have a system in place that enables you to identify your most critical suppliers in terms of social risks and human rights compliance?', ty: 'yn' },
      { t: 'Does the company require its suppliers, either contractually or through other formal instruments, to adhere to ESG policies and standards in contracts or other instruments?', ty: 'yn' },
      { t: 'Is the company located in, does it supply products/services to, or does it use in its supply chain items originating from regions classified as CAHRAs (Conflict-Affected or High-Risk Areas)?', ty: 'yn' },
      { t: 'Is the company considered a "Sanctioned Person", understood as any entity or individual listed on official sanctions lists, including — but not limited to — lists published by agencies of the United States, the United Kingdom, the European Union and its Member States, the United Nations, or other relevant jurisdictions?', ty: 'yn' },
      { t: 'Is the company headquartered, registered, incorporated or directly or indirectly controlled by any entity or government located in a country or region subject to international sanctions or embargoes, or included on a sanctions list issued by an authority such as the United States, the United Kingdom, the European Union, its Member States or the United Nations?', ty: 'yn' },
      { t: 'How often is Code of Ethics training delivered to employees?', ty: 'choice', opts: ['On joining only', 'Once a year', 'Every two years', 'It is not delivered'] },
      { t: 'Who is accountable for the compliance programme?', ty: 'choice', opts: ['The board', 'A compliance officer', 'The legal department', 'No one formally'] },
    ] },
    { id: 'social', questions: [
      { t: 'Does the company have a Corporate Policy or similar formally established document setting out guidelines relating to the defence of human rights?', ty: 'yn', subs: [
        { t: 'When was the policy last reviewed?', ty: 'text' },
      ] },
      { t: 'Does the company provide awareness-raising initiatives, training, skills development or engagement activities for its employees on issues relating to human rights?', ty: 'yn' },
      { t: 'Does the company have a human rights risk assessment that it considers relevant to its business?', ty: 'yn' },
      { t: 'Does the company fully comply with labour legislation and the applicable collective agreements relating to working hours, including limits on normal and overtime hours, time banks and statutory breaks?', ty: 'yn3', subs: [
        { t: 'Explain how the legislation is fully complied with.', ty: 'long' },
      ] },
      { t: "Do the company's employees have the right to freedom of association and the right to collective bargaining?", ty: 'yn3' },
      { t: 'Does the company comply with current legislation regarding child labour and forced labour?', ty: 'yn' },
      { t: 'Does the company have a policy to prevent or mitigate risks of harassment — including psychological, sexual and electoral harassment, amongst others — at all hierarchical levels of the workplace?', ty: 'yn3' },
      { t: 'Does the company have an anti-discrimination policy, covering the grounds it considers relevant to its workforce?', ty: 'yn', subs: [
        { t: 'Describe the policies and practices adopted by the company.', ty: 'long' },
      ] },
      { t: 'Does the company have diversity and inclusion programmes in place for its employees?', ty: 'yn', subs: [
        { t: 'Describe the programme adopted by the company.', ty: 'long' },
      ] },
      { t: 'Does the company have facilities or carry out activities that may have an impact on local communities, or involve traditional groups or people in socially vulnerable situations?', ty: 'yn' },
      { t: 'Does the company support or carry out social projects in local communities?', ty: 'yn', subs: [
        { t: 'Describe the projects supported or carried out by the company.', ty: 'long' },
      ] },
      { t: 'Does the company have a Health and Safety policy or practical rules in place?', ty: 'yn', subs: [
        { t: 'Is there a named person or committee accountable for health and safety?', ty: 'yn' },
        { t: 'How often are the rules reviewed with employees?', ty: 'text' },
      ] },
      { t: 'If there has been a workplace health and safety incident, state the reason and the corrective measures taken by the company.', ty: 'long' },
      { t: 'How are health and safety incidents recorded?', ty: 'choice', opts: ['On paper forms', 'In a shared spreadsheet', 'In a dedicated system', 'They are not formally recorded'] },
    ] },
    { id: 'environment', questions: [
      { t: 'Does the company hold a valid environmental operating licence and comply with all the legal environmental requirements applicable to the activity?', ty: 'yn', subs: [
        { t: 'Which authority issued the licence, and when does it run to?', ty: 'text' },
      ] },
      { t: 'Does the company carry out internal environmental education initiatives and provide regular training for employees on topics related to the environment?', ty: 'yn' },
      { t: 'Has the company, in the last 5 years, been found liable in any legal proceedings involving a breach of environmental legislation, or received a notice of infringement, a fine, a cease-and-desist order, an embargo or any other sanction relating to environmental issues?', ty: 'yn' },
      { t: 'If so, describe the incident and the penalty imposed.', ty: 'long' },
    ] },
    { id: 'climate', questions: [
      { t: 'Does the company measure and record its greenhouse gas emissions (Scope 1 and Scope 2)?', ty: 'yn', subs: [
        { t: 'Which baseline year do the figures start from?', ty: 'text' },
      ] },
      { t: 'Does the company have a published target to reduce its greenhouse gas emissions?', ty: 'yn' },
      { t: 'Does the company monitor its total energy consumption and the share that comes from renewable sources?', ty: 'yn3' },
      { t: 'Does the company have an energy efficiency programme covering its main processes or facilities?', ty: 'yn' },
      { t: 'Has the company assessed the physical and transition risks that climate change poses to its operations?', ty: 'yn' },
      { t: 'Which greenhouse gas inventory standard does the company follow?', ty: 'choice', opts: ['The GHG Protocol', 'ISO 14064', 'A national methodology', 'None of these'] },
    ] },
    { id: 'water', questions: [
      { t: 'Does the company measure its total water withdrawal and identify the sources it draws from?', ty: 'yn' },
      { t: 'Does the company operate in or draw water from an area classified as water-stressed?', ty: 'yn' },
      { t: "Does the company treat its effluents before discharge, in line with the conditions of its licence?", ty: 'yn3', subs: [
        { t: 'Which parameters are monitored before discharge?', ty: 'text' },
        { t: 'Are the results reported to the environmental authority?', ty: 'yn' },
      ] },
      { t: 'Describe the water reuse or recycling in place and the share of total water it covers.', ty: 'long' },
    ] },
    { id: 'waste', questions: [
      { t: 'Does the company classify, segregate and record the waste it generates, including hazardous waste?', ty: 'yn', subs: [
        { t: 'Who is the licensed operator that receives the hazardous waste?', ty: 'text' },
      ] },
      { t: 'Does the company send any waste to landfill or to another form of final disposal?', ty: 'yn3' },
      { t: 'Describe the waste streams sent to final disposal and the volumes involved.', ty: 'long' },
      { t: 'Does the company control and monitor the storage of tailings, slag or other process residues?', ty: 'yn3' },
    ] },
    { id: 'biodiversity', questions: [
      { t: "Are any of the company's operations located in, or next to, a protected area or an area of high biodiversity value?", ty: 'yn' },
      { t: 'Describe the area and the controls the company applies there.', ty: 'long' },
      { t: 'Does the company carry out an environmental impact assessment before opening or expanding a site?', ty: 'yn', subs: [
        { t: 'Which body reviews the assessment before work starts?', ty: 'text' },
        { t: 'Is a monitoring programme kept in place afterwards?', ty: 'yn' },
      ] },
      { t: 'Does the company have a land rehabilitation or closure plan for the areas it uses?', ty: 'yn3' },
    ] },
    { id: 'infosec', questions: [
      { t: 'Does the company have a formally established Information Security Policy?', ty: 'yn', subs: [
        { t: 'When was the policy last approved?', ty: 'text' },
        { t: 'Where is the policy published?', ty: 'choice', opts: ['On the intranet', 'On the supplier portal', 'On the public website', 'It is not published'] },
      ] },
      { t: "Is the company's information security management system certified to ISO/IEC 27001 or an equivalent standard?", ty: 'yn3' },
      { t: 'Does the company have an incident response procedure for information security incidents?', ty: 'yn', subs: [
        { t: 'Within how many hours must an incident be reported internally?', ty: 'number' },
        { t: 'Has the procedure been tested in the last 12 months?', ty: 'yn' },
      ] },
      { t: 'If there has been a data security incident or breach, describe it and the measures taken afterwards.', ty: 'long' },
      { t: 'Does the company have a business continuity or disaster recovery plan covering its critical systems?', ty: 'yn' },
      { t: 'How often are user access rights reviewed?', ty: 'choice', opts: ['Monthly', 'Quarterly', 'Once a year', 'Only when someone leaves'] },
    ] },
    { id: 'product', questions: [
      { t: 'Can the company trace the origin of the raw materials used in the products it supplies?', ty: 'yn', subs: [
        { t: 'How far back can the material be traced — mine, smelter or first processor?', ty: 'text' },
      ] },
      { t: 'Does the company have a policy on conflict minerals or on responsibly sourced minerals?', ty: 'yn3' },
      { t: 'Does the company require its own suppliers to declare the origin of the materials they provide?', ty: 'yn' },
      { t: 'List the certifications held relating to the origin or chain of custody of materials, and the date each one runs to.', ty: 'long' },
      { t: 'How far back can a batch be traced?', ty: 'text' },
    ] },
  ];

  let qid = 0;
  const answered = new Set();
  let total = 0;

  const answerHtml = (q) => {
    if (q.ty === 'yn' || q.ty === 'yn3') {
      const id = 'q' + (++qid); total++;
      const opts = q.ty === 'yn3' ? ['Yes', 'No', 'Not applicable'] : ['Yes', 'No'];
      return `<div class="esgq-ans" role="group" data-qid="${id}">` + opts.map((o) => `<button type="button" class="esgq-opt" aria-pressed="false">${o}</button>`).join('') + `</div>`;
    }
    if (q.ty === 'choice') {
      const id = 'q' + (++qid); total++;
      return `<div class="esgq-ans" role="group" data-qid="${id}">` + q.opts.map((o) => `<button type="button" class="esgq-opt" aria-pressed="false">${esc(o)}</button>`).join('') + `</div>`;
    }
    const id = 'q' + (++qid); total++;
    if (q.ty === 'number') return `<div class="esgq-field" data-qid="${id}"><input class="input" type="number" inputmode="numeric" placeholder="0" style="max-width:10rem"></div>`;
    if (q.ty === 'long') return `<div class="esgq-field" data-qid="${id}"><textarea class="input" placeholder="Type your answer"></textarea></div>`;
    return `<div class="esgq-field" data-qid="${id}"><input class="input" type="text" placeholder="Type your answer"></div>`;
  };

  const renderQ = (q, n) => {
    let html = `<div class="esgq-q"><div class="esgq-q-main"><span class="esgq-q-n" aria-hidden="true">${n}</span><span class="esgq-q-t">${esc(q.t)}</span></div>${answerHtml(q)}`;
    if (q.subs && q.subs.length) {
      html += '<div class="esgq-subs">' + q.subs.map((s) => `<div class="esgq-sub"><span class="esgq-sub-t">${esc(s.t)}</span>${answerHtml(s)}</div>`).join('') + '</div>';
    }
    html += '</div>';
    return html;
  };

  SECTIONS.forEach((sec) => {
    const card = document.querySelector(`[data-esgq="${sec.id}"]`); if (!card) return;
    card.querySelector('[data-esgq-list]').innerHTML = sec.questions.map((q, i) => renderQ(q, i + 1)).join('');
    const count = card.querySelector('[data-esgq-count]');
    if (count) count.textContent = sec.questions.length + (sec.questions.length === 1 ? ' question' : ' questions');
  });

  const pctEl = document.getElementById('esgq-pct'), barEl = document.getElementById('esgq-bar');
  const updateProgress = () => {
    const pct = total ? Math.round((answered.size / total) * 100) : 0;
    if (pctEl) pctEl.textContent = pct + '%';
    if (barEl) barEl.style.width = pct + '%';
  };

  // The card itself shows whether anything inside it (its own field, or a sub's) has an answer.
  const syncCard = (el) => {
    const card = el.closest('.esgq-q'); if (!card) return;
    const has = [...card.querySelectorAll('[data-qid]')].some((f) => answered.has(f.dataset.qid));
    card.classList.toggle('is-answered', has);
  };

  // Yes/No/choice: single-select among the buttons in the same group.
  document.querySelectorAll('.esgq-ans').forEach((group) => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.esgq-opt'); if (!btn) return;
      group.querySelectorAll('.esgq-opt').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      answered.add(group.dataset.qid); updateProgress(); syncCard(group);
    });
  });
  // Text, number, long: answered once there is something in the field.
  document.querySelectorAll('.esgq-field').forEach((field) => {
    const input = field.querySelector('input, textarea'); if (!input) return;
    input.addEventListener('input', () => {
      if (input.value.trim()) answered.add(field.dataset.qid); else answered.delete(field.dataset.qid);
      updateProgress(); syncCard(field);
    });
  });
  updateProgress();

  // The section in view is the one marked on the left, same as Settings.
  const links = [...document.querySelectorAll('.set-nav a')];
  const cards = links.map((a) => document.querySelector(a.getAttribute('href')));
  const mark = () => {
    let on = 0;
    cards.forEach((c, i) => { if (c && c.getBoundingClientRect().top < innerHeight * 0.35) on = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) on = cards.length - 1;
    links.forEach((a, i) => a.classList.toggle('is-on', i === on));
  };
  addEventListener('scroll', mark, { passive: true });
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); const t = document.querySelector(a.getAttribute('href'));
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 96, behavior: 'smooth' }); history.replaceState(null, '', a.getAttribute('href'));
  }));
  setTimeout(mark, 120);
})();
