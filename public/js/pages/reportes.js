function renderReportes() {
  const data = getData();
  const now = new Date();
  const thisMonth = data.filter(d => {
    const f = new Date(d.fecha);
    return f.getMonth() === now.getMonth() && f.getFullYear() === now.getFullYear();
  });

  const areaStats = {};
  AREAS.forEach(a => { areaStats[a] = { total: 0, exitosos: 0 }; });
  data.forEach(d => {
    if (areaStats[d.area]) {
      areaStats[d.area].total++;
      if (d.estado && d.estado.value === 'resuelto') areaStats[d.area].exitosos++;
    }
  });

  const sortedAreas = Object.entries(areaStats)
    .filter(([_, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  const maxArea = sortedAreas.length > 0 ? sortedAreas[0][1].total : 1;

  // Mapa de colores institucional fijo para equipos de respuesta
  const TEAM_COLORS = {
    'Equipo A': '#0284c7', // Celeste
    'Equipo B': '#8b5cf6', // Violeta/Púrpura
    'Equipo C': '#14b8a6'  // Turquesa/Teal
  };

  // Estadísticas de Equipos (orden alfabético consistente)
  const equipoStats = {};
  getEquiposList().forEach(eq => { equipoStats[eq] = { total: 0, exitosos: 0 }; });
  data.forEach(d => {
    const eq = d.equipoEncargado || 'Equipo A';
    if (!equipoStats[eq]) equipoStats[eq] = { total: 0, exitosos: 0 };
    equipoStats[eq].total++;
    if (d.estado && d.estado.value === 'resuelto') equipoStats[eq].exitosos++;
  });

  // Orden consistente alfabético (Equipo A, Equipo B, Equipo C) para emparejar con el Donut
  const sortedEquipos = Object.entries(equipoStats)
    .sort((a, b) => a[0].localeCompare(b[0]));

  // Donut data de equipos ordenados de la misma manera
  const donutEquiposData = sortedEquipos.map(([name, stats]) => ({
    label: name,
    value: stats.total,
    color: TEAM_COLORS[name] || '#0284c7'
  }));

  // Estadísticas de Materiales más consumidos
  const materialStats = {};
  data.forEach(d => {
    (d.materiales || []).forEach(m => {
      if (!materialStats[m.nombre]) {
        materialStats[m.nombre] = { total: 0, unidad: m.unidad || 'Unidades' };
      }
      materialStats[m.nombre].total += parseInt(m.cantidad) || 1;
    });
  });

  const sortedMateriales = Object.entries(materialStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 6);

  // Estadísticas de Causas más frecuentes
  const causasStats = {};
  data.forEach(d => {
    const c = d.causa || 'Paro Cardiorrespiratorio';
    causasStats[c] = (causasStats[c] || 0) + 1;
  });
  const sortedCausas = Object.entries(causasStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const avgTimeVal = data.length > 0 ? (data.reduce((s, d) => s + (parseFloat(d.tiempoRespuesta) || 0), 0) / data.length) : 0;
  const avgTimeFormatted = avgTimeVal.toFixed(1);

  let timeIconColor = 'green';
  if (avgTimeVal >= 4.6) {
    timeIconColor = 'red';
  } else if (avgTimeVal >= 2.1) {
    timeIconColor = 'yellow';
  } else {
    timeIconColor = 'green';
  }

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Reportes y Estadísticas Clínicas</h1>
        <p>Análisis integral de desempeño, equipos de respuesta, materiales e intervenciones</p>
      </div>
      <!-- Botón Único Unificado de Exportación con Dropdown -->
      <div id="export-dropdown-container" style="position:relative; display:inline-block; z-index:9999;">
        <button class="btn btn-outline btn-sm" onclick="toggleExportDropdown()" style="padding:7px 14px; height:36px; box-sizing:border-box; font-size:12.5px; font-weight:700; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; gap:6px; background:#ffffff; border:1.5px solid var(--celeste-dark); color:var(--celeste-dark); cursor:pointer;" title="Exportar reportes en diferentes formatos">
          ${icon('download', 14)} Exportar Datos <span style="font-size:10px; margin-left:2px;">▼</span>
        </button>
        <div id="export-dropdown-menu" style="display:none; position:absolute; right:0; top:110%; background:#fff; border:1px solid var(--gray-300); border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.2); z-index:99999; min-width:210px; padding:6px 0;">
          <button onclick="exportExcel(getData()); toggleExportDropdown();" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-800); display:flex; align-items:center; gap:10px;">
            ${icon('fileSpreadsheet', 16)} 
            <div>
              <div>Excel (.xlsx)</div>
              <div style="font-size:10.5px; color:var(--gray-400); font-weight:normal;">Planilla tabular completa</div>
            </div>
          </button>
          <button onclick="exportCSV(getData()); toggleExportDropdown();" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-800); display:flex; align-items:center; gap:10px;">
            ${icon('barChart', 16)} 
            <div>
              <div>CSV (Texto Plano)</div>
              <div style="font-size:10.5px; color:var(--gray-400); font-weight:normal;">Ideal para análisis estadístico</div>
            </div>
          </button>
          <button onclick="exportPDF(getData()); toggleExportDropdown();" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-800); display:flex; align-items:center; gap:10px;">
            ${icon('fileText', 16)} 
            <div>
              <div>PDF (Informe Legal)</div>
              <div style="font-size:10.5px; color:var(--gray-400); font-weight:normal;">Documento oficial listo para imprimir</div>
            </div>
          </button>
        </div>
      </div>
    </div>
    <div class="page-body">
      <div class="kpi-grid stagger">
        <div class="kpi-card fade-in">
          <div class="kpi-icon blue">${icon('barChart')}</div>
          <div class="kpi-value">${data.length}</div>
          <div class="kpi-label">Total eventos registrados</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon" style="background:#f1f5f9; color:#334155;">${icon('clipboard')}</div>
          <div class="kpi-value">${thisMonth.length}</div>
          <div class="kpi-label">Eventos este mes</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon green">${icon('check')}</div>
          <div class="kpi-value">${data.length > 0 ? Math.round(data.filter(d => d.estado && d.estado.value === 'resuelto').length / data.length * 100) : 0}%</div>
          <div class="kpi-label">Tasa éxito global (ROSC)</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon ${timeIconColor}">${icon('clock')}</div>
          <div class="kpi-value">${avgTimeFormatted}m</div>
          <div class="kpi-label">Tiempo prom. global</div>
        </div>
      </div>

      <!-- Fila de Gráficos de Torta / Donut -->
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <h2>Distribución de Resultados Clínicos</h2>
          </div>
          <div class="card-body">
            ${renderPieChart([
              { label: 'Resuelto (ROSC)', value: data.filter(d => d.estado && d.estado.value === 'resuelto').length, color: '#10b981' },
              { label: 'En Curso', value: data.filter(d => d.estado && d.estado.value === 'pendiente').length, color: '#f59e0b' },
              { label: 'Fallecido', value: data.filter(d => d.estado && d.estado.value === 'fatal').length, color: '#ef4444' },
              { label: 'Derivado', value: data.filter(d => d.estado && d.estado.value === 'derivado').length, color: '#3b82f6' }
            ], { size: 160, centerLabel: 'Códigos' })}
          </div>
        </div>

        <div class="card scale-in">
          <div class="card-header">
            <h2>Participación por Equipo de Respuesta</h2>
          </div>
          <div class="card-body">
            ${renderPieChart(donutEquiposData, { size: 160, centerLabel: 'Equipos' })}
          </div>
        </div>
      </div>

      <!-- Fila 1: Áreas + Equipos -->
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        <div class="card scale-in">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px; color:var(--celeste-dark);">${icon('building')}</span>
              <h2>Códigos Azules por Área Hospitalaria</h2>
            </div>
            <span style="font-size:11px; color:var(--gray-500);">Barra = Volumen de casos</span>
          </div>
          <div class="card-body">
            ${sortedAreas.map(([area, stats]) => {
              const roscPct = stats.total > 0 ? Math.round((stats.exitosos / stats.total) * 100) : 0;
              const isSmallSample = stats.total < 3;
              const casosText = `${stats.total} ${stats.total === 1 ? 'caso' : 'casos'}`;
              
              let roscBadge = '';
              if (isSmallSample) {
                roscBadge = `<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:600; font-size:11px;" title="Muestra reducida (n<3)">${roscPct}% ROSC (${stats.total === 1 ? '1 caso' : stats.total + ' casos'})</span>`;
              } else if (roscPct >= 80) {
                roscBadge = `<span class="badge badge-success" style="font-weight:700;">${roscPct}% ROSC</span>`;
              } else if (roscPct >= 60) {
                roscBadge = `<span class="badge badge-warning" style="font-weight:700;">${roscPct}% ROSC</span>`;
              } else {
                roscBadge = `<span class="badge badge-danger" style="font-weight:700; background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;">${roscPct}% ROSC</span>`;
              }

              return `
                <div style="margin-bottom:16px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <span style="font-size:13px; font-weight:700; color:var(--gray-800);">${escapeHtml(area)}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                      <span style="font-size:12px; color:var(--gray-500); font-weight:500;">Volumen: <strong>${casosText}</strong></span>
                      ${roscBadge}
                    </div>
                  </div>
                  <div style="height:8px; background:var(--gray-100); border-radius:var(--radius-full); overflow:hidden;" title="Volumen de intervenciones: ${stats.total}">
                    <div style="height:100%; width:${(stats.total / maxArea) * 100}%; background:var(--celeste); border-radius:var(--radius-full);"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="card scale-in">
          <div class="card-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px; color:var(--celeste-dark);">${icon('truck')}</span>
              <h2>Rendimiento por Equipo de Respuesta</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Equipo de Código Azul</th>
                    <th style="text-align:center;">Intervenciones</th>
                    <th>Efectividad ROSC</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedEquipos.map(([name, stats]) => {
                    const roscPct = stats.total > 0 ? Math.round((stats.exitosos / stats.total) * 100) : 0;
                    const isSmallSample = stats.total < 3;
                    const casosText = `${stats.total} ${stats.total === 1 ? 'caso' : 'casos'}`;
                    const teamColor = TEAM_COLORS[name] || 'var(--celeste)';

                    let roscBadge = '';
                    if (isSmallSample) {
                      roscBadge = `<span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:600; font-size:11px;" title="Muestra reducida (n<3): evaluar con cautela en desempeño">${roscPct}% ROSC <small style="color:var(--gray-500); font-weight:400;">(Muestra reducida: n=${stats.total})</small></span>`;
                    } else if (roscPct >= 80) {
                      roscBadge = `<span class="badge badge-success" style="font-weight:700; background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0;"> (${roscPct}% ROSC)</span>`;
                    } else if (roscPct >= 60) {
                      roscBadge = `<span class="badge badge-warning" style="font-weight:700; background:#fef3c7; color:#92400e; border:1px solid #fde68a;"> (${roscPct}% ROSC)</span>`;
                    } else {
                      roscBadge = `<span class="badge badge-danger" style="font-weight:700; background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;"> (${roscPct}% ROSC)</span>`;
                    }

                    return `
                      <tr>
                        <td style="font-weight:700; color:var(--gray-900); font-size:13px;">
                          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${teamColor}; margin-right:8px;"></span>
                          ${escapeHtml(name)}
                        </td>
                        <td style="text-align:center; font-weight:700; color:var(--gray-700);">${casosText}</td>
                        <td>${roscBadge}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Fila 2: Insumos Consumidos + Causas Frecuentes -->
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px; color:var(--celeste-dark);">${icon('pill')}</span>
              <h2>Materiales e Insumos Más Utilizados</h2>
            </div>
          </div>
          <div class="card-body">
            <table style="width:100%; border-collapse:collapse; font-size:13px;">
              <thead>
                <tr style="border-bottom: 2px solid var(--gray-200); text-align:left; color:var(--gray-500); font-size:12px;">
                  <th style="padding:8px 4px;">Material</th>
                  <th style="padding:8px 4px; text-align:right;">Cantidad Total</th>
                </tr>
              </thead>
              <tbody>
                ${sortedMateriales.map(([nombre, item]) => `
                  <tr style="border-bottom: 1px solid var(--gray-100);">
                    <td style="padding:10px 4px; font-weight:600; color:var(--gray-800);">
                      ${escapeHtml(nombre)}
                    </td>
                    <td style="padding:10px 4px; text-align:right;">
                      <span class="badge" style="background:var(--celeste-light); color:var(--celeste-dark); font-weight:700; flex-shrink:0;">
                        ${item.total} ${item.unidad}
                      </span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card scale-in">
          <div class="card-header">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:20px; color:var(--celeste-dark);">${icon('clipboard')}</span>
              <h2>Principales Causas de Intervención</h2>
            </div>
          </div>
          <div class="card-body">
            <ul style="list-style:none; padding:0; margin:0;">
              ${sortedCausas.map(([causa, count]) => `
                <li style="display:flex; justify-content:space-between; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid var(--gray-100);">
                  <span style="font-size:13px; font-weight:600; color:var(--gray-800); min-width:0; flex:1;">${escapeHtml(causa)}</span>
                  <span class="badge badge-warning" style="font-weight:700; white-space:nowrap; flex-shrink:0; padding:4px 10px;">${count} ${count === 1 ? 'caso' : 'casos'}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setupReportes() {
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

window.setupReportes = setupReportes;
