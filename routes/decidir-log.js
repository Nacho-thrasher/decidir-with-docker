const router = require('express').Router();
const { getByNroTran } = require('../controllers/decidir-log');

router.get('/', getByNroTran);

module.exports = router;