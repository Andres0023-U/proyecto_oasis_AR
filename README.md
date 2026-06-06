# 🌊 Oasis Pool Booking

Sistema de reservas de piscina privada con frontend estático y backend Node.js + PostgreSQL.

---

## 📁 Estructura del proyecto

```
Oasis/
├── pagina/                        ← Frontend (abrir en navegador)
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── images/
│       ├── logo.png
│       └── piscina.jpeg
│
└── backend/                       ← Servidor Node.js
    ├── index.js                   ← Punto de entrada
    ├── .env                       ← Variables de entorno (NO subir a git)
    ├── package.json
    └── src/
        ├── config/
        │   └── db.js              ← Conexión a PostgreSQL
        ├── controllers/
        │   ├── authController.js
        │   └── reservationController.js
        ├── models/
        │   ├── userModel.js
        │   └── reservationModel.js
        └── routes/
            ├── authRoutes.js
            └── reservationRoutes.js
```

---

## ✅ Requisitos previos

Antes de correr el proyecto necesitas tener instalado:

- [Node.js](https://nodejs.org/) v18 o superior
- [PostgreSQL](https://www.postgresql.org/) v14 o superior
- Un cliente SQL (recomendado: [DBeaver](https://dbeaver.io/) o [pgAdmin](https://www.pgadmin.org/))

---

## 🗄️ 1. Configurar la base de datos

### Crear la base de datos y el schema

Conéctate a PostgreSQL y ejecuta:

```sql
CREATE DATABASE oasis_pool_db;
\c oasis_pool_db
CREATE SCHEMA oasis;
```

### Crear las tablas

Ejecuta el siguiente script en orden:

```sql
-- Roles
CREATE TABLE oasis.roles (
    id_rol      SERIAL PRIMARY KEY,
    nombre_rol  VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255)
);

INSERT INTO oasis.roles (nombre_rol, descripcion) VALUES
    ('admin',  'Administrador del sistema'),
    ('cliente','Cliente que realiza reservas');

-- Usuarios
CREATE TABLE oasis.users (
    id_usuario    SERIAL PRIMARY KEY,
    id_rol        INT NOT NULL REFERENCES oasis.roles(id_rol),
    documento     VARCHAR(20) UNIQUE NOT NULL,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    correo        VARCHAR(150) UNIQUE NOT NULL,
    telefono      VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    activo        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Servicios
CREATE TABLE oasis.services (
    id_servicio   SERIAL PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    descripcion   TEXT,
    precio        NUMERIC(10,2),
    tipo          VARCHAR(50),
    capacidad_max INT,
    activo        BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Reservas
CREATE TABLE oasis.reservations (
    id_reserva    SERIAL PRIMARY KEY,
    id_usuario    INT NOT NULL REFERENCES oasis.users(id_usuario),
    fecha_reserva DATE NOT NULL,
    hora_inicio   TIME NOT NULL,
    hora_fin      TIME,
    num_invitados INT DEFAULT 1,
    precio_total  NUMERIC(10,2),
    estado        VARCHAR(20) DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente','confirmada','cancelada')),
    observaciones TEXT,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);

-- Detalles de reserva
CREATE TABLE oasis.reservation_details (
    id_detalle          SERIAL PRIMARY KEY,
    id_reserva          INT NOT NULL REFERENCES oasis.reservations(id_reserva),
    id_servicio         INT NOT NULL REFERENCES oasis.services(id_servicio),
    cantidad            INT DEFAULT 1,
    precio_unitario_snap NUMERIC(10,2)
);

-- Pagos
CREATE TABLE oasis.payments (
    id_pago    SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL REFERENCES oasis.reservations(id_reserva),
    monto      NUMERIC(10,2),
    metodo     VARCHAR(50),
    estado     VARCHAR(20),
    referencia VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Configuración de la app
CREATE TABLE oasis.app_config (
    id_config   SERIAL PRIMARY KEY,
    clave       VARCHAR(100) UNIQUE NOT NULL,
    valor       VARCHAR(255),
    descripcion TEXT
);
```

---

## ⚙️ 2. Configurar variables de entorno

En la carpeta `backend/`, crea un archivo llamado `.env` con este contenido (ajusta los valores a tu entorno local):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oasis_pool_db
DB_USER=oasis_admin
DB_PASSWORD=tu_contraseña
PORT=3000
JWT_SECRET=una_clave_secreta_larga_y_segura
```

> ⚠️ Si el usuario `oasis_admin` no existe en tu PostgreSQL, puedes crearlo así:
> ```sql
> CREATE USER oasis_admin WITH PASSWORD 'tu_contraseña';
> GRANT ALL PRIVILEGES ON DATABASE oasis_pool_db TO oasis_admin;
> GRANT ALL ON SCHEMA oasis TO oasis_admin;
> GRANT ALL ON ALL TABLES IN SCHEMA oasis TO oasis_admin;
> GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA oasis TO oasis_admin;
> ```
> O simplemente usar tu usuario de postgres existente.

---

## 🚀 3. Instalar dependencias y correr el backend

```bash
cd backend
npm install
npm run dev      # con nodemon (recarga automática)
# ó
npm start        # sin nodemon
```

Si todo está bien, verás en la consola:
```
Servidor corriendo en http://localhost:3000
```

Puedes verificar que funciona abriendo en el navegador:
```
http://localhost:3000/
```
Debe responder: `{ "message": "¡API Oasis funcionando!" }`

---

## 🌐 4. Abrir el frontend

El frontend es un HTML estático, **no necesita servidor**. Solo abre el archivo directamente:

```
pagina/index.html  →  clic derecho → Abrir con navegador
```

> ⚠️ El frontend hace llamadas a `http://localhost:3000` — el backend **debe estar corriendo** para que el login, registro y reservas funcionen.

---

## 🔌 Endpoints disponibles

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/register` | Registrar nuevo usuario |
| `POST` | `/auth/login` | Iniciar sesión, devuelve JWT |
| `GET` | `/reservas` | Obtener todas las reservas (admin) |
| `GET` | `/reservas/usuario/:id` | Reservas de un usuario específico |
| `POST` | `/reservas` | Crear una nueva reserva |
| `PATCH` | `/reservas/:id` | Actualizar estado de una reserva |

---

## 🐛 Problemas comunes

**"Error conectando con el servidor"**
→ Verifica que el backend esté corriendo en el puerto 3000.

**"Error en el login" / "Error al registrar"**
→ Verifica que el `.env` tenga las credenciales correctas de la BD y que las tablas existan.

**La página carga pero no muestra imágenes**
→ Asegúrate de que la carpeta `images/` esté en la misma carpeta que `index.html` con los archivos `logo.png` y `piscina.jpeg`.

**CORS error en consola del navegador**
→ El backend ya tiene `cors()` habilitado. Si persiste, verifica que estés llamando exactamente a `http://localhost:3000` (sin barra al final).

---

## 👥 Roles del sistema

| id_rol | Nombre | Descripción |
|--------|--------|-------------|
| 1 | admin | Acceso total |
| 2 | cliente | Puede hacer reservas (rol por defecto al registrarse) |
