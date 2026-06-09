const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

router.get('/',                         reviewController.getAll);
router.get('/check/:id_usuario',        reviewController.checkUserReviewed);
router.post('/',                        reviewController.create);

module.exports = router;