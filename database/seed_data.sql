-- Datos iniciales y catálogo completo para el Sistema de Gestión de Código Azul (ETP 2026)

USE `codigo_azul`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Permisos
TRUNCATE TABLE `usuario_permisos`;
TRUNCATE TABLE `permisos`;
INSERT INTO `permisos` (`id_permiso`, `nombre_permiso`) VALUES
(1, 'Acceso Dashboard'),
(2, 'Activar Codigo Azul'),
(3, 'Atender Codigo Azul'),
(4, 'Ver Historial y Reportes'),
(5, 'Administrar Pacientes'),
(6, 'Gestionar Insumos y Materiales'),
(7, 'Administrar Usuarios');

-- 2. Roles Profesionales
TRUNCATE TABLE `roles_profesionales`;
INSERT INTO `roles_profesionales` (`id_rol_profesional`, `nombre_rol`) VALUES
(1, 'Médico Especialista en Terapia Intensiva'),
(2, 'Médico Cardiólogo'),
(3, 'Médico Emergentólogo'),
(4, 'Lic. en Enfermería - Cuidados Críticos'),
(5, 'Enfermero/a de Guardia'),
(6, 'Kinesiólogo/a Respiratorio');

-- 3. Turnos
TRUNCATE TABLE `equipo_turno_asignacion`;
TRUNCATE TABLE `turnos`;
INSERT INTO `turnos` (`id_turno`, `nombre`, `hora_inicio`, `hora_fin`) VALUES
(1, 'Turno Mañana', '06:00:00', '14:00:00'),
(2, 'Turno Tarde', '14:00:00', '22:00:00'),
(3, 'Turno Noche / Guardia', '22:00:00', '06:00:00');

-- 4. Áreas Hospitalarias
TRUNCATE TABLE `areas`;
INSERT INTO `areas` (`id_area`, `nombre`, `cantidad_camas`) VALUES
(1, 'Urgencias / Shock Room', 20),
(2, 'Unidad de Terapia Intensiva (UTI)', 14),
(3, 'Cardiología', 16),
(4, 'Piso 3A', 22),
(5, 'Piso 3B', 22),
(6, 'Piso 4A', 20),
(7, 'Piso 4B', 20),
(8, 'Piso 5 - Cirugía', 18),
(9, 'Centro Quirúrgico', 8),
(10, 'Maternidad', 15);

-- 5. Camas Físicas
TRUNCATE TABLE `camas`;
INSERT INTO `camas` (`id_cama`, `numero`, `estado`, `id_area`) VALUES
(1, 'Box 1', 'Libre', 1),
(2, 'Box 2', 'Ocupada', 1),
(3, 'Cama 108', 'Ocupada', 1),
(4, 'UTI-01', 'Libre', 2),
(5, 'UTI-02', 'Ocupada', 2),
(6, 'UTI-05', 'Ocupada', 2),
(7, 'Cama 304', 'Ocupada', 3),
(8, 'Cama 305', 'Libre', 3),
(9, 'Cama 315', 'Ocupada', 4),
(10, 'Cama 320', 'Ocupada', 5),
(11, 'Cama 402', 'Ocupada', 6),
(12, 'Cama 412', 'Ocupada', 6),
(13, 'Cama 504', 'Ocupada', 8),
(14, 'Quirófano 1', 'Libre', 9),
(15, 'Quirófano 2', 'Libre', 9);

-- 6. Materiales e Insumos
TRUNCATE TABLE `llamado_materiales`;
TRUNCATE TABLE `materiales`;
INSERT INTO `materiales` (`id_material`, `nombre`, `tipo`, `unidad_medida`) VALUES
(1, 'Adrenalina 1mg/ml Ampolla', 'Medicamento', 'Ampollas'),
(2, 'Amiodarona 150mg Ampolla', 'Medicamento', 'Ampollas'),
(3, 'Atropina 1mg Ampolla', 'Medicamento', 'Ampollas'),
(4, 'Bicarbonato de Sodio 1M', 'Medicamento', 'Frascos'),
(5, 'Lidocaína 2% Ampolla', 'Medicamento', 'Ampollas'),
(6, 'Tubo Endotraqueal N° 7.5', 'Insumo', 'Unidades'),
(7, 'Tubo Endotraqueal N° 8.0', 'Insumo', 'Unidades'),
(8, 'Parches Desfibrilador Bifásico', 'Insumo', 'Pares'),
(9, 'Bolsa de Reanimación (Ambu)', 'Insumo', 'Unidades'),
(10, 'Solución Fisiológica 0.9% 500ml', 'Insumo', 'Sachets');

