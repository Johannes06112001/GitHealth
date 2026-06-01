(() => {
  const APP_NAME = 'OpenGitHealth';
  const THEME_KEY = 'openGitHealthTheme';
  const LEGACY_THEME_KEY = 'gitSuccessTheme';
  const LOGO_FILE = 'Logo%20GitHealth.png';

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
  function logoPath() { return isTeamSubPage() ? `../${LOGO_FILE}` : LOGO_FILE; }
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
    style.textContent = `
      .brand{gap:12px!important;align-items:center!important}
      .brand .app-logo-img,.logo .app-logo-img{width:44px;height:44px;display:block;object-fit:contain;border-radius:10px;background:#fff}
      .logo{width:46px!important;height:46px!important;padding:0!important;background:#fff!important;overflow:hidden;border-radius:13px!important}
      .brand span{white-space:nowrap}
    `;
    document.head.appendChild(style);
  }

  function replaceBrand() {
    const logo = `<img class="app-logo-img" src="${logoPath()}" alt="${APP_NAME} Logo">`;
    document.querySelectorAll('.brand').forEach(brand => { brand.innerHTML = `${logo}<span>${APP_NAME}</span>`; });
    document.querySelectorAll('.logo').forEach(logoBox => { logoBox.innerHTML = logo; });
  }

  function normalizeBrandText(text) {
    return String(text ?? '')
      .replaceAll('OpenOpenGitHealth', APP_NAME)
      .replaceAll('GitSuccess', APP_NAME)
      .replace(/\bGitHealth\b/g, APP_NAME);
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
