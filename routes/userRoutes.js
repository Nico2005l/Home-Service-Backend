const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser } = require('../controllers/userController');

router.get('/', getAllUsers);
router.delete('/:id', deleteUser);

module.exports = router;
