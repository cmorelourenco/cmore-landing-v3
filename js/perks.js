/* The founding-member perks deck on the landing (the old early access page, now in the
   dark band). One panel open at a time, rotating on its own on wide screens; cards open
   on a click, a tap, the arrows, the dots or the timer, never on hover. The timer holds
   while the pointer is on the open card. The landing is drawn after load, so this waits
   for the deck to exist. */
(() => {
  const SECONDS = 9;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Tracked by element, not by a data attribute: the landing's runtime can redraw the
  // band by cloning it, and a copied attribute would mark a deck with no handlers as done.
  const done = new WeakSet();
  const init = (deck) => {
    if (done.has(deck)) return;
    done.add(deck);
    const panels = [...deck.querySelectorAll('.panel')];
    const bullets = [...deck.querySelectorAll('.bullet')];
    // rotation is for the wide layouts; on a phone the accordion waits for a tap
    const auto = () => !reduced && matchMedia('(min-width: 761px)').matches;
    let active = 0, progress = 0, paused = false, seen = false;
    const render = () => {
      panels.forEach((p, i) => { p.classList.toggle('on', i === active); p.setAttribute('aria-pressed', i === active ? 'true' : 'false'); });
      bullets.forEach((b, i) => {
        b.classList.toggle('on', i === active); b.classList.toggle('done', i < active);
        b.setAttribute('aria-pressed', i === active ? 'true' : 'false');
        b.querySelector('b').style.width = i === active ? Math.round(progress * 100) + '%' : '0%';
      });
    };
    const go = (i) => { active = (i + panels.length) % panels.length; progress = 0; paused = false; render(); };
    panels.forEach((p, i) => {
      const pick = () => { if (active !== i) go(i); };
      p.addEventListener('focus', pick);
      p.addEventListener('click', (e) => { pick(); if (e.detail) paused = true; }); // a mouse click leaves the pointer on the card just opened
      p.addEventListener('mouseenter', () => { if (p.classList.contains('on')) paused = true; });
      p.addEventListener('mouseleave', () => { paused = false; });
    });
    bullets.forEach((b, i) => b.addEventListener('click', () => go(i)));
    const prev = deck.querySelector('#prev'), next = deck.querySelector('#next');
    if (prev) prev.addEventListener('click', () => go(active - 1));
    if (next) next.addEventListener('click', () => go(active + 1));
    // The rotation and the heading's highlight start when the band is on screen. Checked
    // on the timer's tick rather than with an observer: the band is pinned and clipped,
    // which observers report unreliably.
    const wrap = deck.closest('.perks') || deck;
    const onScreen = () => { const r = deck.getBoundingClientRect(); return r.bottom > innerHeight * 0.2 && r.top < innerHeight * 0.8; };
    setInterval(() => {
      const vis = onScreen();
      if (vis && !seen) { seen = true; wrap.classList.add('is-in'); }
      if (!vis) { if (progress) { progress = 0; render(); } return; }
      if (!auto() || paused || document.hidden) return;
      progress += 0.1 / SECONDS;
      if (progress >= 1) go(active + 1); else render();
    }, 100);
    render();
  };
  const scan = () => document.querySelectorAll('.deck').forEach(init);
  scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
