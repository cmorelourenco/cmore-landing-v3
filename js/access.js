/* Who can open what: roles, groups and the pages they give access to, shared by every signed-in
   page (Team management edits them, js/team.js).

   Roles
     Owner   — every page, on the parent company and its subsidiaries.
     Admin   — every page of the companies they're assigned to, people and permissions included.
     Manager — the pages their groups give them, where they can edit; Team management, to invite
               users into their own groups.
     User    — the pages their groups give them, to view.
   A group gives access to pages, whole or in part: a Documents page entire, or only some of its
   sections (Tax and social security, Insurance…); Projects, every project or only some. Someone
   whose groups don't include a page doesn't see it at all, and within one sees only the parts given. Pages
   nobody's groups can give: Team management (owners, admins, managers) and Settings (owners,
   admins). The company overview, notifications and your Profile are everyone's.

   "Preview as" (from Team management) shows every page as someone else on the team would see it:
   the side menu drops what they can't open, and a page they can't open says so. It is kept for
   this tab, with a bar at the bottom to leave it.
   Prototype: the team lives in this browser and is forgotten on log out (js/company-switcher.js). */
// Coming soon, except for Miguel's own company (the demo), where every area is open already. Read by js/company-switcher.js, js/company-details.js and js/guided-upload.js.
window.CM_SOON_OPEN = (() => {
  try {
    if (document.documentElement.dataset.persona === 'beatriz') return [];
    const p = JSON.parse(sessionStorage.getItem('cm-person') || 'null') || {};
    if (/^test@c-more\.test$/i.test(p.email || '')) return [];
    const org = JSON.parse(sessionStorage.getItem('cm-org') || 'null') || JSON.parse(localStorage.getItem('cm-last-org-miguel') || 'null') || 'home';
    return org === 'home' ? ['ecosystem', 'workers', 'equipment', 'questionnaires', 'clients', 'projects'] : [];
  } catch (e) { return []; }
})();
window.CMAccess = (() => {
  const persona = document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel';
  const KEY = 'cm-team-' + persona; // { orgId: { members: [...], invites: [...], groups: [...] } }
  const AS_KEY = 'cm-view-as';
  const get = (store, k, d) => { try { const v = store.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (store, k, v) => { try { store.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const ROLES = {
    owner: ['Owner', 'Every page, on the parent company and its subsidiaries.'],
    admin: ['Admin', 'Every page of this company, people and permissions included.'],
    manager: ['Manager', 'The pages their groups give them, to edit. Invites users to them.'],
    user: ['User', 'The pages their groups give them, to view.'],
  };
  const ORDER = Object.keys(ROLES);
  // who each role may invite (and give that role to); a manager, only users
  const GRANTS = { owner: ORDER, admin: ['admin', 'manager', 'user'], manager: ['user'], user: [] };
  const grouped = (r) => r === 'manager' || r === 'user'; // groups decide what they open
  const manages = (r) => r === 'owner' || r === 'admin'; // people, groups and permissions

  // the pages a group can give, as the side menu names them
  const PAGES = [
    ['documents.company', 'Documents · Company', 'Registration, tax, insurance, H&S, certifications'],
    ['documents.workers', 'Documents · Workers', 'Payroll, social security, training, fitness'],
    ['documents.equipment', 'Documents · Equipment', 'Conformity, inspections, manuals'],
    ['projects', 'Projects', 'Every project, as owner or as supplier'],
    ['consents', 'Consents', 'Clients asking to see the company’s documents'],
    ['questionnaires', 'Questionnaires', 'ESG and client questionnaires'],
    ['ecosystem', 'C‑MORE ecosystem', 'Finding and connecting with companies'],
    ['clients', 'My clients', 'The companies you supply'],
    ['suppliers', 'My suppliers', 'The companies that supply you'],
  ].concat(persona === 'beatriz' ? [['documents.products', 'Documents · Products', 'Declarations, technical and safety sheets, EUDR']] : []);
  const PAGE_NAME = Object.fromEntries(PAGES.map(([k, n]) => [k, n]));
  // a page can be given whole, or only some of it: some of Documents' sections (the catalog's, as
  // the page groups them), or some of the projects. A group's scope = { page: [parts] }; a page
  // with no scope is given whole
  const PROJECTS = persona === 'beatriz' ? [] : [['FC-2026-031', 'São João Hospital, east wing'], ['FC-2026-018', 'EN13 resurfacing, Vila do Conde'], ['FC-2025-047', 'Garcia de Orta secondary school renovation'], ['FC-2026-052', 'Quinta da Boavista apartments'], ['ME-2026-112', 'Data centre shell, Building B'], ['CF-2026-027', 'Clinic fit-out, level 3'], ['SN-2026-064', 'Warehouse expansion'], ['FC-2026-044', 'NorteShopping parking deck'], ['FC-2026-009', 'Riverside office fit-out'], ['ME-2026-131', 'Data centre shell, Building C'], ['FC-2025-061', 'Maia fire station no. 2'], ['FC-2026-023', 'Almeida Garrett library expansion'], ['CS-2026-008', 'Lever water treatment upgrade'], ['FC-2026-058', 'Gondomar medical offices'], ['CF-2026-033', 'Imaging suite, ground floor'], ['FC-2026-036', 'Campanhã station canopy'], ['AB-2026-090', 'School gym, Braga'], ['FC-2025-052', 'Valongo community centre'], ['SN-2026-071', 'Cold storage annex'], ['FC-2026-061', 'Póvoa seafront boardwalk repairs'], ['TD-2026-014', 'Leixões cruise terminal works'], ['FC-2026-064', 'Valongo logistics platform slab'], ['FC-2026-067', 'Braga clinic renovation']];
  const PARTS = {
    'documents.company': ['Identification and registration', 'Licences', 'Tax and social security', 'Insurance', 'Health and safety', 'Declarations', 'Certifications', 'Information security', 'Financial', 'Public contracts', 'ESG and sustainability'],
    'documents.workers': ['Insurance', 'Social security', 'Emergency', 'Training', 'Health', 'PPE', 'Legal status', 'Posted workers'],
    'documents.equipment': ['Conformity', 'Inspections', 'Maintenance', 'Documentation', 'Calibration', 'Insurance'],
    'documents.products': ['Products and environment', 'Performance and CE marking', 'Technical and safety', 'Environmental', 'Certifications'],
  };
  if (PROJECTS.length) PARTS.projects = PROJECTS.map((p) => p[0]);
  const PART_NAME = (page, k) => (page === 'projects' ? ((PROJECTS.find((p) => p[0] === k) || [k, k])[1]) : k);
  const PART_NOUN = (page) => (page === 'projects' ? ['project', 'projects'] : ['section', 'sections']);
  // Beatriz's company exports commodities: its groups follow sourcing, not sites
  const DEFAULT_GROUPS = () => (persona === 'beatriz' ? [
    { id: 'g-src', name: 'Sourcing', content: ['documents.products', 'suppliers'] },
    { id: 'g-fin', name: 'Finance', content: ['documents.company', 'consents'] },
    { id: 'g-sus', name: 'Sustainability', content: ['documents.products', 'questionnaires'] },
    { id: 'g-legal', name: 'Legal & compliance', content: ['documents.company', 'consents', 'questionnaires'] },
  ] : [
    { id: 'g-hr', name: 'HR', content: ['documents.workers'] },
    // an accountant needs the company's tax, insurance and accounts, not its licences or H&S
    { id: 'g-fin', name: 'Financial', content: ['documents.company', 'consents'], scope: { 'documents.company': ['Tax and social security', 'Insurance', 'Financial'] } },
    { id: 'g-hs', name: 'Health & safety', content: ['documents.workers', 'documents.equipment', 'projects'] },
    { id: 'g-legal', name: 'Legal & compliance', content: ['documents.company', 'consents', 'questionnaires'] },
  ]);
  // an older demo's groups covered parts of the content: each part, to the page it's on
  const OLD = { registration: 'documents.company', tax: 'documents.company', insurance: 'documents.company', hs: 'documents.company', certifications: 'documents.company',
    data: 'documents.company', contracts: 'documents.company', workers: 'documents.workers', equipment: 'documents.equipment', questionnaires: 'questionnaires', consents: 'consents' };

  const me = Object.assign({ name: persona === 'beatriz' ? 'Beatriz Nogueira' : 'Miguel Ferreira', email: '' }, get(sessionStorage, 'cm-person', {}) || {});
  // the test user (register.html) starts alone in its company: none of the demo's people
  const test = /^test@c-more\.test$/i.test(me.email || '');
  // the people already on the demo company
  const SEED = () => (persona === 'beatriz' ? [
    { name: me.name, email: me.email || 'beatriz@veridianharvest.com', role: 'owner', you: true },
    { name: 'Daniel Okafor', email: 'daniel@veridianharvest.com', role: 'admin', since: 'Feb 2026', title: 'Head of sourcing' },
    { name: 'Priya Raman', email: 'priya@veridianharvest.com', role: 'manager', since: 'May 2026', title: 'Sustainability analyst', groups: ['g-sus'] },
    { name: 'Lena Hoffmann', email: 'lena@veridianharvest.com', role: 'manager', since: 'Jul 2026', title: 'Sourcing manager, cocoa', groups: ['g-src'] },
    { name: 'Marcus Bell', email: 'marcus.bell@bellcpa.com', role: 'user', since: 'Aug 2026', title: 'Accountant, external', groups: ['g-fin'] },
  ] : [
    { name: me.name, email: me.email || 'miguel@ferreiraconstrucoes.pt', role: 'owner', you: true },
    { name: 'Helena Ferreira', email: 'helena@ferreiraconstrucoes.pt', role: 'admin', since: 'Mar 2026' },
    { name: 'Nuno Silva', email: 'nuno.silva@ferreiraconstrucoes.pt', role: 'manager', since: 'Apr 2026', title: 'Safety officer', groups: ['g-hs'] },
    { name: 'Sofia Marques', email: 'sofia.marques@ferreiraconstrucoes.pt', role: 'manager', since: 'May 2026', title: 'People & payroll', groups: ['g-hr'] },
    { name: 'Ana Rocha', email: 'ana.rocha@contabilidade-rocha.pt', role: 'user', since: 'Jun 2026', title: 'Accountant, external', groups: ['g-fin'] },
  ]);
  // an older demo's team: super admin is owner, Member is user, projects gave way to groups
  const fix = (t) => {
    // a scope only for pages it still opens, and only with parts that exist
    const tidy = (g) => {
      g.content = [...new Set((g.content || []).map((k) => (PAGE_NAME[k] ? k : OLD[k])).filter(Boolean))];
      const sc = g.scope || {}; g.scope = {};
      Object.keys(sc).forEach((k) => { const ok = g.content.includes(k) && PARTS[k] && (sc[k] || []).filter((x) => PARTS[k].includes(x)); if (ok && ok.length && ok.length < PARTS[k].length) g.scope[k] = ok; });
    };
    [].concat(t.members, t.invites).forEach((x) => {
      if (x.role === 'super_admin') x.role = 'owner'; if (!ROLES[x.role]) x.role = 'user'; if (!x.groups) x.groups = []; delete x.projects;
      if (x.access) { tidy(x.access); if (!x.access.content.length) delete x.access; }
    });
    if (!t.groups) t.groups = DEFAULT_GROUPS();
    t.groups.forEach(tidy);
    return t;
  };
  const all = () => get(localStorage, KEY, {});
  const teamOf = (id) => {
    const t = all()[id];
    if (t) return fix(t);
    // a company you add starts with just you, as its owner, and the usual groups, empty
    return { members: id === 'home' && !test ? SEED() : [{ name: me.name, email: me.email || (persona === 'beatriz' ? 'beatriz@veridianharvest.com' : 'miguel@ferreiraconstrucoes.pt'), role: 'owner', you: true }], invites: [], groups: DEFAULT_GROUPS() };
  };
  const save = (id, t) => { const a = all(); a[id] = t; set(localStorage, KEY, a); };
  const orgId = () => get(sessionStorage, 'cm-org', null) || get(localStorage, 'cm-last-org-' + persona, null) || 'home';

  // who's looking: you, or the person you're previewing as (in this company)
  const previewing = () => { const a = get(sessionStorage, AS_KEY, null); return a && a.org === orgId() ? a.email : null; };
  const viewer = (t = teamOf(orgId())) => { const e = previewing(); return (e && t.members.find((m) => m.email === e)) || t.members.find((m) => m.you) || t.members[0]; };
  const preview = (email) => { if (email) set(sessionStorage, AS_KEY, { org: orgId(), email }); else { try { sessionStorage.removeItem(AS_KEY); } catch (e) {} } };
  // what gives someone access: their groups, and what was given to them alone (m.access, the same
  // shape as a group: { content, scope }), on top
  const sourcesOf = (t, m) => (m.groups || []).map((id) => t.groups.find((g) => g.id === id)).filter(Boolean).concat(m.access && (m.access.content || []).length ? [m.access] : []);
  // the pages someone's groups (and their own access) give them
  const pagesOf = (t, m) => (grouped(m.role) ? [...new Set(sourcesOf(t, m).flatMap((g) => g.content || []))] : PAGES.map((p) => p[0]));
  // what of a page they give them: null for all of it, else the parts
  const scopeOf = (page, t, m) => {
    if (!grouped(m.role)) return null;
    const gs = sourcesOf(t, m).filter((g) => (g.content || []).includes(page));
    if (!gs.length) return [];
    if (gs.some((g) => !(g.scope || {})[page])) return null;
    return [...new Set(gs.flatMap((g) => g.scope[page]))];
  };
  // can the viewer see this part of a page (a Documents section, a project)?
  const sees = (page, part) => {
    const t = teamOf(orgId()), v = viewer(t);
    if (!v || manages(v.role) || !PARTS[page] || !PARTS[page].includes(part)) return !v || manages(v.role) || can(page);
    const sc = scopeOf(page, t, v);
    return sc === null || sc.includes(part);
  };
  // can the viewer open this page? 'documents' is any of the three Documents pages
  const can = (page) => {
    const t = teamOf(orgId()), v = viewer(t);
    if (!v || manages(v.role)) return true;
    if (page === 'team') return v.role === 'manager';
    if (page === 'settings') return false;
    const mine = pagesOf(t, v);
    return page === 'documents' ? mine.some((k) => k.startsWith('documents.')) : mine.includes(page);
  };

  // ---- on every page: the side menu, the page itself, and the preview bar ----------------------------
  const NAV = { Projects: 'projects', Documents: 'documents', Consents: 'consents', Questionnaires: 'questionnaires', 'C-MORE ecosystem': 'ecosystem', 'My clients': 'clients', 'My suppliers': 'suppliers', 'Team management': 'team', Settings: 'settings' };
  const PAGE_OF = { 'company-details.html': 'documents', 'questionnaires.html': 'questionnaires', 'esg-questionnaire.html': 'questionnaires', 'esg-results.html': 'questionnaires',
    'ecosystem.html': 'ecosystem', 'team.html': 'team', 'company-profile.html': 'settings', 'suppliers.html': 'suppliers' };
  const NAME_OF = { documents: 'Documents', questionnaires: 'Questionnaires', ecosystem: 'the C‑MORE ecosystem', team: 'Team management', settings: 'Settings', suppliers: 'My suppliers' };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const apply = () => {
    const t = teamOf(orgId()), v = viewer(t), as = previewing() && !v.you;
    // the side menu: only what they can open
    document.querySelectorAll('.sn-item[title]').forEach((a) => { const k = NAV[a.getAttribute('title')]; if (k && !can(k)) a.hidden = true; });
    // the company overview: its sections and cards for pages they can't open
    const home = document.querySelector('#filled, #empty') ? document : null;
    if (home) {
      if (!can('projects')) home.querySelectorAll('.co-proj-sec').forEach((s) => { s.hidden = true; });
      if (!can('documents')) home.querySelectorAll('.co-docs-sec, .co-k[data-go="docs"]').forEach((s) => { s.hidden = true; });
      if (!can('consents')) home.querySelectorAll('.co-last-sec, .co-k[data-go=".co-last-sec"], .co-k[data-go="consents"]').forEach((s) => { s.hidden = true; });
      if (!can('suppliers')) home.querySelectorAll('.co-k[href^="ecosystem.html"], .co-sup-sec').forEach((s) => { s.hidden = true; });
    }
    // a page they can't open
    const page = PAGE_OF[location.pathname.split('/').pop()];
    if (page && !can(page)) {
      const main = document.querySelector('main') || document.body;
      main.innerHTML = `<section class="co-sec"><div class="co-wrap"><div class="co-card" style="max-width:36rem;margin:3rem auto;padding:2rem;display:grid;gap:0.75rem;text-align:center">
        <span class="eyebrow" style="justify-self:center">No access</span>
        <h1 class="co-h-l" style="font-size:1.75rem">${as ? esc(v.name.split(' ')[0]) + ' can&rsquo;t' : 'You can&rsquo;t'} open ${NAME_OF[page]}.</h1>
        <p class="co-muted">${page === 'team' ? 'Only owners, admins and managers can. Managers use it to invite users into their groups.' : page === 'settings' ? 'Only owners and admins can.' : grouped(v.role) ? `It isn&rsquo;t part of ${as ? 'their' : 'your'} access${(v.groups || []).length ? ` (${v.groups.map((id) => (t.groups.find((g) => g.id === id) || {}).name).filter(Boolean).map(esc).join(', ')})` : ''}. An admin can add ${as ? 'them' : 'you'} to a group that includes it, or give it to ${as ? 'them' : 'you'} alone.` : 'Ask an owner or an admin of this company.'}</p>
        <a class="btn btn-primary" style="justify-self:center" href="my-company.html?filled">Go to the company overview</a></div></div></section>`;
    }
    // the preview bar
    if (as) {
      const bar = document.createElement('div');
      bar.setAttribute('role', 'status');
      bar.style.cssText = 'position:fixed;left:50%;bottom:1.25rem;translate:-50% 0;z-index:80;display:flex;align-items:center;gap:1rem;padding:0.625rem 0.75rem 0.625rem 1.125rem;border-radius:0.75rem;background:var(--color-graphite);color:var(--color-off-white);font-size:0.875rem;box-shadow:0 12px 32px -12px rgba(0,0,0,.45);max-width:calc(100vw - 2rem)';
      const gs = grouped(v.role) ? (v.groups || []).map((id) => (t.groups.find((g) => g.id === id) || {}).name).filter(Boolean) : [];
      bar.innerHTML = `<span>Previewing as <b>${esc(v.name)}</b> &middot; ${ROLES[v.role][0]}${gs.length ? ' &middot; ' + gs.map(esc).join(', ') : ''}</span><button type="button" style="border:0;border-radius:0.5rem;padding:0.375rem 0.75rem;background:var(--color-coral);color:var(--color-graphite);font:inherit;font-weight:600;cursor:pointer">Exit preview</button>`;
      bar.querySelector('button').addEventListener('click', () => { preview(null); location.reload(); });
      document.body.appendChild(bar);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();

  return { ROLES, ORDER, GRANTS, grouped, manages, PAGES, PAGE_NAME, PARTS, PART_NAME, PART_NOUN, DEFAULT_GROUPS, teamOf, save, orgId, viewer, preview, previewing, sourcesOf, pagesOf, scopeOf, sees, can };
})();
