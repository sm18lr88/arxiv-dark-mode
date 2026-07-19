// ==UserScript==
// @name         arXiv Dark Mode
// @namespace    https://arxiv.org/
// @version      0.6.0
// @description  Dark theme and accessible font choices for arXiv.org
// @author       sm18lr88
// @license      MIT
// @homepageURL  https://github.com/sm18lr88/arxiv-dark-mode
// @supportURL   https://github.com/sm18lr88/arxiv-dark-mode/issues
// @updateURL    https://raw.githubusercontent.com/sm18lr88/arxiv-dark-mode/master/dist/arxiv-dark-mode.js
// @downloadURL  https://raw.githubusercontent.com/sm18lr88/arxiv-dark-mode/master/dist/arxiv-dark-mode.js
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
// @grant        GM_getResourceURL
// @resource     openDyslexicRegular https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff
// @resource     openDyslexicBold https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff
// @resource     openDyslexicItalic https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Italic.woff
// @resource     openDyslexicBoldItalic https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-BoldItalic.woff
// @resource     openDyslexicMono https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/otf/OpenDyslexicMono-Regular.otf
// @run-at       document-start
// @noframes
// ==/UserScript==
(function () {
    "use strict";
    const PREF_KEY = "arxiv_dark_mode";
    const FONT_PREF_KEY = "arxiv_font";
    const ROOT_CLASS = "arxiv-dm";
    const STYLE_ID = "arxiv-dm-styles";
    const FONT_STYLE_ID = "arxiv-dm-fonts";
    const FONT_ATTRIBUTE = "data-arxiv-dm-font";
    const CONTROLS_ID = "arxiv-dm-controls";
    const SETTINGS_BUTTON_ID = "arxiv-dm-settings-button";
    const SETTINGS_PANEL_ID = "arxiv-dm-settings-panel";
    const MODE_SELECT_ID = "arxiv-dm-mode-select";
    const FONT_SELECT_ID = "arxiv-dm-font-select";
    const MODES = ["auto", "dark", "light"];
    const FONT_OPTIONS = {
        site: {
            label: "Site default",
            family: null,
        },
        system: {
            label: "System sans-serif",
            family: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        serif: {
            label: "Serif",
            family: 'Georgia, "Times New Roman", serif',
        },
        monospace: {
            label: "Monospace",
            family: '"Cascadia Mono", "SFMono-Regular", Consolas, "Liberation Mono", monospace',
        },
        opendyslexic: {
            label: "OpenDyslexic",
            family: '"OpenDyslexic", sans-serif',
        },
        "opendyslexic-mono": {
            label: "OpenDyslexic Mono",
            family: '"OpenDyslexic Mono", monospace',
        },
    };
    const FONT_NAMES = Object.keys(FONT_OPTIONS);
    const BG_COLOR = "#1a1a2e";
    let mode = getStoredMode();
    let font = getStoredFont();
    let enabled = resolveEnabled(mode);
    let settingsBtn = null;
    let settingsPanel = null;
    let modeSelect = null;
    let fontSelect = null;
    let fontStatus = null;
    let controlsObserver = null;
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

    html.${ROOT_CLASS} .arxiv-search-overlay {
      background: rgba(8, 8, 20, 0.72) !important;
    }

    html.${ROOT_CLASS} .arxiv-search-panel,
    html.${ROOT_CLASS} .arxiv-search-panel form,
    html.${ROOT_CLASS} .arxiv-search-hint {
      background-color: var(--dm-bg-elevated) !important;
      color: var(--dm-text-muted) !important;
      border-color: var(--dm-border) !important;
    }

    html.${ROOT_CLASS} .arxiv-search-panel {
      box-shadow: var(--dm-shadow) !important;
    }

    html.${ROOT_CLASS} .ltx_page_main,
    html.${ROOT_CLASS} .ltx_page_content {
      background-color: var(--dm-bg) !important;
    }

    html.${ROOT_CLASS} nav.ltx_TOC {
      background-color: var(--dm-bg-surface) !important;
      background-image: none !important;
      border-right: 1px solid var(--dm-border) !important;
      color: var(--dm-text) !important;
    }

    html.${ROOT_CLASS} nav.ltx_TOC:not(.active):not(.mobile) {
      width: 52px !important;
      min-width: 52px !important;
      max-width: 52px !important;
      margin: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      overflow: hidden !important;
    }

    html.${ROOT_CLASS} nav.ltx_TOC:not(.active):not(.mobile) .ltx_toclist {
      display: none !important;
    }

    html.${ROOT_CLASS} nav.ltx_TOC #listIcon,
    html.${ROOT_CLASS} nav.ltx_TOC #arrowIcon {
      width: 36px !important;
      height: 36px !important;
      margin: 8px auto 16px !important;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent !important;
      cursor: pointer;
    }

    html.${ROOT_CLASS} nav.ltx_TOC #listIcon:hover,
    html.${ROOT_CLASS} nav.ltx_TOC #arrowIcon:hover {
      background-color: var(--dm-bg-hover) !important;
    }

    html.${ROOT_CLASS} nav.ltx_TOC #listIcon.hide,
    html.${ROOT_CLASS} nav.ltx_TOC #arrowIcon.hide {
      display: none !important;
    }

    html.${ROOT_CLASS} nav.ltx_TOC #listIcon svg,
    html.${ROOT_CLASS} nav.ltx_TOC #arrowIcon svg {
      background: transparent !important;
      fill: var(--dm-text) !important;
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

      #${CONTROLS_ID} {
        display: none !important;
      }
    }
  `;
    const CONTROLS_CSS = `
    #${CONTROLS_ID},
    #${CONTROLS_ID} * {
      box-sizing: border-box;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
    }

    #${CONTROLS_ID} {
      --ui-bg: rgba(250, 250, 253, 0.97);
      --ui-surface: #ffffff;
      --ui-hover: #eeeeF6;
      --ui-text: #262638;
      --ui-muted: #67677d;
      --ui-border: rgba(38, 38, 56, 0.18);
      --ui-accent: #315fab;
      position: fixed;
      right: 16px;
      bottom: calc(16px + env(safe-area-inset-bottom, 0px));
      z-index: 2147483646;
      display: flex;
      gap: 8px;
      align-items: center;
      color: var(--ui-text);
    }

    html.${ROOT_CLASS} #${CONTROLS_ID} {
      --ui-bg: rgba(31, 31, 53, 0.97);
      --ui-surface: #25253d;
      --ui-hover: #2c2c48;
      --ui-text: #ececfa;
      --ui-muted: #aaaac1;
      --ui-border: rgba(170, 170, 193, 0.25);
      --ui-accent: #7aa2f7;
    }

    #${CONTROLS_ID} > button,
    #${SETTINGS_PANEL_ID} button {
      appearance: none;
      border: 1px solid var(--ui-border) !important;
      background: var(--ui-bg) !important;
      color: var(--ui-text) !important;
      cursor: pointer;
    }

    #${CONTROLS_ID} > button {
      width: 46px;
      height: 46px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      font-size: 17px;
      font-weight: 700;
      line-height: 1;
      box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
      backdrop-filter: blur(10px);
      transition: transform 0.15s ease, background-color 0.15s ease;
    }

    #${CONTROLS_ID} > button:hover {
      background: var(--ui-hover) !important;
      transform: translateY(-1px);
    }

    #${CONTROLS_ID} button:focus-visible,
    #${CONTROLS_ID} select:focus-visible {
      outline: 2px solid var(--ui-accent) !important;
      outline-offset: 3px;
    }

    #${SETTINGS_BUTTON_ID}[aria-expanded="true"] {
      background: var(--ui-accent) !important;
      color: #ffffff !important;
    }

    #${SETTINGS_PANEL_ID} {
      position: absolute;
      right: 0;
      bottom: 58px;
      width: min(320px, calc(100vw - 32px));
      padding: 16px;
      border: 1px solid var(--ui-border);
      border-radius: 14px;
      background: var(--ui-bg);
      color: var(--ui-text);
      box-shadow: 0 18px 48px rgba(0, 0, 0, 0.34);
      backdrop-filter: blur(14px);
    }

    #${SETTINGS_PANEL_ID}[hidden] {
      display: none !important;
    }

    #${SETTINGS_PANEL_ID} .arxiv-dm-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }

    #${SETTINGS_PANEL_ID} .arxiv-dm-panel-title {
      font-size: 16px;
      font-weight: 700;
    }

    #${SETTINGS_PANEL_ID} .arxiv-dm-panel-close {
      width: 30px;
      height: 30px;
      padding: 0;
      border-radius: 8px;
      font-size: 20px;
      line-height: 1;
    }

    #${SETTINGS_PANEL_ID} label {
      display: grid;
      gap: 6px;
      margin-top: 12px;
      color: var(--ui-muted) !important;
      font-size: 12px;
      font-weight: 700;
    }

    #${SETTINGS_PANEL_ID} select {
      width: 100%;
      min-height: 40px;
      padding: 8px 34px 8px 10px;
      border: 1px solid var(--ui-border) !important;
      border-radius: 8px;
      background-color: var(--ui-surface) !important;
      color: var(--ui-text) !important;
      font-size: 14px;
    }

    #${SETTINGS_PANEL_ID} .arxiv-dm-font-status {
      margin: 12px 0 0;
      color: var(--ui-muted) !important;
      font-size: 12px;
    }

    @media (prefers-reduced-motion: reduce) {
      #${CONTROLS_ID} > button {
        transition: none;
      }
    }

    @media (max-width: 640px) {
      #${CONTROLS_ID} {
        right: 12px;
        bottom: calc(12px + env(safe-area-inset-bottom, 0px));
      }

      #${CONTROLS_ID} > button {
        width: 44px;
        height: 44px;
      }
    }

    @media print {
      #${CONTROLS_ID} {
        display: none !important;
      }
    }
  `;
    const FONT_CSS = createFontCss();
    bootstrapTheme();
    applyFont(font);
    injectStyle(STYLE_ID, DARK_CSS);
    injectStyle(FONT_STYLE_ID, FONT_CSS);
    injectStyle(`${STYLE_ID}-controls`, CONTROLS_CSS);
    document.addEventListener("keydown", onSettingsKeyDown, true);
    setupSystemPreferenceListener();
    setupCrossTabSync();
    registerMenuCommands();
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeControls, {
            once: true,
        });
    }
    else {
        initializeControls();
    }
    window.addEventListener("load", createAppearanceControls, { once: true });
    function getStoredMode() {
        const stored = readStoredValue(PREF_KEY, "auto");
        return isKnownMode(stored) ? stored : "auto";
    }
    function getStoredFont() {
        const stored = readStoredValue(FONT_PREF_KEY, "site");
        return isKnownFont(stored) ? stored : "site";
    }
    function isKnownMode(value) {
        return MODES.includes(value);
    }
    function isKnownFont(value) {
        return Object.prototype.hasOwnProperty.call(FONT_OPTIONS, value);
    }
    function readStoredValue(key, defaultValue) {
        try {
            if (typeof GM_getValue === "function") {
                return GM_getValue(key, defaultValue);
            }
        }
        catch (_e) {
            /* ignore */
        }
        try {
            return localStorage.getItem(key) || defaultValue;
        }
        catch (_e) {
            return defaultValue;
        }
    }
    function persistMode(nextMode) {
        mode = isKnownMode(nextMode) ? nextMode : "auto";
        persistValue(PREF_KEY, mode);
    }
    function persistFont(nextFont) {
        font = isKnownFont(nextFont) ? nextFont : "site";
        persistValue(FONT_PREF_KEY, font);
    }
    function persistValue(key, value) {
        try {
            if (typeof GM_setValue === "function") {
                GM_setValue(key, value);
                return;
            }
        }
        catch (_e) {
            /* ignore */
        }
        try {
            localStorage.setItem(key, value);
        }
        catch (_e) {
            /* ignore */
        }
    }
    function systemPrefersDark() {
        try {
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        catch (_e) {
            return true;
        }
    }
    function resolveEnabled(currentMode) {
        if (currentMode === "auto")
            return systemPrefersDark();
        return currentMode === "dark";
    }
    function bootstrapTheme() {
        applyThemeState(resolveEnabled(mode));
    }
    function applyThemeState(nextEnabled) {
        enabled = Boolean(nextEnabled);
        document.documentElement.classList.toggle(ROOT_CLASS, enabled);
        document.documentElement.style.colorScheme = enabled ? "dark" : "";
        document.documentElement.style.backgroundColor = enabled ? BG_COLOR : "";
        updateControls();
    }
    function setMode(nextMode) {
        persistMode(nextMode);
        applyThemeState(resolveEnabled(mode));
    }
    function setFont(nextFont) {
        persistFont(nextFont);
        applyFont(font);
    }
    function applyFont(nextFont) {
        const validFont = isKnownFont(nextFont) ? nextFont : "site";
        font = validFont;
        if (validFont === "site") {
            document.documentElement.removeAttribute(FONT_ATTRIBUTE);
            updateControls();
            return;
        }
        document.documentElement.setAttribute(FONT_ATTRIBUTE, validFont);
        updateControls();
    }
    function updateControls() {
        if (modeSelect) {
            modeSelect.value = mode;
        }
        if (fontSelect) {
            fontSelect.value = font;
        }
        if (fontStatus) {
            fontStatus.textContent = `Current font: ${FONT_OPTIONS[font].label}`;
        }
    }
    function initializeControls() {
        createAppearanceControls();
        if (controlsObserver ||
            typeof MutationObserver !== "function" ||
            !document.documentElement) {
            return;
        }
        controlsObserver = new MutationObserver(function () {
            if (!document.getElementById(CONTROLS_ID)) {
                createAppearanceControls();
            }
        });
        controlsObserver.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }
    function createAppearanceControls() {
        if (!document.body) {
            return;
        }
        const existingControls = document.getElementById(CONTROLS_ID);
        if (existingControls) {
            settingsBtn = document.getElementById(SETTINGS_BUTTON_ID);
            settingsPanel = document.getElementById(SETTINGS_PANEL_ID);
            modeSelect = document.getElementById(MODE_SELECT_ID);
            fontSelect = document.getElementById(FONT_SELECT_ID);
            fontStatus = null;
            if (settingsPanel) {
                fontStatus = settingsPanel.querySelector(".arxiv-dm-font-status");
            }
            updateControls();
            return;
        }
        const controls = document.createElement("div");
        controls.id = CONTROLS_ID;
        settingsBtn = document.createElement("button");
        settingsBtn.id = SETTINGS_BUTTON_ID;
        settingsBtn.type = "button";
        settingsBtn.textContent = "Aa";
        settingsBtn.title = "Font and theme settings";
        settingsBtn.setAttribute("aria-label", "Open font and theme settings");
        settingsBtn.setAttribute("aria-haspopup", "dialog");
        settingsBtn.setAttribute("aria-controls", SETTINGS_PANEL_ID);
        settingsBtn.setAttribute("aria-expanded", "false");
        settingsBtn.addEventListener("click", toggleSettingsPanel);
        settingsPanel = document.createElement("section");
        settingsPanel.id = SETTINGS_PANEL_ID;
        settingsPanel.hidden = true;
        settingsPanel.setAttribute("role", "dialog");
        settingsPanel.setAttribute("aria-label", "arXiv appearance settings");
        const panelHeader = document.createElement("div");
        panelHeader.className = "arxiv-dm-panel-header";
        const panelTitle = document.createElement("strong");
        panelTitle.className = "arxiv-dm-panel-title";
        panelTitle.textContent = "Appearance";
        const closeBtn = document.createElement("button");
        closeBtn.className = "arxiv-dm-panel-close";
        closeBtn.type = "button";
        closeBtn.textContent = "\u00D7";
        closeBtn.setAttribute("aria-label", "Close appearance settings");
        closeBtn.addEventListener("click", closeSettingsPanel);
        panelHeader.appendChild(panelTitle);
        panelHeader.appendChild(closeBtn);
        settingsPanel.appendChild(panelHeader);
        const createdModeSelect = createSelectField(settingsPanel, MODE_SELECT_ID, "Theme", [
            { value: "auto", label: "Auto (follow system)" },
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
        ]);
        modeSelect = createdModeSelect;
        createdModeSelect.addEventListener("change", function () {
            setMode(createdModeSelect.value);
        });
        const fontOptions = FONT_NAMES.map(function (fontName) {
            return {
                value: fontName,
                label: FONT_OPTIONS[fontName].label,
            };
        });
        const createdFontSelect = createSelectField(settingsPanel, FONT_SELECT_ID, "Reading font", fontOptions);
        fontSelect = createdFontSelect;
        createdFontSelect.addEventListener("change", function () {
            setFont(createdFontSelect.value);
        });
        fontStatus = document.createElement("p");
        fontStatus.className = "arxiv-dm-font-status";
        fontStatus.setAttribute("aria-live", "polite");
        settingsPanel.appendChild(fontStatus);
        controls.appendChild(settingsBtn);
        controls.appendChild(settingsPanel);
        document.body.appendChild(controls);
        updateControls();
    }
    function createSelectField(parent, id, labelText, options) {
        const label = document.createElement("label");
        label.htmlFor = id;
        const labelSpan = document.createElement("span");
        labelSpan.textContent = labelText;
        const select = document.createElement("select");
        select.id = id;
        options.forEach(function (optionDefinition) {
            const option = document.createElement("option");
            option.value = optionDefinition.value;
            option.textContent = optionDefinition.label;
            select.appendChild(option);
        });
        label.appendChild(labelSpan);
        label.appendChild(select);
        parent.appendChild(label);
        return select;
    }
    function toggleSettingsPanel() {
        setSettingsPanelOpen(settingsPanel ? settingsPanel.hidden !== false : true);
    }
    function closeSettingsPanel() {
        setSettingsPanelOpen(false);
    }
    function setSettingsPanelOpen(open) {
        if (!settingsPanel || !settingsBtn) {
            return;
        }
        settingsPanel.hidden = !open;
        settingsBtn.setAttribute("aria-expanded", String(open));
        if (open && fontSelect) {
            fontSelect.focus();
        }
    }
    function onSettingsKeyDown(event) {
        if (event.key === "Escape" && settingsPanel && !settingsPanel.hidden) {
            closeSettingsPanel();
            if (settingsBtn) {
                settingsBtn.focus();
            }
        }
    }
    function setupSystemPreferenceListener() {
        try {
            mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
        }
        catch (_e) {
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
            GM_addValueChangeListener(PREF_KEY, function (_key, _oldValue, newValue, remote) {
                if (!remote) {
                    return;
                }
                mode = isKnownMode(newValue) ? newValue : "auto";
                applyThemeState(resolveEnabled(mode));
            });
            GM_addValueChangeListener(FONT_PREF_KEY, function (_key, _oldValue, newValue, remote) {
                if (!remote) {
                    return;
                }
                applyFont(newValue);
            });
        }
        catch (_e) {
            /* ignore */
        }
    }
    function registerMenuCommands() {
        try {
            if (typeof GM_registerMenuCommand !== "function") {
                return;
            }
            GM_registerMenuCommand("Open Appearance Settings", function () {
                createAppearanceControls();
                setSettingsPanelOpen(true);
            });
            GM_registerMenuCommand("Mode: Auto", function () {
                setMode("auto");
            });
            GM_registerMenuCommand("Mode: Dark", function () {
                setMode("dark");
            });
            GM_registerMenuCommand("Mode: Light", function () {
                setMode("light");
            });
            FONT_NAMES.forEach(function (fontName) {
                const option = FONT_OPTIONS[fontName];
                GM_registerMenuCommand(`Font: ${option.label}`, function () {
                    setFont(fontName);
                });
            });
        }
        catch (_e) {
            /* ignore */
        }
    }
    function createFontCss() {
        const fontRules = FONT_NAMES.filter(function (fontName) {
            return Boolean(FONT_OPTIONS[fontName].family);
        })
            .map(function (fontName) {
            return `html[${FONT_ATTRIBUTE}="${fontName}"] {
          --arxiv-dm-font-family: ${FONT_OPTIONS[fontName].family};
        }`;
        })
            .join("\n");
        const regularUrl = getResourceUrl("openDyslexicRegular", "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Regular.woff");
        const boldUrl = getResourceUrl("openDyslexicBold", "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Bold.woff");
        const italicUrl = getResourceUrl("openDyslexicItalic", "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-Italic.woff");
        const boldItalicUrl = getResourceUrl("openDyslexicBoldItalic", "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/woff/OpenDyslexic-BoldItalic.woff");
        const monoUrl = getResourceUrl("openDyslexicMono", "https://cdn.jsdelivr.net/npm/open-dyslexic@1.0.3/otf/OpenDyslexicMono-Regular.otf");
        return `
      @font-face {
        font-family: "OpenDyslexic";
        src: local("OpenDyslexic"), url("${regularUrl}") format("woff");
        font-style: normal;
        font-weight: 400;
        font-display: swap;
      }

      @font-face {
        font-family: "OpenDyslexic";
        src: local("OpenDyslexic Bold"), url("${boldUrl}") format("woff");
        font-style: normal;
        font-weight: 700;
        font-display: swap;
      }

      @font-face {
        font-family: "OpenDyslexic";
        src: local("OpenDyslexic Italic"), url("${italicUrl}") format("woff");
        font-style: italic;
        font-weight: 400;
        font-display: swap;
      }

      @font-face {
        font-family: "OpenDyslexic";
        src: local("OpenDyslexic Bold Italic"), url("${boldItalicUrl}") format("woff");
        font-style: italic;
        font-weight: 700;
        font-display: swap;
      }

      @font-face {
        font-family: "OpenDyslexic Mono";
        src: local("OpenDyslexic Mono"), url("${monoUrl}") format("opentype");
        font-style: normal;
        font-weight: 400;
        font-display: swap;
      }

      ${fontRules}

      html[${FONT_ATTRIBUTE}] body,
      html[${FONT_ATTRIBUTE}] button,
      html[${FONT_ATTRIBUTE}] input,
      html[${FONT_ATTRIBUTE}] select,
      html[${FONT_ATTRIBUTE}] textarea,
      html[${FONT_ATTRIBUTE}] h1,
      html[${FONT_ATTRIBUTE}] h2,
      html[${FONT_ATTRIBUTE}] h3,
      html[${FONT_ATTRIBUTE}] h4,
      html[${FONT_ATTRIBUTE}] h5,
      html[${FONT_ATTRIBUTE}] h6,
      html[${FONT_ATTRIBUTE}] p,
      html[${FONT_ATTRIBUTE}] li,
      html[${FONT_ATTRIBUTE}] dt,
      html[${FONT_ATTRIBUTE}] dd,
      html[${FONT_ATTRIBUTE}] blockquote,
      html[${FONT_ATTRIBUTE}] figcaption,
      html[${FONT_ATTRIBUTE}] label,
      html[${FONT_ATTRIBUTE}] summary,
      html[${FONT_ATTRIBUTE}] th,
      html[${FONT_ATTRIBUTE}] td {
        font-family: var(--arxiv-dm-font-family) !important;
      }
    `;
    }
    function getResourceUrl(name, fallbackUrl) {
        try {
            if (typeof GM_getResourceURL === "function") {
                return GM_getResourceURL(name);
            }
        }
        catch (_e) {
            /* ignore */
        }
        return fallbackUrl;
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
