/* Our date picker, for every date field in the app, in place of the browser's own calendar (its
   blue selection isn't ours). The fields stay <input type="date"> (their value, and every script
   reading it, unchanged); clicking one, or Alt+Down / Enter in it, opens this calendar instead: a
   panel as the filter menus' (a hairline, a close and a wide shadow), the days as the page numbers'
   buttons, the chosen day in graphite as our checkboxes, today outlined as the current page.
   Monday first, as in Portugal. Arrows move a day, Page Up / Down a month, Enter picks, Escape closes
   (and only the calendar: the drawer under it stays open). Picking a day sets the field, tells its
   listeners (input, change) and leaves it, so whatever commits on leaving (a new expiry date) does. */
(() => {
  if (window.CMDatePicker) return;
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const PREV = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z" clip-rule="evenodd"/></svg>';
  const NEXT = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z" clip-rule="evenodd"/></svg>';
  const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/></svg>';

  const css = document.createElement('style');
  css.textContent = `
/* the field: the browser's calendar button is replaced by ours, in the ink of the field's text */
input[type="date"]::-webkit-calendar-picker-indicator { display: none; }
input[type="date"] { position: relative; padding-right: 2.25rem !important; background-image: url("data:image/svg+xml,${encodeURIComponent(CAL.replace('currentColor', '#7b7a74').replace('aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"'))}") !important; background-repeat: no-repeat !important; background-position: right 0.625rem center !important; background-size: 1.125rem !important; cursor: pointer; }
input[type="date"]:disabled { cursor: not-allowed; }
html[data-theme="dark"] input[type="date"] { background-image: url("data:image/svg+xml,${encodeURIComponent(CAL.replace('currentColor', '#c2c1bb').replace('aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"'))}") !important; color-scheme: dark; }
.dtp { position: fixed; z-index: 1000; width: 18.5rem; padding: 0.75rem; border-radius: 0.75rem; background: var(--color-surface, #fff); color: var(--color-ink);
  box-shadow: 0 0 0 1px var(--color-line), 0 4px 8px rgba(52, 52, 52, .08), 0 24px 48px -12px rgba(52, 52, 52, .28); font-size: 0.875rem; }
.dtp[hidden] { display: none; }
.dtp-h { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.5rem; }
.dtp-t { padding: 0.25rem 0.5rem; margin-left: -0.5rem; border: 0; border-radius: 0.5rem; background: none; font: inherit; font-weight: 600; font-size: 0.9375rem; color: var(--color-ink); cursor: pointer; }
.dtp-t:hover { background: var(--color-mid-beige); }
.dtp-g.dtp-g3 { grid-template-columns: repeat(3, 1fr); gap: 0.25rem; }
.dtp-g3 .dtp-d { height: 2.75rem; }
.dtp-nav { display: flex; gap: 0.25rem; }
.dtp-nav button { display: grid; place-items: center; width: 2rem; height: 2rem; padding: 0; border: 1px solid transparent; border-radius: 0.5rem; background: none; color: var(--color-ink-subtle); cursor: pointer; }
.dtp-nav button:hover { background: var(--color-mid-beige); color: var(--color-ink); }
.dtp-nav svg { width: 1.125rem; height: 1.125rem; }
.dtp-g { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.125rem; }
.dtp-wd { padding: 0.25rem 0; text-align: center; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: var(--color-ink-subtle); }
.dtp-d { height: 2.25rem; padding: 0; border: 1px solid transparent; border-radius: 0.5rem; background: none; font: inherit; font-size: 0.875rem; font-weight: 500; color: var(--color-ink); cursor: pointer; }
.dtp-d:hover { background: var(--color-mid-beige); }
.dtp-d.is-out { color: var(--color-sand-400); }
.dtp-d.is-today { border-color: var(--color-line); background: var(--color-surface); font-weight: 700; box-shadow: 0 1px 2px rgba(52, 52, 52, .06); }
.dtp-d.is-on, .dtp-d.is-on:hover { border-color: var(--color-graphite); background: var(--color-graphite); color: var(--color-off-white); font-weight: 700; }
.dtp-d:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 1px; }
.dtp-f { display: flex; justify-content: space-between; margin-top: 0.625rem; padding-top: 0.625rem; border-top: 1px solid var(--color-mid-beige); }
.dtp-f button { border: 0; background: none; padding: 0; font: inherit; font-size: 0.875rem; color: var(--color-ink-subtle); cursor: pointer; text-decoration: underline; text-decoration-color: var(--color-line); text-underline-offset: 0.2em; }
.dtp-f button:hover { color: var(--color-ink); text-decoration-color: var(--color-activation, var(--color-coral)); }
@media (prefers-reduced-motion: no-preference) { .dtp:not([hidden]) { animation: dtp-in .16s var(--ease-brand, ease); } @keyframes dtp-in { from { opacity: 0; transform: translateY(-4px); } } }`;
  document.head.appendChild(css);

  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const parse = (v) => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; };
  const same = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const box = document.createElement('div');
  box.className = 'dtp'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Choose a date');
  // mode: the days of a month; or, from its title, the years (twelve at a time), then the months
  let inp = null, view = null, focus = null, mode = 'days';
  const mount = () => { if (!box.isConnected) document.body.appendChild(box); };

  const paint = () => {
    const sel = parse(inp.value), today = new Date(), y = view.getFullYear(), m = view.getMonth();
    if (mode !== 'days') {
      const y0 = y - (((y % 12) + 12) % 12), list = mode === 'years' ? Array.from({ length: 12 }, (_, k) => y0 + k) : MON.map((_, k) => k);
      const on = (v) => (mode === 'years' ? sel && sel.getFullYear() === v : sel && sel.getFullYear() === y && sel.getMonth() === v);
      const now = (v) => (mode === 'years' ? today.getFullYear() === v : today.getFullYear() === y && today.getMonth() === v);
      box.innerHTML = `<div class="dtp-h"><button type="button" class="dtp-t" data-dtp-up aria-live="polite">${mode === 'years' ? `${y0} to ${y0 + 11}` : y}</button><span class="dtp-nav"><button type="button" data-dtp-m="${mode === 'years' ? -144 : -12}" aria-label="${mode === 'years' ? 'Earlier years' : 'Previous year'}">${PREV}</button><button type="button" data-dtp-m="${mode === 'years' ? 144 : 12}" aria-label="${mode === 'years' ? 'Later years' : 'Next year'}">${NEXT}</button></span></div>
        <div class="dtp-g dtp-g3">${list.map((v) => `<button type="button" class="dtp-d${now(v) ? ' is-today' : ''}${on(v) ? ' is-on' : ''}" data-dtp-${mode === 'years' ? 'y' : 'mo'}="${v}">${mode === 'years' ? v : MON[v].slice(0, 3)}</button>`).join('')}</div>`;
      return;
    }
    const first = new Date(y, m, 1), lead = (first.getDay() + 6) % 7, start = new Date(y, m, 1 - lead);
    const cells = Array.from({ length: 42 }, (_, k) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + k));
    box.innerHTML = `<div class="dtp-h"><button type="button" class="dtp-t" data-dtp-up aria-live="polite" title="Choose the year and month">${MON[m]} ${y}</button><span class="dtp-nav"><button type="button" data-dtp-m="-1" aria-label="Previous month">${PREV}</button><button type="button" data-dtp-m="1" aria-label="Next month">${NEXT}</button></span></div>
      <div class="dtp-g" role="grid">${DAYS.map((d) => `<span class="dtp-wd" aria-hidden="true">${d.slice(0, 2)}</span>`).join('')}${cells.map((d) => `<button type="button" class="dtp-d${d.getMonth() !== m ? ' is-out' : ''}${same(d, today) ? ' is-today' : ''}${same(d, sel) ? ' is-on' : ''}" data-dtp-d="${iso(d)}" tabindex="${same(d, focus) ? 0 : -1}" aria-label="${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}"${same(d, sel) ? ' aria-pressed="true"' : ''}>${d.getDate()}</button>`).join('')}</div>
      <div class="dtp-f"><button type="button" data-dtp-clear>Clear</button><button type="button" data-dtp-today>Today</button></div>`;
  };
  const place = () => {
    const r = inp.getBoundingClientRect(), h = box.offsetHeight || 340, w = box.offsetWidth || 296;
    const below = r.bottom + 6 + h <= innerHeight || r.top - 6 - h < 0;
    box.style.top = `${Math.round(below ? r.bottom + 6 : r.top - 6 - h)}px`;
    box.style.left = `${Math.round(Math.min(Math.max(8, r.left), innerWidth - w - 8))}px`;
  };
  const focusDay = () => { const b = box.querySelector(`[data-dtp-d="${iso(focus)}"]`); if (b) b.focus({ preventScroll: true }); };
  const open = (i) => {
    if (i.disabled || i.readOnly) return;
    mount(); inp = i; mode = 'days'; const sel = parse(i.value); focus = sel || new Date(); view = new Date(focus.getFullYear(), focus.getMonth(), 1);
    box.hidden = false; paint(); place();
  };
  const close = (back) => { if (box.hidden) return; box.hidden = true; const i = inp; inp = null; if (back && i) i.focus({ preventScroll: true }); };
  // the day chosen: the field takes it, says so, and is left (what commits on leaving does)
  const set = (v) => {
    const i = inp; if (!i) return;
    i.value = v; close(false);
    i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
    i.focus({ preventScroll: true }); i.blur();
  };
  const moveTo = (d) => { focus = d; if (d.getMonth() !== view.getMonth() || d.getFullYear() !== view.getFullYear()) view = new Date(d.getFullYear(), d.getMonth(), 1); paint(); focusDay(); };

  // opening: a click on the field (not the browser's calendar), or Alt+Down / Enter in it
  addEventListener('click', (e) => {
    const i = e.target.closest && e.target.closest('input[type="date"]');
    if (i) { e.preventDefault(); if (inp === i && !box.hidden) close(false); else open(i); return; }
    if (!box.hidden && !box.contains(e.target)) close(false);
  }, true);
  addEventListener('keydown', (e) => {
    const i = e.target.closest && e.target.closest('input[type="date"]');
    if (i && ((e.altKey && e.key === 'ArrowDown') || e.key === 'Enter' && box.hidden) && !i.disabled) { if (e.key === 'Enter' && i.dataset.newexp != null) return; e.preventDefault(); e.stopPropagation(); open(i); focusDay(); return; }
    if (i && e.key === ' ') { e.preventDefault(); open(i); focusDay(); return; } // the browser's own calendar opens on Space
    if (box.hidden || !box.contains(e.target)) { if (!box.hidden && e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); } return; }
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
    if (step && e.target.matches('[data-dtp-d]')) { e.preventDefault(); moveTo(new Date(focus.getFullYear(), focus.getMonth(), focus.getDate() + step)); return; }
    if (e.key === 'PageUp' || e.key === 'PageDown') { e.preventDefault(); moveTo(new Date(focus.getFullYear(), focus.getMonth() + (e.key === 'PageDown' ? 1 : -1), Math.min(focus.getDate(), 28))); return; }
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
  }, true);
  box.addEventListener('mousedown', (e) => e.preventDefault()); // the field keeps its focus till a day is picked
  box.addEventListener('click', (e) => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.dtpM) { view = new Date(view.getFullYear(), view.getMonth() + +t.dataset.dtpM, 1); focus = new Date(view); paint(); return; }
    if (t.hasAttribute('data-dtp-up')) { mode = mode === 'days' ? 'years' : mode === 'months' ? 'years' : 'days'; paint(); return; }
    if (t.dataset.dtpY) { view = new Date(+t.dataset.dtpY, view.getMonth(), 1); mode = 'months'; paint(); return; }
    if (t.dataset.dtpMo) { view = new Date(view.getFullYear(), +t.dataset.dtpMo, 1); focus = new Date(view.getFullYear(), view.getMonth(), Math.min(focus ? focus.getDate() : 1, 28)); mode = 'days'; paint(); return; }
    if (t.dataset.dtpD) { set(t.dataset.dtpD); return; }
    if (t.hasAttribute('data-dtp-today')) { set(iso(new Date())); return; }
    if (t.hasAttribute('data-dtp-clear')) set('');
  });
  // the field moved (a scroll, a resize): the calendar goes with it; gone (a redraw): it closes
  addEventListener('scroll', () => { if (!box.hidden) { if (inp && inp.isConnected) place(); else close(false); } }, true);
  addEventListener('resize', () => { if (!box.hidden) close(false); });
  window.CMDatePicker = { open, close };
})();