-- 7. Personas (Identidad común)
TRUNCATE TABLE `personal_areas`;
TRUNCATE TABLE `personal_salud`;
TRUNCATE TABLE `pacientes`;
TRUNCATE TABLE `personas`;
INSERT INTO `personas` (`id_persona`, `apellido`, `nombre`, `dni`, `fecha_nacimiento`, `telefono`) VALUES
-- Personal de Salud (1-10)
(1, 'Méndez', 'Carlos', '28345678', '1981-04-12', '11-4567-8901'),
(2, 'Gutiérrez', 'Laura', '31234567', '1984-08-23', '11-5678-1234'),
(3, 'Sánchez', 'Roberto', '26789012', '1978-02-15', '11-6789-2345'),
(4, 'Torres', 'María', '33456789', '1987-11-30', '11-7890-3456'),
(5, 'López', 'Fernando', '29876543', '1982-06-18', '11-8901-4567'),
(6, 'Ramírez', 'Ana', '35678901', '1990-09-05', '11-9012-5678'),
(7, 'Luna', 'Patricia', '30123456', '1983-03-22', '11-2345-6789'),
(8, 'López', 'María Elena', '32145678', '1986-07-14', '11-4589-1234'),
(9, 'Gómez', 'Juan Roberto', '29876544', '1982-12-01', '11-5678-9012'),
(10, 'Fernández', 'Ana Clara', '35123987', '1989-05-19', '11-3456-7890'),
-- Pacientes (11-20)
(11, 'Pérez', 'Juan', '14253647', '1956-05-14', '11-3344-5566'),
(12, 'García', 'María', '12456789', '1952-10-25', '11-4455-6677'),
(13, 'Rodríguez', 'Pedro', '18976453', '1969-03-08', '11-5566-7788'),
(14, 'Martínez', 'Ana', '10987654', '1944-07-19', '11-6677-8899'),
(15, 'Hernández', 'Luis', '16789012', '1961-09-12', '11-7788-9900'),
(16, 'Flores', 'Carmen', '13456789', '1949-01-30', '11-8899-0011'),
(17, 'Sánchez', 'Roberto C.', '21345678', '1975-04-18', '11-9900-1122'),
(18, 'Torres', 'Isabel', '09876543', '1941-12-05', '11-1122-3344'),
(19, 'López', 'Fernando M.', '17890123', '1966-08-22', '11-2233-4455'),
(20, 'Gómez', 'Carlos', '20123456', '1973-11-15', '11-3344-7788');

-- 8. Personal de Salud (Subtipo de Personas)
INSERT INTO `personal_salud` (`id_personal`, `id_rol_profesional`) VALUES
(1, 1), -- Dr. Carlos Méndez (Intensivista)
(2, 2), -- Dra. Laura Gutiérrez (Cardióloga)
(3, 3), -- Dr. Roberto Sánchez (Emergentólogo)
(4, 1), -- Dra. María Torres (Intensivista)
(5, 2), -- Dr. Fernando López (Cardiólogo)
(6, 4), -- Dra. Ana Ramírez (Cuidados Críticos)
(7, 4), -- Enf. Patricia Luna (Cuidados Críticos)
(8, 4), -- Enf. María Elena López (Cuidados Críticos)
(9, 5), -- Enf. Juan Roberto Gómez (Guardia)
(10, 5); -- Enf. Ana Clara Fernández (Guardia)

