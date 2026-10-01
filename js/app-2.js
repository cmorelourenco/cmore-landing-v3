/* @ds-bundle: {"format":4,"namespace":"CMOREDesignSystem_9bac62","components":[{"name":"Badge","sourcePath":"components/actions/Badge.jsx"},{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Callout","sourcePath":"components/actions/Callout.jsx"},{"name":"Tooltip","sourcePath":"components/actions/Tooltip.jsx"},{"name":"Brand","sourcePath":"components/brand/Brand.jsx"},{"name":"Eyebrow","sourcePath":"components/brand/Eyebrow.jsx"},{"name":"Icon","sourcePath":"components/brand/Icon.jsx"},{"name":"IconPlate","sourcePath":"components/brand/IconPlate.jsx"},{"name":"PixelArrow","sourcePath":"components/brand/PixelArrow.jsx"},{"name":"ProgressUnits","sourcePath":"components/brand/ProgressUnits.jsx"},{"name":"Spinner","sourcePath":"components/brand/Spinner.jsx"},{"name":"Stat","sourcePath":"components/brand/Stat.jsx"},{"name":"Swatch","sourcePath":"components/brand/Swatch.jsx"},{"name":"Card","sourcePath":"components/content/Card.jsx"},{"name":"Display","sourcePath":"components/content/Display.jsx"},{"name":"Lead","sourcePath":"components/content/Lead.jsx"},{"name":"Section","sourcePath":"components/content/Section.jsx"},{"name":"Separator","sourcePath":"components/content/Separator.jsx"},{"name":"Tile","sourcePath":"components/content/Tile.jsx"},{"name":"Avatar","sourcePath":"components/data/Avatar.jsx"},{"name":"AvatarGroup","sourcePath":"components/data/AvatarGroup.jsx"},{"name":"Profile","sourcePath":"components/data/Profile.jsx"},{"name":"Table","sourcePath":"components/data/Table.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"RadioGroup","sourcePath":"components/forms/RadioGroup.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Breadcrumbs","sourcePath":"components/navigation/Breadcrumbs.jsx"},{"name":"CTA","sourcePath":"components/navigation/CTA.jsx"},{"name":"Dropdown","sourcePath":"components/navigation/Dropdown.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"Modal","sourcePath":"components/navigation/Modal.jsx"},{"name":"Navbar","sourcePath":"components/navigation/Navbar.jsx"},{"name":"Navlist","sourcePath":"components/navigation/Navlist.jsx"},{"name":"Toast","sourcePath":"components/navigation/Toast.jsx"}],"sourceHashes":{"components/actions/Badge.jsx":"a799ee9f9c67","components/actions/Button.jsx":"20d9dcf281ee","components/actions/Callout.jsx":"d04ea6f36a21","components/actions/Tooltip.jsx":"86eaa610846e","components/brand/Brand.jsx":"c3de9765b46b","components/brand/Eyebrow.jsx":"a26fdda3abba","components/brand/Icon.jsx":"1aa5bea1df09","components/brand/IconPlate.jsx":"dbff32ea1821","components/brand/PixelArrow.jsx":"16095bc64759","components/brand/ProgressUnits.jsx":"029ca2b4d8df","components/brand/Spinner.jsx":"938388660857","components/brand/Stat.jsx":"7dc330bb880b","components/brand/Swatch.jsx":"60b9417d6bf8","components/content/Card.jsx":"c8672264752a","components/content/Display.jsx":"162f809e1421","components/content/Lead.jsx":"5996c5d9e84a","components/content/Section.jsx":"ccdabece673f","components/content/Separator.jsx":"ddffc2a2c002","components/content/Tile.jsx":"ca6f5aa2e10c","components/data/Avatar.jsx":"ab0584c0fc51","components/data/AvatarGroup.jsx":"0505824b4a82","components/data/Profile.jsx":"9b036a3a1ff5","components/data/Table.jsx":"51d149c2d2c5","components/forms/Checkbox.jsx":"52098a07de4c","components/forms/Field.jsx":"d9a4183a3bfb","components/forms/Input.jsx":"56b667059a9d","components/forms/Radio.jsx":"27ff622e92cd","components/forms/RadioGroup.jsx":"c86a45543034","components/forms/Select.jsx":"0ea48fcf6330","components/forms/Switch.jsx":"28a89da7c5d0","components/forms/Textarea.jsx":"94b70b7d534d","components/navigation/Breadcrumbs.jsx":"82b7b0d2c4e7","components/navigation/CTA.jsx":"4eda690ff559","components/navigation/Dropdown.jsx":"9389df9f46e9","components/navigation/Footer.jsx":"4cb45bc6dca1","components/navigation/Modal.jsx":"b63adb159c0e","components/navigation/Navbar.jsx":"34e0f08e9135","components/navigation/Navlist.jsx":"e55e060e1235","components/navigation/Toast.jsx":"28ccfead3455","ui_kits/marketing/Features.jsx":"ae7a98c4f158","ui_kits/marketing/Hero.jsx":"2d0b9fd90bc0","ui_kits/marketing/Proof.jsx":"f9ed9e4c4703","ui_kits/marketing/Site.jsx":"21cbabea0ebd","ui_kits/workspace/App.jsx":"cbed829d543e","ui_kits/workspace/AppShell.jsx":"5c124fb6e6b8","ui_kits/workspace/Overview.jsx":"7b07c9a89e9c","ui_kits/workspace/Settings.jsx":"b4cf8f1d4c52","ui_kits/workspace/SupplierDetail.jsx":"a767184b1b95","ui_kits/workspace/Suppliers.jsx":"fb9b521b59d5","ui_kits/workspace/data.js":"0d500e7cd278"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CMOREDesignSystem_9bac62 = window.CMOREDesignSystem_9bac62 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Status in a pill. solid is the neutral weight (sand-800, not 600 — 600 was
   light enough that white on it read as washed); the colours are the derived
   status palette, since the brand ships none. */
function Badge({
  variant = 'outline',
  color = 'neutral',
  size = 'base',
  icon,
  className = '',
  children,
  ...rest
}) {
  const pads = {
    sm: ['0.0625rem', '0.5rem', '0.6875rem'],
    base: ['0.1875rem', '0.625rem', '0.75rem'],
    lg: ['0.3125rem', '0.75rem', '0.8125rem']
  };
  const [py, px, fs] = pads[size] || pads.base;
  const tints = {
    neutral: ['var(--color-surface-sunken)', 'var(--color-ink)'],
    positive: ['var(--color-positive-subtle)', 'var(--color-positive)'],
    caution: ['var(--color-caution-subtle)', 'var(--color-caution)'],
    critical: ['var(--color-critical-subtle)', 'var(--color-critical)'],
    informative: ['var(--color-informative-subtle)', 'var(--color-informative)'],
    activation: ['var(--color-activation-subtle)', 'var(--color-graphite)']
  };
  const [bg, fg] = tints[color] || tints.neutral;
  const solid = variant === 'solid';
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: py + ' ' + px,
      fontSize: fs,
      fontWeight: 600,
      lineHeight: 1.4,
      borderRadius: 'var(--radius-pill)',
      whiteSpace: 'nowrap',
      backgroundColor: solid ? 'var(--color-sand-800)' : bg,
      color: solid ? 'var(--color-off-white)' : fg,
      border: variant === 'outline' ? '1px solid transparent' : undefined
    }
  }, rest), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Badge.jsx", error: String((e && e.message) || e) }); }

// components/actions/Tooltip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Hover/focus label. Graphite plate, off-white text — 12.5:1. kbd shows a
   keyboard hint alongside the copy. */
function Tooltip({
  content,
  position = 'top',
  kbd,
  children,
  className = '',
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const pos = {
    top: {
      bottom: '100%',
      left: '50%',
      transform: 'translate(-50%, -0.5rem)'
    },
    bottom: {
      top: '100%',
      left: '50%',
      transform: 'translate(-50%, 0.5rem)'
    },
    left: {
      right: '100%',
      top: '50%',
      transform: 'translate(-0.5rem, -50%)'
    },
    right: {
      left: '100%',
      top: '50%',
      transform: 'translate(0.5rem, -50%)'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      position: 'relative',
      display: 'inline-flex'
    },
    onMouseEnter: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
    onFocus: () => setOpen(true),
    onBlur: () => setOpen(false)
  }, rest), children, open && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: 'absolute',
      zIndex: 60,
      ...pos[position],
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.375rem 0.625rem',
      borderRadius: 'var(--radius-sm)',
      backgroundColor: 'var(--color-graphite)',
      color: 'var(--color-off-white)',
      fontSize: 'var(--text-tiny)',
      fontWeight: 500,
      whiteSpace: 'nowrap',
      boxShadow: 'var(--shadow-floating)'
    }
  }, content, kbd && /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6875rem',
      opacity: 0.7
    }
  }, kbd)));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/brand/Brand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The wordmark, type-only lockup. Inherits currentColor so it is correct on
   both the beige ground and the Graphite backdrop. The dash between C and
   MORE carries the activation colour. No logo file was supplied with the
   source repository — this type lockup is the mark. */
