const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// ⚠️  ORDEN IMPORTA: /usuario/:id_usuario debe ir ANTES que /:id
// para que Express no confunda "usuario" con un id numérico
router.get('/',                         reservationController.getAll);
router.get('/usuario/:id_usuario',      reservationController.getByUser);
router.post('/',                        reservationController.create);
router.patch('/:id',                    reservationController.updateStatus);

module.exports = router;