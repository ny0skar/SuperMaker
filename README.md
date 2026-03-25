# SuperMaker

App de lista de compras del supermercado para iOS y Android. Mercado objetivo: Mexico.

## Stack Tecnologico

| Capa | Tecnologia |
|------|-----------|
| **Frontend movil** | Expo SDK 54 (React Native 0.81) + TypeScript |
| **Backend API** | Express 4 + TypeScript (ESM) |
| **ORM** | Prisma 6 |
| **Base de datos** | PostgreSQL |
| **Autenticacion** | JWT (access + refresh tokens) con bcrypt |
| **Estado (mobile)** | Zustand 5 |
| **Internacionalizacion** | i18next + expo-localization |
| **Monorepo** | npm workspaces (`packages/*`, `server`) |

> **Nota:** `apps/mobile` esta **fuera** del workspace de npm intencionalmente para evitar duplicacion de React en el bundle de Expo.

## Estructura del Proyecto

```
SuperMaker/
├── apps/
│   └── mobile/                # App Expo (React Native)
│       ├── app/               # Expo Router (file-based routing)
│       │   ├── (auth)/        # Login, Register
│       │   ├── (tabs)/        # Tabs principales
│       │   │   ├── stores.tsx     # Gestion de tiendas
│       │   │   ├── cart.tsx       # Carrito de compras activo
│       │   │   ├── dashboard.tsx  # Dashboard premium (analytics)
│       │   │   ├── history.tsx    # Historial de visitas
│       │   │   └── profile.tsx    # Perfil de usuario
│       │   └── visit/
│       │       └── [id].tsx   # Detalle de visita
│       ├── components/        # Componentes reutilizables
│       ├── hooks/             # Custom hooks
│       ├── i18n/              # Traducciones (es/en)
│       ├── services/          # API client (axios)
│       ├── store/             # Zustand stores
│       └── theme/             # Tema y colores
├── packages/
│   └── shared/                # Tipos y utilidades compartidas
├── server/
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── migrations/        # Migraciones
│   └── src/
│       ├── controllers/       # Auth, Store, Visit, Analytics
│       ├── routes/            # Definicion de rutas Express
│       ├── middleware/        # Auth middleware (JWT)
│       ├── services/          # Logica de negocio
│       └── utils/             # Utilidades
├── backups/                   # Respaldos de base de datos
└── supermaker_design/         # Assets de diseno
```

## Modelo de Datos (PostgreSQL)

- **User** — email, passwordHash, displayName, plan (FREE/PREMIUM), planExpiresAt
- **Store** — nombre de tienda, pertenece a un User
- **Visit** — visita a una tienda, status (ACTIVE/FINISHED), total
- **VisitItem** — producto comprado, precio, cantidad, unidad (PIECE/KG/G/L/ML), subtotal, expiresAt, barcode

## API Endpoints

| Grupo | Endpoints |
|-------|-----------|
| **Auth** | POST `/auth/register`, POST `/auth/login`, POST `/auth/refresh` |
| **Stores** | CRUD `/stores` |
| **Visits** | CRUD `/visits`, items management |
| **Analytics** | GET `/analytics/*` (dashboard premium) |

Todos los endpoints (excepto auth) requieren header `Authorization: Bearer <token>`.

## Modelo Freemium

| Feature | Free | Premium |
|---------|------|---------|
| Tiendas | 1 max | Ilimitadas |
| Articulos por visita | 15 max | Ilimitados |
| Historial de compras | No (efimero) | Si |
| Dashboard analytics | No | Si |
| Escaneo de tickets (OCR) | No | Si (pendiente) |
| Modo offline | No | Si (pendiente) |

**Precio objetivo:** $49 MXN/mes o $449 MXN/ano

## Requisitos Previos

- **Node.js** >= 18
- **PostgreSQL** (local o remoto)
- **Expo Go** app en tu telefono (iOS/Android)
- **npm** (incluido con Node.js)

## Instalacion

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd SuperMaker
```

### 2. Instalar dependencias

```bash
# Dependencias del monorepo (server + packages)
npm install

# Dependencias de la app movil (fuera del workspace)
cd apps/mobile
npm install
cd ../..
```

### 3. Configurar la base de datos

```bash
# Crear usuario y base de datos en PostgreSQL
psql -U postgres
CREATE USER supermaker_app WITH PASSWORD 'tu-password';
CREATE DATABASE supermaker_db OWNER supermaker_app;
\q
```

### 4. Configurar variables de entorno

```bash
cp server/.env.example server/.env
# Editar server/.env con tus credenciales de PostgreSQL y secretos JWT
```

### 5. Ejecutar migraciones

```bash
npm run db:migrate
```

### 6. (Opcional) Restaurar backup de base de datos

```bash
PGPASSWORD=tu-password psql -U supermaker_app -d supermaker_db < backups/supermaker_db_2026-03-25.sql
```

## Levantar el Proyecto

Se necesitan **2 terminales**:

### Terminal 1 — Backend (Express API en puerto 4000)

```bash
npm run dev:server
```

### Terminal 2 — App Movil (Expo Dev Server)

```bash
cd apps/mobile
npx expo start -c
```

Escanea el QR code con **Expo Go** en tu telefono. Asegurate de estar en la misma red WiFi que tu computadora.

## Scripts Disponibles

| Script | Descripcion |
|--------|-------------|
| `npm run dev:server` | Inicia el backend en modo desarrollo (hot reload) |
| `npm run build:server` | Compila TypeScript del server |
| `npm run db:migrate` | Ejecuta migraciones de Prisma |
| `npm run db:generate` | Regenera el Prisma Client |
| `npm run db:studio` | Abre Prisma Studio (GUI para la DB) |

## Estado del Desarrollo

- [x] **Fase 1** — Backend + Auth (JWT, registro, login, refresh)
- [x] **Fase 2** — App movil base (navegacion, tabs, tema, i18n)
- [x] **Fase 3** — CRUD core (tiendas, visitas, items del carrito)
- [ ] **Fase 4** — Features Premium (parcial)
  - [x] Backend analytics (4 endpoints)
  - [x] Dashboard premium con grafica de barras
  - [x] Historial con paginacion
  - [x] Pantalla detalle de visita
  - [ ] Suscripciones (RevenueCat)
  - [ ] Notificaciones push
  - [ ] Modo offline
- [ ] **Fase 5** — Escaneo de tickets (OCR)
- [ ] **Fase 6** — Publicacion en App Store / Google Play

## Notas para Despliegue a Produccion

Elementos que se necesitan evaluar para produccion:

- **Hosting del backend:** El server Express actualmente corre en local. Se necesita un servicio (Railway, Render, AWS, etc.)
- **Base de datos:** PostgreSQL actualmente es local. Se necesita una instancia gestionada (Supabase, Neon, RDS, etc.)
- **Variables de entorno:** Los JWT secrets deben ser generados de forma segura para produccion
- **HTTPS:** El backend no tiene SSL configurado; se necesita un reverse proxy o servicio que lo provea
- **Build nativo:** Para publicar en stores se requiere `eas build` (Expo Application Services)
- **Suscripciones:** Falta integracion con RevenueCat o similar para pagos in-app
- **CI/CD:** No hay pipeline de integracion/despliegue automatizado
- **Monitoreo:** No hay logging estructurado ni monitoreo de errores (Sentry, etc.)
- **Rate limiting:** Existe `express-rate-limit` pero necesita revision para produccion
- **CORS:** Revisar configuracion de CORS para dominios de produccion
- **Backups automaticos:** Solo hay backup manual; se necesita estrategia de backups automaticos
