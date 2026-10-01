
window.__plx = (() => {
// Scroll-driven depth. Elements opt in with data attributes; nothing else is touched.
//   data-plx-y=".4"     drift, in viewport-heights per viewport scrolled: + lags behind (deeper), − runs ahead (nearer)
//   data-plx-x=".1"     horizontal drift, in viewport-widths per viewport scrolled
//   data-plx-scale=".3" grows by this much per viewport scrolled past the centre (shrinks before it)
//   data-plx-rot="12"   degrees per viewport scrolled
//   data-plx-fade="1"   fades out once scrolled past the centre; 1 = gone one viewport later
//   data-plx-fill="60"  fills to N% as it enters: width on a block, stroke-dasharray on a circle with pathLength="100"
// Positions come from offsetTop, which transforms never change, so there is no feedback loop.
// Fully off under prefers-reduced-motion — fills simply sit at their final value.
const SEL = '[data-plx-y],[data-plx-x],[data-plx-scale],[data-plx-rot],[data-plx-fade],[data-plx-fill]';

// Some hosts size html/body to 100% and make BODY the scroller; window.scrollY then never moves.
// Resolve whichever element actually scrolls and read from it.
function scroller() {
  const b = document.body;
  if (b && b.scrollHeight > b.clientHeight + 10 && /(auto|scroll)/.test(getComputedStyle(b).overflowY)) return b;
  return document.scrollingElement || document.documentElement;
}
const scrollTop = () => { const s = scroller(); return s === document.body ? s.scrollTop : (window.scrollY || s.scrollTop || 0); };
const scrollRange = () => scroller().scrollHeight;
function onScroll(fn) {
  addEventListener('scroll', fn, { passive: true });
  document.body.addEventListener('scroll', fn, { passive: true });
  return () => { removeEventListener('scroll', fn); document.body.removeEventListener('scroll', fn); };
}

function mountParallax(opts = {}) {
  let intensity = opts.intensity ?? 1, els = [], meta = new Map(), raf = 0, n = 0, alive = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const hostOf = (el) => (el instanceof SVGElement ? (el.ownerSVGElement || el).parentElement : el);
  const top = (el) => { let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop; return y; };
  const collect = () => {
    els = Array.from(document.querySelectorAll(SEL));
    meta = new Map(els.map((el) => { const h = hostOf(el); return [el, { top: top(h), h: h.offsetHeight }]; }));
  };
  const frame = () => {
    raf = 0; if (!alive) return;
    if (n++ % 120 === 0) collect();
    const vh = innerHeight, vw = innerWidth, sy = scrollTop();
    // A window that cannot scroll at all (a canvas sized to the whole page) would freeze depth at its extremes: rest flat there.
    const flat = reduced || scrollRange() - vh < 40;
    for (const el of els) {
      const m = meta.get(el), ds = el.dataset;
      const d = (sy + vh / 2 - (m.top + m.h / 2)) / vh;
      const t = clamp((sy + vh - m.top) / (vh * 0.6), 0, 1);
      if (ds.plxY !== undefined || ds.plxX !== undefined || ds.plxScale !== undefined || ds.plxRot !== undefined) {
        if (flat) { if (el.style.transform) el.style.transform = ''; }
        else {
          const y = d * (+ds.plxY || 0) * vh * intensity, x = d * (+ds.plxX || 0) * vw * intensity;
          let tr = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
          if (ds.plxScale !== undefined) tr += ` scale(${Math.max(0.05, 1 + d * +ds.plxScale * intensity).toFixed(3)})`;
          if (ds.plxRot !== undefined) tr += ` rotate(${(d * +ds.plxRot * intensity).toFixed(2)}deg)`;
          el.style.transform = tr;
        }
      }
      if (ds.plxFade !== undefined) el.style.opacity = flat ? '' : (1 - clamp(d * +ds.plxFade, 0, 1)).toFixed(3);
      if (ds.plxFill !== undefined) {
        const v = +ds.plxFill * (flat ? 1 : t);
        if (el.tagName.toLowerCase() === 'circle') el.setAttribute('stroke-dasharray', v.toFixed(2) + ' 100');
        else el.style.width = v.toFixed(2) + '%';
      }
    }
  };
  const tick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const refresh = () => { collect(); tick(); };
  const off = onScroll(tick);
  addEventListener('resize', refresh);
  const timers = [300, 1000, 2500, 5000].map((ms) => setTimeout(refresh, ms));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  refresh();
  return {
    refresh,
    setIntensity(v) { intensity = v; tick(); },
    destroy() {
      alive = false; off(); removeEventListener('resize', refresh); timers.forEach(clearTimeout);
      if (raf) cancelAnimationFrame(raf);
    },
  };
}

return { mountParallax, scroller, scrollTop, scrollRange, onScroll };
})();
window.__network = (() => {
const { scrollTop, scrollRange, onScroll } = window.__plx;
// The ecosystem behind Option A. One fixed canvas; four layers of company nodes, each layer scrolling at its
// own speed so the network has depth; links join near neighbours and stretch where the layers part.
// The canvas also paints the graphite bands ([data-band="invert"] sections), so the network shows through
// them with the ink reversed. One coral pulse travels the links — the single activation moment in any
// viewport it crosses.
const LABELS = ['Client', 'Bank', 'Auditor', 'Insurer', 'Supplier', 'Regulator', 'Partner', 'Subsidiary', 'Contract', 'Invoice',
  'Permission', 'Certificate', 'Policy', 'Licence', 'Questionnaire', 'Board minutes', 'Tax filing', 'NDA', 'Statutes', 'Mandate'];
const LAYERS = [
  { v: 0.32, size: 3, alpha: 0.3, per: 6, label: false },
  { v: 0.58, size: 4, alpha: 0.48, per: 6, label: false },
  { v: 0.88, size: 6, alpha: 0.7, per: 5, label: true },
  { v: 1.22, size: 8, alpha: 0.95, per: 4, label: true },
];



function mountNetwork(canvas, opts = {}) {
  const o = Object.assign({ ink: '#343434', inkInvert: '#fafafa', coral: '#f46d4f', band: '#343434', labels: true, intensity: 1, visible: true }, opts);
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, docH = 0, nodes = [], links = [], adj = [], pulse = null, raf = 0, last = performance.now(), alive = true, tick = 0;
  const rnd = (s) => () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const speed = (v) => 1 + (v - 1) * o.intensity;

  function build() {
    W = innerWidth; H = innerHeight; dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    docH = Math.max(scrollRange(), H);
    const span = docH + H, r = rnd(11);
    nodes = [];
    LAYERS.forEach((L, li) => {
      const n = Math.round(L.per * L.v * span / H); // slow layers stay on screen longer, so fewer are needed for the same density
      for (let i = 0; i < n; i++) {
        nodes.push({ x: (0.03 + 0.94 * r()) * W, s0: -H + r() * span, v: L.v, li, size: L.size, alpha: L.alpha,
          label: L.label && o.labels && r() < 0.5 ? LABELS[Math.floor(r() * LABELS.length)] : null, cross: r() < 0.55 });
      }
    });
    links = []; adj = nodes.map(() => []);
    const seen = new Set();
    const add = (a, b) => { const k = a < b ? a + ':' + b : b + ':' + a; if (seen.has(k)) return; seen.add(k); links.push([a, b]); adj[a].push(links.length - 1); adj[b].push(links.length - 1); };
    nodes.forEach((a, i) => {
      const c = [];
      nodes.forEach((b, j) => { if (i === j) return; const d = Math.hypot(b.x - a.x, (b.s0 - a.s0) * b.v); if (d < H * 0.8) c.push({ j, d, same: b.li === a.li }); });
      c.sort((p, q) => p.d - q.d);
      let same = 0, cross = 0;
      for (const k of c) {
        if (k.same && same < 2) { add(i, k.j); same++; }
        else if (!k.same && cross < 1 && a.cross) { add(i, k.j); cross++; }
        if (same >= 2 && cross >= 1) break;
      }
    });
    pulse = null;
  }

  const P = (nd, sy) => ({ x: nd.x, y: H / 2 + (nd.s0 - sy) * speed(nd.v) });

  function draw(now) {
    raf = 0; if (!alive) return;
    const dt = Math.min(50, now - last); last = now;
    if (innerWidth !== W || innerHeight !== H) build();
    else if (++tick % 60 === 0) { const h = scrollRange(); if (Math.abs(h - docH) > 24) build(); }
    const sy = scrollTop();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const bands = [];
    document.querySelectorAll('[data-band="invert"]').forEach((el) => {
      if (el.style.backgroundColor !== 'transparent') el.style.backgroundColor = 'transparent';
      bands.push(el.getBoundingClientRect());
    });
    ctx.fillStyle = o.band; bands.forEach((b) => ctx.fillRect(0, b.top, W, b.height));
    if (o.visible) {
      const dark = (y) => bands.some((b) => y >= b.top && y <= b.bottom);
      const pts = nodes.map((nd) => P(nd, sy));
      ctx.lineWidth = 1;
      links.forEach(([a, b]) => {
        const p = pts[a], q = pts[b];
        if ((p.y < -60 && q.y < -60) || (p.y > H + 60 && q.y > H + 60)) return;
        const al = 0.09 + 0.05 * Math.min(nodes[a].li, nodes[b].li);
        ctx.strokeStyle = dark((p.y + q.y) / 2) ? `rgba(250,250,250,${al})` : `rgba(52,52,52,${al})`;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      });
      ctx.font = '600 11px Figtree, Arial, sans-serif'; ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '0.09em';
      nodes.forEach((nd, i) => {
        const p = pts[i]; if (p.y < -20 || p.y > H + 20) return;
        const s = nd.size;
        ctx.globalAlpha = nd.alpha; ctx.fillStyle = dark(p.y) ? o.inkInvert : o.ink;
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        if (nd.label) { ctx.globalAlpha = Math.min(1, nd.alpha + 0.05); ctx.fillText(nd.label.toUpperCase(), p.x + s / 2 + 10, p.y + 0.5); }
      });
      ctx.globalAlpha = 1;
      if (!reduced && links.length) {
        const onScreen = (li) => { const [a, b] = links[li]; const m = (pts[a].y + pts[b].y) / 2; return m > 0 && m < H; };
        if (!pulse || !onScreen(pulse.li)) {
          const vis = []; links.forEach((_, i) => { if (onScreen(i)) vis.push(i); });
          pulse = vis.length ? { li: vis[Math.floor(Math.random() * vis.length)], t: 0, dir: 1 } : null;
        }
        if (pulse) {
          pulse.t += dt / 1500;
          const [a, b] = links[pulse.li], from = pulse.dir > 0 ? pts[a] : pts[b], to = pulse.dir > 0 ? pts[b] : pts[a];
          const k = Math.min(1, pulse.t), e = k * k * (3 - 2 * k);
          ctx.fillStyle = o.coral; ctx.fillRect(from.x + (to.x - from.x) * e - 4, from.y + (to.y - from.y) * e - 4, 8, 8);
          if (pulse.t >= 1) {
            const at = pulse.dir > 0 ? b : a, next = adj[at].filter((li) => li !== pulse.li);
            if (next.length) { const li = next[Math.floor(Math.random() * next.length)]; pulse = { li, t: 0, dir: links[li][0] === at ? 1 : -1 }; }
            else pulse = null;
          }
        }
      }
    }
    if (!reduced) raf = requestAnimationFrame(draw);
  }
  const once = () => { if (!raf) raf = requestAnimationFrame(draw); };
  const onResize = () => { build(); once(); };
  build(); once();
  addEventListener('resize', onResize);
  const offScroll = reduced ? onScroll(once) : () => {};
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(once);
  return {
    set(next) { const relabel = next.labels !== undefined && next.labels !== o.labels; Object.assign(o, next); if (relabel) build(); once(); },
    destroy() {
      alive = false; if (raf) cancelAnimationFrame(raf);
      removeEventListener('resize', onResize); offScroll();
      document.querySelectorAll('[data-band="invert"]').forEach((el) => { el.style.backgroundColor = ''; });
    },
  };
}

return { mountNetwork };
})();
window.__sphere = (() => {
const { scrollTop, onScroll } = window.__plx;
// The cloud of data behind Option B: points on a sphere joined to their nearest neighbours, turned by the
// scroll and nudged by the pointer. Monochrome on purpose; one point is coral, starts on the far side and
// comes round as you scroll — the risk you can't see.


function mountSphere(canvas, opts = {}) {
  const o = Object.assign({ n: 420, k: 3, ink: '52,52,52', coral: '#f46d4f', coralPoint: true, scrollRot: 0.0022, drift: 0.00009,
    pointer: 0.5, tilt: 0.28, radius: 0.44, lineAlpha: 0.3, lineBase: 0.04, dotAlpha: 1, intensity: 1,
    inkInvert: '250,250,250', band: '#343434', bandSelector: '', bandOnly: false, darkBoost: 3, anchor: null, plxY: 0, plxScale: 0, centerSel: '', centerZoom: 1, centerBias: 0, inkOpacity: 1, inkOpacityMobile: 0, radiusMobile: 0,
    // opt-in: colour the one distinct point, make it pulse, and start it at a set angle from facing you
    pointColor: '', pulse: false, pointAngle: null, pointSize: 10 }, opts);
  const ctx = canvas.getContext('2d');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mqSmall = matchMedia('(max-width: 768px)');
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pts = [];
  for (let i = 0; i < o.n; i++) { const y = 1 - (i / (o.n - 1)) * 2, r = Math.sqrt(1 - y * y), t = golden * i; pts.push([Math.cos(t) * r, y, Math.sin(t) * r]); }
  const edges = [], seen = new Set();
  pts.forEach((p, i) => {
    pts.map((q, j) => [j === i ? 9 : (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2, j])
      .sort((a, b) => a[0] - b[0]).slice(0, o.k)
      .forEach(([, j]) => { const key = i < j ? i + ':' + j : j + ':' + i; if (!seen.has(key)) { seen.add(key); edges.push([i, j]); } });
  });
  // The coral point sits on the equator; find the turn that puts it at the back to start.
  const ci = Math.floor(o.n / 2);
  let phase = 0, zmin = 9;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 180) { const z = -pts[ci][0] * Math.sin(a) + pts[ci][2] * Math.cos(a); if (z < zmin) { zmin = z; phase = a; } }
  // pointAngle: start from the turn that faces it towards you instead, offset by that many radians,
  // and count the drift from now so where it starts does not depend on how long the page has been open
  const fromMount = o.pointAngle != null, t0 = performance.now();
  if (fromMount) phase += Math.PI + o.pointAngle;

  let W = 0, H = 0, dpr = 1, raf = 0, alive = true, mx = 0, my = 0, tx = 0, ty = 0;
  const size = () => { W = Math.max(1, canvas.clientWidth); H = Math.max(1, canvas.clientHeight); dpr = Math.min(2, devicePixelRatio || 1); canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); };
  const onMove = (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; };

  function draw(now) {
    raf = 0; if (!alive) return;
    if (canvas.clientWidth !== W || canvas.clientHeight !== H) size();
    mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
    const ay = phase + (reduced ? 0 : (fromMount ? now - t0 : now) * o.drift) + scrollTop() * o.scrollRot * o.intensity + mx * o.pointer;
    const ax = 0.3 + my * o.tilt;
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    let ox = W / 2, oy = H / 2, zoom = 1;
    if (o.centerSel) {
      const ce = document.querySelector(o.centerSel);
      if (ce) { const cr = ce.getBoundingClientRect(); ox = W / 2; oy = cr.top + o.centerBias * H; }
      zoom = o.centerZoom;
    } else if (o.anchor) {
      const sy = scrollTop(), dd = sy / H;
      oy = H / 2 + sy * (o.plxY - 1) * o.intensity;
      zoom = Math.max(0.05, 1 + dd * o.plxScale * o.intensity);
    }
    const rad = (o.radiusMobile && mqSmall.matches) ? o.radiusMobile : o.radius;
    const R = Math.min(W, H) * rad * zoom, f = 2.4;
    const pr = pts.map(([x, y, z]) => {
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const s = f / (f - z2);
      return { x: ox + x1 * R * s, y: oy - y1 * R * s, d: (z2 + 1) / 2, s };
    });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const bands = [];
    if (o.bandSelector) document.querySelectorAll(o.bandSelector).forEach((el) => {
      if (el.style.backgroundColor !== 'transparent') el.style.backgroundColor = 'transparent';
      const b = el.getBoundingClientRect(); if (b.bottom > 0 && b.top < H) bands.push(b);
    });
    if (o.bandOnly && !bands.length) { if (!reduced) raf = requestAnimationFrame(draw); return; }
    if (o.bandOnly) {
      ctx.save(); ctx.beginPath();
      bands.forEach((b) => ctx.rect(0, b.top, W, b.height));
      ctx.clip();
      ctx.fillStyle = o.band; bands.forEach((b) => ctx.fillRect(0, b.top, W, b.height));
    }
    const io = (o.inkOpacityMobile && mqSmall.matches) ? o.inkOpacityMobile : o.inkOpacity;
    ctx.globalAlpha = io;
    const useInk = o.bandOnly ? o.inkInvert : o.ink;
    const bst = o.bandOnly ? o.darkBoost : 1;
    ctx.lineWidth = 1;
    edges.forEach(([a, b]) => {
      const p = pr[a], q = pr[b], d = (p.d + q.d) / 2;
      ctx.strokeStyle = `rgba(${useInk},${Math.min(1, (o.lineBase + o.lineAlpha * d * d) * bst).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    });
    pr.map((p, i) => i).sort((a, b) => pr[a].d - pr[b].d).forEach((i) => {
      const p = pr[i];
      if (o.coralPoint && i === ci) {
        let s = o.pointSize * p.s;
        const col = o.pointColor || `rgb(${useInk})`;
        if (o.pulse && !reduced) {
          // a heartbeat: the square swells a little, and a ring opens out of it and fades
          const t = ((now - t0) % 2400) / 2400;
          s *= 1 + 0.2 * Math.sin(t * Math.PI * 2);
          const rs = s * (1.3 + t * 3.8);
          ctx.globalAlpha = (o.pointColor ? 1 : io) * 0.95 * (1 - t) ** 0.7; ctx.strokeStyle = col; ctx.lineWidth = 3;
          ctx.strokeRect(p.x - rs / 2, p.y - rs / 2, rs, rs);
        }
        ctx.globalAlpha = o.pointColor ? 1 : io * (0.5 + 0.5 * p.d); ctx.fillStyle = col;
        // a coloured point keeps full strength even where the web is softened
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s); ctx.globalAlpha = io; return;
      }
      const s = (1.4 + 2.4 * p.d) * p.s;
      ctx.fillStyle = `rgba(${useInk},${Math.min(1, (0.14 + 0.86 * p.d) * o.dotAlpha * bst).toFixed(3)})`;
      ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
    });
    ctx.globalAlpha = 1;
    if (o.bandOnly) ctx.restore();
    if (!reduced) raf = requestAnimationFrame(draw);
  }
  const once = () => { if (!raf) raf = requestAnimationFrame(draw); };
  size(); once();
  addEventListener('resize', once);
  if (o.pointer && !reduced) addEventListener('mousemove', onMove, { passive: true });
  const offScroll = reduced ? onScroll(once) : () => {};
  return {
    set(next) { Object.assign(o, next); once(); },
    destroy() { alive = false; if (raf) cancelAnimationFrame(raf); removeEventListener('resize', once); removeEventListener('mousemove', onMove); offScroll();
      if (o.bandSelector) document.querySelectorAll(o.bandSelector).forEach((el) => { el.style.backgroundColor = ''; }); },
  };
}

return { mountSphere };
})();
