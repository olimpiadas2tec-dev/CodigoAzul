// ==========================================
// CATÁLOGOS Y ESTADOS MAESTROS
// ==========================================

let AREAS_DATA = [
  { id: 1, nombre: 'Urgencias / Shock Room', cantidad_camas: 8, descripcion: 'Área de atención crítica inmediata y reanimación' },
  { id: 2, nombre: 'Unidad de Terapia Intensiva (UTI)', cantidad_camas: 6, descripcion: 'Cuidados intensivos y soporte vital avanzado' },
  { id: 3, nombre: 'Cardiología', cantidad_camas: 8, descripcion: 'Internación cardiológica y unidad coronaria' },
  { id: 4, nombre: 'Piso 3A', cantidad_camas: 10, descripcion: 'Internación clínica general sector A' },
  { id: 5, nombre: 'Piso 3B', cantidad_camas: 10, descripcion: 'Internación clínica general sector B' },
  { id: 6, nombre: 'Piso 4A', cantidad_camas: 10, descripcion: 'Cuidados intermedios sector A' },
  { id: 7, nombre: 'Piso 4B', cantidad_camas: 10, descripcion: 'Cuidados intermedios sector B' },
  { id: 8, nombre: 'Piso 5 - Cirugía', cantidad_camas: 8, descripcion: 'Recuperación postquirúrgica' },
  { id: 9, nombre: 'Centro Quirúrgico', cantidad_camas: 4, descripcion: 'Quirófanos centrales y recuperación' },
  { id: 10, nombre: 'Maternidad', cantidad_camas: 6, descripcion: 'Obstetricia y neonatología' }
];

// Genera un prefijo corto para cada área basado en su nombre
function getAreaPrefix(nombre) {
  if (nombre.includes('Shock') || nombre.includes('Urgencias')) return 'URG';
  if (nombre.includes('UTI') || nombre.includes('Terapia Intensiva')) return 'UTI';
  if (nombre.includes('Cardio')) return 'CARD';
  if (nombre.includes('3A')) return '3A';
  if (nombre.includes('3B')) return '3B';
  if (nombre.includes('4A')) return '4A';
  if (nombre.includes('4B')) return '4B';
  if (nombre.includes('Cirugía') || nombre.includes('Cirugia')) return 'CIR';
  if (nombre.includes('Quirúrgico') || nombre.includes('Quirofano')) return 'QX';
  if (nombre.includes('Maternidad') || nombre.includes('Obstetricia')) return 'MAT';
  // Fallback: tomar las primeras 3 letras en mayúsculas
  return nombre.replace(/[^A-Za-záéíóúÁÉÍÓÚñÑ]/g, '').substring(0, 3).toUpperCase();
}

// Genera el nombre de cama con formato: PREFIJO-01, PREFIJO-02, etc.
function generarNumeroCama(areaNombre, indexEnArea) {
  const prefix = getAreaPrefix(areaNombre);
  const num = String(indexEnArea).padStart(2, '0');
  return `${prefix}-${num}`;
}

function generateInitialCamas() {
  const camas = [];
  let camaId = 1;
  AREAS_DATA.forEach(area => {
    for (let i = 1; i <= area.cantidad_camas; i++) {
      const numCama = generarNumeroCama(area.nombre, i);
      const pacObj = (typeof PACIENTES !== 'undefined' && Array.isArray(PACIENTES)) ? PACIENTES.find(p => p.activo && p.area === area.nombre && p.cama === numCama) : null;
      camas.push({
        id: camaId++,
        id_area: area.id,
        area_nombre: area.nombre,
        numero: numCama,
        estado: pacObj ? 'Ocupada' : 'Libre',
        id_paciente: pacObj ? pacObj.id : null,
        paciente_nombre: pacObj ? `${pacObj.apellido}, ${pacObj.nombre}` : null
      });
    }
  });
  return camas;
}

let AREAS = AREAS_DATA.map(a => a.nombre);

const ESTADOS = [
  { value: 'resuelto', label: 'Exitoso (ROSC)', badge: 'badge-success' },
  { value: 'fatal', label: 'Fatal (Fallecido)', badge: 'badge-danger' }
];

const CAUSAS_PREDEFINIDAS = [
  'Paro Cardiorrespiratorio (PCR) Presenciado',
  'Fibrilación Ventricular (FV) / Taquicardia Ventricular sin Pulso (TVSP)',
  'Asistolia / Actividad Eléctrica sin Pulso (AESP)',
  'Infarto Agudo de Miocardio (IAM) Complicado',
  'Shock Cardiogénico Descompensado',
  'Edema Agudo de Pulmón Severo / Falla Respiratoria',
  'Politraumatismo con Shock Hipovolémico',
  'Bloqueo AV Completo con Síncope',
  'Estenosis Aórtica Severa Descompensada',
  'Otro'
];

const ROLES_EN_EQUIPO = [
  'Líder de Reanimación (Team Leader)',
  'Vía Aérea y Ventilación',
  'Compresiones Torácicas / RCP',
  'Acceso Vascular / Farmacoterapia',
  'Monitoreo y Desfibrilación',
  'Registro y Cronómetro (Circulante)'
];

const INTERVENCIONES_LISTA = [
  'RCP de Alta Calidad',
  'Desfibrilación Precoz',
  'Intubación Endotraqueal',
  'Administración de Adrenalina',
  'Administración de Amiodarona',
  'Acceso Vascular / Vía Intraósea',
  'Manejo Avanzado de Vía Aérea',
  'Compresiones Torácicas Continuas',
  'Monitoreo Multiparamétrico',
  'Cardioversión Eléctrica'
];

let ROLES_SALUD = [
  { id: 1, nombre_rol: 'Médico Especialista en Terapia Intensiva' },
  { id: 2, nombre_rol: 'Médico Cardiólogo' },
  { id: 3, nombre_rol: 'Médico Emergentólogo' },
  { id: 4, nombre_rol: 'Lic. en Enfermería - Cuidados Críticos' },
  { id: 5, nombre_rol: 'Enfermero/a de Guardia' },
  { id: 6, nombre_rol: 'Kinesiólogo/a Respiratorio' }
];

