/* A client added you to one of their projects: the bell says so, on every page, and the notification
   opens the project (project.html?id=), where you see only what they share with their suppliers and
   add your part of the team. Miguel's company only (the projects are its; js/projects.js NOTIFIED).
   What you've read is kept for the tab; opening the project reads it too.
   Loaded after js/profile-notify.js and before each page's notifications script, so it is counted.
   window.CMProjectNotes: markRead(id). */
window.CMProjectNotes = (() => {
  const none = { markRead: () => {} };
  if (document.documentElement.dataset.persona === 'beatriz') return none;
  const get = (k) => { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  // the demo company's own projects: not the test user's, not a company added in this session
  if ((get('cm-org') || 'home') !== 'home' || /^test@c-more\.test$/i.test((get('cm-person') || {}).email || '')) return none;
  const NEW = [
    { id: 'ME-2026-131', by: 'Mota‑Engil', name: 'Data centre shell, Building C', where: 'Matosinhos', when: 'today' },
    { id: 'SN-2026-071', by: 'Sonae MC', name: 'Cold storage annex', where: 'Maia', when: '2 days ago' },
  ];
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const RKEY = 'cm-pj-note-read';
  const readSet = () => new Set(get(RKEY) || []);
  const items = new Map();
  const recount = () => {
    const n = [...document.querySelectorAll('#nt .nt-item.is-unread')].filter((i) => !i.closest('.persona-beatriz-only')).length;
    document.querySelectorAll('[data-sn-count]').forEach((c) => { c.textContent = n; if (!n) c.hidden = true; else if (c.dataset.esgShow) c.hidden = false; });
    const bell = document.getElementById('hdr-bell'); if (bell) bell.setAttribute('aria-label', n ? `Notifications, ${n} new` : 'Notifications');
  };
  const markRead = (id) => {
    if (!NEW.some((x) => x.id === id)) return;
    const s = readSet(); s.add(id); try { sessionStorage.setItem(RKEY, JSON.stringify([...s])); } catch (e) {}
    const a = items.get(id); if (a && a.classList.contains('is-unread')) { a.classList.remove('is-unread'); recount(); }
  };
  const nt = document.getElementById('nt'), list = nt && (nt.querySelector('.nt-list.persona-miguel-only') || nt.querySelector('.nt-list'));
  if (list) {
    const read = readSet();
    const lis = NEW.map((x) => {
      const li = document.createElement('li'), href = `project.html?id=${encodeURIComponent(x.id)}`;
      li.innerHTML = `<a href="${href}" class="nt-item${read.has(x.id) ? '' : ' is-unread'}" data-pj-note="${esc(x.id)}"><span class="nt-mark nt-info" aria-hidden="true"></span><span class="nt-body"><b>${esc(x.by)} added you to a project</b><span>${esc(x.name)} &middot; ${esc(x.where)}. Add the team you&rsquo;re bringing.</span><small>Projects &middot; ${esc(x.when)}</small></span><span class="nt-dot" aria-label="Unread"></span></a>`;
      const a = li.firstElementChild; items.set(x.id, a);
      // first in line, so the page's own handler (which goes to a section of the company page) never sees it
      a.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); markRead(x.id); location.href = href; });
      return li;
    });
    // under the clients waiting on your consent, above the rest
    const asks = [...list.querySelectorAll(':scope > li')].filter((li) => li.querySelector('[data-consent]'));
    if (asks.length) asks[asks.length - 1].after(...lis); else list.prepend(...lis);
    recount();
    const all = document.getElementById('nt-readall');
    if (all) all.addEventListener('click', () => NEW.forEach((x) => markRead(x.id)));
  }
  return { markRead };
})();
