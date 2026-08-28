function renderDashboard() {
  const kpis = getKPIs();
  const data = getData();
  const recent = data.slice(0, 6);
  const monthly = getMonthlyStats();
  const maxTotal = Math.max(...monthly.map(m => m.total), 1);

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Dashboard</h1>
        <p>Vista general de codigos azules</p>
      </div>
      <a href="#/nuevo" class="btn btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Nuevo Codigo
      </a>
    </div>
    <div class="page-body">
      <div class="kpi-grid stagger">
        <div class="kpi-card fade-in">
          <div class="kpi-icon blue">${icon('zap')}</div>
          <div class="kpi-value">${kpis.totalMes}</div>
          <div class="kpi-label">Codigos este mes</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon green">${icon('check')}</div>
          <div class="kpi-value">${kpis.tasaExito}%</div>
          <div class="kpi-label">Tasa de exito</div>
          <div class="kpi-change up">${icon('triangleUp')} 3% vs mes anterior</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon yellow">${icon('clock')}</div>
          <div class="kpi-value">${kpis.tiempoPromedio}m</div>
          <div class="kpi-label">Tiempo prom. respuesta</div>
          <div class="kpi-change down">minutos</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon red">${icon('clipboard')}</div>
          <div class="kpi-value">${data.length}</div>
          <div class="kpi-label">Total historial</div>
        </div>
      </div>

      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <h2>Codigos por mes</h2>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height:180px;">
              ${monthly.map(m => `
                <div class="chart-bar-group">
                  <div style="display:flex;gap:4px;align-items:flex-end;height:140px;width:100%;">
                    <div class="chart-bar primary" style="height:${(m.total / maxTotal) * 100}%;" title="Total: ${m.total}"></div>
                    <div class="chart-bar success" style="height:${(m.exitosos / maxTotal) * 100}%;" title="Exitosos: ${m.exitosos}"></div>
                  </div>
                  <div class="chart-label">${m.label}</div>
                </div>
              `).join('')}
            </div>
            <div style="display:flex;gap:16px;justify-content:center;margin-top:12px;">
              <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray-400);">
                <span style="width:10px;height:10px;border-radius:3px;background:var(--celeste);display:inline-block;"></span> Total
              </span>
              <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray-400);">
                <span style="width:10px;height:10px;border-radius:3px;background:var(--success);display:inline-block;"></span> Exitosos
              </span>
            </div>
          </div>
        </div>

        <div class="card scale-in" style="animation-delay: 100ms;">
          <div class="card-header">
            <h2>Ultimos registros</h2>
            <a href="#/historial" class="action-link">Ver todos</a>
          </div>
          <div class="card-body" style="padding:12px 24px;">
            <ul class="recent-list">
              ${recent.map(item => `
                <li class="recent-item" onclick="window.location.hash='#/detalle/${item.id}'">
                  <span class="recent-dot ${item.estado.value === 'resuelto' ? 'resolved' : item.estado.value === 'pendiente' ? 'pending' : 'fatal'}"></span>
                  <div class="recent-info">
                    <div class="recent-title">${escapeHtml(item.paciente)}</div>
                    <div class="recent-sub">${item.area} &middot; ${item.estado.label}</div>
                  </div>
                  <span class="recent-time">${getRelativeTime(item.fecha)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupDashboard() {
  const kpiValues = document.querySelectorAll('.kpi-value');
  kpiValues.forEach(el => {
    const text = el.textContent.trim();
    const num = parseFloat(text);
    if (!isNaN(num)) {
      const suffix = text.replace(String(num), '');
      el.textContent = '0' + suffix;
      setTimeout(() => animateCounter(el, num, suffix), 300);
    }
  });
}
