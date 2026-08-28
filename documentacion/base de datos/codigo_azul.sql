-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 25, 2026 at 10:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `codigo_azul`
--

-- --------------------------------------------------------

--
-- Table structure for table `areas`
--

CREATE TABLE `areas` (
  `id_area` int(10) UNSIGNED NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `cantidad_camas` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enfermeros`
--

CREATE TABLE `enfermeros` (
  `id_enfermero` int(10) UNSIGNED NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `dni` varchar(15) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `enfermeros_areas`
--

CREATE TABLE `enfermeros_areas` (
  `id_enfermero` int(10) UNSIGNED NOT NULL,
  `id_area` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `llamados`
--

CREATE TABLE `llamados` (
  `id_llamado` int(10) UNSIGNED NOT NULL,
  `fecha_hora_activacion` datetime NOT NULL DEFAULT current_timestamp(),
  `fecha_hora_atencion` datetime DEFAULT NULL,
  `estado` enum('Sin atender','Atendido') NOT NULL DEFAULT 'Sin atender',
  `id_paciente` int(10) UNSIGNED NOT NULL,
  `id_origen` int(10) UNSIGNED NOT NULL,
  `id_usuario_atencion` int(10) UNSIGNED DEFAULT NULL
) ;

-- --------------------------------------------------------

--
-- Table structure for table `origenes`
--

CREATE TABLE `origenes` (
  `id_origen` int(10) UNSIGNED NOT NULL,
  `descripcion` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pacientes`
--

CREATE TABLE `pacientes` (
  `id_paciente` int(10) UNSIGNED NOT NULL,
  `apellido` varchar(50) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  `dni` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `grupo_sanguineo` varchar(5) DEFAULT NULL,
  `alergias` varchar(255) DEFAULT NULL,
  `diagnostico` varchar(255) DEFAULT NULL,
  `numero_cama` varchar(10) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL DEFAULT curdate(),
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `id_area` int(10) UNSIGNED NOT NULL,
  `id_enfermero` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(10) UNSIGNED NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `rol` enum('Administrador','Generico') NOT NULL DEFAULT 'Generico',
  `id_enfermero` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`id_area`);

--
-- Indexes for table `enfermeros`
--
ALTER TABLE `enfermeros`
  ADD PRIMARY KEY (`id_enfermero`),
  ADD UNIQUE KEY `uk_enfermeros_dni` (`dni`);

--
-- Indexes for table `enfermeros_areas`
--
ALTER TABLE `enfermeros_areas`
  ADD PRIMARY KEY (`id_enfermero`,`id_area`),
  ADD KEY `fk_enfermeros_areas_area` (`id_area`);

--
-- Indexes for table `llamados`
--
ALTER TABLE `llamados`
  ADD PRIMARY KEY (`id_llamado`),
  ADD KEY `fk_llamados_paciente` (`id_paciente`),
  ADD KEY `fk_llamados_origen` (`id_origen`),
  ADD KEY `fk_llamados_usuario_atencion` (`id_usuario_atencion`),
  ADD KEY `idx_llamados_estado` (`estado`),
  ADD KEY `idx_llamados_fecha_activacion` (`fecha_hora_activacion`),
  ADD KEY `idx_llamados_estado_fecha` (`estado`,`fecha_hora_activacion`);

--
-- Indexes for table `origenes`
--
ALTER TABLE `origenes`
  ADD PRIMARY KEY (`id_origen`),
  ADD UNIQUE KEY `uk_origenes_descripcion` (`descripcion`);

--
-- Indexes for table `pacientes`
--
ALTER TABLE `pacientes`
  ADD PRIMARY KEY (`id_paciente`),
  ADD UNIQUE KEY `uk_pacientes_dni` (`dni`),
  ADD KEY `fk_pacientes_area` (`id_area`),
  ADD KEY `fk_pacientes_enfermero` (`id_enfermero`),
  ADD KEY `idx_pacientes_activo` (`activo`);

--
-- Indexes for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uk_usuarios_nombre_usuario` (`nombre_usuario`),
  ADD KEY `fk_usuarios_enfermero` (`id_enfermero`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `areas`
--
ALTER TABLE `areas`
  MODIFY `id_area` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `enfermeros`
--
ALTER TABLE `enfermeros`
  MODIFY `id_enfermero` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `llamados`
--
ALTER TABLE `llamados`
  MODIFY `id_llamado` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `origenes`
--
ALTER TABLE `origenes`
  MODIFY `id_origen` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pacientes`
--
ALTER TABLE `pacientes`
  MODIFY `id_paciente` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `enfermeros_areas`
--
ALTER TABLE `enfermeros_areas`
  ADD CONSTRAINT `fk_enfermeros_areas_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id_area`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_enfermeros_areas_enfermero` FOREIGN KEY (`id_enfermero`) REFERENCES `enfermeros` (`id_enfermero`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `llamados`
--
ALTER TABLE `llamados`
  ADD CONSTRAINT `fk_llamados_origen` FOREIGN KEY (`id_origen`) REFERENCES `origenes` (`id_origen`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_llamados_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id_paciente`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_llamados_usuario_atencion` FOREIGN KEY (`id_usuario_atencion`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `pacientes`
--
ALTER TABLE `pacientes`
  ADD CONSTRAINT `fk_pacientes_area` FOREIGN KEY (`id_area`) REFERENCES `areas` (`id_area`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pacientes_enfermero` FOREIGN KEY (`id_enfermero`) REFERENCES `enfermeros` (`id_enfermero`) ON UPDATE CASCADE;

--
-- Constraints for table `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_enfermero` FOREIGN KEY (`id_enfermero`) REFERENCES `enfermeros` (`id_enfermero`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
