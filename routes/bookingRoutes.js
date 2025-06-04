const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');

router.post('/', controller.create);
router.get('/user/:userId', controller.getByUser);

module.exports = router;