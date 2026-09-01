function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' ' + d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getRelativeTime(isoString) {
  const now = new Date();
  const d = new Date(isoString);
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Ahora mismo';
  if (mins < 60) return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;
  return formatDate(isoString);
}

function normalizeText(str) {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

window.normalizeText = normalizeText;

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function toggleExportDropdown() {
  const menu = document.getElementById('export-dropdown-menu');
  if (menu) {
    menu.style.display = (menu.style.display === 'none' || !menu.style.display) ? 'block' : 'none';
  }
}
window.toggleExportDropdown = toggleExportDropdown;

document.addEventListener('click', (e) => {
  const container = document.getElementById('export-dropdown-container');
  const menu = document.getElementById('export-dropdown-menu');
  if (container && menu && !container.contains(e.target)) {
    menu.style.display = 'none';
  }
});

function animateCounter(element, target, suffix = '', duration = 800) {
  const start = 0;
  const startTime = performance.now();
  const isFloat = String(target).includes('.');
  const numTarget = parseFloat(target);

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (numTarget - start) * eased;

    if (isFloat) {
      element.textContent = current.toFixed(1) + suffix;
    } else {
      element.textContent = Math.round(current) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function formatDNI(dniStr) {
  if (!dniStr) return 'S/D';
  const clean = String(dniStr).replace(/\D/g, '');
  if (clean.length === 8) {
    return clean.replace(/^(\d{2})(\d{3})(\d{3})$/, '$1.$2.$3');
  }
  if (clean.length === 7) {
    return clean.replace(/^(\d{1})(\d{3})(\d{3})$/, '$1.$2.$3');
  }
  return dniStr;
}

window.formatDNI = formatDNI;

/**
 * Generador de Gráfico de Torta / Donut SVG Profesional
 */
function renderPieChart(data, options = {}) {
  const size = options.size || 170;
  const isDonut = options.donut !== false;
  const radius = size / 2;
  const strokeWidth = isDonut ? (options.strokeWidth || 28) : radius;
  const r = radius - (strokeWidth / 2);
  const circumference = 2 * Math.PI * r;

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  if (total === 0) {
    return `<div style="text-align:center; padding:30px; color:var(--gray-400); font-size:13px;">Sin datos registrados</div>`;
  }

  let accumulatedPercent = 0;
  const svgCircles = data.filter(d => d.value > 0).map(item => {
    const percent = item.value / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += percent;

    return `
      <circle
        r="${r}"
        cx="${radius}"
        cy="${radius}"
        fill="transparent"
        stroke="${item.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${strokeDashoffset}"
        style="transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);"
      >
        <title>${escapeHtml(item.label)}: ${item.value} (${Math.round(percent * 100)}%)</title>
      </circle>
    `;
  }).join('');

  return `
    <div style="display:flex; align-items:center; justify-content:center; gap:24px; flex-wrap:wrap; padding:10px 0;">
      <div style="position:relative; width:${size}px; height:${size}px; transform: rotate(-90deg); flex-shrink:0;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          ${svgCircles}
        </svg>
        ${isDonut ? `
          <div style="position:absolute; top:0; left:0; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; transform: rotate(90deg);">
            <span style="font-size:24px; font-weight:800; color:var(--gray-900); line-height:1;">${total}</span>
            <span style="font-size:10px; text-transform:uppercase; color:var(--gray-400); font-weight:700; margin-top:2px;">${options.centerLabel || 'Total'}</span>
          </div>
        ` : ''}
      </div>
      <div style="display:flex; flex-direction:column; gap:8px; min-width:160px; flex:1;">
        ${data.filter(d => d.value > 0).map(item => {
          const pct = Math.round((item.value / total) * 100);
          return `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:12.5px;">
              <div style="display:flex; align-items:center; gap:8px; overflow:hidden; text-overflow:ellipsis;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item.color}; flex-shrink:0;"></span>
                <span style="color:var(--gray-700); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(item.label)}">${escapeHtml(item.label)}</span>
              </div>
              <span style="font-weight:700; color:var(--gray-900); white-space:nowrap;">${item.value} <span style="font-size:11px; color:var(--gray-400); font-weight:500;">(${pct}%)</span></span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Modal Genérico Reutilizable de Confirmación de Eliminación / Alertas
 */
function showConfirmModal({
  title,
  message,
  onConfirm,
  isAlertOnly = false,
  confirmText = 'Eliminar Definitivamente',
  confirmBtnStyle = 'background:#dc2626; color:#fff; font-weight:700;',
  iconName = null,
  headerBg = null,
  headerColor = null
}) {
  document.querySelector('.confirm-dialog-overlay')?.remove();

  const isDanger = confirmText.includes('Eliminar') || confirmText.includes('Quitar');
  const defaultHeaderBg = isAlertOnly ? '#fef3c7' : (isDanger ? '#fee2e2' : '#e0f2fe');
  const defaultHeaderColor = isAlertOnly ? '#92400e' : (isDanger ? '#991b1b' : '#0369a1');
  const defaultIcon = iconName || (isAlertOnly ? 'alertTriangle' : (isDanger ? 'trash' : 'checkCircle'));

  const bg = headerBg || defaultHeaderBg;
  const fg = headerColor || defaultHeaderColor;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active confirm-dialog-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:10000; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:460px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:${bg};">
        <h3 style="font-size:17px; font-weight:800; color:${fg}; margin:0; display:flex; align-items:center; gap:8px;">
          ${icon(defaultIcon)} ${escapeHtml(title)}
        </h3>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.confirm-dialog-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body" style="padding:20px 24px; font-size:13.5px; color:var(--gray-700); line-height:1.5;">
        ${message}
      </div>
      <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        ${isAlertOnly ? `
          <button class="btn btn-primary btn-sm" onclick="this.closest('.confirm-dialog-overlay').remove()">Aceptar</button>
        ` : `
          <button class="btn btn-secondary btn-sm" onclick="this.closest('.confirm-dialog-overlay').remove()">Cancelar</button>
          <button class="btn btn-sm" id="btn-confirm-action" style="${confirmBtnStyle}">${escapeHtml(confirmText)}</button>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  if (!isAlertOnly && typeof onConfirm === 'function') {
    document.getElementById('btn-confirm-action')?.addEventListener('click', () => {
      overlay.remove();
      onConfirm();
    });
  }
}

window.showConfirmModal = showConfirmModal;

/**
 * Modal de Confirmación Reforzada para Eliminación Permanente
 * Requiere que el usuario escriba "ELIMINAR" para confirmar
 */
function showPermanentDeleteModal({ title, itemName, onConfirm }) {
  document.querySelector('.perm-delete-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active perm-delete-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.75); z-index:10001; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:#fee2e2;">
        <h3 style="font-size:17px; font-weight:800; color:#991b1b; margin:0; display:flex; align-items:center; gap:8px;">
          ${icon('alertTriangle')} ${escapeHtml(title || 'Eliminar Permanentemente')}
        </h3>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.perm-delete-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body" style="padding:20px 24px;">
        <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:14px; margin-bottom:16px;">
          <p style="font-size:13px; color:#991b1b; font-weight:600; margin:0 0 6px 0;">
            ${icon('alertTriangle', 14)} Esta acción es IRREVERSIBLE
          </p>
          <p style="font-size:12.5px; color:#7f1d1d; margin:0; line-height:1.5;">
            Se eliminará permanentemente <strong>${escapeHtml(itemName || 'este registro')}</strong> del sistema. No se podrá recuperar de ninguna forma.
          </p>
        </div>
        <label style="font-size:13px; font-weight:600; color:var(--gray-700); display:block; margin-bottom:8px;">
          Escriba <strong style="color:#dc2626; letter-spacing:1px;">ELIMINAR</strong> para confirmar:
        </label>
        <input type="text" id="perm-delete-confirm-input" autocomplete="off" spellcheck="false"
          style="width:100%; padding:10px 14px; border:2px solid var(--gray-300); border-radius:8px; font-size:14px; font-weight:600; letter-spacing:1px; outline:none; transition:border-color 0.2s; box-sizing:border-box;"
          placeholder="Escriba ELIMINAR aquí..."
        />
      </div>
      <div class="modal-footer" style="display:flex; justify-content:flex-end; gap:10px; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <button class="btn btn-secondary btn-sm" onclick="this.closest('.perm-delete-overlay').remove()">Cancelar</button>
        <button class="btn btn-sm" id="btn-perm-delete-action" disabled
          style="background:#9ca3af; color:#fff; font-weight:700; border-radius:8px; padding:8px 16px; border:none; cursor:not-allowed; opacity:0.6; transition:all 0.2s;">
          ${icon('trash', 14)} Eliminar Permanentemente
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = document.getElementById('perm-delete-confirm-input');
  const btn = document.getElementById('btn-perm-delete-action');

  if (input && btn) {
    input.addEventListener('input', function() {
      const match = input.value.trim().toUpperCase() === 'ELIMINAR';
      btn.disabled = !match;
      btn.style.background = match ? '#dc2626' : '#9ca3af';
      btn.style.cursor = match ? 'pointer' : 'not-allowed';
      btn.style.opacity = match ? '1' : '0.6';
      input.style.borderColor = match ? '#16a34a' : (input.value.length > 0 ? '#dc2626' : 'var(--gray-300)');
    });

    btn.addEventListener('click', function() {
      if (input.value.trim().toUpperCase() === 'ELIMINAR') {
        overlay.remove();
        if (typeof onConfirm === 'function') onConfirm();
      }
    });

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && input.value.trim().toUpperCase() === 'ELIMINAR') {
        overlay.remove();
        if (typeof onConfirm === 'function') onConfirm();
      }
    });
  }
}

window.showPermanentDeleteModal = showPermanentDeleteModal;

// Modal de acceso rápido a integrantes de la brigada (Global)
function showEquipoIntegrantesModal(equipoNombre, turnoNombre = 'Guardia') {
  document.querySelector('.equipo-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active equipo-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  const equipos = typeof getEquipos === 'function' ? getEquipos() : [];
  const personal = typeof getPersonalSalud === 'function' ? getPersonalSalud() : [];
  const eq = equipos.find(e => (typeof e === 'string' ? e : e.nombre) === equipoNombre) || { nombre: equipoNombre, descripcion: 'Brigada de Reanimación Avanzada' };

  let rolesBrigada = [];
  if (eq && Array.isArray(eq.integrantes) && eq.integrantes.length > 0) {
    rolesBrigada = eq.integrantes.map(i => {
      const pers = personal.find(p => p.id === i.id_personal) || { apellido: 'Personal', nombre: `#${i.id_personal}`, dni: 'S/D', nombre_rol: 'Salud' };
      return { rolEnBrigada: i.rol_en_equipo || 'Miembro de Brigada', pers };
    });
  } else {
    // Si no tiene asignación explícita, mapear roles estándar
    rolesBrigada = [
      { rolEnBrigada: 'Médico Líder (Team Leader / Vía Aérea)', pers: personal[0] || { apellido: 'Méndez', nombre: 'Carlos', dni: '28.345.678', nombre_rol: 'Médico Cardiólogo' } },
      { rolEnBrigada: 'Compresiones Torácicas & Desfibrilador', pers: personal[1] || personal[0] || { apellido: 'Luna', nombre: 'Patricia', dni: '32.145.678', nombre_rol: 'Lic. en Enfermería' } },
      { rolEnBrigada: 'Acceso Vascular & Fármacos IV', pers: personal[2] || personal[0] || { apellido: 'Sosa', nombre: 'Mariano', dni: '35.456.789', nombre_rol: 'Enfermero de Terapia' } },
      { rolEnBrigada: 'Registro, Tiempos & Cronómetro', pers: personal[3] || personal[0] || { apellido: 'Ríos', nombre: 'Florencia', dni: '31.234.567', nombre_rol: 'Kinesióloga Respiratoria' } }
    ];
  }

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:95%; max-width:650px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:var(--celeste-light);">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px;">${icon('truck')}</span>
          <div>
            <h2 style="font-size:18px; font-weight:800; color:var(--celeste-dark); margin:0;">${escapeHtml(equipoNombre)}</h2>
            <p style="font-size:12px; color:var(--gray-600); margin:0;">Brigada de Código Azul &middot; Turno: ${escapeHtml(turnoNombre)}</p>
          </div>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.equipo-modal-overlay').remove()">&times;</button>
      </div>

      <div class="modal-body" style="padding:20px 24px;">
        <h4 style="font-size:13px; text-transform:uppercase; color:var(--gray-500); margin:0 0 14px 0;">Integrantes y Funciones ACLS:</h4>
        
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${rolesBrigada.map(r => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--gray-50); padding:12px 16px; border-radius:var(--radius); border:1px solid var(--gray-200);">
              <div>
                <strong style="font-size:14px; color:var(--gray-900); display:block;">${escapeHtml(r.pers.apellido)}, ${escapeHtml(r.pers.nombre)}</strong>
                <span style="font-size:12px; color:var(--gray-500);">DNI: ${escapeHtml(r.pers.dni || '30.123.456')} &middot; ${escapeHtml(r.pers.nombre_rol || 'Personal de Salud')}</span>
              </div>
              <span class="badge" style="background:#dbeafe; color:#1e40af; font-size:11px; font-weight:700;">
                ${escapeHtml(r.rolEnBrigada)}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="modal-footer" style="display:flex; justify-content:flex-end; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <button class="btn btn-primary btn-sm" onclick="this.closest('.equipo-modal-overlay').remove()">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

// Modal de acceso directo a la ficha del personal (Global)
function showPersonalModalDirect(nombreCompleto) {
  document.querySelector('.personal-direct-overlay')?.remove();

  const personal = typeof getPersonalSalud === 'function' ? getPersonalSalud() : [];
  const pers = personal.find(p => `${p.apellido}, ${p.nombre}`.includes(nombreCompleto.split(' ')[0]) || nombreCompleto.includes(p.apellido)) || personal[0];

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active personal-direct-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:90%; max-width:480px; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:18px 24px; border-bottom:1px solid var(--gray-200); background:#fef3c7;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:22px;">${icon('user')}</span>
          <h2 style="font-size:17px; font-weight:800; color:#92400e; margin:0;">Ficha del Personal Hospitalario</h2>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.personal-direct-overlay').remove()">&times;</button>
      </div>
      <div class="modal-body" style="padding:20px 24px;">
        <div style="font-size:16px; font-weight:800; color:var(--gray-900); margin-bottom:4px;">
          ${escapeHtml(pers.apellido)}, ${escapeHtml(pers.nombre)}
        </div>
        <div style="font-size:13px; color:var(--celeste-dark); font-weight:700; margin-bottom:16px;">
          ${escapeHtml(pers.nombre_rol || 'Personal de Salud')}
        </div>
        <div class="detail-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:13px;">
          <div><span style="color:var(--gray-500);">DNI:</span> <strong>${escapeHtml(pers.dni || '30.123.456')}</strong></div>
          <div><span style="color:var(--gray-500);">Teléfono / Int:</span> <strong>${escapeHtml(pers.telefono || 'Interno 302')}</strong></div>
          <div><span style="color:var(--gray-500);">Área Asignada:</span> <strong>${escapeHtml(pers.area || 'Guardia Central')}</strong></div>
          <div><span style="color:var(--gray-500);">Estado:</span> <span class="badge badge-success">Activo en Guardia</span></div>
        </div>
      </div>
      <div class="modal-footer" style="display:flex; justify-content:flex-end; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <button class="btn btn-secondary btn-sm" onclick="this.closest('.personal-direct-overlay').remove()">Cerrar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

window.showEquipoIntegrantesModal = showEquipoIntegrantesModal;
window.showPersonalModalDirect = showPersonalModalDirect;

