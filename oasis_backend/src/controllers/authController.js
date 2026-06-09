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

        // Verificar si el correo ya existe
        const existing = await userModel.findByEmail(correo);
        if (existing) {
            return res.status(400).json({ error: 'El correo ya está registrado' });
        }

        // Encriptar contraseña
        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await userModel.create({
            id_rol: 2, // rol cliente por defecto
            documento,
            nombre,
            apellido,
            correo,
            telefono,
            password_hash
        });

        res.status(201).json(newUser);

    } catch (error) {
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

module.exports = { login, register };