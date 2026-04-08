/* ===================================================
   Claude Mastery Tips — App Logic
   Sidebar nav, theme toggle, content loading, search
   =================================================== */

// --- Tip Registry ---
const tips = [
  {
    id: 'claude-project-training-guide',
    title: 'Claude Project Training Guide',
    shortTitle: 'Claude Project Training',
    category: 'Basics',
    file: 'tips/tip-claude-project-training-guide.html'
  },
  {
    id: 'master-claude-code',
    title: 'Mastering Claude Code',
    shortTitle: 'Mastering Claude Code',
    category: 'Advanced',
    file: 'tips/tip-master-claude-code.html'
  },
  {
    id: 'claude-token-optimization-guide',
    title: 'Claude Token Optimization Guide',
    shortTitle: 'Token Optimization',
    category: 'Techniques',
    file: 'tips/tip-claude-token-optimization-guide.html'
  }
];

// --- DOM Elements ---
const $ = (sel) => document.querySelector(sel);
const sidebarNav = $('#sidebarNav');
const searchInput = $('#searchInput');
const contentArea = $('#contentArea');
const welcomeScreen = $('#welcomeScreen');
const tipContainer = $('#tipContainer');
const tipBody = $('#tipBody');
const tipPosition = $('#tipPosition');
const prevTipBtn = $('#prevTip');
const nextTipBtn = $('#nextTip');
const themeToggle = $('#themeToggle');
const progressBar = $('#progressBar');
const backToTopBtn = $('#backToTop');
const mobileMenuBtn = $('#mobileMenuBtn');
const sidebar = $('#sidebar');
const sidebarOverlay = $('#sidebarOverlay');
const featuredTips = $('#featuredTips');
const tipCount = $('#tipCount');
const homeLink = $('#homeLink');

// --- State ---
let currentTipId = null;
let contentCache = {};

// --- Theme ---
function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    // Default: detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
}

// --- Sidebar Rendering ---
function renderSidebar(filter = '') {
  const filterLower = filter.toLowerCase();
  const grouped = {};

  tips.forEach((tip) => {
    if (filter && !tip.shortTitle.toLowerCase().includes(filterLower) &&
        !tip.title.toLowerCase().includes(filterLower) &&
        !tip.category.toLowerCase().includes(filterLower)) {
      return;
    }
    if (!grouped[tip.category]) grouped[tip.category] = [];
    grouped[tip.category].push(tip);
  });

  const categories = Object.keys(grouped);

  if (categories.length === 0) {
    sidebarNav.innerHTML = '<div class="sidebar-no-results">No tips found</div>';
    return;
  }

  let html = '';
  let globalIndex = 0;

  categories.forEach((cat) => {
    html += `<div class="sidebar-category">`;
    html += `<span class="category-label">${cat}</span>`;
    grouped[cat].forEach((tip) => {
      globalIndex++;
      const idx = tips.indexOf(tip) + 1;
      const activeClass = tip.id === currentTipId ? 'active' : '';
      html += `
        <a class="sidebar-link ${activeClass}" data-id="${tip.id}" href="#${tip.id}">
          <span class="sidebar-link-number">${String(idx).padStart(2, '0')}</span>
          ${tip.shortTitle}
        </a>`;
    });
    html += `</div>`;
  });

  sidebarNav.innerHTML = html;

  // Attach click handlers
  sidebarNav.querySelectorAll('.sidebar-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const id = link.dataset.id;
      loadTip(id);
      closeMobileMenu();
    });
  });
}

