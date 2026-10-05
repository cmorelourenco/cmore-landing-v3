/* The C-MORE ecosystem page: every supplier on C-MORE, filtered by country, state, region
   and type of service. Each filter is a combobox that suggests as you type: every country,
   then only the states and regions there are given the other filters (with how many suppliers each would leave), and
   picking a state or a region fills in the places above it. Suppliers already in your
   ecosystem carry a tag and come first. Prototype data, kept here. */
(() => {
  const US = 'United States', PT = 'Portugal', ES = 'Spain', DE = 'Germany';
  // [name, city, region, state, country, services, workers, papers pending, in my ecosystem, on C-MORE since]
  const RAW = [
    ['Delmarva Steel', 'Wilmington', 'New Castle County', 'Delaware', US, ['Welding', 'Steel erection'], 48, 0, 1, 2025],
    ['Keystone Electric', 'West Chester', 'Chester County', 'Pennsylvania', US, ['Electrical'], 36, 0, 1, 2025],
    ['Coastal Concrete', 'Dover', 'Kent County', 'Delaware', US, ['Concrete', 'Masonry'], 62, 0, 1, 2025],
    ['Valley Lumber', 'Newark', 'New Castle County', 'Delaware', US, ['Lumber supply', 'Carpentry'], 21, 2, 1, 2026],
    ['Brandywine Plumbing & Heating', 'Wilmington', 'New Castle County', 'Delaware', US, ['Plumbing', 'HVAC'], 18, 0, 1, 2025],
    ['Red Clay Excavation', 'Hockessin', 'New Castle County', 'Delaware', US, ['Excavation', 'Demolition'], 27, 0, 1, 2026],
    ['Penn Scaffold Co.', 'Media', 'Delaware County', 'Pennsylvania', US, ['Scaffolding'], 15, 0, 1, 2026],
    ['Harbor Glass & Glazing', 'Camden', 'Camden County', 'New Jersey', US, ['Glazing'], 12, 0, 1, 2026],
    ['Summit Roofing', 'Elkton', 'Cecil County', 'Maryland', US, ['Roofing', 'Insulation'], 24, 0, 1, 2025],
    ['Tri-State Fire Protection', 'Philadelphia', 'Philadelphia County', 'Pennsylvania', US, ['Fire protection'], 30, 1, 1, 2026],
    ['First State Welding', 'Smyrna', 'Kent County', 'Delaware', US, ['Welding'], 9, 0, 0, 2026],
    ['Diamond State Builders', 'Middletown', 'New Castle County', 'Delaware', US, ['General construction'], 85, 0, 0, 2025],
    ['Sussex Plumbing Services', 'Georgetown', 'Sussex County', 'Delaware', US, ['Plumbing'], 11, 0, 0, 2026],
    ['Lewes Marine Welders', 'Lewes', 'Sussex County', 'Delaware', US, ['Welding', 'Steel erection'], 14, 1, 0, 2026],
    ['Kent County Electric', 'Dover', 'Kent County', 'Delaware', US, ['Electrical'], 22, 0, 0, 2025],
    ['Atlantic Waste Solutions', 'Wilmington', 'New Castle County', 'Delaware', US, ['Waste management'], 33, 0, 0, 2025],
    ['Precision Survey Group', 'Newark', 'New Castle County', 'Delaware', US, ['Surveying'], 7, 0, 0, 2026],
    ['Chesapeake HVAC', 'Baltimore', 'Baltimore City', 'Maryland', US, ['HVAC'], 40, 0, 0, 2025],
    ['Cecil Equipment Rental', 'North East', 'Cecil County', 'Maryland', US, ['Equipment rental'], 8, 0, 0, 2026],
    ['Garden State Contractors', 'Cherry Hill', 'Camden County', 'New Jersey', US, ['General construction'], 120, 0, 0, 2025],
    ['Gloucester Painting Co.', 'Glassboro', 'Gloucester County', 'New Jersey', US, ['Painting', 'Drywall'], 16, 0, 0, 2026],
    ['Liberty Mechanical', 'Philadelphia', 'Philadelphia County', 'Pennsylvania', US, ['Plumbing', 'HVAC'], 58, 0, 0, 2025],
    ['Main Line Masonry', 'Bryn Mawr', 'Montgomery County', 'Pennsylvania', US, ['Masonry'], 19, 0, 0, 2026],
    ['Schuylkill Steel Works', 'Norristown', 'Montgomery County', 'Pennsylvania', US, ['Welding', 'Steel erection'], 44, 1, 0, 2025],
    ['Construções Tejo', 'Lisboa', 'Grande Lisboa', 'Lisboa', PT, ['General construction', 'Concrete'], 140, 0, 0, 2025],
    ['Atlântico Soldadura', 'Setúbal', 'Península de Setúbal', 'Setúbal', PT, ['Welding'], 26, 0, 0, 2026],
    ['Canalizações do Porto', 'Porto', 'Área Metropolitana do Porto', 'Porto', PT, ['Plumbing'], 13, 0, 0, 2026],
    ['Eletro Norte', 'Braga', 'Cávado', 'Braga', PT, ['Electrical'], 31, 1, 0, 2026],
    ['Construcciones Meseta', 'Madrid', 'Área Metropolitana de Madrid', 'Comunidad de Madrid', ES, ['General construction'], 210, 0, 0, 2025],
    ['Fontanería Barcelona', 'Barcelona', 'Barcelonès', 'Cataluña', ES, ['Plumbing', 'HVAC'], 17, 0, 0, 2026],
    ['Bayern Stahlbau', 'München', 'Oberbayern', 'Bavaria', DE, ['Steel erection', 'Welding'], 95, 0, 0, 2025],
    ['Rhein Dach', 'Köln', 'Regierungsbezirk Köln', 'North Rhine-Westphalia', DE, ['Roofing'], 28, 0, 0, 2026],
    // more on every region
    ['Christiana Carpentry', 'Newark', 'New Castle County', 'Delaware', US, ['Carpentry'], 14, 0, 0, 2026],
    ['Brandywine Fire & Safety', 'Wilmington', 'New Castle County', 'Delaware', US, ['Fire protection'], 20, 0, 0, 2025],
    ['Bear Insulation Pros', 'Bear', 'New Castle County', 'Delaware', US, ['Insulation'], 10, 1, 0, 2026],
    ['Wilmington Demolition Co.', 'Wilmington', 'New Castle County', 'Delaware', US, ['Demolition', 'Waste management'], 38, 0, 0, 2025],
    ['Dover Drywall & Interiors', 'Dover', 'Kent County', 'Delaware', US, ['Drywall', 'Painting'], 17, 0, 0, 2026],
    ['Milford Mechanical', 'Milford', 'Kent County', 'Delaware', US, ['HVAC', 'Plumbing'], 25, 0, 0, 2025],
    ['Harrington Equipment Rental', 'Harrington', 'Kent County', 'Delaware', US, ['Equipment rental'], 6, 0, 0, 2026],
    ['Rehoboth Roofing', 'Rehoboth Beach', 'Sussex County', 'Delaware', US, ['Roofing'], 12, 0, 0, 2026],
    ['Seaford Concrete Pumping', 'Seaford', 'Sussex County', 'Delaware', US, ['Concrete'], 19, 1, 0, 2025],
    ['Millsboro Electric', 'Millsboro', 'Sussex County', 'Delaware', US, ['Electrical'], 15, 0, 0, 2026],
    ['Chester Valley Masonry', 'Exton', 'Chester County', 'Pennsylvania', US, ['Masonry'], 22, 0, 0, 2025],
    ['Brandywine Valley HVAC', 'Downingtown', 'Chester County', 'Pennsylvania', US, ['HVAC'], 29, 0, 0, 2026],
    ['Phoenixville Iron Works', 'Phoenixville', 'Chester County', 'Pennsylvania', US, ['Welding', 'Steel erection'], 51, 0, 0, 2025],
    ['Chester Waterfront Welding', 'Chester', 'Delaware County', 'Pennsylvania', US, ['Welding'], 13, 1, 0, 2026],
    ['Springfield Painting', 'Springfield', 'Delaware County', 'Pennsylvania', US, ['Painting'], 9, 0, 0, 2026],
    ['Media Glass Co.', 'Media', 'Delaware County', 'Pennsylvania', US, ['Glazing'], 11, 0, 0, 2025],
    ['Schuylkill Scaffolding', 'Philadelphia', 'Philadelphia County', 'Pennsylvania', US, ['Scaffolding'], 34, 0, 0, 2025],
    ['Fishtown Electric', 'Philadelphia', 'Philadelphia County', 'Pennsylvania', US, ['Electrical'], 27, 0, 0, 2026],
    ['Northeast Philly Plumbing', 'Philadelphia', 'Philadelphia County', 'Pennsylvania', US, ['Plumbing'], 16, 0, 0, 2026],
    ['Delaware River Builders', 'Philadelphia', 'Philadelphia County', 'Pennsylvania', US, ['General construction'], 160, 0, 0, 2025],
    ['King of Prussia Contractors', 'King of Prussia', 'Montgomery County', 'Pennsylvania', US, ['General construction'], 74, 1, 0, 2025],
    ['Conshohocken Roofing', 'Conshohocken', 'Montgomery County', 'Pennsylvania', US, ['Roofing'], 18, 0, 0, 2026],
    ['Lansdale Equipment Rental', 'Lansdale', 'Montgomery County', 'Pennsylvania', US, ['Equipment rental'], 12, 0, 0, 2026],
    ['Pennsauken Steel', 'Pennsauken', 'Camden County', 'New Jersey', US, ['Steel erection', 'Welding'], 46, 0, 0, 2025],
    ['Collingswood Carpentry', 'Collingswood', 'Camden County', 'New Jersey', US, ['Carpentry'], 8, 0, 0, 2026],
    ['Haddonfield Electric', 'Haddonfield', 'Camden County', 'New Jersey', US, ['Electrical'], 21, 0, 0, 2025],
    ['Deptford Excavating', 'Deptford', 'Gloucester County', 'New Jersey', US, ['Excavation'], 24, 0, 0, 2026],
    ['Woodbury Plumbing & Air', 'Woodbury', 'Gloucester County', 'New Jersey', US, ['Plumbing', 'HVAC'], 14, 1, 0, 2026],
    ['Mullica Hill Masonry', 'Mullica Hill', 'Gloucester County', 'New Jersey', US, ['Masonry'], 10, 0, 0, 2025],
    ['Elkton Welding & Fabrication', 'Elkton', 'Cecil County', 'Maryland', US, ['Welding'], 17, 0, 0, 2026],
    ['Perryville Paving', 'Perryville', 'Cecil County', 'Maryland', US, ['Concrete', 'Excavation'], 31, 0, 0, 2025],
    ['Chesapeake City Carpentry', 'Chesapeake City', 'Cecil County', 'Maryland', US, ['Carpentry'], 7, 0, 0, 2026],
    ['Harbor Point Builders', 'Baltimore', 'Baltimore City', 'Maryland', US, ['General construction'], 132, 0, 0, 2025],
    ['Fells Point Glazing', 'Baltimore', 'Baltimore City', 'Maryland', US, ['Glazing'], 15, 0, 0, 2026],
    ['Inner Harbor Electric', 'Baltimore', 'Baltimore City', 'Maryland', US, ['Electrical'], 39, 1, 0, 2025],
    ['Canton Fire Systems', 'Baltimore', 'Baltimore City', 'Maryland', US, ['Fire protection'], 23, 0, 0, 2026],
    ['Alfama Eletricidade', 'Lisboa', 'Grande Lisboa', 'Lisboa', PT, ['Electrical'], 18, 0, 0, 2026],
    ['Sintra Telhados', 'Sintra', 'Grande Lisboa', 'Lisboa', PT, ['Roofing'], 12, 0, 0, 2026],
    ['Amadora Canalizações', 'Amadora', 'Grande Lisboa', 'Lisboa', PT, ['Plumbing'], 9, 0, 0, 2025],
    ['Almada Construções', 'Almada', 'Península de Setúbal', 'Setúbal', PT, ['General construction'], 64, 0, 0, 2025],
    ['Barreiro Metalomecânica', 'Barreiro', 'Península de Setúbal', 'Setúbal', PT, ['Welding', 'Steel erection'], 37, 1, 0, 2026],
    ['Gaia Betão', 'Vila Nova de Gaia', 'Área Metropolitana do Porto', 'Porto', PT, ['Concrete'], 42, 0, 0, 2025],
    ['Matosinhos Climatização', 'Matosinhos', 'Área Metropolitana do Porto', 'Porto', PT, ['HVAC'], 16, 0, 0, 2026],
    ['Maia Andaimes', 'Maia', 'Área Metropolitana do Porto', 'Porto', PT, ['Scaffolding'], 21, 0, 0, 2026],
    ['Barcelos Carpintaria', 'Barcelos', 'Cávado', 'Braga', PT, ['Carpentry'], 11, 0, 0, 2026],
    ['Braga Pinturas', 'Braga', 'Cávado', 'Braga', PT, ['Painting'], 8, 0, 0, 2025],
    ['Getafe Electricidad', 'Getafe', 'Área Metropolitana de Madrid', 'Comunidad de Madrid', ES, ['Electrical'], 33, 0, 0, 2025],
    ['Alcobendas Climatización', 'Alcobendas', 'Área Metropolitana de Madrid', 'Comunidad de Madrid', ES, ['HVAC'], 26, 0, 0, 2026],
    ['Móstoles Estructuras', 'Móstoles', 'Área Metropolitana de Madrid', 'Comunidad de Madrid', ES, ['Steel erection', 'Welding'], 58, 1, 0, 2025],
    ['Badalona Cubiertas', 'Badalona', 'Barcelonès', 'Cataluña', ES, ['Roofing'], 14, 0, 0, 2026],
    ['Hospitalet Construccions', "L'Hospitalet de Llobregat", 'Barcelonès', 'Cataluña', ES, ['General construction'], 88, 0, 0, 2025],
    ['Isar Elektrotechnik', 'München', 'Oberbayern', 'Bavaria', DE, ['Electrical'], 47, 0, 0, 2025],
    ['Ingolstadt Gerüstbau', 'Ingolstadt', 'Oberbayern', 'Bavaria', DE, ['Scaffolding'], 29, 0, 0, 2026],
    ['Rosenheim Holzbau', 'Rosenheim', 'Oberbayern', 'Bavaria', DE, ['Carpentry'], 22, 0, 0, 2026],
    ['Bonn Sanitär', 'Bonn', 'Regierungsbezirk Köln', 'North Rhine-Westphalia', DE, ['Plumbing', 'HVAC'], 19, 0, 0, 2025],
    ['Leverkusen Betonbau', 'Leverkusen', 'Regierungsbezirk Köln', 'North Rhine-Westphalia', DE, ['Concrete'], 54, 1, 0, 2026],
  ];
  // the suppliers that have uploaded their own logo
  const LOGOS = ['Delmarva Steel', 'Keystone Electric', 'Coastal Concrete', 'Brandywine Plumbing & Heating', 'Summit Roofing', 'Tri-State Fire Protection',
    'Diamond State Builders', 'Garden State Contractors', 'Liberty Mechanical', 'Chesapeake HVAC', 'Construções Tejo', 'Construcciones Meseta',
    'Bayern Stahlbau', 'Rhein Dach', 'Isar Elektrotechnik', 'Harbor Point Builders'];
  const slug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' ').split(/[^a-z0-9]+/).filter((w) => w && w !== 'heating').join('-');
  const SUP = RAW.map(([name, city, region, state, country, services, workers, pending, mine, since], id) => ({
    id, name, city, region, state, country, services, workers, pending, mine: !!mine, since, sent: false,
    logo: LOGOS.includes(name) ? `images/suppliers/${slug(name)}.svg` : '',
    ini: name.replace(/[^A-Za-zÀ-ÿ ]/g, ' ').split(/\s+/).filter((w) => w && !/^(of|do|de|and|co)$/i.test(w)).slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
  }));
  // every type of service anyone might look for, not only the ones on the list today
  const SERVICES = [...new Set(['General construction', 'Plumbing', 'Electrical', 'Welding', 'HVAC', 'Roofing', 'Concrete', 'Steel erection', 'Carpentry', 'Masonry',
    'Painting', 'Drywall', 'Excavation', 'Demolition', 'Scaffolding', 'Glazing', 'Insulation', 'Fire protection', 'Lumber supply', 'Equipment rental',
    'Waste management', 'Surveying', ...SUP.flatMap((s) => s.services)])];

  // every country, whether or not anyone there is on C-MORE yet
  const COUNTRIES = 'Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cabo Verde|Cambodia|Cameroon|Canada|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo|Costa Rica|Côte d\'Ivoire|Croatia|Cuba|Cyprus|Czechia|Democratic Republic of the Congo|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kosovo|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|São Tomé and Príncipe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Türkiye|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe'.split('|');
  const FIELDS = ['country', 'state', 'region', 'service'];
  const PARENT = { state: 'country', region: 'state' };
  const sel = { country: '', state: '', region: '', service: '' };
  let show = 'all';
  const q = new URLSearchParams(location.search);
  if (['mine', 'new'].includes(q.get('show'))) show = q.get('show');

  const fold = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const esc = (t) => t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const has = (s, f, v) => (f === 'service' ? s.services.includes(v) : s[f] === v);
  const matches = (s, skip) => FIELDS.every((f) => f === skip || !sel[f] || has(s, f, sel[f]));
  const shown = (s) => show === 'all' || (show === 'mine') === s.mine;

  // the options a field offers: what is there once the other filters are applied, with counts
  const options = (field) => {
    const pool = SUP.filter((s) => matches(s, field) && shown(s));
    const n = new Map();
    pool.forEach((s) => (field === 'service' ? s.services : [s[field]]).forEach((v) => n.set(v, (n.get(v) || 0) + 1)));
    const all = field === 'service' ? SERVICES : field === 'country' ? COUNTRIES : null;
    let list = all ? all.map((v) => [v, n.get(v) || 0]) : [...n];
    list.sort((a, b) => (b[1] > 0) - (a[1] > 0) || a[0].localeCompare(b[0]));
    // where an option sits, so two places with the same name can be told apart
    const where = (v) => {
      if (field === 'state') return (SUP.find((s) => s.state === v) || {}).country;
      if (field === 'region') { const s = SUP.find((x) => x.region === v); return s && `${s.state}, ${s.country}`; }
      return '';
    };
    return list.map(([v, c]) => ({ v, c, where: where(v) }));
  };

  // ---- the comboboxes ------------------------------------------------------
  const boxes = {};
  FIELDS.forEach((field) => {
    const cb = document.querySelector(`.cb[data-field="${field}"]`), input = cb.querySelector('input'), list = cb.querySelector('.cb-list'), clear = cb.querySelector('.cb-clear');
    let active = -1, opts = [];
    const close = () => { list.hidden = true; input.setAttribute('aria-expanded', 'false'); input.removeAttribute('aria-activedescendant'); active = -1; };
    const paint = () => {
      [...list.children].forEach((li, i) => li.classList.toggle('is-active', i === active));
      const li = list.children[active];
      if (li && li.id) { input.setAttribute('aria-activedescendant', li.id); li.scrollIntoView({ block: 'nearest' }); } else input.removeAttribute('aria-activedescendant');
    };
    const render = () => {
      const typed = input.value.trim(), t = fold(typed);
      const exact = typed === sel[field];
      opts = options(field).filter((o) => !t || exact || fold(o.v).includes(t) || (o.where && fold(o.where).includes(t)));
      list.innerHTML = opts.length ? opts.map((o, i) => {
        let label = esc(o.v);
        if (t && !exact) { const k = fold(o.v).indexOf(t); if (k >= 0) label = esc(o.v.slice(0, k)) + '<mark>' + esc(o.v.slice(k, k + t.length)) + '</mark>' + esc(o.v.slice(k + t.length)); }
        return `<li role="option" id="${field}-o${i}" aria-selected="${o.v === sel[field]}"><span>${label}${o.where ? ` <i>· ${esc(o.where)}</i>` : ''}</span><small>${o.c || '—'}</small></li>`;
      }).join('') : `<li class="cb-empty" role="option" aria-disabled="true">${typed ? `Nothing called “${esc(typed)}” yet` : `No suppliers in ${esc(sel.country || 'this area')} yet`}</li>`;
      active = opts.length && t && !exact ? 0 : -1;
      list.hidden = false; input.setAttribute('aria-expanded', 'true'); paint();
    };
    const pick = (v) => { set(field, v); input.value = sel[field]; close(); };
    input.addEventListener('focus', () => { input.select(); render(); });
    input.addEventListener('click', () => { if (list.hidden) render(); });
    input.addEventListener('input', render);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) render(); active = Math.min(opts.length - 1, active + 1); paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); paint(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (active >= 0 && opts[active]) { pick(opts[active].v); input.blur(); } }
      else if (e.key === 'Escape') { if (!list.hidden) { e.stopPropagation(); input.value = sel[field]; close(); } }
      else if (e.key === 'Tab') { if (active >= 0 && opts[active] && input.value.trim() && input.value !== sel[field]) pick(opts[active].v); }
    });
    // mousedown, not click: it lands before the input loses focus and closes the list
    list.addEventListener('mousedown', (e) => { const li = e.target.closest('li[role="option"]:not([aria-disabled])'); if (!li) return; e.preventDefault(); pick(opts[[...list.children].indexOf(li)].v); input.blur(); });
    list.addEventListener('mousemove', (e) => { const li = e.target.closest('li'); const i = [...list.children].indexOf(li); if (i >= 0 && i !== active) { active = i; paint(); } });
    input.addEventListener('blur', () => { setTimeout(() => { if (document.activeElement !== input) { input.value = sel[field]; close(); } }, 0); });
    clear.addEventListener('click', () => { set(field, ''); input.focus(); });
    boxes[field] = { cb, input, clear, close };
  });

  // picking a place fills in the places above it; changing a place drops the ones below that no longer fit
  const set = (field, v) => {
    sel[field] = v;
    if (v && field !== 'service') {
      const s = SUP.find((x) => x[field] === v);
      if (s) for (let p = PARENT[field]; p; p = PARENT[p]) sel[p] = s[p];
    }
    ['state', 'region'].forEach((f) => { if (sel[f] && !SUP.some((s) => s[f] === sel[f] && FIELDS.every((g) => g === 'service' || !sel[g] || s[g] === sel[g]))) sel[f] = ''; });
    update();
  };

  // ---- the results ---------------------------------------------------------
  const grid = document.getElementById('eco-grid'), none = document.getElementById('eco-none'), count = document.getElementById('eco-count');
  const PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
  const CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>';
  const card = (s) => {
    const tag = s.mine ? `<span class="eco-tag">${CHECK}In your ecosystem</span>` : s.sent ? `<span class="eco-tag is-sent">${CLOCK}Request sent</span>` : '';
    const papers = s.pending ? `<span class="co-badge b-pend">${s.pending} paper${s.pending > 1 ? 's' : ''} pending</span>` : '<span class="co-badge b-ok">Papers in order</span>';
    const foot = s.mine
      ? `<a href="#" class="co-link" onclick="return false">Open profile</a><button type="button" class="btn co-btn-light" data-req="${s.id}" onclick="return false">Request documents</button>`
      : `<a href="#" class="co-link" onclick="return false">View profile</a>` + (s.sent ? '<button type="button" class="btn co-btn-light" disabled>Request sent</button>' : `<button type="button" class="btn btn-primary" data-invite="${s.id}">Connect to supplier</button>`);
    return `<li class="eco-card${s.mine ? ' is-mine' : ''}">
      <div class="eco-card-top">${s.logo ? `<img class="eco-logo eco-logo-img" src="${s.logo}" alt="" width="48" height="48" loading="lazy">` : `<span class="eco-logo" aria-hidden="true">${s.ini}</span>`}${tag}</div>
      <div class="eco-id"><h3>${esc(s.name)}</h3><span class="eco-loc">${PIN}<span>${esc(s.city)} · ${esc(s.region)}<br>${esc(s.state)}, ${esc(s.country)}</span></span></div>
      <div class="eco-svcs">${s.services.map((v) => `<span class="eco-svc${v === sel.service ? ' is-hit' : ''}">${esc(v)}</span>`).join('')}</div>
      <div class="eco-facts">${papers}<span>${s.workers} workers</span><span>On C&#8209;MORE since ${s.since}</span></div>
      <div class="eco-card-foot">${foot}</div></li>`;
  };
  const update = () => {
    FIELDS.forEach((f) => { const b = boxes[f]; if (document.activeElement !== b.input) b.input.value = sel[f]; b.cb.classList.toggle('has-value', !!sel[f]); b.clear.hidden = !sel[f]; });
    const pool = SUP.filter((s) => matches(s));
    const n = { all: pool.length, mine: pool.filter((s) => s.mine).length, new: pool.filter((s) => !s.mine).length };
    document.querySelectorAll('[data-n]').forEach((el) => { el.textContent = n[el.dataset.n]; });
    document.querySelectorAll('.eco-seg [data-show]').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.show === show)));
    const res = pool.filter(shown).sort((a, b) => b.mine - a.mine || a.name.localeCompare(b.name));
    count.textContent = `${res.length} supplier${res.length === 1 ? '' : 's'}`;
    grid.innerHTML = res.map(card).join('');
    none.hidden = !!res.length;
    document.getElementById('eco-clear').hidden = !FIELDS.some((f) => sel[f]) && show === 'all';
  };

  document.querySelectorAll('.eco-seg [data-show]').forEach((b) => b.addEventListener('click', () => { show = b.dataset.show; update(); }));
  const clearAll = () => { FIELDS.forEach((f) => (sel[f] = '')); show = 'all'; update(); };
  document.getElementById('eco-clear').addEventListener('click', clearAll);
  document.getElementById('eco-none-clear').addEventListener('click', clearAll);
  grid.addEventListener('click', (e) => {
    const b = e.target.closest('[data-invite]'); if (!b) return;
    SUP[+b.dataset.invite].sent = true; update();
  });
  document.getElementById('eco-total').textContent = SUP.length;
  document.getElementById('eco-mine').textContent = SUP.filter((s) => s.mine).length;
  update();
})();
