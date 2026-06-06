-- =============================================
-- 1. CONFIGURACIÓN INICIAL
-- =============================================

CREATE SCHEMA IF NOT EXISTS oasis;

-- =============================================
-- 2. TIPOS DE DATOS PERSONALIZADOS (ENUMS)
-- =============================================

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

-- =============================================
-- 3. TABLAS PRINCIPALES
-- =============================================

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
    id_reserva    SERIAL PRIMARY KEY,
    id_usuario    INT            NOT NULL REFERENCES oasis.users(id_usuario),
    fecha_reserva DATE           NOT NULL,
    hora_inicio   TIME           NOT NULL,
    hora_fin      TIME           NOT NULL,
    num_invitados INT            NOT NULL CHECK (num_invitados > 0),
    precio_total  NUMERIC(10,2)  DEFAULT 0.00,
    estado        oasis.reserva_status DEFAULT 'Pendiente',
    observaciones TEXT,
    created_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
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

-- =============================================
-- 4. TABLAS DE AUDITORÍA
-- =============================================

CREATE TABLE oasis.audit_users (
    id_auditoria  SERIAL PRIMARY KEY,
    accion        oasis.audit_action NOT NULL,
    datos_antes   JSONB,
    datos_despues JSONB,
    fecha_cambio  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_db    VARCHAR(100) DEFAULT CURRENT_USER
);

CREATE TABLE oasis.audit_services (
    id_auditoria  SERIAL PRIMARY KEY,
    accion        oasis.audit_action NOT NULL,
    datos_antes   JSONB,
    datos_despues JSONB,
    fecha_cambio  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_db    VARCHAR(100) DEFAULT CURRENT_USER
);

CREATE TABLE oasis.audit_reservations (
    id_auditoria  SERIAL PRIMARY KEY,
    accion        oasis.audit_action NOT NULL,
    datos_antes   JSONB,
    datos_despues JSONB,
    fecha_cambio  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_db    VARCHAR(100) DEFAULT CURRENT_USER
);

CREATE TABLE oasis.audit_reservation_details (
    id_auditoria  SERIAL PRIMARY KEY,
    accion        oasis.audit_action NOT NULL,
    datos_antes   JSONB,
    datos_despues JSONB,
    fecha_cambio  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_db    VARCHAR(100) DEFAULT CURRENT_USER
);

CREATE TABLE oasis.audit_payments (
    id_auditoria  SERIAL PRIMARY KEY,
    accion        oasis.audit_action NOT NULL,
    datos_antes   JSONB,
    datos_despues JSONB,
    fecha_cambio  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_db    VARCHAR(100) DEFAULT CURRENT_USER
);

CREATE TABLE oasis.audit_app_config (
    id_auditoria  SERIAL PRIMARY KEY,
    accion        oasis.audit_action NOT NULL,
    datos_antes   JSONB,
    datos_despues JSONB,
    fecha_cambio  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_db    VARCHAR(100) DEFAULT CURRENT_USER
);

-- =============================================
-- 5. FUNCIONES
-- =============================================

