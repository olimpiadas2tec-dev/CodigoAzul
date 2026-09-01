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
      ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
        <div style="display:flex; gap:8px;">
          ${tab === 'areas' ? `
            <button class="btn btn-primary btn-sm" onclick="openAreaModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva Área
            </button>
          ` : `
            <button class="btn btn-primary btn-sm" onclick="openCamaModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nueva Cama
            </button>
          `}
        </div>
      `}
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
          ${pctOcupacionGlobal >= 85 ? ' Ocupación Crítica (>85%)' : (pctOcupacionGlobal >= 60 ? ' Ocupación Moderada (60-85%)' : ' Rango Normal (<60%)')}
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
                  <td style="padding:10px 14px; font-weight:600; color:var(--gray-400); text-align:center; vertical-align:middle;">${area.id}</td>
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
                    ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? `
                      <span style="font-size:11px; color:var(--gray-400); font-style:italic;">Solo lectura</span>
                    ` : `
                      <div style="display:flex; align-items:center; justify-content:center; gap:16px;">
                        <button class="action-link" onclick="openAreaModal(${area.id})">${icon('edit', 14)} Editar</button>
                        <button class="action-link danger" onclick="confirmDeleteArea(${area.id})" title="Eliminar Área" style="display:inline-flex; align-items:center; justify-content:center; border:none; background:none;">
                          ${icon('trash', 16)}
                        </button>
                      </div>
                    `}
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
      <div class="card-body" style="padding-bottom:12px;">
        <div class="filters-bar" style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;">
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
          <div style="font-size:12px; color:var(--gray-600); font-weight:600; margin-left:auto;">
            <span class="badge" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; font-weight:600; padding:4px 10px; font-size:11px;">
              Mostrando ${filtered.length} de ${camasList.length} camas
            </span>
          </div>
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
          ${(() => {
            // Agrupar camas por área
            const grouped = {};
            filtered.forEach(cama => {
              const key = cama.area_nombre;
              if (!grouped[key]) grouped[key] = [];
              grouped[key].push(cama);
            });

            return Object.keys(grouped).map(areaNombre => {
              const camasDeArea = grouped[areaNombre];
              const libresArea = camasDeArea.filter(c => c.estado === 'Libre').length;
              const ocupadasArea = camasDeArea.filter(c => c.estado === 'Ocupada').length;

              return `
                <div style="margin-bottom:24px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:10px 14px; background:var(--gray-50); border-radius:var(--radius-lg); border-left:4px solid var(--celeste-dark);">
                    <div style="display:flex; align-items:center; gap:10px;">
                      ${icon('building')}
                      <strong style="font-size:14px; color:var(--gray-800);">${escapeHtml(areaNombre)}</strong>
                    </div>
                    <div style="display:flex; gap:12px; font-size:12px; font-weight:600;">
                      <span style="color:#059669;">${libresArea} libres</span>
                      <span style="color:var(--gray-500);">|</span>
                      <span style="color:${ocupadasArea > 0 ? '#dc2626' : 'var(--gray-400)'}">${ocupadasArea} ocupadas</span>
                      <span style="color:var(--gray-500);">|</span>
                      <span style="color:var(--gray-600);">${camasDeArea.length} total</span>
                    </div>
                  </div>
                  <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:12px;">
                    ${camasDeArea.map(cama => {
                      const isOcupada = cama.estado === 'Ocupada';
                      const pacInternado = isOcupada ? pacientesList.find(p => p.area === cama.area_nombre && p.cama === cama.numero && p.activo) : null;

                      return `
                        <div style="background:${isOcupada ? '#fef2f2' : '#f0fdf4'}; border:2px solid ${isOcupada ? '#f87171' : '#86efac'}; border-radius:var(--radius-lg); padding:12px; box-shadow:var(--shadow-sm); display:flex; flex-direction:column; justify-content:space-between; transition:transform 0.15s ease;" onmouseenter="this.style.transform='translateY(-2px)'" onmouseleave="this.style.transform='translateY(0)'">
                          <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                              <strong style="font-size:15px; color:${isOcupada ? '#991b1b' : '#166534'};">
                                ${icon('bed')} ${escapeHtml(cama.numero)}
                              </strong>
                              <span class="badge ${isOcupada ? 'badge-danger' : 'badge-success'}" style="font-size:10px; padding:2px 6px;">
                                ${cama.estado}
                              </span>
                            </div>

                            ${isOcupada ? `
                              <div style="font-size:11px; color:#7f1d1d; background:rgba(255,255,255,0.85); padding:5px 8px; border-radius:6px; margin-top:4px; border:1px solid #fca5a5; display:flex; align-items:center; gap:6px;">
                                
                                <div>
                                  <strong style="color:#991b1b; font-size:11px;">${pacInternado ? escapeHtml(pacInternado.apellido + ', ' + pacInternado.nombre) : 'Paciente Internado'}</strong>
                                  ${pacInternado?.dni ? `<div style="font-size:10px; color:#b91c1c;">DNI: ${formatDNI(pacInternado.dni)}</div>` : ''}
                                </div>
                              </div>
                            ` : `
                              <div style="font-size:11px; color:#15803d; padding:4px 0; display:flex; align-items:center; gap:4px; font-weight:600;">
                                ${icon('checkCircle', 12)} Disponible
                              </div>
                            `}
                          </div>

                          <div style="margin-top:10px; padding-top:8px; border-top:1px solid ${isOcupada ? '#fecaca' : '#bbf7d0'}; display:flex; justify-content:space-between; align-items:center;">
                            ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? `
                              <span style="font-size:11px; color:var(--gray-500); font-style:italic;">Solo lectura</span>
                            ` : `
                              <button class="btn btn-sm" style="font-size:11px; padding:3px 8px; font-weight:600; background:${isOcupada ? '#f1f5f9' : 'var(--celeste-dark)'}; color:${isOcupada ? '#334155' : '#ffffff'}; border:${isOcupada ? '1px solid #cbd5e1' : 'none'}; border-radius:5px; display:inline-flex; align-items:center; gap:3px; cursor:pointer;" onclick="toggleCamaEstado(${cama.id})">
                                ${isOcupada ? icon('check', 11) + ' Liberar' : icon('plus', 11) + ' Ocupar'}
                              </button>
                              <div style="display:flex; align-items:center; gap:10px;">
                                <button class="action-link" style="font-size:11px;" onclick="openCamaModal(${cama.id})">${icon('edit', 12)} Editar</button>
                                <button class="action-link danger" style="font-size:11px; display:inline-flex; align-items:center; justify-content:center; border:none; background:none;" onclick="confirmDeleteCama(${cama.id})" title="Eliminar Cama">
                                  ${icon('trash', 14)}
                                </button>
                              </div>
                            `}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('');
          })()}
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

  // Preview del código que se va a generar para nueva cama
  const firstArea = areasList[0];
  const previewAreaId = cama ? cama.id_area : (firstArea ? firstArea.id : 1);
  const previewAreaNombre = cama ? cama.area_nombre : (firstArea ? firstArea.nombre : 'Área');
  const camasEnAreaPreview = camasList.filter(c => c.id_area === previewAreaId).length;
  const previewCode = isEdit ? cama.numero : generarNumeroCama(previewAreaNombre, camasEnAreaPreview + 1);

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
            <label>Código de Cama</label>
            <div id="cm-code-preview" style="background:var(--gray-100); border:1px solid var(--gray-200); border-radius:var(--radius-md); padding:10px 14px; font-size:16px; font-weight:700; color:var(--celeste-dark); letter-spacing:1px;">
              ${escapeHtml(previewCode)}
            </div>
            <span style="font-size:11px; color:var(--gray-500); margin-top:4px; display:block;">
              ${icon('zap')} El código se genera automáticamente según el área seleccionada.
            </span>
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

  // Actualizar preview al cambiar área
  document.getElementById('cm-area').addEventListener('change', () => {
    const selAreaId = parseInt(document.getElementById('cm-area').value);
    const selArea = areasList.find(a => a.id === selAreaId);
    if (selArea) {
      const camasEnArea = camasList.filter(c => c.id_area === selAreaId).length;
      const nextNum = isEdit ? cama.numero : generarNumeroCama(selArea.nombre, camasEnArea + 1);
      document.getElementById('cm-code-preview').textContent = nextNum;
    }
  });

  document.getElementById('cama-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id_area = parseInt(document.getElementById('cm-area').value);
    const estado = document.getElementById('cm-estado').value;

    if (!id_area) return;

    const areaObj = areasList.find(a => a.id === id_area);
    const area_nombre = areaObj ? areaObj.nombre : 'Área';
    const currentCamas = getCamas();

    if (isEdit) {
      const idx = currentCamas.findIndex(c => c.id === editId);
      if (idx !== -1) {
        const oldState = currentCamas[idx].estado;
        const oldNum = currentCamas[idx].numero;
        const oldArea = currentCamas[idx].area_nombre;

        currentCamas[idx] = { ...currentCamas[idx], id_area, area_nombre, estado };

        if (oldState === 'Ocupada' && estado === 'Libre') {
          const pacientes = getPacientes();
          const pIdx = pacientes.findIndex(p => p.activo && (p.cama === oldNum || (p.area === oldArea && p.cama === oldNum)));
          if (pIdx !== -1) {
            pacientes[pIdx].cama = '';
            savePacientes(pacientes);
          }
          currentCamas[idx].id_paciente = null;
          currentCamas[idx].paciente_nombre = null;
        }

        // Renumerar todas las camas del área de destino
        let seqIdx = 1;
        currentCamas.forEach(c => {
          if (c.id_area === id_area) {
            c.numero = generarNumeroCama(area_nombre, seqIdx);
            seqIdx++;
          }
        });
        saveCamas(currentCamas);
        showToast('Cama actualizada');
      }
    } else {
      const newId = currentCamas.length > 0 ? Math.max(...currentCamas.map(c => c.id)) + 1 : 1;
      const camasEnArea = currentCamas.filter(c => c.id_area === id_area).length;
      const numero = generarNumeroCama(area_nombre, camasEnArea + 1);
      currentCamas.push({ id: newId, id_area, area_nombre, numero, estado });
      saveCamas(currentCamas);

      // Actualizar cantidad_camas del área
      const currentAreas = getAreas();
      const areaTarget = currentAreas.find(a => a.id === id_area);
      if (areaTarget) {
        areaTarget.cantidad_camas = currentCamas.filter(c => c.id_area === id_area).length;
        saveAreas(currentAreas);
      }

      showToast('Cama registrada exitosamente');
    }

    document.querySelector('.cama-modal-overlay')?.remove();
    renderApp();
  });
}

function openOcuparCamaModal(camaId) {
  const camasList = getCamas();
  const cama = camasList.find(c => c.id === camaId);
  if (!cama) return;

  const pacientesList = getPacientes().filter(p => p.activo);

  document.querySelector('.ocupar-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active ocupar-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  let selectedPacId = null;

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:95%; max-width:650px; max-height:90vh; display:flex; flex-direction:column; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <div>
          <h2 style="font-size:17px; font-weight:800; color:var(--gray-900); margin:0; display:flex; align-items:center; gap:8px;">
            ${icon('bed')} Asignar Paciente a Cama <span style="color:var(--celeste-dark);">${escapeHtml(cama.numero)}</span>
          </h2>
          <p style="font-size:12px; color:var(--gray-500); margin:2px 0 0 0;">Sector de destino: <strong>${escapeHtml(cama.area_nombre)}</strong></p>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.ocupar-modal-overlay').remove()">&times;</button>
      </div>

      <div class="modal-body" style="padding:18px 24px; display:flex; flex-direction:column; gap:12px; overflow:hidden; flex:1;">
        <!-- Única Barra de búsqueda en tiempo real -->
        <div class="search-input-wrapper" style="position:relative; display:flex; align-items:center;">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:12px; width:16px; height:16px; color:var(--gray-400);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="ocupar-search-input" placeholder="Filtrar por nombre, DNI, causa o cama actual..." style="width:100%; padding:10px 14px 10px 38px; border:1.5px solid var(--gray-300); border-radius:var(--radius); font-size:13px; outline:none;" autofocus />
        </div>

        <div style="font-size:11.5px; font-weight:700; color:var(--gray-500); text-transform:uppercase; letter-spacing:0.5px;">
          Seleccione el paciente a internar en ${escapeHtml(cama.numero)}:
        </div>

        <!-- Contenedor con lista de pacientes -->
        <div id="ocupar-pacientes-list" style="max-height:340px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding-right:4px;">
        </div>
      </div>

      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.ocupar-modal-overlay').remove()">Cancelar</button>
        <button type="button" id="btn-confirmar-ocupar" disabled class="btn btn-primary btn-sm" style="font-weight:700; gap:6px;">
          ${icon('check')} Confirmar Asignación
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const searchInput = document.getElementById('ocupar-search-input');
  const listContainer = document.getElementById('ocupar-pacientes-list');
  const btnConfirmar = document.getElementById('btn-confirmar-ocupar');

  function renderPacientesList(query = '') {
    const q = normalizeText(query);
    const filtered = pacientesList.filter(p => {
      if (!q) return true;
      const fullText = normalizeText(`${p.nombre} ${p.apellido} ${p.dni} ${p.causa} ${p.area} ${p.cama}`);
      return fullText.includes(q);
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="padding:24px; text-align:center; color:var(--gray-500); font-size:13px; background:var(--gray-50); border-radius:8px;">
          ${icon('search', 24)}
          <div style="margin-top:6px; font-weight:600;">No se encontraron pacientes para "${escapeHtml(query)}"</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(p => {
      const isSelected = selectedPacId === p.id;
      const hasCama = Boolean(p.cama && p.cama !== 'Sin Cama');

      return `
        <div class="ocupar-paciente-card" data-id="${p.id}" style="padding:12px 16px; border:1.5px solid ${isSelected ? 'var(--celeste)' : 'var(--gray-200)'}; background:${isSelected ? '#eff6ff' : 'var(--white)'}; border-radius:10px; cursor:pointer; transition:all 0.15s ease; display:flex; justify-content:space-between; align-items:center; gap:12px;">
          <div style="flex:1; min-width:0;">
            <div style="font-weight:700; color:var(--gray-900); font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              ${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}
            </div>
            <div style="font-size:11.5px; color:var(--gray-500); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
              DNI: ${escapeHtml(p.dni ? formatDNI(p.dni) : 'S/D')} &middot; <span style="color:var(--gray-700);">${escapeHtml(p.causa || 'Sin causa')}</span>
            </div>
            <div style="font-size:11px; color:var(--gray-600); margin-top:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
               Área actual: <strong>${escapeHtml(p.area)}</strong>
            </div>
          </div>
          <div style="flex-shrink:0; text-align:right;">
            ${hasCama ? `
              <span class="badge" style="background:#fff7ed; color:#c2410c; border:1px solid #ffedd5; font-weight:700; font-size:11.5px; padding:5px 10px; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;" title="Al asignar esta nueva cama, la cama ${escapeHtml(p.cama)} quedará libre automáticamente">
                 Cama actual: ${escapeHtml(p.cama)}
              </span>
            ` : `
              <span class="badge" style="background:#ecfdf5; color:#047857; border:1px solid #a7f3d0; font-weight:700; font-size:11.5px; padding:5px 10px; border-radius:6px; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;">
                 Sin cama asignada
              </span>
            `}
          </div>
        </div>
      `;
    }).join('');

    // Listeners para selección de tarjeta de paciente
    listContainer.querySelectorAll('.ocupar-paciente-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.getAttribute('data-id'));
        selectedPacId = id;
        btnConfirmar.disabled = false;
        renderPacientesList(searchInput.value);
      });
    });
  }

  renderPacientesList();

  // Escuchar entrada de la barra de búsqueda en tiempo real
  searchInput.addEventListener('input', (e) => {
    renderPacientesList(e.target.value);
  });

  // Ejecutar asignación al hacer clic en Confirmar
  btnConfirmar.addEventListener('click', () => {
    if (!selectedPacId) return;

    const pacientesAll = getPacientes();
    const pIdx = pacientesAll.findIndex(p => p.id === selectedPacId);
    if (pIdx === -1) return;

    const pacienteObj = pacientesAll[pIdx];
    const prevCamaNum = pacienteObj.cama;
    const prevAreaName = pacienteObj.area;

    const allCamas = getCamas();

    // 1. Si el paciente ya tenía una cama previa ocupada, liberar la cama anterior
    if (prevCamaNum && prevCamaNum !== 'Sin Cama') {
      const prevCamaObj = allCamas.find(c => c.numero === prevCamaNum || (c.area_nombre === prevAreaName && c.numero === prevCamaNum));
      if (prevCamaObj) {
        prevCamaObj.estado = 'Libre';
        prevCamaObj.id_paciente = null;
        prevCamaObj.paciente_nombre = null;
      }
    }

    // 2. Ocupar la cama de destino seleccionada
    const targetCamaObj = allCamas.find(c => c.id === camaId);
    if (targetCamaObj) {
      targetCamaObj.estado = 'Ocupada';
      targetCamaObj.id_paciente = pacienteObj.id;
      targetCamaObj.paciente_nombre = `${pacienteObj.apellido}, ${pacienteObj.nombre}`;
    }

    // 3. Actualizar al paciente con el área y cama de destino
    pacienteObj.area = cama.area_nombre;
    pacienteObj.cama = cama.numero;

    saveCamas(allCamas);
    savePacientes(pacientesAll);

    showToast(`Paciente "${pacienteObj.apellido}, ${pacienteObj.nombre}" asignado a cama ${cama.numero}.${prevCamaNum && prevCamaNum !== 'Sin Cama' ? ' (Se liberó la cama anterior ' + prevCamaNum + ')' : ''}`, 'success');

    overlay.remove();
    renderApp();
  });
}

function toggleCamaEstado(id) {
  const currentCamas = getCamas();
  const idx = currentCamas.findIndex(c => c.id === id);
  if (idx !== -1) {
    const cama = currentCamas[idx];
    if (cama.estado === 'Libre') {
      // Abrir modal de selección de paciente para ocupar la cama
      openOcuparCamaModal(id);
      return;
    }

    // Si estaba Ocupada -> Liberar la cama
    let pacNombre = '';
    const pacientes = getPacientes();
    const pIdx = pacientes.findIndex(p => p.cama === cama.numero || (p.area === cama.area_nombre && p.cama === cama.numero));
    if (pIdx !== -1) {
      pacNombre = `${pacientes[pIdx].apellido}, ${pacientes[pIdx].nombre}`;
      pacientes[pIdx].cama = ''; // Queda sin cama asignada
      pacientes[pIdx].area = 'Sin Designar'; // Sin área designada
      pacientes[pIdx].activo = false; // Dado de alta automáticamente
      savePacientes(pacientes);
    }
    cama.estado = 'Libre';
    cama.id_paciente = null;
    cama.paciente_nombre = null;

    saveCamas(currentCamas);
    showToast(`Cama ${cama.numero} liberada.${pacNombre ? ' El paciente (' + pacNombre + ') fue dado de alta automáticamente y quedó sin área.' : ''}`, 'success');
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
    message: `¿Está seguro de eliminar la cama <strong>"${escapeHtml(cama.numero)}"</strong> del área <strong>${escapeHtml(cama.area_nombre)}</strong>?<br><br>Las camas restantes del área serán renumeradas automáticamente.`,
    onConfirm: () => {
      // 1. Filtrar la cama eliminada
      const rest = currentCamas.filter(c => c.id !== id);

      // 2. Renumerar secuencialmente todas las camas de esa área
      let idx = 1;
      rest.forEach(c => {
        if (c.id_area === cama.id_area) {
          c.numero = generarNumeroCama(c.area_nombre, idx);
          idx++;
        }
      });

      saveCamas(rest);

      // 3. Mantener consistencia en la cantidad declarada en el área
      const currentAreas = getAreas();
      const areaTarget = currentAreas.find(a => a.id === cama.id_area);
      if (areaTarget) {
        areaTarget.cantidad_camas = rest.filter(c => c.id_area === cama.id_area).length;
        saveAreas(currentAreas);
      }

      showToast('Cama eliminada y numeración actualizada correctamente', 'success');
      renderApp();
    }
  });
}

// Exponer en window
window.openAreaModal = openAreaModal;
window.confirmDeleteArea = confirmDeleteArea;
window.openCamaModal = openCamaModal;
window.openOcuparCamaModal = openOcuparCamaModal;
window.toggleCamaEstado = toggleCamaEstado;
window.confirmDeleteCama = confirmDeleteCama;


