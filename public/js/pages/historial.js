let historialState = {
  page: 1,
  perPage: 10,
  search: '',
  area: '',
  estado: '',
  equipo: '',
  dateFrom: '',
  dateTo: ''
};

function getFilteredData() {
  let data = getData();

  if (historialState.search) {
    const s = normalizeText(historialState.search);
    data = data.filter(d =>
      normalizeText(d.paciente).includes(s) ||
      (d.causa && normalizeText(d.causa).includes(s)) ||
      (d.dni && normalizeText(d.dni).includes(s)) ||
      (d.quienHizoLlamada && normalizeText(d.quienHizoLlamada).includes(s)) ||
      (d.equipoEncargado && normalizeText(d.equipoEncargado).includes(s)) ||
      (d.responsable && normalizeText(d.responsable).includes(s)) ||
      (d.area && normalizeText(d.area).includes(s))
    );
  }

  if (historialState.area) {
    data = data.filter(d => d.area === historialState.area);
  }

  if (historialState.estado) {
    data = data.filter(d => d.estado.value === historialState.estado);
  }

  if (historialState.equipo) {
    const target = historialState.equipo.toLowerCase().trim();
    data = data.filter(d => {
      const eq = (d.equipoEncargado || 'Equipo A').toLowerCase().trim();
      return eq === target || eq.includes(target) || target.includes(eq);
    });
  }

  if (historialState.dateFrom) {
    data = data.filter(d => new Date(d.fecha) >= new Date(historialState.dateFrom));
  }

  if (historialState.dateTo) {
    const to = new Date(historialState.dateTo);
    to.setHours(23, 59, 59);
    data = data.filter(d => new Date(d.fecha) <= to);
  }

  return data;
}

function toggleExportDropdown() {
  const menu = document.getElementById('export-dropdown-menu');
  if (menu) {
    menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
  }
}

document.addEventListener('click', (e) => {
  const container = document.getElementById('export-dropdown-container');
  const menu = document.getElementById('export-dropdown-menu');
  if (container && menu && !container.contains(e.target)) {
    menu.style.display = 'none';
  }
});

