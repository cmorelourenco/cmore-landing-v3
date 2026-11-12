/* A worker's documents, as the product team listed them (Section, Name, Description, Country,
   Sector, Subsector, what ALMA extracts), over the Document Catalog (js/doc-catalog.js, generated
   from Document_List_v2.xlsx, which still has the older worker list). Loaded right after it: the
   catalog's worker documents take these names, sections and fields, and the ones it doesn't have yet
   are added. What's asked for stays as the catalog's rules say (fitness, PPE, special-risk and
   operator training, the residence permit for non-EU workers, the A1 for posted workers); the rest
   are optional, there to upload for whoever has one. A field marked profile: true is saved to the
   worker's profile too. Retire this file once the catalog is regenerated from the new list.
   The identity document, the driving licence and the criminal record certificate are handled by
   the upload itself (js/doc-upload.js: ID, DRV, CRM), with these documents' fields. */
(() => {
  const C = window.DOC_CATALOG; if (!C || !C.docs) return;
  const f = (list) => list.map((x) => { const p = /\*$/.test(x), name = x.replace(/\*$/, ''); return { name, type: /date/i.test(name) ? 'Date' : /\(y\/n\)|yes\/no|signed by/i.test(name) ? 'Yes/No' : 'Text', requiredToSave: /name|date|number/i.test(name), extractedByAlma: true, editableByUser: true, visibleToClients: false, profile: p }; });
  const T = (en) => ({ en, pt: en });
  const SEC = { right: T('Right to work'), health: T('Health'), training: T('Training and qualifications'), ppe: T('Personal protective equipment'), driving: T('Driving'), other: T('Other'), identity: T('Identity') };
  const EU = ['EU'], ALL = ['EU', 'US'];

  // the catalog's own worker documents: the list's names, sections and fields
  const OVER = {
    'WK-11': { section: SEC.health, name: 'Fitness for Work Certificate', fields: ['Worker name', 'Employer', 'Exam type', 'Result (fit / fit with restrictions / unfit)', 'Restrictions', 'Doctor', 'Signed by worker (Y/N)', 'Issue date', 'Expiry date'] },
    'WK-12': { section: SEC.training, name: 'Special-Risk Work Training Certificate', fields: ['Worker name', 'Task / topic', 'Training entity', 'Hours', 'Issue date', 'Expiry date'] },
    'WK-13': { section: SEC.training, name: 'Equipment Operator Certificate', fields: ['Worker name', 'Equipment type', 'Training entity', 'Certificate number', 'Issue date', 'Expiry date'] },
    'WK-14': { section: SEC.training, name: 'General Health and Safety Training Certificate', description: 'Certificate of basic occupational health and safety training suited to the worker’s job.', fields: ['Worker name', 'Training topic', 'Training entity', 'Hours', 'Issue date', 'Expiry date'] },
    'WK-15': { section: SEC.ppe, name: 'PPE Delivery Record', fields: ['Worker name', 'PPE items', 'Harness serial number', 'Signed by worker (Y/N)', 'Issue date (delivery date)'] },
    'WK-16': { section: SEC.right, name: 'Residence Permit', description: 'Permit allowing a non-national to live in the country, often also allowing work.', fields: ['Full name', 'Permit number', 'Permit type', 'Nationality', 'Right to work (yes/no)', 'Issue date', 'Expiry date'] },
    'WK-17': { section: SEC.right, name: 'A1 Certificate', fields: ['Full name', 'Personal identification number', 'Issuing country', 'Employer', 'Period start (issue date)', 'Period end (expiry date)'] },
  };
  C.docs.forEach((d) => {
    const o = OVER[d.code]; if (!o) return;
    d.section = o.section; d.name = Object.assign({}, d.name, { en: o.name });
    if (o.description) d.description = Object.assign({}, d.description, { en: o.description });
    d.fields = f(o.fields);
  });

  // the ones the catalog doesn't have yet: optional, for whoever has one (countries: only there)
  const base = { category: 'workers', level: 'per_worker', requirement: 'optional', condition: '', appliesWhen: 'If the worker has one', hasIssueDate: true, renewal: '', checks: 'Name = worker', sharing: 'restricted', phase: 'MVP', legalBasis: '', recognitionCues: '', confusedWith: [] };
  const ADD = [
    ['WD-01', 'right', 'Immigration Application Proof', 'Proof that a residence permit application or renewal is pending with AIMA, which may allow the worker to keep working meanwhile.', EU, 'any', ['PT'], 'Comprovativo de pedido AIMA; Manifestação de interesse; Immigration application', 'AIMA', 'Valid until', ['Full name', 'Application number', 'Application type', 'Issue date', 'Expiry date']],
    ['WD-02', 'right', 'Work Permit', 'Permit allowing a foreign national to work, in countries where it is separate from the residence permit.', ALL, 'any', null, 'Work permit; Autorização de trabalho; Permiso de trabajo', 'Immigration authority', 'Valid until', ['Full name', 'Permit number', 'Permit class', 'Employer', 'Occupation', 'Issue date', 'Expiry date']],
    ['WD-03', 'right', 'Employment Contract', 'Contract between the worker and the employer, showing the employment relationship.', ALL, 'any', null, 'Contrato de trabalho; Employment contract', 'The employer', 'End date', ['Worker name', 'Employer', 'Job category', 'Contract type (permanent / fixed-term)', 'Start date (issue date)', 'End date (expiry date)']],
    ['WD-04', 'right', 'Social Security Number Proof', 'Document showing the worker’s Portuguese social security number, for workers without a Citizen Card.', EU, 'any', ['PT'], 'Comprovativo NISS; Cartão de Segurança Social; Social security number', 'Segurança Social', 'No expiry', ['Full name', 'Social security number', 'Issue date']],
    ['WD-05', 'right', 'Tax Number Proof', 'Document showing the worker’s Portuguese tax number, for workers without a Citizen Card.', EU, 'any', ['PT'], 'Comprovativo NIF; Cartão de contribuinte; Tax number', 'Autoridade Tributária', 'No expiry', ['Full name', 'Tax number', 'Issue date']],
    ['WD-06', 'training', 'OSHA 10 / OSHA 30 Card', 'US Department of Labor card showing completion of 10-hour or 30-hour OSHA outreach safety training.', ['US'], 'any', ['US'], 'OSHA 10; OSHA 30; OSHA outreach card', 'US Department of Labor', 'No expiry', ['Worker name', 'Course (10 or 30 hours)', 'Industry (construction / general)', 'Trainer', 'Card number', 'Issue date']],
    ['WD-07', 'training', 'Regulated Trade Qualification', 'Licence or certificate for a regulated trade, such as electrician or gas technician.', ALL, 'any', null, 'Carteira profissional; Técnico de gás; Electricista; Trade licence', 'Licensing body', 'Valid until', ['Worker name', 'Trade', 'Qualification level', 'Licence number', 'Issuing entity', 'Issue date', 'Expiry date']],
    ['WD-08', 'training', 'Welder Qualification Certificate (ISO 9606)', 'Certificate that a welder is qualified for specific welding processes and materials under ISO 9606.', ALL, 'any', null, 'ISO 9606; Qualificação de soldador; Welder qualification', 'Certifying body', 'Valid until', ['Worker name', 'Standard', 'Welding process', 'Material group', 'Certifying body', 'Certificate number', 'Issue date', 'Expiry date']],
    ['WD-09', 'training', 'First Aid Certificate', 'Certificate of first aid training.', ALL, 'any', null, 'Primeiros socorros; First aid', 'Training entity', 'Valid until', ['Worker name', 'Training entity', 'Hours', 'Issue date', 'Expiry date']],
    ['WD-10', 'training', 'Construction Worker Accreditation (Kenya)', 'National Construction Authority accreditation card for skilled construction workers and site supervisors.', [], 'any', ['KE'], 'NCA accreditation; National Construction Authority', 'National Construction Authority', 'Valid until', ['Worker name', 'Accreditation number', 'Trade / category', 'Issue date', 'Expiry date']],
    ['WD-11', 'driving', 'Driver Certificate of Professional Competence', 'Qualification required in the EU for professional drivers of goods or passenger vehicles above certain weights or seats.', EU, 'any', null, 'CAM; Carta de Qualificação de Motorista; Driver CPC', 'IMT', 'Valid until', ['Full name', 'Card number', 'Categories', 'Issuing country', 'Issue date', 'Expiry date']],
  ];
  const at = C.docs.reduce((n, d, k) => (d.category === 'workers' ? k : n), C.docs.length - 1) + 1;
  C.docs.splice(at, 0, ...ADD.filter(([code]) => !C.docs.some((d) => d.code === code)).map(([code, sec, name, desc, scope, sectors, countries, titles, by, expiry, fields]) => Object.assign({}, base, {
    code, section: SEC[sec], name: T(name), description: T(desc), scope, sectors, titles, usuallyIssuedBy: by, expiryRule: expiry, fields: f(fields) }, countries ? { countries } : {})));

  // the three the upload files itself, with the list's fields (js/doc-upload.js, js/company-details.js)
  window.CM_WORKER_DOCS = {
    ID: { name: 'Identity document', kinds: ['National Identity Card', 'Passport'], fields: f(['Full name*', 'Document number*', 'Nationality*', 'Date of birth*', 'Social security number', 'Tax number', 'Issuing country', 'Issue date', 'Expiry date']) },
    DRV: { name: 'Driving Licence', fields: f(['Full name', 'Licence number', 'Categories', 'Issuing country', 'Issue date', 'Expiry date']) },
    CRM: { name: 'Individual Criminal Record Certificate', fields: f(['Full name', 'Record status (no record / has record)', 'Purpose', 'Issue date', 'Expiry date']) },
  };
})();
