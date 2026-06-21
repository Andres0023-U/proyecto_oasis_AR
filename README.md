# Oasis - Sistema de Reservas de Piscina

Aplicación web para la gestión y reserva de piscinas, con autenticación de usuarios, procesamiento de pagos y sistema de reseñas.

---

## Tabla de contenidos

- [Tecnologías](#tecnologías)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Endpoints principales](#endpoints-principales)
- [Instalación y ejecución local](#instalación-y-ejecución-local)
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

    Proyecto_Parcial03/
    ├── BDD/                    # Scripts o documentación de base de datos
    ├── oasis_backend/
    │   ├── src/
    │   │   ├── config/         # Configuración (conexión a la BD)
    │   │   └── routes/         # Rutas de la API
    │   ├── index.js            # Punto de entrada del servidor
    │   ├── package.json
    │   └── .env                # Variables de entorno (no se sube al repo)
    └── pagina/                 # Frontend del proyecto

---

## Endpoints principales

| Ruta base | Descripción |
|---|---|
| `/auth` | Autenticación de usuarios (login/registro) |
| `/usuarios` | Gestión de perfiles de usuario |
| `/reservas` | Creación y gestión de reservas de piscina |
| `/pagos` | Procesamiento de pagos vía MercadoPago |
| `/resenas` | Reseñas y calificaciones de piscinas |

---

## Instalación y ejecución local

### Requisitos previos
- Node.js instalado
- Cuenta de Supabase con base de datos PostgreSQL configurada
- Credenciales de MercadoPago (modo prueba o producción)

### Pasos

**1. Clonar el repositorio**

    git clone <url-del-repositorio>
    cd Proyecto_Parcial03/oasis_backend

**2. Instalar dependencias**

    npm install

**3. Configurar variables de entorno**

Crear un archivo `.env` en la raíz de `oasis_backend` con:

    PORT=3000
    DATABASE_URL=
    JWT_SECRET=
    MERCADOPAGO_ACCESS_TOKEN=

**4. Ejecutar en modo desarrollo**

    npm run dev

**5. Ejecutar en modo producción**

    npm start

El servidor quedará corriendo en `http://localhost:3000` (o el puerto definido en `.env`).

---

## Despliegue

| Componente | Plataforma |
|---|---|
| Backend | Render |
| Frontend | Vercel |
| Base de datos | Supabase (PostgreSQL) |

---

## Autores

- [Nombres del equipo]
