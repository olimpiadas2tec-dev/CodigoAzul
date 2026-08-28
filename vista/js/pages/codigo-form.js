function renderCodigoForm(editId = null) {
  const isEdit = editId !== null;
  const codigo = isEdit ? getCodigoById(editId) : null;

  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  return `
    <div class="page-header page-transition">
      <h1>${isEdit ? 'Editar' : 'Nuevo'} Codigo Azul</h1>
      <p>${isEdit ? 'Actualizar los datos del registro' : 'Registrar un nuevo evento de codigo azul'}</p>
    </div>
    <div class="page-body">
      <div class="card scale-in">
        <div class="card-body">
          <form id="codigo-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Paciente *</label>
                <input type="text" id="form-paciente" required placeholder="Nombre y edad del paciente" value="${codigo ? escapeHtml(codigo.paciente) : ''}" />
              </div>
              <div class="form-group">
                <label>Fecha y hora *</label>
                <input type="datetime-local" id="form-fecha" required value="${codigo ? codigo.fecha.slice(0, 16) : localDate}" />
              </div>
              <div class="form-group">
                <label>Area *</label>
                <select id="form-area" required>
                  <option value="">Seleccionar area</option>
                  ${AREAS.map(a => `<option value="${a}" ${codigo && codigo.area === a ? 'selected' : ''}>${a}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Estado *</label>
                <select id="form-estado" required>
                  <option value="">Seleccionar estado</option>
                  ${ESTADOS.map(e => `<option value="${e.value}" ${codigo && codigo.estado.value === e.value ? 'selected' : ''}>${e.label}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Responsable *</label>
                <select id="form-responsable" required>
                  <option value="">Seleccionar responsable</option>
                  ${RESPONSABLES.map(r => `<option value="${r}" ${codigo && codigo.responsable === r ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Tiempo de respuesta (minutos) *</label>
                <input type="number" id="form-tiempo" required min="1" max="120" placeholder="Minutos" value="${codigo ? codigo.tiempoRespuesta : ''}" />
              </div>
              <div class="form-group full-width">
                <label>Intervenciones realizadas *</label>
                <div id="form-intervenciones" style="display:flex;flex-wrap:wrap;gap:8px;">
                  ${INTERVENCIONES_LISTA.map(int => `
                    <label style="display:flex;align-items:center;gap:6px;padding:8px 14px;border:1.5px solid var(--gray-200);border-radius:var(--radius);cursor:pointer;font-size:13px;font-weight:500;color:var(--gray-600);transition:var(--transition);"
                      class="intervencion-check">
                      <input type="checkbox" value="${int}" ${codigo && codigo.intervenciones.includes(int) ? 'checked' : ''} style="accent-color:var(--celeste);" />
                      ${int}
                    </label>
                  `).join('')}
                </div>
              </div>
              <div class="form-group full-width">
                <label>Notas adicionales</label>
                <textarea id="form-notas" placeholder="Observaciones, antecedentes relevantes..." rows="3">${codigo ? escapeHtml(codigo.notas || '') : ''}</textarea>
              </div>
            </div>

            <div class="form-actions">
              <a href="${isEdit ? '#/detalle/' + editId : '#/historial'}" class="btn btn-secondary">Cancelar</a>
              <button type="submit" class="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                ${isEdit ? 'Guardar cambios' : 'Registrar codigo azul'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

function setupCodigoForm(editId = null) {
  const form = document.getElementById('codigo-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const paciente = document.getElementById('form-paciente').value.trim();
    const fecha = document.getElementById('form-fecha').value;
    const area = document.getElementById('form-area').value;
    const estadoVal = document.getElementById('form-estado').value;
    const responsable = document.getElementById('form-responsable').value;
    const tiempoRespuesta = parseInt(document.getElementById('form-tiempo').value);
    const notas = document.getElementById('form-notas').value.trim();

    const intervencionesCheckboxes = document.querySelectorAll('#form-intervenciones input[type="checkbox"]:checked');
    const intervenciones = Array.from(intervencionesCheckboxes).map(cb => cb.value);

    if (!paciente || !fecha || !area || !estadoVal || !responsable || !tiempoRespuesta || intervenciones.length === 0) {
      showToast('Complete todos los campos obligatorios', 'error');
      return;
    }

    const estado = ESTADOS.find(e => e.value === estadoVal);
    const fechaISO = new Date(fecha).toISOString();

    if (editId) {
      const existing = getCodigoById(editId);
      const timeline = existing ? existing.timeline : [];

      updateCodigo(parseInt(editId), {
        paciente,
        fecha: fechaISO,
        area,
        estado,
        responsable,
        tiempoRespuesta,
        intervenciones,
        notas
      });

      showToast('Registro actualizado correctamente');
      window.location.hash = `#/detalle/${editId}`;
    } else {
      const timeline = [
        {
          hora: fechaISO,
          titulo: 'Codigo Azul Activado',
          descripcion: `Activado en ${area}`,
          tipo: 'start'
        }
      ];

      if (intervenciones.length > 0) {
        const t = new Date(fecha);
        t.setMinutes(t.getMinutes() + 3);
        timeline.push({
          hora: t.toISOString(),
          titulo: intervenciones[0],
          descripcion: `Aplicada por ${responsable}`,
          tipo: 'action'
        });
      }

      if (estadoVal === 'resuelto') {
        const t = new Date(fecha);
        t.setMinutes(t.getMinutes() + tiempoRespuesta + 5);
        timeline.push({
          hora: t.toISOString(),
          titulo: 'Paciente estabilizado',
          descripcion: 'Paciente respondiendo a tratamiento',
          tipo: 'end'
        });
      }

      const nuevo = addCodigo({
        paciente,
        fecha: fechaISO,
        area,
        estado,
        responsable,
        tiempoRespuesta,
        intervenciones,
        notas,
        timeline
      });

      showToast('Codigo azul registrado correctamente');
      window.location.hash = `#/detalle/${nuevo.id}`;
    }
  });

  // Toggle styling on intervencion checkboxes
  document.querySelectorAll('.intervencion-check').forEach(label => {
    const cb = label.querySelector('input[type="checkbox"]');
    const updateStyle = () => {
      if (cb.checked) {
        label.style.borderColor = 'var(--celeste)';
        label.style.background = 'var(--celeste-light)';
        label.style.color = 'var(--celeste-dark)';
      } else {
        label.style.borderColor = 'var(--gray-200)';
        label.style.background = 'transparent';
        label.style.color = 'var(--gray-600)';
      }
    };
    cb.addEventListener('change', updateStyle);
    updateStyle();
  });
}