let PERSONAL_SALUD = [
  { id: 1, apellido: 'Méndez', nombre: 'Carlos', dni: '28345678', telefono: '11-4567-8901', id_rol_profesional: 1, nombre_rol: 'Médico Especialista en Terapia Intensiva', area: 'Unidad de Terapia Intensiva (UTI)' },
  { id: 2, apellido: 'Gutiérrez', nombre: 'Laura', dni: '31234567', telefono: '11-5678-1234', id_rol_profesional: 2, nombre_rol: 'Médico Cardiólogo', area: 'Cardiología' },
  { id: 3, apellido: 'Sánchez', nombre: 'Roberto', dni: '26789012', telefono: '11-6789-2345', id_rol_profesional: 3, nombre_rol: 'Médico Emergentólogo', area: 'Urgencias / Shock Room' },
  { id: 4, apellido: 'Torres', nombre: 'María', dni: '33456789', telefono: '11-7890-3456', id_rol_profesional: 1, nombre_rol: 'Médico Especialista en Terapia Intensiva', area: 'Unidad de Terapia Intensiva (UTI)' },
  { id: 5, apellido: 'López', nombre: 'Fernando', dni: '29876543', telefono: '11-8901-4567', id_rol_profesional: 2, nombre_rol: 'Médico Cardiólogo', area: 'Cardiología' },
  { id: 6, apellido: 'Ramírez', nombre: 'Ana', dni: '35678901', telefono: '11-9012-5678', id_rol_profesional: 4, nombre_rol: 'Lic. en Enfermería - Cuidados Críticos', area: 'Piso 4A' },
  { id: 7, apellido: 'Luna', nombre: 'Patricia', dni: '30123456', telefono: '11-2345-6789', id_rol_profesional: 4, nombre_rol: 'Lic. en Enfermería - Cuidados Críticos', area: 'Urgencias / Shock Room' },
  { id: 8, apellido: 'López', nombre: 'María Elena', dni: '32145678', telefono: '11-4589-1234', id_rol_profesional: 4, nombre_rol: 'Lic. en Enfermería - Cuidados Críticos', area: 'Cardiología' },
  { id: 9, apellido: 'Gómez', nombre: 'Juan Roberto', dni: '29876544', telefono: '11-5678-9012', id_rol_profesional: 5, nombre_rol: 'Enfermero/a de Guardia', area: 'Urgencias / Shock Room' },
  { id: 10, apellido: 'Fernández', nombre: 'Ana Clara', dni: '35123987', telefono: '11-3456-7890', id_rol_profesional: 5, nombre_rol: 'Enfermero/a de Guardia', area: 'Centro Quirúrgico' }
];

let PACIENTES = [
  { id: 11, apellido: 'Pérez', nombre: 'Juan', dni: '14253647', edad: 68, fecha_nacimiento: '1956-05-14', causa: 'Infarto Agudo de Miocardio (IAM)', area: 'Cardiología', cama: 'CARD-04', grupo: 'A+', alergias: 'Penicilina', id_personal: 1, activo: true },
  { id: 12, apellido: 'García', nombre: 'María', dni: '12456789', edad: 72, fecha_nacimiento: '1952-10-25', causa: 'Insuficiencia Cardíaca Descompensada', area: 'Piso 4A', cama: '4A-02', grupo: 'O+', alergias: 'Ninguna', id_personal: 2, activo: true },
  { id: 13, apellido: 'Rodríguez', nombre: 'Pedro', dni: '18976453', edad: 55, fecha_nacimiento: '1969-03-08', causa: 'Shock Cardiogénico / Fibrilación Ventricular', area: 'Urgencias / Shock Room', cama: 'URG-03', grupo: 'B+', alergias: 'Sulfas', id_personal: 3, activo: true },
  { id: 14, apellido: 'Martínez', nombre: 'Ana', dni: '10987654', edad: 80, fecha_nacimiento: '1944-07-19', causa: 'Edema Agudo de Pulmón Severo', area: 'Piso 3A', cama: '3A-05', grupo: 'A-', alergias: 'Iodo', id_personal: 1, activo: true },
  { id: 15, apellido: 'Hernández', nombre: 'Luis', dni: '16789012', edad: 63, fecha_nacimiento: '1961-09-12', causa: 'Politraumatismo / Shock Hipovolémico', area: 'Urgencias / Shock Room', cama: 'URG-06', grupo: 'O-', alergias: 'Ninguna', id_personal: 3, activo: true },
  { id: 16, apellido: 'Flores', nombre: 'Carmen', dni: '13456789', edad: 75, fecha_nacimiento: '1949-01-30', causa: 'Postoperatorio Cirugía Cardiovascular / Asistolia', area: 'Unidad de Terapia Intensiva (UTI)', cama: 'UTI-02', grupo: 'AB+', alergias: 'AINEs', id_personal: 4, activo: true },
  { id: 17, apellido: 'Sánchez', nombre: 'Roberto C.', dni: '21345678', edad: 49, fecha_nacimiento: '1975-04-18', causa: 'Bloqueo AV Completo con Síncope', area: 'Piso 5 - Cirugía', cama: 'CIR-04', grupo: 'B-', alergias: 'Ninguna', id_personal: 5, activo: true },
  { id: 18, apellido: 'Torres', nombre: 'Isabel', dni: '09876543', edad: 83, fecha_nacimiento: '1941-12-05', causa: 'Estenosis Aórtica Severa / Paro Cardiorrespiratorio', area: 'Piso 4A', cama: '4A-08', grupo: 'O+', alergias: 'Látex', id_personal: 2, activo: true },
  { id: 19, apellido: 'López', nombre: 'Fernando M.', dni: '17890123', edad: 58, fecha_nacimiento: '1966-08-22', causa: 'Cardiopatía Isquémica Crónica Agudizada', area: 'Piso 3B', cama: '3B-04', grupo: 'A+', alergias: 'Ninguna', id_personal: 5, activo: true },
  { id: 20, apellido: 'Gómez', nombre: 'Carlos', dni: '20123456', edad: 52, fecha_nacimiento: '1973-11-15', causa: 'Paro Presenciado en Guardia / Taquicardia Ventricular', area: 'Unidad de Terapia Intensiva (UTI)', cama: 'UTI-05', grupo: 'O+', alergias: 'Dipirona', id_personal: 1, activo: true }
];

let CAMAS_DATA = generateInitialCamas();

let TURNOS = [
  { id: 1, nombre: 'Turno Mañana', hora_inicio: '06:00', hora_fin: '14:00' },
  { id: 2, nombre: 'Turno Tarde', hora_inicio: '14:00', hora_fin: '22:00' },
  { id: 3, nombre: 'Turno Noche / Guardia', hora_inicio: '22:00', hora_fin: '06:00' }
];

