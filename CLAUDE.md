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

```html
<div class="tip-content">
  <header class="tip-header">
    <span class="tip-category">Category</span>
    <h1>Title</h1>
    <div class="tip-meta">
      <time datetime="2025-01-01">Jan 1, 2025</time>
      <span class="read-time"></span>  <!-- auto-populated by injectReadTime() -->
    </div>
  </header>
  <!-- content -->
</div>
```

### Theme System

Theme is stored in `localStorage` under key `"theme"` (`"light"` | `"dark"`). Falls back to `prefers-color-scheme`. All colors are CSS custom properties on `:root` scoped by `[data-theme]` attribute on `<html>`.
