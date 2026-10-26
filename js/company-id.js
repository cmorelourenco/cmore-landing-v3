/* How a company is identified, country by country. Sign-up (register.html) and adding a company
   (new-company.html) both start with it: the country, then the company's number in that
   country's terms (a NIPC in Portugal, a SIREN in France, an EIN in the US…; elsewhere in the EU
   its VAT number), each with its example, its format and its check digit where it has one. ALMA
   then looks for it on C-MORE: a company already here can only be asked to let you in, and shows
   nothing but its logo and name.
   window.CMCompanyId: rule(country) → [name, example, looks like, check, has check digit, register],
   NAMES, options(), clean(c, v), shown(c, v), plain(c, v), label(c), field(c), find(c, v).
   Prototype: the registers aren't contacted; C-MORE's companies are the demo's. */
window.CMCompanyId = (() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const luhn = (d) => [...d].reverse().reduce((a, c, i) => { let n = +c; if (i % 2) { n *= 2; if (n > 9) n -= 9; } return a + n; }, 0) % 10 === 0;
  const ptOk = (d) => { if (!/^[1235689]\d{8}$/.test(d)) return false; const r = [...d.slice(0, 8)].reduce((a, c, i) => a + c * (9 - i), 0) % 11; return +d[8] === (r < 2 ? 0 : 11 - r); };
  const itOk = (d) => { const s = [...d.slice(0, 10)].reduce((a, c, i) => { let n = +c; if (i % 2) { n *= 2; if (n > 9) n -= 9; } return a + n; }, 0); return (10 - (s % 10)) % 10 === +d[10]; };
  const beOk = (d) => 97 - (+d.slice(0, 8) % 97) === +d.slice(8);
  // [name of the number, example, what it looks like, the check, has a check digit, the register]
  const ID = {
    PT: ['NIPC', '516 482 300', 'nine digits', (v) => /^\d{9}$/.test(v) && ptOk(v), true, 'the Portuguese business register'],
    ES: ['NIF', 'B12345674', 'a letter, seven digits and a control character', (v) => /^[A-HJNP-SUVW]\d{7}[0-9A-J]$/.test(v), true, 'the Registro Mercantil'],
    FR: ['SIREN', '732 829 320', 'nine digits', (v) => /^\d{9}$/.test(v) && luhn(v), true, 'the Sirene register'],
    DE: ['Handelsregister number', 'HRB 123456', 'HRA or HRB and its number', (v) => /^HR[AB]\d{3,6}[A-Z]?$/.test(v), false, 'the Handelsregister'],
    IT: ['Partita IVA', '01234567897', 'eleven digits', (v) => /^\d{11}$/.test(v) && itOk(v), true, 'the Registro delle Imprese'],
    NL: ['KvK number', '12345678', 'eight digits', (v) => /^\d{8}$/.test(v), false, 'the KvK business register'],
    BE: ['enterprise number', '0403 170 701', 'ten digits, starting with 0 or 1', (v) => /^[01]\d{9}$/.test(v) && beOk(v), true, 'the Crossroads Bank for Enterprises'],
    IE: ['CRO number', '123456', 'up to six digits', (v) => /^\d{4,6}$/.test(v), false, 'the CRO register'],
    GB: ['company number', '01234567', 'eight digits, or two letters and six digits', (v) => /^(\d{8}|[A-Z]{2}\d{6})$/.test(v), false, 'Companies House'],
    US: ['EIN', '12-3456789', 'nine digits', (v) => /^\d{9}$/.test(v), false, 'the IRS records'],
  };
  const EU = { AT: 'Austria', BG: 'Bulgaria', HR: 'Croatia', CY: 'Cyprus', CZ: 'Czechia', DK: 'Denmark', EE: 'Estonia', FI: 'Finland', GR: 'Greece', HU: 'Hungary', LV: 'Latvia',
    LT: 'Lithuania', LU: 'Luxembourg', MT: 'Malta', PL: 'Poland', RO: 'Romania', SK: 'Slovakia', SI: 'Slovenia', SE: 'Sweden' };
  const MAIN = ['PT', 'ES', 'FR', 'DE', 'IT', 'NL', 'BE', 'IE', 'GB', 'US'];
  const NAMES = Object.assign({ PT: 'Portugal', ES: 'Spain', FR: 'France', DE: 'Germany', IT: 'Italy', NL: 'Netherlands', BE: 'Belgium', IE: 'Ireland', GB: 'United Kingdom', US: 'United States' }, EU);
  // the rest of the EU: the VAT number, with or without its country prefix
  const rule = (c) => ID[c] || ['VAT number', `${c === 'GR' ? 'EL' : c}123456789`, '8 to 12 characters, with or without the country code', (v) => /^[A-Z0-9]{8,12}$/.test(v.replace(new RegExp('^' + (c === 'GR' ? 'EL' : c)), '')), false, 'VIES, the EU&rsquo;s VAT register'];
  const label = (c) => { const r = rule(c); return r[0].charAt(0).toUpperCase() + r[0].slice(1); };
  // the field's label: "Company NIPC", "Company SIREN"… (the UK's is already "company number")
  const field = (c) => (/^company /.test(rule(c)[0]) ? label(c) : `Company ${rule(c)[0]}`);
  const options = () => MAIN.map((c) => `<option value="${c}">${NAMES[c]}</option>`).join('')
    + `<optgroup label="Elsewhere in the EU">${Object.entries(EU).sort((a, b) => a[1].localeCompare(b[1])).map(([c, n]) => `<option value="${c}">${n}</option>`).join('')}</optgroup>`;
  // what was typed, as the register keeps it; and back again, the way people write it
  const clean = (c, v) => { const x = String(v).toUpperCase().replace(/[\s.\-\/]/g, ''); return c === 'PT' && /^PT\d{9}$/.test(x) ? x.slice(2) : x; };
  const plain = (c, v) => (c === 'PT' || c === 'FR' ? v.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3') : c === 'BE' ? v.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3') : c === 'US' ? v.replace(/^(\d{2})(\d{7})$/, '$1-$2') : c === 'DE' ? v.replace(/^(HR[AB])/, '$1 ') : v);
  const shown = (c, v) => esc(plain(c, v)).replace(/^(\d{2})-(\d{7})$/, '$1&#8209;$2');
  // the companies already on C-MORE: only a logo and a name, nothing that would help someone fish
  const ON_CMORE = {
    'PT:514228930': { name: 'Ferreira Constru&ccedil;&otilde;es, Lda.', logo: 'images/ferreira-logo.webp', home: 'miguel' },
    'US:714482019': { name: 'Veridian Harvest Co.', logo: 'images/veridian-logo.svg', home: 'beatriz' },
  };
  const find = (c, v) => ON_CMORE[`${c}:${clean(c, v)}`] || null;
  return { rule, label, field, NAMES, options, clean, plain, shown, find };
})();