function Brand({
  size = 'base',
  href = '#',
  as = 'a',
  className = '',
  style,
  ...rest
}) {
  const Tag = as;
  const sizes = {
    base: '1.25rem',
    lg: '1.5rem',
    xl: '2rem'
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: as === 'a' ? href : undefined,
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '1px',
      fontFamily: 'var(--font-display)',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      fontSize: sizes[size] || sizes.base,
      color: 'inherit',
      textDecoration: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", null, "C"), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--color-activation)'
    }
  }, "\u2013"), /*#__PURE__*/React.createElement("span", null, "MORE"));
}
Object.assign(__ds_scope, { Brand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Brand.jsx", error: String((e && e.message) || e) }); }

// components/brand/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The small uppercase label above nearly every C-MORE section title. Carries
   a coral tick, so the 15% activation budget is spent in a controlled place. */
function Eyebrow({
  tick = true,
  children,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("p", _extends({
    className: ['eyebrow', className].filter(Boolean).join(' '),
    style: style
  }, rest), tick && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-block',
      width: '0.375rem',
      height: '0.375rem',
      borderRadius: '9999px',
      backgroundColor: 'var(--color-coral)',
      flex: 'none'
    }
  }), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/brand/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Heroicons, 24px outline — the set the source product renders (Flux's
   <flux:icon> is Heroicons underneath), and the one the brand manual's icon
   rule lands on: a 32px artboard with a 2pt stroke is stroke-width 1.5 at
   24px. Icons inform; they are never decorative.

   The glyph is fetched once per name from the Heroicons CDN and inlined as
   real SVG, so it inherits currentColor and survives DOM-rasterised capture
   (a CSS mask would not). Results are cached across every instance. */
const CACHE = new Map();
function load(url) {
  if (!CACHE.has(url)) {
    CACHE.set(url, fetch(url).then(r => r.ok ? r.text() : '').catch(() => ''));
  }
  return CACHE.get(url);
}
function Icon({
  name,
  size = 24,
  variant = 'outline',
  className = '',
  style,
  ...rest
}) {
  const url = 'https://unpkg.com/heroicons@2.1.5/24/' + variant + '/' + name + '.svg';
  const [markup, setMarkup] = React.useState('');
  React.useEffect(() => {
    let live = true;
    load(url).then(svg => {
      if (live) setMarkup(svg);
    });
    return () => {
      live = false;
    };
  }, [url]);
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    className: ['cm-icon', className].filter(Boolean).join(' '),
    style: {
      display: 'inline-flex',
      flex: 'none',
      width: size,
      height: size,
      color: 'inherit',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: markup
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* A boxed message. Neutral by default; the three states use the derived
   status palette. Hairline first, tint second — the brand is flat. */
function Callout({
  variant = 'neutral',
  icon,
  heading,
  children,
  className = '',
  ...rest
}) {
  const map = {
    neutral: ['var(--color-surface-sunken)', 'var(--color-line)', 'var(--color-ink)', 'information-circle'],
    success: ['var(--color-positive-subtle)', 'var(--color-positive)', 'var(--color-positive)', 'check-circle'],
    warning: ['var(--color-caution-subtle)', 'var(--color-caution)', 'var(--color-caution)', 'exclamation-triangle'],
    danger: ['var(--color-critical-subtle)', 'var(--color-critical)', 'var(--color-critical)', 'x-circle']
  };
  const [bg, border, accent, defIcon] = map[variant] || map.neutral;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    role: "note",
    style: {
      display: 'flex',
      gap: '0.875rem',
      padding: '1rem 1.125rem',
      backgroundColor: bg,
      border: '1px solid ' + border,
      borderRadius: 'var(--radius-md)'
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: accent,
      flex: 'none',
      marginTop: '0.0625rem'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon || defIcon,
    size: 20,
    className: "icon-brand"
  })), /*#__PURE__*/React.createElement("div", null, heading && /*#__PURE__*/React.createElement("p", {
    style: {
      fontWeight: 600,
      color: accent,
      fontSize: 'var(--text-small)'
    }
  }, heading), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: heading ? '0.25rem' : 0,
      fontSize: 'var(--text-small)',
      color: 'var(--color-ink-muted)'
    }
  }, children)));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Callout.jsx", error: String((e && e.message) || e) }); }

// components/brand/IconPlate.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Icon inside a tile, or standing alone. Inside a tile the plate is a 56px
   square of the main colour with the icon reversed out; on an activated tile
   it turns dark so it stands ON the accent — the accent never appears twice
   in one card. activate is the quiet coral-tint fill, for standalone plates. */
function IconPlate({
  icon,
  activate = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['icon-plate', activate ? 'icon-plate-activate' : '', className].filter(Boolean).join(' ')
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 24,
    className: "icon-brand"
  }));
}
Object.assign(__ds_scope, { IconPlate });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/IconPlate.jsx", error: String((e && e.message) || e) }); }

// components/brand/PixelArrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Step — the pixel arrow. The squares between the C and the m in the wordmark
   are a rule, not a texture. Mirror the stair about its top and you have a
   chevron, so the arrow is the wordmark read in another direction.
   On a button it marks FORWARD: drop it where the button does not move you
   forward (Save, Apply), and never put it on the one that cancels. */
function PixelArrow({
  size = 'md',
  shape = 'chev3',
  className = '',
  ...rest
}) {
  const counts = {
    chev3: 3,
    chev5: 5,
    arrow: 9,
    stair: 3,
    stair2: 2
  };
  const n = counts[shape] || 3;
  return /*#__PURE__*/React.createElement("span", _extends({
    "aria-hidden": "true",
    className: ['px', 'px-' + size, 'px-' + shape, className].filter(Boolean).join(' ')
  }, rest), Array.from({
    length: n
  }).map((_, i) => /*#__PURE__*/React.createElement("b", {
    key: i
  })));
}
Object.assign(__ds_scope, { PixelArrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/PixelArrow.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The set is five, and every name means something the brand can defend.

   primary  — the ACTIVATION button. The one action of a view; at most one per
              viewport, and that scarcity IS the 15% rule.
   outline  — the supporting action beside a primary. Safe to repeat.
   filled   — quiet but still a button: toolbars, filter chips, anywhere a
              border would be noise.
   ghost    — no chrome at all. Icon-only buttons and dense rows.
   danger   — destructive and irreversible.

   arrow adds the pixel arrow, which marks FORWARD. It marches on hover. */
function Button({
  variant = 'filled',
  size = 'base',
  arrow = false,
  arrowShape = 'chev3',
  icon,
  iconTrailing,
  href,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const Tag = href && !disabled ? 'a' : 'button';
  const pxSize = size === 'lg' ? 'lg' : size === 'base' ? 'md' : 'sm';
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href && !disabled ? href : undefined,
    disabled: Tag === 'button' ? disabled : undefined,
    "aria-disabled": disabled || undefined,
    className: ['cm-btn', 'cm-btn-' + variant, 'cm-btn-' + size, className].filter(Boolean).join(' ')
  }, rest), icon, children, iconTrailing, arrow && /*#__PURE__*/React.createElement(__ds_scope.PixelArrow, {
    size: pxSize,
    shape: arrowShape
  }));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/brand/ProgressUnits.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Turn — progress as ten discrete squares rather than a filled track. Each
   turns a quarter as it fills, so the bar is countable and exact at once; the
   leading square carries the fraction and takes the activation colour.

   Note this spends activation. If the bar shares a viewport with a primary
   button, that is two activation moments, and the rule says one.

   demo self-cycles and is marked indeterminate: nothing set it, so there is
   no value to announce. */
function ProgressUnits({
  value = 0,
  units = 10,
  label = 'Progress',
  demo = false,
  className = '',
  style,
  ...rest
}) {
  const [tick, setTick] = React.useState(0);
  React.useEffect(() => {
    if (!demo) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTick(64);
      return;
    }
    let p = 0;
    const id = setInterval(() => {
      p = p >= 100 ? 0 : p + 10;
      setTick(p);
    }, 600);
    return () => clearInterval(id);
  }, [demo]);
  const shown = demo ? tick : value;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['pb', 'pb-units', className].filter(Boolean).join(' '),
    "data-progress-demo": demo ? '' : undefined,
    style: {
      '--p': shown,
      ...style
    },
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": demo ? undefined : value,
    "aria-label": label
  }, rest), Array.from({
    length: units
  }).map((_, n) => /*#__PURE__*/React.createElement("i", {
    key: n,
    style: {
      '--n': n
    }
  })));
}
Object.assign(__ds_scope, { ProgressUnits });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/ProgressUnits.jsx", error: String((e && e.message) || e) }); }

// components/brand/Spinner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Convergence — the brand spinner. Four squares that are already IN the ring:
   flush in the band at rest, so the ring reads as a plain rounded square.
   They slide out, the assembly turns 90 degrees, they slide back; four-fold
   symmetry means the loop has no seam. The mask needs a document-unique id. */
