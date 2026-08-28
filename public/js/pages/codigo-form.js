let selectedPacienteId = null;
let selectedActivadorId = null;
let isSubmittingCodigo = false;

function renderCodigoForm(editId = null) {
  const isEdit = editId !== null;
  const codigo = isEdit ? getCodigoById(editId) : null;

  isSubmittingCodigo = false;

  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  // Detección automática del turno y equipo según la hora actual
  const autoTurnoEquipo = getTurnoYEquipoActual();
  const selectedEquipo = codigo ? codigo.equipoEncargado : autoTurnoEquipo.equipo;
  const selectedTurno = codigo ? codigo.turno : autoTurnoEquipo.turno;

  // Pacientes internados activos
  const pacientesList = getPacientes().filter(p => (isEdit && codigo && (codigo.id_paciente === p.id || codigo.paciente.includes(p.apellido))) || p.activo);
  const personalList = getPersonalSalud();
  const turnosList = getTurnos();
  const equiposList = getEquipos();
  const materialesList = getMateriales();

  // No preseleccionar paciente ni personal en nuevo registro
  selectedPacienteId = isEdit && codigo ? (codigo.id_paciente || null) : null;
  selectedActivadorId = isEdit && codigo ? (codigo.activadorData?.id || null) : null;

  // Filtrar el personal del equipo seleccionado para el líder
  const eqObj = equiposList.find(e => (typeof e === 'string' ? e : e.nombre) === selectedEquipo);
  let equipoPersonal = personalList;
  let defaultLeader = '';
  if (eqObj && Array.isArray(eqObj.integrantes) && eqObj.integrantes.length > 0) {
    equipoPersonal = personalList.filter(p => eqObj.integrantes.some(i => i.id_personal === p.id));
    if (equipoPersonal.length === 0) equipoPersonal = personalList;

    // Buscar al que tenga el rol de Líder en el equipo
    const leaderInteg = eqObj.integrantes.find(i => (i.rol_en_equipo || '').toLowerCase().includes('líder') || (i.rol_en_equipo || '').toLowerCase().includes('lider'));
    if (leaderInteg) {
      const lp = personalList.find(p => p.id === leaderInteg.id_personal);
      if (lp) defaultLeader = `${lp.apellido}, ${lp.nombre} (${lp.nombre_rol || 'Médico'})`;
    }
  }

  const selectedMaterials = codigo && Array.isArray(codigo.materiales) ? codigo.materiales : [];
  const currentCausa = codigo ? (codigo.causa || '') : '';
  const isCausaPredefinida = CAUSAS_PREDEFINIDAS.slice(0, -1).includes(currentCausa);
  const currentEstado = codigo ? codigo.estado.value : 'resuelto';
  const datosCierre = (codigo && codigo.datosCierre) ? codigo.datosCierre : {};

  const hasPacienteSelected = isEdit && !!codigo && !!selectedPacienteId;
  const hasActivadorSelected = isEdit && !!codigo && !!selectedActivadorId;

  return `
    <div class="page-header page-transition">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
        <div>
          <h1>${icon(isEdit ? 'edit' : 'alertTriangle')} ${isEdit ? 'Modificar Código Azul #' + editId : 'Registro Oficial de Código Azul'}</h1>
          <p>${isEdit ? 'Actualización de intervenciones y cierre clínico' : 'Carga posterior a la emergencia con certificación médica de resultado'}</p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge" style="background:#eff6ff; color:#1d4ed8; font-weight:700; border:1px solid #bfdbfe;">
            ${icon('clock')} Guardia Activa: ${escapeHtml(autoTurnoEquipo.turno)} &middot; ${escapeHtml(autoTurnoEquipo.equipo)}
          </span>
        </div>
      </div>
    </div>

    <div class="page-body">
      ${isEdit ? `
        <div class="card scale-in" style="background:#fef2f2; border:1.5px solid #fecaca; margin-bottom:20px; padding:14px 20px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <span style="font-size:24px;">${icon('lock')}</span>
            <div>
              <strong style="color:#991b1b; font-size:14px;">Registro de Evento Clínico (${codigo.estado.label})</strong>
              <p style="color:#7f1d1d; font-size:12px; margin:2px 0 0 0;">
                Toda modificación quedará asentada en el Libro de Auditoría Legal con su usuario institucional.
              </p>
            </div>
          </div>
        </div>
      ` : ''}

      <div class="card scale-in">
        <div class="card-body">
          <form id="codigo-form" novalidate>
            
            <!-- SECCIÓN 1: PACIENTE Y CAUSA -->
            <h3 style="font-size:16px; font-weight:700; color:var(--celeste-dark); margin-bottom:16px; border-bottom:2px solid var(--celeste-100); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
              <span>${icon('user')}</span> 1. Selección de Paciente y Causa del Paro
            </h3>
            
            <div class="form-grid">
              
              <!-- Selector de Paciente con Tarjeta Única Seleccionada -->
              <div class="form-group full-width" style="grid-column: 1 / -1;">
                <label style="color:var(--celeste-dark); font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                  <span>Paciente Internado *</span>
                </label>

                <!-- Tarjeta del Paciente Seleccionado (Visible solo al seleccionar) -->
                <div id="paciente-selected-card" style="display:${hasPacienteSelected ? 'flex' : 'none'}; justify-content:space-between; align-items:center; background:#f0fdf4; border:2px solid #22c55e; border-radius:8px; padding:12px 16px; margin-bottom:8px;">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:24px;">${icon('user')}</span>
                    <div>
                      <div style="font-size:15px; font-weight:800; color:#166534;" id="sel-paciente-nombre">-</div>
                      <div style="font-size:12px; color:#15803d; margin-top:2px;">
                        <span>DNI: <strong id="sel-paciente-dni">-</strong></span> &middot; 
                        <span>Ubicación: <strong id="sel-paciente-area-cama">-</strong></span> &middot; 
                        <span>Grupo: <strong id="sel-paciente-grupo">-</strong></span> &middot; 
                        <span>Alergias: <strong id="sel-paciente-alergias">-</strong></span>
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" onclick="togglePacienteList(true)" style="font-weight:700; color:#166534; border-color:#86efac; background:#fff;">
                    ${icon('refreshCw')} Cambiar Paciente
                  </button>
                </div>

                <!-- Buscador y Lista de selección de pacientes (Visible por defecto si no hay seleccionado) -->
                <div id="paciente-dropdown-wrapper" style="display:${hasPacienteSelected ? 'none' : 'block'}; margin-top:6px;">
                  <input type="text" id="filter-paciente-input" placeholder="${icon('search')} Filtrar pacientes por nombre, DNI o área..." style="font-size:13px; padding:10px 14px; border:1.5px solid var(--celeste-300); border-radius:8px; width:100%; margin-bottom:8px;" />
                  
                  <div id="pacientes-list-container" style="max-height:200px; overflow-y:auto; border:1.5px solid var(--gray-300); border-radius:8px; background:var(--white); padding:4px;">
                    ${pacientesList.length === 0 ? `
                      <div style="padding:16px; text-align:center; color:var(--gray-400); font-size:13px;">No hay pacientes internados activos.</div>
                    ` : pacientesList.map(p => {
                      return `
                        <div class="paciente-select-item" data-id="${p.id}" data-dni="${p.dni || ''}" data-area="${p.area}" data-cama="${p.cama}" data-grupo="${p.grupo || ''}" data-alergias="${p.alergias || ''}" data-causa="${p.causa || ''}" data-nombre="${escapeHtml(p.apellido + ', ' + p.nombre)}"
                          style="padding:10px 14px; border-radius:6px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; background:#f8fafc; border:1px solid #e2e8f0; transition:all 0.15s;"
                          onclick="selectPacienteItem(${p.id})">
                          <div>
                            <strong style="font-size:14px; color:var(--gray-900);">${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</strong>
                            <span style="font-size:12px; color:var(--gray-500); margin-left:8px;">DNI: ${p.dni || 'S/D'}</span>
                          </div>
                          <span class="badge" style="background:#dbeafe; color:#1e40af; font-size:11px; font-weight:700;">
                            ${escapeHtml(p.area)} [${escapeHtml(p.cama || 'Cama')}]
                          </span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <input type="hidden" id="form-paciente-id" value="${selectedPacienteId || ''}" />
              </div>

              <!-- Causa con Selector + Opción 'Otro' -->
              <div class="form-group full-width" style="grid-column: 1 / -1;">
                <label style="color:var(--celeste-dark); font-weight:700;">${icon('alertTriangle')} Causa del Código Azul / Diagnóstico Principal *</label>
                <select id="form-causa-select" style="font-size:14px; padding:10px;">
                  <option value="">-- Seleccionar Causa del Paro --</option>
                  ${CAUSAS_PREDEFINIDAS.map(c => `
                    <option value="${c}" ${isCausaPredefinida && currentCausa === c ? 'selected' : (!isCausaPredefinida && currentCausa && c === 'Otro' ? 'selected' : '')}>
                      ${c}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group full-width" id="form-causa-otro-container" style="display:${!isCausaPredefinida && currentCausa ? 'block' : 'none'}; grid-column: 1 / -1;">
                <label style="color:#92400e; font-weight:700;">${icon('penTool')} Especifique la Causa ("Otro") *</label>
                <input type="text" id="form-causa-otro" placeholder="Detalle qué le sucedió al paciente..." value="${!isCausaPredefinida ? escapeHtml(currentCausa) : ''}" />
              </div>
            </div>

            <!-- SECCIÓN 2: PERSONAL RESPONSABLE, ACTIVACIÓN Y EQUIPOS -->
            <h3 style="font-size:16px; font-weight:700; color:var(--celeste-dark); margin:28px 0 16px 0; border-bottom:2px solid var(--celeste-100); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
              <span>${icon('phone')}</span> 2. Personal Responsable del Aviso, Equipo y Turno
            </h3>
            <div class="form-grid">
              
              <!-- Personal Activador (Con Tarjeta Única Seleccionada) -->
              <div class="form-group full-width" style="grid-column: 1 / -1;">
                <label style="color:var(--celeste-dark); font-weight:700; display:flex; justify-content:space-between; align-items:center;">
                  <span>Personal que Realizó el Aviso (Quién Llamó) *</span>
                </label>

                <!-- Tarjeta del Personal Seleccionado (Visible solo al seleccionar) -->
                <div id="activador-selected-card" style="display:${hasActivadorSelected ? 'flex' : 'none'}; justify-content:space-between; align-items:center; background:#f0fdf4; border:2px solid #22c55e; border-radius:8px; padding:12px 16px; margin-bottom:8px;">
                  <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:24px;">${icon('user')}</span>
                    <div>
                      <div style="font-size:15px; font-weight:800; color:#166534;" id="sel-activador-nombre">-</div>
                      <div style="font-size:12px; color:#15803d; margin-top:2px;">
                        <span>Rol: <strong id="sel-activador-rol">-</strong></span> &middot; 
                        <span>DNI: <strong id="sel-activador-dni">-</strong></span> &middot; 
                        <span>Sector: <strong id="sel-activador-area">-</strong></span> &middot; 
                        <span>Tel/Int: <strong id="sel-activador-tel">-</strong></span>
                      </div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-outline btn-sm" onclick="toggleActivadorList(true)" style="font-weight:700; color:#166534; border-color:#86efac; background:#fff;">
                    ${icon('refreshCw')} Cambiar Personal
                  </button>
                </div>

                <!-- Buscador y Lista de selección de Personal (Visible por defecto si no hay seleccionado) -->
                <div id="activador-dropdown-wrapper" style="display:${hasActivadorSelected ? 'none' : 'block'}; margin-top:6px;">
                  <input type="text" id="filter-activador-input" placeholder="${icon('search')} Filtrar personal por nombre, rol o sector en tiempo real..." style="font-size:13px; padding:10px 14px; border:1.5px solid var(--celeste-300); border-radius:8px; width:100%; margin-bottom:8px;" />
                  
                  <div id="activador-list-container" style="max-height:180px; overflow-y:auto; border:1.5px solid var(--gray-300); border-radius:8px; background:var(--white); padding:4px;">
                    ${personalList.map(pers => {
                      return `
                        <div class="activador-select-item" data-id="${pers.id}" data-nombre="${escapeHtml(pers.apellido + ', ' + pers.nombre)}" data-rol="${escapeHtml(pers.nombre_rol || 'Personal')}" data-dni="${pers.dni || ''}" data-tel="${pers.telefono || ''}" data-area="${pers.area || ''}"
                          style="padding:10px 14px; border-radius:6px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; background:#f8fafc; border:1px solid #e2e8f0; transition:all 0.15s;"
                          onclick="selectActivadorItem(${pers.id})">
                          <div>
                            <strong style="font-size:14px; color:var(--gray-900);">${escapeHtml(pers.apellido)}, ${escapeHtml(pers.nombre)}</strong>
                            <span style="font-size:12px; color:var(--gray-500); margin-left:8px;">[${escapeHtml(pers.nombre_rol || 'Personal')}]</span>
                          </div>
                          <span style="font-size:11.5px; color:var(--gray-600);">DNI: ${pers.dni || 'S/D'} (${pers.area || 'Guardia'})</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>

                <input type="hidden" id="form-activador-id" value="${selectedActivadorId || ''}" />
              </div>

              <div class="form-group">
                <label>Fecha y Hora del Evento *</label>
                <input type="datetime-local" id="form-fecha" value="${codigo ? codigo.fecha.slice(0, 16) : localDate}" />
              </div>

              <div class="form-group">
                <label>Punto de Origen de la Alarma</label>
                <select id="form-origen">
                  ${ORIGENES.map(o => `<option value="${o}" ${codigo && codigo.origenLlamada === o ? 'selected' : ''}>${o}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Equipo de Emergencia Interviniente *</label>
                <select id="form-equipo">
                  ${equiposList.map(eq => {
                    const eqNom = typeof eq === 'string' ? eq : eq.nombre;
                    return `<option value="${eqNom}" ${selectedEquipo === eqNom ? 'selected' : ''}>${escapeHtml(eqNom)}</option>`;
                  }).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Turno Horario *</label>
                <select id="form-turno">
                  ${turnosList.map(t => `<option value="${t.nombre}" ${selectedTurno === t.nombre ? 'selected' : ''}>${escapeHtml(t.nombre)} (${t.hora_inicio} - ${t.hora_fin})</option>`).join('')}
                </select>
              </div>

              <!-- Médico Líder: Autoselecciona por defecto al Líder del Equipo -->
              <div class="form-group full-width" style="grid-column: 1 / -1;">
                <label style="color:var(--celeste-dark); font-weight:700;">
                  Médico Líder de Reanimación (ACLS) — [Personal del <span id="equipo-label-resp">${escapeHtml(selectedEquipo)}</span>] *
                </label>
                <select id="form-responsable" style="border:2px solid var(--celeste-300); font-weight:700; padding:10px 12px; border-radius:8px; width:100%; font-size:14px;">
                  <option value="">-- Seleccionar Médico Líder del Equipo --</option>
                  ${equipoPersonal.map(pers => {
                    const optVal = `${pers.apellido}, ${pers.nombre} (${pers.nombre_rol || 'Médico'})`;
                    const isSelected = codigo ? codigo.responsable.includes(pers.apellido) : (defaultLeader === optVal);
                    return `
                      <option value="${optVal}" ${isSelected ? 'selected' : ''}>
                        ${pers.apellido}, ${pers.nombre} — [${pers.nombre_rol || 'Médico'}]
                      </option>
                    `;
                  }).join('')}
                </select>
              </div>

              <div class="form-group">
                <label style="color:var(--celeste-dark); font-weight:700;">Resultado Clínico del Evento *</label>
                <select id="form-estado" style="border:2px solid var(--celeste-300); font-weight:700; padding:10px 12px; border-radius:8px;">
                  ${ESTADOS.map(e => `<option value="${e.value}" ${currentEstado === e.value ? 'selected' : ''}>${e.label}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label>Tiempo de Respuesta (minutos) *</label>
                <input type="number" id="form-tiempo" min="0.5" step="0.1" max="60" value="${codigo ? codigo.tiempoRespuesta : '3.2'}" />
              </div>
            </div>

            <!-- SECCIÓN 3: PROTOCOLO DE CIERRE CLÍNICO Y CERTIFICACIÓN MÉDICA -->
            <div id="section-cierre-clinico" style="margin-top:28px;">
              <h3 style="font-size:16px; font-weight:700; color:#065f46; margin-bottom:16px; border-bottom:2px solid #a7f3d0; padding-bottom:8px; display:flex; align-items:center; gap:8px;">
                <span>${icon('clipboard')}</span> 3. Protocolo de Cierre Clínico y Certificación
              </h3>

              <!-- Cierre ROSC -->
              <div id="cierre-rosc-panel" style="display:${currentEstado === 'resuelto' ? 'block' : 'none'}; background:#ecfdf5; border:1px solid #a7f3d0; border-radius:var(--radius); padding:16px; margin-bottom:20px;">
                <h4 style="font-size:14px; font-weight:700; color:#065f46; margin:0 0 12px 0;">${icon('star')} Certificación de Retorno de Circulación Espontánea (ROSC)</h4>
                <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
                  <div class="form-group">
                    <label>Hora de ROSC</label>
                    <input type="datetime-local" id="rosc-hora" value="${datosCierre.horaRosc || (codigo ? codigo.fecha.slice(0, 16) : localDate)}" />
                  </div>
                  <div class="form-group">
                    <label>Ritmo Cardíaco de Salida</label>
                    <select id="rosc-ritmo">
                      <option value="Ritmo Sinusal" ${datosCierre.ritmoSalida === 'Ritmo Sinusal' ? 'selected' : ''}>Ritmo Sinusal Estable</option>
                      <option value="Taquicardia Sinusal" ${datosCierre.ritmoSalida === 'Taquicardia Sinusal' ? 'selected' : ''}>Taquicardia Sinusal</option>
                      <option value="Fibrilación Auricular Controlada" ${datosCierre.ritmoSalida === 'Fibrilación Auricular Controlada' ? 'selected' : ''}>Fibrilación Auricular Controlada</option>
                      <option value="Ritmo de la Unión" ${datosCierre.ritmoSalida === 'Ritmo de la Unión' ? 'selected' : ''}>Ritmo de la Unión</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Destino Inmediato de Traslado</label>
                    <select id="rosc-destino">
                      <option value="Unidad de Terapia Intensiva (UTI)" ${datosCierre.destinoTraslado === 'Unidad de Terapia Intensiva (UTI)' ? 'selected' : ''}>Unidad de Terapia Intensiva (UTI)</option>
                      <option value="Unidad Coronaria (UCO)" ${datosCierre.destinoTraslado === 'Unidad Coronaria (UCO)' ? 'selected' : ''}>Unidad Coronaria (UCO)</option>
                      <option value="Sala de Hemodinamia / Cateterismo" ${datosCierre.destinoTraslado === 'Sala de Hemodinamia / Cateterismo' ? 'selected' : ''}>Hemodinamia / Cateterismo</option>
                      <option value="Centro Quirúrgico" ${datosCierre.destinoTraslado === 'Centro Quirúrgico' ? 'selected' : ''}>Centro Quirúrgico</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Cierre FATAL -->
              <div id="cierre-fatal-panel" style="display:${currentEstado === 'fatal' ? 'block' : 'none'}; background:#fef2f2; border:1px solid #fecaca; border-radius:var(--radius); padding:16px; margin-bottom:20px;">
                <h4 style="font-size:14px; font-weight:700; color:#991b1b; margin:0 0 12px 0;">${icon('xOctagon')} Acta de Cese de Maniobras y Certificación de Defunción</h4>
                <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
                  <div class="form-group">
                    <label style="color:#991b1b; font-weight:700;">Hora de Defunción / Cese de RCP</label>
                    <input type="datetime-local" id="fatal-hora" value="${datosCierre.horaDefuncion || (codigo ? codigo.fecha.slice(0, 16) : localDate)}" />
                  </div>
                  <div class="form-group">
                    <label style="color:#991b1b; font-weight:700;">Médico Certificante de Defunción</label>
                    <input type="text" id="fatal-medico" placeholder="Ej: Dr. Carlos Méndez" value="${datosCierre.medicoCertificante || (codigo ? codigo.responsable.split('(')[0].trim() : 'Dr. Carlos Méndez')}" />
                  </div>
                  <div class="form-group">
                    <label style="color:#991b1b; font-weight:700;">N° de Matrícula Profesional</label>
                    <input type="text" id="fatal-matricula" placeholder="Ej: M.P. 54.892 / M.N. 124.567" value="${datosCierre.matricula || 'M.P. 48.912'}" />
                  </div>
                  <div class="form-group">
                    <label style="color:#991b1b; font-weight:700;">Causa Básica / Mecanismo de Muerte</label>
                    <input type="text" id="fatal-causa" placeholder="Ej: Paro Cardiorrespiratorio irreversible por Fibrilación Ventricular refractaria" value="${datosCierre.causaDefuncion || (codigo ? codigo.causa : 'Paro Cardiorrespiratorio refractario')}" />
                  </div>
                </div>
                <div class="form-group">
                  <label style="color:#991b1b;">Observaciones Forenses y Notificación a Familiares</label>
                  <textarea id="fatal-obs" rows="2" placeholder="Familiar notificado, entrega de pertenencias, tiempo total de reanimación...">${escapeHtml(datosCierre.observaciones || 'Familiares notificados en sala de espera. Sin incidentes.')}</textarea>
                </div>
              </div>
            </div>

            <!-- SECCIÓN 4: MATERIALES USADOS DEL CARRO DE PARO -->
            <h3 style="font-size:16px; font-weight:700; color:var(--celeste-dark); margin:28px 0 16px 0; border-bottom:2px solid var(--celeste-100); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
              <span>${icon('pill')}</span> 4. Materiales e Insumos Utilizados del Carro de Paro
            </h3>
            <div style="background:var(--gray-50); padding:16px; border-radius:var(--radius); margin-bottom:20px; border:1px solid var(--gray-200);">
              <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:12px;" id="materials-container">
                ${materialesList.map(mat => {
                  const current = selectedMaterials.find(m => m.nombre === mat.nombre || m.id_material === mat.id);
                  const isChecked = !!current;
                  const qty = current ? current.cantidad : 1;
                  const stockMax = mat.stock !== undefined ? mat.stock : 50;
                  return `
                    <div style="display:flex; align-items:center; justify-content:space-between; background:var(--white); padding:8px 12px; border-radius:var(--radius); border:1px solid ${isChecked ? 'var(--celeste)' : 'var(--gray-200)'};">
                      <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:13px; font-weight:600; color:var(--gray-800); flex:1;">
                        <input type="checkbox" class="material-checkbox" data-id="${mat.id}" data-nombre="${escapeHtml(mat.nombre)}" data-tipo="${mat.tipo}" data-unidad="${mat.unidad}" data-stock="${stockMax}" ${isChecked ? 'checked' : ''} style="accent-color:var(--celeste);" />
                        <div>
                          <div>${escapeHtml(mat.nombre)}</div>
                          <span style="font-size:10px; color:${stockMax <= 5 ? 'var(--danger)' : 'var(--gray-400)'}; font-weight:${stockMax <= 5 ? '700' : 'normal'};">Stock: ${stockMax} ${mat.unidad}</span>
                        </div>
                      </label>
                      <div style="display:flex; align-items:center; gap:4px;">
                        <input type="number" class="material-qty" min="1" max="${Math.max(stockMax, 100)}" value="${qty}" style="width:50px; padding:4px; font-size:12px; text-align:center; border:1px solid var(--gray-300); border-radius:6px;" title="Cantidad a usar" />
                        <span style="font-size:11px; color:var(--gray-500); font-weight:500;">${mat.unidad}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- SECCIÓN 5: INTERVENCIONES Y OBSERVACIONES -->
            <h3 style="font-size:16px; font-weight:700; color:var(--celeste-dark); margin:28px 0 16px 0; border-bottom:2px solid var(--celeste-100); padding-bottom:8px; display:flex; align-items:center; gap:8px;">
              <span>${icon('zap')}</span> 5. Intervenciones Realizadas y Observaciones Clínicas
            </h3>
            <div class="form-grid">
              <div class="form-group full-width" style="grid-column: 1 / -1;">
                <label>Intervenciones Realizadas</label>
                <div id="form-intervenciones" style="display:flex;flex-wrap:wrap;gap:8px;">
                  ${INTERVENCIONES_LISTA.map(int => `
                    <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1.5px solid var(--gray-200);border-radius:var(--radius);cursor:pointer;font-size:13px;font-weight:500;color:var(--gray-600);transition:var(--transition);"
                      class="intervencion-check">
                      <input type="checkbox" value="${int}" ${codigo && codigo.intervenciones && codigo.intervenciones.includes(int) ? 'checked' : ''} style="accent-color:var(--celeste);" />
                      ${int}
                    </label>
                  `).join('')}
                </div>
              </div>
              <div class="form-group full-width" style="grid-column: 1 / -1;">
                <label>Notas Clínicas / Evolución</label>
                <textarea id="form-notas" placeholder="Evolución clínica, fármacos adicionales, comentarios del equipo..." rows="3">${codigo ? escapeHtml(codigo.notas || '') : ''}</textarea>
              </div>
            </div>

            <div class="form-actions" style="margin-top:28px; display:flex; justify-content:space-between; align-items:center;">
              <a href="${isEdit ? '#/detalle/' + editId : '#/historial'}" class="btn btn-secondary">Cancelar</a>
              <button type="button" id="btn-submit-codigo" class="btn btn-primary" onclick="submitCodigoForm(${editId})" style="padding:12px 32px; font-weight:800; font-size:15px; background:var(--celeste); border:none; cursor:pointer;">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                ${isEdit ? 'Guardar Cambios' : 'Registrar Código Azul'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function togglePacienteList(show) {
  const wrapper = document.getElementById('paciente-dropdown-wrapper');
  const card = document.getElementById('paciente-selected-card');
  if (wrapper) wrapper.style.display = show ? 'block' : 'none';
  if (card) card.style.display = show ? 'none' : 'flex';
  if (show) {
    document.getElementById('filter-paciente-input')?.focus();
  }
}

function toggleActivadorList(show) {
  const wrapper = document.getElementById('activador-dropdown-wrapper');
  const card = document.getElementById('activador-selected-card');
  if (wrapper) wrapper.style.display = show ? 'block' : 'none';
  if (card) card.style.display = show ? 'none' : 'flex';
  if (show) {
    document.getElementById('filter-activador-input')?.focus();
  }
}

function selectPacienteItem(id) {
  selectedPacienteId = id;
  const input = document.getElementById('form-paciente-id');
  if (input) input.value = id;

  const pacientesList = getPacientes();
  const p = pacientesList.find(item => item.id === id);

  if (p) {
    document.getElementById('sel-paciente-nombre').textContent = `${p.apellido}, ${p.nombre}`;
    document.getElementById('sel-paciente-dni').textContent = p.dni || 'S/D';
    document.getElementById('sel-paciente-area-cama').textContent = `${p.area} [${p.cama || 'Cama'}]`;
    document.getElementById('sel-paciente-grupo').textContent = p.grupo || 'S/D';
    document.getElementById('sel-paciente-alergias').textContent = p.alergias || 'Ninguna';

    const causaSelect = document.getElementById('form-causa-select');
    if (causaSelect && !causaSelect.value && p.causa) {
      if (CAUSAS_PREDEFINIDAS.includes(p.causa)) causaSelect.value = p.causa;
    }

    // Colapsar la lista y mostrar solo la tarjeta seleccionada
    togglePacienteList(false);
  }
}

function selectActivadorItem(id) {
  selectedActivadorId = id;
  const input = document.getElementById('form-activador-id');
  if (input) input.value = id;

  const personalList = getPersonalSalud();
  const pers = personalList.find(item => item.id === id);

  if (pers) {
    document.getElementById('sel-activador-nombre').textContent = `${pers.apellido}, ${pers.nombre}`;
    document.getElementById('sel-activador-rol').textContent = pers.nombre_rol || 'Personal de Salud';
    document.getElementById('sel-activador-dni').textContent = pers.dni || 'S/D';
    document.getElementById('sel-activador-area').textContent = pers.area || 'Guardia';
    document.getElementById('sel-activador-tel').textContent = pers.telefono || 'Interno 302';

    // Colapsar la lista y mostrar solo la tarjeta seleccionada
    toggleActivadorList(false);
  }
}

function setupCodigoForm(editId = null) {
  const filterPacienteInput = document.getElementById('filter-paciente-input');
  const filterActivadorInput = document.getElementById('filter-activador-input');
  const equipoSelect = document.getElementById('form-equipo');
  const responsableSelect = document.getElementById('form-responsable');
  const equipoLabelResp = document.getElementById('equipo-label-resp');
  const causaSelect = document.getElementById('form-causa-select');
  const causaOtroContainer = document.getElementById('form-causa-otro-container');
  const causaOtroInput = document.getElementById('form-causa-otro');
  const estadoSelect = document.getElementById('form-estado');
  const roscPanel = document.getElementById('cierre-rosc-panel');
  const fatalPanel = document.getElementById('cierre-fatal-panel');

  // Inicializar preview de paciente y personal
  if (selectedPacienteId) {
    selectPacienteItem(selectedPacienteId);
  }
  if (selectedActivadorId) {
    selectActivadorItem(selectedActivadorId);
  }

  // Actualizar lista de médicos líderes según el equipo seleccionado y autoseleccionar al Líder
  const updateResponsablesForEquipo = () => {
    if (!equipoSelect || !responsableSelect) return;
    const selectedEquipo = equipoSelect.value;
    if (equipoLabelResp) equipoLabelResp.textContent = selectedEquipo;

    const equiposList = getEquipos();
    const personalList = getPersonalSalud();
    const eqObj = equiposList.find(e => (typeof e === 'string' ? e : e.nombre) === selectedEquipo);

    let personalDelEquipo = personalList;
    let autoLeaderOpt = '';

    if (eqObj && Array.isArray(eqObj.integrantes) && eqObj.integrantes.length > 0) {
      personalDelEquipo = personalList.filter(p => eqObj.integrantes.some(i => i.id_personal === p.id));
      if (personalDelEquipo.length === 0) personalDelEquipo = personalList;

      // Buscar al que tenga el rol de Líder en el equipo
      const leaderInteg = eqObj.integrantes.find(i => (i.rol_en_equipo || '').toLowerCase().includes('líder') || (i.rol_en_equipo || '').toLowerCase().includes('lider'));
      if (leaderInteg) {
        const lp = personalList.find(p => p.id === leaderInteg.id_personal);
        if (lp) autoLeaderOpt = `${lp.apellido}, ${lp.nombre} (${lp.nombre_rol || 'Médico'})`;
      }
    }

    if (!autoLeaderOpt && personalDelEquipo.length > 0) {
      autoLeaderOpt = `${personalDelEquipo[0].apellido}, ${personalDelEquipo[0].nombre} (${personalDelEquipo[0].nombre_rol || 'Médico'})`;
    }

    responsableSelect.innerHTML = `
      <option value="">-- Seleccionar Médico Líder (${selectedEquipo}) --</option>
      ${personalDelEquipo.map(pers => {
        const optVal = `${pers.apellido}, ${pers.nombre} (${pers.nombre_rol || 'Médico'})`;
        const isSel = (optVal === autoLeaderOpt);
        return `
          <option value="${optVal}" ${isSel ? 'selected' : ''}>
            ${pers.apellido}, ${pers.nombre} — [${pers.nombre_rol || 'Médico'}]
          </option>
        `;
      }).join('')}
    `;

    if (autoLeaderOpt) {
      responsableSelect.value = autoLeaderOpt;
    }
  };

  if (equipoSelect) {
    equipoSelect.addEventListener('change', updateResponsablesForEquipo);
  }

  // Filtro en tiempo real para Pacientes (sin importar tildes o mayúsculas)
  if (filterPacienteInput) {
    filterPacienteInput.addEventListener('input', () => {
      const q = normalizeText(filterPacienteInput.value);
      document.querySelectorAll('.paciente-select-item').forEach(item => {
        const text = normalizeText((item.getAttribute('data-nombre') || '') + ' ' + (item.getAttribute('data-dni') || '') + ' ' + (item.getAttribute('data-area') || ''));
        item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
      });
    });
  }

  // Filtro en tiempo real para Personal Activador (sin importar tildes o mayúsculas)
  if (filterActivadorInput) {
    filterActivadorInput.addEventListener('input', () => {
      const q = normalizeText(filterActivadorInput.value);
      document.querySelectorAll('.activador-select-item').forEach(item => {
        const text = normalizeText((item.getAttribute('data-nombre') || '') + ' ' + (item.getAttribute('data-rol') || '') + ' ' + (item.getAttribute('data-dni') || '') + ' ' + (item.getAttribute('data-area') || ''));
        item.style.display = (!q || text.includes(q)) ? 'flex' : 'none';
      });
    });
  }

  // Conmutar paneles de cierre clínico según estado
  if (estadoSelect) {
    estadoSelect.addEventListener('change', () => {
      const val = estadoSelect.value;
      if (roscPanel) roscPanel.style.display = val === 'resuelto' ? 'block' : 'none';
      if (fatalPanel) fatalPanel.style.display = val === 'fatal' ? 'block' : 'none';
    });
  }

  // Toggle de campo 'Otro' en causa
  if (causaSelect) {
    causaSelect.addEventListener('change', () => {
      if (causaSelect.value === 'Otro') {
        if (causaOtroContainer) causaOtroContainer.style.display = 'block';
        if (causaOtroInput) causaOtroInput.focus();
      } else {
        if (causaOtroContainer) causaOtroContainer.style.display = 'none';
      }
    });
  }
}

// Función de Submit con anti-duplicados y validación visual
function submitCodigoForm(editId = null) {
  if (isSubmittingCodigo) return;

  const isEdit = editId !== null;
  const btnSubmit = document.getElementById('btn-submit-codigo');

  const pacienteInput = document.getElementById('form-paciente-id');
  const activadorInput = document.getElementById('form-activador-id');
  const causaSelect = document.getElementById('form-causa-select');
  const causaOtroInput = document.getElementById('form-causa-otro');
  const fechaInput = document.getElementById('form-fecha');
  const origenSelect = document.getElementById('form-origen');
  const equipoSelect = document.getElementById('form-equipo');
  const turnoSelect = document.getElementById('form-turno');
  const responsableSelect = document.getElementById('form-responsable');
  const estadoSelect = document.getElementById('form-estado');
  const tiempoInput = document.getElementById('form-tiempo');
  const notasInput = document.getElementById('form-notas');

  const markError = (el, msg) => {
    if (el) {
      el.style.border = '2.5px solid #ef4444';
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.focus();
    }
    showToast(`${icon('alertTriangle')} ${msg}`, 'error');
  };

  // Validar Paciente
  const pacienteId = pacienteInput ? parseInt(pacienteInput.value) : selectedPacienteId;
  const pacientesList = getPacientes();
  const pacienteObj = pacientesList.find(p => p.id === pacienteId);

  if (!pacienteId || !pacienteObj) {
    markError(document.getElementById('paciente-selected-card'), 'Por favor seleccione un paciente internado');
    return;
  }

  // Validar Causa
  let causa = causaSelect ? causaSelect.value : '';
  if (causa === 'Otro') {
    causa = causaOtroInput ? causaOtroInput.value.trim() : '';
    if (!causa) {
      markError(causaOtroInput, 'Por favor detalle la causa del paro');
      return;
    }
  }

  if (!causa) {
    markError(causaSelect, 'Seleccione la causa del código azul');
    return;
  }

  // Validar Activador
  const activadorId = activadorInput ? parseInt(activadorInput.value) : selectedActivadorId;
  const personalList = getPersonalSalud();
  const activadorObj = personalList.find(p => p.id === activadorId) || personalList[0];

  if (!activadorId || !activadorObj) {
    markError(document.getElementById('activador-selected-card'), 'Seleccione al profesional que realizó el aviso');
    return;
  }

  const quienHizoLlamada = `${activadorObj.apellido}, ${activadorObj.nombre}`;
  const activadorData = {
    id: activadorObj.id,
    nombre_completo: quienHizoLlamada,
    dni: activadorObj.dni || '30.123.456',
    nombre_rol: activadorObj.nombre_rol || 'Personal de Guardia',
    telefono: activadorObj.telefono || '11-4567-8901',
    area: activadorObj.area || pacienteObj.area
  };

  // Validar Médico Líder
  const responsable = responsableSelect ? responsableSelect.value.trim() : '';
  if (!responsable) {
    markError(responsableSelect, 'Seleccione el médico líder de la brigada');
    return;
  }

  const fecha = fechaInput ? fechaInput.value : new Date().toISOString().slice(0, 16);
  const origenLlamada = origenSelect ? origenSelect.value : 'Consola Central';
  const equipoEncargado = equipoSelect ? equipoSelect.value : 'Equipo A';
  const turno = turnoSelect ? turnoSelect.value : 'Turno Mañana';
  const estadoVal = estadoSelect ? estadoSelect.value : 'resuelto';
  const tiempoRespuesta = tiempoInput ? (parseFloat(tiempoInput.value) || 3.2) : 3.2;
  const notas = notasInput ? notasInput.value.trim() : '';

  // Bloquear múltiples clicks
  isSubmittingCodigo = true;
  if (btnSubmit) {
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = icon('loader') + ' Registrando...';
  }

  // Empaquetar Cierre Clínico
  const datosCierre = {};
  if (estadoVal === 'fatal') {
    datosCierre.horaDefuncion = document.getElementById('fatal-hora')?.value || fecha;
    datosCierre.medicoCertificante = document.getElementById('fatal-medico')?.value.trim() || responsable.split('(')[0].trim();
    datosCierre.matricula = document.getElementById('fatal-matricula')?.value.trim() || 'M.P. 48.912';
    datosCierre.causaDefuncion = document.getElementById('fatal-causa')?.value.trim() || causa;
    datosCierre.observaciones = document.getElementById('fatal-obs')?.value.trim() || 'Familiares notificados en sala de espera.';
  } else {
    datosCierre.horaRosc = document.getElementById('rosc-hora')?.value || fecha;
    datosCierre.ritmoSalida = document.getElementById('rosc-ritmo')?.value || 'Ritmo Sinusal Estable';
    datosCierre.destinoTraslado = document.getElementById('rosc-destino')?.value || 'Unidad de Terapia Intensiva (UTI)';
  }

  // Intervenciones
  const intervencionesCheckboxes = document.querySelectorAll('#form-intervenciones input[type="checkbox"]:checked');
  let intervenciones = Array.from(intervencionesCheckboxes).map(cb => cb.value);
  if (intervenciones.length === 0) {
    intervenciones = ['RCP de Alta Calidad', 'Desfibrilación Precoz'];
  }

  // Materiales
  const materiales = [];
  document.querySelectorAll('#materials-container .material-checkbox:checked').forEach(cb => {
    const container = cb.closest('div');
    const qtyInput = container.querySelector('.material-qty');
    const qty = parseInt(qtyInput?.value) || 1;

    materiales.push({
      id_material: parseInt(cb.getAttribute('data-id')),
      nombre: cb.getAttribute('data-nombre'),
      tipo: cb.getAttribute('data-tipo'),
      unidad: cb.getAttribute('data-unidad'),
      cantidad: qty
    });
  });

  const estado = ESTADOS.find(e => e.value === estadoVal) || ESTADOS[0];
  const fechaISO = new Date(fecha).toISOString();

  if (isEdit) {
    const existing = getCodigoById(editId);
    const timeline = existing ? existing.timeline : [];

    updateCodigo(parseInt(editId), {
      id_paciente: pacienteObj.id,
      paciente: `${pacienteObj.apellido}, ${pacienteObj.nombre} (${pacienteObj.edad || 65}a)`,
      dni: pacienteObj.dni,
      causa,
      area: pacienteObj.area,
      cama: pacienteObj.cama,
      grupoSanguineo: pacienteObj.grupo,
      alergias: pacienteObj.alergias,
      fecha: fechaISO,
      quienHizoLlamada,
      activadorData,
      origenLlamada,
      equipoEncargado,
      turno,
      responsable,
      estado,
      tiempoRespuesta,
      materiales,
      intervenciones,
      notas,
      datosCierre,
      timeline
    }).then(() => {
      showToast('Registro de Código Azul actualizado con éxito', 'success');
      window.location.hash = `#/detalle/${editId}`;
    });
  } else {
    const timeline = [
      {
        hora: fechaISO,
        titulo: 'Código Azul Activado',
        descripcion: `Aviso registrado por ${quienHizoLlamada} desde ${origenLlamada}`,
        tipo: 'start'
      },
      {
        hora: new Date(new Date(fecha).getTime() + 1.5 * 60000).toISOString(),
        titulo: 'Arribo de Equipo y RCP Avanzada',
        descripcion: `${equipoEncargado} en el lugar. Líder ACLS: ${responsable}`,
        tipo: 'action'
      }
    ];

    if (estadoVal === 'resuelto') {
      timeline.push({
        hora: new Date(new Date(fecha).getTime() + tiempoRespuesta * 60000 + 3 * 60000).toISOString(),
        titulo: 'Retorno de Circulación Espontánea (ROSC)',
        descripcion: `Estabilizado con ritmo ${datosCierre.ritmoSalida}. Traslado a ${datosCierre.destinoTraslado}.`,
        tipo: 'end'
      });
    } else {
      timeline.push({
        hora: new Date(new Date(fecha).getTime() + tiempoRespuesta * 60000 + 4 * 60000).toISOString(),
        titulo: 'Cese de Maniobras de RCP / Defunción',
        descripcion: `Certificado por ${datosCierre.medicoCertificante} (Mat. ${datosCierre.matricula}). Causa: ${datosCierre.causaDefuncion}.`,
        tipo: 'end'
      });
    }

    addCodigo({
      id_paciente: pacienteObj.id,
      paciente: `${pacienteObj.apellido}, ${pacienteObj.nombre} (${pacienteObj.edad || 65}a)`,
      dni: pacienteObj.dni,
      causa,
      area: pacienteObj.area,
      cama: pacienteObj.cama,
      grupoSanguineo: pacienteObj.grupo,
      alergias: pacienteObj.alergias,
      fecha: fechaISO,
      quienHizoLlamada,
      activadorData,
      origenLlamada,
      equipoEncargado,
      turno,
      responsable,
      estado,
      tiempoRespuesta,
      materiales,
      intervenciones,
      notas,
      datosCierre,
      timeline
    }).then(nuevo => {
      showToast('¡Código Azul registrado exitosamente!', 'success');
      window.location.hash = `#/detalle/${nuevo.id}`;
    });
  }
}

window.togglePacienteList = togglePacienteList;
window.toggleActivadorList = toggleActivadorList;
window.selectPacienteItem = selectPacienteItem;
window.selectActivadorItem = selectActivadorItem;
window.submitCodigoForm = submitCodigoForm;
