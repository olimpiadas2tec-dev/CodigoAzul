let pacientesState = {
  search: '',
  area: '',
  activo: 'true',
  sinCama: false
};

function renderPacientes() {
  const pacientesList = getPacientes();
  const personalList = getPersonalSalud();

  let filtered = pacientesList;

  if (pacientesState.search) {
    const s = normalizeText(pacientesState.search);
    filtered = filtered.filter(p => 
      normalizeText(`${p.nombre} ${p.apellido}`).includes(s) ||
      normalizeText(`${p.apellido} ${p.nombre}`).includes(s) ||
      (p.dni && normalizeText(p.dni).includes(s)) ||
      (p.causa && normalizeText(p.causa).includes(s)) ||
      (p.area && normalizeText(p.area).includes(s))
    );
  }

  if (pacientesState.area) {
    filtered = filtered.filter(p => p.area === pacientesState.area);
  }

  if (pacientesState.activo !== '') {
    const isActivo = pacientesState.activo === 'true';
    filtered = filtered.filter(p => p.activo === isActivo);
  }

  if (pacientesState.sinCama) {
    filtered = filtered.filter(p => !p.cama || p.cama === '' || p.cama === 'Sin Cama' || p.cama.toLowerCase().includes('sin cama'));
  }

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Gestión de Pacientes</h1>
        <p>Alta, edición, camas asignadas y antecedentes clínicos de pacientes hospitalizados</p>
      </div>
      ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
        <button class="btn btn-primary btn-sm" onclick="openPacienteModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Paciente
        </button>
      `}
    </div>

    <div class="page-body">
      <div class="card scale-in">
        <div class="card-body" style="padding-bottom:0;">
          <div class="filters-bar" style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; width:100%;">
            <div class="search-input-wrapper" style="flex:1; min-width:160px;">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:14px; height:14px; left:10px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="paciente-search" placeholder="Filtrar por nombre, DNI o causa..." value="${escapeHtml(pacientesState.search)}" style="padding:6px 10px 6px 30px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:12px; outline:none; background:#ffffff; width:100%; transition:all 0.15s ease;" />
            </div>
            <div style="flex:0 0 auto;">
              <select id="paciente-area-filter" class="filter-select-curved" style="padding:6px 26px 6px 10px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:12px; outline:none; background:#ffffff; width:auto; min-width:125px; cursor:pointer; transition:all 0.15s ease;">
                <option value="">Todas las áreas</option>
                ${AREAS.map(a => `<option value="${a}" ${pacientesState.area === a ? 'selected' : ''}>${a}</option>`).join('')}
              </select>
            </div>
            <div style="flex:0 0 auto;">
              <select id="paciente-activo-filter" class="filter-select-curved" style="padding:6px 26px 6px 10px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:12px; outline:none; background:#ffffff; width:auto; min-width:145px; cursor:pointer; transition:all 0.15s ease;">
                <option value="true" ${pacientesState.activo === 'true' ? 'selected' : ''}>Pacientes Internados (Activos)</option>
                <option value="false" ${pacientesState.activo === 'false' ? 'selected' : ''}>Pacientes Dados de Alta</option>
                <option value="" ${pacientesState.activo === '' ? 'selected' : ''}>Todos los registros</option>
              </select>
            </div>
            <label style="flex:0 0 auto; font-size:12.5px; color:var(--gray-700); font-weight:600; cursor:pointer; display:flex; align-items:center; gap:6px; user-select:none; padding:0 4px;">
              <input type="checkbox" ${pacientesState.sinCama ? 'checked' : ''} onchange="toggleSinCamaFilter()" style="cursor:pointer;" />
              <span>Sin Cama</span>
            </label>
            <button class="btn btn-secondary btn-sm" onclick="clearPacienteFilters()" style="flex:0 0 auto; padding:6px 14px; border-radius:10px; font-size:12px; font-weight:600; white-space:nowrap;">Limpiar</button>
          </div>
        </div>

        <div class="table-container table-stagger" style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead>
              <tr style="background:var(--gray-50); border-bottom:1px solid var(--gray-200);">
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">#</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">PACIENTE</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left; white-space:nowrap;">DATOS PERSONALES & CONTACTO</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">ÁREA & CAMA</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">CAUSA / DIAGNÓSTICO</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">MÉDICO RESPONSABLE</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">GRUPO & ALERGIAS</th>
                <th style="padding:10px 14px; vertical-align:middle; text-align:center; white-space:nowrap;">ESTADO</th>
                <th style="padding:10px 14px; vertical-align:middle; text-align:center; white-space:nowrap;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="9" style="vertical-align:middle;">
                    <div class="empty-state" style="padding:30px 20px; text-align:center;">
                      <span style="font-size:32px;">${icon('search')}</span>
                      <h3 style="margin:8px 0 4px 0;">No se encontraron pacientes</h3>
                      <p style="color:var(--gray-500); font-size:13px; margin-bottom:16px;">
                        ${pacientesState.sinCama ? 'No hay pacientes actualmente sin cama asignada.' : (pacientesState.search ? `No hay resultados para "<strong>${escapeHtml(pacientesState.search)}</strong>".` : 'No hay pacientes que coincidan con los filtros.')}
                      </p>
                      <div style="display:flex; gap:10px; justify-content:center;">
                        ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
                          <button class="btn btn-primary btn-sm" onclick="openPacienteModal()">
                            ${icon('user')} Registrar Nuevo Paciente Aquí
                          </button>
                        `}
                        <button class="btn btn-secondary btn-sm" onclick="clearPacienteFilters()">
                          Limpiar Filtros
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ` : filtered.map(p => {
                const codigosList = typeof getData === 'function' ? getData() : [];
                const isFallecido = p.fallecido === true || !!codigosList.find(c => 
                  (c.id_paciente === p.id || (p.apellido && c.paciente && c.paciente.toLowerCase().includes(p.apellido.toLowerCase()))) && 
                  c.estado && c.estado.value === 'fatal'
                );
                const isDischarged = !p.activo;
                const doc = (isDischarged || isFallecido) ? null : personalList.find(d => d.id === p.id_personal);
                const docName = (isDischarged || isFallecido) ? 'Sin Designar' : (doc ? `${doc.apellido}, ${doc.nombre}` : 'Médico de Guardia');
                const causaDisplay = (isDischarged || isFallecido) ? 'Sin Causa Activa' : (p.causa || 'Paro Cardiorrespiratorio');
                const hasAlergia = p.alergias && p.alergias.trim().toLowerCase() !== 'ninguna' && p.alergias.trim() !== '-';
                const formattedDNI = p.dni ? formatDNI(p.dni) : 'S/D';

                return `
                  <tr class="paciente-table-row" onclick="openPacienteDetailModal(${p.id})" title="Haga clic para ver la ficha clínica completa de ${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}" style="border-bottom:1px solid var(--gray-100); cursor:pointer; transition:background 0.15s ease;">
                    <td style="padding:10px 12px; vertical-align:middle; font-weight:600; color:var(--gray-400);">${p.id}</td>
                    <td style="padding:10px 12px; vertical-align:middle; font-weight:700; color:var(--gray-800); white-space:nowrap;">${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</td>
                    <td style="padding:10px 12px; vertical-align:middle; white-space:nowrap;">
                      <span style="font-size:12px; font-weight:600; color:var(--gray-800);">${escapeHtml(formattedDNI)}</span>
                      ${p.edad ? `<span style="font-size:12px; color:var(--gray-500);"> · ${p.edad} años</span>` : ''}
                      ${p.telefono ? `<div style="font-size:11px; color:var(--gray-600); margin-top:2px;">${icon('phone', 11)} ${escapeHtml(p.telefono)}</div>` : ''}
                      ${p.email ? `<div style="font-size:11px; color:var(--gray-600);">${icon('fileText', 11)} ${escapeHtml(p.email)}</div>` : ''}
                    </td>
                    <td style="padding:10px 12px; vertical-align:middle;">
                      <div style="font-weight:600; color:var(--gray-700);">${escapeHtml(p.area)}</div>
                      <div style="font-size:11px; color:var(--gray-700); font-weight:700;">${icon('bed')} ${escapeHtml(p.cama || 'Sin Cama')}</div>
                    </td>
                    <td style="padding:10px 12px; vertical-align:middle;">
                      <span style="font-size:12px; font-weight:600; color:${(isDischarged || isFallecido) ? 'var(--gray-400)' : 'var(--gray-800)'}; background:${(isDischarged || isFallecido) ? '#f1f5f9' : 'var(--gray-100)'}; border:1px solid var(--gray-200); padding:4px 8px; border-radius:6px; display:inline-block;">
                        ${escapeHtml(causaDisplay)}
                      </span>
                    </td>
                    <td style="padding:10px 12px; vertical-align:middle; font-size:12px; color:${(isDischarged || isFallecido) ? 'var(--gray-400)' : 'var(--gray-700)'}; white-space:nowrap;">${escapeHtml(docName)}</td>
                    <td style="padding:10px 12px; vertical-align:middle;">
                      <div style="display:flex; flex-direction:column; gap:3px; align-items:flex-start;">
                        <span class="badge" style="background:var(--gray-100); color:var(--gray-700); border:1px solid var(--gray-300); font-weight:700; font-size:10px;">${escapeHtml(p.grupo || 'S/D')}</span>
                        ${hasAlergia ? `
                          <span class="badge" style="background:#fef2f2; color:#991b1b; border:1px solid #fca5a5; font-weight:700; font-size:10px; display:inline-flex; align-items:center; gap:3px;" title="Alergia Médica Crítica">
                            ${icon('alertTriangle', 11)} ${escapeHtml(p.alergias)}
                          </span>
                        ` : `
                          <span style="font-size:11px; color:var(--gray-400);">Ninguna</span>
                        `}
                      </div>
                    </td>
                    <td style="padding:10px 14px; vertical-align:middle; text-align:center; white-space:nowrap;">
                      ${isFallecido ? `
                        <span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-size:11px; padding:4px 10px; font-weight:700;">
                          Fallecido
                        </span>
                      ` : `
                        <span class="badge ${p.activo ? 'badge-success' : 'badge-warning'}" style="font-size:11px; padding:4px 10px;">
                          ${p.activo ? 'Internado' : 'Alta'}
                        </span>
                      `}
                    </td>
                    <td style="padding:10px 14px; vertical-align:middle; text-align:center; white-space:nowrap;">
                      <div style="display:flex; gap:6px; align-items:center; justify-content:center;">
                        <button class="btn btn-sm" style="padding:3px 7px; font-size:11px; font-weight:600; background:#f1f5f9; color:#0f172a; border:1px solid #cbd5e1; border-radius:5px; display:inline-flex; align-items:center; gap:3px; cursor:pointer;" onclick="event.stopPropagation(); openHistorialClinicoModal(${p.id})" title="Ver Historial Clínico Completo">
                          ${icon('clock', 12)} Historial
                        </button>
                        ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
                          <button class="action-link" style="font-size:11.5px; font-weight:600;" onclick="event.stopPropagation(); openPacienteModal(${p.id})">Editar</button>
                          ${p.activo ? `
                            <button class="btn btn-sm" style="padding:3px 7px; font-size:11px; font-weight:600; background:#059669; color:#ffffff; border:none; border-radius:5px; display:inline-flex; align-items:center; gap:3px; box-shadow:0 1px 2px rgba(0,0,0,0.08); cursor:pointer;" onclick="event.stopPropagation(); confirmAltaPaciente(${p.id})" title="Registrar Alta Médica (Requiere confirmación)">
                              ${icon('checkCircle', 11)} Dar de Alta
                            </button>
                          ` : `
                            <button class="btn btn-sm" style="padding:3px 7px; font-size:11px; font-weight:600; background:var(--celeste-dark); color:#ffffff; border:none; border-radius:5px; display:inline-flex; align-items:center; gap:3px; box-shadow:0 1px 2px rgba(0,0,0,0.08); cursor:pointer;" onclick="event.stopPropagation(); reingresarPaciente(${p.id})" title="Reingresar Paciente">
                              ${icon('refreshCw', 11)} Reingresar
                            </button>
                          `}
                          <button class="action-link danger" onclick="event.stopPropagation(); confirmDeletePaciente(${p.id})" title="Eliminar paciente definitivamente" style="display:inline-flex; align-items:center; justify-content:center; border:none; background:none; padding:4px; margin-left:2px; cursor:pointer; color:#dc2626;">
                            ${icon('trash', 14)}
                          </button>
                        `}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function setupPacientes() {
  const search = document.getElementById('paciente-search');
  const area = document.getElementById('paciente-area-filter');
  const activo = document.getElementById('paciente-activo-filter');

  if (search) {
    search.addEventListener('input', (e) => {
      pacientesState.search = e.target.value;
      const cursorPosition = e.target.selectionStart;
      renderApp();
      requestAnimationFrame(() => {
        const reSearch = document.getElementById('paciente-search');
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    });
  }

  [area, activo].forEach(el => {
    if (el) {
      el.addEventListener('change', () => {
        pacientesState.area = area ? area.value : '';
        pacientesState.activo = activo ? activo.value : '';
        renderApp();
      });
    }
  });
}

function toggleSinCamaFilter() {
  pacientesState.sinCama = !pacientesState.sinCama;
  renderApp();
}

function clearPacienteFilters() {
  pacientesState = { search: '', area: '', activo: 'true', sinCama: false };
  renderApp();
}

function openPacienteModal(editId = null) {
  const isEdit = editId !== null;
  const pacientesList = getPacientes();
  const paciente = isEdit ? pacientesList.find(p => p.id === editId) : null;
  const personalList = getPersonalSalud();

  const selectedDoc = paciente ? (personalList.find(p => p.id === paciente.id_personal || (paciente.personal_a_cargo && paciente.personal_a_cargo.includes(p.apellido)))) : null;
  const initialDocId = selectedDoc ? selectedDoc.id : '';
  const initialDocText = selectedDoc ? `${selectedDoc.apellido}, ${selectedDoc.nombre} — [${selectedDoc.nombre_rol || 'Médico'}] (${selectedDoc.area || 'Guardia'})` : '';

  document.querySelector('.paciente-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active paciente-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:680px; max-height:90vh; display:flex; flex-direction:column; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon(isEdit ? 'edit' : 'user')} ${isEdit ? 'Editar Datos del Paciente' : 'Registrar Nuevo Paciente'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.paciente-modal-overlay').remove()">&times;</button>
      </div>

      <form id="paciente-modal-form" style="display:flex; flex-direction:column; flex:1; overflow:hidden;">
        <div class="modal-body" style="padding:20px 24px; overflow-y:auto; flex:1;">
          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:14px;">
            <div class="form-group">
              <label>Apellido *</label>
              <input type="text" id="m-apellido" required placeholder="Ej: Gómez" value="${paciente ? escapeHtml(paciente.apellido) : ''}" />
            </div>
            <div class="form-group">
              <label>Nombre *</label>
              <input type="text" id="m-nombre" required placeholder="Ej: Juan" value="${paciente ? escapeHtml(paciente.nombre) : ''}" />
            </div>
            <div class="form-group">
              <label>DNI / Documento (Opcional)</label>
              <input type="text" id="m-dni" placeholder="Ej: 32.145.678 (o dejar vacío)" value="${paciente ? escapeHtml(paciente.dni || '') : ''}" />
            </div>
            <div class="form-group">
              <label>Edad / Fecha Nacimiento (Opcional)</label>
              <input type="number" id="m-edad" min="1" max="120" placeholder="Años (o dejar vacío)" value="${paciente && paciente.edad ? paciente.edad : ''}" />
            </div>
            <div class="form-group">
              <label>Teléfono de Contacto (Opcional)</label>
              <input type="text" id="m-telefono" placeholder="Ej: 11-4567-8901 (con guiones)" value="${paciente ? escapeHtml(paciente.telefono || '') : ''}" />
            </div>
            <div class="form-group">
              <label>Correo Electrónico (Opcional)</label>
              <input type="email" id="m-email" placeholder="Ej: paciente@correo.com (o dejar vacío)" value="${paciente ? escapeHtml(paciente.email || '') : ''}" />
            </div>
            <div class="form-group full-width" style="grid-column: 1 / -1;">
              <label style="color:var(--celeste-dark); font-weight:700;">Diagnóstico / Causa Principal (Opcional)</label>
              <input type="text" id="m-causa" placeholder="Ej: Infarto Agudo de Miocardio / Opciones varias (o dejar vacío)" value="${paciente ? escapeHtml(paciente.causa || '') : ''}" />
            </div>
            <div class="form-group">
              <label>Área Hospitalaria</label>
              <select id="m-area">
                <option value="">-- Seleccionar área clínica --</option>
                <option value="Sin Designar" ${!paciente || paciente.area === 'Sin Designar' ? 'selected' : ''}>Sin Designar (Sin Cama / Alta)</option>
                ${getAreas().map(a => `<option value="${escapeHtml(a.nombre)}" ${paciente && paciente.area === a.nombre ? 'selected' : ''}>${escapeHtml(a.nombre)}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Cama / Box (Solo Camas Disponibles)</label>
              <select id="m-cama">
                <option value="">-- Sin Cama Asignada --</option>
                ${(() => {
                  const areaName = paciente ? paciente.area : '';
                  const freeCamas = getCamas().filter(c => c.area_nombre === areaName && (c.estado === 'Libre' || (paciente && paciente.cama === c.numero)));
                  return freeCamas.map(c => `
                    <option value="${escapeHtml(c.numero)}" ${paciente && paciente.cama === c.numero ? 'selected' : ''}>
                      ${icon('circleFill')} ${escapeHtml(c.numero)} (${c.estado})
                    </option>
                  `).join('');
                })()}
              </select>
            </div>

            <!-- Médico / Personal de Salud a Cargo (OPCIONAL CON BÚSQUEDA EN TIEMPO REAL) -->
            <div class="form-group full-width" style="grid-column: 1 / -1; position: relative;">
              <label style="color:var(--celeste-dark); font-weight:700;">Médico / Personal de Salud a Cargo (Opcional)</label>
              <div style="position:relative; width:100%;">
                <input type="text" id="m-personal-search" placeholder="Escriba para seleccionar profesional o deje vacío..." autocomplete="off" value="${escapeHtml(initialDocText)}" style="font-size:12.5px; font-weight:600; padding:9px 12px 9px 36px; border:1.5px solid var(--celeste-300); border-radius:10px; width:100%; outline:none; background:#ffffff; box-shadow:0 1px 2px rgba(0,0,0,0.04); transition:all 0.15s ease;" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--gray-400); pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="hidden" id="m-personal" value="${initialDocId}" />
                <div id="m-personal-dropdown" style="display:none; position:absolute; top:calc(100% + 4px); left:0; right:0; max-height:200px; overflow-y:auto; background:#ffffff; border:1.5px solid var(--celeste-300); border-radius:10px; z-index:99999; box-shadow:0 8px 24px rgba(0,0,0,0.15); padding:4px 0;"></div>
              </div>
            </div>

            <div class="form-group">
              <label>Grupo Sanguíneo (Opcional)</label>
              <select id="m-grupo">
                ${['S/D', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => `<option value="${g}" ${paciente && paciente.grupo === g ? 'selected' : (!paciente && g === 'S/D' ? 'selected' : '')}>${g === 'S/D' ? 'S/D (Desconocido)' : g}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Alergias Conocidas</label>
              <input type="text" id="m-alergias" placeholder="Ej: Penicilina, Látex, Ninguna" value="${paciente ? escapeHtml(paciente.alergias || 'Ninguna') : 'Ninguna'}" />
            </div>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.paciente-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">
            ${isEdit ? 'Guardar Cambios' : 'Registrar Paciente'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  // Filtrado dinámico de camas (SOLO LIBRES) y auto-selección de médico a cargo
  const areaSelect = document.getElementById('m-area');
  const camaSelect = document.getElementById('m-cama');
  const personalSearchInput = document.getElementById('m-personal-search');
  const personalHiddenInput = document.getElementById('m-personal');
  const personalDropdown = document.getElementById('m-personal-dropdown');
  
  areaSelect.addEventListener('change', () => {
    const selectedArea = areaSelect.value;
    const freeCamas = getCamas().filter(c => c.area_nombre === selectedArea && (c.estado === 'Libre' || (isEdit && paciente && paciente.area === selectedArea && paciente.cama === c.numero)));
    
    if (freeCamas.length === 0) {
      camaSelect.innerHTML = `<option value="">${icon('alertTriangle')} No hay camas libres en esta área</option>`;
    } else {
      camaSelect.innerHTML = `
        <option value="">-- Sin Cama Asignada --</option>
        ${freeCamas.map(c => `
          <option value="${escapeHtml(c.numero)}" ${paciente && paciente.cama === c.numero ? 'selected' : ''}>
            ${icon('circleFill')} ${escapeHtml(c.numero)} [Disponible]
          </option>
        `).join('')}
      `;
    }

    // Auto-seleccionar al primer personal de salud que esté a cargo de esta área
    if (selectedArea && personalSearchInput && personalHiddenInput) {
      const personalDeArea = personalList.find(p => p.area === selectedArea);
      if (personalDeArea) {
        personalHiddenInput.value = personalDeArea.id;
        personalSearchInput.value = `${personalDeArea.apellido}, ${personalDeArea.nombre} — [${personalDeArea.nombre_rol || 'Médico'}] (${personalDeArea.area || 'Guardia'})`;
      }
    }
  });

  // Filtro en tiempo real en UNA SOLA BARRA para Personal a Cargo
  function renderPersonalDropdown(filterQuery = '') {
    const q = normalizeText(filterQuery);
    const matches = personalList.filter(p => {
      if (!q) return true;
      const full = normalizeText(`${p.apellido} ${p.nombre} ${p.nombre_rol || ''} ${p.area || ''}`);
      return full.includes(q);
    });

    if (matches.length === 0) {
      personalDropdown.innerHTML = `<div style="padding:10px 14px; font-size:12px; color:var(--gray-400); text-align:center;">No se encontró personal de salud</div>`;
    } else {
      personalDropdown.innerHTML = matches.map(p => `
        <div class="personal-dropdown-item" data-id="${p.id}" data-text="${escapeHtml(`${p.apellido}, ${p.nombre} — [${p.nombre_rol || 'Médico'}] (${p.area || 'Guardia'})`)}" style="padding:8px 12px; cursor:pointer; font-size:12px; border-bottom:1px solid #f1f5f9; transition:background 0.15s ease;">
          <div style="font-weight:700; color:var(--gray-800);">${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</div>
          <div style="font-size:11px; color:var(--gray-500);">${escapeHtml(p.nombre_rol || 'Médico')} · ${escapeHtml(p.area || 'Guardia')}</div>
        </div>
      `).join('');

      Array.from(personalDropdown.querySelectorAll('.personal-dropdown-item')).forEach(el => {
        el.addEventListener('mouseenter', () => el.style.background = '#f0f9ff');
        el.addEventListener('mouseleave', () => el.style.background = '#ffffff');
      });
    }
    personalDropdown.style.display = 'block';
  }

  if (personalSearchInput && personalDropdown) {
    personalSearchInput.addEventListener('focus', () => {
      renderPersonalDropdown(personalSearchInput.value);
    });

    personalSearchInput.addEventListener('input', () => {
      personalHiddenInput.value = '';
      renderPersonalDropdown(personalSearchInput.value);
    });

    personalDropdown.addEventListener('click', (e) => {
      const item = e.target.closest('.personal-dropdown-item');
      if (item) {
        const id = item.getAttribute('data-id');
        const text = item.getAttribute('data-text');
        personalHiddenInput.value = id;
        personalSearchInput.value = text;
        personalDropdown.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (!personalSearchInput.contains(e.target) && !personalDropdown.contains(e.target)) {
        personalDropdown.style.display = 'none';
      }
    });
  }

  document.getElementById('paciente-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const apellido = document.getElementById('m-apellido').value.trim();
    const nombre = document.getElementById('m-nombre').value.trim();
    const dni = document.getElementById('m-dni').value.trim() || 'S/D';
    const edadVal = document.getElementById('m-edad').value.trim();
    const edad = edadVal ? parseInt(edadVal) : 'S/D';
    const telefono = document.getElementById('m-telefono') ? document.getElementById('m-telefono').value.trim() : '';
    const email = document.getElementById('m-email') ? document.getElementById('m-email').value.trim() : '';
    const causa = document.getElementById('m-causa').value.trim() || 'Sin Diagnóstico / En Evaluación';
    const area = document.getElementById('m-area') ? document.getElementById('m-area').value : '';
    const cama = document.getElementById('m-cama') ? document.getElementById('m-cama').value.trim() : '';
    const id_personal = parseInt(document.getElementById('m-personal').value) || 0;
    const personalSearchText = document.getElementById('m-personal-search').value.trim() || 'Sin Designar';
    const grupo = document.getElementById('m-grupo') ? document.getElementById('m-grupo').value : 'S/D';
    const alergias = document.getElementById('m-alergias') ? document.getElementById('m-alergias').value.trim() : 'Ninguna';

    let finalCama = cama;
    let finalArea = area || 'Sin Designar';
    const currentList = getPacientes();
    let finalActivo = isEdit ? (currentList.find(p => p.id === editId)?.activo !== false) : true;

    if (!cama || cama === 'Sin Cama') {
      finalCama = '';
    }

    if (!apellido || !nombre) {
      showToast('Por favor ingrese el Apellido y Nombre del paciente', 'error');
      return;
    }

    const camasList = getCamas();
    let oldCama = '';
    let oldArea = '';

    if (isEdit) {
      const existing = currentList.find(p => p.id === editId);
      if (existing) {
        oldCama = existing.cama || '';
        oldArea = existing.area || '';
      }
    }

    // 1. Si cambió de cama (o la dejó libre), LIBERAR la cama anterior
    if (oldCama && oldCama !== finalCama) {
      const prevCamaObj = camasList.find(c => (c.area_nombre === oldArea && c.numero === oldCama) || c.numero === oldCama);
      if (prevCamaObj) {
        prevCamaObj.estado = 'Libre';
        prevCamaObj.id_paciente = null;
        prevCamaObj.paciente_nombre = null;
      }
    }

    const validIds = currentList.map(p => Number(p.id)).filter(id => !isNaN(id) && id > 0);
    const newId = isEdit ? editId : (validIds.length > 0 ? Math.max(...validIds) + 1 : 11);

    // 2. Si asignó una nueva cama, ocuparla
    if (finalCama) {
      const newCamaObj = camasList.find(c => (c.area_nombre === finalArea && c.numero === finalCama) || c.numero === finalCama);
      if (newCamaObj) {
        newCamaObj.estado = 'Ocupada';
        newCamaObj.id_paciente = newId;
        newCamaObj.paciente_nombre = `${apellido}, ${nombre}`;
      }
    }

    saveCamas(camasList);

    const persObj = personalList.find(p => p.id === id_personal);
    const personal_a_cargo = (finalActivo && persObj) ? `${persObj.apellido}, ${persObj.nombre} (${persObj.nombre_rol || 'Médico'})` : 'Sin Designar';
    const finalCausaSave = finalActivo ? causa : '-';
    const finalIdPersonalSave = finalActivo ? id_personal : null;

    if (isEdit) {
      const idx = currentList.findIndex(p => String(p.id) === String(editId));
      if (idx !== -1) {
        currentList[idx] = {
          ...currentList[idx],
          apellido, nombre, dni, edad, telefono, email, causa: finalCausaSave, area: finalArea, cama: finalCama, activo: finalActivo, id_personal: finalIdPersonalSave, personal_a_cargo, grupo, alergias
        };
        savePacientes(currentList);
        showToast('Datos del paciente actualizados con éxito', 'success');
      }
    } else {
      const newPac = {
        id: newId,
        apellido, nombre, dni, edad, telefono, email, causa: finalCausaSave, area: finalArea, cama: finalCama, activo: finalActivo, id_personal: finalIdPersonalSave, personal_a_cargo, grupo, alergias
      };
      currentList.push(newPac);
      savePacientes(currentList);
      if (typeof registrarIngresoHistorialClinico === 'function') {
        registrarIngresoHistorialClinico(newPac);
      }
      showToast('Paciente registrado exitosamente', 'success');
    }

    document.querySelector('.paciente-modal-overlay')?.remove();
    renderApp();
  });
}

function confirmAltaPaciente(id) {
  const currentList = getPacientes();
  const p = currentList.find(item => item.id === id);
  if (!p) return;

  document.querySelector('.alta-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active alta-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:#ecfdf5;">
        <h2 style="font-size:18px; font-weight:700; color:#065f46; margin:0; display:flex; align-items:center; gap:8px;">
          <span>${icon('building')}</span> Registrar Alta Médica
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.alta-modal-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body" style="padding:20px 24px;">
        <p style="color:var(--gray-700); font-size:14px; line-height:1.5; margin:0 0 12px 0;">
          ¿Confirma el <strong>egreso y alta médica</strong> del paciente <strong>${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</strong> (DNI: ${p.dni || 'S/D'})?
        </p>
        <div style="background:var(--gray-50); padding:12px; border-radius:var(--radius); border:1px solid var(--gray-200); font-size:13px; color:var(--gray-600); margin-bottom:12px;">
          <div>${icon('mapPin')} <strong>Ubicación actual:</strong> ${escapeHtml(p.area)} — ${escapeHtml(p.cama || 'Cama')}</div>
          <div style="margin-top:4px; color:#059669; font-weight:600;">${icon('star')} Al dar de alta, la cama asignada quedará libre y disponible para otros pacientes.</div>
        </div>

        <div class="form-group">
          <label style="font-weight:700; font-size:12.5px; color:var(--gray-700); margin-bottom:4px; display:block;">Resultado / Motivo del Egreso *</label>
          <select id="alta-resultado" style="width:100%; padding:8px 12px; font-size:13px; font-weight:600; border:1px solid var(--gray-300); border-radius:8px;">
            <option value="Alta médica" selected>Alta médica (Recuperación / Egreso)</option>
            <option value="Derivado a otro centro">Derivado a otro centro de salud</option>
            <option value="Fallecido">Fallecido (Obituario)</option>
          </select>
        </div>
      </div>
      <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <button class="btn btn-secondary btn-sm" onclick="this.closest('.alta-modal-overlay').remove()">Cancelar</button>
        <button class="btn btn-sm" style="background:#059669; color:#ffffff; font-weight:700;" onclick="doAltaPaciente(${id})">
          ${icon('check')} Confirmar Alta Médica
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

function doAltaPaciente(id) {
  const currentList = getPacientes();
  const idx = currentList.findIndex(p => p.id === id);
  if (idx !== -1) {
    const p = currentList[idx];

    // Cerrar la internación activa en el historial clínico
    const resultado = document.getElementById('alta-resultado') ? document.getElementById('alta-resultado').value : 'Alta médica';
    if (typeof cerrarIngresoHistorialClinico === 'function') {
      cerrarIngresoHistorialClinico(id, resultado);
    }

    if (resultado === 'Fallecido') {
      p.fallecido = true;
    }

    // Liberar la cama de las áreas
    const camasList = getCamas();
    const camaObj = camasList.find(c => (c.area_nombre === p.area && c.numero === p.cama) || c.numero === p.cama);
    if (camaObj) {
      camaObj.estado = 'Libre';
      camaObj.id_paciente = null;
      camaObj.paciente_nombre = null;
      saveCamas(camasList);
    }

    p.activo = false;
    p.cama = '';
    p.area = 'Sin Designar';
    p.id_personal = null;
    p.personal_a_cargo = 'Sin Designar';
    p.causa = '-';
    savePacientes(currentList);

    showToast('Alta médica registrada con éxito. Cama liberada e historial clínico actualizado.', 'success');
  }
  document.querySelector('.alta-modal-overlay')?.remove();
  renderApp();
}

function reingresarPaciente(id) {
  const currentList = getPacientes();
  const idx = currentList.findIndex(p => p.id === id);
  if (idx === -1) return;

  const p = currentList[idx];

  // Buscar si el paciente posee un Código Azul registrado como Fallecido (Defunción)
  const codigos = getData();
  const fatalCodigo = codigos.find(c => (c.id_paciente === p.id || (p.apellido && c.paciente.includes(p.apellido))) && c.estado && c.estado.value === 'fatal');

  if (fatalCodigo) {
    showReingresoFallecidoModal(p, fatalCodigo);
    return;
  }

  doReingresarPaciente(id);
}

function doReingresarPaciente(id) {
  openReingresoCamaModal(id);
}

function openReingresoCamaModal(id, pendingRedirectCodigoId = null) {
  const currentList = getPacientes();
  const idx = currentList.findIndex(p => p.id === id);
  if (idx === -1) return;
  const p = currentList[idx];

  document.querySelector('.reingreso-cama-modal-overlay')?.remove();

  const areasValidas = AREAS.filter(a => a !== 'Sin Designar');
  const initialArea = (p.area && p.area !== 'Sin Designar') ? p.area : areasValidas[0];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active reingreso-cama-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:500px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:#f0f9ff;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px; color:var(--celeste-dark);">${icon('building')}</span>
          <div>
            <h3 style="font-size:17px; font-weight:800; color:var(--celeste-dark); margin:0;">
              Reingreso &mdash; Asignar Ubicación y Cama
            </h3>
            <span style="font-size:12px; color:var(--gray-600);">Paciente: <strong>${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</strong> (DNI: ${p.dni || 'S/D'})</span>
          </div>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.reingreso-cama-modal-overlay').remove()">&times;</button>
      </div>

      <form id="reingreso-cama-form">
        <div class="modal-body" style="padding:20px 24px;">
          <p style="font-size:13px; color:var(--gray-600); margin:0 0 16px 0; line-height:1.4;">
            Seleccione el área hospitalaria y una cama disponible para reactivar la internación del paciente:
          </p>

          <div class="form-group" style="margin-bottom:14px;">
            <label style="font-weight:700; color:var(--celeste-dark);">Área Hospitalaria *</label>
            <select id="reingreso-area" required style="font-size:14px; padding:10px; border-radius:8px; border:1.5px solid var(--celeste-300); width:100%;">
              ${areasValidas.map(a => `<option value="${a}" ${initialArea === a ? 'selected' : ''}>${escapeHtml(a)}</option>`).join('')}
            </select>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label style="font-weight:700; color:var(--celeste-dark);">Cama / Box Disponible *</label>
            <select id="reingreso-cama" required style="font-size:14px; padding:10px; border-radius:8px; border:1.5px solid var(--celeste-300); width:100%;">
              <!-- Se completa dinámicamente -->
            </select>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.reingreso-cama-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm" style="font-weight:700;">
            ${icon('check')} Confirmar Reingreso y Asignar Cama
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  const areaSelect = document.getElementById('reingreso-area');
  const camaSelect = document.getElementById('reingreso-cama');

  function updateCamasOptions() {
    const selectedArea = areaSelect.value;
    const freeCamas = getCamas().filter(c => c.area_nombre === selectedArea && c.estado === 'Libre');

    if (freeCamas.length === 0) {
      camaSelect.innerHTML = `<option value=""> camas libres en esta área</option>`;
      camaSelect.required = false;
    } else {
      camaSelect.required = true;
      camaSelect.innerHTML = `
        <option value="">-- Seleccionar Cama Libre en ${escapeHtml(selectedArea)} --</option>
        ${freeCamas.map(c => `
          <option value="${escapeHtml(c.numero)}">
            ${escapeHtml(c.numero)} [Disponible]
          </option>
        `).join('')}
      `;
    }
  }

  areaSelect.addEventListener('change', updateCamasOptions);
  updateCamasOptions();

  document.getElementById('reingreso-cama-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedArea = areaSelect.value;
    const selectedCama = camaSelect.value;

    if (!selectedArea) {
      showToast('Seleccione un área hospitalaria', 'error');
      return;
    }

    if (!selectedCama) {
      showToast('Debe seleccionar una cama disponible en el área seleccionada', 'error');
      return;
    }

    // Actualizar datos del paciente
    const pList = getPacientes();
    const pIdx = pList.findIndex(item => item.id === id);
    if (pIdx !== -1) {
      pList[pIdx].activo = true;
      pList[pIdx].area = selectedArea;
      pList[pIdx].cama = selectedCama;
      savePacientes(pList);

      // Registrar nuevo ingreso en el historial clínico
      if (typeof registrarIngresoHistorialClinico === 'function') {
        registrarIngresoHistorialClinico(pList[pIdx]);
      }

      // Ocupar la cama en la lista global de camas
      const camasList = getCamas();
      const camaObj = camasList.find(c => c.area_nombre === selectedArea && c.numero === selectedCama);
      if (camaObj) {
        camaObj.estado = 'Ocupada';
        camaObj.id_paciente = pList[pIdx].id;
        camaObj.paciente_nombre = `${pList[pIdx].apellido}, ${pList[pIdx].nombre}`;
        saveCamas(camasList);
      }

      showToast(`Paciente ${escapeHtml(pList[pIdx].apellido)}, ${escapeHtml(pList[pIdx].nombre)} reingresado y asignado a ${selectedArea} [${selectedCama}].`, 'success');
    }

    document.querySelector('.reingreso-cama-modal-overlay')?.remove();

    if (pendingRedirectCodigoId) {
      showToast('Redirigiendo a edición de Código Azul...', 'info');
      window.location.hash = `#/editar/${pendingRedirectCodigoId}`;
    } else {
      renderApp();
    }
  });
}

