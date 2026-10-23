/* Team management: the people in the company you're working in, the groups that decide which
   pages they can open, and inviting more. The rules themselves (roles, groups, pages, the demo
   team) are js/access.js; this page shows and edits them.
     Owners and admins manage people, roles and groups. A manager invites users, only into groups
     they are in themselves. A user can't open this page.
   "Preview as" shows the whole app as someone else on the team would see it (js/access.js).
   Prototype: nothing is emailed. */
(() => {
  const box = document.getElementById('team-body'), gbox = document.getElementById('groups-body'), perm = document.getElementById('perm-body');
  const O = window.CMOrgs;
  if (!box || !O) return;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const A = window.CMAccess;
  if (!A) return;
  const today = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  const { ROLES, ORDER, GRANTS, grouped, manages, PAGES, teamOf } = A;
  const CNAME = A.PAGE_NAME;
  const save = (id, t) => A.save(id, t);

  const cur = O.current();
  const others = O.list().filter((o) => o.id !== cur.id);
  // the companies an owner covers: this one, its parent, and their subsidiaries
  const family = () => {
    const top = O.parentOf(cur.id) || cur.id;
    return [top].concat(O.childrenOf(top)).map(O.byId).filter(Boolean);
  };

  // ---- who's looking: you, or someone you preview the page as ------------------------------------
  const as = A.previewing() || 'you';
  const viewer = (t) => A.viewer(t);
  const ctx = () => {
    const t = teamOf(cur.id), v = viewer(t);
    const role = v.role, mine = grouped(role) ? v.groups : t.groups.map((g) => g.id);
    return { t, v, role, mine, grants: GRANTS[role] || [] };
  };
  // changing someone's role or groups, or removing them: an owner anyone; an admin anyone but an owner
  const canEdit = (c, m) => m !== c.v && (c.role === 'owner' || (c.role === 'admin' && m.role !== 'owner'));

  const css = `
.tm-list { display: grid; margin: 0; padding: 0; list-style: none; border: 1px solid var(--color-line); border-radius: 0.875rem; overflow: hidden; }
.tm-list > li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 0.5rem 0.875rem; padding: 0.875rem 1rem; }
.tm-list > li + li { border-top: 1px solid var(--color-mid-beige); }
.tm-pic { flex: none; width: 2.25rem; height: 2.25rem; border-radius: 50%; display: grid; place-items: center; background: var(--color-graphite); color: var(--color-off-white); font-size: 0.8125rem; font-weight: 600; }
.tm-pic.is-pending { background: none; border: 1.5px dashed var(--color-sand-400); color: var(--color-ink-subtle); }
.tm-pic svg { width: 1rem; height: 1rem; }
.tm-t { display: grid; min-width: 0; font-size: 0.9375rem; line-height: 1.35; }
.tm-t b { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tm-t small { font-size: 0.8125rem; color: var(--color-ink-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tm-you { margin-left: 0.375rem; font-size: 0.75rem; font-weight: 600; color: var(--color-ink-subtle); }
.tm-r { display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 0.5rem 0.875rem; }
.tm-role { font-size: 0.875rem; color: var(--color-ink-muted); }
.tm-tags { display: flex; flex-wrap: wrap; gap: 0.375rem; margin-top: 0.375rem; }
.tm-tag { display: inline-flex; align-items: center; height: 1.5rem; padding: 0 0.5rem; border-radius: 0.375rem; background: var(--color-mid-beige); font-size: 0.75rem; font-weight: 500; color: var(--color-ink); }
.tm-tag.is-all { background: var(--color-positive-subtle); color: var(--color-positive); }
.tm-x { border: 0; background: none; padding: 0; font: inherit; font-size: 0.8125rem; color: var(--color-ink-subtle); text-decoration: underline; text-decoration-color: var(--color-line); text-underline-offset: 0.2em; cursor: pointer; }
.tm-x:hover { color: var(--color-ink); text-decoration-color: var(--color-coral); }
.tm-edit { grid-column: 1 / -1; display: grid; gap: 0.875rem; margin-top: 0.375rem; padding: 1rem; border-radius: 0.75rem; background: var(--color-light-beige); }
.tm-edit select.input { height: 2.5rem; max-width: 14rem; font-size: 0.875rem; }
.tm-invite { display: grid; gap: 1rem; padding: 1.25rem; border-radius: 0.875rem; background: var(--color-light-beige); }
/* the role: a compact switch, and one line saying what the chosen role can do */
.tm-roles { display: inline-flex; flex-wrap: wrap; gap: 0.125rem; width: fit-content; max-width: 100%; padding: 0.1875rem; border: 1px solid var(--color-line); border-radius: 0.625rem; background: var(--color-surface); }
.tm-roles label { position: relative; display: block; padding: 0.375rem 0.875rem; border-radius: 0.4375rem; font-size: 0.875rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; transition: background-color .15s, color .15s; }
.tm-roles label:hover { color: var(--color-ink); }
.tm-roles label:has(input:checked) { background: var(--color-graphite); color: var(--color-off-white); }
.tm-roles label:has(input:focus-visible) { outline: 2px solid var(--color-graphite); outline-offset: 2px; }
.tm-roles input { position: absolute; opacity: 0; pointer-events: none; }
.tm-role-d { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.tm-checks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.375rem 1rem; }
.tm-checks label { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.875rem; line-height: 1.35; cursor: pointer; }
.tm-checks label.is-off { color: var(--color-sand-500); cursor: not-allowed; }
.tm-checks input { flex: none; width: 1rem; height: 1rem; margin-top: 0.0625rem; accent-color: var(--color-graphite); }
.tm-checks small { display: block; color: var(--color-ink-subtle); font-size: 0.75rem; }
.tm-scope[hidden] { display: none; }
.tm-scope { display: grid; gap: 0.5rem; }
.tm-lbl { font-size: 0.8125rem; font-weight: 600; }
.tm-sent { font-size: 0.875rem; color: var(--color-positive); font-weight: 500; }
.tm-note { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; border-radius: 0.75rem; background: var(--color-light-beige); font-size: 0.875rem; color: var(--color-ink-subtle); }
.tm-edit .tm-note, .tm-invite .tm-note { background: var(--color-surface); }
.tm-as { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem 1rem; padding: 0.625rem 0.875rem; border: 1px dashed var(--color-sand-400); border-radius: 0.75rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.tm-as label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: var(--color-ink); }
.tm-as select.input { height: 2.25rem; width: auto; font-size: 0.8125rem; }
.tm-groups { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
.tm-group { display: grid; align-content: start; gap: 0.5rem; padding: 1rem 1.125rem; border: 1px solid var(--color-line); border-radius: 0.875rem; background: var(--color-surface); }
.tm-group.is-mine { border-color: var(--color-graphite); }
.tm-group-h { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }
.tm-group-h b { font-size: 1rem; font-weight: 600; }
.tm-group p { font-size: 0.8125rem; line-height: 1.45; color: var(--color-ink-subtle); }
.tm-group-f { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-top: 0.25rem; font-size: 0.8125rem; color: var(--color-ink-muted); }
.tm-group-new { display: grid; place-items: center; min-height: 7rem; border: 1.5px dashed var(--color-sand-400); border-radius: 0.875rem; background: none; font: inherit; font-size: 0.9375rem; font-weight: 600; color: var(--color-ink); cursor: pointer; }
.tm-group-new:hover { border-color: var(--color-graphite); }
.tm-gform { grid-column: 1 / -1; display: grid; gap: 1rem; padding: 1.25rem; border-radius: 0.875rem; background: var(--color-light-beige); }
.tm-gform .input { max-width: 22rem; }
.tm-perm-wrap { overflow-x: auto; border: 1px solid var(--color-line); border-radius: 0.875rem; }
.tm-perm { width: 100%; min-width: 38rem; border-collapse: collapse; font-size: 0.875rem; }
.tm-perm th, .tm-perm td { padding: 0.75rem 1rem; text-align: left; vertical-align: top; }
.tm-perm thead th { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); background: var(--color-light-beige); }
.tm-perm thead th small { display: block; margin-top: 0.125rem; font-size: 0.6875rem; letter-spacing: 0; text-transform: none; font-weight: 500; color: var(--color-coral-deep); }
.tm-perm tbody tr + tr { border-top: 1px solid var(--color-mid-beige); }
.tm-perm tbody th { font-weight: 500; color: var(--color-ink); width: 30%; }
.tm-perm td { color: var(--color-ink-muted); }
.tm-perm .tm-yes { display: inline-grid; place-items: center; width: 1.25rem; height: 1.25rem; border-radius: 0.375rem; background: var(--color-ok, #a6d8a0); color: var(--color-graphite); }
.tm-perm .tm-yes svg { width: 0.75rem; height: 0.75rem; }
.tm-perm .tm-no { color: var(--color-sand-400); }
.tm-perm small { display: block; margin-top: 0.25rem; font-size: 0.75rem; line-height: 1.35; color: var(--color-ink-subtle); }
.tm-bulk { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem 1rem; padding: 0.875rem 1rem; border: 1px dashed var(--color-sand-400); border-radius: 0.75rem; background: var(--color-surface); font-size: 0.875rem; color: var(--color-ink-muted); }
.tm-bulk b { color: var(--color-ink); font-weight: 600; }
.tm-bulk.is-over { border-color: var(--color-coral); background: color-mix(in oklab, var(--color-coral) 6%, var(--color-surface)); }
.tm-bulk-acts { display: flex; align-items: center; gap: 1rem; }
.tm-or { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
.tm-or::before, .tm-or::after { content: ""; flex: 1; height: 1px; background: var(--color-line); }
.tm-rev { display: grid; gap: 0.875rem; }
.tm-rev-h { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem 1rem; }
.tm-rev-h p { font-size: 0.875rem; color: var(--color-ink-muted); }
.tm-rev-wrap { max-height: 22rem; overflow: auto; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.tm-rev table { width: 100%; border-collapse: collapse; font-size: 0.8125rem; }
.tm-rev th, .tm-rev td { padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
.tm-rev thead th { position: sticky; top: 0; background: var(--color-light-beige); font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.tm-rev tbody tr + tr { border-top: 1px solid var(--color-mid-beige); }
.tm-rev tbody tr.is-bad td { color: var(--color-ink-subtle); }
.tm-rev td small { display: block; color: var(--color-ink-subtle); }
.tm-rev .co-badge { white-space: nowrap; }
.tm-ph { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 0.5rem; }
.tm-all { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; font-weight: 500; color: var(--color-ink-muted); cursor: pointer; }
.tm-all input, .tm-sel { width: 1rem; height: 1rem; accent-color: var(--color-graphite); cursor: pointer; }
.tm-list.is-sel > li { grid-template-columns: 1rem auto minmax(0, 1fr) auto; }
.tm-list > li.is-picked { background: var(--color-light-beige); }
.tm-toast { position: fixed; bottom: 1.5rem; left: 50%; translate: -50% 0; z-index: 95; display: flex; align-items: flex-start; gap: 0.75rem; width: min(24rem, calc(100vw - 2rem)); padding: 0.875rem 0.875rem 0.875rem 1rem;
  border-radius: 0.75rem; background: var(--color-graphite); color: var(--color-off-white); box-shadow: 0 16px 36px -14px rgba(0,0,0,.5); animation: tm-toast-in .3s var(--ease-brand, ease); }
.tm-toast.is-raised { bottom: 5rem; } /* above the preview bar */
.tm-toast.is-out { opacity: 0; transform: translateY(6px); transition: opacity .25s, transform .25s; }
@keyframes tm-toast-in { from { opacity: 0; transform: translateY(10px); } }
.tm-toast-i { flex: none; width: 1.5rem; height: 1.5rem; display: grid; place-items: center; border-radius: 0.375rem; background: var(--color-ok, #a6d8a0); color: var(--color-graphite); }
.tm-toast-i svg { width: 0.875rem; height: 0.875rem; }
.tm-toast-t { flex: 1; display: grid; gap: 0.125rem; font-size: 0.875rem; line-height: 1.4; }
.tm-toast-t b { font-weight: 600; }
.tm-toast-t span { color: color-mix(in oklab, var(--color-off-white) 72%, transparent); }
.tm-toast-x { flex: none; border: 0; background: none; padding: 0 0.125rem; font-size: 1.25rem; line-height: 1; color: color-mix(in oklab, var(--color-off-white) 70%, transparent); cursor: pointer; }
.tm-toast-x:hover { color: var(--color-off-white); }
@media (prefers-reduced-motion: reduce) { .tm-toast { animation: none; } }
.tm-list > li.is-changed { animation: tm-changed 2.4s ease; }
@keyframes tm-changed { 0%, 40% { background: color-mix(in oklab, var(--color-ok, #a6d8a0) 35%, transparent); } 100% { background: transparent; } }
/* the selection: a bar that sticks to the bottom of the screen while the list is in view */
.tm-selbar { position: sticky; bottom: 1rem; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.625rem 0.75rem 0.625rem 1rem;
  border-radius: 0.75rem; background: var(--color-graphite); color: var(--color-off-white); box-shadow: 0 12px 28px -12px rgba(0,0,0,.45); }
.tm-selbar-t { display: flex; align-items: baseline; gap: 0.625rem; min-width: 0; font-size: 0.875rem; }
.tm-selbar-t span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: color-mix(in oklab, var(--color-off-white) 70%, transparent); }
.tm-selbar-a { flex: none; display: flex; align-items: center; gap: 1rem; }
.tm-selbar .tm-x { color: var(--color-off-white); text-decoration-color: color-mix(in oklab, var(--color-off-white) 40%, transparent); }
/* the drawer: what's changing, for whom */
.tm-dw { position: fixed; inset: 0; z-index: 90; }
.tm-dw[hidden] { display: none; }
.tm-dw-scrim { position: absolute; inset: 0; background: rgba(52, 52, 52, .32); animation: tm-fade .2s ease; }
.tm-dw-panel { position: absolute; top: 0; right: 0; bottom: 0; width: min(32rem, 100vw); display: grid; grid-template-rows: auto minmax(0, 1fr) auto; background: var(--color-off-white);
  box-shadow: -16px 0 40px -20px rgba(0,0,0,.35); animation: tm-in .28s var(--ease-brand, ease); outline: none; }
@keyframes tm-in { from { transform: translateX(24px); opacity: 0; } to { transform: none; opacity: 1; } }
@keyframes tm-fade { from { opacity: 0; } }
.tm-dw-h { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--color-line); }
.tm-dw-h h3 { font-size: 1.25rem; font-weight: 600; }
.tm-dw-h p { font-size: 0.875rem; color: var(--color-ink-subtle); }
.tm-dw-x { border: 0; background: none; padding: 0; font-size: 1.75rem; line-height: 1; color: var(--color-ink-subtle); cursor: pointer; }
.tm-dw-x:hover { color: var(--color-ink); }
.tm-dw-b { overflow-y: auto; display: grid; align-content: start; gap: 1.25rem; padding: 1.25rem 1.5rem; }
.tm-dw-b .tm-checks { grid-template-columns: 1fr 1fr; }
.tm-dw-f { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.875rem 1.5rem; border-top: 1px solid var(--color-line); background: var(--color-surface); font-size: 0.875rem; color: var(--color-ink-muted); }
.tm-plan { list-style: none; margin: 0; padding: 0; border: 1px solid var(--color-line); border-radius: 0.75rem; background: var(--color-surface); }
.tm-plan > li { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: start; gap: 0.75rem; padding: 0.75rem 0.875rem; }
.tm-plan > li + li { border-top: 1px solid var(--color-mid-beige); }
.tm-plan .tm-pic { width: 2rem; height: 2rem; font-size: 0.75rem; }
.tm-plan-t { display: grid; gap: 0.1875rem; min-width: 0; font-size: 0.875rem; }
.tm-plan-t b { font-weight: 600; }
.tm-plan-t small { font-size: 0.75rem; color: var(--color-ink-subtle); }
.tm-plan-t .co-badge { justify-self: start; margin-top: 0.125rem; }
.tm-plan-c { display: flex; align-items: center; gap: 0.375rem; font-weight: 500; }
.tm-from { color: var(--color-ink-subtle); }
.tm-plan > li:not(.is-same) .tm-from { text-decoration: line-through; text-decoration-color: var(--color-sand-400); }
.tm-to { color: var(--color-ink); font-weight: 600; }
.tm-stay { color: var(--color-ink); }
.tm-plan-t small .tm-to { font-weight: 600; }
.tm-plan > li.is-same { opacity: .7; }
.tm-perm-note { margin-top: 0.875rem; font-size: 0.8125rem; color: var(--color-ink-subtle); }
@media (max-width: 40rem) { .tm-checks, .tm-groups { grid-template-columns: 1fr; } .tm-list > li { grid-template-columns: auto minmax(0, 1fr); } .tm-list.is-sel > li { grid-template-columns: 1rem auto minmax(0, 1fr); } .tm-r { grid-column: 1 / -1; justify-content: flex-start; padding-left: 3.125rem; } }`;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const initials = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  const MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
  const gName = (t, id) => (t.groups.find((g) => g.id === id) || {}).name;
  // what someone sees, as tags: everything for an owner or admin, their groups otherwise
  const reach = (t, x) => (x.role === 'owner' ? `<span class="tm-tag is-all">${family().length > 1 ? 'Every page · parent and subsidiaries' : 'Every page'}</span>`
    : x.role === 'admin' ? '<span class="tm-tag is-all">Every page of this company</span>'
      : (x.groups || []).map((id) => gName(t, id)).filter(Boolean).map((n) => `<span class="tm-tag">${esc(n)}</span>`).join('') || '<span class="tm-tag">No groups yet</span>');
  // group checkboxes: a manager can only hand out groups they are in
  const groupChecks = (c, picked, name) => `<div class="tm-checks">${c.t.groups.map((g) => {
    const ok = c.mine.includes(g.id);
    return `<label class="${ok ? '' : 'is-off'}"${ok ? '' : ' title="You can only add people to groups you are in"'}><input type="checkbox" name="${name}" value="${esc(g.id)}"${picked.includes(g.id) ? ' checked' : ''}${ok ? '' : ' disabled'}><span>${esc(g.name)}<small>${g.content.map((k) => CNAME[k]).filter(Boolean).join(', ') || 'No pages yet'}</small></span></label>`;
  }).join('')}</div>`;

  let flash = '', editing = null, gEditing = null;

  // ---- people ----------------------------------------------------------------------------------------
  const paint = () => {
    const c = ctx(), t = c.t;
    const member = (m, i) => {
      const edit = canEdit(c, m);
      const open = edit && editing === i;
      const roles = ORDER.filter((r) => c.grants.includes(r) || r === m.role);
      const pickBox = selecting ? (edit ? `<input type="checkbox" class="tm-sel" data-sel="${i}"${sel.has(i) ? ' checked' : ''} aria-label="Select ${esc(m.name)}">` : '<span></span>') : '';
      return `<li class="${sel.has(i) ? 'is-picked' : ''}${changed.has(i) ? ' is-changed' : ''}">${pickBox}<span class="tm-pic" aria-hidden="true">${esc(initials(m.name))}</span><span class="tm-t"><b>${esc(m.name)}${m === c.v ? `<span class="tm-you">${as === 'you' ? 'You' : 'Previewing as'}</span>` : ''}</b><small>${esc(m.email)}${m.title ? ' &middot; ' + esc(m.title) : ''}</small><span class="tm-tags">${reach(t, m)}</span></span>`
        + `<span class="tm-r"><span class="tm-role">${ROLES[m.role][0]}</span>${edit && !open ? `<button type="button" class="tm-x" data-edit="${i}">Edit</button>` : ''}</span>`
        + (open ? `<form class="tm-edit" data-save="${i}">
            <div class="set-f"><label for="tm-er">Role</label><select class="input" id="tm-er" name="role">${roles.map((r) => `<option value="${r}"${r === m.role ? ' selected' : ''}>${ROLES[r][0]}</option>`).join('')}</select></div>
            <div class="tm-scope" data-escope="groups"${grouped(m.role) ? '' : ' hidden'}><span class="tm-lbl">Groups</span>${groupChecks(c, m.groups || [], 'eg')}</div>
            <div class="tm-scope" data-escope="all"${grouped(m.role) ? ' hidden' : ''}><p class="tm-note">Owners and admins open every page, so groups don&rsquo;t apply.</p></div>
            <p class="set-err" role="alert"></p>
            <div class="set-foot set-foot-l"><button type="submit" class="btn btn-primary btn-sm">Save</button><button type="button" class="tm-x" data-cancel-edit>Cancel</button><span style="flex:1"></span><button type="button" class="tm-x" data-remove="${i}">Remove from ${esc(cur.name)}</button></div>
          </form>` : '') + '</li>';
    };
    // pending invites: a manager sees and handles only the ones they sent
    const mineInvite = (v) => manages(c.role) || v.by === c.v.email;
    const invite = (v, i) => `<li><span class="tm-pic is-pending" aria-hidden="true">${MAIL}</span><span class="tm-t"><b>${esc(v.email)}</b><small>${ROLES[v.role][0]} &middot; invited ${esc(v.sent)}${v.resent ? ' &middot; sent again' : ''}</small><span class="tm-tags">${reach(t, v)}</span></span>${mineInvite(v) ? `<span class="tm-r"><button type="button" class="tm-x" data-resend="${i}">Resend</button><button type="button" class="tm-x" data-cancel="${i}">Cancel</button></span>` : '<span></span>'}</li>`;
    // managers and users see the people who share a group with them, and the owners and admins
    const visible = manages(c.role) ? t.members : t.members.filter((m) => m === c.v || manages(m.role) || (m.groups || []).some((g) => c.mine.includes(g)));
    const invites = t.invites.map((v, i) => [v, i]).filter(([v]) => mineInvite(v));
    const canInvite = c.grants.length > 0;
    const pick = c.grants.includes('user') ? 'user' : c.grants[0];
    const selecting = manages(c.role) && visible.some((m) => canEdit(c, m));
    const editable = visible.filter((m) => canEdit(c, m)).map((m) => t.members.indexOf(m));
    [...sel].forEach((i) => { if (!editable.includes(i)) sel.delete(i); });
    const peopleHtml = `<div class="tm-ph"><h3 class="set-sub">People in ${esc(cur.name)} <span class="set-opt">${visible.length}</span></h3>${selecting ? `<label class="tm-all"><input type="checkbox" data-sel-all${editable.length && editable.every((i) => sel.has(i)) ? ' checked' : ''}>Select all</label>` : ''}</div>
      ${roleMsg}
      <ul class="tm-list${selecting ? ' is-sel' : ''}" aria-label="People in ${esc(cur.name)}">${visible.map((m) => member(m, t.members.indexOf(m))).join('')}</ul>
      ${sel.size ? `<div class="tm-selbar" role="region" aria-label="Selected people"><span class="tm-selbar-t"><b>${sel.size} selected</b><span>${[...sel].map((i) => t.members[i]).filter(Boolean).map((m) => esc(m.name.split(' ')[0])).join(', ')}</span></span><span class="tm-selbar-a"><button type="button" class="tm-x" data-sel-clear>Clear</button><button type="button" class="btn btn-primary btn-sm" data-dw-open>Change role</button></span></div>` : ''}`;
    const invitesHtml = invites.length ? `<h3 class="set-sub">Waiting to accept <span class="set-opt">${invites.length}</span></h3><ul class="tm-list" aria-label="Pending invites">${invites.map(([v, i]) => invite(v, i)).join('')}</ul>` : '';
    box.innerHTML = `
      ${previewBar(t)}
      ${canInvite ? `<form class="tm-invite" id="tm-form" novalidate>
        <h3 class="set-sub">Invite people</h3>
        ${bulk ? bulkReview(c) : `<div class="tm-bulk" id="tm-bulk"><span><b>Inviting many people?</b> Upload an Excel file with their emails, roles and groups.</span><span class="tm-bulk-acts"><button type="button" class="tm-x" data-bulk-template>Download the template</button><button type="button" class="btn btn-secondary btn-sm" data-bulk-pick>Upload Excel file</button></span></div>
        <p class="set-err" id="tm-berr" role="alert">${bulkErr}</p>
        <div class="tm-or">or one by one</div>`}
        <input type="file" id="tm-bulk-file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden>
        <div class="tm-one"${bulk ? ' hidden' : ' style="display:grid;gap:1rem"'}>
        <div class="set-f"><label for="tm-emails">Work emails</label><input class="input" id="tm-emails" type="text" inputmode="email" autocomplete="off" placeholder="name@company.com, another@company.com"><p class="set-err" id="tm-err" role="alert"></p></div>
        ${c.grants.length > 1 ? `<div class="set-f"><span class="tm-lbl">Role</span><div class="tm-roles" role="radiogroup" aria-label="Role">${ORDER.filter((r) => c.grants.includes(r)).map((r) => `<label><input type="radio" name="tm-role" value="${r}"${r === pick ? ' checked' : ''}>${ROLES[r][0]}</label>`).join('')}</div><p class="tm-role-d" id="tm-role-d">${ROLES[pick][1]}</p></div>`
          : `<input type="hidden" name="tm-role" value="${pick}"><p class="tm-note">As a manager, you invite users, into the groups you are in.</p>`}
        <div class="tm-scope" data-scope="owner" hidden><p class="tm-note">An owner sees and does everything on ${family().map((o) => esc(o.name)).join(', ')}${family().length > 1 ? '' : ''}, and on any subsidiary added later.</p></div>
        ${others.length && c.role === 'owner' ? `<div class="tm-scope" data-scope="admin" hidden><span class="tm-lbl">Also make them admin of</span><div class="tm-checks">${others.map((o) => `<label><input type="checkbox" name="also" value="${esc(o.id)}"><span>${esc(o.name)}</span></label>`).join('')}</div></div>` : ''}
        <div class="tm-scope" data-scope="groups" hidden><span class="tm-lbl">Groups &mdash; the pages they&rsquo;ll open</span>${groupChecks(c, [], 'ig')}<p class="set-err" id="tm-gerr" role="alert"></p></div>
        <div class="set-foot"><span class="tm-sent" role="status">${flash}</span><button type="submit" class="btn btn-primary btn-sm" id="tm-go">Send invite</button></div>
        </div>
      </form>` : '<p class="tm-note">Users can&rsquo;t invite people. Ask a manager or an admin of this company.</p>'}
      ${invitesHtml}
      ${peopleHtml}`;
    flash = ''; bulkErr = ''; roleMsg = '';
    showScope();
    paintGroups(); paintPerms();
  };
  // ---- changing several people's role at once -----------------------------------------------------
  // Tick people; a bar sticks to the bottom of the list with who is selected. "Change role" opens a
  // drawer with the role, the groups (left empty, each keeps their own), and everyone selected:
  // their role and groups now, what they become, and anything stopping it — all in one view.
  const sel = new Set(), changed = new Set();
  let roleMsg = '', dRole = 'user';
  const dGroups = new Set();
  const dw = document.createElement('div');
  dw.className = 'tm-dw'; dw.hidden = true;
  dw.innerHTML = '<div class="tm-dw-scrim" data-dw-close></div><aside class="tm-dw-panel" role="dialog" aria-modal="true" aria-labelledby="tm-dw-t" tabindex="-1"></aside>';
  document.body.appendChild(dw);
  const panel = dw.querySelector('.tm-dw-panel');
  const plan = (c) => [...sel].map((i) => [i, c.t.members[i]]).filter(([, m]) => m).map(([i, m]) => {
    const to = dRole, ng = grouped(to) ? (dGroups.size ? [...dGroups] : (m.groups || [])) : [];
    const fg = grouped(m.role) ? (m.groups || []) : [];
    const same = m.role === to && fg.join() === ng.join();
    const problem = !canEdit(c, m) ? 'You can&rsquo;t change them' : grouped(to) && !ng.length ? 'Needs a group' : '';
    return { i, m, to, fg, ng, same, problem };
  });
  const gl = (t, ids, r) => (grouped(r) ? ids.map((id) => gName(t, id)).filter(Boolean).map(esc).join(', ') || 'No groups' : r === 'owner' ? 'Every page · parent and subsidiaries' : 'Every page of this company');
  const paintDrawer = () => {
    const c = ctx(), t = c.t, rows = plan(c);
    const moving = rows.filter((r) => !r.same && !r.problem).length, stuck = rows.filter((r) => r.problem).length;
    panel.innerHTML = `<header class="tm-dw-h"><div><h3 id="tm-dw-t">Change role</h3><p>${rows.length} ${rows.length === 1 ? 'person' : 'people'} selected</p></div><button type="button" class="tm-dw-x" data-dw-close aria-label="Close">&times;</button></header>
      <div class="tm-dw-b">
        <div class="set-f"><span class="tm-lbl">New role</span><div class="tm-roles" role="radiogroup" aria-label="New role">${ORDER.filter((r) => c.grants.includes(r)).map((r) => `<label><input type="radio" name="dw-role" value="${r}"${r === dRole ? ' checked' : ''}>${ROLES[r][0]}</label>`).join('')}</div><p class="tm-role-d">${ROLES[dRole][1]}</p></div>
        ${grouped(dRole) ? `<div class="set-f"><span class="tm-lbl">Groups <span class="set-opt">&middot; leave empty to keep each person&rsquo;s own</span></span>${groupChecks(c, [...dGroups], 'dg')}</div>` : '<p class="tm-note">Owners and admins open every page, so groups don&rsquo;t apply.</p>'}
        <div class="set-f"><span class="tm-lbl">What changes</span>
          <ul class="tm-plan">${rows.map((r) => `<li class="${r.problem ? 'is-bad' : r.same ? 'is-same' : ''}">
            <span class="tm-pic" aria-hidden="true">${esc(initials(r.m.name))}</span>
            <span class="tm-plan-t"><b>${esc(r.m.name)}</b>
              ${r.m.role === r.to ? `<span class="tm-plan-c"><span class="tm-stay">${ROLES[r.to][0]}</span></span>` : `<span class="tm-plan-c"><span class="tm-from">${ROLES[r.m.role][0]}</span><span aria-hidden="true">&rarr;</span><span class="tm-to">${ROLES[r.to][0]}</span></span>`}
              ${gl(t, r.fg, r.m.role) === gl(t, r.ng, r.to) ? `<small>${gl(t, r.ng, r.to)}</small>` : `<small><span class="tm-from">${gl(t, r.fg, r.m.role)}</span> &rarr; <span class="tm-to">${gl(t, r.ng, r.to)}</span></small>`}
              ${r.problem ? `<span class="co-badge b-over">${r.problem}</span>` : r.same ? '<span class="co-badge b-neu">No change</span>' : ''}</span>
            <button type="button" class="tm-x" data-unsel="${r.i}" aria-label="Take ${esc(r.m.name)} out">Remove</button></li>`).join('')}</ul></div>
      </div>
      <footer class="tm-dw-f"><span>${moving} change${moving === 1 ? '' : 's'}${stuck ? ` &middot; ${stuck} to sort out` : ''}</span><span class="tm-selbar-a"><button type="button" class="tm-x" data-dw-close>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-dw-apply${moving && !stuck ? '' : ' disabled'}>Apply ${moving || ''} change${moving === 1 ? '' : 's'}</button></span></footer>`;
  };
  let dwBack = null;
  const openDrawer = () => { dwBack = document.activeElement; dw.hidden = false; document.documentElement.style.overflow = 'hidden'; paintDrawer(); panel.focus(); };
  const closeDrawer = () => { dw.hidden = true; document.documentElement.style.overflow = ''; if (dwBack && dwBack.isConnected) dwBack.focus(); else { const b = box.querySelector('[data-dw-open]'); if (b) b.focus(); } };
  dw.addEventListener('click', (e) => {
    if (e.target.closest('[data-dw-close]')) { closeDrawer(); return; }
    const u = e.target.closest('[data-unsel]');
    if (u) { sel.delete(+u.dataset.unsel); paint(); if (!sel.size) closeDrawer(); else paintDrawer(); return; }
    if (e.target.closest('[data-dw-apply]')) {
      const c = ctx(), t = c.t, rows = plan(c).filter((r) => !r.same && !r.problem);
      rows.forEach((r) => { r.m.role = r.to; r.m.groups = r.ng; });
      save(cur.id, t);
      changed.clear(); rows.forEach((r) => changed.add(r.i));
      sel.clear(); dGroups.clear(); closeDrawer(); paint();
      // the toast: how many, and to what (one role and one set of groups, or "new roles")
      const roles = [...new Set(rows.map((r) => r.to))], gs = [...new Set(rows.map((r) => gl(t, r.ng, r.to)))];
      const to = roles.length === 1 ? `${ROLES[roles[0]][0]}${gs.length === 1 && grouped(roles[0]) ? ` &middot; ${gs[0]}` : ''}` : 'their new roles';
      toast(`<b>${rows.length} ${rows.length === 1 ? 'user was' : 'users were'} successfully changed</b><span>${roles.length === 1 ? 'Now ' : 'Moved to '}${to}</span>`);
      setTimeout(() => { changed.clear(); box.querySelectorAll('.is-changed').forEach((li) => li.classList.remove('is-changed')); }, 2400);
    }
  });
  dw.addEventListener('change', (e) => {
    if (e.target.name === 'dw-role') { dRole = e.target.value; paintDrawer(); const r = panel.querySelector(`[name="dw-role"][value="${dRole}"]`); if (r) r.focus(); return; }
    if (e.target.name === 'dg') { e.target.checked ? dGroups.add(e.target.value) : dGroups.delete(e.target.value); const v = e.target.value; paintDrawer(); const g = panel.querySelector(`[name="dg"][value="${v}"]`); if (g) g.focus(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !dw.hidden) closeDrawer(); });
  // a toast at the bottom of the screen, centred on the team card (the side menu takes the left of
  // the screen, so the window's own centre sits off the table); gone after a few seconds, or on its ×
  const toast = (html) => {
    document.querySelectorAll('.tm-toast').forEach((x) => x.remove());
    const el = document.createElement('div');
    el.className = 'tm-toast' + (A.previewing() ? ' is-raised' : ''); el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite');
    el.innerHTML = `<span class="tm-toast-i" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span><span class="tm-toast-t">${html}</span><button type="button" class="tm-toast-x" aria-label="Dismiss">&times;</button>`;
    document.body.appendChild(el);
    const card = document.getElementById('team');
    const place = () => { if (!el.isConnected) { removeEventListener('resize', place); return; } const r = card ? card.getBoundingClientRect() : null; el.style.left = (r && r.width ? r.left + r.width / 2 : innerWidth / 2) + 'px'; };
    place(); addEventListener('resize', place);
    const go = () => { el.classList.add('is-out'); setTimeout(() => { el.remove(); removeEventListener('resize', place); }, 250); };
    el.querySelector('button').addEventListener('click', go);
    let tm = setTimeout(go, 5000);
    el.addEventListener('mouseenter', () => clearTimeout(tm)); el.addEventListener('mouseleave', () => { tm = setTimeout(go, 2500); });
  };
  // previewing the page as someone else on the team
  const previewBar = (t) => manages(teamOf(cur.id).members.find((m) => m.you).role) ? `<div class="tm-as"><span>See the app as someone else on the team would: only the pages they can open.</span><label for="tm-as">Preview as <select class="input" id="tm-as">${t.members.map((m) => `<option value="${m.you ? 'you' : esc(m.email)}"${(m.you ? 'you' : m.email) === as ? ' selected' : ''}>${m.you ? 'You' : esc(m.name)} &middot; ${ROLES[m.role][0]}${grouped(m.role) && (m.groups || []).length ? ' (' + m.groups.map((g) => gName(t, g)).filter(Boolean).map(esc).join(', ') + ')' : ''}</option>`).join('')}</select></label></div>` : '';
  const pickedRole = () => { const r = box.querySelector('[name="tm-role"]:checked') || box.querySelector('input[type="hidden"][name="tm-role"]'); return r ? r.value : null; };
  const showScope = () => {
    const r = pickedRole();
    const d = box.querySelector('#tm-role-d'); if (d && ROLES[r]) d.textContent = ROLES[r][1];
    box.querySelectorAll('#tm-form .tm-scope').forEach((s) => { s.hidden = !(s.dataset.scope === r || (s.dataset.scope === 'groups' && grouped(r))); });
  };

  const valid = (e) => /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(e);

  // ---- inviting in bulk, from a spreadsheet ---------------------------------------------------------
  // One row a person: Email, Name, Role, Groups (group names, separated by ; or ,). Every row is
  // checked against the same rules as a single invite before anything is sent; the ones that pass
  // go out together, the rest say what's wrong. Prototype: read in the browser, nothing uploaded.
  let bulk = null, bulkErr = '';
  const ROLE_OF = { owner: 'owner', 'super admin': 'owner', admin: 'admin', administrator: 'admin', manager: 'manager', user: 'user', member: 'user' };
  const checkRows = (c, rows) => {
    const t = c.t, seen = new Set();
    const known = new Set(t.members.map((m) => m.email.toLowerCase()).concat(t.invites.map((v) => v.email)));
    return rows.map((r) => {
      const email = (r.email || '').trim().toLowerCase(), name = (r.name || '').trim();
      const rawRole = (r.role || '').trim().toLowerCase();
      const role = rawRole ? ROLE_OF[rawRole] : 'user';
      const names = (r.groups || '').split(/[;,]/).map((x) => x.trim()).filter(Boolean);
      const out = { email, name, role, roleText: role ? ROLES[role][0] : (r.role || '').trim(), groups: [], groupText: names.join(', ') };
      const fail = (why) => Object.assign(out, { ok: false, why });
      if (!valid(email)) return fail(email ? 'Not an email address' : 'No email');
      if (seen.has(email)) return fail('Twice in this file'); seen.add(email);
      if (known.has(email)) return fail('Already in the team, or invited');
      if (!role) return fail(`Unknown role &ldquo;${esc(r.role.trim())}&rdquo;`);
      if (!c.grants.includes(role)) return fail(c.role === 'manager' ? 'As a manager, you can only invite users' : `You can&rsquo;t invite ${ROLES[role][0].toLowerCase()}s`);
      if (grouped(role)) {
        for (const n of names) {
          const g = t.groups.find((x) => x.name.toLowerCase() === n.toLowerCase());
          if (!g) return fail(`No group called &ldquo;${esc(n)}&rdquo;`);
          if (!c.mine.includes(g.id)) return fail(`You&rsquo;re not in ${esc(g.name)}`);
          out.groups.push(g.id);
        }
        if (!out.groups.length) return fail('Needs at least one group');
      } else out.groupText = role === 'owner' ? 'Every page' : 'Every page of this company';
      return Object.assign(out, { ok: true });
    });
  };
  const bulkReview = (c) => {
    const rows = checkRows(c, bulk.rows), ok = rows.filter((r) => r.ok).length, bad = rows.length - ok;
    return `<div class="tm-rev">
      <div class="tm-rev-h"><p><b>${esc(bulk.file)}</b> &middot; ${rows.length} ${rows.length === 1 ? 'person' : 'people'}: ${ok} ready${bad ? `, ${bad} to fix in the file` : ''}.</p><button type="button" class="tm-x" data-bulk-pick>Choose another file</button></div>
      <div class="tm-rev-wrap"><table><thead><tr><th>Email</th><th>Role</th><th>Groups</th><th>Status</th></tr></thead><tbody>${rows.map((r) => `<tr class="${r.ok ? '' : 'is-bad'}"><td>${esc(r.email || '—')}${r.name ? `<small>${esc(r.name)}</small>` : ''}</td><td>${esc(r.roleText || '—')}</td><td>${esc(r.groupText || '—')}</td><td>${r.ok ? '<span class="co-badge b-ok">Ready</span>' : `<span class="co-badge b-over">${r.why}</span>`}</td></tr>`).join('')}</tbody></table></div>
      ${bad ? '<p class="tm-perm-note" style="margin:0">Rows to fix are left out. Fix them in the file and upload it again, or send the ready ones now.</p>' : ''}
      <div class="set-foot set-foot-l"><button type="button" class="btn btn-primary btn-sm" data-bulk-send${ok ? '' : ' disabled'}>Send ${ok} invite${ok === 1 ? '' : 's'}</button><button type="button" class="tm-x" data-bulk-cancel>Cancel</button></div>
    </div>`;
  };

  // reading the file: a CSV as text; an .xlsx is a zip of XML, opened with the browser's own inflate
  const cellsOf = (text) => {
    const sep = (text.split('\n')[0].match(/;/g) || []).length > (text.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (q) { if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (ch === '"') q = false; else cell += ch; }
      else if (ch === '"') q = true;
      else if (ch === sep) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  };
  const unzip = (buf) => {
    const dv = new DataView(buf), dec = new TextDecoder();
    let e = buf.byteLength - 22; while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
    if (e < 0) throw new Error('zip');
    const files = {}; let p = dv.getUint32(e + 16, true);
    for (let i = dv.getUint16(e + 10, true); i > 0; i--) {
      const nl = dv.getUint16(p + 28, true), name = dec.decode(new Uint8Array(buf, p + 46, nl));
      files[name] = { method: dv.getUint16(p + 10, true), size: dv.getUint32(p + 20, true), at: dv.getUint32(p + 42, true) };
      p += 46 + nl + dv.getUint16(p + 30, true) + dv.getUint16(p + 32, true);
    }
    const read = async (name) => {
      const f = files[name]; if (!f) return null;
      const data = new Uint8Array(buf, f.at + 30 + dv.getUint16(f.at + 26, true) + dv.getUint16(f.at + 28, true), f.size);
      if (f.method === 0) return dec.decode(data);
      return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    };
    return { files, read };
  };
  const xlsxRows = async (buf) => {
    const z = unzip(buf), xml = (t) => new DOMParser().parseFromString(t, 'application/xml');
    const shared = await z.read('xl/sharedStrings.xml');
    const strings = shared ? [...xml(shared).getElementsByTagName('si')].map((si) => [...si.getElementsByTagName('t')].map((x) => x.textContent).join('')) : [];
    const sheet = Object.keys(z.files).filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0];
    const doc = xml(await z.read(sheet));
    const col = (ref) => [...ref.replace(/\d+$/, '')].reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
    return [...doc.getElementsByTagName('row')].map((r) => {
      const out = [];
      [...r.getElementsByTagName('c')].forEach((c) => {
        const type = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
        out[col(c.getAttribute('r'))] = type === 's' ? strings[+v.textContent] : type === 'inlineStr' ? [...c.getElementsByTagName('t')].map((x) => x.textContent).join('') : v ? v.textContent : '';
      });
      return [...out].map((x) => x || '');
    });
  };
  // the columns by their headings (Email, Name, Role, Groups), or in that order when there are none
  const toPeople = (cells) => {
    const rows = cells.filter((r) => r.some((x) => String(x).trim()));
    if (!rows.length) return [];
    const head = rows[0].map((x) => String(x).trim().toLowerCase());
    const has = head.some((h) => /mail/.test(h));
    const at = (re, d) => { const i = head.findIndex((h) => re.test(h)); return has ? i : d; };
    const ix = { email: at(/mail/, 0), name: at(/name|nome/, 1), role: at(/role|fun[cç]/, 2), groups: at(/group|grupo/, 3) };
    return (has ? rows.slice(1) : rows).map((r) => Object.fromEntries(Object.entries(ix).map(([k, i]) => [k, i >= 0 ? String(r[i] || '') : ''])));
  };
  const takeFile = async (file) => {
    if (!file) return;
    try {
      const cells = /\.csv$/i.test(file.name) || file.type === 'text/csv' ? cellsOf(await file.text()) : await xlsxRows(await file.arrayBuffer());
      const rows = toPeople(cells);
      if (!rows.length) { bulkErr = 'That file has no rows. Use the template: one person a row, starting with their email.'; bulk = null; }
      else bulk = { file: file.name, rows };
    } catch (er) { bulkErr = 'That file couldn’t be read. Save it as Excel (.xlsx) or CSV and try again.'; bulk = null; }
    paint();
  };

  // the template, an .xlsx made here: a zip of plain XML, stored without compression
  const template = () => {
    const c = ctx(), g1 = c.t.groups.find((g) => c.mine.includes(g.id)), g2 = c.t.groups.filter((g) => c.mine.includes(g.id))[1];
    const rows = [['Email', 'Name', 'Role', 'Groups'], ['joana.silva@example.com', 'Joana Silva', 'User', g1 ? g1.name : '']];
    if (c.grants.includes('manager')) rows.push(['rui.costa@example.com', 'Rui Costa', 'Manager', [g1, g2].filter(Boolean).map((g) => g.name).join('; ')]);
    const x = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><cols><col min="1" max="1" width="34" customWidth="1"/><col min="2" max="2" width="22" customWidth="1"/><col min="3" max="3" width="12" customWidth="1"/><col min="4" max="4" width="34" customWidth="1"/></cols><sheetData>${rows.map((r, i) => `<row r="${i + 1}">${r.map((v, j) => `<c r="${'ABCD'[j]}${i + 1}" t="inlineStr"${i ? '' : ' s="1"'}><is><t>${x(v)}</t></is></c>`).join('')}</row>`).join('')}</sheetData></worksheet>`;
    const files = {
      '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>',
      '_rels/.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="People" sheetId="1" r:id="rId1"/></sheets></workbook>',
      'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      'xl/styles.xml': '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf xfId="0"/><xf xfId="0" fontId="1" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
      'xl/worksheets/sheet1.xml': sheet,
    };
    const enc = new TextEncoder(), crcT = [...Array(256)].map((_, n) => { let k = n; for (let i = 0; i < 8; i++) k = k & 1 ? 0xedb88320 ^ (k >>> 1) : k >>> 1; return k >>> 0; });
    const crc = (b) => { let k = 0xffffffff; for (const v of b) k = crcT[(k ^ v) & 255] ^ (k >>> 8); return (k ^ 0xffffffff) >>> 0; };
    const parts = [], dir = []; let off = 0;
    Object.entries(files).forEach(([name, text]) => {
      const n = enc.encode(name), d = enc.encode(text), c32 = crc(d);
      const h = new DataView(new ArrayBuffer(30)); [[0, 0x04034b50, 4], [4, 20, 2], [8, 0, 2], [14, c32, 4], [18, d.length, 4], [22, d.length, 4], [26, n.length, 2]].forEach(([o, v, z]) => (z === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true)));
      const cd = new DataView(new ArrayBuffer(46)); [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [16, c32, 4], [20, d.length, 4], [24, d.length, 4], [28, n.length, 2], [42, off, 4]].forEach(([o, v, z]) => (z === 4 ? cd.setUint32(o, v, true) : cd.setUint16(o, v, true)));
      parts.push(h.buffer, n, d); dir.push(cd.buffer, n); off += 30 + n.length + d.length;
    });
    const size = dir.reduce((a, b) => a + (b.byteLength || b.length), 0);
    const end = new DataView(new ArrayBuffer(22)); [[0, 0x06054b50, 4], [8, Object.keys(files).length, 2], [10, Object.keys(files).length, 2], [12, size, 4], [16, off, 4]].forEach(([o, v, z]) => (z === 4 ? end.setUint32(o, v, true) : end.setUint16(o, v, true)));
    const url = URL.createObjectURL(new Blob([...parts, ...dir, end.buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    Object.assign(document.createElement('a'), { href: url, download: 'C-MORE invite template.xlsx' }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  box.addEventListener('change', (e) => { if (e.target.id === 'tm-bulk-file') takeFile(e.target.files[0]); });
  ['dragover', 'dragenter'].forEach((ev) => box.addEventListener(ev, (e) => { const z = e.target.closest('#tm-bulk'); if (z) { e.preventDefault(); z.classList.add('is-over'); } }));
  box.addEventListener('dragleave', (e) => { const z = e.target.closest('#tm-bulk'); if (z && !z.contains(e.relatedTarget)) z.classList.remove('is-over'); });
  box.addEventListener('drop', (e) => { const z = e.target.closest('#tm-bulk'); if (z) { e.preventDefault(); takeFile(e.dataTransfer.files[0]); } });

  box.addEventListener('submit', (e) => {
    e.preventDefault();
    const c = ctx(), t = c.t;
    // saving someone's role and groups
    const ef = e.target.closest('[data-save]');
    if (ef) {
      const m = t.members[+ef.dataset.save], role = ef.querySelector('[name="role"]').value;
      const groups = [...ef.querySelectorAll('[name="eg"]:checked')].map((x) => x.value);
      if (grouped(role) && !groups.length) { ef.querySelector('.set-err').textContent = 'Pick at least one group: it decides which pages they open.'; return; }
      m.role = role; m.groups = grouped(role) ? groups : [];
      editing = null; save(cur.id, t); paint(); return;
    }
    const raw = document.getElementById('tm-emails').value.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter(Boolean);
    const err = document.getElementById('tm-err');
    if (!raw.length) { err.textContent = 'Add at least one email.'; return; }
    const bad = raw.filter((x) => !valid(x));
    if (bad.length) { err.textContent = `Check ${bad.length === 1 ? 'this email' : 'these emails'}: ${bad.join(', ')}.`; document.getElementById('tm-emails').classList.add('is-bad'); return; }
    const role = pickedRole();
    // a manager or user sees what their groups cover: at least one; a manager hands out only their own
    const groups = grouped(role) ? [...box.querySelectorAll('[name="ig"]:checked')].map((x) => x.value).filter((g) => c.mine.includes(g)) : [];
    if (grouped(role) && !groups.length) { document.getElementById('tm-gerr').textContent = 'Pick at least one group: it decides which pages they open.'; return; }
    // an owner is on the whole family; an admin, on the companies ticked
    const also = role === 'owner' ? family().map((o) => o.id).filter((id) => id !== cur.id) : role === 'admin' ? [...box.querySelectorAll('[name="also"]:checked')].map((x) => x.value) : [];
    const known = new Set(t.members.map((m) => m.email.toLowerCase()).concat(t.invites.map((v) => v.email)));
    const fresh = [...new Set(raw)].filter((x) => !known.has(x));
    if (!fresh.length) { err.textContent = raw.length === 1 ? 'They are already in the team, or invited.' : 'They are all already in the team, or invited.'; return; }
    fresh.forEach((email) => t.invites.push({ email, role, groups, also, sent: today(), by: c.v.email }));
    save(cur.id, t);
    // the same invite shows on each company it also covers
    also.forEach((id) => { const o = teamOf(id); fresh.forEach((email) => { if (!o.invites.some((v) => v.email === email)) o.invites.push({ email, role, groups: [], also: [cur.id], sent: today(), by: c.v.email }); }); save(id, o); });
    const skipped = raw.length - fresh.length;
    flash = `Invite sent to ${fresh.length === 1 ? fresh[0] : fresh.length + ' people'}.${skipped ? ` ${skipped} already in the team.` : ''}`;
    paint();
    const again = document.getElementById('tm-emails'); if (again) again.focus();
  });
  box.addEventListener('input', (e) => { if (e.target.id === 'tm-emails') { e.target.classList.remove('is-bad'); document.getElementById('tm-err').textContent = ''; } });
  box.addEventListener('change', (e) => {
    // previewing: the whole app, as them (js/access.js), so the page reloads
    if (e.target.id === 'tm-as') { A.preview(e.target.value === 'you' ? null : e.target.value); location.reload(); return; }
    if (e.target.name === 'tm-role') { showScope(); return; }
    if (e.target.matches('[data-sel]')) { const i = +e.target.dataset.sel; e.target.checked ? sel.add(i) : sel.delete(i); paint(); const b = box.querySelector(`[data-sel="${i}"]`); if (b) b.focus({ preventScroll: true }); return; }
    if (e.target.matches('[data-sel-all]')) { const c = ctx(); c.t.members.forEach((m, i) => { if (e.target.checked && canEdit(c, m)) sel.add(i); else sel.delete(i); }); paint(); return; }
    if (e.target.name === 'ig') { const ge = document.getElementById('tm-gerr'); if (ge) ge.textContent = ''; return; }
    const ef = e.target.closest('[data-save]');
    if (ef && e.target.name === 'role') {
      const g = grouped(e.target.value);
      ef.querySelector('[data-escope="groups"]').hidden = !g; ef.querySelector('[data-escope="all"]').hidden = g;
      ef.querySelector('.set-err').textContent = '';
    }
  });
  box.addEventListener('click', (e) => {
    const c = ctx(), t = c.t;
    if (e.target.closest('[data-bulk-template]')) { template(); return; }
    if (e.target.closest('[data-sel-clear]')) { sel.clear(); paint(); return; }
    if (e.target.closest('[data-dw-open]')) { openDrawer(); return; }
    if (e.target.closest('[data-bulk-pick]')) { const f = box.querySelector('#tm-bulk-file'); f.value = ''; f.click(); return; }
    if (e.target.closest('[data-bulk-cancel]')) { bulk = null; paint(); return; }
    if (e.target.closest('[data-bulk-send]')) {
      const ready = checkRows(c, bulk.rows).filter((r) => r.ok);
      ready.forEach((r) => t.invites.push({ email: r.email, name: r.name, role: r.role, groups: r.groups, also: r.role === 'owner' ? family().map((o) => o.id).filter((id) => id !== cur.id) : [], sent: today(), by: c.v.email }));
      save(cur.id, t);
      flash = `${ready.length} invite${ready.length === 1 ? '' : 's'} sent from ${bulk.file}.`; bulk = null; paint();
      const st = box.querySelector('.tm-sent'); if (st) st.scrollIntoView({ block: 'center' });
      return;
    }
    const ed = e.target.closest('[data-edit]');
    if (ed) { editing = +ed.dataset.edit; paint(); const s = box.querySelector('#tm-er'); if (s) s.focus(); return; }
    if (e.target.closest('[data-cancel-edit]')) { editing = null; paint(); return; }
    const r = e.target.closest('[data-remove]');
    if (r) { const m = t.members[+r.dataset.remove]; if (!confirm(`Remove ${m.name} from ${cur.name}? They lose access straight away.`)) return; t.members.splice(+r.dataset.remove, 1); editing = null; save(cur.id, t); paint(); return; }
    const cn = e.target.closest('[data-cancel]');
    if (cn) { t.invites.splice(+cn.dataset.cancel, 1); save(cur.id, t); paint(); return; }
    const s = e.target.closest('[data-resend]');
    if (s) { t.invites[+s.dataset.resend].resent = true; t.invites[+s.dataset.resend].sent = today(); save(cur.id, t); paint(); }
  });

  // ---- groups: what each covers, and who is in it ------------------------------------------------------
  const paintGroups = () => {
    if (!gbox) return;
    const c = ctx(), t = c.t, can = manages(c.role);
    const count = (g) => t.members.filter((m) => grouped(m.role) && (m.groups || []).includes(g.id));
    const form = (g) => `<form class="tm-gform" data-gsave="${g ? esc(g.id) : ''}">
        <h3 class="set-sub">${g ? `Edit ${esc(g.name)}` : 'New group'}</h3>
        <div class="set-f"><label for="tm-gn">Name</label><input class="input" id="tm-gn" name="gname" value="${g ? esc(g.name) : ''}" placeholder="e.g. Procurement" autocomplete="off"></div>
        <div class="set-f"><span class="tm-lbl">Pages it opens</span><div class="tm-checks">${PAGES.map(([k, n, d]) => `<label><input type="checkbox" name="gc" value="${k}"${g && g.content.includes(k) ? ' checked' : ''}><span>${n}<small>${d}</small></span></label>`).join('')}</div></div>
        <p class="set-err" role="alert"></p>
        <div class="set-foot set-foot-l"><button type="submit" class="btn btn-primary btn-sm">${g ? 'Save' : 'Create group'}</button><button type="button" class="tm-x" data-gcancel>Cancel</button>${g ? `<span style="flex:1"></span><button type="button" class="tm-x" data-gdel="${esc(g.id)}">Delete group</button>` : ''}</div>
      </form>`;
    // managers and users see the groups they are in
    const shown = can ? t.groups : t.groups.filter((g) => c.mine.includes(g.id));
    gbox.innerHTML = `<div class="tm-groups">${shown.map((g) => gEditing === g.id ? form(g) : `<div class="tm-group${!can && c.mine.includes(g.id) ? ' is-mine' : ''}">
        <div class="tm-group-h"><b>${esc(g.name)}</b>${can ? `<button type="button" class="tm-x" data-gedit="${esc(g.id)}">Edit</button>` : ''}</div>
        <p>${g.content.map((k) => CNAME[k]).filter(Boolean).join(' &middot; ') || 'Opens no pages yet.'}</p>
        <div class="tm-group-f"><span>${count(g).length ? count(g).map((m) => esc(m.name.split(' ')[0])).join(', ') : 'Nobody yet'}</span><span>${count(g).length} ${count(g).length === 1 ? 'person' : 'people'}</span></div>
      </div>`).join('')}${can ? (gEditing === 'new' ? form(null) : '<button type="button" class="tm-group-new" data-gnew>+ New group</button>') : ''}</div>
      ${shown.length || can ? '' : '<p class="tm-note">You aren&rsquo;t in any group yet.</p>'}`;
  };
  if (gbox) {
    gbox.addEventListener('click', (e) => {
      const t = ctx().t;
      if (e.target.closest('[data-gnew]')) { gEditing = 'new'; paintGroups(); gbox.querySelector('#tm-gn').focus(); return; }
      const ge = e.target.closest('[data-gedit]'); if (ge) { gEditing = ge.dataset.gedit; paintGroups(); gbox.querySelector('#tm-gn').focus(); return; }
      if (e.target.closest('[data-gcancel]')) { gEditing = null; paintGroups(); return; }
      const gd = e.target.closest('[data-gdel]');
      if (gd) {
        const g = t.groups.find((x) => x.id === gd.dataset.gdel), n = t.members.filter((m) => (m.groups || []).includes(g.id)).length;
        if (!confirm(`Delete ${g.name}?${n ? ` ${n} ${n === 1 ? 'person loses' : 'people lose'} what it covers.` : ''}`)) return;
        t.groups = t.groups.filter((x) => x !== g); [].concat(t.members, t.invites).forEach((m) => { m.groups = (m.groups || []).filter((x) => x !== g.id); });
        gEditing = null; save(cur.id, t); paint();
      }
    });
    gbox.addEventListener('submit', (e) => {
      e.preventDefault();
      const t = ctx().t, f = e.target, name = f.querySelector('[name="gname"]').value.trim(), content = [...f.querySelectorAll('[name="gc"]:checked')].map((x) => x.value);
      const err = f.querySelector('.set-err');
      if (!name) { err.textContent = 'Give the group a name.'; return; }
      if (t.groups.some((g) => g.name.toLowerCase() === name.toLowerCase() && g.id !== f.dataset.gsave)) { err.textContent = 'There is already a group with that name.'; return; }
      if (!content.length) { err.textContent = 'Pick at least one page it opens.'; return; }
      if (f.dataset.gsave) Object.assign(t.groups.find((g) => g.id === f.dataset.gsave), { name, content });
      else t.groups.push({ id: 'g-' + Date.now().toString(36), name, content });
      gEditing = null; save(cur.id, t); paint();
    });
  }

  // ---- roles & permissions: what comes with each role ---------------------------------------------------
  const YES = '<span class="tm-yes" aria-label="Yes"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>';
  const NO = '<span class="tm-no" aria-label="No">&mdash;</span>';
  const SOME = (x) => `${YES}<small>${x}</small>`;
  const PERMS = [
    ['Companies they work in', [SOME('The parent and all its subsidiaries'), SOME('The ones they&rsquo;re assigned to'), SOME('The ones they&rsquo;re assigned to'), SOME('The one they&rsquo;re assigned to')]],
    ['Pages they open', [SOME('All of them'), SOME('All of them'), SOME('The ones their groups give them'), SOME('The ones their groups give them')]],
    ['Upload and edit, on those pages', [YES, YES, YES, NO]],
    ['Invite people', [SOME('Any role'), SOME('Admins, managers and users'), SOME('Users, into their own groups'), NO]],
    ['Change roles and groups, remove people', [YES, SOME('Except owners'), NO, NO]],
    ['Create and edit groups', [YES, YES, NO, NO]],
    ['Team management', [YES, YES, SOME('To invite users'), NO]],
    ['Company settings and billing', [YES, YES, NO, NO]],
    ['Add subsidiaries and new companies', [YES, NO, NO, NO]],
  ];
  const paintPerms = () => {
    if (!perm) return;
    const r = ctx().role;
    perm.innerHTML = `<div class="tm-perm-wrap"><table class="tm-perm"><thead><tr><th scope="col"><span class="sr-only">Permission</span></th>${ORDER.map((k) => `<th scope="col">${ROLES[k][0]}${k === r ? `<small>${as === 'you' ? 'Your role' : 'Previewing'}</small>` : ''}</th>`).join('')}</tr></thead>`
      + `<tbody>${PERMS.map(([what, cells]) => `<tr><th scope="row">${what}</th>${cells.map((x) => `<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
      + '<p class="tm-perm-note">A person&rsquo;s permissions come from their role; for managers and users, the pages they open come from their groups. A group gives a whole page, never part of one.</p>';
  };

  document.getElementById('team-company').textContent = cur.name;
  paint();
})();
