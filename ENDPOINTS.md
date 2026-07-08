# OsitoPolar API - Endpoints

Base URL: `http://localhost:3000/api/v1`

---

## Health Check

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/health` | Estado del servidor |

---

## Auth `/auth`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Registrar nuevo usuario | No |
| POST | `/auth/login` | Iniciar sesion | No |
| POST | `/auth/refresh` | Renovar access token | No |
| POST | `/auth/logout` | Cerrar sesion | No |

**Body Register:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Body Login:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Body Refresh/Logout:**
```json
{
  "refreshToken": "string"
}
```

---

## Users `/users`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Obtener perfil del usuario | Si |
| PUT | `/users/me` | Actualizar perfil | Si |
| DELETE | `/users/me` | Eliminar cuenta | Si |

---

## Devices `/devices`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/devices` | Listar dispositivos del usuario | Si |
| POST | `/devices` | Crear nuevo dispositivo | Si |
| GET | `/devices/:id` | Obtener dispositivo por ID | Si |
| PUT | `/devices/:id` | Actualizar dispositivo | Si |
| DELETE | `/devices/:id` | Eliminar dispositivo | Si |

**Body Create/Update:**
```json
{
  "name": "string",
  "serialNumber": "string"
}
```

---

## Temperature `/temperature`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/temperature/:deviceId` | Ultima lectura de temperatura | Si |
| GET | `/temperature/:deviceId/history` | Historial de temperaturas | Si |

**Query Params History:**
- `from` - Fecha inicio (ISO 8601)
- `to` - Fecha fin (ISO 8601)
- `page` - Pagina (default: 1)
- `limit` - Resultados por pagina (default: 20)

---

## Humidity `/humidity`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/humidity/:deviceId` | Ultima lectura de humedad | Si |
| GET | `/humidity/:deviceId/history` | Historial de humedad | Si |

**Query Params History:**
- `from` - Fecha inicio (ISO 8601)
- `to` - Fecha fin (ISO 8601)
- `page` - Pagina (default: 1)
- `limit` - Resultados por pagina (default: 20)

---

## Energy `/energy`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/energy/:deviceId` | Ultima lectura de consumo energetico | Si |
| GET | `/energy/:deviceId/history` | Historial de consumo | Si |

**Query Params History:**
- `from` - Fecha inicio (ISO 8601)
- `to` - Fecha fin (ISO 8601)
- `page` - Pagina (default: 1)
- `limit` - Resultados por pagina (default: 20)

---

## Sections `/sections`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/sections` | Listar secciones del usuario | Si |
| POST | `/sections` | Crear seccion (con imagen) | Si |
| GET | `/sections/:id` | Obtener seccion por ID | Si |
| PUT | `/sections/:id` | Actualizar seccion | Si |
| DELETE | `/sections/:id` | Eliminar seccion | Si |

**Body Create/Update (multipart/form-data):**
- `name` - Nombre de la seccion
- `image` - Archivo de imagen

---

## Mappings `/sections/:sectionId/mappings`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/sections/:sectionId/mappings` | Listar mappings de una seccion | Si |
| POST | `/sections/:sectionId/mappings/batch` | Guardar mappings en lote | Si |
| DELETE | `/sections/:sectionId/mappings/:id` | Eliminar mapping | Si |

**Body Batch:**
```json
{
  "mappings": [
    {
      "deviceId": "uuid",
      "x": 100.5,
      "y": 200.3
    }
  ]
}
```

---

## Subscriptions `/subscriptions`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/subscriptions/me` | Obtener suscripcion del usuario | Si |
| POST | `/subscriptions/checkout` | Crear sesion de pago Stripe | Si |

**Body Checkout:**
```json
{
  "planType": "BOUGHT | RENTING | BUSINESS"
}
```

---

## Stripe Webhook

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/webhooks/stripe` | Webhook de Stripe | Stripe Signature |

---

## User Metrics `/metrics`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/metrics` | Listar umbrales del usuario | Si |
| GET | `/metrics/device/:deviceId` | Umbrales de un dispositivo | Si |
| GET | `/metrics/by-apikey/:apiKey` | Umbrales por API key del dispositivo | No |
| POST | `/metrics` | Crear umbral de alerta | Si |
| PUT | `/metrics/:id` | Actualizar umbral | Si |
| DELETE | `/metrics/:id` | Eliminar umbral | Si |

**Body Create/Update:**
```json
{
  "deviceId": "uuid",
  "metricType": "TEMPERATURE | HUMIDITY | ENERGY",
  "inferior": 2.0,
  "superior": 8.0
}
```

---

## Alerts `/alerts`

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| GET | `/alerts` | Listar alertas del usuario | Si |
| GET | `/alerts/unread-count` | Contador de alertas no leidas | Si |
| PATCH | `/alerts/read-all` | Marcar todas como leidas | Si |
| PATCH | `/alerts/:id/read` | Marcar una alerta como leida | Si |

**Query Params List:**
- `page` - Pagina (default: 1)
- `limit` - Resultados por pagina (default: 20)
- `isRead` - Filtrar por estado (true/false)

---

## Ingest `/ingest` (ESP32)

| Metodo | Endpoint | Descripcion | Auth |
|--------|----------|-------------|------|
| POST | `/ingest/reading` | Enviar lectura de sensores | X-Device-Key |
| POST | `/ingest/heartbeat` | Enviar heartbeat del dispositivo | X-Device-Key |

**Header:**
```
X-Device-Key: <device_api_key>
```

**Body Reading:**
```json
{
  "celsius": 4.5,
  "percentage": 65.0,
  "watts": 150.0,
  "voltage": 220.0,
  "current": 0.68
}
```

---

## Tipos de Respuesta

**Exito:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripcion del error"
  }
}
```

---

## Codigos de Error

| Codigo | HTTP | Descripcion |
|--------|------|-------------|
| VALIDATION_ERROR | 400 | Error de validacion |
| UNAUTHORIZED | 401 | No autenticado |
| FORBIDDEN | 403 | Sin permisos |
| NOT_FOUND | 404 | Recurso no encontrado |
| CONFLICT | 409 | Conflicto (ej: email duplicado) |
| INTERNAL_ERROR | 500 | Error interno |
