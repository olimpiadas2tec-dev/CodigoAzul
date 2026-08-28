let historialState = {
  page: 1,
  perPage: 10,
  search: '',
  area: '',
  estado: '',
  dateFrom: '',
  dateTo: ''
};

function getFilteredData() {
  let data = getData();

  if (historialState.search) {
    const s = historialState.search.toLowerCase();
    data = data.filter(d =>
      d.paciente.toLowerCase().includes(s) ||
      d.responsable.toLowerCase().includes(s) ||
      d.area.toLowerCase().includes(s)
    );
  }

  if (historialState.area) {
    data = data.filter(d => d.area === historialState.area);
  }

  if (historialState.estado) {
    data = data.filter(d => d.estado.value === historialState.estado);
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

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Historial</h1>
        <p>Registro detallado de todos los codigos azules</p>
      </div>
      <div style="display:flex;gap:10px;">
        <button class="btn btn-outline btn-sm" onclick="exportCSV(getFilteredData())">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>
        <button class="btn btn-outline btn-sm" onclick="exportPDF(getFilteredData())">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF
        </button>
        <a href="#/nuevo" class="btn btn-primary btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo
        </a>
      </div>
    </div>
    <div class="page-body">
      <div class="card scale-in">
        <div class="card-body" style="padding-bottom:0;">
          <div class="filters-bar">
            <div class="filter-group">
              <input type="text" id="filter-search" placeholder="Buscar paciente, responsable..." value="${escapeHtml(historialState.search)}" />
            </div>
            <div class="filter-group">
              <select id="filter-area">
                <option value="">Todas las areas</option>
                ${AREAS.map(a => `<option value="${a}" ${historialState.area === a ? 'selected' : ''}>${a}</option>`).join('')}
              </select>
            </div>
            <div class="filter-group">
              <select id="filter-estado">
                <option value="">Todos los estados</option>
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
                <th>Paciente</th>
                <th>Fecha</th>
                <th>Area</th>
                <th>Estado</th>
                <th>Responsable</th>
                <th>Respuesta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${pageData.length === 0 ? `
                <tr>
                  <td colspan="8">
                    <div class="empty-state">
                      <h3>No se encontraron registros</h3>
                      <p>Intente ajustar los filtros de busqueda</p>
                    </div>
                  </td>
                </tr>
              ` : pageData.map(d => `
                <tr>
                  <td style="font-weight:600;color:var(--gray-400);">${d.id}</td>
                  <td style="font-weight:600;color:var(--gray-700);">${escapeHtml(d.paciente)}</td>
                  <td>${formatDateTime(d.fecha)}</td>
                  <td>${d.area}</td>
                  <td>
                    <span class="badge ${d.estado.badge}">
                      <span class="badge-dot"></span>
                      ${d.estado.label}
                    </span>
                  </td>
                  <td>${escapeHtml(d.responsable)}</td>
                  <td>${d.tiempoRespuesta} min</td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <a href="#/detalle/${d.id}" class="action-link">Ver</a>
                      <a href="#/editar/${d.id}" class="action-link">Editar</a>
                      <button class="action-link danger" onclick="confirmDelete(${d.id})">Eliminar</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${filtered.length > 0 ? `
          <div style="padding:0 24px;">
            <div class="pagination">
              <span class="pagination-info">
                Mostrando ${start + 1}-${Math.min(start + historialState.perPage, filtered.length)} de ${filtered.length} registros
              </span>
              <div class="pagination-buttons">
                <button onclick="goToPage(${page - 1})" ${page <= 1 ? 'disabled' : ''}>&laquo;</button>
                ${Array.from({length: totalPages}, (_, i) => `
                  <button class="${i + 1 === page ? 'active' : ''}" onclick="goToPage(${i + 1})">${i + 1}</button>
                `).join('')}
                <button onclick="goToPage(${page + 1})" ${page >= totalPages ? 'disabled' : ''}>&raquo;</button>
              </div>
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
  const estado = document.getElementById('filter-estado');
  const dateFrom = document.getElementById('filter-from');
  const dateTo = document.getElementById('filter-to');

  if (search) {
    let timeout;
    search.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        historialState.search = e.target.value;
        historialState.page = 1;
        renderApp();
      }, 300);
    });
  }

  [area, estado, dateFrom, dateTo].forEach(el => {
    if (el) {
      el.addEventListener('change', () => {
        historialState.area = area.value;
        historialState.estado = estado.value;
        historialState.dateFrom = dateFrom.value;
        historialState.dateTo = dateTo.value;
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
  historialState = { page: 1, perPage: 10, search: '', area: '', estado: '', dateFrom: '', dateTo: '' };
  renderApp();
}

function confirmDelete(id) {
  const codigo = getCodigoById(id);
  if (!codigo) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2>Eliminar registro</h2>
        <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body">
        <p style="color:var(--gray-500);font-size:14px;">
          Esta seguro que desea eliminar el registro de <strong>${escapeHtml(codigo.paciente)}</strong>?
          Esta accion no se puede deshacer.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-danger btn-sm" onclick="doDelete(${id})">Eliminar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function doDelete(id) {
  deleteCodigo(id);
  document.querySelector('.modal-overlay')?.remove();
  showToast('Registro eliminado correctamente');
  renderApp();
}
