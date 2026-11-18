/* New project (new-project.html, from Projects' New project): a form in two steps.
   1. The project: its ID, its name, the people on it, each with their role (project manager, site manager…): someone in the company, or someone invited to join it (js/access.js's team, as on Team); whoever starts it is the project manager to begin with, the client, the region (a
      district in Portugal, a state or region anywhere else, with the country) and the address, the start and end dates.
   2. The suppliers on it: picked from My suppliers, or from the companies on C-MORE (invited to your
      list, js/supplier-add.js, and on the project straight away), or invited to join C-MORE. For
      each one, the work it does and when it's on site (entry and exit, within the project's dates).
   Create project keeps it for the tab, per company ('cm-pj-added…', read by js/projects.js), and
   opens it on Projects. Prototype: nothing is sent to the suppliers. */
(() => {
  const box = document.getElementById('np-body'); if (!box) return;
  if (document.documentElement.dataset.persona === 'beatriz') { location.replace('my-company.html?filled#products'); return; }
  const S = window.CM_SUPPLIERS;
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fold = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const get = (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fmt = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return y ? `${d} ${MON[m - 1]} ${y}` : ''; };
  const DISTRICTS = ['Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto',
    'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu', 'Açores', 'Madeira'];
  // the whole world, as the ecosystem's filters list it (js/ecosystem.js); Portugal's regions are its districts
  const COUNTRIES = 'Afghanistan|Albania|Algeria|Andorra|Angola|Antigua and Barbuda|Argentina|Armenia|Australia|Austria|Azerbaijan|Bahamas|Bahrain|Bangladesh|Barbados|Belarus|Belgium|Belize|Benin|Bhutan|Bolivia|Bosnia and Herzegovina|Botswana|Brazil|Brunei|Bulgaria|Burkina Faso|Burundi|Cabo Verde|Cambodia|Cameroon|Canada|Central African Republic|Chad|Chile|China|Colombia|Comoros|Congo|Costa Rica|Côte d\'Ivoire|Croatia|Cuba|Cyprus|Czechia|Democratic Republic of the Congo|Denmark|Djibouti|Dominica|Dominican Republic|Ecuador|Egypt|El Salvador|Equatorial Guinea|Eritrea|Estonia|Eswatini|Ethiopia|Fiji|Finland|France|Gabon|Gambia|Georgia|Germany|Ghana|Greece|Grenada|Guatemala|Guinea|Guinea-Bissau|Guyana|Haiti|Honduras|Hungary|Iceland|India|Indonesia|Iran|Iraq|Ireland|Israel|Italy|Jamaica|Japan|Jordan|Kazakhstan|Kenya|Kiribati|Kosovo|Kuwait|Kyrgyzstan|Laos|Latvia|Lebanon|Lesotho|Liberia|Libya|Liechtenstein|Lithuania|Luxembourg|Madagascar|Malawi|Malaysia|Maldives|Mali|Malta|Marshall Islands|Mauritania|Mauritius|Mexico|Micronesia|Moldova|Monaco|Mongolia|Montenegro|Morocco|Mozambique|Myanmar|Namibia|Nauru|Nepal|Netherlands|New Zealand|Nicaragua|Niger|Nigeria|North Korea|North Macedonia|Norway|Oman|Pakistan|Palau|Palestine|Panama|Papua New Guinea|Paraguay|Peru|Philippines|Poland|Portugal|Qatar|Romania|Russia|Rwanda|Saint Kitts and Nevis|Saint Lucia|Saint Vincent and the Grenadines|Samoa|San Marino|São Tomé and Príncipe|Saudi Arabia|Senegal|Serbia|Seychelles|Sierra Leone|Singapore|Slovakia|Slovenia|Solomon Islands|Somalia|South Africa|South Korea|South Sudan|Spain|Sri Lanka|Sudan|Suriname|Sweden|Switzerland|Syria|Taiwan|Tajikistan|Tanzania|Thailand|Timor-Leste|Togo|Tonga|Trinidad and Tobago|Tunisia|Türkiye|Turkmenistan|Tuvalu|Uganda|Ukraine|United Arab Emirates|United Kingdom|United States|Uruguay|Uzbekistan|Vanuatu|Vatican City|Venezuela|Vietnam|Yemen|Zambia|Zimbabwe'.split('|');

  // where it's kept: as js/projects.js reads it, per company
  const person = get('cm-person') || {}, org = get('cm-org') || 'home', test = /^test@c-more\.test$/i.test(person.email || '');
  const KEY = 'cm-pj-added' + (org === 'home' && !test ? '' : `-${test ? 'test-' : ''}${org}`);
  const owner = person.name || 'You';
  // the project manager: someone in this company's team (js/access.js, the same people as Team), or
  // someone invited to it, as a user (a manager's invitee joins their groups); the invite is kept on Team when the project is created
  const A = window.CMAccess, team = () => (A ? A.teamOf(A.orgId()) : { members: [], invites: [] });
  const me = (() => { const t = team(); return (A && A.viewer(t)) || { name: owner, email: person.email || '', role: 'owner' }; })();
  const canInvite = !!A && (A.GRANTS[me.role] || []).includes('user');
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const taken = () => new Set(((window.CMProjects && window.CMProjects.all()) || []).map((p) => fold(p.id)).concat((get(KEY) || []).map((p) => fold(p.id))));

  const f = { step: 1, id: '', name: '', client: '', people: [{ role: 'Project manager', who: me.email || '', name: '', email: '', errs: {} }], country: 'Portugal', district: '', address: '', start: '', end: '', sups: [], errs: {}, q: '', open: false };

  const css = `
.np-card { display: flex; flex-direction: column; gap: 1.25rem; padding: 1.75rem; max-width: 52rem; }
.np-card-h { display: flex; flex-direction: column; gap: 0.25rem; }
.np-card-h h2 { font-size: 1.375rem; font-weight: 600; letter-spacing: -0.01em; }
.np-card-h p { font-size: 0.9375rem; max-width: 40rem; }
.np-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem 1.25rem; }
.np-f { display: flex; flex-direction: column; gap: 0.375rem; min-width: 0; }
.np-f-wide { grid-column: 1 / -1; }
.np-ppl-h { display: flex; flex-direction: column; gap: 0.25rem; }
.np-ppl-h h3 { font-size: 1.0625rem; font-weight: 600; }
.np-ppl { display: flex; flex-direction: column; gap: 0.75rem; margin: 0; padding: 0; list-style: none; }
.np-person { display: flex; flex-direction: column; gap: 0.75rem; }
.np-person-g { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 0.75rem 1.25rem; align-items: start; }
.np-person-g .link-btn { margin-top: 2.15rem; }
.np-pm-inv { padding: 1rem; border-radius: 0.875rem; background: var(--color-light-beige); }
.np-pm-inv .np-in { background: var(--color-surface); }
.np-ppl-add { align-self: flex-start; display: inline-flex; align-items: center; gap: 0.375rem; }
.np-ppl-add svg { width: 1rem; height: 1rem; }
@media (max-width: 40rem) { .np-person-g { grid-template-columns: minmax(0, 1fr); } .np-person-g .link-btn { margin-top: 0; justify-self: start; } }
.np-f > label, .np-f > span.np-l { font-size: 0.8125rem; font-weight: 600; }
.np-in { width: 100%; height: 2.875rem; padding: 0 0.875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-off-white);
  font: inherit; font-size: 0.9375rem; color: var(--color-ink); outline: none; transition: border-color .14s ease, background-color .14s ease; }
.np-in:hover { border-color: var(--color-sand-400); }
.np-in:focus { border-color: var(--color-graphite); background: var(--color-surface); }
.np-in.is-bad { border-color: var(--color-critical); }
.np-in[readonly] { background: var(--color-light-beige); color: var(--color-ink-muted); cursor: default; }
.np-in[readonly]:hover { border-color: var(--color-line); }
select.np-in { appearance: none; padding-right: 2.25rem; cursor: pointer;
  background: var(--color-off-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e6a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 0.75rem center / 1rem; }
.np-hint { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.np-err { font-size: 0.8125rem; color: var(--color-critical); }
.np-err:empty { display: none; }
.np-sep { height: 1px; background: var(--color-mid-beige); }
.np-foot { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.np-foot-r { display: flex; align-items: center; gap: 1rem; margin-left: auto; }
.np-step { font-size: 0.8125rem; color: var(--color-ink-subtle); }
/* the picker: a search, its list under it as the filter menus' */
.np-pick { position: relative; }
.np-pick .np-in { padding-left: 2.5rem; background: var(--color-off-white) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%237b7a74' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='m20 20-3.5-3.5'/%3E%3C/svg%3E") no-repeat 0.875rem center / 1.125rem; }
.np-menu { position: absolute; left: 0; right: 0; top: calc(100% + 0.375rem); z-index: 30; max-height: 22rem; overflow: auto; padding: 0.375rem; border-radius: 0.75rem; background: var(--color-surface);
  box-shadow: 0 0 0 1px var(--color-line), 0 4px 8px rgba(52, 52, 52, .08), 0 24px 48px -12px rgba(52, 52, 52, .28); }
.np-menu[hidden] { display: none; }
.np-menu-h { padding: 0.5rem 0.625rem 0.25rem; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-subtle); }
.np-opt { display: flex; align-items: center; justify-content: space-between; gap: 1rem; width: 100%; padding: 0.5rem 0.625rem; border: 0; border-radius: 0.5rem; background: none; font: inherit; text-align: left; color: var(--color-ink); cursor: pointer; }
.np-opt:hover, .np-opt:focus-visible { background: var(--color-light-beige); outline: none; }
.np-opt .n { display: block; font-size: 0.875rem; font-weight: 500; }
.np-opt .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.np-opt .co-badge { flex: none; }
.np-opt-inv { justify-content: flex-start; gap: 0.625rem; border-top: 1px solid var(--color-mid-beige); border-radius: 0 0 0.5rem 0.5rem; margin-top: 0.25rem; padding-top: 0.625rem; font-size: 0.875rem; font-weight: 500; }
.np-opt-inv svg { width: 1rem; height: 1rem; flex: none; }
.np-none { padding: 0.75rem 0.625rem; font-size: 0.875rem; color: var(--color-ink-subtle); }
/* each supplier on the project: who, then what and when */
.np-sups { display: flex; flex-direction: column; gap: 0.75rem; margin: 0; padding: 0; list-style: none; }
.np-sup { display: flex; flex-direction: column; gap: 0.875rem; padding: 1rem 1.125rem; border: 1px solid var(--color-line); border-radius: 0.75rem; }
.np-sup-h { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.np-sup-h .n { font-size: 0.9375rem; font-weight: 600; }
.np-sup-h .d { display: block; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.np-sup-h-r { display: flex; align-items: center; gap: 1rem; flex: none; }
.np-sup-g { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr); gap: 0.75rem 1rem; }
.np-empty { padding: 1.25rem; border: 1px dashed var(--color-sand-400); border-radius: 0.75rem; font-size: 0.875rem; color: var(--color-ink-subtle); text-align: center; }
.np-card .btn:disabled { background: var(--color-mid-beige); border-color: transparent; color: var(--color-sand-500); box-shadow: none; cursor: not-allowed; transform: none; }
@media (max-width: 40rem) { .np-grid, .np-sup-g { grid-template-columns: minmax(0, 1fr); } .np-card { padding: 1.25rem; } .np-sup-h { align-items: flex-start; } }`;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  const PLUS = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg>';

  // ---- step 1: the project ----
  const fld = (k, label, input, wide, hint) => `<div class="np-f${wide ? ' np-f-wide' : ''}"><label for="np-${k}">${label}</label>${input}${hint ? `<span class="np-hint">${hint}</span>` : ''}<span class="np-err" id="np-${k}-e">${f.errs[k] || ''}</span></div>`;
  const inp = (k, ph, type = 'text') => `<input class="np-in${f.errs[k] ? ' is-bad' : ''}" id="np-${k}" name="${k}" type="${type}" value="${esc(f[k])}"${ph ? ` placeholder="${esc(ph)}"` : ''} autocomplete="off"${f.errs[k] ? ` aria-invalid="true" aria-describedby="np-${k}-e"` : ''}>`;
  // the people on the project: a role each, and who (in the company, already invited, or invited here)
  const ROLES = ['Project manager', 'Site manager', 'Factory manager', 'Health and safety officer', 'Quality manager', 'Environmental manager'];
  const pf = (k, i, label, input) => `<div class="np-f"><label for="np-p${i}-${k}">${label}</label>${input}<span class="np-err" id="np-p${i}-${k}-e">${f.people[i].errs[k] || ''}</span></div>`;
  const pin = (k, i, ph, type = 'text') => { const x = f.people[i], bad = x.errs[k]; return `<input class="np-in${bad ? ' is-bad' : ''}" id="np-p${i}-${k}" name="${k}" data-np-p="${i}" type="${type}" value="${esc(x[k])}" placeholder="${esc(ph)}" autocomplete="off"${bad ? ` aria-invalid="true" aria-describedby="np-p${i}-${k}-e"` : ''}>`; };
  const personRow = (x, i) => {
    const t = team(), o = (v, label, cur) => `<option value="${esc(v)}"${v === cur ? ' selected' : ''}>${esc(label)}</option>`;
    const roles = (x.role && !ROLES.includes(x.role) ? [x.role] : []).concat(ROLES).map((r) => o(r, r, x.role)).join('');
    const people = t.members.map((m) => o(m.email, m.you ? `${m.name} (you)` : m.name, x.who)).join('');
    const waiting = t.invites.map((v) => o('inv:' + v.email, `${v.name || v.email} (invited)`, x.who)).join('');
    return `<li class="np-person"><div class="np-person-g">
        ${pf('role', i, 'Role', `<select class="np-in" id="np-p${i}-role" name="role" data-np-p="${i}">${roles}</select>`)}
        ${pf('who', i, 'Person', `<select class="np-in${x.errs.who ? ' is-bad' : ''}" id="np-p${i}-who" name="who" data-np-p="${i}">${x.who ? '' : '<option value="" selected>Choose someone</option>'}<optgroup label="In your company">${people}</optgroup>${waiting ? `<optgroup label="Invited, not joined yet">${waiting}</optgroup>` : ''}${canInvite ? o('new', 'Invite someone…', x.who) : ''}</select>`)}
        ${f.people.length > 1 ? `<button type="button" class="link-btn" data-np-prm="${i}" aria-label="Remove the ${esc(x.role.toLowerCase())} from the project">Remove</button>` : '<span></span>'}
      </div>${x.who === 'new' ? `<div class="np-grid np-pm-inv">${pf('name', i, 'Their name', pin('name', i, 'e.g. Rita Almeida'))}${pf('email', i, 'Their email', pin('email', i, 'name@company.com', 'email'))}
        <span class="np-hint np-f-wide" style="margin-top:-0.5rem">They&rsquo;re invited to your company as a user when you create the project.</span></div>` : ''}</li>`;
  };
  const peopleBlock = () => `<div class="np-ppl-h"><h3>People on the project</h3><p class="co-muted">Who does what on it, from your company or invited to join it.</p></div>
      <ul class="np-ppl" aria-label="People on the project">${f.people.map(personRow).join('')}</ul>
      <button type="button" class="link-btn np-ppl-add" data-np-padd>${PLUS}Add a person</button>`;
  // each one, as kept on the project
  const whoOf = (x) => {
    if (x.who === 'new') return { role: x.role, name: x.name.trim(), email: x.email.trim().toLowerCase(), invited: true };
    const t = team(), inv = x.who.startsWith('inv:') && t.invites.find((v) => 'inv:' + v.email === x.who);
    if (inv) return { role: x.role, name: inv.name || inv.email, email: inv.email, invited: true };
    const m = t.members.find((y) => y.email === x.who) || me; return { role: x.role, name: m.name, email: m.email };
  };
  const step1 = () => `<section class="co-card np-card" aria-labelledby="np-h1">
      <div class="np-card-h"><span class="np-step">Step 1 of 2</span><h2 id="np-h1">The project</h2><p class="co-muted">What it is, for whom, where and when.</p></div>
      <div class="np-grid">
        ${fld('id', 'Project ID', inp('id', 'e.g. FC-2026-070'))}
        ${fld('name', 'Project name', inp('name', 'e.g. Braga clinic renovation'))}
        ${fld('client', 'Client&rsquo;s name', inp('client', 'e.g. Hospital de Braga'), true)}
        ${fld('country', 'Country', `<select class="np-in" id="np-country" name="country">${COUNTRIES.map((c) => `<option${c === f.country ? ' selected' : ''}>${esc(c)}</option>`).join('')}</select>`)}
        ${fld('district', 'Region', f.country === 'Portugal'
          ? `<select class="np-in${f.errs.district ? ' is-bad' : ''}" id="np-district" name="district"><option value="">Choose a district</option>${DISTRICTS.map((d) => `<option${d === f.district ? ' selected' : ''}>${d}</option>`).join('')}</select>`
          : inp('district', 'State, province or region'))}
        ${fld('address', 'Address', inp('address', 'Street, number, postcode and town'), true)}
        ${fld('start', 'Start date', inp('start', '', 'date'))}
        ${fld('end', 'End date', inp('end', '', 'date'))}
      </div>
      <div class="np-sep"></div>
      ${peopleBlock()}
      <div class="np-sep"></div>
      <div class="np-foot"><div class="np-foot-r"><a class="link-btn" href="projects.html">Cancel</a><button type="button" class="btn btn-primary" data-np-next>Next: suppliers</button></div></div>
    </section>`;
  const check1 = () => {
    const e = {};
    if (!f.id.trim()) e.id = 'Enter the project&rsquo;s ID.'; else if (taken().has(fold(f.id.trim()))) e.id = 'There&rsquo;s already a project with that ID.';
    if (!f.name.trim()) e.name = 'Enter the project&rsquo;s name.';
    if (!f.client.trim()) e.client = 'Enter the client&rsquo;s name.';
    if (!f.district.trim()) e.district = f.country === 'Portugal' ? 'Choose the district.' : 'Enter the state, province or region.';
    if (!f.address.trim()) e.address = 'Enter the site&rsquo;s address.';
    if (!f.start) e.start = 'Choose the start date.';
    if (!f.end) e.end = 'Choose the end date.'; else if (f.start && f.end < f.start) e.end = 'The end date is before the start date.';
    // the people: someone for each, an invite's name and email, and nobody twice in the same role
    const t = team(), seen = new Set(); let ok = true;
    f.people.forEach((x) => {
      const pe = {}, em = x.email.trim().toLowerCase();
      if (!x.who) pe.who = 'Choose someone.';
      if (x.who === 'new') {
        if (!x.name.trim()) pe.name = 'Enter their name.';
        if (!em) pe.email = 'Enter an email we can send the invite to.'; else if (!emailOk(em)) pe.email = 'That doesn&rsquo;t look like an email address.';
        else if (t.members.some((m) => m.email.toLowerCase() === em)) pe.email = 'They&rsquo;re already in your company. Pick them from the list.';
        else if (t.invites.some((v) => v.email === em)) pe.email = 'They&rsquo;re already invited. Pick them from the list.';
      }
      const key = x.role + '|' + (x.who === 'new' ? em : x.who);
      if (x.who && !pe.email && (x.who !== 'new' || em) && seen.has(key)) pe[x.who === 'new' ? 'email' : 'who'] = `They&rsquo;re already on the project as ${x.role.toLowerCase()}.`;
      seen.add(key);
      x.errs = pe; if (Object.keys(pe).length) ok = false;
    });
    f.errs = e; return ok && !Object.keys(e).length;
  };

  // ---- step 2: the suppliers ----
  const mine = () => (S ? S.list() : []);
  const STAT = (s) => (S && S.SUP_STATUS[s.status]) || ['Your supplier', 'b-neu'];
  const pickable = () => {
    const q = fold(f.q.trim()), on = new Set(f.sups.map((x) => x.id));
    const hit = (t) => !q || fold(t).includes(q);
    const yours = mine().filter((s) => !on.has(s.id) && hit(`${s.name} ${s.city || ''} ${(s.services || []).join(' ')}`));
    const codes = new Set(mine().map((s) => String(s.nipc || '').replace(/\D/g, '')));
    const others = ((S && S.ON_CMORE) || []).filter((c) => !codes.has(c.code) && hit(`${c.name} ${c.city} ${c.services.join(' ')}`));
    return { yours, others };
  };
  const menu = () => {
    const { yours, others } = pickable();
    const opt = (attr, n, d, badge) => `<button type="button" class="np-opt" ${attr}><span><span class="n">${esc(n)}</span><span class="d">${esc(d)}</span></span>${badge}</button>`;
    return (yours.length ? '<div class="np-menu-h">Your suppliers</div>' + yours.slice(0, 8).map((s) => opt(`data-np-add="${esc(s.id)}"`, s.name, [s.city, (s.services || []).join(', ')].filter(Boolean).join(' · '), `<span class="co-badge ${STAT(s)[1]}">${STAT(s)[0]}</span>`)).join('') : '')
      + (others.length ? '<div class="np-menu-h">On C&#8209;MORE</div>' + others.slice(0, 6).map((c) => opt(`data-np-inv="${esc(c.country)}:${esc(c.code)}"`, c.name, `${c.city} · ${c.services.join(', ')}`, '<span class="co-badge b-info">Invite</span>')).join('') : '')
      + (!yours.length && !others.length ? '<p class="np-none">No company matches that.</p>' : '')
      + `<button type="button" class="np-opt np-opt-inv" data-np-inv="">${PLUS}<span>Invite a company that isn&rsquo;t on C&#8209;MORE</span></button>`;
  };
  const supRow = (x, k) => {
    const s = mine().find((y) => y.id === x.id), [bl, bc] = s ? STAT(s) : ['', ''], e = x.errs || {};
    const i = (n, l, type, ph) => `<div class="np-f"><label for="np-s${k}-${n}">${l}</label><input class="np-in${e[n] ? ' is-bad' : ''}" id="np-s${k}-${n}" type="${type}" data-np-s="${k}" name="${n}" value="${esc(x[n])}"${ph ? ` placeholder="${esc(ph)}"` : ''}${type === 'date' ? ` min="${f.start}" max="${f.end}"` : ''} autocomplete="off"><span class="np-err">${e[n] || ''}</span></div>`;
    return `<li class="np-sup"><div class="np-sup-h"><span><span class="n">${esc(x.name)}</span><span class="d">${esc(s ? [s.city, (s.services || []).join(', ')].filter(Boolean).join(' · ') : '')}</span></span>
        <span class="np-sup-h-r">${bl ? `<span class="co-badge ${bc}">${bl}</span>` : ''}<button type="button" class="link-btn" data-np-rm="${k}" aria-label="Remove ${esc(x.name)} from the project">Remove</button></span></div>
      <div class="np-sup-g">${i('work', 'Work to be performed', 'text', 'e.g. Electrical installation, 2nd floor')}${i('entry', 'Entry date', 'date')}${i('exit', 'Exit date', 'date')}</div></li>`;
  };
  const step2 = () => `<section class="co-card np-card" aria-labelledby="np-h2">
      <div class="np-card-h"><span class="np-step">Step 2 of 2 &middot; ${esc(f.name)}</span><h2 id="np-h2">Suppliers on the project</h2><p class="co-muted">Pick them from your suppliers or from the companies on C&#8209;MORE, or invite one. Then, for each, the work it does and when it&rsquo;s on site, between ${fmt(f.start)} and ${fmt(f.end)}.</p></div>
      <div class="np-pick"><label class="sr-only" for="np-q">Find a supplier</label><input class="np-in" id="np-q" type="search" placeholder="Search your suppliers and the companies on C&#8209;MORE" value="${esc(f.q)}" autocomplete="off" role="combobox" aria-expanded="${f.open}" aria-controls="np-menu">
        <div class="np-menu" id="np-menu" ${f.open ? '' : 'hidden'}>${f.open ? menu() : ''}</div></div>
      ${f.sups.length ? `<ul class="np-sups" aria-label="Suppliers on the project">${f.sups.map(supRow).join('')}</ul>` : '<p class="np-empty">No suppliers yet. Search above to add the first.</p>'}
      <div class="np-sep"></div>
      <div class="np-foot"><button type="button" class="link-btn" data-np-back>Back</button><div class="np-foot-r"><a class="link-btn" href="projects.html">Cancel</a><button type="button" class="btn btn-primary" data-np-save>Create project</button></div></div>
    </section>`;
  const check2 = () => {
    let ok = true;
    f.sups.forEach((x) => {
      const e = {};
      if (!x.work.trim()) e.work = 'Say what they&rsquo;ll do.';
      if (!x.entry) e.entry = 'Choose the entry date.'; else if (x.entry < f.start || x.entry > f.end) e.entry = 'Within the project&rsquo;s dates.';
      if (!x.exit) e.exit = 'Choose the exit date.'; else if (x.exit < f.start || x.exit > f.end) e.exit = 'Within the project&rsquo;s dates.'; else if (x.entry && x.exit < x.entry) e.exit = 'Before the entry date.';
      x.errs = e; if (Object.keys(e).length) ok = false;
    });
    return ok;
  };

  const paint = (focus) => {
    box.innerHTML = f.step === 1 ? step1() : step2();
    if (focus) { const el = box.querySelector(focus); if (el) el.focus({ preventScroll: true }); }
  };
  const paintMenu = () => { const m = box.querySelector('#np-menu'), q = box.querySelector('#np-q'); if (!m) return; m.hidden = !f.open; m.innerHTML = f.open ? menu() : ''; q.setAttribute('aria-expanded', String(f.open)); };
  const addSup = (s) => { if (f.sups.some((x) => x.id === s.id)) return; f.sups.push({ id: s.id, name: s.name, work: '', entry: f.start, exit: f.end }); f.q = ''; f.open = false; paint(`#np-s${f.sups.length - 1}-work`); };
  const toTop = () => { const h = document.querySelector('.np-card'); if (h && h.getBoundingClientRect().top < 0) h.scrollIntoView({ block: 'start', behavior: 'smooth' }); };

  // invited from here (js/supplier-add.js): on your list, and on the project
  let before = null;
  const invite = (pre) => { if (!window.CMSupplierAdd) return; before = new Set(mine().map((s) => s.id)); f.open = false; paintMenu(); window.CMSupplierAdd.open(pre); };
  document.addEventListener('cm-suppliers', () => {
    if (!before) return;
    const s = mine().find((x) => !before.has(x.id)); before = null;
    if (s && f.step === 2) addSup(s);
  });

  box.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'np-q') { f.q = t.value; f.open = true; paintMenu(); return; }
    if (t.dataset.npS != null) { const x = f.sups[+t.dataset.npS]; x[t.name] = t.value; if (x.errs && x.errs[t.name]) { delete x.errs[t.name]; t.classList.remove('is-bad'); const er = t.parentNode.querySelector('.np-err'); if (er) er.textContent = ''; } return; }
    if (t.dataset.npP != null) { const x = f.people[+t.dataset.npP]; if (t.tagName === 'SELECT') return; x[t.name] = t.value; if (x.errs[t.name]) { delete x.errs[t.name]; t.classList.remove('is-bad'); t.removeAttribute('aria-invalid'); const er = document.getElementById(`${t.id}-e`); if (er) er.textContent = ''; } return; }
    if (t.name === 'country') return; // on change, below
    if (t.name && t.name in f) { f[t.name] = t.value; if (f.errs[t.name]) { delete f.errs[t.name]; t.classList.remove('is-bad'); t.removeAttribute('aria-invalid'); const er = document.getElementById(`np-${t.name}-e`); if (er) er.textContent = ''; } }
  });
  box.addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'district') f.district = t.value;
    if (t.dataset.npP != null && t.tagName === 'SELECT') { const i = +t.dataset.npP, x = f.people[i]; x[t.name] = t.value; x.errs = {}; paint(t.name === 'who' && x.who === 'new' ? `#np-p${i}-name` : `#${t.id}`); }
    // another country: its regions aren't Portugal's districts, so the region is asked again
    if (t.name === 'country') { const was = f.country === 'Portugal'; f.country = t.value; if (was !== (f.country === 'Portugal')) { f.district = ''; delete f.errs.district; paint('#np-country'); } }
  });
  box.addEventListener('focusin', (e) => { if (e.target.id === 'np-q' && !f.open) { f.open = true; paintMenu(); } });
  document.addEventListener('click', (e) => { if (f.open && !e.target.closest('.np-pick')) { f.open = false; paintMenu(); } });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && f.open) { f.open = false; paintMenu(); box.querySelector('#np-q').focus(); return; }
    if (e.key === 'ArrowDown' && e.target.id === 'np-q') { e.preventDefault(); f.open = true; paintMenu(); const o = box.querySelector('.np-opt'); if (o) o.focus(); return; }
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.closest('.np-menu')) {
      e.preventDefault(); const os = [...box.querySelectorAll('.np-opt')], i = os.indexOf(document.activeElement);
      if (e.key === 'ArrowUp' && i <= 0) { box.querySelector('#np-q').focus(); return; }
      os[Math.min(os.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1))].focus();
    }
    if (e.key === 'Enter' && e.target.matches('input.np-in:not(#np-q)') && f.step === 1) { e.preventDefault(); box.querySelector('[data-np-next]').click(); }
  });
  box.addEventListener('click', (e) => {
    if (e.target.closest('[data-np-next]')) {
      if (!check1()) { paint(); const bad = box.querySelector('.is-bad'); if (bad) bad.focus(); return; }
      f.step = 2; paint(); toTop(); box.querySelector('#np-h2').setAttribute('tabindex', '-1'); box.querySelector('#np-h2').focus({ preventScroll: true }); return;
    }
    if (e.target.closest('[data-np-padd]')) { f.people.push({ role: f.people.some((x) => x.role === 'Site manager') ? ROLES[2] : 'Site manager', who: '', name: '', email: '', errs: {} }); paint(`#np-p${f.people.length - 1}-role`); return; }
    const pr = e.target.closest('[data-np-prm]'); if (pr) { f.people.splice(+pr.dataset.npPrm, 1); paint('[data-np-padd]'); return; }
    if (e.target.closest('[data-np-back]')) { f.step = 1; paint('#np-id'); toTop(); return; }
    const a = e.target.closest('[data-np-add]'); if (a) { const s = mine().find((x) => x.id === a.dataset.npAdd); if (s) addSup(s); return; }
    const v = e.target.closest('[data-np-inv]'); if (v) { const [country, code] = v.dataset.npInv.split(':'); invite(code ? { country, code } : null); return; }
    const r = e.target.closest('[data-np-rm]'); if (r) { f.sups.splice(+r.dataset.npRm, 1); paint('#np-q'); return; }
    if (e.target.closest('[data-np-save]')) {
      if (!check2()) { paint(); const bad = box.querySelector('.is-bad'); if (bad) bad.focus(); return; }
      const p = { id: f.id.trim(), name: f.name.trim(), client: f.client.trim(), country: f.country, district: f.district.trim(), address: f.address.trim(), start: fmt(f.start), deadline: fmt(f.end),
        owner, people: f.people.map(whoOf), on: fmt(new Date().toISOString().slice(0, 10)), sups: f.sups.map((x) => ({ id: x.id, name: x.name, work: x.work.trim(), entry: fmt(x.entry), exit: fmt(x.exit) })) };
      try {
        // people invited here: each invite waits on Team, as one sent from there (once, whatever their roles)
        const fresh = p.people.filter((x) => x.invited && f.people.some((y) => y.who === 'new' && y.email.trim().toLowerCase() === x.email));
        if (fresh.length && A) {
          const id = A.orgId(), t = A.teamOf(id);
          fresh.forEach((x) => { if (!t.invites.some((v) => v.email === x.email)) t.invites.push({ email: x.email, name: x.name, role: 'user', groups: me.role === 'manager' ? (me.groups || []).slice() : [], also: [], sent: today(), by: me.email }); });
          A.save(id, t); document.dispatchEvent(new CustomEvent('cm-team'));
        }
        sessionStorage.setItem(KEY, JSON.stringify([p].concat(get(KEY) || [])));
        const n = p.sups.length;
        sessionStorage.setItem('cm-pj-toast', `${p.name} is created${n ? `, with ${n} supplier${n === 1 ? '' : 's'}` : ''}.`);
      } catch (err) {}
      location.href = `projects.html?project=${encodeURIComponent(p.id)}`;
    }
  });
  paint();
})();