-- 9. Personal por Áreas
INSERT INTO `personal_areas` (`id_personal`, `id_area`) VALUES
(1, 2), (1, 1),
(2, 3), (2, 2),
(3, 1), (3, 9),
(4, 2), (4, 4),
(5, 3), (5, 5),
(6, 2), (6, 6),
(7, 2), (7, 1),
(8, 2), (8, 3),
(9, 1), (9, 4),
(10, 9), (10, 2);

-- 10. Pacientes (Subtipo de Personas, vinculados a Camas y Personal)
INSERT INTO `pacientes` (`id_paciente`, `grupo_sanguineo`, `alergias`, `diagnostico`, `fecha_ingreso`, `fecha_alta`, `activo`, `id_cama`, `id_area`, `id_personal`) VALUES
(11, 'A+', 'Penicilina', 'Infarto Agudo de Miocardio (IAM)', '2026-08-20', NULL, 1, 7, 3, 1),
(12, 'O+', 'Ninguna', 'Insuficiencia Cardíaca Congestiva Descompensada', '2026-08-21', NULL, 1, 12, 6, 2),
(13, 'B+', 'Sulfas', 'Shock Cardiogénico / Fibrilación Ventricular', '2026-08-22', NULL, 1, 2, 1, 3),
(14, 'A-', 'Iodo', 'Edema Agudo de Pulmón', '2026-08-23', NULL, 1, 9, 4, 1),
(15, 'O-', 'Ninguna', 'Politraumatismo / Shock Hipovolémico', '2026-08-24', NULL, 1, 3, 1, 3),
(16, 'AB+', 'AINEs', 'Postoperatorio Revascularización Miocárdica', '2026-08-24', NULL, 1, 5, 2, 4),
(17, 'B-', 'Ninguna', 'Bloqueo AV Completo / Síncope', '2026-08-25', NULL, 1, 13, 8, 5),
(18, 'O+', 'Látex', 'Estenosis Aórtica Severa', '2026-08-25', NULL, 1, 11, 6, 2),
(19, 'A+', 'Ninguna', 'Cardiopatía Isquémica Crónica', '2026-08-26', NULL, 1, 10, 5, 5),
(20, 'O+', 'Dipirona', 'Paro Presenciado / Asistolia Revertida', '2026-08-26', NULL, 1, 6, 2, 1);

-- 11. Orígenes de Alerta
TRUNCATE TABLE `origenes`;
INSERT INTO `origenes` (`id_origen`, `descripcion`, `id_area`) VALUES
(1, 'Botón Cabecera Cama 101-120', 1),
(2, 'Monitor Multiparamétrico UTI Central', 2),
(3, 'Electrocardiógrafo Piso 3 Cardio', 3),
(4, 'Consola de Alarma Piso 4A', 6),
(5, 'Pulsador Quirófano Central', 9),
(6, 'App Móvil Guardia Médica', 1);

