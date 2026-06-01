(() => {
  const APP_NAME = 'OpenGitHealth';
  const THEME_KEY = 'openGitHealthTheme';
  const LEGACY_THEME_KEY = 'gitSuccessTheme';
  const LOGO_SRC = 'data:image/webp;base64,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';

  const FALLBACK_NAV_ITEMS = [
    { href: 'top100.html', label: 'Top-100-Vergleichsgruppe' },
    { href: 'index.html', label: 'Repository Analyzer' },
    { href: 'docs.html', label: 'Metrik-Dokumentation' },
    { href: 'api-guide.html', label: 'REST-API Guide' },
    { href: 'about.html', label: 'Team' }
  ];

  function currentFileName() { return window.location.pathname.split('/').pop() || 'index.html'; }
  function isAnalyzerPage() { const f = currentFileName(); return f === 'index.html' || f === '' || f === 'GitHealth' || f === 'OpenGitHealth'; }
  function isTeamSubPage() { return window.location.pathname.includes('/team/'); }
  function prefixPath(href) { return isTeamSubPage() ? `../${href}` : href; }
  function navigationJsonPath() { return isTeamSubPage() ? '../assets/data/navigation.json' : 'assets/data/navigation.json'; }
  function scriptPath(path) { return isTeamSubPage() ? `../${path}` : path; }

  async function loadNavigationItems() {
    try {
      const response = await fetch(navigationJsonPath(), { cache: 'no-cache' });
      if (!response.ok) throw new Error('Navigation JSON konnte nicht geladen werden.');
      const items = await response.json();
      if (!Array.isArray(items) || !items.length) throw new Error('Navigation JSON ist leer oder ungültig.');
      return items.filter(item => item && item.href && item.label);
    } catch (error) { return FALLBACK_NAV_ITEMS; }
  }

  function buildNavigation(items, activePage) {
    const normalized = isAnalyzerPage() ? 'index.html' : activePage;
    return items.map(item => `<a${item.href === normalized ? ' class="active"' : ''} href="${prefixPath(item.href)}">${item.label}</a>`).join('');
  }

  function injectBrandStyles() {
    if (document.getElementById('opengithealth-brand-styles')) return;
    const style = document.createElement('style');
    style.id = 'opengithealth-brand-styles';
    style.textContent = `.brand{gap:12px!important}.brand .app-logo-img,.logo .app-logo-img{width:42px;height:42px;display:block;object-fit:contain;border-radius:10px}.logo{width:44px!important;height:44px!important;padding:0!important;background:#fff!important;overflow:hidden}.brand span{white-space:nowrap}`;
    document.head.appendChild(style);
  }

  function replaceBrand() {
    document.querySelectorAll('.brand').forEach(brand => { brand.innerHTML = `<img class="app-logo-img" src="${LOGO_SRC}" alt="${APP_NAME} Logo"><span>${APP_NAME}</span>`; });
    document.querySelectorAll('.logo').forEach(logo => { logo.innerHTML = `<img class="app-logo-img" src="${LOGO_SRC}" alt="${APP_NAME} Logo">`; });
  }

  function normalizeBrandText(text) {
    return text
      .replaceAll('GitSuccess', APP_NAME)
      .replaceAll('OpenGitHealth', APP_NAME)
      .replaceAll('GitHealth', APP_NAME)
      .replaceAll('OpenOpenGitHealth', APP_NAME);
  }

  function replaceVisibleNames() {
    document.title = normalizeBrandText(document.title);
    document.querySelectorAll('body *').forEach(node => {
      if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(node.tagName)) return;
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) child.textContent = normalizeBrandText(child.textContent);
      });
    });
  }

  async function ensureHeader() {
    const nav = document.getElementById('mainNav') || document.querySelector('.nav');
    if (!nav) return;
    const items = await loadNavigationItems();
    nav.innerHTML = `${buildNavigation(items, currentFileName())}<button id="themeBtn" type="button">Dark Mode</button>`;
    injectBrandStyles(); replaceBrand(); replaceVisibleNames();
  }

  function initTheme() {
    const button = document.getElementById('themeBtn');
    if (!button) return;
    if (localStorage.getItem(THEME_KEY) === 'dark' || localStorage.getItem(LEGACY_THEME_KEY) === 'dark') document.body.classList.add('dark');
    button.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
    button.addEventListener('click', () => { const isDark = document.body.classList.toggle('dark'); localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light'); button.textContent = isDark ? 'Light Mode' : 'Dark Mode'; });
  }

  function initMobileMenu() {
    const toggle = document.getElementById('menuToggle'); const nav = document.getElementById('mainNav') || document.querySelector('.nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => { const isOpen = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(isOpen)); toggle.textContent = isOpen ? '×' : '☰'; });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; }));
  }

  function injectAnalyzerFixes() {
    if (!isAnalyzerPage() || document.getElementById('analyzer-visual-fixes')) return;
    const style = document.createElement('style');
    style.id = 'analyzer-visual-fixes';
    style.textContent = `.table-scroll{overflow:visible!important}.score-tooltip:hover::after{top:calc(100% + 8px)!important;bottom:auto!important;left:50%!important;transform:translateX(-50%)!important;width:min(320px,80vw)!important;max-width:320px!important;z-index:99999!important}.score-tooltip:hover::before{content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);border:6px solid transparent;border-bottom-color:var(--card);z-index:100000}#kpiPanel,#kpiPanel .card,#kpiPanel table,#kpiPanel tbody,#kpiPanel tr,#kpiPanel td{overflow:visible!important}`;
    document.head.appendChild(style);
  }

  function loadAnalyzerExtras() {
    if (!isAnalyzerPage()) return;
    injectAnalyzerFixes();
    if (document.querySelector('script[data-opengithealth-report]')) return;
    const script = document.createElement('script');
    script.src = scriptPath('assets/js/report.js');
    script.dataset.opengithealthReport = 'true';
    document.body.appendChild(script);
  }

  async function initLayout() { await ensureHeader(); initTheme(); initMobileMenu(); loadAnalyzerExtras(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLayout); else initLayout();
})();
