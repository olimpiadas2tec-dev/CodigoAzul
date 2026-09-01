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
      ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
        <a href="#/nuevo" class="btn btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Código
        </a>
      `}
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
          <div class="kpi-change up" style="color:#059669; background:#ecfdf5; padding:2px 8px; border-radius:12px; font-weight:600; font-size:11px; display:inline-flex; align-items:center; gap:4px; margin-top:4px;">
            ${icon('check')} Meta &lt; 5 min (Excelente)
          </div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon" style="background:#f1f5f9; color:#475569;">${icon('clipboard')}</div>
          <div class="kpi-value">${data.length}</div>
          <div class="kpi-label">Total eventos registrados</div>
        </div>
      </div>

      <div class="two-col-grid" style="display:grid; grid-template-columns: 1.2fr 0.8fr; gap:20px; margin-bottom:20px;">
        <div class="card scale-in">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <h2 style="margin:0;">Evolución de Códigos por Mes</h2>
            <span class="badge" style="background:#f1f5f9; color:#64748b; font-size:11px; font-weight:600; border:1px solid #cbd5e1;">ℹ Sistema iniciado en Agosto 2026</span>
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
            <h2>Estado de Eventos</h2>
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
            <a href="#/historial" class="action-link" style="font-weight:700; font-size:13px;">Ver historial completo &rarr;</a>
          </div>
          <div class="card-body" style="padding:12px 16px;">
            <ul class="recent-list" style="display:flex; flex-direction:column; gap:6px;">
              ${recent.map((item, idx) => {
                const isFatal = item.estado && item.estado.value === 'fatal';
                const isMostRecent = idx === 0;
                const rowBg = isFatal ? '#fef2f2' : (isMostRecent ? '#f0f9ff' : '#ffffff');
                const rowBorder = isFatal ? '#ef4444' : (isMostRecent ? 'var(--celeste)' : '#e2e8f0');

                return `
                  <li class="recent-item" onclick="window.location.hash='#/detalle/${item.id}'" style="padding:10px 14px; border:1px solid ${isFatal ? '#fca5a5' : (isMostRecent ? 'var(--celeste-300)' : '#e2e8f0')}; border-left:4px solid ${rowBorder}; background:${rowBg}; border-radius:8px; display:flex; align-items:center; gap:12px; cursor:pointer; transition:transform 0.1s ease, box-shadow 0.1s ease;">
                    <span class="recent-dot ${item.estado?.value === 'resuelto' ? 'resolved' : item.estado?.value === 'pendiente' ? 'pending' : 'fatal'}"></span>
                    <div class="recent-info" style="flex:1;">
                      <div class="recent-title" style="font-weight:700; color:var(--gray-900); font-size:13.5px; display:flex; align-items:center; gap:8px;">
                        <span>${escapeHtml(item.paciente)}</span>
                        ${isMostRecent ? `<span class="badge badge-info" style="font-size:10px; padding:2px 7px; font-weight:700;">🆕 Más Reciente</span>` : ''}
                        ${isFatal ? `<span class="badge badge-danger" style="font-size:10px; padding:2px 7px; font-weight:700; background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;"> Fatal</span>` : ''}
                      </div>
                      <div style="font-size:11.5px; color:#334155; font-weight:600; margin-top:3px; display:inline-block; background:#f1f5f9; padding:2px 8px; border-radius:5px; border:1px solid #cbd5e1;">
                        ${escapeHtml(item.causa || 'Paro Cardiorrespiratorio')}
                      </div>
                      <div class="recent-sub" style="font-size:11px; color:var(--gray-500); margin-top:4px;">
                        <span>${item.area} (${escapeHtml(item.cama || 'Cama Guardia')})</span> &middot; 
                        <span>Llamó: <strong>${escapeHtml(item.quienHizoLlamada ? item.quienHizoLlamada.split('(')[0].trim() : 'Guardia')}</strong></span> &middot; 
                        <span>Equipo: <strong>${escapeHtml(item.equipoEncargado || 'Equipo A')}</strong></span>
                      </div>
                    </div>
                    <div style="text-align:right;">
                      <span class="badge ${item.estado?.badge}" style="font-size:10.5px; margin-bottom:4px; display:inline-block; font-weight:600;">
                        ${item.estado?.label}
                      </span>
                      <div class="recent-time" style="font-size:11px; color:var(--gray-400);">${getRelativeTime(item.fecha)}</div>
                    </div>
                  </li>
                `;
              }).join('')}
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
