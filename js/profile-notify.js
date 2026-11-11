/* A sector with no subsector: the company profile can't be completed without one, so the bell says
   so, on every page, for as long as one is missing (js/co-profile.js: subsMissing). Clicking it opens
   the subsector selector itself, in Settings > Company profile > Activity (company-profile.html),
   and a link there with ?need=sub does the same. Under the consents a client is waiting on, above the
   rest. What you've read is kept for the tab, per person.
   Loaded after js/consent-notify.js and before each page's notifications script, so it is counted. */
(() => {
  const P = window.CO_PROFILE; if (!P || !P.subsMissing) return;
  const persona = document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const RKEY = 'cm-profile-note-read-' + persona;
  const isRead = () => { try { return sessionStorage.getItem(RKEY) === '1'; } catch (e) { return false; } };
  const markRead = () => { try { sessionStorage.setItem(RKEY, '1'); } catch (e) {} };
  const HREF = 'company-profile.html?need=sub#activity';
  const onProfile = /company-profile\.html$/.test(location.pathname);

  const missing = () => { const p = P.load(); return p.sectors ? P.subsMissing(p) : []; };
  const names = (m) => m.map((k) => P.label(P.SECTORS, k));

  const recount = () => {
    const n = [...document.querySelectorAll('#nt .nt-item.is-unread')].filter((i) => !i.closest(`.persona-${persona === 'beatriz' ? 'miguel' : 'beatriz'}-only`)).length;
    document.querySelectorAll('[data-sn-count]').forEach((c) => { c.textContent = n; if (!n) c.hidden = true; else if (c.dataset.esgShow) c.hidden = false; });
    const bell = document.getElementById('hdr-bell'); if (bell) bell.setAttribute('aria-label', n ? `Notifications, ${n} new` : 'Notifications');
  };

  // the selector: the first sector without one, its list focused
  const toSelector = (smooth) => {
    const k = missing()[0], sec = k && document.querySelector(`#activity .cpf-sec[data-sec="${k}"]`); if (!sec) return;
    const sel = sec.querySelector('[data-sub-add]');
    scrollTo({ top: sec.getBoundingClientRect().top + scrollY - innerHeight / 3, behavior: smooth ? 'smooth' : 'instant' });
    sec.classList.remove('is-asked'); void sec.offsetWidth; sec.classList.add('is-asked');
    if (sel) setTimeout(() => sel.focus({ preventScroll: true }), smooth ? 450 : 30);
  };

  // ---- the bell ---------------------------------------------------------------------------------
  const nt = document.getElementById('nt');
  const box = nt && (nt.querySelector(`.nt-list.persona-${persona}-only`) || nt.querySelector('.nt-list'));
  let item = null;
  const draw = () => {
    const m = missing();
    if (!m.length) { if (item) { item.parentElement.remove(); item = null; recount(); } return; }
    if (!box) return;
    const n = names(m);
    const html = `<a href="${HREF}" class="nt-item${isRead() ? '' : ' is-unread'}" data-profile-note><span class="nt-mark nt-pend" aria-hidden="true"></span><span class="nt-body"><b>Choose a subsector to finish your company profile</b><span>${n.length === 1 ? esc(n[0]) + ' has' : n.length + ' of your sectors have'} no subsector yet. Your profile can&rsquo;t be completed without one.</span><small>Company profile &middot; today</small></span><span class="nt-dot" aria-label="Unread"></span></a>`;
    if (item) { const was = item.classList.contains('is-unread'); item.outerHTML = html; item = box.querySelector('[data-profile-note]'); if (!was) item.classList.remove('is-unread'); }
    else {
      const li = document.createElement('li'); li.innerHTML = html;
      const consents = box.querySelectorAll(':scope > li:has([data-consent])');
      if (consents.length) consents[consents.length - 1].after(li); else box.prepend(li);
      item = li.firstElementChild;
    }
    // first in line, so the page's own handler never sees it
    item.addEventListener('click', (e) => {
      e.preventDefault(); e.stopImmediatePropagation();
      markRead(); item.classList.remove('is-unread'); recount();
      if (onProfile) { nt.classList.remove('is-open'); const b = document.getElementById('hdr-bell'); if (b) b.setAttribute('aria-expanded', 'false'); history.replaceState(null, '', HREF); toSelector(true); return; }
      location.href = HREF;
    });
  };
  draw();
  const all = document.getElementById('nt-readall'); if (all) all.addEventListener('click', markRead);
  // a subsector chosen and saved (Settings, ALMA's check): it goes; one removed: it's back
  document.addEventListener('cm-profile', () => { draw(); recount(); });

  // arrived to choose one: it's read, and the selector is in front of you (after the page draws its form)
  if (onProfile && new URLSearchParams(location.search).get('need') === 'sub') {
    markRead(); if (item) item.classList.remove('is-unread');
    addEventListener('load', () => setTimeout(() => toSelector(false), 120));
  }
})();
