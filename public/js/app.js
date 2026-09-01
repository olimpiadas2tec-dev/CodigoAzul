const SVG = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/></svg>`,
  historial: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  nuevo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
  pacientes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  personal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  areas: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16"/><path d="M9 9h1"/><path d="M9 13h1"/><path d="M9 17h1"/><path d="M14 9h1"/><path d="M14 13h1"/><path d="M14 17h1"/></svg>`,
  materiales: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/><path d="M12 11v6"/><path d="M9 14h6"/></svg>`,
  reportes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:20px;height:20px;"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:20px;height:20px;"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`
};

function getUser() {
  try {
    const stored = localStorage.getItem('codigoAzulUser');
    if (!stored || stored === 'undefined' || stored === 'null') return null;
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
}

function isLoggedIn() {
  return getUser() !== null;
}

function getRole() {
  const user = getUser();
  return user?.role || user?.rol || 'Administrador';
}

function isConsultaRole() {
  const r = String(getRole()).toLowerCase().trim();
  return r === 'consulta' || r === 'read_only' || r === 'lectura' || r === 'solo lectura';
}

window.getRole = getRole;
window.isConsultaRole = isConsultaRole;

function logout() {
  localStorage.removeItem('codigoAzulUser');
  window.location.hash = '#/login';
}

function handleLogout() {
  if (typeof showConfirmModal === 'function') {
    showConfirmModal({
      title: 'Cerrar Sesión',
      message: '¿Está seguro de que desea salir del sistema Código Azul?',
      confirmText: 'Cerrar Sesión',
      confirmBtnStyle: 'background:var(--celeste); color:#fff; font-weight:700; padding:8px 18px; border-radius:8px; border:none; cursor:pointer;',
      iconName: 'logOut',
      headerBg: '#e0f2fe',
      headerColor: '#0369a1',
      onConfirm: () => {
        logout();
      }
    });
  } else {
    logout();
  }
}

function renderLayout(content, activeRoute) {
  const user = getUser();
  const activeCodes = (typeof getData === 'function' ? getData() : []).filter(d => d.estado && d.estado.value === 'pendiente');

  const alertBanner = activeCodes.length > 0 ? `
    <div style="background:#fef2f2; border-bottom:2px solid #ef4444; padding:10px 24px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#dc2626; box-shadow:0 0 0 4px rgba(220,38,38,0.25);"></span>
        <strong style="color:#991b1b; font-size:13px;">${icon('alertTriangle')} CÓDIGO AZUL EN CURSO:</strong>
        <span style="color:#7f1d1d; font-size:13px; font-weight:600;">
          ${escapeHtml(activeCodes[0].paciente)} &middot; ${escapeHtml(activeCodes[0].area)} [${escapeHtml(activeCodes[0].cama || 'Cama')}] &middot; Brigada: ${escapeHtml(activeCodes[0].equipoEncargado || 'Equipo A')}
        </span>
      </div>
      <a href="#/detalle/${activeCodes[0].id}" class="btn btn-sm" style="background:#dc2626; color:#fff; font-size:11.5px; font-weight:700; padding:4px 12px; border-radius:6px;">
        ${icon('zap')} Ver y Certificar Cierre &rarr;
      </a>
    </div>
  ` : '';

  const roleBar = `
    <div style="background:#f8fafc; border-bottom:1px solid #e2e8f0; padding:8px 24px; display:flex; justify-content:flex-end; align-items:center; flex-wrap:wrap; gap:8px;">
      <div style="font-size:12px; color:var(--gray-600); font-weight:600;">
        Usuario activo: <strong>${escapeHtml(user?.user || 'Usuario')}</strong> &middot; Rol: <strong>${escapeHtml(user?.role || 'Administrador')}</strong>
      </div>
    </div>
  `;

  return `
    <div class="app-layout">
      <button class="mobile-toggle" onclick="document.querySelector('.sidebar').classList.toggle('open')">
        ${SVG.menu}
      </button>
      <div class="sidebar-backdrop" onclick="document.querySelector('.sidebar').classList.remove('open')"></div>
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo" title="Sistema Código Azul">${icon('heart')}</div>
        </div>
        <nav class="sidebar-nav">
          <a href="#/dashboard" class="${activeRoute === 'dashboard' ? 'active' : ''}" data-tooltip="Dashboard" title="Dashboard">
            ${SVG.dashboard}
          </a>
          <a href="#/historial" class="${activeRoute === 'historial' ? 'active' : ''}" data-tooltip="Historial" title="Historial">
            ${SVG.historial}
          </a>
          ${isConsultaRole() ? '' : `
            <a href="#/nuevo" class="${activeRoute === 'nuevo' ? 'active' : ''}" data-tooltip="Nuevo Código" title="Nuevo Código de Emergencia">
              ${SVG.nuevo}
            </a>
          `}
          <a href="#/pacientes" class="${activeRoute === 'pacientes' ? 'active' : ''}" data-tooltip="Pacientes" title="Gestión de Pacientes">
            ${SVG.pacientes}
          </a>
          <a href="#/areas" class="${activeRoute === 'areas' ? 'active' : ''}" data-tooltip="Áreas y Camas" title="Áreas y Camas Hospitalarias">
            ${SVG.areas}
          </a>
          <a href="#/personal" class="${activeRoute === 'personal' ? 'active' : ''}" data-tooltip="Personal y Equipos" title="Personal de Salud y Equipos">
            ${SVG.personal}
          </a>
          <a href="#/materiales" class="${activeRoute === 'materiales' ? 'active' : ''}" data-tooltip="Carro de Paro" title="Materiales y Carro de Paro">
            ${SVG.materiales}
          </a>
          <a href="#/reportes" class="${activeRoute === 'reportes' ? 'active' : ''}" data-tooltip="Reportes" title="Reportes y Estadísticas">
            ${SVG.reportes}
          </a>
        </nav>
        <div class="sidebar-footer">
          <button class="sidebar-logout" onclick="handleLogout()" title="Cerrar Sesión">
            ${SVG.logout}
          </button>
          <div class="sidebar-avatar" title="${user?.user || 'Admin'} (${user?.role || 'Admin'})">${user?.initials || 'AD'}</div>
        </div>
      </aside>
      <div class="app-main-wrapper" style="flex:1; display:flex; flex-direction:column; min-width:0; overflow:hidden;">
        ${roleBar}
        ${alertBanner}
        <main class="main-content" style="flex:1; overflow-y:auto;">
          ${content}
        </main>
      </div>
    </div>
  `;
}

window.handleLogout = handleLogout;

function parseRoute() {
  const hash = window.location.hash.replace('#/', '') || 'login';
  const parts = hash.split('/');
  return { route: parts[0], param: parts[1] || null };
}

function renderApp() {
  const app = document.getElementById('app');
  if (!app) return;
  const { route, param } = parseRoute();

  if (!isLoggedIn() && route !== 'login') {
    window.location.hash = '#/login';
    return;
  }

  if (isLoggedIn() && route === 'login') {
    window.location.hash = '#/dashboard';
    return;
  }

  if (isLoggedIn() && isConsultaRole() && (route === 'nuevo' || route === 'editar')) {
    if (typeof showToast === 'function') {
      showToast('Acceso restringido: El rol Consulta solo dispone de permisos de lectura.', 'warning');
    }
    window.location.hash = '#/dashboard';
    return;
  }

  let content = '';
  let activeRoute = route;

  try {
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
      case 'pacientes':
        content = renderPacientes();
        break;
      case 'areas':
        content = renderAreas();
        break;
      case 'personal':
        content = renderPersonal();
        break;
      case 'materiales':
        content = renderMateriales();
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
      try {
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
          case 'pacientes':
            setupPacientes();
            break;
          case 'areas':
            setupAreas();
            break;
          case 'personal':
            setupPersonal();
            break;
          case 'materiales':
            setupMateriales();
            break;
          case 'reportes':
            setupReportes();
            break;
          case 'dashboard':
            setupDashboard();
            break;
        }
      } catch (setupErr) {
        console.warn('Page setup error:', setupErr);
      }
    });
  } catch (err) {
    console.error('Error rendering route ' + route + ':', err);
    app.innerHTML = renderLayout(`
      <div class="empty-state" style="padding:50px 20px; text-align:center;">
        <span style="font-size:36px;">⚠️</span>
        <h2 style="margin:10px 0 6px 0;">Ocurrió un error al cargar esta sección</h2>
        <p style="color:var(--gray-600); font-size:13px; margin-bottom:16px;">${escapeHtml(err.message || String(err))}</p>
        <button class="btn btn-primary btn-sm" onclick="window.location.hash='#/dashboard'; location.reload();">
          Reintentar y Volver al Dashboard
        </button>
      </div>
    `, 'dashboard');
  }
}

window.renderApp = renderApp;

window.addEventListener('hashchange', renderApp);

// Initial render
if (!window.location.hash) {
  window.location.hash = isLoggedIn() ? '#/dashboard' : '#/login';
}

renderApp();