function Spinner({
  name = 'ds',
  size = '3.5rem',
  label = 'Loading',
  style,
  ...rest
}) {
  const id = 'conv-mask-' + name;
  const notches = [{
    x: 143,
    y: 68,
    w: 34,
    h: 40
  }, {
    x: 212,
    y: 143,
    w: 40,
    h: 34
  }, {
    x: 143,
    y: 212,
    w: 34,
    h: 40
  }, {
    x: 68,
    y: 143,
    w: 40,
    h: 34
  }];
  const squares = [{
    x: 142,
    y: 70,
    dx: '0px',
    dy: '-37px'
  }, {
    x: 214,
    y: 142,
    dx: '37px',
    dy: '0px'
  }, {
    x: 142,
    y: 214,
    dx: '0px',
    dy: '37px'
  }, {
    x: 70,
    y: 142,
    dx: '-37px',
    dy: '0px'
  }];
  return /*#__PURE__*/React.createElement("svg", _extends({
    className: "sp-conv",
    viewBox: "0 0 320 320",
    role: "status",
    "aria-label": label,
    style: {
      '--spin-size': size,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("mask", {
    id: id
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "320",
    height: "320",
    fill: "#fff"
  }), notches.map((n, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    className: "conv-notch",
    x: n.x,
    y: n.y,
    width: n.w,
    height: n.h,
    fill: "#000"
  })))), /*#__PURE__*/React.createElement("g", {
    className: "conv-rotor"
  }, /*#__PURE__*/React.createElement("rect", {
    className: "conv-ring",
    x: "88",
    y: "88",
    width: "144",
    height: "144",
    rx: "52",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "36",
    mask: 'url(#' + id + ')'
  }), squares.map((s, i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    className: "conv-sq",
    x: s.x,
    y: s.y,
    width: "36",
    height: "36",
    style: {
      '--dx': s.dx,
      '--dy': s.dy
    }
  }))));
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/brand/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Number and label. activate spends the coral on the figure — one per view. */
function Stat({
  value,
  label,
  activate = false,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.25rem',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "text-display-md",
    style: {
      fontVariantNumeric: 'tabular-nums',
      color: activate ? 'var(--color-activation)' : undefined
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-small)',
      color: 'var(--color-ink-subtle)'
    }
  }, label));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Stat.jsx", error: String((e && e.message) || e) }); }

// components/brand/Swatch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Colour chip for a palette gallery. */
function Swatch({
  name,
  hex,
  pms,
  note,
  ring = false,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '6rem',
      borderRadius: 'var(--radius-xl)',
      backgroundColor: hex,
      boxShadow: ring ? 'inset 0 0 0 1px var(--color-line)' : undefined
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 600
    }
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '0.125rem',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-tiny)',
      textTransform: 'uppercase',
      color: 'var(--color-ink-subtle)'
    }
  }, hex), pms && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, pms), note && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '0.25rem',
      fontSize: 'var(--text-tiny)',
      lineHeight: 1.4,
      color: 'var(--color-ink-muted)'
    }
  }, note)));
}
Object.assign(__ds_scope, { Swatch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Swatch.jsx", error: String((e && e.message) || e) }); }

// components/content/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The two cards that are ours. outline is the page's own colours held inside
   a 2px rule — the border IS the card. soft is the same card reversed onto
   Graphite. Both carry the two-step stair, so a card is marked the way every
   other brand surface is. Geometry is shared: 4px corner, 36px padding. */
function Card({
  variant = 'outline',
  mark = true,
  heading,
  children,
  footer,
  className = '',
  style,
  ...rest
}) {
  const soft = variant === 'soft';
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['cm-card', soft ? 'cm-card-soft' : 'cm-card-outline', className].filter(Boolean).join(' '),
    style: style
  }, rest), mark && /*#__PURE__*/React.createElement("span", {
    className: "px px-stair2 card-mark",
    "aria-hidden": "true",
    style: {
      '--u': '12px',
      color: soft ? 'var(--color-off-white)' : 'var(--color-ink)'
    }
  }, /*#__PURE__*/React.createElement("b", null), /*#__PURE__*/React.createElement("b", {
    style: {
      backgroundColor: 'var(--color-activation)'
    }
  })), heading && /*#__PURE__*/React.createElement("h3", {
    style: {
      marginTop: mark ? '1rem' : 0,
      fontSize: '1.875rem',
      lineHeight: 1.2,
      fontWeight: 700,
      color: soft ? 'var(--color-off-white)' : 'var(--color-ink)'
    }
  }, heading), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1rem',
      fontSize: '1.125rem',
      lineHeight: 1.6,
      color: soft ? 'var(--color-activation-subtle)' : 'var(--color-ink-muted)'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.5rem'
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Card.jsx", error: String((e && e.message) || e) }); }

// components/content/Display.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Display heading. Sizes map to the --text-display-* scale, which encodes the
   manual's weight pairing (Medium for most titles, Semibold for headlines).
   Do not set a weight by hand. */
function Display({
  size = 'lg',
  as = 'h2',
  className = '',
  children,
  ...rest
}) {
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: ['text-display-' + size, className].filter(Boolean).join(' ')
  }, rest), children);
}
Object.assign(__ds_scope, { Display });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Display.jsx", error: String((e && e.message) || e) }); }

// components/content/Lead.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Lead paragraph. Figtree Light — "body copy where a greater level of
   sophistication is required" (manual p.20). */
function Lead({
  className = '',
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("p", _extends({
    className: ['text-lead', className].filter(Boolean).join(' '),
    style: {
      color: 'var(--color-ink-muted)',
      maxWidth: '42rem',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Lead });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Lead.jsx", error: String((e && e.message) || e) }); }

// components/content/Section.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Page section: one vertical rhythm so blocks stack predictably, and one of
   four surfaces. invert is the Graphite band — hero, CTA, footer. */
function Section({
  surface = 'ground',
  rhythm = 'base',
  id,
  className = '',
  children,
  style,
  ...rest
}) {
  const bg = {
    ground: 'var(--color-ground)',
    surface: 'var(--color-surface)',
    sunken: 'var(--color-surface-sunken)',
    invert: undefined
  };
  const pad = {
    tight: 'var(--section-tight)',
    base: 'var(--section-base)',
    loose: 'var(--section-loose)'
  };
  return /*#__PURE__*/React.createElement("section", _extends({
    id: id,
    className: [surface === 'invert' ? 'surface-invert' : '', className].filter(Boolean).join(' '),
    style: {
      backgroundColor: bg[surface],
      paddingBlock: pad[rhythm] || pad.base,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "container-site"
  }, children));
}
Object.assign(__ds_scope, { Section });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Section.jsx", error: String((e && e.message) || e) }); }

// components/content/Separator.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* A hairline. activate carries the accent for its first 2rem; text puts a
   word in the middle of the rule. */
function Separator({
  variant = 'default',
  text,
  activate = false,
  className = '',
  style,
  ...rest
}) {
  const color = variant === 'subtle' ? 'color-mix(in oklab, var(--color-line) 55%, transparent)' : 'var(--color-line)';
  if (activate) return /*#__PURE__*/React.createElement("hr", _extends({
    className: ['rule-activate', className].filter(Boolean).join(' '),
    style: style
  }, rest));
  if (text) return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.875rem',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      backgroundColor: color
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-small)',
      color: 'var(--color-ink-subtle)'
    }
  }, text), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      height: 1,
      backgroundColor: color
    }
  }));
  return /*#__PURE__*/React.createElement("hr", _extends({
    className: className,
    style: {
      height: 1,
      border: 0,
      backgroundColor: color,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Separator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Separator.jsx", error: String((e && e.message) || e) }); }

// components/content/Tile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Feature tile. The three states are not three components: standard is the
   tile, interactive adds the lift, activate takes the WHOLE tile coral
   (a tint on a 56px plate is not enough signal for "the one that matters
   most") and turns the plate dark so it stands on the accent.

   Note: on an activated tile the copy is Light Beige at 2.60:1 — the
   specified treatment, and the place in the system where it costs the most. */
function Tile({
  icon,
  heading,
  interactive = false,
  activate = false,
  children,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['tile', interactive ? 'tile-interactive' : '', activate ? 'tile-activate' : '', className].filter(Boolean).join(' '),
    style: style
  }, rest), icon && /*#__PURE__*/React.createElement(__ds_scope.IconPlate, {
    icon: icon
  }), heading && /*#__PURE__*/React.createElement("h4", {
    style: {
      marginTop: '1.5rem',
      fontSize: '1.5rem',
      lineHeight: 1.2,
      fontWeight: 700
    }
  }, heading), children && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '0.5rem',
      fontSize: '1rem',
      lineHeight: 1.6,
      color: activate ? undefined : 'var(--color-ink-muted)'
    }
  }, children));
}
Object.assign(__ds_scope, { Tile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Tile.jsx", error: String((e && e.message) || e) }); }

// components/data/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Initials on a sunken plate, square by default — the brand's shape language
   is a plate, not a disc. circle where a product convention demands it. */
function Avatar({
  name = '',
  src,
  icon,
  size = 'base',
  circle = false,
  badge,
  badgeColor = 'activation',
  className = '',
  style,
  ...rest
}) {
  const sizes = {
    xs: 24,
    sm: 32,
    base: 40,
    lg: 48,
    xl: 64
  };
  const s = sizes[size] || sizes.base;
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const dot = {
    activation: 'var(--color-activation)',
    positive: 'var(--color-positive)',
    critical: 'var(--color-critical)'
  }[badgeColor];
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      position: 'relative',
      display: 'inline-flex',
      flex: 'none',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      width: s,
      height: s,
      display: 'grid',
      placeItems: 'center',
      overflow: 'hidden',
      borderRadius: circle ? '9999px' : 'var(--radius-sm)',
      backgroundColor: 'var(--color-surface-sunken)',
      color: 'var(--color-ink)',
      fontSize: Math.max(10, Math.round(s * 0.36)),
      fontWeight: 600,
      letterSpacing: '-0.01em',
      boxShadow: 'inset 0 0 0 1px var(--color-line)'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: Math.round(s * 0.5),
    className: "icon-brand"
  }) : initials), badge && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: Math.max(8, s * 0.24),
      height: Math.max(8, s * 0.24),
      borderRadius: '9999px',
      backgroundColor: dot,
      boxShadow: '0 0 0 2px var(--color-surface)'
    }
  }));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data/AvatarGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Overlapped stack. The ring is the surface colour, so the group reads as one
   object rather than a row of plates. */
