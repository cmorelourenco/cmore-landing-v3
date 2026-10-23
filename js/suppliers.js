/* The demo company's suppliers, and what each has agreed to let it see. A supplier gives a
   consent for a set of its documents (its company papers, its insurance, the workers it sends to a
   site…), for all of your projects or for one; while the consent stands, you see those documents —
   their status and expiry, kept current by the supplier. A request you sent and they haven't
   answered yet shows as pending.
   window.CM_SUPPLIERS: list(), byId(id), docsOf(consent), stats(supplier).
   Prototype: made up, the same every time; document names and requirements come from the catalog. */
window.CM_SUPPLIERS = (() => {
  const C = window.DOC_CATALOG || { docs: [], labels: { requirement: {} } };
  const byCode = Object.fromEntries(C.docs.map((d) => [d.code, d]));
  const slug = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).join('-');
  const PROJECTS = { sj: 'São João Hospital, east wing', en13: 'EN13 resurfacing, Vila do Conde', go: 'Garcia de Orta school renovation', qb: 'Quinta da Boavista apartments' };

  // what a consent can cover, and the documents that come with it
  const SETS = {
    legal: ['Company & legal', ['CO-01', 'CO-02', 'CO-06', 'CO-07', 'CO-03']],
    insurance: ['Insurance', ['CO-08', 'CO-10', 'CO-11']],
    workers: ['Workers on site', ['WK-01', 'WK-02', 'WK-11', 'WK-15']],
    hs: ['Health & safety', ['CO-12', 'CO-13', 'WK-03']],
    equipment: ['Equipment on site', ['EQ-01', 'EQ-03', 'EQ-04']],
    certs: ['Certifications', ['CO-21', 'CO-21.1', 'CO-21.2']],
  };
  // [name, city, services, workers, since, NIPC, contact, consents, problems]
  //   consents: [set, project (or null for all projects), granted, state]  — state: given | pending
  //   problems: { code: [status, expiry, note] } — anything not valid
  const RAW = [
    ['Madeiras do Norte', 'Paredes', ['Lumber supply', 'Carpentry'], 21, '2026', '509 812 334', 'geral@madeirasdonorte.pt',
      [['legal', null, '12 Feb 2026', 'given'], ['insurance', null, '12 Feb 2026', 'given'], ['workers', 'sj', '3 Mar 2026', 'given'], ['hs', 'sj', '14 Oct 2026', 'pending']],
      { 'CO-08': ['expired', '30 Sep 2026', 'Expired 30 September — ALMA asked them for the renewed one.'], 'WK-11': ['missing', '', 'Two workers on São João have no fitness certificate.'], 'CO-03': ['expiring', '9 Nov 2026', ''] }],
    ['Proteção Incêndio Norte', 'Maia', ['Fire protection'], 30, '2026', '514 337 920', 'obras@pinorte.pt',
      [['legal', null, '20 Jan 2026', 'given'], ['insurance', null, '20 Jan 2026', 'given'], ['certs', null, '20 Jan 2026', 'given']],
      { 'CO-21.1': ['processing', '', 'Renewal sent — waiting for the certification body.'], 'CO-10': ['expiring', '2 Nov 2026', ''] }],
    ['Siderúrgica do Ave', 'Guimarães', ['Welding', 'Steel erection'], 48, '2025', '507 445 118', 'comercial@siderave.pt',
      [['legal', null, '5 Jun 2025', 'given'], ['insurance', null, '5 Jun 2025', 'given'], ['equipment', 'sj', '8 Sep 2025', 'given'], ['workers', 'sj', '8 Sep 2025', 'given']], {}],
    ['Betões do Douro', 'Penafiel', ['Concrete', 'Masonry'], 62, '2025', '502 918 667', 'betoes@betoesdouro.pt',
      [['legal', null, '2 Apr 2025', 'given'], ['insurance', null, '2 Apr 2025', 'given'], ['certs', null, '2 Apr 2025', 'given']], { 'CO-06': ['expiring', '28 Oct 2026', ''] }],
    ['Escavações Leça', 'Matosinhos', ['Excavation', 'Demolition'], 27, '2026', '513 204 551', 'geral@escavacoesleca.pt',
      [['legal', null, '18 Mar 2026', 'given'], ['equipment', 'en13', '18 Mar 2026', 'given'], ['insurance', null, '10 Oct 2026', 'pending']], {}],
    ['Andaimes Gaia', 'Vila Nova de Gaia', ['Scaffolding'], 15, '2026', '515 880 239', 'andaimes@andaimesgaia.pt',
      [['legal', null, '7 May 2026', 'given'], ['equipment', 'qb', '7 May 2026', 'given']], {}],
    ['Vidros da Foz', 'Porto', ['Glazing'], 12, '2026', '516 102 745', 'info@vidrosdafoz.pt',
      [['legal', null, '30 Jun 2026', 'given']], {}],
    ['Coberturas Minho', 'Viana do Castelo', ['Roofing', 'Insulation'], 24, '2025', '508 776 412', 'geral@coberturasminho.pt',
      [['legal', null, '11 Nov 2025', 'given'], ['insurance', null, '11 Nov 2025', 'given'], ['workers', 'go', '2 Feb 2026', 'given']], {}],
    ['Canalizações do Porto', 'Porto', ['Plumbing'], 13, '2026', '514 965 380', 'obras@canalizacoesporto.pt',
      [['legal', null, '9 Sep 2026', 'pending']], {}],
    ['Eletro Norte', 'Braga', ['Electrical'], 31, '2026', '511 448 096', 'geral@eletronorte.pt',
      [['legal', null, '1 Aug 2026', 'given'], ['insurance', null, '1 Aug 2026', 'given'], ['workers', 'sj', '1 Aug 2026', 'given']], {}],
  ];
  const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hash = (s) => [...String(s)].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) % 100003, 11);
  // an expiry for a valid document, the same every time: months ahead, or none for one that doesn't expire
  const validTo = (code, who) => {
    const d = byCode[code];
    if (!d || /no expiry/i.test(d.expiryRule || '')) return 'No expiry';
    const h = hash(code + who), t = new Date(2026, 10 + (h % 9), 1 + (h % 27));
    return `${t.getDate()} ${M[t.getMonth()]} ${t.getFullYear()}`;
  };

  const LIST = RAW.map(([name, city, services, workers, since, nipc, email, consents, problems]) => {
    const id = slug(name);
    return {
      id, name, city, services, workers, since, nipc, email,
      consents: consents.map(([set, project, granted, state], i) => ({
        id: `${id}-${i}`, title: SETS[set][0], codes: SETS[set][1], project: project ? PROJECTS[project] : null, granted, state,
        docs: SETS[set][1].filter((c) => byCode[c]).map((c) => {
          const p = problems[c];
          return { code: c, name: byCode[c].name.en, section: byCode[c].section.en, requirement: C.labels.requirement[byCode[c].requirement] || '',
            status: p ? p[0] : 'valid', valid: p ? p[1] || '—' : validTo(c, id), note: p ? p[2] : '' };
        }),
      })),
    };
  });
  const STATUS = { valid: ['Valid', 'b-ok'], expiring: ['Expiring', 'b-pend'], processing: ['Processing', 'b-neu'], missing: ['Missing', 'b-over'], expired: ['Expired', 'b-over'] };
  // what you can see of a supplier: the documents its standing consents cover, and how many need it
  const stats = (s) => {
    const seen = s.consents.filter((c) => c.state === 'given').flatMap((c) => c.docs);
    const uniq = [...new Map(seen.map((d) => [d.code, d])).values()];
    const bad = uniq.filter((d) => ['missing', 'expired'].includes(d.status)).length, soon = uniq.filter((d) => ['expiring', 'processing'].includes(d.status)).length;
    const ok = uniq.filter((d) => d.status === 'valid').length;
    return { shared: uniq.length, bad, soon, ok, pct: uniq.length ? Math.round((ok / uniq.length) * 100) : 0, given: s.consents.filter((c) => c.state === 'given').length, pending: s.consents.filter((c) => c.state === 'pending').length };
  };
  return { list: () => LIST, byId: (id) => LIST.find((s) => s.id === id) || null, stats, STATUS };
})();
