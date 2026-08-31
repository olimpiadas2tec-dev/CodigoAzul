let areasTabState = {
  currentTab: 'areas', // 'areas' o 'camas'
  searchArea: '',
  filterAreaCamas: '',
  filterEstadoCamas: '',
  searchCama: ''
};

function renderAreas() {
  const tab = areasTabState.currentTab;

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Gestión de Áreas y Camas Hospitalarias</h1>
        <p>Infraestructura clínica, capacidad de internación y control de disponibilidad de camas</p>
      </div>
      <div style="display:flex; gap:8px;">
        ${tab === 'areas' ? `
          <button class="btn btn-primary btn-sm" onclick="openAreaModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Nueva Área
          </button>
        ` : `
          <button class="btn btn-primary btn-sm" onclick="openCamaModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Nueva Cama
          </button>
        `}
      </div>
    </div>

    <div class="page-body">
      <!-- Tabs Navigation -->
      <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid var(--gray-200); padding-bottom:8px;">
        <button class="btn ${tab === 'areas' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setAreasTab('areas')">
          ${icon('building')} Áreas del Hospital
        </button>
        <button class="btn ${tab === 'camas' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setAreasTab('camas')">
          ${icon('bed')} Mapa y Estado de Camas
        </button>
      </div>

      ${tab === 'areas' ? renderAreasTab() : renderCamasTab()}
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 1: ÁREAS HOSPITALARIAS
// -------------------------------------------------------------
function renderAreasTab() {
  const areasList = getAreas();
  const camasList = getCamas();

  let filtered = areasList;
  if (areasTabState.searchArea) {
    const s = normalizeText(areasTabState.searchArea);
    filtered = filtered.filter(a => 
      normalizeText(a.nombre).includes(s) || 
      (a.descripcion && normalizeText(a.descripcion).includes(s))
    );
  }

  // Métricas globales
  const totalCamasHospital = camasList.length;
  const totalLibres = camasList.filter(c => c.estado === 'Libre').length;
  const totalOcupadas = camasList.filter(c => c.estado === 'Ocupada').length;
  const pctOcupacionGlobal = totalCamasHospital > 0 ? Math.round((totalOcupadas / totalCamasHospital) * 100) : 0;

  return `
    <!-- Tarjetas KPI de Infraestructura -->
    <div class="kpi-grid stagger" style="margin-bottom:20px;">
      <div class="kpi-card fade-in">
        <div class="kpi-icon blue">${icon('building')}</div>
        <div class="kpi-value">${areasList.length}</div>
        <div class="kpi-label">Áreas Hospitalarias</div>
      </div>
      <div class="kpi-card fade-in">
        <div class="kpi-icon green">${icon('bed')}</div>
        <div class="kpi-value">${totalCamasHospital}</div>
        <div class="kpi-label">Total Camas Clínicas</div>
      </div>
      <div class="kpi-card fade-in">
        <div class="kpi-icon yellow">${icon('star')}</div>
        <div class="kpi-value">${totalLibres}</div>
        <div class="kpi-label">Camas Disponibles (Libres)</div>
      </div>
      <div class="kpi-card fade-in">
        <div class="kpi-icon ${pctOcupacionGlobal >= 85 ? 'red' : (pctOcupacionGlobal >= 60 ? 'yellow' : 'blue')}">${icon('user')}</div>
        <div class="kpi-value">${pctOcupacionGlobal}%</div>
        <div class="kpi-label">Ocupación Hospitalaria</div>
        <div style="font-size:11px; margin-top:4px; font-weight:600; color:${pctOcupacionGlobal >= 85 ? '#dc2626' : (pctOcupacionGlobal >= 60 ? '#d97706' : '#059669')}">
          ${pctOcupacionGlobal >= 85 ? '🚨 Ocupación Crítica (>85%)' : (pctOcupacionGlobal >= 60 ? '⚠️ Ocupación Moderada (60-85%)' : '✓ Rango Normal (<60%)')}
        </div>
      </div>
    </div>

    <div class="card scale-in">
      <div class="card-body" style="padding-bottom:12px;">
        <div class="filters-bar" style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
          <div class="filter-group search-input-wrapper" style="flex:1; min-width:240px;">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="area-search" placeholder="Buscar área por nombre o descripción..." value="${escapeHtml(areasTabState.searchArea)}" />
          </div>
          <button class="btn btn-secondary btn-sm" onclick="areasTabState.searchArea=''; renderApp();">Limpiar</button>
          <div style="font-size:12px; color:var(--gray-600); font-weight:600; margin-left:auto;">
            <span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:600; padding:4px 10px; font-size:11px;">
              Mostrando ${filtered.length} de ${areasList.length} áreas
            </span>
          </div>
        </div>
      </div>

      <div class="table-container table-stagger" style="padding:0;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="border-bottom:2px solid var(--gray-200); background:var(--gray-50); text-align:left;">
              <th style="padding:10px 14px; width:50px; text-align:center;">#</th>
              <th style="padding:10px 14px;">Nombre del Área</th>
              <th style="padding:10px 14px; text-align:center;">Camas Totales</th>
              <th style="padding:10px 14px; text-align:center;">Libres</th>
              <th style="padding:10px 14px; text-align:center;">Ocupadas</th>
              <th style="padding:10px 14px;">Ocupación</th>
              <th style="padding:10px 14px;">Descripción</th>
              <th style="padding:10px 14px; text-align:center;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="8">
                  <div class="empty-state">
                    <h3>No se encontraron áreas</h3>
                    <p>Intente con otro término o cree una nueva área hospitalaria</p>
                  </div>
                </td>
              </tr>
            ` : filtered.map((area, idx) => {
              const camasArea = camasList.filter(c => c.id_area === area.id);
              const totalCamas = camasArea.length;
              const libres = camasArea.filter(c => c.estado === 'Libre').length;
              const ocupadas = camasArea.filter(c => c.estado === 'Ocupada').length;
              const pct = totalCamas > 0 ? Math.round((ocupadas / totalCamas) * 100) : 0;
              const barColor = pct >= 85 ? '#ef4444' : (pct >= 60 ? '#f59e0b' : '#10b981');

              return `
                <tr style="border-bottom:1px solid var(--gray-100); background:${idx % 2 === 0 ? 'var(--white)' : '#f8fafc'};">
                  <td style="padding:10px 14px; font-weight:600; color:var(--gray-400); text-align:center; vertical-align:middle;">#${area.id}</td>
                  <td style="padding:10px 14px; font-weight:700; color:var(--gray-800); font-size:13.5px; vertical-align:middle; white-space:nowrap;">
                    ${escapeHtml(area.nombre)}
                  </td>
                  <td style="padding:10px 14px; text-align:center; font-weight:700; vertical-align:middle;">
                    <span class="badge" style="background:var(--celeste-light); color:var(--celeste-dark); font-size:11px; padding:3px 8px;">
                      ${totalCamas} camas
                    </span>
                  </td>
                  <td style="padding:10px 14px; text-align:center; color:#059669; font-weight:600; vertical-align:middle; white-space:nowrap;">
                    ${libres} libres
                  </td>
                  <td style="padding:10px 14px; text-align:center; color:var(--gray-700); font-weight:600; vertical-align:middle; white-space:nowrap;">
                    ${ocupadas} ocupadas
                  </td>
                  <td style="padding:10px 14px; width:140px; vertical-align:middle;">
                    <div style="display:flex; align-items:center; gap:6px;">
                      <div style="flex:1; height:8px; background:var(--gray-200); border-radius:4px; overflow:hidden;">
                        <div style="width:${pct}%; height:100%; background:${barColor}; border-radius:4px;"></div>
                      </div>
                      <span style="font-size:11px; font-weight:700; color:var(--gray-600);">${pct}%</span>
                    </div>
                  </td>
                  <td style="padding:10px 14px; vertical-align:middle;">
                    <span title="${escapeHtml(area.descripcion || '-')}" style="font-size:12px; color:var(--gray-500); max-width:200px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; display:inline-block; vertical-align:middle;">
                      ${escapeHtml(area.descripcion || '-')}
                    </span>
                  </td>
                  <td style="padding:10px 14px; vertical-align:middle; text-align:center;">
                    <div style="display:flex; align-items:center; justify-content:center; gap:16px;">
                      <button class="action-link" onclick="openAreaModal(${area.id})">Editar</button>
                      <button class="action-link danger" onclick="confirmDeleteArea(${area.id})" title="Eliminar Área" style="display:inline-flex; align-items:center; justify-content:center; border:none; background:none;">
                        ${icon('trash', 16)}
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 2: CAMAS CLÍNICAS (MAPA VISUAL Y GRID)
// -------------------------------------------------------------
function renderCamasTab() {
  const areasList = getAreas();
  const camasList = getCamas();
  const pacientesList = getPacientes();

  let filtered = camasList;
  if (areasTabState.filterAreaCamas) {
    filtered = filtered.filter(c => String(c.id_area) === String(areasTabState.filterAreaCamas));
  }
  if (areasTabState.filterEstadoCamas) {
    filtered = filtered.filter(c => c.estado === areasTabState.filterEstadoCamas);
  }
  if (areasTabState.searchCama) {
    const s = normalizeText(areasTabState.searchCama);
    filtered = filtered.filter(c => 
      normalizeText(c.numero).includes(s) || 
      normalizeText(c.area_nombre).includes(s)
    );
  }

  return `
    <div class="card scale-in">
      <div class="card-body" style="padding-bottom:0;">
        <div class="filters-bar" style="display:flex; flex-wrap:wrap; gap:10px;">
          <div class="filter-group search-input-wrapper" style="flex:1; min-width:200px;">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="cama-search" placeholder="Filtrar cama (Ej: Box 1, UTI-02, 301)..." value="${escapeHtml(areasTabState.searchCama)}" />
          </div>
          <div class="filter-group">
            <select id="cama-area-filter">
              <option value="">Todas las áreas hospitalarias</option>
              ${areasList.map(a => `<option value="${a.id}" ${String(areasTabState.filterAreaCamas) === String(a.id) ? 'selected' : ''}>${escapeHtml(a.nombre)}</option>`).join('')}
            </select>
          </div>
          <div class="filter-group">
            <select id="cama-estado-filter">
              <option value="">Todos los estados</option>
              <option value="Libre" ${areasTabState.filterEstadoCamas === 'Libre' ? 'selected' : ''}>${icon('circleFill')} Camas Libres</option>
              <option value="Ocupada" ${areasTabState.filterEstadoCamas === 'Ocupada' ? 'selected' : ''}>${icon('circleFill')} Camas Ocupadas</option>
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="areasTabState.searchCama=''; areasTabState.filterAreaCamas=''; areasTabState.filterEstadoCamas=''; renderApp();">Limpiar</button>
        </div>
      </div>

      <!-- Cuadrícula Visual de Camas -->
      <div style="padding:20px;">
        ${filtered.length === 0 ? `
          <div class="empty-state">
            <h3>No se encontraron camas</h3>
            <p>Ajuste los filtros o registre una nueva cama clínica</p>
          </div>
        ` : `
          <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:14px;">
            ${filtered.map(cama => {
              const isOcupada = cama.estado === 'Ocupada';
              const pacInternado = isOcupada ? pacientesList.find(p => p.area === cama.area_nombre && p.cama === cama.numero && p.activo) : null;

              return `
                <div style="background:${isOcupada ? '#fef2f2' : '#f0fdf4'}; border:2px solid ${isOcupada ? '#f87171' : '#86efac'}; border-radius:var(--radius-lg); padding:14px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.15s ease;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='translateY(0)'">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                      <strong style="font-size:16px; color:${isOcupada ? '#991b1b' : '#166534'};">
                        ${icon('bed')} ${escapeHtml(cama.numero)}
                      </strong>
                      <span class="badge ${isOcupada ? 'badge-danger' : 'badge-success'}" style="font-size:10.5px;">
                        ${cama.estado}
                      </span>
                    </div>
                    
                    <div style="font-size:12px; font-weight:600; color:var(--gray-700); margin-bottom:6px;">
                      ${icon('mapPin')} ${escapeHtml(cama.area_nombre)}
                    </div>

                    ${isOcupada ? `
                      <div style="font-size:11.5px; color:#7f1d1d; background:rgba(255,255,255,0.7); padding:6px 8px; border-radius:6px; margin-top:6px; border:1px dashed #fca5a5;">
                        ${icon('user')} <strong>${pacInternado ? escapeHtml(pacInternado.apellido + ', ' + pacInternado.nombre) : 'Paciente Internado'}</strong>
                        ${pacInternado?.dni ? `<div style="font-size:10px; color:#991b1b;">DNI: ${pacInternado.dni}</div>` : ''}
                      </div>
                    ` : `
                      <div style="font-size:11.5px; color:#15803d; padding:6px 0;">
                        ${icon('star')} Disponible para asignación
                      </div>
                    `}
                  </div>

                  <div style="margin-top:12px; padding-top:10px; border-top:1px solid ${isOcupada ? '#fecaca' : '#bbf7d0'}; display:flex; justify-content:space-between; align-items:center;">
                    <button class="btn btn-sm" style="font-size:11px; padding:3px 8px; font-weight:700; background:${isOcupada ? '#059669' : '#dc2626'}; color:#fff; border:none;" onclick="toggleCamaEstado(${cama.id})">
                      ${isOcupada ? icon('check', 12) + ' Liberar' : icon('lock', 12) + ' Ocupar'}
                    </button>
                    <div style="display:flex; gap:6px;">
                      <button class="action-link" style="font-size:12px;" onclick="openCamaModal(${cama.id})">Editar</button>
                      <button class="action-link danger" style="font-size:12px;" onclick="confirmDeleteCama(${cama.id})">Eliminar</button>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function setAreasTab(tabName) {
  areasTabState.currentTab = tabName;
  renderApp();
}

function setupAreas() {
  const areaSearch = document.getElementById('area-search');
  const camaSearch = document.getElementById('cama-search');
  const camaAreaFilter = document.getElementById('cama-area-filter');
  const camaEstadoFilter = document.getElementById('cama-estado-filter');

  if (areaSearch) {
    areaSearch.addEventListener('input', (e) => {
      areasTabState.searchArea = e.target.value;
      const cursorPosition = e.target.selectionStart;
      renderApp();
      requestAnimationFrame(() => {
        const reSearch = document.getElementById('area-search');
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    });
  }

  if (camaSearch) {
    camaSearch.addEventListener('input', (e) => {
      areasTabState.searchCama = e.target.value;
      const cursorPosition = e.target.selectionStart;
      renderApp();
      requestAnimationFrame(() => {
        const reSearch = document.getElementById('cama-search');
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    });
  }

  if (camaAreaFilter) {
    camaAreaFilter.addEventListener('change', () => {
      areasTabState.filterAreaCamas = camaAreaFilter.value;
      renderApp();
    });
  }

  if (camaEstadoFilter) {
    camaEstadoFilter.addEventListener('change', () => {
      areasTabState.filterEstadoCamas = camaEstadoFilter.value;
      renderApp();
    });
  }
}

// ==========================================
// MODALES Y ACCIONES DE ÁREAS Y CAMAS
// ==========================================

// 1. Modal Alta / Edición de Área con Sincronización de Camas
function openAreaModal(editId = null) {
  const isEdit = editId !== null;
  const areasList = getAreas();
  const area = isEdit ? areasList.find(a => a.id === editId) : null;

  document.querySelector('.area-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active area-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:520px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon('building')} ${isEdit ? 'Editar Área Hospitalaria' : 'Nueva Área Hospitalaria'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.area-modal-overlay').remove()">&times;</button>
      </div>

      <form id="area-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Nombre del Área *</label>
            <input type="text" id="ar-nombre" required placeholder="Ej: Unidad Coronaria (UCO) / Shock Room" value="${area ? escapeHtml(area.nombre) : ''}" />
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label style="color:var(--celeste-dark); font-weight:700;">Cantidad Total de Camas Clínicas *</label>
            <input type="number" id="ar-camas" required min="1" max="100" value="${area ? area.cantidad_camas : 6}" style="border:2px solid var(--celeste-300); font-weight:700; font-size:15px;" />
            <span style="font-size:11px; color:var(--gray-500); margin-top:4px; display:block;">
              ${icon('zap')} Al guardar, el sistema generará y mantendrá la consistencia de todas las camas asociadas automáticamente.
            </span>
          </div>

          <div class="form-group">
            <label>Descripción / Ubicación Física</label>
            <textarea id="ar-desc" rows="2" placeholder="Sector hospitalario, pabellón, piso...">${area ? escapeHtml(area.descripcion || '') : ''}</textarea>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.area-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">
            ${isEdit ? 'Guardar Cambios' : 'Crear Área'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('area-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('ar-nombre').value.trim();
    const cantidad_camas = parseInt(document.getElementById('ar-camas').value) || 1;
    const descripcion = document.getElementById('ar-desc').value.trim();

    if (!nombre) return;

    const currentAreas = getAreas();

    if (isEdit) {
      const idx = currentAreas.findIndex(a => a.id === editId);
      if (idx !== -1) {
        currentAreas[idx] = { ...currentAreas[idx], nombre, cantidad_camas, descripcion };
        saveAreas(currentAreas);
        syncCamasForArea(editId, cantidad_camas, nombre);
        showToast('Área y camas sincronizadas exitosamente', 'success');
      }
    } else {
      const newId = currentAreas.length > 0 ? Math.max(...currentAreas.map(a => a.id)) + 1 : 1;
      currentAreas.push({ id: newId, nombre, cantidad_camas, descripcion });
      saveAreas(currentAreas);
      syncCamasForArea(newId, cantidad_camas, nombre);
      showToast('Nueva área registrada y camas generadas automáticamente', 'success');
    }

    document.querySelector('.area-modal-overlay')?.remove();
    renderApp();
  });
}

// 2. Validación y Eliminación de Área con Modal
function confirmDeleteArea(id) {
  const areasList = getAreas();
  const camasList = getCamas();
  const pacientesList = getPacientes();
  const area = areasList.find(a => a.id === id);
  if (!area) return;

  const camasDeArea = camasList.filter(c => c.id_area === id);
  const camasOcupadas = camasDeArea.filter(c => c.estado === 'Ocupada');
  const pacientesEnArea = pacientesList.filter(p => p.area === area.nombre && p.activo);

  if (pacientesEnArea.length > 0 || camasOcupadas.length > 0) {
    showConfirmModal({
      title: 'Bloqueo de Seguridad: Área Ocupada',
      message: `${icon('alertTriangle')} No se puede eliminar el área <strong>"${escapeHtml(area.nombre)}"</strong> porque tiene <strong>${pacientesEnArea.length} paciente(s) internado(s)</strong> o <strong>${camasOcupadas.length} cama(s) ocupada(s)</strong>.<br><br>Debe dar el alta médica o reubicar a los pacientes antes de eliminar el área.`,
      isAlertOnly: true
    });
    return;
  }

  showConfirmModal({
    title: 'Eliminar Área Hospitalaria',
    message: `¿Está seguro de eliminar el área <strong>"${escapeHtml(area.nombre)}"</strong> y sus <strong>${camasDeArea.length} camas libres asociadas</strong>?`,
    onConfirm: () => {
      const restCamas = camasList.filter(c => c.id_area !== id);
      saveCamas(restCamas);

      const restAreas = areasList.filter(a => a.id !== id);
      saveAreas(restAreas);

      showToast('Área y camas eliminadas del sistema', 'success');
      renderApp();
    }
  });
}

// 3. Modal Alta / Edición de Cama Individual
function openCamaModal(editId = null) {
  const isEdit = editId !== null;
  const areasList = getAreas();
  const camasList = getCamas();
  const cama = isEdit ? camasList.find(c => c.id === editId) : null;

  document.querySelector('.cama-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active cama-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon('bed')} ${isEdit ? 'Editar Cama Clínica' : 'Registrar Nueva Cama'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.cama-modal-overlay').remove()">&times;</button>
      </div>

      <form id="cama-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Área Hospitalaria *</label>
            <select id="cm-area" required>
              ${areasList.map(a => `<option value="${a.id}" ${cama && cama.id_area === a.id ? 'selected' : ''}>${escapeHtml(a.nombre)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label>Número / Código de Cama *</label>
            <input type="text" id="cm-num" required placeholder="Ej: Box 4, Cama 308, UTI-05" value="${cama ? escapeHtml(cama.numero) : ''}" />
          </div>

          <div class="form-group">
            <label>Estado Inicial *</label>
            <select id="cm-estado" required>
              <option value="Libre" ${cama && cama.estado === 'Libre' ? 'selected' : ''}>${icon('circleFill')} Libre (Disponible)</option>
              <option value="Ocupada" ${cama && cama.estado === 'Ocupada' ? 'selected' : ''}>${icon('circleFill')} Ocupada</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.cama-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Guardar Cama</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('cama-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id_area = parseInt(document.getElementById('cm-area').value);
    const numero = document.getElementById('cm-num').value.trim();
    const estado = document.getElementById('cm-estado').value;

    if (!id_area || !numero) return;

    const areaObj = areasList.find(a => a.id === id_area);
    const area_nombre = areaObj ? areaObj.nombre : 'Área';
    const currentCamas = getCamas();

    if (isEdit) {
      const idx = currentCamas.findIndex(c => c.id === editId);
      if (idx !== -1) {
        currentCamas[idx] = { ...currentCamas[idx], id_area, area_nombre, numero, estado };
        saveCamas(currentCamas);
        showToast('Cama actualizada');
      }
    } else {
      const newId = currentCamas.length > 0 ? Math.max(...currentCamas.map(c => c.id)) + 1 : 1;
      currentCamas.push({ id: newId, id_area, area_nombre, numero, estado });
      saveCamas(currentCamas);
      showToast('Cama registrada exitosamente');
    }

    document.querySelector('.cama-modal-overlay')?.remove();
    renderApp();
  });
}

function toggleCamaEstado(id) {
  const currentCamas = getCamas();
  const idx = currentCamas.findIndex(c => c.id === id);
  if (idx !== -1) {
    currentCamas[idx].estado = currentCamas[idx].estado === 'Libre' ? 'Ocupada' : 'Libre';
    saveCamas(currentCamas);
    showToast(`Cama ${currentCamas[idx].numero} marcada como ${currentCamas[idx].estado}`, 'success');
    renderApp();
  }
}

function confirmDeleteCama(id) {
  const currentCamas = getCamas();
  const cama = currentCamas.find(c => c.id === id);
  if (!cama) return;

  if (cama.estado === 'Ocupada') {
    showConfirmModal({
      title: 'Cama Ocupada',
      message: `${icon('alertTriangle')} No se puede eliminar la cama <strong>"${escapeHtml(cama.numero)}"</strong> porque se encuentra en estado <strong>Ocupada</strong>.<br><br>Libere la cama o dé el alta al paciente primero.`,
      isAlertOnly: true
    });
    return;
  }

  showConfirmModal({
    title: 'Eliminar Cama Clínica',
    message: `¿Está seguro de eliminar la cama <strong>"${escapeHtml(cama.numero)}"</strong> del área <strong>${escapeHtml(cama.area_nombre)}</strong>?<br><br>Las camas posteriores de esta área restarán 1 a su numeración.`,
    onConfirm: () => {
      // 1. Obtener número numérico de la cama eliminada (ej: 1002 de "Cama 1002" o "1002")
      const numMatch = cama.numero.match(/\d+/);
      const deletedNum = numMatch ? parseInt(numMatch[0]) : null;

      // 2. Filtrar las camas restantes
      const rest = currentCamas.filter(c => c.id !== id);

      // 3. Restar 1 a todas las camas de esa misma área cuyo número sea mayor al eliminado
      rest.forEach(c => {
        if (c.id_area === cama.id_area) {
          const matchCurrent = c.numero.match(/\d+/);
          if (matchCurrent && deletedNum !== null) {
            const currentNum = parseInt(matchCurrent[0]);
            if (currentNum > deletedNum) {
              const newNum = currentNum - 1;
              c.numero = c.numero.replace(/\d+/, newNum);
            }
          }
        }
      });

      saveCamas(rest);

      // 4. Mantener consistencia en la cantidad declarada en el área
      const currentAreas = getAreas();
      const areaTarget = currentAreas.find(a => a.id === cama.id_area);
      if (areaTarget) {
        areaTarget.cantidad_camas = rest.filter(c => c.id_area === cama.id_area).length;
        saveAreas(currentAreas);
      }

      showToast('Cama eliminada y numeración de camas subsiguientes decrementada (-1)', 'success');
      renderApp();
    }
  });
}

// Exponer en window
window.openAreaModal = openAreaModal;
window.confirmDeleteArea = confirmDeleteArea;
window.openCamaModal = openCamaModal;
window.toggleCamaEstado = toggleCamaEstado;
window.confirmDeleteCama = confirmDeleteCama;

