-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-08-2026 a las 04:46:37
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `codigo_azul`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `areas`
--

CREATE TABLE `areas` (
  `id_area` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `cantidad_camas` int(11) NOT NULL DEFAULT 0
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria`
--

CREATE TABLE `auditoria` (
  `id_auditoria` int(11) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `accion` varchar(100) NOT NULL,
  `entidad_afectada` varchar(50) NOT NULL,
  `id_entidad_afectada` int(11) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registro de auditoria de acciones de los usuarios sobre el sistema.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `camas`
--

CREATE TABLE `camas` (
  `id_cama` int(11) NOT NULL,
  `numero` varchar(10) NOT NULL,
  `estado` enum('Libre','Ocupada') NOT NULL DEFAULT 'Libre',
  `id_area` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Camas fisicas de cada area, con su estado de ocupacion.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dispositivos_push`
--

CREATE TABLE `dispositivos_push` (
  `id_dispositivo` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `token_push` varchar(255) NOT NULL,
  `plataforma` enum('Android','iOS') NOT NULL,
  `fecha_registro` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Dispositivos moviles registrados para notificaciones push.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipos_codigo_azul`
--

CREATE TABLE `equipos_codigo_azul` (
  `id_equipo` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Equipos de respuesta rapida de Codigo Azul.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo_codigo_azul_personal`
--

CREATE TABLE `equipo_codigo_azul_personal` (
  `id_equipo` int(11) NOT NULL,
  `id_personal` int(11) NOT NULL,
  `rol_en_equipo` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Union N:M: integrantes de cada equipo de Codigo Azul.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipo_turno_asignacion`
--

CREATE TABLE `equipo_turno_asignacion` (
  `id_asignacion` int(11) NOT NULL,
  `id_equipo` int(11) NOT NULL,
  `id_turno` int(11) NOT NULL,
  `fecha_desde` date NOT NULL,
  `fecha_hasta` date DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `llamados`
--

CREATE TABLE `llamados` (
  `id_llamado` int(11) NOT NULL,
  `fecha_hora_activacion` datetime NOT NULL,
  `fecha_hora_atencion` datetime DEFAULT NULL,
  `estado` enum('Sin atender','Atendido') NOT NULL DEFAULT 'Sin atender',
  `resultado` enum('ROSC','Fallecido','Derivado') DEFAULT NULL,
  `id_paciente` int(11) NOT NULL,
  `id_origen` int(11) NOT NULL,
  `id_personal_activacion` int(11) DEFAULT NULL,
  `id_usuario_atencion` int(11) DEFAULT NULL,
  `id_equipo_respuesta` int(11) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp()
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `llamado_materiales`
--

CREATE TABLE `llamado_materiales` (
  `id_llamado` int(11) NOT NULL,
  `id_material` int(11) NOT NULL,
  `cantidad` decimal(8,2) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materiales`
--

CREATE TABLE `materiales` (
  `id_material` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` enum('Medicamento','Insumo') NOT NULL,
  `unidad_medida` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catalogo de medicamentos e insumos.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `origenes`
--

CREATE TABLE `origenes` (
  `id_origen` int(11) NOT NULL,
  `descripcion` varchar(50) NOT NULL,
  `id_area` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Puntos de origen (habitacion, consultorio, etc.) dentro de un area.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pacientes`
--

CREATE TABLE `pacientes` (
  `id_paciente` int(11) NOT NULL,
  `grupo_sanguineo` varchar(5) DEFAULT NULL,
  `alergias` varchar(255) DEFAULT NULL,
  `diagnostico` varchar(255) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `fecha_alta` date DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `id_cama` int(11) DEFAULT NULL,
  `id_area` int(11) NOT NULL,
  `id_personal` int(11) NOT NULL
) ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permisos`
--

CREATE TABLE `permisos` (
  `id_permiso` int(11) NOT NULL,
  `nombre_permiso` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catalogo de funciones habilitables del sistema.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_areas`
--

CREATE TABLE `personal_areas` (
  `id_personal` int(11) NOT NULL,
  `id_area` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Union N:M: areas habilitadas para cada integrante del personal.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personal_salud`
--

CREATE TABLE `personal_salud` (
  `id_personal` int(11) NOT NULL,
  `id_rol_profesional` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Subtipo de personas: integrantes del personal de salud.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `personas`
--

CREATE TABLE `personas` (
  `id_persona` int(11) NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `dni` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Datos de identidad comunes a toda persona fisica registrada.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles_profesionales`
--

CREATE TABLE `roles_profesionales` (
  `id_rol_profesional` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Catalogo de roles profesionales del personal de salud.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `turnos`
--

CREATE TABLE `turnos` (
  `id_turno` int(11) NOT NULL,
  `nombre` varchar(30) NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Turnos horarios de cobertura del hospital.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `rol` enum('Administrador','Generico') NOT NULL,
  `id_personal` int(11) DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL DEFAULT current_timestamp(),
  `ultima_actualizacion` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cuentas de acceso al sistema.';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario_permisos`
--

CREATE TABLE `usuario_permisos` (
  `id_usuario` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Union N:M: permisos habilitados por usuario.';

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id_area`),
  ADD UNIQUE KEY `uk_areas_nombre` (`nombre`);

--
-- Indices de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `idx_auditoria_id_usuario` (`id_usuario`),
  ADD KEY `idx_auditoria_entidad_afectada` (`entidad_afectada`,`id_entidad_afectada`),
  ADD KEY `idx_auditoria_fecha_hora` (`fecha_hora`);

--
-- Indices de la tabla `camas`
--
ALTER TABLE `camas`
  ADD PRIMARY KEY (`id_cama`),
  ADD UNIQUE KEY `uk_camas_numero_area` (`id_area`,`numero`),
  ADD KEY `idx_camas_id_area` (`id_area`);

--
-- Indices de la tabla `dispositivos_push`
--
ALTER TABLE `dispositivos_push`
  ADD PRIMARY KEY (`id_dispositivo`),
  ADD UNIQUE KEY `uk_dispositivos_push_token` (`token_push`),
  ADD KEY `idx_dispositivos_push_id_usuario` (`id_usuario`);

--
-- Indices de la tabla `equipos_codigo_azul`
--
ALTER TABLE `equipos_codigo_azul`
  ADD PRIMARY KEY (`id_equipo`),
  ADD UNIQUE KEY `uk_equipos_codigo_azul_nombre` (`nombre`);

--
-- Indices de la tabla `equipo_codigo_azul_personal`
--
ALTER TABLE `equipo_codigo_azul_personal`
  ADD PRIMARY KEY (`id_equipo`,`id_personal`),
  ADD KEY `idx_equipo_codigo_azul_personal_id_personal` (`id_personal`);

--
-- Indices de la tabla `equipo_turno_asignacion`
--
ALTER TABLE `equipo_turno_asignacion`
  ADD PRIMARY KEY (`id_asignacion`),
  ADD KEY `idx_equipo_turno_asignacion_id_equipo` (`id_equipo`),
  ADD KEY `idx_equipo_turno_asignacion_id_turno` (`id_turno`);

--
-- Indices de la tabla `llamados`
--
ALTER TABLE `llamados`
  ADD PRIMARY KEY (`id_llamado`),
  ADD KEY `idx_llamados_id_paciente` (`id_paciente`),
  ADD KEY `idx_llamados_id_origen` (`id_origen`),
  ADD KEY `idx_llamados_id_personal_activacion` (`id_personal_activacion`),
  ADD KEY `idx_llamados_id_usuario_atencion` (`id_usuario_atencion`),
  ADD KEY `idx_llamados_id_equipo_respuesta` (`id_equipo_respuesta`),
  ADD KEY `idx_llamados_estado` (`estado`),
  ADD KEY `idx_llamados_fecha_hora_activacion` (`fecha_hora_activacion`);

--
-- Indices de la tabla `llamado_materiales`
--
ALTER TABLE `llamado_materiales`
  ADD PRIMARY KEY (`id_llamado`,`id_material`),
  ADD KEY `idx_llamado_materiales_id_material` (`id_material`);

--
-- Indices de la tabla `materiales`
--
ALTER TABLE `materiales`
  ADD PRIMARY KEY (`id_material`),
  ADD UNIQUE KEY `uk_materiales_nombre` (`nombre`);

--
-- Indices de la tabla `origenes`
--
ALTER TABLE `origenes`
  ADD PRIMARY KEY (`id_origen`),
  ADD UNIQUE KEY `uk_origenes_descripcion_area` (`id_area`,`descripcion`),
  ADD KEY `idx_origenes_id_area` (`id_area`);

--
-- Indices de la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id_paciente`),
  ADD KEY `idx_pacientes_id_cama` (`id_cama`),
  ADD KEY `idx_pacientes_id_area` (`id_area`),
  ADD KEY `idx_pacientes_id_personal` (`id_personal`),
  ADD KEY `idx_pacientes_activo` (`activo`);

--
-- Indices de la tabla `permisos`
--
ALTER TABLE `permisos`
  ADD PRIMARY KEY (`id_permiso`),
  ADD UNIQUE KEY `uk_permisos_nombre_permiso` (`nombre_permiso`);

--
-- Indices de la tabla `personal_areas`
--
ALTER TABLE `personal_areas`
  ADD PRIMARY KEY (`id_personal`,`id_area`),
  ADD KEY `idx_personal_areas_id_area` (`id_area`);

--
-- Indices de la tabla `personal_salud`
--
ALTER TABLE `personal_salud`
  ADD PRIMARY KEY (`id_personal`),
  ADD KEY `idx_personal_salud_id_rol_profesional` (`id_rol_profesional`);

--
-- Indices de la tabla `personas`
--
ALTER TABLE `personas`
  ADD PRIMARY KEY (`id_persona`),
  ADD UNIQUE KEY `uk_personas_dni` (`dni`);

--
-- Indices de la tabla `roles_profesionales`
--
ALTER TABLE `roles_profesionales`
  ADD PRIMARY KEY (`id_rol_profesional`),
  ADD UNIQUE KEY `uk_roles_profesionales_nombre_rol` (`nombre_rol`);

--
-- Indices de la tabla `turnos`
--
ALTER TABLE `turnos`
  ADD PRIMARY KEY (`id_turno`),
  ADD UNIQUE KEY `uk_turnos_nombre` (`nombre`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uk_usuarios_nombre_usuario` (`nombre_usuario`),
  ADD KEY `idx_usuarios_id_personal` (`id_personal`);

--
-- Indices de la tabla `usuario_permisos`
--
ALTER TABLE `usuario_permisos`
  ADD PRIMARY KEY (`id_usuario`,`id_permiso`),
  ADD KEY `idx_usuario_permisos_id_permiso` (`id_permiso`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `areas`
--
ALTER TABLE `areas`
  MODIFY `id_area` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `camas`
--
ALTER TABLE `camas`
  MODIFY `id_cama` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `dispositivos_push`
--
ALTER TABLE `dispositivos_push`
  MODIFY `id_dispositivo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `equipos_codigo_azul`
--
ALTER TABLE `equipos_codigo_azul`
  MODIFY `id_equipo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `equipo_turno_asignacion`
--
ALTER TABLE `equipo_turno_asignacion`
  MODIFY `id_asignacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `llamados`
--
ALTER TABLE `llamados`
  MODIFY `id_llamado` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `materiales`
--
ALTER TABLE `materiales`
  MODIFY `id_material` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `origenes`
--
ALTER TABLE `origenes`
  MODIFY `id_origen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `permisos`
--
ALTER TABLE `permisos`
  MODIFY `id_permiso` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `personas`
--
ALTER TABLE `personas`
  MODIFY `id_persona` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `roles_profesionales`
--
ALTER TABLE `roles_profesionales`
  MODIFY `id_rol_profesional` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `turnos`
--
ALTER TABLE `turnos`
  MODIFY `id_turno` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `fk_auditoria_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `camas`
--
ALTER TABLE `camas`
  ADD CONSTRAINT `fk_camas_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id_area`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `dispositivos_push`
--
ALTER TABLE `dispositivos_push`
  ADD CONSTRAINT `fk_dispositivos_push_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `equipo_codigo_azul_personal`
--
ALTER TABLE `equipo_codigo_azul_personal`
  ADD CONSTRAINT `fk_equipo_codigo_azul_personal_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipos_codigo_azul` (`id_equipo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_equipo_codigo_azul_personal_personal` FOREIGN KEY (`id_personal`) REFERENCES `personal_salud` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `equipo_turno_asignacion`
--
ALTER TABLE `equipo_turno_asignacion`
  ADD CONSTRAINT `fk_equipo_turno_asignacion_equipo` FOREIGN KEY (`id_equipo`) REFERENCES `equipos_codigo_azul` (`id_equipo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_equipo_turno_asignacion_turno` FOREIGN KEY (`id_turno`) REFERENCES `turnos` (`id_turno`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `llamados`
--
ALTER TABLE `llamados`
  ADD CONSTRAINT `fk_llamados_equipo_respuesta` FOREIGN KEY (`id_equipo_respuesta`) REFERENCES `equipos_codigo_azul` (`id_equipo`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_llamados_origen` FOREIGN KEY (`id_origen`) REFERENCES `origenes` (`id_origen`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_llamados_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_llamados_personal_activacion` FOREIGN KEY (`id_personal_activacion`) REFERENCES `personal_salud` (`id_personal`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_llamados_usuario_atencion` FOREIGN KEY (`id_usuario_atencion`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `llamado_materiales`
--
ALTER TABLE `llamado_materiales`
  ADD CONSTRAINT `fk_llamado_materiales_llamado` FOREIGN KEY (`id_llamado`) REFERENCES `llamados` (`id_llamado`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_llamado_materiales_material` FOREIGN KEY (`id_material`) REFERENCES `materiales` (`id_material`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `origenes`
--
ALTER TABLE `origenes`
  ADD CONSTRAINT `fk_origenes_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id_area`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `fk_pacientes_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id_area`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pacientes_cama` FOREIGN KEY (`id_cama`) REFERENCES `camas` (`id_cama`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pacientes_persona` FOREIGN KEY (`id_paciente`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pacientes_personal` FOREIGN KEY (`id_personal`) REFERENCES `personal_salud` (`id_personal`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `personal_areas`
--
ALTER TABLE `personal_areas`
  ADD CONSTRAINT `fk_personal_areas_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id_area`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_personal_areas_personal` FOREIGN KEY (`id_personal`) REFERENCES `personal_salud` (`id_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `personal_salud`
--
ALTER TABLE `personal_salud`
  ADD CONSTRAINT `fk_personal_salud_persona` FOREIGN KEY (`id_personal`) REFERENCES `personas` (`id_persona`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_personal_salud_rol_profesional` FOREIGN KEY (`id_rol_profesional`) REFERENCES `roles_profesionales` (`id_rol_profesional`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_personal` FOREIGN KEY (`id_personal`) REFERENCES `personal_salud` (`id_personal`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuario_permisos`
--
ALTER TABLE `usuario_permisos`
  ADD CONSTRAINT `fk_usuario_permisos_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_permisos_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