let EQUIPOS = [
  { 
    id: 1, 
    nombre: 'Equipo A', 
    integrantes: [
      { id_personal: 1, rol_en_equipo: 'Líder de Reanimación (Team Leader)' },
      { id_personal: 3, rol_en_equipo: 'Compresiones Torácicas / RCP' },
      { id_personal: 7, rol_en_equipo: 'Acceso Vascular / Farmacoterapia' },
      { id_personal: 9, rol_en_equipo: 'Registro y Cronómetro (Circulante)' }
    ]
  },
  { 
    id: 2, 
    nombre: 'Equipo B', 
    integrantes: [
      { id_personal: 2, rol_en_equipo: 'Líder de Reanimación (Team Leader)' },
      { id_personal: 4, rol_en_equipo: 'Vía Aérea y Ventilación' },
      { id_personal: 8, rol_en_equipo: 'Acceso Vascular / Farmacoterapia' },
      { id_personal: 10, rol_en_equipo: 'Registro y Cronómetro (Circulante)' }
    ]
  },
  { 
    id: 3, 
    nombre: 'Equipo C', 
    integrantes: [
      { id_personal: 5, rol_en_equipo: 'Líder de Reanimación (Team Leader)' },
      { id_personal: 6, rol_en_equipo: 'Vía Aérea y Ventilación' },
      { id_personal: 7, rol_en_equipo: 'Compresiones Torácicas / RCP' },
      { id_personal: 8, rol_en_equipo: 'Acceso Vascular / Farmacoterapia' }
    ]
  }
];

let ASIGNACIONES_TURNOS = [
  { id: 1, id_equipo: 1, equipo_nombre: 'Equipo A', id_turno: 1, turno_nombre: 'Turno Mañana', fecha_desde: '2026-08-01', fecha_hasta: '2026-08-31' },
  { id: 2, id_equipo: 2, equipo_nombre: 'Equipo B', id_turno: 2, turno_nombre: 'Turno Tarde', fecha_desde: '2026-08-01', fecha_hasta: '2026-08-31' },
  { id: 3, id_equipo: 3, equipo_nombre: 'Equipo C', id_turno: 3, turno_nombre: 'Turno Noche / Guardia', fecha_desde: '2026-08-01', fecha_hasta: '2026-08-31' }
];

let MATERIALES_CATALOGO = [
  { id: 1, nombre: 'Adrenalina 1mg/ml Ampolla', tipo: 'Medicamento', unidad: 'Ampollas', stock: 45, descripcion: 'Vasopresor de primera línea para soporte vital avanzado (ACLS).' },
  { id: 2, nombre: 'Amiodarona 150mg Ampolla', tipo: 'Medicamento', unidad: 'Ampollas', stock: 30, descripcion: 'Antiarrítmico clase III para FV y TV sin pulso refractaria.' },
  { id: 3, nombre: 'Atropina 1mg Ampolla', tipo: 'Medicamento', unidad: 'Ampollas', stock: 25, descripcion: 'Anticolinérgico para tratamiento de bradicardia sintomática.' },
  { id: 4, nombre: 'Bicarbonato de Sodio 1M', tipo: 'Medicamento', unidad: 'Frascos', stock: 15, descripcion: 'Agente alcalinizante para acidosis metabólica e hiperpotasemia.' },
  { id: 5, nombre: 'Lidocaína 2% Ampolla', tipo: 'Medicamento', unidad: 'Ampollas', stock: 20, descripcion: 'Antiarrítmico alternativo para taquiarritmias ventriculares.' },
  { id: 6, nombre: 'Tubo Endotraqueal N° 7.5', tipo: 'Insumo', unidad: 'Unidades', stock: 18, descripcion: 'Dispositivo para intubación y aislamiento definitivo de vía aérea.' },
  { id: 7, nombre: 'Tubo Endotraqueal N° 8.0', tipo: 'Insumo', unidad: 'Unidades', stock: 15, descripcion: 'Tubo orotraqueal para adultos de contextura grande.' },
  { id: 8, nombre: 'Parches Desfibrilador Bifásico', tipo: 'Insumo', unidad: 'Pares', stock: 12, descripcion: 'Electrodos adhesivos para cardioversión y desfibrilación externa.' },
  { id: 9, nombre: 'Bolsa de Reanimación (Ambu)', tipo: 'Insumo', unidad: 'Unidades', stock: 10, descripcion: 'Resucitador manual con reservorio de oxígeno y válvula PEEP.' },
  { id: 10, nombre: 'Solución Fisiológica 0.9% 500ml', tipo: 'Insumo', unidad: 'Sachets', stock: 60, descripcion: 'Cristaloide isotónico para expansión de volumen y dilución de fármacos.' }
];

let ORIGENES = [
  'Monitor Multiparamétrico UTI Central',
  'Botón Cabecera Cama 101-120',
  'Electrocardiógrafo Piso 3 Cardio',
  'Consola de Alarma Piso 4A',
  'Pulsador Quirófano Central',
  'App Móvil Guardia Médica'
];

// Helper para obtener texto de responsables
function getResponsablesList() {
  return PERSONAL_SALUD.map(p => `${p.apellido}, ${p.nombre} (${p.nombre_rol || 'Personal'})`);
}

let RESPONSABLES = getResponsablesList();

function getEquiposList() {
  const list = getEquipos();
  return list.map(e => typeof e === 'string' ? e : (e.nombre || 'Equipo'));
}

