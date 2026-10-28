/* A company's own documents, as one list for every page that asks for them: ALMA's Registration
   and Company documents steps (js/guided-upload.js), Documents › Company (js/doc-model.js), and the
   documents a company asks of a supplier it adds (js/supplier-add.js).
   window.CM_COMPANY_DOCS: REG, mandatory(country), optional(country). Needs js/doc-catalog.js. */
window.CM_COMPANY_DOCS = (() => {
  const CAT = window.DOC_CATALOG || { docs: [] };
  const region = (country) => (country === 'US' ? 'US' : 'EU');
  // the mandatory ones, what registering takes: in Portugal the Certidão Permanente, the Cartão de
  // Pessoa Coletiva, and the tax and social security clearance certificates; elsewhere the
  // catalog's mandatory Identification and registration documents for the company's region
  const REG = { PT: ['CO-01', 'CO-02', 'CO-06', 'CO-07'] };
  const mandatory = (country) => (REG[country] ? REG[country].map((c) => CAT.docs.find((d) => d.code === c)).filter(Boolean)
    : CAT.docs.filter((d) => d.category === 'company' && d.level === 'company' && d.requirement === 'mandatory' && d.section.en === 'Identification and registration'
      && (d.scope || []).includes(region(country)) && (!d.countries || d.countries.includes(country))));
  // the optional ones: the list Product set, in its order and sections, none of them mandatory.
  // [code, where (EU, US or both), section, name when it differs from the catalog's]. EU companies
  // are asked for the EU ones, US companies for the US ones.
  const COMPANY = [
    ['CO-19', 'EU', 'Identification and registration', 'Company’s Presentation'], ['CO-22', 'EU', 'Identification and registration'],
    ['CO-23', 'EU', 'Financial'], ['UN-15', '*', 'Financial'], ['UN-16', '*', 'Financial'], ['UN-17', '*', 'Financial'],
    ['CO-04', 'EU', 'Licences'], ['CO-05', 'EU', 'Licences'],
    ['CO-15', 'EU', 'Declarations'], ['CO-18', 'EU', 'Declarations'],
    ['CO-21', 'EU', 'Certifications'], ['CO-21.1', 'EU', 'Certifications'], ['CO-21.2', 'EU', 'Certifications'], ['CO-21.3', 'EU', 'Certifications'], ['CO-21.4', 'EU', 'Certifications'], ['UN-10', '*', 'Certifications'],
    ['CO-08', 'EU', 'Insurance'], ['CO-10', 'EU', 'Insurance'], ['CO-11', 'EU', 'Insurance'], ['UN-27', '*', 'Insurance'],
    ['CO-12', 'EU', 'Health and safety'], ['CO-14', 'EU', 'Health and safety', 'Annual Health and Safety Activity Report'], ['UN-11', '*', 'Health and safety'], ['UN-12', '*', 'Health and safety'],
    ['UN-18', '*', 'ESG and sustainability'], ['CO-24', 'EU', 'ESG and sustainability'], ['CO-COC', '*', 'ESG and sustainability'], ['UN-19', '*', 'ESG and sustainability'],
    ['UN-21', 'EU', 'ESG and sustainability', 'Sustainability Report (VSME / CSRD / GRI / IFRS)'], ['UN-22', '*', 'ESG and sustainability'], ['UN-23', '*', 'ESG and sustainability'], ['UN-24', 'EU', 'ESG and sustainability'], ['UN-31', '*', 'ESG and sustainability'],
    ['UN-06', 'EU', 'Information security', 'Data Processing Agreement (GDPR)'], ['UN-25', '*', 'Information security'], ['UN-26', '*', 'Information security'], ['UN-28', '*', 'Information security'],
    ['UN-02', 'US', 'Identification and registration'], ['UN-04', 'US', 'Tax and social security'], ['UN-08', 'US', 'Public contracts'], ['UN-07', 'US', 'Information security'],
    ['UN-09', 'US', 'Information security'], ['UN-13', 'US', 'Health and safety'], ['UN-14', 'US', 'Health and safety'], ['UN-32', 'US', 'Certifications'],
  ];
  // Prototype: the company's own Code of Conduct isn't in the catalog yet. Remove once Product adds it.
  const COC = Object.assign({}, CAT.docs.find((d) => d.code === 'UN-18') || {}, {
    code: 'CO-COC', name: { en: 'Code of Conduct', pt: 'Código de Conduta' },
    description: { en: 'The company’s own code of ethics and conduct, approved by its management, setting the principles and rules of behaviour for its employees and business partners.', pt: '' },
    expiryRule: 'Printed on the document (next review date)', titles: 'Código de Conduta; Código de Ética', usuallyIssuedBy: 'Company',
  });
  const optional = (country) => {
    const where = country === 'US' ? 'US' : 'EU';
    return COMPANY.filter(([, w]) => w === '*' || w === where).map(([code, , section, name]) => {
      const d = code === 'CO-COC' ? COC : CAT.docs.find((x) => x.code === code);
      return d && Object.assign({}, d, { requirement: 'optional', section: { en: section }, name: name ? { en: name, pt: d.name.pt } : d.name });
    }).filter(Boolean);
  };
  return { REG, mandatory, optional };
})();
