/* Choosing a picture: a company's logo (the empty company page, Settings) or a person's photo
   (their Profile). A modal (the .dlg in css/esg.css): drop an image or choose one, then drag it into
   place, zoom (slider, buttons, wheel or pinch-free trackpad scroll) and turn it, and save. What's
   saved is a small square (256px), the frame's shape only showing how it will look.
   window.CMCrop.open({ title, sub, shape: 'square' | 'round', current, type, onSave(dataUrl) })
   Prototype: the picture is kept in this tab's session by whoever asked for it. */
window.CMCrop = (() => {
  const OUT = 256, MAX = 5 * 1024 * 1024;
  const css = `
.crp .dlg-card { max-width: 30rem; }
.crp .dlg-head { padding-bottom: 1rem; }
.crp-drop { display: grid; place-items: center; gap: 0.5rem; width: 100%; aspect-ratio: 1; max-height: 18rem; margin: 0 auto; padding: 1.5rem; border: 1.5px dashed var(--color-sand-400); border-radius: 1rem;
  background: var(--color-off-white); color: var(--color-ink-muted); font: inherit; font-size: 0.9375rem; text-align: center; cursor: pointer; transition: border-color .15s, background-color .15s; }
.crp-drop:hover, .crp-drop.is-over { border-color: var(--color-coral); background: var(--color-surface); }
.crp-drop svg { width: 2rem; height: 2rem; color: var(--color-ink-subtle); }
.crp-drop b { color: var(--color-ink); font-weight: 600; }
.crp-drop small { font-size: 0.8125rem; color: var(--color-ink-subtle); }
.crp-stage { position: relative; width: min(100%, 18rem); aspect-ratio: 1; margin: 0 auto; overflow: hidden; border-radius: 1rem; background: repeating-conic-gradient(var(--color-mid-beige) 0 25%, var(--color-surface) 0 50%) 0 0 / 16px 16px;
  cursor: grab; touch-action: none; user-select: none; }
.crp-stage.is-dragging { cursor: grabbing; }
.crp-stage:focus-visible { outline: 2px solid var(--color-graphite); outline-offset: 3px; }
.crp-stage img { position: absolute; left: 50%; top: 50%; max-width: none; transform-origin: center; pointer-events: none; }
/* the frame: what's kept; outside it, dimmed */
.crp-frame { position: absolute; inset: 0; pointer-events: none; border-radius: 1rem; box-shadow: inset 0 0 0 1px rgba(255,255,255,.6); }
.crp.is-round .crp-frame { border-radius: 50%; box-shadow: 0 0 0 999px rgba(52,52,52,.45), inset 0 0 0 1px rgba(255,255,255,.7); }
.crp.is-square .crp-frame { inset: 0; border-radius: 1.25rem; }
.crp-tools { display: flex; align-items: center; gap: 0.625rem; width: min(100%, 18rem); margin: 1rem auto 0; }
.crp-tools input[type=range] { flex: 1; accent-color: var(--color-graphite); }
.crp-ic { display: grid; place-items: center; flex: none; width: 2.25rem; height: 2.25rem; border: 1px solid var(--color-line); border-radius: 0.5rem; background: var(--color-surface); color: var(--color-ink); cursor: pointer; }
.crp-ic:hover { border-color: var(--color-sand-400); }
.crp-ic svg { width: 1rem; height: 1rem; }
.crp-hint { margin: 0.75rem auto 0; width: min(100%, 18rem); font-size: 0.8125rem; color: var(--color-ink-subtle); text-align: center; }
.crp-err { margin-top: 0.75rem; font-size: 0.875rem; color: var(--color-critical); text-align: center; }
.crp-err:empty { display: none; }
.crp .dlg-foot .link-btn { margin-right: auto; }`;
  const I = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4m0 0-4 4m4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    minus: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 10h10"/></svg>',
    plus: '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 10h10M10 5v10"/></svg>',
    turn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  };
  let styled = false;
  const open = (o = {}) => {
    if (!styled) { const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st); styled = true; }
    const shape = o.shape === 'round' ? 'round' : 'square', back = document.activeElement;
    const el = document.createElement('div');
    el.className = `dlg crp is-${shape}`;
    el.innerHTML = `<div class="dlg-scrim" data-x></div><div class="dlg-card" role="dialog" aria-modal="true" aria-labelledby="crp-t">
        <button type="button" class="dlg-x" data-x aria-label="Close">${I.x}</button>
        <div class="dlg-head"><h2 id="crp-t">${o.title || 'Choose a picture'}</h2>${o.sub ? `<p>${o.sub}</p>` : ''}</div>
        <div class="dlg-body" id="crp-b"></div>
        <div class="dlg-foot"><button type="button" class="link-btn" data-pick hidden>Choose another image</button><button type="button" class="btn co-btn-light btn-sm" data-x>Cancel</button><button type="button" class="btn btn-primary btn-sm" data-save disabled>Save</button></div>
        <input type="file" accept="image/png,image/jpeg,image/webp" hidden>
      </div>`;
    document.body.appendChild(el);
    document.documentElement.style.overflow = 'hidden';
    const $ = (s) => el.querySelector(s), body = $('#crp-b'), fileIn = $('input[type=file]'), saveBtn = $('[data-save]');
    let img = null, S = 288, zoom = 1, rot = 0, x = 0, y = 0, err = '';
    const dims = () => (rot % 180 ? [img.naturalHeight, img.naturalWidth] : [img.naturalWidth, img.naturalHeight]);
    const scale = () => { const [w, h] = dims(); return (S / Math.min(w, h)) * zoom; };
    // the picture always fills the frame: it can't be dragged or zoomed out past its edges
    const clamp = () => { const [w, h] = dims(), k = scale(), mx = Math.max(0, (w * k - S) / 2), my = Math.max(0, (h * k - S) / 2); x = Math.min(mx, Math.max(-mx, x)); y = Math.min(my, Math.max(-my, y)); };
    const place = () => {
      const pic = $('.crp-stage img'); if (!pic) return;
      clamp();
      pic.style.width = img.naturalWidth + 'px'; pic.style.height = img.naturalHeight + 'px';
      pic.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale()})`;
      const r = $('[data-zoom]'); if (r) r.value = String(zoom);
    };
    const setZoom = (z) => { const k0 = zoom; zoom = Math.min(4, Math.max(1, z)); x *= zoom / k0; y *= zoom / k0; place(); };
    const paint = () => {
      $('.dlg-foot [data-pick]').hidden = !img; saveBtn.disabled = !img;
      if (!img) {
        body.innerHTML = `<button type="button" class="crp-drop" data-pick>${I.up}<span><b>Drop an image here</b><br>or choose one from your device</span><small>PNG, JPG or WebP, up to 5 MB</small></button><p class="crp-err" role="alert">${err}</p>`;
        return;
      }
      body.innerHTML = `<div class="crp-stage" tabindex="0" aria-label="The picture. Drag it, or use the arrow keys, to choose what shows"><img src="${img.src}" alt=""><span class="crp-frame"></span></div>
        <div class="crp-tools"><button type="button" class="crp-ic" data-out aria-label="Zoom out">${I.minus}</button><input type="range" min="1" max="4" step="0.01" value="${zoom}" data-zoom aria-label="Zoom"><button type="button" class="crp-ic" data-in aria-label="Zoom in">${I.plus}</button><button type="button" class="crp-ic" data-turn aria-label="Turn a quarter" title="Turn a quarter">${I.turn}</button></div>
        <p class="crp-hint">Drag to move it, zoom to fit. ${shape === 'round' ? 'The circle is what people see.' : 'Leave a little space around a logo.'}</p><p class="crp-err" role="alert">${err}</p>`;
      S = $('.crp-stage').getBoundingClientRect().width || 288;
      place();
    };
    const load = (f) => {
      err = '';
      if (!f || !/^image\/(png|jpeg|webp)$/.test(f.type)) { err = 'That isn’t a PNG, JPG or WebP image.'; paint(); return; }
      if (f.size > MAX) { err = 'That image is over 5 MB. Choose a smaller one.'; paint(); return; }
      const pic = new Image();
      pic.onload = () => { img = pic; zoom = 1; rot = 0; x = 0; y = 0; paint(); const st = $('.crp-stage'); if (st) st.focus(); };
      pic.onerror = () => { err = 'That image couldn’t be opened. Try another.'; paint(); };
      const rd = new FileReader(); rd.onload = () => { pic.src = rd.result; }; rd.readAsDataURL(f);
    };
    const close = () => { el.remove(); document.documentElement.style.overflow = ''; document.removeEventListener('keydown', onKey); if (back && back.isConnected) back.focus(); };
    const save = () => {
      if (!img) return;
      const c = document.createElement('canvas'); c.width = c.height = OUT;
      const g = c.getContext('2d'), k = OUT / S;
      if (o.type === 'image/jpeg') { g.fillStyle = '#fff'; g.fillRect(0, 0, OUT, OUT); }
      g.translate(OUT / 2 + x * k, OUT / 2 + y * k); g.rotate((rot * Math.PI) / 180); g.scale(scale() * k, scale() * k);
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      const url = c.toDataURL(o.type || 'image/png', 0.88);
      close(); if (o.onSave) o.onSave(url);
    };
    // dragging the picture
    let drag = null;
    el.addEventListener('pointerdown', (e) => { const st = e.target.closest('.crp-stage'); if (!st || !img) return; drag = { px: e.clientX, py: e.clientY, x, y }; st.setPointerCapture(e.pointerId); st.classList.add('is-dragging'); });
    el.addEventListener('pointermove', (e) => { if (!drag) return; x = drag.x + e.clientX - drag.px; y = drag.y + e.clientY - drag.py; place(); });
    const end = () => { if (!drag) return; drag = null; const st = $('.crp-stage'); if (st) st.classList.remove('is-dragging'); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', (e) => { if (!e.target.closest('.crp-stage') || !img) return; e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.06 : 1 / 1.06)); }, { passive: false });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-zoom]')) setZoom(+e.target.value); });
    el.addEventListener('click', (e) => {
      const t = (s) => e.target.closest(s);
      if (t('[data-x]')) { close(); return; }
      if (t('[data-pick]')) { fileIn.value = ''; fileIn.click(); return; }
      if (t('[data-in]')) { setZoom(zoom + 0.25); return; }
      if (t('[data-out]')) { setZoom(zoom - 0.25); return; }
      if (t('[data-turn]')) { rot = (rot + 90) % 360; x = 0; y = 0; place(); return; }
      if (t('[data-save]')) save();
    });
    fileIn.addEventListener('change', () => load(fileIn.files[0]));
    ['dragover', 'dragenter'].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); const z = $('.crp-drop'); if (z) z.classList.add('is-over'); }));
    el.addEventListener('dragleave', (e) => { if (!el.contains(e.relatedTarget)) { const z = $('.crp-drop'); if (z) z.classList.remove('is-over'); } });
    el.addEventListener('drop', (e) => { e.preventDefault(); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
    const onKey = (e) => {
      if (e.key === 'Escape') { close(); return; }
      if (!img || !e.target.closest || !e.target.closest('.crp-stage')) return;
      const step = e.shiftKey ? 20 : 5, mv = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
      if (mv) { e.preventDefault(); x += mv[0]; y += mv[1]; place(); }
      if (e.key === '+' || e.key === '=') setZoom(zoom + 0.1); if (e.key === '-') setZoom(zoom - 0.1);
    };
    document.addEventListener('keydown', onKey);
    // what's there now, to reposition (a picture already chosen), else the drop zone
    if (o.current && /^(data:|images\/)/.test(o.current)) { const pic = new Image(); pic.onload = () => { img = pic; paint(); }; pic.onerror = () => paint(); pic.src = o.current; } else paint();
    setTimeout(() => { const f = $('.crp-drop') || $('.dlg-x'); if (f) f.focus(); }, 30);
  };
  return { open };
})();
