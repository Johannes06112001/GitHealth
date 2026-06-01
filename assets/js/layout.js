(() => {
  const THEME_KEY = 'gitSuccessTheme';

  const NAV_ITEMS = [
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

  function isSubPage() {
    return window.location.pathname.includes('/team/');
  }

  function prefixPath(href) {
    return isSubPage() ? `../${href}` : href;
  }

  function buildNavigation(activePage) {
    return NAV_ITEMS
      .map(item => {
        const isActive = item.href === activePage;
        const className = isActive ? ' class="active"' : '';
        return `<a${className} href="${prefixPath(item.href)}">${item.label}</a>`;
      })
      .join('');
  }

  function ensureHeader() {
    const nav = document.getElementById('mainNav') || document.querySelector('.nav');
    if (!nav) return;

    const activePage = currentFileName();
    const themeButton = document.getElementById('themeBtn') || nav.querySelector('button');

    nav.innerHTML = `${buildNavigation(activePage)}<button id="themeBtn" type="button">${themeButton?.textContent || 'Dark Mode'}</button>`;
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

  function initLayout() {
    ensureHeader();
    initTheme();
    initMobileMenu();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout);
  } else {
    initLayout();
  }
})();
