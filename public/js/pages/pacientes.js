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
            <button class="btn btn-secondary btn-sm" onclick="clearPacienteFilters()" style="flex:0 0 auto; padding:6px 14px; border-radius:10px; font-size:12px; font-weight:600; white-space:nowrap;">Limpiar</button>
          </div>
        </div>

        <div class="table-container table-stagger" style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead>
              <tr style="background:var(--gray-50); border-bottom:1px solid var(--gray-200);">
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">#</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left;">PACIENTE</th>
                <th style="padding:10px 12px; vertical-align:middle; text-align:left; white-space:nowrap;">DNI / EDAD</th>
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
                    <td style="padding:10px 12px; vertical-align:middle; font-weight:600; color:var(--gray-400);">${p.id}</td>
                    <td style="padding:10px 12px; vertical-align:middle; font-weight:700; color:var(--gray-800); white-space:nowrap;">${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</td>
                    <td style="padding:10px 12px; vertical-align:middle; white-space:nowrap;">
                      <span style="font-size:12px; font-weight:600; color:var(--gray-800);">${escapeHtml(formattedDNI)}</span>
                      ${p.edad ? `<span style="font-size:12px; color:var(--gray-500);"> · ${p.edad} años</span>` : ''}
                    </td>
                    <td style="padding:10px 12px; vertical-align:middle;">
                      <div style="font-weight:600; color:var(--gray-700);">${escapeHtml(p.area)}</div>
                      <div style="font-size:11px; color:var(--gray-700); font-weight:700;">${icon('bed')} ${escapeHtml(p.cama || 'Sin Cama')}</div>
                    </td>
                    <td style="padding:10px 12px; vertical-align:middle;">
                      <span style="font-size:12px; font-weight:600; color:var(--gray-800); background:var(--gray-100); border:1px solid var(--gray-200); padding:4px 8px; border-radius:6px; display:inline-block;">
                        ${escapeHtml(p.causa || 'Paro Cardiorrespiratorio')}
                      </span>
                    </td>
                    <td style="padding:10px 12px; vertical-align:middle; font-size:12px; color:var(--gray-700); white-space:nowrap;">${escapeHtml(docName)}</td>
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
                      <span class="badge ${p.activo ? 'badge-success' : 'badge-warning'}" style="font-size:11px; padding:4px 10px;">
                        ${p.activo ? 'Internado' : 'Alta'}
                      </span>
                    </td>
                    <td style="padding:10px 14px; vertical-align:middle; text-align:center; white-space:nowrap;">
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

            <!-- Médico / Personal de Salud a Cargo (UNA SOLA BARRA CON FILTRO EN TIEMPO REAL) -->
            <div class="form-group full-width" style="grid-column: 1 / -1; position: relative;">
              <label style="color:var(--celeste-dark); font-weight:700;">Médico / Personal de Salud a Cargo *</label>
              <div style="position:relative; width:100%;">
                <input type="text" id="m-personal-search" placeholder="Escriba para buscar y seleccionar profesional a cargo..." autocomplete="off" value="${escapeHtml(initialDocText)}" required style="font-size:12.5px; font-weight:600; padding:9px 12px 9px 36px; border:1.5px solid var(--celeste-300); border-radius:10px; width:100%; outline:none; background:#ffffff; box-shadow:0 1px 2px rgba(0,0,0,0.04); transition:all 0.15s ease;" />
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:16px; height:16px; color:var(--gray-400); pointer-events:none;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="hidden" id="m-personal" value="${initialDocId}" />
                <div id="m-personal-dropdown" style="display:none; position:absolute; top:calc(100% + 4px); left:0; right:0; max-height:200px; overflow-y:auto; background:#ffffff; border:1.5px solid var(--celeste-300); border-radius:10px; z-index:99999; box-shadow:0 8px 24px rgba(0,0,0,0.15); padding:4px 0;"></div>
              </div>
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
    const dni = document.getElementById('m-dni').value.trim();
    const edad = parseInt(document.getElementById('m-edad').value) || 60;
    const causa = document.getElementById('m-causa').value.trim();
    const area = document.getElementById('m-area') ? document.getElementById('m-area').value : '';
    const cama = document.getElementById('m-cama') ? document.getElementById('m-cama').value.trim() : '';
    const id_personal = parseInt(document.getElementById('m-personal').value) || 0;
    const grupo = document.getElementById('m-grupo') ? document.getElementById('m-grupo').value : 'S/D';
    const alergias = document.getElementById('m-alergias') ? document.getElementById('m-alergias').value.trim() : 'Ninguna';

    let finalCama = cama;
    let finalArea = area;
    let finalActivo = true;

    if (!cama || cama === 'Sin Cama' || area === 'Sin Designar' || !area) {
      finalCama = '';
      finalArea = 'Sin Designar';
      finalActivo = false;
    }

    if (!apellido || !nombre || !dni || !causa || !id_personal) {
      showToast('Complete todos los campos obligatorios (*)', 'error');
      return;
    }

    const currentList = getPacientes();
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

    // 2. Si asignó una nueva cama, ocuparla
    if (finalCama) {
      const newCamaObj = camasList.find(c => (c.area_nombre === finalArea && c.numero === finalCama) || c.numero === finalCama);
      if (newCamaObj) {
        newCamaObj.estado = 'Ocupada';
        newCamaObj.id_paciente = isEdit ? editId : (currentList.length > 0 ? Math.max(...currentList.map(p => p.id)) + 1 : 11);
        newCamaObj.paciente_nombre = `${apellido}, ${nombre}`;
      }
    }

    saveCamas(camasList);

    const persObj = personalList.find(p => p.id === id_personal);
    const personal_a_cargo = persObj ? `${persObj.apellido}, ${persObj.nombre} (${persObj.nombre_rol || 'Médico'})` : 'Médico de Guardia';

    if (isEdit) {
      const idx = currentList.findIndex(p => p.id === editId);
      if (idx !== -1) {
        currentList[idx] = {
          ...currentList[idx],
          apellido, nombre, dni, edad, causa, area: finalArea, cama: finalCama, activo: finalActivo, id_personal, personal_a_cargo, grupo, alergias
        };
        savePacientes(currentList);
        showToast('Datos del paciente actualizados con éxito', 'success');
      }
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map(p => p.id)) + 1 : 11;
      currentList.push({
        id: newId,
        apellido, nombre, dni, edad, causa, area: finalArea, cama: finalCama, activo: finalActivo, id_personal, personal_a_cargo, grupo, alergias
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
    savePacientes(currentList);

    showToast('Alta médica registrada con éxito. Cama liberada y paciente sin área asignada.', 'success');
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

