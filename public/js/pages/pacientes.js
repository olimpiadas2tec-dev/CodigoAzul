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
      <button class="btn btn-primary btn-sm" onclick="openPacienteModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Nuevo Paciente
      </button>
    </div>

    <div class="page-body">
      <div class="card scale-in">
        <div class="card-body" style="padding-bottom:0;">
          <div class="filters-bar" style="display:flex; flex-wrap:nowrap; gap:6px; align-items:center; width:100%;">
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
            <!-- Filtro Checkbox Compacto curvo y gris -->
            <div style="flex:0 0 auto; display:flex; align-items:center;">
              <label for="paciente-sincama-filter" style="display:inline-flex; align-items:center; gap:5px; background:#ffffff; border:1.5px solid ${pacientesState.sinCama ? 'var(--celeste)' : '#e2e8f0'}; padding:6px 10px; border-radius:10px; cursor:pointer; font-size:12px; font-weight:700; color:${pacientesState.sinCama ? 'var(--celeste-dark)' : 'var(--gray-700)'}; user-select:none; white-space:nowrap; width:fit-content; margin:0; transition:all 0.15s ease;">
                <input type="checkbox" id="paciente-sincama-filter" ${pacientesState.sinCama ? 'checked' : ''} style="accent-color:var(--celeste); width:14px !important; height:14px !important; min-width:14px !important; max-width:14px !important; margin:0; cursor:pointer;" />
                <span>🛏️ Sin Cama Asignada</span>
              </label>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="clearPacienteFilters()" style="flex:0 0 auto; padding:6px 12px; border-radius:10px; font-size:12px; font-weight:600; white-space:nowrap;">Limpiar</button>
          </div>
        </div>

        <div class="table-container table-stagger" style="overflow-x:auto;">
          <table style="width:100%; min-width:1050px; border-collapse:collapse;">
            <thead>
              <tr style="background:var(--gray-50); border-bottom:1px solid var(--gray-200);">
                <th style="padding:12px 10px; vertical-align:middle; text-align:left;">#</th>
                <th style="padding:12px 10px; vertical-align:middle; text-align:left;">Paciente</th>
                <th style="padding:12px 10px; vertical-align:middle; text-align:left; white-space:nowrap;">DNI / Edad</th>
                <th style="padding:12px 10px; vertical-align:middle; text-align:left;">Área & Cama</th>
                <th style="padding:12px 10px; vertical-align:middle; text-align:left;">Causa / Diagnóstico</th>
                <th style="padding:12px 10px; vertical-align:middle; text-align:left;">Médico Responsable</th>
                <th style="padding:12px 10px; vertical-align:middle; text-align:left;">Grupo & Alergias</th>
                <th style="padding:12px 14px; vertical-align:middle; text-align:center; white-space:nowrap; min-width:100px;">ESTADO</th>
                <th style="padding:8px 10px; vertical-align:middle; text-align:center; position:sticky; right:0; background:var(--gray-50); z-index:5; box-shadow:-6px 0 10px -4px rgba(0,0,0,0.08); white-space:nowrap;">Acciones</th>
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
                        <button class="btn btn-primary btn-sm" onclick="openPacienteModal()">
                          ${icon('user')} + Registrar Nuevo Paciente Aquí
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="clearPacienteFilters()">
                          Limpiar Filtros
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ` : filtered.map(p => {
                const doc = personalList.find(d => d.id === p.id_personal);
                const docName = doc ? `${doc.apellido}, ${doc.nombre}` : 'Médico de Guardia';
                const hasAlergia = p.alergias && p.alergias.trim().toLowerCase() !== 'ninguna' && p.alergias.trim() !== '-';
                const formattedDNI = p.dni ? formatDNI(p.dni) : 'S/D';

                return `
                  <tr class="paciente-table-row" style="border-bottom:1px solid var(--gray-100);">
                    <td style="padding:12px 10px; vertical-align:middle; font-weight:600; color:var(--gray-400);">${p.id}</td>
                    <td style="padding:12px 10px; vertical-align:middle; font-weight:700; color:var(--gray-800); white-space:nowrap;">${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</td>
                    <td style="padding:12px 10px; vertical-align:middle; white-space:nowrap;">
                      <span style="font-size:12px; font-weight:600; color:var(--gray-800);">${escapeHtml(formattedDNI)}</span>
                      ${p.edad ? `<span style="font-size:12px; color:var(--gray-500);"> · ${p.edad} años</span>` : ''}
                    </td>
                    <td style="padding:12px 10px; vertical-align:middle;">
                      <div style="font-weight:600; color:var(--gray-700);">${escapeHtml(p.area)}</div>
                      <div style="font-size:11px; color:var(--gray-700); font-weight:700;">${icon('bed')} ${escapeHtml(p.cama || 'Sin Cama')}</div>
                    </td>
                    <td style="padding:12px 10px; vertical-align:middle;">
                      <span style="font-size:12px; font-weight:600; color:var(--gray-800); background:var(--gray-100); border:1px solid var(--gray-200); padding:4px 8px; border-radius:6px; display:inline-block;">
                        ${escapeHtml(p.causa || 'Paro Cardiorrespiratorio')}
                      </span>
                    </td>
                    <td style="padding:12px 10px; vertical-align:middle; font-size:12px; color:var(--gray-700); white-space:nowrap;">${escapeHtml(docName)}</td>
                    <td style="padding:12px 10px; vertical-align:middle;">
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
                    <td style="padding:10px 14px; vertical-align:middle; text-align:center; white-space:nowrap; min-width:100px;">
                      <span class="badge ${p.activo ? 'badge-success' : 'badge-warning'}" style="font-size:11px; padding:4px 10px;">
                        ${p.activo ? 'Internado' : 'Alta'}
                      </span>
                    </td>
                    <td class="sticky-actions-cell" style="padding:8px 10px; vertical-align:middle; text-align:center; position:sticky; right:0; z-index:2; box-shadow:-6px 0 10px -4px rgba(0,0,0,0.08); white-space:nowrap;">
                      <div style="display:flex; gap:6px; align-items:center; justify-content:center;">
                        <button class="action-link" style="font-size:11.5px; font-weight:600;" onclick="openPacienteModal(${p.id})">Editar</button>
                        ${p.activo ? `
                          <button class="btn btn-sm" style="padding:3px 7px; font-size:11px; font-weight:600; background:#059669; color:#ffffff; border:none; border-radius:5px; display:inline-flex; align-items:center; gap:3px; box-shadow:0 1px 2px rgba(0,0,0,0.08); cursor:pointer;" onclick="confirmAltaPaciente(${p.id})" title="Registrar Alta Médica (Requiere confirmación)">
                            ${icon('checkCircle', 11)} Dar de Alta
                          </button>
                        ` : `
                          <button class="btn btn-sm" style="padding:3px 7px; font-size:11px; font-weight:600; background:var(--celeste-dark); color:#ffffff; border:none; border-radius:5px; display:inline-flex; align-items:center; gap:3px; box-shadow:0 1px 2px rgba(0,0,0,0.08); cursor:pointer;" onclick="reingresarPaciente(${p.id})" title="Reingresar Paciente">
                            ${icon('refreshCw', 11)} Reingresar
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
  const sinCama = document.getElementById('paciente-sincama-filter');

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

  if (sinCama) {
    sinCama.addEventListener('change', (e) => {
      pacientesState.sinCama = e.target.checked;
      renderApp();
    });
  }
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
              <label>DNI / Documento *</label>
              <input type="text" id="m-dni" required placeholder="Ej: 32.145.678" value="${paciente ? escapeHtml(paciente.dni || '') : ''}" />
            </div>
            <div class="form-group">
              <label>Edad / Fecha Nacimiento</label>
              <input type="number" id="m-edad" min="1" max="120" placeholder="Años (Ej: 65)" value="${paciente ? (paciente.edad || 60) : 60}" />
            </div>
            <div class="form-group full-width" style="grid-column: 1 / -1;">
              <label style="color:var(--celeste-dark); font-weight:700;">${icon('alertTriangle')} Causa de Intervención / Diagnóstico Principal *</label>
              <input type="text" id="m-causa" required placeholder="Ej: Infarto Agudo de Miocardio / Shock Cardiogénico" value="${paciente ? escapeHtml(paciente.causa || '') : ''}" />
            </div>
            <div class="form-group">
              <label>Área Hospitalaria *</label>
              <select id="m-area" required>
                <option value="">-- Seleccionar área clínica --</option>
                ${getAreas().map(a => `<option value="${escapeHtml(a.nombre)}" ${paciente && paciente.area === a.nombre ? 'selected' : ''}>${escapeHtml(a.nombre)}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Cama / Box (Solo Camas Disponibles) *</label>
              <select id="m-cama" required>
                <option value="">-- Seleccionar Cama Libre --</option>
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

            <!-- Médico / Personal a Cargo con Buscador en Tiempo Real -->
            <div class="form-group full-width" style="grid-column: 1 / -1;">
              <label style="color:var(--celeste-dark); font-weight:700;">Médico / Personal de Salud a Cargo *</label>
              <div class="search-input-wrapper" style="margin-bottom:6px;">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" id="filter-modal-personal" placeholder="Filtrar personal por nombre, apellido o rol..." style="font-size:12.5px; padding:6px 10px 6px 36px; border:1.5px solid var(--celeste-300); border-radius:6px; width:100%;" />
              </div>
              <select id="m-personal" required style="font-weight:600; padding:8px 10px; border-radius:6px; width:100%;">
                <option value="">-- Seleccionar Profesional Responsable --</option>
                ${personalList.map(pers => `
                  <option value="${pers.id}" ${paciente && (paciente.id_personal === pers.id || (paciente.personal_a_cargo && paciente.personal_a_cargo.includes(pers.apellido))) ? 'selected' : ''} data-text="${escapeHtml(pers.apellido + ' ' + pers.nombre + ' ' + (pers.nombre_rol || ''))}">
                    ${pers.apellido}, ${pers.nombre} — [${pers.nombre_rol || 'Médico'}] (${pers.area || 'Guardia'})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label>Grupo Sanguíneo</label>
              <select id="m-grupo">
                ${['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'S/D'].map(g => `<option value="${g}" ${paciente && paciente.grupo === g ? 'selected' : ''}>${g}</option>`).join('')}
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
  const personalSelect = document.getElementById('m-personal');
  
  areaSelect.addEventListener('change', () => {
    const selectedArea = areaSelect.value;
    const freeCamas = getCamas().filter(c => c.area_nombre === selectedArea && (c.estado === 'Libre' || (isEdit && paciente && paciente.area === selectedArea && paciente.cama === c.numero)));
    
    if (freeCamas.length === 0) {
      camaSelect.innerHTML = `<option value="">${icon('alertTriangle')} No hay camas libres en esta área</option>`;
    } else {
      camaSelect.innerHTML = `
        <option value="">-- Seleccionar Cama Libre (${freeCamas.length} disponibles) --</option>
        ${freeCamas.map(c => `
          <option value="${escapeHtml(c.numero)}">
            ${icon('circleFill')} ${escapeHtml(c.numero)} [Disponible]
          </option>
        `).join('')}
      `;
    }

    // Auto-seleccionar al primer personal de salud que esté a cargo de esta área
    if (selectedArea && personalSelect) {
      const personalDeArea = personalList.find(p => p.area === selectedArea);
      if (personalDeArea) {
        personalSelect.value = personalDeArea.id;
      }
    }
  });

  // Filtro en tiempo real para Personal a Cargo (sin importar tildes)
  const filterPersonalInput = document.getElementById('filter-modal-personal');
  // personalSelect ya fue declarado arriba
  if (filterPersonalInput && personalSelect) {
    filterPersonalInput.addEventListener('input', () => {
      const q = normalizeText(filterPersonalInput.value);
      Array.from(personalSelect.options).forEach(opt => {
        if (!opt.value) return;
        const text = normalizeText(opt.getAttribute('data-text') || opt.text);
        opt.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });
  }

  document.getElementById('paciente-modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const apellido = document.getElementById('m-apellido').value.trim();
    const nombre = document.getElementById('m-nombre').value.trim();
    const dni = document.getElementById('m-dni').value.trim();
    const edad = parseInt(document.getElementById('m-edad').value) || 60;
    const causa = document.getElementById('m-causa').value.trim();
    const area = document.getElementById('m-area').value;
    const cama = document.getElementById('m-cama').value.trim();
    const id_personal = parseInt(document.getElementById('m-personal').value);
    const grupo = document.getElementById('m-grupo').value;
    const alergias = document.getElementById('m-alergias').value.trim();

    if (!apellido || !nombre || !dni || !causa || !area || !cama || !id_personal) {
      showToast('Complete todos los campos obligatorios (*)', 'error');
      return;
    }

    const currentList = getPacientes();

    // Actualizar estado de la cama a Ocupada
    const camasList = getCamas();
    const camaObj = camasList.find(c => c.area_nombre === area && c.numero === cama);
    if (camaObj) {
      camaObj.estado = 'Ocupada';
      saveCamas(camasList);
    }

    const persObj = personalList.find(p => p.id === id_personal);
    const personal_a_cargo = persObj ? `${persObj.apellido}, ${persObj.nombre} (${persObj.nombre_rol || 'Médico'})` : 'Médico de Guardia';

    if (isEdit) {
      const idx = currentList.findIndex(p => p.id === editId);
      if (idx !== -1) {
        currentList[idx] = {
          ...currentList[idx],
          apellido, nombre, dni, edad, causa, area, cama, id_personal, personal_a_cargo, grupo, alergias
        };
        savePacientes(currentList);
        showToast('Datos del paciente actualizados con éxito', 'success');
      }
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map(p => p.id)) + 1 : 11;
      currentList.push({
        id: newId,
        apellido, nombre, dni, edad, causa, area, cama, id_personal, personal_a_cargo, grupo, alergias, activo: true
      });
      savePacientes(currentList);
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
        <div style="background:var(--gray-50); padding:12px; border-radius:var(--radius); border:1px solid var(--gray-200); font-size:13px; color:var(--gray-600);">
          <div>${icon('mapPin')} <strong>Ubicación actual:</strong> ${escapeHtml(p.area)} — ${escapeHtml(p.cama || 'Cama')}</div>
          <div style="margin-top:4px; color:#059669; font-weight:600;">${icon('star')} Al dar de alta, la cama asignada quedará libre y disponible para otros pacientes.</div>
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
    p.activo = false;
    savePacientes(currentList);

    // Liberar la cama
    const camasList = getCamas();
    const camaObj = camasList.find(c => c.area_nombre === p.area && c.numero === p.cama);
    if (camaObj) {
      camaObj.estado = 'Libre';
      saveCamas(camasList);
    }

    showToast('Alta médica registrada con éxito. Cama liberada.', 'success');
  }
  document.querySelector('.alta-modal-overlay')?.remove();
  renderApp();
}

function reingresarPaciente(id) {
  const currentList = getPacientes();
  const idx = currentList.findIndex(p => p.id === id);
  if (idx !== -1) {
    const p = currentList[idx];
    p.activo = true;
    savePacientes(currentList);

    // Marcar cama como Ocupada
    const camasList = getCamas();
    const camaObj = camasList.find(c => c.area_nombre === p.area && c.numero === p.cama);
    if (camaObj) {
      camaObj.estado = 'Ocupada';
      saveCamas(camasList);
    }

    showToast('Paciente reingresado a internación activa.', 'success');
    renderApp();
  }
}

window.openPacienteModal = openPacienteModal;
window.confirmAltaPaciente = confirmAltaPaciente;
window.doAltaPaciente = doAltaPaciente;
window.reingresarPaciente = reingresarPaciente;

