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

## Funcionamiento

### Arquitectura general

La aplicación sigue el modelo **Server Components + Client Components** de Next.js 16 App Router:

- **Server Components** (por defecto en `app/`): obtienen datos del store, verifican autenticación y renderizan HTML. Ej: `dashboard/page.tsx`, `horarios/page.tsx`.
- **Client Components** (`"use client"`): manejan interactividad, estado local (React hooks), animaciones y envío de formularios. Ej: `WeekScheduleView`, `WorkersTable`, `RequestForm`.
- La comunicación entre ambos lados ocurre mediante **Server Actions** (`actions.ts`), que son funciones asíncronas ejecutadas en el servidor pero invocadas desde el cliente.

### Flujo de autenticación

```
Login (email+password)
  → verifyPassword() busca en store en memoria
  → login() establece cookie httpOnly "app_session" con userId
  → redirect("/dashboard")

Layout protegido (app)/(app)/layout.tsx
  → getCurrentUser() lee la cookie y busca el User en el store
  → Si no hay cookie → redirect("/login")
  → Si hay cookie → renderiza AppShell con datos del usuario

Logout
  → logoutAction() elimina la cookie → redirect("/login")
```

Cada página dentro de `(app)/` puede hacer verificaciones adicionales de rol:
- `trabajadores/page.tsx` redirige si `user.role === "WORKER"`
- `configuracion/page.tsx` redirige si `user.role !== "ADMIN"`

El **Sidebar** también filera los enlaces visibles según el rol del usuario.

### Almacenamiento en memoria

No se requiere base de datos. Los datos viven en `globalThis.__APP_DATA__`:

```
globalThis.__APP_DATA__ = {
  users: User[]           // 8 usuarios semilla
  shifts: Shift[]         // 20 turnos para la semana actual
  requests: ShiftRequest[]// 1 solicitud pendiente
  auditLogs: AuditLog[]
  settings: AppSettings   // límites configurables
  passwords: Record<string, string>
  seq: number             // contador autoincremental para IDs
}
```

- Al arrancar la app por primera vez, `getStore()` ejecuta `buildSeed()`, que genera la semana actual dinámicamente (toma el lunes de esta semana y crea turnos a partir de esa fecha).
- Los datos persisten mientras el servidor esté activo. Al detener el servidor (`Ctrl+C`) se pierden y se regeneran al reiniciar.
- Para resetear los datos sin reiniciar: no hay un botón en la UI, pero existe `resetData()` en `data.ts`.
- El esquema Prisma (`prisma/schema.prisma`) está listo para migrar a PostgreSQL cuando se desee.

### Flujo de datos (CRUD)

```
Cliente (formulario)
  → Server Action (actions.ts)
    → Valida con Zod (safeParse)
    → Operación en store (createUser, updateShift, resolveRequest, etc.)
    → addAuditLog() para trazabilidad
    → revalidatePath() para refrescar datos del servidor
    → Retorna { ok: true } o { ok: false, error }
  → Cliente recibe respuesta
    → toast.success() o toast.error()
    → router.refresh() para actualizar la UI
```

### Sistema de roles

| Rol         | Dashboard | Trabajadores | Horarios | Solicitudes | Reportes | Configuración |
|-------------|-----------|--------------|----------|-------------|----------|---------------|
| ADMIN       | ✅        | ✅ CRUD      | ✅ CRUD  | ✅ aprueba  | ✅       | ✅            |
| SUPERVISOR  | ✅        | ✅ CRUD      | ✅ CRUD  | ✅ aprueba  | ✅       | ❌            |
| WORKER      | ✅ propio | ❌           | ✅ ver   | ✅ envía    | ❌       | ❌            |

### Decisiones técnicas importantes

- **Zod 4 + @hookform/resolvers**: conviven con `as any` en el resolver (`zodResolver()`), necesario porque `@hookform/resolvers` v5 está diseñado para Zod 3. No afecta la validación.
- **ScrollReveal.js** (v4.0.9): no tiene tipos TypeScript ni export ESM. Se importa como `import ScrollReveal from "scrollreveal"` y funciona por la configuración `skipLibCheck: true` en `tsconfig.json`.
- **next/headers cookies()**: en Next.js 16 es asíncrono (`const store = await cookies()`). Todas las funciones de `session.ts` ya lo manejan así.
- **searchParams**: en Next.js 16, `searchParams` es una Promise (`Promise<{ ... }>`). Se debe `await` antes de acceder a sus propiedades.
- **RevalidatePath vs router.refresh()**: las Server Actions usan `revalidatePath()` para refrescar datos en el servidor. Los componentes cliente llaman `router.refresh()` después de una acción exitosa para sincronizar la UI.

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
