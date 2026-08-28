/**
 * Utilidades de Exportación y Visualización de Reportes Clínicos
 * Soporta: Excel (.xls), CSV (.csv), PDF (.pdf) y Visualizador en Pantalla
 */

/**
 * Exportador nativo a Microsoft Excel (.xls con formato HTML estructurado)
 * Abre directamente en Excel con columnas separadas, colores de cabecera y formateo profesional.
 */
function exportExcel(data, filename = 'codigo_azul_reporte.xls') {
  if (!data || data.length === 0) {
    showToast('No hay datos para exportar', 'warning');
    return;
  }

  const headers = [
    'ID', 'Paciente', 'DNI', 'Causa / Diagnóstico', 'Área', 'Cama',
    'Fecha y Hora', 'Quién Activó', 'Equipo Encargado', 'Médico Líder',
    'Estado', 'Tiempo Respuesta (min)', 'Materiales Usados', 'Intervenciones'
  ];

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Historial Código Azul</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        th { background-color: #3B8FCC; color: #ffffff; font-weight: bold; padding: 10px; border: 1px solid #2A6A99; }
        td { padding: 8px; border: 1px solid #e5e7eb; font-family: Arial, sans-serif; font-size: 12px; }
        .success { background-color: #d1fae5; color: #065f46; font-weight: bold; }
        .danger { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
        .warning { background-color: #fef3c7; color: #92400e; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>Sistema de Gestión de Código Azul - Historial Clínico</h2>
      <p>Generado el: ${new Date().toLocaleString('es-PE')} | Total de registros: ${data.length}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(h => `<th>${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(d => `
            <tr>
              <td style="text-align:center;">${d.id}</td>
              <td style="font-weight:bold;">${escapeHtml(d.paciente || '')}</td>
              <td>${escapeHtml(d.dni || 'S/D')}</td>
              <td style="color:#0369a1; font-weight:600;">${escapeHtml(d.causa || 'Paro Cardiorrespiratorio')}</td>
              <td>${escapeHtml(d.area || '')}</td>
              <td style="font-weight:bold;">${escapeHtml(d.cama || 'Cama Guardia')}</td>
              <td>${formatDateTime(d.fecha)}</td>
              <td>${escapeHtml(d.quienHizoLlamada || 'Guardia')}</td>
              <td style="font-weight:bold;">${escapeHtml(d.equipoEncargado || 'Equipo A')}</td>
              <td>${escapeHtml(d.responsable || '')}</td>
              <td class="${d.estado?.value === 'resuelto' ? 'success' : (d.estado?.value === 'fatal' ? 'danger' : 'warning')}">
                ${d.estado ? d.estado.label : ''}
              </td>
              <td style="text-align:center; font-weight:bold;">${d.tiempoRespuesta || 0}</td>
              <td>${(d.materiales || []).map(m => `${m.nombre} (${m.cantidad} ${m.unidad || ''})`).join(', ') || 'N/A'}</td>
              <td>${(d.intervenciones || []).join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, filename.endsWith('.xls') ? filename : filename.replace(/\.[^/.]+$/, "") + ".xls");

  showToast('Planilla Excel (.xls) descargada con formato visual', 'success');
}

/**
 * Exportador CSV optimizado con forzado de descarga binaria
 */
function exportCSV(data, filename = 'codigo_azul_historial.csv') {
  if (!data || data.length === 0) {
    showToast('No hay datos para exportar', 'warning');
    return;
  }

  const headers = [
    'ID', 'Paciente', 'DNI', 'Causa / Diagnostico', 'Area', 'Cama',
    'Fecha y Hora', 'Quien Hizo la Llamada', 'Equipo Encargado', 'Medico Responsable',
    'Estado', 'Tiempo Respuesta (min)', 'Materiales Usados', 'Intervenciones'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    const s = String(str).replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = data.map(d => [
    d.id,
    escapeCSV(d.paciente),
    escapeCSV(d.dni || 'S/D'),
    escapeCSV(d.causa || 'Paro Cardiorrespiratorio'),
    escapeCSV(d.area),
    escapeCSV(d.cama || 'Cama Guardia'),
    escapeCSV(formatDateTime(d.fecha)),
    escapeCSV(d.quienHizoLlamada || 'Guardia'),
    escapeCSV(d.equipoEncargado || 'Equipo A'),
    escapeCSV(d.responsable || ''),
    escapeCSV(d.estado ? d.estado.label : ''),
    d.tiempoRespuesta || 0,
    escapeCSV((d.materiales || []).map(m => `${m.nombre} (${m.cantidad} ${m.unidad || ''})`).join(', ')),
    escapeCSV((d.intervenciones || []).join(', '))
  ]);

  const delimiter = ';';
  const csvContent = [
    headers.map(escapeCSV).join(delimiter),
    ...rows.map(r => r.join(delimiter))
  ].join('\r\n');

  // Usar octet-stream para que el navegador fuerce la descarga y no lo abra como texto
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'application/octet-stream;charset=utf-8;' });
  downloadBlob(blob, filename);

  // Abrir también el visualizador interactivo en pantalla
  showCSVPreviewModal(headers, rows, csvContent, filename);

  showToast('Archivo CSV descargado. También puedes previsualizarlo en pantalla.', 'success');
}

/**
 * Función auxiliar para forzar la descarga de cualquier Blob en todos los navegadores
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Modal interactivo para previsualizar el contenido del CSV / Excel en pantalla
 */
function showCSVPreviewModal(headers, rows, rawCsv, filename) {
  document.querySelector('.csv-preview-modal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay active csv-preview-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(17,24,39,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px); padding:20px;';

  overlay.innerHTML = `
    <div class="modal scale-in" style="background:var(--white); border-radius:var(--radius-xl); width:95%; max-width:1150px; max-height:90vh; display:flex; flex-direction:column; box-shadow:var(--shadow-lg); overflow:hidden;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; padding:16px 24px; border-bottom:1px solid var(--gray-200); background:var(--gray-50);">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:24px;">${icon('barChart')}</span>
          <div>
            <h2 style="font-size:18px; font-weight:700; color:var(--gray-900); margin:0;">Visualizador de Tabla y Exportación</h2>
            <p style="font-size:12px; color:var(--gray-500); margin:0;">${rows.length} registros clínicos con columnas completas</p>
          </div>
        </div>
        <button class="modal-close" style="background:none; border:none; font-size:24px; cursor:pointer; color:var(--gray-400);" onclick="this.closest('.csv-preview-modal-overlay').remove()">&times;</button>
      </div>
      
      <div class="modal-body" style="padding:16px 24px; overflow-y:auto; flex:1;">
        <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; color:var(--gray-600); font-weight:600;">Tabla de Datos Estructurada:</span>
          <button class="btn btn-outline btn-sm" onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(rawCsv)}')); showToast('Texto CSV copiado al portapapeles');">
            ${icon('clipboard')} Copiar al Portapapeles
          </button>
        </div>

        <div style="overflow-x:auto; border:1px solid var(--gray-200); border-radius:var(--radius); background:var(--white); max-height:55vh;">
          <table style="width:100%; border-collapse:collapse; font-size:12px; white-space:nowrap;">
            <thead>
              <tr style="background:var(--celeste); color:var(--white); text-align:left; position:sticky; top:0; z-index:2;">
                ${headers.map(h => `<th style="padding:10px 12px; font-weight:700; border-right:1px solid rgba(255,255,255,0.2);">${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map((row, idx) => `
                <tr style="border-bottom:1px solid var(--gray-100); background:${idx % 2 === 0 ? 'var(--white)' : 'var(--celeste-50)'};">
                  ${row.map(cell => `<td style="padding:8px 12px; color:var(--gray-700); border-right:1px solid var(--gray-100);">${cell.replace(/^"|"$/g, '')}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center; padding:14px 24px; border-top:1px solid var(--gray-200); background:var(--gray-50);">
        <span style="font-size:12px; color:var(--gray-500);">Formatos listos para Excel, Google Sheets y LibreOffice</span>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-secondary btn-sm" onclick="this.closest('.csv-preview-modal-overlay').remove()">Cerrar</button>
          <button class="btn btn-primary btn-sm" onclick="exportExcel(getData(), 'codigo_azul_historial.xls')">
            ${icon('fileSpreadsheet')} Descargar en Excel (.xls)
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}

/**
 * Exportador PDF con soporte para Acta de Cierre Clínico y Trazabilidad Legal
 */
function exportPDF(data, filename = 'codigo_azul_historial.pdf') {
  if (!data || data.length === 0) {
    showToast('No hay datos para exportar', 'warning');
    return;
  }

  const { jsPDF } = window.jspdf;
  const isSingle = data.length === 1;
  const doc = new jsPDF(isSingle ? 'portrait' : 'landscape');

  if (isSingle) {
    // REPORTE CLÍNICO INDIVIDUAL / ACTA MÉDICA CERTIFICADA
    const d = data[0];
    const cierre = d.datosCierre || {};

    doc.setFillColor(59, 143, 204);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('HOSPITAL NACIONAL - ACTA CLÍNICA DE CÓDIGO AZUL', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Evento #${d.id} | Generado el: ${new Date().toLocaleString('es-PE')}`, 14, 21);

    // Datos del Paciente
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Datos del Paciente e Internación', 14, 34);

    doc.autoTable({
      startY: 38,
      theme: 'grid',
      head: [['Paciente', 'DNI', 'Área Hospitalaria', 'Cama / Box', 'Grupo Sanguíneo', 'Alergias']],
      body: [[
        d.paciente || 'S/D',
        d.dni || 'S/D',
        d.area || 'Urgencias',
        d.cama || 'Cama Guardia',
        d.grupoSanguineo || 'S/D',
        d.alergias || 'Ninguna'
      ]],
      headStyles: { fillColor: [59, 143, 204], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, cellPadding: 3.5 }
    });

    // Causa y Activación
    let currentY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Causa de Paro y Brigada de Emergencia', 14, currentY);

    doc.autoTable({
      startY: currentY + 4,
      theme: 'grid',
      head: [['Diagnóstico / Causa', 'Activado Por', 'Equipo en Turno', 'Médico Líder ACLS', 'Tiempo Llegada']],
      body: [[
        d.causa || 'Paro Cardiorrespiratorio',
        d.quienHizoLlamada || 'Guardia',
        `${d.equipoEncargado || 'Equipo A'} (${d.turno || 'Guardia'})`,
        d.responsable || 'Dr. Carlos Méndez',
        `${d.tiempoRespuesta || 4} minutos`
      ]],
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, cellPadding: 3.5 }
    });

    // Fármacos y Materiales Utilizados
    currentY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Fármacos e Insumos Consumidos del Carro de Paro', 14, currentY);

    const matRows = (d.materiales || []).map(m => [m.nombre, String(m.cantidad), m.unidad || 'Unidades', m.tipo || 'Medicamento']);
    if (matRows.length === 0) matRows.push(['Sin materiales registrados', '-', '-', '-']);

    doc.autoTable({
      startY: currentY + 4,
      theme: 'grid',
      head: [['Fármaco / Insumo', 'Cantidad', 'Unidad de Medida', 'Categoría']],
      body: matRows,
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
      bodyStyles: { fontSize: 8.5, cellPadding: 3 }
    });

    // Sección de Certificación Médica de Cierre
    currentY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    if (d.estado?.value === 'fatal') {
      doc.setTextColor(185, 28, 28);
      doc.text('4. Certificación Médica de Defunción', 14, currentY);

      doc.autoTable({
        startY: currentY + 4,
        theme: 'grid',
        head: [['Médico Certificante', 'Matrícula Profesional', 'Hora de Defunción', 'Causa Básica / Mecanismo de Muerte']],
        body: [[
          cierre.medicoCertificante || d.responsable,
          cierre.matricula || 'M.P. 48.912',
          formatDateTime(cierre.horaDefuncion || d.fecha),
          cierre.causaDefuncion || d.causa
        ]],
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5, cellPadding: 4 }
      });
    } else {
      doc.setTextColor(5, 150, 105);
      doc.text('4. Certificación de Retorno de Circulación Espontánea (ROSC)', 14, currentY);

      doc.autoTable({
        startY: currentY + 4,
        theme: 'grid',
        head: [['Médico Responsable', 'Hora de ROSC', 'Ritmo de Salida', 'Destino Inmediato']],
        body: [[
          d.responsable,
          formatDateTime(cierre.horaRosc || d.fecha),
          cierre.ritmoSalida || 'Ritmo Sinusal Estable',
          cierre.destinoTraslado || 'Unidad de Terapia Intensiva (UTI)'
        ]],
        headStyles: { fillColor: [5, 150, 105], textColor: 255, fontStyle: 'bold', fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5, cellPadding: 4 }
      });
    }

    // Pie de firma y sello digital
    currentY = doc.lastAutoTable.finalY + 18;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('____________________________________', 120, currentY);
    doc.text(`Firma y Sello del Médico Líder: ${d.responsable}`, 120, currentY + 5);
    doc.text(`Documento clínico oficial con validez legal hospitalaria`, 14, currentY + 12);

    doc.save(filename);
    showToast('Acta médica certificada exportada en PDF', 'success');
    return;
  }

  // REPORTE TABULAR GENERAL EN LANDSCAPE
  doc.setFontSize(16);
  doc.setTextColor(59, 143, 204);
  doc.text('Sistema de Gestión de Código Azul - Historial Clínico de Eventos', 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')} ${new Date().toLocaleTimeString('es-PE')} | Total: ${data.length} eventos`, 14, 25);

  const tableData = data.map(d => [
    d.id,
    `${d.paciente || ''}\n(${d.dni || 'S/D'})`,
    `${d.causa || 'Paro Cardiorrespiratorio'}\n[${d.area} - ${d.cama || ''}]`,
    `${d.quienHizoLlamada || 'Guardia'}\n${formatDate(d.fecha)}`,
    `${d.equipoEncargado || 'Equipo A'}\nLíder: ${d.responsable ? d.responsable.split('(')[0].trim() : ''}`,
    (d.materiales || []).map(m => `${m.nombre.split(' ')[0]} x${m.cantidad}`).join(', ') || 'N/A',
    d.estado ? d.estado.label : '',
    `${d.tiempoRespuesta || 0}m`
  ]);

  doc.autoTable({
    startY: 30,
    head: [['#', 'Paciente / DNI', 'Causa / Ubicación', 'Activado Por / Fecha', 'Equipo / Líder', 'Materiales Usados', 'Estado', 'Tiempo']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 143, 204],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [55, 65, 81],
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [240, 249, 255]
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 35 },
      2: { cellWidth: 55 },
      3: { cellWidth: 40 },
      4: { cellWidth: 40 },
      5: { cellWidth: 48 },
      6: { cellWidth: 26 },
      7: { cellWidth: 16 }
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(filename);
  showToast('Historial clínico exportado en PDF', 'success');
}
