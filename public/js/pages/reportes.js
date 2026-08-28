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

  // Estadísticas de Equipos
  const equipoStats = {};
  getEquiposList().forEach(eq => { equipoStats[eq] = { total: 0, exitosos: 0 }; });
  data.forEach(d => {
    const eq = d.equipoEncargado || 'Equipo A';
    if (!equipoStats[eq]) equipoStats[eq] = { total: 0, exitosos: 0 };
    equipoStats[eq].total++;
    if (d.estado && d.estado.value === 'resuelto') equipoStats[eq].exitosos++;
  });

  const sortedEquipos = Object.entries(equipoStats)
    .sort((a, b) => b[1].total - a[1].total);

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

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Reportes y Estadísticas Clínicas</h1>
        <p>Análisis integral de desempeño, equipos de respuesta, materiales e intervenciones</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="exportExcel(getData())" title="Descargar como Planilla Excel">
          ${icon('fileSpreadsheet')} Excel
        </button>
        <button class="btn btn-outline btn-sm" onclick="exportCSV(getData())" title="Exportar y Previsualizar CSV">
          ${icon('barChart')} CSV
        </button>
        <button class="btn btn-outline btn-sm" onclick="exportPDF(getData())" title="Exportar Documento PDF">
          ${icon('fileText')} PDF
        </button>
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
          <div class="kpi-icon green">${icon('check')}</div>
          <div class="kpi-value">${thisMonth.length}</div>
          <div class="kpi-label">Eventos este mes</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon yellow">${icon('target')}</div>
          <div class="kpi-value">${data.length > 0 ? Math.round(data.filter(d => d.estado && d.estado.value === 'resuelto').length / data.length * 100) : 0}%</div>
          <div class="kpi-label">Tasa éxito global (ROSC)</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon red">${icon('clock')}</div>
          <div class="kpi-value">${data.length > 0 ? (data.reduce((s, d) => s + (parseFloat(d.tiempoRespuesta) || 0), 0) / data.length).toFixed(1) : 0}m</div>
          <div class="kpi-label">Tiempo prom. global</div>
        </div>
      </div>

      <!-- Fila de Gráficos de Torta / Donut -->
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <h2> Distribución de Resultados Clínicos</h2>
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
            <h2> Participación por Equipo de Respuesta</h2>
          </div>
          <div class="card-body">
            ${renderPieChart([
    { label: 'Equipo A', value: data.filter(d => (d.equipoEncargado || '').includes('Equipo A')).length, color: '#3b8fcc' },
    { label: 'Equipo B', value: data.filter(d => (d.equipoEncargado || '').includes('Equipo B')).length, color: '#6366f1' },
    { label: 'Equipo C', value: data.filter(d => (d.equipoEncargado || '').includes('Equipo C')).length, color: '#06b6d4' }
  ], { size: 160, centerLabel: 'Equipos' })}
          </div>
        </div>
      </div>

      <!-- Fila 1: Áreas + Equipos -->
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <h2>${icon('alertTriangle')} Códigos Azules por Área Hospitalaria</h2>
          </div>
          <div class="card-body">
            ${sortedAreas.map(([area, stats]) => `
              <div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-size:13px;font-weight:600;color:var(--gray-700);">${area}</span>
                  <span style="font-size:12px;color:var(--gray-500);">${stats.total} total &middot; <strong style="color:var(--success);">${stats.total > 0 ? Math.round(stats.exitosos / stats.total * 100) : 0}% ROSC</strong></span>
                </div>
                <div style="height:8px;background:var(--gray-100);border-radius:var(--radius-full);overflow:hidden;">
                  <div style="height:100%;width:${(stats.total / maxArea) * 100}%;background:var(--celeste);border-radius:var(--radius-full);"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card scale-in">
          <div class="card-header">
            <h2>${icon('truck')} Rendimiento por Equipo de Respuesta</h2>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Equipo de Código Azul</th>
                    <th>Intervenciones</th>
                    <th>Efectividad</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedEquipos.map(([name, stats]) => `
                    <tr>
                      <td style="font-weight:600;color:var(--gray-800); font-size:13px;">${escapeHtml(name)}</td>
                      <td style="text-align:center; font-weight:700;">${stats.total}</td>
                      <td>
                        <span class="badge badge-success">
                          ${stats.total > 0 ? Math.round(stats.exitosos / stats.total * 100) : 100}% ROSC
                        </span>
                      </td>
                    </tr>
                  `).join('')}
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
            <h2>${icon('pill')} Medicamentos e Insumos Más Utilizados</h2>
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
                      <span class="badge" style="background:var(--celeste-light); color:var(--celeste-dark); font-weight:700;">
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
            <h2>${icon('clipboard')} Principales Causas de Intervención</h2>
          </div>
          <div class="card-body">
            <ul style="list-style:none; padding:0;">
              ${sortedCausas.map(([causa, count]) => `
                <li style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid var(--gray-100);">
                  <span style="font-size:13px; font-weight:600; color:var(--gray-800);">${escapeHtml(causa)}</span>
                  <span class="badge badge-warning" style="font-weight:700;">${count} casos</span>
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
