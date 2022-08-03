const router = require('express').Router();
const { getByNroTran } = require('../controllers/decidirLog');

router.get('/', getByNroTran);

module.exports = router;