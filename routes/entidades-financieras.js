const router = require('express').Router();

const { getAll, getById } = require('../controllers/entidades-financieras');

router.get('/all2', getAll);

module.exports = router;