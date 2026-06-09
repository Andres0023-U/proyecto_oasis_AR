const pool = require('../config/db');

// GET todas las reseñas
const getAll = async () => {
    const result = await pool.query(
        `SELECT r.*, u.nombre, u.apellido 
         FROM oasis.reviews r
         JOIN oasis.users u ON r.id_usuario = u.id_usuario
         ORDER BY r.created_at DESC`
    );
    return result.rows;
};

// GET verificar si usuario ya reseñó
const userAlreadyReviewed = async (id_usuario) => {
    const result = await pool.query(
        `SELECT id_resena FROM oasis.reviews WHERE id_usuario = $1 LIMIT 1`,
        [id_usuario]
    );
    return result.rows.length > 0;
};

// POST crear reseña
const create = async (data) => {
    const { id_usuario, id_reserva, calificacion, comentario } = data;
    const result = await pool.query(
        `INSERT INTO oasis.reviews (id_usuario, id_reserva, calificacion, comentario)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [id_usuario, id_reserva, calificacion, comentario]
    );
    return result.rows[0];
};

module.exports = { getAll, userAlreadyReviewed, create };