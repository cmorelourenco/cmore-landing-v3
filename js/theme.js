/* Dark mode. Loaded in each page's head, so the theme is set before anything is drawn (no flash
   of the light page). Light by default: the choice is kept for this visit only (sessionStorage
   'cm-theme': 'dark' or 'light'), so every new visit starts light. The side menu gets a Dark mode switch, just above
   Log out; in the rail it's the icon alone. The colours are in css/dark.css.
   window.CMTheme: { dark(), set(on) } */
window.CMTheme = (() => {
  const KEY = 'cm-theme';
  // (an older choice kept for good in this browser is dropped: light is the default)
  try { localStorage.removeItem(KEY); } catch (e) {}
  const read = () => { try { return sessionStorage.getItem(KEY) === 'dark'; } catch (e) { return false; } };
  const apply = (on) => { if (on) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme; };
  apply(read());

  const SUN = '<svg class="sn-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>';
  const MOON = '<svg class="sn-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>';
  const set = (on) => {
    try { sessionStorage.setItem(KEY, on ? 'dark' : 'light'); } catch (e) {}
    const h = document.documentElement; h.classList.add('cm-theme-now');
    apply(on); void h.offsetWidth;
    setTimeout(() => h.classList.remove('cm-theme-now'), 60);
    document.querySelectorAll('.sn-theme').forEach((b) => b.setAttribute('aria-checked', String(on)));
  };
  const add = () => {
    const foot = document.querySelector('.sn .sn-foot'); if (!foot || foot.querySelector('.sn-theme')) return;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'sn-item sn-theme'; b.setAttribute('role', 'switch'); b.setAttribute('aria-checked', String(read())); b.title = 'Dark mode';
    b.innerHTML = `${SUN}${MOON}<span class="sn-l">Dark mode</span><span class="sn-tsw" aria-hidden="true"><i></i></span>`;
    b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); set(b.getAttribute('aria-checked') !== 'true'); });
    const out = foot.querySelector('[data-sn="logout"]');
    if (out) out.before(b); else foot.appendChild(b);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
  return { dark: read, set };
})();
