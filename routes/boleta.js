const router = require('express').Router();
const { getBoleta } = require('../controllers/boleta');
const { validarBody } = require('../middlewares/validarBody');

router.get('/', validarBody, getBoleta
);

module.exports = router;