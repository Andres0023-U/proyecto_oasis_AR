-- =============================================================================
-- 01_TABLES.SQL
-- Sistema de Reservas Oasis
-- Esquema, tipos de datos, tablas, índices y comentarios
-- Versión consolidada: incluye auditoría unificada (audit_log), reviews y
-- duracion_horas en reservations.
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS oasis;

-- =============================================================================
-- 1. TIPOS DE DATOS PERSONALIZADOS (ENUMS)
-- =============================================================================

CREATE TYPE oasis.reserva_status AS ENUM (
    'Pendiente', 'Confirmada', 'En Curso', 'Completada', 'Cancelada', 'No Asistió'
);

CREATE TYPE oasis.payment_status AS ENUM (
    'Pendiente', 'Verificado', 'Rechazado', 'Reembolsado'
);

CREATE TYPE oasis.payment_method AS ENUM (
    'Nequi', 'Daviplata', 'Transferencia', 'Efectivo', 'Tarjeta'
);

CREATE TYPE oasis.service_type AS ENUM (
    'Plan Base', 'Adicional'
);

CREATE TYPE oasis.audit_action AS ENUM (
    'INSERT', 'UPDATE', 'DELETE'
);

-- =============================================================================
-- 2. TABLAS PRINCIPALES
-- =============================================================================

CREATE TABLE oasis.roles (
    id_rol      SERIAL PRIMARY KEY,
    nombre_rol  VARCHAR(30)  NOT NULL UNIQUE,
    descripcion VARCHAR(100)
);

CREATE TABLE oasis.users (
    id_usuario    SERIAL PRIMARY KEY,
    id_rol        INT          NOT NULL REFERENCES oasis.roles(id_rol),
    documento     VARCHAR(20)  NOT NULL UNIQUE,
    nombre        VARCHAR(100) NOT NULL,
    apellido      VARCHAR(100) NOT NULL,
    correo        VARCHAR(150) NOT NULL UNIQUE,
    telefono      VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    activo        BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE oasis.services (
    id_servicio   SERIAL PRIMARY KEY,
    nombre        VARCHAR(100)   NOT NULL,
    descripcion   TEXT,
    precio        NUMERIC(10,2)  NOT NULL CHECK (precio >= 0),
    tipo          oasis.service_type NOT NULL,
    capacidad_max INT            NOT NULL CHECK (capacidad_max >= 0),
    activo        BOOLEAN        DEFAULT TRUE,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE oasis.reservations (
    id_reserva     SERIAL PRIMARY KEY,
    id_usuario     INT            NOT NULL REFERENCES oasis.users(id_usuario),
    fecha_reserva  DATE           NOT NULL,
    hora_inicio    TIME           NOT NULL,
    hora_fin       TIME           NOT NULL,
    duracion_horas SMALLINT,
    num_invitados  INT            NOT NULL CHECK (num_invitados > 0),
    precio_total   NUMERIC(10,2)  DEFAULT 0.00,
    estado         oasis.reserva_status DEFAULT 'Pendiente',
    observaciones  TEXT,
    created_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ck_horas CHECK (hora_fin > hora_inicio)
);

CREATE TABLE oasis.reservation_details (
    id_detalle           SERIAL PRIMARY KEY,
    id_reserva           INT           NOT NULL REFERENCES oasis.reservations(id_reserva) ON DELETE CASCADE,
    id_servicio          INT           NOT NULL REFERENCES oasis.services(id_servicio),
    cantidad             INT           NOT NULL DEFAULT 1 CHECK (cantidad > 0),
    precio_unitario_snap NUMERIC(10,2) NOT NULL
);

CREATE TABLE oasis.payments (
    id_pago    SERIAL PRIMARY KEY,
    id_reserva INT            NOT NULL REFERENCES oasis.reservations(id_reserva),
    monto      NUMERIC(10,2)  NOT NULL CHECK (monto > 0),
    metodo     oasis.payment_method NOT NULL,
    estado     oasis.payment_status DEFAULT 'Pendiente',
    referencia VARCHAR(100),
    created_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE oasis.app_config (
    id_config   SERIAL PRIMARY KEY,
    clave       VARCHAR(50)  NOT NULL UNIQUE,
    valor       VARCHAR(255) NOT NULL,
    descripcion TEXT
);

CREATE TABLE oasis.reviews (
    id_resena    SERIAL PRIMARY KEY,
    id_usuario   INT      NOT NULL REFERENCES oasis.users(id_usuario),
    id_reserva   INT      NOT NULL REFERENCES oasis.reservations(id_reserva),
    calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario   TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_resena_por_reserva UNIQUE (id_usuario, id_reserva)
);

-- =============================================================================
-- 3. TABLA DE AUDITORÍA UNIFICADA
-- =============================================================================
-- Reemplaza el modelo anterior de una tabla de auditoría por cada tabla
-- (audit_users, audit_services, audit_reservations, audit_reservation_details,
-- audit_payments, audit_app_config, audit_reviews). Ahora un solo registro de
-- auditoría identifica su origen mediante la columna tabla_afectada.

CREATE TABLE oasis.audit_log (
    id_auditoria   SERIAL PRIMARY KEY,
    tabla_afectada VARCHAR(60)        NOT NULL,
    accion         oasis.audit_action NOT NULL,
    datos_antes    JSONB,
    datos_despues  JSONB,
    fecha_cambio   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_db     VARCHAR(100) DEFAULT CURRENT_USER
);

ALTER TABLE oasis.audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. ÍNDICES
-- =============================================================================

CREATE INDEX idx_res_fecha       ON oasis.reservations (fecha_reserva);
CREATE INDEX idx_res_estado      ON oasis.reservations (estado);
CREATE INDEX idx_users_email     ON oasis.users (correo);
CREATE INDEX idx_pay_reserva     ON oasis.payments (id_reserva);
CREATE INDEX idx_reviews_usuario ON oasis.reviews (id_usuario);
CREATE INDEX idx_reviews_reserva ON oasis.reviews (id_reserva);
CREATE INDEX idx_audit_log_tabla ON oasis.audit_log (tabla_afectada);
CREATE INDEX idx_audit_log_fecha ON oasis.audit_log (fecha_cambio);

-- =============================================================================
-- 5. COMENTARIOS
-- =============================================================================

COMMENT ON TABLE oasis.users IS 'Almacena datos de clientes y empleados diferenciados por rol.';
COMMENT ON COLUMN oasis.reservation_details.precio_unitario_snap IS 'Guarda el precio del servicio al momento de la reserva para evitar cambios históricos si el precio del servicio sube después.';
COMMENT ON COLUMN oasis.reservations.duracion_horas IS 'Duración de la reserva en horas enteras (calculado por el backend).';
COMMENT ON TABLE oasis.app_config IS 'Configuraciones como IVA, capacidad total del recinto o porcentajes de reserva.';
COMMENT ON TABLE oasis.reviews IS 'Reseñas del lugar hechas por usuarios con reserva completada.';
COMMENT ON COLUMN oasis.reviews.calificacion IS 'Calificación entera del 1 al 5.';
COMMENT ON COLUMN oasis.reviews.comentario IS 'Comentario opcional del usuario.';
COMMENT ON TABLE oasis.audit_log IS 'Auditoría unificada de cambios sobre todas las tablas del sistema.';
COMMENT ON COLUMN oasis.audit_log.tabla_afectada IS 'Nombre de la tabla que originó el evento de auditoría.';