function AvatarGroup({
  children,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    className: className,
    style: {
      display: 'inline-flex',
      ...style
    }
  }, rest), React.Children.map(children, (child, i) => /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: i === 0 ? 0 : '-0.5rem',
      borderRadius: 'var(--radius-sm)',
      boxShadow: '0 0 0 2px var(--color-surface)'
    }
  }, child)));
}
Object.assign(__ds_scope, { AvatarGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/AvatarGroup.jsx", error: String((e && e.message) || e) }); }

// components/data/Profile.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Avatar + name, the account trigger in a navbar or sidebar. */
function Profile({
  name,
  meta,
  src,
  chevron = true,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: ['cm-nav-item', className].filter(Boolean).join(' '),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      padding: '0.375rem 0.5rem',
      borderRadius: 'var(--radius-pill)',
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      font: 'inherit',
      color: 'var(--color-ink)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: name,
    src: src,
    size: "sm"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      textAlign: 'left',
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-small)',
      fontWeight: 500
    }
  }, name), meta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, meta)), chevron && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16,
    className: "icon-brand",
    style: {
      color: 'var(--color-ink-subtle)'
    }
  }));
}
Object.assign(__ds_scope, { Profile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Profile.jsx", error: String((e && e.message) || e) }); }

// components/data/Table.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Sortable table. Hairline rows on the surface — no zebra striping: the brand
   is flat and white space does the separating. */
function Table({
  columns = [],
  rows = [],
  sortBy,
  sortDirection = 'asc',
  onSort,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      overflowX: 'auto',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 'var(--text-small)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: '0.625rem 0.875rem',
      borderBottom: '1px solid var(--color-line)',
      fontWeight: 600,
      color: 'var(--color-ink-subtle)',
      fontSize: 'var(--text-tiny)',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap'
    }
  }, c.sortable ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: () => onSort && onSort(c.key),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      border: 0,
      background: 'transparent',
      font: 'inherit',
      letterSpacing: 'inherit',
      textTransform: 'inherit',
      color: sortBy === c.key ? 'var(--color-ink)' : 'inherit',
      cursor: 'pointer',
      padding: 0
    }
  }, c.label, sortBy === c.key && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: sortDirection === 'asc' ? 'chevron-up' : 'chevron-down',
    size: 12,
    className: "icon-brand"
  })) : c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id || i,
    className: "cm-row"
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: '0.75rem 0.875rem',
      borderBottom: '1px solid var(--color-line)',
      color: 'var(--color-ink)',
      fontVariantNumeric: c.numeric ? 'tabular-nums' : undefined
    }
  }, c.render ? c.render(r) : r[c.key])))))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Table.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Checkbox. The tick resolves --color-accent, which is Graphite in light and
   Coral in dark — form controls read the accent, never the activation token. */
function Checkbox({
  label,
  description,
  disabled = false,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: className,
    style: {
      display: 'flex',
      gap: '0.625rem',
      alignItems: 'flex-start',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    className: "cm-control",
    disabled: disabled,
    style: {
      width: '1rem',
      height: '1rem',
      marginTop: '0.1875rem',
      flex: 'none'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-small)',
      color: 'var(--color-ink)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Label + control + description/error. Every field in the system is wrapped
   in one of these, so labels sit at one size and one weight everywhere. */
function Field({
  label,
  description,
  error,
  required = false,
  htmlFor,
  children,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.375rem',
      ...style
    }
  }, rest), label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 500,
      color: 'var(--color-ink)'
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-activation)'
    }
  }, " *")), children, (description || error) && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-tiny)',
      color: error ? 'var(--color-critical)' : 'var(--color-ink-subtle)'
    }
  }, error || description));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Text input. One input surface across the system: white fill, hairline
   border, 12px corner, 16px value text at every width. */
function Input({
  label,
  description,
  error,
  icon,
  type = 'text',
  className = '',
  style,
  ...rest
}) {
  const control = /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: '0.75rem',
      color: 'var(--color-sand-500)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    className: "icon-brand"
  })), /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    className: ['cm-input', className].filter(Boolean).join(' '),
    style: {
      paddingLeft: icon ? '2.375rem' : undefined,
      ...style
    }
  }, rest)));
  if (!label && !description && !error) return control;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    description: description,
    error: error
  }, control);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* A single radio in a default (stacked) group. */
function Radio({
  label,
  description,
  disabled = false,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: className,
    style: {
      display: 'flex',
      gap: '0.625rem',
      alignItems: 'flex-start',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    className: "cm-control",
    disabled: disabled,
    style: {
      width: '1rem',
      height: '1rem',
      marginTop: '0.1875rem',
      flex: 'none'
    }
  }, rest)), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-small)',
      color: 'var(--color-ink)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, description)));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/RadioGroup.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Four variants, one control. default stacks; segmented is the compact row
   on a sunken track; pills is the filter row; cards is the choice with a
   description attached. */
function RadioGroup({
  variant = 'default',
  options = [],
  value,
  onChange,
  name,
  label,
  className = '',
  style,
  ...rest
}) {
  const pick = v => onChange && onChange(v);
  if (variant === 'segmented' || variant === 'pills') {
    return /*#__PURE__*/React.createElement("div", _extends({
      role: "radiogroup",
      "aria-label": label,
      className: [variant === 'segmented' ? 'cm-seg' : '', className].filter(Boolean).join(' '),
      style: variant === 'pills' ? {
        display: 'inline-flex',
        gap: '0.5rem',
        ...style
      } : style
    }, rest), options.map(o => /*#__PURE__*/React.createElement("button", {
      key: o.value,
      type: "button",
      role: "radio",
      "aria-checked": value === o.value,
      className: variant === 'segmented' ? 'cm-seg-item' : 'cm-pill',
      onClick: () => pick(o.value)
    }, o.label)));
  }
  if (variant === 'cards') {
    return /*#__PURE__*/React.createElement("div", _extends({
      role: "radiogroup",
      "aria-label": label,
      className: className,
      style: {
        display: 'grid',
        gap: '0.75rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(14rem, 1fr))',
        ...style
      }
    }, rest), options.map(o => {
      const on = value === o.value;
      return /*#__PURE__*/React.createElement("button", {
        key: o.value,
        type: "button",
        role: "radio",
        "aria-checked": on,
        onClick: () => pick(o.value),
        style: {
          textAlign: 'left',
          cursor: 'pointer',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-surface)',
          font: 'inherit',
          border: on ? '2px solid var(--color-ink)' : '1px solid var(--color-line)',
          boxShadow: on ? 'var(--shadow-raised)' : 'none'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontSize: 'var(--text-small)',
          fontWeight: 600,
          color: 'var(--color-ink)'
        }
      }, o.label), o.description && /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          marginTop: '0.125rem',
          fontSize: 'var(--text-tiny)',
          color: 'var(--color-ink-subtle)'
        }
      }, o.description));
    }));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "radiogroup",
    "aria-label": label,
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.625rem',
      ...style
    }
  }, rest), options.map(o => /*#__PURE__*/React.createElement(__ds_scope.Radio, {
    key: o.value,
    name: name,
    value: o.value,
    label: o.label,
    description: o.description,
    checked: value === o.value,
    onChange: () => pick(o.value)
  })));
}
Object.assign(__ds_scope, { RadioGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RadioGroup.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Native select on the shared input surface. The chevron is drawn at
   #d4d4d4 — a trigger mark, not text. */
function Select({
  label,
  description,
  error,
  options = [],
  children,
  className = '',
  style,
  ...rest
}) {
  const chev = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%23d4d4d4' stroke-width='1.5'><path d='M6 8l4 4 4-4'/></svg>";
  const control = /*#__PURE__*/React.createElement("select", _extends({
    className: ['cm-input', className].filter(Boolean).join(' '),
    style: {
      backgroundImage: 'url("' + chev + '")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.625rem center',
      backgroundSize: '1.25rem',
      ...style
    }
  }, rest), options.map(o => typeof o === 'string' ? /*#__PURE__*/React.createElement("option", {
    key: o,
    value: o
  }, o) : /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label)), children);
  if (!label && !description && !error) return control;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    description: description,
    error: error
  }, control);
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* On/off, with the label on the left and the control right — settings rows
   read as a list of statements rather than a list of controls. */
function Switch({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-small)',
      color: 'var(--color-ink)'
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, description)), /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    role: "switch",
    "aria-checked": checked,
    "aria-label": label,
    disabled: disabled,
    className: "cm-switch",
    onClick: () => onChange && onChange(!checked)
  }, rest), /*#__PURE__*/React.createElement("span", null)));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Multi-line input, same surface as every other field. */
