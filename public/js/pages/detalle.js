function renderDetalle(id) {
  window.scrollTo(0, 0);
  const codigo = getCodigoById(id);

  if (!codigo) {
    return `
      <div class="page-body">
        <div class="empty-state">
          <h3> no encontrado</h3>
          <p>El código azul solicitado no existe</p>
          <a href="#/historial" class="btn btn-primary" style="margin-top:16px;">Volver al historial</a>
        </div>
      </div>
    `;
  }

  const sortedTimeline = [...codigo.timeline].sort((a, b) => new Date(a.hora) - new Date(b.hora));
  const materiales = codigo.materiales || [];
  const auditoria = getAuditoria(id);
  const datosCierre = codigo.datosCierre || {};

  // Obtener datos del activador
  const activador = codigo.activadorData || {
    nombre_completo: codigo.quienHizoLlamada || 'Personal de Guardia',
    nombre_rol: 'Lic. en Enfermería / Guardia',
    dni: '30.123.456',
    telefono: '11-4567-8901 (Int. 302)',
    area: codigo.area || 'Urgencias'
  };

  const isFatal = codigo.estado?.value === 'fatal';

  return `
    <div class="page-header page-transition">
      <div class="page-header-row">
        <div>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
            <a href="#/historial" style="color:var(--gray-400);text-decoration:none;font-size:14px;">Historial</a>
            <span style="color:var(--gray-300);">/</span>
            <span style="font-size:14px;color:var(--gray-500);">#${codigo.id}</span>
          </div>
          <h1>${escapeHtml(codigo.paciente)}</h1>
          <p>Código Azul #${codigo.id} &middot; Registrado el ${formatDateTime(codigo.fecha)}</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button class="btn btn-outline btn-sm" onclick="exportExcel([getData().find(d=>d.id===${codigo.id})], 'codigo_azul_${codigo.id}.xls')" title="Exportar a Excel">
            ${icon('fileSpreadsheet')} Excel
          </button>
          <button class="btn btn-outline btn-sm" onclick="exportCSV([getData().find(d=>d.id===${codigo.id})], 'codigo_azul_${codigo.id}.csv')" title="Exportar CSV">
            ${icon('barChart')} CSV
          </button>
          <button class="btn btn-outline btn-sm" onclick="exportPDF([getData().find(d=>d.id===${codigo.id})], 'codigo_azul_${codigo.id}.pdf')">
            ${icon('fileText')} PDF Certificado
          </button>
          <a href="#/editar/${codigo.id}" class="btn btn-secondary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Registro
          </a>
        </div>
      </div>
    </div>

    <div class="page-body">
      <!-- Banner de Cierre Clínico Certificado -->
      ${isFatal ? `
        <div class="card scale-in" style="background:#fef2f2; border:2px solid #f87171; margin-bottom:20px; padding:18px 24px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:22px;">${icon('xOctagon')}</span>
                <h3 style="color:#991b1b; margin:0; font-size:16px; font-weight:800;">Acta y Certificación Médica de Defunción</h3>
              </div>
              <p style="color:#7f1d1d; font-size:13px; margin:6px 0 0 0;">
                Constatado y certificado por <strong>${escapeHtml(datosCierre.medicoCertificante || codigo.responsable)}</strong> (Matrícula: <strong>${escapeHtml(datosCierre.matricula || 'M.P. 48.912')}</strong>)
              </p>
              <div style="margin-top:10px; font-size:12.5px; color:#991b1b;">
                <span>${icon('clock')} <strong>Hora de defunción:</strong> ${formatDateTime(datosCierre.horaDefuncion || codigo.fecha)}</span> &middot; 
                <span>${icon('clipboard')} <strong>Causa directa:</strong> ${escapeHtml(datosCierre.causaDefuncion || codigo.causa)}</span>
              </div>
              ${datosCierre.observaciones ? `
                <div style="margin-top:8px; font-size:12px; color:#7f1d1d; background:rgba(255,255,255,0.7); padding:8px 12px; border-radius:6px;">
                  <strong>Observaciones forenses:</strong> ${escapeHtml(datosCierre.observaciones)}
                </div>
              ` : ''}
            </div>
            <div style="text-align:right; border:1px dashed #dc2626; padding:10px 16px; border-radius:8px; background:#fff;">
              <span style="font-size:11px; text-transform:uppercase; color:#991b1b; font-weight:800; display:block;">Defunción Constatada</span>
              <strong style="color:#991b1b; font-size:13px;">PACIENTE DADO DE BAJA</strong>
              <div style="font-size:10px; color:#7f1d1d; margin-top:2px;">Cama hospitalaria liberada</div>
            </div>
          </div>
        </div>
      ` : `
        <div class="card scale-in" style="background:#ecfdf5; border:2px solid #34d399; margin-bottom:20px; padding:18px 24px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <span style="font-size:22px;">${icon('star')}</span>
                <h3 style="color:#065f46; margin:0; font-size:16px; font-weight:800;">Protocolo Exitoso de Retorno de Circulación Espontánea (ROSC)</h3>
              </div>
              <p style="color:#047857; font-size:13px; margin:6px 0 0 0;">
                Reanimación cardiopulmonar exitosa certificada por el médico líder <strong>${escapeHtml(codigo.responsable)}</strong>
              </p>
              <div style="margin-top:10px; font-size:12.5px; color:#065f46;">
                <span>${icon('clock')} <strong>Hora de ROSC:</strong> ${formatDateTime(datosCierre.horaRosc || codigo.fecha)}</span> &middot; 
                <span>${icon('heart')} <strong>Ritmo de salida:</strong> ${escapeHtml(datosCierre.ritmoSalida || 'Ritmo Sinusal Estable')}</span> &middot; 
                <span>${icon('building')} <strong>Destino de traslado:</strong> ${escapeHtml(datosCierre.destinoTraslado || 'Unidad de Terapia Intensiva (UTI)')}</span>
              </div>
            </div>
            <div style="text-align:right; border:1px dashed #059669; padding:10px 16px; border-radius:8px; background:#fff;">
              <span style="font-size:11px; text-transform:uppercase; color:#065f46; font-weight:800; display:block;">Protocolo ACLS</span>
              <strong style="color:#059669; font-size:13px;">ROSC CONSTATADO</strong>
            </div>
          </div>
        </div>
      `}

      <!-- Fila 1: Datos del Paciente + Activación & Equipo -->
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        
        <!-- Tarjeta 1: Información Clínica del Paciente -->
        <div class="card scale-in">
          <div class="card-header" style="display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">${icon('user')}</span>
              <h2>Información del Paciente</h2>
            </div>
            <span class="badge ${codigo.estado?.badge}">
              <span class="badge-dot"></span>
              ${codigo.estado?.label}
            </span>
          </div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item" style="grid-column: 1 / -1; background: var(--celeste-50); padding: 12px; border-radius: var(--radius); border-left: 4px solid var(--celeste);">
                <span class="detail-label" style="font-weight:700; color:var(--celeste-dark);">${icon('alertTriangle')} Causa de Intervención / Diagnóstico</span>
                <span class="detail-value" style="font-size:15px; font-weight:700; color:var(--gray-900); margin-top:2px;">
                  ${escapeHtml(codigo.causa || 'Paro Cardiorrespiratorio')}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Paciente</span>
                <span class="detail-value" style="font-weight:600;">${escapeHtml(codigo.paciente)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">DNI / Identificación</span>
                <span class="detail-value">${escapeHtml(codigo.dni || 'Sin registrar')}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Área / Sector</span>
                <span class="detail-value">${escapeHtml(codigo.area)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Cama / Box</span>
                <span class="detail-value" style="color:var(--celeste-dark);font-weight:600;">${escapeHtml(codigo.cama || 'Cama Guardia')}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Grupo Sanguíneo</span>
                <span class="detail-value"><span class="badge" style="background:#fee2e2;color:#b91c1c;font-weight:700;">${escapeHtml(codigo.grupoSanguineo || 'S/D')}</span></span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Alergias</span>
                <span class="detail-value" style="color:${codigo.alergias && codigo.alergias !== 'Ninguna' ? 'var(--danger)' : 'var(--gray-600)'};font-weight:${codigo.alergias && codigo.alergias !== 'Ninguna' ? '700' : '400'};">
                  ${escapeHtml(codigo.alergias || 'Ninguna')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tarjeta 2: Activación, Quién llamó y Equipo Encargado -->
        <div class="card scale-in">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">${icon('shield')}</span>
              <h2>Activación, Personal y Brigada</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="detail-grid">
              
              <!-- Ficha de Quién Realizó la Llamada con todos los datos -->
              <div class="detail-item" style="grid-column: 1 / -1; background: #fef3c7; padding: 14px; border-radius: var(--radius); border-left: 4px solid var(--warning);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                  <div style="flex:1; min-width:200px;">
                    <span class="detail-label" style="font-weight:700; color:#92400e;">${icon('phone')} QUIÉN REALIZÓ EL AVISO</span>
                    <span class="detail-value" style="font-size:15px; font-weight:800; color:var(--gray-900); margin-top:2px;">
                      ${escapeHtml(activador.nombre_completo || codigo.quienHizoLlamada)}
                    </span>
                    <div style="font-size:12px; color:#78350f; margin-top:4px; line-height:1.4;">
                      <div><strong>Profesión / Rol:</strong> ${escapeHtml(activador.nombre_rol || 'Personal de Guardia')}</div>
                      <div><strong>DNI:</strong> ${escapeHtml(activador.dni || '30.123.456')} &middot; <strong>Tel / Int:</strong> ${escapeHtml(activador.telefono || 'Interno 302')}</div>
                      <div><strong>Sector habitual:</strong> ${escapeHtml(activador.area || codigo.area)} &middot; <strong>Origen:</strong> ${escapeHtml(codigo.origenLlamada || 'Consola')}</div>
                    </div>
                  </div>
                  <button class="btn btn-sm" type="button" style="background:#d97706; color:#fff; font-size:12px; font-weight:700; padding:6px 14px; border-radius:8px; border:none; cursor:pointer; flex-shrink:0;" onclick="showPersonalModalDirect('${escapeHtml(activador.nombre_completo || codigo.quienHizoLlamada)}')">
                    ${icon('search')} Ver Ficha
                  </button>
                </div>
              </div>

              <!-- Ficha del Equipo Encargado con botón de acceso rápido -->
              <div class="detail-item" style="grid-column: 1 / -1; background: var(--celeste-light); padding: 14px; border-radius: var(--radius); border-left: 4px solid var(--celeste);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                  <div style="flex:1; min-width:200px;">
                    <span class="detail-label" style="font-weight:700; color:var(--celeste-dark);">${icon('truck')} EQUIPO DE EMERGENCIA & TURNO</span>
                    <span class="detail-value" style="font-size:15px; font-weight:800; color:var(--gray-900); margin-top:2px;">
                      ${escapeHtml(codigo.equipoEncargado || 'Equipo A')} (${escapeHtml(codigo.turno || 'Turno Mañana')})
                    </span>
                    <div style="font-size:12px; color:var(--gray-700); margin-top:4px;">
                      Médico Líder ACLS: <strong>${escapeHtml(codigo.responsable)}</strong>
                    </div>
                  </div>
                  <button class="btn btn-sm" type="button" style="background:var(--celeste); color:#fff; font-size:12px; font-weight:700; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; flex-shrink:0; display:inline-flex; align-items:center; gap:6px; box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);" onclick="showIntegrantesEquipoModal('${escapeHtml(codigo.equipoEncargado || 'Equipo A')}', '${escapeHtml(codigo.turno || 'Turno Mañana')}', '${escapeHtml(codigo.responsable)}')">
                    ${icon('users')} Ver Integrantes de Equipos
                  </button>
                </div>
              </div>

              <div class="detail-item">
                <span class="detail-label">Fecha y Hora</span>
                <span class="detail-value">${formatDateTime(codigo.fecha)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tiempo de Respuesta</span>
                <span class="detail-value" style="font-weight:700; color:var(--success);">${codigo.tiempoRespuesta} minutos</span>
              </div>
              <div class="detail-item" style="grid-column: 1 / -1;">
                <span class="detail-label">Intervenciones Aplicadas</span>
                <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:6px;">
                  ${(codigo.intervenciones || []).map(i => `<span class="intervention-tag">${i}</span>`).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Fila 2: Materiales e Insumos Usados + Cronología -->
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px; margin-bottom:20px;">
        
        <!-- Tarjeta 3: Materiales e Insumos Consumidos -->
        <div class="card scale-in">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">${icon('pill')}</span>
              <h2>Materiales e Insumos Utilizados</h2>
            </div>
            <span style="font-size:12px; color:var(--gray-400);">${materiales.length} artículos</span>
          </div>
          <div class="card-body" style="padding: 16px 20px;">
            ${materiales.length === 0 ? `
              <p style="color:var(--gray-400); font-size:13px; text-align:center; padding: 20px;">No se registraron materiales consumidos para este evento.</p>
            ` : `
              <table style="width:100%; border-collapse:collapse; font-size:13px;">
                <thead>
                  <tr style="border-bottom: 2px solid var(--gray-200); text-align:left; color:var(--gray-500); font-size:12px; text-transform:uppercase;">
                    <th style="padding:8px 4px;">Material / Insumo</th>
                    <th style="padding:8px 4px; text-align:center;">Cantidad</th>
                    <th style="padding:8px 4px; text-align:right;">Unidad</th>
                  </tr>
                </thead>
                <tbody>
                  ${materiales.map(m => `
                    <tr style="border-bottom: 1px solid var(--gray-100);">
                      <td style="padding:10px 4px; font-weight:600; color:var(--gray-800);">
                        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--celeste); margin-right:8px;"></span>
                        ${escapeHtml(m.nombre)}
                      </td>
                      <td style="padding:10px 4px; text-align:center;">
                        <span style="background:var(--gray-100); padding:3px 10px; border-radius:12px; font-weight:700; color:var(--gray-700);">
                          ${m.cantidad}
                        </span>
                      </td>
                      <td style="padding:10px 4px; text-align:right; color:var(--gray-500); font-weight:500;">
                        ${escapeHtml(m.unidad || 'Unidades')}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            `}

            ${codigo.notas ? `
              <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--gray-100);">
                <span class="detail-label" style="font-weight:700;">Observaciones Clínicas y Evolución</span>
                <p style="font-size:13px;color:var(--gray-600);margin-top:6px;line-height:1.6; background:var(--gray-50); padding:12px; border-radius:var(--radius);">
                  ${escapeHtml(codigo.notas)}
                </p>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Tarjeta 4: Cronología de Eventos -->
        <div class="card scale-in">
          <div class="card-header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:20px;">${icon('clock')}</span>
              <h2>Cronología de Reanimación</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="timeline">
              ${sortedTimeline.map(ev => `
                <div class="timeline-item">
                  <div class="timeline-dot ${ev.tipo}">
                    ${ev.tipo === 'start' ? icon('clock', 12) : ev.tipo === 'end' ? icon('check', 12) : icon('play', 12)}
                  </div>
                  <div class="timeline-time">${formatDateTime(ev.hora)}</div>
                  <div class="timeline-title">${escapeHtml(ev.titulo)}</div>
                  <div class="timeline-desc">${escapeHtml(ev.descripcion)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>

      <!-- Fila 3: Trazabilidad y Libro de Auditoría Legal -->
      <div class="card scale-in">
        <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:20px;">${icon('scroll')}</span>
            <h2>Libro de Auditoría Legal y Trazabilidad Hospitalaria</h2>
          </div>
          <span style="font-size:12px; color:var(--gray-500);">${auditoria.length} registros inmutables</span>
        </div>
        <div class="card-body" style="padding:0;">
          <table style="width:100%; border-collapse:collapse; font-size:13px;">
            <thead>
              <tr style="background:var(--gray-50); border-bottom:2px solid var(--gray-200); text-align:left;">
                <th style="padding:10px 16px;">Fecha y Hora</th>
                <th style="padding:10px 16px;">Usuario Responsable</th>
                <th style="padding:10px 16px;">Rol Institucional</th>
                <th style="padding:10px 16px;">Acción Realizada</th>
                <th style="padding:10px 16px;">Detalle Registrado</th>
              </tr>
            </thead>
            <tbody>
              ${auditoria.length === 0 ? `
                <tr>
                  <td colspan="5" style="text-align:center; padding:20px; color:var(--gray-400);">Sin registros de auditoría para este evento.</td>
                </tr>
              ` : auditoria.map(a => `
                <tr style="border-bottom:1px solid var(--gray-100);">
                  <td style="padding:10px 16px; font-size:12px; color:var(--gray-500); white-space:nowrap;">${formatDateTime(a.fecha)}</td>
                  <td style="padding:10px 16px; font-weight:700; color:var(--gray-800);">${escapeHtml(a.usuario)}</td>
                  <td style="padding:10px 16px;"><span class="badge badge-info" style="font-size:10px;">${escapeHtml(a.rol || 'Médico')}</span></td>
                  <td style="padding:10px 16px; font-weight:600; color:var(--celeste-dark);">${escapeHtml(a.accion)}</td>
                  <td style="padding:10px 16px; font-size:12px; color:var(--gray-600);">${escapeHtml(a.detalle)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// Modal de acceso directo a los integrantes del equipo
function showIntegrantesEquipoModal(equipoNombre, turnoNombre = 'Guardia', responsableText = '') {
  document.querySelector('.integrantes-modal-overlay')?.remove();

  const equiposList = getEquipos();
  const personalList = getPersonalSalud();
  const eqObj = equiposList.find(e => (typeof e === 'string' ? e : e.nombre) === equipoNombre) || equiposList[0];

  let integrantesList = [];

  if (eqObj && Array.isArray(eqObj.integrantes) && eqObj.integrantes.length > 0) {
    integrantesList = eqObj.integrantes.map(i => {
      const pers = personalList.find(p => p.id === i.id_personal);
      return {
        ...i,
        personal: pers
      };
    }).filter(i => i.personal);
  } else {
    integrantesList = personalList.slice(0, 4).map((pers, index) => {
      const roles = ['Líder de Reanimación (Team Leader)', 'Compresiones Torácicas / RCP', 'Vía Aérea y Ventilación', 'Acceso Vascular / Farmacoterapia'];
      return {
        id_personal: pers.id,
        rol_en_equipo: roles[index % roles.length],
        personal: pers
      };
    });
  }

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active integrantes-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:92%; max-width:620px; max-height:88vh; display:flex; flex-direction:column; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--celeste-50);">
        <div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:22px; color:var(--celeste-dark); display:flex; align-items:center;">${icon('users')}</span>
            <h2 style="font-size:18px; font-weight:800; color:var(--celeste-dark); margin:0;">
              Integrantes del ${escapeHtml(equipoNombre || 'Equipo de Emergencia')}
            </h2>
          </div>
          <p style="font-size:12px; color:var(--gray-600); margin:3px 0 0 0;">
            Brigada de Reanimación Cardiopulmonar Avanzada &middot; <strong>${escapeHtml(turnoNombre || 'Turno Asignado')}</strong>
          </p>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.integrantes-modal-overlay').remove()">&times;</button>
      </div>

      <div class="modal-body" style="padding:20px 24px; overflow-y:auto; flex:1;">
        <div style="display:flex; flex-direction:column; gap:12px;">
          ${integrantesList.map(item => {
            const p = item.personal;
            const isLeader = (item.rol_en_equipo || '').toLowerCase().includes('líder') || (item.rol_en_equipo || '').toLowerCase().includes('lider');
            
            return `
              <div style="padding:12px 16px; border:1.5px solid ${isLeader ? 'var(--celeste-300)' : '#e2e8f0'}; background:${isLeader ? '#f0f9ff' : '#ffffff'}; border-radius:10px; display:flex; align-items:center; justify-content:space-between; gap:12px; transition:all 0.15s ease;">
                <div style="display:flex; align-items:center; gap:12px;">
                  <div style="width:40px; height:40px; border-radius:50%; background:${isLeader ? 'var(--celeste-dark)' : 'var(--gray-200)'}; color:#ffffff; font-weight:800; font-size:15px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    ${escapeHtml(p.nombre.charAt(0) + p.apellido.charAt(0))}
                  </div>
                  <div>
                    <div style="font-weight:700; font-size:14px; color:var(--gray-900); display:flex; align-items:center; gap:6px;">
                      <span>${escapeHtml(p.apellido)}, ${escapeHtml(p.nombre)}</span>
                      ${isLeader ? `<span class="badge" style="background:var(--celeste-dark); color:#fff; font-size:10px; font-weight:700; padding:2px 7px;"> Líder de Brigada</span>` : ''}
                    </div>
                    <div style="font-size:12px; font-weight:600; color:var(--celeste-dark); margin-top:2px;">
                       ${escapeHtml(item.rol_en_equipo || 'Integrante de Equipo')}
                    </div>
                    <div style="font-size:11.5px; color:var(--gray-500); margin-top:2px;">
                      ${escapeHtml(p.nombre_rol || 'Personal de Salud')} &middot; Área: ${escapeHtml(p.area || 'Guardia')}
                    </div>
                  </div>
                </div>
                <div style="text-align:right; font-size:11.5px; color:var(--gray-600); flex-shrink:0;">
                  <div><strong>DNI:</strong> ${escapeHtml(p.dni || 'S/D')}</div>
                  <div><strong>Tel:</strong> ${escapeHtml(p.telefono || 'Interno')}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="modal-footer" style="display:flex; justify-content:flex-end; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <button class="btn btn-secondary btn-sm" onclick="this.closest('.integrantes-modal-overlay').remove()">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}


function goToEquiposPage() {
  if (typeof personalTabState !== 'undefined') {
    personalTabState.currentTab = 'equipos';
  }
  window.location.hash = '#/personal';
  if (typeof renderApp === 'function') {
    renderApp();
  }
}

window.goToEquiposPage = goToEquiposPage;
window.showIntegrantesEquipoModal = showIntegrantesEquipoModal;
