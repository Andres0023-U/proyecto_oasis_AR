const pool = require('../config/db');

const findByEmail = async (correo) => {
    const result = await pool.query(
        'SELECT * FROM oasis.users WHERE correo = $1',
        [correo]
    );
    return result.rows[0];
};

const create = async (data) => {
    const { id_rol, documento, nombre, apellido, correo, telefono, password_hash } = data;
    const result = await pool.query(
        `INSERT INTO oasis.users 
        (id_rol, documento, nombre, apellido, correo, telefono, password_hash)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id_usuario, nombre, apellido, correo`,
        [id_rol, documento, nombre, apellido, correo, telefono, password_hash]
    );
    return result.rows[0];
};

module.exports = { findByEmail, create };