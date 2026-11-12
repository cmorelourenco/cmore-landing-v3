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
  // two kinds of file that aren't documents the company is asked for, but that ALMA files all the
  // same: a worker's identity document (citizen card, passport), which is what makes them a worker
  // here (the name and number on it), and the site's worker register (Registo de trabalhadores),
  // which names everyone. Only for a company with a worker list.
  const crewHere = () => !!(M.saveCrew && M.saveId && M.PERSONA === 'miguel' && !M.ORG && (M.PERSON || []).length);
  const ID_D = { code: 'ID', name: 'Identity document', section: 'Identity', area: 'workers', kind: 'workers', cat: { usuallyIssuedBy: 'Rep\u00fablica Portuguesa', titles: 'Cart\u00e3o de cidad\u00e3o; Citizen card; Passport; Passaporte; Bilhete de identidade; Identity card', fields: [], renewal: '', expiryRule: '' } };
  const REG_D = { code: 'WK-REG', name: 'Worker register', section: 'For all workers', area: 'workers', kind: null, issued: '—', valid: '—', ref: '', cat: { titles: 'Registo de trabalhadores; Worker register; Lista de trabalhadores; Worker list; Roster', fields: [{ name: 'Workers listed (name, ID document, SS no.)' }], renewal: 'Monthly', expiryRule: 'No expiry' } };
  const idSlot = (i) => { const p = M.PERSON[i], on = M.idOf(i); return { key: `ID#${i}`, code: 'ID', i, d: ID_D, name: 'Identity document', who: plain(p.name), status: on && on.file ? 'valid' : 'notuploaded', exp: on && on.file ? on.valid : '—' }; };
  const regSlot = () => { const r = M.register(); return { key: 'WK-REG', code: 'WK-REG', i: null, d: Object.assign({}, REG_D, { status: r ? 'valid' : 'notuploaded', cat: Object.assign({}, REG_D.cat, { usuallyIssuedBy: plain(M.D.company || '') }) }), name: 'Worker register', who: '', status: r ? 'valid' : 'notuploaded', exp: '—' }; };
  // a worker's optional documents, outside the catalog: their driving licence, and under Other their
  // criminal record certificate. Never asked for; there for whoever has one to file
  const EXTRA_D = {
    DRV: { code: 'DRV', name: 'Driving Licence', section: 'Driving', area: 'workers', kind: 'workers', cat: { usuallyIssuedBy: 'IMT, Instituto da Mobilidade e dos Transportes', titles: 'Carta de condu\u00e7\u00e3o; Driving licence; Driver licence; Driving license; Licen\u00e7a de condu\u00e7\u00e3o', fields: [], renewal: '15 years', expiryRule: '' } },
    CRM: { code: 'CRM', name: 'Individual Criminal Record Certificate', section: 'Other', area: 'workers', kind: 'workers', cat: { usuallyIssuedBy: 'Direc\u00e7\u00e3o-Geral da Administra\u00e7\u00e3o da Justi\u00e7a', titles: 'Certificado de registo criminal; Registo criminal; Criminal record; Criminal record certificate; Police clearance', fields: [], renewal: '3 months', expiryRule: '' } },
  };
  const extraSlot = (code, i) => { const p = M.PERSON[i], on = M.extraOf(code, i); return { key: `${code}#${i}`, code, i, d: EXTRA_D[code], name: EXTRA_D[code].name, who: plain(p.name), status: on && on.file ? 'valid' : 'notuploaded', exp: on && on.file ? on.valid : '—' }; };
  const extrasOf = (i) => (M.saveExtra ? Object.keys(EXTRA_D).map((c) => extraSlot(c, i)) : []);
  const activeWorkers = () => (M.PERSON || []).map((p, i) => ({ p, i })).filter((x) => !x.p.left);
  // uploaded for one document (its dot, its row): that's the one it's for, but ALMA still reads
  // what the file is. Everything else of the same area is where it can go too, so a worker
  // register, someone's ID or another worker's document goes where it belongs, and she says so
  const widen = (r, area) => { if (!r) return r; const w = resolve(`area:${area}`); if (!w) return r; const have = new Set(r.pool.map((x) => x.key)); return Object.assign(r, { pool: r.pool.concat(w.pool.filter((x) => !have.has(x.key))) }); };
  const resolve = (spec) => {
    const [t, a, b] = String(spec).split(':');
    if ((t === 'rec' || t === 'doc') && !resolve.inner) { resolve.inner = true; try { const r = resolve(spec), d = t === 'doc' ? M.DOCS.find((x) => x.id === +a) : M.DOCS.find((x) => x.code === a); return widen(r, d ? d.area : 'workers'); } finally { resolve.inner = false; } }
    const D = M.DOCS.filter(live);
    if (t === 'doc') {
      const d = M.DOCS.find((x) => x.id === +a); if (!d) return null;
      if (d.kind) return { pool: rosterSlots(d), focus: null, title: `${plain(d.name)}`, lead: `One per ${M.NOUN[d.kind][0]}. ALMA reads whose name is on each file and files it for them.` };
      // the other company documents of its section, in case the file turns out to be one of them
      const pool = [docSlot(d)].concat(D.filter((x) => !x.kind && x !== d && x.area === d.area).map(docSlot));
      return { pool, focus: d.code, title: `${NO_FILE.includes(d.status) ? 'Upload' : 'Replace'} ${plain(d.name)}`, lead: 'ALMA reads it and checks it is this document, for your company, and still valid.' };
    }
    if (t === 'rec' && a === 'ID') {
      const i = +b; if (!crewHere() || !M.PERSON[i] || M.PERSON[i].left) return null;
      const sl = idSlot(i);
      return { pool: [sl], focus: sl.key, title: `Identity document · ${sl.who}`, lead: `Their citizen card or passport. ALMA checks the name and number on it are ${sl.who}&rsquo;s.` };
    }
    if (t === 'rec' && EXTRA_D[a]) {
      const i = +b; if (!crewHere() || !M.PERSON[i] || M.PERSON[i].left) return null;
      const sl = extraSlot(a, i);
      return { pool: [sl], focus: sl.key, title: `${sl.name} · ${sl.who}`, lead: `Optional. ALMA checks the name on it is ${sl.who}&rsquo;s, and reads until when it&rsquo;s valid.` };
    }
    if (t === 'rec') {
      const d = M.DOCS.find((x) => x.code === a && x.kind); if (!d) return null;
      const i = +b, r = d.roster.find((x) => x.i === i); if (!r) return null;
      const who = plain(M.recordName(d.kind, i));
      return { pool: rosterSlots(d), focus: `${a}#${i}`, title: `${plain(d.name)} · ${who}`, lead: `ALMA checks the name on it is ${who}&rsquo;s, and that it&rsquo;s still valid.` };
    }
    if (t === 'who') {
      const i = +b, pool = D.filter((x) => x.kind === a).flatMap((d) => d.roster.filter((r) => r.i === i).map((r) => recSlot(d, r)));
      if (a === 'workers' && crewHere() && M.PERSON[i] && !M.PERSON[i].left) { pool.unshift(idSlot(i)); pool.push(...extrasOf(i)); }
      const who = plain(M.recordName(a, i));
      return { pool, focus: null, title: `Documents for ${who}`, lead: `Any of ${who}&rsquo;s documents. ALMA works out which one each file is.` };
    }
    if (t === 'area') {
      const pool = D.filter((x) => x.area === a && x.kind).flatMap(rosterSlots);
      if (a === 'workers' && crewHere()) { pool.push(...activeWorkers().flatMap((x) => [idSlot(x.i), ...extrasOf(x.i)])); pool.unshift(regSlot()); }
      return { pool, focus: null, title: `Upload documents for your ${M.NOUN[a] ? M.NOUN[a][1] : 'records'}`, lead: `For any of your ${M.NOUN[a] ? M.NOUN[a][1] : 'records'}. ALMA works out which document each file is, and whose name is on it.` };
    }
    const pool = D.flatMap((d) => (d.kind ? rosterSlots(d) : [docSlot(d)]));
    if (crewHere()) { pool.push(...activeWorkers().flatMap((x) => [idSlot(x.i), ...extrasOf(x.i)])); pool.push(regSlot()); }
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
    // its code on the file (WK-11): a short one (ID) only as a word of its own
    + (fold(sl.code).replace(/[^a-z0-9]/g, '').length > 3 && fw.n.replace(/[^a-z0-9]/g, '').includes(fold(sl.code).replace(/[^a-z0-9]/g, '')) ? 3 : 0);
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
    // an identity document: valid until the date on it (the one ALMA read for someone new), issued years before
    if (sl.code === 'ID') {
      const v = sl.fresh ? sl.fresh.valid : (M.PERSON[sl.i] || { id: [] }).id[2], t = Date.parse(v);
      if (Number.isNaN(t)) return { issued: fmt(now), valid: '—' };
      // a citizen card runs ten years (a passport five): issued that long before, and never after today
      let iss = new Date(t); iss.setFullYear(iss.getFullYear() - (sl.fresh && sl.fresh.type === 'Passport' ? 5 : 10));
      if (iss > now) { iss = new Date(now); iss.setDate(now.getDate() - 30 - (h % 300)); }
      return { issued: fmt(iss), valid: fmt(new Date(t)) };
    }
    // a driving licence: issued some years ago, renewed every fifteen; a criminal record
    // certificate: asked for a few days ago, good for three months
    if (sl.code === 'DRV') { const iss = new Date(now); iss.setFullYear(now.getFullYear() - 1 - (h % 12)); iss.setDate(1 + (h % 27)); const v = new Date(iss); v.setFullYear(v.getFullYear() + 15); return { issued: fmt(iss), valid: fmt(v) }; }
    if (sl.code === 'CRM') { const iss = new Date(now); iss.setDate(now.getDate() - 2 - (h % 12)); const v = new Date(iss); v.setMonth(v.getMonth() + 3); return { issued: fmt(iss), valid: fmt(v) }; }
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
  const refFor = (s, r) => (s.code === 'ID' ? (s.fresh ? s.fresh.no : plain((M.PERSON[s.i] || { id: ['', ''] }).id[1])) : M.refOf(s.code + r.file.name, r.read.issued));
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
  // (a list read in the demo names six new people; they're taken in this order, so each list moves on)
  const JOIN = [['Ana Ribeiro', 'Laborer'], ['Joana Matos', 'Electrician'], ['In&ecirc;s Couto', 'Surveyor'], ['Rafael Mendes', 'Carpenter'], ['Tom&aacute;s Vieira', 'Laborer'], ['Marco Leite', 'Welder'],
    ['Catarina Antunes', 'Painter'], ['Hugo Carvalho', 'Steel fixer'], ['Sofia Branco', 'Site engineer'], ['Diogo Moreira', 'Scaffolder'], ['Lu&iacute;s Pacheco', 'Mason'], ['Carla Neves', 'Plasterer'],
    ['F&aacute;bio Rocha', 'Machine operator'], ['Patr&iacute;cia Lima', 'Safety officer'], ['Vasco Teixeira', 'Formwork carpenter'], ['Rita Cardoso', 'Tiler'], ['Gon&ccedil;alo Freitas', 'Roofer'], ['Mariana Sousa', 'Laborer']];
  const N_JOIN = 6;
  const crewDiff = (noJoin) => {
    const here = (M.PERSON || []).map((p, i) => ({ p, i })).filter((x) => !x.p.left && !x.p.isNew);
    if (!here.length || !M.saveCrew) return [];
    const n = M.crew.added.length + M.crew.left.length;
    const taken = new Set((M.WORKERS || []).map((w) => fold(plain(w[0]))));
    const joins = JOIN.filter(([nm]) => !taken.has(fold(plain(nm)))).slice(0, N_JOIN);
    const lab = here.filter((x) => /laborer/i.test(x.p.role));
    const leaver = lab[(3 + n) % lab.length], moved = lab.filter((x) => x !== leaver)[(1 + n) % Math.max(1, lab.length - 1)];
    const out = noJoin ? [] : joins.map(([name, role]) => ({ type: 'join', name, role }));
    if (leaver) out.push({ type: 'leave', i: leaver.i, name: leaver.p.name, role: leaver.p.role });
    if (moved) out.push({ type: 'role', i: moved.i, name: moved.p.name, from: moved.p.role, to: 'Mason' });
    return out.map((c) => Object.assign(c, { decision: null }));
  };
  // one card per file that differs; a worker list's crew changes go with the first list only
  const reviewOf = (results, noJoin) => {
    let crewDone = false;
    return results.filter((r) => r.on && r.slot).map((r) => {
      const fields = fileDiff(r);
      const crew = !crewDone && isList(r.slot.d) ? crewDiff(noJoin) : [];
      if (crew.length) crewDone = true;
      if (!fields && !crew.length) return null;
      return { r, area: r.slot.d.area, fields, crew, decision: fields ? null : 'ok' };
    }).filter(Boolean);
  };

  // ---- who is on each file: the name and ID number ALMA reads, against the worker list -----------
  // The first thing she reads (before which document it is): a file for one worker names them, with
  // their citizen card or passport number; a worker list or register names everyone on it. Each name
  // is matched to the worker list by its ID number, or by name; a name that isn't on it is someone
  // new, for the user to add (or not) before anything is filed.
  // Prototype: she reads the name off the file's name ("Citizen card - Ana Ribeiro.pdf", a number on
  // file in it matches by number); a list names everyone on file, and two new people.
  const ID_RE = /\b(cc|cartao|cidadao|citizen|passport|passaporte|bilhete|identidade|identity|id)\b/;
  const NOT_NAME = new Set(['scan', 'copy', 'copia', 'frente', 'verso', 'front', 'back', 'rev', 'nif', 'niss', 'doc', 'docs', 'final', 'signed', 'assinado', 'assinada', 'worker', 'workers', 'trabalhador', 'trabalhadora', 'trabalhadores', 'card', 'cartao', 'cidadao', 'citizen', 'passport', 'passaporte', 'bilhete', 'identidade', 'identity', 'register', 'registo', 'lista', 'list', 'cc', 'bi', 'id', 'pt', 'en', 'new', 'novo', 'nova', 'xls', 'xlsx', 'pdf']);
  const PARTICLE = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
  let vocab = null;
  const vocabOf = () => vocab || (vocab = new Set(M.DOCS.flatMap((d) => words([plain(d.name), d.cat.titles || '', d.section || ''].join(' '))).concat(words(`${ID_D.cat.titles} ${REG_D.cat.titles} ${Object.values(EXTRA_D).map((d) => d.cat.titles).join(' ')}`))));
  const nameIn = (f) => {
    const V = vocabOf();
    const keep = f.name.replace(/\.[a-z0-9]{2,5}$/i, '').split(/[^\p{L}]+/u).filter((t) => { const w = fold(t); return w.length >= 2 && !PARTICLE.has(w) && !STOP.has(w) && !V.has(w) && !NOT_NAME.has(w) && !MONTH_RE.test(w); });
    return keep.length >= 2 && keep.length <= 4 ? keep.map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()).join(' ') : '';
  };
  const digits = (t) => String(t).replace(/\D/g, '');
  // the number on someone new's document, as one reads (a citizen card's, a passport's)
  const newId = (name, type) => {
    const h = hash(fold(name)), y = new Date().getFullYear();
    if (type === 'Passport') return ['Passport', 'CB' + String(100000 + (h * 7) % 899999), fmt(new Date(y + 2 + h % 4, h % 12, 1 + h % 27))];
    return ['Citizen card', `${String(10000000 + (h * 7919) % 89999999).slice(0, 8)} ${h % 10} ZZ${h % 9}`, fmt(new Date(y + 3 + h % 6, (h * 5) % 12, 1 + h % 27))];
  };
  const identify = (files, pool) => {
    const people = [], byKey = {}, here = activeWorkers(), everyone = here.map((x) => plain(x.p.name));
    const kinds = [...new Map(pool.concat(regSlot()).map((sl) => [sl.code, sl])).values()];
    const get = (key, make) => byKey[key] || (byKey[key] = people[people.push(Object.assign(make(), { key, files: [], lists: [], decision: null })) - 1]);
    const known = (x) => get('w' + x.i, () => ({ i: x.i, name: plain(x.p.name), type: plain(x.p.id[0]), no: plain(x.p.id[1]), valid: x.p.id[2], role: plain(x.p.role) }));
    const fresh = (name, type, role, from) => { const q = get('n' + fold(name), () => { const [t, no, valid] = newId(name, type); return { i: null, name, type: t, no, valid, role: '' }; }); if (role && !q.role) { q.role = role; q.roleFrom = from || ''; } return q; };
    const taken = new Set((M.WORKERS || []).map((w) => fold(plain(w[0]))));
    const per = files.map((f, k) => {
      const fw = fileWords(f);
      const top = kinds.map((sl) => [sl, docScore(sl, fw)]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0];
      // a list: everyone on it
      if (top && isList(top[0].d)) {
        // (but not who the list shows has left: that's a change to approve, after the review)
        const gone = new Set(crewDiff(true).filter((c) => c.type === 'leave').map((c) => c.i));
        const all = here.filter((x) => !gone.has(x.i)).map(known).concat(JOIN.filter(([nm]) => !taken.has(fold(plain(nm)))).slice(0, N_JOIN).map(([nm, role]) => fresh(plain(nm), 'Citizen card', role, f.name)));
        all.forEach((q) => q.lists.push(k));
        return { list: true, people: all };
      }
      const byNo = here.find((x) => { const n = digits(x.p.id[1]).slice(0, 8); return n.length >= 6 && digits(f.name).includes(n); });
      const best = here.map((x) => [x, named(plain(x.p.name), fw, everyone)]).filter(([, n]) => n).sort((a, b) => b[1] - a[1])[0];
      // a surname alone is a match only when the file names no one else: "Marta Gonçalves Leal" is
      // someone new, not Rui Gonçalves
      const other = best && best[1] < 2 ? nameIn(f) : '';
      const hit = byNo || (best && !(other && fold(other.split(' ')[0]) !== fold(plain(best[0].p.name).split(' ')[0])) ? best[0] : null);
      if (hit) { const q = known(hit); q.files.push(k); if (byNo) q.by = 'number'; return { people: [q] }; }
      // a name that isn't on the list, on an identity document or a worker's own document
      const nm = nameIn(f), theirs = ID_RE.test(fw.n.replace(/[^a-z0-9]+/g, ' ')) || (top && top[0].d.kind === 'workers');
      if (nm && theirs && !taken.has(fold(nm))) { const q = fresh(nm, /passport|passaporte/.test(fw.n) ? 'Passport' : 'Citizen card'); q.files.push(k); return { people: [q] }; }
      return { people: [] };
    });
    return { people, per };
  };
  // someone new, once added: their identity document, and what every worker is asked for
  const freshSlots = (q) => [{ key: `ID#${q.ni}`, code: 'ID', i: q.ni, d: ID_D, name: 'Identity document', who: q.name, status: 'notuploaded', exp: '—', fresh: q }]
    .concat(M.DOCS.filter((d) => d.kind === 'workers' && d.roster && (d.req === 'mandatory' || d.req === 'if_applicable') && d.roster.length >= activeWorkers().length)
      .map((d) => ({ key: `${d.code}#${q.ni}`, code: d.code, i: q.ni, d, name: plain(d.name), who: q.name, status: 'missing', exp: '—', fresh: q })));

  // each file to a slot: whose name is on it first, then which document it reads as, then where it
  // was dropped; what's left goes to what most needs a file. No two files take the same slot.
  // picks: who the user confirmed each file is for (the people step): { who }, a list ({ list }), or
  // someone they didn't add or said it isn't ({ off: why }), for them to place by hand
  const place = (pool, focus, files, picks) => {
    const used = new Set(), everyone = [...new Set(pool.map((s) => s.who).filter(Boolean))];
    const need = (s) => (M.RANK[s.status] || 0);
    return files.map((f, k) => {
      const pk = picks && picks[k];
      if (pk && pk.off) return { file: f, slot: null, how: 'nobody', note: pk.off, on: true, read: null, conf: 80 };
      const fw = fileWords(f), free = pool.filter((s) => !used.has(s.key));
      const people = pk && pk.who ? [[pk.who, 2]] : pk && pk.list ? [] : everyone.map((w) => [w, named(w, fw, everyone)]).filter(([, n]) => n).sort((x, y) => y[1] - x[1]);
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
        // no name on it, and it reads as the document asked for (anyone's): it's the one asked for
        if (fs && (!top || top[1] < 2 || top[0] === fs || top[0].code === fs.code)) { slot = fs; how = 'sure'; }
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
.cmu-lib { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-top: 0.75rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
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
.cmu-to select { width: 100%; height: 2.5rem; padding: 0 2.25rem 0 0.75rem; appearance: none; cursor: pointer; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface, #fff) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") right 0.75rem center / 1rem no-repeat; font: inherit; font-size: 0.875rem; color: var(--color-ink); }
html[data-theme="dark"] .cmu-to select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23c2c1bb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
.cmu-note { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background: var(--color-caution-subtle, #fbf3dc); font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink); }
.cmu-checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem 1rem; margin: 0; }
.cmu-checks div { display: grid; gap: 0.125rem; }
.cmu-checks dt { font-size: 0.75rem; color: var(--color-ink-subtle); }
.cmu-checks dd { display: flex; align-items: center; gap: 0.375rem; margin: 0; font-size: 0.875rem; color: var(--color-ink); }
.cmu-checks dd svg { flex: none; width: 0.9375rem; height: 0.9375rem; color: var(--color-positive, #3d7a2c); }
.cmu-checks dd.is-warn svg { color: var(--color-caution, #d9a21b); }
@media (max-width: 560px) { .cmu-checks { grid-template-columns: minmax(0, 1fr); } .cmu-head, .cmu-body, .cmu-foot { padding-inline: 1rem; } }
.cmu-panel.is-wide { width: min(52rem, 100%); }
/* ALMA beside the title, as on every ALMA drawer (the ESG upload's): her spheres, breathing while she reads */
.cmu-alma { flex: none; position: relative; display: block; width: 3.75rem; aspect-ratio: 0.9598; margin: 0 0.25rem; align-self: center; pointer-events: none; }
.cmu-alma:empty { display: none; }
.cmu-alma.is-reading { animation: alma-read 1.4s var(--ease-brand, ease) infinite alternate; }
@media (prefers-reduced-motion: reduce) { .cmu-alma.is-reading { animation: none; } }
@media (max-width: 560px) { .cmu-alma { width: 2.75rem; margin: 0; } }
/* new workers, as Team's list from a file: the file, then the table */
.cmu-src { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; padding: 0.75rem 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.cmu-src b { display: block; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); overflow-wrap: anywhere; }
.cmu-src small { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-src-ic { flex: none; display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border-radius: 0.5rem; background: color-mix(in oklab, var(--color-positive, #3d7a2c) 12%, transparent); color: var(--color-positive, #3d7a2c); }
.cmu-src-ic svg { width: 1.125rem; height: 1.125rem; }
.cmu-wq { width: 100%; max-width: none; margin-bottom: 0.75rem; }
.cmu-dnone { padding: 1rem 0; text-align: center; font-size: 0.875rem; color: var(--color-ink-subtle); }
.cmu-dnone[hidden], .cmu-r[hidden] { display: none; }
.cmu-wt td[colspan] { padding: 1rem 0.75rem; text-align: center; color: var(--color-ink-subtle); }
.cmu-wt { border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); overflow: hidden; }
.cmu-wt table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.cmu-wt th, .cmu-wt td { padding: 0.625rem 0.75rem; text-align: left; vertical-align: middle; }
.cmu-wt thead th { background: var(--color-light-beige); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.cmu-wt th.c, .cmu-wt td.c { width: 1rem; padding-right: 0; }
.cmu-wt tbody tr + tr { border-top: 1px solid var(--color-mid-beige); }
.cmu-wt tbody tr:hover { background: color-mix(in oklab, var(--color-light-beige) 60%, transparent); }
.cmu-pck { width: 1rem; height: 1rem; margin: 0; accent-color: var(--color-graphite); cursor: pointer; vertical-align: middle; }
.cmu-wp { display: flex; align-items: center; gap: 0.75rem; min-width: 0; cursor: pointer; }
.cmu-pic { flex: none; width: 2rem; height: 2rem; border-radius: 50%; display: grid; place-items: center; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.75rem; font-weight: 600; }
.cmu-wp-t { min-width: 0; }
.cmu-wp-t b { display: block; font-weight: 600; color: var(--color-ink); }
.cmu-wp-t small { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
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
.cmu-more { justify-self: start; font-size: 0.8125rem; }
.cmu-who { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.cmu-who small { margin-left: auto; font-size: 0.8125rem; font-weight: 400; color: var(--color-ink-subtle); }
.cmu-crew.is-off li { opacity: .5; }
/* folded, as the setup's panel folds (js/guided-upload.js): a rail on the right, the page usable;
   ALMA keeps reading, and the rail says how far she is */
.cmu-head .cmu-acts { flex: none; display: flex; align-items: center; gap: 0.375rem; }
.cmu .cmu-panel { transition: transform .3s cubic-bezier(.2, .8, .2, 1), width .35s var(--ease-brand, ease); } /* over the drawer rule below, which only slides it */
.cmu.is-tucked { pointer-events: none; }
.cmu.is-still .cmu-panel, .cmu.is-still .cmu-scrim { transition: none !important; }
.cmu.is-tucked .cmu-scrim { opacity: 0; }
.cmu.is-tucked .cmu-panel { pointer-events: auto; width: 4.5rem; overflow: hidden; }
.cmu.is-tucked :is(.cmu-head, .cmu-body, .cmu-foot) { display: none; }
.cmu.is-tucked .cmu-dw { display: none; }
.cmu-hide { display: flex; align-items: center; gap: 0.75rem; padding: 0.875rem 1rem; border-radius: 0.75rem; background: var(--color-light-beige); font-size: 0.875rem; line-height: 1.45; color: var(--color-ink-muted); }
.cmu-hide span { flex: 1; }
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
[data-drop].is-drop > td:first-child { box-shadow: inset 3px 0 0 var(--color-coral); }
/* a drawer, as the setup's (js/guided-upload.js): in from the right, the page's full height, 40rem wide */
.cmu { display: block; padding: 0; }
.cmu-panel, .cmu-panel.is-wide { position: absolute; top: 0; right: 0; bottom: 0; width: min(40rem, 100vw); max-height: none; border-radius: 0; opacity: 1; transform: translateX(100%); transition: transform .3s cubic-bezier(.2, .8, .2, 1); box-shadow: -24px 0 60px -30px rgba(52, 52, 52, .35); }
.cmu.is-open .cmu-panel { transform: none; }
.cmu-head { padding: 1.25rem 1rem 1rem 1.5rem; border-bottom: 1px solid var(--color-line); }
.cmu-body { padding: 1.25rem 1.5rem; }
@media (prefers-reduced-motion: reduce) { .cmu-panel { transition: none; } }
/* what she read, card by card: the file opens beside the drawer; its values can be corrected */
.cmu-r:not(.is-editing):not(.is-off) { cursor: pointer; transition: border-color .2s, box-shadow .2s; }
.cmu-r:not(.is-editing):not(.is-off):hover { border-color: var(--color-sand-400); box-shadow: 0 8px 24px -16px rgba(52, 52, 52, .25); }
.cmu-r-t { flex: 1; min-width: 0; }
.cmu-r-t h3 { font-size: 1rem; font-weight: 600; line-height: 1.3; }
.cmu-r-t p { margin-top: 0.125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-r-h .co-badge { flex: none; }
.cmu-r-h .cmu-peek { max-width: 100%; padding: 0; border: 0; background: none; font: inherit; text-align: left; color: var(--color-ink); cursor: pointer; text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 0.2em; transition: text-decoration-color .15s; }
.cmu-r-h .cmu-peek:hover, .cmu-r-h .cmu-peek:focus-visible { text-decoration-color: var(--color-coral); }
.cmu-r.is-ok { border-color: color-mix(in oklab, var(--color-positive, #3d7a2c) 45%, var(--color-line)); }
.cmu-r.is-expired:not(.is-ok) { border-color: var(--color-coral); }
.cmu-r.is-off { opacity: 1; background: var(--color-off-white); }
.cmu-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; min-height: 2.25rem; font-size: 0.875rem; color: var(--color-ink-subtle); }
.cmu-fields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1.25rem; margin: 0; padding: 0.875rem 0 0; border-top: 1px solid var(--color-line); }
.cmu-fields dt { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.cmu-fields dd { margin: 0.25rem 0 0; font-size: 0.9375rem; color: var(--color-ink); overflow-wrap: anywhere; }
.cmu-fields .is-flag dd { color: var(--color-coral-deep, #b5432c); font-weight: 600; }
.cmu-fields input { width: 100%; padding: 0.4375rem 0.625rem; border: 1px solid var(--color-sand-400); border-radius: 0.375rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
.cmu-fields input:focus { outline: none; border-color: var(--color-graphite); }
.cmu-fields .is-flag input { border-color: var(--color-coral); }
.cmu-fields input:disabled { background: var(--color-surface-sunken, #f3f1ec); color: var(--color-ink-subtle); }
.cmu-fields .cmu-fna { display: flex; align-items: center; gap: 0.375rem; margin-top: 0.375rem; font-size: 0.8125rem; color: var(--color-ink-muted); cursor: pointer; }
.cmu-fields .cmu-fna input { width: 0.9375rem; height: 0.9375rem; padding: 0; accent-color: var(--color-graphite); }
.cmu-why { padding: 0.5rem 0.75rem; border-radius: 0.375rem; background: var(--color-coral-tint, #f9e7e3); font-size: 0.875rem; color: var(--color-ink); }
.cmu-exp { display: flex; flex-wrap: wrap; align-items: end; gap: 0.625rem 1.25rem; }
.cmu-exp label { display: grid; gap: 0.375rem; font-size: 0.8125rem; font-weight: 600; color: var(--color-ink); }
.cmu-exp input[type="date"] { height: 2.5rem; padding: 0 0.75rem; border: 1px solid var(--color-sand-400); border-radius: 0.375rem; background: var(--color-surface); font: inherit; font-size: 0.9375rem; color: var(--color-ink); }
.cmu-exp input[type="date"]:focus { outline: none; border-color: var(--color-graphite); }
.cmu-exp .cmu-exp-na { display: flex; align-items: center; gap: 0.5rem; height: 2.5rem; font-weight: 500; cursor: pointer; }
.cmu-exp .cmu-exp-na input { width: 1rem; height: 1rem; accent-color: var(--color-graphite); }
/* Accept: as the setup's, a small square-cornered button; accepted, it takes the brand green */
.cmu-acc { display: inline-flex; align-items: center; gap: 0.375rem; height: 2.25rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.375rem; background: var(--color-surface); font: inherit; font-size: 0.875rem; font-weight: 600; color: var(--color-ink); cursor: pointer; transition: border-color .15s, background-color .15s; }
.cmu-acc svg { width: 0.875rem; height: 0.875rem; }
button.cmu-acc:hover:not(:disabled) { border-color: var(--color-graphite); }
button.cmu-acc:disabled { opacity: .45; cursor: default; }
.cmu .btn:disabled { opacity: .45; cursor: default; } /* as the setup's (.gs .btn:disabled) */
.cmu-acc.is-ok { border-color: var(--color-ok, #a6d8a0); background: var(--color-ok, #a6d8a0); color: var(--color-graphite); cursor: default; }
.cmu-r-dec { flex: none; display: inline-flex; align-items: center; gap: 0.75rem; }
.cmu-r-dec .link-btn { font-size: 0.8125rem; }
.cmu-r-acts { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem 1.25rem; font-size: 0.8125rem; }
.cmu-r-acts > span { display: inline-flex; align-items: center; gap: 1.25rem; }
.cmu-checks input { width: 100%; height: 2.25rem; padding: 0 0.625rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface, #fff); font: inherit; font-size: 0.875rem; color: var(--color-ink); }
.cmu-checks input:focus { outline: none; border-color: var(--color-graphite); box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-graphite) 12%, transparent); }
.cmu-panel { z-index: 2; }
.cmu-dw { z-index: 1; pointer-events: none; } /* under the upload drawer, which stays usable beside it: it slides out from behind it */
.cmu-dw .docd-scrim { display: none; }
.cmu-dw .docd-panel { pointer-events: auto; right: 40rem; width: min(40rem, calc(100vw - 45rem)); box-shadow: -24px 0 48px -24px rgba(52, 52, 52, .35); }
@media (max-width: 75rem) { .cmu-dw { z-index: 3; } .cmu-dw .docd-panel { right: 0; width: min(40rem, 100vw); } } /* no room beside it: over it */`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>';
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';
  const SPIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';
  const OK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"/></svg>';
  const WARN = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>';
  const FOLD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17l5-5-5-5M13 17l5-5-5-5"/></svg>';
  const size = (b) => (!b ? '' : b < 1e6 ? Math.max(1, Math.round(b / 1e3)) + ' KB' : (b / 1e6).toFixed(1) + ' MB');

  // the toast, shared with the pages that show ALMA reading on their own (js/alma-job.js)
  const toast = (html, act) => { if (window.CMAlmaJob) window.CMAlmaJob.toast(html, act); };

  const open = (spec, opts = {}) => {
    const R0 = resolve(spec); if (!R0 || !R0.pool.length) return false;
    let { pool } = R0; const { focus } = R0;
    // who ALMA found on the files (identify), once read; the new people the user adds go on the list
    // after anything already added, in the order they're shown
    const crewCtx = crewHere() && pool.some((sl) => sl.d.area === 'workers');
    let found = null, sorted = 0;
    // a worker register isn't reviewed as a document: who's on it was the step before (who to add,
    // their details), so it's saved with the rest, and no card asks to accept it
    const quiet = (r) => !!(r.slot && r.slot.code === 'WK-REG');
    const shown = () => results.filter((r) => r.on && !quiet(r));
    // on to saving: what differs from what's on file waits for the user's approval, else it's saved
    const toSave = () => {
      closePeek();
      reviews = reviewOf(results, !!(found && found.people.length)); stage = 0;
      if (reviews.length) { step = 4; paint(); panel.scrollTop = 0; $('cmu-body').scrollTop = 0; } else save();
    };
    // the review, after filing; nothing left to review (only a register): straight on
    const toReview = () => { results.forEach((r) => { if (quiet(r)) r.ok = true; }); if (!shown().length && results.some((r) => r.on && r.slot)) { toSave(); return; } step = 3; paint(); el.querySelector('select, [data-save]')?.focus({ preventScroll: true }); };
    const fs = focus && pool.find((s) => s.key === focus);
    let files = [...(opts.files || [])], step = 1, results = [], reading = 0, reviews = [], stage = 0;
    // a job picked up from another page opens at once with its files' names; the files follow
    if (opts.later) opts.later.then((list) => list.forEach((f, k) => { const was = files[k]; files[k] = f; results.forEach((r) => { if (r.file === was) r.file = f; }); }));
    const last = document.activeElement;
    const el = document.createElement('div');
    el.className = 'cmu'; el.hidden = true;
    el.innerHTML = `<div class="cmu-scrim" data-x></div><div class="cmu-panel" role="dialog" aria-modal="true" aria-labelledby="cmu-h" tabindex="-1">
      <header class="cmu-head"><span class="cmu-alma" aria-hidden="true">${window.ESG && window.ESG.SPHERES ? window.ESG.SPHERES : ''}</span><div class="cmu-t"><p class="eyebrow">ALMA</p><h2 id="cmu-h">${esc(R0.title)}</h2><p>${R0.lead}</p></div><span class="cmu-acts"><button type="button" class="cmu-fold" data-tuck aria-label="Hide the panel" title="Hide the panel">${FOLD}</button><button type="button" class="cmu-x" data-x aria-label="Close">${XI}</button></span></header>
      <nav class="cmu-rail" aria-label="ALMA, uploading documents" hidden>${window.CMAlmaJob ? window.CMAlmaJob.rail() : ''}</nav>
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
    })() + (window.CMUncat ? `<option value="__u"${cur === '__u' ? ' selected' : ''}>Not sure: Uncategorized documents</option>` : '');

    // the changes, one area per stage, in the order Documents lists its areas
    const stages = () => { const order = (M.AREAS || []).map((a) => a.key); return [...new Set(reviews.map((v) => v.area))].sort((x, y) => order.indexOf(x) - order.indexOf(y)); };
    const decided = (v) => (v.decision === 'no' || !!v.decision) && (v.decision === 'no' || v.crew.every((c) => c.decision));
    // a change to decide, as a review card's: Reject and Approve; decided, what was decided and Undo
    const dec = (id, cur, off, what) => off ? '<span class="co-badge b-neu">Rejected</span>'
      : cur === 'ok' ? `<span class="cmu-r-dec"><button type="button" class="link-btn" data-dec="${id}" data-v="" aria-label="Undo: ${esc(what)}">Undo</button><span class="cmu-acc is-ok">${TICK}Approved</span></span>`
      : cur === 'no' ? `<span class="cmu-r-dec"><button type="button" class="link-btn" data-dec="${id}" data-v="" aria-label="Undo: ${esc(what)}">Undo</button><span class="co-badge b-neu">Rejected</span></span>`
      : `<span class="cmu-r-dec"><button class="cmu-acc cmu-rej" type="button" data-dec="${id}" data-v="no" aria-label="Reject: ${esc(what)}">${CROSS}Reject</button><button class="cmu-acc" type="button" data-dec="${id}" data-v="ok" aria-label="Approve: ${esc(what)}">${TICK}Approve</button></span>`;
    const CREW_T = { join: (c) => `<b>${esc(plain(c.name))}</b> <small>${esc(c.role)} &middot; joins the list</small>`, leave: (c) => `<b>${esc(plain(c.name))}</b> <small>${esc(c.role)} &middot; no longer on the list</small>`, role: (c) => `<b>${esc(plain(c.name))}</b> <small>Job category changes from ${esc(c.from)} to ${esc(c.to)}</small>` };
    const head = (eyebrow, title, lead) => { el.querySelector('.cmu-t .eyebrow').innerHTML = eyebrow; $('cmu-h').innerHTML = esc(title); el.querySelector('.cmu-t > p:last-child').innerHTML = lead; };
    const changes = () => {
      const st = stages(), a = st[stage], list = reviews.map((v, k) => [v, k]).filter(([v]) => v.area === a);
      head(`ALMA noticed changes${st.length > 1 ? ` &middot; ${stage + 1} of ${st.length}` : ''}`, M.AREA_TITLE[a] || 'Changes',
        'Nothing on file changes until you approve it. A file you reject is left out, and what you have stays as it is.');
      const pills = st.length > 1 ? `<ol class="cmu-stages" aria-label="Areas with changes">${st.map((x, i) => { const done = reviews.filter((v) => v.area === x).every(decided); return `<li class="${i === stage ? 'is-on' : ''}${done ? ' is-done' : ''}"${i === stage ? ' aria-current="step"' : ''}>${done && i !== stage ? OK : ''}${esc(M.AREA_TITLE[x] || x)}</li>`; }).join('')}</ol>` : '';
      const n = list.reduce((t, [v]) => t + (v.fields ? 1 : 0) + v.crew.length, 0);
      const bulk = `<div class="cmu-bulk"><span>${n} change${n === 1 ? '' : 's'} to decide here</span><span class="cmu-r-dec"><button type="button" class="link-btn" data-all="no">Reject all</button><button class="cmu-acc" type="button" data-all="ok">${TICK}Approve all</button></span></div>`;
      const cards = list.map(([v, k]) => {
        const sl = v.r.slot, off = v.decision === 'no';
        const fields = v.fields ? `<table class="cmu-diff"><thead><tr><th>What</th><th>On file now</th><th>New file</th></tr></thead><tbody>${v.fields.map((f) => `<tr${f.flag ? ' class="is-flag"' : ''}><td>${f.label}</td><td>${f.from}</td><td>${f.to}</td></tr>${f.flag ? `<tr class="is-flag cmu-flag"><td colspan="3">${WARN.replace('<svg', '<svg width="13" height="13" style="vertical-align:-2px;margin-right:4px;color:var(--color-caution,#d9a21b)"')}${f.flag}</td></tr>` : ''}`).join('')}</tbody></table>` : '';
        const crew = v.crew.length ? `<div class="cmu-crew${off ? ' is-off' : ''}"><h4>Worker list <span>&middot; ${v.crew.length} difference${v.crew.length === 1 ? '' : 's'} from the ${(M.PERSON || []).filter((p) => !p.left).length} workers on file</span></h4><ul>${v.crew.map((c, j) => { const txt = CREW_T[c.type](c); return `<li><span>${txt}</span>${dec(`${k}:${j}`, off ? 'no' : c.decision, off, plain(c.name))}</li>`; }).join('')}</ul></div>` : '';
        return `<section class="cmu-r cmu-chg"><div class="cmu-r-h"><span class="cmu-ic">${FILE}</span><span><b>${esc(sl.name)}${sl.who ? ` &middot; ${esc(sl.who)}` : ''}</b><small>${esc(v.r.file.name)}${v.fields ? ' &middot; replaces the one on file' : sl.status === 'processing' ? ' &middot; the one on file is still being read' : ' &middot; nothing on file yet'}</small></span>${v.fields ? dec(k, v.decision, false, `Replace ${sl.name}`) : '<span class="co-badge b-neu">New</span>'}</div>${fields}${crew}</section>`;
      }).join('');
      $('cmu-body').innerHTML = pills + bulk + cards;
      const open = reviews.filter((v) => !decided(v)).length, last = stage === st.length - 1;
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-prev>${stage ? 'Previous' : 'Back to the files'}</button><span class="cmu-foot-l">${open ? `${open} file${open === 1 ? '' : 's'} still to decide` : 'Every change decided'}</span>`
        + (last ? `<button type="button" class="btn btn-primary btn-sm" data-commit${open ? ' disabled' : ''}>Save what you approved</button>` : '<button type="button" class="btn btn-primary btn-sm" data-next>Next</button>');
    };
    // her confidence, or that the user corrected her; the reference she read, or the one typed over it
    const confOf = (r) => (!r.slot ? '' : r.edited ? '<span class="co-badge b-neu">' + M.corrected() + '</span>' : r.how === 'sure' ? '<span class="co-badge b-ok">High confidence</span>' : '<span class="co-badge b-pend">Medium confidence</span>');
    const refOf = (s, r) => (r.ref != null ? r.ref : refFor(s, r));
    // the fields the setup shows for each document, in its order; dates kept as everywhere else
    // (17 Jan 2027), given to the date pickers as 2027-01-17
    const FIELDS = [['ref', 'Reference'], ['by', 'Issued by'], ['country', 'Country'], ['issued', 'Issue date'], ['valid', 'Valid until']]; // every field she read can be put right
    const DATES = ['issued', 'valid'], NA = ['Not applicable', 'No expiry'];
    const issuerFor = (sl) => { const on = sl.i == null && sl.d.by ? plain(sl.d.by) : '', cat = plain(M.issuerOf(sl.d.cat) || ''); return on || (cat && !/\bof [A-Z]{2}-\d/.test(cat) ? cat : 'The issuing body'); };
    const labOf = (s, f, l) => (s && s.code === 'ID' && f === 'ref' ? 'Document number' : l);
    const COUNTRY = { PT: 'Portugal', ES: 'Spain', FR: 'France', US: 'United States', BR: 'Brazil', GB: 'United Kingdom', DE: 'Germany' };
    const valsOf = (r) => ({ country: r.country != null ? r.country : COUNTRY[(M.PROFILE || {}).country] || (M.PROFILE || {}).country || '', by: r.by != null ? r.by : issuerFor(r.slot),
      ref: refOf(r.slot, r), issued: r.read.issued, valid: r.read.valid });
    const isoOf = (v) => { const t = Date.parse(v); if (Number.isNaN(t)) return ''; const x = new Date(t); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
    const fromIso = (v) => fmt(new Date(v + 'T00:00'));
    // expired: the date read has passed; it needs a new one, none (not applicable), or a current file
    const lapsedR = (r) => !!r.slot && !NA.includes(r.read.valid) && !Number.isNaN(Date.parse(r.read.valid)) && Date.parse(r.read.valid) < new Date().setHours(0, 0, 0, 0);
    const corrected = (r) => Object.assign(r, { edited: true, how: 'sure' });
    // a worker's document: what ALMA extracts from it, as the list has it per document
    // (js/worker-docs.js), each to check and change; its dates are the card's own issue and expiry
    const wFields = (s) => {
      if (!s || s.i == null || !s.who || !s.d || s.d.area !== 'workers') return null;
      const l = ((window.CM_WORKER_DOCS || {})[s.code] || {}).fields || (s.d.cat && s.d.cat.fields) || [];
      let iss = false, val = false;
      return l.length ? l.map((fl, j) => {
        const n = fl.name.toLowerCase();
        const key = /expiry|end date|period end/.test(n) && !val ? (val = true, 'valid') : /issue date|start date|period start|delivery date/.test(n) && !iss ? (iss = true, 'issued') : `w${j}`;
        return [key, fl.name.replace(/\s*\((issue|expiry) date\)$/i, '').replace(/^Issue date \(delivery date\)$/i, 'Delivery date')];
      }) : null;
    };
    const personOf = (s) => (s.fresh ? Object.assign({ name: s.fresh.name, role: s.fresh.role }, s.fresh.prof || {}, { nationalityName: (s.fresh.prof || {}).nationality }) : M.PERSON[s.i] || {});
    const wVal = (r, key, label) => {
      const s = r.slot, v = (r.wv || {})[key]; if (v != null) return v;
      const p = personOf(s), n = label.toLowerCase(), h = hash(s.key + label);
      if (/full name|worker name/.test(n)) return s.who;
      if (/employer/.test(n)) return plain(M.D.company || '');
      if (/nationality/.test(n)) return plain(p.nationalityName || '');
      if (/date of birth/.test(n)) return plain(p.birth || '');
      if (/document number|passport number/.test(n)) return refOf(s, r);
      if (/social security|personal identification/.test(n)) return plain(p.ss || '');
      if (/tax number/.test(n)) return plain(p.tax || '');
      if (/issuing country/.test(n)) return COUNTRY[(M.PROFILE || {}).country] || '';
      if (/job category|occupation|^trade$|trade \/ category/.test(n)) return plain(p.role || '');
      if (/signed by|\(y\/n\)|yes\/no|right to work/.test(n)) return 'Yes';
      if (/^result/.test(n)) return 'Fit';
      if (/restrictions/.test(n)) return 'None';
      if (/exam type/.test(n)) return 'Periodic';
      if (/doctor|training entity|certifying body|issuing entity|trainer/.test(n)) return issuerFor(s);
      if (/hours/.test(n)) return String(8 + (h % 5) * 4);
      if (/task|topic/.test(n)) return ['Work at height', 'Scaffolding', 'Confined spaces', 'Excavations'][h % 4];
      if (/equipment type/.test(n)) return ['Excavator', 'Aerial work platform', 'Forklift', 'Tower crane'][h % 4];
      if (/ppe items/.test(n)) return 'Helmet, safety boots, gloves, high-visibility vest, harness';
      if (/harness/.test(n)) return `HS-${String(10000 + h % 89999)}`;
      if (/categories/.test(n)) return ['B', 'B, C', 'B, C, CE'][h % 3];
      if (/record status/.test(n)) return 'No record';
      if (/purpose/.test(n)) return 'Employment';
      if (/permit type|permit class/.test(n)) return 'Residence permit for work';
      if (/application type/.test(n)) return 'Renewal';
      if (/contract type/.test(n)) return /fixed/i.test(p.employment || '') ? 'Fixed-term' : 'Permanent';
      if (/qualification level/.test(n)) return 'Level 2';
      if (/^standard$/.test(n)) return 'ISO 9606-1';
      if (/welding process/.test(n)) return '135 (MAG)';
      if (/material group/.test(n)) return 'FM1';
      if (/course/.test(n)) return '30 hours';
      if (/industry/.test(n)) return 'Construction';
      if (/number/.test(n)) return refOf(s, r);
      return '';
    };

    // ---- the file, beside the drawer (as the setup's preview): the file itself, and what she read --
    const dw = document.createElement('div');
    dw.className = 'docd cdd cmu-dw'; dw.hidden = true;
    dw.innerHTML = `<div class="docd-scrim"></div><aside class="docd-panel" role="dialog" aria-labelledby="cmu-dw-t" tabindex="-1">
        <header class="docd-head"><span class="docd-ico" aria-hidden="true">${FILE}</span><div class="docd-t"><h3 id="cmu-dw-t"></h3><p id="cmu-dw-sub"></p></div>
          <button type="button" class="dlg-x" data-dwx aria-label="Close the preview">${XI}</button></header>
        <div class="docd-bar"><span>The file you uploaded</span><span id="cmu-dw-conf"></span></div>
        <div class="docd-body" id="cmu-dw-body"></div>
        <footer class="docd-foot"><span id="cmu-dw-foot"></span><span class="cdd-acts" id="cmu-dw-acts"></span></footer>
      </aside>`;
    el.appendChild(dw);
    let peek = null;
    const paintPeek = () => {
      const r = results[peek]; if (!r) { closePeek(); return; }
      const s = r.slot, q = (id) => dw.querySelector('#' + id);
      q('cmu-dw-t').textContent = s ? label(s) : r.file.name;
      q('cmu-dw-sub').innerHTML = `${esc(r.file.name)}${r.file.size ? ' &middot; ' + size(r.file.size) : ''}`;
      q('cmu-dw-conf').innerHTML = s && lapsedR(r) ? '<span class="co-badge b-over">Expired</span>' : confOf(r);
      const kv = (k, v) => `<div class="pd-kv"><dt>${k}</dt><dd>${v}</dd></div>`;
      const v = s ? valsOf(r) : {};
      const read = s ? `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><dl class="pd-facts cdd-facts">${kv(s.who ? 'Name on it' : 'Holder', esc(s.who || plain(M.D.company || 'Your company')))}${FIELDS.filter(([f]) => f !== 'ref' || s.i == null || s.code === 'ID').map(([f, l]) => kv(labOf(s, f, l), esc(v[f]))).join('')}</dl></section>`
        : `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><p class="cdd-desc">She couldn&rsquo;t tell which document this is. Choose where it goes in the drawer.</p></section>`;
      // the page with each value she read highlighted, the file as uploaded one click away (js/doc-files.js)
      const rec = { name: r.file.name, type: r.file.type, size: r.file.size, blob: r.file };
      const spec = s ? { title: plain(label(s)), file: r.file.name, issuer: v.by && !/^(Not applicable|No expiry)$/.test(v.by) ? v.by : '', fields: [{ name: s.who ? 'Name on it' : 'Holder', value: s.who || plain(M.D.company || 'Your company') }].concat(FIELDS.filter(([f]) => f !== 'ref' || s.i == null || s.code === 'ID').map(([f, l]) => ({ name: labOf(s, f, l), value: v[f] }))) } : null;
      q('cmu-dw-body').innerHTML = (window.CMFiles ? (spec && window.CMFiles.preview ? window.CMFiles.preview(rec, spec) : window.CMFiles.view(rec)) : '') + read;
      // as the setup's: whether it's accepted, Make changes, Accept
      q('cmu-dw-foot').textContent = !r.on ? 'Left out' : !s ? 'Needs a place' : r.ok ? 'Accepted' : 'Not accepted yet';
      q('cmu-dw-acts').innerHTML = !s || !r.on ? '' : `<button type="button" class="link-btn" data-dwedit>Make changes</button>${r.ok ? `<span class="cmu-acc is-ok">${TICK}Accepted</span>` : `<button class="cmu-acc" type="button" data-dwaccept${lapsedR(r) ? ' disabled title="Give it a new expiry date, or mark the date not applicable"' : ''}>${TICK}Accept</button>`}`;
    };
    const edit = (k) => { results.forEach((x, j) => { x.editing = j === k; }); paint(); const c = el.querySelector(`.cmu-r[data-card="${k}"]`), i = c && (c.querySelector('.is-flag input') || c.querySelector('.cmu-fields input')); if (i) { i.scrollIntoView({ block: 'center' }); i.focus(); } };
    // Replace file: another file in its place, read again
    let swapAt = null;
    const swapIn = Object.assign(document.createElement('input'), { type: 'file', id: 'cmu-swap', hidden: true });
    el.appendChild(swapIn);
    swapIn.addEventListener('change', () => {
      const f = swapIn.files[0], r = results[swapAt]; if (!f || !r) return;
      files[files.indexOf(r.file)] = f;
      Object.assign(r, { file: f, read: r.slot ? readDates(r.slot, f) : r.read, ref: null, by: null, country: null, edited: false, editing: false, ok: false });
      paint(); if (peek === swapAt) paintPeek();
    });
    const openPeek = (k) => { peek = k; dw.hidden = false; paintPeek(); setTimeout(() => dw.classList.add('is-open'), 20); dw.querySelector('.docd-panel').focus({ preventScroll: true }); };
    const closePeek = () => { if (dw.hidden) return; dw.classList.remove('is-open'); peek = null; setTimeout(() => { if (peek == null) dw.hidden = true; }, 250); };
    dw.addEventListener('click', (e) => {
      if (e.target.closest('[data-dwx]')) { const k = peek; closePeek(); const b = el.querySelector(`.cmu-peek[data-peek="${k}"]`); if (b) b.focus({ preventScroll: true }); return; }
      if (e.target.closest('[data-dwedit]')) { const k = peek; closePeek(); edit(k); return; }
      if (e.target.closest('[data-dwaccept]')) { results[peek].ok = true; paint(); closePeek(); } // accepted: back to the review, where its card shows it
    });

    const paint = () => {
      const body = $('cmu-body'), foot = $('cmu-foot');
      panel.classList.toggle('is-wide', step === 4);
      el.querySelector('.cmu-alma').classList.toggle('is-reading', step === 2 || step === 'wread' || step === 'sort');
      if (step === 4) { changes(); return; }
      if (step === 'who') { whoStep(); return; }
      if (step === 'wread' || step === 'details') { detailsStep(); return; }
      head('ALMA', R0.title, R0.lead);
      if (step === 'sort') {
        body.innerHTML = `<div class="cmu-list"><h3>Filing each one for its worker</h3>${results.map((r, k) => { const sl = r.slot, ok = k < sorted, now = k === sorted; return `<div class="cmu-f ${ok ? 'is-done' : now ? 'is-reading' : ''}"><span class="cmu-ic">${ok ? OK : now ? SPIN : FILE}</span><span class="cmu-n">${esc(r.file.name)}</span><small>${ok ? (sl ? esc(sl.who ? `${sl.who} · ${sl.name}` : sl.name) : 'Needs a place') : now ? 'Reading its fields&hellip;' : 'Waiting'}</small></div>`; }).join('')}</div>`;
        foot.innerHTML = '<span class="cmu-foot-l">Putting each document in its worker&rsquo;s file, under its type.</span>';
        return;
      }
      if (step === 1) {
        const many = pool.length > 1 && !fs;
        const need = pool.filter((s) => M.RANK[s.status] > 0).length;
        const now = fs ? `<div class="cmu-now"><span>Now on file</span><b>${stat(fs)} ${fs.exp && fs.exp !== '—' && !NO_FILE.includes(fs.status) ? `<span>${fs.status === 'expired' ? 'on' : 'until'} ${esc(fs.exp)}</span>` : ''}</b></div>`
          : many ? `<div class="cmu-now"><span>${pool.length} document${pool.length === 1 ? '' : 's'} can go here</span><b>${need ? `${need} need${need === 1 ? 's' : ''} a file` : 'All in order'}</b></div>` : '';
        const list = files.length ? `<div class="cmu-list"><h3>Your files &middot; ${files.length}</h3>${files.map((f, k) => `<div class="cmu-f"><span class="cmu-ic">${FILE}</span><span class="cmu-n">${esc(f.name)}</span><small>${size(f.size)}</small><button type="button" class="cmu-rm" data-rm="${k}" aria-label="Remove ${esc(f.name)}">${XI}</button></div>`).join('')}</div>` : '';
        body.innerHTML = now + `<div class="cmu-drop" id="cmu-drop" role="button" tabindex="0" aria-label="Add files">${UP}<b>${files.length ? 'Add more files' : `Drop ${fs ? 'the file' : 'files'} here`}</b><span>or <u>browse your device</u> &middot; PDF, scan or photo</span></div>`
          + (window.CMLibrary && window.CMLibrary.has() ? `<div class="cmu-lib"><span>or</span>${window.CMLibrary.button('data-lib')}</div>` : '') + list;
        foot.innerHTML = `<button type="button" class="link-btn" data-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-read${files.length ? '' : ' disabled'}>${files.length > 1 ? `Check ${files.length} files with ALMA` : 'Check it with ALMA'}</button>`;
      } else if (step === 2) {
        body.innerHTML = `<div class="cmu-list"><h3>ALMA is reading</h3>${files.map((f, k) => `<div class="cmu-f ${k < reading ? 'is-done' : k === reading ? 'is-reading' : ''}"><span class="cmu-ic">${k < reading ? OK : k === reading ? SPIN : FILE}</span><span class="cmu-n">${esc(f.name)}</span><small>${k < reading ? 'Checked' : k === reading ? 'Reading the name, dates and issuer&hellip;' : 'Waiting'}</small></div>`).join('')}</div>`;
        body.insertAdjacentHTML('afterbegin', `<div class="cmu-hide"><span>${files.length > 1 ? 'This can take a few minutes.' : 'This can take a minute.'} Hide the panel and keep working: I&rsquo;ll let you know when I&rsquo;m done.</span><button type="button" class="btn btn-quiet btn-sm" data-tuck>Hide panel</button></div>`);
        foot.innerHTML = '<span class="cmu-foot-l">Checking each one with the body that issued it.</span>';
      } else {
        // as the setup's review (js/guided-upload.js): how many are accepted, Accept all; expired first
        const on = shown(), ready = on.filter((r) => r.slot);
        const grouped = !!(found && found.asked), gk = (r) => (!r.slot ? '\uffff' : r.slot.who || '');
        const order = results.map((r, k) => k).filter((k) => !quiet(results[k])).sort((a, b) => (grouped ? gk(results[a]).localeCompare(gk(results[b])) : 0) || (lapsedR(results[b]) && results[b].on) - (lapsedR(results[a]) && results[a].on) || a - b);
        let lastG = null;
        const whoHead = (k) => {
          if (!grouped) return ''; const r = results[k], g = gk(r); if (g === lastG) return ''; lastG = g;
          const n = order.filter((j) => gk(results[j]) === g).length, fr = r.slot && r.slot.fresh;
          return `<h3 class="cmu-who">${esc(!r.slot ? 'Not placed yet' : g || plain(M.D.company || 'Your company'))}${fr ? ' <span class="co-badge b-info">New worker</span>' : ''}<small>${n} file${n === 1 ? '' : 's'}</small></h3>`;
        };
        const acc = ready.filter((r) => r.ok).length, exN = ready.filter((r) => lapsedR(r) && !r.ok).length, editing = results.some((r) => r.editing);
        const all = editing || !ready.length ? '' : ready.some((r) => !r.ok && !lapsedR(r)) ? `<button class="cmu-acc" type="button" data-accept-all>${TICK}Accept ${exN ? 'the rest' : 'all'}</button>` : acc === ready.length ? '<button class="cmu-acc" type="button" data-unaccept-all>Unaccept all</button>' : '';
        const bar = ready.length ? `${exN ? `<p class="cmu-note" role="status">${exN === 1 ? 'One document has' : `${exN} documents have`} expired. Give ${exN === 1 ? 'it' : 'each'} its new expiry date if still in force, mark the date not applicable, or replace ${exN === 1 ? 'it' : 'them'} with a current version.</p>` : ''}
          <div class="cmu-bar"><span>${acc} of ${ready.length} accepted</span>${all}</div>` : '';
        body.innerHTML = bar + order.map((k) => whoHead(k) + (() => {
          const r = results[k], s = r.slot, ask = r.on && !s, ex = s && lapsedR(r), v = s ? valsOf(r) : {};
          // left out (rejected): it says so, and can come back
          if (!r.on) return `<section class="cmu-r is-off" data-card="${k}" aria-label="${esc(r.file.name)}"><div class="cmu-r-h"><div class="cmu-r-t"><h3>${esc(s ? label(s) : r.file.name)}</h3><p>${esc(r.file.name)} &middot; left out, nothing is saved from it</p></div><button type="button" class="link-btn" data-undo-rej="${k}">Undo</button></div></section>`;
          // the fields, as in the setup: read as she read them, or (Make changes) as fields, the dates
          // with a date picker that can also be not applicable
          const wf = wFields(s);
          const fieldsOf = () => (wf || FIELDS.filter(([f]) => f !== 'ref' || s.i == null || s.code === 'ID')).map(([f, l]) => {
            if (wf && !DATES.includes(f)) { const val = wVal(r, f, l); return `<div><dt>${esc(l)}</dt><dd>${r.editing ? `<input name="${f}" value="${esc(val)}" aria-label="${esc(l)}">` : val ? esc(val) : '<span class="co-subtle">Not on it</span>'}</dd></div>`; }
            const flag = ex && f === 'valid', na = DATES.includes(f) && NA.includes(v[f]);
            const input = !DATES.includes(f) ? `<input name="${f}" value="${esc(v[f])}" aria-label="${l}">`
              : `<input type="date" name="${f}" value="${na ? '' : isoOf(v[f])}" aria-label="${l}"${na ? ' disabled' : ''}><label class="cmu-fna"><input type="checkbox" data-fna="${f}"${na ? ' checked' : ''}>Not applicable</label>`;
            return `<div${flag ? ' class="is-flag"' : ''}><dt>${labOf(s, f, l)}</dt><dd>${r.editing ? input : esc(v[f])}</dd></div>`;
          }).join('');
          const expBlock = !ex || r.editing ? '' : `<p class="cmu-why">This document expired on <b>${esc(v.valid)}</b>. If it&rsquo;s still in force, give it its new expiry date. If it has none, mark the date not applicable. Or replace it with a current version.</p>
            <div class="cmu-exp"><label>New expiry date<input type="date" data-newexp="${k}" value="${isoOf(v.valid)}"></label><label class="cmu-exp-na"><input type="checkbox" data-expna="${k}">Expiry date not applicable</label></div>`;
          const left = r.editing ? '' : `<button type="button" class="link-btn" data-peek="${k}">Preview</button>${s ? `<button type="button" class="link-btn" data-edit="${k}">Make changes</button>` : ''}<button type="button" class="link-btn" data-swap="${k}">Replace file</button>`;
          const right = r.editing ? `<button type="button" class="link-btn" data-cancel="${k}">Cancel</button><button class="cmu-acc" type="button" data-fixsave="${k}">${TICK}Save changes</button>`
            : r.ok ? `<button type="button" class="link-btn" data-unaccept="${k}">Undo</button><span class="cmu-acc is-ok">${TICK}Accepted</span>`
            : `<button class="cmu-acc cmu-rej" type="button" data-reject="${k}">${CROSS}Reject</button>${s ? `<button class="cmu-acc" type="button" data-accept="${k}"${ex ? ' disabled title="Give it a new expiry date, or mark the date not applicable"' : ''}>${TICK}Accept</button>` : ''}`;
          const badge = ex ? '<span class="co-badge b-over">Expired</span>' : confOf(r);
          return `<section class="cmu-r${ask ? ' is-ask' : ''}${r.editing ? ' is-editing' : ''}${ex ? ' is-expired' : ''}${r.ok ? ' is-ok' : ''}" data-card="${k}" aria-label="${esc(r.file.name)}">
            <div class="cmu-r-h"><div class="cmu-r-t"><h3><button type="button" class="cmu-peek" data-peek="${k}">${esc(s ? label(s) : r.file.name)}</button></h3><p>${s ? esc(r.file.name) : 'Not placed yet'}</p></div>${badge}</div>
            ${r.note ? `<p class="cmu-note">${r.note}</p>` : ''}
            <label class="cmu-to"><span>${oneDoc && s && s.who ? 'Filed for' : 'Filed as'}</span><select data-to="${k}"${r.editing ? ' disabled' : ''}>${options(s ? s.key : r.uncat ? '__u' : '')}</select></label>
            ${s ? `<dl class="cmu-fields">${fieldsOf()}</dl>` : ''}${expBlock}
            <footer class="cmu-r-acts"><span>${left}</span><span>${right}</span></footer>
          </section>`;
        })()).join('');
        // on: what wasn't accepted goes in as she read it (as the setup's Continue); an expired one, a
        // file without a place, or a card being edited waits for the user
        const unc = on.filter((r) => !r.slot && r.uncat).length, left = on.length - ready.length - unc, nd = reviewOf(results, !!(found && found.people.length)).length, wait = left || exN || editing;
        const why = editing ? 'Save or cancel your changes first' : left ? `${left} still need${left === 1 ? 's' : ''} a place` : exN ? `${exN} expired: give ${exN === 1 ? 'it' : 'each'} a new date` : '';
        foot.innerHTML = `<button type="button" class="link-btn" data-back>Add or change files</button><span class="cmu-foot-l">${why}</span><button type="button" class="btn btn-primary btn-sm" data-save${(ready.length || unc) && !wait ? '' : ' disabled'}>${nd ? `Review ${nd} change${nd === 1 ? '' : 's'}` : ready.length + unc === 1 ? 'Save it' : `Save ${ready.length + unc} files`}</button>`;
      }
    };
    const add = (list) => { const l = [...(list || [])]; if (!l.length) return; files = files.concat(l); step = 1; paint(); };
    // folded to its rail: the page in full view while she reads; the rail (or the toast) opens it again
    let tucked = false;
    const rail = () => {
      const n = results.filter((x) => x.on).length || files.length;
      if (window.CMAlmaJob) window.CMAlmaJob.paint(el.querySelector('.cmu-rail'), step === 2 ? { reading: true, at: Math.min(reading + 1, files.length), total: files.length } : { done: step === 3, n });
    };
    const tuck = (on) => {
      tucked = on; if (on) closePeek();
      el.classList.toggle('is-tucked', on); el.querySelector('.cmu-rail').hidden = !on;
      panel.setAttribute('aria-modal', String(!on));
      [el.querySelector('.cmu-head'), $('cmu-body'), $('cmu-foot')].forEach((x) => { x.inert = on; });
      if (on) { rail(); el.querySelector('.cmu-rail .cmu-fold').focus({ preventScroll: true }); }
      else { (el.querySelector('select, [data-save]') || panel).focus({ preventScroll: true }); }
    };
    // she reads by the clock, kept as a job for the tab (js/alma-job.js): leave the page and she
    // carries on; come back and the drawer picks up where she is
    const read = (job) => {
      const quick = matchMedia('(prefers-reduced-motion: reduce)').matches;
      // a few seconds a file in the demo, so there's time to fold it away (she takes up to two minutes)
      if (!job) {
        job = { spec, start: Date.now(), per: quick ? 120 : 2400, files: files.map((f) => ({ name: f.name, type: f.type || '', size: f.size || 0 })) };
        if (window.CMAlmaJob) window.CMAlmaJob.save(job);
        if (window.CMFiles) files.forEach((f, k) => window.CMFiles.put(`~job:${k}`, f));
      }
      const J = window.CMAlmaJob, at = () => Math.min(files.length, Math.floor((Date.now() - job.start) / job.per));
      step = 2; reading = at(); paint(); if (tucked) rail();
      const tick = () => {
        if (!el.isConnected || step !== 2) return;
        reading = at();
        if (reading >= files.length) {
          // who is on them first: anyone new, or a list, is for the user to confirm before she files
          found = crewCtx ? identify(files, R0.pool) : null;
          // only someone new is asked about; who's already on the list is matched without asking
          // (and no one new is ticked to start: the user picks who to add)
          if (found) found.people.forEach((q) => { q.decision = q.i != null ? 'ok' : 'no'; });
          const ask = !!(found && found.people.some((q) => q.i == null));
          if (found) found.asked = ask;
          if (ask) { step = 'who'; wq = ''; paint(); } else fileThem(true);
          if (tucked) {
            rail();
            const n = results.filter((x) => x.on).length;
            if (!job.told) toast(ask ? ((n) => `ALMA found ${n === 1 ? 'someone' : `${n} people`} new to your worker list. Choose who to add, and she files the documents.`)(found.people.filter((q) => q.i == null).length) : J ? J.doneMsg(n) : 'ALMA has read your files.', ['Review', () => tuck(false)]);
          } else el.querySelector('[data-pgo], select, [data-save]')?.focus({ preventScroll: true });
          job.told = true; if (J) J.save(job);
          return;
        }
        paint(); if (tucked) rail();
        setTimeout(tick, Math.max(60, job.start + (reading + 1) * job.per - Date.now() + 30));
      };
      setTimeout(tick, Math.max(60, job.start + (reading + 1) * job.per - Date.now() + 30));
    };
    // ---- then she reads each one's details from the files (a register has them all; an ID document,
    // what's on it), shown as she read them and open to changes, as a document's fields are
    const PF = [['name', 'Full name'], ['role', 'Job category'], ['type', 'ID document'], ['no', 'Document number'], ['valid', 'Valid until', 1], ['birth', 'Birth date', 1],
      ['nationality', 'Nationality'], ['tax', 'Tax number (NIF)'], ['ss', 'Social security number (NISS)'], ['address', 'Home address'], ['since', 'Start date', 1]];
    const STREET = ['Rua de Santa Catarina', 'Avenida da Rep\u00fablica', 'Rua do Almada', 'Rua Costa Cabral', 'Avenida Fern\u00e3o de Magalh\u00e3es', 'Rua de Cedofeita', 'Rua Formosa', 'Rua da Constitui\u00e7\u00e3o'];
    const nifOf = (h) => { const d = String(2 + (h % 2)) + String(10000000 + h * 7919).slice(-7); const t = [...d].reduce((a, c, k) => a + c * (9 - k), 0) % 11; return `${d}${t < 2 ? 0 : 11 - t}`.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'); };
    const profOf = (q) => {
      if (q.prof) return q.prof;
      const h = hash(q.name), reg = q.lists.length > 0, pp = q.type === 'Passport', mo = (k) => M.MONTHS[(h + k) % 12];
      const since = new Date(); since.setDate(since.getDate() - 3 - (h % 20));
      q.prof = {
        name: q.name, role: q.role || '', type: q.type, no: q.no, valid: q.valid || '', birth: `${1 + (h % 27)} ${mo(3)} ${1970 + (h % 33)}`,
        nationality: pp ? '' : 'Portuguese',
        tax: reg ? nifOf(h) : '', ss: reg ? String(11000000000 + h * 104729).slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : '',
        address: reg ? `${STREET[h % STREET.length]} ${10 + (h % 400)}, ${4000 + (h % 370)}-${String(100 + (h % 899))} Porto` : '',
        since: reg ? fmt(since) : '',
      };
      return q.prof;
    };
    let wread = 0;
    const detailsStep = () => {
      const P = found.people.filter((q) => q.i == null && q.decision === 'ok');
      if (step === 'wread') {
        head('ALMA', `Reading ${P.length === 1 ? 'their' : `${P.length} workers&rsquo;`} details`, 'From the files you uploaded: what each one says about them.');
        $('cmu-body').innerHTML = `<div class="cmu-list"><h3>ALMA is reading</h3>${P.map((q, k) => `<div class="cmu-f ${k < wread ? 'is-done' : k === wread ? 'is-reading' : ''}"><span class="cmu-ic">${k < wread ? OK : k === wread ? SPIN : FILE}</span><span class="cmu-n">${esc(q.name)}</span><small>${k < wread ? 'Read' : k === wread ? 'Reading their ID, tax and social security numbers&hellip;' : 'Waiting'}</small></div>`).join('')}</div>`;
        $('cmu-foot').innerHTML = '<span class="cmu-foot-l">Reading each worker&rsquo;s details.</span>';
        return;
      }
      head('ALMA', `${P.length === 1 ? 'Their details' : `${P.length} workers&rsquo; details`}`, 'As I read them from your files. Check them, and make any changes before I add them.');
      const editing = P.some((q) => q.editing);
      // many of them: a search, as on the step before (filters as it's typed)
      const dMatch = (q) => !dq || fold(`${profOf(q).name} ${profOf(q).no}`).includes(fold(dq));
      const search = P.length > 5 ? `<label class="co-search cmu-wq">${SEARCH_I}<input type="search" placeholder="Search by name or ID number" aria-label="Search these workers" data-dq value="${esc(dq)}"></label>` : '';
      $('cmu-body').innerHTML = search + `<p class="cmu-dnone"${P.some(dMatch) ? ' hidden' : ''}>No one matches that.</p>` + P.map((q) => {
        const v = profOf(q), from = [...new Set(q.files.concat(q.lists))].map((j) => files[j].name);
        const cell = ([f, l, date]) => `<div><dt>${l}</dt><dd>${q.editing ? (date ? `<input type="date" name="${f}" value="${isoOf(v[f])}" aria-label="${l}">` : `<input name="${f}" value="${esc(v[f])}" aria-label="${l}">`) : v[f] ? esc(v[f]) : '<span class="co-subtle">Not on the file</span>'}</dd></div>`;
        return `<section class="cmu-r${q.editing ? ' is-editing' : ''}" data-dcard="${q.key}" aria-label="${esc(v.name)}"${dMatch(q) ? '' : ' hidden'}>
          <div class="cmu-r-h"><div class="cmu-r-t"><h3>${esc(v.name)}</h3><p>${esc(from.join(', '))}</p></div><span class="co-badge b-info">New worker</span></div>
          <dl class="cmu-fields">${PF.map(cell).join('')}</dl>
          <footer class="cmu-r-acts"><span>${q.editing ? '' : `<button type="button" class="link-btn" data-wedit="${q.key}">Make changes</button>`}</span><span>${q.editing ? `<button type="button" class="link-btn" data-wcancel="${q.key}">Cancel</button><button class="cmu-acc" type="button" data-wsave="${q.key}">${TICK}Save changes</button>` : ''}</span></footer>
        </section>`;
      }).join('');
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-wback>Back</button><span class="cmu-foot-l">${editing ? 'Save or cancel your changes first' : ''}</span><button type="button" class="btn btn-primary btn-sm" data-wgo${editing ? ' disabled' : ''}>Add ${P.length === 1 ? 'them' : P.length} and file the documents</button>`;
    };
    const readDetails = () => {
      const P = found.people.filter((q) => q.i == null && q.decision === 'ok');
      dq = ''; step = 'wread'; wread = 0; paint();
      const tick = () => { if (!el.isConnected || step !== 'wread') return; wread += 1; if (wread >= P.length) { P.forEach(profOf); step = 'details'; paint(); $('cmu-body').scrollTop = 0; return; } paint(); setTimeout(tick, 450); };
      setTimeout(tick, 450);
    };
    // the workers ALMA read who aren't on the list yet, as Team's list from a file (js/team.js): the
    // file they came from, then a table to tick the ones to add (all, to start)
    const initials = (n) => String(n).split(/\s+/).filter((w) => /^[A-ZÀ-Ý]/.test(w)).filter((w, j, a) => j === 0 || j === a.length - 1).map((w) => w[0]).join('') || '?';
    // a search over them, for a long list where only a few are to be added (filters as it's typed,
    // no repaint, so the field keeps the focus)
    let wq = '', dq = '';
    const wMatch = (q) => !wq || fold(`${q.name} ${q.no}`).includes(fold(wq));
    const SEARCH_I = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    const wAll = () => {
      const nw = found.people.filter((q) => q.i == null), shown = nw.filter(wMatch), on = shown.filter((q) => q.decision === 'ok').length, b = el.querySelector('[data-pall]');
      if (b) { b.checked = !!shown.length && on === shown.length; b.indeterminate = on > 0 && on < shown.length; b.disabled = !shown.length; }
    };
    const whoStep = () => {
      const nw = found.people.filter((q) => q.i == null), nOn = nw.filter((q) => q.decision === 'ok').length;
      head('ALMA', `${nw.length === 1 ? 'One new worker' : `${nw.length} new workers`}`, `${nw.length === 1 ? 'Not on your worker list yet. Add them?' : 'Not on your worker list yet. Select the ones to add.'}`);
      // where they were read: each file that names someone, and how many it names
      const src = files.map((f, k) => { const x = found.per[k], ppl = x ? x.people : []; if (!ppl.length) return ''; const n = ppl.filter((q) => q.i == null).length;
        return `<div class="cmu-src"><span class="cmu-src-ic">${FILE}</span><span><b>${esc(f.name)}</b><small>${x.list ? `${ppl.length} worker${ppl.length === 1 ? '' : 's'}: ${ppl.length - n} on your list, ${n} new` : n ? 'Someone new' : 'Someone on your list'}</small></span></div>`; }).join('');
      const row = (q) => `<tr class="${q.decision === 'ok' ? 'is-picked' : ''}" data-wrow="${q.key}"${wMatch(q) ? '' : ' hidden'}><td class="c"><input type="checkbox" class="cmu-pck" id="cmu-pk-${q.key}" data-pck="${q.key}" aria-label="Add ${esc(q.name)}"${q.decision === 'ok' ? ' checked' : ''}></td>
        <td><label class="cmu-wp" for="cmu-pk-${q.key}"><span class="cmu-pic" aria-hidden="true">${esc(initials(q.name))}</span><span class="cmu-wp-t"><b>${esc(q.name)}</b><small>${esc(q.type)} &middot; ${esc(q.no)}</small></span></label></td></tr>`;
      const search = nw.length > 5 ? `<label class="co-search cmu-wq">${SEARCH_I}<input type="search" placeholder="Search by name or ID number" aria-label="Search the new workers" data-wq value="${esc(wq)}"></label>` : '';
      $('cmu-body').innerHTML = `${src}${search}<div class="cmu-wt"><table><thead><tr><th class="c"><input type="checkbox" class="cmu-pck" data-pall="n" aria-label="Select everyone shown"></th><th>Worker</th></tr></thead><tbody>${nw.map(row).join('')}<tr class="cmu-wnone"${nw.some(wMatch) ? ' hidden' : ''}><td colspan="2">No one on the list matches that.</td></tr></tbody></table></div>`;
      wAll();
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-back>Add or change files</button><span class="cmu-foot-l">${nOn} of ${nw.length} selected</span><button type="button" class="btn btn-primary btn-sm" data-pgo>${nOn ? `Add ${nOn} worker${nOn === 1 ? '' : 's'}` : 'Continue without adding'}</button>`;
    };
    // the documents to their people: someone new gets their place on the list (and their documents'
    // slots); each file then goes to its worker, under its type, and she reads its fields
    const fileThem = (now) => {
      const base = (M.WORKERS || []).length;
      const fresh = found ? found.people.filter((q) => q.i == null && q.decision === 'ok') : [];
      fresh.forEach((q, k) => { q.ni = base + k; });
      pool = R0.pool.concat(fresh.flatMap(freshSlots));
      const picks = found ? found.per.map((x) => {
        if (x.list) return { list: true };
        const q = x.people[0]; if (!q) return null;
        if (q.decision === 'ok') return { who: q.name };
        return { off: q.i == null ? `It names ${esc(q.name)}, who you didn&rsquo;t add to your worker list. Choose where it goes, or leave it out.` : `You said this isn&rsquo;t ${esc(q.name)}. Choose whose it is, or leave it out.` };
      }) : null;
      results = place(pool, focus, files, picks);
      results.forEach((r) => { if (r.slot && r.slot.fresh && r.slot.code === 'ID' && r.slot.fresh.type === 'Passport') Object.assign(r, { by: 'Issuing country\u2019s passport office', country: 'Not read: check it' }); });
      // a list: who it names, now that they're confirmed
      if (found) found.per.forEach((x, k) => {
        if (!x.list || !results[k].slot) return;
        const on = x.people.filter((q) => q.decision === 'ok'), nn = on.filter((q) => q.i == null).length;
        results[k].note = `${fs && results[k].slot && results[k].slot.key !== fs.key ? `It&rsquo;s a ${esc(plain(results[k].slot.name).toLowerCase())}, not ${esc(fs.who ? `${fs.who}&rsquo;s ` : '')}${esc(fs.name)}, so it&rsquo;s filed as that. ` : ''}It names ${on.length} worker${on.length === 1 ? '' : 's'}: ${on.length - nn} on your list${nn ? `, and ${nn} you&rsquo;re adding` : ''}. I&rsquo;ve noted it in each one&rsquo;s file.`;
      });
      if (now || matchMedia('(prefers-reduced-motion: reduce)').matches) { toReview(); return; }
      step = 'sort'; sorted = 0; paint();
      const go = () => { if (!el.isConnected || step !== 'sort') return; sorted += 1; if (sorted >= results.length) { toReview(); return; } paint(); setTimeout(go, 420); };
      setTimeout(go, 420);
    };
    const save = () => {
      // what was rejected stays as it was; the rest is filed
      const kept = new Set(reviews.filter((v) => v.decision === 'no').map((v) => v.r));
      const done = results.filter((r) => r.on && r.slot && !kept.has(r));
      const crew = { added: [], left: [], roles: {} };
      reviews.filter((v) => v.decision !== 'no').forEach((v) => v.crew.filter((c) => c.decision === 'ok').forEach((c) => {
        if (c.type === 'join') crew.added.push([c.name, c.role]); else if (c.type === 'leave') crew.left.push(c.i); else crew.roles[c.i] = c.to;
      }));
      // the new people the user added, at the end of the list, with the ID ALMA read
      const fresh = found ? found.people.filter((q) => q.i == null && q.decision === 'ok') : [];
      fresh.forEach((q) => { const v = q.prof || {}; crew.added.push([q.name, q.role || '', q.type, q.no, q.valid, M.today(), { birth: v.birth || '', nationality: v.nationality || '', tax: v.tax || '', ss: v.ss || '', address: v.address || '', since: v.since || '' }]); });
      done.forEach((r, j) => {
        const s = r.slot, at = s.fresh ? s.fresh.ni : s.i, k = results.indexOf(r);
        // who a list names: the workers it covers, as each one's file shows it
        const x = found && found.per[k];
        if (x && x.list) M.saveList(s.code, x.people.filter((q) => q.decision === 'ok').map((q) => (q.i == null ? q.ni : q.i)));
        if (s.code === 'ID') { M.saveId(at, { type: s.fresh ? s.fresh.type : plain(M.PERSON[at].id[0]), no: refOf(s, r), valid: r.read.valid, file: r.file.name, on: M.today() }); if (window.CMFiles) window.CMFiles.put(`ID#${at}`, r.file); return; }
        if (EXTRA_D[s.code]) { M.saveExtra(s.code, at, { valid: r.read.valid, file: r.file.name, on: M.today() }); if (window.CMFiles) window.CMFiles.put(`${s.code}#${at}`, r.file); return; }
        if (s.code === 'WK-REG') { M.saveRegister({ file: r.file.name, on: M.today(), n: x && x.list ? x.people.filter((q) => q.decision === 'ok').length : 0 }); if (window.CMFiles) window.CMFiles.put('WK-REG', r.file); return; }
        if (s.fresh) { M.saveLater(s.code, at, { status: 'valid', exp: r.read.valid }); if (window.CMFiles) window.CMFiles.put(`${s.code}#${at}`, r.file); return; }
        if (s.i == null) M.saveDoc(s.code, { status: 'valid', issued: r.read.issued, valid: r.read.valid, note: '', ref: refOf(s, r), by: r.by != null ? r.by : issuerFor(s), conf: r.edited ? 98 : r.conf, edited: !!r.edited });
        else M.saveRecord(s.code, s.i, { status: 'valid', exp: r.read.valid });
        if (window.CMFiles) window.CMFiles.put(s.i == null ? s.code : `${s.code}#${s.i}`, r.file);
      });
      // the ones she couldn't place, and nobody chose for: Uncategorized documents
      const unc = results.filter((r) => r.on && !r.slot && r.uncat);
      unc.forEach((r) => { const id = window.CMUncat.add({ file: r.file.name, from: 'Uploaded from Documents' }); if (window.CMFiles) window.CMFiles.put('uncat:' + id, r.file); });
      close();
      if (!done.length && unc.length) { say(`${unc.length === 1 ? `${esc(unc[0].file.name)} is` : `${unc.length} files are`} in Uncategorized documents. Open ${unc.length === 1 ? 'it' : 'each'} there to say what it is.`, done); return; }
      const whose = [...new Set(done.map((r) => r.slot.who).filter(Boolean))];
      const nCrew = crew.added.length + crew.left.length + Object.keys(crew.roles).length;
      if (kept.size || nCrew) {
        const parts = [done.length ? `${done.length} document${done.length === 1 ? '' : 's'} saved` : 'Nothing replaced'];
        if (kept.size) parts.push(`${kept.size} kept as ${kept.size === 1 ? 'it was' : 'they were'}`);
        if (nCrew) parts.push(`worker list updated (${[crew.added.length && `${crew.added.length} added`, crew.left.length && `${crew.left.length} left`, Object.keys(crew.roles).length && `${Object.keys(crew.roles).length} new role`].filter(Boolean).join(', ')})`);
        const msg = parts.join(' &middot; ') + '.';
        // the crew is part of how the pages are drawn: they come back with it, and the message after
        if (nCrew) { M.saveCrew(crew); try { sessionStorage.setItem('cm-upload-toast', msg); } catch (e) {} location.reload(); return; }
        say(msg, done); return;
      }
      say(done.length === 1 ? `${esc(done[0].slot.name)}${done[0].slot.who ? ` for ${esc(done[0].slot.who)}` : ''} saved. ALMA checked it, valid until ${esc(done[0].read.valid)}.`
        : `${done.length} documents saved${whose.length > 1 ? ` across ${whose.length} records` : whose.length ? ` for ${esc(whose[0])}` : ''}. ALMA checked each one.`, done);
    };
    // the message, and the page brought up to date: by its own callback, or (a job picked up from
    // another page, which has none) by drawing it again, the message carried over
    const say = (msg, done) => {
      if (opts.onSaved) { toast(msg); opts.onSaved(done); return; }
      if (opts.resumed) { try { sessionStorage.setItem('cm-upload-toast', msg); } catch (e) {} location.reload(); return; }
      toast(msg);
    };
    const close = () => {
      if (window.CMAlmaJob) window.CMAlmaJob.clear();
      el.classList.remove('is-open'); document.removeEventListener('keydown', onKey, true);
      dw.classList.remove('is-open');
      setTimeout(() => el.remove(), 300);
      if (last && last.focus && last.isConnected) last.focus({ preventScroll: true });
    };
    const onKey = (e) => { if (e.key !== 'Escape' || step === 2 || step === 'sort' || step === 'wread' || tucked) return; e.stopPropagation(); if (peek != null) closePeek(); else close(); };
    document.addEventListener('keydown', onKey, true);
    el.addEventListener('click', (e) => {
      const t = (s) => e.target.closest(s);
      if (t('[data-tuck]')) { tuck(true); return; }
      if (t('[data-untuck]')) { tuck(false); return; }
      if (t('[data-x]')) { if (step !== 2 && step !== 'sort' && !tucked) close(); return; }
      if (t('#cmu-drop')) { $('cmu-file').value = ''; $('cmu-file').click(); return; }
      // from the company's C-MORE library: a copy of a document it already has (js/doc-library.js)
      if (t('[data-lib]')) { window.CMLibrary.pick({ multiple: !fs }).then((l) => { if (l && l.length) add(fs ? l.slice(0, 1) : l); else el.querySelector('[data-lib]')?.focus(); }); return; }
      if (t('[data-rm]')) { files.splice(+t('[data-rm]').dataset.rm, 1); paint(); return; }
      if (t('[data-read]')) { if (files.length) read(); return; }
      if (t('[data-back]')) { closePeek(); step = 1; if (window.CMAlmaJob) window.CMAlmaJob.clear(); paint(); return; }
      if (t('[data-peek]')) { openPeek(+t('[data-peek]').dataset.peek); return; }
      if (t('[data-edit]')) { edit(+t('[data-edit]').dataset.edit); return; }
      if (t('[data-cancel]')) { const k = +t('[data-cancel]').dataset.cancel; results[k].editing = false; paint(); el.querySelector(`[data-edit="${k}"]`)?.focus(); return; }
      if (t('[data-fixsave]')) {
        // what was typed over what she read, as in the setup: a date picker gives 2027-01-17, kept as
        // 17 Jan 2027; a date can be not applicable. Checked by a person, it reads as sure
        const k = +t('[data-fixsave]').dataset.fixsave, r = results[k], card = el.querySelector(`.cmu-r[data-card="${k}"]`), v = valsOf(r);
        let changed = false;
        (wFields(r.slot) || []).forEach(([f, l]) => {
          if (DATES.includes(f)) return; const inp = card.querySelector(`input[name="${f}"]`); if (!inp) return;
          const val = inp.value.trim(); if (val === wVal(r, f, l)) return; r.wv = Object.assign({}, r.wv, { [f]: val }); changed = true;
        });
        FIELDS.forEach(([f]) => {
          const box = card.querySelector(`[data-fna="${f}"]`), na = box && box.checked, inp = card.querySelector(`input[name="${f}"]`); if (!inp) return;
          const raw = na ? 'Not applicable' : inp.value.trim(), val = !na && DATES.includes(f) && raw ? fromIso(raw) : raw;
          if (!val || val === v[f]) return;
          changed = true;
          if (DATES.includes(f)) r.read = Object.assign({}, r.read, { [f]: val }); else r[f] = val;
        });
        if (changed) corrected(r);
        r.editing = false; if (lapsedR(r)) r.ok = false;
        paint(); if (peek === k) paintPeek(); el.querySelector(`[data-edit="${k}"]`)?.focus(); return;
      }
      if (t('[data-accept]')) { const k = +t('[data-accept]').dataset.accept; results[k].ok = true; paint(); if (peek === k) paintPeek(); return; }
      if (t('[data-unaccept]')) { const k = +t('[data-unaccept]').dataset.unaccept; results[k].ok = false; paint(); if (peek === k) paintPeek(); return; }
      if (t('[data-accept-all]')) { results.forEach((r) => { if (r.on && r.slot && !lapsedR(r)) r.ok = true; }); paint(); return; }
      if (t('[data-unaccept-all]')) { results.forEach((r) => { r.ok = false; }); paint(); return; }
      // Reject: not this document, or not read right; it's left out, and Undo brings it back
      if (t('[data-reject]')) { const k = +t('[data-reject]').dataset.reject; Object.assign(results[k], { on: false, ok: false, editing: false }); if (peek === k) closePeek(); paint(); return; }
      if (t('[data-undo-rej]')) { results[+t('[data-undo-rej]').dataset.undoRej].on = true; paint(); return; }
      if (t('[data-swap]')) { swapAt = +t('[data-swap]').dataset.swap; $('cmu-swap').value = ''; $('cmu-swap').click(); return; }
      if (t('[data-save]')) { toSave(); return; }
      if (t('[data-dec]')) {
        const [k, j] = t('[data-dec]').dataset.dec.split(':'), v = reviews[+k], val = t('[data-dec]').dataset.v;
        const d = val || undefined; if (j != null) v.crew[+j].decision = d; else v.decision = d;
        const keepAt = $('cmu-body').scrollTop; paint(); $('cmu-body').scrollTop = keepAt; return;
      }
      if (t('[data-all]')) {
        const val = t('[data-all]').dataset.all, a = stages()[stage];
        reviews.filter((v) => v.area === a).forEach((v) => { if (v.fields) v.decision = val; v.crew.forEach((c) => { c.decision = val; }); if (!v.fields) v.decision = 'ok'; });
        paint(); return;
      }
      if (t('[data-next]')) { stage = Math.min(stage + 1, stages().length - 1); paint(); $('cmu-body').scrollTop = 0; return; }
      if (t('[data-prev]')) { if (stage) { stage -= 1; } else step = shown().length ? 3 : found && found.asked ? 'who' : 1; paint(); $('cmu-body').scrollTop = 0; return; }
      if (t('[data-commit]')) { save(); return; }
      if (t('[data-pck]')) { const b = t('[data-pck]'), q = found.people.find((x) => x.key === b.dataset.pck); q.decision = b.checked ? 'ok' : 'no'; const at = $('cmu-body').scrollTop; paint(); $('cmu-body').scrollTop = at; el.querySelector(`[data-pck="${q.key}"]`)?.focus({ preventScroll: true }); return; }
      if (t('[data-pall]')) { const b = t('[data-pall]'), on = b.checked; found.people.filter((q) => q.i == null && wMatch(q)).forEach((q) => { q.decision = on ? 'ok' : 'no'; }); const at = $('cmu-body').scrollTop; paint(); $('cmu-body').scrollTop = at; el.querySelector('[data-pall]')?.focus({ preventScroll: true }); return; }
      if (t('[data-pgo]')) { if (found.people.some((q) => q.i == null && q.decision === 'ok')) readDetails(); else { fileThem(false); $('cmu-body').scrollTop = 0; } return; }
      if (t('[data-wback]')) { found.people.forEach((q) => { q.editing = false; }); step = 'who'; paint(); return; }
      if (t('[data-wgo]')) { fileThem(false); $('cmu-body').scrollTop = 0; return; }
      if (t('[data-wedit]')) { const q = found.people.find((x) => x.key === t('[data-wedit]').dataset.wedit); found.people.forEach((x) => { x.editing = x === q; }); paint(); el.querySelector('.cmu-r.is-editing input')?.focus(); return; }
      if (t('[data-wcancel]')) { const q = found.people.find((x) => x.key === t('[data-wcancel]').dataset.wcancel); q.editing = false; paint(); return; }
      if (t('[data-wsave]')) {
        // what was typed over what she read (a date picker's 2027-01-17 kept as 17 Jan 2027)
        const q = found.people.find((x) => x.key === t('[data-wsave]').dataset.wsave), card = t('[data-wsave]').closest('.cmu-r'), v = profOf(q);
        PF.forEach(([f, , date]) => { const i = card.querySelector(`input[name="${f}"]`); if (!i) return; const raw = i.value.trim(); v[f] = date && raw ? fromIso(raw) : raw; });
        if (v.name) q.name = v.name; else v.name = q.name;
        q.role = v.role; q.type = v.type; q.no = v.no; q.valid = v.valid; q.roleFrom = '';
        q.editing = false; paint(); return;
      }
      // anywhere else on a card: its preview, as in the setup
      const card = t('.cmu-r[data-card]');
      if (card && !card.classList.contains('is-editing') && !card.classList.contains('is-off') && !t('button, a, input, select, textarea, label')) openPeek(+card.dataset.card);
    });
    el.addEventListener('keydown', (e) => { if (e.target.id === 'cmu-drop' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.click(); } });
    el.addEventListener('input', (e) => {
      if (e.target.matches('[data-dq]')) {
        dq = e.target.value.trim();
        const P = found.people.filter((q) => q.i == null && q.decision === 'ok'), m = (q) => !dq || fold(`${profOf(q).name} ${profOf(q).no}`).includes(fold(dq));
        P.forEach((q) => { const c = el.querySelector(`[data-dcard="${q.key}"]`); if (c) c.hidden = !m(q); });
        const none = el.querySelector('.cmu-dnone'); if (none) none.hidden = P.some(m);
        return;
      }
      if (!e.target.matches('[data-wq]')) return;
      wq = e.target.value.trim();
      const nw = found.people.filter((q) => q.i == null);
      nw.forEach((q) => { const tr = el.querySelector(`[data-wrow="${q.key}"]`); if (tr) tr.hidden = !wMatch(q); });
      const none = el.querySelector('.cmu-wnone'); if (none) none.hidden = nw.some(wMatch);
      wAll();
    });
    // an expired one: its new date, kept when you leave the field or press Enter (a date field reports
    // every step as it's typed); or its expiry date not applicable
    const newDate = (i) => {
      const r = results[+i.dataset.newexp]; if (!r || !i.value) return;
      const v = fromIso(i.value); if (v === r.read.valid || v === 'NaN undefined NaN') return;
      r.read = Object.assign({}, r.read, { valid: v }); corrected(r); paint(); if (peek === +i.dataset.newexp) paintPeek();
    };
    el.addEventListener('focusout', (e) => { const i = e.target.closest('[data-newexp]'); if (i) newDate(i); });
    el.addEventListener('keydown', (e) => { const i = e.target.closest('[data-newexp]'); if (i && e.key === 'Enter') { e.preventDefault(); newDate(i); } });
    el.addEventListener('change', (e) => {
      if (e.target.id === 'cmu-file') { add(e.target.files); return; }
      const fna = e.target.closest('[data-fna]');
      if (fna) {
        // the box empties and locks the date; untick it and the date it had comes back
        const card = fna.closest('[data-card]'), r = results[+card.dataset.card], i = card.querySelector(`input[name="${fna.dataset.fna}"]`);
        i.disabled = fna.checked;
        if (fna.checked) { i.dataset.was = i.value; i.value = ''; } else { i.value = i.dataset.was || isoOf(r.read[fna.dataset.fna]); i.focus(); }
        return;
      }
      const xna = e.target.closest('[data-expna]');
      if (xna) { const k = +xna.dataset.expna, r = results[k]; r.read = Object.assign({}, r.read, { valid: 'Not applicable' }); corrected(r); paint(); if (peek === k) paintPeek(); return; }
      const on = e.target.closest('[data-on]'); if (on) { results[+on.dataset.on].on = on.checked; paint(); if (peek === +on.dataset.on) paintPeek(); return; }
      const to = e.target.closest('[data-to]');
      if (to) {
        // moved by hand: it takes that slot (whatever had it is left without one), and the dates follow it
        const r = results[+to.dataset.to], s = pool.find((x) => x.key === to.value);
        // not sure what it is: it goes to Uncategorized documents (js/doc-sort.js), to be sorted on Documents
        if (to.value === '__u') { Object.assign(r, { slot: null, uncat: true, how: 'sure', note: 'It goes to Uncategorized documents. Open it there, on Documents, to say what it is.', ok: false }); paint(); if (peek != null) paintPeek(); return; }
        r.uncat = false;
        results.forEach((o) => { if (o !== r && o.slot === s) { o.slot = null; o.note = 'Its place went to another file. Choose where this one goes.'; } });
        Object.assign(r, { slot: s, how: 'sure', note: '', read: readDates(s, r.file), ref: null, by: null, country: null, edited: false, ok: false });
        paint(); if (peek != null) paintPeek();
      }
    });
    el.addEventListener('dragover', (e) => { e.preventDefault(); const z = $('cmu-drop'); if (z) z.classList.add('is-over'); });
    el.addEventListener('dragleave', (e) => { const z = $('cmu-drop'); if (z && !el.contains(e.relatedTarget)) z.classList.remove('is-over'); });
    el.addEventListener('drop', (e) => { e.preventDefault(); if (step !== 2) add(e.dataTransfer.files); });
    paint();
    el.hidden = false;
    // picked up from another page, folded: already there, as it was on the page before (no slide in)
    if (opts.resume && opts.tucked) { el.classList.add('is-still', 'is-open'); requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('is-still'))); }
    else setTimeout(() => { el.classList.add('is-open'); panel.focus({ preventScroll: true }); }, 20);
    if (opts.resume) { read(opts.resume); if (opts.tucked) tuck(true); }
    else if (files.length && opts.files) setTimeout(() => read(), 200); // dropped straight on a row: ALMA starts reading
    return true;
  };

  // a row's button, the same everywhere: Upload where there's no file yet, Replace where there is
  // always the icon alone, wherever it is: Upload or Replace is its accessible name and its tooltip
  const button = (spec, has, name) => `<button type="button" class="cd-up is-icon" data-up="${esc(spec)}" title="${has ? 'Replace' : 'Upload'}${name ? ' ' + esc(plain(name)) : ''}">${UP}<span>${has ? 'Replace' : 'Upload'}</span></button>`;

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

  // a job from another page (js/alma-job.js): its files back from the file store, the drawer folded
  // where she is; how: 'open' or 'review' opens it (from the rail or the toast on another page)
  const resume = (job, how) => {
    if (!can(job.spec)) { if (window.CMAlmaJob) window.CMAlmaJob.clear(); return; }
    // drawn now, before the page first shows, so the move between pages is seamless (css/esg.css)
    const solo = document.querySelector('.cmj'); if (solo) solo.remove();
    const stub = job.files.map((m) => new File([''], m.name, { type: m.type }));
    const back = (m, k) => (window.CMFiles ? window.CMFiles.get(`~job:${k}`) : Promise.resolve(null)).then((r) => (r && r.blob ? new File([r.blob], r.name || m.name, { type: r.type || m.type }) : stub[k]));
    if (how) history.replaceState(null, '', location.pathname + location.search.replace(/[?&]alma=\w+/, '').replace(/^&/, '?'));
    open(job.spec, { files: stub, later: Promise.all(job.files.map(back)), resume: job, tucked: !how, resumed: true });
  };
  // a job running when this page loads: picked up straight away
  if (window.CMAlmaJob) { const job = window.CMAlmaJob.get(); if (job) resume(job, new URLSearchParams(location.search).get('alma')); }

  return { open, can, button, wire, toast, resume, NO_FILE };
})();
