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
      if (d.estado.value === 'resuelto') areaStats[d.area].exitosos++;
    }
  });

  const sortedAreas = Object.entries(areaStats)
    .filter(([_, v]) => v.total > 0)
    .sort((a, b) => b[1].total - a[1].total);

  const maxArea = sortedAreas.length > 0 ? sortedAreas[0][1].total : 1;

  const responsableStats = {};
  data.forEach(d => {
    if (!responsableStats[d.responsable]) {
      responsableStats[d.responsable] = { total: 0, exitosos: 0, tiempoTotal: 0 };
    }
    responsableStats[d.responsable].total++;
    if (d.estado.value === 'resuelto') responsableStats[d.responsable].exitosos++;
    responsableStats[d.responsable].tiempoTotal += d.tiempoRespuesta;
  });

  const sortedResp = Object.entries(responsableStats)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Reportes</h1>
        <p>Estadisticas y analisis de codigos azules</p>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-outline btn-sm" onclick="exportCSV(getData())">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar CSV
        </button>
        <button class="btn btn-outline btn-sm" onclick="exportPDF(getData())">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Exportar PDF
        </button>
      </div>
    </div>
    <div class="page-body">
      <div class="kpi-grid stagger">
        <div class="kpi-card fade-in">
          <div class="kpi-icon blue">${icon('barChart')}</div>
          <div class="kpi-value">${data.length}</div>
          <div class="kpi-label">Total historial</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon green">${icon('check')}</div>
          <div class="kpi-value">${thisMonth.length}</div>
          <div class="kpi-label">Este mes</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon yellow">${icon('target')}</div>
          <div class="kpi-value">${data.length > 0 ? Math.round(data.filter(d => d.estado.value === 'resuelto').length / data.length * 100) : 0}%</div>
          <div class="kpi-label">Tasa exito global</div>
        </div>
        <div class="kpi-card fade-in">
          <div class="kpi-icon red">${icon('clock')}</div>
          <div class="kpi-value">${data.length > 0 ? (data.reduce((s, d) => s + d.tiempoRespuesta, 0) / data.length).toFixed(1) : 0}m</div>
          <div class="kpi-label">Tiempo prom. global</div>
        </div>
      </div>

      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <h2>Codigos por area</h2>
          </div>
          <div class="card-body">
            ${sortedAreas.map(([area, stats]) => `
              <div style="margin-bottom:16px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                  <span style="font-size:13px;font-weight:600;color:var(--gray-700);">${area}</span>
                  <span style="font-size:12px;color:var(--gray-400);">${stats.total} total &middot; ${stats.total > 0 ? Math.round(stats.exitosos / stats.total * 100) : 0}% exito</span>
                </div>
                <div style="height:8px;background:var(--gray-100);border-radius:var(--radius-full);overflow:hidden;">
                  <div style="height:100%;width:${(stats.total / maxArea) * 100}%;background:var(--celeste);border-radius:var(--radius-full);transition:width 0.5s ease;"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="card scale-in">
          <div class="card-header">
            <h2>Responsables con mas llamadas</h2>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Responsable</th>
                    <th>Total</th>
                    <th>Exito</th>
                    <th>Prom. Respuesta</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedResp.map(([name, stats]) => `
                    <tr>
                      <td style="font-weight:600;color:var(--gray-700);">${escapeHtml(name)}</td>
                      <td>${stats.total}</td>
                      <td>
                        <span class="badge badge-success">
                          ${stats.total > 0 ? Math.round(stats.exitosos / stats.total * 100) : 0}%
                        </span>
                      </td>
                      <td>${(stats.tiempoTotal / stats.total).toFixed(1)} min</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
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
