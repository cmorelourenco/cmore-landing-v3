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
  const reason = (q, key, s) => {
    const m = s.meta[key]; if (!m) return '';
    if (m.why) return m.why;
    if (m.by === 'flag') return (q.a && q.a.by === 'flag' && q.a.why) || (key.includes('.') ? NOT_FOUND : DECLARE);
    return (q.a && q.a.why) || '';
  };

  return { KEY, load, save, blank, status, almaPct, almaLeft, handTo, handMore, reading, each, subKey, open, answered, needs, rowNeeds, counts, ready, apply, problem, reason, has, SPHERES };
})();