function showReingresoFallecidoModal(p, fatalCodigo) {
  document.querySelector('.reingreso-fatal-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active reingreso-fatal-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.75); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:92%; max-width:540px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid #fca5a5; background:#fef2f2;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px; color:#dc2626;">${icon('xOctagon')}</span>
          <div>
            <h3 style="font-size:16px; font-weight:800; color:#991b1b; margin:0;">
              Advertencia: Reingreso de Paciente Fallecido
            </h3>
            <span style="font-size:11.5px; color:#7f1d1d;">Acta de Defunción Previa Detectada</span>
          </div>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.reingreso-fatal-modal-overlay').remove()">&times;</button>
      </div>

      <div class="modal-body" style="padding:20px 24px; font-size:13.5px; color:var(--gray-700); line-height:1.5;">
        <p style="margin:0 0 12px 0; font-size:14px;">
          ¿Está seguro de reingresar al paciente <strong>${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</strong> (DNI: ${p.dni ? formatDNI(p.dni) : 'S/D'}) a la internación activa?
        </p>

        <div style="background:#fff5f5; border:1.5px solid #feb2b2; border-radius:8px; padding:12px 16px; margin-bottom:16px;">
          <div style="font-weight:700; color:#991b1b; font-size:13px; margin-bottom:4px;"> de Código Azul #${fatalCodigo.id} asentado como FALLECIDO:
          </div>
          <div style="font-size:12px; color:#7f1d1d; line-height:1.4;">
            <div>&middot; <strong>Fecha del evento:</strong> ${formatDateTime(fatalCodigo.fecha)}</div>
            <div>&middot; <strong>Causa / Diagnóstico:</strong> ${escapeHtml(fatalCodigo.causa || 'Paro Cardiorrespiratorio')}</div>
            <div>&middot; <strong>Médico Certificante:</strong> ${escapeHtml(fatalCodigo.datosCierre?.medicoCertificante || fatalCodigo.responsable)}</div>
          </div>
        </div>

        <p style="margin:0 0 10px 0; font-weight:700; color:var(--gray-900); font-size:13px;">
          Para completar el reingreso, indique qué desea hacer con el Código Azul fatal previo:
        </p>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <!-- Opción 1: Editar Código Azul -->
          <button type="button" class="btn btn-outline" style="text-align:left; padding:12px 14px; border:1.5px solid var(--celeste-dark); background:#f0f9ff; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:space-between;" onclick="handleReingresoEditarCodigo(${p.id}, ${fatalCodigo.id})">
            <div>
              <strong style="color:var(--celeste-dark); font-size:13px; display:block;"> / Corregir el Código Azul #${fatalCodigo.id}</strong>
              <span style="font-size:11.5px; color:var(--gray-600);">Reingresa al paciente y abre la edición para corregir el resultado clínico (ROSC / En Curso).</span>
            </div>
            <span style="font-size:18px; color:var(--celeste-dark); font-weight:800;">&rarr;</span>
          </button>

          <!-- Opción 2: Eliminar Código Azul Fatal -->
          <button type="button" class="btn btn-outline" style="text-align:left; padding:12px 14px; border:1.5px solid #fca5a5; background:#fff5f5; border-radius:8px; cursor:pointer; display:flex; align-items:center; justify-content:space-between;" onclick="handleReingresoEliminarCodigo(${p.id}, ${fatalCodigo.id})">
            <div>
              <strong style="color:#dc2626; font-size:13px; display:block;"> el Código Azul Fatal #${fatalCodigo.id}</strong>
              <span style="font-size:11.5px; color:var(--gray-600);">Elimina el registro de defunción por error de carga y activa al paciente en el sistema.</span>
            </div>
            <span style="font-size:18px; color:#dc2626; font-weight:800;">&rarr;</span>
          </button>
        </div>
      </div>

      <div class="modal-footer" style="display:flex; justify-content:flex-end; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <button class="btn btn-secondary btn-sm" onclick="this.closest('.reingreso-fatal-modal-overlay').remove()">Cancelar Reingreso</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

function handleReingresoEditarCodigo(pacienteId, codigoId) {
  document.querySelector('.reingreso-fatal-modal-overlay')?.remove();
  openReingresoCamaModal(pacienteId, codigoId);
}

function handleReingresoEliminarCodigo(pacienteId, codigoId) {
  document.querySelector('.reingreso-fatal-modal-overlay')?.remove();
  
  const currentCodigos = getData();
  const rest = currentCodigos.filter(c => c.id !== codigoId);
  saveData(rest);

  openReingresoCamaModal(pacienteId);
}

function confirmDeletePaciente(id) {
  const currentList = getPacientes();
  const p = currentList.find(item => item.id === id);
  if (!p) return;

  if (typeof showConfirmModal === 'function') {
    showConfirmModal({
      title: 'Mover Paciente a Papelera',
      message: `¿Confirma mover al paciente <strong>${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</strong> (DNI: ${p.dni || 'S/D'}) a la papelera?<br/><br/><span style="color:#0369a1; font-size:12px;">El registro se podrá restaurar desde la papelera durante los próximos 30 días. Si tiene una cama asignada, la cama quedará libre automáticamente.</span>`,
      confirmText: 'Mover a Papelera',
      confirmBtnStyle: 'background:#dc2626; color:#fff; font-weight:700; border-radius:8px; padding:8px 16px; border:none; cursor:pointer;',
      iconName: 'trash',
      headerBg: '#fee2e2',
      headerColor: '#991b1b',
      onConfirm: () => {
        deletePaciente(id);
      }
    });
  } else {
    if (confirm(`¿Seguro que desea mover al paciente ${p.apellido}, ${p.nombre} a la papelera?`)) {
      deletePaciente(id);
    }
  }
}

function deletePaciente(id) {
  softDeletePaciente(id);
  showToast('Movido a la papelera. Podés restaurarlo durante los próximos 30 días.', 'info');
  renderApp();
}

function openPacienteDetailModal(pacienteId) {
  const list = getPacientes();
  const paciente = list.find(p => String(p.id) === String(pacienteId));
  if (!paciente) return;

  const personalList = getPersonalSalud();
  const doc = personalList.find(d => d.id === paciente.id_personal || (paciente.personal_a_cargo && paciente.personal_a_cargo.includes(d.apellido)));
  const docName = doc ? `${doc.apellido}, ${doc.nombre}` : (paciente.personal_a_cargo || 'Médico de Guardia');
  const docInfo = doc ? `${doc.nombre_rol || 'Médico'} · ${doc.area || 'Guardia'}` : 'Personal de Guardia Asignado';

  // Buscar historial de Códigos Azules asociados a este paciente
  const codigosList = (typeof getData === 'function' ? getData() : []) || [];
  const pacienteCodigos = codigosList.filter(c => 
    String(c.id_paciente) === String(paciente.id) || 
    (c.paciente && paciente.apellido && c.paciente.toLowerCase().includes(paciente.apellido.toLowerCase()))
  );

  const isFallecido = paciente.fallecido === true || !!pacienteCodigos.find(c => c.estado?.value === 'fatal');
  const isDischarged = !paciente.activo;

  const formattedDNI = paciente.dni ? formatDNI(paciente.dni) : 'S/D (Sin Documento)';
  const hasAlergia = paciente.alergias && paciente.alergias.trim().toLowerCase() !== 'ninguna' && paciente.alergias.trim() !== '-';

  document.querySelector('.paciente-detail-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active paciente-detail-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.75); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:95%; max-width:760px; max-height:90vh; display:flex; flex-direction:column; box-shadow:var(--shadow-lg); overflow:hidden;">
      
      <!-- Header -->
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:20px 24px; border-bottom:1px solid var(--gray-200); background:#f8fafc;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="width:44px; height:44px; border-radius:12px; background:var(--celeste-100, #e0f2fe); color:var(--celeste-dark, #0369a1); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:18px;">
            ${icon('user', 22)}
          </div>
          <div>
            <div style="display:flex; align-items:center; gap:10px;">
              <h2 style="font-size:20px; font-weight:800; color:var(--gray-900); margin:0;">
                ${escapeHtml(paciente.apellido)}, ${escapeHtml(paciente.nombre)}
              </h2>
              ${isFallecido ? `
                <span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; font-size:11px; padding:4px 10px; font-weight:700;">
                  Fallecido (Obituario)
                </span>
              ` : `
                <span class="badge ${paciente.activo !== false ? 'badge-success' : 'badge-warning'}" style="font-size:11px; padding:4px 10px; font-weight:700;">
                  ${paciente.activo !== false ? 'Internado Activo' : 'Dado de Alta'}
                </span>
              `}
            </div>
            <div style="font-size:12.5px; color:var(--gray-500); margin-top:2px;">
              Ficha Clínica Hospitalaria · ID Paciente #${paciente.id}
            </div>
          </div>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.paciente-detail-overlay').remove()">&times;</button>
      </div>

      <!-- Body -->
      <div class="modal-body" style="padding:24px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:20px;">
        
        <!-- Grid de Tarjetas Informativas -->
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px;">
          
          <!-- Card 1: Identificación y Contacto -->
          <div style="background:#f8fafc; border:1px solid var(--gray-200); border-radius:12px; padding:16px;">
            <div style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--gray-400); letter-spacing:0.5px; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              ${icon('user', 14)} Identificación y Contacto
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">DNI / Documento</span>
                <span style="font-size:13.5px; font-weight:700; color:var(--gray-800);">${escapeHtml(formattedDNI)}</span>
              </div>
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Edad / Fecha de Nacimiento</span>
                <span style="font-size:13px; font-weight:600; color:var(--gray-700);">${paciente.edad ? paciente.edad + ' años' : 'S/D'} ${paciente.fecha_nacimiento ? '(' + paciente.fecha_nacimiento + ')' : ''}</span>
              </div>
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Teléfono de Contacto</span>
                <span style="font-size:13px; font-weight:600; color:${paciente.telefono ? 'var(--gray-800)' : 'var(--gray-400)'};">${paciente.telefono ? escapeHtml(paciente.telefono) : 'No registrado'}</span>
              </div>
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Correo Electrónico</span>
                <span style="font-size:13px; font-weight:600; color:${paciente.email ? 'var(--gray-800)' : 'var(--gray-400)'};">${paciente.email ? escapeHtml(paciente.email) : 'No registrado'}</span>
              </div>
            </div>
          </div>

          <!-- Card 2: Ubicación Hospitalaria -->
          <div style="background:#f8fafc; border:1px solid var(--gray-200); border-radius:12px; padding:16px;">
            <div style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--gray-400); letter-spacing:0.5px; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              ${icon('building', 14)} Ubicación Hospitalaria
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Área Clínico-Hospitalaria</span>
                <span style="font-size:13.5px; font-weight:700; color:var(--gray-800);">${escapeHtml(paciente.area || 'Sin Designar')}</span>
              </div>
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Cama / Box Asignado</span>
                <span style="font-size:13.5px; font-weight:700; color:var(--celeste-dark, #0369a1); display:inline-flex; align-items:center; gap:4px;">
                  ${icon('bed', 14)} ${escapeHtml(paciente.cama || 'Sin Cama Asignada')}
                </span>
              </div>
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Médico / Personal a Cargo</span>
                <span style="font-size:13px; font-weight:700; color:${isDischarged || isFallecido ? 'var(--gray-400)' : 'var(--gray-800)'};">${(isDischarged || isFallecido) ? 'Sin Designar' : escapeHtml(docName)}</span>
                <div style="font-size:11px; color:var(--gray-500);">${(isDischarged || isFallecido) ? 'Paciente Dado de Alta' : escapeHtml(docInfo)}</div>
              </div>
            </div>
          </div>

          <!-- Card 3: Datos Médicos & Alergias -->
          <div style="background:#f8fafc; border:1px solid var(--gray-200); border-radius:12px; padding:16px;">
            <div style="font-size:11px; text-transform:uppercase; font-weight:800; color:var(--gray-400); letter-spacing:0.5px; margin-bottom:10px; display:flex; align-items:center; gap:6px;">
              ${icon('heart', 14)} Información Clínica & Sangre
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Diagnóstico / Causa Principal</span>
                <span style="font-size:13px; font-weight:700; color:${(isDischarged || isFallecido) ? 'var(--gray-400)' : 'var(--gray-800)'}; background:${(isDischarged || isFallecido) ? '#f1f5f9' : '#fff'}; border:1px solid #e2e8f0; padding:4px 8px; border-radius:6px; display:inline-block; margin-top:2px;">
                  ${(isDischarged || isFallecido) ? 'Sin Causa Activa' : escapeHtml(paciente.causa || 'En Evaluación')}
                </span>
              </div>
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Grupo Sanguíneo & Factor</span>
                <span class="badge" style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:12px; padding:2px 8px; border-radius:6px;">
                  ${escapeHtml(paciente.grupo || 'S/D')}
                </span>
              </div>
              <div>
                <span style="font-size:11px; color:var(--gray-500); display:block;">Alergias Conocidas</span>
                ${hasAlergia ? `
                  <span style="background:#fef2f2; color:#991b1b; border:1px solid #fca5a5; font-weight:700; font-size:12px; padding:3px 8px; border-radius:6px; display:inline-flex; align-items:center; gap:4px; margin-top:2px;">
                    ${icon('alertTriangle', 13)} ${escapeHtml(paciente.alergias)}
                  </span>
                ` : `
                  <span style="font-size:12.5px; color:var(--gray-600); font-weight:600;">Ninguna declarada</span>
                `}
              </div>
            </div>
          </div>

        </div>

        <!-- Seccion: Historial Clinico de Internaciones Timeline -->
        <div style="border-top:1px solid var(--gray-200); padding-top:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-size:14px; font-weight:800; color:var(--gray-800); margin:0; display:flex; align-items:center; gap:6px;">
              ${icon('clock', 16)} Historial Clínico de Internaciones
            </h3>
            <button class="btn btn-secondary btn-sm" onclick="document.querySelector('.paciente-detail-overlay')?.remove(); openHistorialClinicoModal(${paciente.id});" style="font-size:11.5px; font-weight:700;">
              Ver Línea de Tiempo Completa
            </button>
          </div>
          ${(() => {
            const hEntries = typeof getHistorialClinicoPorPaciente === 'function' ? getHistorialClinicoPorPaciente(paciente.id, paciente.dni) : [];
            if (hEntries.length === 0) {
              return `
                <div style="background:#f8fafc; border:1px dashed var(--gray-300); border-radius:10px; padding:16px; text-align:center; color:var(--gray-500); font-size:12.5px;">
                  Sin internaciones previas registradas en el sistema.
                </div>
              `;
            }
            return `
              <div style="display:flex; flex-direction:column; gap:8px;">
                ${hEntries.slice(0, 3).map(h => `
                  <div style="background:#ffffff; border:1px solid var(--gray-200); border-radius:10px; padding:10px 14px; display:flex; justify-content:space-between; align-items:center; font-size:12px;">
                    <div>
                      <span style="font-weight:700; color:var(--gray-800);">${escapeHtml(h.causa || 'Internación')}</span>
                      <div style="color:var(--gray-500); font-size:11px; margin-top:2px;">
                        Ingreso: ${h.fecha_ingreso ? formatDate(h.fecha_ingreso, true) : 'S/D'} · Ubicación: ${escapeHtml(h.area_cama || 'S/D')}
                      </div>
                    </div>
                    <span class="badge" style="font-size:10.5px; font-weight:700; padding:2px 8px; ${!h.fecha_egreso ? 'background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc;' : 'background:#f1f5f9; color:#475569; border:1px solid #cbd5e1;'}">
                      ${!h.fecha_egreso ? 'Internado Activo' : escapeHtml(h.resultado_egreso || 'Alta médica')}
                    </span>
                  </div>
                `).join('')}
              </div>
            `;
          })()}
        </div>

        <!-- Seccion: Historial de Eventos Código Azul -->
        <div style="border-top:1px solid var(--gray-200); padding-top:16px;">
          <h3 style="font-size:14px; font-weight:800; color:var(--gray-800); margin:0 0 12px 0; display:flex; align-items:center; gap:6px;">
            ${icon('activity', 16)} Historial de Eventos de Código Azul Registrados (${pacienteCodigos.length})
          </h3>
          ${pacienteCodigos.length === 0 ? `
            <div style="background:#f8fafc; border:1px dashed var(--gray-300); border-radius:10px; padding:16px; text-align:center; color:var(--gray-500); font-size:12.5px;">
              Este paciente no registra eventos de Código Azul en su historial clínico.
            </div>
          ` : `
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${pacienteCodigos.map(c => {
                const isFatal = c.estado?.value === 'fatal';
                return `
                  <div style="background:${isFatal ? '#fff8f8' : '#f0fdf4'}; border:1px solid ${isFatal ? '#fecaca' : '#bbf7d0'}; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; gap:12px;">
                    <div>
                      <div style="font-weight:700; font-size:13px; color:var(--gray-800);">
                        Código Azul #${c.id} · ${escapeHtml(c.ubicacion || 'Guardia')}
                      </div>
                      <div style="font-size:11.5px; color:var(--gray-500); margin-top:2px;">
                        Fecha: ${new Date(c.fecha || c.createdAt).toLocaleString()} · Causa: ${escapeHtml(c.causa?.label || 'S/D')}
                      </div>
                    </div>
                    <a href="#/detalle/${c.id}" class="btn btn-sm" onclick="document.querySelector('.paciente-detail-overlay')?.remove();" style="background:${isFatal ? '#dc2626' : '#16a34a'}; color:#fff; font-weight:700; font-size:11.5px; padding:4px 10px; border-radius:6px; text-decoration:none; display:inline-flex; align-items:center; gap:4px;">
                      Ver Detalle Completo ${icon('chevronRight', 12)}
                    </a>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

      </div>

      <!-- Footer -->
      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; padding:14px 24px; border-top:1px solid var(--gray-200); background:#f8fafc;">
        <div>
          ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
            <button class="btn btn-secondary btn-sm" onclick="document.querySelector('.paciente-detail-overlay')?.remove(); openPacienteModal(${paciente.id});" style="font-weight:700;">
              ${icon('edit', 14)} Editar Paciente
            </button>
          `}
        </div>
        <button class="btn btn-primary btn-sm" onclick="this.closest('.paciente-detail-overlay').remove()">
          Cerrar Ficha
        </button>
      </div>

    </div>
  `;

  document.body.appendChild(overlay);
}

window.openPacienteModal = openPacienteModal;
window.openPacienteDetailModal = openPacienteDetailModal;
window.openHistorialClinicoModal = openHistorialClinicoModal;
window.confirmAltaPaciente = confirmAltaPaciente;
window.doAltaPaciente = doAltaPaciente;
window.reingresarPaciente = reingresarPaciente;
window.doReingresarPaciente = doReingresarPaciente;
window.openReingresoCamaModal = openReingresoCamaModal;
window.showReingresoFallecidoModal = showReingresoFallecidoModal;
window.handleReingresoEditarCodigo = handleReingresoEditarCodigo;
window.handleReingresoEliminarCodigo = handleReingresoEliminarCodigo;
window.toggleSinCamaFilter = toggleSinCamaFilter;
window.confirmDeletePaciente = confirmDeletePaciente;
window.deletePaciente = deletePaciente;

// Modal de Historial Clínico Completo con Línea de Tiempo
function openHistorialClinicoModal(pacienteId) {
  const currentList = getPacientes();
  const paciente = currentList.find(p => p.id === pacienteId);
  const dni = paciente ? paciente.dni : null;
  const nombreCompleto = paciente ? `${paciente.apellido}, ${paciente.nombre}` : 'Paciente';

  const historyEntries = typeof getHistorialClinicoPorPaciente === 'function' ? getHistorialClinicoPorPaciente(pacienteId, dni) : [];

  document.querySelector('.historial-clinico-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active historial-clinico-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  const codigos = typeof getData === 'function' ? getData() : [];

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:95%; max-width:720px; max-height:85vh; display:flex; flex-direction:column; box-shadow:var(--shadow-lg); overflow:hidden;">
      <!-- Modal Header -->
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:linear-gradient(135deg, #f8fafc, #edf2f7); flex-shrink:0;">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="color:var(--celeste-dark, #0369a1); font-size:20px;">${icon('clock')}</span>
            <h2 style="font-size:18px; font-weight:800; color:var(--gray-900); margin:0;">
              Historial Clínico de Internaciones
            </h2>
          </div>
          <p style="font-size:12.5px; color:var(--gray-600); margin:4px 0 0 28px; font-weight:600;">
            Paciente: <strong style="color:var(--gray-900);">${escapeHtml(nombreCompleto)}</strong> ${dni ? `(DNI: ${formatDNI(dni)})` : ''}
          </p>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.historial-clinico-modal-overlay').remove()">&times;</button>
      </div>

      <!-- Modal Body (Timeline) -->
      <div class="modal-body" style="padding:20px 24px; overflow-y:auto; flex:1; min-height:0; background:#f8fafc;">
        ${historyEntries.length === 0 ? `
          <div style="padding:40px 20px; text-align:center; background:#ffffff; border-radius:12px; border:1px dashed var(--gray-300);">
            <div style="font-size:36px; color:var(--gray-400); margin-bottom:8px;">${icon('fileText')}</div>
            <h4 style="font-size:15px; font-weight:700; color:var(--gray-700); margin:0 0 6px 0;">Sin internaciones previas registradas</h4>
            <p style="font-size:12.5px; color:var(--gray-500); margin:0;">Este paciente no registra antecedentes de internación previa en el sistema.</p>
          </div>
        ` : `
          <div class="timeline" style="position:relative; padding-left:24px; border-left:3px solid var(--celeste-200, #bae6fd); display:flex; flex-direction:column; gap:20px;">
            ${historyEntries.map((h, i) => {
              const isActiva = !h.fecha_egreso;
              const fIngreso = h.fecha_ingreso ? formatDate(h.fecha_ingreso, true) : 'Fecha no registrada';
              const fEgreso = h.fecha_egreso ? formatDate(h.fecha_egreso, true) : 'Internación Activa en Curso';

              let outcomeBadgeStyle = 'background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc;';
              if (h.resultado_egreso === 'Alta médica') outcomeBadgeStyle = 'background:#dcfce7; color:#15803d; border:1px solid #86efac;';
              else if (h.resultado_egreso === 'Derivado a otro centro') outcomeBadgeStyle = 'background:#fef3c7; color:#b45309; border:1px solid #fde047;';
              else if (h.resultado_egreso === 'Fallecido') outcomeBadgeStyle = 'background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;';

              const codigoAzulObj = h.id_codigo_azul ? codigos.find(c => c.id === h.id_codigo_azul) : null;

              return `
                <div class="timeline-item" style="position:relative;">
                  <!-- Timeline Node Dot -->
                  <div style="position:absolute; left:-33px; top:4px; width:16px; height:16px; border-radius:50%; background:${isActiva ? '#0284c7' : '#059669'}; border:3px solid #ffffff; box-shadow:0 0 0 2px ${isActiva ? '#7dd3fc' : '#a7f3d0'};"></div>

                  <div style="background:#ffffff; border-radius:12px; border:1px solid var(--gray-200); padding:16px 18px; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                    <!-- Header Event -->
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px; margin-bottom:10px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
                      <div>
                        <span style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px; color:${isActiva ? '#0284c7' : '#475569'}; background:${isActiva ? '#e0f2fe' : '#f1f5f9'}; padding:2px 8px; border-radius:4px;">
                          ${isActiva ? 'Internación Activa' : `Internación #${historyEntries.length - i}`}
                        </span>
                        <h4 style="font-size:14px; font-weight:700; color:var(--gray-900); margin:6px 0 0 0;">
                          ${escapeHtml(h.causa || 'Diagnóstico no especificado')}
                        </h4>
                      </div>

                      <span class="badge" style="${outcomeBadgeStyle} font-size:11px; font-weight:700; padding:4px 10px;">
                        ${isActiva ? 'En Internación' : escapeHtml(h.resultado_egreso || 'Alta médica')}
                      </span>
                    </div>

                    <!-- Details Grid -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:10px; font-size:12.5px; color:var(--gray-700);">
                      <div>
                        <span style="color:var(--gray-500); font-size:11px; display:block; font-weight:600;">Ingreso</span>
                        <strong>${fIngreso}</strong>
                      </div>
                      <div>
                        <span style="color:var(--gray-500); font-size:11px; display:block; font-weight:600;">Egreso</span>
                        <strong style="color:${isActiva ? '#0284c7' : 'inherit'};">${fEgreso}</strong>
                      </div>
                      <div>
                        <span style="color:var(--gray-500); font-size:11px; display:block; font-weight:600;">Ubicación (Área y Cama)</span>
                        <strong>${escapeHtml(h.area_cama || 'S/D')}</strong>
                      </div>
                      <div>
                        <span style="color:var(--gray-500); font-size:11px; display:block; font-weight:600;">Médico Responsable</span>
                        <strong>${escapeHtml(h.medico_responsable || 'Médico de Guardia')}</strong>
                      </div>
                    </div>

                    <!-- Código Azul Association (if any) -->
                    ${codigoAzulObj ? `
                      <div style="margin-top:12px; padding:10px 12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; display:flex; align-items:center; justify-content:space-between; gap:10px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                          <span style="color:#1d4ed8; font-size:16px;">${icon('activity')}</span>
                          <div>
                            <div style="font-size:12px; font-weight:700; color:#1e40af;">Evento Código Azul Asociado (ID #${codigoAzulObj.id})</div>
                            <div style="font-size:11px; color:#3b82f6;">Fecha: ${formatDate(codigoAzulObj.fecha, true)} · Estado: ${escapeHtml(codigoAzulObj.estado ? codigoAzulObj.estado.label : 'Registrado')}</div>
                          </div>
                        </div>
                        <button class="btn btn-sm" style="font-size:11px; font-weight:700; background:#1d4ed8; color:#ffffff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer;" onclick="this.closest('.historial-clinico-modal-overlay').remove(); window.location.hash='#/detalle/${codigoAzulObj.id}'">
                          Ver Detalle Código Azul
                        </button>
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50); flex-shrink:0;">
        <span style="font-size:12px; color:var(--gray-500); font-weight:600;">
          Total registros de internación: <strong>${historyEntries.length}</strong>
        </span>
        <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.historial-clinico-modal-overlay').remove()">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}


