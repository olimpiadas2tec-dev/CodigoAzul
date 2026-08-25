# 🚨 Sistema de Gestión de Código Azul (INEP 2026)

Este repositorio contiene la plataforma web de gestión, cronometraje y activación en tiempo real del **Código Azul** (paros cardiorrespiratorios hospitalarios), desarrollado para las **Olimpiadas de Programación INEP 2026**.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3 vanilla (Modern Dark Glassmorphism, Responsive UI), JavaScript ES6+
- **Backend**: PHP 8.2+ (Laravel Framework)
- **Base de Datos**: MySQL
- **Contenedores y Despliegue**: Docker & Render PaaS (`render.yaml` Blueprint)

---

## 🚀 Despliegue en Render (PaaS)

Este proyecto está listo para desplegarse automáticamente en **Render** sin configuración manual.

### Opción 1: Mediante Render Blueprint (Recomendado)
1. En el panel de Render, selecciona **New +** -> **Blueprint**.
2. Conecta la cuenta de GitHub `CodigoAzulTec2` y selecciona el repositorio `Gestion-CodigoAzul`.
3. Render detectará automáticamente el archivo `render.yaml` y desplegará la aplicación web en minutos.

### Opción 2: Web Service Manual en Render
- **Environment**: Docker
- **Dockerfile Path**: `./Dockerfile`
- **Health Check Path**: `/`
- **Variables de Entorno Mínimas**:
  - `APP_KEY`: `base64:eW91cmNvb2xhcHBrZXlmb3JsYXJhdmVsMjAyNnNlY3VyZQ==`
  - `APP_ENV`: `production`
  - `DB_CONNECTION`: `mysql`

---

## 💻 Desarrollo Local

```bash
# 1. Clonar repositorio
git clone https://github.com/CodigoAzulTec2/Gestion-CodigoAzul.git
cd Gestion-CodigoAzul

# 2. Instalar dependencias (si tienes Composer instalado)
composer install

# 3. Configurar entorno
cp .env.example .env

# 4. Iniciar servidor de desarrollo
php artisan serve
# O bien utilizando el servidor incorporado de Node / PHP:
npm start
```

---

## 📋 Funcionalidades Principales

1. **Panel de Despacho de Emergencias**: Disparo rápido de alerta por sector, habitación y médico a cargo.
2. **Cronómetro Activo de CPR**: Conteo en tiempo real de minutos y segundos desde la activación del código.
3. **Registro Histórico de Eventos**: Tabla interactiva con estado (ACTIVO / RESUELTO / ROSC).
4. **API RESTful**: Endpoints en `/api/code-blue` para integración móvil o pantallas en guardias hospitalarias.

---

## 👥 Equipo
- **Organización**: Olimpiadas de Programación INEP 2026
- **Cuenta GitHub**: `CodigoAzulTec2`
