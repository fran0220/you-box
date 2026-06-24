/* @ds-bundle: {"format":3,"namespace":"YouBoxDesignSystem_6d62a1","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"CodeBlock","sourcePath":"components/code/CodeBlock.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Stat","sourcePath":"components/data-display/Stat.jsx"},{"name":"Tag","sourcePath":"components/data-display/Tag.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"ModelCard","sourcePath":"components/models/ModelCard.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"Tabs","sourcePath":"components/surfaces/Tabs.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"81e2abb63ca4","components/buttons/IconButton.jsx":"fd40510f79bd","components/code/CodeBlock.jsx":"bb8cbc60c2bc","components/data-display/Avatar.jsx":"2ed462ac4275","components/data-display/Badge.jsx":"2e336290df7b","components/data-display/Stat.jsx":"4d66b94506c9","components/data-display/Tag.jsx":"4831f4b5a46f","components/forms/Input.jsx":"810ff427b27b","components/forms/Switch.jsx":"e608024d1f23","components/models/ModelCard.jsx":"37f1f9a4c3b8","components/surfaces/Card.jsx":"6d02b4ce4405","components/surfaces/Tabs.jsx":"da8865fa4b48","ui_kits/marketing/Features.jsx":"4b0a3b397363","ui_kits/marketing/Footer.jsx":"0d23e5b60054","ui_kits/marketing/Hero.jsx":"91205a135f51","ui_kits/marketing/Marketplace.jsx":"aa31ee618c08","ui_kits/marketing/Nav.jsx":"2c9523195d1d","ui_kits/marketing/Pricing.jsx":"0dd6c46d21a7","ui_kits/marketing/Quickstart.jsx":"265b81f2992d","ui_kits/marketing/data.js":"a7bb2caf57fe"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.YouBoxDesignSystem_6d62a1 = window.YouBoxDesignSystem_6d62a1 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-button-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-btn{
    --_h: var(--control-md);
    display:inline-flex;align-items:center;justify-content:center;gap:8px;
    height:var(--_h);padding:0 16px;border-radius:var(--radius-md);
    font-family:var(--font-sans);font-size:var(--text-sm);font-weight:var(--fw-semibold);
    letter-spacing:-0.005em;line-height:1;white-space:nowrap;
    border:1px solid transparent;cursor:pointer;user-select:none;
    transition:background var(--dur-fast) var(--ease-out),
               border-color var(--dur-fast) var(--ease-out),
               transform var(--dur-instant) var(--ease-out),
               box-shadow var(--dur-fast) var(--ease-out),
               color var(--dur-fast) var(--ease-out);
    text-decoration:none;
  }
  .yb-btn:focus-visible{outline:none;box-shadow:var(--ring)}
  .yb-btn:active{transform:translateY(0.5px) scale(0.985)}
  .yb-btn[disabled],.yb-btn[aria-disabled="true"]{opacity:0.45;pointer-events:none}
  .yb-btn svg{width:1.05em;height:1.05em;flex:none}

  .yb-btn--sm{--_h:var(--control-sm);padding:0 12px;font-size:var(--text-xs);border-radius:var(--radius-sm)}
  .yb-btn--lg{--_h:var(--control-lg);padding:0 22px;font-size:var(--text-base)}
  .yb-btn--block{width:100%}

  /* primary */
  .yb-btn--primary{background:var(--brand);color:var(--text-on-brand);box-shadow:var(--glow-brand)}
  .yb-btn--primary:hover{background:var(--brand-hover)}
  .yb-btn--primary:active{background:var(--brand-active)}

  /* secondary */
  .yb-btn--secondary{background:var(--surface-2);color:var(--text);border-color:var(--border-strong)}
  .yb-btn--secondary:hover{background:var(--surface-3);border-color:var(--border-strong)}

  /* ghost */
  .yb-btn--ghost{background:transparent;color:var(--text-secondary)}
  .yb-btn--ghost:hover{background:var(--surface-hover);color:var(--text)}

  /* subtle (brand tint) */
  .yb-btn--subtle{background:var(--brand-subtle);color:var(--brand)}
  .yb-btn--subtle:hover{background:var(--brand-subtle);color:var(--brand-hover);border-color:var(--brand-border)}

  /* danger */
  .yb-btn--danger{background:var(--danger);color:#fff}
  .yb-btn--danger:hover{filter:brightness(1.08)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * YouBox primary action button.
 */
function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  iconLeft = null,
  iconRight = null,
  as = 'button',
  className = '',
  children,
  ...props
}) {
  const Tag = as;
  const cls = ['yb-btn', `yb-btn--${variant}`, size !== 'md' ? `yb-btn--${size}` : '', block ? 'yb-btn--block' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, props), iconLeft, children != null && /*#__PURE__*/React.createElement("span", null, children), iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-iconbutton-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-iconbtn{
    --_s: var(--control-md);
    display:inline-flex;align-items:center;justify-content:center;
    width:var(--_s);height:var(--_s);border-radius:var(--radius-md);
    border:1px solid transparent;background:transparent;color:var(--text-secondary);
    cursor:pointer;flex:none;
    transition:background var(--dur-fast) var(--ease-out),
               color var(--dur-fast) var(--ease-out),
               border-color var(--dur-fast) var(--ease-out),
               transform var(--dur-instant) var(--ease-out);
  }
  .yb-iconbtn:hover{background:var(--surface-hover);color:var(--text)}
  .yb-iconbtn:active{transform:scale(0.92)}
  .yb-iconbtn:focus-visible{outline:none;box-shadow:var(--ring)}
  .yb-iconbtn[disabled]{opacity:0.4;pointer-events:none}
  .yb-iconbtn svg{width:1.1em;height:1.1em}
  .yb-iconbtn--sm{--_s:var(--control-sm)}
  .yb-iconbtn--lg{--_s:var(--control-lg)}
  .yb-iconbtn--solid{background:var(--surface-2);border-color:var(--border)}
  .yb-iconbtn--solid:hover{background:var(--surface-3)}
  .yb-iconbtn--brand{background:var(--brand);color:var(--text-on-brand)}
  .yb-iconbtn--brand:hover{background:var(--brand-hover)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * Square icon-only button. Pass an svg/icon node as children. Always give a `title`/aria-label.
 */
function IconButton({
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
  ...props
}) {
  const cls = ['yb-iconbtn', variant !== 'ghost' ? `yb-iconbtn--${variant}` : '', size !== 'md' ? `yb-iconbtn--${size}` : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls
  }, props), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/code/CodeBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState,
  useRef
} = React;
const STYLE_ID = 'yb-code-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-code{
    background:var(--code-bg);border:1px solid var(--code-border);
    border-radius:var(--radius-lg);overflow:hidden;font-family:var(--font-mono);
  }
  .yb-code__bar{
    display:flex;align-items:center;gap:10px;height:38px;padding:0 10px 0 14px;
    border-bottom:1px solid var(--code-border);background:var(--surface-inset);
  }
  .yb-code__dots{display:flex;gap:6px}
  .yb-code__dots i{width:10px;height:10px;border-radius:50%;background:var(--ink-700)}
  .yb-code__lang{font-size:var(--text-2xs);font-weight:var(--fw-medium);letter-spacing:.06em;
    text-transform:uppercase;color:var(--text-muted)}
  .yb-code__file{font-size:var(--text-xs);color:var(--text-secondary)}
  .yb-code__spacer{flex:1}
  .yb-code__copy{
    display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 10px;
    border:1px solid var(--border);border-radius:var(--radius-sm);background:transparent;
    color:var(--text-secondary);font-family:var(--font-mono);font-size:var(--text-2xs);cursor:pointer;
    transition:color var(--dur-fast) var(--ease-out),border-color var(--dur-fast) var(--ease-out);
  }
  .yb-code__copy:hover{color:var(--text);border-color:var(--border-strong)}
  .yb-code__copy.is-copied{color:var(--success);border-color:var(--success)}
  .yb-code__copy svg{width:13px;height:13px}
  .yb-code__pre{margin:0;padding:16px 18px;overflow:auto;
    font-size:var(--text-sm);line-height:var(--leading-relaxed);color:var(--ink-200)}
  .yb-code__pre code{font-family:inherit}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * Code / terminal block with a chrome bar, language label, and copy button.
 */
