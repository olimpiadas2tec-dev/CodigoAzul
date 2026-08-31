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

function renderHistorial() {
  const filtered = getFilteredData();
  const totalPages = Math.ceil(filtered.length / historialState.perPage);
  const page = Math.min(historialState.page, totalPages || 1);
  const start = (page - 1) * historialState.perPage;
  const pageData = filtered.slice(start, start + historialState.perPage);

  // Métricas dinámicas calculadas sobre el subconjunto filtrado
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
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-outline btn-sm" onclick="exportExcel(getFilteredData())" title="Descargar como Planilla Excel">
          ${icon('fileSpreadsheet')} Excel
        </button>
        <button class="btn btn-outline btn-sm" onclick="exportCSV(getFilteredData())" title="Exportar y Previsualizar CSV">
          ${icon('barChart')} CSV
        </button>
        <button class="btn btn-outline btn-sm" onclick="exportPDF(getFilteredData())" title="Exportar Documento PDF">
          ${icon('fileText')} PDF
        </button>
        <a href="#/nuevo" class="btn btn-primary btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + Registrar Código
        </a>
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
          <div class="filters-bar" style="display:flex;flex-wrap:wrap;gap:10px;">
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
            <div class="filter-group">
              <input type="date" id="filter-from" value="${historialState.dateFrom}" title="Desde" />
            </div>
            <div class="filter-group">
              <input type="date" id="filter-to" value="${historialState.dateTo}" title="Hasta" />
            </div>
            <button class="btn btn-secondary btn-sm" onclick="clearFilters()">Limpiar</button>
          </div>
        </div>

        <div class="table-container table-stagger">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Paciente & Ubicación</th>
                <th>Causa / Diagnóstico</th>
                <th>Aviso Por</th>
                <th>Equipo Encargado</th>
                <th>Materiales</th>
                <th>Resultado</th>
                <th>Tiempo</th>
                <th>Acciones</th>
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

                return `
                  <tr>
                    <td style="font-weight:600;color:var(--gray-400);">${d.id}</td>
                    <td>
                      <a href="#/detalle/${d.id}" style="text-decoration:none; color:inherit;">
                        <div style="font-weight:700; color:var(--gray-900);">${escapeHtml(d.paciente)}</div>
                        <div style="font-size:11px; color:var(--gray-500); margin-top:2px;">
                          DNI: ${escapeHtml(d.dni || 'S/D')} &middot; <strong style="color:var(--celeste-dark);">${escapeHtml(d.area)} [${escapeHtml(d.cama || 'Cama')}]</strong>
                        </div>
                      </a>
                    </td>
                    <td>
                      <span style="font-size:12px; font-weight:700; color:#0369a1; background:var(--celeste-50); padding:3px 8px; border-radius:6px; display:inline-block;">
                        ${escapeHtml(d.causa || 'Paro Cardiorrespiratorio')}
                      </span>
                    </td>
                    <td>
                      <div style="font-size:12px; font-weight:600; color:var(--gray-800);">${escapeHtml(d.quienHizoLlamada || 'Guardia')}</div>
                      <div style="font-size:10px; color:var(--gray-400);">${formatDate(d.fecha)}</div>
                    </td>
                    <td>
                      <div style="display:flex; align-items:center; gap:6px;">
                        <span class="badge" style="background:#f1f5f9; color:#334155; font-weight:700; font-size:11px;">
                          ${escapeHtml(d.equipoEncargado || 'Equipo A')}
                        </span>
                        <button style="background:none; border:none; cursor:pointer; font-size:12px; padding:2px;" onclick="showEquipoIntegrantesModal('${escapeHtml(d.equipoEncargado || 'Equipo A')}', '${escapeHtml(d.turno || 'Guardia')}')" title="Ver integrantes del equipo">
                          ${icon('users')}
                        </button>
                      </div>
                      <div style="font-size:10px; color:var(--gray-400); margin-top:2px;">${escapeHtml(d.turno || 'Guardia')}</div>
                    </td>
                    <td>
                      <span title="${escapeHtml(matList || 'Ninguno')}" style="font-size:12px; color:var(--gray-600); cursor:help;">
                        ${icon('pill')} <strong>${matCount}</strong> arts.
                      </span>
                    </td>
                    <td>
                      <span class="badge ${d.estado.badge}" style="font-weight:700;">
                        <span class="badge-dot"></span>
                        ${d.estado.label}
                      </span>
                    </td>
                    <td>
                      <span style="font-size:12px; font-weight:700; color:${d.tiempoRespuesta <= 3.5 ? 'var(--success)' : 'var(--warning)'};">
                        ${d.tiempoRespuesta}m
                      </span>
                    </td>
                    <td>
                      <div style="display:flex;gap:4px;">
                        <a href="#/detalle/${d.id}" class="btn btn-ghost btn-sm" title="Ver Detalle Clínico">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </a>
                        <a href="#/editar/${d.id}" class="btn btn-ghost btn-sm" title="Editar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </a>
                        <button class="btn btn-ghost btn-sm" style="color:var(--danger);" onclick="confirmDeleteCodigo(${d.id})" title="Eliminar Registro de Código Azul">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        ${totalPages > 1 ? `
          <div class="pagination" style="padding:14px 20px; border-top:1px solid var(--gray-200); display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:var(--gray-500);">
              Mostrando ${start + 1}-${Math.min(start + historialState.perPage, filtered.length)} de ${filtered.length}
            </span>
            <div class="pagination-pages" style="display:flex; gap:4px;">
              <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="goToPage(${page - 1})">&laquo;</button>
              ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                <button class="page-btn ${p === page ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>
              `).join('')}
              <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="goToPage(${page + 1})">&raquo;</button>
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
      
      // Re-render dinámico manteniendo el foco en el input
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

