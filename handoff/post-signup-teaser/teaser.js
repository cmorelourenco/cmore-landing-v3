  // ---- teaser -----------------------------------------------------------
  // After the thank-you: ALMA walks the new member through the four screens
  // their documents will become. The product is not open, so this is where
  // sign-up ends for now; `fallback` (the empty company page) is only for a
  // page without the teaser markup. Comes up under the welcome as it goes.
  const teaser = (fallback) => {
    const t = document.getElementById('teaser');
    if (!t) { fallback(); return; }
    // her composition, cloned from the page's copy — the small one in the
    // questionnaire drawing too
    t.querySelectorAll('.alma-media').forEach((m) => m.replaceChildren(...[...source.children].map((n) => n.cloneNode(true))));
    const shots = [...t.querySelectorAll('.tz-shot')];
    const texts = [...t.querySelectorAll('#tz-text > div')];
    const dots = [...t.querySelectorAll('.tz-dots button')];
    const prev = document.getElementById('tz-prev'), nxt = document.getElementById('tz-next');
    const url = document.getElementById('tz-url'), num = document.getElementById('tz-n');
    let at = 0;
    const show = (i) => {
      i = Math.max(0, Math.min(shots.length - 1, i));
      shots.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-off', k < i); });
      texts.forEach((s, k) => s.classList.toggle('is-on', k === i));
      dots.forEach((d, k) => { if (k === i) d.setAttribute('aria-current', 'step'); else d.removeAttribute('aria-current'); });
      prev.disabled = i === 0; nxt.disabled = i === shots.length - 1;
      url.textContent = shots[i].dataset.url; num.textContent = i + 1;
      at = i;
    };
    prev.addEventListener('click', () => show(at - 1));
    nxt.addEventListener('click', () => show(at + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => show(k)));
    const keys = (e) => {
      if (t.hidden) return;
      if (e.key === 'ArrowRight') show(at + 1);
      if (e.key === 'ArrowLeft') show(at - 1);
    };
    addEventListener('keydown', keys);
    t.hidden = false;
    root.classList.add('intake-open'); // the page under it must not scroll
    requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('is-in')));
    // One email on launch day. The address comes from the sign-up and sits
    // locked in the field; the pencil opens it for a correction (with no email
    // to hand it starts open). Pressed, the form becomes the confirmation and a
    // toast says where the email will go. This is the end of the road until
    // launch: there is no company page to go to yet. Prototype: nothing is sent
    // and nothing is remembered; a reload starts over.
    const form = document.getElementById('tz-form'), note = document.getElementById('tz-note');
    const to = document.getElementById('tz-to'), toErr = document.getElementById('tz-to-err'), edit = document.getElementById('tz-edit');
    try { const p = JSON.parse(sessionStorage.getItem('cm-person') || 'null'); if (p && p.email) to.value = p.email; } catch (e) {}
    const valid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    // the field hugs its email (or the placeholder while empty), measured in its own font
    const ruler = document.createElement('canvas').getContext('2d');
    const fit = () => {
      const cs = getComputedStyle(to);
      ruler.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight) + parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
      to.style.width = Math.ceil(ruler.measureText(to.value || to.placeholder).width + pad + 2) + 'px';
    };
    const lock = (on) => { to.readOnly = on; edit.hidden = !on; fit(); };
    lock(valid(to.value.trim()));
    edit.addEventListener('click', () => { lock(false); to.focus(); to.select(); });
    to.addEventListener('blur', () => { if (valid(to.value.trim())) lock(true); });
    const toast = (addr) => {
      const t = document.createElement('div');
      t.className = 'alma-toast tz-toast'; t.setAttribute('role', 'status');
      t.innerHTML = `<span class="dlg-alma" aria-hidden="true"></span><span class="alma-toast-t"><b>You are on the list</b><span>One email to <em class="tz-addr">${esc(addr)}</em> the day C‑MORE opens for founding members. Nothing else.</span></span>
        <button type="button" class="dlg-x" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
      t.querySelector('.dlg-alma').replaceChildren(...[...source.children].map((n) => n.cloneNode(true)));
      document.body.appendChild(t);
      let gone = false;
      const out = () => { if (gone) return; gone = true; t.classList.add('is-out'); setTimeout(() => t.remove(), reducedMotion ? 0 : 420); };
      t.querySelector('.dlg-x').addEventListener('click', out);
      setTimeout(out, 8000);
    };
    const notified = (addr) => {
      note.innerHTML = `<b>Done.</b> You will get one email at <b>${esc(addr)}</b> the day C‑MORE opens for founding members.`;
      form.replaceWith(Object.assign(document.createElement('span'), { className: 'tz-done', innerHTML: '<i aria-hidden="true"></i>You are on the list' }));
      toast(addr);
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const addr = to.value.trim();
      if (!valid(addr)) {
        lock(false); to.classList.add('is-bad'); to.focus({ preventScroll: true });
        toErr.textContent = 'That does not look like an email address.';
        return;
      }
      notified(addr);
    });
    to.addEventListener('input', () => { to.classList.remove('is-bad'); toErr.textContent = ''; fit(); });
    if (document.fonts) document.fonts.ready.then(fit);
    try { sessionStorage.removeItem('cm-notify'); } catch (e) {} // an earlier build remembered the press; not any more
  };

