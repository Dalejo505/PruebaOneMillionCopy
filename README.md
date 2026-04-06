# One Million Copy — API de Leads

Backend REST para registrar y consultar **leads** de embudos de marketing, con estadísticas y **resumen ejecutivo** vía LLM (OpenAI) o **mock documentado** sin costo.

## Tecnologías

| Elección | Motivo |
|----------|--------|
| **Node.js + TypeScript** | Tipado, ecosistema maduro para APIs. |
| **NestJS** | Módulos, inyección de dependencias, validación y Swagger integrables con poco código repetido. |
| **Prisma + PostgreSQL** | Modelo explícito, migraciones versionadas y seed reproducible. |
| **class-validator** | Reglas de negocio en DTOs con mensajes claros y códigos HTTP coherentes. |

## Requisitos

- Node.js 20+
- PostgreSQL 14+ (o Docker)

## Instalación local

1. Clonar el repositorio e instalar dependencias:

   ```bash
   npm ci
   ```

2. Copiar variables de entorno:

   ```bash
   copy .env.example .env
   ```

   En Linux/macOS: `cp .env.example .env`

3. Levantar PostgreSQL (si usas Docker solo para la BD):

   ```bash
   docker compose up -d postgres
   ```

4. Aplicar migraciones y semilla (12 leads de ejemplo):

   ```bash
   npx prisma migrate deploy
   npm run db:seed
   ```

5. Arrancar en desarrollo:

   ```bash
   npm run start:dev
   ```

La API queda en `http://localhost:3000` y la documentación OpenAPI en **`http://localhost:3000/docs`**.

## Docker (app + base de datos)

Con Docker Desktop (u otro motor) levantando el demonio:

```bash
docker compose up --build
```

Esto aplica migraciones al iniciar el contenedor `api`. Para cargar datos de ejemplo desde tu máquina (misma `DATABASE_URL` apuntando a `localhost:5432`):

```bash
npm run db:seed
```

## Endpoints principales

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/leads` | Crear lead (email único, `fuente` enum, etc.) |
| `GET` | `/leads` | Listado: `page`, `limit`, `fuente`, `fechaDesde`, `fechaHasta` (orden: más recientes primero) |
| `GET` | `/leads/stats` | Totales, conteo por fuente, promedio de presupuesto (solo leads con `presupuesto` no nulo), últimos 7 días |
| `GET` | `/leads/:id` | Detalle |
| `PATCH` | `/leads/:id` | Actualización parcial |
| `DELETE` | `/leads/:id` | Soft delete (`204 No Content`) |
| `POST` | `/leads/ai/summary` | Cuerpo JSON opcional: `fuente`, `fechaDesde`, `fechaHasta` — devuelve `{ "resumen": "..." }` |

### Fuentes permitidas (`fuente`)

`instagram`, `facebook`, `landing_page`, `referido`, `otro`

### Decisiones documentadas

- **Promedio de presupuesto:** solo se promedian registros con `presupuesto` definido; si ninguno tiene valor, la API devuelve `null` en `promedioPresupuestoUsd`.
- **Fechas:** si envías solo la fecha (`YYYY-MM-DD`), `fechaDesde` se interpreta al inicio del día y `fechaHasta` al final del día (hora local).
- **IA:** con `USE_MOCK_AI=true` o sin `OPENAI_API_KEY` se usa `MockLlmProvider`. Con clave y `USE_MOCK_AI` distinto de `true`, se llama a la API de OpenAI (`OPENAI_MODEL` por defecto `gpt-4o-mini`).

## Probar endpoints (ejemplos)

```bash
# Crear lead
curl -s -X POST http://localhost:3000/leads -H "Content-Type: application/json" -d "{\"nombre\":\"Prueba API\",\"email\":\"prueba@example.com\",\"fuente\":\"instagram\",\"presupuesto\":99.5}"

# Listar (página 1, 5 por página, filtro por fuente)
curl -s "http://localhost:3000/leads?page=1&limit=5&fuente=instagram"

# Estadísticas
curl -s http://localhost:3000/leads/stats

# Resumen IA (mock por defecto)
curl -s -X POST http://localhost:3000/leads/ai/summary -H "Content-Type: application/json" -d "{\"fuente\":\"instagram\"}"
```

## Scripts útiles

| Script | Uso |
|--------|-----|
| `npm run start:dev` | Desarrollo con recarga |
| `npm run build` | Compilar |
| `npm run start:prod` | Ejecutar `dist/main.js` |
| `npm test` | Tests unitarios |
| `npm run db:migrate` | Aplicar migraciones (producción) |
| `npm run db:seed` | Ejecutar seed Prisma |
| `npm run db:studio` | Prisma Studio |

## Estructura relevante

- `src/leads/` — CRUD, consultas y estadísticas.
- `src/ai/` — `POST /leads/ai/summary`, contrato `LlmPort`, implementaciones **mock** y **OpenAI**.
- `prisma/` — Esquema, migraciones y `seed.ts`.

## Entrega

Incluye `.env.example` (sin secretos reales) y este README. Los commits frecuentes en GitHub forman parte de la evaluación del proceso.
