-- =============================================================================
-- 04_FUNCTIONS.SQL
-- Sistema de Reservas Oasis
-- Funciones usadas por los triggers de 02_triggers.sql
-- =============================================================================

-- =============================================================================
-- 1. ACTUALIZAR TIMESTAMP (updated_at)
-- =============================================================================

CREATE OR REPLACE FUNCTION oasis.fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 2. RECALCULAR TOTAL DE LA RESERVA
-- =============================================================================
-- Se ejecuta tras cualquier cambio en reservation_details y vuelve a sumar
-- (cantidad * precio_unitario_snap) de todos los detalles de esa reserva.

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

-- =============================================================================
-- 3. AUDITORÍA UNIVERSAL
-- =============================================================================
-- Reemplaza las 7 funciones de auditoría individuales
-- (fn_audit_users, fn_audit_services, fn_audit_reservations,
--  fn_audit_reservation_details, fn_audit_payments, fn_audit_app_config,
--  fn_audit_reviews) por una sola función genérica. Usa TG_TABLE_NAME para
-- identificar automáticamente qué tabla disparó el evento y lo registra en
-- oasis.audit_log junto con el estado antes/después en formato JSONB.

CREATE OR REPLACE FUNCTION oasis.fn_audit_universal()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO oasis.audit_log (tabla_afectada, accion, datos_antes, datos_despues)
        VALUES (TG_TABLE_NAME, 'INSERT', NULL, to_jsonb(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO oasis.audit_log (tabla_afectada, accion, datos_antes, datos_despues)
        VALUES (TG_TABLE_NAME, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO oasis.audit_log (tabla_afectada, accion, datos_antes, datos_despues)
        VALUES (TG_TABLE_NAME, 'DELETE', to_jsonb(OLD), NULL);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