-- 12. Usuarios del Sistema
TRUNCATE TABLE `usuarios`;
-- Contraseña hash bcrypt para 'admin123'
INSERT INTO `usuarios` (`id_usuario`, `nombre_usuario`, `contrasena_hash`, `rol`, `id_personal`) VALUES
(1, 'admin', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Administrador', NULL),
(2, 'cmendez', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Generico', 1),
(3, 'lgutierrez', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Generico', 2),
(4, 'rsanchez', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Generico', 3),
(5, 'pluna', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Generico', 7);

-- Permisos asignados
INSERT INTO `usuario_permisos` (`id_usuario`, `id_permiso`) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
(2, 1), (2, 2), (2, 3), (2, 4),
(3, 1), (3, 2), (3, 3), (3, 4);

-- 13. Equipos de Código Azul
TRUNCATE TABLE `equipo_codigo_azul_personal`;
TRUNCATE TABLE `equipos_codigo_azul`;
INSERT INTO `equipos_codigo_azul` (`id_equipo`, `nombre`) VALUES
(1, 'Equipo A'),
(2, 'Equipo B'),
(3, 'Equipo C');

INSERT INTO `equipo_codigo_azul_personal` (`id_equipo`, `id_personal`, `rol_en_equipo`) VALUES
(1, 1, 'Líder / Vía Aérea'),
(1, 3, 'Compresiones / RCP'),
(1, 7, 'Acceso Vascular / Drogas'),
(1, 9, 'Registro / Cronómetro'),
(2, 2, 'Líder / Desfibrilación'),
(2, 4, 'Vía Aérea Avanzada'),
(2, 8, 'Fármacos'),
(2, 10, 'Circulante'),
(3, 5, 'Líder'),
(3, 6, 'Vía Aérea'),
(3, 7, 'RCP'),
(3, 8, 'Drogas');

-- Asignación de Turnos a Equipos
INSERT INTO `equipo_turno_asignacion` (`id_asignacion`, `id_equipo`, `id_turno`, `fecha_desde`, `fecha_hasta`) VALUES
(1, 1, 1, '2026-08-01', NULL),
(2, 2, 2, '2026-08-01', NULL),
(3, 3, 3, '2026-08-01', NULL);

-- 14. Llamados de Código Azul
TRUNCATE TABLE `llamados`;
INSERT INTO `llamados` (`id_llamado`, `fecha_hora_activacion`, `fecha_hora_atencion`, `estado`, `resultado`, `id_paciente`, `id_origen`, `id_personal_activacion`, `id_usuario_atencion`, `id_equipo_respuesta`) VALUES
(1, '2026-08-20 14:32:00', '2026-08-20 14:36:12', 'Atendido', 'ROSC', 11, 3, 1, 1, 1),
(2, '2026-08-21 11:15:00', '2026-08-21 11:23:45', 'Atendido', 'ROSC', 12, 4, 2, 1, 3),
(3, '2026-08-22 09:40:00', '2026-08-22 09:42:50', 'Atendido', 'ROSC', 13, 1, 3, 1, 1),
(4, '2026-08-23 16:05:00', '2026-08-23 16:11:20', 'Atendido', 'Derivado', 14, 3, 1, 1, 1),
(5, '2026-08-24 03:20:00', '2026-08-24 03:24:10', 'Atendido', 'ROSC', 15, 1, 3, 1, 1),
(6, '2026-08-24 18:50:00', '2026-08-24 18:55:00', 'Atendido', 'ROSC', 16, 2, 4, 1, 2),
(7, '2026-08-25 08:12:00', '2026-08-25 08:18:30', 'Atendido', 'ROSC', 17, 3, 5, 1, 3),
(8, '2026-08-25 22:45:00', '2026-08-25 22:52:15', 'Atendido', 'Fallecido', 18, 4, 2, 1, 3),
(9, '2026-08-26 07:30:00', '2026-08-26 07:33:45', 'Atendido', 'ROSC', 19, 3, 5, 1, 1),
(10, '2026-08-26 15:10:00', '2026-08-26 15:13:20', 'Atendido', 'ROSC', 20, 2, 1, 1, 2);

-- 15. Insumos consumidos por llamado
INSERT INTO `llamado_materiales` (`id_llamado`, `id_material`, `cantidad`) VALUES
(1, 1, 2.00), (1, 8, 1.00), (1, 10, 2.00),
(2, 1, 3.00), (2, 2, 1.00), (2, 6, 1.00),
(3, 1, 1.00), (3, 8, 1.00),
(5, 1, 2.00), (5, 10, 3.00),
(6, 1, 1.00), (6, 2, 1.00),
(10, 1, 2.00), (10, 8, 1.00), (10, 9, 1.00);

-- 16. Registros Iniciales de Auditoría
TRUNCATE TABLE `auditoria`;
INSERT INTO `auditoria` (`id_auditoria`, `id_usuario`, `accion`, `entidad_afectada`, `id_entidad_afectada`, `fecha_hora`) VALUES
(1, 1, 'Inicialización del Sistema', 'sistema', 1, '2026-08-20 08:00:00'),
(2, 1, 'Carga de Catálogos y Personal', 'personal_salud', 10, '2026-08-20 08:30:00'),
(3, 1, 'Configuración de Equipos Código Azul', 'equipos_codigo_azul', 3, '2026-08-20 09:00:00');

SET FOREIGN_KEY_CHECKS = 1;
