function renderDashboard() {
  const kpis = getKPIs();
  const data = getData();
  const recent = data.slice(0, 6);
  const monthly = getMonthlyStats();
  const maxTotal = Math.max(...monthly.map(m => m.total), 1);

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Dashboard General</h1>
        <p>Monitoreo en tiempo real del Sistema de Código Azul</p>
      </div>
      <a href="#/nuevo" class="btn btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Nuevo Código
      </a>
    </div>
    <div class="page-body">
      <div class="kpi-grid stagger">
        <div class="kpi-card fade-in">
          <div class="kpi-icon blue">${icon('zap')}</div>
          <div class="kpi-value">${kpis.totalMes}</div>
          <div class="kpi-label">Códigos este mes</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon green">${icon('check')}</div>
          <div class="kpi-value">${kpis.tasaExito}%</div>
          <div class="kpi-label">Tasa de éxito (ROSC)</div>
          <div class="kpi-change up">${icon('triangleUp')} Reanimación efectiva</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon yellow">${icon('clock')}</div>
          <div class="kpi-value">${kpis.tiempoPromedio}m</div>
          <div class="kpi-label">Tiempo prom. respuesta</div>
          <div class="kpi-change down">minutos de llegada</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon red">${icon('clipboard')}</div>
          <div class="kpi-value">${data.length}</div>
          <div class="kpi-label">Total eventos registrados</div>
        </div>
      </div>

      <div class="two-col-grid" style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:20px; margin-bottom:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <h2>Evolución de Códigos por Mes</h2>
          </div>
          <div class="card-body">
            <div class="chart-container" style="height:180px;">
              ${monthly.map(m => `
                <div class="chart-bar-group">
                  <div style="display:flex;gap:4px;align-items:flex-end;height:140px;width:100%;">
                    <div class="chart-bar primary" style="height:${(m.total / maxTotal) * 100}%;" title="Total: ${m.total}"></div>
                    <div class="chart-bar success" style="height:${(m.exitosos / maxTotal) * 100}%;" title="Exitosos (ROSC): ${m.exitosos}"></div>
                  </div>
                  <div class="chart-label">${m.label}</div>
                </div>
              `).join('')}
            </div>
            <div style="display:flex;gap:16px;justify-content:center;margin-top:12px;">
              <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray-400);">
                <span style="width:10px;height:10px;border-radius:3px;background:var(--celeste);display:inline-block;"></span> Total Activaciones
              </span>
              <span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--gray-400);">
                <span style="width:10px;height:10px;border-radius:3px;background:var(--success);display:inline-block;"></span> ROSC (Exitosos)
              </span>
            </div>
          </div>
        </div>

        <div class="card scale-in">
          <div class="card-header">
            <h2> Estado de Eventos</h2>
          </div>
          <div class="card-body" style="display:flex; align-items:center; justify-content:center; padding:12px;">
            ${renderPieChart([
    { label: 'ROSC (Exitosos)', value: data.filter(d => d.estado && d.estado.value === 'resuelto').length, color: '#10b981' },
    { label: 'En Curso', value: data.filter(d => d.estado && d.estado.value === 'pendiente').length, color: '#f59e0b' },
    { label: 'Fallecidos', value: data.filter(d => d.estado && d.estado.value === 'fatal').length, color: '#ef4444' },
    { label: 'Derivados', value: data.filter(d => d.estado && d.estado.value === 'derivado').length, color: '#3b82f6' }
  ], { size: 140, centerLabel: 'Total' })}
          </div>
        </div>
      </div>

      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr; gap:20px;">

        <div class="card scale-in" style="animation-delay: 100ms;">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
            <h2>Últimos Eventos y Pacientes</h2>
            <a href="#/historial" class="action-link">Ver historial completo</a>
          </div>
          <div class="card-body" style="padding:8px 16px;">
            <ul class="recent-list">
              ${recent.map(item => `
                <li class="recent-item" onclick="window.location.hash='#/detalle/${item.id}'" style="padding:10px 12px; border-bottom:1px solid var(--gray-100); display:flex; align-items:center; gap:12px; cursor:pointer;">
                  <span class="recent-dot ${item.estado.value === 'resuelto' ? 'resolved' : item.estado.value === 'pendiente' ? 'pending' : 'fatal'}"></span>
                  <div class="recent-info" style="flex:1;">
                    <div class="recent-title" style="font-weight:700; color:var(--gray-800); font-size:14px;">
                      ${escapeHtml(item.paciente)}
                    </div>
                    <div style="font-size:12px; color:var(--celeste-dark); font-weight:600; margin-top:1px;">
                      ${icon('alertTriangle')} ${escapeHtml(item.causa || 'Paro Cardiorrespiratorio')}
                    </div>
                    <div class="recent-sub" style="font-size:11px; color:var(--gray-500); margin-top:2px;">
                      <span>${item.area} (${escapeHtml(item.cama || 'Cama Guardia')})</span> &middot; 
                      <span>Llamó: <strong>${escapeHtml(item.quienHizoLlamada ? item.quienHizoLlamada.split('(')[0].trim() : 'Guardia')}</strong></span> &middot; 
                      <span>Equipo: <strong>${escapeHtml(item.equipoEncargado || 'Equipo A')}</strong></span>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <span class="badge ${item.estado.badge}" style="font-size:10px; margin-bottom:4px; display:inline-block;">
                      ${item.estado.label}
                    </span>
                    <div class="recent-time" style="font-size:11px; color:var(--gray-400);">${getRelativeTime(item.fecha)}</div>
                  </div>
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