// Generador de datos iniciales de llamados
function generateMockData() {
  const now = new Date();
  const data = [];

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(i * 0.6);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(date.getHours() - (i * 2));

    const p = PACIENTES[i % PACIENTES.length];
    const estado = (i === 2 || i === 7) ? ESTADOS[1] : ESTADOS[0];
    const tiempoRespuesta = (2.8 + (i % 3) * 0.8).toFixed(1);
    const persResp = PERSONAL_SALUD[i % PERSONAL_SALUD.length];
    const responsable = `${persResp.apellido}, ${persResp.nombre} (${persResp.nombre_rol})`;
    const persAct = PERSONAL_SALUD[(i + 2) % PERSONAL_SALUD.length];
    const activadorObj = {
      id: persAct.id,
      nombre_completo: `${persAct.apellido}, ${persAct.nombre}`,
      dni: persAct.dni || '30.123.456',
      telefono: persAct.telefono || '11-4567-8901 (Int. 302)',
      nombre_rol: persAct.nombre_rol || 'Lic. en Enfermería',
      area: persAct.area || p.area
    };
    const activador = `${persAct.apellido}, ${persAct.nombre} (${persAct.nombre_rol})`;
    const equipo = EQUIPOS[i % EQUIPOS.length].nombre || `Equipo ${String.fromCharCode(65 + (i % 3))}`;
    const turno = TURNOS[i % TURNOS.length].nombre;
    const origen = ORIGENES[i % ORIGENES.length];

    const materialesUsados = [
      { id_material: 1, nombre: 'Adrenalina 1mg/ml Ampolla', cantidad: (i % 3) + 1, unidad: 'Ampollas' },
      { id_material: 8, nombre: 'Parches Desfibrilador Bifásico', cantidad: 1, unidad: 'Pares' }
    ];
    if (i % 2 === 0) {
      materialesUsados.push({ id_material: 2, nombre: 'Amiodarona 150mg Ampolla', cantidad: 1, unidad: 'Ampollas' });
      materialesUsados.push({ id_material: 10, nombre: 'Solución Fisiológica 0.9% 500ml', cantidad: 2, unidad: 'Sachets' });
    }

    const timeline = [
      {
        hora: date.toISOString(),
        titulo: 'Código Azul Activado',
        descripcion: `Activado por ${activador} desde ${origen}`,
        tipo: 'start'
      },
      {
        hora: new Date(date.getTime() + 1.5 * 60000).toISOString(),
        titulo: 'Despliegue y Arribo de Equipo',
        descripcion: `${equipo} en el lugar durante ${turno}. Líder ACLS: ${responsable}`,
        tipo: 'action'
      },
      {
        hora: new Date(date.getTime() + 3 * 60000).toISOString(),
        titulo: 'RCP Avanzada & Fármacos Administrados',
        descripcion: `Compresiones continuas y administración de drogas del carro de paro`,
        tipo: 'action'
      }
    ];

    let datosCierre = {};
    if (estado.value === 'resuelto') {
      timeline.push({
        hora: new Date(date.getTime() + parseFloat(tiempoRespuesta) * 60000 + 3 * 60000).toISOString(),
        titulo: 'Retorno de Circulación Espontánea (ROSC)',
        descripcion: 'Paciente estabilizado hemodinámicamente y trasladado a UTI',
        tipo: 'end'
      });
      datosCierre = {
        horaRosc: new Date(date.getTime() + parseFloat(tiempoRespuesta) * 60000 + 3 * 60000).toISOString(),
        ritmoSalida: 'Ritmo Sinusal Estable',
        destinoTraslado: 'Unidad de Terapia Intensiva (UTI)'
      };
    } else {
      timeline.push({
        hora: new Date(date.getTime() + parseFloat(tiempoRespuesta) * 60000 + 4 * 60000).toISOString(),
        titulo: 'Cese de Maniobras de RCP / Defunción',
        descripcion: `Constatado por ${responsable} tras protocolo ACLS completo sin respuesta`,
        tipo: 'end'
      });
      datosCierre = {
        horaDefuncion: new Date(date.getTime() + parseFloat(tiempoRespuesta) * 60000 + 4 * 60000).toISOString(),
        medicoCertificante: `${persResp.apellido}, ${persResp.nombre}`,
        matricula: 'M.P. 48.912',
        causaDefuncion: p.causa || 'Paro Cardiorrespiratorio irreversible por Fibrilación Ventricular refractaria',
        observaciones: 'Familiares informados en sala de espera. Pertenencias entregadas.'
      };
    }

    data.push({
      id: i + 1,
      id_paciente: p.id,
      paciente: `${p.apellido}, ${p.nombre} (${p.edad || 65}a)`,
      dni: p.dni,
      causa: p.causa,
      cama: p.cama,
      grupoSanguineo: p.grupo,
      alergias: p.alergias,
      fecha: date.toISOString(),
      area: p.area,
      estado: estado,
      responsable: responsable,
      quienHizoLlamada: activador,
      activadorData: activadorObj,
      equipoEncargado: equipo,
      turno: turno,
      origenLlamada: origen,
      intervenciones: ['RCP de Alta Calidad', 'Desfibrilación Precoz', 'Adrenalina IV'],
      materiales: materialesUsados,
      tiempoRespuesta: parseFloat(tiempoRespuesta),
      timeline: timeline,
      datosCierre: datosCierre,
      notas: `Causa de intervención: ${p.causa}. Activado por: ${activador}. Equipo: ${equipo} (${turno}). Protocolo ACLS aplicado.`
    });
  }

  data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  return data;
}

let mockData = generateMockData();

// ==========================================
// MÉTODOS GETTERS Y SETTERS CON PERSISTENCIA
// ==========================================

