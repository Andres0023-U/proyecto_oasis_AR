# Oasis - Sistema de Reservas de Piscina

Aplicación web para la gestión y reserva de piscinas, con autenticación de usuarios, procesamiento de pagos y sistema de reseñas.

---

## Documentación

Este README cubre lo esencial para entender y arrancar el proyecto rápidamente. Para más detalle, consultar:

- **[Manual Técnico](./docs/Manual-Tecnico.docx)** — arquitectura, instalación y despliegue paso a paso, modelo de base de datos, endpoints de la API, flujos del sistema y seguridad.
- **[Manual de Usuario](./docs/Manual-Usuario.docx)** — guía de uso de la aplicación desde la perspectiva del cliente final.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Endpoints principales](#endpoints-principales)
- [Inicio rápido](#inicio-rápido)
- [Despliegue](#despliegue)
- [Autores](#autores)

---

## Tecnologías

### Frontend
- HTML, CSS, JavaScript
- **Despliegue:** Vercel

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Despliegue:** Render

### Base de datos
- PostgreSQL (vía Supabase)
- Conexión mediante `pg` (pool de conexiones)

### Otras librerías

| Librería | Uso |
|---|---|
| `bcrypt` | Hash de contraseñas |
| `jsonwebtoken` | Autenticación basada en tokens (JWT) |
| `cors` | Comunicación entre frontend y backend |
| `dotenv` | Manejo de variables de entorno |
| `mercadopago` | Procesamiento de pagos |

---

## Estructura del proyecto

```
proyecto_oasis_AR/
├── backend/
│   ├── node_modules/
│   ├── src/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── database/
│   ├── ddl/
│   ├── docs/
│   └── seeds/
└── frontend/
    ├── images/
    ├── index.html
    ├── script.js
    └── styles.css
```

> Ver el **Manual Técnico** para la descripción detallada de cada carpeta y archivo.

---

## Endpoints principales

| Ruta base | Descripción |
|---|---|
| `/auth` | Autenticación de usuarios (login/registro) |
| `/usuarios` | Gestión de perfiles de usuario |
| `/reservas` | Creación y gestión de reservas de piscina |
| `/pagos` | Procesamiento de pagos vía MercadoPago |
| `/resenas` | Reseñas y calificaciones de piscinas |

> El detalle de cada ruta (método, parámetros, respuesta) está en el **Manual Técnico, sección 7**.

---

## Inicio rápido

```bash
git clone <url-del-repositorio>
cd Proyecto_Parcial03/oasis_backend
npm install
npm run dev
```

El servidor queda corriendo en `http://localhost:3000` (o el puerto definido en `.env`).

Variables de entorno necesarias (archivo `.env` en la raíz de `oasis_backend`):

```env
PORT=3000
DATABASE_URL=
JWT_SECRET=
MERCADOPAGO_ACCESS_TOKEN=
```

> Para la configuración completa (Supabase, scripts de `ddl/`/`seeds/`, despliegue en Render/Vercel), ver el **Manual Técnico, sección 5**.

---

## Despliegue

| Componente | Plataforma |
|---|---|
| Backend | Render |
| Frontend | Vercel |
| Base de datos | Supabase (PostgreSQL) |

---

## Autores

| Nombre | Rol |
|---|---|
| Andrés Santiago Vargas Guzmán | Backend |
| Jonathan Andrés Becerra Jaimes | Base de datos |
| José Leonardo Soler Duarte | Scrum Master |
| Mauricio Isaac González Andrade | Product Owner |
| Daniela Idrobo Cardozo | Frontend |
