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

const updateUser = async (id, nombre, apellido, documento, telefono) => {
    const result = await pool.query(
        `UPDATE oasis.users
         SET nombre = $1,
             apellido = $2,
             documento = $3,
             telefono = $4
         WHERE id_usuario = $5
         RETURNING id_usuario, nombre, apellido, documento, telefono`,
        [nombre, apellido, documento, telefono, id]
    );

    return result.rows[0];
};

const findByDocumento = async (documento) => {
    const result = await pool.query(
        'SELECT * FROM oasis.users WHERE documento = $1',
        [documento]
    );
    return result.rows[0];
};

module.exports = { findByEmail, findByDocumento, create, updateUser };
