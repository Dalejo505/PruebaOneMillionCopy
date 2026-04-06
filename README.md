# One Million Copy — API de Leads

API REST para leads de marketing: alta, listado filtrado, estadísticas y resumen ejecutivo (OpenAI o respuesta local cuando no hay clave).

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

### Notas de comportamiento

- **Promedio de presupuesto:** solo entran leads con `presupuesto` informado; si no hay ninguno, `promedioPresupuestoUsd` es `null`.
- **Fechas:** con `YYYY-MM-DD`, `fechaDesde` es inicio de día y `fechaHasta` fin de día (hora local).
- **Resúmenes:** sin `OPENAI_API_KEY` o con `USE_MOCK_AI=true` se genera texto local; con clave y `USE_MOCK_AI` distinto de `true` se usa OpenAI (`OPENAI_MODEL`, por defecto `gpt-4o-mini`).

## Probar endpoints (ejemplos)

```bash
# Crear lead
curl -s -X POST http://localhost:3000/leads -H "Content-Type: application/json" -d "{\"nombre\":\"Prueba API\",\"email\":\"prueba@example.com\",\"fuente\":\"instagram\",\"presupuesto\":99.5}"

# Listar (página 1, 5 por página, filtro por fuente)
curl -s "http://localhost:3000/leads?page=1&limit=5&fuente=instagram"

# Estadísticas
curl -s http://localhost:3000/leads/stats

# Resumen ejecutivo (/leads/ai/summary)
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

## Estructura

- `src/leads/` — CRUD, listados, stats.
- `src/ai/` — `POST /leads/ai/summary` y proveedores de resumen.
- `prisma/` — esquema, migraciones, seed.
