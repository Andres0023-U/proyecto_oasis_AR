-- =============================================================================
-- 02_TRIGGERS.SQL
-- Sistema de Reservas Oasis
-- Triggers de timestamps, cálculo de total y auditoría unificada.
-- Requiere que 04_functions.sql se haya ejecutado antes (las funciones
-- fn_update_timestamp, fn_recalculate_total y fn_audit_universal deben existir).
-- =============================================================================

-- =============================================================================
-- 1. TRIGGERS DE TIMESTAMPS (updated_at)
-- =============================================================================

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

-- =============================================================================
-- 2. TRIGGER DE CÁLCULO DE TOTAL
-- =============================================================================
-- Recalcula reservations.precio_total cada vez que cambian los detalles
-- de la reserva (INSERT, UPDATE o DELETE sobre reservation_details).

CREATE TRIGGER tr_total_reserva
AFTER INSERT OR UPDATE OR DELETE ON oasis.reservation_details
FOR EACH ROW EXECUTE FUNCTION oasis.fn_recalculate_total();

-- =============================================================================
-- 3. TRIGGERS DE AUDITORÍA (apuntan a la función universal fn_audit_universal)
-- =============================================================================
-- Cada trigger envía sus eventos a la tabla única oasis.audit_log,
-- identificando el origen mediante TG_TABLE_NAME (columna tabla_afectada).

CREATE TRIGGER tr_audit_users
AFTER INSERT OR UPDATE OR DELETE ON oasis.users
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_universal();

CREATE TRIGGER tr_audit_services
AFTER INSERT OR UPDATE OR DELETE ON oasis.services
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_universal();

CREATE TRIGGER tr_audit_reservations
AFTER INSERT OR UPDATE OR DELETE ON oasis.reservations
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_universal();

CREATE TRIGGER tr_audit_reservation_details
AFTER INSERT OR UPDATE OR DELETE ON oasis.reservation_details
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_universal();

CREATE TRIGGER tr_audit_payments
AFTER INSERT OR UPDATE OR DELETE ON oasis.payments
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_universal();

CREATE TRIGGER tr_audit_app_config
AFTER INSERT OR UPDATE OR DELETE ON oasis.app_config
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_universal();

CREATE TRIGGER tr_audit_reviews
AFTER INSERT OR UPDATE OR DELETE ON oasis.reviews
FOR EACH ROW EXECUTE FUNCTION oasis.fn_audit_universal();
