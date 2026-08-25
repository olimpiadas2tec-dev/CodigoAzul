# 🔌 Documentación de la API REST - Backend Código Azul (INEP 2026)

Esta es la especificación oficial de la API backend desarrollada en **PHP Laravel** para el consumo de los desarrolladores del Frontend y la integración con la base de datos MySQL.

---

## 📡 Base URL
- **Desarrollo Local**: `http://localhost:8000/api`
- **Producción (Render)**: `https://gestion-codigoazul.onrender.com/api`

> **CORS**: Habilitado para todos los orígenes (`*`). Se puede consumir directamente desde aplicaciones web React/Vue/Svelte/Vanilla JS o móviles.

---

## 🚀 Endpoints Disponibles

### 1. Módulo: Código Azul (`/api/code-blue`)

#### `GET /api/code-blue`
- **Descripción**: Obtiene el listado completo de eventos de Código Azul.
- **Respuesta `200 OK`**:
```json
[
  {
    "id": 1,
    "location": "Urgencias - Box 2",
    "patient": "Perez, Juan (64a)",
    "team_leader": "Dr. Martinez",
    "status": "RESUELTO",
    "details": "FV revertida exitosamente",
    "duration_seconds": 252,
    "resolved_at": "2026-08-25T14:32:00.000000Z",
    "created_at": "2026-08-25T14:28:00.000000Z"
  }
]
```

#### `POST /api/code-blue`
- **Descripción**: Dispara una nueva alerta de Código Azul.
- **Body (JSON)**:
```json
{
  "location": "Piso 3 - Habitación 304",
  "patient": "Rodriguez, Carlos",
  "team_leader": "Dr. Guardia R1",
  "details": "Paro cardio-respiratorio presenciado"
}
```

#### `PUT /api/code-blue/{id}`
- **Descripción**: Finaliza un Código Azul (ROSC / Resuelto).
- **Body (JSON)**:
```json
{
  "status": "RESUELTO",
  "duration_seconds": 310
}
```

---

### 2. Módulo: Eventos de Reanimación (`/api/code-blue/{id}/events`)

#### `GET /api/code-blue/{id}/events`
- **Descripción**: Obtiene la línea de tiempo de eventos registrados durante el código (ciclos de RCP, medicamentos, descargas).
- **Respuesta `200 OK`**:
```json
[
  {
    "id": 1,
    "code_blue_id": 1,
    "event_type": "SHOCK",
    "description": "Descarga de 200J administrada",
    "elapsed_seconds": 60
  },
  {
    "id": 2,
    "code_blue_id": 1,
    "event_type": "MEDICATION",
    "description": "Adrenalina 1mg IV administrada",
    "elapsed_seconds": 180
  }
]
```

#### `POST /api/code-blue/{id}/events`
- **Descripción**: Agrega un evento a la línea de tiempo.
- **Body (JSON)**:
```json
{
  "event_type": "MEDICATION",
  "description": "Adrenalina 1mg IV",
  "elapsed_seconds": 180
}
```

---

### 3. Módulo: Equipo Médico (`/api/doctors`)

#### `GET /api/doctors`
- **Descripción**: Obtiene el listado de médicos de respuesta rápida y su disponibilidad.

#### `POST /api/doctors`
- **Descripción**: Registra un nuevo profesional al equipo de guardia.

---

### 4. System Health Check (`/health`)
- **GET `/health`**: Verifica que la API en Render esté en línea.
