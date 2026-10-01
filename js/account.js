/* The landing header's account menu.
   [data-account-menu] becomes the person icon; pressing it opens a small menu with the
   two ways in: Log in, or Get early access. Same look and keyboard behaviour as the
   language picker, so the header has one kind of dropdown. */
(() => {
  const css = `
.acct { position: relative; display: inline-flex; }
.acct-btn { cursor: pointer; border: 0; }
.acct.is-open .acct-btn { background-color: #e9e7e2; }
.acct-menu { position: absolute; right: 0; top: calc(100% + 0.375rem); z-index: 80; min-width: 15rem; margin: 0; padding: 0.375rem; list-style: none;
  background: #ffffff; border: 1px solid #e0ded7; border-radius: 0.75rem;
  box-shadow: 0 12px 32px rgba(52, 52, 52, 0.12), 0 2px 6px rgba(52, 52, 52, 0.06);
  opacity: 0; transform: translateY(-4px); pointer-events: none; visibility: hidden;
  transition: opacity .16s ease, transform .2s cubic-bezier(0.22, 1, 0.36, 1), visibility .2s; }
.acct.is-open .acct-menu { opacity: 1; transform: none; pointer-events: auto; visibility: visible; }
.acct-menu a { display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.75rem; border-radius: 0.5rem; text-decoration: none;
  font-size: 0.9375rem; font-weight: 500; line-height: 1.3; color: #343434; outline: none; }
.acct-menu a:hover, .acct-menu a:focus-visible { background: #f2f1ed; color: #343434; }
.acct-menu a svg { flex: none; width: 1.125rem; height: 1.125rem; color: #6e6e6a; }
.acct-menu a small { display: block; margin-top: 0.125rem; font-size: 0.8125rem; font-weight: 400; color: #6e6e6a; }
.acct-menu .sep { height: 1px; margin: 0.375rem 0.25rem; background: #e9e7e2; }
@media (prefers-reduced-motion: reduce) { .acct-menu { transition: none; } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const PERSON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/></svg>';
  const LOGIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/></svg>';
  const JOIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/><path d="M19 8v6M22 11h-6"/></svg>';

  const mount = (host) => {
    if (host.dataset.acctReady) return;
    host.dataset.acctReady = '1';
    const wrap = document.createElement('div');
    wrap.className = 'acct';
    wrap.innerHTML =
      `<button type="button" class="cm-btn cm-btn-ghost cm-btn-sm acct-btn" aria-label="Account" title="Account" aria-haspopup="menu" aria-expanded="false" aria-controls="acct-menu">${PERSON}</button>` +
      `<div class="acct-menu" id="acct-menu" role="menu" aria-label="Account">` +
      `<a role="menuitem" tabindex="-1" href="register.html?login">${LOGIN}<span>Log in<small>Already on C&#8209;MORE</small></span></a>` +
      `<div class="sep" role="separator"></div>` +
      `<a role="menuitem" tabindex="-1" href="early-access.html">${JOIN}<span>Get early access<small>Create your account</small></span></a>` +
      `</div>`;
    host.replaceChildren(wrap);
    const btn = wrap.querySelector('.acct-btn'), items = [...wrap.querySelectorAll('[role="menuitem"]')];
    const open = (focusFirst) => { wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); if (focusFirst) items[0].focus(); };
    const close = (back) => { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); if (back) btn.focus(); };
    btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); wrap.classList.contains('is-open') ? close() : open(e.detail === 0); });
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); open(true); } });
    items.forEach((a, i) => a.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      else if (e.key === 'Escape') { close(true); }
      else if (e.key === 'Tab') { close(); }
    }));
    items.forEach((a) => a.addEventListener('click', () => close()));
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && wrap.classList.contains('is-open')) close(true); });
  };
  const scan = () => document.querySelectorAll('[data-account-menu]').forEach(mount);
  scan();
  // The landing's header is drawn by the design system after load, so keep watching for it.
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
