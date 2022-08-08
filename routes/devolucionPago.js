const router = require('express').Router();
const { devolucionPago } = require('../controllers/devolucionPago');

router.get('/', devolucionPago);

module.exports = router;