/* The documents a risk can be built on (new-risk.html, js/risk-new.js), and what ALMA reads from
   each: the CSRD / CSDDD supplier documents (source: the catalog team's sheet, "docs-add-confluence").
   window.CM_RISK_DOCS: [{ id, topic, name, sector, country, desc, fields: [name] }]. */
window.CM_RISK_DOCS = [
 {
  "id": "R01",
  "topic": "ESG",
  "name": "Sustainability Report (VSME)",
  "sector": "All sections",
  "country": "EU",
  "desc": "Supplier's sustainability report prepared under the EU voluntary standard for SMEs (VSME), Basic or Comprehensive module. This is the reference document for SME suppliers: under the value chain cap post Omnibus, NOVABASE should not ask them for more than the VSME covers (\"value chain cap\")",
  "fields": [
   "Reporting year",
   "Module (Basic / Comprehensive)",
   "Turnover (€)",
   "Scope 1, 2 and 3 emissions (tCO2e)",
   "GHG intensity (tCO2e per € turnover)",
   "Energy consumption (MWh) and renewable share (%)",
   "Pollutant emissions reported (Y/N)",
   "Sites in or near biodiversity-sensitive areas (Y/N)",
   "Water withdrawal",
   "Waste and hazardous waste (t)",
   "Employees (number, by contract type and gender)",
   "Employee turnover rate (%)",
   "Work accidents, accident rate and fatalities",
   "Pay at or above minimum wage (Y/N)",
   "Gender pay gap (%)",
   "Collective bargaining coverage (%)",
   "Training hours per employee",
   "Human rights policy (Y/N)",
   "Anti-corruption policy (Y/N)",
   "Corruption convictions and fines (number, €)",
   "Assurance (Y/N, provider)",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R02",
  "topic": "ESG",
  "name": "Sustainability Statement (CSRD / ESRS) or Sustainability Report (GRI)",
  "sector": "All sections",
  "country": "Global",
  "desc": "Sustainability statement of a large supplier reporting under the CSRD (ESRS), or its sustainability report under GRI or another framework. Used instead of the VSME for large suppliers; ALMA extracts the same datapoints so suppliers do not fill in a second report.",
  "fields": [
   "Reporting year",
   "Framework (ESRS / GRI / other)",
   "Material topics",
   "Scope 1, 2 and 3 emissions (tCO2e)",
   "Energy consumption (MWh) and renewable share (%)",
   "Climate targets",
   "Employees",
   "Work accidents, accident rate and fatalities",
   "Gender pay gap (%)",
   "Value chain workers and affected communities covered (Y/N)",
   "Human rights and due diligence process (Y/N)",
   "Corruption convictions and fines (number, €)",
   "Limited or reasonable assurance (Y/N, provider)",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R03",
  "topic": "ESG",
  "name": "GHG Emissions Report",
  "sector": "All sections",
  "country": "Global",
  "desc": "Supplier's greenhouse gas inventory for a year, with Scope 1, 2 and, if available, 3 emissions. A CDP climate response is also accepted. The supplier's turnover is used to allocate its emissions to the client's Scope 3.",
  "fields": [
   "Reporting year",
   "Organisational boundary",
   "Scope 1 emissions (tCO2e)",
   "Scope 2 location-based (tCO2e)",
   "Scope 2 market-based (tCO2e)",
   "Scope 3 emissions (tCO2e) and categories",
   "Turnover for the same year (€)",
   "Base year",
   "Methodology (GHG Protocol / ISO 14064-1)",
   "Verified (Y/N)",
   "Verifier",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R04",
  "topic": "ESG",
  "name": "Product or Service Carbon Footprint",
  "sector": "All sections",
  "country": "Global",
  "desc": "Carbon footprint of a product or service supplied, per unit, used to calculate the NOVABASE's Scope 3 more precisely than with spend-based factors. Includes customer emissions reports from cloud and data centre providers and environmental product declarations.",
  "fields": [
   "Product or service",
   "Functional unit",
   "Footprint (kg CO2e per unit)",
   "Emissions allocated to the client (tCO2e, if provided)",
   "System boundary",
   "Methodology (ISO 14067 / GHG Protocol Product / EPD per ISO 14025)",
   "Primary data share (%)",
   "Verified (Y/N)",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R05",
  "topic": "ESG",
  "name": "Climate Transition Plan",
  "sector": "All sections",
  "country": "Global",
  "desc": "Supplier's plan to reduce its emissions in line with climate goals, with targets, actions and investment.",
  "fields": [
   "Base year",
   "Reduction targets (year, %)",
   "Scopes covered (1, 2, 3)",
   "Net-zero target (year)",
   "Decarbonisation levers",
   "Planned investment (€)",
   "Aligned with 1.5 °C (Y/N)",
   "Targets validated, e.g. SBTi (Y/N)",
   "Approved by management (Y/N)",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R06",
  "topic": "ESG",
  "name": "Substances of Concern Declaration (REACH / RoHS)",
  "sector": "C — Manufacturing; G — Wholesale and retail trade",
  "country": "EU",
  "desc": "Declaration of substances of concern and very high concern in the products supplied, used for the client's pollution disclosures and for chemical risks in the value chain.",
  "fields": [
   "Product",
   "REACH SVHC above 0.1 % w/w (Y/N, substances)",
   "SCIP notification number",
   "RoHS compliant (Y/N, exemptions)",
   "Other restricted substances, e.g. PFAS (Y/N)",
   "Candidate List version",
   "Signatory",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R07",
  "topic": "ESG",
  "name": "Environmental Permit and Compliance Record",
  "sector": "B — Mining; C — Manufacturing; D — Energy; E — Water and waste; F — Construction; H — Transport",
  "country": "Global",
  "desc": "Supplier's environmental permits and record of environmental incidents and penalties, used to assess pollution, water, waste and biodiversity impacts in the chain of activities.",
  "fields": [
   "Permits held (type, authority, number)",
   "Permit validity",
   "Environmental incidents in the period (number)",
   "Environmental fines and sanctions (number, €)",
   "Ongoing proceedings (Y/N)",
   "Remediation measures",
   "Issue date",
   "Expiry date (permit validity)"
  ]
 },
 {
  "id": "R08",
  "topic": "Ethics",
  "name": "Compliance Declaration",
  "sector": "All sections",
  "country": "Global",
  "desc": "Declaration signed by a legal representative covering anti-bribery, conflicts of interest and sanctions.",
  "fields": [
   "Template version",
   "Anti-corruption policy (Y/N)",
   "Anti-corruption training (Y/N)",
   "Corruption or bribery convictions and fines (number, €)",
   "Conflicts of interest declared (Y/N)",
   "Sanctions or restricted-party listing (Y/N)",
   "Signatory",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R09",
  "topic": "ESG",
  "name": "Grievance Mechanism Evidence",
  "sector": "All sections",
  "country": "Global",
  "desc": "Evidence that the supplier has a channel where workers, workers in its supply chain, communities and other third parties can raise concerns, and how complaints are handled.",
  "fields": [
   "Channel exists (Y/N)",
   "Open to external stakeholders (Y/N)",
   "Open to workers of sub-suppliers (Y/N)",
   "Languages",
   "Anonymous reporting (Y/N)",
   "Non-retaliation policy (Y/N)",
   "Complaints received (number, by topic: human rights, labour, environment, corruption)",
   "Complaints resolved (number)",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R10",
  "topic": "ESG",
  "name": "Human Rights Policy",
  "sector": "All sections",
  "country": "Global",
  "desc": "Supplier's public policy commitment on human rights and forced labour, with its due diligence process. A good policy: (1) refers to international standards: the UN Guiding Principles, OECD Guidelines, International Bill of Human Rights and ILO fundamental conventions; (2) applies to own operations, subsidiaries, business partners and sub-suppliers, and states what is expected of each; (3) covers the main rights: child labour and young workers, forced labour and trafficking, non-discrimination and equal pay, harassment, freedom of association and collective bargaining, living wage, working hours, health and safety, privacy, land and community rights, and the right to a healthy environment; (4) has specific forced labour rules: no recruitment fees paid by workers (employer-pays principle), no retention of identity documents, no debt bondage, freedom of movement and to resign, voluntary overtime, written contracts in a language the worker understands; (5) protects vulnerable groups such as migrant workers, women, children, indigenous peoples and human rights defenders; (6) describes the due diligence process: identify, assess and prioritise risks, prevent and mitigate, bring to an end, remediate, monitor effectiveness and report; (7) includes stakeholder engagement, a grievance mechanism, remediation of victims, training and consequences for breaches; (8) is approved by top management, has a named responsible person, is public, communicated to workers and partners, and reviewed periodically.",
  "fields": [
   "Policy title and version",
   "Standards referenced (UNGPs / OECD Guidelines / International Bill of Human Rights / ILO fundamental conventions)",
   "Scope (own operations / subsidiaries / business partners / sub-suppliers)",
   "Rights covered (child labour, forced labour, trafficking, non-discrimination, equal pay, harassment, freedom of association, collective bargaining, living wage, working hours, health and safety, privacy, land rights, healthy environment)",
   "Forced labour safeguards (no recruitment fees, no retention of documents, no debt bondage, freedom of movement, voluntary overtime, written contracts) (Y/N each)",
   "Vulnerable groups addressed (Y/N, which)",
   "Due diligence process (Y/N)",
   "Due diligence steps described (identify, prioritise, prevent, end, remediate, monitor, report)",
   "Risk assessment done (Y/N)",
   "Main risks identified",
   "Stakeholder engagement (Y/N)",
   "Grievance mechanism referenced (Y/N)",
   "Remediation process (Y/N)",
   "Training on the policy (Y/N)",
   "Consequences for breaches (Y/N)",
   "Approved by top management (Y/N)",
   "Responsible person or function",
   "Publicly available (Y/N)",
   "Communicated to business partners (Y/N)",
   "Review frequency",
   "Signatory",
   "Reporting year",
   "Issue date",
   "Expiry date (next review date)"
  ]
 },
 {
  "id": "R11",
  "topic": "ESG",
  "name": "Human Rights Due Diligence Statement",
  "sector": "All sections",
  "country": "Global",
  "desc": "Public statement or report a supplier publishes under a due diligence or transparency law (CSDDD, German Supply Chain Act LkSG, French Duty of Vigilance, Norwegian Transparency Act, UK or Australian Modern Slavery Act). Shows the due diligence process is applied, not only the policy.",
  "fields": [
   "Law or framework",
   "Reporting year",
   "Risk assessment done (Y/N)",
   "Prioritised risks",
   "Prevention and mitigation actions",
   "Remediation cases (number)",
   "Effectiveness monitoring (Y/N)",
   "Stakeholder engagement (Y/N)",
   "Approved by board (Y/N)",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R12",
  "topic": "ESG",
  "name": "Harassment Prevention Policy",
  "sector": "All sections",
  "country": "Global",
  "desc": "Supplier's policy or code of conduct to prevent and address moral and sexual harassment and violence at work, in line with ILO Convention 190. In Portugal, employers with 7 or more workers must adopt one.A good policy: (1) defines moral and sexual harassment, violence and discrimination, with examples; (2) applies to employees, temporary and subcontracted workers, and interactions with clients and third parties, including at client sites; (3) gives confidential and anonymous reporting channels, including outside the direct line manager; (4) sets an investigation procedure with deadlines, confidentiality and impartiality; (5) protects complainants and witnesses against retaliation; (6) sets disciplinary consequences; (7) provides training and awareness for managers and workers; (8) gives specific protection to workers at higher risk: migrants, women, night and shift workers, and workers alone at client sites; (9) is approved by management, communicated in languages workers understand, and reviewed periodically. For facility services suppliers (cleaning, security, catering) the client should request it together with the social audit, because these sectors combine low wages, migrant workers, subcontracting and work at client premises.",
  "fields": [
   "Policy title and version",
   "Legal basis (PT Labour Code art. 127(1)(k) / ILO C190 / other)",
   "Forms covered (moral harassment, sexual harassment, violence, discrimination) (Y/N each)",
   "Scope (employees / temporary workers / subcontracted workers / third parties at client sites)",
   "Reporting channels (Y/N, which)",
   "Anonymous reporting (Y/N)",
   "Investigation procedure and deadlines (Y/N)",
   "Non-retaliation protection (Y/N)",
   "Disciplinary consequences (Y/N)",
   "Training provided (Y/N, % of workers trained)",
   "Higher-risk workers addressed (migrants, women, night or shift work, lone work) (Y/N)",
   "Languages available",
   "Harassment complaints received (number)",
   "Complaints substantiated (number)",
   "Approved by management (Y/N)",
   "Communicated to workers (Y/N)",
   "Review frequency",
   "Signatory",
   "Issue date",
   "Expiry date (next review date)"
  ]
 },
 {
  "id": "R13",
  "topic": "ESG",
  "name": "Social Audit Report",
  "sector": "All sections (most common in A — Agriculture; C — Manufacturing)",
  "country": "Global",
  "desc": "Report of an independent audit of labour and human rights conditions at the supplier's site, example of reports are: SMETA / amfori BSCI / SA8000 / RBA VAP / other.",
  "fields": [
   "Standard (SMETA / amfori BSCI / SA8000 / RBA VAP / other)",
   "Audit firm",
   "Site audited",
   "Audit type (announced / semi-announced / unannounced)",
   "Non-conformities (critical, major, minor)",
   "Wages at or above legal minimum (Y/N)",
   "Working hours within legal limits (Y/N)",
   "Corrective action plan (Y/N)",
   "Issue date (audit date)",
   "Expiry date"
  ]
 },
 {
  "id": "R14",
  "topic": "Due diligence",
  "name": "Contractual ESG Clauses",
  "sector": "All sections",
  "country": "Global",
  "desc": "Annex or clauses in the supply contract where the supplier commits to human rights, environmental and ethical standards, and accepts verification.",
  "fields": [
   "Contract reference",
   "Clauses present (human rights, environment, anti-corruption, audit rights)",
   "Cascade to sub-suppliers (Y/N)",
   "Signatories",
   "Issue date (signature date)",
   "Expiry date (contract end)"
  ]
 },
 {
  "id": "R15",
  "topic": "ESG",
  "name": "Code of Conduct",
  "sector": "All sections",
  "country": "Global",
  "desc": "It usually covers: (1) labour and human rights: child and young workers, forced labour and trafficking, recruitment fees, wages and benefits, working hours, freedom of association and collective bargaining, non-discrimination, harassment and humane treatment; (2) health and safety, including emergency preparedness and worker accommodation; (3) environment: permits, energy and GHG emissions, pollution, water, waste, hazardous substances, biodiversity and deforestation; (4) business ethics: anti-corruption and bribery, gifts and hospitality, conflicts of interest, fair competition, anti-money laundering, sanctions and export controls, accurate records; (5) data protection, information security and confidentiality; (6) communities and land rights, and responsible sourcing of minerals; (7) management system: legal compliance, risk assessment, training, grievance mechanism with non-retaliation, reporting of breaches to the client, audit rights, corrective actions, cascade to sub-suppliers and consequences of non-compliance. ALMA checks which topics the version covers and any deviations the supplier requested.",
  "fields": [
   "Supplier",
   "Code version and date",
   "Labour and human rights topics covered (child labour, forced labour, recruitment fees, wages, working hours, freedom of association, non-discrimination, harassment)",
   "Health and safety covered (Y/N)",
   "Environmental topics covered (permits, GHG, pollution, water, waste, hazardous substances, biodiversity, deforestation)",
   "Ethics topics covered (anti-corruption, gifts, conflicts of interest, competition, money laundering, sanctions, accurate records)",
   "Data protection and information security covered (Y/N)",
   "Communities, land rights and responsible minerals covered (Y/N)",
   "Aligned with UNGPs / OECD Guidelines / ILO core conventions (Y/N)",
   "Audit and verification rights accepted (Y/N)",
   "Duty to report breaches to the client (Y/N, deadline)",
   "Corrective action and remediation obligations (Y/N)",
   "Consequences of non-compliance (suspension / termination) (Y/N)",
   "Cascade to sub-suppliers required (Y/N)",
   "Staff training required (Y/N)",
   "Supplier workers can use the client grievance channel (Y/N)",
   "Deviations or exceptions requested by the supplier (Y/N, which)",
   "Expiry date (new code version or re-signature date)"
  ]
 },
 {
  "id": "R16",
  "topic": "Due diligence",
  "name": "Relevant Sub-supplier and Site List",
  "sector": "All sections",
  "country": "Global",
  "desc": "List of the supplier's sites and main sub-suppliers involved in the products or services supplied to the client, with countries. Used to map the chain of activities and prioritise risks by country and sector.",
  "fields": [
   "Sites (name, country, activity)",
   "Main sub-suppliers (name, country, activity)",
   "Products or services linked",
   "Subcontracted activities (Y/N)",
   "Labour providers or recruitment agencies used (Y/N)",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R17",
  "topic": "Due diligence",
  "name": "Due Diligence Self-Assessment",
  "sector": "All sections",
  "country": "Global",
  "desc": "Supplier's answers to a due diligence questionnaire on its operations, sub-suppliers and risks.",
  "fields": [
   "Countries of operation",
   "Countries of origin of main materials",
   "Critical sub-suppliers",
   "Child and forced labour controls (Y/N)",
   "Recruitment fees charged to workers (Y/N)",
   "Wages and working hours practices",
   "Freedom of association (Y/N)",
   "Health and safety management (Y/N)",
   "Environmental permits (Y/N)",
   "Incidents in the period",
   "Respondent",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R18",
  "topic": "Due diligence",
  "name": "Corrective Action Plan",
  "sector": "All sections",
  "country": "Global",
  "desc": "Plan with the actions agreed to fix findings from an audit, a self-assessment or a complaint, with deadlines and evidence.",
  "fields": [
   "Source (audit / assessment / complaint)",
   "Findings",
   "Actions",
   "Responsible",
   "Deadlines",
   "Status (open / closed)",
   "Closure evidence (Y/N)",
   "Issue date"
  ]
 },
 {
  "id": "R19",
  "topic": "H&S",
  "name": "Health and Safety Statistics",
  "sector": "All sections",
  "country": "Global",
  "desc": "Supplier's accident figures for a year: hours worked, accidents, frequency and severity rates, fatalities.",
  "fields": [
   "Reporting year",
   "Hours worked",
   "Workers covered by an H&S management system (%)",
   "Recordable work accidents",
   "Lost-time accidents",
   "Days lost",
   "Fatalities",
   "Cases of work-related ill health",
   "Frequency rate",
   "Severity rate",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R20",
  "topic": "ESG",
  "name": "Raw Material Origin and Traceability Declaration (forced labour risk)",
  "sector": "C — Manufacturing; G — Wholesale and retail trade",
  "country": "Global",
  "desc": "Declaration of the origin of high forced-labour-risk materials in a product (e.g. cotton, polysilicon, aluminium, steel, rubber, PVC) and its supply chain. Also supports the EU Forced Labour Regulation.",
  "fields": [
   "Product",
   "Material",
   "Countries of origin of the material",
   "Regions of origin",
   "Supply chain tiers",
   "Traceability evidence (Y/N)",
   "Signatory",
   "Issue date"
  ]
 },
 {
  "id": "R21",
  "topic": "Breaches and litigation",
  "name": "Litigation and Legal Proceedings Disclosure",
  "sector": "All sections",
  "country": "Global",
  "desc": "Declaration by a legal representative listing pending and closed court, arbitration and administrative cases against the supplier on human rights, labour, health and safety, environment, corruption, competition or data protection, in the last 3 years. Pending cases are allegations, not proven breaches: they flag risk but must not be scored as breaches until decided. .",
  "fields": [
   "Period covered",
   "Cases (number)",
   "For each case: topic (human rights / labour / H&S / environment / corruption / competition / data protection / other), court or authority, country, case reference, status (alleged / under investigation / pending / decided / appealed / settled), date opened, outcome, amount (€)",
   "Remediation measures",
   "Signatory",
   "Issue date",
   "Expiry date (calculated)"
  ]
 },
 {
  "id": "R22",
  "topic": "Breaches and litigation",
  "name": "Regulatory Sanction or Inspection Report",
  "sector": "All sections",
  "country": "Global",
  "desc": "Decisions and reports from public authorities on the supplier: labour inspection, environmental inspection, health and safety, data protection and competition authorities (e.g. PT ACT, IGAMAOT, CNPD, AdC). Includes fines, warnings, suspension orders and permit withdrawals. Beyond the VSME cap: voluntary for suppliers with fewer than 1,000 employees, unless needed for the client's CSDDD due diligence.",
  "fields": [
   "Authority",
   "Country",
   "Inspection or decision date",
   "Topic (labour / H&S / environment / data protection / competition / other)",
   "Findings",
   "Sanction type (fine / warning / suspension / permit withdrawal / none)",
   "Amount (€)",
   "Final (Y/N)",
   "Corrective actions",
   "Closed (Y/N)",
   "Issue date"
  ]
 },
 {
  "id": "R23",
  "topic": "Breaches and litigation",
  "name": "Allegation and Response Record",
  "sector": "All sections",
  "country": "Global",
  "desc": "Allegations made publicly or formally against the supplier (OECD National Contact Point cases, NGO or union reports, media investigations) and the supplier's response. Used to identify potential adverse impacts; an allegation is not proof of breach.",
  "fields": [
   "Source (OECD NCP / NGO / union / media / other)",
   "Date",
   "Topic",
   "Countries or sites concerned",
   "Allegation summary",
   "Supplier response (Y/N, date)",
   "Investigation done (Y/N)",
   "Outcome (unfounded / confirmed / ongoing)",
   "Remediation measures",
   "Issue date"
  ]
 },
 {
  "id": "R24",
  "topic": "Certifications",
  "name": "Management System Certificate (ISO 14001 / 45001 / 50001 / 37001 / SA8000)",
  "sector": "All sections",
  "country": "Global",
  "desc": "Certificate confirming the supplier's environmental, health and safety, energy, anti-bribery or social accountability management system.",
  "fields": [
   "Standard",
   "Certification body",
   "Accredited (Y/N)",
   "Certificate number",
   "Scope",
   "Sites covered",
   "Issue date",
   "Expiry date"
  ]
 },
 {
  "id": "R25",
  "topic": "Certifications",
  "name": "ESG Rating Scorecard (EcoVadis or equivalent)",
  "sector": "All sections",
  "country": "Global",
  "desc": "Third-party assessment of the supplier's sustainability performance, such as an EcoVadis scorecard or a CDP score.",
  "fields": [
   "Rating provider",
   "Company",
   "Score",
   "Medal or band",
   "Theme scores (environment, labour and human rights, ethics, sustainable procurement)",
   "Issue date",
   "Expiry date"
  ]
 }
];
/* For now, a short list to build a risk on: seven documents, and four of what ALMA reads from each
   (an index into its fields), with when that field counts as OK.
   window.CM_RISK_PICK: [{ id, fields: [{ i, ok }] }]; window.CM_RISK_SHORT(name): a field's name
   without its brackets ("Anti-corruption policy (Y/N)" → "Anti-corruption policy"). */
window.CM_RISK_PICK = [
 { id: "R08", fields: [{ i: 1, ok: "Yes" }, { i: 3, ok: "None" }, { i: 5, ok: "Not listed" }, { i: 8, ok: "Not expired" }] },
 { id: "R10", fields: [{ i: 4, ok: "Yes, all of them" }, { i: 6, ok: "Yes" }, { i: 15, ok: "Yes" }, { i: 23, ok: "Not expired" }] },
 { id: "R11", fields: [{ i: 2, ok: "Yes" }, { i: 4, ok: "Described" }, { i: 8, ok: "Yes" }, { i: 10, ok: "Not expired" }] },
 { id: "R12", fields: [{ i: 4, ok: "Yes" }, { i: 7, ok: "Yes" }, { i: 9, ok: "Yes" }, { i: 19, ok: "Not expired" }] },
 { id: "R13", fields: [{ i: 4, ok: "No critical ones" }, { i: 5, ok: "Yes" }, { i: 6, ok: "Yes" }, { i: 9, ok: "Not expired" }] },
 { id: "R15", fields: [{ i: 2, ok: "All of them" }, { i: 9, ok: "Yes" }, { i: 13, ok: "Yes" }, { i: 17, ok: "Not expired" }] },
 { id: "R09", fields: [{ i: 0, ok: "Yes" }, { i: 4, ok: "Yes" }, { i: 5, ok: "Yes" }, { i: 9, ok: "Not expired" }] }
];
window.CM_RISK_SHORT = (n) => String(n).replace(/\s*\([^)]*\)/g, "").trim();
/* The ten colours a risk's levels can take, from dark green (lowest risk) to dark red (highest).
   The light green, yellow, orange and red ones are the app's tags (css/tags.css) and matrix dots;
   the six between are in the same family. window.CM_RISK_COLORS: [{ id, name }]; each id has a tag
   class (.rk-t-<id>: background and text) and a dot class (.rk-d-<id>), in both themes.
   CM_RISK_COLOR(id) also takes the four colours of before (green, yellow, orange, red). */
window.CM_RISK_COLORS = [
 { id: "c1", name: "Dark green" }, { id: "c2", name: "Green" }, { id: "c3", name: "Light green" }, { id: "c4", name: "Lime" }, { id: "c5", name: "Yellow" },
 { id: "c6", name: "Amber" }, { id: "c7", name: "Orange" }, { id: "c8", name: "Dark orange" }, { id: "c9", name: "Red" }, { id: "c10", name: "Dark red" }
];
window.CM_RISK_COLOR = (c) => ({ green: "c3", yellow: "c5", orange: "c7", red: "c9" }[c] || (window.CM_RISK_COLORS.some((x) => x.id === c) ? c : "c3"));
(() => {
  if (document.getElementById("rk-colors")) return;
  // [id, light bg, light fg, dot, dark bg, dark fg, dark dot]; null: the app's own tag colours
  const P = [
    ["c1", "#c9e3bd", "#1f4a14", "#2f6b23", "#2e5a22", "#eaf8e2", "#5f9a4c"],
    ["c2", "#d5eacb", "#2a5c1d", "#4f9a3f", "#3d6f2f", "#f0fbea", "#76b061"],
    ["c3", "var(--tag-green-bg)", "var(--tag-green-fg)", "var(--color-ok-deep, #8ccb86)"],
    ["c4", "#eef0c4", "#545d07", "#b9c64a", "#6b7420", "#fbfde8", "#c5d25a"],
    ["c5", "var(--tag-yellow-bg)", "var(--tag-yellow-fg)", "#e7b04a"],
    ["c6", "#fde6bf", "#7d4a00", "#e8962f", "#b8761c", "#fff6e6", "#eea444"],
    ["c7", "var(--tag-orange-bg)", "var(--tag-orange-fg)", "#e07a3a"],
    ["c8", "#f9d6c4", "#8c2f0c", "#cc5426", "#a3401c", "#fff0e8", "#e06a3a"],
    ["c9", "var(--tag-red-bg)", "var(--tag-red-fg)", "#b3261e", null, null, "#e0473e"],
    ["c10", "#f0c9c6", "#6e1410", "#7a1712", "#7e1c1f", "#ffecec", "#b8302f"]
  ];
  const s = document.createElement("style"); s.id = "rk-colors";
  s.textContent = P.map(([id, bg, fg, dot, dbg, dfg, ddot]) => `.rk-t-${id} { background: ${bg}; color: ${fg}; } .rk-d-${id} { background: ${dot}; }`
    + (dbg ? ` html[data-theme="dark"] .rk-t-${id} { background: ${dbg}; color: ${dfg}; }` : "")
    + (ddot ? ` html[data-theme="dark"] .rk-d-${id} { background: ${ddot}; }` : "")).join("\n");
  document.head.appendChild(s);
})();
