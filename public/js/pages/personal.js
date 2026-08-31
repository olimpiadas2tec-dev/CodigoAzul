let personalTabState = {
  currentTab: 'personal', // 'personal', 'roles', 'equipos', 'turnos'
  searchPersonal: '',
  filterRol: ''
};

function renderPersonal() {
  const tab = personalTabState.currentTab;
  const equiposCount = getEquipos().length;

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Personal de Salud y Equipos de Emergencia</h1>
        <p>Gestión de profesionales, roles obligatorios, brigadas y asignación de turnos</p>
      </div>
      <div style="display:flex; gap:8px;">
        ${tab === 'personal' ? `
          <button class="btn btn-primary btn-sm" onclick="openPersonalModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Nuevo Personal
          </button>
        ` : tab === 'roles' ? `
          <button class="btn btn-primary btn-sm" onclick="openRolModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Nuevo Rol de Salud
          </button>
        ` : tab === 'equipos' ? `
          <button class="btn btn-primary btn-sm" onclick="openEquipoModal()" ${equiposCount >= 3 ? 'title="Límite máximo de 3 equipos alcanzado" style="opacity:0.6;"' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Nuevo Equipo ${equiposCount >= 3 ? '(Máx 3)' : ''}
          </button>
        ` : ''}
      </div>
    </div>

    <div class="page-body">
      <!-- Tabs Navigation -->
      <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid var(--gray-200); padding-bottom:8px;">
        <button class="btn ${tab === 'personal' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setPersonalTab('personal')">
          ${icon('user')} Personal de Salud
        </button>
        <button class="btn ${tab === 'roles' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setPersonalTab('roles')">
          ${icon('tag')} Roles de Salud
        </button>
        <button class="btn ${tab === 'equipos' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setPersonalTab('equipos')">
          ${icon('truck')} Equipos de Emergencia (${equiposCount}/3)
        </button>
        <button class="btn ${tab === 'turnos' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setPersonalTab('turnos')">
          ${icon('clock')} Turnos y Asignaciones
        </button>
      </div>

      ${tab === 'personal' ? renderPersonalTab() :
        tab === 'roles' ? renderRolesTab() :
        tab === 'equipos' ? renderEquiposTab() :
        renderTurnosTab()}
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 1: PERSONAL DE SALUD
// -------------------------------------------------------------
function renderPersonalTab() {
  const personalList = getPersonalSalud();
  const rolesList = getRolesSalud();

  let filtered = personalList;
  if (personalTabState.searchPersonal) {
    const s = normalizeText(personalTabState.searchPersonal);
    filtered = filtered.filter(p =>
      normalizeText(`${p.nombre} ${p.apellido}`).includes(s) ||
      normalizeText(`${p.apellido} ${p.nombre}`).includes(s) ||
      (p.dni && normalizeText(p.dni).includes(s)) ||
      (p.nombre_rol && normalizeText(p.nombre_rol).includes(s)) ||
      (p.area && normalizeText(p.area).includes(s))
    );
  }

  if (personalTabState.filterRol) {
    filtered = filtered.filter(p => String(p.id_rol_profesional) === String(personalTabState.filterRol) || p.nombre_rol === personalTabState.filterRol);
  }

  return `
    <div class="card scale-in">
      <div class="card-body" style="padding-bottom:0;">
        <div class="filters-bar" style="display:flex; flex-wrap:wrap; gap:10px;">
          <div class="filter-group search-input-wrapper" style="flex:1; min-width:240px;">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="personal-search" placeholder="Filtrar personal por nombre, apellido, DNI o área..." value="${escapeHtml(personalTabState.searchPersonal)}" />
          </div>
          <div class="filter-group">
            <select id="personal-rol-filter">
              <option value="">Todos los roles de salud</option>
              <option value="Sin Designar" ${personalTabState.filterRol === 'Sin Designar' ? 'selected' : ''}>Sin Designar</option>
              ${rolesList.map(r => `<option value="${r.id}" ${String(personalTabState.filterRol) === String(r.id) ? 'selected' : ''}>${escapeHtml(r.nombre_rol)}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="personalTabState.searchPersonal=''; personalTabState.filterRol=''; renderApp();">Limpiar</button>
        </div>
      </div>

      <div class="table-container table-stagger">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Profesional</th>
              <th>DNI</th>
              <th>Rol Profesional</th>
              <th>Teléfono</th>
              <th>Área Asignada</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7">
                  <div class="empty-state">
                    <h3>No se encontró personal</h3>
                    <p>Intente con otro término o registre nuevo personal de salud</p>
                  </div>
                </td>
              </tr>
            ` : filtered.map(p => `
              <tr>
                <td style="font-weight:600; color:var(--gray-400);">${p.id}</td>
                <td style="font-weight:700; color:var(--gray-800); font-size:13.5px;">
                  ${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}
                </td>
                <td style="font-weight:600; font-size:12px;">${p.dni || 'S/D'}</td>
                <td>
                  <span class="badge ${p.nombre_rol === 'Sin Designar' ? 'badge-warning' : 'badge-info'}" style="font-weight:700;">
                    ${escapeHtml(p.nombre_rol || 'Sin Designar')}
                  </span>
                </td>
                <td style="color:var(--gray-600); font-size:12px;">${escapeHtml(p.telefono || '-')}</td>
                <td>
                  <span style="font-weight:600; color:${p.area === 'Sin Designar' ? 'var(--gray-400)' : 'var(--celeste-dark)'}; font-size:12.5px;">
                    ${escapeHtml(p.area || 'Sin Designar')}
                  </span>
                </td>
                <td>
                  <div style="display:flex; gap:6px;">
                    <button class="action-link" onclick="openPersonalModal(${p.id})">Editar</button>
                    <button class="action-link danger" onclick="confirmDeletePersonal(${p.id})">Eliminar</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 2: ROLES DE SALUD (ALTA, EDICIÓN Y LISTADO)
// -------------------------------------------------------------
function renderRolesTab() {
  const rolesList = getRolesSalud();
  const personalList = getPersonalSalud();

  return `
    <div class="card scale-in">
      <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h2>Roles Profesionales de Salud</h2>
          <p style="font-size:13px; color:var(--gray-500); margin:0;">Categorías clínicas y especialidades requeridas para el personal</p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openRolModal()">+ Nuevo Rol</button>
      </div>
      <div class="card-body" style="padding:0;">
        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="border-bottom:2px solid var(--gray-200); background:var(--gray-50); text-align:left;">
              <th style="padding:10px 16px;">ID</th>
              <th style="padding:10px 16px;">Nombre del Rol</th>
              <th style="padding:10px 16px;">Descripción</th>
              <th style="padding:10px 16px;">Personal Asignado</th>
              <th style="padding:10px 16px;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rolesList.map(rol => {
              const personalCount = personalList.filter(p => p.id_rol_profesional === rol.id || p.nombre_rol === rol.nombre_rol).length;
              return `
                <tr style="border-bottom:1px solid var(--gray-100);">
                  <td style="padding:10px 16px; font-weight:600; color:var(--gray-400);">${rol.id}</td>
                  <td style="padding:10px 16px; font-weight:700; color:var(--celeste-dark);">${escapeHtml(rol.nombre_rol)}</td>
                  <td style="padding:10px 16px; color:var(--gray-600);">${escapeHtml(rol.descripcion || '-')}</td>
                  <td style="padding:10px 16px;">
                    <span class="badge ${personalCount > 0 ? 'badge-success' : 'badge-warning'}">
                      ${personalCount} profesional(es)
                    </span>
                  </td>
                  <td style="padding:10px 16px;">
                    <div style="display:flex; gap:6px;">
                      <button class="action-link" onclick="openRolModal(${rol.id})">Editar</button>
                      <button class="action-link danger" onclick="confirmDeleteRol(${rol.id})">Eliminar</button>
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
// TAB 3: EQUIPOS DE EMERGENCIA (MÁXIMO 3)
// -------------------------------------------------------------
function renderEquiposTab() {
  const equiposList = getEquipos();
  const personalList = getPersonalSalud();

  return `
    <div style="margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">
      <div style="font-size:13px; color:var(--gray-600);">
        Configuración institucional: <strong>${equiposList.length} de 3 Equipos activos</strong> (Equipo A, Equipo B, Equipo C).
      </div>
      ${equiposList.length < 3 ? `
        <button class="btn btn-primary btn-sm" onclick="openEquipoModal()">+ Nuevo Equipo</button>
      ` : `
        <span class="badge badge-info" style="font-size:12px;">${icon('alertTriangle', 12)} Límite de 3 Equipos alcanzado</span>
      `}
    </div>

    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap:20px;">
      ${equiposList.map(eq => {
        const integrantes = (eq.integrantes || []).sort((a, b) => {
          const aIsLeader = a.rol_en_equipo && a.rol_en_equipo.toLowerCase().includes('líder') ? 1 : 0;
          const bIsLeader = b.rol_en_equipo && b.rol_en_equipo.toLowerCase().includes('líder') ? 1 : 0;
          return bIsLeader - aIsLeader;
        });
        return `
          <div class="card scale-in">
            <div class="card-header" style="display:flex; flex-direction:column; gap:12px; background:var(--celeste-50);">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; width:100%;">
                <div style="display:flex; flex-direction:column; gap:8px;">
                  <span style="font-size:24px; color:var(--celeste-dark);">${icon('truck')}</span>
                  <div>
                    <h2 style="color:var(--celeste-dark); font-weight:700; margin:0; line-height:1.2;">${escapeHtml(eq.nombre)}</h2>
                    <div style="font-size:12px; color:var(--gray-500); margin-top:2px;">${escapeHtml(eq.descripcion || 'Brigada de Paro Cardíaco')}</div>
                  </div>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-outline btn-sm" onclick="openAsignarPersonalEquipoModal(${eq.id})" title="Asignar Integrante">
                    + Asignar
                  </button>
                  <button class="btn btn-secondary btn-sm" onclick="openEquipoModal(${eq.id})" title="Editar Equipo" style="padding:4px 8px; font-size:12px;">
                    ${icon('edit')}
                  </button>
                  <button class="btn btn-outline danger btn-sm" onclick="confirmDeleteEquipo(${eq.id})" style="padding:4px 8px;" title="Eliminar Equipo">&times;</button>
                </div>
              </div>
            </div>
            <div class="card-body" style="padding:16px;">
              <h4 style="font-size:12px; text-transform:uppercase; color:var(--gray-400); margin-bottom:10px;">
                Integrantes y Roles de Brigada (${integrantes.length})
              </h4>
              ${integrantes.length === 0 ? `
                <p style="color:var(--gray-400); font-size:13px; text-align:center; padding:15px;">Sin personal asignado a este equipo.</p>
              ` : `
                <style>
                  .equipo-member-item {
                    transition: all 0.2s ease;
                    border: 1px solid transparent;
                    border-bottom: 1px solid var(--gray-100);
                    border-radius: 4px;
                    cursor: pointer;
                  }
                  .equipo-member-item:hover {
                    background-color: #e0f2fe; /* Light blue */
                    border-color: #3b82f6; /* Blue border */
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                  }
                </style>
                <ul style="list-style:none; padding:0; margin:0;">
                  ${integrantes.map(integ => {
                    const p = personalList.find(item => item.id === integ.id_personal);
                    const pName = p ? `${p.apellido}, ${p.nombre}` : `Personal #${integ.id_personal}`;
                    const pRol = p ? (p.nombre_rol || 'Personal') : 'Salud';
                    const isLeader = integ.rol_en_equipo && integ.rol_en_equipo.toLowerCase().includes('líder');
                    const initials = (p && p.nombre && p.apellido) ? (p.nombre.charAt(0) + p.apellido.charAt(0)).toUpperCase() : 'P';
                    return `
                      <li class="equipo-member-item" onclick="mostrarInfoPersonal(${p ? p.id : 'null'})" style="display:flex; justify-content:space-between; align-items:center; padding:12px 8px; min-height:64px; margin-bottom:4px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                          <div style="min-width:36px; height:36px; border-radius:50%; background:var(--celeste-100); color:var(--celeste-dark); display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:13px;">
                            ${initials}
                          </div>
                          <div>
                            <div style="font-weight:700; font-size:13px; color:var(--gray-800); line-height:1.2;">
                              ${escapeHtml(pName)} <span style="font-size:11px; color:var(--gray-500); font-weight:normal;">[${escapeHtml(pRol)}]</span>
                            </div>
                            <div style="margin-top:4px;">
                              ${isLeader ? 
                                `<span class="badge" style="background:#fef3c7;color:#d97706;border:1px solid #fde68a;font-size:10px;padding:2px 6px;">⭐ Líder de Reanimación</span>` : 
                                `<span style="color:var(--gray-400);font-size:10px;vertical-align:middle;margin-right:2px;">&#9679;</span><span style="font-size:11px; color:var(--gray-500); font-weight:600;">${escapeHtml(integ.rol_en_equipo || 'Miembro de Equipo')}</span>`
                              }
                            </div>
                          </div>
                        </div>
                        <div style="display:flex; gap:8px; align-items:center;" onclick="event.stopPropagation()">
                          <button class="btn btn-outline btn-sm" onclick="openEditarIntegranteModal(${eq.id}, ${integ.id_personal})" title="Cambiar rol en brigada" style="padding:4px 8px; font-size:11px;">Editar</button>
                          <button class="btn btn-outline danger btn-sm" onclick="showConfirmModal({ title: 'Quitar Integrante', message: '¿Seguro que desea quitar a este integrante del equipo?', onConfirm: () => removerIntegranteEquipo(${eq.id}, ${integ.id_personal}) })" title="Quitar del equipo" style="padding:4px 8px; font-size:13px;">&times;</button>
                        </div>
                      </li>
                    `;
                  }).join('')}
                </ul>
              `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// -------------------------------------------------------------
// TAB 4: TURNOS Y ASIGNACIONES (BOTONES CORRECTAMENTE UBICADOS)
// -------------------------------------------------------------
function renderTurnosTab() {
  const turnosList = getTurnos();
  const asignacionesList = getAsignacionesTurnos();

  return `
    <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
      
      <!-- Card 1: Horarios de Turnos -->
      <div class="card scale-in">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2 style="margin:0;">Horarios de Turnos (Mañana, Tarde, Noche)</h2>
            <p style="font-size:12px; color:var(--gray-500); margin:0;">Franjas horarias no solapadas</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openTurnoModal()">
            + Nuevo Turno Horario
          </button>
        </div>
        <div class="card-body" style="padding:0;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="border-bottom:2px solid var(--gray-200); background:var(--gray-50); text-align:left;">
                <th style="padding:10px 14px;">Turno</th>
                <th style="padding:10px 14px;">Hora Inicio</th>
                <th style="padding:10px 14px;">Hora Fin</th>
                <th style="padding:10px 14px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${turnosList.map(t => `
                <tr style="border-bottom:1px solid var(--gray-100);">
                  <td style="padding:10px 14px; font-weight:700;">${escapeHtml(t.nombre)}</td>
                  <td style="padding:10px 14px; color:var(--gray-600);">${t.hora_inicio}</td>
                  <td style="padding:10px 14px; color:var(--gray-600);">${t.hora_fin}</td>
                  <td style="padding:10px 14px;">
                    <div style="display:flex; gap:6px;">
                      <button class="action-link" onclick="openTurnoModal(${t.id})">Editar</button>
                      <button class="action-link danger" onclick="confirmDeleteTurno(${t.id})">Eliminar</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Card 2: Asignación de Equipos a Turnos -->
      <div class="card scale-in">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h2 style="margin:0;">Asignación de Equipos a Turnos</h2>
            <p style="font-size:12px; color:var(--gray-500); margin:0;">Regla 1 a 1: 1 equipo por turno</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="openAsignacionTurnoModal()" style="background:var(--celeste); border:none;">
            ${icon('calendar')} Asignar Turno a Equipo
          </button>
        </div>
        <div class="card-body" style="padding:0;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="border-bottom:2px solid var(--gray-200); background:var(--gray-50); text-align:left;">
                <th style="padding:10px 14px;">Equipo</th>
                <th style="padding:10px 14px;">Turno</th>
                <th style="padding:10px 14px;">Vigencia (Desde - Hasta)</th>
                <th style="padding:10px 14px;">Acción</th>
              </tr>
            </thead>
            <tbody>
              ${asignacionesList.length === 0 ? `
                <tr><td colspan="4" style="text-align:center; padding:20px; color:var(--gray-400);">Sin asignaciones registradas.</td></tr>
              ` : asignacionesList.map(asig => `
                <tr style="border-bottom:1px solid var(--gray-100);">
                  <td style="padding:10px 14px; font-weight:700; color:var(--celeste-dark);">${escapeHtml(asig.equipo_nombre)}</td>
                  <td style="padding:10px 14px; font-weight:600;">${escapeHtml(asig.turno_nombre)}</td>
                  <td style="padding:10px 14px; font-size:12px; color:var(--gray-600);">
                    ${asig.fecha_desde} &rarr; ${asig.fecha_hasta || 'Indefinido'}
                  </td>
                  <td style="padding:10px 14px;">
                    <button class="action-link danger" onclick="deleteAsignacionTurno(${asig.id})">Quitar</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function setPersonalTab(tabName) {
  personalTabState.currentTab = tabName;
  renderApp();
}

function setupPersonal() {
  const search = document.getElementById('personal-search');
  const rolFilter = document.getElementById('personal-rol-filter');

  if (search) {
    search.addEventListener('input', (e) => {
      personalTabState.searchPersonal = e.target.value;
      const cursorPosition = e.target.selectionStart;
      renderApp();
      requestAnimationFrame(() => {
        const reSearch = document.getElementById('personal-search');
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    });
  }

  if (rolFilter) {
    rolFilter.addEventListener('change', () => {
      personalTabState.filterRol = rolFilter.value;
      renderApp();
    });
  }
}

// ==========================================
// MODALES Y VALIDACIONES ESTRICTAS
// ==========================================

// 1. Modal Alta / Edición de Personal con Filtro de Áreas y opción 'Sin Designar'
function openPersonalModal(editId = null) {
  const isEdit = editId !== null;
  const personalList = getPersonalSalud();
  const rolesList = getRolesSalud();
  const areasList = getAreas();
  const pers = isEdit ? personalList.find(p => p.id === editId) : null;

  document.querySelector('.pers-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active pers-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:540px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon(isEdit ? 'edit' : 'user')} ${isEdit ? 'Editar Personal de Salud' : 'Registrar Personal de Salud'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.pers-modal-overlay').remove()">&times;</button>
      </div>

      <form id="personal-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label>Apellido *</label>
              <input type="text" id="p-apellido" required placeholder="Ej: Méndez" value="${pers ? escapeHtml(pers.apellido) : ''}" />
            </div>
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" id="p-nombre" required placeholder="Ej: Carlos" value="${pers ? escapeHtml(pers.nombre) : ''}" />
            </div>
          </div>

          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
            <div class="form-group">
              <label>DNI / Documento *</label>
              <input type="text" id="p-dni" required placeholder="Ej: 28.345.678" value="${pers ? escapeHtml(pers.dni) : ''}" />
            </div>
            <div class="form-group">
              <label>Teléfono / Interno</label>
              <input type="text" id="p-tel" placeholder="Ej: 11-4567-8901" value="${pers ? escapeHtml(pers.telefono || '') : ''}" />
            </div>
          </div>

          <!-- ROL DE SALUD (CON OPCIÓN SIN DESIGNAR) -->
          <div class="form-group" style="margin-bottom:12px;">
            <label style="color:var(--celeste-dark); font-weight:700;">Rol de Salud Institucional *</label>
            <select id="p-rol" required style="border:2px solid var(--celeste-300); font-weight:600;">
              <option value="Sin Designar" ${pers && (pers.nombre_rol === 'Sin Designar' || !pers.id_rol_profesional) ? 'selected' : ''}>Sin Designar</option>
              ${rolesList.map(r => `
                <option value="${r.id}" data-nombre="${escapeHtml(r.nombre_rol)}" ${pers && pers.id_rol_profesional === r.id ? 'selected' : ''}>
                  ${escapeHtml(r.nombre_rol)}
                </option>
              `).join('')}
            </select>
          </div>

          <!-- ÁREA ASIGNADA (CON TODAS LAS ÁREAS DISPONIBLES + BUSCADOR EN VIVO + SIN DESIGNAR) -->
          <div class="form-group">
            <label style="color:var(--celeste-dark); font-weight:700;">Área / Servicio Asignado *</label>
            <div class="search-input-wrapper" style="margin-bottom:6px;">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="filter-pers-area" placeholder="Filtrar área en tiempo real..." style="font-size:12px; padding:6px 10px 6px 36px; border:1px solid var(--gray-300); border-radius:6px; width:100%;" />
            </div>
            <select id="p-area" required style="font-weight:600;">
              <option value="Sin Designar" ${pers && (!pers.area || pers.area === 'Sin Designar') ? 'selected' : ''}>Sin Designar</option>
              ${areasList.map(a => `
                <option value="${escapeHtml(a.nombre)}" ${pers && pers.area === a.nombre ? 'selected' : ''}>
                  ${icon('building')} ${escapeHtml(a.nombre)}
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.pers-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Guardar Personal</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  // Filtro en tiempo real para Áreas (sin importar tildes)
  const filterAreaInput = document.getElementById('filter-pers-area');
  const areaSelect = document.getElementById('p-area');
  if (filterAreaInput && areaSelect) {
    filterAreaInput.addEventListener('input', () => {
      const q = normalizeText(filterAreaInput.value);
      Array.from(areaSelect.options).forEach(opt => {
        const text = normalizeText(opt.text);
        opt.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });
  }

  document.getElementById('personal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const apellido = document.getElementById('p-apellido').value.trim();
    const nombre = document.getElementById('p-nombre').value.trim();
    const dni = document.getElementById('p-dni').value.trim();
    const telefono = document.getElementById('p-tel').value.trim();
    const rolSelect = document.getElementById('p-rol');
    
    let id_rol_profesional = null;
    let nombre_rol = 'Sin Designar';
    if (rolSelect.value !== 'Sin Designar') {
      id_rol_profesional = parseInt(rolSelect.value);
      nombre_rol = rolSelect.options[rolSelect.selectedIndex]?.getAttribute('data-nombre') || 'Personal de Salud';
    }

    const area = document.getElementById('p-area').value;

    if (!apellido || !nombre || !dni) {
      showToast('Complete todos los campos obligatorios (*)', 'error');
      return;
    }

    const currentList = getPersonalSalud();

    if (isEdit) {
      const idx = currentList.findIndex(p => p.id === editId);
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], apellido, nombre, dni, telefono, id_rol_profesional, nombre_rol, area };
        savePersonalSalud(currentList);
        showToast('Personal actualizado con éxito', 'success');
      }
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map(p => p.id)) + 1 : 1;
      currentList.push({ id: newId, apellido, nombre, dni, telefono, id_rol_profesional, nombre_rol, area });
      savePersonalSalud(currentList);
      showToast('Personal de salud registrado exitosamente', 'success');
    }

    document.querySelector('.pers-modal-overlay')?.remove();
    renderApp();
  });
}

function confirmDeletePersonal(id) {
  const personalList = getPersonalSalud();
  const pers = personalList.find(p => p.id === id);
  if (!pers) return;

  showConfirmModal({
    title: 'Eliminar Personal de Salud',
    message: `¿Está seguro de eliminar a <strong>${escapeHtml(pers.apellido)}, ${escapeHtml(pers.nombre)}</strong> del registro de personal?`,
    onConfirm: () => {
      const rest = personalList.filter(p => p.id !== id);
      savePersonalSalud(rest);
      showToast('Personal eliminado correctamente', 'success');
      renderApp();
    }
  });
}

// 2. Modal Alta / Edición de Rol de Salud
function openRolModal(editId = null) {
  const isEdit = editId !== null;
  const rolesList = getRolesSalud();
  const rol = isEdit ? rolesList.find(r => r.id === editId) : null;

  document.querySelector('.rol-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active rol-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon('tag')} ${isEdit ? 'Editar Rol de Salud' : 'Nuevo Rol de Salud'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.rol-modal-overlay').remove()">&times;</button>
      </div>

      <form id="rol-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Nombre del Rol de Salud *</label>
            <input type="text" id="r-nombre" required placeholder="Ej: Cardiólogo, Kinesiólogo, Enfermero/a" value="${rol ? escapeHtml(rol.nombre_rol) : ''}" />
          </div>
          <div class="form-group">
            <label>Descripción / Responsabilidades</label>
            <textarea id="r-desc" rows="2" placeholder="Funciones principales del rol...">${rol ? escapeHtml(rol.descripcion || '') : ''}</textarea>
          </div>
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.rol-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">${isEdit ? 'Guardar Cambios' : 'Crear Rol'}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('rol-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre_rol = document.getElementById('r-nombre').value.trim();
    const descripcion = document.getElementById('r-desc').value.trim();

    if (!nombre_rol) return;

    const currentRoles = getRolesSalud();

    if (isEdit) {
      const idx = currentRoles.findIndex(r => r.id === editId);
      if (idx !== -1) {
        currentRoles[idx] = { ...currentRoles[idx], nombre_rol, descripcion };
        saveRolesSalud(currentRoles);
        showToast('Rol de salud actualizado', 'success');
      }
    } else {
      if (currentRoles.some(r => r.nombre_rol.toLowerCase() === nombre_rol.toLowerCase())) {
        showToast('Ya existe un rol con ese nombre', 'error');
        return;
      }
      const newId = currentRoles.length > 0 ? Math.max(...currentRoles.map(r => r.id)) + 1 : 1;
      currentRoles.push({ id: newId, nombre_rol, descripcion });
      saveRolesSalud(currentRoles);
      showToast('Rol de salud creado con éxito', 'success');
    }

    document.querySelector('.rol-modal-overlay')?.remove();
    renderApp();
  });
}

function confirmDeleteRol(id) {
  const rolesList = getRolesSalud();
  const rol = rolesList.find(r => r.id === id);
  if (!rol) return;

  const personalList = getPersonalSalud();
  const asignados = personalList.filter(p => p.id_rol_profesional === id || p.nombre_rol === rol.nombre_rol);

  if (asignados.length > 0) {
    showConfirmModal({
      title: 'Bloqueo de Seguridad: Rol en Uso',
      message: `${icon('alertTriangle')} No se puede eliminar el rol <strong>"${escapeHtml(rol.nombre_rol)}"</strong> porque hay <strong>${asignados.length} profesional(es)</strong> asignados a este rol.<br><br>Debe reasignar el rol de esos profesionales antes de poder eliminarlo.`,
      isAlertOnly: true
    });
    return;
  }

  showConfirmModal({
    title: 'Eliminar Rol de Salud',
    message: `¿Está seguro de eliminar el rol <strong>"${escapeHtml(rol.nombre_rol)}"</strong>?`,
    onConfirm: () => {
      const rest = rolesList.filter(r => r.id !== id);
      saveRolesSalud(rest);
      showToast('Rol de salud eliminado', 'success');
      renderApp();
    }
  });
}

// 3. Modal Alta / Edición de Equipo (MÁXIMO 3 EQUIPOS)
function openEquipoModal(editId = null) {
  const isEdit = editId !== null;
  const currentEquipos = getEquipos();

  if (!isEdit && currentEquipos.length >= 3) {
    showConfirmModal({
      title: 'Límite de Equipos Alcanzado',
      message: `${icon('alertTriangle')} El hospital cuenta con un límite máximo de <strong>3 Equipos de Emergencia</strong> (Equipo A, Equipo B y Equipo C).<br><br>No se pueden crear más de 3 equipos en simultáneo.`,
      isAlertOnly: true
    });
    return;
  }

  const eq = isEdit ? currentEquipos.find(e => e.id === editId) : null;

  document.querySelector('.equipo-form-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active equipo-form-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon(isEdit ? 'edit' : 'truck')} ${isEdit ? 'Editar Equipo de Emergencia' : 'Nuevo Equipo de Emergencia'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.equipo-form-overlay').remove()">&times;</button>
      </div>

      <form id="equipo-crear-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Nombre del Equipo *</label>
            <input type="text" id="eq-nom" required placeholder="Ej: Equipo C" value="${eq ? escapeHtml(eq.nombre) : ''}" />
          </div>
          <div class="form-group">
            <label>Descripción / Sector</label>
            <input type="text" id="eq-desc" placeholder="Ej: Brigada de Urgencias y Terapia" value="${eq ? escapeHtml(eq.descripcion || '') : ''}" />
          </div>
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.equipo-form-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">${isEdit ? 'Guardar Cambios' : 'Crear Equipo'}</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('equipo-crear-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('eq-nom').value.trim();
    const descripcion = document.getElementById('eq-desc').value.trim();

    if (!nombre) return;

    const list = getEquipos();

    if (isEdit) {
      const idx = list.findIndex(e => e.id === editId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], nombre, descripcion };
        saveEquipos(list);
        showToast('Equipo actualizado con éxito', 'success');
      }
    } else {
      if (list.some(e => (typeof e === 'string' ? e : e.nombre).toLowerCase() === nombre.toLowerCase())) {
        showToast('Ya existe un equipo con ese nombre', 'error');
        return;
      }
      const newId = list.length > 0 ? Math.max(...list.map(e => e.id || 1)) + 1 : 1;
      list.push({ id: newId, nombre, descripcion, integrantes: [] });
      saveEquipos(list);
      showToast('Equipo creado exitosamente', 'success');
    }

    document.querySelector('.equipo-form-overlay')?.remove();
    renderApp();
  });
}

