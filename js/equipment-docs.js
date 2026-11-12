/* A machine's documents, as the product team listed them (Section, Name, Description, Country,
   Sector, Subsector, what ALMA extracts), over the Document Catalog, as js/worker-docs.js does for
   workers. Loaded right after it: the catalog's equipment documents take these names, sections and
   fields, and the ones it doesn't have yet are added. What's asked for stays as the catalog's rules
   say (the EU declaration from 1995, the minimum requirements certificate before, inspections,
   maintenance, the manual, calibration for measuring instruments, insurance on request); the rest
   are optional, for the machines they're about (a road vehicle, lifting equipment, pressure
   equipment, portable electrical equipment: the conditions below, read in js/doc-model.js).
   A field marked profile: true is in the machine's profile. Retire this file once the catalog is
   regenerated from the new list. */
(() => {
  const C = window.DOC_CATALOG; if (!C || !C.docs) return;
  const f = (list) => list.map((x) => { const p = /\*$/.test(x), name = x.replace(/\*$/, ''); return { name, type: /date/i.test(name) ? 'Date' : 'Text', requiredToSave: /serial|date|number|plate/i.test(name), extractedByAlma: true, editableByUser: true, visibleToClients: true, profile: p }; });
  const T = (en) => ({ en, pt: en });
  const SEC = { conformity: T('Conformity'), documentation: T('Documentation'), inspections: T('Inspections'), maintenance: T('Maintenance'), calibration: T('Calibration'), specific: T('Specific equipment'), insurance: T('Insurance') };
  const EU = ['EU'], ALL = ['EU', 'US'];

  // the catalog's own equipment documents: the list's names, sections and fields
  const OVER = {
    'EQ-01': { section: SEC.conformity, name: 'EU Declaration of Conformity (Machinery)', description: 'Manufacturer’s declaration that a machine placed on the market from 1995 complies with EU safety requirements, which allows the CE marking.', fields: ['Manufacturer*', 'Machine type*', 'Model*', 'Serial number*', 'Year built*', 'EU rules covered', 'Signatory', 'Issue date'] },
    'EQ-02': { section: SEC.conformity, name: 'Minimum Safety Requirements Certificate', description: 'Certificate that equipment without CE marking (built before 1995) meets the minimum safety requirements for work equipment.', fields: ['Equipment*', 'Serial number*', 'Assessing entity', 'Result', 'Issue date'] },
    'EQ-03': { section: SEC.inspections, name: 'Periodic Safety Inspection Report', description: 'Report of a periodic safety inspection of work equipment by a competent person.', fields: ['Equipment*', 'Serial number*', 'Inspector / body', 'Result (pass / fail)', 'Defects', 'Issue date (inspection date)', 'Expiry date (next inspection)'] },
    'EQ-04': { section: SEC.maintenance, name: 'Maintenance Records', description: 'Records of maintenance carried out on the equipment, as planned by the manufacturer or the owner.', fields: ['Equipment', 'Serial number', 'Work done', 'Technician', 'Issue date (maintenance date)', 'Expiry date (next maintenance)'] },
    'EQ-05': { section: SEC.documentation, name: 'Instruction Manual', description: 'Manufacturer’s instructions for safe use, installation and maintenance, in the language of the country of use.', fields: ['Equipment*', 'Manufacturer*', 'Model*', 'Language'] },
    'EQ-06': { section: SEC.calibration, name: 'Calibration Certificate', description: 'Certificate confirming that a measuring instrument has been calibrated against reference standards.', fields: ['Equipment', 'Serial number', 'Laboratory', 'Accreditation (ISO/IEC 17025)', 'Result', 'Issue date', 'Expiry date'] },
    'EQ-07': { section: SEC.insurance, name: 'Equipment Insurance', description: 'Insurance policy covering damage to or loss of the equipment (all-risks or machinery breakdown).', fields: ['Insurer', 'Policy number', 'Equipment covered', 'Insured value', 'Issue date', 'Expiry date'] },
  };
  C.docs.forEach((d) => {
    const o = OVER[d.code]; if (!o) return;
    d.section = o.section; d.name = Object.assign({}, d.name, { en: o.name });
    if (o.description) d.description = Object.assign({}, d.description, { en: o.description });
    d.fields = f(o.fields);
  });

  // the ones the catalog doesn't have yet: optional, for the machines they're about
  const base = { category: 'equipment', level: 'per_equipment', requirement: 'optional', appliesWhen: 'If the machine has one', hasIssueDate: true, renewal: '', checks: 'Serial number = the machine’s', sharing: 'standard', phase: 'MVP', legalBasis: '', recognitionCues: '', confusedWith: [] };
  const ADD = [
    ['EQ-21', 'documentation', 'Equipment Technical Sheet', 'Technical characteristics of the equipment: capacity, dimensions, power, limits of use.', ALL, 'any', '', 'Ficha técnica; Technical sheet; Datasheet; Especificações técnicas', 'The manufacturer', 'No expiry', ['Equipment*', 'Manufacturer*', 'Model*', 'Capacity / load limits', 'Power']],
    ['EQ-22', 'inspections', 'Lifting Equipment Examination Certificate', 'Certificate of a thorough examination of lifting equipment and accessories (cranes, hoists, aerial platforms, forklifts, slings, chains) by a competent person or body.', ALL, 'any', 'equipment.lifting', 'Certificado de inspeção de equipamento de elevação; Lifting examination; LOLER; Thorough examination', 'Inspection body', 'Valid until', ['Equipment*', 'Serial number*', 'Safe working load', 'Examiner / body', 'Result', 'Issue date', 'Expiry date']],
    ['EQ-23', 'inspections', 'Pressure Equipment Inspection Certificate', 'Inspection certificate for pressure equipment such as boilers, compressors and air receivers.', ALL, 'any', 'equipment.pressure', 'Equipamento sob pressão; Reservatório de ar; Pressure equipment inspection', 'Inspection body', 'Valid until', ['Equipment*', 'Serial number*', 'Maximum allowable pressure', 'Inspection body', 'Result', 'Issue date', 'Expiry date']],
    ['EQ-24', 'inspections', 'Electrical Safety Test Report (Portable Equipment)', 'Report of electrical safety tests on portable tools and electrical equipment.', ALL, 'any', 'equipment.portable_electrical', 'Ensaio elétrico; PAT test; Electrical safety test', 'Electrical tester', 'Valid until', ['Equipment', 'Serial number', 'Tester', 'Result', 'Issue date', 'Expiry date (calculated)']],
    ['EQ-25', 'inspections', 'Fall Arrest Equipment Inspection Record', 'Periodic inspection of harnesses, lanyards, energy absorbers and lifelines by a competent person.', ALL, 'any', 'equipment.fall_arrest', 'Inspeção de arnês; Fall arrest inspection; Harness inspection', 'Competent person', 'Valid until', ['Equipment*', 'Serial number*', 'Inspector', 'Result', 'Issue date', 'Expiry date (calculated)']],
    ['EQ-26', 'specific', 'ATEX Declaration of Conformity', 'Manufacturer’s declaration that equipment is safe for use in potentially explosive atmospheres.', EU, ['manufacturing', 'energy', 'mining'], '', 'ATEX; Ex marking; Atmosferas explosivas', 'The manufacturer', 'No expiry', ['Equipment', 'Manufacturer', 'Serial number', 'Equipment group and category', 'Ex marking', 'Issue date']],
    ['EQ-27', 'specific', 'Scaffold System Certificate', 'Manufacturer’s certificate that a scaffold system meets EN 12810 / EN 12811, with its assembly instructions.', EU, 'any', 'equipment.scaffold', 'EN 12810; EN 12811; Andaime; Scaffold certificate', 'The manufacturer', 'No expiry', ['System name', 'Manufacturer', 'Standard', 'Load class', 'Certificate number', 'Issue date']],
    ['EQ-28', 'specific', 'Vehicle Registration Certificate', 'Registration of vehicles and mobile machinery that travel on public roads.', ALL, 'any', 'equipment.road_vehicle', 'Documento Único Automóvel; DUA; Certificado de matrícula; Vehicle registration', 'IMT', 'No expiry', ['Plate', 'Owner', 'Vehicle category', 'Make and model', 'VIN / chassis number', 'Issue date']],
    ['EQ-29', 'specific', 'Periodic Technical Inspection Certificate', 'Periodic roadworthiness inspection of vehicles that use public roads.', EU, 'any', 'equipment.road_vehicle', 'Inspeção periódica obrigatória; IPO; Technical inspection', 'Inspection centre', 'Valid until', ['Plate', 'Inspection centre', 'Result', 'Issue date', 'Expiry date']],
    ['EQ-30', 'specific', 'Motor Third-Party Liability Insurance', 'Mandatory insurance covering damage to third parties caused by a vehicle or self-propelled machine.', ALL, 'any', 'equipment.road_vehicle', 'Seguro automóvel; Carta verde; Motor insurance; Responsabilidade civil automóvel', 'Insurer', 'Valid until', ['Insurer', 'Policy number', 'Plate', 'Period', 'Issue date', 'Expiry date']],
  ];
  const at = C.docs.reduce((n, d, k) => (d.category === 'equipment' ? k : n), C.docs.length - 1) + 1;
  C.docs.splice(at, 0, ...ADD.filter(([code]) => !C.docs.some((d) => d.code === code)).map(([code, sec, name, desc, scope, sectors, condition, titles, by, expiry, fields]) => Object.assign({}, base, {
    code, section: SEC[sec], name: T(name), description: T(desc), scope, sectors, condition, titles, usuallyIssuedBy: by, expiryRule: expiry, fields: f(fields) })));

  // what makes a machine one of those (read on each machine's profile, js/doc-model.js)
  window.CM_EQUIPMENT_FACTS = {
    'equipment.lifting': (p, e) => !!e.lifting,
    'equipment.pressure': (p, e) => !!e.pressure,
    'equipment.portable_electrical': (p, e) => !!e.portableElectrical,
    'equipment.fall_arrest': (p, e) => !!e.fallArrest,
    'equipment.scaffold': (p, e) => !!e.scaffold,
    'equipment.road_vehicle': (p, e) => !!e.road,
  };
})();
