const userModel = require('../models/userModel');

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { documento, telefono } = req.body;

        const user = await userModel.updateUser(
            id,
            documento,
            telefono
        );

        res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error actualizando usuario'
        });
    }
};

module.exports = { updateUser };