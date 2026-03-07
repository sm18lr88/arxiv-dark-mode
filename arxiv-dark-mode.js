// ==UserScript==
// @name         arXiv Dark Mode
// @namespace    https://arxiv.org/
// @version      0.3.1
// @description  Comprehensive dark theme for arXiv.org with auto, dark, and light modes
// @author       sm18lr88
// @match        https://arxiv.org/*
// @match        https://www.arxiv.org/*
// @match        https://export.arxiv.org/*
// @match        https://info.arxiv.org/*
// @match        https://html.arxiv.org/*
// @match        https://ar5iv.labs.arxiv.org/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addValueChangeListener
// @run-at       document-start
// @noframes
// ==/UserScript==
(function () {
  "use strict";

  const PREF_KEY = "arxiv_dark_mode";
  const ROOT_CLASS = "arxiv-dm";
  const STYLE_ID = "arxiv-dm-styles";
  const TOGGLE_ID = "arxiv-dm-toggle";
  const MODES = ["auto", "dark", "light"];
  const BG_COLOR = "#1a1a2e";

  let mode = getStoredMode();
  let enabled = resolveEnabled(mode);
  let toggleBtn = null;
  let mediaQueryList = null;

  const DARK_CSS = `
    html.${ROOT_CLASS} {
      --dm-bg: ${BG_COLOR};
      --dm-bg-surface: #1f1f35;
      --dm-bg-elevated: #25253d;
      --dm-bg-hover: #2c2c48;
      --dm-bg-input: #20203a;
      --dm-text: #d4d4e8;
      --dm-text-muted: #9e9eb8;
      --dm-text-heading: #e8e8f5;
      --dm-accent: #7aa2f7;
      --dm-accent-hover: #89b4ff;
      --dm-accent-dim: #5a7fd4;
      --dm-link: #7aa2f7;
      --dm-link-visited: #bb9af7;
      --dm-link-hover: #a9c8ff;
      --dm-border: #333355;
      --dm-border-light: #2a2a48;
      --dm-header-bg: #16162b;
      --dm-success: #9ece6a;
      --dm-warning: #e0af68;
      --dm-danger: #f7768e;
      --dm-tag-bg: #1e4070;
      --dm-tag-text: #a9d1ff;
      --dm-code-bg: #1c1c30;
      --dm-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      color-scheme: dark;
      background-color: var(--dm-bg) !important;
    }

    html.${ROOT_CLASS},
    html.${ROOT_CLASS} body,
    html.${ROOT_CLASS} main,
    html.${ROOT_CLASS} #content,
    html.${ROOT_CLASS} #content-inner,
    html.${ROOT_CLASS} #main-container,
    html.${ROOT_CLASS} .container,
    html.${ROOT_CLASS} .page-content,
    html.${ROOT_CLASS} #abs-outer,
    html.${ROOT_CLASS} #abs {
      background-color: var(--dm-bg) !important;
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} body {
      scrollbar-color: #444466 var(--dm-bg);
    }

    html.${ROOT_CLASS} ::-webkit-scrollbar {
      width: 10px;
      background: var(--dm-bg);
    }

    html.${ROOT_CLASS} ::-webkit-scrollbar-thumb {
      background: #444466;
      border-radius: 5px;
    }

    html.${ROOT_CLASS} ::-webkit-scrollbar-thumb:hover {
      background: #555577;
    }

    html.${ROOT_CLASS} h1,
    html.${ROOT_CLASS} h2,
    html.${ROOT_CLASS} h3,
    html.${ROOT_CLASS} h4,
    html.${ROOT_CLASS} h5,
    html.${ROOT_CLASS} h6,
    html.${ROOT_CLASS} .title,
    html.${ROOT_CLASS} .subtitle,
    html.${ROOT_CLASS} .extra-services .head,
    html.${ROOT_CLASS} .card-header-title,
    html.${ROOT_CLASS} .modal-card-title,
    html.${ROOT_CLASS} .panel-heading,
    html.${ROOT_CLASS} details summary {
      color: var(--dm-text-heading) !important;
    }

    html.${ROOT_CLASS} .dateline,
    html.${ROOT_CLASS} .pagination-ellipsis,
    html.${ROOT_CLASS} .help,
    html.${ROOT_CLASS} .breadcrumb li + li::before,
    html.${ROOT_CLASS} .subheader,
    html.${ROOT_CLASS} #subheader,
    html.${ROOT_CLASS} .header-breadcrumbs {
      color: var(--dm-text-muted) !important;
    }

    html.${ROOT_CLASS} .has-text-black,
    html.${ROOT_CLASS} .has-text-black-bis,
    html.${ROOT_CLASS} .has-text-black-ter,
    html.${ROOT_CLASS} .has-text-dark,
    html.${ROOT_CLASS} .has-text-grey-darker {
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} a {
      color: var(--dm-link) !important;
    }

    html.${ROOT_CLASS} a:visited {
      color: var(--dm-link-visited) !important;
    }

    html.${ROOT_CLASS} a:hover,
    html.${ROOT_CLASS} a:focus {
      color: var(--dm-link-hover) !important;
    }

    html.${ROOT_CLASS} a:active {
      color: var(--dm-accent-hover) !important;
    }

    html.${ROOT_CLASS} .search-hit,
    html.${ROOT_CLASS} span.search-hit {
      color: var(--dm-warning) !important;
      background-color: rgba(224, 175, 104, 0.15) !important;
      font-weight: 700;
    }

    html.${ROOT_CLASS} header,
    html.${ROOT_CLASS} [role="banner"],
    html.${ROOT_CLASS} .with-cu-identity header,
    html.${ROOT_CLASS} header .columns,
    html.${ROOT_CLASS} header .column,
    html.${ROOT_CLASS} .navbar,
    html.${ROOT_CLASS} .navbar-menu,
    html.${ROOT_CLASS} .navbar-start,
    html.${ROOT_CLASS} .navbar-end {
      background-color: var(--dm-header-bg) !important;
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} #header,
    html.${ROOT_CLASS} .mobile-header,
    html.${ROOT_CLASS} header nav,
    html.${ROOT_CLASS} .is-cul-darker,
    html.${ROOT_CLASS} #cu-identity {
      background-color: var(--dm-header-bg) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} .navbar-item,
    html.${ROOT_CLASS} .navbar-link,
    html.${ROOT_CLASS} .panel-block,
    html.${ROOT_CLASS} .panel-tabs a,
    html.${ROOT_CLASS} .media-content,
    html.${ROOT_CLASS} .level-item,
    html.${ROOT_CLASS} .submission-history {
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} .navbar-item:hover,
    html.${ROOT_CLASS} .navbar-link:hover,
    html.${ROOT_CLASS} .navbar-item.is-active,
    html.${ROOT_CLASS} .panel-block:hover,
    html.${ROOT_CLASS} .panel-tabs a.is-active {
      background-color: var(--dm-bg-hover) !important;
      color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} .navbar-dropdown,
    html.${ROOT_CLASS} .dropdown-content,
    html.${ROOT_CLASS} .dropdown-item,
    html.${ROOT_CLASS} .modal-card,
    html.${ROOT_CLASS} .modal-card-head,
    html.${ROOT_CLASS} .modal-card-body,
    html.${ROOT_CLASS} .modal-card-foot {
      background-color: var(--dm-bg-elevated) !important;
      border-color: var(--dm-border) !important;
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} .dropdown-item:hover {
      background-color: var(--dm-bg-hover) !important;
    }

    html.${ROOT_CLASS} .navbar-divider,
    html.${ROOT_CLASS} .dropdown-divider,
    html.${ROOT_CLASS} hr {
      background-color: var(--dm-border) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} .navbar-burger span {
      background-color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} .btn-header-donate,
    html.${ROOT_CLASS} a.btn-header-donate {
      background-color: transparent !important;
      border-color: var(--dm-accent) !important;
      color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} .btn-header-donate:hover {
      background-color: var(--dm-accent) !important;
      color: var(--dm-bg) !important;
    }

    html.${ROOT_CLASS} .login,
    html.${ROOT_CLASS} .login a {
      color: var(--dm-link) !important;
    }

    html.${ROOT_CLASS} header img,
    html.${ROOT_CLASS} .logo-arxiv img,
    html.${ROOT_CLASS} .logo-cornell img,
    html.${ROOT_CLASS} #header img {
      filter: brightness(1.3) !important;
    }

    html.${ROOT_CLASS} input.input,
    html.${ROOT_CLASS} .search-block input[type="text"],
    html.${ROOT_CLASS} .mini-search input[type="text"],
    html.${ROOT_CLASS} input[type="text"],
    html.${ROOT_CLASS} input[type="search"],
    html.${ROOT_CLASS} input[type="email"],
    html.${ROOT_CLASS} input[type="password"],
    html.${ROOT_CLASS} input[type="number"],
    html.${ROOT_CLASS} input[type="url"],
    html.${ROOT_CLASS} input[type="tel"],
    html.${ROOT_CLASS} textarea,
    html.${ROOT_CLASS} .textarea,
    html.${ROOT_CLASS} select,
    html.${ROOT_CLASS} .select select {
      background-color: var(--dm-bg-input) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
      caret-color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} input::placeholder,
    html.${ROOT_CLASS} textarea::placeholder {
      color: var(--dm-text-muted) !important;
      opacity: 0.75 !important;
    }

    html.${ROOT_CLASS} input:-webkit-autofill,
    html.${ROOT_CLASS} textarea:-webkit-autofill,
    html.${ROOT_CLASS} select:-webkit-autofill {
      -webkit-box-shadow: 0 0 0 1000px var(--dm-bg-input) inset !important;
      -webkit-text-fill-color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} .select::after {
      border-color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} button,
    html.${ROOT_CLASS} .button,
    html.${ROOT_CLASS} input[type="submit"],
    html.${ROOT_CLASS} input[type="button"] {
      background-color: var(--dm-bg-elevated) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} button:hover,
    html.${ROOT_CLASS} .button:hover,
    html.${ROOT_CLASS} input[type="submit"]:hover {
      background-color: var(--dm-bg-hover) !important;
      border-color: var(--dm-accent-dim) !important;
    }

    html.${ROOT_CLASS} .button.is-link,
    html.${ROOT_CLASS} .button.is-primary,
    html.${ROOT_CLASS} .button.is-success {
      background-color: var(--dm-accent-dim) !important;
      color: #ffffff !important;
      border-color: var(--dm-accent-dim) !important;
    }

    html.${ROOT_CLASS} .button.is-link:hover,
    html.${ROOT_CLASS} .button.is-primary:hover,
    html.${ROOT_CLASS} .button.is-success:hover {
      background-color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} .button.is-danger {
      background-color: #752a37 !important;
      color: var(--dm-danger) !important;
      border-color: #752a37 !important;
    }

    html.${ROOT_CLASS} .button.is-warning {
      background-color: #614a1f !important;
      color: var(--dm-warning) !important;
      border-color: #614a1f !important;
    }

    html.${ROOT_CLASS} input:focus-visible,
    html.${ROOT_CLASS} textarea:focus-visible,
    html.${ROOT_CLASS} select:focus-visible,
    html.${ROOT_CLASS} button:focus-visible,
    html.${ROOT_CLASS} .button:focus-visible,
    html.${ROOT_CLASS} a:focus-visible {
      outline: 2px solid var(--dm-accent) !important;
      outline-offset: 2px !important;
    }

    html.${ROOT_CLASS} .title.mathjax,
    html.${ROOT_CLASS} h1.title,
    html.${ROOT_CLASS} .list-title,
    html.${ROOT_CLASS} .list-title a,
    html.${ROOT_CLASS} .arxiv-result .result-title {
      color: var(--dm-text-heading) !important;
    }

    html.${ROOT_CLASS} .authors,
    html.${ROOT_CLASS} .authors a,
    html.${ROOT_CLASS} dt a,
    html.${ROOT_CLASS} .list-identifier,
    html.${ROOT_CLASS} .list-identifier a {
      color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} blockquote,
    html.${ROOT_CLASS} blockquote.abstract,
    html.${ROOT_CLASS} .extra-services,
    html.${ROOT_CLASS} .extra-ref-cite,
    html.${ROOT_CLASS} .full-text,
    html.${ROOT_CLASS} .browse,
    html.${ROOT_CLASS} .arxiv-result,
    html.${ROOT_CLASS} .arxivlabs-container,
    html.${ROOT_CLASS} .arxivlabs-content,
    html.${ROOT_CLASS} .tab-content,
    html.${ROOT_CLASS} .box,
    html.${ROOT_CLASS} .notification,
    html.${ROOT_CLASS} .message,
    html.${ROOT_CLASS} .message-body,
    html.${ROOT_CLASS} .card,
    html.${ROOT_CLASS} .card-content,
    html.${ROOT_CLASS} .card-header,
    html.${ROOT_CLASS} .panel,
    html.${ROOT_CLASS} details,
    html.${ROOT_CLASS} .search,
    html.${ROOT_CLASS} #content .search {
      background-color: var(--dm-bg-surface) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
      box-shadow: var(--dm-shadow) !important;
    }

    html.${ROOT_CLASS} blockquote,
    html.${ROOT_CLASS} blockquote.abstract {
      border-left: 3px solid var(--dm-accent-dim) !important;
    }

    html.${ROOT_CLASS} .message-header,
    html.${ROOT_CLASS} thead,
    html.${ROOT_CLASS} thead th,
    html.${ROOT_CLASS} .panel-heading,
    html.${ROOT_CLASS} .card-header,
    html.${ROOT_CLASS} .subheader,
    html.${ROOT_CLASS} #subheader,
    html.${ROOT_CLASS} .header-breadcrumbs {
      background-color: var(--dm-bg-elevated) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} dl,
    html.${ROOT_CLASS} dt,
    html.${ROOT_CLASS} dd,
    html.${ROOT_CLASS} .arxiv-result .abstract-short,
    html.${ROOT_CLASS} .arxiv-result .abstract-full,
    html.${ROOT_CLASS} .announcement,
    html.${ROOT_CLASS} [class*="banner"] {
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} .tag,
    html.${ROOT_CLASS} .tag.is-small,
    html.${ROOT_CLASS} span.tag,
    html.${ROOT_CLASS} .tag.is-link {
      background-color: var(--dm-tag-bg) !important;
      color: var(--dm-tag-text) !important;
      border: none !important;
    }

    html.${ROOT_CLASS} .tooltip::after,
    html.${ROOT_CLASS} [data-tooltip]::after {
      background-color: var(--dm-bg-elevated) !important;
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} .pagination-link,
    html.${ROOT_CLASS} .pagination-next,
    html.${ROOT_CLASS} .pagination-previous {
      background-color: var(--dm-bg-elevated) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} .pagination-link.is-current,
    html.${ROOT_CLASS} .pagination-link[aria-current="page"] {
      background-color: var(--dm-accent-dim) !important;
      color: #ffffff !important;
      border-color: var(--dm-accent-dim) !important;
    }

    html.${ROOT_CLASS} .tabs,
    html.${ROOT_CLASS} .tabs ul,
    html.${ROOT_CLASS} .card-footer,
    html.${ROOT_CLASS} .card-footer-item,
    html.${ROOT_CLASS} .modal-card-head,
    html.${ROOT_CLASS} .modal-card-foot {
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} .tabs li a {
      color: var(--dm-text-muted) !important;
      border-bottom-color: transparent !important;
    }

    html.${ROOT_CLASS} .tabs li.is-active a,
    html.${ROOT_CLASS} .tabs li a:hover {
      color: var(--dm-accent) !important;
      border-bottom-color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} .arxivlabs-toggle .switch,
    html.${ROOT_CLASS} .slider,
    html.${ROOT_CLASS} .switch,
    html.${ROOT_CLASS} .progress,
    html.${ROOT_CLASS} .progress::-webkit-progress-bar {
      background-color: var(--dm-bg-hover) !important;
    }

    html.${ROOT_CLASS} .progress::-webkit-progress-value,
    html.${ROOT_CLASS} .progress::-moz-progress-bar {
      background-color: var(--dm-accent) !important;
    }

    html.${ROOT_CLASS} table,
    html.${ROOT_CLASS} .metatable,
    html.${ROOT_CLASS} .metatable td,
    html.${ROOT_CLASS} .metatable th,
    html.${ROOT_CLASS} .tablecell,
    html.${ROOT_CLASS} table.extra-services td,
    html.${ROOT_CLASS} table td,
    html.${ROOT_CLASS} table th {
      background-color: transparent !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border-light) !important;
    }

    html.${ROOT_CLASS} table tr:nth-child(even) {
      background-color: var(--dm-bg-surface) !important;
    }

    html.${ROOT_CLASS} table tr:hover {
      background-color: var(--dm-bg-hover) !important;
    }

    html.${ROOT_CLASS} footer,
    html.${ROOT_CLASS} [role="contentinfo"],
    html.${ROOT_CLASS} .flex-wrap-footer,
    html.${ROOT_CLASS} .hero,
    html.${ROOT_CLASS} .hero-body,
    html.${ROOT_CLASS} .section {
      background-color: var(--dm-header-bg) !important;
      color: var(--dm-text-muted) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} #content .columns,
    html.${ROOT_CLASS} #content .column {
      background-color: var(--dm-bg) !important;
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} pre,
    html.${ROOT_CLASS} code,
    html.${ROOT_CLASS} .mathjax-preview {
      background-color: var(--dm-code-bg) !important;
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} ::selection {
      background-color: var(--dm-accent-dim) !important;
      color: #ffffff !important;
    }

    html.${ROOT_CLASS} .icon svg {
      fill: var(--dm-text-muted) !important;
    }

    html.${ROOT_CLASS} .MathJax,
    html.${ROOT_CLASS} .MathJax_Display,
    html.${ROOT_CLASS} .MathJax span,
    html.${ROOT_CLASS} .mjx-chtml,
    html.${ROOT_CLASS} .mjx-math,
    html.${ROOT_CLASS} .MathJax_SVG {
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} .modal-background {
      background-color: rgba(0, 0, 0, 0.7) !important;
    }

    html.${ROOT_CLASS} .labstabs label {
      background-color: var(--dm-bg-elevated) !important;
      color: var(--dm-text-muted) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} .labstabs input:checked + label {
      background-color: var(--dm-bg-surface) !important;
      color: var(--dm-text) !important;
      border-bottom-color: var(--dm-bg-surface) !important;
    }

    html.${ROOT_CLASS} .labstabs .toggle,
    html.${ROOT_CLASS} div.toggle {
      background-color: var(--dm-bg-surface) !important;
      color: var(--dm-text) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} .labstabs em,
    html.${ROOT_CLASS} #labstabs em {
      color: var(--dm-text-muted) !important;
    }

    @media print {
      html.${ROOT_CLASS},
      html.${ROOT_CLASS} body,
      html.${ROOT_CLASS} main,
      html.${ROOT_CLASS} header,
      html.${ROOT_CLASS} footer,
      html.${ROOT_CLASS} *,
      html.${ROOT_CLASS} *::before,
      html.${ROOT_CLASS} *::after {
        background-color: #ffffff !important;
        color: #000000 !important;
        box-shadow: none !important;
        filter: none !important;
      }

      html.${ROOT_CLASS} a {
        color: #00c !important;
      }

      #${TOGGLE_ID} {
        display: none !important;
      }
    }
  `;

  const TOGGLE_CSS = `
    #${TOGGLE_ID} {
      position: fixed;
      right: 16px;
      bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      z-index: 999999;
      width: 44px;
      height: 44px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(22, 22, 43, 0.92);
      color: #f4f4ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      line-height: 1;
      padding: 0;
      cursor: pointer;
      user-select: none;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      transition: transform 0.15s ease, opacity 0.15s ease, background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      opacity: 0.82;
    }

    #${TOGGLE_ID}:hover {
      opacity: 1;
      transform: translateY(-1px);
    }

    #${TOGGLE_ID}:focus-visible {
      outline: 2px solid #7aa2f7;
      outline-offset: 3px;
      opacity: 1;
    }

    #${TOGGLE_ID}[data-mode="light"] {
      background: rgba(244, 244, 250, 0.95);
      color: #303044;
      border-color: rgba(48, 48, 68, 0.2);
    }

    #${TOGGLE_ID}[data-mode="auto"] {
      background: rgba(42, 42, 64, 0.92);
      color: #d8dcff;
      border-color: rgba(122, 162, 247, 0.3);
    }

    @media (prefers-reduced-motion: reduce) {
      #${TOGGLE_ID} {
        transition: none;
      }
    }

    @media (max-width: 640px) {
      #${TOGGLE_ID} {
        right: 12px;
        width: 42px;
        height: 42px;
      }
    }

    @media print {
      #${TOGGLE_ID} {
        display: none !important;
      }
    }
  `;

  bootstrapTheme();
  injectStyle(STYLE_ID, DARK_CSS);
  injectStyle(`${STYLE_ID}-toggle`, TOGGLE_CSS);

  document.addEventListener("keydown", onKeyDown, true);

  setupSystemPreferenceListener();
  setupCrossTabSync();
  registerMenuCommands();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createToggleBtn, {
      once: true,
    });
  } else {
    createToggleBtn();
  }

  function getStoredMode() {
    const stored = readStoredValue();
    return MODES.includes(stored) ? stored : "auto";
  }

  function readStoredValue() {
    try {
      if (typeof GM_getValue === "function") {
        return GM_getValue(PREF_KEY, "auto");
      }
    } catch {
      /* ignore */
    }

    try {
      return localStorage.getItem(PREF_KEY) || "auto";
    } catch {
      return "auto";
    }
  }

  function persistMode(nextMode) {
    mode = MODES.includes(nextMode) ? nextMode : "auto";

    try {
      if (typeof GM_setValue === "function") {
        GM_setValue(PREF_KEY, mode);
        return;
      }
    } catch {
      /* ignore */
    }

    try {
      localStorage.setItem(PREF_KEY, mode);
    } catch {
      /* ignore */
    }
  }

  function systemPrefersDark() {
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
      return true;
    }
  }

  function resolveEnabled(currentMode) {
    return currentMode === "auto"
      ? systemPrefersDark()
      : currentMode === "dark";
  }

  function bootstrapTheme() {
    applyThemeState(resolveEnabled(mode));
  }

  function applyThemeState(nextEnabled) {
    enabled = Boolean(nextEnabled);
    document.documentElement.classList.toggle(ROOT_CLASS, enabled);
    document.documentElement.style.colorScheme = enabled ? "dark" : "";
    document.documentElement.style.backgroundColor = enabled ? BG_COLOR : "";
    updateToggleBtn();
  }

  function setMode(nextMode) {
    persistMode(nextMode);
    applyThemeState(resolveEnabled(mode));
  }

  function cycleMode() {
    const currentIndex = MODES.indexOf(mode);
    const nextMode = MODES[(currentIndex + 1) % MODES.length];
    setMode(nextMode);
  }

  function updateToggleBtn() {
    if (!toggleBtn) {
      return;
    }

    const label = getModeLabel(mode);
    toggleBtn.dataset.mode = mode;
    toggleBtn.textContent = getModeIcon(mode);
    toggleBtn.setAttribute(
      "aria-label",
      `${label} mode. Click to cycle modes.`,
    );
    toggleBtn.title = `${label} mode (Alt+Shift+D). Click to cycle: Auto → Dark → Light`;
  }

  function getModeLabel(currentMode) {
    if (currentMode === "dark") {
      return "Dark";
    }

    if (currentMode === "light") {
      return "Light";
    }

    return `Auto (${enabled ? "dark" : "light"})`;
  }

  function getModeIcon(currentMode) {
    if (currentMode === "dark") {
      return "\u263D";
    }

    if (currentMode === "light") {
      return "\u2600";
    }

    return "\u25D0";
  }

  function createToggleBtn() {
    if (document.getElementById(TOGGLE_ID) || !document.body) {
      return;
    }

    toggleBtn = document.createElement("button");
    toggleBtn.id = TOGGLE_ID;
    toggleBtn.type = "button";
    toggleBtn.addEventListener("click", cycleMode);
    document.body.appendChild(toggleBtn);
    updateToggleBtn();
  }

  function onKeyDown(event) {
    if (
      !event.altKey ||
      !event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.isComposing ||
      event.code !== "KeyD" ||
      isEditableTarget(event.target)
    ) {
      return;
    }

    event.preventDefault();
    cycleMode();
  }

  function isEditableTarget(target) {
    if (!(target instanceof Element)) {
      return false;
    }

    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return true;
    }

    return Boolean(
      target.closest(
        "[contenteditable='true'], [contenteditable=''], [role='textbox']",
      ),
    );
  }

  function setupSystemPreferenceListener() {
    try {
      mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
    } catch {
      return;
    }

    const handleChange = function (event) {
      if (mode !== "auto") {
        return;
      }

      applyThemeState(event.matches);
    };

    if (typeof mediaQueryList.addEventListener === "function") {
      mediaQueryList.addEventListener("change", handleChange);
      return;
    }

    if (typeof mediaQueryList.addListener === "function") {
      mediaQueryList.addListener(handleChange);
    }
  }

  function setupCrossTabSync() {
    try {
      if (typeof GM_addValueChangeListener !== "function") {
        return;
      }

      GM_addValueChangeListener(
        PREF_KEY,
        function (_key, _oldValue, newValue, remote) {
          if (!remote) {
            return;
          }

          mode = MODES.includes(newValue) ? newValue : "auto";
          applyThemeState(resolveEnabled(mode));
        },
      );
    } catch {
      /* ignore */
    }
  }

  function registerMenuCommands() {
    try {
      if (typeof GM_registerMenuCommand !== "function") {
        return;
      }

      GM_registerMenuCommand("Mode: Auto", function () {
        setMode("auto");
      });
      GM_registerMenuCommand("Mode: Dark", function () {
        setMode("dark");
      });
      GM_registerMenuCommand("Mode: Light", function () {
        setMode("light");
      });
      GM_registerMenuCommand("Cycle Mode (Alt+Shift+D)", cycleMode);
    } catch {
      /* ignore */
    }
  }

  function injectStyle(id, cssText) {
    if (document.getElementById(id)) {
      return;
    }

    const styleEl = document.createElement("style");
    styleEl.id = id;
    styleEl.textContent = cssText;
    (document.head || document.documentElement).appendChild(styleEl);
  }
})();
