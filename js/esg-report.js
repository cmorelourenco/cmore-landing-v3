/* The ESG report as a PDF: landscape pages in the shape of the sustainability reports C-MORE
   produces — a cover, contents, a statement, highlights, then General disclosures, Environmental,
   Social and Governance, each in its own colour, and a declaration. Built from the submitted ESG
   Questionnaire, its score and the company profile. Pages are laid out off screen, drawn with
   html2canvas and put together with jsPDF (both from cdnjs, loaded on first use). The photographs
   are in images/report. Only plain colours are used, because html2canvas cannot read newer colour
   functions. */
window.ESG_REPORT = (() => {
  const W = 1334, H = 750;
  const LIBS = ['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
  const C = {
    gen: { name: 'General Disclosures', main: '#7d7a70', fill: '#96958e', soft: '#f3f2ee', ink: '#ffffff' },
    env: { name: 'Environmental', main: '#4f8f49', fill: '#a6d8a0', soft: '#eef6ec', ink: '#2f4d2c' },
    soc: { name: 'Social', main: '#e0603f', fill: '#f46d4f', soft: '#fdf0ec', ink: '#ffffff' },
    gov: { name: 'Governance', main: '#4e638b', fill: '#4e638b', soft: '#eceff5', ink: '#ffffff' },
  };
  const GROUP = { governance: 'gov', infosec: 'gov', product: 'gov', social: 'soc', environment: 'env', climate: 'env', water: 'env', waste: 'env', biodiversity: 'env' };
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const esc = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const svgUrl = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const load = (src) => new Promise((ok, no) => { const sc = document.createElement('script'); sc.src = src; sc.onload = ok; sc.onerror = no; document.head.appendChild(sc); });
  const text = (url) => fetch(url).then((r) => r.text());
  const dateLong = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

  // ---- photographs: people at work, fields and forests (Unsplash, free licence; images/report) -------
  // each is cropped to the slot it fills, so it needs no scaling the PDF maker might get wrong
  const photo = (name) => `<img class="rp-art" src="images/report/${name}.jpg" width="588" height="666" alt="">`;
  const MORE = { env: ['env-field', 'env-forest', 'env-water'], soc: ['soc-talk', 'soc-scaffold'], gov: ['gov-team'] };
  let turn = {};
  const next = (k) => { const l = MORE[k], i = turn[k] || 0; turn[k] = i + 1; return l[i % l.length]; };

  // ---- charts, as images ---------------------------------------------------------------------------
  const ring = (pct, color, size = 220) => {
    const r = size / 2 - 14, c = 2 * Math.PI * r;
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="#e9e7e2" stroke-width="22"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="22" stroke-dasharray="${(c * pct) / 100} ${c}" transform="rotate(-90 ${size / 2} ${size / 2})" stroke-linecap="round"/></svg>`);
  };
  const bars = (rows, w = 560) => {
    const rowH = 38, h = rows.length * rowH + 36, x0 = 170, bw = w - x0 - 70;
    let g = '';
    [0, 25, 50, 75, 100].forEach((t) => { const x = x0 + (bw * t) / 100; g += `<line x1="${x}" y1="6" x2="${x}" y2="${h - 26}" stroke="#e0ded7" stroke-dasharray="3 4"/><text x="${x}" y="${h - 8}" font-family="Figtree, Arial" font-size="11" fill="#96958e" text-anchor="middle">${t}</text>`; });
    rows.forEach((rw, i) => {
      const y = 10 + i * rowH;
      g += `<text x="${x0 - 12}" y="${y + 17}" font-family="Figtree, Arial" font-size="13" fill="#6e6e6a" text-anchor="end">${esc(rw.label)}</text>`
        + `<rect x="${x0}" y="${y + 6}" width="${Math.max(2, (bw * rw.pct) / 100)}" height="16" rx="8" fill="${rw.color}"/>`
        + `<text x="${x0 + (bw * rw.pct) / 100 + 8}" y="${y + 18}" font-family="Figtree, Arial" font-size="12" font-weight="600" fill="${rw.ink || rw.color}">${rw.pct}%</text>`;
    });
    return { src: svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${g}</svg>`), w, h };
  };
  const ICON = {
    ok: (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="${c}"/><path d="M6 10.4 8.6 13 14 7.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    bad: (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20"><circle cx="10" cy="10" r="9" fill="${c}"/><path d="M10 5.5v5.5" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><circle cx="10" cy="14.4" r="1.3" fill="#fff"/></svg>`,
    mid: (c) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="${c}" stroke-width="2"/><path d="M6.5 10h7" stroke="${c}" stroke-width="2" stroke-linecap="round"/></svg>`,
  };
  const icon = (kind, c) => `<img class="rp-ico" width="16" height="16" src="${svgUrl(ICON[kind](c))}" alt="">`;

  // ---- what goes in: the questionnaire, its score, the company --------------------------------------
  const gather = () => {
    let s = ESG.load(); if (ESG.status(s) === 'ready') { ESG.apply(s); s = ESG.load(); }
    const sc = ESG.score(s), c = ESG.counts(s), p = window.CO_PROFILE ? CO_PROFILE.load() : {};
    let person = 'Beatriz Nogueira'; try { person = (JSON.parse(sessionStorage.getItem('cm-person') || 'null') || {}).name || person; } catch (e) {}
    const when = new Date(s.submitted || Date.now());
    const good = new Set(sc.good.map((g) => g.key)), flags = new Set(sc.flags.map((f) => f.key));
    const answerOf = (q, key) => {
      if (s.na[key]) return { kind: 'mid', text: 'Not applicable.' };
      const v = s.v[key];
      if (!ESG.has(v)) return { kind: 'mid', text: 'Not answered.' };
      if (q.ty === 'choice') { const l = ((q.opts || []).find(([x]) => x === v) || [, v])[1]; return { kind: good.has(key) ? 'ok' : flags.has(key) ? 'bad' : 'mid', text: l + '.' }; }
      const t = String(v).trim(); return { kind: 'mid', text: t.length > 170 ? t.slice(0, 167) + '…' : t, written: true };
    };
    // which document each answer of ALMA's leans on
    const used = {};
    ESG.each((q, key) => { const m = s.meta[key]; if (!m || m.by !== 'alma' || m.rejected) return; new Set([m.src || (q.a && q.a.src)].concat(((m.cite || (q.a && q.a.cite)) || []).map((x) => x.src)).filter(Boolean)).forEach((n) => { used[n] = (used[n] || 0) + 1; }); });
    const sections = ESG_DATA.sections.map((sec) => {
      const S = c.sections[sec.id] || {}, x = sc.sections[sec.id] || { pct: 0 };
      let alma = 0, you = 0;
      const items = sec.questions.map((q, i) => {
        const key = `${sec.id}-${i + 1}`, m = s.meta[key];
        if (ESG.answered(s, q, key)) { if (m && m.by === 'alma' && !m.rejected) alma++; else you++; }
        return { n: i + 1, q: q.t, g: q.g, ...answerOf(q, key) };
      });
      return { id: sec.id, title: sec.title, group: GROUP[sec.id], pct: x.pct, total: S.total || sec.questions.length, answered: S.answered || 0, alma, you,
        good: sc.good.filter((g) => g.sec === sec.id).length, flags: sc.flags.filter((f) => f.sec === sec.id).length, items,
        groups: [...new Set(sec.questions.map((q) => q.g).filter(Boolean))] };
    });
    return { s, sc, c, p, person, when, sections, docs: ((s.alma && s.alma.docs) || []).map((d) => ({ ...d, until: d.until || ((ESG_DATA.docs || {}).valid || {})[d.name] || '', used: used[d.name] || 0 })) };
  };

  // ---- the pages ------------------------------------------------------------------------------------
  const CSS = `
  .rp-page { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: #ffffff; font-family: Figtree, Arial, sans-serif; color: #343434; box-sizing: border-box; }
  .rp-page * { box-sizing: border-box; }
  .rp-top { position: absolute; left: 0; right: 0; top: 0; height: 84px; display: flex; align-items: center; gap: 34px; padding: 0 46px; border-bottom: 1px solid #e9e7e2; background: #fff; z-index: 2; }
  .rp-logo { width: 96px; height: 18px; }
  .rp-pills { display: flex; gap: 16px; }
  .rp-pill { display: inline-block; padding: 8px 18px; border: 1px solid; border-radius: 20px; font-size: 14px; line-height: 18px; }
  .rp-body { position: absolute; left: 0; right: 0; top: 84px; bottom: 0; }
  .rp-h { font-weight: 300; letter-spacing: -0.5px; line-height: 1.08; }
  .rp-k { font-size: 14px; font-weight: 500; color: #4a4a4a; }
  .rp-v { font-size: 14px; margin-top: 3px; }
  .rp-panel { position: absolute; left: 50px; top: 50px; width: 600px; height: 566px; border-radius: 40px; padding: 44px 42px; }
  .rp-right { position: absolute; left: 708px; right: 76px; top: 72px; }
  .rp-art { position: absolute; right: 0; top: 0; width: 588px; height: 666px; }
  .rp-big { font-weight: 300; letter-spacing: -1.5px; line-height: 1; }
  .rp-rule { height: 1px; background: #e0ded7; }
  .rp-ico { width: 16px; height: 16px; vertical-align: -3px; margin-right: 6px; }
  .rp-li { display: flex; gap: 10px; font-size: 14px; line-height: 1.45; color: #4a4a4a; padding: 2px 0; }
  .rp-li i { flex: none; width: 5px; height: 5px; border-radius: 50%; margin-top: 8px; }
  .rp-table { width: 100%; border: 1px solid #e0ded7; border-radius: 8px; border-collapse: separate; border-spacing: 0; overflow: hidden; font-size: 12.5px; }
  .rp-table caption { text-align: left; padding: 8px 10px; color: #fff; font-weight: 600; font-size: 12.5px; border-radius: 8px 8px 0 0; }
  .rp-table th { text-align: left; padding: 8px 10px; font-weight: 600; border-bottom: 1px solid #e0ded7; }
  .rp-table td { padding: 8px 10px; border-top: 1px solid #f0eee9; color: #4a4a4a; vertical-align: top; }
  .rp-qa { padding: 0 0 16px; margin-bottom: 16px; border-bottom: 1px solid #ecebe6; }
  .rp-qa .q { font-size: 14px; line-height: 1.4; color: #343434; }
  .rp-qa .a { font-size: 13.5px; margin-top: 5px; line-height: 1.4; }
  .rp-qa .a.w { color: #6e6e6a; font-style: italic; }
  `;
  const PILL_KEYS = ['gen', 'env', 'soc', 'gov'];
  const top = (A, active) => `<div class="rp-top"><img class="rp-logo" src="${A.logo}" width="96" height="18" alt=""><span class="rp-pills">${PILL_KEYS.map((k) => {
    const on = k === active, g = C[k];
    return `<span class="rp-pill" style="border-color:${g.main};color:${on ? g.ink : g.main};background:${on ? g.fill : '#fff'};${on && k === 'env' ? 'color:' + g.ink : ''}">${g.name}${k === 'gen' ? '' : ' Metrics'}</span>`;
  }).join('')}</span></div>`;
  const page = (A, active, inner) => `<section class="rp-page">${top(A, active)}<div class="rp-body">${inner}</div></section>`;

  const cover = (A, D) => `<section class="rp-page" style="background:#2b2b2b">
    <img src="images/report/cover.jpg" width="${W}" height="${H}" style="position:absolute;left:0;top:0" alt="">
    <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(24,24,24,.86) 0%,rgba(24,24,24,.62) 45%,rgba(24,24,24,.12) 100%)"></div>
    <div style="position:absolute;left:60px;top:60px;width:150px;height:84px;border-radius:42px;background:#fafafa;display:flex;align-items:center;justify-content:center"><img src="${A.logo}" width="104" height="19" alt=""></div>
    <div style="position:absolute;left:60px;top:250px;color:#fafafa">
      <div class="rp-h" style="font-size:92px;letter-spacing:4px;font-weight:300">ESG REPORT</div>
      <div style="font-size:64px;font-weight:300;color:#f46d4f;margin-top:10px">${D.when.getFullYear()}</div>
    </div>
    <div style="position:absolute;left:60px;bottom:52px;padding-left:26px;border-left:2px solid #fafafa;color:#e9e7e2;font-size:19px;line-height:1.55;max-width:620px">
      ${esc((D.p.name || '').toUpperCase())}<br><span style="font-size:15px;color:#c3c0b8">ESG Questionnaire · submitted on ${dateLong(D.when)}</span>
    </div></section>`;

  const contents = (A, D) => {
    const col = (k, title, items, icon0) => `<div style="border:1px solid #e0ded7;border-radius:6px;padding:16px 14px">
      <div style="display:flex;align-items:center;gap:12px;padding-bottom:12px;border-bottom:1px solid ${C[k].main};font-size:19px;color:${C[k].main}"><span style="width:30px;height:30px;border-radius:50%;background:${C[k].soft};display:inline-block"></span>${title}</div>
      ${items.map((t) => `<div style="padding:9px 0;border-bottom:1px solid #f0eee9;font-size:13.5px;color:#4a4a4a">${esc(t)}</div>`).join('')}</div>`;
    const by = (g) => D.sections.filter((x) => x.group === g);
    return page(A, null, `<div style="position:absolute;left:50px;top:40px;font-size:56px;color:#96958e" class="rp-h">Contents</div>
      <div style="position:absolute;left:50px;right:50px;top:122px;display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
        ${col('gen', 'General Disclosures', ['About this report', 'Highlights', 'Company profile', 'ESG score', 'Documents ALMA read', 'Questionnaire coverage', 'Red flags', 'Action plan'])}
        ${col('env', 'Environmental Metrics', by('env').map((x) => x.title))}
        ${col('soc', 'Social Metrics', by('soc').flatMap((x) => x.groups.length ? x.groups : [x.title]))}
        ${col('gov', 'Governance Metrics', by('gov').map((x) => x.title))}
      </div>`);
  };

  const statement = (A, D) => {
    const n = D.c.answered, alma = D.c.alma;
    return page(A, null, `<div style="position:absolute;left:50px;top:50px;width:610px">
      <div class="rp-h" style="font-size:40px;color:#96958e">About this report</div>
      <p style="margin-top:22px;font-size:13.5px;line-height:1.7;color:#4a4a4a">This report sets out how ${esc(D.p.trading || D.p.name)} stands on environmental, social and governance matters, as declared in the ESG Questionnaire submitted on C&#8209;MORE on ${dateLong(D.when)}. It covers the nine areas the questionnaire asks about — from governance and human rights to climate, water, waste, biodiversity, information security and product traceability.</p>
      <p style="margin-top:12px;font-size:13.5px;line-height:1.7;color:#4a4a4a">${n} of ${D.c.total} questions were answered. ${alma} of those answers were drafted by ALMA, C&#8209;MORE's assistant, from ${D.docs.length} document${D.docs.length === 1 ? '' : 's'} the company provided, each with the passage it was read from; the company reviewed every one of them before submitting, and answered the rest itself.</p>
      <p style="margin-top:12px;font-size:13.5px;line-height:1.7;color:#4a4a4a">The ESG score of ${D.sc.global} out of 100 weighs how good the answers are, not only how many there are: having a policy in place counts for more than not having one, and a sanction or a fine counts against. The red flags and the action plan at the end of the report show where the company can improve, one action for every gap.</p>
      <div style="margin-top:24px;font-size:14px;color:#4a4a4a">${esc(D.person)}</div><div style="font-size:14px;color:#96958e;margin-top:2px">On behalf of ${esc(D.p.name)}</div></div>
      ${photo('about')}`);
  };

  const highlights = (A, D) => {
    const T = [['#e9e7e2', '#343434'], ['#3a3735', '#fafafa'], ['#6e6e6a', '#fafafa'], ['#c3c0b8', '#343434'], ['#96958e', '#fafafa']];
    const tile = (v, unit, label, t, col, row) => `<div style="grid-column:${col};grid-row:${row};background:${T[t][0]};color:${T[t][1]};border-radius:18px;padding:22px 22px;display:flex;flex-direction:column;justify-content:flex-end">
      <div style="font-size:40px;font-weight:600;letter-spacing:-0.5px">${v}<span style="font-size:20px;font-weight:400;margin-left:6px">${unit || ''}</span></div><div style="font-size:16px;margin-top:6px">${label}</div></div>`;
    const g = D.sc.groups;
    return page(A, 'gen', `<div style="position:absolute;left:50px;right:50px;top:40px;display:flex;align-items:center;gap:20px"><div class="rp-h" style="font-size:46px;color:#96958e;white-space:nowrap">Highlights</div><div class="rp-rule" style="flex:1;background:#96958e"></div></div>
      <div style="position:absolute;left:50px;right:50px;top:132px;bottom:46px;display:grid;grid-template-columns:1.25fr 1fr 1fr 1fr;grid-template-rows:repeat(3,1fr);gap:16px">
        ${tile(D.sc.global, '/100', 'ESG score', 1, '1', '1 / span 2')}${tile(g.E, '%', 'Environmental', 0, '2', '1')}${tile(g.S, '%', 'Social', 4, '2', '2')}${tile(g.G, '%', 'Governance', 3, '2', '3')}
        ${tile(D.c.answered, '/' + D.c.total, 'Questions answered', 2, '3', '1')}${tile(D.c.alma, '', 'Answers drafted by ALMA', 0, '3', '2')}${tile(D.docs.length, '', 'Documents read', 1, '3', '3')}
        ${tile(D.p.people || '—', '', 'People', 3, '4', '1')}${tile(D.sc.good.length, '', 'Best practices', 2, '4', '2')}${tile(D.sc.actions.length, '', 'Actions in the plan', 4, '4', '3')}
        ${tile(D.sc.flags.length, '', 'Red flags', 0, '1', '3')}
      </div>`);
  };

  const PHOTO = { gen: 'general', env: 'environmental', soc: 'social', gov: 'governance' };
  const divider = (A, k, title, items) => page(A, k, `${photo(PHOTO[k])}<div style="position:absolute;left:746px;top:0;bottom:0;width:6px;background:${C[k].fill}"></div>
    <div style="position:absolute;left:66px;top:96px;width:640px"><div class="rp-h" style="font-size:92px;color:${C[k].main}">${title}</div>
      <div style="margin-top:34px">${items.map((t) => `<div class="rp-li" style="color:${C[k].main};font-size:16px"><i style="background:${C[k].main}"></i>${esc(t)}</div>`).join('')}</div></div>`);

  const profile = (A, D) => {
    const p = D.p, kv = (k, v) => `<div style="margin-bottom:22px"><div class="rp-k">${k}</div><div class="rp-v" style="color:#7d7a70">${esc(v || '—')}</div></div>`;
    return page(A, 'gen', `<div class="rp-panel" style="background:${C.gen.soft}">
        <div class="rp-h" style="font-size:40px;color:#96958e">Company profile</div>
        <div class="rp-big" style="font-size:78px;color:#96958e;margin-top:46px">${esc(p.people || '—')}</div><div style="font-size:19px;margin-top:10px;color:#4a4a4a">People</div>
        <div class="rp-rule" style="margin:26px 0"></div>
        ${kv('Main activity', p.activity)}${kv('Trading name', p.trading || p.name)}</div>
      <div class="rp-right" style="display:grid;grid-template-columns:1fr 1fr;gap:0 40px">
        <div>${kv('Legal name', p.name)}${kv('Legal form', p.form)}${kv('Tax number (EIN)', p.tax)}${kv('Registered office', [p.street, [p.city, p.region].filter(Boolean).join(', '), p.postcode].filter(Boolean).join(', '))}</div>
        <div>${kv('Country of main operations', p.country)}${kv('Company email', p.email)}${kv('Phone', [p.cc, p.phone].filter(Boolean).join(' '))}${kv('Website', p.website)}</div>
        <div style="grid-column:1/-1" class="rp-rule"></div>
        <div style="grid-column:1/-1;margin-top:24px">${kv('Reporting scope', `ESG Questionnaire, ${D.c.total} questions in nine areas, submitted on ${dateLong(D.when)} by ${D.person}`)}</div></div>`);
  };

  const scorePage = (A, D) => {
    const b = bars(D.sections.map((x) => ({ label: x.title, pct: x.pct, color: C[x.group].fill, ink: C[x.group].main })));
    const g = D.sc.groups, sub = (v, l, k) => `<div style="flex:1;padding-right:14px"><div class="rp-big" style="font-size:40px;color:${C[k].main}">${v}%</div><div style="font-size:15px;margin-top:6px;color:#4a4a4a">${l}</div></div>`;
    return page(A, 'gen', `<div class="rp-panel" style="background:${C.gen.soft}">
        <div class="rp-h" style="font-size:40px;color:#96958e">ESG score</div>
        <div style="display:flex;align-items:center;gap:28px;margin-top:30px"><div style="position:relative;width:200px;height:200px"><img src="${ring(D.sc.global, '#a6d8a0', 200)}" width="200" height="200" alt="">
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center"><div style="font-size:56px;font-weight:600;letter-spacing:-2px">${D.sc.global}</div><div style="font-size:13px;color:#96958e">of 100</div></div></div>
          <div style="font-size:15px;line-height:1.55;color:#4a4a4a;max-width:250px">${D.sc.global >= 80 ? 'Strong. Clients see a well-evidenced ESG profile, with a few things to sharpen.' : D.sc.global >= 60 ? 'Solid, with some gaps to close.' : D.sc.global >= 40 ? 'Developing. Several areas need work.' : 'Early days. Start with the red flags.'}</div></div>
        <div class="rp-rule" style="margin:30px 0 26px"></div>
        <div style="display:flex">${sub(g.E, 'Environment', 'env')}${sub(g.S, 'Social', 'soc')}${sub(g.G, 'Governance', 'gov')}</div></div>
      <div class="rp-right"><div style="font-size:15px;color:#4a4a4a;margin-bottom:14px">Score by section (%)</div><img src="${b.src}" width="${b.w}" height="${b.h}" alt="">
        <div style="margin-top:16px;display:flex;gap:22px;font-size:13px;color:#6e6e6a">${['env', 'soc', 'gov'].map((k) => `<span><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${C[k].fill};margin-right:6px"></span>${C[k].name}</span>`).join('')}</div></div>`);
  };

  const evidence = (A, D) => page(A, 'gen', `<div style="position:absolute;left:66px;top:50px;width:600px">
      <div class="rp-h" style="font-size:40px;color:#96958e">Documents ALMA read</div>
      <p style="font-size:13.5px;line-height:1.6;color:#6e6e6a;margin:16px 0 22px">Every answer ALMA drafted points to the passage it came from in one of these documents. Expired documents were renewed or set aside before she read them.</p>
      <table class="rp-table"><caption style="background:#96958e">Documents handed to ALMA</caption>
        <tr><th style="color:#7d7a70">Document</th><th style="color:#7d7a70">Source</th><th style="color:#7d7a70">Valid until</th><th style="color:#7d7a70">Answers</th></tr>
        ${(D.docs.length ? D.docs : [{ name: 'No documents were handed to ALMA', source: '', until: '', used: '' }]).map((d) => `<tr><td style="color:#7d7a70">${esc(d.name)}</td><td>${d.source === 'library' ? 'Company documents' : d.source ? 'Uploaded' : ''}</td><td>${d.until ? dateLong(new Date(d.until + 'T12:00:00')) : d.source ? '—' : ''}</td><td>${d.used === '' ? '' : d.used}</td></tr>`).join('')}
      </table></div>
    ${photo('documents')}`);

  const coverage = (A, D) => page(A, 'gen', `<div style="position:absolute;left:66px;top:50px;right:66px">
      <div class="rp-h" style="font-size:40px;color:#96958e">Questionnaire coverage</div>
      <p style="font-size:13.5px;line-height:1.6;color:#6e6e6a;margin:14px 0 22px;max-width:760px">How each of the nine areas was answered: by ALMA from the documents (and reviewed), or by the company directly; and what the answers add up to.</p>
      <table class="rp-table"><caption style="background:#96958e">Answers by area</caption>
        <tr>${['Area', 'Questions', 'Answered', 'By ALMA', 'By the company', 'Best practices', 'Red flags', 'Score'].map((h) => `<th style="color:#7d7a70">${h}</th>`).join('')}</tr>
        ${D.sections.map((x) => `<tr><td style="color:${C[x.group].main}">${esc(x.title)}</td><td>${x.total}</td><td>${icon(x.answered === x.total ? 'ok' : 'bad', x.answered === x.total ? '#96958e' : '#e0603f')}${x.answered}</td><td>${x.alma}</td><td>${x.you}</td><td>${x.good}</td><td>${x.flags ? icon('bad', '#e0603f') + x.flags : x.flags}</td><td style="font-weight:600">${x.pct}%</td></tr>`).join('')}
      </table></div>`);

  const qa = (it, k) => `<div class="rp-qa"><div class="q">${esc(it.q)}</div><div class="a${it.written ? ' w' : ''}" style="${it.written ? '' : 'color:' + C[k].main}">${it.written ? '' : icon(it.kind, it.kind === 'bad' ? '#e0603f' : it.kind === 'mid' ? '#96958e' : C[k].main)}${esc(it.text)}</div></div>`;
  const sectionPages = (A, D, x) => {
    const k = x.group, first = x.items.slice(0, 5), rest = x.items.slice(5), out = [];
    const sub = (v, l) => `<div style="flex:1;padding-right:12px;border-right:1px solid #e0ded7;margin-right:18px"><div class="rp-big" style="font-size:40px;color:${C[k].main}">${v}</div><div style="font-size:15px;margin-top:8px;color:#4a4a4a">${l}</div></div>`;
    out.push(page(A, k, `<div class="rp-panel" style="background:${C[k].soft}">
        <div class="rp-h" style="font-size:40px;color:${C[k].main}">${esc(x.title)}</div>
        <div class="rp-big" style="font-size:78px;color:${C[k].main};margin-top:52px">${x.pct}%</div><div style="font-size:19px;margin-top:10px;color:#4a4a4a">Section score</div>
        <div class="rp-rule" style="margin:34px 0"></div>
        <div style="display:flex">${sub(`${x.answered}/${x.total}`, 'Questions answered')}${sub(x.good, 'Best practices')}<div style="flex:1"><div class="rp-big" style="font-size:40px;color:${x.flags ? '#e0603f' : C[k].main}">${x.flags}</div><div style="font-size:15px;margin-top:8px;color:#4a4a4a">Red flags</div></div></div></div>
      <div class="rp-right">${first.map((it) => qa(it, k)).join('')}</div>`));
    for (let i = 0; i < rest.length; i += 10) {
      const chunk = rest.slice(i, i + 10), L = chunk.slice(0, 5), R = chunk.slice(5);
      out.push(page(A, k, `<div style="position:absolute;left:74px;top:56px;width:552px"><div style="font-size:15px;font-weight:600;color:${C[k].main};margin-bottom:22px">${esc(x.title)} <span style="font-weight:400;color:#96958e">— answers ${i + 6} to ${i + 5 + chunk.length}</span></div>${L.map((it) => qa(it, k)).join('')}</div>
        <div style="position:absolute;left:708px;top:98px;width:552px">${R.map((it) => qa(it, k)).join('')}</div>
        ${R.length ? '' : photo(next(k))}`));
    }
    return out;
  };

  const flagsPage = (A, D) => page(A, 'gen', `<div style="position:absolute;left:66px;top:50px;right:66px">
      <div class="rp-h" style="font-size:40px;color:#96958e">Red flags</div>
      <p style="font-size:13.5px;line-height:1.6;color:#6e6e6a;margin:14px 0 22px;max-width:780px">Gaps and risks in the answers. Clients read them as missing processes or possible non-compliance, so they are the first things to fix; each has an action in the plan that follows.</p>
      <table class="rp-table"><caption style="background:#e0603f">Red flags identified</caption>
        <tr><th style="color:#7d7a70">Question</th><th style="color:#7d7a70">Answer</th><th style="color:#7d7a70">Area</th></tr>
        ${(D.sc.flags.length ? D.sc.flags : [null]).slice(0, 10).map((f) => (f ? `<tr><td>${esc(f.q)}${f.critical ? ' <b style="color:#e0603f">· Critical</b>' : ''}</td><td style="color:#e0603f">${icon('bad', '#e0603f')}${esc(f.answer)}</td><td>${esc((ESG_DATA.sections.find((x) => x.id === f.sec) || {}).title)}</td></tr>` : '<tr><td colspan="3">No red flags. Nothing in the answers points to a gap.</td></tr>')).join('')}
      </table></div>`);

  const planPage = (A, D) => {
    const col = (g, k, title) => { const a = D.sc.actions.filter((x) => x.group === g);
      return `<div style="border-radius:18px;background:${C[k].soft};padding:22px 22px 14px"><div style="font-size:13px;font-weight:600;letter-spacing:1px;color:${C[k].main};text-transform:uppercase;margin-bottom:12px">${title}</div>
        ${a.length ? a.map((x) => `<div class="rp-li" style="padding:6px 0;border-top:1px solid #ffffff"><i style="background:${C[k].main}"></i><span>${esc(x.text)}${x.partial ? ` <span style="color:#a8690a;font-size:12px">· improve</span>` : ''}</span></div>`).join('') : '<div style="font-size:14px;color:#6e6e6a;padding:6px 0">Nothing to act on here. Keep it up.</div>'}</div>`; };
    return page(A, 'gen', `<div style="position:absolute;left:66px;top:50px;right:66px">
      <div class="rp-h" style="font-size:40px;color:#96958e">Action plan</div>
      <p style="font-size:13.5px;line-height:1.6;color:#6e6e6a;margin:14px 0 26px;max-width:780px">One action for every gap, grouped the way clients look at ESG.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start">${col('E', 'env', 'Environmental initiatives')}${col('S', 'soc', 'Social initiatives')}${col('G', 'gov', 'Governance initiatives')}</div></div>`);
  };

  const declaration = (A, D) => page(A, null, `<div style="position:absolute;left:74px;top:56px;width:570px">
      <div class="rp-h" style="font-size:40px;color:#343434">Responsibility Declaration</div>
      <p style="margin-top:28px;font-size:14px;line-height:1.65;color:#343434">I, on behalf of <b>${esc((D.p.name || '').toUpperCase())}</b>, declare that the information and answers submitted in this ESG Questionnaire for ${D.when.getFullYear()} are accurate and complete, and have been given in good faith. Answers drafted by ALMA from the company's documents were reviewed before submission. I acknowledge responsibility for the content of this report.</p>
      <div style="margin-top:22px;font-size:14px;font-weight:600">${esc(D.person)}</div>
      <div style="font-size:14px;color:#7d7a70;margin-top:3px">Submitted digitally on ${D.when.getDate()} ${MONTHS[D.when.getMonth()].slice(0, 3)} ${D.when.getFullYear()} ${String(D.when.getUTCHours()).padStart(2, '0')}:${String(D.when.getUTCMinutes()).padStart(2, '0')} UTC</div></div>
    ${photo('declaration')}`);

  const back = (A) => `<section class="rp-page"><div style="position:absolute;left:0;right:0;top:170px;display:flex;justify-content:center"><img src="${A.logo}" width="260" height="48" alt=""></div>
    <div style="position:absolute;left:50px;right:50px;top:330px;font-size:11.5px;line-height:1.55;color:#4a4a4a">
      <p style="margin-bottom:9px">This report has been generated by C&#8209;MORE from the answers submitted by the reporting company in the ESG Questionnaire, and from the documents it chose to provide.</p>
      <p style="margin-bottom:9px">The reporting company is solely responsible for the accuracy, completeness, lawfulness and reliability of the answers and documents submitted, and for the factual content of this report relating to its own activity. C&#8209;MORE does not verify, audit or independently validate such data.</p>
      <p style="margin-bottom:9px">Answers marked as drafted by ALMA were proposed by C&#8209;MORE's assistant from the documents provided, each with the passage it was read from, and were reviewed by the reporting company before submission.</p>
      <p style="margin-bottom:9px">The ESG score, red flags and action plan are calculated by C&#8209;MORE's scoring model from the submitted answers. They are an indication for the reporting company and its clients, not a certification.</p>
      <p style="margin-bottom:9px">All intellectual property rights relating to the software, its scoring model and this report's structure remain with C&#8209;MORE. The data submitted and the factual content relating to the reporting company remain its property and responsibility.</p></div>
    <div style="position:absolute;left:0;right:0;bottom:52px;text-align:center;font-size:12px;color:#4a4a4a">Software developed by C&#8209;MORE.</div></section>`;

  const build = (A, D) => {
    turn = {};
    const env = D.sections.filter((x) => x.group === 'env'), soc = D.sections.filter((x) => x.group === 'soc'), gov = D.sections.filter((x) => x.group === 'gov');
    return [cover(A, D), contents(A, D), statement(A, D), highlights(A, D),
      divider(A, 'gen', 'General<br>Disclosures', ['Company profile', 'ESG score', 'Documents ALMA read', 'Questionnaire coverage', 'Red flags', 'Action plan']),
      profile(A, D), scorePage(A, D), evidence(A, D), coverage(A, D), flagsPage(A, D), planPage(A, D),
      divider(A, 'env', 'Environmental<br>Metrics', env.map((x) => x.title)), ...env.flatMap((x) => sectionPages(A, D, x)),
      divider(A, 'soc', 'Social<br>Metrics', soc.flatMap((x) => x.groups)), ...soc.flatMap((x) => sectionPages(A, D, x)),
      divider(A, 'gov', 'Governance<br>Metrics', gov.map((x) => x.title)), ...gov.flatMap((x) => sectionPages(A, D, x)),
      declaration(A, D), back(A)];
  };

  // the SVGs, made into pictures first: the PDF maker does not size or style an SVG on its own
  const png = (svg, w, h, k = 4) => new Promise((ok) => {
    const im = new Image();
    im.onload = () => { const cv = document.createElement('canvas'); cv.width = w * k; cv.height = h * k; cv.getContext('2d').drawImage(im, 0, 0, w * k, h * k); ok(cv.toDataURL('image/png')); };
    im.onerror = () => ok(svgUrl(svg));
    im.src = svgUrl(/<svg[^>]*\swidth=/.test(svg) ? svg : svg.replace(/<svg\b/, `<svg width="${w}" height="${h}"`));
  });
  const assets = async () => {
    return { logo: await png(await text('images/cmore-logo.svg'), 284.58, 52.4) };
  };

  return {
    // onStep(done, total) reports progress while the pages are drawn
    // the report as a jsPDF document, with the file name it should have
    async make(onStep) {
      for (const src of LIBS) if (!(src.includes('html2canvas') ? window.html2canvas : window.jspdf)) await load(src);
      const D = gather(), A = await assets();
      const host = document.createElement('div');
      host.style.cssText = `position:absolute;left:-${W * 3}px;top:0;width:${W}px;pointer-events:none`;
      host.innerHTML = `<style>${CSS}</style>` + build(A, D).join('');
      document.body.appendChild(host);
      try {
        await document.fonts.ready;
        await Promise.all([...host.querySelectorAll('img')].map((im) => (im.complete ? 0 : new Promise((ok) => { im.onload = im.onerror = ok; }))));
        const pages = [...host.querySelectorAll('.rp-page')];
        const pdf = new window.jspdf.jsPDF({ orientation: 'landscape', unit: 'px', format: [W, H], hotfixes: ['px_scaling'], compress: true });
        for (let i = 0; i < pages.length; i++) {
          const cv = await window.html2canvas(pages[i], { scale: 1.5, backgroundColor: '#ffffff', logging: false, width: W, height: H, windowWidth: W, windowHeight: H });
          if (i) pdf.addPage([W, H], 'landscape');
          pdf.addImage(cv.toDataURL('image/jpeg', 0.86), 'JPEG', 0, 0, W, H, undefined, 'FAST');
          if (onStep) onStep(i + 1, pages.length);
        }
        const co = D.p.trading || D.p.name || 'Company', name = `${co.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '')}-ESG-report-${D.when.getFullYear()}.pdf`;
        pdf.setProperties({ title: `${co} · ESG report ${D.when.getFullYear()}`, author: co, creator: 'C-MORE' });
        return { pdf, name };
      } finally { host.remove(); }
    },
    // opened in a tab of its own, in the browser's PDF viewer (which has its own download and print).
    // The tab is opened on the click itself, before the pages are drawn, so no popup blocker stops it.
    async open(onStep) {
      const w = window.open('', '_blank');
      if (w) w.document.write('<!doctype html><title>ESG report</title><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;font:15px Figtree,Arial,sans-serif;color:#6e6e6a;background:#f2f1ed">Preparing your report…</body>');
      try {
        const { pdf, name } = await this.make(onStep);
        if (w && !w.closed) w.location.href = URL.createObjectURL(pdf.output('blob'));
        else pdf.save(name); // no tab to show it in: download it instead
      } catch (err) { if (w) w.close(); throw err; }
    },
    // for checking what would be drawn, without downloading anything
    async preview() {
      for (const src of LIBS) if (!(src.includes('html2canvas') ? window.html2canvas : window.jspdf)) await load(src);
      const D = gather(), A = await assets();
      return { html: `<style>${CSS}</style>` + build(A, D).join(''), W, H };
    },
  };
})();