function confirmDeleteEquipo(id) {
  const equiposList = getEquipos();
  const eq = equiposList.find(e => e.id === id);
  if (!eq) return;

  showConfirmModal({
    title: 'Eliminar Equipo de Emergencia',
    message: `¿Está seguro de eliminar el <strong>"${escapeHtml(eq.nombre)}"</strong>?`,
    onConfirm: () => {
      const rest = equiposList.filter(e => e.id !== id);
      saveEquipos(rest);
      showToast('Equipo eliminado', 'success');
      renderApp();
    }
  });
}

// 4. Modal Asignar Personal a Equipo (Filtro en tiempo real y ocultar los que ya tienen equipo)
function openAsignarPersonalEquipoModal(equipoId) {
  const equiposList = getEquipos();
  const eq = equiposList.find(e => e.id === equipoId);
  if (!eq) return;

  const personalList = getPersonalSalud();

  // Filtrar ÚNICAMENTE al personal que NO está en ningún equipo actualmente
  const availablePersonal = personalList.filter(pers => {
    return !equiposList.some(otherEq => Array.isArray(otherEq.integrantes) && otherEq.integrantes.some(i => i.id_personal === pers.id));
  });

  document.querySelector('.asig-pers-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active asig-pers-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:520px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--celeste-light);">
        <div>
          <h2 style="font-size:18px; font-weight:700; color:var(--celeste-dark); margin:0;">Asignar Integrante a ${escapeHtml(eq.nombre)}</h2>
          <p style="font-size:12px; color:var(--gray-600); margin:0;">Mostrando solo profesionales sin equipo asignado</p>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.asig-pers-modal-overlay').remove()">&times;</button>
      </div>

      <form id="asig-pers-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Buscar y Seleccionar Profesional *</label>
            <div class="search-input-wrapper" style="position:relative; margin-bottom:0;">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:12px; top:11px; width:16px; color:var(--gray-400);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="filter-asig-pers-input" placeholder="Escriba para filtrar por nombre o rol..." autocomplete="off" style="font-size:13px; padding:10px 10px 10px 36px; border:1.5px solid var(--gray-300); border-radius:6px; width:100%; transition:border-color 0.2s;" />
              <input type="hidden" id="asig-p-id" required />
              
              <ul id="custom-pers-dropdown" style="display:none; position:absolute; top:100%; left:0; width:100%; max-height:220px; overflow-y:auto; background:white; border:1px solid var(--gray-200); border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); margin:4px 0 0 0; padding:0; list-style:none; z-index:10;">
                ${availablePersonal.length === 0 ? `
                  <li style="padding:12px; color:var(--gray-500); font-size:13px; text-align:center;">${icon('alertTriangle')} No hay personal libre</li>
                ` : availablePersonal.map(pers => `
                  <li class="custom-pers-option" data-value="${pers.id}" data-text="${escapeHtml(pers.apellido + ' ' + pers.nombre + ' ' + (pers.nombre_rol || ''))}" style="padding:10px 12px; border-bottom:1px solid var(--gray-100); cursor:pointer; font-size:13px; transition:background 0.2s;">
                    <div style="font-weight:600; color:var(--gray-800);">${escapeHtml(pers.apellido)}, ${escapeHtml(pers.nombre)}</div>
                    <div style="font-size:11px; color:var(--gray-500); margin-top:2px;">[${escapeHtml(pers.nombre_rol || 'Personal')}] (${escapeHtml(pers.area || 'Guardia')})</div>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>

          <div class="form-group">
            <label>Rol en la Brigada de Código Azul *</label>
            <select id="asig-p-rol" required>
              <option value="Médico Líder (Team Leader / Vía Aérea)">Médico Líder (Team Leader / Vía Aérea)</option>
              <option value="Compresiones Torácicas & Desfibrilador">Compresiones Torácicas & Desfibrilador</option>
              <option value="Acceso Vascular & Fármacos IV">Acceso Vascular & Fármacos IV</option>
              <option value="Registro, Tiempos & Cronómetro">Registro, Tiempos & Cronómetro</option>
              <option value="Apoyo y Logística">Apoyo y Logística</option>
            </select>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.asig-pers-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm" ${availablePersonal.length === 0 ? 'disabled' : ''}>Asignar al Equipo</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  // Filtro en tiempo real y combobox
  const filterInput = document.getElementById('filter-asig-pers-input');
  const hiddenPersId = document.getElementById('asig-p-id');
  const dropdownList = document.getElementById('custom-pers-dropdown');
  
  if (filterInput && dropdownList) {
    const options = dropdownList.querySelectorAll('.custom-pers-option');
    
    filterInput.addEventListener('focus', () => {
      dropdownList.style.display = 'block';
      filterInput.style.borderColor = 'var(--celeste-main)';
    });
    
    filterInput.addEventListener('blur', () => {
      setTimeout(() => {
        dropdownList.style.display = 'none';
        filterInput.style.borderColor = 'var(--gray-300)';
      }, 150);
    });
    
    filterInput.addEventListener('input', () => {
      const q = normalizeText(filterInput.value);
      hiddenPersId.value = ''; // Se borra la selección al seguir escribiendo
      options.forEach(opt => {
        const text = normalizeText(opt.getAttribute('data-text'));
        opt.style.display = (!q || text.includes(q)) ? 'block' : 'none';
      });
      dropdownList.style.display = 'block';
    });
    
    options.forEach(opt => {
      opt.addEventListener('mouseenter', () => opt.style.backgroundColor = 'var(--gray-50)');
      opt.addEventListener('mouseleave', () => opt.style.backgroundColor = 'transparent');
      
      opt.addEventListener('mousedown', (e) => {
        e.preventDefault(); // previene que el input pierda foco antes de capturar el click
        hiddenPersId.value = opt.getAttribute('data-value');
        filterInput.value = opt.querySelector('div').innerText;
        dropdownList.style.display = 'none';
      });
    });
  }

  document.getElementById('asig-pers-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id_personal = parseInt(document.getElementById('asig-p-id').value);
    const rol_en_equipo = document.getElementById('asig-p-rol').value;

    if (!id_personal) {
      showToast('Seleccione un profesional', 'error');
      return;
    }

    const currentEquipos = getEquipos();
    const equipoTarget = currentEquipos.find(item => item.id === equipoId);
    if (!equipoTarget) return;

    if (!Array.isArray(equipoTarget.integrantes)) {
      equipoTarget.integrantes = [];
    }

    equipoTarget.integrantes.push({ id_personal, rol_en_equipo });
    saveEquipos(currentEquipos);
    showToast(`Profesional asignado a ${equipoTarget.nombre} con éxito`, 'success');

    document.querySelector('.asig-pers-modal-overlay')?.remove();
    renderApp();
  });
}

// Modal Editar Rol del Integrante dentro del Equipo
function openEditarIntegranteModal(equipoId, personalId) {
  const currentEquipos = getEquipos();
  const eq = currentEquipos.find(e => e.id === equipoId);
  if (!eq) return;

  const member = (eq.integrantes || []).find(i => i.id_personal === personalId);
  if (!member) return;

  const personalList = getPersonalSalud();
  const pers = personalList.find(p => p.id === personalId) || { apellido: 'Personal', nombre: `#${personalId}` };

  document.querySelector('.edit-integ-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active edit-integ-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--celeste-light);">
        <h2 style="font-size:18px; font-weight:700; color:var(--celeste-dark); margin:0;">
          ${icon('star')} Rol de ${escapeHtml(pers.apellido)}, ${escapeHtml(pers.nombre)}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.edit-integ-overlay').remove()">&times;</button>
      </div>

      <form id="edit-integ-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group">
            <label>Función en la Brigada ACLS (${escapeHtml(eq.nombre)}) *</label>
            <select id="edit-rol-val" required>
              <option value="Médico Líder (Team Leader / Vía Aérea)" ${member.rol_en_equipo.includes('Líder') ? 'selected' : ''}>Médico Líder (Team Leader / Vía Aérea)</option>
              <option value="Compresiones Torácicas & Desfibrilador" ${member.rol_en_equipo.includes('Compresiones') ? 'selected' : ''}>Compresiones Torácicas & Desfibrilador</option>
              <option value="Acceso Vascular & Fármacos IV" ${member.rol_en_equipo.includes('Vascular') ? 'selected' : ''}>Acceso Vascular & Fármacos IV</option>
              <option value="Registro, Tiempos & Cronómetro" ${member.rol_en_equipo.includes('Registro') ? 'selected' : ''}>Registro, Tiempos & Cronómetro</option>
              <option value="Apoyo y Logística" ${member.rol_en_equipo.includes('Apoyo') ? 'selected' : ''}>Apoyo y Logística</option>
            </select>
          </div>
        </div>
        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.edit-integ-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Actualizar Rol</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('edit-integ-form').addEventListener('submit', (e) => {
    e.preventDefault();
    member.rol_en_equipo = document.getElementById('edit-rol-val').value;
    saveEquipos(currentEquipos);
    showToast('Rol de brigada actualizado', 'success');

    document.querySelector('.edit-integ-overlay')?.remove();
    renderApp();
  });
}

function removerIntegranteEquipo(equipoId, personalId) {
  const currentEquipos = getEquipos();
  const eq = currentEquipos.find(e => e.id === equipoId);
  if (eq && Array.isArray(eq.integrantes)) {
    eq.integrantes = eq.integrantes.filter(i => i.id_personal !== personalId);
    saveEquipos(currentEquipos);
    showToast('Integrante desvinculado del equipo', 'success');
    renderApp();
  }
}

// 5. Modal Alta / Edición de Turno
function openTurnoModal(editId = null) {
  const isEdit = editId !== null;
  const turnosList = getTurnos();
  const turno = isEdit ? turnosList.find(t => t.id === editId) : null;

  document.querySelector('.turno-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active turno-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon('clock', 18)} ${isEdit ? 'Editar Turno Horario' : 'Nuevo Turno Horario'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.turno-modal-overlay').remove()">&times;</button>
      </div>

      <form id="turno-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Nombre del Turno *</label>
            <input type="text" id="t-nombre" required placeholder="Ej: Turno Mañana / Tarde / Noche" value="${turno ? escapeHtml(turno.nombre) : ''}" />
          </div>

          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Hora de Inicio *</label>
              <input type="time" id="t-inicio" required value="${turno ? turno.hora_inicio : '06:00'}" />
            </div>
            <div class="form-group">
              <label>Hora de Fin *</label>
              <input type="time" id="t-fin" required value="${turno ? turno.hora_fin : '14:00'}" />
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.turno-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Guardar Turno</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('turno-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('t-nombre').value.trim();
    const hora_inicio = document.getElementById('t-inicio').value;
    const hora_fin = document.getElementById('t-fin').value;

    if (!nombre || !hora_inicio || !hora_fin) return;

    if (hora_inicio === hora_fin) {
      showToast('La hora de inicio y fin no pueden ser idénticas', 'error');
      return;
    }

    const currentTurnos = getTurnos();

    // VALIDACIÓN DE SOLAPAMIENTO HORARIO
    const conflicto = currentTurnos.find(other => {
      if (isEdit && other.id === editId) return false;
      const [hI1, mI1] = hora_inicio.split(':').map(Number);
      const [hF1, mF1] = hora_fin.split(':').map(Number);
      const [hI2, mI2] = other.hora_inicio.split(':').map(Number);
      const [hF2, mF2] = other.hora_fin.split(':').map(Number);

      const minI1 = hI1 * 60 + mI1;
      const minF1 = hF1 * 60 + mF1;
      const minI2 = hI2 * 60 + mI2;
      const minF2 = hF2 * 60 + mF2;

      return (minI1 < minF2 && minF1 > minI2);
    });

    if (conflicto) {
      showToast(`${icon('alertTriangle')} Conflicto horario con "${conflicto.nombre}" (${conflicto.hora_inicio} - ${conflicto.hora_fin}). No puede haber 2 turnos a la misma hora.`, 'error');
      return;
    }

    if (isEdit) {
      const idx = currentTurnos.findIndex(t => t.id === editId);
      if (idx !== -1) {
        currentTurnos[idx] = { ...currentTurnos[idx], nombre, hora_inicio, hora_fin };
        saveTurnos(currentTurnos);
        showToast('Turno actualizado con éxito', 'success');
      }
    } else {
      const newId = currentTurnos.length > 0 ? Math.max(...currentTurnos.map(t => t.id)) + 1 : 1;
      currentTurnos.push({ id: newId, nombre, hora_inicio, hora_fin });
      saveTurnos(currentTurnos);
      showToast('Turno horario registrado', 'success');
    }

    document.querySelector('.turno-modal-overlay')?.remove();
    renderApp();
  });
}

function confirmDeleteTurno(id) {
  const turnosList = getTurnos();
  const turno = turnosList.find(t => t.id === id);
  if (!turno) return;

  showConfirmModal({
    title: 'Eliminar Turno Horario',
    message: `¿Está seguro de eliminar el <strong>"${escapeHtml(turno.nombre)}"</strong>?`,
    onConfirm: () => {
      const rest = turnosList.filter(t => t.id !== id);
      saveTurnos(rest);
      showToast('Turno eliminado', 'success');
      renderApp();
    }
  });
}

// 6. Modal Asignar Equipo a Turno (VALIDACIÓN ESTRICTA 1 a 1: UN EQUIPO POR TURNO)
function openAsignacionTurnoModal() {
  const equiposList = getEquipos();
  const turnosList = getTurnos();
  const asignacionesList = getAsignacionesTurnos();

  document.querySelector('.asig-turno-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active asig-turno-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  const todayStr = new Date().toISOString().slice(0, 10);

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:500px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--celeste-light);">
        <div>
          <h2 style="font-size:18px; font-weight:700; color:var(--celeste-dark); margin:0;">${icon('calendar')} Asignar Equipo a Turno</h2>
          <p style="font-size:12px; color:var(--gray-600); margin:0;">Regla: 1 equipo por turno y 1 turno por equipo</p>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.asig-turno-modal-overlay').remove()">&times;</button>
      </div>

      <form id="asig-turno-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Equipo de Emergencia *</label>
            <select id="asig-t-equipo" required>
              <option value="">-- Seleccionar Equipo --</option>
              ${equiposList.map(eq => {
                const yaAsignado = asignacionesList.find(a => a.id_equipo === eq.id);
                return `
                  <option value="${eq.id}" data-nombre="${escapeHtml(eq.nombre)}" ${yaAsignado ? 'disabled style="color:#9ca3af;"' : ''}>
                    ${escapeHtml(eq.nombre)} ${yaAsignado ? `— [Ya asignado a ${escapeHtml(yaAsignado.turno_nombre)}]` : '— [Disponible]'}
                  </option>
                `;
              }).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label>Turno Horario *</label>
            <select id="asig-t-turno" required>
              <option value="">-- Seleccionar Turno --</option>
              ${turnosList.map(t => {
                const turnoOcupado = asignacionesList.find(a => a.id_turno === t.id);
                return `
                  <option value="${t.id}" data-nombre="${escapeHtml(t.nombre)}" ${turnoOcupado ? 'disabled style="color:#9ca3af;"' : ''}>
                    ${escapeHtml(t.nombre)} (${t.hora_inicio} - ${t.hora_fin}) ${turnoOcupado ? `— [Cubierto por ${escapeHtml(turnoOcupado.equipo_nombre)}]` : '— [Disponible]'}
                  </option>
                `;
              }).join('')}
            </select>
          </div>

          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div class="form-group">
              <label>Fecha Desde *</label>
              <input type="date" id="asig-t-desde" required value="${todayStr}" />
            </div>
            <div class="form-group">
              <label>Fecha Hasta (Opcional)</label>
              <input type="date" id="asig-t-hasta" />
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.asig-turno-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Guardar Asignación</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('asig-turno-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const eqSelect = document.getElementById('asig-t-equipo');
    const id_equipo = parseInt(eqSelect.value);
    const equipo_nombre = eqSelect.options[eqSelect.selectedIndex]?.getAttribute('data-nombre');

    const turnoSelect = document.getElementById('asig-t-turno');
    const id_turno = parseInt(turnoSelect.value);
    const turno_nombre = turnoSelect.options[turnoSelect.selectedIndex]?.getAttribute('data-nombre');

    const fecha_desde = document.getElementById('asig-t-desde').value;
    const fecha_hasta = document.getElementById('asig-t-hasta').value;

    if (!id_equipo || !id_turno) {
      showToast('Seleccione equipo y turno disponibles', 'error');
      return;
    }

    const currentAsignaciones = getAsignacionesTurnos();

    // VALIDACIÓN ESTRICTA: No duplicar equipo ni turno
    const equipoOcupado = currentAsignaciones.find(a => a.id_equipo === id_equipo);
    if (equipoOcupado) {
      showToast(`${icon('alertTriangle')} El "${equipo_nombre}" ya está asignado al ${equipoOcupado.turno_nombre}. Un equipo no puede estar en dos turnos.`, 'error');
      return;
    }

    const turnoOcupado = currentAsignaciones.find(a => a.id_turno === id_turno);
    if (turnoOcupado) {
      showToast(`${icon('alertTriangle')} El "${turno_nombre}" ya está cubierto por ${turnoOcupado.equipo_nombre}. Dos equipos no pueden estar en el mismo turno.`, 'error');
      return;
    }

    const newId = currentAsignaciones.length > 0 ? Math.max(...currentAsignaciones.map(a => a.id)) + 1 : 1;

    currentAsignaciones.push({
      id: newId,
      id_equipo,
      equipo_nombre,
      id_turno,
      turno_nombre,
      fecha_desde,
      fecha_hasta
    });

    saveAsignacionesTurnos(currentAsignaciones);
    showToast('Asignación de turno guardada con éxito', 'success');

    document.querySelector('.asig-turno-modal-overlay')?.remove();
    renderApp();
  });
}

function deleteAsignacionTurno(id) {
  let currentList = getAsignacionesTurnos();
  currentList = currentList.filter(a => a.id !== id);
  saveAsignacionesTurnos(currentList);
  showToast('Asignación eliminada');
  renderApp();
}

// Modal Genérico Reutilizable de Confirmación de Eliminación
function showConfirmModal({ title, message, onConfirm, isAlertOnly = false }) {
  document.querySelector('.confirm-dialog-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active confirm-dialog-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:440px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:${isAlertOnly ? '#fef3c7' : '#fee2e2'};">
        <h3 style="font-size:17px; font-weight:800; color:${isAlertOnly ? '#92400e' : '#991b1b'}; margin:0;">
          ${icon(isAlertOnly ? 'alertTriangle' : 'trash')} ${escapeHtml(title)}
        </h3>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.confirm-dialog-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body" style="padding:20px 24px; font-size:13.5px; color:var(--gray-700); line-height:1.5;">
        ${message}
      </div>
      <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        ${isAlertOnly ? `
          <button class="btn btn-primary btn-sm" onclick="this.closest('.confirm-dialog-overlay').remove()">Aceptar</button>
        ` : `
          <button class="btn btn-secondary btn-sm" onclick="this.closest('.confirm-dialog-overlay').remove()">Cancelar</button>
          <button class="btn btn-sm" id="btn-confirm-action" style="background:#dc2626; color:#fff; font-weight:700;">Eliminar Definitivamente</button>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  if (!isAlertOnly && typeof onConfirm === 'function') {
    document.getElementById('btn-confirm-action')?.addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });
  }
}

// Exponer en window para onclicks
window.openPersonalModal = openPersonalModal;
window.confirmDeletePersonal = confirmDeletePersonal;
window.openRolModal = openRolModal;
window.confirmDeleteRol = confirmDeleteRol;
window.openEquipoModal = openEquipoModal;
window.confirmDeleteEquipo = confirmDeleteEquipo;
window.openAsignarPersonalEquipoModal = openAsignarPersonalEquipoModal;
window.openEditarIntegranteModal = openEditarIntegranteModal;
window.removerIntegranteEquipo = removerIntegranteEquipo;
window.openTurnoModal = openTurnoModal;
window.confirmDeleteTurno = confirmDeleteTurno;
window.openAsignacionTurnoModal = openAsignacionTurnoModal;
window.deleteAsignacionTurno = deleteAsignacionTurno;
window.showConfirmModal = showConfirmModal;

function mostrarInfoPersonal(id) {
  if (!id) return;
  const p = getPersonalSalud().find(item => item.id === id);
  if (!p) return;
  
  document.querySelector('.info-personal-overlay')?.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active info-personal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';
  
  const initials = (p.nombre.charAt(0) + p.apellido.charAt(0)).toUpperCase();
  
  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:400px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:flex-start; padding:24px 24px 0 24px; border:none; background:var(--white);">
        <div style="display:flex; align-items:center; gap:16px;">
          <div style="min-width:56px; height:56px; border-radius:50%; background:var(--celeste-100); color:var(--celeste-dark); display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:20px;">
            ${initials}
          </div>
          <div>
            <h2 style="font-size:20px; font-weight:700; color:var(--gray-900); margin:0;">${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</h2>
            <div style="font-size:14px; color:var(--celeste-dark); font-weight:600; margin-top:4px;">${escapeHtml(p.nombre_rol || 'Personal de Salud')}</div>
          </div>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400); margin-top:-8px; margin-right:-8px;" onclick="this.closest('.info-personal-overlay').remove()">&times;</button>
      </div>
      
      <div class="modal-body" style="padding:24px;">
        <div style="display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <span style="font-size:12px; color:var(--gray-500); text-transform:uppercase; font-weight:600;">Documento (DNI)</span>
            <span style="font-size:15px; color:var(--gray-800);">${escapeHtml(p.dni || 'No registrado')}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <span style="font-size:12px; color:var(--gray-500); text-transform:uppercase; font-weight:600;">Especialidad / Rol Base</span>
            <span style="font-size:15px; color:var(--gray-800);">${escapeHtml(p.nombre_rol || 'No asignado')}</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <span style="font-size:12px; color:var(--gray-500); text-transform:uppercase; font-weight:600;">Estado en Sistema</span>
            <span style="font-size:15px; color:#059669; font-weight:600; display:flex; align-items:center; gap:6px;">
              <span style="width:8px; height:8px; border-radius:50%; background:#10b981;"></span> Activo
            </span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer" style="padding:16px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50); display:flex; justify-content:center;">
        <button class="btn btn-primary" style="width:100%;" onclick="this.closest('.info-personal-overlay').remove()">Cerrar</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

window.mostrarInfoPersonal = mostrarInfoPersonal;