/* "See the demo": any [data-demo] button opens the product video in an overlay.
   Keeping it quick: nothing of the video loads with the page; hovering or focusing the
   button warms the first seconds, the poster shows at once, and the file is fast-start
   so it plays while it downloads. 720p (17 MB) by default; 1080p only on a big screen
   with a good connection. Esc, the close button or a click outside closes it. */
(() => {
  const SRC = { sd: 'video/c-more-demo-720.mp4', hd: 'video/c-more-demo-1080.mp4' };
  const POSTER = 'video/c-more-demo-poster.jpg';

  const css = `
.demo-ov { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: clamp(1rem, 4vw, 3rem);
  background: color-mix(in oklab, var(--color-graphite, #343434) 88%, transparent);
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
  opacity: 0; visibility: hidden; transition: opacity .25s ease, visibility .25s; }
.demo-ov.is-open { opacity: 1; visibility: visible; }
.demo-box { position: relative; width: min(100%, 72rem, calc((100vh - 7rem) * 16 / 9)); aspect-ratio: 16 / 9;
  border-radius: 4px; overflow: hidden; background: #f2f1ed; box-shadow: 0 24px 64px rgba(0,0,0,.35);
  transform: translateY(8px) scale(.98); transition: transform .3s cubic-bezier(0.22, 1, 0.36, 1); }
.demo-ov.is-open .demo-box { transform: none; }
.demo-box video { display: block; width: 100%; height: 100%; object-fit: contain; background: transparent; }
.demo-x { position: absolute; top: clamp(.75rem, 2vw, 1.5rem); right: clamp(.75rem, 2vw, 1.5rem); width: 2.75rem; height: 2.75rem;
  display: grid; place-items: center; border: 0; border-radius: 9999px; cursor: pointer;
  background: color-mix(in oklab, var(--color-off-white, #f7f6f3) 14%, transparent); color: var(--color-off-white, #f7f6f3);
  transition: background-color .15s ease; }
.demo-x:hover { background: color-mix(in oklab, var(--color-off-white, #f7f6f3) 26%, transparent); }
.demo-x:focus-visible { outline: 2px solid var(--color-coral, #f44e29); outline-offset: 2px; }
.demo-spin { position: absolute; inset: 0; margin: auto; width: 2.5rem; height: 2.5rem; border-radius: 50%;
  border: 3px solid color-mix(in oklab, var(--color-graphite, #343434) 15%, transparent); border-top-color: var(--color-coral, #f44e29);
  animation: demo-spin .8s linear infinite; pointer-events: none; opacity: 0; transition: opacity .2s; }
.demo-box.is-waiting .demo-spin { opacity: 1; }
@keyframes demo-spin { to { transform: rotate(360deg); } }
html.demo-lock, html.demo-lock body { overflow: hidden; }
@media (prefers-reduced-motion: reduce) { .demo-ov, .demo-box { transition: none; } }`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // the bigger file only when it will be seen big and the line can carry it
  const pick = () => {
    const c = navigator.connection || {};
    if (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || '')) return SRC.sd;
    const w = Math.min(innerWidth, 1152) * (devicePixelRatio || 1);
    return w >= 1600 ? SRC.hd : SRC.sd;
  };

  let ov, box, video, back = null, warmed = false;
  const build = () => {
    if (ov) return;
    ov = document.createElement('div');
    ov.className = 'demo-ov';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'C-MORE demo video');
    ov.innerHTML =
      '<button type="button" class="demo-x" aria-label="Close the video">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
      '<div class="demo-box"><video controls playsinline preload="none" poster="' + POSTER + '"></video><span class="demo-spin" aria-hidden="true"></span></div>';
    document.body.appendChild(ov);
    box = ov.querySelector('.demo-box');
    video = ov.querySelector('video');
    video.src = pick();
    const wait = (on) => () => box.classList.toggle('is-waiting', on);
    video.addEventListener('waiting', wait(true));
    video.addEventListener('playing', wait(false));
    video.addEventListener('canplay', wait(false));
    video.addEventListener('ended', close);
    ov.addEventListener('click', (e) => { if (!box.contains(e.target)) close(); });
    ov.querySelector('.demo-x').addEventListener('click', close);
  };

  // start fetching the first seconds as soon as the user shows intent
  const warm = () => {
    if (warmed) return;
    warmed = true;
    build();
    video.preload = 'auto';
    video.load();
  };

  const open = (e) => {
    back = e && e.currentTarget || document.activeElement;
    build();
    if (!warmed) { warmed = true; video.preload = 'auto'; }
    document.documentElement.classList.add('demo-lock');
    ov.classList.add('is-open');
    ov.querySelector('.demo-x').focus({ preventScroll: true });
    if (video.ended) video.currentTime = 0;
    if (video.readyState < 3) box.classList.add('is-waiting');
    const p = video.play();
    if (p && p.catch) p.catch(() => box.classList.remove('is-waiting')); // autoplay refused: the controls are there
  };

  function close() {
    if (!ov || !ov.classList.contains('is-open')) return;
    video.pause();
    box.classList.remove('is-waiting');
    ov.classList.remove('is-open');
    document.documentElement.classList.remove('demo-lock');
    if (back && back.focus) back.focus({ preventScroll: true });
  }

  addEventListener('keydown', (e) => {
    if (!ov || !ov.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { // keep focus inside: the close button and the video
      const f = [ov.querySelector('.demo-x'), video];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  });

  // delegated: the page's templates re-render the hero, so listeners on the button itself would be lost
  const hit = (e) => e.target.closest && e.target.closest('[data-demo]');
  document.addEventListener('click', (e) => { const b = hit(e); if (b) { e.preventDefault(); open({ currentTarget: b }); } });
  document.addEventListener('pointerover', (e) => { if (hit(e)) warm(); }, { passive: true });
  document.addEventListener('focusin', (e) => { if (hit(e)) warm(); });
  document.addEventListener('touchstart', (e) => { if (hit(e)) warm(); }, { passive: true });
})();
