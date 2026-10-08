/* The ESG Questionnaire's results, once it is submitted: the global score, the score by
   category and by section, the red flags, the best practices, and an action plan with one
   action per gap, each opening the question it comes from. Worked out by ESG.score() from the
   submitted answers, so it always matches the company score. */
(() => {
  if (!window.ESG || !window.ESG_DATA) return;
  let s = ESG.load();
  if (ESG.status(s) === 'ready') { ESG.apply(s); s = ESG.load(); }
  const $ = (id) => document.getElementById(id);
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const p = window.CO_PROFILE ? CO_PROFILE.load() : null;
  $('res-co-name').textContent = p ? p.trading || p.name : 'Your company';
  $('res-year').textContent = new Date(s.submitted || Date.now()).getFullYear();
  $('res-print').addEventListener('click', () => print());
  // The PDF maker reads only plain colours and cannot draw a conic gradient, so for the moment it
  // takes its picture every newer colour is written out as rgb, and the score ring becomes an image.
  const forPdf = (root) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true });
    const rgb = (c) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const [r, g, bl, al] = cx.getImageData(0, 0, 1, 1).data; return `rgba(${r}, ${g}, ${bl}, ${(al / 255).toFixed(3)})`; };
    const PROPS = ['color', 'background-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color'];
    const kept = [];
    [root, ...root.querySelectorAll('*')].forEach((el) => {
      const cs = getComputedStyle(el);
      PROPS.forEach((pr) => { const v = cs.getPropertyValue(pr); if (/okl|lab\(|color\(|color-mix/.test(v)) { kept.push([el, pr, el.style.getPropertyValue(pr)]); el.style.setProperty(pr, rgb(v)); } });
      if (/okl|lab\(|color-mix/.test(cs.boxShadow)) { kept.push([el, 'box-shadow', el.style.getPropertyValue('box-shadow')]); el.style.setProperty('box-shadow', 'none'); }
    });
    // icons drawn in currentColor: the PDF maker needs the colour itself
    root.querySelectorAll('svg').forEach((svg) => {
      ['stroke', 'fill'].forEach((at) => {
        if (svg.getAttribute(at) === 'currentColor') { kept.push([svg, '__attr_' + at, 'currentColor']); svg.setAttribute(at, rgb(getComputedStyle(svg).color)); }
      });
      // sized only by CSS, an icon has no size of its own when it is turned into a picture
      ['width', 'height'].forEach((at) => { if (!svg.hasAttribute(at)) { kept.push([svg, '__attr_' + at, null]); svg.setAttribute(at, Math.round(svg.getBoundingClientRect()[at])); } });
    });
    const ring = $('res-ring'), p = parseFloat(ring.style.getPropertyValue('--p')) || 0, c = 2 * Math.PI * 87;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><circle cx="96" cy="96" r="87" fill="none" stroke="${rgb(getComputedStyle(document.documentElement).getPropertyValue('--color-mid-beige'))}" stroke-width="18"/><circle cx="96" cy="96" r="87" fill="none" stroke="${rgb(getComputedStyle(document.documentElement).getPropertyValue('--color-ok'))}" stroke-width="18" stroke-dasharray="${(c * p) / 100} ${c}" transform="rotate(-90 96 96)"/></svg>`;
    kept.push([ring, 'background', ring.style.getPropertyValue('background')]);
    ring.style.setProperty('background', `url("data:image/svg+xml,${encodeURIComponent(svg)}") center / 100% 100% no-repeat`);
    return () => kept.reverse().forEach(([el, pr, v]) => (pr.startsWith('__attr_') ? (v == null ? el.removeAttribute(pr.slice(7)) : el.setAttribute(pr.slice(7), v)) : v ? el.style.setProperty(pr, v) : el.style.removeProperty(pr)));
  };
  // a PDF of the dashboard itself, made in the browser (the library loads only when asked for)
  $('res-download').addEventListener('click', async (e) => {
    const b = e.currentTarget; if (b.disabled) return;
    let undo = null;
    b.disabled = true; b.classList.add('is-busy-icon');
    try {
      if (!window.html2pdf) await new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); });
      const name = ($('res-co-name').textContent || 'Company').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
      document.documentElement.classList.add('res-pdf');
      undo = forPdf($('res-wrap'));
      await html2pdf().set({ margin: [10, 10, 12, 10], filename: `${name}-ESG-dashboard-${$('res-year').textContent}.pdf`, image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, backgroundColor: '#f2f1ed', useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, pagebreak: { mode: ['css', 'avoid-all'], avoid: '.res-card, .res-plan-g' } })
        .from($('res-wrap')).save();
    } catch (err) { print(); } // no PDF maker to hand: the print dialog can still save one
    finally { if (undo) undo(); document.documentElement.classList.remove('res-pdf'); b.disabled = false; b.classList.remove('is-busy-icon'); }
  });
  $('res-top').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  if (!s.submitted) { $('res-none').hidden = false; return; }

  const r = ESG.score(s), d = new Date(s.submitted);
  $('res').hidden = false;
  $('res-lead').textContent = `From the answers submitted on ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}. Clients and buyers you share your profile with see the same score.`;

  // ---- the global score --------------------------------------------------------------------------
  $('res-ring').style.setProperty('--p', r.global + '%');
  $('res-global').textContent = r.global;
  $('res-ring').setAttribute('role', 'img'); $('res-ring').setAttribute('aria-label', `Global ESG score ${r.global} of 100`);
  $('res-verdict').textContent = r.global >= 80 ? 'Strong. Clients see a well-evidenced ESG profile, with a few things to sharpen.'
    : r.global >= 60 ? 'Solid, with some gaps to close.' : r.global >= 40 ? 'Developing. Several areas need work.' : 'Early days. Start with the red flags.';

  // ---- by category and by section --------------------------------------------------------------------
  const GROUPS = [['E', 'Environment', 'is-e'], ['S', 'Social', 'is-s'], ['G', 'Governance', 'is-g']];
  $('res-groups').innerHTML = GROUPS.map(([k, l, c]) => `<div class="res-g ${c}"><span class="res-g-t"><i aria-hidden="true"></i>${l}</span><b>${r.groups[k]}%</b>
    <span class="co-meter res-bar-m"><i style="width:${r.groups[k]}%"></i></span></div>`).join('');
  $('res-secs').innerHTML = ESG_DATA.sections.map((sec) => {
    const x = r.sections[sec.id]; if (!x) return '';
    return `<div class="res-sec"><span>${esc(sec.title)}</span><span class="co-meter res-bar-m"><i style="width:${x.pct}%"></i></span><b>${x.pct}%</b></div>`;
  }).join('');

  // ---- red flags and best practices --------------------------------------------------------------------
  const title = (id) => (ESG_DATA.sections.find((x) => x.id === id) || {}).title || '';
  const top = (key) => key.split('.')[0];
  const row = (f, bad) => `<li><a class="res-item" href="esg-questionnaire.html#q-${top(f.key)}"><span class="res-item-t">${esc(f.q)}</span>
    <span class="res-item-m"><span class="chip ${bad ? 'is-bad' : 'is-ok'}">${esc(f.answer)}</span>${f.critical ? '<span class="chip is-needs">Critical</span>' : ''}<span class="res-item-s">${esc(title(f.sec))}</span></span></a></li>`;
  $('res-flags-n').textContent = r.flags.length;
  $('res-flags').innerHTML = r.flags.length ? r.flags.map((f) => row(f, true)).join('') : '<li class="res-empty">No red flags. Nothing in your answers points to a gap.</li>';
  $('res-good-n').textContent = r.good.length;
  const good = r.good.filter((g) => !g.key.includes('.')).concat(r.good.filter((g) => g.key.includes('.')));
  let all = false;
  const paintGood = () => {
    const list = all ? good : good.slice(0, 8);
    $('res-good').innerHTML = list.length ? list.map((g) => row(g, false)).join('') : '<li class="res-empty">No best practices yet.</li>';
    const more = $('res-good-more'); more.hidden = good.length <= 8;
    more.textContent = all ? 'Show fewer' : `Show all ${good.length}`;
  };
  $('res-good-more').addEventListener('click', () => { all = !all; paintGood(); });
  paintGood();

  // ---- the action plan ----------------------------------------------------------------------------------
  const CHEV = '<svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.08 10l3.71 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>';
  $('res-plan').innerHTML = [['E', 'Environmental initiatives', 'is-e'], ['S', 'Social initiatives', 'is-s'], ['G', 'Governance initiatives', 'is-g']].map(([k, l, c]) => {
    const acts = r.actions.filter((a) => a.group === k).sort((a, b) => a.partial - b.partial);
    return `<div class="res-plan-g ${c}"><h3><i aria-hidden="true"></i>${l}<span class="res-n">${acts.length}</span></h3>`
      + (acts.length ? `<ul>${acts.map((a) => `<li><a class="res-act" href="esg-questionnaire.html#q-${top(a.key)}"><span>${esc(a.text)}</span>${a.partial ? '<span class="chip is-mid">Improve</span>' : ''}<span class="res-go" aria-hidden="true">${CHEV}</span></a></li>`).join('')}</ul>`
        : '<p class="res-empty">Nothing to act on here. Keep it up.</p>') + '</div>';
  }).join('');
})();
