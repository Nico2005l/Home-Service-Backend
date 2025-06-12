const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/profile', auth.getProfile);
router.put('/edit', auth.editProfile);

module.exports = router;
