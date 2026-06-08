const pool = require('../config/db');

// GET /reservas — todas (admin)
const getAll = async () => {
    const result = await pool.query(
        `SELECT * FROM oasis.reservations 
         ORDER BY fecha_reserva DESC, hora_inicio DESC`
    );
    return result.rows;
};

// GET /reservas/usuario/:id_usuario — reservas de un usuario
const getByUser = async (id_usuario) => {
    const result = await pool.query(
        `SELECT * FROM oasis.reservations
         WHERE id_usuario = $1
         ORDER BY fecha_reserva DESC, hora_inicio DESC`,
        [id_usuario]
    );
    return result.rows;
};

// POST /reservas — crear reserva
const create = async (data) => {
    const { id_usuario, fecha_reserva, hora_inicio, hora_fin, duracion_horas, num_invitados, observaciones } = data;
    const result = await pool.query(
        `INSERT INTO oasis.reservations 
            (id_usuario, fecha_reserva, hora_inicio, hora_fin, duracion_horas, num_invitados, observaciones)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [id_usuario, fecha_reserva, hora_inicio, hora_fin, duracion_horas, num_invitados, observaciones]
    );
    return result.rows[0];
};

// PATCH /reservas/:id — actualizar estado
const updateStatus = async (id_reserva, estado) => {
    const result = await pool.query(
        `UPDATE oasis.reservations 
         SET estado = $1, updated_at = NOW()
         WHERE id_reserva = $2
         RETURNING *`,
        [estado, id_reserva]
    );
    return result.rows[0] || null;
};

const create = async (data) => {
    const { id_usuario, fecha_reserva, hora_inicio, hora_fin, duracion_horas, num_invitados, observaciones, precio_total } = data;
    const result = await pool.query(
        `INSERT INTO oasis.reservations 
            (id_usuario, fecha_reserva, hora_inicio, hora_fin, duracion_horas, num_invitados, observaciones, precio_total)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id_usuario, fecha_reserva, hora_inicio, hora_fin, duracion_horas, num_invitados, observaciones, precio_total || 0]
    );
    return result.rows[0];
};

module.exports = { getAll, getByUser, create, updateStatus };