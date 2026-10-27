/* ALMA's upload, from any table. Every table of the company's own documents can take a file: a row
   (a company document, one worker's or machine's copy), a cell of the matrix, a worker's or a
   machine's whole row, a whole section, or the drawer. The same dialog answers all of them:
     1 Files    — what can go here, and the files the user adds (as many as they like);
     2 Checking — ALMA reads each one: which document it is, whose name is on it, who issued it and
                  until when it is valid;
     3 Check    — what she found, file by file. A file that names someone else is filed for them
                  (and says so); one she can't place asks the user where it goes. Each can be moved
                  to another document or person, or left out, before anything is saved.
     4 Changes  — whatever differs from what is on file, for the user to approve or reject first:
                  a file replacing one on file (its dates, reference, cover; one that runs out
                  before the current one is flagged), and a new worker list against the crew (who
                  joined, who left, whose job changed). One area at a time, with Previous / Next
                  when the files reach more than one. Nothing on file changes until approved; a
                  rejected file is left out and what was there stays.
   Saved, a company document gets its new file and dates (DOC_MODEL.saveDoc) and a worker's or
   machine's copy its status and expiry (DOC_MODEL.saveRecord); the file itself is kept for its
   drawer (js/doc-files.js). Where it opens from is a spec string:
     'doc:<id>'          one document (a per-record one: any of the people or machines it covers)
     'rec:<code>:<i>'    one worker's or machine's copy of a document
     'who:<kind>:<i>'    any of one worker's or machine's documents
     'area:<key>'        any per-record document of a section (the matrix)
     'all'               anything the company is asked for
   window.CMUpload.open(spec, { files, onSaved }), CMUpload.can(spec).
   Prototype: what ALMA reads is made up from the file's name and the document it lands on. */
