/* ALMA's upload, from any table. Every table of the company's own documents can take a file: a row
   (a company document, one worker's or machine's copy), a cell of the matrix, a worker's or a
   machine's whole row, a whole section, or the drawer. The same dialog answers all of them:
     1 Files    — what can go here, and the files the user adds (as many as they like);
     2 Checking — ALMA reads each one: which document it is, whose name is on it, who issued it and
                  until when it is valid;
     3 Check    — what she found, file by file. A file that names someone else is filed for them
                  (and says so); one she can't place asks the user where it goes. Each can be moved
                  to another document or person, or left out, before anything is saved.
                  What differs from what is on file is shown on the cards themselves, to accept or
                  reject: a file replacing one on file shows what's on file now and what the new
                  file says (one that runs out before the current one is flagged); a worker list,
                  read against the crew, shows whose job changed on the
                  details step, next to anyone new. Nothing on file changes until accepted; a
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
  // the same for machines: an equipment register (Registo de equipamentos) lists them all, and
  // ALMA finds the ones not on the list yet by their serial number. Only for a company with machines.
  const eqHere = () => !!(M.saveMachines && M.PERSONA === 'miguel' && !M.ORG && (M.MACHINE || []).length);
  const EQREG_D = { code: 'EQ-REG', name: 'Equipment register', section: 'For all machines', area: 'equipment', kind: null, issued: '—', valid: '—', ref: '', cat: { titles: 'Registo de equipamentos; Equipment register; Lista de equipamentos; Mapa de equipamentos; Equipment list', fields: [{ name: 'Machines listed (name, serial number, year built)' }], renewal: 'Monthly', expiryRule: 'No expiry' } };
  const eqRegSlot = () => { const r = M.eqRegister(); return { key: 'EQ-REG', code: 'EQ-REG', i: null, d: Object.assign({}, EQREG_D, { status: r ? 'valid' : 'notuploaded', cat: Object.assign({}, EQREG_D.cat, { usuallyIssuedBy: plain(M.D.company || '') }) }), name: 'Equipment register', who: '', status: r ? 'valid' : 'notuploaded', exp: '—' }; };
  // the machines a register read in the demo names that aren't on the list yet (from a real site
  // register: type, brand, model, serial number, year built, the site's code), six at a time
  const EQ_JOIN = [['Plate compactor', '', 'PP 193', '93331', '2005', 'OBR 002'], ['Skid steer loader', 'Caterpillar', '226B', 'CAT0226BJMJH11071', '2007', 'OBR 302'], ['Backhoe loader', 'New Holland', 'LB95', '31053067', '2005', 'OBR 303'],
    ['Crawler excavator', 'Case', 'R220LC-9', 'HHKHZ610JE0000403', '2006', 'OBR 339'], ['Tower crane', 'Soima', 'SGT 5510TL', '6509/2007', '2007', ''], ['Mini excavator', 'Caterpillar', '303CCR', 'CAT0303CJBXT03191', '2007', 'OBR 309'],
    ['Roller', 'Caterpillar', 'CB224D', '8RZ00583', '2000', 'OBR 304'], ['Rammer', 'Ammann', 'ADS70D', '10695172', '2011', 'OBR 224'], ['Rebar cutter', 'Simpedil', 'C32', '32RI674', '2001', ''], ['Rebar bender', '', 'TP30/35', 'CP 440', '1994', '']];
  const N_EQ = 6;
  // the same for products and materials: a product list (Lista de materiais) names them all, and
  // ALMA finds the ones not on the list yet by their name. Only for a company with products.
  const prHere = () => !!(M.saveProducts && M.PERSONA === 'miguel' && !M.ORG && (M.PRODUCT || []).length);
  const PRREG_D = { code: 'PR-REG', name: 'Product list', section: 'For all products', area: 'products', kind: null, issued: '—', valid: '—', ref: '', cat: { titles: 'Lista de materiais; Lista de produtos; Mapa de materiais; Product list; Materials list; Bill of materials', fields: [{ name: 'Products listed (name, manufacturer, reference)' }], renewal: 'On change', expiryRule: 'No expiry' } };
  const prRegSlot = () => { const r = M.prRegister(); return { key: 'PR-REG', code: 'PR-REG', i: null, d: Object.assign({}, PRREG_D, { status: r ? 'valid' : 'notuploaded', cat: Object.assign({}, PRREG_D.cat, { usuallyIssuedBy: plain(M.D.company || '') }) }), name: 'Product list', who: '', status: r ? 'valid' : 'notuploaded', exp: '—' }; };
  // the products a list read in the demo names that aren't on the list yet (name, manufacturer,
  // reference, family, internal code), six at a time
  const PR_JOIN = [['Tile adhesive C2TE S1', 'Weber', 'webercol flex', 'Coverings', 'MAT-210'], ['Waterproofing slurry', 'Sika Portugal', 'SikaTop Seal-107', 'Other', 'MAT-214'], ['Welded steel mesh', 'Megasa', 'AQ38 6x6', 'Steel', 'MAT-219'],
    ['Plywood formwork panel', 'Finsa', 'Phenolic 18 mm', 'Other', 'MAT-223'], ['Ceramic floor tile', 'Revigrés', 'Barro 30x60', 'Coverings', 'MAT-227'], ['XPS insulation board', 'Iberfibran', 'Wallmate CW 40', 'Insulation', 'MAT-231'],
    ['Epoxy primer', 'CIN', 'Cinepoxi Primer', 'Coverings', 'MAT-236'], ['Aluminium window frame', 'Navarra', 'C70', 'Windows and doors', 'MAT-240'], ['Hydraulic lime mortar', 'Secil', 'Argamassa HD', 'Cement', 'MAT-244'], ['Nitrile work gloves', 'Ansell', 'HyFlex 11-800', 'Other', 'MAT-249']];
  const N_PR = 6;
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
    // Add worker (above the workers' matrix): their documents, as for the area, said as adding someone
    if (t === 'add') { const r = resolve(`area:${a}`); return r && Object.assign(r, { adding: true, title: 'Add workers', lead: 'Drop their citizen card, passport or a worker register. ALMA reads who they are, you choose who to add, and she fills in their details.' }); }
    if (t === 'area') {
      const pool = D.filter((x) => x.area === a && x.kind).flatMap(rosterSlots);
      if (a === 'workers' && crewHere()) { pool.push(...activeWorkers().flatMap((x) => [idSlot(x.i), ...extrasOf(x.i)])); pool.unshift(regSlot()); }
      if (a === 'equipment' && eqHere()) pool.unshift(eqRegSlot());
      if (a === 'products' && prHere()) pool.unshift(prRegSlot());
      return { pool, focus: null, title: `Upload documents for your ${M.NOUN[a] ? M.NOUN[a][1] : 'records'}`, lead: `For any of your ${M.NOUN[a] ? M.NOUN[a][1] : 'records'}. ALMA works out which document each file is, and whose name is on it.` };
    }
    const pool = D.flatMap((d) => (d.kind ? rosterSlots(d) : [docSlot(d)]));
    if (crewHere()) { pool.push(...activeWorkers().flatMap((x) => [idSlot(x.i), ...extrasOf(x.i)])); pool.push(regSlot()); }
    if (eqHere()) pool.push(eqRegSlot());
    if (prHere()) pool.push(prRegSlot());
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
    const n = M.crew.added.length + M.crew.left.length + Object.keys(M.crew.archived || {}).length;
    const taken = new Set((M.WORKERS || []).map((w) => fold(plain(w[0]))));
    const joins = JOIN.filter(([nm]) => !taken.has(fold(plain(nm)))).slice(0, N_JOIN);
    const lab = here.filter((x) => /laborer/i.test(x.p.role));
    // (no one is ever suggested to archive: that's the user's, from the worker's own page)
    const moved = lab[(1 + n) % Math.max(1, lab.length)];
    const out = noJoin ? [] : joins.map(([name, role]) => ({ type: 'join', name, role }));
    if (moved) out.push({ type: 'role', i: moved.i, name: moved.p.name, from: moved.p.role, to: 'Mason' });
    return out.map((c) => Object.assign(c, { decision: null }));
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
    const kinds = [...new Map(pool.concat(regSlot(), eqHere() ? [eqRegSlot()] : [], prHere() ? [prRegSlot()] : []).map((sl) => [sl.code, sl])).values()];
    // a machine, on the list or not: its name, and its serial number as what identifies it
    const mName = (m) => plain(`${m.type} · ${m.brand ? `${m.brand} ` : ''}${m.model}`);
    const knownM = (m, i) => get('m' + i, () => ({ i, kind: 'equipment', name: mName(m), type: 'Serial number', no: plain(m.serial), mach: { type: plain(m.type), brand: plain(m.brand), model: plain(m.model), serial: plain(m.serial), year: String(m.yearBuilt), ref: plain(m.ref) } }));
    const freshM = ([type, brand, model, serial, year, ref]) => get('e' + fold(serial), () => ({ i: null, kind: 'equipment', name: mName({ type, brand, model }), type: 'Serial number', no: serial, mach: { type, brand, model, serial, year, ref, owned: 'Owned' } }));
    const serials = new Set((M.MACHINE || []).map((m) => fold(plain(m.serial))));
    // a product, on the list or not: its name, and its manufacturer's reference as what identifies it
    const knownP = (x, i) => get('p' + i, () => ({ i, kind: 'products', name: plain(x.name), type: plain(x.maker || 'Reference'), no: plain(x.ref), prod: { name: plain(x.name), maker: plain(x.maker), ref: plain(x.ref), family: plain(x.family), code: plain(x.code) } }));
    const freshP = ([name, maker, ref, family, code]) => get('q' + fold(name), () => ({ i: null, kind: 'products', name, type: maker, no: ref, prod: { name, maker, ref, family, code } }));
    const prNames = new Set((M.PRODUCT || []).map((x) => fold(plain(x.name))));
    const get = (key, make) => byKey[key] || (byKey[key] = people[people.push(Object.assign(make(), { key, files: [], lists: [], decision: null })) - 1]);
    const known = (x) => get('w' + x.i, () => ({ i: x.i, name: plain(x.p.name), type: plain(x.p.id[0]), no: plain(x.p.id[1]), valid: x.p.id[2], role: plain(x.p.role) }));
    const fresh = (name, type, role, from) => { const q = get('n' + fold(name), () => { const [t, no, valid] = newId(name, type); return { i: null, name, type: t, no, valid, role: '' }; }); if (role && !q.role) { q.role = role; q.roleFrom = from || ''; } return q; };
    const taken = new Set((M.WORKERS || []).map((w) => fold(plain(w[0]))));
    const per = files.map((f, k) => {
      const fw = fileWords(f);
      const top = kinds.map((sl) => [sl, docScore(sl, fw)]).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1])[0];
      // an equipment register: every machine on it, and those not on the list yet
      if (top && top[0].code === 'EQ-REG') {
        const all = (M.MACHINE || []).map(knownM).concat(EQ_JOIN.filter((x) => !serials.has(fold(x[3]))).slice(0, N_EQ).map(freshM));
        all.forEach((q) => q.lists.push(k));
        return { list: true, eq: true, people: all };
      }
      // a product list: every product on it, and those not on the list yet
      if (top && top[0].code === 'PR-REG') {
        const all = (M.PRODUCT || []).map(knownP).concat(PR_JOIN.filter((x) => !prNames.has(fold(x[0]))).slice(0, N_PR).map(freshP));
        all.forEach((q) => q.lists.push(k));
        return { list: true, pr: true, people: all };
      }
      // a list: everyone on it
      if (top && isList(top[0].d)) {
        // (but not who the list shows has left: that's a change to approve, after the review)
        const all = here.map(known).concat(JOIN.filter(([nm]) => !taken.has(fold(plain(nm)))).slice(0, N_JOIN).map(([nm, role]) => fresh(plain(nm), 'Citizen card', role, f.name)));
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
    // the same first and last name, but not the same name (a middle name on one file only): she
    // can't tell one person from two, and asks
    const fr = people.filter((q) => q.i == null && !q.kind && !q.lists.length), unsure = [];
    fr.forEach((a, x) => fr.slice(x + 1).forEach((b) => { const wa = fold(a.name).split(/\s+/), wb = fold(b.name).split(/\s+/); if (wa[0] === wb[0] && wa[wa.length - 1] === wb[wb.length - 1]) unsure.push({ a, b, decision: null }); }));
    return { people, per, unsure };
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
.cmu-body { flex: 1; min-height: 0; overflow: auto; padding: 0 1.5rem 1rem; display: grid; grid-template-columns: minmax(0, 1fr); /* never wider than the panel: a long file name is cut, not the panel stretched */ grid-auto-rows: max-content; /* each part its full height (a long table isn't squeezed to fit): the body scrolls */ gap: 1rem; align-content: start; }
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
.cmu-r { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0.75rem; padding: 1rem; border: 1px solid var(--color-line); border-radius: 0.75rem; }
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
.cmu-diff { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.cmu-diff th { padding: 0.375rem 0.5rem; text-align: left; font-weight: 500; color: var(--color-ink-subtle); border-bottom: 1px solid var(--color-line); }
.cmu-diff td { padding: 0.5rem; border-bottom: 1px solid var(--color-line); color: var(--color-ink); vertical-align: top; }
.cmu-diff td:nth-child(2) { color: var(--color-ink-subtle); text-decoration: line-through; text-decoration-color: rgba(0, 0, 0, .25); }
.cmu-diff tr.is-flag td { background: var(--color-caution-subtle, #fbf3dc); }
.cmu-diff tr.is-flag td:nth-child(3) { font-weight: 600; }
.cmu-diff .cmu-flag td { padding-top: 0; text-decoration: none; color: var(--color-ink); font-size: 0.75rem; }
.cmu-more { justify-self: start; font-size: 0.8125rem; }
.cmu-who { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.cmu-who small { margin-left: auto; font-size: 0.8125rem; font-weight: 400; color: var(--color-ink-subtle); }
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
.cmu-bar-end { margin-top: 0.25rem; }
.cmu-manual .cmu-fields { border-top: 0; padding-top: 0; } /* a form on its own: no header above to set it off from */
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
/* one worker at a time: their details, then each of their documents, one open at once */
.cmu-wk-top { display: flex; align-items: center; gap: 0.5rem; }
.cmu-wk-n { margin-left: auto; display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.875rem; color: var(--color-ink-subtle); white-space: nowrap; }
.cmu-wk-n button { display: grid; place-items: center; width: 2rem; height: 2rem; border: 0; border-radius: 0.375rem; background: none; color: var(--color-ink); cursor: pointer; }
.cmu-wk-n button:hover { background: var(--color-light-beige); }
.cmu-wk-n button:disabled { opacity: .35; cursor: default; background: none; }
.cmu-wk-n svg { width: 1rem; height: 1rem; }
.cmu-wk-h { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0; border: 0; background: none; font: inherit; text-align: left; color: inherit; cursor: pointer; }
.cmu-wk-h .cmu-r-t b { display: block; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); overflow-wrap: anywhere; }
.cmu-wk-h .cmu-r-t small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-wk-p .cmu-wk-h .cmu-r-t b { font-size: 1.125rem; }
.cmu-wk-p { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; }
.cmu-wk-p .cmu-pic { width: 2.5rem; height: 2.5rem; font-size: 0.875rem; }
.cmu-wk-nm { flex: 1; min-width: 0; padding: 0.375rem 0.5rem; border: 1px solid transparent; border-radius: 0.375rem; background: none; font: inherit; font-size: 1.125rem; font-weight: 600; color: var(--color-ink); }
.cmu-wk-nm:hover { border-color: var(--color-line); }
.cmu-wk-nm:focus { outline: none; border-color: var(--color-graphite); background: var(--color-surface); }
.cmu-wk-h .cmu-wk-b { flex: none; }
.cmu-wk-h .cmu-ic, .cmu-wk-d .cmu-r-h .cmu-ic { flex: none; display: grid; place-items: center; width: 1.75rem; height: 1.75rem; border-radius: 0.375rem; background: var(--color-light-beige); color: var(--color-ink-subtle); }
.cmu-wk-h .cmu-ic svg, .cmu-wk-d .cmu-r-h .cmu-ic svg { width: 1rem; height: 1rem; }
.cmu-chev { flex: none; width: 1rem; height: 1rem; color: var(--color-ink-subtle); transition: transform .15s; }
.cmu-r.is-open > .cmu-wk-h .cmu-chev { transform: rotate(180deg); }
.cmu-wk-d { padding: 0.75rem 1rem; }
.cmu-r.is-open { border-color: var(--color-graphite); }
.cmu-r.is-open.is-ask { border-color: var(--color-caution, #d9a21b); }
.cmu-wk-sel { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.cmu-tg { display: block; margin-top: 0.375rem; }
.cmu-tg:empty { display: none; }
.cmu-was { display: block; margin-top: 0.25rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.cmu-same { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.cmu-same > div { display: grid; gap: 0.125rem; padding: 0.75rem; border-radius: 0.5rem; background: var(--color-off-white); }
.cmu-same b { font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); }
.cmu-same small { font-size: 0.8125rem; color: var(--color-ink-subtle); overflow-wrap: anywhere; }
.cmu-wt td.cmu-wn { white-space: nowrap; font-size: 0.8125rem; color: var(--color-ink-subtle); }
@media (max-width: 560px) { .cmu-wk-sel, .cmu-same { grid-template-columns: minmax(0, 1fr); } }
.cmu-dw { z-index: 1; pointer-events: none; } /* under the upload drawer, which stays usable beside it: it slides out from behind it */
.cmu-dw .docd-scrim { display: none; }
.cmu-dw .docd-panel { pointer-events: auto; right: 40rem; width: min(40rem, calc(100vw - 45rem)); box-shadow: -24px 0 48px -24px rgba(52, 52, 52, .35); }
@media (max-width: 75rem) { .cmu-dw { z-index: 3; } .cmu-dw .docd-panel { right: 0; width: min(40rem, 100vw); } } /* no room beside it: over it */`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const XI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>';
  const FILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>';
  const TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ADDP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"/></svg>';
  const CROSS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17"/></svg>';
  const SPIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9"/></svg>';
  const OK = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clip-rule="evenodd"/></svg>';
  const FOLD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 17l5-5-5-5M13 17l5-5-5-5"/></svg>';
  const PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  const CHEV = '<svg class="cmu-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const size = (b) => (!b ? '' : b < 1e6 ? Math.max(1, Math.round(b / 1e3)) + ' KB' : (b / 1e6).toFixed(1) + ' MB');

  // the toast, shared with the pages that show ALMA reading on their own (js/alma-job.js)
  const toast = (html, act) => { if (window.CMAlmaJob) window.CMAlmaJob.toast(html, act); };

  const open = (spec, opts = {}) => {
    const R0 = resolve(spec); if (!R0 || !R0.pool.length) return false;
    let { pool } = R0; const { focus } = R0;
    // who ALMA found on the files (identify), once read; the new people the user adds go on the list
    // after anything already added, in the order they're shown
    const crewCtx = (crewHere() && pool.some((sl) => sl.d.area === 'workers')) || (eqHere() && pool.some((sl) => sl.d.area === 'equipment')) || (prHere() && pool.some((sl) => sl.d.area === 'products'));
    let found = null, sorted = 0;
    // a worker register isn't reviewed as a document: who's on it was the step before (who to add,
    // their details), so it's saved with the rest, and no card asks to accept it
    const quiet = (r) => !!(r.slot && (r.slot.code === 'WK-REG' || r.slot.code === 'EQ-REG' || r.slot.code === 'PR-REG'));
    const shown = () => results.filter((r) => r.on && !quiet(r) && !r.wk);
    // workers' documents: who is on each file comes first, then each worker is checked on their own
    const wCtx = crewHere() && pool.some((sl) => sl.d.area === 'workers');
    // on to saving: what differs from what's on file was accepted or rejected on its card
    const toSave = () => { closePeek(); save(); };
    // the review, after filing; nothing left to review (only a register): straight on
    const toReview = () => { results.forEach((r) => { if (quiet(r)) r.ok = true; }); if (!shown().length && results.some((r) => r.on && r.slot)) { toSave(); return; } step = 3; paint(); el.querySelector('select, [data-save]')?.focus({ preventScroll: true }); };
    const fs = focus && pool.find((s) => s.key === focus);
    let files = [...(opts.files || [])], step = 1, results = [], reading = 0;
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

    // the drawer's header: who's speaking, the step's title, and what it asks
    const head = (eyebrow, title, lead) => { el.querySelector('.cmu-t .eyebrow').innerHTML = eyebrow; $('cmu-h').innerHTML = esc(title); el.querySelector('.cmu-t > p:last-child').innerHTML = lead; };
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
      if (!s || s.i == null || !s.who || !s.d || !['workers', 'equipment', 'products'].includes(s.d.area)) return null;
      const l = ((window.CM_WORKER_DOCS || {})[s.code] || {}).fields || (s.d.cat && s.d.cat.fields) || [];
      let iss = false, val = false;
      return l.length ? l.map((fl, j) => {
        const n = fl.name.toLowerCase();
        const key = /expiry|end date|period end/.test(n) && !val ? (val = true, 'valid') : /issue date|start date|period start|delivery date/.test(n) && !iss ? (iss = true, 'issued') : `w${j}`;
        // "Issue date (inspection date)" reads as "Inspection date"; "Start date (issue date)" as "Start date"
        const nm = fl.name.replace(/^(issue|expiry) date \((calculated)\)$/i, '$1 date').replace(/^(?:issue|expiry) date \((.+)\)$/i, (m0, x) => x[0].toUpperCase() + x.slice(1)).replace(/\s*\((?:issue|expiry) date\)$/i, '');
        return [key, nm];
      }) : null;
    };
    const personOf = (s) => (s.fresh ? Object.assign({ name: s.fresh.name, role: s.fresh.role }, s.fresh.prof || {}, { nationalityName: (s.fresh.prof || {}).nationality }) : M.PERSON[s.i] || {});
    const wVal = (r, key, label) => {
      const s = r.slot, v = (r.wv || {})[key]; if (v != null) return v;
      const n = label.toLowerCase(), h = hash(s.key + label);
      // a product's: what its profile says, then what such a document reads
      if (s.d.area === 'products') {
        const x = (M.PRODUCT || [])[s.i] || {};
        if (/identification code|reference|model/.test(n)) return plain(x.ref || '');
        if (/^products? covered|^product|commercial name|article group/.test(n)) return plain(x.name || '');
        if (/signatory/.test(n)) return 'Head of product compliance';
        if (/manufacturer|^operator$|installation/.test(n)) return plain(/installation/.test(n) ? `${x.maker || ''} plant, Portugal` : x.maker || '');
        if (/main characteristics/.test(n)) return ({ Cement: 'Compressive strength class 42.5R', Concrete: 'Strength class C30/37, exposure XC2', Steel: 'Yield strength 500 MPa, ductility class SD', Insulation: 'Reaction to fire A1, λ 0.036 W/mK' })[x.family] || 'As listed on the sheet';
        if (/^version/.test(n)) return `${1 + (h % 4)}.0`;
        if (/hazard classification/.test(n)) return x.hazardous ? 'Skin Irrit. 2; Eye Dam. 1' : 'Not classified';
        if (/language/.test(n)) return 'Portuguese';
        if (/supplied or used/.test(n)) return 'Used';
        if (/intended use/.test(n)) return 'Construction works';
        if (/avcp/.test(n)) return x.notifiedBody ? 'System 1+' : 'System 4';
        if (/notified body number/.test(n)) return '1328';
        if (/declared performances/.test(n)) return 'As listed on the declaration';
        if (/eu rules/.test(n)) return x.ppe ? 'Regulation (EU) 2016/425 (PPE)' : 'Low Voltage Directive 2014/35/EU; RoHS 2011/65/EU';
        if (/declaration type/.test(n)) return 'REACH';
        if (/svhc/.test(n)) return 'No';
        if (/\(yes\/no\)/.test(n)) return 'Yes';
        if (/ppe category/.test(n)) return 'Category II';
        if (/standard/.test(n)) return plain(x.standard || 'EN 15804');
        if (/certification mark/.test(n)) return 'CERTIF product mark';
        if (/commodity/.test(n)) return 'Wood';
        if (/country/.test(n)) return 'Portugal';
        if (/cn code/.test(n)) return x.family === 'Cement' ? '2523 29 00' : '7214 20 00';
        if (/production route/.test(n)) return x.family === 'Cement' ? 'Dry process kiln' : 'Electric arc furnace';
        if (/direct embedded/.test(n)) return x.family === 'Cement' ? '0.69' : '0.32';
        if (/indirect embedded/.test(n)) return '0.11';
        if (/carbon price/.test(n)) return 'EU ETS';
        if (/reporting period/.test(n)) return '2025';
        if (/batch/.test(n)) return `L${1000 + (h % 9000)}`;
        if (/result/.test(n)) return 'Compliant';
        if (/body|laborator|operator|authority|institute|agency|verifier/.test(n)) return issuerFor(s);
        if (/number/.test(n)) return refOf(s, r);
        return '';
      }
      // a machine's: what its profile says, then what such a document reads
      if (s.d.area === 'equipment') {
        const m = (M.MACHINE || [])[s.i] || {};
        if (/^equipment$|equipment covered|system name/.test(n)) return plain(`${m.type || ''} · ${m.brand || ''} ${m.model || ''}`.trim());
        if (/manufacturer|make and model/.test(n)) return plain(/make/.test(n) ? `${m.brand || ''} ${m.model || ''}` : m.brand || '');
        if (/machine type/.test(n)) return plain(m.type || '');
        if (/^model$/.test(n)) return plain(m.model || '');
        if (/serial number|vin|chassis/.test(n)) return plain(m.serial || '');
        if (/year built/.test(n)) return String(m.yearBuilt || '');
        if (/plate/.test(n)) return plain(m.plate || '');
        if (/owner/.test(n)) return plain(M.D.company || '');
        if (/eu rules/.test(n)) return 'Machinery Directive 2006/42/EC';
        if (/signatory/.test(n)) return 'Head of product compliance';
        if (/inspector|examiner|inspection body|inspection centre|assessing entity|laboratory|tester|technician/.test(n)) return issuerFor(s);
        if (/result/.test(n)) return /pass/.test(n) ? 'Pass' : 'Compliant';
        if (/defects/.test(n)) return 'None';
        if (/work done/.test(n)) return ['Oil and filters changed', 'Hydraulic hoses checked', 'Brakes and tracks serviced'][h % 3];
        if (/language/.test(n)) return 'Portuguese';
        if (/capacity|load limits|safe working load/.test(n)) return ['2,000 kg', '6 t at 60 m', '227 kg platform'][h % 3];
        if (/power/.test(n)) return ['121 kW', '45 kW', '9 kW'][h % 3];
        if (/maximum allowable pressure/.test(n)) return '12 bar';
        if (/accreditation/.test(n)) return 'ISO/IEC 17025 · IPAC L0123';
        if (/insurer/.test(n)) return 'Fidelidade';
        if (/insured value/.test(n)) return `€${(20 + h % 180) * 1000}`;
        if (/vehicle category/.test(n)) return 'N3 · goods vehicle';
        if (/period/.test(n)) return '12 months';
        if (/standard/.test(n)) return 'EN 12810';
        if (/number/.test(n)) return refOf(s, r);
        return '';
      }
      const p = personOf(s);
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
      if (typeof peek === 'string') { if (peek.startsWith('r:')) paintRPeek(+peek.slice(2)); else paintWPeek(); return; }
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
    // someone new's details, as the setup's document drawer (js/guided-upload.js): the file with each
    // detail she read highlighted, then each detail with her confidence and, under it, its citation
    // what she read, each detail with her confidence and, under it, its citation (a detail typed over
    // is the user's: corrected)
    const citeTable = (rows, fname) => {
      const part = (l) => (/date|until|since|birth/i.test(l) ? 'Dates' : /number|nif|niss|document|serial|reference|code/i.test(l) ? 'Identification' : 'Particulars');
      return `<section class="cdd-card"><h4 class="eyebrow">What ALMA read</h4><table class="cd-fields"><tbody>${rows.map((x, i) => !x.val
        ? `<tr><td><span class="n">${esc(x.l)}</span></td><td><span class="co-subtle">Not on the file</span></td><td></td></tr>`
        : `<tr class="${x.flag ? 'is-flag' : ''}"><td><span class="n">${esc(x.l)}</span></td><td>${x.flag ? `<span class="cdd-unread">Couldn&rsquo;t read it cleanly</span><span class="cdd-why">I&rsquo;ve put ${esc(x.val)}. Check it against the file.</span>` : esc(x.val)}`
          + `<button type="button" class="esgq-src-btn" data-cite="${i}" aria-expanded="false" aria-controls="cmu-cite-${i}">View citation</button></td><td>${x.ed ? corrB() : x.p == null ? '' : tagOf(x.p)}</td></tr>`
          + `<tr class="cdd-cite-row" id="cmu-cite-${i}" hidden><td colspan="3"><figure class="esgq-src cdd-src"><figcaption><b>${esc(fname)}</b><span>Page 1 &middot; ${part(x.l)}</span></figcaption><blockquote>&ldquo;${esc(x.l)}: <mark${x.flag ? ' class="is-flag"' : ''}>${x.flag ? '[cut off at the edge of the scan]' : esc(x.val)}</mark>&rdquo;</blockquote><button type="button" class="esgq-src-open" data-show="${i}">Show on the page</button></figure></td></tr>`).join('')}</tbody></table></section>`;
    };
    // one of the documents of the worker being checked: the file, each detail highlighted, and what she read
    const paintRPeek = (k) => {
      const r = results[k]; if (!r || !r.slot) { closePeek(); return; }
      const d = (id) => dw.querySelector('#' + id), s = r.slot, fc = dConfs(r);
      d('cmu-dw-t').textContent = plain(s.name) + (r.owner ? ` \u00b7 ${profOf(r.owner).name || r.owner.name}` : '');
      d('cmu-dw-sub').innerHTML = `${esc(r.file.name)}${r.file.size ? ' &middot; ' + size(r.file.size) : ''}`;
      d('cmu-dw-conf').innerHTML = dBadge(r);
      const rows = dFields(r).map(([f, l]) => { const ed = !!(r.fe && r.fe.has(f)); return { l, val: dVal(r, f, l), p: fc[f], ed, flag: !ed && !r.checked && fc[f] != null && fc[f] < 75 }; });
      const rec = { name: r.file.name, type: r.file.type, size: r.file.size, blob: r.file };
      const spec = { title: plain(s.name), file: r.file.name, issuer: '', holder: plain(M.D.company || ''), fields: rows.map((x, i) => ({ name: x.l, value: x.val, flag: x.flag, i })) };
      d('cmu-dw-body').innerHTML = (window.CMFiles && window.CMFiles.preview ? window.CMFiles.preview(rec, spec) : '') + citeTable(rows, r.file.name);
      d('cmu-dw-foot').textContent = ''; d('cmu-dw-acts').innerHTML = '';
    };
    const paintWPeek = () => {
      const q = found && found.people.find((x) => x.key === peek); if (!q) { closePeek(); return; }
      const d = (id) => dw.querySelector('#' + id), v = profOf(q), c = confsOf(q), src = srcOf(q), f0 = files[step === 'worker' && q.lists.length ? q.lists[0] : src[0]];
      const fromList = q.lists.length > 0 && (step === 'worker' || !q.files.length), title = fromList ? (isM(q) ? 'Equipment register' : isP(q) ? 'Product list' : 'Worker register') : isM(q) || isP(q) ? 'Document' : 'Identity document';
      d('cmu-dw-t').textContent = titleOf(q);
      d('cmu-dw-sub').innerHTML = src.map((j) => esc(files[j].name)).join(', ');
      d('cmu-dw-conf').innerHTML = confTagOf(q);
      const rows = fieldsFor(q).map(([f, l]) => { const ed = !!(q.fe && q.fe.has(f)); return { f, l, val: v[f] || '', ed, p: q.edited ? 98 : c[f], flag: !q.edited && !ed && !q.checked && c[f] != null && c[f] < 75 }; });
      const read = citeTable(rows, f0 ? f0.name : '');
      const rec = f0 ? { name: f0.name, type: f0.type, size: f0.size, blob: f0 } : null;
      const spec = { title, file: f0 ? f0.name : '', issuer: '', holder: plain(M.D.company || ''), fields: rows.map((x, i) => ({ name: x.l, value: x.val, flag: x.flag, i })) };
      d('cmu-dw-body').innerHTML = (window.CMFiles && window.CMFiles.preview ? window.CMFiles.preview(rec, spec) : '') + read;
      d('cmu-dw-foot').textContent = step === 'worker' ? '' : q.out ? 'Left out' : q.ok ? 'Accepted' : 'Not accepted yet';
      d('cmu-dw-acts').innerHTML = q.out || step === 'worker' ? '' : `<button type="button" class="link-btn" data-dwedit>Make changes</button>${q.ok ? `<span class="cmu-acc is-ok">${TICK}Accepted</span>` : `<button class="cmu-acc" type="button" data-dwaccept>${TICK}Accept</button>`}`;
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
      // a citation, opened in place under its detail; Show on the page, the highlighted page scrolled to it
      const cb = e.target.closest('[data-cite]');
      if (cb) { const row = dw.querySelector('#cmu-cite-' + cb.dataset.cite), open = row.hidden; row.hidden = !open; cb.setAttribute('aria-expanded', String(open)); cb.textContent = open ? 'Hide citation' : 'View citation'; return; }
      const sh = e.target.closest('[data-show]');
      if (sh) { if (!(window.CMFiles && window.CMFiles.show(dw, +sh.dataset.show))) { const fe = dw.querySelector('[data-cmf]'); if (fe) fe.scrollIntoView({ behavior: 'smooth', block: 'start' }); } return; }
      // someone new (or a machine, a product): Make changes on their card, Accept
      if (typeof peek === 'string') {
        const q = found && found.people.find((x) => x.key === peek); if (!q) return;
        if (e.target.closest('[data-dwedit]')) { closePeek(); found.people.forEach((x) => { x.editing = x === q; }); paint(); const i = el.querySelector('.cmu-r.is-editing input'); if (i) { i.scrollIntoView({ block: 'center' }); i.focus(); } return; }
        if (e.target.closest('[data-dwaccept]')) { q.ok = true; paint(); closePeek(); }
        return;
      }
      if (e.target.closest('[data-dwedit]')) { const k = peek; closePeek(); edit(k); return; }
      if (e.target.closest('[data-dwaccept]')) { results[peek].ok = true; paint(); closePeek(); } // accepted: back to the review, where its card shows it
    });

    const paint = () => {
      if (tucked) rail();
      const body = $('cmu-body'), foot = $('cmu-foot');
      el.querySelector('.cmu-alma').classList.toggle('is-reading', step === 2 || step === 'wread' || step === 'sort');
      if (step === 'who') { whoStep(); return; }
      if (step === 'manual') { manualStep(); return; }
      if (step === 'worker') { workerStep(); return; }
      if (step === 'wread' || step === 'details') { detailsStep(); return; }
      head('ALMA', R0.title, R0.lead);
      if (step === 'sort') {
        body.innerHTML = `<div class="cmu-list"><h3>Filing each one for its worker</h3>${results.map((r, k) => { const sl = r.slot, ok = k < sorted, now = k === sorted; return `<div class="cmu-f ${ok ? 'is-done' : now ? 'is-reading' : ''}"><span class="cmu-ic">${ok ? OK : now ? SPIN : FILE}</span><span class="cmu-n">${esc(r.file.name)}</span><small>${ok ? (sl ? esc(sl.who ? `${sl.who} · ${sl.name}` : sl.name) : 'Needs a place') : now ? 'Reading its fields&hellip;' : 'Waiting'}</small></div>`; }).join('')}</div>`;
        foot.innerHTML = '<span class="cmu-foot-l">Putting each document in its worker&rsquo;s file, under its type.</span>';
        return;
      }
      if (step === 1) {
        const many = pool.length > 1 && !fs && !R0.adding;
        const need = pool.filter((s) => M.RANK[s.status] > 0).length;
        const now = fs ? `<div class="cmu-now"><span>Now on file</span><b>${stat(fs)} ${fs.exp && fs.exp !== '—' && !NO_FILE.includes(fs.status) ? `<span>${fs.status === 'expired' ? 'on' : 'until'} ${esc(fs.exp)}</span>` : ''}</b></div>`
          : many ? `<div class="cmu-now"><span>${pool.length} document${pool.length === 1 ? '' : 's'} can go here</span><b>${need ? `${need} need${need === 1 ? 's' : ''} a file` : 'All in order'}</b></div>` : '';
        const list = files.length ? `<div class="cmu-list"><h3>Your files &middot; ${files.length}</h3>${files.map((f, k) => `<div class="cmu-f"><span class="cmu-ic">${FILE}</span><span class="cmu-n">${esc(f.name)}</span><small>${size(f.size)}</small><button type="button" class="cmu-rm" data-rm="${k}" aria-label="Remove ${esc(f.name)}">${XI}</button></div>`).join('')}</div>` : '';
        body.innerHTML = now + `<div class="cmu-drop" id="cmu-drop" role="button" tabindex="0" aria-label="Add files">${UP}<b>${files.length ? 'Add more files' : `Drop ${fs ? 'the file' : 'files'} here`}</b><span>or <u>browse your device</u> &middot; PDF, scan or photo</span></div>`
          + (R0.adding ? `<div class="cmu-lib"><span>or</span><button type="button" class="btn btn-quiet btn-sm cm-lib-b" data-manual>${ADDP}<span>Add a worker manually</span></button></div>`
            : window.CMLibrary && window.CMLibrary.has() ? `<div class="cmu-lib"><span>or</span>${window.CMLibrary.button('data-lib')}</div>` : '') + list;
        foot.innerHTML = `<button type="button" class="link-btn" data-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-read${files.length ? '' : ' disabled'}>${files.length > 1 ? `Check ${files.length} files with ALMA` : 'Check it with ALMA'}</button>`;
      } else if (step === 2) {
        body.innerHTML = `<div class="cmu-list"><h3>ALMA is reading</h3>${files.map((f, k) => `<div class="cmu-f ${k < reading ? 'is-done' : k === reading ? 'is-reading' : ''}"><span class="cmu-ic">${k < reading ? OK : k === reading ? SPIN : FILE}</span><span class="cmu-n">${esc(f.name)}</span><small>${k < reading ? 'Checked' : k === reading ? (wCtx ? 'Reading the names and ID numbers on it&hellip;' : 'Reading the name, dates and issuer&hellip;') : 'Waiting'}</small></div>`).join('')}</div>`;
        body.insertAdjacentHTML('afterbegin', `<div class="cmu-hide"><span>${files.length > 1 ? 'This can take a few minutes.' : 'This can take a minute.'} Hide the panel and keep working: I&rsquo;ll let you know when I&rsquo;m done.</span><button type="button" class="btn btn-quiet btn-sm" data-tuck>Hide panel</button></div>`);
        foot.innerHTML = '<span class="cmu-foot-l">Checking each one with the body that issued it.</span>';
      } else {
        // as the setup's review (js/guided-upload.js): how many are accepted, Accept all; expired first
        const on = shown(), ready = on.filter((r) => r.slot);
        const grouped = !!(found && found.asked), gk = (r) => (!r.slot ? '\uffff' : r.slot.who || '');
        const order = results.map((r, k) => k).filter((k) => !quiet(results[k]) && !results[k].wk).sort((a, b) => (grouped ? gk(results[a]).localeCompare(gk(results[b])) : 0) || (lapsedR(results[b]) && results[b].on) - (lapsedR(results[a]) && results[a].on) || a - b);
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
          // replacing one on file: what's on file now, what the new file says; nothing changes until accepted
          const df = s ? fileDiff(r) : null;
          const diffBlock = !df || r.editing ? '' : `<p class="cmu-why">It replaces the ${esc(s.name)} on file. Accept to replace it, or reject to keep the one you have.</p><table class="cmu-diff"><thead><tr><th>What</th><th>On file now</th><th>New file</th></tr></thead><tbody>${df.map((f) => `<tr${f.flag ? ' class="is-flag"' : ''}><td>${f.label}</td><td>${f.from}</td><td>${f.to}</td></tr>${f.flag ? `<tr class="is-flag cmu-flag"><td colspan="3">${f.flag}</td></tr>` : ''}`).join('')}</tbody></table>`;
          return `<section class="cmu-r${ask ? ' is-ask' : ''}${r.editing ? ' is-editing' : ''}${ex ? ' is-expired' : ''}${r.ok ? ' is-ok' : ''}" data-card="${k}" aria-label="${esc(r.file.name)}">
            <div class="cmu-r-h"><div class="cmu-r-t"><h3><button type="button" class="cmu-peek" data-peek="${k}">${esc(s ? label(s) : r.file.name)}</button></h3><p>${s ? esc(r.file.name) : 'Not placed yet'}</p></div>${badge}</div>
            ${r.note ? `<p class="cmu-note">${r.note}</p>` : ''}
            <label class="cmu-to"><span>${oneDoc && s && s.who ? 'Filed for' : 'Filed as'}</span><select data-to="${k}"${r.editing ? ' disabled' : ''}>${options(s ? s.key : r.uncat ? '__u' : '')}</select></label>
            ${s ? `<dl class="cmu-fields">${fieldsOf()}</dl>` : ''}${diffBlock}${expBlock}
            <footer class="cmu-r-acts"><span>${left}</span><span>${right}</span></footer>
          </section>`;
        })()).join('') + (ready.length > 1 && ready.some((r) => !r.ok && !lapsedR(r)) && all ? `<div class="cmu-bar cmu-bar-end"><span>${acc} of ${ready.length} accepted</span>${all}</div>` : ''); // and again at the end, as the setup's
        // on: what wasn't accepted goes in as she read it (as the setup's Continue); an expired one, a
        // file without a place, or a card being edited waits for the user
        const unc = on.filter((r) => !r.slot && r.uncat).length, left = on.length - ready.length - unc, rpl = ready.filter((r) => !r.ok && fileDiff(r)).length, wait = left || exN || editing || rpl;
        const why = editing ? 'Save or cancel your changes first' : left ? `${left} still need${left === 1 ? 's' : ''} a place` : exN ? `${exN} expired: give ${exN === 1 ? 'it' : 'each'} a new date` : rpl ? `${rpl} replace${rpl === 1 ? 's' : ''} what&rsquo;s on file: accept or reject ${rpl === 1 ? 'it' : 'them'}` : '';
        foot.innerHTML = `<button type="button" class="link-btn" data-back>Add or change files</button><span class="cmu-foot-l">${why}</span><button type="button" class="btn btn-primary btn-sm" data-save${(ready.length || unc) && !wait ? '' : ' disabled'}>${ready.length + unc === 1 ? 'Save it' : `Save ${ready.length + unc} files`}</button>`;
      }
    };
    const add = (list) => { const l = [...(list || [])]; if (!l.length) return; files = files.concat(l); step = 1; paint(); };
    // folded to its rail: the page in full view while she reads; the rail (or the toast) opens it again
    let tucked = false;
    // what the rail says, at each stage: reading, who to add, their details, filing, the review
    const rail = () => {
      const n = results.filter((x) => x.on).length || files.length, J = window.CMAlmaJob; if (!J) return;
      const P = found ? found.people.filter((q) => q.i == null && q.decision === 'ok') : [], nw = found ? found.people.filter((q) => q.i == null) : [];
      const st = step === 2 ? { reading: true, at: Math.min(reading + 1, files.length), total: files.length }
        : step === 'who' ? (found && found.w ? { done: true, n: pickable().length, label: `Choose who to check · ${pickable().length} worker${pickable().length === 1 ? '' : 's'}` } : { done: true, n: nw.length, label: `Choose who to add · ${nounsOf(nw)}` })
        : step === 'worker' ? { done: true, n: batch.length, label: `Check each worker · ${wi + 1} of ${batch.length}` }
        : step === 'wread' ? { reading: true, at: Math.min(wread + 1, P.length), total: P.length, label: `ALMA is reading their details · ${Math.min(wread + 1, P.length)} of ${P.length}` }
        : step === 'details' ? { done: true, n: P.length + roleChanges().length, label: 'Ready to check · their details' }
        : step === 'manual' ? { done: false, n: 0, label: 'Add a worker manually' }
        : step === 'sort' ? { reading: true, at: Math.min(sorted + 1, results.length), total: results.length, label: 'ALMA is filing your documents' }
        : { done: step === 3, n };
      J.paint(el.querySelector('.cmu-rail'), st);
    };
    const tuck = (on) => {
      tucked = on; if (on) closePeek();
      el.classList.toggle('is-tucked', on); el.querySelector('.cmu-rail').hidden = !on;
      panel.setAttribute('aria-modal', String(!on));
      [el.querySelector('.cmu-head'), $('cmu-body'), $('cmu-foot')].forEach((x) => { x.inert = on; });
      if (on) { rail(); el.querySelector('.cmu-rail .cmu-fold').focus({ preventScroll: true }); }
      else { (el.querySelector('.cmu-body select, .cmu-body input, .cmu-body button, .cmu-foot .btn-primary') || panel).focus({ preventScroll: true }); }
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
          // workers only (no machines or products): every worker found, new or on the list, is for
          // the user to pick, then checked one at a time
          if (found) { found.w = found.people.some((q) => !isR(q)); found.people.forEach((q) => { q.decision = q.i != null && !found.w ? 'ok' : 'no'; }); }
          const ask = !!(found && (found.w || found.people.some((q) => q.i == null)));
          if (found) { found.asked = ask; found.changes = found.per.some((x) => x && x.list && !x.eq && !x.pr) ? crewDiff(true) : []; }
          // nobody new, but the list changes someone on it: straight to their cards
          if (ask) { step = 'who'; wq = ''; paint(); } else if (found && roleChanges().length) { step = 'details'; paint(); } else fileThem(true);
          if (tucked) {
            rail();
            const n = results.filter((x) => x.on).length;
            if (!job.told) toast(ask && found.w ? `ALMA found ${pickable().length === 1 ? 'one worker' : `${pickable().length} workers`} on your files. Choose whose documents to check.` : ask ? `ALMA found ${nounsOf(found.people.filter((q) => q.i == null))}. Choose which to add, and she files the documents.` : J ? J.doneMsg(n) : 'ALMA has read your files.', ['Review', () => tuck(false)]);
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
    // a machine's details: what its profile has, as the register gives them
    const PFM = [['type', 'Equipment type'], ['brand', 'Brand'], ['model', 'Model'], ['serial', 'Serial number'], ['year', 'Year built'], ['ref', 'Internal code'], ['owned', 'Owned or rented']];
    // a product's: what its profile has, as the list gives them
    const PFP = [['name', 'Product'], ['maker', 'Manufacturer'], ['ref', 'Reference / model'], ['family', 'Product family'], ['code', 'Internal code']];
    const isM = (q) => q.kind === 'equipment', isP = (q) => q.kind === 'products', isR = (q) => isM(q) || isP(q);
    const fieldsFor = (q) => (isM(q) ? PFM : isP(q) ? PFP : PF);
    const titleOf = (q) => { const v = q.prof || q.mach || q.prod || q; return isM(q) ? plain(`${v.type} · ${v.brand ? `${v.brand} ` : ''}${v.model}`) : isP(q) ? v.name : (q.prof ? q.prof.name : q.name); };
    // what they are, said once: new workers, new machines, or both
    const nounsOf = (list) => { const m = list.filter(isM).length, pr = list.filter(isP).length, w = list.length - m - pr; return [w && `${w === 1 ? 'one new worker' : `${w} new workers`}`, m && `${m === 1 ? 'one new machine' : `${m} new machines`}`, pr && `${pr === 1 ? 'one new product' : `${pr} new products`}`].filter(Boolean).join(' and '); };
    const listOf = (list) => (list.every(isM) ? 'equipment list' : list.every(isP) ? 'product list' : list.some(isR) ? 'lists' : 'worker list');
    const STREET = ['Rua de Santa Catarina', 'Avenida da Rep\u00fablica', 'Rua do Almada', 'Rua Costa Cabral', 'Avenida Fern\u00e3o de Magalh\u00e3es', 'Rua de Cedofeita', 'Rua Formosa', 'Rua da Constitui\u00e7\u00e3o'];
    const nifOf = (h) => { const d = String(2 + (h % 2)) + String(10000000 + h * 7919).slice(-7); const t = [...d].reduce((a, c, k) => a + c * (9 - k), 0) % 11; return `${d}${t < 2 ? 0 : 11 - t}`.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'); };
    const profOf = (q) => {
      if (q.prof) return q.prof;
      if (isM(q)) { q.prof = Object.assign({}, q.mach); return q.prof; }
      if (isP(q)) { q.prof = Object.assign({}, q.prod); return q.prof; }
      if (q.i != null) {
        const p = M.PERSON[q.i] || { id: ['', '', ''] };
        q.prof = { name: plain(p.name), role: plain(p.role), type: plain(p.id[0]), no: plain(p.id[1]), valid: plain(p.id[2] || ''), birth: plain(p.birth || ''), nationality: plain(p.nationalityName || ''), tax: plain(p.tax || ''), ss: plain(p.ss || ''), address: plain(p.address || ''), since: plain(p.since || '') };
        q.was = Object.assign({}, q.prof); return q.prof;
      }
      const h = hash(q.name), reg = q.lists.length > 0, pp = q.type === 'Passport', mo = (k) => M.MONTHS[(h + k) % 12];
      const since = new Date(); since.setDate(since.getDate() - 3 - (h % 20));
      q.prof = {
        name: q.name, role: q.role || '', type: q.type, no: q.no, valid: q.valid || '', birth: `${1 + (h % 27)} ${mo(3)} ${1970 + (h % 33)}`,
        nationality: pp ? '' : 'Portuguese',
        // (read off the register, or off their own documents: a tax or social security document has its number)
        tax: reg || q.files.length > 1 ? nifOf(h) : '', ss: reg || q.files.length > 1 ? String(11000000000 + h * 104729).slice(0, 11).replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3') : '',
        address: reg ? `${STREET[h % STREET.length]} ${10 + (h % 400)}, ${4000 + (h % 370)}-${String(100 + (h % 899))} Porto` : '',
        since: reg ? fmt(since) : '',
      };
      return q.prof;
    };
    let wread = 0;
    const srcList = () => files.find((f, k) => found.per[k] && found.per[k].list && !found.per[k].eq && !found.per[k].pr);
    const cMatch = (c) => !dq || fold(plain(c.name)).includes(fold(dq));
    // someone on the list: what the file says changed, as their card, to accept or reject
    const chCard = (c, j) => {
        const p = M.PERSON[c.i] || { id: ['', ''] }, src = srcList(), from = src ? src.name : '';
        if (c.decision === 'no') return `<section class="cmu-r is-off" data-ccard="${j}"${cMatch(c) ? '' : ' hidden'}><div class="cmu-r-h"><div class="cmu-r-t"><h3>${esc(plain(c.name))}</h3><p>Stays ${esc(c.from)} &middot; change rejected</p></div><button type="button" class="link-btn" data-cundo="${j}">Undo</button></div></section>`;
        const right = c.decision === 'ok' ? `<button type="button" class="link-btn" data-cundo="${j}">Undo</button><span class="cmu-acc is-ok">${TICK}Accepted</span>`
          : `<button class="cmu-acc cmu-rej" type="button" data-creject="${j}">${CROSS}Reject</button><button class="cmu-acc" type="button" data-caccept="${j}">${TICK}Accept</button>`;
        return `<section class="cmu-r${c.decision === 'ok' ? ' is-ok' : ''}" data-ccard="${j}" aria-label="${esc(plain(c.name))}"${cMatch(c) ? '' : ' hidden'}>
          <div class="cmu-r-h"><div class="cmu-r-t"><h3>${esc(plain(c.name))}</h3><p>${esc(from)}</p></div><span class="co-badge b-pend">Job category changed</span></div>
          <dl class="cmu-fields"><div class="is-flag"><dt>Job category</dt><dd>${esc(c.to)} <span class="co-subtle">&middot; was ${esc(c.from)}</span></dd></div><div><dt>${esc(plain(p.id[0]))}</dt><dd>${esc(plain(p.id[1]))}</dd></div></dl>
          <p class="cmu-why">This register has them as ${esc(c.to)}, not ${esc(c.from)}. Accept to change their job category, or reject to keep ${esc(c.from)}.</p>
          <footer class="cmu-r-acts"><span></span><span>${right}</span></footer>
        </section>`;
      };
    const roleChanges = () => ((found && found.changes) || []).map((c, j) => [c, j]).filter(([c]) => c.type === 'role');
    // someone added by hand (Add worker): their details as a details card has them, typed in; only
    // the name is needed, their documents come later (from their page, or dropped on ALMA)
    let manual = null;
    const manualStep = () => {
      head('ALMA', 'Add a worker manually', 'Fill in what you know. Only the full name is needed: add their documents later, from their page or by dropping them on me.');
      const v = manual.prof;
      $('cmu-body').innerHTML = `<section class="cmu-r is-editing cmu-manual" aria-label="New worker"><dl class="cmu-fields">${PF.map(([f, l, date]) => `<div><dt>${l}${f === 'name' ? ' <span class="co-subtle">&middot; needed</span>' : ''}</dt><dd>${date ? `<input type="date" data-mf="${f}" value="${isoOf(v[f])}" aria-label="${l}">` : `<input data-mf="${f}" value="${esc(v[f])}" aria-label="${l}"${f === 'name' ? ' required' : ''}>`}</dd></div>`).join('')}</dl></section>`;
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-mback>Back</button><span class="cmu-foot-l">${v.name.trim() ? '' : 'Give their full name to add them'}</span><button type="button" class="btn btn-primary btn-sm" data-madd${v.name.trim() ? '' : ' disabled'}>Add worker</button>`;
    };
    const detailsStep = () => {
      const P = chosen();
      if (step === 'wread') {
        head('ALMA', `Reading the details of ${nounsOf(P)}`, 'From the files you uploaded: what each one says.');
        $('cmu-body').innerHTML = `<div class="cmu-list"><h3>ALMA is reading</h3>${P.map((q, k) => `<div class="cmu-f ${k < wread ? 'is-done' : k === wread ? 'is-reading' : ''}"><span class="cmu-ic">${k < wread ? OK : k === wread ? SPIN : FILE}</span><span class="cmu-n">${esc(q.name)}</span><small>${k < wread ? 'Read' : k === wread ? (isM(q) ? 'Reading its type, serial number and year&hellip;' : isP(q) ? 'Reading its manufacturer, reference and family&hellip;' : 'Reading their ID, tax and social security numbers&hellip;') : 'Waiting'}</small></div>`).join('')}</div>`;
        $('cmu-foot').innerHTML = '<span class="cmu-foot-l">Reading each one&rsquo;s details.</span>';
        return;
      }
      // as the setup's review (js/guided-upload.js): her confidence on each one, low first; low
      // confidence needs the user (accept, change or reject), medium and high are up to them
      const editing = P.some((q) => q.editing), kept = P.filter((q) => !q.out), CJ = roleChanges(), C = CJ.map(([c]) => c);
      // the ones that need the user first; each keeps the place it first had, so one accepted or
      // changed doesn't move away from under them
      P.forEach((q) => { if (q.rank == null) q.rank = needsYou(q) ? 0 : 1; });
      const order = P.map((q, k) => [q, k]).sort((a, b) => a[0].rank - b[0].rank || a[1] - b[1]).map(([q]) => q);
      // a change to someone on the list waits for the user: nothing on file changes until accepted
      const acc = kept.filter((q) => q.ok).length + C.filter((c) => c.decision === 'ok').length, needs = kept.filter(needsYou).length + C.filter((c) => !c.decision).length;
      head('ALMA', P.length ? `Details of ${nounsOf(P)}${C.length ? ` and ${C.length === 1 ? 'one change' : `${C.length} changes`}` : ''}` : 'Changes to your worker list', needs ? `${needs === 1 ? 'One needs' : `${needs} need`} you before you continue: check ${needs === 1 ? 'it' : 'them'} and accept, change or reject. Low confidence needs you; medium and high are up to you.` : 'As I read them from your files. Low confidence needs you; medium and high are up to you. Open any one to see where I read each detail.');
      // many of them: a search, as on the step before (filters as it's typed)
      const dMatch = (q) => !dq || fold(`${titleOf(q)} ${profOf(q).no || profOf(q).serial || profOf(q).ref || ''}`).includes(fold(dq));
      const search = P.length > 5 ? `<label class="co-search cmu-wq">${SEARCH_I}<input type="search" placeholder="${P.every(isM) ? 'Search by name or serial number' : P.every(isP) ? 'Search by name or reference' : 'Search by name or ID number'}" aria-label="Search these" data-dq value="${esc(dq)}"></label>` : '';
      const open = C.filter((c) => c.decision !== 'no'), total = kept.length + open.length;
      const all = editing || !total ? '' : kept.some((q) => !q.ok) || open.some((c) => !c.decision) ? `<button class="cmu-acc" type="button" data-waccept-all>${TICK}Accept all</button>` : '<button class="cmu-acc" type="button" data-wunaccept-all>Unaccept all</button>';
      const bar = `<div class="cmu-bar"><span>${acc} of ${total} accepted</span>${all}</div>`;
      const changesHtml = C.length ? `${P.length ? `<h3 class="cmu-who">Changes to workers on your list<small>${C.length}</small></h3>` : ''}${CJ.map(([c, j]) => chCard(c, j)).join('')}` : '';
      $('cmu-body').innerHTML = search + bar + `<p class="cmu-dnone"${P.some(dMatch) || C.some(cMatch) ? ' hidden' : ''}>No one matches that.</p>` + (P.length && C.length ? `<h3 class="cmu-who">New workers<small>${P.length}</small></h3>` : '') + order.map((q) => {
        const v = profOf(q), from = srcOf(q).map((j) => files[j].name), c = confsOf(q), lowF = lowOf(q);
        // left out: it says so, and can come back
        if (q.out) return `<section class="cmu-r is-off" data-dcard="${q.key}" aria-label="${esc(titleOf(q))}"${dMatch(q) ? '' : ' hidden'}><div class="cmu-r-h"><div class="cmu-r-t"><h3>${esc(titleOf(q))}</h3><p>${esc(from.join(', '))} &middot; left out, not added</p></div><button type="button" class="link-btn" data-wundo="${q.key}">Undo</button></div></section>`;
        const cell = ([f, l, date]) => `<div${!q.edited && c[f] != null && c[f] < 75 ? ' class="is-flag"' : ''}><dt>${l}</dt><dd>${q.editing ? (date ? `<input type="date" name="${f}" value="${isoOf(v[f])}" aria-label="${l}">` : `<input name="${f}" value="${esc(v[f])}" aria-label="${l}">`) : v[f] ? esc(v[f]) : '<span class="co-subtle">Not on the file</span>'}</dd></div>`;
        const left = q.editing ? '' : `<button type="button" class="link-btn" data-wpeek="${q.key}">Preview</button><button type="button" class="link-btn" data-wedit="${q.key}">Make changes</button>`;
        const right = q.editing ? `<button type="button" class="link-btn" data-wcancel="${q.key}">Cancel</button><button class="cmu-acc" type="button" data-wsave="${q.key}">${TICK}Save changes</button>`
          : q.ok ? `<button type="button" class="link-btn" data-wunaccept="${q.key}">Undo</button><span class="cmu-acc is-ok">${TICK}Accepted</span>`
          : `<button class="cmu-acc cmu-rej" type="button" data-wreject="${q.key}">${CROSS}Reject</button><button class="cmu-acc" type="button" data-waccept="${q.key}">${TICK}Accept</button>`;
        return `<section class="cmu-r${q.editing ? ' is-editing' : ''}${q.ok ? ' is-ok' : ''}" data-dcard="${q.key}" aria-label="${esc(titleOf(q))}"${dMatch(q) ? '' : ' hidden'}>
          <div class="cmu-r-h"><div class="cmu-r-t"><h3><button type="button" class="cmu-peek" data-wpeek="${q.key}">${esc(titleOf(q))}</button></h3><p>${esc(from.join(', '))}</p></div>${confTagOf(q)}</div>
          <dl class="cmu-fields">${fieldsFor(q).map(cell).join('')}</dl>
          ${lowF.length && !q.editing ? `<p class="cmu-why">I couldn&rsquo;t read ${lowF.map((f) => `the ${labelOf(q, f).replace(/^\w/, (x) => x.toLowerCase())}`).join(' or ')} cleanly. Check ${lowF.length === 1 ? 'it' : 'them'} against the file, then accept, change or reject.</p>` : ''}
          <footer class="cmu-r-acts"><span>${left}</span><span>${right}</span></footer>
        </section>`;
      }).join('') + changesHtml + (total > 1 && all && (kept.some((q) => !q.ok) || open.some((c) => !c.decision)) ? `<div class="cmu-bar cmu-bar-end"><span>${acc} of ${total} accepted</span>${all}</div>` : ''); // and again at the end of a long list, as the setup's
      const why = editing ? 'Save or cancel your changes first' : needs ? `${needs} need${needs === 1 ? 's' : ''} you to decide before you continue` : '';
      const n = kept.length;
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-wback>Back</button><span class="cmu-foot-l">${why}</span><button type="button" class="btn btn-primary btn-sm" data-wgo${editing || needs ? ' disabled' : ''}>${n ? `Add ${n === 1 ? (P.every(isR) ? 'it' : 'them') : n} and file the documents` : C.length ? 'Continue' : 'Continue without adding'}</button>`;
    };
    // her confidence on each detail she read (a level, never a number, as everywhere): most read
    // cleanly; on some files one detail didn't (a smudged number, a cut-off line), and that one
    // waits for the user. A detail they typed in is theirs, sure
    const LOWABLE = { workers: ['ss', 'tax', 'address', 'birth', 'no'], equipment: ['serial', 'year'], products: ['ref', 'code'] };
    const kindOf = (q) => (isM(q) ? 'equipment' : isP(q) ? 'products' : 'workers');
    const confsOf = (q) => {
      if (q.conf) return q.conf;
      if (q.i != null && !isR(q)) { profOf(q); q.conf = q.roleWas ? { role: 82 } : {}; return q.conf; }
      const v = profOf(q), h = hash(q.key), can = LOWABLE[kindOf(q)].filter((f) => v[f]);
      // one in two with a detail she couldn't read cleanly (low); of the rest, some with one she's less sure of (medium)
      const low = h % 2 === 0 && can.length ? can[h % can.length] : null, mid = !low && h % 3 === 1 && can.length ? can[(h >> 2) % can.length] : null;
      q.conf = Object.fromEntries(fieldsFor(q).filter(([f]) => v[f]).map(([f]) => [f, f === low ? 55 + (hash(q.key + f) % 15) : f === mid ? 78 + (hash(q.key + f) % 10) : 91 + (hash(q.key + f) % 9)]));
      return q.conf;
    };
    const lowOf = (q) => (q.edited ? [] : Object.entries(confsOf(q)).filter(([, p]) => p < 75).map(([f]) => f));
    const needsYou = (q) => !q.out && !q.ok && lowOf(q).length > 0;
    const bandOf = (p) => (p >= 90 ? ['High', 'b-ok'] : p >= 75 ? ['Medium', 'b-pend'] : ['Low', 'b-over']);
    const tagOf = (p) => { const [b, c] = bandOf(p); return `<span class="co-badge ${c}" title="How sure ALMA is that she read it right">${b} confidence</span>`; };
    const confTagOf = (q) => (q.edited ? '<span class="co-badge b-neu">' + M.corrected() + '</span>' : tagOf(Math.min(...Object.values(confsOf(q)).concat(99))));
    const labelOf = (q, f) => (fieldsFor(q).find(([k]) => k === f) || [f, f])[1];
    const srcOf = (q) => [...new Set(q.files.concat(q.lists))];
    const readDetails = () => {
      const P = chosen();
      dq = ''; step = 'wread'; wread = 0; paint();
      const tick = () => { if (!el.isConnected || step !== 'wread') return; wread += 1; if (wread >= P.length) { P.forEach(profOf);
          if (found.w) { batchThem(); if (tucked) toast(`ALMA has read ${P.length === 1 ? 'their details and documents' : `the details and documents of ${P.length} workers`}. Check each one.`, ['Review', () => tuck(false)]); return; } step = 'details'; paint(); $('cmu-body').scrollTop = 0; if (tucked) toast(`ALMA has read the details of ${nounsOf(P)}. Check them before she adds them.`, ['Review', () => tuck(false)]); return; } paint(); setTimeout(tick, 450); };
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
      const nw = pickable(), shown = nw.filter(wMatch), on = shown.filter((q) => q.decision === 'ok').length, b = el.querySelector('[data-pall]');
      if (b) { b.checked = !!shown.length && on === shown.length; b.indeterminate = on > 0 && on < shown.length; b.disabled = !shown.length; }
    };
    // ---- workers, one at a time ----------------------------------------------------------------------
    let batch = [], wi = 0, wOpen = null;
    const chosen = () => found.people.filter((q) => q.decision === 'ok' && (found.w || q.i == null));
    const merged = (q) => (found.unsure || []).some((u) => u.decision === 'same' && u.b === q);
    const pickable = () => found.people.filter((q) => (found.w ? !isR(q) || q.i == null : q.i == null) && !merged(q));
    const simN = (q) => (isR(q) ? 0 : Math.max(0, 2 + (hash(q.key) % 3) - q.files.length));
    const nDocs = (q) => q.files.length + simN(q) + (q.lists.length ? 1 : 0) + (found.unsure || []).filter((u) => u.decision === 'same' && u.a === q).reduce((a, u) => a + u.b.files.length, 0);
    // the same person after all: one worker, the files of both
    const mergeSame = () => {
      (found.unsure || []).filter((u) => u.decision === 'same').forEach(({ a, b }) => {
        a.files.push(...b.files); found.per.forEach((x) => { if (!x.list && x.people[0] === b) x.people[0] = a; });
        if (b.decision === 'ok') a.decision = 'ok'; found.people.splice(found.people.indexOf(b), 1);
      });
      found.unsure = (found.unsure || []).filter((u) => u.decision !== 'same');
    };
    // who is on the files: each worker once (matched by name, ID and social security numbers), new
    // or on the list, for the user to pick; two names she can't tell apart, for them to say
    const whoStepW = () => {
      const every = pickable(), all = every.filter((q) => !isR(q)), other = every.filter(isR), nw = all.filter((q) => q.i == null), U = found.unsure || [], open = U.filter((u) => !u.decision), nOn = every.filter((q) => q.decision === 'ok').length;
      head('ALMA', `I found ${all.length === 1 ? 'one worker' : `${all.length} workers`}${nw.length ? `, ${nw.length === all.length ? (all.length === 1 ? 'new' : 'all new') : `${nw.length} of them new`}` : all.length === 1 ? ', already on your list' : ', all on your list'}${other.length ? `, and ${nounsOf(other)}` : ''}`,
        `Matched across your ${files.length === 1 ? 'file' : `${files.length} files`} by name, ID and social security numbers. New means not on your worker list yet. ${open.length ? `First, tell me if ${open.length === 1 ? 'two of them are' : 'these are'} the same person. Then select` : 'Select'} the ones to check: I&rsquo;ll read their details and documents, and you check one worker at a time.`);
      const side = (q) => `<div><b>${esc(q.name)}</b><small>${esc(q.type)} &middot; ${esc(q.no)}</small><small>${q.files.map((k) => esc(files[k].name)).join(', ')}</small></div>`;
      const uCard = (u, j) => (u.decision ? `<section class="cmu-r is-off"><div class="cmu-r-h"><div class="cmu-r-t"><h3>${esc(u.a.name)} and ${esc(u.b.name)}</h3><p>${u.decision === 'same' ? 'The same person: their files are together' : 'Two different people'}</p></div><button type="button" class="link-btn" data-uundo="${j}">Undo</button></div></section>`
        : `<section class="cmu-r is-ask"><div class="cmu-r-h"><div class="cmu-r-t"><h3>The same person?</h3><p>The names are close, but I can&rsquo;t tell if this is one worker or two.</p></div><span class="co-badge b-pend">Needs you</span></div><div class="cmu-same">${side(u.a)}${side(u.b)}</div><footer class="cmu-r-acts"><span></span><span><button class="cmu-acc" type="button" data-utwo="${j}">Two people</button><button class="cmu-acc" type="button" data-usame="${j}">${TICK}Same person</button></span></footer></section>`);
      const row = (q) => `<tr class="${q.decision === 'ok' ? 'is-picked' : ''}" data-wrow="${q.key}"${wMatch(q) ? '' : ' hidden'}><td class="c"><input type="checkbox" class="cmu-pck" id="cmu-pk-${q.key}" data-pck="${q.key}" aria-label="Check ${esc(q.name)}"${q.decision === 'ok' ? ' checked' : ''}></td>
        <td><label class="cmu-wp" for="cmu-pk-${q.key}"><span class="cmu-pic" aria-hidden="true">${esc(initials(q.name))}</span><span class="cmu-wp-t"><b>${esc(q.name)}</b><small>${esc(q.type)} &middot; ${esc(q.no)}</small></span></label></td>
        <td class="cmu-wn">${nDocs(q) ? `${nDocs(q)} document${nDocs(q) === 1 ? '' : 's'}` : isM(q) ? 'On the equipment list' : isP(q) ? 'On the product list' : 'On the register'}</td><td><span class="co-badge ${q.i == null ? 'b-info' : 'b-neu'}">${isM(q) ? 'New machine' : isP(q) ? 'New product' : q.i == null ? 'New' : 'On your list'}</span></td></tr>`;
      const search = all.length > 5 ? `<label class="co-search cmu-wq">${SEARCH_I}<input type="search" placeholder="Search by name or ID number" aria-label="Search the workers" data-wq value="${esc(wq)}"></label>` : '';
      $('cmu-body').innerHTML = U.map(uCard).join('') + search + `<div class="cmu-wt"><table><thead><tr><th class="c"><input type="checkbox" class="cmu-pck" data-pall="n" aria-label="Select everyone shown"></th><th>${other.length ? 'Worker, machine or product' : 'Worker'}</th><th>Documents</th><th></th></tr></thead><tbody>${nw.concat(all.filter((q) => q.i != null), other).map(row).join('')}<tr class="cmu-wnone"${every.some(wMatch) ? ' hidden' : ''}><td colspan="4">No one matches that.</td></tr></tbody></table></div>`;
      wAll();
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-back>Add or change files</button><span class="cmu-foot-l">${open.length ? `Tell me about ${open.length === 1 ? 'the possible match' : `the ${open.length} possible matches`} first` : `${nOn} of ${every.length} selected`}</span><button type="button" class="btn btn-primary btn-sm" data-pgo${open.length || !nOn ? ' disabled' : ''}>Continue</button>`;
    };
    // the files to the workers picked: each file to its worker, under its type; a worker who wasn't
    // picked has their files left out
    const batchThem = () => {
      files = files.filter((f) => !f.sim); // (again from the who step: her documents for them are read again)
      const B = chosen().filter((q) => !isR(q)).sort((a, b) => (a.i == null ? 0 : 1) - (b.i == null ? 0 : 1)), base = (M.WORKERS || []).length; // the new ones first
      B.filter((q) => q.i == null).forEach((q, k) => { q.ni = base + k; });
      const anyOf = (q) => { const L = freshSlots(q), have = new Set(L.map((x) => x.code)); return L.concat(M.DOCS.filter((d) => d.kind === 'workers' && live(d) && !have.has(d.code)).map((d) => ({ key: `${d.code}#${q.ni}`, code: d.code, i: q.ni, d, name: plain(d.name), who: q.name, status: 'missing', exp: '—', fresh: q }))); };
      pool = R0.pool.concat(B.filter((q) => q.i == null).flatMap(anyOf), regsOf());
      const picks = found.per.map((x) => (x.list ? { list: true } : !x.people[0] ? null : x.people[0].decision === 'ok' ? { who: x.people[0].name } : { off: 'x' }));
      results = place(pool, focus, files, picks);
      results.forEach((r, k) => {
        const pk = picks[k]; if (pk && pk.off) r.on = false;
        r.owner = pk && pk.who ? found.per[k].people[0] : null;
        if (r.slot && r.slot.fresh && r.slot.code === 'ID' && r.slot.fresh.type === 'Passport') Object.assign(r, { by: 'Issuing country’s passport office', country: 'Not read: check it' });
      });
      // a job that changed on the register: shown on the worker, as their job category
      B.forEach((q) => { const v = profOf(q), c = q.i != null && (found.changes || []).find((x) => x.type === 'role' && x.i === q.i); if (c && !q.roleWas) { v.role = plain(c.to); q.roleWas = plain(c.from); q.conf = null; } });
      found.changes = [];
      B.forEach((q) => {
        const n = simN(q); if (!n) return;
        const have = new Set(docsOf(q).map((r) => r.slot && r.slot.code)), L = slotsOf(q).filter((x) => !have.has(x.code)), h = hash(q.key);
        const id = L.find((x) => x.code === 'ID'), rest = L.filter((x) => x !== id).sort((a, b) => (M.RANK[b.status] || 0) - (M.RANK[a.status] || 0));
        const pick = id ? [id] : []; let j = h % Math.max(1, rest.length);
        while (pick.length < n && rest.length) { pick.push(rest.splice(j % rest.length, 1)[0]); j += 2; }
        pick.forEach((sl) => {
          const f = new File(['x'], `${sl.name} - ${profOf(q).name || q.name}.pdf`, { type: 'application/pdf' }); f.sim = true; files.push(f);
          results.push({ file: f, slot: sl, how: 'sure', note: '', on: true, read: readDates(sl, f), conf: 90 + (hash(f.name) % 9), owner: q });
        });
      });
      batch = B; if (!B.length) { finish(); return; } wGo(0);
    };
    const docsOf = (q) => results.filter((r) => r.owner === q);
    // where one of their documents can go: any of that worker's documents
    const slotsOf = (q) => (q.i == null ? pool.filter((x) => x.fresh === q) : pool.filter((x) => !x.fresh && x.i === q.i && x.d && x.d.kind === 'workers'));
    const reslot = (r, sl) => Object.assign(r, { slot: sl, read: sl ? readDates(sl, r.file) : null, ref: null, by: null, country: null, wv: null, fc: null, fe: null, checked: false, edited: false, how: 'sure', note: '' });
    // a document's details: what the list has for it (or the setup's), as read, each open to change
    const IDF = [['name', 'Full name'], ['type', 'ID document'], ['no', 'Document number'], ['birth', 'Birth date'], ['nationality', 'Nationality'], ['issued', 'Issue date'], ['valid', 'Valid until']];
    const PB = ['name', 'type', 'no', 'birth', 'nationality']; // what an ID document says of the person: theirs, wherever it's changed
    const isDateF = (f) => DATES.includes(f) || f === 'birth' || f === 'since';
    const idDoc = (r) => !!(r.slot && r.slot.code === 'ID' && r.owner);
    const dFields = (r) => { const sl = r.slot; if (!sl) return []; if (idDoc(r)) return IDF; return wFields(sl) || FIELDS.filter(([f]) => f !== 'ref' || sl.i == null || sl.code === 'ID').map(([f, l]) => [f, labOf(sl, f, l)]); };
    const dVal = (r, f, l) => (idDoc(r) && PB.includes(f) ? profOf(r.owner)[f] : DATES.includes(f) || !wFields(r.slot) ? valsOf(r)[f] : wVal(r, f, l)) || '';
    const dSet = (r, f, val) => { if (idDoc(r) && (PB.includes(f) || f === 'valid')) { profOf(r.owner)[f] = val; if (f === 'no') r.ref = val; } if (idDoc(r) && PB.includes(f)) { (r.fe = r.fe || new Set()).add(f); r.edited = true; return; } if (DATES.includes(f)) r.read = Object.assign({}, r.read, { [f]: val }); else if (wFields(r.slot)) r.wv = Object.assign({}, r.wv, { [f]: val }); else r[f] = val; (r.fe = r.fe || new Set()).add(f); r.edited = true; };
    // her confidence on each detail of a document: one in three with one she couldn't read cleanly
    const dConfs = (r) => {
      if (r.fc) return r.fc;
      const F = dFields(r).filter(([f, l]) => dVal(r, f, l)), h = Math.floor(hash(r.file.name + '|' + r.slot.key) / 7), can = F.filter(([f]) => !DATES.includes(f)).map(([f]) => f);
      const low = h % 3 === 0 && can.length ? can[(h >> 3) % can.length] : null, mid = !low && h % 3 === 1 && can.length ? can[(h >> 3) % can.length] : null;
      r.fc = Object.fromEntries(F.map(([f]) => [f, f === low ? 55 + (hash(r.file.name + f) % 15) : f === mid ? 78 + (hash(r.file.name + f) % 10) : 91 + (hash(r.file.name + f) % 9)]));
      return r.fc;
    };
    const dLow = (r) => (!r.slot ? [] : Object.entries(dConfs(r)).filter(([f, x]) => x < 75 && !(r.fe && r.fe.has(f))).map(([f]) => f));
    const dGuess = (r) => !!(r.slot && r.how === 'guess' && !r.checked);
    const dNeeds = (r) => r.on && (!r.slot || (dLow(r).length > 0 && !r.checked) || dGuess(r) || lapsedR(r));
    const pLow = (q) => (q.i != null ? [] : Object.entries(confsOf(q)).filter(([f, x]) => x < 75 && !(q.fe && q.fe.has(f))).map(([f]) => f));
    const pNeeds = (q) => pLow(q).length > 0 && !q.checked;
    const wNeeds = (q) => (q.lists.length && !q.regOk ? 1 : 0) + docsOf(q).filter((r) => r.on && !r.ok).length; // documents not decided yet
    const ACC = '<span class="co-badge b-ok">Accepted</span>';
    const canAcc = (r) => !!r.slot && !lapsedR(r);
    const corrB = () => `<span class="co-badge b-neu">${M.corrected()}</span>`, CONFD = '<span class="co-badge b-ok">Confirmed</span>';
    const minTag = (o) => tagOf(Math.min(...Object.values(o).concat(99)));
    const dBadge = (r) => (!r.on ? '<span class="co-badge b-neu">Left out</span>' : r.ok ? ACC : !r.slot ? '<span class="co-badge b-over">Needs you</span>' : lapsedR(r) ? '<span class="co-badge b-over">Expired</span>'
      : dGuess(r) ? tagOf(70) : dLow(r).length && !r.checked ? tagOf(Math.min(...dLow(r).map((f) => dConfs(r)[f]))) : r.fe && r.fe.size ? corrB() : r.checked ? CONFD : minTag(dConfs(r)));
    const pBadge = (q) => (q.regOk ? ACC : q.i != null ? (q.roleWas ? '<span class="co-badge b-pend">Job category changed</span>' : q.fe && q.fe.size ? corrB() : '')
      : pNeeds(q) ? tagOf(Math.min(...pLow(q).map((f) => confsOf(q)[f]))) : q.fe && q.fe.size ? corrB() : q.checked ? CONFD : minTag(confsOf(q)));
    const tagP = (q, f) => { const c = confsOf(q)[f]; return q.fe && q.fe.has(f) ? corrB() : q.i != null ? (f === 'role' && q.roleWas ? '<span class="co-badge b-pend">Changed</span>' : '') : c == null ? '' : c < 75 && q.checked ? CONFD : tagOf(c); };
    const tagD = (r, f) => { const c = dConfs(r)[f]; return r.fe && r.fe.has(f) ? corrB() : c == null ? '' : c < 75 && r.checked ? CONFD : tagOf(c); };
    const inp = (attr, val, date, l) => (date && (!val || !Number.isNaN(Date.parse(val))) ? `<input type="date" ${attr} value="${isoOf(val)}" aria-label="${esc(l)}">` : `<input ${attr} value="${esc(val)}" aria-label="${esc(l)}" placeholder="Not on the files">`);
    const lowSay = (L, lab) => `I couldn&rsquo;t read ${L.map((f) => `the ${lab(f).replace(/^\w/, (x) => x.toLowerCase())}`).join(' or ')} cleanly. Check ${L.length === 1 ? 'it' : 'them'} against the file, then change ${L.length === 1 ? 'it' : 'them'} or accept the document as it is.`;
    const ownerOpts = (cur) => {
      const inB = batch.map((x, j) => `<option value="b:${j}"${x === cur ? ' selected' : ''}>${esc(profOf(x).name || x.name)}${x.i == null ? ' (new)' : ''}</option>`).join('');
      const rest = activeWorkers().filter((x) => !batch.some((b) => b.i === x.i)).map((x) => `<option value="w:${x.i}">${esc(plain(x.p.name))}</option>`).join('');
      return `<optgroup label="Checking now">${inB}</optgroup>${rest ? `<optgroup label="Your worker list">${rest}</optgroup>` : ''}`;
    };
    const typeOpts = (r) => (r.slot ? '' : '<option value="" selected disabled>Choose what document this is</option>') + slotsOf(r.owner).map((x) => `<option value="${esc(x.key)}"${r.slot === x ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
    const peekFor = (key) => { const q = batch[wi]; if (key === 'p') { if (q && q.lists.length) openPeek(q.key); else closePeek(); } else if (key != null && results[key] && results[key].slot) openPeek('r:' + key); else closePeek(); };
    const wGo = (j) => { wi = j; const q = batch[wi]; q.moved = ''; wOpen = null; step = 'worker'; paint(); $('cmu-body').scrollTop = 0; closePeek(); };
    const keep = () => { const at = $('cmu-body').scrollTop; paint(); $('cmu-body').scrollTop = at; };
    const wkFoot = () => {
      const q = batch[wi], n = wNeeds(q), rest = batch.filter((x) => x !== q && !x.ok && !x.skip).length;
      if (q.ok && n) q.ok = false; // a document undone: the worker isn't accepted any more
      // accepted or skipped already (back to them with the arrows): undone here, or on to the next
      if (q.ok || q.skip) { $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-wkback>Back</button><span class="cmu-foot-l">${q.ok ? 'Worker accepted' : q.i == null ? 'Skipped: not added' : 'Skipped: their documents aren&rsquo;t saved'}</span><button type="button" class="btn btn-quiet btn-sm" data-wkundo>${q.ok ? 'Unaccept worker' : 'Undo skip'}</button><button type="button" class="btn btn-primary btn-sm" data-wknext>${rest ? 'Next worker' : 'Finish'}</button>`; return; }
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-wkback>Back</button><span class="cmu-foot-l">${n ? `Accept or reject ${n === 1 ? 'one more document' : `${n} more documents`}` : ''}</span><button type="button" class="link-btn" data-wkskip title="${q.i == null ? 'Don&rsquo;t add them now' : 'Don&rsquo;t save their documents now'}">Skip</button><button type="button" class="btn btn-primary btn-sm" data-wkok${n ? ' disabled' : ''}>Accept worker</button>`;
    };
    const workerStep = () => {
      const q = batch[wi]; if (!q) return;
      if (q.ok && wNeeds(q)) q.ok = false;
      const v = profOf(q), D = docsOf(q), isNew = q.i == null, c = confsOf(q), pl = pLow(q), pOpen = wOpen === 'p';
      head('ALMA', 'Check each worker', 'Their documents, and what I read on each one. Accept or reject each document; low confidence needs you to check it against the file first. Open a document to see the file beside this panel.');
      const top = `<div class="cmu-wk-top"><span class="co-badge ${isNew ? 'b-info' : 'b-neu'}">${isNew ? 'New worker' : 'On your list'}</span>${q.ok ? '<span class="co-badge b-ok">Accepted</span>' : q.skip ? '<span class="co-badge b-neu">Skipped</span>' : ''}<span class="cmu-wk-n"><button type="button" data-wprev aria-label="Previous worker"${wi ? '' : ' disabled'}>${PREV}</button><span>${wi + 1} of ${batch.length}</span><button type="button" data-wnext aria-label="Next worker"${wi < batch.length - 1 ? '' : ' disabled'}>${NEXT}</button></span></div>`;
      const reg = srcList(), lk = q.lists[0], lr = lk != null ? results[lk] : null;
      // the register's line for them: what it says of them (a job changed on it, shown so)
      const pBody = !pOpen ? '' : `<dl class="cmu-fields">${PF.map(([f, l, date]) => { const flag = isNew && !(q.fe && q.fe.has(f)) && !q.checked && c[f] != null && c[f] < 75; return `<div${flag ? ' class="is-flag"' : ''} data-row="p:${f}"><dt>${l}</dt><dd>${inp(`data-pf="${f}"`, v[f] || '', date, l)}${f === 'role' && q.roleWas ? `<span class="cmu-was">Was ${esc(q.roleWas)} on your list</span>` : ''}<span class="cmu-tg">${tagP(q, f)}</span></dd></div>`; }).join('')}</dl>`
        + (pl.length && !q.checked ? `<p class="cmu-why" data-why="p">${lowSay(pl, (f) => labelOf(q, f))}</p>` : '')
        + `<footer class="cmu-r-acts"><span><button type="button" class="link-btn" data-wppeek>Preview</button></span><span>${q.regOk ? `<button type="button" class="link-btn" data-pundo>Undo</button><span class="cmu-acc is-ok">${TICK}Accepted</span>` : `<button class="cmu-acc" type="button" data-pacc>${TICK}Accept</button>`}</span></footer>`;
      const regCard = lk == null ? '' : `<section class="cmu-r cmu-wk-d${pOpen ? ' is-open' : ''}${q.regOk ? ' is-ok' : pNeeds(q) ? ' is-ask' : ''}" data-wk="p"><button type="button" class="cmu-wk-h" data-wopen="p" aria-expanded="${pOpen}"><span class="cmu-ic">${FILE}</span><span class="cmu-r-t"><b>${esc(lr && lr.slot ? lr.slot.name : 'Worker register')}</b><small>${esc(files[lk].name)}</small></span><span class="cmu-wk-b">${pBadge(q)}</span>${CHEV}</button>${pBody}</section>`;
      // their name, as in the drawing: on its own, and theirs to put right
      const pCard = `<section class="cmu-r cmu-wk-p"><span class="cmu-pic" aria-hidden="true">${esc(initials(v.name || q.name))}</span><input class="cmu-wk-nm" data-pf="name" value="${esc(v.name || q.name)}" aria-label="Their full name" title="Change their name"></section>`;
      const dCard = (r) => {
        const k = results.indexOf(r), sl = r.slot, op = wOpen === k && r.on;
        if (!r.on) return `<section class="cmu-r cmu-wk-d is-off" data-wk="${k}"><div class="cmu-r-h"><span class="cmu-ic">${FILE}</span><div class="cmu-r-t"><h3>${esc(sl ? sl.name : r.file.name)}</h3><p>${esc(r.file.name)} &middot; left out, not saved</p></div><button type="button" class="link-btn" data-wdin="${k}">Undo</button></div></section>`;
        const hd = `<button type="button" class="cmu-wk-h" data-wopen="${k}" aria-expanded="${op}"><span class="cmu-ic">${FILE}</span><span class="cmu-r-t"><b>${sl ? esc(sl.name) : 'Which document is this?'}</b><small>${esc(r.file.name)}</small></span><span class="cmu-wk-b">${dBadge(r)}</span>${CHEV}</button>`;
        const cls = r.ok ? ' is-ok' : dNeeds(r) ? ' is-ask' : '';
        if (!op) return `<section class="cmu-r cmu-wk-d${cls}" data-wk="${k}">${hd}</section>`;
        const F = dFields(r), fc = sl ? dConfs(r) : {}, dl = dLow(r), ex = sl && lapsedR(r), df = sl ? fileDiff(r) : null;
        const fields = sl ? `<dl class="cmu-fields">${F.map(([f, l]) => { const flag = (!(r.fe && r.fe.has(f)) && !r.checked && fc[f] != null && fc[f] < 75) || (ex && f === 'valid'); return `<div${flag ? ' class="is-flag"' : ''} data-row="${k}:${f}"><dt>${esc(l)}</dt><dd>${inp(`data-df="${k}:${f}"`, dVal(r, f, l), isDateF(f), l)}<span class="cmu-tg">${tagD(r, f)}</span></dd></div>`; }).join('')}</dl>` : '';
        const notes = (!sl ? '<p class="cmu-why">I couldn&rsquo;t tell which document this is. Choose it under Filed as.</p>' : '')
          + (dGuess(r) ? `<p class="cmu-why" data-why="g${k}">I&rsquo;m not sure this is a ${esc(sl.name.toLowerCase())}. Check it under Filed as, then accept it.</p>` : '')
          + (ex ? `<p class="cmu-why">It expired on <b>${esc(r.read.valid)}</b>. If it&rsquo;s still in force, give it its new expiry date. Or leave it out.</p>` : '')
          + (dl.length && !r.checked ? `<p class="cmu-why" data-why="${k}">${lowSay(dl, (f) => (F.find((x) => x[0] === f) || [f, f])[1])}</p>` : '')
          + (df && df.length ? `<p class="cmu-why">It replaces the ${esc(sl.name)} on file. Accept to replace it, or reject to keep the one you have.</p><table class="cmu-diff"><thead><tr><th>What</th><th>On file now</th><th>New file</th></tr></thead><tbody>${df.map((x) => `<tr${x.flag ? ' class="is-flag"' : ''}><td>${x.label}</td><td>${x.from}</td><td>${x.to}</td></tr>${x.flag ? `<tr class="is-flag cmu-flag"><td colspan="3">${x.flag}</td></tr>` : ''}`).join('')}</tbody></table>` : '');
        const sel = `<div class="cmu-wk-sel"><label class="cmu-to"><span>Belongs to</span><select data-wown="${k}">${ownerOpts(r.owner)}</select></label><label class="cmu-to"><span>Filed as</span><select data-wtype="${k}">${typeOpts(r)}</select></label></div>`;
        const right = r.ok ? `<button type="button" class="link-btn" data-wdundo="${k}">Undo</button><span class="cmu-acc is-ok">${TICK}Accepted</span>`
          : `<button class="cmu-acc cmu-rej" type="button" data-wdout="${k}">${CROSS}Reject</button><button class="cmu-acc" type="button" data-wdacc="${k}"${canAcc(r) ? '' : ` disabled title="${sl ? 'Give it a new expiry date first' : 'Choose what document this is first'}"`}>${TICK}Accept</button>`;
        return `<section class="cmu-r cmu-wk-d is-open${cls}" data-wk="${k}">${hd}${r.note ? `<p class="cmu-note">${r.note}</p>` : ''}${sel}${fields}${notes}<footer class="cmu-r-acts"><span>${sl ? `<button type="button" class="link-btn" data-wdpeek="${k}">Preview</button>` : ''}</span><span>${right}</span></footer></section>`;
      };
      const nD = D.length + (lk != null ? 1 : 0);
      const on = D.filter((r) => r.on), acc = on.filter((r) => r.ok).length + (lk != null && q.regOk ? 1 : 0), tot = on.length + (lk != null ? 1 : 0);
      const easy = on.some((r) => !r.ok && !dNeeds(r)) || (lk != null && !q.regOk && !pNeeds(q));
      const all = easy ? `<button class="cmu-acc" type="button" data-wdall>${TICK}Accept all</button>` : tot && acc === tot ? '<button class="cmu-acc" type="button" data-wdunall>Unaccept all</button>' : '';
      const bar = (end) => `<div class="cmu-bar${end ? ' cmu-bar-end' : ''}"><span>${acc} of ${tot} accepted</span>${all}</div>`;
      const docs = nD ? `<h3 class="cmu-h">Documents &middot; ${nD}</h3>${bar()}${D.map(dCard).join('')}${regCard}${nD > 3 && easy ? bar(true) : ''}` : '<p class="cmu-dnone">No documents of theirs in these files.</p>';
      $('cmu-body').innerHTML = top + (q.moved ? `<p class="cmu-note" role="status">${q.moved}</p>` : '') + pCard + docs;
      wkFoot();
    };
    // typed over: the field reads as corrected at once (no repaint, so the field keeps the focus)
    const wLive = (row, key) => {
      const x = el.querySelector(`[data-row="${row}"]`); if (x) { x.classList.remove('is-flag'); const tg = x.querySelector('.cmu-tg'); if (tg) tg.innerHTML = corrB(); }
      const q = batch[wi], item = el.querySelector(`[data-wk="${key}"]`);
      if (item) {
        const b = item.querySelector('.cmu-wk-b'); if (b) b.innerHTML = key === 'p' ? pBadge(q) : dBadge(results[key]);
        item.classList.toggle('is-ask', key === 'p' ? pNeeds(q) : dNeeds(results[key]));
        if (key === 'p' ? !pLow(q).length : !dLow(results[key]).length) item.querySelector(`[data-why="${key}"]`)?.remove();
        const ab = key === 'p' ? null : item.querySelector('[data-wdacc]'); if (ab) ab.disabled = !canAcc(results[key]);
      }
      wkFoot();
    };
    // accepted or skipped: on to the next one not decided yet; none left, on to saving
    const nextW = () => { const j = batch.findIndex((x, n) => n > wi && !x.ok && !x.skip), j2 = j >= 0 ? j : batch.findIndex((x) => !x.ok && !x.skip); if (j2 >= 0) wGo(j2); else finish(); };
    const finish = () => {
      closePeek();
      batch.forEach((q) => { if (q.skip) q.decision = 'no'; const v = profOf(q); if (q.i == null && !q.skip) Object.assign(q, { name: (v.name || q.name).trim(), role: v.role, type: v.type, no: v.no, valid: v.valid }); });
      const base = (M.WORKERS || []).length; batch.filter((q) => q.i == null && !q.skip).forEach((q, k) => { q.ni = base + k; });
      results.forEach((r) => { if (quiet(r)) r.ok = true; if (!r.owner) return; r.wk = true; if (r.owner.skip) r.on = false; else if (r.on) r.ok = true; });
      // what no worker was found on (a company document, a file she couldn't place): the review, as before
      if (shown().length) { step = 3; paint(); $('cmu-body').scrollTop = 0; return; }
      if (!results.some((r) => r.on && r.slot) && !batch.some((q) => q.ok)) { close(); toast('Nothing saved: you skipped every worker.'); return; }
      save();
    };
    const whoStep = () => {
      if (found.w) { whoStepW(); return; }
      const nw = found.people.filter((q) => q.i == null), nOn = nw.filter((q) => q.decision === 'ok').length;
      const t0 = nounsOf(nw);
      head('ALMA', `${t0[0].toUpperCase()}${t0.slice(1)}`, `Not on your ${listOf(nw)} yet. ${nw.length === 1 ? `Add ${nw.every(isR) ? 'it' : 'them'}?` : 'Select the ones to add.'}`);
      // where they were read: each file that names someone, and how many it names
      const src = files.map((f, k) => { const x = found.per[k], ppl = x ? x.people : []; if (!ppl.length) return ''; const n = ppl.filter((q) => q.i == null).length;
        return `<div class="cmu-src"><span class="cmu-src-ic">${FILE}</span><span><b>${esc(f.name)}</b><small>${x.list ? `${ppl.length} ${x.eq ? 'machine' : x.pr ? 'product' : 'worker'}${ppl.length === 1 ? '' : 's'}: ${ppl.length - n} on your list, ${n} new` : n ? 'Someone new' : 'Someone on your list'}</small></span></div>`; }).join('');
      const row = (q) => `<tr class="${q.decision === 'ok' ? 'is-picked' : ''}" data-wrow="${q.key}"${wMatch(q) ? '' : ' hidden'}><td class="c"><input type="checkbox" class="cmu-pck" id="cmu-pk-${q.key}" data-pck="${q.key}" aria-label="Add ${esc(q.name)}"${q.decision === 'ok' ? ' checked' : ''}></td>
        <td><label class="cmu-wp" for="cmu-pk-${q.key}"><span class="cmu-pic" aria-hidden="true">${esc(initials(q.name))}</span><span class="cmu-wp-t"><b>${esc(q.name)}</b><small>${esc(q.type)} &middot; ${esc(q.no)}</small></span></label></td></tr>`;
      const search = nw.length > 5 ? `<label class="co-search cmu-wq">${SEARCH_I}<input type="search" placeholder="${nw.every(isM) ? 'Search by name or serial number' : nw.every(isP) ? 'Search by name or reference' : 'Search by name or ID number'}" aria-label="Search the new ones" data-wq value="${esc(wq)}"></label>` : '';
      $('cmu-body').innerHTML = `${src}${search}<div class="cmu-wt"><table><thead><tr><th class="c"><input type="checkbox" class="cmu-pck" data-pall="n" aria-label="Select everyone shown"></th><th>${nw.every(isM) ? 'Machine' : nw.every(isP) ? 'Product' : nw.some(isR) ? 'Worker, machine or product' : 'Worker'}</th></tr></thead><tbody>${nw.map(row).join('')}<tr class="cmu-wnone"${nw.some(wMatch) ? ' hidden' : ''}><td colspan="2">No one on the list matches that.</td></tr></tbody></table></div>`;
      wAll();
      $('cmu-foot').innerHTML = `<button type="button" class="link-btn" data-back>Add or change files</button><span class="cmu-foot-l">${nOn} of ${nw.length} selected</span><button type="button" class="btn btn-primary btn-sm" data-pgo>${nOn ? 'Continue' : 'Continue without adding'}</button>`;
    };
    // the documents to their people: someone new gets their place on the list (and their documents'
    // slots); each file then goes to its worker, under its type, and she reads its fields
    // the lists she read that the drawer doesn't already have a place for (an equipment list dropped on Workers)
    const regsOf = () => { const have = new Set(R0.pool.map((x) => x.code)); return (found ? found.per : []).flatMap((x) => (x.eq && !have.has('EQ-REG') ? [eqRegSlot()] : x.pr && !have.has('PR-REG') ? [prRegSlot()] : [])).filter((x, j, a) => a.findIndex((y) => y.code === x.code) === j); };
    const fileThem = (now) => {
      const base = (M.WORKERS || []).length;
      const fresh = found ? found.people.filter((q) => q.i == null && q.decision === 'ok' && !isR(q)) : [];
      fresh.forEach((q, k) => { q.ni = base + k; });
      pool = R0.pool.concat(fresh.flatMap(freshSlots), regsOf());
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
        if (x.pr) { results[k].note = `It lists ${on.length} product${on.length === 1 ? '' : 's'}: ${on.length - nn} on your list${nn ? `, and ${nn} you&rsquo;re adding` : ''}.`; return; }
        if (x.eq) { results[k].note = `It lists ${on.length} machine${on.length === 1 ? '' : 's'}: ${on.length - nn} on your list${nn ? `, and ${nn} you&rsquo;re adding` : ''}.`; return; }
        results[k].note = `${fs && results[k].slot && results[k].slot.key !== fs.key ? `It&rsquo;s a ${esc(plain(results[k].slot.name).toLowerCase())}, not ${esc(fs.who ? `${fs.who}&rsquo;s ` : '')}${esc(fs.name)}, so it&rsquo;s filed as that. ` : ''}It names ${on.length} worker${on.length === 1 ? '' : 's'}: ${on.length - nn} on your list${nn ? `, and ${nn} you&rsquo;re adding` : ''}. I&rsquo;ve noted it in each one&rsquo;s file.`;
      });
      if (now || matchMedia('(prefers-reduced-motion: reduce)').matches) { toReview(); return; }
      step = 'sort'; sorted = 0; paint();
      const go = () => { if (!el.isConnected || step !== 'sort') return; sorted += 1; if (sorted >= results.length) { toReview(); if (tucked && el.isConnected) toast(window.CMAlmaJob ? window.CMAlmaJob.doneMsg(shown().length) : 'ALMA has filed your documents.', ['Review', () => tuck(false)]); return; } paint(); setTimeout(go, 420); };
      setTimeout(go, 420);
    };
    const save = () => {
      // what was rejected stays as it was; the rest is filed
      const kept = new Set(results.filter((r) => !r.on && r.slot && fileDiff(r)));
      const done = results.filter((r) => r.on && r.slot);
      const crew = { added: [], left: [], roles: {}, names: {}, details: {} };
      ((found && found.changes) || []).filter((c) => c.decision === 'ok').forEach((c) => { crew.roles[c.i] = c.to; });
      // workers on the list, checked one at a time: what the user changed of their details
      if (found && found.w) batch.filter((q) => q.i != null && q.ok).forEach((q) => {
        const v = q.prof || {}, w = q.was || {}, dd = {};
        if (v.role !== w.role) crew.roles[q.i] = M.esc(v.role);
        if (v.name && v.name !== w.name) crew.names[q.i] = M.esc(v.name.trim());
        ['birth', 'nationality', 'tax', 'ss', 'address', 'since'].forEach((f) => { if (v[f] !== w[f]) dd[f] = v[f]; });
        if (Object.keys(dd).length) crew.details[q.i] = dd;
        if (v.type !== w.type || v.no !== w.no || v.valid !== w.valid) M.saveId(q.i, { type: v.type, no: v.no, valid: v.valid });
      });
      // on a list: everyone it names who's on the worker list, and the new ones added
      const onList = (q) => q.decision === 'ok' || !!(found && found.w && q.i != null);
      // the new people the user added, at the end of the list, with the ID ALMA read
      const fresh = found ? found.people.filter((q) => q.i == null && q.decision === 'ok' && !isR(q)) : [];
      // the new machines, at the end of the equipment list, with what the register said of them
      const freshMs = found ? found.people.filter((q) => q.i == null && q.decision === 'ok' && isM(q)) : [];
      // the new products, at the end of the product list, with what the list said of them
      const freshPs = found ? found.people.filter((q) => q.i == null && q.decision === 'ok' && isP(q)) : [];
      fresh.forEach((q) => { const v = q.prof || {}; crew.added.push([q.name, q.role || '', q.type, q.no, q.valid, M.today(), { birth: v.birth || '', nationality: v.nationality || '', tax: v.tax || '', ss: v.ss || '', address: v.address || '', since: v.since || '' }]); });
      done.forEach((r, j) => {
        const s = r.slot, at = s.fresh ? s.fresh.ni : s.i, k = results.indexOf(r);
        // who a list names: the workers it covers, as each one's file shows it
        const x = found && found.per[k];
        if (x && x.list && !x.eq && !x.pr) M.saveList(s.code, x.people.filter(onList).map((q) => (q.i == null ? q.ni : q.i)));
        if (s.code === 'PR-REG') { M.savePrRegister({ file: r.file.name, on: M.today(), n: x && x.list ? x.people.filter((q) => q.decision === 'ok').length : 0 }); if (window.CMFiles) window.CMFiles.put('PR-REG', r.file); return; }
        if (s.code === 'EQ-REG') { M.saveEqRegister({ file: r.file.name, on: M.today(), n: x && x.list ? x.people.filter((q) => q.decision === 'ok').length : 0 }); if (window.CMFiles) window.CMFiles.put('EQ-REG', r.file); return; }
        if (s.code === 'ID') { M.saveId(at, { type: s.fresh ? s.fresh.type : plain(M.PERSON[at].id[0]), no: refOf(s, r), valid: r.read.valid, file: r.file.name, on: M.today() }); if (window.CMFiles) window.CMFiles.put(`ID#${at}`, r.file); return; }
        if (EXTRA_D[s.code]) { M.saveExtra(s.code, at, { valid: r.read.valid, file: r.file.name, on: M.today() }); if (window.CMFiles) window.CMFiles.put(`${s.code}#${at}`, r.file); return; }
        if (s.code === 'WK-REG') { M.saveRegister({ file: r.file.name, on: M.today(), n: x && x.list ? x.people.filter(onList).length : 0 }); if (window.CMFiles) window.CMFiles.put('WK-REG', r.file); return; }
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
      const nDet = new Set(Object.keys(crew.names).concat(Object.keys(crew.details))).size;
      const nCrew = crew.added.length + crew.left.length + Object.keys(crew.roles).length + nDet, nEq = freshMs.length, nPr = freshPs.length;
      if (found && found.manual) { M.saveCrew(crew); try { sessionStorage.setItem('cm-upload-toast', `${esc(found.people[0].name)} added to your worker list.`); } catch (e) {} location.reload(); return; }
      if (kept.size || nCrew || nEq || nPr) {
        const parts = [done.length ? `${done.length} document${done.length === 1 ? '' : 's'} saved` : 'Nothing replaced'];
        if (kept.size) parts.push(`${kept.size} kept as ${kept.size === 1 ? 'it was' : 'they were'}`);
        if (nEq) parts.push(`${nEq} machine${nEq === 1 ? '' : 's'} added`);
        if (nPr) parts.push(`${nPr} product${nPr === 1 ? '' : 's'} added`);
        if (nCrew) parts.push(`worker list updated (${[crew.added.length && `${crew.added.length} added`, crew.left.length && `${crew.left.length} left`, Object.keys(crew.roles).length && `${Object.keys(crew.roles).length} new role`, nDet && `${nDet} with new details`].filter(Boolean).join(', ')})`);
        const msg = parts.join(' &middot; ') + '.';
        // the crew is part of how the pages are drawn: they come back with it, and the message after
        if (nCrew || nEq || nPr) {
          if (nEq) M.saveMachines(freshMs.map((q) => Object.assign({}, q.prof || q.mach, { on: M.today() })));
          if (nPr) M.saveProducts(freshPs.map((q) => Object.assign({}, q.prof || q.prod, { on: M.today() })));
          if (nCrew) M.saveCrew(crew);
          try { sessionStorage.setItem('cm-upload-toast', msg); } catch (e) {} location.reload(); return;
        }
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
      if (t('[data-back]')) { closePeek(); step = 1; files = files.filter((f) => !f.sim); if (window.CMAlmaJob) window.CMAlmaJob.clear(); paint(); return; }
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
      if (t('[data-pck]')) { const b = t('[data-pck]'), q = found.people.find((x) => x.key === b.dataset.pck); q.decision = b.checked ? 'ok' : 'no'; const at = $('cmu-body').scrollTop; paint(); $('cmu-body').scrollTop = at; el.querySelector(`[data-pck="${q.key}"]`)?.focus({ preventScroll: true }); return; }
      if (t('[data-pall]')) { const b = t('[data-pall]'), on = b.checked; pickable().filter(wMatch).forEach((q) => { q.decision = on ? 'ok' : 'no'; }); const at = $('cmu-body').scrollTop; paint(); $('cmu-body').scrollTop = at; el.querySelector('[data-pall]')?.focus({ preventScroll: true }); return; }
      if (t('[data-manual]')) { manual = manual || { prof: Object.fromEntries(PF.map(([f]) => [f, f === 'type' ? 'Citizen card' : ''])) }; step = 'manual'; paint(); el.querySelector('[data-mf="name"]')?.focus(); return; }
      if (t('[data-mback]')) { step = 1; paint(); return; }
      if (t('[data-madd]')) {
        const v = manual.prof; if (!v.name.trim()) return;
        const q = { key: 'manual', i: null, name: v.name.trim(), type: v.type, no: v.no, valid: v.valid, role: v.role, prof: Object.assign({}, v, { name: v.name.trim() }), files: [], lists: [], decision: 'ok', edited: true };
        found = { people: [q], per: [], changes: [], asked: false, manual: true }; results = []; save(); return;
      }
      // the worker step's: two names one person or two; Continue; open a detail or a document; Confirm; move on
      if (t('[data-usame]') || t('[data-utwo]') || t('[data-uundo]')) { const b = t('[data-usame]') || t('[data-utwo]') || t('[data-uundo]'), u = found.unsure[+(b.dataset.usame || b.dataset.utwo || b.dataset.uundo)]; u.decision = b.dataset.usame ? 'same' : b.dataset.utwo ? 'two' : null; keep(); return; }
      if (t('[data-pgo]') && found && found.w) { mergeSame(); if (chosen().length) readDetails(); return; }
      if (t('[data-wopen]')) { const v = t('[data-wopen]').dataset.wopen, key = v === 'p' ? 'p' : +v; wOpen = wOpen === key ? null : key; keep(); if (wOpen == null) closePeek(); else peekFor(wOpen); return; }
      if (t('[data-wprev]')) { wGo(wi - 1); return; }
      if (t('[data-wnext]')) { wGo(wi + 1); return; }
      if (t('[data-wppeek]')) { peekFor('p'); return; }
      if (t('[data-wdpeek]')) { openPeek('r:' + t('[data-wdpeek]').dataset.wdpeek); return; }
      if (t('[data-pacc]')) { Object.assign(batch[wi], { regOk: true, checked: true }); keep(); if (peek === batch[wi].key) paintPeek(); return; }
      if (t('[data-pundo]')) { Object.assign(batch[wi], { regOk: false, checked: false }); keep(); if (peek === batch[wi].key) paintPeek(); return; }
      if (t('[data-wdacc]')) { const k = +t('[data-wdacc]').dataset.wdacc; if (!canAcc(results[k])) return; Object.assign(results[k], { ok: true, checked: true }); keep(); if (peek === 'r:' + k) paintPeek(); return; }
      if (t('[data-wdundo]')) { const k = +t('[data-wdundo]').dataset.wdundo; Object.assign(results[k], { ok: false, checked: false }); keep(); if (peek === 'r:' + k) paintPeek(); return; }
      // Accept all: every document that doesn't need them; a low-confidence one is theirs to accept on its own
      if (t('[data-wdall]')) { const q = batch[wi]; docsOf(q).forEach((r) => { if (r.on && !r.ok && !dNeeds(r)) r.ok = true; }); if (q.lists.length && !pNeeds(q)) q.regOk = true; keep(); return; }
      if (t('[data-wdunall]')) { const q = batch[wi]; docsOf(q).forEach((r) => { r.ok = false; }); q.regOk = false; keep(); return; }
      if (t('[data-wdout]')) { const k = +t('[data-wdout]').dataset.wdout; Object.assign(results[k], { on: false, ok: false }); if (peek === 'r:' + k) closePeek(); keep(); return; }
      if (t('[data-wdin]')) { results[+t('[data-wdin]').dataset.wdin].on = true; keep(); return; }
      if (t('[data-wkback]')) { if (wi > 0) wGo(wi - 1); else { closePeek(); step = 'who'; paint(); } return; }
      if (t('[data-wkok]')) { Object.assign(batch[wi], { ok: true, skip: false }); if (batch.some((x) => !x.ok && !x.skip)) nextW(); else keep(); return; }
      if (t('[data-wkundo]')) { Object.assign(batch[wi], { ok: false, skip: false }); keep(); return; }
      if (t('[data-wknext]')) { nextW(); return; }
      if (t('[data-wkskip]')) { Object.assign(batch[wi], { ok: false, skip: true }); if (batch.some((x) => !x.ok && !x.skip)) nextW(); else keep(); return; }
      if (t('[data-pgo]')) { if (found.people.some((q) => q.i == null && q.decision === 'ok')) readDetails(); else if (roleChanges().length) { step = 'details'; paint(); $('cmu-body').scrollTop = 0; } else { fileThem(false); $('cmu-body').scrollTop = 0; } return; }
      if (t('[data-wback]')) { found.people.forEach((q) => { q.editing = false; }); step = found.asked ? 'who' : 1; paint(); return; }
      if (t('[data-wgo]')) { found.people.forEach((q) => { if (q.i == null && q.out) q.decision = 'no'; }); fileThem(false); $('cmu-body').scrollTop = 0; return; }
      const wq = (sel, k) => found.people.find((x) => x.key === t(sel).dataset[k]);
      if (t('[data-wpeek]')) { openPeek(t('[data-wpeek]').dataset.wpeek); return; }
      if (t('[data-waccept]')) { wq('[data-waccept]', 'waccept').ok = true; paint(); return; }
      if (t('[data-wunaccept]')) { wq('[data-wunaccept]', 'wunaccept').ok = false; paint(); return; }
      if (t('[data-wreject]')) { Object.assign(wq('[data-wreject]', 'wreject'), { out: true, ok: false }); paint(); return; }
      if (t('[data-wundo]')) { wq('[data-wundo]', 'wundo').out = false; paint(); return; }
      if (t('[data-waccept-all]')) { found.people.forEach((q) => { if (q.i == null && q.decision === 'ok' && !q.out) q.ok = true; }); roleChanges().forEach(([c]) => { if (c.decision !== 'no') c.decision = 'ok'; }); paint(); return; }
      if (t('[data-wunaccept-all]')) { found.people.forEach((q) => { if (q.i == null) q.ok = false; }); roleChanges().forEach(([c]) => { if (c.decision === 'ok') c.decision = null; }); paint(); return; }
      const cj = (sel, k) => found.changes[+t(sel).dataset[k]];
      if (t('[data-caccept]')) { cj('[data-caccept]', 'caccept').decision = 'ok'; paint(); return; }
      if (t('[data-creject]')) { cj('[data-creject]', 'creject').decision = 'no'; paint(); return; }
      if (t('[data-cundo]')) { cj('[data-cundo]', 'cundo').decision = null; paint(); return; }
      if (t('[data-wedit]')) { const q = found.people.find((x) => x.key === t('[data-wedit]').dataset.wedit); found.people.forEach((x) => { x.editing = x === q; }); paint(); el.querySelector('.cmu-r.is-editing input')?.focus(); return; }
      if (t('[data-wcancel]')) { const q = found.people.find((x) => x.key === t('[data-wcancel]').dataset.wcancel); q.editing = false; paint(); return; }
      if (t('[data-wsave]')) {
        // what was typed over what she read (a date picker's 2027-01-17 kept as 17 Jan 2027)
        const q = found.people.find((x) => x.key === t('[data-wsave]').dataset.wsave), card = t('[data-wsave]').closest('.cmu-r'), v = profOf(q);
        fieldsFor(q).forEach(([f, , date]) => { const i = card.querySelector(`input[name="${f}"]`); if (!i) return; const raw = i.value.trim(); v[f] = date && raw ? fromIso(raw) : raw; });
        q.edited = true;
        if (isM(q)) { q.name = titleOf(q); q.no = v.serial; }
        else if (isP(q)) { q.name = v.name || q.name; v.name = q.name; q.type = v.maker; q.no = v.ref; }
        else { if (v.name) q.name = v.name; else v.name = q.name; q.role = v.role; q.type = v.type; q.no = v.no; q.valid = v.valid; q.roleFrom = ''; }
        q.editing = false; paint(); return;
      }
      // anywhere else on a card: its preview, as in the setup
      const card = t('.cmu-r[data-card]');
      if (card && !card.classList.contains('is-editing') && !card.classList.contains('is-off') && !t('button, a, input, select, textarea, label')) openPeek(+card.dataset.card);
    });
    el.addEventListener('keydown', (e) => { if (e.target.id === 'cmu-drop' && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.click(); } });
    el.addEventListener('input', (e) => {
      if (e.target.matches('[data-mf]')) {
        const f = e.target.dataset.mf, raw = e.target.value; manual.prof[f] = e.target.type === 'date' ? (raw ? fromIso(raw) : '') : raw;
        const ok = !!manual.prof.name.trim(), b = el.querySelector('[data-madd]'), l = el.querySelector('.cmu-foot-l');
        if (b) b.disabled = !ok; if (l) l.textContent = ok ? '' : 'Give their full name to add them';
        return;
      }
      if (e.target.matches('[data-pf]')) {
        const q = batch[wi], f = e.target.dataset.pf, raw = e.target.value; profOf(q)[f] = e.target.type === 'date' ? (raw ? fromIso(raw) : '') : raw;
        (q.fe = q.fe || new Set()).add(f);
        if (f === 'name') { const b = el.querySelector('[data-wname]'); if (b) b.textContent = raw; }
        wLive(`p:${f}`, 'p'); if (peek === q.key) paintPeek(); return;
      }
      if (e.target.matches('[data-df]')) {
        const [k, f] = e.target.dataset.df.split(':'), r = results[+k], raw = e.target.value;
        dSet(r, f, e.target.type === 'date' ? (raw ? fromIso(raw) : '') : raw);
        if (f === 'name' && idDoc(r)) { const nm = el.querySelector('.cmu-wk-nm'); if (nm) nm.value = raw; }
        wLive(`${k}:${f}`, +k); if (peek === 'r:' + k) paintPeek(); return;
      }
      if (e.target.matches('[data-dq]')) {
        dq = e.target.value.trim();
        const P = found.people.filter((q) => q.i == null && q.decision === 'ok'), m = (q) => !dq || fold(`${profOf(q).name} ${profOf(q).no}`).includes(fold(dq));
        P.forEach((q) => { const c = el.querySelector(`[data-dcard="${q.key}"]`); if (c) c.hidden = !m(q); });
        const C = roleChanges(), cm = (c) => !dq || fold(plain(c.name)).includes(fold(dq));
        C.forEach(([c, j]) => { const x = el.querySelector(`[data-ccard="${j}"]`); if (x) x.hidden = !cm(c); });
        const none = el.querySelector('.cmu-dnone'); if (none) none.hidden = P.some(m) || C.some(([c]) => cm(c));
        return;
      }
      if (!e.target.matches('[data-wq]')) return;
      wq = e.target.value.trim();
      const nw = pickable();
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
      const ow = e.target.closest('[data-wown]');
      if (ow) {
        // moved to another worker: any on the list, new or not; someone not being checked yet joins the ones being checked
        const k = +ow.dataset.wown, r = results[k], [t0, n] = ow.value.split(':'); let q2;
        if (t0 === 'b') q2 = batch[+n];
        else {
          const i = +n, p = M.PERSON[i];
          q2 = found.people.find((x) => x.i === i && !isR(x)) || (() => { const x = { key: 'w' + i, i, name: plain(p.name), type: plain(p.id[0]), no: plain(p.id[1]), valid: p.id[2], role: plain(p.role), files: [], lists: [], decision: 'ok' }; found.people.push(x); return x; })();
          q2.decision = 'ok'; if (!batch.includes(q2)) batch.push(q2);
        }
        const from = r.owner; if (!q2 || q2 === from) return;
        r.owner = q2; const L = slotsOf(q2), fw = fileWords(r.file);
        reslot(r, (r.slot && L.find((x) => x.code === r.slot.code)) || L.map((x) => [x, docScore(x, fw)]).filter(([, sc]) => sc > 0).sort((a, b) => b[1] - a[1]).map(([x]) => x)[0] || null);
        from.moved = `${esc(r.file.name)} moved to ${esc(profOf(q2).name || q2.name)}.`;
        if (wOpen === k) wOpen = null; closePeek(); keep(); return;
      }
      const wt = e.target.closest('[data-wtype]');
      if (wt) { const k = +wt.dataset.wtype; reslot(results[k], pool.find((x) => x.key === wt.value) || null); keep(); peekFor(k); return; }
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
