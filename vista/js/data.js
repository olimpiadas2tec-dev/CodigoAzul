let AREAS = [
  'Urgencias / Shock Room',
  'Unidad de Terapia Intensiva (UTI)',
  'Cardiologia',
  'Piso 3A',
  'Piso 3B',
  'Piso 4A',
  'Piso 4B',
  'Piso 5 - Cirugia',
  'Centro Quirurgico',
  'Maternidad'
];

const ESTADOS = [
  { value: 'resuelto', label: 'Resuelto', badge: 'badge-success' },
  { value: 'pendiente', label: 'En curso', badge: 'badge-warning' },
  { value: 'fatal', label: 'Fatal', badge: 'badge-danger' }
];

const INTERVENCIONES_LISTA = [
  'RCP',
  'Desfibrilacion',
  'Intubacion',
  'Adrenalina',
  'Amiodarona',
  'Fluidos IV',
  'Oxigenacion',
  'Marcapeas',
  'Compresiones toracicas'
];

let RESPONSABLES = [
  'Dr. Carlos Mendez',
  'Dra. Laura Gutierrez',
  'Dr. Roberto Sanchez',
  'Dra. Maria Torres',
  'Dr. Fernando Lopez',
  'Dra. Ana Ramirez',
  'Enf. Patricia Luna',
  'Enf. Maria Elena Lopez'
];

function generateMockData() {
  const now = new Date();
  const data = [];

  const pacientes = [
    'Perez, Juan (68a)', 'Garcia, Maria (72a)', 'Rodriguez, Pedro (55a)',
    'Martinez, Ana (80a)', 'Hernandez, Luis (63a)', 'Flores, Carmen (75a)',
    'Sanchez, Roberto (49a)', 'Torres, Isabel (83a)', 'Lopez, Fernando (58a)',
    'Gomez, Carlos (52a)'
  ];

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(i * 0.6);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - (i * 2));

    const estado = i === 0 ? ESTADOS[1] : (i === 7 ? ESTADOS[2] : ESTADOS[0]);
    const intervenciones = ['RCP', 'Desfibrilacion', 'Adrenalina'];
    const tiempoRespuesta = (3.5 + (i % 3) * 0.8).toFixed(1);

    const timeline = [
      {
        hora: date.toISOString(),
        titulo: 'Codigo Azul Activado',
        descripcion: `Activado en ${AREAS[i % AREAS.length]}`,
        tipo: 'start'
      },
      {
        hora: new Date(date.getTime() + 2 * 60000).toISOString(),
        titulo: 'RCP de Alta Calidad & Desfibrilador',
        descripcion: `Aplicada por ${RESPONSABLES[i % RESPONSABLES.length]}`,
        tipo: 'action'
      }
    ];

    if (estado.value === 'resuelto' || estado.value === 'fatal') {
      timeline.push({
        hora: new Date(date.getTime() + 5 * 60000).toISOString(),
        titulo: estado.value === 'resuelto' ? 'Retorno de Circulacion Espontanea (ROSC)' : 'Fallecido / Sin respuesta',
        descripcion: estado.value === 'resuelto' ? 'Paciente estabilizado y derivado a UTI' : 'Constatado por medico de guardia',
        tipo: 'end'
      });
    }

    data.push({
      id: i + 1,
      paciente: pacientes[i % pacientes.length],
      fecha: date.toISOString(),
      area: AREAS[i % AREAS.length],
      estado: estado,
      responsable: RESPONSABLES[i % RESPONSABLES.length],
      intervenciones: intervenciones,
      tiempoRespuesta: parseFloat(tiempoRespuesta),
      timeline: timeline,
      notas: 'Protocolo de RCP avanzado ejecutado con monitoreo continuo.'
    });
  }

  data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return data;
}

let mockData = generateMockData();

function getData() {
  const stored = localStorage.getItem('codigoAzulData');
  if (stored) {
    mockData = JSON.parse(stored);
  } else {
    localStorage.setItem('codigoAzulData', JSON.stringify(mockData));
  }
  return mockData;
}

function saveData(data) {
  mockData = data;
  localStorage.setItem('codigoAzulData', JSON.stringify(data));
}

// Sincronización asíncrona con base de datos MySQL
async function syncWithDatabase() {
  try {
    const res = await fetch('/api/llamados');
    if (res.ok) {
      const dbLlamados = await res.json();
      if (Array.isArray(dbLlamados) && dbLlamados.length > 0) {
        saveData(dbLlamados);
      }
    }

    // Cargar áreas de MySQL
    const resAreas = await fetch('/api/areas');
    if (resAreas.ok) {
      const dbAreas = await resAreas.json();
      if (Array.isArray(dbAreas) && dbAreas.length > 0) {
        AREAS = dbAreas.map(a => a.nombre);
      }
    }

    // Cargar personal médico de MySQL
    const resPersonal = await fetch('/api/personal');
    if (resPersonal.ok) {
      const dbPersonal = await resPersonal.json();
      if (Array.isArray(dbPersonal) && dbPersonal.length > 0) {
        RESPONSABLES = dbPersonal.map(p => p.display_name || (p.nombre + ' ' + p.apellido));
      }
    }
  } catch (e) {
    console.log('Modo offline / fallback local activo');
  }
}

// Iniciar sincronización de fondo
syncWithDatabase();

async function addCodigo(codigo) {
  const data = getData();
  codigo.id = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
  data.unshift(codigo);
  saveData(data);

  // Enviar a la base de datos MySQL
  try {
    await fetch('/api/llamados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(codigo)
    });
  } catch (err) {
    console.warn('Guardado local (API en cola)');
  }

  return codigo;
}

async function updateCodigo(id, updates) {
  const data = getData();
  const idx = data.findIndex(d => d.id === id);
  if (idx !== -1) {
    data[idx] = { ...data[idx], ...updates };
    saveData(data);

    try {
      await fetch(`/api/llamados/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
    } catch (err) {
      console.warn('Actualización guardada localmente');
    }

    return data[idx];
  }
  return null;
}

function deleteCodigo(id) {
  const data = getData().filter(d => d.id !== id);
  saveData(data);
}

function getCodigoById(id) {
  return getData().find(d => d.id === parseInt(id));
}

function getKPIs() {
  const data = getData();
  const now = new Date();
  const thisMonth = data.filter(d => {
    const f = new Date(d.fecha);
    return f.getMonth() === now.getMonth() && f.getFullYear() === now.getFullYear();
  });

  const totalMes = thisMonth.length;
  const resueltos = thisMonth.filter(d => d.estado && d.estado.value === 'resuelto').length;
  const tasaExito = totalMes > 0 ? Math.round((resueltos / totalMes) * 100) : 100;
  const tiempoPromedio = totalMes > 0
    ? (thisMonth.reduce((sum, d) => sum + (parseFloat(d.tiempoRespuesta) || 0), 0) / totalMes).toFixed(1)
    : '3.5';

  return { totalMes, tasaExito, tiempoPromedio };
}

function getMonthlyStats() {
  const data = getData();
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthData = data.filter(item => {
      const f = new Date(item.fecha);
      return f.getMonth() === month && f.getFullYear() === year;
    });

    months.push({
      label: d.toLocaleDateString('es', { month: 'short' }).toUpperCase(),
      total: monthData.length,
      exitosos: monthData.filter(item => item.estado && item.estado.value === 'resuelto').length
    });
  }

  return months;
}
