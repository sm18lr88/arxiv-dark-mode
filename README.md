# arXiv Dark Mode and Font Preferences

A Tampermonkey userscript that applies a comprehensive dark theme and readable font preferences to arXiv.org.

<img width="800" alt="image" src="https://github.com/user-attachments/assets/1e328f95-29ef-42fe-87a1-1c8a155c1dec" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/b3522651-739b-4f44-bf3d-a7e5ada11092" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/246ff652-2ace-4ee6-95ae-a60ab454b712" />

## Features

- Three modes: **Auto** (follows system preference), **Dark**, and **Light**
- Covers all major arXiv subdomains: `arxiv.org`, `export.arxiv.org`, `info.arxiv.org`, `html.arxiv.org`, `ar5iv.labs.arxiv.org`
- Floating toggle button (bottom-right corner) cycles through modes on click
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
2. Open the [raw script file](../../raw/main/arxiv-dark-mode.js) and Tampermonkey will prompt you to install it.

## Usage

| Action | Result |
|---|---|
| Click the toggle button | Cycles: Auto → Dark → Light |
| `Alt+Shift+D` | Same as clicking the toggle |
| Tampermonkey menu | Set mode directly (Auto / Dark / Light) |
| Tampermonkey menu → `Font: …` | Select the page font, including OpenDyslexic options |

The selected mode and font are saved independently and persist across sessions.

## Compatibility

Tested on Chrome and Firefox with Tampermonkey. Should work with Violentmonkey as well.

## License

MIT