function CodeBlock({
  language = 'bash',
  filename,
  code = '',
  dots = true,
  children,
  className = '',
  ...props
}) {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const copy = () => {
    const text = code || (ref.current ? ref.current.innerText : '');
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['yb-code', className].filter(Boolean).join(' ')
  }, props), /*#__PURE__*/React.createElement("div", {
    className: "yb-code__bar"
  }, dots && /*#__PURE__*/React.createElement("span", {
    className: "yb-code__dots"
  }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null)), filename ? /*#__PURE__*/React.createElement("span", {
    className: "yb-code__file"
  }, filename) : /*#__PURE__*/React.createElement("span", {
    className: "yb-code__lang"
  }, language), /*#__PURE__*/React.createElement("span", {
    className: "yb-code__spacer"
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: `yb-code__copy${copied ? ' is-copied' : ''}`,
    onClick: copy
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": copied ? 'check' : 'copy'
  }), copied ? 'Copied' : 'Copy')), /*#__PURE__*/React.createElement("pre", {
    className: "yb-code__pre"
  }, /*#__PURE__*/React.createElement("code", {
    ref: ref
  }, children ?? code)));
}
Object.assign(__ds_scope, { CodeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/code/CodeBlock.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-avatar-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-avatar{
    --_s:36px;
    display:inline-flex;align-items:center;justify-content:center;flex:none;
    width:var(--_s);height:var(--_s);border-radius:var(--radius-md);
    font-family:var(--font-display);font-weight:var(--fw-bold);
    color:#fff;overflow:hidden;user-select:none;
    border:1px solid rgba(255,255,255,0.10);
    font-size:calc(var(--_s) * 0.42);line-height:1;
  }
  .yb-avatar img{width:100%;height:100%;object-fit:cover;display:block}
  .yb-avatar--circle{border-radius:50%}
  .yb-avatar--sm{--_s:26px}
  .yb-avatar--lg{--_s:48px}
  .yb-avatar--xl{--_s:64px}
  `;
  document.head.appendChild(el);
}
injectStyles();
const PALETTE = ['#0090ff', '#1FBEA3', '#4D9FFF', '#A974FF', '#F0B429', '#F5483B', '#34C759', '#FF7FB0'];
function colorFor(name = '') {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function initials(name = '') {
  const parts = name.trim().split(/[\s/_-]+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Square (or circular) avatar for providers, models, and users. Renders an
 * image when `src` is given, otherwise deterministic initials on a color
 * derived from `name`.
 */
function Avatar({
  name = '',
  src,
  size = 'md',
  shape = 'rounded',
  color,
  className = '',
  style,
  ...props
}) {
  const cls = ['yb-avatar', size !== 'md' ? `yb-avatar--${size}` : '', shape === 'circle' ? 'yb-avatar--circle' : '', className].filter(Boolean).join(' ');
  const bg = color || colorFor(name);
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls,
    style: {
      background: src ? 'var(--surface-3)' : bg,
      ...style
    },
    title: name
  }, props), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name
  }) : initials(name));
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-badge-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-badge{
    display:inline-flex;align-items:center;gap:5px;
    height:21px;padding:0 8px;border-radius:var(--radius-sm);
    font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--fw-medium);
    line-height:1;white-space:nowrap;border:1px solid transparent;
  }
  .yb-badge__dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
  .yb-badge svg{width:12px;height:12px}

  .yb-badge--neutral{background:var(--surface-3);color:var(--text-secondary);border-color:var(--border)}
  .yb-badge--brand{background:var(--brand-subtle);color:var(--brand)}
  .yb-badge--success{background:var(--success-subtle);color:var(--success)}
  .yb-badge--warning{background:var(--warning-subtle);color:var(--warning)}
  .yb-badge--danger{background:var(--danger-subtle);color:var(--danger)}
  .yb-badge--info{background:var(--info-subtle);color:var(--info)}

  .yb-badge--solid.yb-badge--brand{background:var(--brand);color:var(--text-on-brand)}
  .yb-badge--solid.yb-badge--success{background:var(--success);color:#06210E}
  .yb-badge--solid.yb-badge--danger{background:var(--danger);color:#fff}
  .yb-badge--solid.yb-badge--neutral{background:var(--ink-200);color:var(--ink-900)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * Compact status / category label.
 */
function Badge({
  variant = 'neutral',
  solid = false,
  dot = false,
  icon = null,
  className = '',
  children,
  ...props
}) {
  const cls = ['yb-badge', `yb-badge--${variant}`, solid ? 'yb-badge--solid' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, props), dot && /*#__PURE__*/React.createElement("span", {
    className: "yb-badge__dot"
  }), icon, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-stat-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-stat{display:flex;flex-direction:column;gap:3px;font-family:var(--font-sans)}
  .yb-stat__label{font-family:var(--font-mono);font-size:var(--text-2xs);font-weight:var(--fw-medium);
    letter-spacing:0.06em;text-transform:uppercase;color:var(--text-muted)}
  .yb-stat__value{font-family:var(--font-display);font-weight:var(--fw-semibold);
    font-size:var(--text-2xl);color:var(--text-strong);line-height:1;letter-spacing:-0.02em;
    display:flex;align-items:baseline;gap:5px}
  .yb-stat__unit{font-family:var(--font-mono);font-size:var(--text-sm);font-weight:var(--fw-regular);color:var(--text-muted)}
  .yb-stat__delta{display:inline-flex;align-items:center;gap:3px;font-family:var(--font-mono);
    font-size:var(--text-xs);font-weight:var(--fw-medium)}
  .yb-stat__delta--up{color:var(--success)}
  .yb-stat__delta--down{color:var(--danger)}
  .yb-stat__delta svg{width:12px;height:12px}
  .yb-stat--sm .yb-stat__value{font-size:var(--text-lg)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * A labeled metric — used in marketplace cards and dashboards for throughput,
 * latency, price, and similar figures.
 */
function Stat({
  label,
  value,
  unit,
  delta,
  deltaDir = 'up',
  size = 'md',
  className = '',
  ...props
}) {
  const cls = ['yb-stat', size !== 'md' ? `yb-stat--${size}` : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, props), label && /*#__PURE__*/React.createElement("span", {
    className: "yb-stat__label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "yb-stat__value"
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    className: "yb-stat__unit"
  }, unit), delta != null && /*#__PURE__*/React.createElement("span", {
    className: `yb-stat__delta yb-stat__delta--${deltaDir}`
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": deltaDir === 'up' ? 'trending-up' : 'trending-down'
  }), delta)));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Stat.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-tag-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-tag{
    display:inline-flex;align-items:center;gap:6px;
    height:26px;padding:0 10px;border-radius:var(--radius-pill);
    background:var(--surface-2);border:1px solid var(--border);
    font-family:var(--font-mono);font-size:var(--text-2xs);font-weight:var(--fw-medium);
    letter-spacing:0.02em;color:var(--text-secondary);white-space:nowrap;
    transition:border-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
  }
  .yb-tag svg{width:13px;height:13px}
  .yb-tag__dot{width:7px;height:7px;border-radius:50%;background:var(--accent);flex:none}
  .yb-tag--interactive{cursor:pointer}
  .yb-tag--interactive:hover{border-color:var(--brand-border);color:var(--text)}
  .yb-tag--active{background:var(--brand-subtle);border-color:var(--brand-border);color:var(--brand)}
  .yb-tag__x{display:inline-flex;margin-right:-3px;border:none;background:none;color:inherit;cursor:pointer;opacity:.6;padding:2px;border-radius:50%}
  .yb-tag__x:hover{opacity:1;background:var(--surface-3)}
  .yb-tag__x svg{width:11px;height:11px}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * Pill chip in the mono font — used for model modalities, context sizes, and
 * filterable categories.
 */
function Tag({
  dot = false,
  icon = null,
  active = false,
  interactive = false,
  onRemove,
  className = '',
  children,
  ...props
}) {
  const cls = ['yb-tag', interactive || props.onClick ? 'yb-tag--interactive' : '', active ? 'yb-tag--active' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", _extends({
    className: cls
  }, props), dot && /*#__PURE__*/React.createElement("span", {
    className: "yb-tag__dot"
  }), icon, children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "yb-tag__x",
    "aria-label": "Remove",
    onClick: e => {
      e.stopPropagation();
      onRemove(e);
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "x"
  })));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
const STYLE_ID = 'yb-input-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-field{display:flex;flex-direction:column;gap:6px;font-family:var(--font-sans)}
  .yb-field__label{font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text)}
  .yb-field__req{color:var(--brand);margin-left:2px}
  .yb-input-wrap{position:relative;display:flex;align-items:center}
  .yb-input-wrap svg{position:absolute;width:16px;height:16px;color:var(--text-muted);pointer-events:none}
  .yb-input-wrap .yb-ic-l{left:12px}
  .yb-input{
    width:100%;height:var(--control-md);box-sizing:border-box;
    background:var(--field-bg);color:var(--text);
    border:1px solid var(--field-border);border-radius:var(--radius-md);
    font-family:var(--font-sans);font-size:var(--text-base);
    padding:0 14px;outline:none;
    transition:border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  }
  .yb-input::placeholder{color:var(--field-placeholder)}
  .yb-input:hover{border-color:var(--border-strong)}
  .yb-input:focus{border-color:var(--brand);box-shadow:var(--ring)}
  .yb-input--with-icon{padding-left:36px}
  .yb-input--sm{height:var(--control-sm);font-size:var(--text-sm);border-radius:var(--radius-sm)}
  .yb-input--lg{height:var(--control-lg)}
  .yb-input--mono{font-family:var(--font-mono);font-size:var(--text-sm)}
  .yb-field--error .yb-input{border-color:var(--danger)}
  .yb-field--error .yb-input:focus{box-shadow:0 0 0 3px var(--danger-subtle)}
  .yb-field__hint{font-size:var(--text-xs);color:var(--text-muted)}
  .yb-field__hint--error{color:var(--danger)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * Labeled text input with optional leading icon, hint and error states.
 */
function Input({
  label,
  hint,
  error,
  required = false,
  size = 'md',
  leadingIcon = null,
  mono = false,
  id,
  className = '',
  ...props
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const inputCls = ['yb-input', size !== 'md' ? `yb-input--${size}` : '', leadingIcon ? 'yb-input--with-icon' : '', mono ? 'yb-input--mono' : ''].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: ['yb-field', error ? 'yb-field--error' : '', className].filter(Boolean).join(' ')
  }, label && /*#__PURE__*/React.createElement("label", {
    className: "yb-field__label",
    htmlFor: fieldId
  }, label, required && /*#__PURE__*/React.createElement("span", {
    className: "yb-field__req"
  }, "*")), /*#__PURE__*/React.createElement("div", {
    className: "yb-input-wrap"
  }, leadingIcon && /*#__PURE__*/React.createElement("span", {
    className: "yb-ic-l"
  }, leadingIcon), /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    className: inputCls
  }, props))), (error || hint) && /*#__PURE__*/React.createElement("span", {
    className: ['yb-field__hint', error ? 'yb-field__hint--error' : ''].filter(Boolean).join(' ')
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-switch-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-switch{display:inline-flex;align-items:center;gap:10px;cursor:pointer;font-family:var(--font-sans);user-select:none}
  .yb-switch input{position:absolute;opacity:0;width:0;height:0}
  .yb-switch__track{
    position:relative;width:40px;height:23px;border-radius:var(--radius-pill);
    background:var(--surface-3);border:1px solid var(--border-strong);flex:none;
    transition:background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out);
  }
  .yb-switch__thumb{
    position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;
    background:var(--ink-200);box-shadow:var(--shadow-xs);
    transition:transform var(--dur-base) var(--ease-spring), background var(--dur-base) var(--ease-out);
  }
  .yb-switch input:checked + .yb-switch__track{background:var(--brand);border-color:transparent}
  .yb-switch input:checked + .yb-switch__track .yb-switch__thumb{transform:translateX(17px);background:#fff}
  .yb-switch input:focus-visible + .yb-switch__track{box-shadow:var(--ring)}
  .yb-switch input:disabled + .yb-switch__track{opacity:0.4}
  .yb-switch__label{font-size:var(--text-sm);color:var(--text)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * On/off toggle switch.
 */
function Switch({
  checked,
  defaultChecked,
  onChange,
  label,
  disabled,
  className = '',
  ...props
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: ['yb-switch', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled
  }, props)), /*#__PURE__*/React.createElement("span", {
    className: "yb-switch__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "yb-switch__thumb"
  })), label && /*#__PURE__*/React.createElement("span", {
    className: "yb-switch__label"
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/models/ModelCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-modelcard-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-model{
    display:flex;flex-direction:column;gap:14px;
    background:var(--surface-card);border:1px solid var(--border);
    border-radius:var(--radius-lg);padding:var(--space-5);cursor:pointer;
    transition:border-color var(--dur-base) var(--ease-out),
               transform var(--dur-base) var(--ease-out),
               box-shadow var(--dur-base) var(--ease-out);
  }
  .yb-model:hover{border-color:var(--brand-border);transform:translateY(-2px);box-shadow:var(--glow-brand)}
  .yb-model__head{display:flex;align-items:flex-start;gap:12px}
  .yb-model__title{flex:1;min-width:0}
  .yb-model__name{font-family:var(--font-display);font-weight:var(--fw-semibold);font-size:var(--text-lg);
    color:var(--text-strong);letter-spacing:-0.01em;line-height:1.2;display:flex;align-items:center;gap:8px}
  .yb-model__by{font-family:var(--font-mono);font-size:var(--text-2xs);color:var(--text-muted);
    margin-top:3px;letter-spacing:0.02em}
  .yb-model__fav{border:none;background:none;color:var(--text-faint);cursor:pointer;padding:2px;flex:none}
  .yb-model__fav:hover{color:var(--brand)}
  .yb-model__fav svg{width:17px;height:17px}
  .yb-model__desc{font-size:var(--text-sm);color:var(--text-secondary);line-height:1.5;margin:0;
    display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .yb-model__tags{display:flex;flex-wrap:wrap;gap:6px}
  .yb-model__foot{display:flex;align-items:center;gap:20px;padding-top:13px;border-top:1px solid var(--divider)}
  .yb-model__metric{display:flex;flex-direction:column;gap:2px}
  .yb-model__metric .k{font-family:var(--font-mono);font-size:9px;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted)}
  .yb-model__metric .v{font-family:var(--font-mono);font-size:var(--text-sm);font-weight:var(--fw-medium);color:var(--text)}
  .yb-model__metric .v b{color:var(--brand);font-weight:var(--fw-medium)}
  .yb-model__spacer{flex:1}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * The marketplace listing card for a single model. Composes Avatar, Tag and Badge.
 */
function ModelCard({
  name,
  provider,
  providerLogo,
  description,
  tags = [],
  contextTokens,
  priceIn,
  priceOut,
  throughput,
  badge,
  favorited = false,
  onFavorite,
  className = '',
  ...props
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: ['yb-model', className].filter(Boolean).join(' ')
  }, props), /*#__PURE__*/React.createElement("div", {
    className: "yb-model__head"
  }, /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    name: provider,
    src: providerLogo,
    size: "lg"
  }), /*#__PURE__*/React.createElement("div", {
    className: "yb-model__title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-model__name"
  }, name, badge && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    variant: "brand"
  }, badge)), /*#__PURE__*/React.createElement("div", {
    className: "yb-model__by"
  }, provider, contextTokens ? ` · ${contextTokens} context` : '')), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "yb-model__fav",
    "aria-label": "Favorite",
    onClick: e => {
      e.stopPropagation();
      onFavorite && onFavorite(e);
    },
    style: favorited ? {
      color: 'var(--brand)'
    } : undefined
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "star"
  }))), description && /*#__PURE__*/React.createElement("p", {
    className: "yb-model__desc"
  }, description), tags.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "yb-model__tags"
  }, tags.map(t => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: t
  }, t))), /*#__PURE__*/React.createElement("div", {
    className: "yb-model__foot"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-model__metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Input / 1M"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, priceIn != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "$", priceIn)) : '—')), /*#__PURE__*/React.createElement("div", {
    className: "yb-model__metric"
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Output / 1M"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, priceOut != null ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", null, "$", priceOut)) : '—')), /*#__PURE__*/React.createElement("div", {
    className: "yb-model__spacer"
  }), throughput && /*#__PURE__*/React.createElement("div", {
    className: "yb-model__metric",
    style: {
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "k"
  }, "Throughput"), /*#__PURE__*/React.createElement("span", {
    className: "v"
  }, throughput, " tok/s"))));
}
Object.assign(__ds_scope, { ModelCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/models/ModelCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STYLE_ID = 'yb-card-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-card{
    background:var(--surface-card);border:1px solid var(--border);
    border-radius:var(--radius-lg);padding:var(--space-5);
    transition:border-color var(--dur-base) var(--ease-out),
               transform var(--dur-base) var(--ease-out),
               box-shadow var(--dur-base) var(--ease-out);
  }
  .yb-card--pad-sm{padding:var(--space-4)}
  .yb-card--pad-lg{padding:var(--space-7)}
  .yb-card--inset{background:var(--surface-inset)}
  .yb-card--interactive{cursor:pointer}
  .yb-card--interactive:hover{border-color:var(--border-strong);transform:translateY(-2px);box-shadow:var(--shadow-md)}
  .yb-card--glow:hover{border-color:var(--brand-border);box-shadow:var(--glow-brand)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * The base surface container. Most product UI is composed from cards.
 */
function Card({
  pad = 'md',
  inset = false,
  interactive = false,
  glow = false,
  as = 'div',
  className = '',
  children,
  ...props
}) {
  const Tag = as;
  const cls = ['yb-card', pad !== 'md' ? `yb-card--pad-${pad}` : '', inset ? 'yb-card--inset' : '', interactive ? 'yb-card--interactive' : '', glow ? 'yb-card--glow' : '', className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: cls
  }, props), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
const STYLE_ID = 'yb-tabs-styles';
function injectStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .yb-tabs{display:inline-flex;align-items:center;gap:2px;font-family:var(--font-sans)}
  .yb-tabs--line{gap:18px;border-bottom:1px solid var(--border);width:100%}
  .yb-tabs--pill{background:var(--surface-inset);border:1px solid var(--border);
    border-radius:var(--radius-md);padding:3px}
  .yb-tab{
    appearance:none;border:none;background:none;cursor:pointer;
    font-family:inherit;font-size:var(--text-sm);font-weight:var(--fw-medium);
    color:var(--text-secondary);display:inline-flex;align-items:center;gap:7px;
    transition:color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
  }
  .yb-tab svg{width:15px;height:15px}
  .yb-tab__count{font-family:var(--font-mono);font-size:var(--text-2xs);color:var(--text-muted);
    background:var(--surface-3);border-radius:var(--radius-pill);padding:1px 6px}
  /* pill */
  .yb-tabs--pill .yb-tab{height:30px;padding:0 14px;border-radius:var(--radius-sm)}
  .yb-tabs--pill .yb-tab:hover{color:var(--text)}
  .yb-tabs--pill .yb-tab--active{background:var(--surface-2);color:var(--text-strong);box-shadow:var(--shadow-xs)}
  /* line */
  .yb-tabs--line .yb-tab{height:38px;padding:0 1px;position:relative}
  .yb-tabs--line .yb-tab:hover{color:var(--text)}
  .yb-tabs--line .yb-tab--active{color:var(--text-strong)}
  .yb-tabs--line .yb-tab--active::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;
    background:var(--brand);border-radius:var(--radius-pill)}
  `;
  document.head.appendChild(el);
}
injectStyles();

/**
 * Tab strip. Controlled (`value` + `onChange`) or uncontrolled (`defaultValue`).
 * `items` is an array of { value, label, icon?, count? }.
 */
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  variant = 'pill',
  className = '',
  ...props
}) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.value);
  const active = value !== undefined ? value : internal;
  const select = v => {
    if (value === undefined) setInternal(v);
    onChange && onChange(v);
  };
  const cls = ['yb-tabs', `yb-tabs--${variant}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls,
    role: "tablist"
  }, props), items.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.value,
    role: "tab",
    "aria-selected": active === it.value,
    className: ['yb-tab', active === it.value ? 'yb-tab--active' : ''].filter(Boolean).join(' '),
    onClick: () => select(it.value)
  }, it.icon, it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
    className: "yb-tab__count"
  }, it.count))));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Features.jsx
try { (() => {
function Features() {
  const items = [{
    icon: 'plug-zap',
    title: 'Unified API',
    desc: 'One OpenAI-compatible endpoint for every provider. Swap models by changing a single string.'
  }, {
    icon: 'route',
    title: 'Smart routing',
    desc: 'Route each request by cost, latency, or context window — automatically pick the best fit.'
  }, {
    icon: 'shield-check',
    title: 'Automatic failover',
    desc: 'If a provider degrades or rate-limits, YouBox retries the next best model in milliseconds.'
  }, {
    icon: 'bar-chart-3',
    title: 'Usage analytics',
    desc: 'Per-key spend, latency, and token dashboards across every model in one place.'
  }, {
    icon: 'badge-dollar-sign',
    title: 'Pass-through pricing',
    desc: 'Pay provider rates with no token markup. One invoice, one balance, every model.'
  }, {
    icon: 'key-round',
    title: 'One key, full control',
    desc: 'Scoped keys, hard spend caps, and org-level rate limits out of the box.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "features"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "// Why YouBox"), /*#__PURE__*/React.createElement("h2", null, "The control plane for LLMs."), /*#__PURE__*/React.createElement("p", null, "Everything you need to ship on top of any model \u2014 without rewriting your stack each time a better one ships.")), /*#__PURE__*/React.createElement("div", {
    className: "feat-grid"
  }, items.map(f => /*#__PURE__*/React.createElement("div", {
    className: "feat",
    key: f.title
  }, /*#__PURE__*/React.createElement("div", {
    className: "feat__icon"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: f.icon
  })), /*#__PURE__*/React.createElement("h3", null, f.title), /*#__PURE__*/React.createElement("p", null, f.desc))))));
}
Object.assign(window, {
  Features
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Features.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Footer.jsx
try { (() => {
function Footer() {
  const cols = [{
    h: 'Product',
    links: ['Models', 'Pricing', 'Rankings', 'Changelog', 'Status']
  }, {
    h: 'Developers',
    links: ['Docs', 'API reference', 'SDKs', 'Quickstart', 'Cookbook']
  }, {
    h: 'Company',
    links: ['About', 'Blog', 'Careers', 'Privacy', 'Terms']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer__grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "footer__brand"
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/youbox-mark.svg",
    width: "24",
    height: "24",
    alt: ""
  }), "You", /*#__PURE__*/React.createElement("b", null, "Box")), /*#__PURE__*/React.createElement("p", {
    className: "footer__tag"
  }, "The unified gateway to every AI model. One API, every provider, pass-through pricing.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    className: "footer__col",
    key: c.h
  }, /*#__PURE__*/React.createElement("h4", null, c.h), c.links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: "#",
    onClick: e => e.preventDefault()
  }, l))))), /*#__PURE__*/React.createElement("div", {
    className: "footer__bar"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 YouBox, Inc."), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "github",
    style: {
      width: 17,
      height: 17
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "twitter",
    style: {
      width: 17,
      height: 17
    }
  }), /*#__PURE__*/React.createElement(Icon, {
    name: "message-circle",
    style: {
      width: 17,
      height: 17
    }
  })))));
}
Object.assign(window, {
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Hero.jsx
try { (() => {
const {
  Button,
  CodeBlock,
  Stat,
  Badge
} = window.YouBoxDesignSystem_6d62a1;
function Hero({
  onNav
}) {
  const code = `import OpenAI from "openai";

const yb = new OpenAI({
  baseURL: "https://api.youbox.dev/v1",
  apiKey: process.env.YOUBOX_KEY,
});

const res = await yb.chat.completions.create({
  model: "anthropic/claude-opus-4.6",
  messages: [{ role: "user", content: "Hello!" }],
});`;
  return /*#__PURE__*/React.createElement("section", {
    className: "hero"
  }, /*#__PURE__*/React.createElement("div", {
    className: "hero__glow"
  }), /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap hero__grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "// One API \xB7 300+ models"), /*#__PURE__*/React.createElement("h1", null, "Every model,", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    className: "b"
  }, "one box.")), /*#__PURE__*/React.createElement("p", {
    className: "hero__sub"
  }, "YouBox is the unified gateway to every frontier LLM. Write one integration and route to any provider \u2014 with automatic failover, smart cost routing, and pass-through pricing."), /*#__PURE__*/React.createElement("div", {
    className: "hero__cta"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right"
    })
  }, "Get your API key"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "book-open"
    }),
    onClick: () => onNav('quickstart')
  }, "Read the docs")), /*#__PURE__*/React.createElement("div", {
    className: "hero__note"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check-circle-2",
    style: {
      width: 15,
      height: 15,
      color: 'var(--success)'
    }
  }), "No markup on tokens. Drop-in OpenAI-compatible SDK."), /*#__PURE__*/React.createElement("div", {
    className: "ticker"
  }, /*#__PURE__*/React.createElement(Stat, {
    label: "Models",
    value: "312"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Providers",
    value: "34"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Tokens routed",
    value: "1.4",
    unit: "T / day"
  }), /*#__PURE__*/React.createElement(Stat, {
    label: "Uptime",
    value: "99.98",
    unit: "%"
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(CodeBlock, {
    filename: "route.ts",
    code: code
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "import"), " OpenAI ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "from"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"openai\""), ";", "\n\n", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "const"), " yb = ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "new"), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--blue-500)'
    }
  }, "OpenAI"), "(", "{", "\n", "  ", "baseURL: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"https://api.youbox.dev/v1\""), ",", "\n", "  ", "apiKey: process.env.", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--ink-100)'
    }
  }, "YOUBOX_KEY"), ",", "\n", "}", ");", "\n\n", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "const"), " res = ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "await"), " yb.chat.completions.", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--blue-500)'
    }
  }, "create"), "(", "{", "\n", "  ", "model: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"anthropic/claude-opus-4.6\""), ",", "\n", "  ", "messages: [", "{", " role: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"user\""), ", content: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"Hello!\""), " ", "}", "],", "\n", "}", ");"))));
}
function Providers() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section--tight"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap providers"
  }, /*#__PURE__*/React.createElement("span", {
    className: "providers__label"
  }, "Route to"), window.YB_PROVIDERS.map(p => /*#__PURE__*/React.createElement("span", {
    className: "provider-chip",
    key: p
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: 'var(--accent)'
    }
  }), p)), /*#__PURE__*/React.createElement("span", {
    className: "provider-chip",
    style: {
      color: 'var(--text-muted)'
    }
  }, "+26 more")));
}
Object.assign(window, {
  Hero,
  Providers
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Marketplace.jsx
try { (() => {
const {
  ModelCard,
  Input,
  Tabs,
  Tag
} = window.YouBoxDesignSystem_6d62a1;
function Marketplace() {
  const [query, setQuery] = React.useState('');
  const [cat, setCat] = React.useState('all');
  const [favs, setFavs] = React.useState(() => ({
    'claude-opus-46': true
  }));
  const toggleFav = id => setFavs(f => ({
    ...f,
    [id]: !f[id]
  }));
  const cats = [{
    value: 'all',
    label: 'All',
    count: window.YB_MODELS.length
  }, {
    value: 'chat',
    label: 'Chat'
  }, {
    value: 'image',
    label: 'Image'
  }, {
    value: 'audio',
    label: 'Audio'
  }, {
    value: 'embed',
    label: 'Embeddings'
  }];
  const filtered = window.YB_MODELS.filter(m => {
    const inCat = cat === 'all' || m.cat === cat;
    const q = query.trim().toLowerCase();
    const inQ = !q || m.name.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q) || m.tags.some(t => t.toLowerCase().includes(q));
    return inCat && inQ;
  });
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "models"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head"
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "// Marketplace"), /*#__PURE__*/React.createElement("h2", null, "One catalog. Every model."), /*#__PURE__*/React.createElement("p", null, "Search, compare, and switch between models from every major provider \u2014 pricing and performance side by side.")), /*#__PURE__*/React.createElement("div", {
    className: "market__toolbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "market__search"
  }, /*#__PURE__*/React.createElement(Input, {
    placeholder: "Search 300+ models\u2026",
    leadingIcon: /*#__PURE__*/React.createElement(Icon, {
      name: "search"
    }),
    value: query,
    onChange: e => setQuery(e.target.value)
  })), /*#__PURE__*/React.createElement(Tabs, {
    variant: "pill",
    value: cat,
    onChange: setCat,
    items: cats
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(Tag, {
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-down-up"
    })
  }, "sort: trending")), filtered.length ? /*#__PURE__*/React.createElement("div", {
    className: "market__grid"
  }, filtered.map(m => /*#__PURE__*/React.createElement(ModelCard, {
    key: m.id,
    name: m.name,
    provider: m.provider,
    description: m.description,
    tags: m.tags,
    contextTokens: m.context,
    priceIn: m.priceIn,
    priceOut: m.priceOut,
    throughput: m.throughput,
    badge: m.badge,
    favorited: !!favs[m.id],
    onFavorite: () => toggleFav(m.id)
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "market__empty"
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "search-x",
    style: {
      width: 28,
      height: 28,
      opacity: 0.5
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10
    }
  }, "No models match \u201C", query, "\u201D."))));
}
Object.assign(window, {
  Marketplace
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Marketplace.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Nav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Shared Icon helper + Nav. Lucide <i> tags are converted by createIcons()
// which the App re-runs after every render.
const {
  Button,
  IconButton
} = window.YouBoxDesignSystem_6d62a1;
function Icon({
  name,
  ...p
}) {
  return /*#__PURE__*/React.createElement("i", _extends({
    "data-lucide": name,
    key: name
  }, p));
}
function Nav({
  active,
  onNav,
  theme,
  onToggleTheme
}) {
  const links = [{
    id: 'models',
    label: 'Models'
  }, {
    id: 'features',
    label: 'Features'
  }, {
    id: 'quickstart',
    label: 'Docs'
  }, {
    id: 'pricing',
    label: 'Pricing'
  }];
  return /*#__PURE__*/React.createElement("header", {
    className: "nav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap nav__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "nav__brand",
    onClick: () => onNav('top')
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/youbox-mark.svg",
    width: "26",
    height: "26",
    alt: ""
  }), "You", /*#__PURE__*/React.createElement("b", null, "Box")), /*#__PURE__*/React.createElement("nav", {
    className: "nav__links"
  }, links.map(l => /*#__PURE__*/React.createElement("button", {
    key: l.id,
    className: 'nav__link' + (active === l.id ? ' nav__link--active' : ''),
    onClick: () => onNav(l.id)
  }, l.label))), /*#__PURE__*/React.createElement("div", {
    className: "nav__spacer"
  }), /*#__PURE__*/React.createElement("div", {
    className: "nav__actions"
  }, /*#__PURE__*/React.createElement(IconButton, {
    "aria-label": "Toggle theme",
    onClick: onToggleTheme
  }, /*#__PURE__*/React.createElement(Icon, {
    name: theme === 'light' ? 'moon' : 'sun'
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm"
  }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right"
    })
  }, "Get API key"))));
}
Object.assign(window, {
  Icon,
  Nav
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Nav.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Pricing.jsx
try { (() => {
const {
  Button,
  Badge
} = window.YouBoxDesignSystem_6d62a1;
function Plan({
  name,
  price,
  unit,
  blurb,
  features,
  cta,
  variant,
  feature
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'plan' + (feature ? ' plan--feature' : '')
  }, feature && /*#__PURE__*/React.createElement(Badge, {
    variant: "brand",
    solid: true,
    style: {
      position: 'absolute',
      top: 18,
      right: 18
    }
  }, "Popular"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "plan__name"
  }, name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)',
      margin: '6px 0 0'
    }
  }, blurb)), /*#__PURE__*/React.createElement("div", {
    className: "plan__price"
  }, price, unit && /*#__PURE__*/React.createElement("span", null, unit)), /*#__PURE__*/React.createElement("ul", {
    className: "plan__list"
  }, features.map(f => /*#__PURE__*/React.createElement("li", {
    key: f
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check"
  }), f))), /*#__PURE__*/React.createElement(Button, {
    variant: variant,
    block: true
  }, cta));
}
function Pricing() {
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "pricing"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sec-head sec-head--center"
  }, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "// Pricing"), /*#__PURE__*/React.createElement("h2", null, "Pay for tokens, not the gateway."), /*#__PURE__*/React.createElement("p", null, "Provider rates, passed straight through. Pick a plan for the controls and analytics you need.")), /*#__PURE__*/React.createElement("div", {
    className: "price-grid"
  }, /*#__PURE__*/React.createElement(Plan, {
    name: "Hobby",
    price: "$0",
    unit: "/ mo",
    variant: "secondary",
    cta: "Start free",
    blurb: "For side projects and tinkering.",
    features: ['Pass-through token pricing', '1 API key', '$50 / mo spend cap', 'Community support']
  }), /*#__PURE__*/React.createElement(Plan, {
    name: "Pro",
    price: "$20",
    unit: "/ mo",
    variant: "primary",
    cta: "Upgrade to Pro",
    feature: true,
    blurb: "For builders shipping to production.",
    features: ['Everything in Hobby', 'Unlimited keys with scopes', 'Smart routing & failover', 'Usage analytics dashboard', 'Email support']
  }), /*#__PURE__*/React.createElement(Plan, {
    name: "Scale",
    price: "Custom",
    variant: "secondary",
    cta: "Talk to us",
    blurb: "For teams at high volume.",
    features: ['Everything in Pro', 'Volume token discounts', 'SSO & audit logs', 'Dedicated routing region', '99.99% uptime SLA']
  }))));
}
Object.assign(window, {
  Pricing
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Pricing.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/Quickstart.jsx
try { (() => {
const {
  CodeBlock,
  Button
} = window.YouBoxDesignSystem_6d62a1;
function Quickstart({
  onNav
}) {
  const steps = [{
    t: 'Grab a key',
    d: 'Sign up and create a scoped API key with a spend cap in seconds.'
  }, {
    t: 'Point your SDK at YouBox',
    d: 'Change one base URL. Keep the OpenAI client you already use.'
  }, {
    t: 'Call any model',
    d: 'Prefix the model with its provider — anthropic/, openai/, meta/ — and ship.'
  }];
  const code = `# install nothing new — reuse the OpenAI SDK
export YOUBOX_KEY="yb-sk-..."

curl https://api.youbox.dev/v1/chat/completions \\
  -H "Authorization: Bearer $YOUBOX_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "google/gemini-3-pro",
    "messages": [{"role":"user","content":"Summarize this PDF"}],
    "route": { "fallbacks": ["openai/gpt-5.2"] }
  }'`;
  return /*#__PURE__*/React.createElement("section", {
    className: "section",
    id: "quickstart"
  }, /*#__PURE__*/React.createElement("div", {
    className: "yb-wrap quick__grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "eyebrow"
  }, "// Quickstart"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 38,
      letterSpacing: '-0.025em',
      margin: '0 0 14px',
      fontWeight: 700,
      lineHeight: 1.08
    }
  }, "Live in three steps."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 17,
      color: 'var(--text-secondary)',
      margin: 0,
      lineHeight: 1.55
    }
  }, "No new SDK, no migration. If your code talks to OpenAI today, it talks to every model tomorrow."), /*#__PURE__*/React.createElement("div", {
    className: "quick__steps"
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("div", {
    className: "qstep",
    key: s.t
  }, /*#__PURE__*/React.createElement("span", {
    className: "qstep__n"
  }, i + 1), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    className: "qstep__t"
  }, s.t), /*#__PURE__*/React.createElement("p", {
    className: "qstep__d"
  }, s.d))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "subtle",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right"
    }),
    onClick: () => onNav('pricing')
  }, "See full API reference"))), /*#__PURE__*/React.createElement(CodeBlock, {
    language: "bash",
    code: code
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-faint)'
    }
  }, "# install nothing new \u2014 reuse the OpenAI SDK"), "\n", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "export"), " YOUBOX_KEY=", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"yb-sk-...\""), "\n\n", "curl https://api.youbox.dev/v1/chat/completions ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "\\"), "\n", "  ", "-H ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"Authorization: Bearer $YOUBOX_KEY\""), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "\\"), "\n", "  ", "-H ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"Content-Type: application/json\""), " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--azure-300)'
    }
  }, "\\"), "\n", "  ", "-d ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "'{"), "\n", "    ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"model\""), ": ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"google/gemini-3-pro\""), ",", "\n", "    ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"messages\""), ": [", "{", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"role\""), ":", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"user\""), ",", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"content\""), ":", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"Summarize this PDF\""), "}", "],", "\n", "    ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"route\""), ": ", "{", " ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"fallbacks\""), ": [", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "\"openai/gpt-5.2\""), "] ", "}", "\n", "  ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--teal-300)'
    }
  }, "}'"))));
}
Object.assign(window, {
  Quickstart
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/Quickstart.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/data.js
try { (() => {
// YouBox marketing-site demo data. Provider names + model figures are
// illustrative placeholders for the UI kit, not a live catalog.
window.YB_MODELS = [{
  id: 'claude-opus-46',
  name: 'Claude Opus 4.6',
  provider: 'Anthropic',
  cat: 'chat',
  description: 'Frontier reasoning model with state-of-the-art coding and long-horizon agentic performance.',
  tags: ['vision', 'tools', '200K ctx'],
  context: '200K',
  priceIn: 3.0,
  priceOut: 15.0,
  throughput: 118,
  badge: 'New',
  trending: 1
}, {
  id: 'gpt-52',
  name: 'GPT-5.2',
  provider: 'OpenAI',
  cat: 'chat',
  description: 'General-purpose multimodal flagship with fast streaming and broad tool support.',
  tags: ['vision', 'tools', 'audio'],
  context: '256K',
  priceIn: 2.5,
  priceOut: 10.0,
  throughput: 142,
  trending: 2
}, {
  id: 'gemini-3-pro',
  name: 'Gemini 3 Pro',
  provider: 'Google',
  cat: 'chat',
  description: 'Long-context multimodal model tuned for documents, video, and retrieval-heavy workloads.',
  tags: ['vision', '1M ctx', 'tools'],
  context: '1M',
  priceIn: 1.25,
  priceOut: 5.0,
  throughput: 96,
  trending: 3
}, {
  id: 'llama-4-405b',
  name: 'Llama 4 405B',
  provider: 'Meta',
  cat: 'chat',
  description: 'Open-weights flagship. Self-hostable, with strong reasoning at an aggressive price point.',
  tags: ['open', 'tools', '128K ctx'],
  context: '128K',
  priceIn: 0.9,
  priceOut: 0.9,
  throughput: 84
}, {
  id: 'mistral-large-3',
  name: 'Mistral Large 3',
  provider: 'Mistral AI',
  cat: 'chat',
  description: 'European frontier model with excellent multilingual coverage and function calling.',
  tags: ['tools', 'multilingual'],
  context: '128K',
  priceIn: 2.0,
  priceOut: 6.0,
  throughput: 110
}, {
  id: 'deepseek-v4',
  name: 'DeepSeek V4',
  provider: 'DeepSeek',
  cat: 'chat',
  description: 'Cost-efficient reasoning model with a dedicated chain-of-thought mode.',
  tags: ['reasoning', 'open'],
  context: '128K',
  priceIn: 0.27,
  priceOut: 1.1,
  throughput: 72,
  badge: 'Cheap'
}, {
  id: 'flux-pro',
  name: 'FLUX 1.2 Pro',
  provider: 'Black Forest',
  cat: 'image',
  description: 'High-fidelity text-to-image generation with sharp typography and prompt adherence.',
  tags: ['image', '512px–2K'],
  context: '—',
  priceIn: null,
  priceOut: null,
  throughput: null
}, {
  id: 'whisper-lg-v4',
  name: 'Whisper Large v4',
  provider: 'OpenAI',
  cat: 'audio',
  description: 'Robust multilingual speech-to-text with word-level timestamps.',
  tags: ['audio', '99 langs'],
  context: '—',
  priceIn: 0.4,
  priceOut: null,
  throughput: null
}, {
  id: 'embed-4',
  name: 'Embed 4',
  provider: 'Cohere',
  cat: 'embed',
  description: 'Multilingual embeddings for retrieval and semantic search at scale.',
  tags: ['embeddings', '1024 dim'],
  context: '8K',
  priceIn: 0.1,
  priceOut: null,
  throughput: null
}, {
  id: 'command-r2',
  name: 'Command R+ 2',
  provider: 'Cohere',
  cat: 'chat',
  description: 'RAG-optimized model with grounded citations and tool use baked in.',
  tags: ['tools', 'RAG'],
  context: '128K',
  priceIn: 2.5,
  priceOut: 10.0,
  throughput: 90
}];
window.YB_PROVIDERS = ['Anthropic', 'OpenAI', 'Google', 'Meta', 'Mistral AI', 'DeepSeek', 'Cohere', 'Black Forest'];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.CodeBlock = __ds_scope.CodeBlock;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.ModelCard = __ds_scope.ModelCard;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
