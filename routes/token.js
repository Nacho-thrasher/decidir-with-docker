const router = require('express').Router();
const { createToken } = require('../controllers/token');

router.post('/', createToken);

module.exports = router;