window.CMUpload = (() => {
  const M = window.DOC_MODEL; if (!M) return null;
  const esc = (s) => String(s == null ? '' : s).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const plain = (h) => { const el = document.createElement('textarea'); el.innerHTML = String(h).replace(/<[^>]+>/g, ''); return el.value; };
  const hash = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100003, 11);
  const NO_FILE = ['missing', 'na', 'notrequested', 'notuploaded', 'filemissing'];

  // ---- what can be filed: one slot per document, or per document and record ----------------------
  const docSlot = (d) => ({ key: d.code, code: d.code, i: null, d, name: plain(d.name), who: '', status: d.status, exp: d.valid });
  const recSlot = (d, r) => ({ key: `${d.code}#${r.i}`, code: d.code, i: r.i, d, name: plain(d.name), who: plain(M.recordName(d.kind, r.i)), status: r.status, exp: r.exp });
  const live = (d) => d.status !== 'archived' && d.status !== 'na';
  const rosterSlots = (d) => (d.roster || []).map((r) => recSlot(d, r));
  const resolve = (spec) => {
    const [t, a, b] = String(spec).split(':');
    const D = M.DOCS.filter(live);
    if (t === 'doc') {
      const d = M.DOCS.find((x) => x.id === +a); if (!d) return null;
      if (d.kind) return { pool: rosterSlots(d), focus: null, title: `${plain(d.name)}`, lead: `One per ${M.NOUN[d.kind][0]}. ALMA reads whose name is on each file and files it for them.` };
      // the other company documents of its section, in case the file turns out to be one of them
      const pool = [docSlot(d)].concat(D.filter((x) => !x.kind && x !== d && x.area === d.area).map(docSlot));
      return { pool, focus: d.code, title: `${NO_FILE.includes(d.status) ? 'Upload' : 'Replace'} ${plain(d.name)}`, lead: 'ALMA reads it and checks it is this document, for your company, and still valid.' };
    }
    if (t === 'rec') {
      const d = M.DOCS.find((x) => x.code === a && x.kind); if (!d) return null;
      const i = +b, r = d.roster.find((x) => x.i === i); if (!r) return null;
      const who = plain(M.recordName(d.kind, i));
      return { pool: rosterSlots(d), focus: `${a}#${i}`, title: `${plain(d.name)} · ${who}`, lead: `ALMA checks the name on it is ${who}&rsquo;s, and that it&rsquo;s still valid.` };
    }
    if (t === 'who') {
      const i = +b, pool = D.filter((x) => x.kind === a).flatMap((d) => d.roster.filter((r) => r.i === i).map((r) => recSlot(d, r)));
      const who = plain(M.recordName(a, i));
      return { pool, focus: null, title: `Documents for ${who}`, lead: `Any of ${who}&rsquo;s documents. ALMA works out which one each file is.` };
    }
    if (t === 'area') {
      const pool = D.filter((x) => x.area === a && x.kind).flatMap(rosterSlots);
      return { pool, focus: null, title: `Upload documents for your ${M.NOUN[a] ? M.NOUN[a][1] : 'records'}`, lead: `For any of your ${M.NOUN[a] ? M.NOUN[a][1] : 'records'}. ALMA works out which document each file is, and whose name is on it.` };
    }
    const pool = D.flatMap((d) => (d.kind ? rosterSlots(d) : [docSlot(d)]));
    return { pool, focus: null, title: 'Upload documents', lead: 'Any of your documents. ALMA works out which one each file is, and who it is for.' };
  };
  const can = (spec) => { const r = resolve(spec); return !!(r && r.pool.length); };

  // ---- how ALMA reads a file --------------------------------------------------------------------
  const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'certificate', 'document', 'declaration', 'statement', 'record', 'report', 'policy', 'form', 'copy', 'scan', 'scanned', 'final', 'signed', 'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'img', 'image', 'file', 'new', 'version', 'das', 'dos', 'del', 'des']);
  const words = (s) => fold(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));
  const docWords = (sl) => [...new Set(words([sl.name, sl.d.cat.titles || '', sl.d.section || ''].join(' ')).concat([fold(sl.code).replace('-', '')]))];
  const nameWords = (who) => words(who).filter((w) => w.length > 2);
  const fileWords = (f) => { const n = fold(f.name).replace(/\.[a-z0-9]+$/, ''); return { n, w: new Set(n.split(/[^a-z0-9]+/)) }; };
  // the words of a document's name on the file; generic ones (declaration, certificate…) only break
  // ties, and a month named on the file points to a monthly document
  const MONTH_RE = /\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?|janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/;
  const docScore = (sl, fw) => docWords(sl).filter((w) => fw.w.has(w) || (w.length > 5 && fw.n.includes(w))).length
    + 0.5 * fold(sl.name).split(/[^a-z0-9]+/).filter((w) => STOP.has(w) && fw.w.has(w)).length
    + (MONTH_RE.test(fw.n.replace(/[^a-z]+/g, ' ')) && monthsOf(sl.d) === 1 ? 1 : 0)
    + (fw.n.replace(/[^a-z0-9]/g, '').includes(fold(sl.code).replace(/[^a-z0-9]/g, '')) ? 3 : 0);
  // a name counts as on the file when both its first and last names are, or a surname that is no one else's
  const named = (who, fw, everyone) => {
    const ws = nameWords(who); if (!ws.length) return 0;
    const hit = ws.filter((w) => fw.w.has(w));
    if (hit.length >= 2 || hit.length === ws.length) return 2;
    const last = ws[ws.length - 1];
    if (hit.includes(last) && everyone.filter((o) => o !== who && nameWords(o).includes(last)).length === 0) return 1;
    return 0;
  };
  const monthsOf = (d) => { const r = (d.cat.renewal || '').toLowerCase(); return /month/.test(r) && !/6/.test(r) ? 1 : /6|six/.test(r) ? 6 : /3 years/.test(r) ? 36 : 12; };
  const fmt = (dt) => `${dt.getDate()} ${M.MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
  const readDates = (sl, f) => {
    const h = hash(sl.key + f.name), now = new Date(), m = monthsOf(sl.d);
    let issued = new Date(now); issued.setDate(now.getDate() - (m <= 1 ? 2 + (h % 10) : 5 + (h % 40)));
    // a past year in the file's name (an older copy, say) is when it was issued
    const y = +((f.name.match(/(?:^|\D)(20\d\d)(?:\D|$)/) || [])[1] || 0);
    if (y && y < now.getFullYear()) issued = new Date(y, h % 12, 1 + (h % 27));
    if (/no expiry/i.test(sl.d.cat.expiryRule || '')) return { issued: fmt(issued), valid: 'No expiry' };
    const v = new Date(issued); v.setMonth(v.getMonth() + m);
    return { issued: fmt(issued), valid: fmt(v) };
  };

  // ---- what changes: a file against the one on file, a worker list against the crew --------------
  const isList = (d) => (d.cat.fields || []).some((f) => /workers (covered|listed)/i.test(f.name));
  const when = (t) => { const v = Date.parse(t); return Number.isNaN(v) ? null : v; };
  const refFor = (s, r) => M.refOf(s.code + r.file.name, r.read.issued);
  const fileDiff = (r) => {
    const s = r.slot;
    if (NO_FILE.includes(s.status) || s.status === 'processing') return null; // nothing on file to differ from
    const oldV = s.i == null ? s.d.valid : s.exp, newV = r.read.valid;
    const older = when(newV) && when(oldV) && when(newV) < when(oldV);
    const rows = [];
    if (s.i == null && s.d.issued !== '—') rows.push({ label: 'Issue date', from: s.d.issued, to: r.read.issued });
    rows.push({ label: 'Valid until', from: oldV, to: newV, flag: older ? 'It runs out before the one on file. It may be an older copy.' : '' });
    if (s.i == null && s.d.ref) rows.push({ label: 'Reference no.', from: s.d.ref, to: refFor(s, r) });
    if (/insur/i.test(`${s.d.section} ${s.name}`) && hash(r.file.name) % 2 === 0) rows.push({ label: 'Insured amount', from: '&euro;&nbsp;1&nbsp;500&nbsp;000', to: '&euro;&nbsp;1&nbsp;000&nbsp;000', flag: 'Less cover than the policy on file. Check your clients still accept it.' });
    return rows;
  };
  // a worker list, read against the crew on file: two who joined, one who left, one whose job
  // changed. Prototype: every list of the same month says the same; the next one moves on.
  const JOIN = [['Ana Ribeiro', 'Laborer'], ['Joana Matos', 'Electrician'], ['In&ecirc;s Couto', 'Surveyor'], ['Rafael Mendes', 'Carpenter'], ['Tom&aacute;s Vieira', 'Laborer'], ['Marco Leite', 'Welder']];
  const crewDiff = () => {
    const here = (M.PERSON || []).map((p, i) => ({ p, i })).filter((x) => !x.p.left && !x.p.isNew);
    if (!here.length || !M.saveCrew) return [];
    const n = M.crew.added.length + M.crew.left.length;
    const taken = new Set((M.WORKERS || []).map((w) => fold(plain(w[0]))));
    const joins = JOIN.filter(([nm]) => !taken.has(fold(plain(nm)))).slice(0, 2);
    const lab = here.filter((x) => /laborer/i.test(x.p.role));
    const leaver = lab[(3 + n) % lab.length], moved = lab.filter((x) => x !== leaver)[(1 + n) % Math.max(1, lab.length - 1)];
    const out = joins.map(([name, role]) => ({ type: 'join', name, role }));
    if (leaver) out.push({ type: 'leave', i: leaver.i, name: leaver.p.name, role: leaver.p.role });
    if (moved) out.push({ type: 'role', i: moved.i, name: moved.p.name, from: moved.p.role, to: 'Mason' });
    return out.map((c) => Object.assign(c, { decision: null }));
  };
  // one card per file that differs; a worker list's crew changes go with the first list only
  const reviewOf = (results) => {
    let crewDone = false;
    return results.filter((r) => r.on && r.slot).map((r) => {
      const fields = fileDiff(r);
      const crew = !crewDone && isList(r.slot.d) ? crewDiff() : [];
      if (crew.length) crewDone = true;
      if (!fields && !crew.length) return null;
      return { r, area: r.slot.d.area, fields, crew, decision: fields ? null : 'ok' };
    }).filter(Boolean);
  };

  // each file to a slot: whose name is on it first, then which document it reads as, then where it
  // was dropped; what's left goes to what most needs a file. No two files take the same slot.
  const place = (pool, focus, files) => {
    const used = new Set(), everyone = [...new Set(pool.map((s) => s.who).filter(Boolean))];
    const need = (s) => (M.RANK[s.status] || 0);
    return files.map((f) => {
      const fw = fileWords(f), free = pool.filter((s) => !used.has(s.key));
      const people = everyone.map((w) => [w, named(w, fw, everyone)]).filter(([, n]) => n).sort((x, y) => y[1] - x[1]);
      const person = people.length ? people[0][0] : null;
      const scored = free.map((s) => [s, docScore(s, fw)]);
      const best = (list) => list.sort((x, y) => y[1] - x[1] || need(y[0]) - need(x[0]))[0];
      const fs = focus && free.find((s) => s.key === focus);
      let slot = null, how = 'asked', note = '';
      if (person) {
        const theirs = scored.filter(([s]) => s.who === person);
        const pick = fs && fs.who === person ? [fs, docScore(fs, fw)] : best(theirs.filter(([, n]) => n > 0)) || best(theirs);
        if (pick) {
          slot = pick[0]; how = pick[1] > 0 || (fs && slot === fs) ? 'sure' : 'guess';
          if (fs && fs.who && fs.who !== person) note = `It names ${esc(person)}, not ${esc(fs.who)}, so it&rsquo;s filed for ${esc(person)}.`;
        } else { how = 'nobody'; note = `It names ${esc(person)}, who isn&rsquo;t asked for this. Choose where it goes.`; }
      } else {
        const top = best(scored.filter(([, n]) => n > 0));
        if (fs && (!top || top[1] < 2 || top[0] === fs)) { slot = fs; how = 'sure'; }
        else if (top) {
          slot = top[0]; how = 'sure';
          if (fs) note = `It reads as ${esc(slot.name)}, not ${esc(fs.name)}, so it&rsquo;s filed as that.`;
        } else {
          slot = fs || free.sort((x, y) => need(y) - need(x))[0] || null; how = slot ? 'guess' : 'nobody';
          if (!fs && slot) note = `ALMA couldn&rsquo;t tell ${slot.who ? 'whose this is or ' : ''}which document it is. Check where it goes.`;
        }
      }
      if (slot) used.add(slot.key);
      return { file: f, slot, how, note, on: true, read: slot ? readDates(slot, f) : null, conf: how === 'sure' ? 90 + (hash(f.name) % 9) : 72 + (hash(f.name) % 6) };
    });
  };

  // ---- the dialog ---------------------------------------------------------------------------------
  const css = `
