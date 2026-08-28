const SVG = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>`,
  historial: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  nuevo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  reportes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`
};

function getUser() {
  const stored = localStorage.getItem('codigoAzulUser');
  return stored ? JSON.parse(stored) : null;
}

function isLoggedIn() {
  return getUser() !== null;
}

function logout() {
  localStorage.removeItem('codigoAzulUser');
  window.location.hash = '#/login';
}

function renderLayout(content, activeRoute) {
  const user = getUser();

  return `
    <div class="app-layout">
      <button class="mobile-toggle" onclick="document.querySelector('.sidebar').classList.toggle('open')">
        ${SVG.menu}
      </button>
      <div class="sidebar-backdrop" onclick="document.querySelector('.sidebar').classList.remove('open')"></div>
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">${icon('heart')}</div>
        </div>
        <nav class="sidebar-nav">
          <a href="#/dashboard" class="${activeRoute === 'dashboard' ? 'active' : ''}" data-tooltip="Dashboard">
            ${SVG.dashboard}
          </a>
          <a href="#/historial" class="${activeRoute === 'historial' ? 'active' : ''}" data-tooltip="Historial">
            ${SVG.historial}
          </a>
          <a href="#/nuevo" class="${activeRoute === 'nuevo' ? 'active' : ''}" data-tooltip="Nuevo Codigo">
            ${SVG.nuevo}
          </a>
          <a href="#/reportes" class="${activeRoute === 'reportes' ? 'active' : ''}" data-tooltip="Reportes">
            ${SVG.reportes}
          </a>
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-avatar" title="${user?.user || 'Admin'}">${user?.initials || 'AD'}</div>
          <button class="sidebar-logout" onclick="handleLogout()">
            ${SVG.logout}
          </button>
        </div>
      </aside>
      <main class="main-content">
        ${content}
      </main>
    </div>
  `;
}

window.handleLogout = logout;

function parseRoute() {
  const hash = window.location.hash.replace('#/', '') || 'login';
  const parts = hash.split('/');
  return { route: parts[0], param: parts[1] || null };
}

function renderApp() {
  const app = document.getElementById('app');
  const { route, param } = parseRoute();

  if (!isLoggedIn() && route !== 'login') {
    window.location.hash = '#/login';
    return;
  }

  if (isLoggedIn() && route === 'login') {
    window.location.hash = '#/dashboard';
    return;
  }

  let content = '';
  let activeRoute = route;

  switch (route) {
    case 'login':
      app.innerHTML = renderLogin();
      setupLogin();
      return;
    case 'dashboard':
      content = renderDashboard();
      break;
    case 'historial':
      content = renderHistorial();
      break;
    case 'nuevo':
      content = renderCodigoForm(null);
      break;
    case 'editar':
      content = renderCodigoForm(parseInt(param));
      break;
    case 'detalle':
      content = renderDetalle(parseInt(param));
      break;
    case 'reportes':
      content = renderReportes();
      break;
    default:
      activeRoute = 'dashboard';
      content = renderDashboard();
  }

  app.innerHTML = renderLayout(content, activeRoute);

  // Run page-specific setup
  requestAnimationFrame(() => {
    switch (route) {
      case 'historial':
        setupHistorial();
        break;
      case 'nuevo':
        setupCodigoForm(null);
        break;
      case 'editar':
        setupCodigoForm(parseInt(param));
        break;
      case 'detalle':
        setupDetalle();
        break;
      case 'reportes':
        setupReportes();
        break;
      case 'dashboard':
        setupDashboard();
        break;
    }
  });
}

window.renderApp = renderApp;

window.addEventListener('hashchange', renderApp);

// Initial render
if (!window.location.hash) {
  window.location.hash = isLoggedIn() ? '#/dashboard' : '#/login';
}

renderApp();
