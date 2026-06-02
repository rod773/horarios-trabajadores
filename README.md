# App Trabajadores — Gestión de horarios

Aplicación web para gestionar los horarios y turnos de los trabajadores, construida con **Next.js 16**, **TypeScript**, **TailwindCSS** y **shadcn/ui**, con animaciones de **Framer Motion** y **GSAP**.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **TailwindCSS 4** + **shadcn/ui** (Radix UI primitives)
- **Framer Motion** (transiciones de página, modales, micro-interacciones)
- **GSAP + ScrollTrigger** (efectos de scroll en hero, parallax)
- **ScrollReveal.js** (reveal on scroll)
- **Animate.js** vía CSS keyframes personalizadas (`animate-fade-in`, `animate-slide-up`, `shimmer`)
- **Zod + React Hook Form** (validación de formularios)
- **Prisma** (modelo de datos y migraciones)
- **Sonner** (toasts)
- **Lucide React** (iconografía)

> Para esta demo se incluye un **store en memoria** (`src/lib/data.ts`) con seed automático al iniciar la app, lo que evita depender de un servidor de base de datos PostgreSQL. El esquema Prisma está incluido y es compatible con el switch a PostgreSQL cambiando el `provider` y la `DATABASE_URL`.

## Requisitos

- Node.js **20.9+**
- npm, yarn, pnpm o bun

## Instalación

```bash
yarn install
# o
npm install
```

## Desarrollo

```bash
yarn dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Serás redirigido a la pantalla de **login**.

## Cuentas de demostración

| Rol            | Email                    | Password   |
| -------------- | ------------------------ | ---------- |
| Administrador  | `admin@empresa.com`      | `admin123` |
| Supervisor     | `supervisor@empresa.com` | `super123` |
| Trabajador     | `maria@empresa.com`      | `worker123` |
| Trabajador     | `javier@empresa.com`     | `worker123` |
| Trabajador     | `carla@empresa.com`      | `worker123` |
| Trabajador     | `diego@empresa.com`      | `worker123` |
| Trabajador     | `elena@empresa.com`      | `worker123` |
| Trabajador     | `pablo@empresa.com`      | `worker123` |

## Funcionalidades

### Autenticación y roles
- 3 roles: **Admin**, **Supervisor**, **Trabajador**
- Login con cookies httpOnly (compatible con Server Actions)
- Rutas protegidas y contenido adaptado por rol

### Dashboard
- Métricas rápidas (trabajadores, turnos, solicitudes, equipos)
- Progreso semanal del usuario
- Próximos turnos y solicitudes recientes
- Animaciones: GSAP parallax en el hero, ScrollReveal en tarjetas

### Trabajadores
- CRUD completo con búsqueda y filtros
- Validación con Zod
- Asignación de horas objetivo semanales y equipo
- Diálogos modales con animación de Framer Motion

### Horarios
- **Vista semanal** tipo calendario con 7 columnas (lun–dom)
- Bloques de turno coloreados por tipo (Normal / Descanso / Vacaciones / Extra)
- **Filtros** por trabajador y equipo
- Navegación entre semanas con URL state
- **Modal** para crear/editar turnos con validación:
  - Hora fin > hora inicio
  - No permite solapamientos (con tolerancia configurable)
  - Respeta el máximo de horas por día
- Confirmación al eliminar

### Solicitudes
- Trabajadores pueden enviar:
  - **Intercambio de turno** (origen + propuesto)
  - **Cambio de horario / ajuste**
  - **Vacaciones**
- Supervisores / Admin pueden **aprobar** o **rechazar** solicitudes pendientes
- Tabs: Todas / Mías / Pendientes
- Auditoría (fecha, motivo, resolución)

### Reportes
- Resumen por trabajador con horas totales, horas extra, horas por tipo
- Filtros por rango de fechas y trabajador
- **Exportación a CSV** (resumen agregado y detalle por turno)
- Endpoint API: `GET /api/reports?from=YYYY-MM-DD&to=YYYY-MM-DD&format=csv`

### Configuración (solo Admin)
- Máximo de horas por día
- Máximo de horas por semana
- Mínimo descanso entre turnos
- Tolerancia de solapamiento (minutos)

## Estructura del proyecto

```
src/
├── app/
│   ├── (app)/                  # Rutas protegidas con sidebar
│   │   ├── dashboard/
│   │   ├── trabajadores/
│   │   ├── horarios/
│   │   ├── solicitudes/
│   │   ├── reportes/
│   │   └── configuracion/
│   ├── api/                    # API routes REST
│   │   ├── auth/
│   │   ├── workers/
│   │   ├── shifts/
│   │   ├── requests/
│   │   └── reports/
│   ├── login/
│   ├── actions.ts              # Server Actions
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── ui/                     # shadcn (button, card, dialog, etc.)
│   ├── layout/                 # AppShell, Sidebar, Topbar
│   ├── animations/             # Framer Motion, GSAP, ScrollReveal
│   ├── auth/
│   ├── workers/
│   ├── shifts/
│   ├── requests/
│   ├── reports/
│   ├── config/
│   └── providers.tsx
├── lib/
│   ├── data.ts                 # In-memory store + Prisma helpers
│   ├── session.ts              # Cookies / sesión
│   ├── types.ts
│   ├── validations.ts          # Esquemas Zod
│   └── utils.ts                # cn(), formatHours, etc.
└── generated/                  # Prisma Client generado
prisma/
├── schema.prisma               # Modelo de datos
├── seed.ts                     # Inicializa el store con datos
└── migrations/
```

## API Endpoints

| Método | Ruta                | Descripción                          | Rol             |
| ------ | ------------------- | ------------------------------------ | --------------- |
| POST   | `/api/auth`         | Login (JSON)                         | público         |
| GET    | `/api/auth`         | Usuario actual                       | autenticado     |
| GET    | `/api/workers`      | Listar trabajadores                  | Admin/Supervisor|
| GET    | `/api/shifts`       | Listar turnos (`?from=&to=&workerId=`)| autenticado    |
| GET    | `/api/requests`     | Listar solicitudes                   | autenticado     |
| GET    | `/api/reports`      | Reporte en JSON o CSV                | Admin/Supervisor|

## Animaciones incluidas

- **Transiciones de página**: `AnimatePresence` con `framer-motion` envolviendo `{children}` en el shell
- **Modal / Diálogos**: Radix Dialog con animaciones de fade + zoom
- **Micro-interacciones**: `whileHover`, `whileTap` en cards y botones
- **Scroll**: `GsapReveal` (GSAP + ScrollTrigger) en secciones y cards
- **ScrollReveal.js**: en elementos sueltos (`ScrollRevealBox`)
- **Parallax**: `GsapParallax` en el hero del dashboard
- **Skeleton shimmer** durante carga
- **`prefers-reduced-motion`**: se respeta para accesibilidad

## Migrar a PostgreSQL (opcional)

El proyecto incluye `prisma/schema.prisma` con el modelo completo. Para activarlo:

1. Cambia el provider en `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Configura `DATABASE_URL` en `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@localhost:5432/mi_db"
   ```
3. Ejecuta las migraciones:
   ```bash
   yarn prisma migrate dev
   ```
4. Reemplaza las funciones de `src/lib/data.ts` por queries Prisma equivalentes.

## Licencia

MIT