function Textarea({
  label,
  description,
  error,
  rows = 3,
  className = '',
  ...rest
}) {
  const control = /*#__PURE__*/React.createElement("textarea", _extends({
    rows: rows,
    className: ['cm-input', className].filter(Boolean).join(' ')
  }, rest));
  if (!label && !description && !error) return control;
  return /*#__PURE__*/React.createElement(__ds_scope.Field, {
    label: label,
    description: description,
    error: error
  }, control);
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Breadcrumbs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Trail. The last item is the page and is not a link. */
function Breadcrumbs({
  items = [],
  separator = 'chevron',
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    "aria-label": "Breadcrumb",
    className: className,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: 'var(--text-small)',
      ...style
    }
  }, rest), items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: it.label || i
  }, i > 0 && (separator === 'slash' ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-sand-400)'
    }
  }, "/") : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 14,
    className: "icon-brand",
    style: {
      color: 'var(--color-sand-400)'
    }
  })), i === items.length - 1 ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-ink)',
      fontWeight: 500
    }
  }, it.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 16,
    className: "icon-brand"
  }) : it.label) : /*#__PURE__*/React.createElement("a", {
    href: it.href || '#',
    className: "cm-link-muted"
  }, it.icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 16,
    className: "icon-brand"
  }) : it.label))));
}
Object.assign(__ds_scope, { Breadcrumbs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Breadcrumbs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/CTA.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* The closing band: Graphite ground, one display line, and the view's single
   activation moment in the buttons. */
function CTA({
  eyebrow,
  heading,
  body,
  children,
  id = 'contact',
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Section, _extends({
    surface: "invert",
    rhythm: "loose",
    id: id,
    className: className
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '48rem',
      marginInline: 'auto',
      textAlign: 'center'
    }
  }, eyebrow && /*#__PURE__*/React.createElement(__ds_scope.Eyebrow, {
    style: {
      justifyContent: 'center'
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h2", {
    className: "text-display-lg",
    style: {
      marginTop: '1.25rem'
    }
  }, heading), body && /*#__PURE__*/React.createElement("p", {
    className: "text-lead",
    style: {
      marginTop: '1.5rem',
      color: 'var(--color-mid-blue)'
    }
  }, body), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '2.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.75rem'
    }
  }, children)));
}
Object.assign(__ds_scope, { CTA });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/CTA.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Dropdown.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Menu on a trigger. The panel is a continuation of the control it opens
   from, so it takes a generous corner and a floating shadow, never a border. */
function Dropdown({
  trigger,
  items = [],
  align = 'left',
  className = '',
  style,
  ...rest
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const onDoc = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    className: className,
    style: {
      position: 'relative',
      display: 'inline-flex',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    onClick: () => setOpen(o => !o)
  }, trigger), open && /*#__PURE__*/React.createElement("div", {
    role: "menu",
    style: {
      position: 'absolute',
      top: 'calc(100% + 0.5rem)',
      zIndex: 60,
      left: align === 'left' ? 0 : undefined,
      right: align === 'right' ? 0 : undefined,
      minWidth: '12rem',
      padding: '0.375rem',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--color-surface)',
      boxShadow: 'var(--shadow-floating)'
    }
  }, items.map((it, i) => it.separator ? /*#__PURE__*/React.createElement("div", {
    key: 's' + i,
    style: {
      height: 1,
      margin: '0.375rem 0',
      backgroundColor: 'var(--color-line)'
    }
  }) : /*#__PURE__*/React.createElement("button", {
    key: it.label,
    type: "button",
    role: "menuitem",
    className: "cm-nav-item",
    onClick: () => {
      setOpen(false);
      it.onSelect && it.onSelect();
    },
    style: {
      display: 'flex',
      width: '100%',
      alignItems: 'center',
      gap: '0.5rem',
      textAlign: 'left',
      padding: '0.4375rem 0.625rem',
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      font: 'inherit',
      fontSize: 'var(--text-small)',
      borderRadius: 'var(--radius-sm)',
      color: it.danger ? 'var(--color-critical)' : 'var(--color-ink)'
    }
  }, it.icon, it.label))));
}
Object.assign(__ds_scope, { Dropdown });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Dropdown.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Page furniture. The activated hairline closes the page the way the eyebrow
   opens a section. */
function Footer({
  groups = [],
  blurb,
  note,
  className = '',
  ...rest
}) {
  return /*#__PURE__*/React.createElement("footer", _extends({
    className: ['surface-invert', className].filter(Boolean).join(' '),
    style: {
      borderTop: '1px solid var(--color-line-invert)'
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "container-site",
    style: {
      paddingBlock: '4rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '3rem',
      gridTemplateColumns: 'minmax(0, 1.5fr) repeat(auto-fit, minmax(8rem, 1fr))'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(__ds_scope.Brand, {
    size: "lg"
  }), blurb && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '1rem',
      maxWidth: '20rem',
      fontSize: 'var(--text-small)',
      color: 'var(--color-mid-blue)'
    }
  }, blurb)), groups.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.title
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 600
    }
  }, g.title), /*#__PURE__*/React.createElement("ul", {
    style: {
      marginTop: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      listStyle: 'none',
      padding: 0
    }
  }, g.items.map(i => /*#__PURE__*/React.createElement("li", {
    key: i.label
  }, /*#__PURE__*/React.createElement("a", {
    href: i.href || '#',
    className: "cm-link-muted",
    style: {
      fontSize: 'var(--text-small)'
    }
  }, i.label))))))), /*#__PURE__*/React.createElement("hr", {
    className: "rule-activate",
    style: {
      marginTop: '3.5rem',
      marginBottom: '1.5rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      justifyContent: 'space-between',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-mid-blue)'
    }
  }, /*#__PURE__*/React.createElement("p", null, "\xA9 C-MORE ", new Date().getFullYear()), /*#__PURE__*/React.createElement("p", null, note || 'Brand Manual 2025-03 V2'))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Modal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Overlay dialog. The scrim is the main colour at 45%, never black — black
   greys the warm ground behind it. */
function Modal({
  open,
  onClose,
  heading,
  description,
  footer,
  children,
  width = '28rem',
  className = '',
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    "aria-label": heading,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'grid',
      placeItems: 'center',
      padding: '1.5rem'
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(52,52,52,0.45)',
      backdropFilter: 'blur(2px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      position: 'relative',
      width: '100%',
      maxWidth: width,
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-overlay)',
      padding: '1.75rem'
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Close",
    onClick: onClose,
    className: "cm-nav-item",
    style: {
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--color-ink-subtle)',
      borderRadius: 'var(--radius-pill)',
      padding: '0.25rem'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 20,
    className: "icon-brand"
  })), heading && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: '1.5rem',
      lineHeight: 1.2,
      fontWeight: 600,
      letterSpacing: '-0.02em'
    }
  }, heading), description && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '0.5rem',
      fontSize: 'var(--text-small)',
      color: 'var(--color-ink-muted)'
    }
  }, description), children && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.25rem'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.75rem',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.625rem'
    }
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Modal.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Navbar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Site header: wordmark, links, and exactly one activation moment. Sticky on
   a translucent ground with a blur, so the beige stays warm under it. */
function Navbar({
  links = [],
  current,
  onNavigate,
  actions,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    className: className,
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--color-line)',
      backgroundColor: 'color-mix(in oklab, var(--color-ground) 85%, transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    className: "container-site",
    style: {
      display: 'flex',
      height: '4.5rem',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.5rem'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Brand, null), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Primary",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '2rem'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href || '#',
    onClick: e => {
      if (onNavigate) {
        e.preventDefault();
        onNavigate(l);
      }
    },
    className: "cm-link-muted",
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 500,
      color: current === l.label ? 'var(--color-ink)' : undefined
    }
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    }
  }, actions)));
}
Object.assign(__ds_scope, { Navbar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Navbar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Navlist.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Sidebar navigation. The current item is marked by weight and an activation
   rule on its leading edge — the same device as the section rail. */
function Navlist({
  items = [],
  current,
  onSelect,
  heading,
  className = '',
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    className: className,
    "aria-label": heading || 'Sections',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.125rem',
      ...style
    }
  }, rest), heading && /*#__PURE__*/React.createElement("p", {
    style: {
      padding: '0 0.5rem 0.5rem',
      fontSize: '0.6875rem',
      fontWeight: 600,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--color-ink-subtle)'
    }
  }, heading), items.map(it => {
    const on = current === it.key;
    return /*#__PURE__*/React.createElement("button", {
      key: it.key,
      type: "button",
      onClick: () => onSelect && onSelect(it.key),
      className: "cm-nav-item",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        width: '100%',
        textAlign: 'left',
        padding: '0.4375rem 0.625rem',
        border: 0,
        borderLeft: '2px solid ' + (on ? 'var(--color-activation)' : 'transparent'),
        borderRadius: '0 0.375rem 0.375rem 0',
        cursor: 'pointer',
        font: 'inherit',
        fontSize: 'var(--text-small)',
        fontWeight: on ? 600 : 400,
        color: on ? 'var(--color-ink)' : 'var(--color-ink-muted)',
        backgroundColor: on ? 'var(--color-surface-sunken)' : 'transparent'
      }
    }, it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 18,
      className: "icon-brand"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, it.label), it.badge);
  }));
}
Object.assign(__ds_scope, { Navlist });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Navlist.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Toast.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Transient confirmation, bottom-right. Graphite plate with a status mark —
   the toast is chrome, so it identifies rather than activates. */
