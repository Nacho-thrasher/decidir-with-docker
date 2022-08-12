const router = require('express').Router();

const tokenRoute = require('./routes/token');
const boletaRoute = require('./routes/boleta');
const pagoRoute = require('./routes/pago');
const proveedorPagosRoute = require('./routes/proveedorPagos');
const entidadesFinancieras = require('./routes/entidadesFinancieras');
const cuotasRoute = require('./routes/cuotas');
const decidirLogRoute = require('./routes/decidirLog');
const devolucionPagoRoute = require('./routes/devolucionPago');
const promocionesRoute = require('./routes/promociones');

router.use('/token', tokenRoute);
router.use('/boleta', boletaRoute);
router.use('/pago', pagoRoute);
router.use('/proveedor-pagos', proveedorPagosRoute);
router.use('/entidades-financieras', entidadesFinancieras);
router.use('/cuotas', cuotasRoute)
router.use('/log', decidirLogRoute)
router.use('/devolucion-pago', devolucionPagoRoute)
router.use('/promociones', promocionesRoute)

module.exports = router;