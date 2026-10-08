/* The product sheets (formerly Product DD) behind Beatriz's Product overview: one per SKU, with
   every regulation that applies to it. Three things live in other places and are only linked
   and summed up here, so nothing is kept twice:
   - packaging (PPWR) is kept per format (F3), because one box or pallet serves many products;
   - lots and parcels (EUDR) are kept with the shipments (F5) and parcels (F4), because they
     change with every shipment while the product stays the same;
   - company documents (E01, E05, E06…) are uploaded once at company level and inherited here,
     counting towards the product's compliance with no new upload.
   Which blocks a sheet shows comes from the product's triage: P1 (an EUDR commodity), P2 (a
   forced-labour risk input or region, for the reinforced check) and P4 (packaging placed on the
   EU market). Each product also lists its suppliers: [name, country, what they supply, alerts],
   an alert being [state, text]. Prototype data, kept here. */
window.PRODUCTS = (() => {
  // the eight areas of law a product must have been made under in its country of production
  // (EUDR art. 2(40); question P07 of the triage)
  const LEGAL = ['Land use rights', 'Environmental protection', 'Forest-related rules', 'Third parties’ rights', 'Labour rights',
    'Human rights under international law', 'Free, prior and informed consent', 'Tax, anti-corruption, trade and customs'];

  // company-level documents a product inherits; `for` is the regulation each counts towards
  const DOCS = {
    E01: { name: 'Business registration and export licence', for: 'EUDR', state: 'ok', until: '3 Jan 2027' },
    E05: { name: 'Supplier code of conduct', for: 'FLR', state: 'ok', until: 'Reviewed yearly' },
    E06: { name: 'Due diligence system statement (EUDR)', for: 'EUDR', state: 'ok', until: '30 Jun 2027' },
    E08: { name: 'Human rights and forced labour policy', for: 'FLR', state: 'ok', until: 'Reviewed yearly' },
    E11: { name: 'Grievance mechanism procedure', for: 'FLR', state: 'review', until: 'Update in review' },
    E14: { name: 'Packaging compliance declaration', for: 'PPWR', state: 'ok', until: '31 Dec 2026' },
  };

  // what each commodity brings with it: where it comes from, who sits between the farm and
  // Veridian, how it is checked for forced labour, and what the legality documents are
  const C = {
    coffee: {
      commodity: 'Coffee', family: 'Coffee',
      legal: ['Rural Environmental Registry (CAR) record', 'State environmental licence', 'Justification: no forest harvesting on coffee farms; deforestation-free since 2020 by satellite check', 'Neighbouring land claims search, clear',
        'Labour inspection certificate (CNDT)', 'Rainforest Alliance certificate', 'Justification: no indigenous or traditional land within 10 km of the parcels', 'Tax and customs clearance certificates'],
      criteria: ['Country benchmarked as standard risk', 'Deforestation alerts near parcels in the last 24 months', 'Complexity of the supply chain (cooperatives pool many small farms)', 'Prevalence of informal labour at harvest'],
      mitigation: ['Satellite monitoring of every parcel, monthly', 'Physical segregation of verified lots at the dry mill', 'Second-party visits to 10% of farms per season'],
      flr: { inputs: ['Green coffee (Arabica)'], audits: [['Rainforest Alliance audit', 'Cooxupé, Minas Gerais', 'Mar 2026', 'ok'], ['Social audit (SMETA 4-pillar)', 'Dry mill, Varginha', 'Jan 2026', 'ok']],
        alerts: [], actions: ['Harvest-season worker contracts sampled at 12 farms; all written and paid at or above the minimum wage.'] },
    },
    cocoa: {
      commodity: 'Cocoa', family: 'Cocoa',
      legal: ['Land title or customary land certificate', 'Environmental impact notice', 'Justification: farms are outside classified forests; checked against the national forest map', 'Community consultation record',
        'Child labour monitoring (CLMRS) report', 'Human rights due diligence report', 'FPIC record for the two communities in the catchment', 'Export and tax clearance (CCC)'],
      criteria: ['Country benchmarked as standard risk', 'Cocoa grown near classified forests', 'Child labour risk in cocoa-growing regions', 'Many smallholders behind each cooperative'],
      mitigation: ['Polygon mapping of every farm over 4 ha', 'Child labour monitoring and remediation (CLMRS) in all member communities', 'Cooperative-level traceability, bean to bag'],
      flr: { inputs: ['Cocoa beans'], audits: [['Fairtrade audit', 'Coopérative Agricole Soubré', 'Apr 2026', 'ok'], ['CLMRS verification', 'Kuapa Kokoo Union, Ashanti', 'Jun 2026', 'review']],
        alerts: ['Two cases of children carrying heavy loads reported through CLMRS in Ashanti, May 2026'], actions: ['Both cases remediated with the households; school kits and a community labour group funded. Follow-up visit booked for November.'] },
    },
    palm: {
      commodity: 'Oil palm', family: 'Vegetable oils',
      legal: ['Plantation business permit (IUP) and HGU land title', 'Environmental permit (AMDAL)', 'Justification: no planting on peat or forest after 2020; checked against the national moratorium map', 'Land dispute register search',
        'Labour inspection report', 'RSPO certificate', 'FPIC record with neighbouring communities', 'Tax and export duty clearance'],
      criteria: ['Country benchmarked as standard risk', 'Deforestation alert inside one supplying parcel', 'Mill buys fresh fruit bunches from independent smallholders', 'Forced labour indicators reported in the region'],
      mitigation: ['Supplying parcel suspended until the alert is resolved', 'Mill traceability to plantation for 100% of fresh fruit bunches', 'Independent social audit commissioned'],
      flr: { inputs: ['Fresh fruit bunches'], audits: [['RSPO audit', 'PT Sawit Makmur mill, Riau', 'Feb 2026', 'ok'], ['Independent social audit', 'PT Sawit Makmur estate', 'Booked Nov 2026', 'missing']],
        alerts: ['Workers’ identity documents held by a labour agent (worker interviews, Aug 2026)', 'Recruitment fees charged to migrant harvesters'], actions: ['Documents returned to all 41 workers; agent dropped by the estate.', 'Fee repayment plan agreed; first repayments to be evidenced by December.'] },
    },
    soy: {
      commodity: 'Soya', family: 'Oilseeds',
      legal: ['Rural Environmental Registry (CAR) record', 'Environmental licence', 'Justification: no native vegetation cleared after 2020; Soy Moratorium list checked', 'Land registry search, clear',
        'Labour inspection certificate', 'No listing on the national "dirty list" of employers', 'Justification: no indigenous land within the property or its buffer', 'Tax and customs clearance certificates'],
      criteria: ['Country benchmarked as standard risk', 'Cerrado conversion pressure in the region', 'Grain mixed at the crusher with other farms'],
      mitigation: ['Segregated crushing runs for verified soy', 'Satellite check of every supplying farm before each harvest'],
      flr: { inputs: ['Soybeans'], audits: [['RTRS audit', 'Agropecuária Rio Verde', 'May 2026', 'ok']], alerts: [], actions: ['Farm worker register checked against the national "dirty list" every quarter.'] },
    },
    rubber: {
      commodity: 'Rubber', family: 'Rubber',
      legal: ['Land title (Chanote)', 'Environmental permit', 'Justification: plantation established in 1998, outside forest reserves', 'Neighbour boundary agreement',
        'Labour inspection report', 'Human rights self-assessment', 'Justification: no indigenous communities on or next to the estate', 'Tax and export clearance'],
      criteria: ['Country benchmarked as standard risk', 'Smallholder latex mixed at the collection point'],
      mitigation: ['Collection point keeps separate tanks for mapped estates'],
      flr: { inputs: ['Natural rubber latex'], audits: [['FSC chain of custody audit', 'Thai Rubber Estates Ltd', 'Apr 2026', 'ok']], alerts: [], actions: ['Tappers’ piece rates checked against the minimum wage each season.'] },
    },
    wood: {
      commodity: 'Wood', family: 'Timber',
      legal: ['Forest management plan approval (PMFS)', 'Environmental operating licence', 'Forest origin document (DOF)', 'Land registry search, clear',
        'Labour inspection report', 'FSC certificate', 'FPIC record with the riverside community', 'Tax and export clearance'],
      criteria: ['Country benchmarked as standard risk', 'Illegal logging risk in the Amazon region', 'Species identification (CITES check)'],
      mitigation: ['Timber tracking by log tag from stump to sawmill', 'Wood anatomy test on one shipment per quarter'],
      flr: { inputs: ['Logs (Ipê, Jatobá)'], audits: [['FSC forest management audit', 'Madeireira Floresta Norte, Pará', 'Mar 2026', 'ok'], ['Social audit', 'Logging camp, Paragominas', 'Due Oct 2026', 'missing']],
        alerts: ['Camp housing below standard reported by the FSC auditor'], actions: ['New housing block under construction; photos due with the social audit.'] },
    },
    cattle: {
      commodity: 'Cattle', family: 'Meat',
      legal: ['Rural property registration', 'Environmental licence', 'Justification: pasture established before 2020; checked against the 2020 forest map', 'Land registry search, clear',
        'Labour inspection report', 'Human rights due diligence report', 'Justification: no indigenous land within the ranch or its buffer', 'Sanitary (SENACSA) and export clearance'],
      criteria: ['Country benchmarked as standard risk', 'Animals moved between ranches before slaughter (indirect suppliers)', 'Chaco conversion pressure'],
      mitigation: ['Animal movement records traced to the birth ranch', 'Indirect suppliers screened before each purchase'],
      flr: { inputs: ['Live cattle'], audits: [['Animal welfare and social audit', 'Estancia Las Lomas', 'Due Dec 2026', 'missing']], alerts: [], actions: [] },
    },
  };

  const lot = (code, parcel, region, state) => ({ code, parcel, region, state });
  const P = [
    { id: 'roasted-coffee', sku: 'VH-COF-201', name: 'Roasted coffee beans', hs: '0901.21', hsText: 'Coffee, roasted, not decaffeinated', c: 'coffee', status: 'ok',
      made: 'United States (roastery, New Orleans)', origins: [['Brazil', 'Minas Gerais'], ['Colombia', 'Huila']], markets: ['Netherlands', 'Germany', 'Belgium'],
      clients: [['Rotterdam Roasters BV', 'Importer'], ['Café Direct Hamburg GmbH', 'Importer'], ['Belgian Cocoa Works NV', 'Client']],
      p2: false, p4: true, lots: [lot('LOT-2026-114', 'Plot BR-MG-00231', 'Minas Gerais', 'ok'), lot('LOT-2026-076', 'Plot CO-HU-00512', 'Huila', 'ok'), lot('LOT-2026-161', 'Plot BR-MG-00244', 'Minas Gerais', 'ok')],
      tree: ['Veridian Harvest Co.', [['Rotterdam roastery partner', [['Cooxupé cooperative', [['Fazenda Santa Luzia', []], ['Sítio Boa Vista', []]]]]], ['Finca El Mirador', []]]],
      pack: [['F3-PK-014', '1 kg valve bag, kraft and PE', 'ok'], ['F3-PL-002', 'EUR pallet, stretch-wrapped', 'ok']], suppliers: [['Cooxupé cooperative', 'Brazil', 'Green coffee (Arabica)', []], ['Finca El Mirador', 'Colombia', 'Green coffee (Arabica)', []], ['Rotterdam roastery partner', 'Netherlands', 'Roasting service', []]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E14'] },
    { id: 'green-coffee', sku: 'VH-COF-110', name: 'Green coffee beans', hs: '0901.11', hsText: 'Coffee, not roasted, not decaffeinated', c: 'coffee', status: 'ok',
      made: 'Brazil (dry mill, Varginha)', origins: [['Brazil', 'Minas Gerais']], markets: ['Netherlands', 'Spain'],
      clients: [['Rotterdam Roasters BV', 'Importer'], ['Iberia Grain Imports SL', 'Importer']],
      p2: false, p4: true, lots: [lot('LOT-2026-114', 'Plot BR-MG-00231', 'Minas Gerais', 'ok'), lot('LOT-2026-118', 'Plot BR-MG-00237', 'Minas Gerais', 'ok')],
      tree: ['Veridian Harvest Co.', [['Cooxupé cooperative', [['Fazenda Santa Luzia', []], ['Fazenda Recanto', []]]]]],
      pack: [['F3-PK-031', '60 kg jute sack', 'ok'], ['F3-PL-002', 'EUR pallet, stretch-wrapped', 'ok']], suppliers: [['Cooxupé cooperative', 'Brazil', 'Green coffee (Arabica)', []], ['Fazenda Santa Luzia', 'Brazil', 'Coffee cherries', []]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E14'] },
    { id: 'cocoa-butter', sku: 'VH-COC-410', name: 'Cocoa butter', hs: '1804.00', hsText: 'Cocoa butter, fat and oil', c: 'cocoa', status: 'review',
      made: 'Côte d’Ivoire (pressing plant, San-Pédro)', origins: [['Côte d’Ivoire', 'Soubré'], ['Ghana', 'Ashanti']], markets: ['Belgium', 'Netherlands'],
      clients: [['Belgian Cocoa Works NV', 'Importer']],
      p2: true, p4: true, lots: [lot('LOT-2026-108', 'Plot CI-SM-00897', 'Soubré', 'review'), lot('LOT-2026-155', 'Plot GH-AS-00234', 'Ashanti', 'review'), lot('LOT-2026-097', 'Plot CI-SM-00871', 'Soubré', 'ok')],
      tree: ['Veridian Harvest Co.', [['San-Pédro pressing plant', [['Coopérative Agricole Soubré', [['412 member farms', []]]], ['Kuapa Kokoo Union', [['1,180 member farms', []]]]]]]],
      legalState: { 4: 'review', 6: 'review' }, pack: [['F3-PK-022', '25 kg lined carton', 'review'], ['F3-PL-002', 'EUR pallet, stretch-wrapped', 'ok']], suppliers: [['San-Pédro pressing plant', 'Côte d’Ivoire', 'Cocoa butter (pressing)', []], ['Coopérative Agricole Soubré', 'Côte d’Ivoire', 'Cocoa beans', []], ['Kuapa Kokoo Union', 'Ghana', 'Cocoa beans', [['review', 'Child labour cases under remediation']]]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E11', 'E14'] },
    { id: 'dark-chocolate', sku: 'VH-COC-702', name: 'Dark chocolate couverture, 70%', hs: '1806.32', hsText: 'Chocolate in blocks, not filled', c: 'cocoa', status: 'pend',
      made: 'Belgium (toll manufacturer, Wieze)', origins: [['Côte d’Ivoire', 'Soubré'], ['Ghana', 'Ashanti']], markets: ['Belgium', 'France', 'Germany'],
      clients: [['Belgian Cocoa Works NV', 'Client'], ['Meridian Foods Hamburg', 'Client']],
      p2: true, p4: true, lots: [lot('LOT-2026-155', 'Plot GH-AS-00234', 'Ghana, Ashanti', 'review'), lot('LOT-2026-170', 'Pending', '—', 'missing')],
      tree: ['Veridian Harvest Co.', [['Toll manufacturer, Wieze', [['Cocoa mass: San-Pédro pressing plant', [['Coopérative Agricole Soubré', []]]], ['Cocoa butter: San-Pédro pressing plant', [['Kuapa Kokoo Union', []]]], ['Sugar: EU beet sugar (not an EUDR commodity)', []]]]]],
      legalState: { 0: 'missing', 4: 'review', 6: 'missing' }, segregation: false, pack: [['F3-PK-040', '10 kg callets bag in carton', 'missing'], ['F3-PL-002', 'EUR pallet, stretch-wrapped', 'ok']], suppliers: [['Toll manufacturer, Wieze', 'Belgium', 'Couverture (manufacturing)', []], ['San-Pédro pressing plant', 'Côte d’Ivoire', 'Cocoa mass and butter', [['missing', 'Origin parcel not linked for LOT-2026-170']]], ['Kuapa Kokoo Union', 'Ghana', 'Cocoa beans', [['review', 'Child labour cases under remediation']]], ['Tiense Suiker', 'Belgium', 'Beet sugar', []]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E11', 'E14'] },
    { id: 'crude-palm-oil', sku: 'VH-PLM-100', name: 'Crude palm oil', hs: '1511.10', hsText: 'Palm oil, crude', c: 'palm', status: 'bad',
      made: 'Indonesia (mill, Riau)', origins: [['Indonesia', 'Riau']], markets: ['Netherlands'],
      clients: [['NorthSea Oils Rotterdam', 'Importer']],
      p2: true, p4: false, lots: [lot('LOT-2026-121', 'Plot ID-RI-01123', 'Riau', 'bad'), lot('LOT-2026-104', 'Plot ID-RI-01098', 'Riau', 'ok'), lot('LOT-2026-133', 'Plot ID-RI-01123', 'Riau', 'bad')],
      tree: ['Veridian Harvest Co.', [['PT Sawit Makmur mill', [['PT Sawit Makmur estate', []], ['Independent smallholders (38)', []]]]]],
      legalState: { 2: 'bad', 4: 'review' }, negligible: false, suppliers: [['PT Sawit Makmur mill', 'Indonesia', 'Crude palm oil', [['bad', 'Deforestation alert on Plot ID-RI-01123'], ['bad', 'Identity documents held by a labour agent']]], ['PT Sawit Makmur estate', 'Indonesia', 'Fresh fruit bunches', [['review', 'Recruitment fees being repaid']]], ['Independent smallholders (38)', 'Indonesia', 'Fresh fruit bunches', []]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E11'] },
    { id: 'refined-soybean-oil', sku: 'VH-SOY-220', name: 'Refined soybean oil', hs: '1507.90', hsText: 'Soya-bean oil, refined', c: 'soy', status: 'ok',
      made: 'Brazil (refinery, Rondonópolis)', origins: [['Brazil', 'Mato Grosso'], ['Argentina', 'Santa Fe']], markets: ['Spain', 'Portugal'],
      clients: [['Iberia Grain Imports SL', 'Importer']],
      p2: false, p4: true, lots: [lot('LOT-2026-099', 'Plot BR-MT-00456', 'Mato Grosso', 'ok'), lot('LOT-2026-063', 'Plot AR-SF-00188', 'Santa Fe', 'ok')],
      tree: ['Veridian Harvest Co.', [['Rondonópolis refinery', [['Agropecuária Rio Verde', []], ['Agro Santa Fe SA', []]]]]],
      pack: [['F3-IB-001', '1,000 l IBC tote', 'ok']], suppliers: [['Rondonópolis refinery', 'Brazil', 'Refined soybean oil', []], ['Agropecuária Rio Verde', 'Brazil', 'Soybeans', []], ['Agro Santa Fe SA', 'Argentina', 'Soybeans', []]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E14'] },
    { id: 'natural-rubber', sku: 'VH-RUB-300', name: 'Natural rubber sheets (RSS3)', hs: '4001.21', hsText: 'Smoked sheets of natural rubber', c: 'rubber', status: 'ok',
      made: 'Thailand (smokehouse, Surat Thani)', origins: [['Thailand', 'Surat Thani']], markets: ['Belgium', 'Germany'],
      clients: [['Continental Rubber Antwerp', 'Importer']],
      p2: false, p4: false, lots: [lot('LOT-2026-130', 'Plot TH-ST-00219', 'Surat Thani', 'ok')],
      tree: ['Veridian Harvest Co.', [['Thai Rubber Estates Ltd', [['Estate tappers (64)', []]]]]],
      suppliers: [['Thai Rubber Estates Ltd', 'Thailand', 'Natural rubber latex', []]],
      docs: ['E01', 'E05', 'E06', 'E08'] },
    { id: 'sawn-hardwood', sku: 'VH-WOD-510', name: 'Sawn tropical hardwood', hs: '4407.29', hsText: 'Wood sawn lengthwise, tropical', c: 'wood', status: 'review',
      made: 'Brazil (sawmill, Paragominas)', origins: [['Brazil', 'Pará']], markets: ['Netherlands'],
      clients: [['Dutch Timber Traders BV', 'Importer']],
      p2: true, p4: false, lots: [lot('LOT-2026-087', 'Plot BR-PA-00678', 'Pará', 'review')],
      tree: ['Veridian Harvest Co.', [['Madeireira Floresta Norte sawmill', [['Forest management unit UMF-3', []]]]]],
      legalState: { 6: 'review' }, suppliers: [['Madeireira Floresta Norte', 'Brazil', 'Logs (Ipê, Jatobá)', [['review', 'Camp housing below standard'], ['review', 'FPIC record in review']]]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E11'] },
    { id: 'frozen-beef', sku: 'VH-BEF-020', name: 'Frozen beef cuts', hs: '0202.30', hsText: 'Frozen boneless meat of bovine animals', c: 'cattle', status: 'pend',
      made: 'Paraguay (slaughterhouse, San Pedro)', origins: [['Paraguay', 'San Pedro']], markets: ['Germany'],
      clients: [['Meridian Foods Hamburg', 'Importer']],
      p2: true, p4: true, lots: [lot('LOT-2026-142', 'Plot PY-SP-00341', 'San Pedro', 'review')],
      tree: ['Veridian Harvest Co.', [['San Pedro slaughterhouse', [['Estancia Las Lomas (fattening)', [['Birth ranches (not yet traced)', []]]]]]]],
      legalState: { 0: 'review', 2: 'missing' }, segregation: false, negligible: null, pack: [['F3-PK-055', '20 kg frozen carton', 'review']], suppliers: [['San Pedro slaughterhouse', 'Paraguay', 'Beef cuts (processing)', []], ['Estancia Las Lomas', 'Paraguay', 'Live cattle', [['missing', 'Birth ranches not yet traced']]]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E14'] },
    { id: 'soy-protein', sku: 'VH-SOY-410', name: 'Soy protein concentrate', hs: '2304.00', hsText: 'Oil-cake and other solid residues of soya-bean oil', c: 'soy', status: 'ok',
      made: 'Brazil (crusher, Rondonópolis)', origins: [['Brazil', 'Mato Grosso']], markets: ['Netherlands', 'Spain'],
      clients: [['Iberia Grain Imports SL', 'Importer'], ['Rotterdam Roasters BV', 'Client']],
      p2: false, p4: true, lots: [lot('LOT-2026-099', 'Plot BR-MT-00456', 'Mato Grosso', 'ok'), lot('LOT-2026-150', 'Plot BR-MT-00462', 'Mato Grosso', 'ok')],
      tree: ['Veridian Harvest Co.', [['Rondonópolis crusher', [['Agropecuária Rio Verde', []]]]]],
      pack: [['F3-PK-060', '25 kg multiwall paper sack', 'ok'], ['F3-PL-002', 'EUR pallet, stretch-wrapped', 'ok']], suppliers: [['Rondonópolis crusher', 'Brazil', 'Soy protein concentrate', []], ['Agropecuária Rio Verde', 'Brazil', 'Soybeans', []]],
      docs: ['E01', 'E05', 'E06', 'E08', 'E14'] },
  ];

  // the supplier who owes each kind of evidence, for the requests the gaps turn into
  const OWNER = (p) => (p.tree[1][0] ? p.tree[1][0][0] : 'Supplier');

  return { list: P, get: (id) => P.find((p) => p.id === id), LEGAL, DOCS, C, OWNER };
})();
