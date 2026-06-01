(() => {
  const THEME_KEY = 'gitSuccessTheme';

  const FALLBACK_NAV_ITEMS = [
    { href: 'top100.html', label: 'Top-100-Vergleichsgruppe' },
    { href: 'index.html', label: 'Repository Analyzer' },
    { href: 'docs.html', label: 'Metrik-Dokumentation' },
    { href: 'api-guide.html', label: 'REST-API Guide' },
    { href: 'about.html', label: 'Team' }
  ];

  function currentFileName() {
    const fileName = window.location.pathname.split('/').pop();
    return fileName || 'index.html';
  }

  function isTeamSubPage() {
    return window.location.pathname.includes('/team/');
  }

  function prefixPath(href) {
    return isTeamSubPage() ? `../${href}` : href;
  }

  function navigationJsonPath() {
    return isTeamSubPage() ? '../assets/data/navigation.json' : 'assets/data/navigation.json';
  }

  async function loadNavigationItems() {
    try {
      const response = await fetch(navigationJsonPath(), { cache: 'no-cache' });
      if (!response.ok) throw new Error('Navigation JSON konnte nicht geladen werden.');

      const items = await response.json();
      if (!Array.isArray(items) || !items.length) throw new Error('Navigation JSON ist leer oder ungültig.');

      return items.filter(item => item && item.href && item.label);
    } catch (error) {
      return FALLBACK_NAV_ITEMS;
    }
  }

  function buildNavigation(items, activePage) {
    return items
      .map(item => {
        const isActive = item.href === activePage;
        const className = isActive ? ' class="active"' : '';
        return `<a${className} href="${prefixPath(item.href)}">${item.label}</a>`;
      })
      .join('');
  }

  async function ensureHeader() {
    const nav = document.getElementById('mainNav') || document.querySelector('.nav');
    if (!nav) return;

    const activePage = currentFileName();
    const items = await loadNavigationItems();
    nav.innerHTML = `${buildNavigation(items, activePage)}<button id="themeBtn" type="button">Dark Mode</button>`;
  }

  function initTheme() {
    const button = document.getElementById('themeBtn');
    if (!button) return;

    if (localStorage.getItem(THEME_KEY) === 'dark') {
      document.body.classList.add('dark');
    }

    button.textContent = document.body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';

    button.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
      button.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });
  }

  function initMobileMenu() {
    const toggle = document.getElementById('menuToggle');
    const navigation = document.getElementById('mainNav') || document.querySelector('.nav');
    if (!toggle || !navigation) return;

    toggle.addEventListener('click', () => {
      const isOpen = navigation.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.textContent = isOpen ? '×' : '☰';
    });

    navigation.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navigation.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });
  }

  async function initLayout() {
    await ensureHeader();
    initTheme();
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