function renderHistorial() {
  const filtered = getFilteredData();
  const totalPages = Math.ceil(filtered.length / historialState.perPage);
  const page = Math.min(historialState.page, totalPages || 1);
  const start = (page - 1) * historialState.perPage;
  const pageData = filtered.slice(start, start + historialState.perPage);

  // Métricas dinámicas calculadas sobre el subconjunto filtrado (KPIs Contextuales)
  const totalEventos = filtered.length;
  const tiempoPromedio = totalEventos > 0
    ? (filtered.reduce((acc, curr) => acc + (parseFloat(curr.tiempoRespuesta) || 0), 0) / totalEventos).toFixed(1)
    : '0.0';
  const exitososCount = filtered.filter(d => d.estado.value === 'resuelto').length;
  const tasaExito = totalEventos > 0 ? ((exitososCount / totalEventos) * 100).toFixed(1) : '0.0';

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Historial de Códigos Azules</h1>
        <p>Registro oficial de eventos clínicos, causas, equipos intervinientes y resultados</p>
      </div>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        
        <!-- Botón Único Unificado de Exportación con Dropdown -->
        <div id="export-dropdown-container" style="position:relative; display:inline-block;">
          <button class="btn btn-outline btn-sm" onclick="toggleExportDropdown()" style="font-weight:700; gap:6px; background:#fff; border-color:var(--gray-300);" title="Exportar registros en diferentes formatos">
            ${icon('download')} Exportar Datos <span style="font-size:10px; margin-left:2px;">▼</span>
          </button>
          <div id="export-dropdown-menu" style="display:none; position:absolute; right:0; top:110%; background:#fff; border:1px solid var(--gray-300); border-radius:8px; box-shadow:0 10px 25px rgba(0,0,0,0.1); z-index:100; min-width:210px; padding:6px 0;">
            <button onclick="exportExcel(getFilteredData()); toggleExportDropdown();" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-800); display:flex; align-items:center; gap:10px;">
              ${icon('fileSpreadsheet', 16)} 
              <div>
                <div>Excel (.xlsx)</div>
                <div style="font-size:10.5px; color:var(--gray-400); font-weight:normal;">Planilla tabular completa</div>
              </div>
            </button>
            <button onclick="exportCSV(getFilteredData()); toggleExportDropdown();" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-800); display:flex; align-items:center; gap:10px;">
              ${icon('barChart', 16)} 
              <div>
                <div>CSV (Texto Plano)</div>
                <div style="font-size:10.5px; color:var(--gray-400); font-weight:normal;">Ideal para análisis estadístico</div>
              </div>
            </button>
            <button onclick="exportPDF(getFilteredData()); toggleExportDropdown();" style="width:100%; text-align:left; padding:9px 14px; background:none; border:none; cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-800); display:flex; align-items:center; gap:10px;">
              ${icon('fileText', 16)} 
              <div>
                <div>PDF (Informe Legal)</div>
                <div style="font-size:10.5px; color:var(--gray-400); font-weight:normal;">Documento oficial listo para imprimir</div>
              </div>
            </button>
          </div>
             ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
          <a href="#/nuevo" class="btn btn-primary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar Código
          </a>
        `}
      </div>
    </div>

    <div class="page-body">
      <!-- Barra de KPIs Dinámicos con Filtros -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:16px;">
        <div style="background:var(--white); padding:12px 16px; border-radius:var(--radius); border:1px solid var(--gray-200); box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">${icon('barChart')}</span>
          <div>
            <span style="font-size:11px; color:var(--gray-500); text-transform:uppercase; font-weight:700;">Eventos Filtrados</span>
            <div style="font-size:18px; font-weight:800; color:var(--gray-900);">${totalEventos}</div>
          </div>
        </div>
        <div style="background:var(--white); padding:12px 16px; border-radius:var(--radius); border:1px solid var(--gray-200); box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">${icon('clock')}</span>
          <div>
            <span style="font-size:11px; color:var(--gray-500); text-transform:uppercase; font-weight:700;">Tiempo Promedio</span>
            <div style="font-size:18px; font-weight:800; color:var(--celeste-dark);">${tiempoPromedio} min</div>
          </div>
        </div>
        <div style="background:var(--white); padding:12px 16px; border-radius:var(--radius); border:1px solid var(--gray-200); box-shadow:var(--shadow-sm); display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">${icon('target')}</span>
          <div>
            <span style="font-size:11px; color:var(--gray-500); text-transform:uppercase; font-weight:700;">Tasa de Éxito (ROSC)</span>
            <div style="font-size:18px; font-weight:800; color:#059669;">${tasaExito}% (${exitososCount}/${totalEventos})</div>
          </div>
        </div>
      </div>

      <div class="card scale-in">
        <div class="card-body" style="padding-bottom:0;">
          <div class="filters-bar" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
            <div class="filter-group search-input-wrapper" style="flex:1;min-width:220px;">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="filter-search" placeholder="Filtrar en tiempo real por nombre, causa, DNI, equipo..." value="${escapeHtml(historialState.search)}" autofocus />
            </div>
            <div class="filter-group">
              <select id="filter-area">
                <option value="">Todas las áreas</option>
                ${AREAS.map(a => `<option value="${a}" ${historialState.area === a ? 'selected' : ''}>${a}</option>`).join('')}
              </select>
            </div>
            <div class="filter-group">
              <select id="filter-equipo">
                <option value="">Todos los equipos</option>
                ${getEquiposList().map(eq => `<option value="${eq}" ${historialState.equipo === eq ? 'selected' : ''}>${escapeHtml(eq)}</option>`).join('')}
              </select>
            </div>
            <div class="filter-group">
              <select id="filter-estado">
                <option value="">Todos los resultados</option>
                ${ESTADOS.map(e => `<option value="${e.value}" ${historialState.estado === e.value ? 'selected' : ''}>${e.label}</option>`).join('')}
              </select>
            </div>

            <!-- Selectores de Fecha con Labels Explícitos "Desde:" y "Hasta:" -->
            <div class="filter-group" style="display:flex; align-items:center; gap:6px;">
              <label for="filter-from" style="font-size:12px; font-weight:700; color:var(--gray-600);">Desde:</label>
              <input type="date" id="filter-from" value="${historialState.dateFrom}" style="padding:6px 10px; border-radius:6px; border:1.5px solid var(--gray-300); font-size:12.5px;" />
            </div>
            <div class="filter-group" style="display:flex; align-items:center; gap:6px;">
              <label for="filter-to" style="font-size:12px; font-weight:700; color:var(--gray-600);">Hasta:</label>
              <input type="date" id="filter-to" value="${historialState.dateTo}" style="padding:6px 10px; border-radius:6px; border:1.5px solid var(--gray-300); font-size:12.5px;" />
            </div>

            <button class="btn btn-secondary btn-sm" onclick="clearFilters()">Limpiar</button>
          </div>
        </div>

        <div class="table-container table-stagger" style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr>
                <th style="width:35px; text-align:center;">#</th>
                <th style="min-width:180px;">Paciente & Ubicación</th>
                <th style="min-width:160px;">Causa / Diagnóstico</th>
                <th style="min-width:150px;">Aviso Por</th>
                <th style="min-width:120px;">Equipo Encargado</th>
                <th style="min-width:90px; text-align:center;">Materiales</th>
                <th style="min-width:100px; text-align:center;">Resultado</th>
                <th style="min-width:70px; text-align:center;">Tiempo</th>
                <th style="width:90px; text-align:center;">Acciones</th>
              </tr>
            </thead>
            <tbody id="historial-tbody">
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="9">
                    <div class="empty-state" style="padding:30px; text-align:center;">
                      <span style="font-size:32px;">${icon('search')}</span>
                      <h3 style="margin:8px 0 4px 0;">No se encontraron registros</h3>
                      <p style="color:var(--gray-500); font-size:13px;">No hay eventos clínicos que coincidan con los criterios de búsqueda.</p>
                      <button class="btn btn-secondary btn-sm" style="margin-top:12px;" onclick="clearFilters()">Limpiar Filtros</button>
                    </div>
                  </td>
                </tr>
              ` : pageData.map(d => {
                const matCount = (d.materiales || []).reduce((acc, m) => acc + (m.cantidad || 1), 0);
                const matList = (d.materiales || []).map(m => `${m.nombre.split(' ')[0]} (x${m.cantidad})`).join(', ');
                const isFatal = d.estado.value === 'fatal';

                return `
                  <tr class="historial-row" onclick="window.location.hash='#/detalle/${d.id}'" title="Haga clic para ver el detalle clínico de ${escapeHtml(d.paciente)}" style="${isFatal ? 'background:#fff8f8; border-left:4px solid #ef4444;' : 'border-left:4px solid #10b981;'}">
                    <td style="vertical-align:middle; text-align:center; font-weight:600; color:var(--gray-400);">${d.id}</td>
                    <td style="vertical-align:middle;">
                      <div style="font-weight:700; color:var(--gray-900); font-size:13.5px;">
                        ${escapeHtml(d.paciente)}
                      </div>
                      <div style="font-size:11px; color:var(--gray-500); margin-top:2px;">
                        DNI: ${escapeHtml(d.dni ? formatDNI(d.dni) : 'S/D')} &middot; <span style="color:var(--gray-700); font-weight:600;">${escapeHtml(d.area)} [${escapeHtml(d.cama || 'Cama')}]</span>
                      </div>
                    </td>
                    <td style="vertical-align:middle;">
                      <span style="font-size:11.5px; font-weight:700; color:var(--gray-800); background:var(--gray-100); border:1px solid var(--gray-300); padding:3px 7px; border-radius:6px; display:inline-block; max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(d.causa || 'Paro Cardiorrespiratorio')}">
                        ${escapeHtml(d.causa || 'Paro Cardiorrespiratorio')}
                      </span>
                    </td>
                    <td style="vertical-align:middle;">
                      <div style="font-size:12px; font-weight:600; color:var(--gray-800); max-width:150px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(d.quienHizoLlamada || 'Guardia')}">${escapeHtml(d.quienHizoLlamada || 'Guardia')}</div>
                      <div style="font-size:10.5px; color:var(--gray-400);">${formatDate(d.fecha)}</div>
                    </td>
                    <td style="vertical-align:middle;">
                      <button class="btn btn-outline btn-xs" style="font-size:11px; font-weight:700; background:var(--gray-50); color:var(--gray-800); border:1px solid var(--gray-300); display:inline-flex; align-items:center; gap:4px; padding:3px 7px; cursor:pointer; border-radius:6px;" onclick="event.stopPropagation(); showEquipoIntegrantesModal('${escapeHtml(d.equipoEncargado || 'Equipo A')}', '${escapeHtml(d.turno || 'Guardia')}')" title="Ver integrantes del ${escapeHtml(d.equipoEncargado || 'Equipo A')}">
                        ${icon('users', 12)} ${escapeHtml(d.equipoEncargado || 'Equipo A')}
                      </button>
                      <div style="font-size:10px; color:var(--gray-400); margin-top:2px;">${escapeHtml(d.turno || 'Guardia')}</div>
                    </td>
                    <td style="vertical-align:middle; text-align:center;">
                      <span title="${escapeHtml(matList || 'Ninguno')}" style="font-size:11.5px; color:var(--gray-700); font-weight:600; display:inline-flex; align-items:center; gap:3px; cursor:help;">
                        ${icon('package', 13)} <strong>${matCount}</strong> ins.
                      </span>
                    </td>
                    <td style="vertical-align:middle; text-align:center;">
                      ${isFatal ? `
                        <span class="badge" style="background:#fef2f2; color:#991b1b; border:1px solid #fca5a5; font-weight:700; font-size:11px; padding:3px 7px;">
                          <span class="badge-dot" style="background:#dc2626;"></span>
                          Defunción
                        </span>
                      ` : `
                        <span class="badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-weight:700; font-size:11px; padding:3px 7px;">
                          <span class="badge-dot" style="background:#059669;"></span>
                          ROSC
                        </span>
                      `}
                    </td>
                    <td style="vertical-align:middle; text-align:center;">
                      <span style="font-size:12px; font-weight:700; color:${d.tiempoRespuesta <= 3.5 ? '#059669' : '#d97706'};">
                        ${d.tiempoRespuesta}m
                      </span>
                    </td>
                    <td style="vertical-align:middle; text-align:center;">
                      <div style="display:inline-flex; gap:6px; justify-content:center; align-items:center;">
                        <a href="#/detalle/${d.id}" onclick="event.stopPropagation();" class="btn btn-outline btn-xs" style="padding:6px 8px; color:var(--celeste-dark); border-color:var(--celeste-300); background:#f0f9ff; border-radius:6px; display:inline-flex; align-items:center;" title="Ver Detalle Clínico">
                          ${icon('eye', 14)}
                        </a>
                        ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
                          <a href="#/editar/${d.id}" onclick="event.stopPropagation();" class="btn btn-outline btn-xs" style="padding:6px 8px; color:var(--gray-700); border-color:var(--gray-300); background:#fff; border-radius:6px; display:inline-flex; align-items:center;" title="Editar Registro de Código Azul">
                            ${icon('edit', 14)}
                          </a>
                          <button class="btn btn-outline btn-xs" style="padding:6px 8px; color:#b91c1c; border-color:#fca5a5; background:#fef2f2; border-radius:6px; display:inline-flex; align-items:center; cursor:pointer;" onclick="event.stopPropagation(); confirmDeleteCodigo(${d.id});" title="Eliminar Registro de Auditoría">
                            ${icon('trash', 14)}
                          </button>
                        `}
                      </div>
                    </td>
                  </tr>
                `;</tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${totalPages > 1 ? `
          <div class="pagination" style="padding:14px 20px; border-top:1px solid var(--gray-200); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
            <span style="font-size:12.5px; color:var(--gray-500); font-weight:500;">
              Mostrando <strong style="color:var(--gray-800);">${start + 1}-${Math.min(start + historialState.perPage, filtered.length)}</strong> de <strong style="color:var(--gray-800);">${filtered.length}</strong> registros
            </span>
            <div class="pagination-pages" style="display:flex; gap:6px; align-items:center;">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="goToPage(${page - 1})" title="Página Anterior" style="width:34px; height:34px; border-radius:8px; border:1.5px solid ${page <= 1 ? '#e2e8f0' : '#cbd5e1'}; background:${page <= 1 ? '#f8fafc' : '#ffffff'}; color:${page <= 1 ? '#cbd5e1' : 'var(--gray-700)'}; font-size:14px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; cursor:${page <= 1 ? 'not-allowed' : 'pointer'}; transition:all 0.15s ease;">&larr;</button>
              ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                const isActive = p === page;
                return `
                  <button class="page-btn ${isActive ? 'active' : ''}" onclick="goToPage(${p})" style="width:34px; height:34px; border-radius:8px; border:1.5px solid ${isActive ? 'var(--celeste-dark)' : '#cbd5e1'}; background:${isActive ? 'var(--celeste-dark)' : '#ffffff'}; color:${isActive ? '#ffffff' : 'var(--gray-800)'}; font-size:13px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:${isActive ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none'}; transition:all 0.15s ease;">
                    ${p}
                  </button>
                `;
              }).join('')}
              <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="goToPage(${page + 1})" title="Página Siguiente" style="width:34px; height:34px; border-radius:8px; border:1.5px solid ${page >= totalPages ? '#e2e8f0' : '#cbd5e1'}; background:${page >= totalPages ? '#f8fafc' : '#ffffff'}; color:${page >= totalPages ? '#cbd5e1' : 'var(--gray-700)'}; font-size:14px; font-weight:700; display:inline-flex; align-items:center; justify-content:center; cursor:${page >= totalPages ? 'not-allowed' : 'pointer'}; transition:all 0.15s ease;">&rarr;</button>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function setupHistorial() {
  const search = document.getElementById('filter-search');
  const area = document.getElementById('filter-area');
  const equipo = document.getElementById('filter-equipo');
  const estado = document.getElementById('filter-estado');
  const dateFrom = document.getElementById('filter-from');
  const dateTo = document.getElementById('filter-to');

  // Filtro en tiempo real instantáneo en cada tipeo
  if (search) {
    search.addEventListener('input', (e) => {
      historialState.search = e.target.value;
      historialState.page = 1;
      
      const cursorPosition = e.target.selectionStart;
      renderApp();
      requestAnimationFrame(() => {
        const reSearch = document.getElementById('filter-search');
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    });
  }

  [area, equipo, estado, dateFrom, dateTo].forEach(el => {
    if (el) {
      el.addEventListener('change', () => {
        historialState.area = area ? area.value : '';
        historialState.equipo = equipo ? equipo.value : '';
        historialState.estado = estado ? estado.value : '';
        historialState.dateFrom = dateFrom ? dateFrom.value : '';
        historialState.dateTo = dateTo ? dateTo.value : '';
        historialState.page = 1;
        renderApp();
      });
    }
  });
}

function goToPage(page) {
  historialState.page = page;
  renderApp();
}

function clearFilters() {
  historialState = { page: 1, perPage: 10, search: '', area: '', equipo: '', estado: '', dateFrom: '', dateTo: '' };
  renderApp();
}

function confirmDeleteCodigo(id) {
  const codigo = getCodigoById(id);
  if (!codigo) return;

  showConfirmModal({
    title: 'Eliminar Registro de Código Azul',
    message: `¿Está seguro de eliminar el registro de <strong>"${escapeHtml(codigo.paciente)}"</strong> (Código #${codigo.id})?<br><br>Esta acción quedará asentada en el Libro de Auditoría Legal.`,
    onConfirm: () => {
      deleteCodigo(id);
      showToast('Registro de Código Azul eliminado', 'success');
      renderApp();
    }
  });
}

window.goToPage = goToPage;
window.clearFilters = clearFilters;
window.confirmDeleteCodigo = confirmDeleteCodigo;
window.toggleExportDropdown = toggleExportDropdown;
