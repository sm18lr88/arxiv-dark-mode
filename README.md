# arXiv Dark Mode and Font Preferences

A Tampermonkey userscript that applies a comprehensive dark theme and readable font preferences to arXiv.org.

The project is TypeScript-first: edit `src/arxiv-dark-mode.ts`, then run `npm run build` to generate the installable `dist/arxiv-dark-mode.js` artifact.

<img width="800" alt="image" src="https://github.com/user-attachments/assets/1e328f95-29ef-42fe-87a1-1c8a155c1dec" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/b3522651-739b-4f44-bf3d-a7e5ada11092" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/246ff652-2ace-4ee6-95ae-a60ab454b712" />

## Features

- Three modes: **Auto** (follows system preference), **Dark**, and **Light**
- Covers all major arXiv subdomains: `arxiv.org`, `export.arxiv.org`, `info.arxiv.org`, `html.arxiv.org`, `ar5iv.labs.arxiv.org`
- Persistent `Aa` appearance controls expose theme and font selectors on every page
- Floating theme button cycles through modes on click
- Keyboard shortcut: `Alt+Shift+D`
- Tampermonkey menu commands for direct mode selection
- Persistent font choices: site default, system sans-serif, serif, monospace, OpenDyslexic, and OpenDyslexic Mono
- Cross-tab sync: changing mode in one tab propagates to others instantly
- Cross-tab font sync
- Responds to system dark/light preference changes in real time (Auto mode)
- Print-safe: reverts to white background when printing
- No JavaScript dependencies; OpenDyslexic files are pinned HTTPS userscript resources

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Open the [built userscript](../../raw/master/dist/arxiv-dark-mode.js) and Tampermonkey will prompt you to install it.

## Development

```sh
npm install
npm run check
npm run build
```

`src/` is authoritative. `dist/arxiv-dark-mode.js` is the canonical release artifact, while the generated root copy remains temporarily for compatibility with existing installations that still check the old update path.

## Usage

| Action                        | Result                                               |
| ----------------------------- | ---------------------------------------------------- |
| Click the `Aa` button         | Open visible theme and reading-font settings         |
| Click the theme button        | Cycle: Auto → Dark → Light                           |
| `Alt+Shift+D`                 | Cycle the theme                                      |
| Tampermonkey menu             | Open settings or select a theme/font directly        |

The selected mode and font are saved independently and persist across sessions.

## Compatibility

Tested on Chrome and Firefox with Tampermonkey. Should work with Violentmonkey as well.

## License

MIT
