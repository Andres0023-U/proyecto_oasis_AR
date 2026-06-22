const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const login = async (req, res) => {
    try {
        const { correo, password } = req.body;

        const user = await userModel.findByEmail(correo);

        if (!user) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
        }

        const token = jwt.sign(
            { id_usuario: user.id_usuario, id_rol: user.id_rol },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id_usuario: user.id_usuario,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                documento: user.documento,
                telefono: user.telefono
            }
        });

    } catch (error) {
        console.error('Error detallado:', error);
        res.status(500).json({ error: 'Error en el login' });
    }
};

const register = async (req, res) => {
    try {
        const { documento, nombre, apellido, correo, telefono, password } = req.body;

        const existingEmail = await userModel.findByEmail(correo);
        if (existingEmail) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        const existingDoc = await userModel.findByDocumento(documento);
        if (existingDoc) {
            return res.status(400).json({ error: 'El documento ya está registrado' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            id_rol: 3,
            documento,
            nombre,
            apellido,
            correo,
            telefono,
            password_hash
        });

        res.status(201).json(newUser);

    } catch (error) {
        console.error('Error detallado en register:', error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

module.exports = { login, register };