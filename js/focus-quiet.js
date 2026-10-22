/* Focus rings only for people using the keyboard. Many screens move focus to their main button
   or field as they open, so keyboard users start in the right place — but the browser then draws
   its focus ring on that button, which reads as if it had been selected. Here the ring on buttons,
   links and other controls shows only once the keyboard is in use (Tab, arrows, Enter, Space), and
   goes again at the next click or tap. Text fields keep theirs: it shows where you are typing. */
(() => {
  const root = document.documentElement;
  const style = document.createElement('style');
  style.textContent = `html:not(.kbd) :is(a, button, summary, [role="button"], [role="link"], [role="radio"], [role="tab"], [role="menuitem"], [role="menuitemradio"],
  [role="menuitemcheckbox"], [role="switch"], [tabindex], .btn, .wallet, label, input[type="radio"], input[type="checkbox"]):focus-visible,
html:not(.kbd) [tabindex="-1"]:focus { outline: none !important; }
/* option cards that outline themselves when the radio inside them has focus */
html:not(.kbd) :is(.opt, .tm-roles label, .crd .dot) { outline: none !important; }
html:not(.kbd) .btn:focus-visible, html:not(.kbd) button:focus-visible { box-shadow: none; }`;
  (document.head || root).appendChild(style);
  const KEYS = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' ', 'Home', 'End'];
  // typing in a field (a space, an arrow, Enter) isn't navigating: only Tab counts there
  const typing = (el) => el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !/^(radio|checkbox|button|submit)$/.test(el.type));
  addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || !KEYS.includes(e.key)) return;
    if (e.key === 'Tab' || !typing(e.target)) root.classList.add('kbd');
  }, true);
  addEventListener('pointerdown', () => root.classList.remove('kbd'), true);
})();