CREATE OR REPLACE FUNCTION oasis.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION oasis.fn_recalculate_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE oasis.reservations
    SET precio_total = (
        SELECT COALESCE(SUM(cantidad * precio_unitario_snap), 0)
        FROM oasis.reservation_details
        WHERE id_reserva = COALESCE(NEW.id_reserva, OLD.id_reserva)
    )
    WHERE id_reserva = COALESCE(NEW.id_reserva, OLD.id_reserva);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION oasis.fn_audit_users()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO oasis.audit_users (accion, datos_antes, datos_despues)
        VALUES ('INSERT', NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO oasis.audit_users (accion, datos_antes, datos_despues)
        VALUES ('UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO oasis.audit_users (accion, datos_antes, datos_despues)
        VALUES ('DELETE', to_jsonb(OLD), NULL);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION oasis.fn_audit_services()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO oasis.audit_services (accion, datos_antes, datos_despues)
        VALUES ('INSERT', NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO oasis.audit_services (accion, datos_antes, datos_despues)
        VALUES ('UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO oasis.audit_services (accion, datos_antes, datos_despues)
        VALUES ('DELETE', to_jsonb(OLD), NULL);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION oasis.fn_audit_reservations()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO oasis.audit_reservations (accion, datos_antes, datos_despues)
        VALUES ('INSERT', NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO oasis.audit_reservations (accion, datos_antes, datos_despues)
        VALUES ('UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO oasis.audit_reservations (accion, datos_antes, datos_despues)
        VALUES ('DELETE', to_jsonb(OLD), NULL);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION oasis.fn_audit_reservation_details()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO oasis.audit_reservation_details (accion, datos_antes, datos_despues)
        VALUES ('INSERT', NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO oasis.audit_reservation_details (accion, datos_antes, datos_despues)
        VALUES ('UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO oasis.audit_reservation_details (accion, datos_antes, datos_despues)
        VALUES ('DELETE', to_jsonb(OLD), NULL);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION oasis.fn_audit_payments()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO oasis.audit_payments (accion, datos_antes, datos_despues)
        VALUES ('INSERT', NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO oasis.audit_payments (accion, datos_antes, datos_despues)
        VALUES ('UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO oasis.audit_payments (accion, datos_antes, datos_despues)
        VALUES ('DELETE', to_jsonb(OLD), NULL);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION oasis.fn_audit_app_config()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO oasis.audit_app_config (accion, datos_antes, datos_despues)
        VALUES ('INSERT', NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO oasis.audit_app_config (accion, datos_antes, datos_despues)
        VALUES ('UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO oasis.audit_app_config (accion, datos_antes, datos_despues)
        VALUES ('DELETE', to_jsonb(OLD), NULL);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. TRIGGERS DE TIMESTAMPS
-- =============================================

CREATE TRIGGER tr_update_users
BEFORE UPDATE ON oasis.users
FOR EACH ROW EXECUTE FUNCTION oasis.fn_update_timestamp();

CREATE TRIGGER tr_update_res
BEFORE UPDATE ON oasis.reservations
FOR EACH ROW EXECUTE FUNCTION oasis.fn_update_timestamp();

CREATE TRIGGER tr_update_serv
BEFORE UPDATE ON oasis.services
FOR EACH ROW EXECUTE FUNCTION oasis.fn_update_timestamp();

CREATE TRIGGER tr_update_pay
BEFORE UPDATE ON oasis.payments
FOR EACH ROW EXECUTE FUNCTION oasis.fn_update_timestamp();

-- =============================================
-- 7. TRIGGER DE CÁLCULO DE TOTAL
-- =============================================

CREATE TRIGGER tr_total_reserva
AFTER INSERT OR UPDATE OR DELETE ON oasis.reservation_details
FOR EACH ROW EXECUTE FUNCTION oasis.fn_recalculate_total();

-- =============================================
-- 8. TRIGGERS DE AUDITORÍA
-- =============================================

CREATE TRIGGER tr_audit_users
AFTER INSERT OR UPDATE OR DELETE ON oasis.users
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_users();

CREATE TRIGGER tr_audit_services
AFTER INSERT OR UPDATE OR DELETE ON oasis.services
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_services();

CREATE TRIGGER tr_audit_reservations
AFTER INSERT OR UPDATE OR DELETE ON oasis.reservations
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_reservations();

CREATE TRIGGER tr_audit_reservation_details
AFTER INSERT OR UPDATE OR DELETE ON oasis.reservation_details
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_reservation_details();

CREATE TRIGGER tr_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON oasis.payments
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_payments();

CREATE TRIGGER tr_audit_app_config
AFTER INSERT OR UPDATE OR DELETE ON oasis.app_config
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_app_config();

-- =============================================
-- 9. ÍNDICES
-- =============================================

CREATE INDEX idx_res_fecha    ON oasis.reservations (fecha_reserva);
CREATE INDEX idx_res_estado   ON oasis.reservations (estado);
CREATE INDEX idx_users_email  ON oasis.users (correo);
CREATE INDEX idx_pay_reserva  ON oasis.payments (id_reserva);

-- =============================================
-- 10. COMENTARIOS
-- =============================================

COMMENT ON TABLE oasis.users IS 'Almacena datos de clientes y empleados diferenciados por rol.';
COMMENT ON COLUMN oasis.reservation_details.precio_unitario_snap IS 'Guarda el precio del servicio al momento de la reserva para evitar cambios históricos si el precio del servicio sube después.';
COMMENT ON TABLE oasis.app_config IS 'Configuraciones como IVA, capacidad total del recinto o porcentajes de reserva.';
COMMENT ON TABLE oasis.audit_users IS 'Auditoría de cambios sobre la tabla users.';
COMMENT ON TABLE oasis.audit_services IS 'Auditoría de cambios sobre la tabla services.';
COMMENT ON TABLE oasis.audit_reservations IS 'Auditoría de cambios sobre la tabla reservations.';
COMMENT ON TABLE oasis.audit_reservation_details IS 'Auditoría de cambios sobre la tabla reservation_details.';
COMMENT ON TABLE oasis.audit_payments IS 'Auditoría de cambios sobre la tabla payments.';
COMMENT ON TABLE oasis.audit_app_config IS 'Auditoría de cambios sobre la tabla app_config.';

