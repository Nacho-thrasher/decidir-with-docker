const router = require('express').Router();
const { getStatusPago, ejecutarPago, pagoPruebaDecidir } = require('../controllers/pago');
const { validarMovims } = require('../middlewares/validarMovims');
const { validarMedioPago } = require('../middlewares/validarMedioPago');
const { validarCuotas } = require('../middlewares/validarCuotas');
const { validarBody } = require('../middlewares/validarBody');

router.get('/', 
    getStatusPago
);
router.post('/', 
    [   //? validar req.body
        validarBody,
        validarMovims,
        validarMedioPago,
        validarCuotas,
    ],
    ejecutarPago
);
router.post('/decidir',
    pagoPruebaDecidir
)

module.exports = router;