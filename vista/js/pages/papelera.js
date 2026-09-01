let papeleraState = { activeTab: 'pacientes', search: '' };

function getDaysUntilDeletion(deletedAtStr) {
  if (!deletedAtStr) return 30;
  const deletedAt = new Date(deletedAtStr);
  const deletionDate = new Date(deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffTime = deletionDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function getDeletionColor(days) {
  if (days > 15) return 'var(--success, #22c55e)';
  if (days >= 5) return 'var(--warning, #eab308)';
  return 'var(--danger, #ef4444)';
}

function renderPapelera() {
  const pacientes = (typeof getTrashPacientes === 'function' ? getTrashPacientes() : []) || [];
  const personal = (typeof getTrashPersonal === 'function' ? getTrashPersonal() : []) || [];
  const codigos = (typeof getTrashCodigos === 'function' ? getTrashCodigos() : []) || [];

  const counts = {
    pacientes: pacientes.length,
    personal: personal.length,
    codigos: codigos.length
  };

  let activeData = [];
  if (papeleraState.activeTab === 'pacientes') activeData = pacientes;
  else if (papeleraState.activeTab === 'personal') activeData = personal;
  else if (papeleraState.activeTab === 'codigos') activeData = codigos;

  // Filter by search
  if (papeleraState.search) {
    const s = papeleraState.search.toLowerCase();
    activeData = activeData.filter(item => {
      return Object.values(item).join(' ').toLowerCase().includes(s);
    });
  }

  const renderTabButton = (id, label, count, iconName) => {
    const isActive = papeleraState.activeTab === id;
    const iconHtml = typeof icon === 'function' ? icon(iconName, 18) : '';
    return `
      <button 
        class="tab-btn ${isActive ? 'active' : ''}" 
        onclick="window.switchPapeleraTab('${id}')"
        style="
          display: flex; align-items: center; gap: 0.5rem; 
          padding: 0.75rem 1.5rem; 
          border: none; 
          background: ${isActive ? 'var(--primary, #0f172a)' : 'transparent'}; 
          color: ${isActive ? 'var(--white, #fff)' : 'var(--gray-600, #475569)'}; 
          border-radius: var(--radius-lg, 0.5rem);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        "
      >
        ${iconHtml}
        ${label}
        <span style="
          background: ${isActive ? 'rgba(255,255,255,0.2)' : 'var(--gray-200, #e2e8f0)'};
          color: ${isActive ? 'var(--white, #fff)' : 'var(--gray-700, #334155)'};
          padding: 0.125rem 0.5rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        ">${count}</span>
      </button>
    `;
  };

  const renderTableHeaders = () => {
    if (papeleraState.activeTab === 'pacientes') {
      return `<th>Nombre</th><th>DNI</th><th>Eliminado por</th><th>Se elimina en</th><th>Acciones</th>`;
    } else if (papeleraState.activeTab === 'personal') {
      return `<th>Nombre</th><th>Rol</th><th>Eliminado por</th><th>Se elimina en</th><th>Acciones</th>`;
    } else {
      return `<th>Fecha/Hora</th><th>Ubicación</th><th>Eliminado por</th><th>Se elimina en</th><th>Acciones</th>`;
    }
  };

  const safeEscape = (str) => typeof escapeHtml === 'function' ? escapeHtml(str || '') : (str || '');
  const getIcon = (name, size) => typeof icon === 'function' ? icon(name, size) : '';

  const renderTableRow = (item) => {
    const days = getDaysUntilDeletion(item.deleted_at);
    const color = getDeletionColor(days);
    const timeStatus = `<span style="color: ${color}; font-weight: 600; display: flex; align-items: center; gap: 0.25rem;">${getIcon('clock', 14)} ${days} días</span>`;
    
    let cols = '';
    let itemName = '';
    let restoreFn = '';
    let deleteFn = '';
    let id = item._trashId || item.id;

    if (papeleraState.activeTab === 'pacientes') {
      itemName = safeEscape(`${item.nombre} ${item.apellido}`);
      cols = `
        <td><div style="font-weight: 500; color: var(--gray-900, #0f172a);">${itemName}</div></td>
        <td><div style="color: var(--gray-600, #475569);">${safeEscape(item.dni || '-')}</div></td>
        <td><div style="color: var(--gray-600, #475569);"><span style="display:inline-flex; align-items:center; gap:0.25rem;">${getIcon('user', 14)} ${safeEscape(item.deleted_by || 'Sistema')}</span></div></td>
      `;
      restoreFn = `window.restorePacienteFromTrash('${id}')`;
      deleteFn = `window.permanentDeletePacienteFromTrash('${id}', '${itemName.replace(/'/g, "\\'")}')`;
    } else if (papeleraState.activeTab === 'personal') {
      itemName = safeEscape(`${item.nombre} ${item.apellido}`);
      cols = `
        <td><div style="font-weight: 500; color: var(--gray-900, #0f172a);">${itemName}</div></td>
        <td><span class="badge" style="background: var(--gray-100, #f1f5f9); color: var(--gray-700, #334155); padding: 0.25rem 0.5rem; border-radius: 999px; font-size: 0.875rem;">${safeEscape(item.rol || '-')}</span></td>
        <td><div style="color: var(--gray-600, #475569);"><span style="display:inline-flex; align-items:center; gap:0.25rem;">${getIcon('user', 14)} ${safeEscape(item.deleted_by || 'Sistema')}</span></div></td>
      `;
      restoreFn = `window.restorePersonalFromTrash('${id}')`;
      deleteFn = `window.permanentDeletePersonalFromTrash('${id}', '${itemName.replace(/'/g, "\\'")}')`;
    } else {
      const displayDate = new Date(item.fecha || item.deleted_at || new Date());
      itemName = `Código del ${displayDate.toLocaleDateString()}`;
      cols = `
        <td><div style="font-weight: 500; color: var(--gray-900, #0f172a);">${safeEscape(displayDate.toLocaleString())}</div></td>
        <td><div style="color: var(--gray-600, #475569);">${safeEscape(item.ubicacion || '-')}</div></td>
        <td><div style="color: var(--gray-600, #475569);"><span style="display:inline-flex; align-items:center; gap:0.25rem;">${getIcon('user', 14)} ${safeEscape(item.deleted_by || 'Sistema')}</span></div></td>
      `;
      restoreFn = `window.restoreCodigoFromTrash('${id}')`;
      deleteFn = `window.permanentDeleteCodigoFromTrash('${id}', '${itemName.replace(/'/g, "\\'")}')`;
    }

    return `
      <tr style="border-bottom: 1px solid var(--gray-200, #e2e8f0); transition: background-color 0.15s ease;" onmouseover="this.style.backgroundColor='var(--gray-50, #f8fafc)'" onmouseout="this.style.backgroundColor='transparent'">
        ${cols}
        <td>${timeStatus}</td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-sm" onclick="${restoreFn}" title="Restaurar" style="background: var(--celeste, #38bdf8); color: white; border: none; padding: 0.4rem; border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05)); transition: opacity 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              ${getIcon('refreshCw', 16)}
            </button>
            <button class="btn btn-sm" onclick="${deleteFn}" title="Eliminar permanentemente" style="background: var(--danger, #ef4444); color: white; border: none; padding: 0.4rem; border-radius: 0.375rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm, 0 1px 2px 0 rgba(0, 0, 0, 0.05)); transition: opacity 0.2s ease;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
              ${getIcon('trash', 16)}
            </button>
          </div>
        </td>
      </tr>
    `;
  };

  const emptyState = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 2rem; text-align: center; background: var(--white, #fff); border-radius: var(--radius-lg, 0.5rem); border: 1px dashed var(--gray-300, #cbd5e1);">
      <div style="color: var(--gray-400, #94a3b8); margin-bottom: 1rem; padding: 1rem; background: var(--gray-50, #f8fafc); border-radius: 50%;">
        ${getIcon('trash', 48)}
      </div>
      <h3 style="margin: 0 0 0.5rem 0; color: var(--gray-900, #0f172a); font-size: 1.125rem; font-weight: 600;">Papelera vacía</h3>
      <p style="margin: 0; color: var(--gray-500, #64748b); max-width: 400px;">
        No hay elementos eliminados en esta categoría. Los elementos eliminados aparecerán aquí y se borrarán permanentemente después de 30 días.
      </p>
    </div>
  `;

  return `
    <div class="papelera-container" style="padding: 1.5rem; max-width: 1200px; margin: 0 auto; animation: fadeIn 0.3s ease;">
      <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h1 style="margin: 0 0 0.5rem 0; font-size: 1.875rem; font-weight: 700; color: var(--gray-900, #0f172a); display: flex; align-items: center; gap: 0.75rem;">
            <div style="background: var(--gray-100, #f1f5f9); color: var(--gray-700, #334155); padding: 0.5rem; border-radius: var(--radius-lg, 0.5rem);">
              ${getIcon('trash', 24)}
            </div>
            Papelera de Reciclaje
          </h1>
          <p style="margin: 0; color: var(--gray-500, #64748b); font-size: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            ${getIcon('alertTriangle', 16)} Los elementos se eliminarán permanentemente después de 30 días.
          </p>
        </div>
      </header>

      <div style="background: var(--white, #fff); border-radius: var(--radius-xl, 1rem); box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)); overflow: hidden; border: 1px solid var(--gray-200, #e2e8f0);">
        
        <!-- Tabs -->
        <div style="display: flex; gap: 0.5rem; padding: 1rem 1rem 0 1rem; border-bottom: 1px solid var(--gray-200, #e2e8f0); background: var(--gray-50, #f8fafc); overflow-x: auto;">
          ${renderTabButton('pacientes', 'Pacientes', counts.pacientes, 'users')}
          ${renderTabButton('personal', 'Personal de Salud', counts.personal, 'user')}
          ${renderTabButton('codigos', 'Historial de Códigos Azules', counts.codigos, 'heart')}
        </div>

        <!-- Controls (Search + Vaciar Papelera) -->
        <div style="padding: 1rem; border-bottom: 1px solid var(--gray-200, #e2e8f0); background: var(--white, #fff); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap;">
          <div style="position: relative; width: 100%; max-width: 400px;">
            <div style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--gray-400, #94a3b8);">
              ${getIcon('search', 18)}
            </div>
            <input 
              type="text" 
              id="papelera-search"
              placeholder="Buscar en papelera..." 
              value="${safeEscape(papeleraState.search)}"
              oninput="window.filterPapelera(this.value)"
              style="width: 100%; padding: 0.625rem 1rem 0.625rem 2.5rem; border: 1px solid var(--gray-300, #cbd5e1); border-radius: var(--radius-lg, 0.5rem); outline: none; font-size: 0.875rem; transition: border-color 0.2s ease, box-shadow 0.2s ease;"
              onfocus="this.style.borderColor='var(--celeste, #38bdf8)'; this.style.boxShadow='0 0 0 3px rgba(56, 189, 248, 0.2)';"
              onblur="this.style.borderColor='var(--gray-300, #cbd5e1)'; this.style.boxShadow='none';"
            >
          </div>

          <!-- Botón Vaciar Papelera de la Sección Activa -->
          ${counts[papeleraState.activeTab] > 0 ? `
            <button 
              class="btn btn-sm" 
              onclick="window.emptyPapeleraTab('${papeleraState.activeTab}')" 
              title="Vaciar todos los registros de esta sección"
              style="background: #dc2626; color: #ffffff; border: none; padding: 0.6rem 1.2rem; border-radius: var(--radius-lg, 0.5rem); font-size: 0.875rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2); transition: background-color 0.2s ease, transform 0.1s ease;"
              onmouseover="this.style.background='#b91c1c';"
              onmouseout="this.style.background='#dc2626';"
            >
              ${getIcon('trash', 16)} Vaciar Papelera
            </button>
          ` : `
            <button 
              class="btn btn-sm" 
              disabled 
              title="No hay elementos para vaciar en esta sección"
              style="background: var(--gray-100, #f1f5f9); color: var(--gray-400, #94a3b8); border: 1px solid var(--gray-200, #e2e8f0); padding: 0.6rem 1.2rem; border-radius: var(--radius-lg, 0.5rem); font-size: 0.875rem; font-weight: 600; cursor: not-allowed; display: inline-flex; align-items: center; gap: 0.5rem;"
            >
              ${getIcon('trash', 16)} Vaciar Papelera
            </button>
          `}
        </div>

        <!-- Content -->
        <div style="padding: 0; overflow-x: auto;">
          ${activeData.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse; text-align: left; min-width: 800px;">
              <thead>
                <tr style="background: var(--gray-50, #f8fafc); border-bottom: 1px solid var(--gray-200, #e2e8f0);">
                  ${renderTableHeaders()}
                </tr>
              </thead>
              <tbody style="font-size: 0.875rem;">
                ${activeData.map(item => renderTableRow(item)).join('')}
              </tbody>
            </table>
          ` : `
            <div style="padding: 2rem;">
              ${emptyState}
            </div>
          `}
        </div>
        
      </div>
      
      <style>
        .papelera-container th {
          padding: 0.75rem 1.5rem;
          color: var(--gray-500, #64748b);
          font-weight: 600;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .papelera-container td {
          padding: 1rem 1.5rem;
          vertical-align: middle;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    </div>
  `;
}

function setupPapelera() {
  if (typeof cleanupTrash === 'function') {
    cleanupTrash();
  }
}

window.switchPapeleraTab = function(tabId) {
  papeleraState.activeTab = tabId;
  papeleraState.search = '';
  if (typeof window.renderApp === 'function') {
    window.renderApp();
  } else {
    const root = document.getElementById('app');
    if (root) {
      root.innerHTML = renderPapelera();
      setupPapelera();
    }
  }
};

window.filterPapelera = function(searchTerm) {
  papeleraState.search = searchTerm;
  
  clearTimeout(window.papeleraSearchTimeout);
  window.papeleraSearchTimeout = setTimeout(() => {
    if (typeof window.renderApp === 'function') {
      window.renderApp();
    } else {
      const root = document.getElementById('app');
      if (root) {
        root.innerHTML = renderPapelera();
        setupPapelera();
      }
    }
    
    setTimeout(() => {
      const input = document.getElementById('papelera-search');
      if (input) {
        input.focus();
        const val = input.value;
        input.value = '';
        input.value = val;
      }
    }, 10);
  }, 300);
};

const safeShowToast = (msg, type) => typeof showToast === 'function' && showToast(msg, type);

window.restorePacienteFromTrash = function(id) {
  if (typeof restorePaciente === 'function' && restorePaciente(id)) {
    safeShowToast('Paciente restaurado exitosamente', 'success');
    if (typeof window.renderApp === 'function') window.renderApp();
  } else {
    safeShowToast('Error al restaurar el paciente', 'error');
  }
};

window.restorePersonalFromTrash = function(id) {
  if (typeof restorePersonal === 'function' && restorePersonal(id)) {
    safeShowToast('Personal restaurado exitosamente', 'success');
    if (typeof window.renderApp === 'function') window.renderApp();
  } else {
    safeShowToast('Error al restaurar el personal', 'error');
  }
};

window.restoreCodigoFromTrash = function(id) {
  if (typeof restoreCodigo === 'function' && restoreCodigo(id)) {
    safeShowToast('Código Azul restaurado exitosamente', 'success');
    if (typeof window.renderApp === 'function') window.renderApp();
  } else {
    safeShowToast('Error al restaurar el código azul', 'error');
  }
};

window.permanentDeletePacienteFromTrash = function(id, itemName) {
  if (typeof showPermanentDeleteModal === 'function') {
    showPermanentDeleteModal({
      title: 'Eliminar Paciente Permanentemente',
      itemName: itemName,
      onConfirm: () => {
        if (typeof permanentDeletePaciente === 'function') {
          permanentDeletePaciente(id);
          safeShowToast('Paciente eliminado permanentemente', 'success');
          if (typeof window.renderApp === 'function') window.renderApp();
        }
      }
    });
  } else {
    if (confirm(`¿Estás seguro de eliminar permanentemente a ${itemName}?`)) {
      if (typeof permanentDeletePaciente === 'function') {
        permanentDeletePaciente(id);
        safeShowToast('Paciente eliminado permanentemente', 'success');
        if (typeof window.renderApp === 'function') window.renderApp();
      }
    }
  }
};

window.permanentDeletePersonalFromTrash = function(id, itemName) {
  if (typeof showPermanentDeleteModal === 'function') {
    showPermanentDeleteModal({
      title: 'Eliminar Personal Permanentemente',
      itemName: itemName,
      onConfirm: () => {
        if (typeof permanentDeletePersonal === 'function') {
          permanentDeletePersonal(id);
          safeShowToast('Personal eliminado permanentemente', 'success');
          if (typeof window.renderApp === 'function') window.renderApp();
        }
      }
    });
  } else {
    if (confirm(`¿Estás seguro de eliminar permanentemente a ${itemName}?`)) {
      if (typeof permanentDeletePersonal === 'function') {
        permanentDeletePersonal(id);
        safeShowToast('Personal eliminado permanentemente', 'success');
        if (typeof window.renderApp === 'function') window.renderApp();
      }
    }
  }
};

window.permanentDeleteCodigoFromTrash = function(id, itemName) {
  if (typeof showPermanentDeleteModal === 'function') {
    showPermanentDeleteModal({
      title: 'Eliminar Código Azul Permanentemente',
      itemName: itemName,
      onConfirm: () => {
        if (typeof permanentDeleteCodigo === 'function') {
          permanentDeleteCodigo(id);
          safeShowToast('Código Azul eliminado permanentemente', 'success');
          if (typeof window.renderApp === 'function') window.renderApp();
        }
      }
    });
  } else {
    if (confirm(`¿Estás seguro de eliminar permanentemente el ${itemName}?`)) {
      if (typeof permanentDeleteCodigo === 'function') {
        permanentDeleteCodigo(id);
        safeShowToast('Código Azul eliminado permanentemente', 'success');
        if (typeof window.renderApp === 'function') window.renderApp();
      }
    }
  }
};

window.emptyPapeleraTab = function(tab) {
  let sectionName = 'Pacientes';
  let emptyFn = typeof emptyTrashPacientes === 'function' ? emptyTrashPacientes : null;

  if (tab === 'personal') {
    sectionName = 'Personal de Salud';
    emptyFn = typeof emptyTrashPersonal === 'function' ? emptyTrashPersonal : null;
  } else if (tab === 'codigos') {
    sectionName = 'Historial de Códigos Azules';
    emptyFn = typeof emptyTrashCodigos === 'function' ? emptyTrashCodigos : null;
  }

  if (typeof showPermanentDeleteModal === 'function') {
    showPermanentDeleteModal({
      title: `Vaciar Papelera de ${sectionName}`,
      itemName: `TODOS los registros de ${sectionName} en la papelera`,
      onConfirm: () => {
        if (typeof emptyFn === 'function') {
          emptyFn();
          safeShowToast(`Papelera de ${sectionName} vaciada con éxito`, 'success');
          if (typeof window.renderApp === 'function') window.renderApp();
        }
      }
    });
  } else {
    if (confirm(`¿Confirma vaciar permanentemente todos los registros de ${sectionName} en la papelera? Esta acción no se puede deshacer.`)) {
      if (typeof emptyFn === 'function') {
        emptyFn();
        safeShowToast(`Papelera de ${sectionName} vaciada con éxito`, 'success');
        if (typeof window.renderApp === 'function') window.renderApp();
      }
    }
  }
};

