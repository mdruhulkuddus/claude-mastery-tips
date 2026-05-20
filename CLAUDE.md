# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static site (zero dependencies, pure HTML/CSS/vanilla JS) for a curated Claude AI tips collection. Deployable on GitHub Pages from the `main` branch at root.

## Development

No build step. Open `index.html` directly in a browser, or use any static file server:

```bash
npx serve .
# or
python -m http.server
```

## Architecture

- **`index.html`** — single-page shell; all layout is here, content area is populated by JS
- **`js/app.js`** — all application logic: tip registry, routing, sidebar render, theme, search, content loading
- **`css/style.css`** — all styles including CSS custom properties for theming (`data-theme="light|dark"`)
- **`tips/`** — individual tip HTML fragments (no `<html>`/`<body>` wrappers — just content divs)

### Content Loading Flow

Hash-based routing (`#tip-id`) → `loadTip(id)` → `fetch(tip.file)` → inject HTML into `#tipBody`. Fetched content is cached in `contentCache` (in-memory, not persisted).

### Adding a Tip

1. Create `tips/tip-<slug>.html` containing a `.tip-content` div (see template in README.md)
2. Register it in the `tips` array at the top of `js/app.js`:

```js
{
  id: 'my-slug',          // matches hash and filename suffix
  title: 'Full Title',
  shortTitle: 'Sidebar Label',
  category: 'Basics',     // groups tips in sidebar; creates new group if new value
  file: 'tips/tip-my-slug.html'
}
```

Sidebar grouping, welcome screen featured cards, and tip count all update automatically from the registry.

### Tip HTML Template

Each tip file must be an HTML **fragment** — no `<!DOCTYPE>`, `<html>`, `<head>`, or `<body>` tags. The file is injected via `innerHTML`, so any `<style>` tags inside a `<head>` would be stripped by the browser.

The pattern used by all existing tips is a namespace wrapper → inner container:

```html
<div class="tp-<namespace>">
  <div class="wrap">   <!-- or .container for tp-token -->
    <!-- full tip content -->
  </div>
</div>
```

CSS for each namespace lives in `css/tips.css`. All color values must reference variables from `css/theme.css` (e.g. `var(--accent)`, `var(--color-teal)`) — never hardcode colors.

### CSS Variable Reference (theme.css)

Key variables available to tip styles:

| Variable | Purpose |
|---|---|
| `--bg`, `--surface` | Page and card backgrounds |
| `--text`, `--text-secondary`, `--text-muted` | Text hierarchy |
| `--accent`, `--accent-hover` | Primary brand color |
| `--border` | Borders and dividers |
| `--color-teal`, `--color-blue`, `--color-amber` | Semantic accent colors |
| `--color-violet`, `--color-lime`, `--color-orange` | Semantic accent colors |
| `--color-rose`, `--color-sky` | Semantic accent colors |
| `--gradient-blue`, `--gradient-emerald`, `--gradient-amber`, `--gradient-rose` | Gradient presets |
| `--shadow-sm`, `--shadow-md`, `--shadow-lg` | Box shadows |

### Theme System

Theme is stored in `localStorage` under key `"theme"` (`"light"` | `"dark"`). Falls back to `prefers-color-scheme`. All colors are CSS custom properties on `:root` scoped by `[data-theme]` attribute on `<html>`.

## Current Tips (as of 2026-04-12)

| File | Namespace | Language | Topic |
|---|---|---|---|
| `tips/tip-master-claude-code.html` | `.tp-master` | English | Mastering Claude Code (9 sections) |
| `tips/tip-claude-project-training-guide.html` | `.tp-training` | Bengali | Claude Project Training (5-phase guide) |
| `tips/tip-claude-token-optimization-guide.html` | `.tp-token` | Bengali | Token optimization for Claude Pro users |

All three files are proper fragments (converted from standalone full HTML pages). They are registered in the `tips` array at the top of `js/app.js`.

## File Structure

```
index.html              — SPA shell
js/
  app.js                — all app logic (tip registry, routing, theme, search)
css/
  theme.css             — CSS custom properties for light/dark theming
  style.css             — layout, components, sidebar, header, footer
  tips.css              — per-tip namespace styles (.tp-master, .tp-training, .tp-token)
tips/
  tip-master-claude-code.html
  tip-claude-project-training-guide.html
  tip-claude-token-optimization-guide.html
```
