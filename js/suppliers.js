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
  // Beatriz (Veridian Harvest Co.) buys commodities: her suppliers are farms, cooperatives and mills, and
  // a consent covers one of her products where Miguel's covers one of his projects
  const BEATRIZ = document.documentElement.dataset.persona === 'beatriz';
  const PROJECTS = BEATRIZ ? { rc: 'Roasted coffee beans', cb: 'Cocoa butter', dc: 'Dark chocolate couverture, 70%', cpo: 'Crude palm oil', soy: 'Refined soybean oil', rub: 'Natural rubber sheets (RSS3)' } : { sj: 'São João Hospital, east wing', en13: 'EN13 resurfacing, Vila do Conde', go: 'Garcia de Orta school renovation', qb: 'Quinta da Boavista apartments' };

  // what a consent can cover, and the documents that come with it
  const SETS = BEATRIZ ? {
    legal: ['Company & legal', ['UN-01', 'UN-02', 'UN-03']],
    insurance: ['Insurance', ['UN-05']],
    esg: ['Sustainability', ['UN-18', 'UN-19', 'UN-22']],
    hs: ['Health & safety', ['UN-11', 'UN-12']],
    financial: ['Financial', ['UN-15', 'UN-17']],
    certs: ['Certifications', ['UN-10']],
  } : {
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
  const RAW = BEATRIZ ? [
    ['Asankragwa Cocoa Farmers', 'Tarkwa, Ghana', ['Cocoa beans'], 840, '2025', 'C0004518272', 'office@asankragwacocoa.org',
      [['legal', null, '4 Mar 2025', 'given'], ['esg', 'cb', '4 Mar 2025', 'given'], ['hs', 'cb', '19 Oct 2026', 'pending']],
      { 'UN-22': ['missing', '', 'Geolocation is missing for 3 plots. ALMA asked them for it.'], 'UN-19': ['expired', '30 Sep 2026', 'Expired 30 September: the 2026 report is on its way.'] }],
    ['Sumatra Agro Palm', 'Medan, Indonesia', ['Crude palm oil', 'Palm kernel'], 1260, '2024', '01.337.815.2-121.000', 'trade@sumatraagropalm.co.id',
      [['legal', null, '11 Jan 2024', 'given'], ['esg', 'cpo', '11 Jan 2024', 'given'], ['certs', null, '11 Jan 2024', 'given']],
      { 'UN-18': ['missing', '', 'No environmental policy shared yet.'], 'UN-10': ['expiring', '8 Nov 2026', ''] }],
    ['Kuapa Kokoo Union', 'Kumasi, Ghana', ['Cocoa beans'], 2100, '2023', 'C0001190335', 'info@kuapakokoo.com',
      [['legal', null, '2 Feb 2023', 'given'], ['esg', 'dc', '2 Feb 2023', 'given'], ['financial', null, '15 Oct 2026', 'pending']],
      { 'UN-22': ['processing', '', 'Child labour cases under remediation, updated statement in review.'] }],
    ['Cooxupé cooperative', 'Guaxupé, Brazil', ['Green coffee (Arabica)'], 1900, '2022', '20.770.566/0001-00', 'export@cooxupe.com.br',
      [['legal', null, '7 Jun 2022', 'given'], ['insurance', null, '7 Jun 2022', 'given'], ['esg', 'rc', '7 Jun 2022', 'given'], ['certs', null, '7 Jun 2022', 'given']], {}],
    ['PT Sawit Makmur', 'Pekanbaru, Indonesia', ['Fresh fruit bunches', 'Crude palm oil'], 640, '2025', '02.511.204.6-216.000', 'sales@sawitmakmur.co.id',
      [['legal', null, '20 May 2025', 'given'], ['esg', 'cpo', '20 May 2025', 'given']], { 'UN-19': ['expiring', '2 Nov 2026', ''] }],
    ['Agropecuária Rio Verde', 'Rio Verde, Brazil', ['Soybeans'], 210, '2024', '08.214.633/0001-47', 'comercial@agrorioverde.com.br',
      [['legal', null, '9 Sep 2024', 'given'], ['insurance', null, '9 Sep 2024', 'given'], ['esg', 'soy', '9 Sep 2024', 'given']], {}],
    ['Finca El Mirador', 'Huila, Colombia', ['Green coffee (Arabica)'], 35, '2025', '900.418.227-3', 'ventas@fincaelmirador.co',
      [['legal', null, '13 Aug 2025', 'given'], ['esg', 'rc', '13 Aug 2025', 'given']], {}],
    ['Tiense Suiker', 'Tienen, Belgium', ['Beet sugar'], 1100, '2023', 'BE 0401.024.618', 'sales@tiensesuiker.be',
      [['legal', null, '1 Dec 2023', 'given'], ['insurance', null, '1 Dec 2023', 'given'], ['financial', null, '1 Dec 2023', 'given'], ['certs', null, '1 Dec 2023', 'given']], { 'UN-17': ['expiring', '31 Oct 2026', ''] }],
    ['Thai Rubber Estates Ltd', 'Surat Thani, Thailand', ['Natural rubber latex'], 480, '2026', '0105548031127', 'export@thairubberestates.co.th',
      [['legal', null, '22 Jan 2026', 'given'], ['esg', 'rub', '22 Jan 2026', 'given']], {}],
    ['Madeireira Floresta Norte', 'Belém, Brazil', ['Logs (Ipê, Jatobá)'], 90, '2026', '15.902.441/0001-08', 'contato@florestanorte.com.br',
      [['legal', null, '6 Oct 2026', 'pending']], {}],
  ] : [
    ['Madeiras do Norte', 'Paredes', ['Lumber supply', 'Carpentry'], 21, '2026', '509 812 334', 'geral@madeirasdonorte.pt',
      [['legal', null, '12 Feb 2026', 'given'], ['insurance', null, '12 Feb 2026', 'given'], ['workers', 'sj', '3 Mar 2026', 'given'], ['hs', 'sj', '14 Oct 2026', 'pending']],
      { 'CO-08': ['expired', '30 Sep 2026', 'Expired 30 September. ALMA asked them for the renewed one.'], 'WK-11': ['missing', '', 'Two workers on São João have no fitness certificate.'], 'CO-03': ['expiring', '9 Nov 2026', ''] }],
    ['Proteção Incêndio Norte', 'Maia', ['Fire protection'], 30, '2026', '514 337 920', 'obras@pinorte.pt',
      [['legal', null, '20 Jan 2026', 'given'], ['insurance', null, '20 Jan 2026', 'given'], ['certs', null, '20 Jan 2026', 'given']],
      { 'CO-21.1': ['processing', '', 'Renewal sent, waiting for the certification body.'], 'CO-10': ['expiring', '2 Nov 2026', ''] }],
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
  // suppliers added in this tab (js/supplier-add.js): invited, with the documents asked of them,
  // and nothing shared until they join and give their consent. Kept for the tab, per persona.
  const ADD_KEY = 'cm-sup-added' + (BEATRIZ ? '-beatriz' : '');
  const added = () => { try { return JSON.parse(sessionStorage.getItem(ADD_KEY) || '[]') || []; } catch (e) { return []; } };
  const fromInvite = (a) => ({
    id: a.id, name: a.name, city: a.city || a.countryName, services: a.services || [], workers: null, since: a.invited.split(' ').pop(), nipc: a.code, email: a.email,
    status: 'invited', invite: a,
    consents: [{ id: `${a.id}-0`, title: 'Documents you asked for', codes: a.docs, project: null, granted: a.invited, state: 'pending',
      docs: a.docs.filter((c) => byCode[c]).map((c) => ({ code: c, name: (a.names && a.names[c]) || byCode[c].name.en, section: (a.sections && a.sections[c]) || byCode[c].section.en,
        requirement: a.required.includes(c) ? 'Mandatory' : 'Optional', status: 'missing', valid: '—', note: '' })) }],
  });
  // where each one stands: invited (hasn't joined your list yet), pending consent (joined, but hasn't
  // given you all the documents you asked for), accepted (everything asked for is shared)
  LIST.forEach((s) => { s.status = s.consents.some((c) => c.state === 'pending') ? 'pending' : 'accepted'; });
  const all = () => added().map(fromInvite).concat(LIST);
  const SUP_STATUS = { invited: ['Invited', 'b-neu'], pending: ['Pending consent', 'b-pend'], accepted: ['Accepted', 'b-ok'] };
  const addInvite = (a) => { const l = added(); l.unshift(a); try { sessionStorage.setItem(ADD_KEY, JSON.stringify(l)); } catch (e) {} };
  // companies already on C-MORE that aren't your suppliers yet, by country and code (digits only).
  // Prototype: made up, so the flow can find one.
  const ON_CMORE = [
    ['PT', '503117285', 'Pinturas Ribeiro, Lda.', 'Porto', ['Painting', 'Coatings']],
    ['PT', '510774199', 'Serralharia Costa & Filhos', 'Braga', ['Metalwork']],
    ['PT', '515223069', 'Isolamentos Atlântico', 'Aveiro', ['Insulation', 'Waterproofing']],
    ['ES', 'B36512874', 'Grúas Galicia S.L.', 'Vigo, Spain', ['Crane hire']],
    ['BR', '33401288000155', 'Fazenda Santa Clara', 'Patrocínio, Brazil', ['Green coffee (Arabica)']],
    ['US', '814472019', 'Gulf Coast Packaging Inc.', 'Houston, Texas', ['Packaging']],
  ].map(([country, code, name, city, services]) => ({ country, code, name, city, services }));
  const norm = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const lookup = (country, code) => {
    const k = norm(code);
    const mine = all().find((s) => norm(s.nipc) === k);
    if (mine) return { mine };
    const on = ON_CMORE.find((x) => x.country === country && x.code === k);
    return on ? { on } : {};
  };
  const STATUS = { valid: ['Valid', 'b-ok'], expiring: ['Expiring', 'b-pend'], processing: ['Processing', 'b-neu'], missing: ['Missing', 'b-over'], expired: ['Expired', 'b-over'] };
  // what you can see of a supplier: the documents its standing consents cover, and how many need it
  const stats = (s) => {
    const seen = s.consents.filter((c) => c.state === 'given').flatMap((c) => c.docs);
    const uniq = [...new Map(seen.map((d) => [d.code, d])).values()];
    const bad = uniq.filter((d) => ['missing', 'expired'].includes(d.status)).length, soon = uniq.filter((d) => ['expiring', 'processing'].includes(d.status)).length;
    const ok = uniq.filter((d) => d.status === 'valid').length;
    return { shared: uniq.length, bad, soon, ok, pct: uniq.length ? Math.round((ok / uniq.length) * 100) : 0, given: s.consents.filter((c) => c.state === 'given').length, pending: s.consents.filter((c) => c.state === 'pending').length };
  };
  // the words that differ between the two: what a supplier's tax number is called, and what a consent is for
  const WORDS = BEATRIZ ? { id: 'Tax ID', scope: 'products', AREAS: Object.values(SETS).map((x) => x[0]) }
    : { id: 'NIPC', scope: 'projects', AREAS: ['Company & legal', 'Insurance', 'Workers on site', 'Health & safety', 'Equipment on site', 'Certifications'] };
  return { WORDS, list: all, byId: (id) => all().find((s) => s.id === id) || null, stats, STATUS, SUP_STATUS, addInvite, lookup, slug, ON_CMORE };
})();
