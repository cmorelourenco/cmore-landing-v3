/* The companies you supply, and what you let each one see (My clients, clients.html). Every
   client has one or more consents: the documents of yours it can see, for all your work with it or
   for one project. A consent is given (they see those documents, as they are today: in order,
   expiring or in red), asked for (waiting for your answer), stopped by you, or declined.
   The documents are your own, so what a client sees is what Documents shows (js/doc-model.js).
   The three requests the company homepage and its consents card answer (js/co-profile.js) are the
   same ones here: answering either place answers both. Everything else you do here is kept for the
   tab. Only the demo company (Miguel's) has clients yet.
   Each document keeps its versions (js/doc-model.js): a client sees the one in place when it was
   given consent and every one uploaded while the consent stood, and keeps those once it's stopped
   (CM_VERSIONS.seen). A consent remembers when it stood: periods [{ from, to }].
   window.CM_CLIENTS: list(), byId(id), stats(client), setState(consentId, state), CATS, TONE, today(). */
window.CM_CLIENTS = (() => {
  const M = window.DOC_MODEL, P = window.CO_PROFILE, V = window.CM_VERSIONS;
  if (!M) return null;
  const OPEN = (window.CM_SOON_OPEN || []).includes('clients');
  const slug = (n) => n.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const today = () => { const t = new Date(); return `${t.getDate()} ${MON[t.getMonth()]} ${t.getFullYear()}`; };
  const ago = (n) => { const t = new Date(Date.now() - n * 864e5); return `${t.getDate()} ${MON[t.getMonth()]} ${t.getFullYear()}`; };

  // [name, sector, city, contact, client since, consents]
  //   consent: [title, project or null, granted (or asked, when pending), state, codes, on (stopped / declined), profile name (a request the homepage answers too)]
  const RAW = OPEN ? [
    ['CUF', 'Healthcare', 'Lisbon', 'fornecedores@cuf.pt', '2024', [
      ['Company & legal', 'Hospital CUF Porto, new wing', '4 Sep 2025', 'given', ['CO-01', 'CO-02', 'CO-03', 'CO-06', 'CO-07'], null, 'CUF'],
      ['Insurance', 'Hospital CUF Porto, new wing', '4 Sep 2025', 'given', ['CO-08', 'CO-10', 'CO-11'], null, 'CUF']]],
    ['Mota-Engil', 'Construction and engineering', 'Porto', 'compras@mota-engil.pt', '2023', [
      ['Health and safety', 'A4 tunnel works', '10 Feb 2026', 'given', ['CO-12', 'CO-13', 'CO-14', 'UN-11', 'UN-12']],
      ['Insurance and tax', null, ago(2), 'pending', ['CO-10', 'CO-08', 'CO-06'], null, 'Mota-Engil']]],
    ['Sonae MC', 'Retail', 'Maia', 'suppliers@sonaemc.com', '2025', [
      ['Insurance', null, ago(6), 'pending', ['CO-08', 'CO-10', 'CO-11', 'UN-27'], null, 'Sonae MC']]],
    ['Teixeira Duarte', 'Construction', 'Lisbon', 'subempreiteiros@teixeiraduarte.pt', '2022', [
      ['Company & legal', null, '12 Mar 2026', 'given', ['CO-01', 'CO-02', 'CO-06', 'CO-19']],
      ['Workers on site', 'Metro do Porto, Linha Rubi', '2 May 2026', 'given', ['WK-01', 'WK-11', 'WK-12', 'WK-15']]]],
    ['Casais', 'Construction', 'Braga', 'qualidade@casais.pt', '2025', [
      ['Licences and certifications', null, '20 Jun 2025', 'given', ['CO-03', 'CO-05', 'CO-21']],
      ['Equipment on site', 'Braga stadium roof', '1 Aug 2026', 'given', ['EQ-01', 'EQ-03', 'EQ-04']]]],
    ['Câmara Municipal do Porto', 'Public sector', 'Porto', 'contratacao@cm-porto.pt', '2026', [
      ['Public tender documents', 'Escola do Cerco, refurbishment', '2 Feb 2026', 'given', ['CO-06', 'CO-07', 'CO-23', 'UN-15', 'UN-17']]]],
    ['Lidl Portugal', 'Retail', 'Sintra', 'fornecedores@lidl.pt', '2024', [
      ['Company & legal', null, '18 Nov 2024', 'given', ['CO-01', 'CO-02', 'CO-06', 'CO-19']],
      ['Insurance', 'Lidl Maia, new store', '3 Mar 2026', 'given', ['CO-08', 'CO-11']]]],
    ['DST Group', 'Construction', 'Braga', 'procurement@dstsgps.com', '2021', [
      ['Company & legal', null, '15 Jan 2025', 'stopped', ['CO-01', 'CO-02', 'CO-06'], '20 Aug 2026']]],
  ] : [];

  // how a document looks to the client: your status, in their words
  const TONE = { valid: 'ok', na: 'ok', expiring: 'pend', processing: 'pend', attention: 'pend', filemissing: 'pend', missing: 'bad', expired: 'bad', rejected: 'bad', notuploaded: 'bad' };
  const SEEN = { notuploaded: 'missing' }; // not uploaded, to them, is missing
  const catOf = (d) => (d.area === 'workers' ? 'Workers on site' : d.area === 'equipment' ? 'Equipment on site' : d.section);
  const CATS = ['Identification and registration', 'Tax and social security', 'Licences', 'Financial', 'Declarations', 'Certifications', 'Insurance', 'Health and safety',
    'ESG and sustainability', 'Information security', 'Public contracts', 'Workers on site', 'Equipment on site'];
  const doc = (code) => {
    const d = M.DOCS.find((x) => x.code === code); if (!d) return null;
    const status = SEEN[d.status] || d.status;
    return { src: d, code, id: d.id, name: d.name, section: d.section, cat: catOf(d), status, tone: TONE[d.status] || 'neu', valid: d.valid && d.valid !== '—' ? d.valid : (status === 'missing' ? 'Not on file' : '—'), requirement: d.requirement };
  };

  // what you did here, kept for the tab: { consentId: { state, on } }
  const KEY = 'cm-clients' + (document.documentElement.dataset.persona === 'beatriz' ? '-beatriz' : '');
  const mine = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const keep = (m) => { try { sessionStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} };
  // documents you switched off under a consent you keep: { consentId: { code: the day you did } }
  const OFF_KEY = KEY + '-off';
  const offs = () => { try { return JSON.parse(sessionStorage.getItem(OFF_KEY)) || {}; } catch (e) { return {}; } };
  const keepOff = (m) => { try { sessionStorage.setItem(OFF_KEY, JSON.stringify(m)); } catch (e) {} };
  // the homepage's requests: their state there is the state here
  const FROM_P = { accepted: 'given', pending: 'pending', declined: 'declined', stopped: 'stopped' };
  const TO_P = { given: 'accepted', pending: 'pending', declined: 'declined', stopped: 'stopped' };
  const profile = () => (P ? P.load() : null);

  // when a consent stood: given opens a period, stopping or declining closes it
  const move = (periods, state, on) => {
    const ps = (periods || []).map((p) => Object.assign({}, p)), last = ps[ps.length - 1], open = last && !last.to;
    if (state === 'given' && !open) ps.push({ from: on, to: null });
    if ((state === 'stopped' || state === 'declined') && open) last.to = on;
    return ps;
  };
  // the homepage holds one state per client: given if any of its consents there is, else the first one's
  const summary = (states) => (states.includes('given') ? 'given' : states.includes('pending') ? 'pending' : states[0]);
  const build = () => {
    const m = mine(), pr = profile(), pc = (n) => pr && pr.consents.find((x) => x.name === n), off = offs();
    return RAW.map(([name, sector, city, email, since, cs]) => {
      const id = slug(name);
      // what you did here, consent by consent
      let consents = cs.map(([title, project, granted, state, codes, on, pname], i) => {
        const cid = `${id}-${i}`, o = m[cid];
        const periods = state === 'given' ? [{ from: granted, to: null }] : state === 'stopped' ? [{ from: granted, to: on }] : [];
        const c = { id: cid, title, project, granted, asked: state === 'pending' ? granted : '', state, on: on || '', profile: pname || '', periods, docs: codes.map(doc).filter(Boolean) };
        c.docs.forEach((d) => { d.off = (off[cid] && off[cid][d.code]) || ''; });
        if (o) { c.state = o.state; c.on = o.on; c.periods = o.periods || move(periods, o.state, o.on); if (o.state === 'given' && state !== 'given') c.granted = o.on; }
        return c;
      });
      // answered on the homepage since (it no longer matches): that answer, for all of them
      const linked = consents.filter((c) => c.profile), q = linked.length && pc(linked[0].profile);
      if (q && FROM_P[q.state] && FROM_P[q.state] !== summary(linked.map((c) => c.state))) {
        linked.forEach((c) => { const was = c.state; c.state = FROM_P[q.state]; if (c.state !== was) { c.on = today(); c.periods = move(c.periods, c.state, c.on); if (c.state === 'given') c.granted = today(); } });
      }
      // each document, with the versions this client sees of it: under any of its consents that covers it
      const periodsOf = (code) => consents.filter((k) => k.docs.some((d) => d.code === code)).flatMap((k) => k.periods)
        .sort((a, b) => (V ? V.parse(a.from) - V.parse(b.from) : 0));
      consents.forEach((k) => k.docs.forEach((d) => {
        d.versions = V && M.seenBy ? M.seenBy(d.src, periodsOf(d.code)) : [];
        d.kept = d.versions.find((v) => v.seen) || null; // the newest they see
      }));
      return { id, name, sector, city, email, since, consents };
    });
  };
  let LIST = build();
  const list = () => LIST;
  const byId = (id) => LIST.find((c) => c.id === id) || null;

  // where a client stands, and the documents it sees (once each, under however many consents)
  const stats = (c) => {
    const on = (x) => x.state === 'given' && x.docs.some((d) => !d.off);
    const seen = [...new Map(c.consents.filter((x) => x.state === 'given').flatMap((x) => x.docs).filter((d) => !d.off).map((d) => [d.code, d])).values()];
    const n = (t) => seen.filter((d) => d.tone === t).length;
    return { shared: seen.length, ok: n('ok'), soon: n('pend'), bad: n('bad'), pct: seen.length ? Math.round((n('ok') / seen.length) * 100) : 0,
      given: c.consents.filter(on).length, pending: c.consents.filter((x) => x.state === 'pending').length, stopped: c.consents.filter((x) => x.state === 'stopped' || x.state === 'declined').length };
  };

  // share, stop, share again, decline: here, and on the homepage when it's one of its requests
  const setState = (cid, state) => {
    const c = LIST.find((x) => x.consents.some((k) => k.id === cid)), k = c && c.consents.find((x) => x.id === cid); if (!k) return null;
    const m = mine(); m[cid] = { state, on: today(), periods: move(k.periods, state, today()) }; keep(m);
    if (state === 'given') { const o = offs(); if (o[cid]) { delete o[cid]; keepOff(o); } } // shared again: all of it
    // and on the homepage, where it's one of its requests: the client's state as a whole (first, so
    // reading it back below agrees with what was just done)
    const linked = c.consents.filter((x) => x.profile);
    if (k.profile && P && linked.length) {
      const pr = P.load(), q = pr.consents.find((x) => x.name === k.profile), to = TO_P[summary(linked.map((x) => (x.id === cid ? state : x.state)))];
      if (q && q.state !== to) { q.state = to; if (to === 'accepted') q.when = P.today ? P.today() : `Since ${today()}`; P.save(pr); }
    }
    LIST = build();
    document.dispatchEvent(new CustomEvent('cm-clients'));
    return byId(c.id);
  };

  // one document, or several, switched off or back on under a consent that stays: they keep the
  // version they saw of one switched off, and nothing newer reaches them
  const setDocs = (cid, codes, share) => {
    const c = LIST.find((x) => x.consents.some((k) => k.id === cid)); if (!c) return null;
    const o = offs(), m = o[cid] || {};
    [].concat(codes).forEach((code) => { if (share) delete m[code]; else if (!m[code]) m[code] = today(); });
    if (Object.keys(m).length) o[cid] = m; else delete o[cid];
    keepOff(o); LIST = build();
    document.dispatchEvent(new CustomEvent('cm-clients'));
    return byId(c.id);
  };

  return { list, byId, stats, setState, setDocs, CATS, TONE, today, slug, OPEN };
})();
