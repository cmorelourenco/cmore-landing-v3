/* The company profile page: the company's name and logo, its address, how to reach it, and
   which clients may see its documents. Each card saves on its own, and only once something in
   it has changed; the company page follows what is saved (js/co-profile.js). */
(() => {
  if (!window.CO_PROFILE) return;
  let p = CO_PROFILE.load();
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const flash = (el, text) => { el.textContent = text; clearTimeout(el._t); el._t = setTimeout(() => (el.textContent = ''), 2600); };

  // ---- fields -----------------------------------------------------------------------------------
  const COUNTRIES = ['United States', 'Canada', 'Brazil', 'United Kingdom', 'Portugal', 'Spain', 'France', 'Germany', 'Italy', 'Netherlands', 'Belgium'];
  const CODES = [['+1', 'US'], ['+351', 'PT'], ['+44', 'UK'], ['+49', 'DE'], ['+34', 'ES'], ['+33', 'FR'], ['+39', 'IT'], ['+31', 'NL'], ['+32', 'BE'], ['+55', 'BR']];
  $('#cp-country').innerHTML = COUNTRIES.map((c) => `<option>${c}</option>`).join('');
  $('#cp-cc').innerHTML = CODES.map(([c, k]) => `<option value="${c}">${k} ${c}</option>`).join('');
  const forms = [...document.querySelectorAll('[data-cp]')];
  const fields = (f) => [...f.querySelectorAll('[data-k]')];
  const fill = () => forms.forEach((f) => fields(f).forEach((i) => { i.value = p[i.dataset.k] || ''; i.classList.remove('is-bad'); }));
  const dirty = (f) => fields(f).some((i) => i.value.trim() !== (p[i.dataset.k] || ''));
  const CHECK = {
    name: (v) => (!v ? 'The company needs its legal name.' : ''),
    people: (v) => (v && !/^\d{1,6}$/.test(v) ? 'People is a whole number — 24, for example.' : ''),
    tax: (v) => (v && !/^\d{2}-?\d{7}$/.test(v) ? 'An EIN is nine digits, written 12-3456789.' : ''),
    email: (v) => (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'That does not look like an email address.' : ''),
    phone: (v) => { const d = v.replace(/\D/g, ''); return v && (d.length < 6 || d.length > 15 || /[^\d\s()+.-]/.test(v)) ? 'That does not look like a phone number.' : ''; },
    website: (v) => (v && !/^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(v) ? 'That does not look like a web address.' : ''),
  };
  forms.forEach((f) => {
    const btn = f.querySelector('[type="submit"]'), err = f.querySelector('.set-err');
    const sync = () => { btn.disabled = !dirty(f); };
    f.addEventListener('input', (e) => { e.target.classList.remove('is-bad'); err.textContent = ''; sync(); });
    f.addEventListener('change', sync);
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      for (const i of fields(f)) {
        const msg = CHECK[i.dataset.k] && CHECK[i.dataset.k](i.value.trim());
        if (msg) { i.classList.add('is-bad'); err.textContent = msg; i.focus(); return; }
      }
      fields(f).forEach((i) => { p[i.dataset.k] = i.value.trim(); });
      if (p.tax && /^\d{9}$/.test(p.tax)) p.tax = p.tax.slice(0, 2) + '-' + p.tax.slice(2);
      CO_PROFILE.save(p); fill(); sync(); paintLogo();
      flash(f.querySelector('.set-saved'), 'Saved');
    });
  });

  // ---- logo ---------------------------------------------------------------------------------------
  const ini = (n) => n.replace(/\b(LLC|Inc\.?|Co\.?|Ltd\.?|GmbH|BV|NV)\b/gi, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const paintLogo = () => {
    const box = $('#cp-logo'); box.textContent = '';
    if (p.logo) { const img = new Image(); img.alt = ''; img.src = p.logo; box.appendChild(img); } else box.textContent = ini(p.trading || p.name);
    $('#cp-logo-rm').hidden = !p.logo;
    $('#cp-logo-up').textContent = p.logo ? 'Change logo' : 'Upload a logo';
  };
  const file = $('#cp-logo-file');
  $('#cp-logo-up').addEventListener('click', () => file.click());
  file.addEventListener('change', () => {
    const f = file.files[0]; file.value = ''; if (!f || !/^image\//.test(f.type)) return;
    const img = new Image();
    img.onload = () => {
      // a 256px square from the middle, so the session keeps a small picture
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const s = Math.min(img.width, img.height), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, 256, 256);
      x.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
      p.logo = c.toDataURL('image/jpeg', 0.88); CO_PROFILE.save(p); paintLogo(); URL.revokeObjectURL(img.src);
      flash($('#company .set-saved'), 'Logo updated');
    };
    img.src = URL.createObjectURL(f);
  });
  $('#cp-logo-rm').addEventListener('click', () => { p.logo = ''; CO_PROFILE.save(p); paintLogo(); flash($('#company .set-saved'), 'Logo removed'); });

  // ---- consents: who may see the company's documents --------------------------------------------------
  const list = $('#cp-consents');
  const ACTS = {
    pending: (i) => `<button type="button" class="btn btn-primary co-btn-sm" data-c="${i}" data-to="accepted">Accept</button><button type="button" class="btn co-btn-ghost co-btn-sm" data-c="${i}" data-to="declined">Decline</button>`,
    accepted: (i) => `<button type="button" class="btn co-btn-ghost co-btn-sm" data-c="${i}" data-to="stopped">Stop sharing</button>`,
    declined: (i) => `<button type="button" class="btn co-btn-ghost co-btn-sm" data-c="${i}" data-to="accepted">Accept instead</button>`,
    stopped: (i) => `<button type="button" class="btn co-btn-ghost co-btn-sm" data-c="${i}" data-to="accepted">Share again</button>`,
  };
  const SAY = CO_PROFILE.SAY;
  const paintConsents = () => {
    list.innerHTML = p.consents.map((c, i) => `<div class="co-row"><div class="co-row-t"><span class="co-row-n">${esc(c.name)} <span class="co-badge ${CO_PROFILE.BADGE[c.state][0]}">${CO_PROFILE.BADGE[c.state][1]}</span></span><span class="co-subtle">${esc(SAY[c.state](c))}</span></div><div class="co-acts">${ACTS[c.state](i)}</div></div>`).join('');
  };
  list.addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]'); if (!b) return;
    const c = p.consents[+b.dataset.c]; c.state = b.dataset.to; if (c.state === 'accepted') c.when = CO_PROFILE.today();
    CO_PROFILE.save(p); paintConsents();
    const again = list.querySelector(`[data-c="${b.dataset.c}"]`); if (again) again.focus({ preventScroll: true });
  });

  // ---- the section in view is the one marked on the left, as in Settings --------------------------------
  const links = [...document.querySelectorAll('.set-nav a')], cards = links.map((a) => document.querySelector(a.getAttribute('href')));
  const mark = () => {
    let on = 0;
    cards.forEach((c, i) => { if (c && c.getBoundingClientRect().top < innerHeight * 0.35) on = i; });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) on = cards.length - 1;
    links.forEach((a, i) => { a.classList.toggle('is-on', i === on); if (i === on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };
  addEventListener('scroll', mark, { passive: true });
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); const t = document.querySelector(a.getAttribute('href'));
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - 96, behavior: 'smooth' }); history.replaceState(null, '', a.getAttribute('href'));
  }));

  fill(); paintLogo(); paintConsents();
  const at = location.hash && document.querySelector(location.hash);
  if (at && at.classList.contains('set-card')) setTimeout(() => scrollTo({ top: at.getBoundingClientRect().top + scrollY - 96 }), 60);
  setTimeout(mark, 120);
})();
