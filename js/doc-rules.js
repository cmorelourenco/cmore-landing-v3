/* Which documents a company is asked for: the Document Catalog (data/document-catalog.json)
   plus the company's profile in, the list out. No page code in here, so the backend can run the
   very same file (Node: require('./doc-rules.js')) and the two never disagree.

   A document reaches a company when all of these hold:
     1. its phase is live (MVP by default);
     2. its scope covers the company's region — EU or US, from the country (workbook column J);
     3. it is for any sector, or for the company's sector (column K: Construction specific);
     4. its area is open to the company: Workers needs employees, Equipment needs equipment
        records, Products needs Material supply among the service types; Sites is left out
        until it is reworked;
     5. its condition, if any (the 'Condition key' column), isn't false for this company.
   A condition is a fact (read from a profile; false hides the document) or an answer only the
   company can give (the document stays asked for until they mark it Not applicable, with a reason).
   Per-worker, per-equipment and per-product documents also say which of those records they cover. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DocRules = factory();
}(typeof self !== 'undefined' ? self : this, () => {
  // EU/EEA countries (ISO 3166-1 alpha-2): the EU's documents, and no residence permit needed
  const EU_EEA = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO'];
  const region = (country) => (country === 'US' ? 'US' : EU_EEA.includes(country) ? 'EU' : null);

  // each condition key → how to read it. Company facts read the company profile; subject facts
  // read one worker, machine or product. Answers return null: only the company can say.
  const FACTS = {
    has_employees: (p) => p.employees > 0,
    self_employed: (p) => p.entityType === 'self_employed',
    foreign_posting: (p) => p.entityType === 'foreign_company',
    construction_work: (p) => (p.services || []).includes('construction_work'),
    own_equipment: (p) => p.equipmentCount > 0,
    non_us_for_us_clients: (p) => region(p.country) !== 'US' && !!p.usClients,
    'worker.special_risk': (p, w) => !!w.specialRisk,
    'worker.certified_operator': (p, w) => !!w.certifiedOperator,
    'worker.non_eu': (p, w) => !EU_EEA.includes(w.nationality),
    'worker.posted': (p, w) => w.employmentType === 'posted',
    'equipment.built_1995_or_later': (p, e) => e.yearBuilt >= 1995,
    'equipment.built_before_1995': (p, e) => e.yearBuilt < 1995,
    'equipment.measuring': (p, e) => !!e.measuring,
    'product.ce_marked': (p, x) => !!x.ceMarked,
    'product.notified_body': (p, x) => !!x.notifiedBody,
    'product.hazardous': (p, x) => !!x.hazardous,
    'product.other_eu_rules': (p, x) => !!x.otherEuRules,
  };
  const subjectOf = (key) => (key && key.includes('.') ? key.split('.')[0] : 'company');

  // the areas a company has, from its profile alone
  const AREA_OPEN = {
    company: () => true,
    workers: (p) => p.employees > 0,
    equipment: (p) => p.equipmentCount > 0,
    products: (p) => (p.services || []).includes('material_supply'),
    sites: () => false, // being reworked
  };

  // every catalog document, each with whether it reaches this company and, if not, why
  function evaluate(catalog, profile, opts = {}) {
    const phases = opts.phases || ['MVP'];
    const reg = region(profile.country);
    return catalog.docs.map((doc) => {
      const out = (why) => ({ doc, shown: false, why });
      if (!phases.includes(doc.phase)) return out('phase');
      if (!doc.scope.includes(reg)) return out('scope');
      if (doc.sectors !== 'any' && !doc.sectors.includes(profile.sector)) return out('sector');
      if (!(AREA_OPEN[doc.category] || (() => false))(profile)) return out('area');
      const key = doc.condition;
      if (key && subjectOf(key) === 'company' && FACTS[key] && !FACTS[key](profile)) return out('condition');
      // answer conditions stay asked for; subject conditions are settled per record
      return { doc, shown: true, ask: !!key && subjectOf(key) === 'company' && !FACTS[key] };
    });
  }

  // the documents this company is asked for, in catalog order
  const documentsFor = (catalog, profile, opts) => evaluate(catalog, profile, opts).filter((x) => x.shown);

  // the workers, machines or products a per-record document covers
  function subjectsFor(doc, records, profile) {
    const key = doc.condition;
    if (!key || subjectOf(key) === 'company') return records.slice();
    return records.filter((r) => FACTS[key] && FACTS[key](profile, r));
  }

  return { EU_EEA, region, FACTS, AREA_OPEN, evaluate, documentsFor, subjectsFor };
}));
