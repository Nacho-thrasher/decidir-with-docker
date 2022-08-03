const router = require('express').Router();

const tokenRoute = require('./routes/token');
const boletaRoute = require('./routes/boleta');
const pagoRoute = require('./routes/pago');
const proveedorPagosRoute = require('./routes/proveedor-pagos');
const entidadesFinancieras = require('./routes/entidades-financieras');
const cuotasRoute = require('./routes/cuotas');
const decidirLogRoute = require('./routes/decidirLog');

router.use('/token', tokenRoute);
router.use('/boleta', boletaRoute);
router.use('/pago', pagoRoute);
router.use('/proveedor-pagos', proveedorPagosRoute);
router.use('/entidades-financieras', entidadesFinancieras);
router.use('/cuotas', cuotasRoute)
router.use('/log', decidirLogRoute)

module.exports = router;