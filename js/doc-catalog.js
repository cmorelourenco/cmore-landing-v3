/* Document Catalog (MVP), generated from Document_Catalog_MVP.xlsx: every document type a contractor
   can be asked for, with the catalog's own wording (category, section, requirement type, level,
   expiry rule, sharing, phase, legal basis) and the fields Alma extracts from each ([field, type,
   required to save, visible to clients]). Product owns this content: regenerate it from the
   workbook rather than editing it here. Codes never change once in production. */
window.DOC_CATALOG = {
 "docs": [
  {
   "code": "CO-01",
   "category": "Company",
   "section": "Identification and registration",
   "name": "Commercial registry certificate (sole traders: start of activity declaration)",
   "requirement": "Mandatory",
   "appliesWhen": "Always",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document (subscription end)",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Name, address and CAE match the profile (if not, propose profile update); company not dissolved or insolvent",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 21(1)(a)",
   "notes": "Used to prefill the profile",
   "fields": [
    [
     "Legal name",
     "Text",
     true,
     true
    ],
    [
     "Company tax number",
     "Text",
     true,
     true
    ],
    [
     "Registered address",
     "Text",
     true,
     true
    ],
    [
     "Activity codes (CAE)",
     "List",
     true,
     true
    ],
    [
     "Legal representatives (name, role)",
     "List",
     true,
     true
    ],
    [
     "Access code",
     "Text",
     true,
     true
    ],
    [
     "Issue date (subscription start)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (subscription end)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-02",
   "category": "Company",
   "section": "Identification and registration",
   "name": "Company tax card",
   "requirement": "Mandatory",
   "appliesWhen": "Always",
   "canBeNA": false,
   "level": "Company",
   "issueDate": false,
   "expiry": "No expiry",
   "renewal": "—",
   "alertDays": "",
   "checks": "Matches CO-01",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 21(1)(a)",
   "notes": "",
   "fields": [
    [
     "Company tax number",
     "Text",
     true,
     true
    ],
    [
     "Legal name",
     "Text",
     true,
     true
    ],
    [
     "Registered address",
     "Text",
     false,
     true
    ]
   ]
  },
  {
   "code": "CO-03",
   "category": "Company",
   "section": "Licences",
   "name": "Construction licence (IMPIC alvará or contractor certificate)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company carries out construction work",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Holder = organization; subcategories stored to compare with site activity",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Law 41/2015; DL 273/2003 art. 21(1)(b)",
   "notes": "Used to prefill the profile",
   "fields": [
    [
     "Licence type (licence / certificate)",
     "List",
     true,
     true
    ],
    [
     "Licence number",
     "Text",
     true,
     true
    ],
    [
     "Holder",
     "Text",
     true,
     true
    ],
    [
     "Holder tax number",
     "Text",
     true,
     true
    ],
    [
     "Categories and subcategories",
     "List",
     true,
     true
    ],
    [
     "Class",
     "Text",
     false,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-04",
   "category": "Company",
   "section": "Licences",
   "name": "Road transport licence for third-party goods (IMT)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If third-party goods are transported in vehicles of 2,500 kg or more",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Holder = organization",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "IMT licensing rules",
   "notes": "",
   "fields": [
    [
     "Licence number",
     "Text",
     true,
     true
    ],
    [
     "Holder",
     "Text",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-05",
   "category": "Company",
   "section": "Licences",
   "name": "Waste management operator licences (transport / treatment)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company produces or transports waste itself",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Operator identified",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 102-D/2020",
   "notes": "",
   "fields": [
    [
     "Operator",
     "Text",
     true,
     true
    ],
    [
     "Licence number",
     "Text",
     true,
     true
    ],
    [
     "Licensed operations",
     "List",
     false,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-06",
   "category": "Company",
   "section": "Tax and social security",
   "name": "Tax clearance certificate (AT)",
   "requirement": "Mandatory",
   "appliesWhen": "Always",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Status = regularized; issued by AT",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Labour Code art. 551(4) (joint liability)",
   "notes": "If no printed date: confirm rule with legal",
   "fields": [
    [
     "Tax number",
     "Text",
     true,
     true
    ],
    [
     "Status (regularized / not)",
     "List",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-07",
   "category": "Company",
   "section": "Tax and social security",
   "name": "Social security clearance certificate",
   "requirement": "Mandatory",
   "appliesWhen": "Always",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Status = regularized",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Labour Code art. 551(4) (joint liability)",
   "notes": "If no printed date: confirm rule with legal",
   "fields": [
    [
     "Tax number",
     "Text",
     true,
     true
    ],
    [
     "Social security number",
     "Text",
     false,
     true
    ],
    [
     "Status (regularized / not)",
     "List",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-08",
   "category": "Company",
   "section": "Insurance",
   "name": "Workers' compensation insurance policy (employees)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "Annual",
   "alertDays": "30",
   "checks": "Policyholder = organization; in force today",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 21(2)(f); Law 98/2009",
   "notes": "Monthly payroll and receipt are WK-01",
   "fields": [
    [
     "Insurer",
     "Text",
     true,
     true
    ],
    [
     "Policy number",
     "Text",
     true,
     true
    ],
    [
     "Policyholder",
     "Text",
     true,
     true
    ],
    [
     "Policyholder tax number",
     "Text",
     true,
     true
    ],
    [
     "Premium type (fixed / variable)",
     "List",
     false,
     true
    ],
    [
     "Activity covered",
     "Text",
     false,
     true
    ],
    [
     "Issue date (policy start)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-09",
   "category": "Company",
   "section": "Insurance",
   "name": "Workers' compensation insurance for self-employed + receipt",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If self-employed, working alone",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document (end of period paid)",
   "renewal": "Per premium",
   "alertDays": "30",
   "checks": "Insured = profile holder; receipt covers current period",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 159/99; DL 273/2003 art. 21(2)(f)",
   "notes": "",
   "fields": [
    [
     "Insurer",
     "Text",
     true,
     true
    ],
    [
     "Policy number",
     "Text",
     true,
     true
    ],
    [
     "Insured person",
     "Text",
     true,
     true
    ],
    [
     "Tax number",
     "Text",
     true,
     true
    ],
    [
     "Amount paid",
     "Number",
     false,
     true
    ],
    [
     "Issue date (period start)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (end of period paid)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-10",
   "category": "Company",
   "section": "Insurance",
   "name": "Civil liability insurance + receipt",
   "requirement": "Client requirement",
   "appliesWhen": "When the client selects it for a site or requests it",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document (end of period paid)",
   "renewal": "Per premium",
   "alertDays": "30",
   "checks": "Policyholder = organization; receipt covers current period",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Contractual",
   "notes": "Commonly selected by clients",
   "fields": [
    [
     "Insurer",
     "Text",
     true,
     true
    ],
    [
     "Policy number",
     "Text",
     true,
     true
    ],
    [
     "Policyholder",
     "Text",
     true,
     true
    ],
    [
     "Insured amount",
     "Number",
     false,
     true
    ],
    [
     "Receipt paid",
     "Yes/No",
     true,
     true
    ],
    [
     "Issue date (period start)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (end of period paid)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-11",
   "category": "Company",
   "section": "Insurance",
   "name": "Environmental liability insurance or guarantee",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the activity is covered by the environmental liability regime",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "Annual",
   "alertDays": "30",
   "checks": "Policyholder = organization",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 147/2008",
   "notes": "",
   "fields": [
    [
     "Insurer",
     "Text",
     true,
     true
    ],
    [
     "Policy number",
     "Text",
     true,
     true
    ],
    [
     "Policyholder",
     "Text",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-12",
   "category": "Company",
   "section": "Health and safety",
   "name": "H&S services organization (service model, provider contract) and general risk assessment",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Issue date + 1 year",
   "renewal": "Annual",
   "alertDays": "30",
   "checks": "Provider identified",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Law 102/2009 art. 46; DL 273/2003 art. 22",
   "notes": "",
   "fields": [
    [
     "H&S service model (internal / shared / external)",
     "List",
     true,
     true
    ],
    [
     "Provider",
     "Text",
     false,
     true
    ],
    [
     "Provider tax number",
     "Text",
     false,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (issue date + 1 year)",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "CO-13",
   "category": "Company",
   "section": "Health and safety",
   "name": "Standard work procedures for special-risk tasks",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company does special-risk work",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "On change",
   "alertDays": "",
   "checks": "Covers the special risks selected in QP5",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 22",
   "notes": "",
   "fields": [
    [
     "Tasks covered",
     "List",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-14",
   "category": "Company",
   "section": "Health and safety",
   "name": "Annual H&S activity report (Single Report, Annex D)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Submission of next year's report",
   "renewal": "Annual",
   "alertDays": "30",
   "checks": "Year = last calendar year",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Ordinance 55/2010",
   "notes": "",
   "fields": [
    [
     "Reference year",
     "Number",
     true,
     true
    ],
    [
     "Company tax number",
     "Text",
     true,
     true
    ],
    [
     "H&S provider",
     "Text",
     false,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (submission of next year's report)",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "CO-15",
   "category": "Company",
   "section": "Declarations",
   "name": "Foreign workers declaration (has / has not; regular status)",
   "requirement": "Client requirement",
   "appliesWhen": "When the client selects it for a site or requests it",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "Issue date + 6 months",
   "renewal": "6-monthly",
   "alertDays": "15",
   "checks": "Signatory is a legal representative (CO-01); consistent with worker nationalities",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Law 23/2007 art. 198-A",
   "notes": "",
   "fields": [
    [
     "Has foreign workers",
     "Yes/No",
     true,
     true
    ],
    [
     "Number of foreign workers",
     "Number",
     false,
     true
    ],
    [
     "Signatory",
     "Text",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (issue date + 6 months)",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "CO-16",
   "category": "Company",
   "section": "Products and environment",
   "name": "Safety data sheets of hazardous products used",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If hazardous chemical products are used",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "Per product",
   "alertDays": "",
   "checks": "In Portuguese; 16 sections present",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 22(1)(f)",
   "notes": "",
   "fields": [
    [
     "Product",
     "Text",
     true,
     true
    ],
    [
     "Manufacturer",
     "Text",
     true,
     true
    ],
    [
     "Language",
     "List",
     true,
     true
    ],
    [
     "Issue date (revision date)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-17",
   "category": "Company",
   "section": "Products and environment",
   "name": "Technical sheets of materials supplied",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If materials are supplied and built into the works",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "Per product",
   "alertDays": "",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Quality / contractual",
   "notes": "",
   "fields": [
    [
     "Product",
     "Text",
     true,
     true
    ],
    [
     "Manufacturer",
     "Text",
     false,
     true
    ],
    [
     "Issue date",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "CO-18",
   "category": "Company",
   "section": "Posted workers",
   "name": "Posting notification to the labour authority (ACT)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If a foreign company posting workers to Portugal",
   "canBeNA": true,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document (posting end)",
   "renewal": "Per posting",
   "alertDays": "15",
   "checks": "Period covers the planned site dates",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Law 29/2017",
   "notes": "A1 certificates per worker are WK-17",
   "fields": [
    [
     "Workers covered",
     "List",
     true,
     true
    ],
    [
     "Issue date (submission)",
     "Date",
     true,
     true
    ],
    [
     "Posting start",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (posting end)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-19",
   "category": "Company",
   "section": "Client documents",
   "name": "Company profile / CV",
   "requirement": "Client requirement",
   "appliesWhen": "When the client selects it for a site or requests it",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "—",
   "alertDays": "",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Contractual",
   "notes": "",
   "fields": [
    [
     "Issue date",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "CO-20",
   "category": "Company",
   "section": "Client documents",
   "name": "Client code of conduct, signed",
   "requirement": "Client requirement",
   "appliesWhen": "When the client selects it for a site or requests it",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "Until the client publishes a new version",
   "renewal": "On client change",
   "alertDays": "",
   "checks": "Version = client's current version",
   "affectsStatus": true,
   "sharing": "Requesting client only",
   "phase": "MVP",
   "legal": "Contractual",
   "notes": "Uploaded once by the client in company settings; contractor downloads, signs and uploads; signed once per client, reused on all its sites until a new version. Digital signature in Phase 2",
   "fields": [
    [
     "Client",
     "Text",
     true,
     true
    ],
    [
     "Document version",
     "Text",
     true,
     true
    ],
    [
     "Signatory",
     "Text",
     true,
     true
    ],
    [
     "Issue date (signature date)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "CO-21",
   "category": "Company",
   "section": "Certifications",
   "name": "Certifications (ISO 9001, 14001, 45001, other)",
   "requirement": "Optional",
   "appliesWhen": "Optional",
   "canBeNA": false,
   "level": "Company",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "—",
   "notes": "Strengthens the profile; useful for the Phase 2 marketplace",
   "fields": [
    [
     "Standard (e.g. ISO 9001)",
     "List",
     true,
     true
    ],
    [
     "Certification body",
     "Text",
     true,
     true
    ],
    [
     "Certificate number",
     "Text",
     true,
     true
    ],
    [
     "Scope",
     "Text",
     false,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "WK-01",
   "category": "Workers",
   "section": "Insurance",
   "name": "Workers' compensation insurance payroll + receipt",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "All workers",
   "issueDate": true,
   "expiry": "End of following month",
   "renewal": "Monthly",
   "alertDays": "15",
   "checks": "Policy = CO-08; month = current or previous; every worker allocated to an active site is in the list (missing → alert on worker and site)",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 21(2)(f)",
   "notes": "Names visible only to clients where those workers are allocated",
   "fields": [
    [
     "Reference month",
     "Text",
     true,
     true
    ],
    [
     "Policy number",
     "Text",
     true,
     true
    ],
    [
     "Workers covered (names, tax / SS no.)",
     "List",
     true,
     true
    ],
    [
     "Amount paid",
     "Number",
     false,
     true
    ],
    [
     "Issue date (payment date)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (end of following month)",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "WK-02",
   "category": "Workers",
   "section": "Social security",
   "name": "Social security monthly declaration + payment proof",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "All workers",
   "issueDate": true,
   "expiry": "End of following month",
   "renewal": "Monthly",
   "alertDays": "15",
   "checks": "Month consistent with WK-01; every allocated worker is listed; payment made",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 21(2)(c)",
   "notes": "Can create workers in bulk (REQ-16)",
   "fields": [
    [
     "Reference month",
     "Text",
     true,
     true
    ],
    [
     "Employer social security number",
     "Text",
     true,
     true
    ],
    [
     "Workers listed (name, SS no.)",
     "List",
     true,
     true
    ],
    [
     "Issue date (payment date)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (end of following month)",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "WK-03",
   "category": "Workers",
   "section": "Emergency",
   "name": "Workers designated for first aid, firefighting and evacuation",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "All workers",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "On change",
   "alertDays": "",
   "checks": "Names exist as workers",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Law 102/2009 art. 20(3)",
   "notes": "",
   "fields": [
    [
     "Designated workers and role (first aid / fire / evacuation)",
     "List",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "WK-04",
   "category": "Workers",
   "section": "Training",
   "name": "Annual H&S training plan / record",
   "requirement": "Optional",
   "appliesWhen": "Optional",
   "canBeNA": false,
   "level": "All workers",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "Annual",
   "alertDays": "30",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Labour Code (continuous training)",
   "notes": "",
   "fields": [
    [
     "Year",
     "Number",
     true,
     true
    ],
    [
     "Total hours",
     "Number",
     false,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "WK-10",
   "category": "Workers",
   "section": "Worker record",
   "name": "Worker record (data only, no file): name, address, tax no., SS no., job category, nationality, birth date, employment type",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "Every worker (self-employed: own record)",
   "canBeNA": true,
   "level": "Per worker",
   "issueDate": false,
   "expiry": "No expiry",
   "renewal": "On change",
   "alertDays": "",
   "checks": "Tax no. checksum; SS no. format",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 21(2)",
   "notes": "Birth date only drives exam periodicity; never shown to clients",
   "fields": [
    [
     "Full name",
     "Text",
     true,
     false
    ],
    [
     "Home address",
     "Text",
     true,
     false
    ],
    [
     "Tax number",
     "Text",
     true,
     false
    ],
    [
     "Social security number",
     "Text",
     true,
     false
    ],
    [
     "Job category",
     "Text",
     true,
     false
    ],
    [
     "Nationality",
     "List",
     true,
     false
    ],
    [
     "Birth date",
     "Date",
     true,
     false
    ],
    [
     "Employment type",
     "List",
     true,
     false
    ],
    [
     "Employment start date",
     "Date",
     true,
     false
    ]
   ]
  },
  {
   "code": "WK-11",
   "category": "Workers",
   "section": "Health",
   "name": "Fitness for work certificate (official model)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "Per worker",
   "issueDate": true,
   "expiry": "Next exam date",
   "renewal": "Every 1–2 years",
   "alertDays": "30",
   "checks": "Name = worker; official model; result ≠ unfit; signed by the worker; never extract clinical data",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "Law 102/2009 arts. 108 and 110; Ordinance 71/2015",
   "notes": "",
   "fields": [
    [
     "Worker name",
     "Text",
     true,
     false
    ],
    [
     "Employer",
     "Text",
     true,
     false
    ],
    [
     "Exam type (admission / periodic / occasional)",
     "List",
     true,
     false
    ],
    [
     "Result (fit / fit with restrictions / unfit)",
     "List",
     true,
     false
    ],
    [
     "Restrictions",
     "Text",
     false,
     false
    ],
    [
     "Doctor",
     "Text",
     false,
     false
    ],
    [
     "Signed by worker",
     "Yes/No",
     true,
     false
    ],
    [
     "Issue date (exam date)",
     "Date",
     true,
     false
    ],
    [
     "Expiry date (next exam date)",
     "Date",
     true,
     false
    ]
   ]
  },
  {
   "code": "WK-12",
   "category": "Workers",
   "section": "Training",
   "name": "Training for special-risk tasks",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the worker does special-risk tasks",
   "canBeNA": true,
   "level": "Per worker",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Name = worker",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "Law 102/2009 art. 20(1)",
   "notes": "Required only for workers doing that task on a site",
   "fields": [
    [
     "Worker name",
     "Text",
     true,
     false
    ],
    [
     "Topic",
     "Text",
     true,
     false
    ],
    [
     "Training entity",
     "Text",
     true,
     false
    ],
    [
     "Hours",
     "Number",
     false,
     false
    ],
    [
     "Issue date",
     "Date",
     true,
     false
    ],
    [
     "Expiry date",
     "Date",
     false,
     false
    ]
   ]
  },
  {
   "code": "WK-13",
   "category": "Workers",
   "section": "Training",
   "name": "Equipment operator certificate",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the worker operates equipment needing a certified operator",
   "canBeNA": true,
   "level": "Per worker",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Name = worker",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "Law 102/2009 art. 20",
   "notes": "Required only for workers operating that equipment",
   "fields": [
    [
     "Worker name",
     "Text",
     true,
     false
    ],
    [
     "Equipment type",
     "List",
     true,
     false
    ],
    [
     "Training entity",
     "Text",
     true,
     false
    ],
    [
     "Certificate number",
     "Text",
     false,
     false
    ],
    [
     "Issue date",
     "Date",
     true,
     false
    ],
    [
     "Expiry date",
     "Date",
     true,
     false
    ]
   ]
  },
  {
   "code": "WK-14",
   "category": "Workers",
   "section": "Training",
   "name": "Other training certificates",
   "requirement": "Optional",
   "appliesWhen": "Optional",
   "canBeNA": false,
   "level": "Per worker",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Name = worker",
   "affectsStatus": false,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "—",
   "notes": "Follows the Person when changing employer",
   "fields": [
    [
     "Worker name",
     "Text",
     true,
     false
    ],
    [
     "Topic",
     "Text",
     true,
     false
    ],
    [
     "Training entity",
     "Text",
     false,
     false
    ],
    [
     "Issue date",
     "Date",
     true,
     false
    ],
    [
     "Expiry date",
     "Date",
     false,
     false
    ]
   ]
  },
  {
   "code": "WK-15",
   "category": "Workers",
   "section": "PPE",
   "name": "PPE delivery record, signed (self-employed: self-declaration)",
   "requirement": "Mandatory",
   "appliesWhen": "Always",
   "canBeNA": false,
   "level": "Per worker",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "Per delivery",
   "alertDays": "",
   "checks": "Signed by the worker",
   "affectsStatus": false,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "DL 348/93 art. 6",
   "notes": "Stays with the employer, not the Person",
   "fields": [
    [
     "Worker name",
     "Text",
     true,
     false
    ],
    [
     "PPE items",
     "List",
     true,
     false
    ],
    [
     "Harness serial number",
     "Text",
     false,
     false
    ],
    [
     "Signed by worker",
     "Yes/No",
     true,
     false
    ],
    [
     "Issue date (delivery date)",
     "Date",
     true,
     false
    ]
   ]
  },
  {
   "code": "WK-16",
   "category": "Workers",
   "section": "Legal status",
   "name": "Residence permit or immigration agency proof + employment contract + SS registration",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the worker is from outside the EU/EEA",
   "canBeNA": true,
   "level": "Per worker",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "Name = worker; permit valid",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "Law 23/2007 art. 198-A",
   "notes": "",
   "fields": [
    [
     "Worker name",
     "Text",
     true,
     false
    ],
    [
     "Permit type",
     "List",
     true,
     false
    ],
    [
     "Permit number",
     "Text",
     true,
     false
    ],
    [
     "Contract start date",
     "Date",
     true,
     false
    ],
    [
     "Social security registration date",
     "Date",
     true,
     false
    ],
    [
     "Issue date",
     "Date",
     true,
     false
    ],
    [
     "Expiry date",
     "Date",
     true,
     false
    ]
   ]
  },
  {
   "code": "WK-17",
   "category": "Workers",
   "section": "Posted workers",
   "name": "A1 certificate",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If a foreign company posting workers to Portugal",
   "canBeNA": true,
   "level": "Per worker",
   "issueDate": true,
   "expiry": "Printed on the document (period end)",
   "renewal": "Per posting",
   "alertDays": "15",
   "checks": "Period covers site dates",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "Law 29/2017; Reg. (EC) 883/2004",
   "notes": "",
   "fields": [
    [
     "Worker name",
     "Text",
     true,
     false
    ],
    [
     "Issuing country",
     "List",
     true,
     false
    ],
    [
     "Issue date (period start)",
     "Date",
     true,
     false
    ],
    [
     "Expiry date (period end)",
     "Date",
     true,
     false
    ]
   ]
  },
  {
   "code": "EQ-00",
   "category": "Equipment",
   "section": "Inventory",
   "name": "Equipment record (data only): type, brand, model, serial no., plate, year, owned or rented, requires certified operator",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company brings its own equipment",
   "canBeNA": true,
   "level": "Per equipment",
   "issueDate": false,
   "expiry": "No expiry",
   "renewal": "On change",
   "alertDays": "",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "—",
   "notes": "",
   "fields": [
    [
     "Equipment type",
     "List",
     true,
     true
    ],
    [
     "Brand",
     "Text",
     true,
     true
    ],
    [
     "Model",
     "Text",
     true,
     true
    ],
    [
     "Serial number",
     "Text",
     true,
     true
    ],
    [
     "Plate",
     "Text",
     false,
     true
    ],
    [
     "Year built",
     "Number",
     true,
     true
    ],
    [
     "Owned or rented",
     "List",
     true,
     true
    ]
   ]
  },
  {
   "code": "EQ-01",
   "category": "Equipment",
   "section": "Conformity",
   "name": "EC declaration of conformity + technical sheet (built 1995 or later)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "Equipment built in 1995 or later",
   "canBeNA": true,
   "level": "Per equipment",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "—",
   "alertDays": "",
   "checks": "Serial no. = equipment record",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 50/2005",
   "notes": "",
   "fields": [
    [
     "Manufacturer",
     "Text",
     true,
     true
    ],
    [
     "Model",
     "Text",
     true,
     true
    ],
    [
     "Serial number",
     "Text",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "EQ-02",
   "category": "Equipment",
   "section": "Conformity",
   "name": "Conformity with minimum requirements certificate (built before 1995)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "Equipment built before 1995",
   "canBeNA": true,
   "level": "Per equipment",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "—",
   "alertDays": "",
   "checks": "—",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 50/2005",
   "notes": "",
   "fields": [
    [
     "Issuing entity",
     "Text",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "EQ-03",
   "category": "Equipment",
   "section": "Inspections",
   "name": "Periodic safety inspection report",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company brings its own equipment",
   "canBeNA": true,
   "level": "Per equipment",
   "issueDate": true,
   "expiry": "Next inspection",
   "renewal": "Per plan",
   "alertDays": "30",
   "checks": "Result = pass",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 50/2005 arts. 6–7",
   "notes": "",
   "fields": [
    [
     "Result (pass / fail)",
     "List",
     true,
     true
    ],
    [
     "Competent person",
     "Text",
     true,
     true
    ],
    [
     "Issue date (inspection date)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (next inspection)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "EQ-04",
   "category": "Equipment",
   "section": "Maintenance",
   "name": "Maintenance records",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company brings its own equipment",
   "canBeNA": true,
   "level": "Per equipment",
   "issueDate": true,
   "expiry": "Next maintenance",
   "renewal": "Per plan",
   "alertDays": "30",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 22(1)(e)",
   "notes": "",
   "fields": [
    [
     "Work done",
     "Text",
     true,
     true
    ],
    [
     "Issue date (maintenance date)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (next maintenance)",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "EQ-05",
   "category": "Equipment",
   "section": "Documentation",
   "name": "Instruction manual in Portuguese",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company brings its own equipment",
   "canBeNA": true,
   "level": "Per equipment",
   "issueDate": false,
   "expiry": "No expiry",
   "renewal": "—",
   "alertDays": "",
   "checks": "Language = Portuguese",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 50/2005",
   "notes": "",
   "fields": [
    [
     "Language",
     "List",
     true,
     true
    ]
   ]
  },
  {
   "code": "EQ-06",
   "category": "Equipment",
   "section": "Calibration",
   "name": "Calibration certificate (measuring equipment)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If measuring equipment is used",
   "canBeNA": true,
   "level": "Per equipment",
   "issueDate": true,
   "expiry": "Printed on the document",
   "renewal": "By validity",
   "alertDays": "30",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Quality / contractual",
   "notes": "",
   "fields": [
    [
     "Calibration entity",
     "Text",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "EQ-07",
   "category": "Equipment",
   "section": "Insurance",
   "name": "Equipment insurance + receipt",
   "requirement": "Client requirement",
   "appliesWhen": "When the client selects it for a site or requests it",
   "canBeNA": false,
   "level": "Per equipment",
   "issueDate": true,
   "expiry": "Printed on the document (end of period paid)",
   "renewal": "Per premium",
   "alertDays": "30",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "Contractual",
   "notes": "",
   "fields": [
    [
     "Insurer",
     "Text",
     true,
     true
    ],
    [
     "Equipment covered",
     "List",
     true,
     true
    ],
    [
     "Issue date (period start)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (end of period paid)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "ST-01",
   "category": "Site",
   "section": "Site documents",
   "name": "Subcontract agreement, including the obligation to comply with the site safety plan",
   "requirement": "Mandatory",
   "appliesWhen": "Every site",
   "canBeNA": false,
   "level": "Site",
   "issueDate": true,
   "expiry": "Printed on the document (end of contract term)",
   "renewal": "Amendments",
   "alertDays": "",
   "checks": "Parties = client (or hiring contractor) and contractor; mentions the site; clause present",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 arts. 13(4) and 21(1)(d)",
   "notes": "",
   "fields": [
    [
     "Parties and tax numbers",
     "List",
     true,
     true
    ],
    [
     "Site",
     "Text",
     true,
     true
    ],
    [
     "Scope of work",
     "Text",
     true,
     true
    ],
    [
     "Safety plan clause present",
     "Yes/No",
     true,
     true
    ],
    [
     "Issue date (signature date)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (end of contract term)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "ST-02",
   "category": "Site",
   "section": "Site documents",
   "name": "Declaration of activity, schedule and contractor's site lead",
   "requirement": "Mandatory",
   "appliesWhen": "Every site",
   "canBeNA": false,
   "level": "Site",
   "issueDate": true,
   "expiry": "Printed on the document (planned exit)",
   "renewal": "On change",
   "alertDays": "",
   "checks": "Dates = participation dates",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 21(1)(c) and (e)",
   "notes": "Can be generated from the participation form and signed",
   "fields": [
    [
     "Activity on site",
     "Text",
     true,
     true
    ],
    [
     "Site lead name",
     "Text",
     true,
     true
    ],
    [
     "Site lead phone",
     "Text",
     true,
     true
    ],
    [
     "Planned entry",
     "Date",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (planned exit)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "ST-03",
   "category": "Site",
   "section": "Site documents",
   "name": "Safety plan (or procedure sheets) adherence declaration",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the site has a safety plan or procedure sheets",
   "canBeNA": true,
   "level": "Site",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "On plan change",
   "alertDays": "",
   "checks": "Version = site's current version",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 273/2003 arts. 12(3), 13(4), 20(b)",
   "notes": "",
   "fields": [
    [
     "Site",
     "Text",
     true,
     true
    ],
    [
     "Plan version",
     "Text",
     true,
     true
    ],
    [
     "Signatory",
     "Text",
     true,
     true
    ],
    [
     "Issue date (signature date)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "ST-04",
   "category": "Site",
   "section": "Site documents",
   "name": "Site induction record (recorded by the client)",
   "requirement": "Mandatory",
   "appliesWhen": "Every worker on site",
   "canBeNA": false,
   "level": "Site",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "Per entry",
   "alertDays": "",
   "checks": "Every allocated worker has induction",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "MVP",
   "legal": "DL 273/2003 art. 22(1)(a); Law 102/2009 art. 20",
   "notes": "",
   "fields": [
    [
     "Workers inducted",
     "List",
     true,
     false
    ],
    [
     "Trainer",
     "Text",
     true,
     false
    ],
    [
     "Issue date (induction date)",
     "Date",
     true,
     false
    ]
   ]
  },
  {
   "code": "ST-05",
   "category": "Site",
   "section": "Site documents",
   "name": "Working hours schedule mentioning the contract",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company has employees with an employment contract",
   "canBeNA": true,
   "level": "Site",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "On change",
   "alertDays": "",
   "checks": "—",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "Phase 2",
   "legal": "Labour Code",
   "notes": "",
   "fields": [
    [
     "Working hours",
     "Text",
     true,
     true
    ],
    [
     "Contract reference",
     "Text",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "ST-06",
   "category": "Site",
   "section": "Site documents",
   "name": "Second-line subcontractors list (subcontracting chain)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the contractor subcontracts on this site",
   "canBeNA": true,
   "level": "Site",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "Per entry",
   "alertDays": "",
   "checks": "Each listed company has its own profile and participation",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "Phase 2",
   "legal": "DL 273/2003 arts. 20(e)–(f), 21",
   "notes": "",
   "fields": [
    [
     "Companies, activities and dates",
     "List",
     true,
     true
    ],
    [
     "Issue date",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "ST-07",
   "category": "Site",
   "section": "Site documents",
   "name": "Equipment inspection after assembly on site",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If equipment is assembled on site",
   "canBeNA": true,
   "level": "Site",
   "issueDate": true,
   "expiry": "Next inspection",
   "renewal": "Per assembly",
   "alertDays": "",
   "checks": "Result = pass",
   "affectsStatus": true,
   "sharing": "Standard",
   "phase": "MVP",
   "legal": "DL 50/2005",
   "notes": "",
   "fields": [
    [
     "Equipment",
     "Text",
     true,
     true
    ],
    [
     "Result",
     "List",
     true,
     true
    ],
    [
     "Competent person",
     "Text",
     true,
     true
    ],
    [
     "Issue date (inspection date)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (next inspection)",
     "Date",
     false,
     true
    ]
   ]
  },
  {
   "code": "ST-08",
   "category": "Site",
   "section": "Site documents",
   "name": "Waste transport guides (e-GAR) and reception certificates",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If the company produces or transports waste itself",
   "canBeNA": true,
   "level": "Site",
   "issueDate": true,
   "expiry": "No expiry",
   "renewal": "Per transport",
   "alertDays": "",
   "checks": "Operator licensed (CO-05)",
   "affectsStatus": false,
   "sharing": "Standard",
   "phase": "Phase 2",
   "legal": "DL 102-D/2020",
   "notes": "",
   "fields": [
    [
     "Guide number",
     "Text",
     true,
     true
    ],
    [
     "Waste code",
     "Text",
     true,
     true
    ],
    [
     "Quantity",
     "Number",
     true,
     true
    ],
    [
     "Operator",
     "Text",
     true,
     true
    ],
    [
     "Issue date (transport date)",
     "Date",
     true,
     true
    ]
   ]
  },
  {
   "code": "ST-09",
   "category": "Site",
   "section": "Site documents",
   "name": "Temporary accommodation for displaced workers (plan, workers list, agreements, inspections)",
   "requirement": "Mandatory if applicable",
   "appliesWhen": "If workers are housed for this site",
   "canBeNA": true,
   "level": "Site",
   "issueDate": true,
   "expiry": "Next inspection",
   "renewal": "Per plan",
   "alertDays": "30",
   "checks": "Workers housed = allocated workers",
   "affectsStatus": true,
   "sharing": "Restricted",
   "phase": "Phase 2",
   "legal": "DL 123/2025",
   "notes": "",
   "fields": [
    [
     "Address",
     "Text",
     true,
     true
    ],
    [
     "Accommodation type",
     "List",
     true,
     true
    ],
    [
     "Workers housed",
     "List",
     true,
     true
    ],
    [
     "Issue date (last inspection)",
     "Date",
     true,
     true
    ],
    [
     "Expiry date (next inspection)",
     "Date",
     true,
     true
    ]
   ]
  }
 ],
 "statuses": [
  {
   "Object": "Document",
   "Status": "Missing",
   "Color": "Red",
   "Rule": "Required and never uploaded or entered",
   "Counts as compliant": "No"
  },
  {
   "Object": "Document",
   "Status": "File missing",
   "Color": "Orange",
   "Rule": "Data typed by the user, no file yet",
   "Counts as compliant": "No"
  },
  {
   "Object": "Document",
   "Status": "Processing",
   "Color": "Grey",
   "Rule": "Uploaded; Alma is reading it",
   "Counts as compliant": "No"
  },
  {
   "Object": "Document",
   "Status": "Needs attention",
   "Color": "Orange",
   "Rule": "Alma could not read a field, a check failed, or the file differs from typed data",
   "Counts as compliant": "No"
  },
  {
   "Object": "Document",
   "Status": "Valid",
   "Color": "Green",
   "Rule": "All checks passed, before its expiry date",
   "Counts as compliant": "Yes"
  },
  {
   "Object": "Document",
   "Status": "Expiring",
   "Color": "Amber",
   "Rule": "Valid, but within the alert window or expires before the end of a site stay",
   "Counts as compliant": "Yes, with alert"
  },
  {
   "Object": "Document",
   "Status": "Expired",
   "Color": "Red",
   "Rule": "Past its expiry date",
   "Counts as compliant": "No"
  },
  {
   "Object": "Document",
   "Status": "Rejected",
   "Color": "Red",
   "Rule": "Wrong type, another company's, or rejected by a client (for that client only)",
   "Counts as compliant": "No"
  },
  {
   "Object": "Document",
   "Status": "Not applicable",
   "Color": "Grey",
   "Rule": "Marked by the contractor with a justification (only 'Mandatory if applicable' types)",
   "Counts as compliant": "Yes"
  },
  {
   "Object": "Document",
   "Status": "Archived",
   "Color": "Grey",
   "Rule": "Previous version archived automatically when its replacement (Update button or Alma's suggestion) becomes Valid, or moved to the archive by the user; never deleted; read-only, shown in the document's History and in the category's Archived section, history kept; no longer counts (a required document archived becomes Missing)",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — profile",
   "Status": "Setting up",
   "Color": "Grey",
   "Rule": "Onboarding not finished",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — profile",
   "Status": "Incomplete",
   "Color": "Red",
   "Rule": "Any required document Missing, File missing, Needs attention, Expired or Rejected",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — profile",
   "Status": "Complete with alerts",
   "Color": "Amber",
   "Rule": "None of the above, but something Expiring",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — profile",
   "Status": "Complete",
   "Color": "Green",
   "Rule": "All required documents Valid or Not applicable",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — client",
   "Status": "Invited",
   "Color": "Grey",
   "Rule": "Invitation sent, not accepted",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — client",
   "Status": "Awaiting share",
   "Color": "Grey",
   "Rule": "Accepted, sharing not authorized",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — client",
   "Status": "Not qualified",
   "Color": "Red",
   "Rule": "A required document is missing, expired, rejected or not shared",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — client",
   "Status": "Qualified with alerts",
   "Color": "Amber",
   "Rule": "All fine, something Expiring",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — client",
   "Status": "Qualified",
   "Color": "Green",
   "Rule": "All required documents valid and shared",
   "Counts as compliant": "—"
  },
  {
   "Object": "Contractor — client",
   "Status": "Share revoked",
   "Color": "Grey",
   "Rule": "Revoked; client keeps read-only site records for the retention period",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — compliance",
   "Status": "Not compliant",
   "Color": "Red",
   "Rule": "A client or site document is missing, expired or rejected, or an allocated worker lacks a valid fitness certificate or is not in this month's insurance",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — compliance",
   "Status": "Compliant with alerts",
   "Color": "Amber",
   "Rule": "Something expires before the planned exit date",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — compliance",
   "Status": "Compliant",
   "Color": "Green",
   "Rule": "Everything valid until the planned exit date",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — entry",
   "Status": "Pending",
   "Color": "Grey",
   "Rule": "Not decided",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — entry",
   "Status": "Authorized",
   "Color": "Green",
   "Rule": "Decided by a person; available when compliance is green or amber",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — entry",
   "Status": "Authorized with exception",
   "Color": "Orange",
   "Rule": "Compliance red; written reason mandatory and logged",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — entry",
   "Status": "Refused",
   "Color": "Red",
   "Rule": "With reason",
   "Counts as compliant": "—"
  },
  {
   "Object": "Site — entry",
   "Status": "Exited",
   "Color": "Grey",
   "Rule": "Exit date recorded; starts 1-year retention",
   "Counts as compliant": "—"
  }
 ]
};
