# 🔌 Documentación de la API REST - Backend Código Azul (INEP 2026)

Esta es la especificación oficial de la API backend desarrollada en **PHP Laravel** para el consumo de los desarrolladores del Frontend (Web / Mobile).

---

## 📡 Base URL
- **Desarrollo Local**: `http://localhost:8000/api`
- **Producción (Render)**: `https://gestion-codigoazul.onrender.com/api`

> **CORS**: Habilitado para todos los orígenes (`*`). Puedes consumir la API desde cualquier servidor local (`localhost:3000`, `localhost:5173`, etc.).

---

## 🚀 Endpoints Disponibles

### 1. Obtener Lista de Códigos Azules
- **Método**: `GET`
- **URL**: `/api/code-blue`
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
    "created_at": "2026-08-25T14:28:00.000000Z",
    "updated_at": "2026-08-25T14:32:00.000000Z"
  }
]
```

---

### 2. Disparar / Activar Nuevo Código Azul
- **Método**: `POST`
- **URL**: `/api/code-blue`
- **Body (JSON)**:
```json
{
  "location": "Piso 3 - Habitación 304",
  "patient": "Rodriguez, Carlos",
  "team_leader": "Dr. Guardia R1",
  "details": "Paciente en paro cardio-respiratorio detectado por enfermería"
}
```
- **Campos**:
  - `location` *(Requerido, string)*: Ubicación o sector de la emergencia.
  - `patient` *(Opcional, string)*: Nombre o HC del paciente.
  - `team_leader` *(Opcional, string)*: Médico a cargo.
  - `details` *(Opcional, string)*: Observaciones adicionales.

- **Respuesta `201 Created`**:
```json
{
  "message": "🚨 Código Azul registrado exitosamente",
  "data": {
    "id": 3,
    "location": "Piso 3 - Habitación 304",
    "patient": "Rodriguez, Carlos",
    "team_leader": "Dr. Guardia R1",
    "status": "ACTIVO",
    "created_at": "2026-08-25T17:00:00.000000Z"
  }
}
```

---

### 3. Obtener Detalle de un Código Azul
- **Método**: `GET`
- **URL**: `/api/code-blue/{id}`
- **Respuesta `200 OK`**:
```json
{
  "id": 1,
  "location": "Urgencias - Box 2",
  "patient": "Perez, Juan (64a)",
  "team_leader": "Dr. Martinez",
  "status": "RESUELTO",
  "duration_seconds": 252
}
```

---

### 4. Finalizar / Actualizar Estado del Código Azul
- **Método**: `PUT`
- **URL**: `/api/code-blue/{id}`
- **Body (JSON)**:
```json
{
  "status": "RESUELTO",
  "duration_seconds": 310
}
```
- **Respuesta `200 OK`**:
```json
{
  "message": "🟢 Código Azul finalizado",
  "data": {
    "id": 1,
    "status": "RESUELTO",
    "duration_seconds": 310,
    "resolved_at": "2026-08-25T17:05:00.000000Z"
  }
}
```

---

### 5. Verificación de Salud del Servidor (Health Check)
- **Método**: `GET`
- **URL**: `/health`
- **Respuesta `200 OK`**:
```json
{
  "status": "OK",
  "service": "Gestion-CodigoAzul",
  "environment": "production",
  "timestamp": "2026-08-25T17:00:00Z"
}
```
