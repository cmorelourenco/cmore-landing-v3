/* Team, in Settings: the people in the company you're working in, and — for a super admin —
   inviting more. Each invite names a role and, when you run more than one company, which of
   them it covers. Prototype: the people already on each demo company are made up; anyone you
   invite, and any change you make, lives in this browser and is forgotten on log out, like the
   companies you add (js/company-switcher.js). Nothing is emailed. */
(() => {
  const box = document.getElementById('team-body');
  const O = window.CMOrgs;
  if (!box || !O) return;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const KEY = 'cm-team-' + O.persona; // { orgId: { members: [...], invites: [...] } }
  const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  // the four roles: who sees what, and who can invite whom
  const ROLES = {
    super_admin: ['Super admin', 'Can do everything, on all your companies.'],
    admin: ['Admin', 'Can do everything for this company.'],
    manager: ['Manager', 'Can view and add documents and users on the projects assigned to them.'],
    user: ['User', 'Can view the projects assigned to them, and their documents.'],
  };
  const ORDER = Object.keys(ROLES);
  // who each role may invite (and give that role to)
  const GRANTS = { super_admin: ORDER, admin: ['admin', 'manager', 'user'], manager: ['manager', 'user'], user: [] };
  const onProjects = (r) => r === 'manager' || r === 'user';
  let me = { name: 'You', email: '' };
  try { me = Object.assign(me, JSON.parse(sessionStorage.getItem('cm-person') || '{}')); } catch (e) {}
  // the demo company's projects (the ones in Miguel's project table)
  const PROJECTS = {
    miguel: [['FC-2026-031', 'São João Hospital, east wing'], ['FC-2026-018', 'EN13 resurfacing, Vila do Conde'], ['FC-2025-047', 'Garcia de Orta secondary school renovation'], ['FC-2026-052', 'Quinta da Boavista apartments'],
      ['ME-2026-112', 'Data centre shell, Building B'], ['CF-2026-027', 'Clinic fit-out, level 3'], ['SN-2026-064', 'Warehouse expansion'], ['FC-2026-044', 'NorteShopping parking deck']],
  }[O.persona];
  const projectsOf = (id) => (id === 'home' ? PROJECTS : []);
  // the people already on each demo company
  const SEED = {
    miguel: [
      { name: me.name, email: me.email || 'miguel@ferreiraconstrucoes.pt', role: 'super_admin', you: true },
      { name: 'Helena Ferreira', email: 'helena@ferreiraconstrucoes.pt', role: 'admin', since: 'Mar 2026' },
      { name: 'Nuno Silva', email: 'nuno.silva@ferreiraconstrucoes.pt', role: 'manager', since: 'Apr 2026', title: 'Safety officer', projects: ['FC-2026-031', 'FC-2026-018', 'FC-2025-047'] },
      { name: 'Ana Rocha', email: 'ana.rocha@contabilidade-rocha.pt', role: 'user', since: 'Jun 2026', title: 'Accountant, external', projects: ['FC-2026-031'] },
    ],
  }[O.persona];
  const all = () => get(KEY, {});
  const teamOf = (id) => {
    const t = all()[id];
    if (t) return fix(t);
    // a company you add starts with just you, as its super admin
    return { members: id === 'home' ? SEED.map((m) => Object.assign({}, m)) : [{ name: me.name, email: SEED[0].email, role: 'super_admin', you: true }], invites: [] };
  };
  // a role this prototype no longer has (an older demo's Member) reads as User
  const fix = (t) => { [].concat(t.members, t.invites).forEach((x) => { if (!ROLES[x.role]) x.role = 'user'; }); return t; };
  const save = (id, t) => { const a = all(); a[id] = t; set(KEY, a); };

  const cur = O.current();
  const myRole = (teamOf(cur.id).members.find((m) => m.you) || {}).role || O.role;
  const grants = GRANTS[myRole] || [];
  const canInvite = grants.length > 0;
  // changing someone's role, or removing them: a super admin anyone, an admin anyone but a super admin
  const canEdit = (m) => !m.you && (myRole === 'super_admin' || (myRole === 'admin' && m.role !== 'super_admin'));
  const projects = projectsOf(cur.id);
  const pName = (code) => ((projects.find((p) => p[0] === code) || [])[1] || code);
  const others = O.list().filter((o) => o.id !== cur.id);

  const css = `
.tm-list { display: grid; margin: 0; padding: 0; list-style: none; border: 1px solid var(--color-line); border-radius: 0.875rem; overflow: hidden; }
.tm-list > li { display: flex; align-items: center; gap: 0.875rem; padding: 0.875rem 1rem; }
.tm-list > li + li { border-top: 1px solid var(--color-mid-beige); }
.tm-pic { flex: none; width: 2.25rem; height: 2.25rem; border-radius: 50%; display: grid; place-items: center; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.8125rem; font-weight: 600; }
.tm-pic.is-pending { background: none; border: 1.5px dashed var(--color-sand-400); color: var(--color-ink-subtle); }
.tm-pic svg { width: 1rem; height: 1rem; }
.tm-t { display: grid; flex: 1 1 auto; min-width: 0; font-size: 0.9375rem; line-height: 1.35; }
.tm-t b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tm-t small { font-size: 0.8125rem; color: var(--color-ink-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tm-you { margin-left: 0.375rem; font-size: 0.75rem; font-weight: 600; color: var(--color-ink-subtle); }
.tm-r { flex: none; display: flex; align-items: center; gap: 0.875rem; }
.tm-role { font-size: 0.875rem; color: var(--color-ink-muted); }
.set-card .tm-r select.input { height: 2.25rem; width: 8.5rem; font-size: 0.875rem; }
.tm-x { border: 0; background: none; padding: 0; font: inherit; font-size: 0.8125rem; color: var(--color-ink-subtle); text-decoration: underline; text-decoration-color: var(--color-line); text-underline-offset: 0.2em; cursor: pointer; }
.tm-x:hover { color: var(--color-ink); text-decoration-color: var(--color-coral); }
.tm-invite { display: grid; gap: 1rem; padding: 1.25rem; border-radius: 0.875rem; background: var(--color-light-beige); }
.tm-roles { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
.tm-roles label { position: relative; display: grid; gap: 0.25rem; padding: 0.75rem 0.875rem; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); cursor: pointer; }
.tm-roles label:has(input:checked) { border-color: var(--color-graphite); box-shadow: 0 0 0 1px var(--color-graphite); }
.tm-roles label:has(input:focus-visible) { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.tm-roles input { position: absolute; opacity: 0; pointer-events: none; }
.tm-roles b { font-size: 0.875rem; font-weight: 600; }
.tm-roles span { font-size: 0.75rem; line-height: 1.4; color: var(--color-ink-subtle); }
.tm-also { display: grid; gap: 0.375rem; }
.tm-also label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; cursor: pointer; }
.tm-also input { width: 1rem; height: 1rem; accent-color: var(--color-graphite); }
.tm-proj { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.375rem 1rem; }
.tm-proj label { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; line-height: 1.35; cursor: pointer; }
.tm-proj input { flex: none; width: 1rem; height: 1rem; margin-top: 0.0625rem; accent-color: var(--color-graphite); }
.tm-proj small { color: var(--color-ink-subtle); }
.tm-scope[hidden] { display: none; }
.tm-scope { display: grid; gap: 0.5rem; }
.tm-lbl { font-size: 0.8125rem; font-weight: 600; }
.tm-sent { font-size: 0.875rem; color: var(--color-positive); font-weight: 500; }
.tm-note { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--color-light-beige); font-size: 0.875rem; color: var(--color-ink-subtle); }
@media (max-width: 40rem) { .tm-roles, .tm-proj { grid-template-columns: 1fr; } .tm-list > li { flex-wrap: wrap; } .tm-r { width: 100%; justify-content: space-between; padding-left: 3.125rem; } }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  const MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  let flash = '';

  const paint = () => {
    const t = teamOf(cur.id);
    const member = (m, i) => {
      const role = canEdit(m)
        ? `<select class="input" data-role="${i}" aria-label="Role for ${esc(m.name)}">${ORDER.filter((r) => grants.includes(r) || r === m.role).map((r) => `<option value="${r}"${r === m.role ? ' selected' : ''}>${ROLES[r][0]}</option>`).join('')}</select><button type="button" class="tm-x" data-remove="${i}">Remove</button>`
        : `<span class="tm-role">${ROLES[m.role][0]}</span>`;
      const scope = m.role === 'super_admin' ? 'All companies' : onProjects(m.role) ? projLine(m.projects) : '';
      return `<li><span class="tm-pic" aria-hidden="true">${esc(initials(m.name))}</span><span class="tm-t"><b>${esc(m.name)}${m.you ? '<span class="tm-you">You</span>' : ''}</b><small>${esc(m.email)}${m.title ? ' &middot; ' + esc(m.title) : ''}</small>${scope ? `<small>${scope}</small>` : ''}</span><span class="tm-r">${role}</span></li>`;
    };
    const invite = (v, i) => `<li><span class="tm-pic is-pending" aria-hidden="true">${MAIL}</span><span class="tm-t"><b>${esc(v.email)}</b><small>${ROLES[v.role][0]}${v.role === 'super_admin' ? ' &middot; all companies' : onProjects(v.role) ? ' &middot; ' + projLine(v.projects) : ''} &middot; invited ${esc(v.sent)}${v.also && v.also.length ? ' &middot; also ' + v.also.map((id) => esc((O.byId(id) || {}).name || '')).filter(Boolean).join(', ') : ''}${v.resent ? ' &middot; sent again' : ''}</small></span>${canInvite ? `<span class="tm-r"><button type="button" class="tm-x" data-resend="${i}">Resend</button><button type="button" class="tm-x" data-cancel="${i}">Cancel</button></span>` : ''}</li>`;
    box.innerHTML = `
      <ul class="tm-list" aria-label="People in ${esc(cur.name)}">${t.members.map(member).join('')}</ul>
      ${t.invites.length ? `<h3 class="set-sub">Waiting to accept <span class="set-opt">${t.invites.length}</span></h3><ul class="tm-list" aria-label="Pending invites">${t.invites.map(invite).join('')}</ul>` : ''}
      ${canInvite ? `<form class="tm-invite" id="tm-form" novalidate>
        <h3 class="set-sub">Invite people</h3>
        <div class="set-f"><label for="tm-emails">Work emails</label><input class="input" id="tm-emails" type="text" inputmode="email" autocomplete="off" placeholder="name@company.com, another@company.com"><p class="set-err" id="tm-err" role="alert"></p></div>
        <div class="set-f"><span class="tm-lbl">Role</span><div class="tm-roles" role="radiogroup" aria-label="Role">${ORDER.filter((r) => grants.includes(r)).map((r) => `<label><input type="radio" name="tm-role" value="${r}"${r === (grants.includes('user') ? 'user' : grants[0]) ? ' checked' : ''}><b>${ROLES[r][0]}</b><span>${ROLES[r][1]}</span></label>`).join('')}</div></div>
        <div class="tm-scope" data-scope="super_admin" hidden><p class="tm-note">A super admin gets every company you run${others.length ? `: ${esc(cur.name)} and ${others.map((o) => esc(o.name)).join(', ')}` : ''}, including any added later.</p></div>
        ${others.length ? `<div class="tm-scope tm-also" data-scope="admin" hidden><span class="tm-lbl">Also make them admin of</span>${others.map((o) => `<label><input type="checkbox" value="${esc(o.id)}">${esc(o.name)}</label>`).join('')}</div>` : ''}
        <div class="tm-scope" data-scope="projects" hidden><span class="tm-lbl">Projects they can see${projects.length ? '' : ''}</span>${projects.length ? `<div class="tm-proj">${projects.map(([code, name]) => `<label><input type="checkbox" value="${esc(code)}"><span>${esc(name)} <small>${esc(code)}</small></span></label>`).join('')}</div><p class="set-err" id="tm-perr" role="alert"></p>` : `<p class="tm-note">${esc(cur.name)} has no projects yet. They will see the ones you assign them later.</p>`}</div>
        <div class="set-foot"><span class="tm-sent" role="status">${flash}</span><button type="submit" class="btn btn-primary btn-sm" id="tm-go">Send invite</button></div>
      </form>` : '<p class="tm-note">Users can&rsquo;t invite people. Ask an admin of this company.</p>'}`;
    flash = '';
    showScope();
  };
  const projLine = (list) => { const l = (list || []).map(pName); return l.length ? `${l.length} project${l.length === 1 ? '' : 's'}: ${l.slice(0, 2).map(esc).join(', ')}${l.length > 2 ? ` +${l.length - 2}` : ''}` : 'No projects yet'; };
  const pickedRole = () => { const r = box.querySelector('[name="tm-role"]:checked'); return r ? r.value : null; };
  const showScope = () => {
    const r = pickedRole();
    box.querySelectorAll('.tm-scope').forEach((s) => { s.hidden = !(s.dataset.scope === r || (s.dataset.scope === 'projects' && onProjects(r))); });
  };

  const valid = (e) => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(e);
  box.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = document.getElementById('tm-emails').value.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
    const err = document.getElementById('tm-err');
    if (!raw.length) { err.textContent = 'Add at least one email.'; return; }
    const bad = raw.filter((x) => !valid(x));
    if (bad.length) { err.textContent = `Check ${bad.length === 1 ? 'this email' : 'these emails'}: ${bad.join(', ')}.`; document.getElementById('tm-emails').classList.add('is-bad'); return; }
    const role = pickedRole();
    // a manager or user sees only the projects they are given: at least one, when there are any
    const picked = onProjects(role) ? [...box.querySelectorAll('.tm-proj input:checked')].map((x) => x.value) : [];
    if (onProjects(role) && projects.length && !picked.length) { document.getElementById('tm-perr').textContent = 'Pick at least one project.'; return; }
    // a super admin is on every company; an admin, on the ones ticked
    const also = role === 'super_admin' ? others.map((o) => o.id) : role === 'admin' ? [...box.querySelectorAll('.tm-also input:checked')].map((x) => x.value) : [];
    const t = teamOf(cur.id);
    const known = new Set(t.members.map((m) => m.email.toLowerCase()).concat(t.invites.map((v) => v.email)));
    const fresh = [...new Set(raw)].filter((x) => !known.has(x));
    if (!fresh.length) { err.textContent = raw.length === 1 ? 'They are already in the team, or invited.' : 'They are all already in the team, or invited.'; return; }
    fresh.forEach((email) => t.invites.push({ email, role, also, projects: picked, sent: today() }));
    save(cur.id, t);
    // the same invite shows on each company it also covers
    also.forEach((id) => { const o = teamOf(id); fresh.forEach((email) => { if (!o.invites.some((v) => v.email === email)) o.invites.push({ email, role, also: [cur.id], sent: today() }); }); save(id, o); });
    const skipped = raw.length - fresh.length;
    flash = `Invite sent to ${fresh.length === 1 ? fresh[0] : fresh.length + ' people'}.${skipped ? ` ${skipped} already in the team.` : ''}`;
    paint();
    const again = document.getElementById('tm-emails'); if (again) again.focus();
  });
  box.addEventListener('input', (e) => { if (e.target.id === 'tm-emails') { e.target.classList.remove('is-bad'); document.getElementById('tm-err').textContent = ''; } });
  box.addEventListener('change', (e) => {
    if (e.target.name === 'tm-role') { showScope(); return; }
    if (e.target.closest('.tm-proj')) { const pe = document.getElementById('tm-perr'); if (pe) pe.textContent = ''; return; }
    const s = e.target.closest('[data-role]'); if (!s) return;
    // made a manager or user with no projects: they start on all of this company's projects
    const t = teamOf(cur.id), m = t.members[+s.dataset.role];
    m.role = s.value;
    if (onProjects(m.role) && !(m.projects && m.projects.length)) m.projects = projects.map((p) => p[0]);
    save(cur.id, t); paint();
  });
  box.addEventListener('click', (e) => {
    const t = teamOf(cur.id);
    const r = e.target.closest('[data-remove]');
    if (r) { const m = t.members[+r.dataset.remove]; if (!confirm(`Remove ${m.name} from ${cur.name}? They lose access straight away.`)) return; t.members.splice(+r.dataset.remove, 1); save(cur.id, t); paint(); return; }
    const c = e.target.closest('[data-cancel]');
    if (c) { t.invites.splice(+c.dataset.cancel, 1); save(cur.id, t); paint(); return; }
    const s = e.target.closest('[data-resend]');
    if (s) { t.invites[+s.dataset.resend].resent = true; t.invites[+s.dataset.resend].sent = today(); save(cur.id, t); paint(); }
  });

  document.getElementById('team-company').textContent = cur.name;
  paint();
})();
