const reservationModel = require('../models/reservationModel');

// GET /reservas — todas (admin)
const getAll = async (req, res) => {
    try {
        const reservations = await reservationModel.getAll();
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reservas' });
    }
};

// GET /reservas/usuario/:id_usuario — reservas de un usuario
const getByUser = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const reservations = await reservationModel.getByUser(id_usuario);
        res.json(reservations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reservas del usuario' });
    }
};

// POST /reservas — crear reserva
const create = async (req, res) => {
    try {
        const reservation = await reservationModel.create(req.body);
        res.status(201).json(reservation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la reserva' });
    }
};

// PATCH /reservas/:id — actualizar estado (ej: cancelar)
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body;
        const updated = await reservationModel.updateStatus(id, estado);
        if (!updated) return res.status(404).json({ error: 'Reserva no encontrada' });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar la reserva' });
    }
};

module.exports = { getAll, getByUser, create, updateStatus };