// --- Content Loading ---
async function loadTip(id) {
  const tip = tips.find(t => t.id === id);
  if (!tip) return;

  currentTipId = id;
  window.location.hash = id;

  // Update sidebar active state
  sidebarNav.querySelectorAll('.sidebar-link').forEach((link) => {
    link.classList.toggle('active', link.dataset.id === id);
  });

  // Show tip container, hide welcome
  welcomeScreen.style.display = 'none';
  tipContainer.style.display = 'block';

  // Update nav position
  const idx = tips.indexOf(tip);
  tipPosition.textContent = `Tip ${idx + 1} of ${tips.length}`;
  prevTipBtn.disabled = idx === 0;
  nextTipBtn.disabled = idx === tips.length - 1;

  // Show skeleton loading
  tipBody.classList.remove('fade-in');
  tipBody.innerHTML = `
    <div class="tip-content">
      <div class="tip-header">
        <div class="skeleton skeleton-meta" style="width: 80px; height: 20px; margin-bottom: 12px;"></div>
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-meta"></div>
      </div>
      <div class="skeleton skeleton-line" style="margin-top: 32px;"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line" style="width: 75%;"></div>
    </div>
  `;

  // Load content
  try {
    let html;
    if (contentCache[id]) {
      html = contentCache[id];
    } else {
      const resp = await fetch(tip.file);
      if (!resp.ok) throw new Error('Not found');
      html = await resp.text();
      contentCache[id] = html;
    }

    // Small delay so skeleton is visible briefly (feels snappier than instant swap)
    await new Promise(r => setTimeout(r, 120));

    tipBody.innerHTML = html;
    tipBody.classList.add('fade-in');

    // Add copy buttons to code blocks
    addCopyButtons();

    // Calculate and inject read time if not present
    injectReadTime();

    // Scroll content area to top
    contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (err) {
    tipBody.innerHTML = `
      <div class="tip-content" style="text-align: center; padding: 60px 20px;">
        <div style="font-size: 40px; margin-bottom: 16px;">🔍</div>
        <h2 style="margin-bottom: 8px;">Tip Not Found</h2>
        <p style="color: var(--text-muted);">Could not load "${tip.shortTitle}". The file may not exist yet.</p>
      </div>
    `;
    tipBody.classList.add('fade-in');
  }
}

function showWelcome() {
  currentTipId = null;
  window.location.hash = '';
  welcomeScreen.style.display = 'flex';
  tipContainer.style.display = 'none';
  sidebarNav.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
}

// --- Copy Code Button ---
function addCopyButtons() {
  tipBody.querySelectorAll('pre').forEach((pre) => {
    if (pre.querySelector('.code-copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      } catch {
        btn.textContent = 'Failed';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    });
    pre.style.position = 'relative';
    pre.appendChild(btn);
  });
}

// --- Read Time ---
function injectReadTime() {
  const readTimeEl = tipBody.querySelector('.read-time');
  if (readTimeEl && !readTimeEl.textContent.trim()) {
    const text = tipBody.textContent || '';
    const words = text.split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 230));
    readTimeEl.textContent = `${mins} min read`;
  }
}

// --- Reading Progress ---
function updateProgress() {
  if (tipContainer.style.display === 'none') {
    progressBar.style.width = '0%';
    return;
  }
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight <= 0) {
    progressBar.style.width = '0%';
    return;
  }
  const pct = Math.min((scrollTop / docHeight) * 100, 100);
  progressBar.style.width = pct + '%';
}

// --- Back to Top ---
function updateBackToTop() {
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

// --- Mobile Menu ---
function openMobileMenu() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// --- Search / Filter ---
function onSearch() {
  const val = searchInput.value.trim();
  renderSidebar(val);
}

// --- Prev / Next Navigation ---
function goToAdjacentTip(direction) {
  if (!currentTipId) return;
  const idx = tips.findIndex(t => t.id === currentTipId);
  const nextIdx = idx + direction;
  if (nextIdx >= 0 && nextIdx < tips.length) {
    loadTip(tips[nextIdx].id);
  }
}

// --- Keyboard Navigation ---
function onKeyDown(e) {
  // Don't intercept if typing in search
  if (document.activeElement === searchInput) return;

  if (e.key === 'j' || e.key === 'ArrowDown') {
    if (e.ctrlKey || e.metaKey) return;
    // Only navigate tips if sidebar context
  }

  if (e.key === 'ArrowLeft') {
    goToAdjacentTip(-1);
  } else if (e.key === 'ArrowRight') {
    goToAdjacentTip(1);
  }
}

// --- Featured Tips (Welcome Screen) ---
function renderFeaturedTips() {
  tipCount.textContent = `${tips.length} tips`;

  const featured = tips.slice(0, 3);
  featuredTips.innerHTML = featured.map(tip => `
    <a class="featured-tip-card" data-id="${tip.id}" href="#${tip.id}">
      <span class="card-category">${tip.category}</span>
      <span class="card-title">${tip.shortTitle}</span>
    </a>
  `).join('');

  featuredTips.querySelectorAll('.featured-tip-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      loadTip(card.dataset.id);
    });
  });
}

// --- Hash Routing ---
function handleHash() {
  const hash = window.location.hash.slice(1);
  if (hash && tips.find(t => t.id === hash)) {
    loadTip(hash);
  } else {
    showWelcome();
  }
}

// --- Init ---
function init() {
  initTheme();
  renderSidebar();
  renderFeaturedTips();

  // Event listeners
  themeToggle.addEventListener('click', toggleTheme);
  searchInput.addEventListener('input', onSearch);
  prevTipBtn.addEventListener('click', () => goToAdjacentTip(-1));
  nextTipBtn.addEventListener('click', () => goToAdjacentTip(1));
  backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  mobileMenuBtn.addEventListener('click', openMobileMenu);
  sidebarOverlay.addEventListener('click', closeMobileMenu);
  homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    showWelcome();
    closeMobileMenu();
  });

  window.addEventListener('scroll', () => {
    updateProgress();
    updateBackToTop();
  }, { passive: true });

  window.addEventListener('hashchange', handleHash);
  document.addEventListener('keydown', onKeyDown);

  // System theme change listener
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  // Initial route
  handleHash();
}

// Start
document.addEventListener('DOMContentLoaded', init);
