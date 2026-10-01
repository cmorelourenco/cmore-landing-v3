/* Language picker, shared by every page.
   Any element with [data-lang-switch] becomes the control: a quiet header button
   (globe, code, chevron) that opens a list of the six languages in their own names.
   The choice is remembered for this browser and set as the page's lang attribute.
   Prototype: the copy itself is English only; choosing a language changes the control
   and the lang attribute, not the text. */
(() => {
  const LANGS = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' },
    { code: 'it', label: 'Italiano' },
  ];
  const KEY = 'cm-lang';
  const read = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const write = (v) => { try { localStorage.setItem(KEY, v); } catch (e) {} };
  let current = LANGS.some((l) => l.code === read()) ? read() : 'en';
  document.documentElement.lang = current;

  const css = `
.lang { position: relative; flex: none; font-family: inherit; }
.lang-btn { display: inline-flex; align-items: center; gap: 0.375rem; height: 2.25rem; padding: 0 0.625rem; border: 0; border-radius: 9999px;
  background: transparent; color: #343434; font: inherit; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.02em; cursor: pointer;
  transition: background-color .14s cubic-bezier(0.22, 1, 0.36, 1); }
.lang-btn:hover, .lang.is-open .lang-btn { background: #e9e7e2; }
.lang-btn:focus-visible { outline: 2px solid #343434; outline-offset: 2px; }
.lang-btn svg { flex: none; }
.lang-btn .chev { transition: transform .2s cubic-bezier(0.22, 1, 0.36, 1); }
.lang.is-open .lang-btn .chev { transform: rotate(180deg); }
.lang-menu { position: absolute; right: 0; top: calc(100% + 0.375rem); z-index: 80; min-width: 12rem; margin: 0; padding: 0.375rem; list-style: none;
  background: #ffffff; border: 1px solid #e0ded7; border-radius: 0.75rem;
  box-shadow: 0 12px 32px rgba(52, 52, 52, 0.12), 0 2px 6px rgba(52, 52, 52, 0.06);
  opacity: 0; transform: translateY(-4px); pointer-events: none; visibility: hidden;
  transition: opacity .16s ease, transform .2s cubic-bezier(0.22, 1, 0.36, 1), visibility .2s; }
.lang.is-open .lang-menu { opacity: 1; transform: none; pointer-events: auto; visibility: visible; }
.lang-menu li { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 0.5rem 0.625rem; border-radius: 0.5rem;
  font-size: 0.9375rem; line-height: 1.3; color: #343434; cursor: pointer; outline: none; }
.lang-menu li .c { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.08em; color: #6e6e6a; }
.lang-menu li:hover, .lang-menu li:focus-visible, .lang-menu li.is-active { background: #f2f1ed; }
.lang-menu li[aria-selected="true"] { font-weight: 600; }
.lang-menu li[aria-selected="true"] .c { color: #f44e29; }
@media (prefers-reduced-motion: reduce) { .lang-btn .chev, .lang-menu { transition: none; } }
@media (max-width: 30rem) { .lang-btn .glb { display: none; } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const GLOBE = '<svg class="glb" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.75 5.6 3.75 9S14.5 18.4 12 21c-2.5-2.6-3.75-5.6-3.75-9S9.5 5.6 12 3Z"/></svg>';
  const CHEV = '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const all = new Set();

  const mount = (host) => {
    if (host.dataset.langReady) return;
    host.dataset.langReady = '1';
    const id = 'lang-' + Math.random().toString(36).slice(2, 8);
    const wrap = document.createElement('div');
    wrap.className = 'lang';
    wrap.innerHTML =
      `<button type="button" class="lang-btn" aria-haspopup="listbox" aria-expanded="false" aria-controls="${id}">${GLOBE}<span class="cur"></span>${CHEV}</button>` +
      `<ul class="lang-menu" id="${id}" role="listbox" tabindex="-1" aria-label="Language">` +
      LANGS.map((l) => `<li role="option" data-code="${l.code}" tabindex="-1" lang="${l.code}"><span>${l.label}</span><span class="c">${l.code.toUpperCase()}</span></li>`).join('') +
      `</ul>`;
    host.replaceChildren(wrap);
    const btn = wrap.querySelector('.lang-btn'), menu = wrap.querySelector('.lang-menu'), items = [...menu.children];
    const paint = () => {
      wrap.querySelector('.cur').textContent = current.toUpperCase();
      btn.setAttribute('aria-label', 'Language: ' + LANGS.find((l) => l.code === current).label);
      items.forEach((li) => li.setAttribute('aria-selected', String(li.dataset.code === current)));
    };
    const open = (focusSel = true) => {
      all.forEach((w) => w !== api && w.close());
      wrap.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      if (focusSel) (items.find((li) => li.dataset.code === current) || items[0]).focus();
    };
    const close = (back) => { wrap.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); if (back) btn.focus(); };
    const choose = (code) => {
      current = code; write(code); document.documentElement.lang = code;
      all.forEach((w) => w.paint());
      close(true);
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); wrap.classList.contains('is-open') ? close() : open(e.detail === 0); });
    btn.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); } });
    items.forEach((li, i) => {
      li.addEventListener('click', (e) => { e.stopPropagation(); choose(li.dataset.code); });
      li.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
        else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(li.dataset.code); }
        else if (e.key === 'Escape' || e.key === 'Tab') { close(e.key === 'Escape'); }
      });
    });
    const api = { close: () => close(), paint, el: wrap };
    all.add(api);
    paint();
  };

  document.addEventListener('click', (e) => { all.forEach((w) => { if (!w.el.contains(e.target)) w.close(); }); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') all.forEach((w) => w.close()); });

  const scan = () => document.querySelectorAll('[data-lang-switch]').forEach(mount);
  scan();
  // The landing's header is drawn by the design system after load, so keep watching for it.
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