.cmu { position: fixed; inset: 0; z-index: 120; /* over the drawers (110) */ display: grid; place-items: center; padding: 1rem; }
.cmu[hidden] { display: none; }
.cmu-scrim { position: absolute; inset: 0; background: rgba(36, 36, 36, .42); opacity: 0; transition: opacity .2s; }
.cmu.is-open .cmu-scrim { opacity: 1; }
.cmu-panel { position: relative; width: min(40rem, 100%); max-height: min(92vh, 52rem); display: flex; flex-direction: column; border-radius: 1rem; background: var(--color-surface, #fff); box-shadow: 0 24px 64px -16px rgba(36, 36, 36, .35); opacity: 0; transform: translateY(8px); transition: opacity .2s, transform .2s; outline: none; }
.cmu.is-open .cmu-panel { opacity: 1; transform: none; }
.cmu-head { display: flex; align-items: flex-start; gap: 0.875rem; padding: 1.5rem 1.5rem 1rem; }
.cmu-t { flex: 1; min-width: 0; }
.cmu-t .eyebrow { margin-bottom: 0.25rem; }
.cmu-t h2 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; color: var(--color-ink); overflow-wrap: anywhere; }
.cmu-t p { margin-top: 0.25rem; font-size: 0.875rem; line-height: 1.5; color: var(--color-ink-subtle); }
.cmu-x { flex: none; display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border: 0; border-radius: 0.5rem; background: none; color: var(--color-ink-subtle); cursor: pointer; }
.cmu-x:hover { background: var(--color-light-beige); color: var(--color-ink); }
.cmu-x svg { width: 1.125rem; height: 1.125rem; }
.cmu-body { flex: 1; min-height: 0; overflow: auto; padding: 0 1.5rem 1rem; display: grid; gap: 1rem; align-content: start; }
.cmu-foot { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem 1.25rem; border-top: 1px solid var(--color-line); }
.cmu-foot .cmu-foot-l { margin-right: auto; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-now { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.75rem 1rem; border-radius: 0.625rem; background: var(--color-off-white); font-size: 0.875rem; }
.cmu-now b { font-weight: 600; color: var(--color-ink); }
.cmu-now span { color: var(--color-ink-subtle); }
.cmu-drop { display: grid; justify-items: center; gap: 0.375rem; padding: 1.75rem 1rem; border: 1.5px dashed var(--color-mid-beige); border-radius: 0.75rem; text-align: center; cursor: pointer; transition: border-color .15s, background .15s; }
.cmu-drop:hover, .cmu-drop.is-over { border-color: var(--color-coral); background: var(--color-coral-tint, #fdf1ee); }
.cmu-drop svg { width: 1.75rem; height: 1.75rem; color: var(--color-coral); }
.cmu-drop b { font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.cmu-drop span { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-drop u { text-decoration: underline; text-underline-offset: 2px; color: var(--color-ink); }
.cmu-list { display: grid; gap: 0.5rem; }
.cmu-list h3, .cmu-h { font-size: 0.75rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--color-ink-subtle); }
.cmu-f { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; border: 1px solid var(--color-line); border-radius: 0.625rem; font-size: 0.875rem; }
.cmu-f .cmu-ic { flex: none; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 0.375rem; background: var(--color-light-beige); color: var(--color-ink-subtle); }
.cmu-f .cmu-ic svg { width: 1rem; height: 1rem; }
.cmu-f .cmu-n { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-ink); }
.cmu-f small { color: var(--color-ink-subtle); white-space: nowrap; }
.cmu-rm { flex: none; border: 0; background: none; padding: 0.25rem; border-radius: 0.375rem; color: var(--color-ink-subtle); cursor: pointer; display: grid; }
.cmu-rm:hover { color: var(--color-ink); background: var(--color-light-beige); }
.cmu-rm svg { width: 1rem; height: 1rem; }
.cmu-f.is-reading .cmu-ic { color: var(--color-coral); }
.cmu-f.is-reading .cmu-ic svg { animation: cmu-spin 0.9s linear infinite; }
.cmu-f.is-done .cmu-ic { background: var(--color-positive-subtle, #e7f2e4); color: var(--color-positive, #3d7a2c); }
@keyframes cmu-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .cmu-f.is-reading .cmu-ic svg { animation: none; } }
.cmu-r { display: grid; gap: 0.75rem; padding: 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; }
.cmu-r.is-off { opacity: .55; }
.cmu-r.is-ask { border-color: var(--color-caution, #d9a21b); }
.cmu-r-h { display: flex; align-items: center; gap: 0.75rem; font-size: 0.875rem; }
.cmu-r-h .cmu-n { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-ink-subtle); }
.cmu-r-h label { display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--color-ink-subtle); cursor: pointer; white-space: nowrap; }
.cmu-to { display: grid; gap: 0.25rem; }
.cmu-to span { font-size: 0.75rem; color: var(--color-ink-subtle); }
.cmu-to select { width: 100%; height: 2.5rem; padding: 0 0.75rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface, #fff); font: inherit; font-size: 0.875rem; color: var(--color-ink); }
.cmu-note { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: var(--color-caution-subtle, #fbf3dc); font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink); }
.cmu-checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem 1rem; margin: 0; }
.cmu-checks div { display: grid; gap: 0.125rem; }
.cmu-checks dt { font-size: 0.75rem; color: var(--color-ink-subtle); }
.cmu-checks dd { display: flex; align-items: center; gap: 0.375rem; margin: 0; font-size: 0.875rem; color: var(--color-ink); }
.cmu-checks dd svg { flex: none; width: 0.9375rem; height: 0.9375rem; color: var(--color-positive, #3d7a2c); }
.cmu-checks dd.is-warn svg { color: var(--color-caution, #d9a21b); }
@media (max-width: 560px) { .cmu-checks { grid-template-columns: minmax(0, 1fr); } .cmu-head, .cmu-body, .cmu-foot { padding-inline: 1rem; } }
.cmu-panel.is-wide { width: min(52rem, 100%); }
.cmu-stages { display: flex; flex-wrap: wrap; gap: 0.375rem; margin: 0; padding: 0; list-style: none; }
.cmu-stages li { display: inline-flex; align-items: center; gap: 0.375rem; height: 1.875rem; padding: 0 0.75rem; border-radius: 999px; background: var(--color-off-white); font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-stages li.is-on { background: var(--color-graphite, #343434); color: #fff; font-weight: 600; }
.cmu-stages li.is-done:not(.is-on) { color: var(--color-ink); }
.cmu-stages li svg { width: 0.875rem; height: 0.875rem; color: var(--color-positive, #3d7a2c); }
.cmu-bulk { display: flex; align-items: center; justify-content: space-between; gap: 1rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-bulk span:last-child { display: inline-flex; gap: 1rem; }
.cmu-chg .cmu-r-h > span:nth-child(2) { flex: 1; min-width: 0; display: grid; gap: 0.125rem; }
.cmu-chg .cmu-r-h b { font-weight: 600; color: var(--color-ink); }
.cmu-chg .cmu-r-h small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--color-ink-subtle); }
.cmu-dec { flex: none; display: inline-flex; border: 1px solid var(--color-line); border-radius: 0.5rem; overflow: hidden; }
.cmu-dec button { height: 2rem; padding: 0 0.75rem; border: 0; background: var(--color-surface, #fff); font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink-subtle); cursor: pointer; }
.cmu-dec button + button { border-left: 1px solid var(--color-line); }
.cmu-dec button:hover { color: var(--color-ink); background: var(--color-off-white); }
.cmu-dec button[data-v="ok"][aria-pressed="true"] { background: var(--color-positive-subtle, #e7f2e4); color: var(--color-positive, #3d7a2c); font-weight: 600; }
.cmu-dec button[data-v="no"][aria-pressed="true"] { background: var(--color-critical-subtle, #fbe9e7); color: var(--color-critical, #b3261e); font-weight: 600; }
.cmu-dec button:disabled { opacity: .45; cursor: default; }
.cmu-diff { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.cmu-diff th { padding: 0.375rem 0.5rem; text-align: left; font-weight: 500; color: var(--color-ink-subtle); border-bottom: 1px solid var(--color-line); }
.cmu-diff td { padding: 0.5rem; border-bottom: 1px solid var(--color-line); color: var(--color-ink); vertical-align: top; }
.cmu-diff td:nth-child(2) { color: var(--color-ink-subtle); text-decoration: line-through; text-decoration-color: rgba(0, 0, 0, .25); }
.cmu-diff tr.is-flag td { background: var(--color-caution-subtle, #fbf3dc); }
.cmu-diff tr.is-flag td:nth-child(3) { font-weight: 600; }
.cmu-diff .cmu-flag td { padding-top: 0; text-decoration: none; color: var(--color-ink); font-size: 0.75rem; }
.cmu-crew { display: grid; gap: 0.5rem; }
.cmu-crew h4 { font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.cmu-crew h4 span { font-weight: 400; color: var(--color-ink-subtle); }
.cmu-crew ul { display: grid; gap: 0.375rem; margin: 0; padding: 0; list-style: none; }
.cmu-crew li { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.625rem; border-radius: 0.5rem; background: var(--color-off-white); font-size: 0.875rem; }
.cmu-crew li > span:nth-child(2) { flex: 1; min-width: 0; color: var(--color-ink); }
.cmu-crew li small { color: var(--color-ink-subtle); }
.cmu-crew .cmu-sign { flex: none; display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 999px; font-weight: 700; font-size: 0.875rem; }
.cmu-sign.is-join { background: var(--color-positive-subtle, #e7f2e4); color: var(--color-positive, #3d7a2c); }
.cmu-sign.is-leave { background: var(--color-critical-subtle, #fbe9e7); color: var(--color-critical, #b3261e); }
.cmu-sign.is-role { background: var(--color-informative-subtle, #e6eef8); color: var(--color-informative, #2f5c8a); }
.cmu-crew.is-off li { opacity: .5; }
.cmu-toast { position: fixed; left: 50%; bottom: 1.5rem; z-index: 130; transform: translate(-50%, 1rem); display: flex; align-items: center; gap: 0.625rem; max-width: calc(100vw - 2rem); padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--color-graphite, #343434); color: #fff; font-size: 0.875rem; box-shadow: 0 12px 32px -12px rgba(0, 0, 0, .4); opacity: 0; transition: opacity .2s, transform .2s; pointer-events: none; }
.cmu-toast.is-on { opacity: 1; transform: translate(-50%, 0); }
.cmu-toast svg { flex: none; width: 1.125rem; height: 1.125rem; color: var(--color-ok, #a6d8a0); }
/* the tables' own way in: a quiet Upload / Replace on each row, a matrix cell that takes a file */
.cd-up { display: inline-flex; align-items: center; gap: 0.3125rem; height: 2rem; padding: 0 0.625rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface, #fff); font: inherit; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink); white-space: nowrap; cursor: pointer; }
.cd-up:hover { border-color: var(--color-ink-subtle); background: var(--color-off-white); }
.cd-up svg { width: 0.9375rem; height: 0.9375rem; color: var(--color-ink-subtle); }
.cd-up.is-icon { width: 2rem; padding: 0; justify-content: center; }
.cd-up.is-icon span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
.cd-ed-in { display: inline-flex; align-items: center; justify-content: flex-end; gap: 0.5rem; }
.cd-cell { display: inline-grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 0; border-radius: 0.5rem; background: none; cursor: pointer; }
.cd-cell:hover, .cd-cell:focus-visible { background: var(--color-light-beige); outline: none; box-shadow: inset 0 0 0 1px var(--color-ink-subtle); }
.cd-area-head-up { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.cd-group-k .cd-group-up { margin-left: auto; }
.cd-wk-tbl .cd-ed { white-space: nowrap; text-align: right; }
[data-drop].is-drop > td { background: var(--color-coral-tint, #fdf1ee) !important; }
[data-drop].is-drop > td:first-child { box-shadow: inset 3px 0 0 var(--color-coral); }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>';
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const SPIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';
  const OK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"/></svg>';
  const WARN = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>';
  const size = (b) => (!b ? '' : b < 1e6 ? Math.max(1, Math.round(b / 1e3)) + ' KB' : (b / 1e6).toFixed(1) + ' MB');

  let toastEl = null, toastT = 0;
  const toast = (html) => {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'cmu-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = OK + `<span>${html}</span>`; toastEl.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('is-on'), 4200);
  };

  const open = (spec, opts = {}) => {
    const R0 = resolve(spec); if (!R0 || !R0.pool.length) return false;
    const { pool, focus } = R0;
    const fs = focus && pool.find((s) => s.key === focus);
    let files = [...(opts.files || [])], step = 1, results = [], reading = 0, reviews = [], stage = 0;
    const last = document.activeElement;
    const el = document.createElement('div');
    el.className = 'cmu'; el.hidden = true;
    el.innerHTML = `<div class="cmu-scrim" data-x></div><div class="cmu-panel" role="dialog" aria-modal="true" aria-labelledby="cmu-h" tabindex="-1">
      <header class="cmu-head"><div class="cmu-t"><p class="eyebrow">ALMA</p><h2 id="cmu-h">${esc(R0.title)}</h2><p>${R0.lead}</p></div><button type="button" class="cmu-x" data-x aria-label="Close">${XI}</button></header>
      <div class="cmu-body" id="cmu-body"></div><footer class="cmu-foot" id="cmu-foot"></footer>
      <input type="file" id="cmu-file" multiple hidden></div>`;
    document.body.appendChild(el);
    const $ = (id) => el.querySelector('#' + id), panel = el.querySelector('.cmu-panel');
    const label = (s) => (s.who ? `${s.name} · ${s.who}` : s.name);
    const stat = (s) => { const st = M.STATUS[s.status] || ['', '']; return `<span class="co-badge ${st[1]}">${st[0]}</span>`; };
    // where a file can go: one document's people (by name), or the documents of one person or more
    const oneDoc = new Set(pool.map((s) => s.code)).size === 1;
    const opt = (s, cur) => `<option value="${esc(s.key)}"${cur === s.key ? ' selected' : ''}>${esc(oneDoc && s.who ? s.who : label(s))} &middot; now ${esc(((M.STATUS[s.status] || [''])[0]).toLowerCase())}</option>`;
    const options = (cur) => `<option value=""${cur ? '' : ' selected'} disabled>Choose where it goes</option>` + (() => {
      if (oneDoc) return pool.map((s) => opt(s, cur)).join('');
      const by = {}; pool.forEach((s) => { const g = s.who || 'Your company'; (by[g] = by[g] || []).push(s); });
      return Object.entries(by).map(([g, l]) => `<optgroup label="${esc(g)}">${l.map((s) => opt(s, cur)).join('')}</optgroup>`).join('');
    })();

    // the changes, one area per stage, in the order Documents lists its areas
    const stages = () => { const order = (M.AREAS || []).map((a) => a.key); return [...new Set(reviews.map((v) => v.area))].sort((x, y) => order.indexOf(x) - order.indexOf(y)); };
    const decided = (v) => (v.decision === 'no' || !!v.decision) && (v.decision === 'no' || v.crew.every((c) => c.decision));
    const dec = (id, cur, off, what) => `<span class="cmu-dec" role="group" aria-label="${esc(what)}"><button type="button" data-dec="${id}" data-v="ok" aria-pressed="${cur === 'ok'}"${off ? ' disabled' : ''}>Approve</button><button type="button" data-dec="${id}" data-v="no" aria-pressed="${cur === 'no'}"${off ? ' disabled' : ''}>Reject</button></span>`;
    const CREW_T = { join: (c) => [`+`, `<b>${esc(plain(c.name))}</b> <small>${esc(c.role)} &middot; joins the list</small>`], leave: (c) => ['&minus;', `<b>${esc(plain(c.name))}</b> <small>${esc(c.role)} &middot; no longer on the list</small>`], role: (c) => ['&harr;', `<b>${esc(plain(c.name))}</b> <small>${esc(c.from)} &rarr; ${esc(c.to)}</small>`] };
    const head = (eyebrow, title, lead) => { el.querySelector('.cmu-t .eyebrow').innerHTML = eyebrow; $('cmu-h').innerHTML = esc(title); el.querySelector('.cmu-t > p:last-child').innerHTML = lead; };
    const changes = () => {
      const st = stages(), a = st[stage], list = reviews.map((v, k) => [v, k]).filter(([v]) => v.area === a);
      head(`ALMA noticed changes${st.length > 1 ? ` &middot; ${stage + 1} of ${st.length}` : ''}`, M.AREA_TITLE[a] || 'Changes',
        'Nothing on file changes until you approve it. A file you reject is left out, and what you have stays as it is.');
      const pills = st.length > 1 ? `<ol class="cmu-stages" aria-label="Areas with changes">${st.map((x, i) => { const done = reviews.filter((v) => v.area === x).every(decided); return `<li class="${i === stage ? 'is-on' : ''}${done ? ' is-done' : ''}"${i === stage ? ' aria-current="step"' : ''}>${done && i !== stage ? OK : ''}${esc(M.AREA_TITLE[x] || x)}</li>`; }).join('')}</ol>` : '';
      const n = list.reduce((t, [v]) => t + (v.fields ? 1 : 0) + v.crew.length, 0);
      const bulk = `<div class="cmu-bulk"><span>${n} change${n === 1 ? '' : 's'} to decide here</span><span><button type="button" class="link-btn" data-all="ok">Approve all</button><button type="button" class="link-btn" data-all="no">Reject all</button></span></div>`;
      const cards = list.map(([v, k]) => {
        const sl = v.r.slot, off = v.decision === 'no';
        const fields = v.fields ? `<table class="cmu-diff"><thead><tr><th>What</th><th>On file now</th><th>New file</th></tr></thead><tbody>${v.fields.map((f) => `<tr${f.flag ? ' class="is-flag"' : ''}><td>${f.label}</td><td>${f.from}</td><td>${f.to}</td></tr>${f.flag ? `<tr class="is-flag cmu-flag"><td colspan="3">${WARN.replace('<svg', '<svg width="13" height="13" style="vertical-align:-2px;margin-right:4px;color:var(--color-caution,#d9a21b)"')}${f.flag}</td></tr>` : ''}`).join('')}</tbody></table>` : '';
        const crew = v.crew.length ? `<div class="cmu-crew${off ? ' is-off' : ''}"><h4>Worker list <span>&middot; ${v.crew.length} difference${v.crew.length === 1 ? '' : 's'} from the ${(M.PERSON || []).filter((p) => !p.left).length} workers on file</span></h4><ul>${v.crew.map((c, j) => { const [sign, txt] = CREW_T[c.type](c); return `<li><span class="cmu-sign is-${c.type}" aria-hidden="true">${sign}</span><span>${txt}</span>${dec(`${k}:${j}`, off ? 'no' : c.decision, off, plain(c.name))}</li>`; }).join('')}</ul></div>` : '';
        return `<section class="cmu-r cmu-chg"><div class="cmu-r-h"><span class="cmu-ic">${FILE}</span><span><b>${esc(sl.name)}${sl.who ? ` &middot; ${esc(sl.who)}` : ''}</b><small>${esc(v.r.file.name)}${v.fields ? ' &middot; replaces the one on file' : sl.status === 'processing' ? ' &middot; the one on file is still being read' : ' &middot; nothing on file yet'}</small></span>${v.fields ? dec(k, v.decision, false, `Replace ${sl.name}`) : '<span class="co-badge b-neu">New</span>'}</div>${fields}${crew}</section>`;
      }).join('');
      $('cmu-body').innerHTML = pills + bulk + cards;
      const open = reviews.filter((v) => !decided(v)).length, last = stage === st.length - 1;
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-prev>${stage ? 'Previous' : 'Back to the files'}</button><span class="cmu-foot-l">${open ? `${open} file${open === 1 ? '' : 's'} still to decide` : 'Every change decided'}</span>`
        + (last ? `<button type="button" class="btn btn-primary btn-sm" data-commit${open ? ' disabled' : ''}>Save what you approved</button>` : '<button type="button" class="btn btn-primary btn-sm" data-next>Next</button>');
    };
    const paint = () => {
      const body = $('cmu-body'), foot = $('cmu-foot');
      panel.classList.toggle('is-wide', step === 4);
      if (step === 4) { changes(); return; }
      head('ALMA', R0.title, R0.lead);
      if (step === 1) {
        const many = pool.length > 1 && !fs;
        const need = pool.filter((s) => M.RANK[s.status] > 0).length;
        const now = fs ? `<div class="cmu-now"><span>Now on file</span><b>${stat(fs)} ${fs.exp && fs.exp !== '—' && !NO_FILE.includes(fs.status) ? `<span>${fs.status === 'expired' ? 'on' : 'until'} ${esc(fs.exp)}</span>` : ''}</b></div>`
          : many ? `<div class="cmu-now"><span>${pool.length} document${pool.length === 1 ? '' : 's'} can go here</span><b>${need ? `${need} need${need === 1 ? 's' : ''} a file` : 'All in order'}</b></div>` : '';
        const list = files.length ? `<div class="cmu-list"><h3>Your files &middot; ${files.length}</h3>${files.map((f, k) => `<div class="cmu-f"><span class="cmu-ic">${FILE}</span><span class="cmu-n">${esc(f.name)}</span><small>${size(f.size)}</small><button type="button" class="cmu-rm" data-rm="${k}" aria-label="Remove ${esc(f.name)}">${XI}</button></div>`).join('')}</div>` : '';
        body.innerHTML = now + `<div class="cmu-drop" id="cmu-drop" role="button" tabindex="0" aria-label="Add files">${UP}<b>${files.length ? 'Add more files' : `Drop ${fs ? 'the file' : 'files'} here`}</b><span>or <u>browse your device</u> &middot; PDF, scan or photo</span></div>` + list;
        foot.innerHTML = `<button type="button" class="link-btn" data-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-read${files.length ? '' : ' disabled'}>${files.length > 1 ? `Check ${files.length} files with ALMA` : 'Check it with ALMA'}</button>`;
      } else if (step === 2) {
        body.innerHTML = `<div class="cmu-list"><h3>ALMA is reading</h3>${files.map((f, k) => `<div class="cmu-f ${k < reading ? 'is-done' : k === reading ? 'is-reading' : ''}"><span class="cmu-ic">${k < reading ? OK : k === reading ? SPIN : FILE}</span><span class="cmu-n">${esc(f.name)}</span><small>${k < reading ? 'Checked' : k === reading ? 'Reading the name, dates and issuer&hellip;' : 'Waiting'}</small></div>`).join('')}</div>`;
        foot.innerHTML = '<span class="cmu-foot-l">Checking each one with the body that issued it.</span>';
      } else {
        const on = results.filter((r) => r.on), ready = on.filter((r) => r.slot);
        body.innerHTML = results.map((r, k) => {
          const s = r.slot, ask = r.on && !s;
          const checks = s ? `<dl class="cmu-checks">
            <div><dt>Document</dt><dd${r.how === 'guess' ? ' class="is-warn"' : ''}>${r.how === 'guess' ? WARN : OK}${esc(s.name)}</dd></div>
            <div><dt>${s.who ? 'Name on it' : 'Holder'}</dt><dd${r.how === 'guess' ? ' class="is-warn"' : ''}>${r.how === 'guess' ? WARN : OK}${esc(s.who || plain(M.D.company || 'Your company'))}</dd></div>
            <div><dt>Issued by</dt><dd>${OK}${esc(plain(M.issuerOf(s.d.cat) || 'The issuing body'))} &middot; ${esc(r.read.issued)}</dd></div>
            <div><dt>Valid until</dt><dd>${OK}${esc(r.read.valid)}</dd></div></dl>` : '';
          const pc = [...r.file.name].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 997, 7); // steady for the same file
          const conf = s ? (r.how === 'sure' ? `<span class="co-badge b-ok">ALMA confidence ${90 + (pc % 9)}%</span>` : `<span class="co-badge b-pend">ALMA confidence ${76 + (pc % 12)}%</span>`) : '';
          return `<section class="cmu-r${r.on ? '' : ' is-off'}${ask ? ' is-ask' : ''}" aria-label="${esc(r.file.name)}">
            <div class="cmu-r-h"><span class="cmu-ic">${FILE}</span><span class="cmu-n">${esc(r.file.name)}</span>${conf}<label><input type="checkbox" data-on="${k}"${r.on ? ' checked' : ''}> Save it</label></div>
            ${r.note ? `<p class="cmu-note">${r.note}</p>` : ''}
            ${r.on ? `<label class="cmu-to"><span>${oneDoc && s && s.who ? 'Filed for' : 'Filed as'}</span><select data-to="${k}">${options(s ? s.key : '')}</select></label>${checks}` : ''}
          </section>`;
        }).join('');
        const left = on.length - ready.length, nd = reviewOf(results).length; // files that differ from what's on file
        foot.innerHTML = `<button type="button" class="link-btn" data-back>Add or change files</button><span class="cmu-foot-l">${left ? `${left} still need${left === 1 ? 's' : ''} a place` : ''}</span><button type="button" class="btn btn-primary btn-sm" data-save${ready.length && !left ? '' : ' disabled'}>${nd ? `Review ${nd} change${nd === 1 ? '' : 's'}` : ready.length === 1 ? 'Save it' : `Save ${ready.length} documents`}</button>`;
      }
    };
    const add = (list) => { const l = [...(list || [])]; if (!l.length) return; files = files.concat(l); step = 1; paint(); };
    const read = () => {
      step = 2; reading = 0; paint();
      const quick = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const tick = () => {
        reading += 1;
        if (reading >= files.length) { results = place(pool, focus, files); step = 3; paint(); el.querySelector('select, [data-save]')?.focus({ preventScroll: true }); return; }
        paint(); setTimeout(tick, quick ? 120 : 650);
      };
      setTimeout(tick, quick ? 120 : 900);
    };
    const save = () => {
      // what was rejected stays as it was; the rest is filed
      const kept = new Set(reviews.filter((v) => v.decision === 'no').map((v) => v.r));
      const done = results.filter((r) => r.on && r.slot && !kept.has(r));
      const crew = { added: [], left: [], roles: {} };
      reviews.filter((v) => v.decision !== 'no').forEach((v) => v.crew.filter((c) => c.decision === 'ok').forEach((c) => {
        if (c.type === 'join') crew.added.push([c.name, c.role]); else if (c.type === 'leave') crew.left.push(c.i); else crew.roles[c.i] = c.to;
      }));
      done.forEach((r) => {
        const s = r.slot;
        if (s.i == null) M.saveDoc(s.code, { status: 'valid', issued: r.read.issued, valid: r.read.valid, note: '', ref: refFor(s, r), by: M.issuerOf(s.d.cat), conf: r.conf, edited: false });
        else M.saveRecord(s.code, s.i, { status: 'valid', exp: r.read.valid });
        if (window.CMFiles) window.CMFiles.put(s.i == null ? s.code : `${s.code}#${s.i}`, r.file);
      });
      close();
      const whose = [...new Set(done.map((r) => r.slot.who).filter(Boolean))];
      const nCrew = crew.added.length + crew.left.length + Object.keys(crew.roles).length;
      if (kept.size || nCrew) {
        const parts = [done.length ? `${done.length} document${done.length === 1 ? '' : 's'} saved` : 'Nothing replaced'];
        if (kept.size) parts.push(`${kept.size} kept as ${kept.size === 1 ? 'it was' : 'they were'}`);
        if (nCrew) parts.push(`worker list updated (${[crew.added.length && `${crew.added.length} joined`, crew.left.length && `${crew.left.length} left`, Object.keys(crew.roles).length && `${Object.keys(crew.roles).length} new role`].filter(Boolean).join(', ')})`);
        const msg = parts.join(' &middot; ') + '.';
        // the crew is part of how the pages are drawn: they come back with it, and the message after
        if (nCrew) { M.saveCrew(crew); try { sessionStorage.setItem('cm-upload-toast', msg); } catch (e) {} location.reload(); return; }
        toast(msg); if (opts.onSaved) opts.onSaved(done); return;
      }
      toast(done.length === 1 ? `${esc(done[0].slot.name)}${done[0].slot.who ? ` for ${esc(done[0].slot.who)}` : ''} saved. ALMA checked it, valid until ${esc(done[0].read.valid)}.`
        : `${done.length} documents saved${whose.length > 1 ? ` across ${whose.length} records` : whose.length ? ` for ${esc(whose[0])}` : ''}. ALMA checked each one.`);
      if (opts.onSaved) opts.onSaved(done);
    };
    const close = () => {
      el.classList.remove('is-open'); document.removeEventListener('keydown', onKey, true);
      setTimeout(() => el.remove(), 220);
      if (last && last.focus && last.isConnected) last.focus({ preventScroll: true });
    };
    const onKey = (e) => { if (e.key === 'Escape' && step !== 2) { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    el.addEventListener('click', (e) => {
      const t = (s) => e.target.closest(s);
      if (t('[data-x]')) { if (step !== 2) close(); return; }
      if (t('#cmu-drop')) { $('cmu-file').value = ''; $('cmu-file').click(); return; }
      if (t('[data-rm]')) { files.splice(+t('[data-rm]').dataset.rm, 1); paint(); return; }
      if (t('[data-read]')) { if (files.length) read(); return; }
      if (t('[data-back]')) { step = 1; paint(); return; }
      if (t('[data-save]')) {
        // anything that differs from what's on file waits for the user's approval
        reviews = reviewOf(results); stage = 0;
        if (reviews.length) { step = 4; paint(); panel.scrollTop = 0; $('cmu-body').scrollTop = 0; } else save();
        return;
      }
      if (t('[data-dec]')) {
        const [k, j] = t('[data-dec]').dataset.dec.split(':'), v = reviews[+k], val = t('[data-dec]').dataset.v;
        if (j != null) v.crew[+j].decision = val; else v.decision = val;
        const keepAt = $('cmu-body').scrollTop; paint(); $('cmu-body').scrollTop = keepAt; return;
      }
      if (t('[data-all]')) {
        const val = t('[data-all]').dataset.all, a = stages()[stage];
        reviews.filter((v) => v.area === a).forEach((v) => { if (v.fields) v.decision = val; v.crew.forEach((c) => { c.decision = val; }); if (!v.fields) v.decision = 'ok'; });
        paint(); return;
      }
      if (t('[data-next]')) { stage = Math.min(stage + 1, stages().length - 1); paint(); $('cmu-body').scrollTop = 0; return; }
      if (t('[data-prev]')) { if (stage) { stage -= 1; } else step = 3; paint(); $('cmu-body').scrollTop = 0; return; }
      if (t('[data-commit]')) { save(); }
    });
    el.addEventListener('keydown', (e) => { if (e.target.id === 'cmu-drop' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.click(); } });
    el.addEventListener('change', (e) => {
      if (e.target.id === 'cmu-file') { add(e.target.files); return; }
      const on = e.target.closest('[data-on]'); if (on) { results[+on.dataset.on].on = on.checked; paint(); return; }
      const to = e.target.closest('[data-to]');
      if (to) {
        // moved by hand: it takes that slot (whatever had it is left without one), and the dates follow it
        const r = results[+to.dataset.to], s = pool.find((x) => x.key === to.value);
        results.forEach((o) => { if (o !== r && o.slot === s) { o.slot = null; o.note = 'Its place went to another file. Choose where this one goes.'; } });
        Object.assign(r, { slot: s, how: 'sure', note: '', read: readDates(s, r.file) });
        paint();
      }
    });
    el.addEventListener('dragover', (e) => { e.preventDefault(); const z = $('cmu-drop'); if (z) z.classList.add('is-over'); });
    el.addEventListener('dragleave', (e) => { const z = $('cmu-drop'); if (z && !el.contains(e.relatedTarget)) z.classList.remove('is-over'); });
    el.addEventListener('drop', (e) => { e.preventDefault(); if (step !== 2) add(e.dataTransfer.files); });
    paint();
    el.hidden = false;
    setTimeout(() => { el.classList.add('is-open'); panel.focus({ preventScroll: true }); }, 20);
    if (files.length && opts.files) setTimeout(read, 200); // dropped straight on a row: ALMA starts reading
    return true;
  };

  // a row's button, the same everywhere: Upload where there's no file yet, Replace where there is
  const button = (spec, has, name, icon) => `<button type="button" class="cd-up${icon ? ' is-icon' : ''}" data-up="${esc(spec)}" title="${has ? 'Replace' : 'Upload'}${name ? ' ' + esc(plain(name)) : ''}">${UP}<span>${has ? 'Replace' : 'Upload'}</span></button>`;

  // any element holding [data-up] buttons and [data-drop] rows: clicks open the dialog, a file
  // dragged onto a row is ALMA's for that row
  const wire = (root, onSaved) => {
    if (!root || root.dataset.cmuWired) return; root.dataset.cmuWired = '1';
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-up]'); if (!b || !root.contains(b)) return;
      e.preventDefault(); e.stopPropagation(); open(b.dataset.up, { onSaved });
    }, true);
    let over = null;
    const mark = (r) => { if (over === r) return; if (over) over.classList.remove('is-drop'); over = r; if (r) r.classList.add('is-drop'); };
    root.addEventListener('dragover', (e) => { const r = e.target.closest('[data-drop]'); if (!r || ![...(e.dataTransfer.types || [])].includes('Files')) { mark(null); return; } e.preventDefault(); mark(r); });
    root.addEventListener('dragleave', (e) => { if (!root.contains(e.relatedTarget)) mark(null); });
    root.addEventListener('drop', (e) => { const r = e.target.closest('[data-drop]'); mark(null); if (!r || !e.dataTransfer.files.length) return; e.preventDefault(); e.stopPropagation(); open(r.dataset.drop, { files: e.dataTransfer.files, onSaved }); });
  };

  // a message carried over a reload (a worker list approved)
  try { const t = sessionStorage.getItem('cm-upload-toast'); if (t) { sessionStorage.removeItem('cm-upload-toast'); setTimeout(() => toast(t), 500); } } catch (e) {}

  return { open, can, button, wire, toast, NO_FILE };
})();
