/* Settings: the profile (photo, name, job title, email, phone), the password and two-factor
   sign-in, the consents moved here from the company page, email notifications, language and
   region, and leaving. Prototype: the profile is kept in this tab's session like the rest of
   the demo, so the header's name and photo follow what is saved here. */
(() => {
  const $ = (s) => document.querySelector(s);
  let person = null, photo = '';
  try { person = JSON.parse(sessionStorage.getItem('cm-person') || 'null'); photo = sessionStorage.getItem('cm-photo') || ''; } catch (e) {}
  person = Object.assign({ name: 'Beatriz Nogueira', email: 'beatriz@veridianharvest.com', role: 'Owner', phone: '', cc: '' }, person || {});
  const demo = () => person.email.toLowerCase() === 'miguel@ferreiraconstrucoes.pt';
  const demoF = () => person.email.toLowerCase() === 'beatriz@veridianharvest.com';
  if (!photo && !person.noPhoto) { if (demo()) photo = 'images/profile-miguel.webp'; else if (demoF()) photo = 'images/profile-beatriz.webp'; }
  const save = () => { try { sessionStorage.setItem('cm-person', JSON.stringify(person)); if (photo && !photo.startsWith('images/')) sessionStorage.setItem('cm-photo', photo); else sessionStorage.removeItem('cm-photo'); } catch (e) {} };
  const ini = (n) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  // every picture of you on the page: this card's and the header's
  const paint = () => {
    document.querySelectorAll('#set-pic, [data-who-pic]').forEach((n) => {
      n.textContent = photo ? '' : ini(person.name);
      if (photo) { const img = new Image(); img.alt = ''; img.src = photo; n.appendChild(img); }
    });
    document.querySelectorAll('[data-who-name]').forEach((n) => (n.textContent = person.name));
    document.querySelectorAll('[data-who-email]').forEach((n) => (n.textContent = person.email));
    $('#set-photo-rm').hidden = !photo;
    $('#set-photo-up').textContent = photo ? 'Change picture' : 'Upload a picture';
  };
  const flash = (el, text) => { el.textContent = text; clearTimeout(el._t); el._t = setTimeout(() => (el.textContent = ''), 2600); };

  // ---- photo -------------------------------------------------------------------
  const file = $('#set-photo-file');
  $('#set-photo-up').addEventListener('click', () => file.click());
  file.addEventListener('change', () => {
    const f = file.files[0]; file.value = ''; if (!f || !/^image\//.test(f.type)) return;
    const img = new Image();
    img.onload = () => {
      // a 256px square from the middle, so the session keeps a small picture
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const s = Math.min(img.width, img.height);
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 256, 256);
      photo = c.toDataURL('image/jpeg', 0.86); person.noPhoto = false; save(); paint(); URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(f);
  });
  $('#set-photo-rm').addEventListener('click', () => { photo = ''; person.noPhoto = true; save(); paint(); });

  // ---- profile -----------------------------------------------------------------
  const CODES = [['+1', 'US'], ['+351', 'PT'], ['+44', 'UK'], ['+49', 'DE'], ['+34', 'ES'], ['+33', 'FR'], ['+39', 'IT']];
  const cc = $('#p-cc');
  cc.innerHTML = CODES.map(([c, k]) => `<option value="${c}">${k} ${c}</option>`).join('');
  const fp = $('#f-profile'), saveBtn = fp.querySelector('[type="submit"]');
  const fill = () => { $('#p-name').value = person.name; $('#p-role').value = person.role || ''; $('#p-email').value = person.email; $('#p-phone').value = person.phone || ''; cc.value = person.cc || '+1'; };
  const now = () => ({ name: $('#p-name').value.trim(), role: $('#p-role').value.trim(), email: $('#p-email').value.trim(), phone: $('#p-phone').value.trim(), cc: $('#p-phone').value.trim() ? cc.value : '' });
  const dirty = () => { const n = now(); return ['name', 'role', 'email', 'phone', 'cc'].some((k) => (n[k] || '') !== (person[k] || '')); };
  const phoneOk = (v) => { const d = v.replace(/\D/g, ''); return !v || (d.length >= 6 && d.length <= 15 && !/[^\d\s()+.-]/.test(v)); };
  fp.addEventListener('input', () => { saveBtn.disabled = !dirty(); $('#p-phone-err').textContent = ''; $('#p-phone').classList.remove('is-bad'); });
  fp.addEventListener('change', () => { saveBtn.disabled = !dirty(); });
  fp.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = now();
    if (!n.name) { $('#p-name').classList.add('is-bad'); $('#p-name').focus(); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n.email)) { $('#p-email').classList.add('is-bad'); $('#p-email').focus(); return; }
    if (!phoneOk(n.phone)) { $('#p-phone-err').textContent = 'That does not look like a phone number.'; $('#p-phone').classList.add('is-bad'); $('#p-phone').focus(); return; }
    fp.querySelectorAll('.is-bad').forEach((i) => i.classList.remove('is-bad'));
    Object.assign(person, n); save(); paint(); tfa(); saveBtn.disabled = true;
    flash(fp.querySelector('.set-saved'), 'Saved');
  });

  // ---- password ----------------------------------------------------------------
  const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10.9 10.9 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';
  document.querySelectorAll('.set-eye').forEach((b) => {
    b.innerHTML = EYE;
    b.addEventListener('click', () => {
      const i = b.previousElementSibling, on = i.type === 'password';
      i.type = on ? 'text' : 'password'; b.innerHTML = on ? EYE_OFF : EYE;
      b.setAttribute('aria-pressed', String(on)); b.setAttribute('aria-label', on ? 'Hide password' : 'Show password');
    });
  });
  const fw = $('#f-password'), pwBtn = fw.querySelector('[type="submit"]');
  const rules = { len: (v) => v.length >= 8, case: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v), num: (v) => /\d/.test(v) };
  const checkPw = () => {
    const cur = $('#pw-cur').value, nw = $('#pw-new').value, ag = $('#pw-again').value;
    let all = true;
    fw.querySelectorAll('[data-rule]').forEach((li) => { const ok = rules[li.dataset.rule](nw); li.classList.toggle('is-ok', ok); all = all && ok; });
    $('#pw-err').textContent = ag && nw !== ag ? 'The two passwords are not the same yet.' : '';
    pwBtn.disabled = !(cur && all && nw === ag);
  };
  fw.addEventListener('input', checkPw);
  fw.addEventListener('submit', (e) => {
    e.preventDefault(); if (pwBtn.disabled) return;
    fw.reset(); fw.querySelectorAll('.set-pw input').forEach((i) => (i.type = 'password')); fw.querySelectorAll('.set-eye').forEach((b) => (b.innerHTML = EYE));
    checkPw(); flash(fw.querySelector('.set-saved'), 'Password updated');
  });

  // ---- two-factor: needs a phone --------------------------------------------------
  const sw2 = $('#tfa-sw');
  const tfa = () => {
    const has = !!person.phone;
    sw2.disabled = !has;
    if (!has) sw2.setAttribute('aria-checked', 'false');
    $('#tfa-hint').innerHTML = has ? `A six-digit code to ${person.cc} ${person.phone}, on top of your password.` : 'Add a phone number in <a href="#profile">Profile</a> to turn this on.';
  };

  // ---- switches, sessions, language, leaving ---------------------------------------
  document.querySelectorAll('.set-card .co-sw').forEach((sw) => sw.addEventListener('click', () => {
    if (sw.disabled) return;
    sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') === 'true' ? 'false' : 'true');
  }));
  const others = () => { if (!document.querySelector('[data-signout]')) { const b = $('#signout-all'); b.disabled = true; } };
  document.querySelectorAll('[data-signout]').forEach((b) => b.addEventListener('click', () => { b.closest('li').remove(); others(); }));
  $('#signout-all').addEventListener('click', (e) => { document.querySelectorAll('[data-signout]').forEach((b) => b.closest('li').remove()); e.currentTarget.disabled = true; e.currentTarget.textContent = 'Signed out everywhere else'; });
  let lang = 'en'; try { lang = localStorage.getItem('cm-lang') || 'en'; } catch (e) {}
  $('#r-lang').value = lang;
  // Consents, notifications, language: changes wait for Save, which only wakes when something differs
  document.querySelectorAll('[data-area]').forEach((area) => {
    const btn = area.querySelector('[data-save]'), note = area.querySelector('.set-saved');
    const state = () => [...area.querySelectorAll('.co-sw, select')].map((c) => (c.tagName === 'SELECT' ? c.value : c.getAttribute('aria-checked'))).join('|');
    let kept = state();
    const sync = () => { btn.disabled = state() === kept; };
    area.addEventListener('click', (e) => { if (e.target.closest('.co-sw')) setTimeout(sync, 0); });
    area.addEventListener('change', sync);
    btn.addEventListener('click', () => {
      if (area.id === 'language') try { localStorage.setItem('cm-lang', $('#r-lang').value); } catch (e) {}
      kept = state(); sync(); flash(note, 'Saved');
    });
  });
  $('#set-logout').addEventListener('click', () => { const out = document.getElementById('who-logout'); if (out) out.click(); });

  // ---- the section in view is the one marked in the list on the left ---------------
  const links = [...document.querySelectorAll('.set-nav a')];
  const cards = links.map((a) => document.querySelector(a.getAttribute('href')));
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
  document.addEventListener('click', (e) => { const a = e.target.closest('#tfa-hint a'); if (a) { e.preventDefault(); links[0].click(); setTimeout(() => $('#p-phone').focus({ preventScroll: true }), 450); } });

  fill(); paint(); tfa(); checkPw();
  // arriving at a section (from the account menu's Edit profile, or the company page)
  const at = location.hash && document.querySelector(location.hash);
  if (at && at.classList.contains('set-card')) setTimeout(() => scrollTo({ top: at.getBoundingClientRect().top + scrollY - 96 }), 60);
  setTimeout(mark, 120);
})();
