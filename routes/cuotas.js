const router = require('express').Router();
const { getById } = require('../controllers/cuotas');

router.get('/id2', getById);

module.exports = router;