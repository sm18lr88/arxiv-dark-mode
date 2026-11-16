# arXiv Dark Mode and Font Preferences

A Tampermonkey userscript that gives arXiv.org a full dark theme and a choice of readable fonts.

The project is TypeScript-first: edit `src/arxiv-dark-mode.ts`, then run `npm run build` to generate the installable `dist/arxiv-dark-mode.js` artifact.

<img width="800" alt="image" src="https://github.com/user-attachments/assets/1e328f95-29ef-42fe-87a1-1c8a155c1dec" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/b3522651-739b-4f44-bf3d-a7e5ada11092" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/246ff652-2ace-4ee6-95ae-a60ab454b712" />

## Features

- Three modes: **Auto** (follows the system preference), **Dark**, and **Light**
- Works on all major arXiv subdomains: `arxiv.org`, `export.arxiv.org`, `info.arxiv.org`, `html.arxiv.org`, `ar5iv.labs.arxiv.org`
- Persistent `Aa` appearance controls expose theme and font selectors on every page
- Tampermonkey menu commands for direct mode selection
- Persistent font choices: site default, system sans-serif, serif, monospace, OpenDyslexic, and OpenDyslexic Mono
- Cross-tab sync: changing the mode in one tab updates the others instantly
- Cross-tab font sync
- Follows system dark/light preference changes in real time (Auto mode)
- Print-safe: reverts to a white background when printing
- No JavaScript dependencies; the OpenDyslexic files are pinned HTTPS userscript resources

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Open the [built userscript](../../raw/master/dist/arxiv-dark-mode.js). Tampermonkey will prompt you to install it.

## Development

```sh
npm install
npm run check
npm run build
```

`src/` is authoritative. `dist/arxiv-dark-mode.js` is the only generated release artifact.

## Usage

| Action                        | Result                                               |
| ----------------------------- | ---------------------------------------------------- |
| Click the `Aa` button         | Open visible theme and reading-font settings         |
| Tampermonkey menu             | Open settings or select a theme/font directly        |

The selected mode and font are saved independently and persist across sessions.

## Compatibility

Tested on Chrome and Firefox with Tampermonkey. Should work with Violentmonkey as well.

## License

MIT
