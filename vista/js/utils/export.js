function exportCSV(data, filename = 'codigo_azul_historial.csv') {
  const headers = ['ID', 'Paciente', 'Fecha', 'Area', 'Estado', 'Responsable', 'Tiempo Respuesta (min)', 'Intervenciones'];

  const rows = data.map(d => [
    d.id,
    `"${d.paciente}"`,
    `"${formatDateTime(d.fecha)}"`,
    `"${d.area}"`,
    `"${d.estado.label}"`,
    `"${d.responsable}"`,
    d.tiempoRespuesta,
    `"${d.intervenciones.join(', ')}"`
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);

  showToast('Archivo CSV exportado correctamente', 'success');
}

function exportPDF(data, filename = 'codigo_azul_historial.pdf') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape');

  doc.setFontSize(18);
  doc.setTextColor(59, 143, 204);
  doc.text('Historial de Codigos Azules', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-PE')} | Total: ${data.length} registros`, 14, 28);

  const tableData = data.map(d => [
    d.id,
    d.paciente,
    formatDate(d.fecha),
    d.area,
    d.estado.label,
    d.responsable,
    `${d.tiempoRespuesta} min`,
    d.intervenciones.join(', ')
  ]);

  doc.autoTable({
    startY: 34,
    head: [['#', 'Paciente', 'Fecha', 'Area', 'Estado', 'Responsable', 'Respuesta', 'Intervenciones']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [59, 143, 204],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [55, 65, 81]
    },
    alternateRowStyles: {
      fillColor: [240, 249, 255]
    },
    columnStyles: {
      0: { cellWidth: 12 },
      2: { cellWidth: 28 },
      4: { cellWidth: 22 },
      7: { cellWidth: 'auto' }
    },
    margin: { left: 14 }
  });

  doc.save(filename);
  showToast('Archivo PDF exportado correctamente', 'success');
}
