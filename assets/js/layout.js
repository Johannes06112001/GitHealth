(() => {
  const APP_NAME = 'OpenGitHealth';
  const THEME_KEY = 'openGitHealthTheme';
  const LEGACY_THEME_KEY = 'gitSuccessTheme';
  const LOGO_FILE = 'Logo%20GitHealth.png';
  const LANGUAGE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#14B8A6'];
  let languageCache = [];
  let lastLanguageRepo = '';

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
  function homePath() { return isTeamSubPage() ? '../index.html' : 'index.html'; }
  function navigationJsonPath() { return isTeamSubPage() ? '../assets/data/navigation.json' : 'assets/data/navigation.json'; }
  function scriptPath(path) { return isTeamSubPage() ? `../${path}` : path; }
  function languagePercent(value) { return value >= 10 ? value.toFixed(1).replace('.0', '') + '%' : value.toFixed(1) + '%'; }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }

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
      .brand{gap:12px!important;align-items:center!important;color:inherit!important;text-decoration:none!important}
      .brand .app-logo-img,.logo .app-logo-img{width:44px;height:44px;display:block;object-fit:contain;border-radius:10px;background:#fff}
      .logo{width:46px!important;height:46px!important;padding:0!important;background:#fff!important;overflow:hidden;border-radius:13px!important}
      .brand span{white-space:nowrap}
      .language-card{padding:18px 20px;display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px;align-items:center}
      .language-head h2{font-size:17px;margin-bottom:6px}.language-head p{font-size:12px;color:var(--muted);line-height:1.55}
      .language-list{display:grid;gap:8px;margin-top:14px}.language-row{display:grid;grid-template-columns:14px minmax(0,1fr) auto;gap:8px;align-items:center;font-size:12px}.language-dot{width:11px;height:11px;border-radius:50%}.language-bar{height:7px;border-radius:999px;background:var(--border);overflow:hidden}.language-bar i{display:block;height:100%;width:var(--w);background:var(--c)}.language-value{font-weight:700;color:var(--text)}
      .language-chart-wrap{display:grid;place-items:center}.language-donut{width:210px;height:210px;border-radius:50%;background:conic-gradient(var(--segments));position:relative}.language-donut:after{content:"";position:absolute;inset:46px;border-radius:50%;background:var(--card)}.language-center{position:absolute;inset:0;display:grid;place-items:center;text-align:center;z-index:1}.language-center b{font-size:22px}.language-center span{display:block;font-size:11px;color:var(--muted)}
      @media(max-width:760px){.language-card{grid-template-columns:1fr}.language-chart-wrap{order:-1}.language-donut{width:180px;height:180px}}
    `;
    document.head.appendChild(style);
  }

  function replaceBrand() {
    const logo = `<img class="app-logo-img" src="${logoPath()}" alt="${APP_NAME} Logo">`;
    document.querySelectorAll('.brand').forEach(brand => { brand.outerHTML = `<a class="brand" href="${homePath()}" aria-label="Zum Repository Analyzer">${logo}<span>${APP_NAME}</span></a>`; });
    document.querySelectorAll('.logo').forEach(logoBox => { logoBox.innerHTML = logo; });
  }

  function normalizeBrandText(text) {
    return String(text ?? '').replaceAll('OpenOpenGitHealth', APP_NAME).replaceAll('GitSuccess', APP_NAME).replace(/\bGitHealth\b/g, APP_NAME);
  }

  function replaceVisibleNames() {
    document.title = normalizeBrandText(document.title);
    document.querySelectorAll('body *').forEach(node => {
      if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(node.tagName)) return;
      node.childNodes.forEach(child => { if (child.nodeType === Node.TEXT_NODE) child.textContent = normalizeBrandText(child.textContent); });
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

  function parseRepo(raw) {
    const value = String(raw || '').trim().replace(/^git\+/, '').replace(/\.git$/, '').replace(/\/+$/, '');
    const match = value.match(/^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\/.*)?$/) || value.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
    return match ? `${match[1]}/${match[2]}` : '';
  }

  function tokenHeaders() {
    const token = (document.getElementById('tokenIn')?.value || localStorage.getItem('gitSuccessToken') || localStorage.getItem('openGitHealthToken') || '').trim();
    const headers = {'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'};
    if (token) headers.Authorization = 'Bearer ' + token;
    return headers;
  }

  async function loadLanguages(repo) {
    const [owner, name] = repo.split('/');
    const response = await fetch(`https://api.github.com/repos/${owner}/${name}/languages`, {headers: tokenHeaders()});
    if (!response.ok) throw new Error('Sprachverteilung konnte nicht geladen werden.');
    const data = await response.json();
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    return Object.entries(data).map(([name, bytes], index) => ({name, bytes, pct: total ? bytes / total * 100 : 0, color: LANGUAGE_COLORS[index % LANGUAGE_COLORS.length]})).sort((a, b) => b.bytes - a.bytes);
  }

  function languageSegments(items) {
    let start = 0;
    return items.map(item => { const end = start + item.pct; const part = `${item.color} ${start}% ${end}%`; start = end; return part; }).join(', ');
  }

  function renderLanguageChart(items) {
    const repoHdr = document.getElementById('repoHdr');
    if (!repoHdr || !items.length) return;
    languageCache = items;
    let panel = document.getElementById('languagePanel');
    if (!panel) { panel = document.createElement('section'); panel.id = 'languagePanel'; panel.className = 'card language-card'; repoHdr.insertAdjacentElement('afterend', panel); }
    const top = items[0];
    panel.innerHTML = `<div class="language-head"><h2>Language Distribution</h2><p>Verteilung der Programmiersprachen im Repository auf Basis der GitHub-Languages-API.</p><div class="language-list">${items.map(item => `<div class="language-row"><span class="language-dot" style="background:${item.color}"></span><span>${escapeHtml(item.name)}<div class="language-bar"><i style="--w:${item.pct}%;--c:${item.color}"></i></div></span><span class="language-value">${languagePercent(item.pct)}</span></div>`).join('')}</div></div><div class="language-chart-wrap"><div class="language-donut" style="--segments:${languageSegments(items)}"><div class="language-center"><div><b>${escapeHtml(top.name)}</b><span>${languagePercent(top.pct)}</span></div></div></div></div>`;
  }

  async function refreshLanguageChart() {
    const repo = parseRepo(document.getElementById('repoIn')?.value || '');
    if (!repo || repo === lastLanguageRepo) return;
    lastLanguageRepo = repo;
    try { renderLanguageChart(await loadLanguages(repo)); } catch (error) { languageCache = []; }
  }

  function initLanguageChart() {
    const results = document.getElementById('results');
    if (!results) return;
    new MutationObserver(() => { if (!results.classList.contains('hidden')) setTimeout(refreshLanguageChart, 300); }).observe(results, {attributes:true, attributeFilter:['class']});
    document.getElementById('analyzeBtn')?.addEventListener('click', () => { lastLanguageRepo = ''; });
    window.OpenGitHealthLanguageChart = { getItems: () => languageCache, segments: languageSegments, percent: languagePercent };
  }

  function loadAnalyzerExtras() {
    if (!isAnalyzerPage()) return;
    injectAnalyzerFixes();
    initLanguageChart();
    if (document.querySelector('script[data-opengithealth-report]')) return;
    const script = document.createElement('script');
    script.src = scriptPath('assets/js/report.js');
    script.dataset.opengithealthReport = 'true';
    document.body.appendChild(script);
  }

  async function initLayout() { await ensureHeader(); initTheme(); initMobileMenu(); loadAnalyzerExtras(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initLayout); else initLayout();
})();