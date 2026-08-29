# 📢 Sistema de Comunicados administrativo

Aplicación web full-stack (MERN) para la gestión integral de comunicaciones corporativas de administrativo. Permite crear, editar, visualizar, eliminar y monitorear comunicados internos con estados, prioridades y categorías.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías](#tecnologías)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación y Configuración](#instalación-y-configuración)
6. [Ejecución](#ejecución)
7. [API Backend](#api-backend)
8. [Modelo de Datos](#modelo-de-datos)
9. [Arquitectura Frontend](#arquitectura-frontend)
10. [Principios SOLID Aplicados](#principios-solid-aplicados)
11. [Rutas de la Aplicación](#rutas-de-la-aplicación)
12. [Scripts Disponibles](#scripts-disponibles)
13. [Variables de Entorno](#variables-de-entorno)
14. [Despliegue en Vercel](#despliegue-en-vercel)
15. [Contribución](#contribución)

---

## 🚀 Descripción General

El **Sistema de Comunicados administrativo** es una plataforma interna que permite al equipo administrativo:

- 📊 **Dashboard** con métricas en tiempo real (total de comunicados, publicados, borradores, alta prioridad).
- 📝 **Crear** comunicados con título, categoría, prioridad, descripción y publicación inmediata.
- ✏️ **Editar** comunicados existentes.
- 👁️ **Ver** el detalle completo de cada comunicado.
- 🗑️ **Eliminar** comunicados con confirmación.
- 🔌 **Monitoreo** del estado de conexión del backend y la base de datos.

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | ^19.2.7 | Librería UI |
| **TypeScript** | ~6.0.2 | Tipado estático |
| **Vite** | ^8.1.1 | Bundler / Dev server |
| **React Router DOM** | ^7.1.0 | Enrutamiento |
| **Axios** | ^1.7.9 | Cliente HTTP |
| **Tailwind CSS** | ^4.3.3 | Estilos utilitarios |

### Backend
| Tecnología | Versión | Propósito |
|---|---|---|
| **Node.js** | — | Runtime |
| **Express** | ^4.21.2 | Framework HTTP |
| **Mongoose** | ^8.6.1 | ODM para MongoDB |
| **CORS** | ^2.8.6 | Middleware CORS |
| **dotenv** | ^16.4.1 | Variables de entorno |
| **Nodemon** | ^3.1.14 | Auto-reload en desarrollo |

### Base de Datos
- **MongoDB** (local o Atlas vía `mongodb+srv://`)

---

## 📁 Estructura del Proyecto

```
Proyecto Final/
├── api/
│   └── index.js                   # Función serverless de Vercel (exporta la app)
├── backend/
│   ├── config/
│   │   ├── departments.js         # Departamentos válidos (fuente única)
│   │   └── env.js                 # Carga de variables de entorno
│   ├── db/
│   │   └── connection.js          # Conexión MongoDB + fallback SRV
│   ├── mappers/
│   │   └── announcementMapper.js  # Transformaciones documento ↔ JSON
│   ├── middlewares/
│   │   ├── auth.js                # requireAuth / requireAdmin (JWT)
│   │   └── errorHandler.js        # asyncHandler + manejador global de errores
│   ├── models/
│   │   ├── Announcement.js        # Modelo Mongoose
│   │   └── User.js                # Modelo Mongoose (cuentas)
│   ├── repositories/
│   │   ├── announcementRepository.js # Acceso a datos (DIP)
│   │   └── userRepository.js         # Acceso a datos de cuentas
│   ├── routes/
│   │   ├── health.routes.js       # GET /api/health
│   │   ├── upload.routes.js       # POST /api/upload y /api/upload-client
│   │   ├── auth.routes.js         # /api/auth (register, login, me)
│   │   ├── maps.routes.js         # GET /api/maps/resolve
│   │   └── announcements.routes.js# CRUD de comunicados
│   ├── services/
│   │   ├── announcementService.js # Reglas de negocio de comunicados
│   │   ├── authService.js         # Registro y login (cuentas)
│   │   ├── tokenService.js        # Firma/verificación JWT (fuente única del secreto)
│   │   ├── blobStorageService.js  # Subida multipart a Vercel Blob
│   │   ├── blobClientUploadService.js # Autorización de client uploads
│   │   └── mapUrlResolver.js      # Resolución de enlaces cortos de Maps
│   ├── utils/
│   │   └── httpError.js           # Error HTTP con status (manejo central)
│   ├── .env                       # Variables de entorno (no versionado)
│   ├── .env.example               # Plantilla de variables
│   ├── package.json
│   └── server.js                  # Composición de la app (Express + routers)
│
├── src/
│   ├── assets/                    # Imágenes y recursos estáticos
│   ├── components/
│   │   ├── AnnouncementFormFields.tsx   # Campos de formulario reutilizables
│   │   ├── AnnouncementFormFooter.tsx   # Pie de formulario compartido (crear/editar)
│   │   ├── AttachmentPreviewModal.tsx   # Vista previa de adjuntos
│   │   ├── Badges.tsx                   # Badges de estado/prioridad/categoría
│   │   ├── DescriptionEditor.tsx        # Editor enriquecido + subida de archivos
│   │   ├── Layout.tsx                   # Layout raíz con navegación
│   │   ├── Modal.tsx                    # Modal reutilizable
│   │   ├── RequireAuth.tsx              # Guarda de rutas autenticadas
│   │   ├── SidebarMenu.tsx              # Menú lateral
│   │   └── TopBar.tsx                   # Barra superior
│   │
│   ├── context/
│   │   ├── AuthContext.tsx         # Estado global de sesión (Provider)
│   │   ├── auth.context.ts         # Definición del contexto de sesión
│   │   ├── ThemeContext.tsx        # Estado global del tema (Provider)
│   │   └── theme.context.ts        # Definición del contexto de tema
│   │
│   ├── data/
│   │   └── communications.ts       # Tipos, normalización y mapeos
│   │
│   ├── hooks/
│   │   ├── useAnnouncementForm.ts  # Lógica de formulario (crear/editar)
│   │   ├── useAuth.ts              # Acceso al contexto de sesión
│   │   ├── useBackendHealth.ts     # Estado de conexión del backend
│   │   ├── useCommunications.ts    # Lógica CRUD de comunicados
│   │   └── useTheme.ts             # Acceso al contexto de tema
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Panel de control
│   │   ├── LoginPage.tsx           # Inicio de sesión
│   │   ├── SettingsPage.tsx        # Cuenta y preferencias
│   │   ├── SignUpPage.tsx          # Registro de cuenta
│   │   └── related/
│   │       ├── AnnouncementsPage.tsx    # Listado + modales CRUD
│   │       ├── EditAnnouncementPage.tsx # Formulario de edición
│   │       ├── NewAnnouncementPage.tsx  # Formulario de creación
│   │       ├── NotFound.tsx             # Página 404
│   │       └── ViewDetailsPage.tsx      # Detalle del comunicado
│   │
│   ├── services/
│   │   ├── api.ts                  # Cliente Axios + endpoints
│   │   ├── auth.ts                 # Endpoints de autenticación
│   │   ├── blob.ts                 # Cliente de subida de archivos
│   │   └── token.ts                # Gestión del token JWT (localStorage)
│   │
│   ├── types/
│   │   └── communicationDetail.ts # Tipos de comunicación/detalle (ISP)
│   │
│   ├── utils/
│   │   ├── announcementPayload.ts  # Formulario → payload de API (mapeador puro)
│   │   ├── attachmentLimits.ts     # Límites de tamaño por archivo/comunicado
│   │   ├── communicationFilters.ts # Filtro/orden de listados
│   │   ├── communicationMappers.ts # Communication → CommunicationDetail
│   │   ├── filePreview.ts          # Detección del tipo de vista previa
│   │   ├── sanitizeHtml.ts         # Sanitización de HTML
│   │   └── styleMaps.ts            # Mapas centralizados de estilos
│   │
│   ├── App.tsx                    # Configuración de rutas
│   ├── App.css
│   ├── index.css
│   └── main.tsx                   # Punto de entrada
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── eslint.config.js
```

---

## ✅ Requisitos Previos

- **Node.js** ≥ 18
- **npm** o **pnpm**
- **MongoDB** local (o cuenta Atlas con URI `mongodb+srv://`)

---

## 🔧 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/JairoBetaGD/Proyecto-Final.git
cd "Proyecto Final"
```

### 2. Instalar dependencias del frontend

```bash
npm install
# o
pnpm install
```

### 3. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 4. Configurar variables de entorno del backend

```bash
cd backend
cp .env.example .env
```

Edita `.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_practice
# O para Atlas:
# MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/nombre_db?retryWrites=true&w=majority
```

---

## ▶️ Ejecución

### Backend (puerto 5000)

```bash
cd backend
npm run dev        # con nodemon (auto-reload)
# o
npm start          # producción
```

### Frontend (puerto 5173)

```bash
# desde la raíz del proyecto
pnpm dev          # o: npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

---

## 🔌 API Backend

Base URL: `http://localhost:5000/api`

| Método | Endpoint | Descripción | Códigos |
|---|---|---|---|
| `GET` | `/health` | Estado de la API y conexión a BD | 200 |
| `POST` | `/upload` | Sube archivo(s) a Vercel Blob (multipart/form-data), devuelve URL pública | 200, 400, 500 |
| `GET` | `/announcements` | Lista todos los comunicados (ordenados por fecha desc) | 200 |
| `GET` | `/announcements/:id` | Obtiene un comunicado por ID | 200, 404 |
| `POST` | `/announcements` | Crea un nuevo comunicado | 201, 400 |
| `PUT` | `/announcements/:id` | Actualiza un comunicado existente | 200, 404, 400 |
| `DELETE` | `/announcements/:id` | Elimina un comunicado | 200, 404, 500 |
| `POST` | `/auth/register` | Crea cuenta `{ username, password, department }` | 201, 400, 409 |
| `POST` | `/auth/login` | Inicia sesión y devuelve `{ token, user }` | 200, 400, 401 |
| `GET` | `/auth/me` | Devuelve la cuenta actual (requiere token) | 200, 401 |
| `POST` | `/upload-client` | Autoriza subidas directas del navegador a Vercel Blob | 200, 400, 500 |
| `GET` | `/maps/resolve?url=` | Resuelve enlaces cortos de Google Maps a su URL final | 200, 400 |

> Salvo `/health`, `/auth/register` y `/auth/login`, todos los endpoints requieren la cabecera `Authorization: Bearer <token>`.

### Ejemplo de payload POST/PUT

```json
{
  "title": "Nueva actualización de protocolos",
  "category": "Administración",
  "priority": "Alta",
  "content": "Descripción del comunicado...",
  "status": "Publicado",
  "author": "Equipo administrativo",
  "publishImmediately": true,
  "attachments": [
    {
      "name": "Manual_Seguridad.pdf",
      "size": "2.4 MB",
      "type": "PDF",
      "mimeType": "application/pdf",
      "url": "https://<blob>.vercel-storage.com/manual.pdf"
    }
  ]
}
```

> Los **adjuntos** se suben primero a `POST /api/upload` (Vercel Blob) y el payload solo registra su **URL pública**. MongoDB no almacena binarios.

### Respuesta de `/api/upload`

```json
{
  "files": [
    { "url": "https://<blob>.vercel-storage.com/123_abc_archivo.pdf", "name": "archivo.pdf", "mimeType": "application/pdf", "type": "file" }
  ]
}
```

### Respuesta de `/health`

```json
{
  "status": "ok",
  "message": "API y base de datos en línea",
  "database": {
    "connected": true,
    "state": 1
  }
}
```

---

## 🔐 Autenticación (Login y Registro)

El sistema gestiona cuentas por **usuario, contraseña y departamento**. Cada cuenta solo puede **ver los comunicados de su departamento** (el campo `category` del comunicado es la etiqueta del departamento). La cuenta de administrador tiene **todos los privilegios** (ve todo y puede editar/eliminar).

### Cuenta de administrador (hardcodeada)

| Campo | Valor por defecto |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Rol | `admin` (todos los privilegios) |

Se puede sobreescribir con las variables de entorno `ADMIN_USERNAME` y `ADMIN_PASSWORD`. No se guarda en la base de datos.

### Endpoints

| Método | Ruta | Descripción | Requiere token |
|---|---|---|---|
| `POST` | `/api/auth/register` | Crea cuenta `{ username, password, department }` | ❌ |
| `POST` | `/api/auth/login` | Inicia sesión, devuelve `{ token, user }` | ❌ |
| `GET` | `/api/auth/me` | Cuenta actual | ✅ `Bearer <token>` |

### Reglas por rol

| Acción | Usuario normal | Admin |
|---|---|---|
| Ver comunicados | Solo los de **su departamento** | Todos |
| Crear comunicado | Sí (departamento preseleccionado) | Sí (elige departamento) |
| Editar comunicado | ❌ | ✅ |
| Eliminar comunicado | ❌ | ✅ |

### Frontend

- `/login` — página de inicio de sesión (usuario + contraseña).
- `/signup` — registro de cuenta (usuario + contraseña + confirmación + departamento).
- El token JWT se guarda en `localStorage` y se adjunta automáticamente a cada petición vía interceptor de axios.
- Las rutas `/` y `/Announcements` están protegidas: sin sesión redirigen a `/login`.

### Variables de entorno adicionales

| Variable | Descripción |
|---|---|
| `AUTH_SECRET` | Secreto para firmar los tokens JWT |
| `ADMIN_USERNAME` | Usuario del admin hardcodeado (default `admin`) |
| `ADMIN_PASSWORD` | Contraseña del admin hardcodeado (default `admin123`) |

---

## 🗄️ Modelo de Datos

### Announcement (Mongoose)

| Campo | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|
| `title` | String | ✅ | — | Título del comunicado |
| `category` | String | ✅ | `'Administración'` | Categoría |
| `priority` | String | ✅ | `'Media'` | `Alta` / `Media` / `Baja` |
| `content` | String | ✅ | `''` | Contenido HTML/plano |
| `status` | String | ❌ | `'Publicado'` | `Publicado` / `Borrador` / `Archivado` / `Programado` |
| `author` | String | ❌ | `'Equipo administrativo'` | Autor |
| `publishImmediately` | Boolean | ❌ | `true` | Publicar al guardar |
| `attachments` | Array | ❌ | `[]` | Adjuntos `{ name, size, type, mimeType, url }` (la `url` apunta a Vercel Blob) |
| `code` | String | ❌ | — | Código único (ej. `COM-2024-1234`) |
| `createdAt` | Date | auto | — | Timestamp de creación |
| `updatedAt` | Date | auto | — | Timestamp de actualización |

---

## 🏗️ Arquitectura Frontend

### Capas

```
┌──────────────────────────────────────────────┐
│                 Páginas (Pages)               │
│  DashboardPage, AnnouncementsPage, y related  │
├──────────────────────────────────────────────┤
│              Hooks (Lógica)                   │
│  useCommunications, useAnnouncementForm,      │
│  useBackendHealth                             │
├──────────────────────────────────────────────┤
│         Componentes (Presentación)            │
│  Badges, Modal, FormFields, FormFooter,       │
│  AttachmentPreviewModal, Sidebar, TopBar      │
├──────────────────────────────────────────────┤
│             Servicios (API)                   │
│  api.ts (Axios), blob.ts (upload)             │
├──────────────────────────────────────────────┤
│   Mapeadores / Tipos / Utilidades             │
│  communicationMappers, communicationDetail,   │
│  filePreview, sanitizeHtml, styleMaps, data   │
└──────────────────────────────────────────────┘
```

### Flujo de datos

1. **Página** monta un **hook** (ej. `useCommunications`).
2. El **hook** llama al **servicio** (`api.ts`) que usa Axios.
3. El **servicio** devuelve datos crudos del backend.
4. El **hook** normaliza los datos con `normalizeCommunication`.
5. La **página** transforma a modelo de presentación con **mapeadores** puros (`communicationMappers.ts`) según la variante (Dashboard / Listado).
6. La **página** pasa los datos a **componentes de presentación** (Badges, Tablas, Modales, `ViewDetailsPage`).
7. Los **componentes** usan `styleMaps` para estilos y `filePreview` para clasificar la vista previa de adjuntos.

---

## 📐 Principios SOLID Aplicados

### S — Single Responsibility (Responsabilidad Única)

**Frontend:**

| Archivo | Responsabilidad |
|---|---|
| `hooks/useCommunications.ts` | Fetch, refresh y delete de comunicados |
| `hooks/useAnnouncementForm.ts` | Estado y envío del formulario |
| `hooks/useBackendHealth.ts` | Verificación de salud del backend |
| `components/Badges.tsx` | Renderizado de badges |
| `components/Modal.tsx` | Overlay, escape y scroll lock |
| `components/AnnouncementFormFields.tsx` | Campos del formulario |
| `components/AnnouncementFormFooter.tsx` | Pie de formulario compartido |
| `components/AttachmentPreviewModal.tsx` | Vista previa de adjuntos |
| `utils/communicationMappers.ts` | `Communication` → `CommunicationDetail` |
| `utils/announcementPayload.ts` | Formulario → payload de la API (mapeador puro) |
| `utils/filePreview.ts` | Clasificación del tipo de vista previa |
| `utils/styleMaps.ts` | Mapas de estilos |

**Backend (`backend/`) — cada módulo tiene una única responsabilidad:**

| Archivo | Responsabilidad |
|---|---|
| `config/env.js` | Carga de variables de entorno |
| `db/connection.js` | Conexión a MongoDB + fallback SRV |
| `mappers/announcementMapper.js` | Transformación documento ↔ JSON |
| `repositories/announcementRepository.js` | Acceso a datos (Mongoose) |
| `services/announcementService.js` | Reglas de negocio (visibilidad por rol, defaults, normalización) |
| `services/authService.js` | Registro y login de cuentas |
| `services/tokenService.js` | Firma/verificación de JWT (fuente única del secreto) |
| `services/blobStorageService.js` | Subida multipart a Vercel Blob |
| `services/blobClientUploadService.js` | Autorización de client uploads |
| `middlewares/auth.js` | `requireAuth` / `requireAdmin` |
| `middlewares/errorHandler.js` | `asyncHandler` + manejador global de errores (OCP) |
| `utils/httpError.js` | Error HTTP con status para el manejo central |
| `routes/*.routes.js` | Capa HTTP (parsear request / responder) |
| `server.js` | Composición de la app (Express + routers) |

### O — Open/Closed (Abierto/Cerrado)

- Los estilos de **estado**, **prioridad** y **categoría** están centralizados en `utils/styleMaps.ts`.
- Las **categorías** tienen una única fuente de verdad (`CATEGORY_MAP` en `data/communications.ts`): agregar una categoría solo requiere añadir una entrada; las opciones del formulario y los mapeadores se derivan automáticamente.
- El formulario (`AnnouncementFormFooter`) se configura por **props** (`submitLabel`, `successLabel`) para cada variante sin duplicar código.

### L — Liskov Substitution

- `useAnnouncementForm` es intercambiable entre las páginas de **Nuevo** y **Edición** con la misma interfaz.
- `AnnouncementFormFields` y `AnnouncementFormFooter` se reutilizan idénticos en ambos formularios.
- Los **mapeadores** (`communicationMappers`) devuelven siempre el mismo contrato `CommunicationDetail`, consumible por `ViewDetailsPage` desde Dashboard o Listado.

### I — Interface Segregation

- Props mínimas y específicas:
  - `StatusBadgeProps { status }`
  - `PriorityBadgeProps { priority }`
  - `ModalProps { isOpen, onClose, children, maxWidth? }`
  - `AnnouncementFormFieldsProps { formData, onInputChange, onPriorityChange, onCheckboxChange, onDescriptionChange, onAttachmentsChange }`
  - `AnnouncementFormFooterProps { onCancel, isSubmitting, submitStatus, isOverLimit, submitLabel, successLabel }`
  - `AttachmentPreviewModalProps { previewDoc, onClose }`
- El hook `useAnnouncementForm` expone **operaciones semánticas** (`setDescription`, `setFormAttachments`) en lugar del estado crudo del formulario.
- Los tipos compartidos viven en `types/communicationDetail.ts` para que cada consumidor importe solo lo que necesita.

### D — Dependency Inversion

- Los **hooks** dependen de la capa de **servicios** (`api.ts`, `blob.ts`), no de implementaciones concretas.
- Los **componentes de presentación** reciben datos por **props**, no importan la API directamente.
- En el **backend**, las **rutas** dependen del **servicio** (`announcementService`), que orquesta el **repositorio** (`announcementRepository`) y **mapeadores** puros, sin conocer Mongoose ni Express. Cambiar la fuente de datos no afecta la capa HTTP.
- La firma/verificación de JWT vive en `services/tokenService.js`: `authService` y el middleware `requireAuth` dependen de esa abstracción (una única fuente de verdad para el secreto).
- Los errores de negocio (`HttpError` y `AuthError`) se traducen a JSON en `middlewares/errorHandler.js`; agregar un tipo de error nuevo no obliga a modificar rutas.

---

## 🧭 Rutas de la Aplicación

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | `DashboardPage` | Panel de control con métricas |
| `/Announcements` | `AnnouncementsPage` | Listado + CRUD con modales |
| `/NotFound` | `NotFound` | Página 404 |

---

## 📜 Scripts Disponibles

### Frontend (raíz del proyecto, `package.json`)

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `vite` | Dev server con HMR |
| `build` | `tsc -b && vite build` | Compila TS + build de producción |
| `lint` | `eslint .` | Linter |
| `preview` | `vite preview` | Previsualiza el build |
| `vercel-build` | `npm install --prefix backend && npm run build` | Build para Vercel |
| `check:lockfile` | `pnpm install --frozen-lockfile --lockfile-only` | Verifica que el lockfile esté sincronizado |

### Backend (`backend/package.json`)

| Script | Comando | Descripción |
|---|---|---|
| `dev` | `nodemon server.js` | Dev server con auto-reload |
| `start` | `node server.js` | Producción |

---

## 🔐 Variables de Entorno

### Backend (`.env`)

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `5000` |
| `MONGO_URI` | URI de conexión MongoDB | `mongodb://127.0.0.1:27017/mern_practice` |
| `MONGODB_URI` | URI de conexión MongoDB (alternativa) | — |
| `MONGO_DB_NAME` | Nombre de la base de datos (si no está en la URI) | `Practice` |
| `BLOB_READ_WRITE_TOKEN` | Token de **Vercel Blob** (necesario para `POST /api/upload`) | — |

### Frontend (`VITE_API_URL`)

| Variable | Descripción | Default |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `/api` (proxy en dev / Vercel) |

---

## 🚀 Despliegue en Vercel

### Configuración automática

El proyecto incluye un archivo `vercel.json` en la raíz con:

```json
{
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm run vercel-build",
  "outputDirectory": "dist",
  "functions": {
    "api/index.js": { "maxDuration": 60 }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Pasos para desplegar

1. **Sube el código a GitHub** (el repositorio ya está configurado).

2. **Importa el proyecto en Vercel**:
   - Ve a [vercel.com](https://vercel.com) y haz clic en **Add New → Project**.
   - Conecta tu cuenta de GitHub y selecciona el repositorio `Proyect`.

3. **Deja el Root Directory vacío** (Importante):
   - La raíz del repositorio ya es el proyecto: contiene `package.json`, `vercel.json` y la carpeta `api/`.

4. **Configura las variables de entorno** en la pestaña **Environment Variables**:
   - `MONGODB_URI` (o `MONGO_URI`): Tu URI de MongoDB Atlas, por ejemplo:
     ```
     mongodb+srv://usuario:password@cluster.mongodb.net/nombre_db?retryWrites=true&w=majority
     ```
   - `MONGO_DB_NAME`: (Opcional) Nombre de la base de datos, por defecto `Practice`.
   - `BLOB_READ_WRITE_TOKEN`: Token de **Vercel Blob** (se genera en el dashboard de tu proyecto → **Storage** → **Create Blob Store**). Necesario para la subida de archivos (`POST /api/upload`).

5. **Despliega**:
   - Haz clic en **Deploy**.
   - Vercel ejecutará:
     - `pnpm install --frozen-lockfile` (dependencias del frontend, con lockfile determinista)
     - `pnpm run vercel-build`, que instala el backend (`npm install --prefix backend`) y construye el frontend (`tsc -b && vite build`)

6. **Verifica el despliegue**:
   - Frontend: `https://tu-proyecto.vercel.app/`
   - API Health: `https://tu-proyecto.vercel.app/api/health`
   - Lista de comunicados: `https://tu-proyecto.vercel.app/api/announcements`

### Arquitectura del despliegue

```
Vercel
├── Frontend (React + Vite → dist/)
└── API (Serverless Function → api/index.js → backend/server.js)
    └── MongoDB Atlas (variable MONGODB_URI)
    └── Vercel Blob Storage (token BLOB_READ_WRITE_TOKEN → URLs de adjuntos)
```

### Notas importantes

- El backend se exporta como función serverless de Vercel (Express corre dentro de `api/index.js`).
- La conexión a MongoDB se mantiene en caliente con fallback automático (resolución manual de SRV si es necesario).
- El backend está **modularizado (SOLID)**: `server.js` solo compone routers (`routes/`); las rutas dependen de los servicios (`services/`), que orquestan los repositorios (`repositories/`) y mapeadores puros (`mappers/`); los errores se traducen a JSON en un único punto (`middlewares/errorHandler.js`).
- Los archivos se suben a **Vercel Blob** y se guarda solo su **URL** en MongoDB (sin binarios).
- Las rutas del frontend funcionan gracias a los `rewrites` en `vercel.json`.
- En desarrollo local, el proxy de Vite envía `/api` a `http://localhost:5000`.

---

## 🤝 Contribución

1. Haz fork del repositorio.
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`.
3. Realiza tus cambios.
4. Ejecuta `npm run lint` y `npm run build` para validar.
5. Envía un Pull Request.

---

## 📄 Licencia

Proyecto interno de **administrativo** — Uso exclusivo corporativo.