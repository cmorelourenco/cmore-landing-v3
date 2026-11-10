/* A client asking for your consent: the request comes as a notification on the bell, on every page.
   One document asked for, and the notification opens that document (company-details.html?open=,
   where its drawer asks you to give or decline consent); more than one, and it opens the consents on
   the company page (my-company.html#consents), at that request. The request also shows where it
   needs you: its row in "Who asked for your consents", the count on the company page's Consents
   card, and a "Consent asked" mark on each document it covers in Documents.
   The requests are the company profile's (js/co-profile.js: consents with an ask), so an answer
   given anywhere is the answer everywhere. What you've read is kept for the tab, per person.
   Loaded before each page's notifications script, so its entries are counted like the others.
   window.CMConsents: pending(), forDoc(code), answer(id, yes), hrefOf(request), single(request). */
window.CMConsents = (() => {
  const P = window.CO_PROFILE; if (!P) return null;
  const persona = document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel';
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const RKEY = 'cm-consent-read-' + persona;
  const readSet = () => { try { return new Set(JSON.parse(sessionStorage.getItem(RKEY)) || []); } catch (e) { return new Set(); } };
  const keepRead = (s) => { try { sessionStorage.setItem(RKEY, JSON.stringify([...s])); } catch (e) {} };
  const markRead = (ids) => { const s = readSet(); [].concat(ids).forEach((i) => s.add(i)); keepRead(s); };

  // the requests that came as notifications, and the ones still waiting for you
  const asks = () => P.load().consents.filter((c) => c.id && c.ask);
  const pending = () => asks().filter((c) => c.state === 'pending');
  const count = (c) => (c.codes ? c.codes.length : c.n || 2);
  const single = (c) => count(c) === 1;
  const hrefOf = (c) => (single(c) ? `company-details.html?open=${encodeURIComponent(c.codes[0])}&ask=${encodeURIComponent(c.id)}` : `my-company.html?filled&ask=${encodeURIComponent(c.id)}#consents`);
  const forDoc = (code) => pending().filter((c) => (c.codes || []).includes(code));
  const nb = (n) => String(n).replace(/-/g, '‑'); // Mota‑Engil, on one line
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const ago = (c) => (c.when || '').replace(/^Asked /, '') || 'just now';

  // ---- the bell ---------------------------------------------------------------------------------
  const nt = document.getElementById('nt');
  const list = nt && (nt.querySelector(`.nt-list.persona-${persona}-only`) || nt.querySelector('.nt-list'));
  const items = new Map(); // request id -> its notification
  const recount = () => {
    const n = [...document.querySelectorAll('#nt .nt-item.is-unread')].filter((i) => !i.closest(`.persona-${persona === 'beatriz' ? 'miguel' : 'beatriz'}-only`)).length;
    document.querySelectorAll('[data-sn-count]').forEach((c) => { c.textContent = n; if (!n) c.hidden = true; else if (c.dataset.esgShow) c.hidden = false; });
    const bell = document.getElementById('hdr-bell'); if (bell) bell.setAttribute('aria-label', n ? `Notifications, ${n} new` : 'Notifications');
  };
  const closePanel = () => { if (!nt) return; nt.classList.remove('is-open'); const b = document.getElementById('hdr-bell'); if (b) b.setAttribute('aria-expanded', 'false'); };
  const here = (page) => location.pathname.endsWith('/' + page) || location.pathname.endsWith(page);
  const draw = () => {
    if (!list) return;
    // the page's own consent entries make way for these (they are the same requests)
    const old = [...list.querySelectorAll(':scope > li')].filter((li) => { const s = li.querySelector('.nt-item small'); return s && /^Consents\b/.test(s.textContent.trim()) && !li.querySelector('[data-consent]'); });
    const read = readSet();
    const lis = asks().map((c) => {
      const li = document.createElement('li'), n = count(c), unread = c.state === 'pending' && !read.has(c.id);
      const sub = single(c) ? `Give or decline your consent from the document.` : `${n} documents: ${c.what}.`;
      li.innerHTML = `<a href="${hrefOf(c)}" class="nt-item${unread ? ' is-unread' : ''}" data-consent="${esc(c.id)}"><span class="nt-mark nt-info" aria-hidden="true"></span><span class="nt-body"><b>${esc(nb(c.short || c.name))} asked to see ${esc(c.ask)}</b><span>${esc(cap(sub))}</span><small>Consents &middot; ${esc(ago(c))}</small></span><span class="nt-dot" aria-label="Unread"></span></a>`;
      const a = li.firstElementChild; items.set(c.id, a);
      // first in line, so the page's own handler (which goes to a section of the company page) never sees it
      a.addEventListener('click', (e) => {
        e.preventDefault(); e.stopImmediatePropagation();
        markRead(c.id); a.classList.remove('is-unread'); recount();
        if (!single(c) && here('my-company.html') && document.querySelector('#filled:not([hidden])')) { closePanel(); arrive(c.id, true); return; }
        location.href = hrefOf(c);
      });
      return li;
    });
    list.prepend(...lis); // a client waiting on you comes first, above everything else
    old.forEach((li) => li.remove());
  };
  // an answer: the notification is read, and stays (a record of what was asked)
  const sync = () => {
    const read = readSet();
    asks().forEach((c) => { const a = items.get(c.id); if (a && (c.state !== 'pending' || read.has(c.id))) a.classList.remove('is-unread'); });
    recount();
  };

  // ---- the company page: the request's row, and the Consents card's count -----------------------
  const css = document.createElement('style');
  css.textContent = `.co-row.is-asked { animation: cn-arrive 2.6s var(--ease-brand, ease); border-radius: 0.625rem; }
@keyframes cn-arrive { 0%, 60% { background: var(--color-light-beige); box-shadow: 0 0 0 0.5rem var(--color-light-beige); } 100% { background: transparent; box-shadow: 0 0 0 0.5rem transparent; } }
.cd-ask { display: inline-flex; align-items: center; gap: 0.25rem; margin-left: 0.5rem; padding: 0.0625rem 0.5rem; border-radius: 9999px; font-size: 0.6875rem; font-weight: 600; line-height: 1.5; vertical-align: 0.0625rem; white-space: nowrap; background: var(--color-informative-subtle); color: var(--color-informative); }
.cdd-ask { border: 1px solid color-mix(in oklab, var(--color-informative) 35%, transparent); }
.cdd-ask .cdd-ask-t { margin: 0 0 0.25rem; font-size: 1rem; font-weight: 600; }
.cdd-ask .cdd-desc { margin-bottom: 0.875rem; }
.cdd-ask-acts { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.cdd-ask.is-done { border-color: var(--color-line); }
.cdd-ask.is-done .cdd-desc { margin-bottom: 0; }`;
  document.head.appendChild(css);
  const rowOf = (c) => [...document.querySelectorAll(`#filled :is(.persona-${persona}-only, [data-only="${persona}"]) > .co-row`)]
    .find((r) => { const n = r.querySelector('.co-row-n'); return n && n.firstChild.textContent.trim().replace(/‑/g, '-') === c.name; });
  const arrive = (id, scroll) => {
    const c = asks().find((x) => x.id === id), row = c && rowOf(c); if (!row) return;
    if (scroll) { const sec = row.closest('.co-last-sec') || row; scrollTo({ top: sec.getBoundingClientRect().top + scrollY - 80, behavior: 'smooth' }); }
    row.classList.remove('is-asked'); void row.offsetWidth; row.classList.add('is-asked');
    const yes = row.querySelector('[data-answer="Accepted"]');
    setTimeout(() => (yes || row).focus({ preventScroll: true }), scroll ? 500 : 120);
  };
  const card = () => {
    const k = document.querySelector('#filled #co-k-cons') || document.getElementById('co-k-cons'); if (!k) return;
    const all = P.load().consents, wait = all.filter((c) => c.state === 'pending');
    const n = k.querySelector('.co-k-n'); if (n) n.textContent = wait.length;
    const nl = k.querySelector('.co-k-nl'); if (nl) nl.textContent = wait.length ? 'waiting for your answer' : 'all answered';
    const d = k.querySelector('.co-k-d[data-only="miguel"]');
    if (d && persona === 'miguel') {
      const names = wait.map((c) => nb(c.name));
      d.textContent = !names.length ? 'You’ve answered every client who asked.' : `${names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1] : names[0]} asked to see your documents.`;
    }
    // only the ones accepted, and only while something still waits for you: all answered, no tag
    const ok = k.querySelector('#co-k-cons-ok b'); if (ok) { const a = all.filter((c) => c.state === 'accepted').length; ok.textContent = a; ok.parentElement.classList.toggle('is-zero', !a); }
    const chips = k.querySelector('.co-k-chips'); if (chips) chips.hidden = !wait.length;
  };

  // give or decline: the profile keeps it (the company page's row and My clients follow)
  const answer = (id, yes) => {
    const q = P.load(), c = q.consents.find((x) => x.id === id); if (!c) return null;
    c.state = yes ? 'accepted' : 'declined'; if (yes) c.when = P.today(); P.save(q);
    markRead(id); sync(); card();
    return c;
  };

  draw(); sync();
  if (document.getElementById('co-k-cons')) {
    card();
    // answered on the company page itself (js/co-profile.js keeps it): the bell and the card follow
    // (caught on the way down: the page swaps the buttons out as it answers)
    document.addEventListener('click', (e) => { const b = e.target.closest('#filled .co-req [data-answer]'); if (!b) return; const row = b.closest('.co-row'); setTimeout(() => { const c = asks().find((x) => rowOf(x) === row); if (c) markRead(c.id); sync(); card(); }, 0); }, true);
  }
  // arrived from a notification (or its link): it's read; on the company page, at its row
  const ask = new URLSearchParams(location.search).get('ask');
  if (ask && asks().some((c) => c.id === ask)) {
    markRead(ask); sync();
    if (document.getElementById('co-k-cons')) setTimeout(() => arrive(ask, false), 260); // the page's own #consents jump goes first
  }
  const all = document.getElementById('nt-readall');
  if (all) all.addEventListener('click', () => markRead(asks().map((c) => c.id)));
  return { pending, forDoc, answer, hrefOf, single, count, nb, markRead, asks };
})();