function Toast({
  heading,
  text,
  variant = 'success',
  onDismiss,
  className = '',
  style,
  ...rest
}) {
  const marks = {
    success: ['check-circle', 'var(--color-positive)'],
    warning: ['exclamation-triangle', 'var(--color-caution)'],
    danger: ['x-circle', 'var(--color-critical)'],
    info: ['information-circle', 'var(--color-mid-blue)']
  };
  const [icon, color] = marks[variant] || marks.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    className: className,
    style: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start',
      minWidth: '18rem',
      maxWidth: '24rem',
      padding: '0.875rem 1rem',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--color-graphite)',
      color: 'var(--color-off-white)',
      boxShadow: 'var(--shadow-overlay)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color,
      flex: 'none',
      marginTop: '0.0625rem'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20,
    className: "icon-brand"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 600
    }
  }, heading), text && /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '0.125rem',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-mid-blue)'
    }
  }, text)), onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss,
    style: {
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: 'var(--color-mid-blue)',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x-mark",
    size: 16,
    className: "icon-brand"
  })));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Toast.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Features.jsx
try { (() => {
const {
  Section,
  Eyebrow,
  Display,
  Lead,
  Tile,
  Card,
  Button,
  Separator
} = window.CMOREDesignSystem_9bac62;

/* Tile grid, then the two drawn cards. Exactly one activated tile in the
   grid, and no primary button in this band — the page's activation moment
   is spent in the hero and again in the closing CTA, nowhere between. */
function Features() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Section, {
    surface: "ground",
    rhythm: "base",
    id: "platform"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "What it does"), /*#__PURE__*/React.createElement(Display, {
    size: "lg",
    style: {
      marginTop: '1.25rem',
      maxWidth: '16ch'
    }
  }, "Assessment that ends in a number"), /*#__PURE__*/React.createElement(Lead, {
    style: {
      marginTop: '1.5rem'
    }
  }, "Every answer rolls into one score per supplier, per tier, per quarter."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '3rem',
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))'
    }
  }, /*#__PURE__*/React.createElement(Tile, {
    icon: "document-check",
    heading: "One questionnaire",
    interactive: true
  }, "Sent, chased and closed without a spreadsheet leaving the building."), /*#__PURE__*/React.createElement(Tile, {
    icon: "chart-bar",
    heading: "Scored, not stored",
    interactive: true
  }, "Answers become a number the week they land."), /*#__PURE__*/React.createElement(Tile, {
    icon: "bolt",
    heading: "Tier three, visible",
    activate: true,
    interactive: true
  }, "The suppliers your suppliers use, on the same scale."), /*#__PURE__*/React.createElement(Tile, {
    icon: "shield-check",
    heading: "Evidence attached"
  }, "Every claim carries the document that proves it."))), /*#__PURE__*/React.createElement(Section, {
    surface: "surface",
    rhythm: "base",
    id: "how"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(20rem, 1fr))'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    variant: "outline",
    heading: "For the team that sends it",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "outline"
    }, "Read the workflow")
  }, "Build once, send to four hundred, and watch the bar fill. Reminders go out on their own."), /*#__PURE__*/React.createElement(Card, {
    variant: "soft",
    heading: "For the supplier that answers it",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      arrow: true
    }, "See a live questionnaire")
  }, "Twelve questions, saved as they type, finished on a phone if that is what they have.")), /*#__PURE__*/React.createElement(Separator, {
    activate: true,
    style: {
      marginTop: '3rem'
    }
  })));
}
window.Features = Features;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Features.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Hero.jsx
try { (() => {
const {
  Button,
  Brand,
  Eyebrow,
  Lead,
  Stat,
  PixelArrow
} = window.CMOREDesignSystem_9bac62;

/* The hero band. One display line, one activation button, and the stair
   cropped by the plate in the corner — the mark behaving like a mark. */
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    className: "surface-invert",
    style: {
      position: 'relative',
      overflow: 'hidden',
      paddingBlock: 'var(--section-loose)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "px px-stair",
    "aria-hidden": "true",
    style: {
      '--u': '48px',
      position: 'absolute',
      top: 0,
      right: 0,
      color: 'var(--color-coral)'
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      borderRadius: 0
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      borderRadius: 0
    }
  }), /*#__PURE__*/React.createElement("b", {
    style: {
      borderRadius: 0
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "container-site",
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Supply chain assessment"), /*#__PURE__*/React.createElement("h1", {
    className: "text-display-xl",
    style: {
      marginTop: '1.5rem',
      maxWidth: '18ch'
    }
  }, "Know every tier, ", /*#__PURE__*/React.createElement("span", {
    className: "mark-activate"
  }, "not just the first")), /*#__PURE__*/React.createElement("p", {
    className: "text-lead",
    style: {
      marginTop: '1.75rem',
      maxWidth: '38rem',
      color: 'var(--color-mid-blue)'
    }
  }, "One questionnaire, every supplier, one score you can act on. No integration, no spreadsheet round trip."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '2.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    arrow: true
  }, "Book a demo"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg"
  }, "See how it works")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '4.5rem',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '3.5rem'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "1,284",
    label: "Suppliers assessed"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "3",
    label: "Tiers covered"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "9 days",
    label: "Median time to first score",
    activate: true
  }))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Proof.jsx
