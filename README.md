# claude-mastery-tips

A curated collection of practical tips and techniques for mastering Claude AI. Static site built with HTML, CSS, and vanilla JS — deployable on GitHub Pages.

## Features

- Light / Dark theme toggle with localStorage persistence
- Sidebar navigation with search/filter
- Reading progress bar
- Estimated read time per tip
- Copy-to-clipboard on code blocks
- Keyboard navigation (← → arrow keys)
- Responsive design (mobile sidebar drawer)
- Hash-based routing (shareable tip URLs)
- Print-friendly styles
- Zero dependencies — pure HTML/CSS/JS

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` / `root`
4. Your site will be live at `https://yourusername.github.io/claude-mastery-tips/`

## Adding a New Tip

1. Create a new HTML file in `/tips/` (e.g., `tip-my-new-tip.html`)
2. Use this template:

```html
<div class="tip-content">
  <header class="tip-header">
    <span class="tip-category">Category</span>
    <h1>Your Tip Title</h1>
    <div class="tip-meta">
      <time datetime="2025-03-01">Mar 1, 2025</time>
      <span class="read-time"></span>
    </div>
  </header>

  <p>Your content here...</p>
</div>
```

3. Register the tip in `js/app.js` in the `tips` array:

```js
{
  id: 'my-new-tip',
  title: 'Your Full Tip Title',
  shortTitle: 'Short Name',
  category: 'Basics',
  file: 'tips/tip-my-new-tip.html'
}
```

That's it — the sidebar and welcome screen update automatically.

## Project Structure

```
├── index.html          Main page shell
├── css/style.css       All styles + theme variables
├── js/app.js           Navigation, theme, content loading
├── tips/               Individual tip HTML fragments
│   ├── tip-prompt-structure.html
│   ├── tip-system-prompts.html
│   ├── tip-chain-of-thought.html
│   ├── tip-xml-tags.html
│   └── tip-few-shot-examples.html
└── README.md
```

## License

MIT

---

Built by [Ruhul Kuddus](https://linkedin.com/in/ruhulkuddus)
