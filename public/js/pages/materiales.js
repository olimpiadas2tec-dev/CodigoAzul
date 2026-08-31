let materialesState = {
  search: '',
  tipo: ''
};

function renderMateriales() {
  const materialesList = getMateriales();

  let filtered = materialesList;
  if (materialesState.search) {
    const s = normalizeText(materialesState.search);
    filtered = filtered.filter(m => 
      normalizeText(m.nombre).includes(s) || 
      (m.descripcion && normalizeText(m.descripcion).includes(s)) ||
      normalizeText(m.tipo).includes(s)
    );
  }

  if (materialesState.tipo) {
    filtered = filtered.filter(m => m.tipo === materialesState.tipo);
  }

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Carro de Emergencias e Insumos Médicos</h1>
        <p>Catálogo, control de stock y administración de fármacos y materiales de Código Azul</p>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openMaterialModal()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        + Nuevo Material / Fármaco
      </button>
    </div>

    <div class="page-body">
      <div class="card scale-in">
        <div class="card-body" style="padding-bottom:0;">
          <div class="filters-bar" style="display:flex; flex-wrap:wrap; gap:10px;">
            <div class="filter-group search-input-wrapper" style="flex:1; min-width:240px;">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="mat-search" placeholder="Buscar por nombre, droga o descripción..." value="${escapeHtml(materialesState.search)}" />
            </div>
            <div class="filter-group">
              <select id="mat-tipo-filter">
                <option value="">Todos los tipos</option>
                <option value="Medicamento" ${materialesState.tipo === 'Medicamento' ? 'selected' : ''}>Medicamentos / Drogas</option>
                <option value="Insumo" ${materialesState.tipo === 'Insumo' ? 'selected' : ''}>Insumos / Equipamiento</option>
              </select>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="materialesState.search=''; materialesState.tipo=''; renderApp();">Limpiar</button>
          </div>
        </div>

        <div class="table-container table-stagger">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre / Presentación</th>
                <th>Tipo</th>
                <th>Stock en Carro</th>
                <th>Unidad de Medida</th>
                <th>Descripción / Indicación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="7">
                    <div class="empty-state">
                      <h3>No se encontraron materiales</h3>
                      <p>Intente con otro término o agregue un nuevo material al carro</p>
                    </div>
                  </td>
                </tr>
              ` : filtered.map(m => `
                <tr>
                  <td style="font-weight:600; color:var(--gray-400);">${m.id}</td>
                  <td style="font-weight:700; color:var(--gray-800); font-size:13px;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${m.tipo === 'Medicamento' ? 'var(--celeste)' : '#10b981'}; margin-right:6px;"></span>
                    ${escapeHtml(m.nombre)}
                  </td>
                  <td>
                    <span class="badge ${m.tipo === 'Medicamento' ? 'badge-info' : 'badge-success'}">
                      ${escapeHtml(m.tipo)}
                    </span>
                  </td>
                  <td>
                    <span style="font-weight:700; font-size:13px; color:${(m.stock || 20) < 10 ? 'var(--danger)' : 'var(--gray-800)'};">
                      ${m.stock || 20}
                    </span>
                    ${(m.stock || 20) < 10 ? '<span style="font-size:10px; color:var(--danger); margin-left:4px;">(Bajo)</span>' : ''}
                  </td>
                  <td style="color:var(--gray-600); font-weight:500;">${escapeHtml(m.unidad)}</td>
                  <td style="font-size:12px; color:var(--gray-500); max-width:280px; line-height:1.4;">
                    ${escapeHtml(m.descripcion || '')}
                  </td>
                  <td>
                    <div style="display:flex; gap:6px;">
                      <button class="action-link" onclick="openMaterialModal(${m.id})">Editar</button>
                      <button class="action-link danger" onclick="confirmDeleteMaterial(${m.id})">Eliminar</button>
                    </div>
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

function setupMateriales() {
  const search = document.getElementById('mat-search');
  const tipoFilter = document.getElementById('mat-tipo-filter');

  if (search) {
    search.addEventListener('input', (e) => {
      materialesState.search = e.target.value;
      const cursorPosition = e.target.selectionStart;
      renderApp();
      requestAnimationFrame(() => {
        const reSearch = document.getElementById('mat-search');
        if (reSearch) {
          reSearch.focus();
          reSearch.setSelectionRange(cursorPosition, cursorPosition);
        }
      });
    });
  }

  if (tipoFilter) {
    tipoFilter.addEventListener('change', () => {
      materialesState.tipo = tipoFilter.value;
      renderApp();
    });
  }
}

function openMaterialModal(editId = null) {
  const isEdit = editId !== null;
  const materialesList = getMateriales();
  const mat = isEdit ? materialesList.find(m => m.id === editId) : null;

  document.querySelector('.mat-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active mat-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:540px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">
          ${icon('pill')} ${isEdit ? 'Editar Material / Insumo' : 'Nuevo Material o Fármaco'}
        </h2>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.mat-modal-overlay').remove()">&times;</button>
      </div>

      <form id="mat-form">
        <div class="modal-body" style="padding:20px 24px;">
          <div class="form-group" style="margin-bottom:14px;">
            <label>Nombre del Medicamento o Insumo *</label>
            <input type="text" id="m-nom" required placeholder="Ej: Adrenalina 1mg/ml Ampolla" value="${mat ? escapeHtml(mat.nombre) : ''}" />
          </div>

          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
            <div class="form-group">
              <label>Tipo *</label>
              <select id="m-tip" required>
                <option value="Medicamento" ${mat && mat.tipo === 'Medicamento' ? 'selected' : ''}>Medicamento</option>
                <option value="Insumo" ${mat && mat.tipo === 'Insumo' ? 'selected' : ''}>Insumo</option>
              </select>
            </div>
            <div class="form-group">
              <label>Unidad de Medida *</label>
              <input type="text" id="m-uni" required placeholder="Ej: Ampollas, Unidades, Sachets" value="${mat ? escapeHtml(mat.unidad) : 'Ampollas'}" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label>Stock Disponible en Carro de Paro</label>
            <input type="number" id="m-stock" min="0" max="500" value="${mat ? (mat.stock !== undefined ? mat.stock : 20) : 20}" />
          </div>

          <div class="form-group">
            <label>Descripción / Indicación Médica</label>
            <textarea id="m-desc" rows="2" placeholder="Indicaciones de uso, vía de administración...">${mat ? escapeHtml(mat.descripcion || '') : ''}</textarea>
          </div>
        </div>

        <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
          <button type="button" class="btn btn-secondary btn-sm" onclick="this.closest('.mat-modal-overlay').remove()">Cancelar</button>
          <button type="submit" class="btn btn-primary btn-sm">Guardar Material</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);

  document.getElementById('mat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('m-nom').value.trim();
    const tipo = document.getElementById('m-tip').value;
    const unidad = document.getElementById('m-uni').value.trim();
    const stock = parseInt(document.getElementById('m-stock').value) || 0;
    const descripcion = document.getElementById('m-desc').value.trim();

    if (!nombre || !unidad) {
      showToast('Complete los campos obligatorios (*)', 'error');
      return;
    }

    const currentList = getMateriales();

    if (isEdit) {
      const idx = currentList.findIndex(m => m.id === editId);
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], nombre, tipo, unidad, stock, descripcion };
        saveMateriales(currentList);
        showToast('Material actualizado con éxito', 'success');
      }
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map(m => m.id)) + 1 : 1;
      currentList.push({ id: newId, nombre, tipo, unidad, stock, descripcion });
      saveMateriales(currentList);
      showToast('Material registrado exitosamente', 'success');
    }

    document.querySelector('.mat-modal-overlay')?.remove();
    renderApp();
  });
}

function confirmDeleteMaterial(id) {
  const currentList = getMateriales();
  const mat = currentList.find(m => m.id === id);
  if (!mat) return;

  if (typeof showConfirmModal === 'function') {
    showConfirmModal({
      title: 'Eliminar Material / Insumo',
      message: `¿Está seguro de eliminar <strong>"${escapeHtml(mat.nombre)}"</strong> del catálogo del carro de paro?`,
      onConfirm: () => {
        const rest = currentList.filter(m => m.id !== id);
        saveMateriales(rest);
        showToast('Material eliminado correctamente', 'success');
        renderApp();
      }
    });
  } else {
    const rest = currentList.filter(m => m.id !== id);
    saveMateriales(rest);
    showToast('Material eliminado', 'success');
    renderApp();
  }
}

window.openMaterialModal = openMaterialModal;
window.confirmDeleteMaterial = confirmDeleteMaterial;

