const router = require('express').Router();

const { getAll2, getById } = require('../controllers/proveedor-pagos');

router.get('/all2', getAll2); 
router.get('/id2', getById);

module.exports = router;