try { (() => {
const {
  Section,
  Eyebrow,
  Display,
  ProgressUnits,
  Badge,
  Avatar,
  Table
} = window.CMOREDesignSystem_9bac62;

/* The product, shown rather than described: the real supplier table from the
   reference dataset, with Turn reporting the cycle above it. */
function Proof() {
  const cols = [{
    key: 'supplier',
    label: 'Supplier'
  }, {
    key: 'tier',
    label: 'Tier',
    render: r => 'Tier ' + r.tier
  }, {
    key: 'score',
    label: 'Score',
    numeric: true,
    align: 'right'
  }, {
    key: 'status',
    label: 'Status',
    render: r => /*#__PURE__*/React.createElement(Badge, {
      color: r.color,
      size: "sm"
    }, r.status)
  }];
  const rows = [{
    supplier: 'Belmonte Chemicals',
    tier: 2,
    score: 91,
    status: 'Assessed',
    color: 'positive'
  }, {
    supplier: 'Northwind Materials',
    tier: 1,
    score: 86,
    status: 'Assessed',
    color: 'positive'
  }, {
    supplier: 'Verax Industrial',
    tier: 1,
    score: 72,
    status: 'Pending',
    color: 'caution'
  }, {
    supplier: 'Caldeira Freight',
    tier: 3,
    score: 63,
    status: 'Pending',
    color: 'caution'
  }, {
    supplier: 'Almada Logistics',
    tier: 2,
    score: 54,
    status: 'Overdue',
    color: 'critical'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    surface: "sunken",
    rhythm: "base"
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Inside the workspace"), /*#__PURE__*/React.createElement(Display, {
    size: "md",
    style: {
      marginTop: '1.25rem'
    }
  }, "Q4 cycle, in progress"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '2.5rem',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.5rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 600
    }
  }, "64 of 100 responses in"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, "Closes 12 December")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "Ana Silva",
    size: "sm"
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "Bruno Costa",
    size: "sm"
  }), /*#__PURE__*/React.createElement(Avatar, {
    name: "+4",
    size: "sm"
  }))), /*#__PURE__*/React.createElement(ProgressUnits, {
    value: 64,
    label: "Q4 cycle",
    style: {
      marginTop: '1.25rem',
      maxWidth: '22rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.5rem'
    }
  }, /*#__PURE__*/React.createElement(Table, {
    columns: cols,
    rows: rows
  }))));
}
window.Proof = Proof;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Proof.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Site.jsx
try { (() => {
const {
  Navbar,
  Footer,
  CTA,
  Button
} = window.CMOREDesignSystem_9bac62;
function Site() {
  const [mailed, setMailed] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Navbar, {
    links: [{
      label: 'Platform',
      href: '#platform'
    }, {
      label: 'How it works',
      href: '#how'
    }, {
      label: 'Pricing',
      href: '#'
    }],
    current: "Platform",
    actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm"
    }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      arrow: true,
      href: "#contact"
    }, "Book a demo"))
  }), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Features, null), /*#__PURE__*/React.createElement(Proof, null), /*#__PURE__*/React.createElement(CTA, {
    eyebrow: "Get started",
    heading: "See your first tier in a week",
    body: "No integration required. We start with the list you already have."
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    arrow: true,
    onClick: () => setMailed(true)
  }, mailed ? 'Request received' : 'Book a demo'), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg"
  }, "Talk to us")), /*#__PURE__*/React.createElement(Footer, {
    blurb: "Supply-chain assessment, ending in one score per supplier.",
    note: "Prototype \xB7 Brand Manual 2025-03 V2",
    groups: [{
      title: 'Product',
      items: [{
        label: 'Platform'
      }, {
        label: 'Pricing'
      }, {
        label: 'Changelog'
      }]
    }, {
      title: 'Company',
      items: [{
        label: 'About'
      }, {
        label: 'Careers'
      }, {
        label: 'Contact'
      }]
    }, {
      title: 'Legal',
      items: [{
        label: 'Privacy'
      }, {
        label: 'Terms'
      }]
    }]
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(Site, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Site.jsx", error: String((e && e.message) || e) }); }

// ui_kits/workspace/App.jsx
try { (() => {
const {
  Modal,
  Button,
  Toast,
  Select,
  Input,
  Field,
  Display,
  Callout
} = window.CMOREDesignSystem_9bac62;
function Reports() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Display, {
    size: "md"
  }, "Reports"), /*#__PURE__*/React.createElement(Callout, {
    style: {
      marginTop: '1.5rem'
    },
    heading: "Nothing to recreate here"
  }, "The source repository ships no reports view, so this screen is left deliberately blank rather than invented."));
}
function App() {
  const [view, setView] = React.useState('overview');
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [detail, setDetail] = React.useState(null);
  const send = () => {
    setOpen(false);
    setToast({
      heading: 'Assessment sent',
      text: '42 suppliers have been notified.'
    });
    setTimeout(() => setToast(null), 4000);
  };
  const go = v => {
    setDetail(null);
    setView(v);
  };
  let body;
  if (detail) body = /*#__PURE__*/React.createElement(SupplierDetail, {
    row: detail,
    onBack: () => setDetail(null)
  });else if (view === 'overview') body = /*#__PURE__*/React.createElement(Overview, {
    onOpenSuppliers: () => go('suppliers')
  });else if (view === 'suppliers') body = /*#__PURE__*/React.createElement(Suppliers, {
    onOpen: setDetail
  });else if (view === 'settings' || view === 'team') body = /*#__PURE__*/React.createElement(Settings, null);else body = /*#__PURE__*/React.createElement(Reports, null);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(AppShell, {
    view: detail ? 'suppliers' : view,
    onView: go,
    onNew: () => setOpen(true)
  }, body), /*#__PURE__*/React.createElement(Modal, {
    open: open,
    onClose: () => setOpen(false),
    heading: "New assessment",
    description: "Everyone on the selected tier receives the Q4 questionnaire.",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setOpen(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      arrow: true,
      onClick: send
    }, "Send"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '1rem'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Tier",
    options: ['Tier 1', 'Tier 2', 'Tier 3']
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Closes",
    type: "date",
    defaultValue: "2026-12-12"
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Reminders",
    description: "Two automatic reminders before the close date."
  }, /*#__PURE__*/React.createElement("div", null)))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      right: '1.5rem',
      bottom: '1.5rem',
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement(Toast, {
    variant: "success",
    heading: toast.heading,
    text: toast.text,
    onDismiss: () => setToast(null)
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/workspace/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/workspace/AppShell.jsx
try { (() => {
const {
  Brand,
  Navlist,
  Profile,
  Dropdown,
  Button,
  Icon,
  Badge,
  Input
} = window.CMOREDesignSystem_9bac62;

/* The app shell: a sunken rail beside a surface canvas. The chrome carries
   exactly one activation moment — the primary button in the top bar. */
function AppShell({
  view,
  onView,
  onNew,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '15rem 1fr',
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement("aside", {
    style: {
      borderRight: '1px solid var(--color-line)',
      background: 'var(--color-surface)',
      padding: '1.25rem 0.85rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 0.5rem'
    }
  }, /*#__PURE__*/React.createElement(Brand, null)), /*#__PURE__*/React.createElement(Navlist, {
    heading: "Workspace",
    current: view,
    onSelect: onView,
    items: [{
      key: 'overview',
      label: 'Overview',
      icon: 'squares-2x2'
    }, {
      key: 'suppliers',
      label: 'Suppliers',
      icon: 'building-office-2',
      badge: /*#__PURE__*/React.createElement(Badge, {
        size: "sm",
        color: "caution"
      }, "3")
    }, {
      key: 'reports',
      label: 'Reports',
      icon: 'document-chart-bar'
    }]
  }), /*#__PURE__*/React.createElement(Navlist, {
    heading: "Settings",
    current: view,
    onSelect: onView,
    items: [{
      key: 'settings',
      label: 'Preferences',
      icon: 'cog-6-tooth'
    }, {
      key: 'team',
      label: 'Team',
      icon: 'users'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Dropdown, {
    align: "left",
    trigger: /*#__PURE__*/React.createElement(Profile, {
      name: "Rui Louren\xE7o",
      meta: "Admin"
    }),
    items: [{
      label: 'Account'
    }, {
      label: 'Billing'
    }, {
      separator: true
    }, {
      label: 'Sign out',
      danger: true
    }]
  }))), /*#__PURE__*/React.createElement("main", {
    style: {
      background: 'var(--color-ground)',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0 1.75rem',
      height: '4.5rem',
      borderBottom: '1px solid var(--color-line)',
      background: 'color-mix(in oklab, var(--color-ground) 85%, transparent)',
      backdropFilter: 'blur(12px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      maxWidth: '22rem'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    icon: "magnifying-glass",
    placeholder: "Search suppliers"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    className: "btn-cog",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "bell-alert",
      size: 18,
      className: "icon-brand"
    })
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    arrow: true,
    onClick: onNew
  }, "New assessment")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '1.75rem'
    }
  }, children)));
}
window.AppShell = AppShell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/workspace/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/workspace/Overview.jsx
try { (() => {
const {
  Display,
  Eyebrow,
  Stat,
  Tile,
  ProgressUnits,
  Callout,
  Separator,
  Card,
  Button
} = window.CMOREDesignSystem_9bac62;
function Overview({
  onOpenSuppliers
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Eyebrow, null, "Q4 2026"), /*#__PURE__*/React.createElement(Display, {
    size: "md",
    style: {
      marginTop: '0.75rem'
    }
  }, "Overview"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.75rem',
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(13rem, 1fr))'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.25rem'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "1,284",
    label: "Suppliers assessed"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.25rem'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "78",
    label: "Median score"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.25rem'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "3",
    label: "Overdue",
    activate: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.25rem'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "9 days",
    label: "Median turnaround"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1rem',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.5rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 600
    }
  }, "Q4 cycle \u2014 64 of 100 responses in"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)',
      marginTop: '0.125rem'
    }
  }, "Closes 12 December"), /*#__PURE__*/React.createElement(ProgressUnits, {
    value: 64,
    label: "Q4 cycle",
    style: {
      marginTop: '1rem',
      maxWidth: '22rem'
    }
  })), /*#__PURE__*/React.createElement(Callout, {
    variant: "warning",
    heading: "Three suppliers unreachable",
    style: {
      marginTop: '1rem'
    }
  }, "Their contact addresses bounced. Update them before the cycle closes."), /*#__PURE__*/React.createElement(Separator, {
    activate: true,
    style: {
      marginTop: '2rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '2rem',
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))'
    }
  }, /*#__PURE__*/React.createElement(Tile, {
    icon: "building-office-2",
    heading: "Tier 1",
    interactive: true
  }, "412 suppliers, 96% assessed this cycle."), /*#__PURE__*/React.createElement(Tile, {
    icon: "truck",
    heading: "Tier 2",
    interactive: true
  }, "639 suppliers, 71% assessed this cycle."), /*#__PURE__*/React.createElement(Tile, {
    icon: "globe-alt",
    heading: "Tier 3",
    activate: true,
    interactive: true
  }, "233 suppliers, first cycle under way.")), /*#__PURE__*/React.createElement(Card, {
    variant: "outline",
    heading: "Ready for the next cycle?",
    style: {
      marginTop: '1rem'
    },
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "outline",
      onClick: onOpenSuppliers
    }, "Review the supplier list")
  }, "Q1 opens on 6 January. Anything overdue rolls forward with its score unchanged."));
}
window.Overview = Overview;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/workspace/Overview.jsx", error: String((e && e.message) || e) }); }

// ui_kits/workspace/Settings.jsx
try { (() => {
const {
  Display,
  Eyebrow,
  Field,
  Input,
  Select,
  Textarea,
  Checkbox,
  RadioGroup,
  Switch,
  Button,
  Separator,
  Breadcrumbs
} = window.CMOREDesignSystem_9bac62;
function Settings() {
  const [freq, setFreq] = React.useState('quarterly');
  const [depth, setDepth] = React.useState('standard');
  const [alerts, setAlerts] = React.useState(true);
  const [digest, setDigest] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Breadcrumbs, {
    items: [{
      label: 'Workspace',
      href: '#'
    }, {
      label: 'Preferences'
    }]
  }), /*#__PURE__*/React.createElement(Display, {
    size: "md",
    style: {
      marginTop: '0.75rem'
    }
  }, "Preferences"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.75rem',
      maxWidth: '44rem',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.75rem',
      display: 'grid',
      gap: '1.5rem'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Organisation"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: '1fr 1fr'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Organisation",
    defaultValue: "C-MORE"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Billing email",
    type: "email",
    placeholder: "you@company.com"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Default tier",
    options: ['Tier 1', 'Tier 2', 'Tier 3']
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Cycle close",
    type: "date",
    defaultValue: "2026-12-12"
  })), /*#__PURE__*/React.createElement(Textarea, {
    label: "Notes for assessors",
    rows: 3,
    placeholder: "Anything the assessor should know"
  }), /*#__PURE__*/React.createElement(Separator, null), /*#__PURE__*/React.createElement(Eyebrow, null, "Cadence"), /*#__PURE__*/React.createElement(Field, {
    label: "Frequency"
  }, /*#__PURE__*/React.createElement(RadioGroup, {
    variant: "segmented",
    value: freq,
    onChange: setFreq,
    options: [{
      value: 'monthly',
      label: 'Monthly'
    }, {
      value: 'quarterly',
      label: 'Quarterly'
    }, {
      value: 'annual',
      label: 'Annual'
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Depth",
    description: "Deep assessments require a document on every answer."
  }, /*#__PURE__*/React.createElement(RadioGroup, {
    variant: "cards",
    value: depth,
    onChange: setDepth,
    options: [{
      value: 'standard',
      label: 'Standard',
      description: 'One questionnaire per quarter.'
    }, {
      value: 'deep',
      label: 'Deep',
      description: 'Evidence required on every answer.'
    }]
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Domains"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '1.5rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Climate",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Water",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Governance"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Labour"
  }))), /*#__PURE__*/React.createElement(Separator, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '0.875rem'
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    label: "Threshold alerts",
    description: "Tell me when a score drops below 60.",
    checked: alerts,
    onChange: setAlerts
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Weekly digest",
    description: "One email on Monday with the week's movement.",
    checked: digest,
    onChange: setDigest
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.625rem'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost"
  }, "Discard"), /*#__PURE__*/React.createElement(Button, {
    variant: "filled"
  }, "Save preferences"))));
}
window.Settings = Settings;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/workspace/Settings.jsx", error: String((e && e.message) || e) }); }

