const express = require('express');

const authContrl = require('../controllers/users');

const router = express.Router();

router.post('/signup', authContrl.signup);
router.post('/login', authContrl.login);

module.exports = router;