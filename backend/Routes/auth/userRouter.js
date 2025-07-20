const express = require('express');
const router = express.Router();
const userController = require('../../Controller/auth/userController');

router.post('/createUser', userController.createUser);
router.post('/loginUser', userController.loginUser);

module.exports = router;