const reviewModel = require('../models/reviewModel');

const getAll = async (req, res) => {
    try {
        const reviews = await reviewModel.getAll();
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener reseñas' });
    }
};

const checkUserReviewed = async (req, res) => {
    try {
        const { id_usuario } = req.params;
        const yaReseno = await reviewModel.userAlreadyReviewed(id_usuario);
        res.json({ yaReseno });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al verificar reseña' });
    }
};

const create = async (req, res) => {
    try {
        const review = await reviewModel.create(req.body);
        res.status(201).json(review);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear la reseña' });
    }
};

module.exports = { getAll, checkUserReviewed, create };