function getData() {
  const stored = localStorage.getItem('codigoAzulData');
  if (stored) {
    mockData = JSON.parse(stored);
    let modified = false;
    mockData.forEach((d, idx) => {
      // Normalizar estados a Exitoso o Fatal
      if (!d.estado || d.estado.value === 'pendiente' || d.estado.value === 'derivado') {
        d.estado = (idx % 4 === 0) ? ESTADOS[1] : ESTADOS[0];
        modified = true;
      } else if (d.estado.value === 'resuelto' && d.estado.label !== 'Exitoso (ROSC)') {
        d.estado.label = 'Exitoso (ROSC)';
        d.estado.badge = 'badge-success';
        modified = true;
      } else if (d.estado.value === 'fatal' && d.estado.label !== 'Fatal (Fallecido)') {
        d.estado.label = 'Fatal (Fallecido)';
        d.estado.badge = 'badge-danger';
        modified = true;
      }

      // Normalizar equipos
      if (d.equipoEncargado && (d.equipoEncargado.includes('Alfa') || d.equipoEncargado.includes('Urgencias'))) {
        d.equipoEncargado = 'Equipo A';
        modified = true;
      } else if (d.equipoEncargado && (d.equipoEncargado.includes('Bravo') || d.equipoEncargado.includes('Terapia'))) {
        d.equipoEncargado = 'Equipo B';
        modified = true;
      } else if (d.equipoEncargado && (d.equipoEncargado.includes('Charlie') || d.equipoEncargado.includes('Pisos'))) {
        d.equipoEncargado = 'Equipo C';
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem('codigoAzulData', JSON.stringify(mockData));
    }
  } else {
    localStorage.setItem('codigoAzulData', JSON.stringify(mockData));
  }
  return mockData;
}

function saveData(data) {
  mockData = data;
  localStorage.setItem('codigoAzulData', JSON.stringify(data));
}

// Helpers de Pacientes
function getPacientes() {
  const stored = localStorage.getItem('codigoAzulPacientes');
  if (stored) PACIENTES = JSON.parse(stored);
  else localStorage.setItem('codigoAzulPacientes', JSON.stringify(PACIENTES));
  return PACIENTES;
}

function savePacientes(list) {
  PACIENTES = list;
  localStorage.setItem('codigoAzulPacientes', JSON.stringify(list));
}

// Helpers de Personal de Salud
function getPersonalSalud() {
  const stored = localStorage.getItem('codigoAzulPersonal');
  if (stored) PERSONAL_SALUD = JSON.parse(stored);
  else localStorage.setItem('codigoAzulPersonal', JSON.stringify(PERSONAL_SALUD));
  return PERSONAL_SALUD;
}

function savePersonalSalud(list) {
  PERSONAL_SALUD = list;
  localStorage.setItem('codigoAzulPersonal', JSON.stringify(list));
  RESPONSABLES = getResponsablesList();
}

// Helpers de Roles de Salud
function getRolesSalud() {
  const stored = localStorage.getItem('codigoAzulRoles');
  if (stored) ROLES_SALUD = JSON.parse(stored);
  else localStorage.setItem('codigoAzulRoles', JSON.stringify(ROLES_SALUD));
  return ROLES_SALUD;
}

function saveRolesSalud(list) {
  ROLES_SALUD = list;
  localStorage.setItem('codigoAzulRoles', JSON.stringify(list));
}

// Helpers de Turnos
function getTurnos() {
  const stored = localStorage.getItem('codigoAzulTurnos');
  if (stored) TURNOS = JSON.parse(stored);
  else localStorage.setItem('codigoAzulTurnos', JSON.stringify(TURNOS));
  return TURNOS;
}

function saveTurnos(list) {
  TURNOS = list;
  localStorage.setItem('codigoAzulTurnos', JSON.stringify(list));
}

// Helpers de Equipos
function getEquipos() {
  const stored = localStorage.getItem('codigoAzulEquipos');
  if (stored) EQUIPOS = JSON.parse(stored);
  else localStorage.setItem('codigoAzulEquipos', JSON.stringify(EQUIPOS));
  return EQUIPOS;
}

function saveEquipos(list) {
  EQUIPOS = list;
  localStorage.setItem('codigoAzulEquipos', JSON.stringify(list));
}

// Helpers de Asignaciones de Turnos
function getAsignacionesTurnos() {
  const stored = localStorage.getItem('codigoAzulAsignacionesTurnos');
  if (stored) ASIGNACIONES_TURNOS = JSON.parse(stored);
  else localStorage.setItem('codigoAzulAsignacionesTurnos', JSON.stringify(ASIGNACIONES_TURNOS));
  return ASIGNACIONES_TURNOS;
}

function saveAsignacionesTurnos(list) {
  ASIGNACIONES_TURNOS = list;
  localStorage.setItem('codigoAzulAsignacionesTurnos', JSON.stringify(list));
}

// Helpers de Materiales
function getMateriales() {
  const stored = localStorage.getItem('codigoAzulMateriales');
  if (stored) MATERIALES_CATALOGO = JSON.parse(stored);
  else localStorage.setItem('codigoAzulMateriales', JSON.stringify(MATERIALES_CATALOGO));
  return MATERIALES_CATALOGO;
}

function saveMateriales(list) {
  MATERIALES_CATALOGO = list;
  localStorage.setItem('codigoAzulMateriales', JSON.stringify(list));
}

// Helpers de Áreas
function getAreas() {
  const stored = localStorage.getItem('codigoAzulAreas');
  if (stored) {
    AREAS_DATA = JSON.parse(stored);
  } else {
    localStorage.setItem('codigoAzulAreas', JSON.stringify(AREAS_DATA));
  }
  AREAS = AREAS_DATA.map(a => a.nombre);
  return AREAS_DATA;
}

function saveAreas(list) {
  AREAS_DATA = list;
  AREAS = list.map(a => a.nombre);
  localStorage.setItem('codigoAzulAreas', JSON.stringify(list));
}

// Helpers de Camas
const CAMAS_DATA_VERSION = 2; // Bump this to force bed renaming
function getCamas() {
  const storedVersion = localStorage.getItem('codigoAzulCamasVersion');
  const stored = localStorage.getItem('codigoAzulCamas');
  if (stored && storedVersion && parseInt(storedVersion) >= CAMAS_DATA_VERSION) {
    CAMAS_DATA = JSON.parse(stored);
  } else {
    // Regenerar con nuevo sistema de numeración
    CAMAS_DATA = generateInitialCamas();
    localStorage.setItem('codigoAzulCamas', JSON.stringify(CAMAS_DATA));
    localStorage.setItem('codigoAzulCamasVersion', String(CAMAS_DATA_VERSION));
  }
  return CAMAS_DATA;
}

function saveCamas(list) {
  CAMAS_DATA = list;
  localStorage.setItem('codigoAzulCamas', JSON.stringify(list));
  localStorage.setItem('codigoAzulCamasVersion', String(CAMAS_DATA_VERSION));
  // Mantener consistencia con las áreas
  const areas = getAreas();
  areas.forEach(a => {
    a.cantidad_camas = list.filter(c => c.id_area === a.id).length;
  });
  saveAreas(areas);
}

function syncCamasForArea(areaId, targetCount, areaNombre) {
  let camas = getCamas();
  const existingForArea = camas.filter(c => c.id_area === areaId);
  const currentCount = existingForArea.length;

  if (targetCount > currentCount) {
    // Generar camas faltantes
    const maxCamaId = camas.length > 0 ? Math.max(...camas.map(c => c.id)) : 0;
    let nextId = maxCamaId + 1;
    for (let i = currentCount + 1; i <= targetCount; i++) {
      camas.push({
        id: nextId++,
        id_area: areaId,
        area_nombre: areaNombre,
        numero: generarNumeroCama(areaNombre, i),
        estado: 'Libre'
      });
    }
  } else if (targetCount < currentCount) {
    // Reducir camas sólo si están libres (quitar desde el final)
    const toRemoveCount = currentCount - targetCount;
    let removed = 0;
    // Reverse iterate to remove from the end first
    for (let i = camas.length - 1; i >= 0 && removed < toRemoveCount; i--) {
      if (camas[i].id_area === areaId && camas[i].estado === 'Libre') {
        camas.splice(i, 1);
        removed++;
      }
    }
  }

  // Actualizar nombres de área y renumerar secuencialmente todas las camas del área
  let idx = 1;
  camas.forEach(c => {
    if (c.id_area === areaId) {
      c.area_nombre = areaNombre;
      c.numero = generarNumeroCama(areaNombre, idx);
      idx++;
    }
  });

  saveCamas(camas);
}

// Sincronización asíncrona con el Backend Laravel / MySQL
async function syncWithDatabase() {
  try {
    const res = await fetch('/api/llamados');
    if (res.ok) {
      const dbLlamados = await res.json();
      if (Array.isArray(dbLlamados) && dbLlamados.length > 0) {
        const mapped = dbLlamados.map((l, index) => {
          let estadoObj = ESTADOS[1];
          if (l.estado === 'Atendido') {
            if (l.resultado === 'ROSC') estadoObj = ESTADOS[0];
            else if (l.resultado === 'Fallecido') estadoObj = ESTADOS[2];
            else if (l.resultado === 'Derivado') estadoObj = ESTADOS[3];
            else estadoObj = ESTADOS[0];
          }

          const pNom = l.paciente?.persona?.nombre_completo || l.paciente || `Paciente #${l.id_paciente || (index+1)}`;
          const causa = l.paciente?.diagnostico || l.diagnostico || 'Paro Cardiorrespiratorio';
          const cama = l.paciente?.cama?.numero || l.cama || 'Cama Guardia';
          const dni = l.paciente?.persona?.dni || 'Sin DNI';
          const grupo = l.paciente?.grupo_sanguineo || 'S/D';
          const alergias = l.paciente?.alergias || 'Ninguna';
          const areaNombre = l.paciente?.area?.nombre || l.area || 'Urgencias';
          const activador = l.personal_activacion?.persona?.nombre_completo || l.quienHizoLlamada || 'Personal de Guardia';
          const responsable = l.usuario_atencion?.personal_salud?.persona?.nombre_completo || l.responsable || 'Dr. Carlos Méndez';
          const equipo = l.equipo_respuesta?.nombre || l.equipoEncargado || 'Equipo A';
          const turno = l.turno || 'Turno Mañana';
          const origen = l.origen?.descripcion || l.origenLlamada || 'Consola de Emergencia';
          const tiempoMinutos = l.tiempo_respuesta_segundos ? (l.tiempo_respuesta_segundos / 60).toFixed(1) : (l.tiempoRespuesta || 4);

          const materiales = Array.isArray(l.materiales) && l.materiales.length > 0
            ? l.materiales.map(m => ({
                id_material: m.id_material,
                nombre: m.nombre,
                cantidad: m.pivot?.cantidad || m.cantidad || 1,
                unidad: m.unidad_medida || m.unidad || 'Unidades'
              }))
            : [
                { id_material: 1, nombre: 'Adrenalina 1mg/ml Ampolla', cantidad: 2, unidad: 'Ampollas' },
                { id_material: 8, nombre: 'Parches Desfibrilador Bifásico', cantidad: 1, unidad: 'Pares' }
              ];

          const date = new Date(l.fecha_hora_activacion || l.fecha || new Date());
          const timeline = l.timeline || [
            {
              hora: date.toISOString(),
              titulo: 'Código Azul Activado',
              descripcion: `Activado por ${activador} desde ${origen}`,
              tipo: 'start'
            },
            {
              hora: new Date(date.getTime() + 2 * 60000).toISOString(),
              titulo: 'Intervención de Equipo de Respuesta',
              descripcion: `${equipo} en el lugar. RCP avanzada y fármacos administrados.`,
              tipo: 'action'
            }
          ];

          if (l.estado === 'Atendido') {
            timeline.push({
              hora: new Date(date.getTime() + parseFloat(tiempoMinutos) * 60000 + 3 * 60000).toISOString(),
              titulo: l.resultado === 'ROSC' ? 'Retorno de Circulación Espontánea (ROSC)' : (l.resultado === 'Fallecido' ? 'Fallecido' : 'Derivado'),
              descripcion: `Atención completada por ${responsable}`,
              tipo: 'end'
            });
          }

          return {
            id: l.id_llamado || l.id || (index + 1),
            id_paciente: l.id_paciente,
            paciente: pNom,
            dni: dni,
            causa: causa,
            cama: cama,
            grupoSanguineo: grupo,
            alergias: alergias,
            fecha: date.toISOString(),
            area: areaNombre,
            estado: estadoObj,
            responsable: responsable,
            quienHizoLlamada: activador,
            equipoEncargado: equipo,
            turno: turno,
            origenLlamada: origen,
            intervenciones: l.intervenciones || ['RCP de Alta Calidad', 'Desfibrilación Precoz', 'Adrenalina IV'],
            materiales: materiales,
            tiempoRespuesta: parseFloat(tiempoMinutos),
            timeline: timeline,
            notas: l.notas || `Causa de intervención: ${causa}. Activado por: ${activador}. Equipo: ${equipo}.`
          };
        });

        if (mapped.length > 0) {
          saveData(mapped);
        }
      }
    }

    // Sincronizar catálogo de pacientes
    const resPac = await fetch('/api/pacientes');
    if (resPac.ok) {
      const dbPac = await resPac.json();
      if (Array.isArray(dbPac) && dbPac.length > 0) {
        const mappedPac = dbPac.map(p => ({
          id: p.id_paciente,
          apellido: p.persona?.apellido || p.apellido || '',
          nombre: p.persona?.nombre || p.nombre || '',
          dni: p.persona?.dni || p.dni || '',
          edad: p.persona?.fecha_nacimiento ? Math.floor((new Date() - new Date(p.persona.fecha_nacimiento)) / 31557600000) : 60,
          causa: p.diagnostico || 'Paro Cardiorrespiratorio',
          area: p.area?.nombre || 'Urgencias',
          cama: p.cama?.numero || 'Cama Guardia',
          grupo: p.grupo_sanguineo || 'S/D',
          alergias: p.alergias || 'Ninguna',
          id_personal: p.id_personal,
          activo: p.activo !== 0
        }));
        savePacientes(mappedPac);
      }
    }

    // Sincronizar personal de salud
    const resPers = await fetch('/api/personal-salud');
    if (resPers.ok) {
      const dbPers = await resPers.json();
      if (Array.isArray(dbPers) && dbPers.length > 0) {
        const mappedPers = dbPers.map(p => ({
          id: p.id_personal,
          apellido: p.persona?.apellido || '',
          nombre: p.persona?.nombre || '',
          dni: p.persona?.dni || '',
          telefono: p.persona?.telefono || '',
          id_rol_profesional: p.id_rol_profesional,
          nombre_rol: p.rol_profesional?.nombre_rol || 'Personal de Salud',
          area: (p.areas && p.areas.length > 0) ? p.areas[0].nombre : 'Guardia General'
        }));
        savePersonalSalud(mappedPers);
      }
    }

    // Sincronizar roles profesionales
    const resRoles = await fetch('/api/roles-profesionales');
    if (resRoles.ok) {
      const dbRoles = await resRoles.json();
      if (Array.isArray(dbRoles) && dbRoles.length > 0) {
        saveRolesSalud(dbRoles);
      }
    }

    // Sincronizar turnos
    const resTurnos = await fetch('/api/turnos');
    if (resTurnos.ok) {
      const dbTurnos = await resTurnos.json();
      if (Array.isArray(dbTurnos) && dbTurnos.length > 0) {
        saveTurnos(dbTurnos);
      }
    }

    // Sincronizar equipos
    const resEq = await fetch('/api/equipos');
    if (resEq.ok) {
      const dbEq = await resEq.json();
      if (Array.isArray(dbEq) && dbEq.length > 0) {
        saveEquipos(dbEq);
      }
    }

    // Sincronizar materiales
    const resMat = await fetch('/api/materiales');
    if (resMat.ok) {
      const dbMat = await resMat.json();
      if (Array.isArray(dbMat) && dbMat.length > 0) {
        const mappedMat = dbMat.map(m => ({
          id: m.id_material,
          nombre: m.nombre,
          tipo: m.tipo,
          unidad: m.unidad_medida,
          stock: m.stock || 30,
          descripcion: m.descripcion || `${m.tipo} para carro de reanimación cardiopulmonar.`
        }));
        saveMateriales(mappedMat);
      }
    }
  } catch (e) {
    console.log('Modo offline / persistencia local activa');
  }
}

// Iniciar sincronización de fondo
syncWithDatabase();

// ==========================================
// AUDITORÍA LEGAL Y TRAZABILIDAD
// ==========================================

let AUDITORIA_LOGS = [];

function getAuditoria(id_llamado = null) {
  const stored = localStorage.getItem('codigoAzulAuditoria');
  if (stored) {
    AUDITORIA_LOGS = JSON.parse(stored);
  } else {
    // Datos iniciales de trazabilidad
    AUDITORIA_LOGS = [
      { id: 1, id_llamado: 1, usuario: 'Dra. Laura Gutiérrez', rol: 'Médico', accion: 'Activación de Código Azul', fecha: new Date(Date.now() - 3600000).toISOString(), detalle: 'Alarma activada desde Box 2 Shock Room.' },
      { id: 2, id_llamado: 1, usuario: 'Dr. Carlos Méndez', rol: 'Médico Intensivista', accion: 'Administración de Fármacos', fecha: new Date(Date.now() - 3000000).toISOString(), detalle: 'Se aplican 2 ampollas de Adrenalina 1mg y 1 de Amiodarona 150mg.' },
      { id: 3, id_llamado: 1, usuario: 'Dr. Carlos Méndez', rol: 'Médico Intensivista', accion: 'Cierre Clínico - ROSC', fecha: new Date(Date.now() - 2400000).toISOString(), detalle: 'Retorno de circulación espontánea. Paciente estabilizado y trasladado a UTI.' }
    ];
    localStorage.setItem('codigoAzulAuditoria', JSON.stringify(AUDITORIA_LOGS));
  }

  if (id_llamado) {
    return AUDITORIA_LOGS.filter(a => a.id_llamado === parseInt(id_llamado)).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }
  return AUDITORIA_LOGS.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function logAuditoria(id_llamado, accion, detalle, usuario = null) {
  const logs = getAuditoria();
  const user = usuario || getUser()?.user || 'Personal de Guardia';
  const role = getUser()?.role || 'Médico / Guardia';

  const newLog = {
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    id_llamado: parseInt(id_llamado),
    usuario: user,
    rol: role,
    accion: accion,
    fecha: new Date().toISOString(),
    detalle: detalle
  };

  logs.unshift(newLog);
  localStorage.setItem('codigoAzulAuditoria', JSON.stringify(logs));
  return newLog;
}

// Criterio inteligente de detección de Turno y Equipo activo según la hora
function getTurnoYEquipoActual() {
  const now = new Date();
  const hour = now.getHours();

  let turnoNombre = 'Turno Mañana';
  let equipoNombre = 'Equipo A';

  if (hour >= 6 && hour < 14) {
    turnoNombre = 'Turno Mañana';
    equipoNombre = 'Equipo A';
  } else if (hour >= 14 && hour < 22) {
    turnoNombre = 'Turno Tarde';
    equipoNombre = 'Equipo B';
  } else {
    turnoNombre = 'Turno Noche / Guardia';
    equipoNombre = 'Equipo C';
  }

  // Verificar si hay asignación específica en el calendario
  const asignaciones = getAsignacionesTurnos();
  const todayStr = now.toISOString().slice(0, 10);
  const found = asignaciones.find(a => 
    a.turno_nombre.toLowerCase().includes(turnoNombre.toLowerCase().split(' ')[1] || 'mañana') &&
    a.fecha_desde <= todayStr && (!a.fecha_hasta || a.fecha_hasta >= todayStr)
  );

  if (found) {
    equipoNombre = found.equipo_nombre;
    turnoNombre = found.turno_nombre;
  }

  return { turno: turnoNombre, equipo: equipoNombre };
}

async function addCodigo(codigo) {
  const data = getData();
  codigo.id = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
  data.unshift(codigo);
  saveData(data);

  // Registrar en Auditoría Legal
  logAuditoria(codigo.id, 'Registro de Código Azul', `Registrado por ${codigo.quienHizoLlamada} para paciente ${codigo.paciente} en ${codigo.area} (${codigo.cama}). Equipo: ${codigo.equipoEncargado} (${codigo.turno}). Resultado: ${codigo.estado?.label}.`);

  if (codigo.estado?.value === 'fatal') {
    logAuditoria(codigo.id, 'Cierre Clínico - Certificación de Defunción', `Certificado por ${codigo.datosCierre?.medicoCertificante || codigo.responsable} (Mat. ${codigo.datosCierre?.matricula || 'S/M'}). Causa de defunción: ${codigo.datosCierre?.causaDefuncion || codigo.causa}.`);
    
    // Si el evento fue fatal, dar de baja al paciente automáticamente y liberar su cama
    const pacientes = getPacientes();
    const pIdx = pacientes.findIndex(p => p.id === codigo.id_paciente || codigo.paciente.includes(p.apellido));
    if (pIdx !== -1) {
      pacientes[pIdx].activo = false;
      savePacientes(pacientes);
      
      const camasList = getCamas();
      const cObj = camasList.find(c => c.area_nombre === pacientes[pIdx].area && c.numero === pacientes[pIdx].cama);
      if (cObj) {
        cObj.estado = 'Libre';
        saveCamas(camasList);
      }
    }
  } else if (codigo.estado?.value === 'resuelto') {
    logAuditoria(codigo.id, 'Cierre Clínico - Recuperación (ROSC)', `Retorno de circulación espontánea certificado por ${codigo.responsable}. Destino de traslado: ${codigo.datosCierre?.destinoTraslado || 'UTI'}.`);
  }

  // Descontar automáticamente materiales utilizados del carro de emergencias
  if (Array.isArray(codigo.materiales) && codigo.materiales.length > 0) {
    const matList = getMateriales();
    codigo.materiales.forEach(used => {
      const mObj = matList.find(m => m.id === used.id_material || m.nombre === used.nombre);
      if (mObj) {
        mObj.stock = Math.max(0, (mObj.stock !== undefined ? mObj.stock : 20) - (used.cantidad || 1));
      }
    });
    saveMateriales(matList);
  }

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
    const prev = data[idx];
    data[idx] = { ...data[idx], ...updates };
    saveData(data);

    // Si cambió o se guardó como fatal, dar de baja al paciente
    if (updates.estado?.value === 'fatal') {
      const pacientes = getPacientes();
      const pIdx = pacientes.findIndex(p => p.id === data[idx].id_paciente || data[idx].paciente.includes(p.apellido));
      if (pIdx !== -1) {
        pacientes[pIdx].activo = false;
        savePacientes(pacientes);

        const camasList = getCamas();
        const cObj = camasList.find(c => c.area_nombre === pacientes[pIdx].area && c.numero === pacientes[pIdx].cama);
        if (cObj) {
          cObj.estado = 'Libre';
          saveCamas(camasList);
        }
      }
    }

    // Registrar cambios en Auditoría Legal
    if (updates.estado && updates.estado.value !== prev.estado?.value) {
      if (updates.estado.value === 'fatal') {
        logAuditoria(id, 'Cierre Clínico - Certificación de Defunción', `Cierre marcado como Fallecido. Certifica: ${updates.datosCierre?.medicoCertificante || updates.responsable} (Mat. ${updates.datosCierre?.matricula || 'S/M'}). Hora defunción: ${updates.datosCierre?.horaDefuncion || 'Inmediata'}. Causa: ${updates.datosCierre?.causaDefuncion || updates.causa}.`);
      } else if (updates.estado.value === 'resuelto') {
        logAuditoria(id, 'Cierre Clínico - Recuperación (ROSC)', `Cierre de reanimación exitosa. Ritmo de salida: ${updates.datosCierre?.ritmoSalida || 'Sinusal'}. Destino: ${updates.datosCierre?.destinoTraslado || 'UTI'}.`);
      } else {
        logAuditoria(id, 'Actualización de Estado', `Estado modificado de "${prev.estado?.label}" a "${updates.estado.label}".`);
      }
    } else {
      logAuditoria(id, 'Modificación de Registro', `Datos actualizados por usuario del sistema.`);
    }

    // Reconciliar y actualizar stock de materiales si hubo cambios
    if (Array.isArray(updates.materiales)) {
      const matList = getMateriales();
      const prevMaterials = Array.isArray(prev.materiales) ? prev.materiales : [];
      
      // 1. Revertir cantidades previas al inventario
      prevMaterials.forEach(oldUsed => {
        const m = matList.find(item => item.id === oldUsed.id_material || item.nombre === oldUsed.nombre);
        if (m) {
          m.stock = (m.stock !== undefined ? m.stock : 20) + (oldUsed.cantidad || 1);
        }
      });

      // 2. Descontar las nuevas cantidades seleccionadas
      updates.materiales.forEach(newUsed => {
        const m = matList.find(item => item.id === newUsed.id_material || item.nombre === newUsed.nombre);
        if (m) {
          m.stock = Math.max(0, (m.stock !== undefined ? m.stock : 20) - (newUsed.cantidad || 1));
        }
      });

      saveMateriales(matList);
    }

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
  const data = getData();
  const target = data.find(d => d.id === id);
  if (target) {
    // 1. Restaurar stock de los materiales utilizados
    if (Array.isArray(target.materiales) && target.materiales.length > 0) {
      const matList = getMateriales();
      target.materiales.forEach(used => {
        const m = matList.find(item => item.id === used.id_material || item.nombre === used.nombre);
        if (m) {
          m.stock = (m.stock !== undefined ? m.stock : 20) + (used.cantidad || 1);
        }
      });
      saveMateriales(matList);
    }

    // 2. Si el evento fue fatal, reactivar al paciente para que vuelva a estar disponible
    if (target.estado?.value === 'fatal') {
      const pacientes = getPacientes();
      const pIdx = pacientes.findIndex(p => p.id === target.id_paciente || target.paciente.includes(p.apellido));
      if (pIdx !== -1) {
        pacientes[pIdx].activo = true;
        savePacientes(pacientes);

        const camasList = getCamas();
        const cObj = camasList.find(c => c.area_nombre === pacientes[pIdx].area && c.numero === pacientes[pIdx].cama);
        if (cObj) {
          cObj.estado = 'Ocupada';
          saveCamas(camasList);
        }
      }
    }
  }

  const rest = data.filter(d => d.id !== id);
  saveData(rest);
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
