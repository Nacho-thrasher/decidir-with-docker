const router = require('express').Router();

const tokenRoute = require('./routes/token');
const boletaRoute = require('./routes/boleta');
const pagoRoute = require('./routes/pago');

router.use('/token', tokenRoute);
router.use('/boleta', boletaRoute);
router.use('/pago', pagoRoute);

module.exports = router;