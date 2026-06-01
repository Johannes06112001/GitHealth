(() => {
  const APP_NAME = 'OpenGitHealth';
  const THEME_KEY = 'openGitHealthTheme';
  const LEGACY_THEME_KEY = 'gitSuccessTheme';

  const LOGO_SVG = `
    <svg class="app-logo-svg" viewBox="0 0 96 96" role="img" aria-label="OpenGitHealth Logo">
      <defs><linearGradient id="oghGradient" x1="12" y1="18" x2="82" y2="76"><stop stop-color="#3478F6"/><stop offset="1" stop-color="#19C7D4"/></linearGradient></defs>
      <path d="M31 18c-12 3-22 14-24 30-2 17 8 35 23 43 8 4 17 5 25 3 12-3 22-13 25-26" fill="none" stroke="url(#oghGradient)" stroke-width="9" stroke-linecap="round"/>
      <path d="M57 18c16 1 29 14 31 31 1 11-2 22-9 31" fill="none" stroke="url(#oghGradient)" stroke-width="9" stroke-linecap="round"/>
      <circle cx="76" cy="72" r="10" fill="none" stroke="#1E293B" stroke-width="5"/>
      <path d="M35 33c4-4 8-4 13-2 4-2 9-2 13 2 1 5 0 9-2 12 4 4 5 14 1 19-3 4-8 6-13 6h-2c-5 0-10-2-13-6-4-5-3-15 1-19-2-3-3-7-2-12Z" fill="white" stroke="#0F172A" stroke-width="3" stroke-linejoin="round"/>
      <path d="M34 64c-8 1-12-2-13-9-1-5-4-6-7-5" fill="none" stroke="#0F172A" stroke-width="3" stroke-linecap="round"/>
    </svg>`;

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
    style.textContent = `.brand{gap:12px!important}.brand .app-logo-svg,.logo .app-logo-svg{width:42px;height:42px;display:block}.logo{width:44px!important;height:44px!important;padding:0!important;background:#fff!important;overflow:hidden}`;
    document.head.appendChild(style);
  }

  function replaceBrand() {
    document.querySelectorAll('.brand').forEach(brand => { brand.innerHTML = `${LOGO_SVG}<span>${APP_NAME}</span>`; });
    document.querySelectorAll('.logo').forEach(logo => { logo.innerHTML = LOGO_SVG; });
  }

  function replaceVisibleNames() {
    document.title = document.title.replaceAll('GitSuccess', APP_NAME).replaceAll('GitHealth', APP_NAME);
    document.querySelectorAll('body *').forEach(node => {
      if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(node.tagName)) return;
      node.childNodes.forEach(child => {
        if (child.nodeType === Node.TEXT_NODE) child.textContent = child.textContent.replaceAll('GitSuccess', APP_NAME).replaceAll('GitHealth', APP_NAME);
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
