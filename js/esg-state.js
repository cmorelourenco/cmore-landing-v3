/* The ESG Questionnaire's state, shared by every page that shows it: the answers, who gave
   each one, ALMA's reading of the documents handed to her, and whether it has been submitted.
   Prototype: kept in this tab's session, like the rest of the demo. The parts that read the
   questions themselves (applying ALMA's answers, counting) need js/esg-data.js loaded first;
   the rest works on any page. */
window.ESG = (() => {
  const KEY = 'cm-esg';
  const blank = () => ({ v: {}, na: {}, meta: {}, comments: {}, alma: null, submitted: null, read: false });
  const load = () => { try { return Object.assign(blank(), JSON.parse(sessionStorage.getItem(KEY) || 'null') || {}); } catch (e) { return blank(); } };
  const save = (s) => { try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  const SPHERES = '<span class="alma-comp"><span class="alma-sphere" style="left:0.000%;top:28.230%;width:26.240%;height:25.180%;--i:0;--ox:214.83%;--oy:79.97%;--orbit:21.60s"><span class="alma-radial" style="--rx:-53.00%;--ry:-9.64%;--radial:13.00s"><img class="a" src="images/sphere-01.webp" alt="" draggable="false"><img class="b" src="images/sphere-02.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:19.460%;top:13.680%;width:47.050%;height:45.160%;--i:1;--ox:78.45%;--oy:76.81%;--orbit:50.70s"><span class="alma-radial" style="--rx:-18.02%;--ry:-16.98%;--radial:15.90s"><img class="a" src="images/sphere-03.webp" alt="" draggable="false"><img class="b" src="images/sphere-04.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:49.550%;top:0.000%;width:37.780%;height:36.260%;--i:2;--ox:18.06%;--oy:133.39%;--orbit:36.40s"><span class="alma-radial" style="--rx:12.39%;--ry:-32.35%;--radial:18.80s"><img class="a" src="images/sphere-05.webp" alt="" draggable="false"><img class="b" src="images/sphere-06.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:38.350%;top:1.300%;width:52.940%;height:50.810%;--i:3;--ox:34.04%;--oy:92.63%;--orbit:47.70s"><span class="alma-radial" style="--rx:7.33%;--ry:-19.57%;--radial:21.70s"><img class="a" src="images/sphere-07.webp" alt="" draggable="false"><img class="b" src="images/sphere-08.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:66.410%;top:38.550%;width:28.270%;height:27.140%;--i:4;--ox:-35.51%;--oy:36.17%;--orbit:42.50s"><span class="alma-radial" style="--rx:48.43%;--ry:7.83%;--radial:24.60s"><img class="a" src="images/sphere-09.webp" alt="" draggable="false"><img class="b" src="images/sphere-10.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:22.740%;top:36.380%;width:54.290%;height:52.110%;--i:5;--ox:61.95%;--oy:23.00%;--orbit:53.45s"><span class="alma-radial" style="--rx:-8.10%;--ry:18.30%;--radial:27.50s"><img class="a" src="images/sphere-11.webp" alt="" draggable="false"><img class="b" src="images/sphere-12.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:27.150%;top:51.150%;width:38.910%;height:37.340%;--i:6;--ox:75.10%;--oy:-7.45%;--orbit:46.06s"><span class="alma-radial" style="--rx:-13.29%;--ry:30.43%;--radial:30.40s"><img class="a" src="images/sphere-13.webp" alt="" draggable="false"><img class="b" src="images/sphere-14.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:48.650%;top:69.390%;width:31.890%;height:30.610%;--i:7;--ox:24.21%;--oy:-68.68%;--orbit:32.66s"><span class="alma-radial" style="--rx:9.27%;--ry:42.66%;--radial:33.30s"><img class="a" src="images/sphere-15.webp" alt="" draggable="false"><img class="b" src="images/sphere-16.webp" alt="" draggable="false"></span></span><span class="alma-sphere" style="left:70.820%;top:60.160%;width:29.180%;height:28.010%;--i:8;--ox:-49.51%;--oy:-42.10%;--orbit:27.04s"><span class="alma-radial" style="--rx:35.20%;--ry:32.57%;--radial:36.20s"><img class="a" src="images/sphere-17.webp" alt="" draggable="false"><img class="b" src="images/sphere-18.webp" alt="" draggable="false"></span></span></span>';

  // ---- ALMA's reading: a start time and a length, so any page can tell how far she is ----
  // the reading under way: the first one, or a later batch of documents (s.alma.pending)
  const run = (s) => s.alma && (s.alma.pending || s.alma);
  const almaPct = (s) => { const r = run(s); return r ? Math.max(0, Math.min(100, Math.round(((Date.now() - r.started) / r.dur) * 100))) : 0; };
  const almaLeft = (s) => { const r = run(s); return r ? Math.max(0, r.started + r.dur - Date.now()) : 0; };
  const reading = (s) => (s.alma ? (s.alma.pending || (!s.alma.applied ? s.alma : null)) : null);
  const filledAny = (s) => Object.values(s.v).some((x) => x !== '' && x != null) || Object.values(s.na).some(Boolean);
  const status = (s) => {
    if (s.submitted) return 'submitted';
    if (reading(s)) return almaPct(s) >= 100 ? 'ready' : 'reading';
    if (s.alma) return 'review';
    return filledAny(s) ? 'started' : 'new';
  };
  const handTo = (s, docs) => {
    s.alma = { started: Date.now(), dur: 3500 + 2200 * docs.length, docs, applied: false };
    s.read = false; save(s);
  };
  // more documents once she has answered: mode is 'gaps' (complete what is empty), 'pick' (redo these keys) or 'all' (start over)
  const handMore = (s, docs, mode, keys) => {
    s.alma.pending = { started: Date.now(), dur: 2500 + 1800 * docs.length, docs, mode, keys: keys || [] };
    save(s);
  };

  // ---- what counts as an answer -------------------------------------------------------------
  const THIS_YEAR = new Date().getFullYear();
  const RULES = {
    year: (t) => (!/^\d{4}$/.test(t) ? 'Give the year as four digits — 2025, for example.' : +t > THIS_YEAR ? 'That year has not happened yet. Give the year it was actually done.' : +t < 1900 ? 'That looks too far back to be right — check the year.' : ''),
    count: (t) => (/[.,]/.test(t) ? 'Give this as a whole number.' : !/^\d{1,6}$/.test(t) ? 'Digits only — 48, for example.' : ''),
    when: (t) => { const m = t.match(/(1[89]\d{2}|20\d{2})/); return !m ? 'Give at least the year — “July 2025”, or 2025.' : +m[1] > THIS_YEAR ? 'That date has not happened yet.' : ''; },
    text: (t) => (t.length < 12 ? 'Say a little more — this needs at least 12 characters.' : !/[A-Za-zÀ-ɏ]{3}/.test(t) ? 'This should be written out, not just figures or symbols.' : ''),
  };
  const problem = (q, v) => (q.ty === 'text' && v && v.trim() ? (RULES[q.val] || RULES.text)(v.trim()) : '');
  const has = (v) => v != null && String(v).trim() !== '';

  // ---- the questions (needs js/esg-data.js) -------------------------------------------------
  const each = (fn) => (window.ESG_DATA ? ESG_DATA.sections : []).forEach((sec) => sec.questions.forEach((q, i) => fn(q, `${sec.id}-${i + 1}`, sec, i + 1)));
  const subKey = (key, i) => `${key}.${i + 1}`;
  const open = (s, key) => s.v[key] === 'yes' && !s.na[key];
  const okRow = (s, q, key) => has(s.v[key]) && !problem(q, s.v[key]);
  const answered = (s, q, key) => {
    if (s.na[key]) return true;
    if (!okRow(s, q, key)) return false;
    return !(q.subs && open(s, key)) || q.subs.every((sq, i) => okRow(s, sq, subKey(key, i)));
  };
  // a row still waits on you: ALMA left it to you, you turned her answer down, or she was unsure and nobody has looked
  const rowNeeds = (s, q, key) => {
    const m = s.meta[key]; if (!m) return false;
    if (m.by === 'flag' || m.rejected) return !okRow(s, q, key) && !s.na[key];
    return m.by === 'alma' && m.conf === 'low' && !m.approved && !m.edited && !m.commented; // a comment means someone looked
  };
  const needs = (s, q, key) => rowNeeds(s, q, key) || (!!q.subs && open(s, key) && q.subs.some((sq, i) => rowNeeds(s, sq, subKey(key, i))));
  const byAlma = (s, key) => { const m = s.meta[key]; return !!m && m.by === 'alma' && !m.rejected; };
  const counts = (s) => {
    const c = { total: 0, answered: 0, needs: 0, alma: 0, you: 0, sections: {} };
    each((q, key, sec) => {
      const S = c.sections[sec.id] || (c.sections[sec.id] = { total: 0, answered: 0, needs: 0 });
      const a = answered(s, q, key), n = needs(s, q, key);
      c.total++; S.total++;
      if (a) { c.answered++; S.answered++; if (byAlma(s, key)) c.alma++; else c.you++; }
      if (n) { c.needs++; S.needs++; }
    });
    c.pct = c.total ? Math.round((c.answered / c.total) * 100) : 0;
    return c;
  };
  const ready = (s) => { let first = null, gaps = 0, review = 0, bad = 0; each((q, key) => {
    const rows = [[q, key]].concat(q.subs && open(s, key) ? q.subs.map((sq, i) => [sq, subKey(key, i)]) : []);
    if (rows.some(([qq, k]) => has(s.v[k]) && problem(qq, s.v[k]))) bad++;
    else if (!answered(s, q, key)) gaps++;
    else if (needs(s, q, key)) review++;
    else return;
    first = first || key; }); return { ok: !gaps && !review && !bad, gaps, review, bad, first }; };

  // ---- ALMA's answers go in where nothing is there yet; what you already answered stays yours ----
  const DECLARE = 'This is a declaration about your own operations — it isn’t something I can read from documents.';
  const NOT_FOUND = 'I found the Yes above, but not this detail in the documents — it needs you.';
  // her planned answer goes in (follow-ups too, where empty or forced); a redone answer is hers again, review and all
  const entry = (s, q, key, force) => {
    const a = q.a; if (!a || a.by !== 'alma') return false;
    s.v[key] = a.v; s.na[key] = false; s.meta[key] = { by: 'alma', conf: a.conf, orig: a.v };
    if (q.subs && a.v === 'yes') q.subs.forEach((sq, i) => {
      const k = subKey(key, i); if (has(s.v[k]) && !force) return;
      if (sq.a) { s.v[k] = sq.a.v; s.meta[k] = { by: 'alma', conf: sq.a.conf, orig: sq.a.v }; }
      else { if (force) s.v[k] = ''; s.meta[k] = { by: 'flag' }; }
    });
    return true;
  };
  const firstPass = (s) => {
    let n = 0;
    each((q, key) => {
      const a = q.a; if (!a || s.na[key] || has(s.v[key])) return;
      if (entry(s, q, key)) n++; else s.meta[key] = { by: 'flag' };
    });
    return n;
  };
  // complete what is empty: where she has an answer for it, it goes in, read from the newest document;
  // where she has none, it stays empty and she says the new documents did not cover it either
  const fillGaps = (s, file) => {
    let n = 0, m = 0;
    each((q, key) => {
      if (answered(s, q, key)) return;
      m++;
      const a = q.a, v = a && (a.by === 'alma' || a.by === 'user') ? a.v : null;
      if (has(s.v[key]) || !v || (q.ty === 'text' && problem(q, v))) {
        if (!has(s.v[key])) s.meta[key] = { by: 'flag', why: `I looked again in ${file}, and it doesn’t cover this one either — it still needs you.` };
        return;
      }
      if (a.by === 'alma') entry(s, q, key);
      else s.meta[key] = { by: 'alma', conf: 'medium', orig: v, src: file,
        why: `This question was still unanswered. ${file} covers it, so I’ve answered it from there — please check I read it the way you meant.`,
        cite: [{ src: file, loc: 'New document', quote: 'The new document addresses what this question asks and states that it is in place.', match: 'states that it is in place' }] };
      s.v[key] = v; s.na[key] = false; n++;
    });
    return { n, m };
  };
  const apply = (s) => {
    if (!s.alma) return;
    if (!s.alma.applied) { s.alma.answered = firstPass(s); s.alma.applied = true; save(s); return; }
    const p = s.alma.pending; if (!p || almaPct(s) < 100) return;
    const names = new Set(s.alma.docs.map((d) => d.name));
    p.docs.forEach((d) => { if (!names.has(d.name)) s.alma.docs.push(d); });
    const newest = p.docs[p.docs.length - 1].name;
    if (p.mode === 'all') {
      s.v = {}; s.na = {}; s.meta = {};
      s.alma.last = { mode: 'all', n: firstPass(s), docs: s.alma.docs.length };
    } else if (p.mode === 'gaps') {
      s.alma.last = Object.assign({ mode: 'gaps', docs: p.docs.length }, fillGaps(s, newest));
    } else {
      let n = 0;
      const byKey = {}; each((q, key) => { byKey[key] = q; });
      p.keys.forEach((key) => { const q = byKey[key]; if (q && entry(s, q, key, true)) n++; });
      s.alma.last = { mode: 'pick', n, docs: p.docs.length };
    }
    delete s.alma.pending; s.read = false; save(s);
  };

  // ---- the score: how good the answers are, not just how many ----------------------------------------
  // Yes is the good answer unless listed in NO_GOOD; exposure questions (where you operate, not how) are
  // not scored; choices are graded; written answers carry no score. Follow-ups weigh half.
  const NO_GOOD = ['governance-11', 'governance-12', 'governance-13', 'social-21', 'environment-3', 'infosec-4', 'waste-2'];
  const CRITICAL = ['governance-12', 'governance-13', 'social-21', 'environment-3'];
  const UNSCORED = ['social-14', 'water-2', 'biodiversity-1'];
  const GRADE = {
    'governance-14': { 'on-joining-only': 0.5, 'once-a-year': 1, 'every-two-years': 0.6, 'it-is-not-delivered': 0 },
    'governance-15': { 'the-board': 1, 'a-compliance-officer': 1, 'the-legal-department': 0.7, 'no-one-formally': 0 },
    'social-23': { 'on-paper-forms': 0.4, 'in-a-shared-spreadsheet': 0.6, 'in-a-dedicated-system': 1, 'they-are-not-formally-recorded': 0 },
    'climate-7': { 'the-ghg-protocol': 1, 'iso-14064': 1, 'a-national-methodology': 0.7, 'none-of-these': 0 },
    'infosec-1.3': { 'on-the-intranet': 0.8, 'on-the-supplier-portal': 1, 'on-the-public-website': 1, 'it-is-not-published': 0 },
    'infosec-7': { monthly: 1, quarterly: 1, 'once-a-year': 0.6, 'only-when-someone-leaves': 0 },
    'product-6': { 'to-the-mine': 1, 'to-the-smelter': 0.7, 'to-the-first-processor': 0.5, 'it-is-not-traced': 0 },
  };
  // what to do about a gap, in the words of an action plan
  const ACTION = {
    'governance-1': 'Draw up a code of ethics and conduct', 'governance-1.2': 'Publish the code of ethics on your website or supplier portal',
    'governance-2': 'Draw up an anti-corruption, bribery and extortion policy', 'governance-3': 'Adopt a personal data protection policy',
    'governance-4': 'Train employees regularly on information security and data privacy', 'governance-5': 'Formalise a governance structure with clear roles',
    'governance-6': 'Set up risk management and internal controls', 'governance-7': 'Create a formal supplier pre-qualification process',
    'governance-7.2': 'Include ESG criteria in supplier pre-qualification', 'governance-8': 'Require suppliers to commit to human and labour rights',
    'governance-9': 'Identify your most critical suppliers for social and human rights risk', 'governance-10': 'Make ESG standards a contractual requirement for suppliers',
    'governance-11': 'Run due diligence on sourcing from conflict-affected or high-risk areas', 'governance-12': 'Resolve your sanctions listing before trading further',
    'governance-13': 'Review ownership and control against sanctions regimes', 'governance-14': 'Deliver Code of Ethics training every year',
    'governance-15': 'Name someone accountable for the compliance programme',
    'social-1': 'Adopt a human rights policy', 'social-1.2': 'Extend the human rights policy to the supply chain', 'social-2': 'Run human rights awareness and training for employees',
    'social-3': 'Carry out a human rights risk assessment', 'social-4': 'Bring working hours in line with labour law and collective agreements',
    'social-6': 'Guarantee freedom of association and collective bargaining', 'social-8': 'Ensure compliance with child and forced labour law',
    'social-9': 'Adopt a policy to prevent harassment at all levels', 'social-10': 'Adopt policies to prevent discrimination', 'social-12': 'Start a diversity and inclusion programme',
    'social-16': 'Support social projects in your local communities', 'social-18': 'Put a health and safety policy in place', 'social-18.1': 'Name a person or committee accountable for health and safety',
    'social-19': 'Ensure compliance with occupational health and safety law', 'social-20': 'Train employees regularly on health and safety',
    'social-21': 'Remediate the human rights violation and prevent recurrence', 'social-23': 'Record health and safety incidents in a dedicated system',
    'environment-1': 'Secure a valid environmental licence and meet its conditions', 'environment-1.2': 'Monitor licence conditions and report on them internally',
    'environment-2': 'Run environmental training for employees', 'environment-3': 'Close out the environmental breach and its corrective actions',
    'climate-1': 'Measure Scope 1 and 2 greenhouse gas emissions', 'climate-1.2': 'Have your emissions figures verified by a third party', 'climate-1.3': 'Extend the emissions inventory to Scope 3',
    'climate-2': 'Set and publish an emissions reduction target', 'climate-4': 'Monitor energy use and the share from renewables', 'climate-5': 'Start an energy efficiency programme',
    'climate-6': 'Assess physical and transition climate risks', 'climate-7': 'Follow a recognised GHG inventory standard',
    'water-1': 'Measure water withdrawal and its sources', 'water-3': 'Treat effluents before discharge', 'water-3.2': 'Report effluent results to the authority', 'water-4': 'Reuse or recycle water in your processes',
    'waste-1': 'Classify, segregate and record all waste', 'waste-1.2': 'Keep disposal certificates for every consignment', 'waste-2': 'Reduce the waste sent to landfill',
    'waste-4': 'Set targets to reduce waste and increase recycling', 'waste-5': 'Monitor the storage of tailings and process residues',
    'biodiversity-3': 'Run an environmental impact assessment before new sites', 'biodiversity-3.2': 'Keep a monitoring programme after impact assessments', 'biodiversity-4': 'Draw up a land rehabilitation and closure plan',
    'infosec-1': 'Adopt an information security policy', 'infosec-1.2': 'Have every employee acknowledge the security policy', 'infosec-1.3': 'Publish the information security policy',
    'infosec-2': 'Certify your security management to ISO/IEC 27001', 'infosec-3': 'Document an incident response procedure', 'infosec-3.2': 'Test the incident response procedure every year',
    'infosec-4': 'Close out the data breach and strengthen controls', 'infosec-6': 'Put a business continuity and disaster recovery plan in place', 'infosec-7': 'Review user access rights at least quarterly',
    'product-1': 'Trace the origin of the raw materials you use', 'product-1.2': 'Record traceability batch by batch', 'product-2': 'Adopt a responsible minerals sourcing policy',
    'product-3': 'Require suppliers to declare the origin of materials', 'product-4': 'Obtain certifications for the materials you supply', 'product-6': 'Trace each batch back to the mine',
  };
  const GROUP = { governance: 'G', infosec: 'G', product: 'G', social: 'S', environment: 'E', climate: 'E', water: 'E', waste: 'E', biodiversity: 'E' };
  const pts = (q, key, v) => {
    if (UNSCORED.includes(key) || q.ty !== 'choice') return null;
    if (GRADE[key]) return GRADE[key][v] ?? 0;
    if (v !== 'yes' && v !== 'no') return null;
    return (v === 'yes') !== NO_GOOD.includes(key) ? 1 : 0;
  };
  const label = (q, v) => { const o = (q.opts || []).find(([x]) => x === v); return o ? o[1] : v; };
  const score = (s) => {
    const sec = {}, out = { flags: [], good: [], actions: [] };
    each((q, key, S) => {
      const rows = [[q, key, 1, null]].concat((q.subs || []).map((sq, i) => [sq, subKey(key, i), 0.5, key]));
      rows.forEach(([qq, k, w, parent]) => {
        if (parent && !(s.v[parent] === 'yes' && !s.na[parent])) return; // a closed follow-up does not count
        if (UNSCORED.includes(k) || qq.ty !== 'choice' || s.na[k]) return;
        const x = sec[S.id] || (sec[S.id] = { earned: 0, max: 0, title: S.title });
        x.max += w;
        const v = s.v[k], p = has(v) ? pts(qq, k, v) : null;
        if (p == null) return;
        x.earned += p * w;
        const item = { key: k, sec: S.id, group: GROUP[S.id], q: qq.t, answer: label(qq, v), critical: CRITICAL.includes(k) && p === 0 };
        if (p === 1) out.good.push(item);
        else { if (p < 0.5) out.flags.push(item); if (ACTION[k]) out.actions.push(Object.assign({ text: ACTION[k], partial: p >= 0.5 }, item)); }
      });
    });
    const pc = (e, m) => (m ? Math.round((e / m) * 100) : 0);
    let E = 0, M = 0; const g = { E: [0, 0], S: [0, 0], G: [0, 0] };
    Object.entries(sec).forEach(([id, x]) => { x.pct = pc(x.earned, x.max); E += x.earned; M += x.max; g[GROUP[id]][0] += x.earned; g[GROUP[id]][1] += x.max; });
    out.flags.sort((a, b) => b.critical - a.critical);
    return Object.assign(out, { global: pc(E, M), sections: sec, groups: { E: pc(...g.E), S: pc(...g.S), G: pc(...g.G) } });
  };
  // prototype only: the whole questionnaire answered and reviewed, as it would be just before submitting
  const FILL = { year: '2024', count: '12', when: 'March 2025', text: 'In place and documented; reviewed by the responsible team every year.' };
  const fillOne = (s, q, key) => {
    if (s.na[key] || (has(s.v[key]) && !problem(q, s.v[key]))) return;
    const a = q.a, planned = a && (a.by === 'alma' || a.by === 'user') && !(q.ty === 'text' && problem(q, a.v)) ? a.v : null;
    s.v[key] = planned != null ? planned : q.ty === 'choice' ? (q.opts.some(([v]) => v === 'no') ? 'no' : q.opts[0][0]) : (FILL[q.val] || FILL.text);
  };
  const complete = (s, docs) => {
    if (!s.alma) s.alma = { started: 0, dur: 1, docs, applied: false };
    if (s.alma.pending) s.alma.pending.started = 0;
    if (!s.alma.applied) s.alma.started = 0;
    apply(s); apply(s);
    each((q, key) => {
      fillOne(s, q, key);
      if (q.subs && open(s, key)) q.subs.forEach((sq, i) => fillOne(s, sq, subKey(key, i)));
    });
    Object.values(s.meta).forEach((m) => { if (m.by === 'alma' && m.conf === 'low' && !m.edited) m.approved = true; if (m.rejected) m.rejected = false; });
    s.read = true; save(s);
  };
  const reason = (q, key, s) => {
    const m = s.meta[key]; if (!m) return '';
    if (m.why) return m.why;
    if (m.by === 'flag') return (q.a && q.a.by === 'flag' && q.a.why) || (key.includes('.') ? NOT_FOUND : DECLARE);
    return (q.a && q.a.why) || '';
  };

  return { KEY, load, save, blank, complete, score, status, almaPct, almaLeft, handTo, handMore, reading, each, subKey, open, answered, needs, rowNeeds, counts, ready, apply, problem, reason, has, SPHERES };
})();
