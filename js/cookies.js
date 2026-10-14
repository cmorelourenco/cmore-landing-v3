/* Terms and cookies on the landing page. On a first visit a small card says that using C-MORE
   means agreeing to the Terms & Conditions, and asks about cookies: Accept all, or No cookies.
   "Read the Terms & Conditions and Cookie Policy" opens one long text, the Terms (js/terms.js) as
   Part 1 and the Cookie Policy (js/cookie-policy.js) as Part 2, with the same two choices at the
   end. The footer's "Terms & conditions" and "Cookies" links open it at the matching part.
   Accept all is kept for 12 months; No cookies cannot be stored without a cookie, so it holds only
   for this visit and the question comes back next time. Prototype: no cookie is set; the choice
   lives in localStorage (sessionStorage for No cookies). */
(() => {
  const KEY = 'cm-cookies';
  const CHOICES = [['all', 'Accept all', 'is-primary'], ['none', 'No cookies', '']];
  const read = () => { let v = null; try { v = localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch (e) {} return v === 'all' || v === 'none' ? v : null; }; // anything older asks again
  const save = (v) => {
    try {
      localStorage.removeItem(KEY); sessionStorage.removeItem(KEY);
      (v === 'none' ? sessionStorage : localStorage).setItem(KEY, v);
    } catch (e) {}
  };

  const css = `
  .ck, .ck-dlg { --ck-ink: var(--color-ink, #343434); --ck-sub: var(--color-ink-subtle, #6e6c66); --ck-line: var(--color-line, #e0ded7);
    --ck-surface: var(--color-surface, #fff); --ck-ground: var(--color-light-beige, #f2f1ed); --ck-dark: var(--color-graphite, #343434);
    --ck-ease: var(--ease-brand, cubic-bezier(.2,.7,.2,1)); font-family: inherit; color: var(--ck-ink); }
  .ck { position: fixed; z-index: 90; right: 1.25rem; bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px)); width: min(27rem, calc(100% - 2.5rem));
    background: var(--ck-surface); border: 1px solid var(--ck-line); border-radius: 1.25rem; padding: 1.375rem 1.375rem 1.25rem;
    box-shadow: 0 2px 4px rgba(52,52,52,.04), 0 24px 48px -20px rgba(52,52,52,.28); display: grid; gap: 0.875rem;
    opacity: 0; transform: translateY(12px); transition: opacity .45s var(--ck-ease), transform .45s var(--ck-ease); }
  .ck.is-in { opacity: 1; transform: none; }
  .ck h2 { margin: 0; font-size: 1.0625rem; font-weight: 600; letter-spacing: -0.01em; }
  .ck p { margin: 0; font-size: 0.875rem; line-height: 1.55; color: var(--ck-sub); }
  .ck-more { justify-self: start; padding: 0; border: 0; background: none; font: inherit; font-size: 0.875rem; font-weight: 500; color: var(--ck-ink);
    text-decoration: underline; text-underline-offset: 0.2em; cursor: pointer; }
  .ck-more:hover { text-decoration-thickness: 2px; }
  .ck-acts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
  .ck-btn { min-height: 2.75rem; padding: 0.5rem 0.75rem; border-radius: 9999px; border: 1px solid var(--ck-line); background: var(--ck-surface);
    font: inherit; font-size: 0.875rem; font-weight: 500; color: var(--ck-ink); cursor: pointer; line-height: 1.2;
    transition: border-color .14s var(--ck-ease), background-color .14s var(--ck-ease), color .14s var(--ck-ease); }
  .ck-btn:hover { border-color: var(--ck-dark); }
  .ck-btn.is-primary { background: var(--ck-dark); border-color: var(--ck-dark); color: var(--color-off-white, #fafafa); }
  .ck-btn.is-primary:hover { background: #1f1f1f; }
  .ck-btn:focus-visible, .ck-more:focus-visible, .ck-x:focus-visible { outline: 2px solid var(--ck-dark); outline-offset: 2px; }
  .ck-scrim { position: fixed; inset: 0; z-index: 95; background: rgba(52,52,52,.36); opacity: 0; transition: opacity .3s var(--ck-ease); }
  .ck-scrim.is-in { opacity: 1; }
  .ck-dlg { position: fixed; z-index: 96; left: 50%; top: 50%; width: min(40rem, calc(100% - 2rem)); max-height: min(44rem, calc(100% - 2rem));
    transform: translate(-50%, calc(-50% + 12px)); opacity: 0; transition: opacity .3s var(--ck-ease), transform .3s var(--ck-ease);
    display: grid; grid-template-rows: auto minmax(0, 1fr) auto; background: var(--ck-surface); border-radius: 1.25rem;
    box-shadow: 0 32px 64px -24px rgba(52,52,52,.4); overflow: hidden; }
  .ck-dlg.is-in { opacity: 1; transform: translate(-50%, -50%); }
  .ck-dlg-h { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 1.5rem 1.5rem 1rem; border-bottom: 1px solid var(--ck-line); }
  .ck-dlg-h h2 { margin: 0; font-size: 1.375rem; font-weight: 600; letter-spacing: -0.015em; }
  .ck-dlg-h p { margin: 0.375rem 0 0; font-size: 0.875rem; line-height: 1.55; color: var(--ck-sub); max-width: 34rem; }
  .ck-x { flex: none; display: grid; place-items: center; width: 2.25rem; height: 2.25rem; border: 0; border-radius: 50%; background: none; color: var(--ck-sub); cursor: pointer; }
  .ck-x:hover { background: var(--ck-ground); color: var(--ck-ink); }
  .ck-x svg { width: 1.25rem; height: 1.25rem; }
  .ck-body { overflow-y: auto; padding: 1.25rem 1.5rem 1.5rem; overscroll-behavior: contain; }
  .ck-doc { display: grid; gap: 0.75rem; font-size: 0.875rem; line-height: 1.65; color: var(--ck-ink); max-width: 36rem; }
  .ck-doc p { margin: 0; }
  .ck-doc .ck-upd { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: var(--ck-sub); }
  .ck-part { display: grid; gap: 0.25rem; padding-top: 0.25rem; }
  .ck-part + p { margin-top: 0.25rem; }
  .ck-doc > .ck-part:not(:first-child) { margin-top: 1.75rem; padding-top: 1.5rem; border-top: 1px solid var(--ck-line); }
  .ck-part span { font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-coral, #f46d4f); }
  .ck-part h3 { margin: 0; font-size: 1.125rem; font-weight: 600; letter-spacing: -0.01em; }
  .ck-doc h4 { margin: 1rem 0 0; font-size: 0.9375rem; font-weight: 600; }
  .ck-doc ul { margin: 0; padding-left: 1.125rem; display: grid; gap: 0.375rem; }
  .ck-doc li::marker { color: var(--ck-sub); }
  .ck-end { margin: 0.75rem 0 0; padding-top: 1rem; border-top: 1px solid var(--ck-line); font-size: 0.8125rem; color: var(--ck-sub); }
  .ck-dlg-f { padding: 1rem 1.5rem 1.25rem; border-top: 1px solid var(--ck-line); display: grid; gap: 0.625rem; }
  .ck-now { margin: 0; font-size: 0.8125rem; color: var(--ck-sub); }
  .ck-now b { color: var(--ck-ink); font-weight: 600; }
  @media (max-width: 34rem) {
    .ck { left: 0.75rem; right: 0.75rem; width: auto; bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px)); }
    .ck-dlg-h, .ck-body, .ck-dlg-f { padding-inline: 1.125rem; }
  }
  @media (prefers-reduced-motion: reduce) { .ck, .ck-dlg, .ck-scrim { transition: none; } }`;
  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: css }));

  const acts = () => `<div class="ck-acts">${CHOICES.map(([v, l, c]) => `<button type="button" class="ck-btn ${c}" data-ck="${v}">${l}</button>`).join('')}</div>`;
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  const LABEL = { all: 'Accept all', none: 'No cookies' };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  let card = null, dlg = null, scrim = null, back = null;
  const close = (el) => { if (!el) return; el.classList.remove('is-in'); setTimeout(() => el.remove(), 320); };
  const choose = (v) => {
    save(v);
    closeDetails();
    if (card) { const c = card; card = null; close(c); }
  };

  const showCard = () => {
    if (card) return;
    card = document.createElement('section');
    card.className = 'ck'; card.setAttribute('aria-label', 'Terms and cookie choices');
    card.innerHTML = `<h2>Terms and cookies</h2>
      <p>Using C&#8209;MORE means agreeing to our Terms &amp; Conditions. Cookies are your choice: we use them to keep you signed in, remember your choices and see which pages help. Accept all, or choose none.</p>
      <button type="button" class="ck-more">Read the Terms &amp; Conditions and Cookie Policy</button>${acts()}`;
    card.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ck]'); if (b) return choose(b.dataset.ck);
      if (e.target.closest('.ck-more')) openDetails();
    });
    document.body.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => card && card.classList.add('is-in')));
  };

  const keys = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); closeDetails(); return; }
    if (e.key !== 'Tab' || !dlg) return; // keep the focus inside the list while it is open
    const f = [...dlg.querySelectorAll('button')], first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const openDetails = (part) => {
    if (dlg) { if (part) jump(part); return; }
    back = document.activeElement;
    const now = read();
    scrim = Object.assign(document.createElement('div'), { className: 'ck-scrim' });
    dlg = document.createElement('div');
    dlg.className = 'ck-dlg'; dlg.setAttribute('role', 'dialog'); dlg.setAttribute('aria-modal', 'true'); dlg.setAttribute('aria-labelledby', 'ck-t');
    const PARTS = [['terms', window.CM_TERMS], ['cookies', window.CM_COOKIE_POLICY]].filter(([, p]) => p);
    const paras = (list) => list.reduce((out, s) => {
      if (s.startsWith('• ')) { if (!out.endsWith('</ul>')) out += '<ul></ul>'; return out.slice(0, -5) + `<li>${esc(s.slice(2))}</li></ul>`; }
      return out + `<p>${esc(s)}</p>`;
    }, '');
    const TITLE = 'Terms & Conditions and Cookie Policy';
    dlg.innerHTML = `<div class="ck-dlg-h"><div><h2 id="ck-t">${esc(TITLE)}</h2><p>The terms for using C&#8209;MORE, and how we use cookies. Please read them in full.</p></div>
        <button type="button" class="ck-x" aria-label="Close">${X}</button></div>
      <div class="ck-body" tabindex="0" aria-label="${esc(TITLE)}"><article class="ck-doc">
        ${PARTS.map(([id, P], n) => `<header class="ck-part" id="ck-${id}"><span>Part ${n + 1}</span><h3>${esc(P.title)}</h3>${P.updated ? `<p class="ck-upd">Last updated ${esc(P.updated)}</p>` : ''}</header>
          ${paras(P.intro)}${P.sections.map(([h, list], i) => `<h4>${i + 1}. ${esc(h)}</h4>${paras(list)}`).join('')}`).join('')}
        <p class="ck-end">End of the ${esc(TITLE)}.</p></article></div>
      <div class="ck-dlg-f">${now ? `<p class="ck-now">Your current cookie choice: <b>${LABEL[now]}</b></p>` : ''}${acts()}</div>`;
    dlg.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ck]'); if (b) return choose(b.dataset.ck);
      if (e.target.closest('.ck-x')) closeDetails();
    });
    scrim.addEventListener('click', closeDetails);
    document.body.append(scrim, dlg);
    document.addEventListener('keydown', keys);
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('is-in'); dlg.classList.add('is-in'); dlg.querySelector('.ck-x').focus(); }));
    if (part) jump(part);
  };
  // open at a part: the Terms from the top, the Cookie Policy where it starts
  function jump(part) {
    const body = dlg && dlg.querySelector('.ck-body'), h = dlg && dlg.querySelector('#ck-' + part);
    if (body && h) body.scrollTop = part === 'terms' ? 0 : h.offsetTop - body.offsetTop - 8;
  }
  function closeDetails() {
    if (!dlg) return;
    document.removeEventListener('keydown', keys);
    close(dlg); close(scrim); dlg = scrim = null;
    if (back && document.contains(back)) back.focus();
  }

  // the footer's "Terms & conditions" and "Cookies" links, and #terms or #cookies in the address
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href="#cookies"], a[href="#terms"]'); if (!a) return;
    e.preventDefault(); openDetails(a.getAttribute('href').slice(1));
  });
  if (location.hash === '#cookies' || location.hash === '#terms') openDetails(location.hash.slice(1));
  if (!read()) setTimeout(showCard, 900); // after the hero has settled
})();
