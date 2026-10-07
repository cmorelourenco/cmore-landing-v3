/* The company's own profile: who it is, where, how to reach it, its logo, and which clients
   may see its documents. Each demo company starts from what the company page shows; edits
   are kept for this tab's session and the company page follows them. */
window.CO_PROFILE = (() => {
  const KEY = 'cm-co-profile';
  const DEFAULTS = {
    miguel: {
      name: 'Ferreira Construction LLC', trading: '', activity: 'General contractor', people: '24', form: 'Delaware LLC', tax: '84-3921745',
      street: '1209 N Market St, Suite 400', city: 'Wilmington', region: 'DE', postcode: '19801', country: 'United States',
      email: 'office@ferreiraconstrucoes.pt', cc: '+1', phone: '(302) 555-0148', website: 'ferreiraconstrucoes.pt',
      logo: 'images/ferreira-logo.webp',
      consents: [
        { name: 'Northgate Facilities', state: 'pending', what: 'general liability, workers’ comp, W‑9', when: 'Asked 2 days ago' },
        { name: 'Bramwell Group', state: 'pending', what: 'everything in Insurance', when: 'Asked 6 days ago' },
        { name: 'Meridian Health', state: 'accepted', what: 'Company & legal, Insurance', when: 'Since 4 Sep 2026' },
      ],
    },
    beatriz: {
      name: 'Veridian Harvest Co.', trading: '', activity: 'Agricultural commodity exporter', people: '60', form: 'Louisiana LLC', tax: '71-4482019',
      street: '400 Poydras St, Suite 1850', city: 'New Orleans', region: 'LA', postcode: '70130', country: 'United States',
      email: 'info@veridianharvest.com', cc: '+1', phone: '(504) 555-0192', website: 'veridianharvest.com',
      logo: 'images/veridian-logo.svg',
      consents: [
        { name: 'Rotterdam Roasters BV', state: 'pending', what: 'EUDR due diligence statements, geolocation data', when: 'Asked 3 days ago' },
        { name: 'Café Direct Hamburg GmbH', state: 'pending', what: 'supplier code of conduct, deforestation risk assessments', when: 'Asked 5 days ago' },
        { name: 'Belgian Cocoa Works NV', state: 'accepted', what: 'Product overview, carbon footprint reports', when: 'Since 12 Aug 2026' },
      ],
    },
  };
  const who = () => document.documentElement.dataset.persona === 'beatriz' ? 'beatriz' : 'miguel';
  const all = () => { try { return JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const load = () => {
    const d = JSON.parse(JSON.stringify(DEFAULTS[who()])), saved = all()[who()] || {};
    return Object.assign(d, saved, { consents: saved.consents || d.consents });
  };
  const save = (p) => { const a = all(); a[who()] = p; try { sessionStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
  // "General contractor · 24 people · EIN 84‑3921745 · Delaware LLC · Wilmington, DE"
  const line = (p) => [p.activity, p.people && `${p.people} people`, p.tax && `EIN ${p.tax.replace(/-/g, '‑')}`, p.form, [p.city, p.region].filter(Boolean).join(', ')].filter(Boolean).join(' · ');
  const today = () => { const d = new Date(); return `Since ${d.getDate()} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()]} ${d.getFullYear()}`; };
  const initials = (n) => n.replace(/\b(LLC|Inc\.?|Co\.?|Ltd\.?|GmbH|BV|NV)\b/gi, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const SAY = { pending: (c) => `Wants to see: ${c.what}. ${c.when}.`, accepted: (c) => `Sees: ${c.what}. ${c.when}.`, declined: (c) => `Asked to see: ${c.what}. You declined.`, stopped: (c) => `Saw: ${c.what}. You stopped sharing.` };
  const manage = () => Object.assign(document.createElement('a'), { className: 'btn co-btn-ghost co-btn-sm', href: 'company-profile.html#consents', textContent: 'Manage' });
  const BADGE = { pending: ['b-pend', 'Pending'], accepted: ['b-ok', 'Accepted'], declined: ['b-neu', 'Declined'], stopped: ['b-neu', 'Stopped'] };

  // the company page: name, line, logo, and the consent rows answered elsewhere
  const applyToCompanyPage = () => {
    const box = document.querySelector(`#filled .co-id-main.persona-${who()}-only`); if (!box) return;
    const p = load();
    box.querySelector('.co-name').textContent = p.trading || p.name;
    box.querySelector('.co-subtle').textContent = line(p);
    if (p.logo && p.logo !== DEFAULTS[who()].logo) {
      const img = Object.assign(new Image(), { className: 'co-logo', src: p.logo, alt: `${p.name} logo`, width: 88, height: 88 });
      box.querySelector('.co-logo').replaceWith(img);
    } else if (!p.logo && DEFAULTS[who()].logo) {
      // no logo any more: the company's initials, as on the profile page
      box.querySelector('.co-logo').replaceWith(Object.assign(document.createElement('span'), { className: 'co-logo co-logo-ini', textContent: initials(p.trading || p.name) }));
    }
    const rows = [...document.querySelectorAll(`#filled .persona-${who()}-only > .co-row`)];
    rows.forEach((row) => {
      const n = row.querySelector('.co-row-n'), name = n && n.firstChild.textContent.trim(), c = p.consents.find((x) => x.name === name); if (!c) return;
      const badge = row.querySelector('.co-badge'); [badge.className, badge.textContent] = ['co-badge ' + BADGE[c.state][0], BADGE[c.state][1]];
      if (c.state !== 'pending') {
        // an answered request is managed on the company profile, like the ones answered before
        const acts = row.querySelector('.co-acts, a.btn'); if (acts) acts.replaceWith(manage());
        row.classList.remove('co-req');
        row.querySelector('.co-row-t > .co-subtle').textContent = SAY[c.state](c);
      }
    });
    // answering on the company page is remembered here too
    rows.forEach((row) => row.querySelectorAll('[data-answer]').forEach((b) => b.addEventListener('click', () => {
      const q = load(), c = q.consents.find((x) => x.name === row.querySelector('.co-row-n').firstChild.textContent.trim()); if (!c) return;
      c.state = b.dataset.answer === 'Accepted' ? 'accepted' : 'declined'; if (c.state === 'accepted') c.when = today(); save(q);
    })));
  };

  return { load, save, line, today, BADGE, SAY, applyToCompanyPage, defaults: () => JSON.parse(JSON.stringify(DEFAULTS[who()])) };
})();
