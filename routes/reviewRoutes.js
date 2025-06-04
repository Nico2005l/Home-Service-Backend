const express = require('express');
const router = express.Router();
const controller = require('../controllers/reviewController');

router.post('/', controller.create);
router.get('/service/:serviceId', controller.getByService);

module.exports = router;