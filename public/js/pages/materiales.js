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

  const lowStockItems = materialesList.filter(m => (m.stock !== undefined ? m.stock : 20) <= 15);
  const medCount = materialesList.filter(m => m.tipo === 'Medicamento').length;
  const insCount = materialesList.filter(m => m.tipo === 'Insumo').length;

  return `
    <div class="page-header page-header-row page-transition">
      <div>
        <h1>Carro de Emergencias e Insumos Médicos</h1>
        <p>Catálogo, control de stock y administración de fármacos y materiales de Código Azul</p>
      </div>
      ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? '' : `
        <button class="btn btn-primary btn-sm" onclick="openMaterialModal()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nuevo Material / Fármaco
        </button>
      `}
    </div>

    <div class="page-body">
      ${lowStockItems.length > 0 ? `
        <div style="background:#fffbebf7; border:1px solid #fde68a; border-left:4px solid #f59e0b; padding:12px 16px; border-radius:10px; margin-bottom:16px; display:flex; align-items:center; justify-content:space-between; gap:12px; animation:fadeIn 0.2s ease;">
          <div style="display:flex; align-items:center; gap:10px;">
            
            <div>
              <strong style="color:#92400e; font-size:13.5px;">Alerta de Reposición en Carro de Paro:</strong>
              <span style="color:#b45309; font-size:12.5px;"> Se detectaron <strong>${lowStockItems.length} fármacos e insumos</strong> en punto de reposición (≤ 15 unidades).</span>
            </div>
          </div>
          <span class="badge" style="background:#fef3c7; color:#92400e; font-size:11px; font-weight:700; border:1px solid #fde68a;"> Requerida</span>
        </div>
      ` : ''}

      <div class="card scale-in">
        <div class="card-body" style="padding-bottom:0;">
          <div class="filters-bar" style="display:flex; flex-wrap:wrap; gap:12px; align-items:center; justify-content:space-between;">
            <div class="search-input-wrapper" style="flex:1; min-width:240px; position:relative;">
              <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); width:15px; height:15px; color:var(--gray-400);"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" id="mat-search" placeholder="Buscar por nombre, droga o descripción..." value="${escapeHtml(materialesState.search)}" style="padding:8px 12px 8px 36px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:12.5px; width:100%; outline:none;" />
            </div>

            <!-- Filtro Segmentado de Categorías -->
            <div style="display:flex; gap:4px; background:#f1f5f9; padding:4px; border-radius:10px; border:1px solid #e2e8f0;">
              <button onclick="setMaterialTypeFilter('')" class="btn btn-sm" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; border:none; cursor:pointer; transition:all 0.15s ease; ${materialesState.tipo === '' ? 'background:#ffffff; color:var(--gray-900); box-shadow:0 1px 3px rgba(0,0,0,0.1);' : 'background:transparent; color:var(--gray-600);'}">
                Todos (${materialesList.length})
              </button>
              <button onclick="setMaterialTypeFilter('Medicamento')" class="btn btn-sm" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; border:none; cursor:pointer; transition:all 0.15s ease; ${materialesState.tipo === 'Medicamento' ? 'background:var(--celeste-dark); color:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.1);' : 'background:transparent; color:var(--gray-600);'}">
                Medicamentos (${medCount})
              </button>
              <button onclick="setMaterialTypeFilter('Insumo')" class="btn btn-sm" style="padding:6px 14px; font-size:12px; font-weight:700; border-radius:8px; border:none; cursor:pointer; transition:all 0.15s ease; ${materialesState.tipo === 'Insumo' ? 'background:#059669; color:#ffffff; box-shadow:0 1px 3px rgba(0,0,0,0.1);' : 'background:transparent; color:var(--gray-600);'}">
                Insumos (${insCount})
              </button>
            </div>

            <button class="btn btn-secondary btn-sm" onclick="materialesState.search=''; materialesState.tipo=''; renderApp();" style="padding:6px 14px; border-radius:10px; font-size:12px; font-weight:600;">Limpiar</button>
          </div>
        </div>

        <div class="table-container table-stagger" style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12.5px;">
            <thead>
              <tr style="background:var(--gray-50); border-bottom:1px solid var(--gray-200);">
                <th style="padding:10px 12px; text-align:left;">#</th>
                <th style="padding:10px 12px; text-align:left;">FÁRMACO / MATERIAL</th>
                <th style="padding:10px 12px; text-align:left;">CATEGORÍA</th>
                <th style="padding:10px 12px; text-align:left;">STOCK DISPONIBLE</th>
                <th style="padding:10px 12px; text-align:left;">UNIDAD</th>
                <th style="padding:10px 12px; text-align:left;">INDICACIÓN CLINICA</th>
                <th style="padding:10px 12px; text-align:center;">ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="7" style="vertical-align:middle;">
                    <div class="empty-state" style="padding:30px 20px; text-align:center;">
                      <span style="font-size:32px;">${icon('search')}</span>
                      <h3 style="margin-top:8px;">No se encontraron fármacos o insumos</h3>
                      <p>Intente ajustar los filtros de búsqueda o categoría</p>
                    </div>
                  </td>
                </tr>
              ` : filtered.map(m => {
                const stock = m.cantidad !== undefined ? m.cantidad : (m.stock !== undefined ? m.stock : 20);
                const stockMax = m.stockMax || 30;
                const pct = Math.min(100, Math.round((stock / stockMax) * 100));

                let stockStatusBadge = '';
                let barColor = '#059669';
                let textColor = '#166534';

                if (stock <= 10) {
                  stockStatusBadge = `<span class="badge" style="background:#fef2f2; color:#991b1b; border:1px solid #fca5a5; font-size:10px; font-weight:700;">Crítico</span>`;
                  barColor = '#dc2626';
                  textColor = '#991b1b';
                } else if (stock <= 25) {
                  stockStatusBadge = `<span class="badge" style="background:#fffbe0; color:#92400e; border:1px solid #fde68a; font-size:10px; font-weight:700;">Reposición</span>`;
                  barColor = '#f59e0b';
                  textColor = '#92400e';
                } else {
                  stockStatusBadge = `<span class="badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:10px; font-weight:700;">Óptimo</span>`;
                  barColor = '#10b981';
                  textColor = '#065f46';
                }

                return `
                  <tr style="border-bottom:1px solid var(--gray-100);">
                    <td style="font-weight:600; color:var(--gray-400); vertical-align:middle; padding:10px 12px;">${m.id}</td>
                    <td style="font-weight:700; color:var(--gray-900); font-size:13px; vertical-align:middle; padding:10px 12px;">
                      ${escapeHtml(m.nombre)}
                    </td>
                    <td style="vertical-align:middle; padding:10px 12px;">
                      <span class="badge ${m.tipo === 'Medicamento' ? 'badge-info' : 'badge-success'}" style="display:inline-flex; align-items:center; gap:5px; padding:4px 10px; font-size:11.5px; font-weight:700; white-space:nowrap; border-radius:9999px;">
                        ${m.tipo === 'Medicamento' ? `${icon('pill', 13)} Medicamento` : `${icon('package', 13)} Insumo`}
                      </span>
                    </td>
                    <td style="vertical-align:middle; padding:10px 12px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <div style="min-width:65px;">
                          <span style="font-weight:800; font-size:13.5px; color:${textColor};">${stock} / ${stockMax}</span>
                          <div style="font-size:10.5px; color:var(--gray-500);">${pct}% capacidad</div>
                        </div>
                        <div style="width:45px; height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden; flex-shrink:0;">
                          <div style="width:${pct}%; height:100%; background:${barColor}; border-radius:3px;"></div>
                        </div>
                        ${stockStatusBadge}
                      </div>
                    </td>
                    <td style="color:var(--gray-600); font-weight:500; vertical-align:middle; padding:10px 12px;">${escapeHtml(m.unidad)}</td>
                    <td style="font-size:12px; color:var(--gray-600); max-width:210px; vertical-align:middle; padding:10px 12px;">
                      <span title="${escapeHtml(m.descripcion || '')}" style="display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; line-height:1.3; cursor:help;">
                        ℹ ${escapeHtml(m.descripcion || 'Sin indicación especificada')}
                      </span>
                    </td>
                    <td style="vertical-align:middle; padding:10px 12px; text-align:center;">
                      ${(typeof isConsultaRole === 'function' && isConsultaRole()) ? `
                        <span style="font-size:11px; color:var(--gray-400); font-style:italic;">Solo lectura</span>
                      ` : `
                        <div style="display:flex; gap:14px; justify-content:center; align-items:center;">
                          <button class="action-link" onclick="openMaterialModal(${m.id})" style="font-weight:700; font-size:13.5px; color:var(--celeste-dark);"></button>
                          <button class="action-link danger" onclick="confirmDeleteMaterial(${m.id})" title="Eliminar Material" style="display:inline-flex; align-items:center; justify-content:center; border:none; background:none; color:var(--danger); cursor:pointer;">
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
    </div>
  `;
}

function setMaterialTypeFilter(tipo) {
  materialesState.tipo = tipo;
  renderApp();
}

function setupMateriales() {
  const search = document.getElementById('mat-search');

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

          <div class="form-grid" style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:14px;">
            <div class="form-group">
              <label>Stock Actual en Carro *</label>
              <input type="number" id="m-stock" min="0" max="${mat ? (mat.stockMax || 50) : 50}" required value="${mat ? (mat.stock !== undefined ? mat.stock : 20) : 20}" />
              <small id="stock-error-msg" style="color:var(--danger); font-size:11px; display:none; margin-top:3px; font-weight:600;">El stock actual no puede superar la capacidad máxima.</small>
            </div>
            <div class="form-group">
              <label>Capacidad Máxima del Carro *</label>
              <input type="number" id="m-stockmax" min="1" max="500" required value="${mat ? (mat.stockMax || 50) : 50}" />
            </div>
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

  const stockInput = document.getElementById('m-stock');
  const stockMaxInput = document.getElementById('m-stockmax');
  const errorMsg = document.getElementById('stock-error-msg');

  function validateStockLimits() {
    const s = parseInt(stockInput.value) || 0;
    const max = parseInt(stockMaxInput.value) || 1;
    stockInput.max = max;

    if (s > max) {
      stockInput.style.borderColor = 'var(--danger)';
      stockInput.style.backgroundColor = '#fef2f2';
      if (errorMsg) errorMsg.style.display = 'block';
      return false;
    } else {
      stockInput.style.borderColor = '';
      stockInput.style.backgroundColor = '';
      if (errorMsg) errorMsg.style.display = 'none';
      return true;
    }
  }

  stockInput.addEventListener('input', validateStockLimits);
  stockMaxInput.addEventListener('input', validateStockLimits);

  document.getElementById('mat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('m-nom').value.trim();
    const tipo = document.getElementById('m-tip').value;
    const unidad = document.getElementById('m-uni').value.trim();
    const stock = parseInt(stockInput.value) || 0;
    const stockMax = parseInt(stockMaxInput.value) || 50;
    const descripcion = document.getElementById('m-desc').value.trim();

    if (!nombre || !unidad) {
      showToast('Complete los campos obligatorios (*)', 'error');
      return;
    }

    if (stock > stockMax) {
      showToast(`El Stock Actual (${stock}) no puede superar la Capacidad Máxima del Carro (${stockMax})`, 'error');
      stockInput.focus();
      validateStockLimits();
      return;
    }

    const currentList = getMateriales();

    if (isEdit) {
      const idx = currentList.findIndex(m => m.id === editId);
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], nombre, tipo, unidad, stock, stockMax, descripcion };
        saveMateriales(currentList);
        showToast('Material actualizado con éxito', 'success');
      }
    } else {
      const newId = currentList.length > 0 ? Math.max(...currentList.map(m => m.id)) + 1 : 1;
      currentList.push({ id: newId, nombre, tipo, unidad, stock, stockMax, descripcion });
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

window.setMaterialTypeFilter = setMaterialTypeFilter;
window.openMaterialModal = openMaterialModal;
window.confirmDeleteMaterial = confirmDeleteMaterial;