// ui_kits/workspace/SupplierDetail.jsx
try { (() => {
const {
  Display,
  Breadcrumbs,
  Badge,
  Button,
  Card,
  Stat,
  ProgressUnits,
  Avatar,
  Separator,
  Callout,
  Icon
} = window.CMOREDesignSystem_9bac62;
function SupplierDetail({
  row,
  onBack
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Breadcrumbs, {
    items: [{
      label: 'Workspace',
      href: '#'
    }, {
      label: 'Suppliers',
      href: '#'
    }, {
      label: row.supplier
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem'
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: row.supplier,
    size: "xl"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Display, {
    size: "sm"
  }, row.supplier), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.5rem',
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    size: "sm"
  }, "Tier ", row.tier), /*#__PURE__*/React.createElement(Badge, {
    size: "sm",
    color: row.color
  }, row.status), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, row.country, " \xB7 Owner ", row.owner)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.625rem'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    onClick: onBack
  }, "Back"), /*#__PURE__*/React.createElement(Button, {
    variant: "outline",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "paper-airplane",
      size: 16,
      className: "icon-brand"
    })
  }, "Send reminder"))), /*#__PURE__*/React.createElement(Separator, {
    style: {
      marginTop: '1.5rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.5rem',
      display: 'grid',
      gap: '1rem',
      gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.5rem'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 600
    }
  }, "Q4 questionnaire"), /*#__PURE__*/React.createElement(ProgressUnits, {
    value: row.score,
    label: "Completion",
    style: {
      marginTop: '1rem',
      maxWidth: '22rem'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.5rem',
      display: 'flex',
      flexDirection: 'column'
    }
  }, [['Climate', 'Complete', 'positive'], ['Water', 'Complete', 'positive'], ['Governance', 'Awaiting evidence', 'caution'], ['Labour', 'Not started', 'critical']].map(([d, s, c]) => /*#__PURE__*/React.createElement("div", {
    key: d,
    className: "cm-row",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 0.25rem',
      borderBottom: '1px solid var(--color-line)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 'var(--text-small)',
      fontWeight: 500
    }
  }, d), /*#__PURE__*/React.createElement(Badge, {
    size: "sm",
    color: c
  }, s))))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '1rem'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '1.25rem'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: row.score,
    label: "Current score",
    activate: true
  })), /*#__PURE__*/React.createElement(Callout, {
    heading: "Last contacted 14 November"
  }, "Reminder two of three. The next goes out automatically on 1 December."), /*#__PURE__*/React.createElement(Card, {
    variant: "soft",
    heading: "Escalate?",
    mark: false
  }, "An overdue tier-2 supplier blocks the tier-3 cycle behind it."))));
}
window.SupplierDetail = SupplierDetail;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/workspace/SupplierDetail.jsx", error: String((e && e.message) || e) }); }

// ui_kits/workspace/Suppliers.jsx
try { (() => {
const {
  Display,
  Table,
  Badge,
  Button,
  RadioGroup,
  Breadcrumbs,
  Avatar,
  Dropdown,
  Icon,
  Tooltip
} = window.CMOREDesignSystem_9bac62;
function Suppliers({
  onOpen
}) {
  const [sortBy, setSortBy] = React.useState('score');
  const [dir, setDir] = React.useState('desc');
  const [filter, setFilter] = React.useState('all');
  const sort = k => {
    if (k === sortBy) setDir(dir === 'asc' ? 'desc' : 'asc');else {
      setSortBy(k);
      setDir('asc');
    }
  };
  const rows = window.WS_SUPPLIERS.filter(r => filter === 'all' || (filter === 'open' ? r.status !== 'Assessed' : r.status === 'Assessed')).sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1) * (dir === 'asc' ? 1 : -1));
  const cols = [{
    key: 'supplier',
    label: 'Supplier',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("button", {
      type: "button",
      onClick: () => onOpen(r),
      style: {
        border: 0,
        background: 'transparent',
        font: 'inherit',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: 0,
        color: 'var(--color-ink)'
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.supplier,
      size: "xs"
    }), r.supplier)
  }, {
    key: 'country',
    label: 'Country'
  }, {
    key: 'tier',
    label: 'Tier',
    sortable: true,
    render: r => 'Tier ' + r.tier
  }, {
    key: 'owner',
    label: 'Owner'
  }, {
    key: 'score',
    label: 'Score',
    sortable: true,
    numeric: true,
    align: 'right'
  }, {
    key: 'status',
    label: 'Status',
    render: r => /*#__PURE__*/React.createElement(Badge, {
      color: r.color,
      size: "sm"
    }, r.status)
  }, {
    key: 'actions',
    label: '',
    align: 'right',
    render: () => /*#__PURE__*/React.createElement(Dropdown, {
      align: "right",
      trigger: /*#__PURE__*/React.createElement(Button, {
        variant: "ghost",
        size: "xs",
        icon: /*#__PURE__*/React.createElement(Icon, {
          name: "ellipsis-horizontal",
          size: 16,
          className: "icon-brand"
        })
      }),
      items: [{
        label: 'Send reminder'
      }, {
        label: 'Export CSV'
      }, {
        separator: true
      }, {
        label: 'Remove',
        danger: true
      }]
    })
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Breadcrumbs, {
    items: [{
      label: 'Workspace',
      href: '#'
    }, {
      label: 'Suppliers'
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '0.75rem',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Display, {
    size: "md"
  }, "Suppliers"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '0.625rem',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(RadioGroup, {
    variant: "pills",
    value: filter,
    onChange: setFilter,
    options: [{
      value: 'all',
      label: 'All'
    }, {
      value: 'open',
      label: 'Open'
    }, {
      value: 'closed',
      label: 'Assessed'
    }]
  }), /*#__PURE__*/React.createElement(Tooltip, {
    content: "Export CSV",
    kbd: "\u2318E"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "filled",
    size: "sm",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-down-tray",
      size: 16,
      className: "icon-brand"
    })
  }, "Export")))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '1.5rem',
      background: 'var(--color-surface)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-hairline)',
      padding: '0.5rem 1rem'
    }
  }, /*#__PURE__*/React.createElement(Table, {
    columns: cols,
    rows: rows,
    sortBy: sortBy,
    sortDirection: dir,
    onSort: sort
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: '0.75rem',
      fontSize: 'var(--text-tiny)',
      color: 'var(--color-ink-subtle)'
    }
  }, "Five of 1,284 rows shown \u2014 the full list paginates in the product."));
}
window.Suppliers = Suppliers;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/workspace/Suppliers.jsx", error: String((e && e.message) || e) }); }

// ui_kits/workspace/data.js
try { (() => {
window.WS_SUPPLIERS = [{
  id: 1,
  supplier: 'Northwind Materials',
  tier: 1,
  score: 86,
  status: 'Assessed',
  color: 'positive',
  owner: 'Ana Silva',
  country: 'Portugal'
}, {
  id: 2,
  supplier: 'Verax Industrial',
  tier: 1,
  score: 72,
  status: 'Pending',
  color: 'caution',
  owner: 'Bruno Costa',
  country: 'Spain'
}, {
  id: 3,
  supplier: 'Almada Logistics',
  tier: 2,
  score: 54,
  status: 'Overdue',
  color: 'critical',
  owner: 'Carla Dias',
  country: 'Portugal'
}, {
  id: 4,
  supplier: 'Belmonte Chemicals',
  tier: 2,
  score: 91,
  status: 'Assessed',
  color: 'positive',
  owner: 'Ana Silva',
  country: 'Brazil'
}, {
  id: 5,
  supplier: 'Caldeira Freight',
  tier: 3,
  score: 63,
  status: 'Pending',
  color: 'caution',
  owner: 'Rui Lourenço',
  country: 'Portugal'
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/workspace/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Brand = __ds_scope.Brand;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconPlate = __ds_scope.IconPlate;

__ds_ns.PixelArrow = __ds_scope.PixelArrow;

__ds_ns.ProgressUnits = __ds_scope.ProgressUnits;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Swatch = __ds_scope.Swatch;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Display = __ds_scope.Display;

__ds_ns.Lead = __ds_scope.Lead;

__ds_ns.Section = __ds_scope.Section;

__ds_ns.Separator = __ds_scope.Separator;

__ds_ns.Tile = __ds_scope.Tile;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarGroup = __ds_scope.AvatarGroup;

__ds_ns.Profile = __ds_scope.Profile;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.RadioGroup = __ds_scope.RadioGroup;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Breadcrumbs = __ds_scope.Breadcrumbs;

__ds_ns.CTA = __ds_scope.CTA;

__ds_ns.Dropdown = __ds_scope.Dropdown;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Navbar = __ds_scope.Navbar;

__ds_ns.Navlist = __ds_scope.Navlist;

__ds_ns.Toast = __ds_scope.Toast;

})();
