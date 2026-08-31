function renderDetalle(id) {
  const codigo = getCodigoById(id);

  if (!codigo) {
    return `
      <div class="page-body">
        <div class="empty-state">
          <h3>Registro no encontrado</h3>
          <p>El codigo azul solicitado no existe</p>
          <a href="#/historial" class="btn btn-primary" style="margin-top:16px;">Volver al historial</a>
        </div>
      </div>
    `;
  }

  const sortedTimeline = [...codigo.timeline].sort((a, b) => new Date(a.hora) - new Date(b.hora));

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
          <p>Codigo Azul #${codigo.id} &middot; ${formatDateTime(codigo.fecha)}</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-outline btn-sm" onclick="exportPDF([getData().find(d=>d.id===${codigo.id})], 'codigo_azul_${codigo.id}.pdf')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            PDF
          </button>
          <a href="#/editar/${codigo.id}" class="btn btn-secondary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </a>
        </div>
      </div>
    </div>
    <div class="page-body">
      <div class="two-col-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <div class="card scale-in">
          <div class="card-header">
            <h2>Informacion del paciente</h2>
            <span class="badge ${codigo.estado.badge}">
              <span class="badge-dot"></span>
              ${codigo.estado.label}
            </span>
          </div>
          <div class="card-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Paciente</span>
                <span class="detail-value">${escapeHtml(codigo.paciente)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Area</span>
                <span class="detail-value">${codigo.area}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Fecha y hora</span>
                <span class="detail-value">${formatDateTime(codigo.fecha)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Responsable</span>
                <span class="detail-value">${escapeHtml(codigo.responsable)}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Tiempo de respuesta</span>
                <span class="detail-value">${codigo.tiempoRespuesta} minutos</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Intervenciones</span>
                <div style="margin-top:4px;">
                  ${codigo.intervenciones.map(i => `<span class="intervention-tag">${i}</span>`).join('')}
                </div>
              </div>
            </div>
            ${codigo.notas ? `
              <div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--gray-100);">
                <span class="detail-label">Notas</span>
                <p style="font-size:14px;color:var(--gray-500);margin-top:4px;line-height:1.6;">${escapeHtml(codigo.notas)}</p>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="card scale-in">
          <div class="card-header">
            <h2>Cronologia de eventos</h2>
          </div>
          <div class="card-body">
            <div class="timeline">
              ${sortedTimeline.map(ev => `
                <div class="timeline-item">
                  <div class="timeline-dot ${ev.tipo}">
                    ${ev.tipo === 'start' ? '&#9733;' : ev.tipo === 'end' ? '&#10003;' : '&#9654;'}
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
    </div>
  `;
}

function setupDetalle() {
  window.scrollTo(0, 0);
}
