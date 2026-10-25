const express = require('express');
const userController = require('../controllers/userController');
const { verifyAdmin, verifyUser } = require('../middleware/authenticate');

const router = express.Router();
router.get('/', verifyUser, verifyAdmin, userController.getAllUsers);

module.exports = router;
